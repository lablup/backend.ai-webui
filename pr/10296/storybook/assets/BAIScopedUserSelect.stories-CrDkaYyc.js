import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-DlPsW1c0.js";import{n,t as r}from"./castArray-AZdtGfv6.js";import{n as i,t as a}from"./compact-C9OPbfhP.js";import{m as ee,r as te,t as o}from"./hooks-CqTIG_8a.js";import{n as s,t as ne}from"./find-DAho-s_l.js";import{n as c,t as l}from"./map-BLzs52H1.js";import{n as re,t as u}from"./some-h0q6V2XB.js";import{t as d}from"./jsx-runtime-MKhVqBIO.js";import{n as ie,t as f}from"./useBAIi18n-DrV1la1c.js";import{t as p}from"./compiler-runtime-DU4U6aph.js";import{n as m,t as ae}from"./createLucideIcon-DF5UGKo-.js";import{t as oe}from"./react-relay-sHama7hJ.js";import{c as h,v as se}from"./helper-CCWfHaFs.js";import{i as ce,n as le,r as g,t as _}from"./usePaginatedQuery-D6T9W92b.js";import{n as v,t as ue}from"./BAIComplexSelect-B8uwYHrr.js";import{n as de,t as fe}from"./RelayResolver-BnFyFQJn.js";var y,pe;function me(){return(me=e((()=>{m(),y=[[`path`,{d:`M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8`,key:`12jkf8`}],[`path`,{d:`m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7`,key:`1ocrg3`}],[`path`,{d:`M19 16v6`,key:`tddt3s`}],[`path`,{d:`M16 19h6`,key:`xwg31i`}]],pe=ae(`mail-plus`,y)})))()}var he;function b(){return(b=e((()=>{he=(function(){var e={defaultValue:null,kind:`LocalArgument`,name:`limit`},t={defaultValue:null,kind:`LocalArgument`,name:`scope`},n={defaultValue:null,kind:`LocalArgument`,name:`selectedFilter`},r={defaultValue:null,kind:`LocalArgument`,name:`skipSelected`},i=[{condition:`skipSelected`,kind:`Condition`,passingValue:!1,selections:[{alias:null,args:[{kind:`Variable`,name:`filter`,variableName:`selectedFilter`},{kind:`Variable`,name:`limit`,variableName:`limit`},{kind:`Variable`,name:`scope`,variableName:`scope`}],concreteType:`UserV2Connection`,kind:`LinkedField`,name:`scopedUsersV2`,plural:!1,selections:[{alias:null,args:null,concreteType:`UserV2Edge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`UserV2`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`entityId`,storageKey:null},{alias:null,args:null,concreteType:`UserV2BasicInfo`,kind:`LinkedField`,name:`basicInfo`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`email`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`fullName`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}]}];return{fragment:{argumentDefinitions:[e,t,n,r],kind:`Fragment`,metadata:null,name:`BAIScopedUserSelectValueQuery`,selections:i,type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[t,n,e,r],kind:`Operation`,name:`BAIScopedUserSelectValueQuery`,selections:i},params:{cacheID:`73f803e1b9de2f6f3006e799975668d7`,id:null,metadata:{},name:`BAIScopedUserSelectValueQuery`,operationKind:`query`,text:`query BAIScopedUserSelectValueQuery(
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
`}}})(),he.hash=`411743b8638ae718f2aaa52604b93e2c`})))()}var ge;function _e(){return(_e=e((()=>{ge=(function(){var e={defaultValue:null,kind:`LocalArgument`,name:`filter`},t={defaultValue:null,kind:`LocalArgument`,name:`limit`},n={defaultValue:null,kind:`LocalArgument`,name:`offset`},r={defaultValue:null,kind:`LocalArgument`,name:`orderBy`},i={defaultValue:null,kind:`LocalArgument`,name:`scope`},a=[{alias:null,args:[{kind:`Variable`,name:`filter`,variableName:`filter`},{kind:`Variable`,name:`limit`,variableName:`limit`},{kind:`Variable`,name:`offset`,variableName:`offset`},{kind:`Variable`,name:`orderBy`,variableName:`orderBy`},{kind:`Variable`,name:`scope`,variableName:`scope`}],concreteType:`UserV2Connection`,kind:`LinkedField`,name:`scopedUsersV2`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`count`,storageKey:null},{alias:null,args:null,concreteType:`UserV2Edge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`UserV2`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`entityId`,storageKey:null},{alias:null,args:null,concreteType:`UserV2BasicInfo`,kind:`LinkedField`,name:`basicInfo`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`email`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`fullName`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:[e,t,n,r,i],kind:`Fragment`,metadata:null,name:`BAIScopedUserSelectPaginatedQuery`,selections:a,type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[i,n,t,e,r],kind:`Operation`,name:`BAIScopedUserSelectPaginatedQuery`,selections:a},params:{cacheID:`efde6092b86268c770cd00e780dc0fef`,id:null,metadata:{},name:`BAIScopedUserSelectPaginatedQuery`,operationKind:`query`,text:`query BAIScopedUserSelectPaginatedQuery(
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
`}}})(),ge.hash=`9f76fb36f1f0267e95d5c7b6c2bf8a87`})))()}function ve(e){var t;return((t=e.scopedUsersV2)==null?void 0:t.count)??void 0}function ye(e){var t;return a(c((t=e.scopedUsersV2)==null?void 0:t.edges,`node`))}function be(e){return e==null?void 0:e.id}function xe(e){return e.value}var Se,x,Ce,we,Te,Ee,S;function De(){return(De=e((()=>{b(),_e(),Se=p(),h(),g(),o(),f(),_(),v(),i(),n(),l(),u(),s(),me(),x=t(),Ce=oe(),we=d(),Te=10,Ee=/^[^\s@]+@[^\s@]+\.[^\s@]+$/,S=e=>{"use memo";var t;let n=(0,Se.c)(53),i,o,s,l,u,d,f,p,m;n[0]===e?(i=n[1],o=n[2],s=n[3],l=n[4],u=n[5],d=n[6],f=n[7],p=n[8],m=n[9]):({scope:l,allowCustomSelect:d,filter:i,excludeInactive:f,valuePropName:p,multiple:m,isLoading:o,ref:s,...u}=e,n[0]=e,n[1]=i,n[2]=o,n[3]=s,n[4]=l,n[5]=u,n[6]=d,n[7]=f,n[8]=p,n[9]=m);let ae=d!==void 0&&d,oe=f!==void 0&&f,h=p===void 0?`email`:p,g=m!==void 0&&m,{t:_}=ie(),v;n[10]===Symbol.for(`react.memo_cache_sentinel`)?(v={valuePropName:`value`,trigger:`onChange`},n[10]=v):v=n[10];let[de,fe]=ee(u,v),y;n[11]===Symbol.for(`react.memo_cache_sentinel`)?(y={valuePropName:`open`,trigger:`onOpenChange`,defaultValuePropName:`defaultOpen`},n[11]=y):y=n[11];let[me,b]=ee(u,y),_e=(0,x.useDeferredValue)(me),[S,De]=(0,x.useState)(``),C=ce(S),[w,Oe]=(0,x.useTransition)(),[ke,T]=te(),E=(0,x.useDeferredValue)(ke),D,O;n[12]===T?(D=n[13],O=n[14]):(D=()=>({refetch:()=>{Oe(()=>{T()})}}),O=[T,Oe],n[12]=T,n[13]=D,n[14]=O),(0,x.useImperativeHandle)(s,D,O);let Ae=se([oe?{status:{equals:`ACTIVE`}}:null,i]),k=(0,x.useDeferredValue)(de),A;n[15]===k?A=n[16]:(A=k??[],n[15]=k,n[16]=A);let j=a(r(A)),je=h===`id`&&j.length>0,M=je?`store-or-network`:`store-only`,N;n[17]!==E||n[18]!==M?(N={fetchPolicy:M,fetchKey:E},n[17]=E,n[18]=M,n[19]=N):N=n[19];let Me=(0,Ce.useLazyLoadQuery)(he,{scope:l,selectedFilter:je?se([{uuid:{in:j}},Ae]):null,limit:Math.max(j.length,1),skipSelected:!je},N),P;n[20]===Symbol.for(`react.memo_cache_sentinel`)?(P={limit:Te},n[20]=P):P=n[20];let F=_e?`network-only`:`store-only`,I;n[21]!==E||n[22]!==F?(I={fetchPolicy:F,fetchKey:E},n[21]=E,n[22]=F,n[23]=I):I=n[23];let L;n[24]===Symbol.for(`react.memo_cache_sentinel`)?(L={getTotal:ve,getItem:ye,getId:be},n[24]=L):L=n[24];let{paginationData:R,result:Ne,loadNext:z,isLoadingNext:B}=le(ge,P,{scope:l,filter:se([Ae,C?{email:{iContains:C}}:null]),orderBy:[{field:`EMAIL`,direction:`ASC`}]},I,L),V;n[25]===h?V=n[26]:(V=e=>{var t;if(e)return h===`id`?e.entityId:((t=e.basicInfo)==null?void 0:t.email)??void 0},n[25]=h,n[26]=V);let H=V,U;n[27]===H?U=n[28]:(U=e=>{var t,n;let r=H(e);return r?{value:r,label:(e==null||(t=e.basicInfo)==null?void 0:t.email)??r,description:(e==null||(n=e.basicInfo)==null?void 0:n.fullName)??void 0}:null},n[27]=H,n[28]=U);let W=a(c(R,U)),G=C.trim(),K=ae&&h===`email`&&Ee.test(G)&&!re(W,e=>e.value.toLowerCase()===G.toLowerCase())?{value:G,label:G,description:_(`comp:BAIScopedUserSelect.InviteByEmail`),icon:(0,we.jsx)(pe,{size:`1em`})}:null,q;bb0:{var J;let e;n[29]===H?e=n[30]:(e=e=>{var t;let n=H(e==null?void 0:e.node);return n?[n,e==null||(t=e.node)==null||(t=t.basicInfo)==null?void 0:t.email]:null},n[29]=H,n[30]=e);let t=new Map(a(c((J=Me.scopedUsersV2)==null?void 0:J.edges,e))),r=c(j,e=>({label:t.get(e)??e,value:e}));if(g){q=r;break bb0}q=r[0]??null}let Y=q,X=ue,Z;n[31]===_?Z=n[32]:(Z=_(`comp:BAIUserSelect.SelectUser`),n[31]=_,n[32]=Z);let Q=o||!!me&&!_e||de!==k||S!==C||w,Pe=((t=Ne.scopedUsersV2)==null?void 0:t.count)??void 0,Fe=K?[...W,K]:W,$;n[33]!==K||n[34]!==H||n[35]!==g||n[36]!==R||n[37]!==fe?($=e=>{let t=a(r(e??[])),n=c(t,xe),i=c(t,e=>{let t=ne(R,t=>H(t)===e.value);return t?{...e,userId:t.entityId}:K&&e.value===K.value?{...e,isCustom:!0}:e});fe(g?n:n[0],g?i:i[0])},n[33]=K,n[34]=H,n[35]=g,n[36]=R,n[37]=fe,n[38]=$):$=n[38];let Ie;return n[39]!==X||n[40]!==B||n[41]!==Y||n[42]!==z||n[43]!==g||n[44]!==S||n[45]!==u||n[46]!==b||n[47]!==Z||n[48]!==Q||n[49]!==Pe||n[50]!==Fe||n[51]!==$?(Ie=(0,we.jsx)(X,{placeholder:Z,...u,multiple:g,isLoading:Q,isLoadingNext:B,total:Pe,options:Fe,value:Y,onChange:$,searchValue:S,onSearch:De,onOpenChange:b,endReached:z}),n[39]=X,n[40]=B,n[41]=Y,n[42]=z,n[43]=g,n[44]=S,n[45]=u,n[46]=b,n[47]=Z,n[48]=Q,n[49]=Pe,n[50]=Fe,n[51]=$,n[52]=Ie):Ie=n[52],Ie}})))()}var C,w,Oe,ke,T,E,D,O,Ae,k,A,j,je,M,N,Me,P,F,I,L,R,Ne,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q,Pe;function Fe(){return(Fe=e((()=>{de(),De(),C=t(),w=d(),R={title:`Fragments/BAIScopedUserSelect`,component:S,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:"\n**BAIScopedUserSelect** — the user picker for admin and project-admin forms (ADR 0012). Built on `BAIComplexSelect`, paged through `scopedUsersV2`.\n\n- `scope` (required): the `UserScope` input. Admin pages pass the current domain from `useCurrentDomain()`; a project-admin page passes `{ project: [{ value: projectId }] }`.\n- `valuePropName`: `'email'` (default) or `'id'` — which field is the plain-key value. Only `'id'` runs the `uuid in` label-resolution query; with emails the key already is the label.\n- `filter` / `excludeInactive`: composed into a `UserV2Filter` through the schema's `AND` combinator, together with the debounced `email: { iContains }` search.\n- Needs a manager >= 26.9.0, where `scopedUsersV2` exists.\n\nSee `BAIComplexSelect.stories.tsx` for the underlying popup-body component with static options.\n        "}}},argTypes:{value:{control:!1},onChange:{control:!1},filter:{control:!1},scope:{control:!1},multiple:{control:{type:`boolean`}},excludeInactive:{control:{type:`boolean`}},valuePropName:{control:{type:`select`},options:[`email`,`id`]}}},Ne=[{id:`VXNlclYyOjE=`,basicInfo:{email:`admin@example.com`,fullName:`System Administrator`}},{id:`VXNlclYyOjI=`,basicInfo:{email:`alice@example.com`,fullName:`Alice Kim`}},{id:`VXNlclYyOjM=`,basicInfo:{email:`bob@example.com`,fullName:`Bob Lee`}},{id:`VXNlclYyOjQ=`,basicInfo:{email:`carol@example.com`,fullName:`Carol Park`}}],z=e=>({count:e.length,edges:e.map(e=>({node:e}))}),B={Query:()=>({scopedUsersV2:z(Ne)})},V={Query:()=>({scopedUsersV2:z([])})},H={domain:[{value:`5c3b5a9e-0000-4000-8000-0000000000d0`}]},U=({scope:e=H,initialValue:t=null,resolvers:n=B,...r})=>{let[i,a]=(0,C.useState)(t);return(0,w.jsx)(fe,{mockResolvers:n,children:(0,w.jsx)(S,{...r,scope:e,value:i,onChange:e=>a(e??null)})})},W={parameters:{docs:{description:{story:"A domain scope, as admin pages build from `useCurrentDomain()`: the users of that domain."}}},render:e=>(0,w.jsx)(U,{...e,label:`User`,defaultOpen:!0})},G={parameters:{docs:{description:{story:`A project scope, as the project-admin session page passes: the members of that project.`}}},render:e=>(0,w.jsx)(U,{...e,label:`Owner`,scope:{project:[{value:`5c3b5a9e-0000-4000-8000-000000000001`}]},defaultOpen:!0})},K={name:`Multiple Select`,parameters:{docs:{description:{story:`Multi-selection: the value is an array of keys and the trigger lists the selected emails.`}}},render:e=>(0,w.jsx)(U,{...e,label:`Users`,multiple:!0,initialValue:[`admin@example.com`]})},q={name:`Custom e-mail entry`,parameters:{docs:{description:{story:"`allowCustomSelect` — an e-mail address typed in the search box that no listed user matches is offered as one more option; picking it makes the value that address and `onChange` marks it `isCustom`."}}},render:e=>(0,w.jsx)(U,{...e,label:`User`,allowCustomSelect:!0,defaultOpen:!0})},J={name:`Exclude Inactive Users`,parameters:{docs:{description:{story:"`excludeInactive` composes `status: { equals: ACTIVE }` into the `UserV2Filter`."}}},render:e=>(0,w.jsx)(U,{...e,label:`User`,excludeInactive:!0})},Y={name:`ID-valued`,parameters:{docs:{description:{story:'`valuePropName="id"` — the plain-key value is the local user UUID, which is what `adminBulkAssignRole` and friends take. This is the only mode that runs the `uuid in` label-resolution query.'}}},render:e=>(0,w.jsx)(U,{...e,label:`User`,valuePropName:`id`})},X={parameters:{docs:{description:{story:"Caller-side `isLoading`, which spins the trigger the same way the internal debounce and refetch pending states do."}}},render:e=>(0,w.jsx)(U,{...e,label:`User`,isLoading:!0,isDisabled:!0})},Z={parameters:{docs:{description:{story:`No users match the query — the popup shows the shared empty-state text.`}}},render:e=>(0,w.jsx)(U,{...e,label:`User`,resolvers:V,defaultOpen:!0})},Q={parameters:{docs:{description:{story:"The error status a form item sets when its `required` rule fails."}}},render:e=>(0,w.jsx)(U,{...e,label:`User`,status:{type:`error`,message:`Please select users.`}})},W.parameters={...W.parameters,docs:{...(Oe=W.parameters)==null?void 0:Oe.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'A domain scope, as admin pages build from \`useCurrentDomain()\`: the users of that domain.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" defaultOpen />
}`,...(ke=W.parameters)==null||(ke=ke.docs)==null?void 0:ke.source}}},G.parameters={...G.parameters,docs:{...(T=G.parameters)==null?void 0:T.docs,source:{originalSource:`{
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
}`,...(E=G.parameters)==null||(E=E.docs)==null?void 0:E.source}}},K.parameters={...K.parameters,docs:{...(D=K.parameters)==null?void 0:D.docs,source:{originalSource:`{
  name: 'Multiple Select',
  parameters: {
    docs: {
      description: {
        story: 'Multi-selection: the value is an array of keys and the trigger lists the selected emails.'
      }
    }
  },
  render: args => <Sandbox {...args} label="Users" multiple initialValue={['admin@example.com']} />
}`,...(O=K.parameters)==null||(O=O.docs)==null?void 0:O.source}}},q.parameters={...q.parameters,docs:{...(Ae=q.parameters)==null?void 0:Ae.docs,source:{originalSource:`{
  name: 'Custom e-mail entry',
  parameters: {
    docs: {
      description: {
        story: '\`allowCustomSelect\` — an e-mail address typed in the search box that no listed user matches is offered as one more option; picking it makes the value that address and \`onChange\` marks it \`isCustom\`.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" allowCustomSelect defaultOpen />
}`,...(k=q.parameters)==null||(k=k.docs)==null?void 0:k.source}}},J.parameters={...J.parameters,docs:{...(A=J.parameters)==null?void 0:A.docs,source:{originalSource:`{
  name: 'Exclude Inactive Users',
  parameters: {
    docs: {
      description: {
        story: '\`excludeInactive\` composes \`status: { equals: ACTIVE }\` into the \`UserV2Filter\`.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" excludeInactive />
}`,...(j=J.parameters)==null||(j=j.docs)==null?void 0:j.source}}},Y.parameters={...Y.parameters,docs:{...(je=Y.parameters)==null?void 0:je.docs,source:{originalSource:`{
  name: 'ID-valued',
  parameters: {
    docs: {
      description: {
        story: '\`valuePropName="id"\` — the plain-key value is the local user UUID, which is what \`adminBulkAssignRole\` and friends take. This is the only mode that runs the \`uuid in\` label-resolution query.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" valuePropName="id" />
}`,...(M=Y.parameters)==null||(M=M.docs)==null?void 0:M.source}}},X.parameters={...X.parameters,docs:{...(N=X.parameters)==null?void 0:N.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Caller-side \`isLoading\`, which spins the trigger the same way the internal debounce and refetch pending states do.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" isLoading isDisabled />
}`,...(Me=X.parameters)==null||(Me=Me.docs)==null?void 0:Me.source}}},Z.parameters={...Z.parameters,docs:{...(P=Z.parameters)==null?void 0:P.docs,source:{originalSource:`{
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