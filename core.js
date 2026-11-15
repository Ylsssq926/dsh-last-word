export const MAX_TEXT = 60000;
export const VERSION_EVENT = 'last-word/version';
export const VERSION_SCHEMA = 1;
export function headerOf(record) { return record?.header ?? record?.session ?? record; }
export function ownVersionMarker(events, sessionId) {
  return events.find(e => e.type === VERSION_EVENT && e.data?.sessionId === sessionId)?.data;
}
export function versionMarker({childId, attachId, operation, targetTurn, targetEventSeq, before, after, id, seq, time}) {
  return {type:VERSION_EVENT, seq, time, ignorable:true, data:{
    schemaVersion:VERSION_SCHEMA,
    effect:{operation, targetTurn, targetEventSeq, ...(before===undefined?{}:{before}), ...(after===undefined?{}:{after}), id},
    inverse:{kind:'restore-version', sessionId:attachId},
    sessionId:childId,
  }};
}
export function familyFromRecords(records, sessionId) {
  const byId = new Map();
  for (const record of records) { const h = headerOf(record); if (h?.id) byId.set(h.id, h); }
  const target = byId.get(sessionId);
  if (!target) return {rootId:sessionId, members:[]};
  let root = target;
  const seen = new Set([root.id]);
  while (root.parentSession && byId.has(root.parentSession) && !seen.has(root.parentSession)) {
    seen.add(root.parentSession);
    root = byId.get(root.parentSession);
  }
  const members = [];
  for (const h of byId.values()) {
    if (h.id !== root.id && h.cwd !== target.cwd) continue;
    let cursor = h;
    const walked = new Set([cursor.id]);
    while (cursor.id !== root.id && cursor.parentSession && byId.has(cursor.parentSession) && !walked.has(cursor.parentSession)) {
      walked.add(cursor.parentSession);
      cursor = byId.get(cursor.parentSession);
    }
    if (cursor.id === root.id) members.push(h);
  }
  return {rootId:root.id, members};
}
export async function resolveAttachSession(readSession, sessionId, targetTurn) {
  let current = sessionId;
  const seen = new Set();
  while (!seen.has(current)) {
    seen.add(current);
    let record;
    try { record = await readSession(current); } catch { return current; }
    const header = headerOf(record);
    const marker = ownVersionMarker(record?.events ?? [], current);
    if (marker?.effect?.targetTurn === targetTurn && header?.parentSession) current = header.parentSession;
    else return current;
  }
  return sessionId;
}
export async function stopFamilyTurns({listSessions, getAgent}, sessionId) {
  let ids = [sessionId];
  try {
    const {members} = familyFromRecords(await listSessions(), sessionId);
    ids = [sessionId, ...members.map(m => m.id).filter(id => id !== sessionId)];
  } catch {}
  let stopped = 0;
  for (const id of ids) {
    try {
      const agent = getAgent(id);
      if (!agent) continue;
      agent.cancel({kind:'user'});
      await agent.whenIdle();
      stopped++;
    } catch {}
  }
  return stopped;
}
function finalReplyOfTurn(events, turn, field) {
  const end = events.find(e => e.type === 'turn/end' && e.data.turn === turn);
  if (!end) throw new Error('这条回复定位失败，请刷新后再试 / Could not locate this reply; refresh and try again');
  const hit = events.findLast(e => e.type === 'assistant/message' && e.surfaceOp === 'append' && e.data.turn === turn && e.seq < end.seq);
  if (!hit) throw new Error('这条回复定位失败，请刷新后再试 / Could not locate this reply; refresh and try again');
  return locate(events, hit.data.message.id, field);
}
function locateEvent(events, messageId) {
  const hits = events.filter(e => e.type === 'assistant/message' && e.surfaceOp === 'append' && e.data.message.id === messageId);
  if (hits.length !== 1) throw new Error('这条回复定位失败，请刷新后再试 / Could not locate this reply; refresh and try again');
  const event = hits[0];
  if (event.data.interrupted) throw new Error('被打断的回复暂不支持编辑 / Interrupted replies cannot be edited');
  const blocks = event.data.message.content;
  if (blocks.some(b => !['text', 'reasoning'].includes(b.type))) throw new Error('暂不支持工具调用或附件的回复编辑 / Replies with tool calls or attachments cannot be edited');
  return event;
}
function fieldText(event, field) {
  return event.data.message.content.filter(b => b.type === field).map(b => b.text).join('\n\n');
}
export function locate(events, messageId, field = 'text') {
  if (field !== 'text' && field !== 'reasoning') throw new Error('未知编辑字段 / Unknown editable field');
  const event = locateEvent(events, messageId);
  const text = fieldText(event, field);
  if (!text.trim()) throw new Error('这条回复没有可编辑的文字 / No editable text in this reply');
  return { event, text };
}
// Reading falls back to the other editable field so reasoning-only replies
// open in the editor instead of dead-ending on "no editable text".
export function locateForRead(events, messageId, field = 'text') {
  if (field !== 'text' && field !== 'reasoning') throw new Error('未知编辑字段 / Unknown editable field');
  const event = locateEvent(events, messageId);
  const text = fieldText(event, field);
  if (text.trim()) return { event, text, field };
  const other = field === 'text' ? 'reasoning' : 'text';
  const fallback = fieldText(event, other);
  if (!fallback.trim()) throw new Error('这条回复没有可编辑的文字 / No editable text in this reply');
  return { event, text: fallback, field: other };
}
export function validateText(text) {
  if (typeof text !== 'string' || !text.trim() || text.length > MAX_TEXT) throw new Error('正文必须为 1–60000 字符 / Text must contain 1–60000 characters');
  return text;
}
function userHit(events, messageId) {
  const hits = events.filter(e => e.type === 'user/message' && e.data?.id === messageId && e.data?.source?.kind === 'user');
  if (hits.length !== 1) throw new Error('这条提问定位失败，请刷新后再试 / Could not locate this prompt; refresh and try again');
  return hits[0];
}
function closedTurnFor(events, targetSeq) {
  const start = events.findLast(e => e.type === 'turn/start' && e.seq < targetSeq);
  const end = events.find(e => e.type === 'turn/end' && e.seq > targetSeq && e.data.turn === start?.data.turn);
  if (!start || !end || !['completed','error','max-tokens','aborted'].includes(end.data.reason.kind)) throw new Error('这一回合还没结束，不能重新生成 / This turn is not finished yet');
  const users = events.slice(start.seq+1,end.seq).filter(e=>e.type==='user/message' && e.data?.source?.kind==='user' && e.surfaceOp==='append');
  // Rerun from before this turn. None of the old tool steps are copied or executed.
  if (users.length!==1) throw new Error('这一回合不止一条提问，无法直接重新生成 / No single prompt to regenerate');
  return {start,end,user:users[0]};
}
function cloneUser(message, uuid, text) {
  const content = structuredClone(message.content);
  if (text !== undefined) {
    const first = content.findIndex(b => b.type === 'text');
    if (first < 0) throw new Error('这条提问没有可编辑的文字 / No editable text in this prompt');
    content[first] = {type:'text',text:validateText(text)};
    return {id:uuid(),role:'user',source:{kind:'user'},content:content.filter((block,index)=>block.type !== 'text' || index === first)};
  }
  return {id:uuid(),role:'user',source:{kind:'user'},content};
}
export function locateUser(events, messageId) {
  const event = userHit(events,messageId);
  return {event,text:event.data.content.filter(b=>b.type==='text').map(b=>b.text).join('\n\n')};
}
export function planRerun(snapshot, {mode, messageId, turnEndSeq, turn}) {
  if (!['edit','retry','reroll'].includes(mode)) throw new Error('未知重跑操作 / Unknown rerun operation');
  const {events} = snapshot;
  const ends=events.filter(e=>e.type==='turn/end');
  const latestEnd=ends.at(-1);
  let targetSeq;
  let selected;
  let selectedByFallback=false;
  if (turn !== undefined) selected=ends.find(e=>e.data?.turn===turn);
  if (!selected && turnEndSeq !== undefined) { selected=events.find(e=>e.type==='turn/end'&&e.seq===turnEndSeq); if(!selected){selected=events[turnEndSeq];selectedByFallback=!!selected;} }
  if (!selected && mode==='reroll') selected=latestEnd;
  if (turnEndSeq !== undefined || mode === 'reroll') {
    if (selected?.type !== 'turn/end') throw new Error('目标回合已不可用 / Turn unavailable');
    if (mode === 'reroll' && selected.seq !== latestEnd?.seq && !selectedByFallback) throw new Error('最后一轮已变化，请重新预览 / Latest turn changed; preview again');
    const start = events.findLast(e=>e.type==='turn/start' && e.seq<selected.seq);
    const prompt = start && events.filter(e=>e.seq>start.seq && e.seq<selected.seq).find(e=>e.type==='user/message'&&e.data?.source?.kind==='user'&&e.surfaceOp==='append');
    if (!prompt || start.data.turn !== selected.data.turn) throw new Error('目标回合缺少用户输入 / Turn has no user input');
    targetSeq = prompt.seq;
  } else {
    targetSeq = mode === 'edit' ? userHit(events,messageId).seq : locate(events,messageId).event.seq;
  }
  const {start,end,user} = closedTurnFor(events,targetSeq);
  if (turnEndSeq !== undefined && !selectedByFallback && end.seq !== turnEndSeq) throw new Error('回合边界已变化 / Turn boundary changed');
  if (user.data.role !== 'user' || user.data.source.kind !== 'user' || user.surfaceOp !== 'append') throw new Error('此输入不是普通用户消息 / Not an ordinary user prompt');
  const original = user.data.content.filter(b=>b.type==='text').map(b=>b.text).join('\n\n');
  const config = events.slice(0,end.seq).findLast(e=>e.type==='request/header')?.data?.header?.config;
  if (!config?.provider || !config?.model) throw new Error('无法解析模型 / Cannot resolve model');
  return {start,end,user,original,config,latest:end.seq===latestEnd?.seq,laterTurns:events.slice(end.seq+1).filter(e=>e.type==='turn/start').length};
}
export function planPreserve(events, afterSeq) {
  const starts=events.filter(e=>e.type==='turn/start' && e.seq>afterSeq);
  if (starts.length>20) throw new Error('最多保留 20 个后续回合 / At most 20 later turns');
  return starts.map(start=>{
    const end=events.find(e=>e.type==='turn/end'&&e.seq>start.seq&&e.data.turn===start.data.turn);
    if (!end || end.data.reason.kind!=='completed') throw new Error('后续存在未完成回合 / Later turn is not completed');
    const inside=events.slice(start.seq+1,end.seq);
    if(inside.some(e=>['tool/call','tool/result','assistant/attempt'].includes(e.type)||(e.type==='assistant/message'&&e.data.message.content.some(b=>b.type==='tool-call')))) throw new Error('保留模式拒绝工具回合 / Preserve refuses tool turns');
    const users=inside.filter(e=>e.type==='user/message');
    if (inside.filter(e=>e.type==='step/start').length!==1 || inside.filter(e=>e.type==='assistant/message').length!==1 ||
        users.length!==1 || users[0].data.role!=='user' || users[0].data.source?.kind!=='user' || users[0].surfaceOp!=='append' ||
        !users[0].data.content.length || users[0].data.content.some(block=>block.type!=='text')) {
      throw new Error('后续回合不是单步纯文本输入 / Later turn is not a single-step text-only turn');
    }
    return users[0].data;
  });
}
export async function branchAsUser(deps, sessionId, messageId, text, expectedText, signal, mode = 'edit', options = {}) {
  signal?.throwIfAborted();
  const snapshot = await deps.readSession(sessionId);
  const {events} = snapshot;
  const {start,end,user,original,config,laterTurns} = planRerun(snapshot,{mode,messageId,turnEndSeq:options.turnEndSeq});
  if (options.laterTurns !== undefined && options.laterTurns !== laterTurns) throw new Error('后续回合数量已变化，请重新预览 / Later turns changed; preview again');
  if (mode === 'edit') {
    validateText(text);
    if (expectedText !== original) throw new Error('原文已变化，请重新打开编辑窗口 / Original text changed; reopen the editor');
    if (text === original) throw new Error('还没有改动，先改点什么再保存 / No changes yet');
  }
  if (options.preserve === true && options.preserveConfirmed !== true) throw new Error('保留后续输入须显式确认 / Preserve requires explicit confirmation');
  const later = options.preserve === true ? planPreserve(events,end.seq).map(message=>cloneUser(message,deps.uuid)) : [];
  const turn = start.data.turn;
  const attachId = options.preserve === true ? sessionId : await resolveAttachSession(deps.readSession, sessionId, turn);
  let base = snapshot, baseStart = start, baseUser = user, baseConfig = config;
  if (attachId !== sessionId) {
    base = await deps.readSession(attachId);
    const baseEnd = base.events.find(e => e.type === 'turn/end' && e.data.turn === turn);
    if (!baseEnd) throw new Error('目标回合已不可用 / Turn unavailable');
    const plan = planRerun(base,{mode:'retry',turnEndSeq:baseEnd.seq});
    baseStart = plan.start; baseUser = plan.user; baseConfig = plan.config;
  }
  const content = cloneUser((mode === 'edit' ? baseUser : user).data,deps.uuid,mode === 'edit' ? text : undefined);
  const prefix = base.events.slice(0,baseStart.seq);
  const preset = prefix.findLast(e=>e.type==='agent-preset/selected')?.data.agentPreset ?? base.session.agentPreset;
  signal?.throwIfAborted();
  const childId = `session-${deps.uuid()}`;
  const seed = [...prefix,
    {type:'session/end-seed',seq:prefix.length,time:Date.now(),data:{inherited:true}},
    versionMarker({childId,attachId,operation:mode,targetTurn:turn,targetEventSeq:baseUser.seq,before:original,...(mode==='edit'?{after:text}:{}),id:deps.uuid(),seq:prefix.length+1,time:Date.now()})];
  let child;
  try { child = await deps.create({sessionId:childId,seed,inheritedEventCount:prefix.length,meta:{isSeeded:true,parentSession:attachId,...(base.session.cwd?{cwd:base.session.cwd}:{}),...(preset?{agentPreset:preset}:{})},agentOptions:{provider:baseConfig.provider,model:baseConfig.model,...(baseConfig.maxTokens===undefined?{}:{maxTokens:baseConfig.maxTokens}),...(baseConfig.reasoningEffort===undefined?{}:{reasoningEffort:baseConfig.reasoningEffort})},signal}); }
  catch(error) { return {ok:false,accepted:false,error:String(error?.message ?? error),recovery:'原对话没有改动，可以再试一次 / Original conversation unchanged; try again'}; }
  let queued = false;
  try {
    if (child.agent.inbox.nextTurn.length || child.agent.inbox.nextStep.length) throw new Error('分支仍有继承的待处理输入 / Child still has inherited pending input');
    if (!await deps.flush(child.agent.session)) throw new Error('未确认分支持久化 / Branch durability not confirmed');
    if (later.length) {
      if (!deps.admitPreserve) throw new Error('无法验证保留模式权限 / Cannot verify replay permissions');
      deps.admitPreserve(child.agent.session);
    }
    signal?.throwIfAborted();
    if (deps.attach) await deps.attach(childId);
    signal?.throwIfAborted();
    child.agent.followup(content);
    queued = true;
    for (const message of later) child.agent.followup(message);
    if (!await deps.flush(child.agent.session)) throw new Error('未确认队列持久化 / Queue durability not confirmed');
    return {ok:true,sessionId:childId,sourceSessionId:sessionId,atSeq:user.seq,semantics:mode,cascade:options.preserve===true?'preserve':'truncate',queuedTurns:1+later.length,accepted:true};
  } catch (error) {
    if (!queued) try { await child.dispose(); } catch {}
    return {ok:false,sessionId:childId,accepted:queued,error:String(error.message||error),recovery:'原对话没有改动，可以再试一次 / Original conversation unchanged; try again'};
  }
}
export async function branchAsAssistant(deps, sessionId, messageId, text, expectedText, signal, field = 'text') {
  validateText(text);
  signal?.throwIfAborted();
  const snapshot = await deps.readSession(sessionId);
  const {events} = snapshot;
  const target = locate(events, messageId, field);
  if (expectedText !== target.text) throw new Error('原文已变化，请重新打开编辑窗口 / Original text changed; reopen the editor');
  if (text === target.text) throw new Error('还没有改动，先改点什么再保存 / No changes yet');
  const turnStart = events.findLast(e => e.type === 'turn/start' && e.seq < target.event.seq);
  const turnEnd = events.find(e => e.type === 'turn/end' && e.seq > target.event.seq && e.data.turn === target.event.data.turn);
  if (!turnStart || !turnEnd || turnStart.data.turn !== target.event.data.turn || turnEnd.data.reason.kind !== 'completed') throw new Error('这条回复所在的回合尚未正常结束 / The turn has not completed yet');
  // Earlier steps and their real tool records stay in the inherited prefix.
  // Only the settled final text response is replaced, so no tools are replayed here.
  const {turn,step} = target.event.data;
  const stepEnd = events.find(e => e.type === 'step/end' && e.seq > target.event.seq && e.data.turn === turn && e.data.step === step);
  if (stepEnd?.type !== 'step/end' || stepEnd.data.turn !== turn || stepEnd.data.step !== step || stepEnd.seq >= turnEnd.seq) throw new Error('只能编辑回合末尾的最终回复 / Only the final reply of a turn can be edited');
  // Repeated edits of the same reply hang off the original session, not the
  // previous edit, so the version ring stays one family instead of a chain.
  const attachId = await resolveAttachSession(deps.readSession, sessionId, turn);
  let base = snapshot, baseTarget = target, baseStepEnd = stepEnd, baseTurnEnd = turnEnd;
  if (attachId !== sessionId) {
    base = await deps.readSession(attachId);
    try { baseTarget = locate(base.events, messageId, field); }
    catch { baseTarget = finalReplyOfTurn(base.events, turn, field); }
    baseTurnEnd = base.events.find(e => e.type === 'turn/end' && e.seq > baseTarget.event.seq && e.data.turn === turn);
    baseStepEnd = base.events.find(e => e.type === 'step/end' && e.seq > baseTarget.event.seq && e.data.turn === turn && e.data.step === baseTarget.event.data.step);
    if (!baseTurnEnd || baseTurnEnd.data.reason.kind !== 'completed' || baseStepEnd?.type !== 'step/end' || baseStepEnd.data.turn !== turn || baseStepEnd.data.step !== baseTarget.event.data.step || baseStepEnd.seq >= baseTurnEnd.seq) throw new Error('只能编辑回合末尾的最终回复 / Only the final reply of a turn can be edited');
  }
  const childId = `session-${deps.uuid()}`;
  const prefix = base.events.slice(0,baseTarget.event.seq);
  const assistant = structuredClone(baseTarget.event.data.message);
  assistant.id = deps.uuid();
  assistant.content = field === 'text' ? [{type:'text',text}] : [{type:'reasoning',text}, ...assistant.content.filter(block => block.type === 'text')];
  delete assistant.source.replayState;
  const seq = prefix.length;
  const seed = [...prefix,
    {type:'session/end-seed',seq,time:baseTarget.event.time,data:{inherited:true}},
    {type:'assistant/message',seq:seq+1,time:baseTarget.event.time,data:{turn,step:baseTarget.event.data.step,message:assistant,stream:[]},surfaceOp:'append'},
    {...baseStepEnd,seq:seq+2}, {...baseTurnEnd,seq:seq+3},
    versionMarker({childId,attachId,operation:'edit-reply',targetTurn:turn,targetEventSeq:baseTarget.event.seq,before:target.text,after:text,id:deps.uuid(),seq:seq+4,time:Date.now()})];
  const config = prefix.findLast(e => e.type === 'request/header')?.data.header.config ?? assistant.source;
  if (!config.provider || !config.model) throw new Error('无法解析模型 / Cannot resolve model');
  const preset = prefix.findLast(e => e.type === 'agent-preset/selected')?.data.agentPreset ?? base.session.agentPreset;
  signal?.throwIfAborted();
  let child;
  try { child = await deps.create({sessionId:childId,seed,inheritedEventCount:seq,meta:{isSeeded:true,parentSession:attachId,...(base.session.cwd ? {cwd:base.session.cwd}:{}),...(preset ? {agentPreset:preset}:{})},agentOptions:{provider:config.provider,model:config.model,...(config.maxTokens === undefined ? {}:{maxTokens:config.maxTokens}),...(config.reasoningEffort === undefined ? {}:{reasoningEffort:config.reasoningEffort})},signal}); }
  catch(error) { return {ok:false,accepted:false,error:String(error?.message ?? error),recovery:'原对话没有改动，可以再试一次 / Original conversation unchanged; try again'}; }
  try {
    const tail = child.agent.session.deriveMessages().at(-1);
    const selectedText = tail?.content.filter(block => block.type === field).map(block=>block.text).join('\n\n');
    if (tail?.id !== assistant.id || tail.role !== 'assistant' || selectedText !== text) throw new Error('分支末尾校验失败 / Branch tail verification failed');
    if (!await deps.flush(child.agent.session)) throw new Error('未确认持久化 / Durability not confirmed');
    if (deps.attach) await deps.attach(childId);
    return {ok:true,sessionId:childId,sourceSessionId:sessionId,atSeq:target.event.seq,semantics:'assistant-seed',accepted:true,tailRole:tail.role};
  } catch (error) {
    let cleanupError;
    try { await child.dispose(); } catch (e) { cleanupError=String(e); }
    return {ok:false,accepted:false,error:String(error.message||error),recovery:cleanupError ? '原对话没有改动；新版本可能已在侧栏，可打开查看或删除 / Original unchanged; the new version may be in the sidebar — open or delete it' : '原对话没有改动，可以再试一次 / Original conversation unchanged; try again'};
  }
}
