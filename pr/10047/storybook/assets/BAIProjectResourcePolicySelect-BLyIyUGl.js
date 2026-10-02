import{c as y,j as p}from"./iframe-D0Z6Tyuv.js";import{B as f}from"./BAISelect-CKVHPof2.js";import{r as g}from"./index-SJmsH3wo.js";import{m as u}from"./map-8gT3rQBF.js";import{s as k}from"./sortBy-DgY4fOnX.js";const m=(function(){var l=[{defaultValue:null,kind:"LocalArgument",name:"limit"}],e=[{alias:null,args:[{kind:"Variable",name:"limit",variableName:"limit"},{kind:"Literal",name:"orderBy",value:[{direction:"ASC",field:"NAME"}]}],concreteType:"ProjectResourcePolicyV2Connection",kind:"LinkedField",name:"adminProjectResourcePoliciesV2",plural:!1,selections:[{alias:null,args:null,concreteType:"ProjectResourcePolicyV2Edge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"ProjectResourcePolicyV2",kind:"LinkedField",name:"node",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"name",storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:l,kind:"Fragment",metadata:null,name:"BAIProjectResourcePolicySelectQuery",selections:e,type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:l,kind:"Operation",name:"BAIProjectResourcePolicySelectQuery",selections:e},params:{cacheID:"6a3fd80d898f34a903548c48ccf308ce",id:null,metadata:{},name:"BAIProjectResourcePolicySelectQuery",operationKind:"query",text:`query BAIProjectResourcePolicySelectQuery(
  $limit: Int!
) {
  adminProjectResourcePoliciesV2(limit: $limit, orderBy: [{field: NAME, direction: ASC}]) {
    edges {
      node {
        id
        name
      }
    }
  }
}
`}}})();m.hash="c0a5c2859443c7fc9caad17553e6b91b";const P=1e3,b=l=>{"use memo";const e=y.c(12);let t;e[0]!==l?({...t}=l,e[0]=l,e[1]=t):t=e[1];let i,o,s;e[2]===Symbol.for("react.memo_cache_sentinel")?(i=m,o={limit:P},s={},e[2]=i,e[3]=o,e[4]=s):(i=e[2],o=e[3],s=e[4]);const{adminProjectResourcePoliciesV2:n}=g.useLazyLoadQuery(i,o,s);let a,r;if(e[5]!==(n==null?void 0:n.edges)){const d=u(n==null?void 0:n.edges,A);a=f,r=u(k(d),S),e[5]=n==null?void 0:n.edges,e[6]=a,e[7]=r}else a=e[6],r=e[7];let c;return e[8]!==a||e[9]!==t||e[10]!==r?(c=p.jsx(a,{options:r,showSearch:!0,...t}),e[8]=a,e[9]=t,e[10]=r,e[11]=c):c=e[11],c};function A(l){return l.node.name}function S(l){return{label:l,value:l}}export{b as B};
