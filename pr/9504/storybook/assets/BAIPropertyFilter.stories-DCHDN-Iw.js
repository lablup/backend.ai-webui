import{j as V,r as F}from"./iframe-AcEiVkqu.js";import{B as U}from"./BAIComplexSelect-B9dKz9kv.js";import{B as c}from"./BAIPropertyFilter-DUlWbpHe.js";import"./preload-helper-Dp1pzeXC.js";import"./useIndicator-BAKJYIl1.js";import"./isRenderable-BUV0eL6r.js";import"./clamp-C-cTRMda.js";import"./_baseClamp-DVUOCJN_.js";import"./toFinite-Cx4vYxnt.js";import"./_trimmedEndIndex-DuQxD0U0.js";import"./isSymbol-D5rOO5W8.js";import"./filter-CKZ_qXKz.js";import"./_baseEach-Ecf9eU6k.js";import"./get-DZD-ElFS.js";import"./_baseGet-r7SKtjgc.js";import"./toString-BZpvW8tR.js";import"./identity-DKeuBCMA.js";import"./_baseSlice-F8doVSIJ.js";import"./toInteger-DiD_3gdl.js";import"./map-TvWgrxlt.js";import"./usePopover-BUH-Ynw4.js";import"./useDevWarning-ZQJW6xBJ.js";import"./rtlStyles-T4i24HtE.js";import"./useResolvedRequired-BuVKqpmx.js";import"./composeEventHandlers-BolWE7qY.js";import"./InputClearButton-CQ-g0Th3.js";import"./Divider-C2pdEljI.js";import"./isNumber-BCAm9X3F.js";import"./compact-CU4PNV0P.js";import"./some-CXAOxWmq.js";import"./Token-C6PjtHPg.js";import"./SelectorOption-BltQtqOU.js";import"./Item-l_MNwd90.js";import"./index-B7WSTLga.js";import"./isEmpty-Bq9RlgZ_.js";import"./PowerSearch-BGStpL1Q.js";import"./_charsEndIndex-BHSW-HpW.js";import"./_baseIndexOf-Be9UPhX8.js";import"./_baseFindIndex-Cj99RmFE.js";import"./isNil-CHIgUVhi.js";import"./includes-D8gYWcGJ.js";import"./isString-SMgIGaPC.js";import"./toLower-CcwgCg_-.js";import"./_baseAssignValue-DhZti-WT.js";import"./_defineProperty-DqAWsOak.js";import"./characters-DWaYg7k3.js";import"./NumberInput-Bsge--nB.js";import"./useInputStatusIcon-BvI96D99.js";import"./InputGroupContext-VWgls_9x.js";import"./Selector-cQhtb7ho.js";import"./useTypeahead-Nu0qoCsb.js";import"./isRtlElement-B2-7SF8s.js";import"./TextInput-Duhdr-N3.js";import"./VStack-BEJWe-om.js";import"./useControllableValue-DD2RtZJO.js";import"./find-CcMQOZJg.js";import"./join-DKskq_cE.js";import"./forEach-DWA8Brwy.js";import"./_arrayEach-DpGxo2Of.js";import"./_castFunction-a6W-o7Lo.js";import"./split-BYqWGVik.js";import"./_isIterateeCall-RZvF9wSO.js";import"./uniq-CON70IuU.js";import"./_baseUniq-BAbXb_lj.js";import"./noop-DX6rZLP_.js";const Xe={title:"Filter/BAIPropertyFilter",component:c,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:"\n**BAIPropertyFilter** is a sophisticated filtering component designed for Backend.AI applications. It provides a user-friendly interface for constructing complex filter queries with support for:\n\n- **Multiple property types**: String and boolean properties with type-specific operators\n- **Dynamic query building**: Visual interface for constructing filter expressions\n- **Autocomplete support**: Predefined options and suggestions for property values\n- **Validation rules**: Custom validation for property values\n- **Query language**: Based on Backend.AI's query filter minilang specification\n- **Custom input via `renderInput`**: Replace the built-in value editor with any controlled control (e.g., a user or storage-host picker). The control stages a value via `onAddCondition(value, label?)` and the edit popover's Apply button commits it; pass a human-readable `label` when the committed value is opaque (e.g. a UUID) so the token shows the label instead. Same contract as `BAIGraphQLPropertyFilter`, so controls are interchangeable.\n\n> **to-astryx ticket 28** — the engine is now Astryx `PowerSearch`. The prop contract is unchanged, but the antd chrome it documented (property `Select` + `AutoComplete` + closable `Tag`s + the bespoke reset button) is replaced by PowerSearch's typeahead, tokens and built-in clear. `rule.validate` is advisory now: a violating token is reported through the control's error status instead of being refused. **to-astryx ticket 32** refreshed these stories: the `renderInput` demo below now uses `BAIComplexSelect` (Astryx-native) instead of antd `Select`, matching what a migrated call site actually renders.\n\nThe component generates filter query strings that can be used with Backend.AI's query system, enabling powerful data filtering capabilities across the platform.\n\n**Query Syntax Examples:**\n- Simple filter: `name ilike %john%`\n- Boolean filter: `active == true`\n- Combined filters: `name ilike %john% & active == true`\n        "}}},argTypes:{filterProperties:{description:"Array of filterable properties configuration",control:{type:"object"},table:{type:{summary:"FilterProperty[]"}}},value:{control:{type:"text"},description:"Current filter query string",table:{type:{summary:"string"}}},onChange:{action:"filterChanged",description:"Callback when filter value changes",table:{type:{summary:"(value: string) => void"}}},loading:{control:{type:"boolean"},description:"Show loading state",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}}},render:e=>{const[r,a]=F.useState(e.value);return V.jsx(c,{...e,value:r,onChange:o=>{var t;(t=e.onChange)==null||t.call(e,o),a(o)}})}},i={name:"Basic Usage",parameters:{docs:{description:{story:"Basic property filter with string and boolean properties. Shows how to construct complex filter queries using the visual interface."}}},args:{filterProperties:[{key:"name",defaultOperator:"ilike",propertyLabel:"Name",type:"string"},{key:"description",propertyLabel:"Description",type:"string"},{key:"active",propertyLabel:"Active Status",type:"boolean"}],value:'name ilike "%test%" & active == true'}},n={name:"Number and Datetime Properties",parameters:{docs:{description:{story:'Numeric and time properties offer comparison operators. Numbers serialize bare (`priority >= 10`); datetimes stay quoted (`created_at >= "2026-08-01"`) because the backend parses the string into a date.'}}},args:{filterProperties:[{key:"name",propertyLabel:"Name",type:"string"},{key:"priority",propertyLabel:"Priority",type:"number"},{key:"created_at",propertyLabel:"Created At",type:"datetime"}],value:'priority >= 10 & created_at >= "2026-08-01"'}},s={name:"Custom Validation",parameters:{docs:{description:{story:"Property filter with custom validation rules for email addresses and strict selection options."}}},args:{filterProperties:[{key:"email",propertyLabel:"Email Address",type:"string",rule:{message:"Please enter a valid email address",validate:e=>/\S+@\S+\.\S+/.test(e)}},{key:"status",propertyLabel:"Status",type:"string",options:[{label:"Active",value:"active"},{label:"Inactive",value:"inactive"},{label:"Pending",value:"pending"}],strictSelection:!0}]}},p={name:"Autocomplete Options",parameters:{docs:{description:{story:"Property filter with predefined autocomplete options for easier data entry."}}},args:{filterProperties:[{key:"department",propertyLabel:"Department",type:"string",options:[{label:"Engineering",value:"engineering"},{label:"Marketing",value:"marketing"},{label:"Sales",value:"sales"},{label:"Human Resources",value:"hr"}]},{key:"priority",propertyLabel:"Priority Level",type:"string",options:[{label:"High",value:"high"},{label:"Medium",value:"medium"},{label:"Low",value:"low"}],strictSelection:!0}],value:'department ilike "%engineering%"'}},l={parameters:{docs:{description:{story:"Property filter in its initial state with no applied filters."}}},args:{filterProperties:[{key:"name",propertyLabel:"Name",type:"string"},{key:"enabled",propertyLabel:"Enabled",type:"boolean"}]}},m={parameters:{docs:{description:{story:"Property filter in loading state, typically shown while fetching filter options or processing queries."}}},args:{filterProperties:[{key:"name",propertyLabel:"Name",type:"string"}],loading:!0}},u=[{label:"alice@example.com",value:"owner-uuid-0001"},{label:"bob@example.com",value:"owner-uuid-0002"},{label:"carol@example.com",value:"owner-uuid-0003"}],W=(e,r)=>e.find(a=>a.value===r)??null,d={name:"Custom Input via renderInput",parameters:{docs:{description:{story:"When `renderInput` is provided, the built-in value editor is replaced with a custom control. The control stages a value via `onAddCondition(value, label?)` and the edit popover's Apply button commits it; feed the render prop's `value` back into the control so the staged pick stays visible (and when an existing token is reopened for editing). Pass the option label as the second argument so the token shows a human-readable label (e.g. an email) instead of the opaque committed value (e.g. a UUID). Same contract as `BAIGraphQLPropertyFilter`, so controls are interchangeable."}}},args:{filterProperties:[{key:"name",propertyLabel:"Name",type:"string",defaultOperator:"ilike"},{key:"owner",propertyLabel:"Owner",type:"string",defaultOperator:"==",renderInput:({onAddCondition:e,value:r,isDisabled:a})=>V.jsx(U,{label:"Owner",isLabelHidden:!0,placeholder:"Select owner",width:220,options:u,isDisabled:a,value:W(u,r),onChange:o=>{const t=o;e(t==null?void 0:t.value,t==null?void 0:t.label)}})}],onChange:()=>console.log("Filter changed")}};var y,g,b;i.parameters={...i.parameters,docs:{...(y=i.parameters)==null?void 0:y.docs,source:{originalSource:`{
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
}`,...(b=(g=i.parameters)==null?void 0:g.docs)==null?void 0:b.source}}};var h,v,f;n.parameters={...n.parameters,docs:{...(h=n.parameters)==null?void 0:h.docs,source:{originalSource:`{
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
}`,...(f=(v=n.parameters)==null?void 0:v.docs)==null?void 0:f.source}}};var k,w,S;s.parameters={...s.parameters,docs:{...(k=s.parameters)==null?void 0:k.docs,source:{originalSource:`{
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
}`,...(S=(w=s.parameters)==null?void 0:w.docs)==null?void 0:S.source}}};var P,L,A;p.parameters={...p.parameters,docs:{...(P=p.parameters)==null?void 0:P.docs,source:{originalSource:`{
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
}`,...(A=(L=p.parameters)==null?void 0:L.docs)==null?void 0:A.source}}};var I,C,x;l.parameters={...l.parameters,docs:{...(I=l.parameters)==null?void 0:I.docs,source:{originalSource:`{
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
}`,...(x=(C=l.parameters)==null?void 0:C.docs)==null?void 0:x.source}}};var B,O,N;m.parameters={...m.parameters,docs:{...(B=m.parameters)==null?void 0:B.docs,source:{originalSource:`{
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
}`,...(N=(O=m.parameters)==null?void 0:O.docs)==null?void 0:N.source}}};var D,q,E;d.parameters={...d.parameters,docs:{...(D=d.parameters)==null?void 0:D.docs,source:{originalSource:`{
  name: 'Custom Input via renderInput',
  parameters: {
    docs: {
      description: {
        story: "When \`renderInput\` is provided, the built-in value editor is replaced with a custom control. The control stages a value via \`onAddCondition(value, label?)\` and the edit popover's Apply button commits it; feed the render prop's \`value\` back into the control so the staged pick stays visible (and when an existing token is reopened for editing). Pass the option label as the second argument so the token shows a human-readable label (e.g. an email) instead of the opaque committed value (e.g. a UUID). Same contract as \`BAIGraphQLPropertyFilter\`, so controls are interchangeable."
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
        onAddCondition,
        value,
        isDisabled
      }) => <BAIComplexSelect label="Owner" isLabelHidden placeholder="Select owner" width={220} options={sampleOwnerOptions} isDisabled={isDisabled} value={toLabeledValue(sampleOwnerOptions, value)} onChange={next => {
        const labeled = next as BAILabeledValue | null;
        onAddCondition(labeled?.value, labeled?.label);
      }} />
    }],
    onChange: () => console.log('Filter changed')
  }
}`,...(E=(q=d.parameters)==null?void 0:q.docs)==null?void 0:E.source}}};const Ye=["Default","NumberAndDatetime","WithCustomValidation","WithAutocompleteOptions","EmptyState","LoadingState","WithRenderInput"];export{i as Default,l as EmptyState,m as LoadingState,n as NumberAndDatetime,p as WithAutocompleteOptions,s as WithCustomValidation,d as WithRenderInput,Ye as __namedExportsOrder,Xe as default};
