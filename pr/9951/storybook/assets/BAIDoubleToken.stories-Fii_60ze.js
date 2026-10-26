import{j as e}from"./iframe-BV3I_nBj.js";import{B as n}from"./BAIDoubleToken-DVc0S-Cz.js";import{B as T}from"./BAIFlex-BBb98l4O.js";import"./preload-helper-Dp1pzeXC.js";import"./BAITextHighlighter-CT2lAdwj.js";import"./Token-DptfZs6K.js";import"./useInteractiveRole-xgJGzlP-.js";import"./composeEventHandlers-BolWE7qY.js";const P={title:"Token/BAIDoubleToken",component:n,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:`
**BAIDoubleToken** welds Astryx Tokens into one pill for a settled key/value fact
(image tag, location/platform, permission letters). For a live pair use **BAIDoubleBadge**.

\`\`\`tsx
<BAIDoubleToken values={['Python', '3.11']} />
<BAIDoubleToken values={[{ label: 'R', color: 'green' }, { label: 'W', color: 'blue' }]} />
<BAIDoubleToken values={['Python', '3.11']} highlightKeyword="py" />
\`\`\`
        `}}},argTypes:{values:{control:{type:"object"},description:"Segments as strings (all blue) or `{ label, color }` objects with an Astryx Token color",table:{type:{summary:"string[] | BAIDoubleTokenValue[]"},defaultValue:{summary:"[]"}}},highlightKeyword:{control:{type:"text"},description:"Keyword to highlight within segment labels",table:{type:{summary:"string"}}}}},o={name:"Basic",args:{values:["python","3.11"]}},a={args:{values:[{label:"R",color:"green"},{label:"W",color:"blue"},{label:"D",color:"red"}]}},r={args:{values:["tensorflow","2.12"],highlightKeyword:"tensor"}},l={args:{values:[{label:"Project",color:"blue"},{label:"01a0c2f9-4e84-7f7c-a9b5-f24958a5f8fa",color:"default",copyable:!0}]}},s={render:()=>e.jsxs(T,{direction:"column",gap:"md",align:"start",children:[e.jsx(n,{values:[{label:"aws",color:"orange"},{label:"ap-northeast-2",color:"orange"}]}),e.jsx(n,{values:[{label:"Backend",color:"default"},{label:"cephfs",color:"blue"}]}),e.jsx(n,{values:[{label:"Customized",color:"cyan"},{label:"my-image",color:"cyan"}]})]})},t={args:{values:[]}};var c,u,i;o.parameters={...o.parameters,docs:{...(c=o.parameters)==null?void 0:c.docs,source:{originalSource:`{
  name: 'Basic',
  args: {
    values: ['python', '3.11']
  }
}`,...(i=(u=o.parameters)==null?void 0:u.docs)==null?void 0:i.source}}};var m,p,b;a.parameters={...a.parameters,docs:{...(m=a.parameters)==null?void 0:m.docs,source:{originalSource:`{
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
}`,...(b=(p=a.parameters)==null?void 0:p.docs)==null?void 0:b.source}}};var d,g,y;r.parameters={...r.parameters,docs:{...(d=r.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    values: ['tensorflow', '2.12'],
    highlightKeyword: 'tensor'
  }
}`,...(y=(g=r.parameters)==null?void 0:g.docs)==null?void 0:y.source}}};var h,f,v;l.parameters={...l.parameters,docs:{...(h=l.parameters)==null?void 0:h.docs,source:{originalSource:`{
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
}`,...(v=(f=l.parameters)==null?void 0:f.docs)==null?void 0:v.source}}};var B,k,A;s.parameters={...s.parameters,docs:{...(B=s.parameters)==null?void 0:B.docs,source:{originalSource:`{
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
}`,...(A=(k=s.parameters)==null?void 0:k.docs)==null?void 0:A.source}}};var x,D,I;t.parameters={...t.parameters,docs:{...(x=t.parameters)==null?void 0:x.docs,source:{originalSource:`{
  args: {
    values: []
  }
}`,...(I=(D=t.parameters)==null?void 0:D.docs)==null?void 0:I.source}}};const R=["Default","ObjectValues","WithHighlight","Copyable","Colors","Empty"];export{s as Colors,l as Copyable,o as Default,t as Empty,a as ObjectValues,r as WithHighlight,R as __namedExportsOrder,P as default};
