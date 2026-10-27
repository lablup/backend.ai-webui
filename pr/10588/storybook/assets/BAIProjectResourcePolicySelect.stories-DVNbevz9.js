import{n as e}from"./rolldown-runtime-2s6bX4vc.js";import{n as t,t as n}from"./BAIProjectResourcePolicySelect-BVDodwDD.js";import{n as r,t as i}from"./RelayResolver-b1nJU57O.js";import{jsx as a}from"react/jsx-runtime";var o,s,c,l,u,d,f,p,m,h;function g(){return(g=e((()=>{r(),t(),o=[{id:`policy-1`,name:`default`},{id:`policy-2`,name:`gpu-limited`},{id:`policy-3`,name:`cpu-only`},{id:`policy-4`,name:`high-memory`},{id:`policy-5`,name:`storage-optimized`}],s=Array.from({length:15},(e,t)=>({id:`policy-${t+1}`,name:`resource-policy-${t+1}`})),c={title:`Fragments/BAIProjectResourcePolicySelect`,component:n,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`
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
        `}}},argTypes:{placeholder:{control:{type:`text`},description:`Placeholder text when no value is selected`,table:{type:{summary:`string`}}},disabled:{control:{type:`boolean`},description:`Whether the select is disabled`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},allowClear:{control:{type:`boolean`},description:`Show clear button`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},onChange:{action:`changed`,description:`Callback when selection changes`}}},l={name:`Basic`,parameters:{docs:{description:{story:`Basic usage showing 5 project resource policies, automatically sorted alphabetically. Search functionality is enabled by default.`}}},args:{},render:e=>a(i,{mockResolvers:{Query:()=>({project_resource_policies:o})},children:a(n,{...e,style:{width:`300px`}})})},u={name:`EmptyState`,parameters:{docs:{description:{story:`Shows the component when no project resource policies are configured.`}}},args:{},render:e=>a(i,{mockResolvers:{Query:()=>({project_resource_policies:[]})},children:a(n,{...e,style:{width:`300px`}})})},d={name:`DisabledState`,parameters:{docs:{description:{story:`Shows the component in a disabled state where users cannot interact with it.`}}},args:{disabled:!0},render:e=>a(i,{mockResolvers:{Query:()=>({project_resource_policies:o})},children:a(n,{...e,style:{width:`300px`}})})},f={name:`ClearButton`,parameters:{docs:{description:{story:`Select with allowClear enabled, allowing users to clear their selection.`}}},args:{allowClear:!0},render:e=>a(i,{mockResolvers:{Query:()=>({project_resource_policies:o})},children:a(n,{...e,style:{width:`300px`}})})},p={name:`CustomPlaceholder`,parameters:{docs:{description:{story:`Demonstrates using a custom placeholder text.`}}},args:{placeholder:`Choose a resource policy...`},render:e=>a(i,{mockResolvers:{Query:()=>({project_resource_policies:o})},children:a(n,{...e,style:{width:`300px`}})})},m={name:`ManyOptions`,parameters:{docs:{description:{story:`Demonstrates the component with 15 resource policies, showing scrollable dropdown with search functionality.`}}},args:{allowClear:!0},render:e=>a(i,{mockResolvers:{Query:()=>({project_resource_policies:s})},children:a(n,{...e,style:{width:`300px`}})})},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
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
}`,...l.parameters?.docs?.source},description:{story:`Basic usage with 5 sample resource policies.`,...l.parameters?.docs?.description}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
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
}`,...u.parameters?.docs?.source},description:{story:`Empty state when no resource policies are available.`,...u.parameters?.docs?.description}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
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
}`,...d.parameters?.docs?.source},description:{story:`Disabled state of the select.`,...d.parameters?.docs?.description}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
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
}`,...f.parameters?.docs?.source},description:{story:`Select with clear button enabled.`,...f.parameters?.docs?.description}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
}`,...p.parameters?.docs?.source},description:{story:`Select with custom placeholder text.`,...p.parameters?.docs?.description}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source},description:{story:`Select with many policy options.`,...m.parameters?.docs?.description}}},h=[`Default`,`Empty`,`Disabled`,`WithClearButton`,`WithCustomPlaceholder`,`ManyPolicies`]})))()}g();export{l as Default,d as Disabled,u as Empty,m as ManyPolicies,f as WithClearButton,p as WithCustomPlaceholder,h as __namedExportsOrder,c as default};