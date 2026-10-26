import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-D0Ex1IVc.js";import{n,t as r}from"./hooks-C37w8Ol6.js";import{n as i,t as a}from"./map-CLZMgxwS.js";import{t as o}from"./jsx-runtime-MKhVqBIO.js";import{n as s,t as c}from"./QueryClientProvider-BFgZ02ah.js";import{d as l,o as u,s as d,u as f}from"./iframe-DHcqzLLD.js";import{n as p,t as m}from"./BAISelect-DFNH8Oeg.js";var h,g;function _(){return(_=e((()=>{r(),p(),a(),h=o(),g=({...e})=>{let t=n();return(0,h.jsx)(m,{...e,options:i(t,e=>({value:e,label:e}))})}})))()}var v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N;function P(){return(P=e((()=>{_(),d(),l(),s(),v=t(),y=o(),b=[`host1.example.com`,`host2.example.com`,`host3.example.com`,`gpu-cluster.example.com`,`storage-node1.example.com`],x=Array.from({length:20},(e,t)=>`host${t+1}.example.com`),S=(e=b)=>Promise.resolve({vfolder:{list_all_hosts:async()=>({allowed:e})}}),C=()=>({}),w=({children:e,allowed:t=b})=>{let n=(0,v.useMemo)(()=>S(t),[t]),[r]=(0,v.useState)(()=>new f({defaultOptions:{queries:{retry:!1,gcTime:0,staleTime:0}}}));return(0,y.jsx)(u,{locale:{lang:`en`},clientPromise:n,anonymousClientFactory:C,children:(0,y.jsx)(c,{client:r,children:(0,y.jsx)(v.Suspense,{fallback:(0,y.jsx)(`div`,{children:`Loading...`}),children:e})})})},T={title:`Select/BAIAllowedHostNamesSelect`,component:g,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`
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
        `}}},argTypes:{placeholder:{control:{type:`text`},description:`Placeholder text when no value is selected`,table:{type:{summary:`string`}}},disabled:{control:{type:`boolean`},description:`Whether the select is disabled`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},allowClear:{control:{type:`boolean`},description:`Show clear button`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},mode:{control:{type:`select`},options:[void 0,`multiple`,`tags`],description:`Set mode of Select`,table:{type:{summary:`'multiple' | 'tags'`}}},onChange:{action:`changed`,description:`Callback when selection changes`}}},E={name:`Basic`,parameters:{docs:{description:{story:`Basic usage showing a select with 5 allowed host names. The component automatically fetches and displays available hosts.`}}},args:{placeholder:`Select a host`},render:e=>(0,y.jsx)(w,{children:(0,y.jsx)(g,{...e,style:{width:300}})})},D={name:`ClearButton`,parameters:{docs:{description:{story:`Select with allowClear enabled, allowing users to clear their selection.`}}},args:{placeholder:`Select a host`,allowClear:!0},render:e=>(0,y.jsx)(w,{children:(0,y.jsx)(g,{...e,style:{width:300}})})},O={name:`DisabledState`,parameters:{docs:{description:{story:`Shows the component in a disabled state where users cannot interact with it.`}}},args:{placeholder:`Select a host`,disabled:!0},render:e=>(0,y.jsx)(w,{children:(0,y.jsx)(g,{...e,style:{width:300}})})},k={name:`MultipleMode`,parameters:{docs:{description:{story:`Allows users to select multiple hosts at once. Selected hosts appear as tags.`}}},args:{placeholder:`Select hosts`,mode:`multiple`,allowClear:!0},render:e=>(0,y.jsx)(w,{children:(0,y.jsx)(g,{...e,style:{width:400}})})},A={name:`EmptyState`,parameters:{docs:{description:{story:`Shows the component when no allowed host names are returned from the API.`}}},args:{placeholder:`No hosts available`},render:e=>(0,y.jsx)(w,{allowed:[],children:(0,y.jsx)(g,{...e,style:{width:300}})})},j={name:`ManyOptions`,parameters:{docs:{description:{story:`Demonstrates the component with a large number of host options, showing scrollable dropdown behavior.`}}},args:{placeholder:`Select from 20 hosts`,showSearch:!0,allowClear:!0},render:e=>(0,y.jsx)(w,{allowed:x,children:(0,y.jsx)(g,{...e,style:{width:300}})})},M={name:`SearchEnabled`,parameters:{docs:{description:{story:`Enables search functionality to filter hosts by name. Useful when there are many options.`}}},args:{placeholder:`Search and select a host`,showSearch:!0,allowClear:!0},render:e=>(0,y.jsx)(w,{children:(0,y.jsx)(g,{...e,style:{width:300}})})},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
}`,...E.parameters?.docs?.source},description:{story:`Basic usage of the component with default props.`,...E.parameters?.docs?.description}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
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
}`,...D.parameters?.docs?.source},description:{story:`Select with clear button enabled.`,...D.parameters?.docs?.description}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
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
}`,...O.parameters?.docs?.source},description:{story:`Disabled state of the select.`,...O.parameters?.docs?.description}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
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
}`,...k.parameters?.docs?.source},description:{story:`Multiple selection mode.`,...k.parameters?.docs?.description}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
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
}`,...A.parameters?.docs?.source},description:{story:`Empty state when no hosts are available.`,...A.parameters?.docs?.description}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
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
}`,...j.parameters?.docs?.source},description:{story:`Select with many host options.`,...j.parameters?.docs?.description}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
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
}`,...M.parameters?.docs?.source},description:{story:`Select with search functionality.`,...M.parameters?.docs?.description}}},N=[`Default`,`WithClearButton`,`Disabled`,`MultipleSelection`,`Empty`,`ManyHosts`,`WithSearch`]})))()}P();export{E as Default,O as Disabled,A as Empty,j as ManyHosts,k as MultipleSelection,D as WithClearButton,M as WithSearch,N as __namedExportsOrder,T as default};