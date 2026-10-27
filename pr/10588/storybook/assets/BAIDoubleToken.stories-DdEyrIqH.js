import{n as e}from"./rolldown-runtime-2s6bX4vc.js";import{n as t,t as n}from"./BAIFlex-CAz1t6J5.js";import{n as r,t as i}from"./BAIDoubleToken-CiIWtXg6.js";import{jsx as a,jsxs as o}from"react/jsx-runtime";var s,c,l,u,d,f,p,m;function h(){return(h=e((()=>{r(),t(),s={title:`Token/BAIDoubleToken`,component:i,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:`
**BAIDoubleToken** welds Astryx Tokens into one pill for a settled key/value fact
(image tag, location/platform, permission letters). For a live pair use **BAIDoubleBadge**.

\`\`\`tsx
<BAIDoubleToken values={['Python', '3.11']} />
<BAIDoubleToken values={[{ label: 'R', color: 'green' }, { label: 'W', color: 'blue' }]} />
<BAIDoubleToken values={['Python', '3.11']} highlightKeyword="py" />
\`\`\`
        `}}},argTypes:{values:{control:{type:`object`},description:"Segments as strings (all blue) or `{ label, color }` objects with an Astryx Token color",table:{type:{summary:`string[] | BAIDoubleTokenValue[]`},defaultValue:{summary:`[]`}}},highlightKeyword:{control:{type:`text`},description:`Keyword to highlight within segment labels`,table:{type:{summary:`string`}}}}},c={name:`Basic`,args:{values:[`python`,`3.11`]}},l={args:{values:[{label:`R`,color:`green`},{label:`W`,color:`blue`},{label:`D`,color:`red`}]}},u={args:{values:[`tensorflow`,`2.12`],highlightKeyword:`tensor`}},d={args:{values:[{label:`Project`,color:`blue`},{label:`01a0c2f9-4e84-7f7c-a9b5-f24958a5f8fa`,color:`default`,copyable:!0}]}},f={render:()=>o(n,{direction:`column`,gap:`md`,align:`start`,children:[a(i,{values:[{label:`aws`,color:`orange`},{label:`ap-northeast-2`,color:`orange`}]}),a(i,{values:[{label:`Backend`,color:`default`},{label:`cephfs`,color:`blue`}]}),a(i,{values:[{label:`Customized`,color:`cyan`},{label:`my-image`,color:`cyan`}]})]})},p={args:{values:[]}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  name: 'Basic',
  args: {
    values: ['python', '3.11']
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    values: [{
      label: 'R',
      color: 'green'
    }, {
      label: 'W',
      color: 'blue'
    }, {
      label: 'D',
      color: 'red'
    }]
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    values: ['tensorflow', '2.12'],
    highlightKeyword: 'tensor'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    values: [{
      label: 'Project',
      color: 'blue'
    }, {
      label: '01a0c2f9-4e84-7f7c-a9b5-f24958a5f8fa',
      color: 'default',
      copyable: true
    }]
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => <BAIFlex direction="column" gap="md" align="start">
      <BAIDoubleToken values={[{
      label: 'aws',
      color: 'orange'
    }, {
      label: 'ap-northeast-2',
      color: 'orange'
    }]} />
      <BAIDoubleToken values={[{
      label: 'Backend',
      color: 'default'
    }, {
      label: 'cephfs',
      color: 'blue'
    }]} />
      <BAIDoubleToken values={[{
      label: 'Customized',
      color: 'cyan'
    }, {
      label: 'my-image',
      color: 'cyan'
    }]} />
    </BAIFlex>
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    values: []
  }
}`,...p.parameters?.docs?.source}}},m=[`Default`,`ObjectValues`,`WithHighlight`,`Copyable`,`Colors`,`Empty`]})))()}h();export{f as Colors,d as Copyable,c as Default,p as Empty,l as ObjectValues,u as WithHighlight,m as __namedExportsOrder,s as default};