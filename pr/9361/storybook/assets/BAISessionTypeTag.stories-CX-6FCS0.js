import{j as e}from"./iframe-BykfVULJ.js";import{R as t}from"./RelayResolver-C6ADZt3v.js";import{a as C}from"./astryxTagVariant-CPCr7vTB.js";import{r as E}from"./index-D1xcfV84.js";import{i as N}from"./isEmpty-Bu28tXBj.js";import{t as F}from"./toString-B-K9_WlE.js";import{B as A}from"./Badge-CnOOI1Bo.js";import"./preload-helper-Dp1pzeXC.js";import"./index-CnDEOBTY.js";import"./isSymbol-Dzm5GTZj.js";function B(s){return F(s).toUpperCase()}const f={argumentDefinitions:[],kind:"Fragment",metadata:null,name:"BAISessionTypeTagFragment",selections:[{alias:null,args:null,kind:"ScalarField",name:"type",storageKey:null}],type:"ComputeSessionNode",abstractKey:null};f.hash="d80914098e3bb7b9a8831664533a4022";const I=({sessionFrgmt:s})=>{const i=E.useFragment(f,s);if(N(i.type))return e.jsx(e.Fragment,{children:"-"});const p=B(i.type||"");return e.jsx(A,{variant:C("sessionType",p),label:p})},S=(function(){var s=[{kind:"Literal",name:"id",value:"test-id"}];return{fragment:{argumentDefinitions:[],kind:"Fragment",metadata:null,name:"BAISessionTypeTagStoriesQuery",selections:[{alias:null,args:s,concreteType:"ComputeSessionNode",kind:"LinkedField",name:"compute_session_node",plural:!1,selections:[{args:null,kind:"FragmentSpread",name:"BAISessionTypeTagFragment"}],storageKey:'compute_session_node(id:"test-id")'}],type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[],kind:"Operation",name:"BAISessionTypeTagStoriesQuery",selections:[{alias:null,args:s,concreteType:"ComputeSessionNode",kind:"LinkedField",name:"compute_session_node",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"type",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null}],storageKey:'compute_session_node(id:"test-id")'}]},params:{cacheID:"fdc449b1bc1e5052271a94f3d1d6f731",id:null,metadata:{},name:"BAISessionTypeTagStoriesQuery",operationKind:"query",text:`query BAISessionTypeTagStoriesQuery {
  compute_session_node(id: "test-id") {
    ...BAISessionTypeTagFragment
    id
  }
}

fragment BAISessionTypeTagFragment on ComputeSessionNode {
  type
}
`}}})();S.hash="04a515b49499e71f2318e6d8c052c8bd";const K={title:"Fragments/BAISessionTypeTag",component:I,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:`
**BAISessionTypeTag** is a Relay fragment component that displays a colored tag for session types.

## Features
- Color-coded tags based on session type
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
| \`sessionFrgmt\` | \`BAISessionTypeTagFragment$key\` | Relay fragment reference containing session type |
        `}}},argTypes:{sessionFrgmt:{control:!1,description:"Relay fragment reference for session data (contains type field)",table:{type:{summary:"BAISessionTypeTagFragment$key"}}}}},a=()=>{const{compute_session_node:s}=E.useLazyLoadQuery(S,{});return s&&e.jsx(I,{sessionFrgmt:s})},n={name:"Basic",parameters:{docs:{description:{story:"Displays an INTERACTIVE session type tag with geekblue color."}}},render:()=>e.jsx(t,{mockResolvers:{ComputeSessionNode:()=>({type:"INTERACTIVE"})},children:e.jsx(a,{})})},o={name:"BATCH",parameters:{docs:{description:{story:"Displays a BATCH session type tag with cyan color."}}},render:()=>e.jsx(t,{mockResolvers:{ComputeSessionNode:()=>({type:"BATCH"})},children:e.jsx(a,{})})},r={name:"INFERENCE",parameters:{docs:{description:{story:"Displays an INFERENCE session type tag with purple color."}}},render:()=>e.jsx(t,{mockResolvers:{ComputeSessionNode:()=>({type:"INFERENCE"})},children:e.jsx(a,{})})};var l,c,m;n.parameters={...n.parameters,docs:{...(l=n.parameters)==null?void 0:l.docs,source:{originalSource:`{
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'Displays an INTERACTIVE session type tag with geekblue color.'
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
        story: 'Displays a BATCH session type tag with cyan color.'
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
}`,...(u=(y=o.parameters)==null?void 0:y.docs)==null?void 0:u.source}}};var g,T,R;r.parameters={...r.parameters,docs:{...(g=r.parameters)==null?void 0:g.docs,source:{originalSource:`{
  name: 'INFERENCE',
  parameters: {
    docs: {
      description: {
        story: 'Displays an INFERENCE session type tag with purple color.'
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
}`,...(R=(T=r.parameters)==null?void 0:T.docs)==null?void 0:R.source}}};const V=["Default","Batch","Inference"];export{o as Batch,n as Default,r as Inference,V as __namedExportsOrder,K as default};
