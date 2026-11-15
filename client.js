async function replyEditorOpenBranch(sessions, navigation, sessionId, isCurrent = () => true) {
  if (!isCurrent()) return false;
  const reference = sessions.retain(sessionId, {source:'controllerOperation', signal:AbortSignal.timeout(30000)});
  try {
    const binding = await reference.ready;
    if (!isCurrent()) return false;
    const snapshot = binding.session.getSnapshot();
    if (snapshot.openState === 'error') throw new Error(snapshot.openError?.message || '无法载入新版本 / Could not load the new version');
    navigation.openSession(sessionId);
    return true;
  } finally {
    reference.release();
  }
}

// One sidebar entry per conversation family; the real catalog stays intact.
function sidebarRoot(id, byId) {
  const seen = new Set([id]);
  let current = id;
  while (byId[current] && byId[current].origin !== 'subagent') {
    const parent = byId[current].parentId;
    if (!parent || !byId[parent] || byId[parent].origin === 'subagent' || seen.has(parent)) break;
    seen.add(parent);
    current = parent;
  }
  return current;
}

function sidebarList(list) {
  const byId = Object.fromEntries(Object.entries(list.byId).filter(([, row]) => row.origin === 'subagent'));
  const ids = [];
  const seen = new Set();
  const catalogs = new Map();
  for (const id of list.ids) {
    const session = list.byId[id];
    if (!session) continue;
    const root = sidebarRoot(id, list.byId);
    if (!seen.has(root)) {
      byId[root] = { ...list.byId[root], retainedBy: { ...list.byId[root].retainedBy } };
      ids.push(root);
      seen.add(root);
    }
    const row = byId[root];
    row.updatedAt = Math.max(row.updatedAt || 0, session.updatedAt || 0);
    row.running = row.running || session.running;
    if (id !== root) row.retainedBy.mainView = (row.retainedBy.mainView || 0) + (session.retainedBy?.mainView || 0);
    for (const child of list.projectionsBySession?.[id]?.values.subagentCatalog || []) {
      if (!catalogs.has(root)) catalogs.set(root, new Map());
      catalogs.get(root).set(child.id, child);
    }
  }
  const projectionsBySession = list.projectionsBySession && { ...list.projectionsBySession };
  for (const [root, children] of catalogs) {
    const projection = projectionsBySession[root];
    projectionsBySession[root] = { ...projection, values: { ...projection?.values, subagentCatalog: [...children.values()] } };
  }
  return { ...list, ids, byId, ...(projectionsBySession ? { projectionsBySession } : {}) };
}

function sidebarAttention(statuses, list, workspaces) {
  const attention = new Map();
  if (!statuses) return attention;
  const archived = new Set(workspaces.archivedSessionIds);
  const ids = new Set([...list.ids.map(id => sidebarRoot(id, list.byId)), ...list.ids]);
  for (const id of ids) {
    const session = list.byId[id];
    const root = sidebarRoot(id, list.byId);
    if (!session || session.blank || session.origin === 'subagent' || archived.has(id) || archived.has(root)) continue;
    const status = statuses.get(id);
    if (!status) continue;
    const pending = ['approval', 'plan-review', 'question'].includes(status.pendingInteraction?.kind);
    const completed = status.completionUnread === true && !(status.running ?? session.running);
    if (!pending && !completed) continue;
    if (!attention.has(root)) attention.set(root, {});
    const row = attention.get(root);
    if (pending && !row.pending) row.pending = { id, interaction: status.pendingInteraction };
    if (completed && !row.completed) row.completed = id;
  }
  return attention;
}

function sidebarStatuses(statuses, list, attention, workspaces) {
  if (!statuses) return statuses;
  const grouped = new Map(statuses);
  for (const [id, status] of statuses) {
    const root = sidebarRoot(id, list.byId);
    if (id === root) continue;
    const row = grouped.get(root);
    grouped.set(root, { ...row, running: row?.running || status.running });
  }
  for (const root of new Set(list.ids.map(id => sidebarRoot(id, list.byId)))) {
    if (list.byId[root]?.origin === 'subagent' || workspaces.archivedSessionIds.includes(root)) continue;
    const flags = attention.get(root);
    grouped.set(root, { ...grouped.get(root),
      completionUnread: !!flags?.completed,
      pendingInteraction: flags?.pending?.interaction,
    });
  }
  return grouped;
}

function sidebarWorkspaces(state, list) {
  const originals = ids => ids.filter(id => sidebarRoot(id, list.byId) === id);
  return {
    ...state,
    items: state.items.map(item => ({ ...item, sessionIds: originals(item.sessionIds) })),
    pinnedSessionIds: originals(state.pinnedSessionIds),
    archivedSessionIds: originals(state.archivedSessionIds),
  };
}

