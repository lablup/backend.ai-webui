import{c as dn,a as un,r as I,j as m,f as mn}from"./iframe-D2WGCFc9.js";import{R as pn}from"./RelayResolver-GTn1CddT.js";import{t as fn}from"./index-Dgns22TE.js";import{u as gn,a as yn}from"./useDebounce-bBRCNxwB.js";import{a as bn}from"./index-dcwv73R0.js";import{B as hn,c as $e}from"./BAIComplexSelect-CBd2il_i.js";import{m as W}from"./BAIPropertyFilter-C9GnU4r8.js";import{u as Vn}from"./useConnectedBAIClient-CuTJAFbe.js";import{r as kn}from"./index-B2K4ETYm.js";import{u as Fe}from"./useControllableValue-BJsbhlGz.js";import{c as K}from"./compact-CU4PNV0P.js";import{m as L}from"./map-Dmpq1toe.js";import"./preload-helper-Dp1pzeXC.js";import"./index-Clxszk0-.js";import"./isNumber-CaRuv2zk.js";import"./toString-CxbSiysf.js";import"./isSymbol-BkdE_6CD.js";import"./filter-CIs-0TGs.js";import"./_baseEach-BuRig_g3.js";import"./get-BdXmbdS2.js";import"./_baseGet-uzCiscRf.js";import"./identity-DKeuBCMA.js";import"./isEmpty-cygWumt0.js";import"./useEventNotStable-BqB0etLm.js";import"./uniqBy-DumU3UFW.js";import"./_baseUniq-BI9hxODi.js";import"./_baseIndexOf-Be9UPhX8.js";import"./_baseFindIndex-Cj99RmFE.js";import"./noop-DX6rZLP_.js";import"./toFinite-BNr3H4xF.js";import"./_trimmedEndIndex-DuQxD0U0.js";import"./reactQueryAlias-BHF7eHg_.js";import"./useIndicator-XvalS_xl.js";import"./isRenderable-BUV0eL6r.js";import"./clamp-Bcb9h7tP.js";import"./_baseClamp-DVUOCJN_.js";import"./_baseSlice-F8doVSIJ.js";import"./toInteger-DznSkx8H.js";import"./InputClearButton-DEW22XIR.js";import"./useResolvedRequired-Cc2SdZha.js";import"./useDevWarning-BJd3pvh4.js";import"./usePopover-DLX5ZHpV.js";import"./rtlStyles-T4i24HtE.js";import"./composeEventHandlers-BolWE7qY.js";import"./Divider-FXYopZd4.js";import"./some-iHib-G83.js";import"./Token-gvAX3ObN.js";import"./SelectorOption-GDtizLAk.js";import"./Item-DSrJQenz.js";import"./BAIPowerSearchAdapters-CXeGABZt.js";import"./_charsEndIndex-BHSW-HpW.js";import"./characters-DWaYg7k3.js";import"./NumberInput-DaLJi0Zu.js";import"./useInputStatusIcon-DELSmO9a.js";import"./InputGroupContext-BzmKt80h.js";import"./Selector-Bq7ucRYu.js";import"./useFocusReturnVisibility-Dr28jzaP.js";import"./isRtlElement-B2-7SF8s.js";import"./BottomSheet-BjLTIRhf.js";import"./TextInput-DDzW46ae.js";import"./VStack-B26AYvme.js";import"./isNil-CHIgUVhi.js";import"./includes-BSvUgnrm.js";import"./isString-DJa9cWsX.js";import"./toLower-CMr2JAO4.js";import"./_baseAssignValue-bVk4DFVJ.js";import"./_defineProperty-BIbxF7lg.js";import"./find-BY3_A55p.js";import"./join-DKskq_cE.js";import"./forEach-BzHT27kl.js";import"./_arrayEach-DpGxo2Of.js";import"./_castFunction-a6W-o7Lo.js";import"./split-_I43XNhz.js";import"./_isIterateeCall-CQ8a8s8G.js";import"./uniq-CaKWsB_d.js";/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */const ke=(n,e="AND")=>{const l=n.filter(a=>!!a);return l.length===0?null:l.length===1&&e!=="NOT"?l[0]:{[e]:l}},ln=(function(){var n={defaultValue:null,kind:"LocalArgument",name:"domainName"},e={defaultValue:null,kind:"LocalArgument",name:"legacySelectedFilter"},l={defaultValue:null,kind:"LocalArgument",name:"limit"},a={defaultValue:null,kind:"LocalArgument",name:"projectId"},t={defaultValue:null,kind:"LocalArgument",name:"selectedFilter"},s={defaultValue:null,kind:"LocalArgument",name:"useAdmin"},r={defaultValue:null,kind:"LocalArgument",name:"useDomain"},p={defaultValue:null,kind:"LocalArgument",name:"useLegacy"},f={defaultValue:null,kind:"LocalArgument",name:"useProject"},d={kind:"Variable",name:"filter",variableName:"selectedFilter"},h={kind:"Variable",name:"limit",variableName:"limit"},b={alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null},i={alias:null,args:null,kind:"ScalarField",name:"email",storageKey:null},g=[{alias:null,args:null,concreteType:"UserV2Edge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"UserV2",kind:"LinkedField",name:"node",plural:!1,selections:[b,{alias:null,args:null,concreteType:"UserV2BasicInfo",kind:"LinkedField",name:"basicInfo",plural:!1,selections:[i,{alias:null,args:null,kind:"ScalarField",name:"fullName",storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}],y=[{condition:"useAdmin",kind:"Condition",passingValue:!0,selections:[{alias:null,args:[d,h],concreteType:"UserV2Connection",kind:"LinkedField",name:"adminUsersV2",plural:!1,selections:g,storageKey:null}]},{condition:"useDomain",kind:"Condition",passingValue:!0,selections:[{alias:null,args:[d,h,{fields:[{kind:"Variable",name:"domainName",variableName:"domainName"}],kind:"ObjectValue",name:"scope"}],concreteType:"UserV2Connection",kind:"LinkedField",name:"domainUsersV2",plural:!1,selections:g,storageKey:null}]},{condition:"useProject",kind:"Condition",passingValue:!0,selections:[{alias:null,args:[d,h,{fields:[{kind:"Variable",name:"projectId",variableName:"projectId"}],kind:"ObjectValue",name:"scope"}],concreteType:"UserV2Connection",kind:"LinkedField",name:"projectUsersV2",plural:!1,selections:g,storageKey:null}]},{condition:"useLegacy",kind:"Condition",passingValue:!0,selections:[{alias:null,args:[{kind:"Variable",name:"filter",variableName:"legacySelectedFilter"},{kind:"Variable",name:"first",variableName:"limit"}],concreteType:"UserConnection",kind:"LinkedField",name:"user_nodes",plural:!1,selections:[{alias:null,args:null,concreteType:"UserEdge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"UserNode",kind:"LinkedField",name:"node",plural:!1,selections:[b,i,{alias:null,args:null,kind:"ScalarField",name:"full_name",storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}]}];return{fragment:{argumentDefinitions:[n,e,l,a,t,s,r,p,f],kind:"Fragment",metadata:null,name:"BAIUserSelectValueQuery",selections:y,type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[t,l,n,a,s,r,f,e,p],kind:"Operation",name:"BAIUserSelectValueQuery",selections:y},params:{cacheID:"e7fca0174d0f1a00145ecfccc68f9305",id:null,metadata:{},name:"BAIUserSelectValueQuery",operationKind:"query",text:`query BAIUserSelectValueQuery(
  $selectedFilter: UserV2Filter
  $limit: Int!
  $domainName: String!
  $projectId: UUID!
  $useAdmin: Boolean!
  $useDomain: Boolean!
  $useProject: Boolean!
  $legacySelectedFilter: String
  $useLegacy: Boolean!
) {
  adminUsersV2(filter: $selectedFilter, limit: $limit) @include(if: $useAdmin) @since(version: "26.2.0") {
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
  domainUsersV2(scope: {domainName: $domainName}, filter: $selectedFilter, limit: $limit) @include(if: $useDomain) @since(version: "26.2.0") {
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
  projectUsersV2(scope: {projectId: $projectId}, filter: $selectedFilter, limit: $limit) @include(if: $useProject) @since(version: "26.2.0") {
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
  user_nodes(filter: $legacySelectedFilter, first: $limit) @include(if: $useLegacy) @deprecatedSince(version: "26.2.0") {
    edges {
      node {
        id
        email
        full_name
      }
    }
  }
}
`}}})();ln.hash="46357e6017da80524eded690f1602bd7";const rn=(function(){var n={defaultValue:null,kind:"LocalArgument",name:"domainName"},e={defaultValue:null,kind:"LocalArgument",name:"filter"},l={defaultValue:null,kind:"LocalArgument",name:"legacyFilter"},a={defaultValue:null,kind:"LocalArgument",name:"legacyOrder"},t={defaultValue:null,kind:"LocalArgument",name:"limit"},s={defaultValue:null,kind:"LocalArgument",name:"offset"},r={defaultValue:null,kind:"LocalArgument",name:"orderBy"},p={defaultValue:null,kind:"LocalArgument",name:"projectId"},f={defaultValue:null,kind:"LocalArgument",name:"useAdmin"},d={defaultValue:null,kind:"LocalArgument",name:"useDomain"},h={defaultValue:null,kind:"LocalArgument",name:"useLegacy"},b={defaultValue:null,kind:"LocalArgument",name:"useProject"},i={kind:"Variable",name:"filter",variableName:"filter"},g={kind:"Variable",name:"limit",variableName:"limit"},y={kind:"Variable",name:"offset",variableName:"offset"},v={kind:"Variable",name:"orderBy",variableName:"orderBy"},u={alias:null,args:null,kind:"ScalarField",name:"count",storageKey:null},V={alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null},j={alias:null,args:null,kind:"ScalarField",name:"email",storageKey:null},A=[u,{alias:null,args:null,concreteType:"UserV2Edge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"UserV2",kind:"LinkedField",name:"node",plural:!1,selections:[V,{alias:null,args:null,concreteType:"UserV2BasicInfo",kind:"LinkedField",name:"basicInfo",plural:!1,selections:[j,{alias:null,args:null,kind:"ScalarField",name:"fullName",storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}],$=[{condition:"useAdmin",kind:"Condition",passingValue:!0,selections:[{alias:null,args:[i,g,y,v],concreteType:"UserV2Connection",kind:"LinkedField",name:"adminUsersV2",plural:!1,selections:A,storageKey:null}]},{condition:"useDomain",kind:"Condition",passingValue:!0,selections:[{alias:null,args:[i,g,y,v,{fields:[{kind:"Variable",name:"domainName",variableName:"domainName"}],kind:"ObjectValue",name:"scope"}],concreteType:"UserV2Connection",kind:"LinkedField",name:"domainUsersV2",plural:!1,selections:A,storageKey:null}]},{condition:"useProject",kind:"Condition",passingValue:!0,selections:[{alias:null,args:[i,g,y,v,{fields:[{kind:"Variable",name:"projectId",variableName:"projectId"}],kind:"ObjectValue",name:"scope"}],concreteType:"UserV2Connection",kind:"LinkedField",name:"projectUsersV2",plural:!1,selections:A,storageKey:null}]},{condition:"useLegacy",kind:"Condition",passingValue:!0,selections:[{alias:null,args:[{kind:"Variable",name:"filter",variableName:"legacyFilter"},{kind:"Variable",name:"first",variableName:"limit"},y,{kind:"Variable",name:"order",variableName:"legacyOrder"}],concreteType:"UserConnection",kind:"LinkedField",name:"user_nodes",plural:!1,selections:[u,{alias:null,args:null,concreteType:"UserEdge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"UserNode",kind:"LinkedField",name:"node",plural:!1,selections:[V,j,{alias:null,args:null,kind:"ScalarField",name:"full_name",storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}]}];return{fragment:{argumentDefinitions:[n,e,l,a,t,s,r,p,f,d,h,b],kind:"Fragment",metadata:null,name:"BAIUserSelectPaginatedQuery",selections:$,type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[s,t,e,r,n,p,f,d,b,l,a,h],kind:"Operation",name:"BAIUserSelectPaginatedQuery",selections:$},params:{cacheID:"9d4706317e1b7197bce9fa1b481123a9",id:null,metadata:{},name:"BAIUserSelectPaginatedQuery",operationKind:"query",text:`query BAIUserSelectPaginatedQuery(
  $offset: Int!
  $limit: Int!
  $filter: UserV2Filter
  $orderBy: [UserV2OrderBy!]
  $domainName: String!
  $projectId: UUID!
  $useAdmin: Boolean!
  $useDomain: Boolean!
  $useProject: Boolean!
  $legacyFilter: String
  $legacyOrder: String
  $useLegacy: Boolean!
) {
  adminUsersV2(offset: $offset, limit: $limit, filter: $filter, orderBy: $orderBy) @include(if: $useAdmin) @since(version: "26.2.0") {
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
  domainUsersV2(scope: {domainName: $domainName}, offset: $offset, limit: $limit, filter: $filter, orderBy: $orderBy) @include(if: $useDomain) @since(version: "26.2.0") {
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
  projectUsersV2(scope: {projectId: $projectId}, offset: $offset, limit: $limit, filter: $filter, orderBy: $orderBy) @include(if: $useProject) @since(version: "26.2.0") {
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
  user_nodes(offset: $offset, first: $limit, filter: $legacyFilter, order: $legacyOrder) @include(if: $useLegacy) @deprecatedSince(version: "26.2.0") {
    count
    edges {
      node {
        id
        email
        full_name
      }
    }
  }
}
`}}})();rn.hash="ee2a071f665da6589da36d21bf67e0f3";const vn="00000000-0000-0000-0000-000000000000",Un=n=>n.adminUsersV2??n.domainUsersV2??n.projectUsersV2,xe=n=>{var e;return((e=n.adminUsersV2??n.domainUsersV2??n.projectUsersV2??n.user_nodes)==null?void 0:e.count)??void 0},Be=n=>{var l;const e=Un(n);return e?K(L(e.edges,a=>{var t,s;return a!=null&&a.node?{id:a.node.id,email:(t=a.node.basicInfo)==null?void 0:t.email,fullName:(s=a.node.basicInfo)==null?void 0:s.fullName}:null})):K(L((l=n.user_nodes)==null?void 0:l.edges,a=>a!=null&&a.node?{id:a.node.id,email:a.node.email,fullName:a.node.full_name}:null))},tn=n=>{"use memo";const e=dn.c(54);let l,a,t,s,r,p,f,d;e[0]!==n?({scope:s,filter:l,excludeInactive:p,valuePropName:f,multiple:d,isLoading:a,ref:t,...r}=n,e[0]=n,e[1]=l,e[2]=a,e[3]=t,e[4]=s,e[5]=r,e[6]=p,e[7]=f,e[8]=d):(l=e[1],a=e[2],t=e[3],s=e[4],r=e[5],p=e[6],f=e[7],d=e[8]);const h=p===void 0?!1:p,b=f===void 0?"email":f,i=d===void 0?!1:d,{t:g}=un(),y=Vn(),v=y.supports("user-v2-query"),u=s??(y.is_superadmin?{type:"admin"}:{type:"domain",domainName:y._config.domainName}),V={useAdmin:v&&u.type==="admin",useDomain:v&&u.type==="domain",useProject:v&&u.type==="project",useLegacy:!v,domainName:u.type==="domain"?u.domainName:"",projectId:u.type==="project"?u.projectId:vn};let j;e[9]===Symbol.for("react.memo_cache_sentinel")?(j={valuePropName:"value",trigger:"onChange"},e[9]=j):j=e[9];const[A,$]=Fe(r,j);let w;e[10]===Symbol.for("react.memo_cache_sentinel")?(w={valuePropName:"open",trigger:"onOpenChange",defaultValuePropName:"defaultOpen"},e[10]=w):w=e[10];const[Ue,oe]=Fe(r,w),Ie=I.useDeferredValue(Ue),[D,ce]=I.useState(""),O=gn(D),[sn,Se]=I.useTransition(),[on,E]=bn(),F=I.useDeferredValue(on),je=ke([h?{status:{equals:"ACTIVE"}}:null,l]),Ne=W([h?'status == "active"':null,u.type==="domain"?`domain_name == "${u.domainName}"`:null]),Le=I.useDeferredValue(A),T=K($e(Le??[])),N=b==="id"&&T.length>0;let _;e[11]===Symbol.for("react.memo_cache_sentinel")?(_=ln,e[11]=_):_=e[11];const de=N?"store-or-network":"store-only";let R;e[12]!==F||e[13]!==de?(R={fetchPolicy:de,fetchKey:F},e[12]=F,e[13]=de,e[14]=R):R=e[14];const cn=kn.useLazyLoadQuery(_,{...V,useAdmin:N&&V.useAdmin,useDomain:N&&V.useDomain,useProject:N&&V.useProject,useLegacy:N&&V.useLegacy,selectedFilter:N?ke([{uuid:{in:T}},je]):null,legacySelectedFilter:N?W([W(L(T,In),"|"),Ne],"&"):null,limit:Math.max(T.length,1)},R);let q,Q;e[15]===Symbol.for("react.memo_cache_sentinel")?(Q=rn,q={limit:10},e[15]=q,e[16]=Q):(q=e[15],Q=e[16]);const ue=Ie?"network-only":"store-only";let M;e[17]!==F||e[18]!==ue?(M={fetchPolicy:ue,fetchKey:F},e[17]=F,e[18]=ue,e[19]=M):M=e[19];let X;e[20]===Symbol.for("react.memo_cache_sentinel")?(X={getTotal:xe,getItem:Be,getId:Sn},e[20]=X):X=e[20];const{paginationData:me,result:pe,loadNext:fe,isLoadingNext:ge}=yn(Q,q,{...V,filter:ke([je,O?{email:{iContains:O}}:null]),orderBy:[{field:"EMAIL",direction:"ASC"}],legacyFilter:W([Ne,O?`email ilike "%${O}%"`:null]),legacyOrder:"email"},M,X);let Y,z;e[21]!==E?(Y=()=>({refetch:()=>{Se(()=>{E()})}}),z=[E,Se],e[21]=E,e[22]=Y,e[23]=z):(Y=e[22],z=e[23]),I.useImperativeHandle(t,Y,z);let H;e[24]!==b?(H=o=>{if(o)return b==="id"?fn(o.id):o.email??void 0},e[24]=b,e[25]=H):H=e[25];const U=H;let G;if(e[26]!==U||e[27]!==me){let o;e[29]!==U?(o=c=>{const k=U(c);return k?{value:k,label:(c==null?void 0:c.email)??k,description:(c==null?void 0:c.fullName)??void 0}:null},e[29]=U,e[30]=o):o=e[30],G=K(L(me,o)),e[26]=U,e[27]=me,e[28]=G}else G=e[28];const ye=G;let be;e:{let o;e[31]!==U?(o=P=>{const Ae=U(P);return Ae?[Ae,P.email]:null},e[31]=U,e[32]=o):o=e[32];const c=new Map(K(L(Be(cn),o))),k=L(T,P=>({label:c.get(P)??P,value:P}));if(i){be=k;break e}be=k[0]??null}const he=be;let x;e[33]!==g?(x=g("comp:BAIUserSelect.SelectUser"),e[33]=g,e[34]=x):x=e[34];const Ve=a||!!Ue&&!Ie||A!==Le||D!==O||sn;let B;e[35]!==pe?(B=xe(pe),e[35]=pe,e[36]=B):B=e[36];let C;e[37]!==i||e[38]!==$?(C=o=>{const c=K($e(o??[])),k=L(c,jn);$(i?k:k[0],i?c:c[0])},e[37]=i,e[38]=$,e[39]=C):C=e[39];let J;return e[40]!==ge||e[41]!==he||e[42]!==fe||e[43]!==i||e[44]!==ye||e[45]!==D||e[46]!==r||e[47]!==oe||e[48]!==ce||e[49]!==x||e[50]!==Ve||e[51]!==B||e[52]!==C?(J=m.jsx(hn,{placeholder:x,...r,multiple:i,isLoading:Ve,isLoadingNext:ge,total:B,options:ye,value:he,onChange:C,searchValue:D,onSearch:ce,onOpenChange:oe,endReached:fe}),e[40]=ge,e[41]=he,e[42]=fe,e[43]=i,e[44]=ye,e[45]=D,e[46]=r,e[47]=oe,e[48]=ce,e[49]=x,e[50]=Ve,e[51]=B,e[52]=C,e[53]=J):J=e[53],J};function In(n){return`uuid == "${n}"`}function Sn(n){return n==null?void 0:n.id}function jn(n){return n.value}const Ga={title:"Fragments/BAIUserSelect",component:tn,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:"\n**BAIUserSelect** — the user picker the admin and project-admin forms share. Built on `BAIComplexSelect`.\n\n- `scope`: `{ type: 'admin' }` (`adminUsersV2`), `{ type: 'domain', domainName }` (`domainUsersV2`) or `{ type: 'project', projectId }` (`projectUsersV2`). Omitted, it lists every user the caller may administer: all users for a super-admin, the caller's own domain otherwise.\n- `valuePropName`: `'email'` (default) or `'id'` — which field is the plain-key value. Only `'id'` runs the `uuid in` label-resolution query; with emails the key already is the label.\n- `filter` / `excludeInactive`: composed into a `UserV2Filter` through the schema's `AND` combinator, together with the debounced `email: { iContains }` search.\n- Managers below 26.2.0 fall back to the legacy `user_nodes` connection (`user-v2-query` client flag).\n\nSee `BAIComplexSelect.stories.tsx` for the underlying popup-body component with static options.\n        "}}},argTypes:{value:{control:!1},onChange:{control:!1},filter:{control:!1},scope:{control:!1},multiple:{control:{type:"boolean"}},excludeInactive:{control:{type:"boolean"}},valuePropName:{control:{type:"select"},options:["email","id"]}}},ve=[{id:"VXNlclYyOjE=",basicInfo:{email:"admin@example.com",fullName:"System Administrator"}},{id:"VXNlclYyOjI=",basicInfo:{email:"alice@example.com",fullName:"Alice Kim"}},{id:"VXNlclYyOjM=",basicInfo:{email:"bob@example.com",fullName:"Bob Lee"}},{id:"VXNlclYyOjQ=",basicInfo:{email:"carol@example.com",fullName:"Carol Park"}}],ie=n=>({count:n.length,edges:n.map(e=>({node:e}))}),Nn={Query:()=>({adminUsersV2:ie(ve),domainUsersV2:ie(ve),projectUsersV2:ie(ve.slice(1,3))})},Ln={Query:()=>({adminUsersV2:ie([])})},An={supports:()=>!0,is_superadmin:!0,_config:{domainName:"default"}},S=({initialValue:n=null,resolvers:e=Nn,...l})=>{const[a,t]=I.useState(n),s=I.useMemo(()=>Promise.resolve(An),[]);return m.jsx(mn.Provider,{value:s,children:m.jsx(pn,{mockResolvers:e,children:m.jsx(tn,{...l,value:a,onChange:r=>t(r??null)})})})},Z={name:"Single Select",parameters:{docs:{description:{story:'Single user select, `valuePropName="email"` (default).'}}},render:n=>m.jsx(S,{...n,label:"User"})},ee={name:"Multiple Select",parameters:{docs:{description:{story:"Multi-selection: the value is an array of keys and the trigger lists the selected emails."}}},render:n=>m.jsx(S,{...n,label:"Users",multiple:!0,initialValue:["admin@example.com"]})},ne={name:"Project Scope",parameters:{docs:{description:{story:'`scope={{ type: "project", projectId }}` reads `projectUsersV2`, the members of one project — what a project admin may list.'}}},render:n=>m.jsx(S,{...n,label:"Owner",scope:{type:"project",projectId:"5c3b5a9e-0000-4000-8000-000000000001"},defaultOpen:!0})},ae={name:"Exclude Inactive Users",parameters:{docs:{description:{story:"`excludeInactive` composes `status: { equals: ACTIVE }` into the `UserV2Filter`."}}},render:n=>m.jsx(S,{...n,label:"User",excludeInactive:!0})},le={name:"ID-valued",parameters:{docs:{description:{story:'`valuePropName="id"` — the plain-key value is the local user UUID, which is what `adminBulkAssignRole` and friends take. This is the only mode that runs the `uuid in` label-resolution query.'}}},render:n=>m.jsx(S,{...n,label:"User",valuePropName:"id"})},re={parameters:{docs:{description:{story:"Caller-side `isLoading`, which spins the trigger the same way the internal debounce and refetch pending states do."}}},render:n=>m.jsx(S,{...n,label:"User",isLoading:!0,isDisabled:!0})},te={parameters:{docs:{description:{story:"No users match the query — the popup shows the shared empty-state text."}}},render:n=>m.jsx(S,{...n,label:"User",resolvers:Ln,defaultOpen:!0})},se={parameters:{docs:{description:{story:"The error status a form item sets when its `required` rule fails."}}},render:n=>m.jsx(S,{...n,label:"User",status:{type:"error",message:"Please select users."}})};var Ce,Pe,Ke;Z.parameters={...Z.parameters,docs:{...(Ce=Z.parameters)==null?void 0:Ce.docs,source:{originalSource:`{
  name: 'Single Select',
  parameters: {
    docs: {
      description: {
        story: 'Single user select, \`valuePropName="email"\` (default).'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" />
}`,...(Ke=(Pe=Z.parameters)==null?void 0:Pe.docs)==null?void 0:Ke.source}}};var De,Oe,Te;ee.parameters={...ee.parameters,docs:{...(De=ee.parameters)==null?void 0:De.docs,source:{originalSource:`{
  name: 'Multiple Select',
  parameters: {
    docs: {
      description: {
        story: 'Multi-selection: the value is an array of keys and the trigger lists the selected emails.'
      }
    }
  },
  render: args => <Sandbox {...args} label="Users" multiple initialValue={['admin@example.com']} />
}`,...(Te=(Oe=ee.parameters)==null?void 0:Oe.docs)==null?void 0:Te.source}}};var we,Ee,_e;ne.parameters={...ne.parameters,docs:{...(we=ne.parameters)==null?void 0:we.docs,source:{originalSource:`{
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
}`,...(_e=(Ee=ne.parameters)==null?void 0:Ee.docs)==null?void 0:_e.source}}};var Re,qe,Qe;ae.parameters={...ae.parameters,docs:{...(Re=ae.parameters)==null?void 0:Re.docs,source:{originalSource:`{
  name: 'Exclude Inactive Users',
  parameters: {
    docs: {
      description: {
        story: '\`excludeInactive\` composes \`status: { equals: ACTIVE }\` into the \`UserV2Filter\`.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" excludeInactive />
}`,...(Qe=(qe=ae.parameters)==null?void 0:qe.docs)==null?void 0:Qe.source}}};var Me,Xe,Ye;le.parameters={...le.parameters,docs:{...(Me=le.parameters)==null?void 0:Me.docs,source:{originalSource:`{
  name: 'ID-valued',
  parameters: {
    docs: {
      description: {
        story: '\`valuePropName="id"\` — the plain-key value is the local user UUID, which is what \`adminBulkAssignRole\` and friends take. This is the only mode that runs the \`uuid in\` label-resolution query.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" valuePropName="id" />
}`,...(Ye=(Xe=le.parameters)==null?void 0:Xe.docs)==null?void 0:Ye.source}}};var ze,He,Ge;re.parameters={...re.parameters,docs:{...(ze=re.parameters)==null?void 0:ze.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Caller-side \`isLoading\`, which spins the trigger the same way the internal debounce and refetch pending states do.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" isLoading isDisabled />
}`,...(Ge=(He=re.parameters)==null?void 0:He.docs)==null?void 0:Ge.source}}};var Je,We,Ze;te.parameters={...te.parameters,docs:{...(Je=te.parameters)==null?void 0:Je.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'No users match the query — the popup shows the shared empty-state text.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" resolvers={emptyResolvers} defaultOpen />
}`,...(Ze=(We=te.parameters)==null?void 0:We.docs)==null?void 0:Ze.source}}};var en,nn,an;se.parameters={...se.parameters,docs:{...(en=se.parameters)==null?void 0:en.docs,source:{originalSource:`{
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
}`,...(an=(nn=se.parameters)==null?void 0:nn.docs)==null?void 0:an.source}}};const Ja=["Default","Multiple","ProjectScoped","ExcludeInactive","IdValued","Loading","Empty","Error"];export{Z as Default,te as Empty,se as Error,ae as ExcludeInactive,le as IdValued,re as Loading,ee as Multiple,ne as ProjectScoped,Ja as __namedExportsOrder,Ga as default};
