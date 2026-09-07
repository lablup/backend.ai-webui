import{j as _,r as j}from"./iframe-DQyDlNoi.js";import{B as H}from"./BAIComplexSelect-6FWb4XPk.js";import{B as h}from"./BAIPropertyFilter-BNGah5QV.js";import"./preload-helper-Dp1pzeXC.js";import"./useIndicator-B4v0YbsA.js";import"./isRenderable-BUV0eL6r.js";import"./clamp-ChcY2vcD.js";import"./_baseClamp-DVUOCJN_.js";import"./toFinite-D1TPVbtu.js";import"./_trimmedEndIndex-DuQxD0U0.js";import"./isSymbol-Bjpfwfvi.js";import"./filter-BqPmj8F_.js";import"./_baseEach-DHg76Yo0.js";import"./get-BO5yzBcd.js";import"./_baseGet-BKSCp_1N.js";import"./toString-QeyqdGe2.js";import"./identity-DKeuBCMA.js";import"./_baseSlice-F8doVSIJ.js";import"./toInteger-DVlIK_hc.js";import"./map-Pf-BoDz3.js";import"./usePopover-Ca7P4ch1.js";import"./useDevWarning-Bbj3arAX.js";import"./rtlStyles-T4i24HtE.js";import"./useResolvedRequired-B1h4qgav.js";import"./composeEventHandlers-BolWE7qY.js";import"./InputClearButton-BvQuNhlr.js";import"./Divider-C41VzDuu.js";import"./isNumber-BasY-z_2.js";import"./compact-CU4PNV0P.js";import"./some-LORUDOiS.js";import"./Token-BewEStKM.js";import"./SelectorOption-DVEW4_p8.js";import"./Item-BlArs8iC.js";import"./index-VyUZi7BV.js";import"./isEmpty-B99QHc0N.js";import"./PowerSearch-Bqm0oARL.js";import"./_baseAssignValue-DT2UTHYF.js";import"./_defineProperty-C-tkbXiY.js";import"./toLower-BqkDQ4ac.js";import"./_arrayEach-DpGxo2Of.js";import"./_castFunction-a6W-o7Lo.js";import"./_charsEndIndex-BHSW-HpW.js";import"./_baseIndexOf-Be9UPhX8.js";import"./_baseFindIndex-Cj99RmFE.js";import"./uniq-ng8NF7z1.js";import"./_baseUniq-C0xGXrNX.js";import"./noop-DX6rZLP_.js";import"./join-DKskq_cE.js";import"./isNil-CHIgUVhi.js";import"./isString-B3dy4UXj.js";import"./includes-DBtkf1E5.js";import"./_baseFlatten-BDTTx1Np.js";import"./characters-DWaYg7k3.js";import"./NumberInput-BgW0D2b_.js";import"./useInputStatusIcon-hFNWZmGl.js";import"./InputGroupContext-B9I4PeJ6.js";import"./Selector-BoWyJdBE.js";import"./useTypeahead-CbvZmB0O.js";import"./isRtlElement-B2-7SF8s.js";import"./TextInput-uBsqoyR1.js";import"./VStack-Dv9H82qh.js";import"./useControllableValue-DKrpE_Oa.js";import"./find-BGcNrsnD.js";import"./split-1yyWIX8J.js";import"./_isIterateeCall-B0lY-oL0.js";const rt={title:"Filter/BAIPropertyFilter",component:h,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:"\n**BAIPropertyFilter** is a sophisticated filtering component designed for Backend.AI applications. It provides a user-friendly interface for constructing complex filter queries with support for:\n\n- **Multiple property types**: String and boolean properties with type-specific operators\n- **Dynamic query building**: Visual interface for constructing filter expressions\n- **Autocomplete support**: Predefined options and suggestions for property values\n- **Validation rules**: Custom validation for property values\n- **Query language**: Based on Backend.AI's query filter minilang specification\n- **Entity values via `entitySource`**: Declarative picker for properties whose value is an opaque id (a user UUID chosen by email). Supply `{ search, bootstrap?, resolve?, cancel? }` and the editor renders an Astryx Typeahead (a Tokenizer when the operator is a list one — **arity follows the operator, not the property**). `resolve(ids)` turns ids restored from a saved query string back into labels. Prefer it over `renderInput` for id-valued properties. Same field as on `BAIGraphQLPropertyFilter`.\n- **Custom input via `renderInput`**: Replace the built-in value editor with any controlled control (e.g., a user or storage-host picker). The control stages a value via `onAddCondition(value, label?)` and the edit popover's Apply button commits it; pass a human-readable `label` when the staged value is opaque (e.g. a UUID) so the token shows the label instead. The render prop receives `{ onAddCondition, value, isDisabled }`. Same contract as `BAIGraphQLPropertyFilter`, so controls are interchangeable.\n\n> **to-astryx ticket 28** — the engine is now Astryx `PowerSearch`. The prop contract is unchanged, but the antd chrome it documented (property `Select` + `AutoComplete` + closable `Tag`s + the bespoke reset button) is replaced by PowerSearch's typeahead, tokens and built-in clear. `rule.validate` is advisory now: a violating token is reported through the control's error status instead of being refused. **to-astryx ticket 32** refreshed these stories: the `renderInput` demo below now uses `BAIComplexSelect` (Astryx-native) instead of antd `Select`, matching what a migrated call site actually renders.\n\nThe component generates filter query strings that can be used with Backend.AI's query system, enabling powerful data filtering capabilities across the platform.\n\n**Query Syntax Examples:**\n- Simple filter: `name ilike %john%`\n- Boolean filter: `active == true`\n- Combined filters: `name ilike %john% & active == true`\n        "}}},argTypes:{filterProperties:{description:"Array of filterable properties configuration",control:{type:"object"},table:{type:{summary:"FilterProperty[]"}}},value:{control:{type:"text"},description:"Current filter query string",table:{type:{summary:"string"}}},onChange:{action:"filterChanged",description:"Callback when filter value changes",table:{type:{summary:"(value: string) => void"}}},loading:{control:{type:"boolean"},description:"Show loading state",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}}},render:e=>{const[t,r]=j.useState(e.value);return _.jsx(h,{...e,value:t,onChange:m=>{var y;(y=e.onChange)==null||y.call(e,m),r(m)}})}},a={name:"Basic Usage",parameters:{docs:{description:{story:"Basic property filter with string and boolean properties. Shows how to construct complex filter queries using the visual interface."}}},args:{filterProperties:[{key:"name",defaultOperator:"ilike",propertyLabel:"Name",type:"string"},{key:"description",propertyLabel:"Description",type:"string"},{key:"active",propertyLabel:"Active Status",type:"boolean"}],value:'name ilike "%test%" & active == true'}},o={name:"Number and Datetime Properties",parameters:{docs:{description:{story:'Numeric and time properties offer comparison operators. Numbers serialize bare (`priority >= 10`); datetimes stay quoted (`created_at >= "2026-08-01"`) because the backend parses the string into a date.'}}},args:{filterProperties:[{key:"name",propertyLabel:"Name",type:"string"},{key:"priority",propertyLabel:"Priority",type:"number"},{key:"created_at",propertyLabel:"Created At",type:"datetime"}],value:'priority >= 10 & created_at >= "2026-08-01"'}},i={name:"Custom Validation",parameters:{docs:{description:{story:"Property filter with custom validation rules for email addresses and strict selection options."}}},args:{filterProperties:[{key:"email",propertyLabel:"Email Address",type:"string",rule:{message:"Please enter a valid email address",validate:e=>/\S+@\S+\.\S+/.test(e)}},{key:"status",propertyLabel:"Status",type:"string",options:[{label:"Active",value:"active"},{label:"Inactive",value:"inactive"},{label:"Pending",value:"pending"}],strictSelection:!0}]}},n={name:"Autocomplete Options",parameters:{docs:{description:{story:"Property filter with predefined autocomplete options for easier data entry."}}},args:{filterProperties:[{key:"department",propertyLabel:"Department",type:"string",options:[{label:"Engineering",value:"engineering"},{label:"Marketing",value:"marketing"},{label:"Sales",value:"sales"},{label:"Human Resources",value:"hr"}]},{key:"priority",propertyLabel:"Priority Level",type:"string",options:[{label:"High",value:"high"},{label:"Medium",value:"medium"},{label:"Low",value:"low"}],strictSelection:!0}],value:'department ilike "%engineering%"'}},s={parameters:{docs:{description:{story:"Property filter in its initial state with no applied filters."}}},args:{filterProperties:[{key:"name",propertyLabel:"Name",type:"string"},{key:"enabled",propertyLabel:"Enabled",type:"boolean"}]}},l={parameters:{docs:{description:{story:"Property filter in loading state, typically shown while fetching filter options or processing queries."}}},args:{filterProperties:[{key:"name",propertyLabel:"Name",type:"string"}],loading:!0}},Q=[{label:"alice@example.com",value:"owner-uuid-0001"},{label:"bob@example.com",value:"owner-uuid-0002"},{label:"carol@example.com",value:"owner-uuid-0003"}],p={name:"Custom Input via renderInput",parameters:{docs:{description:{story:"When `renderInput` is provided, the default value editor is replaced with a custom control. The control **stages** a value via `onAddCondition(value, label?)` and the edit popover's Apply button commits it — nothing lands on the filter until Apply. Pass the option label as the second argument so the token shows a human-readable label (e.g. an email) instead of the opaque staged value (e.g. a UUID). The render prop also receives `value` (what is currently staged) and `isDisabled`. Same contract as `BAIGraphQLPropertyFilter`, so controls are interchangeable; for id-valued properties prefer `entitySource`."}}},args:{filterProperties:[{key:"name",propertyLabel:"Name",type:"string",defaultOperator:"ilike"},{key:"owner",propertyLabel:"Owner",type:"string",defaultOperator:"==",renderInput:({onAddCondition:e})=>_.jsx(H,{label:"Owner",isLabelHidden:!0,placeholder:"Select owner",width:220,options:Q,value:null,onChange:t=>{const r=t;e(r==null?void 0:r.value,r==null?void 0:r.label)}})}],onChange:()=>console.log("Filter changed")}},d=[{id:"owner-uuid-0001",label:"alice@example.com",description:"Alice Kim"},{id:"owner-uuid-0002",label:"bob@example.com",description:"Bob Lee"},{id:"owner-uuid-0003",label:"carol@example.com",description:"Carol Park"},{id:"owner-uuid-0004",label:"dave@example.com",description:"Dave Choi"}],u=e=>new Promise(t=>setTimeout(t,e)),R={search:async e=>{await u(400);const t=e.trim().toLowerCase();return t?d.filter(r=>r.label.toLowerCase().includes(t)):d},bootstrap:async()=>(await u(300),d.slice(0,3)),resolve:async e=>(await u(1200),d.filter(t=>e.includes(t.id)))},c={name:"Entity picker via entitySource",parameters:{docs:{description:{story:'`entitySource` is the declarative way to filter on an opaque id: the user searches by email while the query string keeps the UUID (`owner == "owner-uuid-0003"` — the same bytes `renderInput` produced). Arity follows the operator, so a single-value operator like `==` gets a single-select Typeahead. The story is pre-seeded with a raw UUID and this demo source resolves it after ~1.2s, so the token starts as the UUID and swaps to the email — what happens when a saved query is reopened. Without `resolve` the token simply keeps showing the raw id.'}}},args:{filterProperties:[{key:"name",propertyLabel:"Name",type:"string",defaultOperator:"ilike"},{key:"owner",propertyLabel:"Owner",type:"string",defaultOperator:"==",entitySource:R}],value:'owner == "owner-uuid-0003"',onChange:()=>console.log("Filter changed")}};var g,b,v;a.parameters={...a.parameters,docs:{...(g=a.parameters)==null?void 0:g.docs,source:{originalSource:`{
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
}`,...(k=(w=o.parameters)==null?void 0:w.docs)==null?void 0:k.source}}};var S,P,L;i.parameters={...i.parameters,docs:{...(S=i.parameters)==null?void 0:S.docs,source:{originalSource:`{
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
}`,...(L=(P=i.parameters)==null?void 0:P.docs)==null?void 0:L.source}}};var A,I,C;n.parameters={...n.parameters,docs:{...(A=n.parameters)==null?void 0:A.docs,source:{originalSource:`{
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
}`,...(C=(I=n.parameters)==null?void 0:I.docs)==null?void 0:C.source}}};var x,D,O;s.parameters={...s.parameters,docs:{...(x=s.parameters)==null?void 0:x.docs,source:{originalSource:`{
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
}`,...(O=(D=s.parameters)==null?void 0:D.docs)==null?void 0:O.source}}};var U,q,B;l.parameters={...l.parameters,docs:{...(U=l.parameters)==null?void 0:U.docs,source:{originalSource:`{
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
}`,...(B=(q=l.parameters)==null?void 0:q.docs)==null?void 0:B.source}}};var E,N,T;p.parameters={...p.parameters,docs:{...(E=p.parameters)==null?void 0:E.docs,source:{originalSource:`{
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
    onChange: () => console.log('Filter changed')
  }
}`,...(T=(N=p.parameters)==null?void 0:N.docs)==null?void 0:T.source}}};var F,W,V;c.parameters={...c.parameters,docs:{...(F=c.parameters)==null?void 0:F.docs,source:{originalSource:`{
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
    onChange: () => console.log('Filter changed')
  }
}`,...(V=(W=c.parameters)==null?void 0:W.docs)==null?void 0:V.source}}};const at=["Default","NumberAndDatetime","WithCustomValidation","WithAutocompleteOptions","EmptyState","LoadingState","WithRenderInput","WithEntitySource"];export{a as Default,s as EmptyState,l as LoadingState,o as NumberAndDatetime,n as WithAutocompleteOptions,i as WithCustomValidation,c as WithEntitySource,p as WithRenderInput,at as __namedExportsOrder,rt as default};
