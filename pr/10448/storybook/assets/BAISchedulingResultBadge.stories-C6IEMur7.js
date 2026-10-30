import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t,t as n}from"./get-ClE-bzXR.js";import{t as r}from"./jsx-runtime-MKhVqBIO.js";import{t as i}from"./compiler-runtime-CdReTaax.js";import{n as a,t as o}from"./BAIFlex-BOFoS5KY.js";import{n as s,t as c}from"./BAIBadge-DbrOBQ6g.js";var l,u,d,f;function p(){return(p=e((()=>{l=i(),s(),t(),u=r(),d={SUCCESS:`success`,FAILURE:`error`,STALE:`default`,NEED_RETRY:`warning`,EXPIRED:`error`,GIVE_UP:`error`,SKIPPED:`default`},f=e=>{"use memo";let t=(0,l.c)(12),r,i;t[0]===e?(r=t[1],i=t[2]):({result:i,...r}=e,t[0]=e,t[1]=r,t[2]=i);let a;t[3]===i?a=t[4]:(a=i?n(d,i):void 0,t[3]=i,t[4]=a);let o=a,s;t[5]===r.style?s=t[6]:(s={whiteSpace:`nowrap`,...r.style},t[5]=r.style,t[6]=s);let f;return t[7]!==r||t[8]!==i||t[9]!==o||t[10]!==s?(f=(0,u.jsx)(c,{...r,color:o,text:i,style:s}),t[7]=r,t[8]=i,t[9]=o,t[10]=s,t[11]=f):f=t[11],f}})))()}var m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J;function Y(){return(Y=e((()=>{a(),p(),m=r(),z={title:`Badge/BAISchedulingResultBadge`,component:f,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`
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
        `}}},argTypes:{result:{control:{type:`select`},options:[`SUCCESS`,`FAILURE`,`STALE`,`NEED_RETRY`,`EXPIRED`,`GIVE_UP`,`SKIPPED`,null],description:`The scheduling result status to display`,table:{type:{summary:`'SUCCESS' | 'FAILURE' | 'STALE' | 'NEED_RETRY' | 'EXPIRED' | 'GIVE_UP' | 'SKIPPED' | null`},defaultValue:{summary:`undefined`}}}}},B={name:`Basic`,parameters:{docs:{description:{story:`Basic usage showing a successful scheduling result with a green badge.`}}},args:{result:`SUCCESS`}},V={name:`FailureState`,parameters:{docs:{description:{story:`Shows a failed scheduling result with a red badge.`}}},args:{result:`FAILURE`}},H={name:`StaleState`,parameters:{docs:{description:{story:`Shows a stale scheduling result with a grey badge (default semantic color), indicating an inactive or outdated state.`}}},args:{result:`STALE`}},U={name:`NeedRetryState`,parameters:{docs:{description:{story:`Shows a need-retry result with a warning (orange) badge, indicating the scheduling attempt will be retried.`}}},args:{result:`NEED_RETRY`}},W={name:`ExpiredState`,parameters:{docs:{description:{story:`Shows an expired scheduling result with a red badge.`}}},args:{result:`EXPIRED`}},G={name:`GiveUpState`,parameters:{docs:{description:{story:`Shows a give-up scheduling result with a red badge, indicating all retry attempts were exhausted.`}}},args:{result:`GIVE_UP`}},K={name:`SkippedState`,parameters:{docs:{description:{story:`Shows a skipped scheduling result with a grey badge (default semantic color), indicating no processing occurred.`}}},args:{result:`SKIPPED`}},q={name:`AllStatuses`,parameters:{docs:{description:{story:`Displays all available scheduling result statuses for comparison. Colors are derived from Ant Design semantic tokens and adapt to the active theme.`}}},render:()=>(0,m.jsxs)(o,{direction:`column`,gap:`md`,children:[[`SUCCESS`,`FAILURE`,`STALE`,`NEED_RETRY`,`EXPIRED`,`GIVE_UP`,`SKIPPED`].map(e=>(0,m.jsx)(f,{result:e},e)),(0,m.jsx)(f,{result:null})]})},B.parameters={...B.parameters,docs:{...(h=B.parameters)==null?void 0:h.docs,source:{originalSource:`{
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
}`,...(g=B.parameters)==null||(g=g.docs)==null?void 0:g.source},description:{story:`Default state showing a successful scheduling result.`,...(_=B.parameters)==null||(_=_.docs)==null?void 0:_.description}}},V.parameters={...V.parameters,docs:{...(v=V.parameters)==null?void 0:v.docs,source:{originalSource:`{
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
}`,...(y=V.parameters)==null||(y=y.docs)==null?void 0:y.source},description:{story:`Failure state showing a failed scheduling result.`,...(b=V.parameters)==null||(b=b.docs)==null?void 0:b.description}}},H.parameters={...H.parameters,docs:{...(x=H.parameters)==null?void 0:x.docs,source:{originalSource:`{
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
}`,...(S=H.parameters)==null||(S=S.docs)==null?void 0:S.source},description:{story:`Stale state — outdated result with no action taken, shown in grey.`,...(C=H.parameters)==null||(C=C.docs)==null?void 0:C.description}}},U.parameters={...U.parameters,docs:{...(w=U.parameters)==null?void 0:w.docs,source:{originalSource:`{
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
}`,...(T=U.parameters)==null||(T=T.docs)==null?void 0:T.source},description:{story:`NeedRetry state — scheduling will be retried, shown in orange.`,...(E=U.parameters)==null||(E=E.docs)==null?void 0:E.description}}},W.parameters={...W.parameters,docs:{...(D=W.parameters)==null?void 0:D.docs,source:{originalSource:`{
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
}`,...(O=W.parameters)==null||(O=O.docs)==null?void 0:O.source},description:{story:`Expired state — scheduling timed out, shown in red.`,...(k=W.parameters)==null||(k=k.docs)==null?void 0:k.description}}},G.parameters={...G.parameters,docs:{...(A=G.parameters)==null?void 0:A.docs,source:{originalSource:`{
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
}`,...(j=G.parameters)==null||(j=j.docs)==null?void 0:j.source},description:{story:`GiveUp state — scheduling was abandoned after exhausting retries, shown in red.`,...(M=G.parameters)==null||(M=M.docs)==null?void 0:M.description}}},K.parameters={...K.parameters,docs:{...(N=K.parameters)==null?void 0:N.docs,source:{originalSource:`{
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
}`,...(P=K.parameters)==null||(P=P.docs)==null?void 0:P.source},description:{story:`Skipped state — scheduling was skipped without processing, shown in grey.`,...(F=K.parameters)==null||(F=F.docs)==null?void 0:F.description}}},q.parameters={...q.parameters,docs:{...(I=q.parameters)==null?void 0:I.docs,source:{originalSource:`{
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
}`,...(L=q.parameters)==null||(L=L.docs)==null?void 0:L.source},description:{story:`Display all status variants side by side for comparison.`,...(R=q.parameters)==null||(R=R.docs)==null?void 0:R.description}}},J=[`Default`,`Failure`,`Stale`,`NeedRetry`,`Expired`,`GiveUp`,`Skipped`,`AllStatuses`]})))()}Y();export{q as AllStatuses,B as Default,W as Expired,V as Failure,G as GiveUp,U as NeedRetry,K as Skipped,H as Stale,J as __namedExportsOrder,z as default};