import{a as e,n as t}from"./rolldown-runtime-sJBDdmOt.js";import{t as n}from"./react-DlPsW1c0.js";import{m as r,o as i,t as a}from"./hooks-DgO_LXe-.js";import{n as o,t as s}from"./find-DOIFDFv0.js";import{n as c,t as l}from"./map-IIuwj5IU.js";import{n as u,t as d}from"./some-j4tCX4Ho.js";import{t as f}from"./jsx-runtime-MKhVqBIO.js";import{n as p,t as m}from"./QueryClientProvider-BSeQxIx-.js";import{d as h,o as g,s as _,u as v}from"./iframe-hy8vQydL.js";import{n as y,t as b}from"./BAISelect-uoBj7Xbb.js";var x,S,C;function w(){return(w=t((()=>{a(),y(),d(),o(),l(),x=e(n(),1),S=f(),C=({projectName:e,autoSelectDefault:t,filter:n,includeSFTPResourceGroups:a,isLoading:o,...l})=>{let[d,f]=r(l),[p,m]=(0,x.useTransition)(),[h,g]=(0,x.useState)(),_=x.useCallback((e,...t)=>{g(e),m(()=>{f(e,...t)})},[m,f]),{resourceGroups:v}=i(e,{filter:n,includeSFTPResourceGroups:a});(0,x.useEffect)(()=>{d&&v.length>0&&!u(v,e=>e.name===d)&&_(void 0)},[v,d,_]);let y=s(v,e=>e.name==="default")||v[0],C=y?{label:y.name,value:y.name}:void 0;return(0,x.useEffect)(()=>{t&&C&&!d&&_(C.value,C)},[t,C?.value]),(0,S.jsx)(b,{isLoading:o||p,disabled:p,options:c(v,e=>({value:e.name,label:e.name})),...l,value:p?h:d,onChange:_})}})))()}var T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V;function H(){return(H=t((()=>{w(),_(),h(),p(),T=n(),E=f(),D=[{name:`default`},{name:`gpu-cluster`},{name:`cpu-only`},{name:`high-memory`}],O=Array.from({length:15},(e,t)=>({name:`resource-group-${t+1}`})),k={allowed:[`host1`,`host2`],default:`host1`,volume_info:{vol1:{backend:`xfs`,capabilities:[`quota`,`fast-lookup`],usage:{percentage:45.2},sftp_scaling_groups:[`sftp-only`]}}},A=(e=D,t=k)=>Promise.resolve({newSignedRequest:(e,t,n)=>({url:t}),_wrapWithPromise:n=>n.url.includes(`/scaling-groups`)?Promise.resolve({scaling_groups:e}):n.url.includes(`/folders/_/hosts`)?Promise.resolve(t):Promise.resolve({})}),j=()=>({}),M=({children:e,scalingGroups:t=D,volumeInfo:n=k})=>{let r=(0,T.useMemo)(()=>A(t,n),[t,n]),[i]=(0,T.useState)(()=>new v({defaultOptions:{queries:{retry:!1,gcTime:0,staleTime:0}}}));return(0,E.jsx)(g,{locale:{lang:`en`},clientPromise:r,anonymousClientFactory:j,children:(0,E.jsx)(m,{client:i,children:(0,E.jsx)(T.Suspense,{fallback:(0,E.jsx)(`div`,{children:`Loading...`}),children:e})})})},N={title:`Select/BAIProjectResourceGroupSelect`,component:C,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`
**BAIProjectResourceGroupSelect** extends [BAISelect](/?path=/docs/select-baiselect--docs) to fetch and display resource groups for a project.

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
- Built-in search, on by default
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

For all other props, refer to [BAISelect](/?path=/docs/select-baiselect--docs).
        `}}},argTypes:{projectName:{control:{type:`text`},description:`Project name to fetch resource groups for`,table:{type:{summary:`string`}}},autoSelectDefault:{control:{type:`boolean`},description:`Auto-select 'default' resource group or first available option`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},filter:{control:!1,description:`Custom filter function to filter resource groups by name`,table:{type:{summary:`(name: string) => boolean`}}},placeholder:{control:{type:`text`},description:`Placeholder text`,table:{type:{summary:`string`}}},hasSearch:{control:{type:`boolean`},description:`The search field in the listbox`,table:{type:{summary:`boolean`},defaultValue:{summary:`true`}}},onChange:{action:`changed`,description:`Callback when selection changes`}}},P={name:`Basic`,parameters:{docs:{description:{story:`Basic usage with 4 sample resource groups (default, gpu-cluster, cpu-only, high-memory). SFTP resource groups are automatically filtered out.`}}},args:{projectName:`test-project`,placeholder:`Select resource group`},render:e=>(0,E.jsx)(M,{children:(0,E.jsx)(C,{...e,width:300})})},F={name:`AutoSelect`,parameters:{docs:{description:{story:`Automatically selects 'default' resource group when component mounts. If 'default' doesn't exist, selects the first available option.`}}},args:{projectName:`test-project`,autoSelectDefault:!0,placeholder:`Select resource group`},render:e=>(0,E.jsx)(M,{children:(0,E.jsx)(C,{...e,width:300})})},I={name:`SearchEnabled`,parameters:{docs:{description:{story:"Search filters resource groups by name. BAISelect turns `hasSearch` on by default; pass `hasSearch={false}` to hide it."}}},args:{projectName:`test-project`,placeholder:`Search resource groups`,hasSearch:!0},render:e=>(0,E.jsx)(M,{children:(0,E.jsx)(C,{...e,width:300})})},L={name:`EmptyState`,parameters:{docs:{description:{story:`Shows the component when no resource groups are returned from the API.`}}},args:{projectName:`test-project`,placeholder:`No resource groups available`},render:e=>(0,E.jsx)(M,{scalingGroups:[],children:(0,E.jsx)(C,{...e,width:300})})},R={name:`AutoSelectFirstOption`,parameters:{docs:{description:{story:`When autoSelectDefault is enabled but 'default' resource group doesn't exist, automatically selects the first available option.`}}},args:{projectName:`test-project`,autoSelectDefault:!0,placeholder:`Select resource group`},render:e=>(0,E.jsx)(M,{scalingGroups:[{name:`gpu-cluster`},{name:`cpu-only`}],children:(0,E.jsx)(C,{...e,width:300})})},z={name:`CustomFilter`,parameters:{docs:{description:{story:`Uses custom filter function to show only resource groups containing "gpu" in their name.`}}},args:{projectName:`test-project`,placeholder:`Select GPU resource group`,filter:e=>e.includes(`gpu`)},render:e=>(0,E.jsx)(M,{children:(0,E.jsx)(C,{...e,width:300})})},B={name:`ManyResourceGroups`,parameters:{docs:{description:{story:`Demonstrates the component with 15 resource groups, showing scrollable dropdown behavior.`}}},args:{projectName:`test-project`,placeholder:`Select from 15 resource groups`},render:e=>(0,E.jsx)(M,{scalingGroups:O,children:(0,E.jsx)(C,{...e,width:300})})},V=[`Default`,`AutoSelectDefault`,`WithSearch`,`Empty`,`AutoSelectWithoutDefault`,`WithCustomFilter`,`ManyOptions`],P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
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
      <BAIProjectResourceGroupSelect {...args} width={300} />
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
      <BAIProjectResourceGroupSelect {...args} width={300} />
    </StoryProvider>
}`,...F.parameters?.docs?.source},description:{story:`Auto-selects 'default' resource group on mount.`,...F.parameters?.docs?.description}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  name: 'SearchEnabled',
  parameters: {
    docs: {
      description: {
        story: 'Search filters resource groups by name. BAISelect turns \`hasSearch\` on by default; pass \`hasSearch={false}\` to hide it.'
      }
    }
  },
  args: {
    projectName: 'test-project',
    placeholder: 'Search resource groups',
    hasSearch: true
  },
  render: args => <StoryProvider>
      <BAIProjectResourceGroupSelect {...args} width={300} />
    </StoryProvider>
}`,...I.parameters?.docs?.source},description:{story:`Shows the search field filtering resource groups.`,...I.parameters?.docs?.description}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
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
      <BAIProjectResourceGroupSelect {...args} width={300} />
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
      <BAIProjectResourceGroupSelect {...args} width={300} />
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
      <BAIProjectResourceGroupSelect {...args} width={300} />
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
    placeholder: 'Select from 15 resource groups'
  },
  render: args => <StoryProvider scalingGroups={sampleManyGroups}>
      <BAIProjectResourceGroupSelect {...args} width={300} />
    </StoryProvider>
}`,...B.parameters?.docs?.source},description:{story:`Many resource groups with scrollable dropdown.`,...B.parameters?.docs?.description}}}})))()}H();export{F as AutoSelectDefault,R as AutoSelectWithoutDefault,P as Default,L as Empty,B as ManyOptions,z as WithCustomFilter,I as WithSearch,V as __namedExportsOrder,N as default};