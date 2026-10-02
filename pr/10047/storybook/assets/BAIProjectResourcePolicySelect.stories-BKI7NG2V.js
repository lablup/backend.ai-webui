import{j as o}from"./iframe-D0Z6Tyuv.js";import{R as s}from"./RelayResolver-C4V542NH.js";import{B as r}from"./BAIProjectResourcePolicySelect-BLyIyUGl.js";import"./preload-helper-Dp1pzeXC.js";import"./index-SJmsH3wo.js";import"./index-8y_VkQmC.js";import"./BAISelect-CKVHPof2.js";import"./astryxLabel-mcC4S9mH.js";import"./isString-CRXeaJyg.js";import"./isEmpty-DiyX-JqQ.js";import"./InputClearButton-Dn_APjHT.js";import"./FieldStatus-VkqsGPPu.js";import"./useDevWarning-DIH3CxdB.js";import"./Selector-Bo3NGYQG.js";import"./useFocusReturnVisibility-CoHBuQ-v.js";import"./useResolvedRequired-D8Vzve7F.js";import"./SelectorOption-8lEk1TCl.js";import"./Item-C_GcKJud.js";import"./isRenderable-BUV0eL6r.js";import"./InputGroupContext-Cbvhwg6p.js";import"./usePopover-BnZZcX_D.js";import"./rtlStyles-T4i24HtE.js";import"./useIndicator-C7PanPCJ.js";import"./Divider-DVEWBru8.js";import"./Badge-BaNG5mBx.js";import"./CheckboxInput-DTkCWxEH.js";import"./map-8gT3rQBF.js";import"./toString-CrYbURce.js";import"./isSymbol-BasSor8w.js";import"./_baseEach-CmNp22Ij.js";import"./get-CNSmeSfY.js";import"./_baseGet-D-MV6hfC.js";import"./identity-DKeuBCMA.js";import"./sortBy-DgY4fOnX.js";import"./_baseFlatten-PAfeJT96.js";import"./_baseRest-Dp54Wsmm.js";import"./_overRest-oXEs6qXS.js";import"./_defineProperty-DHg7ARpC.js";import"./_isIterateeCall-BDL_IVNa.js";const t=e=>({edges:e.map(m=>({node:m}))}),d=[{id:"policy-1",name:"default"},{id:"policy-2",name:"gpu-limited"},{id:"policy-3",name:"cpu-only"},{id:"policy-4",name:"high-memory"},{id:"policy-5",name:"storage-optimized"}],L=Array.from({length:15},(e,m)=>({id:`policy-${m+1}`,name:`resource-policy-${m+1}`})),Qe={title:"Fragments/BAIProjectResourcePolicySelect",component:r,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:`
**BAIProjectResourcePolicySelect** extends [BAISelect](/?path=/docs/components-input-baiselect--docs) to fetch and display project resource policies.

## Features
- Fetches project resource policies from GraphQL query \`BAIProjectResourcePolicySelectQuery\`
- Reads \`adminProjectResourcePoliciesV2\` (manager 26.4.2 or later, superadmin only)
- Policies are automatically sorted alphabetically by name
- Built-in search functionality enabled by default
- Uses policy \`name\` as both label and value

## GraphQL Query
\`\`\`graphql
query BAIProjectResourcePolicySelectQuery($limit: Int!) {
  adminProjectResourcePoliciesV2(limit: $limit, orderBy: [{ field: NAME, direction: ASC }]) {
    edges { node { id name } }
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
        `}}},argTypes:{placeholder:{control:{type:"text"},description:"Placeholder text when no value is selected",table:{type:{summary:"string"}}},disabled:{control:{type:"boolean"},description:"Whether the select is disabled",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},allowClear:{control:{type:"boolean"},description:"Show clear button",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},onChange:{action:"changed",description:"Callback when selection changes"}}},a={name:"Basic",parameters:{docs:{description:{story:"Basic usage showing 5 project resource policies, automatically sorted alphabetically. Search functionality is enabled by default."}}},args:{},render:e=>o.jsx(s,{mockResolvers:{Query:()=>({adminProjectResourcePoliciesV2:t(d)})},children:o.jsx(r,{...e,style:{width:"300px"}})})},n={name:"EmptyState",parameters:{docs:{description:{story:"Shows the component when no project resource policies are configured."}}},args:{},render:e=>o.jsx(s,{mockResolvers:{Query:()=>({adminProjectResourcePoliciesV2:t([])})},children:o.jsx(r,{...e,style:{width:"300px"}})})},c={name:"DisabledState",parameters:{docs:{description:{story:"Shows the component in a disabled state where users cannot interact with it."}}},args:{disabled:!0},render:e=>o.jsx(s,{mockResolvers:{Query:()=>({adminProjectResourcePoliciesV2:t(d)})},children:o.jsx(r,{...e,style:{width:"300px"}})})},i={name:"ClearButton",parameters:{docs:{description:{story:"Select with allowClear enabled, allowing users to clear their selection."}}},args:{allowClear:!0},render:e=>o.jsx(s,{mockResolvers:{Query:()=>({adminProjectResourcePoliciesV2:t(d)})},children:o.jsx(r,{...e,style:{width:"300px"}})})},l={name:"CustomPlaceholder",parameters:{docs:{description:{story:"Demonstrates using a custom placeholder text."}}},args:{placeholder:"Choose a resource policy..."},render:e=>o.jsx(s,{mockResolvers:{Query:()=>({adminProjectResourcePoliciesV2:t(d)})},children:o.jsx(r,{...e,style:{width:"300px"}})})},p={name:"ManyOptions",parameters:{docs:{description:{story:"Demonstrates the component with 15 resource policies, showing scrollable dropdown with search functionality."}}},args:{allowClear:!0},render:e=>o.jsx(s,{mockResolvers:{Query:()=>({adminProjectResourcePoliciesV2:t(L)})},children:o.jsx(r,{...e,style:{width:"300px"}})})};var u,y,h,P,R;a.parameters={...a.parameters,docs:{...(u=a.parameters)==null?void 0:u.docs,source:{originalSource:`{
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
}`,...(h=(y=a.parameters)==null?void 0:y.docs)==null?void 0:h.source},description:{story:"Basic usage with 5 sample resource policies.",...(R=(P=a.parameters)==null?void 0:P.docs)==null?void 0:R.description}}};var g,w,j,b,S;n.parameters={...n.parameters,docs:{...(g=n.parameters)==null?void 0:g.docs,source:{originalSource:`{
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
}`,...(j=(w=n.parameters)==null?void 0:w.docs)==null?void 0:j.source},description:{story:"Empty state when no resource policies are available.",...(S=(b=n.parameters)==null?void 0:b.docs)==null?void 0:S.description}}};var x,v,C,f,B;c.parameters={...c.parameters,docs:{...(x=c.parameters)==null?void 0:x.docs,source:{originalSource:`{
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
}`,...(C=(v=c.parameters)==null?void 0:v.docs)==null?void 0:C.source},description:{story:"Disabled state of the select.",...(B=(f=c.parameters)==null?void 0:f.docs)==null?void 0:B.description}}};var A,Q,V,I,k;i.parameters={...i.parameters,docs:{...(A=i.parameters)==null?void 0:A.docs,source:{originalSource:`{
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
}`,...(V=(Q=i.parameters)==null?void 0:Q.docs)==null?void 0:V.source},description:{story:"Select with clear button enabled.",...(k=(I=i.parameters)==null?void 0:I.docs)==null?void 0:k.description}}};var D,E,M,W,F;l.parameters={...l.parameters,docs:{...(D=l.parameters)==null?void 0:D.docs,source:{originalSource:`{
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
}`,...(M=(E=l.parameters)==null?void 0:E.docs)==null?void 0:M.source},description:{story:"Select with custom placeholder text.",...(F=(W=l.parameters)==null?void 0:W.docs)==null?void 0:F.description}}};var $,q,O,_,G;p.parameters={...p.parameters,docs:{...($=p.parameters)==null?void 0:$.docs,source:{originalSource:`{
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
}`,...(O=(q=p.parameters)==null?void 0:q.docs)==null?void 0:O.source},description:{story:"Select with many policy options.",...(G=(_=p.parameters)==null?void 0:_.docs)==null?void 0:G.description}}};const Ve=["Default","Empty","Disabled","WithClearButton","WithCustomPlaceholder","ManyPolicies"];export{a as Default,c as Disabled,n as Empty,p as ManyPolicies,i as WithClearButton,l as WithCustomPlaceholder,Ve as __namedExportsOrder,Qe as default};
