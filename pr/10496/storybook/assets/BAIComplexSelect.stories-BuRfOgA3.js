import{r as u,j as m}from"./iframe-D0Qr9PiQ.js";import{B as l}from"./BAIComplexSelect-C2yM5H4G.js";import"./preload-helper-Dp1pzeXC.js";import"./compiled-D_YGP6zo.js";import"./useDevWarning-ZB9Idjhi.js";import"./usePopover-D1u6DAU6.js";import"./rtlStyles-T4i24HtE.js";import"./composeEventHandlers-BolWE7qY.js";import"./InputClearButton-CHRgB-_E.js";import"./inputStyles.stylex-Bztz6H8O.js";import"./Field-BjR0fxtN.js";import"./FieldStatus-DU6sVqsC.js";import"./FormLayoutContext-BFw5LHb4.js";import"./useIsHydrating-BikO_3qN.js";import"./optionDisabledReason2-CyT8EqJR.js";import"./IconWithTooltip2-DTJ47IdM.js";import"./circle-alert-DSyk59XH.js";import"./useIndicator-B6Wdt3RW.js";import"./Token-D9YZW4Dz.js";import"./disabledInteraction-DXT2YV-5.js";import"./Divider-BO6GJpjS.js";import"./SelectorOption-h7zdaOOj.js";import"./Item-D4owH8L7.js";import"./computeTargetAndRel-BGwjeA1c.js";const se={title:"Select/BAIComplexSelect",component:l,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:'\n**BAIComplexSelect** is the BUI adapter over ui-common\'s `PagedSelector` (search box, listbox, keyboard/ARIA, scroll container, footer). It keeps the antd-shaped props the Relay wrappers use and a `labelInValue` value (`{ label, value }`, an array in `multiple` mode).\n\n- One DOM row per loaded option; the pagination window (10–20 rows) keeps that bounded.\n- `label` is a plain string. Rich per-row content goes in `labelContent`/`description`/`extra`.\n- Trigger chips (multiple mode, `triggerDisplay="badges"`) are display-only. Deselect by clicking the option row again.\n\n## Relay wiring\nServer-paginated consumers pass `endReached` (-> Relay `loadNext`), `isLoadingNext`, `total`, and toggle `onOpenChange` to flip `fetchPolicy` between `network-only`/`store-only`. See `BAIUserSelect` for the full pattern.\n        '}}},argTypes:{value:{control:!1},onChange:{control:!1,action:"changed"},options:{control:!1},multiple:{control:{type:"boolean"},description:"Array-valued (labelInValue[]) selection"},hasSearch:{control:{type:"boolean"},description:"Show the search box above the listbox"},isLoading:{control:{type:"boolean"}},isDisabled:{control:{type:"boolean"}},isRequired:{control:{type:"boolean"}},size:{control:{type:"select"},options:["sm","md","lg"]}}},e=[{value:"alice",label:"alice@example.com",description:"Alice Kim"},{value:"bob",label:"bob@example.com",description:"Bob Lee"},{value:"carol",label:"carol@example.com",description:"Carol Park"},{value:"dave",label:"dave@example.com",description:"Dave Choi"},{value:"eve",label:"eve@example.com",description:"Eve Jung"},{value:"frank",label:"frank@example.com",description:"Frank Han"}],n={name:"Single Select",parameters:{docs:{description:{story:"Single-selection, labelInValue-shaped value."}}},render:a=>{const[o,t]=u.useState(null);return m.jsx(l,{...a,options:e,value:o,onChange:t})},args:{label:"Owner",placeholder:"Select an owner"}},s={name:"Multiple Select",parameters:{docs:{description:{story:'Array-valued selection. Trigger chips are display-only (P26-4) — deselect by clicking the option row again, not by an "x" on the chip.'}}},render:a=>{const[o,t]=u.useState([e[0],e[2]]);return m.jsx(l,{...a,options:e,value:o,onChange:t})},args:{label:"Reviewers",multiple:!0,placeholder:"Select reviewers"}},r={name:"Preselected Value",parameters:{docs:{description:{story:"Renders with an initial single-selection value."}}},render:a=>{const[o,t]=u.useState(e[1]);return m.jsx(l,{...a,options:e,value:o,onChange:t})},args:{label:"Owner"}},i={name:"Loading State",parameters:{docs:{description:{story:"`isLoading` shows a spinner on the trigger."}}},args:{label:"Owner",options:e,isLoading:!0}},p={name:"Empty Options",parameters:{docs:{description:{story:'No options loaded — shows the shared "No results" text.'}}},args:{label:"Owner",options:[]}},c={args:{label:"Owner",options:e,value:e[0],isDisabled:!0}},g={reason:"You don't have permission to mount this folder."},d={name:"Disabled Option With Reason",parameters:{docs:{description:{story:"`disabled: { reason }` dims the option and puts a glyph at its end whose tooltip says why; a bare `true` disables it silently."}}},render:a=>{const[o,t]=u.useState([]);return m.jsx(l,{...a,multiple:!0,selectionMark:"checkbox",options:[{value:"datasets",label:"datasets",description:"general · local:volume1"},{value:"shared-models",label:"shared-models",description:"model · local:volume1",disabled:g},{value:"notebooks",label:"notebooks",description:"general · local:volume2"},{value:"team-logs",label:"team-logs",description:"general · local:volume2",disabled:g},{value:"checkpoints",label:"checkpoints",description:"general · local:volume1",disabled:g},{value:"archive",label:"archive",description:"general · local:volume2",disabled:!0}],value:o,onChange:t})},args:{label:"Folders",placeholder:"Select Folder",width:360}};var b,h,v;n.parameters={...n.parameters,docs:{...(b=n.parameters)==null?void 0:b.docs,source:{originalSource:`{
  name: 'Single Select',
  parameters: {
    docs: {
      description: {
        story: 'Single-selection, labelInValue-shaped value.'
      }
    }
  },
  render: args => {
    const [value, setValue] = useState<BAIComplexSelectValue>(null);
    return <BAIComplexSelect {...args} options={sampleOptions} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Owner',
    placeholder: 'Select an owner'
  }
}`,...(v=(h=n.parameters)==null?void 0:h.docs)==null?void 0:v.source}}};var y,S,w;s.parameters={...s.parameters,docs:{...(y=s.parameters)==null?void 0:y.docs,source:{originalSource:`{
  name: 'Multiple Select',
  parameters: {
    docs: {
      description: {
        story: 'Array-valued selection. Trigger chips are display-only (P26-4) — deselect by clicking the option row again, not by an "x" on the chip.'
      }
    }
  },
  render: args => {
    const [value, setValue] = useState<BAIComplexSelectValue>([sampleOptions[0], sampleOptions[2]]);
    return <BAIComplexSelect {...args} options={sampleOptions} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Reviewers',
    multiple: true,
    placeholder: 'Select reviewers'
  }
}`,...(w=(S=s.parameters)==null?void 0:S.docs)==null?void 0:w.source}}};var x,O,C;r.parameters={...r.parameters,docs:{...(x=r.parameters)==null?void 0:x.docs,source:{originalSource:`{
  name: 'Preselected Value',
  parameters: {
    docs: {
      description: {
        story: 'Renders with an initial single-selection value.'
      }
    }
  },
  render: args => {
    const [value, setValue] = useState<BAIComplexSelectValue>(sampleOptions[1]);
    return <BAIComplexSelect {...args} options={sampleOptions} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Owner'
  }
}`,...(C=(O=r.parameters)==null?void 0:O.docs)==null?void 0:C.source}}};var V,k,I;i.parameters={...i.parameters,docs:{...(V=i.parameters)==null?void 0:V.docs,source:{originalSource:`{
  name: 'Loading State',
  parameters: {
    docs: {
      description: {
        story: '\`isLoading\` shows a spinner on the trigger.'
      }
    }
  },
  args: {
    label: 'Owner',
    options: sampleOptions,
    isLoading: true
  }
}`,...(I=(k=i.parameters)==null?void 0:k.docs)==null?void 0:I.source}}};var A,f,R;p.parameters={...p.parameters,docs:{...(A=p.parameters)==null?void 0:A.docs,source:{originalSource:`{
  name: 'Empty Options',
  parameters: {
    docs: {
      description: {
        story: 'No options loaded — shows the shared "No results" text.'
      }
    }
  },
  args: {
    label: 'Owner',
    options: []
  }
}`,...(R=(f=p.parameters)==null?void 0:f.docs)==null?void 0:R.source}}};var B,D,L;c.parameters={...c.parameters,docs:{...(B=c.parameters)==null?void 0:B.docs,source:{originalSource:`{
  args: {
    label: 'Owner',
    options: sampleOptions,
    value: sampleOptions[0],
    isDisabled: true
  }
}`,...(L=(D=c.parameters)==null?void 0:D.docs)==null?void 0:L.source}}};var M,P,E;d.parameters={...d.parameters,docs:{...(M=d.parameters)==null?void 0:M.docs,source:{originalSource:`{
  name: 'Disabled Option With Reason',
  parameters: {
    docs: {
      description: {
        story: '\`disabled: { reason }\` dims the option and puts a glyph at its end whose tooltip says why; a bare \`true\` disables it silently.'
      }
    }
  },
  render: args => {
    const [value, setValue] = useState<BAIComplexSelectValue>([]);
    return <BAIComplexSelect {...args} multiple selectionMark="checkbox" options={[{
      value: 'datasets',
      label: 'datasets',
      description: 'general · local:volume1'
    }, {
      value: 'shared-models',
      label: 'shared-models',
      description: 'model · local:volume1',
      disabled: noMount
    }, {
      value: 'notebooks',
      label: 'notebooks',
      description: 'general · local:volume2'
    }, {
      value: 'team-logs',
      label: 'team-logs',
      description: 'general · local:volume2',
      disabled: noMount
    }, {
      value: 'checkpoints',
      label: 'checkpoints',
      description: 'general · local:volume1',
      disabled: noMount
    }, {
      value: 'archive',
      label: 'archive',
      description: 'general · local:volume2',
      disabled: true
    }]} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Folders',
    placeholder: 'Select Folder',
    width: 360
  }
}`,...(E=(P=d.parameters)==null?void 0:P.docs)==null?void 0:E.source}}};const re=["Default","Multiple","WithPreselectedValue","Loading","Empty","Disabled","DisabledOptionReason"];export{n as Default,c as Disabled,d as DisabledOptionReason,p as Empty,i as Loading,s as Multiple,r as WithPreselectedValue,re as __namedExportsOrder,se as default};
