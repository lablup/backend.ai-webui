import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-MKhVqBIO.js";import{n,t as r}from"./BAISelectionLabel-Ddk5hiR3.js";var i,a,o,s,c,l,u,d,f,p,m,h,g;function _(){return(_=e((()=>{n(),i=t(),{action:d}=__STORYBOOK_MODULE_ACTIONS__,f={title:`DataDisplay/BAISelectionLabel`,component:r,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:"\n**BAISelectionLabel** displays the number of selected items with an optional clear-all button.\n\n## Props\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `count` | `number` | — | Number of selected items. Renders nothing when `count <= 0`. |\n| `onClearSelection` | `() => void` | — | Callback when the clear icon is clicked. Icon is hidden when omitted. |\n        "}}},argTypes:{count:{control:{type:`number`,min:0,max:100},description:`Number of selected items. Renders nothing when 0.`,table:{type:{summary:`number`}}},onClearSelection:{description:`Callback fired when the clear icon is clicked. Icon is hidden when omitted.`,table:{type:{summary:`() => void`}}}}},p={name:`Basic`,args:{count:3,onClearSelection:d(`onClearSelection`)}},m={parameters:{docs:{description:{story:"When `onClearSelection` is not provided, the clear icon is hidden."}}},args:{count:5}},h={parameters:{docs:{description:{story:`Side-by-side comparison: with and without the clear button, and different counts.`}}},render:()=>(0,i.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:16},children:[(0,i.jsx)(r,{count:1,onClearSelection:d(`clear-1`)}),(0,i.jsx)(r,{count:10,onClearSelection:d(`clear-10`)}),(0,i.jsx)(r,{count:99,onClearSelection:d(`clear-99`)}),(0,i.jsx)(r,{count:5}),(0,i.jsx)(r,{count:0,onClearSelection:d(`clear-0`)})]})},p.parameters={...p.parameters,docs:{...(a=p.parameters)==null?void 0:a.docs,source:{originalSource:`{
  name: 'Basic',
  args: {
    count: 3,
    onClearSelection: action('onClearSelection')
  }
}`,...(o=p.parameters)==null||(o=o.docs)==null?void 0:o.source}}},m.parameters={...m.parameters,docs:{...(s=m.parameters)==null?void 0:s.docs,source:{originalSource:`{
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
}`,...(c=m.parameters)==null||(c=c.docs)==null?void 0:c.source}}},h.parameters={...h.parameters,docs:{...(l=h.parameters)==null?void 0:l.docs,source:{originalSource:`{
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
}`,...(u=h.parameters)==null||(u=u.docs)==null?void 0:u.source}}},g=[`Default`,`WithoutClearButton`,`Comparison`]})))()}_();export{h as Comparison,p as Default,m as WithoutClearButton,g as __namedExportsOrder,f as default};