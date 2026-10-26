import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-D0Ex1IVc.js";import{n,t as r}from"./castArray-AZdtGfv6.js";import{n as i,t as a}from"./compact-C9OPbfhP.js";import{m as ee,r as te,t as o}from"./hooks-C37w8Ol6.js";import{n as s,t as c}from"./map-CLZMgxwS.js";import{t as l}from"./jsx-runtime-MKhVqBIO.js";import{n as ne,t as u}from"./useBAIi18n-Biey1teG.js";import{t as d}from"./compiler-runtime-CdReTaax.js";import{t as re}from"./react-relay-sBALIJlt.js";import{c as f,h as ie,v as p}from"./helper-CVvTx27U.js";import{i as ae,n as oe,r as m,t as h}from"./usePaginatedQuery-CRYleCKz.js";import{n as g,t as se}from"./BAIComplexSelect-D0tPiGCY.js";import{n as ce,t as _}from"./RelayResolver-CMrgwoPg.js";var le;function v(){return(v=e((()=>{le=(function(){var e={defaultValue:null,kind:`LocalArgument`,name:`limit`},t={defaultValue:null,kind:`LocalArgument`,name:`selectedFilter`},n={defaultValue:null,kind:`LocalArgument`,name:`skipSelected`},r=[{condition:`skipSelected`,kind:`Condition`,passingValue:!1,selections:[{alias:null,args:[{kind:`Variable`,name:`filter`,variableName:`selectedFilter`},{kind:`Variable`,name:`limit`,variableName:`limit`}],concreteType:`UserV2Connection`,kind:`LinkedField`,name:`adminUsersV2`,plural:!1,selections:[{alias:null,args:null,concreteType:`UserV2Edge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`UserV2`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,concreteType:`UserV2BasicInfo`,kind:`LinkedField`,name:`basicInfo`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`email`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}]}];return{fragment:{argumentDefinitions:[e,t,n],kind:`Fragment`,metadata:null,name:`BAIAdminUserV2SelectValueQuery`,selections:r,type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[t,e,n],kind:`Operation`,name:`BAIAdminUserV2SelectValueQuery`,selections:r},params:{cacheID:`0a609f6f54a1625212fe62168903b81c`,id:null,metadata:{},name:`BAIAdminUserV2SelectValueQuery`,operationKind:`query`,text:`query BAIAdminUserV2SelectValueQuery(
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
`}}})(),le.hash=`77a6ea8cc05760ecebb6a139b466b99f`})))()}var y;function b(){return(b=e((()=>{y=(function(){var e={defaultValue:null,kind:`LocalArgument`,name:`filter`},t={defaultValue:null,kind:`LocalArgument`,name:`limit`},n={defaultValue:null,kind:`LocalArgument`,name:`offset`},r={defaultValue:null,kind:`LocalArgument`,name:`orderBy`},i=[{alias:null,args:[{kind:`Variable`,name:`filter`,variableName:`filter`},{kind:`Variable`,name:`limit`,variableName:`limit`},{kind:`Variable`,name:`offset`,variableName:`offset`},{kind:`Variable`,name:`orderBy`,variableName:`orderBy`}],concreteType:`UserV2Connection`,kind:`LinkedField`,name:`adminUsersV2`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`count`,storageKey:null},{alias:null,args:null,concreteType:`UserV2Edge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`UserV2`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,concreteType:`UserV2BasicInfo`,kind:`LinkedField`,name:`basicInfo`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`username`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`email`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`fullName`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:[e,t,n,r],kind:`Fragment`,metadata:null,name:`BAIAdminUserV2SelectPaginatedQuery`,selections:i,type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[n,t,e,r],kind:`Operation`,name:`BAIAdminUserV2SelectPaginatedQuery`,selections:i},params:{cacheID:`368e3f7b0cad178c48a17c2f55fa6b49`,id:null,metadata:{},name:`BAIAdminUserV2SelectPaginatedQuery`,operationKind:`query`,text:`query BAIAdminUserV2SelectPaginatedQuery(
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
`}}})(),y.hash=`2f169ca5be6fb0d96fbdd2d14c0ea2bb`})))()}function ue(e){return e.adminUsersV2?.count??void 0}function x(e){return e?.node}function de(e){return e.adminUsersV2?.edges?.map(x)}function fe(e){return e?.id}function pe(e){return e.value}var me,S,he,ge,C;function w(){return(w=e((()=>{v(),b(),me=d(),f(),m(),o(),u(),h(),g(),i(),n(),c(),S=t(),he=re(),ge=l(),C=e=>{"use memo";let t=(0,me.c)(50),n,i,o,c,l,u,d;t[0]===e?(n=t[1],i=t[2],o=t[3],c=t[4],l=t[5],u=t[6],d=t[7]):({filter:n,excludeInactive:l,valuePropName:u,multiple:d,isLoading:i,ref:o,...c}=e,t[0]=e,t[1]=n,t[2]=i,t[3]=o,t[4]=c,t[5]=l,t[6]=u,t[7]=d);let re=l!==void 0&&l,f=u===void 0?`email`:u,m=d!==void 0&&d,{t:h}=ne(),g;t[8]===Symbol.for(`react.memo_cache_sentinel`)?(g={valuePropName:`value`,trigger:`onChange`},t[8]=g):g=t[8];let[ce,_]=ee(c,g),v;t[9]===Symbol.for(`react.memo_cache_sentinel`)?(v={valuePropName:`open`,trigger:`onOpenChange`,defaultValuePropName:`defaultOpen`},t[9]=v):v=t[9];let[b,x]=ee(c,v),C=(0,S.useDeferredValue)(b),[w,T]=(0,S.useState)(``),E=ae(w),[_e,D]=(0,S.useTransition)(),[ve,O]=te(),k=(0,S.useDeferredValue)(ve),A=p([re?{status:{equals:`ACTIVE`}}:null,n]),j=(0,S.useDeferredValue)(ce),M;t[10]===j?M=t[11]:(M=j??[],t[10]=j,t[11]=M);let N=a(r(M)),P=f===`id`&&N.length>0,F=P?`store-or-network`:`store-only`,I;t[12]!==k||t[13]!==F?(I={fetchPolicy:F,fetchKey:k},t[12]=k,t[13]=F,t[14]=I):I=t[14];let{adminUsersV2:L}=(0,he.useLazyLoadQuery)(le,{selectedFilter:P?p([{uuid:{in:N}},A]):null,limit:Math.max(N.length,1),skipSelected:!P},I),R;t[15]===Symbol.for(`react.memo_cache_sentinel`)?(R={limit:10},t[15]=R):R=t[15];let z=C?`network-only`:`store-only`,B;t[16]!==k||t[17]!==z?(B={fetchPolicy:z,fetchKey:k},t[16]=k,t[17]=z,t[18]=B):B=t[18];let V;t[19]===Symbol.for(`react.memo_cache_sentinel`)?(V={getTotal:ue,getItem:de,getId:fe},t[19]=V):V=t[19];let{paginationData:H,result:ye,loadNext:U,isLoadingNext:W}=oe(y,R,{filter:p([A,E?{email:{iContains:E}}:null]),orderBy:[{field:`EMAIL`,direction:`ASC`}]},B,V),G,K;t[20]===O?(G=t[21],K=t[22]):(G=()=>({refetch:()=>{D(()=>{O()})}}),K=[O,D],t[20]=O,t[21]=G,t[22]=K),(0,S.useImperativeHandle)(o,G,K);let q;t[23]===f?q=t[24]:(q=e=>{if(e)return f===`id`?ie(e.id):e.basicInfo?.email??void 0},t[23]=f,t[24]=q);let J=q,Y;if(t[25]!==J||t[26]!==H){let e;t[28]===J?e=t[29]:(e=e=>{let t=J(e);return t?{value:t,label:e?.basicInfo?.email??t,description:e?.basicInfo?.fullName??void 0}:null},t[28]=J,t[29]=e),Y=a(s(H,e)),t[25]=J,t[26]=H,t[27]=Y}else Y=t[27];let X=Y,be;bb0:{let e;t[30]===J?e=t[31]:(e=e=>{let t=J(e?.node);return t?[t,e?.node?.basicInfo?.email]:null},t[30]=J,t[31]=e);let n=new Map(a(s(L?.edges,e))),r=s(N,e=>({label:n.get(e)??e,value:e}));if(m){be=r;break bb0}be=r[0]??null}let xe=be,Z;t[32]===h?Z=t[33]:(Z=h(`comp:BAIUserSelect.SelectUser`),t[32]=h,t[33]=Z);let Se=i||ce!==j||b!==C||w!==E||_e,Ce=ye.adminUsersV2?.count??void 0,Q;t[34]!==m||t[35]!==_?(Q=e=>{let t=a(r(e??[])),n=s(t,pe);_(m?n:n[0],m?t:t[0])},t[34]=m,t[35]=_,t[36]=Q):Q=t[36];let $;return t[37]!==W||t[38]!==xe||t[39]!==U||t[40]!==m||t[41]!==X||t[42]!==w||t[43]!==c||t[44]!==x||t[45]!==Z||t[46]!==Se||t[47]!==Ce||t[48]!==Q?($=(0,ge.jsx)(se,{placeholder:Z,...c,multiple:m,isLoading:Se,isLoadingNext:W,total:Ce,options:X,value:xe,onChange:Q,searchValue:w,onSearch:T,onOpenChange:x,endReached:U}),t[37]=W,t[38]=xe,t[39]=U,t[40]=m,t[41]=X,t[42]=w,t[43]=c,t[44]=x,t[45]=Z,t[46]=Se,t[47]=Ce,t[48]=Q,t[49]=$):$=t[49],$}})))()}var T,E,_e,D,ve,O,k,A,j,M,N,P,F,I,L;function R(){return(R=e((()=>{ce(),w(),T=t(),E=l(),_e={title:`Fragments/BAIAdminUserV2Select`,component:C,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:"\n**BAIAdminUserV2Select** — superadmin-only user picker over `adminUsersV2` (managers >= 26.2.0). Built on `BAIComplexSelect`.\n\n- `valuePropName`: `'email'` (default) or `'id'` — which field is the plain-key value. Only `'id'` runs the `uuid in` label-resolution query; with emails the key already is the label.\n- `filter` / `excludeInactive`: composed into a `UserV2Filter` through the schema's `AND` combinator, together with the debounced `email: { iContains }` search.\n- Pagination is offset mode (`limit`/`offset`) — the V2 connections reject a mix with `first`/`after` at runtime.\n\nSee `BAIComplexSelect.stories.tsx` for the underlying popup-body component with static options.\n        "}}},argTypes:{value:{control:!1},onChange:{control:!1},filter:{control:!1},multiple:{control:{type:`boolean`}},excludeInactive:{control:{type:`boolean`}},valuePropName:{control:{type:`select`},options:[`email`,`id`]}}},D=[{id:`VXNlclYyOjE=`,basicInfo:{username:`admin`,email:`admin@example.com`,fullName:`System Administrator`}},{id:`VXNlclYyOjI=`,basicInfo:{username:`alice`,email:`alice@example.com`,fullName:`Alice Kim`}},{id:`VXNlclYyOjM=`,basicInfo:{username:`bob`,email:`bob@example.com`,fullName:`Bob Lee`}},{id:`VXNlclYyOjQ=`,basicInfo:{username:`carol`,email:`carol@example.com`,fullName:`Carol Park`}}],ve={Query:()=>({adminUsersV2:{count:D.length,edges:D.map(e=>({node:e}))}})},O={Query:()=>({adminUsersV2:{count:0,edges:[]}})},k=({initialValue:e=null,resolvers:t=ve,...n})=>{let[r,i]=(0,T.useState)(e);return(0,E.jsx)(_,{mockResolvers:t,children:(0,E.jsx)(C,{...n,value:r,onChange:e=>i(e??null)})})},A={name:`Single Select`,parameters:{docs:{description:{story:'Single user select, `valuePropName="email"` (default).'}}},render:e=>(0,E.jsx)(k,{...e,label:`User`})},j={name:`Multiple Select`,parameters:{docs:{description:{story:`Multi-selection: the value is an array of keys and the trigger lists the selected emails.`}}},render:e=>(0,E.jsx)(k,{...e,label:`Users`,multiple:!0,initialValue:[`admin@example.com`]})},M={name:`Exclude Inactive Users`,parameters:{docs:{description:{story:"`excludeInactive` composes `status: { equals: ACTIVE }` into the `UserV2Filter`."}}},render:e=>(0,E.jsx)(k,{...e,label:`User`,excludeInactive:!0})},N={name:`ID-valued`,parameters:{docs:{description:{story:'`valuePropName="id"` — the plain-key value is the local user UUID, which is what `adminBulkAssignRole` and friends take. This is the only mode that runs the `uuid in` label-resolution query.'}}},render:e=>(0,E.jsx)(k,{...e,label:`User`,valuePropName:`id`})},P={parameters:{docs:{description:{story:"Caller-side `isLoading`, which spins the trigger the same way the internal debounce and refetch pending states do."}}},render:e=>(0,E.jsx)(k,{...e,label:`User`,isLoading:!0,isDisabled:!0})},F={parameters:{docs:{description:{story:`No users match the query — the popup shows the shared empty-state text.`}}},render:e=>(0,E.jsx)(k,{...e,label:`User`,resolvers:O,defaultOpen:!0})},I={parameters:{docs:{description:{story:"The error status a form item sets when its `required` rule fails."}}},render:e=>(0,E.jsx)(k,{...e,label:`User`,status:{type:`error`,message:`Please select users.`}})},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  name: 'Single Select',
  parameters: {
    docs: {
      description: {
        story: 'Single user select, \`valuePropName="email"\` (default).'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" />
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  name: 'Multiple Select',
  parameters: {
    docs: {
      description: {
        story: 'Multi-selection: the value is an array of keys and the trigger lists the selected emails.'
      }
    }
  },
  render: args => <Sandbox {...args} label="Users" multiple initialValue={['admin@example.com']} />
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  name: 'Exclude Inactive Users',
  parameters: {
    docs: {
      description: {
        story: '\`excludeInactive\` composes \`status: { equals: ACTIVE }\` into the \`UserV2Filter\`.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" excludeInactive />
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  name: 'ID-valued',
  parameters: {
    docs: {
      description: {
        story: '\`valuePropName="id"\` — the plain-key value is the local user UUID, which is what \`adminBulkAssignRole\` and friends take. This is the only mode that runs the \`uuid in\` label-resolution query.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" valuePropName="id" />
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Caller-side \`isLoading\`, which spins the trigger the same way the internal debounce and refetch pending states do.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" isLoading isDisabled />
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'No users match the query — the popup shows the shared empty-state text.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" resolvers={emptyResolvers} defaultOpen />
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
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
}`,...I.parameters?.docs?.source}}},L=[`Basic`,`Multiple`,`ExcludeInactive`,`IdValued`,`Loading`,`Empty`,`Error`]})))()}R();export{A as Basic,F as Empty,I as Error,M as ExcludeInactive,N as IdValued,P as Loading,j as Multiple,L as __namedExportsOrder,_e as default};