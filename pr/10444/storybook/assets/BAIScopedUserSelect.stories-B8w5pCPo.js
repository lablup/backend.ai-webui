import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-DlPsW1c0.js";import{n,t as r}from"./castArray-AZdtGfv6.js";import{n as i,t as a}from"./compact-C9OPbfhP.js";import{m as ee,r as te,t as o}from"./hooks-CqTIG_8a.js";import{n as s,t as c}from"./map-BLzs52H1.js";import{t as l}from"./jsx-runtime-MKhVqBIO.js";import{n as ne,t as u}from"./useBAIi18n-DURTYAKn.js";import{t as d}from"./compiler-runtime-DU4U6aph.js";import{t as f}from"./react-relay-sHama7hJ.js";import{c as p,v as re}from"./helper-p-d7z67I.js";import{i as ie,n as ae,r as oe,t as m}from"./usePaginatedQuery-ENnapyeZ.js";import{n as h,t as se}from"./BAIComplexSelect-7azqcH4d.js";import{n as ce,t as g}from"./RelayResolver-BnFyFQJn.js";var le;function ue(){return(ue=e((()=>{le=(function(){var e={defaultValue:null,kind:`LocalArgument`,name:`limit`},t={defaultValue:null,kind:`LocalArgument`,name:`scope`},n={defaultValue:null,kind:`LocalArgument`,name:`selectedFilter`},r={defaultValue:null,kind:`LocalArgument`,name:`skipSelected`},i=[{condition:`skipSelected`,kind:`Condition`,passingValue:!1,selections:[{alias:null,args:[{kind:`Variable`,name:`filter`,variableName:`selectedFilter`},{kind:`Variable`,name:`limit`,variableName:`limit`},{kind:`Variable`,name:`scope`,variableName:`scope`}],concreteType:`UserV2Connection`,kind:`LinkedField`,name:`scopedUsersV2`,plural:!1,selections:[{alias:null,args:null,concreteType:`UserV2Edge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`UserV2`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`entityId`,storageKey:null},{alias:null,args:null,concreteType:`UserV2BasicInfo`,kind:`LinkedField`,name:`basicInfo`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`email`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`fullName`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}]}];return{fragment:{argumentDefinitions:[e,t,n,r],kind:`Fragment`,metadata:null,name:`BAIScopedUserSelectValueQuery`,selections:i,type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[t,n,e,r],kind:`Operation`,name:`BAIScopedUserSelectValueQuery`,selections:i},params:{cacheID:`73f803e1b9de2f6f3006e799975668d7`,id:null,metadata:{},name:`BAIScopedUserSelectValueQuery`,operationKind:`query`,text:`query BAIScopedUserSelectValueQuery(
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
`}}})(),le.hash=`411743b8638ae718f2aaa52604b93e2c`})))()}var de;function _(){return(_=e((()=>{de=(function(){var e={defaultValue:null,kind:`LocalArgument`,name:`filter`},t={defaultValue:null,kind:`LocalArgument`,name:`limit`},n={defaultValue:null,kind:`LocalArgument`,name:`offset`},r={defaultValue:null,kind:`LocalArgument`,name:`orderBy`},i={defaultValue:null,kind:`LocalArgument`,name:`scope`},a=[{alias:null,args:[{kind:`Variable`,name:`filter`,variableName:`filter`},{kind:`Variable`,name:`limit`,variableName:`limit`},{kind:`Variable`,name:`offset`,variableName:`offset`},{kind:`Variable`,name:`orderBy`,variableName:`orderBy`},{kind:`Variable`,name:`scope`,variableName:`scope`}],concreteType:`UserV2Connection`,kind:`LinkedField`,name:`scopedUsersV2`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`count`,storageKey:null},{alias:null,args:null,concreteType:`UserV2Edge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`UserV2`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`entityId`,storageKey:null},{alias:null,args:null,concreteType:`UserV2BasicInfo`,kind:`LinkedField`,name:`basicInfo`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`email`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`fullName`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:[e,t,n,r,i],kind:`Fragment`,metadata:null,name:`BAIScopedUserSelectPaginatedQuery`,selections:a,type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[i,n,t,e,r],kind:`Operation`,name:`BAIScopedUserSelectPaginatedQuery`,selections:a},params:{cacheID:`efde6092b86268c770cd00e780dc0fef`,id:null,metadata:{},name:`BAIScopedUserSelectPaginatedQuery`,operationKind:`query`,text:`query BAIScopedUserSelectPaginatedQuery(
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
`}}})(),de.hash=`9f76fb36f1f0267e95d5c7b6c2bf8a87`})))()}function fe(e){var t;return((t=e.scopedUsersV2)==null?void 0:t.count)??void 0}function pe(e){var t;return a(s((t=e.scopedUsersV2)==null?void 0:t.edges,`node`))}function me(e){return e==null?void 0:e.id}function he(e){return e.value}var ge,v,_e,ve,ye,y;function be(){return(be=e((()=>{ue(),_(),ge=d(),p(),oe(),o(),u(),m(),h(),i(),n(),c(),v=t(),_e=f(),ve=l(),ye=10,y=e=>{"use memo";var t;let n=(0,ge.c)(51),i,o,c,l,u,d,f,p;n[0]===e?(i=n[1],o=n[2],c=n[3],l=n[4],u=n[5],d=n[6],f=n[7],p=n[8]):({scope:l,filter:i,excludeInactive:d,valuePropName:f,multiple:p,isLoading:o,ref:c,...u}=e,n[0]=e,n[1]=i,n[2]=o,n[3]=c,n[4]=l,n[5]=u,n[6]=d,n[7]=f,n[8]=p);let oe=d!==void 0&&d,m=f===void 0?`email`:f,h=p!==void 0&&p,{t:ce}=ne(),g;n[9]===Symbol.for(`react.memo_cache_sentinel`)?(g={valuePropName:`value`,trigger:`onChange`},n[9]=g):g=n[9];let[ue,_]=ee(u,g),y;n[10]===Symbol.for(`react.memo_cache_sentinel`)?(y={valuePropName:`open`,trigger:`onOpenChange`,defaultValuePropName:`defaultOpen`},n[10]=y):y=n[10];let[be,b]=ee(u,y),x=(0,v.useDeferredValue)(be),[S,C]=(0,v.useState)(``),w=ie(S),[T,xe]=(0,v.useTransition)(),[E,D]=te(),O=(0,v.useDeferredValue)(E),k,A;n[11]===D?(k=n[12],A=n[13]):(k=()=>({refetch:()=>{xe(()=>{D()})}}),A=[D,xe],n[11]=D,n[12]=k,n[13]=A),(0,v.useImperativeHandle)(c,k,A);let Se=re([oe?{status:{equals:`ACTIVE`}}:null,i]),j=(0,v.useDeferredValue)(ue),M;n[14]===j?M=n[15]:(M=j??[],n[14]=j,n[15]=M);let N=a(r(M)),P=m===`id`&&N.length>0,F=P?`store-or-network`:`store-only`,I;n[16]!==O||n[17]!==F?(I={fetchPolicy:F,fetchKey:O},n[16]=O,n[17]=F,n[18]=I):I=n[18];let Ce=(0,_e.useLazyLoadQuery)(le,{scope:l,selectedFilter:P?re([{uuid:{in:N}},Se]):null,limit:Math.max(N.length,1),skipSelected:!P},I),L;n[19]===Symbol.for(`react.memo_cache_sentinel`)?(L={limit:ye},n[19]=L):L=n[19];let R=x?`network-only`:`store-only`,z;n[20]!==O||n[21]!==R?(z={fetchPolicy:R,fetchKey:O},n[20]=O,n[21]=R,n[22]=z):z=n[22];let B;n[23]===Symbol.for(`react.memo_cache_sentinel`)?(B={getTotal:fe,getItem:pe,getId:me},n[23]=B):B=n[23];let{paginationData:V,result:H,loadNext:U,isLoadingNext:W}=ae(de,L,{scope:l,filter:re([Se,w?{email:{iContains:w}}:null]),orderBy:[{field:`EMAIL`,direction:`ASC`}]},z,B),G;n[24]===m?G=n[25]:(G=e=>{var t;if(e)return m===`id`?e.entityId:((t=e.basicInfo)==null?void 0:t.email)??void 0},n[24]=m,n[25]=G);let K=G,q;if(n[26]!==K||n[27]!==V){let e;n[29]===K?e=n[30]:(e=e=>{var t,n;let r=K(e);return r?{value:r,label:(e==null||(t=e.basicInfo)==null?void 0:t.email)??r,description:(e==null||(n=e.basicInfo)==null?void 0:n.fullName)??void 0}:null},n[29]=K,n[30]=e),q=a(s(V,e)),n[26]=K,n[27]=V,n[28]=q}else q=n[28];let J=q,Y;bb0:{var X;let e;n[31]===K?e=n[32]:(e=e=>{var t;let n=K(e==null?void 0:e.node);return n?[n,e==null||(t=e.node)==null||(t=t.basicInfo)==null?void 0:t.email]:null},n[31]=K,n[32]=e);let t=new Map(a(s((X=Ce.scopedUsersV2)==null?void 0:X.edges,e))),r=s(N,e=>({label:t.get(e)??e,value:e}));if(h){Y=r;break bb0}Y=r[0]??null}let Z=Y,Q;n[33]===ce?Q=n[34]:(Q=ce(`comp:BAIUserSelect.SelectUser`),n[33]=ce,n[34]=Q);let we=o||!!be&&!x||ue!==j||S!==w||T,Te=((t=H.scopedUsersV2)==null?void 0:t.count)??void 0,$;n[35]!==h||n[36]!==_?($=e=>{let t=a(r(e??[])),n=s(t,he);_(h?n:n[0],h?t:t[0])},n[35]=h,n[36]=_,n[37]=$):$=n[37];let Ee;return n[38]!==W||n[39]!==Z||n[40]!==U||n[41]!==h||n[42]!==J||n[43]!==S||n[44]!==u||n[45]!==b||n[46]!==Q||n[47]!==we||n[48]!==Te||n[49]!==$?(Ee=(0,ve.jsx)(se,{placeholder:Q,...u,multiple:h,isLoading:we,isLoadingNext:W,total:Te,options:J,value:Z,onChange:$,searchValue:S,onSearch:C,onOpenChange:b,endReached:U}),n[38]=W,n[39]=Z,n[40]=U,n[41]=h,n[42]=J,n[43]=S,n[44]=u,n[45]=b,n[46]=Q,n[47]=we,n[48]=Te,n[49]=$,n[50]=Ee):Ee=n[50],Ee}})))()}var b,x,S,C,w,T,xe,E,D,O,k,A,Se,j,M,N,P,F,I,Ce,L,R,z,B,V,H,U,W,G,K,q,J,Y,X;function Z(){return(Z=e((()=>{ce(),be(),b=t(),x=l(),I={title:`Fragments/BAIScopedUserSelect`,component:y,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:"\n**BAIScopedUserSelect** — the user picker for admin and project-admin forms (ADR 0012). Built on `BAIComplexSelect`, paged through `scopedUsersV2`.\n\n- `scope` (required): the `UserScope` input. Admin pages pass the current domain from `useCurrentDomain()`; a project-admin page passes `{ project: [{ value: projectId }] }`.\n- `valuePropName`: `'email'` (default) or `'id'` — which field is the plain-key value. Only `'id'` runs the `uuid in` label-resolution query; with emails the key already is the label.\n- `filter` / `excludeInactive`: composed into a `UserV2Filter` through the schema's `AND` combinator, together with the debounced `email: { iContains }` search.\n- Needs a manager >= 26.9.0, where `scopedUsersV2` exists.\n\nSee `BAIComplexSelect.stories.tsx` for the underlying popup-body component with static options.\n        "}}},argTypes:{value:{control:!1},onChange:{control:!1},filter:{control:!1},scope:{control:!1},multiple:{control:{type:`boolean`}},excludeInactive:{control:{type:`boolean`}},valuePropName:{control:{type:`select`},options:[`email`,`id`]}}},Ce=[{id:`VXNlclYyOjE=`,basicInfo:{email:`admin@example.com`,fullName:`System Administrator`}},{id:`VXNlclYyOjI=`,basicInfo:{email:`alice@example.com`,fullName:`Alice Kim`}},{id:`VXNlclYyOjM=`,basicInfo:{email:`bob@example.com`,fullName:`Bob Lee`}},{id:`VXNlclYyOjQ=`,basicInfo:{email:`carol@example.com`,fullName:`Carol Park`}}],L=e=>({count:e.length,edges:e.map(e=>({node:e}))}),R={Query:()=>({scopedUsersV2:L(Ce)})},z={Query:()=>({scopedUsersV2:L([])})},B={domain:[{value:`5c3b5a9e-0000-4000-8000-0000000000d0`}]},V=({scope:e=B,initialValue:t=null,resolvers:n=R,...r})=>{let[i,a]=(0,b.useState)(t);return(0,x.jsx)(g,{mockResolvers:n,children:(0,x.jsx)(y,{...r,scope:e,value:i,onChange:e=>a(e??null)})})},H={parameters:{docs:{description:{story:"A domain scope, as admin pages build from `useCurrentDomain()`: the users of that domain."}}},render:e=>(0,x.jsx)(V,{...e,label:`User`,defaultOpen:!0})},U={parameters:{docs:{description:{story:`A project scope, as the project-admin session page passes: the members of that project.`}}},render:e=>(0,x.jsx)(V,{...e,label:`Owner`,scope:{project:[{value:`5c3b5a9e-0000-4000-8000-000000000001`}]},defaultOpen:!0})},W={name:`Multiple Select`,parameters:{docs:{description:{story:`Multi-selection: the value is an array of keys and the trigger lists the selected emails.`}}},render:e=>(0,x.jsx)(V,{...e,label:`Users`,multiple:!0,initialValue:[`admin@example.com`]})},G={name:`Exclude Inactive Users`,parameters:{docs:{description:{story:"`excludeInactive` composes `status: { equals: ACTIVE }` into the `UserV2Filter`."}}},render:e=>(0,x.jsx)(V,{...e,label:`User`,excludeInactive:!0})},K={name:`ID-valued`,parameters:{docs:{description:{story:'`valuePropName="id"` — the plain-key value is the local user UUID, which is what `adminBulkAssignRole` and friends take. This is the only mode that runs the `uuid in` label-resolution query.'}}},render:e=>(0,x.jsx)(V,{...e,label:`User`,valuePropName:`id`})},q={parameters:{docs:{description:{story:"Caller-side `isLoading`, which spins the trigger the same way the internal debounce and refetch pending states do."}}},render:e=>(0,x.jsx)(V,{...e,label:`User`,isLoading:!0,isDisabled:!0})},J={parameters:{docs:{description:{story:`No users match the query — the popup shows the shared empty-state text.`}}},render:e=>(0,x.jsx)(V,{...e,label:`User`,resolvers:z,defaultOpen:!0})},Y={parameters:{docs:{description:{story:"The error status a form item sets when its `required` rule fails."}}},render:e=>(0,x.jsx)(V,{...e,label:`User`,status:{type:`error`,message:`Please select users.`}})},H.parameters={...H.parameters,docs:{...(S=H.parameters)==null?void 0:S.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'A domain scope, as admin pages build from \`useCurrentDomain()\`: the users of that domain.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" defaultOpen />
}`,...(C=H.parameters)==null||(C=C.docs)==null?void 0:C.source}}},U.parameters={...U.parameters,docs:{...(w=U.parameters)==null?void 0:w.docs,source:{originalSource:`{
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
}`,...(T=U.parameters)==null||(T=T.docs)==null?void 0:T.source}}},W.parameters={...W.parameters,docs:{...(xe=W.parameters)==null?void 0:xe.docs,source:{originalSource:`{
  name: 'Multiple Select',
  parameters: {
    docs: {
      description: {
        story: 'Multi-selection: the value is an array of keys and the trigger lists the selected emails.'
      }
    }
  },
  render: args => <Sandbox {...args} label="Users" multiple initialValue={['admin@example.com']} />
}`,...(E=W.parameters)==null||(E=E.docs)==null?void 0:E.source}}},G.parameters={...G.parameters,docs:{...(D=G.parameters)==null?void 0:D.docs,source:{originalSource:`{
  name: 'Exclude Inactive Users',
  parameters: {
    docs: {
      description: {
        story: '\`excludeInactive\` composes \`status: { equals: ACTIVE }\` into the \`UserV2Filter\`.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" excludeInactive />
}`,...(O=G.parameters)==null||(O=O.docs)==null?void 0:O.source}}},K.parameters={...K.parameters,docs:{...(k=K.parameters)==null?void 0:k.docs,source:{originalSource:`{
  name: 'ID-valued',
  parameters: {
    docs: {
      description: {
        story: '\`valuePropName="id"\` — the plain-key value is the local user UUID, which is what \`adminBulkAssignRole\` and friends take. This is the only mode that runs the \`uuid in\` label-resolution query.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" valuePropName="id" />
}`,...(A=K.parameters)==null||(A=A.docs)==null?void 0:A.source}}},q.parameters={...q.parameters,docs:{...(Se=q.parameters)==null?void 0:Se.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Caller-side \`isLoading\`, which spins the trigger the same way the internal debounce and refetch pending states do.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" isLoading isDisabled />
}`,...(j=q.parameters)==null||(j=j.docs)==null?void 0:j.source}}},J.parameters={...J.parameters,docs:{...(M=J.parameters)==null?void 0:M.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'No users match the query — the popup shows the shared empty-state text.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" resolvers={emptyResolvers} defaultOpen />
}`,...(N=J.parameters)==null||(N=N.docs)==null?void 0:N.source}}},Y.parameters={...Y.parameters,docs:{...(P=Y.parameters)==null?void 0:P.docs,source:{originalSource:`{
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
}`,...(F=Y.parameters)==null||(F=F.docs)==null?void 0:F.source}}},X=[`DomainScope`,`ProjectMembers`,`Multiple`,`ExcludeInactive`,`IdValued`,`Loading`,`Empty`,`Error`]})))()}Z();export{H as DomainScope,J as Empty,Y as Error,G as ExcludeInactive,K as IdValued,q as Loading,W as Multiple,U as ProjectMembers,X as __namedExportsOrder,I as default};