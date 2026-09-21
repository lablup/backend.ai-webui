import{c as ee,aC as te,j as t,b as _}from"./iframe-D_FvqH54.js";import{B as u}from"./BAIFlex-rsFaSKWc.js";import{B as D}from"./Badge-CwznI02H.js";import"./preload-helper-Dp1pzeXC.js";const C=16,A=C/2,G=.25,re=5,ae=3,U=r=>Math.max(.5,A-r),ne=r=>{const e=2*Math.PI*U(r),a=c=>c/e*100,s=Math.min(100,a(Math.max(0,e-r-ae)));return{min:Math.min(a(Math.max(0,re-r)),s),max:s}},p=r=>{"use memo";const e=ee.c(37);let a,s,i,c,x,I,B;e[0]!==r?({percent:i,size:x,strokeWidth:I,rotate:B,className:s,"aria-label":a,...c}=r,e[0]=r,e[1]=a,e[2]=s,e[3]=i,e[4]=c,e[5]=x,e[6]=I,e[7]=B):(a=e[1],s=e[2],i=e[3],c=e[4],x=e[5],I=e[6],B=e[7]);const b=x===void 0?"1em":x,n=I===void 0?2:I,Y=B===void 0?!0:B,l=U(n),m=2*Math.PI*l;let w;e[8]!==i?(w=typeof i=="number"&&Number.isFinite(i),e[8]=i,e[9]=w):w=e[9];const o=w,f=o?Math.min(100,Math.max(0,i)):void 0;let y;e[10]!==n?(y=ne(n),e[10]=n,e[11]=y):y=e[11];const S=y,E=o?Math.min(S.max,Math.max(S.min,f)):void 0;let v;e[12]!==m||e[13]!==E||e[14]!==o?(v=o?{strokeDasharray:m,strokeDashoffset:m*(1-E/100)}:{strokeDasharray:`${m*G} ${m*(1-G)}`,strokeDashoffset:0},e[12]=m,e[13]=E,e[14]=o,e[15]=v):v=e[15];const M=v;let R;e[16]!==a||e[17]!==o||e[18]!==f?(R=o?{role:"progressbar","aria-label":a,"aria-valuemin":0,"aria-valuemax":100,"aria-valuenow":f,"aria-valuetext":`${f}%`}:a?{role:"img","aria-label":a}:{"aria-hidden":!0},e[16]=a,e[17]=o,e[18]=f,e[19]=R):R=e[19];const F=R,z=o?Y&&"bai-progress-ring-spin":"bai-progress-ring-indeterminate";let g;e[20]!==s||e[21]!==z?(g=te("bai-progress-ring",z,s),e[20]=s,e[21]=z,e[22]=g):g=e[22];let d;e[23]!==l||e[24]!==n?(d=t.jsx("circle",{className:"bai-progress-ring-track",cx:A,cy:A,r:l,strokeWidth:n}),e[23]=l,e[24]=n,e[25]=d):d=e[25];let h;e[26]!==M||e[27]!==l||e[28]!==n?(h=t.jsx("circle",{className:"bai-progress-ring-arc",cx:A,cy:A,r:l,strokeWidth:n,...M}),e[26]=M,e[27]=l,e[28]=n,e[29]=h):h=e[29];let T;return e[30]!==F||e[31]!==b||e[32]!==c||e[33]!==d||e[34]!==h||e[35]!==g?(T=t.jsxs("svg",{viewBox:`0 0 ${C} ${C}`,width:b,height:b,fill:"none",className:g,...F,...c,children:[d,h]}),e[30]=F,e[31]=b,e[32]=c,e[33]=d,e[34]=h,e[35]=g,e[36]=T):T=e[36],T},le={title:"Feedback/BAIProgressRing",component:p,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:"\n**BAIProgressRing** is a progress ring small enough to be used as an icon — typically the `icon` slot of an Astryx `Badge`.\n\nBoth circles are stroked with `currentColor` and the default size is `1em`, so the ring takes the colour and the scale of whatever carries it.\n\nThe **drawn** arc is pinned to the range `getVisibleArcRange(strokeWidth)` returns: at 0% it is a short arc rather than a bare track, and at 100% a gap survives the round line caps, so the slow rotation stays perceptible at both extremes. Both bounds come from the ring’s geometry rather than two fixed percents, so they follow `strokeWidth` — 7.96..86.74% at the default 2, 0..57.6% at 5 — and always leave a 5-unit arc and a 3-unit gap. Everything in between is drawn honestly, and `aria-valuenow` always carries the true percent.\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `percent` | `number` | `undefined` | Completion, clamped to 0..100. Omitted renders the indeterminate ring. |\n| `size` | `string \\| number` | `'1em'` | Rendered size of the square the ring is drawn in. |\n| `strokeWidth` | `number` | `2` | Stroke width in user units of the 16-unit viewBox. |\n| `rotate` | `boolean` | `true` | Whether the determinate ring keeps turning slowly (2.4s per turn). |\n        "}}},argTypes:{percent:{control:{type:"range",min:0,max:100,step:1},description:"Completion in percent; leave unset for indeterminate"},size:{control:{type:"text"}},strokeWidth:{control:{type:"range",min:1,max:5,step:.5}},rotate:{control:{type:"boolean"}}}},j={name:"Basic",args:{percent:66,size:"2rem"}},N={name:"Determinate steps",parameters:{docs:{description:{story:"The 0% and 100% rings still show an arc and a gap — the clamp on the drawn arc is what keeps the slow rotation visible at the extremes."}}},render:()=>t.jsx(u,{gap:"lg",align:"center",children:[0,1,25,50,75,99,100].map(r=>t.jsxs(u,{direction:"column",gap:"xs",align:"center",children:[t.jsx(p,{percent:r,size:"2rem"}),t.jsxs(_,{type:"supporting",children:[r,"%"]})]},r))})},k={render:()=>t.jsxs(u,{gap:"lg",align:"center",children:[t.jsxs(u,{direction:"column",gap:"xs",align:"center",children:[t.jsx(p,{size:"2rem"}),t.jsx(_,{type:"supporting",children:"unknown"})]}),t.jsxs(u,{direction:"column",gap:"xs",align:"center",children:[t.jsx(p,{percent:40,rotate:!1,size:"2rem"}),t.jsx(_,{type:"supporting",children:"40%, not rotating"})]})]})},P={name:"Inside a Badge",render:()=>t.jsxs(u,{gap:"sm",align:"center",children:[t.jsx(D,{variant:"warning",icon:t.jsx(p,{percent:99}),label:"TERMINATING"}),t.jsx(D,{variant:"info",icon:t.jsx(p,{percent:12}),label:"PREPARING"}),t.jsx(D,{variant:"warning",icon:t.jsx(p,{}),label:"TERMINATING"})]})};var W,$,V;j.parameters={...j.parameters,docs:{...(W=j.parameters)==null?void 0:W.docs,source:{originalSource:`{
  name: 'Basic',
  args: {
    percent: 66,
    size: '2rem'
  }
}`,...(V=($=j.parameters)==null?void 0:$.docs)==null?void 0:V.source}}};var O,L,q;N.parameters={...N.parameters,docs:{...(O=N.parameters)==null?void 0:O.docs,source:{originalSource:`{
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
}`,...(q=(L=N.parameters)==null?void 0:L.docs)==null?void 0:q.source}}};var X,Z,H;k.parameters={...k.parameters,docs:{...(X=k.parameters)==null?void 0:X.docs,source:{originalSource:`{
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
}`,...(H=(Z=k.parameters)==null?void 0:Z.docs)==null?void 0:H.source}}};var J,K,Q;P.parameters={...P.parameters,docs:{...(J=P.parameters)==null?void 0:J.docs,source:{originalSource:`{
  name: 'Inside a Badge',
  render: () => <BAIFlex gap="sm" align="center">
      <Badge variant="warning" icon={<BAIProgressRing percent={99} />} label="TERMINATING" />
      <Badge variant="info" icon={<BAIProgressRing percent={12} />} label="PREPARING" />
      <Badge variant="warning" icon={<BAIProgressRing />} label="TERMINATING" />
    </BAIFlex>
}`,...(Q=(K=P.parameters)==null?void 0:K.docs)==null?void 0:Q.source}}};const pe=["Default","Determinate","Indeterminate","InsideABadge"];export{j as Default,N as Determinate,k as Indeterminate,P as InsideABadge,pe as __namedExportsOrder,le as default};
