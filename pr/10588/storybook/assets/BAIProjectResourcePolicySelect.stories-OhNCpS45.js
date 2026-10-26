import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-MKhVqBIO.js";import{n,t as r}from"./BAIProjectResourcePolicySelect-couJFHFc.js";import{n as i,t as a}from"./RelayResolver-CMrgwoPg.js";var o,s,c,l,u,d,f,p,m,h,g;function _(){return(_=e((()=>{i(),n(),o=t(),s=[{id:`policy-1`,name:`default`},{id:`policy-2`,name:`gpu-limited`},{id:`policy-3`,name:`cpu-only`},{id:`policy-4`,name:`high-memory`},{id:`policy-5`,name:`storage-optimized`}],c=Array.from({length:15},(e,t)=>({id:`policy-${t+1}`,name:`resource-policy-${t+1}`})),l={title:`Fragments/BAIProjectResourcePolicySelect`,component:r,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`
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
        `}}},argTypes:{placeholder:{control:{type:`text`},description:`Placeholder text when no value is selected`,table:{type:{summary:`string`}}},disabled:{control:{type:`boolean`},description:`Whether the select is disabled`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},allowClear:{control:{type:`boolean`},description:`Show clear button`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},onChange:{action:`changed`,description:`Callback when selection changes`}}},u={name:`Basic`,parameters:{docs:{description:{story:`Basic usage showing 5 project resource policies, automatically sorted alphabetically. Search functionality is enabled by default.`}}},args:{},render:e=>(0,o.jsx)(a,{mockResolvers:{Query:()=>({project_resource_policies:s})},children:(0,o.jsx)(r,{...e,style:{width:`300px`}})})},d={name:`EmptyState`,parameters:{docs:{description:{story:`Shows the component when no project resource policies are configured.`}}},args:{},render:e=>(0,o.jsx)(a,{mockResolvers:{Query:()=>({project_resource_policies:[]})},children:(0,o.jsx)(r,{...e,style:{width:`300px`}})})},f={name:`DisabledState`,parameters:{docs:{description:{story:`Shows the component in a disabled state where users cannot interact with it.`}}},args:{disabled:!0},render:e=>(0,o.jsx)(a,{mockResolvers:{Query:()=>({project_resource_policies:s})},children:(0,o.jsx)(r,{...e,style:{width:`300px`}})})},p={name:`ClearButton`,parameters:{docs:{description:{story:`Select with allowClear enabled, allowing users to clear their selection.`}}},args:{allowClear:!0},render:e=>(0,o.jsx)(a,{mockResolvers:{Query:()=>({project_resource_policies:s})},children:(0,o.jsx)(r,{...e,style:{width:`300px`}})})},m={name:`CustomPlaceholder`,parameters:{docs:{description:{story:`Demonstrates using a custom placeholder text.`}}},args:{placeholder:`Choose a resource policy...`},render:e=>(0,o.jsx)(a,{mockResolvers:{Query:()=>({project_resource_policies:s})},children:(0,o.jsx)(r,{...e,style:{width:`300px`}})})},h={name:`ManyOptions`,parameters:{docs:{description:{story:`Demonstrates the component with 15 resource policies, showing scrollable dropdown with search functionality.`}}},args:{allowClear:!0},render:e=>(0,o.jsx)(a,{mockResolvers:{Query:()=>({project_resource_policies:c})},children:(0,o.jsx)(r,{...e,style:{width:`300px`}})})},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
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
}`,...u.parameters?.docs?.source},description:{story:`Basic usage with 5 sample resource policies.`,...u.parameters?.docs?.description}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
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
}`,...d.parameters?.docs?.source},description:{story:`Empty state when no resource policies are available.`,...d.parameters?.docs?.description}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
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
}`,...f.parameters?.docs?.source},description:{story:`Disabled state of the select.`,...f.parameters?.docs?.description}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
}`,...p.parameters?.docs?.source},description:{story:`Select with clear button enabled.`,...p.parameters?.docs?.description}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source},description:{story:`Select with custom placeholder text.`,...m.parameters?.docs?.description}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source},description:{story:`Select with many policy options.`,...h.parameters?.docs?.description}}},g=[`Default`,`Empty`,`Disabled`,`WithClearButton`,`WithCustomPlaceholder`,`ManyPolicies`]})))()}_();export{u as Default,f as Disabled,d as Empty,h as ManyPolicies,p as WithClearButton,m as WithCustomPlaceholder,g as __namedExportsOrder,l as default};