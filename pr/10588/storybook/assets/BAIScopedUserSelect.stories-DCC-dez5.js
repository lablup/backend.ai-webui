import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-D0Ex1IVc.js";import{n,t as r}from"./castArray-AZdtGfv6.js";import{n as i,t as a}from"./compact-C9OPbfhP.js";import{m as ee,r as te,t as o}from"./hooks-C37w8Ol6.js";import{n as s,t as c}from"./map-CLZMgxwS.js";import{t as l}from"./jsx-runtime-MKhVqBIO.js";import{n as ne,t as u}from"./useBAIi18n-Biey1teG.js";import{t as d}from"./compiler-runtime-CdReTaax.js";import{t as f}from"./react-relay-sBALIJlt.js";import{c as re,v as p}from"./helper-CVvTx27U.js";import{i as ie,n as ae,r as m,t as h}from"./usePaginatedQuery-CRYleCKz.js";import{n as g,t as oe}from"./BAIComplexSelect-D0tPiGCY.js";import{n as _,t as v}from"./RelayResolver-CMrgwoPg.js";var y;function b(){return(b=e((()=>{y=(function(){var e={defaultValue:null,kind:`LocalArgument`,name:`limit`},t={defaultValue:null,kind:`LocalArgument`,name:`scope`},n={defaultValue:null,kind:`LocalArgument`,name:`selectedFilter`},r={defaultValue:null,kind:`LocalArgument`,name:`skipSelected`},i=[{condition:`skipSelected`,kind:`Condition`,passingValue:!1,selections:[{alias:null,args:[{kind:`Variable`,name:`filter`,variableName:`selectedFilter`},{kind:`Variable`,name:`limit`,variableName:`limit`},{kind:`Variable`,name:`scope`,variableName:`scope`}],concreteType:`UserV2Connection`,kind:`LinkedField`,name:`scopedUsersV2`,plural:!1,selections:[{alias:null,args:null,concreteType:`UserV2Edge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`UserV2`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`entityId`,storageKey:null},{alias:null,args:null,concreteType:`UserV2BasicInfo`,kind:`LinkedField`,name:`basicInfo`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`email`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`fullName`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}]}];return{fragment:{argumentDefinitions:[e,t,n,r],kind:`Fragment`,metadata:null,name:`BAIScopedUserSelectValueQuery`,selections:i,type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[t,n,e,r],kind:`Operation`,name:`BAIScopedUserSelectValueQuery`,selections:i},params:{cacheID:`73f803e1b9de2f6f3006e799975668d7`,id:null,metadata:{},name:`BAIScopedUserSelectValueQuery`,operationKind:`query`,text:`query BAIScopedUserSelectValueQuery(
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
`}}})(),y.hash=`411743b8638ae718f2aaa52604b93e2c`})))()}var x;function S(){return(S=e((()=>{x=(function(){var e={defaultValue:null,kind:`LocalArgument`,name:`filter`},t={defaultValue:null,kind:`LocalArgument`,name:`limit`},n={defaultValue:null,kind:`LocalArgument`,name:`offset`},r={defaultValue:null,kind:`LocalArgument`,name:`orderBy`},i={defaultValue:null,kind:`LocalArgument`,name:`scope`},a=[{alias:null,args:[{kind:`Variable`,name:`filter`,variableName:`filter`},{kind:`Variable`,name:`limit`,variableName:`limit`},{kind:`Variable`,name:`offset`,variableName:`offset`},{kind:`Variable`,name:`orderBy`,variableName:`orderBy`},{kind:`Variable`,name:`scope`,variableName:`scope`}],concreteType:`UserV2Connection`,kind:`LinkedField`,name:`scopedUsersV2`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`count`,storageKey:null},{alias:null,args:null,concreteType:`UserV2Edge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`UserV2`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`entityId`,storageKey:null},{alias:null,args:null,concreteType:`UserV2BasicInfo`,kind:`LinkedField`,name:`basicInfo`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`email`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`fullName`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:[e,t,n,r,i],kind:`Fragment`,metadata:null,name:`BAIScopedUserSelectPaginatedQuery`,selections:a,type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[i,n,t,e,r],kind:`Operation`,name:`BAIScopedUserSelectPaginatedQuery`,selections:a},params:{cacheID:`efde6092b86268c770cd00e780dc0fef`,id:null,metadata:{},name:`BAIScopedUserSelectPaginatedQuery`,operationKind:`query`,text:`query BAIScopedUserSelectPaginatedQuery(
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
`}}})(),x.hash=`9f76fb36f1f0267e95d5c7b6c2bf8a87`})))()}function se(e){return e.scopedUsersV2?.count??void 0}function ce(e){return a(s(e.scopedUsersV2?.edges,`node`))}function le(e){return e?.id}function ue(e){return e.value}var de,C,fe,pe,me,w;function T(){return(T=e((()=>{b(),S(),de=d(),re(),m(),o(),u(),h(),g(),i(),n(),c(),C=t(),fe=f(),pe=l(),me=10,w=e=>{"use memo";let t=(0,de.c)(51),n,i,o,c,l,u,d,f;t[0]===e?(n=t[1],i=t[2],o=t[3],c=t[4],l=t[5],u=t[6],d=t[7],f=t[8]):({scope:c,filter:n,excludeInactive:u,valuePropName:d,multiple:f,isLoading:i,ref:o,...l}=e,t[0]=e,t[1]=n,t[2]=i,t[3]=o,t[4]=c,t[5]=l,t[6]=u,t[7]=d,t[8]=f);let re=u!==void 0&&u,m=d===void 0?`email`:d,h=f!==void 0&&f,{t:g}=ne(),_;t[9]===Symbol.for(`react.memo_cache_sentinel`)?(_={valuePropName:`value`,trigger:`onChange`},t[9]=_):_=t[9];let[v,b]=ee(l,_),S;t[10]===Symbol.for(`react.memo_cache_sentinel`)?(S={valuePropName:`open`,trigger:`onOpenChange`,defaultValuePropName:`defaultOpen`},t[10]=S):S=t[10];let[w,T]=ee(l,S),E=(0,C.useDeferredValue)(w),[D,O]=(0,C.useState)(``),k=ie(D),[A,j]=(0,C.useTransition)(),[M,N]=te(),P=(0,C.useDeferredValue)(M),F,I;t[11]===N?(F=t[12],I=t[13]):(F=()=>({refetch:()=>{j(()=>{N()})}}),I=[N,j],t[11]=N,t[12]=F,t[13]=I),(0,C.useImperativeHandle)(o,F,I);let L=p([re?{status:{equals:`ACTIVE`}}:null,n]),R=(0,C.useDeferredValue)(v),z;t[14]===R?z=t[15]:(z=R??[],t[14]=R,t[15]=z);let B=a(r(z)),V=m===`id`&&B.length>0,H=V?`store-or-network`:`store-only`,U;t[16]!==P||t[17]!==H?(U={fetchPolicy:H,fetchKey:P},t[16]=P,t[17]=H,t[18]=U):U=t[18];let W=(0,fe.useLazyLoadQuery)(y,{scope:c,selectedFilter:V?p([{uuid:{in:B}},L]):null,limit:Math.max(B.length,1),skipSelected:!V},U),G;t[19]===Symbol.for(`react.memo_cache_sentinel`)?(G={limit:me},t[19]=G):G=t[19];let he=E?`network-only`:`store-only`,K;t[20]!==P||t[21]!==he?(K={fetchPolicy:he,fetchKey:P},t[20]=P,t[21]=he,t[22]=K):K=t[22];let q;t[23]===Symbol.for(`react.memo_cache_sentinel`)?(q={getTotal:se,getItem:ce,getId:le},t[23]=q):q=t[23];let{paginationData:ge,result:_e,loadNext:ve,isLoadingNext:ye}=ae(x,G,{scope:c,filter:p([L,k?{email:{iContains:k}}:null]),orderBy:[{field:`EMAIL`,direction:`ASC`}]},K,q),J;t[24]===m?J=t[25]:(J=e=>{if(e)return m===`id`?e.entityId:e.basicInfo?.email??void 0},t[24]=m,t[25]=J);let Y=J,X;if(t[26]!==Y||t[27]!==ge){let e;t[29]===Y?e=t[30]:(e=e=>{let t=Y(e);return t?{value:t,label:e?.basicInfo?.email??t,description:e?.basicInfo?.fullName??void 0}:null},t[29]=Y,t[30]=e),X=a(s(ge,e)),t[26]=Y,t[27]=ge,t[28]=X}else X=t[28];let be=X,xe;bb0:{let e;t[31]===Y?e=t[32]:(e=e=>{let t=Y(e?.node);return t?[t,e?.node?.basicInfo?.email]:null},t[31]=Y,t[32]=e);let n=new Map(a(s(W.scopedUsersV2?.edges,e))),r=s(B,e=>({label:n.get(e)??e,value:e}));if(h){xe=r;break bb0}xe=r[0]??null}let Se=xe,Z;t[33]===g?Z=t[34]:(Z=g(`comp:BAIUserSelect.SelectUser`),t[33]=g,t[34]=Z);let Ce=i||!!w&&!E||v!==R||D!==k||A,we=_e.scopedUsersV2?.count??void 0,Q;t[35]!==h||t[36]!==b?(Q=e=>{let t=a(r(e??[])),n=s(t,ue);b(h?n:n[0],h?t:t[0])},t[35]=h,t[36]=b,t[37]=Q):Q=t[37];let $;return t[38]!==ye||t[39]!==Se||t[40]!==ve||t[41]!==h||t[42]!==be||t[43]!==D||t[44]!==l||t[45]!==T||t[46]!==Z||t[47]!==Ce||t[48]!==we||t[49]!==Q?($=(0,pe.jsx)(oe,{placeholder:Z,...l,multiple:h,isLoading:Ce,isLoadingNext:ye,total:we,options:be,value:Se,onChange:Q,searchValue:D,onSearch:O,onOpenChange:T,endReached:ve}),t[38]=ye,t[39]=Se,t[40]=ve,t[41]=h,t[42]=be,t[43]=D,t[44]=l,t[45]=T,t[46]=Z,t[47]=Ce,t[48]=we,t[49]=Q,t[50]=$):$=t[50],$}})))()}var E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U;function W(){return(W=e((()=>{_(),T(),E=t(),D=l(),O={title:`Fragments/BAIScopedUserSelect`,component:w,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:"\n**BAIScopedUserSelect** — the user picker for admin and project-admin forms (ADR 0012). Built on `BAIComplexSelect`, paged through `scopedUsersV2`.\n\n- `scope` (required): the `UserScope` input. Admin pages pass the current domain from `useCurrentDomain()`; a project-admin page passes `{ project: [{ value: projectId }] }`.\n- `valuePropName`: `'email'` (default) or `'id'` — which field is the plain-key value. Only `'id'` runs the `uuid in` label-resolution query; with emails the key already is the label.\n- `filter` / `excludeInactive`: composed into a `UserV2Filter` through the schema's `AND` combinator, together with the debounced `email: { iContains }` search.\n- Needs a manager >= 26.9.0, where `scopedUsersV2` exists.\n\nSee `BAIComplexSelect.stories.tsx` for the underlying popup-body component with static options.\n        "}}},argTypes:{value:{control:!1},onChange:{control:!1},filter:{control:!1},scope:{control:!1},multiple:{control:{type:`boolean`}},excludeInactive:{control:{type:`boolean`}},valuePropName:{control:{type:`select`},options:[`email`,`id`]}}},k=[{id:`VXNlclYyOjE=`,basicInfo:{email:`admin@example.com`,fullName:`System Administrator`}},{id:`VXNlclYyOjI=`,basicInfo:{email:`alice@example.com`,fullName:`Alice Kim`}},{id:`VXNlclYyOjM=`,basicInfo:{email:`bob@example.com`,fullName:`Bob Lee`}},{id:`VXNlclYyOjQ=`,basicInfo:{email:`carol@example.com`,fullName:`Carol Park`}}],A=e=>({count:e.length,edges:e.map(e=>({node:e}))}),j={Query:()=>({scopedUsersV2:A(k)})},M={Query:()=>({scopedUsersV2:A([])})},N={domain:[{value:`5c3b5a9e-0000-4000-8000-0000000000d0`}]},P=({scope:e=N,initialValue:t=null,resolvers:n=j,...r})=>{let[i,a]=(0,E.useState)(t);return(0,D.jsx)(v,{mockResolvers:n,children:(0,D.jsx)(w,{...r,scope:e,value:i,onChange:e=>a(e??null)})})},F={parameters:{docs:{description:{story:"A domain scope, as admin pages build from `useCurrentDomain()`: the users of that domain."}}},render:e=>(0,D.jsx)(P,{...e,label:`User`,defaultOpen:!0})},I={parameters:{docs:{description:{story:`A project scope, as the project-admin session page passes: the members of that project.`}}},render:e=>(0,D.jsx)(P,{...e,label:`Owner`,scope:{project:[{value:`5c3b5a9e-0000-4000-8000-000000000001`}]},defaultOpen:!0})},L={name:`Multiple Select`,parameters:{docs:{description:{story:`Multi-selection: the value is an array of keys and the trigger lists the selected emails.`}}},render:e=>(0,D.jsx)(P,{...e,label:`Users`,multiple:!0,initialValue:[`admin@example.com`]})},R={name:`Exclude Inactive Users`,parameters:{docs:{description:{story:"`excludeInactive` composes `status: { equals: ACTIVE }` into the `UserV2Filter`."}}},render:e=>(0,D.jsx)(P,{...e,label:`User`,excludeInactive:!0})},z={name:`ID-valued`,parameters:{docs:{description:{story:'`valuePropName="id"` — the plain-key value is the local user UUID, which is what `adminBulkAssignRole` and friends take. This is the only mode that runs the `uuid in` label-resolution query.'}}},render:e=>(0,D.jsx)(P,{...e,label:`User`,valuePropName:`id`})},B={parameters:{docs:{description:{story:"Caller-side `isLoading`, which spins the trigger the same way the internal debounce and refetch pending states do."}}},render:e=>(0,D.jsx)(P,{...e,label:`User`,isLoading:!0,isDisabled:!0})},V={parameters:{docs:{description:{story:`No users match the query — the popup shows the shared empty-state text.`}}},render:e=>(0,D.jsx)(P,{...e,label:`User`,resolvers:M,defaultOpen:!0})},H={parameters:{docs:{description:{story:"The error status a form item sets when its `required` rule fails."}}},render:e=>(0,D.jsx)(P,{...e,label:`User`,status:{type:`error`,message:`Please select users.`}})},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'A domain scope, as admin pages build from \`useCurrentDomain()\`: the users of that domain.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" defaultOpen />
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
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
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  name: 'Multiple Select',
  parameters: {
    docs: {
      description: {
        story: 'Multi-selection: the value is an array of keys and the trigger lists the selected emails.'
      }
    }
  },
  render: args => <Sandbox {...args} label="Users" multiple initialValue={['admin@example.com']} />
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  name: 'Exclude Inactive Users',
  parameters: {
    docs: {
      description: {
        story: '\`excludeInactive\` composes \`status: { equals: ACTIVE }\` into the \`UserV2Filter\`.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" excludeInactive />
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  name: 'ID-valued',
  parameters: {
    docs: {
      description: {
        story: '\`valuePropName="id"\` — the plain-key value is the local user UUID, which is what \`adminBulkAssignRole\` and friends take. This is the only mode that runs the \`uuid in\` label-resolution query.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" valuePropName="id" />
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Caller-side \`isLoading\`, which spins the trigger the same way the internal debounce and refetch pending states do.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" isLoading isDisabled />
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'No users match the query — the popup shows the shared empty-state text.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" resolvers={emptyResolvers} defaultOpen />
}`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
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
}`,...H.parameters?.docs?.source}}},U=[`DomainScope`,`ProjectMembers`,`Multiple`,`ExcludeInactive`,`IdValued`,`Loading`,`Empty`,`Error`]})))()}W();export{F as DomainScope,V as Empty,H as Error,R as ExcludeInactive,z as IdValued,B as Loading,L as Multiple,I as ProjectMembers,U as __namedExportsOrder,O as default};