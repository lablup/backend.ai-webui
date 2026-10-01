import{c as q,j as m,r as Q,a as Xe}from"./iframe-Wv7HyymT.js";import{R as Ye}from"./RelayResolver-8Nlpv-qx.js";import{t as Ge}from"./index-D1LP2XKj.js";import{a as Oe,u as He}from"./useDebounce-Dd4e0wxo.js";import{a as Ze}from"./index-Dm5uWuxi.js";import{c as Pe,B as Je}from"./BAIComplexSelect-Bv48E3-p.js";import{r as se}from"./index-Ct_Y--LV.js";import{u as re}from"./useControllableValue-DK9Nsm_r.js";import{c as R}from"./compact-CU4PNV0P.js";import{m as E}from"./map-DNWPCO8d.js";import"./preload-helper-Dp1pzeXC.js";import"./index-DbqLbNbG.js";import"./isNumber-B-vuXH9i.js";import"./toString-Bd2RjrBP.js";import"./isSymbol-BXTSOECO.js";import"./filter-BrJ3Tq61.js";import"./_baseEach-tEekCYHZ.js";import"./get-DGc5qT3s.js";import"./_baseGet-BWg2hzrq.js";import"./identity-DKeuBCMA.js";import"./isEmpty-XNeBHuWL.js";import"./useEventNotStable-DnOnBB-j.js";import"./uniqBy-Bs7Y13ir.js";import"./_baseUniq-EXZZccS8.js";import"./_baseIndexOf-Be9UPhX8.js";import"./_baseFindIndex-Cj99RmFE.js";import"./noop-DX6rZLP_.js";import"./toFinite-BSuAPCu9.js";import"./_trimmedEndIndex-DuQxD0U0.js";import"./useConnectedBAIClient-DE6QGGco.js";import"./reactQueryAlias-BppgZ0UE.js";import"./useIndicator-Bkvzt0k8.js";import"./isRenderable-BUV0eL6r.js";import"./clamp-D82V6clD.js";import"./_baseClamp-DVUOCJN_.js";import"./_baseSlice-F8doVSIJ.js";import"./toInteger-B6oY22H4.js";import"./InputClearButton-D3NLLSxG.js";import"./useResolvedRequired-DgXcmBOQ.js";import"./useDevWarning-DAmOZ4_b.js";import"./usePopover-k-lrnvg0.js";import"./rtlStyles-T4i24HtE.js";import"./composeEventHandlers-BolWE7qY.js";import"./Divider-BWU4EAwN.js";import"./some-DgbMVdtd.js";import"./Token-BmMprlFr.js";import"./SelectorOption-CB7ilgC0.js";import"./Item-C1MmiJiG.js";/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */const le=(a,e="AND")=>{const n=a.filter(l=>!!l);return n.length===0?null:n.length===1&&e!=="NOT"?n[0]:{[e]:n}},we=(function(){var a={defaultValue:null,kind:"LocalArgument",name:"limit"},e={defaultValue:null,kind:"LocalArgument",name:"selectedFilter"},n={defaultValue:null,kind:"LocalArgument",name:"skipSelected"},l=[{condition:"skipSelected",kind:"Condition",passingValue:!1,selections:[{alias:null,args:[{kind:"Variable",name:"filter",variableName:"selectedFilter"},{kind:"Variable",name:"limit",variableName:"limit"}],concreteType:"UserV2Connection",kind:"LinkedField",name:"adminUsersV2",plural:!1,selections:[{alias:null,args:null,concreteType:"UserV2Edge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"UserV2",kind:"LinkedField",name:"node",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null},{alias:null,args:null,concreteType:"UserV2BasicInfo",kind:"LinkedField",name:"basicInfo",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"email",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"fullName",storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}]}];return{fragment:{argumentDefinitions:[a,e,n],kind:"Fragment",metadata:null,name:"BAIUserSelectAdminValueQuery",selections:l,type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[e,a,n],kind:"Operation",name:"BAIUserSelectAdminValueQuery",selections:l},params:{cacheID:"5777d4edebee339daa6f13df0896a37e",id:null,metadata:{},name:"BAIUserSelectAdminValueQuery",operationKind:"query",text:`query BAIUserSelectAdminValueQuery(
  $selectedFilter: UserV2Filter
  $limit: Int!
  $skipSelected: Boolean!
) {
  adminUsersV2(filter: $selectedFilter, limit: $limit) @skip(if: $skipSelected) {
    edges {
      node {
        id
        basicInfo {
          email
          fullName
        }
      }
    }
  }
}
`}}})();we.hash="8b587afd966cb5da259fe29624f52cda";const Qe=(function(){var a={defaultValue:null,kind:"LocalArgument",name:"filter"},e={defaultValue:null,kind:"LocalArgument",name:"limit"},n={defaultValue:null,kind:"LocalArgument",name:"offset"},l={defaultValue:null,kind:"LocalArgument",name:"orderBy"},t=[{alias:null,args:[{kind:"Variable",name:"filter",variableName:"filter"},{kind:"Variable",name:"limit",variableName:"limit"},{kind:"Variable",name:"offset",variableName:"offset"},{kind:"Variable",name:"orderBy",variableName:"orderBy"}],concreteType:"UserV2Connection",kind:"LinkedField",name:"adminUsersV2",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"count",storageKey:null},{alias:null,args:null,concreteType:"UserV2Edge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"UserV2",kind:"LinkedField",name:"node",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null},{alias:null,args:null,concreteType:"UserV2BasicInfo",kind:"LinkedField",name:"basicInfo",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"email",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"fullName",storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:[a,e,n,l],kind:"Fragment",metadata:null,name:"BAIUserSelectAdminPaginatedQuery",selections:t,type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[n,e,a,l],kind:"Operation",name:"BAIUserSelectAdminPaginatedQuery",selections:t},params:{cacheID:"289c6c25cc2f9a10bd2369d622614d15",id:null,metadata:{},name:"BAIUserSelectAdminPaginatedQuery",operationKind:"query",text:`query BAIUserSelectAdminPaginatedQuery(
  $offset: Int!
  $limit: Int!
  $filter: UserV2Filter
  $orderBy: [UserV2OrderBy!]
) {
  adminUsersV2(offset: $offset, limit: $limit, filter: $filter, orderBy: $orderBy) {
    count
    edges {
      node {
        id
        basicInfo {
          email
          fullName
        }
      }
    }
  }
}
`}}})();Qe.hash="183ff6704bc57811ef5f0d48b9c1ae00";const Ce=(function(){var a={defaultValue:null,kind:"LocalArgument",name:"limit"},e={defaultValue:null,kind:"LocalArgument",name:"scope"},n={defaultValue:null,kind:"LocalArgument",name:"selectedFilter"},l={defaultValue:null,kind:"LocalArgument",name:"skipSelected"},t=[{condition:"skipSelected",kind:"Condition",passingValue:!1,selections:[{alias:null,args:[{kind:"Variable",name:"filter",variableName:"selectedFilter"},{kind:"Variable",name:"limit",variableName:"limit"},{kind:"Variable",name:"scope",variableName:"scope"}],concreteType:"UserV2Connection",kind:"LinkedField",name:"scopedUsersV2",plural:!1,selections:[{alias:null,args:null,concreteType:"UserV2Edge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"UserV2",kind:"LinkedField",name:"node",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null},{alias:null,args:null,concreteType:"UserV2BasicInfo",kind:"LinkedField",name:"basicInfo",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"email",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"fullName",storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}]}];return{fragment:{argumentDefinitions:[a,e,n,l],kind:"Fragment",metadata:null,name:"BAIUserSelectScopedValueQuery",selections:t,type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[e,n,a,l],kind:"Operation",name:"BAIUserSelectScopedValueQuery",selections:t},params:{cacheID:"c2a9ff13a61d75f12d48e8b3ae9c637e",id:null,metadata:{},name:"BAIUserSelectScopedValueQuery",operationKind:"query",text:`query BAIUserSelectScopedValueQuery(
  $scope: UserScope!
  $selectedFilter: UserV2Filter
  $limit: Int!
  $skipSelected: Boolean!
) {
  scopedUsersV2(scope: $scope, filter: $selectedFilter, limit: $limit) @skip(if: $skipSelected) {
    edges {
      node {
        id
        basicInfo {
          email
          fullName
        }
      }
    }
  }
}
`}}})();Ce.hash="7d742f7aadaab02f8f0e42cacd524eb3";const Te=(function(){var a={defaultValue:null,kind:"LocalArgument",name:"filter"},e={defaultValue:null,kind:"LocalArgument",name:"limit"},n={defaultValue:null,kind:"LocalArgument",name:"offset"},l={defaultValue:null,kind:"LocalArgument",name:"orderBy"},t={defaultValue:null,kind:"LocalArgument",name:"scope"},s=[{alias:null,args:[{kind:"Variable",name:"filter",variableName:"filter"},{kind:"Variable",name:"limit",variableName:"limit"},{kind:"Variable",name:"offset",variableName:"offset"},{kind:"Variable",name:"orderBy",variableName:"orderBy"},{kind:"Variable",name:"scope",variableName:"scope"}],concreteType:"UserV2Connection",kind:"LinkedField",name:"scopedUsersV2",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"count",storageKey:null},{alias:null,args:null,concreteType:"UserV2Edge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"UserV2",kind:"LinkedField",name:"node",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null},{alias:null,args:null,concreteType:"UserV2BasicInfo",kind:"LinkedField",name:"basicInfo",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"email",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"fullName",storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:[a,e,n,l,t],kind:"Fragment",metadata:null,name:"BAIUserSelectScopedPaginatedQuery",selections:s,type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[t,n,e,a,l],kind:"Operation",name:"BAIUserSelectScopedPaginatedQuery",selections:s},params:{cacheID:"ffe0bdc5e4c13ffc25631d55383ba84a",id:null,metadata:{},name:"BAIUserSelectScopedPaginatedQuery",operationKind:"query",text:`query BAIUserSelectScopedPaginatedQuery(
  $scope: UserScope!
  $offset: Int!
  $limit: Int!
  $filter: UserV2Filter
  $orderBy: [UserV2OrderBy!]
) {
  scopedUsersV2(scope: $scope, offset: $offset, limit: $limit, filter: $filter, orderBy: $orderBy) {
    count
    edges {
      node {
        id
        basicInfo {
          email
          fullName
        }
      }
    }
  }
}
`}}})();Te.hash="a1168201ee93ae3a8f43897a1ca2fbb7";const _e=(function(){var a=[{defaultValue:null,kind:"LocalArgument",name:"domainName"}],e=[{kind:"Variable",name:"domainName",variableName:"domainName"}],n={alias:null,args:null,kind:"ScalarField",name:"entityId",storageKey:null};return{fragment:{argumentDefinitions:a,kind:"Fragment",metadata:null,name:"BAIUserSelectDomainIdQuery",selections:[{alias:null,args:e,concreteType:"DomainV2",kind:"LinkedField",name:"domainV2",plural:!1,selections:[n],storageKey:null}],type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:a,kind:"Operation",name:"BAIUserSelectDomainIdQuery",selections:[{alias:null,args:e,concreteType:"DomainV2",kind:"LinkedField",name:"domainV2",plural:!1,selections:[n,{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null}],storageKey:null}]},params:{cacheID:"fed69b10d0f2a068001edc680059b5ac",id:null,metadata:{},name:"BAIUserSelectDomainIdQuery",operationKind:"query",text:`query BAIUserSelectDomainIdQuery(
  $domainName: String!
) {
  domainV2(domainName: $domainName) {
    entityId
    id
  }
}
`}}})();_e.hash="a11d3e9cd28a5e499cb75c1819cf744f";const ae=a=>R(E(a,e=>{var n,l;return e!=null&&e.node?{id:e.node.id,email:(n=e.node.basicInfo)==null?void 0:n.email,fullName:(l=e.node.basicInfo)==null?void 0:l.fullName}:null})),qe=10,Ee=a=>{"use memo";const e=q.c(23);let n,l,t,s,r,i,o;e[0]!==a?({filter:n,excludeInactive:r,valuePropName:i,multiple:o,isLoading:l,ref:t,...s}=a,e[0]=a,e[1]=n,e[2]=l,e[3]=t,e[4]=s,e[5]=r,e[6]=i,e[7]=o):(n=e[1],l=e[2],t=e[3],s=e[4],r=e[5],i=e[6],o=e[7]);const u=r===void 0?!1:r,k=i===void 0?"email":i,V=o===void 0?!1:o;let f;e[8]===Symbol.for("react.memo_cache_sentinel")?(f={valuePropName:"value",trigger:"onChange"},e[8]=f):f=e[8];const[y,S]=re(s,f);let p;e[9]===Symbol.for("react.memo_cache_sentinel")?(p={valuePropName:"open",trigger:"onOpenChange",defaultValuePropName:"defaultOpen"},e[9]=p):p=e[9];const[U,g]=re(s,p),j=Q.useDeferredValue(U),[x,F]=Q.useState(""),I=He(x),[ne,M]=Q.useTransition(),[C,h]=Ze(),v=Q.useDeferredValue(C);let D,$;e[10]!==h?(D=()=>({refetch:()=>{M(()=>{h()})}}),$=[h,M],e[10]=h,e[11]=D,e[12]=$):(D=e[11],$=e[12]),Q.useImperativeHandle(t,D,$);const T=le([u?{status:{equals:"ACTIVE"}}:null,n]),L=Q.useDeferredValue(y),O=R(Pe(L??[])),P=k==="id"&&O.length>0,N=j?"network-only":"store-only";let B;e[13]!==v||e[14]!==N?(B={fetchPolicy:N,fetchKey:v},e[13]=v,e[14]=N,e[15]=B):B=e[15];const c=P?le([{uuid:{in:O}},T]):null,d=Math.max(O.length,1),b=!P;let _;e[16]!==c||e[17]!==d||e[18]!==b?(_={selectedFilter:c,limit:d,skipSelected:b},e[16]=c,e[17]=d,e[18]=b,e[19]=_):_=e[19];const A=P?"store-or-network":"store-only";let w;return e[20]!==v||e[21]!==A?(w={fetchPolicy:A,fetchKey:v},e[20]=v,e[21]=A,e[22]=w):w=e[22],{multiple:V,isLoading:l,valuePropName:k,selectProps:s,selectedKeys:O,controllableValue:y,setControllableValue:S,controllableOpen:U,setControllableOpen:g,deferredOpen:j,deferredControllableValue:L,searchStr:x,setSearchStr:F,debouncedDeferredValue:I,isPendingRefetch:ne,listVariables:{filter:le([T,I?{email:{iContains:I}}:null]),orderBy:[{field:"EMAIL",direction:"ASC"}]},listOptions:B,valueVariables:_,valueOptions:w}},Re=a=>{"use memo";const e=q.c(32),{state:n,users:l,selectedUsers:t,total:s,loadNext:r,isLoadingNext:i}=a,{t:o}=Xe(),{multiple:u,isLoading:k,valuePropName:V,selectProps:f,selectedKeys:y,controllableValue:S,setControllableValue:p,controllableOpen:U,setControllableOpen:g,deferredOpen:j,deferredControllableValue:x,searchStr:F,setSearchStr:I,debouncedDeferredValue:ne,isPendingRefetch:M}=n;let C;e[0]!==V?(C=c=>{if(c)return V==="id"?Ge(c.id):c.email??void 0},e[0]=V,e[1]=C):C=e[1];const h=C;let v;if(e[2]!==h||e[3]!==l){let c;e[5]!==h?(c=d=>{const b=h(d);return b?{value:b,label:(d==null?void 0:d.email)??b,description:(d==null?void 0:d.fullName)??void 0}:null},e[5]=h,e[6]=c):c=e[6],v=R(E(l,c)),e[2]=h,e[3]=l,e[4]=v}else v=e[4];const D=v;let $;e:{let c;if(e[7]!==h||e[8]!==y||e[9]!==t){let b;e[11]!==h?(b=A=>{const w=h(A);return w?[w,A.email]:null},e[11]=h,e[12]=b):b=e[12];const _=new Map(R(E(t,b)));c=E(y,A=>({label:_.get(A)??A,value:A})),e[7]=h,e[8]=y,e[9]=t,e[10]=c}else c=e[10];const d=c;if(u){$=d;break e}$=d[0]??null}const T=$;let L;e[13]!==o?(L=o("comp:BAIUserSelect.SelectUser"),e[13]=o,e[14]=L):L=e[14];const O=k||!!U&&!j||S!==x||F!==ne||M,P=s??void 0;let N;e[15]!==u||e[16]!==p?(N=c=>{const d=R(Pe(c??[])),b=E(d,aa);p(u?b:b[0],u?d:d[0])},e[15]=u,e[16]=p,e[17]=N):N=e[17];let B;return e[18]!==i||e[19]!==T||e[20]!==r||e[21]!==u||e[22]!==D||e[23]!==F||e[24]!==f||e[25]!==g||e[26]!==I||e[27]!==L||e[28]!==O||e[29]!==P||e[30]!==N?(B=m.jsx(Je,{placeholder:L,...f,multiple:u,isLoading:O,isLoadingNext:i,total:P,options:D,value:T,onChange:N,searchValue:F,onSearch:I,onOpenChange:g,endReached:r}),e[18]=i,e[19]=T,e[20]=r,e[21]=u,e[22]=D,e[23]=F,e[24]=f,e[25]=g,e[26]=I,e[27]=L,e[28]=O,e[29]=P,e[30]=N,e[31]=B):B=e[31],B},We=a=>{"use memo";var U,g;const e=q.c(13),n=Ee(a);let l;e[0]===Symbol.for("react.memo_cache_sentinel")?(l=we,e[0]=l):l=e[0];const t=se.useLazyLoadQuery(l,n.valueVariables,n.valueOptions);let s,r;e[1]===Symbol.for("react.memo_cache_sentinel")?(s=Qe,r={limit:qe},e[1]=s,e[2]=r):(s=e[1],r=e[2]);let i;e[3]===Symbol.for("react.memo_cache_sentinel")?(i={getTotal:na,getItem:la,getId:ta},e[3]=i):i=e[3];const{paginationData:o,result:u,loadNext:k,isLoadingNext:V}=Oe(s,r,n.listVariables,n.listOptions,i),f=(U=t.adminUsersV2)==null?void 0:U.edges;let y;e[4]!==f?(y=ae(f),e[4]=f,e[5]=y):y=e[5];const S=(g=u.adminUsersV2)==null?void 0:g.count;let p;return e[6]!==V||e[7]!==k||e[8]!==o||e[9]!==n||e[10]!==y||e[11]!==S?(p=m.jsx(Re,{state:n,users:o,selectedUsers:y,total:S,loadNext:k,isLoadingNext:V}),e[6]=V,e[7]=k,e[8]=o,e[9]=n,e[10]=y,e[11]=S,e[12]=p):p=e[12],p},Me=a=>{"use memo";var F,I;const e=q.c(22);let n,l;e[0]!==a?({userScope:l,...n}=a,e[0]=a,e[1]=n,e[2]=l):(n=e[1],l=e[2]);const t=Ee(n);let s;e[3]===Symbol.for("react.memo_cache_sentinel")?(s=Ce,e[3]=s):s=e[3];let r;e[4]!==t.valueVariables||e[5]!==l?(r={...t.valueVariables,scope:l},e[4]=t.valueVariables,e[5]=l,e[6]=r):r=e[6];const i=se.useLazyLoadQuery(s,r,t.valueOptions);let o,u;e[7]===Symbol.for("react.memo_cache_sentinel")?(o=Te,u={limit:qe},e[7]=o,e[8]=u):(o=e[7],u=e[8]);let k;e[9]!==t.listVariables||e[10]!==l?(k={...t.listVariables,scope:l},e[9]=t.listVariables,e[10]=l,e[11]=k):k=e[11];let V;e[12]===Symbol.for("react.memo_cache_sentinel")?(V={getTotal:sa,getItem:ra,getId:ia},e[12]=V):V=e[12];const{paginationData:f,result:y,loadNext:S,isLoadingNext:p}=Oe(o,u,k,t.listOptions,V),U=(F=i.scopedUsersV2)==null?void 0:F.edges;let g;e[13]!==U?(g=ae(U),e[13]=U,e[14]=g):g=e[14];const j=(I=y.scopedUsersV2)==null?void 0:I.count;let x;return e[15]!==p||e[16]!==S||e[17]!==f||e[18]!==t||e[19]!==g||e[20]!==j?(x=m.jsx(Re,{state:t,users:f,selectedUsers:g,total:j,loadNext:S,isLoadingNext:p}),e[15]=p,e[16]=S,e[17]=f,e[18]=t,e[19]=g,e[20]=j,e[21]=x):x=e[21],x},ea=a=>{"use memo";const e=q.c(11);let n,l;e[0]!==a?({domainName:n,...l}=a,e[0]=a,e[1]=n,e[2]=l):(n=e[1],l=e[2]);let t;e[3]===Symbol.for("react.memo_cache_sentinel")?(t=_e,e[3]=t):t=e[3];let s;e[4]!==n?(s={domainName:n},e[4]=n,e[5]=s):s=e[5];const{domainV2:r}=se.useLazyLoadQuery(t,s);if(!r)throw new Error(`Domain not found: ${n}`);let i;e[6]!==r.entityId?(i={domain:[{value:r.entityId}]},e[6]=r.entityId,e[7]=i):i=e[7];let o;return e[8]!==l||e[9]!==i?(o=m.jsx(Me,{userScope:i,...l}),e[8]=l,e[9]=i,e[10]=o):o=e[10],o},ze=a=>{"use memo";const e=q.c(13);let n,l;if(e[0]!==a?({scope:l,...n}=a,e[0]=a,e[1]=n,e[2]=l):(n=e[1],l=e[2]),l.type==="project"){let s;e[3]!==l.projectId?(s={project:[{value:l.projectId}]},e[3]=l.projectId,e[4]=s):s=e[4];let r;return e[5]!==n||e[6]!==s?(r=m.jsx(Me,{userScope:s,...n}),e[5]=n,e[6]=s,e[7]=r):r=e[7],r}if(l.type==="domain"){let s;return e[8]!==n||e[9]!==l.domainName?(s=m.jsx(ea,{domainName:l.domainName,...n}),e[8]=n,e[9]=l.domainName,e[10]=s):s=e[10],s}let t;return e[11]!==n?(t=m.jsx(We,{...n}),e[11]=n,e[12]=t):t=e[12],t};function aa(a){return a.value}function na(a){var e;return((e=a.adminUsersV2)==null?void 0:e.count)??void 0}function la(a){var e;return ae((e=a.adminUsersV2)==null?void 0:e.edges)}function ta(a){return a==null?void 0:a.id}function sa(a){var e;return((e=a.scopedUsersV2)==null?void 0:e.count)??void 0}function ra(a){var e;return ae((e=a.scopedUsersV2)==null?void 0:e.edges)}function ia(a){return a==null?void 0:a.id}const sn={title:"Fragments/BAIUserSelect",component:ze,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:"\n**BAIUserSelect** — the user picker the admin and project-admin forms share. Built on `BAIComplexSelect`.\n\n- `scope` (required): `{ type: 'admin' }` (`adminUsersV2`), `{ type: 'domain', domainName }` or `{ type: 'project', projectId }`, both paged through `scopedUsersV2`; a domain name is first resolved to its UUID through `domainV2`. Admin pages take theirs from `useAdminUserSelectScope()`.\n- `valuePropName`: `'email'` (default) or `'id'` — which field is the plain-key value. Only `'id'` runs the `uuid in` label-resolution query; with emails the key already is the label.\n- `filter` / `excludeInactive`: composed into a `UserV2Filter` through the schema's `AND` combinator, together with the debounced `email: { iContains }` search.\n- Needs a manager >= 26.9.0, where `scopedUsersV2` and `DomainV2.entityId` exist.\n\nSee `BAIComplexSelect.stories.tsx` for the underlying popup-body component with static options.\n        "}}},argTypes:{value:{control:!1},onChange:{control:!1},filter:{control:!1},scope:{control:!1},multiple:{control:{type:"boolean"}},excludeInactive:{control:{type:"boolean"}},valuePropName:{control:{type:"select"},options:["email","id"]}}},ie=[{id:"VXNlclYyOjE=",basicInfo:{email:"admin@example.com",fullName:"System Administrator"}},{id:"VXNlclYyOjI=",basicInfo:{email:"alice@example.com",fullName:"Alice Kim"}},{id:"VXNlclYyOjM=",basicInfo:{email:"bob@example.com",fullName:"Bob Lee"}},{id:"VXNlclYyOjQ=",basicInfo:{email:"carol@example.com",fullName:"Carol Park"}}],te=a=>({count:a.length,edges:a.map(e=>({node:e}))}),oa={Query:()=>({adminUsersV2:te(ie),scopedUsersV2:te(ie.slice(1,3)),domainV2:{entityId:"5c3b5a9e-0000-4000-8000-0000000000d0"}})},ca={Query:()=>({adminUsersV2:te([])})},da={type:"admin"},K=({scope:a=da,initialValue:e=null,resolvers:n=oa,...l})=>{const[t,s]=Q.useState(e);return m.jsx(Ye,{mockResolvers:n,children:m.jsx(ze,{...l,scope:a,value:t,onChange:r=>s(r??null)})})},z={parameters:{docs:{description:{story:'`scope={{ type: "admin" }}` reads `adminUsersV2` — every user, which only a super-admin may list.'}}},render:a=>m.jsx(K,{...a,label:"User"})},X={parameters:{docs:{description:{story:'`scope={{ type: "domain", domainName }}` resolves the domain UUID through `domainV2`, then reads `scopedUsersV2` — the users of one domain, which a domain admin may list. `useAdminUserSelectScope()` picks this scope for a non-super-admin caller.'}}},render:a=>m.jsx(K,{...a,label:"User",scope:{type:"domain",domainName:"default"},defaultOpen:!0})},Y={parameters:{docs:{description:{story:'`scope={{ type: "project", projectId }}` reads `scopedUsersV2` with a project scope, the members of one project — what a project admin may list.'}}},render:a=>m.jsx(K,{...a,label:"Owner",scope:{type:"project",projectId:"5c3b5a9e-0000-4000-8000-000000000001"},defaultOpen:!0})},G={name:"Multiple Select",parameters:{docs:{description:{story:"Multi-selection: the value is an array of keys and the trigger lists the selected emails."}}},render:a=>m.jsx(K,{...a,label:"Users",multiple:!0,initialValue:["admin@example.com"]})},H={name:"Exclude Inactive Users",parameters:{docs:{description:{story:"`excludeInactive` composes `status: { equals: ACTIVE }` into the `UserV2Filter`."}}},render:a=>m.jsx(K,{...a,label:"User",excludeInactive:!0})},Z={name:"ID-valued",parameters:{docs:{description:{story:'`valuePropName="id"` — the plain-key value is the local user UUID, which is what `adminBulkAssignRole` and friends take. This is the only mode that runs the `uuid in` label-resolution query.'}}},render:a=>m.jsx(K,{...a,label:"User",valuePropName:"id"})},J={parameters:{docs:{description:{story:"Caller-side `isLoading`, which spins the trigger the same way the internal debounce and refetch pending states do."}}},render:a=>m.jsx(K,{...a,label:"User",isLoading:!0,isDisabled:!0})},W={parameters:{docs:{description:{story:"No users match the query — the popup shows the shared empty-state text."}}},render:a=>m.jsx(K,{...a,label:"User",resolvers:ca,defaultOpen:!0})},ee={parameters:{docs:{description:{story:"The error status a form item sets when its `required` rule fails."}}},render:a=>m.jsx(K,{...a,label:"User",status:{type:"error",message:"Please select users."}})};var oe,ce,de;z.parameters={...z.parameters,docs:{...(oe=z.parameters)==null?void 0:oe.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: '\`scope={{ type: "admin" }}\` reads \`adminUsersV2\` — every user, which only a super-admin may list.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" />
}`,...(de=(ce=z.parameters)==null?void 0:ce.docs)==null?void 0:de.source}}};var me,ue,pe;X.parameters={...X.parameters,docs:{...(me=X.parameters)==null?void 0:me.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: '\`scope={{ type: "domain", domainName }}\` resolves the domain UUID through \`domainV2\`, then reads \`scopedUsersV2\` — the users of one domain, which a domain admin may list. \`useAdminUserSelectScope()\` picks this scope for a non-super-admin caller.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" scope={{
    type: 'domain',
    domainName: 'default'
  }} defaultOpen />
}`,...(pe=(ue=X.parameters)==null?void 0:ue.docs)==null?void 0:pe.source}}};var fe,ye,ge;Y.parameters={...Y.parameters,docs:{...(fe=Y.parameters)==null?void 0:fe.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: '\`scope={{ type: "project", projectId }}\` reads \`scopedUsersV2\` with a project scope, the members of one project — what a project admin may list.'
      }
    }
  },
  render: args => <Sandbox {...args} label="Owner" scope={{
    type: 'project',
    projectId: '5c3b5a9e-0000-4000-8000-000000000001'
  }} defaultOpen />
}`,...(ge=(ye=Y.parameters)==null?void 0:ye.docs)==null?void 0:ge.source}}};var he,be,Ve;G.parameters={...G.parameters,docs:{...(he=G.parameters)==null?void 0:he.docs,source:{originalSource:`{
  name: 'Multiple Select',
  parameters: {
    docs: {
      description: {
        story: 'Multi-selection: the value is an array of keys and the trigger lists the selected emails.'
      }
    }
  },
  render: args => <Sandbox {...args} label="Users" multiple initialValue={['admin@example.com']} />
}`,...(Ve=(be=G.parameters)==null?void 0:be.docs)==null?void 0:Ve.source}}};var ke,Se,Ue;H.parameters={...H.parameters,docs:{...(ke=H.parameters)==null?void 0:ke.docs,source:{originalSource:`{
  name: 'Exclude Inactive Users',
  parameters: {
    docs: {
      description: {
        story: '\`excludeInactive\` composes \`status: { equals: ACTIVE }\` into the \`UserV2Filter\`.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" excludeInactive />
}`,...(Ue=(Se=H.parameters)==null?void 0:Se.docs)==null?void 0:Ue.source}}};var ve,Ie,Ne;Z.parameters={...Z.parameters,docs:{...(ve=Z.parameters)==null?void 0:ve.docs,source:{originalSource:`{
  name: 'ID-valued',
  parameters: {
    docs: {
      description: {
        story: '\`valuePropName="id"\` — the plain-key value is the local user UUID, which is what \`adminBulkAssignRole\` and friends take. This is the only mode that runs the \`uuid in\` label-resolution query.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" valuePropName="id" />
}`,...(Ne=(Ie=Z.parameters)==null?void 0:Ie.docs)==null?void 0:Ne.source}}};var Ae,xe,Fe;J.parameters={...J.parameters,docs:{...(Ae=J.parameters)==null?void 0:Ae.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Caller-side \`isLoading\`, which spins the trigger the same way the internal debounce and refetch pending states do.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" isLoading isDisabled />
}`,...(Fe=(xe=J.parameters)==null?void 0:xe.docs)==null?void 0:Fe.source}}};var Le,Be,Ke;W.parameters={...W.parameters,docs:{...(Le=W.parameters)==null?void 0:Le.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'No users match the query — the popup shows the shared empty-state text.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" resolvers={emptyResolvers} defaultOpen />
}`,...(Ke=(Be=W.parameters)==null?void 0:Be.docs)==null?void 0:Ke.source}}};var je,De,$e;ee.parameters={...ee.parameters,docs:{...(je=ee.parameters)==null?void 0:je.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'The error status a form item sets when its \`required\` rule fails.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" status={{
    type: 'error',
    message: 'Please select users.'
  }} />
}`,...($e=(De=ee.parameters)==null?void 0:De.docs)==null?void 0:$e.source}}};const rn=["AdminScope","DomainScope","ProjectScope","Multiple","ExcludeInactive","IdValued","Loading","Empty","Error"];export{z as AdminScope,X as DomainScope,W as Empty,ee as Error,H as ExcludeInactive,Z as IdValued,J as Loading,G as Multiple,Y as ProjectScope,rn as __namedExportsOrder,sn as default};
