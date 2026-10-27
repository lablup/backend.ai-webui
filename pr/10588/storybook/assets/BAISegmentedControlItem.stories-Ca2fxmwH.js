import{n as e}from"./rolldown-runtime-2s6bX4vc.js";import{n as t,t as n}from"./createLucideIcon-CRb7bAU8.js";import{n as r,t as i}from"./BAIQuestionIconWithTooltip-W14m4lZB.js";import{i as a,n as o,r as s,t as c}from"./BAISegmentedControl-BHWkOXgz.js";import{useState as l}from"react";import{jsx as u,jsxs as d}from"react/jsx-runtime";var f,p;function m(){return(m=e((()=>{t(),f=[[`rect`,{width:`7`,height:`7`,x:`3`,y:`3`,rx:`1`,key:`1g98yp`}],[`rect`,{width:`7`,height:`7`,x:`14`,y:`3`,rx:`1`,key:`6d4xhi`}],[`rect`,{width:`7`,height:`7`,x:`14`,y:`14`,rx:`1`,key:`nxv5o0`}],[`rect`,{width:`7`,height:`7`,x:`3`,y:`14`,rx:`1`,key:`1bb6yr`}]],p=n(`layout-grid`,f)})))()}var h,g;function _(){return(_=e((()=>{t(),h=[[`path`,{d:`M3 5h.01`,key:`18ugdj`}],[`path`,{d:`M3 12h.01`,key:`nlz23k`}],[`path`,{d:`M3 19h.01`,key:`noohij`}],[`path`,{d:`M8 5h13`,key:`1pao27`}],[`path`,{d:`M8 12h13`,key:`1za7za`}],[`path`,{d:`M8 19h13`,key:`m83p4d`}]],g=n(`list`,h)})))()}var v,y,b,x,S;function C(){return(C=e((()=>{r(),o(),a(),m(),_(),v={title:`Input/BAISegmentedControlItem`,component:s,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:'\n**BAISegmentedControlItem** is one segment of `BAISegmentedControl`.\n\n## Features\n- `label` accepts a ReactNode, rendered as the segment\'s content\n- `isLabelHidden` hides a **string** label visually and keeps it as the accessible name (icon-only segments)\n- Other props (`value`, `icon`, `isDisabled`, …) pass through unchanged\n\n## Usage\n```tsx\n<BAISegmentedControl aria-label="View" value={view} onChange={setView}>\n  <BAISegmentedControlItem value="list" label="List" isLabelHidden icon={<ListIcon />} />\n  <BAISegmentedControlItem value="grid" label="Grid" isLabelHidden icon={<LayoutGridIcon />} />\n</BAISegmentedControl>\n```\n\n## Props\n| Name | Type | Default | Description |\n|------|------|---------|-------------|\n| label | `ReactNode` (`string` with `isLabelHidden`) | - | Segment content, or its accessible name when hidden |\n| isLabelHidden | `boolean` | `false` | Hide a string label visually |\n| value | `string` | - | The value the segment selects |\n        '}}},argTypes:{label:{control:!1,description:`Segment content.`},isLabelHidden:{control:!1,description:`Hides a string label visually.`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}}},args:{value:`list`,label:`List`}},y={name:`Basic`,parameters:{docs:{description:{story:`Text segments.`}}},render:()=>{let[e,t]=l(`single-node`);return d(c,{"aria-label":`Cluster mode`,value:e,onChange:t,children:[u(s,{value:`single-node`,label:`Single node`}),u(s,{value:`multi-node`,label:`Multi node`})]})}},b={name:`NodeLabel`,parameters:{docs:{description:{story:`A node label: text with a non-focusable help tooltip.`}}},render:()=>{let[e,t]=l(`single-node`);return d(c,{"aria-label":`Cluster mode`,value:e,onChange:t,children:[u(s,{value:`single-node`,label:d(`span`,{children:[`Single node`,` `,u(i,{title:`All containers on one agent.`,focusable:!1})]})}),u(s,{value:`multi-node`,label:`Multi node`})]})}},x={name:`IconOnly`,parameters:{docs:{description:{story:"Icon-only segments: `isLabelHidden` with a string label keeps the accessible name."}}},render:()=>{let[e,t]=l(`list`);return d(c,{"aria-label":`View`,value:e,onChange:t,children:[u(s,{value:`list`,label:`List`,isLabelHidden:!0,icon:u(g,{})}),u(s,{value:`grid`,label:`Grid`,isLabelHidden:!0,icon:u(p,{})})]})}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'Text segments.'
      }
    }
  },
  render: () => {
    const [value, setValue] = useState('single-node');
    return <BAISegmentedControl aria-label="Cluster mode" value={value} onChange={setValue}>
        <BAISegmentedControlItem value="single-node" label="Single node" />
        <BAISegmentedControlItem value="multi-node" label="Multi node" />
      </BAISegmentedControl>;
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  name: 'NodeLabel',
  parameters: {
    docs: {
      description: {
        story: 'A node label: text with a non-focusable help tooltip.'
      }
    }
  },
  render: () => {
    const [value, setValue] = useState('single-node');
    return <BAISegmentedControl aria-label="Cluster mode" value={value} onChange={setValue}>
        <BAISegmentedControlItem value="single-node" label={<span>
              Single node{' '}
              <BAIQuestionIconWithTooltip title="All containers on one agent." focusable={false} />
            </span>} />
        <BAISegmentedControlItem value="multi-node" label="Multi node" />
      </BAISegmentedControl>;
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  name: 'IconOnly',
  parameters: {
    docs: {
      description: {
        story: 'Icon-only segments: \`isLabelHidden\` with a string label keeps the accessible name.'
      }
    }
  },
  render: () => {
    const [value, setValue] = useState('list');
    return <BAISegmentedControl aria-label="View" value={value} onChange={setValue}>
        <BAISegmentedControlItem value="list" label="List" isLabelHidden icon={<ListIcon />} />
        <BAISegmentedControlItem value="grid" label="Grid" isLabelHidden icon={<LayoutGridIcon />} />
      </BAISegmentedControl>;
  }
}`,...x.parameters?.docs?.source}}},S=[`Default`,`WithTooltipLabel`,`IconOnly`]})))()}C();export{y as Default,x as IconOnly,b as WithTooltipLabel,S as __namedExportsOrder,v as default};