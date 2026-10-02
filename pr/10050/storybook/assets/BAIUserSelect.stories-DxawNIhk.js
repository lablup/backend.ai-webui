import{c as q,b as Le,j as m,r as K,au as $e}from"./iframe-AGqxiBsD.js";import{R as _e}from"./RelayResolver-CHvkCQbu.js";import{m as Ee,l as te}from"./storybook-mock-utils-gk3nbAE0.js";import{t as Te}from"./index-BX1ikwMP.js";import{a as Qe,u as Re}from"./useDebounce-CXK6zyUz.js";import{a as qe}from"./index-SFB7CRnA.js";import{B as Ce}from"./BAIComplexSelect-DTgkt8Id.js";import{u as Me}from"./useConnectedBAIClient-DQ7XY5ls.js";import{r as Be}from"./index-BbP8gNr0.js";import{u as le}from"./useControllableValue-CP9s7tlc.js";import{c as R}from"./compact-CU4PNV0P.js";import{c as Fe}from"./castArray-CttU1faj.js";import{m as Q}from"./map-COAHKtfI.js";import"./preload-helper-Dp1pzeXC.js";import"./index-BslRHo0-.js";import"./isNumber-EjI1REBy.js";import"./toString-NTrxrF95.js";import"./isSymbol-DgUKiFA2.js";import"./filter-DRv-sfMV.js";import"./_baseEach-CI5L9NwR.js";import"./get-CTdvF4_m.js";import"./_baseGet-DY8v201c.js";import"./identity-DKeuBCMA.js";import"./isEmpty-QF7zTopu.js";import"./useEventNotStable-DFHcPp1b.js";import"./uniqBy-BLRcGwqo.js";import"./_baseUniq-BgZSLBE1.js";import"./_arrayIncludes-B0rj_Tme.js";import"./_baseIndexOf-Be9UPhX8.js";import"./_baseFindIndex-Cj99RmFE.js";import"./toNumber-Bu4RVij_.js";import"./_trimmedEndIndex-DuQxD0U0.js";import"./reactQueryAlias-ilMWoOkC.js";import"./useUpdatableState-CLQGecqT.js";import"./compiled-D_YGP6zo.js";import"./usePopover-B1a5CrQs.js";import"./useDevWarning-P35xxvYG.js";import"./rtlStyles-T4i24HtE.js";import"./isRenderable-BUV0eL6r.js";import"./InputClearButton-hHdFlJGx.js";import"./FieldStatus-Ox3ilRvS.js";import"./composeEventHandlers-BolWE7qY.js";import"./useIndicator-Bk5bVReC.js";import"./Token-CYYOqtID.js";import"./Divider-Dfi3FLg6.js";import"./SelectorOption-CVG26JbG.js";import"./Item-CcYId2Bj.js";/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */const ae=(a,e="AND")=>{const l=a.filter(t=>!!t);return l.length===0?null:l.length===1&&e!=="NOT"?l[0]:{[e]:l}},je=(function(){var a={defaultValue:null,kind:"LocalArgument",name:"limit"},e={defaultValue:null,kind:"LocalArgument",name:"scope"},l={defaultValue:null,kind:"LocalArgument",name:"selectedFilter"},t={defaultValue:null,kind:"LocalArgument",name:"skipSelected"},s=[{condition:"skipSelected",kind:"Condition",passingValue:!1,selections:[{alias:null,args:[{kind:"Variable",name:"filter",variableName:"selectedFilter"},{kind:"Variable",name:"limit",variableName:"limit"},{kind:"Variable",name:"scope",variableName:"scope"}],concreteType:"UserV2Connection",kind:"LinkedField",name:"scopedUsersV2",plural:!1,selections:[{alias:null,args:null,concreteType:"UserV2Edge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"UserV2",kind:"LinkedField",name:"node",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null},{alias:null,args:null,concreteType:"UserV2BasicInfo",kind:"LinkedField",name:"basicInfo",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"email",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"fullName",storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}]}];return{fragment:{argumentDefinitions:[a,e,l,t],kind:"Fragment",metadata:null,name:"BAIUserSelectScopedValueQuery",selections:s,type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[e,l,a,t],kind:"Operation",name:"BAIUserSelectScopedValueQuery",selections:s},params:{cacheID:"c2a9ff13a61d75f12d48e8b3ae9c637e",id:null,metadata:{},name:"BAIUserSelectScopedValueQuery",operationKind:"query",text:`query BAIUserSelectScopedValueQuery(
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
`}}})();je.hash="7d742f7aadaab02f8f0e42cacd524eb3";const De=(function(){var a={defaultValue:null,kind:"LocalArgument",name:"filter"},e={defaultValue:null,kind:"LocalArgument",name:"limit"},l={defaultValue:null,kind:"LocalArgument",name:"offset"},t={defaultValue:null,kind:"LocalArgument",name:"orderBy"},s={defaultValue:null,kind:"LocalArgument",name:"scope"},n=[{alias:null,args:[{kind:"Variable",name:"filter",variableName:"filter"},{kind:"Variable",name:"limit",variableName:"limit"},{kind:"Variable",name:"offset",variableName:"offset"},{kind:"Variable",name:"orderBy",variableName:"orderBy"},{kind:"Variable",name:"scope",variableName:"scope"}],concreteType:"UserV2Connection",kind:"LinkedField",name:"scopedUsersV2",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"count",storageKey:null},{alias:null,args:null,concreteType:"UserV2Edge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"UserV2",kind:"LinkedField",name:"node",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null},{alias:null,args:null,concreteType:"UserV2BasicInfo",kind:"LinkedField",name:"basicInfo",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"email",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"fullName",storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:[a,e,l,t,s],kind:"Fragment",metadata:null,name:"BAIUserSelectScopedPaginatedQuery",selections:n,type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[s,l,e,a,t],kind:"Operation",name:"BAIUserSelectScopedPaginatedQuery",selections:n},params:{cacheID:"ffe0bdc5e4c13ffc25631d55383ba84a",id:null,metadata:{},name:"BAIUserSelectScopedPaginatedQuery",operationKind:"query",text:`query BAIUserSelectScopedPaginatedQuery(
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
`}}})();De.hash="a1168201ee93ae3a8f43897a1ca2fbb7";const Ke=(function(){var a=[{defaultValue:null,kind:"LocalArgument",name:"domainName"},{defaultValue:null,kind:"LocalArgument",name:"skip"}],e=[{kind:"Variable",name:"domainName",variableName:"domainName"}],l={alias:null,args:null,kind:"ScalarField",name:"entityId",storageKey:null};return{fragment:{argumentDefinitions:a,kind:"Fragment",metadata:null,name:"BAIUserSelectCurrentDomainQuery",selections:[{condition:"skip",kind:"Condition",passingValue:!1,selections:[{alias:null,args:e,concreteType:"DomainV2",kind:"LinkedField",name:"domainV2",plural:!1,selections:[l],storageKey:null}]}],type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:a,kind:"Operation",name:"BAIUserSelectCurrentDomainQuery",selections:[{condition:"skip",kind:"Condition",passingValue:!1,selections:[{alias:null,args:e,concreteType:"DomainV2",kind:"LinkedField",name:"domainV2",plural:!1,selections:[l,{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null}],storageKey:null}]}]},params:{cacheID:"2257a97980552174326033f2bed6e574",id:null,metadata:{},name:"BAIUserSelectCurrentDomainQuery",operationKind:"query",text:`query BAIUserSelectCurrentDomainQuery(
  $domainName: String!
  $skip: Boolean!
) {
  domainV2(domainName: $domainName) @skip(if: $skip) {
    entityId
    id
  }
}
`}}})();Ke.hash="16aae09024339b6a770cdf48005fbfdf";const Oe=a=>R(Q(a,e=>{var l,t;return e!=null&&e.node?{id:e.node.id,email:(l=e.node.basicInfo)==null?void 0:l.email,fullName:(t=e.node.basicInfo)==null?void 0:t.fullName}:null})),He=10,Xe=a=>{"use memo";const e=q.c(23);let l,t,s,n,r,o,i;e[0]!==a?({filter:l,excludeInactive:r,valuePropName:o,multiple:i,isLoading:t,ref:s,...n}=a,e[0]=a,e[1]=l,e[2]=t,e[3]=s,e[4]=n,e[5]=r,e[6]=o,e[7]=i):(l=e[1],t=e[2],s=e[3],n=e[4],r=e[5],o=e[6],i=e[7]);const c=r===void 0?!1:r,h=o===void 0?"email":o,f=i===void 0?!1:i;let p;e[8]===Symbol.for("react.memo_cache_sentinel")?(p={valuePropName:"value",trigger:"onChange"},e[8]=p):p=e[8];const[b,P]=le(n,p);let V;e[9]===Symbol.for("react.memo_cache_sentinel")?(V={valuePropName:"open",trigger:"onOpenChange",defaultValuePropName:"defaultOpen"},e[9]=V):V=e[9];const[C,k]=le(n,V),B=K.useDeferredValue(C),[x,N]=K.useState(""),v=Re(x),[ee,M]=K.useTransition(),[_,g]=qe(),S=K.useDeferredValue(_);let F,j;e[10]!==g?(F=()=>({refetch:()=>{M(()=>{g()})}}),j=[g,M],e[10]=g,e[11]=F,e[12]=j):(F=e[11],j=e[12]),K.useImperativeHandle(s,F,j);const E=ae([c?{status:{equals:"ACTIVE"}}:null,l]),A=K.useDeferredValue(b),D=R(Fe(A??[])),w=h==="id"&&D.length>0,I=B?"network-only":"store-only";let L;e[13]!==S||e[14]!==I?(L={fetchPolicy:I,fetchKey:S},e[13]=S,e[14]=I,e[15]=L):L=e[15];const d=w?ae([{uuid:{in:D}},E]):null,u=Math.max(D.length,1),y=!w;let T;e[16]!==d||e[17]!==u||e[18]!==y?(T={selectedFilter:d,limit:u,skipSelected:y},e[16]=d,e[17]=u,e[18]=y,e[19]=T):T=e[19];const U=w?"store-or-network":"store-only";let $;return e[20]!==S||e[21]!==U?($={fetchPolicy:U,fetchKey:S},e[20]=S,e[21]=U,e[22]=$):$=e[22],{multiple:f,isLoading:t,valuePropName:h,selectProps:n,selectedKeys:D,controllableValue:b,setControllableValue:P,controllableOpen:C,setControllableOpen:k,deferredOpen:B,deferredControllableValue:A,searchStr:x,setSearchStr:N,debouncedDeferredValue:v,isPendingRefetch:ee,listVariables:{filter:ae([E,v?{email:{iContains:v}}:null]),orderBy:[{field:"EMAIL",direction:"ASC"}]},listOptions:L,valueVariables:T,valueOptions:$}},Ye=a=>{"use memo";const e=q.c(32),{state:l,users:t,selectedUsers:s,total:n,loadNext:r,isLoadingNext:o}=a,{t:i}=Le(),{multiple:c,isLoading:h,valuePropName:f,selectProps:p,selectedKeys:b,controllableValue:P,setControllableValue:V,controllableOpen:C,setControllableOpen:k,deferredOpen:B,deferredControllableValue:x,searchStr:N,setSearchStr:v,debouncedDeferredValue:ee,isPendingRefetch:M}=l;let _;e[0]!==f?(_=d=>{if(d)return f==="id"?Te(d.id):d.email??void 0},e[0]=f,e[1]=_):_=e[1];const g=_;let S;if(e[2]!==g||e[3]!==t){let d;e[5]!==g?(d=u=>{const y=g(u);return y?{value:y,label:(u==null?void 0:u.email)??y,description:(u==null?void 0:u.fullName)??void 0}:null},e[5]=g,e[6]=d):d=e[6],S=R(Q(t,d)),e[2]=g,e[3]=t,e[4]=S}else S=e[4];const F=S;let j;e:{let d;if(e[7]!==g||e[8]!==b||e[9]!==s){let y;e[11]!==g?(y=U=>{const $=g(U);return $?[$,U.email]:null},e[11]=g,e[12]=y):y=e[12];const T=new Map(R(Q(s,y)));d=Q(b,U=>({label:T.get(U)??U,value:U})),e[7]=g,e[8]=b,e[9]=s,e[10]=d}else d=e[10];const u=d;if(c){j=u;break e}j=u[0]??null}const E=j;let A;e[13]!==i?(A=i("comp:BAIUserSelect.SelectUser"),e[13]=i,e[14]=A):A=e[14];const D=h||!!C&&!B||P!==x||N!==ee||M,w=n??void 0;let I;e[15]!==c||e[16]!==V?(I=d=>{const u=R(Fe(d??[])),y=Q(u,Ze);V(c?y:y[0],c?u:u[0])},e[15]=c,e[16]=V,e[17]=I):I=e[17];let L;return e[18]!==o||e[19]!==E||e[20]!==r||e[21]!==c||e[22]!==F||e[23]!==N||e[24]!==p||e[25]!==k||e[26]!==v||e[27]!==A||e[28]!==D||e[29]!==w||e[30]!==I?(L=m.jsx(Ce,{placeholder:A,...p,multiple:c,isLoading:D,isLoadingNext:o,total:w,options:F,value:E,onChange:I,searchValue:N,onSearch:v,onOpenChange:k,endReached:r}),e[18]=o,e[19]=E,e[20]=r,e[21]=c,e[22]=F,e[23]=N,e[24]=p,e[25]=k,e[26]=v,e[27]=A,e[28]=D,e[29]=w,e[30]=I,e[31]=L):L=e[31],L},ze=a=>{"use memo";var N,v;const e=q.c(22);let l,t;e[0]!==a?({userScope:t,...l}=a,e[0]=a,e[1]=l,e[2]=t):(l=e[1],t=e[2]);const s=Xe(l);let n;e[3]===Symbol.for("react.memo_cache_sentinel")?(n=je,e[3]=n):n=e[3];let r;e[4]!==s.valueVariables||e[5]!==t?(r={...s.valueVariables,scope:t},e[4]=s.valueVariables,e[5]=t,e[6]=r):r=e[6];const o=Be.useLazyLoadQuery(n,r,s.valueOptions);let i,c;e[7]===Symbol.for("react.memo_cache_sentinel")?(i=De,c={limit:He},e[7]=i,e[8]=c):(i=e[7],c=e[8]);let h;e[9]!==s.listVariables||e[10]!==t?(h={...s.listVariables,scope:t},e[9]=s.listVariables,e[10]=t,e[11]=h):h=e[11];let f;e[12]===Symbol.for("react.memo_cache_sentinel")?(f={getTotal:Je,getItem:We,getId:ea},e[12]=f):f=e[12];const{paginationData:p,result:b,loadNext:P,isLoadingNext:V}=Qe(i,c,h,s.listOptions,f),C=(N=o.scopedUsersV2)==null?void 0:N.edges;let k;e[13]!==C?(k=Oe(C),e[13]=C,e[14]=k):k=e[14];const B=(v=b.scopedUsersV2)==null?void 0:v.count;let x;return e[15]!==V||e[16]!==P||e[17]!==p||e[18]!==s||e[19]!==k||e[20]!==B?(x=m.jsx(Ye,{state:s,users:p,selectedUsers:k,total:B,loadNext:P,isLoadingNext:V}),e[15]=V,e[16]=P,e[17]=p,e[18]=s,e[19]=k,e[20]=B,e[21]=x):x=e[21],x},Ge=a=>{"use memo";const e=q.c(14);let l,t,s;e[0]!==a?({projectId:t,domainId:l,...s}=a,e[0]=a,e[1]=l,e[2]=t,e[3]=s):(l=e[1],t=e[2],s=e[3]);const n=Me();let r;e[4]===Symbol.for("react.memo_cache_sentinel")?(r=Ke,e[4]=r):r=e[4];const o=!!t||!!l;let i;e[5]!==n._config.domainName||e[6]!==o?(i={domainName:n._config.domainName,skip:o},e[5]=n._config.domainName,e[6]=o,e[7]=i):i=e[7];const{domainV2:c}=Be.useLazyLoadQuery(r,i),h=l??(c==null?void 0:c.entityId);if(!t&&!h)throw new Error(`Domain not found: ${n._config.domainName}`);let f;e[8]!==t||e[9]!==h?(f=t?{project:[{value:t}]}:{domain:[{value:h}]},e[8]=t,e[9]=h,e[10]=f):f=e[10];const p=f;let b;return e[11]!==s||e[12]!==p?(b=m.jsx(ze,{userScope:p,...s}),e[11]=s,e[12]=p,e[13]=b):b=e[13],b},Pe=a=>{"use memo";const e=q.c(14),{t:l}=Le();let t;e[0]!==a.placeholder||e[1]!==l?(t=a.placeholder??l("comp:BAIUserSelect.SelectUser"),e[0]=a.placeholder,e[1]=l,e[2]=t):t=e[2];let s;e[3]===Symbol.for("react.memo_cache_sentinel")?(s=[],e[3]=s):s=e[3];let n;e[4]!==a.isLabelHidden||e[5]!==a.label||e[6]!==a.width||e[7]!==t?(n=m.jsx(Ce,{label:a.label,isLabelHidden:a.isLabelHidden,width:a.width,placeholder:t,options:s,isLoading:!0,isDisabled:!0}),e[4]=a.isLabelHidden,e[5]=a.label,e[6]=a.width,e[7]=t,e[8]=n):n=e[8];let r;e[9]!==a?(r=m.jsx(Ge,{...a}),e[9]=a,e[10]=r):r=e[10];let o;return e[11]!==n||e[12]!==r?(o=m.jsx(K.Suspense,{fallback:n,children:r}),e[11]=n,e[12]=r,e[13]=o):o=e[13],o};function Ze(a){return a.value}function Je(a){var e;return((e=a.scopedUsersV2)==null?void 0:e.count)??void 0}function We(a){var e;return Oe((e=a.scopedUsersV2)==null?void 0:e.edges)}function ea(a){return a==null?void 0:a.id}const aa=Promise.resolve({_config:{domainName:"default"}}),Ja={title:"Fragments/BAIUserSelect",component:Pe,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:"\n**BAIUserSelect** — the user picker for admin and project-admin forms. Built on `BAIComplexSelect`, paged through `scopedUsersV2`.\n\n- `projectId`: the members of that project. `domainId`: the users of that domain. Neither: the current domain, whose UUID is first resolved through `domainV2`.\n- `valuePropName`: `'email'` (default) or `'id'` — which field is the plain-key value. Only `'id'` runs the `uuid in` label-resolution query; with emails the key already is the label.\n- `filter` / `excludeInactive`: composed into a `UserV2Filter` through the schema's `AND` combinator, together with the debounced `email: { iContains }` search.\n- Needs a manager >= 26.9.0, where `scopedUsersV2` exists.\n\nSee `BAIComplexSelect.stories.tsx` for the underlying popup-body component with static options.\n        "}}},decorators:[(a,e)=>m.jsx($e,{locale:te[e.globals.locale]||te.en,clientPromise:aa,anonymousClientFactory:Ee,children:m.jsx(a,{})})],argTypes:{value:{control:!1},onChange:{control:!1},filter:{control:!1},projectId:{control:!1},domainId:{control:!1},multiple:{control:{type:"boolean"}},excludeInactive:{control:{type:"boolean"}},valuePropName:{control:{type:"select"},options:["email","id"]}}},ta=[{id:"VXNlclYyOjE=",basicInfo:{email:"admin@example.com",fullName:"System Administrator"}},{id:"VXNlclYyOjI=",basicInfo:{email:"alice@example.com",fullName:"Alice Kim"}},{id:"VXNlclYyOjM=",basicInfo:{email:"bob@example.com",fullName:"Bob Lee"}},{id:"VXNlclYyOjQ=",basicInfo:{email:"carol@example.com",fullName:"Carol Park"}}],we=a=>({count:a.length,edges:a.map(e=>({node:e}))}),la={Query:()=>({scopedUsersV2:we(ta),domainV2:{entityId:"5c3b5a9e-0000-4000-8000-0000000000d0"}})},sa={Query:()=>({scopedUsersV2:we([])})},O=({initialValue:a=null,resolvers:e=la,...l})=>{const[t,s]=K.useState(a);return m.jsx(_e,{mockResolvers:e,children:m.jsx(Pe,{...l,value:t,onChange:n=>s(n??null)})})},H={parameters:{docs:{description:{story:"No scope props: resolves the current domain through `domainV2`, then lists its users."}}},render:a=>m.jsx(O,{...a,label:"User",defaultOpen:!0})},X={parameters:{docs:{description:{story:"`projectId` set: reads `scopedUsersV2` with a project scope, the members of that project."}}},render:a=>m.jsx(O,{...a,label:"Owner",projectId:"5c3b5a9e-0000-4000-8000-000000000001",defaultOpen:!0})},Y={name:"Multiple Select",parameters:{docs:{description:{story:"Multi-selection: the value is an array of keys and the trigger lists the selected emails."}}},render:a=>m.jsx(O,{...a,label:"Users",multiple:!0,initialValue:["admin@example.com"]})},z={name:"Exclude Inactive Users",parameters:{docs:{description:{story:"`excludeInactive` composes `status: { equals: ACTIVE }` into the `UserV2Filter`."}}},render:a=>m.jsx(O,{...a,label:"User",excludeInactive:!0})},G={name:"ID-valued",parameters:{docs:{description:{story:'`valuePropName="id"` — the plain-key value is the local user UUID, which is what `adminBulkAssignRole` and friends take. This is the only mode that runs the `uuid in` label-resolution query.'}}},render:a=>m.jsx(O,{...a,label:"User",valuePropName:"id"})},Z={parameters:{docs:{description:{story:"Caller-side `isLoading`, which spins the trigger the same way the internal debounce and refetch pending states do."}}},render:a=>m.jsx(O,{...a,label:"User",isLoading:!0,isDisabled:!0})},J={parameters:{docs:{description:{story:"No users match the query — the popup shows the shared empty-state text."}}},render:a=>m.jsx(O,{...a,label:"User",resolvers:sa,defaultOpen:!0})},W={parameters:{docs:{description:{story:"The error status a form item sets when its `required` rule fails."}}},render:a=>m.jsx(O,{...a,label:"User",status:{type:"error",message:"Please select users."}})};var se,ne,re;H.parameters={...H.parameters,docs:{...(se=H.parameters)==null?void 0:se.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'No scope props: resolves the current domain through \`domainV2\`, then lists its users.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" defaultOpen />
}`,...(re=(ne=H.parameters)==null?void 0:ne.docs)==null?void 0:re.source}}};var oe,ie,ce;X.parameters={...X.parameters,docs:{...(oe=X.parameters)==null?void 0:oe.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: '\`projectId\` set: reads \`scopedUsersV2\` with a project scope, the members of that project.'
      }
    }
  },
  render: args => <Sandbox {...args} label="Owner" projectId="5c3b5a9e-0000-4000-8000-000000000001" defaultOpen />
}`,...(ce=(ie=X.parameters)==null?void 0:ie.docs)==null?void 0:ce.source}}};var de,ue,me;Y.parameters={...Y.parameters,docs:{...(de=Y.parameters)==null?void 0:de.docs,source:{originalSource:`{
  name: 'Multiple Select',
  parameters: {
    docs: {
      description: {
        story: 'Multi-selection: the value is an array of keys and the trigger lists the selected emails.'
      }
    }
  },
  render: args => <Sandbox {...args} label="Users" multiple initialValue={['admin@example.com']} />
}`,...(me=(ue=Y.parameters)==null?void 0:ue.docs)==null?void 0:me.source}}};var pe,fe,ge;z.parameters={...z.parameters,docs:{...(pe=z.parameters)==null?void 0:pe.docs,source:{originalSource:`{
  name: 'Exclude Inactive Users',
  parameters: {
    docs: {
      description: {
        story: '\`excludeInactive\` composes \`status: { equals: ACTIVE }\` into the \`UserV2Filter\`.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" excludeInactive />
}`,...(ge=(fe=z.parameters)==null?void 0:fe.docs)==null?void 0:ge.source}}};var ye,he,be;G.parameters={...G.parameters,docs:{...(ye=G.parameters)==null?void 0:ye.docs,source:{originalSource:`{
  name: 'ID-valued',
  parameters: {
    docs: {
      description: {
        story: '\`valuePropName="id"\` — the plain-key value is the local user UUID, which is what \`adminBulkAssignRole\` and friends take. This is the only mode that runs the \`uuid in\` label-resolution query.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" valuePropName="id" />
}`,...(be=(he=G.parameters)==null?void 0:he.docs)==null?void 0:be.source}}};var Ve,ke,Se;Z.parameters={...Z.parameters,docs:{...(Ve=Z.parameters)==null?void 0:Ve.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Caller-side \`isLoading\`, which spins the trigger the same way the internal debounce and refetch pending states do.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" isLoading isDisabled />
}`,...(Se=(ke=Z.parameters)==null?void 0:ke.docs)==null?void 0:Se.source}}};var ve,Ie,Ue;J.parameters={...J.parameters,docs:{...(ve=J.parameters)==null?void 0:ve.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'No users match the query — the popup shows the shared empty-state text.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" resolvers={emptyResolvers} defaultOpen />
}`,...(Ue=(Ie=J.parameters)==null?void 0:Ie.docs)==null?void 0:Ue.source}}};var xe,Ne,Ae;W.parameters={...W.parameters,docs:{...(xe=W.parameters)==null?void 0:xe.docs,source:{originalSource:`{
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
}`,...(Ae=(Ne=W.parameters)==null?void 0:Ne.docs)==null?void 0:Ae.source}}};const Wa=["CurrentDomain","ProjectMembers","Multiple","ExcludeInactive","IdValued","Loading","Empty","Error"];export{H as CurrentDomain,J as Empty,W as Error,z as ExcludeInactive,G as IdValued,Z as Loading,Y as Multiple,X as ProjectMembers,Wa as __namedExportsOrder,Ja as default};
