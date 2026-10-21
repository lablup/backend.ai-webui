import{j as r}from"./iframe-BAT3yFtw.js";import{R as s}from"./RelayResolver-BE8rT6kT.js";import{B as o}from"./BAIProjectResourcePolicySelect-CcjofxNQ.js";import"./preload-helper-Dp1pzeXC.js";import"./index-Cp8-Xe_d.js";import"./index-ClLim50N.js";import"./BAISelect-BV8LKxru.js";import"./astryxLabel-BPT30uCp.js";import"./isString-B0aywIjf.js";import"./isEmpty-DDNnJFoN.js";import"./InputGroupContext-Da3_RogR.js";import"./FieldStatus-RlwyLQdm.js";import"./useDevWarning-D0OgNMSx.js";import"./Selector-hYy-yh9b.js";import"./useMenuOverflow-CL2O36fk.js";import"./useResolvedRequired-C3kb4yL5.js";import"./SelectorOption-DdOcl2Me.js";import"./Item-Bje3LoEL.js";import"./computeTargetAndRel-BGwjeA1c.js";import"./isRenderable-BUV0eL6r.js";import"./groupStyles-OocOPi8e.js";import"./composeEventHandlers-BolWE7qY.js";import"./usePopover-DR8F6tlQ.js";import"./rtlStyles-T4i24HtE.js";import"./useIndicator-ugzIHzDB.js";import"./Divider-BUdlBiL4.js";import"./isRtlElement-B2-7SF8s.js";import"./Badge-DA9DUDUQ.js";import"./CheckboxInput-DwjmJazz.js";import"./map-B-8e5hFH.js";import"./toString-CBf2bqrJ.js";import"./isSymbol-BWbEH8JR.js";import"./_baseEach-AEl-uA41.js";import"./get-qW76J6L7.js";import"./_baseGet-UeITJlaN.js";import"./identity-DKeuBCMA.js";import"./sortBy-C6-jDaju.js";import"./_baseFlatten-BzmjfJ7H.js";import"./_baseRest-SxaZoFCS.js";import"./_overRest-C90Ui7Mx.js";import"./_defineProperty-DliPmjnq.js";import"./_isIterateeCall-CrvsTLF7.js";const p=[{id:"policy-1",name:"default"},{id:"policy-2",name:"gpu-limited"},{id:"policy-3",name:"cpu-only"},{id:"policy-4",name:"high-memory"},{id:"policy-5",name:"storage-optimized"}],U=Array.from({length:15},(e,m)=>({id:`policy-${m+1}`,name:`resource-policy-${m+1}`})),Ie={title:"Fragments/BAIProjectResourcePolicySelect",component:o,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:`
**BAIProjectResourcePolicySelect** extends [BAISelect](/?path=/docs/components-input-baiselect--docs) to fetch and display project resource policies.

## Features
- Fetches project resource policies from GraphQL query \`BAIProjectResourcePolicySelectQuery\`
- Policies are automatically sorted alphabetically by name
- Built-in search functionality enabled by default
- Uses policy \`name\` as both label and value

## GraphQL Query
\`\`\`graphql
query BAIProjectResourcePolicySelectQuery {
  project_resource_policies {
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
        `}}},argTypes:{placeholder:{control:{type:"text"},description:"Placeholder text when no value is selected",table:{type:{summary:"string"}}},disabled:{control:{type:"boolean"},description:"Whether the select is disabled",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},allowClear:{control:{type:"boolean"},description:"Show clear button",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},onChange:{action:"changed",description:"Callback when selection changes"}}},t={name:"Basic",parameters:{docs:{description:{story:"Basic usage showing 5 project resource policies, automatically sorted alphabetically. Search functionality is enabled by default."}}},args:{},render:e=>r.jsx(s,{mockResolvers:{Query:()=>({project_resource_policies:p})},children:r.jsx(o,{...e,style:{width:"300px"}})})},a={name:"EmptyState",parameters:{docs:{description:{story:"Shows the component when no project resource policies are configured."}}},args:{},render:e=>r.jsx(s,{mockResolvers:{Query:()=>({project_resource_policies:[]})},children:r.jsx(o,{...e,style:{width:"300px"}})})},c={name:"DisabledState",parameters:{docs:{description:{story:"Shows the component in a disabled state where users cannot interact with it."}}},args:{disabled:!0},render:e=>r.jsx(s,{mockResolvers:{Query:()=>({project_resource_policies:p})},children:r.jsx(o,{...e,style:{width:"300px"}})})},n={name:"ClearButton",parameters:{docs:{description:{story:"Select with allowClear enabled, allowing users to clear their selection."}}},args:{allowClear:!0},render:e=>r.jsx(s,{mockResolvers:{Query:()=>({project_resource_policies:p})},children:r.jsx(o,{...e,style:{width:"300px"}})})},i={name:"CustomPlaceholder",parameters:{docs:{description:{story:"Demonstrates using a custom placeholder text."}}},args:{placeholder:"Choose a resource policy..."},render:e=>r.jsx(s,{mockResolvers:{Query:()=>({project_resource_policies:p})},children:r.jsx(o,{...e,style:{width:"300px"}})})},l={name:"ManyOptions",parameters:{docs:{description:{story:"Demonstrates the component with 15 resource policies, showing scrollable dropdown with search functionality."}}},args:{allowClear:!0},render:e=>r.jsx(s,{mockResolvers:{Query:()=>({project_resource_policies:U})},children:r.jsx(o,{...e,style:{width:"300px"}})})};var d,u,y,h,g;t.parameters={...t.parameters,docs:{...(d=t.parameters)==null?void 0:d.docs,source:{originalSource:`{
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
}`,...(y=(u=t.parameters)==null?void 0:u.docs)==null?void 0:y.source},description:{story:"Basic usage with 5 sample resource policies.",...(g=(h=t.parameters)==null?void 0:h.docs)==null?void 0:g.description}}};var R,w,j,b,P;a.parameters={...a.parameters,docs:{...(R=a.parameters)==null?void 0:R.docs,source:{originalSource:`{
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
}`,...(j=(w=a.parameters)==null?void 0:w.docs)==null?void 0:j.source},description:{story:"Empty state when no resource policies are available.",...(P=(b=a.parameters)==null?void 0:b.docs)==null?void 0:P.description}}};var S,x,v,_,f;c.parameters={...c.parameters,docs:{...(S=c.parameters)==null?void 0:S.docs,source:{originalSource:`{
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
}`,...(v=(x=c.parameters)==null?void 0:x.docs)==null?void 0:v.source},description:{story:"Disabled state of the select.",...(f=(_=c.parameters)==null?void 0:_.docs)==null?void 0:f.description}}};var B,C,Q,A,I;n.parameters={...n.parameters,docs:{...(B=n.parameters)==null?void 0:B.docs,source:{originalSource:`{
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
}`,...(Q=(C=n.parameters)==null?void 0:C.docs)==null?void 0:Q.source},description:{story:"Select with clear button enabled.",...(I=(A=n.parameters)==null?void 0:A.docs)==null?void 0:I.description}}};var k,D,E,M,W;i.parameters={...i.parameters,docs:{...(k=i.parameters)==null?void 0:k.docs,source:{originalSource:`{
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
}`,...(E=(D=i.parameters)==null?void 0:D.docs)==null?void 0:E.source},description:{story:"Select with custom placeholder text.",...(W=(M=i.parameters)==null?void 0:M.docs)==null?void 0:W.description}}};var F,q,O,G,L;l.parameters={...l.parameters,docs:{...(F=l.parameters)==null?void 0:F.docs,source:{originalSource:`{
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
}`,...(O=(q=l.parameters)==null?void 0:q.docs)==null?void 0:O.source},description:{story:"Select with many policy options.",...(L=(G=l.parameters)==null?void 0:G.docs)==null?void 0:L.description}}};const ke=["Default","Empty","Disabled","WithClearButton","WithCustomPlaceholder","ManyPolicies"];export{t as Default,c as Disabled,a as Empty,l as ManyPolicies,n as WithClearButton,i as WithCustomPlaceholder,ke as __namedExportsOrder,Ie as default};
