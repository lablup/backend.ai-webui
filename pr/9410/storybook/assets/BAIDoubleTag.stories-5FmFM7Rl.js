import{j as e}from"./iframe-Dz7pPF27.js";import{B as o}from"./BAIDoubleTag-DPScO3Ov.js";import{B as V}from"./BAIFlex-DbgP37ZB.js";import"./preload-helper-Dp1pzeXC.js";import"./astryxTagVariant-CPCr7vTB.js";import"./BAITextHighlighter-BFQQGeQl.js";import"./isEmpty-CjDwopcf.js";import"./toString-Dzw2jcqC.js";import"./isSymbol-D_14yoF0.js";import"./map-ifKkeuGl.js";import"./_baseEach-VZEvb8KZ.js";import"./get-C1HGokRK.js";import"./_baseGet-Dj2MM_NV.js";import"./identity-DKeuBCMA.js";import"./Badge-BWAFBrIN.js";import"./isUndefined-DCTLXrZ8.js";const Y={title:"Tag/BAIDoubleTag",component:o,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:`
**BAIDoubleTag** displays multiple tags in a connected layout with advanced text handling.

## Features
- **Flexible input**: Accepts string arrays or object arrays with custom properties
- **Text highlighting**: Built-in keyword highlighting with \`highlightKeyword\`
- **Ellipsis support**: Automatically truncates long labels with tooltips
- **Connected appearance**: Tags are visually connected without gaps
- **Custom styling**: Supports custom colors and styles per tag

## Usage
\`\`\`tsx
// String array
<BAIDoubleTag values={['Python', '3.11']} />

// Object array with colors
<BAIDoubleTag
  values={[
    { label: 'Python', color: 'blue' },
    { label: '3.11', color: 'green' }
  ]}
/>

// With keyword highlighting
<BAIDoubleTag
  values={['Python', '3.11']}
  highlightKeyword="py"
/>
\`\`\`

## Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| \`values\` | \`string[] \\| DoubleTagObjectValue[]\` | \`[]\` | Tag values as strings or objects with color/style |
| \`highlightKeyword\` | \`string\` | - | Keyword to highlight in tag labels |

### DoubleTagObjectValue
| Property | Type | Description |
|----------|------|-------------|
| \`label\` | \`string\` | Tag label text |
| \`color\` | \`string\` | Tag color (Ant Design color presets or custom) |
| \`style\` | \`React.CSSProperties\` | Custom styles for the tag |
        `}}},argTypes:{values:{control:{type:"object"},description:"Array of tag values (strings or objects with label, color, and style properties)",table:{type:{summary:"string[] | DoubleTagObjectValue[]"},defaultValue:{summary:"[]"}}},highlightKeyword:{control:{type:"text"},description:"Keyword to highlight within tag labels",table:{type:{summary:"string"},defaultValue:{summary:"undefined"}}}}},a={name:"Basic",parameters:{docs:{description:{story:"Basic usage with a string array. Tags are automatically styled with blue color."}}},args:{values:["Frontend","Backend","Database"]}},r={parameters:{docs:{description:{story:"Demonstrates using object values with custom colors for each tag."}}},args:{values:[{label:"Python",color:"blue"},{label:"3.11",color:"green"}]}},s={parameters:{docs:{description:{story:"Highlights matching keywords within tag labels using BAITextHighlighter."}}},args:{values:["Frontend","Backend","Database"],highlightKeyword:"end"}},t={parameters:{docs:{description:{story:"Showcases various Ant Design color presets available for tags."}}},render:()=>e.jsxs(V,{direction:"column",gap:"md",children:[e.jsx(o,{values:[{label:"Success",color:"success"},{label:"Processing",color:"processing"}]}),e.jsx(o,{values:[{label:"Warning",color:"warning"},{label:"Error",color:"error"}]}),e.jsx(o,{values:[{label:"Magenta",color:"magenta"},{label:"Purple",color:"purple"},{label:"Cyan",color:"cyan"}]}),e.jsx(o,{values:[{label:"Gold",color:"gold"},{label:"Lime",color:"lime"},{label:"Volcano",color:"volcano"}]})]})},l={parameters:{docs:{description:{story:"Long tag labels are automatically truncated with ellipsis. Hover over the tags to see the full text in a tooltip."}}},args:{values:[{label:"Very Long Tag Label That Will Be Truncated",color:"blue"},{label:"Another Long Label",color:"orange"}]}},n={parameters:{docs:{description:{story:"Each tag can have custom styles (font weight, size, style, etc.) through the style property."}}},args:{values:[{label:"Custom",color:"purple",style:{fontWeight:"bold",fontSize:14}},{label:"Styled",color:"cyan",style:{fontStyle:"italic"}}]}},i={parameters:{docs:{description:{story:"When values array is empty, the component renders null."}}},args:{values:[]}},c={parameters:{docs:{description:{story:"Realistic examples showing how BAIDoubleTag is used in Backend.AI WebUI, such as displaying image names with versions, or resource allocations."}}},render:()=>e.jsxs(V,{direction:"column",gap:"md",style:{alignItems:"flex-start"},children:[e.jsxs("div",{children:[e.jsx("div",{style:{marginBottom:8,fontWeight:500},children:"Container Image:"}),e.jsx(o,{values:[{label:"lablup/python",color:"blue"},{label:"3.11-ubuntu22.04",color:"green"}]})]}),e.jsxs("div",{children:[e.jsx("div",{style:{marginBottom:8,fontWeight:500},children:"GPU Allocation:"}),e.jsx(o,{values:[{label:"NVIDIA",color:"processing"},{label:"A100",color:"success"},{label:"2 cores",color:"orange"}]})]}),e.jsxs("div",{children:[e.jsx("div",{style:{marginBottom:8,fontWeight:500},children:"Session Status:"}),e.jsx(o,{values:[{label:"RUNNING",color:"success"},{label:"kernel-python",color:"blue"}]})]}),e.jsxs("div",{children:[e.jsx("div",{style:{marginBottom:8,fontWeight:500},children:'Search Result (keyword: "tensor"):'}),e.jsx(o,{values:[{label:"tensorflow",color:"orange"},{label:"2.12",color:"cyan"}],highlightKeyword:"tensor"})]})]})};var g,u,d;a.parameters={...a.parameters,docs:{...(g=a.parameters)==null?void 0:g.docs,source:{originalSource:`{
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'Basic usage with a string array. Tags are automatically styled with blue color.'
      }
    }
  },
  args: {
    values: ['Frontend', 'Backend', 'Database']
  }
}`,...(d=(u=a.parameters)==null?void 0:u.docs)==null?void 0:d.source}}};var p,m,h;r.parameters={...r.parameters,docs:{...(p=r.parameters)==null?void 0:p.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates using object values with custom colors for each tag.'
      }
    }
  },
  args: {
    values: [{
      label: 'Python',
      color: 'blue'
    }, {
      label: '3.11',
      color: 'green'
    }]
  }
}`,...(h=(m=r.parameters)==null?void 0:m.docs)==null?void 0:h.source}}};var b,y,v;s.parameters={...s.parameters,docs:{...(b=s.parameters)==null?void 0:b.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Highlights matching keywords within tag labels using BAITextHighlighter.'
      }
    }
  },
  args: {
    values: ['Frontend', 'Backend', 'Database'],
    highlightKeyword: 'end'
  }
}`,...(v=(y=s.parameters)==null?void 0:y.docs)==null?void 0:v.source}}};var w,B,x;t.parameters={...t.parameters,docs:{...(w=t.parameters)==null?void 0:w.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Showcases various Ant Design color presets available for tags.'
      }
    }
  },
  render: () => <BAIFlex direction="column" gap="md">
      <BAIDoubleTag values={[{
      label: 'Success',
      color: 'success'
    }, {
      label: 'Processing',
      color: 'processing'
    }]} />
      <BAIDoubleTag values={[{
      label: 'Warning',
      color: 'warning'
    }, {
      label: 'Error',
      color: 'error'
    }]} />
      <BAIDoubleTag values={[{
      label: 'Magenta',
      color: 'magenta'
    }, {
      label: 'Purple',
      color: 'purple'
    }, {
      label: 'Cyan',
      color: 'cyan'
    }]} />
      <BAIDoubleTag values={[{
      label: 'Gold',
      color: 'gold'
    }, {
      label: 'Lime',
      color: 'lime'
    }, {
      label: 'Volcano',
      color: 'volcano'
    }]} />
    </BAIFlex>
}`,...(x=(B=t.parameters)==null?void 0:B.docs)==null?void 0:x.source}}};var A,f,T;l.parameters={...l.parameters,docs:{...(A=l.parameters)==null?void 0:A.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Long tag labels are automatically truncated with ellipsis. Hover over the tags to see the full text in a tooltip.'
      }
    }
  },
  args: {
    values: [{
      label: 'Very Long Tag Label That Will Be Truncated',
      color: 'blue'
    }, {
      label: 'Another Long Label',
      color: 'orange'
    }]
  }
}`,...(T=(f=l.parameters)==null?void 0:f.docs)==null?void 0:T.source}}};var I,D,j;n.parameters={...n.parameters,docs:{...(I=n.parameters)==null?void 0:I.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Each tag can have custom styles (font weight, size, style, etc.) through the style property.'
      }
    }
  },
  args: {
    values: [{
      label: 'Custom',
      color: 'purple',
      style: {
        fontWeight: 'bold',
        fontSize: 14
      }
    }, {
      label: 'Styled',
      color: 'cyan',
      style: {
        fontStyle: 'italic'
      }
    }]
  }
}`,...(j=(D=n.parameters)==null?void 0:D.docs)==null?void 0:j.source}}};var S,W,C;i.parameters={...i.parameters,docs:{...(S=i.parameters)==null?void 0:S.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'When values array is empty, the component renders null.'
      }
    }
  },
  args: {
    values: []
  }
}`,...(C=(W=i.parameters)==null?void 0:W.docs)==null?void 0:C.source}}};var L,k,P;c.parameters={...c.parameters,docs:{...(L=c.parameters)==null?void 0:L.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Realistic examples showing how BAIDoubleTag is used in Backend.AI WebUI, such as displaying image names with versions, or resource allocations.'
      }
    }
  },
  render: () => <BAIFlex direction="column" gap="md" style={{
    alignItems: 'flex-start'
  }}>
      <div>
        <div style={{
        marginBottom: 8,
        fontWeight: 500
      }}>Container Image:</div>
        <BAIDoubleTag values={[{
        label: 'lablup/python',
        color: 'blue'
      }, {
        label: '3.11-ubuntu22.04',
        color: 'green'
      }]} />
      </div>
      <div>
        <div style={{
        marginBottom: 8,
        fontWeight: 500
      }}>GPU Allocation:</div>
        <BAIDoubleTag values={[{
        label: 'NVIDIA',
        color: 'processing'
      }, {
        label: 'A100',
        color: 'success'
      }, {
        label: '2 cores',
        color: 'orange'
      }]} />
      </div>
      <div>
        <div style={{
        marginBottom: 8,
        fontWeight: 500
      }}>Session Status:</div>
        <BAIDoubleTag values={[{
        label: 'RUNNING',
        color: 'success'
      }, {
        label: 'kernel-python',
        color: 'blue'
      }]} />
      </div>
      <div>
        <div style={{
        marginBottom: 8,
        fontWeight: 500
      }}>
          Search Result (keyword: &quot;tensor&quot;):
        </div>
        <BAIDoubleTag values={[{
        label: 'tensorflow',
        color: 'orange'
      }, {
        label: '2.12',
        color: 'cyan'
      }]} highlightKeyword="tensor" />
      </div>
    </BAIFlex>
}`,...(P=(k=c.parameters)==null?void 0:k.docs)==null?void 0:P.source}}};const Z=["Default","ObjectValues","WithHighlight","CustomColors","LongLabels","CustomStyles","Empty","RealWorldExample"];export{t as CustomColors,n as CustomStyles,a as Default,i as Empty,l as LongLabels,r as ObjectValues,c as RealWorldExample,s as WithHighlight,Z as __namedExportsOrder,Y as default};
