import{j as o,v as a}from"./iframe-Cg5_Z9Ur.js";import{B as x}from"./BAIDynamicUnitInputNumber-BLk3vw1u.js";import"./preload-helper-Dp1pzeXC.js";import"./index-BD8URYIZ.js";import"./isNumber-CwssVVGG.js";import"./toString-Cclp-tbC.js";import"./isSymbol-CAEu6nam.js";import"./filter-BLqoum4d.js";import"./_baseEach-ehINIfaQ.js";import"./get-rSWVeKOd.js";import"./_baseGet-BBFZjt9g.js";import"./identity-DKeuBCMA.js";import"./isEmpty-B6gIUdEz.js";import"./NumberStepper2-ChHjvkYA.js";import"./Field-BEOHoRM8.js";import"./FieldStatus-DrzOvif0.js";import"./FormLayoutContext-nAOKfnMh.js";import"./useIsHydrating-DkyXemWf.js";import"./useDevWarning-DWuNaqlT.js";import"./useControllableValue-CpPEHM3T.js";import"./NumberInput-96VZOfAg.js";import"./formControl-Cc-Fa-Iw.js";import"./NumberInput-DJTkAyHM.js";import"./useInputStatusIcon-CAKbo4vW.js";import"./useResolvedRequired-B83D7PKr.js";import"./fieldParts-CXbgCxGm.js";import"./useLocale-BdpuOf50.js";import"./inputAria-CStWn1wH.js";import"./InputClearButton-lOA30LZ1.js";import"./inputStyles.stylex-Bztz6H8O.js";import"./isNil-CHIgUVhi.js";import"./omit-C-fLS7-5.js";import"./_arrayEach-DpGxo2Of.js";import"./_cloneTypedArray-COspVE2i.js";import"./_baseAssignValue-C9pTZXNd.js";import"./_defineProperty-D-a-HBHl.js";import"./_baseSlice-F8doVSIJ.js";import"./_baseFlatten-B-_yxJLN.js";import"./_overRest-DZEGA-UT.js";import"./index-BOUBO4fi.js";import"./runtime-BhgYCK9T.js";import"./Selector-HjQyxK3j.js";import"./selectorPresentation.stylex-BxxO7vZ9.js";import"./Section-C7ZF1mZY.js";import"./usePopover-6r52zuzk.js";import"./rtlStyles-T4i24HtE.js";import"./useFocusReturnVisibility-DuMX9EJY.js";import"./useAnnounceRenderedText-DQyT4iqP.js";import"./useHighlightedOptionScroll-CQfn_ury.js";import"./useMenuOverflow-BuNP5XBC.js";import"./SelectorOption-TkWKSXw8.js";import"./Item-B9XAx10F.js";import"./computeTargetAndRel-BGwjeA1c.js";import"./composeEventHandlers-BolWE7qY.js";import"./useIndicator-Bt5WVAE7.js";import"./Divider-BfLfryAI.js";import"./find-BHnqg59K.js";import"./_baseFindIndex-Cj99RmFE.js";import"./toInteger-DiY7tQuR.js";import"./toFinite-Bva7xx_1.js";import"./toNumber-9Kkdm0W5.js";import"./_trimmedEndIndex-DuQxD0U0.js";import"./_baseClamp-DVUOCJN_.js";const Nt={title:"Input/BAIDynamicUnitInputNumber",component:x,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:"\n**BAIDynamicUnitInputNumber** is a specialized input component for handling memory and storage values with automatic unit conversion.\n\n## Features\n- Automatic unit conversion between MiB, GiB, TiB, PiB\n- Dynamic step increments that adapt to the current unit\n- Configurable min/max values with unit support (e.g., '256m', '45g')\n- Unit restriction (allow only specific units)\n- Seamless integration with Ant Design Form\n- Optional auto-unit switching based on value magnitude\n\n## Props\n| Name | Type | Default | Description |\n|------|------|---------|-------------|\n| `min` | `string` | `'0m'` | Minimum value with unit (e.g., '100m', '2g') |\n| `max` | `string` | `'300p'` | Maximum value with unit |\n| `value` | `string \\| null \\| undefined` | - | Current value with unit (controlled) |\n| `units` | `string[]` | `['m', 'g', 't', 'p']` | Allowed units (m=MiB, g=GiB, t=TiB, p=PiB) |\n| `dynamicSteps` | `number[]` | `[1, 2, 4, 8, ...]` | Step increments for input |\n| `roundStep` | `number` | - | Round input value to nearest step |\n| `disableAutoUnit` | `boolean` | `false` | Disable automatic unit switching |\n| `addonPrefix` | `ReactNode` | - | Content before input |\n| `addonSuffix` | `ReactNode` | - | Content after input |\n| `onChange` | `(value: string) => void` | - | Callback when value changes |\n\nFor all other props, refer to [Ant Design InputNumber](https://ant.design/components/input-number).\n\n## Unit Abbreviations\n- `m` - MiB (Mebibyte)\n- `g` - GiB (Gibibyte)\n- `t` - TiB (Tebibyte)\n- `p` - PiB (Pebibyte)\n        "}}},argTypes:{min:{control:!1,description:'Minimum value with unit (e.g., "100m", "2g"). Requires format: number + unit (m/g/t/p)',table:{type:{summary:"string"},defaultValue:{summary:"0m"}}},max:{control:!1,description:"Maximum value with unit. Requires format: number + unit (m/g/t/p)",table:{type:{summary:"string"},defaultValue:{summary:"300p"}}},value:{control:!1,description:"Current value with unit (controlled). Requires format: number + unit (m/g/t/p)",table:{type:{summary:"string | null | undefined"}}},units:{control:{type:"object"},description:"Allowed units array (m=MiB, g=GiB, t=TiB, p=PiB)",table:{type:{summary:"string[]"},defaultValue:{summary:"['m', 'g', 't', 'p']"}}},dynamicSteps:{control:{type:"object"},description:"Array of step increments for the input",table:{type:{summary:"number[]"},defaultValue:{summary:"[1, 2, 4, 8, 16, 32, 64, 128, 256, 512]"}}},roundStep:{control:{type:"number"},description:"Round input value to nearest step",table:{type:{summary:"number"}}},disableAutoUnit:{control:{type:"boolean"},description:"Disable automatic unit switching based on value magnitude",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},addonPrefix:{control:!1,description:"Content to display before the input",table:{type:{summary:"ReactNode"}}},addonSuffix:{control:!1,description:"Content to display after the input",table:{type:{summary:"ReactNode"}}},onChange:{action:"changed",description:"Callback fired when value changes",table:{type:{summary:"(value: string) => void"}}},disabled:{control:{type:"boolean"},description:"Disable the input",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},size:{control:{type:"select"},options:["small","middle","large"],description:"Input size",table:{type:{summary:"'small' | 'middle' | 'large'"}}}}},A=({value:M,...G})=>o.jsx(a,{initialValues:{mem:M},children:o.jsx(a.Item,{name:"mem",children:o.jsx(x,{...G})})}),t={name:"Basic",parameters:{docs:{description:{story:"Basic uncontrolled usage with default settings. Allows all units (MiB, GiB, TiB, PiB)."}}}},e={name:"FormIntegration",parameters:{docs:{description:{story:"Controlled by Ant Design Form.Item. The component syncs with form state automatically."}}},render:A,args:{value:"1.3g"}},n={name:"MinMaxRange",parameters:{docs:{description:{story:"Custom min/max range. Input validates against these boundaries."}}},args:{min:"256m",max:"45g"}},i={name:"MiBGiBUnits",parameters:{docs:{description:{story:"Restrict units to MiB and GiB only. User can switch between these two units."}}},args:{min:"256m",max:"45g",units:["m","g"]}},r={name:"GiBOnly",parameters:{docs:{description:{story:"Restrict to GiB unit only. Useful when fractional GiB values are needed."}}},args:{min:"100m",max:"45g",units:["g"]}};var s,m,p;t.parameters={...t.parameters,docs:{...(s=t.parameters)==null?void 0:s.docs,source:{originalSource:`{
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'Basic uncontrolled usage with default settings. Allows all units (MiB, GiB, TiB, PiB).'
      }
    }
  }
}`,...(p=(m=t.parameters)==null?void 0:m.docs)==null?void 0:p.source}}};var u,l,c;e.parameters={...e.parameters,docs:{...(u=e.parameters)==null?void 0:u.docs,source:{originalSource:`{
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
}`,...(v=(w=r.parameters)==null?void 0:w.docs)==null?void 0:v.source}}};const Ot=["Default","WithFormItem","WithMinMax","AllowOnlyMiBandGiB","AllowOnlyGiB"];export{r as AllowOnlyGiB,i as AllowOnlyMiBandGiB,t as Default,e as WithFormItem,n as WithMinMax,Ot as __namedExportsOrder,Nt as default};
