import{aP as we,_ as c,r as d,j as e,aQ as V,c as Ae}from"./iframe-Dh0MDrIa.js";import{L as j}from"./Link-CgjlQHXp.js";import{T as Ee}from"./TextInput-qcWGQwbq.js";import{B as Ve}from"./BAIButton-Cb84g4HQ.js";import{B as je}from"./BAIFlex-D7IfxPSZ.js";import{B as m}from"./BAISelect-DsJRAbok.js";import{A as De,a as Le,b as Ne}from"./astryxFormControls-ClxEgTxm.js";import"./preload-helper-Dp1pzeXC.js";import"./computeTargetAndRel-BGwjeA1c.js";import"./useInteractiveRole-C52QYfKe.js";import"./groupStyles-NJ92Hx_V.js";import"./FieldStatus-uJFP7xmC.js";import"./InputGroupContext-QXokSCuQ.js";import"./useDevWarning-BGowGFQg.js";import"./useInputStatusIcon-Bb7p9nQe.js";import"./useResolvedRequired-CNTrpJq5.js";import"./astryxLabel-DJEPLDdC.js";import"./isString-ChFW5PdW.js";import"./isEmpty-CTbDDwO9.js";import"./Selector-BDcrBwGm.js";import"./useMenuOverflow-CD3pKdNN.js";import"./SelectorOption-DIkbkEqK.js";import"./Item-D-ePZouE.js";import"./isRenderable-BUV0eL6r.js";import"./composeEventHandlers-BolWE7qY.js";import"./usePopover-D3v0o_rD.js";import"./rtlStyles-T4i24HtE.js";import"./useIndicator-BqUGxVgl.js";import"./Divider-oeoG7n00.js";import"./isRtlElement-B2-7SF8s.js";import"./Badge-Dhhk68d9.js";import"./CheckboxInput-CcebZPTm.js";import"./characters-DWaYg7k3.js";import"./NumberInput-DGKeBZNf.js";var We=()=>{};function ve({name:a,hasClear:t=!1,keepValueLabel:s,clearValueLabel:l,clearLabel:i,undoLabel:p,children:h,...r}){let n=we(),C=c.useFormInstance(),[b,f]=d.useState("keep"),S=d.useRef(null),ge=()=>{setTimeout(()=>{var o,E;(o=S.current)==null||o.focus(),(E=S.current)==null||E.open()},0)},w=o=>{o.preventDefault(),f("edit"),ge()},xe=()=>{let o=C.getFieldValue(a);o===void 0&&f("keep"),o===null&&t&&f("clear")},Be=()=>{f("clear"),C.setFieldValue(a,null)},ke=()=>{f("keep"),C.setFieldValue(a,void 0)},Fe=s??n("uic.BulkEditFormItem.keepAsIs"),Ce=l??n("uic.BulkEditFormItem.clear"),Se=e.jsxs(V,{align:"center",children:[b==="keep"&&t&&e.jsx(j,{onClick:Be,children:i??n("uic.BulkEditFormItem.clear")}),e.jsx(c.Item,{noStyle:!0,dependencies:[a],children:({getFieldValue:o})=>b!=="keep"&&o(a)!==void 0&&e.jsx(j,{onClick:ke,children:p??n("uic.BulkEditFormItem.undoChanges")})})]}),A=o=>e.jsx(Ee,{label:o,isLabelHidden:!0,value:o,onChange:We,onMouseDown:w,onFocus:w,width:"100%"});return e.jsxs(c.Item,{...r,style:{marginBottom:0,...r.style},required:!0,extra:e.jsxs(V,{justify:r.extra?"between":"end",align:"center",gap:2,children:[r.extra,Se]}),children:[b==="keep"?A(Fe):b==="clear"?A(Ce):null,b!=="keep"&&e.jsx(c.Item,{name:a,...r,noStyle:!0,hidden:b!=="edit",children:h&&e.jsx(ye,{ref:S,onBlur:xe,children:h})})]})}ve.displayName="BulkEditFormItem";var ye=d.forwardRef(({children:a,...t},s)=>{let l=d.useRef(null),[i,p]=d.useState(!1);d.useImperativeHandle(s,()=>({focus:()=>{var r,n;return(n=(r=l.current)==null?void 0:r.focus)==null?void 0:n.call(r)},open:()=>p(!0)}));let h=a.props;return d.cloneElement(a,{...t,ref:l,open:i,onOpenChange:r=>{var n;p(r),(n=h.onOpenChange)==null||n.call(h,r)}})});ye.displayName="ControlWrapper";const u=a=>{"use memo";const t=Ae.c(6);let s,l;t[0]!==a?({showClear:l,...s}=a,t[0]=a,t[1]=s,t[2]=l):(s=t[1],l=t[2]);let i;return t[3]!==s||t[4]!==l?(i=e.jsx(ve,{...s,hasClear:l}),t[3]=s,t[4]=l,t[5]=i):i=t[5],i};u.displayName="BAIBulkEditFormItem";const ft={title:"Components/BAIBulkEditFormItem",component:u,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:`
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
        `}}},argTypes:{showClear:{control:{type:"boolean"},description:"Whether this field can be cleared (shows Clear link)",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},keepValueLabel:{control:{type:"text"},description:'Label displayed in the keep mode placeholder. Defaults to i18n "Keep as is".',table:{type:{summary:"string"},defaultValue:{summary:'"Keep as is"'}}},clearValueLabel:{control:{type:"text"},description:'Label displayed in the clear mode placeholder. Defaults to i18n "Clear".',table:{type:{summary:"string"},defaultValue:{summary:'"Clear"'}}},label:{control:{type:"text"},description:"Label text for the form item",table:{type:{summary:"ReactNode"}}},name:{control:!1,description:"Field name in form data",table:{type:{summary:"NamePath"}}},children:{control:!1,description:"Input component to render (typically Select, Input, etc.)"}},decorators:[a=>e.jsx(c,{style:{maxWidth:600,padding:24,border:"1px solid #d9d9d9",borderRadius:8},children:e.jsx(a,{})})]},I={name:"Basic",parameters:{docs:{description:{story:'Basic usage with a required text input field. The field starts in "Keep as is" mode. Click the placeholder to switch to edit mode.'}}},args:{name:"nickname",label:"Nickname",children:e.jsx(De,{label:"Nickname",placeholder:"Enter nickname"})}},v={name:"OptionalField",parameters:{docs:{description:{story:'Optional field that can be cleared. The Clear link appears in "Keep as is" mode to allow unsetting the value.'}}},args:{name:"domain_name",label:"Domain",showClear:!0,children:e.jsx(m,{placeholder:"Select domain",options:[{value:"default",label:"Default"},{value:"custom",label:"Custom"},{value:"test",label:"Test"}]})}},y={name:"WithSelect",parameters:{docs:{description:{story:"Using BAIBulkEditFormItem with a Select component for choosing from predefined options."}}},args:{name:"status",label:"User Status",children:e.jsx(m,{placeholder:"Select status",options:[{value:"active",label:"Active"},{value:"inactive",label:"Inactive"},{value:"deleted",label:"Deleted"}]})}},g={name:"WithInputNumber",parameters:{docs:{description:{story:"Using BAIBulkEditFormItem with InputNumber for numeric values."}}},args:{name:"container_uid",label:"Container UID",showClear:!0,children:e.jsx(Ne,{label:"Container UID",placeholder:"Enter UID"})}},x={name:"WithCustomClearLabel",parameters:{docs:{description:{story:'Example with custom clearValueLabel. When clearing this field, "No domain selected" will be displayed instead of default "Clear".'}}},args:{name:"domain",label:"Domain",showClear:!0,clearValueLabel:"No domain selected",children:e.jsx(m,{placeholder:"Select domain",options:[{value:"default",label:"Default"},{value:"custom",label:"Custom"}]})}},B={name:"WithCustomKeepLabel",parameters:{docs:{description:{story:'Example with custom keepValueLabel. The keep mode placeholder will display "No changes to this field" instead of default "Keep as is".'}}},args:{name:"status",label:"Status",keepValueLabel:"No changes to this field",children:e.jsx(m,{placeholder:"Select status",options:[{value:"active",label:"Active"},{value:"inactive",label:"Inactive"}]})}},k={name:"MultipleFields",parameters:{docs:{description:{story:"Example showing multiple BAIBulkEditFormItem fields in a single form with different configurations."}}},render:()=>e.jsxs(e.Fragment,{children:[e.jsx(u,{name:"domain",label:"Domain",showClear:!0,children:e.jsx(m,{placeholder:"Select domain",options:[{value:"default",label:"Default"},{value:"custom",label:"Custom"}]})}),e.jsx(u,{name:"status",label:"Status",children:e.jsx(m,{placeholder:"Select status",options:[{value:"active",label:"Active"},{value:"inactive",label:"Inactive"}]})}),e.jsx(u,{name:"notes",label:"Notes",showClear:!0,children:e.jsx(Le,{label:"Notes",rows:3,placeholder:"Add notes"})})]})},F={name:"WithFormValues",parameters:{docs:{description:{story:"Interactive example that shows the current form values. Try switching between Keep as is, Edit, and Clear modes to see how values change."}}},decorators:[a=>{const[t]=c.useForm(),[s,l]=d.useState({});return e.jsxs(c,{form:t,style:{maxWidth:600,padding:24,border:"1px solid #d9d9d9",borderRadius:8},onValuesChange:(i,p)=>l(p),children:[e.jsx(a,{}),e.jsxs(je,{direction:"column",gap:"sm",style:{marginTop:16},children:[e.jsx(Ve,{type:"primary",onClick:()=>{const i=t.getFieldsValue();l(i)},children:"Get Form Values"}),e.jsx("pre",{style:{background:"#f5f5f5",padding:12,borderRadius:4,fontSize:12},children:JSON.stringify(s,null,2)})]})]})}],render:()=>e.jsxs(e.Fragment,{children:[e.jsx(u,{name:"domain",label:"Domain",showClear:!0,children:e.jsx(m,{placeholder:"Select domain",options:[{value:"default",label:"Default"},{value:"custom",label:"Custom"}]})}),e.jsx(u,{name:"status",label:"Status",children:e.jsx(m,{placeholder:"Select status",options:[{value:"active",label:"Active"},{value:"inactive",label:"Inactive"}]})})]})};var D,L,N,W,T;I.parameters={...I.parameters,docs:{...(D=I.parameters)==null?void 0:D.docs,source:{originalSource:`{
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
    children: <AstryxFormTextInput label="Nickname" placeholder="Enter nickname" />
  }
}`,...(N=(L=I.parameters)==null?void 0:L.docs)==null?void 0:N.source},description:{story:`Basic usage with a required field.
No Clear link is shown since the field is not optional.`,...(T=(W=I.parameters)==null?void 0:W.docs)==null?void 0:T.description}}};var K,O,U,R,_;v.parameters={...v.parameters,docs:{...(K=v.parameters)==null?void 0:K.docs,source:{originalSource:`{
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
}`,...(U=(O=v.parameters)==null?void 0:O.docs)==null?void 0:U.source},description:{story:`Optional field that can be cleared.
Shows the Clear link in "Keep as is" mode.`,...(_=(R=v.parameters)==null?void 0:R.docs)==null?void 0:_.description}}};var M,P,z,q,H;y.parameters={...y.parameters,docs:{...(M=y.parameters)==null?void 0:M.docs,source:{originalSource:`{
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
}`,...(z=(P=y.parameters)==null?void 0:P.docs)==null?void 0:z.source},description:{story:"Select input with options.",...(H=(q=y.parameters)==null?void 0:q.docs)==null?void 0:H.description}}};var G,J,Q,X,Y;g.parameters={...g.parameters,docs:{...(G=g.parameters)==null?void 0:G.docs,source:{originalSource:`{
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
    children: <AstryxFormNumberInput label="Container UID" placeholder="Enter UID" />
  }
}`,...(Q=(J=g.parameters)==null?void 0:J.docs)==null?void 0:Q.source},description:{story:"Number input field.",...(Y=(X=g.parameters)==null?void 0:X.docs)==null?void 0:Y.description}}};var Z,$,ee,te,ae;x.parameters={...x.parameters,docs:{...(Z=x.parameters)==null?void 0:Z.docs,source:{originalSource:`{
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
}`,...(ee=($=x.parameters)==null?void 0:$.docs)==null?void 0:ee.source},description:{story:`Custom clearValueLabel example.
Shows how to customize the label displayed when field is cleared.`,...(ae=(te=x.parameters)==null?void 0:te.docs)==null?void 0:ae.description}}};var le,re,se,oe,ie;B.parameters={...B.parameters,docs:{...(le=B.parameters)==null?void 0:le.docs,source:{originalSource:`{
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
}`,...(se=(re=B.parameters)==null?void 0:re.docs)==null?void 0:se.source},description:{story:`Custom keepValueLabel example.
Shows how to customize the label displayed in keep mode.`,...(ie=(oe=B.parameters)==null?void 0:oe.docs)==null?void 0:ie.description}}};var ne,de,me,ce,ue;k.parameters={...k.parameters,docs:{...(ne=k.parameters)==null?void 0:ne.docs,source:{originalSource:`{
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
        <AstryxFormTextArea label="Notes" rows={3} placeholder="Add notes" />
      </BAIBulkEditFormItem>
    </>
}`,...(me=(de=k.parameters)==null?void 0:de.docs)==null?void 0:me.source},description:{story:"Multiple fields in a form demonstrating different configurations.",...(ue=(ce=k.parameters)==null?void 0:ce.docs)==null?void 0:ue.description}}};var pe,he,be,fe,Ie;F.parameters={...F.parameters,docs:{...(pe=F.parameters)==null?void 0:pe.docs,source:{originalSource:`{
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
}`,...(be=(he=F.parameters)==null?void 0:he.docs)==null?void 0:be.source},description:{story:"Interactive example showing form values.",...(Ie=(fe=F.parameters)==null?void 0:fe.docs)==null?void 0:Ie.description}}};const It=["Default","OptionalField","WithSelect","WithInputNumber","WithCustomClearLabel","WithCustomKeepLabel","MultipleFields","WithFormValues"];export{I as Default,k as MultipleFields,v as OptionalField,x as WithCustomClearLabel,B as WithCustomKeepLabel,F as WithFormValues,g as WithInputNumber,y as WithSelect,It as __namedExportsOrder,ft as default};
