import './round1.check.mjs';
import assert from 'node:assert/strict';
import {Session,SESSION_FORMAT_VERSION} from '@deepseek-ai/dsh-session';
import {apply} from './index.js';

const events=[];
const add=(type,data,surfaceOp)=>events.push({type,data,seq:events.length,time:1,...(surfaceOp?{surfaceOp}:{})});
for (let turn=1; turn<=2; turn++) {
  add('turn/start',{turn});
  add('step/start',{turn,step:1});
  add('request/header',{header:{config:{provider:'fixture',model:`m${turn}`}},reason:turn===1?'initial':'change'});
  add('user/message',{id:`u${turn}`,role:'user',source:{kind:'user'},content:[{type:'text',text:`Question ${turn}`},{type:'text',text:'More'}]},'append');
  add('assistant/message',{turn,step:1,stream:[],message:{id:`a${turn}`,role:'assistant',source:{kind:'model',provider:'fixture',model:`m${turn}`},content:[{type:'text',text:`Answer ${turn}`}]}},'append');
  add('step/end',{turn,step:1});
  add('turn/end',{turn,reason:{kind:'completed'}});
}
const snapshot={events,session:{id:'source'}};
const original=structuredClone(snapshot);
let command, request, child, output, log=[], queued=[], childPermission='default';
const sourceSession={snapshotEvents:()=>snapshot.events};
const agent={id:'source'};
const ctx={
  commands:{register(def){command=def;return()=>{};}},tools:{register(){return()=>{};}},effect(fn){fn();},
  sessionQuery:{readSession:async id=>{assert.equal(id,agent.id);return snapshot;}},get:name=>name==='permissionPresets'?{current:session=>session===sourceSession?'default':childPermission}:undefined,
  agents:{create:async options=>{
    request=options;
    log.push('create');
    const session=Session.create(options.sessionId,options.seed,{version:SESSION_FORMAT_VERSION,id:options.sessionId,createdAt:1,...options.meta},options.inheritedEventCount);
    child={session,inbox:{nextTurn:[{id:'inherited'}],nextStep:[],clear(){this.nextTurn=[];log.push('clear');}},followup(message){assert.deepEqual(this.inbox.nextTurn,[]);output=message;queued.push(message);log.push('followup');}};
    await options.setup({},child);
    return {agent:child,dispose:async()=>{log.push('dispose');}};
  }},
  sessions:{get:()=>sourceSession,flush:async()=>{log.push('flush');return true;}},
  workspaceRegistry:{list:()=>[{sessionIds:['source'],attachSession:async()=>{log.push('attach');}}]},
};
apply(ctx);
async function call(input){return command.handler({agent,rawInput:JSON.stringify(input),signal:new AbortController().signal});}
const read=await call({action:'read-user',messageId:'u1'});
assert.equal(JSON.parse(read.text).text,'Question 1\n\nMore');
const preview=await call({action:'preview-user',turnEndSeq:6});
assert.equal(preview.kind,'success');
assert.deepEqual(JSON.parse(preview.text),{ok:true,turn:1,text:'Question 1\n\nMore',turnEndSeq:6,laterTurns:1,latest:false,model:'m1',attachments:0,preserve:{ok:true,laterTurns:1}});
assert.deepEqual(log,[]);
const oldPreview=await call({action:'retry',turnEndSeq:6,laterTurns:0,operationId:'old-preview-01'});
assert.equal(oldPreview.kind,'error');assert.match(oldPreview.text,/重新预览/);assert.deepEqual(log,[]);
const oldLast=await call({action:'reroll',turnEndSeq:6,laterTurns:1,operationId:'old-latest-01'});
assert.equal(oldLast.kind,'error');assert.match(oldLast.text,/最后一轮已变化/);assert.deepEqual(log,[]);
const input={action:'edit-user',turnEndSeq:6,laterTurns:1,expectedText:'Question 1\n\nMore',text:'Rewritten',operationId:'edit-test-01'};
const [first,duplicate]=await Promise.all([call(input),call(input)]);
assert.deepEqual(first,duplicate);
assert.equal(JSON.parse(first.text).accepted,true);
assert.deepEqual(log,['create','clear','flush','attach','followup','flush']);
assert.equal(request.seed.length,2);
assert.equal(request.seed[0].type,'session/end-seed');
assert.equal(request.seed[1].type,'last-word/version');
assert.equal(request.seed[1].ignorable,true);
assert.equal(request.seed[1].data.sessionId,request.sessionId);
assert.equal(request.seed[1].data.effect.targetTurn,1);
assert.equal(request.seed[1].data.effect.operation,'edit');
assert.equal(request.seed[1].data.inverse.sessionId,'source');
assert.equal(request.agentOptions.model,'m1');
assert.notEqual(output.id,'u1');
assert.deepEqual(output.content,[{type:'text',text:'Rewritten'}]);
assert.deepEqual(snapshot,original);
log=[];
const replay={action:'retry',turnEndSeq:6,laterTurns:1,preserve:true};
const unconfirmed=await call({...replay,operationId:'unconfirmed-01'});
assert.equal(unconfirmed.kind,'error');assert.deepEqual(log,[]);
queued=[];
const preserved=JSON.parse((await call({...replay,preserveConfirmed:true,operationId:'preserve-test-01'})).text);
assert.equal(preserved.cascade,'preserve');assert.equal(preserved.queuedTurns,2);
assert.deepEqual(queued.map(message=>message.content[0].text),['Question 1','Question 2']);
assert.equal(new Set(queued.map(message=>message.id)).size,2);
assert.ok(queued.every(message=>!['u1','u2'].includes(message.id)));
log=[];queued=[];childPermission='other';
const denied=JSON.parse((await call({...replay,preserveConfirmed:true,operationId:'denied-preserve-01'})).text);
assert.equal(denied.ok,false);assert.match(denied.error,/权限一致/);assert.deepEqual(queued,[]);
childPermission='default';
const retry=await call({action:'retry',turnEndSeq:6,operationId:'retry-test-01'});
assert.equal(JSON.parse(retry.text).semantics,'retry');
assert.deepEqual(output.content,snapshot.events[3].data.content);
const latest=await call({action:'reroll',operationId:'latest-test-01'});
assert.equal(JSON.parse(latest.text).atSeq,10);
assert.equal(request.seed.length,9);
assert.equal(request.seed.at(-1).type,'last-word/version');
assert.equal(request.agentOptions.model,'m2');
assert.equal(child.session.deriveMessages().at(-1).content[0].text,'Answer 1');
log=[];
const stale=await call({...input,expectedText:'stale',operationId:'stale-test-01'});
assert.equal(stale.kind,'error');assert.match(stale.text,/原文已变化/);assert.deepEqual(log,[]);
snapshot.events[11].data.message.content.push({type:'tool-call',id:'tool-1',name:'tool',arguments:'{}'});
const rejected=await call({action:'reroll',operationId:'tool-test-01'});
assert.equal(rejected.kind,'success');assert.equal(JSON.parse(rejected.text).semantics,'reroll');
assert.ok(request.seed.every(e=>e.seq<7||e.type==='last-word/version'||e.type==='session/end-seed'));
log=[];
const blockedPreview=JSON.parse((await call({action:'preview-user',turnEndSeq:6})).text);
assert.equal(blockedPreview.preserve.ok,false);
const blocked=await call({...replay,preserveConfirmed:true,operationId:'blocked-preserve-01'});
assert.equal(blocked.kind,'error');assert.match(blocked.text,/保留模式拒绝工具回合|工具回合/);assert.deepEqual(log,[]);
const truncate=JSON.parse((await call({action:'retry',turnEndSeq:6,laterTurns:1,operationId:'truncate-after-tool-01'})).text);
assert.equal(truncate.cascade,'truncate');assert.equal(truncate.queuedTurns,1);
console.log('User edit, retry, reroll and preserve checks passed (isolated command/Agent fixture).');
