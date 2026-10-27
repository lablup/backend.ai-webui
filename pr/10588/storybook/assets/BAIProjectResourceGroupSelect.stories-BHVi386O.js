import{n as e}from"./rolldown-runtime-2s6bX4vc.js";import{m as t,o as n,t as r}from"./hooks-BKuvs6Qg.js";import{n as i,t as a}from"./find-BPjeGL13.js";import{n as o,t as s}from"./map-CIqW7OVA.js";import{n as c,t as l}from"./some-DcSiuKF1.js";import{a as u,i as d}from"./iframe-DR2sIF5r.js";import{n as f,t as p}from"./BAISelect-Dty2gXL7.js";import{n as m,t as h}from"./BAITextHighlighter-zW4Nzx0i.js";import g,{Suspense as _,useEffect as v,useMemo as y,useState as b,useTransition as x}from"react";import{jsx as S}from"react/jsx-runtime";import{QueryClient as C,QueryClientProvider as w}from"@tanstack/react-query";var T;function E(){return(E=e((()=>{r(),f(),m(),l(),i(),s(),T=({projectName:e,autoSelectDefault:r,filter:i,includeSFTPResourceGroups:s,showSearch:l,loading:u,...d})=>{let[f,m]=t({value:typeof l==`object`?l?.searchValue:void 0,onChange:typeof l==`object`?l?.onSearch:void 0}),[_,y]=t(d),[C,w]=x(),[T,E]=b(),D=g.useCallback((e,...t)=>{E(e),w(()=>{y(e,...t)})},[w,y]),{resourceGroups:O}=n(e,{filter:i,includeSFTPResourceGroups:s});v(()=>{_&&O.length>0&&!c(O,e=>e.name===_)&&D(void 0)},[O,_,D]);let k=a(O,e=>e.name==="default")||O[0],A=k?{label:k.name,value:k.name}:void 0;return v(()=>{r&&A&&!_&&D(A.value,A)},[r,A?.value]),S(p,{defaultActiveFirstOption:!0,showSearch:l?{searchValue:f,onSearch:m}:void 0,defaultValue:r?A:void 0,loading:u||C,disabled:C,options:o(O,e=>({value:e.name,label:e.name})),optionRender:e=>S(h,{keyword:f,children:e.data.value?.toString()}),...d,value:C?T:_,onChange:D})}})))()}var D,O,k,A,j,M,N,P,F,I,L,R,z,B,V;function H(){return(H=e((()=>{E(),u(),D=[{name:`default`},{name:`gpu-cluster`},{name:`cpu-only`},{name:`high-memory`}],O=Array.from({length:15},(e,t)=>({name:`resource-group-${t+1}`})),k={allowed:[`host1`,`host2`],default:`host1`,volume_info:{vol1:{backend:`xfs`,capabilities:[`quota`,`fast-lookup`],usage:{percentage:45.2},sftp_scaling_groups:[`sftp-only`]}}},A=(e=D,t=k)=>Promise.resolve({newSignedRequest:(e,t,n)=>({url:t}),_wrapWithPromise:n=>n.url.includes(`/scaling-groups`)?Promise.resolve({scaling_groups:e}):n.url.includes(`/folders/_/hosts`)?Promise.resolve(t):Promise.resolve({})}),j=()=>({}),M=({children:e,scalingGroups:t=D,volumeInfo:n=k})=>{let r=y(()=>A(t,n),[t,n]),[i]=b(()=>new C({defaultOptions:{queries:{retry:!1,gcTime:0,staleTime:0}}}));return S(d,{locale:{lang:`en`},clientPromise:r,anonymousClientFactory:j,children:S(w,{client:i,children:S(_,{fallback:S(`div`,{children:`Loading...`}),children:e})})})},N={title:`Select/BAIProjectResourceGroupSelect`,component:T,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`
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
        `}}},argTypes:{projectName:{control:{type:`text`},description:`Project name to fetch resource groups for`,table:{type:{summary:`string`}}},autoSelectDefault:{control:{type:`boolean`},description:`Auto-select 'default' resource group or first available option`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},filter:{control:!1,description:`Custom filter function to filter resource groups by name`,table:{type:{summary:`(name: string) => boolean`}}},placeholder:{control:{type:`text`},description:`Placeholder text`,table:{type:{summary:`string`}}},showSearch:{control:{type:`boolean`},description:`Enable search functionality`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},onChange:{action:`changed`,description:`Callback when selection changes`}}},P={name:`Basic`,parameters:{docs:{description:{story:`Basic usage with 4 sample resource groups (default, gpu-cluster, cpu-only, high-memory). SFTP resource groups are automatically filtered out.`}}},args:{projectName:`test-project`,placeholder:`Select resource group`},render:e=>S(M,{children:S(T,{...e,style:{width:300}})})},F={name:`AutoSelect`,parameters:{docs:{description:{story:`Automatically selects 'default' resource group when component mounts. If 'default' doesn't exist, selects the first available option.`}}},args:{projectName:`test-project`,autoSelectDefault:!0,placeholder:`Select resource group`},render:e=>S(M,{children:S(T,{...e,style:{width:300}})})},I={name:`SearchEnabled`,parameters:{docs:{description:{story:`Enables search functionality to filter resource groups by name. Matching text is highlighted in options.`}}},args:{projectName:`test-project`,placeholder:`Search resource groups`,showSearch:!0},render:e=>S(M,{children:S(T,{...e,style:{width:300}})})},L={name:`EmptyState`,parameters:{docs:{description:{story:`Shows the component when no resource groups are returned from the API.`}}},args:{projectName:`test-project`,placeholder:`No resource groups available`},render:e=>S(M,{scalingGroups:[],children:S(T,{...e,style:{width:300}})})},R={name:`AutoSelectFirstOption`,parameters:{docs:{description:{story:`When autoSelectDefault is enabled but 'default' resource group doesn't exist, automatically selects the first available option.`}}},args:{projectName:`test-project`,autoSelectDefault:!0,placeholder:`Select resource group`},render:e=>S(M,{scalingGroups:[{name:`gpu-cluster`},{name:`cpu-only`}],children:S(T,{...e,style:{width:300}})})},z={name:`CustomFilter`,parameters:{docs:{description:{story:`Uses custom filter function to show only resource groups containing "gpu" in their name.`}}},args:{projectName:`test-project`,placeholder:`Select GPU resource group`,filter:e=>e.includes(`gpu`)},render:e=>S(M,{children:S(T,{...e,style:{width:300}})})},B={name:`ManyResourceGroups`,parameters:{docs:{description:{story:`Demonstrates the component with 15 resource groups, showing scrollable dropdown behavior.`}}},args:{projectName:`test-project`,placeholder:`Select from 15 resource groups`,showSearch:!0},render:e=>S(M,{scalingGroups:O,children:S(T,{...e,style:{width:300}})})},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
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
}`,...P.parameters?.docs?.source},description:{story:`Basic usage showing 4 resource groups with auto-selection disabled.`,...P.parameters?.docs?.description}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
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
}`,...F.parameters?.docs?.source},description:{story:`Auto-selects 'default' resource group on mount.`,...F.parameters?.docs?.description}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
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
}`,...I.parameters?.docs?.source},description:{story:`Shows search functionality with text highlighting.`,...I.parameters?.docs?.description}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
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
}`,...L.parameters?.docs?.source},description:{story:`Empty state when no resource groups are available.`,...L.parameters?.docs?.description}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
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
}`,...R.parameters?.docs?.source},description:{story:`Auto-select when 'default' doesn't exist - selects first option.`,...R.parameters?.docs?.description}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
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
}`,...z.parameters?.docs?.source},description:{story:`Using custom filter function to show only GPU resource groups.`,...z.parameters?.docs?.description}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
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
}`,...B.parameters?.docs?.source},description:{story:`Many resource groups with scrollable dropdown.`,...B.parameters?.docs?.description}}},V=[`Default`,`AutoSelectDefault`,`WithSearch`,`Empty`,`AutoSelectWithoutDefault`,`WithCustomFilter`,`ManyOptions`]})))()}H();export{F as AutoSelectDefault,R as AutoSelectWithoutDefault,P as Default,L as Empty,B as ManyOptions,z as WithCustomFilter,I as WithSearch,V as __namedExportsOrder,N as default};