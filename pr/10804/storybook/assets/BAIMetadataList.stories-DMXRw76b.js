import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-MKhVqBIO.js";import{n,t as r}from"./BAIBadge-CppFaOW2.js";import{i,n as a,r as o,t as s}from"./BAIMetadataList-D1ocq1MN.js";var c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F;function I(){return(I=e((()=>{n(),a(),i(),c=t(),D={title:`Data Display/BAIMetadataList`,component:s,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:"\n**BAIMetadataList** wraps Astryx's `MetadataList` and adds an opt-in\n`bordered` prop: an outer frame plus a 1px rule between every item.\n\n`bordered` preserves the list's own layout — it does not force side labels,\nshade the label column, or reflow the grid. It adds only the frame and the\ninter-item separators, on whatever `columns`/`label` layout the list already\nhas (a multi-column list keeps its stacked labels).\n\nIndependently of `bordered`, the wrapper lightens the item label so it reads\nquieter than its value — the base class is always applied, so this is the\ndefault for every list, `bordered` or not. The tone is the lightest mix off\n`--color-text-secondary` that still clears WCAG AA in both themes; override\n`--bai-metadata-list-label-color` to retune it. Side labels are also\ntop-aligned with their value's first line, so a multi-line value doesn't\nleave the label floating mid-row (FR-3667).\n\nThe paint lives in `BAIMetadataList.css`, entirely in design tokens.\n\n## Props\n\n| Name | Type | Default | Description |\n|------|------|---------|-------------|\n| bordered | `boolean` | `false` | Outer frame + a 1px rule between items; keeps the list's own label layout |\n| size | `'default' \\| 'middle' \\| 'small'` | `'default'` | Bordered cell padding (16/24, 12/24, 8/16px). No effect without `bordered` |\n\nEverything else is `MetadataList`'s own surface (`columns`, `label`,\n`title`, `orientation`, `maxNumOfItems`).\n        "}}},argTypes:{bordered:{control:{type:`boolean`}},size:{control:{type:`inline-radio`},options:[`default`,`middle`,`small`],table:{defaultValue:{summary:`default`}}},columns:{control:{type:`inline-radio`},options:[`single`,`multi`]}}},O=(0,c.jsxs)(c.Fragment,{children:[(0,c.jsx)(o,{label:`Name`,children:`default-policy`}),(0,c.jsx)(o,{label:`Max VFolder Count`,children:`10`}),(0,c.jsx)(o,{label:`Max Session Count Per Model Session`,children:`1`}),(0,c.jsx)(o,{label:`Status`,children:(0,c.jsx)(r,{color:`success`,text:`Active`})})]}),k={render:()=>(0,c.jsx)(s,{children:O})},A={render:()=>(0,c.jsx)(s,{bordered:!0,children:O})},j={render:()=>(0,c.jsxs)(`div`,{style:{display:`grid`,gap:32},children:[(0,c.jsx)(s,{title:`Plain`,children:O}),(0,c.jsx)(s,{title:`Bordered`,bordered:!0,children:O})]})},M={render:()=>(0,c.jsxs)(`div`,{style:{display:`grid`,gap:32},children:[(0,c.jsx)(s,{bordered:!0,size:`default`,title:`default — 16px / 24px`,children:O}),(0,c.jsx)(s,{bordered:!0,size:`middle`,title:`middle — 12px / 24px`,children:O}),(0,c.jsx)(s,{bordered:!0,size:`small`,title:`small — 8px / 16px`,children:O})]})},N={render:()=>(0,c.jsxs)(s,{bordered:!0,columns:2,children:[O,(0,c.jsx)(o,{label:`Created At`,children:`2026-08-09 11:24`}),(0,c.jsx)(o,{label:`Total Resource Slots`,children:`cpu: 4, mem: 8g`})]})},P={render:()=>(0,c.jsxs)(s,{bordered:!0,children:[(0,c.jsx)(o,{label:`Allowed VFolder Hosts`,children:`local:volume1, local:volume2, cephfs:shared, cephfs:scratch, nfs:archive, nfs:home, s3:models, s3:datasets`}),(0,c.jsx)(o,{label:`Full Image Path`,children:`cr.backend.ai/multiarch/python-ff:24.03-py310-cuda12.2-ubuntu22.04`}),(0,c.jsx)(o,{label:`Status`,children:(0,c.jsx)(r,{color:`success`,text:`Active`})})]})},k.parameters={...k.parameters,docs:{...(l=k.parameters)==null?void 0:l.docs,source:{originalSource:`{
  render: () => <BAIMetadataList>{POLICY_ITEMS}</BAIMetadataList>
}`,...(u=k.parameters)==null||(u=u.docs)==null?void 0:u.source},description:{story:`Astryx's own list, untouched — this is what every converted surface shows today.`,...(d=k.parameters)==null||(d=d.docs)==null?void 0:d.description}}},A.parameters={...A.parameters,docs:{...(f=A.parameters)==null?void 0:f.docs,source:{originalSource:`{
  render: () => <BAIMetadataList bordered>{POLICY_ITEMS}</BAIMetadataList>
}`,...(p=A.parameters)==null||(p=p.docs)==null?void 0:p.source},description:{story:`The bordered look — outer frame + a 1px rule between items.`,...(m=A.parameters)==null||(m=m.docs)==null?void 0:m.description}}},j.parameters={...j.parameters,docs:{...(h=j.parameters)==null?void 0:h.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'grid',
    gap: 32
  }}>
      <BAIMetadataList title="Plain">{POLICY_ITEMS}</BAIMetadataList>
      <BAIMetadataList title="Bordered" bordered>
        {POLICY_ITEMS}
      </BAIMetadataList>
    </div>
}`,...(g=j.parameters)==null||(g=g.docs)==null?void 0:g.source},description:{story:"Side by side. `bordered` is opt-in precisely so both can be used — adopting\nit is a per-surface choice, not a global restyle.",...(_=j.parameters)==null||(_=_.docs)==null?void 0:_.description}}},M.parameters={...M.parameters,docs:{...(v=M.parameters)==null?void 0:v.docs,source:{originalSource:`{
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
}`,...(y=M.parameters)==null||(y=y.docs)==null?void 0:y.source},description:{story:"antd's three `size` steps, which set the bordered cell padding.",...(b=M.parameters)==null||(b=b.docs)==null?void 0:b.description}}},N.parameters={...N.parameters,docs:{...(x=N.parameters)==null?void 0:x.docs,source:{originalSource:`{
  render: () => <BAIMetadataList bordered columns={2}>
      {POLICY_ITEMS}
      <MetadataListItem label="Created At">2026-08-09 11:24</MetadataListItem>
      <MetadataListItem label="Total Resource Slots">
        cpu: 4, mem: 8g
      </MetadataListItem>
    </BAIMetadataList>
}`,...(S=N.parameters)==null||(S=S.docs)==null?void 0:S.source},description:{story:`Two columns. The rules are drawn as the grid gap, so the lattice closes
correctly at any column count with no last-row special case — the reason
this could not be done with \`:last-of-type\` row rules.`,...(C=N.parameters)==null||(C=C.docs)==null?void 0:C.description}}},P.parameters={...P.parameters,docs:{...(w=P.parameters)==null?void 0:w.docs,source:{originalSource:`{
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
}`,...(T=P.parameters)==null||(T=T.docs)==null?void 0:T.source},description:{story:`Long values wrap inside their cell and the row grows with them; the label
cell fills the row rather than leaving the lattice ragged.`,...(E=P.parameters)==null||(E=E.docs)==null?void 0:E.description}}},F=[`Plain`,`Bordered`,`PlainVsBordered`,`Sizes`,`MultiColumn`,`LongValues`]})))()}I();export{A as Bordered,P as LongValues,N as MultiColumn,k as Plain,j as PlainVsBordered,M as Sizes,F as __namedExportsOrder,D as default};