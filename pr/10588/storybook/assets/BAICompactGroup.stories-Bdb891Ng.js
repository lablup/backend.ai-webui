import{n as e}from"./rolldown-runtime-2s6bX4vc.js";import{n as t,r as n}from"./iframe-DR2sIF5r.js";import{n as r,t as i}from"./BAISelector-CCsMJmyB.js";import{n as a,t as o}from"./BAITextInput-CqmhWReo.js";import{useState as s}from"react";import{jsx as c,jsxs as l}from"react/jsx-runtime";import{c as u}from"react/compiler-runtime";import{Button as d}from"@lablup/ui-common/Button";import{HStack as f}from"@lablup/ui-common/HStack";var p;function m(){return(m=e((()=>{p=e=>{"use memo";let t=u(12),n,r,i,a;t[0]===e?(n=t[1],r=t[2],i=t[3],a=t[4]):({className:r,width:a,children:n,...i}=e,t[0]=e,t[1]=n,t[2]=r,t[3]=i,t[4]=a);let o=a===void 0?`100%`:a,s=r??``,l;t[5]===s?l=t[6]:(l=[`bai-compact-group`,s].filter(Boolean),t[5]=s,t[6]=l);let d=l.join(` `),p;return t[7]!==n||t[8]!==i||t[9]!==d||t[10]!==o?(p=c(f,{...i,gap:0,wrap:`nowrap`,width:o,className:d,children:n}),t[7]=n,t[8]=i,t[9]=d,t[10]=o,t[11]=p):p=t[11],p},p.displayName=`BAICompactGroup`})))()}var h,g,_,v,y,b,x,S,C,w;function T(){return(T=e((()=>{n(),m(),r(),a(),h={title:`Layout/BAICompactGroup`,component:p,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:`
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
        `}}},argTypes:{width:{control:{type:`text`},description:`Width of the whole run.`,table:{type:{summary:`SizeValue`},defaultValue:{summary:`'100%'`}}},children:{control:!1,description:`The controls to weld together.`},className:{control:!1,description:`Appended after the component’s own class.`}}},g=[{value:`lablup.com`,label:`lablup.com`},{value:`example.org`,label:`example.org`}],_=({status:e})=>{let[t,n]=s(`admin`),[r,i]=s(`lablup.com`);return l(p,{children:[c(o,{"aria-label":`E-Mail Prefix`,value:t,onChange:n,width:`100%`,placeholder:`Max. 30 characters`}),c(o,{"aria-label":`E-Mail Suffix`,value:r,onChange:i,width:`100%`,placeholder:`Max. 30 characters`,status:e})]})},v={name:`Basic`,parameters:{docs:{description:{story:`Two text inputs welded into one control. Click either field: the focused one’s accent border wins the shared edge instead of being painted over by its neighbour.`}}},render:()=>c(_,{})},y={name:`WeldedVsPlainRow`,parameters:{docs:{description:{story:"Top: `BAICompactGroup`. Bottom: the same two fields in a gapless `HStack`, which is what the migration shipped — the borders double up at the joint and both fields keep all four rounded corners."}}},render:()=>l(`div`,{style:{display:`grid`,gap:32},children:[c(_,{}),c(()=>{let[e,t]=s(`admin`),[n,r]=s(`lablup.com`);return l(f,{gap:0,width:`100%`,children:[c(o,{"aria-label":`E-Mail Prefix`,value:e,onChange:t,width:`100%`}),c(o,{"aria-label":`E-Mail Suffix`,value:n,onChange:r,width:`100%`})]})},{})]})},b={name:`ControlPlusAction`,parameters:{docs:{description:{story:"A `Button` is welded only when it is a **direct child** of the group — a button nested inside a field (Astryx’s clear “×”) keeps its own shape."}}},render:()=>c(()=>{let[e,t]=s(``);return l(p,{width:`auto`,children:[c(o,{"aria-label":`Search`,value:e,onChange:t,hasClear:!0,placeholder:`Session name`}),c(d,{label:`Search`,variant:`primary`})]})},{})},x={name:`ThreeMembers`,parameters:{docs:{description:{story:`The middle control loses the radius on both sides; only the run’s outermost corners stay rounded.`}}},render:()=>c(()=>{let[e,t]=s(`admin`),[n,r]=s(``),[a,u]=s(`lablup.com`);return l(p,{children:[c(o,{"aria-label":`Prefix`,value:e,onChange:t,width:`100%`}),c(o,{"aria-label":`Team`,value:n,onChange:r,width:`100%`,placeholder:`optional`}),c(i,{"aria-label":`Domain`,value:a,onChange:u,options:g,width:`100%`,hasClear:!0})]})},{})},S={name:`ErrorState`,parameters:{docs:{description:{story:`One member in an error state. Because the surfaces overlap, hover or focus the erroring field to bring its full outline forward.`}}},render:()=>c(_,{status:`error`})},C={name:`FormIntegration`,parameters:{docs:{description:{story:"Two `Form.Item`s inside one group. The bordered surface is three levels below the group child here, and the weld still reaches it."}}},render:()=>c(t,{layout:`vertical`,initialValues:{email_prefix:`admin`,email_suffix:`lablup.com`},children:l(p,{children:[c(t.Item,{name:`email_prefix`,label:`E-Mail Prefix`,style:{flex:1},rules:[{required:!0}],children:c(o,{"aria-label":`E-Mail Prefix`})}),c(t.Item,{name:`email_suffix`,label:`E-Mail Suffix`,style:{flex:1},rules:[{required:!0}],children:c(o,{"aria-label":`E-Mail Suffix`})})]})})},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'Two text inputs welded into one control. Click either field: the ' + 'focused one’s accent border wins the shared edge instead of being ' + 'painted over by its neighbour.'
      }
    }
  },
  render: () => <EmailPair />
}`,...v.parameters?.docs?.source},description:{story:`The reported call site: an e-mail prefix and suffix that belong to one
address. The two fields share a single border and only the outer corners are
rounded.`,...v.parameters?.docs?.description}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source},description:{story:`Side by side with the un-welded arrangement this replaces.`,...y.parameters?.docs?.description}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source},description:{story:`Heterogeneous run: a control plus a trailing action.`,...b.parameters?.docs?.description}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source},description:{story:`Three members, so the middle one has both inner corners squared.`,...x.parameters?.docs?.description}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  name: 'ErrorState',
  parameters: {
    docs: {
      description: {
        story: 'One member in an error state. Because the surfaces overlap, hover ' + 'or focus the erroring field to bring its full outline forward.'
      }
    }
  },
  render: () => <EmailPair status="error" />
}`,...S.parameters?.docs?.source},description:{story:`A failing rule paints the border red; the weld does not hide it.`,...S.parameters?.docs?.description}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source},description:{story:"The real call-site shape: each member is a `Form.Item` that owns its own\nlabel, rules and error slot — which is exactly why Astryx's `InputGroup`\n(one group-level label, one input) could not be used.",...C.parameters?.docs?.description}}},w=[`Default`,`AgainstAPlainRow`,`WithTrailingButton`,`ThreeMembers`,`Error`,`InsideAForm`]})))()}T();export{y as AgainstAPlainRow,v as Default,S as Error,C as InsideAForm,x as ThreeMembers,b as WithTrailingButton,w as __namedExportsOrder,h as default};