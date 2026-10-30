import{a as e,n as t}from"./rolldown-runtime-sJBDdmOt.js";import{t as n}from"./jsx-runtime-MKhVqBIO.js";import{t as r}from"./compiler-runtime-DU4U6aph.js";import{n as i,t as a}from"./Text-Cj3JSrHf.js";import{g as o}from"./iframe-Dqu-YNfD.js";import{n as s,t as c}from"./BAIFlex-DnaoYTJ1.js";import{n as l,t as u}from"./Badge-DMuqwqp2.js";var d,f,p,m,h,g,_,v,y,b,x;function S(){return(S=t((()=>{d=r(),f=e(o(),1),p=n(),m=16,h=m/2,g=.25,_=5,v=3,y=e=>Math.max(.5,h-e),b=e=>{let t=2*Math.PI*y(e),n=e=>e/t*100,r=Math.min(100,n(Math.max(0,t-e-v)));return{min:Math.min(n(Math.max(0,_-e)),r),max:r}},x=e=>{"use memo";let t=(0,d.c)(37),n,r,i,a,o,s,c;t[0]===e?(n=t[1],r=t[2],i=t[3],a=t[4],o=t[5],s=t[6],c=t[7]):({percent:i,size:o,strokeWidth:s,rotate:c,className:r,"aria-label":n,...a}=e,t[0]=e,t[1]=n,t[2]=r,t[3]=i,t[4]=a,t[5]=o,t[6]=s,t[7]=c);let l=o===void 0?`1em`:o,u=s===void 0?2:s,_=c===void 0||c,v=y(u),x=2*Math.PI*v,S;t[8]===i?S=t[9]:(S=typeof i==`number`&&Number.isFinite(i),t[8]=i,t[9]=S);let C=S,w=C?Math.min(100,Math.max(0,i)):void 0,T;t[10]===u?T=t[11]:(T=b(u),t[10]=u,t[11]=T);let E=T,D=C?Math.min(E.max,Math.max(E.min,w)):void 0,O;t[12]!==x||t[13]!==D||t[14]!==C?(O=C?{strokeDasharray:x,strokeDashoffset:x*(1-D/100)}:{strokeDasharray:`${x*g} ${x*.75}`,strokeDashoffset:0},t[12]=x,t[13]=D,t[14]=C,t[15]=O):O=t[15];let k=O,A;t[16]!==n||t[17]!==C||t[18]!==w?(A=C?{role:`progressbar`,"aria-label":n,"aria-valuemin":0,"aria-valuemax":100,"aria-valuenow":w,"aria-valuetext":`${w}%`}:n?{role:`img`,"aria-label":n}:{"aria-hidden":!0},t[16]=n,t[17]=C,t[18]=w,t[19]=A):A=t[19];let j=A,M=C?_&&`bai-progress-ring-spin`:`bai-progress-ring-indeterminate`,N;t[20]!==r||t[21]!==M?(N=(0,f.default)(`bai-progress-ring`,M,r),t[20]=r,t[21]=M,t[22]=N):N=t[22];let P;t[23]!==v||t[24]!==u?(P=(0,p.jsx)(`circle`,{className:`bai-progress-ring-track`,cx:h,cy:h,r:v,strokeWidth:u}),t[23]=v,t[24]=u,t[25]=P):P=t[25];let F;t[26]!==k||t[27]!==v||t[28]!==u?(F=(0,p.jsx)(`circle`,{className:`bai-progress-ring-arc`,cx:h,cy:h,r:v,strokeWidth:u,...k}),t[26]=k,t[27]=v,t[28]=u,t[29]=F):F=t[29];let I;return t[30]!==j||t[31]!==l||t[32]!==a||t[33]!==P||t[34]!==F||t[35]!==N?(I=(0,p.jsxs)(`svg`,{viewBox:`0 0 ${m} ${m}`,width:l,height:l,fill:`none`,className:N,...j,...a,children:[P,F]}),t[30]=j,t[31]=l,t[32]=a,t[33]=P,t[34]=F,t[35]=N,t[36]=I):I=t[36],I}})))()}var C,w,T,E,D,O,k,A,j,M,N,P,F,I,L;function R(){return(R=t((()=>{s(),S(),l(),i(),C=n(),M={title:`Feedback/BAIProgressRing`,component:x,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:"\n**BAIProgressRing** is a progress ring small enough to be used as an icon — typically the `icon` slot of an Astryx `Badge`.\n\nBoth circles are stroked with `currentColor` and the default size is `1em`, so the ring takes the colour and the scale of whatever carries it.\n\nThe **drawn** arc is pinned to the range `getVisibleArcRange(strokeWidth)` returns: at 0% it is a short arc rather than a bare track, and at 100% a gap survives the round line caps, so the slow rotation stays perceptible at both extremes. Both bounds come from the ring’s geometry rather than two fixed percents, so they follow `strokeWidth` — 7.96..86.74% at the default 2, 0..57.6% at 5 — and always leave a 5-unit arc and a 3-unit gap. Everything in between is drawn honestly, and `aria-valuenow` always carries the true percent.\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `percent` | `number` | `undefined` | Completion, clamped to 0..100. Omitted renders the indeterminate ring. |\n| `size` | `string \\| number` | `'1em'` | Rendered size of the square the ring is drawn in. |\n| `strokeWidth` | `number` | `2` | Stroke width in user units of the 16-unit viewBox. |\n| `rotate` | `boolean` | `true` | Whether the determinate ring keeps turning slowly (2.4s per turn). |\n        "}}},argTypes:{percent:{control:{type:`range`,min:0,max:100,step:1},description:`Completion in percent; leave unset for indeterminate`},size:{control:{type:`text`}},strokeWidth:{control:{type:`range`,min:1,max:5,step:.5}},rotate:{control:{type:`boolean`}}}},N={name:`Basic`,args:{percent:66,size:`2rem`}},P={name:`Determinate steps`,parameters:{docs:{description:{story:`The 0% and 100% rings still show an arc and a gap — the clamp on the drawn arc is what keeps the slow rotation visible at the extremes.`}}},render:()=>(0,C.jsx)(c,{gap:`lg`,align:`center`,children:[0,1,25,50,75,99,100].map(e=>(0,C.jsxs)(c,{direction:`column`,gap:`xs`,align:`center`,children:[(0,C.jsx)(x,{percent:e,size:`2rem`}),(0,C.jsxs)(a,{type:`supporting`,children:[e,`%`]})]},e))})},F={render:()=>(0,C.jsxs)(c,{gap:`lg`,align:`center`,children:[(0,C.jsxs)(c,{direction:`column`,gap:`xs`,align:`center`,children:[(0,C.jsx)(x,{size:`2rem`}),(0,C.jsx)(a,{type:`supporting`,children:`unknown`})]}),(0,C.jsxs)(c,{direction:`column`,gap:`xs`,align:`center`,children:[(0,C.jsx)(x,{percent:40,rotate:!1,size:`2rem`}),(0,C.jsx)(a,{type:`supporting`,children:`40%, not rotating`})]})]})},I={name:`Inside a Badge`,render:()=>(0,C.jsxs)(c,{gap:`sm`,align:`center`,children:[(0,C.jsx)(u,{variant:`warning`,icon:(0,C.jsx)(x,{percent:99}),label:`TERMINATING`}),(0,C.jsx)(u,{variant:`info`,icon:(0,C.jsx)(x,{percent:12}),label:`PREPARING`}),(0,C.jsx)(u,{variant:`warning`,icon:(0,C.jsx)(x,{}),label:`TERMINATING`})]})},N.parameters={...N.parameters,docs:{...(w=N.parameters)==null?void 0:w.docs,source:{originalSource:`{
  name: 'Basic',
  args: {
    percent: 66,
    size: '2rem'
  }
}`,...(T=N.parameters)==null||(T=T.docs)==null?void 0:T.source}}},P.parameters={...P.parameters,docs:{...(E=P.parameters)==null?void 0:E.docs,source:{originalSource:`{
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
}`,...(D=P.parameters)==null||(D=D.docs)==null?void 0:D.source}}},F.parameters={...F.parameters,docs:{...(O=F.parameters)==null?void 0:O.docs,source:{originalSource:`{
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
}`,...(k=F.parameters)==null||(k=k.docs)==null?void 0:k.source}}},I.parameters={...I.parameters,docs:{...(A=I.parameters)==null?void 0:A.docs,source:{originalSource:`{
  name: 'Inside a Badge',
  render: () => <BAIFlex gap="sm" align="center">
      <Badge variant="warning" icon={<BAIProgressRing percent={99} />} label="TERMINATING" />
      <Badge variant="info" icon={<BAIProgressRing percent={12} />} label="PREPARING" />
      <Badge variant="warning" icon={<BAIProgressRing />} label="TERMINATING" />
    </BAIFlex>
}`,...(j=I.parameters)==null||(j=j.docs)==null?void 0:j.source}}},L=[`Default`,`Determinate`,`Indeterminate`,`InsideABadge`]})))()}R();export{N as Default,P as Determinate,F as Indeterminate,I as InsideABadge,L as __namedExportsOrder,M as default};