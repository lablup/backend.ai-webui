import{c as g,j as A}from"./iframe-CXDrtD-Y.js";import{B as k}from"./BAISelect-DeHDXf1x.js";import{u as S}from"./useConnectedBAIClient-D7sjGH_a.js";import{r as _}from"./index-yzpQEIXq.js";import{m as p}from"./map-CsonK3pE.js";import{s as P}from"./sortBy-Dxgfz9B5.js";const y=(function(){var n={defaultValue:null,kind:"LocalArgument",name:"isSuperAdmin"},e={defaultValue:null,kind:"LocalArgument",name:"limit"},l=[{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"name",storageKey:null}],m=[{condition:"isSuperAdmin",kind:"Condition",passingValue:!0,selections:[{alias:null,args:[{kind:"Variable",name:"limit",variableName:"limit"},{kind:"Literal",name:"orderBy",value:[{direction:"ASC",field:"NAME"}]}],concreteType:"ProjectResourcePolicyV2Connection",kind:"LinkedField",name:"adminProjectResourcePoliciesV2",plural:!1,selections:[{alias:null,args:null,concreteType:"ProjectResourcePolicyV2Edge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"ProjectResourcePolicyV2",kind:"LinkedField",name:"node",plural:!1,selections:l,storageKey:null}],storageKey:null}],storageKey:null}]},{condition:"isSuperAdmin",kind:"Condition",passingValue:!1,selections:[{alias:null,args:null,concreteType:"ProjectResourcePolicy",kind:"LinkedField",name:"project_resource_policies",plural:!0,selections:l,storageKey:null}]}];return{fragment:{argumentDefinitions:[n,e],kind:"Fragment",metadata:null,name:"BAIProjectResourcePolicySelectQuery",selections:m,type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[e,n],kind:"Operation",name:"BAIProjectResourcePolicySelectQuery",selections:m},params:{cacheID:"6fa2930c993b5bab286f46d59d192a40",id:null,metadata:{},name:"BAIProjectResourcePolicySelectQuery",operationKind:"query",text:`query BAIProjectResourcePolicySelectQuery(
  $limit: Int!
  $isSuperAdmin: Boolean!
) {
  adminProjectResourcePoliciesV2(limit: $limit, orderBy: [{field: NAME, direction: ASC}]) @include(if: $isSuperAdmin) {
    edges {
      node {
        id
        name
      }
    }
  }
  project_resource_policies @skip(if: $isSuperAdmin) {
    id
    name
  }
}
`}}})();y.hash="133bc6b0a14a92d46be068cad9e85d90";const b=1e3,x=n=>{"use memo";const e=g.c(15);let l;e[0]!==n?({...l}=n,e[0]=n,e[1]=l):l=e[1];const t=!!S().is_superadmin;let o;e[2]===Symbol.for("react.memo_cache_sentinel")?(o=y,e[2]=o):o=e[2];let s;e[3]!==t?(s={limit:b,isSuperAdmin:t},e[3]=t,e[4]=s):s=e[4];let c;e[5]===Symbol.for("react.memo_cache_sentinel")?(c={},e[5]=c):c=e[5];const{adminProjectResourcePoliciesV2:i,project_resource_policies:d}=_.useLazyLoadQuery(o,s,c);let r,a;if(e[6]!==(i==null?void 0:i.edges)||e[7]!==t||e[8]!==d){const f=t?p(i==null?void 0:i.edges,B):p(d,j);r=k,a=p(P(f),I),e[6]=i==null?void 0:i.edges,e[7]=t,e[8]=d,e[9]=r,e[10]=a}else r=e[9],a=e[10];let u;return e[11]!==r||e[12]!==l||e[13]!==a?(u=A.jsx(r,{options:a,showSearch:!0,...l}),e[11]=r,e[12]=l,e[13]=a,e[14]=u):u=e[14],u};function B(n){return n.node.name}function j(n){return n==null?void 0:n.name}function I(n){return{label:n,value:n}}export{x as B};
