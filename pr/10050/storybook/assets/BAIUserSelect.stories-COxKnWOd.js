import{c as ta,b as na,j as s,r as f,au as ha}from"./iframe-DYKFOR_H.js";import{R as ba}from"./RelayResolver-CzRAumiI.js";import{m as ka,l as Le}from"./storybook-mock-utils-gk3nbAE0.js";import{t as Va}from"./index-PSdb2ofA.js";import{u as va,a as Ia}from"./useDebounce-oexoCsLX.js";import{a as Sa}from"./index-D3SOuzKK.js";import{B as la}from"./BAIComplexSelect-DCOyfZw1.js";import{u as Ua}from"./useConnectedBAIClient-i2KpYUAh.js";import{r as Be}from"./index-pxD6w9tM.js";import{u as Fe}from"./useControllableValue-MdufIcf2.js";import{c as U}from"./compact-CU4PNV0P.js";import{m as x}from"./map-B-zBTpda.js";import{c as Ce}from"./castArray-CwQrPF-N.js";import"./preload-helper-Dp1pzeXC.js";import"./index-C3sZfc6e.js";import"./isNumber-C2oN40V-.js";import"./toString-DbpqT28l.js";import"./isSymbol-BKZfyZGa.js";import"./filter-ruSrcK22.js";import"./_baseEach-DtTrx9xn.js";import"./get-CWQPI7r4.js";import"./_baseGet-CKnB55T-.js";import"./identity-DKeuBCMA.js";import"./isEmpty-BzMS_j2a.js";import"./useEventNotStable-B1HVbQij.js";import"./uniqBy-DIXDGp0v.js";import"./_baseUniq-D5fzMPyi.js";import"./_arrayIncludes-B0rj_Tme.js";import"./_baseIndexOf-Be9UPhX8.js";import"./_baseFindIndex-Cj99RmFE.js";import"./toNumber-02RBncxQ.js";import"./_trimmedEndIndex-DuQxD0U0.js";import"./reactQueryAlias-DcdTYqrH.js";import"./useUpdatableState-kbJCVuGd.js";import"./compiled-D_YGP6zo.js";import"./usePopover-C6NImVJ3.js";import"./useDevWarning-WudIwy_f.js";import"./rtlStyles-T4i24HtE.js";import"./isRenderable-BUV0eL6r.js";import"./InputClearButton-LfzyRAR2.js";import"./FieldStatus-B9uJQtMV.js";import"./composeEventHandlers-BolWE7qY.js";import"./useIndicator-DEzeMJtD.js";import"./Token-Vc2HxANw.js";import"./Divider-xWAC13Fz.js";import"./SelectorOption-DZ9JybP0.js";import"./Item-gvxF9h3h.js";/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */const ge=(a,e="AND")=>{const t=a.filter(n=>!!n);return t.length===0?null:t.length===1&&e!=="NOT"?t[0]:{[e]:t}},ra=(function(){var a=[{defaultValue:null,kind:"LocalArgument",name:"domainName"},{defaultValue:null,kind:"LocalArgument",name:"skip"}],e=[{kind:"Variable",name:"domainName",variableName:"domainName"}],t={alias:null,args:null,kind:"ScalarField",name:"entityId",storageKey:null};return{fragment:{argumentDefinitions:a,kind:"Fragment",metadata:null,name:"BAIUserSelectCurrentDomainQuery",selections:[{condition:"skip",kind:"Condition",passingValue:!1,selections:[{alias:null,args:e,concreteType:"DomainV2",kind:"LinkedField",name:"domainV2",plural:!1,selections:[t],storageKey:null}]}],type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:a,kind:"Operation",name:"BAIUserSelectCurrentDomainQuery",selections:[{condition:"skip",kind:"Condition",passingValue:!1,selections:[{alias:null,args:e,concreteType:"DomainV2",kind:"LinkedField",name:"domainV2",plural:!1,selections:[t,{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null}],storageKey:null}]}]},params:{cacheID:"2257a97980552174326033f2bed6e574",id:null,metadata:{},name:"BAIUserSelectCurrentDomainQuery",operationKind:"query",text:`query BAIUserSelectCurrentDomainQuery(
  $domainName: String!
  $skip: Boolean!
) {
  domainV2(domainName: $domainName) @skip(if: $skip) {
    entityId
    id
  }
}
`}}})();ra.hash="16aae09024339b6a770cdf48005fbfdf";const sa=(function(){var a={defaultValue:null,kind:"LocalArgument",name:"limit"},e={defaultValue:null,kind:"LocalArgument",name:"scope"},t={defaultValue:null,kind:"LocalArgument",name:"selectedFilter"},n={defaultValue:null,kind:"LocalArgument",name:"skipSelected"},r=[{condition:"skipSelected",kind:"Condition",passingValue:!1,selections:[{alias:null,args:[{kind:"Variable",name:"filter",variableName:"selectedFilter"},{kind:"Variable",name:"limit",variableName:"limit"},{kind:"Variable",name:"scope",variableName:"scope"}],concreteType:"UserV2Connection",kind:"LinkedField",name:"scopedUsersV2",plural:!1,selections:[{alias:null,args:null,concreteType:"UserV2Edge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"UserV2",kind:"LinkedField",name:"node",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null},{alias:null,args:null,concreteType:"UserV2BasicInfo",kind:"LinkedField",name:"basicInfo",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"email",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"fullName",storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}]}];return{fragment:{argumentDefinitions:[a,e,t,n],kind:"Fragment",metadata:null,name:"BAIUserSelectScopedValueQuery",selections:r,type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[e,t,a,n],kind:"Operation",name:"BAIUserSelectScopedValueQuery",selections:r},params:{cacheID:"c2a9ff13a61d75f12d48e8b3ae9c637e",id:null,metadata:{},name:"BAIUserSelectScopedValueQuery",operationKind:"query",text:`query BAIUserSelectScopedValueQuery(
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
`}}})();sa.hash="7d742f7aadaab02f8f0e42cacd524eb3";const oa=(function(){var a={defaultValue:null,kind:"LocalArgument",name:"filter"},e={defaultValue:null,kind:"LocalArgument",name:"limit"},t={defaultValue:null,kind:"LocalArgument",name:"offset"},n={defaultValue:null,kind:"LocalArgument",name:"orderBy"},r={defaultValue:null,kind:"LocalArgument",name:"scope"},l=[{alias:null,args:[{kind:"Variable",name:"filter",variableName:"filter"},{kind:"Variable",name:"limit",variableName:"limit"},{kind:"Variable",name:"offset",variableName:"offset"},{kind:"Variable",name:"orderBy",variableName:"orderBy"},{kind:"Variable",name:"scope",variableName:"scope"}],concreteType:"UserV2Connection",kind:"LinkedField",name:"scopedUsersV2",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"count",storageKey:null},{alias:null,args:null,concreteType:"UserV2Edge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"UserV2",kind:"LinkedField",name:"node",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null},{alias:null,args:null,concreteType:"UserV2BasicInfo",kind:"LinkedField",name:"basicInfo",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"email",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"fullName",storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:[a,e,t,n,r],kind:"Fragment",metadata:null,name:"BAIUserSelectScopedPaginatedQuery",selections:l,type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[r,t,e,a,n],kind:"Operation",name:"BAIUserSelectScopedPaginatedQuery",selections:l},params:{cacheID:"ffe0bdc5e4c13ffc25631d55383ba84a",id:null,metadata:{},name:"BAIUserSelectScopedPaginatedQuery",operationKind:"query",text:`query BAIUserSelectScopedPaginatedQuery(
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
`}}})();oa.hash="a1168201ee93ae3a8f43897a1ca2fbb7";const ia=a=>U(x(a,e=>{var t,n;return e!=null&&e.node?{id:e.node.id,email:(t=e.node.basicInfo)==null?void 0:t.email,fullName:(n=e.node.basicInfo)==null?void 0:n.fullName}:null})),xa=10,Na=a=>{"use memo";var xe,Ne;const e=ta.c(56);let t,n,r,l,d,i,V,v,I;e[0]!==a?({projectId:l,domainId:t,filter:n,excludeInactive:V,valuePropName:v,multiple:I,isLoading:r,ref:d,...i}=a,e[0]=a,e[1]=t,e[2]=n,e[3]=r,e[4]=l,e[5]=d,e[6]=i,e[7]=V,e[8]=v,e[9]=I):(t=e[1],n=e[2],r=e[3],l=e[4],d=e[5],i=e[6],V=e[7],v=e[8],I=e[9]);const ma=V===void 0?!1:V,N=v===void 0?"email":v,u=I===void 0?!1:I,{t:W}=na(),A=Ua();let L;e[10]===Symbol.for("react.memo_cache_sentinel")?(L={valuePropName:"value",trigger:"onChange"},e[10]=L):L=e[10];const[he,ee]=Fe(i,L);let B;e[11]===Symbol.for("react.memo_cache_sentinel")?(B={valuePropName:"open",trigger:"onOpenChange",defaultValuePropName:"defaultOpen"},e[11]=B):B=e[11];const[be,ae]=Fe(i,B),ke=f.useDeferredValue(be),[S,ua]=f.useState(""),te=va(S),[pa,Ve]=f.useTransition(),[fa,F]=Sa(),g=f.useDeferredValue(fa);let C,j;e[12]!==F?(C=()=>({refetch:()=>{Ve(()=>{F()})}}),j=[F,Ve],e[12]=F,e[13]=C,e[14]=j):(C=e[13],j=e[14]),f.useImperativeHandle(d,C,j);let D;e[15]===Symbol.for("react.memo_cache_sentinel")?(D=ra,e[15]=D):D=e[15];const ne=!!l||!!t;let K;e[16]!==A._config.domainName||e[17]!==ne?(K={domainName:A._config.domainName,skip:ne},e[16]=A._config.domainName,e[17]=ne,e[18]=K):K=e[18];const{domainV2:le}=Be.useLazyLoadQuery(D,K),ve=t??(le==null?void 0:le.entityId);if(!l&&!ve)throw new Error(`Domain not found: ${A._config.domainName}`);const Ie=l?{project:[{value:l}]}:{domain:[{value:ve}]},Se=ge([ma?{status:{equals:"ACTIVE"}}:null,n]),Ue=f.useDeferredValue(he),w=U(Ce(Ue??[])),re=N==="id"&&w.length>0;let P;e[19]===Symbol.for("react.memo_cache_sentinel")?(P=sa,e[19]=P):P=e[19];const se=re?"store-or-network":"store-only";let $;e[20]!==g||e[21]!==se?($={fetchPolicy:se,fetchKey:g},e[20]=g,e[21]=se,e[22]=$):$=e[22];const ya=Be.useLazyLoadQuery(P,{scope:Ie,selectedFilter:re?ge([{uuid:{in:w}},Se]):null,limit:Math.max(w.length,1),skipSelected:!re},$);let O,E;e[23]===Symbol.for("react.memo_cache_sentinel")?(O=oa,E={limit:xa},e[23]=O,e[24]=E):(O=e[23],E=e[24]);const oe=ke?"network-only":"store-only";let T;e[25]!==g||e[26]!==oe?(T={fetchPolicy:oe,fetchKey:g},e[25]=g,e[26]=oe,e[27]=T):T=e[27];let Q;e[28]===Symbol.for("react.memo_cache_sentinel")?(Q={getTotal:Aa,getItem:La,getId:Ba},e[28]=Q):Q=e[28];const{paginationData:ie,result:ga,loadNext:ce,isLoadingNext:de}=Ia(O,E,{scope:Ie,filter:ge([Se,te?{email:{iContains:te}}:null]),orderBy:[{field:"EMAIL",direction:"ASC"}]},T,Q);let q;e[29]!==N?(q=o=>{if(o)return N==="id"?Va(o.id):o.email??void 0},e[29]=N,e[30]=q):q=e[30];const p=q;let R;if(e[31]!==p||e[32]!==ie){let o;e[34]!==p?(o=c=>{const m=p(c);return m?{value:m,label:(c==null?void 0:c.email)??m,description:(c==null?void 0:c.fullName)??void 0}:null},e[34]=p,e[35]=o):o=e[35],R=U(x(ie,o)),e[31]=p,e[32]=ie,e[33]=R}else R=e[33];const me=R;let ue;e:{let o;e[36]!==p?(o=k=>{const Ae=p(k);return Ae?[Ae,k.email]:null},e[36]=p,e[37]=o):o=e[37];const c=new Map(U(x(ia((xe=ya.scopedUsersV2)==null?void 0:xe.edges),o))),m=x(w,k=>({label:c.get(k)??k,value:k}));if(u){ue=m;break e}ue=m[0]??null}const pe=ue;let h;e[38]!==W?(h=W("comp:BAIUserSelect.SelectUser"),e[38]=W,e[39]=h):h=e[39];const fe=r||!!be&&!ke||he!==Ue||S!==te||pa,ye=((Ne=ga.scopedUsersV2)==null?void 0:Ne.count)??void 0;let b;e[40]!==u||e[41]!==ee?(b=o=>{const c=U(Ce(o??[])),m=x(c,Fa);ee(u?m:m[0],u?c:c[0])},e[40]=u,e[41]=ee,e[42]=b):b=e[42];let _;return e[43]!==de||e[44]!==pe||e[45]!==ce||e[46]!==u||e[47]!==me||e[48]!==S||e[49]!==i||e[50]!==ae||e[51]!==h||e[52]!==fe||e[53]!==ye||e[54]!==b?(_=s.jsx(la,{placeholder:h,...i,multiple:u,isLoading:fe,isLoadingNext:de,total:ye,options:me,value:pe,onChange:b,searchValue:S,onSearch:ua,onOpenChange:ae,endReached:ce}),e[43]=de,e[44]=pe,e[45]=ce,e[46]=u,e[47]=me,e[48]=S,e[49]=i,e[50]=ae,e[51]=h,e[52]=fe,e[53]=ye,e[54]=b,e[55]=_):_=e[55],_},ca=a=>{"use memo";const e=ta.c(14),{t}=na();let n;e[0]!==a.placeholder||e[1]!==t?(n=a.placeholder??t("comp:BAIUserSelect.SelectUser"),e[0]=a.placeholder,e[1]=t,e[2]=n):n=e[2];let r;e[3]===Symbol.for("react.memo_cache_sentinel")?(r=[],e[3]=r):r=e[3];let l;e[4]!==a.isLabelHidden||e[5]!==a.label||e[6]!==a.width||e[7]!==n?(l=s.jsx(la,{label:a.label,isLabelHidden:a.isLabelHidden,width:a.width,placeholder:n,options:r,isLoading:!0,isDisabled:!0}),e[4]=a.isLabelHidden,e[5]=a.label,e[6]=a.width,e[7]=n,e[8]=l):l=e[8];let d;e[9]!==a?(d=s.jsx(Na,{...a}),e[9]=a,e[10]=d):d=e[10];let i;return e[11]!==l||e[12]!==d?(i=s.jsx(f.Suspense,{fallback:l,children:d}),e[11]=l,e[12]=d,e[13]=i):i=e[13],i};function Aa(a){var e;return((e=a.scopedUsersV2)==null?void 0:e.count)??void 0}function La(a){var e;return ia((e=a.scopedUsersV2)==null?void 0:e.edges)}function Ba(a){return a==null?void 0:a.id}function Fa(a){return a.value}const Ca=Promise.resolve({_config:{domainName:"default"}}),Lt={title:"Fragments/BAIUserSelect",component:ca,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:"\n**BAIUserSelect** — the user picker for admin and project-admin forms. Built on `BAIComplexSelect`, paged through `scopedUsersV2`.\n\n- `projectId`: the members of that project. `domainId`: the users of that domain. Neither: the current domain, whose UUID is first resolved through `domainV2`.\n- `valuePropName`: `'email'` (default) or `'id'` — which field is the plain-key value. Only `'id'` runs the `uuid in` label-resolution query; with emails the key already is the label.\n- `filter` / `excludeInactive`: composed into a `UserV2Filter` through the schema's `AND` combinator, together with the debounced `email: { iContains }` search.\n- Needs a manager >= 26.9.0, where `scopedUsersV2` exists.\n\nSee `BAIComplexSelect.stories.tsx` for the underlying popup-body component with static options.\n        "}}},decorators:[(a,e)=>s.jsx(ha,{locale:Le[e.globals.locale]||Le.en,clientPromise:Ca,anonymousClientFactory:ka,children:s.jsx(a,{})})],argTypes:{value:{control:!1},onChange:{control:!1},filter:{control:!1},projectId:{control:!1},domainId:{control:!1},multiple:{control:{type:"boolean"}},excludeInactive:{control:{type:"boolean"}},valuePropName:{control:{type:"select"},options:["email","id"]}}},ja=[{id:"VXNlclYyOjE=",basicInfo:{email:"admin@example.com",fullName:"System Administrator"}},{id:"VXNlclYyOjI=",basicInfo:{email:"alice@example.com",fullName:"Alice Kim"}},{id:"VXNlclYyOjM=",basicInfo:{email:"bob@example.com",fullName:"Bob Lee"}},{id:"VXNlclYyOjQ=",basicInfo:{email:"carol@example.com",fullName:"Carol Park"}}],da=a=>({count:a.length,edges:a.map(e=>({node:e}))}),Da={Query:()=>({scopedUsersV2:da(ja),domainV2:{entityId:"5c3b5a9e-0000-4000-8000-0000000000d0"}})},Ka={Query:()=>({scopedUsersV2:da([])})},y=({initialValue:a=null,resolvers:e=Da,...t})=>{const[n,r]=f.useState(a);return s.jsx(ba,{mockResolvers:e,children:s.jsx(ca,{...t,value:n,onChange:l=>r(l??null)})})},M={parameters:{docs:{description:{story:"No scope props: resolves the current domain through `domainV2`, then lists its users."}}},render:a=>s.jsx(y,{...a,label:"User",defaultOpen:!0})},H={parameters:{docs:{description:{story:"`projectId` set: reads `scopedUsersV2` with a project scope, the members of that project."}}},render:a=>s.jsx(y,{...a,label:"Owner",projectId:"5c3b5a9e-0000-4000-8000-000000000001",defaultOpen:!0})},X={name:"Multiple Select",parameters:{docs:{description:{story:"Multi-selection: the value is an array of keys and the trigger lists the selected emails."}}},render:a=>s.jsx(y,{...a,label:"Users",multiple:!0,initialValue:["admin@example.com"]})},Y={name:"Exclude Inactive Users",parameters:{docs:{description:{story:"`excludeInactive` composes `status: { equals: ACTIVE }` into the `UserV2Filter`."}}},render:a=>s.jsx(y,{...a,label:"User",excludeInactive:!0})},z={name:"ID-valued",parameters:{docs:{description:{story:'`valuePropName="id"` — the plain-key value is the local user UUID, which is what `adminBulkAssignRole` and friends take. This is the only mode that runs the `uuid in` label-resolution query.'}}},render:a=>s.jsx(y,{...a,label:"User",valuePropName:"id"})},G={parameters:{docs:{description:{story:"Caller-side `isLoading`, which spins the trigger the same way the internal debounce and refetch pending states do."}}},render:a=>s.jsx(y,{...a,label:"User",isLoading:!0,isDisabled:!0})},Z={parameters:{docs:{description:{story:"No users match the query — the popup shows the shared empty-state text."}}},render:a=>s.jsx(y,{...a,label:"User",resolvers:Ka,defaultOpen:!0})},J={parameters:{docs:{description:{story:"The error status a form item sets when its `required` rule fails."}}},render:a=>s.jsx(y,{...a,label:"User",status:{type:"error",message:"Please select users."}})};var je,De,Ke;M.parameters={...M.parameters,docs:{...(je=M.parameters)==null?void 0:je.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'No scope props: resolves the current domain through \`domainV2\`, then lists its users.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" defaultOpen />
}`,...(Ke=(De=M.parameters)==null?void 0:De.docs)==null?void 0:Ke.source}}};var we,Pe,$e;H.parameters={...H.parameters,docs:{...(we=H.parameters)==null?void 0:we.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: '\`projectId\` set: reads \`scopedUsersV2\` with a project scope, the members of that project.'
      }
    }
  },
  render: args => <Sandbox {...args} label="Owner" projectId="5c3b5a9e-0000-4000-8000-000000000001" defaultOpen />
}`,...($e=(Pe=H.parameters)==null?void 0:Pe.docs)==null?void 0:$e.source}}};var Oe,Ee,Te;X.parameters={...X.parameters,docs:{...(Oe=X.parameters)==null?void 0:Oe.docs,source:{originalSource:`{
  name: 'Multiple Select',
  parameters: {
    docs: {
      description: {
        story: 'Multi-selection: the value is an array of keys and the trigger lists the selected emails.'
      }
    }
  },
  render: args => <Sandbox {...args} label="Users" multiple initialValue={['admin@example.com']} />
}`,...(Te=(Ee=X.parameters)==null?void 0:Ee.docs)==null?void 0:Te.source}}};var Qe,qe,Re;Y.parameters={...Y.parameters,docs:{...(Qe=Y.parameters)==null?void 0:Qe.docs,source:{originalSource:`{
  name: 'Exclude Inactive Users',
  parameters: {
    docs: {
      description: {
        story: '\`excludeInactive\` composes \`status: { equals: ACTIVE }\` into the \`UserV2Filter\`.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" excludeInactive />
}`,...(Re=(qe=Y.parameters)==null?void 0:qe.docs)==null?void 0:Re.source}}};var _e,Me,He;z.parameters={...z.parameters,docs:{...(_e=z.parameters)==null?void 0:_e.docs,source:{originalSource:`{
  name: 'ID-valued',
  parameters: {
    docs: {
      description: {
        story: '\`valuePropName="id"\` — the plain-key value is the local user UUID, which is what \`adminBulkAssignRole\` and friends take. This is the only mode that runs the \`uuid in\` label-resolution query.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" valuePropName="id" />
}`,...(He=(Me=z.parameters)==null?void 0:Me.docs)==null?void 0:He.source}}};var Xe,Ye,ze;G.parameters={...G.parameters,docs:{...(Xe=G.parameters)==null?void 0:Xe.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Caller-side \`isLoading\`, which spins the trigger the same way the internal debounce and refetch pending states do.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" isLoading isDisabled />
}`,...(ze=(Ye=G.parameters)==null?void 0:Ye.docs)==null?void 0:ze.source}}};var Ge,Ze,Je;Z.parameters={...Z.parameters,docs:{...(Ge=Z.parameters)==null?void 0:Ge.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'No users match the query — the popup shows the shared empty-state text.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" resolvers={emptyResolvers} defaultOpen />
}`,...(Je=(Ze=Z.parameters)==null?void 0:Ze.docs)==null?void 0:Je.source}}};var We,ea,aa;J.parameters={...J.parameters,docs:{...(We=J.parameters)==null?void 0:We.docs,source:{originalSource:`{
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
}`,...(aa=(ea=J.parameters)==null?void 0:ea.docs)==null?void 0:aa.source}}};const Bt=["CurrentDomain","ProjectMembers","Multiple","ExcludeInactive","IdValued","Loading","Empty","Error"];export{M as CurrentDomain,Z as Empty,J as Error,Y as ExcludeInactive,z as IdValued,G as Loading,X as Multiple,H as ProjectMembers,Bt as __namedExportsOrder,Lt as default};
