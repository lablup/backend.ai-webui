import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-MKhVqBIO.js";import{n,t as r}from"./BAIFlex-BOFoS5KY.js";var i,a,o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j;function M(){return(M=e((()=>{n(),i=t(),x={title:`Flex/BAIFlex`,component:r,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:"\n**BAIFlex** is a flexible layout component that simplifies flexbox layouts with an intuitive API.\n\n## Features\n- Simplified flexbox properties with short, intuitive names\n- Token-based gap system for consistent spacing\n- Array gap support for separate horizontal and vertical spacing\n- Full TypeScript support with proper types\n- Forwarded ref for DOM access\n\n## Props\n| Name | Type | Default | Description |\n|------|------|---------|-------------|\n| `direction` | `'row' \\| 'row-reverse' \\| 'column' \\| 'column-reverse'` | `'row'` | Flex direction |\n| `wrap` | `'nowrap' \\| 'wrap' \\| 'wrap-reverse'` | `'nowrap'` | Flex wrap behavior |\n| `justify` | `'start' \\| 'end' \\| 'center' \\| 'between' \\| 'around'` | `'start'` | Justify content |\n| `align` | `'start' \\| 'end' \\| 'center' \\| 'baseline' \\| 'stretch'` | `'center'` | Align items |\n| `gap` | `number \\| GapSize \\| [GapSize, GapSize]` | `0` | Gap between items (supports tokens and arrays) |\n\n## Gap Sizes\nToken-based gap sizes map to theme tokens:\n- `'xxs'` - Extra extra small\n- `'xs'` - Extra small\n- `'sm'` - Small\n- `'ms'` - Medium small\n- `'md'` - Medium\n- `'lg'` - Large\n- `'xl'` - Extra large\n- `'xxl'` - Extra extra large\n\nArray format: `[horizontal, vertical]` - e.g., `[16, 8]` or `['md', 'sm']`\n        "}}},argTypes:{direction:{control:{type:`select`},options:[`row`,`row-reverse`,`column`,`column-reverse`],description:`Flex direction for arranging items`,table:{type:{summary:`'row' | 'row-reverse' | 'column' | 'column-reverse'`},defaultValue:{summary:`row`}}},wrap:{control:{type:`select`},options:[`nowrap`,`wrap`,`wrap-reverse`],description:`Whether items should wrap to new lines`,table:{type:{summary:`'nowrap' | 'wrap' | 'wrap-reverse'`},defaultValue:{summary:`nowrap`}}},justify:{control:{type:`select`},options:[`start`,`end`,`center`,`between`,`around`],description:`How items are justified along the main axis`,table:{type:{summary:`'start' | 'end' | 'center' | 'between' | 'around'`},defaultValue:{summary:`start`}}},align:{control:{type:`select`},options:[`start`,`end`,`center`,`baseline`,`stretch`],description:`How items are aligned along the cross axis`,table:{type:{summary:`'start' | 'end' | 'center' | 'baseline' | 'stretch'`},defaultValue:{summary:`center`}}},gap:{control:{type:`number`},description:`Gap between items. Supports numbers (px), token strings ("xs", "md", "lg"), or arrays for [horizontal, vertical] spacing`,table:{type:{summary:`number | 'xxs' | 'xs' | 'sm' | 'ms' | 'md' | 'lg' | 'xl' | 'xxl' | [GapSize, GapSize]`},defaultValue:{summary:`0`}}},children:{control:!1,description:`The items to arrange in the flex container`,table:{type:{summary:`ReactNode`}}},style:{control:!1,description:`Additional CSS styles for the container`,table:{type:{summary:`CSSProperties`}}}}},S=({...e})=>(0,i.jsxs)(r,{...e,children:[(0,i.jsx)(`div`,{style:{padding:`8px`,background:`#1890ff`,color:`white`,borderRadius:`4px`},children:`Item 1`}),(0,i.jsx)(`div`,{style:{padding:`8px`,background:`#52c41a`,color:`white`,borderRadius:`4px`},children:`Item 2`}),(0,i.jsx)(`div`,{style:{padding:`8px`,background:`#faad14`,color:`white`,borderRadius:`4px`},children:`Item 3`}),(0,i.jsx)(`div`,{style:{padding:`8px`,background:`#f5222d`,color:`white`,borderRadius:`4px`},children:`Item 4`})]}),C={name:`Basic`,parameters:{docs:{description:{story:`Basic horizontal flex layout with default settings.`}}},render:S,args:{direction:`row`,justify:`start`,align:`center`,gap:0}},w={name:`ColumnDirection`,parameters:{docs:{description:{story:`Vertical flex layout with column direction and gap spacing.`}}},render:S,args:{direction:`column`,gap:8}},T={name:`CenterJustified`,parameters:{docs:{description:{story:`Items centered along the main axis with gap spacing.`}}},render:S,args:{justify:`center`,gap:16,style:{width:400,border:`1px dashed #ccc`,padding:`16px`}}},E={name:`SpaceBetween`,parameters:{docs:{description:{story:`Items distributed with equal space between them.`}}},render:S,args:{justify:`between`,style:{width:400,border:`1px dashed #ccc`,padding:`16px`}}},D={name:`WrappingItems`,parameters:{docs:{description:{story:`Items wrap to multiple lines when container width is exceeded.`}}},render:({...e})=>(0,i.jsx)(r,{...e,children:Array.from({length:8},(e,t)=>(0,i.jsxs)(`div`,{style:{padding:`8px`,background:`#1890ff`,color:`white`,borderRadius:`4px`,minWidth:`80px`},children:[`Item `,t+1]},t))}),args:{wrap:`wrap`,gap:8,style:{width:300,border:`1px dashed #ccc`,padding:`16px`}}},O={name:`TokenGaps`,parameters:{docs:{description:{story:`Demonstrates token-based gap sizes (xs, md, xl) for consistent spacing across the design system.`}}},render:({...e})=>(0,i.jsxs)(`div`,{children:[(0,i.jsxs)(`div`,{style:{marginBottom:`16px`},children:[(0,i.jsx)(`h4`,{children:`Small Gap (xs)`}),(0,i.jsxs)(r,{...e,gap:`xs`,children:[(0,i.jsx)(`div`,{style:{padding:`8px`,background:`#1890ff`,color:`white`,borderRadius:`4px`},children:`Item 1`}),(0,i.jsx)(`div`,{style:{padding:`8px`,background:`#52c41a`,color:`white`,borderRadius:`4px`},children:`Item 2`}),(0,i.jsx)(`div`,{style:{padding:`8px`,background:`#faad14`,color:`white`,borderRadius:`4px`},children:`Item 3`})]})]}),(0,i.jsxs)(`div`,{style:{marginBottom:`16px`},children:[(0,i.jsx)(`h4`,{children:`Medium Gap (md)`}),(0,i.jsxs)(r,{...e,gap:`md`,children:[(0,i.jsx)(`div`,{style:{padding:`8px`,background:`#1890ff`,color:`white`,borderRadius:`4px`},children:`Item 1`}),(0,i.jsx)(`div`,{style:{padding:`8px`,background:`#52c41a`,color:`white`,borderRadius:`4px`},children:`Item 2`}),(0,i.jsx)(`div`,{style:{padding:`8px`,background:`#faad14`,color:`white`,borderRadius:`4px`},children:`Item 3`})]})]}),(0,i.jsxs)(`div`,{children:[(0,i.jsx)(`h4`,{children:`Large Gap (xl)`}),(0,i.jsxs)(r,{...e,gap:`xl`,children:[(0,i.jsx)(`div`,{style:{padding:`8px`,background:`#1890ff`,color:`white`,borderRadius:`4px`},children:`Item 1`}),(0,i.jsx)(`div`,{style:{padding:`8px`,background:`#52c41a`,color:`white`,borderRadius:`4px`},children:`Item 2`}),(0,i.jsx)(`div`,{style:{padding:`8px`,background:`#faad14`,color:`white`,borderRadius:`4px`},children:`Item 3`})]})]})]}),args:{direction:`row`}},k={name:`ArrayGap`,parameters:{docs:{description:{story:`Array gap format allows different horizontal and vertical spacing: [horizontal, vertical].`}}},render:({...e})=>(0,i.jsx)(r,{...e,children:Array.from({length:6},(e,t)=>(0,i.jsxs)(`div`,{style:{padding:`8px`,background:`#722ed1`,color:`white`,borderRadius:`4px`,minWidth:`60px`},children:[`Item `,t+1]},t))}),args:{wrap:`wrap`,gap:[16,8],style:{width:200,border:`1px dashed #ccc`,padding:`16px`}}},A={name:`StretchAlignment`,parameters:{docs:{description:{story:`Items stretched to fill the cross axis (container height).`}}},render:S,args:{align:`stretch`,direction:`row`,gap:8,style:{height:120,border:`1px dashed #ccc`,padding:`16px`}}},C.parameters={...C.parameters,docs:{...(a=C.parameters)==null?void 0:a.docs,source:{originalSource:`{
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
}`,...(o=C.parameters)==null||(o=o.docs)==null?void 0:o.source}}},w.parameters={...w.parameters,docs:{...(s=w.parameters)==null?void 0:s.docs,source:{originalSource:`{
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
}`,...(c=w.parameters)==null||(c=c.docs)==null?void 0:c.source}}},T.parameters={...T.parameters,docs:{...(l=T.parameters)==null?void 0:l.docs,source:{originalSource:`{
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
}`,...(u=T.parameters)==null||(u=u.docs)==null?void 0:u.source}}},E.parameters={...E.parameters,docs:{...(d=E.parameters)==null?void 0:d.docs,source:{originalSource:`{
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
}`,...(f=E.parameters)==null||(f=f.docs)==null?void 0:f.source}}},D.parameters={...D.parameters,docs:{...(p=D.parameters)==null?void 0:p.docs,source:{originalSource:`{
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
}`,...(m=D.parameters)==null||(m=m.docs)==null?void 0:m.source}}},O.parameters={...O.parameters,docs:{...(h=O.parameters)==null?void 0:h.docs,source:{originalSource:`{
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
}`,...(g=O.parameters)==null||(g=g.docs)==null?void 0:g.source}}},k.parameters={...k.parameters,docs:{...(_=k.parameters)==null?void 0:_.docs,source:{originalSource:`{
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
}`,...(v=k.parameters)==null||(v=v.docs)==null?void 0:v.source}}},A.parameters={...A.parameters,docs:{...(y=A.parameters)==null?void 0:y.docs,source:{originalSource:`{
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
}`,...(b=A.parameters)==null||(b=b.docs)==null?void 0:b.source}}},j=[`Default`,`Column`,`JustifyCenter`,`SpaceBetween`,`WithWrap`,`WithTokenGaps`,`ArrayGap`,`AlignStretch`]})))()}M();export{A as AlignStretch,k as ArrayGap,w as Column,C as Default,T as JustifyCenter,E as SpaceBetween,O as WithTokenGaps,D as WithWrap,j as __namedExportsOrder,x as default};