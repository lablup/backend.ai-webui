import{c as ee,j as r,b9 as Z,v as I,r as n,w as re}from"./iframe-DwMI4fWs.js";import{a as i}from"./TextInput-BP4HlqF3.js";import{s as te}from"./index-DlVAXWqr.js";import"./preload-helper-Dp1pzeXC.js";import"./formControl-De0FCYM4.js";import"./FormLayoutContext-DN3kP3zF.js";import"./TextInput-CoqmBbsd.js";import"./FieldStatus-BlI84VlW.js";import"./useIsHydrating-ZBZO5YH_.js";import"./useInputStatusIcon-DGFu6tlt.js";import"./useResolvedRequired-BLJ9vy4c.js";import"./fieldParts-Df7ZSJj7.js";import"./useDevWarning-Cd99jCrP.js";import"./inputAria-CStWn1wH.js";import"./InputClearButton-BcPQGr_V.js";import"./inputStyles.stylex-Bztz6H8O.js";import"./Field-CyQZUPlQ.js";import"./runtime-BhgYCK9T.js";import"./optionDisabledReason2-DX63wO3S.js";import"./IconWithTooltip2-C4PEED7R.js";import"./circle-alert-BNc-v90F.js";import"./Selector-Bh4PDMcE.js";import"./selectorPresentation.stylex-BJ2O3COR.js";import"./Section-BN3Wo2vt.js";import"./usePopover-DeuL2Hpa.js";import"./rtlStyles-T4i24HtE.js";import"./useFocusReturnVisibility-DkGOeTfl.js";import"./useAnnounceRenderedText-B5RDR4xf.js";import"./useHighlightedOptionScroll-BAyBmmFD.js";import"./useMenuOverflow-C3y3ZUw7.js";import"./SelectorOption-BfNjG-YF.js";import"./Item-BKNvoVr1.js";import"./computeTargetAndRel-BGwjeA1c.js";import"./composeEventHandlers-BolWE7qY.js";import"./useIndicator-DRHaj4_m.js";import"./Divider-CvGqu14-.js";const d=o=>{"use memo";const e=ee.c(12);let t,s,a,l;e[0]!==o?({className:s,width:l,children:t,...a}=o,e[0]=o,e[1]=t,e[2]=s,e[3]=a,e[4]=l):(t=e[1],s=e[2],a=e[3],l=e[4]);const c=l===void 0?"100%":l,g=s??"";let b;e[5]!==g?(b=["bai-compact-group",g].filter(Boolean),e[5]=g,e[6]=b):b=e[6];const y=b.join(" ");let w;return e[7]!==t||e[8]!==a||e[9]!==y||e[10]!==c?(w=r.jsx(Z,{...a,gap:0,wrap:"nowrap",width:c,className:y,children:t}),e[7]=t,e[8]=a,e[9]=y,e[10]=c,e[11]=w):w=e[11],w};d.displayName="BAICompactGroup";const Ne={title:"Layout/BAICompactGroup",component:d,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:`
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
        `}}},argTypes:{width:{control:{type:"text"},description:"Width of the whole run.",table:{type:{summary:"SizeValue"},defaultValue:{summary:"'100%'"}}},children:{control:!1,description:"The controls to weld together."},className:{control:!1,description:"Appended after the component’s own class."}}},ae=[{value:"lablup.com",label:"lablup.com"},{value:"example.org",label:"example.org"}],S=({status:o})=>{const[e,t]=n.useState("admin"),[s,a]=n.useState("lablup.com");return r.jsxs(d,{children:[r.jsx(i,{"aria-label":"E-Mail Prefix",value:e,onChange:t,width:"100%",placeholder:"Max. 30 characters"}),r.jsx(i,{"aria-label":"E-Mail Suffix",value:s,onChange:a,width:"100%",placeholder:"Max. 30 characters",status:o})]})},p={name:"Basic",parameters:{docs:{description:{story:"Two text inputs welded into one control. Click either field: the focused one’s accent border wins the shared edge instead of being painted over by its neighbour."}}},render:()=>r.jsx(S,{})},u={name:"WeldedVsPlainRow",parameters:{docs:{description:{story:"Top: `BAICompactGroup`. Bottom: the same two fields in a gapless `HStack`, which is what the migration shipped — the borders double up at the joint and both fields keep all four rounded corners."}}},render:()=>{const o=()=>{const[e,t]=n.useState("admin"),[s,a]=n.useState("lablup.com");return r.jsxs(Z,{gap:0,width:"100%",children:[r.jsx(i,{"aria-label":"E-Mail Prefix",value:e,onChange:t,width:"100%"}),r.jsx(i,{"aria-label":"E-Mail Suffix",value:s,onChange:a,width:"100%"})]})};return r.jsxs("div",{style:{display:"grid",gap:32},children:[r.jsx(S,{}),r.jsx(o,{})]})}},m={name:"ControlPlusAction",parameters:{docs:{description:{story:"A `Button` is welded only when it is a **direct child** of the group — a button nested inside a field (Astryx’s clear “×”) keeps its own shape."}}},render:()=>{const o=()=>{const[e,t]=n.useState("");return r.jsxs(d,{width:"auto",children:[r.jsx(i,{"aria-label":"Search",value:e,onChange:t,hasClear:!0,placeholder:"Session name"}),r.jsx(re,{label:"Search",variant:"primary"})]})};return r.jsx(o,{})}},h={name:"ThreeMembers",parameters:{docs:{description:{story:"The middle control loses the radius on both sides; only the run’s outermost corners stay rounded."}}},render:()=>{const o=()=>{const[e,t]=n.useState("admin"),[s,a]=n.useState(""),[l,c]=n.useState("lablup.com");return r.jsxs(d,{children:[r.jsx(i,{"aria-label":"Prefix",value:e,onChange:t,width:"100%"}),r.jsx(i,{"aria-label":"Team",value:s,onChange:a,width:"100%",placeholder:"optional"}),r.jsx(te,{"aria-label":"Domain",value:l,onChange:c,options:ae,width:"100%",hasClear:!0})]})};return r.jsx(o,{})}},f={name:"ErrorState",parameters:{docs:{description:{story:"One member in an error state. Because the surfaces overlap, hover or focus the erroring field to bring its full outline forward."}}},render:()=>r.jsx(S,{status:"error"})},x={name:"FormIntegration",parameters:{docs:{description:{story:"Two `Form.Item`s inside one group. The bordered surface is three levels below the group child here, and the weld still reaches it."}}},render:()=>r.jsx(I,{layout:"vertical",initialValues:{email_prefix:"admin",email_suffix:"lablup.com"},children:r.jsxs(d,{children:[r.jsx(I.Item,{name:"email_prefix",label:"E-Mail Prefix",style:{flex:1},rules:[{required:!0}],children:r.jsx(i,{"aria-label":"E-Mail Prefix"})}),r.jsx(I.Item,{name:"email_suffix",label:"E-Mail Suffix",style:{flex:1},rules:[{required:!0}],children:r.jsx(i,{"aria-label":"E-Mail Suffix"})})]})})};var v,A,C,j,B;p.parameters={...p.parameters,docs:{...(v=p.parameters)==null?void 0:v.docs,source:{originalSource:`{
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'Two text inputs welded into one control. Click either field: the ' + 'focused one’s accent border wins the shared edge instead of being ' + 'painted over by its neighbour.'
      }
    }
  },
  render: () => <EmailPair />
}`,...(C=(A=p.parameters)==null?void 0:A.docs)==null?void 0:C.source},description:{story:`The reported call site: an e-mail prefix and suffix that belong to one
address. The two fields share a single border and only the outer corners are
rounded.`,...(B=(j=p.parameters)==null?void 0:j.docs)==null?void 0:B.description}}};var T,P,E,M,F;u.parameters={...u.parameters,docs:{...(T=u.parameters)==null?void 0:T.docs,source:{originalSource:`{
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
}`,...(E=(P=u.parameters)==null?void 0:P.docs)==null?void 0:E.source},description:{story:"Side by side with the un-welded arrangement this replaces.",...(F=(M=u.parameters)==null?void 0:M.docs)==null?void 0:F.description}}};var G,k,R,D,_;m.parameters={...m.parameters,docs:{...(G=m.parameters)==null?void 0:G.docs,source:{originalSource:`{
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
}`,...(R=(k=m.parameters)==null?void 0:k.docs)==null?void 0:R.source},description:{story:"Heterogeneous run: a control plus a trailing action.",...(_=(D=m.parameters)==null?void 0:D.docs)==null?void 0:_.description}}};var V,q,N,W,H;h.parameters={...h.parameters,docs:{...(V=h.parameters)==null?void 0:V.docs,source:{originalSource:`{
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
}`,...(N=(q=h.parameters)==null?void 0:q.docs)==null?void 0:N.source},description:{story:"Three members, so the middle one has both inner corners squared.",...(H=(W=h.parameters)==null?void 0:W.docs)==null?void 0:H.description}}};var z,O,L,U,$;f.parameters={...f.parameters,docs:{...(z=f.parameters)==null?void 0:z.docs,source:{originalSource:`{
  name: 'ErrorState',
  parameters: {
    docs: {
      description: {
        story: 'One member in an error state. Because the surfaces overlap, hover ' + 'or focus the erroring field to bring its full outline forward.'
      }
    }
  },
  render: () => <EmailPair status="error" />
}`,...(L=(O=f.parameters)==null?void 0:O.docs)==null?void 0:L.source},description:{story:"A failing rule paints the border red; the weld does not hide it.",...($=(U=f.parameters)==null?void 0:U.docs)==null?void 0:$.description}}};var J,K,Q,X,Y;x.parameters={...x.parameters,docs:{...(J=x.parameters)==null?void 0:J.docs,source:{originalSource:`{
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
}`,...(Q=(K=x.parameters)==null?void 0:K.docs)==null?void 0:Q.source},description:{story:"The real call-site shape: each member is a `Form.Item` that owns its own\nlabel, rules and error slot — which is exactly why Astryx's `InputGroup`\n(one group-level label, one input) could not be used.",...(Y=(X=x.parameters)==null?void 0:X.docs)==null?void 0:Y.description}}};const We=["Default","AgainstAPlainRow","WithTrailingButton","ThreeMembers","Error","InsideAForm"];export{u as AgainstAPlainRow,p as Default,f as Error,x as InsideAForm,h as ThreeMembers,m as WithTrailingButton,We as __namedExportsOrder,Ne as default};
