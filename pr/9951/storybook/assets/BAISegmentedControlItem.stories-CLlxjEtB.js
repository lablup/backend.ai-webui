import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-DlPsW1c0.js";import{t as n}from"./jsx-runtime-MKhVqBIO.js";import{n as r,t as i}from"./createLucideIcon-DF5UGKo-.js";import{n as a,t as o}from"./BAIQuestionIconWithTooltip-Bp6GouaJ.js";import{i as s,n as c,r as l,t as u}from"./BAISegmentedControlItem-DpyvqZyv.js";var d,f;function p(){return(p=e((()=>{r(),d=[[`rect`,{width:`7`,height:`7`,x:`3`,y:`3`,rx:`1`,key:`1g98yp`}],[`rect`,{width:`7`,height:`7`,x:`14`,y:`3`,rx:`1`,key:`6d4xhi`}],[`rect`,{width:`7`,height:`7`,x:`14`,y:`14`,rx:`1`,key:`nxv5o0`}],[`rect`,{width:`7`,height:`7`,x:`3`,y:`14`,rx:`1`,key:`1bb6yr`}]],f=i(`layout-grid`,d)})))()}var m,h;function g(){return(g=e((()=>{r(),m=[[`path`,{d:`M3 5h.01`,key:`18ugdj`}],[`path`,{d:`M3 12h.01`,key:`nlz23k`}],[`path`,{d:`M3 19h.01`,key:`noohij`}],[`path`,{d:`M8 5h13`,key:`1pao27`}],[`path`,{d:`M8 12h13`,key:`1za7za`}],[`path`,{d:`M8 19h13`,key:`m83p4d`}]],h=i(`list`,m)})))()}var _,v,y,b,x,S,C,w,T,E,D,O,k;function A(){return(A=e((()=>{a(),s(),c(),p(),g(),_=t(),v=n(),T={title:`Input/BAISegmentedControlItem`,component:u,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:'\n**BAISegmentedControlItem** is one segment of `BAISegmentedControl`.\n\n## Features\n- `label` accepts a ReactNode, rendered as the segment\'s content\n- `isLabelHidden` hides a **string** label visually and keeps it as the accessible name (icon-only segments)\n- Other props (`value`, `icon`, `isDisabled`, …) pass through unchanged\n\n## Usage\n```tsx\n<BAISegmentedControl aria-label="View" value={view} onChange={setView}>\n  <BAISegmentedControlItem value="list" label="List" isLabelHidden icon={<ListIcon />} />\n  <BAISegmentedControlItem value="grid" label="Grid" isLabelHidden icon={<LayoutGridIcon />} />\n</BAISegmentedControl>\n```\n\n## Props\n| Name | Type | Default | Description |\n|------|------|---------|-------------|\n| label | `ReactNode` (`string` with `isLabelHidden`) | - | Segment content, or its accessible name when hidden |\n| isLabelHidden | `boolean` | `false` | Hide a string label visually |\n| value | `string` | - | The value the segment selects |\n        '}}},argTypes:{label:{control:!1,description:`Segment content.`},isLabelHidden:{control:!1,description:`Hides a string label visually.`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}}},args:{value:`list`,label:`List`}},E={name:`Basic`,parameters:{docs:{description:{story:`Text segments.`}}},render:()=>{let[e,t]=(0,_.useState)(`single-node`);return(0,v.jsxs)(l,{"aria-label":`Cluster mode`,value:e,onChange:t,children:[(0,v.jsx)(u,{value:`single-node`,label:`Single node`}),(0,v.jsx)(u,{value:`multi-node`,label:`Multi node`})]})}},D={name:`NodeLabel`,parameters:{docs:{description:{story:`A node label: text with a non-focusable help tooltip.`}}},render:()=>{let[e,t]=(0,_.useState)(`single-node`);return(0,v.jsxs)(l,{"aria-label":`Cluster mode`,value:e,onChange:t,children:[(0,v.jsx)(u,{value:`single-node`,label:(0,v.jsxs)(`span`,{children:[`Single node`,` `,(0,v.jsx)(o,{title:`All containers on one agent.`,focusable:!1})]})}),(0,v.jsx)(u,{value:`multi-node`,label:`Multi node`})]})}},O={name:`IconOnly`,parameters:{docs:{description:{story:"Icon-only segments: `isLabelHidden` with a string label keeps the accessible name."}}},render:()=>{let[e,t]=(0,_.useState)(`list`);return(0,v.jsxs)(l,{"aria-label":`View`,value:e,onChange:t,children:[(0,v.jsx)(u,{value:`list`,label:`List`,isLabelHidden:!0,icon:(0,v.jsx)(h,{})}),(0,v.jsx)(u,{value:`grid`,label:`Grid`,isLabelHidden:!0,icon:(0,v.jsx)(f,{})})]})}},E.parameters={...E.parameters,docs:{...(y=E.parameters)==null?void 0:y.docs,source:{originalSource:`{
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
}`,...(b=E.parameters)==null||(b=b.docs)==null?void 0:b.source}}},D.parameters={...D.parameters,docs:{...(x=D.parameters)==null?void 0:x.docs,source:{originalSource:`{
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
}`,...(S=D.parameters)==null||(S=S.docs)==null?void 0:S.source}}},O.parameters={...O.parameters,docs:{...(C=O.parameters)==null?void 0:C.docs,source:{originalSource:`{
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
}`,...(w=O.parameters)==null||(w=w.docs)==null?void 0:w.source}}},k=[`Default`,`WithTooltipLabel`,`IconOnly`]})))()}A();export{E as Default,O as IconOnly,D as WithTooltipLabel,k as __namedExportsOrder,T as default};