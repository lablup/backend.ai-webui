import{j as e}from"./iframe-DmQqQVMA.js";import{B as a}from"./BAIFlex-Clxe_jdZ.js";import{B as r}from"./BAITag-CEvXa2zb.js";import"./preload-helper-Dp1pzeXC.js";import"./astryxTagVariant-CPCr7vTB.js";import"./Token-XHsLRlkw.js";import"./composeEventHandlers-BolWE7qY.js";import"./Badge-BKfmPevg.js";const I={title:"Tag/BAITag",component:r,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:"\n**BAITag** keeps an [Ant Design Tag](https://ant.design/components/tag)-shaped prop surface (`color`, `icon`, `closable`, `onClose`, `children`) for call-site compatibility, but renders through Astryx `Badge` (or `Token` when `closable`) internally.\n\n## Color Mapping\n`color` is routed through a repo-global lookup (`helper/astryxTagVariant`) onto Astryx's closed `Badge`/`Token` variant enums — antd status presets (`success`/`processing`/`error`/`warning`) map to the matching semantic variant, and antd palette presets (`blue`, `geekblue`, `magenta`, ...) map onto the nearest Astryx hue.\n\nThis component has no additional props beyond the antd-shaped surface. Astryx's Badge appearance is closed and theme-owned (solid variants, not antd's transparent/outlined look — see `BAITag.tsx` for the full PILOT-DECISION history).\n        "}}},argTypes:{}},n={args:{children:"Default Tag"}},s={name:"Color Mapping (status + palette presets)",parameters:{docs:{description:{story:"BAITag keeps antd's `color` values working — status presets render their matching semantic Badge variant, and palette presets (including ones with no direct Astryx hue, like `geekblue`/`magenta`) fold onto the nearest supported variant via the shared `astryxTagVariant` lookup."}}},render:()=>e.jsxs(a,{direction:"column",gap:"lg",children:[e.jsxs(a,{direction:"column",gap:"sm",children:[e.jsx("strong",{children:"Status presets"}),e.jsxs(a,{gap:"sm",wrap:"wrap",children:[e.jsx(r,{children:"Default"}),e.jsx(r,{color:"success",children:"Success"}),e.jsx(r,{color:"processing",children:"Processing"}),e.jsx(r,{color:"error",children:"Error"}),e.jsx(r,{color:"warning",children:"Warning"})]})]}),e.jsxs(a,{direction:"column",gap:"sm",children:[e.jsx("strong",{children:"Palette presets (including non-Astryx hues)"}),e.jsxs(a,{gap:"sm",wrap:"wrap",children:[e.jsx(r,{color:"blue",children:"blue"}),e.jsx(r,{color:"geekblue",children:"geekblue → blue"}),e.jsx(r,{color:"magenta",children:"magenta → pink"}),e.jsx(r,{color:"cyan",children:"cyan"}),e.jsx(r,{color:"purple",children:"purple"})]})]})]})};var o,t,l;n.parameters={...n.parameters,docs:{...(o=n.parameters)==null?void 0:o.docs,source:{originalSource:`{
  args: {
    children: 'Default Tag'
  }
}`,...(l=(t=n.parameters)==null?void 0:t.docs)==null?void 0:l.source}}};var c,i,p;s.parameters={...s.parameters,docs:{...(c=s.parameters)==null?void 0:c.docs,source:{originalSource:`{
  name: 'Color Mapping (status + palette presets)',
  parameters: {
    docs: {
      description: {
        story: "BAITag keeps antd's \`color\` values working — status presets render their matching semantic Badge variant, and palette presets (including ones with no direct Astryx hue, like \`geekblue\`/\`magenta\`) fold onto the nearest supported variant via the shared \`astryxTagVariant\` lookup."
      }
    }
  },
  render: () => <BAIFlex direction="column" gap="lg">
      <BAIFlex direction="column" gap="sm">
        <strong>Status presets</strong>
        <BAIFlex gap="sm" wrap="wrap">
          <BAITag>Default</BAITag>
          <BAITag color="success">Success</BAITag>
          <BAITag color="processing">Processing</BAITag>
          <BAITag color="error">Error</BAITag>
          <BAITag color="warning">Warning</BAITag>
        </BAIFlex>
      </BAIFlex>
      <BAIFlex direction="column" gap="sm">
        <strong>Palette presets (including non-Astryx hues)</strong>
        <BAIFlex gap="sm" wrap="wrap">
          <BAITag color="blue">blue</BAITag>
          <BAITag color="geekblue">geekblue → blue</BAITag>
          <BAITag color="magenta">magenta → pink</BAITag>
          <BAITag color="cyan">cyan</BAITag>
          <BAITag color="purple">purple</BAITag>
        </BAIFlex>
      </BAIFlex>
    </BAIFlex>
}`,...(p=(i=s.parameters)==null?void 0:i.docs)==null?void 0:p.source}}};const T=["Default","ColorMapping"];export{s as ColorMapping,n as Default,T as __namedExportsOrder,I as default};
