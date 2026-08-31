import{j as e}from"./iframe-COjLyI6L.js";import{B as r}from"./BAIFlex-CaLZ3rzg.js";import{B as t}from"./BAIProgressWithLabel-dIq1vyIU.js";import"./preload-helper-Dp1pzeXC.js";import"./isNumber-BUS6CEM5.js";import"./_baseExtremum-C6XB4OQI.js";import"./isSymbol-B0mr0Vxm.js";import"./identity-DKeuBCMA.js";import"./isUndefined-DCTLXrZ8.js";import"./isString-l5ho9hQB.js";const H={title:"Statistic/BAIProgressWithLabel",component:t,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:`
**BAIProgressWithLabel** is a custom progress component with title and value labels.

## Features
- **Dual labels**: Title on the left, value on the right
- **Size variants**: Small, middle, and large sizes
- **Custom styling**: Supports custom colors and styles
- **Edge case handling**: Gracefully handles NaN, undefined, and out-of-range percentages
- **Flexible width**: Supports fixed width or flex-based width

## Usage
\`\`\`tsx
// Basic usage
<BAIProgressWithLabel
  title="CPU"
  valueLabel="75%"
  percent={75}
/>

// With custom color
<BAIProgressWithLabel
  title="Memory"
  valueLabel="8GB / 16GB"
  percent={50}
  strokeColor="#ff4d4f"
/>

// Large size
<BAIProgressWithLabel
  title="Storage"
  valueLabel="500GB / 1TB"
  percent={50}
  size="large"
/>
\`\`\`

## Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| \`title\` | \`ReactNode\` | - | Left label (usually resource name) |
| \`valueLabel\` | \`ReactNode\` | - | Right label (usually current/total values) |
| \`percent\` | \`number\` | - | Progress percentage (0-100) |
| \`width\` | \`React.CSSProperties['width']\` | \`'flex: 1'\` | Custom width for the container |
| \`strokeColor\` | \`string\` | \`token.colorSuccess\` | Progress bar fill color |
| \`labelStyle\` | \`React.CSSProperties\` | - | Custom styles for both labels |
| \`progressStyle\` | \`React.CSSProperties\` | - | Custom styles for the container |
| \`size\` | \`'small' \\| 'middle' \\| 'large'\` | \`'small'\` | Size variant |
| \`showInfo\` | \`boolean\` | \`true\` | Whether to show value label |
        `}}},argTypes:{title:{control:{type:"text"},description:"Left label, usually the resource name",table:{type:{summary:"ReactNode"}}},valueLabel:{control:{type:"text"},description:"Right label, usually current/total values",table:{type:{summary:"ReactNode"}}},percent:{control:{type:"number",min:0,max:100,step:1},description:"Progress percentage (0-100)",table:{type:{summary:"number"}}},width:{control:{type:"text"},description:"Custom width (CSS value or number)",table:{type:{summary:"React.CSSProperties['width']"},defaultValue:{summary:"flex: 1"}}},strokeColor:{control:{type:"text"},description:"Progress bar fill color",table:{type:{summary:"string"},defaultValue:{summary:"token.colorSuccess"}}},labelStyle:{control:{type:"object"},description:"Custom styles for both title and value labels",table:{type:{summary:"React.CSSProperties"}}},progressStyle:{control:{type:"object"},description:"Custom styles for the progress container",table:{type:{summary:"React.CSSProperties"}}},size:{control:{type:"select"},options:["small","middle","large"],description:"Size variant affecting font size",table:{type:{summary:"'small' | 'middle' | 'large'"},defaultValue:{summary:"small"}}},showInfo:{control:{type:"boolean"},description:"Whether to show the value label",table:{type:{summary:"boolean"},defaultValue:{summary:"true"}}}}},s={name:"Basic",parameters:{docs:{description:{story:"Basic usage with title, value label, and percentage."}}},args:{title:"CPU Usage",valueLabel:"75%",percent:75,size:"small"}},l={parameters:{docs:{description:{story:"Three size variants available: small, middle, and large. Size affects font size of labels."}}},render:()=>e.jsxs(r,{direction:"column",gap:"md",style:{width:300},children:[e.jsx(t,{title:"Small Size",valueLabel:"50%",percent:50,size:"small"}),e.jsx(t,{title:"Middle Size",valueLabel:"50%",percent:50,size:"middle"}),e.jsx(t,{title:"Large Size",valueLabel:"50%",percent:50,size:"large"})]})},a={parameters:{docs:{description:{story:"Custom stroke colors can be applied to indicate different states or resource types."}}},render:()=>e.jsxs(r,{direction:"column",gap:"md",style:{width:300},children:[e.jsx(t,{title:"Success",valueLabel:"25%",percent:25,strokeColor:"#52c41a"}),e.jsx(t,{title:"Warning",valueLabel:"50%",percent:50,strokeColor:"#faad14"}),e.jsx(t,{title:"Error",valueLabel:"75%",percent:75,strokeColor:"#ff4d4f"}),e.jsx(t,{title:"Info",valueLabel:"100%",percent:100,strokeColor:"#1890ff"})]})},o={parameters:{docs:{description:{story:"Custom styles can be applied to labels and the progress container."}}},render:()=>e.jsxs(r,{direction:"column",gap:"md",style:{width:300},children:[e.jsx(t,{title:"Bold Labels",valueLabel:"60%",percent:60,labelStyle:{fontWeight:"bold"}}),e.jsx(t,{title:"Custom Container",valueLabel:"40%",percent:40,progressStyle:{borderRadius:8,padding:8}}),e.jsx(t,{title:"Monospace Value",valueLabel:"80%",percent:80,labelStyle:{fontFamily:"monospace"}})]})},i={parameters:{docs:{description:{story:"Handles edge cases gracefully: 0%, 100%, NaN, and undefined percentages."}}},render:()=>e.jsxs(r,{direction:"column",gap:"md",style:{width:300},children:[e.jsx(t,{title:"Zero Percent",valueLabel:"0%",percent:0}),e.jsx(t,{title:"Full Percent",valueLabel:"100%",percent:100}),e.jsx(t,{title:"NaN Percent",valueLabel:"N/A",percent:NaN}),e.jsx(t,{title:"Undefined Percent",valueLabel:"N/A",percent:void 0}),e.jsx(t,{title:"Over 100%",valueLabel:"150%",percent:150})]})},n={parameters:{docs:{description:{story:"Value label can be hidden using showInfo prop."}}},render:()=>e.jsxs(r,{direction:"column",gap:"md",style:{width:300},children:[e.jsx(t,{title:"With Info",valueLabel:"75%",percent:75,showInfo:!0}),e.jsx(t,{title:"Without Info",valueLabel:"75%",percent:75,showInfo:!1})]})},c={parameters:{docs:{description:{story:"Realistic examples showing resource usage displays in Backend.AI WebUI."}}},render:()=>e.jsxs(r,{direction:"column",gap:"lg",style:{width:400},children:[e.jsxs("div",{children:[e.jsx("div",{style:{marginBottom:8,fontWeight:500},children:"Compute Resource Usage"}),e.jsxs(r,{direction:"column",gap:"sm",children:[e.jsx(t,{title:"CPU",valueLabel:"12 / 16 Cores",percent:75,strokeColor:"#1890ff",size:"middle"}),e.jsx(t,{title:"Memory",valueLabel:"24GB / 64GB",percent:37.5,strokeColor:"#52c41a",size:"middle"}),e.jsx(t,{title:"GPU",valueLabel:"2 / 4 Cards",percent:50,strokeColor:"#722ed1",size:"middle"})]})]}),e.jsxs("div",{children:[e.jsx("div",{style:{marginBottom:8,fontWeight:500},children:"Storage Quota"}),e.jsxs(r,{direction:"column",gap:"sm",children:[e.jsx(t,{title:"Home Folder",valueLabel:"45GB / 100GB",percent:45,strokeColor:"#faad14",size:"middle"}),e.jsx(t,{title:"Shared Folder",valueLabel:"180GB / 200GB",percent:90,strokeColor:"#ff4d4f",size:"middle"})]})]}),e.jsxs("div",{children:[e.jsx("div",{style:{marginBottom:8,fontWeight:500},children:"Session Allocation"}),e.jsxs(r,{direction:"column",gap:"sm",children:[e.jsx(t,{title:"Running Sessions",valueLabel:"8 / 20",percent:40,size:"small"}),e.jsx(t,{title:"Compute Credits",valueLabel:"$450 / $1000",percent:45,size:"small"})]})]})]})};var d,p,u;s.parameters={...s.parameters,docs:{...(d=s.parameters)==null?void 0:d.docs,source:{originalSource:`{
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'Basic usage with title, value label, and percentage.'
      }
    }
  },
  args: {
    title: 'CPU Usage',
    valueLabel: '75%',
    percent: 75,
    size: 'small'
  }
}`,...(u=(p=s.parameters)==null?void 0:p.docs)==null?void 0:u.source}}};var m,b,g;l.parameters={...l.parameters,docs:{...(m=l.parameters)==null?void 0:m.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Three size variants available: small, middle, and large. Size affects font size of labels.'
      }
    }
  },
  render: () => <BAIFlex direction="column" gap="md" style={{
    width: 300
  }}>
      <BAIProgressWithLabel title="Small Size" valueLabel="50%" percent={50} size="small" />
      <BAIProgressWithLabel title="Middle Size" valueLabel="50%" percent={50} size="middle" />
      <BAIProgressWithLabel title="Large Size" valueLabel="50%" percent={50} size="large" />
    </BAIFlex>
}`,...(g=(b=l.parameters)==null?void 0:b.docs)==null?void 0:g.source}}};var h,f,y;a.parameters={...a.parameters,docs:{...(h=a.parameters)==null?void 0:h.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Custom stroke colors can be applied to indicate different states or resource types.'
      }
    }
  },
  render: () => <BAIFlex direction="column" gap="md" style={{
    width: 300
  }}>
      <BAIProgressWithLabel title="Success" valueLabel="25%" percent={25} strokeColor="#52c41a" />
      <BAIProgressWithLabel title="Warning" valueLabel="50%" percent={50} strokeColor="#faad14" />
      <BAIProgressWithLabel title="Error" valueLabel="75%" percent={75} strokeColor="#ff4d4f" />
      <BAIProgressWithLabel title="Info" valueLabel="100%" percent={100} strokeColor="#1890ff" />
    </BAIFlex>
}`,...(y=(f=a.parameters)==null?void 0:f.docs)==null?void 0:y.source}}};var v,L,B;o.parameters={...o.parameters,docs:{...(v=o.parameters)==null?void 0:v.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Custom styles can be applied to labels and the progress container.'
      }
    }
  },
  render: () => <BAIFlex direction="column" gap="md" style={{
    width: 300
  }}>
      <BAIProgressWithLabel title="Bold Labels" valueLabel="60%" percent={60} labelStyle={{
      fontWeight: 'bold'
    }} />
      <BAIProgressWithLabel title="Custom Container" valueLabel="40%" percent={40} progressStyle={{
      borderRadius: 8,
      padding: 8
    }} />
      <BAIProgressWithLabel title="Monospace Value" valueLabel="80%" percent={80} labelStyle={{
      fontFamily: 'monospace'
    }} />
    </BAIFlex>
}`,...(B=(L=o.parameters)==null?void 0:L.docs)==null?void 0:B.source}}};var x,I,C;i.parameters={...i.parameters,docs:{...(x=i.parameters)==null?void 0:x.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Handles edge cases gracefully: 0%, 100%, NaN, and undefined percentages.'
      }
    }
  },
  render: () => <BAIFlex direction="column" gap="md" style={{
    width: 300
  }}>
      <BAIProgressWithLabel title="Zero Percent" valueLabel="0%" percent={0} />
      <BAIProgressWithLabel title="Full Percent" valueLabel="100%" percent={100} />
      <BAIProgressWithLabel title="NaN Percent" valueLabel="N/A" percent={NaN} />
      <BAIProgressWithLabel title="Undefined Percent" valueLabel="N/A" percent={undefined} />
      <BAIProgressWithLabel title="Over 100%" valueLabel="150%" percent={150} />
    </BAIFlex>
}`,...(C=(I=i.parameters)==null?void 0:I.docs)==null?void 0:C.source}}};var S,A,P;n.parameters={...n.parameters,docs:{...(S=n.parameters)==null?void 0:S.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Value label can be hidden using showInfo prop.'
      }
    }
  },
  render: () => <BAIFlex direction="column" gap="md" style={{
    width: 300
  }}>
      <BAIProgressWithLabel title="With Info" valueLabel="75%" percent={75} showInfo={true} />
      <BAIProgressWithLabel title="Without Info" valueLabel="75%" percent={75} showInfo={false} />
    </BAIFlex>
}`,...(P=(A=n.parameters)==null?void 0:A.docs)==null?void 0:P.source}}};var W,z,j;c.parameters={...c.parameters,docs:{...(W=c.parameters)==null?void 0:W.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Realistic examples showing resource usage displays in Backend.AI WebUI.'
      }
    }
  },
  render: () => <BAIFlex direction="column" gap="lg" style={{
    width: 400
  }}>
      <div>
        <div style={{
        marginBottom: 8,
        fontWeight: 500
      }}>
          Compute Resource Usage
        </div>
        <BAIFlex direction="column" gap="sm">
          <BAIProgressWithLabel title="CPU" valueLabel="12 / 16 Cores" percent={75} strokeColor="#1890ff" size="middle" />
          <BAIProgressWithLabel title="Memory" valueLabel="24GB / 64GB" percent={37.5} strokeColor="#52c41a" size="middle" />
          <BAIProgressWithLabel title="GPU" valueLabel="2 / 4 Cards" percent={50} strokeColor="#722ed1" size="middle" />
        </BAIFlex>
      </div>

      <div>
        <div style={{
        marginBottom: 8,
        fontWeight: 500
      }}>Storage Quota</div>
        <BAIFlex direction="column" gap="sm">
          <BAIProgressWithLabel title="Home Folder" valueLabel="45GB / 100GB" percent={45} strokeColor="#faad14" size="middle" />
          <BAIProgressWithLabel title="Shared Folder" valueLabel="180GB / 200GB" percent={90} strokeColor="#ff4d4f" size="middle" />
        </BAIFlex>
      </div>

      <div>
        <div style={{
        marginBottom: 8,
        fontWeight: 500
      }}>
          Session Allocation
        </div>
        <BAIFlex direction="column" gap="sm">
          <BAIProgressWithLabel title="Running Sessions" valueLabel="8 / 20" percent={40} size="small" />
          <BAIProgressWithLabel title="Compute Credits" valueLabel="$450 / $1000" percent={45} size="small" />
        </BAIFlex>
      </div>
    </BAIFlex>
}`,...(j=(z=c.parameters)==null?void 0:z.docs)==null?void 0:j.source}}};const T=["Default","SizeVariants","CustomColors","CustomStyles","EdgeCases","HideInfo","RealWorldExample"];export{a as CustomColors,o as CustomStyles,s as Default,i as EdgeCases,n as HideInfo,c as RealWorldExample,l as SizeVariants,T as __namedExportsOrder,H as default};
