import{n as e,o as t}from"./rolldown-runtime-2s6bX4vc.js";import{l as n}from"./iframe-DR2sIF5r.js";import{n as r,t as i}from"./BAIFlex-CAz1t6J5.js";import{jsx as a,jsxs as o}from"react/jsx-runtime";import{c as s}from"react/compiler-runtime";import{Text as c}from"@lablup/ui-common/Text";import{Badge as l}from"@lablup/ui-common/Badge";var u,d,f,p,m,h,g,_,v;function y(){return(y=e((()=>{u=t(n(),1),d=16,f=d/2,p=.25,m=5,h=3,g=e=>Math.max(.5,f-e),_=e=>{let t=2*Math.PI*g(e),n=e=>e/t*100,r=Math.min(100,n(Math.max(0,t-e-h)));return{min:Math.min(n(Math.max(0,m-e)),r),max:r}},v=e=>{"use memo";let t=s(37),n,r,i,c,l,m,h;t[0]===e?(n=t[1],r=t[2],i=t[3],c=t[4],l=t[5],m=t[6],h=t[7]):({percent:i,size:l,strokeWidth:m,rotate:h,className:r,"aria-label":n,...c}=e,t[0]=e,t[1]=n,t[2]=r,t[3]=i,t[4]=c,t[5]=l,t[6]=m,t[7]=h);let v=l===void 0?`1em`:l,y=m===void 0?2:m,b=h===void 0||h,x=g(y),S=2*Math.PI*x,C;t[8]===i?C=t[9]:(C=typeof i==`number`&&Number.isFinite(i),t[8]=i,t[9]=C);let w=C,T=w?Math.min(100,Math.max(0,i)):void 0,E;t[10]===y?E=t[11]:(E=_(y),t[10]=y,t[11]=E);let D=E,O=w?Math.min(D.max,Math.max(D.min,T)):void 0,k;t[12]!==S||t[13]!==O||t[14]!==w?(k=w?{strokeDasharray:S,strokeDashoffset:S*(1-O/100)}:{strokeDasharray:`${S*p} ${S*.75}`,strokeDashoffset:0},t[12]=S,t[13]=O,t[14]=w,t[15]=k):k=t[15];let A=k,j;t[16]!==n||t[17]!==w||t[18]!==T?(j=w?{role:`progressbar`,"aria-label":n,"aria-valuemin":0,"aria-valuemax":100,"aria-valuenow":T,"aria-valuetext":`${T}%`}:n?{role:`img`,"aria-label":n}:{"aria-hidden":!0},t[16]=n,t[17]=w,t[18]=T,t[19]=j):j=t[19];let M=j,N=w?b&&`bai-progress-ring-spin`:`bai-progress-ring-indeterminate`,P;t[20]!==r||t[21]!==N?(P=(0,u.default)(`bai-progress-ring`,N,r),t[20]=r,t[21]=N,t[22]=P):P=t[22];let F;t[23]!==x||t[24]!==y?(F=a(`circle`,{className:`bai-progress-ring-track`,cx:f,cy:f,r:x,strokeWidth:y}),t[23]=x,t[24]=y,t[25]=F):F=t[25];let I;t[26]!==A||t[27]!==x||t[28]!==y?(I=a(`circle`,{className:`bai-progress-ring-arc`,cx:f,cy:f,r:x,strokeWidth:y,...A}),t[26]=A,t[27]=x,t[28]=y,t[29]=I):I=t[29];let L;return t[30]!==M||t[31]!==v||t[32]!==c||t[33]!==F||t[34]!==I||t[35]!==P?(L=o(`svg`,{viewBox:`0 0 ${d} ${d}`,width:v,height:v,fill:`none`,className:P,...M,...c,children:[F,I]}),t[30]=M,t[31]=v,t[32]=c,t[33]=F,t[34]=I,t[35]=P,t[36]=L):L=t[36],L}})))()}var b,x,S,C,w,T;function E(){return(E=e((()=>{r(),y(),b={title:`Feedback/BAIProgressRing`,component:v,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:"\n**BAIProgressRing** is a progress ring small enough to be used as an icon — typically the `icon` slot of an Astryx `Badge`.\n\nBoth circles are stroked with `currentColor` and the default size is `1em`, so the ring takes the colour and the scale of whatever carries it.\n\nThe **drawn** arc is pinned to the range `getVisibleArcRange(strokeWidth)` returns: at 0% it is a short arc rather than a bare track, and at 100% a gap survives the round line caps, so the slow rotation stays perceptible at both extremes. Both bounds come from the ring’s geometry rather than two fixed percents, so they follow `strokeWidth` — 7.96..86.74% at the default 2, 0..57.6% at 5 — and always leave a 5-unit arc and a 3-unit gap. Everything in between is drawn honestly, and `aria-valuenow` always carries the true percent.\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `percent` | `number` | `undefined` | Completion, clamped to 0..100. Omitted renders the indeterminate ring. |\n| `size` | `string \\| number` | `'1em'` | Rendered size of the square the ring is drawn in. |\n| `strokeWidth` | `number` | `2` | Stroke width in user units of the 16-unit viewBox. |\n| `rotate` | `boolean` | `true` | Whether the determinate ring keeps turning slowly (2.4s per turn). |\n        "}}},argTypes:{percent:{control:{type:`range`,min:0,max:100,step:1},description:`Completion in percent; leave unset for indeterminate`},size:{control:{type:`text`}},strokeWidth:{control:{type:`range`,min:1,max:5,step:.5}},rotate:{control:{type:`boolean`}}}},x={name:`Basic`,args:{percent:66,size:`2rem`}},S={name:`Determinate steps`,parameters:{docs:{description:{story:`The 0% and 100% rings still show an arc and a gap — the clamp on the drawn arc is what keeps the slow rotation visible at the extremes.`}}},render:()=>a(i,{gap:`lg`,align:`center`,children:[0,1,25,50,75,99,100].map(e=>o(i,{direction:`column`,gap:`xs`,align:`center`,children:[a(v,{percent:e,size:`2rem`}),o(c,{type:`supporting`,children:[e,`%`]})]},e))})},C={render:()=>o(i,{gap:`lg`,align:`center`,children:[o(i,{direction:`column`,gap:`xs`,align:`center`,children:[a(v,{size:`2rem`}),a(c,{type:`supporting`,children:`unknown`})]}),o(i,{direction:`column`,gap:`xs`,align:`center`,children:[a(v,{percent:40,rotate:!1,size:`2rem`}),a(c,{type:`supporting`,children:`40%, not rotating`})]})]})},w={name:`Inside a Badge`,render:()=>o(i,{gap:`sm`,align:`center`,children:[a(l,{variant:`warning`,icon:a(v,{percent:99}),label:`TERMINATING`}),a(l,{variant:`info`,icon:a(v,{percent:12}),label:`PREPARING`}),a(l,{variant:`warning`,icon:a(v,{}),label:`TERMINATING`})]})},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  name: 'Basic',
  args: {
    percent: 66,
    size: '2rem'
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  name: 'Determinate steps',
  parameters: {
    docs: {
      description: {
        story: 'The 0% and 100% rings still show an arc and a gap — the clamp on the drawn arc is what keeps the slow rotation visible at the extremes.'
      }
    }
  },
  render: () => <BAIFlex gap="lg" align="center">
      {[0, 1, 25, 50, 75, 99, 100].map(percent => <BAIFlex key={percent} direction="column" gap="xs" align="center">
          <BAIProgressRing percent={percent} size="2rem" />
          <Text type="supporting">{percent}%</Text>
        </BAIFlex>)}
    </BAIFlex>
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => <BAIFlex gap="lg" align="center">
      <BAIFlex direction="column" gap="xs" align="center">
        <BAIProgressRing size="2rem" />
        <Text type="supporting">unknown</Text>
      </BAIFlex>
      <BAIFlex direction="column" gap="xs" align="center">
        <BAIProgressRing percent={40} rotate={false} size="2rem" />
        <Text type="supporting">40%, not rotating</Text>
      </BAIFlex>
    </BAIFlex>
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  name: 'Inside a Badge',
  render: () => <BAIFlex gap="sm" align="center">
      <Badge variant="warning" icon={<BAIProgressRing percent={99} />} label="TERMINATING" />
      <Badge variant="info" icon={<BAIProgressRing percent={12} />} label="PREPARING" />
      <Badge variant="warning" icon={<BAIProgressRing />} label="TERMINATING" />
    </BAIFlex>
}`,...w.parameters?.docs?.source}}},T=[`Default`,`Determinate`,`Indeterminate`,`InsideABadge`]})))()}E();export{x as Default,S as Determinate,C as Indeterminate,w as InsideABadge,T as __namedExportsOrder,b as default};