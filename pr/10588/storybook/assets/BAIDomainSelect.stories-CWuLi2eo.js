import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{m as t,t as n}from"./hooks-C37w8Ol6.js";import{n as r,t as i}from"./map-CLZMgxwS.js";import{t as a}from"./jsx-runtime-MKhVqBIO.js";import{n as o,t as s}from"./useBAIi18n-Biey1teG.js";import{t as c}from"./react-relay-sBALIJlt.js";import{n as l,t as u}from"./BAISelect-CgNx8uBa.js";import{n as d,t as f}from"./RelayResolver-CMrgwoPg.js";var p;function m(){return(m=e((()=>{p=(function(){var e=[{defaultValue:null,kind:`LocalArgument`,name:`is_active`}],t=[{alias:null,args:[{kind:`Variable`,name:`is_active`,variableName:`is_active`}],concreteType:`Domain`,kind:`LinkedField`,name:`domains`,plural:!0,selections:[{alias:null,args:null,kind:`ScalarField`,name:`name`,storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:e,kind:`Fragment`,metadata:null,name:`BAIDomainSelectQuery`,selections:t,type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:e,kind:`Operation`,name:`BAIDomainSelectQuery`,selections:t},params:{cacheID:`57d026d6fa8a04c20ffa280feacb762f`,id:null,metadata:{},name:`BAIDomainSelectQuery`,operationKind:`query`,text:`query BAIDomainSelectQuery(
  $is_active: Boolean
) {
  domains(is_active: $is_active) {
    name
  }
}
`}}})(),p.hash=`dc51af30271ef1276b6aba8998bb5c1b`})))()}var h,g,_;function v(){return(v=e((()=>{m(),n(),s(),l(),i(),h=c(),g=a(),_=({activeOnly:e=!0,...n})=>{let{t:i}=o(),[a,s]=t(n),{domains:c}=(0,h.useLazyLoadQuery)(p,{is_active:e},{fetchPolicy:`store-and-network`});return(0,g.jsx)(u,{placeholder:i(`comp:BAIDomainSelect.SelectDomain`),...n,value:a,onChange:(e,t)=>{s(e,t)},options:r(c,e=>({label:e?.name,value:e?.name}))})}})))()}var y,b,x,S,C,w,T,E,D,O,k,A,j;function M(){return(M=e((()=>{d(),v(),y=a(),b=[{name:`default`},{name:`research`},{name:`production`}],x=[{name:`default`},{name:`research`},{name:`production`},{name:`archived-domain`},{name:`inactive-domain`}],S=Array.from({length:15},(e,t)=>({name:`domain-${t+1}`})),C={title:`Fragments/BAIDomainSelect`,component:_,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`
**BAIDomainSelect** extends [Ant Design Select](https://ant.design/components/select) to fetch and display Backend.AI domains.

## BAI-Specific Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| \`activeOnly\` | \`boolean\` | \`true\` | Filter to show only active domains |

## Features
- Fetches domains from GraphQL query \`BAIDomainSelectQuery\`
- Automatically filters active/inactive domains based on \`activeOnly\` prop
- Built-in placeholder with i18n support
- Uses \`fetchPolicy: 'store-and-network'\` for data freshness

## GraphQL Query
\`\`\`graphql
query BAIDomainSelectQuery($is_active: Boolean) {
  domains(is_active: $is_active) {
    name
  }
}
\`\`\`

## Usage
\`\`\`tsx
<BAIDomainSelect
  activeOnly={true}
  placeholder="Select a domain"
  onChange={(value) => console.log(value)}
/>
\`\`\`

For all other props, refer to [Ant Design Select](https://ant.design/components/select).
        `}}},argTypes:{activeOnly:{control:{type:`boolean`},description:`Filter to show only active domains`,table:{type:{summary:`boolean`},defaultValue:{summary:`true`}}},placeholder:{control:{type:`text`},description:`Placeholder text when no value is selected`,table:{type:{summary:`string`}}},disabled:{control:{type:`boolean`},description:`Whether the select is disabled`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},allowClear:{control:{type:`boolean`},description:`Show clear button`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},onChange:{action:`changed`,description:`Callback when selection changes`}}},w={name:`Basic`,parameters:{docs:{description:{story:`Basic usage with activeOnly=true (default), showing 3 active domains.`}}},args:{activeOnly:!0},render:e=>(0,y.jsx)(f,{mockResolvers:{Query:()=>({domains:b})},children:(0,y.jsx)(_,{...e,style:{width:`300px`}})})},T={name:`AllDomains`,parameters:{docs:{description:{story:`With activeOnly=false, displays all domains including inactive ones (5 total domains).`}}},args:{activeOnly:!1},render:e=>(0,y.jsx)(f,{mockResolvers:{Query:()=>({domains:x})},children:(0,y.jsx)(_,{...e,style:{width:`300px`}})})},E={name:`EmptyState`,parameters:{docs:{description:{story:`Shows the component when no domains are returned from the API.`}}},render:e=>(0,y.jsx)(f,{mockResolvers:{Query:()=>({domains:[]})},children:(0,y.jsx)(_,{...e,style:{width:`300px`}})})},D={name:`DisabledState`,parameters:{docs:{description:{story:`Shows the component in a disabled state where users cannot interact with it.`}}},args:{disabled:!0},render:e=>(0,y.jsx)(f,{mockResolvers:{Query:()=>({domains:b})},children:(0,y.jsx)(_,{...e,style:{width:`300px`}})})},O={name:`ClearButton`,parameters:{docs:{description:{story:`Select with allowClear enabled, allowing users to clear their selection.`}}},args:{allowClear:!0},render:e=>(0,y.jsx)(f,{mockResolvers:{Query:()=>({domains:b})},children:(0,y.jsx)(_,{...e,style:{width:`300px`}})})},k={name:`CustomPlaceholder`,parameters:{docs:{description:{story:`Demonstrates using a custom placeholder instead of the default.`}}},args:{placeholder:`Choose a domain...`},render:e=>(0,y.jsx)(f,{mockResolvers:{Query:()=>({domains:b})},children:(0,y.jsx)(_,{...e,style:{width:`300px`}})})},A={name:`ManyOptions`,parameters:{docs:{description:{story:`Demonstrates the component with a large number of domains, showing scrollable dropdown behavior.`}}},args:{showSearch:!0,allowClear:!0},render:e=>(0,y.jsx)(f,{mockResolvers:{Query:()=>({domains:S})},children:(0,y.jsx)(_,{...e,style:{width:`300px`}})})},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'Basic usage with activeOnly=true (default), showing 3 active domains.'
      }
    }
  },
  args: {
    activeOnly: true
  },
  render: args => <RelayResolver mockResolvers={{
    Query: () => ({
      domains: sampleActiveDomains
    })
  }}>
      <BAIDomainSelect {...args} style={{
      width: '300px'
    }} />
    </RelayResolver>
}`,...w.parameters?.docs?.source},description:{story:`Basic usage showing only active domains (default behavior).`,...w.parameters?.docs?.description}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  name: 'AllDomains',
  parameters: {
    docs: {
      description: {
        story: 'With activeOnly=false, displays all domains including inactive ones (5 total domains).'
      }
    }
  },
  args: {
    activeOnly: false
  },
  render: args => <RelayResolver mockResolvers={{
    Query: () => ({
      domains: sampleAllDomains
    })
  }}>
      <BAIDomainSelect {...args} style={{
      width: '300px'
    }} />
    </RelayResolver>
}`,...T.parameters?.docs?.source},description:{story:`Shows all domains including inactive ones.`,...T.parameters?.docs?.description}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  name: 'EmptyState',
  parameters: {
    docs: {
      description: {
        story: 'Shows the component when no domains are returned from the API.'
      }
    }
  },
  render: args => <RelayResolver mockResolvers={{
    Query: () => ({
      domains: []
    })
  }}>
      <BAIDomainSelect {...args} style={{
      width: '300px'
    }} />
    </RelayResolver>
}`,...E.parameters?.docs?.source},description:{story:`Empty state when no domains are available.`,...E.parameters?.docs?.description}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
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
      domains: sampleActiveDomains
    })
  }}>
      <BAIDomainSelect {...args} style={{
      width: '300px'
    }} />
    </RelayResolver>
}`,...D.parameters?.docs?.source},description:{story:`Disabled state of the select.`,...D.parameters?.docs?.description}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
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
      domains: sampleActiveDomains
    })
  }}>
      <BAIDomainSelect {...args} style={{
      width: '300px'
    }} />
    </RelayResolver>
}`,...O.parameters?.docs?.source},description:{story:`Select with clear button enabled.`,...O.parameters?.docs?.description}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  name: 'CustomPlaceholder',
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates using a custom placeholder instead of the default.'
      }
    }
  },
  args: {
    placeholder: 'Choose a domain...'
  },
  render: args => <RelayResolver mockResolvers={{
    Query: () => ({
      domains: sampleActiveDomains
    })
  }}>
      <BAIDomainSelect {...args} style={{
      width: '300px'
    }} />
    </RelayResolver>
}`,...k.parameters?.docs?.source},description:{story:`Select with custom placeholder text.`,...k.parameters?.docs?.description}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  name: 'ManyOptions',
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the component with a large number of domains, showing scrollable dropdown behavior.'
      }
    }
  },
  args: {
    showSearch: true,
    allowClear: true
  },
  render: args => <RelayResolver mockResolvers={{
    Query: () => ({
      domains: sampleManyDomains
    })
  }}>
      <BAIDomainSelect {...args} style={{
      width: '300px'
    }} />
    </RelayResolver>
}`,...A.parameters?.docs?.source},description:{story:`Select with many domain options.`,...A.parameters?.docs?.description}}},j=[`Default`,`AllDomains`,`Empty`,`Disabled`,`WithClearButton`,`WithCustomPlaceholder`,`ManyDomains`]})))()}M();export{T as AllDomains,w as Default,D as Disabled,E as Empty,A as ManyDomains,O as WithClearButton,k as WithCustomPlaceholder,j as __namedExportsOrder,C as default};