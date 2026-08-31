import{j as e}from"./iframe-9OD98yqE.js";import{B as n}from"./BAISelectionLabel-DMBqnsfs.js";import"./preload-helper-Dp1pzeXC.js";const{action:o}=__STORYBOOK_MODULE_ACTIONS__,y={title:"DataDisplay/BAISelectionLabel",component:n,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:"\n**BAISelectionLabel** displays the number of selected items with an optional clear-all button.\n\n## Props\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `count` | `number` | — | Number of selected items. Renders nothing when `count <= 0`. |\n| `onClearSelection` | `() => void` | — | Callback when the clear icon is clicked. Icon is hidden when omitted. |\n        "}}},argTypes:{count:{control:{type:"number",min:0,max:100},description:"Number of selected items. Renders nothing when 0.",table:{type:{summary:"number"}}},onClearSelection:{description:"Callback fired when the clear icon is clicked. Icon is hidden when omitted.",table:{type:{summary:"() => void"}}}}},t={name:"Basic",args:{count:3,onClearSelection:o("onClearSelection")}},r={parameters:{docs:{description:{story:"When `onClearSelection` is not provided, the clear icon is hidden."}}},args:{count:5}},a={parameters:{docs:{description:{story:"Side-by-side comparison: with and without the clear button, and different counts."}}},render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:16},children:[e.jsx(n,{count:1,onClearSelection:o("clear-1")}),e.jsx(n,{count:10,onClearSelection:o("clear-10")}),e.jsx(n,{count:99,onClearSelection:o("clear-99")}),e.jsx(n,{count:5}),e.jsx(n,{count:0,onClearSelection:o("clear-0")})]})};var c,i,s;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
  name: 'Basic',
  args: {
    count: 3,
    onClearSelection: action('onClearSelection')
  }
}`,...(s=(i=t.parameters)==null?void 0:i.docs)==null?void 0:s.source}}};var l,d,p;r.parameters={...r.parameters,docs:{...(l=r.parameters)==null?void 0:l.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'When \`onClearSelection\` is not provided, the clear icon is hidden.'
      }
    }
  },
  args: {
    count: 5
  }
}`,...(p=(d=r.parameters)==null?void 0:d.docs)==null?void 0:p.source}}};var u,m,S;a.parameters={...a.parameters,docs:{...(u=a.parameters)==null?void 0:u.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Side-by-side comparison: with and without the clear button, and different counts.'
      }
    }
  },
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: 16
  }}>
      <BAISelectionLabel count={1} onClearSelection={action('clear-1')} />
      <BAISelectionLabel count={10} onClearSelection={action('clear-10')} />
      <BAISelectionLabel count={99} onClearSelection={action('clear-99')} />
      <BAISelectionLabel count={5} />
      <BAISelectionLabel count={0} onClearSelection={action('clear-0')} />
    </div>
}`,...(S=(m=a.parameters)==null?void 0:m.docs)==null?void 0:S.source}}};const f=["Default","WithoutClearButton","Comparison"];export{a as Comparison,t as Default,r as WithoutClearButton,f as __namedExportsOrder,y as default};
