import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-DlPsW1c0.js";import{t as n}from"./jsx-runtime-MKhVqBIO.js";import{h as r,m as i}from"./iframe-D_gWGTAs.js";import{n as a,t as o}from"./BAIFlex-DnaoYTJ1.js";import{n as s,t as c}from"./BAISelect-COE914ai.js";var l,u,d,f,p,m,h,g,_,v,y;function b(){return(b=e((()=>{a(),s(),r(),l=t(),u=n(),d={title:`Select/BAISelect`,component:c,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:"\n**BAISelect** is ui-common `Selector` under the BAI name: its props are `SelectorProps` (run `ui-common component Selector` for the full list) plus `ghost` and `autoSelectOption`. A multi-value list uses **BAIMultiSelector**.\n\n## BAI-Specific Props\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `ghost` | `boolean` | `false` | The on-dark treatment for a select on the header's brand band |\n| `autoSelectOption` | `boolean` | `false` | While no value is set, select the first option and report it through `onChange` |\n\n## Selector props used most\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `options` | `SelectorOptionType[]` | **required** | `{ value, label }` options, `{ type: 'section', title, options }` sections, `{ type: 'divider' }` |\n| `value` / `onChange` | `string \\| null` / `(value: string \\| null) => void` | - | The selected option value |\n| `hasSearch` | `boolean` | `true` | The search field in the listbox (on by default here) |\n| `hasClear` | `boolean` | `false` | A clear button while something is selected |\n| `isLoading` | `boolean` | `false` | The pending state of the trigger |\n| `width` | `number \\| string` | - | The trigger width |\n| `showTooltipOnEllipsis` | `boolean` | `false` | A tooltip with the full label while the trigger cuts it off |\n\n## Usage\n```tsx\n<BAISelect\n  options={[{ value: 'a', label: 'Option A' }]}\n  placeholder=\"Select an option\"\n  width={200}\n  onChange={(value) => setValue(value)}\n/>\n```\n        "}}},argTypes:{ghost:{control:{type:`boolean`},description:`The on-dark treatment for a select on the header's brand band`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},autoSelectOption:{control:{type:`boolean`},description:`While no value is set, select the first option and report it through onChange`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},options:{control:!1,description:`Options, sections and dividers of the listbox`,table:{type:{summary:`SelectorOptionType[]`}}},placeholder:{control:{type:`text`},description:`Trigger text while nothing is selected; also the accessible name when nothing else gives one`,table:{type:{summary:`string`}}},hasSearch:{control:{type:`boolean`},description:`The search field in the listbox`,table:{type:{summary:`boolean`},defaultValue:{summary:`true`}}},hasClear:{control:{type:`boolean`},description:`A clear button while something is selected`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},isLoading:{control:{type:`boolean`},description:`The pending state of the trigger`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},disabled:{control:{type:`boolean`},description:`Whether the select is disabled`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},size:{control:{type:`radio`},options:[`sm`,`md`,`lg`],description:`The trigger size`,table:{type:{summary:`'sm' | 'md' | 'lg'`},defaultValue:{summary:`md`}}},status:{control:{type:`select`},options:[``,`error`,`warning`],description:`The border state; inside a Form.Item it follows validation`,table:{type:{summary:`'error' | 'warning' | ''`}}},width:{control:{type:`number`},description:`The trigger width`,table:{type:{summary:`number | string`}}},showTooltipOnEllipsis:{control:{type:`boolean`},description:`A tooltip with the full selected label while the trigger cuts it off`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},onChange:{action:`changed`,description:`Called with the selected option value, or null on clear`}}},f=[{label:`Option 1`,value:`option1`},{label:`Option 2`,value:`option2`},{label:`Option 3`,value:`option3`},{label:`Option 4`,value:`option4`}],p=[{label:`gpu-cluster-a100-80gb-high-memory-seoul`,value:`gpu-a100-seoul`},{label:`cpu-only`,value:`cpu-only`}],m={name:`Basic`,parameters:{docs:{description:{story:`A single select with four options. Search is on by default; use the controls to try the other props.`}}},args:{options:f,placeholder:`Select an option`,width:200,ghost:!1,autoSelectOption:!1}},h={parameters:{docs:{description:{story:"`ghost` next to the default treatment on a brand-coloured band, as in the app header's project select."}}},render:()=>(0,u.jsxs)(o,{direction:`column`,gap:`md`,style:{padding:24,background:`#1890ff`},children:[(0,u.jsxs)(o,{direction:`column`,gap:`xs`,children:[(0,u.jsx)(i,{style:{color:`white`},children:`Ghost Style (Transparent)`}),(0,u.jsx)(c,{options:f,placeholder:`Select option`,ghost:!0,width:200})]}),(0,u.jsxs)(o,{direction:`column`,gap:`xs`,children:[(0,u.jsx)(i,{style:{color:`white`},children:`Normal Style`}),(0,u.jsx)(c,{options:f,placeholder:`Select option`,ghost:!1,width:200})]})]})},g={parameters:{docs:{description:{story:"With `autoSelectOption`, the first option is reported through `onChange` while no value is set; without it the select stays empty."}}},render:()=>{let[e,t]=(0,l.useState)(null),[n,r]=(0,l.useState)(null);return(0,u.jsxs)(o,{direction:`column`,gap:`md`,children:[(0,u.jsxs)(o,{direction:`column`,gap:`xs`,children:[(0,u.jsx)(i,{children:`Auto-select enabled (first option selected)`}),(0,u.jsx)(c,{options:f,placeholder:`Auto-selects first option`,autoSelectOption:!0,value:e,onChange:t,width:250}),(0,u.jsxs)(i,{type:`secondary`,children:[`Selected: `,e||`None`]})]}),(0,u.jsxs)(o,{direction:`column`,gap:`xs`,children:[(0,u.jsx)(i,{children:`Auto-select disabled`}),(0,u.jsx)(c,{options:f,placeholder:`Select manually`,autoSelectOption:!1,value:n,onChange:r,width:250}),(0,u.jsxs)(i,{type:`secondary`,children:[`Selected: `,n||`None`]})]})]})}},_={parameters:{docs:{description:{story:"A long selected label in a narrow trigger. With `showTooltipOnEllipsis`, hovering or focusing the trigger shows the full label; without it the label is only cut off."}}},render:()=>(0,u.jsxs)(o,{direction:`column`,gap:`md`,children:[(0,u.jsx)(c,{"aria-label":`With tooltip`,showTooltipOnEllipsis:!0,options:p,defaultValue:`gpu-a100-seoul`,width:160}),(0,u.jsx)(c,{"aria-label":`Without tooltip`,options:p,defaultValue:`gpu-a100-seoul`,width:160})]})},v={name:`Disabled Option With Reason`,parameters:{docs:{description:{story:"An option disabled with `{ reason }` cannot be picked, and hovering its row shows why."}}},args:{options:[{label:`AK1A2B3C4D`,value:`ak1`},{label:`AK9Z8Y7X6W`,value:`ak2`,disabled:{reason:`This keypair is inactive.`}},{label:`AK5E6F7G8H`,value:`ak3`}],placeholder:`Select an access key`,width:280}},y=[`Default`,`GhostStyle`,`AutoSelectOption`,`TooltipOnEllipsis`,`DisabledOptionReason`],m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'A single select with four options. Search is on by default; use the controls to try the other props.'
      }
    }
  },
  args: {
    options: sampleOptions,
    placeholder: 'Select an option',
    width: 200,
    ghost: false,
    autoSelectOption: false
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "\`ghost\` next to the default treatment on a brand-coloured band, as in the app header's project select."
      }
    }
  },
  render: () => <BAIFlex direction="column" gap="md" style={{
    padding: 24,
    background: '#1890ff'
  }}>
      <BAIFlex direction="column" gap="xs">
        <BAIText style={{
        color: 'white'
      }}>Ghost Style (Transparent)</BAIText>
        <BAISelect options={sampleOptions} placeholder="Select option" ghost={true} width={200} />
      </BAIFlex>
      <BAIFlex direction="column" gap="xs">
        <BAIText style={{
        color: 'white'
      }}>Normal Style</BAIText>
        <BAISelect options={sampleOptions} placeholder="Select option" ghost={false} width={200} />
      </BAIFlex>
    </BAIFlex>
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'With \`autoSelectOption\`, the first option is reported through \`onChange\` while no value is set; without it the select stays empty.'
      }
    }
  },
  render: () => {
    const [value1, setValue1] = useState<string | null>(null);
    const [value2, setValue2] = useState<string | null>(null);
    return <BAIFlex direction="column" gap="md">
        <BAIFlex direction="column" gap="xs">
          <BAIText>Auto-select enabled (first option selected)</BAIText>
          <BAISelect options={sampleOptions} placeholder="Auto-selects first option" autoSelectOption={true} value={value1} onChange={setValue1} width={250} />
          <BAIText type="secondary">Selected: {value1 || 'None'}</BAIText>
        </BAIFlex>
        <BAIFlex direction="column" gap="xs">
          <BAIText>Auto-select disabled</BAIText>
          <BAISelect options={sampleOptions} placeholder="Select manually" autoSelectOption={false} value={value2} onChange={setValue2} width={250} />
          <BAIText type="secondary">Selected: {value2 || 'None'}</BAIText>
        </BAIFlex>
      </BAIFlex>;
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'A long selected label in a narrow trigger. With \`showTooltipOnEllipsis\`, hovering or focusing the trigger shows the full label; without it the label is only cut off.'
      }
    }
  },
  render: () => <BAIFlex direction="column" gap="md">
      <BAISelect aria-label="With tooltip" showTooltipOnEllipsis options={sampleLongLabelOptions} defaultValue="gpu-a100-seoul" width={160} />
      <BAISelect aria-label="Without tooltip" options={sampleLongLabelOptions} defaultValue="gpu-a100-seoul" width={160} />
    </BAIFlex>
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  name: 'Disabled Option With Reason',
  parameters: {
    docs: {
      description: {
        story: 'An option disabled with \`{ reason }\` cannot be picked, and hovering its row shows why.'
      }
    }
  },
  args: {
    options: [{
      label: 'AK1A2B3C4D',
      value: 'ak1'
    }, {
      label: 'AK9Z8Y7X6W',
      value: 'ak2',
      disabled: {
        reason: 'This keypair is inactive.'
      }
    }, {
      label: 'AK5E6F7G8H',
      value: 'ak3'
    }],
    placeholder: 'Select an access key',
    width: 280
  }
}`,...v.parameters?.docs?.source}}}})))()}b();export{g as AutoSelectOption,m as Default,v as DisabledOptionReason,h as GhostStyle,_ as TooltipOnEllipsis,y as __namedExportsOrder,d as default};