import{c as _,b,j as n}from"./iframe-B1EYSvAG.js";import{R as T}from"./RelayResolver-BKlWgtbG.js";import{r as B}from"./index-Ce6-RXP2.js";import{i as x}from"./isEmpty-C1gJEM9Y.js";import{t as D}from"./toString-DMYqsoLK.js";import{T as j}from"./Token-CFvC6JNO.js";import{t as Q}from"./astryxTagVariant-CCI-sVE6.js";import"./preload-helper-Dp1pzeXC.js";import"./index-CiRCOWXx.js";import"./isSymbol-CV-spp-R.js";import"./useInteractiveRole-Re_g8CgT.js";import"./composeEventHandlers-BolWE7qY.js";function H(s){return D(s).toUpperCase()}const F={argumentDefinitions:[],kind:"Fragment",metadata:null,name:"BAISessionTypeTokenFragment",selections:[{alias:null,args:null,kind:"ScalarField",name:"type",storageKey:null}],type:"ComputeSessionNode",abstractKey:null};F.hash="ad5858a78384baeaec4c29e369532a5b";const K={INTERACTIVE:"comp:BAISessionTypeToken.Interactive",BATCH:"comp:BAISessionTypeToken.Batch",INFERENCE:"comp:BAISessionTypeToken.Inference",SYSTEM:"comp:BAISessionTypeToken.System"},L=(s,e)=>{const i=K[e];return i?s(i):e},v=s=>{"use memo";const e=_.c(11),{sessionFrgmt:i}=s,{t:u}=b();let p;e[0]===Symbol.for("react.memo_cache_sentinel")?(p=F,e[0]=p):p=e[0];const l=B.useFragment(p,i);if(x(l.type)){let o;return e[1]===Symbol.for("react.memo_cache_sentinel")?(o=n.jsx(n.Fragment,{children:"-"}),e[1]=o):o=e[1],o}let t,r,a;if(e[2]!==l.type||e[3]!==u){const o=H(l.type||"");t=j,r=Q("sessionType",o),a=L(u,o),e[2]=l.type,e[3]=u,e[4]=t,e[5]=r,e[6]=a}else t=e[4],r=e[5],a=e[6];let c;return e[7]!==t||e[8]!==r||e[9]!==a?(c=n.jsx(t,{color:r,label:a}),e[7]=t,e[8]=r,e[9]=a,e[10]=c):c=e[10],c},h=(function(){var s=[{kind:"Literal",name:"id",value:"test-id"}];return{fragment:{argumentDefinitions:[],kind:"Fragment",metadata:null,name:"BAISessionTypeTokenStoriesQuery",selections:[{alias:null,args:s,concreteType:"ComputeSessionNode",kind:"LinkedField",name:"compute_session_node",plural:!1,selections:[{args:null,kind:"FragmentSpread",name:"BAISessionTypeTokenFragment"}],storageKey:'compute_session_node(id:"test-id")'}],type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[],kind:"Operation",name:"BAISessionTypeTokenStoriesQuery",selections:[{alias:null,args:s,concreteType:"ComputeSessionNode",kind:"LinkedField",name:"compute_session_node",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"type",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null}],storageKey:'compute_session_node(id:"test-id")'}]},params:{cacheID:"544efa84db4da8c4fc7b1f8ca5ac0492",id:null,metadata:{},name:"BAISessionTypeTokenStoriesQuery",operationKind:"query",text:`query BAISessionTypeTokenStoriesQuery {
  compute_session_node(id: "test-id") {
    ...BAISessionTypeTokenFragment
    id
  }
}

fragment BAISessionTypeTokenFragment on ComputeSessionNode {
  type
}
`}}})();h.hash="52f3cae3481fbfb07ce4ad64aaafce18";const W={title:"Fragments/BAISessionTypeToken",component:v,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:`
**BAISessionTypeToken** is a Relay fragment component that displays a coloured Token for session types.

## Features
- Colour-coded tokens based on session type
- Supports three session types: INTERACTIVE, BATCH, INFERENCE
- Shows the translated session type name
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
        `}}},argTypes:{sessionFrgmt:{control:!1,description:"Relay fragment reference for session data (contains type field)",table:{type:{summary:"BAISessionTypeTokenFragment$key"}}}}},S=()=>{const{compute_session_node:s}=B.useLazyLoadQuery(h,{});return s&&n.jsx(v,{sessionFrgmt:s})},m={name:"Basic",parameters:{docs:{description:{story:"Displays an INTERACTIVE session type token in blue."}}},render:()=>n.jsx(T,{mockResolvers:{ComputeSessionNode:()=>({type:"INTERACTIVE"})},children:n.jsx(S,{})})},y={name:"BATCH",parameters:{docs:{description:{story:"Displays a BATCH session type token in cyan."}}},render:()=>n.jsx(T,{mockResolvers:{ComputeSessionNode:()=>({type:"BATCH"})},children:n.jsx(S,{})})},d={name:"INFERENCE",parameters:{docs:{description:{story:"Displays an INFERENCE session type token in purple."}}},render:()=>n.jsx(T,{mockResolvers:{ComputeSessionNode:()=>({type:"INFERENCE"})},children:n.jsx(S,{})})};var E,k,f;m.parameters={...m.parameters,docs:{...(E=m.parameters)==null?void 0:E.docs,source:{originalSource:`{
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
}`,...(f=(k=m.parameters)==null?void 0:k.docs)==null?void 0:f.source}}};var I,R,g;y.parameters={...y.parameters,docs:{...(I=y.parameters)==null?void 0:I.docs,source:{originalSource:`{
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
}`,...(g=(R=y.parameters)==null?void 0:R.docs)==null?void 0:g.source}}};var C,N,A;d.parameters={...d.parameters,docs:{...(C=d.parameters)==null?void 0:C.docs,source:{originalSource:`{
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
}`,...(A=(N=d.parameters)==null?void 0:N.docs)==null?void 0:A.source}}};const X=["Default","Batch","Inference"];export{y as Batch,m as Default,d as Inference,X as __namedExportsOrder,W as default};
