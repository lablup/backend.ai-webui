import{j as o,a9 as L}from"./iframe-CXDrtD-Y.js";import{R as s}from"./RelayResolver-DTQWKKZc.js";import{B as r}from"./BAIProjectResourcePolicySelect-BwLj__tX.js";import"./preload-helper-Dp1pzeXC.js";import"./index-yzpQEIXq.js";import"./index-CEoHdqZU.js";import"./BAISelect-DeHDXf1x.js";import"./astryxLabel-BOudcdmS.js";import"./isString-Dsh6rij0.js";import"./isEmpty-2R-3eYr5.js";import"./InputClearButton-CXqpvRDw.js";import"./useResolvedRequired-CIOJPwJX.js";import"./useDevWarning-DDtABXAg.js";import"./Selector-Bvqo5hMl.js";import"./useFocusReturnVisibility-CV3PbIw9.js";import"./SelectorOption-Cu9dO7eS.js";import"./Item-BJ0nH1U_.js";import"./isRenderable-BUV0eL6r.js";import"./InputGroupContext-DHdPUXsZ.js";import"./usePopover-BYlqM5LS.js";import"./rtlStyles-T4i24HtE.js";import"./useIndicator-Cm1P9C2Z.js";import"./Divider-BNk4jODA.js";import"./Badge-CIsWGSlv.js";import"./CheckboxInput-CQ9oEeoO.js";import"./useConnectedBAIClient-D7sjGH_a.js";import"./map-CsonK3pE.js";import"./toString-5rUgFqa0.js";import"./isSymbol-DiTwakiy.js";import"./_baseEach-CYrQU2oM.js";import"./get-BMVfQFmr.js";import"./_baseGet-Dvqux9Im.js";import"./identity-DKeuBCMA.js";import"./sortBy-Dxgfz9B5.js";import"./_baseFlatten-CU9t45Zx.js";import"./_overRest-Byls-8GJ.js";import"./_defineProperty-DWWyxFz5.js";import"./_isIterateeCall-n16TxKLq.js";const U=Promise.resolve({is_superadmin:!0}),z=()=>({}),t=e=>({edges:e.map(m=>({node:m}))}),d=[{id:"policy-1",name:"default"},{id:"policy-2",name:"gpu-limited"},{id:"policy-3",name:"cpu-only"},{id:"policy-4",name:"high-memory"},{id:"policy-5",name:"storage-optimized"}],N=Array.from({length:15},(e,m)=>({id:`policy-${m+1}`,name:`resource-policy-${m+1}`})),Ie={title:"Fragments/BAIProjectResourcePolicySelect",component:r,tags:["autodocs"],decorators:[e=>o.jsx(L,{locale:{lang:"en"},clientPromise:U,anonymousClientFactory:z,children:o.jsx(e,{})})],parameters:{layout:"centered",docs:{description:{component:`
**BAIProjectResourcePolicySelect** extends [BAISelect](/?path=/docs/components-input-baiselect--docs) to fetch and display project resource policies.

## Features
- Fetches project resource policies from GraphQL query \`BAIProjectResourcePolicySelectQuery\`
- A superadmin reads \`adminProjectResourcePoliciesV2\` (manager 26.4.2 or later); the field is superadmin-only, so a domain admin reads the legacy \`project_resource_policies\` list
- Policies are automatically sorted alphabetically by name
- Built-in search functionality enabled by default
- Uses policy \`name\` as both label and value

## GraphQL Query
\`\`\`graphql
query BAIProjectResourcePolicySelectQuery($limit: Int!, $isSuperAdmin: Boolean!) {
  adminProjectResourcePoliciesV2(limit: $limit, orderBy: [{ field: NAME, direction: ASC }])
    @include(if: $isSuperAdmin) {
    edges { node { id name } }
  }
  project_resource_policies @skip(if: $isSuperAdmin) {
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
        `}}},argTypes:{placeholder:{control:{type:"text"},description:"Placeholder text when no value is selected",table:{type:{summary:"string"}}},disabled:{control:{type:"boolean"},description:"Whether the select is disabled",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},allowClear:{control:{type:"boolean"},description:"Show clear button",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},onChange:{action:"changed",description:"Callback when selection changes"}}},n={name:"Basic",parameters:{docs:{description:{story:"Basic usage showing 5 project resource policies, automatically sorted alphabetically. Search functionality is enabled by default."}}},args:{},render:e=>o.jsx(s,{mockResolvers:{Query:()=>({adminProjectResourcePoliciesV2:t(d)})},children:o.jsx(r,{...e,style:{width:"300px"}})})},a={name:"EmptyState",parameters:{docs:{description:{story:"Shows the component when no project resource policies are configured."}}},args:{},render:e=>o.jsx(s,{mockResolvers:{Query:()=>({adminProjectResourcePoliciesV2:t([])})},children:o.jsx(r,{...e,style:{width:"300px"}})})},i={name:"DisabledState",parameters:{docs:{description:{story:"Shows the component in a disabled state where users cannot interact with it."}}},args:{disabled:!0},render:e=>o.jsx(s,{mockResolvers:{Query:()=>({adminProjectResourcePoliciesV2:t(d)})},children:o.jsx(r,{...e,style:{width:"300px"}})})},c={name:"ClearButton",parameters:{docs:{description:{story:"Select with allowClear enabled, allowing users to clear their selection."}}},args:{allowClear:!0},render:e=>o.jsx(s,{mockResolvers:{Query:()=>({adminProjectResourcePoliciesV2:t(d)})},children:o.jsx(r,{...e,style:{width:"300px"}})})},l={name:"CustomPlaceholder",parameters:{docs:{description:{story:"Demonstrates using a custom placeholder text."}}},args:{placeholder:"Choose a resource policy..."},render:e=>o.jsx(s,{mockResolvers:{Query:()=>({adminProjectResourcePoliciesV2:t(d)})},children:o.jsx(r,{...e,style:{width:"300px"}})})},p={name:"ManyOptions",parameters:{docs:{description:{story:"Demonstrates the component with 15 resource policies, showing scrollable dropdown with search functionality."}}},args:{allowClear:!0},render:e=>o.jsx(s,{mockResolvers:{Query:()=>({adminProjectResourcePoliciesV2:t(N)})},children:o.jsx(r,{...e,style:{width:"300px"}})})};var u,y,h,P,R;n.parameters={...n.parameters,docs:{...(u=n.parameters)==null?void 0:u.docs,source:{originalSource:`{
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
      adminProjectResourcePoliciesV2: toConnection(samplePolicies)
    })
  }}>
      <BAIProjectResourcePolicySelect {...args} style={{
      width: '300px'
    }} />
    </RelayResolver>
}`,...(h=(y=n.parameters)==null?void 0:y.docs)==null?void 0:h.source},description:{story:"Basic usage with 5 sample resource policies.",...(R=(P=n.parameters)==null?void 0:P.docs)==null?void 0:R.description}}};var g,w,j,b,S;a.parameters={...a.parameters,docs:{...(g=a.parameters)==null?void 0:g.docs,source:{originalSource:`{
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
      adminProjectResourcePoliciesV2: toConnection([])
    })
  }}>
      <BAIProjectResourcePolicySelect {...args} style={{
      width: '300px'
    }} />
    </RelayResolver>
}`,...(j=(w=a.parameters)==null?void 0:w.docs)==null?void 0:j.source},description:{story:"Empty state when no resource policies are available.",...(S=(b=a.parameters)==null?void 0:b.docs)==null?void 0:S.description}}};var x,v,C,f,B;i.parameters={...i.parameters,docs:{...(x=i.parameters)==null?void 0:x.docs,source:{originalSource:`{
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
      adminProjectResourcePoliciesV2: toConnection(samplePolicies)
    })
  }}>
      <BAIProjectResourcePolicySelect {...args} style={{
      width: '300px'
    }} />
    </RelayResolver>
}`,...(C=(v=i.parameters)==null?void 0:v.docs)==null?void 0:C.source},description:{story:"Disabled state of the select.",...(B=(f=i.parameters)==null?void 0:f.docs)==null?void 0:B.description}}};var A,Q,k,I,V;c.parameters={...c.parameters,docs:{...(A=c.parameters)==null?void 0:A.docs,source:{originalSource:`{
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
      adminProjectResourcePoliciesV2: toConnection(samplePolicies)
    })
  }}>
      <BAIProjectResourcePolicySelect {...args} style={{
      width: '300px'
    }} />
    </RelayResolver>
}`,...(k=(Q=c.parameters)==null?void 0:Q.docs)==null?void 0:k.source},description:{story:"Select with clear button enabled.",...(V=(I=c.parameters)==null?void 0:I.docs)==null?void 0:V.description}}};var D,E,_,M,$;l.parameters={...l.parameters,docs:{...(D=l.parameters)==null?void 0:D.docs,source:{originalSource:`{
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
      adminProjectResourcePoliciesV2: toConnection(samplePolicies)
    })
  }}>
      <BAIProjectResourcePolicySelect {...args} style={{
      width: '300px'
    }} />
    </RelayResolver>
}`,...(_=(E=l.parameters)==null?void 0:E.docs)==null?void 0:_.source},description:{story:"Select with custom placeholder text.",...($=(M=l.parameters)==null?void 0:M.docs)==null?void 0:$.description}}};var F,W,q,O,G;p.parameters={...p.parameters,docs:{...(F=p.parameters)==null?void 0:F.docs,source:{originalSource:`{
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
      adminProjectResourcePoliciesV2: toConnection(sampleManyPolicies)
    })
  }}>
      <BAIProjectResourcePolicySelect {...args} style={{
      width: '300px'
    }} />
    </RelayResolver>
}`,...(q=(W=p.parameters)==null?void 0:W.docs)==null?void 0:q.source},description:{story:"Select with many policy options.",...(G=(O=p.parameters)==null?void 0:O.docs)==null?void 0:G.description}}};const Ve=["Default","Empty","Disabled","WithClearButton","WithCustomPlaceholder","ManyPolicies"];export{n as Default,i as Disabled,a as Empty,p as ManyPolicies,c as WithClearButton,l as WithCustomPlaceholder,Ve as __namedExportsOrder,Ie as default};
