import{r as a,j as e,c as j}from"./iframe-RCIKKD8L.js";import{B as o}from"./BAIButton-DVBOX4fI.js";import{B as C}from"./BAIComplexSelect-DAGFBoqT.js";import{B as l}from"./BAIDrawer-CiWgo0py.js";import{B as m}from"./BAIFlex-zKOxtLui.js";import"./preload-helper-Dp1pzeXC.js";import"./astryxLabel-C2wlU6sP.js";import"./compiled-D_YGP6zo.js";import"./usePopover-0tjKQHPN.js";import"./useDevWarning-D0SaLcFV.js";import"./rtlStyles-T4i24HtE.js";import"./isRenderable-BUV0eL6r.js";import"./InputClearButton-Cj9tk9rd.js";import"./FieldStatus-DSHJGKRX.js";import"./composeEventHandlers-BolWE7qY.js";import"./useIndicator-BQL7MnIg.js";import"./Token-fxxUEFLP.js";import"./useInteractiveRole-BNCLYx4d.js";import"./Divider-CLLwsvBD.js";import"./SelectorOption-ClQPcRMf.js";import"./Item-BYsukBIH.js";import"./computeTargetAndRel-BGwjeA1c.js";import"./VStack-DN4zovnT.js";const J={title:"Overlay/BAIDrawer",component:l,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:"The project's drawer: ui-common's lab `Drawer` fork with a `[X] Title …… [extra]` header. A scrimmed drawer renders through `BAIDrawerPortal`, so a modal, select or drawer opened inside it stacks above it and Escape closes only the topmost layer."}}}},u=[{value:"alice",label:"alice@example.com",description:"Alice Kim"},{value:"bob",label:"bob@example.com",description:"Bob Lee"},{value:"carol",label:"carol@example.com",description:"Carol Park"}],d=()=>{"use memo";const t=j.c(2),[n,r]=a.useState(u[1]);let s;return t[0]!==n?(s=e.jsx(C,{label:"Owner",options:u,value:n,onChange:r,allowClear:!0}),t[0]=n,t[1]=s):s=t[1],s},i={render:t=>{const[n,r]=a.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx(o,{onClick:()=>r(!0),children:"Open drawer"}),e.jsx(l,{...t,open:n,onClose:()=>r(!1),extra:e.jsx(o,{size:"small",children:"Refresh"}),children:e.jsx(m,{direction:"column",align:"stretch",gap:"md",children:e.jsx(d,{})})})]})},args:{title:"Session details"}},c={render:t=>{const[n,r]=a.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx(o,{onClick:()=>r(!0),children:"Open drawer"}),e.jsx(l,{...t,open:n,onClose:()=>r(!1),footer:e.jsxs(m,{justify:"end",gap:"sm",children:[e.jsx(o,{onClick:()=>r(!1),children:"Cancel"}),e.jsx(o,{type:"primary",onClick:()=>r(!1),children:"Save"})]}),children:e.jsx(d,{})})]})},args:{title:"Edit session"}},p={render:()=>{const[t,n]=a.useState(!1),[r,s]=a.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx(o,{onClick:()=>n(!0),children:"Open drawer"}),e.jsxs(l,{title:"Outer drawer",open:t,onClose:()=>n(!1),size:560,children:[e.jsxs(m,{direction:"column",align:"stretch",gap:"md",children:[e.jsx(d,{}),e.jsx(o,{onClick:()=>s(!0),children:"Open nested drawer"})]}),e.jsx(l,{title:"Nested drawer",open:r,onClose:()=>s(!1),children:e.jsx(d,{})})]})]})}};var B,x,O;i.parameters={...i.parameters,docs:{...(B=i.parameters)==null?void 0:B.docs,source:{originalSource:`{
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
}`,...(O=(x=i.parameters)==null?void 0:x.docs)==null?void 0:O.source}}};var I,f,A;c.parameters={...c.parameters,docs:{...(I=c.parameters)==null?void 0:I.docs,source:{originalSource:`{
  render: args => {
    const [open, setOpen] = useState(false);
    return <>
        <BAIButton onClick={() => setOpen(true)}>Open drawer</BAIButton>
        <BAIDrawer {...args} open={open} onClose={() => setOpen(false)} footer={<BAIFlex justify="end" gap="sm">
              <BAIButton onClick={() => setOpen(false)}>Cancel</BAIButton>
              <BAIButton type="primary" onClick={() => setOpen(false)}>
                Save
              </BAIButton>
            </BAIFlex>}>
          <OwnerSelect />
        </BAIDrawer>
      </>;
  },
  args: {
    title: 'Edit session'
  }
}`,...(A=(f=c.parameters)==null?void 0:f.docs)==null?void 0:A.source}}};var w,h,g;p.parameters={...p.parameters,docs:{...(w=p.parameters)==null?void 0:w.docs,source:{originalSource:`{
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
}`,...(g=(h=p.parameters)==null?void 0:h.docs)==null?void 0:g.source}}};const M=["Default","WithFooter","Nested"];export{i as Default,p as Nested,c as WithFooter,M as __namedExportsOrder,J as default};
