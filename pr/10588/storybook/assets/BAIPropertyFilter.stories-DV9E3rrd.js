import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-D0Ex1IVc.js";import{n,t as r}from"./BAIPropertyFilter-CzBD4nfe.js";import{t as i}from"./jsx-runtime-MKhVqBIO.js";import{n as a,t as o}from"./BAIComplexSelect-DoVaWoY7.js";var s,c,l,u,d,f,p,m,h,g,_,v;function y(){return(y=e((()=>{a(),n(),s=t(),c=i(),l={title:`Filter/BAIPropertyFilter`,component:r,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:"\n**BAIPropertyFilter** is a sophisticated filtering component designed for Backend.AI applications. It provides a user-friendly interface for constructing complex filter queries with support for:\n\n- **Multiple property types**: String and boolean properties with type-specific operators\n- **Dynamic query building**: Visual interface for constructing filter expressions\n- **Autocomplete support**: Predefined options and suggestions for property values\n- **Validation rules**: Custom validation for property values\n- **Query language**: Based on Backend.AI's query filter minilang specification\n- **Custom input via `renderInput`**: Replace the built-in value editor with any controlled control (e.g., a user or storage-host picker). The control stages a value via `onAddCondition(value, label?)` and the edit popover's Apply button commits it; pass a human-readable `label` when the committed value is opaque (e.g. a UUID) so the token shows the label instead. Same contract as `BAIGraphQLPropertyFilter`, so controls are interchangeable.\n\n> **to-astryx ticket 28** — the engine is now Astryx `PowerSearch`. The prop contract is unchanged, but the antd chrome it documented (property `Select` + `AutoComplete` + closable `Tag`s + the bespoke reset button) is replaced by PowerSearch's typeahead, tokens and built-in clear. `rule.validate` is advisory now: a violating token is reported through the control's error status instead of being refused. **to-astryx ticket 32** refreshed these stories: the `renderInput` demo below now uses `BAIComplexSelect` (Astryx-native) instead of antd `Select`, matching what a migrated call site actually renders.\n\nThe component generates filter query strings that can be used with Backend.AI's query system, enabling powerful data filtering capabilities across the platform.\n\n**Query Syntax Examples:**\n- Simple filter: `name ilike %john%`\n- Boolean filter: `active == true`\n- Combined filters: `name ilike %john% & active == true`\n        "}}},argTypes:{filterProperties:{description:`Array of filterable properties configuration`,control:{type:`object`},table:{type:{summary:`FilterProperty[]`}}},value:{control:{type:`text`},description:`Current filter query string`,table:{type:{summary:`string`}}},onChange:{action:`filterChanged`,description:`Callback when filter value changes`,table:{type:{summary:`(value: string) => void`}}},loading:{control:{type:`boolean`},description:`Show loading state`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}}},render:e=>{let[t,n]=(0,s.useState)(e.value);return(0,c.jsx)(r,{...e,value:t,onChange:t=>{e.onChange?.(t),n(t)}})}},u={name:`Basic Usage`,parameters:{docs:{description:{story:`Basic property filter with string and boolean properties. Shows how to construct complex filter queries using the visual interface.`}}},args:{filterProperties:[{key:`name`,defaultOperator:`ilike`,propertyLabel:`Name`,type:`string`},{key:`description`,propertyLabel:`Description`,type:`string`},{key:`active`,propertyLabel:`Active Status`,type:`boolean`}],value:`name ilike "%test%" & active == true`}},d={name:`Number and Datetime Properties`,parameters:{docs:{description:{story:'Numeric and time properties offer comparison operators. Numbers serialize bare (`priority >= 10`); datetimes stay quoted (`created_at >= "2026-08-01"`) because the backend parses the string into a date.'}}},args:{filterProperties:[{key:`name`,propertyLabel:`Name`,type:`string`},{key:`priority`,propertyLabel:`Priority`,type:`number`},{key:`created_at`,propertyLabel:`Created At`,type:`datetime`}],value:`priority >= 10 & created_at >= "2026-08-01"`}},f={name:`Custom Validation`,parameters:{docs:{description:{story:`Property filter with custom validation rules for email addresses and strict selection options.`}}},args:{filterProperties:[{key:`email`,propertyLabel:`Email Address`,type:`string`,rule:{message:`Please enter a valid email address`,validate:e=>/\S+@\S+\.\S+/.test(e)}},{key:`status`,propertyLabel:`Status`,type:`string`,options:[{label:`Active`,value:`active`},{label:`Inactive`,value:`inactive`},{label:`Pending`,value:`pending`}],strictSelection:!0}]}},p={name:`Autocomplete Options`,parameters:{docs:{description:{story:`Property filter with predefined autocomplete options for easier data entry.`}}},args:{filterProperties:[{key:`department`,propertyLabel:`Department`,type:`string`,options:[{label:`Engineering`,value:`engineering`},{label:`Marketing`,value:`marketing`},{label:`Sales`,value:`sales`},{label:`Human Resources`,value:`hr`}]},{key:`priority`,propertyLabel:`Priority Level`,type:`string`,options:[{label:`High`,value:`high`},{label:`Medium`,value:`medium`},{label:`Low`,value:`low`}],strictSelection:!0}],value:`department ilike "%engineering%"`}},m={parameters:{docs:{description:{story:`Property filter in its initial state with no applied filters.`}}},args:{filterProperties:[{key:`name`,propertyLabel:`Name`,type:`string`},{key:`enabled`,propertyLabel:`Enabled`,type:`boolean`}]}},h={parameters:{docs:{description:{story:`Property filter in loading state, typically shown while fetching filter options or processing queries.`}}},args:{filterProperties:[{key:`name`,propertyLabel:`Name`,type:`string`}],loading:!0}},g=[{label:`alice@example.com`,value:`owner-uuid-0001`},{label:`bob@example.com`,value:`owner-uuid-0002`},{label:`carol@example.com`,value:`owner-uuid-0003`}],_={name:`Custom Input via renderInput`,parameters:{docs:{description:{story:"When `renderInput` is provided, the built-in value editor is replaced with a custom control. The control stages a value via `onAddCondition(value, label?)` and the edit popover's Apply button commits it; feed the render prop's `value` back into the control so the staged pick stays visible (and when an existing token is reopened for editing). Pass the option label as the second argument so the token shows a human-readable label (e.g. an email) instead of the opaque committed value (e.g. a UUID). Same contract as `BAIGraphQLPropertyFilter`, so controls are interchangeable."}}},args:{filterProperties:[{key:`name`,propertyLabel:`Name`,type:`string`,defaultOperator:`ilike`},{key:`owner`,propertyLabel:`Owner`,type:`string`,defaultOperator:`==`,renderInput:({onAddCondition:e,value:t,isDisabled:n})=>(0,c.jsx)(o,{label:`Owner`,isLabelHidden:!0,placeholder:`Select owner`,options:g,isDisabled:n,value:g.find(e=>e.value===t)??null,onChange:t=>{let n=t;e(n?.value,n?.label)}})}],onChange:()=>console.log(`Filter changed`)}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
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
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
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
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
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
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source}}},v=[`Default`,`NumberAndDatetime`,`WithCustomValidation`,`WithAutocompleteOptions`,`EmptyState`,`LoadingState`,`WithRenderInput`]})))()}y();export{u as Default,m as EmptyState,h as LoadingState,d as NumberAndDatetime,p as WithAutocompleteOptions,f as WithCustomValidation,_ as WithRenderInput,v as __namedExportsOrder,l as default};