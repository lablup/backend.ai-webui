import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-DlPsW1c0.js";import{t as n}from"./jsx-runtime-MKhVqBIO.js";import{n as r,t as i}from"./BAIModal-BZ6aiFpg.js";import{b as a,h as o,m as s,y as c}from"./iframe-Bw4N_l-q.js";import{n as l,t as u}from"./BAIFlex-DnaoYTJ1.js";import{n as ee,t as d}from"./BAIButton-CQhUs6-Y.js";var f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q,$;function te(){return(te=e((()=>{a(),ee(),l(),r(),o(),f=t(),p=n(),R={title:`Modal/BAIModal`,component:i,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:"\n**BAIModal** is backed by Astryx `Dialog` and keeps an antd-`Modal`-shaped\nprop surface (`open`, `onOk`/`onCancel`, `okButtonProps`, `footer`,\n`confirmLoading`, `styles`) so existing call sites need no edit.\n\n## BAI-Specific Props\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `confirmBeforeClose` | `boolean` | `false` | When true, calls `onConfirmClose` before closing |\n| `onConfirmClose` | `() => void \\| Promise<boolean>` | - | Callback before close; return false/reject to prevent |\n| `type` | `'normal' \\| 'warning' \\| 'error'` | `'normal'` | Visual variant that changes the header title color |\n| `windowActions` | `Array<'minimize' \\| 'maximize' \\| 'fullscreen'>` | - | Control which window actions are available. When provided (non-empty), window controls are rendered in the header. |\n| `onWindowStateChange` | `(state: WindowState) => void` | - | Callback when modal window state changes |\n| `minimizedPlacement` | `'bottomRight' \\| 'bottomLeft' \\| 'topRight' \\| 'topLeft'` | `'bottomRight'` | Placement of the minimized modal bar |\n\n## Additional Features\n- **Always centered**: the portal centres the dialog; `centered` is accepted and ignored\n- **Consistent styling**: Astryx `DialogHeader` / `LayoutContent` / `LayoutFooter` slots with dividers\n- **Window controls**: Minimize (compact bar), maximize (viewport with margin), fullscreen (full viewport)\n- **Keeps content while closed**: content mounts on the first open and stays mounted; wrap in `BAIUnmountAfterClose` to drop it on close\n\n## Dropped in the Astryx conversion\n- **`draggable`**: antd's positioned wrapper is gone; the prop is accepted and ignored (zero app call sites used it)\n- **Page interaction while minimized**: the portal always paints a mask, so a minimized modal is still modal\n- **`stickyTitle`**: unconditionally true — the Astryx `Layout` header slot sits outside the scrolling content\n        "}}},argTypes:{confirmBeforeClose:{control:{type:`boolean`},description:`When true, calls onConfirmClose before closing. If onConfirmClose returns false or rejects, the close is prevented.`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},onConfirmClose:{control:!1,description:`Callback invoked before close when confirmBeforeClose is true. Return false or reject to prevent closing.`,table:{type:{summary:`() => void | Promise<boolean>`}}},stickyTitle:{control:{type:`boolean`},description:`Makes the modal header sticky so it remains visible when body content is scrolled.`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},type:{control:{type:`select`},options:[`normal`,`warning`,`error`],description:`Visual variant that changes the header title color. Uses Ant Design theme tokens for colors.`,table:{type:{summary:`'normal' | 'warning' | 'error'`},defaultValue:{summary:`normal`}}},windowActions:{control:!1,description:`Control which window actions are available. When provided (non-empty), window controls are rendered in the header.`,table:{type:{summary:`Array<'minimize' | 'maximize' | 'fullscreen'>`}}},onWindowStateChange:{action:`windowStateChanged`,description:`Callback when modal window state changes.`,table:{type:{summary:`(state: 'default' | 'minimized' | 'maximized' | 'fullscreen') => void`}}},minimizedPlacement:{control:{type:`select`},options:[`bottomRight`,`bottomLeft`,`topRight`,`topLeft`],description:`Placement of the minimized modal bar. Similar to Ant Design notification placement.`,table:{type:{summary:`'bottomRight' | 'bottomLeft' | 'topRight' | 'topLeft'`},defaultValue:{summary:`bottomRight`}}}}},z=()=>(0,p.jsxs)(u,{direction:`column`,gap:`md`,children:[(0,p.jsx)(s,{children:`This is sample content for the BAI Modal component. It demonstrates how content is displayed within the modal body.`}),(0,p.jsx)(s,{children:`The modal provides consistent styling with proper header dividers, body padding, and footer layout following Backend.AI design guidelines.`})]}),B=()=>(0,p.jsx)(u,{direction:`column`,gap:`md`,children:Array.from({length:20},(e,t)=>(0,p.jsxs)(s,{children:[`Paragraph `,t+1,`: This is a long content section to demonstrate scrollable body behavior and the sticky title feature. When the body overflows, the header should remain fixed at the top.`]},t))}),V={name:`Basic`,parameters:{docs:{description:{story:`Basic modal with standard props. Click the button to open the modal.`}}},render:e=>{let[t,n]=(0,f.useState)(!1);return(0,p.jsxs)(p.Fragment,{children:[(0,p.jsx)(d,{type:`primary`,onClick:()=>n(!0),children:`Open Modal`}),(0,p.jsx)(i,{...e,open:t,onOk:()=>n(!1),onCancel:()=>n(!1),children:(0,p.jsx)(z,{})})]})},args:{title:`Modal Title`}},H={parameters:{docs:{description:{story:"Demonstrates the `confirmBeforeClose` feature. When enabled, a confirmation dialog is shown before the modal closes. The close is only allowed if the user confirms."}}},render:()=>{let[e,t]=(0,f.useState)(!1),{modal:n}=c.useApp();return(0,p.jsxs)(p.Fragment,{children:[(0,p.jsx)(d,{type:`primary`,onClick:()=>t(!0),children:`Open Modal with Confirm`}),(0,p.jsx)(i,{title:`Form Modal`,open:e,confirmBeforeClose:!0,onConfirmClose:()=>new Promise(e=>{n.confirm({title:`Discard changes?`,content:`You have unsaved changes. Are you sure you want to close?`,onOk:()=>e(!0),onCancel:()=>e(!1)})}),onOk:()=>t(!1),onCancel:()=>t(!1),children:(0,p.jsx)(u,{direction:`column`,gap:`md`,children:(0,p.jsxs)(s,{children:[`This modal uses `,(0,p.jsx)(`strong`,{children:`confirmBeforeClose`}),`. Try clicking the X or Cancel button — a confirmation dialog will appear before the modal actually closes.`]})})})]})}},U={parameters:{docs:{description:{story:"The modal header stays fixed at the top as you scroll through long content in the body. Astryx `Layout` keeps the header slot outside the scrolling content, so `stickyTitle` is now unconditional and the prop is accepted-and-ignored."}}},render:()=>{let[e,t]=(0,f.useState)(!1);return(0,p.jsxs)(p.Fragment,{children:[(0,p.jsx)(d,{type:`primary`,onClick:()=>t(!0),children:`Open Modal with Sticky Title`}),(0,p.jsx)(i,{title:`Sticky Header Modal`,open:e,stickyTitle:!0,onOk:()=>t(!1),onCancel:()=>t(!1),styles:{body:{maxHeight:`300px`,overflowY:`auto`}},children:(0,p.jsx)(B,{})})]})}},W={parameters:{docs:{description:{story:'Demonstrates the `type="warning"` variant. The modal title is rendered in the warning color (orange/amber) to indicate a potentially dangerous or irreversible action.'}}},render:()=>{let[e,t]=(0,f.useState)(!1);return(0,p.jsxs)(p.Fragment,{children:[(0,p.jsx)(d,{onClick:()=>t(!0),children:`Open Warning Modal`}),(0,p.jsx)(i,{title:`Warning: Irreversible Action`,type:`warning`,open:e,onOk:()=>t(!1),onCancel:()=>t(!1),okText:`Proceed`,okButtonProps:{danger:!0},children:(0,p.jsx)(u,{direction:`column`,gap:`md`,children:(0,p.jsxs)(s,{children:[`This action cannot be undone. The `,(0,p.jsx)(`strong`,{children:`warning`}),` type highlights the title in an amber color to draw the user's attention to potentially risky operations.`]})})})]})}},G={parameters:{docs:{description:{story:'Demonstrates the `type="error"` variant. The modal title is rendered in the error color (red) to signal a destructive or critical action.'}}},render:()=>{let[e,t]=(0,f.useState)(!1);return(0,p.jsxs)(p.Fragment,{children:[(0,p.jsx)(d,{danger:!0,onClick:()=>t(!0),children:`Open Error Modal`}),(0,p.jsx)(i,{title:`Error: Destructive Action`,type:`error`,open:e,onOk:()=>t(!1),onCancel:()=>t(!1),okText:`Delete`,okButtonProps:{danger:!0},children:(0,p.jsx)(u,{direction:`column`,gap:`md`,children:(0,p.jsxs)(s,{children:[`This will permanently delete the selected resource. The`,` `,(0,p.jsx)(`strong`,{children:`error`}),` type highlights the title in red to indicate a destructive operation.`]})})})]})}},K={name:`All Type Variants`,parameters:{docs:{description:{story:"Shows all available `type` variants side by side for comparison."}}},render:()=>{let[e,t]=(0,f.useState)(!1),[n,r]=(0,f.useState)(!1),[a,o]=(0,f.useState)(!1);return(0,p.jsxs)(u,{gap:`md`,wrap:`wrap`,children:[(0,p.jsx)(d,{type:`primary`,onClick:()=>t(!0),children:`Normal`}),(0,p.jsx)(d,{onClick:()=>r(!0),children:`Warning`}),(0,p.jsx)(d,{danger:!0,onClick:()=>o(!0),children:`Error`}),(0,p.jsx)(i,{title:`Normal Modal Title`,type:`normal`,open:e,onOk:()=>t(!1),onCancel:()=>t(!1),children:(0,p.jsx)(s,{children:`Normal type -- default title color.`})}),(0,p.jsx)(i,{title:`Warning Modal Title`,type:`warning`,open:n,onOk:()=>r(!1),onCancel:()=>r(!1),children:(0,p.jsx)(s,{children:`Warning type -- title in amber/orange color.`})}),(0,p.jsx)(i,{title:`Error Modal Title`,type:`error`,open:a,onOk:()=>o(!1),onCancel:()=>o(!1),children:(0,p.jsx)(s,{children:`Error type -- title in red color.`})})]})}},q={parameters:{docs:{description:{story:"Demonstrates the `windowActions` feature with all actions enabled. The modal header shows minimize, maximize, and fullscreen buttons. Click each button to toggle the corresponding state; clicking the same button again returns to the default state."}}},render:()=>{let[e,t]=(0,f.useState)(!1),[n,r]=(0,f.useState)(`default`);return(0,p.jsxs)(u,{direction:`column`,gap:`md`,align:`start`,children:[(0,p.jsx)(d,{type:`primary`,onClick:()=>t(!0),children:`Open Modal with Window Controls`}),(0,p.jsxs)(s,{children:[`Current state: `,(0,p.jsx)(`strong`,{children:n})]}),(0,p.jsx)(i,{title:`Window Controls Modal`,open:e,windowActions:[`minimize`,`maximize`,`fullscreen`],onWindowStateChange:r,onOk:()=>t(!1),onCancel:()=>{t(!1),r(`default`)},footer:(0,p.jsxs)(u,{justify:`end`,gap:`sm`,children:[(0,p.jsx)(d,{onClick:()=>{t(!1),r(`default`)},children:`Cancel`}),(0,p.jsx)(d,{type:`primary`,onClick:()=>{t(!1),r(`default`)},children:`OK`})]}),children:(0,p.jsx)(B,{})})]})}},J={parameters:{docs:{description:{story:`Demonstrates the minimize/restore flow. Click the minimize button (minus icon) in the header to collapse the modal to a compact bar at the corner of the viewport.

