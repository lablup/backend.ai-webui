import{n as e}from"./rolldown-runtime-2s6bX4vc.js";import{n as t,t as n}from"./castArray-D5wfhmm_.js";import{n as r,t as i}from"./compact-BqEdnGyS.js";import{m as ee,r as te,t as a}from"./hooks-BKuvs6Qg.js";import{n as o,t as s}from"./map-CIqW7OVA.js";import{n as ne,t as c}from"./useBAIi18n-BoXCk5K0.js";import{c as l,v as u}from"./helper-DV0q0X9R.js";import{i as re,n as ie,r as d,t as f}from"./usePaginatedQuery-C_PT0rpZ.js";import{n as ae,t as oe}from"./BAIComplexSelect-D5bBzCyR.js";import{n as p,t as m}from"./RelayResolver-b1nJU57O.js";import{useDeferredValue as h,useImperativeHandle as se,useState as ce,useTransition as le}from"react";import{jsx as g}from"react/jsx-runtime";import{c as ue}from"react/compiler-runtime";import{useLazyLoadQuery as de}from"react-relay";var fe;function _(){return(_=e((()=>{fe=(function(){var e={defaultValue:null,kind:`LocalArgument`,name:`limit`},t={defaultValue:null,kind:`LocalArgument`,name:`selectedFilter`},n={defaultValue:null,kind:`LocalArgument`,name:`skipSelected`},r=[{condition:`skipSelected`,kind:`Condition`,passingValue:!1,selections:[{alias:null,args:[{kind:`Variable`,name:`filter`,variableName:`selectedFilter`},{kind:`Variable`,name:`limit`,variableName:`limit`}],concreteType:`UserV2Connection`,kind:`LinkedField`,name:`adminUsersV2`,plural:!1,selections:[{alias:null,args:null,concreteType:`UserV2Edge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`UserV2`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`entityId`,storageKey:null},{alias:null,args:null,concreteType:`UserV2BasicInfo`,kind:`LinkedField`,name:`basicInfo`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`email`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}]}];return{fragment:{argumentDefinitions:[e,t,n],kind:`Fragment`,metadata:null,name:`BAIAdminUserV2SelectValueQuery`,selections:r,type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[t,e,n],kind:`Operation`,name:`BAIAdminUserV2SelectValueQuery`,selections:r},params:{cacheID:`61cb5dc45fcae42e7aad0e471b20a661`,id:null,metadata:{},name:`BAIAdminUserV2SelectValueQuery`,operationKind:`query`,text:`query BAIAdminUserV2SelectValueQuery(
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
`}}})(),fe.hash=`d22655746aecaf91c90c662fb52bffde`})))()}var v;function y(){return(y=e((()=>{v=(function(){var e={defaultValue:null,kind:`LocalArgument`,name:`filter`},t={defaultValue:null,kind:`LocalArgument`,name:`limit`},n={defaultValue:null,kind:`LocalArgument`,name:`offset`},r={defaultValue:null,kind:`LocalArgument`,name:`orderBy`},i=[{alias:null,args:[{kind:`Variable`,name:`filter`,variableName:`filter`},{kind:`Variable`,name:`limit`,variableName:`limit`},{kind:`Variable`,name:`offset`,variableName:`offset`},{kind:`Variable`,name:`orderBy`,variableName:`orderBy`}],concreteType:`UserV2Connection`,kind:`LinkedField`,name:`adminUsersV2`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`count`,storageKey:null},{alias:null,args:null,concreteType:`UserV2Edge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`UserV2`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`entityId`,storageKey:null},{alias:null,args:null,concreteType:`UserV2BasicInfo`,kind:`LinkedField`,name:`basicInfo`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`username`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`email`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`fullName`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:[e,t,n,r],kind:`Fragment`,metadata:null,name:`BAIAdminUserV2SelectPaginatedQuery`,selections:i,type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[n,t,e,r],kind:`Operation`,name:`BAIAdminUserV2SelectPaginatedQuery`,selections:i},params:{cacheID:`d964e6db69be3ea4621776141153a22f`,id:null,metadata:{},name:`BAIAdminUserV2SelectPaginatedQuery`,operationKind:`query`,text:`query BAIAdminUserV2SelectPaginatedQuery(
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
`}}})(),v.hash=`f75c9575eef21ebcd16c8f12a9b15dbe`})))()}function pe(e){return e.adminUsersV2?.count??void 0}function b(e){return e?.node}function me(e){return e.adminUsersV2?.edges?.map(b)}function he(e){return e?.id}function ge(e){return e.value}var x;function S(){return(S=e((()=>{_(),y(),l(),d(),a(),c(),f(),ae(),r(),t(),s(),x=e=>{"use memo";let t=ue(50),r,a,s,c,l,d,f;t[0]===e?(r=t[1],a=t[2],s=t[3],c=t[4],l=t[5],d=t[6],f=t[7]):({filter:r,excludeInactive:l,valuePropName:d,multiple:f,isLoading:a,ref:s,...c}=e,t[0]=e,t[1]=r,t[2]=a,t[3]=s,t[4]=c,t[5]=l,t[6]=d,t[7]=f);let ae=l!==void 0&&l,p=d===void 0?`email`:d,m=f!==void 0&&f,{t:_}=ne(),y;t[8]===Symbol.for(`react.memo_cache_sentinel`)?(y={valuePropName:`value`,trigger:`onChange`},t[8]=y):y=t[8];let[b,x]=ee(c,y),S;t[9]===Symbol.for(`react.memo_cache_sentinel`)?(S={valuePropName:`open`,trigger:`onOpenChange`,defaultValuePropName:`defaultOpen`},t[9]=S):S=t[9];let[C,w]=ee(c,S),T=h(C),[E,D]=ce(``),O=re(E),[k,A]=le(),[j,M]=te(),N=h(j),P=u([ae?{status:{equals:`ACTIVE`}}:null,r]),F=h(b),I;t[10]===F?I=t[11]:(I=F??[],t[10]=F,t[11]=I);let L=i(n(I)),R=p===`id`&&L.length>0,z=R?`store-or-network`:`store-only`,B;t[12]!==N||t[13]!==z?(B={fetchPolicy:z,fetchKey:N},t[12]=N,t[13]=z,t[14]=B):B=t[14];let{adminUsersV2:_e}=de(fe,{selectedFilter:R?u([{uuid:{in:L}},P]):null,limit:Math.max(L.length,1),skipSelected:!R},B),V;t[15]===Symbol.for(`react.memo_cache_sentinel`)?(V={limit:10},t[15]=V):V=t[15];let H=T?`network-only`:`store-only`,U;t[16]!==N||t[17]!==H?(U={fetchPolicy:H,fetchKey:N},t[16]=N,t[17]=H,t[18]=U):U=t[18];let W;t[19]===Symbol.for(`react.memo_cache_sentinel`)?(W={getTotal:pe,getItem:me,getId:he},t[19]=W):W=t[19];let{paginationData:G,result:ve,loadNext:ye,isLoadingNext:be}=ie(v,V,{filter:u([P,O?{email:{iContains:O}}:null]),orderBy:[{field:`EMAIL`,direction:`ASC`}]},U,W),K,q;t[20]===M?(K=t[21],q=t[22]):(K=()=>({refetch:()=>{A(()=>{M()})}}),q=[M,A],t[20]=M,t[21]=K,t[22]=q),se(s,K,q);let J;t[23]===p?J=t[24]:(J=e=>{if(e)return p===`id`?e.entityId:e.basicInfo?.email??void 0},t[23]=p,t[24]=J);let Y=J,X;if(t[25]!==Y||t[26]!==G){let e;t[28]===Y?e=t[29]:(e=e=>{let t=Y(e);return t?{value:t,label:e?.basicInfo?.email??t,description:e?.basicInfo?.fullName??void 0}:null},t[28]=Y,t[29]=e),X=i(o(G,e)),t[25]=Y,t[26]=G,t[27]=X}else X=t[27];let xe=X,Se;bb0:{let e;t[30]===Y?e=t[31]:(e=e=>{let t=Y(e?.node);return t?[t,e?.node?.basicInfo?.email]:null},t[30]=Y,t[31]=e);let n=new Map(i(o(_e?.edges,e))),r=o(L,e=>({label:n.get(e)??e,value:e}));if(m){Se=r;break bb0}Se=r[0]??null}let Ce=Se,Z;t[32]===_?Z=t[33]:(Z=_(`comp:BAIUserSelect.SelectUser`),t[32]=_,t[33]=Z);let we=a||b!==F||C!==T||E!==O||k,Te=ve.adminUsersV2?.count??void 0,Q;t[34]!==m||t[35]!==x?(Q=e=>{let t=i(n(e??[])),r=o(t,ge);x(m?r:r[0],m?t:t[0])},t[34]=m,t[35]=x,t[36]=Q):Q=t[36];let $;return t[37]!==be||t[38]!==Ce||t[39]!==ye||t[40]!==m||t[41]!==xe||t[42]!==E||t[43]!==c||t[44]!==w||t[45]!==Z||t[46]!==we||t[47]!==Te||t[48]!==Q?($=g(oe,{placeholder:Z,...c,multiple:m,isLoading:we,isLoadingNext:be,total:Te,options:xe,value:Ce,onChange:Q,searchValue:E,onSearch:D,onOpenChange:w,endReached:ye}),t[37]=be,t[38]=Ce,t[39]=ye,t[40]=m,t[41]=xe,t[42]=E,t[43]=c,t[44]=w,t[45]=Z,t[46]=we,t[47]=Te,t[48]=Q,t[49]=$):$=t[49],$}})))()}var C,w,T,E,D,O,k,A,j,M,N,P,F;function I(){return(I=e((()=>{p(),S(),C={title:`Fragments/BAIAdminUserV2Select`,component:x,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:"\n**BAIAdminUserV2Select** — superadmin-only user picker over `adminUsersV2` (managers >= 26.2.0). Built on `BAIComplexSelect`.\n\n- `valuePropName`: `'email'` (default) or `'id'` — which field is the plain-key value. Only `'id'` runs the `uuid in` label-resolution query; with emails the key already is the label.\n- `filter` / `excludeInactive`: composed into a `UserV2Filter` through the schema's `AND` combinator, together with the debounced `email: { iContains }` search.\n- Pagination is offset mode (`limit`/`offset`) — the V2 connections reject a mix with `first`/`after` at runtime.\n\nSee `BAIComplexSelect.stories.tsx` for the underlying popup-body component with static options.\n        "}}},argTypes:{value:{control:!1},onChange:{control:!1},filter:{control:!1},multiple:{control:{type:`boolean`}},excludeInactive:{control:{type:`boolean`}},valuePropName:{control:{type:`select`},options:[`email`,`id`]}}},w=[{id:`VXNlclYyOjE=`,basicInfo:{username:`admin`,email:`admin@example.com`,fullName:`System Administrator`}},{id:`VXNlclYyOjI=`,basicInfo:{username:`alice`,email:`alice@example.com`,fullName:`Alice Kim`}},{id:`VXNlclYyOjM=`,basicInfo:{username:`bob`,email:`bob@example.com`,fullName:`Bob Lee`}},{id:`VXNlclYyOjQ=`,basicInfo:{username:`carol`,email:`carol@example.com`,fullName:`Carol Park`}}],T={Query:()=>({adminUsersV2:{count:w.length,edges:w.map(e=>({node:e}))}})},E={Query:()=>({adminUsersV2:{count:0,edges:[]}})},D=({initialValue:e=null,resolvers:t=T,...n})=>{let[r,i]=ce(e);return g(m,{mockResolvers:t,children:g(x,{...n,value:r,onChange:e=>i(e??null)})})},O={name:`Single Select`,parameters:{docs:{description:{story:'Single user select, `valuePropName="email"` (default).'}}},render:e=>g(D,{...e,label:`User`})},k={name:`Multiple Select`,parameters:{docs:{description:{story:`Multi-selection: the value is an array of keys and the trigger lists the selected emails.`}}},render:e=>g(D,{...e,label:`Users`,multiple:!0,initialValue:[`admin@example.com`]})},A={name:`Exclude Inactive Users`,parameters:{docs:{description:{story:"`excludeInactive` composes `status: { equals: ACTIVE }` into the `UserV2Filter`."}}},render:e=>g(D,{...e,label:`User`,excludeInactive:!0})},j={name:`ID-valued`,parameters:{docs:{description:{story:'`valuePropName="id"` — the plain-key value is the local user UUID, which is what `adminBulkAssignRole` and friends take. This is the only mode that runs the `uuid in` label-resolution query.'}}},render:e=>g(D,{...e,label:`User`,valuePropName:`id`})},M={parameters:{docs:{description:{story:"Caller-side `isLoading`, which spins the trigger the same way the internal debounce and refetch pending states do."}}},render:e=>g(D,{...e,label:`User`,isLoading:!0,isDisabled:!0})},N={parameters:{docs:{description:{story:`No users match the query — the popup shows the shared empty-state text.`}}},render:e=>g(D,{...e,label:`User`,resolvers:E,defaultOpen:!0})},P={parameters:{docs:{description:{story:"The error status a form item sets when its `required` rule fails."}}},render:e=>g(D,{...e,label:`User`,status:{type:`error`,message:`Please select users.`}})},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  name: 'Single Select',
  parameters: {
    docs: {
      description: {
        story: 'Single user select, \`valuePropName="email"\` (default).'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" />
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  name: 'Multiple Select',
  parameters: {
    docs: {
      description: {
        story: 'Multi-selection: the value is an array of keys and the trigger lists the selected emails.'
      }
    }
  },
  render: args => <Sandbox {...args} label="Users" multiple initialValue={['admin@example.com']} />
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  name: 'Exclude Inactive Users',
  parameters: {
    docs: {
      description: {
        story: '\`excludeInactive\` composes \`status: { equals: ACTIVE }\` into the \`UserV2Filter\`.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" excludeInactive />
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  name: 'ID-valued',
  parameters: {
    docs: {
      description: {
        story: '\`valuePropName="id"\` — the plain-key value is the local user UUID, which is what \`adminBulkAssignRole\` and friends take. This is the only mode that runs the \`uuid in\` label-resolution query.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" valuePropName="id" />
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Caller-side \`isLoading\`, which spins the trigger the same way the internal debounce and refetch pending states do.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" isLoading isDisabled />
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'No users match the query — the popup shows the shared empty-state text.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" resolvers={emptyResolvers} defaultOpen />
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
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
}`,...P.parameters?.docs?.source}}},F=[`Basic`,`Multiple`,`ExcludeInactive`,`IdValued`,`Loading`,`Empty`,`Error`]})))()}I();export{O as Basic,N as Empty,P as Error,A as ExcludeInactive,j as IdValued,M as Loading,k as Multiple,F as __namedExportsOrder,C as default};