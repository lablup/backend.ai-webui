import{j as r}from"./iframe-CWV4CPLG.js";import{R as s}from"./RelayResolver-DxQJ-E0O.js";import{B as o}from"./BAIProjectResourcePolicySelect-CDEUjaM1.js";import"./preload-helper-Dp1pzeXC.js";import"./index-3xxsrG5t.js";import"./index-CWydDQHY.js";import"./BAISelect-CAxIsJkp.js";import"./astryxLabel-BaxGU2YK.js";import"./isString-kB2g6JgC.js";import"./isEmpty-BMxepse4.js";import"./index-DAEXV9Ib.js";import"./runtime-BhgYCK9T.js";import"./formControl-HbOVaeUx.js";import"./FormLayoutContext-CCeubnVr.js";import"./InputClearButton-CzCubudS.js";import"./selectorPresentation.stylex-CLaRxcLp.js";import"./Section-D0JVauhW.js";import"./usePopover-C_5-kkCL.js";import"./useDevWarning-D_vj85RO.js";import"./rtlStyles-T4i24HtE.js";import"./useFocusReturnVisibility-btrC7cwg.js";import"./isRtlElement-B2-7SF8s.js";import"./useHighlightedOptionScroll-CvPCG08j.js";import"./useAnnounceRenderedText-vhaC4mfF.js";import"./useResolvedRequired-CdIMODyt.js";import"./fieldParts-Clox_4NK.js";import"./composeEventHandlers-BolWE7qY.js";import"./inputAria-CStWn1wH.js";import"./Badge-CcioPYVq.js";import"./CheckboxInput-Cb5Iwyhg.js";import"./FieldStatus-B8iWc6N7.js";import"./useIsHydrating-DH68RXYi.js";import"./indicator.markers.stylex-BEMgQWOK.js";import"./useIndicator-D5q5td1Z.js";import"./Divider-BFroGQz_.js";import"./inputStyles.stylex-Bztz6H8O.js";import"./Field-D0Ose5Ux.js";import"./index-CDQMymQW.js";import"./Selector-BOl4jAID.js";import"./useMenuOverflow-D3j6drlr.js";import"./SelectorOption-DQTQmccH.js";import"./Item-BH5hQsMI.js";import"./computeTargetAndRel-BGwjeA1c.js";import"./map-Db0MZ76N.js";import"./toString-CVTIxsQq.js";import"./isSymbol-BlOt3C-R.js";import"./_baseEach-DdUIyCf9.js";import"./get-BOTj3Apg.js";import"./_baseGet-DR62hO9M.js";import"./identity-DKeuBCMA.js";import"./sortBy-vUM9A03j.js";import"./_baseFlatten-rF1ygYc7.js";import"./_baseRest-DubckP_J.js";import"./_overRest-CqUaHEwa.js";import"./_defineProperty-BXDYZptF.js";import"./_isIterateeCall-CrJVqMGp.js";const p=[{id:"policy-1",name:"default"},{id:"policy-2",name:"gpu-limited"},{id:"policy-3",name:"cpu-only"},{id:"policy-4",name:"high-memory"},{id:"policy-5",name:"storage-optimized"}],U=Array.from({length:15},(e,m)=>({id:`policy-${m+1}`,name:`resource-policy-${m+1}`})),ze={title:"Fragments/BAIProjectResourcePolicySelect",component:o,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:`
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
        `}}},argTypes:{placeholder:{control:{type:"text"},description:"Placeholder text when no value is selected",table:{type:{summary:"string"}}},disabled:{control:{type:"boolean"},description:"Whether the select is disabled",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},allowClear:{control:{type:"boolean"},description:"Show clear button",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},onChange:{action:"changed",description:"Callback when selection changes"}}},t={name:"Basic",parameters:{docs:{description:{story:"Basic usage showing 5 project resource policies, automatically sorted alphabetically. Search functionality is enabled by default."}}},args:{},render:e=>r.jsx(s,{mockResolvers:{Query:()=>({project_resource_policies:p})},children:r.jsx(o,{...e,style:{width:"300px"}})})},a={name:"EmptyState",parameters:{docs:{description:{story:"Shows the component when no project resource policies are configured."}}},args:{},render:e=>r.jsx(s,{mockResolvers:{Query:()=>({project_resource_policies:[]})},children:r.jsx(o,{...e,style:{width:"300px"}})})},c={name:"DisabledState",parameters:{docs:{description:{story:"Shows the component in a disabled state where users cannot interact with it."}}},args:{disabled:!0},render:e=>r.jsx(s,{mockResolvers:{Query:()=>({project_resource_policies:p})},children:r.jsx(o,{...e,style:{width:"300px"}})})},i={name:"ClearButton",parameters:{docs:{description:{story:"Select with allowClear enabled, allowing users to clear their selection."}}},args:{allowClear:!0},render:e=>r.jsx(s,{mockResolvers:{Query:()=>({project_resource_policies:p})},children:r.jsx(o,{...e,style:{width:"300px"}})})},n={name:"CustomPlaceholder",parameters:{docs:{description:{story:"Demonstrates using a custom placeholder text."}}},args:{placeholder:"Choose a resource policy..."},render:e=>r.jsx(s,{mockResolvers:{Query:()=>({project_resource_policies:p})},children:r.jsx(o,{...e,style:{width:"300px"}})})},l={name:"ManyOptions",parameters:{docs:{description:{story:"Demonstrates the component with 15 resource policies, showing scrollable dropdown with search functionality."}}},args:{allowClear:!0},render:e=>r.jsx(s,{mockResolvers:{Query:()=>({project_resource_policies:U})},children:r.jsx(o,{...e,style:{width:"300px"}})})};var d,u,y,h,g;t.parameters={...t.parameters,docs:{...(d=t.parameters)==null?void 0:d.docs,source:{originalSource:`{
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
}`,...(y=(u=t.parameters)==null?void 0:u.docs)==null?void 0:y.source},description:{story:"Basic usage with 5 sample resource policies.",...(g=(h=t.parameters)==null?void 0:h.docs)==null?void 0:g.description}}};var R,w,j,b,P;a.parameters={...a.parameters,docs:{...(R=a.parameters)==null?void 0:R.docs,source:{originalSource:`{
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
}`,...(j=(w=a.parameters)==null?void 0:w.docs)==null?void 0:j.source},description:{story:"Empty state when no resource policies are available.",...(P=(b=a.parameters)==null?void 0:b.docs)==null?void 0:P.description}}};var S,x,v,_,f;c.parameters={...c.parameters,docs:{...(S=c.parameters)==null?void 0:S.docs,source:{originalSource:`{
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
}`,...(v=(x=c.parameters)==null?void 0:x.docs)==null?void 0:v.source},description:{story:"Disabled state of the select.",...(f=(_=c.parameters)==null?void 0:_.docs)==null?void 0:f.description}}};var B,C,Q,A,I;i.parameters={...i.parameters,docs:{...(B=i.parameters)==null?void 0:B.docs,source:{originalSource:`{
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
}`,...(Q=(C=i.parameters)==null?void 0:C.docs)==null?void 0:Q.source},description:{story:"Select with clear button enabled.",...(I=(A=i.parameters)==null?void 0:A.docs)==null?void 0:I.description}}};var k,D,E,M,W;n.parameters={...n.parameters,docs:{...(k=n.parameters)==null?void 0:k.docs,source:{originalSource:`{
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
}`,...(E=(D=n.parameters)==null?void 0:D.docs)==null?void 0:E.source},description:{story:"Select with custom placeholder text.",...(W=(M=n.parameters)==null?void 0:M.docs)==null?void 0:W.description}}};var F,q,O,G,L;l.parameters={...l.parameters,docs:{...(F=l.parameters)==null?void 0:F.docs,source:{originalSource:`{
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
}`,...(O=(q=l.parameters)==null?void 0:q.docs)==null?void 0:O.source},description:{story:"Select with many policy options.",...(L=(G=l.parameters)==null?void 0:G.docs)==null?void 0:L.description}}};const Te=["Default","Empty","Disabled","WithClearButton","WithCustomPlaceholder","ManyPolicies"];export{t as Default,c as Disabled,a as Empty,l as ManyPolicies,i as WithClearButton,n as WithCustomPlaceholder,Te as __namedExportsOrder,ze as default};
