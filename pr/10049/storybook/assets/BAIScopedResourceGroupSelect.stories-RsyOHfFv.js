import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t,t as n}from"./compact-C9OPbfhP.js";import{n as r,t as i}from"./map-BLzs52H1.js";import{t as a}from"./jsx-runtime-MKhVqBIO.js";import{n as o,t as s}from"./useBAIi18n-pdm_isgO.js";import{t as c}from"./compiler-runtime-DU4U6aph.js";import{t as l}from"./react-relay-sHama7hJ.js";import{n as u,t as d}from"./BAISelect-BRP3fa7i.js";import{n as f,t as p}from"./RelayResolver-BnFyFQJn.js";var m;function h(){return(h=e((()=>{m=(function(){var e={defaultValue:null,kind:`LocalArgument`,name:`filter`},t={defaultValue:null,kind:`LocalArgument`,name:`scope`},n=[{kind:`Variable`,name:`filter`,variableName:`filter`},{kind:`Literal`,name:`limit`,value:100},{kind:`Literal`,name:`orderBy`,value:[{direction:`ASC`,field:`NAME`}]},{kind:`Variable`,name:`scope`,variableName:`scope`}],r={alias:null,args:null,kind:`ScalarField`,name:`name`,storageKey:null};return{fragment:{argumentDefinitions:[e,t],kind:`Fragment`,metadata:null,name:`BAIScopedResourceGroupSelectQuery`,selections:[{alias:null,args:n,concreteType:`ResourceGroupConnection`,kind:`LinkedField`,name:`scopedResourceGroups`,plural:!1,selections:[{alias:null,args:null,concreteType:`ResourceGroupEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`ResourceGroup`,kind:`LinkedField`,name:`node`,plural:!1,selections:[r],storageKey:null}],storageKey:null}],storageKey:null}],type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[t,e],kind:`Operation`,name:`BAIScopedResourceGroupSelectQuery`,selections:[{alias:null,args:n,concreteType:`ResourceGroupConnection`,kind:`LinkedField`,name:`scopedResourceGroups`,plural:!1,selections:[{alias:null,args:null,concreteType:`ResourceGroupEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`ResourceGroup`,kind:`LinkedField`,name:`node`,plural:!1,selections:[r,{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}]},params:{cacheID:`b89ae9ea8eecb7f51921bfa05c94f5c8`,id:null,metadata:{},name:`BAIScopedResourceGroupSelectQuery`,operationKind:`query`,text:`query BAIScopedResourceGroupSelectQuery(
  $scope: ResourceGroupScope!
  $filter: ResourceGroupFilter
) {
  scopedResourceGroups(scope: $scope, filter: $filter, orderBy: [{field: NAME, direction: ASC}], limit: 100) {
    edges {
      node {
        name
        id
      }
    }
  }
}
`}}})(),m.hash=`b1c8fb072a583117bb5851f845807b45`})))()}function ee(e){var t;return e==null||(t=e.node)==null?void 0:t.name}function g(e){return{label:e,value:e,resourceGroup:e}}var _,v,y,b,x;function S(){return(S=e((()=>{h(),_=c(),s(),u(),t(),i(),v=l(),y=a(),b=(e,t)=>{"use memo";let i=(0,_.c)(5),a=t??null,o;i[0]!==e||i[1]!==a?(o={scope:e,filter:a},i[0]=e,i[1]=a,i[2]=o):o=i[2];let{scopedResourceGroups:s}=(0,v.useLazyLoadQuery)(m,o),c;return i[3]===(s==null?void 0:s.edges)?c=i[4]:(c=n(r(s==null?void 0:s.edges,ee)),i[3]=s==null?void 0:s.edges,i[4]=c),c},x=e=>{"use memo";let t=(0,_.c)(12),n,i,a;t[0]===e?(n=t[1],i=t[2],a=t[3]):({scope:i,filter:n,...a}=e,t[0]=e,t[1]=n,t[2]=i,t[3]=a);let{t:s}=o(),c=b(i,n),l;t[4]===c?l=t[5]:(l=r(c,g),t[4]=c,t[5]=l);let u;t[6]===s?u=t[7]:(u=s(`comp:BAIResourceGroupSelect.SelectResourceGroup`),t[6]=s,t[7]=u);let f;return t[8]!==a||t[9]!==l||t[10]!==u?(f=(0,y.jsx)(d,{options:l,showSearch:!0,placeholder:u,...a}),t[8]=a,t[9]=l,t[10]=u,t[11]=f):f=t[11],f}})))()}var C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q;function $(){return($=e((()=>{f(),S(),C=a(),H=[{name:`default`},{name:`gpu-cluster`},{name:`cpu-only`},{name:`high-memory`},{name:`storage-optimized`}],U=Array.from({length:15},(e,t)=>({name:`resource-group-${t+1}`})),W=e=>({edges:e.map(e=>({node:{id:e.name,...e}}))}),G={title:`Fragments/BAIScopedResourceGroupSelect`,component:x,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`
**BAIScopedResourceGroupSelect** extends [BAISelect](/?path=/docs/components-input-baiselect--docs) to fetch and display resource groups at admin scope.

## Features
- Fetches resource groups from GraphQL query \`BAIScopedResourceGroupSelectQuery\` (\`adminResourceGroups\`, manager 26.2.0+)
- Optional \`filter\` prop narrows the list server-side (\`isActive\`, \`isPublic\`)
- Ordered by name, capped at 100 groups
- Built-in search functionality enabled by default
- Internationalized placeholder using \`comp:BAIResourceGroupSelect.SelectResourceGroup\`
- Uses resource group \`name\` as both label and value
- \`useScopedResourceGroupNames(filter)\` exposes the same list to a parent that needs it during render

## GraphQL Query
\`\`\`graphql
query BAIScopedResourceGroupSelectQuery($filter: ResourceGroupFilter) {
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
<BAIScopedResourceGroupSelect
  onChange={(value) => console.log(value)}
/>
\`\`\`

For all other props, refer to [BAISelect](/?path=/docs/components-input-baiselect--docs).
        `}}},argTypes:{placeholder:{control:{type:`text`},description:`Placeholder text when no value is selected`,table:{type:{summary:`string`},defaultValue:{summary:`i18n: comp:BAIResourceGroupSelect.SelectResourceGroup`}}},disabled:{control:{type:`boolean`},description:`Whether the select is disabled`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},allowClear:{control:{type:`boolean`},description:`Show clear button`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},onChange:{action:`changed`,description:`Callback when selection changes`}}},K={name:`Basic`,parameters:{docs:{description:{story:`Basic usage showing 5 resource groups. Search functionality is enabled by default, and placeholder is internationalized.`}}},args:{},render:e=>(0,C.jsx)(p,{mockResolvers:{Query:()=>({adminResourceGroups:W(H)})},children:(0,C.jsx)(x,{...e,style:{width:`300px`}})})},q={name:`EmptyState`,parameters:{docs:{description:{story:`Shows the component when no resource groups are configured.`}}},args:{},render:e=>(0,C.jsx)(p,{mockResolvers:{Query:()=>({adminResourceGroups:W([])})},children:(0,C.jsx)(x,{...e,style:{width:`300px`}})})},J={name:`DisabledState`,parameters:{docs:{description:{story:`Shows the component in a disabled state where users cannot interact with it.`}}},args:{disabled:!0},render:e=>(0,C.jsx)(p,{mockResolvers:{Query:()=>({adminResourceGroups:W(H)})},children:(0,C.jsx)(x,{...e,style:{width:`300px`}})})},Y={name:`ClearButton`,parameters:{docs:{description:{story:`Select with allowClear enabled, allowing users to clear their selection.`}}},args:{allowClear:!0},render:e=>(0,C.jsx)(p,{mockResolvers:{Query:()=>({adminResourceGroups:W(H)})},children:(0,C.jsx)(x,{...e,style:{width:`300px`}})})},X={name:`CustomPlaceholder`,parameters:{docs:{description:{story:`Demonstrates overriding the default internationalized placeholder.`}}},args:{placeholder:`Choose a resource group...`},render:e=>(0,C.jsx)(p,{mockResolvers:{Query:()=>({adminResourceGroups:W(H)})},children:(0,C.jsx)(x,{...e,style:{width:`300px`}})})},Z={name:`ManyOptions`,parameters:{docs:{description:{story:`Demonstrates the component with 15 resource groups, showing scrollable dropdown with search functionality.`}}},args:{allowClear:!0},render:e=>(0,C.jsx)(p,{mockResolvers:{Query:()=>({adminResourceGroups:W(U)})},children:(0,C.jsx)(x,{...e,style:{width:`300px`}})})},K.parameters={...K.parameters,docs:{...(w=K.parameters)==null?void 0:w.docs,source:{originalSource:`{
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
      <BAIScopedResourceGroupSelect {...args} style={{
      width: '300px'
    }} />
    </RelayResolver>
}`,...(T=K.parameters)==null||(T=T.docs)==null?void 0:T.source},description:{story:`Basic usage with 5 sample resource groups.`,...(E=K.parameters)==null||(E=E.docs)==null?void 0:E.description}}},q.parameters={...q.parameters,docs:{...(D=q.parameters)==null?void 0:D.docs,source:{originalSource:`{
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
      <BAIScopedResourceGroupSelect {...args} style={{
      width: '300px'
    }} />
    </RelayResolver>
}`,...(O=q.parameters)==null||(O=O.docs)==null?void 0:O.source},description:{story:`Empty state when no resource groups are available.`,...(k=q.parameters)==null||(k=k.docs)==null?void 0:k.description}}},J.parameters={...J.parameters,docs:{...(A=J.parameters)==null?void 0:A.docs,source:{originalSource:`{
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
      <BAIScopedResourceGroupSelect {...args} style={{
      width: '300px'
    }} />
    </RelayResolver>
}`,...(j=J.parameters)==null||(j=j.docs)==null?void 0:j.source},description:{story:`Disabled state of the select.`,...(M=J.parameters)==null||(M=M.docs)==null?void 0:M.description}}},Y.parameters={...Y.parameters,docs:{...(N=Y.parameters)==null?void 0:N.docs,source:{originalSource:`{
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
      <BAIScopedResourceGroupSelect {...args} style={{
      width: '300px'
    }} />
    </RelayResolver>
}`,...(P=Y.parameters)==null||(P=P.docs)==null?void 0:P.source},description:{story:`Select with clear button enabled.`,...(F=Y.parameters)==null||(F=F.docs)==null?void 0:F.description}}},X.parameters={...X.parameters,docs:{...(I=X.parameters)==null?void 0:I.docs,source:{originalSource:`{
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
      <BAIScopedResourceGroupSelect {...args} style={{
      width: '300px'
    }} />
    </RelayResolver>
}`,...(L=X.parameters)==null||(L=L.docs)==null?void 0:L.source},description:{story:`Select with custom placeholder text.`,...(R=X.parameters)==null||(R=R.docs)==null?void 0:R.description}}},Z.parameters={...Z.parameters,docs:{...(z=Z.parameters)==null?void 0:z.docs,source:{originalSource:`{
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
      <BAIScopedResourceGroupSelect {...args} style={{
      width: '300px'
    }} />
    </RelayResolver>
}`,...(B=Z.parameters)==null||(B=B.docs)==null?void 0:B.source},description:{story:`Select with many resource group options.`,...(V=Z.parameters)==null||(V=V.docs)==null?void 0:V.description}}},Q=[`Default`,`Empty`,`Disabled`,`WithClearButton`,`WithCustomPlaceholder`,`ManyResourceGroups`]})))()}$();export{K as Default,J as Disabled,q as Empty,Z as ManyResourceGroups,Y as WithClearButton,X as WithCustomPlaceholder,Q as __namedExportsOrder,G as default};