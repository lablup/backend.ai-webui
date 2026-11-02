import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-MKhVqBIO.js";import{n,t as r}from"./BAIFlex-DnaoYTJ1.js";import{n as i,t as a}from"./BAIQuestionIconWithTooltip-Bp6GouaJ.js";var o,s,c,l,u,d,f,p,m,h,g,_,v,y,b;function x(){return(x=e((()=>{n(),i(),o=t(),h={title:`Tooltip/BAIQuestionIconWithTooltip`,component:a,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:"\n**BAIQuestionIconWithTooltip** extends [Ant Design Tooltip](https://ant.design/components/tooltip) with a built-in help (question mark) icon.\n\nIt is typically placed next to a label, form field, or table column header to surface an explanatory hint on hover. The icon uses the `colorTextTertiary` token and a `help` cursor.\n\n## BAI-Specific Props\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `iconProps` | `React.ComponentProps<typeof CircleHelp>` | `undefined` | Props for the CircleHelp icon from `lucide-react` (e.g. `size`, `strokeWidth`, `style`). |\n\n**Note:** The `children` prop is omitted as the component provides its own icon.\n\nFor all other props, refer to [Ant Design Tooltip](https://ant.design/components/tooltip).\n        "}}},argTypes:{iconProps:{control:{type:`object`},description:`Props for the CircleHelp icon (lucide-react)`,table:{type:{summary:`React.ComponentProps<typeof CircleHelp>`},defaultValue:{summary:`undefined`}}}}},g={name:`Basic`,args:{title:`This field accepts a comma-separated list of IP ranges.`}},_={render:()=>(0,o.jsxs)(r,{gap:`xxs`,align:`center`,children:[(0,o.jsx)(`span`,{children:`Allowed Client IPs`}),(0,o.jsx)(a,{title:`Restrict access to the listed CIDR ranges. Leave empty to allow all.`})]})},v={render:()=>(0,o.jsxs)(r,{direction:`row`,gap:`xl`,align:`center`,children:[(0,o.jsxs)(`div`,{children:[(0,o.jsx)(`div`,{style:{marginBottom:8,fontWeight:500},children:`Default size`}),(0,o.jsx)(a,{title:`Default icon size`})]}),(0,o.jsxs)(`div`,{children:[(0,o.jsx)(`div`,{style:{marginBottom:8,fontWeight:500},children:`Small (12px)`}),(0,o.jsx)(a,{title:`Small icon size`,iconProps:{style:{fontSize:12}}})]}),(0,o.jsxs)(`div`,{children:[(0,o.jsx)(`div`,{style:{marginBottom:8,fontWeight:500},children:`Large (24px)`}),(0,o.jsx)(a,{title:`Large icon size`,iconProps:{style:{fontSize:24}}})]})]})},y={render:()=>(0,o.jsxs)(r,{direction:`row`,gap:`xl`,align:`center`,children:[(0,o.jsxs)(`div`,{children:[(0,o.jsx)(`div`,{style:{marginBottom:8,fontWeight:500},children:`Top (default)`}),(0,o.jsx)(a,{title:`Tooltip on top`,placement:`top`})]}),(0,o.jsxs)(`div`,{children:[(0,o.jsx)(`div`,{style:{marginBottom:8,fontWeight:500},children:`Right`}),(0,o.jsx)(a,{title:`Tooltip on right`,placement:`right`})]}),(0,o.jsxs)(`div`,{children:[(0,o.jsx)(`div`,{style:{marginBottom:8,fontWeight:500},children:`Bottom`}),(0,o.jsx)(a,{title:`Tooltip on bottom`,placement:`bottom`})]})]})},g.parameters={...g.parameters,docs:{...(s=g.parameters)==null?void 0:s.docs,source:{originalSource:`{
  name: 'Basic',
  args: {
    title: 'This field accepts a comma-separated list of IP ranges.'
  }
}`,...(c=g.parameters)==null||(c=c.docs)==null?void 0:c.source}}},_.parameters={..._.parameters,docs:{...(l=_.parameters)==null?void 0:l.docs,source:{originalSource:`{
  render: () => <BAIFlex gap="xxs" align="center">
      <span>Allowed Client IPs</span>
      <BAIQuestionIconWithTooltip title="Restrict access to the listed CIDR ranges. Leave empty to allow all." />
    </BAIFlex>
}`,...(u=_.parameters)==null||(u=u.docs)==null?void 0:u.source}}},v.parameters={...v.parameters,docs:{...(d=v.parameters)==null?void 0:d.docs,source:{originalSource:`{
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
}`,...(f=v.parameters)==null||(f=f.docs)==null?void 0:f.source}}},y.parameters={...y.parameters,docs:{...(p=y.parameters)==null?void 0:p.docs,source:{originalSource:`{
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
}`,...(m=y.parameters)==null||(m=m.docs)==null?void 0:m.source}}},b=[`Default`,`WithLabel`,`CustomIconSize`,`Placement`]})))()}x();export{v as CustomIconSize,g as Default,y as Placement,_ as WithLabel,b as __namedExportsOrder,h as default};