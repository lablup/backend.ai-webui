import{n as e}from"./rolldown-runtime-2s6bX4vc.js";import{n as t,t as n}from"./get-B70pLbeK.js";import{n as r,t as i}from"./BAIFlex-CAz1t6J5.js";import{n as a,t as o}from"./BAIBadge-CmUm-bJH.js";import{jsx as s,jsxs as c}from"react/jsx-runtime";import{c as l}from"react/compiler-runtime";var u,d;function f(){return(f=e((()=>{a(),t(),u={SUCCESS:`success`,ERROR:`error`,RUNNING:`info`,DENIED:`warning`,UNKNOWN:void 0},d=e=>{"use memo";let t=l(13),r,i;t[0]===e?(r=t[1],i=t[2]):({status:i,...r}=e,t[0]=e,t[1]=r,t[2]=i);let a;t[3]===i?a=t[4]:(a=i?n(u,i):void 0,t[3]=i,t[4]=a);let c=a,d=i===`RUNNING`,f;t[5]===r.style?f=t[6]:(f={whiteSpace:`nowrap`,...r.style},t[5]=r.style,t[6]=f);let p;return t[7]!==r||t[8]!==c||t[9]!==i||t[10]!==d||t[11]!==f?(p=s(o,{...r,color:c,processing:d,text:i,style:f}),t[7]=r,t[8]=c,t[9]=i,t[10]=d,t[11]=f,t[12]=p):p=t[12],p}})))()}var p,m,h,g,_,v,y;function b(){return(b=e((()=>{f(),r(),p={title:`Badge/BAIAuditLogStatusBadge`,component:d,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`
**BAIAuditLogStatusBadge** displays an audit log status with a semantic color-coded badge.

## Features
- Semantic color system using Ant Design design tokens (theme-aware)
- SUCCESS → success (green)
- ERROR → error (red)
- RUNNING → info (blue) with a processing ripple
- UNKNOWN → outline-only dot (indeterminate)

## Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| status | \`AuditLogStatus \\| null\` | - | The audit log status to display |

## Usage
\`\`\`tsx
<BAIAuditLogStatusBadge status="SUCCESS" />
<BAIAuditLogStatusBadge status="ERROR" />
<BAIAuditLogStatusBadge status="RUNNING" />
<BAIAuditLogStatusBadge status="UNKNOWN" />
\`\`\`
        `}}},argTypes:{status:{control:{type:`select`},options:[`SUCCESS`,`ERROR`,`RUNNING`,`UNKNOWN`,null],description:`The audit log status to display`,table:{type:{summary:`'SUCCESS' | 'ERROR' | 'RUNNING' | 'UNKNOWN' | null`},defaultValue:{summary:`undefined`}}}}},m={name:`Basic`,parameters:{docs:{description:{story:`Basic usage showing a successful audit log entry with a green badge.`}}},args:{status:`SUCCESS`}},h={name:`ErrorState`,parameters:{docs:{description:{story:`Shows a failed audit log entry with a red badge.`}}},args:{status:`ERROR`}},g={name:`RunningState`,parameters:{docs:{description:{story:`Shows an in-progress audit log entry with a blue (info) badge and a processing ripple animation.`}}},args:{status:`RUNNING`}},_={name:`UnknownState`,parameters:{docs:{description:{story:`Shows an unknown audit log status as an outline-only dot, indicating an indeterminate state.`}}},args:{status:`UNKNOWN`}},v={name:`AllStatuses`,parameters:{docs:{description:{story:`Displays all available audit log statuses for comparison. Colors are derived from Ant Design semantic tokens and adapt to the active theme.`}}},render:()=>c(i,{direction:`column`,gap:`md`,children:[[`SUCCESS`,`ERROR`,`RUNNING`,`UNKNOWN`].map(e=>s(d,{status:e},e)),s(d,{status:null})]})},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'Basic usage showing a successful audit log entry with a green badge.'
      }
    }
  },
  args: {
    status: 'SUCCESS'
  }
}`,...m.parameters?.docs?.source},description:{story:`Default state showing a successful operation.`,...m.parameters?.docs?.description}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  name: 'ErrorState',
  parameters: {
    docs: {
      description: {
        story: 'Shows a failed audit log entry with a red badge.'
      }
    }
  },
  args: {
    status: 'ERROR'
  }
}`,...h.parameters?.docs?.source},description:{story:`Error state — the operation failed, shown in red.`,...h.parameters?.docs?.description}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  name: 'RunningState',
  parameters: {
    docs: {
      description: {
        story: 'Shows an in-progress audit log entry with a blue (info) badge and a processing ripple animation.'
      }
    }
  },
  args: {
    status: 'RUNNING'
  }
}`,...g.parameters?.docs?.source},description:{story:`Running state — the operation is in progress, shown in blue with a ripple.`,...g.parameters?.docs?.description}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  name: 'UnknownState',
  parameters: {
    docs: {
      description: {
        story: 'Shows an unknown audit log status as an outline-only dot, indicating an indeterminate state.'
      }
    }
  },
  args: {
    status: 'UNKNOWN'
  }
}`,..._.parameters?.docs?.source},description:{story:`Unknown state — indeterminate status, shown as an outline-only dot.`,..._.parameters?.docs?.description}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  name: 'AllStatuses',
  parameters: {
    docs: {
      description: {
        story: 'Displays all available audit log statuses for comparison. Colors are derived from Ant Design semantic tokens and adapt to the active theme.'
      }
    }
  },
  render: () => {
    const statuses: AuditLogStatus[] = ['SUCCESS', 'ERROR', 'RUNNING', 'UNKNOWN'];
    return <BAIFlex direction="column" gap="md">
        {statuses.map(status => <BAIAuditLogStatusBadge key={status} status={status} />)}
        <BAIAuditLogStatusBadge status={null} />
      </BAIFlex>;
  }
}`,...v.parameters?.docs?.source},description:{story:`Display all status variants side by side for comparison.`,...v.parameters?.docs?.description}}},y=[`Default`,`Error`,`Running`,`Unknown`,`AllStatuses`]})))()}b();export{v as AllStatuses,m as Default,h as Error,g as Running,_ as Unknown,y as __namedExportsOrder,p as default};