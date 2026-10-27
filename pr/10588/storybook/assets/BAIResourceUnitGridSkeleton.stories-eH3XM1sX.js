import{n as e}from"./rolldown-runtime-2s6bX4vc.js";import{UnitGridSkeleton as t}from"@lablup/ui-common/components/UnitGrid";var n;function r(){return(r=e((()=>{n=t})))()}var i,a,o,s;function c(){return(c=e((()=>{r(),i={title:`Data Display/BAIResourceUnitGridSkeleton`,component:n,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:`
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
        `}}},argTypes:{rows:{control:{type:`number`,min:0},description:`Lattice stand-in rows (two blocks each).`,table:{type:{summary:`number`},defaultValue:{summary:`3`}}}}},a={args:{}},o={args:{rows:5},parameters:{docs:{description:{story:`Row block widths cycle a fixed 3-row pattern, so extra rows repeat it.`}}}},a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {}
}`,...a.parameters?.docs?.source}}},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
}`,...o.parameters?.docs?.source}}},s=[`Default`,`MoreRows`]})))()}c();export{a as Default,o as MoreRows,s as __namedExportsOrder,i as default};