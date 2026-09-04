import{j as e}from"./iframe-Cmts9fTB.js";import{B as r}from"./BAIAlertIconWithTooltip-BpFaq7zD.js";import{B as h}from"./BAIFlex-CDeSnMwg.js";import"./preload-helper-Dp1pzeXC.js";import"./BAIIconWithTooltip-B92uWDV_.js";import"./astryxLabel-Bg2zwKj3.js";import"./circle-alert-D0-nUaES.js";const B={title:"Alert/BAIAlertIconWithTooltip",component:r,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:"\n**BAIAlertIconWithTooltip** extends [Ant Design Tooltip](https://ant.design/components/tooltip) with a built-in alert icon.\n\n## BAI-Specific Props\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `iconProps` | `React.ComponentProps<typeof CircleAlertIcon>` | `undefined` | Props for the CircleAlertIcon from lucide-react |\n| `type` | `'warning' | 'error'` | `'error'` | Determines icon color: warning uses colorWarning token, error uses colorError token |\n\n**Note:** The `children` prop is omitted as the component provides its own icon.\n\nFor all other props, refer to [Ant Design Tooltip](https://ant.design/components/tooltip).\n        "}}},argTypes:{iconProps:{control:{type:"object"},description:"Props for the CircleAlertIcon (lucide-react)",table:{type:{summary:"React.ComponentProps<typeof CircleAlertIcon>"},defaultValue:{summary:"undefined"}}},type:{control:{type:"radio"},options:["warning","error"],description:"Determines icon color: warning uses colorWarning token, error uses colorError token",table:{type:{summary:"'warning' | 'error'"},defaultValue:{summary:"'error'"}}}}},t={name:"Basic",args:{title:"This is an error alert icon",type:"error"}},o={render:()=>e.jsxs(h,{direction:"row",gap:"xl",align:"center",children:[e.jsxs("div",{children:[e.jsx("div",{style:{marginBottom:8,fontWeight:500},children:"Error (default)"}),e.jsx(r,{title:"This is an error message",type:"error"})]}),e.jsxs("div",{children:[e.jsx("div",{style:{marginBottom:8,fontWeight:500},children:"Warning"}),e.jsx(r,{title:"This is a warning message",type:"warning"})]})]})},n={render:()=>e.jsxs(h,{direction:"row",gap:"xl",align:"center",children:[e.jsxs("div",{children:[e.jsx("div",{style:{marginBottom:8,fontWeight:500},children:"Default size"}),e.jsx(r,{title:"Default icon size",type:"error"})]}),e.jsxs("div",{children:[e.jsx("div",{style:{marginBottom:8,fontWeight:500},children:"Small (16px)"}),e.jsx(r,{title:"Small icon size",type:"error",iconProps:{size:16}})]}),e.jsxs("div",{children:[e.jsx("div",{style:{marginBottom:8,fontWeight:500},children:"Large (32px)"}),e.jsx(r,{title:"Large icon size",type:"warning",iconProps:{size:32}})]})]})};var i,s,a;t.parameters={...t.parameters,docs:{...(i=t.parameters)==null?void 0:i.docs,source:{originalSource:`{
  name: 'Basic',
  args: {
    title: 'This is an error alert icon',
    type: 'error'
  }
}`,...(a=(s=t.parameters)==null?void 0:s.docs)==null?void 0:a.source}}};var l,c,p;o.parameters={...o.parameters,docs:{...(l=o.parameters)==null?void 0:l.docs,source:{originalSource:`{
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
}`,...(p=(c=o.parameters)==null?void 0:c.docs)==null?void 0:p.source}}};var d,m,g;n.parameters={...n.parameters,docs:{...(d=n.parameters)==null?void 0:d.docs,source:{originalSource:`{
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
}`,...(g=(m=n.parameters)==null?void 0:m.docs)==null?void 0:g.source}}};const W=["Default","IconTypes","CustomIconSize"];export{n as CustomIconSize,t as Default,o as IconTypes,W as __namedExportsOrder,B as default};
