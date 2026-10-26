import{r as d,j as m}from"./iframe-01fhjPyd.js";import{B as c}from"./BAIComplexSelect-CZUjCuRv.js";import"./preload-helper-Dp1pzeXC.js";import"./compiled-D_YGP6zo.js";import"./usePopover-oc-pe7Ke.js";import"./useDevWarning-D6bwAUJ2.js";import"./rtlStyles-T4i24HtE.js";import"./isRenderable-BUV0eL6r.js";import"./InputClearButton-Be3i_pph.js";import"./FieldStatus-mPBixYqs.js";import"./composeEventHandlers-BolWE7qY.js";import"./useIndicator-empyZRen.js";import"./Token-C9U5TDF7.js";import"./useInteractiveRole-poV3BebU.js";import"./Divider-I4bL0ns_.js";import"./SelectorOption-VS0gB7GD.js";import"./Item-CzE6GDzA.js";import"./computeTargetAndRel-BGwjeA1c.js";const Q={title:"Select/BAIComplexSelect",component:c,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:'\n**BAIComplexSelect** is the BUI adapter over ui-common\'s `PagedSelector` (search box, listbox, keyboard/ARIA, scroll container, footer). It keeps the antd-shaped props the Relay wrappers use and a `labelInValue` value (`{ label, value }`, an array in `multiple` mode).\n\n- One DOM row per loaded option; the pagination window (10–20 rows) keeps that bounded.\n- `label` is a plain string. Rich per-row content goes in `labelContent`/`description`/`extra`.\n- Trigger chips (multiple mode, `triggerDisplay="badges"`) are display-only. Deselect by clicking the option row again.\n\n## Relay wiring\nServer-paginated consumers pass `endReached` (-> Relay `loadNext`), `isLoadingNext`, `total`, and toggle `onOpenChange` to flip `fetchPolicy` between `network-only`/`store-only`. See `BAIUserSelect` for the full pattern.\n        '}}},argTypes:{value:{control:!1},onChange:{control:!1,action:"changed"},options:{control:!1},multiple:{control:{type:"boolean"},description:"Array-valued (labelInValue[]) selection"},hasSearch:{control:{type:"boolean"},description:"Show the search box above the listbox"},isLoading:{control:{type:"boolean"}},isDisabled:{control:{type:"boolean"}},isRequired:{control:{type:"boolean"}},size:{control:{type:"select"},options:["sm","md","lg"]}}},e=[{value:"alice",label:"alice@example.com",description:"Alice Kim"},{value:"bob",label:"bob@example.com",description:"Bob Lee"},{value:"carol",label:"carol@example.com",description:"Carol Park"},{value:"dave",label:"dave@example.com",description:"Dave Choi"},{value:"eve",label:"eve@example.com",description:"Eve Jung"},{value:"frank",label:"frank@example.com",description:"Frank Han"}],r={name:"Single Select",parameters:{docs:{description:{story:"Single-selection, labelInValue-shaped value."}}},render:a=>{const[o,t]=d.useState(null);return m.jsx(c,{...a,options:e,value:o,onChange:t})},args:{label:"Owner",placeholder:"Select an owner"}},s={name:"Multiple Select",parameters:{docs:{description:{story:'Array-valued selection. Trigger chips are display-only (P26-4) — deselect by clicking the option row again, not by an "x" on the chip.'}}},render:a=>{const[o,t]=d.useState([e[0],e[2]]);return m.jsx(c,{...a,options:e,value:o,onChange:t})},args:{label:"Reviewers",multiple:!0,placeholder:"Select reviewers"}},n={name:"Preselected Value",parameters:{docs:{description:{story:"Renders with an initial single-selection value."}}},render:a=>{const[o,t]=d.useState(e[1]);return m.jsx(c,{...a,options:e,value:o,onChange:t})},args:{label:"Owner"}},l={name:"Loading State",parameters:{docs:{description:{story:"`isLoading` shows a spinner on the trigger."}}},args:{label:"Owner",options:e,isLoading:!0}},i={name:"Empty Options",parameters:{docs:{description:{story:'No options loaded — shows the shared "No results" text.'}}},args:{label:"Owner",options:[]}},p={args:{label:"Owner",options:e,value:e[0],isDisabled:!0}};var u,g,h;r.parameters={...r.parameters,docs:{...(u=r.parameters)==null?void 0:u.docs,source:{originalSource:`{
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
}`,...(h=(g=r.parameters)==null?void 0:g.docs)==null?void 0:h.source}}};var b,y,v;s.parameters={...s.parameters,docs:{...(b=s.parameters)==null?void 0:b.docs,source:{originalSource:`{
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
}`,...(v=(y=s.parameters)==null?void 0:y.docs)==null?void 0:v.source}}};var S,w,x;n.parameters={...n.parameters,docs:{...(S=n.parameters)==null?void 0:S.docs,source:{originalSource:`{
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
}`,...(x=(w=n.parameters)==null?void 0:w.docs)==null?void 0:x.source}}};var O,C,V;l.parameters={...l.parameters,docs:{...(O=l.parameters)==null?void 0:O.docs,source:{originalSource:`{
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
}`,...(V=(C=l.parameters)==null?void 0:C.docs)==null?void 0:V.source}}};var I,A,f;i.parameters={...i.parameters,docs:{...(I=i.parameters)==null?void 0:I.docs,source:{originalSource:`{
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
}`,...(f=(A=i.parameters)==null?void 0:A.docs)==null?void 0:f.source}}};var B,R,k;p.parameters={...p.parameters,docs:{...(B=p.parameters)==null?void 0:B.docs,source:{originalSource:`{
  args: {
    label: 'Owner',
    options: sampleOptions,
    value: sampleOptions[0],
    isDisabled: true
  }
}`,...(k=(R=p.parameters)==null?void 0:R.docs)==null?void 0:k.source}}};const X=["Default","Multiple","WithPreselectedValue","Loading","Empty","Disabled"];export{r as Default,p as Disabled,i as Empty,l as Loading,s as Multiple,n as WithPreselectedValue,X as __namedExportsOrder,Q as default};
