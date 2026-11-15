import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

// Execute only the pure ring projections and the store factory; no React or DOM.
const source=readFileSync(new URL('./client.js',import.meta.url),'utf8');
const [rootOf,ringFor,makeTreeStore]=runInNewContext(
  `${source}\n[versionRootOf,ringFor,makeTreeStore]`,
  {window:{__ModuleLoader__:{load(){}}}}, {timeout:1000});
const norm=v=>JSON.parse(JSON.stringify(v));
const tick=()=>new Promise(resolve=>setImmediate(resolve));

const versions=[
  {sessionId:'r',createdAt:1},
  {sessionId:'a',parentSessionId:'r',targetTurn:1,createdAt:2},
  {sessionId:'b',parentSessionId:'r',targetTurn:1,createdAt:3},
  {sessionId:'c',parentSessionId:'b',targetTurn:1,createdAt:4},
  {sessionId:'d',parentSessionId:'c',targetTurn:2,createdAt:5},
];
assert.equal(rootOf(versions,'d'),'r');
assert.equal(rootOf(versions,'r'),'r');
assert.equal(rootOf(versions,'missing'),'missing');
assert.equal(rootOf([{sessionId:'x',parentSessionId:'y'},{sessionId:'y',parentSessionId:'x'}],'x'),'y');

const ringB=norm(ringFor(versions,'b',1));
assert.deepEqual(ringB.alternatives.map(v=>v.sessionId),['r','a','b','c']);
assert.equal(ringB.index,2);
const ringR=norm(ringFor(versions,'r',1));
assert.equal(ringR.index,0);
assert.equal(ringR.alternatives.length,4);
// Viewing a later-turn version: the ring for turn 1 walks up to the turn-1 fork.
const ringD=norm(ringFor(versions,'d',1));
assert.deepEqual(ringD.alternatives.map(v=>v.sessionId),['r','a','b','c']);
assert.equal(ringD.index,3);
// Turn 2 has its own two-alternative ring: the base c and the edit d.
const ringD2=norm(ringFor(versions,'d',2));
assert.deepEqual(ringD2.alternatives.map(v=>v.sessionId),['c','d']);
assert.equal(ringD2.index,1);
assert.equal(ringFor(versions,'r',2),null);
assert.equal(ringFor(null,'r',1),null);
assert.equal(ringFor(versions,'missing',1),null);
assert.equal(ringFor([versions[0]],'r',1),null);
// Deleted versions bridge the walk but never appear; survivors renumber.
const withGhost=versions.map(v=>v.sessionId==='a'?{...v,deleted:true}:v);
const ringGhost=norm(ringFor(withGhost,'b',1));
assert.deepEqual(ringGhost.alternatives.map(v=>v.sessionId),['r','b','c']);
assert.equal(ringGhost.index,1);
// Tie-break on equal createdAt is stable by id.
const tie=[{sessionId:'r',createdAt:1},{sessionId:'z',parentSessionId:'r',targetTurn:1,createdAt:2},{sessionId:'y',parentSessionId:'r',targetTurn:1,createdAt:2}];
assert.deepEqual(norm(ringFor(tie,'r',1)).alternatives.map(v=>v.sessionId),['r','y','z']);

let clock=1000;
const loads=[];
let resolveLoad;
const store=makeTreeStore(sessionId=>{loads.push(sessionId);return new Promise(resolve=>{resolveLoad=resolve;});},()=>clock);
store.ensure('b');
store.ensure('b');
assert.deepEqual(loads,['b']);
assert.equal(store.get('b').loading,true);
resolveLoad(versions);
await tick();
const entry=store.get('b');
assert.equal(entry.loading,false);
assert.equal(entry.rootId,'r');
assert.equal(store.get('a'),entry);
assert.equal(store.get('r'),entry);
assert.equal(store.get('d'),entry);
// Fresh cache: no reload before the revalidate window.
store.ensure('a');
assert.deepEqual(loads,['b']);
clock+=8001;
store.ensure('a');
assert.deepEqual(loads,['b','a']);
resolveLoad(versions);
await tick();
// Failure keeps the stale versions and surfaces the error.
clock+=8001;
let rejectLoad;
const failing=makeTreeStore(()=>{loads.push('fail');return new Promise((_,reject)=>{rejectLoad=reject;});},()=>clock);
failing.setTree('b',versions,clock);
clock+=8001;
failing.ensure('b');
rejectLoad(new Error('catalog down'));
await tick();
assert.equal(failing.get('b').versions.length,5);
assert.match(failing.get('b').error,/catalog down/);
assert.equal(failing.get('b').loading,false);
// invalidate marks the root stale and reloads; a newer root write wins.
loads.length=0;
const store2=makeTreeStore(async sessionId=>{loads.push(sessionId);return versions;},()=>clock);
store2.setTree('b',versions,clock);
store2.invalidate('b');
await tick();
assert.deepEqual(loads,['b']);
const newerVersions=versions.map(v=>v.sessionId==='r'?{...v,createdAt:99}:v);
store2.setTree('b',newerVersions,clock+10);
store2.setTree('b',versions,clock);
assert.equal(store2.get('b').versions[0].createdAt,99);
// Subscribers fire on set and unsubscribe cleanly.
let notified=0;
const unsubscribe=store2.subscribe(()=>{notified++;});
store2.setTree('b',versions,clock+20);
assert.equal(notified,1);
unsubscribe();
store2.setTree('b',versions,clock+30);
assert.equal(notified,1);
console.log('Version ring checks passed: fork walk, later-turn skip, ghost renumbering, stable order, SWR dedupe/revalidate/stale-on-error and invalidation.');