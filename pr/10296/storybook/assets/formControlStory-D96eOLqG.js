import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-MKhVqBIO.js";import{t as n}from"./compiler-runtime-DU4U6aph.js";import{n as r,t as i}from"./Form-ctOqqK1W.js";var a,o,s,c,l,u;function d(){return(d=e((()=>{a=n(),i(),o=t(),s=e=>{"use memo";let t=(0,a.c)(14),{label:n,initialValue:i,valuePropName:s,variant:c,children:l}=e,u=c===void 0?`basic`:c,d;t[0]===i?d=t[1]:(d={field:i},t[0]=i,t[1]=d);let f=u===`disabled`,p;t[2]===Symbol.for(`react.memo_cache_sentinel`)?(p={maxWidth:400},t[2]=p):p=t[2];let m;t[3]===u?m=t[4]:(m=u===`error`?{validateStatus:`error`,help:`This value is not valid.`}:{},t[3]=u,t[4]=m);let h;t[5]!==l||t[6]!==n||t[7]!==m||t[8]!==s?(h=(0,o.jsx)(r.Item,{name:`field`,label:n,valuePropName:s,...m,children:l}),t[5]=l,t[6]=n,t[7]=m,t[8]=s,t[9]=h):h=t[9];let g;return t[10]!==d||t[11]!==f||t[12]!==h?(g=(0,o.jsx)(r,{layout:`vertical`,initialValues:d,disabled:f,style:p,children:h}),t[10]=d,t[11]=f,t[12]=h,t[13]=g):g=t[13],g},c=[{key:`Default`,name:`Basic`,variant:`basic`,story:`Inside a Form.Item: the item supplies value, onChange and the accessible name, and the control fills the item row.`},{key:`ErrorState`,name:`ErrorState`,variant:`error`,story:`The Form.Item's validation status reaches the control as its border; the message stays the item's.`},{key:`DisabledState`,name:`DisabledState`,variant:`disabled`,story:"`<Form disabled>` disables the control through the Form.Item."}],l=(e,t)=>Object.fromEntries(c.map(({key:n,name:r,variant:i,story:a})=>[n,{name:r,parameters:{docs:{description:{story:a}}},render:()=>(0,o.jsx)(s,{...e,variant:i,children:t()})}])),u=(e,t,n)=>`
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
`})))()}export{l as n,d as r,u as t};