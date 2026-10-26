import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-D0Ex1IVc.js";import{l as n,n as r,t as i,u as a}from"./isObject-Cu5W6UBH.js";import{a as o,n as s,o as c,t as l}from"./toString-DisgP18h.js";import{_ as u,v as d}from"./_initCloneObject-CJHbjQyA.js";import{S as f,x as p}from"./_Uint8Array-Cb-jzVD9.js";import{a as m,i as h,n as g,o as _,r as v,t as y}from"./_baseGet-BOlqZhSU.js";import{i as ee,r as te}from"./omit-CntEYmYa.js";import{n as ne,t as re}from"./BAIDynamicUnitInputNumber-C_EEjlDv.js";import{a as ie,o as ae}from"./_baseEach-IDZ1epn0.js";import{m as b,p as oe,v as se,y as ce}from"./hooks-C37w8Ol6.js";import{n as le,t as ue}from"./map-CLZMgxwS.js";import{n as de,t as fe}from"./isNumber-BkvUSshz.js";import{n as pe,t as me}from"./negate-BQT8cDrf.js";import{n as he,t as ge}from"./sortBy-We-fx3CA.js";import{t as x}from"./jsx-runtime-MKhVqBIO.js";import{n as _e,t as ve}from"./useBAIi18n-Biey1teG.js";import{d as ye,r as be,t as xe,u as Se}from"./themeProps-BF_zAfjf.js";import{n as S}from"./mergeProps-DHkqklmt.js";import{c as C,l as Ce,s as we}from"./useLayerDismissal-Djg4njXY.js";import{n as Te,t as w}from"./fieldParts-EoEC_9ZP.js";import{n as Ee,t as T}from"./rtlStyles-CN52iOwp.js";import{a as E,i as De}from"./focusOutline.stylex-BVi-V6At.js";import{n as Oe,t as ke}from"./useTooltip-NuFpDWif.js";import{n as Ae,t as je}from"./useMergedRefs-CxzSeHwz.js";import{d as Me,u as Ne}from"./Button-CeeX5Bmd.js";import{n as Pe}from"./isRtlElement-qYN8UwJm.js";import{r as Fe,t as Ie}from"./Tooltip-DcMB1536.js";import{n as Le,t as Re}from"./Form-D8tC8Qyr.js";import{n as D,t as O}from"./BAIFlex-BOFoS5KY.js";import{c as ze,n as Be,p as Ve}from"./helper-CVvTx27U.js";import{n as k,t as He}from"./astryxLabel-3zAUsN4G.js";import{a as Ue,n as A,r as We,t as Ge}from"./formControl-BZLZESv1.js";import{l as Ke,u as j}from"./InputClearButton-HgNUCm3r.js";function qe(e,t,n,i){if(!r(e))return e;t=m(t,e);for(var a=-1,o=t.length,s=o-1,c=e;c!=null&&++a<o;){var l=h(t[a]),d=n;if(l===`__proto__`||l===`constructor`||l===`prototype`)return e;if(a!=s){var p=c[l];d=i?i(p,l,c):void 0,d===void 0&&(d=r(p)?p:f(t[a+1])?[]:{})}u(c,l,d),c=c[l]}return e}function M(){return(M=e((()=>{d(),_(),p(),i(),v()})))()}function Je(e,t,n){for(var r=-1,i=t.length,a={};++r<i;){var o=t[r],s=y(e,o);n(s,o)&&qe(a,m(o,e),s)}return a}function N(){return(N=e((()=>{g(),M(),_()})))()}function Ye(e,t){if(e==null)return{};var n=o(te(e),function(e){return[e]});return t=ie(t),Je(e,n,function(e,n){return t(e,n[0])})}function P(){return(P=e((()=>{c(),ae(),N(),ee()})))()}function Xe(e,t){return Ye(e,pe(ie(t)))}function F(){return(F=e((()=>{ae(),me(),P()})))()}function Ze(e,t,n){return n||t==null?t=0:t&&=+t,$e(s(e).replace(Qe,``),t||0)}var Qe,$e;function et(){return(et=e((()=>{n(),l(),Qe=/^\s+/,$e=a.parseInt})))()}function I(e,t,n){return Math.min(Math.max(e,t),n)}function L(e){if(Math.abs(e)<1){let t=e.toExponential().split(`e-`);if(t.length===2)return(t[0].split(`.`)[1]?.length??0)+parseInt(t[1],10)}let t=String(e).split(`.`)[1];return t?t.length:0}function tt(e,t,n){if(n<=0)return e;let r=t+Math.round((e-t)/n)*n,i=Math.min(Math.max(L(t),L(n)),20);return Number(r.toFixed(i))}function R(e,t,n){return n===t?0:(e-t)/(n-t)*100}function z(e){return it(e,ot-e/100*H)}function nt(e,t){let n=t-e;return it(n,-(n/100)*H)}function rt(e,t){let n=t-H;return n>0?(e-ot)/n:t>0?e/t:0}function it(e,t){let n=e=>Number(e.toFixed(3));return`calc(${n(e)}% ${t<0?`-`:`+`} ${Math.abs(n(t))}px)`}function at({ref:e,...t}){let{label:n,isLabelHidden:r=!1,description:i,isDisabled:a=!1,disabledMessage:o,isOptional:s=!1,isRequired:c=!1,status:l,labelTooltip:u,min:d=0,max:f=100,step:p=1,orientation:m=`horizontal`,formatValue:h,htmlName:g,valueDisplay:_=`tooltip`,marks:v,width:y,containerXstyle:ee,containerClassName:te,containerStyle:ne,controlXstyle:re,controlClassName:ie,controlStyle:ae,value:b,onChange:oe,onChangeEnd:se,onPointerDown:ce,onPointerMove:le,onPointerUp:ue,onPointerCancel:de,onKeyDown:fe,onFocus:pe,onBlur:me,id:he,"aria-describedby":ge,...x}=t,{minStepsBetweenThumbs:_e,...ve}=x,{rest:xe,container:Se}=Te(`Slider`,ve,{containerXstyle:ee,containerClassName:te,containerStyle:ne}),C=Array.isArray(b),w=C&&`minStepsBetweenThumbs`in t?t.minStepsBetweenThumbs??0:0,T=m===`horizontal`,E=(e,t)=>n=>{e(n),t?.(n)},ke=(0,B.useId)(),je=he??ke,Me=(0,B.useId)(),Fe=(0,B.useId)(),Le=(0,B.useId)(),Re=(0,B.useId)(),D=(0,B.useRef)(null),O=(0,B.useRef)(null),[ze,Be]=(0,B.useState)(null),[Ve,k]=(0,B.useState)(null);Ce();let He=(0,B.useCallback)((e,t)=>{k(we()===`keyboard`?e:null)},[]),Ue=(0,B.useCallback)(e=>{k(null)},[]),A=a&&!!o,We=Oe({placement:`above`,focusTrigger:`always`,isEnabled:A}),Ge=c&&!s,j=[];i&&j.push(Fe),l?.message&&j.push(Le),Ge&&j.push(Re),A&&j.push(We.describedBy);let qe=j.length>0?j.join(` `):void 0,M=(0,B.useMemo)(()=>(Array.isArray(b)?b:[b??d]).map(e=>I(e,d,f)),[b,d,f]),Je=(0,B.useRef)(M);Je.current=M;let N=(0,B.useCallback)((e,t)=>{let n=D.current;if(!n)return d;let r=n.getBoundingClientRect(),i;return i=T?rt(Pe(n)?r.right-e:e-r.left,r.width):1-rt(t-r.top,r.height),i=I(i,0,1),I(tt(d+i*(f-d),d,p),d,f)},[d,f,p,T]),Ye=(0,B.useCallback)(e=>{if(!C)return 0;let[t,n]=M;return Math.abs(e-t)<=Math.abs(e-n)?0:1},[C,M]),P=(0,B.useCallback)((e,t,n=!0)=>{if(a)return;let r=I(n?tt(t,d,p):t,d,f);if(C){let t=[...M];t[e]=r;let n=w*p;e===0?t[0]=Math.min(t[0],t[1]-n):t[1]=Math.max(t[1],t[0]+n),t[0]=I(t[0],d,f),t[1]=I(t[1],d,f),oe?.(t)}else oe?.(r)},[a,C,M,d,f,p,w,oe]),Xe=(0,B.useRef)(se);Xe.current=se;let F=(0,B.useCallback)(e=>{let t=e??Je.current,n=Xe.current;C?n?.(t):n?.(t[0])},[C]),Ze=(0,B.useCallback)(e=>{if(a)return;e.preventDefault();let t=e.target.closest(`[data-mark-value]`),n=t?Number(t.dataset.markValue):N(e.clientX,e.clientY),r=D.current?.querySelectorAll(`[role="slider"]`),i=e.target.closest(`[role="slider"]`),o=i==null||r==null?-1:Array.from(r).indexOf(i),s=o>=0?o:Ye(n);O.current=s,Be(s),P(s,n),r?.[s]?.focus(),k(null),typeof e.currentTarget.setPointerCapture==`function`&&e.currentTarget.setPointerCapture(e.pointerId)},[a,N,Ye,P]),Qe=(0,B.useCallback)(e=>{if(O.current===null||a)return;let t=N(e.clientX,e.clientY);P(O.current,t)},[a,N,P]),$e=(0,B.useCallback)(e=>{O.current!==null&&(O.current=null,Be(null),F())},[F]),et=(0,B.useCallback)((e,t)=>{if(a)return;t.key!==`Shift`&&!t.metaKey&&!t.altKey&&!t.ctrlKey&&we()===`keyboard`&&k(e);let n=M[e],r,i=T&&Pe(D.current)?`ArrowLeft`:`ArrowRight`,o=i===`ArrowLeft`?`ArrowRight`:`ArrowLeft`;switch(t.key){case i:case`ArrowUp`:r=n+p;break;case o:case`ArrowDown`:r=n-p;break;case`PageUp`:r=n+p*10;break;case`PageDown`:r=n-p*10;break;case`Home`:r=d;break;case`End`:r=f;break;default:return}t.preventDefault();let s=t.key===`Home`||t.key===`End`,c=I(s?r:tt(r,d,p),d,f);if(P(e,r,!s),C){let t=[...M];t[e]=c;let n=w*p;e===0?t[0]=Math.min(t[0],t[1]-n):t[1]=Math.max(t[1],t[0]+n),t[0]=I(t[0],d,f),t[1]=I(t[1],d,f),F(t)}else F([c])},[a,T,C,M,p,d,f,w,P,F]),L=e=>h?h(e):String(e),it=t=>{let n=M[t],r=R(n,d,f),i=T?{insetInlineStart:z(r)}:{bottom:z(r),left:`50%`},o=C?t===0?`Minimum value`:`Maximum value`:void 0,s=w*p,c=C&&t===1?I(M[0]+s,d,f):d,u=C&&t===0?I(M[1]-s,d,f):f,g=_===`tooltip`&&!A,v=T?`above`:`start`,y=(0,V.jsx)(`div`,{...C?void 0:xe,ref:C?void 0:e,id:C?void 0:je,role:`slider`,tabIndex:0,"aria-valuemin":c,"aria-valuemax":u,"aria-valuenow":n,"aria-valuetext":h?h(n):void 0,"aria-orientation":m,"aria-disabled":a||void 0,"aria-invalid":l?.type===`error`||void 0,"aria-label":o,"aria-labelledby":C?void 0:Me,"aria-describedby":[C?void 0:ge,qe].filter(Boolean).join(` `)||void 0,onKeyDown:E(e=>et(t,e),C?void 0:fe),onFocus:E(e=>He(t,e),C?void 0:pe),onBlur:E(Ue,C?void 0:me),...S(be(`slider-thumb`,{orientation:m,disabled:a?`disabled`:null}),ye(U.thumb,T?U.thumbHorizontal:Ee.centerInline(`50%`),!a&&U.thumbHover,!a&&ze===t&&U.thumbPressed,Ve===t&&De.focusVisible,a&&U.thumbDisabled),void 0,i)},t);return g?(0,V.jsx)(Ie,{content:L(n),placement:v,delay:0,focusTrigger:`always`,isOpen:ze===t||void 0,children:y},t):y},at=(()=>{if(C){let[e,t]=M,n=R(e,d,f),r=R(t,d,f);return T?{insetInlineStart:z(n),width:nt(n,r)}:{bottom:z(n),height:nt(n,r)}}let e=R(M[0],d,f);return T?{insetInlineStart:`0%`,width:z(e)}:{bottom:`0%`,height:z(e)}})(),H=_===`text`?(0,V.jsx)(`span`,{className:`x9ynric xcr08ib x1tgivj0 xuxw1ft x2lah0s`,children:C?`${L(M[0])} – ${L(M[1])}`:L(M[0])}):null;return(0,V.jsxs)(Ke,{...Se,label:n,isLabelHidden:r,description:i,inputID:je,labelID:Me,isGroupLabel:!0,descriptionID:i?Fe:void 0,isOptional:s,isRequired:c,isDisabled:a,status:l?{type:l.type,message:l.message,messageID:l.message?Le:void 0}:void 0,labelTooltip:u,statusVariant:`detached`,width:y,children:[(0,V.jsxs)(`div`,{...S(be(`slider`,{orientation:m,disabled:a?`disabled`:null}),{className:`x78zum5 x6s0dn4 x1txdalj`}),children:[g!=null&&!a&&M.map((e,t)=>(0,V.jsx)(`input`,{type:`hidden`,name:g,value:String(e)},t===0?`start`:`end`)),(0,V.jsxs)(`div`,{...C?xe:void 0,...C?{onKeyDown:fe,onFocus:pe,onBlur:me,"aria-describedby":ge}:void 0,ref:Ae(C?e:void 0,D,We.ref),...C?{role:`group`,"aria-labelledby":Me}:void 0,onPointerDown:E(Ze,ce),onPointerMove:E(Qe,le),onPointerUp:E($e,ue),onPointerCancel:E($e,de),...S(be(`slider-control`,{orientation:m,disabled:a?`disabled`:null}),ye(U.trackContainer,T?U.trackContainerHorizontal:U.trackContainerVertical,a&&U.trackContainerDisabled,re),ie,ae),children:[(0,V.jsx)(`div`,{"aria-hidden":`true`,...S(be(`slider-track`,{orientation:m}),ye(U.track,T?U.trackHorizontal:[U.trackVertical,Ee.centerInline(`0px`)]))}),(0,V.jsx)(`div`,{"aria-hidden":`true`,...S(ye(U.filledTrack,T?U.filledTrackHorizontal:[U.filledTrackVertical,Ee.centerInline(`0px`)]),{style:at})}),v&&(0,V.jsx)(`div`,{"aria-hidden":`true`,...{0:{className:`x10l6tqk x13vifvy x1ey2m1c xbudbmw`},1:{className:`x10l6tqk x1o0tod xtijo5x xwa60dl`}}[!!T|0],children:v.map(e=>{let t=R(e.value,d,f),n=T?{insetInlineStart:z(t)}:{bottom:z(t)},r=C?e.value>=M[0]&&e.value<=M[1]:e.value<=M[0];return(0,V.jsxs)(`div`,{children:[(0,V.jsx)(`div`,{"data-testid":`slider-mark`,"data-mark-value":e.value,...S({0:{className:`x10l6tqk xdsb6cv xjspbzw x36qwtl x1xc55vz x1m9mm8y`},2:{className:`x10l6tqk xdsb6cv xjspbzw xfo62xy xdk7pt x11lhmoz xoffwj3`},1:{className:`x10l6tqk xjspbzw x36qwtl x1xc55vz x1m9mm8y x1ewilqj`},3:{className:`x10l6tqk xjspbzw xfo62xy xdk7pt x11lhmoz xoffwj3 x1ewilqj`}}[!!T<<1|!!r],{style:n})}),e.label&&(0,V.jsx)(`span`,{"data-testid":`slider-mark-label`,"data-mark-value":e.value,...S({0:{className:`x10l6tqk x9ynric x141an7d xv1l7n4 xuxw1ft x131p8rn x9p6ekw`},1:{className:`x10l6tqk x9ynric x141an7d xv1l7n4 xuxw1ft xuuh30 x1nyx83j xuivejd`}}[!!T|0],{style:n}),children:e.label})]},e.value)})}),M.map((e,t)=>it(t))]}),H]}),Ge&&(0,V.jsx)(Ne,{id:Re,children:`Required`}),A&&We.renderTooltip(o)]})}var B,V,H,U,ot;function st(){return(st=e((()=>{B=t(),Se(),j(),Fe(),ke(),Me(),T(),E(),C(),w(),xe(),je(),V=x(),H=20,U={trackContainer:{kVAEAm:`x1n2onr6`,k1xSpc:`x78zum5`,kGNEyG:`x6s0dn4`,kzQI83:`x1iyjqo2`,kFalU9:`x5ve5x3`,kfSwDN:`x87ps6o`,kHBbk8:`xc8icb0`,$$css:!0},trackContainerHorizontal:{kZKoxP:`x1qx5ct2`,kAzted:`x80b3aj`,kzqmXN:`xh8yej3`,kkrTdU:`x1ypdohk x16khyan`,$$css:!0},trackContainerVertical:{kzqmXN:`xw4jnvo`,kZKoxP:`x1ymw6g`,k7Eaqz:`xkagaj0`,kXwgrk:`xdt5ytf`,kjj79g:`xl56j7k`,kkrTdU:`x1ypdohk x16khyan`,$$css:!0},trackContainerDisabled:{kSiTet:`xbyyjgo`,kkrTdU:`xt0e3qv`,$$css:!0},track:{kVAEAm:`x10l6tqk`,kWkggS:`xdsb6cv`,kaIpWk:`xjspbzw`,$$css:!0},trackHorizontal:{kLqNvP:`x1o0tod`,kt4wiu:`xtijo5x`,kZKoxP:`xqu0tyb`,k87sOh:`xwa60dl`,k3aq6I:`x1cb1t30`,$$css:!0},trackVertical:{k87sOh:`x13vifvy`,krVfgx:`x1ey2m1c`,kzqmXN:`x51ohtg`,$$css:!0},filledTrack:{kVAEAm:`x10l6tqk`,kWkggS:`x1ewilqj`,kaIpWk:`xjspbzw`,$$css:!0},filledTrackHorizontal:{kZKoxP:`xqu0tyb`,k87sOh:`xwa60dl`,k3aq6I:`x1cb1t30`,$$css:!0},filledTrackVertical:{kzqmXN:`x51ohtg`,$$css:!0},thumb:{kVAEAm:`x10l6tqk`,kzqmXN:`xw4jnvo`,kZKoxP:`x1qx5ct2`,kaIpWk:`xjspbzw`,kWkggS:`x1ewilqj`,k3aq6I:`x11lhmoz`,k1ekBW:`x106061f`,kIyJzY:`xuedmi6 x12w9bfk`,kAMwcw:`xlr8y92`,kI3sdo:`x1a2a7pz`,kkrTdU:`x1jm3nie x16khyan`,kY2c9j:`x1vjfegm`,$$css:!0},thumbHorizontal:{k87sOh:`xwa60dl`,k3aq6I:`x11lhmoz xoffwj3`,$$css:!0},thumbHover:{kWkggS:`x1ewilqj xvxo0qp`,$$css:!0},thumbPressed:{kKwaWg:`xpl5ynk`,$$css:!0},thumbDisabled:{kWkggS:`xwmxj5m`,kkrTdU:`xt0e3qv`,$$css:!0}},ot=H/2,at.displayName=`Slider`})))()}function ct({value:e,defaultValue:t,onChange:n,status:r,disabled:i,...a}){let{required:o,field:s}=We({component:`Slider`,caller:a,status:r,disabled:i,ariaRequired:a[`aria-required`],ariaLabel:a[`aria-label`],namesItself:!0}),[c,l]=Ue(e,t,n,a.min??0),u={...a,...s,value:c,onChange:l};return(0,lt.jsx)(Ge,{required:o,children:(0,lt.jsx)(at,{...u})})}var lt;function ut(){return(ut=e((()=>{A(),lt=x(),st()})))()}var W,G,dt,ft;function pt(){return(pt=e((()=>{ze(),He(),ve(),oe(),se(),ne(),D(),ut(),ge(),ue(),fe(),F(),et(),W=t(),G=x(),dt=e=>he(le(e,(e,t)=>{let n=e&&typeof e==`object`&&`label`in e?e.label:e,r=k(n??null);return{value:Number(t),label:r===``?void 0:r}}),`value`),ft=({min:e=`0m`,max:t=`32g`,warn:n,units:r=[`m`,`g`],extraMarks:i,hideSlider:a,step:o=.05,addonPrefix:s,addonSuffix:c,defaultUnit:l,...u})=>{let[d,f]=b(u,{defaultValue:void 0}),{t:p}=_e(),m=(0,W.useMemo)(()=>Be(e,`g`,2),[e]),h=(0,W.useMemo)(()=>Be(t,`g`,2),[t]),g=(0,W.useMemo)(()=>Be(d||`0g`,`g`,2),[d]),[_,v]=ce(`first`);(0,W.useEffect)(()=>{let e=setTimeout(()=>{v(d?.toString())},0);return()=>clearTimeout(e)},[]);let y=de(m?.number)&&de(h?.number)&&m?.number>h?.number,ee=e=>dt(Xe({...e},(e,t)=>{let n=parseFloat(t);return m&&h&&(m?.number>n||h?.number<n)}));return(0,G.jsxs)(O,{direction:`row`,gap:`md`,children:[(0,G.jsx)(O,{style:{flex:2,minWidth:190},direction:`column`,align:`stretch`,children:(0,W.createElement)(re,{...u,key:_,min:e,max:t,units:r,defaultUnit:l,value:d,onChange:e=>{f(e)},style:{width:`100%`},roundStep:o,addonPrefix:s,addonSuffix:c})}),(0,G.jsx)(O,{direction:`column`,align:`stretch`,style:{flex:3,...a&&{visibility:`hidden`,height:0}},children:(0,G.jsx)(O,{direction:`column`,align:`stretch`,children:(0,G.jsx)(ct,{"aria-label":p(`comp:BAIDynamicUnitInputNumberWithSlider.Amount`),width:`100%`,max:h?.number,step:o,value:y?0:g?.number??0,disabled:y,valueDisplay:y?`none`:`tooltip`,formatValue:(e=0)=>e<1?`${(e*1024).toFixed(2)} MiB`:`${e.toFixed(2)} GiB`,onChange:t=>{m?.number&&m.number>t?f(e):f(t<1?`${t*1024}m`:`${t}g`)},marks:ee({...m&&de(m?.number)&&{[m.number]:{label:m.number===0?m.number:m.number>=1?m.number+`g`:m.number*1024+`m`}},...Xe(i,(e,t)=>de(h?.number)?Ze(t)>h?.number:!1),...h?.number&&{[h.number]:{label:h.number===0?h.number:h.number>=1?Ve(h.number,2)+`g`:Ve(h.number*1024,2)+`m`}}})})})})]})}})))()}var mt,ht,gt,K,q,J,Y,X,Z,Q,$,_t;function vt(){return(vt=e((()=>{pt(),Re(),mt=x(),ht={title:`Input/BAIDynamicUnitInputNumberWithSlider`,component:ft,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:"\n**BAIDynamicUnitInputNumberWithSlider** extends [BAIDynamicUnitInputNumber](/?path=/docs/input-dynamicunitinputnumber) with an integrated slider control.\n\n## Features\n- Synchronized input number and slider controls\n- Automatic unit conversion (MiB, GiB, TiB, PiB)\n- Visual feedback with slider marks at min/max values\n- Warning state with color-coded slider track\n- Custom marks for important values (e.g., resource quotas)\n- Handles invalid states (min > max) gracefully by disabling slider\n- Supports hiding slider while maintaining input functionality\n\n## Props\n| Name | Type | Default | Description |\n|------|------|---------|-------------|\n| `min` | `string` | `'0m'` | Minimum value with unit (e.g., '100m', '2g') |\n| `max` | `string` | `'32g'` | Maximum value with unit |\n| `value` | `string \\| null \\| undefined` | `'0g'` | Current value with unit |\n| `units` | `string[]` | `['m', 'g']` | Allowed units (m=MiB, g=GiB, t=TiB, p=PiB) |\n| `step` | `number` | `0.05` | Slider step size in GiB |\n| `roundStep` | `number` | - | Round input value to nearest step |\n| `warn` | `string` | - | Warning threshold value (changes slider color) |\n| `extraMarks` | `SliderMarks` | - | Additional marks on slider |\n| `hideSlider` | `boolean` | `false` | Hide slider (keeps input only) |\n| `addonPrefix` | `ReactNode` | - | Content before input |\n| `addonSuffix` | `ReactNode` | - | Content after input |\n| `onChange` | `(value: string) => void` | - | Callback when value changes |\n\nFor all other props, refer to [Ant Design InputNumber](https://ant.design/components/input-number).\n\n## Unit Abbreviations\n- `m` - MiB (Mebibyte)\n- `g` - GiB (Gibibyte)\n- `t` - TiB (Tebibyte)\n- `p` - PiB (Pebibyte)\n        "}}},argTypes:{min:{control:!1,description:`Minimum value with unit (e.g., "100m", "2g"). Requires format: number + unit (m/g/t/p)`,table:{type:{summary:`string`},defaultValue:{summary:`0m`}}},max:{control:!1,description:`Maximum value with unit. Requires format: number + unit (m/g/t/p)`,table:{type:{summary:`string`},defaultValue:{summary:`32g`}}},value:{control:!1,description:`Current value with unit (controlled). Requires format: number + unit (m/g/t/p)`,table:{type:{summary:`string | null | undefined`},defaultValue:{summary:`0g`}}},units:{control:{type:`object`},description:`Allowed units array (m=MiB, g=GiB, t=TiB, p=PiB)`,table:{type:{summary:`string[]`},defaultValue:{summary:`['m', 'g']`}}},step:{control:{type:`number`},description:`Slider step size in GiB`,table:{type:{summary:`number`},defaultValue:{summary:`0.05`}}},roundStep:{control:{type:`number`},description:`Round input value to nearest step`,table:{type:{summary:`number`}}},warn:{control:!1,description:`Warning threshold value with unit. Slider track turns warning color when value exceeds this. Requires format: number + unit (m/g/t/p)`,table:{type:{summary:`string`}}},extraMarks:{control:!1,description:`Additional slider marks (SliderMarks object mapping number positions to mark configs)`,table:{type:{summary:`SliderMarks`}}},hideSlider:{control:{type:`boolean`},description:`Hide slider component (keeps input only)`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},addonPrefix:{control:!1,description:`Content to display before the input`,table:{type:{summary:`ReactNode`}}},addonSuffix:{control:!1,description:`Content to display after the input`,table:{type:{summary:`ReactNode`}}},onChange:{action:`changed`,description:`Callback fired when value changes`,table:{type:{summary:`(value: string) => void`}}},disabled:{control:{type:`boolean`},description:`Disable both input and slider`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},size:{control:{type:`select`},options:[`small`,`middle`,`large`],description:`Input size`,table:{type:{summary:`'small' | 'middle' | 'large'`}}}}},gt=({value:e,...t})=>(0,mt.jsx)(Le,{initialValues:{mem:e},children:(0,mt.jsx)(Le.Item,{name:`mem`,children:(0,mt.jsx)(ft,{...t})})}),K={name:`Basic`,parameters:{docs:{description:{story:`Basic uncontrolled usage with default settings (0m to 32g range).`}}}},q={name:`FormIntegration`,parameters:{docs:{description:{story:`Controlled by Ant Design Form.Item. The component syncs with form state automatically.`}}},render:gt,args:{value:`1.3g`}},J={name:`MinMaxRange`,parameters:{docs:{description:{story:`Custom min/max range. Slider shows marks at min and max positions.`}}},args:{min:`100m`,max:`45g`}},Y={name:`MiBGiBUnits`,parameters:{docs:{description:{story:`Restrict units to MiB and GiB only. User can switch between these two units.`}}},args:{min:`2g`,max:`45g`,units:[`m`,`g`]}},X={name:`GiBOnly`,parameters:{docs:{description:{story:`Restrict to GiB unit only. Useful when fractional GiB values are needed.`}}},args:{min:`0.5g`,max:`45g`,units:[`g`]}},Z={name:`InvalidRange`,parameters:{docs:{description:{story:`Edge case handling when min > max. Slider is disabled and marks are hidden to prevent confusion.`}}},args:{min:`3g`,max:`1g`,units:[`m`,`g`]}},Q={name:`CustomMarks`,parameters:{docs:{description:{story:`Add custom marks to highlight important values (e.g., recommended settings, quotas).`}}},args:{min:`0g`,max:`1g`,units:[`m`,`g`],extraMarks:{.5:{style:{color:`red`},label:`0.5g`}}}},$={name:`CustomMarksInvalidRange`,parameters:{docs:{description:{story:`Custom marks are filtered out when min > max to maintain consistent invalid state.`}}},args:{min:`3g`,max:`1g`,units:[`m`,`g`],extraMarks:{.5:{style:{color:`red`},label:`0.5g`}}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'Basic uncontrolled usage with default settings (0m to 32g range).'
      }
    }
  }
}`,...K.parameters?.docs?.source}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  name: 'FormIntegration',
  parameters: {
    docs: {
      description: {
        story: 'Controlled by Ant Design Form.Item. The component syncs with form state automatically.'
      }
    }
  },
  render: renderWithFormItem,
  args: {
    value: '1.3g'
  }
}`,...q.parameters?.docs?.source}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  name: 'MinMaxRange',
  parameters: {
    docs: {
      description: {
        story: 'Custom min/max range. Slider shows marks at min and max positions.'
      }
    }
  },
  args: {
    min: '100m',
    max: '45g'
  }
}`,...J.parameters?.docs?.source}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  name: 'MiBGiBUnits',
  parameters: {
    docs: {
      description: {
        story: 'Restrict units to MiB and GiB only. User can switch between these two units.'
      }
    }
  },
  args: {
    min: '2g',
    max: '45g',
    units: ['m', 'g']
  }
}`,...Y.parameters?.docs?.source}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  name: 'GiBOnly',
  parameters: {
    docs: {
      description: {
        story: 'Restrict to GiB unit only. Useful when fractional GiB values are needed.'
      }
    }
  },
  args: {
    min: '0.5g',
    max: '45g',
    units: ['g']
  }
}`,...X.parameters?.docs?.source}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
  name: 'InvalidRange',
  parameters: {
    docs: {
      description: {
        story: 'Edge case handling when min > max. Slider is disabled and marks are hidden to prevent confusion.'
      }
    }
  },
  args: {
    min: '3g',
    max: '1g',
    units: ['m', 'g']
  }
}`,...Z.parameters?.docs?.source}}},Q.parameters={...Q.parameters,docs:{...Q.parameters?.docs,source:{originalSource:`{
  name: 'CustomMarks',
  parameters: {
    docs: {
      description: {
        story: 'Add custom marks to highlight important values (e.g., recommended settings, quotas).'
      }
    }
  },
  args: {
    min: '0g',
    max: '1g',
    units: ['m', 'g'],
    extraMarks: {
      0.5: {
        style: {
          color: 'red'
        },
        label: '0.5g'
      }
    }
  }
}`,...Q.parameters?.docs?.source}}},$.parameters={...$.parameters,docs:{...$.parameters?.docs,source:{originalSource:`{
  name: 'CustomMarksInvalidRange',
  parameters: {
    docs: {
      description: {
        story: 'Custom marks are filtered out when min > max to maintain consistent invalid state.'
      }
    }
  },
  args: {
    min: '3g',
    max: '1g',
    units: ['m', 'g'],
    extraMarks: {
      0.5: {
        style: {
          color: 'red'
        },
        label: '0.5g'
      }
    }
  }
}`,...$.parameters?.docs?.source}}},_t=[`Default`,`WithFormItem`,`WithMin`,`AllowOnlyMiBandGiB`,`AllowOnlyGiB`,`GreaterMinThanMax`,`ExtraMarks`,`ExtraMarksWithGreaterMinThanMax`]})))()}vt();export{X as AllowOnlyGiB,Y as AllowOnlyMiBandGiB,K as Default,Q as ExtraMarks,$ as ExtraMarksWithGreaterMinThanMax,Z as GreaterMinThanMax,q as WithFormItem,J as WithMin,_t as __namedExportsOrder,ht as default};