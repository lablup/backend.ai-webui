import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-D0Ex1IVc.js";import{t as n}from"./jsx-runtime-MKhVqBIO.js";import{n as r,t as i}from"./BAIComplexSelect-DoVaWoY7.js";var a,o,s,c,l,u,d,f,p,m,h;function g(){return(g=e((()=>{r(),a=t(),o=n(),s={title:`Select/BAIComplexSelect`,component:i,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:'\n**BAIComplexSelect** is the BUI adapter over ui-common\'s `PagedSelector` (search box, listbox, keyboard/ARIA, scroll container, footer). It keeps the antd-shaped props the Relay wrappers use and a `labelInValue` value (`{ label, value }`, an array in `multiple` mode).\n\n- One DOM row per loaded option; the pagination window (10–20 rows) keeps that bounded.\n- `label` is a plain string. Rich per-row content goes in `labelContent`/`description`/`extra`.\n- Trigger chips (multiple mode, `triggerDisplay="badges"`) are display-only. Deselect by clicking the option row again.\n\n## Relay wiring\nServer-paginated consumers pass `endReached` (-> Relay `loadNext`), `isLoadingNext`, `total`, and toggle `onOpenChange` to flip `fetchPolicy` between `network-only`/`store-only`. See `BAIUserSelect` for the full pattern.\n        '}}},argTypes:{value:{control:!1},onChange:{control:!1,action:`changed`},options:{control:!1},multiple:{control:{type:`boolean`},description:`Array-valued (labelInValue[]) selection`},hasSearch:{control:{type:`boolean`},description:`Show the search box above the listbox`},isLoading:{control:{type:`boolean`}},isDisabled:{control:{type:`boolean`}},isRequired:{control:{type:`boolean`}},size:{control:{type:`select`},options:[`sm`,`md`,`lg`]}}},c=[{value:`alice`,label:`alice@example.com`,description:`Alice Kim`},{value:`bob`,label:`bob@example.com`,description:`Bob Lee`},{value:`carol`,label:`carol@example.com`,description:`Carol Park`},{value:`dave`,label:`dave@example.com`,description:`Dave Choi`},{value:`eve`,label:`eve@example.com`,description:`Eve Jung`},{value:`frank`,label:`frank@example.com`,description:`Frank Han`}],l={name:`Single Select`,parameters:{docs:{description:{story:`Single-selection, labelInValue-shaped value.`}}},render:e=>{let[t,n]=(0,a.useState)(null);return(0,o.jsx)(i,{...e,options:c,value:t,onChange:n})},args:{label:`Owner`,placeholder:`Select an owner`}},u={name:`Multiple Select`,parameters:{docs:{description:{story:`Array-valued selection. Trigger chips are display-only (P26-4) — deselect by clicking the option row again, not by an "x" on the chip.`}}},render:e=>{let[t,n]=(0,a.useState)([c[0],c[2]]);return(0,o.jsx)(i,{...e,options:c,value:t,onChange:n})},args:{label:`Reviewers`,multiple:!0,placeholder:`Select reviewers`}},d={name:`Preselected Value`,parameters:{docs:{description:{story:`Renders with an initial single-selection value.`}}},render:e=>{let[t,n]=(0,a.useState)(c[1]);return(0,o.jsx)(i,{...e,options:c,value:t,onChange:n})},args:{label:`Owner`}},f={name:`Loading State`,parameters:{docs:{description:{story:"`isLoading` shows a spinner on the trigger."}}},args:{label:`Owner`,options:c,isLoading:!0}},p={name:`Empty Options`,parameters:{docs:{description:{story:`No options loaded — shows the shared "No results" text.`}}},args:{label:`Owner`,options:[]}},m={args:{label:`Owner`,options:c,value:c[0],isDisabled:!0}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
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
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
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
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
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
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
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
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Owner',
    options: sampleOptions,
    value: sampleOptions[0],
    isDisabled: true
  }
}`,...m.parameters?.docs?.source}}},h=[`Default`,`Multiple`,`WithPreselectedValue`,`Loading`,`Empty`,`Disabled`]})))()}g();export{l as Default,m as Disabled,p as Empty,f as Loading,u as Multiple,d as WithPreselectedValue,h as __namedExportsOrder,s as default};