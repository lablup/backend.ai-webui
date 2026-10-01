import{j as a}from"./iframe-B_SyaT82.js";import{B as t}from"./BAIDoubleBadge-Chuj9_b3.js";import{B as g}from"./BAIFlex-CU68O9fJ.js";import"./preload-helper-Dp1pzeXC.js";/* empty css                       */import"./map-w7Js6_7a.js";import"./toString-EIxC_JuE.js";import"./isSymbol-CHy5XUnL.js";import"./_baseEach-Dm33q8zR.js";import"./get-C_2jR3D6.js";import"./_baseGet-CUg3G0eH.js";import"./identity-DKeuBCMA.js";import"./isEmpty-REerZJeG.js";import"./Badge-CgkKg1Nq.js";const T={title:"Badge/BAIDoubleBadge",component:t,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:`
**BAIDoubleBadge** welds Astryx Badges into one pill for a live pair the system
changes on its own (status + detail, label + ticker). For a settled pair use **BAIDoubleToken**.

\`\`\`tsx
<BAIDoubleBadge values={[{ label: 'ALIVE', variant: 'success' }, { label: '26.4.0', variant: 'success' }]} />
<BAIDoubleBadge values={['Elapsed time', '00:12:31']} />
\`\`\`
        `}}},argTypes:{values:{control:{type:"object"},description:"Segments as strings (all neutral) or `{ label, variant }` objects with an Astryx Badge variant",table:{type:{summary:"string[] | BAIDoubleBadgeValue[]"},defaultValue:{summary:"[]"}}}}},e={name:"Basic",args:{values:["Elapsed time","00:12:31"]}},r={render:()=>a.jsxs(g,{direction:"column",gap:"md",align:"start",children:[a.jsx(t,{values:[{label:"ALIVE",variant:"success"},{label:"26.4.0",variant:"success"}]}),a.jsx(t,{values:[{label:"RESTARTING",variant:"warning"},{label:"26.4.0",variant:"warning"}]}),a.jsx(t,{values:[{label:"ERROR",variant:"error"},{label:"creation-failed",variant:"error"}]})]})},s={args:{values:[]}};var l,o,n;e.parameters={...e.parameters,docs:{...(l=e.parameters)==null?void 0:l.docs,source:{originalSource:`{
  name: 'Basic',
  args: {
    values: ['Elapsed time', '00:12:31']
  }
}`,...(n=(o=e.parameters)==null?void 0:o.docs)==null?void 0:n.source}}};var i,u,c;r.parameters={...r.parameters,docs:{...(i=r.parameters)==null?void 0:i.docs,source:{originalSource:`{
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
}`,...(c=(u=r.parameters)==null?void 0:u.docs)==null?void 0:c.source}}};var m,p,d;s.parameters={...s.parameters,docs:{...(m=s.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    values: []
  }
}`,...(d=(p=s.parameters)==null?void 0:p.docs)==null?void 0:d.source}}};const V=["Default","Statuses","Empty"];export{e as Default,s as Empty,r as Statuses,V as __namedExportsOrder,T as default};
