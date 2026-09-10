import{j as E,r as F}from"./iframe-Brgdg9SH.js";import{B as V}from"./BAIComplexSelect-DWAo8VYa.js";import{B as d}from"./BAIPropertyFilter-AOZgOEvZ.js";import"./preload-helper-Dp1pzeXC.js";import"./useIndicator-DV5KrJnb.js";import"./isRenderable-BUV0eL6r.js";import"./clamp-DKZfIzTU.js";import"./_baseClamp-DVUOCJN_.js";import"./toFinite-Nen6b724.js";import"./_trimmedEndIndex-DuQxD0U0.js";import"./isSymbol-CfjPiO1j.js";import"./filter-BWdmfBlq.js";import"./_baseEach-tKaM6wYP.js";import"./get-BbZH5Qeu.js";import"./_baseGet-Dvecpf5E.js";import"./toString-DxjPPlAa.js";import"./identity-DKeuBCMA.js";import"./_baseSlice-F8doVSIJ.js";import"./toInteger-3uS1R952.js";import"./map-BwuZu4A0.js";import"./usePopover-BYDZ18GX.js";import"./useDevWarning-BfHXOW0W.js";import"./rtlStyles-T4i24HtE.js";import"./useResolvedRequired-DkIXHk27.js";import"./composeEventHandlers-BolWE7qY.js";import"./InputClearButton-CfmXC9n5.js";import"./Divider-B7tnoapa.js";import"./isNumber-eiQppSxo.js";import"./compact-CU4PNV0P.js";import"./some-BEqptMNW.js";import"./Token-DzUt0YG3.js";import"./SelectorOption-By_7FtDD.js";import"./Item-CTaQvy5M.js";import"./index-DvHjFbkY.js";import"./isEmpty-QXt2mV0h.js";import"./PowerSearch-Bk1GvAP2.js";import"./_charsEndIndex-BHSW-HpW.js";import"./_baseIndexOf-Be9UPhX8.js";import"./_baseFindIndex-Cj99RmFE.js";import"./isNil-CHIgUVhi.js";import"./includes-DHR2gq_-.js";import"./isString-ConwOKyy.js";import"./toLower-QLNaaDDR.js";import"./_baseAssignValue-Cp5ax7AY.js";import"./_defineProperty-CadAbSzv.js";import"./characters-DWaYg7k3.js";import"./NumberInput-D9YdH51l.js";import"./useInputStatusIcon-DDSWcbgf.js";import"./InputGroupContext-TOpLrzf9.js";import"./Selector-CeeAxaFV.js";import"./useFocusReturnVisibility-dakrILuX.js";import"./isRtlElement-B2-7SF8s.js";import"./BottomSheet-ZVYcPRMA.js";import"./TextInput-ESSq_-76.js";import"./VStack-BohlMtVt.js";import"./useControllableValue-FEGoR8Eo.js";import"./find-CwnHiBqD.js";import"./join-DKskq_cE.js";import"./forEach-DQpCHXZ-.js";import"./_arrayEach-DpGxo2Of.js";import"./_castFunction-a6W-o7Lo.js";import"./split-Df-GsSJR.js";import"./_isIterateeCall-CRo11Re_.js";import"./uniq-DRHibXAs.js";import"./_baseUniq-B2Ci5483.js";import"./noop-DX6rZLP_.js";const Xe={title:"Filter/BAIPropertyFilter",component:d,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:"\n**BAIPropertyFilter** is a sophisticated filtering component designed for Backend.AI applications. It provides a user-friendly interface for constructing complex filter queries with support for:\n\n- **Multiple property types**: String and boolean properties with type-specific operators\n- **Dynamic query building**: Visual interface for constructing filter expressions\n- **Autocomplete support**: Predefined options and suggestions for property values\n- **Validation rules**: Custom validation for property values\n- **Query language**: Based on Backend.AI's query filter minilang specification\n- **Custom input via `renderInput`**: Replace the built-in value editor with any controlled control (e.g., a user or storage-host picker). The control stages a value via `onAddCondition(value, label?)` and the edit popover's Apply button commits it; pass a human-readable `label` when the committed value is opaque (e.g. a UUID) so the token shows the label instead. Same contract as `BAIGraphQLPropertyFilter`, so controls are interchangeable.\n\n> **to-astryx ticket 28** — the engine is now Astryx `PowerSearch`. The prop contract is unchanged, but the antd chrome it documented (property `Select` + `AutoComplete` + closable `Tag`s + the bespoke reset button) is replaced by PowerSearch's typeahead, tokens and built-in clear. `rule.validate` is advisory now: a violating token is reported through the control's error status instead of being refused. **to-astryx ticket 32** refreshed these stories: the `renderInput` demo below now uses `BAIComplexSelect` (Astryx-native) instead of antd `Select`, matching what a migrated call site actually renders.\n\nThe component generates filter query strings that can be used with Backend.AI's query system, enabling powerful data filtering capabilities across the platform.\n\n**Query Syntax Examples:**\n- Simple filter: `name ilike %john%`\n- Boolean filter: `active == true`\n- Combined filters: `name ilike %john% & active == true`\n        "}}},argTypes:{filterProperties:{description:"Array of filterable properties configuration",control:{type:"object"},table:{type:{summary:"FilterProperty[]"}}},value:{control:{type:"text"},description:"Current filter query string",table:{type:{summary:"string"}}},onChange:{action:"filterChanged",description:"Callback when filter value changes",table:{type:{summary:"(value: string) => void"}}},loading:{control:{type:"boolean"},description:"Show loading state",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}}},render:e=>{const[l,t]=F.useState(e.value);return E.jsx(d,{...e,value:l,onChange:m=>{var c;(c=e.onChange)==null||c.call(e,m),t(m)}})}},r={name:"Basic Usage",parameters:{docs:{description:{story:"Basic property filter with string and boolean properties. Shows how to construct complex filter queries using the visual interface."}}},args:{filterProperties:[{key:"name",defaultOperator:"ilike",propertyLabel:"Name",type:"string"},{key:"description",propertyLabel:"Description",type:"string"},{key:"active",propertyLabel:"Active Status",type:"boolean"}],value:'name ilike "%test%" & active == true'}},a={name:"Number and Datetime Properties",parameters:{docs:{description:{story:'Numeric and time properties offer comparison operators. Numbers serialize bare (`priority >= 10`); datetimes stay quoted (`created_at >= "2026-08-01"`) because the backend parses the string into a date.'}}},args:{filterProperties:[{key:"name",propertyLabel:"Name",type:"string"},{key:"priority",propertyLabel:"Priority",type:"number"},{key:"created_at",propertyLabel:"Created At",type:"datetime"}],value:'priority >= 10 & created_at >= "2026-08-01"'}},o={name:"Custom Validation",parameters:{docs:{description:{story:"Property filter with custom validation rules for email addresses and strict selection options."}}},args:{filterProperties:[{key:"email",propertyLabel:"Email Address",type:"string",rule:{message:"Please enter a valid email address",validate:e=>/\S+@\S+\.\S+/.test(e)}},{key:"status",propertyLabel:"Status",type:"string",options:[{label:"Active",value:"active"},{label:"Inactive",value:"inactive"},{label:"Pending",value:"pending"}],strictSelection:!0}]}},i={name:"Autocomplete Options",parameters:{docs:{description:{story:"Property filter with predefined autocomplete options for easier data entry."}}},args:{filterProperties:[{key:"department",propertyLabel:"Department",type:"string",options:[{label:"Engineering",value:"engineering"},{label:"Marketing",value:"marketing"},{label:"Sales",value:"sales"},{label:"Human Resources",value:"hr"}]},{key:"priority",propertyLabel:"Priority Level",type:"string",options:[{label:"High",value:"high"},{label:"Medium",value:"medium"},{label:"Low",value:"low"}],strictSelection:!0}],value:'department ilike "%engineering%"'}},n={parameters:{docs:{description:{story:"Property filter in its initial state with no applied filters."}}},args:{filterProperties:[{key:"name",propertyLabel:"Name",type:"string"},{key:"enabled",propertyLabel:"Enabled",type:"boolean"}]}},s={parameters:{docs:{description:{story:"Property filter in loading state, typically shown while fetching filter options or processing queries."}}},args:{filterProperties:[{key:"name",propertyLabel:"Name",type:"string"}],loading:!0}},R=[{label:"alice@example.com",value:"owner-uuid-0001"},{label:"bob@example.com",value:"owner-uuid-0002"},{label:"carol@example.com",value:"owner-uuid-0003"}],p={name:"Custom Input via renderInput",parameters:{docs:{description:{story:"When `renderInput` is provided, the default AutoComplete is replaced with a custom control. The control commits a condition via `onAddCondition(value, label?)` as soon as it emits a non-empty value; keep it controlled with `value={null}` so it clears after each commit. Pass the option label as the second argument so the condition tag shows a human-readable label (e.g. an email) instead of the opaque committed value (e.g. a UUID). Same contract as the one `BAIGraphQLPropertyFilter` adopts in FR-3011 (#8082), so controls become interchangeable once both land."}}},args:{filterProperties:[{key:"name",propertyLabel:"Name",type:"string",defaultOperator:"ilike"},{key:"owner",propertyLabel:"Owner",type:"string",defaultOperator:"==",renderInput:({onAddCondition:e})=>E.jsx(V,{label:"Owner",isLabelHidden:!0,placeholder:"Select owner",width:220,options:R,value:null,onChange:l=>{const t=l;e(t==null?void 0:t.value,t==null?void 0:t.label)}})}],onChange:()=>console.log("Filter changed")}};var u,y,g;r.parameters={...r.parameters,docs:{...(u=r.parameters)==null?void 0:u.docs,source:{originalSource:`{
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
}`,...(g=(y=r.parameters)==null?void 0:y.docs)==null?void 0:g.source}}};var b,h,f;a.parameters={...a.parameters,docs:{...(b=a.parameters)==null?void 0:b.docs,source:{originalSource:`{
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
}`,...(f=(h=a.parameters)==null?void 0:h.docs)==null?void 0:f.source}}};var v,k,w;o.parameters={...o.parameters,docs:{...(v=o.parameters)==null?void 0:v.docs,source:{originalSource:`{
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
}`,...(w=(k=o.parameters)==null?void 0:k.docs)==null?void 0:w.source}}};var S,P,L;i.parameters={...i.parameters,docs:{...(S=i.parameters)==null?void 0:S.docs,source:{originalSource:`{
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
}`,...(L=(P=i.parameters)==null?void 0:P.docs)==null?void 0:L.source}}};var A,C,I;n.parameters={...n.parameters,docs:{...(A=n.parameters)==null?void 0:A.docs,source:{originalSource:`{
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
}`,...(I=(C=n.parameters)==null?void 0:C.docs)==null?void 0:I.source}}};var x,B,O;s.parameters={...s.parameters,docs:{...(x=s.parameters)==null?void 0:x.docs,source:{originalSource:`{
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
}`,...(O=(B=s.parameters)==null?void 0:B.docs)==null?void 0:O.source}}};var N,q,D;p.parameters={...p.parameters,docs:{...(N=p.parameters)==null?void 0:N.docs,source:{originalSource:`{
  name: 'Custom Input via renderInput',
  parameters: {
    docs: {
      description: {
        story: 'When \`renderInput\` is provided, the default AutoComplete is replaced with a custom control. The control commits a condition via \`onAddCondition(value, label?)\` as soon as it emits a non-empty value; keep it controlled with \`value={null}\` so it clears after each commit. Pass the option label as the second argument so the condition tag shows a human-readable label (e.g. an email) instead of the opaque committed value (e.g. a UUID). Same contract as the one \`BAIGraphQLPropertyFilter\` adopts in FR-3011 (#8082), so controls become interchangeable once both land.'
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
}`,...(D=(q=p.parameters)==null?void 0:q.docs)==null?void 0:D.source}}};const Ye=["Default","NumberAndDatetime","WithCustomValidation","WithAutocompleteOptions","EmptyState","LoadingState","WithRenderInput"];export{r as Default,n as EmptyState,s as LoadingState,a as NumberAndDatetime,i as WithAutocompleteOptions,o as WithCustomValidation,p as WithRenderInput,Ye as __namedExportsOrder,Xe as default};
