import{ap as D,aq as be,bO as ye,a as fe,r as y,j as d,v as U}from"./iframe-AgYdnsWO.js";import{c as T,e as N}from"./index-T8QvRQ9s.js";import{n as he}from"./astryxLabel-CwAvdpUN.js";import{u as ve}from"./useControllableValue-aOaBKhCo.js";import{a as Me}from"./useUpdatableState-mKB-_9GS.js";import{B as xe}from"./BAIDynamicUnitInputNumber-Csoabjx6.js";import{B as f}from"./BAIFlex-BZKlgDSC.js";import{i as h}from"./isNumber-CYPI2ACS.js";import{a as we}from"./Slider-B9UowcbD.js";import{b as oe}from"./_baseEach-CFTPyLaL.js";import{n as Ie}from"./negate-CgKyvzXE.js";import{a as Be,t as Se}from"./toString-DB1VzgOF.js";import{c as me,t as ke,b as Ae}from"./_baseGet-BO0uKARf.js";import{a as Ce}from"./_cloneTypedArray-hjYA3vCD.js";import{g as Re}from"./omit-Iv1DTBE6.js";import{s as Te}from"./sortBy-B-5F3VQG.js";import{m as We}from"./map-BW_ahAHs.js";import"./preload-helper-Dp1pzeXC.js";import"./filter-DMgBYCh9.js";import"./isEmpty-mhyEV8hJ.js";import"./useEventNotStable-BJ8c5TjO.js";import"./NumberStepper2-DkoLuugj.js";import"./Field-BJA70o__.js";import"./FieldStatus-Cs4CeDf0.js";import"./FormLayoutContext-CTqLJ7Sj.js";import"./useIsHydrating-CdWCaUhn.js";import"./useDevWarning-AyW48tzH.js";import"./NumberInput-Bv6bxJ63.js";import"./formControl-CplObCe_.js";import"./NumberInput-DbMjWVR8.js";import"./useInputStatusIcon-B60sC7Co.js";import"./useResolvedRequired-CsMEtzav.js";import"./fieldParts-s2HRLYo5.js";import"./useLocale-Yq-w_tfi.js";import"./inputAria-CStWn1wH.js";import"./InputClearButton-Ba9p9NNF.js";import"./inputStyles.stylex-Bztz6H8O.js";import"./isNil-CHIgUVhi.js";import"./index-lISkbZeG.js";import"./runtime-BhgYCK9T.js";import"./Selector-BndoeyR3.js";import"./selectorPresentation.stylex-CC9wyWVR.js";import"./Section-C7DuLhTK.js";import"./usePopover-BAyPNr6V.js";import"./rtlStyles-T4i24HtE.js";import"./useFocusReturnVisibility-CDZ-lrzA.js";import"./useAnnounceRenderedText-BpPAoO-W.js";import"./useHighlightedOptionScroll-Lzu3wHKv.js";import"./useMenuOverflow-CT7EVVc2.js";import"./SelectorOption-Bc4duQhZ.js";import"./Item-C09FTz4F.js";import"./computeTargetAndRel-BGwjeA1c.js";import"./composeEventHandlers-BolWE7qY.js";import"./useIndicator-BiOYZw9H.js";import"./Divider-BwHJJwfm.js";import"./find-GKF1knZT.js";import"./_baseFindIndex-Cj99RmFE.js";import"./toInteger-BDOKUlyy.js";import"./toFinite-Be1XW9Go.js";import"./toNumber-BNmUAWeX.js";import"./_trimmedEndIndex-DuQxD0U0.js";import"./isSymbol-BaHW-TGa.js";import"./_baseClamp-DVUOCJN_.js";import"./isRtlElement-B2-7SF8s.js";import"./get-CvcWcE-z.js";import"./identity-DKeuBCMA.js";import"./_baseAssignValue-CFxYfnnA.js";import"./_defineProperty-Dr1EuYcm.js";import"./_arrayEach-DpGxo2Of.js";import"./_baseSlice-F8doVSIJ.js";import"./_baseFlatten-KZm-oixe.js";import"./_overRest-CRXp84wa.js";import"./_baseRest-CbVPaKr0.js";import"./_isIterateeCall-CjsmSHuf.js";function Fe(n,e,m,s){if(!D(n))return n;e=me(e,n);for(var i=-1,p=e.length,l=p-1,o=n;o!=null&&++i<p;){var u=ke(e[i]),c=m;if(u==="__proto__"||u==="constructor"||u==="prototype")return n;if(i!=l){var b=o[u];c=void 0,c===void 0&&(c=D(b)?b:be(e[i+1])?[]:{})}Ce(o,u,c),o=o[u]}return n}function De(n,e,m){for(var s=-1,i=e.length,p={};++s<i;){var l=e[s],o=Ae(n,l);m(o,l)&&Fe(p,me(l,n),o)}return p}function Ue(n,e){if(n==null)return{};var m=Be(Re(n),function(s){return[s]});return e=oe(e),De(n,m,function(s,i){return e(s,i[0])})}function E(n,e){return Ue(n,Ie(oe(e)))}var Ne=/^\s+/,Ee=ye.parseInt;function Oe(n,e,m){return e==null?e=0:e&&(e=+e),Ee(Se(n).replace(Ne,""),e||0)}const Pe=n=>Te(We(n,(e,m)=>{const s=e&&typeof e=="object"&&"label"in e?e.label:e,i=he(s??null);return{value:Number(m),label:i===""?void 0:i}}),"value"),le=({min:n="0m",max:e="32g",warn:m,units:s=["m","g"],extraMarks:i,hideSlider:p,step:l=.05,addonPrefix:o,addonSuffix:u,defaultUnit:c,...b})=>{const[g,A]=ve(b,{defaultValue:void 0}),{t:ue}=fe(),r=y.useMemo(()=>T(n,"g",2),[n]),t=y.useMemo(()=>T(e,"g",2),[e]),C=y.useMemo(()=>T(g||"0g","g",2),[g]),[de,pe]=Me("first");y.useEffect(()=>{const a=setTimeout(()=>{pe(g==null?void 0:g.toString())},0);return()=>clearTimeout(a)},[]);const R=h(r==null?void 0:r.number)&&h(t==null?void 0:t.number)&&(r==null?void 0:r.number)>(t==null?void 0:t.number),ce=a=>Pe(E({...a},(W,ge)=>{const F=parseFloat(ge);return r&&t&&((r==null?void 0:r.number)>F||(t==null?void 0:t.number)<F)}));return d.jsxs(f,{direction:"row",gap:"md",children:[d.jsx(f,{style:{flex:2,minWidth:190},direction:"column",align:"stretch",children:y.createElement(xe,{...b,key:de,min:n,max:e,units:s,defaultUnit:c,value:g,onChange:a=>{A(a)},style:{width:"100%"},roundStep:l,addonPrefix:o,addonSuffix:u})}),d.jsx(f,{direction:"column",align:"stretch",style:{flex:3,...p&&{visibility:"hidden",height:0}},children:d.jsx(f,{direction:"column",align:"stretch",children:d.jsx(we,{"aria-label":ue("comp:BAIDynamicUnitInputNumberWithSlider.Amount"),width:"100%",max:t==null?void 0:t.number,step:l,value:R?0:(C==null?void 0:C.number)??0,disabled:R,valueDisplay:R?"none":"tooltip",formatValue:(a=0)=>a<1?`${(a*1024).toFixed(2)} MiB`:`${a.toFixed(2)} GiB`,onChange:a=>{r!=null&&r.number&&r.number>a?A(n):A(a<1?`${a*1024}m`:`${a}g`)},marks:ce({...r&&h(r==null?void 0:r.number)&&{[r.number]:{label:r.number===0?r.number:r.number>=1?r.number+"g":r.number*1024+"m"}},...E(i,(a,W)=>h(t==null?void 0:t.number)?Oe(W)>(t==null?void 0:t.number):!1),...(t==null?void 0:t.number)&&{[t.number]:{label:t.number===0?t.number:t.number>=1?N(t.number,2)+"g":N(t.number*1024,2)+"m"}}})})})})]})},on={title:"Input/BAIDynamicUnitInputNumberWithSlider",component:le,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:"\n**BAIDynamicUnitInputNumberWithSlider** extends [BAIDynamicUnitInputNumber](/?path=/docs/input-dynamicunitinputnumber) with an integrated slider control.\n\n## Features\n- Synchronized input number and slider controls\n- Automatic unit conversion (MiB, GiB, TiB, PiB)\n- Visual feedback with slider marks at min/max values\n- Warning state with color-coded slider track\n- Custom marks for important values (e.g., resource quotas)\n- Handles invalid states (min > max) gracefully by disabling slider\n- Supports hiding slider while maintaining input functionality\n\n## Props\n| Name | Type | Default | Description |\n|------|------|---------|-------------|\n| `min` | `string` | `'0m'` | Minimum value with unit (e.g., '100m', '2g') |\n| `max` | `string` | `'32g'` | Maximum value with unit |\n| `value` | `string \\| null \\| undefined` | `'0g'` | Current value with unit |\n| `units` | `string[]` | `['m', 'g']` | Allowed units (m=MiB, g=GiB, t=TiB, p=PiB) |\n| `step` | `number` | `0.05` | Slider step size in GiB |\n| `roundStep` | `number` | - | Round input value to nearest step |\n| `warn` | `string` | - | Warning threshold value (changes slider color) |\n| `extraMarks` | `SliderMarks` | - | Additional marks on slider |\n| `hideSlider` | `boolean` | `false` | Hide slider (keeps input only) |\n| `addonPrefix` | `ReactNode` | - | Content before input |\n| `addonSuffix` | `ReactNode` | - | Content after input |\n| `onChange` | `(value: string) => void` | - | Callback when value changes |\n\nFor all other props, refer to [Ant Design InputNumber](https://ant.design/components/input-number).\n\n## Unit Abbreviations\n- `m` - MiB (Mebibyte)\n- `g` - GiB (Gibibyte)\n- `t` - TiB (Tebibyte)\n- `p` - PiB (Pebibyte)\n        "}}},argTypes:{min:{control:!1,description:'Minimum value with unit (e.g., "100m", "2g"). Requires format: number + unit (m/g/t/p)',table:{type:{summary:"string"},defaultValue:{summary:"0m"}}},max:{control:!1,description:"Maximum value with unit. Requires format: number + unit (m/g/t/p)",table:{type:{summary:"string"},defaultValue:{summary:"32g"}}},value:{control:!1,description:"Current value with unit (controlled). Requires format: number + unit (m/g/t/p)",table:{type:{summary:"string | null | undefined"},defaultValue:{summary:"0g"}}},units:{control:{type:"object"},description:"Allowed units array (m=MiB, g=GiB, t=TiB, p=PiB)",table:{type:{summary:"string[]"},defaultValue:{summary:"['m', 'g']"}}},step:{control:{type:"number"},description:"Slider step size in GiB",table:{type:{summary:"number"},defaultValue:{summary:"0.05"}}},roundStep:{control:{type:"number"},description:"Round input value to nearest step",table:{type:{summary:"number"}}},warn:{control:!1,description:"Warning threshold value with unit. Slider track turns warning color when value exceeds this. Requires format: number + unit (m/g/t/p)",table:{type:{summary:"string"}}},extraMarks:{control:!1,description:"Additional slider marks (SliderMarks object mapping number positions to mark configs)",table:{type:{summary:"SliderMarks"}}},hideSlider:{control:{type:"boolean"},description:"Hide slider component (keeps input only)",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},addonPrefix:{control:!1,description:"Content to display before the input",table:{type:{summary:"ReactNode"}}},addonSuffix:{control:!1,description:"Content to display after the input",table:{type:{summary:"ReactNode"}}},onChange:{action:"changed",description:"Callback fired when value changes",table:{type:{summary:"(value: string) => void"}}},disabled:{control:{type:"boolean"},description:"Disable both input and slider",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},size:{control:{type:"select"},options:["small","middle","large"],description:"Input size",table:{type:{summary:"'small' | 'middle' | 'large'"}}}}},_e=({value:n,...e})=>d.jsx(U,{initialValues:{mem:n},children:d.jsx(U.Item,{name:"mem",children:d.jsx(le,{...e})})}),v={name:"Basic",parameters:{docs:{description:{story:"Basic uncontrolled usage with default settings (0m to 32g range)."}}}},M={name:"FormIntegration",parameters:{docs:{description:{story:"Controlled by Ant Design Form.Item. The component syncs with form state automatically."}}},render:_e,args:{value:"1.3g"}},x={name:"MinMaxRange",parameters:{docs:{description:{story:"Custom min/max range. Slider shows marks at min and max positions."}}},args:{min:"100m",max:"45g"}},w={name:"MiBGiBUnits",parameters:{docs:{description:{story:"Restrict units to MiB and GiB only. User can switch between these two units."}}},args:{min:"2g",max:"45g",units:["m","g"]}},I={name:"GiBOnly",parameters:{docs:{description:{story:"Restrict to GiB unit only. Useful when fractional GiB values are needed."}}},args:{min:"0.5g",max:"45g",units:["g"]}},B={name:"InvalidRange",parameters:{docs:{description:{story:"Edge case handling when min > max. Slider is disabled and marks are hidden to prevent confusion."}}},args:{min:"3g",max:"1g",units:["m","g"]}},S={name:"CustomMarks",parameters:{docs:{description:{story:"Add custom marks to highlight important values (e.g., recommended settings, quotas)."}}},args:{min:"0g",max:"1g",units:["m","g"],extraMarks:{.5:{style:{color:"red"},label:"0.5g"}}}},k={name:"CustomMarksInvalidRange",parameters:{docs:{description:{story:"Custom marks are filtered out when min > max to maintain consistent invalid state."}}},args:{min:"3g",max:"1g",units:["m","g"],extraMarks:{.5:{style:{color:"red"},label:"0.5g"}}}};var O,P,_;v.parameters={...v.parameters,docs:{...(O=v.parameters)==null?void 0:O.docs,source:{originalSource:`{
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'Basic uncontrolled usage with default settings (0m to 32g range).'
      }
    }
  }
}`,...(_=(P=v.parameters)==null?void 0:P.docs)==null?void 0:_.source}}};var q,z,V;M.parameters={...M.parameters,docs:{...(q=M.parameters)==null?void 0:q.docs,source:{originalSource:`{
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
}`,...(V=(z=M.parameters)==null?void 0:z.docs)==null?void 0:V.source}}};var j,G,$;x.parameters={...x.parameters,docs:{...(j=x.parameters)==null?void 0:j.docs,source:{originalSource:`{
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
}`,...($=(G=x.parameters)==null?void 0:G.docs)==null?void 0:$.source}}};var H,K,L;w.parameters={...w.parameters,docs:{...(H=w.parameters)==null?void 0:H.docs,source:{originalSource:`{
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
}`,...(L=(K=w.parameters)==null?void 0:K.docs)==null?void 0:L.source}}};var Z,J,Q;I.parameters={...I.parameters,docs:{...(Z=I.parameters)==null?void 0:Z.docs,source:{originalSource:`{
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
}`,...(Q=(J=I.parameters)==null?void 0:J.docs)==null?void 0:Q.source}}};var X,Y,ee;B.parameters={...B.parameters,docs:{...(X=B.parameters)==null?void 0:X.docs,source:{originalSource:`{
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
}`,...(ee=(Y=B.parameters)==null?void 0:Y.docs)==null?void 0:ee.source}}};var te,ne,re;S.parameters={...S.parameters,docs:{...(te=S.parameters)==null?void 0:te.docs,source:{originalSource:`{
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
}`,...(re=(ne=S.parameters)==null?void 0:ne.docs)==null?void 0:re.source}}};var ae,ie,se;k.parameters={...k.parameters,docs:{...(ae=k.parameters)==null?void 0:ae.docs,source:{originalSource:`{
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
}`,...(se=(ie=k.parameters)==null?void 0:ie.docs)==null?void 0:se.source}}};const mn=["Default","WithFormItem","WithMin","AllowOnlyMiBandGiB","AllowOnlyGiB","GreaterMinThanMax","ExtraMarks","ExtraMarksWithGreaterMinThanMax"];export{I as AllowOnlyGiB,w as AllowOnlyMiBandGiB,v as Default,S as ExtraMarks,k as ExtraMarksWithGreaterMinThanMax,B as GreaterMinThanMax,M as WithFormItem,x as WithMin,mn as __namedExportsOrder,on as default};