function sidebarSearch(result, list, workspaces, archivedFilter, query = '', targets) {
  if (!result?.items) return result;
  const q = query.trim().toLowerCase();
  const archived = new Set(workspaces.archivedSessionIds);
  const visible = id => {
    const row = list.byId[id];
    return row && !row.blank && row.origin !== 'subagent'
      && (archivedFilter === 'show' || (archivedFilter === 'only' ? archived.has(id) : !archived.has(id)));
  };
  const titleOrIdMatches = id => q && ((list.byId[id]?.title || '').toLowerCase().includes(q) || id.toLowerCase().includes(q));
  const rootMatches = id => {
    const cwd = list.byId[id]?.cwd || '';
    const label = workspaces.items.find(item => item.sessionIds.includes(id))?.title
      ?? (cwd.replace(/[/\\]+$/, '').split(/[/\\]/).pop() || cwd);
    return q && (titleOrIdMatches(id) || label.toLowerCase().includes(q));
  };
  const local = q ? list.ids.filter(id => {
    return visible(id) && sidebarRoot(id, list.byId) !== id && titleOrIdMatches(id);
  }).map(sessionId => ({ sessionId })) : [];
  const families = new Map();
  for (const item of [...result.items, ...local]) {
    const sessionId = sidebarRoot(item.sessionId, list.byId);
    if (!visible(item.sessionId) || !visible(sessionId)) continue;
    if (!families.has(sessionId)) families.set(sessionId, []);
    families.get(sessionId).push(item);
  }
  return { ...result, items: [...families].map(([sessionId, matches]) => {
    const ordinary = rootMatches(sessionId);
    const live = matches.filter(item => !archived.has(item.sessionId));
    if (!live.length && ordinary && !archived.has(sessionId)) return { sessionId };
    const candidates = live.length ? live : matches;
    const item = candidates.find(item => item.snippet) || candidates[0];
    if (item.snippet || (item.sessionId !== sessionId && !ordinary)) targets.set(sessionId, item.sessionId);
    return { ...item, sessionId };
  }) };
}

function versionRootOf(versions, sessionId) {
  const byId = new Map((versions || []).map(v => [v.sessionId, v]));
  let cursor = byId.get(sessionId);
  if (!cursor) return sessionId;
  const seen = new Set([cursor.sessionId]);
  while (cursor.parentSessionId && byId.has(cursor.parentSessionId) && !seen.has(cursor.parentSessionId)) {
    seen.add(cursor.parentSessionId);
    cursor = byId.get(cursor.parentSessionId);
  }
  return cursor.sessionId;
}

function ringFor(versions, sessionId, turn) {
  if (!versions) return null;
  const byId = new Map(versions.map(v => [v.sessionId, v]));
  let cursor = byId.get(sessionId);
  if (!cursor) return null;
  while (cursor.parentSessionId && typeof cursor.targetTurn === 'number' && cursor.targetTurn > turn) {
    const parent = byId.get(cursor.parentSessionId);
    if (!parent) break;
    cursor = parent;
  }
  let fork = cursor;
  while (fork.parentSessionId && typeof fork.targetTurn === 'number' && fork.targetTurn === turn) {
    const parent = byId.get(fork.parentSessionId);
    if (!parent) break;
    fork = parent;
  }
  function walksToFork(start) {
    let x = start;
    const seen = new Set();
    while (x && !seen.has(x.sessionId)) {
      seen.add(x.sessionId);
      if (x.sessionId === fork.sessionId) return true;
      if (typeof x.targetTurn !== 'number' || x.targetTurn !== turn) return false;
      x = x.parentSessionId ? byId.get(x.parentSessionId) : null;
    }
    return false;
  }
  const alternatives = versions
    .filter(v => !v.deleted && (v.sessionId === fork.sessionId || (v.targetTurn === turn && walksToFork(v))))
    .sort((a, b) => a.createdAt - b.createdAt || String(a.sessionId).localeCompare(String(b.sessionId)));
  if (alternatives.length < 2) return null;
  let index = alternatives.findIndex(v => v.sessionId === cursor.sessionId);
  if (index === -1) index = alternatives.findIndex(v => v.sessionId === sessionId);
  if (index === -1) index = 0;
  return {alternatives, index};
}

