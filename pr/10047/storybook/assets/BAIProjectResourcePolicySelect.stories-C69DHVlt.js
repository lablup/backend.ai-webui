import{j as r,a9 as G}from"./iframe-B9YeRq-v.js";import{R as s}from"./RelayResolver-BRuxncgO.js";import{B as o}from"./BAIProjectResourcePolicySelect-BTv0B8Pg.js";import"./preload-helper-Dp1pzeXC.js";import"./index-Bo3LHRG2.js";import"./index-CyQnePat.js";import"./BAISelect-5UT3mvxW.js";import"./astryxLabel-C15SkGq6.js";import"./isString-DEmAHVbF.js";import"./isEmpty-z168Vk8H.js";import"./InputClearButton-CVC8mg-r.js";import"./useResolvedRequired-DBf4mbsX.js";import"./useDevWarning-Da_4uv9v.js";import"./Selector-dGf8oDy4.js";import"./useFocusReturnVisibility-C5AEsfCN.js";import"./SelectorOption-CgnaWA0Z.js";import"./Item-CMmwyk0l.js";import"./isRenderable-BUV0eL6r.js";import"./InputGroupContext-1d7p1DFh.js";import"./usePopover-mWJivjSF.js";import"./rtlStyles-T4i24HtE.js";import"./useIndicator-B4QpGu3N.js";import"./Divider-DUbYfSXu.js";import"./Badge-Xb3XQn4S.js";import"./CheckboxInput-D0VQLvVx.js";import"./useConnectedBAIClient-D1tKnZhT.js";import"./map-00A2Asmc.js";import"./toString-BzhVxP7e.js";import"./isSymbol-BOKK67rI.js";import"./_baseEach-Ca4dBfAp.js";import"./get-B1R51_rX.js";import"./_baseGet-B8qvG6ia.js";import"./identity-DKeuBCMA.js";import"./sortBy-D714_hf6.js";import"./_baseFlatten-ClleNDDe.js";import"./_overRest-1l87YzRQ.js";import"./_defineProperty-Cp5EU3Eh.js";import"./_isIterateeCall-BVBtIzV0.js";const L=Promise.resolve({supports:()=>!1}),U=()=>({}),z=e=>r.jsx(G,{locale:{lang:"en"},clientPromise:L,anonymousClientFactory:U,children:r.jsx(e,{})}),p=[{id:"policy-1",name:"default"},{id:"policy-2",name:"gpu-limited"},{id:"policy-3",name:"cpu-only"},{id:"policy-4",name:"high-memory"},{id:"policy-5",name:"storage-optimized"}],N=Array.from({length:15},(e,m)=>({id:`policy-${m+1}`,name:`resource-policy-${m+1}`})),Qe={title:"Fragments/BAIProjectResourcePolicySelect",component:o,tags:["autodocs"],decorators:[z],parameters:{layout:"centered",docs:{description:{component:`
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
        `}}},argTypes:{placeholder:{control:{type:"text"},description:"Placeholder text when no value is selected",table:{type:{summary:"string"}}},disabled:{control:{type:"boolean"},description:"Whether the select is disabled",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},allowClear:{control:{type:"boolean"},description:"Show clear button",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},onChange:{action:"changed",description:"Callback when selection changes"}}},t={name:"Basic",parameters:{docs:{description:{story:"Basic usage showing 5 project resource policies, automatically sorted alphabetically. Search functionality is enabled by default."}}},args:{},render:e=>r.jsx(s,{mockResolvers:{Query:()=>({project_resource_policies:p})},children:r.jsx(o,{...e,style:{width:"300px"}})})},c={name:"EmptyState",parameters:{docs:{description:{story:"Shows the component when no project resource policies are configured."}}},args:{},render:e=>r.jsx(s,{mockResolvers:{Query:()=>({project_resource_policies:[]})},children:r.jsx(o,{...e,style:{width:"300px"}})})},a={name:"DisabledState",parameters:{docs:{description:{story:"Shows the component in a disabled state where users cannot interact with it."}}},args:{disabled:!0},render:e=>r.jsx(s,{mockResolvers:{Query:()=>({project_resource_policies:p})},children:r.jsx(o,{...e,style:{width:"300px"}})})},i={name:"ClearButton",parameters:{docs:{description:{story:"Select with allowClear enabled, allowing users to clear their selection."}}},args:{allowClear:!0},render:e=>r.jsx(s,{mockResolvers:{Query:()=>({project_resource_policies:p})},children:r.jsx(o,{...e,style:{width:"300px"}})})},n={name:"CustomPlaceholder",parameters:{docs:{description:{story:"Demonstrates using a custom placeholder text."}}},args:{placeholder:"Choose a resource policy..."},render:e=>r.jsx(s,{mockResolvers:{Query:()=>({project_resource_policies:p})},children:r.jsx(o,{...e,style:{width:"300px"}})})},l={name:"ManyOptions",parameters:{docs:{description:{story:"Demonstrates the component with 15 resource policies, showing scrollable dropdown with search functionality."}}},args:{allowClear:!0},render:e=>r.jsx(s,{mockResolvers:{Query:()=>({project_resource_policies:N})},children:r.jsx(o,{...e,style:{width:"300px"}})})};var d,u,y,h,g;t.parameters={...t.parameters,docs:{...(d=t.parameters)==null?void 0:d.docs,source:{originalSource:`{
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
}`,...(v=(x=a.parameters)==null?void 0:x.docs)==null?void 0:v.source},description:{story:"Disabled state of the select.",...(_=(f=a.parameters)==null?void 0:f.docs)==null?void 0:_.description}}};var B,C,A,k,Q;i.parameters={...i.parameters,docs:{...(B=i.parameters)==null?void 0:B.docs,source:{originalSource:`{
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
}`,...(A=(C=i.parameters)==null?void 0:C.docs)==null?void 0:A.source},description:{story:"Select with clear button enabled.",...(Q=(k=i.parameters)==null?void 0:k.docs)==null?void 0:Q.description}}};var I,D,E,M,V;n.parameters={...n.parameters,docs:{...(I=n.parameters)==null?void 0:I.docs,source:{originalSource:`{
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
}`,...(W=(F=l.parameters)==null?void 0:F.docs)==null?void 0:W.source},description:{story:"Select with many policy options.",...(O=(q=l.parameters)==null?void 0:q.docs)==null?void 0:O.description}}};const Ie=["Default","Empty","Disabled","WithClearButton","WithCustomPlaceholder","ManyPolicies"];export{t as Default,a as Disabled,c as Empty,l as ManyPolicies,i as WithClearButton,n as WithCustomPlaceholder,Ie as __namedExportsOrder,Qe as default};
