import{n as e}from"./rolldown-runtime-2s6bX4vc.js";import{n as t,t as n}from"./BAIFlex-CAz1t6J5.js";import{n as r,t as i}from"./BAIQuestionIconWithTooltip-W14m4lZB.js";import{jsx as a,jsxs as o}from"react/jsx-runtime";var s,c,l,u,d,f;function p(){return(p=e((()=>{t(),r(),s={title:`Tooltip/BAIQuestionIconWithTooltip`,component:i,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:"\n**BAIQuestionIconWithTooltip** extends [Ant Design Tooltip](https://ant.design/components/tooltip) with a built-in help (question mark) icon.\n\nIt is typically placed next to a label, form field, or table column header to surface an explanatory hint on hover. The icon uses the `colorTextTertiary` token and a `help` cursor.\n\n## BAI-Specific Props\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `iconProps` | `React.ComponentProps<typeof CircleHelp>` | `undefined` | Props for the CircleHelp icon from `lucide-react` (e.g. `size`, `strokeWidth`, `style`). |\n\n**Note:** The `children` prop is omitted as the component provides its own icon.\n\nFor all other props, refer to [Ant Design Tooltip](https://ant.design/components/tooltip).\n        "}}},argTypes:{iconProps:{control:{type:`object`},description:`Props for the CircleHelp icon (lucide-react)`,table:{type:{summary:`React.ComponentProps<typeof CircleHelp>`},defaultValue:{summary:`undefined`}}}}},c={name:`Basic`,args:{title:`This field accepts a comma-separated list of IP ranges.`}},l={render:()=>o(n,{gap:`xxs`,align:`center`,children:[a(`span`,{children:`Allowed Client IPs`}),a(i,{title:`Restrict access to the listed CIDR ranges. Leave empty to allow all.`})]})},u={render:()=>o(n,{direction:`row`,gap:`xl`,align:`center`,children:[o(`div`,{children:[a(`div`,{style:{marginBottom:8,fontWeight:500},children:`Default size`}),a(i,{title:`Default icon size`})]}),o(`div`,{children:[a(`div`,{style:{marginBottom:8,fontWeight:500},children:`Small (12px)`}),a(i,{title:`Small icon size`,iconProps:{style:{fontSize:12}}})]}),o(`div`,{children:[a(`div`,{style:{marginBottom:8,fontWeight:500},children:`Large (24px)`}),a(i,{title:`Large icon size`,iconProps:{style:{fontSize:24}}})]})]})},d={render:()=>o(n,{direction:`row`,gap:`xl`,align:`center`,children:[o(`div`,{children:[a(`div`,{style:{marginBottom:8,fontWeight:500},children:`Top (default)`}),a(i,{title:`Tooltip on top`,placement:`top`})]}),o(`div`,{children:[a(`div`,{style:{marginBottom:8,fontWeight:500},children:`Right`}),a(i,{title:`Tooltip on right`,placement:`right`})]}),o(`div`,{children:[a(`div`,{style:{marginBottom:8,fontWeight:500},children:`Bottom`}),a(i,{title:`Tooltip on bottom`,placement:`bottom`})]})]})},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
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