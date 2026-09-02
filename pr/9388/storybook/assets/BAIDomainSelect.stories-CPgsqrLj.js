import{a as ae,j as a}from"./iframe-BjbHaFOk.js";import{R as r}from"./RelayResolver-CgqLCJVp.js";import{B as ne}from"./BAISelect-B44rMJLH.js";import{r as se}from"./index-BQYFKd0I.js";import{u as te}from"./useControllableValue-C--QwvYB.js";import{m as re}from"./map-CBd01rBc.js";import"./preload-helper-Dp1pzeXC.js";import"./index-B3JrBPrD.js";import"./astryxLabel-NipOY2Vd.js";import"./isString-vH12Q0nm.js";import"./isEmpty-CUPvCaSO.js";import"./usePopover-CfJA0Tao.js";import"./useDevWarning-B1dAGO6c.js";import"./rtlStyles-T4i24HtE.js";import"./InputClearButton-CgBJsNOf.js";import"./useResolvedRequired-BFzgfrL5.js";import"./Selector-hX6Z9YIW.js";import"./useTypeahead-BCstVedV.js";import"./SelectorOption-BOTmGNB1.js";import"./Item-DbPWztVZ.js";import"./InputGroupContext-Cwua0sVb.js";import"./useIndicator-C-S1CFtn.js";import"./isRenderable-BUV0eL6r.js";import"./Divider-0LIEYtKl.js";import"./Badge-BvE5WllL.js";import"./CheckboxInput-Cj_KDFc-.js";import"./toString-Dde97laz.js";import"./isSymbol-BhS6KIjD.js";import"./_baseEach-Cg528op8.js";import"./get-BgwsxXa7.js";import"./_baseGet-msjX8iDh.js";import"./identity-DKeuBCMA.js";const H=(function(){var e=[{defaultValue:null,kind:"LocalArgument",name:"is_active"}],t=[{alias:null,args:[{kind:"Variable",name:"is_active",variableName:"is_active"}],concreteType:"Domain",kind:"LinkedField",name:"domains",plural:!0,selections:[{alias:null,args:null,kind:"ScalarField",name:"name",storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:e,kind:"Fragment",metadata:null,name:"BAIDomainSelectQuery",selections:t,type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:e,kind:"Operation",name:"BAIDomainSelectQuery",selections:t},params:{cacheID:"57d026d6fa8a04c20ffa280feacb762f",id:null,metadata:{},name:"BAIDomainSelectQuery",operationKind:"query",text:`query BAIDomainSelectQuery(
  $is_active: Boolean
) {
  domains(is_active: $is_active) {
    name
  }
}
`}}})();H.hash="dc51af30271ef1276b6aba8998bb5c1b";const s=({activeOnly:e=!0,...t})=>{const{t:J}=ae(),[X,Y]=te(t),{domains:Z}=se.useLazyLoadQuery(H,{is_active:e},{fetchPolicy:"store-and-network"});return a.jsx(ne,{placeholder:J("comp:BAIDomainSelect.SelectDomain"),...t,value:X,onChange:(n,ee)=>{Y(n,ee)},options:re(Z,n=>({label:n==null?void 0:n.name,value:n==null?void 0:n.name}))})},u=[{name:"default"},{name:"research"},{name:"production"}],oe=[{name:"default"},{name:"research"},{name:"production"},{name:"archived-domain"},{name:"inactive-domain"}],ie=Array.from({length:15},(e,t)=>({name:`domain-${t+1}`})),Le={title:"Fragments/BAIDomainSelect",component:s,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:`
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
        `}}},argTypes:{activeOnly:{control:{type:"boolean"},description:"Filter to show only active domains",table:{type:{summary:"boolean"},defaultValue:{summary:"true"}}},placeholder:{control:{type:"text"},description:"Placeholder text when no value is selected",table:{type:{summary:"string"}}},disabled:{control:{type:"boolean"},description:"Whether the select is disabled",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},allowClear:{control:{type:"boolean"},description:"Show clear button",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},onChange:{action:"changed",description:"Callback when selection changes"}}},o={name:"Basic",parameters:{docs:{description:{story:"Basic usage with activeOnly=true (default), showing 3 active domains."}}},args:{activeOnly:!0},render:e=>a.jsx(r,{mockResolvers:{Query:()=>({domains:u})},children:a.jsx(s,{...e,style:{width:"300px"}})})},i={name:"AllDomains",parameters:{docs:{description:{story:"With activeOnly=false, displays all domains including inactive ones (5 total domains)."}}},args:{activeOnly:!1},render:e=>a.jsx(r,{mockResolvers:{Query:()=>({domains:oe})},children:a.jsx(s,{...e,style:{width:"300px"}})})},l={name:"EmptyState",parameters:{docs:{description:{story:"Shows the component when no domains are returned from the API."}}},render:e=>a.jsx(r,{mockResolvers:{Query:()=>({domains:[]})},children:a.jsx(s,{...e,style:{width:"300px"}})})},c={name:"DisabledState",parameters:{docs:{description:{story:"Shows the component in a disabled state where users cannot interact with it."}}},args:{disabled:!0},render:e=>a.jsx(r,{mockResolvers:{Query:()=>({domains:u})},children:a.jsx(s,{...e,style:{width:"300px"}})})},m={name:"ClearButton",parameters:{docs:{description:{story:"Select with allowClear enabled, allowing users to clear their selection."}}},args:{allowClear:!0},render:e=>a.jsx(r,{mockResolvers:{Query:()=>({domains:u})},children:a.jsx(s,{...e,style:{width:"300px"}})})},d={name:"CustomPlaceholder",parameters:{docs:{description:{story:"Demonstrates using a custom placeholder instead of the default."}}},args:{placeholder:"Choose a domain..."},render:e=>a.jsx(r,{mockResolvers:{Query:()=>({domains:u})},children:a.jsx(s,{...e,style:{width:"300px"}})})},p={name:"ManyOptions",parameters:{docs:{description:{story:"Demonstrates the component with a large number of domains, showing scrollable dropdown behavior."}}},args:{showSearch:!0,allowClear:!0},render:e=>a.jsx(r,{mockResolvers:{Query:()=>({domains:ie})},children:a.jsx(s,{...e,style:{width:"300px"}})})};var y,h,v,g,w;o.parameters={...o.parameters,docs:{...(y=o.parameters)==null?void 0:y.docs,source:{originalSource:`{
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
}`,...(v=(h=o.parameters)==null?void 0:h.docs)==null?void 0:v.source},description:{story:"Basic usage showing only active domains (default behavior).",...(w=(g=o.parameters)==null?void 0:g.docs)==null?void 0:w.description}}};var f,D,S,b,R;i.parameters={...i.parameters,docs:{...(f=i.parameters)==null?void 0:f.docs,source:{originalSource:`{
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
}`,...(S=(D=i.parameters)==null?void 0:D.docs)==null?void 0:S.source},description:{story:"Shows all domains including inactive ones.",...(R=(b=i.parameters)==null?void 0:b.docs)==null?void 0:R.description}}};var x,A,B,k,I;l.parameters={...l.parameters,docs:{...(x=l.parameters)==null?void 0:x.docs,source:{originalSource:`{
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
}`,...(B=(A=l.parameters)==null?void 0:A.docs)==null?void 0:B.source},description:{story:"Empty state when no domains are available.",...(I=(k=l.parameters)==null?void 0:k.docs)==null?void 0:I.description}}};var Q,C,j,O,_;c.parameters={...c.parameters,docs:{...(Q=c.parameters)==null?void 0:Q.docs,source:{originalSource:`{
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
}`,...(j=(C=c.parameters)==null?void 0:C.docs)==null?void 0:j.source},description:{story:"Disabled state of the select.",...(_=(O=c.parameters)==null?void 0:O.docs)==null?void 0:_.description}}};var F,P,E,V,W;m.parameters={...m.parameters,docs:{...(F=m.parameters)==null?void 0:F.docs,source:{originalSource:`{
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
}`,...(E=(P=m.parameters)==null?void 0:P.docs)==null?void 0:E.source},description:{story:"Select with clear button enabled.",...(W=(V=m.parameters)==null?void 0:V.docs)==null?void 0:W.description}}};var q,L,M,$,K;d.parameters={...d.parameters,docs:{...(q=d.parameters)==null?void 0:q.docs,source:{originalSource:`{
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
}`,...(M=(L=d.parameters)==null?void 0:L.docs)==null?void 0:M.source},description:{story:"Select with custom placeholder text.",...(K=($=d.parameters)==null?void 0:$.docs)==null?void 0:K.description}}};var T,G,N,U,z;p.parameters={...p.parameters,docs:{...(T=p.parameters)==null?void 0:T.docs,source:{originalSource:`{
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
}`,...(N=(G=p.parameters)==null?void 0:G.docs)==null?void 0:N.source},description:{story:"Select with many domain options.",...(z=(U=p.parameters)==null?void 0:U.docs)==null?void 0:z.description}}};const Me=["Default","AllDomains","Empty","Disabled","WithClearButton","WithCustomPlaceholder","ManyDomains"];export{i as AllDomains,o as Default,c as Disabled,l as Empty,p as ManyDomains,m as WithClearButton,d as WithCustomPlaceholder,Me as __namedExportsOrder,Le as default};
