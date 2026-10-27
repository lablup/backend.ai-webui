import{n as e,o as t}from"./rolldown-runtime-2s6bX4vc.js";import{n,t as r}from"./useBAIi18n-BoXCk5K0.js";import{l as i}from"./iframe-DR2sIF5r.js";import{n as a,t as o}from"./BAIFlex-CAz1t6J5.js";import{n as s,t as c}from"./astryxTagVariant-Gg8xzDlT.js";import{jsx as l,jsxs as u}from"react/jsx-runtime";import{c as d}from"react/compiler-runtime";import{Text as f}from"@lablup/ui-common/Text";function p(e){return e.count>0}function m(e){let t=e.count<=0;return u(o,{justify:`between`,align:`center`,gap:`md`,children:[u(o,{gap:`xs`,align:`center`,children:[l(`span`,{className:`bai-kernel-progress-breakdown-swatch`,"data-variant":g(e.status),"data-empty":t?`true`:void 0}),l(f,{type:`supporting`,color:t?`disabled`:`primary`,children:e.status})]}),l(f,{type:`supporting`,color:t?`disabled`:`primary`,hasTabularNumbers:!0,children:e.count})]},e.status)}var h,g,_,v,y;function b(){return(b=e((()=>{s(),r(),a(),h=t(i(),1),g=e=>c(`session`,e),_=(e,t)=>t>0?Math.max(0,Math.min(100,e/t*100)):0,v=(e,t)=>Math.max(e,t.reduce((e,t)=>e+Math.max(0,t.count),0)),y=e=>{"use memo";let t=d(56),r,i,a,s,c,y;t[0]===e?(r=t[1],i=t[2],a=t[3],s=t[4],c=t[5],y=t[6]):({phase:a,total:y,done:i,segments:c,className:r,...s}=e,t[0]=e,t[1]=r,t[2]=i,t[3]=a,t[4]=s,t[5]=c,t[6]=y);let{t:b}=n(),x,S,C,w,T,E,D,O,k,A,j;if(t[7]!==r||t[8]!==i||t[9]!==a||t[10]!==s||t[11]!==c||t[12]!==b||t[13]!==y){let e=v(y,c),n;t[25]!==a||t[26]!==b?(n=b(a===`terminating`?`comp:BAIKernelProgressBreakdown.KernelTerminationProgress`:`comp:BAIKernelProgressBreakdown.KernelStartupProgress`),t[25]=a,t[26]=b,t[27]=n):n=t[27];let d=n;x=o,T=`column`,E=`stretch`,D=`xs`,t[28]===r?O=t[29]:(O=(0,h.default)(`bai-kernel-progress-breakdown`,r),t[28]=r,t[29]=O),k=`group`,A=d,j=s;let m;t[30]===d?m=t[31]:(m=l(f,{type:`label`,children:d}),t[30]=d,t[31]=m);let M=`${i} / ${y}`,N;t[32]===M?N=t[33]:(N=l(f,{type:`label`,hasTabularNumbers:!0,children:M}),t[32]=M,t[33]=N),t[34]!==m||t[35]!==N?(C=u(o,{justify:`between`,align:`center`,gap:`md`,children:[m,N]}),t[34]=m,t[35]=N,t[36]=C):C=t[36],S=`bai-kernel-progress-breakdown-bar`,w=c.filter(p).map(t=>l(`div`,{className:`bai-kernel-progress-breakdown-segment`,"data-variant":g(t.status),"data-testid":`kernel-progress-segment-${t.status}`,style:{width:`${_(t.count,e)}%`}},t.status)),t[7]=r,t[8]=i,t[9]=a,t[10]=s,t[11]=c,t[12]=b,t[13]=y,t[14]=x,t[15]=S,t[16]=C,t[17]=w,t[18]=T,t[19]=E,t[20]=D,t[21]=O,t[22]=k,t[23]=A,t[24]=j}else x=t[14],S=t[15],C=t[16],w=t[17],T=t[18],E=t[19],D=t[20],O=t[21],k=t[22],A=t[23],j=t[24];let M;t[37]!==S||t[38]!==w?(M=l(`div`,{className:S,children:w}),t[37]=S,t[38]=w,t[39]=M):M=t[39];let N;t[40]===c?N=t[41]:(N=c.map(m),t[40]=c,t[41]=N);let P;t[42]===N?P=t[43]:(P=l(o,{direction:`column`,align:`stretch`,gap:`xxs`,children:N}),t[42]=N,t[43]=P);let F;return t[44]!==x||t[45]!==C||t[46]!==M||t[47]!==P||t[48]!==T||t[49]!==E||t[50]!==D||t[51]!==O||t[52]!==k||t[53]!==A||t[54]!==j?(F=u(x,{direction:T,align:E,gap:D,className:O,role:k,"aria-label":A,...j,children:[C,M,P]}),t[44]=x,t[45]=C,t[46]=M,t[47]=P,t[48]=T,t[49]=E,t[50]=D,t[51]=O,t[52]=k,t[53]=A,t[54]=j,t[55]=F):F=t[55],F}})))()}var x,S,C,w,T;function E(){return(E=e((()=>{b(),x={title:`Feedback/BAIKernelProgressBreakdown`,component:y,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:"\n**BAIKernelProgressBreakdown** is the readout behind a session status badge: `done / total`, a stacked bar sized `count / total` per bucket, and a legend.\n\nIt is purely presentational — the caller groups the kernel statuses into buckets and orders them, done bucket first. Zero-count buckets keep their legend row (muted) and draw no bar segment.\n\n| Prop | Type | Description |\n|------|------|-------------|\n| `phase` | `'creating' \\| 'terminating'` | Picks the title. |\n| `total` | `number` | Cluster size; denominator of the fraction and every segment. |\n| `done` | `number` | Kernels that reached the phase's target status. |\n| `segments` | `{ status, count }[]` | Buckets in display order. |\n        "}}},argTypes:{phase:{control:{type:`inline-radio`},options:[`creating`,`terminating`]},total:{control:{type:`number`}},done:{control:{type:`number`}}}},S={name:`Basic`,parameters:{docs:{description:{story:`A creating session whose kernels are spread over four buckets.`}}},args:{phase:`creating`,total:16,done:5,segments:[{status:`RUNNING`,count:5},{status:`CREATING`,count:4},{status:`PULLING`,count:3},{status:`PENDING`,count:4}]}},C={name:`Terminating, 119 of 120`,args:{phase:`terminating`,total:120,done:119,segments:[{status:`TERMINATED`,count:119},{status:`TERMINATING`,count:1},{status:`RUNNING`,count:0}]}},w={name:`Single segment`,args:{phase:`creating`,total:8,done:0,segments:[{status:`RUNNING`,count:0},{status:`PULLING`,count:8}]}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
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
}`,...w.parameters?.docs?.source}}},T=[`Default`,`Terminating`,`SingleSegment`]})))()}E();export{S as Default,w as SingleSegment,C as Terminating,T as __namedExportsOrder,x as default};