import{c as sn,a as on,r as b,j as p,f as cn}from"./iframe-DWWLUtWo.js";import{R as dn}from"./RelayResolver-G2tI7JJX.js";import{t as mn}from"./index-BAj3TGUv.js";import{u as un,a as pn}from"./useDebounce-BTFkoXAX.js";import{a as fn}from"./index-BWIhcUMC.js";import{B as yn,c as Se}from"./BAIComplexSelect-DdzNDcXD.js";import{u as gn}from"./useConnectedBAIClient-CtLntrKP.js";import{r as hn}from"./index-BHl3wxYY.js";import{u as xe}from"./useControllableValue-CvgF5dJV.js";import{c as B}from"./compact-CU4PNV0P.js";import{m as L}from"./map-BqOqRHr8.js";import"./preload-helper-Dp1pzeXC.js";import"./index-CfORvJNJ.js";import"./isNumber-DfrYrS3l.js";import"./toString-6Dc7GaOC.js";import"./isSymbol-BGJNsGh-.js";import"./filter-DSHj9h2P.js";import"./_baseEach-DBO5yza1.js";import"./get-CfAsOfuT.js";import"./_baseGet-XCA5lLcM.js";import"./identity-DKeuBCMA.js";import"./isEmpty-yx8Shw-g.js";import"./useEventNotStable-Czz9IKT8.js";import"./uniqBy-DNIgJlqC.js";import"./_baseUniq-BTX4b8h1.js";import"./_baseIndexOf-Be9UPhX8.js";import"./_baseFindIndex-Cj99RmFE.js";import"./noop-DX6rZLP_.js";import"./toFinite-D89EOtjp.js";import"./_trimmedEndIndex-DuQxD0U0.js";import"./reactQueryAlias-Dg5zES1s.js";import"./useIndicator-DPCB63It.js";import"./isRenderable-BUV0eL6r.js";import"./clamp-Bhh6533E.js";import"./_baseClamp-DVUOCJN_.js";import"./_baseSlice-F8doVSIJ.js";import"./toInteger-AEi5_3a7.js";import"./InputClearButton-FajJCXLx.js";import"./useResolvedRequired-BNWMW5Me.js";import"./useDevWarning-CU4qyNPH.js";import"./usePopover-C4oOcxcJ.js";import"./rtlStyles-T4i24HtE.js";import"./composeEventHandlers-BolWE7qY.js";import"./Divider-DOJIXJKu.js";import"./some-D1alv3Wx.js";import"./Token-_ninso_h.js";import"./SelectorOption-DXQTMRWy.js";import"./Item-YbGTgd_W.js";/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */const he=(n,e="AND")=>{const a=n.filter(t=>!!t);return a.length===0?null:a.length===1&&e!=="NOT"?a[0]:{[e]:a}},en=(function(){var n={defaultValue:null,kind:"LocalArgument",name:"domainName"},e={defaultValue:null,kind:"LocalArgument",name:"limit"},a={defaultValue:null,kind:"LocalArgument",name:"projectId"},t={defaultValue:null,kind:"LocalArgument",name:"selectedFilter"},r={defaultValue:null,kind:"LocalArgument",name:"useAdmin"},c={defaultValue:null,kind:"LocalArgument",name:"useDomain"},l={defaultValue:null,kind:"LocalArgument",name:"useProject"},d={kind:"Variable",name:"filter",variableName:"selectedFilter"},m={kind:"Variable",name:"limit",variableName:"limit"},o=[{alias:null,args:null,concreteType:"UserV2Edge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"UserV2",kind:"LinkedField",name:"node",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null},{alias:null,args:null,concreteType:"UserV2BasicInfo",kind:"LinkedField",name:"basicInfo",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"email",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"fullName",storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}],y=[{condition:"useAdmin",kind:"Condition",passingValue:!0,selections:[{alias:null,args:[d,m],concreteType:"UserV2Connection",kind:"LinkedField",name:"adminUsersV2",plural:!1,selections:o,storageKey:null}]},{condition:"useDomain",kind:"Condition",passingValue:!0,selections:[{alias:null,args:[d,m,{fields:[{kind:"Variable",name:"domainName",variableName:"domainName"}],kind:"ObjectValue",name:"scope"}],concreteType:"UserV2Connection",kind:"LinkedField",name:"domainUsersV2",plural:!1,selections:o,storageKey:null}]},{condition:"useProject",kind:"Condition",passingValue:!0,selections:[{alias:null,args:[d,m,{fields:[{kind:"Variable",name:"projectId",variableName:"projectId"}],kind:"ObjectValue",name:"scope"}],concreteType:"UserV2Connection",kind:"LinkedField",name:"projectUsersV2",plural:!1,selections:o,storageKey:null}]}];return{fragment:{argumentDefinitions:[n,e,a,t,r,c,l],kind:"Fragment",metadata:null,name:"BAIUserSelectValueQuery",selections:y,type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[t,e,n,a,r,c,l],kind:"Operation",name:"BAIUserSelectValueQuery",selections:y},params:{cacheID:"9b690ca1194feda8417c81a35c792d6f",id:null,metadata:{},name:"BAIUserSelectValueQuery",operationKind:"query",text:`query BAIUserSelectValueQuery(
  $selectedFilter: UserV2Filter
  $limit: Int!
  $domainName: String!
  $projectId: UUID!
  $useAdmin: Boolean!
  $useDomain: Boolean!
  $useProject: Boolean!
) {
  adminUsersV2(filter: $selectedFilter, limit: $limit) @include(if: $useAdmin) {
    edges {
      node {
        id
        basicInfo {
          email
          fullName
        }
      }
    }
  }
  domainUsersV2(scope: {domainName: $domainName}, filter: $selectedFilter, limit: $limit) @include(if: $useDomain) {
    edges {
      node {
        id
        basicInfo {
          email
          fullName
        }
      }
    }
  }
  projectUsersV2(scope: {projectId: $projectId}, filter: $selectedFilter, limit: $limit) @include(if: $useProject) {
    edges {
      node {
        id
        basicInfo {
          email
          fullName
        }
      }
    }
  }
}
`}}})();en.hash="b7b40edc043c69fd6849506e1ad90da9";const nn=(function(){var n={defaultValue:null,kind:"LocalArgument",name:"domainName"},e={defaultValue:null,kind:"LocalArgument",name:"filter"},a={defaultValue:null,kind:"LocalArgument",name:"limit"},t={defaultValue:null,kind:"LocalArgument",name:"offset"},r={defaultValue:null,kind:"LocalArgument",name:"orderBy"},c={defaultValue:null,kind:"LocalArgument",name:"projectId"},l={defaultValue:null,kind:"LocalArgument",name:"useAdmin"},d={defaultValue:null,kind:"LocalArgument",name:"useDomain"},m={defaultValue:null,kind:"LocalArgument",name:"useProject"},o={kind:"Variable",name:"filter",variableName:"filter"},y={kind:"Variable",name:"limit",variableName:"limit"},g={kind:"Variable",name:"offset",variableName:"offset"},u={kind:"Variable",name:"orderBy",variableName:"orderBy"},v=[{alias:null,args:null,kind:"ScalarField",name:"count",storageKey:null},{alias:null,args:null,concreteType:"UserV2Edge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"UserV2",kind:"LinkedField",name:"node",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null},{alias:null,args:null,concreteType:"UserV2BasicInfo",kind:"LinkedField",name:"basicInfo",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"email",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"fullName",storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}],x=[{condition:"useAdmin",kind:"Condition",passingValue:!0,selections:[{alias:null,args:[o,y,g,u],concreteType:"UserV2Connection",kind:"LinkedField",name:"adminUsersV2",plural:!1,selections:v,storageKey:null}]},{condition:"useDomain",kind:"Condition",passingValue:!0,selections:[{alias:null,args:[o,y,g,u,{fields:[{kind:"Variable",name:"domainName",variableName:"domainName"}],kind:"ObjectValue",name:"scope"}],concreteType:"UserV2Connection",kind:"LinkedField",name:"domainUsersV2",plural:!1,selections:v,storageKey:null}]},{condition:"useProject",kind:"Condition",passingValue:!0,selections:[{alias:null,args:[o,y,g,u,{fields:[{kind:"Variable",name:"projectId",variableName:"projectId"}],kind:"ObjectValue",name:"scope"}],concreteType:"UserV2Connection",kind:"LinkedField",name:"projectUsersV2",plural:!1,selections:v,storageKey:null}]}];return{fragment:{argumentDefinitions:[n,e,a,t,r,c,l,d,m],kind:"Fragment",metadata:null,name:"BAIUserSelectPaginatedQuery",selections:x,type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[t,a,e,r,n,c,l,d,m],kind:"Operation",name:"BAIUserSelectPaginatedQuery",selections:x},params:{cacheID:"b55cfe106012b73591f9bb622f5d9ff6",id:null,metadata:{},name:"BAIUserSelectPaginatedQuery",operationKind:"query",text:`query BAIUserSelectPaginatedQuery(
  $offset: Int!
  $limit: Int!
  $filter: UserV2Filter
  $orderBy: [UserV2OrderBy!]
  $domainName: String!
  $projectId: UUID!
  $useAdmin: Boolean!
  $useDomain: Boolean!
  $useProject: Boolean!
) {
  adminUsersV2(offset: $offset, limit: $limit, filter: $filter, orderBy: $orderBy) @include(if: $useAdmin) {
    count
    edges {
      node {
        id
        basicInfo {
          email
          fullName
        }
      }
    }
  }
  domainUsersV2(scope: {domainName: $domainName}, offset: $offset, limit: $limit, filter: $filter, orderBy: $orderBy) @include(if: $useDomain) {
    count
    edges {
      node {
        id
        basicInfo {
          email
          fullName
        }
      }
    }
  }
  projectUsersV2(scope: {projectId: $projectId}, offset: $offset, limit: $limit, filter: $filter, orderBy: $orderBy) @include(if: $useProject) {
    count
    edges {
      node {
        id
        basicInfo {
          email
          fullName
        }
      }
    }
  }
}
`}}})();nn.hash="774c356d5c02b46e6dcd3b1c92287d87";const bn="00000000-0000-0000-0000-000000000000",Vn=n=>n.adminUsersV2??n.domainUsersV2??n.projectUsersV2,Ae=n=>{var e;return B(L((e=Vn(n))==null?void 0:e.edges,a=>{var t,r;return a!=null&&a.node?{id:a.node.id,email:(t=a.node.basicInfo)==null?void 0:t.email,fullName:(r=a.node.basicInfo)==null?void 0:r.fullName}:null}))},$e=n=>{var e;return((e=n.adminUsersV2??n.domainUsersV2??n.projectUsersV2)==null?void 0:e.count)??void 0},an=n=>{"use memo";const e=sn.c(54);let a,t,r,c,l,d,m,o;e[0]!==n?({scope:c,filter:a,excludeInactive:d,valuePropName:m,multiple:o,isLoading:t,ref:r,...l}=n,e[0]=n,e[1]=a,e[2]=t,e[3]=r,e[4]=c,e[5]=l,e[6]=d,e[7]=m,e[8]=o):(a=e[1],t=e[2],r=e[3],c=e[4],l=e[5],d=e[6],m=e[7],o=e[8]);const y=d===void 0?!1:d,g=m===void 0?"email":m,u=o===void 0?!1:o,{t:v}=on(),x=gn(),k=c??(x.is_superadmin?{type:"admin"}:{type:"domain",domainName:x._config.domainName}),A={useAdmin:k.type==="admin",useDomain:k.type==="domain",useProject:k.type==="project",domainName:k.type==="domain"?k.domainName:"",projectId:k.type==="project"?k.projectId:bn};let C;e[9]===Symbol.for("react.memo_cache_sentinel")?(C={valuePropName:"value",trigger:"onChange"},e[9]=C):C=e[9];const[Ve,te]=xe(l,C);let F;e[10]===Symbol.for("react.memo_cache_sentinel")?(F={valuePropName:"open",trigger:"onOpenChange",defaultValuePropName:"defaultOpen"},e[10]=F):F=e[10];const[ve,le]=xe(l,F),ke=b.useDeferredValue(ve),[$,re]=b.useState(""),se=un($),[tn,Ie]=b.useTransition(),[ln,D]=fn(),I=b.useDeferredValue(ln),Ue=he([y?{status:{equals:"ACTIVE"}}:null,a]),je=b.useDeferredValue(Ve),K=B(Se(je??[])),P=g==="id"&&K.length>0;let O;e[11]===Symbol.for("react.memo_cache_sentinel")?(O=en,e[11]=O):O=e[11];const oe=P?"store-or-network":"store-only";let w;e[12]!==I||e[13]!==oe?(w={fetchPolicy:oe,fetchKey:I},e[12]=I,e[13]=oe,e[14]=w):w=e[14];const rn=hn.useLazyLoadQuery(O,{...A,useAdmin:P&&A.useAdmin,useDomain:P&&A.useDomain,useProject:P&&A.useProject,selectedFilter:P?he([{uuid:{in:K}},Ue]):null,limit:Math.max(K.length,1)},w);let T,E;e[15]===Symbol.for("react.memo_cache_sentinel")?(E=nn,T={limit:10},e[15]=T,e[16]=E):(T=e[15],E=e[16]);const ie=ke?"network-only":"store-only";let R;e[17]!==I||e[18]!==ie?(R={fetchPolicy:ie,fetchKey:I},e[17]=I,e[18]=ie,e[19]=R):R=e[19];let q;e[20]===Symbol.for("react.memo_cache_sentinel")?(q={getTotal:$e,getItem:Ae,getId:vn},e[20]=q):q=e[20];const{paginationData:ce,result:de,loadNext:me,isLoadingNext:ue}=pn(E,T,{...A,filter:he([Ue,se?{email:{iContains:se}}:null]),orderBy:[{field:"EMAIL",direction:"ASC"}]},R,q);let Q,M;e[21]!==D?(Q=()=>({refetch:()=>{Ie(()=>{D()})}}),M=[D,Ie],e[21]=D,e[22]=Q,e[23]=M):(Q=e[22],M=e[23]),b.useImperativeHandle(r,Q,M);let _;e[24]!==g?(_=s=>{if(s)return g==="id"?mn(s.id):s.email??void 0},e[24]=g,e[25]=_):_=e[25];const h=_;let X;if(e[26]!==h||e[27]!==ce){let s;e[29]!==h?(s=i=>{const f=h(i);return f?{value:f,label:(i==null?void 0:i.email)??f,description:(i==null?void 0:i.fullName)??void 0}:null},e[29]=h,e[30]=s):s=e[30],X=B(L(ce,s)),e[26]=h,e[27]=ce,e[28]=X}else X=e[28];const pe=X;let fe;e:{let s;e[31]!==h?(s=S=>{const Ne=h(S);return Ne?[Ne,S.email]:null},e[31]=h,e[32]=s):s=e[32];const i=new Map(B(L(Ae(rn),s))),f=L(K,S=>({label:i.get(S)??S,value:S}));if(u){fe=f;break e}fe=f[0]??null}const ye=fe;let U;e[33]!==v?(U=v("comp:BAIUserSelect.SelectUser"),e[33]=v,e[34]=U):U=e[34];const ge=t||!!ve&&!ke||Ve!==je||$!==se||tn;let j;e[35]!==de?(j=$e(de),e[35]=de,e[36]=j):j=e[36];let N;e[37]!==u||e[38]!==te?(N=s=>{const i=B(Se(s??[])),f=L(i,kn);te(u?f:f[0],u?i:i[0])},e[37]=u,e[38]=te,e[39]=N):N=e[39];let Y;return e[40]!==ue||e[41]!==ye||e[42]!==me||e[43]!==u||e[44]!==pe||e[45]!==$||e[46]!==l||e[47]!==le||e[48]!==re||e[49]!==U||e[50]!==ge||e[51]!==j||e[52]!==N?(Y=p.jsx(yn,{placeholder:U,...l,multiple:u,isLoading:ge,isLoadingNext:ue,total:j,options:pe,value:ye,onChange:N,searchValue:$,onSearch:re,onOpenChange:le,endReached:me}),e[40]=ue,e[41]=ye,e[42]=me,e[43]=u,e[44]=pe,e[45]=$,e[46]=l,e[47]=le,e[48]=re,e[49]=U,e[50]=ge,e[51]=j,e[52]=N,e[53]=Y):Y=e[53],Y};function vn(n){return n==null?void 0:n.id}function kn(n){return n.value}const Va={title:"Fragments/BAIUserSelect",component:an,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:"\n**BAIUserSelect** — the user picker the admin and project-admin forms share. Built on `BAIComplexSelect`.\n\n- `scope`: `{ type: 'admin' }` (`adminUsersV2`), `{ type: 'domain', domainName }` (`domainUsersV2`) or `{ type: 'project', projectId }` (`projectUsersV2`). Omitted, it lists every user the caller may administer: all users for a super-admin, the caller's own domain otherwise.\n- `valuePropName`: `'email'` (default) or `'id'` — which field is the plain-key value. Only `'id'` runs the `uuid in` label-resolution query; with emails the key already is the label.\n- `filter` / `excludeInactive`: composed into a `UserV2Filter` through the schema's `AND` combinator, together with the debounced `email: { iContains }` search.\n- Needs a manager >= 26.2.0, where the three V2 connections exist.\n\nSee `BAIComplexSelect.stories.tsx` for the underlying popup-body component with static options.\n        "}}},argTypes:{value:{control:!1},onChange:{control:!1},filter:{control:!1},scope:{control:!1},multiple:{control:{type:"boolean"}},excludeInactive:{control:{type:"boolean"}},valuePropName:{control:{type:"select"},options:["email","id"]}}},be=[{id:"VXNlclYyOjE=",basicInfo:{email:"admin@example.com",fullName:"System Administrator"}},{id:"VXNlclYyOjI=",basicInfo:{email:"alice@example.com",fullName:"Alice Kim"}},{id:"VXNlclYyOjM=",basicInfo:{email:"bob@example.com",fullName:"Bob Lee"}},{id:"VXNlclYyOjQ=",basicInfo:{email:"carol@example.com",fullName:"Carol Park"}}],ae=n=>({count:n.length,edges:n.map(e=>({node:e}))}),In={Query:()=>({adminUsersV2:ae(be),domainUsersV2:ae(be),projectUsersV2:ae(be.slice(1,3))})},Un={Query:()=>({adminUsersV2:ae([])})},jn={is_superadmin:!0,_config:{domainName:"default"}},V=({initialValue:n=null,resolvers:e=In,...a})=>{const[t,r]=b.useState(n),c=b.useMemo(()=>Promise.resolve(jn),[]);return p.jsx(cn.Provider,{value:c,children:p.jsx(dn,{mockResolvers:e,children:p.jsx(an,{...a,value:t,onChange:l=>r(l??null)})})})},z={name:"Single Select",parameters:{docs:{description:{story:'Single user select, `valuePropName="email"` (default).'}}},render:n=>p.jsx(V,{...n,label:"User"})},H={name:"Multiple Select",parameters:{docs:{description:{story:"Multi-selection: the value is an array of keys and the trigger lists the selected emails."}}},render:n=>p.jsx(V,{...n,label:"Users",multiple:!0,initialValue:["admin@example.com"]})},G={name:"Project Scope",parameters:{docs:{description:{story:'`scope={{ type: "project", projectId }}` reads `projectUsersV2`, the members of one project — what a project admin may list.'}}},render:n=>p.jsx(V,{...n,label:"Owner",scope:{type:"project",projectId:"5c3b5a9e-0000-4000-8000-000000000001"},defaultOpen:!0})},J={name:"Exclude Inactive Users",parameters:{docs:{description:{story:"`excludeInactive` composes `status: { equals: ACTIVE }` into the `UserV2Filter`."}}},render:n=>p.jsx(V,{...n,label:"User",excludeInactive:!0})},W={name:"ID-valued",parameters:{docs:{description:{story:'`valuePropName="id"` — the plain-key value is the local user UUID, which is what `adminBulkAssignRole` and friends take. This is the only mode that runs the `uuid in` label-resolution query.'}}},render:n=>p.jsx(V,{...n,label:"User",valuePropName:"id"})},Z={parameters:{docs:{description:{story:"Caller-side `isLoading`, which spins the trigger the same way the internal debounce and refetch pending states do."}}},render:n=>p.jsx(V,{...n,label:"User",isLoading:!0,isDisabled:!0})},ee={parameters:{docs:{description:{story:"No users match the query — the popup shows the shared empty-state text."}}},render:n=>p.jsx(V,{...n,label:"User",resolvers:Un,defaultOpen:!0})},ne={parameters:{docs:{description:{story:"The error status a form item sets when its `required` rule fails."}}},render:n=>p.jsx(V,{...n,label:"User",status:{type:"error",message:"Please select users."}})};var Pe,Be,Le;z.parameters={...z.parameters,docs:{...(Pe=z.parameters)==null?void 0:Pe.docs,source:{originalSource:`{
  name: 'Single Select',
  parameters: {
    docs: {
      description: {
        story: 'Single user select, \`valuePropName="email"\` (default).'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" />
}`,...(Le=(Be=z.parameters)==null?void 0:Be.docs)==null?void 0:Le.source}}};var Ce,Fe,De;H.parameters={...H.parameters,docs:{...(Ce=H.parameters)==null?void 0:Ce.docs,source:{originalSource:`{
  name: 'Multiple Select',
  parameters: {
    docs: {
      description: {
        story: 'Multi-selection: the value is an array of keys and the trigger lists the selected emails.'
      }
    }
  },
  render: args => <Sandbox {...args} label="Users" multiple initialValue={['admin@example.com']} />
}`,...(De=(Fe=H.parameters)==null?void 0:Fe.docs)==null?void 0:De.source}}};var Ke,Oe,we;G.parameters={...G.parameters,docs:{...(Ke=G.parameters)==null?void 0:Ke.docs,source:{originalSource:`{
  name: 'Project Scope',
  parameters: {
    docs: {
      description: {
        story: '\`scope={{ type: "project", projectId }}\` reads \`projectUsersV2\`, the members of one project — what a project admin may list.'
      }
    }
  },
  render: args => <Sandbox {...args} label="Owner" scope={{
    type: 'project',
    projectId: '5c3b5a9e-0000-4000-8000-000000000001'
  }} defaultOpen />
}`,...(we=(Oe=G.parameters)==null?void 0:Oe.docs)==null?void 0:we.source}}};var Te,Ee,Re;J.parameters={...J.parameters,docs:{...(Te=J.parameters)==null?void 0:Te.docs,source:{originalSource:`{
  name: 'Exclude Inactive Users',
  parameters: {
    docs: {
      description: {
        story: '\`excludeInactive\` composes \`status: { equals: ACTIVE }\` into the \`UserV2Filter\`.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" excludeInactive />
}`,...(Re=(Ee=J.parameters)==null?void 0:Ee.docs)==null?void 0:Re.source}}};var qe,Qe,Me;W.parameters={...W.parameters,docs:{...(qe=W.parameters)==null?void 0:qe.docs,source:{originalSource:`{
  name: 'ID-valued',
  parameters: {
    docs: {
      description: {
        story: '\`valuePropName="id"\` — the plain-key value is the local user UUID, which is what \`adminBulkAssignRole\` and friends take. This is the only mode that runs the \`uuid in\` label-resolution query.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" valuePropName="id" />
}`,...(Me=(Qe=W.parameters)==null?void 0:Qe.docs)==null?void 0:Me.source}}};var _e,Xe,Ye;Z.parameters={...Z.parameters,docs:{...(_e=Z.parameters)==null?void 0:_e.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Caller-side \`isLoading\`, which spins the trigger the same way the internal debounce and refetch pending states do.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" isLoading isDisabled />
}`,...(Ye=(Xe=Z.parameters)==null?void 0:Xe.docs)==null?void 0:Ye.source}}};var ze,He,Ge;ee.parameters={...ee.parameters,docs:{...(ze=ee.parameters)==null?void 0:ze.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'No users match the query — the popup shows the shared empty-state text.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" resolvers={emptyResolvers} defaultOpen />
}`,...(Ge=(He=ee.parameters)==null?void 0:He.docs)==null?void 0:Ge.source}}};var Je,We,Ze;ne.parameters={...ne.parameters,docs:{...(Je=ne.parameters)==null?void 0:Je.docs,source:{originalSource:`{
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
}`,...(Ze=(We=ne.parameters)==null?void 0:We.docs)==null?void 0:Ze.source}}};const va=["Default","Multiple","ProjectScoped","ExcludeInactive","IdValued","Loading","Empty","Error"];export{z as Default,ee as Empty,ne as Error,J as ExcludeInactive,W as IdValued,Z as Loading,H as Multiple,G as ProjectScoped,va as __namedExportsOrder,Va as default};
