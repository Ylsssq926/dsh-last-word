import assert from 'node:assert/strict';
import { Session, SESSION_FORMAT_VERSION } from '@deepseek-ai/dsh-session';
import { branchAsAssistant, locate } from './core.js';

function fixture() {
  const events = [];
  const add = (type, data, surfaceOp) => events.push({type,seq:events.length,time:1,data,...(surfaceOp ? {surfaceOp}:{})});
  add('turn/start',{turn:1});
  add('step/start',{turn:1,step:1});
  add('request/header',{header:{config:{provider:'p',model:'m'}},reason:'initial'});
  add('user/message',{id:'u',role:'user',source:{kind:'user'},content:[{type:'text',text:'原始任务'}]},'append');
  add('assistant/message',{turn:1,step:1,stream:[],usage:{inputTokens:2,outputTokens:3},message:{id:'a',role:'assistant',source:{kind:'model',provider:'p',model:'m',replayState:{old:true}},content:[{type:'reasoning',text:'旧思考'},{type:'text',text:'旧回答'},{type:'text',text:'第二段'}]}},'append');
  add('step/end',{turn:1,step:1});
  add('turn/end',{turn:1,reason:{kind:'completed'}});
  add('turn/start',{turn:2});
  return {events,session:{id:'source',cwd:'C:\\tmp'}};
}

const snapshot = fixture();
const original = structuredClone(snapshot);
const calls = [];
let request, persisted, uid=0;
const deps = {
  readSession: async () => snapshot,
  uuid: () => `test-${++uid}`,
  create: async value => {
    calls.push('create');
    request = value;
    const header={version:SESSION_FORMAT_VERSION,id:value.sessionId,createdAt:1,...value.meta};
    return {agent:{session:Session.create(value.sessionId,value.seed,header,value.inheritedEventCount)},dispose:async()=>{calls.push('dispose');}};
  },
  flush: async session => {
    calls.push('flush');
    persisted = JSON.parse(JSON.stringify({header:session.header,events:session.snapshotEvents(),count:session.inheritedEventCount}));
    return true;
  },
  attach: async () => { calls.push('attach'); },
};
const text='你好\n\n第二行';
const expected=locate(snapshot.events,'a').text;
const result=await branchAsAssistant(deps,'source','a',text,expected);
assert.equal(result.ok,true);
assert.deepEqual(calls,['create','flush','attach']);
assert.equal(request.inheritedEventCount,4);
assert.deepEqual(request.seed.slice(0,4),original.events.slice(0,4));
assert.deepEqual(snapshot,original);
const restored=Session.fromRestore(result.sessionId,persisted.events,persisted.header,persisted.count,'detached');
const messages=restored.deriveMessages();
assert.deepEqual(messages.map(m=>[m.role,m.content.map(b=>b.text)]),[['user',['原始任务']],['assistant',[text]]]);
assert.equal(messages.at(-1).source.replayState,undefined);
assert.equal(restored.requestHeader().config.model,'m');
assert.equal(restored.snapshotEvents().findLast(e=>e.type==='turn/end').data.turn,1);
assert.equal(restored.snapshotEvents().filter(e=>e.type==='turn/start').length,1);

calls.length=0;
await assert.rejects(()=>branchAsAssistant(deps,'source','a','新文本','过期原文'),/原文已变化/);
const incomplete=fixture(); incomplete.events=incomplete.events.slice(0,6);
await assert.rejects(()=>branchAsAssistant({...deps,readSession:async()=>incomplete},'source','a',text,expected),/尚未正常结束/);
const complex=fixture(); complex.events[4].data.message.content.push({type:'tool-call',id:'t',name:'tool',arguments:'{}'});
await assert.rejects(()=>branchAsAssistant({...deps,readSession:async()=>complex},'source','a',text,expected),/不支持工具调用/);
assert.deepEqual(calls,[]);
const failed=await branchAsAssistant({...deps,flush:async()=>false},'source','a',text,expected);
assert.equal(failed.ok,false);
assert.deepEqual(calls,['create','dispose']);
console.log('Assistant branch checks passed: canonical creation and restore, exact text, no extra user message, stale/complex rejection, failure disposal.');
