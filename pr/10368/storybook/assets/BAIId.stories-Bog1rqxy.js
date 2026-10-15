import{j as a}from"./iframe-DzFwpjrI.js";import{B as y}from"./BAIFlex-C2yYvjS7.js";import{B as o}from"./BAIId-BI6HkWd8.js";import"./preload-helper-Dp1pzeXC.js";import"./index-f_Al-cbj.js";import"./isNumber-B6e_NBDf.js";import"./toString-cMbbxoen.js";import"./isSymbol-BzpiNavT.js";import"./filter-CZUTmwyw.js";import"./_baseEach-D6H9FpG3.js";import"./get-BLw0rMj3.js";import"./_baseGet-eCv9L5ck.js";import"./identity-DKeuBCMA.js";import"./isEmpty-eaBhu0Bz.js";const e="5a59ce9b-afa1-4059-9341-683110eb4408",h=btoa(`UserNode:${e}`),E={title:"Text/BAIId",component:o,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:"\n**BAIId** is a thin wrapper around `BAIText` for rendering identifiers\n(plain UUIDs or Relay global IDs) in a compact, copyable form.\n\nIt accepts exactly one of two mutually exclusive props:\n\n- `uuid`: a plain UUID string.\n- `globalId`: a base64-encoded Relay global ID; decoded via `toLocalId`.\n\nBy default it renders with:\n- `copyable`\n- `ellipsis` (CSS-based, Safari-compatible)\n- `monospace`\n- `style={{ maxWidth: 100 }}`\n\nAll defaults are overridable via props; all other `BAIText` props pass through.\n"}}},argTypes:{uuid:{control:{type:"text"},description:"Plain UUID string. Mutually exclusive with `globalId`.",table:{type:{summary:"string"}}},globalId:{control:{type:"text"},description:"Relay global ID (base64). Decoded to the local id via `toLocalId`. Mutually exclusive with `uuid`.",table:{type:{summary:"string"}}}}},t={name:"Basic",args:{uuid:e},parameters:{docs:{description:{story:"Renders a plain UUID in a compact, copyable form. The displayed text may be truncated with ellipsis depending on the available width and `style.maxWidth`; the copy icon copies the full id."}}}},s={name:"Global ID",args:{globalId:h},parameters:{docs:{description:{story:"Renders a Relay global ID after decoding the base64 payload and extracting the local id with `toLocalId`. The copy icon copies the decoded local id."}}}},r={name:"Override defaults",render:()=>a.jsxs(y,{direction:"column",gap:"sm",children:[a.jsx(o,{uuid:e,copyable:!1}),a.jsx(o,{uuid:e,monospace:!1}),a.jsx(o,{uuid:e,style:{maxWidth:200}}),a.jsx(o,{uuid:e,ellipsis:!1,style:{maxWidth:"none"}})]}),parameters:{docs:{description:{story:"All defaults (`copyable`, `ellipsis`, `monospace`, `style.maxWidth`) can be overridden. Other `BAIText` props pass through."}}}};var i,l,d;t.parameters={...t.parameters,docs:{...(i=t.parameters)==null?void 0:i.docs,source:{originalSource:`{
  name: 'Basic',
  args: {
    uuid: SAMPLE_UUID
  },
  parameters: {
    docs: {
      description: {
        story: 'Renders a plain UUID in a compact, copyable form. The displayed text may be truncated with ellipsis depending on the available width and \`style.maxWidth\`; the copy icon copies the full id.'
      }
    }
  }
}`,...(d=(l=t.parameters)==null?void 0:l.docs)==null?void 0:d.source}}};var n,c,p;s.parameters={...s.parameters,docs:{...(n=s.parameters)==null?void 0:n.docs,source:{originalSource:`{
  name: 'Global ID',
  args: {
    globalId: SAMPLE_GLOBAL_ID
  },
  parameters: {
    docs: {
      description: {
        story: 'Renders a Relay global ID after decoding the base64 payload and extracting the local id with \`toLocalId\`. The copy icon copies the decoded local id.'
      }
    }
  }
}`,...(p=(c=s.parameters)==null?void 0:c.docs)==null?void 0:p.source}}};var m,u,I;r.parameters={...r.parameters,docs:{...(m=r.parameters)==null?void 0:m.docs,source:{originalSource:`{
  name: 'Override defaults',
  render: () => <BAIFlex direction="column" gap="sm">
      <BAIId uuid={SAMPLE_UUID} copyable={false} />
      <BAIId uuid={SAMPLE_UUID} monospace={false} />
      <BAIId uuid={SAMPLE_UUID} style={{
      maxWidth: 200
    }} />
      <BAIId uuid={SAMPLE_UUID} ellipsis={false} style={{
      maxWidth: 'none'
    }} />
    </BAIFlex>,
  parameters: {
    docs: {
      description: {
        story: 'All defaults (\`copyable\`, \`ellipsis\`, \`monospace\`, \`style.maxWidth\`) can be overridden. Other \`BAIText\` props pass through.'
      }
    }
  }
}`,...(I=(u=r.parameters)==null?void 0:u.docs)==null?void 0:I.source}}};const M=["Default","WithGlobalId","OverrideDefaults"];export{t as Default,r as OverrideDefaults,s as WithGlobalId,M as __namedExportsOrder,E as default};
