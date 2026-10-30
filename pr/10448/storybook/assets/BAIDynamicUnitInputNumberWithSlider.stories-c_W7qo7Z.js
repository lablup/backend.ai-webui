import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-DlPsW1c0.js";import{l as n,n as r,t as i,u as a}from"./isObject-Cu5W6UBH.js";import{a as o,n as s,o as c,t as l}from"./toString-DisgP18h.js";import{_ as u,v as d}from"./_initCloneObject-BZFXKngF.js";import{S as f,x as p}from"./_Uint8Array-BSgh8wEY.js";import{a as m,i as h,n as g,o as _,r as ee,t as v}from"./_baseGet-xGmkFoaT.js";import{i as te,r as ne}from"./omit-DR6wVUX5.js";import{n as re,t as ie}from"./BAIDynamicUnitInputNumber-Eqss6zAU.js";import{a as ae,o as y}from"./_baseEach-B9SQ-K_E.js";import{m as oe,p as se,v as ce,y as le}from"./hooks-CqTIG_8a.js";import{n as ue,t as de}from"./map-BLzs52H1.js";import{n as b,t as fe}from"./isNumber-BkvUSshz.js";import{n as pe,t as me}from"./negate-BQT8cDrf.js";import{n as he,t as ge}from"./sortBy-Cms5zVAV.js";import{t as _e}from"./jsx-runtime-MKhVqBIO.js";import{n as ve,t as ye}from"./useBAIi18n-CcDjjg8q.js";import{n as be,t as xe}from"./Form-xycEuSqv.js";import{n as Se,t as x}from"./BAIFlex-DnaoYTJ1.js";import{c as Ce,n as S,p as C}from"./helper-p-d7z67I.js";import{n as we,t as Te}from"./astryxLabel-B6l5fHO3.js";import{n as Ee,t as De}from"./Slider-Ci0YALnW.js";function Oe(e,t,n,i){if(!r(e))return e;t=m(t,e);for(var a=-1,o=t.length,s=o-1,c=e;c!=null&&++a<o;){var l=h(t[a]),d=n;if(l===`__proto__`||l===`constructor`||l===`prototype`)return e;if(a!=s){var p=c[l];d=i?i(p,l,c):void 0,d===void 0&&(d=r(p)?p:f(t[a+1])?[]:{})}u(c,l,d),c=c[l]}return e}function w(){return(w=e((()=>{d(),_(),p(),i(),ee()})))()}function ke(e,t,n){for(var r=-1,i=t.length,a={};++r<i;){var o=t[r],s=v(e,o);n(s,o)&&Oe(a,m(o,e),s)}return a}function T(){return(T=e((()=>{g(),w(),_()})))()}function Ae(e,t){if(e==null)return{};var n=o(ne(e),function(e){return[e]});return t=ae(t),ke(e,n,function(e,n){return t(e,n[0])})}function E(){return(E=e((()=>{c(),y(),T(),te()})))()}function D(e,t){return Ae(e,pe(ae(t)))}function O(){return(O=e((()=>{y(),me(),E()})))()}function je(e,t,n){return n||t==null?t=0:t&&(t=+t),A(s(e).replace(k,``),t||0)}var k,A;function j(){return(j=e((()=>{n(),l(),k=/^\s+/,A=a.parseInt})))()}var M,N,P,F;function I(){return(I=e((()=>{Ce(),Te(),ye(),se(),ce(),re(),Se(),Ee(),ge(),de(),fe(),O(),j(),M=t(),N=_e(),P=e=>he(ue(e,(e,t)=>{let n=e&&typeof e==`object`&&`label`in e?e.label:e,r=we(n??null);return{value:Number(t),label:r===``?void 0:r}}),`value`),F=({min:e=`0m`,max:t=`32g`,warn:n,units:r=[`m`,`g`],extraMarks:i,hideSlider:a,step:o=.05,addonPrefix:s,addonSuffix:c,defaultUnit:l,...u})=>{let[d,f]=oe(u,{defaultValue:void 0}),{t:p}=ve(),m=(0,M.useMemo)(()=>S(e,`g`,2),[e]),h=(0,M.useMemo)(()=>S(t,`g`,2),[t]),g=(0,M.useMemo)(()=>S(d||`0g`,`g`,2),[d]),[_,ee]=le(`first`);(0,M.useEffect)(()=>{let e=setTimeout(()=>{ee(d==null?void 0:d.toString())},0);return()=>clearTimeout(e)},[]);let v=b(m==null?void 0:m.number)&&b(h==null?void 0:h.number)&&(m==null?void 0:m.number)>(h==null?void 0:h.number),te=e=>P(D({...e},(e,t)=>{let n=parseFloat(t);return m&&h&&((m==null?void 0:m.number)>n||(h==null?void 0:h.number)<n)}));return(0,N.jsxs)(x,{direction:`row`,gap:`md`,children:[(0,N.jsx)(x,{style:{flex:2,minWidth:190},direction:`column`,align:`stretch`,children:(0,M.createElement)(ie,{...u,key:_,min:e,max:t,units:r,defaultUnit:l,value:d,onChange:e=>{f(e)},style:{width:`100%`},roundStep:o,addonPrefix:s,addonSuffix:c})}),(0,N.jsx)(x,{direction:`column`,align:`stretch`,style:{flex:3,...a&&{visibility:`hidden`,height:0}},children:(0,N.jsx)(x,{direction:`column`,align:`stretch`,children:(0,N.jsx)(De,{"aria-label":p(`comp:BAIDynamicUnitInputNumberWithSlider.Amount`),width:`100%`,max:h==null?void 0:h.number,step:o,value:v?0:(g==null?void 0:g.number)??0,disabled:v,valueDisplay:v?`none`:`tooltip`,formatValue:(e=0)=>e<1?`${(e*1024).toFixed(2)} MiB`:`${e.toFixed(2)} GiB`,onChange:t=>{m!=null&&m.number&&m.number>t?f(e):f(t<1?`${t*1024}m`:`${t}g`)},marks:te({...m&&b(m==null?void 0:m.number)&&{[m.number]:{label:m.number===0?m.number:m.number>=1?m.number+`g`:m.number*1024+`m`}},...D(i,(e,t)=>b(h==null?void 0:h.number)?je(t)>(h==null?void 0:h.number):!1),...(h==null?void 0:h.number)&&{[h.number]:{label:h.number===0?h.number:h.number>=1?C(h.number,2)+`g`:C(h.number*1024,2)+`m`}}})})})})]})}})))()}var L,Me,R,Ne,z,Pe,B,Fe,V,Ie,H,Le,U,Re,W,ze,G,Be,Ve,K,q,J,Y,X,Z,Q,$,He;function Ue(){return(Ue=e((()=>{I(),xe(),L=_e(),Be={title:`Input/BAIDynamicUnitInputNumberWithSlider`,component:F,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:"\n**BAIDynamicUnitInputNumberWithSlider** extends [BAIDynamicUnitInputNumber](/?path=/docs/input-dynamicunitinputnumber) with an integrated slider control.\n\n## Features\n- Synchronized input number and slider controls\n- Automatic unit conversion (MiB, GiB, TiB, PiB)\n- Visual feedback with slider marks at min/max values\n- Warning state with color-coded slider track\n- Custom marks for important values (e.g., resource quotas)\n- Handles invalid states (min > max) gracefully by disabling slider\n- Supports hiding slider while maintaining input functionality\n\n## Props\n| Name | Type | Default | Description |\n|------|------|---------|-------------|\n| `min` | `string` | `'0m'` | Minimum value with unit (e.g., '100m', '2g') |\n| `max` | `string` | `'32g'` | Maximum value with unit |\n| `value` | `string \\| null \\| undefined` | `'0g'` | Current value with unit |\n| `units` | `string[]` | `['m', 'g']` | Allowed units (m=MiB, g=GiB, t=TiB, p=PiB) |\n| `step` | `number` | `0.05` | Slider step size in GiB |\n| `roundStep` | `number` | - | Round input value to nearest step |\n| `warn` | `string` | - | Warning threshold value (changes slider color) |\n| `extraMarks` | `SliderMarks` | - | Additional marks on slider |\n| `hideSlider` | `boolean` | `false` | Hide slider (keeps input only) |\n| `addonPrefix` | `ReactNode` | - | Content before input |\n| `addonSuffix` | `ReactNode` | - | Content after input |\n| `onChange` | `(value: string) => void` | - | Callback when value changes |\n\nFor all other props, refer to [Ant Design InputNumber](https://ant.design/components/input-number).\n\n## Unit Abbreviations\n- `m` - MiB (Mebibyte)\n- `g` - GiB (Gibibyte)\n- `t` - TiB (Tebibyte)\n- `p` - PiB (Pebibyte)\n        "}}},argTypes:{min:{control:!1,description:`Minimum value with unit (e.g., "100m", "2g"). Requires format: number + unit (m/g/t/p)`,table:{type:{summary:`string`},defaultValue:{summary:`0m`}}},max:{control:!1,description:`Maximum value with unit. Requires format: number + unit (m/g/t/p)`,table:{type:{summary:`string`},defaultValue:{summary:`32g`}}},value:{control:!1,description:`Current value with unit (controlled). Requires format: number + unit (m/g/t/p)`,table:{type:{summary:`string | null | undefined`},defaultValue:{summary:`0g`}}},units:{control:{type:`object`},description:`Allowed units array (m=MiB, g=GiB, t=TiB, p=PiB)`,table:{type:{summary:`string[]`},defaultValue:{summary:`['m', 'g']`}}},step:{control:{type:`number`},description:`Slider step size in GiB`,table:{type:{summary:`number`},defaultValue:{summary:`0.05`}}},roundStep:{control:{type:`number`},description:`Round input value to nearest step`,table:{type:{summary:`number`}}},warn:{control:!1,description:`Warning threshold value with unit. Slider track turns warning color when value exceeds this. Requires format: number + unit (m/g/t/p)`,table:{type:{summary:`string`}}},extraMarks:{control:!1,description:`Additional slider marks (SliderMarks object mapping number positions to mark configs)`,table:{type:{summary:`SliderMarks`}}},hideSlider:{control:{type:`boolean`},description:`Hide slider component (keeps input only)`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},addonPrefix:{control:!1,description:`Content to display before the input`,table:{type:{summary:`ReactNode`}}},addonSuffix:{control:!1,description:`Content to display after the input`,table:{type:{summary:`ReactNode`}}},onChange:{action:`changed`,description:`Callback fired when value changes`,table:{type:{summary:`(value: string) => void`}}},disabled:{control:{type:`boolean`},description:`Disable both input and slider`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},size:{control:{type:`select`},options:[`small`,`middle`,`large`],description:`Input size`,table:{type:{summary:`'small' | 'middle' | 'large'`}}}}},Ve=({value:e,...t})=>(0,L.jsx)(be,{initialValues:{mem:e},children:(0,L.jsx)(be.Item,{name:`mem`,children:(0,L.jsx)(F,{...t})})}),K={name:`Basic`,parameters:{docs:{description:{story:`Basic uncontrolled usage with default settings (0m to 32g range).`}}}},q={name:`FormIntegration`,parameters:{docs:{description:{story:`Controlled by Ant Design Form.Item. The component syncs with form state automatically.`}}},render:Ve,args:{value:`1.3g`}},J={name:`MinMaxRange`,parameters:{docs:{description:{story:`Custom min/max range. Slider shows marks at min and max positions.`}}},args:{min:`100m`,max:`45g`}},Y={name:`MiBGiBUnits`,parameters:{docs:{description:{story:`Restrict units to MiB and GiB only. User can switch between these two units.`}}},args:{min:`2g`,max:`45g`,units:[`m`,`g`]}},X={name:`GiBOnly`,parameters:{docs:{description:{story:`Restrict to GiB unit only. Useful when fractional GiB values are needed.`}}},args:{min:`0.5g`,max:`45g`,units:[`g`]}},Z={name:`InvalidRange`,parameters:{docs:{description:{story:`Edge case handling when min > max. Slider is disabled and marks are hidden to prevent confusion.`}}},args:{min:`3g`,max:`1g`,units:[`m`,`g`]}},Q={name:`CustomMarks`,parameters:{docs:{description:{story:`Add custom marks to highlight important values (e.g., recommended settings, quotas).`}}},args:{min:`0g`,max:`1g`,units:[`m`,`g`],extraMarks:{.5:{style:{color:`red`},label:`0.5g`}}}},$={name:`CustomMarksInvalidRange`,parameters:{docs:{description:{story:`Custom marks are filtered out when min > max to maintain consistent invalid state.`}}},args:{min:`3g`,max:`1g`,units:[`m`,`g`],extraMarks:{.5:{style:{color:`red`},label:`0.5g`}}}},K.parameters={...K.parameters,docs:{...(Me=K.parameters)==null?void 0:Me.docs,source:{originalSource:`{
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'Basic uncontrolled usage with default settings (0m to 32g range).'
      }
    }
  }
}`,...(R=K.parameters)==null||(R=R.docs)==null?void 0:R.source}}},q.parameters={...q.parameters,docs:{...(Ne=q.parameters)==null?void 0:Ne.docs,source:{originalSource:`{
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
}`,...(z=q.parameters)==null||(z=z.docs)==null?void 0:z.source}}},J.parameters={...J.parameters,docs:{...(Pe=J.parameters)==null?void 0:Pe.docs,source:{originalSource:`{
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
}`,...(B=J.parameters)==null||(B=B.docs)==null?void 0:B.source}}},Y.parameters={...Y.parameters,docs:{...(Fe=Y.parameters)==null?void 0:Fe.docs,source:{originalSource:`{
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
}`,...(V=Y.parameters)==null||(V=V.docs)==null?void 0:V.source}}},X.parameters={...X.parameters,docs:{...(Ie=X.parameters)==null?void 0:Ie.docs,source:{originalSource:`{
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
}`,...(H=X.parameters)==null||(H=H.docs)==null?void 0:H.source}}},Z.parameters={...Z.parameters,docs:{...(Le=Z.parameters)==null?void 0:Le.docs,source:{originalSource:`{
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
}`,...(U=Z.parameters)==null||(U=U.docs)==null?void 0:U.source}}},Q.parameters={...Q.parameters,docs:{...(Re=Q.parameters)==null?void 0:Re.docs,source:{originalSource:`{
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
}`,...(W=Q.parameters)==null||(W=W.docs)==null?void 0:W.source}}},$.parameters={...$.parameters,docs:{...(ze=$.parameters)==null?void 0:ze.docs,source:{originalSource:`{
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
}`,...(G=$.parameters)==null||(G=G.docs)==null?void 0:G.source}}},He=[`Default`,`WithFormItem`,`WithMin`,`AllowOnlyMiBandGiB`,`AllowOnlyGiB`,`GreaterMinThanMax`,`ExtraMarks`,`ExtraMarksWithGreaterMinThanMax`]})))()}Ue();export{X as AllowOnlyGiB,Y as AllowOnlyMiBandGiB,K as Default,Q as ExtraMarks,$ as ExtraMarksWithGreaterMinThanMax,Z as GreaterMinThanMax,q as WithFormItem,J as WithMin,He as __namedExportsOrder,Be as default};