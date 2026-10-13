import{$ as Ne,a0 as Dt,i as Pt,aX as zt,bC as Nt,r as p,a2 as Vt,a3 as Ve,K as Rt,j as k,q as z,s as fe,t as J,P as $t,V as Ft,Z as Wt,W as Et,b as Ut,_ as Re}from"./iframe-sGq7EQIF.js";import{c as ye,e as $e}from"./index-BcWX0nJq.js";import{n as Ot}from"./astryxLabel-N38r1Fgr.js";import{u as Ht}from"./useControllableValue-th4cuctO.js";import{a as _t}from"./useUpdatableState-sujsmEQA.js";import{B as Kt}from"./BAIDynamicUnitInputNumber-BNqETgq2.js";import{B as Q}from"./BAIFlex-8knR-K8O.js";import{i as ee}from"./isNumber-DmCYTo8z.js";import{F as Lt}from"./InputClearButton-dfFPzyIV.js";import{i as Gt}from"./isRtlElement-B2-7SF8s.js";import{r as he}from"./rtlStyles-T4i24HtE.js";import{b as ve}from"./_baseEach-s2BgHhva.js";import{n as Zt,b as Xt}from"./negate-DBEdfcY0.js";import{a as ue,t as Yt}from"./toString-COxp_z0n.js";import{c as xt,t as Jt,b as bt}from"./_baseGet-DSubRNAt.js";import{a as Qt,g as en}from"./_getAllKeysIn-Dc1TDbhB.js";import{b as tn}from"./_baseFlatten-BErQd90q.js";import{b as nn,m as rn}from"./map-BiutQ6oO.js";import{i as Fe}from"./isSymbol-CZqO4-0T.js";import{i as an}from"./identity-DKeuBCMA.js";import{i as We}from"./_isIterateeCall-BXkzUpkg.js";import"./preload-helper-Dp1pzeXC.js";import"./filter-BYsx4Zi8.js";import"./isEmpty-sDdqQ21x.js";import"./useEventNotStable-Bg21xFTK.js";import"./NumberStepper2-CP7M1zxV.js";import"./InputGroupContext-D9HE5GGe.js";import"./NumberInput-C4-JesIf.js";import"./FieldStatus-CfcR44ly.js";import"./useInputStatusIcon-4dRyRTRl.js";import"./useResolvedRequired-CjLHb3QF.js";import"./isNil-CHIgUVhi.js";import"./Selector-DUz72l4G.js";import"./useFocusReturnVisibility-BLrPTdhX.js";import"./SelectorOption-BoblomTm.js";import"./Item-CH3Zz-Yy.js";import"./computeTargetAndRel-BGwjeA1c.js";import"./useDevWarning-C790kipx.js";import"./isRenderable-BUV0eL6r.js";import"./usePopover-Cz9owhRa.js";import"./useIndicator-DWt_P89G.js";import"./Divider-L8Qnhasd.js";import"./find-CdU-f_8K.js";import"./_baseFindIndex-Cj99RmFE.js";import"./toInteger-Cc9NKVR4.js";import"./toFinite-CudJCqxw.js";import"./toNumber-DIMSP83Q.js";import"./_trimmedEndIndex-DuQxD0U0.js";import"./_baseClamp-DVUOCJN_.js";import"./get-DHyKFdgW.js";import"./_overRest--3fcR4uN.js";import"./_baseAssignValue-BgsRvuj7.js";function sn(t,e,a,l){if(!Ne(t))return t;e=xt(e,t);for(var d=-1,r=e.length,f=r-1,v=t;v!=null&&++d<r;){var y=Jt(e[d]),g=a;if(y==="__proto__"||y==="constructor"||y==="prototype")return t;if(d!=f){var C=v[y];g=void 0,g===void 0&&(g=Ne(C)?C:Dt(e[d+1])?[]:{})}Qt(v,y,g),v=v[y]}return t}function on(t,e,a){for(var l=-1,d=e.length,r={};++l<d;){var f=e[l],v=bt(t,f);a(v,f)&&sn(r,xt(f,t),v)}return r}function ln(t,e){if(t==null)return{};var a=ue(en(t),function(l){return[l]});return e=ve(e),on(t,a,function(l,d){return e(l,d[0])})}function Ee(t,e){return ln(t,Zt(ve(e)))}function un(t,e){var a=t.length;for(t.sort(e);a--;)t[a]=t[a].value;return t}function cn(t,e){if(t!==e){var a=t!==void 0,l=t===null,d=t===t,r=Fe(t),f=e!==void 0,v=e===null,y=e===e,g=Fe(e);if(!v&&!g&&!r&&t>e||r&&f&&y&&!v&&!g||l&&f&&y||!a&&y||!d)return 1;if(!l&&!r&&!g&&t<e||g&&a&&d&&!l&&!r||v&&a&&d||!f&&d||!y)return-1}return 0}function mn(t,e,a){for(var l=-1,d=t.criteria,r=e.criteria,f=d.length,v=a.length;++l<f;){var y=cn(d[l],r[l]);if(y){if(l>=v)return y;var g=a[l];return y*(g=="desc"?-1:1)}}return t.index-e.index}function dn(t,e,a){e.length?e=ue(e,function(r){return Pt(r)?function(f){return bt(f,r.length===1?r[0]:r)}:r}):e=[an];var l=-1;e=ue(e,zt(ve));var d=nn(t,function(r,f,v){var y=ue(e,function(g){return g(r)});return{criteria:y,index:++l,value:r}});return un(d,function(r,f){return mn(r,f,a)})}var pn=/^\s+/,gn=Nt.parseInt;function xn(t,e,a){return e==null?e=0:e&&(e=+e),gn(Yt(t).replace(pn,""),e||0)}var bn=Xt(function(t,e){if(t==null)return[];var a=e.length;return a>1&&We(t,e[0],e[1])?e=[]:a>2&&We(e[0],e[1],e[2])&&(e=[e[0]]),dn(t,tn(e),[])});const ce=20,q={track:{kVAEAm:"x10l6tqk",kWkggS:"xdsb6cv",kaIpWk:"xjspbzw",$$css:!0},trackHorizontal:{kLqNvP:"x1o0tod",kt4wiu:"xtijo5x",kZKoxP:"xqu0tyb",k87sOh:"xwa60dl",k3aq6I:"x1cb1t30",$$css:!0},trackVertical:{k87sOh:"x13vifvy",krVfgx:"x1ey2m1c",kzqmXN:"x51ohtg",$$css:!0},filledTrack:{kVAEAm:"x10l6tqk",kWkggS:"x1ewilqj",kaIpWk:"xjspbzw",$$css:!0},filledTrackHorizontal:{kZKoxP:"xqu0tyb",k87sOh:"xwa60dl",k3aq6I:"x1cb1t30",$$css:!0},filledTrackVertical:{kzqmXN:"x51ohtg",$$css:!0},thumb:{kVAEAm:"x10l6tqk",kzqmXN:"xw4jnvo",kZKoxP:"x1qx5ct2",kaIpWk:"xjspbzw",kWkggS:"x1ewilqj",k3aq6I:"x11lhmoz",k1ekBW:"x106061f",kIyJzY:"xuedmi6 x12w9bfk",kAMwcw:"xlr8y92",kI3sdo:"x1a2a7pz",kkrTdU:"x1jm3nie x16khyan",kY2c9j:"x1vjfegm",$$css:!0},thumbHorizontal:{k87sOh:"xwa60dl",k3aq6I:"x11lhmoz xoffwj3",$$css:!0},thumbHover:{kWkggS:"x1ewilqj xvxo0qp",$$css:!0},thumbPressed:{kKwaWg:"xpl5ynk",$$css:!0},thumbDisabled:{kWkggS:"xwmxj5m",kkrTdU:"xt0e3qv",$$css:!0}};function B(t,e,a){return Math.min(Math.max(t,e),a)}function Ue(t){var a;if(Math.abs(t)<1){const l=t.toExponential().split("e-");if(l.length===2)return(((a=l[0].split(".")[1])==null?void 0:a.length)??0)+parseInt(l[1],10)}const e=String(t).split(".")[1];return e?e.length:0}function ke(t,e,a){if(a<=0)return t;const l=Math.round((t-e)/a),d=e+l*a,r=Math.min(Math.max(Ue(e),Ue(a)),20);return Number(d.toFixed(r))}function H(t,e,a){return a===e?0:(t-e)/(a-e)*100}const ft=ce/2;function I(t){return yt(t,ft-t/100*ce)}function Oe(t,e){const a=e-t;return yt(a,-(a/100)*ce)}function He(t,e){const a=e-ce;return a>0?(t-ft)/a:e>0?t/e:0}function yt(t,e){const a=l=>Number(l.toFixed(3));return`calc(${a(t)}% ${e<0?"-":"+"} ${Math.abs(a(e))}px)`}function ht({ref:t,...e}){const{label:a,isLabelHidden:l=!1,description:d,isDisabled:r=!1,disabledMessage:f,isOptional:v=!1,isRequired:y=!1,status:g,labelTooltip:C,min:o=0,max:x=100,step:S=1,orientation:c="horizontal",formatValue:u,htmlName:N,valueDisplay:_="tooltip",marks:K,width:F,xstyle:me,className:j,style:L,"data-testid":de,value:A,onChange:D,onChangeEnd:we}=e,M=Array.isArray(A),W=M&&"minStepsBetweenThumbs"in e?e.minStepsBetweenThumbs??0:0,T=c==="horizontal",Me=p.useId(),pe=p.useId(),je=p.useId(),Se=p.useId(),Te=p.useId(),ge=p.useRef(null),E=p.useRef(null),[qe,Be]=p.useState(null),[vt,G]=p.useState(null);Vt();const wt=p.useCallback((n,i)=>{G(!r&&Ve()==="keyboard"?n:null)},[r]),Mt=p.useCallback(n=>{G(null)},[]),U=r&&!!f,xe=Rt({placement:"above",focusTrigger:"always",isEnabled:U}),Ae=y&&!v,V=[];d&&V.push(je),g!=null&&g.message&&V.push(Se),Ae&&V.push(Te),U&&V.push(xe.describedBy);const jt=V.length>0?V.join(" "):void 0,h=p.useMemo(()=>(Array.isArray(A)?A:[A??o]).map(i=>B(i,o,x)),[A,o,x]),Ie=p.useRef(h);Ie.current=h;const Z=p.useCallback((n,i)=>{const m=ge.current;if(!m)return o;const s=m.getBoundingClientRect();let b;T?b=He(Gt(m)?s.right-n:n-s.left,s.width):b=1-He(i-s.top,s.height),b=B(b,0,1);const w=o+b*(x-o);return B(ke(w,o,S),o,x)},[o,x,S,T]),Ce=p.useCallback(n=>{if(!M)return 0;const[i,m]=h,s=Math.abs(n-i),b=Math.abs(n-m);return s<=b?0:1},[M,h]),R=p.useCallback((n,i)=>{if(r)return;const m=B(ke(i,o,S),o,x);if(M){const s=[...h];s[n]=m;const b=W*S;n===0?s[0]=Math.min(s[0],s[1]-b):s[1]=Math.max(s[1],s[0]+b),s[0]=B(s[0],o,x),s[1]=B(s[1],o,x),D==null||D(s)}else D==null||D(m)},[r,M,h,o,x,S,W,D]),De=p.useRef(we);De.current=we;const O=p.useCallback(n=>{const i=n??Ie.current,m=De.current;M?m==null||m(i):m==null||m(i[0])},[M]),St=p.useCallback(n=>{var Y;if(r)return;n.preventDefault();const i=n.target.closest("[data-mark-value]"),m=i?Number(i.dataset.markValue):Z(n.clientX,n.clientY),s=ge.current,b=s==null?void 0:s.querySelectorAll('[role="slider"]'),w=n.target.closest('[role="slider"]'),P=w==null||b==null?-1:Array.from(b).indexOf(w),$=P>=0?P:Ce(m);E.current=$,Be($),R($,m),(Y=b==null?void 0:b[$])==null||Y.focus(),G(null),typeof n.currentTarget.setPointerCapture=="function"&&n.currentTarget.setPointerCapture(n.pointerId)},[r,Z,Ce,R]),Tt=p.useCallback(n=>{if(E.current===null||r)return;const i=Z(n.clientX,n.clientY);R(E.current,i)},[r,Z,R]),Pe=p.useCallback(n=>{E.current!==null&&(E.current=null,Be(null),O())},[O]),qt=p.useCallback((n,i)=>{if(r)return;i.key!=="Shift"&&!i.metaKey&&!i.altKey&&!i.ctrlKey&&Ve()==="keyboard"&&G(n);const m=h[n];let s;switch(i.key){case"ArrowRight":case"ArrowUp":s=m+S;break;case"ArrowLeft":case"ArrowDown":s=m-S;break;case"PageUp":s=m+S*10;break;case"PageDown":s=m-S*10;break;case"Home":s=o;break;case"End":s=x;break;default:return}i.preventDefault();const b=B(ke(s,o,S),o,x);if(R(n,s),M){const w=[...h];w[n]=b;const P=W*S;n===0?w[0]=Math.min(w[0],w[1]-P):w[1]=Math.max(w[1],w[0]+P),w[0]=B(w[0],o,x),w[1]=B(w[1],o,x),O(w)}else O([b])},[r,M,h,S,o,x,W,R,O]),X=n=>u?u(n):String(n),Bt=n=>{const i=h[n],m=H(i,o,x),s=T?{insetInlineStart:I(m)}:{bottom:I(m),left:"50%"},b=M?n===0?"Minimum value":"Maximum value":void 0,w=W*S,P=M&&n===1?B(h[0]+w,o,x):o,$=M&&n===0?B(h[1]-w,o,x):x,Y=_==="tooltip"&&!U,Ct=T?"above":"start",ze=k.jsx("div",{id:M?void 0:Me,role:"slider",tabIndex:r&&!U?-1:0,"aria-valuemin":P,"aria-valuemax":$,"aria-valuenow":i,"aria-valuetext":u?u(i):void 0,"aria-orientation":c,"aria-disabled":r||void 0,"aria-invalid":(g==null?void 0:g.type)==="error"?!0:void 0,"aria-label":b,"aria-labelledby":M?void 0:pe,"aria-describedby":jt,onKeyDown:be=>qt(n,be),onFocus:be=>wt(n,be),onBlur:Mt,...z(J("slider-thumb",{orientation:c,disabled:r?"disabled":null}),fe(q.thumb,T?q.thumbHorizontal:he.centerInline("50%"),!r&&q.thumbHover,!r&&qe===n&&q.thumbPressed,!r&&vt===n&&Wt.focusVisible,r&&q.thumbDisabled),void 0,s)},n);return Y?k.jsx(Et,{content:X(i),placement:Ct,delay:0,focusTrigger:"always",isOpen:qe===n?!0:void 0,children:ze},n):ze},At=(()=>{if(M){const[i,m]=h,s=H(i,o,x),b=H(m,o,x);return T?{insetInlineStart:I(s),width:Oe(s,b)}:{bottom:I(s),height:Oe(s,b)}}const n=H(h[0],o,x);return T?{insetInlineStart:"0%",width:I(n)}:{bottom:"0%",height:I(n)}})(),It=_==="text"?k.jsx("span",{className:"x9ynric xcr08ib x1tgivj0 xuxw1ft x2lah0s",children:M?`${X(h[0])} – ${X(h[1])}`:X(h[0])}):null;return k.jsxs(Lt,{"data-testid":de,label:a,isLabelHidden:l,description:d,inputID:Me,labelID:pe,isGroupLabel:!0,descriptionID:d?je:void 0,isOptional:v,isRequired:y,isDisabled:r,status:g?{type:g.type,message:g.message,messageID:g.message?Se:void 0}:void 0,labelTooltip:C,statusVariant:"detached",width:F,xstyle:me,className:j,style:L,children:[k.jsxs("div",{...z(J("slider",{orientation:c,disabled:r?"disabled":null}),{className:"x78zum5 x6s0dn4 x1txdalj"}),children:[N!=null&&h.map((n,i)=>k.jsx("input",{type:"hidden",name:N,value:String(n),disabled:r},i===0?"start":"end")),k.jsxs("div",{ref:$t(t,ge,xe.ref),...M?{role:"group","aria-labelledby":pe}:void 0,onPointerDown:St,onPointerMove:Tt,onPointerUp:Pe,onPointerCancel:Pe,...z(J("slider-control",{orientation:c,disabled:r?"disabled":null}),{0:{className:"x1n2onr6 x78zum5 x6s0dn4 x1iyjqo2 x5ve5x3 x87ps6o xc8icb0 xw4jnvo x1ymw6g xkagaj0 xdt5ytf xl56j7k x1ypdohk x16khyan"},2:{className:"x1n2onr6 x78zum5 x6s0dn4 x1iyjqo2 x5ve5x3 x87ps6o xc8icb0 x1qx5ct2 x80b3aj xh8yej3 x1ypdohk x16khyan"},1:{className:"x1n2onr6 x78zum5 x6s0dn4 x1iyjqo2 x5ve5x3 x87ps6o xc8icb0 xw4jnvo x1ymw6g xkagaj0 xdt5ytf xl56j7k xbyyjgo xt0e3qv"},3:{className:"x1n2onr6 x78zum5 x6s0dn4 x1iyjqo2 x5ve5x3 x87ps6o xc8icb0 x1qx5ct2 x80b3aj xh8yej3 xbyyjgo xt0e3qv"}}[!!T<<1|!!r<<0]),children:[k.jsx("div",{"aria-hidden":"true",...z(J("slider-track",{orientation:c}),fe(q.track,T?q.trackHorizontal:[q.trackVertical,he.centerInline("0px")]))}),k.jsx("div",{"aria-hidden":"true",...z(fe(q.filledTrack,T?q.filledTrackHorizontal:[q.filledTrackVertical,he.centerInline("0px")]),{style:At})}),K&&k.jsx("div",{"aria-hidden":"true",...{0:{className:"x10l6tqk x13vifvy x1ey2m1c xbudbmw"},1:{className:"x10l6tqk x1o0tod xtijo5x xwa60dl"}}[!!T<<0],children:K.map(n=>{const i=H(n.value,o,x),m=T?{insetInlineStart:I(i)}:{bottom:I(i)},s=M?n.value>=h[0]&&n.value<=h[1]:n.value<=h[0];return k.jsxs("div",{children:[k.jsx("div",{"data-testid":"slider-mark","data-mark-value":n.value,...z({0:{className:"x10l6tqk xdsb6cv xjspbzw x36qwtl x1xc55vz x1m9mm8y"},2:{className:"x10l6tqk xdsb6cv xjspbzw xfo62xy xdk7pt x11lhmoz xoffwj3"},1:{className:"x10l6tqk xjspbzw x36qwtl x1xc55vz x1m9mm8y x1ewilqj"},3:{className:"x10l6tqk xjspbzw xfo62xy xdk7pt x11lhmoz xoffwj3 x1ewilqj"}}[!!T<<1|!!s<<0],{style:m})}),n.label&&k.jsx("span",{"data-testid":"slider-mark-label","data-mark-value":n.value,...z({0:{className:"x10l6tqk x9ynric x141an7d xv1l7n4 xuxw1ft x131p8rn x9p6ekw"},1:{className:"x10l6tqk x9ynric x141an7d xv1l7n4 xuxw1ft xuuh30 x1nyx83j xuivejd"}}[!!T<<0],{style:m}),children:n.label})]},n.value)})}),h.map((n,i)=>Bt(i))]}),It]}),Ae&&k.jsx(Ft,{id:Te,children:"Required"}),U&&xe.renderTooltip(f)]})}ht.displayName="Slider";const fn=t=>bn(rn(t,(e,a)=>{const l=e&&typeof e=="object"&&"label"in e?e.label:e,d=Ot(l??null);return{value:Number(a),label:d===""?void 0:d}}),"value"),kt=({min:t="0m",max:e="32g",warn:a,units:l=["m","g"],extraMarks:d,hideSlider:r,step:f=.05,addonPrefix:v,addonSuffix:y,defaultUnit:g,...C})=>{const[o,x]=Ht(C,{defaultValue:void 0}),{t:S}=Ut(),c=p.useMemo(()=>ye(t,"g",2),[t]),u=p.useMemo(()=>ye(e,"g",2),[e]),N=p.useMemo(()=>ye(o||"0g","g",2),[o]),[_,K]=_t("first");p.useEffect(()=>{const j=setTimeout(()=>{K(o==null?void 0:o.toString())},0);return()=>clearTimeout(j)},[]);const F=ee(c==null?void 0:c.number)&&ee(u==null?void 0:u.number)&&(c==null?void 0:c.number)>(u==null?void 0:u.number),me=j=>fn(Ee({...j},(L,de)=>{const A=parseFloat(de);return c&&u&&((c==null?void 0:c.number)>A||(u==null?void 0:u.number)<A)}));return k.jsxs(Q,{direction:"row",gap:"md",children:[k.jsx(Q,{style:{flex:2,minWidth:190},direction:"column",align:"stretch",children:p.createElement(Kt,{...C,key:_,min:t,max:e,units:l,defaultUnit:g,value:o,onChange:j=>{x(j)},style:{width:"100%"},roundStep:f,addonPrefix:v,addonSuffix:y})}),k.jsx(Q,{direction:"column",align:"stretch",style:{flex:3,...r&&{visibility:"hidden",height:0}},children:k.jsx(Q,{direction:"column",align:"stretch",children:k.jsx(ht,{label:S("comp:BAIDynamicUnitInputNumberWithSlider.Amount"),isLabelHidden:!0,width:"100%",max:u==null?void 0:u.number,step:f,value:F?0:(N==null?void 0:N.number)??0,isDisabled:F,valueDisplay:F?"none":"tooltip",formatValue:(j=0)=>j<1?`${(j*1024).toFixed(2)} MiB`:`${j.toFixed(2)} GiB`,onChange:j=>{c!=null&&c.number&&c.number>j?x(t):x(j<1?`${j*1024}m`:`${j}g`)},marks:me({...c&&ee(c==null?void 0:c.number)&&{[c.number]:{label:c.number===0?c.number:c.number>=1?c.number+"g":c.number*1024+"m"}},...Ee(d,(j,L)=>ee(u==null?void 0:u.number)?xn(L)>(u==null?void 0:u.number):!1),...(u==null?void 0:u.number)&&{[u.number]:{label:u.number===0?u.number:u.number>=1?$e(u.number,2)+"g":$e(u.number*1024,2)+"m"}}})})})})]})},fr={title:"Input/BAIDynamicUnitInputNumberWithSlider",component:kt,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:"\n**BAIDynamicUnitInputNumberWithSlider** extends [BAIDynamicUnitInputNumber](/?path=/docs/input-dynamicunitinputnumber) with an integrated slider control.\n\n## Features\n- Synchronized input number and slider controls\n- Automatic unit conversion (MiB, GiB, TiB, PiB)\n- Visual feedback with slider marks at min/max values\n- Warning state with color-coded slider track\n- Custom marks for important values (e.g., resource quotas)\n- Handles invalid states (min > max) gracefully by disabling slider\n- Supports hiding slider while maintaining input functionality\n\n## Props\n| Name | Type | Default | Description |\n|------|------|---------|-------------|\n| `min` | `string` | `'0m'` | Minimum value with unit (e.g., '100m', '2g') |\n| `max` | `string` | `'32g'` | Maximum value with unit |\n| `value` | `string \\| null \\| undefined` | `'0g'` | Current value with unit |\n| `units` | `string[]` | `['m', 'g']` | Allowed units (m=MiB, g=GiB, t=TiB, p=PiB) |\n| `step` | `number` | `0.05` | Slider step size in GiB |\n| `roundStep` | `number` | - | Round input value to nearest step |\n| `warn` | `string` | - | Warning threshold value (changes slider color) |\n| `extraMarks` | `SliderMarks` | - | Additional marks on slider |\n| `hideSlider` | `boolean` | `false` | Hide slider (keeps input only) |\n| `addonPrefix` | `ReactNode` | - | Content before input |\n| `addonSuffix` | `ReactNode` | - | Content after input |\n| `onChange` | `(value: string) => void` | - | Callback when value changes |\n\nFor all other props, refer to [Ant Design InputNumber](https://ant.design/components/input-number).\n\n## Unit Abbreviations\n- `m` - MiB (Mebibyte)\n- `g` - GiB (Gibibyte)\n- `t` - TiB (Tebibyte)\n- `p` - PiB (Pebibyte)\n        "}}},argTypes:{min:{control:!1,description:'Minimum value with unit (e.g., "100m", "2g"). Requires format: number + unit (m/g/t/p)',table:{type:{summary:"string"},defaultValue:{summary:"0m"}}},max:{control:!1,description:"Maximum value with unit. Requires format: number + unit (m/g/t/p)",table:{type:{summary:"string"},defaultValue:{summary:"32g"}}},value:{control:!1,description:"Current value with unit (controlled). Requires format: number + unit (m/g/t/p)",table:{type:{summary:"string | null | undefined"},defaultValue:{summary:"0g"}}},units:{control:{type:"object"},description:"Allowed units array (m=MiB, g=GiB, t=TiB, p=PiB)",table:{type:{summary:"string[]"},defaultValue:{summary:"['m', 'g']"}}},step:{control:{type:"number"},description:"Slider step size in GiB",table:{type:{summary:"number"},defaultValue:{summary:"0.05"}}},roundStep:{control:{type:"number"},description:"Round input value to nearest step",table:{type:{summary:"number"}}},warn:{control:!1,description:"Warning threshold value with unit. Slider track turns warning color when value exceeds this. Requires format: number + unit (m/g/t/p)",table:{type:{summary:"string"}}},extraMarks:{control:!1,description:"Additional slider marks (SliderMarks object mapping number positions to mark configs)",table:{type:{summary:"SliderMarks"}}},hideSlider:{control:{type:"boolean"},description:"Hide slider component (keeps input only)",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},addonPrefix:{control:!1,description:"Content to display before the input",table:{type:{summary:"ReactNode"}}},addonSuffix:{control:!1,description:"Content to display after the input",table:{type:{summary:"ReactNode"}}},onChange:{action:"changed",description:"Callback fired when value changes",table:{type:{summary:"(value: string) => void"}}},disabled:{control:{type:"boolean"},description:"Disable both input and slider",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},size:{control:{type:"select"},options:["small","middle","large"],description:"Input size",table:{type:{summary:"'small' | 'middle' | 'large'"}}}}},yn=({value:t,...e})=>k.jsx(Re,{initialValues:{mem:t},children:k.jsx(Re.Item,{name:"mem",children:k.jsx(kt,{...e})})}),te={name:"Basic",parameters:{docs:{description:{story:"Basic uncontrolled usage with default settings (0m to 32g range)."}}}},ne={name:"FormIntegration",parameters:{docs:{description:{story:"Controlled by Ant Design Form.Item. The component syncs with form state automatically."}}},render:yn,args:{value:"1.3g"}},re={name:"MinMaxRange",parameters:{docs:{description:{story:"Custom min/max range. Slider shows marks at min and max positions."}}},args:{min:"100m",max:"45g"}},ae={name:"MiBGiBUnits",parameters:{docs:{description:{story:"Restrict units to MiB and GiB only. User can switch between these two units."}}},args:{min:"2g",max:"45g",units:["m","g"]}},se={name:"GiBOnly",parameters:{docs:{description:{story:"Restrict to GiB unit only. Useful when fractional GiB values are needed."}}},args:{min:"0.5g",max:"45g",units:["g"]}},ie={name:"InvalidRange",parameters:{docs:{description:{story:"Edge case handling when min > max. Slider is disabled and marks are hidden to prevent confusion."}}},args:{min:"3g",max:"1g",units:["m","g"]}},oe={name:"CustomMarks",parameters:{docs:{description:{story:"Add custom marks to highlight important values (e.g., recommended settings, quotas)."}}},args:{min:"0g",max:"1g",units:["m","g"],extraMarks:{.5:{style:{color:"red"},label:"0.5g"}}}},le={name:"CustomMarksInvalidRange",parameters:{docs:{description:{story:"Custom marks are filtered out when min > max to maintain consistent invalid state."}}},args:{min:"3g",max:"1g",units:["m","g"],extraMarks:{.5:{style:{color:"red"},label:"0.5g"}}}};var _e,Ke,Le;te.parameters={...te.parameters,docs:{...(_e=te.parameters)==null?void 0:_e.docs,source:{originalSource:`{
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'Basic uncontrolled usage with default settings (0m to 32g range).'
      }
    }
  }
}`,...(Le=(Ke=te.parameters)==null?void 0:Ke.docs)==null?void 0:Le.source}}};var Ge,Ze,Xe;ne.parameters={...ne.parameters,docs:{...(Ge=ne.parameters)==null?void 0:Ge.docs,source:{originalSource:`{
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
}`,...(Xe=(Ze=ne.parameters)==null?void 0:Ze.docs)==null?void 0:Xe.source}}};var Ye,Je,Qe;re.parameters={...re.parameters,docs:{...(Ye=re.parameters)==null?void 0:Ye.docs,source:{originalSource:`{
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
}`,...(Qe=(Je=re.parameters)==null?void 0:Je.docs)==null?void 0:Qe.source}}};var et,tt,nt;ae.parameters={...ae.parameters,docs:{...(et=ae.parameters)==null?void 0:et.docs,source:{originalSource:`{
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
}`,...(nt=(tt=ae.parameters)==null?void 0:tt.docs)==null?void 0:nt.source}}};var rt,at,st;se.parameters={...se.parameters,docs:{...(rt=se.parameters)==null?void 0:rt.docs,source:{originalSource:`{
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
}`,...(st=(at=se.parameters)==null?void 0:at.docs)==null?void 0:st.source}}};var it,ot,lt;ie.parameters={...ie.parameters,docs:{...(it=ie.parameters)==null?void 0:it.docs,source:{originalSource:`{
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
}`,...(lt=(ot=ie.parameters)==null?void 0:ot.docs)==null?void 0:lt.source}}};var ut,ct,mt;oe.parameters={...oe.parameters,docs:{...(ut=oe.parameters)==null?void 0:ut.docs,source:{originalSource:`{
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
}`,...(mt=(ct=oe.parameters)==null?void 0:ct.docs)==null?void 0:mt.source}}};var dt,pt,gt;le.parameters={...le.parameters,docs:{...(dt=le.parameters)==null?void 0:dt.docs,source:{originalSource:`{
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
}`,...(gt=(pt=le.parameters)==null?void 0:pt.docs)==null?void 0:gt.source}}};const yr=["Default","WithFormItem","WithMin","AllowOnlyMiBandGiB","AllowOnlyGiB","GreaterMinThanMax","ExtraMarks","ExtraMarksWithGreaterMinThanMax"];export{se as AllowOnlyGiB,ae as AllowOnlyMiBandGiB,te as Default,oe as ExtraMarks,le as ExtraMarksWithGreaterMinThanMax,ie as GreaterMinThanMax,ne as WithFormItem,re as WithMin,yr as __namedExportsOrder,fr as default};
