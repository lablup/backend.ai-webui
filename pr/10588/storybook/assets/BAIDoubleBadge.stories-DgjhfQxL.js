import{n as e}from"./rolldown-runtime-2s6bX4vc.js";import{n as t,t as n}from"./BAIFlex-CAz1t6J5.js";import{n as r,t as i}from"./BAIDoubleBadge-BEAKtl8w.js";import{jsx as a,jsxs as o}from"react/jsx-runtime";var s,c,l,u,d;function f(){return(f=e((()=>{r(),t(),s={title:`Badge/BAIDoubleBadge`,component:i,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:`
**BAIDoubleBadge** welds Astryx Badges into one pill for a live pair the system
changes on its own (status + detail, label + ticker). For a settled pair use **BAIDoubleToken**.

\`\`\`tsx
<BAIDoubleBadge values={[{ label: 'ALIVE', variant: 'success' }, { label: '26.4.0', variant: 'success' }]} />
<BAIDoubleBadge values={['Elapsed time', '00:12:31']} />
\`\`\`
        `}}},argTypes:{values:{control:{type:`object`},description:"Segments as strings (all neutral) or `{ label, variant }` objects with an Astryx Badge variant",table:{type:{summary:`string[] | BAIDoubleBadgeValue[]`},defaultValue:{summary:`[]`}}}}},c={name:`Basic`,args:{values:[`Elapsed time`,`00:12:31`]}},l={render:()=>o(n,{direction:`column`,gap:`md`,align:`start`,children:[a(i,{values:[{label:`ALIVE`,variant:`success`},{label:`26.4.0`,variant:`success`}]}),a(i,{values:[{label:`RESTARTING`,variant:`warning`},{label:`26.4.0`,variant:`warning`}]}),a(i,{values:[{label:`ERROR`,variant:`error`},{label:`creation-failed`,variant:`error`}]})]})},u={args:{values:[]}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  name: 'Basic',
  args: {
    values: ['Elapsed time', '00:12:31']
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <BAIFlex direction="column" gap="md" align="start">
      <BAIDoubleBadge values={[{
      label: 'ALIVE',
      variant: 'success'
    }, {
      label: '26.4.0',
      variant: 'success'
    }]} />
      <BAIDoubleBadge values={[{
      label: 'RESTARTING',
      variant: 'warning'
    }, {
      label: '26.4.0',
      variant: 'warning'
    }]} />
      <BAIDoubleBadge values={[{
      label: 'ERROR',
      variant: 'error'
    }, {
      label: 'creation-failed',
      variant: 'error'
    }]} />
    </BAIFlex>
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    values: []
  }
}`,...u.parameters?.docs?.source}}},d=[`Default`,`Statuses`,`Empty`]})))()}f();export{c as Default,u as Empty,l as Statuses,d as __namedExportsOrder,s as default};