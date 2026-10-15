import{c as k,j as r,b as E}from"./iframe-BK5v0VgM.js";import{T as f}from"./Token-Cjk4UQaZ.js";import{B as N}from"./BAIFlex-D1QUUUOU.js";import"./preload-helper-Dp1pzeXC.js";import"./useInteractiveRole-BY5v84UL.js";import"./composeEventHandlers-BolWE7qY.js";const p=["SINGLE_ENTITY","BULK","SCOPE","RELATION","MEMBERSHIP","GLOBAL","LOOKUP"],O=()=>{"use memo";const n=k.c(2),{t:o}=E();let e;if(n[0]!==o){const t={SINGLE_ENTITY:o("comp:BAIAuditLogActionKindToken.SingleEntity"),BULK:o("comp:BAIAuditLogActionKindToken.Bulk"),SCOPE:o("comp:BAIAuditLogActionKindToken.Scope"),RELATION:o("comp:BAIAuditLogActionKindToken.Relation"),MEMBERSHIP:o("comp:BAIAuditLogActionKindToken.Membership"),GLOBAL:o("comp:BAIAuditLogActionKindToken.Global"),LOOKUP:o("comp:BAIAuditLogActionKindToken.Lookup")};e=p.map(i=>({value:i,label:t[i]})),n[0]=o,n[1]=e}else e=n[1];return e},A=n=>{"use memo";var m;const o=k.c(9);let e,t;o[0]!==n?({actionKind:e,...t}=n,o[0]=n,o[1]=e,o[2]=t):(e=o[1],t=o[2]);const i=O();let s;o[3]!==e||o[4]!==i?(s=((m=i.find(B=>B.value===e))==null?void 0:m.label)??e,o[3]=e,o[4]=i,o[5]=s):s=o[5];const l=s;let a;return o[6]!==l||o[7]!==t?(a=r.jsx(f,{...t,label:l}),o[6]=l,o[7]=t,o[8]=a):a=o[8],a},v={title:"Token/BAIAuditLogActionKindToken",component:A,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:`
**BAIAuditLogActionKindToken** labels the shape of the action that wrote an audit log record.

## Features
- Neutral Token: the kind is a classification, not a state
- Translated label for each of the seven \`AuditLogActionKind\` values
- An unknown value is shown verbatim
- \`useAuditLogActionKindOptions()\` returns the same labels for filters

## Usage
\`\`\`tsx
<BAIAuditLogActionKindToken actionKind="BULK" />
\`\`\`
        `}}},argTypes:{actionKind:{control:{type:"select"},options:p,description:"The `AuditLogActionKind` value to label"}}},c={name:"Basic",args:{actionKind:"SINGLE_ENTITY"}},d={name:"AllKinds",parameters:{docs:{description:{story:"All seven action kinds side by side, plus a value the component does not know."}}},render:()=>r.jsxs(N,{direction:"column",gap:"sm",align:"start",children:[p.map(n=>r.jsx(A,{actionKind:n},n)),r.jsx(A,{actionKind:"FUTURE_KIND"})]})};var u,K,I;c.parameters={...c.parameters,docs:{...(u=c.parameters)==null?void 0:u.docs,source:{originalSource:`{
  name: 'Basic',
  args: {
    actionKind: 'SINGLE_ENTITY'
  }
}`,...(I=(K=c.parameters)==null?void 0:K.docs)==null?void 0:I.source}}};var T,L,g;d.parameters={...d.parameters,docs:{...(T=d.parameters)==null?void 0:T.docs,source:{originalSource:`{
  name: 'AllKinds',
  parameters: {
    docs: {
      description: {
        story: 'All seven action kinds side by side, plus a value the component does not know.'
      }
    }
  },
  render: () => <BAIFlex direction="column" gap="sm" align="start">
      {AUDIT_LOG_ACTION_KINDS.map(kind => <BAIAuditLogActionKindToken key={kind} actionKind={kind} />)}
      <BAIAuditLogActionKindToken actionKind="FUTURE_KIND" />
    </BAIFlex>
}`,...(g=(L=d.parameters)==null?void 0:L.docs)==null?void 0:g.source}}};const y=["Default","AllKinds"];export{d as AllKinds,c as Default,y as __namedExportsOrder,v as default};
