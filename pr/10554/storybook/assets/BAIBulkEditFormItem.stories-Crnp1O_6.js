import{b8 as we,v as c,r as m,j as e,b9 as V,c as Ae}from"./iframe-Di_XecXq.js";import{L as j}from"./Link-HmFYNgYo.js";import{T as Ee}from"./TextInput-BbbtQHGU.js";import{B as Ve}from"./BAIButton-C1saA3Jb.js";import{B as je}from"./BAIFlex-CJFLln3b.js";import{B as d}from"./BAISelect-CchNDjZ9.js";import{a as De}from"./TextInput-DRG75ITN.js";import{a as Le}from"./TextArea-CP4fyx5w.js";import{o as Ne}from"./NumberInput-DeG9ERIG.js";import"./preload-helper-Dp1pzeXC.js";import"./computeTargetAndRel-BGwjeA1c.js";import"./disabledInteraction-dV6L5qOr.js";import"./FieldStatus-B7qhiKO8.js";import"./FormLayoutContext-CRUCCzsJ.js";import"./useIsHydrating-DTbsppsP.js";import"./useInputStatusIcon-CJkErjID.js";import"./useResolvedRequired-CGC_LxF2.js";import"./fieldParts-CE36oM2V.js";import"./useDevWarning-BsyZ8wza.js";import"./inputAria-CStWn1wH.js";import"./InputClearButton-BtChBCU4.js";import"./inputStyles.stylex-Bztz6H8O.js";import"./Field-DPoAktDR.js";import"./astryxLabel-B1TNXW_F.js";import"./isString-Digz9kF-.js";import"./isEmpty-Ddx88K_P.js";import"./index-C1noMiXy.js";import"./runtime-BhgYCK9T.js";import"./formControl-yDi8ZhE9.js";import"./selectorPresentation.stylex-Cqa2LNg7.js";import"./Section-BxAKnwrx.js";import"./usePopover-DESJi4Cf.js";import"./rtlStyles-T4i24HtE.js";import"./useFocusReturnVisibility-CH3kfbxQ.js";import"./isRtlElement-B2-7SF8s.js";import"./useHighlightedOptionScroll-C3lQmDXG.js";import"./useAnnounceRenderedText-BOgI6usD.js";import"./composeEventHandlers-BolWE7qY.js";import"./Badge-BUDzgrLN.js";import"./CheckboxInput-Btc2rrRL.js";import"./indicator.markers.stylex-BihYEKkF.js";import"./useIndicator-CPJ0h6HQ.js";import"./Divider-BJtW0HkZ.js";import"./index-CD8cimzP.js";import"./Selector-THRRKoq1.js";import"./useMenuOverflow-DjAY5N7o.js";import"./SelectorOption-7-PL2lKU.js";import"./Item-BDOUOfBO.js";import"./characters-DWaYg7k3.js";import"./NumberInput-B1mF44eu.js";import"./useLocale-BXMGBb6q.js";var We=()=>{};function ve({name:a,hasClear:t=!1,keepValueLabel:o,clearValueLabel:l,clearLabel:i,undoLabel:p,children:h,...r}){let n=we(),S=c.useFormInstance(),[b,f]=m.useState("keep"),F=m.useRef(null),Be=()=>{setTimeout(()=>{var s,E;(s=F.current)==null||s.focus(),(E=F.current)==null||E.open()},0)},w=s=>{s.preventDefault(),f("edit"),Be()},ye=()=>{let s=S.getFieldValue(a);s===void 0&&f("keep"),s===null&&t&&f("clear")},ke=()=>{f("clear"),S.setFieldValue(a,null)},xe=()=>{f("keep"),S.setFieldValue(a,void 0)},Ce=o??n("uic.BulkEditFormItem.keepAsIs"),Se=l??n("uic.BulkEditFormItem.clear"),Fe=e.jsxs(V,{align:"center",children:[b==="keep"&&t&&e.jsx(j,{onClick:ke,children:i??n("uic.BulkEditFormItem.clear")}),e.jsx(c.Item,{noStyle:!0,dependencies:[a],children:({getFieldValue:s})=>b!=="keep"&&s(a)!==void 0&&e.jsx(j,{onClick:xe,children:p??n("uic.BulkEditFormItem.undoChanges")})})]}),A=s=>e.jsx(Ee,{label:s,isLabelHidden:!0,value:s,onChange:We,onMouseDown:w,onFocus:w,width:"100%"});return e.jsxs(c.Item,{...r,style:{marginBottom:0,...r.style},required:!0,extra:e.jsxs(V,{justify:r.extra?"between":"end",align:"center",gap:2,children:[r.extra,Fe]}),children:[b==="keep"?A(Ce):b==="clear"?A(Se):null,b!=="keep"&&e.jsx(c.Item,{name:a,...r,noStyle:!0,hidden:b!=="edit",children:h&&e.jsx(ge,{ref:F,onBlur:ye,children:h})})]})}ve.displayName="BulkEditFormItem";var ge=m.forwardRef(({children:a,...t},o)=>{let l=m.useRef(null),[i,p]=m.useState(!1);m.useImperativeHandle(o,()=>({focus:()=>{var r,n;return(n=(r=l.current)==null?void 0:r.focus)==null?void 0:n.call(r)},open:()=>p(!0)}));let h=a.props;return m.cloneElement(a,{...t,ref:l,open:i,onOpenChange:r=>{var n;p(r),(n=h.onOpenChange)==null||n.call(h,r)}})});ge.displayName="ControlWrapper";const u=a=>{"use memo";const t=Ae.c(6);let o,l;t[0]!==a?({showClear:l,...o}=a,t[0]=a,t[1]=o,t[2]=l):(o=t[1],l=t[2]);let i;return t[3]!==o||t[4]!==l?(i=e.jsx(ve,{...o,hasClear:l}),t[3]=o,t[4]=l,t[5]=i):i=t[5],i};u.displayName="BAIBulkEditFormItem";const Lt={title:"Components/BAIBulkEditFormItem",component:u,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:`
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
        `}}},argTypes:{showClear:{control:{type:"boolean"},description:"Whether this field can be cleared (shows Clear link)",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},keepValueLabel:{control:{type:"text"},description:'Label displayed in the keep mode placeholder. Defaults to i18n "Keep as is".',table:{type:{summary:"string"},defaultValue:{summary:'"Keep as is"'}}},clearValueLabel:{control:{type:"text"},description:'Label displayed in the clear mode placeholder. Defaults to i18n "Clear".',table:{type:{summary:"string"},defaultValue:{summary:'"Clear"'}}},label:{control:{type:"text"},description:"Label text for the form item",table:{type:{summary:"ReactNode"}}},name:{control:!1,description:"Field name in form data",table:{type:{summary:"NamePath"}}},children:{control:!1,description:"Input component to render (typically Select, Input, etc.)"}},decorators:[a=>e.jsx(c,{style:{maxWidth:600,padding:24,border:"1px solid #d9d9d9",borderRadius:8},children:e.jsx(a,{})})]},I={name:"Basic",parameters:{docs:{description:{story:'Basic usage with a required text input field. The field starts in "Keep as is" mode. Click the placeholder to switch to edit mode.'}}},args:{name:"nickname",label:"Nickname",children:e.jsx(De,{"aria-label":"Nickname",placeholder:"Enter nickname"})}},v={name:"OptionalField",parameters:{docs:{description:{story:'Optional field that can be cleared. The Clear link appears in "Keep as is" mode to allow unsetting the value.'}}},args:{name:"domain_name",label:"Domain",showClear:!0,children:e.jsx(d,{placeholder:"Select domain",options:[{value:"default",label:"Default"},{value:"custom",label:"Custom"},{value:"test",label:"Test"}]})}},g={name:"WithSelect",parameters:{docs:{description:{story:"Using BAIBulkEditFormItem with a Select component for choosing from predefined options."}}},args:{name:"status",label:"User Status",children:e.jsx(d,{placeholder:"Select status",options:[{value:"active",label:"Active"},{value:"inactive",label:"Inactive"},{value:"deleted",label:"Deleted"}]})}},B={name:"WithInputNumber",parameters:{docs:{description:{story:"Using BAIBulkEditFormItem with InputNumber for numeric values."}}},args:{name:"container_uid",label:"Container UID",showClear:!0,children:e.jsx(Ne,{hasClear:!1,"aria-label":"Container UID",placeholder:"Enter UID"})}},y={name:"WithCustomClearLabel",parameters:{docs:{description:{story:'Example with custom clearValueLabel. When clearing this field, "No domain selected" will be displayed instead of default "Clear".'}}},args:{name:"domain",label:"Domain",showClear:!0,clearValueLabel:"No domain selected",children:e.jsx(d,{placeholder:"Select domain",options:[{value:"default",label:"Default"},{value:"custom",label:"Custom"}]})}},k={name:"WithCustomKeepLabel",parameters:{docs:{description:{story:'Example with custom keepValueLabel. The keep mode placeholder will display "No changes to this field" instead of default "Keep as is".'}}},args:{name:"status",label:"Status",keepValueLabel:"No changes to this field",children:e.jsx(d,{placeholder:"Select status",options:[{value:"active",label:"Active"},{value:"inactive",label:"Inactive"}]})}},x={name:"MultipleFields",parameters:{docs:{description:{story:"Example showing multiple BAIBulkEditFormItem fields in a single form with different configurations."}}},render:()=>e.jsxs(e.Fragment,{children:[e.jsx(u,{name:"domain",label:"Domain",showClear:!0,children:e.jsx(d,{placeholder:"Select domain",options:[{value:"default",label:"Default"},{value:"custom",label:"Custom"}]})}),e.jsx(u,{name:"status",label:"Status",children:e.jsx(d,{placeholder:"Select status",options:[{value:"active",label:"Active"},{value:"inactive",label:"Inactive"}]})}),e.jsx(u,{name:"notes",label:"Notes",showClear:!0,children:e.jsx(Le,{"aria-label":"Notes",rows:3,placeholder:"Add notes"})})]})},C={name:"WithFormValues",parameters:{docs:{description:{story:"Interactive example that shows the current form values. Try switching between Keep as is, Edit, and Clear modes to see how values change."}}},decorators:[a=>{const[t]=c.useForm(),[o,l]=m.useState({});return e.jsxs(c,{form:t,style:{maxWidth:600,padding:24,border:"1px solid #d9d9d9",borderRadius:8},onValuesChange:(i,p)=>l(p),children:[e.jsx(a,{}),e.jsxs(je,{direction:"column",gap:"sm",style:{marginTop:16},children:[e.jsx(Ve,{type:"primary",onClick:()=>{const i=t.getFieldsValue();l(i)},children:"Get Form Values"}),e.jsx("pre",{style:{background:"#f5f5f5",padding:12,borderRadius:4,fontSize:12},children:JSON.stringify(o,null,2)})]})]})}],render:()=>e.jsxs(e.Fragment,{children:[e.jsx(u,{name:"domain",label:"Domain",showClear:!0,children:e.jsx(d,{placeholder:"Select domain",options:[{value:"default",label:"Default"},{value:"custom",label:"Custom"}]})}),e.jsx(u,{name:"status",label:"Status",children:e.jsx(d,{placeholder:"Select status",options:[{value:"active",label:"Active"},{value:"inactive",label:"Inactive"}]})})]})};var D,L,N,W,T;I.parameters={...I.parameters,docs:{...(D=I.parameters)==null?void 0:D.docs,source:{originalSource:`{
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
}`,...(N=(L=I.parameters)==null?void 0:L.docs)==null?void 0:N.source},description:{story:`Basic usage with a required field.
No Clear link is shown since the field is not optional.`,...(T=(W=I.parameters)==null?void 0:W.docs)==null?void 0:T.description}}};var K,O,U,R,M;v.parameters={...v.parameters,docs:{...(K=v.parameters)==null?void 0:K.docs,source:{originalSource:`{
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
Shows the Clear link in "Keep as is" mode.`,...(M=(R=v.parameters)==null?void 0:R.docs)==null?void 0:M.description}}};var _,z,P,q,H;g.parameters={...g.parameters,docs:{...(_=g.parameters)==null?void 0:_.docs,source:{originalSource:`{
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
}`,...(P=(z=g.parameters)==null?void 0:z.docs)==null?void 0:P.source},description:{story:"Select input with options.",...(H=(q=g.parameters)==null?void 0:q.docs)==null?void 0:H.description}}};var G,J,Q,X,Y;B.parameters={...B.parameters,docs:{...(G=B.parameters)==null?void 0:G.docs,source:{originalSource:`{
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
    children: <BAINumberInput hasClear={false} aria-label="Container UID" placeholder="Enter UID" />
  }
}`,...(Q=(J=B.parameters)==null?void 0:J.docs)==null?void 0:Q.source},description:{story:"Number input field.",...(Y=(X=B.parameters)==null?void 0:X.docs)==null?void 0:Y.description}}};var Z,$,ee,te,ae;y.parameters={...y.parameters,docs:{...(Z=y.parameters)==null?void 0:Z.docs,source:{originalSource:`{
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
}`,...(ee=($=y.parameters)==null?void 0:$.docs)==null?void 0:ee.source},description:{story:`Custom clearValueLabel example.
Shows how to customize the label displayed when field is cleared.`,...(ae=(te=y.parameters)==null?void 0:te.docs)==null?void 0:ae.description}}};var le,re,oe,se,ie;k.parameters={...k.parameters,docs:{...(le=k.parameters)==null?void 0:le.docs,source:{originalSource:`{
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
}`,...(oe=(re=k.parameters)==null?void 0:re.docs)==null?void 0:oe.source},description:{story:`Custom keepValueLabel example.
Shows how to customize the label displayed in keep mode.`,...(ie=(se=k.parameters)==null?void 0:se.docs)==null?void 0:ie.description}}};var ne,me,de,ce,ue;x.parameters={...x.parameters,docs:{...(ne=x.parameters)==null?void 0:ne.docs,source:{originalSource:`{
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
}`,...(de=(me=x.parameters)==null?void 0:me.docs)==null?void 0:de.source},description:{story:"Multiple fields in a form demonstrating different configurations.",...(ue=(ce=x.parameters)==null?void 0:ce.docs)==null?void 0:ue.description}}};var pe,he,be,fe,Ie;C.parameters={...C.parameters,docs:{...(pe=C.parameters)==null?void 0:pe.docs,source:{originalSource:`{
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
}`,...(be=(he=C.parameters)==null?void 0:he.docs)==null?void 0:be.source},description:{story:"Interactive example showing form values.",...(Ie=(fe=C.parameters)==null?void 0:fe.docs)==null?void 0:Ie.description}}};const Nt=["Default","OptionalField","WithSelect","WithInputNumber","WithCustomClearLabel","WithCustomKeepLabel","MultipleFields","WithFormValues"];export{I as Default,x as MultipleFields,v as OptionalField,y as WithCustomClearLabel,k as WithCustomKeepLabel,C as WithFormValues,B as WithInputNumber,g as WithSelect,Nt as __namedExportsOrder,Lt as default};
