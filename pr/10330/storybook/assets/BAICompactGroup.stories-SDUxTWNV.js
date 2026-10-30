import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-DlPsW1c0.js";import{t as n}from"./jsx-runtime-MKhVqBIO.js";import{t as r}from"./compiler-runtime-DU4U6aph.js";import{n as i,t as a}from"./HStack-CEbJ9Tyj.js";import{n as o,t as s}from"./Button-ntW_drb7.js";import{n as c,t as l}from"./Form-C05xwQWZ.js";import{n as u,t as d}from"./Selector-Qo6rO7Ht.js";import{n as f,t as p}from"./TextInput-sUx-Qzvg.js";var m,h,g;function _(){return(_=e((()=>{m=r(),i(),h=n(),g=e=>{"use memo";let t=(0,m.c)(12),n,r,i,o;t[0]===e?(n=t[1],r=t[2],i=t[3],o=t[4]):({className:r,width:o,children:n,...i}=e,t[0]=e,t[1]=n,t[2]=r,t[3]=i,t[4]=o);let s=o===void 0?`100%`:o,c=r??``,l;t[5]===c?l=t[6]:(l=[`bai-compact-group`,c].filter(Boolean),t[5]=c,t[6]=l);let u=l.join(` `),d;return t[7]!==n||t[8]!==i||t[9]!==u||t[10]!==s?(d=(0,h.jsx)(a,{...i,gap:0,wrap:`nowrap`,width:s,className:u,children:n}),t[7]=n,t[8]=i,t[9]=u,t[10]=s,t[11]=d):d=t[11],d},g.displayName=`BAICompactGroup`})))()}var v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q;function J(){return(J=e((()=>{l(),_(),u(),f(),o(),i(),v=t(),y=n(),R={title:`Layout/BAICompactGroup`,component:g,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:`
**BAICompactGroup** joins adjacent form controls into one welded control.

