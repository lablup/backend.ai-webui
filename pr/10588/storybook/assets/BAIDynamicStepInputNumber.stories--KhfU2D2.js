import{n as e}from"./rolldown-runtime-2s6bX4vc.js";import{n as t,t as n}from"./useBAIi18n-BoXCk5K0.js";import{n as r,t as i}from"./BAIFlex-CAz1t6J5.js";import{n as a,t as o}from"./astryxLabel-D4afFvt3.js";import{useState as s}from"react";import{jsx as c,jsxs as l}from"react/jsx-runtime";import{c as u}from"react/compiler-runtime";import{StepNumberInput as d}from"@lablup/ui-common/components/StepNumberInput";var f,p;function m(){return(m=e((()=>{o(),n(),f=[0,.0625,.125,.25,.5,.75,1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536],p=e=>{"use memo";let n=u(20),{dynamicSteps:r,value:i,onChange:o,min:s,max:l,placeholder:p,disabled:m,addonAfter:h,label:g,isLabelHidden:_,increaseLabel:v,decreaseLabel:y,defaultValue:b}=e,x=r===void 0?f:r,{t:S}=t(),C;n[0]===h?C=n[1]:(C=h===void 0?void 0:a(h),n[0]=h,n[1]=C);let w;n[2]!==g||n[3]!==p||n[4]!==S?(w=g??p??S(`general.Select`),n[2]=g,n[3]=p,n[4]=S,n[5]=w):w=n[5];let T=_??g===void 0,E;return n[6]!==y||n[7]!==b||n[8]!==m||n[9]!==x||n[10]!==v||n[11]!==l||n[12]!==s||n[13]!==o||n[14]!==p||n[15]!==C||n[16]!==w||n[17]!==T||n[18]!==i?(E=c(d,{steps:x,value:i,defaultValue:b,onChange:o,min:s,max:l,placeholder:p,isDisabled:m,units:C,label:w,isLabelHidden:T,increaseLabel:v,decreaseLabel:y}),n[6]=y,n[7]=b,n[8]=m,n[9]=x,n[10]=v,n[11]=l,n[12]=s,n[13]=o,n[14]=p,n[15]=C,n[16]=w,n[17]=T,n[18]=i,n[19]=E):E=n[19],E}})))()}var h,g,_,v,y,b,x,S,C;function w(){return(w=e((()=>{m(),r(),h={title:`Input/BAIDynamicStepInputNumber`,component:p,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:`
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
        `}}},argTypes:{dynamicSteps:{control:{type:`object`},description:`Array of step values to use when clicking arrow up/down buttons`,table:{type:{summary:`number[]`},defaultValue:{summary:`[0, 0.0625, 0.125, 0.25, 0.5, 0.75, 1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536]`}}},value:{control:{type:`number`},description:`Current value`,table:{type:{summary:`number`}}},onChange:{action:`changed`,description:`Callback when value changes`},min:{control:{type:`number`},description:`Minimum value`,table:{type:{summary:`number`}}},max:{control:{type:`number`},description:`Maximum value`,table:{type:{summary:`number`}}},disabled:{control:{type:`boolean`},description:`Whether the input is disabled`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},placeholder:{control:{type:`text`},description:`Placeholder text`,table:{type:{summary:`string`}}}}},g={name:`Basic`,parameters:{docs:{description:{story:`Basic usage demonstrating dynamic stepping. Click arrow up/down buttons to navigate through predefined step values: 0, 0.0625, 0.125, 0.25, 0.5, 0.75, 1, 2, 4, 8, 16, etc.`}}},render:()=>{let[e,t]=s(1);return l(i,{direction:`column`,gap:`md`,children:[c(p,{value:e,onChange:e=>t(e),placeholder:`Enter value or use arrows`}),l(`div`,{children:[`Current value: `,e]})]})}},_={name:`CPUCoreAllocation`,parameters:{docs:{description:{story:`Example for CPU core allocation with custom steps: 0, 0.5, 1, 2, 4, 8, 16, 32. Useful for fractional CPU allocation.`}}},render:()=>{let[e,t]=s(1);return l(i,{direction:`column`,gap:`md`,children:[c(p,{value:e,onChange:e=>t(e),dynamicSteps:[0,.5,1,2,4,8,16,32],min:0,max:32,placeholder:`CPU cores`}),l(`div`,{children:[`Selected CPU cores: `,e]})]})}},v={name:`MemoryAllocation`,parameters:{docs:{description:{story:`Example for memory (GiB) allocation with custom steps: 0, 0.5, 1, 2, 4, 8, 16, 32, 64, 128, 256. Ideal for exponential resource scaling.`}}},render:()=>{let[e,t]=s(4);return l(i,{direction:`column`,gap:`md`,children:[c(p,{value:e,onChange:e=>t(e),dynamicSteps:[0,.5,1,2,4,8,16,32,64,128,256],min:0,max:256,placeholder:`Memory (GiB)`,addonAfter:`GiB`}),l(`div`,{children:[`Selected memory: `,e,` GiB`]})]})}},y={name:`GPUAllocation`,parameters:{docs:{description:{story:`Example for GPU count allocation with custom steps: 0, 1, 2, 4, 8. Useful for discrete GPU allocation.`}}},render:()=>{let[e,t]=s(1);return l(i,{direction:`column`,gap:`md`,children:[c(p,{value:e,onChange:e=>t(e),dynamicSteps:[0,1,2,4,8],min:0,max:8,placeholder:`GPU count`}),l(`div`,{children:[`Selected GPUs: `,e]})]})}},b={name:`BoundaryRespect`,parameters:{docs:{description:{story:`Demonstrates how dynamic steps respect min/max boundaries. Try stepping beyond boundaries to see automatic clipping.`}}},render:()=>{let[e,t]=s(4);return l(i,{direction:`column`,gap:`md`,children:[c(p,{value:e,onChange:e=>t(e),dynamicSteps:[0,1,2,4,8,16,32,64],min:2,max:32,placeholder:`Value between 2 and 32`}),l(`div`,{children:[`Current value: `,e,` (min: 2, max: 32)`]})]})}},x={name:`DisabledState`,parameters:{docs:{description:{story:`Shows the component in a disabled state.`}}},render:()=>c(p,{value:8,onChange:()=>{},disabled:!0,placeholder:`Disabled input`})},S={name:`StepConfigurations`,parameters:{docs:{description:{story:`Compares different dynamic step configurations side by side. Each has different step values tailored for specific use cases.`}}},render:()=>{let[e,t]=s(1),[n,r]=s(4),[a,o]=s(1);return l(i,{direction:`column`,gap:`lg`,children:[l(i,{direction:`column`,gap:`sm`,children:[c(`strong`,{children:`CPU Cores (fractional)`}),c(p,{value:e,onChange:e=>t(e),dynamicSteps:[0,.5,1,2,4,8,16],min:0,max:16,placeholder:`CPU`}),l(`div`,{children:[`Value: `,e]})]}),l(i,{direction:`column`,gap:`sm`,children:[c(`strong`,{children:`Memory GiB (exponential)`}),c(p,{value:n,onChange:e=>r(e),dynamicSteps:[0,1,2,4,8,16,32,64,128],min:0,max:128,placeholder:`Memory`,addonAfter:`GiB`}),l(`div`,{children:[`Value: `,n,` GiB`]})]}),l(i,{direction:`column`,gap:`sm`,children:[c(`strong`,{children:`GPU Count (discrete)`}),c(p,{value:a,onChange:e=>o(e),dynamicSteps:[0,1,2,4,8],min:0,max:8,placeholder:`GPU`}),l(`div`,{children:[`Value: `,a]})]})]})}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source},description:{story:`Basic usage with default dynamic steps.
Try clicking arrow up/down buttons to see non-linear stepping.`,...g.parameters?.docs?.description}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source},description:{story:`Custom step values for CPU core allocation.`,..._.parameters?.docs?.description}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source},description:{story:`Custom step values for memory (GiB) allocation.`,...v.parameters?.docs?.description}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source},description:{story:`Custom step values for GPU count allocation.`,...y.parameters?.docs?.description}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source},description:{story:`Input with min/max boundaries.
Steps will respect boundaries when clicking arrows.`,...b.parameters?.docs?.description}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source},description:{story:`Disabled state.`,...x.parameters?.docs?.description}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source},description:{story:`Comparison of different step configurations.`,...S.parameters?.docs?.description}}},C=[`Default`,`CPUCores`,`MemoryGiB`,`GPUCount`,`WithMinMax`,`Disabled`,`StepComparison`]})))()}w();export{_ as CPUCores,g as Default,x as Disabled,y as GPUCount,v as MemoryGiB,S as StepComparison,b as WithMinMax,C as __namedExportsOrder,h as default};