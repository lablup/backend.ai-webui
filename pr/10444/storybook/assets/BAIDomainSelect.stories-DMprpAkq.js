import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{m as t,t as n}from"./hooks-CqTIG_8a.js";import{n as r,t as i}from"./map-BLzs52H1.js";import{t as a}from"./jsx-runtime-MKhVqBIO.js";import{n as o,t as s}from"./useBAIi18n-DURTYAKn.js";import{t as c}from"./react-relay-sHama7hJ.js";import{n as l,t as u}from"./BAISelect-DH8pvIPJ.js";import{n as d,t as f}from"./RelayResolver-BnFyFQJn.js";var p;function m(){return(m=e((()=>{p=(function(){var e=[{defaultValue:null,kind:`LocalArgument`,name:`is_active`}],t=[{alias:null,args:[{kind:`Variable`,name:`is_active`,variableName:`is_active`}],concreteType:`Domain`,kind:`LinkedField`,name:`domains`,plural:!0,selections:[{alias:null,args:null,kind:`ScalarField`,name:`name`,storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:e,kind:`Fragment`,metadata:null,name:`BAIDomainSelectQuery`,selections:t,type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:e,kind:`Operation`,name:`BAIDomainSelectQuery`,selections:t},params:{cacheID:`57d026d6fa8a04c20ffa280feacb762f`,id:null,metadata:{},name:`BAIDomainSelectQuery`,operationKind:`query`,text:`query BAIDomainSelectQuery(
  $is_active: Boolean
) {
  domains(is_active: $is_active) {
    name
  }
}
`}}})(),p.hash=`dc51af30271ef1276b6aba8998bb5c1b`})))()}var h,g,_;function v(){return(v=e((()=>{m(),n(),s(),l(),i(),h=c(),g=a(),_=({activeOnly:e=!0,...n})=>{let{t:i}=o(),[a,s]=t(n),{domains:c}=(0,h.useLazyLoadQuery)(p,{is_active:e},{fetchPolicy:`store-and-network`});return(0,g.jsx)(u,{placeholder:i(`comp:BAIDomainSelect.SelectDomain`),...n,value:a,onChange:(e,t)=>{s(e,t)},options:r(c,e=>({label:e==null?void 0:e.name,value:e==null?void 0:e.name}))})}})))()}var y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q;function $(){return($=e((()=>{d(),v(),y=a(),V=[{name:`default`},{name:`research`},{name:`production`}],H=[{name:`default`},{name:`research`},{name:`production`},{name:`archived-domain`},{name:`inactive-domain`}],U=Array.from({length:15},(e,t)=>({name:`domain-${t+1}`})),W={title:`Fragments/BAIDomainSelect`,component:_,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`
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
        `}}},argTypes:{activeOnly:{control:{type:`boolean`},description:`Filter to show only active domains`,table:{type:{summary:`boolean`},defaultValue:{summary:`true`}}},placeholder:{control:{type:`text`},description:`Placeholder text when no value is selected`,table:{type:{summary:`string`}}},disabled:{control:{type:`boolean`},description:`Whether the select is disabled`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},allowClear:{control:{type:`boolean`},description:`Show clear button`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},onChange:{action:`changed`,description:`Callback when selection changes`}}},G={name:`Basic`,parameters:{docs:{description:{story:`Basic usage with activeOnly=true (default), showing 3 active domains.`}}},args:{activeOnly:!0},render:e=>(0,y.jsx)(f,{mockResolvers:{Query:()=>({domains:V})},children:(0,y.jsx)(_,{...e,style:{width:`300px`}})})},K={name:`AllDomains`,parameters:{docs:{description:{story:`With activeOnly=false, displays all domains including inactive ones (5 total domains).`}}},args:{activeOnly:!1},render:e=>(0,y.jsx)(f,{mockResolvers:{Query:()=>({domains:H})},children:(0,y.jsx)(_,{...e,style:{width:`300px`}})})},q={name:`EmptyState`,parameters:{docs:{description:{story:`Shows the component when no domains are returned from the API.`}}},render:e=>(0,y.jsx)(f,{mockResolvers:{Query:()=>({domains:[]})},children:(0,y.jsx)(_,{...e,style:{width:`300px`}})})},J={name:`DisabledState`,parameters:{docs:{description:{story:`Shows the component in a disabled state where users cannot interact with it.`}}},args:{disabled:!0},render:e=>(0,y.jsx)(f,{mockResolvers:{Query:()=>({domains:V})},children:(0,y.jsx)(_,{...e,style:{width:`300px`}})})},Y={name:`ClearButton`,parameters:{docs:{description:{story:`Select with allowClear enabled, allowing users to clear their selection.`}}},args:{allowClear:!0},render:e=>(0,y.jsx)(f,{mockResolvers:{Query:()=>({domains:V})},children:(0,y.jsx)(_,{...e,style:{width:`300px`}})})},X={name:`CustomPlaceholder`,parameters:{docs:{description:{story:`Demonstrates using a custom placeholder instead of the default.`}}},args:{placeholder:`Choose a domain...`},render:e=>(0,y.jsx)(f,{mockResolvers:{Query:()=>({domains:V})},children:(0,y.jsx)(_,{...e,style:{width:`300px`}})})},Z={name:`ManyOptions`,parameters:{docs:{description:{story:`Demonstrates the component with a large number of domains, showing scrollable dropdown behavior.`}}},args:{showSearch:!0,allowClear:!0},render:e=>(0,y.jsx)(f,{mockResolvers:{Query:()=>({domains:U})},children:(0,y.jsx)(_,{...e,style:{width:`300px`}})})},G.parameters={...G.parameters,docs:{...(b=G.parameters)==null?void 0:b.docs,source:{originalSource:`{
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
}`,...(x=G.parameters)==null||(x=x.docs)==null?void 0:x.source},description:{story:`Basic usage showing only active domains (default behavior).`,...(S=G.parameters)==null||(S=S.docs)==null?void 0:S.description}}},K.parameters={...K.parameters,docs:{...(C=K.parameters)==null?void 0:C.docs,source:{originalSource:`{
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
}`,...(w=K.parameters)==null||(w=w.docs)==null?void 0:w.source},description:{story:`Shows all domains including inactive ones.`,...(T=K.parameters)==null||(T=T.docs)==null?void 0:T.description}}},q.parameters={...q.parameters,docs:{...(E=q.parameters)==null?void 0:E.docs,source:{originalSource:`{
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
}`,...(D=q.parameters)==null||(D=D.docs)==null?void 0:D.source},description:{story:`Empty state when no domains are available.`,...(O=q.parameters)==null||(O=O.docs)==null?void 0:O.description}}},J.parameters={...J.parameters,docs:{...(k=J.parameters)==null?void 0:k.docs,source:{originalSource:`{
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
}`,...(A=J.parameters)==null||(A=A.docs)==null?void 0:A.source},description:{story:`Disabled state of the select.`,...(j=J.parameters)==null||(j=j.docs)==null?void 0:j.description}}},Y.parameters={...Y.parameters,docs:{...(M=Y.parameters)==null?void 0:M.docs,source:{originalSource:`{
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
}`,...(N=Y.parameters)==null||(N=N.docs)==null?void 0:N.source},description:{story:`Select with clear button enabled.`,...(P=Y.parameters)==null||(P=P.docs)==null?void 0:P.description}}},X.parameters={...X.parameters,docs:{...(F=X.parameters)==null?void 0:F.docs,source:{originalSource:`{
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
}`,...(I=X.parameters)==null||(I=I.docs)==null?void 0:I.source},description:{story:`Select with custom placeholder text.`,...(L=X.parameters)==null||(L=L.docs)==null?void 0:L.description}}},Z.parameters={...Z.parameters,docs:{...(R=Z.parameters)==null?void 0:R.docs,source:{originalSource:`{
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
}`,...(z=Z.parameters)==null||(z=z.docs)==null?void 0:z.source},description:{story:`Select with many domain options.`,...(B=Z.parameters)==null||(B=B.docs)==null?void 0:B.description}}},Q=[`Default`,`AllDomains`,`Empty`,`Disabled`,`WithClearButton`,`WithCustomPlaceholder`,`ManyDomains`]})))()}$();export{K as AllDomains,G as Default,J as Disabled,q as Empty,Z as ManyDomains,Y as WithClearButton,X as WithCustomPlaceholder,Q as __namedExportsOrder,W as default};