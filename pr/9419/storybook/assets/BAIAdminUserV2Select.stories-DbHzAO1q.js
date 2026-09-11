import{c as We,a as Ze,r as p,j as o}from"./iframe-Di_PyoZN.js";import{R as ea}from"./RelayResolver-BZADa6XV.js";import{t as aa}from"./index-B0mD3TUl.js";import{u as ta,a as ra}from"./useDebounce-HqQ8pi9D.js";import{a as la}from"./index-Aa_YhmyN.js";import{B as na,c as be}from"./BAIComplexSelect-C0kexQdC.js";import{r as sa}from"./index-CZH9siqj.js";import{u as Ve}from"./useControllableValue-ZSal16_U.js";import{c as Y}from"./compact-CU4PNV0P.js";import{m as de}from"./map-BxAlYBKC.js";import{f as ia}from"./find-BWsj3rHS.js";import"./preload-helper-Dp1pzeXC.js";import"./index-BouaLDPR.js";import"./isNumber-CS7XNwmk.js";import"./toString-DYTqPDxM.js";import"./isSymbol-DCLwSwJh.js";import"./filter-Dm9TQfsx.js";import"./_baseEach-D7t-04yI.js";import"./get-F-e5P8Ix.js";import"./_baseGet-BU7DFjYE.js";import"./identity-DKeuBCMA.js";import"./isEmpty-LgveYEWr.js";import"./useEventNotStable-eI3dGewu.js";import"./_baseUniq-AeDLH_CN.js";import"./_baseIndexOf-Be9UPhX8.js";import"./_baseFindIndex-Cj99RmFE.js";import"./noop-DX6rZLP_.js";import"./toFinite-t37BQD6m.js";import"./_trimmedEndIndex-DuQxD0U0.js";import"./useConnectedBAIClient-B1mDCJCI.js";import"./reactQueryAlias-Bvq3YSVv.js";import"./useIndicator-BUKy3c46.js";import"./isRenderable-BUV0eL6r.js";import"./clamp-FGdYL4sd.js";import"./_baseClamp-DVUOCJN_.js";import"./_baseSlice-F8doVSIJ.js";import"./toInteger-DLlBDMcC.js";import"./usePopover-Acv3TXJH.js";import"./useDevWarning-S9pb7TNH.js";import"./rtlStyles-T4i24HtE.js";import"./useResolvedRequired-Bgh7dt-i.js";import"./composeEventHandlers-BolWE7qY.js";import"./InputClearButton-CI2FOOWI.js";import"./Divider-xjrcqG86.js";import"./some-CtQJ-TsP.js";import"./Token-DpKvQ5ur.js";import"./SelectorOption-BiTgd2bT.js";import"./Item-BejMBVER.js";const $e=(function(){var a={defaultValue:null,kind:"LocalArgument",name:"limit"},e={defaultValue:null,kind:"LocalArgument",name:"selectedFilter"},r={defaultValue:null,kind:"LocalArgument",name:"skipSelected"},n=[{condition:"skipSelected",kind:"Condition",passingValue:!1,selections:[{alias:null,args:[{kind:"Variable",name:"filter",variableName:"selectedFilter"},{kind:"Variable",name:"limit",variableName:"limit"}],concreteType:"UserV2Connection",kind:"LinkedField",name:"adminUsersV2",plural:!1,selections:[{alias:null,args:null,concreteType:"UserV2Edge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"UserV2",kind:"LinkedField",name:"node",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null},{alias:null,args:null,concreteType:"UserV2BasicInfo",kind:"LinkedField",name:"basicInfo",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"email",storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}]}];return{fragment:{argumentDefinitions:[a,e,r],kind:"Fragment",metadata:null,name:"BAIAdminUserV2SelectValueQuery",selections:n,type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[e,a,r],kind:"Operation",name:"BAIAdminUserV2SelectValueQuery",selections:n},params:{cacheID:"0a609f6f54a1625212fe62168903b81c",id:null,metadata:{},name:"BAIAdminUserV2SelectValueQuery",operationKind:"query",text:`query BAIAdminUserV2SelectValueQuery(
  $selectedFilter: UserV2Filter
  $limit: Int!
  $skipSelected: Boolean!
) {
  adminUsersV2(filter: $selectedFilter, limit: $limit) @skip(if: $skipSelected) {
    edges {
      node {
        id
        basicInfo {
          email
        }
      }
    }
  }
}
`}}})();$e.hash="77a6ea8cc05760ecebb6a139b466b99f";const Qe=(function(){var a={defaultValue:null,kind:"LocalArgument",name:"filter"},e={defaultValue:null,kind:"LocalArgument",name:"limit"},r={defaultValue:null,kind:"LocalArgument",name:"offset"},n={defaultValue:null,kind:"LocalArgument",name:"orderBy"},c=[{alias:null,args:[{kind:"Variable",name:"filter",variableName:"filter"},{kind:"Variable",name:"limit",variableName:"limit"},{kind:"Variable",name:"offset",variableName:"offset"},{kind:"Variable",name:"orderBy",variableName:"orderBy"}],concreteType:"UserV2Connection",kind:"LinkedField",name:"adminUsersV2",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"count",storageKey:null},{alias:null,args:null,concreteType:"UserV2Edge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"UserV2",kind:"LinkedField",name:"node",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null},{alias:null,args:null,concreteType:"UserV2BasicInfo",kind:"LinkedField",name:"basicInfo",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"username",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"email",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"fullName",storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:[a,e,r,n],kind:"Fragment",metadata:null,name:"BAIAdminUserV2SelectPaginatedQuery",selections:c,type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[r,e,a,n],kind:"Operation",name:"BAIAdminUserV2SelectPaginatedQuery",selections:c},params:{cacheID:"368e3f7b0cad178c48a17c2f55fa6b49",id:null,metadata:{},name:"BAIAdminUserV2SelectPaginatedQuery",operationKind:"query",text:`query BAIAdminUserV2SelectPaginatedQuery(
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
        basicInfo {
          username
          email
          fullName
        }
      }
    }
  }
}
`}}})();Qe.hash="2f169ca5be6fb0d96fbdd2d14c0ea2bb";const ue=a=>{const e=Y(a);return e.length===0?null:e.length===1?e[0]:{AND:e}},Me=a=>{"use memo";var ye;const e=We.c(51);let r,n,c,s,V,v,k;e[0]!==a?({filter:r,excludeInactive:V,valuePropName:v,multiple:k,isLoading:n,ref:c,...s}=a,e[0]=a,e[1]=r,e[2]=n,e[3]=c,e[4]=s,e[5]=V,e[6]=v,e[7]=k):(r=e[1],n=e[2],c=e[3],s=e[4],V=e[5],v=e[6],k=e[7]);const _e=V===void 0?!1:V,x=v===void 0?"email":v,u=k===void 0?!1:k,{t:z}=Ze();let U;e[8]===Symbol.for("react.memo_cache_sentinel")?(U={valuePropName:"value",trigger:"onChange"},e[8]=U):U=e[8];const[me,H]=Ve(s,U);let A;e[9]===Symbol.for("react.memo_cache_sentinel")?(A={valuePropName:"open",trigger:"onOpenChange",defaultValuePropName:"defaultOpen"},e[9]=A):A=e[9];const[Xe,G]=Ve(s,A),Ye=p.useDeferredValue(Xe),[S,ze]=p.useState(""),J=ta(S),[He,pe]=p.useTransition(),[Ge,N]=la(),g=p.useDeferredValue(Ge),fe=ue([_e?{status:{equals:"ACTIVE"}}:null,r]),ge=p.useDeferredValue(me),B=Y(be(ge??[])),W=x==="id"&&B.length>0;let F;e[10]===Symbol.for("react.memo_cache_sentinel")?(F=$e,e[10]=F):F=e[10];const Z=W?"store-or-network":"store-only";let L;e[11]!==g||e[12]!==Z?(L={fetchPolicy:Z,fetchKey:g},e[11]=g,e[12]=Z,e[13]=L):L=e[13];const{adminUsersV2:d}=sa.useLazyLoadQuery(F,{selectedFilter:W?ue([{uuid:{in:B}},fe]):null,limit:Math.max(B.length,1),skipSelected:!W},L);let K,P;e[14]===Symbol.for("react.memo_cache_sentinel")?(P=Qe,K={limit:10},e[14]=K,e[15]=P):(K=e[14],P=e[15]);const ee=Ye?"network-only":"store-only";let C;e[16]!==g||e[17]!==ee?(C={fetchPolicy:ee,fetchKey:g},e[16]=g,e[17]=ee,e[18]=C):C=e[18];let D;e[19]===Symbol.for("react.memo_cache_sentinel")?(D={getTotal:oa,getItem:da,getId:ua},e[19]=D):D=e[19];const{paginationData:ae,result:Je,loadNext:te,isLoadingNext:re}=ra(P,K,{filter:ue([fe,J?{email:{iContains:J}}:null]),orderBy:[{field:"EMAIL",direction:"ASC"}]},C,D);let E,w;e[20]!==N?(E=()=>({refetch:()=>{pe(()=>{N()})}}),w=[N,pe],e[20]=N,e[21]=E,e[22]=w):(E=e[21],w=e[22]),p.useImperativeHandle(c,E,w);let T;e[23]!==x?(T=l=>{var t;if(l)return x==="id"?aa(l.id):((t=l.basicInfo)==null?void 0:t.email)??void 0},e[23]=x,e[24]=T):T=e[24];const m=T;let O;if(e[25]!==m||e[26]!==ae){let l;e[28]!==m?(l=t=>{var b,I;const i=m(t);return i?{value:i,label:((b=t==null?void 0:t.basicInfo)==null?void 0:b.email)??i,description:((I=t==null?void 0:t.basicInfo)==null?void 0:I.fullName)??void 0}:null},e[28]=m,e[29]=l):l=e[29],O=Y(de(ae,l)),e[25]=m,e[26]=ae,e[27]=O}else O=e[27];const le=O;let ne;e:{let l;e[30]!==m||e[31]!==(d==null?void 0:d.edges)?(l=i=>{var I,he;const b=ia(d==null?void 0:d.edges,ce=>m(ce==null?void 0:ce.node)===i);return{label:((he=(I=b==null?void 0:b.node)==null?void 0:I.basicInfo)==null?void 0:he.email)??i,value:i}},e[30]=m,e[31]=d==null?void 0:d.edges,e[32]=l):l=e[32];const t=de(B,l);if(u){ne=t;break e}ne=t[0]??null}const se=ne;let y;e[33]!==z?(y=z("comp:BAIUserSelect.SelectUser"),e[33]=z,e[34]=y):y=e[34];const ie=n||me!==ge||S!==J||He,oe=((ye=Je.adminUsersV2)==null?void 0:ye.count)??void 0;let h;e[35]!==u||e[36]!==H?(h=l=>{const t=Y(be(l??[])),i=de(t,ma);H(u?i:i[0],u?t:t[0])},e[35]=u,e[36]=H,e[37]=h):h=e[37];let R;return e[38]!==re||e[39]!==se||e[40]!==te||e[41]!==u||e[42]!==le||e[43]!==S||e[44]!==s||e[45]!==G||e[46]!==y||e[47]!==ie||e[48]!==oe||e[49]!==h?(R=o.jsx(na,{placeholder:y,...s,multiple:u,isLoading:ie,isLoadingNext:re,total:oe,options:le,value:se,onChange:h,searchValue:S,onSearch:ze,onOpenChange:G,endReached:te}),e[38]=re,e[39]=se,e[40]=te,e[41]=u,e[42]=le,e[43]=S,e[44]=s,e[45]=G,e[46]=y,e[47]=ie,e[48]=oe,e[49]=h,e[50]=R):R=e[50],R};function oa(a){var e;return((e=a.adminUsersV2)==null?void 0:e.count)??void 0}function ca(a){return a==null?void 0:a.node}function da(a){var e,r;return(r=(e=a.adminUsersV2)==null?void 0:e.edges)==null?void 0:r.map(ca)}function ua(a){return a==null?void 0:a.id}function ma(a){return a.value}const ct={title:"Fragments/BAIAdminUserV2Select",component:Me,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:"\n**BAIAdminUserV2Select** — superadmin-only user picker over `adminUsersV2` (managers >= 26.2.0). Built on `BAIComplexSelect`.\n\n- `valuePropName`: `'email'` (default) or `'id'` — which field is the plain-key value. Only `'id'` runs the `uuid in` label-resolution query; with emails the key already is the label.\n- `filter` / `excludeInactive`: composed into a `UserV2Filter` through the schema's `AND` combinator, together with the debounced `email: { iContains }` search.\n- Pagination is offset mode (`limit`/`offset`) — the V2 connections reject a mix with `first`/`after` at runtime.\n\nSee `BAIComplexSelect.stories.tsx` for the underlying popup-body component with static options.\n        "}}},argTypes:{value:{control:!1},onChange:{control:!1},filter:{control:!1},multiple:{control:{type:"boolean"}},excludeInactive:{control:{type:"boolean"}},valuePropName:{control:{type:"select"},options:["email","id"]}}},ve=[{id:"VXNlclYyOjE=",basicInfo:{username:"admin",email:"admin@example.com",fullName:"System Administrator"}},{id:"VXNlclYyOjI=",basicInfo:{username:"alice",email:"alice@example.com",fullName:"Alice Kim"}},{id:"VXNlclYyOjM=",basicInfo:{username:"bob",email:"bob@example.com",fullName:"Bob Lee"}},{id:"VXNlclYyOjQ=",basicInfo:{username:"carol",email:"carol@example.com",fullName:"Carol Park"}}],pa={Query:()=>({adminUsersV2:{count:ve.length,edges:ve.map(a=>({node:a}))}})},fa={Query:()=>({adminUsersV2:{count:0,edges:[]}})},f=({initialValue:a=null,resolvers:e=pa,...r})=>{const[n,c]=p.useState(a);return o.jsx(ea,{mockResolvers:e,children:o.jsx(Me,{...r,value:n,onChange:s=>c(s??null)})})},j={name:"Single Select",parameters:{docs:{description:{story:'Single user select, `valuePropName="email"` (default).'}}},render:a=>o.jsx(f,{...a,label:"User"})},q={name:"Multiple Select",parameters:{docs:{description:{story:"Multi-selection: the value is an array of keys and the trigger lists the selected emails."}}},render:a=>o.jsx(f,{...a,label:"Users",multiple:!0,initialValue:["admin@example.com"]})},$={name:"Exclude Inactive Users",parameters:{docs:{description:{story:"`excludeInactive` composes `status: { equals: ACTIVE }` into the `UserV2Filter`."}}},render:a=>o.jsx(f,{...a,label:"User",excludeInactive:!0})},Q={name:"ID-valued",parameters:{docs:{description:{story:'`valuePropName="id"` — the plain-key value is the local user UUID, which is what `adminBulkAssignRole` and friends take. This is the only mode that runs the `uuid in` label-resolution query.'}}},render:a=>o.jsx(f,{...a,label:"User",valuePropName:"id"})},M={parameters:{docs:{description:{story:"Caller-side `isLoading`, which spins the trigger the same way the internal debounce and refetch pending states do."}}},render:a=>o.jsx(f,{...a,label:"User",isLoading:!0,isDisabled:!0})},_={parameters:{docs:{description:{story:"No users match the query — the popup shows the shared empty-state text."}}},render:a=>o.jsx(f,{...a,label:"User",resolvers:fa,defaultOpen:!0})},X={parameters:{docs:{description:{story:"The error status a form item sets when its `required` rule fails."}}},render:a=>o.jsx(f,{...a,label:"User",status:{type:"error",message:"Please select users."}})};var ke,Se,Ie;j.parameters={...j.parameters,docs:{...(ke=j.parameters)==null?void 0:ke.docs,source:{originalSource:`{
  name: 'Single Select',
  parameters: {
    docs: {
      description: {
        story: 'Single user select, \`valuePropName="email"\` (default).'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" />
}`,...(Ie=(Se=j.parameters)==null?void 0:Se.docs)==null?void 0:Ie.source}}};var xe,Ue,Ae;q.parameters={...q.parameters,docs:{...(xe=q.parameters)==null?void 0:xe.docs,source:{originalSource:`{
  name: 'Multiple Select',
  parameters: {
    docs: {
      description: {
        story: 'Multi-selection: the value is an array of keys and the trigger lists the selected emails.'
      }
    }
  },
  render: args => <Sandbox {...args} label="Users" multiple initialValue={['admin@example.com']} />
}`,...(Ae=(Ue=q.parameters)==null?void 0:Ue.docs)==null?void 0:Ae.source}}};var Ne,Be,Fe;$.parameters={...$.parameters,docs:{...(Ne=$.parameters)==null?void 0:Ne.docs,source:{originalSource:`{
  name: 'Exclude Inactive Users',
  parameters: {
    docs: {
      description: {
        story: '\`excludeInactive\` composes \`status: { equals: ACTIVE }\` into the \`UserV2Filter\`.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" excludeInactive />
}`,...(Fe=(Be=$.parameters)==null?void 0:Be.docs)==null?void 0:Fe.source}}};var Le,Ke,Pe;Q.parameters={...Q.parameters,docs:{...(Le=Q.parameters)==null?void 0:Le.docs,source:{originalSource:`{
  name: 'ID-valued',
  parameters: {
    docs: {
      description: {
        story: '\`valuePropName="id"\` — the plain-key value is the local user UUID, which is what \`adminBulkAssignRole\` and friends take. This is the only mode that runs the \`uuid in\` label-resolution query.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" valuePropName="id" />
}`,...(Pe=(Ke=Q.parameters)==null?void 0:Ke.docs)==null?void 0:Pe.source}}};var Ce,De,Ee;M.parameters={...M.parameters,docs:{...(Ce=M.parameters)==null?void 0:Ce.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Caller-side \`isLoading\`, which spins the trigger the same way the internal debounce and refetch pending states do.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" isLoading isDisabled />
}`,...(Ee=(De=M.parameters)==null?void 0:De.docs)==null?void 0:Ee.source}}};var we,Te,Oe;_.parameters={..._.parameters,docs:{...(we=_.parameters)==null?void 0:we.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'No users match the query — the popup shows the shared empty-state text.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" resolvers={emptyResolvers} defaultOpen />
}`,...(Oe=(Te=_.parameters)==null?void 0:Te.docs)==null?void 0:Oe.source}}};var Re,je,qe;X.parameters={...X.parameters,docs:{...(Re=X.parameters)==null?void 0:Re.docs,source:{originalSource:`{
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
}`,...(qe=(je=X.parameters)==null?void 0:je.docs)==null?void 0:qe.source}}};const dt=["Basic","Multiple","ExcludeInactive","IdValued","Loading","Empty","Error"];export{j as Basic,_ as Empty,X as Error,$ as ExcludeInactive,Q as IdValued,M as Loading,q as Multiple,dt as __namedExportsOrder,ct as default};
