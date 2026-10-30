import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-DlPsW1c0.js";import{n,t as r}from"./castArray-AZdtGfv6.js";import{n as i,t as a}from"./compact-C9OPbfhP.js";import{m as ee,r as te,t as o}from"./hooks-CqTIG_8a.js";import{n as s,t as c}from"./map-BLzs52H1.js";import{t as l}from"./jsx-runtime-MKhVqBIO.js";import{n as ne,t as u}from"./useBAIi18n-L1leLHm3.js";import{t as d}from"./compiler-runtime-DU4U6aph.js";import{t as f}from"./react-relay-sHama7hJ.js";import{c as re,v as ie}from"./helper-p-d7z67I.js";import{i as ae,n as oe,r as p,t as m}from"./usePaginatedQuery-VwEea2x7.js";import{n as h,t as se}from"./BAIComplexSelect-GGIJ1k_g.js";import{n as g,t as ce}from"./RelayResolver-BnFyFQJn.js";var le;function _(){return(_=e((()=>{le=(function(){var e={defaultValue:null,kind:`LocalArgument`,name:`limit`},t={defaultValue:null,kind:`LocalArgument`,name:`selectedFilter`},n={defaultValue:null,kind:`LocalArgument`,name:`skipSelected`},r=[{condition:`skipSelected`,kind:`Condition`,passingValue:!1,selections:[{alias:null,args:[{kind:`Variable`,name:`filter`,variableName:`selectedFilter`},{kind:`Variable`,name:`limit`,variableName:`limit`}],concreteType:`UserV2Connection`,kind:`LinkedField`,name:`adminUsersV2`,plural:!1,selections:[{alias:null,args:null,concreteType:`UserV2Edge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`UserV2`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`entityId`,storageKey:null},{alias:null,args:null,concreteType:`UserV2BasicInfo`,kind:`LinkedField`,name:`basicInfo`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`email`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}]}];return{fragment:{argumentDefinitions:[e,t,n],kind:`Fragment`,metadata:null,name:`BAIAdminUserV2SelectValueQuery`,selections:r,type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[t,e,n],kind:`Operation`,name:`BAIAdminUserV2SelectValueQuery`,selections:r},params:{cacheID:`61cb5dc45fcae42e7aad0e471b20a661`,id:null,metadata:{},name:`BAIAdminUserV2SelectValueQuery`,operationKind:`query`,text:`query BAIAdminUserV2SelectValueQuery(
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
`}}})(),le.hash=`d22655746aecaf91c90c662fb52bffde`})))()}var ue;function v(){return(v=e((()=>{ue=(function(){var e={defaultValue:null,kind:`LocalArgument`,name:`filter`},t={defaultValue:null,kind:`LocalArgument`,name:`limit`},n={defaultValue:null,kind:`LocalArgument`,name:`offset`},r={defaultValue:null,kind:`LocalArgument`,name:`orderBy`},i=[{alias:null,args:[{kind:`Variable`,name:`filter`,variableName:`filter`},{kind:`Variable`,name:`limit`,variableName:`limit`},{kind:`Variable`,name:`offset`,variableName:`offset`},{kind:`Variable`,name:`orderBy`,variableName:`orderBy`}],concreteType:`UserV2Connection`,kind:`LinkedField`,name:`adminUsersV2`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`count`,storageKey:null},{alias:null,args:null,concreteType:`UserV2Edge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`UserV2`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`entityId`,storageKey:null},{alias:null,args:null,concreteType:`UserV2BasicInfo`,kind:`LinkedField`,name:`basicInfo`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`username`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`email`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`fullName`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:[e,t,n,r],kind:`Fragment`,metadata:null,name:`BAIAdminUserV2SelectPaginatedQuery`,selections:i,type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[n,t,e,r],kind:`Operation`,name:`BAIAdminUserV2SelectPaginatedQuery`,selections:i},params:{cacheID:`d964e6db69be3ea4621776141153a22f`,id:null,metadata:{},name:`BAIAdminUserV2SelectPaginatedQuery`,operationKind:`query`,text:`query BAIAdminUserV2SelectPaginatedQuery(
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
`}}})(),ue.hash=`f75c9575eef21ebcd16c8f12a9b15dbe`})))()}function de(e){var t;return((t=e.adminUsersV2)==null?void 0:t.count)??void 0}function fe(e){return e==null?void 0:e.node}function pe(e){var t;return(t=e.adminUsersV2)==null||(t=t.edges)==null?void 0:t.map(fe)}function me(e){return e==null?void 0:e.id}function he(e){return e.value}var ge,y,_e,ve,b;function x(){return(x=e((()=>{_(),v(),ge=d(),re(),p(),o(),u(),m(),h(),i(),n(),c(),y=t(),_e=f(),ve=l(),b=e=>{"use memo";var t;let n=(0,ge.c)(50),i,o,c,l,u,d,f;n[0]===e?(i=n[1],o=n[2],c=n[3],l=n[4],u=n[5],d=n[6],f=n[7]):({filter:i,excludeInactive:u,valuePropName:d,multiple:f,isLoading:o,ref:c,...l}=e,n[0]=e,n[1]=i,n[2]=o,n[3]=c,n[4]=l,n[5]=u,n[6]=d,n[7]=f);let re=u!==void 0&&u,p=d===void 0?`email`:d,m=f!==void 0&&f,{t:h}=ne(),g;n[8]===Symbol.for(`react.memo_cache_sentinel`)?(g={valuePropName:`value`,trigger:`onChange`},n[8]=g):g=n[8];let[ce,_]=ee(l,g),v;n[9]===Symbol.for(`react.memo_cache_sentinel`)?(v={valuePropName:`open`,trigger:`onOpenChange`,defaultValuePropName:`defaultOpen`},n[9]=v):v=n[9];let[fe,b]=ee(l,v),x=(0,y.useDeferredValue)(fe),[S,C]=(0,y.useState)(``),w=ae(S),[T,E]=(0,y.useTransition)(),[D,O]=te(),k=(0,y.useDeferredValue)(D),A=ie([re?{status:{equals:`ACTIVE`}}:null,i]),j=(0,y.useDeferredValue)(ce),M;n[10]===j?M=n[11]:(M=j??[],n[10]=j,n[11]=M);let N=a(r(M)),P=p===`id`&&N.length>0,F=P?`store-or-network`:`store-only`,I;n[12]!==k||n[13]!==F?(I={fetchPolicy:F,fetchKey:k},n[12]=k,n[13]=F,n[14]=I):I=n[14];let{adminUsersV2:L}=(0,_e.useLazyLoadQuery)(le,{selectedFilter:P?ie([{uuid:{in:N}},A]):null,limit:Math.max(N.length,1),skipSelected:!P},I),R;n[15]===Symbol.for(`react.memo_cache_sentinel`)?(R={limit:10},n[15]=R):R=n[15];let z=x?`network-only`:`store-only`,B;n[16]!==k||n[17]!==z?(B={fetchPolicy:z,fetchKey:k},n[16]=k,n[17]=z,n[18]=B):B=n[18];let V;n[19]===Symbol.for(`react.memo_cache_sentinel`)?(V={getTotal:de,getItem:pe,getId:me},n[19]=V):V=n[19];let{paginationData:H,result:U,loadNext:W,isLoadingNext:G}=oe(ue,R,{filter:ie([A,w?{email:{iContains:w}}:null]),orderBy:[{field:`EMAIL`,direction:`ASC`}]},B,V),K,q;n[20]===O?(K=n[21],q=n[22]):(K=()=>({refetch:()=>{E(()=>{O()})}}),q=[O,E],n[20]=O,n[21]=K,n[22]=q),(0,y.useImperativeHandle)(c,K,q);let J;n[23]===p?J=n[24]:(J=e=>{var t;if(e)return p===`id`?e.entityId:((t=e.basicInfo)==null?void 0:t.email)??void 0},n[23]=p,n[24]=J);let Y=J,X;if(n[25]!==Y||n[26]!==H){let e;n[28]===Y?e=n[29]:(e=e=>{var t,n;let r=Y(e);return r?{value:r,label:(e==null||(t=e.basicInfo)==null?void 0:t.email)??r,description:(e==null||(n=e.basicInfo)==null?void 0:n.fullName)??void 0}:null},n[28]=Y,n[29]=e),X=a(s(H,e)),n[25]=Y,n[26]=H,n[27]=X}else X=n[27];let Z=X,ye;bb0:{let e;n[30]===Y?e=n[31]:(e=e=>{var t;let n=Y(e==null?void 0:e.node);return n?[n,e==null||(t=e.node)==null||(t=t.basicInfo)==null?void 0:t.email]:null},n[30]=Y,n[31]=e);let t=new Map(a(s(L==null?void 0:L.edges,e))),r=s(N,e=>({label:t.get(e)??e,value:e}));if(m){ye=r;break bb0}ye=r[0]??null}let be=ye,Q;n[32]===h?Q=n[33]:(Q=h(`comp:BAIUserSelect.SelectUser`),n[32]=h,n[33]=Q);let xe=o||ce!==j||fe!==x||S!==w||T,Se=((t=U.adminUsersV2)==null?void 0:t.count)??void 0,$;n[34]!==m||n[35]!==_?($=e=>{let t=a(r(e??[])),n=s(t,he);_(m?n:n[0],m?t:t[0])},n[34]=m,n[35]=_,n[36]=$):$=n[36];let Ce;return n[37]!==G||n[38]!==be||n[39]!==W||n[40]!==m||n[41]!==Z||n[42]!==S||n[43]!==l||n[44]!==b||n[45]!==Q||n[46]!==xe||n[47]!==Se||n[48]!==$?(Ce=(0,ve.jsx)(se,{placeholder:Q,...l,multiple:m,isLoading:xe,isLoadingNext:G,total:Se,options:Z,value:be,onChange:$,searchValue:S,onSearch:C,onOpenChange:b,endReached:W}),n[37]=G,n[38]=be,n[39]=W,n[40]=m,n[41]=Z,n[42]=S,n[43]=l,n[44]=b,n[45]=Q,n[46]=xe,n[47]=Se,n[48]=$,n[49]=Ce):Ce=n[49],Ce}})))()}var S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X;function Z(){return(Z=e((()=>{g(),x(),S=t(),C=l(),R={title:`Fragments/BAIAdminUserV2Select`,component:b,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:"\n**BAIAdminUserV2Select** — superadmin-only user picker over `adminUsersV2` (managers >= 26.2.0). Built on `BAIComplexSelect`.\n\n- `valuePropName`: `'email'` (default) or `'id'` — which field is the plain-key value. Only `'id'` runs the `uuid in` label-resolution query; with emails the key already is the label.\n- `filter` / `excludeInactive`: composed into a `UserV2Filter` through the schema's `AND` combinator, together with the debounced `email: { iContains }` search.\n- Pagination is offset mode (`limit`/`offset`) — the V2 connections reject a mix with `first`/`after` at runtime.\n\nSee `BAIComplexSelect.stories.tsx` for the underlying popup-body component with static options.\n        "}}},argTypes:{value:{control:!1},onChange:{control:!1},filter:{control:!1},multiple:{control:{type:`boolean`}},excludeInactive:{control:{type:`boolean`}},valuePropName:{control:{type:`select`},options:[`email`,`id`]}}},z=[{id:`VXNlclYyOjE=`,basicInfo:{username:`admin`,email:`admin@example.com`,fullName:`System Administrator`}},{id:`VXNlclYyOjI=`,basicInfo:{username:`alice`,email:`alice@example.com`,fullName:`Alice Kim`}},{id:`VXNlclYyOjM=`,basicInfo:{username:`bob`,email:`bob@example.com`,fullName:`Bob Lee`}},{id:`VXNlclYyOjQ=`,basicInfo:{username:`carol`,email:`carol@example.com`,fullName:`Carol Park`}}],B={Query:()=>({adminUsersV2:{count:z.length,edges:z.map(e=>({node:e}))}})},V={Query:()=>({adminUsersV2:{count:0,edges:[]}})},H=({initialValue:e=null,resolvers:t=B,...n})=>{let[r,i]=(0,S.useState)(e);return(0,C.jsx)(ce,{mockResolvers:t,children:(0,C.jsx)(b,{...n,value:r,onChange:e=>i(e??null)})})},U={name:`Single Select`,parameters:{docs:{description:{story:'Single user select, `valuePropName="email"` (default).'}}},render:e=>(0,C.jsx)(H,{...e,label:`User`})},W={name:`Multiple Select`,parameters:{docs:{description:{story:`Multi-selection: the value is an array of keys and the trigger lists the selected emails.`}}},render:e=>(0,C.jsx)(H,{...e,label:`Users`,multiple:!0,initialValue:[`admin@example.com`]})},G={name:`Exclude Inactive Users`,parameters:{docs:{description:{story:"`excludeInactive` composes `status: { equals: ACTIVE }` into the `UserV2Filter`."}}},render:e=>(0,C.jsx)(H,{...e,label:`User`,excludeInactive:!0})},K={name:`ID-valued`,parameters:{docs:{description:{story:'`valuePropName="id"` — the plain-key value is the local user UUID, which is what `adminBulkAssignRole` and friends take. This is the only mode that runs the `uuid in` label-resolution query.'}}},render:e=>(0,C.jsx)(H,{...e,label:`User`,valuePropName:`id`})},q={parameters:{docs:{description:{story:"Caller-side `isLoading`, which spins the trigger the same way the internal debounce and refetch pending states do."}}},render:e=>(0,C.jsx)(H,{...e,label:`User`,isLoading:!0,isDisabled:!0})},J={parameters:{docs:{description:{story:`No users match the query — the popup shows the shared empty-state text.`}}},render:e=>(0,C.jsx)(H,{...e,label:`User`,resolvers:V,defaultOpen:!0})},Y={parameters:{docs:{description:{story:"The error status a form item sets when its `required` rule fails."}}},render:e=>(0,C.jsx)(H,{...e,label:`User`,status:{type:`error`,message:`Please select users.`}})},U.parameters={...U.parameters,docs:{...(w=U.parameters)==null?void 0:w.docs,source:{originalSource:`{
  name: 'Single Select',
  parameters: {
    docs: {
      description: {
        story: 'Single user select, \`valuePropName="email"\` (default).'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" />
}`,...(T=U.parameters)==null||(T=T.docs)==null?void 0:T.source}}},W.parameters={...W.parameters,docs:{...(E=W.parameters)==null?void 0:E.docs,source:{originalSource:`{
  name: 'Multiple Select',
  parameters: {
    docs: {
      description: {
        story: 'Multi-selection: the value is an array of keys and the trigger lists the selected emails.'
      }
    }
  },
  render: args => <Sandbox {...args} label="Users" multiple initialValue={['admin@example.com']} />
}`,...(D=W.parameters)==null||(D=D.docs)==null?void 0:D.source}}},G.parameters={...G.parameters,docs:{...(O=G.parameters)==null?void 0:O.docs,source:{originalSource:`{
  name: 'Exclude Inactive Users',
  parameters: {
    docs: {
      description: {
        story: '\`excludeInactive\` composes \`status: { equals: ACTIVE }\` into the \`UserV2Filter\`.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" excludeInactive />
}`,...(k=G.parameters)==null||(k=k.docs)==null?void 0:k.source}}},K.parameters={...K.parameters,docs:{...(A=K.parameters)==null?void 0:A.docs,source:{originalSource:`{
  name: 'ID-valued',
  parameters: {
    docs: {
      description: {
        story: '\`valuePropName="id"\` — the plain-key value is the local user UUID, which is what \`adminBulkAssignRole\` and friends take. This is the only mode that runs the \`uuid in\` label-resolution query.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" valuePropName="id" />
}`,...(j=K.parameters)==null||(j=j.docs)==null?void 0:j.source}}},q.parameters={...q.parameters,docs:{...(M=q.parameters)==null?void 0:M.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Caller-side \`isLoading\`, which spins the trigger the same way the internal debounce and refetch pending states do.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" isLoading isDisabled />
}`,...(N=q.parameters)==null||(N=N.docs)==null?void 0:N.source}}},J.parameters={...J.parameters,docs:{...(P=J.parameters)==null?void 0:P.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'No users match the query — the popup shows the shared empty-state text.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" resolvers={emptyResolvers} defaultOpen />
}`,...(F=J.parameters)==null||(F=F.docs)==null?void 0:F.source}}},Y.parameters={...Y.parameters,docs:{...(I=Y.parameters)==null?void 0:I.docs,source:{originalSource:`{
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
}`,...(L=Y.parameters)==null||(L=L.docs)==null?void 0:L.source}}},X=[`Basic`,`Multiple`,`ExcludeInactive`,`IdValued`,`Loading`,`Empty`,`Error`]})))()}Z();export{U as Basic,J as Empty,Y as Error,G as ExcludeInactive,K as IdValued,q as Loading,W as Multiple,X as __namedExportsOrder,R as default};