import{c as re,j as r,a6 as ee,r as i,y as te}from"./iframe-CWC5D5nr.js";import{F as S}from"./engine-LFIO9OiW.js";import{T as n}from"./TextInput-DBWl5z5w.js";import{S as ae}from"./Selector-B3PF-F5v.js";import"./preload-helper-Dp1pzeXC.js";import"./circle-question-mark-GYVyyDrc.js";import"./InputGroupContext-Dn8NpFq5.js";import"./useResolvedRequired-BJ6e44Y5.js";import"./useInputStatusIcon-Cty-KxD6.js";import"./InputClearButton-Bk51RzV6.js";import"./useDevWarning-9Zy5QWAT.js";import"./usePopover-DGjNX1V7.js";import"./rtlStyles-T4i24HtE.js";import"./useTypeahead-0UcZE_Y9.js";import"./SelectorOption-BIgG2HvL.js";import"./Item-CQk5nrQD.js";import"./useIndicator-BLPFecBy.js";import"./isRenderable-BUV0eL6r.js";import"./Divider-C_CYna3b.js";const d=a=>{"use memo";const e=re.c(12);let t,o,s,l;e[0]!==a?({className:o,width:l,children:t,...s}=a,e[0]=a,e[1]=t,e[2]=o,e[3]=s,e[4]=l):(t=e[1],o=e[2],s=e[3],l=e[4]);const c=l===void 0?"100%":l,g=o??"";let b;e[5]!==g?(b=["bai-compact-group",g].filter(Boolean),e[5]=g,e[6]=b):b=e[6];const y=b.join(" ");let w;return e[7]!==t||e[8]!==s||e[9]!==y||e[10]!==c?(w=r.jsx(ee,{...s,gap:0,wrap:"nowrap",width:c,className:y,children:t}),e[7]=t,e[8]=s,e[9]=y,e[10]=c,e[11]=w):w=e[11],w};d.displayName="BAICompactGroup";const Te={title:"Layout/BAICompactGroup",component:d,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:`
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
    <AstryxFormTextInput label="E-Mail Prefix" />
  </Form.Item>
  <Form.Item name="email_suffix" label="E-Mail Suffix" style={{ flex: 1 }}>
    <AstryxFormTextInput label="E-Mail Suffix" />
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
        `}}},argTypes:{width:{control:{type:"text"},description:"Width of the whole run.",table:{type:{summary:"SizeValue"},defaultValue:{summary:"'100%'"}}},children:{control:!1,description:"The controls to weld together."},className:{control:!1,description:"Appended after the component’s own class."}}},oe=[{value:"lablup.com",label:"lablup.com"},{value:"example.org",label:"example.org"}],I=({status:a})=>{const[e,t]=i.useState("admin"),[o,s]=i.useState("lablup.com");return r.jsxs(d,{children:[r.jsx(n,{label:"E-Mail Prefix",value:e,onChange:t,width:"100%",placeholder:"Max. 30 characters"}),r.jsx(n,{label:"E-Mail Suffix",value:o,onChange:s,width:"100%",placeholder:"Max. 30 characters",status:a?{type:"error"}:void 0})]})},u={name:"Basic",parameters:{docs:{description:{story:"Two text inputs welded into one control. Click either field: the focused one’s accent border wins the shared edge instead of being painted over by its neighbour."}}},render:()=>r.jsx(I,{})},p={name:"WeldedVsPlainRow",parameters:{docs:{description:{story:"Top: `BAICompactGroup`. Bottom: the same two fields in a gapless `HStack`, which is what the migration shipped — the borders double up at the joint and both fields keep all four rounded corners."}}},render:()=>{const a=()=>{const[e,t]=i.useState("admin"),[o,s]=i.useState("lablup.com");return r.jsxs(ee,{gap:0,width:"100%",children:[r.jsx(n,{label:"E-Mail Prefix",value:e,onChange:t,width:"100%"}),r.jsx(n,{label:"E-Mail Suffix",value:o,onChange:s,width:"100%"})]})};return r.jsxs("div",{style:{display:"grid",gap:32},children:[r.jsx(I,{}),r.jsx(a,{})]})}},m={name:"ControlPlusAction",parameters:{docs:{description:{story:"A `Button` is welded only when it is a **direct child** of the group — a button nested inside a field (Astryx’s clear “×”) keeps its own shape."}}},render:()=>{const a=()=>{const[e,t]=i.useState("");return r.jsxs(d,{width:"auto",children:[r.jsx(n,{label:"Search",value:e,onChange:t,hasClear:!0,placeholder:"Session name"}),r.jsx(te,{label:"Search",variant:"primary"})]})};return r.jsx(a,{})}},h={name:"ThreeMembers",parameters:{docs:{description:{story:"The middle control loses the radius on both sides; only the run’s outermost corners stay rounded."}}},render:()=>{const a=()=>{const[e,t]=i.useState("admin"),[o,s]=i.useState(""),[l,c]=i.useState("lablup.com");return r.jsxs(d,{children:[r.jsx(n,{label:"Prefix",value:e,onChange:t,width:"100%"}),r.jsx(n,{label:"Team",value:o,onChange:s,width:"100%",placeholder:"optional"}),r.jsx(ae,{label:"Domain",value:l,onChange:c,options:oe,width:"100%",hasClear:!0})]})};return r.jsx(a,{})}},f={name:"ErrorState",parameters:{docs:{description:{story:"One member in an error state. Because the surfaces overlap, hover or focus the erroring field to bring its full outline forward."}}},render:()=>r.jsx(I,{status:"error"})},x={name:"FormIntegration",parameters:{docs:{description:{story:"Two `Form.Item`s inside one group. The bordered surface is three levels below the group child here, and the weld still reaches it."}}},render:()=>r.jsx(S,{layout:"vertical",initialValues:{email_prefix:"admin",email_suffix:"lablup.com"},children:r.jsxs(d,{children:[r.jsx(S.Item,{name:"email_prefix",label:"E-Mail Prefix",style:{flex:1},rules:[{required:!0}],children:r.jsx(v,{label:"E-Mail Prefix"})}),r.jsx(S.Item,{name:"email_suffix",label:"E-Mail Suffix",style:{flex:1},rules:[{required:!0}],children:r.jsx(v,{label:"E-Mail Suffix"})})]})})};function v({label:a,value:e,onChange:t}){return r.jsx(n,{label:a,isLabelHidden:!0,value:e??"",onChange:o=>t==null?void 0:t(o),width:"100%"})}var T,j,A,C,P;u.parameters={...u.parameters,docs:{...(T=u.parameters)==null?void 0:T.docs,source:{originalSource:`{
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'Two text inputs welded into one control. Click either field: the ' + 'focused one’s accent border wins the shared edge instead of being ' + 'painted over by its neighbour.'
      }
    }
  },
  render: () => <EmailPair />
}`,...(A=(j=u.parameters)==null?void 0:j.docs)==null?void 0:A.source},description:{story:`The reported call site: an e-mail prefix and suffix that belong to one
address. The two fields share a single border and only the outer corners are
rounded.`,...(P=(C=u.parameters)==null?void 0:C.docs)==null?void 0:P.description}}};var E,B,F,M,G;p.parameters={...p.parameters,docs:{...(E=p.parameters)==null?void 0:E.docs,source:{originalSource:`{
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
          <TextInput label="E-Mail Prefix" value={prefix} onChange={setPrefix} width="100%" />
          <TextInput label="E-Mail Suffix" value={suffix} onChange={setSuffix} width="100%" />
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
}`,...(F=(B=p.parameters)==null?void 0:B.docs)==null?void 0:F.source},description:{story:"Side by side with the un-welded arrangement this replaces.",...(G=(M=p.parameters)==null?void 0:M.docs)==null?void 0:G.description}}};var k,R,D,_,V;m.parameters={...m.parameters,docs:{...(k=m.parameters)==null?void 0:k.docs,source:{originalSource:`{
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
          <TextInput label="Search" value={value} onChange={setValue} hasClear placeholder="Session name" />
          <Button label="Search" variant="primary" />
        </BAICompactGroup>;
    };
    return <Run />;
  }
}`,...(D=(R=m.parameters)==null?void 0:R.docs)==null?void 0:D.source},description:{story:"Heterogeneous run: a control plus a trailing action.",...(V=(_=m.parameters)==null?void 0:_.docs)==null?void 0:V.description}}};var q,N,H,W,z;h.parameters={...h.parameters,docs:{...(q=h.parameters)==null?void 0:q.docs,source:{originalSource:`{
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
          <TextInput label="Prefix" value={prefix} onChange={setPrefix} width="100%" />
          <TextInput label="Team" value={middle} onChange={setMiddle} width="100%" placeholder="optional" />
          <Selector label="Domain" value={domain} onChange={setDomain} options={sampleDomains} width="100%"
        // Astryx requires \`hasClear\` whenever the value may be null. It
        // also renders the clear affordance INSIDE the field, which is the
        // nesting the stylesheet's button rule has to step around.
        hasClear />
        </BAICompactGroup>;
    };
    return <Run />;
  }
}`,...(H=(N=h.parameters)==null?void 0:N.docs)==null?void 0:H.source},description:{story:"Three members, so the middle one has both inner corners squared.",...(z=(W=h.parameters)==null?void 0:W.docs)==null?void 0:z.description}}};var O,L,U,$,J;f.parameters={...f.parameters,docs:{...(O=f.parameters)==null?void 0:O.docs,source:{originalSource:`{
  name: 'ErrorState',
  parameters: {
    docs: {
      description: {
        story: 'One member in an error state. Because the surfaces overlap, hover ' + 'or focus the erroring field to bring its full outline forward.'
      }
    }
  },
  render: () => <EmailPair status="error" />
}`,...(U=(L=f.parameters)==null?void 0:L.docs)==null?void 0:U.source},description:{story:"A failing rule paints the border red; the weld does not hide it.",...(J=($=f.parameters)==null?void 0:$.docs)==null?void 0:J.description}}};var K,Q,X,Y,Z;x.parameters={...x.parameters,docs:{...(K=x.parameters)==null?void 0:K.docs,source:{originalSource:`{
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
          <FormTextInput label="E-Mail Prefix" />
        </Form.Item>
        <Form.Item name="email_suffix" label="E-Mail Suffix" style={{
        flex: 1
      }} rules={[{
        required: true
      }]}>
          <FormTextInput label="E-Mail Suffix" />
        </Form.Item>
      </BAICompactGroup>
    </Form>
}`,...(X=(Q=x.parameters)==null?void 0:Q.docs)==null?void 0:X.source},description:{story:"The real call-site shape: each member is a `Form.Item` that owns its own\nlabel, rules and error slot — which is exactly why Astryx's `InputGroup`\n(one group-level label, one input) could not be used.",...(Z=(Y=x.parameters)==null?void 0:Y.docs)==null?void 0:Z.description}}};const je=["Default","AgainstAPlainRow","WithTrailingButton","ThreeMembers","Error","InsideAForm"];export{p as AgainstAPlainRow,u as Default,f as Error,x as InsideAForm,h as ThreeMembers,m as WithTrailingButton,je as __namedExportsOrder,Te as default};
