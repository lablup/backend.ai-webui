import{c as Ze,a0 as _e,r as p,j as o}from"./iframe-FT1A3sBL.js";import{R as ea}from"./RelayResolver-BYFbIb0_.js";import{t as aa}from"./index-BOxc0gBq.js";import{u as ta,a as ra}from"./usePaginatedQuery-MQN6YzR_.js";import{a as la}from"./index-BHZSu05I.js";import{B as na}from"./BAIComplexSelect-CsKPLmyC.js";import{r as sa}from"./index-CEmwTr92.js";import{u as ve}from"./useControllableValue-BHnqBpkG.js";import{c as de}from"./combineFilters-CraaN1TU.js";import{c as R}from"./compact-CU4PNV0P.js";import{m as j}from"./map-ERmBMkUF.js";import{c as ke}from"./castArray-_1vGRXNO.js";import"./preload-helper-Dp1pzeXC.js";import"./index-l7bRwNGJ.js";import"./isNumber-C8fbP-rb.js";import"./toString-C2KOzlUn.js";import"./isSymbol-xaJAbA34.js";import"./filter-b_EZUB2c.js";import"./_baseEach-DgxrlaOQ.js";import"./get-DpeFt8K9.js";import"./_baseGet-CBAq74ww.js";import"./identity-DKeuBCMA.js";import"./isEmpty-DfhCxq9O.js";import"./toNumber-BHI0L9eQ.js";import"./_trimmedEndIndex-DuQxD0U0.js";import"./useEventNotStable-B5meM6K-.js";import"./uniqBy-Cr4vHvwR.js";import"./_baseUniq-DS49uaTG.js";import"./_baseIndexOf-Be9UPhX8.js";import"./_baseFindIndex-Cj99RmFE.js";import"./useConnectedBAIClient-BTT_1TDL.js";import"./reactQueryAlias-CY0ommih.js";import"./useUpdatableState-DtYzK7dD.js";import"./compiled-D_YGP6zo.js";import"./useDevWarning-B4pvx2cN.js";import"./usePopover-DTSMOkHi.js";import"./rtlStyles-T4i24HtE.js";import"./composeEventHandlers-BolWE7qY.js";import"./InputClearButton-BXx9T3rd.js";import"./FieldStatus-DzOMok0b.js";import"./FormLayoutContext-B6iqkfvf.js";import"./useIsHydrating-CjC6SPxD.js";import"./useIndicator-DDQJHd-U.js";import"./Token-iMgIVrVf.js";import"./disabledInteraction-Bn2w4TRN.js";import"./Divider-B9-yhmyl.js";import"./SelectorOption-AVRImkP1.js";import"./Item-CmYqxdqs.js";import"./computeTargetAndRel-BGwjeA1c.js";const Me=(function(){var a={defaultValue:null,kind:"LocalArgument",name:"limit"},e={defaultValue:null,kind:"LocalArgument",name:"selectedFilter"},r={defaultValue:null,kind:"LocalArgument",name:"skipSelected"},s=[{condition:"skipSelected",kind:"Condition",passingValue:!1,selections:[{alias:null,args:[{kind:"Variable",name:"filter",variableName:"selectedFilter"},{kind:"Variable",name:"limit",variableName:"limit"}],concreteType:"UserV2Connection",kind:"LinkedField",name:"adminUsersV2",plural:!1,selections:[{alias:null,args:null,concreteType:"UserV2Edge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"UserV2",kind:"LinkedField",name:"node",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null},{alias:null,args:null,concreteType:"UserV2BasicInfo",kind:"LinkedField",name:"basicInfo",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"email",storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}]}];return{fragment:{argumentDefinitions:[a,e,r],kind:"Fragment",metadata:null,name:"BAIAdminUserV2SelectValueQuery",selections:s,type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[e,a,r],kind:"Operation",name:"BAIAdminUserV2SelectValueQuery",selections:s},params:{cacheID:"0a609f6f54a1625212fe62168903b81c",id:null,metadata:{},name:"BAIAdminUserV2SelectValueQuery",operationKind:"query",text:`query BAIAdminUserV2SelectValueQuery(
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
`}}})();Me.hash="77a6ea8cc05760ecebb6a139b466b99f";const Xe=(function(){var a={defaultValue:null,kind:"LocalArgument",name:"filter"},e={defaultValue:null,kind:"LocalArgument",name:"limit"},r={defaultValue:null,kind:"LocalArgument",name:"offset"},s={defaultValue:null,kind:"LocalArgument",name:"orderBy"},c=[{alias:null,args:[{kind:"Variable",name:"filter",variableName:"filter"},{kind:"Variable",name:"limit",variableName:"limit"},{kind:"Variable",name:"offset",variableName:"offset"},{kind:"Variable",name:"orderBy",variableName:"orderBy"}],concreteType:"UserV2Connection",kind:"LinkedField",name:"adminUsersV2",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"count",storageKey:null},{alias:null,args:null,concreteType:"UserV2Edge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"UserV2",kind:"LinkedField",name:"node",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null},{alias:null,args:null,concreteType:"UserV2BasicInfo",kind:"LinkedField",name:"basicInfo",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"username",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"email",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"fullName",storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:[a,e,r,s],kind:"Fragment",metadata:null,name:"BAIAdminUserV2SelectPaginatedQuery",selections:c,type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[r,e,a,s],kind:"Operation",name:"BAIAdminUserV2SelectPaginatedQuery",selections:c},params:{cacheID:"368e3f7b0cad178c48a17c2f55fa6b49",id:null,metadata:{},name:"BAIAdminUserV2SelectPaginatedQuery",operationKind:"query",text:`query BAIAdminUserV2SelectPaginatedQuery(
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
`}}})();Xe.hash="2f169ca5be6fb0d96fbdd2d14c0ea2bb";const Ye=a=>{"use memo";var he;const e=Ze.c(50);let r,s,c,i,b,V,v;e[0]!==a?({filter:r,excludeInactive:b,valuePropName:V,multiple:v,isLoading:s,ref:c,...i}=a,e[0]=a,e[1]=r,e[2]=s,e[3]=c,e[4]=i,e[5]=b,e[6]=V,e[7]=v):(r=e[1],s=e[2],c=e[3],i=e[4],b=e[5],V=e[6],v=e[7]);const ze=b===void 0?!1:b,I=V===void 0?"email":V,m=v===void 0?!1:v,{t:H}=_e();let U;e[8]===Symbol.for("react.memo_cache_sentinel")?(U={valuePropName:"value",trigger:"onChange"},e[8]=U):U=e[8];const[me,G]=ve(i,U);let x;e[9]===Symbol.for("react.memo_cache_sentinel")?(x={valuePropName:"open",trigger:"onOpenChange",defaultValuePropName:"defaultOpen"},e[9]=x):x=e[9];const[ue,J]=ve(i,x),pe=p.useDeferredValue(ue),[k,He]=p.useState(""),W=ta(k),[Ge,fe]=p.useTransition(),[Je,A]=la(),y=p.useDeferredValue(Je),ye=de([ze?{status:{equals:"ACTIVE"}}:null,r]),ge=p.useDeferredValue(me),N=R(ke(ge??[])),Z=I==="id"&&N.length>0;let B;e[10]===Symbol.for("react.memo_cache_sentinel")?(B=Me,e[10]=B):B=e[10];const _=Z?"store-or-network":"store-only";let F;e[11]!==y||e[12]!==_?(F={fetchPolicy:_,fetchKey:y},e[11]=y,e[12]=_,e[13]=F):F=e[13];const{adminUsersV2:ee}=sa.useLazyLoadQuery(B,{selectedFilter:Z?de([{uuid:{in:N}},ye]):null,limit:Math.max(N.length,1),skipSelected:!Z},F);let L,K;e[14]===Symbol.for("react.memo_cache_sentinel")?(K=Xe,L={limit:10},e[14]=L,e[15]=K):(L=e[14],K=e[15]);const ae=pe?"network-only":"store-only";let P;e[16]!==y||e[17]!==ae?(P={fetchPolicy:ae,fetchKey:y},e[16]=y,e[17]=ae,e[18]=P):P=e[18];let C;e[19]===Symbol.for("react.memo_cache_sentinel")?(C={getTotal:ia,getItem:ca,getId:da},e[19]=C):C=e[19];const{paginationData:te,result:We,loadNext:re,isLoadingNext:le}=ra(K,L,{filter:de([ye,W?{email:{iContains:W}}:null]),orderBy:[{field:"EMAIL",direction:"ASC"}]},P,C);let w,D;e[20]!==A?(w=()=>({refetch:()=>{fe(()=>{A()})}}),D=[A,fe],e[20]=A,e[21]=w,e[22]=D):(w=e[21],D=e[22]),p.useImperativeHandle(c,w,D);let E;e[23]!==I?(E=l=>{var t;if(l)return I==="id"?aa(l.id):((t=l.basicInfo)==null?void 0:t.email)??void 0},e[23]=I,e[24]=E):E=e[24];const u=E;let T;if(e[25]!==u||e[26]!==te){let l;e[28]!==u?(l=t=>{var n,S;const d=u(t);return d?{value:d,label:((n=t==null?void 0:t.basicInfo)==null?void 0:n.email)??d,description:((S=t==null?void 0:t.basicInfo)==null?void 0:S.fullName)??void 0}:null},e[28]=u,e[29]=l):l=e[29],T=R(j(te,l)),e[25]=u,e[26]=te,e[27]=T}else T=e[27];const ne=T;let se;e:{let l;e[30]!==u?(l=n=>{var be,Ve;const S=u(n==null?void 0:n.node);return S?[S,(Ve=(be=n==null?void 0:n.node)==null?void 0:be.basicInfo)==null?void 0:Ve.email]:null},e[30]=u,e[31]=l):l=e[31];const t=new Map(R(j(ee==null?void 0:ee.edges,l))),d=j(N,n=>({label:t.get(n)??n,value:n}));if(m){se=d;break e}se=d[0]??null}const ie=se;let g;e[32]!==H?(g=H("comp:BAIUserSelect.SelectUser"),e[32]=H,e[33]=g):g=e[33];const oe=s||me!==ge||ue!==pe||k!==W||Ge,ce=((he=We.adminUsersV2)==null?void 0:he.count)??void 0;let h;e[34]!==m||e[35]!==G?(h=l=>{const t=R(ke(l??[])),d=j(t,ma);G(m?d:d[0],m?t:t[0])},e[34]=m,e[35]=G,e[36]=h):h=e[36];let O;return e[37]!==le||e[38]!==ie||e[39]!==re||e[40]!==m||e[41]!==ne||e[42]!==k||e[43]!==i||e[44]!==J||e[45]!==g||e[46]!==oe||e[47]!==ce||e[48]!==h?(O=o.jsx(na,{placeholder:g,...i,multiple:m,isLoading:oe,isLoadingNext:le,total:ce,options:ne,value:ie,onChange:h,searchValue:k,onSearch:He,onOpenChange:J,endReached:re}),e[37]=le,e[38]=ie,e[39]=re,e[40]=m,e[41]=ne,e[42]=k,e[43]=i,e[44]=J,e[45]=g,e[46]=oe,e[47]=ce,e[48]=h,e[49]=O):O=e[49],O};function ia(a){var e;return((e=a.adminUsersV2)==null?void 0:e.count)??void 0}function oa(a){return a==null?void 0:a.node}function ca(a){var e,r;return(r=(e=a.adminUsersV2)==null?void 0:e.edges)==null?void 0:r.map(oa)}function da(a){return a==null?void 0:a.id}function ma(a){return a.value}const ct={title:"Fragments/BAIAdminUserV2Select",component:Ye,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:"\n**BAIAdminUserV2Select** — superadmin-only user picker over `adminUsersV2` (managers >= 26.2.0). Built on `BAIComplexSelect`.\n\n- `valuePropName`: `'email'` (default) or `'id'` — which field is the plain-key value. Only `'id'` runs the `uuid in` label-resolution query; with emails the key already is the label.\n- `filter` / `excludeInactive`: composed into a `UserV2Filter` through the schema's `AND` combinator, together with the debounced `email: { iContains }` search.\n- Pagination is offset mode (`limit`/`offset`) — the V2 connections reject a mix with `first`/`after` at runtime.\n\nSee `BAIComplexSelect.stories.tsx` for the underlying popup-body component with static options.\n        "}}},argTypes:{value:{control:!1},onChange:{control:!1},filter:{control:!1},multiple:{control:{type:"boolean"}},excludeInactive:{control:{type:"boolean"}},valuePropName:{control:{type:"select"},options:["email","id"]}}},Se=[{id:"VXNlclYyOjE=",basicInfo:{username:"admin",email:"admin@example.com",fullName:"System Administrator"}},{id:"VXNlclYyOjI=",basicInfo:{username:"alice",email:"alice@example.com",fullName:"Alice Kim"}},{id:"VXNlclYyOjM=",basicInfo:{username:"bob",email:"bob@example.com",fullName:"Bob Lee"}},{id:"VXNlclYyOjQ=",basicInfo:{username:"carol",email:"carol@example.com",fullName:"Carol Park"}}],ua={Query:()=>({adminUsersV2:{count:Se.length,edges:Se.map(a=>({node:a}))}})},pa={Query:()=>({adminUsersV2:{count:0,edges:[]}})},f=({initialValue:a=null,resolvers:e=ua,...r})=>{const[s,c]=p.useState(a);return o.jsx(ea,{mockResolvers:e,children:o.jsx(Ye,{...r,value:s,onChange:i=>c(i??null)})})},q={name:"Single Select",parameters:{docs:{description:{story:'Single user select, `valuePropName="email"` (default).'}}},render:a=>o.jsx(f,{...a,label:"User"})},$={name:"Multiple Select",parameters:{docs:{description:{story:"Multi-selection: the value is an array of keys and the trigger lists the selected emails."}}},render:a=>o.jsx(f,{...a,label:"Users",multiple:!0,initialValue:["admin@example.com"]})},Q={name:"Exclude Inactive Users",parameters:{docs:{description:{story:"`excludeInactive` composes `status: { equals: ACTIVE }` into the `UserV2Filter`."}}},render:a=>o.jsx(f,{...a,label:"User",excludeInactive:!0})},M={name:"ID-valued",parameters:{docs:{description:{story:'`valuePropName="id"` — the plain-key value is the local user UUID, which is what `adminBulkAssignRole` and friends take. This is the only mode that runs the `uuid in` label-resolution query.'}}},render:a=>o.jsx(f,{...a,label:"User",valuePropName:"id"})},X={parameters:{docs:{description:{story:"Caller-side `isLoading`, which spins the trigger the same way the internal debounce and refetch pending states do."}}},render:a=>o.jsx(f,{...a,label:"User",isLoading:!0,isDisabled:!0})},Y={parameters:{docs:{description:{story:"No users match the query — the popup shows the shared empty-state text."}}},render:a=>o.jsx(f,{...a,label:"User",resolvers:pa,defaultOpen:!0})},z={parameters:{docs:{description:{story:"The error status a form item sets when its `required` rule fails."}}},render:a=>o.jsx(f,{...a,label:"User",status:{type:"error",message:"Please select users."}})};var Ie,Ue,xe;q.parameters={...q.parameters,docs:{...(Ie=q.parameters)==null?void 0:Ie.docs,source:{originalSource:`{
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
}`,...(Ke=(Le=Q.parameters)==null?void 0:Le.docs)==null?void 0:Ke.source}}};var Pe,Ce,we;M.parameters={...M.parameters,docs:{...(Pe=M.parameters)==null?void 0:Pe.docs,source:{originalSource:`{
  name: 'ID-valued',
  parameters: {
    docs: {
      description: {
        story: '\`valuePropName="id"\` — the plain-key value is the local user UUID, which is what \`adminBulkAssignRole\` and friends take. This is the only mode that runs the \`uuid in\` label-resolution query.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" valuePropName="id" />
}`,...(we=(Ce=M.parameters)==null?void 0:Ce.docs)==null?void 0:we.source}}};var De,Ee,Te;X.parameters={...X.parameters,docs:{...(De=X.parameters)==null?void 0:De.docs,source:{originalSource:`{
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
}`,...(Qe=($e=z.parameters)==null?void 0:$e.docs)==null?void 0:Qe.source}}};const dt=["Basic","Multiple","ExcludeInactive","IdValued","Loading","Empty","Error"];export{q as Basic,Y as Empty,z as Error,Q as ExcludeInactive,M as IdValued,X as Loading,$ as Multiple,dt as __namedExportsOrder,ct as default};
