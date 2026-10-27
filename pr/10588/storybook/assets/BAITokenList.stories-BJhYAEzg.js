import{n as e}from"./rolldown-runtime-2s6bX4vc.js";import{TokenList as t}from"@lablup/ui-common/components/TokenList";var n;function r(){return(r=e((()=>{n=t})))()}var i,a,o,s,c,l,u,d;function f(){return(f=e((()=>{r(),i={title:`Token/BAITokenList`,component:n,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:'Shows up to `maxInline` items inline and collapses the rest into a `+N` overflow indicator, whose popup lists only the hidden items. The overflow opens on hover in both variants; `variant="token"` (default) shows a `+N` link for modals, `variant="text"` a compact `+N` badge for table cells. Pass `trigger="click"` for a popover that latches open.'}}},argTypes:{variant:{control:{type:`radio`},options:[`token`,`text`]},trigger:{control:{type:`radio`},options:[`click`,`hover`]},maxInline:{control:{type:`number`,min:0}}}},a={args:{items:[`alpha`,`beta`,`gamma`,`delta`,`epsilon`]}},o={name:`Text variant (table cell)`,args:{variant:`text`,maxInline:1,items:[`10.0.0.1`,`10.0.0.2`,`10.0.0.3`,`10.0.0.4`]}},s={name:`Text variant (numbers)`,args:{variant:`text`,maxInline:1,items:[1e3,1001,1002,1003]}},c={name:`Text variant (click popover)`,args:{variant:`text`,maxInline:1,trigger:`click`,items:[`10.0.0.1`,`10.0.0.2`,`10.0.0.3`,`10.0.0.4`]}},l={name:`Single item (no +N)`,args:{variant:`text`,maxInline:1,items:[`10.0.0.1`]}},u={name:`Empty (placeholder)`,args:{items:[]}},a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    items: ['alpha', 'beta', 'gamma', 'delta', 'epsilon']
  }
}`,...a.parameters?.docs?.source}}},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  name: 'Text variant (table cell)',
  args: {
    variant: 'text',
    maxInline: 1,
    items: ['10.0.0.1', '10.0.0.2', '10.0.0.3', '10.0.0.4']
  }
}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  name: 'Text variant (numbers)',
  args: {
    variant: 'text',
    maxInline: 1,
    items: [1000, 1001, 1002, 1003]
  }
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  name: 'Text variant (click popover)',
  args: {
    variant: 'text',
    maxInline: 1,
    trigger: 'click',
    items: ['10.0.0.1', '10.0.0.2', '10.0.0.3', '10.0.0.4']
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  name: 'Single item (no +N)',
  args: {
    variant: 'text',
    maxInline: 1,
    items: ['10.0.0.1']
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  name: 'Empty (placeholder)',
  args: {
    items: []
  }
}`,...u.parameters?.docs?.source}}},d=[`Default`,`TextVariant`,`TextVariantNumbers`,`TextVariantClickTrigger`,`SingleItem`,`Empty`]})))()}f();export{a as Default,u as Empty,l as SingleItem,o as TextVariant,c as TextVariantClickTrigger,s as TextVariantNumbers,d as __namedExportsOrder,i as default};