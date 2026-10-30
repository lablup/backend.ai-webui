import{a as e,n as t}from"./rolldown-runtime-sJBDdmOt.js";import{t as n}from"./react-DlPsW1c0.js";import{m as r,o as ee,t as i}from"./hooks-CqTIG_8a.js";import{n as a,t as te}from"./find-DAho-s_l.js";import{n as ne,t as o}from"./map-BLzs52H1.js";import{n as re,t as s}from"./some-h0q6V2XB.js";import{t as c}from"./jsx-runtime-MKhVqBIO.js";import{n as ie,t as l}from"./QueryClientProvider-DHWAICrJ.js";import{d as u,o as d,s as f,u as ae}from"./iframe-DnpvlTFX.js";import{n as oe,t as se}from"./BAISelect-BsG27iMN.js";import{n as p,t as ce}from"./BAITextHighlighter-CQYJjOO6.js";var m,h,g;function _(){return(_=t((()=>{i(),oe(),p(),s(),a(),o(),m=e(n(),1),h=c(),g=({projectName:e,autoSelectDefault:t,filter:n,includeSFTPResourceGroups:i,showSearch:a,loading:o,...s})=>{let[c,ie]=r({value:typeof a==`object`?a==null?void 0:a.searchValue:void 0,onChange:typeof a==`object`?a==null?void 0:a.onSearch:void 0}),[l,u]=r(s),[d,f]=(0,m.useTransition)(),[ae,oe]=(0,m.useState)(),p=m.useCallback((e,...t)=>{oe(e),f(()=>{u(e,...t)})},[f,u]),{resourceGroups:g}=ee(e,{filter:n,includeSFTPResourceGroups:i});(0,m.useEffect)(()=>{l&&g.length>0&&!re(g,e=>e.name===l)&&p(void 0)},[g,l,p]);let _=te(g,e=>e.name==="default")||g[0],v=_?{label:_.name,value:_.name}:void 0;return(0,m.useEffect)(()=>{t&&v&&!l&&p(v.value,v)},[t,v==null?void 0:v.value]),(0,h.jsx)(se,{defaultActiveFirstOption:!0,showSearch:a?{searchValue:c,onSearch:ie}:void 0,defaultValue:t?v:void 0,loading:o||d,disabled:d,options:ne(g,e=>({value:e.name,label:e.name})),optionRender:e=>{var t;return(0,h.jsx)(ce,{keyword:c,children:(t=e.data.value)==null?void 0:t.toString()})},...s,value:d?ae:l,onChange:p})}})))()}var v,y,b,x,S,C,w,T,le,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q,$,ue;function de(){return(de=t((()=>{_(),f(),u(),ie(),v=n(),y=c(),B=[{name:`default`},{name:`gpu-cluster`},{name:`cpu-only`},{name:`high-memory`}],V=Array.from({length:15},(e,t)=>({name:`resource-group-${t+1}`})),H={allowed:[`host1`,`host2`],default:`host1`,volume_info:{vol1:{backend:`xfs`,capabilities:[`quota`,`fast-lookup`],usage:{percentage:45.2},sftp_scaling_groups:[`sftp-only`]}}},U=(e=B,t=H)=>Promise.resolve({newSignedRequest:(e,t,n)=>({url:t}),_wrapWithPromise:n=>n.url.includes(`/scaling-groups`)?Promise.resolve({scaling_groups:e}):n.url.includes(`/folders/_/hosts`)?Promise.resolve(t):Promise.resolve({})}),W=()=>({}),G=({children:e,scalingGroups:t=B,volumeInfo:n=H})=>{let r=(0,v.useMemo)(()=>U(t,n),[t,n]),[ee]=(0,v.useState)(()=>new ae({defaultOptions:{queries:{retry:!1,gcTime:0,staleTime:0}}}));return(0,y.jsx)(d,{locale:{lang:`en`},clientPromise:r,anonymousClientFactory:W,children:(0,y.jsx)(l,{client:ee,children:(0,y.jsx)(v.Suspense,{fallback:(0,y.jsx)(`div`,{children:`Loading...`}),children:e})})})},K={title:`Select/BAIProjectResourceGroupSelect`,component:g,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`
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
        `}}},argTypes:{projectName:{control:{type:`text`},description:`Project name to fetch resource groups for`,table:{type:{summary:`string`}}},autoSelectDefault:{control:{type:`boolean`},description:`Auto-select 'default' resource group or first available option`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},filter:{control:!1,description:`Custom filter function to filter resource groups by name`,table:{type:{summary:`(name: string) => boolean`}}},placeholder:{control:{type:`text`},description:`Placeholder text`,table:{type:{summary:`string`}}},showSearch:{control:{type:`boolean`},description:`Enable search functionality`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},onChange:{action:`changed`,description:`Callback when selection changes`}}},q={name:`Basic`,parameters:{docs:{description:{story:`Basic usage with 4 sample resource groups (default, gpu-cluster, cpu-only, high-memory). SFTP resource groups are automatically filtered out.`}}},args:{projectName:`test-project`,placeholder:`Select resource group`},render:e=>(0,y.jsx)(G,{children:(0,y.jsx)(g,{...e,style:{width:300}})})},J={name:`AutoSelect`,parameters:{docs:{description:{story:`Automatically selects 'default' resource group when component mounts. If 'default' doesn't exist, selects the first available option.`}}},args:{projectName:`test-project`,autoSelectDefault:!0,placeholder:`Select resource group`},render:e=>(0,y.jsx)(G,{children:(0,y.jsx)(g,{...e,style:{width:300}})})},Y={name:`SearchEnabled`,parameters:{docs:{description:{story:`Enables search functionality to filter resource groups by name. Matching text is highlighted in options.`}}},args:{projectName:`test-project`,placeholder:`Search resource groups`,showSearch:!0},render:e=>(0,y.jsx)(G,{children:(0,y.jsx)(g,{...e,style:{width:300}})})},X={name:`EmptyState`,parameters:{docs:{description:{story:`Shows the component when no resource groups are returned from the API.`}}},args:{projectName:`test-project`,placeholder:`No resource groups available`},render:e=>(0,y.jsx)(G,{scalingGroups:[],children:(0,y.jsx)(g,{...e,style:{width:300}})})},Z={name:`AutoSelectFirstOption`,parameters:{docs:{description:{story:`When autoSelectDefault is enabled but 'default' resource group doesn't exist, automatically selects the first available option.`}}},args:{projectName:`test-project`,autoSelectDefault:!0,placeholder:`Select resource group`},render:e=>(0,y.jsx)(G,{scalingGroups:[{name:`gpu-cluster`},{name:`cpu-only`}],children:(0,y.jsx)(g,{...e,style:{width:300}})})},Q={name:`CustomFilter`,parameters:{docs:{description:{story:`Uses custom filter function to show only resource groups containing "gpu" in their name.`}}},args:{projectName:`test-project`,placeholder:`Select GPU resource group`,filter:e=>e.includes(`gpu`)},render:e=>(0,y.jsx)(G,{children:(0,y.jsx)(g,{...e,style:{width:300}})})},$={name:`ManyResourceGroups`,parameters:{docs:{description:{story:`Demonstrates the component with 15 resource groups, showing scrollable dropdown behavior.`}}},args:{projectName:`test-project`,placeholder:`Select from 15 resource groups`,showSearch:!0},render:e=>(0,y.jsx)(G,{scalingGroups:V,children:(0,y.jsx)(g,{...e,style:{width:300}})})},q.parameters={...q.parameters,docs:{...(b=q.parameters)==null?void 0:b.docs,source:{originalSource:`{
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
}`,...(x=q.parameters)==null||(x=x.docs)==null?void 0:x.source},description:{story:`Basic usage showing 4 resource groups with auto-selection disabled.`,...(S=q.parameters)==null||(S=S.docs)==null?void 0:S.description}}},J.parameters={...J.parameters,docs:{...(C=J.parameters)==null?void 0:C.docs,source:{originalSource:`{
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
}`,...(w=J.parameters)==null||(w=w.docs)==null?void 0:w.source},description:{story:`Auto-selects 'default' resource group on mount.`,...(T=J.parameters)==null||(T=T.docs)==null?void 0:T.description}}},Y.parameters={...Y.parameters,docs:{...(le=Y.parameters)==null?void 0:le.docs,source:{originalSource:`{
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
}`,...(E=Y.parameters)==null||(E=E.docs)==null?void 0:E.source},description:{story:`Shows search functionality with text highlighting.`,...(D=Y.parameters)==null||(D=D.docs)==null?void 0:D.description}}},X.parameters={...X.parameters,docs:{...(O=X.parameters)==null?void 0:O.docs,source:{originalSource:`{
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
}`,...(k=X.parameters)==null||(k=k.docs)==null?void 0:k.source},description:{story:`Empty state when no resource groups are available.`,...(A=X.parameters)==null||(A=A.docs)==null?void 0:A.description}}},Z.parameters={...Z.parameters,docs:{...(j=Z.parameters)==null?void 0:j.docs,source:{originalSource:`{
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
}`,...(M=Z.parameters)==null||(M=M.docs)==null?void 0:M.source},description:{story:`Auto-select when 'default' doesn't exist - selects first option.`,...(N=Z.parameters)==null||(N=N.docs)==null?void 0:N.description}}},Q.parameters={...Q.parameters,docs:{...(P=Q.parameters)==null?void 0:P.docs,source:{originalSource:`{
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
}`,...(F=Q.parameters)==null||(F=F.docs)==null?void 0:F.source},description:{story:`Using custom filter function to show only GPU resource groups.`,...(I=Q.parameters)==null||(I=I.docs)==null?void 0:I.description}}},$.parameters={...$.parameters,docs:{...(L=$.parameters)==null?void 0:L.docs,source:{originalSource:`{
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
}`,...(R=$.parameters)==null||(R=R.docs)==null?void 0:R.source},description:{story:`Many resource groups with scrollable dropdown.`,...(z=$.parameters)==null||(z=z.docs)==null?void 0:z.description}}},ue=[`Default`,`AutoSelectDefault`,`WithSearch`,`Empty`,`AutoSelectWithoutDefault`,`WithCustomFilter`,`ManyOptions`]})))()}de();export{J as AutoSelectDefault,Z as AutoSelectWithoutDefault,q as Default,X as Empty,$ as ManyOptions,Q as WithCustomFilter,Y as WithSearch,ue as __namedExportsOrder,K as default};