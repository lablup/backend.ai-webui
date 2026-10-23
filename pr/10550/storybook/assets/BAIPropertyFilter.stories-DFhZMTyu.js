import{j as F,r as V}from"./iframe-BKMvH_um.js";import{B as U}from"./BAIComplexSelect-D_2_rls6.js";import{B as d}from"./BAIPropertyFilter-vzjnIEeO.js";import"./preload-helper-Dp1pzeXC.js";import"./compiled-D_YGP6zo.js";import"./useDevWarning-DQu3qBRa.js";import"./usePopover-D2s74It0.js";import"./rtlStyles-T4i24HtE.js";import"./composeEventHandlers-BolWE7qY.js";import"./InputClearButton-C8QGbD5P.js";import"./FieldStatus-DjEydFi-.js";import"./FormLayoutContext-B1tvg9H1.js";import"./useIsHydrating-Dlt0uyfi.js";import"./useIndicator-CB73pC80.js";import"./Token-DE9om3n3.js";import"./disabledInteraction-BxnC_-go.js";import"./Divider-DySNOmrG.js";import"./SelectorOption-Dvb2JVud.js";import"./Item-CbcPOop6.js";import"./computeTargetAndRel-BGwjeA1c.js";import"./index-CgVBXs8l.js";import"./isNumber-DPQBKFtF.js";import"./toString-D2D-XEO-.js";import"./isSymbol-DWITYAJi.js";import"./filter-DpKx6nOn.js";import"./_baseEach-D6hWb9CT.js";import"./get-BaB3PaDN.js";import"./_baseGet-CYw2M-gm.js";import"./identity-DKeuBCMA.js";import"./isEmpty-BI80rgKD.js";import"./BAIPowerSearchAdapters-Bkhvbfzp.js";import"./toNumber-BK8yjbOs.js";import"./_trimmedEndIndex-DuQxD0U0.js";import"./_charsEndIndex-BHSW-HpW.js";import"./_baseSlice-F8doVSIJ.js";import"./_baseIndexOf-Be9UPhX8.js";import"./_baseFindIndex-Cj99RmFE.js";import"./characters-DWaYg7k3.js";import"./NumberInput-Czbn0dRe.js";import"./useInputStatusIcon-CWZJuRVu.js";import"./useResolvedRequired-DoLCQtS2.js";import"./fieldParts-h_IogY1W.js";import"./Selector-Dk2bgGvn.js";import"./useMenuOverflow-DnNoOgqb.js";import"./Section-CSZ2d87g.js";import"./clampInlineSize-CP0OWgfb.js";import"./isRtlElement-B2-7SF8s.js";import"./BottomSheet-B1XjOkwj.js";import"./useScrollableArea-B89DnZGj.js";import"./TextInput-BnG1BwKj.js";import"./VStack-y_mEZbNO.js";import"./isString-Ch3WrNvE.js";import"./compact-CU4PNV0P.js";import"./map-BKJUCc4f.js";import"./includes-BXu3mEIM.js";import"./toInteger-DY0laY5b.js";import"./toFinite-B1oQGVy7.js";import"./isNil-CHIgUVhi.js";import"./useControllableValue-BeyAscO_.js";import"./find-CSMWfDBQ.js";import"./keyBy-CQvYPQjG.js";import"./_baseAssignValue-Uyx0c1eo.js";import"./_defineProperty-DD-f1Y37.js";import"./forEach-BZf_9qcE.js";import"./_arrayEach-DpGxo2Of.js";import"./split-8U_7846K.js";import"./_isIterateeCall-uug0QjmO.js";import"./join-DKskq_cE.js";import"./uniq-huMAG0Ki.js";import"./_baseUniq-BpchbmR6.js";const et={title:"Filter/BAIPropertyFilter",component:d,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:"\n**BAIPropertyFilter** is a sophisticated filtering component designed for Backend.AI applications. It provides a user-friendly interface for constructing complex filter queries with support for:\n\n- **Multiple property types**: String and boolean properties with type-specific operators\n- **Dynamic query building**: Visual interface for constructing filter expressions\n- **Autocomplete support**: Predefined options and suggestions for property values\n- **Validation rules**: Custom validation for property values\n- **Query language**: Based on Backend.AI's query filter minilang specification\n- **Custom input via `renderInput`**: Replace the built-in value editor with any controlled control (e.g., a user or storage-host picker). The control stages a value via `onAddCondition(value, label?)` and the edit popover's Apply button commits it; pass a human-readable `label` when the committed value is opaque (e.g. a UUID) so the token shows the label instead. Same contract as `BAIGraphQLPropertyFilter`, so controls are interchangeable.\n\n> **to-astryx ticket 28** — the engine is now Astryx `PowerSearch`. The prop contract is unchanged, but the antd chrome it documented (property `Select` + `AutoComplete` + closable `Tag`s + the bespoke reset button) is replaced by PowerSearch's typeahead, tokens and built-in clear. `rule.validate` is advisory now: a violating token is reported through the control's error status instead of being refused. **to-astryx ticket 32** refreshed these stories: the `renderInput` demo below now uses `BAIComplexSelect` (Astryx-native) instead of antd `Select`, matching what a migrated call site actually renders.\n\nThe component generates filter query strings that can be used with Backend.AI's query system, enabling powerful data filtering capabilities across the platform.\n\n**Query Syntax Examples:**\n- Simple filter: `name ilike %john%`\n- Boolean filter: `active == true`\n- Combined filters: `name ilike %john% & active == true`\n        "}}},argTypes:{filterProperties:{description:"Array of filterable properties configuration",control:{type:"object"},table:{type:{summary:"FilterProperty[]"}}},value:{control:{type:"text"},description:"Current filter query string",table:{type:{summary:"string"}}},onChange:{action:"filterChanged",description:"Callback when filter value changes",table:{type:{summary:"(value: string) => void"}}},loading:{control:{type:"boolean"},description:"Show loading state",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}}},render:e=>{const[m,c]=V.useState(e.value);return F.jsx(d,{...e,value:m,onChange:r=>{var t;(t=e.onChange)==null||t.call(e,r),c(r)}})}},a={name:"Basic Usage",parameters:{docs:{description:{story:"Basic property filter with string and boolean properties. Shows how to construct complex filter queries using the visual interface."}}},args:{filterProperties:[{key:"name",defaultOperator:"ilike",propertyLabel:"Name",type:"string"},{key:"description",propertyLabel:"Description",type:"string"},{key:"active",propertyLabel:"Active Status",type:"boolean"}],value:'name ilike "%test%" & active == true'}},o={name:"Number and Datetime Properties",parameters:{docs:{description:{story:'Numeric and time properties offer comparison operators. Numbers serialize bare (`priority >= 10`); datetimes stay quoted (`created_at >= "2026-08-01"`) because the backend parses the string into a date.'}}},args:{filterProperties:[{key:"name",propertyLabel:"Name",type:"string"},{key:"priority",propertyLabel:"Priority",type:"number"},{key:"created_at",propertyLabel:"Created At",type:"datetime"}],value:'priority >= 10 & created_at >= "2026-08-01"'}},i={name:"Custom Validation",parameters:{docs:{description:{story:"Property filter with custom validation rules for email addresses and strict selection options."}}},args:{filterProperties:[{key:"email",propertyLabel:"Email Address",type:"string",rule:{message:"Please enter a valid email address",validate:e=>/\S+@\S+\.\S+/.test(e)}},{key:"status",propertyLabel:"Status",type:"string",options:[{label:"Active",value:"active"},{label:"Inactive",value:"inactive"},{label:"Pending",value:"pending"}],strictSelection:!0}]}},n={name:"Autocomplete Options",parameters:{docs:{description:{story:"Property filter with predefined autocomplete options for easier data entry."}}},args:{filterProperties:[{key:"department",propertyLabel:"Department",type:"string",options:[{label:"Engineering",value:"engineering"},{label:"Marketing",value:"marketing"},{label:"Sales",value:"sales"},{label:"Human Resources",value:"hr"}]},{key:"priority",propertyLabel:"Priority Level",type:"string",options:[{label:"High",value:"high"},{label:"Medium",value:"medium"},{label:"Low",value:"low"}],strictSelection:!0}],value:'department ilike "%engineering%"'}},s={parameters:{docs:{description:{story:"Property filter in its initial state with no applied filters."}}},args:{filterProperties:[{key:"name",propertyLabel:"Name",type:"string"},{key:"enabled",propertyLabel:"Enabled",type:"boolean"}]}},p={parameters:{docs:{description:{story:"Property filter in loading state, typically shown while fetching filter options or processing queries."}}},args:{filterProperties:[{key:"name",propertyLabel:"Name",type:"string"}],loading:!0}},u=[{label:"alice@example.com",value:"owner-uuid-0001"},{label:"bob@example.com",value:"owner-uuid-0002"},{label:"carol@example.com",value:"owner-uuid-0003"}],l={name:"Custom Input via renderInput",parameters:{docs:{description:{story:"When `renderInput` is provided, the built-in value editor is replaced with a custom control. The control stages a value via `onAddCondition(value, label?)` and the edit popover's Apply button commits it; feed the render prop's `value` back into the control so the staged pick stays visible (and when an existing token is reopened for editing). Pass the option label as the second argument so the token shows a human-readable label (e.g. an email) instead of the opaque committed value (e.g. a UUID). Same contract as `BAIGraphQLPropertyFilter`, so controls are interchangeable."}}},args:{filterProperties:[{key:"name",propertyLabel:"Name",type:"string",defaultOperator:"ilike"},{key:"owner",propertyLabel:"Owner",type:"string",defaultOperator:"==",renderInput:({onAddCondition:e,value:m,isDisabled:c})=>F.jsx(U,{label:"Owner",isLabelHidden:!0,placeholder:"Select owner",options:u,isDisabled:c,value:u.find(r=>r.value===m)??null,onChange:r=>{const t=r;e(t==null?void 0:t.value,t==null?void 0:t.label)}})}],onChange:()=>console.log("Filter changed")}};var y,g,b;a.parameters={...a.parameters,docs:{...(y=a.parameters)==null?void 0:y.docs,source:{originalSource:`{
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
}`,...(b=(g=a.parameters)==null?void 0:g.docs)==null?void 0:b.source}}};var h,v,f;o.parameters={...o.parameters,docs:{...(h=o.parameters)==null?void 0:h.docs,source:{originalSource:`{
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
}`,...(f=(v=o.parameters)==null?void 0:v.docs)==null?void 0:f.source}}};var k,w,S;i.parameters={...i.parameters,docs:{...(k=i.parameters)==null?void 0:k.docs,source:{originalSource:`{
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
}`,...(S=(w=i.parameters)==null?void 0:w.docs)==null?void 0:S.source}}};var P,L,A;n.parameters={...n.parameters,docs:{...(P=n.parameters)==null?void 0:P.docs,source:{originalSource:`{
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
}`,...(A=(L=n.parameters)==null?void 0:L.docs)==null?void 0:A.source}}};var I,C,x;s.parameters={...s.parameters,docs:{...(I=s.parameters)==null?void 0:I.docs,source:{originalSource:`{
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
}`,...(x=(C=s.parameters)==null?void 0:C.docs)==null?void 0:x.source}}};var B,O,N;p.parameters={...p.parameters,docs:{...(B=p.parameters)==null?void 0:B.docs,source:{originalSource:`{
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
}`,...(N=(O=p.parameters)==null?void 0:O.docs)==null?void 0:N.source}}};var D,q,E;l.parameters={...l.parameters,docs:{...(D=l.parameters)==null?void 0:D.docs,source:{originalSource:`{
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
      }) => <BAIComplexSelect label="Owner" isLabelHidden placeholder="Select owner" options={sampleOwnerOptions} isDisabled={isDisabled} value={sampleOwnerOptions.find(option => option.value === value) ?? null} onChange={next => {
        const labeled = next as BAILabeledValue | null;
        onAddCondition(labeled?.value, labeled?.label);
      }} />
    }],
    onChange: () => console.log('Filter changed')
  }
}`,...(E=(q=l.parameters)==null?void 0:q.docs)==null?void 0:E.source}}};const tt=["Default","NumberAndDatetime","WithCustomValidation","WithAutocompleteOptions","EmptyState","LoadingState","WithRenderInput"];export{a as Default,s as EmptyState,p as LoadingState,o as NumberAndDatetime,n as WithAutocompleteOptions,i as WithCustomValidation,l as WithRenderInput,tt as __namedExportsOrder,et as default};
