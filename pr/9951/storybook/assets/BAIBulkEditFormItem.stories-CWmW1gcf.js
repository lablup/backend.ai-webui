import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-DlPsW1c0.js";import{t as n}from"./jsx-runtime-MKhVqBIO.js";import{n as r,t as i}from"./useUicTranslator-M0QCXAqZ.js";import{t as a}from"./compiler-runtime-DU4U6aph.js";import{n as o,t as ee}from"./HStack-CEbJ9Tyj.js";import{n as s,t as c}from"./Form-D7hmN7C8.js";import{n as l,t as u}from"./BAIFlex-DnaoYTJ1.js";import{n as d,t as f}from"./BAISelect-C_tFPzqx.js";import{n as p,t as te}from"./Link-CFEqnzkR.js";import{n as m,t as ne}from"./BAIButton-CzGzKWte.js";import{n as h,t as re}from"./TextInput-9g1MhbLT.js";import{n as ie,t as g}from"./NumberInput-CppT4vXe.js";import{n as ae,t as oe}from"./TextArea-C0F3GAGc.js";import{n as _,t as v}from"./TextInput-DbJUHmS-.js";function y({name:e,hasClear:t=!1,keepValueLabel:n,clearValueLabel:r,clearLabel:a,undoLabel:o,children:c,...l}){let u=i(),d=s.useFormInstance(),[f,p]=(0,b.useState)(`keep`),m=(0,b.useRef)(null),ne=()=>{setTimeout(()=>{var e,t;(e=m.current)==null||e.focus(),(t=m.current)==null||t.open()},0)},h=e=>{e.preventDefault(),p(`edit`),ne()},ie=()=>{let n=d.getFieldValue(e);n===void 0&&p(`keep`),n===null&&t&&p(`clear`)},g=()=>{p(`clear`),d.setFieldValue(e,null)},ae=()=>{p(`keep`),d.setFieldValue(e,void 0)},oe=n??u(`uic.BulkEditFormItem.keepAsIs`),_=r??u(`uic.BulkEditFormItem.clear`),v=(0,x.jsxs)(ee,{align:`center`,children:[f===`keep`&&t&&(0,x.jsx)(te,{onClick:g,children:a??u(`uic.BulkEditFormItem.clear`)}),(0,x.jsx)(s.Item,{noStyle:!0,dependencies:[e],children:({getFieldValue:t})=>f!==`keep`&&t(e)!==void 0&&(0,x.jsx)(te,{onClick:ae,children:o??u(`uic.BulkEditFormItem.undoChanges`)})})]}),y=e=>(0,x.jsx)(re,{label:e,isLabelHidden:!0,value:e,onChange:se,onMouseDown:h,onFocus:h,width:`100%`});return(0,x.jsxs)(s.Item,{...l,style:{marginBottom:0,...l.style},required:!0,extra:(0,x.jsxs)(ee,{justify:l.extra?`between`:`end`,align:`center`,gap:2,children:[l.extra,v]}),children:[f===`keep`?y(oe):f===`clear`?y(_):null,f!==`keep`&&(0,x.jsx)(s.Item,{name:e,...l,noStyle:!0,hidden:f!==`edit`,children:c&&(0,x.jsx)(S,{ref:m,onBlur:ie,children:c})})]})}var b,x,se,S;function ce(){return(ce=e((()=>{r(),c(),b=t(),x=n(),o(),p(),h(),se=()=>{},y.displayName=`BulkEditFormItem`,S=(0,b.forwardRef)(({children:e,...t},n)=>{let r=(0,b.useRef)(null),[i,a]=(0,b.useState)(!1);(0,b.useImperativeHandle)(n,()=>({focus:()=>{var e,t;return(e=r.current)==null||(t=e.focus)==null?void 0:t.call(e)},open:()=>a(!0)}));let o=e.props;return(0,b.cloneElement)(e,{...t,ref:r,open:i,onOpenChange:e=>{var t;a(e),(t=o.onOpenChange)==null||t.call(o,e)}})}),S.displayName=`ControlWrapper`})))()}var le,ue,C;function w(){return(w=e((()=>{le=a(),ce(),ue=n(),C=e=>{"use memo";let t=(0,le.c)(6),n,r;t[0]===e?(n=t[1],r=t[2]):({showClear:r,...n}=e,t[0]=e,t[1]=n,t[2]=r);let i;return t[3]!==n||t[4]!==r?(i=(0,ue.jsx)(y,{...n,hasClear:r}),t[3]=n,t[4]=r,t[5]=i):i=t[5],i},C.displayName=`BAIBulkEditFormItem`})))()}var T,E,de,D,O,fe,k,A,pe,j,M,N,P,F,I,L,R,z,B,V,me,H,U,he,W,G,ge,K,q,J,Y,X,Z,Q,$,_e;function ve(){return(ve=e((()=>{c(),w(),m(),l(),g(),d(),ae(),_(),T=t(),E=n(),ge={title:`Components/BAIBulkEditFormItem`,component:C,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:`
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
        `}}},argTypes:{showClear:{control:{type:`boolean`},description:`Whether this field can be cleared (shows Clear link)`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},keepValueLabel:{control:{type:`text`},description:`Label displayed in the keep mode placeholder. Defaults to i18n "Keep as is".`,table:{type:{summary:`string`},defaultValue:{summary:`"Keep as is"`}}},clearValueLabel:{control:{type:`text`},description:`Label displayed in the clear mode placeholder. Defaults to i18n "Clear".`,table:{type:{summary:`string`},defaultValue:{summary:`"Clear"`}}},label:{control:{type:`text`},description:`Label text for the form item`,table:{type:{summary:`ReactNode`}}},name:{control:!1,description:`Field name in form data`,table:{type:{summary:`NamePath`}}},children:{control:!1,description:`Input component to render (typically Select, Input, etc.)`}},decorators:[e=>(0,E.jsx)(s,{style:{maxWidth:600,padding:24,border:`1px solid #d9d9d9`,borderRadius:8},children:(0,E.jsx)(e,{})})]},K={name:`Basic`,parameters:{docs:{description:{story:`Basic usage with a required text input field. The field starts in "Keep as is" mode. Click the placeholder to switch to edit mode.`}}},args:{name:`nickname`,label:`Nickname`,children:(0,E.jsx)(v,{"aria-label":`Nickname`,placeholder:`Enter nickname`})}},q={name:`OptionalField`,parameters:{docs:{description:{story:`Optional field that can be cleared. The Clear link appears in "Keep as is" mode to allow unsetting the value.`}}},args:{name:`domain_name`,label:`Domain`,showClear:!0,children:(0,E.jsx)(f,{placeholder:`Select domain`,options:[{value:`default`,label:`Default`},{value:`custom`,label:`Custom`},{value:`test`,label:`Test`}]})}},J={name:`WithSelect`,parameters:{docs:{description:{story:`Using BAIBulkEditFormItem with a Select component for choosing from predefined options.`}}},args:{name:`status`,label:`User Status`,children:(0,E.jsx)(f,{placeholder:`Select status`,options:[{value:`active`,label:`Active`},{value:`inactive`,label:`Inactive`},{value:`deleted`,label:`Deleted`}]})}},Y={name:`WithInputNumber`,parameters:{docs:{description:{story:`Using BAIBulkEditFormItem with InputNumber for numeric values.`}}},args:{name:`container_uid`,label:`Container UID`,showClear:!0,children:(0,E.jsx)(ie,{width:`100%`,hasClear:!1,"aria-label":`Container UID`,placeholder:`Enter UID`})}},X={name:`WithCustomClearLabel`,parameters:{docs:{description:{story:`Example with custom clearValueLabel. When clearing this field, "No domain selected" will be displayed instead of default "Clear".`}}},args:{name:`domain`,label:`Domain`,showClear:!0,clearValueLabel:`No domain selected`,children:(0,E.jsx)(f,{placeholder:`Select domain`,options:[{value:`default`,label:`Default`},{value:`custom`,label:`Custom`}]})}},Z={name:`WithCustomKeepLabel`,parameters:{docs:{description:{story:`Example with custom keepValueLabel. The keep mode placeholder will display "No changes to this field" instead of default "Keep as is".`}}},args:{name:`status`,label:`Status`,keepValueLabel:`No changes to this field`,children:(0,E.jsx)(f,{placeholder:`Select status`,options:[{value:`active`,label:`Active`},{value:`inactive`,label:`Inactive`}]})}},Q={name:`MultipleFields`,parameters:{docs:{description:{story:`Example showing multiple BAIBulkEditFormItem fields in a single form with different configurations.`}}},render:()=>(0,E.jsxs)(E.Fragment,{children:[(0,E.jsx)(C,{name:`domain`,label:`Domain`,showClear:!0,children:(0,E.jsx)(f,{placeholder:`Select domain`,options:[{value:`default`,label:`Default`},{value:`custom`,label:`Custom`}]})}),(0,E.jsx)(C,{name:`status`,label:`Status`,children:(0,E.jsx)(f,{placeholder:`Select status`,options:[{value:`active`,label:`Active`},{value:`inactive`,label:`Inactive`}]})}),(0,E.jsx)(C,{name:`notes`,label:`Notes`,showClear:!0,children:(0,E.jsx)(oe,{"aria-label":`Notes`,rows:3,placeholder:`Add notes`})})]})},$={name:`WithFormValues`,parameters:{docs:{description:{story:`Interactive example that shows the current form values. Try switching between Keep as is, Edit, and Clear modes to see how values change.`}}},decorators:[e=>{let[t]=s.useForm(),[n,r]=(0,T.useState)({});return(0,E.jsxs)(s,{form:t,style:{maxWidth:600,padding:24,border:`1px solid #d9d9d9`,borderRadius:8},onValuesChange:(e,t)=>r(t),children:[(0,E.jsx)(e,{}),(0,E.jsxs)(u,{direction:`column`,gap:`sm`,style:{marginTop:16},children:[(0,E.jsx)(ne,{type:`primary`,onClick:()=>{let e=t.getFieldsValue();r(e)},children:`Get Form Values`}),(0,E.jsx)(`pre`,{style:{background:`#f5f5f5`,padding:12,borderRadius:4,fontSize:12},children:JSON.stringify(n,null,2)})]})]})}],render:()=>(0,E.jsxs)(E.Fragment,{children:[(0,E.jsx)(C,{name:`domain`,label:`Domain`,showClear:!0,children:(0,E.jsx)(f,{placeholder:`Select domain`,options:[{value:`default`,label:`Default`},{value:`custom`,label:`Custom`}]})}),(0,E.jsx)(C,{name:`status`,label:`Status`,children:(0,E.jsx)(f,{placeholder:`Select status`,options:[{value:`active`,label:`Active`},{value:`inactive`,label:`Inactive`}]})})]})},K.parameters={...K.parameters,docs:{...(de=K.parameters)==null?void 0:de.docs,source:{originalSource:`{
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
}`,...(D=K.parameters)==null||(D=D.docs)==null?void 0:D.source},description:{story:`Basic usage with a required field.
No Clear link is shown since the field is not optional.`,...(O=K.parameters)==null||(O=O.docs)==null?void 0:O.description}}},q.parameters={...q.parameters,docs:{...(fe=q.parameters)==null?void 0:fe.docs,source:{originalSource:`{
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
}`,...(k=q.parameters)==null||(k=k.docs)==null?void 0:k.source},description:{story:`Optional field that can be cleared.
Shows the Clear link in "Keep as is" mode.`,...(A=q.parameters)==null||(A=A.docs)==null?void 0:A.description}}},J.parameters={...J.parameters,docs:{...(pe=J.parameters)==null?void 0:pe.docs,source:{originalSource:`{
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
}`,...(j=J.parameters)==null||(j=j.docs)==null?void 0:j.source},description:{story:`Select input with options.`,...(M=J.parameters)==null||(M=M.docs)==null?void 0:M.description}}},Y.parameters={...Y.parameters,docs:{...(N=Y.parameters)==null?void 0:N.docs,source:{originalSource:`{
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
}`,...(P=Y.parameters)==null||(P=P.docs)==null?void 0:P.source},description:{story:`Number input field.`,...(F=Y.parameters)==null||(F=F.docs)==null?void 0:F.description}}},X.parameters={...X.parameters,docs:{...(I=X.parameters)==null?void 0:I.docs,source:{originalSource:`{
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
}`,...(L=X.parameters)==null||(L=L.docs)==null?void 0:L.source},description:{story:`Custom clearValueLabel example.
Shows how to customize the label displayed when field is cleared.`,...(R=X.parameters)==null||(R=R.docs)==null?void 0:R.description}}},Z.parameters={...Z.parameters,docs:{...(z=Z.parameters)==null?void 0:z.docs,source:{originalSource:`{
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
}`,...(B=Z.parameters)==null||(B=B.docs)==null?void 0:B.source},description:{story:`Custom keepValueLabel example.
Shows how to customize the label displayed in keep mode.`,...(V=Z.parameters)==null||(V=V.docs)==null?void 0:V.description}}},Q.parameters={...Q.parameters,docs:{...(me=Q.parameters)==null?void 0:me.docs,source:{originalSource:`{
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
}`,...(H=Q.parameters)==null||(H=H.docs)==null?void 0:H.source},description:{story:`Multiple fields in a form demonstrating different configurations.`,...(U=Q.parameters)==null||(U=U.docs)==null?void 0:U.description}}},$.parameters={...$.parameters,docs:{...(he=$.parameters)==null?void 0:he.docs,source:{originalSource:`{
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
}`,...(W=$.parameters)==null||(W=W.docs)==null?void 0:W.source},description:{story:`Interactive example showing form values.`,...(G=$.parameters)==null||(G=G.docs)==null?void 0:G.description}}},_e=[`Default`,`OptionalField`,`WithSelect`,`WithInputNumber`,`WithCustomClearLabel`,`WithCustomKeepLabel`,`MultipleFields`,`WithFormValues`]})))()}ve();export{K as Default,Q as MultipleFields,q as OptionalField,X as WithCustomClearLabel,Z as WithCustomKeepLabel,$ as WithFormValues,Y as WithInputNumber,J as WithSelect,_e as __namedExportsOrder,ge as default};