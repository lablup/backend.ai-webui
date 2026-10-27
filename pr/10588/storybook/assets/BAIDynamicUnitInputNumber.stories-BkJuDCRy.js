import{n as e}from"./rolldown-runtime-2s6bX4vc.js";import{n as t,t as n}from"./BAIDynamicUnitInputNumber-D9ipSNHl.js";import{n as r,r as i}from"./iframe-DR2sIF5r.js";import{jsx as a}from"react/jsx-runtime";var o,s,c,l,u,d,f,p;function m(){return(m=e((()=>{i(),t(),o={title:`Input/BAIDynamicUnitInputNumber`,component:n,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:"\n**BAIDynamicUnitInputNumber** is a specialized input component for handling memory and storage values with automatic unit conversion.\n\n## Features\n- Automatic unit conversion between MiB, GiB, TiB, PiB\n- Dynamic step increments that adapt to the current unit\n- Configurable min/max values with unit support (e.g., '256m', '45g')\n- Unit restriction (allow only specific units)\n- Seamless integration with Ant Design Form\n- Optional auto-unit switching based on value magnitude\n\n## Props\n| Name | Type | Default | Description |\n|------|------|---------|-------------|\n| `min` | `string` | `'0m'` | Minimum value with unit (e.g., '100m', '2g') |\n| `max` | `string` | `'300p'` | Maximum value with unit |\n| `value` | `string \\| null \\| undefined` | - | Current value with unit (controlled) |\n| `units` | `string[]` | `['m', 'g', 't', 'p']` | Allowed units (m=MiB, g=GiB, t=TiB, p=PiB) |\n| `dynamicSteps` | `number[]` | `[1, 2, 4, 8, ...]` | Step increments for input |\n| `roundStep` | `number` | - | Round input value to nearest step |\n| `disableAutoUnit` | `boolean` | `false` | Disable automatic unit switching |\n| `addonPrefix` | `ReactNode` | - | Content before input |\n| `addonSuffix` | `ReactNode` | - | Content after input |\n| `onChange` | `(value: string) => void` | - | Callback when value changes |\n\nFor all other props, refer to [Ant Design InputNumber](https://ant.design/components/input-number).\n\n## Unit Abbreviations\n- `m` - MiB (Mebibyte)\n- `g` - GiB (Gibibyte)\n- `t` - TiB (Tebibyte)\n- `p` - PiB (Pebibyte)\n        "}}},argTypes:{min:{control:!1,description:`Minimum value with unit (e.g., "100m", "2g"). Requires format: number + unit (m/g/t/p)`,table:{type:{summary:`string`},defaultValue:{summary:`0m`}}},max:{control:!1,description:`Maximum value with unit. Requires format: number + unit (m/g/t/p)`,table:{type:{summary:`string`},defaultValue:{summary:`300p`}}},value:{control:!1,description:`Current value with unit (controlled). Requires format: number + unit (m/g/t/p)`,table:{type:{summary:`string | null | undefined`}}},units:{control:{type:`object`},description:`Allowed units array (m=MiB, g=GiB, t=TiB, p=PiB)`,table:{type:{summary:`string[]`},defaultValue:{summary:`['m', 'g', 't', 'p']`}}},dynamicSteps:{control:{type:`object`},description:`Array of step increments for the input`,table:{type:{summary:`number[]`},defaultValue:{summary:`[1, 2, 4, 8, 16, 32, 64, 128, 256, 512]`}}},roundStep:{control:{type:`number`},description:`Round input value to nearest step`,table:{type:{summary:`number`}}},disableAutoUnit:{control:{type:`boolean`},description:`Disable automatic unit switching based on value magnitude`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},addonPrefix:{control:!1,description:`Content to display before the input`,table:{type:{summary:`ReactNode`}}},addonSuffix:{control:!1,description:`Content to display after the input`,table:{type:{summary:`ReactNode`}}},onChange:{action:`changed`,description:`Callback fired when value changes`,table:{type:{summary:`(value: string) => void`}}},disabled:{control:{type:`boolean`},description:`Disable the input`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},size:{control:{type:`select`},options:[`small`,`middle`,`large`],description:`Input size`,table:{type:{summary:`'small' | 'middle' | 'large'`}}}}},s=({value:e,...t})=>a(r,{initialValues:{mem:e},children:a(r.Item,{name:`mem`,children:a(n,{...t})})}),c={name:`Basic`,parameters:{docs:{description:{story:`Basic uncontrolled usage with default settings. Allows all units (MiB, GiB, TiB, PiB).`}}}},l={name:`FormIntegration`,parameters:{docs:{description:{story:`Controlled by Ant Design Form.Item. The component syncs with form state automatically.`}}},render:s,args:{value:`1.3g`}},u={name:`MinMaxRange`,parameters:{docs:{description:{story:`Custom min/max range. Input validates against these boundaries.`}}},args:{min:`256m`,max:`45g`}},d={name:`MiBGiBUnits`,parameters:{docs:{description:{story:`Restrict units to MiB and GiB only. User can switch between these two units.`}}},args:{min:`256m`,max:`45g`,units:[`m`,`g`]}},f={name:`GiBOnly`,parameters:{docs:{description:{story:`Restrict to GiB unit only. Useful when fractional GiB values are needed.`}}},args:{min:`100m`,max:`45g`,units:[`g`]}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'Basic uncontrolled usage with default settings. Allows all units (MiB, GiB, TiB, PiB).'
      }
    }
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  name: 'FormIntegration',
  parameters: {
    docs: {
      description: {
        story: 'Controlled by Ant Design Form.Item. The component syncs with form state automatically.'
      }
    }
  },
  render: renderWithFormItem,
  args: {
    value: '1.3g'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  name: 'MinMaxRange',
  parameters: {
    docs: {
      description: {
        story: 'Custom min/max range. Input validates against these boundaries.'
      }
    }
  },
  args: {
    min: '256m',
    max: '45g'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  name: 'MiBGiBUnits',
  parameters: {
    docs: {
      description: {
        story: 'Restrict units to MiB and GiB only. User can switch between these two units.'
      }
    }
  },
  args: {
    min: '256m',
    max: '45g',
    units: ['m', 'g']
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  name: 'GiBOnly',
  parameters: {
    docs: {
      description: {
        story: 'Restrict to GiB unit only. Useful when fractional GiB values are needed.'
      }
    }
  },
  args: {
    min: '100m',
    max: '45g',
    units: ['g']
  }
}`,...f.parameters?.docs?.source}}},p=[`Default`,`WithFormItem`,`WithMinMax`,`AllowOnlyMiBandGiB`,`AllowOnlyGiB`]})))()}m();export{f as AllowOnlyGiB,d as AllowOnlyMiBandGiB,c as Default,l as WithFormItem,u as WithMinMax,p as __namedExportsOrder,o as default};