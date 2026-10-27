import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t,t as n}from"./compact-C9OPbfhP.js";import{n as r,t as i}from"./map-CLZMgxwS.js";import{t as a}from"./jsx-runtime-MKhVqBIO.js";import{n as o,t as s}from"./useBAIi18n-Biey1teG.js";import{t as c}from"./compiler-runtime-CdReTaax.js";import{t as l}from"./react-relay-sBALIJlt.js";import{n as u,t as d}from"./BAISelect-CgNx8uBa.js";import{n as f,t as p}from"./RelayResolver-CMrgwoPg.js";var m;function h(){return(h=e((()=>{m=(function(){var e=[{defaultValue:null,kind:`LocalArgument`,name:`filter`}],t=[{kind:`Variable`,name:`filter`,variableName:`filter`},{kind:`Literal`,name:`limit`,value:100},{kind:`Literal`,name:`orderBy`,value:[{direction:`ASC`,field:`NAME`}]}],n={alias:null,args:null,kind:`ScalarField`,name:`name`,storageKey:null};return{fragment:{argumentDefinitions:e,kind:`Fragment`,metadata:null,name:`BAIResourceGroupSelectQuery`,selections:[{alias:null,args:t,concreteType:`ResourceGroupConnection`,kind:`LinkedField`,name:`adminResourceGroups`,plural:!1,selections:[{alias:null,args:null,concreteType:`ResourceGroupEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`ResourceGroup`,kind:`LinkedField`,name:`node`,plural:!1,selections:[n],storageKey:null}],storageKey:null}],storageKey:null}],type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:e,kind:`Operation`,name:`BAIResourceGroupSelectQuery`,selections:[{alias:null,args:t,concreteType:`ResourceGroupConnection`,kind:`LinkedField`,name:`adminResourceGroups`,plural:!1,selections:[{alias:null,args:null,concreteType:`ResourceGroupEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`ResourceGroup`,kind:`LinkedField`,name:`node`,plural:!1,selections:[n,{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}]},params:{cacheID:`ccbeb1e0d742d5ecb1d403bebf4046be`,id:null,metadata:{},name:`BAIResourceGroupSelectQuery`,operationKind:`query`,text:`query BAIResourceGroupSelectQuery(
  $filter: ResourceGroupFilter
) {
  adminResourceGroups(filter: $filter, orderBy: [{field: NAME, direction: ASC}], limit: 100) {
    edges {
      node {
        name
        id
      }
    }
  }
}
`}}})(),m.hash=`401e1429387d38b178219ebb0a678556`})))()}function g(e){return e?.node?.name}function _(e){return{label:e,value:e,resourceGroup:e}}var v,y,b,x,S;function C(){return(C=e((()=>{h(),v=c(),s(),u(),t(),i(),y=l(),b=a(),x=e=>{"use memo";let t=(0,v.c)(4),i=e??null,a;t[0]===i?a=t[1]:(a={filter:i},t[0]=i,t[1]=a);let{adminResourceGroups:o}=(0,y.useLazyLoadQuery)(m,a),s;return t[2]===o?.edges?s=t[3]:(s=n(r(o?.edges,g)),t[2]=o?.edges,t[3]=s),s},S=e=>{"use memo";let t=(0,v.c)(11),n,i;t[0]===e?(n=t[1],i=t[2]):({filter:n,...i}=e,t[0]=e,t[1]=n,t[2]=i);let{t:a}=o(),s=x(n),c;t[3]===s?c=t[4]:(c=r(s,_),t[3]=s,t[4]=c);let l;t[5]===a?l=t[6]:(l=a(`comp:BAIResourceGroupSelect.SelectResourceGroup`),t[5]=a,t[6]=l);let u;return t[7]!==i||t[8]!==c||t[9]!==l?(u=(0,b.jsx)(d,{options:c,showSearch:!0,placeholder:l,...i}),t[7]=i,t[8]=c,t[9]=l,t[10]=u):u=t[10],u}})))()}var w,T,E,D,O,k,A,j,M,N,P,F;function I(){return(I=e((()=>{f(),C(),w=a(),T=[{name:`default`},{name:`gpu-cluster`},{name:`cpu-only`},{name:`high-memory`},{name:`storage-optimized`}],E=Array.from({length:15},(e,t)=>({name:`resource-group-${t+1}`})),D=e=>({edges:e.map(e=>({node:{id:e.name,...e}}))}),O={title:`Fragments/BAIResourceGroupSelect`,component:S,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`
**BAIResourceGroupSelect** extends [BAISelect](/?path=/docs/components-input-baiselect--docs) to fetch and display resource groups at admin scope.

## Features
- Fetches resource groups from GraphQL query \`BAIResourceGroupSelectQuery\` (\`adminResourceGroups\`, manager 26.2.0+)
- Optional \`filter\` prop narrows the list server-side (\`isActive\`, \`isPublic\`)
- Ordered by name, capped at 100 groups
- Built-in search functionality enabled by default
- Internationalized placeholder using \`comp:BAIResourceGroupSelect.SelectResourceGroup\`
- Uses resource group \`name\` as both label and value
- \`useResourceGroupNames(filter)\` exposes the same list to a parent that needs it during render

## GraphQL Query
\`\`\`graphql
query BAIResourceGroupSelectQuery($filter: ResourceGroupFilter) {
  adminResourceGroups(
    filter: $filter
    orderBy: [{ field: NAME, direction: ASC }]
    limit: 100
  ) {
    edges {
      node {
        name
      }
    }
  }
}
\`\`\`

## Usage
\`\`\`tsx
<BAIResourceGroupSelect
  onChange={(value) => console.log(value)}
/>
\`\`\`

For all other props, refer to [BAISelect](/?path=/docs/components-input-baiselect--docs).
        `}}},argTypes:{placeholder:{control:{type:`text`},description:`Placeholder text when no value is selected`,table:{type:{summary:`string`},defaultValue:{summary:`i18n: comp:BAIResourceGroupSelect.SelectResourceGroup`}}},disabled:{control:{type:`boolean`},description:`Whether the select is disabled`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},allowClear:{control:{type:`boolean`},description:`Show clear button`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},onChange:{action:`changed`,description:`Callback when selection changes`}}},k={name:`Basic`,parameters:{docs:{description:{story:`Basic usage showing 5 resource groups. Search functionality is enabled by default, and placeholder is internationalized.`}}},args:{},render:e=>(0,w.jsx)(p,{mockResolvers:{Query:()=>({adminResourceGroups:D(T)})},children:(0,w.jsx)(S,{...e,style:{width:`300px`}})})},A={name:`EmptyState`,parameters:{docs:{description:{story:`Shows the component when no resource groups are configured.`}}},args:{},render:e=>(0,w.jsx)(p,{mockResolvers:{Query:()=>({adminResourceGroups:D([])})},children:(0,w.jsx)(S,{...e,style:{width:`300px`}})})},j={name:`DisabledState`,parameters:{docs:{description:{story:`Shows the component in a disabled state where users cannot interact with it.`}}},args:{disabled:!0},render:e=>(0,w.jsx)(p,{mockResolvers:{Query:()=>({adminResourceGroups:D(T)})},children:(0,w.jsx)(S,{...e,style:{width:`300px`}})})},M={name:`ClearButton`,parameters:{docs:{description:{story:`Select with allowClear enabled, allowing users to clear their selection.`}}},args:{allowClear:!0},render:e=>(0,w.jsx)(p,{mockResolvers:{Query:()=>({adminResourceGroups:D(T)})},children:(0,w.jsx)(S,{...e,style:{width:`300px`}})})},N={name:`CustomPlaceholder`,parameters:{docs:{description:{story:`Demonstrates overriding the default internationalized placeholder.`}}},args:{placeholder:`Choose a resource group...`},render:e=>(0,w.jsx)(p,{mockResolvers:{Query:()=>({adminResourceGroups:D(T)})},children:(0,w.jsx)(S,{...e,style:{width:`300px`}})})},P={name:`ManyOptions`,parameters:{docs:{description:{story:`Demonstrates the component with 15 resource groups, showing scrollable dropdown with search functionality.`}}},args:{allowClear:!0},render:e=>(0,w.jsx)(p,{mockResolvers:{Query:()=>({adminResourceGroups:D(E)})},children:(0,w.jsx)(S,{...e,style:{width:`300px`}})})},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'Basic usage showing 5 resource groups. Search functionality is enabled by default, and placeholder is internationalized.'
      }
    }
  },
  args: {},
  render: args => <RelayResolver mockResolvers={{
    Query: () => ({
      adminResourceGroups: asConnection(sampleResourceGroups)
    })
  }}>
      <BAIResourceGroupSelect {...args} style={{
      width: '300px'
    }} />
    </RelayResolver>
}`,...k.parameters?.docs?.source},description:{story:`Basic usage with 5 sample resource groups.`,...k.parameters?.docs?.description}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  name: 'EmptyState',
  parameters: {
    docs: {
      description: {
        story: 'Shows the component when no resource groups are configured.'
      }
    }
  },
  args: {},
  render: args => <RelayResolver mockResolvers={{
    Query: () => ({
      adminResourceGroups: asConnection([])
    })
  }}>
      <BAIResourceGroupSelect {...args} style={{
      width: '300px'
    }} />
    </RelayResolver>
}`,...A.parameters?.docs?.source},description:{story:`Empty state when no resource groups are available.`,...A.parameters?.docs?.description}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
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
      adminResourceGroups: asConnection(sampleResourceGroups)
    })
  }}>
      <BAIResourceGroupSelect {...args} style={{
      width: '300px'
    }} />
    </RelayResolver>
}`,...j.parameters?.docs?.source},description:{story:`Disabled state of the select.`,...j.parameters?.docs?.description}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
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
      adminResourceGroups: asConnection(sampleResourceGroups)
    })
  }}>
      <BAIResourceGroupSelect {...args} style={{
      width: '300px'
    }} />
    </RelayResolver>
}`,...M.parameters?.docs?.source},description:{story:`Select with clear button enabled.`,...M.parameters?.docs?.description}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  name: 'CustomPlaceholder',
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates overriding the default internationalized placeholder.'
      }
    }
  },
  args: {
    placeholder: 'Choose a resource group...'
  },
  render: args => <RelayResolver mockResolvers={{
    Query: () => ({
      adminResourceGroups: asConnection(sampleResourceGroups)
    })
  }}>
      <BAIResourceGroupSelect {...args} style={{
      width: '300px'
    }} />
    </RelayResolver>
}`,...N.parameters?.docs?.source},description:{story:`Select with custom placeholder text.`,...N.parameters?.docs?.description}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  name: 'ManyOptions',
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the component with 15 resource groups, showing scrollable dropdown with search functionality.'
      }
    }
  },
  args: {
    allowClear: true
  },
  render: args => <RelayResolver mockResolvers={{
    Query: () => ({
      adminResourceGroups: asConnection(sampleManyResourceGroups)
    })
  }}>
      <BAIResourceGroupSelect {...args} style={{
      width: '300px'
    }} />
    </RelayResolver>
}`,...P.parameters?.docs?.source},description:{story:`Select with many resource group options.`,...P.parameters?.docs?.description}}},F=[`Default`,`Empty`,`Disabled`,`WithClearButton`,`WithCustomPlaceholder`,`ManyResourceGroups`]})))()}I();export{k as Default,j as Disabled,A as Empty,P as ManyResourceGroups,M as WithClearButton,N as WithCustomPlaceholder,F as __namedExportsOrder,O as default};