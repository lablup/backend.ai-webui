import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-MKhVqBIO.js";import{n,t as r}from"./BAIFlex-BOFoS5KY.js";import{n as i,t as a}from"./BAIDoubleBadge-Dhbgsyxd.js";var o,s,c,l,u,d;function f(){return(f=e((()=>{i(),n(),o=t(),s={title:`Badge/BAIDoubleBadge`,component:a,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:`
**BAIDoubleBadge** welds Astryx Badges into one pill for a live pair the system
changes on its own (status + detail, label + ticker). For a settled pair use **BAIDoubleToken**.

\`\`\`tsx
<BAIDoubleBadge values={[{ label: 'ALIVE', variant: 'success' }, { label: '26.4.0', variant: 'success' }]} />
<BAIDoubleBadge values={['Elapsed time', '00:12:31']} />
\`\`\`
        `}}},argTypes:{values:{control:{type:`object`},description:"Segments as strings (all neutral) or `{ label, variant }` objects with an Astryx Badge variant",table:{type:{summary:`string[] | BAIDoubleBadgeValue[]`},defaultValue:{summary:`[]`}}}}},c={name:`Basic`,args:{values:[`Elapsed time`,`00:12:31`]}},l={render:()=>(0,o.jsxs)(r,{direction:`column`,gap:`md`,align:`start`,children:[(0,o.jsx)(a,{values:[{label:`ALIVE`,variant:`success`},{label:`26.4.0`,variant:`success`}]}),(0,o.jsx)(a,{values:[{label:`RESTARTING`,variant:`warning`},{label:`26.4.0`,variant:`warning`}]}),(0,o.jsx)(a,{values:[{label:`ERROR`,variant:`error`},{label:`creation-failed`,variant:`error`}]})]})},u={args:{values:[]}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
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