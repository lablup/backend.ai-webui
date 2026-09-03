import{r as a,j as e}from"./iframe-DAIf00kV.js";import{B as m}from"./BAIButton-C9jyhABl.js";import{B as A}from"./BAIFlex-B-2KipBa.js";import{B as u}from"./BAIModal-BbBM0Ncb.js";import{B as p}from"./BAIUnmountAfterClose-BmBtNtVp.js";import{A as i}from"./astryxFormControls-tqG5n_-4.js";import{F as n}from"./engine-CANtjazl.js";import"./preload-helper-Dp1pzeXC.js";import"./astryxLabel-DpNNyWQb.js";import"./VStack-B_8tY6X1.js";import"./TextInput-BmWIHmFq.js";import"./InputGroupContext-CUoMG_bm.js";import"./useResolvedRequired-CCdD9JT2.js";import"./useInputStatusIcon-B7Ecx52m.js";import"./InputClearButton-ZqT--LIv.js";import"./useDevWarning-B7kK_x5d.js";import"./characters-DWaYg7k3.js";import"./NumberInput-CaHphZuf.js";import"./circle-question-mark-akScH1OQ.js";const oe={title:"Utility/BAIUnmountAfterClose",component:p,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:`
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
        <AstryxFormTextInput label="Email" />
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
        `}}},argTypes:{children:{control:!1,description:"Single Modal or Drawer component to wrap",table:{type:{summary:"React.ReactElement<BAIUnmountAfterCloseChildProps>"}}}}},N=({open:s,title:t,onClose:r,afterOpenChange:o,children:d})=>(a.useEffect(()=>{if(s){o==null||o(!0);return}const c=setTimeout(()=>o==null?void 0:o(!1),200);return()=>clearTimeout(c)},[s]),e.jsxs("div",{style:{position:"fixed",top:0,right:0,bottom:0,width:360,background:"var(--color-background-surface)",borderLeft:"1px solid var(--color-border)",boxShadow:"-4px 0 12px rgba(0,0,0,0.08)",padding:16,transform:s?"translateX(0)":"translateX(100%)",transition:"transform 200ms ease",zIndex:1e3},children:[e.jsxs(A,{justify:"between",align:"center",style:{marginBottom:12},children:[e.jsx("strong",{children:t}),e.jsx(m,{size:"small",onClick:r,children:"Close"})]}),d]})),f={name:"Basic",parameters:{docs:{description:{story:"Basic usage with a Modal. The modal content unmounts after the close animation completes."}}},render:()=>{const[s,t]=a.useState(!1);return e.jsxs("div",{children:[e.jsx(m,{onClick:()=>t(!0),children:"Open Modal"}),e.jsx(p,{children:e.jsxs(u,{title:"Basic Modal",open:s,onOk:()=>t(!1),onCancel:()=>t(!1),children:[e.jsx("p",{children:"This content will unmount after the modal closes."}),e.jsxs("p",{children:["Mounted at: ",new Date().toLocaleTimeString()]})]})})]})}},g={parameters:{docs:{description:{story:"Demonstrates form state reset. Without BAIUnmountAfterClose, form values would persist when reopening. With it, the form is fresh on each open."}}},render:()=>{const[s,t]=a.useState(!1),[r,o]=a.useState(!1);return e.jsxs(A,{direction:"column",gap:"md",children:[e.jsxs("div",{children:[e.jsx("div",{style:{marginBottom:8,fontWeight:500},children:"✅ With BAIUnmountAfterClose (form resets on close):"}),e.jsx(m,{onClick:()=>t(!0),children:"Open Modal with Unmount"}),e.jsx(p,{children:e.jsxs(u,{title:"Form with Unmount",open:s,onOk:()=>t(!1),onCancel:()=>t(!1),children:[e.jsxs(n,{children:[e.jsx(n.Item,{label:"Name",name:"name",children:e.jsx(i,{label:"Name",placeholder:"Type something and close"})}),e.jsx(n.Item,{label:"Email",name:"email",children:e.jsx(i,{label:"Email",placeholder:"Type something and close"})})]}),e.jsx("p",{style:{fontSize:12,color:"#666"},children:"💡 Close and reopen - form will be reset!"})]})})]}),e.jsxs("div",{children:[e.jsx("div",{style:{marginBottom:8,fontWeight:500},children:"❌ Without BAIUnmountAfterClose (form state persists):"}),e.jsx(m,{onClick:()=>o(!0),children:"Open Modal without Unmount"}),e.jsxs(u,{title:"Form without Unmount",open:r,onOk:()=>o(!1),onCancel:()=>o(!1),children:[e.jsxs(n,{children:[e.jsx(n.Item,{label:"Name",name:"name",children:e.jsx(i,{label:"Name",placeholder:"Type something and close"})}),e.jsx(n.Item,{label:"Email",name:"email",children:e.jsx(i,{label:"Email",placeholder:"Type something and close"})})]}),e.jsx("p",{style:{fontSize:12,color:"#666"},children:"⚠️ Close and reopen - form values persist!"})]})]})]})}},x={parameters:{docs:{description:{story:"Works with Drawer component as well. The drawer content unmounts after the close animation."}}},render:()=>{const[s,t]=a.useState(!1);return e.jsxs("div",{children:[e.jsx(m,{onClick:()=>t(!0),children:"Open Drawer"}),e.jsx(p,{children:e.jsxs(N,{title:"Drawer with Unmount",open:s,onClose:()=>t(!1),children:[e.jsxs(n,{children:[e.jsx(n.Item,{label:"Username",name:"username",children:e.jsx(i,{label:"Username",placeholder:"Type and close to see reset"})}),e.jsx(n.Item,{label:"Password",name:"password",children:e.jsx(i,{type:"password",label:"Password",placeholder:"Type and close to see reset"})})]}),e.jsxs("p",{style:{fontSize:12,color:"#666",marginTop:16},children:["Mounted at: ",new Date().toLocaleTimeString()]})]})})]})}},y={parameters:{docs:{description:{story:"BAIUnmountAfterClose preserves original afterClose and afterOpenChange callbacks."}}},render:()=>{const[s,t]=a.useState(!1),[r,o]=a.useState([]),d=c=>{o(l=>[...l,`[${new Date().toLocaleTimeString()}] ${c}`])};return e.jsxs(A,{direction:"column",gap:"md",children:[e.jsx(m,{onClick:()=>t(!0),children:"Open Modal"}),e.jsx(p,{children:e.jsx(u,{title:"Callback Test",open:s,onCancel:()=>{d("onCancel called"),t(!1)},afterClose:()=>{d("afterClose called (after animation)")},children:e.jsx("p",{children:"Close this modal to see callback execution order."})})}),e.jsxs("div",{children:[e.jsx("div",{style:{marginBottom:8,fontWeight:500},children:"Callback Log:"}),e.jsx("div",{style:{padding:12,background:"#f5f5f5",borderRadius:4,fontFamily:"monospace",fontSize:11,maxHeight:150,overflow:"auto"},children:r.length===0?e.jsx("div",{style:{color:"#999"},children:"(no callbacks yet)"}):r.map((c,l)=>e.jsx("div",{children:c},l))})]})]})}},I={parameters:{docs:{description:{story:"Realistic example: Session creation modal that should reset on each open."}}},render:()=>{const[s,t]=a.useState(!1),[r,o]=a.useState([]),[d]=n.useForm(),c=l=>{o(h=>[...h,`${l.sessionName} (${l.image})`]),t(!1)};return e.jsxs(A,{direction:"column",gap:"md",children:[e.jsx(m,{type:"primary",onClick:()=>t(!0),children:"Create New Session"}),e.jsx(p,{children:e.jsxs(u,{title:"Create Compute Session",open:s,onCancel:()=>t(!1),footer:null,children:[e.jsxs(n,{form:d,layout:"vertical",onFinish:c,initialValues:{sessionName:`session-${Date.now()}`,image:"python:3.11"},children:[e.jsx(n.Item,{label:"Session Name",name:"sessionName",rules:[{required:!0,message:"Please enter session name"}],children:e.jsx(i,{label:"Session Name",placeholder:"my-jupyter-session"})}),e.jsx(n.Item,{label:"Container Image",name:"image",rules:[{required:!0,message:"Please select image"}],children:e.jsx(i,{label:"Container Image",placeholder:"python:3.11"})}),e.jsx(n.Item,{children:e.jsx(m,{type:"primary",block:!0,onClick:()=>d.submit(),children:"Create Session"})})]}),e.jsx("p",{style:{fontSize:11,color:"#666",marginTop:8},children:"💡 Form resets with default values each time you open the modal"})]})}),e.jsxs("div",{children:[e.jsx("div",{style:{marginBottom:8,fontWeight:500},children:"Created Sessions:"}),e.jsx("div",{style:{padding:12,background:"#f5f5f5",borderRadius:4,fontFamily:"monospace",fontSize:12},children:r.length===0?e.jsx("div",{style:{color:"#999"},children:"(no sessions yet)"}):r.map((l,h)=>e.jsxs("div",{children:[h+1,". ",l]},h))})]})]})}};var B,C,w;f.parameters={...f.parameters,docs:{...(B=f.parameters)==null?void 0:B.docs,source:{originalSource:`{
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
}`,...(w=(C=f.parameters)==null?void 0:C.docs)==null?void 0:w.source}}};var v,b,j;g.parameters={...g.parameters,docs:{...(v=g.parameters)==null?void 0:v.docs,source:{originalSource:`{
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
                  <AstryxFormTextInput label="Name" placeholder="Type something and close" />
                </Form.Item>
                <Form.Item label="Email" name="email">
                  <AstryxFormTextInput label="Email" placeholder="Type something and close" />
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
                <AstryxFormTextInput label="Name" placeholder="Type something and close" />
              </Form.Item>
              <Form.Item label="Email" name="email">
                <AstryxFormTextInput label="Email" placeholder="Type something and close" />
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
}`,...(j=(b=g.parameters)==null?void 0:b.docs)==null?void 0:j.source}}};var F,S,U;x.parameters={...x.parameters,docs:{...(F=x.parameters)==null?void 0:F.docs,source:{originalSource:`{
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
                <AstryxFormTextInput label="Username" placeholder="Type and close to see reset" />
              </Form.Item>
              <Form.Item label="Password" name="password">
                <AstryxFormTextInput type="password" label="Password" placeholder="Type and close to see reset" />
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
}`,...(U=(S=x.parameters)==null?void 0:S.docs)==null?void 0:U.source}}};var k,T,D;y.parameters={...y.parameters,docs:{...(k=y.parameters)==null?void 0:k.docs,source:{originalSource:`{
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
}`,...(D=(T=y.parameters)==null?void 0:T.docs)==null?void 0:D.source}}};var M,W,O;I.parameters={...I.parameters,docs:{...(M=I.parameters)==null?void 0:M.docs,source:{originalSource:`{
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
                <AstryxFormTextInput label="Session Name" placeholder="my-jupyter-session" />
              </Form.Item>

              <Form.Item label="Container Image" name="image" rules={[{
              required: true,
              message: 'Please select image'
            }]}>
                <AstryxFormTextInput label="Container Image" placeholder="python:3.11" />
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
}`,...(O=(W=I.parameters)==null?void 0:W.docs)==null?void 0:O.source}}};const ne=["Default","FormStateReset","WithDrawer","CallbackPreservation","RealWorldExample"];export{y as CallbackPreservation,f as Default,g as FormStateReset,I as RealWorldExample,x as WithDrawer,ne as __namedExportsOrder,oe as default};
