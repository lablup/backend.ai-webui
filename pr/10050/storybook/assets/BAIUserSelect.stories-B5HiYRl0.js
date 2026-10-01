import{c as q,j as b,r as Q,a as Xe}from"./iframe-LcOeesAm.js";import{R as Ye}from"./RelayResolver-B-e403F_.js";import{t as Ge}from"./index-C9-ZKVCP.js";import{a as se,u as He}from"./useDebounce-Dxa90xpi.js";import{a as Ze}from"./index-Bj6lnqKD.js";import{c as Ce,B as Je}from"./BAIComplexSelect-DwCTBoKn.js";import{r as ie}from"./index-CZsKndim.js";import{u as ue}from"./useControllableValue-n1qtA3WV.js";import{c as M}from"./compact-CU4PNV0P.js";import{m as R}from"./map-BMbWWR0u.js";import"./preload-helper-Dp1pzeXC.js";import"./index-BvNaJQMz.js";import"./isNumber-BbgKkVJX.js";import"./toString-CBjiw0yP.js";import"./isSymbol-BLEEM6UB.js";import"./filter-BvngYZ-6.js";import"./_baseEach-inFo6fZi.js";import"./get-BYEEUfRX.js";import"./_baseGet-CFZf_apN.js";import"./identity-DKeuBCMA.js";import"./isEmpty-BCSYFwDK.js";import"./useEventNotStable-DTFSNpCj.js";import"./uniqBy-DO6Je8W8.js";import"./_baseUniq-BhxDxTsJ.js";import"./_baseIndexOf-Be9UPhX8.js";import"./_baseFindIndex-Cj99RmFE.js";import"./noop-DX6rZLP_.js";import"./toFinite-SPCQKIiD.js";import"./_trimmedEndIndex-DuQxD0U0.js";import"./useConnectedBAIClient-DjcsYfO5.js";import"./reactQueryAlias-1DizGZ4j.js";import"./useIndicator-B86TlLDi.js";import"./isRenderable-BUV0eL6r.js";import"./clamp-CdnG-U6L.js";import"./_baseClamp-DVUOCJN_.js";import"./_baseSlice-F8doVSIJ.js";import"./toInteger-D9EHPwgq.js";import"./InputClearButton-pWzGNp0A.js";import"./useResolvedRequired-MY7rDq7j.js";import"./useDevWarning-CIxjZAuj.js";import"./usePopover-8JBjm-2o.js";import"./rtlStyles-T4i24HtE.js";import"./composeEventHandlers-BolWE7qY.js";import"./Divider-DG0ceyKY.js";import"./some-3YTw2VdP.js";import"./Token-D5--e6mX.js";import"./SelectorOption-Cwyb113N.js";import"./Item-7neLg54B.js";/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */const te=(a,e="AND")=>{const n=a.filter(l=>!!l);return n.length===0?null:n.length===1&&e!=="NOT"?n[0]:{[e]:n}},_e=(function(){var a={defaultValue:null,kind:"LocalArgument",name:"limit"},e={defaultValue:null,kind:"LocalArgument",name:"selectedFilter"},n={defaultValue:null,kind:"LocalArgument",name:"skipSelected"},l=[{condition:"skipSelected",kind:"Condition",passingValue:!1,selections:[{alias:null,args:[{kind:"Variable",name:"filter",variableName:"selectedFilter"},{kind:"Variable",name:"limit",variableName:"limit"}],concreteType:"UserV2Connection",kind:"LinkedField",name:"adminUsersV2",plural:!1,selections:[{alias:null,args:null,concreteType:"UserV2Edge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"UserV2",kind:"LinkedField",name:"node",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null},{alias:null,args:null,concreteType:"UserV2BasicInfo",kind:"LinkedField",name:"basicInfo",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"email",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"fullName",storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}]}];return{fragment:{argumentDefinitions:[a,e,n],kind:"Fragment",metadata:null,name:"BAIUserSelectAdminValueQuery",selections:l,type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[e,a,n],kind:"Operation",name:"BAIUserSelectAdminValueQuery",selections:l},params:{cacheID:"5777d4edebee339daa6f13df0896a37e",id:null,metadata:{},name:"BAIUserSelectAdminValueQuery",operationKind:"query",text:`query BAIUserSelectAdminValueQuery(
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
          fullName
        }
      }
    }
  }
}
`}}})();_e.hash="8b587afd966cb5da259fe29624f52cda";const we=(function(){var a={defaultValue:null,kind:"LocalArgument",name:"filter"},e={defaultValue:null,kind:"LocalArgument",name:"limit"},n={defaultValue:null,kind:"LocalArgument",name:"offset"},l={defaultValue:null,kind:"LocalArgument",name:"orderBy"},t=[{alias:null,args:[{kind:"Variable",name:"filter",variableName:"filter"},{kind:"Variable",name:"limit",variableName:"limit"},{kind:"Variable",name:"offset",variableName:"offset"},{kind:"Variable",name:"orderBy",variableName:"orderBy"}],concreteType:"UserV2Connection",kind:"LinkedField",name:"adminUsersV2",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"count",storageKey:null},{alias:null,args:null,concreteType:"UserV2Edge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"UserV2",kind:"LinkedField",name:"node",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null},{alias:null,args:null,concreteType:"UserV2BasicInfo",kind:"LinkedField",name:"basicInfo",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"email",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"fullName",storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:[a,e,n,l],kind:"Fragment",metadata:null,name:"BAIUserSelectAdminPaginatedQuery",selections:t,type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[n,e,a,l],kind:"Operation",name:"BAIUserSelectAdminPaginatedQuery",selections:t},params:{cacheID:"289c6c25cc2f9a10bd2369d622614d15",id:null,metadata:{},name:"BAIUserSelectAdminPaginatedQuery",operationKind:"query",text:`query BAIUserSelectAdminPaginatedQuery(
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
          email
          fullName
        }
      }
    }
  }
}
`}}})();we.hash="183ff6704bc57811ef5f0d48b9c1ae00";const qe=(function(){var a={defaultValue:null,kind:"LocalArgument",name:"domainName"},e={defaultValue:null,kind:"LocalArgument",name:"limit"},n={defaultValue:null,kind:"LocalArgument",name:"selectedFilter"},l={defaultValue:null,kind:"LocalArgument",name:"skipSelected"},t=[{condition:"skipSelected",kind:"Condition",passingValue:!1,selections:[{alias:null,args:[{kind:"Variable",name:"filter",variableName:"selectedFilter"},{kind:"Variable",name:"limit",variableName:"limit"},{fields:[{kind:"Variable",name:"domainName",variableName:"domainName"}],kind:"ObjectValue",name:"scope"}],concreteType:"UserV2Connection",kind:"LinkedField",name:"domainUsersV2",plural:!1,selections:[{alias:null,args:null,concreteType:"UserV2Edge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"UserV2",kind:"LinkedField",name:"node",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null},{alias:null,args:null,concreteType:"UserV2BasicInfo",kind:"LinkedField",name:"basicInfo",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"email",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"fullName",storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}]}];return{fragment:{argumentDefinitions:[a,e,n,l],kind:"Fragment",metadata:null,name:"BAIUserSelectDomainValueQuery",selections:t,type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[a,n,e,l],kind:"Operation",name:"BAIUserSelectDomainValueQuery",selections:t},params:{cacheID:"26da80874b1f49b6cfc5d6cde18e27c8",id:null,metadata:{},name:"BAIUserSelectDomainValueQuery",operationKind:"query",text:`query BAIUserSelectDomainValueQuery(
  $domainName: String!
  $selectedFilter: UserV2Filter
  $limit: Int!
  $skipSelected: Boolean!
) {
  domainUsersV2(scope: {domainName: $domainName}, filter: $selectedFilter, limit: $limit) @skip(if: $skipSelected) {
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
`}}})();qe.hash="215cce6bdfd5671e64a2ee51c77c2442";const Ee=(function(){var a={defaultValue:null,kind:"LocalArgument",name:"domainName"},e={defaultValue:null,kind:"LocalArgument",name:"filter"},n={defaultValue:null,kind:"LocalArgument",name:"limit"},l={defaultValue:null,kind:"LocalArgument",name:"offset"},t={defaultValue:null,kind:"LocalArgument",name:"orderBy"},r=[{alias:null,args:[{kind:"Variable",name:"filter",variableName:"filter"},{kind:"Variable",name:"limit",variableName:"limit"},{kind:"Variable",name:"offset",variableName:"offset"},{kind:"Variable",name:"orderBy",variableName:"orderBy"},{fields:[{kind:"Variable",name:"domainName",variableName:"domainName"}],kind:"ObjectValue",name:"scope"}],concreteType:"UserV2Connection",kind:"LinkedField",name:"domainUsersV2",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"count",storageKey:null},{alias:null,args:null,concreteType:"UserV2Edge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"UserV2",kind:"LinkedField",name:"node",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null},{alias:null,args:null,concreteType:"UserV2BasicInfo",kind:"LinkedField",name:"basicInfo",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"email",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"fullName",storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:[a,e,n,l,t],kind:"Fragment",metadata:null,name:"BAIUserSelectDomainPaginatedQuery",selections:r,type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[a,l,n,e,t],kind:"Operation",name:"BAIUserSelectDomainPaginatedQuery",selections:r},params:{cacheID:"b3f6bb2011f0d61b53037dba109fa89a",id:null,metadata:{},name:"BAIUserSelectDomainPaginatedQuery",operationKind:"query",text:`query BAIUserSelectDomainPaginatedQuery(
  $domainName: String!
  $offset: Int!
  $limit: Int!
  $filter: UserV2Filter
  $orderBy: [UserV2OrderBy!]
) {
  domainUsersV2(scope: {domainName: $domainName}, offset: $offset, limit: $limit, filter: $filter, orderBy: $orderBy) {
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
`}}})();Ee.hash="e9f729d4c4241e2131a8833e03456c89";const Re=(function(){var a={defaultValue:null,kind:"LocalArgument",name:"limit"},e={defaultValue:null,kind:"LocalArgument",name:"projectId"},n={defaultValue:null,kind:"LocalArgument",name:"selectedFilter"},l={defaultValue:null,kind:"LocalArgument",name:"skipSelected"},t=[{condition:"skipSelected",kind:"Condition",passingValue:!1,selections:[{alias:null,args:[{kind:"Variable",name:"filter",variableName:"selectedFilter"},{kind:"Variable",name:"limit",variableName:"limit"},{fields:[{kind:"Variable",name:"projectId",variableName:"projectId"}],kind:"ObjectValue",name:"scope"}],concreteType:"UserV2Connection",kind:"LinkedField",name:"projectUsersV2",plural:!1,selections:[{alias:null,args:null,concreteType:"UserV2Edge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"UserV2",kind:"LinkedField",name:"node",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null},{alias:null,args:null,concreteType:"UserV2BasicInfo",kind:"LinkedField",name:"basicInfo",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"email",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"fullName",storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}]}];return{fragment:{argumentDefinitions:[a,e,n,l],kind:"Fragment",metadata:null,name:"BAIUserSelectProjectValueQuery",selections:t,type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[e,n,a,l],kind:"Operation",name:"BAIUserSelectProjectValueQuery",selections:t},params:{cacheID:"952894dd737b2a55c4d39dc54cd532ad",id:null,metadata:{},name:"BAIUserSelectProjectValueQuery",operationKind:"query",text:`query BAIUserSelectProjectValueQuery(
  $projectId: UUID!
  $selectedFilter: UserV2Filter
  $limit: Int!
  $skipSelected: Boolean!
) {
  projectUsersV2(scope: {projectId: $projectId}, filter: $selectedFilter, limit: $limit) @skip(if: $skipSelected) {
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
`}}})();Re.hash="b57b8dd35d74e2fb058999993f5be2d9";const Me=(function(){var a={defaultValue:null,kind:"LocalArgument",name:"filter"},e={defaultValue:null,kind:"LocalArgument",name:"limit"},n={defaultValue:null,kind:"LocalArgument",name:"offset"},l={defaultValue:null,kind:"LocalArgument",name:"orderBy"},t={defaultValue:null,kind:"LocalArgument",name:"projectId"},r=[{alias:null,args:[{kind:"Variable",name:"filter",variableName:"filter"},{kind:"Variable",name:"limit",variableName:"limit"},{kind:"Variable",name:"offset",variableName:"offset"},{kind:"Variable",name:"orderBy",variableName:"orderBy"},{fields:[{kind:"Variable",name:"projectId",variableName:"projectId"}],kind:"ObjectValue",name:"scope"}],concreteType:"UserV2Connection",kind:"LinkedField",name:"projectUsersV2",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"count",storageKey:null},{alias:null,args:null,concreteType:"UserV2Edge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"UserV2",kind:"LinkedField",name:"node",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null},{alias:null,args:null,concreteType:"UserV2BasicInfo",kind:"LinkedField",name:"basicInfo",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"email",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"fullName",storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:[a,e,n,l,t],kind:"Fragment",metadata:null,name:"BAIUserSelectProjectPaginatedQuery",selections:r,type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[t,n,e,a,l],kind:"Operation",name:"BAIUserSelectProjectPaginatedQuery",selections:r},params:{cacheID:"ee9c7b2a19218efc804c6e31aa69d032",id:null,metadata:{},name:"BAIUserSelectProjectPaginatedQuery",operationKind:"query",text:`query BAIUserSelectProjectPaginatedQuery(
  $projectId: UUID!
  $offset: Int!
  $limit: Int!
  $filter: UserV2Filter
  $orderBy: [UserV2OrderBy!]
) {
  projectUsersV2(scope: {projectId: $projectId}, offset: $offset, limit: $limit, filter: $filter, orderBy: $orderBy) {
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
`}}})();Me.hash="9deb5630eb2c138ecc5baa2a15e079cd";const E=a=>M(R(a,e=>{var n,l;return e!=null&&e.node?{id:e.node.id,email:(n=e.node.basicInfo)==null?void 0:n.email,fullName:(l=e.node.basicInfo)==null?void 0:l.fullName}:null})),oe=10,de=a=>{"use memo";const e=q.c(23);let n,l,t,r,s,f,i;e[0]!==a?({filter:n,excludeInactive:s,valuePropName:f,multiple:i,isLoading:l,ref:t,...r}=a,e[0]=a,e[1]=n,e[2]=l,e[3]=t,e[4]=r,e[5]=s,e[6]=f,e[7]=i):(n=e[1],l=e[2],t=e[3],r=e[4],s=e[5],f=e[6],i=e[7]);const o=s===void 0?!1:s,y=f===void 0?"email":f,m=i===void 0?!1:i;let u;e[8]===Symbol.for("react.memo_cache_sentinel")?(u={valuePropName:"value",trigger:"onChange"},e[8]=u):u=e[8];const[V,k]=ue(r,u);let c;e[9]===Symbol.for("react.memo_cache_sentinel")?(c={valuePropName:"open",trigger:"onOpenChange",defaultValuePropName:"defaultOpen"},e[9]=c):c=e[9];const[h,d]=ue(r,c),N=Q.useDeferredValue(h),[v,A]=Q.useState(""),I=He(v),[le,z]=Q.useTransition(),[C,U]=Ze(),j=Q.useDeferredValue(C);let $,D;e[10]!==U?($=()=>({refetch:()=>{z(()=>{U()})}}),D=[U,z],e[10]=U,e[11]=$,e[12]=D):($=e[11],D=e[12]),Q.useImperativeHandle(t,$,D);const _=te([o?{status:{equals:"ACTIVE"}}:null,n]),L=Q.useDeferredValue(V),O=M(Ce(L??[])),P=y==="id"&&O.length>0,F=N?"network-only":"store-only";let B;e[13]!==j||e[14]!==F?(B={fetchPolicy:F,fetchKey:j},e[13]=j,e[14]=F,e[15]=B):B=e[15];const p=P?te([{uuid:{in:O}},_]):null,g=Math.max(O.length,1),S=!P;let w;e[16]!==p||e[17]!==g||e[18]!==S?(w={selectedFilter:p,limit:g,skipSelected:S},e[16]=p,e[17]=g,e[18]=S,e[19]=w):w=e[19];const x=P?"store-or-network":"store-only";let T;return e[20]!==j||e[21]!==x?(T={fetchPolicy:x,fetchKey:j},e[20]=j,e[21]=x,e[22]=T):T=e[22],{multiple:m,isLoading:l,valuePropName:y,selectProps:r,selectedKeys:O,controllableValue:V,setControllableValue:k,controllableOpen:h,setControllableOpen:d,deferredOpen:N,deferredControllableValue:L,searchStr:v,setSearchStr:A,debouncedDeferredValue:I,isPendingRefetch:le,listVariables:{filter:te([_,I?{email:{iContains:I}}:null]),orderBy:[{field:"EMAIL",direction:"ASC"}]},listOptions:B,valueVariables:w,valueOptions:T}},ce=a=>{"use memo";const e=q.c(32),{state:n,users:l,selectedUsers:t,total:r,loadNext:s,isLoadingNext:f}=a,{t:i}=Xe(),{multiple:o,isLoading:y,valuePropName:m,selectProps:u,selectedKeys:V,controllableValue:k,setControllableValue:c,controllableOpen:h,setControllableOpen:d,deferredOpen:N,deferredControllableValue:v,searchStr:A,setSearchStr:I,debouncedDeferredValue:le,isPendingRefetch:z}=n;let C;e[0]!==m?(C=p=>{if(p)return m==="id"?Ge(p.id):p.email??void 0},e[0]=m,e[1]=C):C=e[1];const U=C;let j;if(e[2]!==U||e[3]!==l){let p;e[5]!==U?(p=g=>{const S=U(g);return S?{value:S,label:(g==null?void 0:g.email)??S,description:(g==null?void 0:g.fullName)??void 0}:null},e[5]=U,e[6]=p):p=e[6],j=M(R(l,p)),e[2]=U,e[3]=l,e[4]=j}else j=e[4];const $=j;let D;e:{let p;if(e[7]!==U||e[8]!==V||e[9]!==t){let S;e[11]!==U?(S=x=>{const T=U(x);return T?[T,x.email]:null},e[11]=U,e[12]=S):S=e[12];const w=new Map(M(R(t,S)));p=R(V,x=>({label:w.get(x)??x,value:x})),e[7]=U,e[8]=V,e[9]=t,e[10]=p}else p=e[10];const g=p;if(o){D=g;break e}D=g[0]??null}const _=D;let L;e[13]!==i?(L=i("comp:BAIUserSelect.SelectUser"),e[13]=i,e[14]=L):L=e[14];const O=y||!!h&&!N||k!==v||A!==le||z,P=r??void 0;let F;e[15]!==o||e[16]!==c?(F=p=>{const g=M(Ce(p??[])),S=R(g,na);c(o?S:S[0],o?g:g[0])},e[15]=o,e[16]=c,e[17]=F):F=e[17];let B;return e[18]!==f||e[19]!==_||e[20]!==s||e[21]!==o||e[22]!==$||e[23]!==A||e[24]!==u||e[25]!==d||e[26]!==I||e[27]!==L||e[28]!==O||e[29]!==P||e[30]!==F?(B=b.jsx(Je,{placeholder:L,...u,multiple:o,isLoading:O,isLoadingNext:f,total:P,options:$,value:_,onChange:F,searchValue:A,onSearch:I,onOpenChange:d,endReached:s}),e[18]=f,e[19]=_,e[20]=s,e[21]=o,e[22]=$,e[23]=A,e[24]=u,e[25]=d,e[26]=I,e[27]=L,e[28]=O,e[29]=P,e[30]=F,e[31]=B):B=e[31],B},We=a=>{"use memo";var h,d;const e=q.c(13),n=de(a);let l;e[0]===Symbol.for("react.memo_cache_sentinel")?(l=_e,e[0]=l):l=e[0];const t=ie.useLazyLoadQuery(l,n.valueVariables,n.valueOptions);let r,s;e[1]===Symbol.for("react.memo_cache_sentinel")?(r=we,s={limit:oe},e[1]=r,e[2]=s):(r=e[1],s=e[2]);let f;e[3]===Symbol.for("react.memo_cache_sentinel")?(f={getTotal:la,getItem:ta,getId:ra},e[3]=f):f=e[3];const{paginationData:i,result:o,loadNext:y,isLoadingNext:m}=se(r,s,n.listVariables,n.listOptions,f),u=(h=t.adminUsersV2)==null?void 0:h.edges;let V;e[4]!==u?(V=E(u),e[4]=u,e[5]=V):V=e[5];const k=(d=o.adminUsersV2)==null?void 0:d.count;let c;return e[6]!==m||e[7]!==y||e[8]!==i||e[9]!==n||e[10]!==V||e[11]!==k?(c=b.jsx(ce,{state:n,users:i,selectedUsers:V,total:k,loadNext:y,isLoadingNext:m}),e[6]=m,e[7]=y,e[8]=i,e[9]=n,e[10]=V,e[11]=k,e[12]=c):c=e[12],c},ea=a=>{"use memo";var A,I;const e=q.c(22);let n,l;e[0]!==a?({domainName:n,...l}=a,e[0]=a,e[1]=n,e[2]=l):(n=e[1],l=e[2]);const t=de(l);let r;e[3]===Symbol.for("react.memo_cache_sentinel")?(r=qe,e[3]=r):r=e[3];let s;e[4]!==n||e[5]!==t.valueVariables?(s={...t.valueVariables,domainName:n},e[4]=n,e[5]=t.valueVariables,e[6]=s):s=e[6];const f=ie.useLazyLoadQuery(r,s,t.valueOptions);let i,o;e[7]===Symbol.for("react.memo_cache_sentinel")?(i=Ee,o={limit:oe},e[7]=i,e[8]=o):(i=e[7],o=e[8]);let y;e[9]!==n||e[10]!==t.listVariables?(y={...t.listVariables,domainName:n},e[9]=n,e[10]=t.listVariables,e[11]=y):y=e[11];let m;e[12]===Symbol.for("react.memo_cache_sentinel")?(m={getTotal:sa,getItem:ia,getId:oa},e[12]=m):m=e[12];const{paginationData:u,result:V,loadNext:k,isLoadingNext:c}=se(i,o,y,t.listOptions,m),h=(A=f.domainUsersV2)==null?void 0:A.edges;let d;e[13]!==h?(d=E(h),e[13]=h,e[14]=d):d=e[14];const N=(I=V.domainUsersV2)==null?void 0:I.count;let v;return e[15]!==c||e[16]!==k||e[17]!==u||e[18]!==t||e[19]!==d||e[20]!==N?(v=b.jsx(ce,{state:t,users:u,selectedUsers:d,total:N,loadNext:k,isLoadingNext:c}),e[15]=c,e[16]=k,e[17]=u,e[18]=t,e[19]=d,e[20]=N,e[21]=v):v=e[21],v},aa=a=>{"use memo";var A,I;const e=q.c(22);let n,l;e[0]!==a?({projectId:n,...l}=a,e[0]=a,e[1]=n,e[2]=l):(n=e[1],l=e[2]);const t=de(l);let r;e[3]===Symbol.for("react.memo_cache_sentinel")?(r=Re,e[3]=r):r=e[3];let s;e[4]!==n||e[5]!==t.valueVariables?(s={...t.valueVariables,projectId:n},e[4]=n,e[5]=t.valueVariables,e[6]=s):s=e[6];const f=ie.useLazyLoadQuery(r,s,t.valueOptions);let i,o;e[7]===Symbol.for("react.memo_cache_sentinel")?(i=Me,o={limit:oe},e[7]=i,e[8]=o):(i=e[7],o=e[8]);let y;e[9]!==n||e[10]!==t.listVariables?(y={...t.listVariables,projectId:n},e[9]=n,e[10]=t.listVariables,e[11]=y):y=e[11];let m;e[12]===Symbol.for("react.memo_cache_sentinel")?(m={getTotal:da,getItem:ca,getId:ua},e[12]=m):m=e[12];const{paginationData:u,result:V,loadNext:k,isLoadingNext:c}=se(i,o,y,t.listOptions,m),h=(A=f.projectUsersV2)==null?void 0:A.edges;let d;e[13]!==h?(d=E(h),e[13]=h,e[14]=d):d=e[14];const N=(I=V.projectUsersV2)==null?void 0:I.count;let v;return e[15]!==c||e[16]!==k||e[17]!==u||e[18]!==t||e[19]!==d||e[20]!==N?(v=b.jsx(ce,{state:t,users:u,selectedUsers:d,total:N,loadNext:k,isLoadingNext:c}),e[15]=c,e[16]=k,e[17]=u,e[18]=t,e[19]=d,e[20]=N,e[21]=v):v=e[21],v},ze=a=>{"use memo";const e=q.c(11);let n,l;if(e[0]!==a?({scope:l,...n}=a,e[0]=a,e[1]=n,e[2]=l):(n=e[1],l=e[2]),l.type==="project"){let r;return e[3]!==n||e[4]!==l.projectId?(r=b.jsx(aa,{projectId:l.projectId,...n}),e[3]=n,e[4]=l.projectId,e[5]=r):r=e[5],r}if(l.type==="domain"){let r;return e[6]!==n||e[7]!==l.domainName?(r=b.jsx(ea,{domainName:l.domainName,...n}),e[6]=n,e[7]=l.domainName,e[8]=r):r=e[8],r}let t;return e[9]!==n?(t=b.jsx(We,{...n}),e[9]=n,e[10]=t):t=e[10],t};function na(a){return a.value}function la(a){var e;return((e=a.adminUsersV2)==null?void 0:e.count)??void 0}function ta(a){var e;return E((e=a.adminUsersV2)==null?void 0:e.edges)}function ra(a){return a==null?void 0:a.id}function sa(a){var e;return((e=a.domainUsersV2)==null?void 0:e.count)??void 0}function ia(a){var e;return E((e=a.domainUsersV2)==null?void 0:e.edges)}function oa(a){return a==null?void 0:a.id}function da(a){var e;return((e=a.projectUsersV2)==null?void 0:e.count)??void 0}function ca(a){var e;return E((e=a.projectUsersV2)==null?void 0:e.edges)}function ua(a){return a==null?void 0:a.id}const cn={title:"Fragments/BAIUserSelect",component:ze,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:"\n**BAIUserSelect** — the user picker the admin and project-admin forms share. Built on `BAIComplexSelect`.\n\n- `scope` (required): `{ type: 'admin' }` (`adminUsersV2`), `{ type: 'domain', domainName }` (`domainUsersV2`) or `{ type: 'project', projectId }` (`projectUsersV2`). Each scope owns its own Relay documents, so a scope id is a required variable. Admin pages take theirs from `useAdminUserSelectScope()`.\n- `valuePropName`: `'email'` (default) or `'id'` — which field is the plain-key value. Only `'id'` runs the `uuid in` label-resolution query; with emails the key already is the label.\n- `filter` / `excludeInactive`: composed into a `UserV2Filter` through the schema's `AND` combinator, together with the debounced `email: { iContains }` search.\n- Needs a manager >= 26.2.0, where the three V2 connections exist.\n\nSee `BAIComplexSelect.stories.tsx` for the underlying popup-body component with static options.\n        "}}},argTypes:{value:{control:!1},onChange:{control:!1},filter:{control:!1},scope:{control:!1},multiple:{control:{type:"boolean"}},excludeInactive:{control:{type:"boolean"}},valuePropName:{control:{type:"select"},options:["email","id"]}}},re=[{id:"VXNlclYyOjE=",basicInfo:{email:"admin@example.com",fullName:"System Administrator"}},{id:"VXNlclYyOjI=",basicInfo:{email:"alice@example.com",fullName:"Alice Kim"}},{id:"VXNlclYyOjM=",basicInfo:{email:"bob@example.com",fullName:"Bob Lee"}},{id:"VXNlclYyOjQ=",basicInfo:{email:"carol@example.com",fullName:"Carol Park"}}],ne=a=>({count:a.length,edges:a.map(e=>({node:e}))}),ma={Query:()=>({adminUsersV2:ne(re),domainUsersV2:ne(re.slice(0,3)),projectUsersV2:ne(re.slice(1,3))})},pa={Query:()=>({adminUsersV2:ne([])})},fa={type:"admin"},K=({scope:a=fa,initialValue:e=null,resolvers:n=ma,...l})=>{const[t,r]=Q.useState(e);return b.jsx(Ye,{mockResolvers:n,children:b.jsx(ze,{...l,scope:a,value:t,onChange:s=>r(s??null)})})},X={parameters:{docs:{description:{story:'`scope={{ type: "admin" }}` reads `adminUsersV2` — every user, which only a super-admin may list.'}}},render:a=>b.jsx(K,{...a,label:"User"})},Y={parameters:{docs:{description:{story:'`scope={{ type: "domain", domainName }}` reads `domainUsersV2` — the users of one domain, which a domain admin may list. `useAdminUserSelectScope()` picks this scope for a non-super-admin caller.'}}},render:a=>b.jsx(K,{...a,label:"User",scope:{type:"domain",domainName:"default"},defaultOpen:!0})},G={parameters:{docs:{description:{story:'`scope={{ type: "project", projectId }}` reads `projectUsersV2`, the members of one project — what a project admin may list.'}}},render:a=>b.jsx(K,{...a,label:"Owner",scope:{type:"project",projectId:"5c3b5a9e-0000-4000-8000-000000000001"},defaultOpen:!0})},H={name:"Multiple Select",parameters:{docs:{description:{story:"Multi-selection: the value is an array of keys and the trigger lists the selected emails."}}},render:a=>b.jsx(K,{...a,label:"Users",multiple:!0,initialValue:["admin@example.com"]})},Z={name:"Exclude Inactive Users",parameters:{docs:{description:{story:"`excludeInactive` composes `status: { equals: ACTIVE }` into the `UserV2Filter`."}}},render:a=>b.jsx(K,{...a,label:"User",excludeInactive:!0})},J={name:"ID-valued",parameters:{docs:{description:{story:'`valuePropName="id"` — the plain-key value is the local user UUID, which is what `adminBulkAssignRole` and friends take. This is the only mode that runs the `uuid in` label-resolution query.'}}},render:a=>b.jsx(K,{...a,label:"User",valuePropName:"id"})},W={parameters:{docs:{description:{story:"Caller-side `isLoading`, which spins the trigger the same way the internal debounce and refetch pending states do."}}},render:a=>b.jsx(K,{...a,label:"User",isLoading:!0,isDisabled:!0})},ee={parameters:{docs:{description:{story:"No users match the query — the popup shows the shared empty-state text."}}},render:a=>b.jsx(K,{...a,label:"User",resolvers:pa,defaultOpen:!0})},ae={parameters:{docs:{description:{story:"The error status a form item sets when its `required` rule fails."}}},render:a=>b.jsx(K,{...a,label:"User",status:{type:"error",message:"Please select users."}})};var me,pe,fe;X.parameters={...X.parameters,docs:{...(me=X.parameters)==null?void 0:me.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: '\`scope={{ type: "admin" }}\` reads \`adminUsersV2\` — every user, which only a super-admin may list.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" />
}`,...(fe=(pe=X.parameters)==null?void 0:pe.docs)==null?void 0:fe.source}}};var ye,ge,be;Y.parameters={...Y.parameters,docs:{...(ye=Y.parameters)==null?void 0:ye.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: '\`scope={{ type: "domain", domainName }}\` reads \`domainUsersV2\` — the users of one domain, which a domain admin may list. \`useAdminUserSelectScope()\` picks this scope for a non-super-admin caller.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" scope={{
    type: 'domain',
    domainName: 'default'
  }} defaultOpen />
}`,...(be=(ge=Y.parameters)==null?void 0:ge.docs)==null?void 0:be.source}}};var Ve,ke,he;G.parameters={...G.parameters,docs:{...(Ve=G.parameters)==null?void 0:Ve.docs,source:{originalSource:`{
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
}`,...(he=(ke=G.parameters)==null?void 0:ke.docs)==null?void 0:he.source}}};var Ue,Se,ve;H.parameters={...H.parameters,docs:{...(Ue=H.parameters)==null?void 0:Ue.docs,source:{originalSource:`{
  name: 'Multiple Select',
  parameters: {
    docs: {
      description: {
        story: 'Multi-selection: the value is an array of keys and the trigger lists the selected emails.'
      }
    }
  },
  render: args => <Sandbox {...args} label="Users" multiple initialValue={['admin@example.com']} />
}`,...(ve=(Se=H.parameters)==null?void 0:Se.docs)==null?void 0:ve.source}}};var Ie,Ne,Ae;Z.parameters={...Z.parameters,docs:{...(Ie=Z.parameters)==null?void 0:Ie.docs,source:{originalSource:`{
  name: 'Exclude Inactive Users',
  parameters: {
    docs: {
      description: {
        story: '\`excludeInactive\` composes \`status: { equals: ACTIVE }\` into the \`UserV2Filter\`.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" excludeInactive />
}`,...(Ae=(Ne=Z.parameters)==null?void 0:Ne.docs)==null?void 0:Ae.source}}};var je,Fe,xe;J.parameters={...J.parameters,docs:{...(je=J.parameters)==null?void 0:je.docs,source:{originalSource:`{
  name: 'ID-valued',
  parameters: {
    docs: {
      description: {
        story: '\`valuePropName="id"\` — the plain-key value is the local user UUID, which is what \`adminBulkAssignRole\` and friends take. This is the only mode that runs the \`uuid in\` label-resolution query.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" valuePropName="id" />
}`,...(xe=(Fe=J.parameters)==null?void 0:Fe.docs)==null?void 0:xe.source}}};var Le,Be,Ke;W.parameters={...W.parameters,docs:{...(Le=W.parameters)==null?void 0:Le.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Caller-side \`isLoading\`, which spins the trigger the same way the internal debounce and refetch pending states do.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" isLoading isDisabled />
}`,...(Ke=(Be=W.parameters)==null?void 0:Be.docs)==null?void 0:Ke.source}}};var $e,De,Oe;ee.parameters={...ee.parameters,docs:{...($e=ee.parameters)==null?void 0:$e.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'No users match the query — the popup shows the shared empty-state text.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" resolvers={emptyResolvers} defaultOpen />
}`,...(Oe=(De=ee.parameters)==null?void 0:De.docs)==null?void 0:Oe.source}}};var Pe,Te,Qe;ae.parameters={...ae.parameters,docs:{...(Pe=ae.parameters)==null?void 0:Pe.docs,source:{originalSource:`{
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
}`,...(Qe=(Te=ae.parameters)==null?void 0:Te.docs)==null?void 0:Qe.source}}};const un=["AdminScope","DomainScope","ProjectScope","Multiple","ExcludeInactive","IdValued","Loading","Empty","Error"];export{X as AdminScope,Y as DomainScope,ee as Empty,ae as Error,Z as ExcludeInactive,J as IdValued,W as Loading,H as Multiple,G as ProjectScope,un as __namedExportsOrder,cn as default};
