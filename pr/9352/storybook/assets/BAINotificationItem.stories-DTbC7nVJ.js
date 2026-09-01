import{t as R,j as t,b as j}from"./iframe-BYexpe7R.js";import{B as p}from"./BAIButton-Be2PUF4T.js";import{B as l}from"./BAIFlex-Cx5euCWv.js";import"./preload-helper-Dp1pzeXC.js";import"./astryxLabel-CWrvS11G.js";const C=i=>{const o=typeof i;return o==="string"||o==="number"||o==="bigint"},a=({title:i,description:o,action:m,footer:u,styles:e})=>{const{token:f}=R.useToken(),c=(d,S)=>C(d)?t.jsx(j,{style:S,children:d}):d;return t.jsx("div",{className:"bai-notification-item",children:t.jsxs(l,{direction:"column",align:"stretch",gap:"xxs",children:[i&&t.jsx("div",{style:{fontWeight:500,marginRight:22,marginBottom:f.marginSM,...e==null?void 0:e.title},children:c(i)}),o&&t.jsx("div",{style:e==null?void 0:e.description,children:c(o)}),m&&t.jsx(l,{direction:"row",align:"end",justify:"end",gap:"xxs",style:e==null?void 0:e.action,children:m}),u&&t.jsx("div",{style:{alignSelf:"flex-end",color:f.colorTextSecondary,...e==null?void 0:e.footer},children:c(u)})]})})},P={title:"Notification/BAINotificationItem",component:a,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:"\n**BAINotificationItem** is a custom notification item template component for Backend.AI WebUI.\n\nThis component is designed to display structured notification content with title, description, action buttons, and footer information.\n\n## BAI-Specific Props\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `title` | `ReactNode` | - | Notification title (automatically wrapped in Typography.Text if primitive) |\n| `description` | `ReactNode` | - | Notification description content |\n| `action` | `ReactNode` | - | Action buttons or controls displayed at the bottom right |\n| `footer` | `ReactNode` | - | Footer content (e.g., timestamp) displayed at the bottom right with secondary text color |\n| `styles` | `BAINotificationItemStyles` | - | Custom styles for title, description, action, and footer sections |\n\n## BAINotificationItemStyles\n```typescript\ninterface BAINotificationItemStyles {\n  title?: React.CSSProperties;\n  description?: React.CSSProperties;\n  action?: React.CSSProperties;\n  footer?: React.CSSProperties;\n}\n```\n        "}}},argTypes:{title:{control:{type:"text"},description:"Notification title (automatically wrapped in Typography.Text if primitive)",table:{type:{summary:"ReactNode"}}},description:{control:{type:"text"},description:"Notification description content",table:{type:{summary:"ReactNode"}}},action:{control:!1,description:"Action buttons or controls displayed at the bottom right",table:{type:{summary:"ReactNode"}}},footer:{control:{type:"text"},description:"Footer content (e.g., timestamp) displayed at the bottom right with secondary text color",table:{type:{summary:"ReactNode"}}},styles:{control:!1,description:"Custom styles for title, description, action, and footer sections",table:{type:{summary:"BAINotificationItemStyles"}}}}},r={name:"Basic",args:{title:"New session created",description:"Your compute session has been successfully created.",footer:"2 minutes ago"}},n={render:()=>t.jsx(a,{title:"Session compute resource insufficient",description:"Your session requires more resources than currently available.",action:t.jsxs(t.Fragment,{children:[t.jsx(p,{type:"link",size:"small",children:"Dismiss"}),t.jsx(p,{type:"primary",size:"small",children:"View Details"})]}),footer:"5 minutes ago"})},s={render:()=>t.jsxs(l,{direction:"column",gap:"md",children:[t.jsx(a,{title:"Default styling",description:"This notification uses default styles.",footer:"1 hour ago"}),t.jsx(a,{title:"Custom styled notification",description:"This notification demonstrates custom styling capabilities.",action:t.jsx(p,{type:"primary",size:"small",children:"Acknowledge"}),footer:"1 hour ago",styles:{title:{backgroundColor:"#e6f7ff",padding:"4px 8px",borderRadius:"4px"},description:{backgroundColor:"#f6ffed",padding:"8px",borderRadius:"4px"},footer:{backgroundColor:"#fff7e6",padding:"2px 6px",borderRadius:"4px"}}})]})};var g,y,x;r.parameters={...r.parameters,docs:{...(g=r.parameters)==null?void 0:g.docs,source:{originalSource:`{
  name: 'Basic',
  args: {
    title: 'New session created',
    description: 'Your compute session has been successfully created.',
    footer: '2 minutes ago'
  }
}`,...(x=(y=r.parameters)==null?void 0:y.docs)==null?void 0:x.source}}};var h,b,B;n.parameters={...n.parameters,docs:{...(h=n.parameters)==null?void 0:h.docs,source:{originalSource:`{
  render: () => <BAINotificationItem title="Session compute resource insufficient" description="Your session requires more resources than currently available." action={<>
          <BAIButton type="link" size="small">
            Dismiss
          </BAIButton>
          <BAIButton type="primary" size="small">
            View Details
          </BAIButton>
        </>} footer="5 minutes ago" />
}`,...(B=(b=n.parameters)==null?void 0:b.docs)==null?void 0:B.source}}};var I,A,N;s.parameters={...s.parameters,docs:{...(I=s.parameters)==null?void 0:I.docs,source:{originalSource:`{
  render: () => <BAIFlex direction="column" gap="md">
      <BAINotificationItem title="Default styling" description="This notification uses default styles." footer="1 hour ago" />
      <BAINotificationItem title="Custom styled notification" description="This notification demonstrates custom styling capabilities." action={<BAIButton type="primary" size="small">
            Acknowledge
          </BAIButton>} footer="1 hour ago" styles={{
      title: {
        backgroundColor: '#e6f7ff',
        padding: '4px 8px',
        borderRadius: '4px'
      },
      description: {
        backgroundColor: '#f6ffed',
        padding: '8px',
        borderRadius: '4px'
      },
      footer: {
        backgroundColor: '#fff7e6',
        padding: '2px 6px',
        borderRadius: '4px'
      }
    }} />
    </BAIFlex>
}`,...(N=(A=s.parameters)==null?void 0:A.docs)==null?void 0:N.source}}};const z=["Default","WithActions","WithCustomStyles"];export{r as Default,n as WithActions,s as WithCustomStyles,z as __namedExportsOrder,P as default};
