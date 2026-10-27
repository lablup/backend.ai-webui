import{j as r}from"./iframe-BDFLgaIq.js";import{R as s}from"./RelayResolver-B1Fkw6RB.js";import{B as o}from"./BAIProjectResourcePolicySelect-SXp4ak8y.js";import"./preload-helper-Dp1pzeXC.js";import"./index-CS3kXfab.js";import"./index-D2nZHJSj.js";import"./BAISelect-BqLDQHFJ.js";import"./astryxLabel-CZy13FrX.js";import"./isString-C883zE_f.js";import"./isEmpty-DkETVSOX.js";import"./index-DjaUq6Y6.js";import"./runtime-BhgYCK9T.js";import"./formControl-BsVLTsZv.js";import"./FormLayoutContext-DsAJ96HZ.js";import"./InputClearButton-Bi7kbfvL.js";import"./selectorPresentation.stylex-95TeDMOB.js";import"./Section-CqRv4VU3.js";import"./usePopover-jePuRxAx.js";import"./useDevWarning-B22Uc69E.js";import"./rtlStyles-T4i24HtE.js";import"./useFocusReturnVisibility-n0SEJkaq.js";import"./isRtlElement-B2-7SF8s.js";import"./useHighlightedOptionScroll-B_l4pxdQ.js";import"./useAnnounceRenderedText-E88i2uAk.js";import"./useResolvedRequired-CKaoGo1f.js";import"./fieldParts-C9rzhqzC.js";import"./composeEventHandlers-BolWE7qY.js";import"./inputAria-CStWn1wH.js";import"./Badge-BhKWwrlp.js";import"./CheckboxInput-BIAIgFqo.js";import"./FieldStatus-DkcZVMds.js";import"./useIsHydrating-CoNEFjW9.js";import"./indicator.markers.stylex-D4VmPvMl.js";import"./useIndicator-DcTv1kVi.js";import"./Divider-CMtfkKBF.js";import"./inputStyles.stylex-Bztz6H8O.js";import"./Field-BbmRfd3f.js";import"./index-DDrLu9mC.js";import"./Selector-B_sN0n3P.js";import"./useMenuOverflow-kBn-ZlWZ.js";import"./SelectorOption-9wuspO7f.js";import"./Item-EN_XmE3L.js";import"./computeTargetAndRel-BGwjeA1c.js";import"./map-CElDuWvR.js";import"./toString-X5Y5wZuD.js";import"./isSymbol-D5JT5Q-w.js";import"./_baseEach-P_AduTAp.js";import"./get-BP-b2Slb.js";import"./_baseGet-DciTg1If.js";import"./identity-DKeuBCMA.js";import"./sortBy-Dq_aAOvR.js";import"./_baseFlatten-Det1Nh1l.js";import"./_baseRest-CmtpmdXi.js";import"./_overRest-BzGg0Akp.js";import"./_defineProperty-BHghoUay.js";import"./_isIterateeCall-BiuiDY5m.js";const p=[{id:"policy-1",name:"default"},{id:"policy-2",name:"gpu-limited"},{id:"policy-3",name:"cpu-only"},{id:"policy-4",name:"high-memory"},{id:"policy-5",name:"storage-optimized"}],U=Array.from({length:15},(e,m)=>({id:`policy-${m+1}`,name:`resource-policy-${m+1}`})),ze={title:"Fragments/BAIProjectResourcePolicySelect",component:o,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:`
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
