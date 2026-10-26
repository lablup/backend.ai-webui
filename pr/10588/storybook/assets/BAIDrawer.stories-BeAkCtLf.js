import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-D0Ex1IVc.js";import{t as n}from"./jsx-runtime-MKhVqBIO.js";import{t as r}from"./compiler-runtime-CdReTaax.js";import{n as i,t as a}from"./BAIDrawer-BaoPMryB.js";import{n as o,t as s}from"./BAIFlex-BOFoS5KY.js";import{n as c,t as l}from"./BAIButton-BkLrwIfz.js";import{n as u,t as d}from"./BAIComplexSelect-D0tPiGCY.js";var f,p,m,h,g,_,v,y,b;function x(){return(x=e((()=>{f=r(),c(),u(),i(),o(),p=t(),m=n(),h={title:`Overlay/BAIDrawer`,component:a,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:"The project's drawer: ui-common's lab `Drawer` fork with a `[X] Title …… [extra]` header. A scrimmed drawer renders through `BAIDrawerPortal`, so a modal, select or drawer opened inside it stacks above it and Escape closes only the topmost layer."}}}},g=[{value:`alice`,label:`alice@example.com`,description:`Alice Kim`},{value:`bob`,label:`bob@example.com`,description:`Bob Lee`},{value:`carol`,label:`carol@example.com`,description:`Carol Park`}],_=()=>{"use memo";let e=(0,f.c)(2),[t,n]=(0,p.useState)(g[1]),r;return e[0]===t?r=e[1]:(r=(0,m.jsx)(d,{label:`Owner`,options:g,value:t,onChange:n,allowClear:!0}),e[0]=t,e[1]=r),r},v={render:e=>{let[t,n]=(0,p.useState)(!1);return(0,m.jsxs)(m.Fragment,{children:[(0,m.jsx)(l,{onClick:()=>n(!0),children:`Open drawer`}),(0,m.jsx)(a,{...e,open:t,onClose:()=>n(!1),extra:(0,m.jsx)(l,{size:`small`,children:`Refresh`}),children:(0,m.jsx)(s,{direction:`column`,align:`stretch`,gap:`md`,children:(0,m.jsx)(_,{})})})]})},args:{title:`Session details`}},y={render:()=>{let[e,t]=(0,p.useState)(!1),[n,r]=(0,p.useState)(!1);return(0,m.jsxs)(m.Fragment,{children:[(0,m.jsx)(l,{onClick:()=>t(!0),children:`Open drawer`}),(0,m.jsxs)(a,{title:`Outer drawer`,open:e,onClose:()=>t(!1),size:560,children:[(0,m.jsxs)(s,{direction:`column`,align:`stretch`,gap:`md`,children:[(0,m.jsx)(_,{}),(0,m.jsx)(l,{onClick:()=>r(!0),children:`Open nested drawer`})]}),(0,m.jsx)(a,{title:`Nested drawer`,open:n,onClose:()=>r(!1),children:(0,m.jsx)(_,{})})]})]})}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source}}},b=[`Default`,`Nested`]})))()}x();export{v as Default,y as Nested,b as __namedExportsOrder,h as default};