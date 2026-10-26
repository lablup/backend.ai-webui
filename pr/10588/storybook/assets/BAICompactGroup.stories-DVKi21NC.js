import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-D0Ex1IVc.js";import{t as n}from"./jsx-runtime-MKhVqBIO.js";import{t as r}from"./compiler-runtime-CdReTaax.js";import{n as i,t as a}from"./HStack-DXC_f-65.js";import{n as o,t as s}from"./Button-CeeX5Bmd.js";import{n as c,t as l}from"./Form-D8tC8Qyr.js";import{n as u,t as d}from"./Selector-CGpNF9n2.js";import{n as f,t as p}from"./TextInput-D3BEjwUE.js";var m,h,g;function _(){return(_=e((()=>{m=r(),i(),h=n(),g=e=>{"use memo";let t=(0,m.c)(12),n,r,i,o;t[0]===e?(n=t[1],r=t[2],i=t[3],o=t[4]):({className:r,width:o,children:n,...i}=e,t[0]=e,t[1]=n,t[2]=r,t[3]=i,t[4]=o);let s=o===void 0?`100%`:o,c=r??``,l;t[5]===c?l=t[6]:(l=[`bai-compact-group`,c].filter(Boolean),t[5]=c,t[6]=l);let u=l.join(` `),d;return t[7]!==n||t[8]!==i||t[9]!==u||t[10]!==s?(d=(0,h.jsx)(a,{...i,gap:0,wrap:`nowrap`,width:s,className:u,children:n}),t[7]=n,t[8]=i,t[9]=u,t[10]=s,t[11]=d):d=t[11],d},g.displayName=`BAICompactGroup`})))()}function v({label:e,value:t,onChange:n}){return(0,b.jsx)(p,{"aria-label":e,value:t??``,onChange:e=>n?.(e),width:`100%`})}var y,b,x,S,C,w,T,E,D,O,k,A;function j(){return(j=e((()=>{l(),_(),o(),i(),u(),f(),y=t(),b=n(),x={title:`Layout/BAICompactGroup`,component:g,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:`
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
        `}}},argTypes:{width:{control:{type:`text`},description:`Width of the whole run.`,table:{type:{summary:`SizeValue`},defaultValue:{summary:`'100%'`}}},children:{control:!1,description:`The controls to weld together.`},className:{control:!1,description:`Appended after the component’s own class.`}}},S=[{value:`lablup.com`,label:`lablup.com`},{value:`example.org`,label:`example.org`}],C=({status:e})=>{let[t,n]=(0,y.useState)(`admin`),[r,i]=(0,y.useState)(`lablup.com`);return(0,b.jsxs)(g,{children:[(0,b.jsx)(p,{"aria-label":`E-Mail Prefix`,value:t,onChange:n,width:`100%`,placeholder:`Max. 30 characters`}),(0,b.jsx)(p,{"aria-label":`E-Mail Suffix`,value:r,onChange:i,width:`100%`,placeholder:`Max. 30 characters`,status:e})]})},w={name:`Basic`,parameters:{docs:{description:{story:`Two text inputs welded into one control. Click either field: the focused one’s accent border wins the shared edge instead of being painted over by its neighbour.`}}},render:()=>(0,b.jsx)(C,{})},T={name:`WeldedVsPlainRow`,parameters:{docs:{description:{story:"Top: `BAICompactGroup`. Bottom: the same two fields in a gapless `HStack`, which is what the migration shipped — the borders double up at the joint and both fields keep all four rounded corners."}}},render:()=>(0,b.jsxs)(`div`,{style:{display:`grid`,gap:32},children:[(0,b.jsx)(C,{}),(0,b.jsx)(()=>{let[e,t]=(0,y.useState)(`admin`),[n,r]=(0,y.useState)(`lablup.com`);return(0,b.jsxs)(a,{gap:0,width:`100%`,children:[(0,b.jsx)(p,{"aria-label":`E-Mail Prefix`,value:e,onChange:t,width:`100%`}),(0,b.jsx)(p,{"aria-label":`E-Mail Suffix`,value:n,onChange:r,width:`100%`})]})},{})]})},E={name:`ControlPlusAction`,parameters:{docs:{description:{story:"A `Button` is welded only when it is a **direct child** of the group — a button nested inside a field (Astryx’s clear “×”) keeps its own shape."}}},render:()=>(0,b.jsx)(()=>{let[e,t]=(0,y.useState)(``);return(0,b.jsxs)(g,{width:`auto`,children:[(0,b.jsx)(p,{"aria-label":`Search`,value:e,onChange:t,hasClear:!0,placeholder:`Session name`}),(0,b.jsx)(s,{label:`Search`,variant:`primary`})]})},{})},D={name:`ThreeMembers`,parameters:{docs:{description:{story:`The middle control loses the radius on both sides; only the run’s outermost corners stay rounded.`}}},render:()=>(0,b.jsx)(()=>{let[e,t]=(0,y.useState)(`admin`),[n,r]=(0,y.useState)(``),[i,a]=(0,y.useState)(`lablup.com`);return(0,b.jsxs)(g,{children:[(0,b.jsx)(p,{"aria-label":`Prefix`,value:e,onChange:t,width:`100%`}),(0,b.jsx)(p,{"aria-label":`Team`,value:n,onChange:r,width:`100%`,placeholder:`optional`}),(0,b.jsx)(d,{"aria-label":`Domain`,value:i,onChange:a,options:S,width:`100%`,hasClear:!0})]})},{})},O={name:`ErrorState`,parameters:{docs:{description:{story:`One member in an error state. Because the surfaces overlap, hover or focus the erroring field to bring its full outline forward.`}}},render:()=>(0,b.jsx)(C,{status:`error`})},k={name:`FormIntegration`,parameters:{docs:{description:{story:"Two `Form.Item`s inside one group. The bordered surface is three levels below the group child here, and the weld still reaches it."}}},render:()=>(0,b.jsx)(c,{layout:`vertical`,initialValues:{email_prefix:`admin`,email_suffix:`lablup.com`},children:(0,b.jsxs)(g,{children:[(0,b.jsx)(c.Item,{name:`email_prefix`,label:`E-Mail Prefix`,style:{flex:1},rules:[{required:!0}],children:(0,b.jsx)(v,{label:`E-Mail Prefix`})}),(0,b.jsx)(c.Item,{name:`email_suffix`,label:`E-Mail Suffix`,style:{flex:1},rules:[{required:!0}],children:(0,b.jsx)(v,{label:`E-Mail Suffix`})})]})})},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'Two text inputs welded into one control. Click either field: the ' + 'focused one’s accent border wins the shared edge instead of being ' + 'painted over by its neighbour.'
      }
    }
  },
  render: () => <EmailPair />
}`,...w.parameters?.docs?.source},description:{story:`The reported call site: an e-mail prefix and suffix that belong to one
address. The two fields share a single border and only the outer corners are
rounded.`,...w.parameters?.docs?.description}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
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
          <TextInput aria-label="E-Mail Prefix" value={prefix} onChange={setPrefix} width="100%" />
          <TextInput aria-label="E-Mail Suffix" value={suffix} onChange={setSuffix} width="100%" />
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
}`,...T.parameters?.docs?.source},description:{story:`Side by side with the un-welded arrangement this replaces.`,...T.parameters?.docs?.description}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
          <TextInput aria-label="Search" value={value} onChange={setValue} hasClear placeholder="Session name" />
          <Button label="Search" variant="primary" />
        </BAICompactGroup>;
    };
    return <Run />;
  }
}`,...E.parameters?.docs?.source},description:{story:`Heterogeneous run: a control plus a trailing action.`,...E.parameters?.docs?.description}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
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
          <TextInput aria-label="Prefix" value={prefix} onChange={setPrefix} width="100%" />
          <TextInput aria-label="Team" value={middle} onChange={setMiddle} width="100%" placeholder="optional" />
          <Selector aria-label="Domain" value={domain} onChange={setDomain} options={sampleDomains} width="100%"
        // Astryx requires \`hasClear\` whenever the value may be null. It
        // also renders the clear affordance INSIDE the field, which is the
        // nesting the stylesheet's button rule has to step around.
        hasClear />
        </BAICompactGroup>;
    };
    return <Run />;
  }
}`,...D.parameters?.docs?.source},description:{story:`Three members, so the middle one has both inner corners squared.`,...D.parameters?.docs?.description}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  name: 'ErrorState',
  parameters: {
    docs: {
      description: {
        story: 'One member in an error state. Because the surfaces overlap, hover ' + 'or focus the erroring field to bring its full outline forward.'
      }
    }
  },
  render: () => <EmailPair status="error" />
}`,...O.parameters?.docs?.source},description:{story:`A failing rule paints the border red; the weld does not hide it.`,...O.parameters?.docs?.description}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
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
}`,...k.parameters?.docs?.source},description:{story:"The real call-site shape: each member is a `Form.Item` that owns its own\nlabel, rules and error slot — which is exactly why Astryx's `InputGroup`\n(one group-level label, one input) could not be used.",...k.parameters?.docs?.description}}},A=[`Default`,`AgainstAPlainRow`,`WithTrailingButton`,`ThreeMembers`,`Error`,`InsideAForm`]})))()}j();export{T as AgainstAPlainRow,w as Default,O as Error,k as InsideAForm,D as ThreeMembers,E as WithTrailingButton,A as __namedExportsOrder,x as default};