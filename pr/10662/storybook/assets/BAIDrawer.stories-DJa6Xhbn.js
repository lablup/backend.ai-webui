import{r as l,j as e,c as A}from"./iframe-ls1Z_K2m.js";import{B as i}from"./BAIButton-DKm7chQg.js";import{B as f}from"./BAIComplexSelect-BLF6W584.js";import{B as p}from"./BAIDrawer-DYpvos1_.js";import{B as I}from"./BAIFlex-Fm5ZtweF.js";import"./preload-helper-Dp1pzeXC.js";import"./astryxLabel-ND6UbB3v.js";import"./compiled-D_YGP6zo.js";import"./useDevWarning-DMsXdkro.js";import"./usePopover-DRxY92Pe.js";import"./rtlStyles-T4i24HtE.js";import"./composeEventHandlers-BolWE7qY.js";import"./InputClearButton-CzAM8ZbN.js";import"./inputStyles.stylex-Bztz6H8O.js";import"./Field-CfaOF608.js";import"./FieldStatus-DDoSCQAl.js";import"./FormLayoutContext-Cf8KnFlX.js";import"./useIsHydrating-EZEt6wbn.js";import"./useIndicator-d00l--J1.js";import"./Token-B0bduInR.js";import"./disabledInteraction-B1sdNN57.js";import"./Divider-ei6FqMZo.js";import"./SelectorOption-B6WX8zaV.js";import"./Item-CFRXRHkE.js";import"./computeTargetAndRel-BGwjeA1c.js";import"./VStack-dgYosIdH.js";const J={title:"Overlay/BAIDrawer",component:p,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:"The project's drawer: ui-common's lab `Drawer` fork with a `[X] Title …… [extra]` header. A scrimmed drawer renders through `BAIDrawerPortal`, so a modal, select or drawer opened inside it stacks above it and Escape closes only the topmost layer."}}}},m=[{value:"alice",label:"alice@example.com",description:"Alice Kim"},{value:"bob",label:"bob@example.com",description:"Bob Lee"},{value:"carol",label:"carol@example.com",description:"Carol Park"}],c=()=>{"use memo";const r=A.c(2),[t,o]=l.useState(m[1]);let n;return r[0]!==t?(n=e.jsx(f,{label:"Owner",options:m,value:t,onChange:o,allowClear:!0}),r[0]=t,r[1]=n):n=r[1],n},s={render:r=>{const[t,o]=l.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx(i,{onClick:()=>o(!0),children:"Open drawer"}),e.jsx(p,{...r,open:t,onClose:()=>o(!1),extra:e.jsx(i,{size:"small",children:"Refresh"}),children:e.jsx(I,{direction:"column",align:"stretch",gap:"md",children:e.jsx(c,{})})})]})},args:{title:"Session details"}},a={render:()=>{const[r,t]=l.useState(!1),[o,n]=l.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx(i,{onClick:()=>t(!0),children:"Open drawer"}),e.jsxs(p,{title:"Outer drawer",open:r,onClose:()=>t(!1),size:560,children:[e.jsxs(I,{direction:"column",align:"stretch",gap:"md",children:[e.jsx(c,{}),e.jsx(i,{onClick:()=>n(!0),children:"Open nested drawer"})]}),e.jsx(p,{title:"Nested drawer",open:o,onClose:()=>n(!1),children:e.jsx(c,{})})]})]})}};var d,u,B;s.parameters={...s.parameters,docs:{...(d=s.parameters)==null?void 0:d.docs,source:{originalSource:`{
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
}`,...(B=(u=s.parameters)==null?void 0:u.docs)==null?void 0:B.source}}};var x,w,O;a.parameters={...a.parameters,docs:{...(x=a.parameters)==null?void 0:x.docs,source:{originalSource:`{
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
}`,...(O=(w=a.parameters)==null?void 0:w.docs)==null?void 0:O.source}}};const M=["Default","Nested"];export{s as Default,a as Nested,M as __namedExportsOrder,J as default};
