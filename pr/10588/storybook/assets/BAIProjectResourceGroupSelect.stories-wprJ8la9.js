import{a as e,n as t}from"./rolldown-runtime-sJBDdmOt.js";import{t as n}from"./react-D0Ex1IVc.js";import{m as r,o as i,t as a}from"./hooks-C37w8Ol6.js";import{n as o,t as s}from"./find-DwRoxbKX.js";import{n as c,t as l}from"./map-CLZMgxwS.js";import{n as u,t as d}from"./some-DkjZXzzg.js";import{t as f}from"./jsx-runtime-MKhVqBIO.js";import{n as p,t as m}from"./QueryClientProvider-BFgZ02ah.js";import{d as h,o as g,s as _,u as v}from"./iframe-BF4Nk2qQ.js";import{n as y,t as b}from"./BAISelect-CgNx8uBa.js";import{n as x,t as S}from"./BAITextHighlighter-Caiga3gF.js";var C,w,T;function E(){return(E=t((()=>{a(),y(),x(),d(),o(),l(),C=e(n(),1),w=f(),T=({projectName:e,autoSelectDefault:t,filter:n,includeSFTPResourceGroups:a,showSearch:o,loading:l,...d})=>{let[f,p]=r({value:typeof o==`object`?o?.searchValue:void 0,onChange:typeof o==`object`?o?.onSearch:void 0}),[m,h]=r(d),[g,_]=(0,C.useTransition)(),[v,y]=(0,C.useState)(),x=C.useCallback((e,...t)=>{y(e),_(()=>{h(e,...t)})},[_,h]),{resourceGroups:T}=i(e,{filter:n,includeSFTPResourceGroups:a});(0,C.useEffect)(()=>{m&&T.length>0&&!u(T,e=>e.name===m)&&x(void 0)},[T,m,x]);let E=s(T,e=>e.name==="default")||T[0],D=E?{label:E.name,value:E.name}:void 0;return(0,C.useEffect)(()=>{t&&D&&!m&&x(D.value,D)},[t,D?.value]),(0,w.jsx)(b,{defaultActiveFirstOption:!0,showSearch:o?{searchValue:f,onSearch:p}:void 0,defaultValue:t?D:void 0,loading:l||g,disabled:g,options:c(T,e=>({value:e.name,label:e.name})),optionRender:e=>(0,w.jsx)(S,{keyword:f,children:e.data.value?.toString()}),...d,value:g?v:m,onChange:x})}})))()}var D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U;function W(){return(W=t((()=>{E(),_(),h(),p(),D=n(),O=f(),k=[{name:`default`},{name:`gpu-cluster`},{name:`cpu-only`},{name:`high-memory`}],A=Array.from({length:15},(e,t)=>({name:`resource-group-${t+1}`})),j={allowed:[`host1`,`host2`],default:`host1`,volume_info:{vol1:{backend:`xfs`,capabilities:[`quota`,`fast-lookup`],usage:{percentage:45.2},sftp_scaling_groups:[`sftp-only`]}}},M=(e=k,t=j)=>Promise.resolve({newSignedRequest:(e,t,n)=>({url:t}),_wrapWithPromise:n=>n.url.includes(`/scaling-groups`)?Promise.resolve({scaling_groups:e}):n.url.includes(`/folders/_/hosts`)?Promise.resolve(t):Promise.resolve({})}),N=()=>({}),P=({children:e,scalingGroups:t=k,volumeInfo:n=j})=>{let r=(0,D.useMemo)(()=>M(t,n),[t,n]),[i]=(0,D.useState)(()=>new v({defaultOptions:{queries:{retry:!1,gcTime:0,staleTime:0}}}));return(0,O.jsx)(g,{locale:{lang:`en`},clientPromise:r,anonymousClientFactory:N,children:(0,O.jsx)(m,{client:i,children:(0,O.jsx)(D.Suspense,{fallback:(0,O.jsx)(`div`,{children:`Loading...`}),children:e})})})},F={title:`Select/BAIProjectResourceGroupSelect`,component:T,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`
**BAIProjectResourceGroupSelect** extends [BAISelect](/?path=/docs/components-input-baiselect--docs) to fetch and display resource groups for a project.

## BAI-Specific Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| \`projectName\` | \`string\` | **required** | Project name to fetch resource groups for |
| \`autoSelectDefault\` | \`boolean\` | \`false\` | Auto-select 'default' or first resource group |
| \`filter\` | \`(name: string) => boolean\` | - | Custom filter function for resource groups |

## Features
- Fetches scaling groups from \`/scaling-groups?group={projectName}\`
- Fetches volume info from \`/folders/_/hosts\`
- Automatically filters out SFTP-only resource groups
- Auto-selection with \`autoSelectDefault\` prop
- Built-in search with text highlighting
- TanStack Query integration with 5-minute cache

## Usage
\`\`\`tsx
<BAIProjectResourceGroupSelect
  projectName="my-project"
  autoSelectDefault
  placeholder="Select resource group"
  onChange={(value) => console.log(value)}
/>
\`\`\`

For all other props, refer to [BAISelect](/?path=/docs/components-input-baiselect--docs).
        `}}},argTypes:{projectName:{control:{type:`text`},description:`Project name to fetch resource groups for`,table:{type:{summary:`string`}}},autoSelectDefault:{control:{type:`boolean`},description:`Auto-select 'default' resource group or first available option`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},filter:{control:!1,description:`Custom filter function to filter resource groups by name`,table:{type:{summary:`(name: string) => boolean`}}},placeholder:{control:{type:`text`},description:`Placeholder text`,table:{type:{summary:`string`}}},showSearch:{control:{type:`boolean`},description:`Enable search functionality`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},onChange:{action:`changed`,description:`Callback when selection changes`}}},I={name:`Basic`,parameters:{docs:{description:{story:`Basic usage with 4 sample resource groups (default, gpu-cluster, cpu-only, high-memory). SFTP resource groups are automatically filtered out.`}}},args:{projectName:`test-project`,placeholder:`Select resource group`},render:e=>(0,O.jsx)(P,{children:(0,O.jsx)(T,{...e,style:{width:300}})})},L={name:`AutoSelect`,parameters:{docs:{description:{story:`Automatically selects 'default' resource group when component mounts. If 'default' doesn't exist, selects the first available option.`}}},args:{projectName:`test-project`,autoSelectDefault:!0,placeholder:`Select resource group`},render:e=>(0,O.jsx)(P,{children:(0,O.jsx)(T,{...e,style:{width:300}})})},R={name:`SearchEnabled`,parameters:{docs:{description:{story:`Enables search functionality to filter resource groups by name. Matching text is highlighted in options.`}}},args:{projectName:`test-project`,placeholder:`Search resource groups`,showSearch:!0},render:e=>(0,O.jsx)(P,{children:(0,O.jsx)(T,{...e,style:{width:300}})})},z={name:`EmptyState`,parameters:{docs:{description:{story:`Shows the component when no resource groups are returned from the API.`}}},args:{projectName:`test-project`,placeholder:`No resource groups available`},render:e=>(0,O.jsx)(P,{scalingGroups:[],children:(0,O.jsx)(T,{...e,style:{width:300}})})},B={name:`AutoSelectFirstOption`,parameters:{docs:{description:{story:`When autoSelectDefault is enabled but 'default' resource group doesn't exist, automatically selects the first available option.`}}},args:{projectName:`test-project`,autoSelectDefault:!0,placeholder:`Select resource group`},render:e=>(0,O.jsx)(P,{scalingGroups:[{name:`gpu-cluster`},{name:`cpu-only`}],children:(0,O.jsx)(T,{...e,style:{width:300}})})},V={name:`CustomFilter`,parameters:{docs:{description:{story:`Uses custom filter function to show only resource groups containing "gpu" in their name.`}}},args:{projectName:`test-project`,placeholder:`Select GPU resource group`,filter:e=>e.includes(`gpu`)},render:e=>(0,O.jsx)(P,{children:(0,O.jsx)(T,{...e,style:{width:300}})})},H={name:`ManyResourceGroups`,parameters:{docs:{description:{story:`Demonstrates the component with 15 resource groups, showing scrollable dropdown behavior.`}}},args:{projectName:`test-project`,placeholder:`Select from 15 resource groups`,showSearch:!0},render:e=>(0,O.jsx)(P,{scalingGroups:A,children:(0,O.jsx)(T,{...e,style:{width:300}})})},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'Basic usage with 4 sample resource groups (default, gpu-cluster, cpu-only, high-memory). SFTP resource groups are automatically filtered out.'
      }
    }
  },
  args: {
    projectName: 'test-project',
    placeholder: 'Select resource group'
  },
  render: args => <StoryProvider>
      <BAIProjectResourceGroupSelect {...args} style={{
      width: 300
    }} />
    </StoryProvider>
}`,...I.parameters?.docs?.source},description:{story:`Basic usage showing 4 resource groups with auto-selection disabled.`,...I.parameters?.docs?.description}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  name: 'AutoSelect',
  parameters: {
    docs: {
      description: {
        story: "Automatically selects 'default' resource group when component mounts. If 'default' doesn't exist, selects the first available option."
      }
    }
  },
  args: {
    projectName: 'test-project',
    autoSelectDefault: true,
    placeholder: 'Select resource group'
  },
  render: args => <StoryProvider>
      <BAIProjectResourceGroupSelect {...args} style={{
      width: 300
    }} />
    </StoryProvider>
}`,...L.parameters?.docs?.source},description:{story:`Auto-selects 'default' resource group on mount.`,...L.parameters?.docs?.description}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  name: 'SearchEnabled',
  parameters: {
    docs: {
      description: {
        story: 'Enables search functionality to filter resource groups by name. Matching text is highlighted in options.'
      }
    }
  },
  args: {
    projectName: 'test-project',
    placeholder: 'Search resource groups',
    showSearch: true
  },
  render: args => <StoryProvider>
      <BAIProjectResourceGroupSelect {...args} style={{
      width: 300
    }} />
    </StoryProvider>
}`,...R.parameters?.docs?.source},description:{story:`Shows search functionality with text highlighting.`,...R.parameters?.docs?.description}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  name: 'EmptyState',
  parameters: {
    docs: {
      description: {
        story: 'Shows the component when no resource groups are returned from the API.'
      }
    }
  },
  args: {
    projectName: 'test-project',
    placeholder: 'No resource groups available'
  },
  render: args => <StoryProvider scalingGroups={[]}>
      <BAIProjectResourceGroupSelect {...args} style={{
      width: 300
    }} />
    </StoryProvider>
}`,...z.parameters?.docs?.source},description:{story:`Empty state when no resource groups are available.`,...z.parameters?.docs?.description}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  name: 'AutoSelectFirstOption',
  parameters: {
    docs: {
      description: {
        story: "When autoSelectDefault is enabled but 'default' resource group doesn't exist, automatically selects the first available option."
      }
    }
  },
  args: {
    projectName: 'test-project',
    autoSelectDefault: true,
    placeholder: 'Select resource group'
  },
  render: args => <StoryProvider scalingGroups={[{
    name: 'gpu-cluster'
  }, {
    name: 'cpu-only'
  }]}>
      <BAIProjectResourceGroupSelect {...args} style={{
      width: 300
    }} />
    </StoryProvider>
}`,...B.parameters?.docs?.source},description:{story:`Auto-select when 'default' doesn't exist - selects first option.`,...B.parameters?.docs?.description}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  name: 'CustomFilter',
  parameters: {
    docs: {
      description: {
        story: 'Uses custom filter function to show only resource groups containing "gpu" in their name.'
      }
    }
  },
  args: {
    projectName: 'test-project',
    placeholder: 'Select GPU resource group',
    filter: (name: string) => name.includes('gpu')
  },
  render: args => <StoryProvider>
      <BAIProjectResourceGroupSelect {...args} style={{
      width: 300
    }} />
    </StoryProvider>
}`,...V.parameters?.docs?.source},description:{story:`Using custom filter function to show only GPU resource groups.`,...V.parameters?.docs?.description}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  name: 'ManyResourceGroups',
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the component with 15 resource groups, showing scrollable dropdown behavior.'
      }
    }
  },
  args: {
    projectName: 'test-project',
    placeholder: 'Select from 15 resource groups',
    showSearch: true
  },
  render: args => <StoryProvider scalingGroups={sampleManyGroups}>
      <BAIProjectResourceGroupSelect {...args} style={{
      width: 300
    }} />
    </StoryProvider>
}`,...H.parameters?.docs?.source},description:{story:`Many resource groups with scrollable dropdown.`,...H.parameters?.docs?.description}}},U=[`Default`,`AutoSelectDefault`,`WithSearch`,`Empty`,`AutoSelectWithoutDefault`,`WithCustomFilter`,`ManyOptions`]})))()}W();export{L as AutoSelectDefault,B as AutoSelectWithoutDefault,I as Default,z as Empty,H as ManyOptions,V as WithCustomFilter,R as WithSearch,U as __namedExportsOrder,F as default};