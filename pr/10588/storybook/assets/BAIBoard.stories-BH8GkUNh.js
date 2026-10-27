import{n as e,o as t}from"./rolldown-runtime-2s6bX4vc.js";import{l as n}from"./iframe-DR2sIF5r.js";import{n as r,t as i}from"./BAIFlex-CAz1t6J5.js";import{n as a,t as o}from"./BAIBoardItemTitle-B4n7-Vw5.js";import{useState as s}from"react";import{jsx as c,jsxs as l}from"react/jsx-runtime";import{c as u}from"react/compiler-runtime";import{Text as d}from"@lablup/ui-common/Text";import{Board as f}from"@lablup/ui-common/components/Board";var p,m;function h(){return(h=e((()=>{p=t(n(),1),m=({items:e,onItemsChange:t,renderItem:n=e=>e.data?.content,movable:r=!1,resizable:i=!1,bordered:a=!1,className:o,...s})=>{"use memo";return c(f,{...s,className:(0,p.default)(`bai-board`,o),items:e,renderItem:n,onItemsChange:e=>t({detail:e}),isMovable:r,isResizable:i,variant:a?`bordered`:`plain`})},m.displayName=`BAIBoard`})))()}var g,_,v,y,b,x,S,C;function w(){return(w=e((()=>{h(),a(),r(),g={title:`Board/BAIBoard`,component:m,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:"BAIBoard renders dashboard panels on a grid the user can rearrange. Each item draws its `data.content`; the board is controlled, so what `onItemsChange` reports is passed back as `items`."}}},argTypes:{movable:{description:`Renders a drag handle at the top-left of each item`,control:{type:`boolean`}},resizable:{description:`Renders a resize handle at the bottom-right of each item`,control:{type:`boolean`}},bordered:{description:`Draws a border on each item`,control:{type:`boolean`}},items:{control:!1},onItemsChange:{control:!1},renderItem:{control:!1}}},_=(e,t)=>l(i,{direction:`column`,align:`stretch`,style:{paddingInline:`var(--spacing-8)`,height:`100%`},children:[c(o,{title:e}),c(d,{children:t})]}),v=[{id:`sessions`,rowSpan:2,columnSpan:2,definition:{minRowSpan:2,minColumnSpan:2},data:{content:_(`My Sessions`,`12 running, 3 pending`)}},{id:`resources`,rowSpan:2,columnSpan:2,definition:{minRowSpan:2,minColumnSpan:2},data:{content:_(`My Resources`,`CPU 4 / 16, Memory 8 / 64 GiB`)}},{id:`recent`,rowSpan:3,columnSpan:4,definition:{minRowSpan:2,minColumnSpan:2},data:{content:_(`Recently Created Sessions`,`A table of sessions`)}}],y=e=>{"use memo";let t=u(4),[n,r]=s(v),i;t[0]===Symbol.for(`react.memo_cache_sentinel`)?(i=e=>r([...e.detail.items]),t[0]=i):i=t[0];let a;return t[1]!==e||t[2]!==n?(a=c(m,{...e,items:n,onItemsChange:i}),t[1]=e,t[2]=n,t[3]=a):a=t[3],a},b={name:`Basic`,render:e=>c(y,{...e}),args:{movable:!0,resizable:!0,bordered:!0},parameters:{docs:{description:{story:`A movable, resizable, bordered board, as the dashboards render it. Drag the handle at the top-left of an item, or focus it and use the arrow keys, then Enter.`}}}},x={name:`ReadOnly`,render:e=>c(y,{...e}),args:{movable:!1,resizable:!1,bordered:!0},parameters:{docs:{description:{story:`No handles: the layout is fixed.`}}}},S={render:e=>c(y,{...e}),args:{movable:!0,resizable:!1,bordered:!1},parameters:{docs:{description:{story:"Without `bordered`, items render on a surface with no border, as the start page does."}}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}},C=[`Default`,`ReadOnly`,`Plain`]})))()}w();export{b as Default,S as Plain,x as ReadOnly,C as __namedExportsOrder,g as default};