import{j as e,aJ as a,az as I}from"./iframe-BWlzmNa6.js";import{B as r}from"./BAIFlex-B_FQZrg1.js";import"./preload-helper-Dp1pzeXC.js";const R=3,f=[140,180,100],S="var(--size-element-sm)",b=5,c=10,A=40,T=12,d=[["45%","25%"],["30%","40%"],["55%","20%"]],k="var(--size-element-sm)",B=({rows:h=R,className:x,..._})=>{"use memo";let t=0;return e.jsxs(r,{direction:"column",align:"stretch",gap:"sm",className:I("bai-resource-unit-grid-skeleton",x),..._,children:[e.jsx(r,{gap:"sm",align:"center",children:f.map((i,s)=>e.jsx(a,{width:i,height:S,radius:2,index:t++},s))}),e.jsx(r,{gap:"sm",wrap:"wrap",align:"center",children:Array.from({length:b},(i,s)=>e.jsxs(r,{gap:4,align:"center",children:[e.jsx(a,{width:c,height:c,radius:1,index:t++}),e.jsx(a,{width:A,height:T,radius:1,index:t++})]},s))}),Array.from({length:Math.max(0,h)},(i,s)=>{const E=d[s%d.length];return e.jsx(r,{gap:"sm",align:"center",className:"bai-resource-unit-grid-skeleton-row",children:E.map((L,y)=>e.jsx(a,{width:L,height:k,radius:1,index:t++},y))},s)})]})},j={title:"Data Display/BAIResourceUnitGridSkeleton",component:B,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:`
**BAIResourceUnitGridSkeleton** is the Suspense fallback for
[BAIResourceUnitGrid](?path=/docs/data-display-bairesourceunitgrid--docs): a
toolbar row, a legend row, and a deliberately low-fidelity lattice stand-in
(two blocks per row) — per-session plates and cells would read as false
detail while loading.

\`\`\`tsx
<Suspense fallback={<BAIResourceUnitGridSkeleton />}>
  <SessionResourceGrid ... />
</Suspense>
\`\`\`
        `}}},argTypes:{rows:{control:{type:"number",min:0},description:"Lattice stand-in rows (two blocks each).",table:{type:{summary:"number"},defaultValue:{summary:"3"}}}}},o={args:{}},n={args:{rows:5},parameters:{docs:{description:{story:"Row block widths cycle a fixed 3-row pattern, so extra rows repeat it."}}}};var l,p,m;o.parameters={...o.parameters,docs:{...(l=o.parameters)==null?void 0:l.docs,source:{originalSource:`{
  args: {}
}`,...(m=(p=o.parameters)==null?void 0:p.docs)==null?void 0:m.source}}};var u,g,w;n.parameters={...n.parameters,docs:{...(u=n.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    rows: 5
  },
  parameters: {
    docs: {
      description: {
        story: 'Row block widths cycle a fixed 3-row pattern, so extra rows repeat it.'
      }
    }
  }
}`,...(w=(g=n.parameters)==null?void 0:g.docs)==null?void 0:w.source}}};const H=["Default","MoreRows"];export{o as Default,n as MoreRows,H as __namedExportsOrder,j as default};
