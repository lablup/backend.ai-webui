import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-D0Ex1IVc.js";import{l as n,n as r,t as i,u as a}from"./isObject-Cu5W6UBH.js";import{a as o,n as s,o as c,t as l}from"./toString-DisgP18h.js";import{_ as u,v as d}from"./_initCloneObject-CJHbjQyA.js";import{S as f,x as p}from"./_Uint8Array-Cb-jzVD9.js";import{a as m,i as h,n as g,o as _,r as v,t as y}from"./_baseGet-BOlqZhSU.js";import{i as b,r as ee}from"./omit-CntEYmYa.js";import{n as te,t as ne}from"./BAIDynamicUnitInputNumber-DgsX1mYc.js";import{a as x,o as S}from"./_baseEach-IDZ1epn0.js";import{m as re,p as ie,v as ae,y as oe}from"./hooks-C37w8Ol6.js";import{n as se,t as ce}from"./map-CLZMgxwS.js";import{n as C,t as le}from"./isNumber-BkvUSshz.js";import{n as ue,t as de}from"./negate-BQT8cDrf.js";import{n as fe,t as pe}from"./sortBy-We-fx3CA.js";import{t as w}from"./jsx-runtime-MKhVqBIO.js";import{n as me,t as he}from"./useBAIi18n-Biey1teG.js";import{n as T,t as ge}from"./Form-DzbqW5jU.js";import{n as _e,t as E}from"./BAIFlex-BOFoS5KY.js";import{c as ve,n as D,p as O}from"./helper-CPPrFJ2v.js";import{n as ye,t as be}from"./astryxLabel-3zAUsN4G.js";import{n as xe,t as Se}from"./Slider-C-_FsUAg.js";function Ce(e,t,n,i){if(!r(e))return e;t=m(t,e);for(var a=-1,o=t.length,s=o-1,c=e;c!=null&&++a<o;){var l=h(t[a]),d=n;if(l===`__proto__`||l===`constructor`||l===`prototype`)return e;if(a!=s){var p=c[l];d=i?i(p,l,c):void 0,d===void 0&&(d=r(p)?p:f(t[a+1])?[]:{})}u(c,l,d),c=c[l]}return e}function k(){return(k=e((()=>{d(),_(),p(),i(),v()})))()}function we(e,t,n){for(var r=-1,i=t.length,a={};++r<i;){var o=t[r],s=y(e,o);n(s,o)&&Ce(a,m(o,e),s)}return a}function A(){return(A=e((()=>{g(),k(),_()})))()}function Te(e,t){if(e==null)return{};var n=o(ee(e),function(e){return[e]});return t=x(t),we(e,n,function(e,n){return t(e,n[0])})}function j(){return(j=e((()=>{c(),S(),A(),b()})))()}function M(e,t){return Te(e,ue(x(t)))}function N(){return(N=e((()=>{S(),de(),j()})))()}function Ee(e,t,n){return n||t==null?t=0:t&&=+t,F(s(e).replace(P,``),t||0)}var P,F;function I(){return(I=e((()=>{n(),l(),P=/^\s+/,F=a.parseInt})))()}var L,R,z,B;function V(){return(V=e((()=>{ve(),be(),he(),ie(),ae(),te(),_e(),xe(),pe(),ce(),le(),N(),I(),L=t(),R=w(),z=e=>fe(se(e,(e,t)=>{let n=e&&typeof e==`object`&&`label`in e?e.label:e,r=ye(n??null);return{value:Number(t),label:r===``?void 0:r}}),`value`),B=({min:e=`0m`,max:t=`32g`,warn:n,units:r=[`m`,`g`],extraMarks:i,hideSlider:a,step:o=.05,addonPrefix:s,addonSuffix:c,defaultUnit:l,...u})=>{let[d,f]=re(u,{defaultValue:void 0}),{t:p}=me(),m=(0,L.useMemo)(()=>D(e,`g`,2),[e]),h=(0,L.useMemo)(()=>D(t,`g`,2),[t]),g=(0,L.useMemo)(()=>D(d||`0g`,`g`,2),[d]),[_,v]=oe(`first`);(0,L.useEffect)(()=>{let e=setTimeout(()=>{v(d?.toString())},0);return()=>clearTimeout(e)},[]);let y=C(m?.number)&&C(h?.number)&&m?.number>h?.number,b=e=>z(M({...e},(e,t)=>{let n=parseFloat(t);return m&&h&&(m?.number>n||h?.number<n)}));return(0,R.jsxs)(E,{direction:`row`,gap:`md`,children:[(0,R.jsx)(E,{style:{flex:2,minWidth:190},direction:`column`,align:`stretch`,children:(0,L.createElement)(ne,{...u,key:_,min:e,max:t,units:r,defaultUnit:l,value:d,onChange:e=>{f(e)},style:{width:`100%`},roundStep:o,addonPrefix:s,addonSuffix:c})}),(0,R.jsx)(E,{direction:`column`,align:`stretch`,style:{flex:3,...a&&{visibility:`hidden`,height:0}},children:(0,R.jsx)(E,{direction:`column`,align:`stretch`,children:(0,R.jsx)(Se,{"aria-label":p(`comp:BAIDynamicUnitInputNumberWithSlider.Amount`),width:`100%`,max:h?.number,step:o,value:y?0:g?.number??0,disabled:y,valueDisplay:y?`none`:`tooltip`,formatValue:(e=0)=>e<1?`${(e*1024).toFixed(2)} MiB`:`${e.toFixed(2)} GiB`,onChange:t=>{m?.number&&m.number>t?f(e):f(t<1?`${t*1024}m`:`${t}g`)},marks:b({...m&&C(m?.number)&&{[m.number]:{label:m.number===0?m.number:m.number>=1?m.number+`g`:m.number*1024+`m`}},...M(i,(e,t)=>C(h?.number)?Ee(t)>h?.number:!1),...h?.number&&{[h.number]:{label:h.number===0?h.number:h.number>=1?O(h.number,2)+`g`:O(h.number*1024,2)+`m`}}})})})})]})}})))()}var H,U,W,G,K,q,J,Y,X,Z,Q,De;function $(){return($=e((()=>{V(),ge(),H=w(),U={title:`Input/BAIDynamicUnitInputNumberWithSlider`,component:B,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:"\n**BAIDynamicUnitInputNumberWithSlider** extends [BAIDynamicUnitInputNumber](/?path=/docs/input-dynamicunitinputnumber) with an integrated slider control.\n\n## Features\n- Synchronized input number and slider controls\n- Automatic unit conversion (MiB, GiB, TiB, PiB)\n- Visual feedback with slider marks at min/max values\n- Warning state with color-coded slider track\n- Custom marks for important values (e.g., resource quotas)\n- Handles invalid states (min > max) gracefully by disabling slider\n- Supports hiding slider while maintaining input functionality\n\n## Props\n| Name | Type | Default | Description |\n|------|------|---------|-------------|\n| `min` | `string` | `'0m'` | Minimum value with unit (e.g., '100m', '2g') |\n| `max` | `string` | `'32g'` | Maximum value with unit |\n| `value` | `string \\| null \\| undefined` | `'0g'` | Current value with unit |\n| `units` | `string[]` | `['m', 'g']` | Allowed units (m=MiB, g=GiB, t=TiB, p=PiB) |\n| `step` | `number` | `0.05` | Slider step size in GiB |\n| `roundStep` | `number` | - | Round input value to nearest step |\n| `warn` | `string` | - | Warning threshold value (changes slider color) |\n| `extraMarks` | `SliderMarks` | - | Additional marks on slider |\n| `hideSlider` | `boolean` | `false` | Hide slider (keeps input only) |\n| `addonPrefix` | `ReactNode` | - | Content before input |\n| `addonSuffix` | `ReactNode` | - | Content after input |\n| `onChange` | `(value: string) => void` | - | Callback when value changes |\n\nFor all other props, refer to [Ant Design InputNumber](https://ant.design/components/input-number).\n\n## Unit Abbreviations\n- `m` - MiB (Mebibyte)\n- `g` - GiB (Gibibyte)\n- `t` - TiB (Tebibyte)\n- `p` - PiB (Pebibyte)\n        "}}},argTypes:{min:{control:!1,description:`Minimum value with unit (e.g., "100m", "2g"). Requires format: number + unit (m/g/t/p)`,table:{type:{summary:`string`},defaultValue:{summary:`0m`}}},max:{control:!1,description:`Maximum value with unit. Requires format: number + unit (m/g/t/p)`,table:{type:{summary:`string`},defaultValue:{summary:`32g`}}},value:{control:!1,description:`Current value with unit (controlled). Requires format: number + unit (m/g/t/p)`,table:{type:{summary:`string | null | undefined`},defaultValue:{summary:`0g`}}},units:{control:{type:`object`},description:`Allowed units array (m=MiB, g=GiB, t=TiB, p=PiB)`,table:{type:{summary:`string[]`},defaultValue:{summary:`['m', 'g']`}}},step:{control:{type:`number`},description:`Slider step size in GiB`,table:{type:{summary:`number`},defaultValue:{summary:`0.05`}}},roundStep:{control:{type:`number`},description:`Round input value to nearest step`,table:{type:{summary:`number`}}},warn:{control:!1,description:`Warning threshold value with unit. Slider track turns warning color when value exceeds this. Requires format: number + unit (m/g/t/p)`,table:{type:{summary:`string`}}},extraMarks:{control:!1,description:`Additional slider marks (SliderMarks object mapping number positions to mark configs)`,table:{type:{summary:`SliderMarks`}}},hideSlider:{control:{type:`boolean`},description:`Hide slider component (keeps input only)`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},addonPrefix:{control:!1,description:`Content to display before the input`,table:{type:{summary:`ReactNode`}}},addonSuffix:{control:!1,description:`Content to display after the input`,table:{type:{summary:`ReactNode`}}},onChange:{action:`changed`,description:`Callback fired when value changes`,table:{type:{summary:`(value: string) => void`}}},disabled:{control:{type:`boolean`},description:`Disable both input and slider`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},size:{control:{type:`select`},options:[`small`,`middle`,`large`],description:`Input size`,table:{type:{summary:`'small' | 'middle' | 'large'`}}}}},W=({value:e,...t})=>(0,H.jsx)(T,{initialValues:{mem:e},children:(0,H.jsx)(T.Item,{name:`mem`,children:(0,H.jsx)(B,{...t})})}),G={name:`Basic`,parameters:{docs:{description:{story:`Basic uncontrolled usage with default settings (0m to 32g range).`}}}},K={name:`FormIntegration`,parameters:{docs:{description:{story:`Controlled by Ant Design Form.Item. The component syncs with form state automatically.`}}},render:W,args:{value:`1.3g`}},q={name:`MinMaxRange`,parameters:{docs:{description:{story:`Custom min/max range. Slider shows marks at min and max positions.`}}},args:{min:`100m`,max:`45g`}},J={name:`MiBGiBUnits`,parameters:{docs:{description:{story:`Restrict units to MiB and GiB only. User can switch between these two units.`}}},args:{min:`2g`,max:`45g`,units:[`m`,`g`]}},Y={name:`GiBOnly`,parameters:{docs:{description:{story:`Restrict to GiB unit only. Useful when fractional GiB values are needed.`}}},args:{min:`0.5g`,max:`45g`,units:[`g`]}},X={name:`InvalidRange`,parameters:{docs:{description:{story:`Edge case handling when min > max. Slider is disabled and marks are hidden to prevent confusion.`}}},args:{min:`3g`,max:`1g`,units:[`m`,`g`]}},Z={name:`CustomMarks`,parameters:{docs:{description:{story:`Add custom marks to highlight important values (e.g., recommended settings, quotas).`}}},args:{min:`0g`,max:`1g`,units:[`m`,`g`],extraMarks:{.5:{style:{color:`red`},label:`0.5g`}}}},Q={name:`CustomMarksInvalidRange`,parameters:{docs:{description:{story:`Custom marks are filtered out when min > max to maintain consistent invalid state.`}}},args:{min:`3g`,max:`1g`,units:[`m`,`g`],extraMarks:{.5:{style:{color:`red`},label:`0.5g`}}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'Basic uncontrolled usage with default settings (0m to 32g range).'
      }
    }
  }
}`,...G.parameters?.docs?.source}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
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
}`,...K.parameters?.docs?.source}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
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
}`,...q.parameters?.docs?.source}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
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
}`,...J.parameters?.docs?.source}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
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
}`,...Y.parameters?.docs?.source}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
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
}`,...X.parameters?.docs?.source}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
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
}`,...Z.parameters?.docs?.source}}},Q.parameters={...Q.parameters,docs:{...Q.parameters?.docs,source:{originalSource:`{
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
}`,...Q.parameters?.docs?.source}}},De=[`Default`,`WithFormItem`,`WithMin`,`AllowOnlyMiBandGiB`,`AllowOnlyGiB`,`GreaterMinThanMax`,`ExtraMarks`,`ExtraMarksWithGreaterMinThanMax`]})))()}$();export{Y as AllowOnlyGiB,J as AllowOnlyMiBandGiB,G as Default,Z as ExtraMarks,Q as ExtraMarksWithGreaterMinThanMax,X as GreaterMinThanMax,K as WithFormItem,q as WithMin,De as __namedExportsOrder,U as default};