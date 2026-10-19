import{j as a,_ as o}from"./iframe-JR15A1Zt.js";import{B as x}from"./BAIDynamicUnitInputNumber-CJKYslCZ.js";import"./preload-helper-Dp1pzeXC.js";import"./index-D7HfDjJV.js";import"./isNumber-Bgh7R6pj.js";import"./toString-DUyMovj_.js";import"./isSymbol-HqwOsqUW.js";import"./filter-Bo6WBPTU.js";import"./_baseEach-boceh_gz.js";import"./get-BossNOdO.js";import"./_baseGet-ij5L16ec.js";import"./identity-DKeuBCMA.js";import"./isEmpty-Rem9NEfQ.js";import"./NumberStepper2-CznEWp8x.js";import"./InputGroupContext-C1ZpmzpM.js";import"./FieldStatus-BSNg5TZ2.js";import"./useDevWarning-GVfj8Kdk.js";import"./useControllableValue-DOkBN5pc.js";import"./NumberInput-uEBw5o9X.js";import"./useInputStatusIcon-DQovaTSl.js";import"./useResolvedRequired-B9SFkhzn.js";import"./groupStyles-10hsqrcd.js";import"./isNil-CHIgUVhi.js";import"./omit-BeknkxwE.js";import"./_arrayEach-DpGxo2Of.js";import"./_cloneTypedArray-iBIRPJgJ.js";import"./_baseAssignValue-BOnXi1Hy.js";import"./_defineProperty-0DeEP774.js";import"./_baseSlice-F8doVSIJ.js";import"./_baseFlatten-D84eV697.js";import"./_overRest-ClCHNpIN.js";import"./Selector-DnoisnDN.js";import"./useMenuOverflow-Bvcxmoo8.js";import"./SelectorOption-Ct1UqrGv.js";import"./Item-C45LYrjn.js";import"./computeTargetAndRel-BGwjeA1c.js";import"./isRenderable-BUV0eL6r.js";import"./composeEventHandlers-BolWE7qY.js";import"./usePopover-DoDsYRtN.js";import"./rtlStyles-T4i24HtE.js";import"./useIndicator-Byuvnjcx.js";import"./Divider-8pytarTw.js";import"./find-CBrVZ6g7.js";import"./_baseFindIndex-Cj99RmFE.js";import"./toInteger-CgIS46uJ.js";import"./toFinite-Dgp00p8H.js";import"./toNumber-D2G1W1Xy.js";import"./_trimmedEndIndex-DuQxD0U0.js";import"./_baseClamp-DVUOCJN_.js";const vt={title:"Input/BAIDynamicUnitInputNumber",component:x,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:"\n**BAIDynamicUnitInputNumber** is a specialized input component for handling memory and storage values with automatic unit conversion.\n\n## Features\n- Automatic unit conversion between MiB, GiB, TiB, PiB\n- Dynamic step increments that adapt to the current unit\n- Configurable min/max values with unit support (e.g., '256m', '45g')\n- Unit restriction (allow only specific units)\n- Seamless integration with Ant Design Form\n- Optional auto-unit switching based on value magnitude\n\n## Props\n| Name | Type | Default | Description |\n|------|------|---------|-------------|\n| `min` | `string` | `'0m'` | Minimum value with unit (e.g., '100m', '2g') |\n| `max` | `string` | `'300p'` | Maximum value with unit |\n| `value` | `string \\| null \\| undefined` | - | Current value with unit (controlled) |\n| `units` | `string[]` | `['m', 'g', 't', 'p']` | Allowed units (m=MiB, g=GiB, t=TiB, p=PiB) |\n| `dynamicSteps` | `number[]` | `[1, 2, 4, 8, ...]` | Step increments for input |\n| `roundStep` | `number` | - | Round input value to nearest step |\n| `disableAutoUnit` | `boolean` | `false` | Disable automatic unit switching |\n| `addonPrefix` | `ReactNode` | - | Content before input |\n| `addonSuffix` | `ReactNode` | - | Content after input |\n| `onChange` | `(value: string) => void` | - | Callback when value changes |\n\nFor all other props, refer to [Ant Design InputNumber](https://ant.design/components/input-number).\n\n## Unit Abbreviations\n- `m` - MiB (Mebibyte)\n- `g` - GiB (Gibibyte)\n- `t` - TiB (Tebibyte)\n- `p` - PiB (Pebibyte)\n        "}}},argTypes:{min:{control:!1,description:'Minimum value with unit (e.g., "100m", "2g"). Requires format: number + unit (m/g/t/p)',table:{type:{summary:"string"},defaultValue:{summary:"0m"}}},max:{control:!1,description:"Maximum value with unit. Requires format: number + unit (m/g/t/p)",table:{type:{summary:"string"},defaultValue:{summary:"300p"}}},value:{control:!1,description:"Current value with unit (controlled). Requires format: number + unit (m/g/t/p)",table:{type:{summary:"string | null | undefined"}}},units:{control:{type:"object"},description:"Allowed units array (m=MiB, g=GiB, t=TiB, p=PiB)",table:{type:{summary:"string[]"},defaultValue:{summary:"['m', 'g', 't', 'p']"}}},dynamicSteps:{control:{type:"object"},description:"Array of step increments for the input",table:{type:{summary:"number[]"},defaultValue:{summary:"[1, 2, 4, 8, 16, 32, 64, 128, 256, 512]"}}},roundStep:{control:{type:"number"},description:"Round input value to nearest step",table:{type:{summary:"number"}}},disableAutoUnit:{control:{type:"boolean"},description:"Disable automatic unit switching based on value magnitude",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},addonPrefix:{control:!1,description:"Content to display before the input",table:{type:{summary:"ReactNode"}}},addonSuffix:{control:!1,description:"Content to display after the input",table:{type:{summary:"ReactNode"}}},onChange:{action:"changed",description:"Callback fired when value changes",table:{type:{summary:"(value: string) => void"}}},disabled:{control:{type:"boolean"},description:"Disable the input",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},size:{control:{type:"select"},options:["small","middle","large"],description:"Input size",table:{type:{summary:"'small' | 'middle' | 'large'"}}}}},A=({value:M,...G})=>a.jsx(o,{initialValues:{mem:M},children:a.jsx(o.Item,{name:"mem",children:a.jsx(x,{...G})})}),t={name:"Basic",parameters:{docs:{description:{story:"Basic uncontrolled usage with default settings. Allows all units (MiB, GiB, TiB, PiB)."}}}},e={name:"FormIntegration",parameters:{docs:{description:{story:"Controlled by Ant Design Form.Item. The component syncs with form state automatically."}}},render:A,args:{value:"1.3g"}},n={name:"MinMaxRange",parameters:{docs:{description:{story:"Custom min/max range. Input validates against these boundaries."}}},args:{min:"256m",max:"45g"}},i={name:"MiBGiBUnits",parameters:{docs:{description:{story:"Restrict units to MiB and GiB only. User can switch between these two units."}}},args:{min:"256m",max:"45g",units:["m","g"]}},r={name:"GiBOnly",parameters:{docs:{description:{story:"Restrict to GiB unit only. Useful when fractional GiB values are needed."}}},args:{min:"100m",max:"45g",units:["g"]}};var s,m,u;t.parameters={...t.parameters,docs:{...(s=t.parameters)==null?void 0:s.docs,source:{originalSource:`{
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'Basic uncontrolled usage with default settings. Allows all units (MiB, GiB, TiB, PiB).'
      }
    }
  }
}`,...(u=(m=t.parameters)==null?void 0:m.docs)==null?void 0:u.source}}};var p,l,c;e.parameters={...e.parameters,docs:{...(p=e.parameters)==null?void 0:p.docs,source:{originalSource:`{
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
}`,...(c=(l=e.parameters)==null?void 0:l.docs)==null?void 0:c.source}}};var d,g,y;n.parameters={...n.parameters,docs:{...(d=n.parameters)==null?void 0:d.docs,source:{originalSource:`{
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
}`,...(y=(g=n.parameters)==null?void 0:g.docs)==null?void 0:y.source}}};var b,B,f;i.parameters={...i.parameters,docs:{...(b=i.parameters)==null?void 0:b.docs,source:{originalSource:`{
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
}`,...(f=(B=i.parameters)==null?void 0:B.docs)==null?void 0:f.source}}};var h,w,v;r.parameters={...r.parameters,docs:{...(h=r.parameters)==null?void 0:h.docs,source:{originalSource:`{
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
}`,...(v=(w=r.parameters)==null?void 0:w.docs)==null?void 0:v.source}}};const xt=["Default","WithFormItem","WithMinMax","AllowOnlyMiBandGiB","AllowOnlyGiB"];export{r as AllowOnlyGiB,i as AllowOnlyMiBandGiB,t as Default,e as WithFormItem,n as WithMinMax,xt as __namedExportsOrder,vt as default};
