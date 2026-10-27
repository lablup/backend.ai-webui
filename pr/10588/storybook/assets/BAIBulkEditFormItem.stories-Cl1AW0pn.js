import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-D0Ex1IVc.js";import{t as n}from"./jsx-runtime-MKhVqBIO.js";import{n as r,t as i}from"./useUicTranslator-B_bC9MIU.js";import{t as a}from"./compiler-runtime-CdReTaax.js";import{n as o,t as s}from"./HStack-DXC_f-65.js";import{n as c,t as l}from"./Form-DzbqW5jU.js";import{n as u,t as d}from"./BAIFlex-BOFoS5KY.js";import{n as f,t as p}from"./BAISelect-CgNx8uBa.js";import{n as m,t as h}from"./Link-CKI1ETQz.js";import{n as g,t as _}from"./BAIButton-BCdRP02k.js";import{n as v,t as y}from"./TextInput-D0bhoFyK.js";import{n as b,t as x}from"./NumberInput-BU_o7YHl.js";import{n as S,t as C}from"./TextArea-DFLZwvuT.js";import{n as w,t as T}from"./TextInput-DpAx1LFf.js";function E({name:e,hasClear:t=!1,keepValueLabel:n,clearValueLabel:r,clearLabel:a,undoLabel:o,children:l,...u}){let d=i(),f=c.useFormInstance(),[p,m]=(0,D.useState)(`keep`),g=(0,D.useRef)(null),_=()=>{setTimeout(()=>{g.current?.focus(),g.current?.open()},0)},v=e=>{e.preventDefault(),m(`edit`),_()},b=()=>{let n=f.getFieldValue(e);n===void 0&&m(`keep`),n===null&&t&&m(`clear`)},x=()=>{m(`clear`),f.setFieldValue(e,null)},S=()=>{m(`keep`),f.setFieldValue(e,void 0)},C=n??d(`uic.BulkEditFormItem.keepAsIs`),w=r??d(`uic.BulkEditFormItem.clear`),T=(0,O.jsxs)(s,{align:`center`,children:[p===`keep`&&t&&(0,O.jsx)(h,{onClick:x,children:a??d(`uic.BulkEditFormItem.clear`)}),(0,O.jsx)(c.Item,{noStyle:!0,dependencies:[e],children:({getFieldValue:t})=>p!==`keep`&&t(e)!==void 0&&(0,O.jsx)(h,{onClick:S,children:o??d(`uic.BulkEditFormItem.undoChanges`)})})]}),E=e=>(0,O.jsx)(y,{label:e,isLabelHidden:!0,value:e,onChange:k,onMouseDown:v,onFocus:v,width:`100%`});return(0,O.jsxs)(c.Item,{...u,style:{marginBottom:0,...u.style},required:!0,extra:(0,O.jsxs)(s,{justify:u.extra?`between`:`end`,align:`center`,gap:2,children:[u.extra,T]}),children:[p===`keep`?E(C):p===`clear`?E(w):null,p!==`keep`&&(0,O.jsx)(c.Item,{name:e,...u,noStyle:!0,hidden:p!==`edit`,children:l&&(0,O.jsx)(A,{ref:g,onBlur:b,children:l})})]})}var D,O,k,A;function j(){return(j=e((()=>{r(),l(),D=t(),O=n(),o(),m(),v(),k=()=>{},E.displayName=`BulkEditFormItem`,A=(0,D.forwardRef)(({children:e,...t},n)=>{let r=(0,D.useRef)(null),[i,a]=(0,D.useState)(!1);(0,D.useImperativeHandle)(n,()=>({focus:()=>r.current?.focus?.(),open:()=>a(!0)}));let o=e.props;return(0,D.cloneElement)(e,{...t,ref:r,open:i,onOpenChange:e=>{a(e),o.onOpenChange?.(e)}})}),A.displayName=`ControlWrapper`})))()}var M,N,P;function F(){return(F=e((()=>{M=a(),j(),N=n(),P=e=>{"use memo";let t=(0,M.c)(6),n,r;t[0]===e?(n=t[1],r=t[2]):({showClear:r,...n}=e,t[0]=e,t[1]=n,t[2]=r);let i;return t[3]!==n||t[4]!==r?(i=(0,N.jsx)(E,{...n,hasClear:r}),t[3]=n,t[4]=r,t[5]=i):i=t[5],i},P.displayName=`BAIBulkEditFormItem`})))()}var I,L,R,z,B,V,H,U,W,G,K,q;function J(){return(J=e((()=>{l(),F(),g(),u(),x(),f(),S(),w(),I=t(),L=n(),R={title:`Components/BAIBulkEditFormItem`,component:P,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:`
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
        `}}},argTypes:{showClear:{control:{type:`boolean`},description:`Whether this field can be cleared (shows Clear link)`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},keepValueLabel:{control:{type:`text`},description:`Label displayed in the keep mode placeholder. Defaults to i18n "Keep as is".`,table:{type:{summary:`string`},defaultValue:{summary:`"Keep as is"`}}},clearValueLabel:{control:{type:`text`},description:`Label displayed in the clear mode placeholder. Defaults to i18n "Clear".`,table:{type:{summary:`string`},defaultValue:{summary:`"Clear"`}}},label:{control:{type:`text`},description:`Label text for the form item`,table:{type:{summary:`ReactNode`}}},name:{control:!1,description:`Field name in form data`,table:{type:{summary:`NamePath`}}},children:{control:!1,description:`Input component to render (typically Select, Input, etc.)`}},decorators:[e=>(0,L.jsx)(c,{style:{maxWidth:600,padding:24,border:`1px solid #d9d9d9`,borderRadius:8},children:(0,L.jsx)(e,{})})]},z={name:`Basic`,parameters:{docs:{description:{story:`Basic usage with a required text input field. The field starts in "Keep as is" mode. Click the placeholder to switch to edit mode.`}}},args:{name:`nickname`,label:`Nickname`,children:(0,L.jsx)(T,{"aria-label":`Nickname`,placeholder:`Enter nickname`})}},B={name:`OptionalField`,parameters:{docs:{description:{story:`Optional field that can be cleared. The Clear link appears in "Keep as is" mode to allow unsetting the value.`}}},args:{name:`domain_name`,label:`Domain`,showClear:!0,children:(0,L.jsx)(p,{placeholder:`Select domain`,options:[{value:`default`,label:`Default`},{value:`custom`,label:`Custom`},{value:`test`,label:`Test`}]})}},V={name:`WithSelect`,parameters:{docs:{description:{story:`Using BAIBulkEditFormItem with a Select component for choosing from predefined options.`}}},args:{name:`status`,label:`User Status`,children:(0,L.jsx)(p,{placeholder:`Select status`,options:[{value:`active`,label:`Active`},{value:`inactive`,label:`Inactive`},{value:`deleted`,label:`Deleted`}]})}},H={name:`WithInputNumber`,parameters:{docs:{description:{story:`Using BAIBulkEditFormItem with InputNumber for numeric values.`}}},args:{name:`container_uid`,label:`Container UID`,showClear:!0,children:(0,L.jsx)(b,{width:`100%`,hasClear:!1,"aria-label":`Container UID`,placeholder:`Enter UID`})}},U={name:`WithCustomClearLabel`,parameters:{docs:{description:{story:`Example with custom clearValueLabel. When clearing this field, "No domain selected" will be displayed instead of default "Clear".`}}},args:{name:`domain`,label:`Domain`,showClear:!0,clearValueLabel:`No domain selected`,children:(0,L.jsx)(p,{placeholder:`Select domain`,options:[{value:`default`,label:`Default`},{value:`custom`,label:`Custom`}]})}},W={name:`WithCustomKeepLabel`,parameters:{docs:{description:{story:`Example with custom keepValueLabel. The keep mode placeholder will display "No changes to this field" instead of default "Keep as is".`}}},args:{name:`status`,label:`Status`,keepValueLabel:`No changes to this field`,children:(0,L.jsx)(p,{placeholder:`Select status`,options:[{value:`active`,label:`Active`},{value:`inactive`,label:`Inactive`}]})}},G={name:`MultipleFields`,parameters:{docs:{description:{story:`Example showing multiple BAIBulkEditFormItem fields in a single form with different configurations.`}}},render:()=>(0,L.jsxs)(L.Fragment,{children:[(0,L.jsx)(P,{name:`domain`,label:`Domain`,showClear:!0,children:(0,L.jsx)(p,{placeholder:`Select domain`,options:[{value:`default`,label:`Default`},{value:`custom`,label:`Custom`}]})}),(0,L.jsx)(P,{name:`status`,label:`Status`,children:(0,L.jsx)(p,{placeholder:`Select status`,options:[{value:`active`,label:`Active`},{value:`inactive`,label:`Inactive`}]})}),(0,L.jsx)(P,{name:`notes`,label:`Notes`,showClear:!0,children:(0,L.jsx)(C,{"aria-label":`Notes`,rows:3,placeholder:`Add notes`})})]})},K={name:`WithFormValues`,parameters:{docs:{description:{story:`Interactive example that shows the current form values. Try switching between Keep as is, Edit, and Clear modes to see how values change.`}}},decorators:[e=>{let[t]=c.useForm(),[n,r]=(0,I.useState)({});return(0,L.jsxs)(c,{form:t,style:{maxWidth:600,padding:24,border:`1px solid #d9d9d9`,borderRadius:8},onValuesChange:(e,t)=>r(t),children:[(0,L.jsx)(e,{}),(0,L.jsxs)(d,{direction:`column`,gap:`sm`,style:{marginTop:16},children:[(0,L.jsx)(_,{type:`primary`,onClick:()=>{let e=t.getFieldsValue();r(e)},children:`Get Form Values`}),(0,L.jsx)(`pre`,{style:{background:`#f5f5f5`,padding:12,borderRadius:4,fontSize:12},children:JSON.stringify(n,null,2)})]})]})}],render:()=>(0,L.jsxs)(L.Fragment,{children:[(0,L.jsx)(P,{name:`domain`,label:`Domain`,showClear:!0,children:(0,L.jsx)(p,{placeholder:`Select domain`,options:[{value:`default`,label:`Default`},{value:`custom`,label:`Custom`}]})}),(0,L.jsx)(P,{name:`status`,label:`Status`,children:(0,L.jsx)(p,{placeholder:`Select status`,options:[{value:`active`,label:`Active`},{value:`inactive`,label:`Inactive`}]})})]})},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
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
}`,...z.parameters?.docs?.source},description:{story:`Basic usage with a required field.
No Clear link is shown since the field is not optional.`,...z.parameters?.docs?.description}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
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
}`,...B.parameters?.docs?.source},description:{story:`Optional field that can be cleared.
Shows the Clear link in "Keep as is" mode.`,...B.parameters?.docs?.description}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
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
}`,...V.parameters?.docs?.source},description:{story:`Select input with options.`,...V.parameters?.docs?.description}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
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
}`,...H.parameters?.docs?.source},description:{story:`Number input field.`,...H.parameters?.docs?.description}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
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
}`,...U.parameters?.docs?.source},description:{story:`Custom clearValueLabel example.
Shows how to customize the label displayed when field is cleared.`,...U.parameters?.docs?.description}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
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
}`,...W.parameters?.docs?.source},description:{story:`Custom keepValueLabel example.
Shows how to customize the label displayed in keep mode.`,...W.parameters?.docs?.description}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
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
}`,...G.parameters?.docs?.source},description:{story:`Multiple fields in a form demonstrating different configurations.`,...G.parameters?.docs?.description}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
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
}`,...K.parameters?.docs?.source},description:{story:`Interactive example showing form values.`,...K.parameters?.docs?.description}}},q=[`Default`,`OptionalField`,`WithSelect`,`WithInputNumber`,`WithCustomClearLabel`,`WithCustomKeepLabel`,`MultipleFields`,`WithFormValues`]})))()}J();export{z as Default,G as MultipleFields,B as OptionalField,U as WithCustomClearLabel,W as WithCustomKeepLabel,K as WithFormValues,H as WithInputNumber,V as WithSelect,q as __namedExportsOrder,R as default};