import{j as a}from"./iframe-CZvkg6vo.js";import{B as t}from"./BAIDoubleBadge-CZ04s8Fg.js";import{B as g}from"./BAIFlex-UWZWL8Nk.js";import"./preload-helper-Dp1pzeXC.js";import"./Badge-CDxN47mH.js";const x={title:"Badge/BAIDoubleBadge",component:t,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:`
**BAIDoubleBadge** welds Astryx Badges into one pill for a live pair the system
changes on its own (status + detail, label + ticker). For a settled pair use **BAIDoubleToken**.

\`\`\`tsx
<BAIDoubleBadge values={[{ label: 'ALIVE', variant: 'success' }, { label: '26.4.0', variant: 'success' }]} />
<BAIDoubleBadge values={['Elapsed time', '00:12:31']} />
\`\`\`
        `}}},argTypes:{values:{control:{type:"object"},description:"Segments as strings (all neutral) or `{ label, variant }` objects with an Astryx Badge variant",table:{type:{summary:"string[] | BAIDoubleBadgeValue[]"},defaultValue:{summary:"[]"}}}}},e={name:"Basic",args:{values:["Elapsed time","00:12:31"]}},s={render:()=>a.jsxs(g,{direction:"column",gap:"md",align:"start",children:[a.jsx(t,{values:[{label:"ALIVE",variant:"success"},{label:"26.4.0",variant:"success"}]}),a.jsx(t,{values:[{label:"RESTARTING",variant:"warning"},{label:"26.4.0",variant:"warning"}]}),a.jsx(t,{values:[{label:"ERROR",variant:"error"},{label:"creation-failed",variant:"error"}]})]})},r={args:{values:[]}};var l,o,n;e.parameters={...e.parameters,docs:{...(l=e.parameters)==null?void 0:l.docs,source:{originalSource:`{
  name: 'Basic',
  args: {
    values: ['Elapsed time', '00:12:31']
  }
}`,...(n=(o=e.parameters)==null?void 0:o.docs)==null?void 0:n.source}}};var i,u,c;s.parameters={...s.parameters,docs:{...(i=s.parameters)==null?void 0:i.docs,source:{originalSource:`{
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
}`,...(c=(u=s.parameters)==null?void 0:u.docs)==null?void 0:c.source}}};var d,m,p;r.parameters={...r.parameters,docs:{...(d=r.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    values: []
  }
}`,...(p=(m=r.parameters)==null?void 0:m.docs)==null?void 0:p.source}}};const E=["Default","Statuses","Empty"];export{e as Default,r as Empty,s as Statuses,E as __namedExportsOrder,x as default};
