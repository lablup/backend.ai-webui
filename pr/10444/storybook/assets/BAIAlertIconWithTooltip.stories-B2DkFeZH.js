import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-MKhVqBIO.js";import{n,t as r}from"./BAIFlex-BOFoS5KY.js";import{n as i,t as a}from"./BAIAlertIconWithTooltip-DobStJfy.js";var o,s,c,l,u,d,f,p,m,h,g,_;function v(){return(v=e((()=>{i(),n(),o=t(),p={title:`Alert/BAIAlertIconWithTooltip`,component:a,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:"\n**BAIAlertIconWithTooltip** extends [Ant Design Tooltip](https://ant.design/components/tooltip) with a built-in alert icon.\n\n## BAI-Specific Props\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `iconProps` | `React.ComponentProps<typeof CircleAlertIcon>` | `undefined` | Props for the CircleAlertIcon from lucide-react |\n| `type` | `'warning' | 'error'` | `'error'` | Determines icon color: warning uses colorWarning token, error uses colorError token |\n\n**Note:** The `children` prop is omitted as the component provides its own icon.\n\nFor all other props, refer to [Ant Design Tooltip](https://ant.design/components/tooltip).\n        "}}},argTypes:{iconProps:{control:{type:`object`},description:`Props for the CircleAlertIcon (lucide-react)`,table:{type:{summary:`React.ComponentProps<typeof CircleAlertIcon>`},defaultValue:{summary:`undefined`}}},type:{control:{type:`radio`},options:[`warning`,`error`],description:`Determines icon color: warning uses colorWarning token, error uses colorError token`,table:{type:{summary:`'warning' | 'error'`},defaultValue:{summary:`'error'`}}}}},m={name:`Basic`,args:{title:`This is an error alert icon`,type:`error`}},h={render:()=>(0,o.jsxs)(r,{direction:`row`,gap:`xl`,align:`center`,children:[(0,o.jsxs)(`div`,{children:[(0,o.jsx)(`div`,{style:{marginBottom:8,fontWeight:500},children:`Error (default)`}),(0,o.jsx)(a,{title:`This is an error message`,type:`error`})]}),(0,o.jsxs)(`div`,{children:[(0,o.jsx)(`div`,{style:{marginBottom:8,fontWeight:500},children:`Warning`}),(0,o.jsx)(a,{title:`This is a warning message`,type:`warning`})]})]})},g={render:()=>(0,o.jsxs)(r,{direction:`row`,gap:`xl`,align:`center`,children:[(0,o.jsxs)(`div`,{children:[(0,o.jsx)(`div`,{style:{marginBottom:8,fontWeight:500},children:`Default size`}),(0,o.jsx)(a,{title:`Default icon size`,type:`error`})]}),(0,o.jsxs)(`div`,{children:[(0,o.jsx)(`div`,{style:{marginBottom:8,fontWeight:500},children:`Small (16px)`}),(0,o.jsx)(a,{title:`Small icon size`,type:`error`,iconProps:{size:16}})]}),(0,o.jsxs)(`div`,{children:[(0,o.jsx)(`div`,{style:{marginBottom:8,fontWeight:500},children:`Large (32px)`}),(0,o.jsx)(a,{title:`Large icon size`,type:`warning`,iconProps:{size:32}})]})]})},m.parameters={...m.parameters,docs:{...(s=m.parameters)==null?void 0:s.docs,source:{originalSource:`{
  name: 'Basic',
  args: {
    title: 'This is an error alert icon',
    type: 'error'
  }
}`,...(c=m.parameters)==null||(c=c.docs)==null?void 0:c.source}}},h.parameters={...h.parameters,docs:{...(l=h.parameters)==null?void 0:l.docs,source:{originalSource:`{
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
}`,...(u=h.parameters)==null||(u=u.docs)==null?void 0:u.source}}},g.parameters={...g.parameters,docs:{...(d=g.parameters)==null?void 0:d.docs,source:{originalSource:`{
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
}`,...(f=g.parameters)==null||(f=f.docs)==null?void 0:f.source}}},_=[`Default`,`IconTypes`,`CustomIconSize`]})))()}v();export{g as CustomIconSize,m as Default,h as IconTypes,_ as __namedExportsOrder,p as default};