import assert from 'node:assert/strict';
import {Session,SESSION_FORMAT_VERSION} from '@deepseek-ai/dsh-session';
import {branchAsAssistant,branchAsUser,familyFromRecords,ownVersionMarker,resolveAttachSession,stopFamilyTurns,VERSION_EVENT} from './core.js';
import {apply} from './index.js';

const h=(id,parentSession,cwd='C:\\work')=>({header:{id,...(parentSession?{parentSession}:{}),cwd,createdAt:1}});
const records=[h('root'),h('v1','root'),h('v2','root'),h('deep','v1'),h('other-cwd','root','D:\\elsewhere'),h('stranger')];
const family=familyFromRecords(records,'v2');
assert.equal(family.rootId,'root');
assert.deepEqual(family.members.map(m=>m.id).sort(),['deep','root','v1','v2']);
assert.equal(familyFromRecords(records,'root').rootId,'root');
assert.deepEqual(familyFromRecords([{session:{id:'s-root'}},{session:{id:'s-child',parentSession:'s-root',cwd:undefined}}],'s-child').members.map(m=>m.id).sort(),['s-child','s-root']);
assert.deepEqual(familyFromRecords(records,'missing'),{rootId:'missing',members:[]});
const cyclic=[h('a','b'),h('b','a')];
assert.ok(['a','b'].includes(familyFromRecords(cyclic,'a').rootId));

const own={type:VERSION_EVENT,seq:5,time:1,ignorable:true,data:{schemaVersion:1,effect:{operation:'edit',targetTurn:1,targetEventSeq:3,id:'e1'},inverse:{kind:'restore-version',sessionId:'root'},sessionId:'v1'}};
const inherited={...own,seq:1,data:{...own.data,sessionId:'root'}};
assert.equal(ownVersionMarker([inherited,own],'v1').effect.id,'e1');
assert.equal(ownVersionMarker([inherited],'v1'),undefined);
assert.equal(ownVersionMarker([],'v1'),undefined);

const logs={
  root:{events:[],session:{id:'root'}},
  v1:{events:[{...own,data:{...own.data,sessionId:'v1'}}],session:{id:'v1',parentSession:'root'}},
  v2:{events:[{...own,data:{...own.data,sessionId:'v2',effect:{...own.data.effect,targetTurn:2}}}],session:{id:'v2',parentSession:'v1'}},
};
const read=async id=>{if(!logs[id])throw new Error('missing');return logs[id];};
assert.equal(await resolveAttachSession(read,'v1',1),'root');
assert.equal(await resolveAttachSession(read,'v2',2),'v1');
assert.equal(await resolveAttachSession(read,'v2',1),'v2');
assert.equal(await resolveAttachSession(read,'root',1),'root');
assert.equal(await resolveAttachSession(read,'ghost',1),'ghost');
logs.v1.session.parentSession='v2';
assert.equal(await resolveAttachSession(read,'v1',1),'v2');
logs.v1.session.parentSession='root';

const calls=[];
const agents={
  root:{cancel:cause=>calls.push(['cancel','root',cause.kind]),whenIdle:async()=>{calls.push(['idle','root']);}},
  v1:{cancel:()=>{calls.push(['cancel','v1']);throw new Error('already finishing');},whenIdle:async()=>{}},
};
const stopped=await stopFamilyTurns({listSessions:async()=>records,getAgent:id=>agents[id]},'v2');
assert.equal(stopped,1);
assert.deepEqual(calls[0],['cancel','root','user']);
assert.ok(calls.some(c=>c[0]==='cancel'&&c[1]==='v1'));
calls.length=0;
assert.equal(await stopFamilyTurns({listSessions:async()=>{throw new Error('catalog down');},getAgent:id=>agents[id]},'root'),1);
assert.deepEqual(calls,[['cancel','root','user'],['idle','root']]);
assert.equal(await stopFamilyTurns({listSessions:async()=>records,getAgent:()=>{throw new Error('no registry');}},'root'),0);

