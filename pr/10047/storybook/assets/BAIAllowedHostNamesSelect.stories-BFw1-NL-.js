import{j as t,r as h,aQ as X,aR as Y,aS as Z}from"./iframe-DaHA5xq0.js";import{u as ee}from"./index-CteHGBGh.js";import{B as te}from"./BAISelect-eXlWSYpt.js";import{m as oe}from"./map-0DstQiXN.js";import"./preload-helper-Dp1pzeXC.js";import"./useConnectedBAIClient-qth631ua.js";import"./reactQueryAlias-CIJCmEfz.js";import"./useUpdatableState-BZeFVPBV.js";import"./useEventNotStable-C12FbNXb.js";import"./index-D3XUhq0N.js";import"./astryxLabel-B8MgS1Sp.js";import"./isString-D8jL1omK.js";import"./isEmpty-BlyTDLyq.js";import"./index-Bsda5d-i.js";import"./runtime-BhgYCK9T.js";import"./formControl-DaPp14iS.js";import"./FormLayoutContext-Dc9Apzle.js";import"./InputClearButton-CBbQNswB.js";import"./selectorPresentation.stylex-BA248Lhx.js";import"./Section-DaVQDK7k.js";import"./usePopover-35IAmNz9.js";import"./useDevWarning-BZ1MFniz.js";import"./rtlStyles-T4i24HtE.js";import"./useFocusReturnVisibility-Do_RJjjp.js";import"./isRtlElement-B2-7SF8s.js";import"./useHighlightedOptionScroll-B0oeKYYO.js";import"./useAnnounceRenderedText-Cl-nWja5.js";import"./useResolvedRequired-CboWzb0d.js";import"./fieldParts-CvHK_UYT.js";import"./composeEventHandlers-BolWE7qY.js";import"./inputAria-CStWn1wH.js";import"./Badge-CZuIJLi3.js";import"./CheckboxInput-itUHC4JA.js";import"./FieldStatus-COk4P7LW.js";import"./useIsHydrating-B1psHywc.js";import"./indicator.markers.stylex-BKSvwWF4.js";import"./useIndicator-Ctks9EBI.js";import"./Divider-clYXA4EM.js";import"./inputStyles.stylex-Bztz6H8O.js";import"./Field-oudCrHLV.js";import"./index-CQW8EB4P.js";import"./Selector-DIYXktlu.js";import"./useMenuOverflow-a3nWTbbs.js";import"./SelectorOption-DHrjnwUY.js";import"./Item-OGQhfbB5.js";import"./computeTargetAndRel-BGwjeA1c.js";import"./toString-OXu-UFnU.js";import"./isSymbol-4PvIH3M8.js";import"./_baseEach-BW-OMQtk.js";import"./get-BvsiTK_s.js";import"./_baseGet-BkmE84r8.js";import"./identity-DKeuBCMA.js";const r=({...e})=>{const o=ee();return t.jsx(te,{...e,options:oe(o,m=>({value:m,label:m}))})},J=["host1.example.com","host2.example.com","host3.example.com","gpu-cluster.example.com","storage-node1.example.com"],re=Array.from({length:20},(e,o)=>`host${o+1}.example.com`),se=(e=J)=>{const o={vfolder:{list_all_hosts:async()=>({allowed:e})}};return Promise.resolve(o)},ae=()=>({}),s=({children:e,allowed:o=J})=>{const m=h.useMemo(()=>se(o),[o]),[K]=h.useState(()=>new X({defaultOptions:{queries:{retry:!1,gcTime:0,staleTime:0}}}));return t.jsx(Y,{locale:{lang:"en"},clientPromise:m,anonymousClientFactory:ae,children:t.jsx(Z,{client:K,children:t.jsx(h.Suspense,{fallback:t.jsx("div",{children:"Loading..."}),children:e})})})},st={title:"Select/BAIAllowedHostNamesSelect",component:r,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:`
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
        `}}},argTypes:{placeholder:{control:{type:"text"},description:"Placeholder text when no value is selected",table:{type:{summary:"string"}}},disabled:{control:{type:"boolean"},description:"Whether the select is disabled",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},allowClear:{control:{type:"boolean"},description:"Show clear button",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},mode:{control:{type:"select"},options:[void 0,"multiple","tags"],description:"Set mode of Select",table:{type:{summary:"'multiple' | 'tags'"}}},onChange:{action:"changed",description:"Callback when selection changes"}}},a={name:"Basic",parameters:{docs:{description:{story:"Basic usage showing a select with 5 allowed host names. The component automatically fetches and displays available hosts."}}},args:{placeholder:"Select a host"},render:e=>t.jsx(s,{children:t.jsx(r,{...e,style:{width:300}})})},n={name:"ClearButton",parameters:{docs:{description:{story:"Select with allowClear enabled, allowing users to clear their selection."}}},args:{placeholder:"Select a host",allowClear:!0},render:e=>t.jsx(s,{children:t.jsx(r,{...e,style:{width:300}})})},l={name:"DisabledState",parameters:{docs:{description:{story:"Shows the component in a disabled state where users cannot interact with it."}}},args:{placeholder:"Select a host",disabled:!0},render:e=>t.jsx(s,{children:t.jsx(r,{...e,style:{width:300}})})},i={name:"MultipleMode",parameters:{docs:{description:{story:"Allows users to select multiple hosts at once. Selected hosts appear as tags."}}},args:{placeholder:"Select hosts",mode:"multiple",allowClear:!0},render:e=>t.jsx(s,{children:t.jsx(r,{...e,style:{width:400}})})},c={name:"EmptyState",parameters:{docs:{description:{story:"Shows the component when no allowed host names are returned from the API."}}},args:{placeholder:"No hosts available"},render:e=>t.jsx(s,{allowed:[],children:t.jsx(r,{...e,style:{width:300}})})},d={name:"ManyOptions",parameters:{docs:{description:{story:"Demonstrates the component with a large number of host options, showing scrollable dropdown behavior."}}},args:{placeholder:"Select from 20 hosts",showSearch:!0,allowClear:!0},render:e=>t.jsx(s,{allowed:re,children:t.jsx(r,{...e,style:{width:300}})})},p={name:"SearchEnabled",parameters:{docs:{description:{story:"Enables search functionality to filter hosts by name. Useful when there are many options."}}},args:{placeholder:"Search and select a host",showSearch:!0,allowClear:!0},render:e=>t.jsx(s,{children:t.jsx(r,{...e,style:{width:300}})})};var u,y,w,S,g;a.parameters={...a.parameters,docs:{...(u=a.parameters)==null?void 0:u.docs,source:{originalSource:`{
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
}`,...(w=(y=a.parameters)==null?void 0:y.docs)==null?void 0:w.source},description:{story:"Basic usage of the component with default props.",...(g=(S=a.parameters)==null?void 0:S.docs)==null?void 0:g.description}}};var b,f,v,x,A;n.parameters={...n.parameters,docs:{...(b=n.parameters)==null?void 0:b.docs,source:{originalSource:`{
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
}`,...(v=(f=n.parameters)==null?void 0:f.docs)==null?void 0:v.source},description:{story:"Select with clear button enabled.",...(A=(x=n.parameters)==null?void 0:x.docs)==null?void 0:A.description}}};var C,P,B,j,H;l.parameters={...l.parameters,docs:{...(C=l.parameters)==null?void 0:C.docs,source:{originalSource:`{
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
}`,...(B=(P=l.parameters)==null?void 0:P.docs)==null?void 0:B.source},description:{story:"Disabled state of the select.",...(H=(j=l.parameters)==null?void 0:j.docs)==null?void 0:H.description}}};var N,I,M,D,E;i.parameters={...i.parameters,docs:{...(N=i.parameters)==null?void 0:N.docs,source:{originalSource:`{
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
}`,...(M=(I=i.parameters)==null?void 0:I.docs)==null?void 0:M.source},description:{story:"Multiple selection mode.",...(E=(D=i.parameters)==null?void 0:D.docs)==null?void 0:E.description}}};var k,T,W,Q,_;c.parameters={...c.parameters,docs:{...(k=c.parameters)==null?void 0:k.docs,source:{originalSource:`{
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
}`,...(W=(T=c.parameters)==null?void 0:T.docs)==null?void 0:W.source},description:{story:"Empty state when no hosts are available.",...(_=(Q=c.parameters)==null?void 0:Q.docs)==null?void 0:_.description}}};var O,F,U,z,R;d.parameters={...d.parameters,docs:{...(O=d.parameters)==null?void 0:O.docs,source:{originalSource:`{
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
}`,...(U=(F=d.parameters)==null?void 0:F.docs)==null?void 0:U.source},description:{story:"Select with many host options.",...(R=(z=d.parameters)==null?void 0:z.docs)==null?void 0:R.description}}};var V,q,L,$,G;p.parameters={...p.parameters,docs:{...(V=p.parameters)==null?void 0:V.docs,source:{originalSource:`{
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
}`,...(L=(q=p.parameters)==null?void 0:q.docs)==null?void 0:L.source},description:{story:"Select with search functionality.",...(G=($=p.parameters)==null?void 0:$.docs)==null?void 0:G.description}}};const at=["Default","WithClearButton","Disabled","MultipleSelection","Empty","ManyHosts","WithSearch"];export{a as Default,l as Disabled,c as Empty,d as ManyHosts,i as MultipleSelection,n as WithClearButton,p as WithSearch,at as __namedExportsOrder,st as default};
