import{n as e}from"./rolldown-runtime-2s6bX4vc.js";import{n as t,t as n}from"./isNil-BxeEHcje.js";import{n as r,t as i}from"./startsWith-D1LLndP8.js";import{n as a,t as o}from"./useBAIi18n-BoXCk5K0.js";import{n as s,t as c}from"./BAIFlex-CAz1t6J5.js";import{n as l,t as u}from"./RelayResolver-b1nJU57O.js";import{Fragment as d,jsx as f,jsxs as p}from"react/jsx-runtime";import{useFragment as m,useLazyLoadQuery as h}from"react-relay";import{Text as g}from"@lablup/ui-common/Text";import{Token as _}from"@lablup/ui-common/Token";var v;function y(){return(y=e((()=>{v={argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAISessionClusterModeFragment`,selections:[{alias:null,args:null,kind:`ScalarField`,name:`cluster_mode`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`cluster_size`,storageKey:null}],type:`ComputeSessionNode`,abstractKey:null},v.hash=`90b43e862e9e63218f96dbf3067af0ff`})))()}var b;function x(){return(x=e((()=>{y(),o(),n(),i(),b=({sessionFrgmt:e,clusterMode:n,clusterSize:i,showSize:o=!0,mode:s=`text`})=>{let{t:c}=a(),l=m(v,e??null),u=n??l?.cluster_mode,h=i??l?.cluster_size,y=o&&!t(h),b=r(u?.toUpperCase()||``,`SINGLE`)?c(`comp:BAISessionClusterMode.SingleNodeShort`):r(u?.toUpperCase()||``,`MULTI`)?c(`comp:BAISessionClusterMode.MultiNodeShort`):`-`;return s===`text`?p(g,{children:[b,y&&p(d,{children:[`\xA0`,p(g,{color:`secondary`,children:[`(`,h,`)`]})]})]}):f(_,{label:y?`${b} × ${h}`:b})}})))()}var S;function C(){return(C=e((()=>{S=(function(){var e=[{kind:`Literal`,name:`id`,value:`test-id`}];return{fragment:{argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAISessionClusterModeStoriesQuery`,selections:[{alias:null,args:e,concreteType:`ComputeSessionNode`,kind:`LinkedField`,name:`compute_session_node`,plural:!1,selections:[{args:null,kind:`FragmentSpread`,name:`BAISessionClusterModeFragment`}],storageKey:`compute_session_node(id:"test-id")`}],type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[],kind:`Operation`,name:`BAISessionClusterModeStoriesQuery`,selections:[{alias:null,args:e,concreteType:`ComputeSessionNode`,kind:`LinkedField`,name:`compute_session_node`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`cluster_mode`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`cluster_size`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null}],storageKey:`compute_session_node(id:"test-id")`}]},params:{cacheID:`683c58f5cc7d486c656a52c4682ec43e`,id:null,metadata:{},name:`BAISessionClusterModeStoriesQuery`,operationKind:`query`,text:`query BAISessionClusterModeStoriesQuery {
  compute_session_node(id: "test-id") {
    ...BAISessionClusterModeFragment
    id
  }
}

fragment BAISessionClusterModeFragment on ComputeSessionNode {
  cluster_mode
  cluster_size
}
`}}})(),S.hash=`cf1726a4d435182cb2fd3e04c772fb8c`})))()}var w,T,E,D,O,k,A,j;function M(){return(M=e((()=>{C(),l(),s(),x(),w={title:`Fragments/BAISessionClusterMode`,component:b,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`
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
        `}}},argTypes:{showSize:{control:{type:`boolean`},description:`Whether to show cluster size`,table:{type:{summary:`boolean`},defaultValue:{summary:`true`}}},mode:{control:{type:`radio`},options:[`text`,`tag`],description:`Display mode`,table:{type:{summary:`text | tag`},defaultValue:{summary:`tag`}}},sessionFrgmt:{control:!1,description:`Relay fragment reference for session`}}},T=e=>{let{compute_session_node:t}=h(S,{});return t&&f(b,{sessionFrgmt:t,...e})},E={name:`Basic`,args:{showSize:!0,mode:`text`},parameters:{docs:{description:{story:`Displays a single-node cluster session in text mode.`}}},render:({showSize:e,mode:t})=>f(u,{mockResolvers:{ComputeSessionNode:()=>({cluster_mode:`SINGLE`,cluster_size:1})},children:f(T,{showSize:e,mode:t})})},D={args:{showSize:!0,mode:`text`},parameters:{docs:{description:{story:`Displays a multi-node cluster session with 4 nodes.`}}},render:({showSize:e,mode:t})=>f(u,{mockResolvers:{ComputeSessionNode:()=>({cluster_mode:`MULTI`,cluster_size:4})},children:f(T,{showSize:e,mode:t})})},O={args:{showSize:!0,mode:`tag`},parameters:{docs:{description:{story:`Displays cluster mode as a Token instead of plain text.`}}},render:({showSize:e,mode:t})=>f(u,{mockResolvers:{ComputeSessionNode:()=>({cluster_mode:`MULTI`,cluster_size:8})},children:f(T,{showSize:e,mode:t})})},k={args:{showSize:!1,mode:`text`},parameters:{docs:{description:{story:`Displays cluster mode without showing the cluster size.`}}},render:({showSize:e,mode:t})=>f(u,{mockResolvers:{ComputeSessionNode:()=>({cluster_mode:`MULTI`,cluster_size:4})},children:f(T,{showSize:e,mode:t})})},A={parameters:{docs:{description:{story:`Displays all combinations of cluster modes and display options.`}}},render:()=>f(c,{direction:`column`,gap:`md`,align:`start`,children:[{label:`Single-node (text)`,cluster_mode:`SINGLE`,cluster_size:1,mode:`text`,showSize:!0},{label:`Multi-node (text)`,cluster_mode:`MULTI`,cluster_size:4,mode:`text`,showSize:!0},{label:`Single-node (tag)`,cluster_mode:`SINGLE`,cluster_size:1,mode:`tag`,showSize:!0},{label:`Multi-node (tag)`,cluster_mode:`MULTI`,cluster_size:8,mode:`tag`,showSize:!0},{label:`Multi-node (no size)`,cluster_mode:`MULTI`,cluster_size:4,mode:`text`,showSize:!1}].map((e,t)=>f(u,{mockResolvers:{ComputeSessionNode:()=>({cluster_mode:e.cluster_mode,cluster_size:e.cluster_size})},children:p(c,{direction:`row`,gap:`md`,align:`center`,children:[f(`div`,{style:{width:180},children:p(`strong`,{children:[e.label,`:`]})}),f(T,{mode:e.mode,showSize:e.showSize})]})},t))})},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
}`,...E.parameters?.docs?.source},description:{story:`Default story showing single-node cluster in text mode.`,...E.parameters?.docs?.description}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
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
}`,...D.parameters?.docs?.source},description:{story:`Story showing multi-node cluster.`,...D.parameters?.docs?.description}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
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
}`,...O.parameters?.docs?.source},description:{story:`Story showing tag mode display.`,...O.parameters?.docs?.description}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
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
}`,...k.parameters?.docs?.source},description:{story:`Story showing cluster mode without size.`,...k.parameters?.docs?.description}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
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
}`,...A.parameters?.docs?.source},description:{story:`Story showing all variants together.`,...A.parameters?.docs?.description}}},j=[`Default`,`MultiNode`,`TagMode`,`WithoutSize`,`AllVariants`]})))()}M();export{A as AllVariants,E as Default,D as MultiNode,O as TagMode,k as WithoutSize,j as __namedExportsOrder,w as default};