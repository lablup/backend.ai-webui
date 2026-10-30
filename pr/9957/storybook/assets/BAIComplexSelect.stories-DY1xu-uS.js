import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-DlPsW1c0.js";import{t as n}from"./jsx-runtime-MKhVqBIO.js";import{n as r,t as i}from"./BAIComplexSelect-B5LbhohH.js";var a,o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D;function O(){return(O=e((()=>{r(),a=t(),o=n(),y={title:`Select/BAIComplexSelect`,component:i,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:'\n**BAIComplexSelect** is the BUI adapter over ui-common\'s `PagedSelector` (search box, listbox, keyboard/ARIA, scroll container, footer). It keeps the antd-shaped props the Relay wrappers use and a `labelInValue` value (`{ label, value }`, an array in `multiple` mode).\n\n- One DOM row per loaded option; the pagination window (10–20 rows) keeps that bounded.\n- `label` is a plain string. Rich per-row content goes in `labelContent`/`description`/`extra`.\n- Trigger chips (multiple mode, `triggerDisplay="badges"`) are display-only. Deselect by clicking the option row again.\n\n## Relay wiring\nServer-paginated consumers pass `endReached` (-> Relay `loadNext`), `isLoadingNext`, `total`, and toggle `onOpenChange` to flip `fetchPolicy` between `network-only`/`store-only`. See `BAIUserSelect` for the full pattern.\n        '}}},argTypes:{value:{control:!1},onChange:{control:!1,action:`changed`},options:{control:!1},multiple:{control:{type:`boolean`},description:`Array-valued (labelInValue[]) selection`},hasSearch:{control:{type:`boolean`},description:`Show the search box above the listbox`},isLoading:{control:{type:`boolean`}},isDisabled:{control:{type:`boolean`}},isRequired:{control:{type:`boolean`}},size:{control:{type:`select`},options:[`sm`,`md`,`lg`]}}},b=[{value:`alice`,label:`alice@example.com`,description:`Alice Kim`},{value:`bob`,label:`bob@example.com`,description:`Bob Lee`},{value:`carol`,label:`carol@example.com`,description:`Carol Park`},{value:`dave`,label:`dave@example.com`,description:`Dave Choi`},{value:`eve`,label:`eve@example.com`,description:`Eve Jung`},{value:`frank`,label:`frank@example.com`,description:`Frank Han`}],x={name:`Single Select`,parameters:{docs:{description:{story:`Single-selection, labelInValue-shaped value.`}}},render:e=>{let[t,n]=(0,a.useState)(null);return(0,o.jsx)(i,{...e,options:b,value:t,onChange:n})},args:{label:`Owner`,placeholder:`Select an owner`}},S={name:`Multiple Select`,parameters:{docs:{description:{story:`Array-valued selection. Trigger chips are display-only (P26-4) — deselect by clicking the option row again, not by an "x" on the chip.`}}},render:e=>{let[t,n]=(0,a.useState)([b[0],b[2]]);return(0,o.jsx)(i,{...e,options:b,value:t,onChange:n})},args:{label:`Reviewers`,multiple:!0,placeholder:`Select reviewers`}},C={name:`Preselected Value`,parameters:{docs:{description:{story:`Renders with an initial single-selection value.`}}},render:e=>{let[t,n]=(0,a.useState)(b[1]);return(0,o.jsx)(i,{...e,options:b,value:t,onChange:n})},args:{label:`Owner`}},w={name:`Loading State`,parameters:{docs:{description:{story:"`isLoading` shows a spinner on the trigger."}}},args:{label:`Owner`,options:b,isLoading:!0}},T={name:`Empty Options`,parameters:{docs:{description:{story:`No options loaded — shows the shared "No results" text.`}}},args:{label:`Owner`,options:[]}},E={args:{label:`Owner`,options:b,value:b[0],isDisabled:!0}},x.parameters={...x.parameters,docs:{...(s=x.parameters)==null?void 0:s.docs,source:{originalSource:`{
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
}`,...(c=x.parameters)==null||(c=c.docs)==null?void 0:c.source}}},S.parameters={...S.parameters,docs:{...(l=S.parameters)==null?void 0:l.docs,source:{originalSource:`{
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
}`,...(u=S.parameters)==null||(u=u.docs)==null?void 0:u.source}}},C.parameters={...C.parameters,docs:{...(d=C.parameters)==null?void 0:d.docs,source:{originalSource:`{
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
}`,...(f=C.parameters)==null||(f=f.docs)==null?void 0:f.source}}},w.parameters={...w.parameters,docs:{...(p=w.parameters)==null?void 0:p.docs,source:{originalSource:`{
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
}`,...(m=w.parameters)==null||(m=m.docs)==null?void 0:m.source}}},T.parameters={...T.parameters,docs:{...(h=T.parameters)==null?void 0:h.docs,source:{originalSource:`{
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
}`,...(g=T.parameters)==null||(g=g.docs)==null?void 0:g.source}}},E.parameters={...E.parameters,docs:{...(_=E.parameters)==null?void 0:_.docs,source:{originalSource:`{
  args: {
    label: 'Owner',
    options: sampleOptions,
    value: sampleOptions[0],
    isDisabled: true
  }
}`,...(v=E.parameters)==null||(v=v.docs)==null?void 0:v.source}}},D=[`Default`,`Multiple`,`WithPreselectedValue`,`Loading`,`Empty`,`Disabled`]})))()}O();export{x as Default,E as Disabled,T as Empty,w as Loading,S as Multiple,C as WithPreselectedValue,D as __namedExportsOrder,y as default};