import{r as l,j as e,c as A}from"./iframe-BpIv03t8.js";import{B as i}from"./BAIButton-XBEDQsNF.js";import{B as f}from"./BAIComplexSelect-B2GBN-_Y.js";import{B as p}from"./BAIDrawer-BLcNBAGl.js";import{B as I}from"./BAIFlex-CoiuIBv3.js";import"./preload-helper-Dp1pzeXC.js";import"./astryxLabel-SsQQSoV_.js";import"./compiled-D_YGP6zo.js";import"./useDevWarning-D60IRoCI.js";import"./usePopover-BjG8PBcQ.js";import"./rtlStyles-T4i24HtE.js";import"./composeEventHandlers-BolWE7qY.js";import"./InputClearButton-C25hLHG7.js";import"./inputStyles.stylex-Bztz6H8O.js";import"./Field-htaWAuMK.js";import"./FieldStatus-C0gQQwx8.js";import"./FormLayoutContext-Cu45vxwn.js";import"./useIsHydrating-C4VgAPR5.js";import"./useIndicator-BEdf18A1.js";import"./Token-CF0Q4p3c.js";import"./disabledInteraction-cFdS9rq2.js";import"./Divider-CbbCScS8.js";import"./SelectorOption-CMh5ArWF.js";import"./Item-n0NBDfBs.js";import"./computeTargetAndRel-BGwjeA1c.js";import"./VStack-CUr2MpBM.js";const J={title:"Overlay/BAIDrawer",component:p,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:"The project's drawer: ui-common's lab `Drawer` fork with a `[X] Title …… [extra]` header. A scrimmed drawer renders through `BAIDrawerPortal`, so a modal, select or drawer opened inside it stacks above it and Escape closes only the topmost layer."}}}},m=[{value:"alice",label:"alice@example.com",description:"Alice Kim"},{value:"bob",label:"bob@example.com",description:"Bob Lee"},{value:"carol",label:"carol@example.com",description:"Carol Park"}],c=()=>{"use memo";const r=A.c(2),[t,o]=l.useState(m[1]);let n;return r[0]!==t?(n=e.jsx(f,{label:"Owner",options:m,value:t,onChange:o,allowClear:!0}),r[0]=t,r[1]=n):n=r[1],n},s={render:r=>{const[t,o]=l.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx(i,{onClick:()=>o(!0),children:"Open drawer"}),e.jsx(p,{...r,open:t,onClose:()=>o(!1),extra:e.jsx(i,{size:"small",children:"Refresh"}),children:e.jsx(I,{direction:"column",align:"stretch",gap:"md",children:e.jsx(c,{})})})]})},args:{title:"Session details"}},a={render:()=>{const[r,t]=l.useState(!1),[o,n]=l.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx(i,{onClick:()=>t(!0),children:"Open drawer"}),e.jsxs(p,{title:"Outer drawer",open:r,onClose:()=>t(!1),size:560,children:[e.jsxs(I,{direction:"column",align:"stretch",gap:"md",children:[e.jsx(c,{}),e.jsx(i,{onClick:()=>n(!0),children:"Open nested drawer"})]}),e.jsx(p,{title:"Nested drawer",open:o,onClose:()=>n(!1),children:e.jsx(c,{})})]})]})}};var d,u,B;s.parameters={...s.parameters,docs:{...(d=s.parameters)==null?void 0:d.docs,source:{originalSource:`{
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
