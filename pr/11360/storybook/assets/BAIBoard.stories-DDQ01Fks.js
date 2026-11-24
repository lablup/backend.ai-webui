import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-DlPsW1c0.js";import{t as n}from"./jsx-runtime-MKhVqBIO.js";import{t as r}from"./compiler-runtime-DU4U6aph.js";import{n as i,t as a}from"./Text-CehdAJfb.js";import{n as o,t as s}from"./BAIFlex-DnaoYTJ1.js";import{n as c,t as l}from"./BAIBoard-Dz2Ks239.js";import{n as u,t as d}from"./BAIBoardItemTitle-uRW2uslW.js";var f,p,m,h,g,_,v,y,b,x,S;function C(){return(C=e((()=>{f=r(),c(),u(),o(),i(),p=t(),m=n(),h={title:`Board/BAIBoard`,component:l,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:"BAIBoard renders dashboard panels on a grid the user can rearrange. Each item draws its `data.content` as the description, and the `BAIBoardItemTitle` in it as the title row; the board is controlled, so what `onItemsChange` reports is passed back as `items`."}}},argTypes:{movable:{description:`Renders a drag handle at the top-left of each item`,control:{type:`boolean`}},resizable:{description:`Renders a resize handle at the bottom-right of each item`,control:{type:`boolean`}},bordered:{description:`Draws a border on each item`,control:{type:`boolean`}},items:{control:!1},onItemsChange:{control:!1}}},g=(e,t)=>(0,m.jsxs)(s,{direction:`column`,align:`stretch`,children:[(0,m.jsx)(d,{title:e}),(0,m.jsx)(a,{children:t})]}),_=[{id:`sessions`,rowSpan:2,columnSpan:2,definition:{minRowSpan:2,minColumnSpan:2},data:{content:g(`My Sessions`,`12 running, 3 pending`)}},{id:`resources`,rowSpan:2,columnSpan:2,definition:{minRowSpan:2,minColumnSpan:2},data:{content:g(`My Resources`,`CPU 4 / 16, Memory 8 / 64 GiB`)}},{id:`recent`,rowSpan:3,columnSpan:4,definition:{minRowSpan:2,minColumnSpan:2},data:{content:g(`Recently Created Sessions`,`A table of sessions`)}}],v=e=>{"use memo";let t=(0,f.c)(4),[n,r]=(0,p.useState)(_),i;t[0]===Symbol.for(`react.memo_cache_sentinel`)?(i=e=>r([...e.detail.items]),t[0]=i):i=t[0];let a;return t[1]!==e||t[2]!==n?(a=(0,m.jsx)(l,{...e,items:n,onItemsChange:i}),t[1]=e,t[2]=n,t[3]=a):a=t[3],a},y={name:`Basic`,render:e=>(0,m.jsx)(v,{...e}),args:{movable:!0,resizable:!0,bordered:!0},parameters:{docs:{description:{story:`A movable, resizable, bordered board, as the dashboards render it. Drag the handle at the top-left of an item, or focus it and use the arrow keys, then Enter.`}}}},b={name:`ReadOnly`,render:e=>(0,m.jsx)(v,{...e}),args:{movable:!1,resizable:!1,bordered:!0},parameters:{docs:{description:{story:`No handles: the layout is fixed.`}}}},x={render:e=>(0,m.jsx)(v,{...e}),args:{movable:!0,resizable:!1,bordered:!1},parameters:{docs:{description:{story:"Without `bordered`, items render on a surface with no border, as the start page does."}}}},S=[`Default`,`ReadOnly`,`Plain`],y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  name: 'Basic',
  render: args => <ControlledBoard {...args} />,
  args: {
    movable: true,
    resizable: true,
    bordered: true
  },
  parameters: {
    docs: {
      description: {
        story: 'A movable, resizable, bordered board, as the dashboards render it. Drag the handle at the top-left of an item, or focus it and use the arrow keys, then Enter.'
      }
    }
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  name: 'ReadOnly',
  render: args => <ControlledBoard {...args} />,
  args: {
    movable: false,
    resizable: false,
    bordered: true
  },
  parameters: {
    docs: {
      description: {
        story: 'No handles: the layout is fixed.'
      }
    }
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: args => <ControlledBoard {...args} />,
  args: {
    movable: true,
    resizable: false,
    bordered: false
  },
  parameters: {
    docs: {
      description: {
        story: 'Without \`bordered\`, items render on a surface with no border, as the start page does.'
      }
    }
  }
}`,...x.parameters?.docs?.source}}}})))()}C();export{y as Default,x as Plain,b as ReadOnly,S as __namedExportsOrder,h as default};