import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-DlPsW1c0.js";import{t as n}from"./jsx-runtime-MKhVqBIO.js";import{n as r,t as i}from"./BAIModal-CmC20hmO.js";import{n as a,t as o}from"./Form-CCnALH9R.js";import{n as s,t as c}from"./BAIFlex-DnaoYTJ1.js";import{n as l,t as u}from"./BAIButton-DHsNLRMw.js";import{n as d,t as f}from"./TextInput-BLHIQgry.js";import{n as p,t as m}from"./BAIUnmountAfterClose-BFd4mgc4.js";var h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P;function F(){return(F=e((()=>{o(),l(),s(),r(),d(),p(),h=t(),g=n(),D={title:`Utility/BAIUnmountAfterClose`,component:m,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:`
**BAIUnmountAfterClose** is a utility component that unmounts Modal/Drawer children after their close animations complete.

## Problem it Solves
When you close and reopen a Modal/Drawer with forms, the previous form state persists because React doesn't unmount the component. This wrapper ensures the child is fully unmounted after closing, preventing stale state issues.

## Features
- **Preserves animations**: Waits for close animation to complete before unmounting
- **Modal/Drawer support**: Works with \`BAIModal\` (Astryx-backed) and any Drawer-shaped component exposing \`open\`/\`afterOpenChange\`
- **Callback preservation**: Maintains original \`afterClose\` and \`afterOpenChange\` callbacks
- **Automatic cleanup**: Unmounts child after animation, preventing memory leaks

## Usage
\`\`\`tsx
// Wrap BAIModal with a form to prevent stale state
<BAIUnmountAfterClose>
  <BAIModal open={open} onCancel={() => setOpen(false)}>
    <Form>
      <Form.Item name="email">
        <TextInput aria-label="Email" />
      </Form.Item>
    </Form>
  </BAIModal>
</BAIUnmountAfterClose>

// Any Drawer-shaped component works too, as long as it forwards
// \`open\` and calls \`afterOpenChange\` on its close transition — Astryx
// core has no Drawer primitive, so this repo has no shared one either.
<BAIUnmountAfterClose>
  <SomeDrawer open={open} onClose={() => setOpen(false)}>
    <Form>{/* form fields */}</Form>
  </SomeDrawer>
</BAIUnmountAfterClose>
\`\`\`

## When to Use
- Modals/Drawers with forms that should reset on close
- Components with expensive initialization that should be cleaned up
- Any scenario where you need fresh component state on each open

## Props
This component accepts a single child element (Modal or Drawer) and automatically manages its lifecycle.

| Prop | Type | Description |
|------|------|-------------|
| \`children\` | \`React.ReactElement<BAIUnmountAfterCloseChildProps>\` | Single Modal or Drawer component exposing \`open\`/\`afterClose\`/\`afterOpenChange\` |
        `}}},argTypes:{children:{control:!1,description:`Single Modal or Drawer component to wrap`,table:{type:{summary:`React.ReactElement<BAIUnmountAfterCloseChildProps>`}}}}},O=({open:e,title:t,onClose:n,afterOpenChange:r,children:i})=>((0,h.useEffect)(()=>{if(e){r==null||r(!0);return}let t=setTimeout(()=>r==null?void 0:r(!1),200);return()=>clearTimeout(t)},[e]),(0,g.jsxs)(`div`,{style:{position:`fixed`,top:0,right:0,bottom:0,width:360,background:`var(--color-background-surface)`,borderLeft:`1px solid var(--color-border)`,boxShadow:`-4px 0 12px rgba(0,0,0,0.08)`,padding:16,transform:e?`translateX(0)`:`translateX(100%)`,transition:`transform 200ms ease`,zIndex:1e3},children:[(0,g.jsxs)(c,{justify:`between`,align:`center`,style:{marginBottom:12},children:[(0,g.jsx)(`strong`,{children:t}),(0,g.jsx)(u,{size:`small`,onClick:n,children:`Close`})]}),i]})),k={name:`Basic`,parameters:{docs:{description:{story:`Basic usage with a Modal. The modal content unmounts after the close animation completes.`}}},render:()=>{let[e,t]=(0,h.useState)(!1);return(0,g.jsxs)(`div`,{children:[(0,g.jsx)(u,{onClick:()=>t(!0),children:`Open Modal`}),(0,g.jsx)(m,{children:(0,g.jsxs)(i,{title:`Basic Modal`,open:e,onOk:()=>t(!1),onCancel:()=>t(!1),children:[(0,g.jsx)(`p`,{children:`This content will unmount after the modal closes.`}),(0,g.jsxs)(`p`,{children:[`Mounted at: `,new Date().toLocaleTimeString()]})]})})]})}},A={parameters:{docs:{description:{story:`Demonstrates form state reset. Without BAIUnmountAfterClose, form values would persist when reopening. With it, the form is fresh on each open.`}}},render:()=>{let[e,t]=(0,h.useState)(!1),[n,r]=(0,h.useState)(!1);return(0,g.jsxs)(c,{direction:`column`,gap:`md`,children:[(0,g.jsxs)(`div`,{children:[(0,g.jsx)(`div`,{style:{marginBottom:8,fontWeight:500},children:`✅ With BAIUnmountAfterClose (form resets on close):`}),(0,g.jsx)(u,{onClick:()=>t(!0),children:`Open Modal with Unmount`}),(0,g.jsx)(m,{children:(0,g.jsxs)(i,{title:`Form with Unmount`,open:e,onOk:()=>t(!1),onCancel:()=>t(!1),children:[(0,g.jsxs)(a,{children:[(0,g.jsx)(a.Item,{label:`Name`,name:`name`,children:(0,g.jsx)(f,{"aria-label":`Name`,placeholder:`Type something and close`})}),(0,g.jsx)(a.Item,{label:`Email`,name:`email`,children:(0,g.jsx)(f,{"aria-label":`Email`,placeholder:`Type something and close`})})]}),(0,g.jsx)(`p`,{style:{fontSize:12,color:`#666`},children:`💡 Close and reopen - form will be reset!`})]})})]}),(0,g.jsxs)(`div`,{children:[(0,g.jsx)(`div`,{style:{marginBottom:8,fontWeight:500},children:`❌ Without BAIUnmountAfterClose (form state persists):`}),(0,g.jsx)(u,{onClick:()=>r(!0),children:`Open Modal without Unmount`}),(0,g.jsxs)(i,{title:`Form without Unmount`,open:n,onOk:()=>r(!1),onCancel:()=>r(!1),children:[(0,g.jsxs)(a,{children:[(0,g.jsx)(a.Item,{label:`Name`,name:`name`,children:(0,g.jsx)(f,{"aria-label":`Name`,placeholder:`Type something and close`})}),(0,g.jsx)(a.Item,{label:`Email`,name:`email`,children:(0,g.jsx)(f,{"aria-label":`Email`,placeholder:`Type something and close`})})]}),(0,g.jsx)(`p`,{style:{fontSize:12,color:`#666`},children:`⚠️ Close and reopen - form values persist!`})]})]})]})}},j={parameters:{docs:{description:{story:`Works with Drawer component as well. The drawer content unmounts after the close animation.`}}},render:()=>{let[e,t]=(0,h.useState)(!1);return(0,g.jsxs)(`div`,{children:[(0,g.jsx)(u,{onClick:()=>t(!0),children:`Open Drawer`}),(0,g.jsx)(m,{children:(0,g.jsxs)(O,{title:`Drawer with Unmount`,open:e,onClose:()=>t(!1),children:[(0,g.jsxs)(a,{children:[(0,g.jsx)(a.Item,{label:`Username`,name:`username`,children:(0,g.jsx)(f,{"aria-label":`Username`,placeholder:`Type and close to see reset`})}),(0,g.jsx)(a.Item,{label:`Password`,name:`password`,children:(0,g.jsx)(f,{type:`password`,"aria-label":`Password`,placeholder:`Type and close to see reset`})})]}),(0,g.jsxs)(`p`,{style:{fontSize:12,color:`#666`,marginTop:16},children:[`Mounted at: `,new Date().toLocaleTimeString()]})]})})]})}},M={parameters:{docs:{description:{story:`BAIUnmountAfterClose preserves original afterClose and afterOpenChange callbacks.`}}},render:()=>{let[e,t]=(0,h.useState)(!1),[n,r]=(0,h.useState)([]),a=e=>{r(t=>[...t,`[${new Date().toLocaleTimeString()}] ${e}`])};return(0,g.jsxs)(c,{direction:`column`,gap:`md`,children:[(0,g.jsx)(u,{onClick:()=>t(!0),children:`Open Modal`}),(0,g.jsx)(m,{children:(0,g.jsx)(i,{title:`Callback Test`,open:e,onCancel:()=>{a(`onCancel called`),t(!1)},afterClose:()=>{a(`afterClose called (after animation)`)},children:(0,g.jsx)(`p`,{children:`Close this modal to see callback execution order.`})})}),(0,g.jsxs)(`div`,{children:[(0,g.jsx)(`div`,{style:{marginBottom:8,fontWeight:500},children:`Callback Log:`}),(0,g.jsx)(`div`,{style:{padding:12,background:`#f5f5f5`,borderRadius:4,fontFamily:`monospace`,fontSize:11,maxHeight:150,overflow:`auto`},children:n.length===0?(0,g.jsx)(`div`,{style:{color:`#999`},children:`(no callbacks yet)`}):n.map((e,t)=>(0,g.jsx)(`div`,{children:e},t))})]})]})}},N={parameters:{docs:{description:{story:`Realistic example: Session creation modal that should reset on each open.`}}},render:()=>{let[e,t]=(0,h.useState)(!1),[n,r]=(0,h.useState)([]),[o]=a.useForm();return(0,g.jsxs)(c,{direction:`column`,gap:`md`,children:[(0,g.jsx)(u,{type:`primary`,onClick:()=>t(!0),children:`Create New Session`}),(0,g.jsx)(m,{children:(0,g.jsxs)(i,{title:`Create Compute Session`,open:e,onCancel:()=>t(!1),footer:null,children:[(0,g.jsxs)(a,{form:o,layout:`vertical`,onFinish:e=>{r(t=>[...t,`${e.sessionName} (${e.image})`]),t(!1)},initialValues:{sessionName:`session-${Date.now()}`,image:`python:3.11`},children:[(0,g.jsx)(a.Item,{label:`Session Name`,name:`sessionName`,rules:[{required:!0,message:`Please enter session name`}],children:(0,g.jsx)(f,{"aria-label":`Session Name`,placeholder:`my-jupyter-session`})}),(0,g.jsx)(a.Item,{label:`Container Image`,name:`image`,rules:[{required:!0,message:`Please select image`}],children:(0,g.jsx)(f,{"aria-label":`Container Image`,placeholder:`python:3.11`})}),(0,g.jsx)(a.Item,{children:(0,g.jsx)(u,{type:`primary`,block:!0,onClick:()=>o.submit(),children:`Create Session`})})]}),(0,g.jsx)(`p`,{style:{fontSize:11,color:`#666`,marginTop:8},children:`💡 Form resets with default values each time you open the modal`})]})}),(0,g.jsxs)(`div`,{children:[(0,g.jsx)(`div`,{style:{marginBottom:8,fontWeight:500},children:`Created Sessions:`}),(0,g.jsx)(`div`,{style:{padding:12,background:`#f5f5f5`,borderRadius:4,fontFamily:`monospace`,fontSize:12},children:n.length===0?(0,g.jsx)(`div`,{style:{color:`#999`},children:`(no sessions yet)`}):n.map((e,t)=>(0,g.jsxs)(`div`,{children:[t+1,`. `,e]},t))})]})]})}},k.parameters={...k.parameters,docs:{...(_=k.parameters)==null?void 0:_.docs,source:{originalSource:`{
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'Basic usage with a Modal. The modal content unmounts after the close animation completes.'
      }
    }
  },
  render: () => {
    const [open, setOpen] = useState(false);
    return <div>
        <BAIButton onClick={() => setOpen(true)}>Open Modal</BAIButton>
        <BAIUnmountAfterClose>
          <BAIModal title="Basic Modal" open={open} onOk={() => setOpen(false)} onCancel={() => setOpen(false)}>
            <p>This content will unmount after the modal closes.</p>
            <p>Mounted at: {new Date().toLocaleTimeString()}</p>
          </BAIModal>
        </BAIUnmountAfterClose>
      </div>;
  }
}`,...(v=k.parameters)==null||(v=v.docs)==null?void 0:v.source}}},A.parameters={...A.parameters,docs:{...(y=A.parameters)==null?void 0:y.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates form state reset. Without BAIUnmountAfterClose, form values would persist when reopening. With it, the form is fresh on each open.'
      }
    }
  },
  render: () => {
    const [withUnmount, setWithUnmount] = useState(false);
    const [withoutUnmount, setWithoutUnmount] = useState(false);
    return <BAIFlex direction="column" gap="md">
        <div>
          <div style={{
          marginBottom: 8,
          fontWeight: 500
        }}>
            ✅ With BAIUnmountAfterClose (form resets on close):
          </div>
          <BAIButton onClick={() => setWithUnmount(true)}>
            Open Modal with Unmount
          </BAIButton>
          <BAIUnmountAfterClose>
            <BAIModal title="Form with Unmount" open={withUnmount} onOk={() => setWithUnmount(false)} onCancel={() => setWithUnmount(false)}>
              <Form>
                <Form.Item label="Name" name="name">
                  <BAITextInput aria-label="Name" placeholder="Type something and close" />
                </Form.Item>
                <Form.Item label="Email" name="email">
                  <BAITextInput aria-label="Email" placeholder="Type something and close" />
                </Form.Item>
              </Form>
              <p style={{
              fontSize: 12,
              color: '#666'
            }}>
                💡 Close and reopen - form will be reset!
              </p>
            </BAIModal>
          </BAIUnmountAfterClose>
        </div>

        <div>
          <div style={{
          marginBottom: 8,
          fontWeight: 500
        }}>
            ❌ Without BAIUnmountAfterClose (form state persists):
          </div>
          <BAIButton onClick={() => setWithoutUnmount(true)}>
            Open Modal without Unmount
          </BAIButton>
          <BAIModal title="Form without Unmount" open={withoutUnmount} onOk={() => setWithoutUnmount(false)} onCancel={() => setWithoutUnmount(false)}>
            <Form>
              <Form.Item label="Name" name="name">
                <BAITextInput aria-label="Name" placeholder="Type something and close" />
              </Form.Item>
              <Form.Item label="Email" name="email">
                <BAITextInput aria-label="Email" placeholder="Type something and close" />
              </Form.Item>
            </Form>
            <p style={{
            fontSize: 12,
            color: '#666'
          }}>
              ⚠️ Close and reopen - form values persist!
            </p>
          </BAIModal>
        </div>
      </BAIFlex>;
  }
}`,...(b=A.parameters)==null||(b=b.docs)==null?void 0:b.source}}},j.parameters={...j.parameters,docs:{...(x=j.parameters)==null?void 0:x.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Works with Drawer component as well. The drawer content unmounts after the close animation.'
      }
    }
  },
  render: () => {
    const [open, setOpen] = useState(false);
    return <div>
        <BAIButton onClick={() => setOpen(true)}>Open Drawer</BAIButton>
        <BAIUnmountAfterClose>
          <DemoDrawer title="Drawer with Unmount" open={open} onClose={() => setOpen(false)}>
            <Form>
              <Form.Item label="Username" name="username">
                <BAITextInput aria-label="Username" placeholder="Type and close to see reset" />
              </Form.Item>
              <Form.Item label="Password" name="password">
                <BAITextInput type="password" aria-label="Password" placeholder="Type and close to see reset" />
              </Form.Item>
            </Form>
            <p style={{
            fontSize: 12,
            color: '#666',
            marginTop: 16
          }}>
              Mounted at: {new Date().toLocaleTimeString()}
            </p>
          </DemoDrawer>
        </BAIUnmountAfterClose>
      </div>;
  }
}`,...(S=j.parameters)==null||(S=S.docs)==null?void 0:S.source}}},M.parameters={...M.parameters,docs:{...(C=M.parameters)==null?void 0:C.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'BAIUnmountAfterClose preserves original afterClose and afterOpenChange callbacks.'
      }
    }
  },
  render: () => {
    const [open, setOpen] = useState(false);
    const [log, setLog] = useState<string[]>([]);
    const addLog = (message: string) => {
      setLog(prev => [...prev, \`[\${new Date().toLocaleTimeString()}] \${message}\`]);
    };
    return <BAIFlex direction="column" gap="md">
        <BAIButton onClick={() => setOpen(true)}>Open Modal</BAIButton>

        <BAIUnmountAfterClose>
          <BAIModal title="Callback Test" open={open} onCancel={() => {
          addLog('onCancel called');
          setOpen(false);
        }} afterClose={() => {
          addLog('afterClose called (after animation)');
        }}>
            <p>Close this modal to see callback execution order.</p>
          </BAIModal>
        </BAIUnmountAfterClose>

        <div>
          <div style={{
          marginBottom: 8,
          fontWeight: 500
        }}>Callback Log:</div>
          <div style={{
          padding: 12,
          background: '#f5f5f5',
          borderRadius: 4,
          fontFamily: 'monospace',
          fontSize: 11,
          maxHeight: 150,
          overflow: 'auto'
        }}>
            {log.length === 0 ? <div style={{
            color: '#999'
          }}>(no callbacks yet)</div> : log.map((entry, i) => <div key={i}>{entry}</div>)}
          </div>
        </div>
      </BAIFlex>;
  }
}`,...(w=M.parameters)==null||(w=w.docs)==null?void 0:w.source}}},N.parameters={...N.parameters,docs:{...(T=N.parameters)==null?void 0:T.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Realistic example: Session creation modal that should reset on each open.'
      }
    }
  },
  render: () => {
    const [open, setOpen] = useState(false);
    const [createdSessions, setCreatedSessions] = useState<string[]>([]);
    const [form] = Form.useForm();
    const handleCreate = (values: {
      sessionName: string;
      image: string;
    }) => {
      setCreatedSessions(prev => [...prev, \`\${values.sessionName} (\${values.image})\`]);
      setOpen(false);
    };
    return <BAIFlex direction="column" gap="md">
        <BAIButton type="primary" onClick={() => setOpen(true)}>
          Create New Session
        </BAIButton>

        <BAIUnmountAfterClose>
          <BAIModal title="Create Compute Session" open={open} onCancel={() => setOpen(false)} footer={null}>
            <Form form={form} layout="vertical" onFinish={handleCreate} initialValues={{
            sessionName: \`session-\${Date.now()}\`,
            image: 'python:3.11'
          }}>
              <Form.Item label="Session Name" name="sessionName" rules={[{
              required: true,
              message: 'Please enter session name'
            }]}>
                <BAITextInput aria-label="Session Name" placeholder="my-jupyter-session" />
              </Form.Item>

              <Form.Item label="Container Image" name="image" rules={[{
              required: true,
              message: 'Please select image'
            }]}>
                <BAITextInput aria-label="Container Image" placeholder="python:3.11" />
              </Form.Item>

              <Form.Item>
                {/* \`BAIButton\` deliberately does not expose antd's \`htmlType\`
                    (PILOT-DECISION in \`BAIButton.tsx\`), and Astryx \`Button\`
                    defaults its native \`type\` to \`'button'\` — so a bare click
                    would never submit. Driving the form instance directly is
                    the engine-native equivalent and keeps validation in the
                    loop. */}
                <BAIButton type="primary" block onClick={() => form.submit()}>
                  Create Session
                </BAIButton>
              </Form.Item>
            </Form>
            <p style={{
            fontSize: 11,
            color: '#666',
            marginTop: 8
          }}>
              💡 Form resets with default values each time you open the modal
            </p>
          </BAIModal>
        </BAIUnmountAfterClose>

        <div>
          <div style={{
          marginBottom: 8,
          fontWeight: 500
        }}>
            Created Sessions:
          </div>
          <div style={{
          padding: 12,
          background: '#f5f5f5',
          borderRadius: 4,
          fontFamily: 'monospace',
          fontSize: 12
        }}>
            {createdSessions.length === 0 ? <div style={{
            color: '#999'
          }}>(no sessions yet)</div> : createdSessions.map((session, i) => <div key={i}>
                  {i + 1}. {session}
                </div>)}
          </div>
        </div>
      </BAIFlex>;
  }
}`,...(E=N.parameters)==null||(E=E.docs)==null?void 0:E.source}}},P=[`Default`,`FormStateReset`,`WithDrawer`,`CallbackPreservation`,`RealWorldExample`]})))()}F();export{M as CallbackPreservation,k as Default,A as FormStateReset,N as RealWorldExample,j as WithDrawer,P as __namedExportsOrder,D as default};