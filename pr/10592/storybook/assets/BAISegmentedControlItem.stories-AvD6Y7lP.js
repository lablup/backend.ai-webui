import{b as y,r,j as e}from"./iframe-BlOeMF2f.js";import{B as v}from"./BAIQuestionIconWithTooltip-DcNbyr8a.js";import{B as t,a as i}from"./BAISegmentedControlItem-Cipz7gSI.js";import"./preload-helper-Dp1pzeXC.js";import"./astryxPlacement-BxR6_qos.js";import"./BAIIconWithTooltip-BScYRTw-.js";import"./IconWithTooltip2-C-e7Wh0z.js";import"./formControl-BGHZKXHj.js";import"./FormLayoutContext-Buf73Sv7.js";import"./compiled-D_YGP6zo.js";import"./useListFocus-Ci7g5B37.js";import"./isRtlElement-B2-7SF8s.js";import"./useKeyboardHint-Des7n8vP.js";import"./composeEventHandlers-BolWE7qY.js";/**
 * @license lucide-react v1.37.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const S=[["rect",{width:"7",height:"7",x:"3",y:"3",rx:"1",key:"1g98yp"}],["rect",{width:"7",height:"7",x:"14",y:"3",rx:"1",key:"6d4xhi"}],["rect",{width:"7",height:"7",x:"14",y:"14",rx:"1",key:"nxv5o0"}],["rect",{width:"7",height:"7",x:"3",y:"14",rx:"1",key:"1bb6yr"}]],x=y("layout-grid",S);/**
 * @license lucide-react v1.37.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const C=[["path",{d:"M3 5h.01",key:"18ugdj"}],["path",{d:"M3 12h.01",key:"nlz23k"}],["path",{d:"M3 19h.01",key:"noohij"}],["path",{d:"M8 5h13",key:"1pao27"}],["path",{d:"M8 12h13",key:"1za7za"}],["path",{d:"M8 19h13",key:"m83p4d"}]],L=y("list",C),D={title:"Input/BAISegmentedControlItem",component:t,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:'\n**BAISegmentedControlItem** is one segment of `BAISegmentedControl`.\n\n## Features\n- `label` accepts a ReactNode, rendered as the segment\'s content\n- `isLabelHidden` hides a **string** label visually and keeps it as the accessible name (icon-only segments)\n- Other props (`value`, `icon`, `isDisabled`, …) pass through unchanged\n\n## Usage\n```tsx\n<BAISegmentedControl aria-label="View" value={view} onChange={setView}>\n  <BAISegmentedControlItem value="list" label="List" isLabelHidden icon={<ListIcon />} />\n  <BAISegmentedControlItem value="grid" label="Grid" isLabelHidden icon={<LayoutGridIcon />} />\n</BAISegmentedControl>\n```\n\n## Props\n| Name | Type | Default | Description |\n|------|------|---------|-------------|\n| label | `ReactNode` (`string` with `isLabelHidden`) | - | Segment content, or its accessible name when hidden |\n| isLabelHidden | `boolean` | `false` | Hide a string label visually |\n| value | `string` | - | The value the segment selects |\n        '}}},argTypes:{label:{control:!1,description:"Segment content."},isLabelHidden:{control:!1,description:"Hides a string label visually.",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}}},args:{value:"list",label:"List"}},o={name:"Basic",parameters:{docs:{description:{story:"Text segments."}}},render:()=>{const[a,n]=r.useState("single-node");return e.jsxs(i,{"aria-label":"Cluster mode",value:a,onChange:n,children:[e.jsx(t,{value:"single-node",label:"Single node"}),e.jsx(t,{value:"multi-node",label:"Multi node"})]})}},l={name:"NodeLabel",parameters:{docs:{description:{story:"A node label: text with a non-focusable help tooltip."}}},render:()=>{const[a,n]=r.useState("single-node");return e.jsxs(i,{"aria-label":"Cluster mode",value:a,onChange:n,children:[e.jsx(t,{value:"single-node",label:e.jsxs("span",{children:["Single node"," ",e.jsx(v,{title:"All containers on one agent.",focusable:!1})]})}),e.jsx(t,{value:"multi-node",label:"Multi node"})]})}},s={name:"IconOnly",parameters:{docs:{description:{story:"Icon-only segments: `isLabelHidden` with a string label keeps the accessible name."}}},render:()=>{const[a,n]=r.useState("list");return e.jsxs(i,{"aria-label":"View",value:a,onChange:n,children:[e.jsx(t,{value:"list",label:"List",isLabelHidden:!0,icon:e.jsx(L,{})}),e.jsx(t,{value:"grid",label:"Grid",isLabelHidden:!0,icon:e.jsx(x,{})})]})}};var d,c,m;o.parameters={...o.parameters,docs:{...(d=o.parameters)==null?void 0:d.docs,source:{originalSource:`{
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
}`,...(m=(c=o.parameters)==null?void 0:c.docs)==null?void 0:m.source}}};var u,p,g;l.parameters={...l.parameters,docs:{...(u=l.parameters)==null?void 0:u.docs,source:{originalSource:`{
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
}`,...(g=(p=l.parameters)==null?void 0:p.docs)==null?void 0:g.source}}};var b,h,I;s.parameters={...s.parameters,docs:{...(b=s.parameters)==null?void 0:b.docs,source:{originalSource:`{
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
}`,...(I=(h=s.parameters)==null?void 0:h.docs)==null?void 0:I.source}}};const W=["Default","WithTooltipLabel","IconOnly"];export{o as Default,s as IconOnly,l as WithTooltipLabel,W as __namedExportsOrder,D as default};
