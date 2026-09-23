import{j as e}from"./iframe-xli-3ODD.js";import{R as t}from"./RelayResolver-DGpuACSY.js";import{r as R}from"./index-BEzmjuBU.js";import{i as S}from"./isEmpty-BSS19O1z.js";import{t as C}from"./toString-Bpa1ry7B.js";import{T as N}from"./Token-DeUOTjOt.js";import{t as F}from"./astryxTagVariant-DMDpeCrV.js";import"./preload-helper-Dp1pzeXC.js";import"./index-CtwW_l26.js";import"./isSymbol-C9iNTJ3b.js";import"./composeEventHandlers-BolWE7qY.js";function A(s){return C(s).toUpperCase()}const f={argumentDefinitions:[],kind:"Fragment",metadata:null,name:"BAISessionTypeTokenFragment",selections:[{alias:null,args:null,kind:"ScalarField",name:"type",storageKey:null}],type:"ComputeSessionNode",abstractKey:null};f.hash="ad5858a78384baeaec4c29e369532a5b";const E=({sessionFrgmt:s})=>{const i=R.useFragment(f,s);if(S(i.type))return e.jsx(e.Fragment,{children:"-"});const p=A(i.type||"");return e.jsx(N,{color:F("sessionType",p),label:p})},I=(function(){var s=[{kind:"Literal",name:"id",value:"test-id"}];return{fragment:{argumentDefinitions:[],kind:"Fragment",metadata:null,name:"BAISessionTypeTokenStoriesQuery",selections:[{alias:null,args:s,concreteType:"ComputeSessionNode",kind:"LinkedField",name:"compute_session_node",plural:!1,selections:[{args:null,kind:"FragmentSpread",name:"BAISessionTypeTokenFragment"}],storageKey:'compute_session_node(id:"test-id")'}],type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[],kind:"Operation",name:"BAISessionTypeTokenStoriesQuery",selections:[{alias:null,args:s,concreteType:"ComputeSessionNode",kind:"LinkedField",name:"compute_session_node",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"type",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null}],storageKey:'compute_session_node(id:"test-id")'}]},params:{cacheID:"544efa84db4da8c4fc7b1f8ca5ac0492",id:null,metadata:{},name:"BAISessionTypeTokenStoriesQuery",operationKind:"query",text:`query BAISessionTypeTokenStoriesQuery {
  compute_session_node(id: "test-id") {
    ...BAISessionTypeTokenFragment
    id
  }
}

fragment BAISessionTypeTokenFragment on ComputeSessionNode {
  type
}
`}}})();I.hash="52f3cae3481fbfb07ce4ad64aaafce18";const L={title:"Fragments/BAISessionTypeToken",component:E,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:`
**BAISessionTypeToken** is a Relay fragment component that displays a coloured Token for session types.

## Features
- Colour-coded tokens based on session type
- Supports three session types: INTERACTIVE, BATCH, INFERENCE
- Automatically uppercases the session type text
- Uses GraphQL fragment for data fetching

## Session Type Colors
| Type | Color | Description |
|------|-------|-------------|
| INTERACTIVE | geekblue | Interactive sessions |
| BATCH | cyan | Batch processing sessions |
| INFERENCE | purple | Inference sessions |

## Props
| Name | Type | Description |
|------|------|-------------|
| \`sessionFrgmt\` | \`BAISessionTypeTokenFragment$key\` | Relay fragment reference containing session type |
        `}}},argTypes:{sessionFrgmt:{control:!1,description:"Relay fragment reference for session data (contains type field)",table:{type:{summary:"BAISessionTypeTokenFragment$key"}}}}},a=()=>{const{compute_session_node:s}=R.useLazyLoadQuery(I,{});return s&&e.jsx(E,{sessionFrgmt:s})},n={name:"Basic",parameters:{docs:{description:{story:"Displays an INTERACTIVE session type token in blue."}}},render:()=>e.jsx(t,{mockResolvers:{ComputeSessionNode:()=>({type:"INTERACTIVE"})},children:e.jsx(a,{})})},o={name:"BATCH",parameters:{docs:{description:{story:"Displays a BATCH session type token in cyan."}}},render:()=>e.jsx(t,{mockResolvers:{ComputeSessionNode:()=>({type:"BATCH"})},children:e.jsx(a,{})})},r={name:"INFERENCE",parameters:{docs:{description:{story:"Displays an INFERENCE session type token in purple."}}},render:()=>e.jsx(t,{mockResolvers:{ComputeSessionNode:()=>({type:"INFERENCE"})},children:e.jsx(a,{})})};var l,c,m;n.parameters={...n.parameters,docs:{...(l=n.parameters)==null?void 0:l.docs,source:{originalSource:`{
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'Displays an INTERACTIVE session type token in blue.'
      }
    }
  },
  render: () => {
    return <RelayResolver mockResolvers={{
      ComputeSessionNode: () => ({
        type: 'INTERACTIVE'
      })
    }}>
        <QueryResolver />
      </RelayResolver>;
  }
}`,...(m=(c=n.parameters)==null?void 0:c.docs)==null?void 0:m.source}}};var d,y,u;o.parameters={...o.parameters,docs:{...(d=o.parameters)==null?void 0:d.docs,source:{originalSource:`{
  name: 'BATCH',
  parameters: {
    docs: {
      description: {
        story: 'Displays a BATCH session type token in cyan.'
      }
    }
  },
  render: () => {
    return <RelayResolver mockResolvers={{
      ComputeSessionNode: () => ({
        type: 'BATCH'
      })
    }}>
        <QueryResolver />
      </RelayResolver>;
  }
}`,...(u=(y=o.parameters)==null?void 0:y.docs)==null?void 0:u.source}}};var T,g,k;r.parameters={...r.parameters,docs:{...(T=r.parameters)==null?void 0:T.docs,source:{originalSource:`{
  name: 'INFERENCE',
  parameters: {
    docs: {
      description: {
        story: 'Displays an INFERENCE session type token in purple.'
      }
    }
  },
  render: () => {
    return <RelayResolver mockResolvers={{
      ComputeSessionNode: () => ({
        type: 'INFERENCE'
      })
    }}>
        <QueryResolver />
      </RelayResolver>;
  }
}`,...(k=(g=r.parameters)==null?void 0:g.docs)==null?void 0:k.source}}};const V=["Default","Batch","Inference"];export{o as Batch,n as Default,r as Inference,V as __namedExportsOrder,L as default};
