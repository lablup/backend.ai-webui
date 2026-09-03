import{j as t}from"./iframe--8cJDbW2.js";import{B as o}from"./BAISelect-Cij7uiU1.js";import{r as s}from"./index-CSjr-aSd.js";import{m as c}from"./map-BYioM7aM.js";import{s as l}from"./sortBy-CBpEnkF6.js";const a=(function(){var r=[{alias:null,args:null,concreteType:"ProjectResourcePolicy",kind:"LinkedField",name:"project_resource_policies",plural:!0,selections:[{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"name",storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:[],kind:"Fragment",metadata:null,name:"BAIProjectResourcePolicySelectQuery",selections:r,type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[],kind:"Operation",name:"BAIProjectResourcePolicySelectQuery",selections:r},params:{cacheID:"39cc27464533ff3c069e6a09e9c9f6d7",id:null,metadata:{},name:"BAIProjectResourcePolicySelectQuery",operationKind:"query",text:`query BAIProjectResourcePolicySelectQuery {
  project_resource_policies {
    id
    name
  }
}
`}}})();a.hash="14c444e2cf01f37216116304c1d4efa1";const p=({...r})=>{const{project_resource_policies:n}=s.useLazyLoadQuery(a,{},{});return t.jsx(o,{options:c(l(n,"name"),e=>({label:e==null?void 0:e.name,value:e==null?void 0:e.name})),showSearch:!0,...r})};export{p as B};
