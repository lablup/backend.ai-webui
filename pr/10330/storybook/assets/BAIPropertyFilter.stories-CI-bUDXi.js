import{j as F,r as V}from"./iframe-DKLUwu6g.js";import{B as U}from"./BAIComplexSelect-BnpEHkBc.js";import{B as d}from"./BAIPropertyFilter-B2Dv09ZL.js";import"./preload-helper-Dp1pzeXC.js";import"./compiled-D_YGP6zo.js";import"./useDevWarning-B4St1Es4.js";import"./usePopover-CtejgcR0.js";import"./rtlStyles-T4i24HtE.js";import"./composeEventHandlers-BolWE7qY.js";import"./InputClearButton-DUlJD7d1.js";import"./inputStyles.stylex-Bztz6H8O.js";import"./Field-D0E4R3qn.js";import"./FieldStatus-CDlpxVFM.js";import"./FormLayoutContext-D7dDtYY4.js";import"./useIsHydrating-DCAfefL8.js";import"./useIndicator-Cx0dMm7Z.js";import"./Token-1tA7ZEwk.js";import"./disabledInteraction-C5LFyiPq.js";import"./Divider-DF7NfMO-.js";import"./SelectorOption-Qval0ySu.js";import"./Item-Clv-F2Yf.js";import"./computeTargetAndRel-BGwjeA1c.js";import"./index-C5PEfXYS.js";import"./isNumber-2U77PCeW.js";import"./toString-nLBz1vao.js";import"./isSymbol-aa5Ubb4j.js";import"./filter-Cbi-sriU.js";import"./_baseEach-iDyTRpmh.js";import"./get-DcJyjH2p.js";import"./_baseGet-BcKcFTG-.js";import"./identity-DKeuBCMA.js";import"./isEmpty-B5O9_-oQ.js";import"./BAIPowerSearchAdapters-DfZ3d2u1.js";import"./toNumber-1_tyPd5e.js";import"./_trimmedEndIndex-DuQxD0U0.js";import"./_charsEndIndex-BHSW-HpW.js";import"./_baseSlice-F8doVSIJ.js";import"./_baseIndexOf-Be9UPhX8.js";import"./_baseFindIndex-Cj99RmFE.js";import"./BaseTypeahead-SOyUD1KS.js";import"./useAnnounceRenderedText-DzQP8Qyh.js";import"./useHighlightedOptionScroll-C4ufPlDN.js";import"./clampInlineSize-CP0OWgfb.js";import"./characters-DWaYg7k3.js";import"./useLocale-Cca6nAfQ.js";import"./Tokenizer-BAP7OEK3.js";import"./fieldParts-BNUrMfNg.js";import"./NumberInput-DdzFXLcw.js";import"./useInputStatusIcon-BcMhZKWN.js";import"./useResolvedRequired-bKKIGlp3.js";import"./inputAria-CStWn1wH.js";import"./Selector-jOP9ARqn.js";import"./selectorPresentation.stylex-BY6pJwqf.js";import"./Section-BDC2eSnj.js";import"./useFocusReturnVisibility-BVnos04J.js";import"./useMenuOverflow-DdD6qC30.js";import"./DateRangeInput-Cib95Lig.js";import"./Calendar-B0IkgiMB.js";import"./isRtlElement-B2-7SF8s.js";import"./DateInput-DuZJCo0x.js";import"./inputPresentation-DNZjWQnL.js";import"./MonthYearWheels-DdLBNOzy.js";import"./BottomSheet-Cm4i7nWC.js";import"./useScrollableArea-C96tkJV1.js";import"./TimeInput-C5-_RyGP.js";import"./NativeTimeSegment-DysX1KIh.js";import"./Typeahead-y0JGCMrX.js";import"./TextInput-Dd8_PHZy.js";import"./VStack-CD3zNs0t.js";import"./isString-D-Qv4V-l.js";import"./compact-CU4PNV0P.js";import"./map-B1z_h2XP.js";import"./includes-9F4RVhdH.js";import"./toInteger-BnFrVy-a.js";import"./toFinite-C6xzHuzt.js";import"./isNil-CHIgUVhi.js";import"./useControllableValue-CjdnfP_g.js";import"./find-BWbhJ1CR.js";import"./keyBy-CNqJPY8B.js";import"./_baseAssignValue-D9pGN37a.js";import"./_defineProperty-Bdrd6zx_.js";import"./forEach-DMQ5V650.js";import"./_arrayEach-DpGxo2Of.js";import"./split-DveaYX8h.js";import"./_isIterateeCall-DXpNfLlr.js";import"./join-DKskq_cE.js";import"./uniq-DQuKdq0a.js";import"./_baseUniq-Cjv_mNPe.js";import"./_arrayIncludes-B0rj_Tme.js";const ft={title:"Filter/BAIPropertyFilter",component:d,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:"\n**BAIPropertyFilter** is a sophisticated filtering component designed for Backend.AI applications. It provides a user-friendly interface for constructing complex filter queries with support for:\n\n- **Multiple property types**: String and boolean properties with type-specific operators\n- **Dynamic query building**: Visual interface for constructing filter expressions\n- **Autocomplete support**: Predefined options and suggestions for property values\n- **Validation rules**: Custom validation for property values\n- **Query language**: Based on Backend.AI's query filter minilang specification\n- **Custom input via `renderInput`**: Replace the built-in value editor with any controlled control (e.g., a user or storage-host picker). The control stages a value via `onAddCondition(value, label?)` and the edit popover's Apply button commits it; pass a human-readable `label` when the committed value is opaque (e.g. a UUID) so the token shows the label instead. Same contract as `BAIGraphQLPropertyFilter`, so controls are interchangeable.\n\n> **to-astryx ticket 28** — the engine is now Astryx `PowerSearch`. The prop contract is unchanged, but the antd chrome it documented (property `Select` + `AutoComplete` + closable `Tag`s + the bespoke reset button) is replaced by PowerSearch's typeahead, tokens and built-in clear. `rule.validate` is advisory now: a violating token is reported through the control's error status instead of being refused. **to-astryx ticket 32** refreshed these stories: the `renderInput` demo below now uses `BAIComplexSelect` (Astryx-native) instead of antd `Select`, matching what a migrated call site actually renders.\n\nThe component generates filter query strings that can be used with Backend.AI's query system, enabling powerful data filtering capabilities across the platform.\n\n**Query Syntax Examples:**\n- Simple filter: `name ilike %john%`\n- Boolean filter: `active == true`\n- Combined filters: `name ilike %john% & active == true`\n        "}}},argTypes:{filterProperties:{description:"Array of filterable properties configuration",control:{type:"object"},table:{type:{summary:"FilterProperty[]"}}},value:{control:{type:"text"},description:"Current filter query string",table:{type:{summary:"string"}}},onChange:{action:"filterChanged",description:"Callback when filter value changes",table:{type:{summary:"(value: string) => void"}}},loading:{control:{type:"boolean"},description:"Show loading state",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}}},render:e=>{const[m,c]=V.useState(e.value);return F.jsx(d,{...e,value:m,onChange:r=>{var t;(t=e.onChange)==null||t.call(e,r),c(r)}})}},a={name:"Basic Usage",parameters:{docs:{description:{story:"Basic property filter with string and boolean properties. Shows how to construct complex filter queries using the visual interface."}}},args:{filterProperties:[{key:"name",defaultOperator:"ilike",propertyLabel:"Name",type:"string"},{key:"description",propertyLabel:"Description",type:"string"},{key:"active",propertyLabel:"Active Status",type:"boolean"}],value:'name ilike "%test%" & active == true'}},o={name:"Number and Datetime Properties",parameters:{docs:{description:{story:'Numeric and time properties offer comparison operators. Numbers serialize bare (`priority >= 10`); datetimes stay quoted (`created_at >= "2026-08-01"`) because the backend parses the string into a date.'}}},args:{filterProperties:[{key:"name",propertyLabel:"Name",type:"string"},{key:"priority",propertyLabel:"Priority",type:"number"},{key:"created_at",propertyLabel:"Created At",type:"datetime"}],value:'priority >= 10 & created_at >= "2026-08-01"'}},i={name:"Custom Validation",parameters:{docs:{description:{story:"Property filter with custom validation rules for email addresses and strict selection options."}}},args:{filterProperties:[{key:"email",propertyLabel:"Email Address",type:"string",rule:{message:"Please enter a valid email address",validate:e=>/\S+@\S+\.\S+/.test(e)}},{key:"status",propertyLabel:"Status",type:"string",options:[{label:"Active",value:"active"},{label:"Inactive",value:"inactive"},{label:"Pending",value:"pending"}],strictSelection:!0}]}},n={name:"Autocomplete Options",parameters:{docs:{description:{story:"Property filter with predefined autocomplete options for easier data entry."}}},args:{filterProperties:[{key:"department",propertyLabel:"Department",type:"string",options:[{label:"Engineering",value:"engineering"},{label:"Marketing",value:"marketing"},{label:"Sales",value:"sales"},{label:"Human Resources",value:"hr"}]},{key:"priority",propertyLabel:"Priority Level",type:"string",options:[{label:"High",value:"high"},{label:"Medium",value:"medium"},{label:"Low",value:"low"}],strictSelection:!0}],value:'department ilike "%engineering%"'}},s={parameters:{docs:{description:{story:"Property filter in its initial state with no applied filters."}}},args:{filterProperties:[{key:"name",propertyLabel:"Name",type:"string"},{key:"enabled",propertyLabel:"Enabled",type:"boolean"}]}},p={parameters:{docs:{description:{story:"Property filter in loading state, typically shown while fetching filter options or processing queries."}}},args:{filterProperties:[{key:"name",propertyLabel:"Name",type:"string"}],loading:!0}},u=[{label:"alice@example.com",value:"owner-uuid-0001"},{label:"bob@example.com",value:"owner-uuid-0002"},{label:"carol@example.com",value:"owner-uuid-0003"}],l={name:"Custom Input via renderInput",parameters:{docs:{description:{story:"When `renderInput` is provided, the built-in value editor is replaced with a custom control. The control stages a value via `onAddCondition(value, label?)` and the edit popover's Apply button commits it; feed the render prop's `value` back into the control so the staged pick stays visible (and when an existing token is reopened for editing). Pass the option label as the second argument so the token shows a human-readable label (e.g. an email) instead of the opaque committed value (e.g. a UUID). Same contract as `BAIGraphQLPropertyFilter`, so controls are interchangeable."}}},args:{filterProperties:[{key:"name",propertyLabel:"Name",type:"string",defaultOperator:"ilike"},{key:"owner",propertyLabel:"Owner",type:"string",defaultOperator:"==",renderInput:({onAddCondition:e,value:m,isDisabled:c})=>F.jsx(U,{label:"Owner",isLabelHidden:!0,placeholder:"Select owner",options:u,isDisabled:c,value:u.find(r=>r.value===m)??null,onChange:r=>{const t=r;e(t==null?void 0:t.value,t==null?void 0:t.label)}})}],onChange:()=>console.log("Filter changed")}};var y,g,b;a.parameters={...a.parameters,docs:{...(y=a.parameters)==null?void 0:y.docs,source:{originalSource:`{
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
}`,...(E=(q=l.parameters)==null?void 0:q.docs)==null?void 0:E.source}}};const kt=["Default","NumberAndDatetime","WithCustomValidation","WithAutocompleteOptions","EmptyState","LoadingState","WithRenderInput"];export{a as Default,s as EmptyState,p as LoadingState,o as NumberAndDatetime,n as WithAutocompleteOptions,i as WithCustomValidation,l as WithRenderInput,kt as __namedExportsOrder,ft as default};
