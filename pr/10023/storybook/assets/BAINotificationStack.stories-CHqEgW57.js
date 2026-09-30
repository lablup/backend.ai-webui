const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./ProgressBarMarkTooltip-C3cSp7Uc.js","./iframe-CnbB2HzF.js","./preload-helper-Dp1pzeXC.js","./iframe-BVfU6G0G.css"])))=>i.map(i=>d[i]);
import{r as c,j as s,V as ie,q as S,s as _,t as N,Q as re,by as I,bz as oe,aD as le,aL as ce,z as V,a3 as B,c as ue}from"./iframe-CnbB2HzF.js";import{B as de}from"./Banner-Ci4bWb9E.js";import{V as pe}from"./VStack-BReKpLLE.js";import{_ as xe}from"./preload-helper-Dp1pzeXC.js";import"./isRenderable-BUV0eL6r.js";import"./composeEventHandlers-BolWE7qY.js";const me=c.lazy(async()=>xe(()=>import("./ProgressBarMarkTooltip-C3cSp7Uc.js"),__vite__mapDeps([0,1,2,3]),import.meta.url)),R={container:{k1xSpc:"x78zum5",kXwgrk:"xdt5ytf",kOIVth:"xzye2dw",kzqmXN:"xh8yej3",k7Eaqz:"x900493",$$css:!0},fill:{kZKoxP:"x5yr21d",kaIpWk:"xjspbzw",k1ekBW:"xxrbq2n",kIyJzY:"x80gvsz",kAMwcw:"xlr8y92",$$css:!0},indeterminateFill:{kZKoxP:"x5yr21d",kzqmXN:"xz84dc7",kaIpWk:"xjspbzw",kKVMdj:"xozk8ic xfd3fxj",k44tkh:"xmg6eyc xnh0sag",kyAemX:"x4hg4is",ko0y90:"xa4qsjk",$$css:!0},mark:{kVAEAm:"x10l6tqk",k87sOh:"xwa60dl",kzqmXN:"x63cpjl",kZKoxP:"xhovv34",k3aq6I:"x11lhmoz xoffwj3",$$css:!0}},F={accent:{kWkggS:"x1ewilqj",$$css:!0},success:{kWkggS:"xdsz4j9",$$css:!0},warning:{kWkggS:"x1q8g9m5",$$css:!0},error:{kWkggS:"x1pjz0fi",$$css:!0},neutral:{kWkggS:"x16fr6go",$$css:!0},disabled:{kWkggS:"x16fr6go",$$css:!0}},ke={accent:{kWkggS:"x1azo05",$$css:!0},success:{kWkggS:"x9mohwv",$$css:!0},warning:{kWkggS:"xmgwp2l",$$css:!0},error:{kWkggS:"xfba6wv",$$css:!0},neutral:{kWkggS:"x19aspcf",$$css:!0},disabled:{kWkggS:"xdomwnj",$$css:!0}},W={track:{kWkggS:"x19aspcf",$$css:!0},trackDisabled:{kWkggS:"xdomwnj",$$css:!0}};function fe(e,t){return`${t>0?Math.round(e/t*100):0}%`}function se({value:e=0,max:t=100,label:a,isLabelHidden:l=!1,hasValueLabel:u=!1,formatValueLabel:x=fe,variant:d="accent",isIndeterminate:i=!1,isDisabled:o=!1,marks:k,xstyle:v,className:$,style:y,"data-testid":m,ref:h,...n}){const g=c.useId(),w=Number.isFinite(e)?e:0,r=Number.isFinite(t)?t:0,f=Math.min(Math.max(0,w),r),b=r>0?f/r*100:0,C=x(f,r),q=u&&!i,j=o?"disabled":d,ne=!i&&k?k.filter(p=>Number.isFinite(p.value)).map(p=>{const O=Math.min(Math.max(0,p.value),r),A=r>0?O/r*100:0;return{value:p.value,label:p.label,pct:A,isOnFill:b>0&&A<=b}}):[];return s.jsxs("div",{ref:h,...S(N("progress-bar",{variant:d},{legacyNames:["progressbar"]}),_(R.container,v),$,y),"data-testid":m,...n,children:[!l||q?s.jsxs("div",{className:"x78zum5 x1qughib x1pha0wt",children:[s.jsx("span",{id:g,...{0:{className:"xjm74w1 xw6l6zx x1e4wzip x1tgivj0"},2:{className:"xjm74w1 xw6l6zx x1e4wzip x1tgivj0 x10l6tqk x1i1rx1s xjm9jq1 x1717udv xkdpibf xb3r6kr xzpqnlu xuxw1ft xc342km"},1:{className:"xjm74w1 xw6l6zx x1e4wzip xnbbluu"},3:{className:"xjm74w1 xw6l6zx x1e4wzip x10l6tqk x1i1rx1s xjm9jq1 x1717udv xkdpibf xb3r6kr xzpqnlu xuxw1ft xc342km xnbbluu"}}[!!l<<1|!!o<<0],children:a}),q&&s.jsx("span",{...{0:{className:"xjm74w1 xw6l6zx x1sodnla xv1l7n4"},1:{className:"xjm74w1 xw6l6zx x1sodnla xnbbluu"}}[!!o<<0],children:C})]}):s.jsx(ie,{id:g,children:a}),s.jsxs("div",{role:"progressbar","aria-valuenow":i?void 0:f,"aria-valuemin":i?void 0:0,"aria-valuemax":i?void 0:r,"aria-labelledby":g,"aria-valuetext":i?void 0:C,...S(N("progress-bar-track",void 0,{legacyNames:["progressbar-track"]}),{0:{className:"x1n2onr6 xh8yej3 xdk7pt xwmxj5m xjspbzw"},1:{className:"x1n2onr6 xh8yej3 xdk7pt xwmxj5m xjspbzw xb3r6kr"}}[!!i<<0]),children:[i?s.jsx("div",{...S(N("progress-bar-fill",{variant:j},{legacyNames:["progressbar-fill"]}),_(R.indeterminateFill,F[j]))}):s.jsx("div",{...S(N("progress-bar-fill",{variant:j},{legacyNames:["progressbar-fill"]}),_(R.fill,F[j])),style:{width:`${b}%`}}),ne.map(p=>{const O=s.jsx("span",{tabIndex:0,...S(N("progress-bar-mark",{variant:j,placement:p.isOnFill?"fill":"track"},{legacyNames:["progressbar-mark"]}),_(re.focusVisible,R.mark,p.isOnFill?ke[j]:o?W.trackDisabled:W.track)),style:{insetInlineStart:`${p.pct}%`}});return s.jsx(c.Suspense,{fallback:O,children:s.jsx(me,{content:p.label,children:O})},`${p.value}:${p.label}`)})]})]})}se.displayName="ProgressBar";var ge=200;function P({item:e,isExiting:t,onClose:a}){let l=le(),{key:u,duration:x}=e,d=c.useEffectEvent(()=>a==null?void 0:a(u)),[i,o]=c.useState(!1),k=(e.status??"info")==="error",[v,$]=c.useState(null),y=v??k,m=typeof x=="number"&&x>0?x*1e3:null,h=c.useRef(m);c.useEffect(()=>{h.current=m},[m]),c.useEffect(()=>{if(m===null||t||i)return;let f=h.current??m,b=Date.now(),C=window.setTimeout(()=>d(),f);return()=>{window.clearTimeout(C),h.current=Math.max(0,f-(Date.now()-b))}},[m,t,i]);let n=e.percent!==void 0||e.isProgressIndeterminate===!0,g=!!(e.onCancel||e.onRetry||e.onAction),w=e.content!=null,r=s.jsxs(ce,{gap:2,align:"center",justify:"end",wrap:"wrap",children:[e.onCancel?s.jsx(V,{size:"sm",variant:"ghost",label:e.cancelText??l("uic.common.cancel"),onClick:e.onCancel}):null,e.onRetry?s.jsx(V,{size:"sm",variant:"secondary",label:e.retryText??l("uic.common.retry"),onClick:e.onRetry}):null,e.onAction&&e.actionText?s.jsx(V,{size:"sm",variant:"ghost",label:e.actionText,onClick:e.onAction}):null]});return s.jsx("div",{className:"uic-notification-stack__item","data-exiting":t?"true":"false","data-notification-key":String(u),"data-status":e.status??"info","data-paused":i?"true":"false",onMouseEnter:()=>o(!0),onMouseLeave:()=>o(!1),onFocus:()=>o(!0),onBlur:()=>o(!1),children:s.jsx(de,{status:e.status??"info",title:w?e.content:s.jsx("span",{"data-testid":"notification-title",children:e.title}),icon:e.icon,elevation:"high",isDismissable:e.isClosable??!0,onDismiss:()=>a==null?void 0:a(u),endContent:g?r:void 0,collapsible:{isOpen:y,onOpenChange:$},description:w?void 0:e.description||n?s.jsxs(pe,{gap:2,align:"stretch",children:[e.description?s.jsx("div",{className:"uic-notification-stack__body",children:typeof e.description=="string"?s.jsx(B,{type:"supporting",children:s.jsx("span",{"data-testid":"notification-description",children:e.description})}):e.description}):null,n?s.jsx(se,{value:e.percent??0,max:100,label:e.progressLabel??(typeof e.title=="string"?e.title:l("uic.NotificationStack.progress")),isLabelHidden:!0,hasValueLabel:!e.isProgressIndeterminate,isIndeterminate:e.isProgressIndeterminate}):null]}):void 0,children:e.children?s.jsx("div",{className:"uic-notification-stack__body",children:typeof e.children=="string"?s.jsx(B,{type:"supporting",children:e.children}):e.children}):null})})}function ae({notifications:e,onClose:t,maxVisible:a,className:l,"data-testid":u}){var h;let[x,d]=c.useState([]),i=c.useRef([]),o=c.useRef(null),k=a?e.slice(-a):e,v=(h=e.at(-1))==null?void 0:h.key;c.useEffect(()=>{let n=o.current;n&&(n.scrollTop=n.scrollHeight)},[v]),c.useEffect(()=>{let n=new Set(e.map(r=>r.key)),g=i.current.filter(r=>!n.has(r.key));if(i.current=k,g.length===0)return;d(r=>[...r,...g]);let w=window.setTimeout(()=>{let r=new Set(g.map(f=>f.key));d(f=>f.filter(b=>!r.has(b.key)))},ge);return()=>window.clearTimeout(w)},[e,k]);let $=new Set(k.map(n=>n.key)),y=x.filter(n=>!$.has(n.key)),m=k.length>0||y.length>0;return c.useLayoutEffect(()=>(I(),()=>queueMicrotask(I)),[m]),m?s.jsxs("div",{ref:o,className:["uic-notification-stack",l].filter(Boolean).join(" "),"data-testid":u,[oe]:"",role:"presentation",children:[y.map(n=>s.jsx(P,{item:n,isExiting:!0,onClose:t},n.key)),k.map(n=>s.jsx(P,{item:n,isExiting:!1,onClose:t},n.key))]}):null}ae.displayName="NotificationStack";const he=e=>{"use memo";const t=ue.c(10);let a,l,u;t[0]!==e?({className:a,"data-testid":u,...l}=e,t[0]=e,t[1]=a,t[2]=l,t[3]=u):(a=t[1],l=t[2],u=t[3]);const x=u===void 0?"bai-notification-stack":u;let d;t[4]!==a?(d=["bai-notification-stack",a].filter(Boolean),t[4]=a,t[5]=d):d=t[5];const i=d.join(" ");let o;return t[6]!==l||t[7]!==i||t[8]!==x?(o=s.jsx(ae,{...l,"data-testid":x,className:i}),t[6]=l,t[7]=i,t[8]=x,t[9]=o):o=t[9],o},L=`Failed to start the session: ${"the backend returned an unusually long diagnostic that used to grow the notice past the top of the viewport. ".repeat(40)}`,Se={title:"Notification/BAINotificationStack",component:he,tags:["autodocs"],parameters:{layout:"fullscreen",docs:{description:{component:`
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
        `}}}},T={name:"Basic",args:{notifications:[{key:"info",title:"Session started",description:"session-1a2b3c"},{key:"task",title:"Importing image",description:"This may take a while.",percent:42,progressLabel:"Importing image",cancelText:"Cancel",onCancel:()=>{},duration:null}]}},z={args:{notifications:[{key:"error",title:"Failed to start the app",description:L,status:"error",duration:null,children:L}]}},E={args:{maxVisible:3,notifications:Array.from({length:10},(e,t)=>({key:`n${t}`,title:`Notice ${t+1}`,description:"One of ten notices raised at once.",duration:null}))}};var M,D,K;T.parameters={...T.parameters,docs:{...(M=T.parameters)==null?void 0:M.docs,source:{originalSource:`{
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
}`,...(K=(D=T.parameters)==null?void 0:D.docs)==null?void 0:K.source}}};var X,G,H,Z,J;z.parameters={...z.parameters,docs:{...(X=z.parameters)==null?void 0:X.docs,source:{originalSource:`{
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
}`,...(H=(G=z.parameters)==null?void 0:G.docs)==null?void 0:H.source},description:{story:"FR-3829 — the dismiss button stays reachable however long the error is.",...(J=(Z=z.parameters)==null?void 0:Z.docs)==null?void 0:J.description}}};var Q,Y,U,ee,te;E.parameters={...E.parameters,docs:{...(Q=E.parameters)==null?void 0:Q.docs,source:{originalSource:`{
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
}`,...(U=(Y=E.parameters)==null?void 0:Y.docs)==null?void 0:U.source},description:{story:"FR-3829 — `maxVisible` keeps the stack clear of the app header.",...(te=(ee=E.parameters)==null?void 0:ee.docs)==null?void 0:te.description}}};const Ne=["Default","OversizedError","CappedStack"];export{E as CappedStack,T as Default,z as OversizedError,Ne as __namedExportsOrder,Se as default};
