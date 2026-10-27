import{n as e}from"./rolldown-runtime-2s6bX4vc.js";import{n as t,t as n}from"./BAIModal-DjFLUMha.js";import{n as r,r as i}from"./iframe-DR2sIF5r.js";import{n as a,t as o}from"./BAIFlex-CAz1t6J5.js";import{n as s,t as c}from"./BAIButton-C-o5ANgR.js";import{n as l,t as u}from"./BAITextInput-CqmhWReo.js";import{n as d,t as f}from"./BAIUnmountAfterClose-wB0Iuoj_.js";import{useEffect as p,useState as m}from"react";import{jsx as h,jsxs as g}from"react/jsx-runtime";var _,v,y,b,x,S,C,w;function T(){return(T=e((()=>{i(),s(),a(),t(),l(),d(),_={title:`Utility/BAIUnmountAfterClose`,component:f,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:`
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
        `}}},argTypes:{children:{control:!1,description:`Single Modal or Drawer component to wrap`,table:{type:{summary:`React.ReactElement<BAIUnmountAfterCloseChildProps>`}}}}},v=({open:e,title:t,onClose:n,afterOpenChange:r,children:i})=>(p(()=>{if(e){r?.(!0);return}let t=setTimeout(()=>r?.(!1),200);return()=>clearTimeout(t)},[e]),g(`div`,{style:{position:`fixed`,top:0,right:0,bottom:0,width:360,background:`var(--color-background-surface)`,borderLeft:`1px solid var(--color-border)`,boxShadow:`-4px 0 12px rgba(0,0,0,0.08)`,padding:16,transform:e?`translateX(0)`:`translateX(100%)`,transition:`transform 200ms ease`,zIndex:1e3},children:[g(o,{justify:`between`,align:`center`,style:{marginBottom:12},children:[h(`strong`,{children:t}),h(c,{size:`small`,onClick:n,children:`Close`})]}),i]})),y={name:`Basic`,parameters:{docs:{description:{story:`Basic usage with a Modal. The modal content unmounts after the close animation completes.`}}},render:()=>{let[e,t]=m(!1);return g(`div`,{children:[h(c,{onClick:()=>t(!0),children:`Open Modal`}),h(f,{children:g(n,{title:`Basic Modal`,open:e,onOk:()=>t(!1),onCancel:()=>t(!1),children:[h(`p`,{children:`This content will unmount after the modal closes.`}),g(`p`,{children:[`Mounted at: `,new Date().toLocaleTimeString()]})]})})]})}},b={parameters:{docs:{description:{story:`Demonstrates form state reset. Without BAIUnmountAfterClose, form values would persist when reopening. With it, the form is fresh on each open.`}}},render:()=>{let[e,t]=m(!1),[i,a]=m(!1);return g(o,{direction:`column`,gap:`md`,children:[g(`div`,{children:[h(`div`,{style:{marginBottom:8,fontWeight:500},children:`✅ With BAIUnmountAfterClose (form resets on close):`}),h(c,{onClick:()=>t(!0),children:`Open Modal with Unmount`}),h(f,{children:g(n,{title:`Form with Unmount`,open:e,onOk:()=>t(!1),onCancel:()=>t(!1),children:[g(r,{children:[h(r.Item,{label:`Name`,name:`name`,children:h(u,{"aria-label":`Name`,placeholder:`Type something and close`})}),h(r.Item,{label:`Email`,name:`email`,children:h(u,{"aria-label":`Email`,placeholder:`Type something and close`})})]}),h(`p`,{style:{fontSize:12,color:`#666`},children:`💡 Close and reopen - form will be reset!`})]})})]}),g(`div`,{children:[h(`div`,{style:{marginBottom:8,fontWeight:500},children:`❌ Without BAIUnmountAfterClose (form state persists):`}),h(c,{onClick:()=>a(!0),children:`Open Modal without Unmount`}),g(n,{title:`Form without Unmount`,open:i,onOk:()=>a(!1),onCancel:()=>a(!1),children:[g(r,{children:[h(r.Item,{label:`Name`,name:`name`,children:h(u,{"aria-label":`Name`,placeholder:`Type something and close`})}),h(r.Item,{label:`Email`,name:`email`,children:h(u,{"aria-label":`Email`,placeholder:`Type something and close`})})]}),h(`p`,{style:{fontSize:12,color:`#666`},children:`⚠️ Close and reopen - form values persist!`})]})]})]})}},x={parameters:{docs:{description:{story:`Works with Drawer component as well. The drawer content unmounts after the close animation.`}}},render:()=>{let[e,t]=m(!1);return g(`div`,{children:[h(c,{onClick:()=>t(!0),children:`Open Drawer`}),h(f,{children:g(v,{title:`Drawer with Unmount`,open:e,onClose:()=>t(!1),children:[g(r,{children:[h(r.Item,{label:`Username`,name:`username`,children:h(u,{"aria-label":`Username`,placeholder:`Type and close to see reset`})}),h(r.Item,{label:`Password`,name:`password`,children:h(u,{type:`password`,"aria-label":`Password`,placeholder:`Type and close to see reset`})})]}),g(`p`,{style:{fontSize:12,color:`#666`,marginTop:16},children:[`Mounted at: `,new Date().toLocaleTimeString()]})]})})]})}},S={parameters:{docs:{description:{story:`BAIUnmountAfterClose preserves original afterClose and afterOpenChange callbacks.`}}},render:()=>{let[e,t]=m(!1),[r,i]=m([]),a=e=>{i(t=>[...t,`[${new Date().toLocaleTimeString()}] ${e}`])};return g(o,{direction:`column`,gap:`md`,children:[h(c,{onClick:()=>t(!0),children:`Open Modal`}),h(f,{children:h(n,{title:`Callback Test`,open:e,onCancel:()=>{a(`onCancel called`),t(!1)},afterClose:()=>{a(`afterClose called (after animation)`)},children:h(`p`,{children:`Close this modal to see callback execution order.`})})}),g(`div`,{children:[h(`div`,{style:{marginBottom:8,fontWeight:500},children:`Callback Log:`}),h(`div`,{style:{padding:12,background:`#f5f5f5`,borderRadius:4,fontFamily:`monospace`,fontSize:11,maxHeight:150,overflow:`auto`},children:r.length===0?h(`div`,{style:{color:`#999`},children:`(no callbacks yet)`}):r.map((e,t)=>h(`div`,{children:e},t))})]})]})}},C={parameters:{docs:{description:{story:`Realistic example: Session creation modal that should reset on each open.`}}},render:()=>{let[e,t]=m(!1),[i,a]=m([]),[s]=r.useForm();return g(o,{direction:`column`,gap:`md`,children:[h(c,{type:`primary`,onClick:()=>t(!0),children:`Create New Session`}),h(f,{children:g(n,{title:`Create Compute Session`,open:e,onCancel:()=>t(!1),footer:null,children:[g(r,{form:s,layout:`vertical`,onFinish:e=>{a(t=>[...t,`${e.sessionName} (${e.image})`]),t(!1)},initialValues:{sessionName:`session-${Date.now()}`,image:`python:3.11`},children:[h(r.Item,{label:`Session Name`,name:`sessionName`,rules:[{required:!0,message:`Please enter session name`}],children:h(u,{"aria-label":`Session Name`,placeholder:`my-jupyter-session`})}),h(r.Item,{label:`Container Image`,name:`image`,rules:[{required:!0,message:`Please select image`}],children:h(u,{"aria-label":`Container Image`,placeholder:`python:3.11`})}),h(r.Item,{children:h(c,{type:`primary`,block:!0,onClick:()=>s.submit(),children:`Create Session`})})]}),h(`p`,{style:{fontSize:11,color:`#666`,marginTop:8},children:`💡 Form resets with default values each time you open the modal`})]})}),g(`div`,{children:[h(`div`,{style:{marginBottom:8,fontWeight:500},children:`Created Sessions:`}),h(`div`,{style:{padding:12,background:`#f5f5f5`,borderRadius:4,fontFamily:`monospace`,fontSize:12},children:i.length===0?h(`div`,{style:{color:`#999`},children:`(no sessions yet)`}):i.map((e,t)=>g(`div`,{children:[t+1,`. `,e]},t))})]})]})}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source}}},w=[`Default`,`FormStateReset`,`WithDrawer`,`CallbackPreservation`,`RealWorldExample`]})))()}T();export{S as CallbackPreservation,y as Default,b as FormStateReset,C as RealWorldExample,x as WithDrawer,w as __namedExportsOrder,_ as default};