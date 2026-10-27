import{n as e}from"./rolldown-runtime-2s6bX4vc.js";import{n as t,t as n}from"./BAITabList-CVSGQHGZ.js";import{useState as r}from"react";import{jsx as i,jsxs as a}from"react/jsx-runtime";import{Tab as o}from"@lablup/ui-common/TabList";var s,c,l,u,d,f,p,m,h;function g(){return(g=e((()=>{t(),s={title:`Navigation/BAITabList`,component:n,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:"\n**BAITabList** wraps Astryx's `TabList` and restores the two tab *looks* the\napp has always had, so both can be used side by side:\n\n- `type=\"line\"` (default) — Astryx's underlined strip.\n- `type=\"card\"` — boxed, gutter-separated tabs sitting on an accent rail\n  (antd `Tabs type=\"card\"`, which the legacy `BAITabs` wrapper hard-coded).\n\nIt also fixes two composition mistakes that are easy to make by hand:\n\n1. The `<nav>` is block-level, so the `hasDivider` rail spans the **whole tab\n   bar** rather than stopping at the last tab. Astryx's strip has no `width`,\n   so putting it inside a flex row makes it hug its tabs.\n2. `tabBarExtraContent` renders **inside** the nav, pushed over with\n   `margin-inline-start: auto` — Astryx's own `TabListTabsWithActions`\n   idiom — so the rail still runs underneath it.\n\n## Props\n\n| Name | Type | Default | Description |\n|------|------|---------|-------------|\n| type | `'line' \\| 'card'` | `'line'` | Tab appearance |\n| hasDivider | `boolean` | `true` | Draw the rail under the strip |\n| size | `'sm' \\| 'md' \\| 'lg'` | `'md'` (`'lg'` for `card`) | Tab height step |\n| tabBarExtraContent | `ReactNode` | - | Trailing slot on the tab bar |\n        "}}},argTypes:{type:{control:{type:`inline-radio`},options:[`line`,`card`],table:{defaultValue:{summary:`line`}}},size:{control:{type:`inline-radio`},options:[`sm`,`md`,`lg`]},hasDivider:{control:{type:`boolean`}}}},c=[{value:`running`,label:`Running`},{value:`finished`,label:`Finished`},{value:`others`,label:`Others`}],l=({initial:e=`running`,...t})=>{let[a,s]=r(e);return i(n,{value:a,onChange:s,...t,children:c.map(e=>i(o,{value:e.value,label:e.label},e.value))})},u={render:()=>i(l,{type:`line`})},d={render:()=>i(l,{type:`card`})},f={render:()=>a(`div`,{style:{display:`grid`,gap:32},children:[i(l,{type:`line`}),i(l,{type:`card`,initial:`finished`})]})},p={render:()=>i(l,{type:`card`,tabBarExtraContent:i(`a`,{href:`#extra`,children:`Pending invitations (2)`})})},m={render:()=>a(`div`,{style:{display:`grid`,gap:32},children:[i(l,{type:`card`,size:`sm`}),i(l,{type:`card`,size:`md`}),i(l,{type:`card`,size:`lg`})]})},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => <Controlled type="line" />
}`,...u.parameters?.docs?.source},description:{story:`The default underlined strip. Note the rail runs the full width.`,...u.parameters?.docs?.description}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <Controlled type="card" />
}`,...d.parameters?.docs?.source},description:{story:'The restored antd `type="card"` look: boxed tabs on an accent rail.',...d.parameters?.docs?.description}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'grid',
    gap: 32
  }}>
      <Controlled type="line" />
      <Controlled type="card" initial="finished" />
    </div>
}`,...f.parameters?.docs?.source},description:{story:"Both styles coexist — `FolderExplorerModalV2` picks between them on a\nbreakpoint, so neither may be a global theme default.",...f.parameters?.docs?.description}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <Controlled type="card" tabBarExtraContent={<a href="#extra">Pending invitations (2)</a>} />
}`,...p.parameters?.docs?.source},description:{story:"`tabBarExtraContent` sits at the trailing edge of the bar, and the rail\nstill spans underneath it.",...p.parameters?.docs?.description}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'grid',
    gap: 32
  }}>
      <Controlled type="card" size="sm" />
      <Controlled type="card" size="md" />
      <Controlled type="card" size="lg" />
    </div>
}`,...m.parameters?.docs?.source},description:{story:`Every size step, card style.`,...m.parameters?.docs?.description}}},h=[`Line`,`Card`,`SideBySide`,`WithTabBarExtraContent`,`Sizes`]})))()}g();export{d as Card,u as Line,f as SideBySide,m as Sizes,p as WithTabBarExtraContent,h as __namedExportsOrder,s as default};