function makeTreeStore(load, now = Date.now) {
  const MAX_SESSIONS = 500, MAX_ROOTS = 50, REVALIDATE_MS = 8000;
  return {
    bySession: new Map(), byRoot: new Map(), inflight: new Map(), listeners: [],
    get(sessionId) { return sessionId ? this.bySession.get(sessionId) || null : null; },
    notify() { for (const fn of this.listeners) { try { fn(); } catch {} } },
    subscribe(fn) { this.listeners.push(fn); return () => { const i = this.listeners.indexOf(fn); if (i !== -1) this.listeners.splice(i, 1); }; },
    prune() {
      while (this.bySession.size > MAX_SESSIONS) this.bySession.delete(this.bySession.keys().next().value);
      while (this.byRoot.size > MAX_ROOTS) this.byRoot.delete(this.byRoot.keys().next().value);
    },
    setTree(sessionId, versions, timestamp) {
      if (!Array.isArray(versions)) versions = [];
      const rootId = versionRootOf(versions, sessionId) || sessionId;
      const updatedAt = typeof timestamp === 'number' ? timestamp : now();
      const existingRoot = this.byRoot.get(rootId);
      if (existingRoot && (existingRoot.updatedAt || 0) > updatedAt) return;
      const entry = {versions, rootId, loading:false, error:null, updatedAt};
      this.byRoot.set(rootId, entry);
      for (const v of versions) if (v?.sessionId && !v.deleted) this.bySession.set(v.sessionId, entry);
      this.bySession.set(sessionId, entry);
      this.prune();
      this.notify();
    },
    load(sessionId) {
      if (!sessionId) return Promise.resolve();
      if (this.inflight.has(sessionId)) return this.inflight.get(sessionId);
      const existing = this.bySession.get(sessionId);
      const reqTime = now();
      this.bySession.set(sessionId, existing ? {...existing, loading:true} : {versions:null, loading:true, error:null, updatedAt:0});
      const promise = (async () => {
        try { this.setTree(sessionId, await load(sessionId), reqTime); }
        catch (error) {
          const prev = this.bySession.get(sessionId);
          this.bySession.set(sessionId, {versions:prev?.versions ?? null, loading:false, error:String(error?.message || error), updatedAt:prev?.updatedAt ?? 0});
          this.notify();
        } finally { this.inflight.delete(sessionId); }
      })();
      this.inflight.set(sessionId, promise);
      return promise;
    },
    ensure(sessionId) {
      if (!sessionId) return;
      const entry = this.bySession.get(sessionId);
      if (!entry || !entry.versions) this.load(sessionId);
      else if (now() - (entry.updatedAt || 0) > REVALIDATE_MS && !entry.loading) this.load(sessionId);
    },
    invalidate(sessionId) {
      if (sessionId) {
        const entry = this.bySession.get(sessionId);
        const rootEntry = entry?.rootId ? this.byRoot.get(entry.rootId) : null;
        if (rootEntry) rootEntry.updatedAt = 0;
        this.load(sessionId);
      } else {
        this.bySession.forEach(e => { if (e) e.updatedAt = 0; });
        this.byRoot.forEach(e => { if (e) e.updatedAt = 0; });
        this.notify();
      }
    },
  };
}

// Client-side editability pre-check over the bound event window: rejects
// non-final/interrupted replies before the user types a full edit. Missing
// structure (truncated window) falls through to the authoritative host check.
function editableReply(events, messageId) {
  const index = events.findIndex(e => e.type === 'assistant/message' && e.surfaceOp === 'append' && e.data?.message?.id === messageId);
  if (index < 0) return null;
  const event = events[index];
  const blocks = event.data.message.content || [];
  if (blocks.some(block => !['text', 'reasoning'].includes(block.type))) return { error: '这条回复含工具调用或附件，暂不支持编辑 / This reply contains tool calls or attachments and cannot be edited' };
  if (event.data.interrupted) return { error: '被打断的回复暂不支持编辑 / Interrupted replies cannot be edited' };
  const turn = event.data.turn;
  const endIndex = events.findIndex(e => e.type === 'turn/end' && e.data.turn === turn && e.seq > event.seq);
  if (endIndex >= 0 && events[endIndex].data.reason?.kind !== 'completed') return { error: '这条回复所在的回合尚未正常结束 / The turn has not completed yet' };
  const boundary = endIndex >= 0 ? endIndex : events.length;
  if (events.slice(index + 1, boundary).some(e => e.type === 'assistant/message' && e.surfaceOp === 'append' && e.data.turn === turn)) return { error: '只能编辑回合末尾的最终回复 / Only the final reply of a turn can be edited' };
  const text = blocks.filter(block => block.type === 'text').map(block => block.text).join('\n\n');
  const reasoning = blocks.filter(block => block.type === 'reasoning').map(block => block.text).join('\n\n');
  return text.trim() || reasoning.trim() ? { text, reasoning } : null;
}

const LW_DICT = {
  zh: {edit:'编辑回复',note:'保存后从你的版本继续，原对话保留。',cancel:'取消',save:'保存并继续',loading:'正在保存…',open:'打开新版本',ready:'已保存',verifying:'正在读取…',reload:'重新读取',original:'回复正文',reasoning:'思考文本',body:'正文',editPrompt:'编辑提问',retry:'重新生成',submitPrompt:'保存并重新生成',working:'正在处理…',promptNote:'从这条提问重新生成，原对话保留。',prev:'上一个版本',next:'下一个版本',switchFailed:'切换失败，请重试',commandMissing:'插件命令未响应，请确认插件已启用',badResponse:'插件返回异常，请重试',notRetained:'会话未就绪，请刷新后重试',turnChanged:'这轮对话已经变化，请刷新后再试',turnBlocked:'这一回合暂时无法重新生成'},
  en: {edit:'Edit reply',note:'Continue from your version. The original conversation stays.',cancel:'Cancel',save:'Save and continue',loading:'Saving…',open:'Open new version',ready:'Saved',verifying:'Loading…',reload:'Reload',original:'Reply text',reasoning:'Reasoning',body:'Reply',editPrompt:'Edit prompt',retry:'Regenerate',submitPrompt:'Save and regenerate',working:'Working…',promptNote:'Regenerate from this prompt. The original conversation stays.',prev:'Previous version',next:'Next version',switchFailed:'Could not switch; try again',commandMissing:'Plugin command unavailable; check that the plugin is enabled',badResponse:'Unexpected plugin response; try again',notRetained:'Session not ready; refresh and try again',turnChanged:'This turn changed; refresh and try again',turnBlocked:'This turn cannot be regenerated'},
};

