import{n as e}from"./rolldown-runtime-2s6bX4vc.js";import{n as t,t as n}from"./hooks-BKuvs6Qg.js";import{n as r,t as i}from"./map-CIqW7OVA.js";import{a,i as o}from"./iframe-DR2sIF5r.js";import{n as s,t as c}from"./BAISelect-Dty2gXL7.js";import{Suspense as l,useMemo as u,useState as d}from"react";import{jsx as f}from"react/jsx-runtime";import{QueryClient as p,QueryClientProvider as m}from"@tanstack/react-query";var h;function g(){return(g=e((()=>{n(),s(),i(),h=({...e})=>{let n=t();return f(c,{...e,options:r(n,e=>({value:e,label:e}))})}})))()}var _,v,y,b,x,S,C,w,T,E,D,O,k,A;function j(){return(j=e((()=>{g(),a(),_=[`host1.example.com`,`host2.example.com`,`host3.example.com`,`gpu-cluster.example.com`,`storage-node1.example.com`],v=Array.from({length:20},(e,t)=>`host${t+1}.example.com`),y=(e=_)=>Promise.resolve({vfolder:{list_all_hosts:async()=>({allowed:e})}}),b=()=>({}),x=({children:e,allowed:t=_})=>{let n=u(()=>y(t),[t]),[r]=d(()=>new p({defaultOptions:{queries:{retry:!1,gcTime:0,staleTime:0}}}));return f(o,{locale:{lang:`en`},clientPromise:n,anonymousClientFactory:b,children:f(m,{client:r,children:f(l,{fallback:f(`div`,{children:`Loading...`}),children:e})})})},S={title:`Select/BAIAllowedHostNamesSelect`,component:h,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`
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
        `}}},argTypes:{placeholder:{control:{type:`text`},description:`Placeholder text when no value is selected`,table:{type:{summary:`string`}}},disabled:{control:{type:`boolean`},description:`Whether the select is disabled`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},allowClear:{control:{type:`boolean`},description:`Show clear button`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},mode:{control:{type:`select`},options:[void 0,`multiple`,`tags`],description:`Set mode of Select`,table:{type:{summary:`'multiple' | 'tags'`}}},onChange:{action:`changed`,description:`Callback when selection changes`}}},C={name:`Basic`,parameters:{docs:{description:{story:`Basic usage showing a select with 5 allowed host names. The component automatically fetches and displays available hosts.`}}},args:{placeholder:`Select a host`},render:e=>f(x,{children:f(h,{...e,style:{width:300}})})},w={name:`ClearButton`,parameters:{docs:{description:{story:`Select with allowClear enabled, allowing users to clear their selection.`}}},args:{placeholder:`Select a host`,allowClear:!0},render:e=>f(x,{children:f(h,{...e,style:{width:300}})})},T={name:`DisabledState`,parameters:{docs:{description:{story:`Shows the component in a disabled state where users cannot interact with it.`}}},args:{placeholder:`Select a host`,disabled:!0},render:e=>f(x,{children:f(h,{...e,style:{width:300}})})},E={name:`MultipleMode`,parameters:{docs:{description:{story:`Allows users to select multiple hosts at once. Selected hosts appear as tags.`}}},args:{placeholder:`Select hosts`,mode:`multiple`,allowClear:!0},render:e=>f(x,{children:f(h,{...e,style:{width:400}})})},D={name:`EmptyState`,parameters:{docs:{description:{story:`Shows the component when no allowed host names are returned from the API.`}}},args:{placeholder:`No hosts available`},render:e=>f(x,{allowed:[],children:f(h,{...e,style:{width:300}})})},O={name:`ManyOptions`,parameters:{docs:{description:{story:`Demonstrates the component with a large number of host options, showing scrollable dropdown behavior.`}}},args:{placeholder:`Select from 20 hosts`,showSearch:!0,allowClear:!0},render:e=>f(x,{allowed:v,children:f(h,{...e,style:{width:300}})})},k={name:`SearchEnabled`,parameters:{docs:{description:{story:`Enables search functionality to filter hosts by name. Useful when there are many options.`}}},args:{placeholder:`Search and select a host`,showSearch:!0,allowClear:!0},render:e=>f(x,{children:f(h,{...e,style:{width:300}})})},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source},description:{story:`Basic usage of the component with default props.`,...C.parameters?.docs?.description}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
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
}`,...w.parameters?.docs?.source},description:{story:`Select with clear button enabled.`,...w.parameters?.docs?.description}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
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
}`,...T.parameters?.docs?.source},description:{story:`Disabled state of the select.`,...T.parameters?.docs?.description}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
}`,...E.parameters?.docs?.source},description:{story:`Multiple selection mode.`,...E.parameters?.docs?.description}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
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
}`,...D.parameters?.docs?.source},description:{story:`Empty state when no hosts are available.`,...D.parameters?.docs?.description}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
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
}`,...O.parameters?.docs?.source},description:{story:`Select with many host options.`,...O.parameters?.docs?.description}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
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
}`,...k.parameters?.docs?.source},description:{story:`Select with search functionality.`,...k.parameters?.docs?.description}}},A=[`Default`,`WithClearButton`,`Disabled`,`MultipleSelection`,`Empty`,`ManyHosts`,`WithSearch`]})))()}j();export{C as Default,T as Disabled,D as Empty,O as ManyHosts,E as MultipleSelection,w as WithClearButton,k as WithSearch,A as __namedExportsOrder,S as default};