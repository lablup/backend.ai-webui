import{T as De,U as Pn,i as Vn,a_ as Nn,bE as Rn,r as p,Y as zn,Z as Pe,H as $n,j as y,q as P,s as xe,t as Y,N as Fn,V as En,Q as Wn,ar as Un,b as Hn,_ as Ve}from"./iframe-BGOb31B2.js";import{c as be,g as Ne}from"./index-SYY3Z2xT.js";import{n as On}from"./astryxLabel-rmlcLjxP.js";import{u as _n}from"./useControllableValue-ChhSyzcA.js";import{a as Kn}from"./useUpdatableState-C7M9GzNO.js";import{B as Ln}from"./usePrevious-C7AyA6vd.js";import{B as X}from"./BAIFlex-Bq6ckDrV.js";import{i as J}from"./isNumber-CAm4BCVa.js";import{F as Gn}from"./InputClearButton-YaGktEH1.js";import{i as Zn}from"./isRtlElement-B2-7SF8s.js";import{r as fe}from"./rtlStyles-T4i24HtE.js";import{b as he}from"./_baseEach-DnkLKq_y.js";import{n as Yn,b as Xn}from"./negate-DpOv2bps.js";import{a as oe,t as Jn}from"./toString-CjKS5fhU.js";import{c as pn,t as Qn,b as gn}from"./_baseGet-DCtVhzdt.js";import{a as et,g as nt}from"./_getAllKeysIn-C4cVey2E.js";import{b as tt}from"./_baseFlatten-BvXexYxo.js";import{b as rt,m as at}from"./map-BMKDra55.js";import{i as Re}from"./isSymbol-BuyOVbCZ.js";import{i as st}from"./identity-DKeuBCMA.js";import{i as ze}from"./_isIterateeCall-73DpEwWY.js";import"./preload-helper-Dp1pzeXC.js";import"./filter--yOgVODM.js";import"./isEmpty-39liE-qQ.js";import"./useEventNotStable-C0pHsePv.js";import"./NumberStepper2-q19hNeaz.js";import"./InputGroupContext-D39VNQdS.js";import"./NumberInput-BSzgPVao.js";import"./FieldStatus-Cgb1bYy2.js";import"./useInputStatusIcon-BeNsPBKa.js";import"./useResolvedRequired-Dh_fg6IV.js";import"./isNil-CHIgUVhi.js";import"./Selector-VI3mK4l0.js";import"./useFocusReturnVisibility-C1kRb4MI.js";import"./SelectorOption-CyILX3sU.js";import"./Item-D365Tc1P.js";import"./useDevWarning-Br_tHylH.js";import"./isRenderable-BUV0eL6r.js";import"./usePopover-DrIpxqbu.js";import"./useIndicator-B4_Fxuby.js";import"./Divider-8_fs8WVx.js";import"./find-BXB_fElo.js";import"./_baseFindIndex-Cj99RmFE.js";import"./toInteger-DjHoJ3uV.js";import"./toFinite-B9x7LPT0.js";import"./toNumber-LS_ZDvGt.js";import"./_trimmedEndIndex-DuQxD0U0.js";import"./_baseClamp-DVUOCJN_.js";import"./get-CJmLjhcy.js";import"./_overRest-u_sPmiBc.js";import"./_baseAssignValue-CzumrECc.js";function it(n,e,a,l){if(!De(n))return n;e=pn(e,n);for(var d=-1,r=e.length,b=r-1,k=n;k!=null&&++d<r;){var f=Qn(e[d]),g=a;if(f==="__proto__"||f==="constructor"||f==="prototype")return n;if(d!=b){var C=k[f];g=void 0,g===void 0&&(g=De(C)?C:Pn(e[d+1])?[]:{})}et(k,f,g),k=k[f]}return n}function ot(n,e,a){for(var l=-1,d=e.length,r={};++l<d;){var b=e[l],k=gn(n,b);a(k,b)&&it(r,pn(b,n),k)}return r}function lt(n,e){if(n==null)return{};var a=oe(nt(n),function(l){return[l]});return e=he(e),ot(n,a,function(l,d){return e(l,d[0])})}function $e(n,e){return lt(n,Yn(he(e)))}function ut(n,e){var a=n.length;for(n.sort(e);a--;)n[a]=n[a].value;return n}function ct(n,e){if(n!==e){var a=n!==void 0,l=n===null,d=n===n,r=Re(n),b=e!==void 0,k=e===null,f=e===e,g=Re(e);if(!k&&!g&&!r&&n>e||r&&b&&f&&!k&&!g||l&&b&&f||!a&&f||!d)return 1;if(!l&&!r&&!g&&n<e||g&&a&&d&&!l&&!r||k&&a&&d||!b&&d||!f)return-1}return 0}function mt(n,e,a){for(var l=-1,d=n.criteria,r=e.criteria,b=d.length,k=a.length;++l<b;){var f=ct(d[l],r[l]);if(f){if(l>=k)return f;var g=a[l];return f*(g=="desc"?-1:1)}}return n.index-e.index}function dt(n,e,a){e.length?e=oe(e,function(r){return Vn(r)?function(b){return gn(b,r.length===1?r[0]:r)}:r}):e=[st];var l=-1;e=oe(e,Nn(he));var d=rt(n,function(r,b,k){var f=oe(e,function(g){return g(r)});return{criteria:f,index:++l,value:r}});return ut(d,function(r,b){return mt(r,b,a)})}var pt=/^\s+/,gt=Rn.parseInt;function xt(n,e,a){return e==null?e=0:e&&(e=+e),gt(Jn(n).replace(pt,""),e||0)}var bt=Xn(function(n,e){if(n==null)return[];var a=e.length;return a>1&&ze(n,e[0],e[1])?e=[]:a>2&&ze(e[0],e[1],e[2])&&(e=[e[0]]),dt(n,tt(e),[])});const le=20,q={track:{kVAEAm:"x10l6tqk",kWkggS:"xdsb6cv",kaIpWk:"xjspbzw",$$css:!0},trackHorizontal:{kLqNvP:"x1o0tod",kt4wiu:"xtijo5x",kZKoxP:"xqu0tyb",k87sOh:"xwa60dl",k3aq6I:"x1cb1t30",$$css:!0},trackVertical:{k87sOh:"x13vifvy",krVfgx:"x1ey2m1c",kzqmXN:"x51ohtg",$$css:!0},filledTrack:{kVAEAm:"x10l6tqk",kWkggS:"x1ewilqj",kaIpWk:"xjspbzw",$$css:!0},filledTrackHorizontal:{kZKoxP:"xqu0tyb",k87sOh:"xwa60dl",k3aq6I:"x1cb1t30",$$css:!0},filledTrackVertical:{kzqmXN:"x51ohtg",$$css:!0},thumb:{kVAEAm:"x10l6tqk",kzqmXN:"xw4jnvo",kZKoxP:"x1qx5ct2",kaIpWk:"xjspbzw",kWkggS:"x1ewilqj",k3aq6I:"x11lhmoz",k1ekBW:"x106061f",kIyJzY:"xuedmi6 x12w9bfk",kAMwcw:"xlr8y92",kI3sdo:"x1a2a7pz",kkrTdU:"x1jm3nie x16khyan",kY2c9j:"x1vjfegm",$$css:!0},thumbHorizontal:{k87sOh:"xwa60dl",k3aq6I:"x11lhmoz xoffwj3",$$css:!0},thumbHover:{kWkggS:"x1ewilqj xvxo0qp",$$css:!0},thumbDisabled:{kWkggS:"xwmxj5m",kkrTdU:"xt0e3qv",$$css:!0}};function B(n,e,a){return Math.min(Math.max(n,e),a)}function Fe(n){var a;if(Math.abs(n)<1){const l=n.toExponential().split("e-");if(l.length===2)return(((a=l[0].split(".")[1])==null?void 0:a.length)??0)+parseInt(l[1],10)}const e=String(n).split(".")[1];return e?e.length:0}function ye(n,e,a){if(a<=0)return n;const l=Math.round((n-e)/a),d=e+l*a,r=Math.min(Math.max(Fe(e),Fe(a)),20);return Number(d.toFixed(r))}function H(n,e,a){return a===e?0:(n-e)/(a-e)*100}const xn=le/2;function I(n){return bn(n,xn-n/100*le)}function Ee(n,e){const a=e-n;return bn(a,-(a/100)*le)}function We(n,e){const a=e-le;return a>0?(n-xn)/a:e>0?n/e:0}function bn(n,e){const a=l=>Number(l.toFixed(3));return`calc(${a(n)}% ${e<0?"-":"+"} ${Math.abs(a(e))}px)`}function fn({ref:n,...e}){const{label:a,isLabelHidden:l=!1,description:d,isDisabled:r=!1,disabledMessage:b,isOptional:k=!1,isRequired:f=!1,status:g,labelTooltip:C,min:o=0,max:x=100,step:j=1,orientation:c="horizontal",formatValue:u,htmlName:V,valueDisplay:O="tooltip",marks:_,width:z,xstyle:ue,className:M,style:K,"data-testid":ce,value:A,onChange:D,onChangeEnd:ke}=e,S=Array.isArray(A),$=S&&"minStepsBetweenThumbs"in e?e.minStepsBetweenThumbs??0:0,T=c==="horizontal",ve=p.useId(),me=p.useId(),we=p.useId(),Me=p.useId(),Se=p.useId(),de=p.useRef(null),F=p.useRef(null),[hn,je]=p.useState(null),[kn,L]=p.useState(null);zn();const vn=p.useCallback((t,i)=>{L(!r&&Pe()==="keyboard"?t:null)},[r]),wn=p.useCallback(t=>{L(null)},[]),E=r&&!!b,pe=$n({placement:"above",focusTrigger:"always",isEnabled:E}),Te=f&&!k,N=[];d&&N.push(we),g!=null&&g.message&&N.push(Me),Te&&N.push(Se),E&&N.push(pe.describedBy);const Mn=N.length>0?N.join(" "):void 0,w=p.useMemo(()=>(Array.isArray(A)?A:[A??o]).map(i=>B(i,o,x)),[A,o,x]),Be=p.useRef(w);Be.current=w;const G=p.useCallback((t,i)=>{const m=de.current;if(!m)return o;const s=m.getBoundingClientRect();let h;T?h=We(Zn(m)?s.right-t:t-s.left,s.width):h=1-We(i-s.top,s.height),h=B(h,0,1);const v=o+h*(x-o);return B(ye(v,o,j),o,x)},[o,x,j,T]),qe=p.useCallback(t=>{if(!S)return 0;const[i,m]=w,s=Math.abs(t-i),h=Math.abs(t-m);return s<=h?0:1},[S,w]),R=p.useCallback((t,i)=>{if(r)return;const m=B(ye(i,o,j),o,x);if(S){const s=[...w];s[t]=m;const h=$*j;t===0?s[0]=Math.min(s[0],s[1]-h):s[1]=Math.max(s[1],s[0]+h),s[0]=B(s[0],o,x),s[1]=B(s[1],o,x),D==null||D(s)}else D==null||D(m)},[r,S,w,o,x,j,$,D]),Ae=p.useRef(ke);Ae.current=ke;const W=p.useCallback(t=>{const i=t??Be.current,m=Ae.current;S?m==null||m(i):m==null||m(i[0])},[S]),Sn=p.useCallback(t=>{var v;if(r)return;t.preventDefault();const i=t.target.closest("[data-mark-value]"),m=i?Number(i.dataset.markValue):G(t.clientX,t.clientY),s=qe(m);F.current=s,je(s),R(s,m);const h=de.current;h&&((v=h.querySelectorAll('[role="slider"]')[s])==null||v.focus()),L(null),typeof t.currentTarget.setPointerCapture=="function"&&t.currentTarget.setPointerCapture(t.pointerId)},[r,G,qe,R]),jn=p.useCallback(t=>{if(F.current===null||r)return;const i=G(t.clientX,t.clientY);R(F.current,i)},[r,G,R]),Ie=p.useCallback(t=>{F.current!==null&&(F.current=null,je(null),W())},[W]),Tn=p.useCallback((t,i)=>{if(r)return;i.key!=="Shift"&&!i.metaKey&&!i.altKey&&!i.ctrlKey&&Pe()==="keyboard"&&L(t);const m=w[t];let s;switch(i.key){case"ArrowRight":case"ArrowUp":s=m+j;break;case"ArrowLeft":case"ArrowDown":s=m-j;break;case"PageUp":s=m+j*10;break;case"PageDown":s=m-j*10;break;case"Home":s=o;break;case"End":s=x;break;default:return}i.preventDefault();const h=B(ye(s,o,j),o,x);if(R(t,s),S){const v=[...w];v[t]=h;const U=$*j;t===0?v[0]=Math.min(v[0],v[1]-U):v[1]=Math.max(v[1],v[0]+U),v[0]=B(v[0],o,x),v[1]=B(v[1],o,x),W(v)}else W([h])},[r,S,w,j,o,x,$,R,W]),Z=t=>u?u(t):String(t),Bn=t=>{const i=w[t],m=H(i,o,x),s=T?{insetInlineStart:I(m)}:{bottom:I(m),left:"50%"},h=S?t===0?"Minimum value":"Maximum value":void 0,v=$*j,U=S&&t===1?B(w[0]+v,o,x):o,In=S&&t===0?B(w[1]-v,o,x):x,Cn=O==="tooltip"&&!E,Dn=T?"above":"start",Ce=y.jsx("div",{id:S?void 0:ve,role:"slider",tabIndex:r&&!E?-1:0,"aria-valuemin":U,"aria-valuemax":In,"aria-valuenow":i,"aria-valuetext":u?u(i):void 0,"aria-orientation":c,"aria-disabled":r||void 0,"aria-invalid":(g==null?void 0:g.type)==="error"?!0:void 0,"aria-label":h,"aria-labelledby":S?void 0:me,"aria-describedby":Mn,onKeyDown:ge=>Tn(t,ge),onFocus:ge=>vn(t,ge),onBlur:wn,...P(Y("slider-thumb",{orientation:c,disabled:r?"disabled":null}),xe(q.thumb,T?q.thumbHorizontal:fe.centerInline("50%"),!r&&q.thumbHover,!r&&kn===t&&Wn.focusVisible,r&&q.thumbDisabled),void 0,s)},t);return Cn?y.jsx(Un,{content:Z(i),placement:Dn,delay:0,focusTrigger:"always",isOpen:hn===t?!0:void 0,children:Ce},t):Ce},qn=(()=>{if(S){const[i,m]=w,s=H(i,o,x),h=H(m,o,x);return T?{insetInlineStart:I(s),width:Ee(s,h)}:{bottom:I(s),height:Ee(s,h)}}const t=H(w[0],o,x);return T?{insetInlineStart:"0%",width:I(t)}:{bottom:"0%",height:I(t)}})(),An=O==="text"?y.jsx("span",{className:"x9ynric xcr08ib x1tgivj0 xuxw1ft x2lah0s",children:S?`${Z(w[0])} – ${Z(w[1])}`:Z(w[0])}):null;return y.jsxs(Gn,{"data-testid":ce,label:a,isLabelHidden:l,description:d,inputID:ve,labelID:me,isGroupLabel:!0,descriptionID:d?we:void 0,isOptional:k,isRequired:f,isDisabled:r,status:g?{type:g.type,message:g.message,messageID:g.message?Me:void 0}:void 0,labelTooltip:C,statusVariant:"detached",width:z,xstyle:ue,className:M,style:K,children:[y.jsxs("div",{...P(Y("slider",{orientation:c,disabled:r?"disabled":null}),{className:"x78zum5 x6s0dn4 x1txdalj"}),children:[V!=null&&w.map((t,i)=>y.jsx("input",{type:"hidden",name:V,value:String(t),disabled:r},i===0?"start":"end")),y.jsxs("div",{ref:Fn(n,de,pe.ref),...S?{role:"group","aria-labelledby":me}:void 0,onPointerDown:Sn,onPointerMove:jn,onPointerUp:Ie,onPointerCancel:Ie,...P(Y("slider-control",{orientation:c,disabled:r?"disabled":null}),{0:{className:"x1n2onr6 x78zum5 x6s0dn4 x1iyjqo2 x5ve5x3 x87ps6o xc8icb0 xw4jnvo x1ymw6g xkagaj0 xdt5ytf xl56j7k x1ypdohk x16khyan"},2:{className:"x1n2onr6 x78zum5 x6s0dn4 x1iyjqo2 x5ve5x3 x87ps6o xc8icb0 x1qx5ct2 x80b3aj xh8yej3 x1ypdohk x16khyan"},1:{className:"x1n2onr6 x78zum5 x6s0dn4 x1iyjqo2 x5ve5x3 x87ps6o xc8icb0 xw4jnvo x1ymw6g xkagaj0 xdt5ytf xl56j7k xbyyjgo xt0e3qv"},3:{className:"x1n2onr6 x78zum5 x6s0dn4 x1iyjqo2 x5ve5x3 x87ps6o xc8icb0 x1qx5ct2 x80b3aj xh8yej3 xbyyjgo xt0e3qv"}}[!!T<<1|!!r<<0]),children:[y.jsx("div",{"aria-hidden":"true",...P(Y("slider-track",{orientation:c}),xe(q.track,T?q.trackHorizontal:[q.trackVertical,fe.centerInline("0px")]))}),y.jsx("div",{"aria-hidden":"true",...P(xe(q.filledTrack,T?q.filledTrackHorizontal:[q.filledTrackVertical,fe.centerInline("0px")]),{style:qn})}),_&&y.jsx("div",{"aria-hidden":"true",...{0:{className:"x10l6tqk x13vifvy x1ey2m1c xbudbmw"},1:{className:"x10l6tqk x1o0tod xtijo5x xwa60dl"}}[!!T<<0],children:_.map(t=>{const i=H(t.value,o,x),m=T?{insetInlineStart:I(i)}:{bottom:I(i)};return y.jsxs("div",{children:[y.jsx("div",{"data-testid":"slider-mark","data-mark-value":t.value,...P({0:{className:"x10l6tqk x7njt3n xjspbzw x36qwtl x1xc55vz x1m9mm8y"},1:{className:"x10l6tqk x7njt3n xjspbzw xfo62xy xdk7pt x11lhmoz xoffwj3"}}[!!T<<0],{style:m})}),t.label&&y.jsx("span",{"data-testid":"slider-mark-label","data-mark-value":t.value,...P({0:{className:"x10l6tqk x9ynric x141an7d xv1l7n4 xuxw1ft x131p8rn x9p6ekw"},1:{className:"x10l6tqk x9ynric x141an7d xv1l7n4 xuxw1ft xuuh30 x1nyx83j xuivejd"}}[!!T<<0],{style:m}),children:t.label})]},t.value)})}),w.map((t,i)=>Bn(i))]}),An]}),Te&&y.jsx(En,{id:Se,children:"Required"}),E&&pe.renderTooltip(b)]})}fn.displayName="Slider";const ft=n=>bt(at(n,(e,a)=>{const l=e&&typeof e=="object"&&"label"in e?e.label:e,d=On(l??null);return{value:Number(a),label:d===""?void 0:d}}),"value"),yn=({min:n="0m",max:e="32g",warn:a,units:l=["m","g"],extraMarks:d,hideSlider:r,step:b=.05,addonPrefix:k,addonSuffix:f,defaultUnit:g,...C})=>{const[o,x]=_n(C,{defaultValue:void 0}),{t:j}=Hn(),c=p.useMemo(()=>be(n,"g",2),[n]),u=p.useMemo(()=>be(e,"g",2),[e]),V=p.useMemo(()=>be(o||"0g","g",2),[o]),[O,_]=Kn("first");p.useEffect(()=>{const M=setTimeout(()=>{_(o==null?void 0:o.toString())},0);return()=>clearTimeout(M)},[]);const z=J(c==null?void 0:c.number)&&J(u==null?void 0:u.number)&&(c==null?void 0:c.number)>(u==null?void 0:u.number),ue=M=>ft($e({...M},(K,ce)=>{const A=parseFloat(ce);return c&&u&&((c==null?void 0:c.number)>A||(u==null?void 0:u.number)<A)}));return y.jsxs(X,{direction:"row",gap:"md",children:[y.jsx(X,{style:{flex:2,minWidth:190},direction:"column",align:"stretch",children:p.createElement(Ln,{...C,key:O,min:n,max:e,units:l,defaultUnit:g,value:o,onChange:M=>{x(M)},style:{width:"100%"},roundStep:b,addonPrefix:k,addonSuffix:f})}),y.jsx(X,{direction:"column",align:"stretch",style:{flex:3,...r&&{visibility:"hidden",height:0}},children:y.jsx(X,{direction:"column",align:"stretch",children:y.jsx(fn,{label:j("comp:BAIDynamicUnitInputNumberWithSlider.Amount"),isLabelHidden:!0,width:"100%",max:u==null?void 0:u.number,step:b,value:z?0:(V==null?void 0:V.number)??0,isDisabled:z,valueDisplay:z?"none":"tooltip",formatValue:(M=0)=>M<1?`${(M*1024).toFixed(2)} MiB`:`${M.toFixed(2)} GiB`,onChange:M=>{c!=null&&c.number&&c.number>M?x(n):x(M<1?`${M*1024}m`:`${M}g`)},marks:ue({...c&&J(c==null?void 0:c.number)&&{[c.number]:{label:c.number===0?c.number:c.number>=1?c.number+"g":c.number*1024+"m"}},...$e(d,(M,K)=>J(u==null?void 0:u.number)?xt(K)>(u==null?void 0:u.number):!1),...(u==null?void 0:u.number)&&{[u.number]:{label:u.number===0?u.number:u.number>=1?Ne(u.number,2)+"g":Ne(u.number*1024,2)+"m"}}})})})})]})},br={title:"Input/BAIDynamicUnitInputNumberWithSlider",component:yn,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:"\n**BAIDynamicUnitInputNumberWithSlider** extends [BAIDynamicUnitInputNumber](/?path=/docs/input-dynamicunitinputnumber) with an integrated slider control.\n\n## Features\n- Synchronized input number and slider controls\n- Automatic unit conversion (MiB, GiB, TiB, PiB)\n- Visual feedback with slider marks at min/max values\n- Warning state with color-coded slider track\n- Custom marks for important values (e.g., resource quotas)\n- Handles invalid states (min > max) gracefully by disabling slider\n- Supports hiding slider while maintaining input functionality\n\n## Props\n| Name | Type | Default | Description |\n|------|------|---------|-------------|\n| `min` | `string` | `'0m'` | Minimum value with unit (e.g., '100m', '2g') |\n| `max` | `string` | `'32g'` | Maximum value with unit |\n| `value` | `string \\| null \\| undefined` | `'0g'` | Current value with unit |\n| `units` | `string[]` | `['m', 'g']` | Allowed units (m=MiB, g=GiB, t=TiB, p=PiB) |\n| `step` | `number` | `0.05` | Slider step size in GiB |\n| `roundStep` | `number` | - | Round input value to nearest step |\n| `warn` | `string` | - | Warning threshold value (changes slider color) |\n| `extraMarks` | `SliderMarks` | - | Additional marks on slider |\n| `hideSlider` | `boolean` | `false` | Hide slider (keeps input only) |\n| `addonPrefix` | `ReactNode` | - | Content before input |\n| `addonSuffix` | `ReactNode` | - | Content after input |\n| `onChange` | `(value: string) => void` | - | Callback when value changes |\n\nFor all other props, refer to [Ant Design InputNumber](https://ant.design/components/input-number).\n\n## Unit Abbreviations\n- `m` - MiB (Mebibyte)\n- `g` - GiB (Gibibyte)\n- `t` - TiB (Tebibyte)\n- `p` - PiB (Pebibyte)\n        "}}},argTypes:{min:{control:!1,description:'Minimum value with unit (e.g., "100m", "2g"). Requires format: number + unit (m/g/t/p)',table:{type:{summary:"string"},defaultValue:{summary:"0m"}}},max:{control:!1,description:"Maximum value with unit. Requires format: number + unit (m/g/t/p)",table:{type:{summary:"string"},defaultValue:{summary:"32g"}}},value:{control:!1,description:"Current value with unit (controlled). Requires format: number + unit (m/g/t/p)",table:{type:{summary:"string | null | undefined"},defaultValue:{summary:"0g"}}},units:{control:{type:"object"},description:"Allowed units array (m=MiB, g=GiB, t=TiB, p=PiB)",table:{type:{summary:"string[]"},defaultValue:{summary:"['m', 'g']"}}},step:{control:{type:"number"},description:"Slider step size in GiB",table:{type:{summary:"number"},defaultValue:{summary:"0.05"}}},roundStep:{control:{type:"number"},description:"Round input value to nearest step",table:{type:{summary:"number"}}},warn:{control:!1,description:"Warning threshold value with unit. Slider track turns warning color when value exceeds this. Requires format: number + unit (m/g/t/p)",table:{type:{summary:"string"}}},extraMarks:{control:!1,description:"Additional slider marks (SliderMarks object mapping number positions to mark configs)",table:{type:{summary:"SliderMarks"}}},hideSlider:{control:{type:"boolean"},description:"Hide slider component (keeps input only)",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},addonPrefix:{control:!1,description:"Content to display before the input",table:{type:{summary:"ReactNode"}}},addonSuffix:{control:!1,description:"Content to display after the input",table:{type:{summary:"ReactNode"}}},onChange:{action:"changed",description:"Callback fired when value changes",table:{type:{summary:"(value: string) => void"}}},disabled:{control:{type:"boolean"},description:"Disable both input and slider",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},size:{control:{type:"select"},options:["small","middle","large"],description:"Input size",table:{type:{summary:"'small' | 'middle' | 'large'"}}}}},yt=({value:n,...e})=>y.jsx(Ve,{initialValues:{mem:n},children:y.jsx(Ve.Item,{name:"mem",children:y.jsx(yn,{...e})})}),Q={name:"Basic",parameters:{docs:{description:{story:"Basic uncontrolled usage with default settings (0m to 32g range)."}}}},ee={name:"FormIntegration",parameters:{docs:{description:{story:"Controlled by Ant Design Form.Item. The component syncs with form state automatically."}}},render:yt,args:{value:"1.3g"}},ne={name:"MinMaxRange",parameters:{docs:{description:{story:"Custom min/max range. Slider shows marks at min and max positions."}}},args:{min:"100m",max:"45g"}},te={name:"MiBGiBUnits",parameters:{docs:{description:{story:"Restrict units to MiB and GiB only. User can switch between these two units."}}},args:{min:"2g",max:"45g",units:["m","g"]}},re={name:"GiBOnly",parameters:{docs:{description:{story:"Restrict to GiB unit only. Useful when fractional GiB values are needed."}}},args:{min:"0.5g",max:"45g",units:["g"]}},ae={name:"InvalidRange",parameters:{docs:{description:{story:"Edge case handling when min > max. Slider is disabled and marks are hidden to prevent confusion."}}},args:{min:"3g",max:"1g",units:["m","g"]}},se={name:"CustomMarks",parameters:{docs:{description:{story:"Add custom marks to highlight important values (e.g., recommended settings, quotas)."}}},args:{min:"0g",max:"1g",units:["m","g"],extraMarks:{.5:{style:{color:"red"},label:"0.5g"}}}},ie={name:"CustomMarksInvalidRange",parameters:{docs:{description:{story:"Custom marks are filtered out when min > max to maintain consistent invalid state."}}},args:{min:"3g",max:"1g",units:["m","g"],extraMarks:{.5:{style:{color:"red"},label:"0.5g"}}}};var Ue,He,Oe;Q.parameters={...Q.parameters,docs:{...(Ue=Q.parameters)==null?void 0:Ue.docs,source:{originalSource:`{
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'Basic uncontrolled usage with default settings (0m to 32g range).'
      }
    }
  }
}`,...(Oe=(He=Q.parameters)==null?void 0:He.docs)==null?void 0:Oe.source}}};var _e,Ke,Le;ee.parameters={...ee.parameters,docs:{...(_e=ee.parameters)==null?void 0:_e.docs,source:{originalSource:`{
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
}`,...(Le=(Ke=ee.parameters)==null?void 0:Ke.docs)==null?void 0:Le.source}}};var Ge,Ze,Ye;ne.parameters={...ne.parameters,docs:{...(Ge=ne.parameters)==null?void 0:Ge.docs,source:{originalSource:`{
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
}`,...(Ye=(Ze=ne.parameters)==null?void 0:Ze.docs)==null?void 0:Ye.source}}};var Xe,Je,Qe;te.parameters={...te.parameters,docs:{...(Xe=te.parameters)==null?void 0:Xe.docs,source:{originalSource:`{
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
}`,...(Qe=(Je=te.parameters)==null?void 0:Je.docs)==null?void 0:Qe.source}}};var en,nn,tn;re.parameters={...re.parameters,docs:{...(en=re.parameters)==null?void 0:en.docs,source:{originalSource:`{
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
}`,...(tn=(nn=re.parameters)==null?void 0:nn.docs)==null?void 0:tn.source}}};var rn,an,sn;ae.parameters={...ae.parameters,docs:{...(rn=ae.parameters)==null?void 0:rn.docs,source:{originalSource:`{
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
}`,...(sn=(an=ae.parameters)==null?void 0:an.docs)==null?void 0:sn.source}}};var on,ln,un;se.parameters={...se.parameters,docs:{...(on=se.parameters)==null?void 0:on.docs,source:{originalSource:`{
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
}`,...(un=(ln=se.parameters)==null?void 0:ln.docs)==null?void 0:un.source}}};var cn,mn,dn;ie.parameters={...ie.parameters,docs:{...(cn=ie.parameters)==null?void 0:cn.docs,source:{originalSource:`{
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
}`,...(dn=(mn=ie.parameters)==null?void 0:mn.docs)==null?void 0:dn.source}}};const fr=["Default","WithFormItem","WithMin","AllowOnlyMiBandGiB","AllowOnlyGiB","GreaterMinThanMax","ExtraMarks","ExtraMarksWithGreaterMinThanMax"];export{re as AllowOnlyGiB,te as AllowOnlyMiBandGiB,Q as Default,se as ExtraMarks,ie as ExtraMarksWithGreaterMinThanMax,ae as GreaterMinThanMax,ee as WithFormItem,ne as WithMin,fr as __namedExportsOrder,br as default};
