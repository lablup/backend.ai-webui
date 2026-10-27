import{n as e}from"./rolldown-runtime-2s6bX4vc.js";import{l as t,n,t as r,u as i}from"./isObject-BhsmWKjo.js";import{a,n as o,o as s,t as c}from"./toString-D-HqYh4D.js";import{_ as l,v as u}from"./_initCloneObject-Bo3H_Qgw.js";import{S as d,x as f}from"./_Uint8Array-BGVRJxrU.js";import{a as p,i as m,n as h,o as g,r as _,t as v}from"./_baseGet-C9U2VJHR.js";import{i as y,r as b}from"./omit-DJc6Ke-e.js";import{n as ee,t as te}from"./BAIDynamicUnitInputNumber-D9ipSNHl.js";import{a as x,o as S}from"./_baseEach-D__71HGs.js";import{m as ne,p as re,v as ie,y as ae}from"./hooks-BKuvs6Qg.js";import{n as oe,t as se}from"./map-CIqW7OVA.js";import{n as C,t as ce}from"./isNumber-BrP4akIE.js";import{n as le,t as ue}from"./negate-BN4Ea_Dt.js";import{n as de,t as fe}from"./sortBy-BU2oZAX_.js";import{n as pe,t as me}from"./useBAIi18n-BoXCk5K0.js";import{n as w,r as he}from"./iframe-DR2sIF5r.js";import{n as ge,t as T}from"./BAIFlex-CAz1t6J5.js";import{c as _e,n as E,p as D}from"./helper-DV0q0X9R.js";import{n as ve,t as ye}from"./astryxLabel-D4afFvt3.js";import{n as be,t as O}from"./BAISlider-BaIy2VSE.js";import{createElement as xe,useEffect as Se,useMemo as k}from"react";import{jsx as A,jsxs as Ce}from"react/jsx-runtime";function we(e,t,r,i){if(!n(e))return e;t=p(t,e);for(var a=-1,o=t.length,s=o-1,c=e;c!=null&&++a<o;){var u=m(t[a]),f=r;if(u===`__proto__`||u===`constructor`||u===`prototype`)return e;if(a!=s){var h=c[u];f=i?i(h,u,c):void 0,f===void 0&&(f=n(h)?h:d(t[a+1])?[]:{})}l(c,u,f),c=c[u]}return e}function j(){return(j=e((()=>{u(),g(),f(),r(),_()})))()}function Te(e,t,n){for(var r=-1,i=t.length,a={};++r<i;){var o=t[r],s=v(e,o);n(s,o)&&we(a,p(o,e),s)}return a}function M(){return(M=e((()=>{h(),j(),g()})))()}function Ee(e,t){if(e==null)return{};var n=a(b(e),function(e){return[e]});return t=x(t),Te(e,n,function(e,n){return t(e,n[0])})}function N(){return(N=e((()=>{s(),S(),M(),y()})))()}function P(e,t){return Ee(e,le(x(t)))}function F(){return(F=e((()=>{S(),ue(),N()})))()}function De(e,t,n){return n||t==null?t=0:t&&=+t,L(o(e).replace(I,``),t||0)}var I,L;function R(){return(R=e((()=>{t(),c(),I=/^\s+/,L=i.parseInt})))()}var z,B;function V(){return(V=e((()=>{_e(),ye(),me(),re(),ie(),ee(),ge(),be(),fe(),se(),ce(),F(),R(),z=e=>de(oe(e,(e,t)=>{let n=e&&typeof e==`object`&&`label`in e?e.label:e,r=ve(n??null);return{value:Number(t),label:r===``?void 0:r}}),`value`),B=({min:e=`0m`,max:t=`32g`,warn:n,units:r=[`m`,`g`],extraMarks:i,hideSlider:a,step:o=.05,addonPrefix:s,addonSuffix:c,defaultUnit:l,...u})=>{let[d,f]=ne(u,{defaultValue:void 0}),{t:p}=pe(),m=k(()=>E(e,`g`,2),[e]),h=k(()=>E(t,`g`,2),[t]),g=k(()=>E(d||`0g`,`g`,2),[d]),[_,v]=ae(`first`);Se(()=>{let e=setTimeout(()=>{v(d?.toString())},0);return()=>clearTimeout(e)},[]);let y=C(m?.number)&&C(h?.number)&&m?.number>h?.number,b=e=>z(P({...e},(e,t)=>{let n=parseFloat(t);return m&&h&&(m?.number>n||h?.number<n)}));return Ce(T,{direction:`row`,gap:`md`,children:[A(T,{style:{flex:2,minWidth:190},direction:`column`,align:`stretch`,children:xe(te,{...u,key:_,min:e,max:t,units:r,defaultUnit:l,value:d,onChange:e=>{f(e)},style:{width:`100%`},roundStep:o,addonPrefix:s,addonSuffix:c})}),A(T,{direction:`column`,align:`stretch`,style:{flex:3,...a&&{visibility:`hidden`,height:0}},children:A(T,{direction:`column`,align:`stretch`,children:A(O,{"aria-label":p(`comp:BAIDynamicUnitInputNumberWithSlider.Amount`),width:`100%`,max:h?.number,step:o,value:y?0:g?.number??0,disabled:y,valueDisplay:y?`none`:`tooltip`,formatValue:(e=0)=>e<1?`${(e*1024).toFixed(2)} MiB`:`${e.toFixed(2)} GiB`,onChange:t=>{m?.number&&m.number>t?f(e):f(t<1?`${t*1024}m`:`${t}g`)},marks:b({...m&&C(m?.number)&&{[m.number]:{label:m.number===0?m.number:m.number>=1?m.number+`g`:m.number*1024+`m`}},...P(i,(e,t)=>C(h?.number)?De(t)>h?.number:!1),...h?.number&&{[h.number]:{label:h.number===0?h.number:h.number>=1?D(h.number,2)+`g`:D(h.number*1024,2)+`m`}}})})})})]})}})))()}var H,U,W,G,K,q,J,Y,X,Z,Q;function $(){return($=e((()=>{V(),he(),H={title:`Input/BAIDynamicUnitInputNumberWithSlider`,component:B,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:"\n**BAIDynamicUnitInputNumberWithSlider** extends [BAIDynamicUnitInputNumber](/?path=/docs/input-dynamicunitinputnumber) with an integrated slider control.\n\n## Features\n- Synchronized input number and slider controls\n- Automatic unit conversion (MiB, GiB, TiB, PiB)\n- Visual feedback with slider marks at min/max values\n- Warning state with color-coded slider track\n- Custom marks for important values (e.g., resource quotas)\n- Handles invalid states (min > max) gracefully by disabling slider\n- Supports hiding slider while maintaining input functionality\n\n## Props\n| Name | Type | Default | Description |\n|------|------|---------|-------------|\n| `min` | `string` | `'0m'` | Minimum value with unit (e.g., '100m', '2g') |\n| `max` | `string` | `'32g'` | Maximum value with unit |\n| `value` | `string \\| null \\| undefined` | `'0g'` | Current value with unit |\n| `units` | `string[]` | `['m', 'g']` | Allowed units (m=MiB, g=GiB, t=TiB, p=PiB) |\n| `step` | `number` | `0.05` | Slider step size in GiB |\n| `roundStep` | `number` | - | Round input value to nearest step |\n| `warn` | `string` | - | Warning threshold value (changes slider color) |\n| `extraMarks` | `SliderMarks` | - | Additional marks on slider |\n| `hideSlider` | `boolean` | `false` | Hide slider (keeps input only) |\n| `addonPrefix` | `ReactNode` | - | Content before input |\n| `addonSuffix` | `ReactNode` | - | Content after input |\n| `onChange` | `(value: string) => void` | - | Callback when value changes |\n\nFor all other props, refer to [Ant Design InputNumber](https://ant.design/components/input-number).\n\n## Unit Abbreviations\n- `m` - MiB (Mebibyte)\n- `g` - GiB (Gibibyte)\n- `t` - TiB (Tebibyte)\n- `p` - PiB (Pebibyte)\n        "}}},argTypes:{min:{control:!1,description:`Minimum value with unit (e.g., "100m", "2g"). Requires format: number + unit (m/g/t/p)`,table:{type:{summary:`string`},defaultValue:{summary:`0m`}}},max:{control:!1,description:`Maximum value with unit. Requires format: number + unit (m/g/t/p)`,table:{type:{summary:`string`},defaultValue:{summary:`32g`}}},value:{control:!1,description:`Current value with unit (controlled). Requires format: number + unit (m/g/t/p)`,table:{type:{summary:`string | null | undefined`},defaultValue:{summary:`0g`}}},units:{control:{type:`object`},description:`Allowed units array (m=MiB, g=GiB, t=TiB, p=PiB)`,table:{type:{summary:`string[]`},defaultValue:{summary:`['m', 'g']`}}},step:{control:{type:`number`},description:`Slider step size in GiB`,table:{type:{summary:`number`},defaultValue:{summary:`0.05`}}},roundStep:{control:{type:`number`},description:`Round input value to nearest step`,table:{type:{summary:`number`}}},warn:{control:!1,description:`Warning threshold value with unit. Slider track turns warning color when value exceeds this. Requires format: number + unit (m/g/t/p)`,table:{type:{summary:`string`}}},extraMarks:{control:!1,description:`Additional slider marks (SliderMarks object mapping number positions to mark configs)`,table:{type:{summary:`SliderMarks`}}},hideSlider:{control:{type:`boolean`},description:`Hide slider component (keeps input only)`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},addonPrefix:{control:!1,description:`Content to display before the input`,table:{type:{summary:`ReactNode`}}},addonSuffix:{control:!1,description:`Content to display after the input`,table:{type:{summary:`ReactNode`}}},onChange:{action:`changed`,description:`Callback fired when value changes`,table:{type:{summary:`(value: string) => void`}}},disabled:{control:{type:`boolean`},description:`Disable both input and slider`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},size:{control:{type:`select`},options:[`small`,`middle`,`large`],description:`Input size`,table:{type:{summary:`'small' | 'middle' | 'large'`}}}}},U=({value:e,...t})=>A(w,{initialValues:{mem:e},children:A(w.Item,{name:`mem`,children:A(B,{...t})})}),W={name:`Basic`,parameters:{docs:{description:{story:`Basic uncontrolled usage with default settings (0m to 32g range).`}}}},G={name:`FormIntegration`,parameters:{docs:{description:{story:`Controlled by Ant Design Form.Item. The component syncs with form state automatically.`}}},render:U,args:{value:`1.3g`}},K={name:`MinMaxRange`,parameters:{docs:{description:{story:`Custom min/max range. Slider shows marks at min and max positions.`}}},args:{min:`100m`,max:`45g`}},q={name:`MiBGiBUnits`,parameters:{docs:{description:{story:`Restrict units to MiB and GiB only. User can switch between these two units.`}}},args:{min:`2g`,max:`45g`,units:[`m`,`g`]}},J={name:`GiBOnly`,parameters:{docs:{description:{story:`Restrict to GiB unit only. Useful when fractional GiB values are needed.`}}},args:{min:`0.5g`,max:`45g`,units:[`g`]}},Y={name:`InvalidRange`,parameters:{docs:{description:{story:`Edge case handling when min > max. Slider is disabled and marks are hidden to prevent confusion.`}}},args:{min:`3g`,max:`1g`,units:[`m`,`g`]}},X={name:`CustomMarks`,parameters:{docs:{description:{story:`Add custom marks to highlight important values (e.g., recommended settings, quotas).`}}},args:{min:`0g`,max:`1g`,units:[`m`,`g`],extraMarks:{.5:{style:{color:`red`},label:`0.5g`}}}},Z={name:`CustomMarksInvalidRange`,parameters:{docs:{description:{story:`Custom marks are filtered out when min > max to maintain consistent invalid state.`}}},args:{min:`3g`,max:`1g`,units:[`m`,`g`],extraMarks:{.5:{style:{color:`red`},label:`0.5g`}}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'Basic uncontrolled usage with default settings (0m to 32g range).'
      }
    }
  }
}`,...W.parameters?.docs?.source}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
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
}`,...G.parameters?.docs?.source}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  name: 'MinMaxRange',
  parameters: {
    docs: {
      description: {
        story: 'Custom min/max range. Slider shows marks at min and max positions.'
      }
    }
  },
  args: {
    min: '100m',
    max: '45g'
  }
}`,...K.parameters?.docs?.source}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  name: 'MiBGiBUnits',
  parameters: {
    docs: {
      description: {
        story: 'Restrict units to MiB and GiB only. User can switch between these two units.'
      }
    }
  },
  args: {
    min: '2g',
    max: '45g',
    units: ['m', 'g']
  }
}`,...q.parameters?.docs?.source}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  name: 'GiBOnly',
  parameters: {
    docs: {
      description: {
        story: 'Restrict to GiB unit only. Useful when fractional GiB values are needed.'
      }
    }
  },
  args: {
    min: '0.5g',
    max: '45g',
    units: ['g']
  }
}`,...J.parameters?.docs?.source}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  name: 'InvalidRange',
  parameters: {
    docs: {
      description: {
        story: 'Edge case handling when min > max. Slider is disabled and marks are hidden to prevent confusion.'
      }
    }
  },
  args: {
    min: '3g',
    max: '1g',
    units: ['m', 'g']
  }
}`,...Y.parameters?.docs?.source}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  name: 'CustomMarks',
  parameters: {
    docs: {
      description: {
        story: 'Add custom marks to highlight important values (e.g., recommended settings, quotas).'
      }
    }
  },
  args: {
    min: '0g',
    max: '1g',
    units: ['m', 'g'],
    extraMarks: {
      0.5: {
        style: {
          color: 'red'
        },
        label: '0.5g'
      }
    }
  }
}`,...X.parameters?.docs?.source}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
  name: 'CustomMarksInvalidRange',
  parameters: {
    docs: {
      description: {
        story: 'Custom marks are filtered out when min > max to maintain consistent invalid state.'
      }
    }
  },
  args: {
    min: '3g',
    max: '1g',
    units: ['m', 'g'],
    extraMarks: {
      0.5: {
        style: {
          color: 'red'
        },
        label: '0.5g'
      }
    }
  }
}`,...Z.parameters?.docs?.source}}},Q=[`Default`,`WithFormItem`,`WithMin`,`AllowOnlyMiBandGiB`,`AllowOnlyGiB`,`GreaterMinThanMax`,`ExtraMarks`,`ExtraMarksWithGreaterMinThanMax`]})))()}$();export{J as AllowOnlyGiB,q as AllowOnlyMiBandGiB,W as Default,X as ExtraMarks,Z as ExtraMarksWithGreaterMinThanMax,Y as GreaterMinThanMax,G as WithFormItem,K as WithMin,Q as __namedExportsOrder,H as default};