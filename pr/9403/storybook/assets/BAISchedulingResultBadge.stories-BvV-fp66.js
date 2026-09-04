import{c as ae,j as S}from"./iframe-Bft8_CcP.js";import{B as ne}from"./BAIFlex-Dr7gFJZD.js";import{B as ie}from"./BAIBadge-ohimdVGf.js";import{g as oe}from"./get-CVxF9CCK.js";import"./preload-helper-Dp1pzeXC.js";import"./isRenderable-BUV0eL6r.js";import"./_baseGet-CwdrCcVW.js";import"./isSymbol-Bzz_hE9W.js";import"./toString-CEnA32jd.js";const de={SUCCESS:"success",FAILURE:"error",STALE:"default",NEED_RETRY:"warning",EXPIRED:"error",GIVE_UP:"error",SKIPPED:"default"},h=a=>{"use memo";const e=ae.c(12);let t,s;e[0]!==a?({result:s,...t}=a,e[0]=a,e[1]=t,e[2]=s):(t=e[1],s=e[2]);let g;e[3]!==s?(g=s?oe(de,s):void 0,e[3]=s,e[4]=g):g=e[4];const E=g;let r;e[5]!==t.style?(r={whiteSpace:"nowrap",...t.style},e[5]=t.style,e[6]=r):r=e[6];let m;return e[7]!==t||e[8]!==s||e[9]!==E||e[10]!==r?(m=S.jsx(ie,{...t,color:E,text:s,style:r}),e[7]=t,e[8]=s,e[9]=E,e[10]=r,e[11]=m):m=e[11],m},ye={title:"Badge/BAISchedulingResultBadge",component:h,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:`
**BAISchedulingResultBadge** displays scheduling result status with semantic color-coded badges.

## Features
- Semantic color system using Ant Design design tokens (theme-aware)
- SUCCESS → success (green)
- FAILURE / EXPIRED / GIVE_UP → error (red)
- NEED_RETRY → warning (orange)
- STALE / SKIPPED → default (grey)

## Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| result | \`SchedulingResult \\| null\` | - | The scheduling result to display |

## Usage
\`\`\`tsx
<BAISchedulingResultBadge result="SUCCESS" />
<BAISchedulingResultBadge result="NEED_RETRY" />
<BAISchedulingResultBadge result="SKIPPED" />
\`\`\`
        `}}},argTypes:{result:{control:{type:"select"},options:["SUCCESS","FAILURE","STALE","NEED_RETRY","EXPIRED","GIVE_UP","SKIPPED",null],description:"The scheduling result status to display",table:{type:{summary:"'SUCCESS' | 'FAILURE' | 'STALE' | 'NEED_RETRY' | 'EXPIRED' | 'GIVE_UP' | 'SKIPPED' | null"},defaultValue:{summary:"undefined"}}}}},n={name:"Basic",parameters:{docs:{description:{story:"Basic usage showing a successful scheduling result with a green badge."}}},args:{result:"SUCCESS"}},i={name:"FailureState",parameters:{docs:{description:{story:"Shows a failed scheduling result with a red badge."}}},args:{result:"FAILURE"}},o={name:"StaleState",parameters:{docs:{description:{story:"Shows a stale scheduling result with a grey badge (default semantic color), indicating an inactive or outdated state."}}},args:{result:"STALE"}},d={name:"NeedRetryState",parameters:{docs:{description:{story:"Shows a need-retry result with a warning (orange) badge, indicating the scheduling attempt will be retried."}}},args:{result:"NEED_RETRY"}},c={name:"ExpiredState",parameters:{docs:{description:{story:"Shows an expired scheduling result with a red badge."}}},args:{result:"EXPIRED"}},l={name:"GiveUpState",parameters:{docs:{description:{story:"Shows a give-up scheduling result with a red badge, indicating all retry attempts were exhausted."}}},args:{result:"GIVE_UP"}},u={name:"SkippedState",parameters:{docs:{description:{story:"Shows a skipped scheduling result with a grey badge (default semantic color), indicating no processing occurred."}}},args:{result:"SKIPPED"}},p={name:"AllStatuses",parameters:{docs:{description:{story:"Displays all available scheduling result statuses for comparison. Colors are derived from Ant Design semantic tokens and adapt to the active theme."}}},render:()=>{const a=["SUCCESS","FAILURE","STALE","NEED_RETRY","EXPIRED","GIVE_UP","SKIPPED"];return S.jsxs(ne,{direction:"column",gap:"md",children:[a.map(e=>S.jsx(h,{result:e},e)),S.jsx(h,{result:null})]})}};var y,w,R,I,D;n.parameters={...n.parameters,docs:{...(y=n.parameters)==null?void 0:y.docs,source:{originalSource:`{
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'Basic usage showing a successful scheduling result with a green badge.'
      }
    }
  },
  args: {
    result: 'SUCCESS'
  }
}`,...(R=(w=n.parameters)==null?void 0:w.docs)==null?void 0:R.source},description:{story:"Default state showing a successful scheduling result.",...(D=(I=n.parameters)==null?void 0:I.docs)==null?void 0:D.description}}};var P,A,f,U,B;i.parameters={...i.parameters,docs:{...(P=i.parameters)==null?void 0:P.docs,source:{originalSource:`{
  name: 'FailureState',
  parameters: {
    docs: {
      description: {
        story: 'Shows a failed scheduling result with a red badge.'
      }
    }
  },
  args: {
    result: 'FAILURE'
  }
}`,...(f=(A=i.parameters)==null?void 0:A.docs)==null?void 0:f.source},description:{story:"Failure state showing a failed scheduling result.",...(B=(U=i.parameters)==null?void 0:U.docs)==null?void 0:B.description}}};var b,x,C,T,_;o.parameters={...o.parameters,docs:{...(b=o.parameters)==null?void 0:b.docs,source:{originalSource:`{
  name: 'StaleState',
  parameters: {
    docs: {
      description: {
        story: 'Shows a stale scheduling result with a grey badge (default semantic color), indicating an inactive or outdated state.'
      }
    }
  },
  args: {
    result: 'STALE'
  }
}`,...(C=(x=o.parameters)==null?void 0:x.docs)==null?void 0:C.source},description:{story:"Stale state — outdated result with no action taken, shown in grey.",...(_=(T=o.parameters)==null?void 0:T.docs)==null?void 0:_.description}}};var v,F,L,N,k;d.parameters={...d.parameters,docs:{...(v=d.parameters)==null?void 0:v.docs,source:{originalSource:`{
  name: 'NeedRetryState',
  parameters: {
    docs: {
      description: {
        story: 'Shows a need-retry result with a warning (orange) badge, indicating the scheduling attempt will be retried.'
      }
    }
  },
  args: {
    result: 'NEED_RETRY'
  }
}`,...(L=(F=d.parameters)==null?void 0:F.docs)==null?void 0:L.source},description:{story:"NeedRetry state — scheduling will be retried, shown in orange.",...(k=(N=d.parameters)==null?void 0:N.docs)==null?void 0:k.description}}};var G,K,V,Y,X;c.parameters={...c.parameters,docs:{...(G=c.parameters)==null?void 0:G.docs,source:{originalSource:`{
  name: 'ExpiredState',
  parameters: {
    docs: {
      description: {
        story: 'Shows an expired scheduling result with a red badge.'
      }
    }
  },
  args: {
    result: 'EXPIRED'
  }
}`,...(V=(K=c.parameters)==null?void 0:K.docs)==null?void 0:V.source},description:{story:"Expired state — scheduling timed out, shown in red.",...(X=(Y=c.parameters)==null?void 0:Y.docs)==null?void 0:X.description}}};var j,M,O,$,q;l.parameters={...l.parameters,docs:{...(j=l.parameters)==null?void 0:j.docs,source:{originalSource:`{
  name: 'GiveUpState',
  parameters: {
    docs: {
      description: {
        story: 'Shows a give-up scheduling result with a red badge, indicating all retry attempts were exhausted.'
      }
    }
  },
  args: {
    result: 'GIVE_UP'
  }
}`,...(O=(M=l.parameters)==null?void 0:M.docs)==null?void 0:O.source},description:{story:"GiveUp state — scheduling was abandoned after exhausting retries, shown in red.",...(q=($=l.parameters)==null?void 0:$.docs)==null?void 0:q.description}}};var z,H,J,Q,W;u.parameters={...u.parameters,docs:{...(z=u.parameters)==null?void 0:z.docs,source:{originalSource:`{
  name: 'SkippedState',
  parameters: {
    docs: {
      description: {
        story: 'Shows a skipped scheduling result with a grey badge (default semantic color), indicating no processing occurred.'
      }
    }
  },
  args: {
    result: 'SKIPPED'
  }
}`,...(J=(H=u.parameters)==null?void 0:H.docs)==null?void 0:J.source},description:{story:"Skipped state — scheduling was skipped without processing, shown in grey.",...(W=(Q=u.parameters)==null?void 0:Q.docs)==null?void 0:W.description}}};var Z,ee,se,te,re;p.parameters={...p.parameters,docs:{...(Z=p.parameters)==null?void 0:Z.docs,source:{originalSource:`{
  name: 'AllStatuses',
  parameters: {
    docs: {
      description: {
        story: 'Displays all available scheduling result statuses for comparison. Colors are derived from Ant Design semantic tokens and adapt to the active theme.'
      }
    }
  },
  render: () => {
    const statuses: SchedulingResult[] = ['SUCCESS', 'FAILURE', 'STALE', 'NEED_RETRY', 'EXPIRED', 'GIVE_UP', 'SKIPPED'];
    return <BAIFlex direction="column" gap="md">
        {statuses.map(status => <BAISchedulingResultBadge key={status} result={status} />)}
        <BAISchedulingResultBadge result={null} />
      </BAIFlex>;
  }
}`,...(se=(ee=p.parameters)==null?void 0:ee.docs)==null?void 0:se.source},description:{story:"Display all status variants side by side for comparison.",...(re=(te=p.parameters)==null?void 0:te.docs)==null?void 0:re.description}}};const we=["Default","Failure","Stale","NeedRetry","Expired","GiveUp","Skipped","AllStatuses"];export{p as AllStatuses,n as Default,c as Expired,i as Failure,l as GiveUp,d as NeedRetry,u as Skipped,o as Stale,we as __namedExportsOrder,ye as default};