const events=[];
const add=(type,data,surfaceOp)=>events.push({type,data,seq:events.length,time:1,...(surfaceOp?{surfaceOp}:{})});
const source={kind:'model',provider:'fixture',model:'model'};
add('turn/start',{turn:1});
add('step/start',{turn:1,step:1});
add('request/header',{header:{config:{provider:'fixture',model:'model'}},reason:'initial'});
add('user/message',{id:'u',role:'user',source:{kind:'user'},content:[{type:'text',text:'Original prompt'}]},'append');
add('assistant/message',{turn:1,step:1,stream:[],message:{id:'a-final',role:'assistant',source,content:[{type:'text',text:'Original reply'}]}},'append');
add('step/end',{turn:1,step:1});
add('turn/end',{turn:1,reason:{kind:'completed'}});
const snapshots={source:{events,session:{id:'source',cwd:'C:\\work'}}};
let uid=0;const submitted=[];let lastSession;
const deps={readSession:async id=>{if(!snapshots[id])throw new Error('missing '+id);return snapshots[id];},uuid:()=>`versions-fixture-${++uid}`,
  create:async q=>{const session=Session.create(q.sessionId,q.seed,{version:SESSION_FORMAT_VERSION,id:q.sessionId,createdAt:1,...q.meta},q.inheritedEventCount);
    lastSession=session;
    return {agent:{session,inbox:{nextTurn:[],nextStep:[]},followup:m=>submitted.push(m)},dispose:async()=>{}};},
  flush:async()=>true};
const first=await branchAsAssistant(deps,'source','a-final','第一版','Original reply');
assert.equal(first.ok,true);
snapshots[first.sessionId]={events:lastSession.snapshotEvents(),session:lastSession.header};
const firstTail=lastSession.deriveMessages().at(-1);
assert.equal(firstTail.content[0].text,'第一版');

const second=await branchAsAssistant(deps,first.sessionId,firstTail.id,'第二版','第一版');
assert.equal(second.ok,true);
assert.equal(second.sourceSessionId,first.sessionId);
const secondMarker=ownVersionMarker(lastSession.snapshotEvents(),second.sessionId);
assert.equal(secondMarker.inverse.sessionId,'source');
assert.equal(secondMarker.effect.before,'第一版');
assert.equal(secondMarker.effect.after,'第二版');
assert.equal(secondMarker.effect.targetTurn,1);
assert.equal(lastSession.header.parentSession,'source');
assert.deepEqual(lastSession.snapshotEvents().slice(0,4),events.slice(0,4));
assert.equal(lastSession.deriveMessages().at(-1).content[0].text,'第二版');
snapshots[second.sessionId]={events:lastSession.snapshotEvents(),session:lastSession.header};
const third=await branchAsAssistant(deps,second.sessionId,lastSession.deriveMessages().at(-1).id,'第三版','第二版');
assert.equal(third.ok,true);
assert.equal(lastSession.header.parentSession,'source');

const versionUserEvents=[
  {type:'session/end-seed',seq:0,time:1,data:{inherited:true}},
  {type:VERSION_EVENT,seq:1,time:1,ignorable:true,data:{schemaVersion:1,effect:{operation:'edit',targetTurn:1,targetEventSeq:3,before:'Original prompt',after:'改过的提问',id:'eu1'},inverse:{kind:'restore-version',sessionId:'source'},sessionId:'u-child'}},
  {type:'turn/start',seq:2,time:1,data:{turn:1}},
  {type:'step/start',seq:3,time:1,data:{turn:1,step:1}},
  {type:'request/header',seq:4,time:1,data:{header:{config:{provider:'fixture',model:'model'}},reason:'initial'}},
  {type:'user/message',seq:5,time:1,surfaceOp:'append',data:{id:'u-edited',role:'user',source:{kind:'user'},content:[{type:'text',text:'改过的提问'}]}},
  {type:'assistant/message',seq:6,time:1,surfaceOp:'append',data:{turn:1,step:1,stream:[],message:{id:'a-edited',role:'assistant',source,content:[{type:'text',text:'改过的回答'}]}}},
  {type:'step/end',seq:7,time:1,data:{turn:1,step:1}},
  {type:'turn/end',seq:8,time:1,data:{turn:1,reason:{kind:'completed'}}},
];
snapshots['u-child']={events:versionUserEvents,session:{id:'u-child',parentSession:'source',cwd:'C:\\work'}};
submitted.length=0;
const userEdit=await branchAsUser(deps,'u-child','u-edited','再改一次','改过的提问',undefined,'edit');
assert.equal(userEdit.ok,true);
assert.equal(lastSession.header.parentSession,'source');
assert.equal(submitted.length,1);
assert.equal(submitted[0].content[0].text,'再改一次');
const userMarker=ownVersionMarker(lastSession.snapshotEvents(),userEdit.sessionId);
assert.equal(userMarker.effect.targetEventSeq,3);
assert.equal(userMarker.effect.before,'改过的提问');
assert.equal(userMarker.inverse.sessionId,'source');
submitted.length=0;
const userRetry=await branchAsUser(deps,'u-child','a-edited',undefined,undefined,undefined,'retry');
assert.equal(userRetry.ok,true);
assert.equal(lastSession.header.parentSession,'source');
assert.equal(submitted[0].content[0].text,'改过的提问');

