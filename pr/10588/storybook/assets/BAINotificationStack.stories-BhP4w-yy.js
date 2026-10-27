import{n as e}from"./rolldown-runtime-2s6bX4vc.js";import{jsx as t}from"react/jsx-runtime";import{c as n}from"react/compiler-runtime";import{NotificationStack as r}from"@lablup/ui-common/components/NotificationStack";var i;function a(){return(a=e((()=>{i=e=>{"use memo";let i=n(10),a,o,s;i[0]===e?(a=i[1],o=i[2],s=i[3]):({className:a,"data-testid":s,...o}=e,i[0]=e,i[1]=a,i[2]=o,i[3]=s);let c=s===void 0?`bai-notification-stack`:s,l;i[4]===a?l=i[5]:(l=[`bai-notification-stack`,a].filter(Boolean),i[4]=a,i[5]=l);let u=l.join(` `),d;return i[6]!==o||i[7]!==u||i[8]!==c?(d=t(r,{...o,"data-testid":c,className:u}),i[6]=o,i[7]=u,i[8]=c,i[9]=d):d=i[9],d}})))()}var o,s,c,l,u,d;function f(){return(f=e((()=>{a(),o=`Failed to start the session: ${`the backend returned an unusually long diagnostic that used to grow the notice past the top of the viewport. `.repeat(40)}`,s={title:`Notification/BAINotificationStack`,component:i,tags:[`autodocs`],parameters:{layout:`fullscreen`,docs:{description:{component:`
**BAINotificationStack** is the floating notice stack anchored to the bottom-right corner.

## Features
- Astryx \`Banner\` per notice, with status icon, background-task progress, action / retry / cancel buttons and a collapsible disclosure
- Per-notice auto-close that pauses while the notice is hovered or focused
- An oversized description or disclosure scrolls inside the notice, so the banner header and its dismiss button never leave the viewport
- The stack itself is capped below the app header, and \`maxVisible\` keeps it short

## Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| notifications | \`Array<BAINotificationStackItem>\` | - | Notices, oldest first; the last renders nearest the corner |
| onClose | \`(key: React.Key) => void\` | - | Fired by the close button and by the auto-close timer |
| maxVisible | \`number\` | - | Cap on simultaneously visible notices, keeping the newest |
        `}}}},c={name:`Basic`,args:{notifications:[{key:`info`,title:`Session started`,description:`session-1a2b3c`},{key:`task`,title:`Importing image`,description:`This may take a while.`,percent:42,progressLabel:`Importing image`,cancelText:`Cancel`,onCancel:()=>{},duration:null}]}},l={args:{notifications:[{key:`error`,title:`Failed to start the app`,description:o,status:`error`,duration:null,children:o}]}},u={args:{maxVisible:3,notifications:Array.from({length:10},(e,t)=>({key:`n${t}`,title:`Notice ${t+1}`,description:`One of ten notices raised at once.`,duration:null}))}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  name: 'Basic',
  args: {
    notifications: [{
      key: 'info',
      title: 'Session started',
      description: 'session-1a2b3c'
    }, {
      key: 'task',
      title: 'Importing image',
      description: 'This may take a while.',
      percent: 42,
      progressLabel: 'Importing image',
      cancelText: 'Cancel',
      onCancel: () => {},
      duration: null
    }]
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    notifications: [{
      key: 'error',
      title: 'Failed to start the app',
      description: LONG_ERROR,
      status: 'error',
      duration: null,
      children: LONG_ERROR
    }]
  }
}`,...l.parameters?.docs?.source},description:{story:`FR-3829 — the dismiss button stays reachable however long the error is.`,...l.parameters?.docs?.description}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    maxVisible: 3,
    notifications: Array.from({
      length: 10
    }, (_, i): BAINotificationStackItem => ({
      key: \`n\${i}\`,
      title: \`Notice \${i + 1}\`,
      description: 'One of ten notices raised at once.',
      duration: null
    }))
  }
}`,...u.parameters?.docs?.source},description:{story:"FR-3829 — `maxVisible` keeps the stack clear of the app header.",...u.parameters?.docs?.description}}},d=[`Default`,`OversizedError`,`CappedStack`]})))()}f();export{u as CappedStack,c as Default,l as OversizedError,d as __namedExportsOrder,s as default};