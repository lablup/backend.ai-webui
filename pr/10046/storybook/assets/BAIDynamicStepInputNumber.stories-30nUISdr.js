import{r as h,j as a,c as be,b as Se}from"./iframe-gRCT4_lE.js";import{n as fe}from"./astryxLabel-BKa0cbqM.js";import{I as Ce,a as Be,o as Ve}from"./NumberStepper2-CnFmIPmY.js";import{N as Ie}from"./NumberInput-BDOuXVcR.js";import{B as y}from"./BAIFlex-C-cBhCWZ.js";import"./preload-helper-Dp1pzeXC.js";import"./InputGroupContext-BTG20Fb0.js";import"./InputClearButton-ClAaUH-d.js";import"./FieldStatus-Be9lyd1L.js";import"./useDevWarning-ChiBRtoy.js";import"./useInputStatusIcon-B1jf97W4.js";import"./useResolvedRequired-0RD7Xd5j.js";function ge({steps:t,value:e,defaultValue:s,onChange:u,min:r,max:i,units:n,label:d,isLabelHidden:b=!1,placeholder:v,isDisabled:p,increaseLabel:F,decreaseLabel:S,className:f,style:C}){let[B,V]=h.useState(s??t[0]??0),m=e!==void 0,l=m?e:B,x=o=>{m||V(o),u==null||u(o)},g=o=>{let N=Ve(t,l,o);if(N<0||N>=t.length)return;let I=[...t].sort((ve,xe)=>ve-xe)[N]??l;r!==void 0&&I<r?I=r:i!==void 0&&I>i&&(I=i),x(I)};return a.jsxs(Ce,{label:d,isLabelHidden:b,isDisabled:p,className:f,style:C,children:[a.jsx(Ie,{label:d,isLabelHidden:!0,value:l,onChange:o=>x(o??0),onKeyDown:o=>{p||(o.key==="ArrowUp"||o.key==="ArrowDown")&&(o.preventDefault(),g(o.key==="ArrowUp"?"up":"down"))},min:r,max:i,units:n,placeholder:v,isDisabled:p,width:"100%"}),a.jsx(Be,{onStep:g,isDisabled:p,increaseLabel:F,decreaseLabel:S})]})}ge.displayName="StepNumberInput";const Ae=[0,.0625,.125,.25,.5,.75,1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536],c=t=>{"use memo";const e=be.c(20),{dynamicSteps:s,value:u,onChange:r,min:i,max:n,placeholder:d,disabled:b,addonAfter:v,label:p,isLabelHidden:F,increaseLabel:S,decreaseLabel:f,defaultValue:C}=t,B=s===void 0?Ae:s,{t:V}=Se();let m;e[0]!==v?(m=v===void 0?void 0:fe(v),e[0]=v,e[1]=m):m=e[1];let l;e[2]!==p||e[3]!==d||e[4]!==V?(l=p??d??V("general.Select"),e[2]=p,e[3]=d,e[4]=V,e[5]=l):l=e[5];const x=F??p===void 0;let g;return e[6]!==f||e[7]!==C||e[8]!==b||e[9]!==B||e[10]!==S||e[11]!==n||e[12]!==i||e[13]!==r||e[14]!==d||e[15]!==m||e[16]!==l||e[17]!==x||e[18]!==u?(g=a.jsx(ge,{steps:B,value:u,defaultValue:C,onChange:r,min:i,max:n,placeholder:d,isDisabled:b,units:m,label:l,isLabelHidden:x,increaseLabel:S,decreaseLabel:f}),e[6]=f,e[7]=C,e[8]=b,e[9]=B,e[10]=S,e[11]=n,e[12]=i,e[13]=r,e[14]=d,e[15]=m,e[16]=l,e[17]=x,e[18]=u,e[19]=g):g=e[19],g},Te={title:"Input/BAIDynamicStepInputNumber",component:c,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:`
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
        `}}},argTypes:{dynamicSteps:{control:{type:"object"},description:"Array of step values to use when clicking arrow up/down buttons",table:{type:{summary:"number[]"},defaultValue:{summary:"[0, 0.0625, 0.125, 0.25, 0.5, 0.75, 1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536]"}}},value:{control:{type:"number"},description:"Current value",table:{type:{summary:"number"}}},onChange:{action:"changed",description:"Callback when value changes"},min:{control:{type:"number"},description:"Minimum value",table:{type:{summary:"number"}}},max:{control:{type:"number"},description:"Maximum value",table:{type:{summary:"number"}}},disabled:{control:{type:"boolean"},description:"Whether the input is disabled",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},placeholder:{control:{type:"text"},description:"Placeholder text",table:{type:{summary:"string"}}}}},A={name:"Basic",parameters:{docs:{description:{story:"Basic usage demonstrating dynamic stepping. Click arrow up/down buttons to navigate through predefined step values: 0, 0.0625, 0.125, 0.25, 0.5, 0.75, 1, 2, 4, 8, 16, etc."}}},render:()=>{const[t,e]=h.useState(1);return a.jsxs(y,{direction:"column",gap:"md",children:[a.jsx(c,{value:t,onChange:s=>e(s),placeholder:"Enter value or use arrows"}),a.jsxs("div",{children:["Current value: ",t]})]})}},w={name:"CPUCoreAllocation",parameters:{docs:{description:{story:"Example for CPU core allocation with custom steps: 0, 0.5, 1, 2, 4, 8, 16, 32. Useful for fractional CPU allocation."}}},render:()=>{const[t,e]=h.useState(1);return a.jsxs(y,{direction:"column",gap:"md",children:[a.jsx(c,{value:t,onChange:s=>e(s),dynamicSteps:[0,.5,1,2,4,8,16,32],min:0,max:32,placeholder:"CPU cores"}),a.jsxs("div",{children:["Selected CPU cores: ",t]})]})}},U={name:"MemoryAllocation",parameters:{docs:{description:{story:"Example for memory (GiB) allocation with custom steps: 0, 0.5, 1, 2, 4, 8, 16, 32, 64, 128, 256. Ideal for exponential resource scaling."}}},render:()=>{const[t,e]=h.useState(4);return a.jsxs(y,{direction:"column",gap:"md",children:[a.jsx(c,{value:t,onChange:s=>e(s),dynamicSteps:[0,.5,1,2,4,8,16,32,64,128,256],min:0,max:256,placeholder:"Memory (GiB)",addonAfter:"GiB"}),a.jsxs("div",{children:["Selected memory: ",t," GiB"]})]})}},G={name:"GPUAllocation",parameters:{docs:{description:{story:"Example for GPU count allocation with custom steps: 0, 1, 2, 4, 8. Useful for discrete GPU allocation."}}},render:()=>{const[t,e]=h.useState(1);return a.jsxs(y,{direction:"column",gap:"md",children:[a.jsx(c,{value:t,onChange:s=>e(s),dynamicSteps:[0,1,2,4,8],min:0,max:8,placeholder:"GPU count"}),a.jsxs("div",{children:["Selected GPUs: ",t]})]})}},P={name:"BoundaryRespect",parameters:{docs:{description:{story:"Demonstrates how dynamic steps respect min/max boundaries. Try stepping beyond boundaries to see automatic clipping."}}},render:()=>{const[t,e]=h.useState(4);return a.jsxs(y,{direction:"column",gap:"md",children:[a.jsx(c,{value:t,onChange:s=>e(s),dynamicSteps:[0,1,2,4,8,16,32,64],min:2,max:32,placeholder:"Value between 2 and 32"}),a.jsxs("div",{children:["Current value: ",t," (min: 2, max: 32)"]})]})}},D={name:"DisabledState",parameters:{docs:{description:{story:"Shows the component in a disabled state."}}},render:()=>a.jsx(c,{value:8,onChange:()=>{},disabled:!0,placeholder:"Disabled input"})},j={name:"StepConfigurations",parameters:{docs:{description:{story:"Compares different dynamic step configurations side by side. Each has different step values tailored for specific use cases."}}},render:()=>{const[t,e]=h.useState(1),[s,u]=h.useState(4),[r,i]=h.useState(1);return a.jsxs(y,{direction:"column",gap:"lg",children:[a.jsxs(y,{direction:"column",gap:"sm",children:[a.jsx("strong",{children:"CPU Cores (fractional)"}),a.jsx(c,{value:t,onChange:n=>e(n),dynamicSteps:[0,.5,1,2,4,8,16],min:0,max:16,placeholder:"CPU"}),a.jsxs("div",{children:["Value: ",t]})]}),a.jsxs(y,{direction:"column",gap:"sm",children:[a.jsx("strong",{children:"Memory GiB (exponential)"}),a.jsx(c,{value:s,onChange:n=>u(n),dynamicSteps:[0,1,2,4,8,16,32,64,128],min:0,max:128,placeholder:"Memory",addonAfter:"GiB"}),a.jsxs("div",{children:["Value: ",s," GiB"]})]}),a.jsxs(y,{direction:"column",gap:"sm",children:[a.jsx("strong",{children:"GPU Count (discrete)"}),a.jsx(c,{value:r,onChange:n=>i(n),dynamicSteps:[0,1,2,4,8],min:0,max:8,placeholder:"GPU"}),a.jsxs("div",{children:["Value: ",r]})]})]})}};var M,E,L,k,T;A.parameters={...A.parameters,docs:{...(M=A.parameters)==null?void 0:M.docs,source:{originalSource:`{
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
}`,...(L=(E=A.parameters)==null?void 0:E.docs)==null?void 0:L.source},description:{story:`Basic usage with default dynamic steps.
Try clicking arrow up/down buttons to see non-linear stepping.`,...(T=(k=A.parameters)==null?void 0:k.docs)==null?void 0:T.description}}};var R,H,W,K,O;w.parameters={...w.parameters,docs:{...(R=w.parameters)==null?void 0:R.docs,source:{originalSource:`{
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
}`,...(W=(H=w.parameters)==null?void 0:H.docs)==null?void 0:W.source},description:{story:"Custom step values for CPU core allocation.",...(O=(K=w.parameters)==null?void 0:K.docs)==null?void 0:O.description}}};var $,q,z,J,Q;U.parameters={...U.parameters,docs:{...($=U.parameters)==null?void 0:$.docs,source:{originalSource:`{
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
}`,...(z=(q=U.parameters)==null?void 0:q.docs)==null?void 0:z.source},description:{story:"Custom step values for memory (GiB) allocation.",...(Q=(J=U.parameters)==null?void 0:J.docs)==null?void 0:Q.description}}};var X,Y,Z,_,ee;G.parameters={...G.parameters,docs:{...(X=G.parameters)==null?void 0:X.docs,source:{originalSource:`{
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
}`,...(Z=(Y=G.parameters)==null?void 0:Y.docs)==null?void 0:Z.source},description:{story:"Custom step values for GPU count allocation.",...(ee=(_=G.parameters)==null?void 0:_.docs)==null?void 0:ee.description}}};var ae,te,se,re,ne;P.parameters={...P.parameters,docs:{...(ae=P.parameters)==null?void 0:ae.docs,source:{originalSource:`{
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
}`,...(se=(te=P.parameters)==null?void 0:te.docs)==null?void 0:se.source},description:{story:`Input with min/max boundaries.
Steps will respect boundaries when clicking arrows.`,...(ne=(re=P.parameters)==null?void 0:re.docs)==null?void 0:ne.description}}};var oe,ie,le,ce,ue;D.parameters={...D.parameters,docs:{...(oe=D.parameters)==null?void 0:oe.docs,source:{originalSource:`{
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
}`,...(le=(ie=D.parameters)==null?void 0:ie.docs)==null?void 0:le.source},description:{story:"Disabled state.",...(ue=(ce=D.parameters)==null?void 0:ce.docs)==null?void 0:ue.description}}};var de,pe,me,ye,he;j.parameters={...j.parameters,docs:{...(de=j.parameters)==null?void 0:de.docs,source:{originalSource:`{
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
}`,...(me=(pe=j.parameters)==null?void 0:pe.docs)==null?void 0:me.source},description:{story:"Comparison of different step configurations.",...(he=(ye=j.parameters)==null?void 0:ye.docs)==null?void 0:he.description}}};const Re=["Default","CPUCores","MemoryGiB","GPUCount","WithMinMax","Disabled","StepComparison"];export{w as CPUCores,A as Default,D as Disabled,G as GPUCount,U as MemoryGiB,j as StepComparison,P as WithMinMax,Re as __namedExportsOrder,Te as default};
