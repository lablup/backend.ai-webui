import{b as fa,c as ya,a as ga,r as g,j as r}from"./iframe-CBiLbZ76.js";import{R as ha}from"./RelayResolver-BUQKolWY.js";import{u as ba,a as Sa}from"./usePaginatedQuery-CCpK0BPD.js";import{a as ka}from"./index-E1nifswN.js";import{B as va}from"./BAIComplexSelect-BgGQJ7tC.js";import{r as Ia}from"./index-fbivfOXv.js";import{u as Ne}from"./useControllableValue-CKpn-mu6.js";import{c as Se}from"./combineFilters-CraaN1TU.js";import{c as F}from"./compact-CU4PNV0P.js";import{m as v}from"./map-CD5_nEsl.js";import{s as Va}from"./some-w3m-X_vJ.js";import{c as Fe}from"./castArray-CLCSBhI7.js";import{f as Ua}from"./find-qpk9PIz-.js";import"./preload-helper-Dp1pzeXC.js";import"./index-Duu37p1w.js";import"./toNumber-BrI7vbmr.js";import"./_trimmedEndIndex-DuQxD0U0.js";import"./isSymbol-DRsM-Jzj.js";import"./useEventNotStable-D226hEb0.js";import"./uniqBy-C8C31-De.js";import"./_baseEach-BVUUG_Du.js";import"./get-C6iIqT61.js";import"./_baseGet-XwSLBMEV.js";import"./toString-CwXMzJZl.js";import"./identity-DKeuBCMA.js";import"./_baseUniq-BKJCMtim.js";import"./_arrayIncludes-B0rj_Tme.js";import"./_baseIndexOf-Be9UPhX8.js";import"./_baseFindIndex-Cj99RmFE.js";import"./useConnectedBAIClient-BCdKSFZw.js";import"./reactQueryAlias-rz7b3ZID.js";import"./useUpdatableState-ndBhYO69.js";import"./compiled-D_YGP6zo.js";import"./useDevWarning-DtnV32js.js";import"./usePopover-BQiel5ij.js";import"./rtlStyles-T4i24HtE.js";import"./composeEventHandlers-BolWE7qY.js";import"./InputClearButton-BiFuWUyj.js";import"./inputStyles.stylex-Bztz6H8O.js";import"./Field-B8zaImur.js";import"./FieldStatus-BU31K-0i.js";import"./FormLayoutContext-BguSSft4.js";import"./useIsHydrating-CKKMjhOm.js";import"./useIndicator-CaaedCpX.js";import"./Token-BrzqqOxN.js";import"./disabledInteraction-DaIBEh_c.js";import"./Divider-Bo_eU0HK.js";import"./SelectorOption-T7AMjW5_.js";import"./Item-BuLBWHBj.js";import"./computeTargetAndRel-BGwjeA1c.js";import"./toInteger-DY4hSSuu.js";import"./toFinite-3GBLV2iG.js";/**
 * @license lucide-react v1.37.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const xa=[["path",{d:"M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8",key:"12jkf8"}],["path",{d:"m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7",key:"1ocrg3"}],["path",{d:"M19 16v6",key:"tddt3s"}],["path",{d:"M16 19h6",key:"xwg31i"}]],Aa=fa("mail-plus",xa),sa=(function(){var a={defaultValue:null,kind:"LocalArgument",name:"limit"},e={defaultValue:null,kind:"LocalArgument",name:"scope"},l={defaultValue:null,kind:"LocalArgument",name:"selectedFilter"},n={defaultValue:null,kind:"LocalArgument",name:"skipSelected"},o=[{condition:"skipSelected",kind:"Condition",passingValue:!1,selections:[{alias:null,args:[{kind:"Variable",name:"filter",variableName:"selectedFilter"},{kind:"Variable",name:"limit",variableName:"limit"},{kind:"Variable",name:"scope",variableName:"scope"}],concreteType:"UserV2Connection",kind:"LinkedField",name:"scopedUsersV2",plural:!1,selections:[{alias:null,args:null,concreteType:"UserV2Edge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"UserV2",kind:"LinkedField",name:"node",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"entityId",storageKey:null},{alias:null,args:null,concreteType:"UserV2BasicInfo",kind:"LinkedField",name:"basicInfo",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"email",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"fullName",storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}]}];return{fragment:{argumentDefinitions:[a,e,l,n],kind:"Fragment",metadata:null,name:"BAIScopedUserSelectValueQuery",selections:o,type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[e,l,a,n],kind:"Operation",name:"BAIScopedUserSelectValueQuery",selections:o},params:{cacheID:"73f803e1b9de2f6f3006e799975668d7",id:null,metadata:{},name:"BAIScopedUserSelectValueQuery",operationKind:"query",text:`query BAIScopedUserSelectValueQuery(
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
`}}})();sa.hash="411743b8638ae718f2aaa52604b93e2c";const ra=(function(){var a={defaultValue:null,kind:"LocalArgument",name:"filter"},e={defaultValue:null,kind:"LocalArgument",name:"limit"},l={defaultValue:null,kind:"LocalArgument",name:"offset"},n={defaultValue:null,kind:"LocalArgument",name:"orderBy"},o={defaultValue:null,kind:"LocalArgument",name:"scope"},c=[{alias:null,args:[{kind:"Variable",name:"filter",variableName:"filter"},{kind:"Variable",name:"limit",variableName:"limit"},{kind:"Variable",name:"offset",variableName:"offset"},{kind:"Variable",name:"orderBy",variableName:"orderBy"},{kind:"Variable",name:"scope",variableName:"scope"}],concreteType:"UserV2Connection",kind:"LinkedField",name:"scopedUsersV2",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"count",storageKey:null},{alias:null,args:null,concreteType:"UserV2Edge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"UserV2",kind:"LinkedField",name:"node",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"entityId",storageKey:null},{alias:null,args:null,concreteType:"UserV2BasicInfo",kind:"LinkedField",name:"basicInfo",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"email",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"fullName",storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:[a,e,l,n,o],kind:"Fragment",metadata:null,name:"BAIScopedUserSelectPaginatedQuery",selections:c,type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[o,l,e,a,n],kind:"Operation",name:"BAIScopedUserSelectPaginatedQuery",selections:c},params:{cacheID:"efde6092b86268c770cd00e780dc0fef",id:null,metadata:{},name:"BAIScopedUserSelectPaginatedQuery",operationKind:"query",text:`query BAIScopedUserSelectPaginatedQuery(
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
`}}})();ra.hash="9f76fb36f1f0267e95d5c7b6c2bf8a87";const Ca=10,Na=/^[^\s@]+@[^\s@]+\.[^\s@]+$/,la=a=>{"use memo";var Ae,Ce;const e=ya.c(53);let l,n,o,c,d,I,V,U,x;e[0]!==a?({scope:c,allowCustomSelect:I,filter:l,excludeInactive:V,valuePropName:U,multiple:x,isLoading:n,ref:o,...d}=a,e[0]=a,e[1]=l,e[2]=n,e[3]=o,e[4]=c,e[5]=d,e[6]=I,e[7]=V,e[8]=U,e[9]=x):(l=e[1],n=e[2],o=e[3],c=e[4],d=e[5],I=e[6],V=e[7],U=e[8],x=e[9]);const oa=I===void 0?!1:I,ia=V===void 0?!1:V,A=U===void 0?"email":U,p=x===void 0?!1:x,{t:L}=ga();let B;e[10]===Symbol.for("react.memo_cache_sentinel")?(B={valuePropName:"value",trigger:"onChange"},e[10]=B):B=e[10];const[ke,le]=Ne(d,B);let j;e[11]===Symbol.for("react.memo_cache_sentinel")?(j={valuePropName:"open",trigger:"onOpenChange",defaultValuePropName:"defaultOpen"},e[11]=j):j=e[11];const[ve,ne]=Ne(d,j),Ie=g.useDeferredValue(ve),[C,ca]=g.useState(""),w=ba(C),[da,Ve]=g.useTransition(),[ua,K]=ka(),h=g.useDeferredValue(ua);let P,O;e[12]!==K?(P=()=>({refetch:()=>{Ve(()=>{K()})}}),O=[K,Ve],e[12]=K,e[13]=P,e[14]=O):(P=e[13],O=e[14]),g.useImperativeHandle(o,P,O);const Ue=Se([ia?{status:{equals:"ACTIVE"}}:null,l]),xe=g.useDeferredValue(ke),D=F(Fe(xe??[])),oe=A==="id"&&D.length>0;let E;e[15]===Symbol.for("react.memo_cache_sentinel")?(E=sa,e[15]=E):E=e[15];const ie=oe?"store-or-network":"store-only";let T;e[16]!==h||e[17]!==ie?(T={fetchPolicy:ie,fetchKey:h},e[16]=h,e[17]=ie,e[18]=T):T=e[18];const ma=Ia.useLazyLoadQuery(E,{scope:c,selectedFilter:oe?Se([{uuid:{in:D}},Ue]):null,limit:Math.max(D.length,1),skipSelected:!oe},T);let $,R;e[19]===Symbol.for("react.memo_cache_sentinel")?($=ra,R={limit:Ca},e[19]=$,e[20]=R):($=e[19],R=e[20]);const ce=Ie?"network-only":"store-only";let q;e[21]!==h||e[22]!==ce?(q={fetchPolicy:ce,fetchKey:h},e[21]=h,e[22]=ce,e[23]=q):q=e[23];let M;e[24]===Symbol.for("react.memo_cache_sentinel")?(M={getTotal:Fa,getItem:La,getId:Ba},e[24]=M):M=e[24];const{paginationData:Q,result:pa,loadNext:de,isLoadingNext:ue}=Sa($,R,{scope:c,filter:Se([Ue,w?{email:{iContains:w}}:null]),orderBy:[{field:"EMAIL",direction:"ASC"}]},q,M);let _;e[25]!==A?(_=t=>{var i;if(t)return A==="id"?t.entityId:((i=t.basicInfo)==null?void 0:i.email)??void 0},e[25]=A,e[26]=_):_=e[26];const u=_;let X;e[27]!==u?(X=t=>{var f,s;const i=u(t);return i?{value:i,label:((f=t==null?void 0:t.basicInfo)==null?void 0:f.email)??i,description:((s=t==null?void 0:t.basicInfo)==null?void 0:s.fullName)??void 0}:null},e[27]=u,e[28]=X):X=e[28];const me=F(v(Q,X)),Y=w.trim(),b=oa&&A==="email"&&Na.test(Y)&&!Va(me,t=>t.value.toLowerCase()===Y.toLowerCase())?{value:Y,label:Y,description:L("comp:BAIScopedUserSelect.InviteByEmail"),icon:r.jsx(Aa,{size:"1em"})}:null;let pe;e:{let t;e[29]!==u?(t=s=>{var N,H;const y=u(s==null?void 0:s.node);return y?[y,(H=(N=s==null?void 0:s.node)==null?void 0:N.basicInfo)==null?void 0:H.email]:null},e[29]=u,e[30]=t):t=e[30];const i=new Map(F(v((Ae=ma.scopedUsersV2)==null?void 0:Ae.edges,t))),f=v(D,s=>({label:i.get(s)??s,value:s}));if(p){pe=f;break e}pe=f[0]??null}const fe=pe,ye=va;let S;e[31]!==L?(S=L("comp:BAIUserSelect.SelectUser"),e[31]=L,e[32]=S):S=e[32];const ge=n||!!ve&&!Ie||ke!==xe||C!==w||da,he=((Ce=pa.scopedUsersV2)==null?void 0:Ce.count)??void 0,be=b?[...me,b]:me;let k;e[33]!==b||e[34]!==u||e[35]!==p||e[36]!==Q||e[37]!==le?(k=t=>{const i=F(Fe(t??[])),f=v(i,ja),s=v(i,y=>{const N=Ua(Q,H=>u(H)===y.value);return N?{...y,userId:N.entityId}:b&&y.value===b.value?{...y,isCustom:!0}:y});le(p?f:f[0],p?s:s[0])},e[33]=b,e[34]=u,e[35]=p,e[36]=Q,e[37]=le,e[38]=k):k=e[38];let z;return e[39]!==ye||e[40]!==ue||e[41]!==fe||e[42]!==de||e[43]!==p||e[44]!==C||e[45]!==d||e[46]!==ne||e[47]!==S||e[48]!==ge||e[49]!==he||e[50]!==be||e[51]!==k?(z=r.jsx(ye,{placeholder:S,...d,multiple:p,isLoading:ge,isLoadingNext:ue,total:he,options:be,value:fe,onChange:k,searchValue:C,onSearch:ca,onOpenChange:ne,endReached:de}),e[39]=ye,e[40]=ue,e[41]=fe,e[42]=de,e[43]=p,e[44]=C,e[45]=d,e[46]=ne,e[47]=S,e[48]=ge,e[49]=he,e[50]=be,e[51]=k,e[52]=z):z=e[52],z};function Fa(a){var e;return((e=a.scopedUsersV2)==null?void 0:e.count)??void 0}function La(a){var e;return F(v((e=a.scopedUsersV2)==null?void 0:e.edges,"node"))}function Ba(a){return a==null?void 0:a.id}function ja(a){return a.value}const Pt={title:"Fragments/BAIScopedUserSelect",component:la,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:"\n**BAIScopedUserSelect** — the user picker for admin and project-admin forms (ADR 0012). Built on `BAIComplexSelect`, paged through `scopedUsersV2`.\n\n- `scope` (required): the `UserScope` input. Admin pages pass the current domain from `useCurrentDomain()`; a project-admin page passes `{ project: [{ value: projectId }] }`.\n- `valuePropName`: `'email'` (default) or `'id'` — which field is the plain-key value. Only `'id'` runs the `uuid in` label-resolution query; with emails the key already is the label.\n- `filter` / `excludeInactive`: composed into a `UserV2Filter` through the schema's `AND` combinator, together with the debounced `email: { iContains }` search.\n- Needs a manager >= 26.9.0, where `scopedUsersV2` exists.\n\nSee `BAIComplexSelect.stories.tsx` for the underlying popup-body component with static options.\n        "}}},argTypes:{value:{control:!1},onChange:{control:!1},filter:{control:!1},scope:{control:!1},multiple:{control:{type:"boolean"}},excludeInactive:{control:{type:"boolean"}},valuePropName:{control:{type:"select"},options:["email","id"]}}},wa=[{id:"VXNlclYyOjE=",basicInfo:{email:"admin@example.com",fullName:"System Administrator"}},{id:"VXNlclYyOjI=",basicInfo:{email:"alice@example.com",fullName:"Alice Kim"}},{id:"VXNlclYyOjM=",basicInfo:{email:"bob@example.com",fullName:"Bob Lee"}},{id:"VXNlclYyOjQ=",basicInfo:{email:"carol@example.com",fullName:"Carol Park"}}],na=a=>({count:a.length,edges:a.map(e=>({node:e}))}),Ka={Query:()=>({scopedUsersV2:na(wa)})},Pa={Query:()=>({scopedUsersV2:na([])})},Oa={domain:[{value:"5c3b5a9e-0000-4000-8000-0000000000d0"}]},m=({scope:a=Oa,initialValue:e=null,resolvers:l=Ka,...n})=>{const[o,c]=g.useState(e);return r.jsx(ha,{mockResolvers:l,children:r.jsx(la,{...n,scope:a,value:o,onChange:d=>c(d??null)})})},G={parameters:{docs:{description:{story:"A domain scope, as admin pages build from `useCurrentDomain()`: the users of that domain."}}},render:a=>r.jsx(m,{...a,label:"User",defaultOpen:!0})},Z={parameters:{docs:{description:{story:"A project scope, as the project-admin session page passes: the members of that project."}}},render:a=>r.jsx(m,{...a,label:"Owner",scope:{project:[{value:"5c3b5a9e-0000-4000-8000-000000000001"}]},defaultOpen:!0})},J={name:"Multiple Select",parameters:{docs:{description:{story:"Multi-selection: the value is an array of keys and the trigger lists the selected emails."}}},render:a=>r.jsx(m,{...a,label:"Users",multiple:!0,initialValue:["admin@example.com"]})},W={name:"Custom e-mail entry",parameters:{docs:{description:{story:"`allowCustomSelect` — an e-mail address typed in the search box that no listed user matches is offered as one more option; picking it makes the value that address and `onChange` marks it `isCustom`."}}},render:a=>r.jsx(m,{...a,label:"User",allowCustomSelect:!0,defaultOpen:!0})},ee={name:"Exclude Inactive Users",parameters:{docs:{description:{story:"`excludeInactive` composes `status: { equals: ACTIVE }` into the `UserV2Filter`."}}},render:a=>r.jsx(m,{...a,label:"User",excludeInactive:!0})},ae={name:"ID-valued",parameters:{docs:{description:{story:'`valuePropName="id"` — the plain-key value is the local user UUID, which is what `adminBulkAssignRole` and friends take. This is the only mode that runs the `uuid in` label-resolution query.'}}},render:a=>r.jsx(m,{...a,label:"User",valuePropName:"id"})},te={parameters:{docs:{description:{story:"Caller-side `isLoading`, which spins the trigger the same way the internal debounce and refetch pending states do."}}},render:a=>r.jsx(m,{...a,label:"User",isLoading:!0,isDisabled:!0})},se={parameters:{docs:{description:{story:"No users match the query — the popup shows the shared empty-state text."}}},render:a=>r.jsx(m,{...a,label:"User",resolvers:Pa,defaultOpen:!0})},re={parameters:{docs:{description:{story:"The error status a form item sets when its `required` rule fails."}}},render:a=>r.jsx(m,{...a,label:"User",status:{type:"error",message:"Please select users."}})};var Le,Be,je;G.parameters={...G.parameters,docs:{...(Le=G.parameters)==null?void 0:Le.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'A domain scope, as admin pages build from \`useCurrentDomain()\`: the users of that domain.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" defaultOpen />
}`,...(je=(Be=G.parameters)==null?void 0:Be.docs)==null?void 0:je.source}}};var we,Ke,Pe;Z.parameters={...Z.parameters,docs:{...(we=Z.parameters)==null?void 0:we.docs,source:{originalSource:`{
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
}`,...(Pe=(Ke=Z.parameters)==null?void 0:Ke.docs)==null?void 0:Pe.source}}};var Oe,De,Ee;J.parameters={...J.parameters,docs:{...(Oe=J.parameters)==null?void 0:Oe.docs,source:{originalSource:`{
  name: 'Multiple Select',
  parameters: {
    docs: {
      description: {
        story: 'Multi-selection: the value is an array of keys and the trigger lists the selected emails.'
      }
    }
  },
  render: args => <Sandbox {...args} label="Users" multiple initialValue={['admin@example.com']} />
}`,...(Ee=(De=J.parameters)==null?void 0:De.docs)==null?void 0:Ee.source}}};var Te,$e,Re;W.parameters={...W.parameters,docs:{...(Te=W.parameters)==null?void 0:Te.docs,source:{originalSource:`{
  name: 'Custom e-mail entry',
  parameters: {
    docs: {
      description: {
        story: '\`allowCustomSelect\` — an e-mail address typed in the search box that no listed user matches is offered as one more option; picking it makes the value that address and \`onChange\` marks it \`isCustom\`.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" allowCustomSelect defaultOpen />
}`,...(Re=($e=W.parameters)==null?void 0:$e.docs)==null?void 0:Re.source}}};var qe,Me,Qe;ee.parameters={...ee.parameters,docs:{...(qe=ee.parameters)==null?void 0:qe.docs,source:{originalSource:`{
  name: 'Exclude Inactive Users',
  parameters: {
    docs: {
      description: {
        story: '\`excludeInactive\` composes \`status: { equals: ACTIVE }\` into the \`UserV2Filter\`.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" excludeInactive />
}`,...(Qe=(Me=ee.parameters)==null?void 0:Me.docs)==null?void 0:Qe.source}}};var _e,Xe,Ye;ae.parameters={...ae.parameters,docs:{...(_e=ae.parameters)==null?void 0:_e.docs,source:{originalSource:`{
  name: 'ID-valued',
  parameters: {
    docs: {
      description: {
        story: '\`valuePropName="id"\` — the plain-key value is the local user UUID, which is what \`adminBulkAssignRole\` and friends take. This is the only mode that runs the \`uuid in\` label-resolution query.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" valuePropName="id" />
}`,...(Ye=(Xe=ae.parameters)==null?void 0:Xe.docs)==null?void 0:Ye.source}}};var ze,He,Ge;te.parameters={...te.parameters,docs:{...(ze=te.parameters)==null?void 0:ze.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Caller-side \`isLoading\`, which spins the trigger the same way the internal debounce and refetch pending states do.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" isLoading isDisabled />
}`,...(Ge=(He=te.parameters)==null?void 0:He.docs)==null?void 0:Ge.source}}};var Ze,Je,We;se.parameters={...se.parameters,docs:{...(Ze=se.parameters)==null?void 0:Ze.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'No users match the query — the popup shows the shared empty-state text.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" resolvers={emptyResolvers} defaultOpen />
}`,...(We=(Je=se.parameters)==null?void 0:Je.docs)==null?void 0:We.source}}};var ea,aa,ta;re.parameters={...re.parameters,docs:{...(ea=re.parameters)==null?void 0:ea.docs,source:{originalSource:`{
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
}`,...(ta=(aa=re.parameters)==null?void 0:aa.docs)==null?void 0:ta.source}}};const Ot=["DomainScope","ProjectMembers","Multiple","CustomSelect","ExcludeInactive","IdValued","Loading","Empty","Error"];export{W as CustomSelect,G as DomainScope,se as Empty,re as Error,ee as ExcludeInactive,ae as IdValued,te as Loading,J as Multiple,Z as ProjectMembers,Ot as __namedExportsOrder,Pt as default};
