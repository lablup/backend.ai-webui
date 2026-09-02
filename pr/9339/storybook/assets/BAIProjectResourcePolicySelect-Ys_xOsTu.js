import{j as t}from"./iframe-CmVX5OZn.js";import{B as o}from"./BAISelect-DZsfO849.js";import{r as s}from"./index-0WfGjRaV.js";import{m as c}from"./map-ru_l9HFl.js";import{s as l}from"./sortBy-CVawha8g.js";const a=(function(){var r=[{alias:null,args:null,concreteType:"ProjectResourcePolicy",kind:"LinkedField",name:"project_resource_policies",plural:!0,selections:[{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"name",storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:[],kind:"Fragment",metadata:null,name:"BAIProjectResourcePolicySelectQuery",selections:r,type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[],kind:"Operation",name:"BAIProjectResourcePolicySelectQuery",selections:r},params:{cacheID:"39cc27464533ff3c069e6a09e9c9f6d7",id:null,metadata:{},name:"BAIProjectResourcePolicySelectQuery",operationKind:"query",text:`query BAIProjectResourcePolicySelectQuery {
  project_resource_policies {
    id
    name
  }
}
`}}})();a.hash="14c444e2cf01f37216116304c1d4efa1";const p=({...r})=>{const{project_resource_policies:n}=s.useLazyLoadQuery(a,{},{});return t.jsx(o,{options:c(l(n,"name"),e=>({label:e==null?void 0:e.name,value:e==null?void 0:e.name})),showSearch:!0,...r})};export{p as B};
