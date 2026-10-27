import{n as e}from"./rolldown-runtime-2s6bX4vc.js";import{n as t,t as n}from"./castArray-D5wfhmm_.js";import{n as r,t as i}from"./compact-BqEdnGyS.js";import{m as a,r as ee,t as o}from"./hooks-BKuvs6Qg.js";import{n as s,t as c}from"./map-CIqW7OVA.js";import{n as te,t as l}from"./useBAIi18n-BoXCk5K0.js";import{c as u,v as d}from"./helper-DV0q0X9R.js";import{i as ne,n as re,r as f,t as p}from"./usePaginatedQuery-C_PT0rpZ.js";import{n as m,t as ie}from"./BAIComplexSelect-D5bBzCyR.js";import{n as ae,t as h}from"./RelayResolver-b1nJU57O.js";import{useDeferredValue as g,useImperativeHandle as oe,useState as se,useTransition as ce}from"react";import{jsx as _}from"react/jsx-runtime";import{c as le}from"react/compiler-runtime";import{useLazyLoadQuery as ue}from"react-relay";var v;function y(){return(y=e((()=>{v=(function(){var e={defaultValue:null,kind:`LocalArgument`,name:`limit`},t={defaultValue:null,kind:`LocalArgument`,name:`scope`},n={defaultValue:null,kind:`LocalArgument`,name:`selectedFilter`},r={defaultValue:null,kind:`LocalArgument`,name:`skipSelected`},i=[{condition:`skipSelected`,kind:`Condition`,passingValue:!1,selections:[{alias:null,args:[{kind:`Variable`,name:`filter`,variableName:`selectedFilter`},{kind:`Variable`,name:`limit`,variableName:`limit`},{kind:`Variable`,name:`scope`,variableName:`scope`}],concreteType:`UserV2Connection`,kind:`LinkedField`,name:`scopedUsersV2`,plural:!1,selections:[{alias:null,args:null,concreteType:`UserV2Edge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`UserV2`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`entityId`,storageKey:null},{alias:null,args:null,concreteType:`UserV2BasicInfo`,kind:`LinkedField`,name:`basicInfo`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`email`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`fullName`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}]}];return{fragment:{argumentDefinitions:[e,t,n,r],kind:`Fragment`,metadata:null,name:`BAIScopedUserSelectValueQuery`,selections:i,type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[t,n,e,r],kind:`Operation`,name:`BAIScopedUserSelectValueQuery`,selections:i},params:{cacheID:`73f803e1b9de2f6f3006e799975668d7`,id:null,metadata:{},name:`BAIScopedUserSelectValueQuery`,operationKind:`query`,text:`query BAIScopedUserSelectValueQuery(
  $scope: UserScope!
  $selectedFilter: UserV2Filter
  $limit: Int!
  $skipSelected: Boolean!
) {
  scopedUsersV2(scope: $scope, filter: $selectedFilter, limit: $limit) @skip(if: $skipSelected) {
    edges {
      node {
        id
        entityId
        basicInfo {
          email
          fullName
        }
      }
    }
  }
}
`}}})(),v.hash=`411743b8638ae718f2aaa52604b93e2c`})))()}var b;function x(){return(x=e((()=>{b=(function(){var e={defaultValue:null,kind:`LocalArgument`,name:`filter`},t={defaultValue:null,kind:`LocalArgument`,name:`limit`},n={defaultValue:null,kind:`LocalArgument`,name:`offset`},r={defaultValue:null,kind:`LocalArgument`,name:`orderBy`},i={defaultValue:null,kind:`LocalArgument`,name:`scope`},a=[{alias:null,args:[{kind:`Variable`,name:`filter`,variableName:`filter`},{kind:`Variable`,name:`limit`,variableName:`limit`},{kind:`Variable`,name:`offset`,variableName:`offset`},{kind:`Variable`,name:`orderBy`,variableName:`orderBy`},{kind:`Variable`,name:`scope`,variableName:`scope`}],concreteType:`UserV2Connection`,kind:`LinkedField`,name:`scopedUsersV2`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`count`,storageKey:null},{alias:null,args:null,concreteType:`UserV2Edge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`UserV2`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`entityId`,storageKey:null},{alias:null,args:null,concreteType:`UserV2BasicInfo`,kind:`LinkedField`,name:`basicInfo`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`email`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`fullName`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:[e,t,n,r,i],kind:`Fragment`,metadata:null,name:`BAIScopedUserSelectPaginatedQuery`,selections:a,type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[i,n,t,e,r],kind:`Operation`,name:`BAIScopedUserSelectPaginatedQuery`,selections:a},params:{cacheID:`efde6092b86268c770cd00e780dc0fef`,id:null,metadata:{},name:`BAIScopedUserSelectPaginatedQuery`,operationKind:`query`,text:`query BAIScopedUserSelectPaginatedQuery(
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
        entityId
        basicInfo {
          email
          fullName
        }
      }
    }
  }
}
`}}})(),b.hash=`9f76fb36f1f0267e95d5c7b6c2bf8a87`})))()}function de(e){return e.scopedUsersV2?.count??void 0}function fe(e){return i(s(e.scopedUsersV2?.edges,`node`))}function pe(e){return e?.id}function me(e){return e.value}var he,S;function C(){return(C=e((()=>{y(),x(),u(),f(),o(),l(),p(),m(),r(),t(),c(),he=10,S=e=>{"use memo";let t=le(51),r,o,c,l,u,f,p,m;t[0]===e?(r=t[1],o=t[2],c=t[3],l=t[4],u=t[5],f=t[6],p=t[7],m=t[8]):({scope:l,filter:r,excludeInactive:f,valuePropName:p,multiple:m,isLoading:o,ref:c,...u}=e,t[0]=e,t[1]=r,t[2]=o,t[3]=c,t[4]=l,t[5]=u,t[6]=f,t[7]=p,t[8]=m);let ae=f!==void 0&&f,h=p===void 0?`email`:p,y=m!==void 0&&m,{t:x}=te(),S;t[9]===Symbol.for(`react.memo_cache_sentinel`)?(S={valuePropName:`value`,trigger:`onChange`},t[9]=S):S=t[9];let[C,w]=a(u,S),T;t[10]===Symbol.for(`react.memo_cache_sentinel`)?(T={valuePropName:`open`,trigger:`onOpenChange`,defaultValuePropName:`defaultOpen`},t[10]=T):T=t[10];let[E,D]=a(u,T),O=g(E),[k,A]=se(``),j=ne(k),[M,N]=ce(),[P,F]=ee(),I=g(P),L,R;t[11]===F?(L=t[12],R=t[13]):(L=()=>({refetch:()=>{N(()=>{F()})}}),R=[F,N],t[11]=F,t[12]=L,t[13]=R),oe(c,L,R);let z=d([ae?{status:{equals:`ACTIVE`}}:null,r]),B=g(C),V;t[14]===B?V=t[15]:(V=B??[],t[14]=B,t[15]=V);let H=i(n(V)),U=h===`id`&&H.length>0,ge=U?`store-or-network`:`store-only`,W;t[16]!==I||t[17]!==ge?(W={fetchPolicy:ge,fetchKey:I},t[16]=I,t[17]=ge,t[18]=W):W=t[18];let _e=ue(v,{scope:l,selectedFilter:U?d([{uuid:{in:H}},z]):null,limit:Math.max(H.length,1),skipSelected:!U},W),G;t[19]===Symbol.for(`react.memo_cache_sentinel`)?(G={limit:he},t[19]=G):G=t[19];let ve=O?`network-only`:`store-only`,K;t[20]!==I||t[21]!==ve?(K={fetchPolicy:ve,fetchKey:I},t[20]=I,t[21]=ve,t[22]=K):K=t[22];let q;t[23]===Symbol.for(`react.memo_cache_sentinel`)?(q={getTotal:de,getItem:fe,getId:pe},t[23]=q):q=t[23];let{paginationData:ye,result:be,loadNext:xe,isLoadingNext:Se}=re(b,G,{scope:l,filter:d([z,j?{email:{iContains:j}}:null]),orderBy:[{field:`EMAIL`,direction:`ASC`}]},K,q),J;t[24]===h?J=t[25]:(J=e=>{if(e)return h===`id`?e.entityId:e.basicInfo?.email??void 0},t[24]=h,t[25]=J);let Y=J,X;if(t[26]!==Y||t[27]!==ye){let e;t[29]===Y?e=t[30]:(e=e=>{let t=Y(e);return t?{value:t,label:e?.basicInfo?.email??t,description:e?.basicInfo?.fullName??void 0}:null},t[29]=Y,t[30]=e),X=i(s(ye,e)),t[26]=Y,t[27]=ye,t[28]=X}else X=t[28];let Ce=X,we;bb0:{let e;t[31]===Y?e=t[32]:(e=e=>{let t=Y(e?.node);return t?[t,e?.node?.basicInfo?.email]:null},t[31]=Y,t[32]=e);let n=new Map(i(s(_e.scopedUsersV2?.edges,e))),r=s(H,e=>({label:n.get(e)??e,value:e}));if(y){we=r;break bb0}we=r[0]??null}let Te=we,Z;t[33]===x?Z=t[34]:(Z=x(`comp:BAIUserSelect.SelectUser`),t[33]=x,t[34]=Z);let Ee=o||!!E&&!O||C!==B||k!==j||M,De=be.scopedUsersV2?.count??void 0,Q;t[35]!==y||t[36]!==w?(Q=e=>{let t=i(n(e??[])),r=s(t,me);w(y?r:r[0],y?t:t[0])},t[35]=y,t[36]=w,t[37]=Q):Q=t[37];let $;return t[38]!==Se||t[39]!==Te||t[40]!==xe||t[41]!==y||t[42]!==Ce||t[43]!==k||t[44]!==u||t[45]!==D||t[46]!==Z||t[47]!==Ee||t[48]!==De||t[49]!==Q?($=_(ie,{placeholder:Z,...u,multiple:y,isLoading:Ee,isLoadingNext:Se,total:De,options:Ce,value:Te,onChange:Q,searchValue:k,onSearch:A,onOpenChange:D,endReached:xe}),t[38]=Se,t[39]=Te,t[40]=xe,t[41]=y,t[42]=Ce,t[43]=k,t[44]=u,t[45]=D,t[46]=Z,t[47]=Ee,t[48]=De,t[49]=Q,t[50]=$):$=t[50],$}})))()}var w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z;function B(){return(B=e((()=>{ae(),C(),w={title:`Fragments/BAIScopedUserSelect`,component:S,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:"\n**BAIScopedUserSelect** — the user picker for admin and project-admin forms (ADR 0012). Built on `BAIComplexSelect`, paged through `scopedUsersV2`.\n\n- `scope` (required): the `UserScope` input. Admin pages pass the current domain from `useCurrentDomain()`; a project-admin page passes `{ project: [{ value: projectId }] }`.\n- `valuePropName`: `'email'` (default) or `'id'` — which field is the plain-key value. Only `'id'` runs the `uuid in` label-resolution query; with emails the key already is the label.\n- `filter` / `excludeInactive`: composed into a `UserV2Filter` through the schema's `AND` combinator, together with the debounced `email: { iContains }` search.\n- Needs a manager >= 26.9.0, where `scopedUsersV2` exists.\n\nSee `BAIComplexSelect.stories.tsx` for the underlying popup-body component with static options.\n        "}}},argTypes:{value:{control:!1},onChange:{control:!1},filter:{control:!1},scope:{control:!1},multiple:{control:{type:`boolean`}},excludeInactive:{control:{type:`boolean`}},valuePropName:{control:{type:`select`},options:[`email`,`id`]}}},T=[{id:`VXNlclYyOjE=`,basicInfo:{email:`admin@example.com`,fullName:`System Administrator`}},{id:`VXNlclYyOjI=`,basicInfo:{email:`alice@example.com`,fullName:`Alice Kim`}},{id:`VXNlclYyOjM=`,basicInfo:{email:`bob@example.com`,fullName:`Bob Lee`}},{id:`VXNlclYyOjQ=`,basicInfo:{email:`carol@example.com`,fullName:`Carol Park`}}],E=e=>({count:e.length,edges:e.map(e=>({node:e}))}),D={Query:()=>({scopedUsersV2:E(T)})},O={Query:()=>({scopedUsersV2:E([])})},k={domain:[{value:`5c3b5a9e-0000-4000-8000-0000000000d0`}]},A=({scope:e=k,initialValue:t=null,resolvers:n=D,...r})=>{let[i,a]=se(t);return _(h,{mockResolvers:n,children:_(S,{...r,scope:e,value:i,onChange:e=>a(e??null)})})},j={parameters:{docs:{description:{story:"A domain scope, as admin pages build from `useCurrentDomain()`: the users of that domain."}}},render:e=>_(A,{...e,label:`User`,defaultOpen:!0})},M={parameters:{docs:{description:{story:`A project scope, as the project-admin session page passes: the members of that project.`}}},render:e=>_(A,{...e,label:`Owner`,scope:{project:[{value:`5c3b5a9e-0000-4000-8000-000000000001`}]},defaultOpen:!0})},N={name:`Multiple Select`,parameters:{docs:{description:{story:`Multi-selection: the value is an array of keys and the trigger lists the selected emails.`}}},render:e=>_(A,{...e,label:`Users`,multiple:!0,initialValue:[`admin@example.com`]})},P={name:`Exclude Inactive Users`,parameters:{docs:{description:{story:"`excludeInactive` composes `status: { equals: ACTIVE }` into the `UserV2Filter`."}}},render:e=>_(A,{...e,label:`User`,excludeInactive:!0})},F={name:`ID-valued`,parameters:{docs:{description:{story:'`valuePropName="id"` — the plain-key value is the local user UUID, which is what `adminBulkAssignRole` and friends take. This is the only mode that runs the `uuid in` label-resolution query.'}}},render:e=>_(A,{...e,label:`User`,valuePropName:`id`})},I={parameters:{docs:{description:{story:"Caller-side `isLoading`, which spins the trigger the same way the internal debounce and refetch pending states do."}}},render:e=>_(A,{...e,label:`User`,isLoading:!0,isDisabled:!0})},L={parameters:{docs:{description:{story:`No users match the query — the popup shows the shared empty-state text.`}}},render:e=>_(A,{...e,label:`User`,resolvers:O,defaultOpen:!0})},R={parameters:{docs:{description:{story:"The error status a form item sets when its `required` rule fails."}}},render:e=>_(A,{...e,label:`User`,status:{type:`error`,message:`Please select users.`}})},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'A domain scope, as admin pages build from \`useCurrentDomain()\`: the users of that domain.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" defaultOpen />
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'A project scope, as the project-admin session page passes: the members of that project.'
      }
    }
  },
  render: args => <Sandbox {...args} label="Owner" scope={{
    project: [{
      value: '5c3b5a9e-0000-4000-8000-000000000001'
    }]
  }} defaultOpen />
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  name: 'Multiple Select',
  parameters: {
    docs: {
      description: {
        story: 'Multi-selection: the value is an array of keys and the trigger lists the selected emails.'
      }
    }
  },
  render: args => <Sandbox {...args} label="Users" multiple initialValue={['admin@example.com']} />
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  name: 'Exclude Inactive Users',
  parameters: {
    docs: {
      description: {
        story: '\`excludeInactive\` composes \`status: { equals: ACTIVE }\` into the \`UserV2Filter\`.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" excludeInactive />
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  name: 'ID-valued',
  parameters: {
    docs: {
      description: {
        story: '\`valuePropName="id"\` — the plain-key value is the local user UUID, which is what \`adminBulkAssignRole\` and friends take. This is the only mode that runs the \`uuid in\` label-resolution query.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" valuePropName="id" />
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Caller-side \`isLoading\`, which spins the trigger the same way the internal debounce and refetch pending states do.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" isLoading isDisabled />
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'No users match the query — the popup shows the shared empty-state text.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" resolvers={emptyResolvers} defaultOpen />
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
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
}`,...R.parameters?.docs?.source}}},z=[`DomainScope`,`ProjectMembers`,`Multiple`,`ExcludeInactive`,`IdValued`,`Loading`,`Empty`,`Error`]})))()}B();export{j as DomainScope,L as Empty,R as Error,P as ExcludeInactive,F as IdValued,I as Loading,N as Multiple,M as ProjectMembers,z as __namedExportsOrder,w as default};