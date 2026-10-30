import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t,t as n}from"./isNil-DEmCxAIe.js";import{n as r,t as i}from"./startsWith-BZkDi8PB.js";import{t as a}from"./jsx-runtime-MKhVqBIO.js";import{n as o,t as s}from"./useBAIi18n-BpbzZnIV.js";import{n as c,t as l}from"./Text-Cj3JSrHf.js";import{n as u,t as d}from"./BAIFlex-DnaoYTJ1.js";import{t as f}from"./react-relay-sHama7hJ.js";import{n as p,t as m}from"./Token-CdZYTLEb.js";import{n as h,t as g}from"./RelayResolver-BnFyFQJn.js";var _;function v(){return(v=e((()=>{_={argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAISessionClusterModeFragment`,selections:[{alias:null,args:null,kind:`ScalarField`,name:`cluster_mode`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`cluster_size`,storageKey:null}],type:`ComputeSessionNode`,abstractKey:null},_.hash=`90b43e862e9e63218f96dbf3067af0ff`})))()}var y,b,x;function S(){return(S=e((()=>{v(),s(),c(),p(),n(),i(),y=f(),b=a(),x=({sessionFrgmt:e,clusterMode:n,clusterSize:i,showSize:a=!0,mode:s=`text`})=>{let{t:c}=o(),u=(0,y.useFragment)(_,e??null),d=n??(u==null?void 0:u.cluster_mode),f=i??(u==null?void 0:u.cluster_size),p=a&&!t(f),h=r((d==null?void 0:d.toUpperCase())||``,`SINGLE`)?c(`comp:BAISessionClusterMode.SingleNodeShort`):r((d==null?void 0:d.toUpperCase())||``,`MULTI`)?c(`comp:BAISessionClusterMode.MultiNodeShort`):`-`;return s===`text`?(0,b.jsxs)(l,{children:[h,p&&(0,b.jsxs)(b.Fragment,{children:[`\xA0`,(0,b.jsxs)(l,{color:`secondary`,children:[`(`,f,`)`]})]})]}):(0,b.jsx)(m,{label:p?`${h} × ${f}`:h})}})))()}var C;function w(){return(w=e((()=>{C=(function(){var e=[{kind:`Literal`,name:`id`,value:`test-id`}];return{fragment:{argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAISessionClusterModeStoriesQuery`,selections:[{alias:null,args:e,concreteType:`ComputeSessionNode`,kind:`LinkedField`,name:`compute_session_node`,plural:!1,selections:[{args:null,kind:`FragmentSpread`,name:`BAISessionClusterModeFragment`}],storageKey:`compute_session_node(id:"test-id")`}],type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[],kind:`Operation`,name:`BAISessionClusterModeStoriesQuery`,selections:[{alias:null,args:e,concreteType:`ComputeSessionNode`,kind:`LinkedField`,name:`compute_session_node`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`cluster_mode`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`cluster_size`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null}],storageKey:`compute_session_node(id:"test-id")`}]},params:{cacheID:`683c58f5cc7d486c656a52c4682ec43e`,id:null,metadata:{},name:`BAISessionClusterModeStoriesQuery`,operationKind:`query`,text:`query BAISessionClusterModeStoriesQuery {
  compute_session_node(id: "test-id") {
    ...BAISessionClusterModeFragment
    id
  }
}

fragment BAISessionClusterModeFragment on ComputeSessionNode {
  cluster_mode
  cluster_size
}
`}}})(),C.hash=`cf1726a4d435182cb2fd3e04c772fb8c`})))()}var T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y;function X(){return(X=e((()=>{w(),h(),u(),S(),T=f(),E=a(),H={title:`Fragments/BAISessionClusterMode`,component:x,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`
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
        `}}},argTypes:{showSize:{control:{type:`boolean`},description:`Whether to show cluster size`,table:{type:{summary:`boolean`},defaultValue:{summary:`true`}}},mode:{control:{type:`radio`},options:[`text`,`tag`],description:`Display mode`,table:{type:{summary:`text | tag`},defaultValue:{summary:`tag`}}},sessionFrgmt:{control:!1,description:`Relay fragment reference for session`}}},U=e=>{let{compute_session_node:t}=(0,T.useLazyLoadQuery)(C,{});return t&&(0,E.jsx)(x,{sessionFrgmt:t,...e})},W={name:`Basic`,args:{showSize:!0,mode:`text`},parameters:{docs:{description:{story:`Displays a single-node cluster session in text mode.`}}},render:({showSize:e,mode:t})=>(0,E.jsx)(g,{mockResolvers:{ComputeSessionNode:()=>({cluster_mode:`SINGLE`,cluster_size:1})},children:(0,E.jsx)(U,{showSize:e,mode:t})})},G={args:{showSize:!0,mode:`text`},parameters:{docs:{description:{story:`Displays a multi-node cluster session with 4 nodes.`}}},render:({showSize:e,mode:t})=>(0,E.jsx)(g,{mockResolvers:{ComputeSessionNode:()=>({cluster_mode:`MULTI`,cluster_size:4})},children:(0,E.jsx)(U,{showSize:e,mode:t})})},K={args:{showSize:!0,mode:`tag`},parameters:{docs:{description:{story:`Displays cluster mode as a Token instead of plain text.`}}},render:({showSize:e,mode:t})=>(0,E.jsx)(g,{mockResolvers:{ComputeSessionNode:()=>({cluster_mode:`MULTI`,cluster_size:8})},children:(0,E.jsx)(U,{showSize:e,mode:t})})},q={args:{showSize:!1,mode:`text`},parameters:{docs:{description:{story:`Displays cluster mode without showing the cluster size.`}}},render:({showSize:e,mode:t})=>(0,E.jsx)(g,{mockResolvers:{ComputeSessionNode:()=>({cluster_mode:`MULTI`,cluster_size:4})},children:(0,E.jsx)(U,{showSize:e,mode:t})})},J={parameters:{docs:{description:{story:`Displays all combinations of cluster modes and display options.`}}},render:()=>(0,E.jsx)(d,{direction:`column`,gap:`md`,align:`start`,children:[{label:`Single-node (text)`,cluster_mode:`SINGLE`,cluster_size:1,mode:`text`,showSize:!0},{label:`Multi-node (text)`,cluster_mode:`MULTI`,cluster_size:4,mode:`text`,showSize:!0},{label:`Single-node (tag)`,cluster_mode:`SINGLE`,cluster_size:1,mode:`tag`,showSize:!0},{label:`Multi-node (tag)`,cluster_mode:`MULTI`,cluster_size:8,mode:`tag`,showSize:!0},{label:`Multi-node (no size)`,cluster_mode:`MULTI`,cluster_size:4,mode:`text`,showSize:!1}].map((e,t)=>(0,E.jsx)(g,{mockResolvers:{ComputeSessionNode:()=>({cluster_mode:e.cluster_mode,cluster_size:e.cluster_size})},children:(0,E.jsxs)(d,{direction:`row`,gap:`md`,align:`center`,children:[(0,E.jsx)(`div`,{style:{width:180},children:(0,E.jsxs)(`strong`,{children:[e.label,`:`]})}),(0,E.jsx)(U,{mode:e.mode,showSize:e.showSize})]})},t))})},W.parameters={...W.parameters,docs:{...(D=W.parameters)==null?void 0:D.docs,source:{originalSource:`{
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
}`,...(O=W.parameters)==null||(O=O.docs)==null?void 0:O.source},description:{story:`Default story showing single-node cluster in text mode.`,...(k=W.parameters)==null||(k=k.docs)==null?void 0:k.description}}},G.parameters={...G.parameters,docs:{...(A=G.parameters)==null?void 0:A.docs,source:{originalSource:`{
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
}`,...(j=G.parameters)==null||(j=j.docs)==null?void 0:j.source},description:{story:`Story showing multi-node cluster.`,...(M=G.parameters)==null||(M=M.docs)==null?void 0:M.description}}},K.parameters={...K.parameters,docs:{...(N=K.parameters)==null?void 0:N.docs,source:{originalSource:`{
  args: {
    showSize: true,
    mode: 'tag'
  },
  parameters: {
    docs: {
      description: {
        story: 'Displays cluster mode as a Token instead of plain text.'
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
}`,...(P=K.parameters)==null||(P=P.docs)==null?void 0:P.source},description:{story:`Story showing tag mode display.`,...(F=K.parameters)==null||(F=F.docs)==null?void 0:F.description}}},q.parameters={...q.parameters,docs:{...(I=q.parameters)==null?void 0:I.docs,source:{originalSource:`{
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
}`,...(L=q.parameters)==null||(L=L.docs)==null?void 0:L.source},description:{story:`Story showing cluster mode without size.`,...(R=q.parameters)==null||(R=R.docs)==null?void 0:R.description}}},J.parameters={...J.parameters,docs:{...(z=J.parameters)==null?void 0:z.docs,source:{originalSource:`{
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
}`,...(B=J.parameters)==null||(B=B.docs)==null?void 0:B.source},description:{story:`Story showing all variants together.`,...(V=J.parameters)==null||(V=V.docs)==null?void 0:V.description}}},Y=[`Default`,`MultiNode`,`TagMode`,`WithoutSize`,`AllVariants`]})))()}X();export{J as AllVariants,W as Default,G as MultiNode,K as TagMode,q as WithoutSize,Y as __namedExportsOrder,H as default};