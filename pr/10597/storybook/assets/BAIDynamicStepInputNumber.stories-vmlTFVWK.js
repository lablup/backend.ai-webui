import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-DlPsW1c0.js";import{t as n}from"./jsx-runtime-MKhVqBIO.js";import{n as r,t as i}from"./useBAIi18n-DURTYAKn.js";import{t as a}from"./compiler-runtime-DU4U6aph.js";import{n as o,t as s}from"./BAIFlex-DnaoYTJ1.js";import{n as c,t as l}from"./astryxLabel-B6l5fHO3.js";import{n as u,t as d}from"./NumberInput-CHkKDn7_.js";import{n as f,o as p,r as m,s as h,t as g}from"./NumberStepper2-BjvP9wSV.js";function _({steps:e,value:t,defaultValue:n,onChange:r,min:i,max:a,units:o,label:s,isLabelHidden:c=!1,placeholder:l,isDisabled:u,increaseLabel:f,decreaseLabel:h,className:_,style:b}){let[x,S]=(0,v.useState)(n??e[0]??0),C=t!==void 0,w=C?t:x,T=e=>{C||S(e),r==null||r(e)},E=t=>{let n=m(e,w,t);if(n<0||n>=e.length)return;let r=[...e].sort((e,t)=>e-t)[n]??w;i!==void 0&&r<i?r=i:a!==void 0&&r>a&&(r=a),T(r)};return(0,y.jsxs)(p,{label:s,isLabelHidden:c,isDisabled:u,className:_,style:b,children:[(0,y.jsx)(d,{label:s,isLabelHidden:!0,value:w,onChange:e=>T(e??0),onKeyDown:e=>{u||(e.key===`ArrowUp`||e.key===`ArrowDown`)&&(e.preventDefault(),E(e.key===`ArrowUp`?`up`:`down`))},min:i,max:a,units:o,placeholder:l,isDisabled:u,width:`100%`}),(0,y.jsx)(g,{onStep:E,isDisabled:u,increaseLabel:f,decreaseLabel:h})]})}var v,y;function b(){return(b=e((()=>{f(),v=t(),y=n(),h(),u(),_.displayName=`StepNumberInput`})))()}var x,S,C,w;function T(){return(T=e((()=>{x=a(),l(),i(),b(),S=n(),C=[0,.0625,.125,.25,.5,.75,1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536],w=e=>{"use memo";let t=(0,x.c)(20),{dynamicSteps:n,value:i,onChange:a,min:o,max:s,placeholder:l,disabled:u,addonAfter:d,label:f,isLabelHidden:p,increaseLabel:m,decreaseLabel:h,defaultValue:g}=e,v=n===void 0?C:n,{t:y}=r(),b;t[0]===d?b=t[1]:(b=d===void 0?void 0:c(d),t[0]=d,t[1]=b);let w;t[2]!==f||t[3]!==l||t[4]!==y?(w=f??l??y(`general.Select`),t[2]=f,t[3]=l,t[4]=y,t[5]=w):w=t[5];let T=p??f===void 0,E;return t[6]!==h||t[7]!==g||t[8]!==u||t[9]!==v||t[10]!==m||t[11]!==s||t[12]!==o||t[13]!==a||t[14]!==l||t[15]!==b||t[16]!==w||t[17]!==T||t[18]!==i?(E=(0,S.jsx)(_,{steps:v,value:i,defaultValue:g,onChange:a,min:o,max:s,placeholder:l,isDisabled:u,units:b,label:w,isLabelHidden:T,increaseLabel:m,decreaseLabel:h}),t[6]=h,t[7]=g,t[8]=u,t[9]=v,t[10]=m,t[11]=s,t[12]=o,t[13]=a,t[14]=l,t[15]=b,t[16]=w,t[17]=T,t[18]=i,t[19]=E):E=t[19],E}})))()}var E,D,ee,O,k,A,j,M,N,P,F,te,I,L,R,z,B,V,H,U,ne,W,G,K,q,J,Y,X,Z,Q,$,re;function ie(){return(ie=e((()=>{T(),o(),E=t(),D=n(),K={title:`Input/BAIDynamicStepInputNumber`,component:w,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:`
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
        `}}},argTypes:{dynamicSteps:{control:{type:`object`},description:`Array of step values to use when clicking arrow up/down buttons`,table:{type:{summary:`number[]`},defaultValue:{summary:`[0, 0.0625, 0.125, 0.25, 0.5, 0.75, 1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536]`}}},value:{control:{type:`number`},description:`Current value`,table:{type:{summary:`number`}}},onChange:{action:`changed`,description:`Callback when value changes`},min:{control:{type:`number`},description:`Minimum value`,table:{type:{summary:`number`}}},max:{control:{type:`number`},description:`Maximum value`,table:{type:{summary:`number`}}},disabled:{control:{type:`boolean`},description:`Whether the input is disabled`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},placeholder:{control:{type:`text`},description:`Placeholder text`,table:{type:{summary:`string`}}}}},q={name:`Basic`,parameters:{docs:{description:{story:`Basic usage demonstrating dynamic stepping. Click arrow up/down buttons to navigate through predefined step values: 0, 0.0625, 0.125, 0.25, 0.5, 0.75, 1, 2, 4, 8, 16, etc.`}}},render:()=>{let[e,t]=(0,E.useState)(1);return(0,D.jsxs)(s,{direction:`column`,gap:`md`,children:[(0,D.jsx)(w,{value:e,onChange:e=>t(e),placeholder:`Enter value or use arrows`}),(0,D.jsxs)(`div`,{children:[`Current value: `,e]})]})}},J={name:`CPUCoreAllocation`,parameters:{docs:{description:{story:`Example for CPU core allocation with custom steps: 0, 0.5, 1, 2, 4, 8, 16, 32. Useful for fractional CPU allocation.`}}},render:()=>{let[e,t]=(0,E.useState)(1);return(0,D.jsxs)(s,{direction:`column`,gap:`md`,children:[(0,D.jsx)(w,{value:e,onChange:e=>t(e),dynamicSteps:[0,.5,1,2,4,8,16,32],min:0,max:32,placeholder:`CPU cores`}),(0,D.jsxs)(`div`,{children:[`Selected CPU cores: `,e]})]})}},Y={name:`MemoryAllocation`,parameters:{docs:{description:{story:`Example for memory (GiB) allocation with custom steps: 0, 0.5, 1, 2, 4, 8, 16, 32, 64, 128, 256. Ideal for exponential resource scaling.`}}},render:()=>{let[e,t]=(0,E.useState)(4);return(0,D.jsxs)(s,{direction:`column`,gap:`md`,children:[(0,D.jsx)(w,{value:e,onChange:e=>t(e),dynamicSteps:[0,.5,1,2,4,8,16,32,64,128,256],min:0,max:256,placeholder:`Memory (GiB)`,addonAfter:`GiB`}),(0,D.jsxs)(`div`,{children:[`Selected memory: `,e,` GiB`]})]})}},X={name:`GPUAllocation`,parameters:{docs:{description:{story:`Example for GPU count allocation with custom steps: 0, 1, 2, 4, 8. Useful for discrete GPU allocation.`}}},render:()=>{let[e,t]=(0,E.useState)(1);return(0,D.jsxs)(s,{direction:`column`,gap:`md`,children:[(0,D.jsx)(w,{value:e,onChange:e=>t(e),dynamicSteps:[0,1,2,4,8],min:0,max:8,placeholder:`GPU count`}),(0,D.jsxs)(`div`,{children:[`Selected GPUs: `,e]})]})}},Z={name:`BoundaryRespect`,parameters:{docs:{description:{story:`Demonstrates how dynamic steps respect min/max boundaries. Try stepping beyond boundaries to see automatic clipping.`}}},render:()=>{let[e,t]=(0,E.useState)(4);return(0,D.jsxs)(s,{direction:`column`,gap:`md`,children:[(0,D.jsx)(w,{value:e,onChange:e=>t(e),dynamicSteps:[0,1,2,4,8,16,32,64],min:2,max:32,placeholder:`Value between 2 and 32`}),(0,D.jsxs)(`div`,{children:[`Current value: `,e,` (min: 2, max: 32)`]})]})}},Q={name:`DisabledState`,parameters:{docs:{description:{story:`Shows the component in a disabled state.`}}},render:()=>(0,D.jsx)(w,{value:8,onChange:()=>{},disabled:!0,placeholder:`Disabled input`})},$={name:`StepConfigurations`,parameters:{docs:{description:{story:`Compares different dynamic step configurations side by side. Each has different step values tailored for specific use cases.`}}},render:()=>{let[e,t]=(0,E.useState)(1),[n,r]=(0,E.useState)(4),[i,a]=(0,E.useState)(1);return(0,D.jsxs)(s,{direction:`column`,gap:`lg`,children:[(0,D.jsxs)(s,{direction:`column`,gap:`sm`,children:[(0,D.jsx)(`strong`,{children:`CPU Cores (fractional)`}),(0,D.jsx)(w,{value:e,onChange:e=>t(e),dynamicSteps:[0,.5,1,2,4,8,16],min:0,max:16,placeholder:`CPU`}),(0,D.jsxs)(`div`,{children:[`Value: `,e]})]}),(0,D.jsxs)(s,{direction:`column`,gap:`sm`,children:[(0,D.jsx)(`strong`,{children:`Memory GiB (exponential)`}),(0,D.jsx)(w,{value:n,onChange:e=>r(e),dynamicSteps:[0,1,2,4,8,16,32,64,128],min:0,max:128,placeholder:`Memory`,addonAfter:`GiB`}),(0,D.jsxs)(`div`,{children:[`Value: `,n,` GiB`]})]}),(0,D.jsxs)(s,{direction:`column`,gap:`sm`,children:[(0,D.jsx)(`strong`,{children:`GPU Count (discrete)`}),(0,D.jsx)(w,{value:i,onChange:e=>a(e),dynamicSteps:[0,1,2,4,8],min:0,max:8,placeholder:`GPU`}),(0,D.jsxs)(`div`,{children:[`Value: `,i]})]})]})}},q.parameters={...q.parameters,docs:{...(ee=q.parameters)==null?void 0:ee.docs,source:{originalSource:`{
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
}`,...(O=q.parameters)==null||(O=O.docs)==null?void 0:O.source},description:{story:`Basic usage with default dynamic steps.
Try clicking arrow up/down buttons to see non-linear stepping.`,...(k=q.parameters)==null||(k=k.docs)==null?void 0:k.description}}},J.parameters={...J.parameters,docs:{...(A=J.parameters)==null?void 0:A.docs,source:{originalSource:`{
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
}`,...(j=J.parameters)==null||(j=j.docs)==null?void 0:j.source},description:{story:`Custom step values for CPU core allocation.`,...(M=J.parameters)==null||(M=M.docs)==null?void 0:M.description}}},Y.parameters={...Y.parameters,docs:{...(N=Y.parameters)==null?void 0:N.docs,source:{originalSource:`{
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
}`,...(P=Y.parameters)==null||(P=P.docs)==null?void 0:P.source},description:{story:`Custom step values for memory (GiB) allocation.`,...(F=Y.parameters)==null||(F=F.docs)==null?void 0:F.description}}},X.parameters={...X.parameters,docs:{...(te=X.parameters)==null?void 0:te.docs,source:{originalSource:`{
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
}`,...(I=X.parameters)==null||(I=I.docs)==null?void 0:I.source},description:{story:`Custom step values for GPU count allocation.`,...(L=X.parameters)==null||(L=L.docs)==null?void 0:L.description}}},Z.parameters={...Z.parameters,docs:{...(R=Z.parameters)==null?void 0:R.docs,source:{originalSource:`{
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
}`,...(z=Z.parameters)==null||(z=z.docs)==null?void 0:z.source},description:{story:`Input with min/max boundaries.
Steps will respect boundaries when clicking arrows.`,...(B=Z.parameters)==null||(B=B.docs)==null?void 0:B.description}}},Q.parameters={...Q.parameters,docs:{...(V=Q.parameters)==null?void 0:V.docs,source:{originalSource:`{
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
}`,...(H=Q.parameters)==null||(H=H.docs)==null?void 0:H.source},description:{story:`Disabled state.`,...(U=Q.parameters)==null||(U=U.docs)==null?void 0:U.description}}},$.parameters={...$.parameters,docs:{...(ne=$.parameters)==null?void 0:ne.docs,source:{originalSource:`{
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
}`,...(W=$.parameters)==null||(W=W.docs)==null?void 0:W.source},description:{story:`Comparison of different step configurations.`,...(G=$.parameters)==null||(G=G.docs)==null?void 0:G.description}}},re=[`Default`,`CPUCores`,`MemoryGiB`,`GPUCount`,`WithMinMax`,`Disabled`,`StepComparison`]})))()}ie();export{J as CPUCores,q as Default,Q as Disabled,X as GPUCount,Y as MemoryGiB,$ as StepComparison,Z as WithMinMax,re as __namedExportsOrder,K as default};