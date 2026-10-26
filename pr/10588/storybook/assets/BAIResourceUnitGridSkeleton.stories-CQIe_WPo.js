import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-MKhVqBIO.js";import{n,t as r}from"./HStack-DXC_f-65.js";import{n as i,t as a}from"./VStack-CHQlkVMo.js";import{n as o,t as s}from"./Skeleton-BN8uk9lw.js";function c({rows:e=u,className:t,...n}){let i=0;return(0,l.jsxs)(a,{gap:3,align:`stretch`,className:[`uic-unit-grid-skeleton`,t].filter(Boolean).join(` `),...n,children:[(0,l.jsx)(r,{gap:3,align:`center`,children:d.map((e,t)=>(0,l.jsx)(s,{width:e,height:f,radius:2,index:i++},t))}),(0,l.jsx)(r,{gap:3,wrap:`wrap`,align:`center`,children:Array.from({length:p},(e,t)=>(0,l.jsxs)(r,{gap:1,align:`center`,children:[(0,l.jsx)(s,{width:m,height:m,radius:1,index:i++}),(0,l.jsx)(s,{width:h,height:g,radius:1,index:i++})]},t))}),Array.from({length:Math.max(0,e)},(e,t)=>{let n=_[t%_.length];return(0,l.jsx)(r,{gap:3,align:`center`,className:`uic-unit-grid-skeleton__row`,children:n.map((e,t)=>(0,l.jsx)(s,{width:e,height:v,radius:1,index:i++},t))},t)})]})}var l,u,d,f,p,m,h,g,_,v;function y(){return(y=e((()=>{n(),i(),o(),l=t(),u=3,d=[140,180,100],f=`var(--size-element-sm)`,p=5,m=10,h=40,g=12,_=[[`45%`,`25%`],[`30%`,`40%`],[`55%`,`20%`]],v=`var(--size-element-sm)`,c.displayName=`UnitGridSkeleton`})))()}var b;function x(){return(x=e((()=>{y(),b=c})))()}var S,C,w,T;function E(){return(E=e((()=>{x(),S={title:`Data Display/BAIResourceUnitGridSkeleton`,component:b,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:`
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
        `}}},argTypes:{rows:{control:{type:`number`,min:0},description:`Lattice stand-in rows (two blocks each).`,table:{type:{summary:`number`},defaultValue:{summary:`3`}}}}},C={args:{}},w={args:{rows:5},parameters:{docs:{description:{story:`Row block widths cycle a fixed 3-row pattern, so extra rows repeat it.`}}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {}
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
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
}`,...w.parameters?.docs?.source}}},T=[`Default`,`MoreRows`]})))()}E();export{C as Default,w as MoreRows,T as __namedExportsOrder,S as default};