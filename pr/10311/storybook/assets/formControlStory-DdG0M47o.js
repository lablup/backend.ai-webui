import{j as p,c as b,v as f}from"./iframe-BlNxbaCI.js";const v=o=>{"use memo";const e=b.c(14),{label:t,initialValue:i,valuePropName:n,variant:l,children:h}=o,m=l===void 0?"basic":l;let a;e[0]!==i?(a={field:i},e[0]=i,e[1]=a):a=e[1];const u=m==="disabled";let c;e[2]===Symbol.for("react.memo_cache_sentinel")?(c={maxWidth:400},e[2]=c):c=e[2];let s;e[3]!==m?(s=m==="error"?{validateStatus:"error",help:"This value is not valid."}:{},e[3]=m,e[4]=s):s=e[4];let r;e[5]!==h||e[6]!==t||e[7]!==s||e[8]!==n?(r=p.jsx(f.Item,{name:"field",label:t,valuePropName:n,...s,children:h}),e[5]=h,e[6]=t,e[7]=s,e[8]=n,e[9]=r):r=e[9];let d;return e[10]!==a||e[11]!==u||e[12]!==r?(d=p.jsx(f,{layout:"vertical",initialValues:a,disabled:u,style:c,children:r}),e[10]=a,e[11]=u,e[12]=r,e[13]=d):d=e[13],d},y=[{key:"Default",name:"Basic",variant:"basic",story:"Inside a Form.Item: the item supplies value, onChange and the accessible name, and the control fills the item row."},{key:"ErrorState",name:"ErrorState",variant:"error",story:"The Form.Item's validation status reaches the control as its border; the message stays the item's."},{key:"DisabledState",name:"DisabledState",variant:"disabled",story:"`<Form disabled>` disables the control through the Form.Item."}],F=(o,e)=>Object.fromEntries(y.map(({key:t,name:i,variant:n,story:l})=>[t,{name:i,parameters:{docs:{description:{story:l}}},render:()=>p.jsx(v,{...o,variant:n,children:e()})}])),I=(o,e,t)=>`
**${o}** is ui-common's \`${e}\` under its BAI name, re-exported unchanged (ADR 0014): the same component and props.

## Features
- Form.Item-aware: value, onChange, disabled, validation status and the accessible name come from the item
- Fills the Form.Item row by default
- Import from \`backend.ai-ui\`; ESLint blocks \`${e}\` from the ui-common subpath in \`react/\`

## Usage
\`\`\`tsx
${t}
\`\`\`

## Props
ui-common's \`${e}Props\`, unchanged. Run \`ui-common component ${e}\` for the full list.
`;export{I as a,F as f};
