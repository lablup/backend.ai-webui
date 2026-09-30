import{c as P,j as k}from"./iframe-B9YeRq-v.js";import{B as R}from"./BAISelect-5UT3mvxW.js";import{u as _}from"./useConnectedBAIClient-D1tKnZhT.js";import{r as A}from"./index-Bo3LHRG2.js";import{m as y}from"./map-00A2Asmc.js";import{s as S}from"./sortBy-D714_hf6.js";const f=(function(){var n=[{defaultValue:null,kind:"LocalArgument",name:"limit"},{defaultValue:null,kind:"LocalArgument",name:"supportsResourcePolicyV2"}],e=[{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"name",storageKey:null}],l=[{condition:"supportsResourcePolicyV2",kind:"Condition",passingValue:!0,selections:[{alias:null,args:[{kind:"Variable",name:"limit",variableName:"limit"},{kind:"Literal",name:"orderBy",value:[{direction:"ASC",field:"NAME"}]}],concreteType:"ProjectResourcePolicyV2Connection",kind:"LinkedField",name:"adminProjectResourcePoliciesV2",plural:!1,selections:[{alias:null,args:null,concreteType:"ProjectResourcePolicyV2Edge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"ProjectResourcePolicyV2",kind:"LinkedField",name:"node",plural:!1,selections:e,storageKey:null}],storageKey:null}],storageKey:null}]},{condition:"supportsResourcePolicyV2",kind:"Condition",passingValue:!1,selections:[{alias:null,args:null,concreteType:"ProjectResourcePolicy",kind:"LinkedField",name:"project_resource_policies",plural:!0,selections:e,storageKey:null}]}];return{fragment:{argumentDefinitions:n,kind:"Fragment",metadata:null,name:"BAIProjectResourcePolicySelectQuery",selections:l,type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:n,kind:"Operation",name:"BAIProjectResourcePolicySelectQuery",selections:l},params:{cacheID:"2619526973e0edb188bc9fd96cc676d3",id:null,metadata:{},name:"BAIProjectResourcePolicySelectQuery",operationKind:"query",text:`query BAIProjectResourcePolicySelectQuery(
  $limit: Int!
  $supportsResourcePolicyV2: Boolean!
) {
  adminProjectResourcePoliciesV2(limit: $limit, orderBy: [{field: NAME, direction: ASC}]) @include(if: $supportsResourcePolicyV2) @since(version: "26.4.2") {
    edges {
      node {
        id
        name
      }
    }
  }
  project_resource_policies @skip(if: $supportsResourcePolicyV2) @deprecatedSince(version: "26.4.2") {
    id
    name
  }
}
`}}})();f.hash="439df4d2e35fc7c668b6284d96f5589e";const B=1e3,x=n=>{"use memo";const e=P.c(17);let l;e[0]!==n?({...l}=n,e[0]=n,e[1]=l):l=e[1];const m=_();let s;e[2]!==m?(s=m.supports("resource-policy-v2"),e[2]=m,e[3]=s):s=e[3];const t=s;let a;e[4]===Symbol.for("react.memo_cache_sentinel")?(a=f,e[4]=a):a=e[4];let c;e[5]!==t?(c={limit:B,supportsResourcePolicyV2:t},e[5]=t,e[6]=c):c=e[6];let u;e[7]===Symbol.for("react.memo_cache_sentinel")?(u={},e[7]=u):u=e[7];const{adminProjectResourcePoliciesV2:o,project_resource_policies:p}=A.useLazyLoadQuery(a,c,u);let i,r;if(e[8]!==(o==null?void 0:o.edges)||e[9]!==p||e[10]!==t){const g=t?y(o==null?void 0:o.edges,j):y(p,I);i=R,r=y(S(g),V),e[8]=o==null?void 0:o.edges,e[9]=p,e[10]=t,e[11]=i,e[12]=r}else i=e[11],r=e[12];let d;return e[13]!==i||e[14]!==l||e[15]!==r?(d=k.jsx(i,{options:r,showSearch:!0,...l}),e[13]=i,e[14]=l,e[15]=r,e[16]=d):d=e[16],d};function j(n){return n.node.name}function I(n){return n==null?void 0:n.name}function V(n){return{label:n,value:n}}export{x as B};
