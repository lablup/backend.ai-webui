import{n as e}from"./rolldown-runtime-2s6bX4vc.js";import{n as t,r as n}from"./iframe-DR2sIF5r.js";import{n as r,t as i}from"./BAIFlex-CAz1t6J5.js";import{n as a,t as o}from"./BAISelect-Dty2gXL7.js";import{n as s,t as c}from"./BAIButton-C-o5ANgR.js";import{n as l,t as u}from"./BAINumberInput-D4JKHjX4.js";import{n as d,t as f}from"./BAITextArea-B7c0jamc.js";import{n as p,t as m}from"./BAITextInput-CqmhWReo.js";import{useState as h}from"react";import{Fragment as g,jsx as _,jsxs as v}from"react/jsx-runtime";import{c as y}from"react/compiler-runtime";import{BulkEditFormItem as b}from"@lablup/ui-common/components/BulkEditFormItem";var x;function S(){return(S=e((()=>{x=e=>{"use memo";let t=y(6),n,r;t[0]===e?(n=t[1],r=t[2]):({showClear:r,...n}=e,t[0]=e,t[1]=n,t[2]=r);let i;return t[3]!==n||t[4]!==r?(i=_(b,{...n,hasClear:r}),t[3]=n,t[4]=r,t[5]=i):i=t[5],i},x.displayName=`BAIBulkEditFormItem`})))()}var C,w,T,E,D,O,k,A,j,M;function N(){return(N=e((()=>{n(),S(),s(),r(),l(),a(),d(),p(),C={title:`Components/BAIBulkEditFormItem`,component:x,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:`
**BAIBulkEditFormItem** is a specialized Form.Item wrapper for bulk editing operations.

## Features
- Keep as is mode (default): Shows placeholder, value = undefined (excluded from submission)
- Edit mode: Allows user to modify the field value
- Clear mode: Sets field to null (only available for optional fields)
- Undo changes: Reverts to "Keep as is" state

## Usage
\`\`\`tsx
<Form>
  <BAIBulkEditFormItem name="domain_name" label="Domain" showClear>
    <BAISelect options={domainOptions} />
  </BAIBulkEditFormItem>
  <BAIBulkEditFormItem name="status" label="Status">
    <BAISelect options={statusOptions} />
  </BAIBulkEditFormItem>
</Form>
\`\`\`

## Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| showClear | \`boolean\` | \`false\` | Whether field can be cleared (shows Clear link) |
| keepValueLabel | \`string\` | \`'Keep as is'\` (i18n) | Label displayed in keep mode placeholder |
| clearValueLabel | \`string\` | \`'Clear'\` (i18n) | Label displayed in clear mode placeholder |
| children | \`ReactElement\` | - | Input component to render |
| ...formItemProps | \`FormItemProps\` | - | All Ant Design Form.Item props |

## Form Values
| Mode | Form Value | Behavior on Submit |
|------|------------|-------------------|
| Keep as is | \`undefined\` | Excluded from submission |
| Edit | User input | Included in submission |
| Clear | \`null\` | Explicitly clears the field |
        `}}},argTypes:{showClear:{control:{type:`boolean`},description:`Whether this field can be cleared (shows Clear link)`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},keepValueLabel:{control:{type:`text`},description:`Label displayed in the keep mode placeholder. Defaults to i18n "Keep as is".`,table:{type:{summary:`string`},defaultValue:{summary:`"Keep as is"`}}},clearValueLabel:{control:{type:`text`},description:`Label displayed in the clear mode placeholder. Defaults to i18n "Clear".`,table:{type:{summary:`string`},defaultValue:{summary:`"Clear"`}}},label:{control:{type:`text`},description:`Label text for the form item`,table:{type:{summary:`ReactNode`}}},name:{control:!1,description:`Field name in form data`,table:{type:{summary:`NamePath`}}},children:{control:!1,description:`Input component to render (typically Select, Input, etc.)`}},decorators:[e=>_(t,{style:{maxWidth:600,padding:24,border:`1px solid #d9d9d9`,borderRadius:8},children:_(e,{})})]},w={name:`Basic`,parameters:{docs:{description:{story:`Basic usage with a required text input field. The field starts in "Keep as is" mode. Click the placeholder to switch to edit mode.`}}},args:{name:`nickname`,label:`Nickname`,children:_(m,{"aria-label":`Nickname`,placeholder:`Enter nickname`})}},T={name:`OptionalField`,parameters:{docs:{description:{story:`Optional field that can be cleared. The Clear link appears in "Keep as is" mode to allow unsetting the value.`}}},args:{name:`domain_name`,label:`Domain`,showClear:!0,children:_(o,{placeholder:`Select domain`,options:[{value:`default`,label:`Default`},{value:`custom`,label:`Custom`},{value:`test`,label:`Test`}]})}},E={name:`WithSelect`,parameters:{docs:{description:{story:`Using BAIBulkEditFormItem with a Select component for choosing from predefined options.`}}},args:{name:`status`,label:`User Status`,children:_(o,{placeholder:`Select status`,options:[{value:`active`,label:`Active`},{value:`inactive`,label:`Inactive`},{value:`deleted`,label:`Deleted`}]})}},D={name:`WithInputNumber`,parameters:{docs:{description:{story:`Using BAIBulkEditFormItem with InputNumber for numeric values.`}}},args:{name:`container_uid`,label:`Container UID`,showClear:!0,children:_(u,{width:`100%`,hasClear:!1,"aria-label":`Container UID`,placeholder:`Enter UID`})}},O={name:`WithCustomClearLabel`,parameters:{docs:{description:{story:`Example with custom clearValueLabel. When clearing this field, "No domain selected" will be displayed instead of default "Clear".`}}},args:{name:`domain`,label:`Domain`,showClear:!0,clearValueLabel:`No domain selected`,children:_(o,{placeholder:`Select domain`,options:[{value:`default`,label:`Default`},{value:`custom`,label:`Custom`}]})}},k={name:`WithCustomKeepLabel`,parameters:{docs:{description:{story:`Example with custom keepValueLabel. The keep mode placeholder will display "No changes to this field" instead of default "Keep as is".`}}},args:{name:`status`,label:`Status`,keepValueLabel:`No changes to this field`,children:_(o,{placeholder:`Select status`,options:[{value:`active`,label:`Active`},{value:`inactive`,label:`Inactive`}]})}},A={name:`MultipleFields`,parameters:{docs:{description:{story:`Example showing multiple BAIBulkEditFormItem fields in a single form with different configurations.`}}},render:()=>v(g,{children:[_(x,{name:`domain`,label:`Domain`,showClear:!0,children:_(o,{placeholder:`Select domain`,options:[{value:`default`,label:`Default`},{value:`custom`,label:`Custom`}]})}),_(x,{name:`status`,label:`Status`,children:_(o,{placeholder:`Select status`,options:[{value:`active`,label:`Active`},{value:`inactive`,label:`Inactive`}]})}),_(x,{name:`notes`,label:`Notes`,showClear:!0,children:_(f,{"aria-label":`Notes`,rows:3,placeholder:`Add notes`})})]})},j={name:`WithFormValues`,parameters:{docs:{description:{story:`Interactive example that shows the current form values. Try switching between Keep as is, Edit, and Clear modes to see how values change.`}}},decorators:[e=>{let[n]=t.useForm(),[r,a]=h({});return v(t,{form:n,style:{maxWidth:600,padding:24,border:`1px solid #d9d9d9`,borderRadius:8},onValuesChange:(e,t)=>a(t),children:[_(e,{}),v(i,{direction:`column`,gap:`sm`,style:{marginTop:16},children:[_(c,{type:`primary`,onClick:()=>{let e=n.getFieldsValue();a(e)},children:`Get Form Values`}),_(`pre`,{style:{background:`#f5f5f5`,padding:12,borderRadius:4,fontSize:12},children:JSON.stringify(r,null,2)})]})]})}],render:()=>v(g,{children:[_(x,{name:`domain`,label:`Domain`,showClear:!0,children:_(o,{placeholder:`Select domain`,options:[{value:`default`,label:`Default`},{value:`custom`,label:`Custom`}]})}),_(x,{name:`status`,label:`Status`,children:_(o,{placeholder:`Select status`,options:[{value:`active`,label:`Active`},{value:`inactive`,label:`Inactive`}]})})]})},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'Basic usage with a required text input field. The field starts in "Keep as is" mode. Click the placeholder to switch to edit mode.'
      }
    }
  },
  args: {
    name: 'nickname',
    label: 'Nickname',
    children: <BAITextInput aria-label="Nickname" placeholder="Enter nickname" />
  }
}`,...w.parameters?.docs?.source},description:{story:`Basic usage with a required field.
No Clear link is shown since the field is not optional.`,...w.parameters?.docs?.description}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  name: 'OptionalField',
  parameters: {
    docs: {
      description: {
        story: 'Optional field that can be cleared. The Clear link appears in "Keep as is" mode to allow unsetting the value.'
      }
    }
  },
  args: {
    name: 'domain_name',
    label: 'Domain',
    showClear: true,
    children: <BAISelect placeholder="Select domain" options={[{
      value: 'default',
      label: 'Default'
    }, {
      value: 'custom',
      label: 'Custom'
    }, {
      value: 'test',
      label: 'Test'
    }]} />
  }
}`,...T.parameters?.docs?.source},description:{story:`Optional field that can be cleared.
Shows the Clear link in "Keep as is" mode.`,...T.parameters?.docs?.description}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  name: 'WithSelect',
  parameters: {
    docs: {
      description: {
        story: 'Using BAIBulkEditFormItem with a Select component for choosing from predefined options.'
      }
    }
  },
  args: {
    name: 'status',
    label: 'User Status',
    children: <BAISelect placeholder="Select status" options={[{
      value: 'active',
      label: 'Active'
    }, {
      value: 'inactive',
      label: 'Inactive'
    }, {
      value: 'deleted',
      label: 'Deleted'
    }]} />
  }
}`,...E.parameters?.docs?.source},description:{story:`Select input with options.`,...E.parameters?.docs?.description}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  name: 'WithInputNumber',
  parameters: {
    docs: {
      description: {
        story: 'Using BAIBulkEditFormItem with InputNumber for numeric values.'
      }
    }
  },
  args: {
    name: 'container_uid',
    label: 'Container UID',
    showClear: true,
    children: <BAINumberInput width="100%" hasClear={false} aria-label="Container UID" placeholder="Enter UID" />
  }
}`,...D.parameters?.docs?.source},description:{story:`Number input field.`,...D.parameters?.docs?.description}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  name: 'WithCustomClearLabel',
  parameters: {
    docs: {
      description: {
        story: 'Example with custom clearValueLabel. When clearing this field, "No domain selected" will be displayed instead of default "Clear".'
      }
    }
  },
  args: {
    name: 'domain',
    label: 'Domain',
    showClear: true,
    clearValueLabel: 'No domain selected',
    children: <BAISelect placeholder="Select domain" options={[{
      value: 'default',
      label: 'Default'
    }, {
      value: 'custom',
      label: 'Custom'
    }]} />
  }
}`,...O.parameters?.docs?.source},description:{story:`Custom clearValueLabel example.
Shows how to customize the label displayed when field is cleared.`,...O.parameters?.docs?.description}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  name: 'WithCustomKeepLabel',
  parameters: {
    docs: {
      description: {
        story: 'Example with custom keepValueLabel. The keep mode placeholder will display "No changes to this field" instead of default "Keep as is".'
      }
    }
  },
  args: {
    name: 'status',
    label: 'Status',
    keepValueLabel: 'No changes to this field',
    children: <BAISelect placeholder="Select status" options={[{
      value: 'active',
      label: 'Active'
    }, {
      value: 'inactive',
      label: 'Inactive'
    }]} />
  }
}`,...k.parameters?.docs?.source},description:{story:`Custom keepValueLabel example.
Shows how to customize the label displayed in keep mode.`,...k.parameters?.docs?.description}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  name: 'MultipleFields',
  parameters: {
    docs: {
      description: {
        story: 'Example showing multiple BAIBulkEditFormItem fields in a single form with different configurations.'
      }
    }
  },
  render: () => <>
      <BAIBulkEditFormItem name="domain" label="Domain" showClear>
        <BAISelect placeholder="Select domain" options={[{
        value: 'default',
        label: 'Default'
      }, {
        value: 'custom',
        label: 'Custom'
      }]} />
      </BAIBulkEditFormItem>
      <BAIBulkEditFormItem name="status" label="Status">
        <BAISelect placeholder="Select status" options={[{
        value: 'active',
        label: 'Active'
      }, {
        value: 'inactive',
        label: 'Inactive'
      }]} />
      </BAIBulkEditFormItem>
      <BAIBulkEditFormItem name="notes" label="Notes" showClear>
        <BAITextArea aria-label="Notes" rows={3} placeholder="Add notes" />
      </BAIBulkEditFormItem>
    </>
}`,...A.parameters?.docs?.source},description:{story:`Multiple fields in a form demonstrating different configurations.`,...A.parameters?.docs?.description}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  name: 'WithFormValues',
  parameters: {
    docs: {
      description: {
        story: 'Interactive example that shows the current form values. Try switching between Keep as is, Edit, and Clear modes to see how values change.'
      }
    }
  },
  decorators: [Story => {
    const [form] = Form.useForm();
    const [values, setValues] = useState<Record<string, unknown>>({});
    return <Form form={form} style={{
      maxWidth: 600,
      padding: 24,
      border: '1px solid #d9d9d9',
      borderRadius: 8
    }} onValuesChange={(_, allValues) => setValues(allValues)}>
          <Story />
          <BAIFlex direction="column" gap="sm" style={{
        marginTop: 16
      }}>
            <BAIButton type="primary" onClick={() => {
          const formValues = form.getFieldsValue();
          setValues(formValues);
        }}>
              Get Form Values
            </BAIButton>
            <pre style={{
          background: '#f5f5f5',
          padding: 12,
          borderRadius: 4,
          fontSize: 12
        }}>
              {JSON.stringify(values, null, 2)}
            </pre>
          </BAIFlex>
        </Form>;
  }],
  render: () => <>
      <BAIBulkEditFormItem name="domain" label="Domain" showClear>
        <BAISelect placeholder="Select domain" options={[{
        value: 'default',
        label: 'Default'
      }, {
        value: 'custom',
        label: 'Custom'
      }]} />
      </BAIBulkEditFormItem>
      <BAIBulkEditFormItem name="status" label="Status">
        <BAISelect placeholder="Select status" options={[{
        value: 'active',
        label: 'Active'
      }, {
        value: 'inactive',
        label: 'Inactive'
      }]} />
      </BAIBulkEditFormItem>
    </>
}`,...j.parameters?.docs?.source},description:{story:`Interactive example showing form values.`,...j.parameters?.docs?.description}}},M=[`Default`,`OptionalField`,`WithSelect`,`WithInputNumber`,`WithCustomClearLabel`,`WithCustomKeepLabel`,`MultipleFields`,`WithFormValues`]})))()}N();export{w as Default,A as MultipleFields,T as OptionalField,O as WithCustomClearLabel,k as WithCustomKeepLabel,j as WithFormValues,D as WithInputNumber,E as WithSelect,M as __namedExportsOrder,C as default};