const LW_CSS = '.lw-action{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;padding:6px;border:none;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer}.lw-action svg{width:15px;height:15px}.lw-action:disabled{opacity:.4;cursor:default}@media(hover:hover){.lw-action:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary)}}.lw-inline{display:inline-flex;gap:4px;align-items:center;flex-wrap:wrap}.lw-ring{display:inline-flex;align-items:center;gap:2px}.lw-ring-button{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;padding:0;border:none;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-tertiary);font:inherit;font-size:14px;line-height:1;cursor:pointer}.lw-ring-button:disabled{opacity:.4;cursor:default}@media(hover:hover){.lw-ring-button:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary)}}.lw-ring-count{font-size:12px;color:var(--dsw-alias-label-secondary);padding:0 3px}.lw-ring-error{color:var(--dsw-alias-state-error-primary);font-size:12px;font-weight:600;cursor:help;padding:0 2px}.lw-error{white-space:pre-wrap;overflow-wrap:anywhere;color:var(--dsw-alias-state-error-primary);font-size:12px;line-height:1.6}.lw-dialog{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-overlay);border:1px solid var(--dsw-alias-border-l2);border-radius:12px;width:min(720px,85vw);max-height:85vh;padding:22px;overflow:auto}.lw-dialog::backdrop{background:var(--dsw-alias-bg-base);opacity:.7}.lw-dialog h3{margin:0 0 8px;font-size:16px;font-weight:600}.lw-dialog p{color:var(--dsw-alias-label-secondary);font-size:13px;line-height:1.6;margin:0 0 12px}.lw-dialog textarea{box-sizing:border-box;width:100%;min-height:240px;resize:vertical;font:14px/1.6 monospace;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l2);border-radius:8px;padding:12px}.lw-dialog textarea:focus-visible{box-shadow:0 0 0 2px var(--dsw-alias-border-l3);outline:none}.lw-status{color:var(--dsw-alias-label-secondary);font-size:12px;margin:8px 0}.lw-field{display:flex;gap:8px;margin:0 0 8px}.lw-footer{display:flex;justify-content:flex-end;align-items:center;gap:10px;margin-top:16px}.lw-primary,.lw-secondary{font:inherit;font-size:13px;min-height:34px;padding:0 16px;border-radius:17px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center}.lw-primary{border:0;color:var(--dsw-alias-label-primary-foreground);background:var(--dsw-alias-button-primary-fill)}.lw-primary:hover:not(:disabled){background:var(--dsw-alias-button-primary-hover)}.lw-secondary{border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);background:transparent}.lw-secondary:hover:not(:disabled){color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}.lw-primary:disabled,.lw-secondary:disabled{opacity:.45;cursor:default}.lw-primary:focus-visible,.lw-secondary:focus-visible{box-shadow:0 0 0 2px var(--dsw-alias-border-l3);outline:none}.lw-field .lw-secondary{min-height:28px;padding:0 12px;font-size:12px}.lw-field .lw-secondary[aria-pressed=true]{color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-border-l3)}';

