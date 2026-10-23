import{b0 as Sa,v as g,r as o,j as e,b1 as re,c as wa,a2 as Ca,Q as Fa,bl as ja,a4 as Aa,a5 as Ea,s as G,t as se,w as J,a8 as Va,a9 as Wa,ag as Na}from"./iframe-CIHMcXES.js";import{L as oe}from"./Link-CmaPhNoS.js";import{T as Da}from"./TextInput-B6OWGpPD.js";import{B as Ta}from"./BAIButton-tSlxdnmM.js";import{B as za}from"./BAIFlex-nIF1xLSb.js";import{B as y}from"./BAISelect-NCmtsz8A.js";import{o as Ra}from"./NumberInput-f4ELptwi.js";import{s as La,c as qa,l as Oa}from"./formControl-BilqQQjN.js";import{u as Ua}from"./fieldParts-yJBgLmN9.js";import{u as Ma}from"./FieldStatus-C_ZeZ89i.js";import{u as Ka}from"./useInputStatusIcon-C68id50n.js";import{u as $a}from"./useResolvedRequired-CTixjkJk.js";import{c as ie}from"./characters-DWaYg7k3.js";import{F as Ha,i as _a,a as Pa,b as Ga,c as ne}from"./InputClearButton-0IriLIn3.js";import{a as Ja}from"./TextInput-DATiQWON.js";import"./preload-helper-Dp1pzeXC.js";import"./computeTargetAndRel-BGwjeA1c.js";import"./disabledInteraction-BpE4td_Z.js";import"./astryxLabel-BIbuuFDf.js";import"./runtime-BhgYCK9T.js";import"./Selector-C5wRH8CE.js";import"./useMenuOverflow-CbKarztI.js";import"./SelectorOption-b_Cgea7P.js";import"./Item-BbpCNb-5.js";import"./useDevWarning-cGm5jPz4.js";import"./composeEventHandlers-BolWE7qY.js";import"./Section-C_AdqiYy.js";import"./usePopover-D6dxGil8.js";import"./rtlStyles-T4i24HtE.js";import"./useIndicator-DiVpIKXl.js";import"./Divider-Zloj0q6G.js";import"./isRtlElement-B2-7SF8s.js";import"./Badge-B3rTwT3x.js";import"./CheckboxInput-DFEmo9iw.js";import"./index-CJUVZBtx.js";import"./isString-C33YZ6wE.js";import"./isEmpty-CarQGO80.js";import"./NumberInput-BaHnNXZp.js";import"./FormLayoutContext-C84IdEQ0.js";import"./useIsHydrating-Cc8oonUG.js";var Za=()=>{};function Je({name:l,hasClear:a=!1,keepValueLabel:i,clearValueLabel:r,clearLabel:c,undoLabel:u,children:f,...d}){let m=Sa(),I=g.useFormInstance(),[b,n]=o.useState("keep"),k=o.useRef(null),R=()=>{setTimeout(()=>{var p,L;(p=k.current)==null||p.focus(),(L=k.current)==null||L.open()},0)},t=p=>{p.preventDefault(),n("edit"),R()},C=()=>{let p=I.getFieldValue(l);p===void 0&&n("keep"),p===null&&a&&n("clear")},M=()=>{n("clear"),I.setFieldValue(l,null)},F=()=>{n("keep"),I.setFieldValue(l,void 0)},K=i??m("uic.BulkEditFormItem.keepAsIs"),$=r??m("uic.BulkEditFormItem.clear"),s=e.jsxs(re,{align:"center",children:[b==="keep"&&a&&e.jsx(oe,{onClick:M,children:c??m("uic.BulkEditFormItem.clear")}),e.jsx(g.Item,{noStyle:!0,dependencies:[l],children:({getFieldValue:p})=>b!=="keep"&&p(l)!==void 0&&e.jsx(oe,{onClick:F,children:u??m("uic.BulkEditFormItem.undoChanges")})})]}),j=p=>e.jsx(Da,{label:p,isLabelHidden:!0,value:p,onChange:Za,onMouseDown:t,onFocus:t,width:"100%"});return e.jsxs(g.Item,{...d,style:{marginBottom:0,...d.style},required:!0,extra:e.jsxs(re,{justify:d.extra?"between":"end",align:"center",gap:2,children:[d.extra,s]}),children:[b==="keep"?j(K):b==="clear"?j($):null,b!=="keep"&&e.jsx(g.Item,{name:l,...d,noStyle:!0,hidden:b!=="edit",children:f&&e.jsx(Ze,{ref:k,onBlur:C,children:f})})]})}Je.displayName="BulkEditFormItem";var Ze=o.forwardRef(({children:l,...a},i)=>{let r=o.useRef(null),[c,u]=o.useState(!1);o.useImperativeHandle(i,()=>({focus:()=>{var d,m;return(m=(d=r.current)==null?void 0:d.focus)==null?void 0:m.call(d)},open:()=>u(!0)}));let f=l.props;return o.cloneElement(l,{...a,ref:r,open:c,onOpenChange:d=>{var m;u(d),(m=f.onOpenChange)==null||m.call(f,d)}})});Ze.displayName="ControlWrapper";const B=l=>{"use memo";const a=wa.c(6);let i,r;a[0]!==l?({showClear:r,...i}=l,a[0]=l,a[1]=i,a[2]=r):(i=a[1],r=a[2]);let c;return a[3]!==i||a[4]!==r?(c=e.jsx(Je,{...i,hasClear:r}),a[3]=i,a[4]=r,a[5]=c):c=a[5],c};B.displayName="BAIBulkEditFormItem";const Qa=.8,v={wrapper:{kY2c9j:"x1vjfegm",k1xSpc:"x1lliihq",k8WAf4:"xt970qd",kg3NbH:"xnjsko4","--_textarea-inline-padding":"x1kdpo6e",$$css:!0},textarea:{k1xSpc:"x1lliihq",kzqmXN:"xh8yej3",kB7OPa:"x9f619",k7Eaqz:"xeuugli",kMzoRj:"xc342km",ksu8eU:"xng3xce",k8WAf4:"xu0wf1k",kg3NbH:"x1w6f3ag",kMv6JI:"x9ynric",kGuDYH:"xjm74w1 xf9zqsd",kLWn49:"xw6l6zx",kMwMTN:"x1tgivj0",kWkggS:"xjbqb8w",kI3sdo:"x1a2a7pz",k8Qsv1:"xeyghm5",kHenm0:"x288g5",$$css:!0},textareaDisabled:{kkrTdU:"xt0e3qv",$$css:!0},textareaWithStartIcon:{kZCmMZ:"x1b6te9z",$$css:!0},textareaWithStatus:{kwRFfy:"xp2dy4z",$$css:!0},textareaWithBusyStatus:{kwRFfy:"x1g2apga",$$css:!0},textareaWithCounter:{kGO01o:"xekm6fs",$$css:!0}},Ya={sm:{$$css:!0},md:{$$css:!0},lg:{k8WAf4:"xce4md1",$$css:!0}};function Qe({label:l,isLabelHidden:a=!1,description:i,isOptional:r=!1,isRequired:c=!1,onChange:u,changeAction:f,isLoading:d=!1,value:m,placeholder:I,rows:b=3,isDisabled:n=!1,isReadOnly:k=!1,disabledMessage:R,status:t,statusVariant:C="attached",labelTooltip:M,startIcon:F,hasSpellCheck:K=!0,onPaste:$,maxLength:s,hasAutoFocus:j=!1,size:p,htmlName:L,onFocus:Ye,onBlur:Xe,width:ea,containerXstyle:aa,containerClassName:ta,containerStyle:la,controlXstyle:ra,controlClassName:sa,controlStyle:oa,ref:ia,id:na,"aria-describedby":da,...ca}){const{rest:ua,container:ma}=Ua("TextArea",ca,{containerXstyle:aa,containerClassName:ta,containerStyle:la}),Z=Ca(p,"md"),H=Fa(),pa=$a({isRequired:c,isOptional:r}),_=ja(),ha=o.useId(),Q=na??ha,Y=o.useId(),X=o.useId(),ee=o.useId(),ae=o.useRef(null),te=o.useRef(null),le=o.useRef(null),[,fa]=o.useTransition(),[q,ba]=o.useOptimistic(m),S=d||q!==m,w=n&&!!R,P=Aa({placement:"above",focusTrigger:"always",isEnabled:w}),{statusIcon:O,describedBy:xa}=Ka({status:t,statusVariant:C}),ya=[i?Y:null,C!=="tooltip"&&(t!=null&&t.message)?X:null,xa,s!=null?ee:null,w?P.describedBy:null].filter(Boolean).join(" ")||void 0,Ia=o.useCallback(h=>{if(s==null)return;const x=h>s?"over":h>=s*Qa?"near":"under";x!==le.current&&(le.current=x,x==="over"?_(H("@astryx.textArea.charactersOverLimit",{count:h-s}),"assertive"):x==="near"&&_(H("@astryx.textArea.charactersRemaining",{count:s-h})))},[_,H,s]),ka=h=>{if(n||k)return;const x=h.target.value;s!=null&&Ia(ie(x)),u==null||u(x,h),f&&!h.defaultPrevented&&fa(async()=>{ba(x),await f(x,h)})},U=o.useMemo(()=>s!=null?ie(q):0,[s,q]),va=n||S,{onClick:ga,onMouseUp:Ba}=Ma({containerRef:te,inputRef:ae,disabled:va});return e.jsxs(Ha,{...ma,label:l,isLabelHidden:a,description:i,inputID:Q,descriptionID:i?Y:void 0,isOptional:r,isRequired:c,isDisabled:n,status:t?{type:t.type,message:t.message,messageID:t.message?X:void 0}:void 0,statusVariant:C,labelTooltip:M,width:ea,children:[e.jsxs("div",{ref:h=>{te.current=h,P.ref(h)},onClick:ga,onMouseUp:Ba,...G(J("text-area",{size:Z,status:(t==null?void 0:t.type)??null,disabled:n?"disabled":null,readonly:k?"readonly":null}),se(ne.base,v.wrapper,n&&ne.disabled,t&&Ga[t.type],t&&!n&&Pa[t.type],t&&_a[t.type],ra),sa,oa),children:[F&&e.jsx("span",{className:"x10l6tqk xctzyg x1kiyvbf x47corl x78zum5",children:Ea(F,{size:"sm",color:"secondary"})}),e.jsx("textarea",{...ua,ref:Va(ia,ae),id:Q,name:n?void 0:L,value:q,onChange:ka,onPaste:$,onFocus:Ye,onBlur:Xe,placeholder:I,rows:b,disabled:n&&!w,"aria-disabled":w?"true":void 0,readOnly:k||w||void 0,spellCheck:K,autoFocus:j,"data-autofocus":j||void 0,"aria-describedby":[da,ya].filter(Boolean).join(" ")||void 0,"aria-required":pa?"true":void 0,"aria-invalid":(t==null?void 0:t.type)==="error"||s!=null&&U>s?"true":void 0,"aria-busy":S||void 0,...G(J("text-area-control"),se(v.textarea,Ya[Z],n&&v.textareaDisabled,!!F&&v.textareaWithStartIcon,(S||O!=null)&&v.textareaWithStatus,S&&O!=null&&v.textareaWithBusyStatus,s!=null&&v.textareaWithCounter))}),(S||O)&&e.jsxs("span",{className:"x10l6tqk xctzyg x13oyzgk x47corl x78zum5 x6s0dn4 x1txdalj",children:[S&&e.jsx(Wa,{size:"sm"}),O]}),s!=null&&e.jsxs("div",{id:ee,...G(J("text-area-counter"),{0:{className:"x10l6tqk x112dmjn x13oyzgk x47corl x78zum5 x6s0dn4 xzye2dw x9ynric x141an7d x1ltkj2j xv1l7n4"},1:{className:"x10l6tqk x112dmjn x13oyzgk x47corl x78zum5 x6s0dn4 xzye2dw x9ynric x141an7d x1ltkj2j xjt36v0"}}[(U>s)<<0]),children:[U>s&&e.jsx(Na,{icon:"warning",size:"sm"}),U,"/",s]})]}),w&&P.renderTooltip(R)]})}Qe.displayName="TextArea";function Xa({value:l,defaultValue:a,onChange:i,status:r,disabled:c,...u}){let{required:f,field:d,width:m}=La({status:r,disabled:c,ariaRequired:u["aria-required"],ariaLabel:u["aria-label"],sizing:"TextArea",width:u.width}),[I,b]=qa(l,a,i,""),n={...u,...d,statusVariant:"detached",width:m,value:I,onChange:b};return e.jsx(Oa,{required:f,children:e.jsx(Qe,{...n})})}const Ot={title:"Components/BAIBulkEditFormItem",component:B,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:`
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
        `}}},argTypes:{showClear:{control:{type:"boolean"},description:"Whether this field can be cleared (shows Clear link)",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},keepValueLabel:{control:{type:"text"},description:'Label displayed in the keep mode placeholder. Defaults to i18n "Keep as is".',table:{type:{summary:"string"},defaultValue:{summary:'"Keep as is"'}}},clearValueLabel:{control:{type:"text"},description:'Label displayed in the clear mode placeholder. Defaults to i18n "Clear".',table:{type:{summary:"string"},defaultValue:{summary:'"Clear"'}}},label:{control:{type:"text"},description:"Label text for the form item",table:{type:{summary:"ReactNode"}}},name:{control:!1,description:"Field name in form data",table:{type:{summary:"NamePath"}}},children:{control:!1,description:"Input component to render (typically Select, Input, etc.)"}},decorators:[l=>e.jsx(g,{style:{maxWidth:600,padding:24,border:"1px solid #d9d9d9",borderRadius:8},children:e.jsx(l,{})})]},A={name:"Basic",parameters:{docs:{description:{story:'Basic usage with a required text input field. The field starts in "Keep as is" mode. Click the placeholder to switch to edit mode.'}}},args:{name:"nickname",label:"Nickname",children:e.jsx(Ja,{"aria-label":"Nickname",placeholder:"Enter nickname"})}},E={name:"OptionalField",parameters:{docs:{description:{story:'Optional field that can be cleared. The Clear link appears in "Keep as is" mode to allow unsetting the value.'}}},args:{name:"domain_name",label:"Domain",showClear:!0,children:e.jsx(y,{placeholder:"Select domain",options:[{value:"default",label:"Default"},{value:"custom",label:"Custom"},{value:"test",label:"Test"}]})}},V={name:"WithSelect",parameters:{docs:{description:{story:"Using BAIBulkEditFormItem with a Select component for choosing from predefined options."}}},args:{name:"status",label:"User Status",children:e.jsx(y,{placeholder:"Select status",options:[{value:"active",label:"Active"},{value:"inactive",label:"Inactive"},{value:"deleted",label:"Deleted"}]})}},W={name:"WithInputNumber",parameters:{docs:{description:{story:"Using BAIBulkEditFormItem with InputNumber for numeric values."}}},args:{name:"container_uid",label:"Container UID",showClear:!0,children:e.jsx(Ra,{hasClear:!1,"aria-label":"Container UID",placeholder:"Enter UID"})}},N={name:"WithCustomClearLabel",parameters:{docs:{description:{story:'Example with custom clearValueLabel. When clearing this field, "No domain selected" will be displayed instead of default "Clear".'}}},args:{name:"domain",label:"Domain",showClear:!0,clearValueLabel:"No domain selected",children:e.jsx(y,{placeholder:"Select domain",options:[{value:"default",label:"Default"},{value:"custom",label:"Custom"}]})}},D={name:"WithCustomKeepLabel",parameters:{docs:{description:{story:'Example with custom keepValueLabel. The keep mode placeholder will display "No changes to this field" instead of default "Keep as is".'}}},args:{name:"status",label:"Status",keepValueLabel:"No changes to this field",children:e.jsx(y,{placeholder:"Select status",options:[{value:"active",label:"Active"},{value:"inactive",label:"Inactive"}]})}},T={name:"MultipleFields",parameters:{docs:{description:{story:"Example showing multiple BAIBulkEditFormItem fields in a single form with different configurations."}}},render:()=>e.jsxs(e.Fragment,{children:[e.jsx(B,{name:"domain",label:"Domain",showClear:!0,children:e.jsx(y,{placeholder:"Select domain",options:[{value:"default",label:"Default"},{value:"custom",label:"Custom"}]})}),e.jsx(B,{name:"status",label:"Status",children:e.jsx(y,{placeholder:"Select status",options:[{value:"active",label:"Active"},{value:"inactive",label:"Inactive"}]})}),e.jsx(B,{name:"notes",label:"Notes",showClear:!0,children:e.jsx(Xa,{"aria-label":"Notes",rows:3,placeholder:"Add notes"})})]})},z={name:"WithFormValues",parameters:{docs:{description:{story:"Interactive example that shows the current form values. Try switching between Keep as is, Edit, and Clear modes to see how values change."}}},decorators:[l=>{const[a]=g.useForm(),[i,r]=o.useState({});return e.jsxs(g,{form:a,style:{maxWidth:600,padding:24,border:"1px solid #d9d9d9",borderRadius:8},onValuesChange:(c,u)=>r(u),children:[e.jsx(l,{}),e.jsxs(za,{direction:"column",gap:"sm",style:{marginTop:16},children:[e.jsx(Ta,{type:"primary",onClick:()=>{const c=a.getFieldsValue();r(c)},children:"Get Form Values"}),e.jsx("pre",{style:{background:"#f5f5f5",padding:12,borderRadius:4,fontSize:12},children:JSON.stringify(i,null,2)})]})]})}],render:()=>e.jsxs(e.Fragment,{children:[e.jsx(B,{name:"domain",label:"Domain",showClear:!0,children:e.jsx(y,{placeholder:"Select domain",options:[{value:"default",label:"Default"},{value:"custom",label:"Custom"}]})}),e.jsx(B,{name:"status",label:"Status",children:e.jsx(y,{placeholder:"Select status",options:[{value:"active",label:"Active"},{value:"inactive",label:"Inactive"}]})})]})};var de,ce,ue,me,pe;A.parameters={...A.parameters,docs:{...(de=A.parameters)==null?void 0:de.docs,source:{originalSource:`{
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
    children: <TextInput aria-label="Nickname" placeholder="Enter nickname" />
  }
}`,...(ue=(ce=A.parameters)==null?void 0:ce.docs)==null?void 0:ue.source},description:{story:`Basic usage with a required field.
No Clear link is shown since the field is not optional.`,...(pe=(me=A.parameters)==null?void 0:me.docs)==null?void 0:pe.description}}};var he,fe,be,xe,ye;E.parameters={...E.parameters,docs:{...(he=E.parameters)==null?void 0:he.docs,source:{originalSource:`{
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
}`,...(be=(fe=E.parameters)==null?void 0:fe.docs)==null?void 0:be.source},description:{story:`Optional field that can be cleared.
Shows the Clear link in "Keep as is" mode.`,...(ye=(xe=E.parameters)==null?void 0:xe.docs)==null?void 0:ye.description}}};var Ie,ke,ve,ge,Be;V.parameters={...V.parameters,docs:{...(Ie=V.parameters)==null?void 0:Ie.docs,source:{originalSource:`{
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
}`,...(ve=(ke=V.parameters)==null?void 0:ke.docs)==null?void 0:ve.source},description:{story:"Select input with options.",...(Be=(ge=V.parameters)==null?void 0:ge.docs)==null?void 0:Be.description}}};var Se,we,Ce,Fe,je;W.parameters={...W.parameters,docs:{...(Se=W.parameters)==null?void 0:Se.docs,source:{originalSource:`{
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
    children: <NumberInput hasClear={false} aria-label="Container UID" placeholder="Enter UID" />
  }
}`,...(Ce=(we=W.parameters)==null?void 0:we.docs)==null?void 0:Ce.source},description:{story:"Number input field.",...(je=(Fe=W.parameters)==null?void 0:Fe.docs)==null?void 0:je.description}}};var Ae,Ee,Ve,We,Ne;N.parameters={...N.parameters,docs:{...(Ae=N.parameters)==null?void 0:Ae.docs,source:{originalSource:`{
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
}`,...(Ve=(Ee=N.parameters)==null?void 0:Ee.docs)==null?void 0:Ve.source},description:{story:`Custom clearValueLabel example.
Shows how to customize the label displayed when field is cleared.`,...(Ne=(We=N.parameters)==null?void 0:We.docs)==null?void 0:Ne.description}}};var De,Te,ze,Re,Le;D.parameters={...D.parameters,docs:{...(De=D.parameters)==null?void 0:De.docs,source:{originalSource:`{
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
}`,...(ze=(Te=D.parameters)==null?void 0:Te.docs)==null?void 0:ze.source},description:{story:`Custom keepValueLabel example.
Shows how to customize the label displayed in keep mode.`,...(Le=(Re=D.parameters)==null?void 0:Re.docs)==null?void 0:Le.description}}};var qe,Oe,Ue,Me,Ke;T.parameters={...T.parameters,docs:{...(qe=T.parameters)==null?void 0:qe.docs,source:{originalSource:`{
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
        <TextArea aria-label="Notes" rows={3} placeholder="Add notes" />
      </BAIBulkEditFormItem>
    </>
}`,...(Ue=(Oe=T.parameters)==null?void 0:Oe.docs)==null?void 0:Ue.source},description:{story:"Multiple fields in a form demonstrating different configurations.",...(Ke=(Me=T.parameters)==null?void 0:Me.docs)==null?void 0:Ke.description}}};var $e,He,_e,Pe,Ge;z.parameters={...z.parameters,docs:{...($e=z.parameters)==null?void 0:$e.docs,source:{originalSource:`{
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
}`,...(_e=(He=z.parameters)==null?void 0:He.docs)==null?void 0:_e.source},description:{story:"Interactive example showing form values.",...(Ge=(Pe=z.parameters)==null?void 0:Pe.docs)==null?void 0:Ge.description}}};const Ut=["Default","OptionalField","WithSelect","WithInputNumber","WithCustomClearLabel","WithCustomKeepLabel","MultipleFields","WithFormValues"];export{A as Default,T as MultipleFields,E as OptionalField,N as WithCustomClearLabel,D as WithCustomKeepLabel,z as WithFormValues,W as WithInputNumber,V as WithSelect,Ut as __namedExportsOrder,Ot as default};
