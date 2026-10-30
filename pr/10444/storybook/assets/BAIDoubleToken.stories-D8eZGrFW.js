import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-MKhVqBIO.js";import{n,t as r}from"./BAIFlex-DnaoYTJ1.js";import{n as i,t as a}from"./BAIDoubleToken-D5OmMDvr.js";var o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E;function D(){return(D=e((()=>{i(),n(),o=t(),y={title:`Token/BAIDoubleToken`,component:a,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:`
**BAIDoubleToken** welds Astryx Tokens into one pill for a settled key/value fact
(image tag, location/platform, permission letters). For a live pair use **BAIDoubleBadge**.

\`\`\`tsx
<BAIDoubleToken values={['Python', '3.11']} />
<BAIDoubleToken values={[{ label: 'R', color: 'green' }, { label: 'W', color: 'blue' }]} />
<BAIDoubleToken values={['Python', '3.11']} highlightKeyword="py" />
\`\`\`
        `}}},argTypes:{values:{control:{type:`object`},description:"Segments as strings (all blue) or `{ label, color }` objects with an Astryx Token color",table:{type:{summary:`string[] | BAIDoubleTokenValue[]`},defaultValue:{summary:`[]`}}},highlightKeyword:{control:{type:`text`},description:`Keyword to highlight within segment labels`,table:{type:{summary:`string`}}}}},b={name:`Basic`,args:{values:[`python`,`3.11`]}},x={args:{values:[{label:`R`,color:`green`},{label:`W`,color:`blue`},{label:`D`,color:`red`}]}},S={args:{values:[`tensorflow`,`2.12`],highlightKeyword:`tensor`}},C={args:{values:[{label:`Project`,color:`blue`},{label:`01a0c2f9-4e84-7f7c-a9b5-f24958a5f8fa`,color:`default`,copyable:!0}]}},w={render:()=>(0,o.jsxs)(r,{direction:`column`,gap:`md`,align:`start`,children:[(0,o.jsx)(a,{values:[{label:`aws`,color:`orange`},{label:`ap-northeast-2`,color:`orange`}]}),(0,o.jsx)(a,{values:[{label:`Backend`,color:`default`},{label:`cephfs`,color:`blue`}]}),(0,o.jsx)(a,{values:[{label:`Customized`,color:`cyan`},{label:`my-image`,color:`cyan`}]})]})},T={args:{values:[]}},b.parameters={...b.parameters,docs:{...(s=b.parameters)==null?void 0:s.docs,source:{originalSource:`{
  name: 'Basic',
  args: {
    values: ['python', '3.11']
  }
}`,...(c=b.parameters)==null||(c=c.docs)==null?void 0:c.source}}},x.parameters={...x.parameters,docs:{...(l=x.parameters)==null?void 0:l.docs,source:{originalSource:`{
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
}`,...(u=x.parameters)==null||(u=u.docs)==null?void 0:u.source}}},S.parameters={...S.parameters,docs:{...(d=S.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    values: ['tensorflow', '2.12'],
    highlightKeyword: 'tensor'
  }
}`,...(f=S.parameters)==null||(f=f.docs)==null?void 0:f.source}}},C.parameters={...C.parameters,docs:{...(p=C.parameters)==null?void 0:p.docs,source:{originalSource:`{
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
}`,...(m=C.parameters)==null||(m=m.docs)==null?void 0:m.source}}},w.parameters={...w.parameters,docs:{...(h=w.parameters)==null?void 0:h.docs,source:{originalSource:`{
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
}`,...(g=w.parameters)==null||(g=g.docs)==null?void 0:g.source}}},T.parameters={...T.parameters,docs:{...(_=T.parameters)==null?void 0:_.docs,source:{originalSource:`{
  args: {
    values: []
  }
}`,...(v=T.parameters)==null||(v=v.docs)==null?void 0:v.source}}},E=[`Default`,`ObjectValues`,`WithHighlight`,`Copyable`,`Colors`,`Empty`]})))()}D();export{w as Colors,C as Copyable,b as Default,T as Empty,x as ObjectValues,S as WithHighlight,E as __namedExportsOrder,y as default};