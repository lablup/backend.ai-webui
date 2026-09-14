import{c as Q,aC as U,j as r,b as M}from"./iframe-DN-_cYVH.js";import{B as u}from"./BAIFlex-Dxezef0p.js";import{B as F}from"./Badge-Lso588FW.js";import"./preload-helper-Dp1pzeXC.js";const z=16,R=z/2,D=.25,Y=8,ee=86,c=s=>{"use memo";const e=Q.c(35);let a,l,n,p,x,I,B;e[0]!==s?({percent:n,size:x,strokeWidth:I,rotate:B,className:l,"aria-label":a,...p}=s,e[0]=s,e[1]=a,e[2]=l,e[3]=n,e[4]=p,e[5]=x,e[6]=I,e[7]=B):(a=e[1],l=e[2],n=e[3],p=e[4],x=e[5],I=e[6],B=e[7]);const b=x===void 0?"1em":x,i=I===void 0?2:I,K=B===void 0?!0:B,o=Math.max(.5,R-i),d=2*Math.PI*o;let f;e[8]!==n?(f=typeof n=="number"&&Number.isFinite(n),e[8]=n,e[9]=f):f=e[9];const t=f,A=t?Math.min(100,Math.max(0,n)):void 0,_=t?Math.min(ee,Math.max(Y,A)):void 0;let E;e[10]!==d||e[11]!==_||e[12]!==t?(E=t?{strokeDasharray:d,strokeDashoffset:d*(1-_/100)}:{strokeDasharray:`${d*D} ${d*(1-D)}`,strokeDashoffset:0},e[10]=d,e[11]=_,e[12]=t,e[13]=E):E=e[13];const j=E;let w;e[14]!==a||e[15]!==t||e[16]!==A?(w=t?{role:"progressbar","aria-label":a,"aria-valuemin":0,"aria-valuemax":100,"aria-valuenow":A,"aria-valuetext":`${A}%`}:a?{role:"img","aria-label":a}:{"aria-hidden":!0},e[14]=a,e[15]=t,e[16]=A,e[17]=w):w=e[17];const k=w,S=t?K&&"bai-progress-ring-spin":"bai-progress-ring-indeterminate";let g;e[18]!==l||e[19]!==S?(g=U("bai-progress-ring",S,l),e[18]=l,e[19]=S,e[20]=g):g=e[20];let m;e[21]!==o||e[22]!==i?(m=r.jsx("circle",{className:"bai-progress-ring-track",cx:R,cy:R,r:o,strokeWidth:i}),e[21]=o,e[22]=i,e[23]=m):m=e[23];let h;e[24]!==j||e[25]!==o||e[26]!==i?(h=r.jsx("circle",{className:"bai-progress-ring-arc",cx:R,cy:R,r:o,strokeWidth:i,...j}),e[24]=j,e[25]=o,e[26]=i,e[27]=h):h=e[27];let y;return e[28]!==k||e[29]!==b||e[30]!==p||e[31]!==h||e[32]!==g||e[33]!==m?(y=r.jsxs("svg",{viewBox:`0 0 ${z} ${z}`,width:b,height:b,fill:"none",className:g,...k,...p,children:[m,h]}),e[28]=k,e[29]=b,e[30]=p,e[31]=h,e[32]=g,e[33]=m,e[34]=y):y=e[34],y},se={title:"Feedback/BAIProgressRing",component:c,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:"\n**BAIProgressRing** is a progress ring small enough to be used as an icon — typically the `icon` slot of an Astryx `Badge`.\n\nBoth circles are stroked with `currentColor` and the default size is `1em`, so the ring takes the colour and the scale of whatever carries it.\n\nThe **drawn** arc is pinned to 8..86% (`BAI_PROGRESS_RING_MIN_VISIBLE_PERCENT` / `BAI_PROGRESS_RING_MAX_VISIBLE_PERCENT`): at 0% it is a short arc rather than a bare track, and at 100% a gap survives the round line caps, so the slow rotation stays perceptible at both extremes. Everything in between is drawn honestly, and `aria-valuenow` always carries the true percent.\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `percent` | `number` | `undefined` | Completion, clamped to 0..100. Omitted renders the indeterminate ring. |\n| `size` | `string \\| number` | `'1em'` | Rendered size of the square the ring is drawn in. |\n| `strokeWidth` | `number` | `2` | Stroke width in user units of the 16-unit viewBox. |\n| `rotate` | `boolean` | `true` | Whether the determinate ring keeps turning slowly (2.4s per turn). |\n        "}}},argTypes:{percent:{control:{type:"range",min:0,max:100,step:1},description:"Completion in percent; leave unset for indeterminate"},size:{control:{type:"text"}},strokeWidth:{control:{type:"range",min:1,max:5,step:.5}},rotate:{control:{type:"boolean"}}}},N={name:"Basic",args:{percent:66,size:"2rem"}},v={name:"Determinate steps",parameters:{docs:{description:{story:"The 0% and 100% rings still show an arc and a gap — the clamp on the drawn arc is what keeps the slow rotation visible at the extremes."}}},render:()=>r.jsx(u,{gap:"lg",align:"center",children:[0,1,25,50,75,99,100].map(s=>r.jsxs(u,{direction:"column",gap:"xs",align:"center",children:[r.jsx(c,{percent:s,size:"2rem"}),r.jsxs(M,{type:"supporting",children:[s,"%"]})]},s))})},T={render:()=>r.jsxs(u,{gap:"lg",align:"center",children:[r.jsxs(u,{direction:"column",gap:"xs",align:"center",children:[r.jsx(c,{size:"2rem"}),r.jsx(M,{type:"supporting",children:"unknown"})]}),r.jsxs(u,{direction:"column",gap:"xs",align:"center",children:[r.jsx(c,{percent:40,rotate:!1,size:"2rem"}),r.jsx(M,{type:"supporting",children:"40%, not rotating"})]})]})},P={name:"Inside a Badge",render:()=>r.jsxs(u,{gap:"sm",align:"center",children:[r.jsx(F,{variant:"warning",icon:r.jsx(c,{percent:99}),label:"TERMINATING"}),r.jsx(F,{variant:"info",icon:r.jsx(c,{percent:12}),label:"PREPARING"}),r.jsx(F,{variant:"warning",icon:r.jsx(c,{}),label:"TERMINATING"})]})};var G,C,O;N.parameters={...N.parameters,docs:{...(G=N.parameters)==null?void 0:G.docs,source:{originalSource:`{
  name: 'Basic',
  args: {
    percent: 66,
    size: '2rem'
  }
}`,...(O=(C=N.parameters)==null?void 0:C.docs)==null?void 0:O.source}}};var W,$,L;v.parameters={...v.parameters,docs:{...(W=v.parameters)==null?void 0:W.docs,source:{originalSource:`{
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
}`,...(L=($=v.parameters)==null?void 0:$.docs)==null?void 0:L.source}}};var V,X,q;T.parameters={...T.parameters,docs:{...(V=T.parameters)==null?void 0:V.docs,source:{originalSource:`{
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
}`,...(q=(X=T.parameters)==null?void 0:X.docs)==null?void 0:q.source}}};var Z,H,J;P.parameters={...P.parameters,docs:{...(Z=P.parameters)==null?void 0:Z.docs,source:{originalSource:`{
  name: 'Inside a Badge',
  render: () => <BAIFlex gap="sm" align="center">
      <Badge variant="warning" icon={<BAIProgressRing percent={99} />} label="TERMINATING" />
      <Badge variant="info" icon={<BAIProgressRing percent={12} />} label="PREPARING" />
      <Badge variant="warning" icon={<BAIProgressRing />} label="TERMINATING" />
    </BAIFlex>
}`,...(J=(H=P.parameters)==null?void 0:H.docs)==null?void 0:J.source}}};const ie=["Default","Determinate","Indeterminate","InsideABadge"];export{N as Default,v as Determinate,T as Indeterminate,P as InsideABadge,ie as __namedExportsOrder,se as default};
