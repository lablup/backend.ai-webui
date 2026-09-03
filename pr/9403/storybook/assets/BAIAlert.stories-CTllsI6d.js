import{j as t}from"./iframe-BHwQ4yqs.js";import{B as s}from"./BAIAlert-reOQXrp-.js";import{B as u}from"./BAIFlex-Db0ZLhmZ.js";import"./preload-helper-Dp1pzeXC.js";import"./Banner-BJSD-dY_.js";import"./isRenderable-BUV0eL6r.js";import"./composeEventHandlers-BolWE7qY.js";const b={title:"Alert/BAIAlert",component:s,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:`
**BAIAlert** extends [Ant Design Alert](https://ant.design/components/alert).

## BAI-Specific Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`ghostInfoBg\` | \`boolean\` | \`true\` | Info alerts use container background instead of default info background |

For all other props, refer to [Ant Design Alert](https://ant.design/components/alert).
        `}}},argTypes:{ghostInfoBg:{control:{type:"boolean"},description:"When true, info alerts use container background instead of default info background",table:{type:{summary:"boolean"},defaultValue:{summary:"true"}}},type:{table:{disable:!0}},message:{table:{disable:!0}},showIcon:{table:{disable:!0}}}},e={name:"Basic",args:{type:"info",message:"Informational alert with ghost background",showIcon:!0,ghostInfoBg:!0}},o={render:()=>t.jsxs(u,{direction:"column",gap:"md",children:[t.jsx(s,{type:"info",message:"Ghost enabled (default) - uses container background",ghostInfoBg:!0,showIcon:!0}),t.jsx(s,{type:"info",message:"Ghost disabled - uses default info background",ghostInfoBg:!1,showIcon:!0})]})};var n,r,a;e.parameters={...e.parameters,docs:{...(n=e.parameters)==null?void 0:n.docs,source:{originalSource:`{
  name: 'Basic',
  args: {
    type: 'info',
    message: 'Informational alert with ghost background',
    showIcon: true,
    ghostInfoBg: true
  }
}`,...(a=(r=e.parameters)==null?void 0:r.docs)==null?void 0:a.source}}};var c,i,l;o.parameters={...o.parameters,docs:{...(c=o.parameters)==null?void 0:c.docs,source:{originalSource:`{
  render: () => <BAIFlex direction="column" gap="md">
      <BAIAlert type="info" message="Ghost enabled (default) - uses container background" ghostInfoBg={true} showIcon />
      <BAIAlert type="info" message="Ghost disabled - uses default info background" ghostInfoBg={false} showIcon />
    </BAIFlex>
}`,...(l=(i=o.parameters)==null?void 0:i.docs)==null?void 0:l.source}}};const B=["Default","GhostInfoBackground"];export{e as Default,o as GhostInfoBackground,B as __namedExportsOrder,b as default};
