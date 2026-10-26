import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-MKhVqBIO.js";import{n,t as r}from"./BAIFlex-BOFoS5KY.js";import{n as i,t as a}from"./BAIQuestionIconWithTooltip-Cd1Zvmh3.js";var o,s,c,l,u,d,f;function p(){return(p=e((()=>{n(),i(),o=t(),s={title:`Tooltip/BAIQuestionIconWithTooltip`,component:a,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:"\n**BAIQuestionIconWithTooltip** extends [Ant Design Tooltip](https://ant.design/components/tooltip) with a built-in help (question mark) icon.\n\nIt is typically placed next to a label, form field, or table column header to surface an explanatory hint on hover. The icon uses the `colorTextTertiary` token and a `help` cursor.\n\n## BAI-Specific Props\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `iconProps` | `React.ComponentProps<typeof CircleHelp>` | `undefined` | Props for the CircleHelp icon from `lucide-react` (e.g. `size`, `strokeWidth`, `style`). |\n\n**Note:** The `children` prop is omitted as the component provides its own icon.\n\nFor all other props, refer to [Ant Design Tooltip](https://ant.design/components/tooltip).\n        "}}},argTypes:{iconProps:{control:{type:`object`},description:`Props for the CircleHelp icon (lucide-react)`,table:{type:{summary:`React.ComponentProps<typeof CircleHelp>`},defaultValue:{summary:`undefined`}}}}},c={name:`Basic`,args:{title:`This field accepts a comma-separated list of IP ranges.`}},l={render:()=>(0,o.jsxs)(r,{gap:`xxs`,align:`center`,children:[(0,o.jsx)(`span`,{children:`Allowed Client IPs`}),(0,o.jsx)(a,{title:`Restrict access to the listed CIDR ranges. Leave empty to allow all.`})]})},u={render:()=>(0,o.jsxs)(r,{direction:`row`,gap:`xl`,align:`center`,children:[(0,o.jsxs)(`div`,{children:[(0,o.jsx)(`div`,{style:{marginBottom:8,fontWeight:500},children:`Default size`}),(0,o.jsx)(a,{title:`Default icon size`})]}),(0,o.jsxs)(`div`,{children:[(0,o.jsx)(`div`,{style:{marginBottom:8,fontWeight:500},children:`Small (12px)`}),(0,o.jsx)(a,{title:`Small icon size`,iconProps:{style:{fontSize:12}}})]}),(0,o.jsxs)(`div`,{children:[(0,o.jsx)(`div`,{style:{marginBottom:8,fontWeight:500},children:`Large (24px)`}),(0,o.jsx)(a,{title:`Large icon size`,iconProps:{style:{fontSize:24}}})]})]})},d={render:()=>(0,o.jsxs)(r,{direction:`row`,gap:`xl`,align:`center`,children:[(0,o.jsxs)(`div`,{children:[(0,o.jsx)(`div`,{style:{marginBottom:8,fontWeight:500},children:`Top (default)`}),(0,o.jsx)(a,{title:`Tooltip on top`,placement:`top`})]}),(0,o.jsxs)(`div`,{children:[(0,o.jsx)(`div`,{style:{marginBottom:8,fontWeight:500},children:`Right`}),(0,o.jsx)(a,{title:`Tooltip on right`,placement:`right`})]}),(0,o.jsxs)(`div`,{children:[(0,o.jsx)(`div`,{style:{marginBottom:8,fontWeight:500},children:`Bottom`}),(0,o.jsx)(a,{title:`Tooltip on bottom`,placement:`bottom`})]})]})},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  name: 'Basic',
  args: {
    title: 'This field accepts a comma-separated list of IP ranges.'
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <BAIFlex gap="xxs" align="center">
      <span>Allowed Client IPs</span>
      <BAIQuestionIconWithTooltip title="Restrict access to the listed CIDR ranges. Leave empty to allow all." />
    </BAIFlex>
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => <BAIFlex direction="row" gap="xl" align="center">
      <div>
        <div style={{
        marginBottom: 8,
        fontWeight: 500
      }}>Default size</div>
        <BAIQuestionIconWithTooltip title="Default icon size" />
      </div>
      <div>
        <div style={{
        marginBottom: 8,
        fontWeight: 500
      }}>Small (12px)</div>
        <BAIQuestionIconWithTooltip title="Small icon size" iconProps={{
        style: {
          fontSize: 12
        }
      }} />
      </div>
      <div>
        <div style={{
        marginBottom: 8,
        fontWeight: 500
      }}>Large (24px)</div>
        <BAIQuestionIconWithTooltip title="Large icon size" iconProps={{
        style: {
          fontSize: 24
        }
      }} />
      </div>
    </BAIFlex>
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <BAIFlex direction="row" gap="xl" align="center">
      <div>
        <div style={{
        marginBottom: 8,
        fontWeight: 500
      }}>Top (default)</div>
        <BAIQuestionIconWithTooltip title="Tooltip on top" placement="top" />
      </div>
      <div>
        <div style={{
        marginBottom: 8,
        fontWeight: 500
      }}>Right</div>
        <BAIQuestionIconWithTooltip title="Tooltip on right" placement="right" />
      </div>
      <div>
        <div style={{
        marginBottom: 8,
        fontWeight: 500
      }}>Bottom</div>
        <BAIQuestionIconWithTooltip title="Tooltip on bottom" placement="bottom" />
      </div>
    </BAIFlex>
}`,...d.parameters?.docs?.source}}},f=[`Default`,`WithLabel`,`CustomIconSize`,`Placement`]})))()}p();export{u as CustomIconSize,c as Default,d as Placement,l as WithLabel,f as __namedExportsOrder,s as default};