## Features
- One shared border at each joint (children overlap by \`var(--border-width)\`)
- Squared inner corners, untouched outer corners
- Focused / hovered control wins the shared edge (\`z-index\` raise)
- Works with bare Astryx controls *and* with \`Form.Item\` wrappers

## Usage
\`\`\`tsx
<BAICompactGroup>
  <Form.Item name="email_prefix" label="E-Mail Prefix" style={{ flex: 1 }}>
    <TextInput />
  </Form.Item>
  <Form.Item name="email_suffix" label="E-Mail Suffix" style={{ flex: 1 }}>
    <TextInput />
  </Form.Item>
</BAICompactGroup>
\`\`\`

## Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| width | \`SizeValue\` | \`'100%'\` | Width of the run |
| children | \`ReactNode\` | - | The controls to weld; size them with \`flex\` as usual |
| className | \`string\` | - | Appended after \`bai-compact-group\` |

\`gap\` and \`wrap\` are **not** accepted: a gap would undo the weld, and a
wrapped run would leave a squared inner corner at the end of a line.
        `}}},argTypes:{width:{control:{type:`text`},description:`Width of the whole run.`,table:{type:{summary:`SizeValue`},defaultValue:{summary:`'100%'`}}},children:{control:!1,description:`The controls to weld together.`},className:{control:!1,description:`Appended after the component’s own class.`}}},z=[{value:`lablup.com`,label:`lablup.com`},{value:`example.org`,label:`example.org`}],B=({status:e})=>{let[t,n]=(0,v.useState)(`admin`),[r,i]=(0,v.useState)(`lablup.com`);return(0,y.jsxs)(g,{children:[(0,y.jsx)(p,{"aria-label":`E-Mail Prefix`,value:t,onChange:n,width:`100%`,placeholder:`Max. 30 characters`}),(0,y.jsx)(p,{"aria-label":`E-Mail Suffix`,value:r,onChange:i,width:`100%`,placeholder:`Max. 30 characters`,status:e})]})},V={name:`Basic`,parameters:{docs:{description:{story:`Two text inputs welded into one control. Click either field: the focused one’s accent border wins the shared edge instead of being painted over by its neighbour.`}}},render:()=>(0,y.jsx)(B,{})},H={name:`WeldedVsPlainRow`,parameters:{docs:{description:{story:"Top: `BAICompactGroup`. Bottom: the same two fields in a gapless `HStack`, which is what the migration shipped — the borders double up at the joint and both fields keep all four rounded corners."}}},render:()=>(0,y.jsxs)(`div`,{style:{display:`grid`,gap:32},children:[(0,y.jsx)(B,{}),(0,y.jsx)(()=>{let[e,t]=(0,v.useState)(`admin`),[n,r]=(0,v.useState)(`lablup.com`);return(0,y.jsxs)(a,{gap:0,width:`100%`,children:[(0,y.jsx)(p,{"aria-label":`E-Mail Prefix`,value:e,onChange:t,width:`100%`}),(0,y.jsx)(p,{"aria-label":`E-Mail Suffix`,value:n,onChange:r,width:`100%`})]})},{})]})},U={name:`ControlPlusAction`,parameters:{docs:{description:{story:"A `Button` is welded only when it is a **direct child** of the group — a button nested inside a field (Astryx’s clear “×”) keeps its own shape."}}},render:()=>(0,y.jsx)(()=>{let[e,t]=(0,v.useState)(``);return(0,y.jsxs)(g,{width:`auto`,children:[(0,y.jsx)(p,{"aria-label":`Search`,value:e,onChange:t,hasClear:!0,placeholder:`Session name`}),(0,y.jsx)(s,{label:`Search`,variant:`primary`})]})},{})},W={name:`ThreeMembers`,parameters:{docs:{description:{story:`The middle control loses the radius on both sides; only the run’s outermost corners stay rounded.`}}},render:()=>(0,y.jsx)(()=>{let[e,t]=(0,v.useState)(`admin`),[n,r]=(0,v.useState)(``),[i,a]=(0,v.useState)(`lablup.com`);return(0,y.jsxs)(g,{children:[(0,y.jsx)(p,{"aria-label":`Prefix`,value:e,onChange:t,width:`100%`}),(0,y.jsx)(p,{"aria-label":`Team`,value:n,onChange:r,width:`100%`,placeholder:`optional`}),(0,y.jsx)(d,{"aria-label":`Domain`,value:i,onChange:a,options:z,width:`100%`,hasClear:!0})]})},{})},G={name:`ErrorState`,parameters:{docs:{description:{story:`One member in an error state. Because the surfaces overlap, hover or focus the erroring field to bring its full outline forward.`}}},render:()=>(0,y.jsx)(B,{status:`error`})},K={name:`FormIntegration`,parameters:{docs:{description:{story:"Two `Form.Item`s inside one group. The bordered surface is three levels below the group child here, and the weld still reaches it."}}},render:()=>(0,y.jsx)(c,{layout:`vertical`,initialValues:{email_prefix:`admin`,email_suffix:`lablup.com`},children:(0,y.jsxs)(g,{children:[(0,y.jsx)(c.Item,{name:`email_prefix`,label:`E-Mail Prefix`,style:{flex:1},rules:[{required:!0}],children:(0,y.jsx)(p,{"aria-label":`E-Mail Prefix`})}),(0,y.jsx)(c.Item,{name:`email_suffix`,label:`E-Mail Suffix`,style:{flex:1},rules:[{required:!0}],children:(0,y.jsx)(p,{"aria-label":`E-Mail Suffix`})})]})})},V.parameters={...V.parameters,docs:{...(b=V.parameters)==null?void 0:b.docs,source:{originalSource:`{
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'Two text inputs welded into one control. Click either field: the ' + 'focused one’s accent border wins the shared edge instead of being ' + 'painted over by its neighbour.'
      }
    }
  },
  render: () => <EmailPair />
}`,...(x=V.parameters)==null||(x=x.docs)==null?void 0:x.source},description:{story:`The reported call site: an e-mail prefix and suffix that belong to one
address. The two fields share a single border and only the outer corners are
rounded.`,...(S=V.parameters)==null||(S=S.docs)==null?void 0:S.description}}},H.parameters={...H.parameters,docs:{...(C=H.parameters)==null?void 0:C.docs,source:{originalSource:`{
  name: 'WeldedVsPlainRow',
  parameters: {
    docs: {
      description: {
        story: 'Top: \`BAICompactGroup\`. Bottom: the same two fields in a gapless ' + '\`HStack\`, which is what the migration shipped — the borders double ' + 'up at the joint and both fields keep all four rounded corners.'
      }
    }
  },
  render: () => {
    const Plain = () => {
      const [prefix, setPrefix] = useState('admin');
      const [suffix, setSuffix] = useState('lablup.com');
      return <HStack gap={0} width="100%">
          <BAITextInput aria-label="E-Mail Prefix" value={prefix} onChange={setPrefix} width="100%" />
          <BAITextInput aria-label="E-Mail Suffix" value={suffix} onChange={setSuffix} width="100%" />
        </HStack>;
    };
    return <div style={{
      display: 'grid',
      gap: 32
    }}>
        <EmailPair />
        <Plain />
      </div>;
  }
}`,...(w=H.parameters)==null||(w=w.docs)==null?void 0:w.source},description:{story:`Side by side with the un-welded arrangement this replaces.`,...(T=H.parameters)==null||(T=T.docs)==null?void 0:T.description}}},U.parameters={...U.parameters,docs:{...(E=U.parameters)==null?void 0:E.docs,source:{originalSource:`{
  name: 'ControlPlusAction',
  parameters: {
    docs: {
      description: {
        story: 'A \`Button\` is welded only when it is a **direct child** of the ' + 'group — a button nested inside a field (Astryx’s clear “×”) keeps ' + 'its own shape.'
      }
    }
  },
  render: () => {
    const Run = () => {
      const [value, setValue] = useState('');
      return <BAICompactGroup width="auto">
          <BAITextInput aria-label="Search" value={value} onChange={setValue} hasClear placeholder="Session name" />
          <Button label="Search" variant="primary" />
        </BAICompactGroup>;
    };
    return <Run />;
  }
}`,...(D=U.parameters)==null||(D=D.docs)==null?void 0:D.source},description:{story:`Heterogeneous run: a control plus a trailing action.`,...(O=U.parameters)==null||(O=O.docs)==null?void 0:O.description}}},W.parameters={...W.parameters,docs:{...(k=W.parameters)==null?void 0:k.docs,source:{originalSource:`{
  name: 'ThreeMembers',
  parameters: {
    docs: {
      description: {
        story: 'The middle control loses the radius on both sides; only the run’s ' + 'outermost corners stay rounded.'
      }
    }
  },
  render: () => {
    const Run = () => {
      const [prefix, setPrefix] = useState('admin');
      const [middle, setMiddle] = useState('');
      const [domain, setDomain] = useState<string | null>('lablup.com');
      return <BAICompactGroup>
          <BAITextInput aria-label="Prefix" value={prefix} onChange={setPrefix} width="100%" />
          <BAITextInput aria-label="Team" value={middle} onChange={setMiddle} width="100%" placeholder="optional" />
          <BAISelector aria-label="Domain" value={domain} onChange={setDomain} options={sampleDomains} width="100%"
        // Astryx requires \`hasClear\` whenever the value may be null. It
        // also renders the clear affordance INSIDE the field, which is the
        // nesting the stylesheet's button rule has to step around.
        hasClear />
        </BAICompactGroup>;
    };
    return <Run />;
  }
}`,...(A=W.parameters)==null||(A=A.docs)==null?void 0:A.source},description:{story:`Three members, so the middle one has both inner corners squared.`,...(j=W.parameters)==null||(j=j.docs)==null?void 0:j.description}}},G.parameters={...G.parameters,docs:{...(M=G.parameters)==null?void 0:M.docs,source:{originalSource:`{
  name: 'ErrorState',
  parameters: {
    docs: {
      description: {
        story: 'One member in an error state. Because the surfaces overlap, hover ' + 'or focus the erroring field to bring its full outline forward.'
      }
    }
  },
  render: () => <EmailPair status="error" />
}`,...(N=G.parameters)==null||(N=N.docs)==null?void 0:N.source},description:{story:`A failing rule paints the border red; the weld does not hide it.`,...(P=G.parameters)==null||(P=P.docs)==null?void 0:P.description}}},K.parameters={...K.parameters,docs:{...(F=K.parameters)==null?void 0:F.docs,source:{originalSource:`{
  name: 'FormIntegration',
  parameters: {
    docs: {
      description: {
        story: 'Two \`Form.Item\`s inside one group. The bordered surface is three ' + 'levels below the group child here, and the weld still reaches it.'
      }
    }
  },
  render: () => <Form layout="vertical" initialValues={{
    email_prefix: 'admin',
    email_suffix: 'lablup.com'
  }}>
      <BAICompactGroup>
        <Form.Item name="email_prefix" label="E-Mail Prefix" style={{
        flex: 1
      }} rules={[{
        required: true
      }]}>
          <BAITextInput aria-label="E-Mail Prefix" />
        </Form.Item>
        <Form.Item name="email_suffix" label="E-Mail Suffix" style={{
        flex: 1
      }} rules={[{
        required: true
      }]}>
          <BAITextInput aria-label="E-Mail Suffix" />
        </Form.Item>
      </BAICompactGroup>
    </Form>
}`,...(I=K.parameters)==null||(I=I.docs)==null?void 0:I.source},description:{story:"The real call-site shape: each member is a `Form.Item` that owns its own\nlabel, rules and error slot — which is exactly why Astryx's `InputGroup`\n(one group-level label, one input) could not be used.",...(L=K.parameters)==null||(L=L.docs)==null?void 0:L.description}}},q=[`Default`,`AgainstAPlainRow`,`WithTrailingButton`,`ThreeMembers`,`Error`,`InsideAForm`]})))()}J();export{H as AgainstAPlainRow,V as Default,G as Error,K as InsideAForm,W as ThreeMembers,U as WithTrailingButton,q as __namedExportsOrder,R as default};