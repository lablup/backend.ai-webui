import{c as H,a as J,aC as Q,j as s,b as v}from"./iframe-ClaYfKXj.js";import{b as W}from"./astryxTagVariant-DMDpeCrV.js";import{B}from"./BAIFlex-GVreef12.js";import"./preload-helper-Dp1pzeXC.js";const Z=t=>W("session",t),X=(t,e)=>e>0?Math.max(0,Math.min(100,t/e*100)):0,Y=(t,e)=>Math.max(t,e.reduce((n,r)=>n+Math.max(0,r.count),0)),_=t=>{"use memo";const e=H.c(56);let n,r,o,u,a,l;e[0]!==t?({phase:o,total:l,done:r,segments:a,className:n,...u}=t,e[0]=t,e[1]=n,e[2]=r,e[3]=o,e[4]=u,e[5]=a,e[6]=l):(n=e[1],r=e[2],o=e[3],u=e[4],a=e[5],l=e[6]);const{t:d}=J();let m,p,i,g,h,N,b,c,f,k,I;if(e[7]!==n||e[8]!==r||e[9]!==o||e[10]!==u||e[11]!==a||e[12]!==d||e[13]!==l){const q=Y(l,a);let P;e[25]!==o||e[26]!==d?(P=d(o==="terminating"?"comp:BAIKernelProgressBreakdown.KernelTerminationProgress":"comp:BAIKernelProgressBreakdown.KernelStartupProgress"),e[25]=o,e[26]=d,e[27]=P):P=e[27];const A=P;m=B,h="column",N="stretch",b="xs",e[28]!==n?(c=Q("bai-kernel-progress-breakdown",n),e[28]=n,e[29]=c):c=e[29],f="group",k=A,I=u;let w;e[30]!==A?(w=s.jsx(v,{type:"label",children:A}),e[30]=A,e[31]=w):w=e[31];const D=`${r} / ${l}`;let j;e[32]!==D?(j=s.jsx(v,{type:"label",hasTabularNumbers:!0,children:D}),e[32]=D,e[33]=j):j=e[33],e[34]!==w||e[35]!==j?(i=s.jsxs(B,{justify:"between",align:"center",gap:"md",children:[w,j]}),e[34]=w,e[35]=j,e[36]=i):i=e[36],p="bai-kernel-progress-breakdown-bar",g=a.filter(ee).map(E=>s.jsx("div",{className:"bai-kernel-progress-breakdown-segment","data-variant":Z(E.status),"data-testid":`kernel-progress-segment-${E.status}`,style:{width:`${X(E.count,q)}%`}},E.status)),e[7]=n,e[8]=r,e[9]=o,e[10]=u,e[11]=a,e[12]=d,e[13]=l,e[14]=m,e[15]=p,e[16]=i,e[17]=g,e[18]=h,e[19]=N,e[20]=b,e[21]=c,e[22]=f,e[23]=k,e[24]=I}else m=e[14],p=e[15],i=e[16],g=e[17],h=e[18],N=e[19],b=e[20],c=e[21],f=e[22],k=e[23],I=e[24];let x;e[37]!==p||e[38]!==g?(x=s.jsx("div",{className:p,children:g}),e[37]=p,e[38]=g,e[39]=x):x=e[39];let y;e[40]!==a?(y=a.map(te),e[40]=a,e[41]=y):y=e[41];let T;e[42]!==y?(T=s.jsx(B,{direction:"column",align:"stretch",gap:"xxs",children:y}),e[42]=y,e[43]=T):T=e[43];let G;return e[44]!==m||e[45]!==i||e[46]!==x||e[47]!==T||e[48]!==h||e[49]!==N||e[50]!==b||e[51]!==c||e[52]!==f||e[53]!==k||e[54]!==I?(G=s.jsxs(m,{direction:h,align:N,gap:b,className:c,role:f,"aria-label":k,...I,children:[i,x,T]}),e[44]=m,e[45]=i,e[46]=x,e[47]=T,e[48]=h,e[49]=N,e[50]=b,e[51]=c,e[52]=f,e[53]=k,e[54]=I,e[55]=G):G=e[55],G};function ee(t){return t.count>0}function te(t){const e=t.count<=0;return s.jsxs(B,{justify:"between",align:"center",gap:"md",children:[s.jsxs(B,{gap:"xs",align:"center",children:[s.jsx("span",{className:"bai-kernel-progress-breakdown-swatch","data-variant":Z(t.status),"data-empty":e?"true":void 0}),s.jsx(v,{type:"supporting",color:e?"disabled":"primary",children:t.status})]}),s.jsx(v,{type:"supporting",color:e?"disabled":"primary",hasTabularNumbers:!0,children:t.count})]},t.status)}const oe={title:"Feedback/BAIKernelProgressBreakdown",component:_,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:"\n**BAIKernelProgressBreakdown** is the readout behind a session status badge: `done / total`, a stacked bar sized `count / total` per bucket, and a legend.\n\nIt is purely presentational — the caller groups the kernel statuses into buckets and orders them, done bucket first. Zero-count buckets keep their legend row (muted) and draw no bar segment.\n\n| Prop | Type | Description |\n|------|------|-------------|\n| `phase` | `'creating' \\| 'terminating'` | Picks the title. |\n| `total` | `number` | Cluster size; denominator of the fraction and every segment. |\n| `done` | `number` | Kernels that reached the phase's target status. |\n| `segments` | `{ status, count }[]` | Buckets in display order. |\n        "}}},argTypes:{phase:{control:{type:"inline-radio"},options:["creating","terminating"]},total:{control:{type:"number"}},done:{control:{type:"number"}}}},R={name:"Basic",parameters:{docs:{description:{story:"A creating session whose kernels are spread over four buckets."}}},args:{phase:"creating",total:16,done:5,segments:[{status:"RUNNING",count:5},{status:"CREATING",count:4},{status:"PULLING",count:3},{status:"PENDING",count:4}]}},S={name:"Terminating, 119 of 120",args:{phase:"terminating",total:120,done:119,segments:[{status:"TERMINATED",count:119},{status:"TERMINATING",count:1},{status:"RUNNING",count:0}]}},U={name:"Single segment",args:{phase:"creating",total:8,done:0,segments:[{status:"RUNNING",count:0},{status:"PULLING",count:8}]}};var K,L,M;R.parameters={...R.parameters,docs:{...(K=R.parameters)==null?void 0:K.docs,source:{originalSource:`{
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'A creating session whose kernels are spread over four buckets.'
      }
    }
  },
  args: {
    phase: 'creating',
    total: 16,
    done: 5,
    segments: [{
      status: 'RUNNING',
      count: 5
    }, {
      status: 'CREATING',
      count: 4
    }, {
      status: 'PULLING',
      count: 3
    }, {
      status: 'PENDING',
      count: 4
    }]
  }
}`,...(M=(L=R.parameters)==null?void 0:L.docs)==null?void 0:M.source}}};var $,C,F;S.parameters={...S.parameters,docs:{...($=S.parameters)==null?void 0:$.docs,source:{originalSource:`{
  name: 'Terminating, 119 of 120',
  args: {
    phase: 'terminating',
    total: 120,
    done: 119,
    segments: [{
      status: 'TERMINATED',
      count: 119
    }, {
      status: 'TERMINATING',
      count: 1
    }, {
      status: 'RUNNING',
      count: 0
    }]
  }
}`,...(F=(C=S.parameters)==null?void 0:C.docs)==null?void 0:F.source}}};var z,O,V;U.parameters={...U.parameters,docs:{...(z=U.parameters)==null?void 0:z.docs,source:{originalSource:`{
  name: 'Single segment',
  args: {
    phase: 'creating',
    total: 8,
    done: 0,
    segments: [{
      status: 'RUNNING',
      count: 0
    }, {
      status: 'PULLING',
      count: 8
    }]
  }
}`,...(V=(O=U.parameters)==null?void 0:O.docs)==null?void 0:V.source}}};const ie=["Default","Terminating","SingleSegment"];export{R as Default,U as SingleSegment,S as Terminating,ie as __namedExportsOrder,oe as default};
