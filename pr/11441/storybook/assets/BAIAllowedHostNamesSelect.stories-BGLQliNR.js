import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-DlPsW1c0.js";import{n,t as r}from"./hooks-DgO_LXe-.js";import{n as i,t as a}from"./map-IIuwj5IU.js";import{t as o}from"./jsx-runtime-MKhVqBIO.js";import{t as s}from"./compiler-runtime-DU4U6aph.js";import{n as c,t as l}from"./QueryClientProvider-BSeQxIx-.js";import{d as u,o as d,s as f,u as p}from"./iframe-go_nmmPI.js";import{n as m,t as h}from"./MultiSelector-vcRxq5h7.js";function g(e){return{value:e,label:e}}var _,v,y;function b(){return(b=e((()=>{_=s(),r(),h(),a(),v=o(),y=e=>{"use memo";let t=(0,_.c)(5),r=n(),a;t[0]===r?a=t[1]:(a=i(r,g),t[0]=r,t[1]=a);let o;return t[2]!==e||t[3]!==a?(o=(0,v.jsx)(m,{hasSearch:!0,...e,options:a}),t[2]=e,t[3]=a,t[4]=o):o=t[4],o}})))()}var x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I;function L(){return(L=e((()=>{b(),f(),u(),c(),x=t(),S=o(),C=[`host1.example.com`,`host2.example.com`,`host3.example.com`,`gpu-cluster.example.com`,`storage-node1.example.com`],w=Array.from({length:20},(e,t)=>`host${t+1}.example.com`),T=(e=C)=>Promise.resolve({vfolder:{list_all_hosts:async()=>({allowed:e})}}),E=()=>({}),D=({children:e,allowed:t=C})=>{let n=(0,x.useMemo)(()=>T(t),[t]),[r]=(0,x.useState)(()=>new p({defaultOptions:{queries:{retry:!1,gcTime:0,staleTime:0}}}));return(0,S.jsx)(d,{locale:{lang:`en`},clientPromise:n,anonymousClientFactory:E,children:(0,S.jsx)(l,{client:r,children:(0,S.jsx)(x.Suspense,{fallback:(0,S.jsx)(`div`,{children:`Loading...`}),children:e})})})},O={title:`Select/BAIAllowedHostNamesSelect`,component:y,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:'\n**BAIAllowedHostNamesSelect** is a [BAIMultiSelector](/?path=/docs/select-baimultiselector--docs) that fetches and lists the allowed host names from the Backend.AI vfolder API.\n\n## Features\n- Automatic data fetching using `useAllowedHostNames` hook\n- TanStack Query integration with Suspense\n- Several hosts at once: the value is `string[]`\n- Search on by default (`hasSearch`)\n\n## Usage\n```tsx\n<BAIAllowedHostNamesSelect\n  placeholder="Select hosts"\n  onChange={(values) => setHosts(values)}\n/>\n```\n\n## Props\nEvery BAIMultiSelector prop except `options`, which the component builds from the host list. Common props include:\n\n| Name | Type | Default | Description |\n|------|------|---------|-------------|\n| placeholder | `string` | - | Placeholder text when no value is selected |\n| value | `string[]` | - | The selected host names |\n| onChange | `(values: string[]) => void` | - | Callback when selection changes |\n| disabled | `boolean` | `false` | Whether the select is disabled |\n| hasClear | `boolean` | `false` | Show clear button |\n| hasSearch | `boolean` | `true` | The search field in the listbox |\n        '}}},argTypes:{placeholder:{control:{type:`text`},description:`Placeholder text when no value is selected`,table:{type:{summary:`string`}}},disabled:{control:{type:`boolean`},description:`Whether the select is disabled`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},hasClear:{control:{type:`boolean`},description:`Show clear button`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},hasSearch:{control:{type:`boolean`},description:`The search field in the listbox`,table:{type:{summary:`boolean`},defaultValue:{summary:`true`}}},onChange:{action:`changed`,description:`Callback with the selected host names`}}},k={name:`Basic`,parameters:{docs:{description:{story:`Basic usage showing a multi-select with 5 allowed host names. The component automatically fetches and displays available hosts.`}}},args:{placeholder:`Select a host`},render:e=>(0,S.jsx)(D,{children:(0,S.jsx)(y,{...e,width:300})})},A={name:`ClearButton`,parameters:{docs:{description:{story:`Select with hasClear enabled, allowing users to clear their selection.`}}},args:{placeholder:`Select a host`,hasClear:!0},render:e=>(0,S.jsx)(D,{children:(0,S.jsx)(y,{...e,width:300})})},j={name:`DisabledState`,parameters:{docs:{description:{story:`Shows the component in a disabled state where users cannot interact with it.`}}},args:{placeholder:`Select a host`,disabled:!0},render:e=>(0,S.jsx)(D,{children:(0,S.jsx)(y,{...e,width:300})})},M={name:`MultipleMode`,parameters:{docs:{description:{story:`Users select several hosts at once; the trigger names the selected hosts.`}}},args:{placeholder:`Select hosts`,defaultValue:[`host1.example.com`,`gpu-cluster.example.com`],hasClear:!0},render:e=>(0,S.jsx)(D,{children:(0,S.jsx)(y,{...e,width:400})})},N={name:`EmptyState`,parameters:{docs:{description:{story:`Shows the component when no allowed host names are returned from the API.`}}},args:{placeholder:`No hosts available`},render:e=>(0,S.jsx)(D,{allowed:[],children:(0,S.jsx)(y,{...e,width:300})})},P={name:`ManyOptions`,parameters:{docs:{description:{story:`Demonstrates the component with a large number of host options, showing scrollable dropdown behavior.`}}},args:{placeholder:`Select from 20 hosts`,hasClear:!0},render:e=>(0,S.jsx)(D,{allowed:w,children:(0,S.jsx)(y,{...e,width:300})})},F={name:`SearchEnabled`,parameters:{docs:{description:{story:"Search filters hosts by name. The component turns `hasSearch` on by default; pass `hasSearch={false}` to hide it."}}},args:{placeholder:`Search and select a host`,hasSearch:!0,hasClear:!0},render:e=>(0,S.jsx)(D,{children:(0,S.jsx)(y,{...e,width:300})})},I=[`Default`,`WithClearButton`,`Disabled`,`MultipleSelection`,`Empty`,`ManyHosts`,`WithSearch`],k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'Basic usage showing a multi-select with 5 allowed host names. The component automatically fetches and displays available hosts.'
      }
    }
  },
  args: {
    placeholder: 'Select a host'
  },
  render: args => <StoryProvider>
      <BAIAllowedHostNamesSelect {...args} width={300} />
    </StoryProvider>
}`,...k.parameters?.docs?.source},description:{story:`Basic usage of the component with default props.`,...k.parameters?.docs?.description}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  name: 'ClearButton',
  parameters: {
    docs: {
      description: {
        story: 'Select with hasClear enabled, allowing users to clear their selection.'
      }
    }
  },
  args: {
    placeholder: 'Select a host',
    hasClear: true
  },
  render: args => <StoryProvider>
      <BAIAllowedHostNamesSelect {...args} width={300} />
    </StoryProvider>
}`,...A.parameters?.docs?.source},description:{story:`Select with clear button enabled.`,...A.parameters?.docs?.description}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
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
      <BAIAllowedHostNamesSelect {...args} width={300} />
    </StoryProvider>
}`,...j.parameters?.docs?.source},description:{story:`Disabled state of the select.`,...j.parameters?.docs?.description}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  name: 'MultipleMode',
  parameters: {
    docs: {
      description: {
        story: 'Users select several hosts at once; the trigger names the selected hosts.'
      }
    }
  },
  args: {
    placeholder: 'Select hosts',
    defaultValue: ['host1.example.com', 'gpu-cluster.example.com'],
    hasClear: true
  },
  render: args => <StoryProvider>
      <BAIAllowedHostNamesSelect {...args} width={400} />
    </StoryProvider>
}`,...M.parameters?.docs?.source},description:{story:`Several hosts selected at once.`,...M.parameters?.docs?.description}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
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
      <BAIAllowedHostNamesSelect {...args} width={300} />
    </StoryProvider>
}`,...N.parameters?.docs?.source},description:{story:`Empty state when no hosts are available.`,...N.parameters?.docs?.description}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
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
    hasClear: true
  },
  render: args => <StoryProvider allowed={sampleManyHosts}>
      <BAIAllowedHostNamesSelect {...args} width={300} />
    </StoryProvider>
}`,...P.parameters?.docs?.source},description:{story:`Select with many host options.`,...P.parameters?.docs?.description}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  name: 'SearchEnabled',
  parameters: {
    docs: {
      description: {
        story: 'Search filters hosts by name. The component turns \`hasSearch\` on by default; pass \`hasSearch={false}\` to hide it.'
      }
    }
  },
  args: {
    placeholder: 'Search and select a host',
    hasSearch: true,
    hasClear: true
  },
  render: args => <StoryProvider>
      <BAIAllowedHostNamesSelect {...args} width={300} />
    </StoryProvider>
}`,...F.parameters?.docs?.source},description:{story:`Select with search functionality.`,...F.parameters?.docs?.description}}}})))()}L();export{k as Default,j as Disabled,N as Empty,P as ManyHosts,M as MultipleSelection,A as WithClearButton,F as WithSearch,I as __namedExportsOrder,O as default};