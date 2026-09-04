import{j as e}from"./iframe-DS2Dz7J1.js";import{B as a}from"./BAIFlex-DaddEd6z.js";import"./preload-helper-Dp1pzeXC.js";const M={title:"Flex/BAIFlex",component:a,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:"\n**BAIFlex** is a flexible layout component that simplifies flexbox layouts with an intuitive API.\n\n## Features\n- Simplified flexbox properties with short, intuitive names\n- Token-based gap system for consistent spacing\n- Array gap support for separate horizontal and vertical spacing\n- Full TypeScript support with proper types\n- Forwarded ref for DOM access\n\n## Props\n| Name | Type | Default | Description |\n|------|------|---------|-------------|\n| `direction` | `'row' \\| 'row-reverse' \\| 'column' \\| 'column-reverse'` | `'row'` | Flex direction |\n| `wrap` | `'nowrap' \\| 'wrap' \\| 'wrap-reverse'` | `'nowrap'` | Flex wrap behavior |\n| `justify` | `'start' \\| 'end' \\| 'center' \\| 'between' \\| 'around'` | `'start'` | Justify content |\n| `align` | `'start' \\| 'end' \\| 'center' \\| 'baseline' \\| 'stretch'` | `'center'` | Align items |\n| `gap` | `number \\| GapSize \\| [GapSize, GapSize]` | `0` | Gap between items (supports tokens and arrays) |\n\n## Gap Sizes\nToken-based gap sizes map to theme tokens:\n- `'xxs'` - Extra extra small\n- `'xs'` - Extra small\n- `'sm'` - Small\n- `'ms'` - Medium small\n- `'md'` - Medium\n- `'lg'` - Large\n- `'xl'` - Extra large\n- `'xxl'` - Extra extra large\n\nArray format: `[horizontal, vertical]` - e.g., `[16, 8]` or `['md', 'sm']`\n        "}}},argTypes:{direction:{control:{type:"select"},options:["row","row-reverse","column","column-reverse"],description:"Flex direction for arranging items",table:{type:{summary:"'row' | 'row-reverse' | 'column' | 'column-reverse'"},defaultValue:{summary:"row"}}},wrap:{control:{type:"select"},options:["nowrap","wrap","wrap-reverse"],description:"Whether items should wrap to new lines",table:{type:{summary:"'nowrap' | 'wrap' | 'wrap-reverse'"},defaultValue:{summary:"nowrap"}}},justify:{control:{type:"select"},options:["start","end","center","between","around"],description:"How items are justified along the main axis",table:{type:{summary:"'start' | 'end' | 'center' | 'between' | 'around'"},defaultValue:{summary:"start"}}},align:{control:{type:"select"},options:["start","end","center","baseline","stretch"],description:"How items are aligned along the cross axis",table:{type:{summary:"'start' | 'end' | 'center' | 'baseline' | 'stretch'"},defaultValue:{summary:"center"}}},gap:{control:{type:"number"},description:'Gap between items. Supports numbers (px), token strings ("xs", "md", "lg"), or arrays for [horizontal, vertical] spacing',table:{type:{summary:"number | 'xxs' | 'xs' | 'sm' | 'ms' | 'md' | 'lg' | 'xl' | 'xxl' | [GapSize, GapSize]"},defaultValue:{summary:"0"}}},children:{control:!1,description:"The items to arrange in the flex container",table:{type:{summary:"ReactNode"}}},style:{control:!1,description:"Additional CSS styles for the container",table:{type:{summary:"CSSProperties"}}}}},n=({...r})=>e.jsxs(a,{...r,children:[e.jsx("div",{style:{padding:"8px",background:"#1890ff",color:"white",borderRadius:"4px"},children:"Item 1"}),e.jsx("div",{style:{padding:"8px",background:"#52c41a",color:"white",borderRadius:"4px"},children:"Item 2"}),e.jsx("div",{style:{padding:"8px",background:"#faad14",color:"white",borderRadius:"4px"},children:"Item 3"}),e.jsx("div",{style:{padding:"8px",background:"#f5222d",color:"white",borderRadius:"4px"},children:"Item 4"})]}),s={name:"Basic",parameters:{docs:{description:{story:"Basic horizontal flex layout with default settings."}}},render:n,args:{direction:"row",justify:"start",align:"center",gap:0}},i={name:"ColumnDirection",parameters:{docs:{description:{story:"Vertical flex layout with column direction and gap spacing."}}},render:n,args:{direction:"column",gap:8}},d={name:"CenterJustified",parameters:{docs:{description:{story:"Items centered along the main axis with gap spacing."}}},render:n,args:{justify:"center",gap:16,style:{width:400,border:"1px dashed #ccc",padding:"16px"}}},o={name:"SpaceBetween",parameters:{docs:{description:{story:"Items distributed with equal space between them."}}},render:n,args:{justify:"between",style:{width:400,border:"1px dashed #ccc",padding:"16px"}}},p={name:"WrappingItems",parameters:{docs:{description:{story:"Items wrap to multiple lines when container width is exceeded."}}},render:({...r})=>e.jsx(a,{...r,children:Array.from({length:8},(E,t)=>e.jsxs("div",{style:{padding:"8px",background:"#1890ff",color:"white",borderRadius:"4px",minWidth:"80px"},children:["Item ",t+1]},t))}),args:{wrap:"wrap",gap:8,style:{width:300,border:"1px dashed #ccc",padding:"16px"}}},c={name:"TokenGaps",parameters:{docs:{description:{story:"Demonstrates token-based gap sizes (xs, md, xl) for consistent spacing across the design system."}}},render:({...r})=>e.jsxs("div",{children:[e.jsxs("div",{style:{marginBottom:"16px"},children:[e.jsx("h4",{children:"Small Gap (xs)"}),e.jsxs(a,{...r,gap:"xs",children:[e.jsx("div",{style:{padding:"8px",background:"#1890ff",color:"white",borderRadius:"4px"},children:"Item 1"}),e.jsx("div",{style:{padding:"8px",background:"#52c41a",color:"white",borderRadius:"4px"},children:"Item 2"}),e.jsx("div",{style:{padding:"8px",background:"#faad14",color:"white",borderRadius:"4px"},children:"Item 3"})]})]}),e.jsxs("div",{style:{marginBottom:"16px"},children:[e.jsx("h4",{children:"Medium Gap (md)"}),e.jsxs(a,{...r,gap:"md",children:[e.jsx("div",{style:{padding:"8px",background:"#1890ff",color:"white",borderRadius:"4px"},children:"Item 1"}),e.jsx("div",{style:{padding:"8px",background:"#52c41a",color:"white",borderRadius:"4px"},children:"Item 2"}),e.jsx("div",{style:{padding:"8px",background:"#faad14",color:"white",borderRadius:"4px"},children:"Item 3"})]})]}),e.jsxs("div",{children:[e.jsx("h4",{children:"Large Gap (xl)"}),e.jsxs(a,{...r,gap:"xl",children:[e.jsx("div",{style:{padding:"8px",background:"#1890ff",color:"white",borderRadius:"4px"},children:"Item 1"}),e.jsx("div",{style:{padding:"8px",background:"#52c41a",color:"white",borderRadius:"4px"},children:"Item 2"}),e.jsx("div",{style:{padding:"8px",background:"#faad14",color:"white",borderRadius:"4px"},children:"Item 3"})]})]})]}),args:{direction:"row"}},l={name:"ArrayGap",parameters:{docs:{description:{story:"Array gap format allows different horizontal and vertical spacing: [horizontal, vertical]."}}},render:({...r})=>e.jsx(a,{...r,children:Array.from({length:6},(E,t)=>e.jsxs("div",{style:{padding:"8px",background:"#722ed1",color:"white",borderRadius:"4px",minWidth:"60px"},children:["Item ",t+1]},t))}),args:{wrap:"wrap",gap:[16,8],style:{width:200,border:"1px dashed #ccc",padding:"16px"}}},m={name:"StretchAlignment",parameters:{docs:{description:{story:"Items stretched to fill the cross axis (container height)."}}},render:n,args:{align:"stretch",direction:"row",gap:8,style:{height:120,border:"1px dashed #ccc",padding:"16px"}}};var x,g,u;s.parameters={...s.parameters,docs:{...(x=s.parameters)==null?void 0:x.docs,source:{originalSource:`{
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'Basic horizontal flex layout with default settings.'
      }
    }
  },
  render: renderWithItems,
  args: {
    direction: 'row',
    justify: 'start',
    align: 'center',
    gap: 0
  }
}`,...(u=(g=s.parameters)==null?void 0:g.docs)==null?void 0:u.source}}};var h,y,w;i.parameters={...i.parameters,docs:{...(h=i.parameters)==null?void 0:h.docs,source:{originalSource:`{
  name: 'ColumnDirection',
  parameters: {
    docs: {
      description: {
        story: 'Vertical flex layout with column direction and gap spacing.'
      }
    }
  },
  render: renderWithItems,
  args: {
    direction: 'column',
    gap: 8
  }
}`,...(w=(y=i.parameters)==null?void 0:y.docs)==null?void 0:w.source}}};var b,f,v;d.parameters={...d.parameters,docs:{...(b=d.parameters)==null?void 0:b.docs,source:{originalSource:`{
  name: 'CenterJustified',
  parameters: {
    docs: {
      description: {
        story: 'Items centered along the main axis with gap spacing.'
      }
    }
  },
  render: renderWithItems,
  args: {
    justify: 'center',
    gap: 16,
    style: {
      width: 400,
      border: '1px dashed #ccc',
      padding: '16px'
    }
  }
}`,...(v=(f=d.parameters)==null?void 0:f.docs)==null?void 0:v.source}}};var I,j,k;o.parameters={...o.parameters,docs:{...(I=o.parameters)==null?void 0:I.docs,source:{originalSource:`{
  name: 'SpaceBetween',
  parameters: {
    docs: {
      description: {
        story: 'Items distributed with equal space between them.'
      }
    }
  },
  render: renderWithItems,
  args: {
    justify: 'between',
    style: {
      width: 400,
      border: '1px dashed #ccc',
      padding: '16px'
    }
  }
}`,...(k=(j=o.parameters)==null?void 0:j.docs)==null?void 0:k.source}}};var A,S,B;p.parameters={...p.parameters,docs:{...(A=p.parameters)==null?void 0:A.docs,source:{originalSource:`{
  name: 'WrappingItems',
  parameters: {
    docs: {
      description: {
        story: 'Items wrap to multiple lines when container width is exceeded.'
      }
    }
  },
  render: ({
    ...props
  }: BAIFlexProps) => <BAIFlex {...props}>
      {Array.from({
      length: 8
    }, (_, i) => <div key={i} style={{
      padding: '8px',
      background: '#1890ff',
      color: 'white',
      borderRadius: '4px',
      minWidth: '80px'
    }}>
          Item {i + 1}
        </div>)}
    </BAIFlex>,
  args: {
    wrap: 'wrap',
    gap: 8,
    style: {
      width: 300,
      border: '1px dashed #ccc',
      padding: '16px'
    }
  }
}`,...(B=(S=p.parameters)==null?void 0:S.docs)==null?void 0:B.source}}};var R,F,G;c.parameters={...c.parameters,docs:{...(R=c.parameters)==null?void 0:R.docs,source:{originalSource:`{
  name: 'TokenGaps',
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates token-based gap sizes (xs, md, xl) for consistent spacing across the design system.'
      }
    }
  },
  render: ({
    ...props
  }: BAIFlexProps) => <div>
      <div style={{
      marginBottom: '16px'
    }}>
        <h4>Small Gap (xs)</h4>
        <BAIFlex {...props} gap="xs">
          <div style={{
          padding: '8px',
          background: '#1890ff',
          color: 'white',
          borderRadius: '4px'
        }}>
            Item 1
          </div>
          <div style={{
          padding: '8px',
          background: '#52c41a',
          color: 'white',
          borderRadius: '4px'
        }}>
            Item 2
          </div>
          <div style={{
          padding: '8px',
          background: '#faad14',
          color: 'white',
          borderRadius: '4px'
        }}>
            Item 3
          </div>
        </BAIFlex>
      </div>
      <div style={{
      marginBottom: '16px'
    }}>
        <h4>Medium Gap (md)</h4>
        <BAIFlex {...props} gap="md">
          <div style={{
          padding: '8px',
          background: '#1890ff',
          color: 'white',
          borderRadius: '4px'
        }}>
            Item 1
          </div>
          <div style={{
          padding: '8px',
          background: '#52c41a',
          color: 'white',
          borderRadius: '4px'
        }}>
            Item 2
          </div>
          <div style={{
          padding: '8px',
          background: '#faad14',
          color: 'white',
          borderRadius: '4px'
        }}>
            Item 3
          </div>
        </BAIFlex>
      </div>
      <div>
        <h4>Large Gap (xl)</h4>
        <BAIFlex {...props} gap="xl">
          <div style={{
          padding: '8px',
          background: '#1890ff',
          color: 'white',
          borderRadius: '4px'
        }}>
            Item 1
          </div>
          <div style={{
          padding: '8px',
          background: '#52c41a',
          color: 'white',
          borderRadius: '4px'
        }}>
            Item 2
          </div>
          <div style={{
          padding: '8px',
          background: '#faad14',
          color: 'white',
          borderRadius: '4px'
        }}>
            Item 3
          </div>
        </BAIFlex>
      </div>
    </div>,
  args: {
    direction: 'row'
  }
}`,...(G=(F=c.parameters)==null?void 0:F.docs)==null?void 0:G.source}}};var W,z,C;l.parameters={...l.parameters,docs:{...(W=l.parameters)==null?void 0:W.docs,source:{originalSource:`{
  name: 'ArrayGap',
  parameters: {
    docs: {
      description: {
        story: 'Array gap format allows different horizontal and vertical spacing: [horizontal, vertical].'
      }
    }
  },
  render: ({
    ...props
  }: BAIFlexProps) => <BAIFlex {...props}>
      {Array.from({
      length: 6
    }, (_, i) => <div key={i} style={{
      padding: '8px',
      background: '#722ed1',
      color: 'white',
      borderRadius: '4px',
      minWidth: '60px'
    }}>
          Item {i + 1}
        </div>)}
    </BAIFlex>,
  args: {
    wrap: 'wrap',
    gap: [16, 8],
    style: {
      width: 200,
      border: '1px dashed #ccc',
      padding: '16px'
    }
  }
}`,...(C=(z=l.parameters)==null?void 0:z.docs)==null?void 0:C.source}}};var T,D,V;m.parameters={...m.parameters,docs:{...(T=m.parameters)==null?void 0:T.docs,source:{originalSource:`{
  name: 'StretchAlignment',
  parameters: {
    docs: {
      description: {
        story: 'Items stretched to fill the cross axis (container height).'
      }
    }
  },
  render: renderWithItems,
  args: {
    align: 'stretch',
    direction: 'row',
    gap: 8,
    style: {
      height: 120,
      border: '1px dashed #ccc',
      padding: '16px'
    }
  }
}`,...(V=(D=m.parameters)==null?void 0:D.docs)==null?void 0:V.source}}};const L=["Default","Column","JustifyCenter","SpaceBetween","WithWrap","WithTokenGaps","ArrayGap","AlignStretch"];export{m as AlignStretch,l as ArrayGap,i as Column,s as Default,d as JustifyCenter,o as SpaceBetween,c as WithTokenGaps,p as WithWrap,L as __namedExportsOrder,M as default};
