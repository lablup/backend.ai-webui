import{r as i,j as e,B as o,A as ce}from"./iframe-X64pm6CJ.js";import{B as r}from"./BAIButton-D1zkvcGp.js";import{B as c}from"./BAIFlex-BRvSMUql.js";import{B as a}from"./BAIModal-BJVcK_3Y.js";import"./preload-helper-Dp1pzeXC.js";import"./astryxLabel-n-xbyPDb.js";import"./VStack-B2-ICMHH.js";const ye={title:"Modal/BAIModal",component:a,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:"\n**BAIModal** is backed by Astryx `Dialog` and keeps an antd-`Modal`-shaped\nprop surface (`open`, `onOk`/`onCancel`, `okButtonProps`, `footer`,\n`confirmLoading`, `styles`) so existing call sites need no edit.\n\n## BAI-Specific Props\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `confirmBeforeClose` | `boolean` | `false` | When true, calls `onConfirmClose` before closing |\n| `onConfirmClose` | `() => void \\| Promise<boolean>` | - | Callback before close; return false/reject to prevent |\n| `type` | `'normal' \\| 'warning' \\| 'error'` | `'normal'` | Visual variant that changes the header title color |\n| `windowActions` | `Array<'minimize' \\| 'maximize' \\| 'fullscreen'>` | - | Control which window actions are available. When provided (non-empty), window controls are rendered in the header. |\n| `onWindowStateChange` | `(state: WindowState) => void` | - | Callback when modal window state changes |\n| `minimizedPlacement` | `'bottomRight' \\| 'bottomLeft' \\| 'topRight' \\| 'topLeft'` | `'bottomRight'` | Placement of the minimized modal bar |\n\n## Additional Features\n- **Always centered**: the portal centres the dialog; `centered` is accepted and ignored\n- **Consistent styling**: Astryx `DialogHeader` / `LayoutContent` / `LayoutFooter` slots with dividers\n- **Window controls**: Minimize (compact bar), maximize (viewport with margin), fullscreen (full viewport)\n- **Unmounts when closed**: `destroyOnHidden` semantics are unconditional\n\n## Dropped in the Astryx conversion\n- **`draggable`**: antd's positioned wrapper is gone; the prop is accepted and ignored (zero app call sites used it)\n- **Page interaction while minimized**: the portal always paints a mask, so a minimized modal is still modal\n- **`stickyTitle`**: unconditionally true — the Astryx `Layout` header slot sits outside the scrolling content\n        "}}},argTypes:{confirmBeforeClose:{control:{type:"boolean"},description:"When true, calls onConfirmClose before closing. If onConfirmClose returns false or rejects, the close is prevented.",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},onConfirmClose:{control:!1,description:"Callback invoked before close when confirmBeforeClose is true. Return false or reject to prevent closing.",table:{type:{summary:"() => void | Promise<boolean>"}}},stickyTitle:{control:{type:"boolean"},description:"Makes the modal header sticky so it remains visible when body content is scrolled.",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},type:{control:{type:"select"},options:["normal","warning","error"],description:"Visual variant that changes the header title color. Uses Ant Design theme tokens for colors.",table:{type:{summary:"'normal' | 'warning' | 'error'"},defaultValue:{summary:"normal"}}},windowActions:{control:!1,description:"Control which window actions are available. When provided (non-empty), window controls are rendered in the header.",table:{type:{summary:"Array<'minimize' | 'maximize' | 'fullscreen'>"}}},onWindowStateChange:{action:"windowStateChanged",description:"Callback when modal window state changes.",table:{type:{summary:"(state: 'default' | 'minimized' | 'maximized' | 'fullscreen') => void"}}},minimizedPlacement:{control:{type:"select"},options:["bottomRight","bottomLeft","topRight","topLeft"],description:"Placement of the minimized modal bar. Similar to Ant Design notification placement.",table:{type:{summary:"'bottomRight' | 'bottomLeft' | 'topRight' | 'topLeft'"},defaultValue:{summary:"bottomRight"}}}}},de=()=>e.jsxs(c,{direction:"column",gap:"md",children:[e.jsx(o,{children:"This is sample content for the BAI Modal component. It demonstrates how content is displayed within the modal body."}),e.jsx(o,{children:"The modal provides consistent styling with proper header dividers, body padding, and footer layout following Backend.AI design guidelines."})]}),se=()=>e.jsx(c,{direction:"column",gap:"md",children:Array.from({length:20},(n,t)=>e.jsxs(o,{children:["Paragraph ",t+1,": This is a long content section to demonstrate scrollable body behavior and the sticky title feature. When the body overflows, the header should remain fixed at the top."]},t))}),m={name:"Basic",parameters:{docs:{description:{story:"Basic modal with standard props. Click the button to open the modal."}}},render:n=>{const[t,l]=i.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx(r,{type:"primary",onClick:()=>l(!0),children:"Open Modal"}),e.jsx(a,{...n,open:t,onOk:()=>l(!1),onCancel:()=>l(!1),children:e.jsx(de,{})})]})},args:{title:"Modal Title"}},h={parameters:{docs:{description:{story:"Demonstrates the `confirmBeforeClose` feature. When enabled, a confirmation dialog is shown before the modal closes. The close is only allowed if the user confirms."}}},render:()=>{const[n,t]=i.useState(!1),{modal:l}=ce.useApp();return e.jsxs(e.Fragment,{children:[e.jsx(r,{type:"primary",onClick:()=>t(!0),children:"Open Modal with Confirm"}),e.jsx(a,{title:"Form Modal",open:n,confirmBeforeClose:!0,onConfirmClose:()=>new Promise(s=>{l.confirm({title:"Discard changes?",content:"You have unsaved changes. Are you sure you want to close?",onOk:()=>s(!0),onCancel:()=>s(!1)})}),onOk:()=>t(!1),onCancel:()=>t(!1),children:e.jsx(c,{direction:"column",gap:"md",children:e.jsxs(o,{children:["This modal uses ",e.jsx("strong",{children:"confirmBeforeClose"}),". Try clicking the X or Cancel button — a confirmation dialog will appear before the modal actually closes."]})})})]})}},u={parameters:{docs:{description:{story:"The modal header stays fixed at the top as you scroll through long content in the body. Astryx `Layout` keeps the header slot outside the scrolling content, so `stickyTitle` is now unconditional and the prop is accepted-and-ignored."}}},render:()=>{const[n,t]=i.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx(r,{type:"primary",onClick:()=>t(!0),children:"Open Modal with Sticky Title"}),e.jsx(a,{title:"Sticky Header Modal",open:n,stickyTitle:!0,onOk:()=>t(!1),onCancel:()=>t(!1),styles:{body:{maxHeight:"300px",overflowY:"auto"}},children:e.jsx(se,{})})]})}},f={parameters:{docs:{description:{story:'Demonstrates the `type="warning"` variant. The modal title is rendered in the warning color (orange/amber) to indicate a potentially dangerous or irreversible action.'}}},render:()=>{const[n,t]=i.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx(r,{onClick:()=>t(!0),children:"Open Warning Modal"}),e.jsx(a,{title:"Warning: Irreversible Action",type:"warning",open:n,onOk:()=>t(!1),onCancel:()=>t(!1),okText:"Proceed",okButtonProps:{danger:!0},children:e.jsx(c,{direction:"column",gap:"md",children:e.jsxs(o,{children:["This action cannot be undone. The ",e.jsx("strong",{children:"warning"})," type highlights the title in an amber color to draw the user's attention to potentially risky operations."]})})})]})}},g={parameters:{docs:{description:{story:'Demonstrates the `type="error"` variant. The modal title is rendered in the error color (red) to signal a destructive or critical action.'}}},render:()=>{const[n,t]=i.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx(r,{danger:!0,onClick:()=>t(!0),children:"Open Error Modal"}),e.jsx(a,{title:"Error: Destructive Action",type:"error",open:n,onOk:()=>t(!1),onCancel:()=>t(!1),okText:"Delete",okButtonProps:{danger:!0},children:e.jsx(c,{direction:"column",gap:"md",children:e.jsxs(o,{children:["This will permanently delete the selected resource. The"," ",e.jsx("strong",{children:"error"})," type highlights the title in red to indicate a destructive operation."]})})})]})}},x={name:"All Type Variants",parameters:{docs:{description:{story:"Shows all available `type` variants side by side for comparison."}}},render:()=>{const[n,t]=i.useState(!1),[l,s]=i.useState(!1),[p,d]=i.useState(!1);return e.jsxs(c,{gap:"md",wrap:"wrap",children:[e.jsx(r,{type:"primary",onClick:()=>t(!0),children:"Normal"}),e.jsx(r,{onClick:()=>s(!0),children:"Warning"}),e.jsx(r,{danger:!0,onClick:()=>d(!0),children:"Error"}),e.jsx(a,{title:"Normal Modal Title",type:"normal",open:n,onOk:()=>t(!1),onCancel:()=>t(!1),children:e.jsx(o,{children:"Normal type -- default title color."})}),e.jsx(a,{title:"Warning Modal Title",type:"warning",open:l,onOk:()=>s(!1),onCancel:()=>s(!1),children:e.jsx(o,{children:"Warning type -- title in amber/orange color."})}),e.jsx(a,{title:"Error Modal Title",type:"error",open:p,onOk:()=>d(!1),onCancel:()=>d(!1),children:e.jsx(o,{children:"Error type -- title in red color."})})]})}},y={parameters:{docs:{description:{story:"Demonstrates the `windowActions` feature with all actions enabled. The modal header shows minimize, maximize, and fullscreen buttons. Click each button to toggle the corresponding state; clicking the same button again returns to the default state."}}},render:()=>{const[n,t]=i.useState(!1),[l,s]=i.useState("default");return e.jsxs(c,{direction:"column",gap:"md",align:"start",children:[e.jsx(r,{type:"primary",onClick:()=>t(!0),children:"Open Modal with Window Controls"}),e.jsxs(o,{children:["Current state: ",e.jsx("strong",{children:l})]}),e.jsx(a,{title:"Window Controls Modal",open:n,windowActions:["minimize","maximize","fullscreen"],onWindowStateChange:s,onOk:()=>t(!1),onCancel:()=>{t(!1),s("default")},footer:e.jsxs(c,{justify:"end",gap:"sm",children:[e.jsx(r,{onClick:()=>{t(!1),s("default")},children:"Cancel"}),e.jsx(r,{type:"primary",onClick:()=>{t(!1),s("default")},children:"OK"})]}),children:e.jsx(se,{})})]})}},B={parameters:{docs:{description:{story:`Demonstrates the minimize/restore flow. Click the minimize button (minus icon) in the header to collapse the modal to a compact bar at the corner of the viewport.

**Behaviors when minimized:**
- The dialog collapses to its title bar and parks at \`minimizedPlacement\`
- Body and footer are unmounted; only the header row renders
- Use the restore control in the header (or Escape) to bring the modal back
- PILOT-DECISION: the portal always paints a mask, so — unlike the antd
  version — the page behind is not reachable while minimized`}}},render:()=>{const[n,t]=i.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx(r,{type:"primary",onClick:()=>t(!0),children:"Open Minimizable Modal"}),e.jsx(a,{title:"Minimizable Modal",open:n,windowActions:["minimize"],onOk:()=>t(!1),onCancel:()=>t(!1),children:e.jsxs(c,{direction:"column",gap:"md",children:[e.jsxs(o,{children:["Click the ",e.jsx("strong",{children:"minus icon"})," in the modal header to minimize this modal. It will collapse to a compact bar showing only the title at the bottom of the viewport."]}),e.jsx(o,{children:"Click the minus icon again on the minimized bar to restore the modal to its default size."})]})})]})}},w={parameters:{docs:{description:{story:"Demonstrates the maximize/restore flow. Click the maximize button (border icon) to expand the modal to fill the viewport with a 24px margin on each side. Click the button again (now showing overlapping squares) to restore."}}},render:()=>{const[n,t]=i.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx(r,{type:"primary",onClick:()=>t(!0),children:"Open Maximizable Modal"}),e.jsx(a,{title:"Maximizable Modal",open:n,windowActions:["maximize"],onOk:()=>t(!1),onCancel:()=>t(!1),children:e.jsxs(c,{direction:"column",gap:"md",children:[e.jsxs(o,{children:["Click the ",e.jsx("strong",{children:"border icon"})," in the modal header to maximize this modal. It will expand to fill the viewport with a 24px margin."]}),e.jsx(o,{children:"Note: Dragging is automatically disabled when the modal is maximized and re-enabled when restored."})]})})]})}},A={parameters:{docs:{description:{story:"Demonstrates the fullscreen/exit flow. Click the fullscreen button to expand the modal to fill the entire viewport with no margin and no border-radius. Click the exit fullscreen button to restore."}}},render:()=>{const[n,t]=i.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx(r,{type:"primary",onClick:()=>t(!0),children:"Open Fullscreen Modal"}),e.jsx(a,{title:"Fullscreen Modal",open:n,windowActions:["fullscreen"],onOk:()=>t(!1),onCancel:()=>t(!1),children:e.jsxs(c,{direction:"column",gap:"md",children:[e.jsxs(o,{children:["Click the ",e.jsx("strong",{children:"fullscreen icon"})," in the modal header to expand this modal to fill the entire viewport (100vw x 100vh) with no margin and no border-radius."]}),e.jsx(o,{children:"Click the exit fullscreen icon to restore the modal to its default size."})]})})]})}},O={parameters:{docs:{description:{story:"Demonstrates the `minimizedPlacement` prop. Each modal minimizes to a different corner of the viewport. Default placement is `bottomRight`."}}},render:()=>{const[n,t]=i.useState(!1),[l,s]=i.useState(!1),[p,d]=i.useState(!1),[le,I]=i.useState(!1);return e.jsxs(c,{gap:"md",wrap:"wrap",children:[e.jsx(r,{type:"primary",onClick:()=>t(!0),children:"Bottom Right (default)"}),e.jsx(r,{type:"primary",onClick:()=>s(!0),children:"Bottom Left"}),e.jsx(r,{type:"primary",onClick:()=>d(!0),children:"Top Right"}),e.jsx(r,{type:"primary",onClick:()=>I(!0),children:"Top Left"}),e.jsx(a,{title:"Bottom Right",open:n,windowActions:["minimize"],minimizedPlacement:"bottomRight",onOk:()=>t(!1),onCancel:()=>t(!1),children:e.jsxs(o,{children:["Minimizes to ",e.jsx("strong",{children:"bottom-right"})," corner (default)."]})}),e.jsx(a,{title:"Bottom Left",open:l,windowActions:["minimize"],minimizedPlacement:"bottomLeft",onOk:()=>s(!1),onCancel:()=>s(!1),children:e.jsxs(o,{children:["Minimizes to ",e.jsx("strong",{children:"bottom-left"})," corner."]})}),e.jsx(a,{title:"Top Right",open:p,windowActions:["minimize"],minimizedPlacement:"topRight",onOk:()=>d(!1),onCancel:()=>d(!1),children:e.jsxs(o,{children:["Minimizes to ",e.jsx("strong",{children:"top-right"})," corner."]})}),e.jsx(a,{title:"Top Left",open:le,windowActions:["minimize"],minimizedPlacement:"topLeft",onOk:()=>I(!1),onCancel:()=>I(!1),children:e.jsxs(o,{children:["Minimizes to ",e.jsx("strong",{children:"top-left"})," corner."]})})]})}},C={parameters:{docs:{description:{story:"Demonstrates the `windowActions` prop for selectively enabling specific window controls. Each modal shows a different combination of window action buttons."}}},render:()=>{const[n,t]=i.useState(!1),[l,s]=i.useState(!1),[p,d]=i.useState(!1);return e.jsxs(c,{gap:"md",wrap:"wrap",children:[e.jsx(r,{type:"primary",onClick:()=>t(!0),children:"Minimize + Maximize"}),e.jsx(r,{type:"primary",onClick:()=>s(!0),children:"Maximize + Fullscreen"}),e.jsx(r,{type:"primary",onClick:()=>d(!0),children:"Minimize Only"}),e.jsx(a,{title:"Minimize + Maximize",open:n,windowActions:["minimize","maximize"],onOk:()=>t(!1),onCancel:()=>t(!1),children:e.jsxs(o,{children:["This modal has only ",e.jsx("strong",{children:"minimize"})," and"," ",e.jsx("strong",{children:"maximize"})," buttons. No fullscreen option."]})}),e.jsx(a,{title:"Maximize + Fullscreen",open:l,windowActions:["maximize","fullscreen"],onOk:()=>s(!1),onCancel:()=>s(!1),children:e.jsxs(o,{children:["This modal has only ",e.jsx("strong",{children:"maximize"})," and"," ",e.jsx("strong",{children:"fullscreen"})," buttons. No minimize option."]})}),e.jsx(a,{title:"Minimize Only",open:p,windowActions:["minimize"],onOk:()=>d(!1),onCancel:()=>d(!1),children:e.jsxs(o,{children:["This modal has only the ",e.jsx("strong",{children:"minimize"})," button."]})})]})}};var M,k,b;m.parameters={...m.parameters,docs:{...(M=m.parameters)==null?void 0:M.docs,source:{originalSource:`{
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'Basic modal with standard props. Click the button to open the modal.'
      }
    }
  },
  render: args => {
    const [open, setOpen] = useState(false);
    return <>
        <BAIButton type="primary" onClick={() => setOpen(true)}>
          Open Modal
        </BAIButton>
        <BAIModal {...args} open={open} onOk={() => setOpen(false)} onCancel={() => setOpen(false)}>
          <ModalContent />
        </BAIModal>
      </>;
  },
  args: {
    title: 'Modal Title'
  }
}`,...(b=(k=m.parameters)==null?void 0:k.docs)==null?void 0:b.source}}};var T,z,j;h.parameters={...h.parameters,docs:{...(T=h.parameters)==null?void 0:T.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the \`confirmBeforeClose\` feature. When enabled, a confirmation dialog is shown before the modal closes. The close is only allowed if the user confirms.'
      }
    }
  },
  render: () => {
    const [open, setOpen] = useState(false);
    const {
      modal
    } = App.useApp();
    return <>
        <BAIButton type="primary" onClick={() => setOpen(true)}>
          Open Modal with Confirm
        </BAIButton>
        <BAIModal title="Form Modal" open={open} confirmBeforeClose onConfirmClose={() => new Promise<boolean>(resolve => {
        modal.confirm({
          title: 'Discard changes?',
          content: 'You have unsaved changes. Are you sure you want to close?',
          onOk: () => resolve(true),
          onCancel: () => resolve(false)
        });
      })} onOk={() => setOpen(false)} onCancel={() => setOpen(false)}>
          <BAIFlex direction="column" gap="md">
            <BAIText>
              This modal uses <strong>confirmBeforeClose</strong>. Try clicking
              the X or Cancel button — a confirmation dialog will appear before
              the modal actually closes.
            </BAIText>
          </BAIFlex>
        </BAIModal>
      </>;
  }
}`,...(j=(z=h.parameters)==null?void 0:z.docs)==null?void 0:j.source}}};var S,v,F;u.parameters={...u.parameters,docs:{...(S=u.parameters)==null?void 0:S.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'The modal header stays fixed at the top as you scroll through long content in the body. Astryx \`Layout\` keeps the header slot outside the scrolling content, so \`stickyTitle\` is now unconditional and the prop is accepted-and-ignored.'
      }
    }
  },
  render: () => {
    const [open, setOpen] = useState(false);
    return <>
        <BAIButton type="primary" onClick={() => setOpen(true)}>
          Open Modal with Sticky Title
        </BAIButton>
        <BAIModal title="Sticky Header Modal" open={open} stickyTitle onOk={() => setOpen(false)} onCancel={() => setOpen(false)} styles={{
        body: {
          maxHeight: '300px',
          overflowY: 'auto'
        }
      }}>
          <LongModalContent />
        </BAIModal>
      </>;
  }
}`,...(F=(v=u.parameters)==null?void 0:v.docs)==null?void 0:F.source}}};var L,W,R;f.parameters={...f.parameters,docs:{...(L=f.parameters)==null?void 0:L.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the \`type="warning"\` variant. The modal title is rendered in the warning color (orange/amber) to indicate a potentially dangerous or irreversible action.'
      }
    }
  },
  render: () => {
    const [open, setOpen] = useState(false);
    return <>
        <BAIButton onClick={() => setOpen(true)}>Open Warning Modal</BAIButton>
        <BAIModal title="Warning: Irreversible Action" type="warning" open={open} onOk={() => setOpen(false)} onCancel={() => setOpen(false)} okText="Proceed" okButtonProps={{
        danger: true
      }}>
          <BAIFlex direction="column" gap="md">
            <BAIText>
              This action cannot be undone. The <strong>warning</strong> type
              highlights the title in an amber color to draw the user&apos;s
              attention to potentially risky operations.
            </BAIText>
          </BAIFlex>
        </BAIModal>
      </>;
  }
}`,...(R=(W=f.parameters)==null?void 0:W.docs)==null?void 0:R.source}}};var D,P,E;g.parameters={...g.parameters,docs:{...(D=g.parameters)==null?void 0:D.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the \`type="error"\` variant. The modal title is rendered in the error color (red) to signal a destructive or critical action.'
      }
    }
  },
  render: () => {
    const [open, setOpen] = useState(false);
    return <>
        <BAIButton danger onClick={() => setOpen(true)}>
          Open Error Modal
        </BAIButton>
        <BAIModal title="Error: Destructive Action" type="error" open={open} onOk={() => setOpen(false)} onCancel={() => setOpen(false)} okText="Delete" okButtonProps={{
        danger: true
      }}>
          <BAIFlex direction="column" gap="md">
            <BAIText>
              This will permanently delete the selected resource. The{' '}
              <strong>error</strong> type highlights the title in red to
              indicate a destructive operation.
            </BAIText>
          </BAIFlex>
        </BAIModal>
      </>;
  }
}`,...(E=(P=g.parameters)==null?void 0:P.docs)==null?void 0:E.source}}};var N,V,H;x.parameters={...x.parameters,docs:{...(N=x.parameters)==null?void 0:N.docs,source:{originalSource:`{
  name: 'All Type Variants',
  parameters: {
    docs: {
      description: {
        story: 'Shows all available \`type\` variants side by side for comparison.'
      }
    }
  },
  render: () => {
    const [openNormal, setOpenNormal] = useState(false);
    const [openWarning, setOpenWarning] = useState(false);
    const [openError, setOpenError] = useState(false);
    return <BAIFlex gap="md" wrap="wrap">
        <BAIButton type="primary" onClick={() => setOpenNormal(true)}>
          Normal
        </BAIButton>
        <BAIButton onClick={() => setOpenWarning(true)}>Warning</BAIButton>
        <BAIButton danger onClick={() => setOpenError(true)}>
          Error
        </BAIButton>

        <BAIModal title="Normal Modal Title" type="normal" open={openNormal} onOk={() => setOpenNormal(false)} onCancel={() => setOpenNormal(false)}>
          <BAIText>Normal type -- default title color.</BAIText>
        </BAIModal>

        <BAIModal title="Warning Modal Title" type="warning" open={openWarning} onOk={() => setOpenWarning(false)} onCancel={() => setOpenWarning(false)}>
          <BAIText>Warning type -- title in amber/orange color.</BAIText>
        </BAIModal>

        <BAIModal title="Error Modal Title" type="error" open={openError} onOk={() => setOpenError(false)} onCancel={() => setOpenError(false)}>
          <BAIText>Error type -- title in red color.</BAIText>
        </BAIModal>
      </BAIFlex>;
  }
}`,...(H=(V=x.parameters)==null?void 0:V.docs)==null?void 0:H.source}}};var U,Y,_;y.parameters={...y.parameters,docs:{...(U=y.parameters)==null?void 0:U.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the \`windowActions\` feature with all actions enabled. The modal header shows minimize, maximize, and fullscreen buttons. Click each button to toggle the corresponding state; clicking the same button again returns to the default state.'
      }
    }
  },
  render: () => {
    const [open, setOpen] = useState(false);
    const [currentState, setCurrentState] = useState<WindowState>('default');
    return <BAIFlex direction="column" gap="md" align="start">
        <BAIButton type="primary" onClick={() => setOpen(true)}>
          Open Modal with Window Controls
        </BAIButton>
        <BAIText>
          Current state: <strong>{currentState}</strong>
        </BAIText>
        <BAIModal title="Window Controls Modal" open={open} windowActions={['minimize', 'maximize', 'fullscreen']} onWindowStateChange={setCurrentState} onOk={() => setOpen(false)} onCancel={() => {
        setOpen(false);
        setCurrentState('default');
      }} footer={<BAIFlex justify="end" gap="sm">
              <BAIButton onClick={() => {
          setOpen(false);
          setCurrentState('default');
        }}>
                Cancel
              </BAIButton>
              <BAIButton type="primary" onClick={() => {
          setOpen(false);
          setCurrentState('default');
        }}>
                OK
              </BAIButton>
            </BAIFlex>}>
          <LongModalContent />
        </BAIModal>
      </BAIFlex>;
  }
}`,...(_=(Y=y.parameters)==null?void 0:Y.docs)==null?void 0:_.source}}};var q,K,X;B.parameters={...B.parameters,docs:{...(q=B.parameters)==null?void 0:q.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: \`Demonstrates the minimize/restore flow. Click the minimize button (minus icon) in the header to collapse the modal to a compact bar at the corner of the viewport.

**Behaviors when minimized:**
- The dialog collapses to its title bar and parks at \\\`minimizedPlacement\\\`
- Body and footer are unmounted; only the header row renders
- Use the restore control in the header (or Escape) to bring the modal back
- PILOT-DECISION: the portal always paints a mask, so — unlike the antd
  version — the page behind is not reachable while minimized\`
      }
    }
  },
  render: () => {
    const [open, setOpen] = useState(false);
    return <>
        <BAIButton type="primary" onClick={() => setOpen(true)}>
          Open Minimizable Modal
        </BAIButton>
        <BAIModal title="Minimizable Modal" open={open} windowActions={['minimize']} onOk={() => setOpen(false)} onCancel={() => setOpen(false)}>
          <BAIFlex direction="column" gap="md">
            <BAIText>
              Click the <strong>minus icon</strong> in the modal header to
              minimize this modal. It will collapse to a compact bar showing
              only the title at the bottom of the viewport.
            </BAIText>
            <BAIText>
              Click the minus icon again on the minimized bar to restore the
              modal to its default size.
            </BAIText>
          </BAIFlex>
        </BAIModal>
      </>;
  }
}`,...(X=(K=B.parameters)==null?void 0:K.docs)==null?void 0:X.source}}};var G,J,Q;w.parameters={...w.parameters,docs:{...(G=w.parameters)==null?void 0:G.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the maximize/restore flow. Click the maximize button (border icon) to expand the modal to fill the viewport with a 24px margin on each side. Click the button again (now showing overlapping squares) to restore.'
      }
    }
  },
  render: () => {
    const [open, setOpen] = useState(false);
    return <>
        <BAIButton type="primary" onClick={() => setOpen(true)}>
          Open Maximizable Modal
        </BAIButton>
        <BAIModal title="Maximizable Modal" open={open} windowActions={['maximize']} onOk={() => setOpen(false)} onCancel={() => setOpen(false)}>
          <BAIFlex direction="column" gap="md">
            <BAIText>
              Click the <strong>border icon</strong> in the modal header to
              maximize this modal. It will expand to fill the viewport with a
              24px margin.
            </BAIText>
            <BAIText>
              Note: Dragging is automatically disabled when the modal is
              maximized and re-enabled when restored.
            </BAIText>
          </BAIFlex>
        </BAIModal>
      </>;
  }
}`,...(Q=(J=w.parameters)==null?void 0:J.docs)==null?void 0:Q.source}}};var Z,$,ee;A.parameters={...A.parameters,docs:{...(Z=A.parameters)==null?void 0:Z.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the fullscreen/exit flow. Click the fullscreen button to expand the modal to fill the entire viewport with no margin and no border-radius. Click the exit fullscreen button to restore.'
      }
    }
  },
  render: () => {
    const [open, setOpen] = useState(false);
    return <>
        <BAIButton type="primary" onClick={() => setOpen(true)}>
          Open Fullscreen Modal
        </BAIButton>
        <BAIModal title="Fullscreen Modal" open={open} windowActions={['fullscreen']} onOk={() => setOpen(false)} onCancel={() => setOpen(false)}>
          <BAIFlex direction="column" gap="md">
            <BAIText>
              Click the <strong>fullscreen icon</strong> in the modal header to
              expand this modal to fill the entire viewport (100vw x 100vh) with
              no margin and no border-radius.
            </BAIText>
            <BAIText>
              Click the exit fullscreen icon to restore the modal to its default
              size.
            </BAIText>
          </BAIFlex>
        </BAIModal>
      </>;
  }
}`,...(ee=($=A.parameters)==null?void 0:$.docs)==null?void 0:ee.source}}};var te,ne,oe;O.parameters={...O.parameters,docs:{...(te=O.parameters)==null?void 0:te.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the \`minimizedPlacement\` prop. Each modal minimizes to a different corner of the viewport. Default placement is \`bottomRight\`.'
      }
    }
  },
  render: () => {
    const [openBR, setOpenBR] = useState(false);
    const [openBL, setOpenBL] = useState(false);
    const [openTR, setOpenTR] = useState(false);
    const [openTL, setOpenTL] = useState(false);
    return <BAIFlex gap="md" wrap="wrap">
        <BAIButton type="primary" onClick={() => setOpenBR(true)}>
          Bottom Right (default)
        </BAIButton>
        <BAIButton type="primary" onClick={() => setOpenBL(true)}>
          Bottom Left
        </BAIButton>
        <BAIButton type="primary" onClick={() => setOpenTR(true)}>
          Top Right
        </BAIButton>
        <BAIButton type="primary" onClick={() => setOpenTL(true)}>
          Top Left
        </BAIButton>

        <BAIModal title="Bottom Right" open={openBR} windowActions={['minimize']} minimizedPlacement="bottomRight" onOk={() => setOpenBR(false)} onCancel={() => setOpenBR(false)}>
          <BAIText>
            Minimizes to <strong>bottom-right</strong> corner (default).
          </BAIText>
        </BAIModal>

        <BAIModal title="Bottom Left" open={openBL} windowActions={['minimize']} minimizedPlacement="bottomLeft" onOk={() => setOpenBL(false)} onCancel={() => setOpenBL(false)}>
          <BAIText>
            Minimizes to <strong>bottom-left</strong> corner.
          </BAIText>
        </BAIModal>

        <BAIModal title="Top Right" open={openTR} windowActions={['minimize']} minimizedPlacement="topRight" onOk={() => setOpenTR(false)} onCancel={() => setOpenTR(false)}>
          <BAIText>
            Minimizes to <strong>top-right</strong> corner.
          </BAIText>
        </BAIModal>

        <BAIModal title="Top Left" open={openTL} windowActions={['minimize']} minimizedPlacement="topLeft" onOk={() => setOpenTL(false)} onCancel={() => setOpenTL(false)}>
          <BAIText>
            Minimizes to <strong>top-left</strong> corner.
          </BAIText>
        </BAIModal>
      </BAIFlex>;
  }
}`,...(oe=(ne=O.parameters)==null?void 0:ne.docs)==null?void 0:oe.source}}};var re,ie,ae;C.parameters={...C.parameters,docs:{...(re=C.parameters)==null?void 0:re.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the \`windowActions\` prop for selectively enabling specific window controls. Each modal shows a different combination of window action buttons.'
      }
    }
  },
  render: () => {
    const [openMinMax, setOpenMinMax] = useState(false);
    const [openMaxFull, setOpenMaxFull] = useState(false);
    const [openMinOnly, setOpenMinOnly] = useState(false);
    return <BAIFlex gap="md" wrap="wrap">
        <BAIButton type="primary" onClick={() => setOpenMinMax(true)}>
          Minimize + Maximize
        </BAIButton>
        <BAIButton type="primary" onClick={() => setOpenMaxFull(true)}>
          Maximize + Fullscreen
        </BAIButton>
        <BAIButton type="primary" onClick={() => setOpenMinOnly(true)}>
          Minimize Only
        </BAIButton>

        <BAIModal title="Minimize + Maximize" open={openMinMax} windowActions={['minimize', 'maximize']} onOk={() => setOpenMinMax(false)} onCancel={() => setOpenMinMax(false)}>
          <BAIText>
            This modal has only <strong>minimize</strong> and{' '}
            <strong>maximize</strong> buttons. No fullscreen option.
          </BAIText>
        </BAIModal>

        <BAIModal title="Maximize + Fullscreen" open={openMaxFull} windowActions={['maximize', 'fullscreen']} onOk={() => setOpenMaxFull(false)} onCancel={() => setOpenMaxFull(false)}>
          <BAIText>
            This modal has only <strong>maximize</strong> and{' '}
            <strong>fullscreen</strong> buttons. No minimize option.
          </BAIText>
        </BAIModal>

        <BAIModal title="Minimize Only" open={openMinOnly} windowActions={['minimize']} onOk={() => setOpenMinOnly(false)} onCancel={() => setOpenMinOnly(false)}>
          <BAIText>
            This modal has only the <strong>minimize</strong> button.
          </BAIText>
        </BAIModal>
      </BAIFlex>;
  }
}`,...(ae=(ie=C.parameters)==null?void 0:ie.docs)==null?void 0:ae.source}}};const Be=["Default","ConfirmBeforeClose","StickyTitle","WarningType","ErrorType","TypeVariants","WindowControls","MinimizedState","MaximizedState","FullscreenState","MinimizedPlacement","SelectiveWindowActions"];export{h as ConfirmBeforeClose,m as Default,g as ErrorType,A as FullscreenState,w as MaximizedState,O as MinimizedPlacement,B as MinimizedState,C as SelectiveWindowActions,u as StickyTitle,x as TypeVariants,f as WarningType,y as WindowControls,Be as __namedExportsOrder,ye as default};
