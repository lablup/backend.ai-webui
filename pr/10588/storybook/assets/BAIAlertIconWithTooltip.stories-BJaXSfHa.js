import{n as e}from"./rolldown-runtime-2s6bX4vc.js";import{n as t,t as n}from"./BAIFlex-CAz1t6J5.js";import{n as r,t as i}from"./BAIAlertIconWithTooltip-yaMgFFQ7.js";import{jsx as a,jsxs as o}from"react/jsx-runtime";var s,c,l,u,d;function f(){return(f=e((()=>{r(),t(),s={title:`Alert/BAIAlertIconWithTooltip`,component:i,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:"\n**BAIAlertIconWithTooltip** extends [Ant Design Tooltip](https://ant.design/components/tooltip) with a built-in alert icon.\n\n## BAI-Specific Props\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `iconProps` | `React.ComponentProps<typeof CircleAlertIcon>` | `undefined` | Props for the CircleAlertIcon from lucide-react |\n| `type` | `'warning' | 'error'` | `'error'` | Determines icon color: warning uses colorWarning token, error uses colorError token |\n\n**Note:** The `children` prop is omitted as the component provides its own icon.\n\nFor all other props, refer to [Ant Design Tooltip](https://ant.design/components/tooltip).\n        "}}},argTypes:{iconProps:{control:{type:`object`},description:`Props for the CircleAlertIcon (lucide-react)`,table:{type:{summary:`React.ComponentProps<typeof CircleAlertIcon>`},defaultValue:{summary:`undefined`}}},type:{control:{type:`radio`},options:[`warning`,`error`],description:`Determines icon color: warning uses colorWarning token, error uses colorError token`,table:{type:{summary:`'warning' | 'error'`},defaultValue:{summary:`'error'`}}}}},c={name:`Basic`,args:{title:`This is an error alert icon`,type:`error`}},l={render:()=>o(n,{direction:`row`,gap:`xl`,align:`center`,children:[o(`div`,{children:[a(`div`,{style:{marginBottom:8,fontWeight:500},children:`Error (default)`}),a(i,{title:`This is an error message`,type:`error`})]}),o(`div`,{children:[a(`div`,{style:{marginBottom:8,fontWeight:500},children:`Warning`}),a(i,{title:`This is a warning message`,type:`warning`})]})]})},u={render:()=>o(n,{direction:`row`,gap:`xl`,align:`center`,children:[o(`div`,{children:[a(`div`,{style:{marginBottom:8,fontWeight:500},children:`Default size`}),a(i,{title:`Default icon size`,type:`error`})]}),o(`div`,{children:[a(`div`,{style:{marginBottom:8,fontWeight:500},children:`Small (16px)`}),a(i,{title:`Small icon size`,type:`error`,iconProps:{size:16}})]}),o(`div`,{children:[a(`div`,{style:{marginBottom:8,fontWeight:500},children:`Large (32px)`}),a(i,{title:`Large icon size`,type:`warning`,iconProps:{size:32}})]})]})},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  name: 'Basic',
  args: {
    title: 'This is an error alert icon',
    type: 'error'
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <BAIFlex direction="row" gap="xl" align="center">
      <div>
        <div style={{
        marginBottom: 8,
        fontWeight: 500
      }}>Error (default)</div>
        <BAIAlertIconWithTooltip title="This is an error message" type="error" />
      </div>
      <div>
        <div style={{
        marginBottom: 8,
        fontWeight: 500
      }}>Warning</div>
        <BAIAlertIconWithTooltip title="This is a warning message" type="warning" />
      </div>
    </BAIFlex>
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => <BAIFlex direction="row" gap="xl" align="center">
      <div>
        <div style={{
        marginBottom: 8,
        fontWeight: 500
      }}>Default size</div>
        <BAIAlertIconWithTooltip title="Default icon size" type="error" />
      </div>
      <div>
        <div style={{
        marginBottom: 8,
        fontWeight: 500
      }}>Small (16px)</div>
        <BAIAlertIconWithTooltip title="Small icon size" type="error" iconProps={{
        size: 16
      }} />
      </div>
      <div>
        <div style={{
        marginBottom: 8,
        fontWeight: 500
      }}>Large (32px)</div>
        <BAIAlertIconWithTooltip title="Large icon size" type="warning" iconProps={{
        size: 32
      }} />
      </div>
    </BAIFlex>
}`,...u.parameters?.docs?.source}}},d=[`Default`,`IconTypes`,`CustomIconSize`]})))()}f();export{u as CustomIconSize,c as Default,l as IconTypes,d as __namedExportsOrder,s as default};