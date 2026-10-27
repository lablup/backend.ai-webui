import{n as e}from"./rolldown-runtime-2s6bX4vc.js";import{c as t,s as n}from"./iframe-DR2sIF5r.js";import{n as r,t as i}from"./BAIFlex-CAz1t6J5.js";import{c as a,h as o}from"./helper-DV0q0X9R.js";import{jsx as s,jsxs as c}from"react/jsx-runtime";var l,u;function d(){return(d=e((()=>{a(),t(),l=e=>{try{return o(e)??e}catch{return e}},u=({uuid:e,globalId:t,copyable:r=!0,ellipsis:i={tooltip:!0},monospace:a=!0,style:o,...c})=>{let u=e??l(t);return s(n,{copyable:r,ellipsis:i,monospace:a,style:{maxWidth:100,...o},...c,children:u})}})))()}var f,p,m,h,g,_,v;function y(){return(y=e((()=>{r(),d(),f=`5a59ce9b-afa1-4059-9341-683110eb4408`,p=btoa(`UserNode:${f}`),m={title:`Text/BAIId`,component:u,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:"\n**BAIId** is a thin wrapper around `BAIText` for rendering identifiers\n(plain UUIDs or Relay global IDs) in a compact, copyable form.\n\nIt accepts exactly one of two mutually exclusive props:\n\n- `uuid`: a plain UUID string.\n- `globalId`: a base64-encoded Relay global ID; decoded via `toLocalId`.\n\nBy default it renders with:\n- `copyable`\n- `ellipsis` (CSS-based, Safari-compatible)\n- `monospace`\n- `style={{ maxWidth: 100 }}`\n\nAll defaults are overridable via props; all other `BAIText` props pass through.\n"}}},argTypes:{uuid:{control:{type:`text`},description:"Plain UUID string. Mutually exclusive with `globalId`.",table:{type:{summary:`string`}}},globalId:{control:{type:`text`},description:"Relay global ID (base64). Decoded to the local id via `toLocalId`. Mutually exclusive with `uuid`.",table:{type:{summary:`string`}}}}},h={name:`Basic`,args:{uuid:f},parameters:{docs:{description:{story:"Renders a plain UUID in a compact, copyable form. The displayed text may be truncated with ellipsis depending on the available width and `style.maxWidth`; the copy icon copies the full id."}}}},g={name:`Global ID`,args:{globalId:p},parameters:{docs:{description:{story:"Renders a Relay global ID after decoding the base64 payload and extracting the local id with `toLocalId`. The copy icon copies the decoded local id."}}}},_={name:`Override defaults`,render:()=>c(i,{direction:`column`,gap:`sm`,children:[s(u,{uuid:f,copyable:!1}),s(u,{uuid:f,monospace:!1}),s(u,{uuid:f,style:{maxWidth:200}}),s(u,{uuid:f,ellipsis:!1,style:{maxWidth:`none`}})]}),parameters:{docs:{description:{story:"All defaults (`copyable`, `ellipsis`, `monospace`, `style.maxWidth`) can be overridden. Other `BAIText` props pass through."}}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source}}},v=[`Default`,`WithGlobalId`,`OverrideDefaults`]})))()}y();export{h as Default,_ as OverrideDefaults,g as WithGlobalId,v as __namedExportsOrder,m as default};