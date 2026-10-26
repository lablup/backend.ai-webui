import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-MKhVqBIO.js";import{n,t as r}from"./BAIFlex-BOFoS5KY.js";import{n as i,t as a}from"./BAIProgressWithLabel-B2WvSOjQ.js";var o,s,c,l,u,d,f,p,m,h;function g(){return(g=e((()=>{n(),i(),o=t(),s={title:`Statistic/BAIProgressWithLabel`,component:a,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:`
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
        `}}},argTypes:{title:{control:{type:`text`},description:`Left label, usually the resource name`,table:{type:{summary:`ReactNode`}}},valueLabel:{control:{type:`text`},description:`Right label, usually current/total values`,table:{type:{summary:`ReactNode`}}},percent:{control:{type:`number`,min:0,max:100,step:1},description:`Progress percentage (0-100)`,table:{type:{summary:`number`}}},width:{control:{type:`text`},description:`Custom width (CSS value or number)`,table:{type:{summary:`React.CSSProperties['width']`},defaultValue:{summary:`flex: 1`}}},strokeColor:{control:{type:`text`},description:`Progress bar fill color`,table:{type:{summary:`string`},defaultValue:{summary:`token.colorSuccess`}}},labelStyle:{control:{type:`object`},description:`Custom styles for both title and value labels`,table:{type:{summary:`React.CSSProperties`}}},progressStyle:{control:{type:`object`},description:`Custom styles for the progress container`,table:{type:{summary:`React.CSSProperties`}}},size:{control:{type:`select`},options:[`small`,`middle`,`large`],description:`Size variant affecting font size`,table:{type:{summary:`'small' | 'middle' | 'large'`},defaultValue:{summary:`small`}}},showInfo:{control:{type:`boolean`},description:`Whether to show the value label`,table:{type:{summary:`boolean`},defaultValue:{summary:`true`}}}}},c={name:`Basic`,parameters:{docs:{description:{story:`Basic usage with title, value label, and percentage.`}}},args:{title:`CPU Usage`,valueLabel:`75%`,percent:75,size:`small`}},l={parameters:{docs:{description:{story:`Three size variants available: small, middle, and large. Size affects font size of labels.`}}},render:()=>(0,o.jsxs)(r,{direction:`column`,gap:`md`,style:{width:300},children:[(0,o.jsx)(a,{title:`Small Size`,valueLabel:`50%`,percent:50,size:`small`}),(0,o.jsx)(a,{title:`Middle Size`,valueLabel:`50%`,percent:50,size:`middle`}),(0,o.jsx)(a,{title:`Large Size`,valueLabel:`50%`,percent:50,size:`large`})]})},u={parameters:{docs:{description:{story:`Custom stroke colors can be applied to indicate different states or resource types.`}}},render:()=>(0,o.jsxs)(r,{direction:`column`,gap:`md`,style:{width:300},children:[(0,o.jsx)(a,{title:`Success`,valueLabel:`25%`,percent:25,strokeColor:`#52c41a`}),(0,o.jsx)(a,{title:`Warning`,valueLabel:`50%`,percent:50,strokeColor:`#faad14`}),(0,o.jsx)(a,{title:`Error`,valueLabel:`75%`,percent:75,strokeColor:`#ff4d4f`}),(0,o.jsx)(a,{title:`Info`,valueLabel:`100%`,percent:100,strokeColor:`#1890ff`})]})},d={parameters:{docs:{description:{story:`Custom styles can be applied to labels and the progress container.`}}},render:()=>(0,o.jsxs)(r,{direction:`column`,gap:`md`,style:{width:300},children:[(0,o.jsx)(a,{title:`Bold Labels`,valueLabel:`60%`,percent:60,labelStyle:{fontWeight:`bold`}}),(0,o.jsx)(a,{title:`Custom Container`,valueLabel:`40%`,percent:40,progressStyle:{borderRadius:8,padding:8}}),(0,o.jsx)(a,{title:`Monospace Value`,valueLabel:`80%`,percent:80,labelStyle:{fontFamily:`monospace`}})]})},f={parameters:{docs:{description:{story:`Handles edge cases gracefully: 0%, 100%, NaN, and undefined percentages.`}}},render:()=>(0,o.jsxs)(r,{direction:`column`,gap:`md`,style:{width:300},children:[(0,o.jsx)(a,{title:`Zero Percent`,valueLabel:`0%`,percent:0}),(0,o.jsx)(a,{title:`Full Percent`,valueLabel:`100%`,percent:100}),(0,o.jsx)(a,{title:`NaN Percent`,valueLabel:`N/A`,percent:NaN}),(0,o.jsx)(a,{title:`Undefined Percent`,valueLabel:`N/A`,percent:void 0}),(0,o.jsx)(a,{title:`Over 100%`,valueLabel:`150%`,percent:150})]})},p={parameters:{docs:{description:{story:`Value label can be hidden using showInfo prop.`}}},render:()=>(0,o.jsxs)(r,{direction:`column`,gap:`md`,style:{width:300},children:[(0,o.jsx)(a,{title:`With Info`,valueLabel:`75%`,percent:75,showInfo:!0}),(0,o.jsx)(a,{title:`Without Info`,valueLabel:`75%`,percent:75,showInfo:!1})]})},m={parameters:{docs:{description:{story:`Realistic examples showing resource usage displays in Backend.AI WebUI.`}}},render:()=>(0,o.jsxs)(r,{direction:`column`,gap:`lg`,style:{width:400},children:[(0,o.jsxs)(`div`,{children:[(0,o.jsx)(`div`,{style:{marginBottom:8,fontWeight:500},children:`Compute Resource Usage`}),(0,o.jsxs)(r,{direction:`column`,gap:`sm`,children:[(0,o.jsx)(a,{title:`CPU`,valueLabel:`12 / 16 Cores`,percent:75,strokeColor:`#1890ff`,size:`middle`}),(0,o.jsx)(a,{title:`Memory`,valueLabel:`24GB / 64GB`,percent:37.5,strokeColor:`#52c41a`,size:`middle`}),(0,o.jsx)(a,{title:`GPU`,valueLabel:`2 / 4 Cards`,percent:50,strokeColor:`#722ed1`,size:`middle`})]})]}),(0,o.jsxs)(`div`,{children:[(0,o.jsx)(`div`,{style:{marginBottom:8,fontWeight:500},children:`Storage Quota`}),(0,o.jsxs)(r,{direction:`column`,gap:`sm`,children:[(0,o.jsx)(a,{title:`Home Folder`,valueLabel:`45GB / 100GB`,percent:45,strokeColor:`#faad14`,size:`middle`}),(0,o.jsx)(a,{title:`Shared Folder`,valueLabel:`180GB / 200GB`,percent:90,strokeColor:`#ff4d4f`,size:`middle`})]})]}),(0,o.jsxs)(`div`,{children:[(0,o.jsx)(`div`,{style:{marginBottom:8,fontWeight:500},children:`Session Allocation`}),(0,o.jsxs)(r,{direction:`column`,gap:`sm`,children:[(0,o.jsx)(a,{title:`Running Sessions`,valueLabel:`8 / 20`,percent:40,size:`small`}),(0,o.jsx)(a,{title:`Compute Credits`,valueLabel:`$450 / $1000`,percent:45,size:`small`})]})]})]})},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
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
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
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
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
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
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
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
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
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
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}},h=[`Default`,`SizeVariants`,`CustomColors`,`CustomStyles`,`EdgeCases`,`HideInfo`,`RealWorldExample`]})))()}g();export{u as CustomColors,d as CustomStyles,c as Default,f as EdgeCases,p as HideInfo,m as RealWorldExample,l as SizeVariants,h as __namedExportsOrder,s as default};