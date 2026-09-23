import{r as j,R as fe,j as s,c as ye,au as Se,av as je,aw as be}from"./iframe-DUu9c-qK.js";import{B as ve}from"./BAISelect-E9_keVvY.js";import{B as Pe}from"./BAITextHighlighter-c2v97ZZj.js";import{u as F}from"./useControllableValue-G_85oRlk.js";import{u as we}from"./reactQueryAlias-DmKOo_Yu.js";import{u as xe}from"./useBAISignedRequestWithPromise-D6jnRVxC.js";import{f as Ae}from"./flatMap-C-95ZCql.js";import{f as Ge}from"./filter-BM6z5TmQ.js";import{i as Re}from"./includes-Bb2XbtTm.js";import{s as Be}from"./some-QXtfVUnF.js";import{f as Ce}from"./find-BDB5awGx.js";import{m as Ie}from"./map-V7PA-Q7x.js";import"./preload-helper-Dp1pzeXC.js";import"./astryxLabel-CPydZasp.js";import"./isString-3bkrcX5q.js";import"./isEmpty-BvaSHcZR.js";import"./InputClearButton-t3cgaxQN.js";import"./useResolvedRequired-DZPzBEvo.js";import"./useDevWarning-DVbFTO7Q.js";import"./Selector-CCSA4CBh.js";import"./useFocusReturnVisibility-CeCSWc39.js";import"./SelectorOption-G7PphuzD.js";import"./Item-IQtWrv6p.js";import"./isRenderable-BUV0eL6r.js";import"./InputGroupContext-BLepXPja.js";import"./usePopover-RyrlulsF.js";import"./rtlStyles-T4i24HtE.js";import"./useIndicator-BuCsEV3M.js";import"./Divider-DFDk1xfZ.js";import"./Badge-DDI28gLQ.js";import"./CheckboxInput-DdseHh1W.js";import"./toString-DdzRyrMs.js";import"./isSymbol-zNFK6egT.js";import"./useConnectedBAIClient-BzUp1dUn.js";import"./_baseFlatten-C9L5WK5V.js";import"./_baseEach-DVtJ-vrE.js";import"./get-Bel8NDvI.js";import"./_baseGet-CEywuamP.js";import"./identity-DKeuBCMA.js";import"./_baseIndexOf-Be9UPhX8.js";import"./_baseFindIndex-Cj99RmFE.js";import"./toInteger-9qjtGDaa.js";import"./toFinite-CC6zwbxW.js";import"./_trimmedEndIndex-DuQxD0U0.js";const d=({projectName:r,autoSelectDefault:o,filter:e,includeSFTPResourceGroups:c,showSearch:t,loading:l,...g})=>{const[a,m]=F({value:typeof t=="object"?t==null?void 0:t.searchValue:void 0,onChange:typeof t=="object"?t==null?void 0:t.onSearch:void 0}),[u,h]=F(g),[f,y]=j.useTransition(),[C,I]=j.useState(),S=fe.useCallback((n,...E)=>{I(n),y(()=>{h(n,...E)})},[y,h]),{resourceGroups:p}=De(r,{filter:e,includeSFTPResourceGroups:c});j.useEffect(()=>{u&&p.length>0&&!Be(p,n=>n.name===u)&&S(void 0)},[p,u,S]);const v=Ce(p,n=>n.name==="default")||p[0],i=v?{label:v.name,value:v.name}:void 0;return j.useEffect(()=>{o&&i&&!u&&S(i.value,i)},[o,i==null?void 0:i.value]),s.jsx(ve,{defaultActiveFirstOption:!0,showSearch:t?{searchValue:a,onSearch:m}:void 0,defaultValue:o?i:void 0,loading:l||f,disabled:f,options:Ie(p,n=>({value:n.name,label:n.name})),optionRender:n=>{var E;return s.jsx(Pe,{keyword:a,children:(E=n.data.value)==null?void 0:E.toString()})},...g,value:f?C:u,onChange:S})};class Ee extends Error{constructor(o){super(o instanceof Error?o.message:"Failed to fetch storage host information."),this.name="StorageHostFetchError",this.originalError=o}}const Fe=(r,o,e)=>{const c=Ae(o,t=>(t==null?void 0:t.sftp_scaling_groups)??[]);return Ge(r,t=>!(e!=null&&e.includeSFTPResourceGroups)&&Re(c,t.name)?!1:e!=null&&e.filter?e.filter(t.name):!0)},De=(r,o)=>{"use memo";var C,I,S,p;const e=ye.c(16),c=xe();let t;e[0]!==r?(t=["ResourceGroupSelectQuery",r],e[0]=r,e[1]=t):t=e[1];let l;e[2]!==c||e[3]!==r?(l=async()=>{if(!r)return null;const v=new URLSearchParams;v.set("group",r);const[i,n]=await Promise.allSettled([c({method:"GET",url:`/scaling-groups?${v.toString()}`}),c({method:"GET",url:"/folders/_/hosts"})]);if(n.status==="rejected")throw new Ee(n.reason);if(i.status==="rejected")throw i.reason;return[i.value,n.value]},e[2]=c,e[3]=r,e[4]=l):l=e[4];let g;e[5]!==t||e[6]!==l?(g={queryKey:t,queryFn:l,staleTime:3e5},e[5]=t,e[6]=l,e[7]=g):g=e[7];const{data:a}=we(g);let m;e[8]!==((C=a==null?void 0:a[0])==null?void 0:C.scaling_groups)?(m=((I=a==null?void 0:a[0])==null?void 0:I.scaling_groups)??[],e[8]=(S=a==null?void 0:a[0])==null?void 0:S.scaling_groups,e[9]=m):m=e[9];const u=(p=a==null?void 0:a[1])==null?void 0:p.volume_info;let h;e[10]!==o||e[11]!==m||e[12]!==u?(h=Fe(m,u,o),e[10]=o,e[11]=m,e[12]=u,e[13]=h):h=e[13];const f=h;let y;return e[14]!==f?(y={resourceGroups:f},e[14]=f,e[15]=y):y=e[15],y},ge=[{name:"default"},{name:"gpu-cluster"},{name:"cpu-only"},{name:"high-memory"}],Te=Array.from({length:15},(r,o)=>({name:`resource-group-${o+1}`})),he={allowed:["host1","host2"],default:"host1",volume_info:{vol1:{backend:"xfs",capabilities:["quota","fast-lookup"],usage:{percentage:45.2},sftp_scaling_groups:["sftp-only"]}}},_e=(r=ge,o=he)=>{const e={newSignedRequest:(c,t,l)=>({url:t}),_wrapWithPromise:c=>c.url.includes("/scaling-groups")?Promise.resolve({scaling_groups:r}):c.url.includes("/folders/_/hosts")?Promise.resolve(o):Promise.resolve({})};return Promise.resolve(e)},Ne=()=>({}),b=({children:r,scalingGroups:o=ge,volumeInfo:e=he})=>{const c=j.useMemo(()=>_e(o,e),[o,e]),[t]=j.useState(()=>new Se({defaultOptions:{queries:{retry:!1,gcTime:0,staleTime:0}}}));return s.jsx(je,{locale:{lang:"en"},clientPromise:c,anonymousClientFactory:Ne,children:s.jsx(be,{client:t,children:s.jsx(j.Suspense,{fallback:s.jsx("div",{children:"Loading..."}),children:r})})})},Rr={title:"Select/BAIProjectResourceGroupSelect",component:d,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:`
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
        `}}},argTypes:{projectName:{control:{type:"text"},description:"Project name to fetch resource groups for",table:{type:{summary:"string"}}},autoSelectDefault:{control:{type:"boolean"},description:"Auto-select 'default' resource group or first available option",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},filter:{control:!1,description:"Custom filter function to filter resource groups by name",table:{type:{summary:"(name: string) => boolean"}}},placeholder:{control:{type:"text"},description:"Placeholder text",table:{type:{summary:"string"}}},showSearch:{control:{type:"boolean"},description:"Enable search functionality",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},onChange:{action:"changed",description:"Callback when selection changes"}}},P={name:"Basic",parameters:{docs:{description:{story:"Basic usage with 4 sample resource groups (default, gpu-cluster, cpu-only, high-memory). SFTP resource groups are automatically filtered out."}}},args:{projectName:"test-project",placeholder:"Select resource group"},render:r=>s.jsx(b,{children:s.jsx(d,{...r,style:{width:300}})})},w={name:"AutoSelect",parameters:{docs:{description:{story:"Automatically selects 'default' resource group when component mounts. If 'default' doesn't exist, selects the first available option."}}},args:{projectName:"test-project",autoSelectDefault:!0,placeholder:"Select resource group"},render:r=>s.jsx(b,{children:s.jsx(d,{...r,style:{width:300}})})},x={name:"SearchEnabled",parameters:{docs:{description:{story:"Enables search functionality to filter resource groups by name. Matching text is highlighted in options."}}},args:{projectName:"test-project",placeholder:"Search resource groups",showSearch:!0},render:r=>s.jsx(b,{children:s.jsx(d,{...r,style:{width:300}})})},A={name:"EmptyState",parameters:{docs:{description:{story:"Shows the component when no resource groups are returned from the API."}}},args:{projectName:"test-project",placeholder:"No resource groups available"},render:r=>s.jsx(b,{scalingGroups:[],children:s.jsx(d,{...r,style:{width:300}})})},G={name:"AutoSelectFirstOption",parameters:{docs:{description:{story:"When autoSelectDefault is enabled but 'default' resource group doesn't exist, automatically selects the first available option."}}},args:{projectName:"test-project",autoSelectDefault:!0,placeholder:"Select resource group"},render:r=>s.jsx(b,{scalingGroups:[{name:"gpu-cluster"},{name:"cpu-only"}],children:s.jsx(d,{...r,style:{width:300}})})},R={name:"CustomFilter",parameters:{docs:{description:{story:'Uses custom filter function to show only resource groups containing "gpu" in their name.'}}},args:{projectName:"test-project",placeholder:"Select GPU resource group",filter:r=>r.includes("gpu")},render:r=>s.jsx(b,{children:s.jsx(d,{...r,style:{width:300}})})},B={name:"ManyResourceGroups",parameters:{docs:{description:{story:"Demonstrates the component with 15 resource groups, showing scrollable dropdown behavior."}}},args:{projectName:"test-project",placeholder:"Select from 15 resource groups",showSearch:!0},render:r=>s.jsx(b,{scalingGroups:Te,children:s.jsx(d,{...r,style:{width:300}})})};var D,T,_,N,V;P.parameters={...P.parameters,docs:{...(D=P.parameters)==null?void 0:D.docs,source:{originalSource:`{
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
}`,...(_=(T=P.parameters)==null?void 0:T.docs)==null?void 0:_.source},description:{story:"Basic usage showing 4 resource groups with auto-selection disabled.",...(V=(N=P.parameters)==null?void 0:N.docs)==null?void 0:V.description}}};var W,M,k,U,q;w.parameters={...w.parameters,docs:{...(W=w.parameters)==null?void 0:W.docs,source:{originalSource:`{
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
}`,...(k=(M=w.parameters)==null?void 0:M.docs)==null?void 0:k.source},description:{story:"Auto-selects 'default' resource group on mount.",...(q=(U=w.parameters)==null?void 0:U.docs)==null?void 0:q.description}}};var O,Q,H,$,L;x.parameters={...x.parameters,docs:{...(O=x.parameters)==null?void 0:O.docs,source:{originalSource:`{
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
}`,...(ne=(ae=R.parameters)==null?void 0:ae.docs)==null?void 0:ne.source},description:{story:"Using custom filter function to show only GPU resource groups.",...(ie=(ce=R.parameters)==null?void 0:ce.docs)==null?void 0:ie.description}}};var le,ue,pe,me,de;B.parameters={...B.parameters,docs:{...(le=B.parameters)==null?void 0:le.docs,source:{originalSource:`{
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
}`,...(pe=(ue=B.parameters)==null?void 0:ue.docs)==null?void 0:pe.source},description:{story:"Many resource groups with scrollable dropdown.",...(de=(me=B.parameters)==null?void 0:me.docs)==null?void 0:de.description}}};const Br=["Default","AutoSelectDefault","WithSearch","Empty","AutoSelectWithoutDefault","WithCustomFilter","ManyOptions"];export{w as AutoSelectDefault,G as AutoSelectWithoutDefault,P as Default,A as Empty,B as ManyOptions,R as WithCustomFilter,x as WithSearch,Br as __namedExportsOrder,Rr as default};
