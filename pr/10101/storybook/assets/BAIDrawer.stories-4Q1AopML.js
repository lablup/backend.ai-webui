import{r as l,j as e,c as A}from"./iframe-CZLDMuou.js";import{B as i}from"./BAIButton-T3qNV4d1.js";import{B as f}from"./BAIComplexSelect-CVlj-OWu.js";import{B as p}from"./BAIDrawer-DgNBZrQ2.js";import{B as I}from"./BAIFlex-BvezgJFc.js";import"./preload-helper-Dp1pzeXC.js";import"./astryxLabel-mcGBUk3V.js";import"./compiled-D_YGP6zo.js";import"./useDevWarning-DV_8Gg8D.js";import"./usePopover-DkoGT_6X.js";import"./rtlStyles-T4i24HtE.js";import"./composeEventHandlers-BolWE7qY.js";import"./isRenderable-BUV0eL6r.js";import"./InputGroupContext-DoHiwmGy.js";import"./FieldStatus-CvNBhQb_.js";import"./useIndicator-l7-hJZe0.js";import"./Token--tSVRudK.js";import"./useInteractiveRole-CeAuUgEW.js";import"./Divider-BLxMMCXC.js";import"./SelectorOption-_Enh1_x_.js";import"./Item-l-DilCOk.js";import"./computeTargetAndRel-BGwjeA1c.js";import"./VStack-BHpfcDtT.js";const q={title:"Overlay/BAIDrawer",component:p,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:"The project's drawer: ui-common's lab `Drawer` fork with a `[X] Title …… [extra]` header. A scrimmed drawer renders through `BAIDrawerPortal`, so a modal, select or drawer opened inside it stacks above it and Escape closes only the topmost layer."}}}},m=[{value:"alice",label:"alice@example.com",description:"Alice Kim"},{value:"bob",label:"bob@example.com",description:"Bob Lee"},{value:"carol",label:"carol@example.com",description:"Carol Park"}],c=()=>{"use memo";const r=A.c(2),[t,s]=l.useState(m[1]);let n;return r[0]!==t?(n=e.jsx(f,{label:"Owner",options:m,value:t,onChange:s,allowClear:!0}),r[0]=t,r[1]=n):n=r[1],n},o={render:r=>{const[t,s]=l.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx(i,{onClick:()=>s(!0),children:"Open drawer"}),e.jsx(p,{...r,open:t,onClose:()=>s(!1),extra:e.jsx(i,{size:"small",children:"Refresh"}),children:e.jsx(I,{direction:"column",align:"stretch",gap:"md",children:e.jsx(c,{})})})]})},args:{title:"Session details"}},a={render:()=>{const[r,t]=l.useState(!1),[s,n]=l.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx(i,{onClick:()=>t(!0),children:"Open drawer"}),e.jsxs(p,{title:"Outer drawer",open:r,onClose:()=>t(!1),size:560,children:[e.jsxs(I,{direction:"column",align:"stretch",gap:"md",children:[e.jsx(c,{}),e.jsx(i,{onClick:()=>n(!0),children:"Open nested drawer"})]}),e.jsx(p,{title:"Nested drawer",open:s,onClose:()=>n(!1),children:e.jsx(c,{})})]})]})}};var d,u,B;o.parameters={...o.parameters,docs:{...(d=o.parameters)==null?void 0:d.docs,source:{originalSource:`{
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
}`,...(B=(u=o.parameters)==null?void 0:u.docs)==null?void 0:B.source}}};var x,w,O;a.parameters={...a.parameters,docs:{...(x=a.parameters)==null?void 0:x.docs,source:{originalSource:`{
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
}`,...(O=(w=a.parameters)==null?void 0:w.docs)==null?void 0:O.source}}};const G=["Default","Nested"];export{o as Default,a as Nested,G as __namedExportsOrder,q as default};
