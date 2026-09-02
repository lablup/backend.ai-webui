import{r as m,j as d}from"./iframe-DCbcPccJ.js";import{B as c}from"./BAIComplexSelect-CPFF5CnS.js";import"./preload-helper-Dp1pzeXC.js";import"./useIndicator-DAIZkBwD.js";import"./isRenderable-BUV0eL6r.js";import"./clamp-H7b1OTE9.js";import"./_baseClamp-DVUOCJN_.js";import"./toFinite-DtNyxHvi.js";import"./_trimmedEndIndex-DuQxD0U0.js";import"./isSymbol-BvQAQC2w.js";import"./filter-BjLxsPkC.js";import"./_baseEach-CdD_Rlgf.js";import"./get-CInzxebJ.js";import"./_baseGet--EnWctbV.js";import"./toString-Ct7_6GWb.js";import"./identity-DKeuBCMA.js";import"./_baseSlice-F8doVSIJ.js";import"./toInteger-BbNWddfR.js";import"./map-COopBuqa.js";import"./usePopover-DdulbSIJ.js";import"./useDevWarning-DEqJzGHy.js";import"./rtlStyles-T4i24HtE.js";import"./useResolvedRequired-C9yFdNN4.js";import"./composeEventHandlers-BolWE7qY.js";import"./InputClearButton-GVIGQXwL.js";import"./Divider-VZDxcSxF.js";import"./isNumber-DvYB0QMG.js";import"./compact-CU4PNV0P.js";import"./some-Yyyl8IcA.js";import"./Token-4hWrvPin.js";import"./SelectorOption-CgQo1I0z.js";import"./Item-Ch6HHfiX.js";const pe={title:"Select/BAIComplexSelect",component:c,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:"\n**BAIComplexSelect** re-implements the popup body of Astryx's `ComplexSelector` (search input, listbox, keyboard/ARIA, scroll container, footer) so infinite-scroll/server-search selects can be built on it.\n\n## Dropped vs antd `Select` (ticket 26 PILOT-DECISIONs — simplicity policy)\n- **Virtualization is deferred.** One DOM row per loaded option; bounded by the pagination window (10–20 rows).\n- **`label` is a plain string**, not a ReactNode. Rich per-row content goes in `description`/`extra`.\n- **Trigger chips (multiple mode) are display-only** — no per-chip remove button (`ComplexSelector` renders the trigger label inside its own `<button>`, so a removable chip would nest a button in a button). Deselect by clicking the option row again.\n- No `allowClear`, controlled `open`, or imperative `ref.focus()`.\n\n## Relay wiring\nServer-paginated consumers pass `endReached` (-> Relay `loadNext`), `isLoadingNext`, `total`, and toggle `onOpenChange` to flip `fetchPolicy` between `network-only`/`store-only`. See `BAIUserSelect` for the full pattern.\n        "}}},argTypes:{value:{control:!1},onChange:{control:!1,action:"changed"},options:{control:!1},multiple:{control:{type:"boolean"},description:"Array-valued (labelInValue[]) selection"},hasSearch:{control:{type:"boolean"},description:"Show the search TextInput above the listbox"},isLoading:{control:{type:"boolean"}},isDisabled:{control:{type:"boolean"}},isRequired:{control:{type:"boolean"}},size:{control:{type:"select"},options:["sm","md","lg"]}}},e=[{value:"alice",label:"alice@example.com",description:"Alice Kim"},{value:"bob",label:"bob@example.com",description:"Bob Lee"},{value:"carol",label:"carol@example.com",description:"Carol Park"},{value:"dave",label:"dave@example.com",description:"Dave Choi"},{value:"eve",label:"eve@example.com",description:"Eve Jung"},{value:"frank",label:"frank@example.com",description:"Frank Han"}],a={name:"Single Select",parameters:{docs:{description:{story:"Single-selection, labelInValue-shaped value."}}},render:o=>{const[t,r]=m.useState(null);return d.jsx(c,{...o,options:e,value:t,onChange:r})},args:{label:"Owner",placeholder:"Select an owner"}},s={name:"Multiple Select",parameters:{docs:{description:{story:'Array-valued selection. Trigger chips are display-only (P26-4) — deselect by clicking the option row again, not by an "x" on the chip.'}}},render:o=>{const[t,r]=m.useState([e[0],e[2]]);return d.jsx(c,{...o,options:e,value:t,onChange:r})},args:{label:"Reviewers",multiple:!0,placeholder:"Select reviewers"}},n={name:"Preselected Value",parameters:{docs:{description:{story:"Renders with an initial single-selection value."}}},render:o=>{const[t,r]=m.useState(e[1]);return d.jsx(c,{...o,options:e,value:t,onChange:r})},args:{label:"Owner"}},l={name:"Loading State",parameters:{docs:{description:{story:"`isLoading` shows a spinner on the trigger."}}},args:{label:"Owner",options:e,isLoading:!0}},i={name:"Empty Options",parameters:{docs:{description:{story:'No options loaded — shows the shared "No results" text.'}}},args:{label:"Owner",options:[]}},p={args:{label:"Owner",options:e,value:e[0],isDisabled:!0}};var u,g,b;a.parameters={...a.parameters,docs:{...(u=a.parameters)==null?void 0:u.docs,source:{originalSource:`{
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
}`,...(b=(g=a.parameters)==null?void 0:g.docs)==null?void 0:b.source}}};var h,y,v;s.parameters={...s.parameters,docs:{...(h=s.parameters)==null?void 0:h.docs,source:{originalSource:`{
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
}`,...(x=(w=n.parameters)==null?void 0:w.docs)==null?void 0:x.source}}};var O,C,f;l.parameters={...l.parameters,docs:{...(O=l.parameters)==null?void 0:O.docs,source:{originalSource:`{
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
}`,...(f=(C=l.parameters)==null?void 0:C.docs)==null?void 0:f.source}}};var V,I,A;i.parameters={...i.parameters,docs:{...(V=i.parameters)==null?void 0:V.docs,source:{originalSource:`{
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
}`,...(A=(I=i.parameters)==null?void 0:I.docs)==null?void 0:A.source}}};var B,D,L;p.parameters={...p.parameters,docs:{...(B=p.parameters)==null?void 0:B.docs,source:{originalSource:`{
  args: {
    label: 'Owner',
    options: sampleOptions,
    value: sampleOptions[0],
    isDisabled: true
  }
}`,...(L=(D=p.parameters)==null?void 0:D.docs)==null?void 0:L.source}}};const ce=["Default","Multiple","WithPreselectedValue","Loading","Empty","Disabled"];export{a as Default,p as Disabled,i as Empty,l as Loading,s as Multiple,n as WithPreselectedValue,ce as __namedExportsOrder,pe as default};