**Behaviors when minimized:**
- The dialog collapses to its title bar and parks at \`minimizedPlacement\`
- Body and footer are unmounted; only the header row renders
- Use the restore control in the header (or Escape) to bring the modal back
- PILOT-DECISION: the portal always paints a mask, so — unlike the antd
  version — the page behind is not reachable while minimized`}}},render:()=>{let[e,t]=(0,f.useState)(!1);return(0,p.jsxs)(p.Fragment,{children:[(0,p.jsx)(d,{type:`primary`,onClick:()=>t(!0),children:`Open Minimizable Modal`}),(0,p.jsx)(i,{title:`Minimizable Modal`,open:e,windowActions:[`minimize`],onOk:()=>t(!1),onCancel:()=>t(!1),children:(0,p.jsxs)(u,{direction:`column`,gap:`md`,children:[(0,p.jsxs)(s,{children:[`Click the `,(0,p.jsx)(`strong`,{children:`minus icon`}),` in the modal header to minimize this modal. It will collapse to a compact bar showing only the title at the bottom of the viewport.`]}),(0,p.jsx)(s,{children:`Click the minus icon again on the minimized bar to restore the modal to its default size.`})]})})]})}},Y={parameters:{docs:{description:{story:`Demonstrates the maximize/restore flow. Click the maximize button (border icon) to expand the modal to fill the viewport with a 24px margin on each side. Click the button again (now showing overlapping squares) to restore.`}}},render:()=>{let[e,t]=(0,f.useState)(!1);return(0,p.jsxs)(p.Fragment,{children:[(0,p.jsx)(d,{type:`primary`,onClick:()=>t(!0),children:`Open Maximizable Modal`}),(0,p.jsx)(i,{title:`Maximizable Modal`,open:e,windowActions:[`maximize`],onOk:()=>t(!1),onCancel:()=>t(!1),children:(0,p.jsxs)(u,{direction:`column`,gap:`md`,children:[(0,p.jsxs)(s,{children:[`Click the `,(0,p.jsx)(`strong`,{children:`border icon`}),` in the modal header to maximize this modal. It will expand to fill the viewport with a 24px margin.`]}),(0,p.jsx)(s,{children:`Note: Dragging is automatically disabled when the modal is maximized and re-enabled when restored.`})]})})]})}},X={parameters:{docs:{description:{story:`Demonstrates the fullscreen/exit flow. Click the fullscreen button to expand the modal to fill the entire viewport with no margin and no border-radius. Click the exit fullscreen button to restore.`}}},render:()=>{let[e,t]=(0,f.useState)(!1);return(0,p.jsxs)(p.Fragment,{children:[(0,p.jsx)(d,{type:`primary`,onClick:()=>t(!0),children:`Open Fullscreen Modal`}),(0,p.jsx)(i,{title:`Fullscreen Modal`,open:e,windowActions:[`fullscreen`],onOk:()=>t(!1),onCancel:()=>t(!1),children:(0,p.jsxs)(u,{direction:`column`,gap:`md`,children:[(0,p.jsxs)(s,{children:[`Click the `,(0,p.jsx)(`strong`,{children:`fullscreen icon`}),` in the modal header to expand this modal to fill the entire viewport (100vw x 100vh) with no margin and no border-radius.`]}),(0,p.jsx)(s,{children:`Click the exit fullscreen icon to restore the modal to its default size.`})]})})]})}},Z={parameters:{docs:{description:{story:"Demonstrates the `minimizedPlacement` prop. Each modal minimizes to a different corner of the viewport. Default placement is `bottomRight`."}}},render:()=>{let[e,t]=(0,f.useState)(!1),[n,r]=(0,f.useState)(!1),[a,o]=(0,f.useState)(!1),[c,l]=(0,f.useState)(!1);return(0,p.jsxs)(u,{gap:`md`,wrap:`wrap`,children:[(0,p.jsx)(d,{type:`primary`,onClick:()=>t(!0),children:`Bottom Right (default)`}),(0,p.jsx)(d,{type:`primary`,onClick:()=>r(!0),children:`Bottom Left`}),(0,p.jsx)(d,{type:`primary`,onClick:()=>o(!0),children:`Top Right`}),(0,p.jsx)(d,{type:`primary`,onClick:()=>l(!0),children:`Top Left`}),(0,p.jsx)(i,{title:`Bottom Right`,open:e,windowActions:[`minimize`],minimizedPlacement:`bottomRight`,onOk:()=>t(!1),onCancel:()=>t(!1),children:(0,p.jsxs)(s,{children:[`Minimizes to `,(0,p.jsx)(`strong`,{children:`bottom-right`}),` corner (default).`]})}),(0,p.jsx)(i,{title:`Bottom Left`,open:n,windowActions:[`minimize`],minimizedPlacement:`bottomLeft`,onOk:()=>r(!1),onCancel:()=>r(!1),children:(0,p.jsxs)(s,{children:[`Minimizes to `,(0,p.jsx)(`strong`,{children:`bottom-left`}),` corner.`]})}),(0,p.jsx)(i,{title:`Top Right`,open:a,windowActions:[`minimize`],minimizedPlacement:`topRight`,onOk:()=>o(!1),onCancel:()=>o(!1),children:(0,p.jsxs)(s,{children:[`Minimizes to `,(0,p.jsx)(`strong`,{children:`top-right`}),` corner.`]})}),(0,p.jsx)(i,{title:`Top Left`,open:c,windowActions:[`minimize`],minimizedPlacement:`topLeft`,onOk:()=>l(!1),onCancel:()=>l(!1),children:(0,p.jsxs)(s,{children:[`Minimizes to `,(0,p.jsx)(`strong`,{children:`top-left`}),` corner.`]})})]})}},Q={parameters:{docs:{description:{story:"Demonstrates the `windowActions` prop for selectively enabling specific window controls. Each modal shows a different combination of window action buttons."}}},render:()=>{let[e,t]=(0,f.useState)(!1),[n,r]=(0,f.useState)(!1),[a,o]=(0,f.useState)(!1);return(0,p.jsxs)(u,{gap:`md`,wrap:`wrap`,children:[(0,p.jsx)(d,{type:`primary`,onClick:()=>t(!0),children:`Minimize + Maximize`}),(0,p.jsx)(d,{type:`primary`,onClick:()=>r(!0),children:`Maximize + Fullscreen`}),(0,p.jsx)(d,{type:`primary`,onClick:()=>o(!0),children:`Minimize Only`}),(0,p.jsx)(i,{title:`Minimize + Maximize`,open:e,windowActions:[`minimize`,`maximize`],onOk:()=>t(!1),onCancel:()=>t(!1),children:(0,p.jsxs)(s,{children:[`This modal has only `,(0,p.jsx)(`strong`,{children:`minimize`}),` and`,` `,(0,p.jsx)(`strong`,{children:`maximize`}),` buttons. No fullscreen option.`]})}),(0,p.jsx)(i,{title:`Maximize + Fullscreen`,open:n,windowActions:[`maximize`,`fullscreen`],onOk:()=>r(!1),onCancel:()=>r(!1),children:(0,p.jsxs)(s,{children:[`This modal has only `,(0,p.jsx)(`strong`,{children:`maximize`}),` and`,` `,(0,p.jsx)(`strong`,{children:`fullscreen`}),` buttons. No minimize option.`]})}),(0,p.jsx)(i,{title:`Minimize Only`,open:a,windowActions:[`minimize`],onOk:()=>o(!1),onCancel:()=>o(!1),children:(0,p.jsxs)(s,{children:[`This modal has only the `,(0,p.jsx)(`strong`,{children:`minimize`}),` button.`]})})]})}},V.parameters={...V.parameters,docs:{...(m=V.parameters)==null?void 0:m.docs,source:{originalSource:`{
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
}`,...(h=V.parameters)==null||(h=h.docs)==null?void 0:h.source}}},H.parameters={...H.parameters,docs:{...(g=H.parameters)==null?void 0:g.docs,source:{originalSource:`{
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
}`,...(_=H.parameters)==null||(_=_.docs)==null?void 0:_.source}}},U.parameters={...U.parameters,docs:{...(v=U.parameters)==null?void 0:v.docs,source:{originalSource:`{
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
}`,...(y=U.parameters)==null||(y=y.docs)==null?void 0:y.source}}},W.parameters={...W.parameters,docs:{...(b=W.parameters)==null?void 0:b.docs,source:{originalSource:`{
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
}`,...(x=W.parameters)==null||(x=x.docs)==null?void 0:x.source}}},G.parameters={...G.parameters,docs:{...(S=G.parameters)==null?void 0:S.docs,source:{originalSource:`{
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
}`,...(C=G.parameters)==null||(C=C.docs)==null?void 0:C.source}}},K.parameters={...K.parameters,docs:{...(w=K.parameters)==null?void 0:w.docs,source:{originalSource:`{
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
}`,...(T=K.parameters)==null||(T=T.docs)==null?void 0:T.source}}},q.parameters={...q.parameters,docs:{...(E=q.parameters)==null?void 0:E.docs,source:{originalSource:`{
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
}`,...(D=q.parameters)==null||(D=D.docs)==null?void 0:D.source}}},J.parameters={...J.parameters,docs:{...(O=J.parameters)==null?void 0:O.docs,source:{originalSource:`{
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
}`,...(k=J.parameters)==null||(k=k.docs)==null?void 0:k.source}}},Y.parameters={...Y.parameters,docs:{...(A=Y.parameters)==null?void 0:A.docs,source:{originalSource:`{
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
}`,...(j=Y.parameters)==null||(j=j.docs)==null?void 0:j.source}}},X.parameters={...X.parameters,docs:{...(M=X.parameters)==null?void 0:M.docs,source:{originalSource:`{
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
}`,...(N=X.parameters)==null||(N=N.docs)==null?void 0:N.source}}},Z.parameters={...Z.parameters,docs:{...(P=Z.parameters)==null?void 0:P.docs,source:{originalSource:`{
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
}`,...(F=Z.parameters)==null||(F=F.docs)==null?void 0:F.source}}},Q.parameters={...Q.parameters,docs:{...(I=Q.parameters)==null?void 0:I.docs,source:{originalSource:`{
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
}`,...(L=Q.parameters)==null||(L=L.docs)==null?void 0:L.source}}},$=[`Default`,`ConfirmBeforeClose`,`StickyTitle`,`WarningType`,`ErrorType`,`TypeVariants`,`WindowControls`,`MinimizedState`,`MaximizedState`,`FullscreenState`,`MinimizedPlacement`,`SelectiveWindowActions`]})))()}te();export{H as ConfirmBeforeClose,V as Default,G as ErrorType,X as FullscreenState,Y as MaximizedState,Z as MinimizedPlacement,J as MinimizedState,Q as SelectiveWindowActions,U as StickyTitle,K as TypeVariants,W as WarningType,q as WindowControls,$ as __namedExportsOrder,R as default};