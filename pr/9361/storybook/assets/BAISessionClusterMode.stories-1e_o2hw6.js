import{a as X,j as e,d as g}from"./iframe-fCvOZk0c.js";import{R as c}from"./RelayResolver-B4ZySwzU.js";import{B as z}from"./BAIFlex-BsahEmA0.js";import{r as q}from"./index-B4W0y0hS.js";import{s as x}from"./startsWith-DQUr7Gqk.js";import{B as Y}from"./Badge-CJn8tVrn.js";import{i as Z}from"./isNil-CHIgUVhi.js";import"./preload-helper-Dp1pzeXC.js";import"./index-CAWKoKxh.js";import"./_baseClamp-DVUOCJN_.js";import"./toString-CNMxmVDC.js";import"./isSymbol-GUrnTH49.js";import"./toInteger-DpmDuk3I.js";import"./toFinite-C07IfXoW.js";import"./_trimmedEndIndex-DuQxD0U0.js";const O={argumentDefinitions:[],kind:"Fragment",metadata:null,name:"BAISessionClusterModeFragment",selections:[{alias:null,args:null,kind:"ScalarField",name:"cluster_mode",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"cluster_size",storageKey:null}],type:"ComputeSessionNode",abstractKey:null};O.hash="90b43e862e9e63218f96dbf3067af0ff";const $=({sessionFrgmt:o,clusterMode:s,clusterSize:u,showSize:P=!0,mode:J="text"})=>{const{t:S}=X(),t=q.useFragment(O,o??null),r=s??(t==null?void 0:t.cluster_mode),p=u??(t==null?void 0:t.cluster_size),y=P&&!Z(p),h=x((r==null?void 0:r.toUpperCase())||"","SINGLE")?S("comp:BAISessionClusterMode.SingleNodeShort"):x((r==null?void 0:r.toUpperCase())||"","MULTI")?S("comp:BAISessionClusterMode.MultiNodeShort"):"-";return J==="text"?e.jsxs(g,{children:[h,y&&e.jsxs(e.Fragment,{children:[" ",e.jsxs(g,{color:"secondary",children:["(",p,")"]})]})]}):e.jsx(Y,{variant:"neutral",label:e.jsxs(e.Fragment,{children:[h,y&&e.jsxs(e.Fragment,{children:[" ",e.jsxs(g,{color:"secondary",size:"sm",children:["(",p,")"]})]})]})})},H=(function(){var o=[{kind:"Literal",name:"id",value:"test-id"}];return{fragment:{argumentDefinitions:[],kind:"Fragment",metadata:null,name:"BAISessionClusterModeStoriesQuery",selections:[{alias:null,args:o,concreteType:"ComputeSessionNode",kind:"LinkedField",name:"compute_session_node",plural:!1,selections:[{args:null,kind:"FragmentSpread",name:"BAISessionClusterModeFragment"}],storageKey:'compute_session_node(id:"test-id")'}],type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[],kind:"Operation",name:"BAISessionClusterModeStoriesQuery",selections:[{alias:null,args:o,concreteType:"ComputeSessionNode",kind:"LinkedField",name:"compute_session_node",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"cluster_mode",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"cluster_size",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null}],storageKey:'compute_session_node(id:"test-id")'}]},params:{cacheID:"683c58f5cc7d486c656a52c4682ec43e",id:null,metadata:{},name:"BAISessionClusterModeStoriesQuery",operationKind:"query",text:`query BAISessionClusterModeStoriesQuery {
  compute_session_node(id: "test-id") {
    ...BAISessionClusterModeFragment
    id
  }
}

fragment BAISessionClusterModeFragment on ComputeSessionNode {
  cluster_mode
  cluster_size
}
`}}})();H.hash="cf1726a4d435182cb2fd3e04c772fb8c";const Se={title:"Fragments/BAISessionClusterMode",component:$,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:`
**BAISessionClusterMode** displays cluster mode information for compute sessions.

## Features
- Displays cluster mode (Single-node or Multi-node)
- Shows cluster size (number of nodes)
- Two display modes: text (default) or tag
- Optional cluster size visibility control
- Internationalized labels

## Usage
\`\`\`tsx
// Text mode (default)
<BAISessionClusterMode sessionFrgmt={session} />

// Tag mode
<BAISessionClusterMode sessionFrgmt={session} mode="tag" />

// Hide cluster size
<BAISessionClusterMode sessionFrgmt={session} showSize={false} />
\`\`\`

## Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| \`sessionFrgmt\` | \`BAISessionClusterModeFragment$key\` | - | Relay fragment reference for session |
| \`showSize\` | \`boolean\` | \`true\` | Whether to show cluster size |
| \`mode\` | \`'text' \\| 'tag'\` | \`'text'\` | Display mode |
        `}}},argTypes:{showSize:{control:{type:"boolean"},description:"Whether to show cluster size",table:{type:{summary:"boolean"},defaultValue:{summary:"true"}}},mode:{control:{type:"radio"},options:["text","tag"],description:"Display mode",table:{type:{summary:"text | tag"},defaultValue:{summary:"tag"}}},sessionFrgmt:{control:!1,description:"Relay fragment reference for session"}}},m=o=>{const{compute_session_node:s}=q.useLazyLoadQuery(H,{});return s&&e.jsx($,{sessionFrgmt:s,...o})},n={name:"Basic",args:{showSize:!0,mode:"text"},parameters:{docs:{description:{story:"Displays a single-node cluster session in text mode."}}},render:({showSize:o,mode:s})=>e.jsx(c,{mockResolvers:{ComputeSessionNode:()=>({cluster_mode:"SINGLE",cluster_size:1})},children:e.jsx(m,{showSize:o,mode:s})})},i={args:{showSize:!0,mode:"text"},parameters:{docs:{description:{story:"Displays a multi-node cluster session with 4 nodes."}}},render:({showSize:o,mode:s})=>e.jsx(c,{mockResolvers:{ComputeSessionNode:()=>({cluster_mode:"MULTI",cluster_size:4})},children:e.jsx(m,{showSize:o,mode:s})})},a={args:{showSize:!0,mode:"tag"},parameters:{docs:{description:{story:"Displays cluster mode as a tag instead of plain text."}}},render:({showSize:o,mode:s})=>e.jsx(c,{mockResolvers:{ComputeSessionNode:()=>({cluster_mode:"MULTI",cluster_size:8})},children:e.jsx(m,{showSize:o,mode:s})})},l={args:{showSize:!1,mode:"text"},parameters:{docs:{description:{story:"Displays cluster mode without showing the cluster size."}}},render:({showSize:o,mode:s})=>e.jsx(c,{mockResolvers:{ComputeSessionNode:()=>({cluster_mode:"MULTI",cluster_size:4})},children:e.jsx(m,{showSize:o,mode:s})})},d={parameters:{docs:{description:{story:"Displays all combinations of cluster modes and display options."}}},render:()=>{const o=[{label:"Single-node (text)",cluster_mode:"SINGLE",cluster_size:1,mode:"text",showSize:!0},{label:"Multi-node (text)",cluster_mode:"MULTI",cluster_size:4,mode:"text",showSize:!0},{label:"Single-node (tag)",cluster_mode:"SINGLE",cluster_size:1,mode:"tag",showSize:!0},{label:"Multi-node (tag)",cluster_mode:"MULTI",cluster_size:8,mode:"tag",showSize:!0},{label:"Multi-node (no size)",cluster_mode:"MULTI",cluster_size:4,mode:"text",showSize:!1}];return e.jsx(z,{direction:"column",gap:"md",align:"start",children:o.map((s,u)=>e.jsx(c,{mockResolvers:{ComputeSessionNode:()=>({cluster_mode:s.cluster_mode,cluster_size:s.cluster_size})},children:e.jsxs(z,{direction:"row",gap:"md",align:"center",children:[e.jsx("div",{style:{width:180},children:e.jsxs("strong",{children:[s.label,":"]})}),e.jsx(m,{mode:s.mode,showSize:s.showSize})]})},u))})}};var _,w,f,I,R;n.parameters={...n.parameters,docs:{...(_=n.parameters)==null?void 0:_.docs,source:{originalSource:`{
  name: 'Basic',
  args: {
    showSize: true,
    mode: 'text'
  },
  parameters: {
    docs: {
      description: {
        story: 'Displays a single-node cluster session in text mode.'
      }
    }
  },
  render: ({
    showSize,
    mode
  }) => <RelayResolver mockResolvers={{
    ComputeSessionNode: () => ({
      cluster_mode: 'SINGLE',
      cluster_size: 1
    })
  }}>
      <QueryResolver showSize={showSize} mode={mode} />
    </RelayResolver>
}`,...(f=(w=n.parameters)==null?void 0:w.docs)==null?void 0:f.source},description:{story:"Default story showing single-node cluster in text mode.",...(R=(I=n.parameters)==null?void 0:I.docs)==null?void 0:R.description}}};var v,M,F,C,b;i.parameters={...i.parameters,docs:{...(v=i.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    showSize: true,
    mode: 'text'
  },
  parameters: {
    docs: {
      description: {
        story: 'Displays a multi-node cluster session with 4 nodes.'
      }
    }
  },
  render: ({
    showSize,
    mode
  }) => <RelayResolver mockResolvers={{
    ComputeSessionNode: () => ({
      cluster_mode: 'MULTI',
      cluster_size: 4
    })
  }}>
      <QueryResolver showSize={showSize} mode={mode} />
    </RelayResolver>
}`,...(F=(M=i.parameters)==null?void 0:M.docs)==null?void 0:F.source},description:{story:"Story showing multi-node cluster.",...(b=(C=i.parameters)==null?void 0:C.docs)==null?void 0:b.description}}};var B,k,N,A,L;a.parameters={...a.parameters,docs:{...(B=a.parameters)==null?void 0:B.docs,source:{originalSource:`{
  args: {
    showSize: true,
    mode: 'tag'
  },
  parameters: {
    docs: {
      description: {
        story: 'Displays cluster mode as a tag instead of plain text.'
      }
    }
  },
  render: ({
    showSize,
    mode
  }) => <RelayResolver mockResolvers={{
    ComputeSessionNode: () => ({
      cluster_mode: 'MULTI',
      cluster_size: 8
    })
  }}>
      <QueryResolver showSize={showSize} mode={mode} />
    </RelayResolver>
}`,...(N=(k=a.parameters)==null?void 0:k.docs)==null?void 0:N.source},description:{story:"Story showing tag mode display.",...(L=(A=a.parameters)==null?void 0:A.docs)==null?void 0:L.description}}};var j,T,D,U,Q;l.parameters={...l.parameters,docs:{...(j=l.parameters)==null?void 0:j.docs,source:{originalSource:`{
  args: {
    showSize: false,
    mode: 'text'
  },
  parameters: {
    docs: {
      description: {
        story: 'Displays cluster mode without showing the cluster size.'
      }
    }
  },
  render: ({
    showSize,
    mode
  }) => <RelayResolver mockResolvers={{
    ComputeSessionNode: () => ({
      cluster_mode: 'MULTI',
      cluster_size: 4
    })
  }}>
      <QueryResolver showSize={showSize} mode={mode} />
    </RelayResolver>
}`,...(D=(T=l.parameters)==null?void 0:T.docs)==null?void 0:D.source},description:{story:"Story showing cluster mode without size.",...(Q=(U=l.parameters)==null?void 0:U.docs)==null?void 0:Q.description}}};var E,K,G,W,V;d.parameters={...d.parameters,docs:{...(E=d.parameters)==null?void 0:E.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Displays all combinations of cluster modes and display options.'
      }
    }
  },
  render: () => {
    const variants = [{
      label: 'Single-node (text)',
      cluster_mode: 'SINGLE',
      cluster_size: 1,
      mode: 'text' as const,
      showSize: true
    }, {
      label: 'Multi-node (text)',
      cluster_mode: 'MULTI',
      cluster_size: 4,
      mode: 'text' as const,
      showSize: true
    }, {
      label: 'Single-node (tag)',
      cluster_mode: 'SINGLE',
      cluster_size: 1,
      mode: 'tag' as const,
      showSize: true
    }, {
      label: 'Multi-node (tag)',
      cluster_mode: 'MULTI',
      cluster_size: 8,
      mode: 'tag' as const,
      showSize: true
    }, {
      label: 'Multi-node (no size)',
      cluster_mode: 'MULTI',
      cluster_size: 4,
      mode: 'text' as const,
      showSize: false
    }];
    return <BAIFlex direction="column" gap="md" align="start">
        {variants.map((variant, index) => <RelayResolver key={index} mockResolvers={{
        ComputeSessionNode: () => ({
          cluster_mode: variant.cluster_mode,
          cluster_size: variant.cluster_size
        })
      }}>
            <BAIFlex direction="row" gap="md" align="center">
              <div style={{
            width: 180
          }}>
                <strong>{variant.label}:</strong>
              </div>
              <QueryResolver mode={variant.mode} showSize={variant.showSize} />
            </BAIFlex>
          </RelayResolver>)}
      </BAIFlex>;
  }
}`,...(G=(K=d.parameters)==null?void 0:K.docs)==null?void 0:G.source},description:{story:"Story showing all variants together.",...(V=(W=d.parameters)==null?void 0:W.docs)==null?void 0:V.description}}};const ye=["Default","MultiNode","TagMode","WithoutSize","AllVariants"];export{d as AllVariants,n as Default,i as MultiNode,a as TagMode,l as WithoutSize,ye as __namedExportsOrder,Se as default};
