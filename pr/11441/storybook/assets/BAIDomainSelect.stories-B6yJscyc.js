import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t,t as n}from"./compact-C9OPbfhP.js";import{m as r,t as i}from"./hooks-DgO_LXe-.js";import{n as a,t as o}from"./map-IIuwj5IU.js";import{t as s}from"./jsx-runtime-MKhVqBIO.js";import{n as c,t as l}from"./useBAIi18n-CXS6vCcL.js";import{t as u}from"./react-relay-CDKBZFrB.js";import{n as d,t as f}from"./BAISelect-CkDr94W4.js";import{n as p,t as m}from"./RelayResolver-BK8h-MjU.js";var h;function g(){return(g=e((()=>{h=(function(){var e=[{defaultValue:null,kind:`LocalArgument`,name:`is_active`}],t=[{alias:null,args:[{kind:`Variable`,name:`is_active`,variableName:`is_active`}],concreteType:`Domain`,kind:`LinkedField`,name:`domains`,plural:!0,selections:[{alias:null,args:null,kind:`ScalarField`,name:`name`,storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:e,kind:`Fragment`,metadata:null,name:`BAIDomainSelectQuery`,selections:t,type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:e,kind:`Operation`,name:`BAIDomainSelectQuery`,selections:t},params:{cacheID:`57d026d6fa8a04c20ffa280feacb762f`,id:null,metadata:{},name:`BAIDomainSelectQuery`,operationKind:`query`,text:`query BAIDomainSelectQuery(
  $is_active: Boolean
) {
  domains(is_active: $is_active) {
    name
  }
}
`}}})(),h.hash=`dc51af30271ef1276b6aba8998bb5c1b`})))()}var _,v,y;function b(){return(b=e((()=>{g(),i(),l(),d(),o(),t(),_=u(),v=s(),y=({activeOnly:e=!0,...t})=>{let{t:i}=c(),[o,s]=r(t),{domains:l}=(0,_.useLazyLoadQuery)(h,{is_active:e},{fetchPolicy:`store-and-network`});return(0,v.jsx)(f,{placeholder:i(`comp:BAIDomainSelect.SelectDomain`),...t,value:o,onChange:e=>s(e),options:a(n(a(l,`name`)),e=>({label:e,value:e}))})}})))()}var x,S,C,w,T,E,D,O,k,A,j,M,N;function P(){return(P=e((()=>{p(),b(),x=s(),S=[{name:`default`},{name:`research`},{name:`production`}],C=[{name:`default`},{name:`research`},{name:`production`},{name:`archived-domain`},{name:`inactive-domain`}],w=Array.from({length:15},(e,t)=>({name:`domain-${t+1}`})),T={title:`Fragments/BAIDomainSelect`,component:y,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`
**BAIDomainSelect** extends [BAISelect](/?path=/docs/select-baiselect--docs) to fetch and display Backend.AI domains.

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

For all other props, refer to [BAISelect](/?path=/docs/select-baiselect--docs).
        `}}},argTypes:{activeOnly:{control:{type:`boolean`},description:`Filter to show only active domains`,table:{type:{summary:`boolean`},defaultValue:{summary:`true`}}},placeholder:{control:{type:`text`},description:`Placeholder text when no value is selected`,table:{type:{summary:`string`}}},disabled:{control:{type:`boolean`},description:`Whether the select is disabled`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},hasClear:{control:{type:`boolean`},description:`Show clear button`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},onChange:{action:`changed`,description:`Callback when selection changes`}}},E={name:`Basic`,parameters:{docs:{description:{story:`Basic usage with activeOnly=true (default), showing 3 active domains.`}}},args:{activeOnly:!0},render:e=>(0,x.jsx)(m,{mockResolvers:{Query:()=>({domains:S})},children:(0,x.jsx)(y,{...e,width:300})})},D={name:`AllDomains`,parameters:{docs:{description:{story:`With activeOnly=false, displays all domains including inactive ones (5 total domains).`}}},args:{activeOnly:!1},render:e=>(0,x.jsx)(m,{mockResolvers:{Query:()=>({domains:C})},children:(0,x.jsx)(y,{...e,width:300})})},O={name:`EmptyState`,parameters:{docs:{description:{story:`Shows the component when no domains are returned from the API.`}}},render:e=>(0,x.jsx)(m,{mockResolvers:{Query:()=>({domains:[]})},children:(0,x.jsx)(y,{...e,width:300})})},k={name:`DisabledState`,parameters:{docs:{description:{story:`Shows the component in a disabled state where users cannot interact with it.`}}},args:{disabled:!0},render:e=>(0,x.jsx)(m,{mockResolvers:{Query:()=>({domains:S})},children:(0,x.jsx)(y,{...e,width:300})})},A={name:`ClearButton`,parameters:{docs:{description:{story:`Select with hasClear enabled, allowing users to clear their selection.`}}},args:{hasClear:!0},render:e=>(0,x.jsx)(m,{mockResolvers:{Query:()=>({domains:S})},children:(0,x.jsx)(y,{...e,width:300})})},j={name:`CustomPlaceholder`,parameters:{docs:{description:{story:`Demonstrates using a custom placeholder instead of the default.`}}},args:{placeholder:`Choose a domain...`},render:e=>(0,x.jsx)(m,{mockResolvers:{Query:()=>({domains:S})},children:(0,x.jsx)(y,{...e,width:300})})},M={name:`ManyOptions`,parameters:{docs:{description:{story:`Demonstrates the component with a large number of domains, showing scrollable dropdown behavior with search.`}}},args:{hasClear:!0},render:e=>(0,x.jsx)(m,{mockResolvers:{Query:()=>({domains:w})},children:(0,x.jsx)(y,{...e,width:300})})},N=[`Default`,`AllDomains`,`Empty`,`Disabled`,`WithClearButton`,`WithCustomPlaceholder`,`ManyDomains`],E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
      <BAIDomainSelect {...args} width={300} />
    </RelayResolver>
}`,...E.parameters?.docs?.source},description:{story:`Basic usage showing only active domains (default behavior).`,...E.parameters?.docs?.description}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
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
      <BAIDomainSelect {...args} width={300} />
    </RelayResolver>
}`,...D.parameters?.docs?.source},description:{story:`Shows all domains including inactive ones.`,...D.parameters?.docs?.description}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
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
      <BAIDomainSelect {...args} width={300} />
    </RelayResolver>
}`,...O.parameters?.docs?.source},description:{story:`Empty state when no domains are available.`,...O.parameters?.docs?.description}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
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
      <BAIDomainSelect {...args} width={300} />
    </RelayResolver>
}`,...k.parameters?.docs?.source},description:{story:`Disabled state of the select.`,...k.parameters?.docs?.description}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  name: 'ClearButton',
  parameters: {
    docs: {
      description: {
        story: 'Select with hasClear enabled, allowing users to clear their selection.'
      }
    }
  },
  args: {
    hasClear: true
  },
  render: args => <RelayResolver mockResolvers={{
    Query: () => ({
      domains: sampleActiveDomains
    })
  }}>
      <BAIDomainSelect {...args} width={300} />
    </RelayResolver>
}`,...A.parameters?.docs?.source},description:{story:`Select with clear button enabled.`,...A.parameters?.docs?.description}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
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
      <BAIDomainSelect {...args} width={300} />
    </RelayResolver>
}`,...j.parameters?.docs?.source},description:{story:`Select with custom placeholder text.`,...j.parameters?.docs?.description}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  name: 'ManyOptions',
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the component with a large number of domains, showing scrollable dropdown behavior with search.'
      }
    }
  },
  args: {
    hasClear: true
  },
  render: args => <RelayResolver mockResolvers={{
    Query: () => ({
      domains: sampleManyDomains
    })
  }}>
      <BAIDomainSelect {...args} width={300} />
    </RelayResolver>
}`,...M.parameters?.docs?.source},description:{story:`Select with many domain options.`,...M.parameters?.docs?.description}}}})))()}P();export{D as AllDomains,E as Default,k as Disabled,O as Empty,M as ManyDomains,A as WithClearButton,j as WithCustomPlaceholder,N as __namedExportsOrder,T as default};