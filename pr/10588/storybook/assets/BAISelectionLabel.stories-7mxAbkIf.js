import{n as e}from"./rolldown-runtime-2s6bX4vc.js";import{n as t,t as n}from"./BAISelectionLabel-M8xlEdaS.js";import{jsx as r,jsxs as i}from"react/jsx-runtime";var a,o,s,c,l,u;function d(){return(d=e((()=>{t(),{action:a}=__STORYBOOK_MODULE_ACTIONS__,o={title:`DataDisplay/BAISelectionLabel`,component:n,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:"\n**BAISelectionLabel** displays the number of selected items with an optional clear-all button.\n\n## Props\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `count` | `number` | — | Number of selected items. Renders nothing when `count <= 0`. |\n| `onClearSelection` | `() => void` | — | Callback when the clear icon is clicked. Icon is hidden when omitted. |\n        "}}},argTypes:{count:{control:{type:`number`,min:0,max:100},description:`Number of selected items. Renders nothing when 0.`,table:{type:{summary:`number`}}},onClearSelection:{description:`Callback fired when the clear icon is clicked. Icon is hidden when omitted.`,table:{type:{summary:`() => void`}}}}},s={name:`Basic`,args:{count:3,onClearSelection:a(`onClearSelection`)}},c={parameters:{docs:{description:{story:"When `onClearSelection` is not provided, the clear icon is hidden."}}},args:{count:5}},l={parameters:{docs:{description:{story:`Side-by-side comparison: with and without the clear button, and different counts.`}}},render:()=>i(`div`,{style:{display:`flex`,flexDirection:`column`,gap:16},children:[r(n,{count:1,onClearSelection:a(`clear-1`)}),r(n,{count:10,onClearSelection:a(`clear-10`)}),r(n,{count:99,onClearSelection:a(`clear-99`)}),r(n,{count:5}),r(n,{count:0,onClearSelection:a(`clear-0`)})]})},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  name: 'Basic',
  args: {
    count: 3,
    onClearSelection: action('onClearSelection')
  }
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
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
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
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
}`,...l.parameters?.docs?.source}}},u=[`Default`,`WithoutClearButton`,`Comparison`]})))()}d();export{l as Comparison,s as Default,c as WithoutClearButton,u as __namedExportsOrder,o as default};