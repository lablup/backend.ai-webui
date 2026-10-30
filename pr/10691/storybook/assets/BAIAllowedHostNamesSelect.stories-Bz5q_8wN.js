import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-DlPsW1c0.js";import{n,t as r}from"./hooks-CqTIG_8a.js";import{n as i,t as a}from"./map-BLzs52H1.js";import{t as o}from"./jsx-runtime-MKhVqBIO.js";import{n as s,t as c}from"./QueryClientProvider-DHWAICrJ.js";import{d as l,o as u,s as ee,u as te}from"./iframe-bDK6eSvz.js";import{n as d,t as f}from"./BAISelect-D8qsmSnZ.js";var p,m;function h(){return(h=e((()=>{r(),d(),a(),p=o(),m=({...e})=>{let t=n();return(0,p.jsx)(f,{...e,options:i(t,e=>({value:e,label:e}))})}})))()}var g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q;function $(){return($=e((()=>{h(),ee(),l(),s(),g=t(),_=o(),z=[`host1.example.com`,`host2.example.com`,`host3.example.com`,`gpu-cluster.example.com`,`storage-node1.example.com`],B=Array.from({length:20},(e,t)=>`host${t+1}.example.com`),V=(e=z)=>Promise.resolve({vfolder:{list_all_hosts:async()=>({allowed:e})}}),H=()=>({}),U=({children:e,allowed:t=z})=>{let n=(0,g.useMemo)(()=>V(t),[t]),[r]=(0,g.useState)(()=>new te({defaultOptions:{queries:{retry:!1,gcTime:0,staleTime:0}}}));return(0,_.jsx)(u,{locale:{lang:`en`},clientPromise:n,anonymousClientFactory:H,children:(0,_.jsx)(c,{client:r,children:(0,_.jsx)(g.Suspense,{fallback:(0,_.jsx)(`div`,{children:`Loading...`}),children:e})})})},W={title:`Select/BAIAllowedHostNamesSelect`,component:m,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`
**BAIAllowedHostNamesSelect** is a specialized Select component that fetches and displays allowed host names from the Backend.AI vfolder API.

