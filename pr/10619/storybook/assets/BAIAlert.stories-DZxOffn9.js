import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-MKhVqBIO.js";import{n,t as r}from"./BAIAlert-DLfGhgZ9.js";import{n as i,t as a}from"./BAIFlex-DnaoYTJ1.js";var o,s,c,l,u,d,f,p,m;function h(){return(h=e((()=>{n(),i(),o=t(),d={title:`Alert/BAIAlert`,component:r,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:`
**BAIAlert** extends [Ant Design Alert](https://ant.design/components/alert).

## BAI-Specific Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`ghostInfoBg\` | \`boolean\` | \`true\` | Info alerts use container background instead of default info background |

For all other props, refer to [Ant Design Alert](https://ant.design/components/alert).
        `}}},argTypes:{ghostInfoBg:{control:{type:`boolean`},description:`When true, info alerts use container background instead of default info background`,table:{type:{summary:`boolean`},defaultValue:{summary:`true`}}},type:{table:{disable:!0}},message:{table:{disable:!0}},showIcon:{table:{disable:!0}}}},f={name:`Basic`,args:{type:`info`,message:`Informational alert with ghost background`,showIcon:!0,ghostInfoBg:!0}},p={render:()=>(0,o.jsxs)(a,{direction:`column`,gap:`md`,children:[(0,o.jsx)(r,{type:`info`,message:`Ghost enabled (default) - uses container background`,ghostInfoBg:!0,showIcon:!0}),(0,o.jsx)(r,{type:`info`,message:`Ghost disabled - uses default info background`,ghostInfoBg:!1,showIcon:!0})]})},f.parameters={...f.parameters,docs:{...(s=f.parameters)==null?void 0:s.docs,source:{originalSource:`{
  name: 'Basic',
  args: {
    type: 'info',
    message: 'Informational alert with ghost background',
    showIcon: true,
    ghostInfoBg: true
  }
}`,...(c=f.parameters)==null||(c=c.docs)==null?void 0:c.source}}},p.parameters={...p.parameters,docs:{...(l=p.parameters)==null?void 0:l.docs,source:{originalSource:`{
  render: () => <BAIFlex direction="column" gap="md">
      <BAIAlert type="info" message="Ghost enabled (default) - uses container background" ghostInfoBg={true} showIcon />
      <BAIAlert type="info" message="Ghost disabled - uses default info background" ghostInfoBg={false} showIcon />
    </BAIFlex>
}`,...(u=p.parameters)==null||(u=u.docs)==null?void 0:u.source}}},m=[`Default`,`GhostInfoBackground`]})))()}h();export{f as Default,p as GhostInfoBackground,m as __namedExportsOrder,d as default};