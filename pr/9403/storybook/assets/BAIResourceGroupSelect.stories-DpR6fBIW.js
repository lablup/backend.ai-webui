import{a as X,j as r}from"./iframe-DAafooS5.js";import{R as a}from"./RelayResolver-B1__u8RO.js";import{B as Y}from"./BAISelect-CUGuII1l.js";import{r as Z}from"./index-B9tPmwuK.js";import{m as ee}from"./map-CckatDhY.js";import{u as re}from"./uniqBy-CXvY_vbw.js";import"./preload-helper-Dp1pzeXC.js";import"./index-iiwMzDnt.js";import"./astryxLabel-CQFzQ6GQ.js";import"./isString-C9SNCMFd.js";import"./isEmpty-BAtLKgQu.js";import"./usePopover-Pwgny9vK.js";import"./useDevWarning-DfQG8TQa.js";import"./rtlStyles-T4i24HtE.js";import"./InputClearButton-ByY5H6a0.js";import"./useResolvedRequired-Bqx8Vest.js";import"./Selector-CAPPpnKQ.js";import"./useTypeahead-CY1ckJCc.js";import"./SelectorOption-B2LHJWnh.js";import"./Item-DuFgFWNg.js";import"./InputGroupContext-pgCvXjBM.js";import"./useIndicator-DFlVBGCp.js";import"./isRenderable-BUV0eL6r.js";import"./Divider-B9PyYF1f.js";import"./Badge-D89c5yQa.js";import"./CheckboxInput-DHNBtL9f.js";import"./toString-x0zywEl_.js";import"./isSymbol-C2coCXL5.js";import"./_baseEach-BkCY0drg.js";import"./get-G7p5lKzf.js";import"./_baseGet-DcwxXAZ3.js";import"./identity-DKeuBCMA.js";import"./_baseUniq-Bn1pkIW3.js";import"./_baseIndexOf-Be9UPhX8.js";import"./_baseFindIndex-Cj99RmFE.js";import"./noop-DX6rZLP_.js";const J=(function(){var e=[{alias:null,args:null,concreteType:"ScalingGroup",kind:"LinkedField",name:"scaling_groups",plural:!0,selections:[{alias:null,args:null,kind:"ScalarField",name:"name",storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:[],kind:"Fragment",metadata:null,name:"BAIResourceGroupSelectQuery",selections:e,type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[],kind:"Operation",name:"BAIResourceGroupSelectQuery",selections:e},params:{cacheID:"e0e2315cadb2e8aa35586ebe588cd9d1",id:null,metadata:{},name:"BAIResourceGroupSelectQuery",operationKind:"query",text:`query BAIResourceGroupSelectQuery {
  scaling_groups {
    name
  }
}
`}}})();J.hash="835aef9b1b8293b5cb6fa2e775e8945c";const o=({...e})=>{const{t:d}=X(),{scaling_groups:N}=Z.useLazyLoadQuery(J,{},{});return r.jsx(Y,{options:ee(re(N,"name"),s=>({label:s==null?void 0:s.name,value:s==null?void 0:s.name,resourceGroup:s==null?void 0:s.name})),showSearch:!0,placeholder:d("comp:BAIResourceGroupSelect.SelectResourceGroup"),...e})},m=[{name:"default"},{name:"gpu-cluster"},{name:"cpu-only"},{name:"high-memory"},{name:"storage-optimized"}],se=Array.from({length:15},(e,d)=>({name:`resource-group-${d+1}`})),oe=[{name:"default"},{name:"gpu-cluster"},{name:"default"},{name:"cpu-only"},{name:"gpu-cluster"}],Me={title:"Fragments/BAIResourceGroupSelect",component:o,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:`
**BAIResourceGroupSelect** extends [BAISelect](/?path=/docs/components-input-baiselect--docs) to fetch and display resource groups (scaling groups).

## Features
- Fetches scaling groups from GraphQL query \`BAIResourceGroupSelectQuery\`
- Automatically removes duplicate resource group names using \`_.uniqBy\`
- Built-in search functionality enabled by default
- Internationalized placeholder using \`comp:BAIResourceGroupSelect.SelectResourceGroup\`
- Uses resource group \`name\` as both label and value

## GraphQL Query
\`\`\`graphql
query BAIResourceGroupSelectQuery {
  scaling_groups {
    name
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
        `}}},argTypes:{placeholder:{control:{type:"text"},description:"Placeholder text when no value is selected",table:{type:{summary:"string"},defaultValue:{summary:"i18n: comp:BAIResourceGroupSelect.SelectResourceGroup"}}},disabled:{control:{type:"boolean"},description:"Whether the select is disabled",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},allowClear:{control:{type:"boolean"},description:"Show clear button",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},onChange:{action:"changed",description:"Callback when selection changes"}}},t={name:"Basic",parameters:{docs:{description:{story:"Basic usage showing 5 resource groups. Search functionality is enabled by default, and placeholder is internationalized."}}},args:{},render:e=>r.jsx(a,{mockResolvers:{Query:()=>({scaling_groups:m})},children:r.jsx(o,{...e,style:{width:"300px"}})})},n={name:"EmptyState",parameters:{docs:{description:{story:"Shows the component when no resource groups are configured."}}},args:{},render:e=>r.jsx(a,{mockResolvers:{Query:()=>({scaling_groups:[]})},children:r.jsx(o,{...e,style:{width:"300px"}})})},c={name:"AutomaticDeduplication",parameters:{docs:{description:{story:"Demonstrates automatic deduplication when the API returns duplicate resource group names. Only unique names are shown (3 unique groups from 5 total)."}}},args:{},render:e=>r.jsx(a,{mockResolvers:{Query:()=>({scaling_groups:oe})},children:r.jsx(o,{...e,style:{width:"300px"}})})},l={name:"DisabledState",parameters:{docs:{description:{story:"Shows the component in a disabled state where users cannot interact with it."}}},args:{disabled:!0},render:e=>r.jsx(a,{mockResolvers:{Query:()=>({scaling_groups:m})},children:r.jsx(o,{...e,style:{width:"300px"}})})},i={name:"ClearButton",parameters:{docs:{description:{story:"Select with allowClear enabled, allowing users to clear their selection."}}},args:{allowClear:!0},render:e=>r.jsx(a,{mockResolvers:{Query:()=>({scaling_groups:m})},children:r.jsx(o,{...e,style:{width:"300px"}})})},u={name:"CustomPlaceholder",parameters:{docs:{description:{story:"Demonstrates overriding the default internationalized placeholder."}}},args:{placeholder:"Choose a resource group..."},render:e=>r.jsx(a,{mockResolvers:{Query:()=>({scaling_groups:m})},children:r.jsx(o,{...e,style:{width:"300px"}})})},p={name:"ManyOptions",parameters:{docs:{description:{story:"Demonstrates the component with 15 resource groups, showing scrollable dropdown with search functionality."}}},args:{allowClear:!0},render:e=>r.jsx(a,{mockResolvers:{Query:()=>({scaling_groups:se})},children:r.jsx(o,{...e,style:{width:"300px"}})})};var y,g,h,R,w;t.parameters={...t.parameters,docs:{...(y=t.parameters)==null?void 0:y.docs,source:{originalSource:`{
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
      scaling_groups: sampleResourceGroups
    })
  }}>
      <BAIResourceGroupSelect {...args} style={{
      width: '300px'
    }} />
    </RelayResolver>
}`,...(h=(g=t.parameters)==null?void 0:g.docs)==null?void 0:h.source},description:{story:"Basic usage with 5 sample resource groups.",...(w=(R=t.parameters)==null?void 0:R.docs)==null?void 0:w.description}}};var S,b,f,v,x;n.parameters={...n.parameters,docs:{...(S=n.parameters)==null?void 0:S.docs,source:{originalSource:`{
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
      scaling_groups: []
    })
  }}>
      <BAIResourceGroupSelect {...args} style={{
      width: '300px'
    }} />
    </RelayResolver>
}`,...(f=(b=n.parameters)==null?void 0:b.docs)==null?void 0:f.source},description:{story:"Empty state when no resource groups are available.",...(x=(v=n.parameters)==null?void 0:v.docs)==null?void 0:x.description}}};var B,G,A,I,Q;c.parameters={...c.parameters,docs:{...(B=c.parameters)==null?void 0:B.docs,source:{originalSource:`{
  name: 'AutomaticDeduplication',
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates automatic deduplication when the API returns duplicate resource group names. Only unique names are shown (3 unique groups from 5 total).'
      }
    }
  },
  args: {},
  render: args => <RelayResolver mockResolvers={{
    Query: () => ({
      scaling_groups: sampleWithDuplicates
    })
  }}>
      <BAIResourceGroupSelect {...args} style={{
      width: '300px'
    }} />
    </RelayResolver>
}`,...(A=(G=c.parameters)==null?void 0:G.docs)==null?void 0:A.source},description:{story:"Automatic deduplication of resource groups by name.",...(Q=(I=c.parameters)==null?void 0:I.docs)==null?void 0:Q.description}}};var D,_,k,C,j;l.parameters={...l.parameters,docs:{...(D=l.parameters)==null?void 0:D.docs,source:{originalSource:`{
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
      scaling_groups: sampleResourceGroups
    })
  }}>
      <BAIResourceGroupSelect {...args} style={{
      width: '300px'
    }} />
    </RelayResolver>
}`,...(k=(_=l.parameters)==null?void 0:_.docs)==null?void 0:k.source},description:{story:"Disabled state of the select.",...(j=(C=l.parameters)==null?void 0:C.docs)==null?void 0:j.description}}};var q,W,E,z,F;i.parameters={...i.parameters,docs:{...(q=i.parameters)==null?void 0:q.docs,source:{originalSource:`{
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
      scaling_groups: sampleResourceGroups
    })
  }}>
      <BAIResourceGroupSelect {...args} style={{
      width: '300px'
    }} />
    </RelayResolver>
}`,...(E=(W=i.parameters)==null?void 0:W.docs)==null?void 0:E.source},description:{story:"Select with clear button enabled.",...(F=(z=i.parameters)==null?void 0:z.docs)==null?void 0:F.description}}};var P,M,O,L,K;u.parameters={...u.parameters,docs:{...(P=u.parameters)==null?void 0:P.docs,source:{originalSource:`{
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
      scaling_groups: sampleResourceGroups
    })
  }}>
      <BAIResourceGroupSelect {...args} style={{
      width: '300px'
    }} />
    </RelayResolver>
}`,...(O=(M=u.parameters)==null?void 0:M.docs)==null?void 0:O.source},description:{story:"Select with custom placeholder text.",...(K=(L=u.parameters)==null?void 0:L.docs)==null?void 0:K.description}}};var V,T,U,$,H;p.parameters={...p.parameters,docs:{...(V=p.parameters)==null?void 0:V.docs,source:{originalSource:`{
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
      scaling_groups: sampleManyResourceGroups
    })
  }}>
      <BAIResourceGroupSelect {...args} style={{
      width: '300px'
    }} />
    </RelayResolver>
}`,...(U=(T=p.parameters)==null?void 0:T.docs)==null?void 0:U.source},description:{story:"Select with many resource group options.",...(H=($=p.parameters)==null?void 0:$.docs)==null?void 0:H.description}}};const Oe=["Default","Empty","WithDuplicates","Disabled","WithClearButton","WithCustomPlaceholder","ManyResourceGroups"];export{t as Default,l as Disabled,n as Empty,p as ManyResourceGroups,i as WithClearButton,u as WithCustomPlaceholder,c as WithDuplicates,Oe as __namedExportsOrder,Me as default};