window.__ModuleLoader__.load({
  id: 'dsh-last-word',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    return {
      inject: ['slots', 'sessions', 'locale', 'uiWorkspace'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register('last-word', LW_DICT));
        const fallbackT = ctx.locale.bind('last-word');
        const L = key => (LW_DICT[ctx.locale.getSnapshot().active] || LW_DICT.en)[key] || LW_DICT.en[key] || key;
        const icon = paths => h('svg',{viewBox:'0 0 24 24',width:15,height:15,fill:'none',stroke:'currentColor',strokeWidth:2,strokeLinecap:'round',strokeLinejoin:'round','aria-hidden':true},paths);
        const PencilIcon = () => icon([h('path',{key:'p',d:'M12 20h9'}),h('path',{key:'e',d:'M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z'})]);
        const RetryIcon = () => icon([h('polyline',{key:'a',points:'23 4 23 10 17 10'}),h('path',{key:'b',d:'M20.49 15a9 9 0 1 1-2.12-9.36L23 10'})]);
        async function invoke(sessionId, payload) {
          const scoped = ctx.sessions.scope(sessionId);
          if (!scoped) throw new Error(L('notRetained'));
          const result = await scoped.remote.commands.execute('/reply-editor ' + JSON.stringify(payload), []);
          if (!result.ok) throw new Error(result.error?.message || L('commandMissing'));
          const execution = result.value;
          if (!execution) throw new Error(L('commandMissing'));
          if (execution.result.kind === 'error') throw new Error(execution.result.text || L('badResponse'));
          try { return JSON.parse(execution.result.text); }
          catch { throw new Error(L('badResponse')); }
        }
        function localReply(sessionId, messageId) {
          const binding = ctx.sessions.binding(sessionId);
          const entries = binding?.eventSource?.getSnapshot?.()?.entries || [];
          return editableReply(entries.filter(entry => entry.type === 'event').map(entry => entry.event), messageId);
        }
        const PREFS_KEY = 'dsh-last-word:prefs';
        const prefsStore = {
          value: null, listeners: [],
          get() {
            if (this.value === null) {
              let parsed = null;
              try { parsed = JSON.parse(localStorage.getItem(PREFS_KEY) || 'null'); } catch {}
              const defaults = { foldSidebar: true, rememberPath: true };
              this.value = Object.fromEntries(Object.keys(defaults).map(k => [k, typeof parsed?.[k] === 'boolean' ? parsed[k] : defaults[k]]));
            }
            return this.value;
          },
          set(patch) {
            this.value = { ...this.get(), ...patch };
            try { localStorage.setItem(PREFS_KEY, JSON.stringify(this.value)); } catch {}
            for (const fn of this.listeners) { try { fn(); } catch {} }
          },
          subscribe(fn) { this.listeners.push(fn); return () => { const i = this.listeners.indexOf(fn); if (i !== -1) this.listeners.splice(i, 1); }; },
        };
        function usePrefs() {
          const [, force] = React.useReducer(x => x + 1, 0);
          React.useEffect(() => prefsStore.subscribe(force), []);
          return prefsStore.get();
        }
        // Remembered last-viewed branch per family root, so reopening a folded
        // conversation lands on the version the user left, not always the root.
        const PATH_KEY = 'dsh-last-word:active-path';
        const activePathStore = {
          map: null,
          read() {
            if (this.map === null) {
              let parsed = null;
              try { parsed = JSON.parse(localStorage.getItem(PATH_KEY) || 'null'); } catch {}
              this.map = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
            }
            return this.map;
          },
          get(rootId) { const v = rootId && this.read()[rootId]; return typeof v === 'string' ? v : undefined; },
          set(rootId, sessionId) {
            if (!rootId || !sessionId) return;
            const map = this.read();
            if (map[rootId] === sessionId) return;
            map[rootId] = sessionId;
            const keys = Object.keys(map);
            if (keys.length > 200) for (let i = 0; i < keys.length - 200; i++) delete map[keys[i]];
            try { localStorage.setItem(PATH_KEY, JSON.stringify(map)); } catch {}
          },
        };
        const treeStore = makeTreeStore(async sessionId => (await invoke(sessionId,{action:'versions'})).versions);
        function useTree(sessionId) {
          const [,force] = React.useReducer(x => x + 1, 0);
          React.useEffect(() => treeStore.subscribe(force), []);
          React.useEffect(() => { if (sessionId) treeStore.ensure(sessionId); }, [sessionId]);
          return sessionId ? treeStore.get(sessionId) : null;
        }
        function VersionRing(props) {
          const t = props.t;
          const tree = useTree(props.sessionId);
          const [busy, setBusy] = React.useState(false);
          const [error, setError] = React.useState(null);
          React.useEffect(() => {
            if (!error) return;
            const timer = setTimeout(() => setError(null), 4000);
            return () => clearTimeout(timer);
          }, [error]);
          const ring = typeof props.turn === 'number' ? ringFor(tree?.versions, props.sessionId, props.turn) : null;
          if (!ring) return null;
          const go = async delta => {
            if (busy) return;
            const next = ring.alternatives[ring.index + delta];
            if (!next) return;
            setBusy(true); setError(null);
            activePathStore.set(versionRootOf(tree.versions, props.sessionId), next.sessionId);
            try {
              if (next.archived) await invoke(props.sessionId,{action:'activate',sessionId:next.sessionId});
              treeStore.invalidate(props.sessionId);
              await replyEditorOpenBranch(ctx.sessions, ctx.uiWorkspace, next.sessionId);
            } catch { setError(t('switchFailed')); }
            finally { setBusy(false); }
          };
          return h('span',{className:'lw-ring'},
            h('button',{type:'button',className:'lw-ring-button',disabled:busy||ring.index<=0,onClick:()=>go(-1),'aria-label':t('prev'),title:t('prev')},'‹'),
            h('span',{className:'lw-ring-count'},(ring.index+1)+'/'+ring.alternatives.length),
            h('button',{type:'button',className:'lw-ring-button',disabled:busy||ring.index>=ring.alternatives.length-1,onClick:()=>go(1),'aria-label':t('next'),title:t('next')},'›'),
            error && h('span',{className:'lw-ring-error',role:'alert',title:error},'!'));
        }
        function installSidebarGrouping(slots) {
          if (typeof slots.entriesOfSlot !== 'function') return;
          return slots.inject('sidebar.workspaces', function () {
            const entry = slots.entriesOfSlot('sidebar.workspaces').find(row => row.component);
            if (!entry) return;
            const Original = entry.component;
            function GroupedSidebar(props) {
              const prefs = usePrefs();
              const list = props.useSessions(state => state);
              const searchRequest = React.useRef(null);
              const workspaces = props.useWorkspaces(state => state);
              const latestView = React.useRef(null);
              const archivedFilter = props.useStore ? props.useStore(state => state.archivedFilter ?? 'default') : 'default';
              const archiveKey = JSON.stringify([...workspaces.archivedSessionIds].sort());
              const statuses = props.useSessionStatus ? props.useSessionStatus(state => state) : null;
              const grouped = React.useMemo(() => sidebarList(list), [list]);
              const groupedWorkspaces = React.useMemo(() => sidebarWorkspaces(workspaces, list), [workspaces, list]);
              const attention = React.useMemo(() => sidebarAttention(statuses, list, workspaces), [statuses, list, workspaces]);
              const groupedStatuses = React.useMemo(() => sidebarStatuses(statuses, list, attention, workspaces), [statuses, list, attention, workspaces]);
              latestView.current = { list, workspaces, attention };
              const active = list.ids.find(id => (list.byId[id]?.retainedBy?.mainView || 0) > 0);
              React.useEffect(() => {
                if (prefs.foldSidebar && active) activePathStore.set(sidebarRoot(active, list.byId), active);
              }, [active, list, prefs.foldSidebar]);
              const useSessions = selector => props.useSessions(state => selector(state === list ? grouped : sidebarList(state)));
              const useWorkspaces = selector => props.useWorkspaces(() => selector(groupedWorkspaces));
              const useSessionStatus = selector => props.useSessionStatus(() => selector(groupedStatuses));
              const open = id => {
                const { list, workspaces, attention } = latestView.current;
                const request = searchRequest.current;
                searchRequest.current = null;
                if (workspaces.archivedSessionIds.includes(id)) { props.notifyArchivedNotOpenable?.(); return; }
                if (request && !request.signal?.aborted) {
                  const target = request.targets.get(id);
                  if (workspaces.archivedSessionIds.includes(target)) { props.notifyArchivedNotOpenable?.(); return; }
                  if (target && list.byId[target]) { activePathStore.set(id, target); props.open(target); return; }
                }
                const flags = attention.get(id);
                const actionable = flags?.pending?.id || flags?.completed;
                if (actionable) { activePathStore.set(id, actionable); props.open(actionable); return; }
                const remembered = activePathStore.get(id);
                props.open(prefs.rememberPath && remembered && list.byId[remembered] && !workspaces.archivedSessionIds.includes(remembered) ? remembered : id);
              };
              const searchSessions = React.useCallback(async (...args) => {
                const request = { signal: args[1], targets: new Map() };
                searchRequest.current = request;
                const project = result => sidebarSearch(result, latestView.current.list, latestView.current.workspaces, archivedFilter, args[0], request.targets);
                try { return project(await props.searchSessions(...args)); }
                catch (error) {
                  if (args[1]?.aborted) throw error;
                  const local = project({ items: [], hasMore: false });
                  if (!local.items.length) throw error;
                  return local;
                }
              }, [props.searchSessions, archivedFilter, archiveKey]);
              return React.createElement(Original, prefs.foldSidebar ? { ...props, useSessions, useWorkspaces,
                ...(props.useSessionStatus ? { useSessionStatus } : {}), open, searchSessions } : props);
            }
            entry.component = GroupedSidebar;
            return function () { if (entry.component === GroupedSidebar) entry.component = Original; };
          });
        }
        ctx.effect(() => installSidebarGrouping(ctx.slots));
        function Editor(props) {
          const t = props.t || fallbackT;
          const [opened, setOpened] = React.useState(false);
          const [text, setText] = React.useState('');
          const [original, setOriginal] = React.useState(null);
          const [reasoning, setReasoning] = React.useState('');
          const [reasoningDraft, setReasoningDraft] = React.useState('');
          const [field, setField] = React.useState('text');
          const shown = field === 'reasoning' ? reasoningDraft : text;
          const baseline = field === 'reasoning' ? reasoning : original;
          const [busy, setBusy] = React.useState(false);
          const [verifying, setVerifying] = React.useState(false);
          const [error, setError] = React.useState('');
          const [child, setChild] = React.useState(null);
          const dialogRef = React.useRef(null);
          const triggerRef = React.useRef(null);
          const operation = React.useRef(null);
          const saveLock = React.useRef(false);
          const readGeneration = React.useRef(0);
          const snapshot = ctx.sessions.binding(props.sessionId)?.eventSource?.getSnapshot?.();
          const visible = React.useMemo(() => editableReply((snapshot?.entries || []).filter(entry => entry.type === 'event').map(entry => entry.event), props.messageId), [snapshot, props.messageId]);
          React.useEffect(()=>()=>{readGeneration.current++;},[]);
          React.useEffect(() => {
            if (!opened) return;
            const dialog = dialogRef.current;
            dialog?.showModal();
            return () => { dialog?.close(); triggerRef.current?.focus(); };
          }, [opened]);
          async function begin() {
            const generation = ++readGeneration.current;
            setOpened(true); setBusy(false); setError(''); setChild(null); setOriginal(null); setText(''); setReasoning(''); setReasoningDraft(''); setField('text'); operation.current = null;
            const cached = localReply(props.sessionId, props.messageId);
            if (cached?.error) { if (generation === readGeneration.current) setError(cached.error); return; }
            if (cached && (cached.text.trim() || cached.reasoning.trim())) {
              setText(cached.text); setOriginal(cached.text); setReasoning(cached.reasoning || ''); setReasoningDraft(cached.reasoning || '');
              if (!cached.text.trim() && cached.reasoning.trim()) setField('reasoning');
              setVerifying(false); return;
            }
            setVerifying(true);
            try {
              const read = await invoke(props.sessionId,{action:'read',messageId:props.messageId});
              if (generation === readGeneration.current) {
                setOriginal(read.text); setText(read.text); setReasoning(read.reasoning || ''); setReasoningDraft(read.reasoning || '');
                if (read.field === 'reasoning') setField('reasoning');
              }
            } catch(e) { if (generation === readGeneration.current) setError(e.message); }
            finally { if (generation === readGeneration.current) setVerifying(false); }
          }
          const canSave = !busy && !verifying && baseline !== null && !!shown.trim() && shown !== baseline && !child;
          async function save() {
            if (saveLock.current || !canSave) return;
            saveLock.current = true;
            setBusy(true); setError('');
            const fingerprint = JSON.stringify([field,shown,baseline]);
            if (!operation.current || operation.current.fingerprint !== fingerprint) operation.current = {id:crypto.randomUUID(),fingerprint};
            const generation = readGeneration.current;
            try {
              const result = await invoke(props.sessionId,{action:'branch',messageId:props.messageId,field,text:shown,expectedText:baseline,operationId:operation.current.id});
              if (generation !== readGeneration.current) return;
              if (result.sessionId) setChild(result.sessionId);
              if (result.ok && result.sessionId) { treeStore.invalidate(props.sessionId); await replyEditorOpenBranch(ctx.sessions,ctx.uiWorkspace,result.sessionId,()=>generation===readGeneration.current); setOpened(false); }
              if (!result.ok) setError([result.error,result.recovery].filter(Boolean).join('\n'));
            } catch(e) { if (generation === readGeneration.current) setError(e.message); }
            finally { saveLock.current = false; setBusy(false); }
          }
          function close() { if (!busy) { ++readGeneration.current; setVerifying(false); setOpened(false); } }
          const reloadable = error && /原文已变化|定位失败|读取/.test(error);
          return h(React.Fragment,null,
            h('style',null,LW_CSS),
            !visible?.error && h('button',{ref:triggerRef,type:'button',className:'lw-action',onClick:begin,title:t('edit'),'aria-label':t('edit')},h(PencilIcon)),
            opened && h('dialog',{ref:dialogRef,className:'lw-dialog','aria-labelledby':'lw-title-'+props.messageId,onCancel:e=>{e.preventDefault();close();}},
              h('h3',{id:'lw-title-'+props.messageId},t('edit')),
              h('p',null,t('note')),
              verifying && h('div',{className:'lw-status',role:'status'},t('verifying')),
              reasoning && h('div',{className:'lw-field'},
                h('button',{className:'lw-secondary',type:'button',disabled:busy || !!child,onClick:()=>setField('text'),'aria-pressed':field==='text'},t('body')),
                h('button',{className:'lw-secondary',type:'button',disabled:busy || !!child,onClick:()=>setField('reasoning'),'aria-pressed':field==='reasoning'},t('reasoning'))),
              h('textarea',{'aria-label':field==='reasoning'?t('reasoning'):t('original'),value:shown,maxLength:60000,disabled:busy || original===null || !!child,autoFocus:true,
                onChange:e=>field==='reasoning'?setReasoningDraft(e.target.value):setText(e.target.value),
                onKeyDown:e=>{if(e.key==='Enter'&&(e.metaKey||e.ctrlKey)){e.preventDefault();save();}}}),
              error && h('div',{className:'lw-error',role:'alert'},error),
              child && h('p',{role:'status',className:'lw-status'},t('ready')),
              h('div',{className:'lw-footer'},
                reloadable && h('button',{className:'lw-secondary',type:'button',onClick:begin,disabled:busy},t('reload')),
                h('button',{className:'lw-secondary',type:'button',onClick:close,disabled:busy},t('cancel')),
                child ? h('button',{className:'lw-primary',type:'button',onClick:()=>{ctx.uiWorkspace.openSession(child);setOpened(false);}},t('open')) : h('button',{className:'lw-primary',type:'button',onClick:save,disabled:!canSave},busy?t('loading'):t('save')))));
        }
        function RerunEditor(props) {
          const t = props.t || fallbackT;
          const [opened,setOpened]=React.useState(false),[busy,setBusy]=React.useState(false);
          const [plan,setPlan]=React.useState(null),[draft,setDraft]=React.useState('');
          const [error,setError]=React.useState(''),[child,setChild]=React.useState(null);
          const dialog=React.useRef(null),trigger=React.useRef(null),lock=React.useRef(false);
          const generation=React.useRef(0),operation=React.useRef(null);
          React.useEffect(()=>{if(!opened)return;dialog.current?.showModal();return()=>{dialog.current?.close();trigger.current?.focus();};},[opened]);
          React.useEffect(()=>()=>{generation.current++;},[]);
          const friendly=error=>{const text=String(error?.message||error);if(/Turn unavailable|回合已不可用|回合边界/.test(text))return t('turnChanged');if(/multiple|多个输入|No single prompt/.test(text))return t('turnBlocked');return text;};
          async function load(){return invoke(props.sessionId,{action:'preview-user',turnEndSeq:props.seq});}
          async function run(p,action,generationToken=undefined){
            const payload={action,turnEndSeq:p.turnEndSeq,laterTurns:p.laterTurns,...(action==='edit-user'?{text:draft,expectedText:p.text}:{})};
            const fingerprint=JSON.stringify(payload);
            if(operation.current?.fingerprint!==fingerprint)operation.current={fingerprint,id:crypto.randomUUID()};
            const result=await invoke(props.sessionId,{...payload,operationId:operation.current.id});
            if(result.sessionId)setChild(result.sessionId);
            if(!result.ok)throw new Error([result.error,result.recovery].filter(Boolean).join('\n'));
            treeStore.invalidate(props.sessionId);
            if(generationToken===undefined||generationToken===generation.current){await replyEditorOpenBranch(ctx.sessions,ctx.uiWorkspace,result.sessionId,()=>generationToken===undefined||generationToken===generation.current);setOpened(false);}
          }
          async function begin(){
            if(lock.current)return;
            const g=++generation.current;
            setOpened(true);setBusy(true);setError('');setChild(null);setPlan(null);setDraft('');operation.current=null;
            try{const p=await load();if(g===generation.current){setPlan(p);setDraft(p.text);}}
            catch(e){if(g===generation.current)setError(friendly(e));}
            finally{if(g===generation.current)setBusy(false);}
          }
          async function retry(){
            if(lock.current||busy)return;lock.current=true;setBusy(true);setError('');setChild(null);
            const g=generation.current;
            try{await run({turnEndSeq:props.seq},'retry',g);}
            catch(e){setError(friendly(e));}
            finally{lock.current=false;setBusy(false);}
          }
          const canSubmit=busy===false&&!!plan&&!!draft.trim()&&draft!==plan.text&&!child;
          async function submit(){
            if(lock.current||!canSubmit)return;lock.current=true;setBusy(true);setError('');
            try{await run(plan,'edit-user',generation.current);}catch(e){setError(friendly(e));}finally{lock.current=false;setBusy(false);}
          }
          function close(){if(!lock.current){generation.current++;setBusy(false);setOpened(false);}}
          return h(React.Fragment,null,
            h('style',null,LW_CSS),
            h('div',{className:'lw-inline'},
              h(VersionRing,{sessionId:props.sessionId,turn:props.turn,t}),
              h('button',{type:'button',ref:trigger,className:'lw-action',onClick:begin,disabled:busy,title:t('editPrompt'),'aria-label':t('editPrompt')},h(PencilIcon)),
              h('button',{type:'button',className:'lw-action',onClick:retry,disabled:busy,title:t('retry'),'aria-label':t('retry')},h(RetryIcon)),
              !opened&&error&&h('span',{role:'alert',className:'lw-error'},error),
              !opened&&child&&h('button',{type:'button',className:'lw-secondary',onClick:()=>ctx.uiWorkspace.openSession(child)},t('open'))),
            opened&&h('dialog',{ref:dialog,className:'lw-dialog','aria-label':t('editPrompt'),onCancel:e=>{e.preventDefault();close();}},
              h('h3',null,t('editPrompt')),
              h('p',null,t('promptNote')),
              busy&&!plan&&h('p',{role:'status',className:'lw-status'},t('working')),
              h('textarea',{'aria-label':t('editPrompt'),value:draft,maxLength:60000,disabled:busy||!plan||!!child,autoFocus:true,
                onChange:e=>setDraft(e.target.value),
                onKeyDown:e=>{if(e.key==='Enter'&&(e.metaKey||e.ctrlKey)){e.preventDefault();submit();}}}),
              error&&h('p',{role:'alert',className:'lw-error'},error),
              h('div',{className:'lw-footer'},
                error&&!plan&&h('button',{className:'lw-secondary',type:'button',onClick:begin,disabled:busy},t('reload')),
                h('button',{className:'lw-secondary',type:'button',onClick:close,disabled:lock.current},t('cancel')),
                child?h('button',{className:'lw-primary',type:'button',onClick:()=>ctx.uiWorkspace.openSession(child)},t('open')):h('button',{className:'lw-primary',type:'button',onClick:submit,disabled:!canSubmit},busy?t('working'):t('submitPrompt')))));
        }
        ctx.slots.inject('conversation.chat.turnTail',()=>ctx.slots.register({name:'conversation.chat.turnTail',id:'reply-editor-turn-actions',order:30,locale:'last-word'},RerunEditor));
        ctx.slots.inject('conversation.chat.assistant-actions',()=>ctx.slots.register({name:'conversation.chat.assistant-actions',id:'reply-branch-editor',order:20,locale:'last-word'},Editor));
      },
    };
  },
});