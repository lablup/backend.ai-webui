import{r as j,R as fe,j as a,c as ye,au as Se,av as je,aw as be}from"./iframe-DWnFR7w-.js";import{B as Pe}from"./BAISelect-CbOevn53.js";import{B as ve}from"./BAITextHighlighter-D_i9oSUR.js";import{u as F}from"./useControllableValue-BAKHL5JR.js";import{u as we}from"./reactQueryAlias-Dzo3yvum.js";import{u as xe}from"./useConnectedBAIClient-ClAQOigN.js";import{f as Ae}from"./flatMap-DRnnLMaQ.js";import{f as Ge}from"./filter-BAi4n6Cd.js";import{i as Re}from"./includes-Cg_8dm1q.js";import{s as Ce}from"./some-DUWF5ncV.js";import{f as Be}from"./find-Hln5apX4.js";import{m as Ie}from"./map-DG5XnqAU.js";import"./preload-helper-Dp1pzeXC.js";import"./astryxLabel-CiCM50bE.js";import"./isString-CE0Q4vds.js";import"./isEmpty-BVmJkzMx.js";import"./InputClearButton-diDRqUDW.js";import"./useResolvedRequired-C0i88HgR.js";import"./useDevWarning-Dc8DnP69.js";import"./Selector-P9aCeJOo.js";import"./useFocusReturnVisibility-DxE4bfSN.js";import"./SelectorOption-CX3GIm_A.js";import"./Item-S7zAF1pY.js";import"./isRenderable-BUV0eL6r.js";import"./InputGroupContext-B-vv9i4i.js";import"./usePopover-DiDnrg7q.js";import"./rtlStyles-T4i24HtE.js";import"./useIndicator-B9KVKGyg.js";import"./Divider-BIMHp8yB.js";import"./Badge-BMz1eZ4p.js";import"./CheckboxInput-Cn2ToKVo.js";import"./toString-B3IByhfu.js";import"./isSymbol-BN5bm8d2.js";import"./_baseFlatten-CQgt_dGP.js";import"./_baseEach-DBep-9hi.js";import"./get-BLc4NFdN.js";import"./_baseGet-Da6EP1TP.js";import"./identity-DKeuBCMA.js";import"./_baseIndexOf-Be9UPhX8.js";import"./_baseFindIndex-Cj99RmFE.js";import"./toInteger-Bfmrfv6a.js";import"./toFinite-DimTith6.js";import"./_trimmedEndIndex-DuQxD0U0.js";const Ee=({method:r,url:o,body:e=null,client:s})=>{const t=s==null?void 0:s.newSignedRequest(r,o,e,null);return s==null?void 0:s._wrapWithPromise(t)},Fe=()=>{const r=xe();return({method:o,url:e,body:s=null})=>Ee({method:o,url:e,body:s,client:r})},d=({projectName:r,autoSelectDefault:o,filter:e,includeSFTPResourceGroups:s,showSearch:t,loading:l,...g})=>{const[n,m]=F({value:typeof t=="object"?t==null?void 0:t.searchValue:void 0,onChange:typeof t=="object"?t==null?void 0:t.onSearch:void 0}),[u,h]=F(g),[f,y]=j.useTransition(),[B,I]=j.useState(),S=fe.useCallback((c,...E)=>{I(c),y(()=>{h(c,...E)})},[y,h]),{resourceGroups:p}=Te(r,{filter:e,includeSFTPResourceGroups:s});j.useEffect(()=>{u&&p.length>0&&!Ce(p,c=>c.name===u)&&S(void 0)},[p,u,S]);const P=Be(p,c=>c.name==="default")||p[0],i=P?{label:P.name,value:P.name}:void 0;return j.useEffect(()=>{o&&i&&!u&&S(i.value,i)},[o,i==null?void 0:i.value]),a.jsx(Pe,{defaultActiveFirstOption:!0,showSearch:t?{searchValue:n,onSearch:m}:void 0,defaultValue:o?i:void 0,loading:l||f,disabled:f,options:Ie(p,c=>({value:c.name,label:c.name})),optionRender:c=>{var E;return a.jsx(ve,{keyword:n,children:(E=c.data.value)==null?void 0:E.toString()})},...g,value:f?B:u,onChange:S})};class _e extends Error{constructor(o){super(o instanceof Error?o.message:"Failed to fetch storage host information."),this.name="StorageHostFetchError",this.originalError=o}}const De=(r,o,e)=>{const s=Ae(o,t=>(t==null?void 0:t.sftp_scaling_groups)??[]);return Ge(r,t=>!(e!=null&&e.includeSFTPResourceGroups)&&Re(s,t.name)?!1:e!=null&&e.filter?e.filter(t.name):!0)},Te=(r,o)=>{"use memo";var B,I,S,p;const e=ye.c(16),s=Fe();let t;e[0]!==r?(t=["ResourceGroupSelectQuery",r],e[0]=r,e[1]=t):t=e[1];let l;e[2]!==s||e[3]!==r?(l=async()=>{if(!r)return null;const P=new URLSearchParams;P.set("group",r);const[i,c]=await Promise.allSettled([s({method:"GET",url:`/scaling-groups?${P.toString()}`}),s({method:"GET",url:"/folders/_/hosts"})]);if(c.status==="rejected")throw new _e(c.reason);if(i.status==="rejected")throw i.reason;return[i.value,c.value]},e[2]=s,e[3]=r,e[4]=l):l=e[4];let g;e[5]!==t||e[6]!==l?(g={queryKey:t,queryFn:l,staleTime:3e5},e[5]=t,e[6]=l,e[7]=g):g=e[7];const{data:n}=we(g);let m;e[8]!==((B=n==null?void 0:n[0])==null?void 0:B.scaling_groups)?(m=((I=n==null?void 0:n[0])==null?void 0:I.scaling_groups)??[],e[8]=(S=n==null?void 0:n[0])==null?void 0:S.scaling_groups,e[9]=m):m=e[9];const u=(p=n==null?void 0:n[1])==null?void 0:p.volume_info;let h;e[10]!==o||e[11]!==m||e[12]!==u?(h=De(m,u,o),e[10]=o,e[11]=m,e[12]=u,e[13]=h):h=e[13];const f=h;let y;return e[14]!==f?(y={resourceGroups:f},e[14]=f,e[15]=y):y=e[15],y},ge=[{name:"default"},{name:"gpu-cluster"},{name:"cpu-only"},{name:"high-memory"}],Ne=Array.from({length:15},(r,o)=>({name:`resource-group-${o+1}`})),he={allowed:["host1","host2"],default:"host1",volume_info:{vol1:{backend:"xfs",capabilities:["quota","fast-lookup"],usage:{percentage:45.2},sftp_scaling_groups:["sftp-only"]}}},We=(r=ge,o=he)=>{const e={newSignedRequest:(s,t,l)=>({url:t}),_wrapWithPromise:s=>s.url.includes("/scaling-groups")?Promise.resolve({scaling_groups:r}):s.url.includes("/folders/_/hosts")?Promise.resolve(o):Promise.resolve({})};return Promise.resolve(e)},Ve=()=>({}),b=({children:r,scalingGroups:o=ge,volumeInfo:e=he})=>{const s=j.useMemo(()=>We(o,e),[o,e]),[t]=j.useState(()=>new Se({defaultOptions:{queries:{retry:!1,gcTime:0,staleTime:0}}}));return a.jsx(je,{locale:{lang:"en"},clientPromise:s,anonymousClientFactory:Ve,children:a.jsx(be,{client:t,children:a.jsx(j.Suspense,{fallback:a.jsx("div",{children:"Loading..."}),children:r})})})},Cr={title:"Select/BAIProjectResourceGroupSelect",component:d,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:`
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
        `}}},argTypes:{projectName:{control:{type:"text"},description:"Project name to fetch resource groups for",table:{type:{summary:"string"}}},autoSelectDefault:{control:{type:"boolean"},description:"Auto-select 'default' resource group or first available option",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},filter:{control:!1,description:"Custom filter function to filter resource groups by name",table:{type:{summary:"(name: string) => boolean"}}},placeholder:{control:{type:"text"},description:"Placeholder text",table:{type:{summary:"string"}}},showSearch:{control:{type:"boolean"},description:"Enable search functionality",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},onChange:{action:"changed",description:"Callback when selection changes"}}},v={name:"Basic",parameters:{docs:{description:{story:"Basic usage with 4 sample resource groups (default, gpu-cluster, cpu-only, high-memory). SFTP resource groups are automatically filtered out."}}},args:{projectName:"test-project",placeholder:"Select resource group"},render:r=>a.jsx(b,{children:a.jsx(d,{...r,style:{width:300}})})},w={name:"AutoSelect",parameters:{docs:{description:{story:"Automatically selects 'default' resource group when component mounts. If 'default' doesn't exist, selects the first available option."}}},args:{projectName:"test-project",autoSelectDefault:!0,placeholder:"Select resource group"},render:r=>a.jsx(b,{children:a.jsx(d,{...r,style:{width:300}})})},x={name:"SearchEnabled",parameters:{docs:{description:{story:"Enables search functionality to filter resource groups by name. Matching text is highlighted in options."}}},args:{projectName:"test-project",placeholder:"Search resource groups",showSearch:!0},render:r=>a.jsx(b,{children:a.jsx(d,{...r,style:{width:300}})})},A={name:"EmptyState",parameters:{docs:{description:{story:"Shows the component when no resource groups are returned from the API."}}},args:{projectName:"test-project",placeholder:"No resource groups available"},render:r=>a.jsx(b,{scalingGroups:[],children:a.jsx(d,{...r,style:{width:300}})})},G={name:"AutoSelectFirstOption",parameters:{docs:{description:{story:"When autoSelectDefault is enabled but 'default' resource group doesn't exist, automatically selects the first available option."}}},args:{projectName:"test-project",autoSelectDefault:!0,placeholder:"Select resource group"},render:r=>a.jsx(b,{scalingGroups:[{name:"gpu-cluster"},{name:"cpu-only"}],children:a.jsx(d,{...r,style:{width:300}})})},R={name:"CustomFilter",parameters:{docs:{description:{story:'Uses custom filter function to show only resource groups containing "gpu" in their name.'}}},args:{projectName:"test-project",placeholder:"Select GPU resource group",filter:r=>r.includes("gpu")},render:r=>a.jsx(b,{children:a.jsx(d,{...r,style:{width:300}})})},C={name:"ManyResourceGroups",parameters:{docs:{description:{story:"Demonstrates the component with 15 resource groups, showing scrollable dropdown behavior."}}},args:{projectName:"test-project",placeholder:"Select from 15 resource groups",showSearch:!0},render:r=>a.jsx(b,{scalingGroups:Ne,children:a.jsx(d,{...r,style:{width:300}})})};var _,D,T,N,W;v.parameters={...v.parameters,docs:{...(_=v.parameters)==null?void 0:_.docs,source:{originalSource:`{
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
}`,...(T=(D=v.parameters)==null?void 0:D.docs)==null?void 0:T.source},description:{story:"Basic usage showing 4 resource groups with auto-selection disabled.",...(W=(N=v.parameters)==null?void 0:N.docs)==null?void 0:W.description}}};var V,M,k,q,U;w.parameters={...w.parameters,docs:{...(V=w.parameters)==null?void 0:V.docs,source:{originalSource:`{
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
}`,...(k=(M=w.parameters)==null?void 0:M.docs)==null?void 0:k.source},description:{story:"Auto-selects 'default' resource group on mount.",...(U=(q=w.parameters)==null?void 0:q.docs)==null?void 0:U.description}}};var O,Q,H,$,L;x.parameters={...x.parameters,docs:{...(O=x.parameters)==null?void 0:O.docs,source:{originalSource:`{
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
}`,...(H=(Q=x.parameters)==null?void 0:Q.docs)==null?void 0:H.source},description:{story:"Shows search functionality with text highlighting.",...(L=($=x.parameters)==null?void 0:$.docs)==null?void 0:L.description}}};var K,z,J,X,Y;A.parameters={...A.parameters,docs:{...(K=A.parameters)==null?void 0:K.docs,source:{originalSource:`{
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
}`,...(J=(z=A.parameters)==null?void 0:z.docs)==null?void 0:J.source},description:{story:"Empty state when no resource groups are available.",...(Y=(X=A.parameters)==null?void 0:X.docs)==null?void 0:Y.description}}};var Z,ee,re,te,oe;G.parameters={...G.parameters,docs:{...(Z=G.parameters)==null?void 0:Z.docs,source:{originalSource:`{
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
}`,...(re=(ee=G.parameters)==null?void 0:ee.docs)==null?void 0:re.source},description:{story:"Auto-select when 'default' doesn't exist - selects first option.",...(oe=(te=G.parameters)==null?void 0:te.docs)==null?void 0:oe.description}}};var se,ae,ne,ce,ie;R.parameters={...R.parameters,docs:{...(se=R.parameters)==null?void 0:se.docs,source:{originalSource:`{
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
}`,...(ne=(ae=R.parameters)==null?void 0:ae.docs)==null?void 0:ne.source},description:{story:"Using custom filter function to show only GPU resource groups.",...(ie=(ce=R.parameters)==null?void 0:ce.docs)==null?void 0:ie.description}}};var le,ue,pe,me,de;C.parameters={...C.parameters,docs:{...(le=C.parameters)==null?void 0:le.docs,source:{originalSource:`{
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
}`,...(pe=(ue=C.parameters)==null?void 0:ue.docs)==null?void 0:pe.source},description:{story:"Many resource groups with scrollable dropdown.",...(de=(me=C.parameters)==null?void 0:me.docs)==null?void 0:de.description}}};const Br=["Default","AutoSelectDefault","WithSearch","Empty","AutoSelectWithoutDefault","WithCustomFilter","ManyOptions"];export{w as AutoSelectDefault,G as AutoSelectWithoutDefault,v as Default,A as Empty,C as ManyOptions,R as WithCustomFilter,x as WithSearch,Br as __namedExportsOrder,Cr as default};
