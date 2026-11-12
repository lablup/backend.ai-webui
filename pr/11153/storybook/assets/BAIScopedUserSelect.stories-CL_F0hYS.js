import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-DlPsW1c0.js";import{n,t as r}from"./castArray-AZdtGfv6.js";import{n as i,t as a}from"./compact-C9OPbfhP.js";import{m as ee,r as te,t as o}from"./hooks-T_PEg8sW.js";import{n as s,t as ne}from"./find-BDy-bsvW.js";import{n as c,t as l}from"./map-CLZMgxwS.js";import{n as re,t as u}from"./some-DkjZXzzg.js";import{t as d}from"./jsx-runtime-MKhVqBIO.js";import{n as ie,t as f}from"./useBAIi18n-D1AzK-FG.js";import{t as p}from"./compiler-runtime-DU4U6aph.js";import{n as ae,t as oe}from"./createLucideIcon-DF5UGKo-.js";import{t as m}from"./react-relay-CDKBZFrB.js";import{c as h,v as se}from"./helper-CBd75l-d.js";import{i as ce,n as le,r as g,t as _}from"./usePaginatedQuery-DiIcX0zD.js";import{n as ue,t as de}from"./BAIComplexSelect-CoRMAIhE.js";import{n as v,t as y}from"./RelayResolver-BK8h-MjU.js";var b,fe;function x(){return(x=e((()=>{ae(),b=[[`path`,{d:`M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8`,key:`12jkf8`}],[`path`,{d:`m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7`,key:`1ocrg3`}],[`path`,{d:`M19 16v6`,key:`tddt3s`}],[`path`,{d:`M16 19h6`,key:`xwg31i`}]],fe=oe(`mail-plus`,b)})))()}var pe;function S(){return(S=e((()=>{pe=(function(){var e={defaultValue:null,kind:`LocalArgument`,name:`limit`},t={defaultValue:null,kind:`LocalArgument`,name:`scope`},n={defaultValue:null,kind:`LocalArgument`,name:`selectedFilter`},r={defaultValue:null,kind:`LocalArgument`,name:`skipSelected`},i=[{condition:`skipSelected`,kind:`Condition`,passingValue:!1,selections:[{alias:null,args:[{kind:`Variable`,name:`filter`,variableName:`selectedFilter`},{kind:`Variable`,name:`limit`,variableName:`limit`},{kind:`Variable`,name:`scope`,variableName:`scope`}],concreteType:`UserV2Connection`,kind:`LinkedField`,name:`scopedUsersV2`,plural:!1,selections:[{alias:null,args:null,concreteType:`UserV2Edge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`UserV2`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`entityId`,storageKey:null},{alias:null,args:null,concreteType:`UserV2BasicInfo`,kind:`LinkedField`,name:`basicInfo`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`email`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`fullName`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}]}];return{fragment:{argumentDefinitions:[e,t,n,r],kind:`Fragment`,metadata:null,name:`BAIScopedUserSelectValueQuery`,selections:i,type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[t,n,e,r],kind:`Operation`,name:`BAIScopedUserSelectValueQuery`,selections:i},params:{cacheID:`73f803e1b9de2f6f3006e799975668d7`,id:null,metadata:{},name:`BAIScopedUserSelectValueQuery`,operationKind:`query`,text:`query BAIScopedUserSelectValueQuery(
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
`}}})(),pe.hash=`411743b8638ae718f2aaa52604b93e2c`})))()}var me;function C(){return(C=e((()=>{me=(function(){var e={defaultValue:null,kind:`LocalArgument`,name:`filter`},t={defaultValue:null,kind:`LocalArgument`,name:`limit`},n={defaultValue:null,kind:`LocalArgument`,name:`offset`},r={defaultValue:null,kind:`LocalArgument`,name:`orderBy`},i={defaultValue:null,kind:`LocalArgument`,name:`scope`},a=[{alias:null,args:[{kind:`Variable`,name:`filter`,variableName:`filter`},{kind:`Variable`,name:`limit`,variableName:`limit`},{kind:`Variable`,name:`offset`,variableName:`offset`},{kind:`Variable`,name:`orderBy`,variableName:`orderBy`},{kind:`Variable`,name:`scope`,variableName:`scope`}],concreteType:`UserV2Connection`,kind:`LinkedField`,name:`scopedUsersV2`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`count`,storageKey:null},{alias:null,args:null,concreteType:`UserV2Edge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`UserV2`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`entityId`,storageKey:null},{alias:null,args:null,concreteType:`UserV2BasicInfo`,kind:`LinkedField`,name:`basicInfo`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`email`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`fullName`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:[e,t,n,r,i],kind:`Fragment`,metadata:null,name:`BAIScopedUserSelectPaginatedQuery`,selections:a,type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[i,n,t,e,r],kind:`Operation`,name:`BAIScopedUserSelectPaginatedQuery`,selections:a},params:{cacheID:`efde6092b86268c770cd00e780dc0fef`,id:null,metadata:{},name:`BAIScopedUserSelectPaginatedQuery`,operationKind:`query`,text:`query BAIScopedUserSelectPaginatedQuery(
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
`}}})(),me.hash=`9f76fb36f1f0267e95d5c7b6c2bf8a87`})))()}function he(e){return e.scopedUsersV2?.count??void 0}function ge(e){return a(c(e.scopedUsersV2?.edges,`node`))}function _e(e){return e?.id}function ve(e){return e.value}var ye,w,be,xe,Se,Ce,T;function E(){return(E=e((()=>{S(),C(),ye=p(),h(),g(),o(),f(),_(),ue(),i(),n(),l(),u(),s(),x(),w=t(),be=m(),xe=d(),Se=10,Ce=/^[^\s@]+@[^\s@]+\.[^\s@]+$/,T=e=>{"use memo";let t=(0,ye.c)(53),n,i,o,s,l,u,d,f,p;t[0]===e?(n=t[1],i=t[2],o=t[3],s=t[4],l=t[5],u=t[6],d=t[7],f=t[8],p=t[9]):({scope:s,allowCustomSelect:u,filter:n,excludeInactive:d,valuePropName:f,multiple:p,isLoading:i,ref:o,...l}=e,t[0]=e,t[1]=n,t[2]=i,t[3]=o,t[4]=s,t[5]=l,t[6]=u,t[7]=d,t[8]=f,t[9]=p);let ae=u!==void 0&&u,oe=d!==void 0&&d,m=f===void 0?`email`:f,h=p!==void 0&&p,{t:g}=ie(),_;t[10]===Symbol.for(`react.memo_cache_sentinel`)?(_={valuePropName:`value`,trigger:`onChange`},t[10]=_):_=t[10];let[ue,v]=ee(l,_),y;t[11]===Symbol.for(`react.memo_cache_sentinel`)?(y={valuePropName:`open`,trigger:`onOpenChange`,defaultValuePropName:`defaultOpen`},t[11]=y):y=t[11];let[b,x]=ee(l,y),S=(0,w.useDeferredValue)(b),[C,T]=(0,w.useState)(``),E=ce(C),[we,D]=(0,w.useTransition)(),[Te,O]=te(),k=(0,w.useDeferredValue)(Te),A,j;t[12]===O?(A=t[13],j=t[14]):(A=()=>({refetch:()=>{D(()=>{O()})}}),j=[O,D],t[12]=O,t[13]=A,t[14]=j),(0,w.useImperativeHandle)(o,A,j);let M=se([oe?{status:{equals:`ACTIVE`}}:null,n]),N=(0,w.useDeferredValue)(ue),P;t[15]===N?P=t[16]:(P=N??[],t[15]=N,t[16]=P);let F=a(r(P)),I=m===`id`&&F.length>0,L=I?`store-or-network`:`store-only`,R;t[17]!==k||t[18]!==L?(R={fetchPolicy:L,fetchKey:k},t[17]=k,t[18]=L,t[19]=R):R=t[19];let z=(0,be.useLazyLoadQuery)(pe,{scope:s,selectedFilter:I?se([{uuid:{in:F}},M]):null,limit:Math.max(F.length,1),skipSelected:!I},R),B;t[20]===Symbol.for(`react.memo_cache_sentinel`)?(B={limit:Se},t[20]=B):B=t[20];let V=S?`network-only`:`store-only`,H;t[21]!==k||t[22]!==V?(H={fetchPolicy:V,fetchKey:k},t[21]=k,t[22]=V,t[23]=H):H=t[23];let U;t[24]===Symbol.for(`react.memo_cache_sentinel`)?(U={getTotal:he,getItem:ge,getId:_e},t[24]=U):U=t[24];let{paginationData:W,result:Ee,loadNext:De,isLoadingNext:Oe}=le(me,B,{scope:s,filter:se([M,E?{email:{iContains:E}}:null]),orderBy:[{field:`EMAIL`,direction:`ASC`}]},H,U),G;t[25]===m?G=t[26]:(G=e=>{if(e)return m===`id`?e.entityId:e.basicInfo?.email??void 0},t[25]=m,t[26]=G);let K=G,q;t[27]===K?q=t[28]:(q=e=>{let t=K(e);return t?{value:t,label:e?.basicInfo?.email??t,description:e?.basicInfo?.fullName??void 0}:null},t[27]=K,t[28]=q);let ke=a(c(W,q)),J=E.trim(),Y=ae&&m===`email`&&Ce.test(J)&&!re(ke,e=>e.value.toLowerCase()===J.toLowerCase())?{value:J,label:J,description:g(`comp:BAIScopedUserSelect.InviteByEmail`),icon:(0,xe.jsx)(fe,{size:`1em`})}:null,Ae;bb0:{let e;t[29]===K?e=t[30]:(e=e=>{let t=K(e?.node);return t?[t,e?.node?.basicInfo?.email]:null},t[29]=K,t[30]=e);let n=new Map(a(c(z.scopedUsersV2?.edges,e))),r=c(F,e=>({label:n.get(e)??e,value:e}));if(h){Ae=r;break bb0}Ae=r[0]??null}let X=Ae,je=de,Z;t[31]===g?Z=t[32]:(Z=g(`comp:BAIUserSelect.SelectUser`),t[31]=g,t[32]=Z);let Me=i||!!b&&!S||ue!==N||C!==E||we,Ne=Ee.scopedUsersV2?.count??void 0,Pe=Y?[...ke,Y]:ke,Q;t[33]!==Y||t[34]!==K||t[35]!==h||t[36]!==W||t[37]!==v?(Q=e=>{let t=a(r(e??[])),n=c(t,ve),i=c(t,e=>{let t=ne(W,t=>K(t)===e.value);return t?{...e,userId:t.entityId}:Y&&e.value===Y.value?{...e,isCustom:!0}:e});v(h?n:n[0],h?i:i[0]),h||T(``)},t[33]=Y,t[34]=K,t[35]=h,t[36]=W,t[37]=v,t[38]=Q):Q=t[38];let $;return t[39]!==je||t[40]!==Oe||t[41]!==X||t[42]!==De||t[43]!==h||t[44]!==C||t[45]!==l||t[46]!==x||t[47]!==Z||t[48]!==Me||t[49]!==Ne||t[50]!==Pe||t[51]!==Q?($=(0,xe.jsx)(je,{placeholder:Z,...l,multiple:h,isLoading:Me,isLoadingNext:Oe,total:Ne,options:Pe,value:X,onChange:Q,searchValue:C,onSearch:T,onOpenChange:x,endReached:De}),t[39]=je,t[40]=Oe,t[41]=X,t[42]=De,t[43]=h,t[44]=C,t[45]=l,t[46]=x,t[47]=Z,t[48]=Me,t[49]=Ne,t[50]=Pe,t[51]=Q,t[52]=$):$=t[52],$}})))()}var we,D,Te,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U;function W(){return(W=e((()=>{v(),E(),we=t(),D=d(),Te={title:`Fragments/BAIScopedUserSelect`,component:T,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:"\n**BAIScopedUserSelect** — the user picker for admin and project-admin forms (ADR 0012). Built on `BAIComplexSelect`, paged through `scopedUsersV2`.\n\n- `scope` (required): the `UserScope` input. Admin pages pass the current domain from `useCurrentDomain()`; a project-admin page passes `{ project: [{ value: projectId }] }`.\n- `valuePropName`: `'email'` (default) or `'id'` — which field is the plain-key value. Only `'id'` runs the `uuid in` label-resolution query; with emails the key already is the label.\n- `filter` / `excludeInactive`: composed into a `UserV2Filter` through the schema's `AND` combinator, together with the debounced `email: { iContains }` search.\n- Needs a manager >= 26.9.0, where `scopedUsersV2` exists.\n\nSee `BAIComplexSelect.stories.tsx` for the underlying popup-body component with static options.\n        "}}},argTypes:{value:{control:!1},onChange:{control:!1},filter:{control:!1},scope:{control:!1},multiple:{control:{type:`boolean`}},excludeInactive:{control:{type:`boolean`}},valuePropName:{control:{type:`select`},options:[`email`,`id`]}}},O=[{id:`VXNlclYyOjE=`,basicInfo:{email:`admin@example.com`,fullName:`System Administrator`}},{id:`VXNlclYyOjI=`,basicInfo:{email:`alice@example.com`,fullName:`Alice Kim`}},{id:`VXNlclYyOjM=`,basicInfo:{email:`bob@example.com`,fullName:`Bob Lee`}},{id:`VXNlclYyOjQ=`,basicInfo:{email:`carol@example.com`,fullName:`Carol Park`}}],k=e=>({count:e.length,edges:e.map(e=>({node:e}))}),A={Query:()=>({scopedUsersV2:k(O)})},j={Query:()=>({scopedUsersV2:k([])})},M={domain:[{value:`5c3b5a9e-0000-4000-8000-0000000000d0`}]},N=({scope:e=M,initialValue:t=null,resolvers:n=A,...r})=>{let[i,a]=(0,we.useState)(t);return(0,D.jsx)(y,{mockResolvers:n,children:(0,D.jsx)(T,{...r,scope:e,value:i,onChange:e=>a(e??null)})})},P={parameters:{docs:{description:{story:"A domain scope, as admin pages build from `useCurrentDomain()`: the users of that domain."}}},render:e=>(0,D.jsx)(N,{...e,label:`User`,defaultOpen:!0})},F={parameters:{docs:{description:{story:`A project scope, as the project-admin session page passes: the members of that project.`}}},render:e=>(0,D.jsx)(N,{...e,label:`Owner`,scope:{project:[{value:`5c3b5a9e-0000-4000-8000-000000000001`}]},defaultOpen:!0})},I={name:`Multiple Select`,parameters:{docs:{description:{story:`Multi-selection: the value is an array of keys and the trigger lists the selected emails.`}}},render:e=>(0,D.jsx)(N,{...e,label:`Users`,multiple:!0,initialValue:[`admin@example.com`]})},L={name:`Custom e-mail entry`,parameters:{docs:{description:{story:"`allowCustomSelect` — an e-mail address typed in the search box that no listed user matches is offered as one more option; picking it makes the value that address and `onChange` marks it `isCustom`."}}},render:e=>(0,D.jsx)(N,{...e,label:`User`,allowCustomSelect:!0,defaultOpen:!0})},R={name:`Exclude Inactive Users`,parameters:{docs:{description:{story:"`excludeInactive` composes `status: { equals: ACTIVE }` into the `UserV2Filter`."}}},render:e=>(0,D.jsx)(N,{...e,label:`User`,excludeInactive:!0})},z={name:`ID-valued`,parameters:{docs:{description:{story:'`valuePropName="id"` — the plain-key value is the local user UUID, which is what `partialBulkAssignRoles` and friends take. This is the only mode that runs the `uuid in` label-resolution query.'}}},render:e=>(0,D.jsx)(N,{...e,label:`User`,valuePropName:`id`})},B={parameters:{docs:{description:{story:"Caller-side `isLoading`, which spins the trigger the same way the internal debounce and refetch pending states do."}}},render:e=>(0,D.jsx)(N,{...e,label:`User`,isLoading:!0,isDisabled:!0})},V={parameters:{docs:{description:{story:`No users match the query — the popup shows the shared empty-state text.`}}},render:e=>(0,D.jsx)(N,{...e,label:`User`,resolvers:j,defaultOpen:!0})},H={parameters:{docs:{description:{story:"The error status a form item sets when its `required` rule fails."}}},render:e=>(0,D.jsx)(N,{...e,label:`User`,status:{type:`error`,message:`Please select users.`}})},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'A domain scope, as admin pages build from \`useCurrentDomain()\`: the users of that domain.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" defaultOpen />
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
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
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  name: 'Multiple Select',
  parameters: {
    docs: {
      description: {
        story: 'Multi-selection: the value is an array of keys and the trigger lists the selected emails.'
      }
    }
  },
  render: args => <Sandbox {...args} label="Users" multiple initialValue={['admin@example.com']} />
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  name: 'Custom e-mail entry',
  parameters: {
    docs: {
      description: {
        story: '\`allowCustomSelect\` — an e-mail address typed in the search box that no listed user matches is offered as one more option; picking it makes the value that address and \`onChange\` marks it \`isCustom\`.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" allowCustomSelect defaultOpen />
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
        story: '\`valuePropName="id"\` — the plain-key value is the local user UUID, which is what \`partialBulkAssignRoles\` and friends take. This is the only mode that runs the \`uuid in\` label-resolution query.'
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
}`,...H.parameters?.docs?.source}}},U=[`DomainScope`,`ProjectMembers`,`Multiple`,`CustomSelect`,`ExcludeInactive`,`IdValued`,`Loading`,`Empty`,`Error`]})))()}W();export{L as CustomSelect,P as DomainScope,V as Empty,H as Error,R as ExcludeInactive,z as IdValued,B as Loading,I as Multiple,F as ProjectMembers,U as __namedExportsOrder,Te as default};