## Features
- Automatic data fetching using \`useAllowedHostNames\` hook
- TanStack Query integration with Suspense
- Extends Ant Design Select with full feature support
- Customizable placeholder and selection behavior

## Usage
\`\`\`tsx
<BAIAllowedHostNamesSelect
  placeholder="Select a host"
  onChange={(value) => console.log(value)}
/>
\`\`\`

## Props
This component extends all Ant Design SelectProps. Common props include:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| placeholder | \`string\` | - | Placeholder text when no value is selected |
| onChange | \`(value: string) => void\` | - | Callback when selection changes |
| disabled | \`boolean\` | \`false\` | Whether the select is disabled |
| allowClear | \`boolean\` | \`false\` | Show clear button |
| mode | \`'multiple' \\| 'tags'\` | - | Set mode of Select |
        `}}},argTypes:{placeholder:{control:{type:`text`},description:`Placeholder text when no value is selected`,table:{type:{summary:`string`}}},disabled:{control:{type:`boolean`},description:`Whether the select is disabled`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},allowClear:{control:{type:`boolean`},description:`Show clear button`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},mode:{control:{type:`select`},options:[void 0,`multiple`,`tags`],description:`Set mode of Select`,table:{type:{summary:`'multiple' | 'tags'`}}},onChange:{action:`changed`,description:`Callback when selection changes`}}},G={name:`Basic`,parameters:{docs:{description:{story:`Basic usage showing a select with 5 allowed host names. The component automatically fetches and displays available hosts.`}}},args:{placeholder:`Select a host`},render:e=>(0,_.jsx)(U,{children:(0,_.jsx)(m,{...e,style:{width:300}})})},K={name:`ClearButton`,parameters:{docs:{description:{story:`Select with allowClear enabled, allowing users to clear their selection.`}}},args:{placeholder:`Select a host`,allowClear:!0},render:e=>(0,_.jsx)(U,{children:(0,_.jsx)(m,{...e,style:{width:300}})})},q={name:`DisabledState`,parameters:{docs:{description:{story:`Shows the component in a disabled state where users cannot interact with it.`}}},args:{placeholder:`Select a host`,disabled:!0},render:e=>(0,_.jsx)(U,{children:(0,_.jsx)(m,{...e,style:{width:300}})})},J={name:`MultipleMode`,parameters:{docs:{description:{story:`Allows users to select multiple hosts at once. Selected hosts appear as tags.`}}},args:{placeholder:`Select hosts`,mode:`multiple`,allowClear:!0},render:e=>(0,_.jsx)(U,{children:(0,_.jsx)(m,{...e,style:{width:400}})})},Y={name:`EmptyState`,parameters:{docs:{description:{story:`Shows the component when no allowed host names are returned from the API.`}}},args:{placeholder:`No hosts available`},render:e=>(0,_.jsx)(U,{allowed:[],children:(0,_.jsx)(m,{...e,style:{width:300}})})},X={name:`ManyOptions`,parameters:{docs:{description:{story:`Demonstrates the component with a large number of host options, showing scrollable dropdown behavior.`}}},args:{placeholder:`Select from 20 hosts`,showSearch:!0,allowClear:!0},render:e=>(0,_.jsx)(U,{allowed:B,children:(0,_.jsx)(m,{...e,style:{width:300}})})},Z={name:`SearchEnabled`,parameters:{docs:{description:{story:`Enables search functionality to filter hosts by name. Useful when there are many options.`}}},args:{placeholder:`Search and select a host`,showSearch:!0,allowClear:!0},render:e=>(0,_.jsx)(U,{children:(0,_.jsx)(m,{...e,style:{width:300}})})},G.parameters={...G.parameters,docs:{...(v=G.parameters)==null?void 0:v.docs,source:{originalSource:`{
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'Basic usage showing a select with 5 allowed host names. The component automatically fetches and displays available hosts.'
      }
    }
  },
  args: {
    placeholder: 'Select a host'
  },
  render: args => <StoryProvider>
      <BAIAllowedHostNamesSelect {...args} style={{
      width: 300
    }} />
    </StoryProvider>
}`,...(y=G.parameters)==null||(y=y.docs)==null?void 0:y.source},description:{story:`Basic usage of the component with default props.`,...(b=G.parameters)==null||(b=b.docs)==null?void 0:b.description}}},K.parameters={...K.parameters,docs:{...(x=K.parameters)==null?void 0:x.docs,source:{originalSource:`{
  name: 'ClearButton',
  parameters: {
    docs: {
      description: {
        story: 'Select with allowClear enabled, allowing users to clear their selection.'
      }
    }
  },
  args: {
    placeholder: 'Select a host',
    allowClear: true
  },
  render: args => <StoryProvider>
      <BAIAllowedHostNamesSelect {...args} style={{
      width: 300
    }} />
    </StoryProvider>
}`,...(S=K.parameters)==null||(S=S.docs)==null?void 0:S.source},description:{story:`Select with clear button enabled.`,...(C=K.parameters)==null||(C=C.docs)==null?void 0:C.description}}},q.parameters={...q.parameters,docs:{...(w=q.parameters)==null?void 0:w.docs,source:{originalSource:`{
  name: 'DisabledState',
  parameters: {
    docs: {
      description: {
        story: 'Shows the component in a disabled state where users cannot interact with it.'
      }
    }
  },
  args: {
    placeholder: 'Select a host',
    disabled: true
  },
  render: args => <StoryProvider>
      <BAIAllowedHostNamesSelect {...args} style={{
      width: 300
    }} />
    </StoryProvider>
}`,...(T=q.parameters)==null||(T=T.docs)==null?void 0:T.source},description:{story:`Disabled state of the select.`,...(E=q.parameters)==null||(E=E.docs)==null?void 0:E.description}}},J.parameters={...J.parameters,docs:{...(D=J.parameters)==null?void 0:D.docs,source:{originalSource:`{
  name: 'MultipleMode',
  parameters: {
    docs: {
      description: {
        story: 'Allows users to select multiple hosts at once. Selected hosts appear as tags.'
      }
    }
  },
  args: {
    placeholder: 'Select hosts',
    mode: 'multiple' as const,
    allowClear: true
  },
  render: args => <StoryProvider>
      <BAIAllowedHostNamesSelect {...args} style={{
      width: 400
    }} />
    </StoryProvider>
}`,...(O=J.parameters)==null||(O=O.docs)==null?void 0:O.source},description:{story:`Multiple selection mode.`,...(k=J.parameters)==null||(k=k.docs)==null?void 0:k.description}}},Y.parameters={...Y.parameters,docs:{...(A=Y.parameters)==null?void 0:A.docs,source:{originalSource:`{
  name: 'EmptyState',
  parameters: {
    docs: {
      description: {
        story: 'Shows the component when no allowed host names are returned from the API.'
      }
    }
  },
  args: {
    placeholder: 'No hosts available'
  },
  render: args => <StoryProvider allowed={[]}>
      <BAIAllowedHostNamesSelect {...args} style={{
      width: 300
    }} />
    </StoryProvider>
}`,...(j=Y.parameters)==null||(j=j.docs)==null?void 0:j.source},description:{story:`Empty state when no hosts are available.`,...(M=Y.parameters)==null||(M=M.docs)==null?void 0:M.description}}},X.parameters={...X.parameters,docs:{...(N=X.parameters)==null?void 0:N.docs,source:{originalSource:`{
  name: 'ManyOptions',
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the component with a large number of host options, showing scrollable dropdown behavior.'
      }
    }
  },
  args: {
    placeholder: 'Select from 20 hosts',
    showSearch: true,
    allowClear: true
  },
  render: args => <StoryProvider allowed={sampleManyHosts}>
      <BAIAllowedHostNamesSelect {...args} style={{
      width: 300
    }} />
    </StoryProvider>
}`,...(P=X.parameters)==null||(P=P.docs)==null?void 0:P.source},description:{story:`Select with many host options.`,...(F=X.parameters)==null||(F=F.docs)==null?void 0:F.description}}},Z.parameters={...Z.parameters,docs:{...(I=Z.parameters)==null?void 0:I.docs,source:{originalSource:`{
  name: 'SearchEnabled',
  parameters: {
    docs: {
      description: {
        story: 'Enables search functionality to filter hosts by name. Useful when there are many options.'
      }
    }
  },
  args: {
    placeholder: 'Search and select a host',
    showSearch: true,
    allowClear: true
  },
  render: args => <StoryProvider>
      <BAIAllowedHostNamesSelect {...args} style={{
      width: 300
    }} />
    </StoryProvider>
}`,...(L=Z.parameters)==null||(L=L.docs)==null?void 0:L.source},description:{story:`Select with search functionality.`,...(R=Z.parameters)==null||(R=R.docs)==null?void 0:R.description}}},Q=[`Default`,`WithClearButton`,`Disabled`,`MultipleSelection`,`Empty`,`ManyHosts`,`WithSearch`]})))()}$();export{G as Default,q as Disabled,Y as Empty,X as ManyHosts,J as MultipleSelection,K as WithClearButton,Z as WithSearch,Q as __namedExportsOrder,W as default};