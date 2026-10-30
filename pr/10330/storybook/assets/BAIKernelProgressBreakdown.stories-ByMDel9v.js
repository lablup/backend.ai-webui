import{a as e,n as t}from"./rolldown-runtime-sJBDdmOt.js";import{t as n}from"./jsx-runtime-MKhVqBIO.js";import{n as r,t as i}from"./useBAIi18n-kiXK4eRk.js";import{t as a}from"./compiler-runtime-DU4U6aph.js";import{n as o,t as s}from"./Text-Cj3JSrHf.js";import{g as c}from"./iframe-CR8zXqEf.js";import{n as l,t as u}from"./BAIFlex-DnaoYTJ1.js";import{n as d,t as f}from"./astryxTagVariant-0xB0K5Rk.js";function p(e){return e.count>0}function m(e){let t=e.count<=0;return(0,_.jsxs)(u,{justify:`between`,align:`center`,gap:`md`,children:[(0,_.jsxs)(u,{gap:`xs`,align:`center`,children:[(0,_.jsx)(`span`,{className:`bai-kernel-progress-breakdown-swatch`,"data-variant":v(e.status),"data-empty":t?`true`:void 0}),(0,_.jsx)(s,{type:`supporting`,color:t?`disabled`:`primary`,children:e.status})]}),(0,_.jsx)(s,{type:`supporting`,color:t?`disabled`:`primary`,hasTabularNumbers:!0,children:e.count})]},e.status)}var h,g,_,v,y,b,x;function S(){return(S=t((()=>{h=a(),d(),i(),l(),o(),g=e(c(),1),_=n(),v=e=>f(`session`,e),y=(e,t)=>t>0?Math.max(0,Math.min(100,e/t*100)):0,b=(e,t)=>Math.max(e,t.reduce((e,t)=>e+Math.max(0,t.count),0)),x=e=>{"use memo";let t=(0,h.c)(56),n,i,a,o,c,l;t[0]===e?(n=t[1],i=t[2],a=t[3],o=t[4],c=t[5],l=t[6]):({phase:a,total:l,done:i,segments:c,className:n,...o}=e,t[0]=e,t[1]=n,t[2]=i,t[3]=a,t[4]=o,t[5]=c,t[6]=l);let{t:d}=r(),f,x,S,C,w,T,E,D,O,k,A;if(t[7]!==n||t[8]!==i||t[9]!==a||t[10]!==o||t[11]!==c||t[12]!==d||t[13]!==l){let e=b(l,c),r;t[25]!==a||t[26]!==d?(r=d(a===`terminating`?`comp:BAIKernelProgressBreakdown.KernelTerminationProgress`:`comp:BAIKernelProgressBreakdown.KernelStartupProgress`),t[25]=a,t[26]=d,t[27]=r):r=t[27];let m=r;f=u,w=`column`,T=`stretch`,E=`xs`,t[28]===n?D=t[29]:(D=(0,g.default)(`bai-kernel-progress-breakdown`,n),t[28]=n,t[29]=D),O=`group`,k=m,A=o;let h;t[30]===m?h=t[31]:(h=(0,_.jsx)(s,{type:`label`,children:m}),t[30]=m,t[31]=h);let j=`${i} / ${l}`,M;t[32]===j?M=t[33]:(M=(0,_.jsx)(s,{type:`label`,hasTabularNumbers:!0,children:j}),t[32]=j,t[33]=M),t[34]!==h||t[35]!==M?(S=(0,_.jsxs)(u,{justify:`between`,align:`center`,gap:`md`,children:[h,M]}),t[34]=h,t[35]=M,t[36]=S):S=t[36],x=`bai-kernel-progress-breakdown-bar`,C=c.filter(p).map(t=>(0,_.jsx)(`div`,{className:`bai-kernel-progress-breakdown-segment`,"data-variant":v(t.status),"data-testid":`kernel-progress-segment-${t.status}`,style:{width:`${y(t.count,e)}%`}},t.status)),t[7]=n,t[8]=i,t[9]=a,t[10]=o,t[11]=c,t[12]=d,t[13]=l,t[14]=f,t[15]=x,t[16]=S,t[17]=C,t[18]=w,t[19]=T,t[20]=E,t[21]=D,t[22]=O,t[23]=k,t[24]=A}else f=t[14],x=t[15],S=t[16],C=t[17],w=t[18],T=t[19],E=t[20],D=t[21],O=t[22],k=t[23],A=t[24];let j;t[37]!==x||t[38]!==C?(j=(0,_.jsx)(`div`,{className:x,children:C}),t[37]=x,t[38]=C,t[39]=j):j=t[39];let M;t[40]===c?M=t[41]:(M=c.map(m),t[40]=c,t[41]=M);let N;t[42]===M?N=t[43]:(N=(0,_.jsx)(u,{direction:`column`,align:`stretch`,gap:`xxs`,children:M}),t[42]=M,t[43]=N);let P;return t[44]!==f||t[45]!==S||t[46]!==j||t[47]!==N||t[48]!==w||t[49]!==T||t[50]!==E||t[51]!==D||t[52]!==O||t[53]!==k||t[54]!==A?(P=(0,_.jsxs)(f,{direction:w,align:T,gap:E,className:D,role:O,"aria-label":k,...A,children:[S,j,N]}),t[44]=f,t[45]=S,t[46]=j,t[47]=N,t[48]=w,t[49]=T,t[50]=E,t[51]=D,t[52]=O,t[53]=k,t[54]=A,t[55]=P):P=t[55],P}})))()}var C,w,T,E,D,O,k,A,j,M,N;function P(){return(P=t((()=>{S(),k={title:`Feedback/BAIKernelProgressBreakdown`,component:x,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:"\n**BAIKernelProgressBreakdown** is the readout behind a session status badge: `done / total`, a stacked bar sized `count / total` per bucket, and a legend.\n\nIt is purely presentational — the caller groups the kernel statuses into buckets and orders them, done bucket first. Zero-count buckets keep their legend row (muted) and draw no bar segment.\n\n| Prop | Type | Description |\n|------|------|-------------|\n| `phase` | `'creating' \\| 'terminating'` | Picks the title. |\n| `total` | `number` | Cluster size; denominator of the fraction and every segment. |\n| `done` | `number` | Kernels that reached the phase's target status. |\n| `segments` | `{ status, count }[]` | Buckets in display order. |\n        "}}},argTypes:{phase:{control:{type:`inline-radio`},options:[`creating`,`terminating`]},total:{control:{type:`number`}},done:{control:{type:`number`}}}},A={name:`Basic`,parameters:{docs:{description:{story:`A creating session whose kernels are spread over four buckets.`}}},args:{phase:`creating`,total:16,done:5,segments:[{status:`RUNNING`,count:5},{status:`CREATING`,count:4},{status:`PULLING`,count:3},{status:`PENDING`,count:4}]}},j={name:`Terminating, 119 of 120`,args:{phase:`terminating`,total:120,done:119,segments:[{status:`TERMINATED`,count:119},{status:`TERMINATING`,count:1},{status:`RUNNING`,count:0}]}},M={name:`Single segment`,args:{phase:`creating`,total:8,done:0,segments:[{status:`RUNNING`,count:0},{status:`PULLING`,count:8}]}},A.parameters={...A.parameters,docs:{...(C=A.parameters)==null?void 0:C.docs,source:{originalSource:`{
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
}`,...(w=A.parameters)==null||(w=w.docs)==null?void 0:w.source}}},j.parameters={...j.parameters,docs:{...(T=j.parameters)==null?void 0:T.docs,source:{originalSource:`{
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
}`,...(E=j.parameters)==null||(E=E.docs)==null?void 0:E.source}}},M.parameters={...M.parameters,docs:{...(D=M.parameters)==null?void 0:D.docs,source:{originalSource:`{
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
}`,...(O=M.parameters)==null||(O=O.docs)==null?void 0:O.source}}},N=[`Default`,`Terminating`,`SingleSegment`]})))()}P();export{A as Default,M as SingleSegment,j as Terminating,N as __namedExportsOrder,k as default};