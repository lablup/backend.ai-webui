import{c as Ze,a as _e,r as p,j as o}from"./iframe-C3wEQjJX.js";import{R as ea}from"./RelayResolver--7Qbm5Cs.js";import{t as aa}from"./index-CEWG2ItR.js";import{u as ta,a as ra}from"./useDebounce-uJe0COEM.js";import{a as la}from"./index-BNmiQvag.js";import{B as na,c as be}from"./BAIComplexSelect-DoqCF_gE.js";import{r as sa}from"./index-DSQwsJOm.js";import{u as Ve}from"./useControllableValue-D2__E8Jf.js";import{c as R}from"./compact-CU4PNV0P.js";import{m as j}from"./map-BKO0OxD3.js";import"./preload-helper-Dp1pzeXC.js";import"./index-C9dRgJuM.js";import"./isNumber-DWZjCFKM.js";import"./toString-DM5OEoT1.js";import"./isSymbol-B-9H3ZQM.js";import"./filter-DRrpdjEi.js";import"./_baseEach-av-lyeX2.js";import"./get-DkCwW9Kx.js";import"./_baseGet-B1PNOIYa.js";import"./identity-DKeuBCMA.js";import"./isEmpty-BwdMAS97.js";import"./useEventNotStable-RFL925cB.js";import"./_baseUniq-ChB_m_84.js";import"./_baseIndexOf-Be9UPhX8.js";import"./_baseFindIndex-Cj99RmFE.js";import"./noop-DX6rZLP_.js";import"./toFinite-BibqG8nK.js";import"./_trimmedEndIndex-DuQxD0U0.js";import"./useConnectedBAIClient-BSH3jEr2.js";import"./reactQueryAlias-s_iu8yrs.js";import"./useIndicator-D7cPz661.js";import"./isRenderable-BUV0eL6r.js";import"./clamp-DyLbGlsi.js";import"./_baseClamp-DVUOCJN_.js";import"./_baseSlice-F8doVSIJ.js";import"./toInteger-Bp62cOo-.js";import"./usePopover-eoGZxrTr.js";import"./useDevWarning-CIkK5rGt.js";import"./rtlStyles-T4i24HtE.js";import"./useResolvedRequired-xEmeIHsW.js";import"./composeEventHandlers-BolWE7qY.js";import"./InputClearButton-C78K8EN0.js";import"./Divider-CnRZW_oO.js";import"./some-1sYeNcsZ.js";import"./Token-fWUk93-o.js";import"./SelectorOption-DOL-Q-zE.js";import"./Item-Ddcq3F1d.js";/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */const de=a=>{const e=a.filter(t=>!!t);return e.length===0?null:e.length===1?e[0]:{AND:e}},$e=(function(){var a={defaultValue:null,kind:"LocalArgument",name:"limit"},e={defaultValue:null,kind:"LocalArgument",name:"selectedFilter"},t={defaultValue:null,kind:"LocalArgument",name:"skipSelected"},s=[{condition:"skipSelected",kind:"Condition",passingValue:!1,selections:[{alias:null,args:[{kind:"Variable",name:"filter",variableName:"selectedFilter"},{kind:"Variable",name:"limit",variableName:"limit"}],concreteType:"UserV2Connection",kind:"LinkedField",name:"adminUsersV2",plural:!1,selections:[{alias:null,args:null,concreteType:"UserV2Edge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"UserV2",kind:"LinkedField",name:"node",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null},{alias:null,args:null,concreteType:"UserV2BasicInfo",kind:"LinkedField",name:"basicInfo",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"email",storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}]}];return{fragment:{argumentDefinitions:[a,e,t],kind:"Fragment",metadata:null,name:"BAIAdminUserV2SelectValueQuery",selections:s,type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[e,a,t],kind:"Operation",name:"BAIAdminUserV2SelectValueQuery",selections:s},params:{cacheID:"0a609f6f54a1625212fe62168903b81c",id:null,metadata:{},name:"BAIAdminUserV2SelectValueQuery",operationKind:"query",text:`query BAIAdminUserV2SelectValueQuery(
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
`}}})();$e.hash="77a6ea8cc05760ecebb6a139b466b99f";const Qe=(function(){var a={defaultValue:null,kind:"LocalArgument",name:"filter"},e={defaultValue:null,kind:"LocalArgument",name:"limit"},t={defaultValue:null,kind:"LocalArgument",name:"offset"},s={defaultValue:null,kind:"LocalArgument",name:"orderBy"},c=[{alias:null,args:[{kind:"Variable",name:"filter",variableName:"filter"},{kind:"Variable",name:"limit",variableName:"limit"},{kind:"Variable",name:"offset",variableName:"offset"},{kind:"Variable",name:"orderBy",variableName:"orderBy"}],concreteType:"UserV2Connection",kind:"LinkedField",name:"adminUsersV2",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"count",storageKey:null},{alias:null,args:null,concreteType:"UserV2Edge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"UserV2",kind:"LinkedField",name:"node",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null},{alias:null,args:null,concreteType:"UserV2BasicInfo",kind:"LinkedField",name:"basicInfo",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"username",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"email",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"fullName",storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:[a,e,t,s],kind:"Fragment",metadata:null,name:"BAIAdminUserV2SelectPaginatedQuery",selections:c,type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[t,e,a,s],kind:"Operation",name:"BAIAdminUserV2SelectPaginatedQuery",selections:c},params:{cacheID:"368e3f7b0cad178c48a17c2f55fa6b49",id:null,metadata:{},name:"BAIAdminUserV2SelectPaginatedQuery",operationKind:"query",text:`query BAIAdminUserV2SelectPaginatedQuery(
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
`}}})();Qe.hash="2f169ca5be6fb0d96fbdd2d14c0ea2bb";const Me=a=>{"use memo";var ye;const e=Ze.c(50);let t,s,c,i,b,V,v;e[0]!==a?({filter:t,excludeInactive:b,valuePropName:V,multiple:v,isLoading:s,ref:c,...i}=a,e[0]=a,e[1]=t,e[2]=s,e[3]=c,e[4]=i,e[5]=b,e[6]=V,e[7]=v):(t=e[1],s=e[2],c=e[3],i=e[4],b=e[5],V=e[6],v=e[7]);const Xe=b===void 0?!1:b,I=V===void 0?"email":V,u=v===void 0?!1:v,{t:H}=_e();let U;e[8]===Symbol.for("react.memo_cache_sentinel")?(U={valuePropName:"value",trigger:"onChange"},e[8]=U):U=e[8];const[ue,W]=Ve(i,U);let x;e[9]===Symbol.for("react.memo_cache_sentinel")?(x={valuePropName:"open",trigger:"onOpenChange",defaultValuePropName:"defaultOpen"},e[9]=x):x=e[9];const[Ye,G]=Ve(i,x),ze=p.useDeferredValue(Ye),[k,He]=p.useState(""),J=ta(k),[We,me]=p.useTransition(),[Ge,A]=la(),y=p.useDeferredValue(Ge),pe=de([Xe?{status:{equals:"ACTIVE"}}:null,t]),fe=p.useDeferredValue(ue),N=R(be(fe??[])),Z=I==="id"&&N.length>0;let B;e[10]===Symbol.for("react.memo_cache_sentinel")?(B=$e,e[10]=B):B=e[10];const _=Z?"store-or-network":"store-only";let F;e[11]!==y||e[12]!==_?(F={fetchPolicy:_,fetchKey:y},e[11]=y,e[12]=_,e[13]=F):F=e[13];const{adminUsersV2:ee}=sa.useLazyLoadQuery(B,{selectedFilter:Z?de([{uuid:{in:N}},pe]):null,limit:Math.max(N.length,1),skipSelected:!Z},F);let L,K;e[14]===Symbol.for("react.memo_cache_sentinel")?(K=Qe,L={limit:10},e[14]=L,e[15]=K):(L=e[14],K=e[15]);const ae=ze?"network-only":"store-only";let P;e[16]!==y||e[17]!==ae?(P={fetchPolicy:ae,fetchKey:y},e[16]=y,e[17]=ae,e[18]=P):P=e[18];let C;e[19]===Symbol.for("react.memo_cache_sentinel")?(C={getTotal:ia,getItem:ca,getId:da},e[19]=C):C=e[19];const{paginationData:te,result:Je,loadNext:re,isLoadingNext:le}=ra(K,L,{filter:de([pe,J?{email:{iContains:J}}:null]),orderBy:[{field:"EMAIL",direction:"ASC"}]},P,C);let D,w;e[20]!==A?(D=()=>({refetch:()=>{me(()=>{A()})}}),w=[A,me],e[20]=A,e[21]=D,e[22]=w):(D=e[21],w=e[22]),p.useImperativeHandle(c,D,w);let E;e[23]!==I?(E=l=>{var r;if(l)return I==="id"?aa(l.id):((r=l.basicInfo)==null?void 0:r.email)??void 0},e[23]=I,e[24]=E):E=e[24];const m=E;let T;if(e[25]!==m||e[26]!==te){let l;e[28]!==m?(l=r=>{var n,S;const d=m(r);return d?{value:d,label:((n=r==null?void 0:r.basicInfo)==null?void 0:n.email)??d,description:((S=r==null?void 0:r.basicInfo)==null?void 0:S.fullName)??void 0}:null},e[28]=m,e[29]=l):l=e[29],T=R(j(te,l)),e[25]=m,e[26]=te,e[27]=T}else T=e[27];const ne=T;let se;e:{let l;e[30]!==m?(l=n=>{var ge,he;const S=m(n==null?void 0:n.node);return S?[S,(he=(ge=n==null?void 0:n.node)==null?void 0:ge.basicInfo)==null?void 0:he.email]:null},e[30]=m,e[31]=l):l=e[31];const r=new Map(R(j(ee==null?void 0:ee.edges,l))),d=j(N,n=>({label:r.get(n)??n,value:n}));if(u){se=d;break e}se=d[0]??null}const ie=se;let g;e[32]!==H?(g=H("comp:BAIUserSelect.SelectUser"),e[32]=H,e[33]=g):g=e[33];const oe=s||ue!==fe||k!==J||We,ce=((ye=Je.adminUsersV2)==null?void 0:ye.count)??void 0;let h;e[34]!==u||e[35]!==W?(h=l=>{const r=R(be(l??[])),d=j(r,ua);W(u?d:d[0],u?r:r[0])},e[34]=u,e[35]=W,e[36]=h):h=e[36];let O;return e[37]!==le||e[38]!==ie||e[39]!==re||e[40]!==u||e[41]!==ne||e[42]!==k||e[43]!==i||e[44]!==G||e[45]!==g||e[46]!==oe||e[47]!==ce||e[48]!==h?(O=o.jsx(na,{placeholder:g,...i,multiple:u,isLoading:oe,isLoadingNext:le,total:ce,options:ne,value:ie,onChange:h,searchValue:k,onSearch:He,onOpenChange:G,endReached:re}),e[37]=le,e[38]=ie,e[39]=re,e[40]=u,e[41]=ne,e[42]=k,e[43]=i,e[44]=G,e[45]=g,e[46]=oe,e[47]=ce,e[48]=h,e[49]=O):O=e[49],O};function ia(a){var e;return((e=a.adminUsersV2)==null?void 0:e.count)??void 0}function oa(a){return a==null?void 0:a.node}function ca(a){var e,t;return(t=(e=a.adminUsersV2)==null?void 0:e.edges)==null?void 0:t.map(oa)}function da(a){return a==null?void 0:a.id}function ua(a){return a.value}const it={title:"Fragments/BAIAdminUserV2Select",component:Me,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:"\n**BAIAdminUserV2Select** — superadmin-only user picker over `adminUsersV2` (managers >= 26.2.0). Built on `BAIComplexSelect`.\n\n- `valuePropName`: `'email'` (default) or `'id'` — which field is the plain-key value. Only `'id'` runs the `uuid in` label-resolution query; with emails the key already is the label.\n- `filter` / `excludeInactive`: composed into a `UserV2Filter` through the schema's `AND` combinator, together with the debounced `email: { iContains }` search.\n- Pagination is offset mode (`limit`/`offset`) — the V2 connections reject a mix with `first`/`after` at runtime.\n\nSee `BAIComplexSelect.stories.tsx` for the underlying popup-body component with static options.\n        "}}},argTypes:{value:{control:!1},onChange:{control:!1},filter:{control:!1},multiple:{control:{type:"boolean"}},excludeInactive:{control:{type:"boolean"}},valuePropName:{control:{type:"select"},options:["email","id"]}}},ve=[{id:"VXNlclYyOjE=",basicInfo:{username:"admin",email:"admin@example.com",fullName:"System Administrator"}},{id:"VXNlclYyOjI=",basicInfo:{username:"alice",email:"alice@example.com",fullName:"Alice Kim"}},{id:"VXNlclYyOjM=",basicInfo:{username:"bob",email:"bob@example.com",fullName:"Bob Lee"}},{id:"VXNlclYyOjQ=",basicInfo:{username:"carol",email:"carol@example.com",fullName:"Carol Park"}}],ma={Query:()=>({adminUsersV2:{count:ve.length,edges:ve.map(a=>({node:a}))}})},pa={Query:()=>({adminUsersV2:{count:0,edges:[]}})},f=({initialValue:a=null,resolvers:e=ma,...t})=>{const[s,c]=p.useState(a);return o.jsx(ea,{mockResolvers:e,children:o.jsx(Me,{...t,value:s,onChange:i=>c(i??null)})})},q={name:"Single Select",parameters:{docs:{description:{story:'Single user select, `valuePropName="email"` (default).'}}},render:a=>o.jsx(f,{...a,label:"User"})},$={name:"Multiple Select",parameters:{docs:{description:{story:"Multi-selection: the value is an array of keys and the trigger lists the selected emails."}}},render:a=>o.jsx(f,{...a,label:"Users",multiple:!0,initialValue:["admin@example.com"]})},Q={name:"Exclude Inactive Users",parameters:{docs:{description:{story:"`excludeInactive` composes `status: { equals: ACTIVE }` into the `UserV2Filter`."}}},render:a=>o.jsx(f,{...a,label:"User",excludeInactive:!0})},M={name:"ID-valued",parameters:{docs:{description:{story:'`valuePropName="id"` — the plain-key value is the local user UUID, which is what `adminBulkAssignRole` and friends take. This is the only mode that runs the `uuid in` label-resolution query.'}}},render:a=>o.jsx(f,{...a,label:"User",valuePropName:"id"})},X={parameters:{docs:{description:{story:"Caller-side `isLoading`, which spins the trigger the same way the internal debounce and refetch pending states do."}}},render:a=>o.jsx(f,{...a,label:"User",isLoading:!0,isDisabled:!0})},Y={parameters:{docs:{description:{story:"No users match the query — the popup shows the shared empty-state text."}}},render:a=>o.jsx(f,{...a,label:"User",resolvers:pa,defaultOpen:!0})},z={parameters:{docs:{description:{story:"The error status a form item sets when its `required` rule fails."}}},render:a=>o.jsx(f,{...a,label:"User",status:{type:"error",message:"Please select users."}})};var ke,Se,Ie;q.parameters={...q.parameters,docs:{...(ke=q.parameters)==null?void 0:ke.docs,source:{originalSource:`{
  name: 'Single Select',
  parameters: {
    docs: {
      description: {
        story: 'Single user select, \`valuePropName="email"\` (default).'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" />
}`,...(Ie=(Se=q.parameters)==null?void 0:Se.docs)==null?void 0:Ie.source}}};var Ue,xe,Ae;$.parameters={...$.parameters,docs:{...(Ue=$.parameters)==null?void 0:Ue.docs,source:{originalSource:`{
  name: 'Multiple Select',
  parameters: {
    docs: {
      description: {
        story: 'Multi-selection: the value is an array of keys and the trigger lists the selected emails.'
      }
    }
  },
  render: args => <Sandbox {...args} label="Users" multiple initialValue={['admin@example.com']} />
}`,...(Ae=(xe=$.parameters)==null?void 0:xe.docs)==null?void 0:Ae.source}}};var Ne,Be,Fe;Q.parameters={...Q.parameters,docs:{...(Ne=Q.parameters)==null?void 0:Ne.docs,source:{originalSource:`{
  name: 'Exclude Inactive Users',
  parameters: {
    docs: {
      description: {
        story: '\`excludeInactive\` composes \`status: { equals: ACTIVE }\` into the \`UserV2Filter\`.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" excludeInactive />
}`,...(Fe=(Be=Q.parameters)==null?void 0:Be.docs)==null?void 0:Fe.source}}};var Le,Ke,Pe;M.parameters={...M.parameters,docs:{...(Le=M.parameters)==null?void 0:Le.docs,source:{originalSource:`{
  name: 'ID-valued',
  parameters: {
    docs: {
      description: {
        story: '\`valuePropName="id"\` — the plain-key value is the local user UUID, which is what \`adminBulkAssignRole\` and friends take. This is the only mode that runs the \`uuid in\` label-resolution query.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" valuePropName="id" />
}`,...(Pe=(Ke=M.parameters)==null?void 0:Ke.docs)==null?void 0:Pe.source}}};var Ce,De,we;X.parameters={...X.parameters,docs:{...(Ce=X.parameters)==null?void 0:Ce.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Caller-side \`isLoading\`, which spins the trigger the same way the internal debounce and refetch pending states do.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" isLoading isDisabled />
}`,...(we=(De=X.parameters)==null?void 0:De.docs)==null?void 0:we.source}}};var Ee,Te,Oe;Y.parameters={...Y.parameters,docs:{...(Ee=Y.parameters)==null?void 0:Ee.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'No users match the query — the popup shows the shared empty-state text.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" resolvers={emptyResolvers} defaultOpen />
}`,...(Oe=(Te=Y.parameters)==null?void 0:Te.docs)==null?void 0:Oe.source}}};var Re,je,qe;z.parameters={...z.parameters,docs:{...(Re=z.parameters)==null?void 0:Re.docs,source:{originalSource:`{
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
}`,...(qe=(je=z.parameters)==null?void 0:je.docs)==null?void 0:qe.source}}};const ot=["Basic","Multiple","ExcludeInactive","IdValued","Loading","Empty","Error"];export{q as Basic,Y as Empty,z as Error,Q as ExcludeInactive,M as IdValued,X as Loading,$ as Multiple,ot as __namedExportsOrder,it as default};
