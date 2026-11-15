import { randomUUID } from 'node:crypto';
import { foldSurface } from '@deepseek-ai/dsh-session/surface';
import { branchAsAssistant, branchAsUser, locateForRead, locateUser, planRerun, planPreserve, familyFromRecords, ownVersionMarker, stopFamilyTurns } from './core.js';
export const name = 'last-word';
export const inject = ['commands', 'tools', 'sessionQuery', 'sessionPersistence', 'agents', 'sessions', 'workspaceRegistry', 'agentPresets'];
function probe() {
  const original = { type: 'assistant/message', seq: 0, time: 1, surfaceOp: 'append', data: { turn: 1, step: 1, message: { id: 'probe-message', role: 'assistant', source: { kind: 'model', provider: 'fixture', model: 'fixture' }, content: [{type:'text',text:'123'}] }, stream: [] } };
  const errors = [];
  for (const sources of [undefined, [0]]) {
    const replacement = structuredClone(original);
    replacement.seq = 1;
    replacement.data.message.content[0].text = '234';
    replacement.surfaceOp = { op: 'replace', startSeq: 0, endSeq: 0 };
    if (sources) replacement.sourceEventSeqs = sources;
    try { foldSurface([original, replacement]); errors.push('UNEXPECTED_SUCCESS'); }
    catch (e) { errors.push(e.message); }
  }
  return { runtime: 'current installed @deepseek-ai/dsh-session', mutatedRealSession: false, withoutSources: errors[0], withSources: errors[1], blocked: errors.every(e => e !== 'UNEXPECTED_SUCCESS') };
}
function makeEditor(ctx) {
  const pending = new Map();
  const markerCache = new Map();
  async function readMarker(header) {
    const live = ctx.sessions.get(header.id);
    if (!live) {
      const cold = markerCache.get(header.id + ':cold');
      if (cold) return cold.marker;
      const events = (await ctx.sessionQuery.readSession(header.id)).events;
      const marker = ownVersionMarker(events, header.id);
      if (markerCache.size >= 500) markerCache.delete(markerCache.keys().next().value);
      markerCache.set(header.id + ':cold', {marker});
      return marker;
    }
    const events = live.snapshotEvents();
    const key = header.id + ':' + events.length;
    const cached = markerCache.get(key);
    if (cached) return cached.marker;
    const marker = ownVersionMarker(events, header.id);
    if (markerCache.size >= 500) markerCache.delete(markerCache.keys().next().value);
    markerCache.set(key, {marker});
    return marker;
  }
  async function versions(sessionId) {
    const records = await ctx.sessionQuery.listSessions();
    let archived = new Set();
    try { const ids = ctx.get('workspaceRegistry')?.archivedSessionIds; if (Array.isArray(ids)) archived = new Set(ids); } catch {}
    const {rootId, members} = familyFromRecords(records, sessionId);
    const rows = new Array(members.length);
    let cursor = 0;
    await Promise.all(Array.from({length:Math.min(4, members.length)}, async () => {
      for (;;) {
        const index = cursor++;
        if (index >= members.length) return;
        const header = members[index];
        let marker;
        try { marker = await readMarker(header); } catch {}
        rows[index] = {sessionId:header.id, ...(header.parentSession?{parentSessionId:header.parentSession}:{}), createdAt:header.createdAt ?? 0,
          ...(archived.has(header.id)?{archived:true}:{}),
          ...(marker?.effect ? {operation:marker.effect.operation, targetTurn:marker.effect.targetTurn} : {})};
      }
    }));
    return {ok:true, sessionId, rootId, versions:rows};
  }
  // The app cannot navigate to an archived session (it bounces to the
  // workspace picker), so the version ring unarchives before opening.
  async function activate(sessionId) {
    const registry = ctx.get('workspaceRegistry');
    if (!registry || typeof registry.unarchiveSession !== 'function') throw new Error('此 DSH 版本无法取消归档 / This DSH build cannot unarchive sessions');
    const ids = Array.isArray(registry.archivedSessionIds) ? registry.archivedSessionIds : [];
    if (!ids.includes(sessionId)) return {ok:true, unarchived:false};
    await registry.unarchiveSession(sessionId);
    return {ok:true, unarchived:true};
  }
  return {
    async operate(agent, input, signal) {
      const sessionId = agent.id;
      if (input.action === 'probe') return probe();
      if (input.action === 'versions') return versions(sessionId);
      if (input.action === 'activate') {
        if (typeof input.sessionId !== 'string' || !input.sessionId) throw new Error('缺少会话 ID / Missing session ID');
        return activate(input.sessionId);
      }

      if (input.action === 'preview-user') {
        if (!Number.isSafeInteger(input.turnEndSeq) || input.turnEndSeq < 0) throw new Error('缺少回合坐标 / Missing turn coordinate');
        const snapshot=await ctx.sessionQuery.readSession(sessionId);
        const plan=planRerun(snapshot,{mode:'retry',turnEndSeq:input.turnEndSeq});
        let preserve;
        try { preserve={ok:true,laterTurns:planPreserve(snapshot.events,plan.end.seq).length}; } catch(e) { preserve={ok:false,error:e.message}; }
        return {ok:true,turn:plan.start.data.turn,text:plan.original,turnEndSeq:plan.end.seq,laterTurns:plan.laterTurns,latest:plan.latest,model:plan.config.model,attachments:plan.user.data.content.filter(b=>b.type==='image'||b.type==='file').length,preserve};
      }
      const pinnedRerun = ['edit-user','retry','reroll'].includes(input.action) && Number.isSafeInteger(input.turnEndSeq) && input.turnEndSeq >= 0;
      if (!pinnedRerun && input.action !== 'reroll' && typeof input.messageId !== 'string') throw new Error('缺少消息 ID / Missing message ID');
      if (input.action === 'read' || input.action === 'read-user') {
        const live = ctx.sessions.get(sessionId);
        const snapshot = live ? {events: live.snapshotEvents()} : await ctx.sessionQuery.readSession(sessionId);
        if (input.action === 'read-user') {
          const {event,text} = locateUser(snapshot.events,input.messageId);
          return {ok:true,messageId:input.messageId,seq:event.seq,text};
        }
        const {event, text, field: readField} = locateForRead(snapshot.events, input.messageId, input.field);
        const reasoning = event.data.message.content.filter(block => block.type === 'reasoning').map(block => block.text).join('\n\n');
        return { ok: true, messageId: input.messageId, seq: event.seq, text, reasoning, field: readField };
      }
      if (!['branch','edit-user','retry','reroll'].includes(input.action)) throw new Error('Unknown action');
      if (typeof input.operationId !== 'string' || !/^[a-zA-Z0-9-]{8,100}$/.test(input.operationId)) throw new Error('Invalid operation ID');
      if (input.preserve !== undefined && typeof input.preserve !== 'boolean') throw new Error('Invalid preserve option');
      if (input.preserve === true && (!pinnedRerun || !Number.isSafeInteger(input.laterTurns) || input.laterTurns < 1 || input.preserveConfirmed !== true)) throw new Error('请先预览并确认保留后续输入 / Preview and confirm preserving later prompts');
      const key = sessionId + ':' + input.operationId;
      const fingerprint = JSON.stringify([input.action,input.messageId,input.field,input.text,input.expectedText,input.turnEndSeq,input.laterTurns,input.preserve,input.preserveConfirmed]);
      const old = pending.get(key);
      if (old) {
        if (old.fingerprint !== fingerprint) throw new Error('Operation ID reused with different content');
        return old.promise;
      }
      if (pending.size >= 1000) throw new Error('操作记录已满，请重载插件 / Operation cache full');
      const deps = {
        readSession: id => ctx.sessionQuery.readSession(id),
        create: async request => {
          const preset = request.meta.agentPreset; const presets=ctx.get('agentPresets');
          if (preset && !presets) throw new Error('无法挂载原会话预设 / Source preset service unavailable');
          return ctx.agents.create({...request,setup:async(agentCtx,child)=>{
            if(preset) await presets.mount(agentCtx,preset);
            if(child.inbox.nextTurn.length||child.inbox.nextStep.length) child.inbox.clear();
          }});
        },
        attach: async id => {const workspace=(ctx.get?.('workspaceRegistry') || ctx.workspaceRegistry)?.list?.().find(item=>item.sessionIds.includes(sessionId));if(workspace)await workspace.attachSession(id);},
        flush: session => ctx.sessions.flush(session), uuid: randomUUID,
        admitPreserve: childSession => {
          const permission = ctx.get('permissionPresets');
          const source = ctx.sessions.get(sessionId);
          const preset = source && permission?.current(source);
          if (!preset || preset === 'custom' || preset === 'auto' || permission.current(childSession) !== preset) {
            throw new Error('无法确认权限一致，未发送任何内容 / Permissions could not be matched; nothing was sent');
          }
        },      };
      const promise = (async () => {
        await stopFamilyTurns({listSessions:() => ctx.sessionQuery.listSessions(), getAgent:id => ctx.agents.get(id)}, sessionId);
        if (['edit-user','retry','reroll'].includes(input.action)) {
          const mode=input.action==='edit-user'?'edit':input.action;
          return branchAsUser(deps,sessionId,input.messageId,input.text,input.expectedText,signal,mode,{turnEndSeq:input.turnEndSeq,laterTurns:input.laterTurns,preserve:input.preserve,preserveConfirmed:input.preserveConfirmed});
        }
        return branchAsAssistant(deps, sessionId, input.messageId, input.text, input.expectedText, signal, input.field || 'text');
      })();
      pending.set(key, { fingerprint, promise });
      try { return await promise; } catch (e) { pending.delete(key); throw e; }
    },
  };
}
export function apply(ctx) {
  const editor = makeEditor(ctx);
  ctx.effect(() => ctx.commands.register({
    name: 'reply-editor', description: '编辑回复、修改提问重新生成 / Edit replies and regenerate prompts', recordInput: false,
    input: { hint: 'JSON: action=read|read-user|preview-user|branch|edit-user|retry|reroll|versions|activate|probe' },
    async handler({agent, rawInput, signal}) {
      try { const result = await editor.operate(agent, JSON.parse(rawInput), signal); return {kind:'success',text:JSON.stringify(result)}; }
      catch (e) { return {kind:'error',text:e.message}; }
    },
  }));
  ctx.effect(() => ctx.tools.register({
    name: 'reply_editor',
    description: 'Read a finalized text-only assistant reply, or create a new conversation branch whose final node is the user’s edited assistant reply. The original conversation and external file/tool effects are not undone. The edited branch rebuilds the closed turn; the edited text is not appended as a user message.',
    parameters: { type:'object', properties:{
      action:{type:'string',enum:['read','branch','probe']},
      messageId:{type:'string',description:'Durable assistant message ID in the current session; required for read and branch.'},
      text:{type:'string',description:'Replacement content for the selected assistant field, 1–60000 characters; required for branch.'},
      field:{type:'string',enum:['text','reasoning'],description:'Editable assistant field; defaults to text.'},
      expectedText:{type:'string',description:'Original text returned by read; required for branch.'},
      operationId:{type:'string',description:'Unique 8–100 character alphanumeric/hyphen ID; reuse unchanged for retry within this plugin activation.'},
    },required:['action'],additionalProperties:false},
    output:{schema:{type:'object',additionalProperties:true},render:(_args,value)=>[{type:'text',text:JSON.stringify(value)}]},
    async execute(args,exec) { if (!exec.agent) throw new Error('An owning session is required'); return editor.operate(exec.agent,args,exec.signal); },
  }));
}
