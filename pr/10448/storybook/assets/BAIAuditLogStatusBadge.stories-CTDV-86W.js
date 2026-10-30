import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t,t as n}from"./get-ClE-bzXR.js";import{t as r}from"./jsx-runtime-MKhVqBIO.js";import{t as i}from"./compiler-runtime-CdReTaax.js";import{n as a,t as o}from"./BAIFlex-BOFoS5KY.js";import{n as s,t as c}from"./BAIBadge-DbrOBQ6g.js";var l,u,d,f;function p(){return(p=e((()=>{l=i(),s(),t(),u=r(),d={SUCCESS:`success`,ERROR:`error`,RUNNING:`info`,DENIED:`warning`,UNKNOWN:void 0},f=e=>{"use memo";let t=(0,l.c)(13),r,i;t[0]===e?(r=t[1],i=t[2]):({status:i,...r}=e,t[0]=e,t[1]=r,t[2]=i);let a;t[3]===i?a=t[4]:(a=i?n(d,i):void 0,t[3]=i,t[4]=a);let o=a,s=i===`RUNNING`,f;t[5]===r.style?f=t[6]:(f={whiteSpace:`nowrap`,...r.style},t[5]=r.style,t[6]=f);let p;return t[7]!==r||t[8]!==o||t[9]!==i||t[10]!==s||t[11]!==f?(p=(0,u.jsx)(c,{...r,color:o,processing:s,text:i,style:f}),t[7]=r,t[8]=o,t[9]=i,t[10]=s,t[11]=f,t[12]=p):p=t[12],p}})))()}var m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I;function L(){return(L=e((()=>{p(),a(),m=r(),A={title:`Badge/BAIAuditLogStatusBadge`,component:f,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`
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
        `}}},argTypes:{status:{control:{type:`select`},options:[`SUCCESS`,`ERROR`,`RUNNING`,`UNKNOWN`,null],description:`The audit log status to display`,table:{type:{summary:`'SUCCESS' | 'ERROR' | 'RUNNING' | 'UNKNOWN' | null`},defaultValue:{summary:`undefined`}}}}},j={name:`Basic`,parameters:{docs:{description:{story:`Basic usage showing a successful audit log entry with a green badge.`}}},args:{status:`SUCCESS`}},M={name:`ErrorState`,parameters:{docs:{description:{story:`Shows a failed audit log entry with a red badge.`}}},args:{status:`ERROR`}},N={name:`RunningState`,parameters:{docs:{description:{story:`Shows an in-progress audit log entry with a blue (info) badge and a processing ripple animation.`}}},args:{status:`RUNNING`}},P={name:`UnknownState`,parameters:{docs:{description:{story:`Shows an unknown audit log status as an outline-only dot, indicating an indeterminate state.`}}},args:{status:`UNKNOWN`}},F={name:`AllStatuses`,parameters:{docs:{description:{story:`Displays all available audit log statuses for comparison. Colors are derived from Ant Design semantic tokens and adapt to the active theme.`}}},render:()=>(0,m.jsxs)(o,{direction:`column`,gap:`md`,children:[[`SUCCESS`,`ERROR`,`RUNNING`,`UNKNOWN`].map(e=>(0,m.jsx)(f,{status:e},e)),(0,m.jsx)(f,{status:null})]})},j.parameters={...j.parameters,docs:{...(h=j.parameters)==null?void 0:h.docs,source:{originalSource:`{
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
}`,...(g=j.parameters)==null||(g=g.docs)==null?void 0:g.source},description:{story:`Default state showing a successful operation.`,...(_=j.parameters)==null||(_=_.docs)==null?void 0:_.description}}},M.parameters={...M.parameters,docs:{...(v=M.parameters)==null?void 0:v.docs,source:{originalSource:`{
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
}`,...(y=M.parameters)==null||(y=y.docs)==null?void 0:y.source},description:{story:`Error state — the operation failed, shown in red.`,...(b=M.parameters)==null||(b=b.docs)==null?void 0:b.description}}},N.parameters={...N.parameters,docs:{...(x=N.parameters)==null?void 0:x.docs,source:{originalSource:`{
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
}`,...(S=N.parameters)==null||(S=S.docs)==null?void 0:S.source},description:{story:`Running state — the operation is in progress, shown in blue with a ripple.`,...(C=N.parameters)==null||(C=C.docs)==null?void 0:C.description}}},P.parameters={...P.parameters,docs:{...(w=P.parameters)==null?void 0:w.docs,source:{originalSource:`{
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
}`,...(T=P.parameters)==null||(T=T.docs)==null?void 0:T.source},description:{story:`Unknown state — indeterminate status, shown as an outline-only dot.`,...(E=P.parameters)==null||(E=E.docs)==null?void 0:E.description}}},F.parameters={...F.parameters,docs:{...(D=F.parameters)==null?void 0:D.docs,source:{originalSource:`{
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
}`,...(O=F.parameters)==null||(O=O.docs)==null?void 0:O.source},description:{story:`Display all status variants side by side for comparison.`,...(k=F.parameters)==null||(k=k.docs)==null?void 0:k.description}}},I=[`Default`,`Error`,`Running`,`Unknown`,`AllStatuses`]})))()}L();export{F as AllStatuses,j as Default,M as Error,N as Running,P as Unknown,I as __namedExportsOrder,A as default};