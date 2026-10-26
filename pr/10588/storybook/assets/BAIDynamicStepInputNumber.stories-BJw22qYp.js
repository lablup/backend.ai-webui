import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-D0Ex1IVc.js";import{t as n}from"./jsx-runtime-MKhVqBIO.js";import{n as r,t as i}from"./useBAIi18n-Biey1teG.js";import{t as a}from"./compiler-runtime-CdReTaax.js";import{n as o,t as s}from"./NumberInput-vk13t-rV.js";import{n as c,t as l}from"./BAIFlex-BOFoS5KY.js";import{n as u,t as d}from"./astryxLabel-3zAUsN4G.js";import{n as f,o as p,r as m,s as h,t as g}from"./NumberStepper2-0Xi42siG.js";function _({steps:e,value:t,defaultValue:n,onChange:r,min:i,max:a,units:o,label:c,isLabelHidden:l=!1,placeholder:u,isDisabled:d,increaseLabel:f,decreaseLabel:h,className:_,style:b}){let[x,S]=(0,v.useState)(n??e[0]??0),C=t!==void 0,w=C?t:x,T=e=>{C||S(e),r?.(e)},E=t=>{let n=m(e,w,t);if(n<0||n>=e.length)return;let r=[...e].sort((e,t)=>e-t)[n]??w;i!==void 0&&r<i?r=i:a!==void 0&&r>a&&(r=a),T(r)};return(0,y.jsxs)(p,{label:c,isLabelHidden:l,isDisabled:d,className:_,style:b,children:[(0,y.jsx)(s,{label:c,isLabelHidden:!0,value:w,onChange:e=>T(e??0),onKeyDown:e=>{d||(e.key===`ArrowUp`||e.key===`ArrowDown`)&&(e.preventDefault(),E(e.key===`ArrowUp`?`up`:`down`))},min:i,max:a,units:o,placeholder:u,isDisabled:d,width:`100%`}),(0,y.jsx)(g,{onStep:E,isDisabled:d,increaseLabel:f,decreaseLabel:h})]})}var v,y;function b(){return(b=e((()=>{f(),v=t(),y=n(),h(),o(),_.displayName=`StepNumberInput`})))()}var x,S,C,w;function T(){return(T=e((()=>{x=a(),d(),i(),b(),S=n(),C=[0,.0625,.125,.25,.5,.75,1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536],w=e=>{"use memo";let t=(0,x.c)(20),{dynamicSteps:n,value:i,onChange:a,min:o,max:s,placeholder:c,disabled:l,addonAfter:d,label:f,isLabelHidden:p,increaseLabel:m,decreaseLabel:h,defaultValue:g}=e,v=n===void 0?C:n,{t:y}=r(),b;t[0]===d?b=t[1]:(b=d===void 0?void 0:u(d),t[0]=d,t[1]=b);let w;t[2]!==f||t[3]!==c||t[4]!==y?(w=f??c??y(`general.Select`),t[2]=f,t[3]=c,t[4]=y,t[5]=w):w=t[5];let T=p??f===void 0,E;return t[6]!==h||t[7]!==g||t[8]!==l||t[9]!==v||t[10]!==m||t[11]!==s||t[12]!==o||t[13]!==a||t[14]!==c||t[15]!==b||t[16]!==w||t[17]!==T||t[18]!==i?(E=(0,S.jsx)(_,{steps:v,value:i,defaultValue:g,onChange:a,min:o,max:s,placeholder:c,isDisabled:l,units:b,label:w,isLabelHidden:T,increaseLabel:m,decreaseLabel:h}),t[6]=h,t[7]=g,t[8]=l,t[9]=v,t[10]=m,t[11]=s,t[12]=o,t[13]=a,t[14]=c,t[15]=b,t[16]=w,t[17]=T,t[18]=i,t[19]=E):E=t[19],E}})))()}var E,D,O,k,A,j,M,N,P,F,I;function L(){return(L=e((()=>{T(),c(),E=t(),D=n(),O={title:`Input/BAIDynamicStepInputNumber`,component:w,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:`
**BAIDynamicStepInputNumber** extends [Ant Design InputNumber](https://ant.design/components/input-number) with dynamic step functionality.

## BAI-Specific Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`dynamicSteps\` | \`number[]\` | \`[0, 0.0625, 0.125, 0.25, 0.5, 0.75, 1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536]\` | Array of step values for arrow up/down navigation |

## Features
- **Dynamic Stepping**: Use arrow up/down to navigate through custom step values instead of fixed increments
- **Boundary Respect**: Automatically clips to min/max values when stepping
- **Resource Allocation**: Ideal for CPU cores, memory (GiB), GPU counts with non-linear increments

## Usage
\`\`\`tsx
<BAIDynamicStepInputNumber
  value={value}
  onChange={setValue}
  dynamicSteps={[0, 0.5, 1, 2, 4, 8, 16, 32]}
  min={0}
  max={32}
/>
\`\`\`

For all other props, refer to [Ant Design InputNumber](https://ant.design/components/input-number).
        `}}},argTypes:{dynamicSteps:{control:{type:`object`},description:`Array of step values to use when clicking arrow up/down buttons`,table:{type:{summary:`number[]`},defaultValue:{summary:`[0, 0.0625, 0.125, 0.25, 0.5, 0.75, 1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536]`}}},value:{control:{type:`number`},description:`Current value`,table:{type:{summary:`number`}}},onChange:{action:`changed`,description:`Callback when value changes`},min:{control:{type:`number`},description:`Minimum value`,table:{type:{summary:`number`}}},max:{control:{type:`number`},description:`Maximum value`,table:{type:{summary:`number`}}},disabled:{control:{type:`boolean`},description:`Whether the input is disabled`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},placeholder:{control:{type:`text`},description:`Placeholder text`,table:{type:{summary:`string`}}}}},k={name:`Basic`,parameters:{docs:{description:{story:`Basic usage demonstrating dynamic stepping. Click arrow up/down buttons to navigate through predefined step values: 0, 0.0625, 0.125, 0.25, 0.5, 0.75, 1, 2, 4, 8, 16, etc.`}}},render:()=>{let[e,t]=(0,E.useState)(1);return(0,D.jsxs)(l,{direction:`column`,gap:`md`,children:[(0,D.jsx)(w,{value:e,onChange:e=>t(e),placeholder:`Enter value or use arrows`}),(0,D.jsxs)(`div`,{children:[`Current value: `,e]})]})}},A={name:`CPUCoreAllocation`,parameters:{docs:{description:{story:`Example for CPU core allocation with custom steps: 0, 0.5, 1, 2, 4, 8, 16, 32. Useful for fractional CPU allocation.`}}},render:()=>{let[e,t]=(0,E.useState)(1);return(0,D.jsxs)(l,{direction:`column`,gap:`md`,children:[(0,D.jsx)(w,{value:e,onChange:e=>t(e),dynamicSteps:[0,.5,1,2,4,8,16,32],min:0,max:32,placeholder:`CPU cores`}),(0,D.jsxs)(`div`,{children:[`Selected CPU cores: `,e]})]})}},j={name:`MemoryAllocation`,parameters:{docs:{description:{story:`Example for memory (GiB) allocation with custom steps: 0, 0.5, 1, 2, 4, 8, 16, 32, 64, 128, 256. Ideal for exponential resource scaling.`}}},render:()=>{let[e,t]=(0,E.useState)(4);return(0,D.jsxs)(l,{direction:`column`,gap:`md`,children:[(0,D.jsx)(w,{value:e,onChange:e=>t(e),dynamicSteps:[0,.5,1,2,4,8,16,32,64,128,256],min:0,max:256,placeholder:`Memory (GiB)`,addonAfter:`GiB`}),(0,D.jsxs)(`div`,{children:[`Selected memory: `,e,` GiB`]})]})}},M={name:`GPUAllocation`,parameters:{docs:{description:{story:`Example for GPU count allocation with custom steps: 0, 1, 2, 4, 8. Useful for discrete GPU allocation.`}}},render:()=>{let[e,t]=(0,E.useState)(1);return(0,D.jsxs)(l,{direction:`column`,gap:`md`,children:[(0,D.jsx)(w,{value:e,onChange:e=>t(e),dynamicSteps:[0,1,2,4,8],min:0,max:8,placeholder:`GPU count`}),(0,D.jsxs)(`div`,{children:[`Selected GPUs: `,e]})]})}},N={name:`BoundaryRespect`,parameters:{docs:{description:{story:`Demonstrates how dynamic steps respect min/max boundaries. Try stepping beyond boundaries to see automatic clipping.`}}},render:()=>{let[e,t]=(0,E.useState)(4);return(0,D.jsxs)(l,{direction:`column`,gap:`md`,children:[(0,D.jsx)(w,{value:e,onChange:e=>t(e),dynamicSteps:[0,1,2,4,8,16,32,64],min:2,max:32,placeholder:`Value between 2 and 32`}),(0,D.jsxs)(`div`,{children:[`Current value: `,e,` (min: 2, max: 32)`]})]})}},P={name:`DisabledState`,parameters:{docs:{description:{story:`Shows the component in a disabled state.`}}},render:()=>(0,D.jsx)(w,{value:8,onChange:()=>{},disabled:!0,placeholder:`Disabled input`})},F={name:`StepConfigurations`,parameters:{docs:{description:{story:`Compares different dynamic step configurations side by side. Each has different step values tailored for specific use cases.`}}},render:()=>{let[e,t]=(0,E.useState)(1),[n,r]=(0,E.useState)(4),[i,a]=(0,E.useState)(1);return(0,D.jsxs)(l,{direction:`column`,gap:`lg`,children:[(0,D.jsxs)(l,{direction:`column`,gap:`sm`,children:[(0,D.jsx)(`strong`,{children:`CPU Cores (fractional)`}),(0,D.jsx)(w,{value:e,onChange:e=>t(e),dynamicSteps:[0,.5,1,2,4,8,16],min:0,max:16,placeholder:`CPU`}),(0,D.jsxs)(`div`,{children:[`Value: `,e]})]}),(0,D.jsxs)(l,{direction:`column`,gap:`sm`,children:[(0,D.jsx)(`strong`,{children:`Memory GiB (exponential)`}),(0,D.jsx)(w,{value:n,onChange:e=>r(e),dynamicSteps:[0,1,2,4,8,16,32,64,128],min:0,max:128,placeholder:`Memory`,addonAfter:`GiB`}),(0,D.jsxs)(`div`,{children:[`Value: `,n,` GiB`]})]}),(0,D.jsxs)(l,{direction:`column`,gap:`sm`,children:[(0,D.jsx)(`strong`,{children:`GPU Count (discrete)`}),(0,D.jsx)(w,{value:i,onChange:e=>a(e),dynamicSteps:[0,1,2,4,8],min:0,max:8,placeholder:`GPU`}),(0,D.jsxs)(`div`,{children:[`Value: `,i]})]})]})}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'Basic usage demonstrating dynamic stepping. Click arrow up/down buttons to navigate through predefined step values: 0, 0.0625, 0.125, 0.25, 0.5, 0.75, 1, 2, 4, 8, 16, etc.'
      }
    }
  },
  render: () => {
    const [value, setValue] = useState(1);
    return <BAIFlex direction="column" gap="md">
        <BAIDynamicStepInputNumber value={value} onChange={newValue => setValue(newValue)} placeholder="Enter value or use arrows" />
        <div>Current value: {value}</div>
      </BAIFlex>;
  }
}`,...k.parameters?.docs?.source},description:{story:`Basic usage with default dynamic steps.
Try clicking arrow up/down buttons to see non-linear stepping.`,...k.parameters?.docs?.description}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  name: 'CPUCoreAllocation',
  parameters: {
    docs: {
      description: {
        story: 'Example for CPU core allocation with custom steps: 0, 0.5, 1, 2, 4, 8, 16, 32. Useful for fractional CPU allocation.'
      }
    }
  },
  render: () => {
    const [value, setValue] = useState(1);
    return <BAIFlex direction="column" gap="md">
        <BAIDynamicStepInputNumber value={value} onChange={newValue => setValue(newValue)} dynamicSteps={[0, 0.5, 1, 2, 4, 8, 16, 32]} min={0} max={32} placeholder="CPU cores" />
        <div>Selected CPU cores: {value}</div>
      </BAIFlex>;
  }
}`,...A.parameters?.docs?.source},description:{story:`Custom step values for CPU core allocation.`,...A.parameters?.docs?.description}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  name: 'MemoryAllocation',
  parameters: {
    docs: {
      description: {
        story: 'Example for memory (GiB) allocation with custom steps: 0, 0.5, 1, 2, 4, 8, 16, 32, 64, 128, 256. Ideal for exponential resource scaling.'
      }
    }
  },
  render: () => {
    const [value, setValue] = useState(4);
    return <BAIFlex direction="column" gap="md">
        <BAIDynamicStepInputNumber value={value} onChange={newValue => setValue(newValue)} dynamicSteps={[0, 0.5, 1, 2, 4, 8, 16, 32, 64, 128, 256]} min={0} max={256} placeholder="Memory (GiB)" addonAfter="GiB" />
        <div>Selected memory: {value} GiB</div>
      </BAIFlex>;
  }
}`,...j.parameters?.docs?.source},description:{story:`Custom step values for memory (GiB) allocation.`,...j.parameters?.docs?.description}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  name: 'GPUAllocation',
  parameters: {
    docs: {
      description: {
        story: 'Example for GPU count allocation with custom steps: 0, 1, 2, 4, 8. Useful for discrete GPU allocation.'
      }
    }
  },
  render: () => {
    const [value, setValue] = useState(1);
    return <BAIFlex direction="column" gap="md">
        <BAIDynamicStepInputNumber value={value} onChange={newValue => setValue(newValue)} dynamicSteps={[0, 1, 2, 4, 8]} min={0} max={8} placeholder="GPU count" />
        <div>Selected GPUs: {value}</div>
      </BAIFlex>;
  }
}`,...M.parameters?.docs?.source},description:{story:`Custom step values for GPU count allocation.`,...M.parameters?.docs?.description}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  name: 'BoundaryRespect',
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates how dynamic steps respect min/max boundaries. Try stepping beyond boundaries to see automatic clipping.'
      }
    }
  },
  render: () => {
    const [value, setValue] = useState(4);
    return <BAIFlex direction="column" gap="md">
        <BAIDynamicStepInputNumber value={value} onChange={newValue => setValue(newValue)} dynamicSteps={[0, 1, 2, 4, 8, 16, 32, 64]} min={2} max={32} placeholder="Value between 2 and 32" />
        <div>Current value: {value} (min: 2, max: 32)</div>
      </BAIFlex>;
  }
}`,...N.parameters?.docs?.source},description:{story:`Input with min/max boundaries.
Steps will respect boundaries when clicking arrows.`,...N.parameters?.docs?.description}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  name: 'DisabledState',
  parameters: {
    docs: {
      description: {
        story: 'Shows the component in a disabled state.'
      }
    }
  },
  render: () => {
    return <BAIDynamicStepInputNumber value={8} onChange={() => {}} disabled placeholder="Disabled input" />;
  }
}`,...P.parameters?.docs?.source},description:{story:`Disabled state.`,...P.parameters?.docs?.description}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  name: 'StepConfigurations',
  parameters: {
    docs: {
      description: {
        story: 'Compares different dynamic step configurations side by side. Each has different step values tailored for specific use cases.'
      }
    }
  },
  render: () => {
    const [cpuValue, setCpuValue] = useState(1);
    const [memValue, setMemValue] = useState(4);
    const [gpuValue, setGpuValue] = useState(1);
    return <BAIFlex direction="column" gap="lg">
        <BAIFlex direction="column" gap="sm">
          <strong>CPU Cores (fractional)</strong>
          <BAIDynamicStepInputNumber value={cpuValue} onChange={v => setCpuValue(v)} dynamicSteps={[0, 0.5, 1, 2, 4, 8, 16]} min={0} max={16} placeholder="CPU" />
          <div>Value: {cpuValue}</div>
        </BAIFlex>

        <BAIFlex direction="column" gap="sm">
          <strong>Memory GiB (exponential)</strong>
          <BAIDynamicStepInputNumber value={memValue} onChange={v => setMemValue(v)} dynamicSteps={[0, 1, 2, 4, 8, 16, 32, 64, 128]} min={0} max={128} placeholder="Memory" addonAfter="GiB" />
          <div>Value: {memValue} GiB</div>
        </BAIFlex>

        <BAIFlex direction="column" gap="sm">
          <strong>GPU Count (discrete)</strong>
          <BAIDynamicStepInputNumber value={gpuValue} onChange={v => setGpuValue(v)} dynamicSteps={[0, 1, 2, 4, 8]} min={0} max={8} placeholder="GPU" />
          <div>Value: {gpuValue}</div>
        </BAIFlex>
      </BAIFlex>;
  }
}`,...F.parameters?.docs?.source},description:{story:`Comparison of different step configurations.`,...F.parameters?.docs?.description}}},I=[`Default`,`CPUCores`,`MemoryGiB`,`GPUCount`,`WithMinMax`,`Disabled`,`StepComparison`]})))()}L();export{A as CPUCores,k as Default,P as Disabled,M as GPUCount,j as MemoryGiB,F as StepComparison,N as WithMinMax,I as __namedExportsOrder,O as default};