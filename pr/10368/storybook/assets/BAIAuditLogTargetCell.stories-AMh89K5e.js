import{d as Ie,c as O,b as Ce,j as l,B as b}from"./iframe-rxKG3YPh.js";import{R as _e}from"./RelayResolver-whc7fyhO.js";import{B as L}from"./BAIFlex-Bj-hmFu1.js";import{B as Ke}from"./BAIId-DMMrF-Lq.js";import{r as w}from"./index-DXqkIkaD.js";import{m as Fe}from"./map-CxuH46px.js";import{i as be}from"./isEmpty-HiZhLKpj.js";import{B as Se}from"./Badge-DL6_UHGo.js";import{T as Le}from"./Token-B2EYTJoM.js";import"./preload-helper-Dp1pzeXC.js";import"./index-Csj44ol3.js";import"./index-oq4NE4p-.js";import"./isNumber-DGfM64Vb.js";import"./toString-S3lMcKuw.js";import"./isSymbol-T0gxfVAc.js";import"./filter-D3AXoxKG.js";import"./_baseEach-CbM9ACgD.js";import"./get-CTbPpCgG.js";import"./_baseGet-9yaASENx.js";import"./identity-DKeuBCMA.js";import"./useInteractiveRole-Cxt8xyJv.js";import"./composeEventHandlers-BolWE7qY.js";/**
 * @license lucide-react v1.37.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ne=[["path",{d:"M8 3 4 7l4 4",key:"9rb6wj"}],["path",{d:"M4 7h16",key:"6tx8e3"}],["path",{d:"m16 21 4-4-4-4",key:"siv7j2"}],["path",{d:"M20 17H4",key:"h6l3hr"}]],Ve=Ie("arrow-left-right",Ne);/**
 * @license lucide-react v1.37.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const je=[["path",{d:"m15 10 5 5-5 5",key:"qqa56n"}],["path",{d:"M4 4v7a4 4 0 0 0 4 4h12",key:"z08zvw"}]],Be=Ie("corner-down-right",je),Te=(function(){var n=[{alias:null,args:null,kind:"ScalarField",name:"name",storageKey:null}],e=[{alias:null,args:null,kind:"ScalarField",name:"configName",storageKey:null}];return{argumentDefinitions:[],kind:"Fragment",metadata:null,name:"BAIAuditLogTargetCellEntityFragment",selections:[{alias:null,args:null,kind:"ScalarField",name:"__typename",storageKey:null},{kind:"InlineFragment",selections:[{alias:null,args:null,concreteType:"UserV2BasicInfo",kind:"LinkedField",name:"basicInfo",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"email",storageKey:null}],storageKey:null}],type:"UserV2",abstractKey:null},{kind:"InlineFragment",selections:[{alias:null,args:null,concreteType:"ProjectBasicInfo",kind:"LinkedField",name:"basicInfo",plural:!1,selections:n,storageKey:null}],type:"ProjectV2",abstractKey:null},{kind:"InlineFragment",selections:[{alias:null,args:null,concreteType:"DomainBasicInfo",kind:"LinkedField",name:"basicInfo",plural:!1,selections:n,storageKey:null}],type:"DomainV2",abstractKey:null},{kind:"InlineFragment",selections:[{alias:null,args:null,concreteType:"ImageV2IdentityInfo",kind:"LinkedField",name:"identity",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"canonicalName",storageKey:null}],storageKey:null}],type:"ImageV2",abstractKey:null},{kind:"InlineFragment",selections:[{alias:null,args:null,concreteType:"SessionV2MetadataInfo",kind:"LinkedField",name:"metadata",plural:!1,selections:n,storageKey:null}],type:"SessionV2",abstractKey:null},{kind:"InlineFragment",selections:[{alias:null,args:null,concreteType:"ModelDeploymentMetadata",kind:"LinkedField",name:"metadata",plural:!1,selections:n,storageKey:null}],type:"ModelDeployment",abstractKey:null},{kind:"InlineFragment",selections:[{alias:null,args:null,concreteType:"VFolderMetadataInfo",kind:"LinkedField",name:"metadata",plural:!1,selections:n,storageKey:null}],type:"VFolder",abstractKey:null},{kind:"InlineFragment",selections:[{alias:"vfolderName",args:null,kind:"ScalarField",name:"name",storageKey:null}],type:"VirtualFolderNode",abstractKey:null},{kind:"InlineFragment",selections:[{alias:"sessionName",args:null,kind:"ScalarField",name:"name",storageKey:null}],type:"ComputeSessionNode",abstractKey:null},{kind:"InlineFragment",selections:[{alias:null,args:null,kind:"ScalarField",name:"registryName",storageKey:null}],type:"ContainerRegistryV2",abstractKey:null},{kind:"InlineFragment",selections:e,type:"AppConfigAllowList",abstractKey:null},{kind:"InlineFragment",selections:e,type:"AppConfigDefinition",abstractKey:null},{kind:"InlineFragment",selections:e,type:"AppConfigFragment",abstractKey:null},{kind:"InlineFragment",selections:[{alias:null,args:null,kind:"ScalarField",name:"namespace",storageKey:null}],type:"StorageNamespace",abstractKey:null},{kind:"InlineFragment",selections:n,type:"Artifact",abstractKey:null},{kind:"InlineFragment",selections:n,type:"ArtifactRegistry",abstractKey:null},{kind:"InlineFragment",selections:n,type:"NotificationChannel",abstractKey:null},{kind:"InlineFragment",selections:n,type:"NotificationRule",abstractKey:null},{kind:"InlineFragment",selections:n,type:"ResourceGroup",abstractKey:null},{kind:"InlineFragment",selections:n,type:"Role",abstractKey:null},{kind:"InlineFragment",selections:n,type:"IdleChecker",abstractKey:null},{kind:"InlineFragment",selections:n,type:"ObjectStorage",abstractKey:null},{kind:"InlineFragment",selections:n,type:"RuntimeVariant",abstractKey:null},{kind:"InlineFragment",selections:n,type:"RuntimeVariantPreset",abstractKey:null},{kind:"InlineFragment",selections:n,type:"VFSStorage",abstractKey:null}],type:"EntityNode",abstractKey:"__isEntityNode"}})();Te.hash="b88668cafeb16e593701d68030e4d77c";const Ae=(function(){var n={alias:null,args:null,concreteType:null,kind:"LinkedField",name:"entity",plural:!1,selections:[{args:null,kind:"FragmentSpread",name:"BAIAuditLogTargetCellEntityFragment"}],storageKey:null};return{argumentDefinitions:[],kind:"Fragment",metadata:null,name:"BAIAuditLogTargetCellFragment",selections:[{alias:null,args:null,kind:"ScalarField",name:"actionId",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"actionKind",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"entityType",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"entityId",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"targetEntityId",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"lookupKind",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"lookupKey",storageKey:null},n,{alias:null,args:[{kind:"Literal",name:"first",value:3},{kind:"Literal",name:"orderBy",value:[{direction:"ASC",field:"SCOPE_TYPE"},{direction:"ASC",field:"SCOPE_ID"}]}],concreteType:"AuditLogScopeEntryConnection",kind:"LinkedField",name:"scopes",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"count",storageKey:null},{alias:null,args:null,concreteType:"AuditLogScopeEntryEdge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"AuditLogScopeEntry",kind:"LinkedField",name:"node",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"scopeType",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"scopeId",storageKey:null},n],storageKey:null}],storageKey:null}],storageKey:'scopes(first:3,orderBy:[{"direction":"ASC","field":"SCOPE_TYPE"},{"direction":"ASC","field":"SCOPE_ID"}])'}],type:"AuditLogV2",abstractKey:null}})();Ae.hash="98192e0980f534542b04338fc3a1330c";const xe=n=>{const e={entityType:n.entityType||null,entityId:n.entityId||null},i=Math.max(n.scopeCount-n.scopes.length,0);switch(n.actionKind){case"SINGLE_ENTITY":return{kind:"singleEntity",...e};case"BULK":return{kind:"bulk",...e};case"SCOPE":return{kind:"scope",...e,scopes:n.scopes,hiddenScopeCount:i};case"RELATION":{const[d,c]=n.scopes;return n.scopes.length>=2?{kind:"relation",from:d,to:c}:{kind:"incompleteRelation",scopes:n.scopes,hiddenScopeCount:i}}case"MEMBERSHIP":return{kind:"membership",...e,scope:n.scopes[0]??null};case"GLOBAL":return{kind:"global"};case"LOOKUP":return{kind:"lookup",...e,lookupKind:n.lookupKind||null,lookupKey:n.lookupKey||null};default:return{kind:"legacy",...e}}},Re=n=>{switch(n.__typename){case"UserV2":return n.basicInfo.email;case"ProjectV2":case"DomainV2":return n.basicInfo.name;case"ImageV2":return n.identity.canonicalName;case"SessionV2":case"ModelDeployment":case"VFolder":return n.metadata.name;case"VirtualFolderNode":return n.vfolderName;case"ComputeSessionNode":return n.sessionName;case"ContainerRegistryV2":return n.registryName;case"AppConfigAllowList":case"AppConfigDefinition":case"AppConfigFragment":return n.configName;case"StorageNamespace":return n.namespace;case"Artifact":case"ArtifactRegistry":case"NotificationChannel":case"NotificationRule":case"ResourceGroup":case"Role":case"IdleChecker":case"ObjectStorage":case"RuntimeVariant":case"RuntimeVariantPreset":case"VFSStorage":return n.name;default:return null}},S=n=>{"use memo";const e=O.c(11),{entityType:i,entityId:d,entityFrgmt:c}=n;let s;e[0]===Symbol.for("react.memo_cache_sentinel")?(s=Te,e[0]=s):s=e[0];const u=w.useFragment(s,c??null);let t;e[1]!==u?(t=u?Re(u):null,e[1]=u,e[2]=t):t=e[2];const o=t,k=i||(u==null?void 0:u.__typename);if(!o&&!d&&!k)return"-";let a;e[3]!==k?(a=k?l.jsx(Le,{label:k}):null,e[3]=k,e[4]=a):a=e[4];let m;e[5]!==d||e[6]!==o?(m=o?l.jsx(b,{ellipsis:{tooltip:!0},style:{maxWidth:200},children:o}):d?l.jsx(Ke,{uuid:d}):null,e[5]=d,e[6]=o,e[7]=m):m=e[7];let f;return e[8]!==a||e[9]!==m?(f=l.jsxs(L,{gap:"xs",children:[a,m]}),e[8]=a,e[9]=m,e[10]=f):f=e[10],f},P=n=>{"use memo";const e=O.c(8),{scopes:i,hiddenScopeCount:d}=n,c=d===void 0?0:d;if(be(i))return null;let s;e[0]===Symbol.for("react.memo_cache_sentinel")?(s=l.jsx(Be,{size:"1em"}),e[0]=s):s=e[0];let u;e[1]!==i?(u=Fe(i,Pe),e[1]=i,e[2]=u):u=e[2];let t;e[3]!==c?(t=c>0?l.jsx(Se,{label:`+${c}`}):null,e[3]=c,e[4]=t):t=e[4];let o;return e[5]!==u||e[6]!==t?(o=l.jsxs(L,{gap:"xs",wrap:"wrap",children:[s,u,t]}),e[5]=u,e[6]=t,e[7]=o):o=e[7],o},he=n=>{"use memo";const e=O.c(42),{auditLogFrgmt:i,runCount:d}=n,c=d===void 0?1:d,{t:s}=Ce();let u;e[0]===Symbol.for("react.memo_cache_sentinel")?(u=Ae,e[0]=u):u=e[0];const t=w.useFragment(u,i);let o;if(e[1]!==t.actionId||e[2]!==t.actionKind||e[3]!==t.entity||e[4]!==t.entityId||e[5]!==t.entityType||e[6]!==t.lookupKey||e[7]!==t.lookupKind||e[8]!==t.scopes.count||e[9]!==t.scopes.edges||e[10]!==t.targetEntityId||e[11]!==c||e[12]!==s){const a=xe({actionKind:t.actionKind,entityType:t.entityType,entityId:t.targetEntityId??t.entityId,lookupKind:t.lookupKind,lookupKey:t.lookupKey,scopes:Fe(t.scopes.edges,"node"),scopeCount:t.scopes.count});let m;e[14]!==t.entity?(m=(r,y)=>y?l.jsx(S,{entityType:r,entityId:y,entityFrgmt:t.entity}):null,e[14]=t.entity,e[15]=m):m=e[15];const f=m;e:switch(a.kind){case"legacy":{o=a.entityType||a.entityId?l.jsx(S,{entityType:a.entityType,entityId:a.entityId}):"-";break e}case"singleEntity":{o=f(a.entityType,a.entityId)??"-";break e}case"bulk":{let r;e[16]!==s?(r=s("comp:BAIAuditLogTargetCell.Run"),e[16]=s,e[17]=r):r=e[17];let y;e[18]!==r?(y=l.jsx(b,{type:"secondary",children:r}),e[18]=r,e[19]=y):y=e[19];let p;e[20]!==t.actionId?(p=l.jsx(Ke,{uuid:t.actionId}),e[20]=t.actionId,e[21]=p):p=e[21];let I;e[22]!==c||e[23]!==s?(I=c>1?l.jsx(Se,{label:s("comp:BAIAuditLogTargetCell.InThisRun",{count:c})}):null,e[22]=c,e[23]=s,e[24]=I):I=e[24];let K;e[25]!==y||e[26]!==p||e[27]!==I?(K=l.jsxs(L,{gap:"xs",children:[y,p,I]}),e[25]=y,e[26]=p,e[27]=I,e[28]=K):K=e[28],o=l.jsxs(l.Fragment,{children:[f(a.entityType,a.entityId)??"-",K]});break e}case"scope":{o=l.jsxs(l.Fragment,{children:[f(a.entityType,a.entityId)??l.jsx(b,{type:"secondary",children:s("comp:BAIAuditLogTargetCell.NoAffectedEntity")}),l.jsx(P,{scopes:a.scopes,hiddenScopeCount:a.hiddenScopeCount})]});break e}case"relation":{let r;e[29]===Symbol.for("react.memo_cache_sentinel")?(r=l.jsx(Ve,{size:"1em"}),e[29]=r):r=e[29],o=l.jsxs(L,{gap:"xs",wrap:"wrap",children:[l.jsx(S,{entityType:a.from.scopeType,entityId:a.from.scopeId,entityFrgmt:a.from.entity}),r,l.jsx(S,{entityType:a.to.scopeType,entityId:a.to.scopeId,entityFrgmt:a.to.entity})]});break e}case"incompleteRelation":{o=be(a.scopes)?"-":l.jsx(P,{scopes:a.scopes,hiddenScopeCount:a.hiddenScopeCount});break e}case"membership":{o=l.jsxs(l.Fragment,{children:[f(a.entityType,a.entityId)??"-",a.scope?l.jsx(P,{scopes:[a.scope]}):null]});break e}case"global":{let r;e[30]!==s?(r=s("comp:BAIAuditLogTargetCell.Global"),e[30]=s,e[31]=r):r=e[31];let y;e[32]!==r?(y=l.jsx(Le,{label:r}),e[32]=r,e[33]=y):y=e[33],o=y;break e}case"lookup":{let r;e[34]===Symbol.for("react.memo_cache_sentinel")?(r={tooltip:!0},e[34]=r):r=e[34];const y=`${a.lookupKind??"-"}: ${a.lookupKey??"-"}`;let p;e[35]!==y?(p=l.jsx(b,{monospace:!0,ellipsis:r,children:y}),e[35]=y,e[36]=p):p=e[36];const I=f(a.entityType,a.entityId)??l.jsx(b,{type:"secondary",children:s("comp:BAIAuditLogTargetCell.NotFound")});let K;e[37]!==p||e[38]!==I?(K=l.jsxs(l.Fragment,{children:[p,I]}),e[37]=p,e[38]=I,e[39]=K):K=e[39],o=K}}e[1]=t.actionId,e[2]=t.actionKind,e[3]=t.entity,e[4]=t.entityId,e[5]=t.entityType,e[6]=t.lookupKey,e[7]=t.lookupKind,e[8]=t.scopes.count,e[9]=t.scopes.edges,e[10]=t.targetEntityId,e[11]=c,e[12]=s,e[13]=o}else o=e[13];let k;return e[40]!==o?(k=l.jsx(L,{direction:"column",align:"start",gap:"xxs",children:o}),e[40]=o,e[41]=k):k=e[41],k};function Pe(n){return l.jsx(S,{entityType:n.scopeType,entityId:n.scopeId,entityFrgmt:n.entity},n.id)}const Ee=(function(){var n=[{kind:"Literal",name:"first",value:1}],e={alias:null,args:null,kind:"ScalarField",name:"name",storageKey:null},i=[e],d=[{alias:null,args:null,kind:"ScalarField",name:"configName",storageKey:null}],c={alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null},s={alias:null,args:null,concreteType:null,kind:"LinkedField",name:"entity",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"__typename",storageKey:null},{kind:"TypeDiscriminator",abstractKey:"__isEntityNode"},{kind:"InlineFragment",selections:[{alias:null,args:null,concreteType:"UserV2BasicInfo",kind:"LinkedField",name:"basicInfo",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"email",storageKey:null}],storageKey:null}],type:"UserV2",abstractKey:null},{kind:"InlineFragment",selections:[{alias:null,args:null,concreteType:"ProjectBasicInfo",kind:"LinkedField",name:"basicInfo",plural:!1,selections:i,storageKey:null}],type:"ProjectV2",abstractKey:null},{kind:"InlineFragment",selections:[{alias:null,args:null,concreteType:"DomainBasicInfo",kind:"LinkedField",name:"basicInfo",plural:!1,selections:i,storageKey:null}],type:"DomainV2",abstractKey:null},{kind:"InlineFragment",selections:[{alias:null,args:null,concreteType:"ImageV2IdentityInfo",kind:"LinkedField",name:"identity",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"canonicalName",storageKey:null}],storageKey:null}],type:"ImageV2",abstractKey:null},{kind:"InlineFragment",selections:[{alias:null,args:null,concreteType:"SessionV2MetadataInfo",kind:"LinkedField",name:"metadata",plural:!1,selections:i,storageKey:null}],type:"SessionV2",abstractKey:null},{kind:"InlineFragment",selections:[{alias:null,args:null,concreteType:"ModelDeploymentMetadata",kind:"LinkedField",name:"metadata",plural:!1,selections:i,storageKey:null}],type:"ModelDeployment",abstractKey:null},{kind:"InlineFragment",selections:[{alias:null,args:null,concreteType:"VFolderMetadataInfo",kind:"LinkedField",name:"metadata",plural:!1,selections:i,storageKey:null}],type:"VFolder",abstractKey:null},{kind:"InlineFragment",selections:[{alias:"vfolderName",args:null,kind:"ScalarField",name:"name",storageKey:null}],type:"VirtualFolderNode",abstractKey:null},{kind:"InlineFragment",selections:[{alias:"sessionName",args:null,kind:"ScalarField",name:"name",storageKey:null}],type:"ComputeSessionNode",abstractKey:null},{kind:"InlineFragment",selections:[{alias:null,args:null,kind:"ScalarField",name:"registryName",storageKey:null}],type:"ContainerRegistryV2",abstractKey:null},{kind:"InlineFragment",selections:d,type:"AppConfigAllowList",abstractKey:null},{kind:"InlineFragment",selections:d,type:"AppConfigDefinition",abstractKey:null},{kind:"InlineFragment",selections:d,type:"AppConfigFragment",abstractKey:null},{kind:"InlineFragment",selections:[{alias:null,args:null,kind:"ScalarField",name:"namespace",storageKey:null}],type:"StorageNamespace",abstractKey:null},{kind:"InlineFragment",selections:i,type:"Artifact",abstractKey:null},{kind:"InlineFragment",selections:[e,c],type:"ArtifactRegistry",abstractKey:null},{kind:"InlineFragment",selections:i,type:"NotificationChannel",abstractKey:null},{kind:"InlineFragment",selections:i,type:"NotificationRule",abstractKey:null},{kind:"InlineFragment",selections:i,type:"ResourceGroup",abstractKey:null},{kind:"InlineFragment",selections:i,type:"Role",abstractKey:null},{kind:"InlineFragment",selections:i,type:"IdleChecker",abstractKey:null},{kind:"InlineFragment",selections:i,type:"ObjectStorage",abstractKey:null},{kind:"InlineFragment",selections:i,type:"RuntimeVariant",abstractKey:null},{kind:"InlineFragment",selections:i,type:"RuntimeVariantPreset",abstractKey:null},{kind:"InlineFragment",selections:i,type:"VFSStorage",abstractKey:null},{kind:"InlineFragment",selections:[c],type:"Node",abstractKey:"__isNode"}],storageKey:null};return{fragment:{argumentDefinitions:[],kind:"Fragment",metadata:null,name:"BAIAuditLogTargetCellStoriesQuery",selections:[{alias:null,args:n,concreteType:"AuditLogV2Connection",kind:"LinkedField",name:"adminAuditLogsV2",plural:!1,selections:[{alias:null,args:null,concreteType:"AuditLogV2Edge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"AuditLogV2",kind:"LinkedField",name:"node",plural:!1,selections:[{args:null,kind:"FragmentSpread",name:"BAIAuditLogTargetCellFragment"}],storageKey:null}],storageKey:null}],storageKey:"adminAuditLogsV2(first:1)"}],type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[],kind:"Operation",name:"BAIAuditLogTargetCellStoriesQuery",selections:[{alias:null,args:n,concreteType:"AuditLogV2Connection",kind:"LinkedField",name:"adminAuditLogsV2",plural:!1,selections:[{alias:null,args:null,concreteType:"AuditLogV2Edge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"AuditLogV2",kind:"LinkedField",name:"node",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"actionId",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"actionKind",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"entityType",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"entityId",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"targetEntityId",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"lookupKind",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"lookupKey",storageKey:null},s,{alias:null,args:[{kind:"Literal",name:"first",value:3},{kind:"Literal",name:"orderBy",value:[{direction:"ASC",field:"SCOPE_TYPE"},{direction:"ASC",field:"SCOPE_ID"}]}],concreteType:"AuditLogScopeEntryConnection",kind:"LinkedField",name:"scopes",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"count",storageKey:null},{alias:null,args:null,concreteType:"AuditLogScopeEntryEdge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"AuditLogScopeEntry",kind:"LinkedField",name:"node",plural:!1,selections:[c,{alias:null,args:null,kind:"ScalarField",name:"scopeType",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"scopeId",storageKey:null},s],storageKey:null}],storageKey:null}],storageKey:'scopes(first:3,orderBy:[{"direction":"ASC","field":"SCOPE_TYPE"},{"direction":"ASC","field":"SCOPE_ID"}])'},c],storageKey:null}],storageKey:null}],storageKey:"adminAuditLogsV2(first:1)"}]},params:{cacheID:"007158dbf087ede0623383b8c59c3f65",id:null,metadata:{},name:"BAIAuditLogTargetCellStoriesQuery",operationKind:"query",text:`query BAIAuditLogTargetCellStoriesQuery {
  adminAuditLogsV2(first: 1) {
    edges {
      node {
        ...BAIAuditLogTargetCellFragment
        id
      }
    }
  }
}

fragment BAIAuditLogTargetCellEntityFragment on EntityNode {
  __isEntityNode: __typename
  __typename
  ... on UserV2 {
    basicInfo {
      email
    }
  }
  ... on ProjectV2 {
    basicInfo {
      name
    }
  }
  ... on DomainV2 {
    basicInfo {
      name
    }
  }
  ... on ImageV2 {
    identity {
      canonicalName
    }
  }
  ... on SessionV2 {
    metadata {
      name
    }
  }
  ... on ModelDeployment {
    metadata {
      name
    }
  }
  ... on VFolder {
    metadata {
      name
    }
  }
  ... on VirtualFolderNode {
    vfolderName: name
  }
  ... on ComputeSessionNode {
    sessionName: name
  }
  ... on ContainerRegistryV2 {
    registryName
  }
  ... on AppConfigAllowList {
    configName
  }
  ... on AppConfigDefinition {
    configName
  }
  ... on AppConfigFragment {
    configName
  }
  ... on StorageNamespace {
    namespace
  }
  ... on Artifact {
    name
  }
  ... on ArtifactRegistry {
    name
  }
  ... on NotificationChannel {
    name
  }
  ... on NotificationRule {
    name
  }
  ... on ResourceGroup {
    name
  }
  ... on Role {
    name
  }
  ... on IdleChecker {
    name
  }
  ... on ObjectStorage {
    name
  }
  ... on RuntimeVariant {
    name
  }
  ... on RuntimeVariantPreset {
    name
  }
  ... on VFSStorage {
    name
  }
}

fragment BAIAuditLogTargetCellFragment on AuditLogV2 {
  actionId
  actionKind
  entityType
  entityId
  targetEntityId
  lookupKind
  lookupKey
  entity {
    __typename
    ...BAIAuditLogTargetCellEntityFragment
    ... on Node {
      __isNode: __typename
      id
    }
    ... on ArtifactRegistry {
      id
    }
  }
  scopes(first: 3, orderBy: [{field: SCOPE_TYPE, direction: ASC}, {field: SCOPE_ID, direction: ASC}]) {
    count
    edges {
      node {
        id
        scopeType
        scopeId
        entity {
          __typename
          ...BAIAuditLogTargetCellEntityFragment
          ... on Node {
            __isNode: __typename
            id
          }
          ... on ArtifactRegistry {
            id
          }
        }
      }
    }
  }
}
`}}})();Ee.hash="a803bde9a5650379b39a061cac81e0aa";const rn={title:"Fragments/BAIAuditLogTargetCell",component:he,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:'\n**BAIAuditLogTargetCell** renders the Target column of the audit log table according to the record\'s action kind.\n\n## Per action kind\n- `SINGLE_ENTITY`: the target entity, named when it still exists\n- `BULK`: the target entity, the run id, and how many rows on the page came from the same run\n- `SCOPE`: the affected entity (or "No affected entity") and its scopes\n- `RELATION`: the two linked or unlinked scopes\n- `MEMBERSHIP`: the entity and the scope it joined or left\n- `GLOBAL`: a "Global" token\n- `LOOKUP`: the lookup kind and key, and the entity it resolved to or "Not found"\n- no kind (older records): the raw entity type and id\n\n## Usage\n```tsx\n<BAIAuditLogTargetCell auditLogFrgmt={record} runCount={3} />\n```\n        '}}}},Oe=({runCount:n})=>{var d;const{adminAuditLogsV2:e}=w.useLazyLoadQuery(Ee,{}),i=(d=e==null?void 0:e.edges[0])==null?void 0:d.node;return i?l.jsx(he,{auditLogFrgmt:i,runCount:n}):null},R={id:"scope-project",scopeType:"project",scopeId:"5b2c1f8e-6a3d-4f7b-9c0e-1d2a3b4c5d6e",entity:{__typename:"ProjectV2",basicInfo:{name:"model-store"}}},F={id:"scope-user",scopeType:"user",scopeId:"8f9e0d1c-2b3a-4c5d-8e7f-6a5b4c3d2e1f",entity:{__typename:"UserV2",basicInfo:{email:"user@lablup.com"}}},we={id:"scope-domain",scopeType:"domain",scopeId:"1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d",entity:{__typename:"DomainV2",basicInfo:{name:"default"}}},g=(n,e)=>l.jsx(_e,{mockResolvers:{AuditLogV2:()=>({actionId:"0c1d2e3f-4a5b-4c6d-8e9f-0a1b2c3d4e5f",entityType:null,entityId:null,targetEntityId:null,lookupKind:null,lookupKey:null,entity:null,scopes:{count:0,edges:[]},...n})},children:l.jsx(Oe,{runCount:e})}),T={render:()=>g({actionKind:"SINGLE_ENTITY",entityType:"session",targetEntityId:"3e4f5a6b-7c8d-4e9f-a0b1-c2d3e4f5a6b7",entity:{__typename:"SessionV2",metadata:{name:"my-session"}}})},A={parameters:{docs:{description:{story:"The entity no longer exists, so the cell falls back to the entity type and id."}}},render:()=>g({actionKind:"SINGLE_ENTITY",entityType:"vfolder",targetEntityId:"9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d"})},h={render:()=>g({actionKind:"BULK",entityType:"session",targetEntityId:"3e4f5a6b-7c8d-4e9f-a0b1-c2d3e4f5a6b7",entity:{__typename:"SessionV2",metadata:{name:"batch-01"}}},3)},E={render:()=>g({actionKind:"SCOPE",entityType:"vfolder",targetEntityId:"9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d",entity:{__typename:"VFolder",metadata:{name:"shared-data"}},scopes:{count:5,edges:[{node:we},{node:R},{node:F}]}})},C={render:()=>g({actionKind:"SCOPE",entityType:"vfolder",scopes:{count:1,edges:[{node:R}]}})},_={render:()=>g({actionKind:"RELATION",scopes:{count:2,edges:[{node:R},{node:F}]}})},N={render:()=>g({actionKind:"MEMBERSHIP",entityType:"user",targetEntityId:F.scopeId,entity:F.entity,scopes:{count:1,edges:[{node:R}]}})},V={render:()=>g({actionKind:"GLOBAL",entityType:"global"})},j={render:()=>g({actionKind:"LOOKUP",entityType:"user",lookupKind:"email",lookupKey:"user@lablup.com",targetEntityId:F.scopeId,entity:F.entity})},B={render:()=>g({actionKind:"LOOKUP",entityType:"user",lookupKind:"email",lookupKey:"missing@lablup.com"})},x={parameters:{docs:{description:{story:"A record written before the manager recorded the action kind keeps the raw entity type and id."}}},render:()=>g({actionKind:null,entityType:"session",entityId:"3e4f5a6b-7c8d-4e9f-a0b1-c2d3e4f5a6b7"})};var v,D,M;T.parameters={...T.parameters,docs:{...(v=T.parameters)==null?void 0:v.docs,source:{originalSource:`{
  render: () => withAuditLog({
    actionKind: 'SINGLE_ENTITY',
    entityType: 'session',
    targetEntityId: '3e4f5a6b-7c8d-4e9f-a0b1-c2d3e4f5a6b7',
    entity: {
      __typename: 'SessionV2',
      metadata: {
        name: 'my-session'
      }
    }
  })
}`,...(M=(D=T.parameters)==null?void 0:D.docs)==null?void 0:M.source}}};var G,U,Y;A.parameters={...A.parameters,docs:{...(G=A.parameters)==null?void 0:G.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'The entity no longer exists, so the cell falls back to the entity type and id.'
      }
    }
  },
  render: () => withAuditLog({
    actionKind: 'SINGLE_ENTITY',
    entityType: 'vfolder',
    targetEntityId: '9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d'
  })
}`,...(Y=(U=A.parameters)==null?void 0:U.docs)==null?void 0:Y.source}}};var $,Q,q;h.parameters={...h.parameters,docs:{...($=h.parameters)==null?void 0:$.docs,source:{originalSource:`{
  render: () => withAuditLog({
    actionKind: 'BULK',
    entityType: 'session',
    targetEntityId: '3e4f5a6b-7c8d-4e9f-a0b1-c2d3e4f5a6b7',
    entity: {
      __typename: 'SessionV2',
      metadata: {
        name: 'batch-01'
      }
    }
  }, 3)
}`,...(q=(Q=h.parameters)==null?void 0:Q.docs)==null?void 0:q.source}}};var z,H,W;E.parameters={...E.parameters,docs:{...(z=E.parameters)==null?void 0:z.docs,source:{originalSource:`{
  render: () => withAuditLog({
    actionKind: 'SCOPE',
    entityType: 'vfolder',
    targetEntityId: '9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d',
    entity: {
      __typename: 'VFolder',
      metadata: {
        name: 'shared-data'
      }
    },
    scopes: {
      count: 5,
      edges: [{
        node: domainScope
      }, {
        node: projectScope
      }, {
        node: userScope
      }]
    }
  })
}`,...(W=(H=E.parameters)==null?void 0:H.docs)==null?void 0:W.source}}};var J,X,Z;C.parameters={...C.parameters,docs:{...(J=C.parameters)==null?void 0:J.docs,source:{originalSource:`{
  render: () => withAuditLog({
    actionKind: 'SCOPE',
    entityType: 'vfolder',
    scopes: {
      count: 1,
      edges: [{
        node: projectScope
      }]
    }
  })
}`,...(Z=(X=C.parameters)==null?void 0:X.docs)==null?void 0:Z.source}}};var ee,ne,te;_.parameters={..._.parameters,docs:{...(ee=_.parameters)==null?void 0:ee.docs,source:{originalSource:`{
  render: () => withAuditLog({
    actionKind: 'RELATION',
    scopes: {
      count: 2,
      edges: [{
        node: projectScope
      }, {
        node: userScope
      }]
    }
  })
}`,...(te=(ne=_.parameters)==null?void 0:ne.docs)==null?void 0:te.source}}};var ae,le,ie;N.parameters={...N.parameters,docs:{...(ae=N.parameters)==null?void 0:ae.docs,source:{originalSource:`{
  render: () => withAuditLog({
    actionKind: 'MEMBERSHIP',
    entityType: 'user',
    targetEntityId: userScope.scopeId,
    entity: userScope.entity,
    scopes: {
      count: 1,
      edges: [{
        node: projectScope
      }]
    }
  })
}`,...(ie=(le=N.parameters)==null?void 0:le.docs)==null?void 0:ie.source}}};var se,oe,re;V.parameters={...V.parameters,docs:{...(se=V.parameters)==null?void 0:se.docs,source:{originalSource:`{
  render: () => withAuditLog({
    actionKind: 'GLOBAL',
    entityType: 'global'
  })
}`,...(re=(oe=V.parameters)==null?void 0:oe.docs)==null?void 0:re.source}}};var de,ce,ue;j.parameters={...j.parameters,docs:{...(de=j.parameters)==null?void 0:de.docs,source:{originalSource:`{
  render: () => withAuditLog({
    actionKind: 'LOOKUP',
    entityType: 'user',
    lookupKind: 'email',
    lookupKey: 'user@lablup.com',
    targetEntityId: userScope.scopeId,
    entity: userScope.entity
  })
}`,...(ue=(ce=j.parameters)==null?void 0:ce.docs)==null?void 0:ue.source}}};var ye,pe,me;B.parameters={...B.parameters,docs:{...(ye=B.parameters)==null?void 0:ye.docs,source:{originalSource:`{
  render: () => withAuditLog({
    actionKind: 'LOOKUP',
    entityType: 'user',
    lookupKind: 'email',
    lookupKey: 'missing@lablup.com'
  })
}`,...(me=(pe=B.parameters)==null?void 0:pe.docs)==null?void 0:me.source}}};var ge,ke,fe;x.parameters={...x.parameters,docs:{...(ge=x.parameters)==null?void 0:ge.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'A record written before the manager recorded the action kind keeps the raw entity type and id.'
      }
    }
  },
  render: () => withAuditLog({
    actionKind: null,
    entityType: 'session',
    entityId: '3e4f5a6b-7c8d-4e9f-a0b1-c2d3e4f5a6b7'
  })
}`,...(fe=(ke=x.parameters)==null?void 0:ke.docs)==null?void 0:fe.source}}};const dn=["SingleEntity","SingleEntityDeleted","Bulk","Scope","ScopeWithoutEntity","Relation","Membership","Global","Lookup","LookupMiss","WithoutActionKind"];export{h as Bulk,V as Global,j as Lookup,B as LookupMiss,N as Membership,_ as Relation,E as Scope,C as ScopeWithoutEntity,T as SingleEntity,A as SingleEntityDeleted,x as WithoutActionKind,dn as __namedExportsOrder,rn as default};
