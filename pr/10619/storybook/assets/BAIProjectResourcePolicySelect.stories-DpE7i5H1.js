import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-MKhVqBIO.js";import{n,t as r}from"./BAIProjectResourcePolicySelect-CktiKr55.js";import{n as i,t as a}from"./RelayResolver-BnFyFQJn.js";var o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P;function F(){return(F=e((()=>{i(),n(),o=t(),T=[{id:`policy-1`,name:`default`},{id:`policy-2`,name:`gpu-limited`},{id:`policy-3`,name:`cpu-only`},{id:`policy-4`,name:`high-memory`},{id:`policy-5`,name:`storage-optimized`}],E=Array.from({length:15},(e,t)=>({id:`policy-${t+1}`,name:`resource-policy-${t+1}`})),D={title:`Fragments/BAIProjectResourcePolicySelect`,component:r,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`
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
        `}}},argTypes:{placeholder:{control:{type:`text`},description:`Placeholder text when no value is selected`,table:{type:{summary:`string`}}},disabled:{control:{type:`boolean`},description:`Whether the select is disabled`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},allowClear:{control:{type:`boolean`},description:`Show clear button`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},onChange:{action:`changed`,description:`Callback when selection changes`}}},O={name:`Basic`,parameters:{docs:{description:{story:`Basic usage showing 5 project resource policies, automatically sorted alphabetically. Search functionality is enabled by default.`}}},args:{},render:e=>(0,o.jsx)(a,{mockResolvers:{Query:()=>({project_resource_policies:T})},children:(0,o.jsx)(r,{...e,style:{width:`300px`}})})},k={name:`EmptyState`,parameters:{docs:{description:{story:`Shows the component when no project resource policies are configured.`}}},args:{},render:e=>(0,o.jsx)(a,{mockResolvers:{Query:()=>({project_resource_policies:[]})},children:(0,o.jsx)(r,{...e,style:{width:`300px`}})})},A={name:`DisabledState`,parameters:{docs:{description:{story:`Shows the component in a disabled state where users cannot interact with it.`}}},args:{disabled:!0},render:e=>(0,o.jsx)(a,{mockResolvers:{Query:()=>({project_resource_policies:T})},children:(0,o.jsx)(r,{...e,style:{width:`300px`}})})},j={name:`ClearButton`,parameters:{docs:{description:{story:`Select with allowClear enabled, allowing users to clear their selection.`}}},args:{allowClear:!0},render:e=>(0,o.jsx)(a,{mockResolvers:{Query:()=>({project_resource_policies:T})},children:(0,o.jsx)(r,{...e,style:{width:`300px`}})})},M={name:`CustomPlaceholder`,parameters:{docs:{description:{story:`Demonstrates using a custom placeholder text.`}}},args:{placeholder:`Choose a resource policy...`},render:e=>(0,o.jsx)(a,{mockResolvers:{Query:()=>({project_resource_policies:T})},children:(0,o.jsx)(r,{...e,style:{width:`300px`}})})},N={name:`ManyOptions`,parameters:{docs:{description:{story:`Demonstrates the component with 15 resource policies, showing scrollable dropdown with search functionality.`}}},args:{allowClear:!0},render:e=>(0,o.jsx)(a,{mockResolvers:{Query:()=>({project_resource_policies:E})},children:(0,o.jsx)(r,{...e,style:{width:`300px`}})})},O.parameters={...O.parameters,docs:{...(s=O.parameters)==null?void 0:s.docs,source:{originalSource:`{
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
}`,...(c=O.parameters)==null||(c=c.docs)==null?void 0:c.source},description:{story:`Basic usage with 5 sample resource policies.`,...(l=O.parameters)==null||(l=l.docs)==null?void 0:l.description}}},k.parameters={...k.parameters,docs:{...(u=k.parameters)==null?void 0:u.docs,source:{originalSource:`{
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
}`,...(d=k.parameters)==null||(d=d.docs)==null?void 0:d.source},description:{story:`Empty state when no resource policies are available.`,...(f=k.parameters)==null||(f=f.docs)==null?void 0:f.description}}},A.parameters={...A.parameters,docs:{...(p=A.parameters)==null?void 0:p.docs,source:{originalSource:`{
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
}`,...(m=A.parameters)==null||(m=m.docs)==null?void 0:m.source},description:{story:`Disabled state of the select.`,...(h=A.parameters)==null||(h=h.docs)==null?void 0:h.description}}},j.parameters={...j.parameters,docs:{...(g=j.parameters)==null?void 0:g.docs,source:{originalSource:`{
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
}`,...(_=j.parameters)==null||(_=_.docs)==null?void 0:_.source},description:{story:`Select with clear button enabled.`,...(v=j.parameters)==null||(v=v.docs)==null?void 0:v.description}}},M.parameters={...M.parameters,docs:{...(y=M.parameters)==null?void 0:y.docs,source:{originalSource:`{
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
}`,...(b=M.parameters)==null||(b=b.docs)==null?void 0:b.source},description:{story:`Select with custom placeholder text.`,...(x=M.parameters)==null||(x=x.docs)==null?void 0:x.description}}},N.parameters={...N.parameters,docs:{...(S=N.parameters)==null?void 0:S.docs,source:{originalSource:`{
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
}`,...(C=N.parameters)==null||(C=C.docs)==null?void 0:C.source},description:{story:`Select with many policy options.`,...(w=N.parameters)==null||(w=w.docs)==null?void 0:w.description}}},P=[`Default`,`Empty`,`Disabled`,`WithClearButton`,`WithCustomPlaceholder`,`ManyPolicies`]})))()}F();export{O as Default,A as Disabled,k as Empty,N as ManyPolicies,j as WithClearButton,M as WithCustomPlaceholder,P as __namedExportsOrder,D as default};