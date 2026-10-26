import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t,t as n}from"./get-XGsHQfau.js";import{t as r}from"./jsx-runtime-MKhVqBIO.js";import{t as i}from"./compiler-runtime-CdReTaax.js";import{n as a,t as o}from"./BAIFlex-BOFoS5KY.js";import{n as s,t as c}from"./BAIBadge-4kSv2DEQ.js";var l,u,d,f;function p(){return(p=e((()=>{l=i(),s(),t(),u=r(),d={SUCCESS:`success`,FAILURE:`error`,STALE:`default`,NEED_RETRY:`warning`,EXPIRED:`error`,GIVE_UP:`error`,SKIPPED:`default`},f=e=>{"use memo";let t=(0,l.c)(12),r,i;t[0]===e?(r=t[1],i=t[2]):({result:i,...r}=e,t[0]=e,t[1]=r,t[2]=i);let a;t[3]===i?a=t[4]:(a=i?n(d,i):void 0,t[3]=i,t[4]=a);let o=a,s;t[5]===r.style?s=t[6]:(s={whiteSpace:`nowrap`,...r.style},t[5]=r.style,t[6]=s);let f;return t[7]!==r||t[8]!==i||t[9]!==o||t[10]!==s?(f=(0,u.jsx)(c,{...r,color:o,text:i,style:s}),t[7]=r,t[8]=i,t[9]=o,t[10]=s,t[11]=f):f=t[11],f}})))()}var m,h,g,_,v,y,b,x,S,C,w;function T(){return(T=e((()=>{a(),p(),m=r(),h={title:`Badge/BAISchedulingResultBadge`,component:f,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`
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
        `}}},argTypes:{result:{control:{type:`select`},options:[`SUCCESS`,`FAILURE`,`STALE`,`NEED_RETRY`,`EXPIRED`,`GIVE_UP`,`SKIPPED`,null],description:`The scheduling result status to display`,table:{type:{summary:`'SUCCESS' | 'FAILURE' | 'STALE' | 'NEED_RETRY' | 'EXPIRED' | 'GIVE_UP' | 'SKIPPED' | null`},defaultValue:{summary:`undefined`}}}}},g={name:`Basic`,parameters:{docs:{description:{story:`Basic usage showing a successful scheduling result with a green badge.`}}},args:{result:`SUCCESS`}},_={name:`FailureState`,parameters:{docs:{description:{story:`Shows a failed scheduling result with a red badge.`}}},args:{result:`FAILURE`}},v={name:`StaleState`,parameters:{docs:{description:{story:`Shows a stale scheduling result with a grey badge (default semantic color), indicating an inactive or outdated state.`}}},args:{result:`STALE`}},y={name:`NeedRetryState`,parameters:{docs:{description:{story:`Shows a need-retry result with a warning (orange) badge, indicating the scheduling attempt will be retried.`}}},args:{result:`NEED_RETRY`}},b={name:`ExpiredState`,parameters:{docs:{description:{story:`Shows an expired scheduling result with a red badge.`}}},args:{result:`EXPIRED`}},x={name:`GiveUpState`,parameters:{docs:{description:{story:`Shows a give-up scheduling result with a red badge, indicating all retry attempts were exhausted.`}}},args:{result:`GIVE_UP`}},S={name:`SkippedState`,parameters:{docs:{description:{story:`Shows a skipped scheduling result with a grey badge (default semantic color), indicating no processing occurred.`}}},args:{result:`SKIPPED`}},C={name:`AllStatuses`,parameters:{docs:{description:{story:`Displays all available scheduling result statuses for comparison. Colors are derived from Ant Design semantic tokens and adapt to the active theme.`}}},render:()=>(0,m.jsxs)(o,{direction:`column`,gap:`md`,children:[[`SUCCESS`,`FAILURE`,`STALE`,`NEED_RETRY`,`EXPIRED`,`GIVE_UP`,`SKIPPED`].map(e=>(0,m.jsx)(f,{result:e},e)),(0,m.jsx)(f,{result:null})]})},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source},description:{story:`Default state showing a successful scheduling result.`,...g.parameters?.docs?.description}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source},description:{story:`Failure state showing a failed scheduling result.`,..._.parameters?.docs?.description}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source},description:{story:`Stale state — outdated result with no action taken, shown in grey.`,...v.parameters?.docs?.description}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source},description:{story:`NeedRetry state — scheduling will be retried, shown in orange.`,...y.parameters?.docs?.description}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source},description:{story:`Expired state — scheduling timed out, shown in red.`,...b.parameters?.docs?.description}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source},description:{story:`GiveUp state — scheduling was abandoned after exhausting retries, shown in red.`,...x.parameters?.docs?.description}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source},description:{story:`Skipped state — scheduling was skipped without processing, shown in grey.`,...S.parameters?.docs?.description}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source},description:{story:`Display all status variants side by side for comparison.`,...C.parameters?.docs?.description}}},w=[`Default`,`Failure`,`Stale`,`NeedRetry`,`Expired`,`GiveUp`,`Skipped`,`AllStatuses`]})))()}T();export{C as AllStatuses,g as Default,b as Expired,_ as Failure,x as GiveUp,y as NeedRetry,S as Skipped,v as Stale,w as __namedExportsOrder,h as default};