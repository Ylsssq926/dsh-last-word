import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

// Execute only the pure sidebar projections; no React, DOM or localStorage.
const source=readFileSync(new URL('./client.js',import.meta.url),'utf8');
const [rootOf,project,attentionOf,statusesOf,workspacesOf,searchOf,editable]=runInNewContext(
  `${source}\n[sidebarRoot,sidebarList,sidebarAttention,sidebarStatuses,sidebarWorkspaces,sidebarSearch,editableReply]`,
  {window:{__ModuleLoader__:{load(){}}}}, {timeout:1000});

const byId={
  root:{parentId:undefined,updatedAt:10,running:false,retainedBy:{mainView:1},title:'Root'},
  childA:{parentId:'root',updatedAt:30,running:true,retainedBy:{mainView:2},title:'Alpha branch'},
  childB:{parentId:'root',updatedAt:20,running:false,retainedBy:{},title:'Beta'},
  agent:{parentId:'root',origin:'subagent',retainedBy:{}},
  unrelated:{updatedAt:5,running:false,retainedBy:{},title:'Other'},
};
const list={ids:['root','childA','childB','unrelated'],byId};

assert.equal(rootOf('childA',byId),'root');
assert.equal(rootOf('agent',byId),'agent');
assert.equal(rootOf('missing',byId),'missing');
assert.ok(['a','b'].includes(rootOf('a',{a:{parentId:'b'},b:{parentId:'a'}})));

const norm=v=>JSON.parse(JSON.stringify(v));
const normMap=m=>norm(Object.fromEntries(Array.from(m)));
const grouped=norm(project(list));
assert.deepEqual(grouped.ids,['root','unrelated']);
assert.equal(grouped.byId.root.updatedAt,30);
assert.equal(grouped.byId.root.running,true);
assert.equal(grouped.byId.root.retainedBy.mainView,3);
assert.equal(grouped.byId.agent.origin,'subagent');
assert.equal(list.byId.root.retainedBy.mainView,1);

const workspaces={items:[{title:'W',sessionIds:['root','childA','unrelated']}],pinnedSessionIds:['childA','root'],archivedSessionIds:['childB']};
const projectedWorkspaces=norm(workspacesOf(workspaces,list));
assert.deepEqual(projectedWorkspaces.items[0].sessionIds,['root','unrelated']);
assert.deepEqual(projectedWorkspaces.pinnedSessionIds,['root']);
assert.deepEqual(projectedWorkspaces.archivedSessionIds,[]);

const statuses=new Map([['childA',{pendingInteraction:{kind:'approval'}}],['childB',{completionUnread:true,running:false}]]);
const attention=normMap(attentionOf(statuses,list,{archivedSessionIds:[]}));
assert.deepEqual(attention.root,{pending:{id:'childA',interaction:{kind:'approval'}},completed:'childB'});
const groupedStatuses=normMap(statusesOf(new Map([['root',{running:false}],['childA',{running:true}],['childB',{completionUnread:true}]]),list,new Map(Object.entries(attention)),{archivedSessionIds:[]}));
assert.equal(groupedStatuses.root.running,true);
assert.equal(groupedStatuses.root.completionUnread,true);
assert.deepEqual(groupedStatuses.root.pendingInteraction,{kind:'approval'});

const targets=new Map();
const result=norm(searchOf({items:[{sessionId:'childA',snippet:'hit'}],hasMore:false},list,{items:[],archivedSessionIds:[]},'default','alpha',targets));
assert.deepEqual(result.items,[{sessionId:'root',snippet:'hit'}]);
assert.equal(targets.get('root'),'childA');
const noQuery=norm(searchOf({items:[{sessionId:'childB'}],hasMore:false},list,{items:[],archivedSessionIds:[]},'default','',new Map()));
assert.deepEqual(noQuery.items,[{sessionId:'root'}]);

const replyEvents=[
  {type:'turn/start',seq:0,data:{turn:1}},
  {type:'assistant/message',seq:1,surfaceOp:'append',data:{turn:1,step:1,message:{id:'mid',role:'assistant',content:[{type:'text',text:'step one'}]}}},
  {type:'assistant/message',seq:2,surfaceOp:'append',data:{turn:1,step:2,message:{id:'final',role:'assistant',content:[{type:'reasoning',text:'想一想'},{type:'text',text:'结论'}]}}},
  {type:'turn/end',seq:3,data:{turn:1,reason:{kind:'completed'}}},
];
assert.deepEqual(norm(editable(replyEvents,'final')),{text:'结论',reasoning:'想一想'});
assert.match(editable(replyEvents,'mid').error,/最终回复/);
assert.equal(editable(replyEvents,'missing'),null);
const reasoningOnly=[
  {type:'assistant/message',seq:0,surfaceOp:'append',data:{turn:1,step:1,message:{id:'r',role:'assistant',content:[{type:'reasoning',text:'只有思考'}]}}},
  {type:'turn/end',seq:1,data:{turn:1,reason:{kind:'completed'}}},
];
assert.deepEqual(norm(editable(reasoningOnly,'r')),{text:'',reasoning:'只有思考'});
const toolReply=[{type:'assistant/message',seq:0,surfaceOp:'append',data:{turn:1,step:1,message:{id:'t',role:'assistant',content:[{type:'tool-call',id:'c',name:'x',arguments:'{}'}]}}}];
assert.match(editable(toolReply,'t').error,/工具调用/);
const interrupted=[
  {type:'assistant/message',seq:0,surfaceOp:'append',data:{turn:1,step:1,interrupted:true,message:{id:'i',role:'assistant',content:[{type:'text',text:'半截'}]}}},
  {type:'turn/end',seq:1,data:{turn:1,reason:{kind:'aborted'}}},
];
assert.match(editable(interrupted,'i').error,/被打断/);
const aborted=[
  {type:'assistant/message',seq:0,surfaceOp:'append',data:{turn:1,step:1,message:{id:'a',role:'assistant',content:[{type:'text',text:'完整但被中止'}]}}},
  {type:'turn/end',seq:1,data:{turn:1,reason:{kind:'aborted'}}},
];
assert.match(editable(aborted,'a').error,/尚未正常结束/);
const truncated=[{type:'assistant/message',seq:9,surfaceOp:'append',data:{turn:7,step:1,message:{id:'old',role:'assistant',content:[{type:'text',text:'旧回复'}]}}}];
assert.deepEqual(norm(editable(truncated,'old')),{text:'旧回复',reasoning:''});
const empty=[
  {type:'assistant/message',seq:0,surfaceOp:'append',data:{turn:1,step:1,message:{id:'e',role:'assistant',content:[]}}},
  {type:'turn/end',seq:1,data:{turn:1,reason:{kind:'completed'}}},
];
assert.equal(editable(empty,'e'),null);

console.log('Sidebar family projections passed: root folding, subagent filtering, activity merge, workspace originals, attention aggregation, search grouping and reply editability pre-check.');