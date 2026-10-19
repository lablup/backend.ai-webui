import{c as X,b as ee,j as n}from"./iframe-Dh0MDrIa.js";import{R as p}from"./RelayResolver-VQBPYJfZ.js";import{B as re}from"./BAISelect-DsJRAbok.js";import{r as oe}from"./index-D2xkZx3n.js";import{m as Y}from"./map-CWf6ubxe.js";import{c as se}from"./compact-CU4PNV0P.js";import"./preload-helper-Dp1pzeXC.js";import"./index-OShuIaiK.js";import"./astryxLabel-DJEPLDdC.js";import"./isString-ChFW5PdW.js";import"./isEmpty-CTbDDwO9.js";import"./InputGroupContext-QXokSCuQ.js";import"./FieldStatus-uJFP7xmC.js";import"./useDevWarning-BGowGFQg.js";import"./Selector-BDcrBwGm.js";import"./useMenuOverflow-CD3pKdNN.js";import"./useResolvedRequired-CNTrpJq5.js";import"./SelectorOption-DIkbkEqK.js";import"./Item-D-ePZouE.js";import"./computeTargetAndRel-BGwjeA1c.js";import"./isRenderable-BUV0eL6r.js";import"./groupStyles-NJ92Hx_V.js";import"./composeEventHandlers-BolWE7qY.js";import"./usePopover-D3v0o_rD.js";import"./rtlStyles-T4i24HtE.js";import"./useIndicator-BqUGxVgl.js";import"./Divider-oeoG7n00.js";import"./isRtlElement-B2-7SF8s.js";import"./Badge-Dhhk68d9.js";import"./CheckboxInput-CcebZPTm.js";import"./toString-opdtiOup.js";import"./isSymbol-CxZw54JD.js";import"./_baseEach-BiZeqJC5.js";import"./get-BkFBvo-r.js";import"./_baseGet-n-k1X2WZ.js";import"./identity-DKeuBCMA.js";const Z=(function(){var r={defaultValue:null,kind:"LocalArgument",name:"filter"},e={defaultValue:null,kind:"LocalArgument",name:"scope"},o=[{kind:"Variable",name:"filter",variableName:"filter"},{kind:"Literal",name:"limit",value:100},{kind:"Literal",name:"orderBy",value:[{direction:"ASC",field:"NAME"}]},{kind:"Variable",name:"scope",variableName:"scope"}],t={alias:null,args:null,kind:"ScalarField",name:"name",storageKey:null};return{fragment:{argumentDefinitions:[r,e],kind:"Fragment",metadata:null,name:"BAIScopedResourceGroupSelectQuery",selections:[{alias:null,args:o,concreteType:"ResourceGroupConnection",kind:"LinkedField",name:"scopedResourceGroups",plural:!1,selections:[{alias:null,args:null,concreteType:"ResourceGroupEdge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"ResourceGroup",kind:"LinkedField",name:"node",plural:!1,selections:[t],storageKey:null}],storageKey:null}],storageKey:null}],type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[e,r],kind:"Operation",name:"BAIScopedResourceGroupSelectQuery",selections:[{alias:null,args:o,concreteType:"ResourceGroupConnection",kind:"LinkedField",name:"scopedResourceGroups",plural:!1,selections:[{alias:null,args:null,concreteType:"ResourceGroupEdge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"ResourceGroup",kind:"LinkedField",name:"node",plural:!1,selections:[t,{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}]},params:{cacheID:"b89ae9ea8eecb7f51921bfa05c94f5c8",id:null,metadata:{},name:"BAIScopedResourceGroupSelectQuery",operationKind:"query",text:`query BAIScopedResourceGroupSelectQuery(
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
`}}})();Z.hash="b1c8fb072a583117bb5851f845807b45";const ne=(r,e)=>{"use memo";const o=X.c(6);let t;o[0]===Symbol.for("react.memo_cache_sentinel")?(t=Z,o[0]=t):t=o[0];const l=e??null;let c;o[1]!==r||o[2]!==l?(c={scope:r,filter:l},o[1]=r,o[2]=l,o[3]=c):c=o[3];const{scopedResourceGroups:s}=oe.useLazyLoadQuery(t,c);let a;return o[4]!==(s==null?void 0:s.edges)?(a=se(Y(s==null?void 0:s.edges,te)),o[4]=s==null?void 0:s.edges,o[5]=a):a=o[5],a},i=r=>{"use memo";const e=X.c(12);let o,t,l;e[0]!==r?({scope:t,filter:o,...l}=r,e[0]=r,e[1]=o,e[2]=t,e[3]=l):(o=e[1],t=e[2],l=e[3]);const{t:c}=ee(),s=ne(t,o);let a;e[4]!==s?(a=Y(s,ae),e[4]=s,e[5]=a):a=e[5];let u;e[6]!==c?(u=c("comp:BAIResourceGroupSelect.SelectResourceGroup"),e[6]=c,e[7]=u):u=e[7];let S;return e[8]!==l||e[9]!==a||e[10]!==u?(S=n.jsx(re,{options:a,showSearch:!0,placeholder:u,...l}),e[8]=l,e[9]=a,e[10]=u,e[11]=S):S=e[11],S};function te(r){var e;return(e=r==null?void 0:r.node)==null?void 0:e.name}function ae(r){return{label:r,value:r,resourceGroup:r}}const G=[{name:"default"},{name:"gpu-cluster"},{name:"cpu-only"},{name:"high-memory"},{name:"storage-optimized"}],le=Array.from({length:15},(r,e)=>({name:`resource-group-${e+1}`})),d=r=>({edges:r.map(e=>({node:{id:e.name,...e}}))}),_e={title:"Fragments/BAIScopedResourceGroupSelect",component:i,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:`
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
        `}}},argTypes:{placeholder:{control:{type:"text"},description:"Placeholder text when no value is selected",table:{type:{summary:"string"},defaultValue:{summary:"i18n: comp:BAIResourceGroupSelect.SelectResourceGroup"}}},disabled:{control:{type:"boolean"},description:"Whether the select is disabled",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},allowClear:{control:{type:"boolean"},description:"Show clear button",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},onChange:{action:"changed",description:"Callback when selection changes"}}},m={name:"Basic",parameters:{docs:{description:{story:"Basic usage showing 5 resource groups. Search functionality is enabled by default, and placeholder is internationalized."}}},args:{},render:r=>n.jsx(p,{mockResolvers:{Query:()=>({adminResourceGroups:d(G)})},children:n.jsx(i,{...r,style:{width:"300px"}})})},y={name:"EmptyState",parameters:{docs:{description:{story:"Shows the component when no resource groups are configured."}}},args:{},render:r=>n.jsx(p,{mockResolvers:{Query:()=>({adminResourceGroups:d([])})},children:n.jsx(i,{...r,style:{width:"300px"}})})},h={name:"DisabledState",parameters:{docs:{description:{story:"Shows the component in a disabled state where users cannot interact with it."}}},args:{disabled:!0},render:r=>n.jsx(p,{mockResolvers:{Query:()=>({adminResourceGroups:d(G)})},children:n.jsx(i,{...r,style:{width:"300px"}})})},g={name:"ClearButton",parameters:{docs:{description:{story:"Select with allowClear enabled, allowing users to clear their selection."}}},args:{allowClear:!0},render:r=>n.jsx(p,{mockResolvers:{Query:()=>({adminResourceGroups:d(G)})},children:n.jsx(i,{...r,style:{width:"300px"}})})},R={name:"CustomPlaceholder",parameters:{docs:{description:{story:"Demonstrates overriding the default internationalized placeholder."}}},args:{placeholder:"Choose a resource group..."},render:r=>n.jsx(p,{mockResolvers:{Query:()=>({adminResourceGroups:d(G)})},children:n.jsx(i,{...r,style:{width:"300px"}})})},f={name:"ManyOptions",parameters:{docs:{description:{story:"Demonstrates the component with 15 resource groups, showing scrollable dropdown with search functionality."}}},args:{allowClear:!0},render:r=>n.jsx(p,{mockResolvers:{Query:()=>({adminResourceGroups:d(le)})},children:n.jsx(i,{...r,style:{width:"300px"}})})};var b,w,v,x,B;m.parameters={...m.parameters,docs:{...(b=m.parameters)==null?void 0:b.docs,source:{originalSource:`{
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
}`,...(v=(w=m.parameters)==null?void 0:w.docs)==null?void 0:v.source},description:{story:"Basic usage with 5 sample resource groups.",...(B=(x=m.parameters)==null?void 0:x.docs)==null?void 0:B.description}}};var k,A,C,I,Q;y.parameters={...y.parameters,docs:{...(k=y.parameters)==null?void 0:k.docs,source:{originalSource:`{
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
}`,...(C=(A=y.parameters)==null?void 0:A.docs)==null?void 0:C.source},description:{story:"Empty state when no resource groups are available.",...(Q=(I=y.parameters)==null?void 0:I.docs)==null?void 0:Q.description}}};var j,F,D,E,L;h.parameters={...h.parameters,docs:{...(j=h.parameters)==null?void 0:j.docs,source:{originalSource:`{
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
}`,...(D=(F=h.parameters)==null?void 0:F.docs)==null?void 0:D.source},description:{story:"Disabled state of the select.",...(L=(E=h.parameters)==null?void 0:E.docs)==null?void 0:L.description}}};var K,M,$,N,z;g.parameters={...g.parameters,docs:{...(K=g.parameters)==null?void 0:K.docs,source:{originalSource:`{
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
}`,...($=(M=g.parameters)==null?void 0:M.docs)==null?void 0:$.source},description:{story:"Select with clear button enabled.",...(z=(N=g.parameters)==null?void 0:N.docs)==null?void 0:z.description}}};var P,T,V,_,q;R.parameters={...R.parameters,docs:{...(P=R.parameters)==null?void 0:P.docs,source:{originalSource:`{
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
}`,...(V=(T=R.parameters)==null?void 0:T.docs)==null?void 0:V.source},description:{story:"Select with custom placeholder text.",...(q=(_=R.parameters)==null?void 0:_.docs)==null?void 0:q.description}}};var O,W,U,H,J;f.parameters={...f.parameters,docs:{...(O=f.parameters)==null?void 0:O.docs,source:{originalSource:`{
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
}`,...(U=(W=f.parameters)==null?void 0:W.docs)==null?void 0:U.source},description:{story:"Select with many resource group options.",...(J=(H=f.parameters)==null?void 0:H.docs)==null?void 0:J.description}}};const qe=["Default","Empty","Disabled","WithClearButton","WithCustomPlaceholder","ManyResourceGroups"];export{m as Default,h as Disabled,y as Empty,f as ManyResourceGroups,g as WithClearButton,R as WithCustomPlaceholder,qe as __namedExportsOrder,_e as default};
