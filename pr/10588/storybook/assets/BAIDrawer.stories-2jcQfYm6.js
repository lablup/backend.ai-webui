import{n as e}from"./rolldown-runtime-2s6bX4vc.js";import{n as t,t as n}from"./BAIFlex-CAz1t6J5.js";import{n as r,t as i}from"./BAIButton-C-o5ANgR.js";import{n as a,t as o}from"./BAIComplexSelect-D5bBzCyR.js";import{n as s,t as c}from"./BAIDrawer-BA2xf6XB.js";import{useState as l}from"react";import{Fragment as u,jsx as d,jsxs as f}from"react/jsx-runtime";import{c as p}from"react/compiler-runtime";var m,h,g,_,v,y;function b(){return(b=e((()=>{r(),a(),s(),t(),m={title:`Overlay/BAIDrawer`,component:c,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:"The project's drawer: ui-common's lab `Drawer` fork with a `[X] Title …… [extra]` header. A scrimmed drawer renders through `BAIDrawerPortal`, so a modal, select or drawer opened inside it stacks above it and Escape closes only the topmost layer."}}}},h=[{value:`alice`,label:`alice@example.com`,description:`Alice Kim`},{value:`bob`,label:`bob@example.com`,description:`Bob Lee`},{value:`carol`,label:`carol@example.com`,description:`Carol Park`}],g=()=>{"use memo";let e=p(2),[t,n]=l(h[1]),r;return e[0]===t?r=e[1]:(r=d(o,{label:`Owner`,options:h,value:t,onChange:n,allowClear:!0}),e[0]=t,e[1]=r),r},_={render:e=>{let[t,r]=l(!1);return f(u,{children:[d(i,{onClick:()=>r(!0),children:`Open drawer`}),d(c,{...e,open:t,onClose:()=>r(!1),extra:d(i,{size:`small`,children:`Refresh`}),children:d(n,{direction:`column`,align:`stretch`,gap:`md`,children:d(g,{})})})]})},args:{title:`Session details`}},v={render:()=>{let[e,t]=l(!1),[r,a]=l(!1);return f(u,{children:[d(i,{onClick:()=>t(!0),children:`Open drawer`}),f(c,{title:`Outer drawer`,open:e,onClose:()=>t(!1),size:560,children:[f(n,{direction:`column`,align:`stretch`,gap:`md`,children:[d(g,{}),d(i,{onClick:()=>a(!0),children:`Open nested drawer`})]}),d(c,{title:`Nested drawer`,open:r,onClose:()=>a(!1),children:d(g,{})})]})]})}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [open, setOpen] = useState(false);
    return <>
        <BAIButton onClick={() => setOpen(true)}>Open drawer</BAIButton>
        <BAIDrawer {...args} open={open} onClose={() => setOpen(false)} extra={<BAIButton size="small">Refresh</BAIButton>}>
          <BAIFlex direction="column" align="stretch" gap="md">
            <OwnerSelect />
          </BAIFlex>
        </BAIDrawer>
      </>;
  },
  args: {
    title: 'Session details'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [open, setOpen] = useState(false);
    const [innerOpen, setInnerOpen] = useState(false);
    return <>
        <BAIButton onClick={() => setOpen(true)}>Open drawer</BAIButton>
        <BAIDrawer title="Outer drawer" open={open} onClose={() => setOpen(false)} size={560}>
          <BAIFlex direction="column" align="stretch" gap="md">
            <OwnerSelect />
            <BAIButton onClick={() => setInnerOpen(true)}>
              Open nested drawer
            </BAIButton>
          </BAIFlex>
          <BAIDrawer title="Nested drawer" open={innerOpen} onClose={() => setInnerOpen(false)}>
            <OwnerSelect />
          </BAIDrawer>
        </BAIDrawer>
      </>;
  }
}`,...v.parameters?.docs?.source}}},y=[`Default`,`Nested`]})))()}b();export{_ as Default,v as Nested,y as __namedExportsOrder,m as default};