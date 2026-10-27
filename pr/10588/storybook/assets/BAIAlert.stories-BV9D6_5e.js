import{n as e}from"./rolldown-runtime-2s6bX4vc.js";import{n as t,t as n}from"./BAIAlert-BINqT0IN.js";import{n as r,t as i}from"./BAIFlex-CAz1t6J5.js";import{jsx as a,jsxs as o}from"react/jsx-runtime";var s,c,l,u;function d(){return(d=e((()=>{t(),r(),s={title:`Alert/BAIAlert`,component:n,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:`
**BAIAlert** extends [Ant Design Alert](https://ant.design/components/alert).

## BAI-Specific Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`ghostInfoBg\` | \`boolean\` | \`true\` | Info alerts use container background instead of default info background |

For all other props, refer to [Ant Design Alert](https://ant.design/components/alert).
        `}}},argTypes:{ghostInfoBg:{control:{type:`boolean`},description:`When true, info alerts use container background instead of default info background`,table:{type:{summary:`boolean`},defaultValue:{summary:`true`}}},type:{table:{disable:!0}},message:{table:{disable:!0}},showIcon:{table:{disable:!0}}}},c={name:`Basic`,args:{type:`info`,message:`Informational alert with ghost background`,showIcon:!0,ghostInfoBg:!0}},l={render:()=>o(i,{direction:`column`,gap:`md`,children:[a(n,{type:`info`,message:`Ghost enabled (default) - uses container background`,ghostInfoBg:!0,showIcon:!0}),a(n,{type:`info`,message:`Ghost disabled - uses default info background`,ghostInfoBg:!1,showIcon:!0})]})},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  name: 'Basic',
  args: {
    type: 'info',
    message: 'Informational alert with ghost background',
    showIcon: true,
    ghostInfoBg: true
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <BAIFlex direction="column" gap="md">
      <BAIAlert type="info" message="Ghost enabled (default) - uses container background" ghostInfoBg={true} showIcon />
      <BAIAlert type="info" message="Ghost disabled - uses default info background" ghostInfoBg={false} showIcon />
    </BAIFlex>
}`,...l.parameters?.docs?.source}}},u=[`Default`,`GhostInfoBackground`]})))()}d();export{c as Default,l as GhostInfoBackground,u as __namedExportsOrder,s as default};