import{c as ze,a as qe,r as A,j as t,ax as ee,R as He}from"./iframe-DmQqQVMA.js";import{B as Y}from"./BAIFlex-Clxe_jdZ.js";import{F as h}from"./engine-CnjS9RDX.js";import{u as Ge}from"./useControllableValue-81UK5r11.js";import{T as te}from"./TextInput-DTG7HyI0.js";import{n as ae}from"./noop-DX6rZLP_.js";import{B as Je}from"./BAIButton-CLqsgJfx.js";import{B as p}from"./BAISelect-s1KMzRsw.js";import{A as $e,a as Qe,b as Xe}from"./astryxFormControls-DpJ_o0ok.js";import"./preload-helper-Dp1pzeXC.js";import"./circle-question-mark-DG-CfvGw.js";import"./InputGroupContext-RZo5ElI8.js";import"./useResolvedRequired-DpPF9iMk.js";import"./useInputStatusIcon-CultMiyg.js";import"./InputClearButton-0l_GfJYj.js";import"./useDevWarning-C_RgMo7-.js";import"./astryxLabel-IvlKeJTj.js";import"./isString-D6wMu39F.js";import"./isEmpty-aBX7fcgQ.js";import"./usePopover-B3i0E5rw.js";import"./rtlStyles-T4i24HtE.js";import"./Selector-BHLPEFhA.js";import"./useTypeahead-uFyAL8y4.js";import"./SelectorOption-DpNFZShj.js";import"./Item-CMR8m2XX.js";import"./useIndicator-Y3UpRkA2.js";import"./isRenderable-BUV0eL6r.js";import"./Divider-C8Tld6pH.js";import"./Badge-BKfmPevg.js";import"./CheckboxInput-CdNXB4Ut.js";import"./characters-DWaYg7k3.js";import"./NumberInput-CiNrluFJ.js";const f=c=>{"use memo";const e=ze.c(65);let d,r,l,m,a,s;e[0]!==c?({name:a,showClear:s,keepValueLabel:m,clearValueLabel:r,children:d,...l}=c,e[0]=c,e[1]=d,e[2]=r,e[3]=l,e[4]=m,e[5]=a,e[6]=s):(d=e[1],r=e[2],l=e[3],m=e[4],a=e[5],s=e[6]);const i=s===void 0?!1:s,{t:n}=qe(),u=h.useFormInstance(),[o,E]=A.useState("keep"),J=A.useRef(null);let R;if(e[7]===Symbol.for("react.memo_cache_sentinel")){const w=()=>{setTimeout(()=>{var S,Z;(S=J.current)==null||S.focus(),(Z=J.current)==null||Z.open()},0)};R=S=>{S.preventDefault(),E("edit"),w()},e[7]=R}else R=e[7];const U=R;let O;e[8]!==u||e[9]!==a||e[10]!==i?(O=()=>{const w=u.getFieldValue(a);w===void 0&&E("keep"),w===null&&i&&E("clear")},e[8]=u,e[9]=a,e[10]=i,e[11]=O):O=e[11];const $=O;let _;e[12]!==u||e[13]!==a?(_=()=>{E("clear"),u.setFieldValue(a,null)},e[12]=u,e[13]=a,e[14]=_):_=e[14];const Q=_;let M;e[15]!==u||e[16]!==a?(M=()=>{E("keep"),u.setFieldValue(a,void 0)},e[15]=u,e[16]=a,e[17]=M):M=e[17];const X=M;let P;e[18]!==m||e[19]!==n?(P=m??n("comp:BAIBulkEditFormItem.KeepAsIs"),e[18]=m,e[19]=n,e[20]=P):P=e[20];const z=P;let q;e[21]!==r||e[22]!==n?(q=r??n("comp:BAIBulkEditFormItem.Clear"),e[21]=r,e[22]=n,e[23]=q):q=e[23];const H=q;let b;e[24]!==l.style?(b={marginBottom:0,...l.style},e[24]=l.style,e[25]=b):b=e[25];let I;e[26]!==l.extra?(I=l.extra??t.jsx("div",{}),e[26]=l.extra,e[27]=I):I=e[27];let v;e[28]!==Q||e[29]!==o||e[30]!==i||e[31]!==n?(v=o==="keep"&&i&&t.jsx(ee,{onClick:Q,children:n("comp:BAIBulkEditFormItem.Clear")}),e[28]=Q,e[29]=o,e[30]=i,e[31]=n,e[32]=v):v=e[32];let g;e[33]!==a?(g=[a],e[33]=a,e[34]=g):g=e[34];let y;e[35]!==X||e[36]!==o||e[37]!==a||e[38]!==n?(y=w=>{const{getFieldValue:S}=w;return o!=="keep"&&S(a)!==void 0&&t.jsx(ee,{onClick:X,children:n("comp:BAIBulkEditFormItem.UndoChanges")})},e[35]=X,e[36]=o,e[37]=a,e[38]=n,e[39]=y):y=e[39];let x;e[40]!==g||e[41]!==y?(x=t.jsx(h.Item,{noStyle:!0,dependencies:g,children:y}),e[40]=g,e[41]=y,e[42]=x):x=e[42];let B;e[43]!==v||e[44]!==x?(B=t.jsxs(Y,{children:[v,x]}),e[43]=v,e[44]=x,e[45]=B):B=e[45];let C;e[46]!==B||e[47]!==I?(C=t.jsxs(Y,{justify:"between",gap:"xs",children:[I,B]}),e[46]=B,e[47]=I,e[48]=C):C=e[48];let F;e[49]!==o||e[50]!==H||e[51]!==z?(F=o==="keep"?t.jsx(te,{label:z,isLabelHidden:!0,value:z,onChange:ae,onMouseDown:U,onFocus:U,width:"100%"}):o==="clear"?t.jsx(te,{label:H,isLabelHidden:!0,value:H,onChange:ae,onMouseDown:U,onFocus:U,width:"100%"}):null,e[49]=o,e[50]=H,e[51]=z,e[52]=F):F=e[52];let k;e[53]!==d||e[54]!==l||e[55]!==$||e[56]!==o||e[57]!==a?(k=o!=="keep"&&t.jsx(h.Item,{name:a,...l,noStyle:!0,hidden:o!=="edit",children:d&&t.jsx(Pe,{ref:J,onBlur:$,children:d})}),e[53]=d,e[54]=l,e[55]=$,e[56]=o,e[57]=a,e[58]=k):k=e[58];let G;return e[59]!==l||e[60]!==C||e[61]!==F||e[62]!==k||e[63]!==b?(G=t.jsxs(h.Item,{...l,style:b,required:!0,extra:C,children:[F,k]}),e[59]=l,e[60]=C,e[61]=F,e[62]=k,e[63]=b,e[64]=G):G=e[64],G};f.displayName="BAIBulkEditFormItem";const Pe=He.forwardRef(({children:c,...e},d)=>{const r=A.useRef(null),[l,m]=Ge(e,{valuePropName:"open",trigger:"onOpenChange"});return A.useImperativeHandle(d,()=>({focus:()=>{var s,i;(i=(s=r.current)==null?void 0:s.focus)==null||i.call(s)},open:()=>{m(!0)}})),A.cloneElement(c,{...e,ref:r,open:l,onOpenChange:s=>{m(s);const{onOpenChange:i}=c.props;i&&i(s)}})});Pe.displayName="ControlWrapper";const Vt={title:"Components/BAIBulkEditFormItem",component:f,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:`
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
        `}}},argTypes:{showClear:{control:{type:"boolean"},description:"Whether this field can be cleared (shows Clear link)",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},keepValueLabel:{control:{type:"text"},description:'Label displayed in the keep mode placeholder. Defaults to i18n "Keep as is".',table:{type:{summary:"string"},defaultValue:{summary:'"Keep as is"'}}},clearValueLabel:{control:{type:"text"},description:'Label displayed in the clear mode placeholder. Defaults to i18n "Clear".',table:{type:{summary:"string"},defaultValue:{summary:'"Clear"'}}},label:{control:{type:"text"},description:"Label text for the form item",table:{type:{summary:"ReactNode"}}},name:{control:!1,description:"Field name in form data",table:{type:{summary:"NamePath"}}},children:{control:!1,description:"Input component to render (typically Select, Input, etc.)"}},decorators:[c=>t.jsx(h,{style:{maxWidth:600,padding:24,border:"1px solid #d9d9d9",borderRadius:8},children:t.jsx(c,{})})]},V={name:"Basic",parameters:{docs:{description:{story:'Basic usage with a required text input field. The field starts in "Keep as is" mode. Click the placeholder to switch to edit mode.'}}},args:{name:"nickname",label:"Nickname",children:t.jsx($e,{label:"Nickname",placeholder:"Enter nickname"})}},j={name:"OptionalField",parameters:{docs:{description:{story:'Optional field that can be cleared. The Clear link appears in "Keep as is" mode to allow unsetting the value.'}}},args:{name:"domain_name",label:"Domain",showClear:!0,children:t.jsx(p,{placeholder:"Select domain",options:[{value:"default",label:"Default"},{value:"custom",label:"Custom"},{value:"test",label:"Test"}]})}},D={name:"WithSelect",parameters:{docs:{description:{story:"Using BAIBulkEditFormItem with a Select component for choosing from predefined options."}}},args:{name:"status",label:"User Status",children:t.jsx(p,{placeholder:"Select status",options:[{value:"active",label:"Active"},{value:"inactive",label:"Inactive"},{value:"deleted",label:"Deleted"}]})}},L={name:"WithInputNumber",parameters:{docs:{description:{story:"Using BAIBulkEditFormItem with InputNumber for numeric values."}}},args:{name:"container_uid",label:"Container UID",showClear:!0,children:t.jsx(Xe,{label:"Container UID",placeholder:"Enter UID"})}},N={name:"WithCustomClearLabel",parameters:{docs:{description:{story:'Example with custom clearValueLabel. When clearing this field, "No domain selected" will be displayed instead of default "Clear".'}}},args:{name:"domain",label:"Domain",showClear:!0,clearValueLabel:"No domain selected",children:t.jsx(p,{placeholder:"Select domain",options:[{value:"default",label:"Default"},{value:"custom",label:"Custom"}]})}},W={name:"WithCustomKeepLabel",parameters:{docs:{description:{story:'Example with custom keepValueLabel. The keep mode placeholder will display "No changes to this field" instead of default "Keep as is".'}}},args:{name:"status",label:"Status",keepValueLabel:"No changes to this field",children:t.jsx(p,{placeholder:"Select status",options:[{value:"active",label:"Active"},{value:"inactive",label:"Inactive"}]})}},K={name:"MultipleFields",parameters:{docs:{description:{story:"Example showing multiple BAIBulkEditFormItem fields in a single form with different configurations."}}},render:()=>t.jsxs(t.Fragment,{children:[t.jsx(f,{name:"domain",label:"Domain",showClear:!0,children:t.jsx(p,{placeholder:"Select domain",options:[{value:"default",label:"Default"},{value:"custom",label:"Custom"}]})}),t.jsx(f,{name:"status",label:"Status",children:t.jsx(p,{placeholder:"Select status",options:[{value:"active",label:"Active"},{value:"inactive",label:"Inactive"}]})}),t.jsx(f,{name:"notes",label:"Notes",showClear:!0,children:t.jsx(Qe,{label:"Notes",rows:3,placeholder:"Add notes"})})]})},T={name:"WithFormValues",parameters:{docs:{description:{story:"Interactive example that shows the current form values. Try switching between Keep as is, Edit, and Clear modes to see how values change."}}},decorators:[c=>{const[e]=h.useForm(),[d,r]=A.useState({});return t.jsxs(h,{form:e,style:{maxWidth:600,padding:24,border:"1px solid #d9d9d9",borderRadius:8},onValuesChange:(l,m)=>r(m),children:[t.jsx(c,{}),t.jsxs(Y,{direction:"column",gap:"sm",style:{marginTop:16},children:[t.jsx(Je,{type:"primary",onClick:()=>{const l=e.getFieldsValue();r(l)},children:"Get Form Values"}),t.jsx("pre",{style:{background:"#f5f5f5",padding:12,borderRadius:4,fontSize:12},children:JSON.stringify(d,null,2)})]})]})}],render:()=>t.jsxs(t.Fragment,{children:[t.jsx(f,{name:"domain",label:"Domain",showClear:!0,children:t.jsx(p,{placeholder:"Select domain",options:[{value:"default",label:"Default"},{value:"custom",label:"Custom"}]})}),t.jsx(f,{name:"status",label:"Status",children:t.jsx(p,{placeholder:"Select status",options:[{value:"active",label:"Active"},{value:"inactive",label:"Inactive"}]})})]})};var le,oe,se,re,ie;V.parameters={...V.parameters,docs:{...(le=V.parameters)==null?void 0:le.docs,source:{originalSource:`{
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
}`,...(se=(oe=V.parameters)==null?void 0:oe.docs)==null?void 0:se.source},description:{story:`Basic usage with a required field.
No Clear link is shown since the field is not optional.`,...(ie=(re=V.parameters)==null?void 0:re.docs)==null?void 0:ie.description}}};var ne,de,me,ce,ue;j.parameters={...j.parameters,docs:{...(ne=j.parameters)==null?void 0:ne.docs,source:{originalSource:`{
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
}`,...(me=(de=j.parameters)==null?void 0:de.docs)==null?void 0:me.source},description:{story:`Optional field that can be cleared.
Shows the Clear link in "Keep as is" mode.`,...(ue=(ce=j.parameters)==null?void 0:ce.docs)==null?void 0:ue.description}}};var pe,he,fe,be,Ie;D.parameters={...D.parameters,docs:{...(pe=D.parameters)==null?void 0:pe.docs,source:{originalSource:`{
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
}`,...(fe=(he=D.parameters)==null?void 0:he.docs)==null?void 0:fe.source},description:{story:"Select input with options.",...(Ie=(be=D.parameters)==null?void 0:be.docs)==null?void 0:Ie.description}}};var ve,ge,ye,xe,Be;L.parameters={...L.parameters,docs:{...(ve=L.parameters)==null?void 0:ve.docs,source:{originalSource:`{
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
}`,...(ye=(ge=L.parameters)==null?void 0:ge.docs)==null?void 0:ye.source},description:{story:"Number input field.",...(Be=(xe=L.parameters)==null?void 0:xe.docs)==null?void 0:Be.description}}};var Ce,Fe,ke,we,Se;N.parameters={...N.parameters,docs:{...(Ce=N.parameters)==null?void 0:Ce.docs,source:{originalSource:`{
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
}`,...(ke=(Fe=N.parameters)==null?void 0:Fe.docs)==null?void 0:ke.source},description:{story:`Custom clearValueLabel example.
Shows how to customize the label displayed when field is cleared.`,...(Se=(we=N.parameters)==null?void 0:we.docs)==null?void 0:Se.description}}};var Ae,Ee,Ve,je,De;W.parameters={...W.parameters,docs:{...(Ae=W.parameters)==null?void 0:Ae.docs,source:{originalSource:`{
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
}`,...(Ve=(Ee=W.parameters)==null?void 0:Ee.docs)==null?void 0:Ve.source},description:{story:`Custom keepValueLabel example.
Shows how to customize the label displayed in keep mode.`,...(De=(je=W.parameters)==null?void 0:je.docs)==null?void 0:De.description}}};var Le,Ne,We,Ke,Te;K.parameters={...K.parameters,docs:{...(Le=K.parameters)==null?void 0:Le.docs,source:{originalSource:`{
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
}`,...(We=(Ne=K.parameters)==null?void 0:Ne.docs)==null?void 0:We.source},description:{story:"Multiple fields in a form demonstrating different configurations.",...(Te=(Ke=K.parameters)==null?void 0:Ke.docs)==null?void 0:Te.description}}};var Re,Ue,Oe,_e,Me;T.parameters={...T.parameters,docs:{...(Re=T.parameters)==null?void 0:Re.docs,source:{originalSource:`{
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
}`,...(Oe=(Ue=T.parameters)==null?void 0:Ue.docs)==null?void 0:Oe.source},description:{story:"Interactive example showing form values.",...(Me=(_e=T.parameters)==null?void 0:_e.docs)==null?void 0:Me.description}}};const jt=["Default","OptionalField","WithSelect","WithInputNumber","WithCustomClearLabel","WithCustomKeepLabel","MultipleFields","WithFormValues"];export{V as Default,K as MultipleFields,j as OptionalField,N as WithCustomClearLabel,W as WithCustomKeepLabel,T as WithFormValues,L as WithInputNumber,D as WithSelect,jt as __namedExportsOrder,Vt as default};
