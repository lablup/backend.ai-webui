import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-MKhVqBIO.js";import{n,t as r}from"./BAIFlex-BOFoS5KY.js";import{n as i,t as a}from"./BAIDoubleBadge-D20hnkmt.js";var o,s,c,l,u,d,f,p,m,h,g,_;function v(){return(v=e((()=>{i(),n(),o=t(),p={title:`Badge/BAIDoubleBadge`,component:a,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:`
**BAIDoubleBadge** welds Astryx Badges into one pill for a live pair the system
changes on its own (status + detail, label + ticker). For a settled pair use **BAIDoubleToken**.

\`\`\`tsx
<BAIDoubleBadge values={[{ label: 'ALIVE', variant: 'success' }, { label: '26.4.0', variant: 'success' }]} />
<BAIDoubleBadge values={['Elapsed time', '00:12:31']} />
\`\`\`
        `}}},argTypes:{values:{control:{type:`object`},description:"Segments as strings (all neutral) or `{ label, variant }` objects with an Astryx Badge variant",table:{type:{summary:`string[] | BAIDoubleBadgeValue[]`},defaultValue:{summary:`[]`}}}}},m={name:`Basic`,args:{values:[`Elapsed time`,`00:12:31`]}},h={render:()=>(0,o.jsxs)(r,{direction:`column`,gap:`md`,align:`start`,children:[(0,o.jsx)(a,{values:[{label:`ALIVE`,variant:`success`},{label:`26.4.0`,variant:`success`}]}),(0,o.jsx)(a,{values:[{label:`RESTARTING`,variant:`warning`},{label:`26.4.0`,variant:`warning`}]}),(0,o.jsx)(a,{values:[{label:`ERROR`,variant:`error`},{label:`creation-failed`,variant:`error`}]})]})},g={args:{values:[]}},m.parameters={...m.parameters,docs:{...(s=m.parameters)==null?void 0:s.docs,source:{originalSource:`{
  name: 'Basic',
  args: {
    values: ['Elapsed time', '00:12:31']
  }
}`,...(c=m.parameters)==null||(c=c.docs)==null?void 0:c.source}}},h.parameters={...h.parameters,docs:{...(l=h.parameters)==null?void 0:l.docs,source:{originalSource:`{
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
}`,...(u=h.parameters)==null||(u=u.docs)==null?void 0:u.source}}},g.parameters={...g.parameters,docs:{...(d=g.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    values: []
  }
}`,...(f=g.parameters)==null||(f=f.docs)==null?void 0:f.source}}},_=[`Default`,`Statuses`,`Empty`]})))()}v();export{m as Default,g as Empty,h as Statuses,_ as __namedExportsOrder,p as default};