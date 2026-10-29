import{r as l,j as e,c as A}from"./iframe-PUIQnKtm.js";import{B as i}from"./BAIButton-Do888GW6.js";import{B as f}from"./BAIComplexSelect-EyKr0ZNM.js";import{B as p}from"./BAIDrawer-4uyqg0nP.js";import{B as I}from"./BAIFlex-C7N30Vvn.js";import"./preload-helper-Dp1pzeXC.js";import"./astryxLabel-WIT5SAqR.js";import"./compiled-D_YGP6zo.js";import"./useDevWarning-Bjt80N6e.js";import"./usePopover-DaY90E0Z.js";import"./rtlStyles-T4i24HtE.js";import"./composeEventHandlers-BolWE7qY.js";import"./InputClearButton-C7P4dGkm.js";import"./inputStyles.stylex-Bztz6H8O.js";import"./Field-B-flTNJX.js";import"./FieldStatus-rJlqL1VX.js";import"./FormLayoutContext-CUxXN8FB.js";import"./useIsHydrating-DK7--YXG.js";import"./optionDisabledReason2-BW_VBe6p.js";import"./IconWithTooltip2-CUAM_tti.js";import"./circle-alert-DX2LLNVR.js";import"./useIndicator-Cx2EOm0p.js";import"./Token-tLFdss28.js";import"./disabledInteraction-DdRhkQLD.js";import"./Divider-D1eQFFZm.js";import"./SelectorOption-BMEW0BLD.js";import"./Item-JsEZOXdY.js";import"./computeTargetAndRel-BGwjeA1c.js";import"./VStack-wO3q5YoQ.js";const U={title:"Overlay/BAIDrawer",component:p,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:"The project's drawer: ui-common's lab `Drawer` fork with a `[X] Title …… [extra]` header. A scrimmed drawer renders through `BAIDrawerPortal`, so a modal, select or drawer opened inside it stacks above it and Escape closes only the topmost layer."}}}},m=[{value:"alice",label:"alice@example.com",description:"Alice Kim"},{value:"bob",label:"bob@example.com",description:"Bob Lee"},{value:"carol",label:"carol@example.com",description:"Carol Park"}],c=()=>{"use memo";const r=A.c(2),[t,o]=l.useState(m[1]);let n;return r[0]!==t?(n=e.jsx(f,{label:"Owner",options:m,value:t,onChange:o,allowClear:!0}),r[0]=t,r[1]=n):n=r[1],n},s={render:r=>{const[t,o]=l.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx(i,{onClick:()=>o(!0),children:"Open drawer"}),e.jsx(p,{...r,open:t,onClose:()=>o(!1),extra:e.jsx(i,{size:"small",children:"Refresh"}),children:e.jsx(I,{direction:"column",align:"stretch",gap:"md",children:e.jsx(c,{})})})]})},args:{title:"Session details"}},a={render:()=>{const[r,t]=l.useState(!1),[o,n]=l.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx(i,{onClick:()=>t(!0),children:"Open drawer"}),e.jsxs(p,{title:"Outer drawer",open:r,onClose:()=>t(!1),size:560,children:[e.jsxs(I,{direction:"column",align:"stretch",gap:"md",children:[e.jsx(c,{}),e.jsx(i,{onClick:()=>n(!0),children:"Open nested drawer"})]}),e.jsx(p,{title:"Nested drawer",open:o,onClose:()=>n(!1),children:e.jsx(c,{})})]})]})}};var d,u,B;s.parameters={...s.parameters,docs:{...(d=s.parameters)==null?void 0:d.docs,source:{originalSource:`{
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
}`,...(O=(w=a.parameters)==null?void 0:w.docs)==null?void 0:O.source}}};const W=["Default","Nested"];export{s as Default,a as Nested,W as __namedExportsOrder,U as default};
