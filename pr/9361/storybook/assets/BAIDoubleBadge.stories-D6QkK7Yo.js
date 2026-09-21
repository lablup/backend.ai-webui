import{j as a}from"./iframe-DOmAmbn1.js";import{B as t}from"./BAIDoubleBadge-DPAl0GZM.js";import{B as g}from"./BAIFlex-CNOJGb-Z.js";import"./preload-helper-Dp1pzeXC.js";/* empty css                       */import"./map-s4V4kexg.js";import"./toString-DId56-Nq.js";import"./isSymbol-2w7Juaf9.js";import"./_baseEach-CVGJ7hW7.js";import"./get-DsR3to5N.js";import"./_baseGet-D3vQXTyQ.js";import"./identity-DKeuBCMA.js";import"./isEmpty-C4DbWzmF.js";import"./Badge-Bug6R7m6.js";const T={title:"Badge/BAIDoubleBadge",component:t,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:`
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
