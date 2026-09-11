import{c as Ze,a as _e,r as p,j as o}from"./iframe-DkxTTO55.js";import{R as ea}from"./RelayResolver-oe5Wi3oO.js";import{t as aa}from"./index-CF5Tcwj9.js";import{u as ta,a as ra}from"./useDebounce-CGcMt2hW.js";import{a as la}from"./index-C39EZH9X.js";import{B as na,c as ve}from"./BAIComplexSelect-C9GkZvba.js";import{r as sa}from"./index-DBGfna39.js";import{u as ke}from"./useControllableValue-CK25whFN.js";import{c as R}from"./compact-CU4PNV0P.js";import{m as j}from"./map-CkkCrgSY.js";import"./preload-helper-Dp1pzeXC.js";import"./index-DrDPfORp.js";import"./isNumber-DLtRtQZl.js";import"./toString-IfPDmGOc.js";import"./isSymbol-RwYjx0vc.js";import"./filter-AScmB5Aa.js";import"./_baseEach-CJHNIjHN.js";import"./get-CL1YI4NI.js";import"./_baseGet-BkBLlIaV.js";import"./identity-DKeuBCMA.js";import"./isEmpty-CzVGP7Sj.js";import"./useEventNotStable-chXs2IIV.js";import"./_baseUniq-CfIzt4pA.js";import"./_baseIndexOf-Be9UPhX8.js";import"./_baseFindIndex-Cj99RmFE.js";import"./noop-DX6rZLP_.js";import"./toFinite-DftPc4md.js";import"./_trimmedEndIndex-DuQxD0U0.js";import"./useConnectedBAIClient-DaT9wimZ.js";import"./reactQueryAlias-Pnku0wPb.js";import"./useIndicator-CbZAV3mr.js";import"./isRenderable-BUV0eL6r.js";import"./clamp-XwSJv1Ne.js";import"./_baseClamp-DVUOCJN_.js";import"./_baseSlice-F8doVSIJ.js";import"./toInteger-_nFR15c9.js";import"./usePopover-BsYw1VFC.js";import"./useDevWarning-Be25JA8M.js";import"./rtlStyles-T4i24HtE.js";import"./useResolvedRequired-Cdl40KtE.js";import"./composeEventHandlers-BolWE7qY.js";import"./InputClearButton-CSt6XB0b.js";import"./Divider-NPtucwAf.js";import"./some-BKLNfh2L.js";import"./Token-N-rAPsPb.js";import"./SelectorOption-BhvIYzaX.js";import"./Item-Bx6Ok9JP.js";/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */const de=(a,e="AND")=>{const t=a.filter(n=>!!n);return t.length===0?null:t.length===1&&e!=="NOT"?t[0]:{[e]:t}},Me=(function(){var a={defaultValue:null,kind:"LocalArgument",name:"limit"},e={defaultValue:null,kind:"LocalArgument",name:"selectedFilter"},t={defaultValue:null,kind:"LocalArgument",name:"skipSelected"},n=[{condition:"skipSelected",kind:"Condition",passingValue:!1,selections:[{alias:null,args:[{kind:"Variable",name:"filter",variableName:"selectedFilter"},{kind:"Variable",name:"limit",variableName:"limit"}],concreteType:"UserV2Connection",kind:"LinkedField",name:"adminUsersV2",plural:!1,selections:[{alias:null,args:null,concreteType:"UserV2Edge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"UserV2",kind:"LinkedField",name:"node",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null},{alias:null,args:null,concreteType:"UserV2BasicInfo",kind:"LinkedField",name:"basicInfo",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"email",storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}]}];return{fragment:{argumentDefinitions:[a,e,t],kind:"Fragment",metadata:null,name:"BAIAdminUserV2SelectValueQuery",selections:n,type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[e,a,t],kind:"Operation",name:"BAIAdminUserV2SelectValueQuery",selections:n},params:{cacheID:"0a609f6f54a1625212fe62168903b81c",id:null,metadata:{},name:"BAIAdminUserV2SelectValueQuery",operationKind:"query",text:`query BAIAdminUserV2SelectValueQuery(
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
        }
      }
    }
  }
}
`}}})();Me.hash="77a6ea8cc05760ecebb6a139b466b99f";const Xe=(function(){var a={defaultValue:null,kind:"LocalArgument",name:"filter"},e={defaultValue:null,kind:"LocalArgument",name:"limit"},t={defaultValue:null,kind:"LocalArgument",name:"offset"},n={defaultValue:null,kind:"LocalArgument",name:"orderBy"},c=[{alias:null,args:[{kind:"Variable",name:"filter",variableName:"filter"},{kind:"Variable",name:"limit",variableName:"limit"},{kind:"Variable",name:"offset",variableName:"offset"},{kind:"Variable",name:"orderBy",variableName:"orderBy"}],concreteType:"UserV2Connection",kind:"LinkedField",name:"adminUsersV2",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"count",storageKey:null},{alias:null,args:null,concreteType:"UserV2Edge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"UserV2",kind:"LinkedField",name:"node",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null},{alias:null,args:null,concreteType:"UserV2BasicInfo",kind:"LinkedField",name:"basicInfo",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"username",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"email",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"fullName",storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:[a,e,t,n],kind:"Fragment",metadata:null,name:"BAIAdminUserV2SelectPaginatedQuery",selections:c,type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[t,e,a,n],kind:"Operation",name:"BAIAdminUserV2SelectPaginatedQuery",selections:c},params:{cacheID:"368e3f7b0cad178c48a17c2f55fa6b49",id:null,metadata:{},name:"BAIAdminUserV2SelectPaginatedQuery",operationKind:"query",text:`query BAIAdminUserV2SelectPaginatedQuery(
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
          username
          email
          fullName
        }
      }
    }
  }
}
`}}})();Xe.hash="2f169ca5be6fb0d96fbdd2d14c0ea2bb";const Ye=a=>{"use memo";var he;const e=Ze.c(50);let t,n,c,i,b,V,v;e[0]!==a?({filter:t,excludeInactive:b,valuePropName:V,multiple:v,isLoading:n,ref:c,...i}=a,e[0]=a,e[1]=t,e[2]=n,e[3]=c,e[4]=i,e[5]=b,e[6]=V,e[7]=v):(t=e[1],n=e[2],c=e[3],i=e[4],b=e[5],V=e[6],v=e[7]);const ze=b===void 0?!1:b,I=V===void 0?"email":V,u=v===void 0?!1:v,{t:H}=_e();let U;e[8]===Symbol.for("react.memo_cache_sentinel")?(U={valuePropName:"value",trigger:"onChange"},e[8]=U):U=e[8];const[ue,G]=ke(i,U);let x;e[9]===Symbol.for("react.memo_cache_sentinel")?(x={valuePropName:"open",trigger:"onOpenChange",defaultValuePropName:"defaultOpen"},e[9]=x):x=e[9];const[me,J]=ke(i,x),pe=p.useDeferredValue(me),[k,He]=p.useState(""),W=ta(k),[Ge,fe]=p.useTransition(),[Je,A]=la(),y=p.useDeferredValue(Je),ye=de([ze?{status:{equals:"ACTIVE"}}:null,t]),ge=p.useDeferredValue(ue),N=R(ve(ge??[])),Z=I==="id"&&N.length>0;let B;e[10]===Symbol.for("react.memo_cache_sentinel")?(B=Me,e[10]=B):B=e[10];const _=Z?"store-or-network":"store-only";let F;e[11]!==y||e[12]!==_?(F={fetchPolicy:_,fetchKey:y},e[11]=y,e[12]=_,e[13]=F):F=e[13];const{adminUsersV2:ee}=sa.useLazyLoadQuery(B,{selectedFilter:Z?de([{uuid:{in:N}},ye]):null,limit:Math.max(N.length,1),skipSelected:!Z},F);let L,K;e[14]===Symbol.for("react.memo_cache_sentinel")?(K=Xe,L={limit:10},e[14]=L,e[15]=K):(L=e[14],K=e[15]);const ae=pe?"network-only":"store-only";let P;e[16]!==y||e[17]!==ae?(P={fetchPolicy:ae,fetchKey:y},e[16]=y,e[17]=ae,e[18]=P):P=e[18];let C;e[19]===Symbol.for("react.memo_cache_sentinel")?(C={getTotal:ia,getItem:ca,getId:da},e[19]=C):C=e[19];const{paginationData:te,result:We,loadNext:re,isLoadingNext:le}=ra(K,L,{filter:de([ye,W?{email:{iContains:W}}:null]),orderBy:[{field:"EMAIL",direction:"ASC"}]},P,C);let D,w;e[20]!==A?(D=()=>({refetch:()=>{fe(()=>{A()})}}),w=[A,fe],e[20]=A,e[21]=D,e[22]=w):(D=e[21],w=e[22]),p.useImperativeHandle(c,D,w);let E;e[23]!==I?(E=l=>{var r;if(l)return I==="id"?aa(l.id):((r=l.basicInfo)==null?void 0:r.email)??void 0},e[23]=I,e[24]=E):E=e[24];const m=E;let T;if(e[25]!==m||e[26]!==te){let l;e[28]!==m?(l=r=>{var s,S;const d=m(r);return d?{value:d,label:((s=r==null?void 0:r.basicInfo)==null?void 0:s.email)??d,description:((S=r==null?void 0:r.basicInfo)==null?void 0:S.fullName)??void 0}:null},e[28]=m,e[29]=l):l=e[29],T=R(j(te,l)),e[25]=m,e[26]=te,e[27]=T}else T=e[27];const ne=T;let se;e:{let l;e[30]!==m?(l=s=>{var be,Ve;const S=m(s==null?void 0:s.node);return S?[S,(Ve=(be=s==null?void 0:s.node)==null?void 0:be.basicInfo)==null?void 0:Ve.email]:null},e[30]=m,e[31]=l):l=e[31];const r=new Map(R(j(ee==null?void 0:ee.edges,l))),d=j(N,s=>({label:r.get(s)??s,value:s}));if(u){se=d;break e}se=d[0]??null}const ie=se;let g;e[32]!==H?(g=H("comp:BAIUserSelect.SelectUser"),e[32]=H,e[33]=g):g=e[33];const oe=n||ue!==ge||me!==pe||k!==W||Ge,ce=((he=We.adminUsersV2)==null?void 0:he.count)??void 0;let h;e[34]!==u||e[35]!==G?(h=l=>{const r=R(ve(l??[])),d=j(r,ua);G(u?d:d[0],u?r:r[0])},e[34]=u,e[35]=G,e[36]=h):h=e[36];let O;return e[37]!==le||e[38]!==ie||e[39]!==re||e[40]!==u||e[41]!==ne||e[42]!==k||e[43]!==i||e[44]!==J||e[45]!==g||e[46]!==oe||e[47]!==ce||e[48]!==h?(O=o.jsx(na,{placeholder:g,...i,multiple:u,isLoading:oe,isLoadingNext:le,total:ce,options:ne,value:ie,onChange:h,searchValue:k,onSearch:He,onOpenChange:J,endReached:re}),e[37]=le,e[38]=ie,e[39]=re,e[40]=u,e[41]=ne,e[42]=k,e[43]=i,e[44]=J,e[45]=g,e[46]=oe,e[47]=ce,e[48]=h,e[49]=O):O=e[49],O};function ia(a){var e;return((e=a.adminUsersV2)==null?void 0:e.count)??void 0}function oa(a){return a==null?void 0:a.node}function ca(a){var e,t;return(t=(e=a.adminUsersV2)==null?void 0:e.edges)==null?void 0:t.map(oa)}function da(a){return a==null?void 0:a.id}function ua(a){return a.value}const it={title:"Fragments/BAIAdminUserV2Select",component:Ye,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:"\n**BAIAdminUserV2Select** — superadmin-only user picker over `adminUsersV2` (managers >= 26.2.0). Built on `BAIComplexSelect`.\n\n- `valuePropName`: `'email'` (default) or `'id'` — which field is the plain-key value. Only `'id'` runs the `uuid in` label-resolution query; with emails the key already is the label.\n- `filter` / `excludeInactive`: composed into a `UserV2Filter` through the schema's `AND` combinator, together with the debounced `email: { iContains }` search.\n- Pagination is offset mode (`limit`/`offset`) — the V2 connections reject a mix with `first`/`after` at runtime.\n\nSee `BAIComplexSelect.stories.tsx` for the underlying popup-body component with static options.\n        "}}},argTypes:{value:{control:!1},onChange:{control:!1},filter:{control:!1},multiple:{control:{type:"boolean"}},excludeInactive:{control:{type:"boolean"}},valuePropName:{control:{type:"select"},options:["email","id"]}}},Se=[{id:"VXNlclYyOjE=",basicInfo:{username:"admin",email:"admin@example.com",fullName:"System Administrator"}},{id:"VXNlclYyOjI=",basicInfo:{username:"alice",email:"alice@example.com",fullName:"Alice Kim"}},{id:"VXNlclYyOjM=",basicInfo:{username:"bob",email:"bob@example.com",fullName:"Bob Lee"}},{id:"VXNlclYyOjQ=",basicInfo:{username:"carol",email:"carol@example.com",fullName:"Carol Park"}}],ma={Query:()=>({adminUsersV2:{count:Se.length,edges:Se.map(a=>({node:a}))}})},pa={Query:()=>({adminUsersV2:{count:0,edges:[]}})},f=({initialValue:a=null,resolvers:e=ma,...t})=>{const[n,c]=p.useState(a);return o.jsx(ea,{mockResolvers:e,children:o.jsx(Ye,{...t,value:n,onChange:i=>c(i??null)})})},q={name:"Single Select",parameters:{docs:{description:{story:'Single user select, `valuePropName="email"` (default).'}}},render:a=>o.jsx(f,{...a,label:"User"})},$={name:"Multiple Select",parameters:{docs:{description:{story:"Multi-selection: the value is an array of keys and the trigger lists the selected emails."}}},render:a=>o.jsx(f,{...a,label:"Users",multiple:!0,initialValue:["admin@example.com"]})},Q={name:"Exclude Inactive Users",parameters:{docs:{description:{story:"`excludeInactive` composes `status: { equals: ACTIVE }` into the `UserV2Filter`."}}},render:a=>o.jsx(f,{...a,label:"User",excludeInactive:!0})},M={name:"ID-valued",parameters:{docs:{description:{story:'`valuePropName="id"` — the plain-key value is the local user UUID, which is what `adminBulkAssignRole` and friends take. This is the only mode that runs the `uuid in` label-resolution query.'}}},render:a=>o.jsx(f,{...a,label:"User",valuePropName:"id"})},X={parameters:{docs:{description:{story:"Caller-side `isLoading`, which spins the trigger the same way the internal debounce and refetch pending states do."}}},render:a=>o.jsx(f,{...a,label:"User",isLoading:!0,isDisabled:!0})},Y={parameters:{docs:{description:{story:"No users match the query — the popup shows the shared empty-state text."}}},render:a=>o.jsx(f,{...a,label:"User",resolvers:pa,defaultOpen:!0})},z={parameters:{docs:{description:{story:"The error status a form item sets when its `required` rule fails."}}},render:a=>o.jsx(f,{...a,label:"User",status:{type:"error",message:"Please select users."}})};var Ie,Ue,xe;q.parameters={...q.parameters,docs:{...(Ie=q.parameters)==null?void 0:Ie.docs,source:{originalSource:`{
  name: 'Single Select',
  parameters: {
    docs: {
      description: {
        story: 'Single user select, \`valuePropName="email"\` (default).'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" />
}`,...(xe=(Ue=q.parameters)==null?void 0:Ue.docs)==null?void 0:xe.source}}};var Ae,Ne,Be;$.parameters={...$.parameters,docs:{...(Ae=$.parameters)==null?void 0:Ae.docs,source:{originalSource:`{
  name: 'Multiple Select',
  parameters: {
    docs: {
      description: {
        story: 'Multi-selection: the value is an array of keys and the trigger lists the selected emails.'
      }
    }
  },
  render: args => <Sandbox {...args} label="Users" multiple initialValue={['admin@example.com']} />
}`,...(Be=(Ne=$.parameters)==null?void 0:Ne.docs)==null?void 0:Be.source}}};var Fe,Le,Ke;Q.parameters={...Q.parameters,docs:{...(Fe=Q.parameters)==null?void 0:Fe.docs,source:{originalSource:`{
  name: 'Exclude Inactive Users',
  parameters: {
    docs: {
      description: {
        story: '\`excludeInactive\` composes \`status: { equals: ACTIVE }\` into the \`UserV2Filter\`.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" excludeInactive />
}`,...(Ke=(Le=Q.parameters)==null?void 0:Le.docs)==null?void 0:Ke.source}}};var Pe,Ce,De;M.parameters={...M.parameters,docs:{...(Pe=M.parameters)==null?void 0:Pe.docs,source:{originalSource:`{
  name: 'ID-valued',
  parameters: {
    docs: {
      description: {
        story: '\`valuePropName="id"\` — the plain-key value is the local user UUID, which is what \`adminBulkAssignRole\` and friends take. This is the only mode that runs the \`uuid in\` label-resolution query.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" valuePropName="id" />
}`,...(De=(Ce=M.parameters)==null?void 0:Ce.docs)==null?void 0:De.source}}};var we,Ee,Te;X.parameters={...X.parameters,docs:{...(we=X.parameters)==null?void 0:we.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Caller-side \`isLoading\`, which spins the trigger the same way the internal debounce and refetch pending states do.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" isLoading isDisabled />
}`,...(Te=(Ee=X.parameters)==null?void 0:Ee.docs)==null?void 0:Te.source}}};var Oe,Re,je;Y.parameters={...Y.parameters,docs:{...(Oe=Y.parameters)==null?void 0:Oe.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'No users match the query — the popup shows the shared empty-state text.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" resolvers={emptyResolvers} defaultOpen />
}`,...(je=(Re=Y.parameters)==null?void 0:Re.docs)==null?void 0:je.source}}};var qe,$e,Qe;z.parameters={...z.parameters,docs:{...(qe=z.parameters)==null?void 0:qe.docs,source:{originalSource:`{
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
}`,...(Qe=($e=z.parameters)==null?void 0:$e.docs)==null?void 0:Qe.source}}};const ot=["Basic","Multiple","ExcludeInactive","IdValued","Loading","Empty","Error"];export{q as Basic,Y as Empty,z as Error,Q as ExcludeInactive,M as IdValued,X as Loading,$ as Multiple,ot as __namedExportsOrder,it as default};
