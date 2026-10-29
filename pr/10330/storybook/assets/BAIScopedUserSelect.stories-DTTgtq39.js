import{b as fa,c as ya,a as ga,r as g,j as r}from"./iframe-CxXtO_Fk.js";import{R as ha}from"./RelayResolver-DUp2q6Po.js";import{u as ba,a as Sa}from"./usePaginatedQuery-BsoVwUtm.js";import{a as ka}from"./index-BXVK9m_b.js";import{B as va}from"./BAIComplexSelect-D91ddn_w.js";import{r as Ia}from"./index-CTIRTTFZ.js";import{u as Fe}from"./useControllableValue-gxgpTIdT.js";import{c as Se}from"./combineFilters-CraaN1TU.js";import{c as F}from"./compact-CU4PNV0P.js";import{m as v}from"./map-Be0d9tqd.js";import{s as Va}from"./some-CaNxMriY.js";import{c as Le}from"./castArray-vrVSW88q.js";import{f as Ua}from"./find-Dbrj9CXS.js";import"./preload-helper-Dp1pzeXC.js";import"./index-COaZAt32.js";import"./toNumber-BS1XswBI.js";import"./_trimmedEndIndex-DuQxD0U0.js";import"./isSymbol-BJ-9Maax.js";import"./useEventNotStable-DHtGl-Ql.js";import"./uniqBy-BlSuqowr.js";import"./_baseEach-BRrytHcV.js";import"./get-BUbaGYlD.js";import"./_baseGet-il3rknAK.js";import"./toString-BjkwGRYO.js";import"./identity-DKeuBCMA.js";import"./_baseUniq-DISSH8nL.js";import"./_arrayIncludes-B0rj_Tme.js";import"./_baseIndexOf-Be9UPhX8.js";import"./_baseFindIndex-Cj99RmFE.js";import"./useConnectedBAIClient-Bz7Z_m3i.js";import"./reactQueryAlias-BZr9IAuQ.js";import"./useUpdatableState-_Fd00xKj.js";import"./compiled-D_YGP6zo.js";import"./useDevWarning-C1ZCaVJI.js";import"./usePopover-BQCRSNau.js";import"./rtlStyles-T4i24HtE.js";import"./composeEventHandlers-BolWE7qY.js";import"./InputClearButton-D3c1kw4f.js";import"./inputStyles.stylex-Bztz6H8O.js";import"./Field-WGu3jOn0.js";import"./FieldStatus-DsIv4duQ.js";import"./FormLayoutContext-CgwVsWeP.js";import"./useIsHydrating-Cb0eNtIf.js";import"./useIndicator-fi_PEzEm.js";import"./Token-LoaQ4K5p.js";import"./disabledInteraction-TiAaESkt.js";import"./Divider-CIOdE9Rj.js";import"./SelectorOption-BAX7nl5W.js";import"./Item-DpLN6z4m.js";import"./computeTargetAndRel-BGwjeA1c.js";import"./toInteger-CfCaBsIR.js";import"./toFinite-DYJTraHF.js";/**
 * @license lucide-react v1.37.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const xa=[["path",{d:"M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8",key:"12jkf8"}],["path",{d:"m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7",key:"1ocrg3"}],["path",{d:"M19 16v6",key:"tddt3s"}],["path",{d:"M16 19h6",key:"xwg31i"}]],Aa=fa("mail-plus",xa),ra=(function(){var a={defaultValue:null,kind:"LocalArgument",name:"limit"},e={defaultValue:null,kind:"LocalArgument",name:"scope"},l={defaultValue:null,kind:"LocalArgument",name:"selectedFilter"},n={defaultValue:null,kind:"LocalArgument",name:"skipSelected"},o=[{condition:"skipSelected",kind:"Condition",passingValue:!1,selections:[{alias:null,args:[{kind:"Variable",name:"filter",variableName:"selectedFilter"},{kind:"Variable",name:"limit",variableName:"limit"},{kind:"Variable",name:"scope",variableName:"scope"}],concreteType:"UserV2Connection",kind:"LinkedField",name:"scopedUsersV2",plural:!1,selections:[{alias:null,args:null,concreteType:"UserV2Edge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"UserV2",kind:"LinkedField",name:"node",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"entityId",storageKey:null},{alias:null,args:null,concreteType:"UserV2BasicInfo",kind:"LinkedField",name:"basicInfo",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"email",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"fullName",storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}]}];return{fragment:{argumentDefinitions:[a,e,l,n],kind:"Fragment",metadata:null,name:"BAIScopedUserSelectValueQuery",selections:o,type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[e,l,a,n],kind:"Operation",name:"BAIScopedUserSelectValueQuery",selections:o},params:{cacheID:"73f803e1b9de2f6f3006e799975668d7",id:null,metadata:{},name:"BAIScopedUserSelectValueQuery",operationKind:"query",text:`query BAIScopedUserSelectValueQuery(
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
`}}})();ra.hash="411743b8638ae718f2aaa52604b93e2c";const la=(function(){var a={defaultValue:null,kind:"LocalArgument",name:"filter"},e={defaultValue:null,kind:"LocalArgument",name:"limit"},l={defaultValue:null,kind:"LocalArgument",name:"offset"},n={defaultValue:null,kind:"LocalArgument",name:"orderBy"},o={defaultValue:null,kind:"LocalArgument",name:"scope"},c=[{alias:null,args:[{kind:"Variable",name:"filter",variableName:"filter"},{kind:"Variable",name:"limit",variableName:"limit"},{kind:"Variable",name:"offset",variableName:"offset"},{kind:"Variable",name:"orderBy",variableName:"orderBy"},{kind:"Variable",name:"scope",variableName:"scope"}],concreteType:"UserV2Connection",kind:"LinkedField",name:"scopedUsersV2",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"count",storageKey:null},{alias:null,args:null,concreteType:"UserV2Edge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"UserV2",kind:"LinkedField",name:"node",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"entityId",storageKey:null},{alias:null,args:null,concreteType:"UserV2BasicInfo",kind:"LinkedField",name:"basicInfo",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"email",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"fullName",storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:[a,e,l,n,o],kind:"Fragment",metadata:null,name:"BAIScopedUserSelectPaginatedQuery",selections:c,type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[o,l,e,a,n],kind:"Operation",name:"BAIScopedUserSelectPaginatedQuery",selections:c},params:{cacheID:"efde6092b86268c770cd00e780dc0fef",id:null,metadata:{},name:"BAIScopedUserSelectPaginatedQuery",operationKind:"query",text:`query BAIScopedUserSelectPaginatedQuery(
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
`}}})();la.hash="9f76fb36f1f0267e95d5c7b6c2bf8a87";const Ca=10,Na=/^[^\s@]+@[^\s@]+\.[^\s@]+$/,na=a=>{"use memo";var Ce,Ne;const e=ya.c(53);let l,n,o,c,d,I,V,U,x;e[0]!==a?({scope:c,allowCustomSelect:I,filter:l,excludeInactive:V,valuePropName:U,multiple:x,isLoading:n,ref:o,...d}=a,e[0]=a,e[1]=l,e[2]=n,e[3]=o,e[4]=c,e[5]=d,e[6]=I,e[7]=V,e[8]=U,e[9]=x):(l=e[1],n=e[2],o=e[3],c=e[4],d=e[5],I=e[6],V=e[7],U=e[8],x=e[9]);const ia=I===void 0?!1:I,ca=V===void 0?!1:V,A=U===void 0?"email":U,u=x===void 0?!1:x,{t:L}=ga();let B;e[10]===Symbol.for("react.memo_cache_sentinel")?(B={valuePropName:"value",trigger:"onChange"},e[10]=B):B=e[10];const[ke,le]=Fe(d,B);let j;e[11]===Symbol.for("react.memo_cache_sentinel")?(j={valuePropName:"open",trigger:"onOpenChange",defaultValuePropName:"defaultOpen"},e[11]=j):j=e[11];const[ve,ne]=Fe(d,j),Ie=g.useDeferredValue(ve),[C,Ve]=g.useState(""),w=ba(C),[da,Ue]=g.useTransition(),[ua,K]=ka(),h=g.useDeferredValue(ua);let P,O;e[12]!==K?(P=()=>({refetch:()=>{Ue(()=>{K()})}}),O=[K,Ue],e[12]=K,e[13]=P,e[14]=O):(P=e[13],O=e[14]),g.useImperativeHandle(o,P,O);const xe=Se([ca?{status:{equals:"ACTIVE"}}:null,l]),Ae=g.useDeferredValue(ke),D=F(Le(Ae??[])),oe=A==="id"&&D.length>0;let E;e[15]===Symbol.for("react.memo_cache_sentinel")?(E=ra,e[15]=E):E=e[15];const ie=oe?"store-or-network":"store-only";let T;e[16]!==h||e[17]!==ie?(T={fetchPolicy:ie,fetchKey:h},e[16]=h,e[17]=ie,e[18]=T):T=e[18];const ma=Ia.useLazyLoadQuery(E,{scope:c,selectedFilter:oe?Se([{uuid:{in:D}},xe]):null,limit:Math.max(D.length,1),skipSelected:!oe},T);let $,R;e[19]===Symbol.for("react.memo_cache_sentinel")?($=la,R={limit:Ca},e[19]=$,e[20]=R):($=e[19],R=e[20]);const ce=Ie?"network-only":"store-only";let q;e[21]!==h||e[22]!==ce?(q={fetchPolicy:ce,fetchKey:h},e[21]=h,e[22]=ce,e[23]=q):q=e[23];let M;e[24]===Symbol.for("react.memo_cache_sentinel")?(M={getTotal:Fa,getItem:La,getId:Ba},e[24]=M):M=e[24];const{paginationData:Q,result:pa,loadNext:de,isLoadingNext:ue}=Sa($,R,{scope:c,filter:Se([xe,w?{email:{iContains:w}}:null]),orderBy:[{field:"EMAIL",direction:"ASC"}]},q,M);let _;e[25]!==A?(_=t=>{var i;if(t)return A==="id"?t.entityId:((i=t.basicInfo)==null?void 0:i.email)??void 0},e[25]=A,e[26]=_):_=e[26];const m=_;let X;e[27]!==m?(X=t=>{var f,s;const i=m(t);return i?{value:i,label:((f=t==null?void 0:t.basicInfo)==null?void 0:f.email)??i,description:((s=t==null?void 0:t.basicInfo)==null?void 0:s.fullName)??void 0}:null},e[27]=m,e[28]=X):X=e[28];const me=F(v(Q,X)),Y=w.trim(),b=ia&&A==="email"&&Na.test(Y)&&!Va(me,t=>t.value.toLowerCase()===Y.toLowerCase())?{value:Y,label:Y,description:L("comp:BAIScopedUserSelect.InviteByEmail"),icon:r.jsx(Aa,{size:"1em"})}:null;let pe;e:{let t;e[29]!==m?(t=s=>{var N,H;const y=m(s==null?void 0:s.node);return y?[y,(H=(N=s==null?void 0:s.node)==null?void 0:N.basicInfo)==null?void 0:H.email]:null},e[29]=m,e[30]=t):t=e[30];const i=new Map(F(v((Ce=ma.scopedUsersV2)==null?void 0:Ce.edges,t))),f=v(D,s=>({label:i.get(s)??s,value:s}));if(u){pe=f;break e}pe=f[0]??null}const fe=pe,ye=va;let S;e[31]!==L?(S=L("comp:BAIUserSelect.SelectUser"),e[31]=L,e[32]=S):S=e[32];const ge=n||!!ve&&!Ie||ke!==Ae||C!==w||da,he=((Ne=pa.scopedUsersV2)==null?void 0:Ne.count)??void 0,be=b?[...me,b]:me;let k;e[33]!==b||e[34]!==m||e[35]!==u||e[36]!==Q||e[37]!==le?(k=t=>{const i=F(Le(t??[])),f=v(i,ja),s=v(i,y=>{const N=Ua(Q,H=>m(H)===y.value);return N?{...y,userId:N.entityId}:b&&y.value===b.value?{...y,isCustom:!0}:y});le(u?f:f[0],u?s:s[0]),u||Ve("")},e[33]=b,e[34]=m,e[35]=u,e[36]=Q,e[37]=le,e[38]=k):k=e[38];let z;return e[39]!==ye||e[40]!==ue||e[41]!==fe||e[42]!==de||e[43]!==u||e[44]!==C||e[45]!==d||e[46]!==ne||e[47]!==S||e[48]!==ge||e[49]!==he||e[50]!==be||e[51]!==k?(z=r.jsx(ye,{placeholder:S,...d,multiple:u,isLoading:ge,isLoadingNext:ue,total:he,options:be,value:fe,onChange:k,searchValue:C,onSearch:Ve,onOpenChange:ne,endReached:de}),e[39]=ye,e[40]=ue,e[41]=fe,e[42]=de,e[43]=u,e[44]=C,e[45]=d,e[46]=ne,e[47]=S,e[48]=ge,e[49]=he,e[50]=be,e[51]=k,e[52]=z):z=e[52],z};function Fa(a){var e;return((e=a.scopedUsersV2)==null?void 0:e.count)??void 0}function La(a){var e;return F(v((e=a.scopedUsersV2)==null?void 0:e.edges,"node"))}function Ba(a){return a==null?void 0:a.id}function ja(a){return a.value}const Pt={title:"Fragments/BAIScopedUserSelect",component:na,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:"\n**BAIScopedUserSelect** — the user picker for admin and project-admin forms (ADR 0012). Built on `BAIComplexSelect`, paged through `scopedUsersV2`.\n\n- `scope` (required): the `UserScope` input. Admin pages pass the current domain from `useCurrentDomain()`; a project-admin page passes `{ project: [{ value: projectId }] }`.\n- `valuePropName`: `'email'` (default) or `'id'` — which field is the plain-key value. Only `'id'` runs the `uuid in` label-resolution query; with emails the key already is the label.\n- `filter` / `excludeInactive`: composed into a `UserV2Filter` through the schema's `AND` combinator, together with the debounced `email: { iContains }` search.\n- Needs a manager >= 26.9.0, where `scopedUsersV2` exists.\n\nSee `BAIComplexSelect.stories.tsx` for the underlying popup-body component with static options.\n        "}}},argTypes:{value:{control:!1},onChange:{control:!1},filter:{control:!1},scope:{control:!1},multiple:{control:{type:"boolean"}},excludeInactive:{control:{type:"boolean"}},valuePropName:{control:{type:"select"},options:["email","id"]}}},wa=[{id:"VXNlclYyOjE=",basicInfo:{email:"admin@example.com",fullName:"System Administrator"}},{id:"VXNlclYyOjI=",basicInfo:{email:"alice@example.com",fullName:"Alice Kim"}},{id:"VXNlclYyOjM=",basicInfo:{email:"bob@example.com",fullName:"Bob Lee"}},{id:"VXNlclYyOjQ=",basicInfo:{email:"carol@example.com",fullName:"Carol Park"}}],oa=a=>({count:a.length,edges:a.map(e=>({node:e}))}),Ka={Query:()=>({scopedUsersV2:oa(wa)})},Pa={Query:()=>({scopedUsersV2:oa([])})},Oa={domain:[{value:"5c3b5a9e-0000-4000-8000-0000000000d0"}]},p=({scope:a=Oa,initialValue:e=null,resolvers:l=Ka,...n})=>{const[o,c]=g.useState(e);return r.jsx(ha,{mockResolvers:l,children:r.jsx(na,{...n,scope:a,value:o,onChange:d=>c(d??null)})})},G={parameters:{docs:{description:{story:"A domain scope, as admin pages build from `useCurrentDomain()`: the users of that domain."}}},render:a=>r.jsx(p,{...a,label:"User",defaultOpen:!0})},Z={parameters:{docs:{description:{story:"A project scope, as the project-admin session page passes: the members of that project."}}},render:a=>r.jsx(p,{...a,label:"Owner",scope:{project:[{value:"5c3b5a9e-0000-4000-8000-000000000001"}]},defaultOpen:!0})},J={name:"Multiple Select",parameters:{docs:{description:{story:"Multi-selection: the value is an array of keys and the trigger lists the selected emails."}}},render:a=>r.jsx(p,{...a,label:"Users",multiple:!0,initialValue:["admin@example.com"]})},W={name:"Custom e-mail entry",parameters:{docs:{description:{story:"`allowCustomSelect` — an e-mail address typed in the search box that no listed user matches is offered as one more option; picking it makes the value that address and `onChange` marks it `isCustom`."}}},render:a=>r.jsx(p,{...a,label:"User",allowCustomSelect:!0,defaultOpen:!0})},ee={name:"Exclude Inactive Users",parameters:{docs:{description:{story:"`excludeInactive` composes `status: { equals: ACTIVE }` into the `UserV2Filter`."}}},render:a=>r.jsx(p,{...a,label:"User",excludeInactive:!0})},ae={name:"ID-valued",parameters:{docs:{description:{story:'`valuePropName="id"` — the plain-key value is the local user UUID, which is what `adminBulkAssignRole` and friends take. This is the only mode that runs the `uuid in` label-resolution query.'}}},render:a=>r.jsx(p,{...a,label:"User",valuePropName:"id"})},te={parameters:{docs:{description:{story:"Caller-side `isLoading`, which spins the trigger the same way the internal debounce and refetch pending states do."}}},render:a=>r.jsx(p,{...a,label:"User",isLoading:!0,isDisabled:!0})},se={parameters:{docs:{description:{story:"No users match the query — the popup shows the shared empty-state text."}}},render:a=>r.jsx(p,{...a,label:"User",resolvers:Pa,defaultOpen:!0})},re={parameters:{docs:{description:{story:"The error status a form item sets when its `required` rule fails."}}},render:a=>r.jsx(p,{...a,label:"User",status:{type:"error",message:"Please select users."}})};var Be,je,we;G.parameters={...G.parameters,docs:{...(Be=G.parameters)==null?void 0:Be.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'A domain scope, as admin pages build from \`useCurrentDomain()\`: the users of that domain.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" defaultOpen />
}`,...(we=(je=G.parameters)==null?void 0:je.docs)==null?void 0:we.source}}};var Ke,Pe,Oe;Z.parameters={...Z.parameters,docs:{...(Ke=Z.parameters)==null?void 0:Ke.docs,source:{originalSource:`{
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
}`,...(Oe=(Pe=Z.parameters)==null?void 0:Pe.docs)==null?void 0:Oe.source}}};var De,Ee,Te;J.parameters={...J.parameters,docs:{...(De=J.parameters)==null?void 0:De.docs,source:{originalSource:`{
  name: 'Multiple Select',
  parameters: {
    docs: {
      description: {
        story: 'Multi-selection: the value is an array of keys and the trigger lists the selected emails.'
      }
    }
  },
  render: args => <Sandbox {...args} label="Users" multiple initialValue={['admin@example.com']} />
}`,...(Te=(Ee=J.parameters)==null?void 0:Ee.docs)==null?void 0:Te.source}}};var $e,Re,qe;W.parameters={...W.parameters,docs:{...($e=W.parameters)==null?void 0:$e.docs,source:{originalSource:`{
  name: 'Custom e-mail entry',
  parameters: {
    docs: {
      description: {
        story: '\`allowCustomSelect\` — an e-mail address typed in the search box that no listed user matches is offered as one more option; picking it makes the value that address and \`onChange\` marks it \`isCustom\`.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" allowCustomSelect defaultOpen />
}`,...(qe=(Re=W.parameters)==null?void 0:Re.docs)==null?void 0:qe.source}}};var Me,Qe,_e;ee.parameters={...ee.parameters,docs:{...(Me=ee.parameters)==null?void 0:Me.docs,source:{originalSource:`{
  name: 'Exclude Inactive Users',
  parameters: {
    docs: {
      description: {
        story: '\`excludeInactive\` composes \`status: { equals: ACTIVE }\` into the \`UserV2Filter\`.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" excludeInactive />
}`,...(_e=(Qe=ee.parameters)==null?void 0:Qe.docs)==null?void 0:_e.source}}};var Xe,Ye,ze;ae.parameters={...ae.parameters,docs:{...(Xe=ae.parameters)==null?void 0:Xe.docs,source:{originalSource:`{
  name: 'ID-valued',
  parameters: {
    docs: {
      description: {
        story: '\`valuePropName="id"\` — the plain-key value is the local user UUID, which is what \`adminBulkAssignRole\` and friends take. This is the only mode that runs the \`uuid in\` label-resolution query.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" valuePropName="id" />
}`,...(ze=(Ye=ae.parameters)==null?void 0:Ye.docs)==null?void 0:ze.source}}};var He,Ge,Ze;te.parameters={...te.parameters,docs:{...(He=te.parameters)==null?void 0:He.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Caller-side \`isLoading\`, which spins the trigger the same way the internal debounce and refetch pending states do.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" isLoading isDisabled />
}`,...(Ze=(Ge=te.parameters)==null?void 0:Ge.docs)==null?void 0:Ze.source}}};var Je,We,ea;se.parameters={...se.parameters,docs:{...(Je=se.parameters)==null?void 0:Je.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'No users match the query — the popup shows the shared empty-state text.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" resolvers={emptyResolvers} defaultOpen />
}`,...(ea=(We=se.parameters)==null?void 0:We.docs)==null?void 0:ea.source}}};var aa,ta,sa;re.parameters={...re.parameters,docs:{...(aa=re.parameters)==null?void 0:aa.docs,source:{originalSource:`{
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
}`,...(sa=(ta=re.parameters)==null?void 0:ta.docs)==null?void 0:sa.source}}};const Ot=["DomainScope","ProjectMembers","Multiple","CustomSelect","ExcludeInactive","IdValued","Loading","Empty","Error"];export{W as CustomSelect,G as DomainScope,se as Empty,re as Error,ee as ExcludeInactive,ae as IdValued,te as Loading,J as Multiple,Z as ProjectMembers,Ot as __namedExportsOrder,Pt as default};
