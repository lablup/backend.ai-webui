import{n as e}from"./rolldown-runtime-2s6bX4vc.js";import{n as t,r as n}from"./iframe-DR2sIF5r.js";import{jsx as r}from"react/jsx-runtime";import{c as i}from"react/compiler-runtime";var a,o,s,c;function l(){return(l=e((()=>{n(),a=e=>{"use memo";let n=i(14),{label:a,initialValue:o,valuePropName:s,variant:c,children:l}=e,u=c===void 0?`basic`:c,d;n[0]===o?d=n[1]:(d={field:o},n[0]=o,n[1]=d);let f=u===`disabled`,p;n[2]===Symbol.for(`react.memo_cache_sentinel`)?(p={maxWidth:400},n[2]=p):p=n[2];let m;n[3]===u?m=n[4]:(m=u===`error`?{validateStatus:`error`,help:`This value is not valid.`}:{},n[3]=u,n[4]=m);let h;n[5]!==l||n[6]!==a||n[7]!==m||n[8]!==s?(h=r(t.Item,{name:`field`,label:a,valuePropName:s,...m,children:l}),n[5]=l,n[6]=a,n[7]=m,n[8]=s,n[9]=h):h=n[9];let g;return n[10]!==d||n[11]!==f||n[12]!==h?(g=r(t,{layout:`vertical`,initialValues:d,disabled:f,style:p,children:h}),n[10]=d,n[11]=f,n[12]=h,n[13]=g):g=n[13],g},o=[{key:`Default`,name:`Basic`,variant:`basic`,story:`Inside a Form.Item: the item supplies value, onChange and the accessible name, and the control fills the item row.`},{key:`ErrorState`,name:`ErrorState`,variant:`error`,story:`The Form.Item's validation status reaches the control as its border; the message stays the item's.`},{key:`DisabledState`,name:`DisabledState`,variant:`disabled`,story:"`<Form disabled>` disables the control through the Form.Item."}],s=(e,t)=>Object.fromEntries(o.map(({key:n,name:i,variant:o,story:s})=>[n,{name:i,parameters:{docs:{description:{story:s}}},render:()=>r(a,{...e,variant:o,children:t()})}])),c=(e,t,n)=>`
**${e}** is ui-common's \`${t}\` under its BAI name, re-exported unchanged (ADR 0014): the same component and props.

## Features
- Form.Item-aware: value, onChange, disabled, validation status and the accessible name come from the item
- Fills the Form.Item row by default
- Import from \`backend.ai-ui\`; ESLint blocks \`${t}\` from the ui-common subpath in \`react/\`

## Usage
\`\`\`tsx
${n}
\`\`\`

## Props
ui-common's \`${t}Props\`, unchanged. Run \`ui-common component ${t}\` for the full list.
`})))()}export{s as n,l as r,c as t};