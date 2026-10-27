import{n as e}from"./rolldown-runtime-2s6bX4vc.js";import{n as t,t as n}from"./get-B70pLbeK.js";import{n as r,t as i}from"./BAIFlex-CAz1t6J5.js";import{n as a,t as o}from"./BAIBadge-CmUm-bJH.js";import{jsx as s,jsxs as c}from"react/jsx-runtime";import{c as l}from"react/compiler-runtime";var u,d;function f(){return(f=e((()=>{a(),t(),u={SUCCESS:`success`,FAILURE:`error`,STALE:`default`,NEED_RETRY:`warning`,EXPIRED:`error`,GIVE_UP:`error`,SKIPPED:`default`},d=e=>{"use memo";let t=l(12),r,i;t[0]===e?(r=t[1],i=t[2]):({result:i,...r}=e,t[0]=e,t[1]=r,t[2]=i);let a;t[3]===i?a=t[4]:(a=i?n(u,i):void 0,t[3]=i,t[4]=a);let c=a,d;t[5]===r.style?d=t[6]:(d={whiteSpace:`nowrap`,...r.style},t[5]=r.style,t[6]=d);let f;return t[7]!==r||t[8]!==i||t[9]!==c||t[10]!==d?(f=s(o,{...r,color:c,text:i,style:d}),t[7]=r,t[8]=i,t[9]=c,t[10]=d,t[11]=f):f=t[11],f}})))()}var p,m,h,g,_,v,y,b,x,S;function C(){return(C=e((()=>{r(),f(),p={title:`Badge/BAISchedulingResultBadge`,component:d,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`
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
        `}}},argTypes:{result:{control:{type:`select`},options:[`SUCCESS`,`FAILURE`,`STALE`,`NEED_RETRY`,`EXPIRED`,`GIVE_UP`,`SKIPPED`,null],description:`The scheduling result status to display`,table:{type:{summary:`'SUCCESS' | 'FAILURE' | 'STALE' | 'NEED_RETRY' | 'EXPIRED' | 'GIVE_UP' | 'SKIPPED' | null`},defaultValue:{summary:`undefined`}}}}},m={name:`Basic`,parameters:{docs:{description:{story:`Basic usage showing a successful scheduling result with a green badge.`}}},args:{result:`SUCCESS`}},h={name:`FailureState`,parameters:{docs:{description:{story:`Shows a failed scheduling result with a red badge.`}}},args:{result:`FAILURE`}},g={name:`StaleState`,parameters:{docs:{description:{story:`Shows a stale scheduling result with a grey badge (default semantic color), indicating an inactive or outdated state.`}}},args:{result:`STALE`}},_={name:`NeedRetryState`,parameters:{docs:{description:{story:`Shows a need-retry result with a warning (orange) badge, indicating the scheduling attempt will be retried.`}}},args:{result:`NEED_RETRY`}},v={name:`ExpiredState`,parameters:{docs:{description:{story:`Shows an expired scheduling result with a red badge.`}}},args:{result:`EXPIRED`}},y={name:`GiveUpState`,parameters:{docs:{description:{story:`Shows a give-up scheduling result with a red badge, indicating all retry attempts were exhausted.`}}},args:{result:`GIVE_UP`}},b={name:`SkippedState`,parameters:{docs:{description:{story:`Shows a skipped scheduling result with a grey badge (default semantic color), indicating no processing occurred.`}}},args:{result:`SKIPPED`}},x={name:`AllStatuses`,parameters:{docs:{description:{story:`Displays all available scheduling result statuses for comparison. Colors are derived from Ant Design semantic tokens and adapt to the active theme.`}}},render:()=>c(i,{direction:`column`,gap:`md`,children:[[`SUCCESS`,`FAILURE`,`STALE`,`NEED_RETRY`,`EXPIRED`,`GIVE_UP`,`SKIPPED`].map(e=>s(d,{result:e},e)),s(d,{result:null})]})},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source},description:{story:`Default state showing a successful scheduling result.`,...m.parameters?.docs?.description}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source},description:{story:`Failure state showing a failed scheduling result.`,...h.parameters?.docs?.description}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source},description:{story:`Stale state — outdated result with no action taken, shown in grey.`,...g.parameters?.docs?.description}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source},description:{story:`NeedRetry state — scheduling will be retried, shown in orange.`,..._.parameters?.docs?.description}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source},description:{story:`Expired state — scheduling timed out, shown in red.`,...v.parameters?.docs?.description}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source},description:{story:`GiveUp state — scheduling was abandoned after exhausting retries, shown in red.`,...y.parameters?.docs?.description}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source},description:{story:`Skipped state — scheduling was skipped without processing, shown in grey.`,...b.parameters?.docs?.description}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source},description:{story:`Display all status variants side by side for comparison.`,...x.parameters?.docs?.description}}},S=[`Default`,`Failure`,`Stale`,`NeedRetry`,`Expired`,`GiveUp`,`Skipped`,`AllStatuses`]})))()}C();export{x as AllStatuses,m as Default,v as Expired,h as Failure,y as GiveUp,_ as NeedRetry,b as Skipped,g as Stale,S as __namedExportsOrder,p as default};