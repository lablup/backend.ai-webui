import{j as e}from"./iframe-CHHFS3of.js";import{B as D}from"./BAIBadge-Cu0xH4rz.js";import{B as t,M as a}from"./BAIMetadataList-B_Nis2gw.js";import"./preload-helper-Dp1pzeXC.js";import"./isRenderable-BUV0eL6r.js";const W={title:"Data Display/BAIMetadataList",component:t,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:"\n**BAIMetadataList** wraps Astryx's `MetadataList` and adds an opt-in\n`bordered` prop: an outer frame plus a 1px rule between every item.\n\n`bordered` preserves the list's own layout — it does not force side labels,\nshade the label column, or reflow the grid. It adds only the frame and the\ninter-item separators, on whatever `columns`/`label` layout the list already\nhas (a multi-column list keeps its stacked labels).\n\nIndependently of `bordered`, the wrapper lightens the item label so it reads\nquieter than its value — the base class is always applied, so this is the\ndefault for every list, `bordered` or not. The tone is the lightest mix off\n`--color-text-secondary` that still clears WCAG AA in both themes; override\n`--bai-metadata-list-label-color` to retune it. Side labels are also\ntop-aligned with their value's first line, so a multi-line value doesn't\nleave the label floating mid-row (FR-3667).\n\nThe paint lives in `BAIMetadataList.css`, entirely in design tokens.\n\n## Props\n\n| Name | Type | Default | Description |\n|------|------|---------|-------------|\n| bordered | `boolean` | `false` | Outer frame + a 1px rule between items; keeps the list's own label layout |\n| size | `'default' \\| 'middle' \\| 'small'` | `'default'` | Bordered cell padding (16/24, 12/24, 8/16px). No effect without `bordered` |\n\nEverything else is `MetadataList`'s own surface (`columns`, `label`,\n`title`, `orientation`, `maxNumOfItems`).\n        "}}},argTypes:{bordered:{control:{type:"boolean"}},size:{control:{type:"inline-radio"},options:["default","middle","small"],table:{defaultValue:{summary:"default"}}},columns:{control:{type:"inline-radio"},options:["single","multi"]}}},s=e.jsxs(e.Fragment,{children:[e.jsx(a,{label:"Name",children:"default-policy"}),e.jsx(a,{label:"Max VFolder Count",children:"10"}),e.jsx(a,{label:"Max Session Count Per Model Session",children:"1"}),e.jsx(a,{label:"Status",children:e.jsx(D,{color:"success",text:"Active"})})]}),r={render:()=>e.jsx(t,{children:s})},d={render:()=>e.jsx(t,{bordered:!0,children:s})},o={render:()=>e.jsxs("div",{style:{display:"grid",gap:32},children:[e.jsx(t,{title:"Plain",children:s}),e.jsx(t,{title:"Bordered",bordered:!0,children:s})]})},l={render:()=>e.jsxs("div",{style:{display:"grid",gap:32},children:[e.jsx(t,{bordered:!0,size:"default",title:"default — 16px / 24px",children:s}),e.jsx(t,{bordered:!0,size:"middle",title:"middle — 12px / 24px",children:s}),e.jsx(t,{bordered:!0,size:"small",title:"small — 8px / 16px",children:s})]})},i={render:()=>e.jsxs(t,{bordered:!0,columns:2,children:[s,e.jsx(a,{label:"Created At",children:"2026-08-09 11:24"}),e.jsx(a,{label:"Total Resource Slots",children:"cpu: 4, mem: 8g"})]})},n={render:()=>e.jsxs(t,{bordered:!0,children:[e.jsx(a,{label:"Allowed VFolder Hosts",children:"local:volume1, local:volume2, cephfs:shared, cephfs:scratch, nfs:archive, nfs:home, s3:models, s3:datasets"}),e.jsx(a,{label:"Full Image Path",children:"cr.backend.ai/multiarch/python-ff:24.03-py310-cuda12.2-ubuntu22.04"}),e.jsx(a,{label:"Status",children:e.jsx(D,{color:"success",text:"Active"})})]})};var c,p,m,u,h;r.parameters={...r.parameters,docs:{...(c=r.parameters)==null?void 0:c.docs,source:{originalSource:`{
  render: () => <BAIMetadataList>{POLICY_ITEMS}</BAIMetadataList>
}`,...(m=(p=r.parameters)==null?void 0:p.docs)==null?void 0:m.source},description:{story:"Astryx's own list, untouched — this is what every converted surface shows today.",...(h=(u=r.parameters)==null?void 0:u.docs)==null?void 0:h.description}}};var b,I,x,M,f;d.parameters={...d.parameters,docs:{...(b=d.parameters)==null?void 0:b.docs,source:{originalSource:`{
  render: () => <BAIMetadataList bordered>{POLICY_ITEMS}</BAIMetadataList>
}`,...(x=(I=d.parameters)==null?void 0:I.docs)==null?void 0:x.source},description:{story:"The bordered look — outer frame + a 1px rule between items.",...(f=(M=d.parameters)==null?void 0:M.docs)==null?void 0:f.description}}};var y,L,g,A,B;o.parameters={...o.parameters,docs:{...(y=o.parameters)==null?void 0:y.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'grid',
    gap: 32
  }}>
      <BAIMetadataList title="Plain">{POLICY_ITEMS}</BAIMetadataList>
      <BAIMetadataList title="Bordered" bordered>
        {POLICY_ITEMS}
      </BAIMetadataList>
    </div>
}`,...(g=(L=o.parameters)==null?void 0:L.docs)==null?void 0:g.source},description:{story:"Side by side. `bordered` is opt-in precisely so both can be used — adopting\nit is a per-surface choice, not a global restyle.",...(B=(A=o.parameters)==null?void 0:A.docs)==null?void 0:B.description}}};var w,v,S,j,P;l.parameters={...l.parameters,docs:{...(w=l.parameters)==null?void 0:w.docs,source:{originalSource:`{
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
}`,...(S=(v=l.parameters)==null?void 0:v.docs)==null?void 0:S.source},description:{story:"antd's three `size` steps, which set the bordered cell padding.",...(P=(j=l.parameters)==null?void 0:j.docs)==null?void 0:P.description}}};var T,C,E,O,z;i.parameters={...i.parameters,docs:{...(T=i.parameters)==null?void 0:T.docs,source:{originalSource:`{
  render: () => <BAIMetadataList bordered columns={2}>
      {POLICY_ITEMS}
      <MetadataListItem label="Created At">2026-08-09 11:24</MetadataListItem>
      <MetadataListItem label="Total Resource Slots">
        cpu: 4, mem: 8g
      </MetadataListItem>
    </BAIMetadataList>
}`,...(E=(C=i.parameters)==null?void 0:C.docs)==null?void 0:E.source},description:{story:"Two columns. The rules are drawn as the grid gap, so the lattice closes\ncorrectly at any column count with no last-row special case — the reason\nthis could not be done with `:last-of-type` row rules.",...(z=(O=i.parameters)==null?void 0:O.docs)==null?void 0:z.description}}};var _,Y,V,k,F;n.parameters={...n.parameters,docs:{...(_=n.parameters)==null?void 0:_.docs,source:{originalSource:`{
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
}`,...(V=(Y=n.parameters)==null?void 0:Y.docs)==null?void 0:V.source},description:{story:`Long values wrap inside their cell and the row grows with them; the label
cell fills the row rather than leaving the lattice ragged.`,...(F=(k=n.parameters)==null?void 0:k.docs)==null?void 0:F.description}}};const J=["Plain","Bordered","PlainVsBordered","Sizes","MultiColumn","LongValues"];export{d as Bordered,n as LongValues,i as MultiColumn,r as Plain,o as PlainVsBordered,l as Sizes,J as __namedExportsOrder,W as default};
