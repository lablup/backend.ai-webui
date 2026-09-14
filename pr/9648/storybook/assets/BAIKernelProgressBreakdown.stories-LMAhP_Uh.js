import{c as $,a as C,aC as F,j as s,b as G}from"./iframe-Dd3Mf9Dy.js";import{a as z}from"./astryxTagVariant-CwljjlK9.js";import{B as b}from"./BAIFlex-n9B8OmQB.js";import"./preload-helper-Dp1pzeXC.js";const M=t=>z("session",t),O=(t,e)=>e>0?Math.max(0,Math.min(100,t/e*100)):0,V=t=>{"use memo";const e=$.c(37);let r,f,o,i,n,a;e[0]!==t?({phase:o,total:a,done:f,segments:n,className:r,...i}=t,e[0]=t,e[1]=r,e[2]=f,e[3]=o,e[4]=i,e[5]=n,e[6]=a):(r=e[1],f=e[2],o=e[3],i=e[4],n=e[5],a=e[6]);const{t:k}=C();let I;e[7]!==o||e[8]!==k?(I=k(o==="terminating"?"comp:BAIKernelProgressBreakdown.KernelTerminationProgress":"comp:BAIKernelProgressBreakdown.KernelStartupProgress"),e[7]=o,e[8]=k,e[9]=I):I=e[9];const c=I;let l;e[10]!==r?(l=F("bai-kernel-progress-breakdown",r),e[10]=r,e[11]=l):l=e[11];let u;e[12]!==c?(u=s.jsx(G,{type:"label",children:c}),e[12]=c,e[13]=u):u=e[13];const P=`${f} / ${a}`;let d;e[14]!==P?(d=s.jsx(G,{type:"label",hasTabularNumbers:!0,children:P}),e[14]=P,e[15]=d):d=e[15];let m;e[16]!==u||e[17]!==d?(m=s.jsxs(b,{justify:"between",align:"center",gap:"md",children:[u,d]}),e[16]=u,e[17]=d,e[18]=m):m=e[18];let p;if(e[19]!==n||e[20]!==a){let y;e[22]!==a?(y=T=>s.jsx("div",{className:"bai-kernel-progress-breakdown-segment","data-variant":M(T.status),"data-testid":`kernel-progress-segment-${T.status}`,style:{width:`${O(T.count,a)}%`}},T.status),e[22]=a,e[23]=y):y=e[23],p=n.filter(Z).map(y),e[19]=n,e[20]=a,e[21]=p}else p=e[21];let g;e[24]!==p?(g=s.jsx("div",{className:"bai-kernel-progress-breakdown-bar",children:p}),e[24]=p,e[25]=g):g=e[25];let h;e[26]!==n?(h=n.map(q),e[26]=n,e[27]=h):h=e[27];let N;e[28]!==h?(N=s.jsx(b,{direction:"column",align:"stretch",gap:"xxs",children:h}),e[28]=h,e[29]=N):N=e[29];let x;return e[30]!==i||e[31]!==N||e[32]!==l||e[33]!==m||e[34]!==g||e[35]!==c?(x=s.jsxs(b,{direction:"column",align:"stretch",gap:"xs",className:l,role:"group","aria-label":c,...i,children:[m,g,N]}),e[30]=i,e[31]=N,e[32]=l,e[33]=m,e[34]=g,e[35]=c,e[36]=x):x=e[36],x};function Z(t){return t.count>0}function q(t){const e=t.count<=0;return s.jsxs(b,{justify:"between",align:"center",gap:"md",children:[s.jsxs(b,{gap:"xs",align:"center",children:[s.jsx("span",{className:"bai-kernel-progress-breakdown-swatch","data-variant":M(t.status),"data-empty":e?"true":void 0}),s.jsx(G,{type:"supporting",color:e?"disabled":"primary",children:t.status})]}),s.jsx(G,{type:"supporting",color:e?"disabled":"primary",hasTabularNumbers:!0,children:t.count})]},t.status)}const X={title:"Feedback/BAIKernelProgressBreakdown",component:V,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:"\n**BAIKernelProgressBreakdown** is the readout behind a session status badge: `done / total`, a stacked bar sized `count / total` per bucket, and a legend.\n\nIt is purely presentational — the caller groups the kernel statuses into buckets and orders them, done bucket first. Zero-count buckets keep their legend row (muted) and draw no bar segment.\n\n| Prop | Type | Description |\n|------|------|-------------|\n| `phase` | `'creating' \\| 'terminating'` | Picks the title. |\n| `total` | `number` | Cluster size; denominator of the fraction and every segment. |\n| `done` | `number` | Kernels that reached the phase's target status. |\n| `segments` | `{ status, count }[]` | Buckets in display order. |\n        "}}},argTypes:{phase:{control:{type:"inline-radio"},options:["creating","terminating"]},total:{control:{type:"number"}},done:{control:{type:"number"}}}},w={name:"Basic",parameters:{docs:{description:{story:"A creating session whose kernels are spread over four buckets."}}},args:{phase:"creating",total:16,done:5,segments:[{status:"RUNNING",count:5},{status:"CREATING",count:4},{status:"PULLING",count:3},{status:"PENDING",count:4}]}},j={name:"Terminating, 119 of 120",args:{phase:"terminating",total:120,done:119,segments:[{status:"TERMINATED",count:119},{status:"TERMINATING",count:1},{status:"RUNNING",count:0}]}},B={name:"Single segment",args:{phase:"creating",total:8,done:0,segments:[{status:"RUNNING",count:0},{status:"PULLING",count:8}]}};var A,E,R;w.parameters={...w.parameters,docs:{...(A=w.parameters)==null?void 0:A.docs,source:{originalSource:`{
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
}`,...(R=(E=w.parameters)==null?void 0:E.docs)==null?void 0:R.source}}};var S,U,v;j.parameters={...j.parameters,docs:{...(S=j.parameters)==null?void 0:S.docs,source:{originalSource:`{
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
}`,...(v=(U=j.parameters)==null?void 0:U.docs)==null?void 0:v.source}}};var K,L,D;B.parameters={...B.parameters,docs:{...(K=B.parameters)==null?void 0:K.docs,source:{originalSource:`{
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
}`,...(D=(L=B.parameters)==null?void 0:L.docs)==null?void 0:D.source}}};const Y=["Default","Terminating","SingleSegment"];export{w as Default,B as SingleSegment,j as Terminating,Y as __namedExportsOrder,X as default};
