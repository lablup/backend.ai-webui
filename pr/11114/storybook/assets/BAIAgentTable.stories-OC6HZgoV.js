import{a as e,n as t}from"./rolldown-runtime-sJBDdmOt.js";import{t as n}from"./react-DlPsW1c0.js";import{n as r,t as i}from"./toString-DisgP18h.js";import{i as a,n as o,r as s,t as c}from"./toFinite-h-2-9ZQn.js";import{n as l,t as u}from"./toInteger-CZy_sk2Z.js";import{_ as d,v as f}from"./_Uint8Array-BSgh8wEY.js";import{O as p,k as m,t as h}from"./hooks-CWfVxhQL.js";import{n as g,t as _}from"./forEach-Cs0R4zzP.js";import{n as v,t as y}from"./map-BLzs52H1.js";import{n as b,t as x}from"./includes-9bFBXpF0.js";import{n as S,t as ee}from"./isEmpty-CptDxjc2.js";import{n as C,t as te}from"./split-IuWp6td7.js";import{a as w,i as T,n as E,o as ne,r as D,s as re}from"./BAIResourceNumberWithIcon-DfDqDl_U.js";import{t as O}from"./jsx-runtime-MKhVqBIO.js";import{n as k,t as A}from"./useBAIi18n-COw7wKuj.js";import{t as ie}from"./dayjs.min-BHb7hAap.js";import{t as ae}from"./compiler-runtime-DU4U6aph.js";import{n as oe,t as se}from"./circle-check-CJK0NgR9.js";import{n as ce,t as le}from"./circle-minus-Ca6OtsWu.js";import{n as ue,r as de}from"./useTheme-CojPMc66.js";import{n as fe,t as j}from"./Text-DTxx1K0Q.js";import{n as pe}from"./useBAILogger-Bj-uPJ4G.js";import{h as me,m as M,o as he,s as ge}from"./iframe-BmdVNi7l.js";import{n as _e,t as N}from"./BAIFlex-DnaoYTJ1.js";import{n as ve,t as ye}from"./BAIAlertIconWithTooltip-Bzj8LT3g.js";import{t as be}from"./react-relay-sHama7hJ.js";import{t as xe}from"./astryxTagVariant-G-qTOScM.js";import{c as Se,i as Ce,n as P,p as F,r as we}from"./helper-p-d7z67I.js";import{n as Te,t as Ee}from"./Badge-2eS4kwWB.js";import{n as De,t as Oe}from"./BAIButton-9khESRLy.js";import{n as ke,t as Ae}from"./Token-ClRafBlU.js";import{n as je,t as Me}from"./BAIDoubleBadge-IZ8Mjr50.js";import{n as Ne,t as Pe}from"./BAIDoubleToken-BlTRsVf4.js";import{n as Fe,t as Ie}from"./BAILink-CQkBxV6X.js";import{n as Le,t as Re}from"./BAIIntervalView-CjJgOPo5.js";import{n as ze,t as I}from"./BAIProgressWithLabel-s2_xUFa3.js";import{n as Be,t as Ve}from"./BAITable-DXTb4gUN.js";import{n as He,o as Ue,r as We,t as Ge}from"./storybook-mock-utils-BqLAdkd_.js";import{n as Ke,t as L}from"./RelayResolver-BnFyFQJn.js";function qe(e=[],t=[]){return e.length!==t.length||e.some((e,n)=>!Object.is(e,t[n]))}var R,Je,Ye,Xe;function Ze(){return(Ze=t((()=>{R=n(),Je=(0,R.createContext)(null),Ye={didCatch:!1,error:null},Xe=class extends R.Component{constructor(e){super(e),this.resetErrorBoundary=this.resetErrorBoundary.bind(this),this.state=Ye}static getDerivedStateFromError(e){return{didCatch:!0,error:e}}resetErrorBoundary(...e){var t,n;let{error:r}=this.state;r!==null&&((t=(n=this.props).onReset)==null||t.call(n,{args:e,reason:`imperative-api`}),this.setState(Ye))}componentDidCatch(e,t){var n,r;(n=(r=this.props).onError)==null||n.call(r,e,t)}componentDidUpdate(e,t){var n,r;let{didCatch:i}=this.state,{resetKeys:a}=this.props;i&&t.error!==null&&qe(e.resetKeys,a)&&((n=(r=this.props).onReset)==null||n.call(r,{next:a,prev:e.resetKeys,reason:`keys`}),this.setState(Ye))}render(){let{children:e,fallbackRender:t,FallbackComponent:n,fallback:r}=this.props,{didCatch:i,error:a}=this.state,o=e;if(i){let e={error:a,resetErrorBoundary:this.resetErrorBoundary};if(typeof t==`function`)o=t(e);else if(n)o=(0,R.createElement)(n,e);else if(r!==void 0)o=r;else throw a}return(0,R.createElement)(Je.Provider,{value:{didCatch:i,error:a,resetErrorBoundary:this.resetErrorBoundary}},o)}}})))()}var Qe;function $e(){return($e=t((()=>{Qe={argumentDefinitions:[],kind:`Fragment`,metadata:{plural:!0},name:`BAIAgentTableFragment`,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`row_id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`addr`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`region`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`architecture`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`first_contact`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`occupied_slots`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`available_slots`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`live_stat`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`status`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`scaling_group`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`compute_plugins`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`version`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`schedulable`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`lost_at`,storageKey:null}],type:`AgentNode`,abstractKey:null},Qe.hash=`73cb32c95a2360f7165430aa991c1b7d`})))()}function et(e){return(0,B.jsx)(j,{children:e?(0,at.default)(e).format(`ll LTS`):`-`})}function tt(e,t){return(0,B.jsx)(H,{resetKeys:[t==null?void 0:t.occupied_slots,t==null?void 0:t.available_slots],children:(0,B.jsx)(ct,{record:t})})}function nt(e,t){return(0,B.jsx)(H,{resetKeys:[t==null?void 0:t.live_stat],children:(0,B.jsx)(ut,{record:t})})}function rt(e,t){return(0,B.jsx)(H,{resetKeys:[e,t==null?void 0:t.compute_plugins,t==null?void 0:t.available_slots],children:(0,B.jsx)(dt,{value:e,record:t})})}function it(e){return e.id}var z,at,ot,B,st,V,H,ct,lt,ut,dt,ft;function pt(){return(pt=t((()=>{$e(),z=ae(),Se(),h(),A(),ve(),je(),Ne(),_e(),Le(),Fe(),ze(),D(),me(),Be(),T(),p(),Te(),fe(),ke(),ue(),at=e(ie(),1),b(),y(),c(),s(),d(),u(),g(),i(),te(),ee(),oe(),ce(),Ze(),ot=be(),B=O(),st=[`id`,`first_contact`,`scaling_group`,`status`,`schedulable`,`region`,`version`,`lost_at`],[...st,...st.map(e=>`-${e}`)],V=e=>x(st,e),H=e=>{"use memo";let t=(0,z.c)(12),n,r;t[0]===e?(n=t[1],r=t[2]):({children:n,...r}=e,t[0]=e,t[1]=n,t[2]=r);let{t:i}=k(),{logger:a}=pe(),o;t[3]===a?o=t[4]:(o=(e,t)=>a.error(`[BAIAgentTable] Cell render failed:`,e,t.componentStack),t[3]=a,t[4]=o);let s;t[5]===i?s=t[6]:(s=()=>(0,B.jsx)(ye,{type:`error`,title:i(`comp:AgentTable.FailedToLoadCellData`)}),t[5]=i,t[6]=s);let c;return t[7]!==n||t[8]!==r||t[9]!==o||t[10]!==s?(c=(0,B.jsx)(Xe,{onError:o,fallbackRender:s,...r,children:n}),t[7]=n,t[8]=r,t[9]=o,t[10]=s,t[11]=c):c=t[11],c},ct=e=>{"use memo";let t=(0,z.c)(13),{record:n}=e,{token:r}=de(),{mergedResourceSlots:i}=w(),s,c,l,u;if(t[0]!==i||t[1]!==(n==null?void 0:n.available_slots)||t[2]!==(n==null?void 0:n.occupied_slots)||t[3]!==r){let e=JSON.parse((n==null?void 0:n.occupied_slots)||`{}`),d=JSON.parse((n==null?void 0:n.available_slots)||`{}`);s=N,c=`column`,l=`xxs`,u=v(d,(t,n)=>{if(n===`cpu`){var s;let t=o(a(e.cpu)/a(d.cpu)*100);return(0,B.jsxs)(N,{justify:`between`,style:{width:`100%`},gap:`xs`,children:[(0,B.jsxs)(N,{gap:`xxs`,children:[(0,B.jsx)(E,{type:n},n),(0,B.jsxs)(j,{children:[F(e.cpu||0,0),`\xA0/\xA0`,F(d.cpu||0,0)]}),(0,B.jsx)(j,{color:`secondary`,style:{fontSize:r(`--spacing-2`)},children:(s=i.cpu)==null?void 0:s.display_unit})]}),(0,B.jsx)(I,{percent:t,strokeColor:r(t>80?`--color-error`:`--color-success`),width:120,valueLabel:F(t,1)+` %`})]},n)}if(n===`mem`){var c,l;let t=o(a(e.mem)/a(d.mem)*100);return(0,B.jsxs)(N,{justify:`between`,style:{width:`100%`},gap:`xs`,children:[(0,B.jsxs)(N,{gap:`xxs`,children:[(0,B.jsx)(E,{type:`mem`}),(0,B.jsxs)(j,{children:[((c=P(e.mem,`g`,0))==null?void 0:c.numberFixed)??0,`\xA0/\xA0`,((l=P(d.mem,`g`,0))==null?void 0:l.numberFixed)??0]}),(0,B.jsx)(j,{color:`secondary`,style:{fontSize:r(`--spacing-2`)},children:`GiB`})]}),(0,B.jsx)(I,{percent:t,strokeColor:r(t>80?`--color-error`:`--color-success`),width:120,valueLabel:F(t,1)+` %`})]},`mem`)}if(d[n]){var u;let t=o(a(e[n])/a(d[n])*100);return(0,B.jsxs)(N,{justify:`between`,gap:`xs`,style:{width:`100%`},children:[(0,B.jsxs)(N,{gap:`xxs`,children:[(0,B.jsx)(E,{type:n},n),(0,B.jsxs)(j,{children:[F(e[n]||0,2),`\xA0/\xA0`,F(d[n],2)]}),(0,B.jsx)(j,{color:`secondary`,style:{fontSize:r(`--spacing-2`)},children:(u=i[n])==null?void 0:u.display_unit})]}),(0,B.jsx)(I,{percent:t,strokeColor:r(t>80?`--color-error`:`--color-success`),width:120,valueLabel:F(t,1)+` %`})]},n)}}),t[0]=i,t[1]=n==null?void 0:n.available_slots,t[2]=n==null?void 0:n.occupied_slots,t[3]=r,t[4]=s,t[5]=c,t[6]=l,t[7]=u}else s=t[4],c=t[5],l=t[6],u=t[7];let d;return t[8]!==s||t[9]!==c||t[10]!==l||t[11]!==u?(d=(0,B.jsx)(s,{direction:c,gap:l,children:u}),t[8]=s,t[9]=c,t[10]=l,t[11]=u,t[12]=d):d=t[12],d},lt=e=>{"use memo";let t=(0,z.c)(29),{value:n,record:i,hiddenLiveStatKeys:a}=e,{t:s}=k(),{mergedResourceSlots:c}=w(),u;if(t[0]!==a||t[1]!==c||t[2]!==(i==null?void 0:i.available_slots)||t[3]!==(i==null?void 0:i.status)||t[4]!==s||t[5]!==n){u=Symbol.for(`react.early_return_sentinel`);bb0:{let e=JSON.parse(n||`{}`),y=JSON.parse((i==null?void 0:i.available_slots)||`{}`);if((i==null?void 0:i.status)===`ALIVE`){var d,p,m,h,g;let n={cpu_util:{capacity:0,current:0,ratio:0},mem_util:{capacity:0,current:0,ratio:0}};if(e&&e.node&&e.devices){let t=f(e.devices.cpu_util).length;n.cpu_util.capacity=o(e.node.cpu_util.capacity),n.cpu_util.current=o(e.node.cpu_util.current),n.cpu_util.ratio=Math.min(o(e.node.cpu_util.pct)/100/(t||1),1),n.mem_util.capacity=l(y.mem||e.node.mem.capacity),n.mem_util.current=l(e.node.mem.current),n.mem_util.ratio=n.mem_util.current/n.mem_util.capacity||0}_(f(e==null?void 0:e.node),t=>{[`cpu_util`,`mem`,`disk`,`net_rx`,`net_tx`].includes(t)||(x(t,`_util`)?n[t]={capacity:o(e.node[t].capacity)||100,current:o(e.node[t].current),ratio:o(e.node[t].current)/100||0}:t.includes(`_mem`)&&(n[t]={capacity:o(e.node[t].capacity),current:o(e.node[t].current),ratio:o(e.node[t].pct)/100||0}))});let i=((d=Ce(r(n.mem_util.capacity),`auto`))==null?void 0:d.unit)||`g`,s;t[7]===Symbol.for(`react.memo_cache_sentinel`)?(s={minWidth:200,width:`100%`},t[7]=s):s=t[7];let b=(p=c.cpu)==null?void 0:p.human_readable_name,S;t[8]===b?S=t[9]:(S=(0,B.jsx)(j,{children:b}),t[8]=b,t[9]=S);let ee=n.cpu_util.ratio*100,te=F(o(n.cpu_util.ratio*100),1)+` %`,w;t[10]!==ee||t[11]!==te?(w=(0,B.jsx)(I,{percent:ee,width:120,valueLabel:te}),t[10]=ee,t[11]=te,t[12]=w):w=t[12];let T;t[13]!==S||t[14]!==w?(T=(0,B.jsxs)(N,{justify:`between`,style:s,"data-testid":`live-stat-cpu`,children:[S,w]}),t[13]=S,t[14]=w,t[15]=T):T=t[15];let E;t[16]===Symbol.for(`react.memo_cache_sentinel`)?(E={minWidth:200,width:`100%`},t[16]=E):E=t[16];let ne=(m=c.mem)==null?void 0:m.human_readable_name,D;t[17]===ne?D=t[18]:(D=(0,B.jsx)(j,{children:ne}),t[17]=ne,t[18]=D);let re=n.mem_util.ratio*100,O=((h=P(r(n.mem_util.current),i))==null?void 0:h.numberFixed)+` / `+((g=P(r(n.mem_util.capacity),i))==null?void 0:g.displayValue),k;t[19]!==re||t[20]!==O?(k=(0,B.jsx)(I,{percent:re,width:120,valueLabel:O}),t[19]=re,t[20]=O,t[21]=k):k=t[21];let A;t[22]!==D||t[23]!==k?(A=(0,B.jsxs)(N,{justify:`between`,style:E,"data-testid":`live-stat-mem`,children:[D,k]}),t[22]=D,t[23]=k,t[24]=A):A=t[24],u=(0,B.jsxs)(N,{direction:`column`,gap:`xxs`,children:[T,A,v(f(e==null?void 0:e.node),t=>{var i,s;if(![`cpu_util`,`mem`,`disk`].includes(t)){if(x(t,`_util`)){var l;let e=C(t,`_`)[0]+`.device`;return(0,B.jsxs)(N,{justify:`between`,style:{minWidth:200,width:`100%`},gap:`xxs`,"data-testid":`live-stat-${t}`,children:[(0,B.jsxs)(j,{children:[(l=c[e])==null?void 0:l.human_readable_name,`(util)`]}),(0,B.jsx)(I,{width:120,percent:n[t].current/n[t].capacity*100||0,valueLabel:o(F(n[t].ratio*100,1))+` %`})]},t)}if(x(t,`_mem`)){var u,d,f,p;let e=C(t,`_`)[0]+`.device`,i=((u=Ce(r(n[t].capacity),`auto`))==null?void 0:u.unit)||`g`;return(0,B.jsxs)(N,{justify:`between`,style:{minWidth:200,width:`100%`},gap:`xxs`,"data-testid":`live-stat-${t}`,children:[(0,B.jsxs)(j,{children:[(d=c[e])==null?void 0:d.human_readable_name,`(mem)`]}),(0,B.jsx)(I,{width:120,percent:n[t].current/n[t].capacity*100||0,valueLabel:((f=P(r(n[t].current),i))==null?void 0:f.numberFixed)+` / `+((p=P(r(n[t].capacity),i))==null?void 0:p.displayValue)})]},t)}if(x(t,`_power`)){var m,h;let n=C(t,`_`).slice(0,-1).join(`-`)+`.device`,r=(m=c[n])==null?void 0:m.human_readable_name;return(0,B.jsxs)(N,{justify:`between`,style:{minWidth:200,width:`100%`},gap:`xxs`,"data-testid":`live-stat-${t}`,children:[(0,B.jsx)(M,{children:`${r}(power)`}),(0,B.jsx)(M,{children:`${F((h=e.node[t])==null?void 0:h.current,2)} ${e.node[t].unit_hint}`})]},t)}if(x(t,`_temperature`)){var g,_;let n=C(t,`_`).slice(0,-1).join(`_`)+`.device`,r=(g=c[n])==null?void 0:g.human_readable_name;return(0,B.jsxs)(N,{justify:`between`,style:{minWidth:200,width:`100%`},gap:`xxs`,"data-testid":`live-stat-${t}`,children:[(0,B.jsx)(M,{children:`${r}(temp)`}),(0,B.jsx)(M,{children:`${F((_=e.node[t])==null?void 0:_.current,2)} °C`})]},t)}if(x(a,t))return null;if(x([`net_rx`,`net_tx`],t)){var v;let n=we((v=e.node[t])==null?void 0:v.current,`auto`);return(0,B.jsxs)(N,{justify:`between`,style:{minWidth:200,width:`100%`},gap:`xxs`,"data-testid":`live-stat-${t}`,children:[(0,B.jsx)(M,{children:t===`net_rx`?`Net Rx`:`Net Tx`}),(0,B.jsx)(M,{children:`${(n==null?void 0:n.numberFixed)??0} ${(n==null?void 0:n.unit.toUpperCase())??``}bps`})]},t)}return(0,B.jsxs)(N,{justify:`between`,style:{minWidth:200,width:`100%`},gap:`xxs`,"data-testid":`live-stat-${t}`,children:[(0,B.jsx)(M,{children:t}),(0,B.jsx)(M,{children:`${F(((i=e.node[t])==null?void 0:i.current)??0,2)}${(s=e.node[t])!=null&&s.unit_hint?` ${e.node[t].unit_hint}`:``}`})]},t)}})]});break bb0}{let e;t[25]===s?e=t[26]:(e=s(`comp:AgentTable.NoAvailableLiveStat`),t[25]=s,t[26]=e);let n;t[27]===e?n=t[28]:(n=(0,B.jsx)(B.Fragment,{children:e}),t[27]=e,t[28]=n),u=n;break bb0}}t[0]=a,t[1]=c,t[2]=i==null?void 0:i.available_slots,t[3]=i==null?void 0:i.status,t[4]=s,t[5]=n,t[6]=u}else u=t[6];if(u!==Symbol.for(`react.early_return_sentinel`))return u},ut=e=>{"use memo";let t=(0,z.c)(3),{record:n}=e,{token:r}=de(),i;if(t[0]!==(n==null?void 0:n.live_stat)||t[1]!==r){var a,s,c,l;let e=((a=JSON.parse((n==null?void 0:n.live_stat)||`{}`))==null||(a=a.node)==null?void 0:a.disk)??{},u=o(e.pct)||0,d=o(F(u,2)),f=r(d>80?`--color-error`:`--color-success`),p=((s=Ce(e==null?void 0:e.capacity,`auto`,{base:1e3}))==null?void 0:s.unit)||`g`;i=(0,B.jsxs)(N,{direction:`column`,align:`end`,children:[(0,B.jsx)(I,{valueLabel:F(d,1)+` %`,percent:d,strokeColor:f,width:120}),!S(e)&&(0,B.jsxs)(j,{style:{fontSize:r(`--font-size-sm`)},children:[(c=we(e==null?void 0:e.current,p))==null?void 0:c.numberFixed,`\xA0/\xA0`,(l=we(e==null?void 0:e.capacity,p))==null?void 0:l.displayValue]})]}),t[0]=n==null?void 0:n.live_stat,t[1]=r,t[2]=i}else i=t[2];return i},dt=e=>{"use memo";let t=(0,z.c)(15),{value:n,record:r}=e,i;t[0]===(r==null?void 0:r.compute_plugins)?i=t[1]:(i=JSON.parse((r==null?void 0:r.compute_plugins)||`{}`),t[0]=r==null?void 0:r.compute_plugins,t[1]=i);let a=i,o;if(t[2]!==(a==null?void 0:a.cuda)||t[3]!==(r==null?void 0:r.available_slots)||t[4]!==(r==null?void 0:r.version)||t[5]!==n){var s,c,l;let e=JSON.parse((r==null?void 0:r.available_slots)||`{}`),i;t[7]===Symbol.for(`react.memo_cache_sentinel`)?(i={label:`Agent`},t[7]=i):i=t[7];let u=(r==null?void 0:r.version)||``,d;t[8]===n?d=t[9]:(d=xe(`agent`,n),t[8]=n,t[9]=d);let p;t[10]!==u||t[11]!==d?(p=(0,B.jsx)(Me,{values:[i,{label:u,variant:d}]}),t[10]=u,t[11]=d,t[12]=p):p=t[12];let m;t[13]===n?m=t[14]:(m=n&&n!==`ALIVE`?(0,B.jsx)(Ee,{variant:xe(`agent`,n),label:n}):null,t[13]=n,t[14]=m),o=(0,B.jsxs)(N,{direction:`column`,gap:`xxs`,align:`start`,children:[p,m,a!=null&&a.cuda?(0,B.jsxs)(B.Fragment,{children:[a!=null&&(s=a.cuda)!=null&&s.cuda_version?(0,B.jsx)(Pe,{values:[{label:`CUDA`},{label:a==null||(c=a.cuda)==null?void 0:c.cuda_version,color:`green`}]}):(0,B.jsx)(Ae,{color:`green`,label:`CUDA Disabled`}),(0,B.jsx)(Pe,{values:[{label:`CUDA Plugin`},{label:a==null||(l=a.cuda)==null?void 0:l.version,color:`blue`}]}),x(f(e),`cuda.shares`)?(0,B.jsx)(Ae,{color:`blue`,label:`Fractional GPU™`}):null]}):null]}),t[2]=a==null?void 0:a.cuda,t[3]=r==null?void 0:r.available_slots,t[4]=r==null?void 0:r.version,t[5]=n,t[6]=o}else o=t[6];return o},ft=e=>{"use memo";let t=(0,z.c)(36),n,r,i,a,o,s;t[0]===e?(n=t[1],r=t[2],i=t[3],a=t[4],o=t[5],s=t[6]):({agentsFragment:n,onClickAgentName:o,onChangeOrder:a,customizeColumns:r,hiddenLiveStatKeys:i,...s}=e,t[0]=e,t[1]=n,t[2]=r,t[3]=i,t[4]=a,t[5]=o,t[6]=s);let{t:c}=k(),{token:l}=de(),u=m(),d=(0,ot.useFragment)(Qe,n),f;t[7]===c?f=t[8]:(f=c(`comp:AgentTable.Endpoint`),t[7]=c,t[8]=f);let p;t[9]===f?p=t[10]:(p=(0,B.jsxs)(B.Fragment,{children:[`ID / `,f]}),t[9]=f,t[10]=p);let h;t[11]===o?h=t[12]:(h=(e,t)=>(0,B.jsxs)(N,{direction:`column`,align:`start`,children:[o?(0,B.jsx)(Ie,{type:`hover`,onClick:()=>{o(t)},children:e}):(0,B.jsx)(j,{children:e}),(0,B.jsx)(j,{color:`secondary`,children:t==null?void 0:t.addr})]}),t[11]=o,t[12]=h);let g;if(t[13]!==u||t[14]!==r||t[15]!==i||t[16]!==c||t[17]!==p||t[18]!==h||t[19]!==l){let e;t[21]!==u||t[22]!==c?(e=(e,t)=>(0,B.jsxs)(N,{direction:`column`,align:`start`,children:[(0,B.jsx)(j,{children:(0,at.default)(e).format(`ll LTS`)}),(t==null?void 0:t.status)===`ALIVE`&&(0,B.jsx)(Re,{callback:()=>u.utils.elapsedTime(e,Date.now()),delay:1e3,render:e=>(0,B.jsx)(Me,{values:[{label:c(`comp:AgentTable.Running`)},{label:e}]})})]}),t[21]=u,t[22]=c,t[23]=e):e=t[23];let n;t[24]===i?n=t[25]:(n=(e,t)=>(0,B.jsx)(H,{resetKeys:[e,t==null?void 0:t.available_slots],children:(0,B.jsx)(lt,{value:e,record:t,hiddenLiveStatKeys:i})}),t[24]=i,t[25]=n);let a;t[26]===l?a=t[27]:(a=e=>(0,B.jsx)(N,{justify:`center`,children:e===!0?(0,B.jsx)(se,{style:{color:l(`--color-success`),fontSize:l(`--font-size-xl`)},size:`1em`}):(0,B.jsx)(le,{style:{color:l(`--color-text-disabled`),fontSize:l(`--font-size-xl`)},size:`1em`})}),t[26]=l,t[27]=a);let o=[{title:p,key:`row_id`,dataIndex:`row_id`,fixed:`left`,render:h,sortKey:`id`,sorter:V(`id`)},{title:c(`comp:AgentTable.Region`),key:`region`,dataIndex:`region`,sorter:V(`region`)},{title:c(`comp:AgentTable.Architecture`),key:`architecture`,dataIndex:`architecture`,sorter:V(`architecture`)},{title:c(`comp:AgentTable.Version`),key:`version`,dataIndex:`version`,defaultHidden:!0,sorter:V(`version`)},{title:c(`comp:AgentTable.Starts`),key:`first_contact`,dataIndex:`first_contact`,render:e,sorter:V(`first_contact`)},{title:c(`comp:AgentTable.LostAt`),key:`lost_at`,dataIndex:`lost_at`,defaultHidden:!0,render:et,sorter:V(`lost_at`)},{title:c(`comp:AgentTable.Allocation`),key:`allocated_resources`,render:tt},{title:c(`comp:AgentTable.Utilization`),key:`live_stat`,dataIndex:`live_stat`,render:n},{title:c(`comp:AgentTable.DiskPerc`),key:`disk_pct`,render:nt},{title:c(`comp:AgentTable.ResourceGroup`),key:`scaling_group`,dataIndex:`scaling_group`,sorter:V(`scaling_group`)},{title:c(`comp:AgentTable.Status`),key:`status`,dataIndex:`status`,render:rt,sorter:V(`status`)},{title:c(`comp:AgentTable.Schedulable`),key:`schedulable`,dataIndex:`schedulable`,render:a,sorter:V(`schedulable`)}];g=r?r(o):o,t[13]=u,t[14]=r,t[15]=i,t[16]=c,t[17]=p,t[18]=h,t[19]=l,t[20]=g}else g=t[20];let _=g,v;t[28]===Symbol.for(`react.memo_cache_sentinel`)?(v={x:`max-content`},t[28]=v):v=t[28];let y;t[29]===a?y=t[30]:(y=e=>{a==null||a(e||null)},t[29]=a,t[30]=y);let b;return t[31]!==d||t[32]!==_||t[33]!==y||t[34]!==s?(b=(0,B.jsx)(Ve,{scroll:v,...s,rowKey:it,dataSource:d,columns:_,onChangeOrder:y}),t[31]=d,t[32]=_,t[33]=y,t[34]=s,t[35]=b):b=t[35],b}})))()}var mt;function ht(){return(ht=t((()=>{mt=(function(){var e=[{kind:`Literal`,name:`first`,value:100},{kind:`Literal`,name:`offset`,value:0}],t={alias:null,args:null,kind:`ScalarField`,name:`count`,storageKey:null};return{fragment:{argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAIAgentTableStoriesQuery`,selections:[{alias:null,args:e,concreteType:`AgentConnection`,kind:`LinkedField`,name:`agent_nodes`,plural:!1,selections:[{alias:null,args:null,concreteType:`AgentEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`AgentNode`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{args:null,kind:`FragmentSpread`,name:`BAIAgentTableFragment`}],storageKey:null}],storageKey:null},t],storageKey:`agent_nodes(first:100,offset:0)`}],type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[],kind:`Operation`,name:`BAIAgentTableStoriesQuery`,selections:[{alias:null,args:e,concreteType:`AgentConnection`,kind:`LinkedField`,name:`agent_nodes`,plural:!1,selections:[{alias:null,args:null,concreteType:`AgentEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`AgentNode`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`row_id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`addr`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`region`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`architecture`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`first_contact`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`occupied_slots`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`available_slots`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`live_stat`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`status`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`scaling_group`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`compute_plugins`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`version`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`schedulable`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`lost_at`,storageKey:null}],storageKey:null}],storageKey:null},t],storageKey:`agent_nodes(first:100,offset:0)`}]},params:{cacheID:`d411b518001a19dfaef437faaefa9a68`,id:null,metadata:{},name:`BAIAgentTableStoriesQuery`,operationKind:`query`,text:`query BAIAgentTableStoriesQuery {
  agent_nodes(offset: 0, first: 100) {
    edges {
      node {
        ...BAIAgentTableFragment
        id
      }
    }
    count
  }
}

fragment BAIAgentTableFragment on AgentNode {
  id
  row_id
  addr
  region
  architecture
  first_contact
  occupied_slots
  available_slots
  live_stat
  status
  scaling_group
  compute_plugins
  version
  schedulable
  lost_at
}
`}}})(),mt.hash=`c18fa3690ef39135a96d3bbca6af1bdf`})))()}var gt,_t,U,vt,yt,bt,xt,St,Ct,wt,Tt,Et,Dt,W,Ot,kt,At,jt,Mt,Nt,Pt,Ft,It,Lt,Rt,zt,Bt,G,K,q,J,Y,X,Z,Q,$,Vt;function Ht(){return(Ht=t((()=>{ht(),Ke(),He(),De(),ge(),re(),pt(),gt=n(),_t=be(),U=O(),{mockClientPromise:Rt,mockAnonymousClientFactory:zt}=Ge(),Bt={title:`Fragments/BAIAgentTable`,component:ft,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:"\n**BAIAgentTable** is a specialized table component for displaying Backend.AI agent information with Relay GraphQL integration.\n\n## BAI-Specific Props\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `agentsFragment` | `BAIAgentTableFragment$key` | - | GraphQL fragment reference (required) |\n| `onClickAgentName` | `(agent: AgentNodeInList) => void` | - | Callback when agent name is clicked |\n| `onChangeOrder` | `(order: string \\| undefined) => void` | - | Callback for sorting with typed order values |\n| `customizeColumns` | `(baseColumns: BAIColumnType[]) => BAIColumnType[]` | - | Function to customize table columns |\n\n## Available Sorter Keys\n- `id` (the ID column renders `row_id` but the server orders by `id`)\n- `first_contact`\n- `scaling_group`\n- `status`\n- `schedulable`\n- `region`\n- `version`\n- `lost_at`\n\nUse with prefix `-` for descending order (e.g., `'-first_contact'`).\nThe list mirrors `_queryorder_colmap` of the graphene `agent_nodes` resolver.\n\n## Pre-configured Columns\n- **ID / Endpoint**: Agent row ID and address\n- **Region**: Agent region\n- **Architecture**: CPU architecture (no server order key, so not sortable)\n- **Version**: Agent version — `defaultHidden`; the status cell already prints it, so the column exists to make the `version` ordering reachable\n- **Starts**: First contact time and running duration\n- **Lost At**: When the agent was lost — `defaultHidden`; only meaningful on terminated agents, and makes the `lost_at` ordering reachable\n- **Allocation**: Resource allocation (CPU, memory, GPU, etc.) with progress bars\n- **Utilization**: Live resource utilization statistics\n- **Disk %**: Disk usage percentage\n- **Resource Group**: Scaling group name\n- **Status**: Agent status, CUDA version, plugin info\n- **Schedulable**: Whether agent can schedule new sessions\n\nHidden-by-default columns are opt-in through the table's column settings.\n\n## Customizing Columns\n`customizeColumns` receives the base array and its return value is used verbatim.\nMatch entries on `column.key`, never by index — the base list grows, and an index\nslice silently drops whichever column moved into the gap.\n\nFor other props (loading, pagination, etc.), refer to [BAITable](?path=/docs/table-baitable--docs).\n        "}}},argTypes:{agentsFragment:{control:!1,description:`GraphQL fragment reference for agent data`,table:{type:{summary:`BAIAgentTableFragment$key`}}},onClickAgentName:{action:`agent-name-clicked`,description:`Callback when agent name is clicked`,table:{type:{summary:`(agent: AgentNodeInList) => void`}}},onChangeOrder:{action:`order-changed`,description:`Callback for sorting with typed order values`,table:{type:{summary:`(order: string | undefined) => void`}}},customizeColumns:{control:!1,description:`Function to customize table columns`,table:{type:{summary:`(baseColumns: BAIColumnType[]) => BAIColumnType[]`}}}},decorators:[(e,t)=>{let n=t.globals.locale||`en`,r=We[n]||We.en;return(0,U.jsx)(he,{locale:r,clientPromise:Rt,anonymousClientFactory:zt,children:(0,U.jsx)(ne,{deviceMetaData:Ue,children:(0,U.jsx)(e,{})})})}]},G=({onClickAgentName:e,onChangeOrder:t,customizeColumns:n,loading:r,order:i})=>{let{agent_nodes:a}=(0,_t.useLazyLoadQuery)(mt,{}),o=(a==null?void 0:a.edges.map(e=>e==null?void 0:e.node).filter(e=>!!e))??[];return(0,U.jsx)(ft,{agentsFragment:o,onClickAgentName:e,onChangeOrder:t,customizeColumns:n,loading:r,order:i,pagination:{total:(a==null?void 0:a.count)??0,pageSize:10}})},K=(e,t={})=>({id:`agent-${e}`,row_id:`agent-00${e}`,addr:`192.168.1.${100+e}:6001`,region:e%2==0?`us-west-2`:`us-east-1`,architecture:`x86_64`,first_contact:new Date(Date.now()-e*24*60*60*1e3).toISOString(),occupied_slots:JSON.stringify({cpu:`4`,mem:`8589934592`,"cuda.device":`1`}),available_slots:JSON.stringify({cpu:`16`,mem:`34359738368`,"cuda.device":`2`,"cuda.shares":`2.0`}),live_stat:JSON.stringify({node:{cpu_util:{current:25.5+e*5,capacity:100,pct:25.5+e*5},mem:{current:`8589934592`,capacity:`34359738368`,pct:`25`},disk:{current:`107374182400`,capacity:`536870912000`,pct:`20`},net_rx:{current:`1048576`},net_tx:{current:`524288`},cuda_util:{current:`50`,capacity:`100`},cuda_mem:{current:`4294967296`,capacity:`8589934592`,pct:`50`}},devices:{cpu_util:{0:25.5,1:30,2:20,3:28.5}}}),status:`ALIVE`,scaling_group:`default`,compute_plugins:JSON.stringify({cuda:{version:`12.0.1`,cuda_version:`12.0`}}),version:`24.03.0`,schedulable:!0,lost_at:null,...t}),q={name:`Basic`,parameters:{docs:{description:{story:`Basic agent table displaying multiple agents with their resource allocations, utilization, and status.`}}},render:e=>(0,U.jsx)(L,{mockResolvers:{Query:()=>({agent_nodes:{edges:[{node:K(1)},{node:K(2,{status:`TERMINATED`})},{node:K(3)},{node:K(4,{schedulable:!1})},{node:K(5)}],count:5}})},children:(0,U.jsx)(G,{...e})})},J={name:`ClickableAgentNames`,parameters:{docs:{description:{story:`Demonstrates clickable agent names. Click on any agent ID to trigger the callback.`}}},render:()=>{let[e,t]=(0,gt.useState)(null);return(0,U.jsxs)(`div`,{children:[(0,U.jsxs)(`div`,{style:{marginBottom:16},children:[(0,U.jsx)(`strong`,{children:`Selected Agent:`}),` `,e?e.row_id:`None`]}),(0,U.jsx)(L,{mockResolvers:{Query:()=>({agent_nodes:{edges:[{node:K(1)},{node:K(2)},{node:K(3)}],count:3}})},children:(0,U.jsx)(G,{onClickAgentName:e=>{t(e)}})})]})}},Y={name:`CustomColumns`,parameters:{docs:{description:{story:`Demonstrates column customization by adding an actions column at the beginning of the table.`}}},render:()=>(0,U.jsx)(L,{mockResolvers:{Query:()=>({agent_nodes:{edges:[{node:K(1)},{node:K(2)},{node:K(3)}],count:3}})},children:(0,U.jsx)(G,{customizeColumns:e=>[{key:`actions`,title:`Actions`,fixed:`left`,width:100,render:(e,t)=>(0,U.jsx)(Oe,{size:`small`,onClick:()=>alert(`Managing agent: ${t.row_id}`),children:`Manage`})},...e]})})},X={name:`LoadingState`,parameters:{docs:{description:{story:`Shows the agent table in a loading state with reduced opacity.`}}},render:()=>(0,U.jsx)(L,{mockResolvers:{Query:()=>({agent_nodes:{edges:[{node:K(1)},{node:K(2)}],count:2}})},children:(0,U.jsx)(G,{loading:!0})})},Z={name:`EmptyState`,parameters:{docs:{description:{story:`Shows the agent table when no agents are available.`}}},render:()=>(0,U.jsx)(L,{mockResolvers:{Query:()=>({agent_nodes:{edges:[],count:0}})},children:(0,U.jsx)(G,{})})},Q={name:`DifferentStatuses`,parameters:{docs:{description:{story:`Displays agents with different statuses to show how the table renders each state.`}}},render:()=>(0,U.jsx)(L,{mockResolvers:{Query:()=>({agent_nodes:{edges:[{node:K(1,{status:`ALIVE`,schedulable:!0})},{node:K(2,{status:`TERMINATED`,schedulable:!1})},{node:K(3,{status:`ALIVE`,schedulable:!1})},{node:K(4,{status:`LOST`,schedulable:!1})}],count:4}})},children:(0,U.jsx)(G,{})})},$={name:`RealWorldUsage`,parameters:{docs:{description:{story:`Demonstrates a realistic use case combining clickable agent names, sorting, and custom columns.`}}},render:()=>{let[e,t]=(0,gt.useState)(null),[n,r]=(0,gt.useState)(`-first_contact`);return(0,U.jsxs)(`div`,{children:[(0,U.jsxs)(`div`,{style:{marginBottom:16,padding:12,background:`#f5f5f5`,borderRadius:4},children:[(0,U.jsxs)(`div`,{children:[(0,U.jsx)(`strong`,{children:`Selected Agent:`}),` `,e?e.row_id:`None`]}),(0,U.jsxs)(`div`,{children:[(0,U.jsx)(`strong`,{children:`Sort Order:`}),` `,n||`None`]})]}),(0,U.jsx)(L,{mockResolvers:{Query:()=>({agent_nodes:{edges:[{node:K(1)},{node:K(2,{status:`TERMINATED`})},{node:K(3)},{node:K(4,{schedulable:!1})},{node:K(5)},{node:K(6)}],count:6}})},children:(0,U.jsx)(G,{order:n,onClickAgentName:e=>t(e),onChangeOrder:e=>r(e),customizeColumns:e=>[{key:`actions`,title:`Actions`,fixed:`left`,width:100,render:(e,n)=>(0,U.jsx)(Oe,{size:`small`,type:`link`,onClick:()=>t(n),children:`Select`})},...e]})})]})}},q.parameters={...q.parameters,docs:{...(vt=q.parameters)==null?void 0:vt.docs,source:{originalSource:`{
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'Basic agent table displaying multiple agents with their resource allocations, utilization, and status.'
      }
    }
  },
  render: args => <RelayResolver mockResolvers={{
    Query: () => ({
      agent_nodes: {
        edges: [{
          node: generateMockAgent(1)
        }, {
          node: generateMockAgent(2, {
            status: 'TERMINATED'
          })
        }, {
          node: generateMockAgent(3)
        }, {
          node: generateMockAgent(4, {
            schedulable: false
          })
        }, {
          node: generateMockAgent(5)
        }],
        count: 5
      }
    })
  }}>
      <QueryResolver {...args} />
    </RelayResolver>
}`,...(yt=q.parameters)==null||(yt=yt.docs)==null?void 0:yt.source},description:{story:`Basic agent table with mock data showing various agent states and configurations.`,...(bt=q.parameters)==null||(bt=bt.docs)==null?void 0:bt.description}}},J.parameters={...J.parameters,docs:{...(xt=J.parameters)==null?void 0:xt.docs,source:{originalSource:`{
  name: 'ClickableAgentNames',
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates clickable agent names. Click on any agent ID to trigger the callback.'
      }
    }
  },
  render: () => {
    const [selectedAgent, setSelectedAgent] = useState<AgentNodeInList | null>(null);
    return <div>
        <div style={{
        marginBottom: 16
      }}>
          <strong>Selected Agent:</strong>{' '}
          {selectedAgent ? selectedAgent.row_id : 'None'}
        </div>
        <RelayResolver mockResolvers={{
        Query: () => ({
          agent_nodes: {
            edges: [{
              node: generateMockAgent(1)
            }, {
              node: generateMockAgent(2)
            }, {
              node: generateMockAgent(3)
            }],
            count: 3
          }
        })
      }}>
          <QueryResolver onClickAgentName={agent => {
          setSelectedAgent(agent);
        }} />
        </RelayResolver>
      </div>;
  }
}`,...(St=J.parameters)==null||(St=St.docs)==null?void 0:St.source},description:{story:`Agent table with clickable agent names. Click on any agent ID to see the callback in action.`,...(Ct=J.parameters)==null||(Ct=Ct.docs)==null?void 0:Ct.description}}},Y.parameters={...Y.parameters,docs:{...(wt=Y.parameters)==null?void 0:wt.docs,source:{originalSource:`{
  name: 'CustomColumns',
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates column customization by adding an actions column at the beginning of the table.'
      }
    }
  },
  render: () => <RelayResolver mockResolvers={{
    Query: () => ({
      agent_nodes: {
        edges: [{
          node: generateMockAgent(1)
        }, {
          node: generateMockAgent(2)
        }, {
          node: generateMockAgent(3)
        }],
        count: 3
      }
    })
  }}>
      <QueryResolver customizeColumns={baseColumns => [{
      key: 'actions',
      title: 'Actions',
      fixed: 'left',
      width: 100,
      render: (_value, record) => <BAIButton size="small" onClick={() => alert(\`Managing agent: \${record.row_id}\`)}>
                Manage
              </BAIButton>
    }, ...baseColumns]} />
    </RelayResolver>
}`,...(Tt=Y.parameters)==null||(Tt=Tt.docs)==null?void 0:Tt.source},description:{story:"Agent table with custom column configuration using the `customizeColumns` pattern.",...(Et=Y.parameters)==null||(Et=Et.docs)==null?void 0:Et.description}}},X.parameters={...X.parameters,docs:{...(Dt=X.parameters)==null?void 0:Dt.docs,source:{originalSource:`{
  name: 'LoadingState',
  parameters: {
    docs: {
      description: {
        story: 'Shows the agent table in a loading state with reduced opacity.'
      }
    }
  },
  render: () => <RelayResolver mockResolvers={{
    Query: () => ({
      agent_nodes: {
        edges: [{
          node: generateMockAgent(1)
        }, {
          node: generateMockAgent(2)
        }],
        count: 2
      }
    })
  }}>
      <QueryResolver loading={true} />
    </RelayResolver>
}`,...(W=X.parameters)==null||(W=W.docs)==null?void 0:W.source},description:{story:`Agent table in loading state.`,...(Ot=X.parameters)==null||(Ot=Ot.docs)==null?void 0:Ot.description}}},Z.parameters={...Z.parameters,docs:{...(kt=Z.parameters)==null?void 0:kt.docs,source:{originalSource:`{
  name: 'EmptyState',
  parameters: {
    docs: {
      description: {
        story: 'Shows the agent table when no agents are available.'
      }
    }
  },
  render: () => <RelayResolver mockResolvers={{
    Query: () => ({
      agent_nodes: {
        edges: [],
        count: 0
      }
    })
  }}>
      <QueryResolver />
    </RelayResolver>
}`,...(At=Z.parameters)==null||(At=At.docs)==null?void 0:At.source},description:{story:`Agent table with no agents (empty state).`,...(jt=Z.parameters)==null||(jt=jt.docs)==null?void 0:jt.description}}},Q.parameters={...Q.parameters,docs:{...(Mt=Q.parameters)==null?void 0:Mt.docs,source:{originalSource:`{
  name: 'DifferentStatuses',
  parameters: {
    docs: {
      description: {
        story: 'Displays agents with different statuses to show how the table renders each state.'
      }
    }
  },
  render: () => <RelayResolver mockResolvers={{
    Query: () => ({
      agent_nodes: {
        edges: [{
          node: generateMockAgent(1, {
            status: 'ALIVE',
            schedulable: true
          })
        }, {
          node: generateMockAgent(2, {
            status: 'TERMINATED',
            schedulable: false
          })
        }, {
          node: generateMockAgent(3, {
            status: 'ALIVE',
            schedulable: false
          })
        }, {
          node: generateMockAgent(4, {
            status: 'LOST',
            schedulable: false
          })
        }],
        count: 4
      }
    })
  }}>
      <QueryResolver />
    </RelayResolver>
}`,...(Nt=Q.parameters)==null||(Nt=Nt.docs)==null?void 0:Nt.source},description:{story:`Agent table showing different agent statuses (ALIVE, TERMINATED, etc.).`,...(Pt=Q.parameters)==null||(Pt=Pt.docs)==null?void 0:Pt.description}}},$.parameters={...$.parameters,docs:{...(Ft=$.parameters)==null?void 0:Ft.docs,source:{originalSource:`{
  name: 'RealWorldUsage',
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates a realistic use case combining clickable agent names, sorting, and custom columns.'
      }
    }
  },
  render: () => {
    const [selectedAgent, setSelectedAgent] = useState<AgentNodeInList | null>(null);
    const [order, setOrder] = useState<string | undefined>('-first_contact');
    return <div>
        <div style={{
        marginBottom: 16,
        padding: 12,
        background: '#f5f5f5',
        borderRadius: 4
      }}>
          <div>
            <strong>Selected Agent:</strong>{' '}
            {selectedAgent ? selectedAgent.row_id : 'None'}
          </div>
          <div>
            <strong>Sort Order:</strong> {order || 'None'}
          </div>
        </div>
        <RelayResolver mockResolvers={{
        Query: () => ({
          agent_nodes: {
            edges: [{
              node: generateMockAgent(1)
            }, {
              node: generateMockAgent(2, {
                status: 'TERMINATED'
              })
            }, {
              node: generateMockAgent(3)
            }, {
              node: generateMockAgent(4, {
                schedulable: false
              })
            }, {
              node: generateMockAgent(5)
            }, {
              node: generateMockAgent(6)
            }],
            count: 6
          }
        })
      }}>
          <QueryResolver order={order} onClickAgentName={agent => setSelectedAgent(agent)} onChangeOrder={newOrder => setOrder(newOrder)} customizeColumns={baseColumns => [{
          key: 'actions',
          title: 'Actions',
          fixed: 'left',
          width: 100,
          render: (_value, record) => <BAIButton size="small" type="link" onClick={() => setSelectedAgent(record)}>
                    Select
                  </BAIButton>
        }, ...baseColumns]} />
        </RelayResolver>
      </div>;
  }
}`,...(It=$.parameters)==null||(It=It.docs)==null?void 0:It.source},description:{story:`Real-world example combining multiple features.`,...(Lt=$.parameters)==null||(Lt=Lt.docs)==null?void 0:Lt.description}}},Vt=[`Default`,`WithClickableAgentNames`,`WithCustomColumns`,`Loading`,`Empty`,`DifferentStatuses`,`RealWorldExample`]})))()}Ht();export{q as Default,Q as DifferentStatuses,Z as Empty,X as Loading,$ as RealWorldExample,J as WithClickableAgentNames,Y as WithCustomColumns,Vt as __namedExportsOrder,Bt as default};