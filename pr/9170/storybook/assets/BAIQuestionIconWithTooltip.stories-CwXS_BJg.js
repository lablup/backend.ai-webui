import{j as t}from"./iframe-BWlzmNa6.js";import{B as r}from"./BAIFlex-B_FQZrg1.js";import{B as e}from"./BAIQuestionIconWithTooltip-BySOxokS.js";import"./preload-helper-Dp1pzeXC.js";import"./BAIIconWithTooltip-B75MgUgL.js";import"./astryxLabel-DyQ9bdy3.js";import"./astryxPlacement-BxR6_qos.js";import"./circle-question-mark-CCpB0Hhp.js";const z={title:"Tooltip/BAIQuestionIconWithTooltip",component:e,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:"\n**BAIQuestionIconWithTooltip** extends [Ant Design Tooltip](https://ant.design/components/tooltip) with a built-in help (question mark) icon.\n\nIt is typically placed next to a label, form field, or table column header to surface an explanatory hint on hover. The icon uses the `colorTextTertiary` token and a `help` cursor.\n\n## BAI-Specific Props\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `iconProps` | `React.ComponentProps<typeof CircleHelp>` | `undefined` | Props for the CircleHelp icon from `lucide-react` (e.g. `size`, `strokeWidth`, `style`). |\n\n**Note:** The `children` prop is omitted as the component provides its own icon.\n\nFor all other props, refer to [Ant Design Tooltip](https://ant.design/components/tooltip).\n        "}}},argTypes:{iconProps:{control:{type:"object"},description:"Props for the CircleHelp icon (lucide-react)",table:{type:{summary:"React.ComponentProps<typeof CircleHelp>"},defaultValue:{summary:"undefined"}}}}},o={name:"Basic",args:{title:"This field accepts a comma-separated list of IP ranges."}},i={render:()=>t.jsxs(r,{gap:"xxs",align:"center",children:[t.jsx("span",{children:"Allowed Client IPs"}),t.jsx(e,{title:"Restrict access to the listed CIDR ranges. Leave empty to allow all."})]})},n={render:()=>t.jsxs(r,{direction:"row",gap:"xl",align:"center",children:[t.jsxs("div",{children:[t.jsx("div",{style:{marginBottom:8,fontWeight:500},children:"Default size"}),t.jsx(e,{title:"Default icon size"})]}),t.jsxs("div",{children:[t.jsx("div",{style:{marginBottom:8,fontWeight:500},children:"Small (12px)"}),t.jsx(e,{title:"Small icon size",iconProps:{style:{fontSize:12}}})]}),t.jsxs("div",{children:[t.jsx("div",{style:{marginBottom:8,fontWeight:500},children:"Large (24px)"}),t.jsx(e,{title:"Large icon size",iconProps:{style:{fontSize:24}}})]})]})},s={render:()=>t.jsxs(r,{direction:"row",gap:"xl",align:"center",children:[t.jsxs("div",{children:[t.jsx("div",{style:{marginBottom:8,fontWeight:500},children:"Top (default)"}),t.jsx(e,{title:"Tooltip on top",placement:"top"})]}),t.jsxs("div",{children:[t.jsx("div",{style:{marginBottom:8,fontWeight:500},children:"Right"}),t.jsx(e,{title:"Tooltip on right",placement:"right"})]}),t.jsxs("div",{children:[t.jsx("div",{style:{marginBottom:8,fontWeight:500},children:"Bottom"}),t.jsx(e,{title:"Tooltip on bottom",placement:"bottom"})]})]})};var l,a,c;o.parameters={...o.parameters,docs:{...(l=o.parameters)==null?void 0:l.docs,source:{originalSource:`{
  name: 'Basic',
  args: {
    title: 'This field accepts a comma-separated list of IP ranges.'
  }
}`,...(c=(a=o.parameters)==null?void 0:a.docs)==null?void 0:c.source}}};var p,d,m;i.parameters={...i.parameters,docs:{...(p=i.parameters)==null?void 0:p.docs,source:{originalSource:`{
  render: () => <BAIFlex gap="xxs" align="center">
      <span>Allowed Client IPs</span>
      <BAIQuestionIconWithTooltip title="Restrict access to the listed CIDR ranges. Leave empty to allow all." />
    </BAIFlex>
}`,...(m=(d=i.parameters)==null?void 0:d.docs)==null?void 0:m.source}}};var h,g,u;n.parameters={...n.parameters,docs:{...(h=n.parameters)==null?void 0:h.docs,source:{originalSource:`{
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
}`,...(u=(g=n.parameters)==null?void 0:g.docs)==null?void 0:u.source}}};var x,f,v;s.parameters={...s.parameters,docs:{...(x=s.parameters)==null?void 0:x.docs,source:{originalSource:`{
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
}`,...(v=(f=s.parameters)==null?void 0:f.docs)==null?void 0:v.source}}};const S=["Default","WithLabel","CustomIconSize","Placement"];export{n as CustomIconSize,o as Default,s as Placement,i as WithLabel,S as __namedExportsOrder,z as default};
