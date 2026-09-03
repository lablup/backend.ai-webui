import{a as pe,j as e,r as c}from"./iframe-Bv35B5Ml.js";import{n as de}from"./astryxLabel-h0uC6Y7p.js";import{I as me,A as ye,n as ge}from"./astryxNumberStepper-DwjuvWfM.js";import{u as he}from"./useControllableValue-Dd7Cwgpk.js";import{N as xe}from"./NumberInput-BlLy1vnb.js";import{i as A}from"./isNumber-BbQ5mdb-.js";import{B as n}from"./BAIFlex-UPsn_LlS.js";import"./preload-helper-Dp1pzeXC.js";import"./InputGroupContext-BLJxvUXx.js";import"./InputClearButton-BruXCorN.js";import"./useResolvedRequired-cBrVEHz5.js";import"./useDevWarning-CPd_ezLB.js";import"./useInputStatusIcon-bxYFSeaz.js";const s=({dynamicSteps:a=[0,.0625,.125,.25,.5,.75,1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536],min:r,max:t,placeholder:v,disabled:l,addonAfter:f,label:o,isLabelHidden:ce,...le})=>{const{t:b}=pe(),[S,B]=he(le,{defaultValue:a[0]}),V=i=>{const C=ge(a,S,i);if(C<0||C>=a.length)return;let u=a[C];A(r)&&u<r?u=r:A(t)&&u>t&&(u=t),B(u)},ue=i=>{l||i.key!=="ArrowUp"&&i.key!=="ArrowDown"||(i.preventDefault(),V(i.key==="ArrowUp"?"up":"down"))},I=o??v??b("general.Select");return e.jsxs(me,{label:I,isLabelHidden:ce??o===void 0,isDisabled:l,children:[e.jsx(xe,{label:I,isLabelHidden:!0,value:S,onChange:i=>B(i??0),onKeyDown:ue,min:r,max:t,units:f===void 0?void 0:de(f),placeholder:v,isDisabled:l,width:"100%"}),e.jsx(ye,{onStep:V,isDisabled:l,increaseLabel:b("general.Increase"),decreaseLabel:b("general.Decrease")})]})},De={title:"Input/BAIDynamicStepInputNumber",component:s,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:`
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
        `}}},argTypes:{dynamicSteps:{control:{type:"object"},description:"Array of step values to use when clicking arrow up/down buttons",table:{type:{summary:"number[]"},defaultValue:{summary:"[0, 0.0625, 0.125, 0.25, 0.5, 0.75, 1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536]"}}},value:{control:{type:"number"},description:"Current value",table:{type:{summary:"number"}}},onChange:{action:"changed",description:"Callback when value changes"},min:{control:{type:"number"},description:"Minimum value",table:{type:{summary:"number"}}},max:{control:{type:"number"},description:"Maximum value",table:{type:{summary:"number"}}},disabled:{control:{type:"boolean"},description:"Whether the input is disabled",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},placeholder:{control:{type:"text"},description:"Placeholder text",table:{type:{summary:"string"}}}}},p={name:"Basic",parameters:{docs:{description:{story:"Basic usage demonstrating dynamic stepping. Click arrow up/down buttons to navigate through predefined step values: 0, 0.0625, 0.125, 0.25, 0.5, 0.75, 1, 2, 4, 8, 16, etc."}}},render:()=>{const[a,r]=c.useState(1);return e.jsxs(n,{direction:"column",gap:"md",children:[e.jsx(s,{value:a,onChange:t=>r(t),placeholder:"Enter value or use arrows"}),e.jsxs("div",{children:["Current value: ",a]})]})}},d={name:"CPUCoreAllocation",parameters:{docs:{description:{story:"Example for CPU core allocation with custom steps: 0, 0.5, 1, 2, 4, 8, 16, 32. Useful for fractional CPU allocation."}}},render:()=>{const[a,r]=c.useState(1);return e.jsxs(n,{direction:"column",gap:"md",children:[e.jsx(s,{value:a,onChange:t=>r(t),dynamicSteps:[0,.5,1,2,4,8,16,32],min:0,max:32,placeholder:"CPU cores"}),e.jsxs("div",{children:["Selected CPU cores: ",a]})]})}},m={name:"MemoryAllocation",parameters:{docs:{description:{story:"Example for memory (GiB) allocation with custom steps: 0, 0.5, 1, 2, 4, 8, 16, 32, 64, 128, 256. Ideal for exponential resource scaling."}}},render:()=>{const[a,r]=c.useState(4);return e.jsxs(n,{direction:"column",gap:"md",children:[e.jsx(s,{value:a,onChange:t=>r(t),dynamicSteps:[0,.5,1,2,4,8,16,32,64,128,256],min:0,max:256,placeholder:"Memory (GiB)",addonAfter:"GiB"}),e.jsxs("div",{children:["Selected memory: ",a," GiB"]})]})}},y={name:"GPUAllocation",parameters:{docs:{description:{story:"Example for GPU count allocation with custom steps: 0, 1, 2, 4, 8. Useful for discrete GPU allocation."}}},render:()=>{const[a,r]=c.useState(1);return e.jsxs(n,{direction:"column",gap:"md",children:[e.jsx(s,{value:a,onChange:t=>r(t),dynamicSteps:[0,1,2,4,8],min:0,max:8,placeholder:"GPU count"}),e.jsxs("div",{children:["Selected GPUs: ",a]})]})}},g={name:"BoundaryRespect",parameters:{docs:{description:{story:"Demonstrates how dynamic steps respect min/max boundaries. Try stepping beyond boundaries to see automatic clipping."}}},render:()=>{const[a,r]=c.useState(4);return e.jsxs(n,{direction:"column",gap:"md",children:[e.jsx(s,{value:a,onChange:t=>r(t),dynamicSteps:[0,1,2,4,8,16,32,64],min:2,max:32,placeholder:"Value between 2 and 32"}),e.jsxs("div",{children:["Current value: ",a," (min: 2, max: 32)"]})]})}},h={name:"DisabledState",parameters:{docs:{description:{story:"Shows the component in a disabled state."}}},render:()=>e.jsx(s,{value:8,onChange:()=>{},disabled:!0,placeholder:"Disabled input"})},x={name:"StepConfigurations",parameters:{docs:{description:{story:"Compares different dynamic step configurations side by side. Each has different step values tailored for specific use cases."}}},render:()=>{const[a,r]=c.useState(1),[t,v]=c.useState(4),[l,f]=c.useState(1);return e.jsxs(n,{direction:"column",gap:"lg",children:[e.jsxs(n,{direction:"column",gap:"sm",children:[e.jsx("strong",{children:"CPU Cores (fractional)"}),e.jsx(s,{value:a,onChange:o=>r(o),dynamicSteps:[0,.5,1,2,4,8,16],min:0,max:16,placeholder:"CPU"}),e.jsxs("div",{children:["Value: ",a]})]}),e.jsxs(n,{direction:"column",gap:"sm",children:[e.jsx("strong",{children:"Memory GiB (exponential)"}),e.jsx(s,{value:t,onChange:o=>v(o),dynamicSteps:[0,1,2,4,8,16,32,64,128],min:0,max:128,placeholder:"Memory",addonAfter:"GiB"}),e.jsxs("div",{children:["Value: ",t," GiB"]})]}),e.jsxs(n,{direction:"column",gap:"sm",children:[e.jsx("strong",{children:"GPU Count (discrete)"}),e.jsx(s,{value:l,onChange:o=>f(o),dynamicSteps:[0,1,2,4,8],min:0,max:8,placeholder:"GPU"}),e.jsxs("div",{children:["Value: ",l]})]})]})}};var w,U,G,P,D;p.parameters={...p.parameters,docs:{...(w=p.parameters)==null?void 0:w.docs,source:{originalSource:`{
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
}`,...(G=(U=p.parameters)==null?void 0:U.docs)==null?void 0:G.source},description:{story:`Basic usage with default dynamic steps.
Try clicking arrow up/down buttons to see non-linear stepping.`,...(D=(P=p.parameters)==null?void 0:P.docs)==null?void 0:D.description}}};var j,F,M,N,E;d.parameters={...d.parameters,docs:{...(j=d.parameters)==null?void 0:j.docs,source:{originalSource:`{
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
}`,...(M=(F=d.parameters)==null?void 0:F.docs)==null?void 0:M.source},description:{story:"Custom step values for CPU core allocation.",...(E=(N=d.parameters)==null?void 0:N.docs)==null?void 0:E.description}}};var k,L,T,R,W;m.parameters={...m.parameters,docs:{...(k=m.parameters)==null?void 0:k.docs,source:{originalSource:`{
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
}`,...(T=(L=m.parameters)==null?void 0:L.docs)==null?void 0:T.source},description:{story:"Custom step values for memory (GiB) allocation.",...(W=(R=m.parameters)==null?void 0:R.docs)==null?void 0:W.description}}};var H,K,_,O,q;y.parameters={...y.parameters,docs:{...(H=y.parameters)==null?void 0:H.docs,source:{originalSource:`{
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
}`,...(_=(K=y.parameters)==null?void 0:K.docs)==null?void 0:_.source},description:{story:"Custom step values for GPU count allocation.",...(q=(O=y.parameters)==null?void 0:O.docs)==null?void 0:q.description}}};var z,J,Q,X,Y;g.parameters={...g.parameters,docs:{...(z=g.parameters)==null?void 0:z.docs,source:{originalSource:`{
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
}`,...(Q=(J=g.parameters)==null?void 0:J.docs)==null?void 0:Q.source},description:{story:`Input with min/max boundaries.
Steps will respect boundaries when clicking arrows.`,...(Y=(X=g.parameters)==null?void 0:X.docs)==null?void 0:Y.description}}};var Z,$,ee,ae,te;h.parameters={...h.parameters,docs:{...(Z=h.parameters)==null?void 0:Z.docs,source:{originalSource:`{
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
}`,...(ee=($=h.parameters)==null?void 0:$.docs)==null?void 0:ee.source},description:{story:"Disabled state.",...(te=(ae=h.parameters)==null?void 0:ae.docs)==null?void 0:te.description}}};var re,se,ne,oe,ie;x.parameters={...x.parameters,docs:{...(re=x.parameters)==null?void 0:re.docs,source:{originalSource:`{
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
}`,...(ne=(se=x.parameters)==null?void 0:se.docs)==null?void 0:ne.source},description:{story:"Comparison of different step configurations.",...(ie=(oe=x.parameters)==null?void 0:oe.docs)==null?void 0:ie.description}}};const je=["Default","CPUCores","MemoryGiB","GPUCount","WithMinMax","Disabled","StepComparison"];export{d as CPUCores,p as Default,h as Disabled,y as GPUCount,m as MemoryGiB,x as StepComparison,g as WithMinMax,je as __namedExportsOrder,De as default};
