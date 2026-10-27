import{a as ae,j as a}from"./iframe-QZwAMKiq.js";import{R as s}from"./RelayResolver-XAS5rJua.js";import{B as ne}from"./BAISelect-CBCf7xMM.js";import{r as te}from"./index-Bp2JpKGK.js";import{u as re}from"./useControllableValue-cbktn0ad.js";import{m as se}from"./map-Ccjqb6Y2.js";import"./preload-helper-Dp1pzeXC.js";import"./index-haGHnGZu.js";import"./astryxLabel-Dmpz-Ddg.js";import"./isString-Xqfi90EC.js";import"./isEmpty-24JObc3c.js";import"./index-D3HG7oDv.js";import"./runtime-BhgYCK9T.js";import"./formControl-Dvzd_jn_.js";import"./FormLayoutContext-I_gPtqVy.js";import"./InputClearButton-CBqqb55A.js";import"./selectorPresentation.stylex-BOrHJyFv.js";import"./Section-DZb7CVx9.js";import"./usePopover-C1ZFSwUe.js";import"./useDevWarning-D7HuQA45.js";import"./rtlStyles-T4i24HtE.js";import"./useFocusReturnVisibility-D05EO0ij.js";import"./isRtlElement-B2-7SF8s.js";import"./useHighlightedOptionScroll-DHhnIL-O.js";import"./useAnnounceRenderedText-BwjcBGMJ.js";import"./useResolvedRequired-D8bRBVY6.js";import"./fieldParts-kR9vbQMi.js";import"./composeEventHandlers-BolWE7qY.js";import"./inputAria-CStWn1wH.js";import"./Badge-DIDipZtJ.js";import"./CheckboxInput-Cd3lFdmV.js";import"./FieldStatus-D8LGiDaF.js";import"./useIsHydrating-WluJ_xsU.js";import"./indicator.markers.stylex-COHQWIkK.js";import"./useIndicator-kou2pAYJ.js";import"./Divider-BTy0nMNZ.js";import"./inputStyles.stylex-Bztz6H8O.js";import"./Field-DhiK3BrB.js";import"./index-CV2KRCHe.js";import"./Selector-GlxVCQTH.js";import"./useMenuOverflow-CaKVcrOg.js";import"./SelectorOption-BYBqOLSD.js";import"./Item-ucHa-moD.js";import"./computeTargetAndRel-BGwjeA1c.js";import"./toString-BBOw5KUM.js";import"./isSymbol-Dw6EI7w6.js";import"./_baseEach-DUCw9RC_.js";import"./get-BD8VTAu5.js";import"./_baseGet-D3ijTykJ.js";import"./identity-DKeuBCMA.js";const H=(function(){var e=[{defaultValue:null,kind:"LocalArgument",name:"is_active"}],r=[{alias:null,args:[{kind:"Variable",name:"is_active",variableName:"is_active"}],concreteType:"Domain",kind:"LinkedField",name:"domains",plural:!0,selections:[{alias:null,args:null,kind:"ScalarField",name:"name",storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:e,kind:"Fragment",metadata:null,name:"BAIDomainSelectQuery",selections:r,type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:e,kind:"Operation",name:"BAIDomainSelectQuery",selections:r},params:{cacheID:"57d026d6fa8a04c20ffa280feacb762f",id:null,metadata:{},name:"BAIDomainSelectQuery",operationKind:"query",text:`query BAIDomainSelectQuery(
  $is_active: Boolean
) {
  domains(is_active: $is_active) {
    name
  }
}
`}}})();H.hash="dc51af30271ef1276b6aba8998bb5c1b";const t=({activeOnly:e=!0,...r})=>{const{t:J}=ae(),[X,Y]=re(r),{domains:Z}=te.useLazyLoadQuery(H,{is_active:e},{fetchPolicy:"store-and-network"});return a.jsx(ne,{placeholder:J("comp:BAIDomainSelect.SelectDomain"),...r,value:X,onChange:(n,ee)=>{Y(n,ee)},options:se(Z,n=>({label:n==null?void 0:n.name,value:n==null?void 0:n.name}))})},u=[{name:"default"},{name:"research"},{name:"production"}],oe=[{name:"default"},{name:"research"},{name:"production"},{name:"archived-domain"},{name:"inactive-domain"}],ie=Array.from({length:15},(e,r)=>({name:`domain-${r+1}`})),ra={title:"Fragments/BAIDomainSelect",component:t,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:`
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
        `}}},argTypes:{activeOnly:{control:{type:"boolean"},description:"Filter to show only active domains",table:{type:{summary:"boolean"},defaultValue:{summary:"true"}}},placeholder:{control:{type:"text"},description:"Placeholder text when no value is selected",table:{type:{summary:"string"}}},disabled:{control:{type:"boolean"},description:"Whether the select is disabled",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},allowClear:{control:{type:"boolean"},description:"Show clear button",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},onChange:{action:"changed",description:"Callback when selection changes"}}},o={name:"Basic",parameters:{docs:{description:{story:"Basic usage with activeOnly=true (default), showing 3 active domains."}}},args:{activeOnly:!0},render:e=>a.jsx(s,{mockResolvers:{Query:()=>({domains:u})},children:a.jsx(t,{...e,style:{width:"300px"}})})},i={name:"AllDomains",parameters:{docs:{description:{story:"With activeOnly=false, displays all domains including inactive ones (5 total domains)."}}},args:{activeOnly:!1},render:e=>a.jsx(s,{mockResolvers:{Query:()=>({domains:oe})},children:a.jsx(t,{...e,style:{width:"300px"}})})},l={name:"EmptyState",parameters:{docs:{description:{story:"Shows the component when no domains are returned from the API."}}},render:e=>a.jsx(s,{mockResolvers:{Query:()=>({domains:[]})},children:a.jsx(t,{...e,style:{width:"300px"}})})},c={name:"DisabledState",parameters:{docs:{description:{story:"Shows the component in a disabled state where users cannot interact with it."}}},args:{disabled:!0},render:e=>a.jsx(s,{mockResolvers:{Query:()=>({domains:u})},children:a.jsx(t,{...e,style:{width:"300px"}})})},m={name:"ClearButton",parameters:{docs:{description:{story:"Select with allowClear enabled, allowing users to clear their selection."}}},args:{allowClear:!0},render:e=>a.jsx(s,{mockResolvers:{Query:()=>({domains:u})},children:a.jsx(t,{...e,style:{width:"300px"}})})},d={name:"CustomPlaceholder",parameters:{docs:{description:{story:"Demonstrates using a custom placeholder instead of the default."}}},args:{placeholder:"Choose a domain..."},render:e=>a.jsx(s,{mockResolvers:{Query:()=>({domains:u})},children:a.jsx(t,{...e,style:{width:"300px"}})})},p={name:"ManyOptions",parameters:{docs:{description:{story:"Demonstrates the component with a large number of domains, showing scrollable dropdown behavior."}}},args:{showSearch:!0,allowClear:!0},render:e=>a.jsx(s,{mockResolvers:{Query:()=>({domains:ie})},children:a.jsx(t,{...e,style:{width:"300px"}})})};var y,h,v,g,w;o.parameters={...o.parameters,docs:{...(y=o.parameters)==null?void 0:y.docs,source:{originalSource:`{
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
}`,...(N=(G=p.parameters)==null?void 0:G.docs)==null?void 0:N.source},description:{story:"Select with many domain options.",...(z=(U=p.parameters)==null?void 0:U.docs)==null?void 0:z.description}}};const sa=["Default","AllDomains","Empty","Disabled","WithClearButton","WithCustomPlaceholder","ManyDomains"];export{i as AllDomains,o as Default,c as Disabled,l as Empty,p as ManyDomains,m as WithClearButton,d as WithCustomPlaceholder,sa as __namedExportsOrder,ra as default};
