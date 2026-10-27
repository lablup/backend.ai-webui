import{n as e}from"./rolldown-runtime-2s6bX4vc.js";import{n as t,t as n}from"./BAIComplexSelect-D5bBzCyR.js";import{useState as r}from"react";import{jsx as i}from"react/jsx-runtime";var a,o,s,c,l,u,d,f,p;function m(){return(m=e((()=>{t(),a={title:`Select/BAIComplexSelect`,component:n,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:'\n**BAIComplexSelect** is the BUI adapter over ui-common\'s `PagedSelector` (search box, listbox, keyboard/ARIA, scroll container, footer). It keeps the antd-shaped props the Relay wrappers use and a `labelInValue` value (`{ label, value }`, an array in `multiple` mode).\n\n- One DOM row per loaded option; the pagination window (10–20 rows) keeps that bounded.\n- `label` is a plain string. Rich per-row content goes in `labelContent`/`description`/`extra`.\n- Trigger chips (multiple mode, `triggerDisplay="badges"`) are display-only. Deselect by clicking the option row again.\n\n## Relay wiring\nServer-paginated consumers pass `endReached` (-> Relay `loadNext`), `isLoadingNext`, `total`, and toggle `onOpenChange` to flip `fetchPolicy` between `network-only`/`store-only`. See `BAIUserSelect` for the full pattern.\n        '}}},argTypes:{value:{control:!1},onChange:{control:!1,action:`changed`},options:{control:!1},multiple:{control:{type:`boolean`},description:`Array-valued (labelInValue[]) selection`},hasSearch:{control:{type:`boolean`},description:`Show the search box above the listbox`},isLoading:{control:{type:`boolean`}},isDisabled:{control:{type:`boolean`}},isRequired:{control:{type:`boolean`}},size:{control:{type:`select`},options:[`sm`,`md`,`lg`]}}},o=[{value:`alice`,label:`alice@example.com`,description:`Alice Kim`},{value:`bob`,label:`bob@example.com`,description:`Bob Lee`},{value:`carol`,label:`carol@example.com`,description:`Carol Park`},{value:`dave`,label:`dave@example.com`,description:`Dave Choi`},{value:`eve`,label:`eve@example.com`,description:`Eve Jung`},{value:`frank`,label:`frank@example.com`,description:`Frank Han`}],s={name:`Single Select`,parameters:{docs:{description:{story:`Single-selection, labelInValue-shaped value.`}}},render:e=>{let[t,a]=r(null);return i(n,{...e,options:o,value:t,onChange:a})},args:{label:`Owner`,placeholder:`Select an owner`}},c={name:`Multiple Select`,parameters:{docs:{description:{story:`Array-valued selection. Trigger chips are display-only (P26-4) — deselect by clicking the option row again, not by an "x" on the chip.`}}},render:e=>{let[t,a]=r([o[0],o[2]]);return i(n,{...e,options:o,value:t,onChange:a})},args:{label:`Reviewers`,multiple:!0,placeholder:`Select reviewers`}},l={name:`Preselected Value`,parameters:{docs:{description:{story:`Renders with an initial single-selection value.`}}},render:e=>{let[t,a]=r(o[1]);return i(n,{...e,options:o,value:t,onChange:a})},args:{label:`Owner`}},u={name:`Loading State`,parameters:{docs:{description:{story:"`isLoading` shows a spinner on the trigger."}}},args:{label:`Owner`,options:o,isLoading:!0}},d={name:`Empty Options`,parameters:{docs:{description:{story:`No options loaded — shows the shared "No results" text.`}}},args:{label:`Owner`,options:[]}},f={args:{label:`Owner`,options:o,value:o[0],isDisabled:!0}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
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
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
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
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
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
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
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
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
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
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Owner',
    options: sampleOptions,
    value: sampleOptions[0],
    isDisabled: true
  }
}`,...f.parameters?.docs?.source}}},p=[`Default`,`Multiple`,`WithPreselectedValue`,`Loading`,`Empty`,`Disabled`]})))()}m();export{s as Default,f as Disabled,d as Empty,u as Loading,c as Multiple,l as WithPreselectedValue,p as __namedExportsOrder,a as default};