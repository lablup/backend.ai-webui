import{j as e}from"./iframe-D-4SRRNq.js";import{B as t}from"./BAIDoubleToken-DOelIU5x.js";import{B as A}from"./BAIFlex-CUZ1aky-.js";import"./preload-helper-Dp1pzeXC.js";/* empty css                       */import"./BAITextHighlighter-BmSGiD_O.js";import"./isEmpty-B6B7H3mH.js";import"./toString-PQog6-Vw.js";import"./isSymbol-CYxQIBlp.js";import"./map-B7A7ngIJ.js";import"./_baseEach-BESDlSNs.js";import"./get-B8xL34Ee.js";import"./_baseGet-B_1pieXg.js";import"./identity-DKeuBCMA.js";import"./Token-B41G_VH6.js";import"./composeEventHandlers-BolWE7qY.js";import"./isUndefined-DCTLXrZ8.js";const P={title:"Token/BAIDoubleToken",component:t,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:`
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
