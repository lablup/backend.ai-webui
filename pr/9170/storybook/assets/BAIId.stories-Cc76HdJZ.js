import{j as e,B as U}from"./iframe-X64pm6CJ.js";import{B}from"./BAIFlex-BRvSMUql.js";import{t as L}from"./index-CSwguSBp.js";import"./preload-helper-Dp1pzeXC.js";import"./isNumber-HuKRX0Ah.js";import"./toString-CgCQQuDs.js";import"./isSymbol-y4vCZZra.js";import"./filter-CYQnB3ep.js";import"./_baseEach-BNcsHboy.js";import"./get-BgU9hr25.js";import"./_baseGet-CgIWsp3Y.js";import"./identity-DKeuBCMA.js";import"./isEmpty-DVC2sWvC.js";const v=t=>{try{return L(t)??t}catch{return t}},o=({uuid:t,globalId:h,copyable:b=!0,ellipsis:x={tooltip:!0},monospace:f=!0,style:g,...A})=>{const D=t??v(h);return e.jsx(U,{copyable:b,ellipsis:x,monospace:f,style:{maxWidth:100,...g},...A,children:D})},a="5a59ce9b-afa1-4059-9341-683110eb4408",S=btoa(`UserNode:${a}`),N={title:"Text/BAIId",component:o,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:"\n**BAIId** is a thin wrapper around `BAIText` for rendering identifiers\n(plain UUIDs or Relay global IDs) in a compact, copyable form.\n\nIt accepts exactly one of two mutually exclusive props:\n\n- `uuid`: a plain UUID string.\n- `globalId`: a base64-encoded Relay global ID; decoded via `toLocalId`.\n\nBy default it renders with:\n- `copyable`\n- `ellipsis` (CSS-based, Safari-compatible)\n- `monospace`\n- `style={{ maxWidth: 100 }}`\n\nAll defaults are overridable via props; all other `BAIText` props pass through.\n"}}},argTypes:{uuid:{control:{type:"text"},description:"Plain UUID string. Mutually exclusive with `globalId`.",table:{type:{summary:"string"}}},globalId:{control:{type:"text"},description:"Relay global ID (base64). Decoded to the local id via `toLocalId`. Mutually exclusive with `uuid`.",table:{type:{summary:"string"}}}}},s={name:"Basic",args:{uuid:a},parameters:{docs:{description:{story:"Renders a plain UUID in a compact, copyable form. The displayed text may be truncated with ellipsis depending on the available width and `style.maxWidth`; the copy icon copies the full id."}}}},r={name:"Global ID",args:{globalId:S},parameters:{docs:{description:{story:"Renders a Relay global ID after decoding the base64 payload and extracting the local id with `toLocalId`. The copy icon copies the decoded local id."}}}},i={name:"Override defaults",render:()=>e.jsxs(B,{direction:"column",gap:"sm",children:[e.jsx(o,{uuid:a,copyable:!1}),e.jsx(o,{uuid:a,monospace:!1}),e.jsx(o,{uuid:a,style:{maxWidth:200}}),e.jsx(o,{uuid:a,ellipsis:!1,style:{maxWidth:"none"}})]}),parameters:{docs:{description:{story:"All defaults (`copyable`, `ellipsis`, `monospace`, `style.maxWidth`) can be overridden. Other `BAIText` props pass through."}}}};var l,d,n;s.parameters={...s.parameters,docs:{...(l=s.parameters)==null?void 0:l.docs,source:{originalSource:`{
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
}`,...(n=(d=s.parameters)==null?void 0:d.docs)==null?void 0:n.source}}};var c,p,m;r.parameters={...r.parameters,docs:{...(c=r.parameters)==null?void 0:c.docs,source:{originalSource:`{
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
}`,...(m=(p=r.parameters)==null?void 0:p.docs)==null?void 0:m.source}}};var u,I,y;i.parameters={...i.parameters,docs:{...(u=i.parameters)==null?void 0:u.docs,source:{originalSource:`{
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
}`,...(y=(I=i.parameters)==null?void 0:I.docs)==null?void 0:y.source}}};const $=["Default","WithGlobalId","OverrideDefaults"];export{s as Default,i as OverrideDefaults,r as WithGlobalId,$ as __namedExportsOrder,N as default};
