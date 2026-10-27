import{n as e}from"./rolldown-runtime-2s6bX4vc.js";import{n as t,t as n}from"./toString-D-HqYh4D.js";import{n as r,t as i}from"./isEmpty-C3CFE_pY.js";import{n as a,t as o}from"./useBAIi18n-BoXCk5K0.js";import{r as s}from"./astryxTagVariant-Gg8xzDlT.js";import{c}from"./helper-DV0q0X9R.js";import{n as l,t as u}from"./RelayResolver-b1nJU57O.js";import{Fragment as d,jsx as f}from"react/jsx-runtime";import{c as p}from"react/compiler-runtime";import{useFragment as m,useLazyLoadQuery as h}from"react-relay";import{Token as g}from"@lablup/ui-common/Token";function _(e){return t(e).toUpperCase()}function v(){return(v=e((()=>{n()})))()}var y;function b(){return(b=e((()=>{y={argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAISessionTypeTokenFragment`,selections:[{alias:null,args:null,kind:`ScalarField`,name:`type`,storageKey:null}],type:`ComputeSessionNode`,abstractKey:null},y.hash=`ad5858a78384baeaec4c29e369532a5b`})))()}var x,S;function C(){return(C=e((()=>{x={INTERACTIVE:`comp:BAISessionTypeToken.Interactive`,BATCH:`comp:BAISessionTypeToken.Batch`,INFERENCE:`comp:BAISessionTypeToken.Inference`,SYSTEM:`comp:BAISessionTypeToken.System`},S=(e,t)=>{let n=x[t];return n?e(n):t}})))()}var w;function T(){return(T=e((()=>{b(),c(),C(),o(),i(),v(),w=e=>{"use memo";let t=p(10),{sessionFrgmt:n}=e,{t:i}=a(),o=m(y,n);if(r(o.type)){let e;return t[0]===Symbol.for(`react.memo_cache_sentinel`)?(e=f(d,{children:`-`}),t[0]=e):e=t[0],e}let c,l,u;if(t[1]!==o.type||t[2]!==i){let e=_(o.type||``);c=g,l=s(`sessionType`,e),u=S(i,e),t[1]=o.type,t[2]=i,t[3]=c,t[4]=l,t[5]=u}else c=t[3],l=t[4],u=t[5];let h;return t[6]!==c||t[7]!==l||t[8]!==u?(h=f(c,{color:l,label:u}),t[6]=c,t[7]=l,t[8]=u,t[9]=h):h=t[9],h}})))()}var E;function D(){return(D=e((()=>{E=(function(){var e=[{kind:`Literal`,name:`id`,value:`test-id`}];return{fragment:{argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAISessionTypeTokenStoriesQuery`,selections:[{alias:null,args:e,concreteType:`ComputeSessionNode`,kind:`LinkedField`,name:`compute_session_node`,plural:!1,selections:[{args:null,kind:`FragmentSpread`,name:`BAISessionTypeTokenFragment`}],storageKey:`compute_session_node(id:"test-id")`}],type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[],kind:`Operation`,name:`BAISessionTypeTokenStoriesQuery`,selections:[{alias:null,args:e,concreteType:`ComputeSessionNode`,kind:`LinkedField`,name:`compute_session_node`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`type`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null}],storageKey:`compute_session_node(id:"test-id")`}]},params:{cacheID:`544efa84db4da8c4fc7b1f8ca5ac0492`,id:null,metadata:{},name:`BAISessionTypeTokenStoriesQuery`,operationKind:`query`,text:`query BAISessionTypeTokenStoriesQuery {
  compute_session_node(id: "test-id") {
    ...BAISessionTypeTokenFragment
    id
  }
}

fragment BAISessionTypeTokenFragment on ComputeSessionNode {
  type
}
`}}})(),E.hash=`52f3cae3481fbfb07ce4ad64aaafce18`})))()}var O,k,A,j,M,N;function P(){return(P=e((()=>{D(),l(),T(),O={title:`Fragments/BAISessionTypeToken`,component:w,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`
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
        `}}},argTypes:{sessionFrgmt:{control:!1,description:`Relay fragment reference for session data (contains type field)`,table:{type:{summary:`BAISessionTypeTokenFragment$key`}}}}},k=()=>{let{compute_session_node:e}=h(E,{});return e&&f(w,{sessionFrgmt:e})},A={name:`Basic`,parameters:{docs:{description:{story:`Displays an INTERACTIVE session type token in blue.`}}},render:()=>f(u,{mockResolvers:{ComputeSessionNode:()=>({type:`INTERACTIVE`})},children:f(k,{})})},j={name:`BATCH`,parameters:{docs:{description:{story:`Displays a BATCH session type token in cyan.`}}},render:()=>f(u,{mockResolvers:{ComputeSessionNode:()=>({type:`BATCH`})},children:f(k,{})})},M={name:`INFERENCE`,parameters:{docs:{description:{story:`Displays an INFERENCE session type token in purple.`}}},render:()=>f(u,{mockResolvers:{ComputeSessionNode:()=>({type:`INFERENCE`})},children:f(k,{})})},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
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
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
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
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
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
}`,...M.parameters?.docs?.source}}},N=[`Default`,`Batch`,`Inference`]})))()}P();export{j as Batch,A as Default,M as Inference,N as __namedExportsOrder,O as default};