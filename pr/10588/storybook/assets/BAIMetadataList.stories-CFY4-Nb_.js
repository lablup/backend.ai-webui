import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-MKhVqBIO.js";import{n,t as r}from"./BAIBadge-4kSv2DEQ.js";import{i,n as a,r as o,t as s}from"./BAIMetadataList-C8eh3An7.js";var c,l,u,d,f,p,m,h,g,_;function v(){return(v=e((()=>{n(),a(),i(),c=t(),l={title:`Data Display/BAIMetadataList`,component:s,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:"\n**BAIMetadataList** wraps Astryx's `MetadataList` and adds an opt-in\n`bordered` prop: an outer frame plus a 1px rule between every item.\n\n`bordered` preserves the list's own layout — it does not force side labels,\nshade the label column, or reflow the grid. It adds only the frame and the\ninter-item separators, on whatever `columns`/`label` layout the list already\nhas (a multi-column list keeps its stacked labels).\n\nIndependently of `bordered`, the wrapper lightens the item label so it reads\nquieter than its value — the base class is always applied, so this is the\ndefault for every list, `bordered` or not. The tone is the lightest mix off\n`--color-text-secondary` that still clears WCAG AA in both themes; override\n`--bai-metadata-list-label-color` to retune it. Side labels are also\ntop-aligned with their value's first line, so a multi-line value doesn't\nleave the label floating mid-row (FR-3667).\n\nThe paint lives in `BAIMetadataList.css`, entirely in design tokens.\n\n## Props\n\n| Name | Type | Default | Description |\n|------|------|---------|-------------|\n| bordered | `boolean` | `false` | Outer frame + a 1px rule between items; keeps the list's own label layout |\n| size | `'default' \\| 'middle' \\| 'small'` | `'default'` | Bordered cell padding (16/24, 12/24, 8/16px). No effect without `bordered` |\n\nEverything else is `MetadataList`'s own surface (`columns`, `label`,\n`title`, `orientation`, `maxNumOfItems`).\n        "}}},argTypes:{bordered:{control:{type:`boolean`}},size:{control:{type:`inline-radio`},options:[`default`,`middle`,`small`],table:{defaultValue:{summary:`default`}}},columns:{control:{type:`inline-radio`},options:[`single`,`multi`]}}},u=(0,c.jsxs)(c.Fragment,{children:[(0,c.jsx)(o,{label:`Name`,children:`default-policy`}),(0,c.jsx)(o,{label:`Max VFolder Count`,children:`10`}),(0,c.jsx)(o,{label:`Max Session Count Per Model Session`,children:`1`}),(0,c.jsx)(o,{label:`Status`,children:(0,c.jsx)(r,{color:`success`,text:`Active`})})]}),d={render:()=>(0,c.jsx)(s,{children:u})},f={render:()=>(0,c.jsx)(s,{bordered:!0,children:u})},p={render:()=>(0,c.jsxs)(`div`,{style:{display:`grid`,gap:32},children:[(0,c.jsx)(s,{title:`Plain`,children:u}),(0,c.jsx)(s,{title:`Bordered`,bordered:!0,children:u})]})},m={render:()=>(0,c.jsxs)(`div`,{style:{display:`grid`,gap:32},children:[(0,c.jsx)(s,{bordered:!0,size:`default`,title:`default — 16px / 24px`,children:u}),(0,c.jsx)(s,{bordered:!0,size:`middle`,title:`middle — 12px / 24px`,children:u}),(0,c.jsx)(s,{bordered:!0,size:`small`,title:`small — 8px / 16px`,children:u})]})},h={render:()=>(0,c.jsxs)(s,{bordered:!0,columns:2,children:[u,(0,c.jsx)(o,{label:`Created At`,children:`2026-08-09 11:24`}),(0,c.jsx)(o,{label:`Total Resource Slots`,children:`cpu: 4, mem: 8g`})]})},g={render:()=>(0,c.jsxs)(s,{bordered:!0,children:[(0,c.jsx)(o,{label:`Allowed VFolder Hosts`,children:`local:volume1, local:volume2, cephfs:shared, cephfs:scratch, nfs:archive, nfs:home, s3:models, s3:datasets`}),(0,c.jsx)(o,{label:`Full Image Path`,children:`cr.backend.ai/multiarch/python-ff:24.03-py310-cuda12.2-ubuntu22.04`}),(0,c.jsx)(o,{label:`Status`,children:(0,c.jsx)(r,{color:`success`,text:`Active`})})]})},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <BAIMetadataList>{POLICY_ITEMS}</BAIMetadataList>
}`,...d.parameters?.docs?.source},description:{story:`Astryx's own list, untouched — this is what every converted surface shows today.`,...d.parameters?.docs?.description}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => <BAIMetadataList bordered>{POLICY_ITEMS}</BAIMetadataList>
}`,...f.parameters?.docs?.source},description:{story:`The bordered look — outer frame + a 1px rule between items.`,...f.parameters?.docs?.description}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'grid',
    gap: 32
  }}>
      <BAIMetadataList title="Plain">{POLICY_ITEMS}</BAIMetadataList>
      <BAIMetadataList title="Bordered" bordered>
        {POLICY_ITEMS}
      </BAIMetadataList>
    </div>
}`,...p.parameters?.docs?.source},description:{story:"Side by side. `bordered` is opt-in precisely so both can be used — adopting\nit is a per-surface choice, not a global restyle.",...p.parameters?.docs?.description}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'grid',
    gap: 32
  }}>
      <BAIMetadataList bordered size="default" title="default — 16px / 24px">
        {POLICY_ITEMS}
      </BAIMetadataList>
      <BAIMetadataList bordered size="middle" title="middle — 12px / 24px">
        {POLICY_ITEMS}
      </BAIMetadataList>
      <BAIMetadataList bordered size="small" title="small — 8px / 16px">
        {POLICY_ITEMS}
      </BAIMetadataList>
    </div>
}`,...m.parameters?.docs?.source},description:{story:"antd's three `size` steps, which set the bordered cell padding.",...m.parameters?.docs?.description}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <BAIMetadataList bordered columns={2}>
      {POLICY_ITEMS}
      <MetadataListItem label="Created At">2026-08-09 11:24</MetadataListItem>
      <MetadataListItem label="Total Resource Slots">
        cpu: 4, mem: 8g
      </MetadataListItem>
    </BAIMetadataList>
}`,...h.parameters?.docs?.source},description:{story:`Two columns. The rules are drawn as the grid gap, so the lattice closes
correctly at any column count with no last-row special case — the reason
this could not be done with \`:last-of-type\` row rules.`,...h.parameters?.docs?.description}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <BAIMetadataList bordered>
      <MetadataListItem label="Allowed VFolder Hosts">
        local:volume1, local:volume2, cephfs:shared, cephfs:scratch,
        nfs:archive, nfs:home, s3:models, s3:datasets
      </MetadataListItem>
      <MetadataListItem label="Full Image Path">
        cr.backend.ai/multiarch/python-ff:24.03-py310-cuda12.2-ubuntu22.04
      </MetadataListItem>
      <MetadataListItem label="Status">
        <BAIBadge color="success" text="Active" />
      </MetadataListItem>
    </BAIMetadataList>
}`,...g.parameters?.docs?.source},description:{story:`Long values wrap inside their cell and the row grows with them; the label
cell fills the row rather than leaving the lattice ragged.`,...g.parameters?.docs?.description}}},_=[`Plain`,`Bordered`,`PlainVsBordered`,`Sizes`,`MultiColumn`,`LongValues`]})))()}v();export{f as Bordered,g as LongValues,h as MultiColumn,d as Plain,p as PlainVsBordered,m as Sizes,_ as __namedExportsOrder,l as default};