import{j as e,aL as a,aX as t}from"./iframe-h9q6Uabc.js";import{V as j}from"./VStack-BcqjdIO-.js";import"./preload-helper-Dp1pzeXC.js";var R=3,A=[140,180,100],G="var(--size-element-sm)",B=5,c=10,U=40,I=12,l=[["45%","25%"],["30%","40%"],["55%","20%"]],_="var(--size-element-sm)";function h({rows:x=R,className:f,...y}){let s=0;return e.jsxs(j,{gap:3,align:"stretch",className:["uic-unit-grid-skeleton",f].filter(Boolean).join(" "),...y,children:[e.jsx(a,{gap:3,align:"center",children:A.map((i,r)=>e.jsx(t,{width:i,height:G,radius:2,index:s++},r))}),e.jsx(a,{gap:3,wrap:"wrap",align:"center",children:Array.from({length:B},(i,r)=>e.jsxs(a,{gap:1,align:"center",children:[e.jsx(t,{width:c,height:c,radius:1,index:s++}),e.jsx(t,{width:U,height:I,radius:1,index:s++})]},r))}),Array.from({length:Math.max(0,x)},(i,r)=>{let k=l[r%l.length];return e.jsx(a,{gap:3,align:"center",className:"uic-unit-grid-skeleton__row",children:k.map((S,b)=>e.jsx(t,{width:S,height:_,radius:1,index:s++},b))},r)})]})}h.displayName="UnitGridSkeleton";/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 ui-common `UnitGridSkeleton` under its BUI name (FR-3569): the Suspense
 fallback for `BAIResourceUnitGrid`.
*/const D=h,V={title:"Data Display/BAIResourceUnitGridSkeleton",component:D,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:`
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
        `}}},argTypes:{rows:{control:{type:"number",min:0},description:"Lattice stand-in rows (two blocks each).",table:{type:{summary:"number"},defaultValue:{summary:"3"}}}}},o={args:{}},n={args:{rows:5},parameters:{docs:{description:{story:"Row block widths cycle a fixed 3-row pattern, so extra rows repeat it."}}}};var d,p,m;o.parameters={...o.parameters,docs:{...(d=o.parameters)==null?void 0:d.docs,source:{originalSource:`{
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
}`,...(w=(g=n.parameters)==null?void 0:g.docs)==null?void 0:w.source}}};const z=["Default","MoreRows"];export{o as Default,n as MoreRows,z as __namedExportsOrder,V as default};
