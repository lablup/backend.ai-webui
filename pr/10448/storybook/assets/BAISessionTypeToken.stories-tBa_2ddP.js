import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t,t as n}from"./toString-DisgP18h.js";import{n as r,t as i}from"./isEmpty-CptDxjc2.js";import{t as a}from"./jsx-runtime-MKhVqBIO.js";import{n as o,t as s}from"./useBAIi18n-CcDjjg8q.js";import{t as c}from"./compiler-runtime-DU4U6aph.js";import{t as l}from"./react-relay-sHama7hJ.js";import{r as u}from"./astryxTagVariant-G-qTOScM.js";import{c as d}from"./helper-p-d7z67I.js";import{n as f,t as p}from"./Token-sEnhS7rJ.js";import{n as m,t as h}from"./RelayResolver-BnFyFQJn.js";function g(e){return t(e).toUpperCase()}function _(){return(_=e((()=>{n()})))()}var v;function y(){return(y=e((()=>{v={argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAISessionTypeTokenFragment`,selections:[{alias:null,args:null,kind:`ScalarField`,name:`type`,storageKey:null}],type:`ComputeSessionNode`,abstractKey:null},v.hash=`ad5858a78384baeaec4c29e369532a5b`})))()}var b,x;function S(){return(S=e((()=>{b={INTERACTIVE:`comp:BAISessionTypeToken.Interactive`,BATCH:`comp:BAISessionTypeToken.Batch`,INFERENCE:`comp:BAISessionTypeToken.Inference`,SYSTEM:`comp:BAISessionTypeToken.System`},x=(e,t)=>{let n=b[t];return n?e(n):t}})))()}var C,w,T,E;function D(){return(D=e((()=>{y(),C=c(),d(),S(),s(),f(),i(),_(),w=l(),T=a(),E=e=>{"use memo";let t=(0,C.c)(10),{sessionFrgmt:n}=e,{t:i}=o(),a=(0,w.useFragment)(v,n);if(r(a.type)){let e;return t[0]===Symbol.for(`react.memo_cache_sentinel`)?(e=(0,T.jsx)(T.Fragment,{children:`-`}),t[0]=e):e=t[0],e}let s,c,l;if(t[1]!==a.type||t[2]!==i){let e=g(a.type||``);s=p,c=u(`sessionType`,e),l=x(i,e),t[1]=a.type,t[2]=i,t[3]=s,t[4]=c,t[5]=l}else s=t[3],c=t[4],l=t[5];let d;return t[6]!==s||t[7]!==c||t[8]!==l?(d=(0,T.jsx)(s,{color:c,label:l}),t[6]=s,t[7]=c,t[8]=l,t[9]=d):d=t[9],d}})))()}var O;function k(){return(k=e((()=>{O=(function(){var e=[{kind:`Literal`,name:`id`,value:`test-id`}];return{fragment:{argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAISessionTypeTokenStoriesQuery`,selections:[{alias:null,args:e,concreteType:`ComputeSessionNode`,kind:`LinkedField`,name:`compute_session_node`,plural:!1,selections:[{args:null,kind:`FragmentSpread`,name:`BAISessionTypeTokenFragment`}],storageKey:`compute_session_node(id:"test-id")`}],type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[],kind:`Operation`,name:`BAISessionTypeTokenStoriesQuery`,selections:[{alias:null,args:e,concreteType:`ComputeSessionNode`,kind:`LinkedField`,name:`compute_session_node`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`type`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null}],storageKey:`compute_session_node(id:"test-id")`}]},params:{cacheID:`544efa84db4da8c4fc7b1f8ca5ac0492`,id:null,metadata:{},name:`BAISessionTypeTokenStoriesQuery`,operationKind:`query`,text:`query BAISessionTypeTokenStoriesQuery {
  compute_session_node(id: "test-id") {
    ...BAISessionTypeTokenFragment
    id
  }
}

fragment BAISessionTypeTokenFragment on ComputeSessionNode {
  type
}
`}}})(),O.hash=`52f3cae3481fbfb07ce4ad64aaafce18`})))()}var A,j,M,N,P,F,I,L,R,z,B,V,H,U;function W(){return(W=e((()=>{k(),m(),D(),A=l(),j=a(),R={title:`Fragments/BAISessionTypeToken`,component:E,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`
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
        `}}},argTypes:{sessionFrgmt:{control:!1,description:`Relay fragment reference for session data (contains type field)`,table:{type:{summary:`BAISessionTypeTokenFragment$key`}}}}},z=()=>{let{compute_session_node:e}=(0,A.useLazyLoadQuery)(O,{});return e&&(0,j.jsx)(E,{sessionFrgmt:e})},B={name:`Basic`,parameters:{docs:{description:{story:`Displays an INTERACTIVE session type token in blue.`}}},render:()=>(0,j.jsx)(h,{mockResolvers:{ComputeSessionNode:()=>({type:`INTERACTIVE`})},children:(0,j.jsx)(z,{})})},V={name:`BATCH`,parameters:{docs:{description:{story:`Displays a BATCH session type token in cyan.`}}},render:()=>(0,j.jsx)(h,{mockResolvers:{ComputeSessionNode:()=>({type:`BATCH`})},children:(0,j.jsx)(z,{})})},H={name:`INFERENCE`,parameters:{docs:{description:{story:`Displays an INFERENCE session type token in purple.`}}},render:()=>(0,j.jsx)(h,{mockResolvers:{ComputeSessionNode:()=>({type:`INFERENCE`})},children:(0,j.jsx)(z,{})})},B.parameters={...B.parameters,docs:{...(M=B.parameters)==null?void 0:M.docs,source:{originalSource:`{
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
}`,...(N=B.parameters)==null||(N=N.docs)==null?void 0:N.source}}},V.parameters={...V.parameters,docs:{...(P=V.parameters)==null?void 0:P.docs,source:{originalSource:`{
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
}`,...(F=V.parameters)==null||(F=F.docs)==null?void 0:F.source}}},H.parameters={...H.parameters,docs:{...(I=H.parameters)==null?void 0:I.docs,source:{originalSource:`{
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
}`,...(L=H.parameters)==null||(L=L.docs)==null?void 0:L.source}}},U=[`Default`,`Batch`,`Inference`]})))()}W();export{V as Batch,B as Default,H as Inference,U as __namedExportsOrder,R as default};