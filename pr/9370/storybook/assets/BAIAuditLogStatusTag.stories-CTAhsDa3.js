import{c as P,j as l}from"./iframe-D4KvFPWT.js";import{B as _}from"./BAIBadge-DsbWQIJP.js";import{g as M}from"./get-Dect1cf7.js";import{B as V}from"./BAIFlex-DqbanTN2.js";import"./preload-helper-Dp1pzeXC.js";import"./isRenderable-BUV0eL6r.js";import"./_baseGet-DkcPW6D7.js";import"./isSymbol-Ydc1lIeu.js";import"./toString-CjRGbNOK.js";const $={SUCCESS:"success",ERROR:"error",RUNNING:"info",UNKNOWN:void 0},S=r=>{"use memo";const t=P.c(13);let e,s;t[0]!==r?({status:s,...e}=r,t[0]=r,t[1]=e,t[2]=s):(e=t[1],s=t[2]);let c;t[3]!==s?(c=s?M($,s):void 0,t[3]=s,t[4]=c):c=t[4];const m=c,g=s==="RUNNING";let a;t[5]!==e.style?(a={whiteSpace:"nowrap",...e.style},t[5]=e.style,t[6]=a):a=t[6];let p;return t[7]!==e||t[8]!==m||t[9]!==s||t[10]!==g||t[11]!==a?(p=l.jsx(_,{...e,color:m,processing:g,text:s,style:a}),t[7]=e,t[8]=m,t[9]=s,t[10]=g,t[11]=a,t[12]=p):p=t[12],p},st={title:"Badge/BAIAuditLogStatusTag",component:S,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:`
**BAIAuditLogStatusTag** displays an audit log status with a semantic color-coded badge.

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
<BAIAuditLogStatusTag status="SUCCESS" />
<BAIAuditLogStatusTag status="ERROR" />
<BAIAuditLogStatusTag status="RUNNING" />
<BAIAuditLogStatusTag status="UNKNOWN" />
\`\`\`
        `}}},argTypes:{status:{control:{type:"select"},options:["SUCCESS","ERROR","RUNNING","UNKNOWN",null],description:"The audit log status to display",table:{type:{summary:"'SUCCESS' | 'ERROR' | 'RUNNING' | 'UNKNOWN' | null"},defaultValue:{summary:"undefined"}}}}},n={name:"Basic",parameters:{docs:{description:{story:"Basic usage showing a successful audit log entry with a green badge."}}},args:{status:"SUCCESS"}},o={name:"ErrorState",parameters:{docs:{description:{story:"Shows a failed audit log entry with a red badge."}}},args:{status:"ERROR"}},i={name:"RunningState",parameters:{docs:{description:{story:"Shows an in-progress audit log entry with a blue (info) badge and a processing ripple animation."}}},args:{status:"RUNNING"}},d={name:"UnknownState",parameters:{docs:{description:{story:"Shows an unknown audit log status as an outline-only dot, indicating an indeterminate state."}}},args:{status:"UNKNOWN"}},u={name:"AllStatuses",parameters:{docs:{description:{story:"Displays all available audit log statuses for comparison. Colors are derived from Ant Design semantic tokens and adapt to the active theme."}}},render:()=>{const r=["SUCCESS","ERROR","RUNNING","UNKNOWN"];return l.jsxs(V,{direction:"column",gap:"md",children:[r.map(t=>l.jsx(S,{status:t},t)),l.jsx(S,{status:null})]})}};var N,y,R,U,h;n.parameters={...n.parameters,docs:{...(N=n.parameters)==null?void 0:N.docs,source:{originalSource:`{
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
}`,...(R=(y=n.parameters)==null?void 0:y.docs)==null?void 0:R.source},description:{story:"Default state showing a successful operation.",...(h=(U=n.parameters)==null?void 0:U.docs)==null?void 0:h.description}}};var w,A,f,E,I;o.parameters={...o.parameters,docs:{...(w=o.parameters)==null?void 0:w.docs,source:{originalSource:`{
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
}`,...(f=(A=o.parameters)==null?void 0:A.docs)==null?void 0:f.source},description:{story:"Error state — the operation failed, shown in red.",...(I=(E=o.parameters)==null?void 0:E.docs)==null?void 0:I.description}}};var B,C,O,b,x;i.parameters={...i.parameters,docs:{...(B=i.parameters)==null?void 0:B.docs,source:{originalSource:`{
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
}`,...(O=(C=i.parameters)==null?void 0:C.docs)==null?void 0:O.source},description:{story:"Running state — the operation is in progress, shown in blue with a ripple.",...(x=(b=i.parameters)==null?void 0:b.docs)==null?void 0:x.description}}};var T,k,D,L,G;d.parameters={...d.parameters,docs:{...(T=d.parameters)==null?void 0:T.docs,source:{originalSource:`{
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
}`,...(D=(k=d.parameters)==null?void 0:k.docs)==null?void 0:D.source},description:{story:"Unknown state — indeterminate status, shown as an outline-only dot.",...(G=(L=d.parameters)==null?void 0:L.docs)==null?void 0:G.description}}};var v,K,W,j,F;u.parameters={...u.parameters,docs:{...(v=u.parameters)==null?void 0:v.docs,source:{originalSource:`{
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
        {statuses.map(status => <BAIAuditLogStatusTag key={status} status={status} />)}
        <BAIAuditLogStatusTag status={null} />
      </BAIFlex>;
  }
}`,...(W=(K=u.parameters)==null?void 0:K.docs)==null?void 0:W.source},description:{story:"Display all status variants side by side for comparison.",...(F=(j=u.parameters)==null?void 0:j.docs)==null?void 0:F.description}}};const et=["Default","Error","Running","Unknown","AllStatuses"];export{u as AllStatuses,n as Default,o as Error,i as Running,d as Unknown,et as __namedExportsOrder,st as default};
