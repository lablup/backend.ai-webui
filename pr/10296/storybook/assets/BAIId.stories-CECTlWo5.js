import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-MKhVqBIO.js";import{h as n,m as r}from"./iframe-DnpvlTFX.js";import{n as i,t as a}from"./BAIFlex-DnaoYTJ1.js";import{c as o,h as s}from"./helper-p-d7z67I.js";var c,l,u;function d(){return(d=e((()=>{o(),n(),c=t(),l=e=>{try{return s(e)??e}catch{return e}},u=({uuid:e,globalId:t,copyable:n=!0,ellipsis:i={tooltip:!0},monospace:a=!0,style:o,...s})=>{let u=e??l(t);return(0,c.jsx)(r,{copyable:n,ellipsis:i,monospace:a,style:{maxWidth:100,...o},...s,children:u})}})))()}var f,p,m,h,g,_,v,y,b,x,S,C,w,T;function E(){return(E=e((()=>{i(),d(),f=t(),y=`5a59ce9b-afa1-4059-9341-683110eb4408`,b=btoa(`UserNode:${y}`),x={title:`Text/BAIId`,component:u,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:"\n**BAIId** is a thin wrapper around `BAIText` for rendering identifiers\n(plain UUIDs or Relay global IDs) in a compact, copyable form.\n\nIt accepts exactly one of two mutually exclusive props:\n\n- `uuid`: a plain UUID string.\n- `globalId`: a base64-encoded Relay global ID; decoded via `toLocalId`.\n\nBy default it renders with:\n- `copyable`\n- `ellipsis` (CSS-based, Safari-compatible)\n- `monospace`\n- `style={{ maxWidth: 100 }}`\n\nAll defaults are overridable via props; all other `BAIText` props pass through.\n"}}},argTypes:{uuid:{control:{type:`text`},description:"Plain UUID string. Mutually exclusive with `globalId`.",table:{type:{summary:`string`}}},globalId:{control:{type:`text`},description:"Relay global ID (base64). Decoded to the local id via `toLocalId`. Mutually exclusive with `uuid`.",table:{type:{summary:`string`}}}}},S={name:`Basic`,args:{uuid:y},parameters:{docs:{description:{story:"Renders a plain UUID in a compact, copyable form. The displayed text may be truncated with ellipsis depending on the available width and `style.maxWidth`; the copy icon copies the full id."}}}},C={name:`Global ID`,args:{globalId:b},parameters:{docs:{description:{story:"Renders a Relay global ID after decoding the base64 payload and extracting the local id with `toLocalId`. The copy icon copies the decoded local id."}}}},w={name:`Override defaults`,render:()=>(0,f.jsxs)(a,{direction:`column`,gap:`sm`,children:[(0,f.jsx)(u,{uuid:y,copyable:!1}),(0,f.jsx)(u,{uuid:y,monospace:!1}),(0,f.jsx)(u,{uuid:y,style:{maxWidth:200}}),(0,f.jsx)(u,{uuid:y,ellipsis:!1,style:{maxWidth:`none`}})]}),parameters:{docs:{description:{story:"All defaults (`copyable`, `ellipsis`, `monospace`, `style.maxWidth`) can be overridden. Other `BAIText` props pass through."}}}},S.parameters={...S.parameters,docs:{...(p=S.parameters)==null?void 0:p.docs,source:{originalSource:`{
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
}`,...(m=S.parameters)==null||(m=m.docs)==null?void 0:m.source}}},C.parameters={...C.parameters,docs:{...(h=C.parameters)==null?void 0:h.docs,source:{originalSource:`{
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
}`,...(g=C.parameters)==null||(g=g.docs)==null?void 0:g.source}}},w.parameters={...w.parameters,docs:{...(_=w.parameters)==null?void 0:_.docs,source:{originalSource:`{
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
}`,...(v=w.parameters)==null||(v=v.docs)==null?void 0:v.source}}},T=[`Default`,`WithGlobalId`,`OverrideDefaults`]})))()}E();export{S as Default,w as OverrideDefaults,C as WithGlobalId,T as __namedExportsOrder,x as default};