import{c as J,a as Z,j as s}from"./iframe-DfjpXR3Z.js";import{R as u}from"./RelayResolver-tgzoTZnB.js";import{B as ee}from"./BAISelect-o4aWxOdb.js";import{r as re}from"./index-DZ3ugVRC.js";import{m as X}from"./map-BnIqrXb7.js";import{c as oe}from"./compact-CU4PNV0P.js";import"./preload-helper-Dp1pzeXC.js";import"./index-BsMAs02Q.js";import"./astryxLabel-CiHH2zv_.js";import"./isString-RvAzgRuj.js";import"./isEmpty-BgZiY-5M.js";import"./index-hMHdd9kB.js";import"./runtime-BhgYCK9T.js";import"./formControl-CAABWoY8.js";import"./FormLayoutContext-DVHkMc7O.js";import"./InputClearButton-iuc-UfQs.js";import"./selectorPresentation.stylex-BrwNKiH8.js";import"./Section-RlKXGNnq.js";import"./usePopover-CFX0nYki.js";import"./useDevWarning-phCBS6nd.js";import"./rtlStyles-T4i24HtE.js";import"./useFocusReturnVisibility-Bay_O2w-.js";import"./isRtlElement-B2-7SF8s.js";import"./useHighlightedOptionScroll-nxXBUjSi.js";import"./useAnnounceRenderedText-BT_tDxSK.js";import"./useResolvedRequired-CAaN0Feb.js";import"./fieldParts-ZBHCodvx.js";import"./composeEventHandlers-BolWE7qY.js";import"./inputAria-CStWn1wH.js";import"./Badge-wsj2M048.js";import"./CheckboxInput-DIQ66mTZ.js";import"./FieldStatus-pDWnZ2Nn.js";import"./useIsHydrating-xEkY-Ahv.js";import"./indicator.markers.stylex-Bb1StHVM.js";import"./useIndicator-BDs345I4.js";import"./Divider-Bpr3KlcY.js";import"./inputStyles.stylex-Bztz6H8O.js";import"./Field-CfnwozFF.js";import"./index-CXBBco_l.js";import"./Selector-CWfCFhWE.js";import"./useMenuOverflow-0v3smlSR.js";import"./SelectorOption-Bb9iUhbe.js";import"./Item-sm-j9lKW.js";import"./computeTargetAndRel-BGwjeA1c.js";import"./toString-0RAYaPYc.js";import"./isSymbol-mSvbz9Fd.js";import"./_baseEach-CSE4Qh_9.js";import"./get-CY4aWtOA.js";import"./_baseGet-CmYT7vbm.js";import"./identity-DKeuBCMA.js";const Y=(function(){var r=[{defaultValue:null,kind:"LocalArgument",name:"filter"}],e=[{kind:"Variable",name:"filter",variableName:"filter"},{kind:"Literal",name:"limit",value:100},{kind:"Literal",name:"orderBy",value:[{direction:"ASC",field:"NAME"}]}],t={alias:null,args:null,kind:"ScalarField",name:"name",storageKey:null};return{fragment:{argumentDefinitions:r,kind:"Fragment",metadata:null,name:"BAIResourceGroupSelectQuery",selections:[{alias:null,args:e,concreteType:"ResourceGroupConnection",kind:"LinkedField",name:"adminResourceGroups",plural:!1,selections:[{alias:null,args:null,concreteType:"ResourceGroupEdge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"ResourceGroup",kind:"LinkedField",name:"node",plural:!1,selections:[t],storageKey:null}],storageKey:null}],storageKey:null}],type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:r,kind:"Operation",name:"BAIResourceGroupSelectQuery",selections:[{alias:null,args:e,concreteType:"ResourceGroupConnection",kind:"LinkedField",name:"adminResourceGroups",plural:!1,selections:[{alias:null,args:null,concreteType:"ResourceGroupEdge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"ResourceGroup",kind:"LinkedField",name:"node",plural:!1,selections:[t,{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}]},params:{cacheID:"ccbeb1e0d742d5ecb1d403bebf4046be",id:null,metadata:{},name:"BAIResourceGroupSelectQuery",operationKind:"query",text:`query BAIResourceGroupSelectQuery(
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
`}}})();Y.hash="401e1429387d38b178219ebb0a678556";const se=r=>{"use memo";const e=J.c(5);let t;e[0]===Symbol.for("react.memo_cache_sentinel")?(t=Y,e[0]=t):t=e[0];const a=r??null;let l;e[1]!==a?(l={filter:a},e[1]=a,e[2]=l):l=e[2];const{adminResourceGroups:o}=re.useLazyLoadQuery(t,l);let n;return e[3]!==(o==null?void 0:o.edges)?(n=oe(X(o==null?void 0:o.edges,te)),e[3]=o==null?void 0:o.edges,e[4]=n):n=e[4],n},i=r=>{"use memo";const e=J.c(11);let t,a;e[0]!==r?({filter:t,...a}=r,e[0]=r,e[1]=t,e[2]=a):(t=e[1],a=e[2]);const{t:l}=Z(),o=se(t);let n;e[3]!==o?(n=X(o,ne),e[3]=o,e[4]=n):n=e[4];let c;e[5]!==l?(c=l("comp:BAIResourceGroupSelect.SelectResourceGroup"),e[5]=l,e[6]=c):c=e[6];let f;return e[7]!==a||e[8]!==n||e[9]!==c?(f=s.jsx(ee,{options:n,showSearch:!0,placeholder:c,...a}),e[7]=a,e[8]=n,e[9]=c,e[10]=f):f=e[10],f};function te(r){var e;return(e=r==null?void 0:r.node)==null?void 0:e.name}function ne(r){return{label:r,value:r,resourceGroup:r}}const G=[{name:"default"},{name:"gpu-cluster"},{name:"cpu-only"},{name:"high-memory"},{name:"storage-optimized"}],ae=Array.from({length:15},(r,e)=>({name:`resource-group-${e+1}`})),p=r=>({edges:r.map(e=>({node:{id:e.name,...e}}))}),sr={title:"Fragments/BAIResourceGroupSelect",component:i,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:`
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
        `}}},argTypes:{placeholder:{control:{type:"text"},description:"Placeholder text when no value is selected",table:{type:{summary:"string"},defaultValue:{summary:"i18n: comp:BAIResourceGroupSelect.SelectResourceGroup"}}},disabled:{control:{type:"boolean"},description:"Whether the select is disabled",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},allowClear:{control:{type:"boolean"},description:"Show clear button",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},onChange:{action:"changed",description:"Callback when selection changes"}}},d={name:"Basic",parameters:{docs:{description:{story:"Basic usage showing 5 resource groups. Search functionality is enabled by default, and placeholder is internationalized."}}},args:{},render:r=>s.jsx(u,{mockResolvers:{Query:()=>({adminResourceGroups:p(G)})},children:s.jsx(i,{...r,style:{width:"300px"}})})},m={name:"EmptyState",parameters:{docs:{description:{story:"Shows the component when no resource groups are configured."}}},args:{},render:r=>s.jsx(u,{mockResolvers:{Query:()=>({adminResourceGroups:p([])})},children:s.jsx(i,{...r,style:{width:"300px"}})})},y={name:"DisabledState",parameters:{docs:{description:{story:"Shows the component in a disabled state where users cannot interact with it."}}},args:{disabled:!0},render:r=>s.jsx(u,{mockResolvers:{Query:()=>({adminResourceGroups:p(G)})},children:s.jsx(i,{...r,style:{width:"300px"}})})},h={name:"ClearButton",parameters:{docs:{description:{story:"Select with allowClear enabled, allowing users to clear their selection."}}},args:{allowClear:!0},render:r=>s.jsx(u,{mockResolvers:{Query:()=>({adminResourceGroups:p(G)})},children:s.jsx(i,{...r,style:{width:"300px"}})})},g={name:"CustomPlaceholder",parameters:{docs:{description:{story:"Demonstrates overriding the default internationalized placeholder."}}},args:{placeholder:"Choose a resource group..."},render:r=>s.jsx(u,{mockResolvers:{Query:()=>({adminResourceGroups:p(G)})},children:s.jsx(i,{...r,style:{width:"300px"}})})},R={name:"ManyOptions",parameters:{docs:{description:{story:"Demonstrates the component with 15 resource groups, showing scrollable dropdown with search functionality."}}},args:{allowClear:!0},render:r=>s.jsx(u,{mockResolvers:{Query:()=>({adminResourceGroups:p(ae)})},children:s.jsx(i,{...r,style:{width:"300px"}})})};var S,b,w,v,x;d.parameters={...d.parameters,docs:{...(S=d.parameters)==null?void 0:S.docs,source:{originalSource:`{
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
}`,...(w=(b=d.parameters)==null?void 0:b.docs)==null?void 0:w.source},description:{story:"Basic usage with 5 sample resource groups.",...(x=(v=d.parameters)==null?void 0:v.docs)==null?void 0:x.description}}};var B,k,A,C,I;m.parameters={...m.parameters,docs:{...(B=m.parameters)==null?void 0:B.docs,source:{originalSource:`{
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
}`,...(A=(k=m.parameters)==null?void 0:k.docs)==null?void 0:A.source},description:{story:"Empty state when no resource groups are available.",...(I=(C=m.parameters)==null?void 0:C.docs)==null?void 0:I.description}}};var Q,j,F,D,E;y.parameters={...y.parameters,docs:{...(Q=y.parameters)==null?void 0:Q.docs,source:{originalSource:`{
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
}`,...(F=(j=y.parameters)==null?void 0:j.docs)==null?void 0:F.source},description:{story:"Disabled state of the select.",...(E=(D=y.parameters)==null?void 0:D.docs)==null?void 0:E.description}}};var L,K,M,z,N;h.parameters={...h.parameters,docs:{...(L=h.parameters)==null?void 0:L.docs,source:{originalSource:`{
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
}`,...(M=(K=h.parameters)==null?void 0:K.docs)==null?void 0:M.source},description:{story:"Select with clear button enabled.",...(N=(z=h.parameters)==null?void 0:z.docs)==null?void 0:N.description}}};var P,T,_,$,q;g.parameters={...g.parameters,docs:{...(P=g.parameters)==null?void 0:P.docs,source:{originalSource:`{
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
}`,...(_=(T=g.parameters)==null?void 0:T.docs)==null?void 0:_.source},description:{story:"Select with custom placeholder text.",...(q=($=g.parameters)==null?void 0:$.docs)==null?void 0:q.description}}};var O,V,W,U,H;R.parameters={...R.parameters,docs:{...(O=R.parameters)==null?void 0:O.docs,source:{originalSource:`{
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
}`,...(W=(V=R.parameters)==null?void 0:V.docs)==null?void 0:W.source},description:{story:"Select with many resource group options.",...(H=(U=R.parameters)==null?void 0:U.docs)==null?void 0:H.description}}};const tr=["Default","Empty","Disabled","WithClearButton","WithCustomPlaceholder","ManyResourceGroups"];export{d as Default,y as Disabled,m as Empty,R as ManyResourceGroups,h as WithClearButton,g as WithCustomPlaceholder,tr as __namedExportsOrder,sr as default};
