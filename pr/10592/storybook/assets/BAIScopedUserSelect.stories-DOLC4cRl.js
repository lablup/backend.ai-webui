import{c as sa,a as la,r as y,j as i}from"./iframe-Cv5RQ7b1.js";import{R as na}from"./RelayResolver-DmvHfXes.js";import{u as oa,a as ia}from"./usePaginatedQuery-BEbeZSbf.js";import{a as ca}from"./index-BXZXYnQ9.js";import{B as da}from"./BAIComplexSelect-C-7e4her.js";import{r as ua}from"./index-BIkJ5xhM.js";import{u as Ve}from"./useControllableValue-DY6u4gWi.js";import{c as ue}from"./combineFilters-CraaN1TU.js";import{c as U}from"./compact-CU4PNV0P.js";import{m as x}from"./map-DdRGGKZK.js";import{c as Ie}from"./castArray-CEabS-kk.js";import"./preload-helper-Dp1pzeXC.js";import"./index-CTLq9660.js";import"./toNumber-CA-5-lpA.js";import"./_trimmedEndIndex-DuQxD0U0.js";import"./isSymbol-BxEkQd7H.js";import"./useEventNotStable-Bh1qr_NJ.js";import"./uniqBy-BqpSsLk_.js";import"./_baseEach-agwwpdD1.js";import"./get-DSbuwfsW.js";import"./_baseGet-CGUfYuec.js";import"./toString-xc5Ru9-1.js";import"./identity-DKeuBCMA.js";import"./_baseUniq-GGQh0f1P.js";import"./_baseIndexOf-Be9UPhX8.js";import"./_baseFindIndex-Cj99RmFE.js";import"./useConnectedBAIClient-DOEnIIZL.js";import"./reactQueryAlias-D-ABp5gc.js";import"./useUpdatableState-CqlAYLkh.js";import"./compiled-D_YGP6zo.js";import"./useDevWarning-DSNsZWh7.js";import"./usePopover-DshQEHbe.js";import"./rtlStyles-T4i24HtE.js";import"./composeEventHandlers-BolWE7qY.js";import"./InputClearButton-CsB0zG9e.js";import"./inputStyles.stylex-Bztz6H8O.js";import"./Field-DSr6nSEy.js";import"./FieldStatus-7LqZUdmL.js";import"./FormLayoutContext-Bft3LzY7.js";import"./useIsHydrating-ajrZKxcD.js";import"./useIndicator-BevEpcfX.js";import"./Token-LyXNbKWO.js";import"./disabledInteraction-Cw4F3Eev.js";import"./Divider-D4VwWZ3j.js";import"./SelectorOption-CyBmm1gg.js";import"./Item-hgrClQRL.js";import"./computeTargetAndRel-BGwjeA1c.js";const ze=(function(){var a={defaultValue:null,kind:"LocalArgument",name:"limit"},e={defaultValue:null,kind:"LocalArgument",name:"scope"},l={defaultValue:null,kind:"LocalArgument",name:"selectedFilter"},n={defaultValue:null,kind:"LocalArgument",name:"skipSelected"},o=[{condition:"skipSelected",kind:"Condition",passingValue:!1,selections:[{alias:null,args:[{kind:"Variable",name:"filter",variableName:"selectedFilter"},{kind:"Variable",name:"limit",variableName:"limit"},{kind:"Variable",name:"scope",variableName:"scope"}],concreteType:"UserV2Connection",kind:"LinkedField",name:"scopedUsersV2",plural:!1,selections:[{alias:null,args:null,concreteType:"UserV2Edge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"UserV2",kind:"LinkedField",name:"node",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"entityId",storageKey:null},{alias:null,args:null,concreteType:"UserV2BasicInfo",kind:"LinkedField",name:"basicInfo",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"email",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"fullName",storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}]}];return{fragment:{argumentDefinitions:[a,e,l,n],kind:"Fragment",metadata:null,name:"BAIScopedUserSelectValueQuery",selections:o,type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[e,l,a,n],kind:"Operation",name:"BAIScopedUserSelectValueQuery",selections:o},params:{cacheID:"73f803e1b9de2f6f3006e799975668d7",id:null,metadata:{},name:"BAIScopedUserSelectValueQuery",operationKind:"query",text:`query BAIScopedUserSelectValueQuery(
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
`}}})();ze.hash="411743b8638ae718f2aaa52604b93e2c";const Ge=(function(){var a={defaultValue:null,kind:"LocalArgument",name:"filter"},e={defaultValue:null,kind:"LocalArgument",name:"limit"},l={defaultValue:null,kind:"LocalArgument",name:"offset"},n={defaultValue:null,kind:"LocalArgument",name:"orderBy"},o={defaultValue:null,kind:"LocalArgument",name:"scope"},c=[{alias:null,args:[{kind:"Variable",name:"filter",variableName:"filter"},{kind:"Variable",name:"limit",variableName:"limit"},{kind:"Variable",name:"offset",variableName:"offset"},{kind:"Variable",name:"orderBy",variableName:"orderBy"},{kind:"Variable",name:"scope",variableName:"scope"}],concreteType:"UserV2Connection",kind:"LinkedField",name:"scopedUsersV2",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"count",storageKey:null},{alias:null,args:null,concreteType:"UserV2Edge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"UserV2",kind:"LinkedField",name:"node",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"entityId",storageKey:null},{alias:null,args:null,concreteType:"UserV2BasicInfo",kind:"LinkedField",name:"basicInfo",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"email",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"fullName",storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:[a,e,l,n,o],kind:"Fragment",metadata:null,name:"BAIScopedUserSelectPaginatedQuery",selections:c,type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[o,l,e,a,n],kind:"Operation",name:"BAIScopedUserSelectPaginatedQuery",selections:c},params:{cacheID:"efde6092b86268c770cd00e780dc0fef",id:null,metadata:{},name:"BAIScopedUserSelectPaginatedQuery",operationKind:"query",text:`query BAIScopedUserSelectPaginatedQuery(
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
`}}})();Ge.hash="9f76fb36f1f0267e95d5c7b6c2bf8a87";const ma=10,He=a=>{"use memo";var be,Se;const e=sa.c(51);let l,n,o,c,d,S,v,k;e[0]!==a?({scope:c,filter:l,excludeInactive:S,valuePropName:v,multiple:k,isLoading:n,ref:o,...d}=a,e[0]=a,e[1]=l,e[2]=n,e[3]=o,e[4]=c,e[5]=d,e[6]=S,e[7]=v,e[8]=k):(l=e[1],n=e[2],o=e[3],c=e[4],d=e[5],S=e[6],v=e[7],k=e[8]);const Je=S===void 0?!1:S,A=v===void 0?"email":v,m=k===void 0?!1:k,{t:H}=la();let N;e[9]===Symbol.for("react.memo_cache_sentinel")?(N={valuePropName:"value",trigger:"onChange"},e[9]=N):N=e[9];const[me,Z]=Ve(d,N);let F;e[10]===Symbol.for("react.memo_cache_sentinel")?(F={valuePropName:"open",trigger:"onOpenChange",defaultValuePropName:"defaultOpen"},e[10]=F):F=e[10];const[pe,J]=Ve(d,F),fe=y.useDeferredValue(pe),[V,We]=y.useState(""),W=oa(V),[ea,ye]=y.useTransition(),[aa,B]=ca(),g=y.useDeferredValue(aa);let j,L;e[11]!==B?(j=()=>({refetch:()=>{ye(()=>{B()})}}),L=[B,ye],e[11]=B,e[12]=j,e[13]=L):(j=e[12],L=e[13]),y.useImperativeHandle(o,j,L);const ge=ue([Je?{status:{equals:"ACTIVE"}}:null,l]),he=y.useDeferredValue(me),K=U(Ie(he??[])),ee=A==="id"&&K.length>0;let C;e[14]===Symbol.for("react.memo_cache_sentinel")?(C=ze,e[14]=C):C=e[14];const ae=ee?"store-or-network":"store-only";let P;e[15]!==g||e[16]!==ae?(P={fetchPolicy:ae,fetchKey:g},e[15]=g,e[16]=ae,e[17]=P):P=e[17];const ra=ua.useLazyLoadQuery(C,{scope:c,selectedFilter:ee?ue([{uuid:{in:K}},ge]):null,limit:Math.max(K.length,1),skipSelected:!ee},P);let D,O;e[18]===Symbol.for("react.memo_cache_sentinel")?(D=Ge,O={limit:ma},e[18]=D,e[19]=O):(D=e[18],O=e[19]);const re=fe?"network-only":"store-only";let w;e[20]!==g||e[21]!==re?(w={fetchPolicy:re,fetchKey:g},e[20]=g,e[21]=re,e[22]=w):w=e[22];let E;e[23]===Symbol.for("react.memo_cache_sentinel")?(E={getTotal:pa,getItem:fa,getId:ya},e[23]=E):E=e[23];const{paginationData:te,result:ta,loadNext:se,isLoadingNext:le}=ia(D,O,{scope:c,filter:ue([ge,W?{email:{iContains:W}}:null]),orderBy:[{field:"EMAIL",direction:"ASC"}]},w,E);let $;e[24]!==A?($=t=>{var r;if(t)return A==="id"?t.entityId:((r=t.basicInfo)==null?void 0:r.email)??void 0},e[24]=A,e[25]=$):$=e[25];const p=$;let R;if(e[26]!==p||e[27]!==te){let t;e[29]!==p?(t=r=>{var s,I;const u=p(r);return u?{value:u,label:((s=r==null?void 0:r.basicInfo)==null?void 0:s.email)??u,description:((I=r==null?void 0:r.basicInfo)==null?void 0:I.fullName)??void 0}:null},e[29]=p,e[30]=t):t=e[30],R=U(x(te,t)),e[26]=p,e[27]=te,e[28]=R}else R=e[28];const ne=R;let oe;e:{let t;e[31]!==p?(t=s=>{var ve,ke;const I=p(s==null?void 0:s.node);return I?[I,(ke=(ve=s==null?void 0:s.node)==null?void 0:ve.basicInfo)==null?void 0:ke.email]:null},e[31]=p,e[32]=t):t=e[32];const r=new Map(U(x((be=ra.scopedUsersV2)==null?void 0:be.edges,t))),u=x(K,s=>({label:r.get(s)??s,value:s}));if(m){oe=u;break e}oe=u[0]??null}const ie=oe;let h;e[33]!==H?(h=H("comp:BAIUserSelect.SelectUser"),e[33]=H,e[34]=h):h=e[34];const ce=n||!!pe&&!fe||me!==he||V!==W||ea,de=((Se=ta.scopedUsersV2)==null?void 0:Se.count)??void 0;let b;e[35]!==m||e[36]!==Z?(b=t=>{const r=U(Ie(t??[])),u=x(r,ga);Z(m?u:u[0],m?r:r[0])},e[35]=m,e[36]=Z,e[37]=b):b=e[37];let T;return e[38]!==le||e[39]!==ie||e[40]!==se||e[41]!==m||e[42]!==ne||e[43]!==V||e[44]!==d||e[45]!==J||e[46]!==h||e[47]!==ce||e[48]!==de||e[49]!==b?(T=i.jsx(da,{placeholder:h,...d,multiple:m,isLoading:ce,isLoadingNext:le,total:de,options:ne,value:ie,onChange:b,searchValue:V,onSearch:We,onOpenChange:J,endReached:se}),e[38]=le,e[39]=ie,e[40]=se,e[41]=m,e[42]=ne,e[43]=V,e[44]=d,e[45]=J,e[46]=h,e[47]=ce,e[48]=de,e[49]=b,e[50]=T):T=e[50],T};function pa(a){var e;return((e=a.scopedUsersV2)==null?void 0:e.count)??void 0}function fa(a){var e;return U(x((e=a.scopedUsersV2)==null?void 0:e.edges,"node"))}function ya(a){return a==null?void 0:a.id}function ga(a){return a.value}const fr={title:"Fragments/BAIScopedUserSelect",component:He,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:"\n**BAIScopedUserSelect** — the user picker for admin and project-admin forms (ADR 0012). Built on `BAIComplexSelect`, paged through `scopedUsersV2`.\n\n- `scope` (required): the `UserScope` input. Admin pages pass the current domain from `useCurrentDomain()`; a project-admin page passes `{ project: [{ value: projectId }] }`.\n- `valuePropName`: `'email'` (default) or `'id'` — which field is the plain-key value. Only `'id'` runs the `uuid in` label-resolution query; with emails the key already is the label.\n- `filter` / `excludeInactive`: composed into a `UserV2Filter` through the schema's `AND` combinator, together with the debounced `email: { iContains }` search.\n- Needs a manager >= 26.9.0, where `scopedUsersV2` exists.\n\nSee `BAIComplexSelect.stories.tsx` for the underlying popup-body component with static options.\n        "}}},argTypes:{value:{control:!1},onChange:{control:!1},filter:{control:!1},scope:{control:!1},multiple:{control:{type:"boolean"}},excludeInactive:{control:{type:"boolean"}},valuePropName:{control:{type:"select"},options:["email","id"]}}},ha=[{id:"VXNlclYyOjE=",basicInfo:{email:"admin@example.com",fullName:"System Administrator"}},{id:"VXNlclYyOjI=",basicInfo:{email:"alice@example.com",fullName:"Alice Kim"}},{id:"VXNlclYyOjM=",basicInfo:{email:"bob@example.com",fullName:"Bob Lee"}},{id:"VXNlclYyOjQ=",basicInfo:{email:"carol@example.com",fullName:"Carol Park"}}],Ze=a=>({count:a.length,edges:a.map(e=>({node:e}))}),ba={Query:()=>({scopedUsersV2:Ze(ha)})},Sa={Query:()=>({scopedUsersV2:Ze([])})},va={domain:[{value:"5c3b5a9e-0000-4000-8000-0000000000d0"}]},f=({scope:a=va,initialValue:e=null,resolvers:l=ba,...n})=>{const[o,c]=y.useState(e);return i.jsx(na,{mockResolvers:l,children:i.jsx(He,{...n,scope:a,value:o,onChange:d=>c(d??null)})})},q={parameters:{docs:{description:{story:"A domain scope, as admin pages build from `useCurrentDomain()`: the users of that domain."}}},render:a=>i.jsx(f,{...a,label:"User",defaultOpen:!0})},Q={parameters:{docs:{description:{story:"A project scope, as the project-admin session page passes: the members of that project."}}},render:a=>i.jsx(f,{...a,label:"Owner",scope:{project:[{value:"5c3b5a9e-0000-4000-8000-000000000001"}]},defaultOpen:!0})},M={name:"Multiple Select",parameters:{docs:{description:{story:"Multi-selection: the value is an array of keys and the trigger lists the selected emails."}}},render:a=>i.jsx(f,{...a,label:"Users",multiple:!0,initialValue:["admin@example.com"]})},_={name:"Exclude Inactive Users",parameters:{docs:{description:{story:"`excludeInactive` composes `status: { equals: ACTIVE }` into the `UserV2Filter`."}}},render:a=>i.jsx(f,{...a,label:"User",excludeInactive:!0})},X={name:"ID-valued",parameters:{docs:{description:{story:'`valuePropName="id"` — the plain-key value is the local user UUID, which is what `adminBulkAssignRole` and friends take. This is the only mode that runs the `uuid in` label-resolution query.'}}},render:a=>i.jsx(f,{...a,label:"User",valuePropName:"id"})},Y={parameters:{docs:{description:{story:"Caller-side `isLoading`, which spins the trigger the same way the internal debounce and refetch pending states do."}}},render:a=>i.jsx(f,{...a,label:"User",isLoading:!0,isDisabled:!0})},z={parameters:{docs:{description:{story:"No users match the query — the popup shows the shared empty-state text."}}},render:a=>i.jsx(f,{...a,label:"User",resolvers:Sa,defaultOpen:!0})},G={parameters:{docs:{description:{story:"The error status a form item sets when its `required` rule fails."}}},render:a=>i.jsx(f,{...a,label:"User",status:{type:"error",message:"Please select users."}})};var Ue,xe,Ae;q.parameters={...q.parameters,docs:{...(Ue=q.parameters)==null?void 0:Ue.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'A domain scope, as admin pages build from \`useCurrentDomain()\`: the users of that domain.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" defaultOpen />
}`,...(Ae=(xe=q.parameters)==null?void 0:xe.docs)==null?void 0:Ae.source}}};var Ne,Fe,Be;Q.parameters={...Q.parameters,docs:{...(Ne=Q.parameters)==null?void 0:Ne.docs,source:{originalSource:`{
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
}`,...(Be=(Fe=Q.parameters)==null?void 0:Fe.docs)==null?void 0:Be.source}}};var je,Le,Ke;M.parameters={...M.parameters,docs:{...(je=M.parameters)==null?void 0:je.docs,source:{originalSource:`{
  name: 'Multiple Select',
  parameters: {
    docs: {
      description: {
        story: 'Multi-selection: the value is an array of keys and the trigger lists the selected emails.'
      }
    }
  },
  render: args => <Sandbox {...args} label="Users" multiple initialValue={['admin@example.com']} />
}`,...(Ke=(Le=M.parameters)==null?void 0:Le.docs)==null?void 0:Ke.source}}};var Ce,Pe,De;_.parameters={..._.parameters,docs:{...(Ce=_.parameters)==null?void 0:Ce.docs,source:{originalSource:`{
  name: 'Exclude Inactive Users',
  parameters: {
    docs: {
      description: {
        story: '\`excludeInactive\` composes \`status: { equals: ACTIVE }\` into the \`UserV2Filter\`.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" excludeInactive />
}`,...(De=(Pe=_.parameters)==null?void 0:Pe.docs)==null?void 0:De.source}}};var Oe,we,Ee;X.parameters={...X.parameters,docs:{...(Oe=X.parameters)==null?void 0:Oe.docs,source:{originalSource:`{
  name: 'ID-valued',
  parameters: {
    docs: {
      description: {
        story: '\`valuePropName="id"\` — the plain-key value is the local user UUID, which is what \`adminBulkAssignRole\` and friends take. This is the only mode that runs the \`uuid in\` label-resolution query.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" valuePropName="id" />
}`,...(Ee=(we=X.parameters)==null?void 0:we.docs)==null?void 0:Ee.source}}};var $e,Re,Te;Y.parameters={...Y.parameters,docs:{...($e=Y.parameters)==null?void 0:$e.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Caller-side \`isLoading\`, which spins the trigger the same way the internal debounce and refetch pending states do.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" isLoading isDisabled />
}`,...(Te=(Re=Y.parameters)==null?void 0:Re.docs)==null?void 0:Te.source}}};var qe,Qe,Me;z.parameters={...z.parameters,docs:{...(qe=z.parameters)==null?void 0:qe.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'No users match the query — the popup shows the shared empty-state text.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" resolvers={emptyResolvers} defaultOpen />
}`,...(Me=(Qe=z.parameters)==null?void 0:Qe.docs)==null?void 0:Me.source}}};var _e,Xe,Ye;G.parameters={...G.parameters,docs:{...(_e=G.parameters)==null?void 0:_e.docs,source:{originalSource:`{
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
}`,...(Ye=(Xe=G.parameters)==null?void 0:Xe.docs)==null?void 0:Ye.source}}};const yr=["DomainScope","ProjectMembers","Multiple","ExcludeInactive","IdValued","Loading","Empty","Error"];export{q as DomainScope,z as Empty,G as Error,_ as ExcludeInactive,X as IdValued,Y as Loading,M as Multiple,Q as ProjectMembers,yr as __namedExportsOrder,fr as default};
