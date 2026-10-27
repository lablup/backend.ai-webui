import{j as t,r as h,aR as X,aS as Y,aT as Z}from"./iframe-DeQ4tvgM.js";import{u as ee}from"./index-De9Up8Wl.js";import{B as te}from"./BAISelect-hvgjZj_q.js";import{m as oe}from"./map-DZhXxEYB.js";import"./preload-helper-Dp1pzeXC.js";import"./useConnectedBAIClient-HXxQH2XI.js";import"./reactQueryAlias-DvG33dQx.js";import"./useUpdatableState-Bwr78jde.js";import"./useEventNotStable-TSpxNxwh.js";import"./index-D4up6eph.js";import"./astryxLabel-Da6i1_sG.js";import"./isString-CF5GUgvZ.js";import"./isEmpty-CVEU1AhJ.js";import"./index-BfdylGjK.js";import"./runtime-BhgYCK9T.js";import"./formControl-E1QYAOUt.js";import"./FormLayoutContext-CPP7ojHx.js";import"./optionDisabledReason2-BlANlF_Q.js";import"./IconWithTooltip2-b8BDLei2.js";import"./circle-alert-Z-iQqSKX.js";import"./InputClearButton-CuPPUZC5.js";import"./selectorPresentation.stylex-B8pLiyN3.js";import"./Section-BulV5og_.js";import"./usePopover-DUqJt6Tl.js";import"./useDevWarning-DuxE5E4c.js";import"./rtlStyles-T4i24HtE.js";import"./useFocusReturnVisibility-CPH8Get9.js";import"./isRtlElement-B2-7SF8s.js";import"./useHighlightedOptionScroll-CHYR2IGD.js";import"./useAnnounceRenderedText-jjztngCg.js";import"./useResolvedRequired-BAHc8Cm5.js";import"./fieldParts-WipejdDk.js";import"./composeEventHandlers-BolWE7qY.js";import"./inputAria-CStWn1wH.js";import"./Badge-C4oyTCxt.js";import"./CheckboxInput-Dj0le1St.js";import"./FieldStatus-BRbJav_I.js";import"./useIsHydrating-CQqf-YMq.js";import"./indicator.markers.stylex-DmJ0aHkJ.js";import"./useIndicator-B8YA7UZm.js";import"./Divider-B-rnEVB2.js";import"./inputStyles.stylex-Bztz6H8O.js";import"./Field-Cw6LAG-_.js";import"./index-U3J9u6RM.js";import"./Selector-Crfbzrxt.js";import"./useMenuOverflow-Dd-ej6OU.js";import"./SelectorOption-zfCDgGhv.js";import"./Item-CqRC6PAd.js";import"./computeTargetAndRel-BGwjeA1c.js";import"./toString-BfH-RWA9.js";import"./isSymbol-B2QZtdIa.js";import"./_baseEach-DCHM6djx.js";import"./get-HOwNZ-WB.js";import"./_baseGet-DbzUYmgm.js";import"./identity-DKeuBCMA.js";const r=({...e})=>{const o=ee();return t.jsx(te,{...e,options:oe(o,m=>({value:m,label:m}))})},J=["host1.example.com","host2.example.com","host3.example.com","gpu-cluster.example.com","storage-node1.example.com"],re=Array.from({length:20},(e,o)=>`host${o+1}.example.com`),se=(e=J)=>{const o={vfolder:{list_all_hosts:async()=>({allowed:e})}};return Promise.resolve(o)},ae=()=>({}),s=({children:e,allowed:o=J})=>{const m=h.useMemo(()=>se(o),[o]),[K]=h.useState(()=>new X({defaultOptions:{queries:{retry:!1,gcTime:0,staleTime:0}}}));return t.jsx(Y,{locale:{lang:"en"},clientPromise:m,anonymousClientFactory:ae,children:t.jsx(Z,{client:K,children:t.jsx(h.Suspense,{fallback:t.jsx("div",{children:"Loading..."}),children:e})})})},lt={title:"Select/BAIAllowedHostNamesSelect",component:r,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:`
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
}`,...(M=(I=i.parameters)==null?void 0:I.docs)==null?void 0:M.source},description:{story:"Multiple selection mode.",...(E=(D=i.parameters)==null?void 0:D.docs)==null?void 0:E.description}}};var k,T,W,_,O;c.parameters={...c.parameters,docs:{...(k=c.parameters)==null?void 0:k.docs,source:{originalSource:`{
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
}`,...(W=(T=c.parameters)==null?void 0:T.docs)==null?void 0:W.source},description:{story:"Empty state when no hosts are available.",...(O=(_=c.parameters)==null?void 0:_.docs)==null?void 0:O.description}}};var Q,F,U,z,R;d.parameters={...d.parameters,docs:{...(Q=d.parameters)==null?void 0:Q.docs,source:{originalSource:`{
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
}`,...(L=(q=p.parameters)==null?void 0:q.docs)==null?void 0:L.source},description:{story:"Select with search functionality.",...(G=($=p.parameters)==null?void 0:$.docs)==null?void 0:G.description}}};const it=["Default","WithClearButton","Disabled","MultipleSelection","Empty","ManyHosts","WithSearch"];export{a as Default,l as Disabled,c as Empty,d as ManyHosts,i as MultipleSelection,n as WithClearButton,p as WithSearch,it as __namedExportsOrder,lt as default};
