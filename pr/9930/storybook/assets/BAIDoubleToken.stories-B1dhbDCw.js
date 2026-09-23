import{j as e}from"./iframe-xli-3ODD.js";import{B as t}from"./BAIDoubleToken-BfVgyr6w.js";import{B as A}from"./BAIFlex-CZJ2-JRE.js";import"./preload-helper-Dp1pzeXC.js";/* empty css                       */import"./BAITextHighlighter-K5sL5YWL.js";import"./isEmpty-BSS19O1z.js";import"./toString-Bpa1ry7B.js";import"./isSymbol-C9iNTJ3b.js";import"./map-B2NPuA2c.js";import"./_baseEach-Ck-1rGF7.js";import"./get-DMbrK2Qz.js";import"./_baseGet-DlBkLjKd.js";import"./identity-DKeuBCMA.js";import"./Token-DeUOTjOt.js";import"./composeEventHandlers-BolWE7qY.js";import"./isUndefined-DCTLXrZ8.js";const P={title:"Token/BAIDoubleToken",component:t,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:`
**BAIDoubleToken** welds Astryx Tokens into one pill for a settled key/value fact
(image tag, location/platform, permission letters). For a live pair use **BAIDoubleBadge**.

\`\`\`tsx
<BAIDoubleToken values={['Python', '3.11']} />
<BAIDoubleToken values={[{ label: 'R', color: 'green' }, { label: 'W', color: 'blue' }]} />
<BAIDoubleToken values={['Python', '3.11']} highlightKeyword="py" />
\`\`\`
        `}}},argTypes:{values:{control:{type:"object"},description:"Segments as strings (all blue) or `{ label, color }` objects with an Astryx Token color",table:{type:{summary:"string[] | BAIDoubleTokenValue[]"},defaultValue:{summary:"[]"}}},highlightKeyword:{control:{type:"text"},description:"Keyword to highlight within segment labels",table:{type:{summary:"string"}}}}},o={name:"Basic",args:{values:["python","3.11"]}},r={args:{values:[{label:"R",color:"green"},{label:"W",color:"blue"},{label:"D",color:"red"}]}},a={args:{values:["tensorflow","2.12"],highlightKeyword:"tensor"}},l={render:()=>e.jsxs(A,{direction:"column",gap:"md",align:"start",children:[e.jsx(t,{values:[{label:"aws",color:"orange"},{label:"ap-northeast-2",color:"orange"}]}),e.jsx(t,{values:[{label:"Backend",color:"default"},{label:"cephfs",color:"blue"}]}),e.jsx(t,{values:[{label:"Customized",color:"cyan"},{label:"my-image",color:"cyan"}]})]})},s={args:{values:[]}};var n,c,i;o.parameters={...o.parameters,docs:{...(n=o.parameters)==null?void 0:n.docs,source:{originalSource:`{
  name: 'Basic',
  args: {
    values: ['python', '3.11']
  }
}`,...(i=(c=o.parameters)==null?void 0:c.docs)==null?void 0:i.source}}};var u,m,p;r.parameters={...r.parameters,docs:{...(u=r.parameters)==null?void 0:u.docs,source:{originalSource:`{
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
}`,...(p=(m=r.parameters)==null?void 0:m.docs)==null?void 0:p.source}}};var d,g,b;a.parameters={...a.parameters,docs:{...(d=a.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    values: ['tensorflow', '2.12'],
    highlightKeyword: 'tensor'
  }
}`,...(b=(g=a.parameters)==null?void 0:g.docs)==null?void 0:b.source}}};var h,y,B;l.parameters={...l.parameters,docs:{...(h=l.parameters)==null?void 0:h.docs,source:{originalSource:`{
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
}`,...(B=(y=l.parameters)==null?void 0:y.docs)==null?void 0:B.source}}};var v,f,k;s.parameters={...s.parameters,docs:{...(v=s.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    values: []
  }
}`,...(k=(f=s.parameters)==null?void 0:f.docs)==null?void 0:k.source}}};const _=["Default","ObjectValues","WithHighlight","Colors","Empty"];export{l as Colors,o as Default,s as Empty,r as ObjectValues,a as WithHighlight,_ as __namedExportsOrder,P as default};
