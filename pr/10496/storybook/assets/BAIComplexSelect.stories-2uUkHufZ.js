import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-DlPsW1c0.js";import{t as n}from"./jsx-runtime-MKhVqBIO.js";import{n as r,t as i}from"./BAIComplexSelect-CeKT0Ccl.js";var a,o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j;function M(){return(M=e((()=>{r(),a=t(),o=n(),x={title:`Select/BAIComplexSelect`,component:i,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:'\n**BAIComplexSelect** is the BUI adapter over ui-common\'s `PagedSelector` (search box, listbox, keyboard/ARIA, scroll container, footer). It keeps the antd-shaped props the Relay wrappers use and a `labelInValue` value (`{ label, value }`, an array in `multiple` mode).\n\n- One DOM row per loaded option; the pagination window (10–20 rows) keeps that bounded.\n- `label` is a plain string. Rich per-row content goes in `labelContent`/`description`/`extra`.\n- Trigger chips (multiple mode, `triggerDisplay="badges"`) are display-only. Deselect by clicking the option row again.\n\n## Relay wiring\nServer-paginated consumers pass `endReached` (-> Relay `loadNext`), `isLoadingNext`, `total`, and toggle `onOpenChange` to flip `fetchPolicy` between `network-only`/`store-only`. See `BAIUserSelect` for the full pattern.\n        '}}},argTypes:{value:{control:!1},onChange:{control:!1,action:`changed`},options:{control:!1},multiple:{control:{type:`boolean`},description:`Array-valued (labelInValue[]) selection`},hasSearch:{control:{type:`boolean`},description:`Show the search box above the listbox`},isLoading:{control:{type:`boolean`}},isDisabled:{control:{type:`boolean`}},isRequired:{control:{type:`boolean`}},size:{control:{type:`select`},options:[`sm`,`md`,`lg`]}}},S=[{value:`alice`,label:`alice@example.com`,description:`Alice Kim`},{value:`bob`,label:`bob@example.com`,description:`Bob Lee`},{value:`carol`,label:`carol@example.com`,description:`Carol Park`},{value:`dave`,label:`dave@example.com`,description:`Dave Choi`},{value:`eve`,label:`eve@example.com`,description:`Eve Jung`},{value:`frank`,label:`frank@example.com`,description:`Frank Han`}],C={name:`Single Select`,parameters:{docs:{description:{story:`Single-selection, labelInValue-shaped value.`}}},render:e=>{let[t,n]=(0,a.useState)(null);return(0,o.jsx)(i,{...e,options:S,value:t,onChange:n})},args:{label:`Owner`,placeholder:`Select an owner`}},w={name:`Multiple Select`,parameters:{docs:{description:{story:`Array-valued selection. Trigger chips are display-only (P26-4) — deselect by clicking the option row again, not by an "x" on the chip.`}}},render:e=>{let[t,n]=(0,a.useState)([S[0],S[2]]);return(0,o.jsx)(i,{...e,options:S,value:t,onChange:n})},args:{label:`Reviewers`,multiple:!0,placeholder:`Select reviewers`}},T={name:`Preselected Value`,parameters:{docs:{description:{story:`Renders with an initial single-selection value.`}}},render:e=>{let[t,n]=(0,a.useState)(S[1]);return(0,o.jsx)(i,{...e,options:S,value:t,onChange:n})},args:{label:`Owner`}},E={name:`Loading State`,parameters:{docs:{description:{story:"`isLoading` shows a spinner on the trigger."}}},args:{label:`Owner`,options:S,isLoading:!0}},D={name:`Empty Options`,parameters:{docs:{description:{story:`No options loaded — shows the shared "No results" text.`}}},args:{label:`Owner`,options:[]}},O={args:{label:`Owner`,options:S,value:S[0],isDisabled:!0}},k={reason:`You don't have permission to mount this folder.`},A={name:`Disabled Option With Reason`,parameters:{docs:{description:{story:"`disabled: { reason }` dims the option and puts a glyph at its end whose tooltip says why; a bare `true` disables it silently."}}},render:e=>{let[t,n]=(0,a.useState)([]);return(0,o.jsx)(i,{...e,multiple:!0,selectionMark:`checkbox`,options:[{value:`datasets`,label:`datasets`,description:`general · local:volume1`},{value:`shared-models`,label:`shared-models`,description:`model · local:volume1`,disabled:k},{value:`notebooks`,label:`notebooks`,description:`general · local:volume2`},{value:`team-logs`,label:`team-logs`,description:`general · local:volume2`,disabled:k},{value:`checkpoints`,label:`checkpoints`,description:`general · local:volume1`,disabled:k},{value:`archive`,label:`archive`,description:`general · local:volume2`,disabled:!0}],value:t,onChange:n})},args:{label:`Folders`,placeholder:`Select Folder`,width:360}},C.parameters={...C.parameters,docs:{...(s=C.parameters)==null?void 0:s.docs,source:{originalSource:`{
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
}`,...(c=C.parameters)==null||(c=c.docs)==null?void 0:c.source}}},w.parameters={...w.parameters,docs:{...(l=w.parameters)==null?void 0:l.docs,source:{originalSource:`{
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
}`,...(u=w.parameters)==null||(u=u.docs)==null?void 0:u.source}}},T.parameters={...T.parameters,docs:{...(d=T.parameters)==null?void 0:d.docs,source:{originalSource:`{
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
}`,...(f=T.parameters)==null||(f=f.docs)==null?void 0:f.source}}},E.parameters={...E.parameters,docs:{...(p=E.parameters)==null?void 0:p.docs,source:{originalSource:`{
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
}`,...(m=E.parameters)==null||(m=m.docs)==null?void 0:m.source}}},D.parameters={...D.parameters,docs:{...(h=D.parameters)==null?void 0:h.docs,source:{originalSource:`{
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
}`,...(g=D.parameters)==null||(g=g.docs)==null?void 0:g.source}}},O.parameters={...O.parameters,docs:{...(_=O.parameters)==null?void 0:_.docs,source:{originalSource:`{
  args: {
    label: 'Owner',
    options: sampleOptions,
    value: sampleOptions[0],
    isDisabled: true
  }
}`,...(v=O.parameters)==null||(v=v.docs)==null?void 0:v.source}}},A.parameters={...A.parameters,docs:{...(y=A.parameters)==null?void 0:y.docs,source:{originalSource:`{
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
}`,...(b=A.parameters)==null||(b=b.docs)==null?void 0:b.source}}},j=[`Default`,`Multiple`,`WithPreselectedValue`,`Loading`,`Empty`,`Disabled`,`DisabledOptionReason`]})))()}M();export{C as Default,O as Disabled,A as DisabledOptionReason,D as Empty,E as Loading,w as Multiple,T as WithPreselectedValue,j as __namedExportsOrder,x as default};