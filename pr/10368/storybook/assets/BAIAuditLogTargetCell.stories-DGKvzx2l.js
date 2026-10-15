import{d as Le,c as M,b as Be,j as a,B as L}from"./iframe-C6zFqoXc.js";import{R as xe}from"./RelayResolver-CPVzIBJ9.js";import{B as T}from"./BAIFlex-yIO-u8yz.js";import{B as Ae}from"./BAIId-BPrxBY4C.js";import{r as G}from"./index-dgwosyBL.js";import{m as Te}from"./map-05bXPzoP.js";import{i as he}from"./isEmpty-UhMNjMjS.js";import{B as Ee}from"./Badge-DUnIi3y8.js";import{T as Ce}from"./Token-BxiPYBL1.js";import"./preload-helper-Dp1pzeXC.js";import"./index-CxgFLT0y.js";import"./index-CyP17H7R.js";import"./isNumber-BRDm3g2G.js";import"./toString-CVXC3ZH2.js";import"./isSymbol-BGtgU7F1.js";import"./filter-C1cKcoAw.js";import"./_baseEach-Bth7dvEA.js";import"./get-CorlnH8m.js";import"./_baseGet-BWQ5JVFC.js";import"./identity-DKeuBCMA.js";import"./useInteractiveRole-Bu4w5-JP.js";import"./composeEventHandlers-BolWE7qY.js";/**
 * @license lucide-react v1.37.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Re=[["path",{d:"M8 3 4 7l4 4",key:"9rb6wj"}],["path",{d:"M4 7h16",key:"6tx8e3"}],["path",{d:"m16 21 4-4-4-4",key:"siv7j2"}],["path",{d:"M20 17H4",key:"h6l3hr"}]],Pe=Le("arrow-left-right",Re);/**
 * @license lucide-react v1.37.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Oe=[["path",{d:"m15 10 5 5-5 5",key:"qqa56n"}],["path",{d:"M4 4v7a4 4 0 0 0 4 4h12",key:"z08zvw"}]],we=Le("corner-down-right",Oe),_e=(function(){var n=[{alias:null,args:null,kind:"ScalarField",name:"name",storageKey:null}],e=[{alias:null,args:null,kind:"ScalarField",name:"configName",storageKey:null}];return{argumentDefinitions:[],kind:"Fragment",metadata:null,name:"BAIAuditLogTargetCellEntityFragment",selections:[{alias:null,args:null,kind:"ScalarField",name:"__typename",storageKey:null},{kind:"InlineFragment",selections:[{alias:null,args:null,concreteType:"UserV2BasicInfo",kind:"LinkedField",name:"basicInfo",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"email",storageKey:null}],storageKey:null}],type:"UserV2",abstractKey:null},{kind:"InlineFragment",selections:[{alias:null,args:null,concreteType:"ProjectBasicInfo",kind:"LinkedField",name:"basicInfo",plural:!1,selections:n,storageKey:null}],type:"ProjectV2",abstractKey:null},{kind:"InlineFragment",selections:[{alias:null,args:null,concreteType:"DomainBasicInfo",kind:"LinkedField",name:"basicInfo",plural:!1,selections:n,storageKey:null}],type:"DomainV2",abstractKey:null},{kind:"InlineFragment",selections:[{alias:null,args:null,concreteType:"ImageV2IdentityInfo",kind:"LinkedField",name:"identity",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"canonicalName",storageKey:null}],storageKey:null}],type:"ImageV2",abstractKey:null},{kind:"InlineFragment",selections:[{alias:null,args:null,concreteType:"SessionV2MetadataInfo",kind:"LinkedField",name:"metadata",plural:!1,selections:n,storageKey:null}],type:"SessionV2",abstractKey:null},{kind:"InlineFragment",selections:[{alias:null,args:null,concreteType:"ModelDeploymentMetadata",kind:"LinkedField",name:"metadata",plural:!1,selections:n,storageKey:null}],type:"ModelDeployment",abstractKey:null},{kind:"InlineFragment",selections:[{alias:null,args:null,concreteType:"VFolderMetadataInfo",kind:"LinkedField",name:"metadata",plural:!1,selections:n,storageKey:null}],type:"VFolder",abstractKey:null},{kind:"InlineFragment",selections:[{alias:"vfolderName",args:null,kind:"ScalarField",name:"name",storageKey:null}],type:"VirtualFolderNode",abstractKey:null},{kind:"InlineFragment",selections:[{alias:"sessionName",args:null,kind:"ScalarField",name:"name",storageKey:null}],type:"ComputeSessionNode",abstractKey:null},{kind:"InlineFragment",selections:[{alias:null,args:null,kind:"ScalarField",name:"registryName",storageKey:null}],type:"ContainerRegistryV2",abstractKey:null},{kind:"InlineFragment",selections:e,type:"AppConfigAllowList",abstractKey:null},{kind:"InlineFragment",selections:e,type:"AppConfigDefinition",abstractKey:null},{kind:"InlineFragment",selections:e,type:"AppConfigFragment",abstractKey:null},{kind:"InlineFragment",selections:[{alias:null,args:null,kind:"ScalarField",name:"namespace",storageKey:null}],type:"StorageNamespace",abstractKey:null},{kind:"InlineFragment",selections:n,type:"Artifact",abstractKey:null},{kind:"InlineFragment",selections:n,type:"ArtifactRegistry",abstractKey:null},{kind:"InlineFragment",selections:n,type:"NotificationChannel",abstractKey:null},{kind:"InlineFragment",selections:n,type:"NotificationRule",abstractKey:null},{kind:"InlineFragment",selections:n,type:"ResourceGroup",abstractKey:null},{kind:"InlineFragment",selections:n,type:"Role",abstractKey:null},{kind:"InlineFragment",selections:n,type:"IdleChecker",abstractKey:null},{kind:"InlineFragment",selections:n,type:"ObjectStorage",abstractKey:null},{kind:"InlineFragment",selections:n,type:"RuntimeVariant",abstractKey:null},{kind:"InlineFragment",selections:n,type:"RuntimeVariantPreset",abstractKey:null},{kind:"InlineFragment",selections:n,type:"VFSStorage",abstractKey:null}],type:"EntityNode",abstractKey:"__isEntityNode"}})();_e.hash="b88668cafeb16e593701d68030e4d77c";const Ne=(function(){var n={alias:null,args:null,concreteType:null,kind:"LinkedField",name:"entity",plural:!1,selections:[{args:null,kind:"FragmentSpread",name:"BAIAuditLogTargetCellEntityFragment"}],storageKey:null};return{argumentDefinitions:[],kind:"Fragment",metadata:null,name:"BAIAuditLogTargetCellFragment",selections:[{alias:null,args:null,kind:"ScalarField",name:"actionId",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"actionKind",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"entityType",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"entityId",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"targetEntityId",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"lookupKind",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"lookupKey",storageKey:null},n,{alias:null,args:[{kind:"Literal",name:"first",value:3},{kind:"Literal",name:"orderBy",value:[{direction:"ASC",field:"SCOPE_TYPE"},{direction:"ASC",field:"SCOPE_ID"}]}],concreteType:"AuditLogScopeEntryConnection",kind:"LinkedField",name:"scopes",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"count",storageKey:null},{alias:null,args:null,concreteType:"AuditLogScopeEntryEdge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"AuditLogScopeEntry",kind:"LinkedField",name:"node",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"scopeType",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"scopeId",storageKey:null},n],storageKey:null}],storageKey:null}],storageKey:'scopes(first:3,orderBy:[{"direction":"ASC","field":"SCOPE_TYPE"},{"direction":"ASC","field":"SCOPE_ID"}])'}],type:"AuditLogV2",abstractKey:null}})();Ne.hash="98192e0980f534542b04338fc3a1330c";const ve=n=>{switch(n.__typename){case"UserV2":return n.basicInfo.email;case"ProjectV2":case"DomainV2":return n.basicInfo.name;case"ImageV2":return n.identity.canonicalName;case"SessionV2":case"ModelDeployment":case"VFolder":return n.metadata.name;case"VirtualFolderNode":return n.vfolderName;case"ComputeSessionNode":return n.sessionName;case"ContainerRegistryV2":return n.registryName;case"AppConfigAllowList":case"AppConfigDefinition":case"AppConfigFragment":return n.configName;case"StorageNamespace":return n.namespace;case"Artifact":case"ArtifactRegistry":case"NotificationChannel":case"NotificationRule":case"ResourceGroup":case"Role":case"IdleChecker":case"ObjectStorage":case"RuntimeVariant":case"RuntimeVariantPreset":case"VFSStorage":return n.name;default:return null}},A=n=>{"use memo";const e=M.c(11),{entityType:s,entityId:m,entityFrgmt:y}=n;let i;e[0]===Symbol.for("react.memo_cache_sentinel")?(i=_e,e[0]=i):i=e[0];const u=G.useFragment(i,y??null);let t;e[1]!==u?(t=u?ve(u):null,e[1]=u,e[2]=t):t=e[2];const d=t,p=s||(u==null?void 0:u.__typename);if(!d&&!m&&!p)return"-";let c;e[3]!==p?(c=p?a.jsx(Ce,{label:p}):null,e[3]=p,e[4]=c):c=e[4];let k;e[5]!==m||e[6]!==d?(k=d?a.jsx(L,{ellipsis:{tooltip:!0},style:{maxWidth:200},children:d}):m?a.jsx(Ae,{uuid:m}):null,e[5]=m,e[6]=d,e[7]=k):k=e[7];let g;return e[8]!==c||e[9]!==k?(g=a.jsxs(T,{gap:"xs",children:[c,k]}),e[8]=c,e[9]=k,e[10]=g):g=e[10],g},D=n=>{"use memo";const e=M.c(8),{scopes:s,hiddenScopeCount:m}=n,y=m===void 0?0:m;if(he(s))return null;let i;e[0]===Symbol.for("react.memo_cache_sentinel")?(i=a.jsx(we,{size:"1em"}),e[0]=i):i=e[0];let u;e[1]!==s?(u=Te(s,De),e[1]=s,e[2]=u):u=e[2];let t;e[3]!==y?(t=y>0?a.jsx(Ee,{label:`+${y}`}):null,e[3]=y,e[4]=t):t=e[4];let d;return e[5]!==u||e[6]!==t?(d=a.jsxs(T,{gap:"xs",wrap:"wrap",children:[i,u,t]}),e[5]=u,e[6]=t,e[7]=d):d=e[7],d},Ve=n=>{"use memo";const e=M.c(58),{auditLogFrgmt:s,runCount:m}=n,y=m===void 0?1:m,{t:i}=Be();let u;e[0]===Symbol.for("react.memo_cache_sentinel")?(u=Ne,e[0]=u):u=e[0];const t=G.useFragment(u,s),d=t.entityType||null,p=(t.targetEntityId??t.entityId)||null;let c;if(e[1]!==t.actionId||e[2]!==t.actionKind||e[3]!==t.entity||e[4]!==t.lookupKey||e[5]!==t.lookupKind||e[6]!==t.scopes.count||e[7]!==t.scopes.edges||e[8]!==p||e[9]!==d||e[10]!==y||e[11]!==i){const g=Te(t.scopes.edges,"node"),U=Math.max(t.scopes.count-g.length,0);let h;e[13]!==t.entity||e[14]!==p||e[15]!==d?(h=p?a.jsx(A,{entityType:d,entityId:p,entityFrgmt:t.entity}):null,e[13]=t.entity,e[14]=p,e[15]=d,e[16]=h):h=e[16];const F=h;e:switch(t.actionKind){case"SINGLE_ENTITY":{c=F??"-";break e}case"BULK":{const l=F??"-";let o;e[17]!==i?(o=i("comp:BAIAuditLogTargetCell.Run"),e[17]=i,e[18]=o):o=e[18];let r;e[19]!==o?(r=a.jsx(L,{type:"secondary",children:o}),e[19]=o,e[20]=r):r=e[20];let f;e[21]!==t.actionId?(f=a.jsx(Ae,{uuid:t.actionId}),e[21]=t.actionId,e[22]=f):f=e[22];let I;e[23]!==y||e[24]!==i?(I=y>1?a.jsx(Ee,{label:i("comp:BAIAuditLogTargetCell.InThisRun",{count:y})}):null,e[23]=y,e[24]=i,e[25]=I):I=e[25];let b;e[26]!==r||e[27]!==f||e[28]!==I?(b=a.jsxs(T,{gap:"xs",children:[r,f,I]}),e[26]=r,e[27]=f,e[28]=I,e[29]=b):b=e[29];let E;e[30]!==l||e[31]!==b?(E=a.jsxs(a.Fragment,{children:[l,b]}),e[30]=l,e[31]=b,e[32]=E):E=e[32],c=E;break e}case"SCOPE":{let l;e[33]!==F||e[34]!==i?(l=F??a.jsx(L,{type:"secondary",children:i("comp:BAIAuditLogTargetCell.NoAffectedEntity")}),e[33]=F,e[34]=i,e[35]=l):l=e[35],c=a.jsxs(a.Fragment,{children:[l,a.jsx(D,{scopes:g,hiddenScopeCount:U})]});break e}case"RELATION":{const[l,o]=g;if(g.length>=2){let r;e[36]===Symbol.for("react.memo_cache_sentinel")?(r=a.jsx(Pe,{size:"1em"}),e[36]=r):r=e[36],c=a.jsxs(T,{gap:"xs",wrap:"wrap",children:[a.jsx(A,{entityType:l.scopeType,entityId:l.scopeId,entityFrgmt:l.entity}),r,a.jsx(A,{entityType:o.scopeType,entityId:o.scopeId,entityFrgmt:o.entity})]})}else c=he(g)?"-":a.jsx(D,{scopes:g,hiddenScopeCount:U});break e}case"MEMBERSHIP":{const l=F??"-",o=g[0]?a.jsx(D,{scopes:[g[0]]}):null;let r;e[37]!==l||e[38]!==o?(r=a.jsxs(a.Fragment,{children:[l,o]}),e[37]=l,e[38]=o,e[39]=r):r=e[39],c=r;break e}case"GLOBAL":{let l;e[40]!==i?(l=i("comp:BAIAuditLogTargetCell.Global"),e[40]=i,e[41]=l):l=e[41];let o;e[42]!==l?(o=a.jsx(Ce,{label:l}),e[42]=l,e[43]=o):o=e[43],c=o;break e}case"LOOKUP":{let l;e[44]===Symbol.for("react.memo_cache_sentinel")?(l={tooltip:!0},e[44]=l):l=e[44];const o=`${t.lookupKind||"-"}: ${t.lookupKey||"-"}`;let r;e[45]!==o?(r=a.jsx(L,{monospace:!0,ellipsis:l,children:o}),e[45]=o,e[46]=r):r=e[46];let f;e[47]!==F||e[48]!==i?(f=F??a.jsx(L,{type:"secondary",children:i("comp:BAIAuditLogTargetCell.NotFound")}),e[47]=F,e[48]=i,e[49]=f):f=e[49];let I;e[50]!==r||e[51]!==f?(I=a.jsxs(a.Fragment,{children:[r,f]}),e[50]=r,e[51]=f,e[52]=I):I=e[52],c=I;break e}default:{let l;e[53]!==p||e[54]!==d?(l=d||p?a.jsx(A,{entityType:d,entityId:p}):"-",e[53]=p,e[54]=d,e[55]=l):l=e[55],c=l}}e[1]=t.actionId,e[2]=t.actionKind,e[3]=t.entity,e[4]=t.lookupKey,e[5]=t.lookupKind,e[6]=t.scopes.count,e[7]=t.scopes.edges,e[8]=p,e[9]=d,e[10]=y,e[11]=i,e[12]=c}else c=e[12];let k;return e[56]!==c?(k=a.jsx(T,{direction:"column",align:"start",gap:"xxs",children:c}),e[56]=c,e[57]=k):k=e[57],k};function De(n){return a.jsx(A,{entityType:n.scopeType,entityId:n.scopeId,entityFrgmt:n.entity},n.id)}const je=(function(){var n=[{kind:"Literal",name:"first",value:1}],e={alias:null,args:null,kind:"ScalarField",name:"name",storageKey:null},s=[e],m=[{alias:null,args:null,kind:"ScalarField",name:"configName",storageKey:null}],y={alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null},i={alias:null,args:null,concreteType:null,kind:"LinkedField",name:"entity",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"__typename",storageKey:null},{kind:"TypeDiscriminator",abstractKey:"__isEntityNode"},{kind:"InlineFragment",selections:[{alias:null,args:null,concreteType:"UserV2BasicInfo",kind:"LinkedField",name:"basicInfo",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"email",storageKey:null}],storageKey:null}],type:"UserV2",abstractKey:null},{kind:"InlineFragment",selections:[{alias:null,args:null,concreteType:"ProjectBasicInfo",kind:"LinkedField",name:"basicInfo",plural:!1,selections:s,storageKey:null}],type:"ProjectV2",abstractKey:null},{kind:"InlineFragment",selections:[{alias:null,args:null,concreteType:"DomainBasicInfo",kind:"LinkedField",name:"basicInfo",plural:!1,selections:s,storageKey:null}],type:"DomainV2",abstractKey:null},{kind:"InlineFragment",selections:[{alias:null,args:null,concreteType:"ImageV2IdentityInfo",kind:"LinkedField",name:"identity",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"canonicalName",storageKey:null}],storageKey:null}],type:"ImageV2",abstractKey:null},{kind:"InlineFragment",selections:[{alias:null,args:null,concreteType:"SessionV2MetadataInfo",kind:"LinkedField",name:"metadata",plural:!1,selections:s,storageKey:null}],type:"SessionV2",abstractKey:null},{kind:"InlineFragment",selections:[{alias:null,args:null,concreteType:"ModelDeploymentMetadata",kind:"LinkedField",name:"metadata",plural:!1,selections:s,storageKey:null}],type:"ModelDeployment",abstractKey:null},{kind:"InlineFragment",selections:[{alias:null,args:null,concreteType:"VFolderMetadataInfo",kind:"LinkedField",name:"metadata",plural:!1,selections:s,storageKey:null}],type:"VFolder",abstractKey:null},{kind:"InlineFragment",selections:[{alias:"vfolderName",args:null,kind:"ScalarField",name:"name",storageKey:null}],type:"VirtualFolderNode",abstractKey:null},{kind:"InlineFragment",selections:[{alias:"sessionName",args:null,kind:"ScalarField",name:"name",storageKey:null}],type:"ComputeSessionNode",abstractKey:null},{kind:"InlineFragment",selections:[{alias:null,args:null,kind:"ScalarField",name:"registryName",storageKey:null}],type:"ContainerRegistryV2",abstractKey:null},{kind:"InlineFragment",selections:m,type:"AppConfigAllowList",abstractKey:null},{kind:"InlineFragment",selections:m,type:"AppConfigDefinition",abstractKey:null},{kind:"InlineFragment",selections:m,type:"AppConfigFragment",abstractKey:null},{kind:"InlineFragment",selections:[{alias:null,args:null,kind:"ScalarField",name:"namespace",storageKey:null}],type:"StorageNamespace",abstractKey:null},{kind:"InlineFragment",selections:s,type:"Artifact",abstractKey:null},{kind:"InlineFragment",selections:[e,y],type:"ArtifactRegistry",abstractKey:null},{kind:"InlineFragment",selections:s,type:"NotificationChannel",abstractKey:null},{kind:"InlineFragment",selections:s,type:"NotificationRule",abstractKey:null},{kind:"InlineFragment",selections:s,type:"ResourceGroup",abstractKey:null},{kind:"InlineFragment",selections:s,type:"Role",abstractKey:null},{kind:"InlineFragment",selections:s,type:"IdleChecker",abstractKey:null},{kind:"InlineFragment",selections:s,type:"ObjectStorage",abstractKey:null},{kind:"InlineFragment",selections:s,type:"RuntimeVariant",abstractKey:null},{kind:"InlineFragment",selections:s,type:"RuntimeVariantPreset",abstractKey:null},{kind:"InlineFragment",selections:s,type:"VFSStorage",abstractKey:null},{kind:"InlineFragment",selections:[y],type:"Node",abstractKey:"__isNode"}],storageKey:null};return{fragment:{argumentDefinitions:[],kind:"Fragment",metadata:null,name:"BAIAuditLogTargetCellStoriesQuery",selections:[{alias:null,args:n,concreteType:"AuditLogV2Connection",kind:"LinkedField",name:"adminAuditLogsV2",plural:!1,selections:[{alias:null,args:null,concreteType:"AuditLogV2Edge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"AuditLogV2",kind:"LinkedField",name:"node",plural:!1,selections:[{args:null,kind:"FragmentSpread",name:"BAIAuditLogTargetCellFragment"}],storageKey:null}],storageKey:null}],storageKey:"adminAuditLogsV2(first:1)"}],type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[],kind:"Operation",name:"BAIAuditLogTargetCellStoriesQuery",selections:[{alias:null,args:n,concreteType:"AuditLogV2Connection",kind:"LinkedField",name:"adminAuditLogsV2",plural:!1,selections:[{alias:null,args:null,concreteType:"AuditLogV2Edge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"AuditLogV2",kind:"LinkedField",name:"node",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"actionId",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"actionKind",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"entityType",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"entityId",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"targetEntityId",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"lookupKind",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"lookupKey",storageKey:null},i,{alias:null,args:[{kind:"Literal",name:"first",value:3},{kind:"Literal",name:"orderBy",value:[{direction:"ASC",field:"SCOPE_TYPE"},{direction:"ASC",field:"SCOPE_ID"}]}],concreteType:"AuditLogScopeEntryConnection",kind:"LinkedField",name:"scopes",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"count",storageKey:null},{alias:null,args:null,concreteType:"AuditLogScopeEntryEdge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"AuditLogScopeEntry",kind:"LinkedField",name:"node",plural:!1,selections:[y,{alias:null,args:null,kind:"ScalarField",name:"scopeType",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"scopeId",storageKey:null},i],storageKey:null}],storageKey:null}],storageKey:'scopes(first:3,orderBy:[{"direction":"ASC","field":"SCOPE_TYPE"},{"direction":"ASC","field":"SCOPE_ID"}])'},y],storageKey:null}],storageKey:null}],storageKey:"adminAuditLogsV2(first:1)"}]},params:{cacheID:"007158dbf087ede0623383b8c59c3f65",id:null,metadata:{},name:"BAIAuditLogTargetCellStoriesQuery",operationKind:"query",text:`query BAIAuditLogTargetCellStoriesQuery {
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
`}}})();je.hash="a803bde9a5650379b39a061cac81e0aa";const mn={title:"Fragments/BAIAuditLogTargetCell",component:Ve,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:'\n**BAIAuditLogTargetCell** renders the Target column of the audit log table according to the record\'s action kind.\n\n## Per action kind\n- `SINGLE_ENTITY`: the target entity, named when it still exists\n- `BULK`: the target entity, the run id, and how many rows on the page came from the same run\n- `SCOPE`: the affected entity (or "No affected entity") and its scopes\n- `RELATION`: the two linked or unlinked scopes\n- `MEMBERSHIP`: the entity and the scope it joined or left\n- `GLOBAL`: a "Global" token\n- `LOOKUP`: the lookup kind and key, and the entity it resolved to or "Not found"\n- no kind (older records): the raw entity type and id\n\n## Usage\n```tsx\n<BAIAuditLogTargetCell auditLogFrgmt={record} runCount={3} />\n```\n        '}}}},Me=({runCount:n})=>{var m;const{adminAuditLogsV2:e}=G.useLazyLoadQuery(je,{}),s=(m=e==null?void 0:e.edges[0])==null?void 0:m.node;return s?a.jsx(Ve,{auditLogFrgmt:s,runCount:n}):null},v={id:"scope-project",scopeType:"project",scopeId:"5b2c1f8e-6a3d-4f7b-9c0e-1d2a3b4c5d6e",entity:{__typename:"ProjectV2",basicInfo:{name:"model-store"}}},S={id:"scope-user",scopeType:"user",scopeId:"8f9e0d1c-2b3a-4c5d-8e7f-6a5b4c3d2e1f",entity:{__typename:"UserV2",basicInfo:{email:"user@lablup.com"}}},Ge={id:"scope-domain",scopeType:"domain",scopeId:"1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d",entity:{__typename:"DomainV2",basicInfo:{name:"default"}}},K=(n,e)=>a.jsx(xe,{mockResolvers:{AuditLogV2:()=>({actionId:"0c1d2e3f-4a5b-4c6d-8e9f-0a1b2c3d4e5f",entityType:null,entityId:null,targetEntityId:null,lookupKind:null,lookupKey:null,entity:null,scopes:{count:0,edges:[]},...n})},children:a.jsx(Me,{runCount:e})}),C={render:()=>K({actionKind:"SINGLE_ENTITY",entityType:"session",targetEntityId:"3e4f5a6b-7c8d-4e9f-a0b1-c2d3e4f5a6b7",entity:{__typename:"SessionV2",metadata:{name:"my-session"}}})},_={parameters:{docs:{description:{story:"The entity no longer exists, so the cell falls back to the entity type and id."}}},render:()=>K({actionKind:"SINGLE_ENTITY",entityType:"vfolder",targetEntityId:"9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d"})},N={render:()=>K({actionKind:"BULK",entityType:"session",targetEntityId:"3e4f5a6b-7c8d-4e9f-a0b1-c2d3e4f5a6b7",entity:{__typename:"SessionV2",metadata:{name:"batch-01"}}},3)},V={render:()=>K({actionKind:"SCOPE",entityType:"vfolder",targetEntityId:"9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d",entity:{__typename:"VFolder",metadata:{name:"shared-data"}},scopes:{count:5,edges:[{node:Ge},{node:v},{node:S}]}})},j={render:()=>K({actionKind:"SCOPE",entityType:"vfolder",scopes:{count:1,edges:[{node:v}]}})},B={render:()=>K({actionKind:"RELATION",scopes:{count:2,edges:[{node:v},{node:S}]}})},x={render:()=>K({actionKind:"MEMBERSHIP",entityType:"user",targetEntityId:S.scopeId,entity:S.entity,scopes:{count:1,edges:[{node:v}]}})},R={render:()=>K({actionKind:"GLOBAL",entityType:"global"})},P={render:()=>K({actionKind:"LOOKUP",entityType:"user",lookupKind:"email",lookupKey:"user@lablup.com",targetEntityId:S.scopeId,entity:S.entity})},O={render:()=>K({actionKind:"LOOKUP",entityType:"user",lookupKind:"email",lookupKey:"missing@lablup.com"})},w={parameters:{docs:{description:{story:"A record written before the manager recorded the action kind keeps the raw entity type and id."}}},render:()=>K({actionKind:null,entityType:"session",entityId:"3e4f5a6b-7c8d-4e9f-a0b1-c2d3e4f5a6b7"})};var Y,$,Q;C.parameters={...C.parameters,docs:{...(Y=C.parameters)==null?void 0:Y.docs,source:{originalSource:`{
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
}`,...(Q=($=C.parameters)==null?void 0:$.docs)==null?void 0:Q.source}}};var q,z,H;_.parameters={..._.parameters,docs:{...(q=_.parameters)==null?void 0:q.docs,source:{originalSource:`{
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
}`,...(H=(z=_.parameters)==null?void 0:z.docs)==null?void 0:H.source}}};var W,J,X;N.parameters={...N.parameters,docs:{...(W=N.parameters)==null?void 0:W.docs,source:{originalSource:`{
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
}`,...(X=(J=N.parameters)==null?void 0:J.docs)==null?void 0:X.source}}};var Z,ee,ne;V.parameters={...V.parameters,docs:{...(Z=V.parameters)==null?void 0:Z.docs,source:{originalSource:`{
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
}`,...(ne=(ee=V.parameters)==null?void 0:ee.docs)==null?void 0:ne.source}}};var te,ae,le;j.parameters={...j.parameters,docs:{...(te=j.parameters)==null?void 0:te.docs,source:{originalSource:`{
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
}`,...(le=(ae=j.parameters)==null?void 0:ae.docs)==null?void 0:le.source}}};var ie,se,oe;B.parameters={...B.parameters,docs:{...(ie=B.parameters)==null?void 0:ie.docs,source:{originalSource:`{
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
}`,...(oe=(se=B.parameters)==null?void 0:se.docs)==null?void 0:oe.source}}};var re,ce,de;x.parameters={...x.parameters,docs:{...(re=x.parameters)==null?void 0:re.docs,source:{originalSource:`{
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
}`,...(de=(ce=x.parameters)==null?void 0:ce.docs)==null?void 0:de.source}}};var ue,me,ye;R.parameters={...R.parameters,docs:{...(ue=R.parameters)==null?void 0:ue.docs,source:{originalSource:`{
  render: () => withAuditLog({
    actionKind: 'GLOBAL',
    entityType: 'global'
  })
}`,...(ye=(me=R.parameters)==null?void 0:me.docs)==null?void 0:ye.source}}};var pe,ge,fe;P.parameters={...P.parameters,docs:{...(pe=P.parameters)==null?void 0:pe.docs,source:{originalSource:`{
  render: () => withAuditLog({
    actionKind: 'LOOKUP',
    entityType: 'user',
    lookupKind: 'email',
    lookupKey: 'user@lablup.com',
    targetEntityId: userScope.scopeId,
    entity: userScope.entity
  })
}`,...(fe=(ge=P.parameters)==null?void 0:ge.docs)==null?void 0:fe.source}}};var ke,Ie,Ke;O.parameters={...O.parameters,docs:{...(ke=O.parameters)==null?void 0:ke.docs,source:{originalSource:`{
  render: () => withAuditLog({
    actionKind: 'LOOKUP',
    entityType: 'user',
    lookupKind: 'email',
    lookupKey: 'missing@lablup.com'
  })
}`,...(Ke=(Ie=O.parameters)==null?void 0:Ie.docs)==null?void 0:Ke.source}}};var Fe,be,Se;w.parameters={...w.parameters,docs:{...(Fe=w.parameters)==null?void 0:Fe.docs,source:{originalSource:`{
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
}`,...(Se=(be=w.parameters)==null?void 0:be.docs)==null?void 0:Se.source}}};const yn=["SingleEntity","SingleEntityDeleted","Bulk","Scope","ScopeWithoutEntity","Relation","Membership","Global","Lookup","LookupMiss","WithoutActionKind"];export{N as Bulk,R as Global,P as Lookup,O as LookupMiss,x as Membership,B as Relation,V as Scope,j as ScopeWithoutEntity,C as SingleEntity,_ as SingleEntityDeleted,w as WithoutActionKind,yn as __namedExportsOrder,mn as default};
