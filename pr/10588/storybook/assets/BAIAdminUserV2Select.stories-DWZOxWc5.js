import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-D0Ex1IVc.js";import{n,t as r}from"./castArray-AZdtGfv6.js";import{n as i,t as a}from"./compact-C9OPbfhP.js";import{m as ee,r as te,t as o}from"./hooks-C37w8Ol6.js";import{n as s,t as c}from"./map-CLZMgxwS.js";import{t as l}from"./jsx-runtime-MKhVqBIO.js";import{n as ne,t as u}from"./useBAIi18n-Biey1teG.js";import{t as d}from"./compiler-runtime-CdReTaax.js";import{t as re}from"./react-relay-sBALIJlt.js";import{c as f,v as p}from"./helper-CPPrFJ2v.js";import{i as ie,n as ae,r as m,t as h}from"./usePaginatedQuery-DpR2OxCq.js";import{n as g,t as oe}from"./BAIComplexSelect-DoVaWoY7.js";import{n as se,t as _}from"./RelayResolver-CMrgwoPg.js";var v;function y(){return(y=e((()=>{v=(function(){var e={defaultValue:null,kind:`LocalArgument`,name:`limit`},t={defaultValue:null,kind:`LocalArgument`,name:`selectedFilter`},n={defaultValue:null,kind:`LocalArgument`,name:`skipSelected`},r=[{condition:`skipSelected`,kind:`Condition`,passingValue:!1,selections:[{alias:null,args:[{kind:`Variable`,name:`filter`,variableName:`selectedFilter`},{kind:`Variable`,name:`limit`,variableName:`limit`}],concreteType:`UserV2Connection`,kind:`LinkedField`,name:`adminUsersV2`,plural:!1,selections:[{alias:null,args:null,concreteType:`UserV2Edge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`UserV2`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`entityId`,storageKey:null},{alias:null,args:null,concreteType:`UserV2BasicInfo`,kind:`LinkedField`,name:`basicInfo`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`email`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}]}];return{fragment:{argumentDefinitions:[e,t,n],kind:`Fragment`,metadata:null,name:`BAIAdminUserV2SelectValueQuery`,selections:r,type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[t,e,n],kind:`Operation`,name:`BAIAdminUserV2SelectValueQuery`,selections:r},params:{cacheID:`61cb5dc45fcae42e7aad0e471b20a661`,id:null,metadata:{},name:`BAIAdminUserV2SelectValueQuery`,operationKind:`query`,text:`query BAIAdminUserV2SelectValueQuery(
  $selectedFilter: UserV2Filter
  $limit: Int!
  $skipSelected: Boolean!
) {
  adminUsersV2(filter: $selectedFilter, limit: $limit) @skip(if: $skipSelected) {
    edges {
      node {
        id
        entityId
        basicInfo {
          email
        }
      }
    }
  }
}
`}}})(),v.hash=`d22655746aecaf91c90c662fb52bffde`})))()}var b;function x(){return(x=e((()=>{b=(function(){var e={defaultValue:null,kind:`LocalArgument`,name:`filter`},t={defaultValue:null,kind:`LocalArgument`,name:`limit`},n={defaultValue:null,kind:`LocalArgument`,name:`offset`},r={defaultValue:null,kind:`LocalArgument`,name:`orderBy`},i=[{alias:null,args:[{kind:`Variable`,name:`filter`,variableName:`filter`},{kind:`Variable`,name:`limit`,variableName:`limit`},{kind:`Variable`,name:`offset`,variableName:`offset`},{kind:`Variable`,name:`orderBy`,variableName:`orderBy`}],concreteType:`UserV2Connection`,kind:`LinkedField`,name:`adminUsersV2`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`count`,storageKey:null},{alias:null,args:null,concreteType:`UserV2Edge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`UserV2`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`entityId`,storageKey:null},{alias:null,args:null,concreteType:`UserV2BasicInfo`,kind:`LinkedField`,name:`basicInfo`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`username`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`email`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`fullName`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:[e,t,n,r],kind:`Fragment`,metadata:null,name:`BAIAdminUserV2SelectPaginatedQuery`,selections:i,type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[n,t,e,r],kind:`Operation`,name:`BAIAdminUserV2SelectPaginatedQuery`,selections:i},params:{cacheID:`d964e6db69be3ea4621776141153a22f`,id:null,metadata:{},name:`BAIAdminUserV2SelectPaginatedQuery`,operationKind:`query`,text:`query BAIAdminUserV2SelectPaginatedQuery(
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
        entityId
        basicInfo {
          username
          email
          fullName
        }
      }
    }
  }
}
`}}})(),b.hash=`f75c9575eef21ebcd16c8f12a9b15dbe`})))()}function ce(e){return e.adminUsersV2?.count??void 0}function S(e){return e?.node}function le(e){return e.adminUsersV2?.edges?.map(S)}function ue(e){return e?.id}function de(e){return e.value}var fe,C,pe,me,w;function T(){return(T=e((()=>{y(),x(),fe=d(),f(),m(),o(),u(),h(),g(),i(),n(),c(),C=t(),pe=re(),me=l(),w=e=>{"use memo";let t=(0,fe.c)(50),n,i,o,c,l,u,d;t[0]===e?(n=t[1],i=t[2],o=t[3],c=t[4],l=t[5],u=t[6],d=t[7]):({filter:n,excludeInactive:l,valuePropName:u,multiple:d,isLoading:i,ref:o,...c}=e,t[0]=e,t[1]=n,t[2]=i,t[3]=o,t[4]=c,t[5]=l,t[6]=u,t[7]=d);let re=l!==void 0&&l,f=u===void 0?`email`:u,m=d!==void 0&&d,{t:h}=ne(),g;t[8]===Symbol.for(`react.memo_cache_sentinel`)?(g={valuePropName:`value`,trigger:`onChange`},t[8]=g):g=t[8];let[se,_]=ee(c,g),y;t[9]===Symbol.for(`react.memo_cache_sentinel`)?(y={valuePropName:`open`,trigger:`onOpenChange`,defaultValuePropName:`defaultOpen`},t[9]=y):y=t[9];let[x,S]=ee(c,y),w=(0,C.useDeferredValue)(x),[T,E]=(0,C.useState)(``),D=ie(T),[he,O]=(0,C.useTransition)(),[ge,k]=te(),A=(0,C.useDeferredValue)(ge),j=p([re?{status:{equals:`ACTIVE`}}:null,n]),M=(0,C.useDeferredValue)(se),N;t[10]===M?N=t[11]:(N=M??[],t[10]=M,t[11]=N);let P=a(r(N)),F=f===`id`&&P.length>0,I=F?`store-or-network`:`store-only`,L;t[12]!==A||t[13]!==I?(L={fetchPolicy:I,fetchKey:A},t[12]=A,t[13]=I,t[14]=L):L=t[14];let{adminUsersV2:R}=(0,pe.useLazyLoadQuery)(v,{selectedFilter:F?p([{uuid:{in:P}},j]):null,limit:Math.max(P.length,1),skipSelected:!F},L),z;t[15]===Symbol.for(`react.memo_cache_sentinel`)?(z={limit:10},t[15]=z):z=t[15];let B=w?`network-only`:`store-only`,V;t[16]!==A||t[17]!==B?(V={fetchPolicy:B,fetchKey:A},t[16]=A,t[17]=B,t[18]=V):V=t[18];let H;t[19]===Symbol.for(`react.memo_cache_sentinel`)?(H={getTotal:ce,getItem:le,getId:ue},t[19]=H):H=t[19];let{paginationData:U,result:_e,loadNext:W,isLoadingNext:G}=ae(b,z,{filter:p([j,D?{email:{iContains:D}}:null]),orderBy:[{field:`EMAIL`,direction:`ASC`}]},V,H),K,q;t[20]===k?(K=t[21],q=t[22]):(K=()=>({refetch:()=>{O(()=>{k()})}}),q=[k,O],t[20]=k,t[21]=K,t[22]=q),(0,C.useImperativeHandle)(o,K,q);let J;t[23]===f?J=t[24]:(J=e=>{if(e)return f===`id`?e.entityId:e.basicInfo?.email??void 0},t[23]=f,t[24]=J);let Y=J,X;if(t[25]!==Y||t[26]!==U){let e;t[28]===Y?e=t[29]:(e=e=>{let t=Y(e);return t?{value:t,label:e?.basicInfo?.email??t,description:e?.basicInfo?.fullName??void 0}:null},t[28]=Y,t[29]=e),X=a(s(U,e)),t[25]=Y,t[26]=U,t[27]=X}else X=t[27];let ve=X,ye;bb0:{let e;t[30]===Y?e=t[31]:(e=e=>{let t=Y(e?.node);return t?[t,e?.node?.basicInfo?.email]:null},t[30]=Y,t[31]=e);let n=new Map(a(s(R?.edges,e))),r=s(P,e=>({label:n.get(e)??e,value:e}));if(m){ye=r;break bb0}ye=r[0]??null}let be=ye,Z;t[32]===h?Z=t[33]:(Z=h(`comp:BAIUserSelect.SelectUser`),t[32]=h,t[33]=Z);let xe=i||se!==M||x!==w||T!==D||he,Se=_e.adminUsersV2?.count??void 0,Q;t[34]!==m||t[35]!==_?(Q=e=>{let t=a(r(e??[])),n=s(t,de);_(m?n:n[0],m?t:t[0])},t[34]=m,t[35]=_,t[36]=Q):Q=t[36];let $;return t[37]!==G||t[38]!==be||t[39]!==W||t[40]!==m||t[41]!==ve||t[42]!==T||t[43]!==c||t[44]!==S||t[45]!==Z||t[46]!==xe||t[47]!==Se||t[48]!==Q?($=(0,me.jsx)(oe,{placeholder:Z,...c,multiple:m,isLoading:xe,isLoadingNext:G,total:Se,options:ve,value:be,onChange:Q,searchValue:T,onSearch:E,onOpenChange:S,endReached:W}),t[37]=G,t[38]=be,t[39]=W,t[40]=m,t[41]=ve,t[42]=T,t[43]=c,t[44]=S,t[45]=Z,t[46]=xe,t[47]=Se,t[48]=Q,t[49]=$):$=t[49],$}})))()}var E,D,he,O,ge,k,A,j,M,N,P,F,I,L,R;function z(){return(z=e((()=>{se(),T(),E=t(),D=l(),he={title:`Fragments/BAIAdminUserV2Select`,component:w,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:"\n**BAIAdminUserV2Select** — superadmin-only user picker over `adminUsersV2` (managers >= 26.2.0). Built on `BAIComplexSelect`.\n\n- `valuePropName`: `'email'` (default) or `'id'` — which field is the plain-key value. Only `'id'` runs the `uuid in` label-resolution query; with emails the key already is the label.\n- `filter` / `excludeInactive`: composed into a `UserV2Filter` through the schema's `AND` combinator, together with the debounced `email: { iContains }` search.\n- Pagination is offset mode (`limit`/`offset`) — the V2 connections reject a mix with `first`/`after` at runtime.\n\nSee `BAIComplexSelect.stories.tsx` for the underlying popup-body component with static options.\n        "}}},argTypes:{value:{control:!1},onChange:{control:!1},filter:{control:!1},multiple:{control:{type:`boolean`}},excludeInactive:{control:{type:`boolean`}},valuePropName:{control:{type:`select`},options:[`email`,`id`]}}},O=[{id:`VXNlclYyOjE=`,basicInfo:{username:`admin`,email:`admin@example.com`,fullName:`System Administrator`}},{id:`VXNlclYyOjI=`,basicInfo:{username:`alice`,email:`alice@example.com`,fullName:`Alice Kim`}},{id:`VXNlclYyOjM=`,basicInfo:{username:`bob`,email:`bob@example.com`,fullName:`Bob Lee`}},{id:`VXNlclYyOjQ=`,basicInfo:{username:`carol`,email:`carol@example.com`,fullName:`Carol Park`}}],ge={Query:()=>({adminUsersV2:{count:O.length,edges:O.map(e=>({node:e}))}})},k={Query:()=>({adminUsersV2:{count:0,edges:[]}})},A=({initialValue:e=null,resolvers:t=ge,...n})=>{let[r,i]=(0,E.useState)(e);return(0,D.jsx)(_,{mockResolvers:t,children:(0,D.jsx)(w,{...n,value:r,onChange:e=>i(e??null)})})},j={name:`Single Select`,parameters:{docs:{description:{story:'Single user select, `valuePropName="email"` (default).'}}},render:e=>(0,D.jsx)(A,{...e,label:`User`})},M={name:`Multiple Select`,parameters:{docs:{description:{story:`Multi-selection: the value is an array of keys and the trigger lists the selected emails.`}}},render:e=>(0,D.jsx)(A,{...e,label:`Users`,multiple:!0,initialValue:[`admin@example.com`]})},N={name:`Exclude Inactive Users`,parameters:{docs:{description:{story:"`excludeInactive` composes `status: { equals: ACTIVE }` into the `UserV2Filter`."}}},render:e=>(0,D.jsx)(A,{...e,label:`User`,excludeInactive:!0})},P={name:`ID-valued`,parameters:{docs:{description:{story:'`valuePropName="id"` — the plain-key value is the local user UUID, which is what `adminBulkAssignRole` and friends take. This is the only mode that runs the `uuid in` label-resolution query.'}}},render:e=>(0,D.jsx)(A,{...e,label:`User`,valuePropName:`id`})},F={parameters:{docs:{description:{story:"Caller-side `isLoading`, which spins the trigger the same way the internal debounce and refetch pending states do."}}},render:e=>(0,D.jsx)(A,{...e,label:`User`,isLoading:!0,isDisabled:!0})},I={parameters:{docs:{description:{story:`No users match the query — the popup shows the shared empty-state text.`}}},render:e=>(0,D.jsx)(A,{...e,label:`User`,resolvers:k,defaultOpen:!0})},L={parameters:{docs:{description:{story:"The error status a form item sets when its `required` rule fails."}}},render:e=>(0,D.jsx)(A,{...e,label:`User`,status:{type:`error`,message:`Please select users.`}})},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  name: 'Single Select',
  parameters: {
    docs: {
      description: {
        story: 'Single user select, \`valuePropName="email"\` (default).'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" />
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  name: 'Multiple Select',
  parameters: {
    docs: {
      description: {
        story: 'Multi-selection: the value is an array of keys and the trigger lists the selected emails.'
      }
    }
  },
  render: args => <Sandbox {...args} label="Users" multiple initialValue={['admin@example.com']} />
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  name: 'Exclude Inactive Users',
  parameters: {
    docs: {
      description: {
        story: '\`excludeInactive\` composes \`status: { equals: ACTIVE }\` into the \`UserV2Filter\`.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" excludeInactive />
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  name: 'ID-valued',
  parameters: {
    docs: {
      description: {
        story: '\`valuePropName="id"\` — the plain-key value is the local user UUID, which is what \`adminBulkAssignRole\` and friends take. This is the only mode that runs the \`uuid in\` label-resolution query.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" valuePropName="id" />
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Caller-side \`isLoading\`, which spins the trigger the same way the internal debounce and refetch pending states do.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" isLoading isDisabled />
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'No users match the query — the popup shows the shared empty-state text.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" resolvers={emptyResolvers} defaultOpen />
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
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
}`,...L.parameters?.docs?.source}}},R=[`Basic`,`Multiple`,`ExcludeInactive`,`IdValued`,`Loading`,`Empty`,`Error`]})))()}z();export{j as Basic,I as Empty,L as Error,N as ExcludeInactive,P as IdValued,F as Loading,M as Multiple,R as __namedExportsOrder,he as default};