import{j as V,r as R}from"./iframe-BX70NT8E.js";import{B as H}from"./BAIComplexSelect-BdJHVrBR.js";import{B as h}from"./BAIPropertyFilter-BGx0RzRd.js";import"./preload-helper-Dp1pzeXC.js";import"./useIndicator-BbLBwCJn.js";import"./isRenderable-BUV0eL6r.js";import"./clamp-CFxiRxDk.js";import"./_baseClamp-DVUOCJN_.js";import"./toFinite-DokEO4oz.js";import"./_trimmedEndIndex-DuQxD0U0.js";import"./isSymbol-CyjzVnqW.js";import"./filter-u1qNmBTL.js";import"./_baseEach-CidCzTvr.js";import"./get-CfRRIEly.js";import"./_baseGet-BIuEbBQs.js";import"./toString-DAKV9GS3.js";import"./identity-DKeuBCMA.js";import"./_baseSlice-F8doVSIJ.js";import"./toInteger-4UVeF9gF.js";import"./map-udKUZJfR.js";import"./usePopover-UiRDJzJ0.js";import"./useDevWarning-Dhivo5S2.js";import"./rtlStyles-T4i24HtE.js";import"./useResolvedRequired-Dos8IWgx.js";import"./composeEventHandlers-BolWE7qY.js";import"./InputClearButton-Cr8YDTMW.js";import"./Divider-DyWf0AMY.js";import"./isNumber-CtBpEpn_.js";import"./compact-CU4PNV0P.js";import"./some-Dz1tZ9zI.js";import"./Token-BhtbaZ70.js";import"./SelectorOption-CJwfuivb.js";import"./Item-DGjx2_kV.js";import"./index-Bqo_1JRx.js";import"./isEmpty-CsJNOYoa.js";import"./PowerSearch-A7Fj8fFz.js";import"./_baseAssignValue-ChtZaFZ6.js";import"./_defineProperty-BCed1qx5.js";import"./toLower-DoUL7FP1.js";import"./_arrayEach-DpGxo2Of.js";import"./_castFunction-a6W-o7Lo.js";import"./_charsEndIndex-BHSW-HpW.js";import"./_baseIndexOf-Be9UPhX8.js";import"./_baseFindIndex-Cj99RmFE.js";import"./uniq-CfNOS1wl.js";import"./_baseUniq-f-dLr_2Y.js";import"./noop-DX6rZLP_.js";import"./join-DKskq_cE.js";import"./isNil-CHIgUVhi.js";import"./isString-BQYo-QwK.js";import"./includes-rdSZ9lKC.js";import"./_baseFlatten-BdLlMSK-.js";import"./characters-DWaYg7k3.js";import"./NumberInput-_78jBjHC.js";import"./useInputStatusIcon-CR65-_rS.js";import"./InputGroupContext-DQY8bVmz.js";import"./Selector-CmOguKEP.js";import"./useTypeahead-e-d-blQa.js";import"./isRtlElement-B2-7SF8s.js";import"./TextInput-B8Nydbn1.js";import"./VStack-BlcMFyiS.js";import"./useControllableValue-B79-tLKw.js";import"./find-Dqwf0bdg.js";import"./split-DuopEVfR.js";import"./_isIterateeCall-Cl7JXTZ4.js";const{action:j}=__STORYBOOK_MODULE_ACTIONS__,at={title:"Filter/BAIPropertyFilter",component:h,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:"\n**BAIPropertyFilter** is a sophisticated filtering component designed for Backend.AI applications. It provides a user-friendly interface for constructing complex filter queries with support for:\n\n- **Multiple property types**: String and boolean properties with type-specific operators\n- **Dynamic query building**: Visual interface for constructing filter expressions\n- **Autocomplete support**: Predefined options and suggestions for property values\n- **Validation rules**: Custom validation for property values\n- **Query language**: Based on Backend.AI's query filter minilang specification\n- **Entity values via `entitySource`**: Declarative picker for properties whose value is an opaque id (a user UUID chosen by email). Supply `{ search, bootstrap?, resolve?, cancel? }` and the editor renders an Astryx Typeahead (a Tokenizer when the operator is a list one — **arity follows the operator, not the property**). `resolve(ids)` turns ids restored from a saved query string back into labels. Prefer it over `renderInput` for id-valued properties. Same field as on `BAIGraphQLPropertyFilter`.\n- **Custom input via `renderInput`**: Replace the built-in value editor with any controlled control (e.g., a user or storage-host picker). The control stages a value via `onAddCondition(value, label?)` and the edit popover's Apply button commits it; pass a human-readable `label` when the staged value is opaque (e.g. a UUID) so the token shows the label instead. The render prop receives `{ onAddCondition, value, isDisabled }`. Same contract as `BAIGraphQLPropertyFilter`, so controls are interchangeable.\n\n> **to-astryx ticket 28** — the engine is now Astryx `PowerSearch`. The prop contract is unchanged, but the antd chrome it documented (property `Select` + `AutoComplete` + closable `Tag`s + the bespoke reset button) is replaced by PowerSearch's typeahead, tokens and built-in clear. `rule.validate` is advisory now: a violating token is reported through the control's error status instead of being refused. **to-astryx ticket 32** refreshed these stories: the `renderInput` demo below now uses `BAIComplexSelect` (Astryx-native) instead of antd `Select`, matching what a migrated call site actually renders.\n\nThe component generates filter query strings that can be used with Backend.AI's query system, enabling powerful data filtering capabilities across the platform.\n\n**Query Syntax Examples:**\n- Simple filter: `name ilike %john%`\n- Boolean filter: `active == true`\n- Combined filters: `name ilike %john% & active == true`\n        "}}},argTypes:{filterProperties:{description:"Array of filterable properties configuration",control:{type:"object"},table:{type:{summary:"FilterProperty[]"}}},value:{control:{type:"text"},description:"Current filter query string",table:{type:{summary:"string"}}},onChange:{action:"filterChanged",description:"Callback when filter value changes",table:{type:{summary:"(value: string) => void"}}},loading:{control:{type:"boolean"},description:"Show loading state",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}}},render:e=>{const[t,r]=R.useState(e.value);return V.jsx(h,{...e,value:t,onChange:m=>{var y;(y=e.onChange)==null||y.call(e,m),r(m)}})}},a={name:"Basic Usage",parameters:{docs:{description:{story:"Basic property filter with string and boolean properties. Shows how to construct complex filter queries using the visual interface."}}},args:{filterProperties:[{key:"name",defaultOperator:"ilike",propertyLabel:"Name",type:"string"},{key:"description",propertyLabel:"Description",type:"string"},{key:"active",propertyLabel:"Active Status",type:"boolean"}],value:'name ilike "%test%" & active == true'}},o={name:"Number and Datetime Properties",parameters:{docs:{description:{story:'Numeric and time properties offer comparison operators. Numbers serialize bare (`priority >= 10`); datetimes stay quoted (`created_at >= "2026-08-01"`) because the backend parses the string into a date.'}}},args:{filterProperties:[{key:"name",propertyLabel:"Name",type:"string"},{key:"priority",propertyLabel:"Priority",type:"number"},{key:"created_at",propertyLabel:"Created At",type:"datetime"}],value:'priority >= 10 & created_at >= "2026-08-01"'}},i={name:"Custom Validation",parameters:{docs:{description:{story:"Property filter with custom validation rules for email addresses and strict selection options."}}},args:{filterProperties:[{key:"email",propertyLabel:"Email Address",type:"string",rule:{message:"Please enter a valid email address",validate:e=>/\S+@\S+\.\S+/.test(e)}},{key:"status",propertyLabel:"Status",type:"string",options:[{label:"Active",value:"active"},{label:"Inactive",value:"inactive"},{label:"Pending",value:"pending"}],strictSelection:!0}]}},n={name:"Autocomplete Options",parameters:{docs:{description:{story:"Property filter with predefined autocomplete options for easier data entry."}}},args:{filterProperties:[{key:"department",propertyLabel:"Department",type:"string",options:[{label:"Engineering",value:"engineering"},{label:"Marketing",value:"marketing"},{label:"Sales",value:"sales"},{label:"Human Resources",value:"hr"}]},{key:"priority",propertyLabel:"Priority Level",type:"string",options:[{label:"High",value:"high"},{label:"Medium",value:"medium"},{label:"Low",value:"low"}],strictSelection:!0}],value:'department ilike "%engineering%"'}},s={parameters:{docs:{description:{story:"Property filter in its initial state with no applied filters."}}},args:{filterProperties:[{key:"name",propertyLabel:"Name",type:"string"},{key:"enabled",propertyLabel:"Enabled",type:"boolean"}]}},p={parameters:{docs:{description:{story:"Property filter in loading state, typically shown while fetching filter options or processing queries."}}},args:{filterProperties:[{key:"name",propertyLabel:"Name",type:"string"}],loading:!0}},M=[{label:"alice@example.com",value:"owner-uuid-0001"},{label:"bob@example.com",value:"owner-uuid-0002"},{label:"carol@example.com",value:"owner-uuid-0003"}],l={name:"Custom Input via renderInput",parameters:{docs:{description:{story:"When `renderInput` is provided, the default value editor is replaced with a custom control. The control **stages** a value via `onAddCondition(value, label?)` and the edit popover's Apply button commits it — nothing lands on the filter until Apply. Pass the option label as the second argument so the token shows a human-readable label (e.g. an email) instead of the opaque staged value (e.g. a UUID). The render prop also receives `value` (what is currently staged) and `isDisabled`. Same contract as `BAIGraphQLPropertyFilter`, so controls are interchangeable; for id-valued properties prefer `entitySource`."}}},args:{filterProperties:[{key:"name",propertyLabel:"Name",type:"string",defaultOperator:"ilike"},{key:"owner",propertyLabel:"Owner",type:"string",defaultOperator:"==",renderInput:({onAddCondition:e})=>V.jsx(H,{label:"Owner",isLabelHidden:!0,placeholder:"Select owner",width:220,options:M,value:null,onChange:t=>{const r=t;e(r==null?void 0:r.value,r==null?void 0:r.label)}})}],onChange:j("Filter changed")}},d=[{id:"owner-uuid-0001",label:"alice@example.com",description:"Alice Kim"},{id:"owner-uuid-0002",label:"bob@example.com",description:"Bob Lee"},{id:"owner-uuid-0003",label:"carol@example.com",description:"Carol Park"},{id:"owner-uuid-0004",label:"dave@example.com",description:"Dave Choi"}],u=e=>new Promise(t=>setTimeout(t,e)),Q={search:async e=>{await u(400);const t=e.trim().toLowerCase();return t?d.filter(r=>r.label.toLowerCase().includes(t)):d},bootstrap:async()=>(await u(300),d.slice(0,3)),resolve:async e=>(await u(1200),d.filter(t=>e.includes(t.id)))},c={name:"Entity picker via entitySource",parameters:{docs:{description:{story:'`entitySource` is the declarative way to filter on an opaque id: the user searches by email while the query string keeps the UUID (`owner == "owner-uuid-0003"` — the same bytes `renderInput` produced). Arity follows the operator, so a single-value operator like `==` gets a single-select Typeahead. The story is pre-seeded with a raw UUID and this demo source resolves it after ~1.2s, so the token starts as the UUID and swaps to the email — what happens when a saved query is reopened. Without `resolve` the token simply keeps showing the raw id.'}}},args:{filterProperties:[{key:"name",propertyLabel:"Name",type:"string",defaultOperator:"ilike"},{key:"owner",propertyLabel:"Owner",type:"string",defaultOperator:"==",entitySource:Q}],value:'owner == "owner-uuid-0003"',onChange:j("Filter changed")}};var g,b,v;a.parameters={...a.parameters,docs:{...(g=a.parameters)==null?void 0:g.docs,source:{originalSource:`{
  name: 'Basic Usage',
  parameters: {
    docs: {
      description: {
        story: 'Basic property filter with string and boolean properties. Shows how to construct complex filter queries using the visual interface.'
      }
    }
  },
  args: {
    filterProperties: [{
      key: 'name',
      defaultOperator: 'ilike',
      propertyLabel: 'Name',
      type: 'string'
    }, {
      key: 'description',
      propertyLabel: 'Description',
      type: 'string'
    }, {
      key: 'active',
      propertyLabel: 'Active Status',
      type: 'boolean'
    }],
    value: 'name ilike "%test%" & active == true'
  }
}`,...(v=(b=a.parameters)==null?void 0:b.docs)==null?void 0:v.source}}};var f,w,k;o.parameters={...o.parameters,docs:{...(f=o.parameters)==null?void 0:f.docs,source:{originalSource:`{
  name: 'Number and Datetime Properties',
  parameters: {
    docs: {
      description: {
        story: 'Numeric and time properties offer comparison operators. Numbers serialize bare (\`priority >= 10\`); datetimes stay quoted (\`created_at >= "2026-08-01"\`) because the backend parses the string into a date.'
      }
    }
  },
  args: {
    filterProperties: [{
      key: 'name',
      propertyLabel: 'Name',
      type: 'string'
    }, {
      key: 'priority',
      propertyLabel: 'Priority',
      type: 'number'
    }, {
      key: 'created_at',
      propertyLabel: 'Created At',
      type: 'datetime'
    }],
    value: 'priority >= 10 & created_at >= "2026-08-01"'
  }
}`,...(k=(w=o.parameters)==null?void 0:w.docs)==null?void 0:k.source}}};var S,L,P;i.parameters={...i.parameters,docs:{...(S=i.parameters)==null?void 0:S.docs,source:{originalSource:`{
  name: 'Custom Validation',
  parameters: {
    docs: {
      description: {
        story: 'Property filter with custom validation rules for email addresses and strict selection options.'
      }
    }
  },
  args: {
    filterProperties: [{
      key: 'email',
      propertyLabel: 'Email Address',
      type: 'string',
      rule: {
        message: 'Please enter a valid email address',
        validate: (value: string) => /\\S+@\\S+\\.\\S+/.test(value)
      }
    }, {
      key: 'status',
      propertyLabel: 'Status',
      type: 'string',
      options: [{
        label: 'Active',
        value: 'active'
      }, {
        label: 'Inactive',
        value: 'inactive'
      }, {
        label: 'Pending',
        value: 'pending'
      }],
      strictSelection: true
    }]
  }
}`,...(P=(L=i.parameters)==null?void 0:L.docs)==null?void 0:P.source}}};var A,I,C;n.parameters={...n.parameters,docs:{...(A=n.parameters)==null?void 0:A.docs,source:{originalSource:`{
  name: 'Autocomplete Options',
  parameters: {
    docs: {
      description: {
        story: 'Property filter with predefined autocomplete options for easier data entry.'
      }
    }
  },
  args: {
    filterProperties: [{
      key: 'department',
      propertyLabel: 'Department',
      type: 'string',
      options: [{
        label: 'Engineering',
        value: 'engineering'
      }, {
        label: 'Marketing',
        value: 'marketing'
      }, {
        label: 'Sales',
        value: 'sales'
      }, {
        label: 'Human Resources',
        value: 'hr'
      }]
    }, {
      key: 'priority',
      propertyLabel: 'Priority Level',
      type: 'string',
      options: [{
        label: 'High',
        value: 'high'
      }, {
        label: 'Medium',
        value: 'medium'
      }, {
        label: 'Low',
        value: 'low'
      }],
      strictSelection: true
    }],
    value: 'department ilike "%engineering%"'
  }
}`,...(C=(I=n.parameters)==null?void 0:I.docs)==null?void 0:C.source}}};var x,O,D;s.parameters={...s.parameters,docs:{...(x=s.parameters)==null?void 0:x.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Property filter in its initial state with no applied filters.'
      }
    }
  },
  args: {
    filterProperties: [{
      key: 'name',
      propertyLabel: 'Name',
      type: 'string'
    }, {
      key: 'enabled',
      propertyLabel: 'Enabled',
      type: 'boolean'
    }]
  }
}`,...(D=(O=s.parameters)==null?void 0:O.docs)==null?void 0:D.source}}};var U,B,q;p.parameters={...p.parameters,docs:{...(U=p.parameters)==null?void 0:U.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Property filter in loading state, typically shown while fetching filter options or processing queries.'
      }
    }
  },
  args: {
    filterProperties: [{
      key: 'name',
      propertyLabel: 'Name',
      type: 'string'
    }],
    loading: true
  }
}`,...(q=(B=p.parameters)==null?void 0:B.docs)==null?void 0:q.source}}};var E,N,T;l.parameters={...l.parameters,docs:{...(E=l.parameters)==null?void 0:E.docs,source:{originalSource:`{
  name: 'Custom Input via renderInput',
  parameters: {
    docs: {
      description: {
        story: "When \`renderInput\` is provided, the default value editor is replaced with a custom control. The control **stages** a value via \`onAddCondition(value, label?)\` and the edit popover's Apply button commits it — nothing lands on the filter until Apply. Pass the option label as the second argument so the token shows a human-readable label (e.g. an email) instead of the opaque staged value (e.g. a UUID). The render prop also receives \`value\` (what is currently staged) and \`isDisabled\`. Same contract as \`BAIGraphQLPropertyFilter\`, so controls are interchangeable; for id-valued properties prefer \`entitySource\`."
      }
    }
  },
  args: {
    filterProperties: [{
      key: 'name',
      propertyLabel: 'Name',
      type: 'string',
      defaultOperator: 'ilike'
    }, {
      key: 'owner',
      propertyLabel: 'Owner',
      type: 'string',
      defaultOperator: '==',
      renderInput: ({
        onAddCondition
      }) => <BAIComplexSelect label="Owner" isLabelHidden placeholder="Select owner" width={220} options={sampleOwnerOptions} value={null} onChange={next => {
        const labeled = next as BAILabeledValue | null;
        onAddCondition(labeled?.value, labeled?.label);
      }} />
    }],
    onChange: action('Filter changed')
  }
}`,...(T=(N=l.parameters)==null?void 0:N.docs)==null?void 0:T.source}}};var _,F,W;c.parameters={...c.parameters,docs:{...(_=c.parameters)==null?void 0:_.docs,source:{originalSource:`{
  name: 'Entity picker via entitySource',
  parameters: {
    docs: {
      description: {
        story: '\`entitySource\` is the declarative way to filter on an opaque id: the user searches by email while the query string keeps the UUID (\`owner == "owner-uuid-0003"\` — the same bytes \`renderInput\` produced). Arity follows the operator, so a single-value operator like \`==\` gets a single-select Typeahead. The story is pre-seeded with a raw UUID and this demo source resolves it after ~1.2s, so the token starts as the UUID and swaps to the email — what happens when a saved query is reopened. Without \`resolve\` the token simply keeps showing the raw id.'
      }
    }
  },
  args: {
    filterProperties: [{
      key: 'name',
      propertyLabel: 'Name',
      type: 'string',
      defaultOperator: 'ilike'
    }, {
      key: 'owner',
      propertyLabel: 'Owner',
      type: 'string',
      defaultOperator: '==',
      entitySource: demoUserEntitySource
    }],
    value: 'owner == "owner-uuid-0003"',
    onChange: action('Filter changed')
  }
}`,...(W=(F=c.parameters)==null?void 0:F.docs)==null?void 0:W.source}}};const ot=["Default","NumberAndDatetime","WithCustomValidation","WithAutocompleteOptions","EmptyState","LoadingState","WithRenderInput","WithEntitySource"];export{a as Default,s as EmptyState,p as LoadingState,o as NumberAndDatetime,n as WithAutocompleteOptions,i as WithCustomValidation,c as WithEntitySource,l as WithRenderInput,ot as __namedExportsOrder,at as default};
