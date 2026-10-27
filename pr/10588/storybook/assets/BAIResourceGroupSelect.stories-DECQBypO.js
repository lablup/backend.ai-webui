import{n as e}from"./rolldown-runtime-2s6bX4vc.js";import{n as t,t as n}from"./compact-BqEdnGyS.js";import{n as r,t as i}from"./map-CIqW7OVA.js";import{n as a,t as o}from"./useBAIi18n-BoXCk5K0.js";import{n as s,t as c}from"./BAISelect-Dty2gXL7.js";import{n as l,t as u}from"./RelayResolver-b1nJU57O.js";import{jsx as d}from"react/jsx-runtime";import{c as f}from"react/compiler-runtime";import{useLazyLoadQuery as p}from"react-relay";var m;function h(){return(h=e((()=>{m=(function(){var e=[{defaultValue:null,kind:`LocalArgument`,name:`filter`}],t=[{kind:`Variable`,name:`filter`,variableName:`filter`},{kind:`Literal`,name:`limit`,value:100},{kind:`Literal`,name:`orderBy`,value:[{direction:`ASC`,field:`NAME`}]}],n={alias:null,args:null,kind:`ScalarField`,name:`name`,storageKey:null};return{fragment:{argumentDefinitions:e,kind:`Fragment`,metadata:null,name:`BAIResourceGroupSelectQuery`,selections:[{alias:null,args:t,concreteType:`ResourceGroupConnection`,kind:`LinkedField`,name:`adminResourceGroups`,plural:!1,selections:[{alias:null,args:null,concreteType:`ResourceGroupEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`ResourceGroup`,kind:`LinkedField`,name:`node`,plural:!1,selections:[n],storageKey:null}],storageKey:null}],storageKey:null}],type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:e,kind:`Operation`,name:`BAIResourceGroupSelectQuery`,selections:[{alias:null,args:t,concreteType:`ResourceGroupConnection`,kind:`LinkedField`,name:`adminResourceGroups`,plural:!1,selections:[{alias:null,args:null,concreteType:`ResourceGroupEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`ResourceGroup`,kind:`LinkedField`,name:`node`,plural:!1,selections:[n,{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}]},params:{cacheID:`ccbeb1e0d742d5ecb1d403bebf4046be`,id:null,metadata:{},name:`BAIResourceGroupSelectQuery`,operationKind:`query`,text:`query BAIResourceGroupSelectQuery(
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
`}}})(),m.hash=`401e1429387d38b178219ebb0a678556`})))()}function g(e){return e?.node?.name}function _(e){return{label:e,value:e,resourceGroup:e}}var v,y;function b(){return(b=e((()=>{h(),o(),s(),t(),i(),v=e=>{"use memo";let t=f(4),i=e??null,a;t[0]===i?a=t[1]:(a={filter:i},t[0]=i,t[1]=a);let{adminResourceGroups:o}=p(m,a),s;return t[2]===o?.edges?s=t[3]:(s=n(r(o?.edges,g)),t[2]=o?.edges,t[3]=s),s},y=e=>{"use memo";let t=f(11),n,i;t[0]===e?(n=t[1],i=t[2]):({filter:n,...i}=e,t[0]=e,t[1]=n,t[2]=i);let{t:o}=a(),s=v(n),l;t[3]===s?l=t[4]:(l=r(s,_),t[3]=s,t[4]=l);let u;t[5]===o?u=t[6]:(u=o(`comp:BAIResourceGroupSelect.SelectResourceGroup`),t[5]=o,t[6]=u);let p;return t[7]!==i||t[8]!==l||t[9]!==u?(p=d(c,{options:l,showSearch:!0,placeholder:u,...i}),t[7]=i,t[8]=l,t[9]=u,t[10]=p):p=t[10],p}})))()}var x,S,C,w,T,E,D,O,k,A,j;function M(){return(M=e((()=>{l(),b(),x=[{name:`default`},{name:`gpu-cluster`},{name:`cpu-only`},{name:`high-memory`},{name:`storage-optimized`}],S=Array.from({length:15},(e,t)=>({name:`resource-group-${t+1}`})),C=e=>({edges:e.map(e=>({node:{id:e.name,...e}}))}),w={title:`Fragments/BAIResourceGroupSelect`,component:y,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`
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
        `}}},argTypes:{placeholder:{control:{type:`text`},description:`Placeholder text when no value is selected`,table:{type:{summary:`string`},defaultValue:{summary:`i18n: comp:BAIResourceGroupSelect.SelectResourceGroup`}}},disabled:{control:{type:`boolean`},description:`Whether the select is disabled`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},allowClear:{control:{type:`boolean`},description:`Show clear button`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},onChange:{action:`changed`,description:`Callback when selection changes`}}},T={name:`Basic`,parameters:{docs:{description:{story:`Basic usage showing 5 resource groups. Search functionality is enabled by default, and placeholder is internationalized.`}}},args:{},render:e=>d(u,{mockResolvers:{Query:()=>({adminResourceGroups:C(x)})},children:d(y,{...e,style:{width:`300px`}})})},E={name:`EmptyState`,parameters:{docs:{description:{story:`Shows the component when no resource groups are configured.`}}},args:{},render:e=>d(u,{mockResolvers:{Query:()=>({adminResourceGroups:C([])})},children:d(y,{...e,style:{width:`300px`}})})},D={name:`DisabledState`,parameters:{docs:{description:{story:`Shows the component in a disabled state where users cannot interact with it.`}}},args:{disabled:!0},render:e=>d(u,{mockResolvers:{Query:()=>({adminResourceGroups:C(x)})},children:d(y,{...e,style:{width:`300px`}})})},O={name:`ClearButton`,parameters:{docs:{description:{story:`Select with allowClear enabled, allowing users to clear their selection.`}}},args:{allowClear:!0},render:e=>d(u,{mockResolvers:{Query:()=>({adminResourceGroups:C(x)})},children:d(y,{...e,style:{width:`300px`}})})},k={name:`CustomPlaceholder`,parameters:{docs:{description:{story:`Demonstrates overriding the default internationalized placeholder.`}}},args:{placeholder:`Choose a resource group...`},render:e=>d(u,{mockResolvers:{Query:()=>({adminResourceGroups:C(x)})},children:d(y,{...e,style:{width:`300px`}})})},A={name:`ManyOptions`,parameters:{docs:{description:{story:`Demonstrates the component with 15 resource groups, showing scrollable dropdown with search functionality.`}}},args:{allowClear:!0},render:e=>d(u,{mockResolvers:{Query:()=>({adminResourceGroups:C(S)})},children:d(y,{...e,style:{width:`300px`}})})},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
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
}`,...T.parameters?.docs?.source},description:{story:`Basic usage with 5 sample resource groups.`,...T.parameters?.docs?.description}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
}`,...E.parameters?.docs?.source},description:{story:`Empty state when no resource groups are available.`,...E.parameters?.docs?.description}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
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
      adminResourceGroups: asConnection(sampleResourceGroups)
    })
  }}>
      <BAIResourceGroupSelect {...args} style={{
      width: '300px'
    }} />
    </RelayResolver>
}`,...O.parameters?.docs?.source},description:{story:`Select with clear button enabled.`,...O.parameters?.docs?.description}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
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
}`,...k.parameters?.docs?.source},description:{story:`Select with custom placeholder text.`,...k.parameters?.docs?.description}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
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
}`,...A.parameters?.docs?.source},description:{story:`Select with many resource group options.`,...A.parameters?.docs?.description}}},j=[`Default`,`Empty`,`Disabled`,`WithClearButton`,`WithCustomPlaceholder`,`ManyResourceGroups`]})))()}M();export{T as Default,D as Disabled,E as Empty,A as ManyResourceGroups,O as WithClearButton,k as WithCustomPlaceholder,j as __namedExportsOrder,w as default};