import{r as y,R as he,j as a,c as fe,at as ye,au as Se,av as je}from"./iframe-BE2I1VOx.js";import{B as be}from"./BAISelect-bW-2Qs9a.js";import{B as ve}from"./BAITextHighlighter-DK0OySpu.js";import{u as _}from"./useControllableValue-CUAtakte.js";import{u as Pe}from"./reactQueryAlias-CI9ZJd1V.js";import{u as we}from"./useConnectedBAIClient-0VqiCci4.js";import{f as xe}from"./flatMap-BOvbG5vr.js";import{f as Ae}from"./filter-CifkK0Lp.js";import{i as Ge}from"./includes-Dvl5BkmN.js";import{s as Re}from"./some-CqGimkgh.js";import{f as Ce}from"./find-DpyhBDdI.js";import{m as Be}from"./map-ld1ATcb-.js";import"./preload-helper-Dp1pzeXC.js";import"./astryxLabel-DaLY8PRt.js";import"./isString-CSsxsKs7.js";import"./isEmpty-BA7yC1jR.js";import"./usePopover-DJtLOGyK.js";import"./useDevWarning-DBlN0sMX.js";import"./rtlStyles-T4i24HtE.js";import"./InputClearButton-BLgkAxup.js";import"./useResolvedRequired-DnFZrmtv.js";import"./Selector-P7BfDfAB.js";import"./useTypeahead-_ixBt9l1.js";import"./SelectorOption-BeXF72y4.js";import"./Item-Bji7Ozh2.js";import"./InputGroupContext-DfeK6Bnp.js";import"./useIndicator-DyPkwS3x.js";import"./isRenderable-BUV0eL6r.js";import"./Divider-n7T33ZuK.js";import"./Badge-WgvpSHMx.js";import"./CheckboxInput-BeT9CL9w.js";import"./toString-GdLFHJg2.js";import"./isSymbol-BSdE5hqi.js";import"./_baseFlatten-Dl4R8i6f.js";import"./_baseEach-DQs3C6Jj.js";import"./get-B-b0CPDM.js";import"./_baseGet-GSu2VuGG.js";import"./identity-DKeuBCMA.js";import"./_baseIndexOf-Be9UPhX8.js";import"./_baseFindIndex-Cj99RmFE.js";import"./toInteger-DQFh5pLW.js";import"./toFinite-C8mQJeU0.js";import"./_trimmedEndIndex-DuQxD0U0.js";const Ie=({method:e,url:o,body:r=null,client:t})=>{const c=t==null?void 0:t.newSignedRequest(e,o,r,null);return t==null?void 0:t._wrapWithPromise(c)},_e=()=>{const e=we();return({method:o,url:r,body:t=null})=>Ie({method:o,url:r,body:t,client:e})},g=({projectName:e,autoSelectDefault:o,filter:r,showSearch:t,loading:c,...l})=>{const[h,s]=_({value:typeof t=="object"?t==null?void 0:t.searchValue:void 0,onChange:typeof t=="object"?t==null?void 0:t.onSearch:void 0}),[u,j]=_(l),[m,v]=y.useTransition(),[B,I]=y.useState(),f=he.useCallback((n,...d)=>{I(n),v(()=>{j(n,...d)})},[v,j]),{resourceGroups:p}=Fe(e,{filter:r});y.useEffect(()=>{u&&p.length>0&&!Re(p,n=>n.name===u)&&f(void 0)},[p,u,f]);const b=Ce(p,n=>n.name==="default")||p[0],i=b?{label:b.name,value:b.name}:void 0;return y.useEffect(()=>{o&&i&&!u&&f(i.value,i)},[o,i==null?void 0:i.value]),a.jsx(be,{defaultActiveFirstOption:!0,showSearch:t?{searchValue:h,onSearch:s}:void 0,defaultValue:o?i:void 0,loading:c||m,disabled:m,options:Be(p,n=>({value:n.name,label:n.name})),optionRender:n=>{var d;return a.jsx(ve,{keyword:h,children:(d=n.data.value)==null?void 0:d.toString()})},...l,value:m?B:u,onChange:f})};class Ee extends Error{constructor(o){super(o instanceof Error?o.message:"Failed to fetch storage host information."),this.name="StorageHostFetchError",this.originalError=o}}const Fe=(e,o)=>{"use memo";var v,B,I,f,p,b;const r=fe.c(14),t=_e();let c;r[0]!==e?(c=["ResourceGroupSelectQuery",e],r[0]=e,r[1]=c):c=r[1];let l;r[2]!==t||r[3]!==e?(l=async()=>{if(!e)return null;const i=new URLSearchParams;i.set("group",e);const[n,d]=await Promise.allSettled([t({method:"GET",url:`/scaling-groups?${i.toString()}`}),t({method:"GET",url:"/folders/_/hosts"})]);if(d.status==="rejected")throw new Ee(d.reason);if(n.status==="rejected")throw n.reason;return[n.value,d.value]},r[2]=t,r[3]=e,r[4]=l):l=r[4];let h;r[5]!==c||r[6]!==l?(h={queryKey:c,queryFn:l,staleTime:3e5},r[5]=c,r[6]=l,r[7]=h):h=r[7];const{data:s}=Pe(h);let u;if(r[8]!==((v=s==null?void 0:s[0])==null?void 0:v.scaling_groups)||r[9]!==((B=s==null?void 0:s[1])==null?void 0:B.volume_info)||r[10]!==o){const i=xe((I=s==null?void 0:s[1])==null?void 0:I.volume_info,De);u=Ae(((f=s==null?void 0:s[0])==null?void 0:f.scaling_groups)??[],n=>Ge(i,n.name)?!1:o!=null&&o.filter?o.filter(n.name):!0),r[8]=(p=s==null?void 0:s[0])==null?void 0:p.scaling_groups,r[9]=(b=s==null?void 0:s[1])==null?void 0:b.volume_info,r[10]=o,r[11]=u}else u=r[11];const j=u;let m;return r[12]!==j?(m={resourceGroups:j},r[12]=j,r[13]=m):m=r[13],m};function De(e){return(e==null?void 0:e.sftp_scaling_groups)??[]}const de=[{name:"default"},{name:"gpu-cluster"},{name:"cpu-only"},{name:"high-memory"}],Te=Array.from({length:15},(e,o)=>({name:`resource-group-${o+1}`})),ge={allowed:["host1","host2"],default:"host1",volume_info:{vol1:{backend:"xfs",capabilities:["quota","fast-lookup"],usage:{percentage:45.2},sftp_scaling_groups:["sftp-only"]}}},Ne=(e=de,o=ge)=>{const r={newSignedRequest:(t,c,l)=>({url:c}),_wrapWithPromise:t=>t.url.includes("/scaling-groups")?Promise.resolve({scaling_groups:e}):t.url.includes("/folders/_/hosts")?Promise.resolve(o):Promise.resolve({})};return Promise.resolve(r)},We=()=>({}),S=({children:e,scalingGroups:o=de,volumeInfo:r=ge})=>{const t=y.useMemo(()=>Ne(o,r),[o,r]),[c]=y.useState(()=>new ye({defaultOptions:{queries:{retry:!1,gcTime:0,staleTime:0}}}));return a.jsx(Se,{locale:{lang:"en"},clientPromise:t,anonymousClientFactory:We,children:a.jsx(je,{client:c,children:a.jsx(y.Suspense,{fallback:a.jsx("div",{children:"Loading..."}),children:e})})})},Rr={title:"Select/BAIProjectResourceGroupSelect",component:g,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:`
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
        `}}},argTypes:{projectName:{control:{type:"text"},description:"Project name to fetch resource groups for",table:{type:{summary:"string"}}},autoSelectDefault:{control:{type:"boolean"},description:"Auto-select 'default' resource group or first available option",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},filter:{control:!1,description:"Custom filter function to filter resource groups by name",table:{type:{summary:"(name: string) => boolean"}}},placeholder:{control:{type:"text"},description:"Placeholder text",table:{type:{summary:"string"}}},showSearch:{control:{type:"boolean"},description:"Enable search functionality",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},onChange:{action:"changed",description:"Callback when selection changes"}}},P={name:"Basic",parameters:{docs:{description:{story:"Basic usage with 4 sample resource groups (default, gpu-cluster, cpu-only, high-memory). SFTP resource groups are automatically filtered out."}}},args:{projectName:"test-project",placeholder:"Select resource group"},render:e=>a.jsx(S,{children:a.jsx(g,{...e,style:{width:300}})})},w={name:"AutoSelect",parameters:{docs:{description:{story:"Automatically selects 'default' resource group when component mounts. If 'default' doesn't exist, selects the first available option."}}},args:{projectName:"test-project",autoSelectDefault:!0,placeholder:"Select resource group"},render:e=>a.jsx(S,{children:a.jsx(g,{...e,style:{width:300}})})},x={name:"SearchEnabled",parameters:{docs:{description:{story:"Enables search functionality to filter resource groups by name. Matching text is highlighted in options."}}},args:{projectName:"test-project",placeholder:"Search resource groups",showSearch:!0},render:e=>a.jsx(S,{children:a.jsx(g,{...e,style:{width:300}})})},A={name:"EmptyState",parameters:{docs:{description:{story:"Shows the component when no resource groups are returned from the API."}}},args:{projectName:"test-project",placeholder:"No resource groups available"},render:e=>a.jsx(S,{scalingGroups:[],children:a.jsx(g,{...e,style:{width:300}})})},G={name:"AutoSelectFirstOption",parameters:{docs:{description:{story:"When autoSelectDefault is enabled but 'default' resource group doesn't exist, automatically selects the first available option."}}},args:{projectName:"test-project",autoSelectDefault:!0,placeholder:"Select resource group"},render:e=>a.jsx(S,{scalingGroups:[{name:"gpu-cluster"},{name:"cpu-only"}],children:a.jsx(g,{...e,style:{width:300}})})},R={name:"CustomFilter",parameters:{docs:{description:{story:'Uses custom filter function to show only resource groups containing "gpu" in their name.'}}},args:{projectName:"test-project",placeholder:"Select GPU resource group",filter:e=>e.includes("gpu")},render:e=>a.jsx(S,{children:a.jsx(g,{...e,style:{width:300}})})},C={name:"ManyResourceGroups",parameters:{docs:{description:{story:"Demonstrates the component with 15 resource groups, showing scrollable dropdown behavior."}}},args:{projectName:"test-project",placeholder:"Select from 15 resource groups",showSearch:!0},render:e=>a.jsx(S,{scalingGroups:Te,children:a.jsx(g,{...e,style:{width:300}})})};var E,F,D,T,N;P.parameters={...P.parameters,docs:{...(E=P.parameters)==null?void 0:E.docs,source:{originalSource:`{
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
}`,...(D=(F=P.parameters)==null?void 0:F.docs)==null?void 0:D.source},description:{story:"Basic usage showing 4 resource groups with auto-selection disabled.",...(N=(T=P.parameters)==null?void 0:T.docs)==null?void 0:N.description}}};var W,V,M,k,q;w.parameters={...w.parameters,docs:{...(W=w.parameters)==null?void 0:W.docs,source:{originalSource:`{
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
}`,...(M=(V=w.parameters)==null?void 0:V.docs)==null?void 0:M.source},description:{story:"Auto-selects 'default' resource group on mount.",...(q=(k=w.parameters)==null?void 0:k.docs)==null?void 0:q.description}}};var U,O,Q,H,$;x.parameters={...x.parameters,docs:{...(U=x.parameters)==null?void 0:U.docs,source:{originalSource:`{
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
}`,...(Q=(O=x.parameters)==null?void 0:O.docs)==null?void 0:Q.source},description:{story:"Shows search functionality with text highlighting.",...($=(H=x.parameters)==null?void 0:H.docs)==null?void 0:$.description}}};var L,K,z,J,X;A.parameters={...A.parameters,docs:{...(L=A.parameters)==null?void 0:L.docs,source:{originalSource:`{
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
}`,...(z=(K=A.parameters)==null?void 0:K.docs)==null?void 0:z.source},description:{story:"Empty state when no resource groups are available.",...(X=(J=A.parameters)==null?void 0:J.docs)==null?void 0:X.description}}};var Y,Z,ee,re,te;G.parameters={...G.parameters,docs:{...(Y=G.parameters)==null?void 0:Y.docs,source:{originalSource:`{
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
}`,...(ee=(Z=G.parameters)==null?void 0:Z.docs)==null?void 0:ee.source},description:{story:"Auto-select when 'default' doesn't exist - selects first option.",...(te=(re=G.parameters)==null?void 0:re.docs)==null?void 0:te.description}}};var oe,se,ae,ne,ce;R.parameters={...R.parameters,docs:{...(oe=R.parameters)==null?void 0:oe.docs,source:{originalSource:`{
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
}`,...(ae=(se=R.parameters)==null?void 0:se.docs)==null?void 0:ae.source},description:{story:"Using custom filter function to show only GPU resource groups.",...(ce=(ne=R.parameters)==null?void 0:ne.docs)==null?void 0:ce.description}}};var ie,le,ue,pe,me;C.parameters={...C.parameters,docs:{...(ie=C.parameters)==null?void 0:ie.docs,source:{originalSource:`{
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
}`,...(ue=(le=C.parameters)==null?void 0:le.docs)==null?void 0:ue.source},description:{story:"Many resource groups with scrollable dropdown.",...(me=(pe=C.parameters)==null?void 0:pe.docs)==null?void 0:me.description}}};const Cr=["Default","AutoSelectDefault","WithSearch","Empty","AutoSelectWithoutDefault","WithCustomFilter","ManyOptions"];export{w as AutoSelectDefault,G as AutoSelectWithoutDefault,P as Default,A as Empty,C as ManyOptions,R as WithCustomFilter,x as WithSearch,Cr as __namedExportsOrder,Rr as default};