// A turn aborted by stop-before-edit is still regenerable from its prompt;
// the interrupted partial reply itself stays uneditable.
const abortedEvents=[];
const addAborted=(type,data,surfaceOp)=>abortedEvents.push({type,data,seq:abortedEvents.length,time:1,...(surfaceOp?{surfaceOp}:{})});
addAborted('turn/start',{turn:1});
addAborted('step/start',{turn:1,step:1});
addAborted('request/header',{header:{config:{provider:'fixture',model:'model'}},reason:'initial'});
addAborted('user/message',{id:'u-abort',role:'user',source:{kind:'user'},content:[{type:'text',text:'Stop and redo'}]},'append');
addAborted('assistant/message',{turn:1,step:1,stream:[],interrupted:true,message:{id:'a-abort',role:'assistant',source,content:[{type:'text',text:'partial'}]}},'append');
addAborted('step/end',{turn:1,step:1});
addAborted('turn/end',{turn:1,reason:{kind:'aborted'}});
snapshots.aborted={events:abortedEvents,session:{id:'aborted',cwd:'C:\\work'}};
submitted.length=0;
const abortRetry=await branchAsUser(deps,'aborted',undefined,undefined,undefined,undefined,'retry',{turnEndSeq:6});
assert.equal(abortRetry.ok,true);
assert.equal(submitted[0].content[0].text,'Stop and redo');
submitted.length=0;
const abortEdit=await branchAsUser(deps,'aborted',undefined,'New prompt','Stop and redo',undefined,'edit',{turnEndSeq:6});
assert.equal(abortEdit.ok,true);
assert.equal(submitted[0].content[0].text,'New prompt');
await assert.rejects(()=>branchAsAssistant(deps,'aborted','a-abort','x','partial'),/被打断/);

let command;
const unarchived=[];
const registry={archivedSessionIds:[second.sessionId],unarchiveSession:async id=>{unarchived.push(id);registry.archivedSessionIds=registry.archivedSessionIds.filter(x=>x!==id);}};
const ctx={commands:{register(d){command=d;return()=>{};}},tools:{register(){return()=>{};}},effect(f){f();},
  sessionQuery:{listSessions:async()=>[h('source'),h(first.sessionId,'source'),h(second.sessionId,'source'),h('u-child','source')],readSession:async id=>snapshots[id]},
  sessions:{get:()=>undefined},agents:{},get:name=>name==='workspaceRegistry'?registry:undefined};
apply(ctx);
const out=JSON.parse((await command.handler({agent:{id:'source'},rawInput:JSON.stringify({action:'versions'}),signal:new AbortController().signal})).text);
assert.equal(out.ok,true);
assert.equal(out.rootId,'source');
const byId=Object.fromEntries(out.versions.map(v=>[v.sessionId,v]));
assert.equal(byId[first.sessionId].targetTurn,1);
assert.equal(byId[first.sessionId].operation,'edit-reply');
assert.equal(byId[first.sessionId].before,undefined);
assert.equal(byId[second.sessionId].parentSessionId,'source');
assert.equal(byId[second.sessionId].after,undefined);
assert.equal(byId['u-child'].operation,'edit');
assert.equal(byId.source.targetTurn,undefined);
assert.equal(byId[second.sessionId].archived,true);
assert.equal(byId[first.sessionId].archived,undefined);
const signal=new AbortController().signal;
const act=JSON.parse((await command.handler({agent:{id:'source'},rawInput:JSON.stringify({action:'activate',sessionId:second.sessionId}),signal})).text);
assert.deepEqual(act,{ok:true,unarchived:true});
assert.deepEqual(unarchived,[second.sessionId]);
const again=JSON.parse((await command.handler({agent:{id:'source'},rawInput:JSON.stringify({action:'activate',sessionId:second.sessionId}),signal})).text);
assert.deepEqual(again,{ok:true,unarchived:false});
const savedUnarchive=registry.unarchiveSession;
registry.unarchiveSession=undefined;
const noRoute=await command.handler({agent:{id:'source'},rawInput:JSON.stringify({action:'activate',sessionId:first.sessionId}),signal});
assert.equal(noRoute.kind,'error');assert.match(noRoute.text,/取消归档/);
registry.unarchiveSession=savedUnarchive;
console.log('Version checks passed: family assembly, marker ownership, attach-to-original, stop-family tolerance, aborted-turn rerun, versions command, archived flag and activate.');