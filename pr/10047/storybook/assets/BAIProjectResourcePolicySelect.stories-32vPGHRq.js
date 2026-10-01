import{j as r,a9 as G}from"./iframe-DNUp1OGL.js";import{R as s}from"./RelayResolver-CHZVmMQx.js";import{B as o}from"./BAIProjectResourcePolicySelect-BfPFzKg2.js";import"./preload-helper-Dp1pzeXC.js";import"./index-CMuZlE-V.js";import"./index-CzdpEYU6.js";import"./BAISelect-DND0m0x9.js";import"./astryxLabel-pugXQdyg.js";import"./isString-CdYsctcC.js";import"./isEmpty-Bd935vgA.js";import"./InputClearButton-CIrxXP9j.js";import"./useResolvedRequired-DlL-7xLj.js";import"./useDevWarning-B68MTTKs.js";import"./Selector-9oiwcUAn.js";import"./useFocusReturnVisibility-BTu3wnZ2.js";import"./SelectorOption-CUen2BPU.js";import"./Item-DBAtD3Vx.js";import"./isRenderable-BUV0eL6r.js";import"./InputGroupContext-CyYbuUBT.js";import"./usePopover-De5J4OPw.js";import"./rtlStyles-T4i24HtE.js";import"./useIndicator-BU8lBbc_.js";import"./Divider-D_OQLkR7.js";import"./Badge-1mm5XLq0.js";import"./CheckboxInput-BLTDIj9J.js";import"./useConnectedBAIClient-vuPSY15S.js";import"./map-Cy_dhmK6.js";import"./toString-ug7MfOjK.js";import"./isSymbol-Cv7zfbAN.js";import"./_baseEach-BGlHLwZn.js";import"./get-DnFRqRGZ.js";import"./_baseGet-yC_j6bxv.js";import"./identity-DKeuBCMA.js";import"./sortBy-DCMk3cx0.js";import"./_baseFlatten-BBnf1EU3.js";import"./_overRest-e_Knv32h.js";import"./_defineProperty-FMCZndxk.js";import"./_isIterateeCall-CUHzwJRK.js";const L=Promise.resolve({supports:()=>!1}),U=()=>({}),p=[{id:"policy-1",name:"default"},{id:"policy-2",name:"gpu-limited"},{id:"policy-3",name:"cpu-only"},{id:"policy-4",name:"high-memory"},{id:"policy-5",name:"storage-optimized"}],z=Array.from({length:15},(e,m)=>({id:`policy-${m+1}`,name:`resource-policy-${m+1}`})),Qe={title:"Fragments/BAIProjectResourcePolicySelect",component:o,tags:["autodocs"],decorators:[e=>r.jsx(G,{locale:{lang:"en"},clientPromise:L,anonymousClientFactory:U,children:r.jsx(e,{})})],parameters:{layout:"centered",docs:{description:{component:`
**BAIProjectResourcePolicySelect** extends [BAISelect](/?path=/docs/components-input-baiselect--docs) to fetch and display project resource policies.

## Features
- Fetches project resource policies from GraphQL query \`BAIProjectResourcePolicySelectQuery\`
- Reads \`adminProjectResourcePoliciesV2\` on managers with \`resource-policy-v2\` (26.4.2) and the legacy \`project_resource_policies\` list below that
- Policies are automatically sorted alphabetically by name
- Built-in search functionality enabled by default
- Uses policy \`name\` as both label and value

## GraphQL Query
\`\`\`graphql
query BAIProjectResourcePolicySelectQuery($limit: Int!, $supportsResourcePolicyV2: Boolean!) {
  adminProjectResourcePoliciesV2(limit: $limit, orderBy: [{ field: NAME, direction: ASC }])
    @since(version: "26.4.2") @include(if: $supportsResourcePolicyV2) {
    edges { node { id name } }
  }
  project_resource_policies
    @deprecatedSince(version: "26.4.2") @skip(if: $supportsResourcePolicyV2) {
    id
    name
  }
}
\`\`\`

## Usage
\`\`\`tsx
<BAIProjectResourcePolicySelect
  placeholder="Select a resource policy"
  onChange={(value) => console.log(value)}
/>
\`\`\`

For all other props, refer to [BAISelect](/?path=/docs/components-input-baiselect--docs).
        `}}},argTypes:{placeholder:{control:{type:"text"},description:"Placeholder text when no value is selected",table:{type:{summary:"string"}}},disabled:{control:{type:"boolean"},description:"Whether the select is disabled",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},allowClear:{control:{type:"boolean"},description:"Show clear button",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},onChange:{action:"changed",description:"Callback when selection changes"}}},t={name:"Basic",parameters:{docs:{description:{story:"Basic usage showing 5 project resource policies, automatically sorted alphabetically. Search functionality is enabled by default."}}},args:{},render:e=>r.jsx(s,{mockResolvers:{Query:()=>({project_resource_policies:p})},children:r.jsx(o,{...e,style:{width:"300px"}})})},c={name:"EmptyState",parameters:{docs:{description:{story:"Shows the component when no project resource policies are configured."}}},args:{},render:e=>r.jsx(s,{mockResolvers:{Query:()=>({project_resource_policies:[]})},children:r.jsx(o,{...e,style:{width:"300px"}})})},a={name:"DisabledState",parameters:{docs:{description:{story:"Shows the component in a disabled state where users cannot interact with it."}}},args:{disabled:!0},render:e=>r.jsx(s,{mockResolvers:{Query:()=>({project_resource_policies:p})},children:r.jsx(o,{...e,style:{width:"300px"}})})},i={name:"ClearButton",parameters:{docs:{description:{story:"Select with allowClear enabled, allowing users to clear their selection."}}},args:{allowClear:!0},render:e=>r.jsx(s,{mockResolvers:{Query:()=>({project_resource_policies:p})},children:r.jsx(o,{...e,style:{width:"300px"}})})},n={name:"CustomPlaceholder",parameters:{docs:{description:{story:"Demonstrates using a custom placeholder text."}}},args:{placeholder:"Choose a resource policy..."},render:e=>r.jsx(s,{mockResolvers:{Query:()=>({project_resource_policies:p})},children:r.jsx(o,{...e,style:{width:"300px"}})})},l={name:"ManyOptions",parameters:{docs:{description:{story:"Demonstrates the component with 15 resource policies, showing scrollable dropdown with search functionality."}}},args:{allowClear:!0},render:e=>r.jsx(s,{mockResolvers:{Query:()=>({project_resource_policies:z})},children:r.jsx(o,{...e,style:{width:"300px"}})})};var d,u,y,h,g;t.parameters={...t.parameters,docs:{...(d=t.parameters)==null?void 0:d.docs,source:{originalSource:`{
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'Basic usage showing 5 project resource policies, automatically sorted alphabetically. Search functionality is enabled by default.'
      }
    }
  },
  args: {},
  render: args => <RelayResolver mockResolvers={{
    Query: () => ({
      project_resource_policies: samplePolicies
    })
  }}>
      <BAIProjectResourcePolicySelect {...args} style={{
      width: '300px'
    }} />
    </RelayResolver>
}`,...(y=(u=t.parameters)==null?void 0:u.docs)==null?void 0:y.source},description:{story:"Basic usage with 5 sample resource policies.",...(g=(h=t.parameters)==null?void 0:h.docs)==null?void 0:g.description}}};var R,w,j,P,b;c.parameters={...c.parameters,docs:{...(R=c.parameters)==null?void 0:R.docs,source:{originalSource:`{
  name: 'EmptyState',
  parameters: {
    docs: {
      description: {
        story: 'Shows the component when no project resource policies are configured.'
      }
    }
  },
  args: {},
  render: args => <RelayResolver mockResolvers={{
    Query: () => ({
      project_resource_policies: []
    })
  }}>
      <BAIProjectResourcePolicySelect {...args} style={{
      width: '300px'
    }} />
    </RelayResolver>
}`,...(j=(w=c.parameters)==null?void 0:w.docs)==null?void 0:j.source},description:{story:"Empty state when no resource policies are available.",...(b=(P=c.parameters)==null?void 0:P.docs)==null?void 0:b.description}}};var S,x,v,f,_;a.parameters={...a.parameters,docs:{...(S=a.parameters)==null?void 0:S.docs,source:{originalSource:`{
  name: 'DisabledState',
  parameters: {
    docs: {
      description: {
        story: 'Shows the component in a disabled state where users cannot interact with it.'
      }
    }
  },
  args: {
    disabled: true
  },
  render: args => <RelayResolver mockResolvers={{
    Query: () => ({
      project_resource_policies: samplePolicies
    })
  }}>
      <BAIProjectResourcePolicySelect {...args} style={{
      width: '300px'
    }} />
    </RelayResolver>
}`,...(v=(x=a.parameters)==null?void 0:x.docs)==null?void 0:v.source},description:{story:"Disabled state of the select.",...(_=(f=a.parameters)==null?void 0:f.docs)==null?void 0:_.description}}};var B,C,A,Q,k;i.parameters={...i.parameters,docs:{...(B=i.parameters)==null?void 0:B.docs,source:{originalSource:`{
  name: 'ClearButton',
  parameters: {
    docs: {
      description: {
        story: 'Select with allowClear enabled, allowing users to clear their selection.'
      }
    }
  },
  args: {
    allowClear: true
  },
  render: args => <RelayResolver mockResolvers={{
    Query: () => ({
      project_resource_policies: samplePolicies
    })
  }}>
      <BAIProjectResourcePolicySelect {...args} style={{
      width: '300px'
    }} />
    </RelayResolver>
}`,...(A=(C=i.parameters)==null?void 0:C.docs)==null?void 0:A.source},description:{story:"Select with clear button enabled.",...(k=(Q=i.parameters)==null?void 0:Q.docs)==null?void 0:k.description}}};var I,D,E,M,V;n.parameters={...n.parameters,docs:{...(I=n.parameters)==null?void 0:I.docs,source:{originalSource:`{
  name: 'CustomPlaceholder',
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates using a custom placeholder text.'
      }
    }
  },
  args: {
    placeholder: 'Choose a resource policy...'
  },
  render: args => <RelayResolver mockResolvers={{
    Query: () => ({
      project_resource_policies: samplePolicies
    })
  }}>
      <BAIProjectResourcePolicySelect {...args} style={{
      width: '300px'
    }} />
    </RelayResolver>
}`,...(E=(D=n.parameters)==null?void 0:D.docs)==null?void 0:E.source},description:{story:"Select with custom placeholder text.",...(V=(M=n.parameters)==null?void 0:M.docs)==null?void 0:V.description}}};var $,F,W,q,O;l.parameters={...l.parameters,docs:{...($=l.parameters)==null?void 0:$.docs,source:{originalSource:`{
  name: 'ManyOptions',
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the component with 15 resource policies, showing scrollable dropdown with search functionality.'
      }
    }
  },
  args: {
    allowClear: true
  },
  render: args => <RelayResolver mockResolvers={{
    Query: () => ({
      project_resource_policies: sampleManyPolicies
    })
  }}>
      <BAIProjectResourcePolicySelect {...args} style={{
      width: '300px'
    }} />
    </RelayResolver>
}`,...(W=(F=l.parameters)==null?void 0:F.docs)==null?void 0:W.source},description:{story:"Select with many policy options.",...(O=(q=l.parameters)==null?void 0:q.docs)==null?void 0:O.description}}};const ke=["Default","Empty","Disabled","WithClearButton","WithCustomPlaceholder","ManyPolicies"];export{t as Default,a as Disabled,c as Empty,l as ManyPolicies,i as WithClearButton,n as WithCustomPlaceholder,ke as __namedExportsOrder,Qe as default};
