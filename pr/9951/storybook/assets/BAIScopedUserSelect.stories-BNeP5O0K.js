import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-DlPsW1c0.js";import{n,t as r}from"./castArray-AZdtGfv6.js";import{n as i,t as a}from"./compact-C9OPbfhP.js";import{m as ee,r as te,t as o}from"./hooks-H9HyfHBM.js";import{n as ne,t as re}from"./find-DWiBvCZH.js";import{n as s,t as c}from"./map-BLzs52H1.js";import{n as ie,t as l}from"./some-h0q6V2XB.js";import{t as u}from"./jsx-runtime-MKhVqBIO.js";import{n as ae,t as d}from"./useBAIi18n-CcFoH3bE.js";import{t as f}from"./compiler-runtime-DU4U6aph.js";import{n as p,t as oe}from"./createLucideIcon-DF5UGKo-.js";import{t as se}from"./react-relay-sHama7hJ.js";import{c as m,v as ce}from"./helper-p-d7z67I.js";import{i as le,n as ue,r as h,t as de}from"./usePaginatedQuery-WC1eOAeR.js";import{n as fe,t as pe}from"./BAIComplexSelect-CddKGB-I.js";import{n as me,t as he}from"./RelayResolver-BnFyFQJn.js";var g,ge;function _e(){return(_e=e((()=>{p(),g=[[`path`,{d:`M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8`,key:`12jkf8`}],[`path`,{d:`m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7`,key:`1ocrg3`}],[`path`,{d:`M19 16v6`,key:`tddt3s`}],[`path`,{d:`M16 19h6`,key:`xwg31i`}]],ge=oe(`mail-plus`,g)})))()}var ve;function _(){return(_=e((()=>{ve=(function(){var e={defaultValue:null,kind:`LocalArgument`,name:`limit`},t={defaultValue:null,kind:`LocalArgument`,name:`scope`},n={defaultValue:null,kind:`LocalArgument`,name:`selectedFilter`},r={defaultValue:null,kind:`LocalArgument`,name:`skipSelected`},i=[{condition:`skipSelected`,kind:`Condition`,passingValue:!1,selections:[{alias:null,args:[{kind:`Variable`,name:`filter`,variableName:`selectedFilter`},{kind:`Variable`,name:`limit`,variableName:`limit`},{kind:`Variable`,name:`scope`,variableName:`scope`}],concreteType:`UserV2Connection`,kind:`LinkedField`,name:`scopedUsersV2`,plural:!1,selections:[{alias:null,args:null,concreteType:`UserV2Edge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`UserV2`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`entityId`,storageKey:null},{alias:null,args:null,concreteType:`UserV2BasicInfo`,kind:`LinkedField`,name:`basicInfo`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`email`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`fullName`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}]}];return{fragment:{argumentDefinitions:[e,t,n,r],kind:`Fragment`,metadata:null,name:`BAIScopedUserSelectValueQuery`,selections:i,type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[t,n,e,r],kind:`Operation`,name:`BAIScopedUserSelectValueQuery`,selections:i},params:{cacheID:`73f803e1b9de2f6f3006e799975668d7`,id:null,metadata:{},name:`BAIScopedUserSelectValueQuery`,operationKind:`query`,text:`query BAIScopedUserSelectValueQuery(
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
`}}})(),ve.hash=`411743b8638ae718f2aaa52604b93e2c`})))()}var ye;function be(){return(be=e((()=>{ye=(function(){var e={defaultValue:null,kind:`LocalArgument`,name:`filter`},t={defaultValue:null,kind:`LocalArgument`,name:`limit`},n={defaultValue:null,kind:`LocalArgument`,name:`offset`},r={defaultValue:null,kind:`LocalArgument`,name:`orderBy`},i={defaultValue:null,kind:`LocalArgument`,name:`scope`},a=[{alias:null,args:[{kind:`Variable`,name:`filter`,variableName:`filter`},{kind:`Variable`,name:`limit`,variableName:`limit`},{kind:`Variable`,name:`offset`,variableName:`offset`},{kind:`Variable`,name:`orderBy`,variableName:`orderBy`},{kind:`Variable`,name:`scope`,variableName:`scope`}],concreteType:`UserV2Connection`,kind:`LinkedField`,name:`scopedUsersV2`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`count`,storageKey:null},{alias:null,args:null,concreteType:`UserV2Edge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`UserV2`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`entityId`,storageKey:null},{alias:null,args:null,concreteType:`UserV2BasicInfo`,kind:`LinkedField`,name:`basicInfo`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`email`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`fullName`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:[e,t,n,r,i],kind:`Fragment`,metadata:null,name:`BAIScopedUserSelectPaginatedQuery`,selections:a,type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[i,n,t,e,r],kind:`Operation`,name:`BAIScopedUserSelectPaginatedQuery`,selections:a},params:{cacheID:`efde6092b86268c770cd00e780dc0fef`,id:null,metadata:{},name:`BAIScopedUserSelectPaginatedQuery`,operationKind:`query`,text:`query BAIScopedUserSelectPaginatedQuery(
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
`}}})(),ye.hash=`9f76fb36f1f0267e95d5c7b6c2bf8a87`})))()}function xe(e){var t;return((t=e.scopedUsersV2)==null?void 0:t.count)??void 0}function Se(e){var t;return a(s((t=e.scopedUsersV2)==null?void 0:t.edges,`node`))}function Ce(e){return e==null?void 0:e.id}function we(e){return e.value}var Te,v,Ee,De,Oe,ke,y;function Ae(){return(Ae=e((()=>{_(),be(),Te=f(),m(),h(),o(),d(),de(),fe(),i(),n(),c(),l(),ne(),_e(),v=t(),Ee=se(),De=u(),Oe=10,ke=/^[^\s@]+@[^\s@]+\.[^\s@]+$/,y=e=>{"use memo";var t;let n=(0,Te.c)(53),i,o,ne,c,l,u,d,f,p;n[0]===e?(i=n[1],o=n[2],ne=n[3],c=n[4],l=n[5],u=n[6],d=n[7],f=n[8],p=n[9]):({scope:c,allowCustomSelect:u,filter:i,excludeInactive:d,valuePropName:f,multiple:p,isLoading:o,ref:ne,...l}=e,n[0]=e,n[1]=i,n[2]=o,n[3]=ne,n[4]=c,n[5]=l,n[6]=u,n[7]=d,n[8]=f,n[9]=p);let oe=u!==void 0&&u,se=d!==void 0&&d,m=f===void 0?`email`:f,h=p!==void 0&&p,{t:de}=ae(),fe;n[10]===Symbol.for(`react.memo_cache_sentinel`)?(fe={valuePropName:`value`,trigger:`onChange`},n[10]=fe):fe=n[10];let[me,he]=ee(l,fe),g;n[11]===Symbol.for(`react.memo_cache_sentinel`)?(g={valuePropName:`open`,trigger:`onOpenChange`,defaultValuePropName:`defaultOpen`},n[11]=g):g=n[11];let[_e,_]=ee(l,g),be=(0,v.useDeferredValue)(_e),[y,Ae]=(0,v.useState)(``),b=le(y),[x,je]=(0,v.useTransition)(),[S,C]=te(),w=(0,v.useDeferredValue)(S),T,E;n[12]===C?(T=n[13],E=n[14]):(T=()=>({refetch:()=>{je(()=>{C()})}}),E=[C,je],n[12]=C,n[13]=T,n[14]=E),(0,v.useImperativeHandle)(ne,T,E);let Me=ce([se?{status:{equals:`ACTIVE`}}:null,i]),D=(0,v.useDeferredValue)(me),O;n[15]===D?O=n[16]:(O=D??[],n[15]=D,n[16]=O);let k=a(r(O)),A=m===`id`&&k.length>0,j=A?`store-or-network`:`store-only`,M;n[17]!==w||n[18]!==j?(M={fetchPolicy:j,fetchKey:w},n[17]=w,n[18]=j,n[19]=M):M=n[19];let N=(0,Ee.useLazyLoadQuery)(ve,{scope:c,selectedFilter:A?ce([{uuid:{in:k}},Me]):null,limit:Math.max(k.length,1),skipSelected:!A},M),P;n[20]===Symbol.for(`react.memo_cache_sentinel`)?(P={limit:Oe},n[20]=P):P=n[20];let F=be?`network-only`:`store-only`,I;n[21]!==w||n[22]!==F?(I={fetchPolicy:F,fetchKey:w},n[21]=w,n[22]=F,n[23]=I):I=n[23];let L;n[24]===Symbol.for(`react.memo_cache_sentinel`)?(L={getTotal:xe,getItem:Se,getId:Ce},n[24]=L):L=n[24];let{paginationData:R,result:Ne,loadNext:z,isLoadingNext:B}=ue(ye,P,{scope:c,filter:ce([Me,b?{email:{iContains:b}}:null]),orderBy:[{field:`EMAIL`,direction:`ASC`}]},I,L),V;n[25]===m?V=n[26]:(V=e=>{var t;if(e)return m===`id`?e.entityId:((t=e.basicInfo)==null?void 0:t.email)??void 0},n[25]=m,n[26]=V);let H=V,U;n[27]===H?U=n[28]:(U=e=>{var t,n;let r=H(e);return r?{value:r,label:(e==null||(t=e.basicInfo)==null?void 0:t.email)??r,description:(e==null||(n=e.basicInfo)==null?void 0:n.fullName)??void 0}:null},n[27]=H,n[28]=U);let W=a(s(R,U)),G=b.trim(),K=oe&&m===`email`&&ke.test(G)&&!ie(W,e=>e.value.toLowerCase()===G.toLowerCase())?{value:G,label:G,description:de(`comp:BAIScopedUserSelect.InviteByEmail`),icon:(0,De.jsx)(ge,{size:`1em`})}:null,q;bb0:{var J;let e;n[29]===H?e=n[30]:(e=e=>{var t;let n=H(e==null?void 0:e.node);return n?[n,e==null||(t=e.node)==null||(t=t.basicInfo)==null?void 0:t.email]:null},n[29]=H,n[30]=e);let t=new Map(a(s((J=N.scopedUsersV2)==null?void 0:J.edges,e))),r=s(k,e=>({label:t.get(e)??e,value:e}));if(h){q=r;break bb0}q=r[0]??null}let Y=q,X=pe,Z;n[31]===de?Z=n[32]:(Z=de(`comp:BAIUserSelect.SelectUser`),n[31]=de,n[32]=Z);let Q=o||!!_e&&!be||me!==D||y!==b||x,Pe=((t=Ne.scopedUsersV2)==null?void 0:t.count)??void 0,Fe=K?[...W,K]:W,$;n[33]!==K||n[34]!==H||n[35]!==h||n[36]!==R||n[37]!==he?($=e=>{let t=a(r(e??[])),n=s(t,we),i=s(t,e=>{let t=re(R,t=>H(t)===e.value);return t?{...e,userId:t.entityId}:K&&e.value===K.value?{...e,isCustom:!0}:e});he(h?n:n[0],h?i:i[0]),h||Ae(``)},n[33]=K,n[34]=H,n[35]=h,n[36]=R,n[37]=he,n[38]=$):$=n[38];let Ie;return n[39]!==X||n[40]!==B||n[41]!==Y||n[42]!==z||n[43]!==h||n[44]!==y||n[45]!==l||n[46]!==_||n[47]!==Z||n[48]!==Q||n[49]!==Pe||n[50]!==Fe||n[51]!==$?(Ie=(0,De.jsx)(X,{placeholder:Z,...l,multiple:h,isLoading:Q,isLoadingNext:B,total:Pe,options:Fe,value:Y,onChange:$,searchValue:y,onSearch:Ae,onOpenChange:_,endReached:z}),n[39]=X,n[40]=B,n[41]=Y,n[42]=z,n[43]=h,n[44]=y,n[45]=l,n[46]=_,n[47]=Z,n[48]=Q,n[49]=Pe,n[50]=Fe,n[51]=$,n[52]=Ie):Ie=n[52],Ie}})))()}var b,x,je,S,C,w,T,E,Me,D,O,k,A,j,M,N,P,F,I,L,R,Ne,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q,Pe;function Fe(){return(Fe=e((()=>{me(),Ae(),b=t(),x=u(),R={title:`Fragments/BAIScopedUserSelect`,component:y,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:"\n**BAIScopedUserSelect** — the user picker for admin and project-admin forms (ADR 0012). Built on `BAIComplexSelect`, paged through `scopedUsersV2`.\n\n- `scope` (required): the `UserScope` input. Admin pages pass the current domain from `useCurrentDomain()`; a project-admin page passes `{ project: [{ value: projectId }] }`.\n- `valuePropName`: `'email'` (default) or `'id'` — which field is the plain-key value. Only `'id'` runs the `uuid in` label-resolution query; with emails the key already is the label.\n- `filter` / `excludeInactive`: composed into a `UserV2Filter` through the schema's `AND` combinator, together with the debounced `email: { iContains }` search.\n- Needs a manager >= 26.9.0, where `scopedUsersV2` exists.\n\nSee `BAIComplexSelect.stories.tsx` for the underlying popup-body component with static options.\n        "}}},argTypes:{value:{control:!1},onChange:{control:!1},filter:{control:!1},scope:{control:!1},multiple:{control:{type:`boolean`}},excludeInactive:{control:{type:`boolean`}},valuePropName:{control:{type:`select`},options:[`email`,`id`]}}},Ne=[{id:`VXNlclYyOjE=`,basicInfo:{email:`admin@example.com`,fullName:`System Administrator`}},{id:`VXNlclYyOjI=`,basicInfo:{email:`alice@example.com`,fullName:`Alice Kim`}},{id:`VXNlclYyOjM=`,basicInfo:{email:`bob@example.com`,fullName:`Bob Lee`}},{id:`VXNlclYyOjQ=`,basicInfo:{email:`carol@example.com`,fullName:`Carol Park`}}],z=e=>({count:e.length,edges:e.map(e=>({node:e}))}),B={Query:()=>({scopedUsersV2:z(Ne)})},V={Query:()=>({scopedUsersV2:z([])})},H={domain:[{value:`5c3b5a9e-0000-4000-8000-0000000000d0`}]},U=({scope:e=H,initialValue:t=null,resolvers:n=B,...r})=>{let[i,a]=(0,b.useState)(t);return(0,x.jsx)(he,{mockResolvers:n,children:(0,x.jsx)(y,{...r,scope:e,value:i,onChange:e=>a(e??null)})})},W={parameters:{docs:{description:{story:"A domain scope, as admin pages build from `useCurrentDomain()`: the users of that domain."}}},render:e=>(0,x.jsx)(U,{...e,label:`User`,defaultOpen:!0})},G={parameters:{docs:{description:{story:`A project scope, as the project-admin session page passes: the members of that project.`}}},render:e=>(0,x.jsx)(U,{...e,label:`Owner`,scope:{project:[{value:`5c3b5a9e-0000-4000-8000-000000000001`}]},defaultOpen:!0})},K={name:`Multiple Select`,parameters:{docs:{description:{story:`Multi-selection: the value is an array of keys and the trigger lists the selected emails.`}}},render:e=>(0,x.jsx)(U,{...e,label:`Users`,multiple:!0,initialValue:[`admin@example.com`]})},q={name:`Custom e-mail entry`,parameters:{docs:{description:{story:"`allowCustomSelect` — an e-mail address typed in the search box that no listed user matches is offered as one more option; picking it makes the value that address and `onChange` marks it `isCustom`."}}},render:e=>(0,x.jsx)(U,{...e,label:`User`,allowCustomSelect:!0,defaultOpen:!0})},J={name:`Exclude Inactive Users`,parameters:{docs:{description:{story:"`excludeInactive` composes `status: { equals: ACTIVE }` into the `UserV2Filter`."}}},render:e=>(0,x.jsx)(U,{...e,label:`User`,excludeInactive:!0})},Y={name:`ID-valued`,parameters:{docs:{description:{story:'`valuePropName="id"` — the plain-key value is the local user UUID, which is what `adminBulkAssignRole` and friends take. This is the only mode that runs the `uuid in` label-resolution query.'}}},render:e=>(0,x.jsx)(U,{...e,label:`User`,valuePropName:`id`})},X={parameters:{docs:{description:{story:"Caller-side `isLoading`, which spins the trigger the same way the internal debounce and refetch pending states do."}}},render:e=>(0,x.jsx)(U,{...e,label:`User`,isLoading:!0,isDisabled:!0})},Z={parameters:{docs:{description:{story:`No users match the query — the popup shows the shared empty-state text.`}}},render:e=>(0,x.jsx)(U,{...e,label:`User`,resolvers:V,defaultOpen:!0})},Q={parameters:{docs:{description:{story:"The error status a form item sets when its `required` rule fails."}}},render:e=>(0,x.jsx)(U,{...e,label:`User`,status:{type:`error`,message:`Please select users.`}})},W.parameters={...W.parameters,docs:{...(je=W.parameters)==null?void 0:je.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'A domain scope, as admin pages build from \`useCurrentDomain()\`: the users of that domain.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" defaultOpen />
}`,...(S=W.parameters)==null||(S=S.docs)==null?void 0:S.source}}},G.parameters={...G.parameters,docs:{...(C=G.parameters)==null?void 0:C.docs,source:{originalSource:`{
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
}`,...(w=G.parameters)==null||(w=w.docs)==null?void 0:w.source}}},K.parameters={...K.parameters,docs:{...(T=K.parameters)==null?void 0:T.docs,source:{originalSource:`{
  name: 'Multiple Select',
  parameters: {
    docs: {
      description: {
        story: 'Multi-selection: the value is an array of keys and the trigger lists the selected emails.'
      }
    }
  },
  render: args => <Sandbox {...args} label="Users" multiple initialValue={['admin@example.com']} />
}`,...(E=K.parameters)==null||(E=E.docs)==null?void 0:E.source}}},q.parameters={...q.parameters,docs:{...(Me=q.parameters)==null?void 0:Me.docs,source:{originalSource:`{
  name: 'Custom e-mail entry',
  parameters: {
    docs: {
      description: {
        story: '\`allowCustomSelect\` — an e-mail address typed in the search box that no listed user matches is offered as one more option; picking it makes the value that address and \`onChange\` marks it \`isCustom\`.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" allowCustomSelect defaultOpen />
}`,...(D=q.parameters)==null||(D=D.docs)==null?void 0:D.source}}},J.parameters={...J.parameters,docs:{...(O=J.parameters)==null?void 0:O.docs,source:{originalSource:`{
  name: 'Exclude Inactive Users',
  parameters: {
    docs: {
      description: {
        story: '\`excludeInactive\` composes \`status: { equals: ACTIVE }\` into the \`UserV2Filter\`.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" excludeInactive />
}`,...(k=J.parameters)==null||(k=k.docs)==null?void 0:k.source}}},Y.parameters={...Y.parameters,docs:{...(A=Y.parameters)==null?void 0:A.docs,source:{originalSource:`{
  name: 'ID-valued',
  parameters: {
    docs: {
      description: {
        story: '\`valuePropName="id"\` — the plain-key value is the local user UUID, which is what \`adminBulkAssignRole\` and friends take. This is the only mode that runs the \`uuid in\` label-resolution query.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" valuePropName="id" />
}`,...(j=Y.parameters)==null||(j=j.docs)==null?void 0:j.source}}},X.parameters={...X.parameters,docs:{...(M=X.parameters)==null?void 0:M.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Caller-side \`isLoading\`, which spins the trigger the same way the internal debounce and refetch pending states do.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" isLoading isDisabled />
}`,...(N=X.parameters)==null||(N=N.docs)==null?void 0:N.source}}},Z.parameters={...Z.parameters,docs:{...(P=Z.parameters)==null?void 0:P.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'No users match the query — the popup shows the shared empty-state text.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" resolvers={emptyResolvers} defaultOpen />
}`,...(F=Z.parameters)==null||(F=F.docs)==null?void 0:F.source}}},Q.parameters={...Q.parameters,docs:{...(I=Q.parameters)==null?void 0:I.docs,source:{originalSource:`{
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
}`,...(L=Q.parameters)==null||(L=L.docs)==null?void 0:L.source}}},Pe=[`DomainScope`,`ProjectMembers`,`Multiple`,`CustomSelect`,`ExcludeInactive`,`IdValued`,`Loading`,`Empty`,`Error`]})))()}Fe();export{q as CustomSelect,W as DomainScope,Z as Empty,Q as Error,J as ExcludeInactive,Y as IdValued,X as Loading,K as Multiple,G as ProjectMembers,Pe as __namedExportsOrder,R as default};