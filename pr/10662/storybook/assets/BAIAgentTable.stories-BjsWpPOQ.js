import{a as e,n as t}from"./rolldown-runtime-sJBDdmOt.js";import{t as n}from"./react-DlPsW1c0.js";import{n as r,t as i}from"./toString-DisgP18h.js";import{i as a,n as o,r as s,t as c}from"./toFinite-h-2-9ZQn.js";import{n as l,t as u}from"./toInteger-CZy_sk2Z.js";import{_ as d,v as f}from"./_Uint8Array-BSgh8wEY.js";import{A as p,j as m,k as h,t as g}from"./hooks-CqTIG_8a.js";import{n as _,t as v}from"./forEach-Cs0R4zzP.js";import{n as y,t as b}from"./map-BLzs52H1.js";import{n as ee,t as x}from"./includes-CyC0lXf3.js";import{n as S,t as C}from"./isEmpty-CptDxjc2.js";import{n as w,t as T}from"./split-DV0-Ibal.js";import{a as E,i as te,n as D,o as ne,r as O,s as k}from"./BAIResourceNumberWithIcon-DoOGwUci.js";import{t as A}from"./jsx-runtime-MKhVqBIO.js";import{n as re,t as ie}from"./useBAIi18n-BpbzZnIV.js";import{t as ae}from"./dayjs.min-BHb7hAap.js";import{t as oe}from"./compiler-runtime-DU4U6aph.js";import{n as se,r as ce}from"./useTheme-B-966VfY.js";import{n as le,t as ue}from"./circle-check-CJK0NgR9.js";import{n as de,t as fe}from"./circle-minus-Ca6OtsWu.js";import{n as pe,t as j}from"./Text-Cj3JSrHf.js";import{h as me,m as M,o as he,s as ge}from"./iframe-RRWc66e7.js";import{n as _e,t as N}from"./BAIFlex-DnaoYTJ1.js";import{n as ve,t as ye}from"./BAIAlertIconWithTooltip-Seh38yV1.js";import{t as be}from"./react-relay-sHama7hJ.js";import{t as xe}from"./astryxTagVariant-G-qTOScM.js";import{c as Se,i as Ce,n as P,p as F,r as we}from"./helper-p-d7z67I.js";import{n as Te,t as Ee}from"./BAIButton-nAXcazhG.js";import{n as De,t as Oe}from"./Token-CdZYTLEb.js";import{n as ke,t as Ae}from"./BAIDoubleBadge-BwJm9k0i.js";import{n as je,t as Me}from"./BAIDoubleToken-sZ6YYja4.js";import{n as Ne,t as Pe}from"./BAILink-Dg818fHm.js";import{n as Fe,t as Ie}from"./BAIIntervalView-3hMrBNvw.js";import{n as Le,t as I}from"./BAIProgressWithLabel-D9MNFDX1.js";import{n as Re,t as ze}from"./BAITable-BxnjTQ2k.js";import{n as Be,o as Ve,r as He,t as Ue}from"./storybook-mock-utils-BqLAdkd_.js";import{n as We,t as L}from"./RelayResolver-BnFyFQJn.js";function Ge(e=[],t=[]){return e.length!==t.length||e.some((e,n)=>!Object.is(e,t[n]))}var R,Ke,qe,Je;function Ye(){return(Ye=t((()=>{R=n(),Ke=(0,R.createContext)(null),qe={didCatch:!1,error:null},Je=class extends R.Component{constructor(e){super(e),this.resetErrorBoundary=this.resetErrorBoundary.bind(this),this.state=qe}static getDerivedStateFromError(e){return{didCatch:!0,error:e}}resetErrorBoundary(...e){var t,n;let{error:r}=this.state;r!==null&&((t=(n=this.props).onReset)==null||t.call(n,{args:e,reason:`imperative-api`}),this.setState(qe))}componentDidCatch(e,t){var n,r;(n=(r=this.props).onError)==null||n.call(r,e,t)}componentDidUpdate(e,t){var n,r;let{didCatch:i}=this.state,{resetKeys:a}=this.props;i&&t.error!==null&&Ge(e.resetKeys,a)&&((n=(r=this.props).onReset)==null||n.call(r,{next:a,prev:e.resetKeys,reason:`keys`}),this.setState(qe))}render(){let{children:e,fallbackRender:t,FallbackComponent:n,fallback:r}=this.props,{didCatch:i,error:a}=this.state,o=e;if(i){let e={error:a,resetErrorBoundary:this.resetErrorBoundary};if(typeof t==`function`)o=t(e);else if(n)o=(0,R.createElement)(n,e);else if(r!==void 0)o=r;else throw a}return(0,R.createElement)(Ke.Provider,{value:{didCatch:i,error:a,resetErrorBoundary:this.resetErrorBoundary}},o)}}})))()}var Xe;function Ze(){return(Ze=t((()=>{Xe={argumentDefinitions:[],kind:`Fragment`,metadata:{plural:!0},name:`BAIAgentTableFragment`,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`row_id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`addr`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`region`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`architecture`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`first_contact`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`occupied_slots`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`available_slots`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`live_stat`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`status`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`scaling_group`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`compute_plugins`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`version`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`schedulable`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`lost_at`,storageKey:null}],type:`AgentNode`,abstractKey:null},Xe.hash=`73cb32c95a2360f7165430aa991c1b7d`})))()}function Qe(e){return(0,B.jsx)(j,{children:e?(0,it.default)(e).format(`ll LTS`):`-`})}function $e(e,t){return(0,B.jsx)(H,{resetKeys:[t==null?void 0:t.occupied_slots,t==null?void 0:t.available_slots],children:(0,B.jsx)(st,{record:t})})}function et(e,t){return(0,B.jsx)(H,{resetKeys:[e,t==null?void 0:t.available_slots],children:(0,B.jsx)(ct,{value:e,record:t})})}function tt(e,t){return(0,B.jsx)(H,{resetKeys:[t==null?void 0:t.live_stat],children:(0,B.jsx)(lt,{record:t})})}function nt(e,t){return(0,B.jsx)(H,{resetKeys:[e,t==null?void 0:t.compute_plugins,t==null?void 0:t.available_slots],children:(0,B.jsx)(ut,{value:e,record:t})})}function rt(e){return e.id}var z,it,at,B,ot,V,H,st,ct,lt,ut,dt;function ft(){return(ft=t((()=>{Ze(),z=oe(),Se(),g(),ie(),ve(),ke(),je(),_e(),Fe(),Ne(),Le(),O(),me(),Re(),te(),p(),pe(),De(),se(),it=e(ae(),1),ee(),b(),c(),s(),d(),u(),_(),i(),T(),C(),le(),de(),Ye(),at=be(),B=A(),ot=[`id`,`first_contact`,`scaling_group`,`status`,`schedulable`,`region`,`version`,`lost_at`],[...ot,...ot.map(e=>`-${e}`)],V=e=>x(ot,e),H=e=>{"use memo";let t=(0,z.c)(12),n,r;t[0]===e?(n=t[1],r=t[2]):({children:n,...r}=e,t[0]=e,t[1]=n,t[2]=r);let{t:i}=re(),{logger:a}=h(),o;t[3]===a?o=t[4]:(o=(e,t)=>a.error(`[BAIAgentTable] Cell render failed:`,e,t.componentStack),t[3]=a,t[4]=o);let s;t[5]===i?s=t[6]:(s=()=>(0,B.jsx)(ye,{type:`error`,title:i(`comp:AgentTable.FailedToLoadCellData`)}),t[5]=i,t[6]=s);let c;return t[7]!==n||t[8]!==r||t[9]!==o||t[10]!==s?(c=(0,B.jsx)(Je,{onError:o,fallbackRender:s,...r,children:n}),t[7]=n,t[8]=r,t[9]=o,t[10]=s,t[11]=c):c=t[11],c},st=e=>{"use memo";let t=(0,z.c)(13),{record:n}=e,{token:r}=ce(),{mergedResourceSlots:i}=E(),s,c,l,u;if(t[0]!==i||t[1]!==(n==null?void 0:n.available_slots)||t[2]!==(n==null?void 0:n.occupied_slots)||t[3]!==r){let e=JSON.parse((n==null?void 0:n.occupied_slots)||`{}`),d=JSON.parse((n==null?void 0:n.available_slots)||`{}`);s=N,c=`column`,l=`xxs`,u=y(d,(t,n)=>{if(n===`cpu`){var s;let t=o(a(e.cpu)/a(d.cpu)*100);return(0,B.jsxs)(N,{justify:`between`,style:{width:`100%`},gap:`xs`,children:[(0,B.jsxs)(N,{gap:`xxs`,children:[(0,B.jsx)(D,{type:n},n),(0,B.jsxs)(j,{children:[F(e.cpu||0,0),`\xA0/\xA0`,F(d.cpu||0,0)]}),(0,B.jsx)(j,{color:`secondary`,style:{fontSize:r(`--spacing-2`)},children:(s=i.cpu)==null?void 0:s.display_unit})]}),(0,B.jsx)(I,{percent:t,strokeColor:r(t>80?`--color-error`:`--color-success`),width:120,valueLabel:F(t,1)+` %`})]},n)}if(n===`mem`){var c,l;let t=o(a(e.mem)/a(d.mem)*100);return(0,B.jsxs)(N,{justify:`between`,style:{width:`100%`},gap:`xs`,children:[(0,B.jsxs)(N,{gap:`xxs`,children:[(0,B.jsx)(D,{type:`mem`}),(0,B.jsxs)(j,{children:[((c=P(e.mem,`g`,0))==null?void 0:c.numberFixed)??0,`\xA0/\xA0`,((l=P(d.mem,`g`,0))==null?void 0:l.numberFixed)??0]}),(0,B.jsx)(j,{color:`secondary`,style:{fontSize:r(`--spacing-2`)},children:`GiB`})]}),(0,B.jsx)(I,{percent:t,strokeColor:r(t>80?`--color-error`:`--color-success`),width:120,valueLabel:F(t,1)+` %`})]},`mem`)}if(d[n]){var u;let t=o(a(e[n])/a(d[n])*100);return(0,B.jsxs)(N,{justify:`between`,gap:`xs`,style:{width:`100%`},children:[(0,B.jsxs)(N,{gap:`xxs`,children:[(0,B.jsx)(D,{type:n},n),(0,B.jsxs)(j,{children:[F(e[n]||0,2),`\xA0/\xA0`,F(d[n],2)]}),(0,B.jsx)(j,{color:`secondary`,style:{fontSize:r(`--spacing-2`)},children:(u=i[n])==null?void 0:u.display_unit})]}),(0,B.jsx)(I,{percent:t,strokeColor:r(t>80?`--color-error`:`--color-success`),width:120,valueLabel:F(t,1)+` %`})]},n)}}),t[0]=i,t[1]=n==null?void 0:n.available_slots,t[2]=n==null?void 0:n.occupied_slots,t[3]=r,t[4]=s,t[5]=c,t[6]=l,t[7]=u}else s=t[4],c=t[5],l=t[6],u=t[7];let d;return t[8]!==s||t[9]!==c||t[10]!==l||t[11]!==u?(d=(0,B.jsx)(s,{direction:c,gap:l,children:u}),t[8]=s,t[9]=c,t[10]=l,t[11]=u,t[12]=d):d=t[12],d},ct=e=>{"use memo";let t=(0,z.c)(28),{value:n,record:i}=e,{t:a}=re(),{mergedResourceSlots:s}=E(),c;if(t[0]!==s||t[1]!==(i==null?void 0:i.available_slots)||t[2]!==(i==null?void 0:i.status)||t[3]!==a||t[4]!==n){c=Symbol.for(`react.early_return_sentinel`);bb0:{let e=JSON.parse(n||`{}`),g=JSON.parse((i==null?void 0:i.available_slots)||`{}`);if((i==null?void 0:i.status)===`ALIVE`){var u,d,p,m,h;let n={cpu_util:{capacity:0,current:0,ratio:0},mem_util:{capacity:0,current:0,ratio:0}};if(e&&e.node&&e.devices){let t=f(e.devices.cpu_util).length;n.cpu_util.capacity=o(e.node.cpu_util.capacity),n.cpu_util.current=o(e.node.cpu_util.current),n.cpu_util.ratio=Math.min(o(e.node.cpu_util.pct)/100/(t||1),1),n.mem_util.capacity=l(g.mem||e.node.mem.capacity),n.mem_util.current=l(e.node.mem.current),n.mem_util.ratio=n.mem_util.current/n.mem_util.capacity||0}v(f(e==null?void 0:e.node),t=>{[`cpu_util`,`mem`,`disk`,`net_rx`,`net_tx`].includes(t)||(x(t,`_util`)?n[t]={capacity:o(e.node[t].capacity)||100,current:o(e.node[t].current),ratio:o(e.node[t].current)/100||0}:t.includes(`_mem`)&&(n[t]={capacity:o(e.node[t].capacity),current:o(e.node[t].current),ratio:o(e.node[t].pct)/100||0}))});let i=((u=Ce(r(n.mem_util.capacity),`auto`))==null?void 0:u.unit)||`g`,a;t[6]===Symbol.for(`react.memo_cache_sentinel`)?(a={minWidth:200,width:`100%`},t[6]=a):a=t[6];let _=(d=s.cpu)==null?void 0:d.human_readable_name,b;t[7]===_?b=t[8]:(b=(0,B.jsx)(j,{children:_}),t[7]=_,t[8]=b);let ee=n.cpu_util.ratio*100,S=F(o(n.cpu_util.ratio*100),1)+` %`,C;t[9]!==ee||t[10]!==S?(C=(0,B.jsx)(I,{percent:ee,width:120,valueLabel:S}),t[9]=ee,t[10]=S,t[11]=C):C=t[11];let T;t[12]!==b||t[13]!==C?(T=(0,B.jsxs)(N,{justify:`between`,style:a,"data-testid":`live-stat-cpu`,children:[b,C]}),t[12]=b,t[13]=C,t[14]=T):T=t[14];let E;t[15]===Symbol.for(`react.memo_cache_sentinel`)?(E={minWidth:200,width:`100%`},t[15]=E):E=t[15];let te=(p=s.mem)==null?void 0:p.human_readable_name,D;t[16]===te?D=t[17]:(D=(0,B.jsx)(j,{children:te}),t[16]=te,t[17]=D);let ne=n.mem_util.ratio*100,O=((m=P(r(n.mem_util.current),i))==null?void 0:m.numberFixed)+` / `+((h=P(r(n.mem_util.capacity),i))==null?void 0:h.displayValue),k;t[18]!==ne||t[19]!==O?(k=(0,B.jsx)(I,{percent:ne,width:120,valueLabel:O}),t[18]=ne,t[19]=O,t[20]=k):k=t[20];let A;t[21]!==D||t[22]!==k?(A=(0,B.jsxs)(N,{justify:`between`,style:E,"data-testid":`live-stat-mem`,children:[D,k]}),t[21]=D,t[22]=k,t[23]=A):A=t[23],c=(0,B.jsxs)(N,{direction:`column`,gap:`xxs`,children:[T,A,y(f(e==null?void 0:e.node),t=>{var i,a;if(![`cpu_util`,`mem`,`disk`].includes(t)){if(x(t,`_util`)){var c;let e=w(t,`_`)[0]+`.device`;return(0,B.jsxs)(N,{justify:`between`,style:{minWidth:200,width:`100%`},gap:`xxs`,"data-testid":`live-stat-${t}`,children:[(0,B.jsxs)(j,{children:[(c=s[e])==null?void 0:c.human_readable_name,`(util)`]}),(0,B.jsx)(I,{width:120,percent:n[t].current/n[t].capacity*100||0,valueLabel:o(F(n[t].ratio*100,1))+` %`})]},t)}if(x(t,`_mem`)){var l,u,d,f;let e=w(t,`_`)[0]+`.device`,i=((l=Ce(r(n[t].capacity),`auto`))==null?void 0:l.unit)||`g`;return(0,B.jsxs)(N,{justify:`between`,style:{minWidth:200,width:`100%`},gap:`xxs`,"data-testid":`live-stat-${t}`,children:[(0,B.jsxs)(j,{children:[(u=s[e])==null?void 0:u.human_readable_name,`(mem)`]}),(0,B.jsx)(I,{width:120,percent:n[t].current/n[t].capacity*100||0,valueLabel:((d=P(r(n[t].current),i))==null?void 0:d.numberFixed)+` / `+((f=P(r(n[t].capacity),i))==null?void 0:f.displayValue)})]},t)}if(x(t,`_power`)){var p,m;let n=w(t,`_`).slice(0,-1).join(`-`)+`.device`,r=(p=s[n])==null?void 0:p.human_readable_name;return(0,B.jsxs)(N,{justify:`between`,style:{minWidth:200,width:`100%`},gap:`xxs`,"data-testid":`live-stat-${t}`,children:[(0,B.jsx)(M,{children:`${r}(power)`}),(0,B.jsx)(M,{children:`${F((m=e.node[t])==null?void 0:m.current,2)} ${e.node[t].unit_hint}`})]},t)}if(x(t,`_temperature`)){var h,g;let n=w(t,`_`).slice(0,-1).join(`_`)+`.device`,r=(h=s[n])==null?void 0:h.human_readable_name;return(0,B.jsxs)(N,{justify:`between`,style:{minWidth:200,width:`100%`},gap:`xxs`,"data-testid":`live-stat-${t}`,children:[(0,B.jsx)(M,{children:`${r}(temp)`}),(0,B.jsx)(M,{children:`${F((g=e.node[t])==null?void 0:g.current,2)} °C`})]},t)}if(x([`net_rx`,`net_tx`],t)){var _;let n=we((_=e.node[t])==null?void 0:_.current,`auto`);return(0,B.jsxs)(N,{justify:`between`,style:{minWidth:200,width:`100%`},gap:`xxs`,"data-testid":`live-stat-${t}`,children:[(0,B.jsx)(M,{children:t===`net_rx`?`Net Rx`:`Net Tx`}),(0,B.jsx)(M,{children:`${(n==null?void 0:n.numberFixed)??0} ${(n==null?void 0:n.unit.toUpperCase())??``}bps`})]},t)}return(0,B.jsxs)(N,{justify:`between`,style:{minWidth:200,width:`100%`},gap:`xxs`,"data-testid":`live-stat-${t}`,children:[(0,B.jsx)(M,{children:t}),(0,B.jsx)(M,{children:`${F(((i=e.node[t])==null?void 0:i.current)??0,2)}${(a=e.node[t])!=null&&a.unit_hint?` ${e.node[t].unit_hint}`:``}`})]},t)}})]});break bb0}{let e;t[24]===a?e=t[25]:(e=a(`comp:AgentTable.NoAvailableLiveStat`),t[24]=a,t[25]=e);let n;t[26]===e?n=t[27]:(n=(0,B.jsx)(B.Fragment,{children:e}),t[26]=e,t[27]=n),c=n;break bb0}}t[0]=s,t[1]=i==null?void 0:i.available_slots,t[2]=i==null?void 0:i.status,t[3]=a,t[4]=n,t[5]=c}else c=t[5];if(c!==Symbol.for(`react.early_return_sentinel`))return c},lt=e=>{"use memo";let t=(0,z.c)(3),{record:n}=e,{token:r}=ce(),i;if(t[0]!==(n==null?void 0:n.live_stat)||t[1]!==r){var a,s,c,l;let e=((a=JSON.parse((n==null?void 0:n.live_stat)||`{}`))==null||(a=a.node)==null?void 0:a.disk)??{},u=o(e.pct)||0,d=o(F(u,2)),f=r(d>80?`--color-error`:`--color-success`),p=((s=Ce(e==null?void 0:e.capacity,`auto`,{base:1e3}))==null?void 0:s.unit)||`g`;i=(0,B.jsxs)(N,{direction:`column`,align:`end`,children:[(0,B.jsx)(I,{valueLabel:F(d,1)+` %`,percent:d,strokeColor:f,width:120}),!S(e)&&(0,B.jsxs)(j,{style:{fontSize:r(`--font-size-sm`)},children:[(c=we(e==null?void 0:e.current,p))==null?void 0:c.numberFixed,`\xA0/\xA0`,(l=we(e==null?void 0:e.capacity,p))==null?void 0:l.displayValue]})]}),t[0]=n==null?void 0:n.live_stat,t[1]=r,t[2]=i}else i=t[2];return i},ut=e=>{"use memo";let t=(0,z.c)(13),{value:n,record:r}=e,i;t[0]===(r==null?void 0:r.compute_plugins)?i=t[1]:(i=JSON.parse((r==null?void 0:r.compute_plugins)||`{}`),t[0]=r==null?void 0:r.compute_plugins,t[1]=i);let a=i,o;if(t[2]!==(a==null?void 0:a.cuda)||t[3]!==(r==null?void 0:r.available_slots)||t[4]!==(r==null?void 0:r.version)||t[5]!==n){var s,c,l;let e=JSON.parse((r==null?void 0:r.available_slots)||`{}`),i;t[7]===Symbol.for(`react.memo_cache_sentinel`)?(i={label:`Agent`},t[7]=i):i=t[7];let u=(r==null?void 0:r.version)||``,d;t[8]===n?d=t[9]:(d=xe(`agent`,n),t[8]=n,t[9]=d);let p;t[10]!==u||t[11]!==d?(p=(0,B.jsx)(Ae,{values:[i,{label:u,variant:d}]}),t[10]=u,t[11]=d,t[12]=p):p=t[12],o=(0,B.jsxs)(N,{direction:`column`,gap:`xxs`,align:`start`,children:[p,a!=null&&a.cuda?(0,B.jsxs)(B.Fragment,{children:[a!=null&&(s=a.cuda)!=null&&s.cuda_version?(0,B.jsx)(Me,{values:[{label:`CUDA`},{label:a==null||(c=a.cuda)==null?void 0:c.cuda_version,color:`green`}]}):(0,B.jsx)(Oe,{color:`green`,label:`CUDA Disabled`}),(0,B.jsx)(Me,{values:[{label:`CUDA Plugin`},{label:a==null||(l=a.cuda)==null?void 0:l.version,color:`blue`}]}),x(f(e),`cuda.shares`)?(0,B.jsx)(Oe,{color:`blue`,label:`Fractional GPU™`}):null]}):null]}),t[2]=a==null?void 0:a.cuda,t[3]=r==null?void 0:r.available_slots,t[4]=r==null?void 0:r.version,t[5]=n,t[6]=o}else o=t[6];return o},dt=e=>{"use memo";let t=(0,z.c)(32),n,r,i,a,o;t[0]===e?(n=t[1],r=t[2],i=t[3],a=t[4],o=t[5]):({agentsFragment:n,onClickAgentName:a,onChangeOrder:i,customizeColumns:r,...o}=e,t[0]=e,t[1]=n,t[2]=r,t[3]=i,t[4]=a,t[5]=o);let{t:s}=re(),{token:c}=ce(),l=m(),u=(0,at.useFragment)(Xe,n),d;t[6]===s?d=t[7]:(d=s(`comp:AgentTable.Endpoint`),t[6]=s,t[7]=d);let f;t[8]===d?f=t[9]:(f=(0,B.jsxs)(B.Fragment,{children:[`ID / `,d]}),t[8]=d,t[9]=f);let p;t[10]===a?p=t[11]:(p=(e,t)=>(0,B.jsxs)(N,{direction:`column`,align:`start`,children:[a?(0,B.jsx)(Pe,{type:`hover`,onClick:()=>{a(t)},children:e}):(0,B.jsx)(j,{children:e}),(0,B.jsx)(j,{color:`secondary`,children:t==null?void 0:t.addr})]}),t[10]=a,t[11]=p);let h;if(t[12]!==l||t[13]!==r||t[14]!==s||t[15]!==f||t[16]!==p||t[17]!==c){let e;t[19]!==l||t[20]!==s?(e=(e,t)=>(0,B.jsxs)(N,{direction:`column`,align:`start`,children:[(0,B.jsx)(j,{children:(0,it.default)(e).format(`ll LTS`)}),(t==null?void 0:t.status)===`ALIVE`&&(0,B.jsx)(Ie,{callback:()=>l.utils.elapsedTime(e,Date.now()),delay:1e3,render:e=>(0,B.jsx)(Ae,{values:[{label:s(`comp:AgentTable.Running`)},{label:e}]})})]}),t[19]=l,t[20]=s,t[21]=e):e=t[21];let n;t[22]===c?n=t[23]:(n=e=>(0,B.jsx)(N,{justify:`center`,children:e===!0?(0,B.jsx)(ue,{style:{color:c(`--color-success`),fontSize:c(`--font-size-xl`)},size:`1em`}):(0,B.jsx)(fe,{style:{color:c(`--color-text-disabled`),fontSize:c(`--font-size-xl`)},size:`1em`})}),t[22]=c,t[23]=n);let i=[{title:f,key:`row_id`,dataIndex:`row_id`,fixed:`left`,render:p,sortKey:`id`,sorter:V(`id`)},{title:s(`comp:AgentTable.Region`),key:`region`,dataIndex:`region`,sorter:V(`region`)},{title:s(`comp:AgentTable.Architecture`),key:`architecture`,dataIndex:`architecture`,sorter:V(`architecture`)},{title:s(`comp:AgentTable.Version`),key:`version`,dataIndex:`version`,defaultHidden:!0,sorter:V(`version`)},{title:s(`comp:AgentTable.Starts`),key:`first_contact`,dataIndex:`first_contact`,render:e,sorter:V(`first_contact`)},{title:s(`comp:AgentTable.LostAt`),key:`lost_at`,dataIndex:`lost_at`,defaultHidden:!0,render:Qe,sorter:V(`lost_at`)},{title:s(`comp:AgentTable.Allocation`),key:`allocated_resources`,render:$e},{title:s(`comp:AgentTable.Utilization`),key:`live_stat`,dataIndex:`live_stat`,render:et},{title:s(`comp:AgentTable.DiskPerc`),key:`disk_pct`,render:tt},{title:s(`comp:AgentTable.ResourceGroup`),key:`scaling_group`,dataIndex:`scaling_group`,sorter:V(`scaling_group`)},{title:s(`comp:AgentTable.Status`),key:`status`,dataIndex:`status`,render:nt,sorter:V(`status`)},{title:s(`comp:AgentTable.Schedulable`),key:`schedulable`,dataIndex:`schedulable`,render:n,sorter:V(`schedulable`)}];h=r?r(i):i,t[12]=l,t[13]=r,t[14]=s,t[15]=f,t[16]=p,t[17]=c,t[18]=h}else h=t[18];let g=h,_;t[24]===Symbol.for(`react.memo_cache_sentinel`)?(_={x:`max-content`},t[24]=_):_=t[24];let v;t[25]===i?v=t[26]:(v=e=>{i==null||i(e||null)},t[25]=i,t[26]=v);let y;return t[27]!==u||t[28]!==g||t[29]!==v||t[30]!==o?(y=(0,B.jsx)(ze,{scroll:_,...o,rowKey:rt,dataSource:u,columns:g,onChangeOrder:v}),t[27]=u,t[28]=g,t[29]=v,t[30]=o,t[31]=y):y=t[31],y}})))()}var pt;function mt(){return(mt=t((()=>{pt=(function(){var e=[{kind:`Literal`,name:`first`,value:100},{kind:`Literal`,name:`offset`,value:0}],t={alias:null,args:null,kind:`ScalarField`,name:`count`,storageKey:null};return{fragment:{argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAIAgentTableStoriesQuery`,selections:[{alias:null,args:e,concreteType:`AgentConnection`,kind:`LinkedField`,name:`agent_nodes`,plural:!1,selections:[{alias:null,args:null,concreteType:`AgentEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`AgentNode`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{args:null,kind:`FragmentSpread`,name:`BAIAgentTableFragment`}],storageKey:null}],storageKey:null},t],storageKey:`agent_nodes(first:100,offset:0)`}],type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[],kind:`Operation`,name:`BAIAgentTableStoriesQuery`,selections:[{alias:null,args:e,concreteType:`AgentConnection`,kind:`LinkedField`,name:`agent_nodes`,plural:!1,selections:[{alias:null,args:null,concreteType:`AgentEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`AgentNode`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`row_id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`addr`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`region`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`architecture`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`first_contact`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`occupied_slots`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`available_slots`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`live_stat`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`status`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`scaling_group`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`compute_plugins`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`version`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`schedulable`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`lost_at`,storageKey:null}],storageKey:null}],storageKey:null},t],storageKey:`agent_nodes(first:100,offset:0)`}]},params:{cacheID:`d411b518001a19dfaef437faaefa9a68`,id:null,metadata:{},name:`BAIAgentTableStoriesQuery`,operationKind:`query`,text:`query BAIAgentTableStoriesQuery {
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
`}}})(),pt.hash=`c18fa3690ef39135a96d3bbca6af1bdf`})))()}var ht,gt,U,_t,vt,yt,bt,xt,St,Ct,wt,Tt,Et,Dt,Ot,kt,At,jt,Mt,Nt,Pt,Ft,W,It,Lt,Rt,zt,G,K,q,J,Y,X,Z,Q,$,Bt;function Vt(){return(Vt=t((()=>{mt(),We(),Be(),Te(),ge(),k(),ft(),ht=n(),gt=be(),U=A(),{mockClientPromise:Lt,mockAnonymousClientFactory:Rt}=Ue(),zt={title:`Fragments/BAIAgentTable`,component:dt,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:"\n**BAIAgentTable** is a specialized table component for displaying Backend.AI agent information with Relay GraphQL integration.\n\n## BAI-Specific Props\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `agentsFragment` | `BAIAgentTableFragment$key` | - | GraphQL fragment reference (required) |\n| `onClickAgentName` | `(agent: AgentNodeInList) => void` | - | Callback when agent name is clicked |\n| `onChangeOrder` | `(order: string \\| undefined) => void` | - | Callback for sorting with typed order values |\n| `customizeColumns` | `(baseColumns: BAIColumnType[]) => BAIColumnType[]` | - | Function to customize table columns |\n\n## Available Sorter Keys\n- `id` (the ID column renders `row_id` but the server orders by `id`)\n- `first_contact`\n- `scaling_group`\n- `status`\n- `schedulable`\n- `region`\n- `version`\n- `lost_at`\n\nUse with prefix `-` for descending order (e.g., `'-first_contact'`).\nThe list mirrors `_queryorder_colmap` of the graphene `agent_nodes` resolver.\n\n## Pre-configured Columns\n- **ID / Endpoint**: Agent row ID and address\n- **Region**: Agent region\n- **Architecture**: CPU architecture (no server order key, so not sortable)\n- **Version**: Agent version — `defaultHidden`; the status cell already prints it, so the column exists to make the `version` ordering reachable\n- **Starts**: First contact time and running duration\n- **Lost At**: When the agent was lost — `defaultHidden`; only meaningful on terminated agents, and makes the `lost_at` ordering reachable\n- **Allocation**: Resource allocation (CPU, memory, GPU, etc.) with progress bars\n- **Utilization**: Live resource utilization statistics\n- **Disk %**: Disk usage percentage\n- **Resource Group**: Scaling group name\n- **Status**: Agent status, CUDA version, plugin info\n- **Schedulable**: Whether agent can schedule new sessions\n\nHidden-by-default columns are opt-in through the table's column settings.\n\n## Customizing Columns\n`customizeColumns` receives the base array and its return value is used verbatim.\nMatch entries on `column.key`, never by index — the base list grows, and an index\nslice silently drops whichever column moved into the gap.\n\nFor other props (loading, pagination, etc.), refer to [BAITable](?path=/docs/table-baitable--docs).\n        "}}},argTypes:{agentsFragment:{control:!1,description:`GraphQL fragment reference for agent data`,table:{type:{summary:`BAIAgentTableFragment$key`}}},onClickAgentName:{action:`agent-name-clicked`,description:`Callback when agent name is clicked`,table:{type:{summary:`(agent: AgentNodeInList) => void`}}},onChangeOrder:{action:`order-changed`,description:`Callback for sorting with typed order values`,table:{type:{summary:`(order: string | undefined) => void`}}},customizeColumns:{control:!1,description:`Function to customize table columns`,table:{type:{summary:`(baseColumns: BAIColumnType[]) => BAIColumnType[]`}}}},decorators:[(e,t)=>{let n=t.globals.locale||`en`,r=He[n]||He.en;return(0,U.jsx)(he,{locale:r,clientPromise:Lt,anonymousClientFactory:Rt,children:(0,U.jsx)(ne,{deviceMetaData:Ve,children:(0,U.jsx)(e,{})})})}]},G=({onClickAgentName:e,onChangeOrder:t,customizeColumns:n,loading:r,order:i})=>{let{agent_nodes:a}=(0,gt.useLazyLoadQuery)(pt,{}),o=(a==null?void 0:a.edges.map(e=>e==null?void 0:e.node).filter(e=>!!e))??[];return(0,U.jsx)(dt,{agentsFragment:o,onClickAgentName:e,onChangeOrder:t,customizeColumns:n,loading:r,order:i,pagination:{total:(a==null?void 0:a.count)??0,pageSize:10}})},K=(e,t={})=>({id:`agent-${e}`,row_id:`agent-00${e}`,addr:`192.168.1.${100+e}:6001`,region:e%2==0?`us-west-2`:`us-east-1`,architecture:`x86_64`,first_contact:new Date(Date.now()-e*24*60*60*1e3).toISOString(),occupied_slots:JSON.stringify({cpu:`4`,mem:`8589934592`,"cuda.device":`1`}),available_slots:JSON.stringify({cpu:`16`,mem:`34359738368`,"cuda.device":`2`,"cuda.shares":`2.0`}),live_stat:JSON.stringify({node:{cpu_util:{current:25.5+e*5,capacity:100,pct:25.5+e*5},mem:{current:`8589934592`,capacity:`34359738368`,pct:`25`},disk:{current:`107374182400`,capacity:`536870912000`,pct:`20`},net_rx:{current:`1048576`},net_tx:{current:`524288`},cuda_util:{current:`50`,capacity:`100`},cuda_mem:{current:`4294967296`,capacity:`8589934592`,pct:`50`}},devices:{cpu_util:{0:25.5,1:30,2:20,3:28.5}}}),status:`ALIVE`,scaling_group:`default`,compute_plugins:JSON.stringify({cuda:{version:`12.0.1`,cuda_version:`12.0`}}),version:`24.03.0`,schedulable:!0,lost_at:null,...t}),q={name:`Basic`,parameters:{docs:{description:{story:`Basic agent table displaying multiple agents with their resource allocations, utilization, and status.`}}},render:e=>(0,U.jsx)(L,{mockResolvers:{Query:()=>({agent_nodes:{edges:[{node:K(1)},{node:K(2,{status:`TERMINATED`})},{node:K(3)},{node:K(4,{schedulable:!1})},{node:K(5)}],count:5}})},children:(0,U.jsx)(G,{...e})})},J={name:`ClickableAgentNames`,parameters:{docs:{description:{story:`Demonstrates clickable agent names. Click on any agent ID to trigger the callback.`}}},render:()=>{let[e,t]=(0,ht.useState)(null);return(0,U.jsxs)(`div`,{children:[(0,U.jsxs)(`div`,{style:{marginBottom:16},children:[(0,U.jsx)(`strong`,{children:`Selected Agent:`}),` `,e?e.row_id:`None`]}),(0,U.jsx)(L,{mockResolvers:{Query:()=>({agent_nodes:{edges:[{node:K(1)},{node:K(2)},{node:K(3)}],count:3}})},children:(0,U.jsx)(G,{onClickAgentName:e=>{t(e)}})})]})}},Y={name:`CustomColumns`,parameters:{docs:{description:{story:`Demonstrates column customization by adding an actions column at the beginning of the table.`}}},render:()=>(0,U.jsx)(L,{mockResolvers:{Query:()=>({agent_nodes:{edges:[{node:K(1)},{node:K(2)},{node:K(3)}],count:3}})},children:(0,U.jsx)(G,{customizeColumns:e=>[{key:`actions`,title:`Actions`,fixed:`left`,width:100,render:(e,t)=>(0,U.jsx)(Ee,{size:`small`,onClick:()=>alert(`Managing agent: ${t.row_id}`),children:`Manage`})},...e]})})},X={name:`LoadingState`,parameters:{docs:{description:{story:`Shows the agent table in a loading state with reduced opacity.`}}},render:()=>(0,U.jsx)(L,{mockResolvers:{Query:()=>({agent_nodes:{edges:[{node:K(1)},{node:K(2)}],count:2}})},children:(0,U.jsx)(G,{loading:!0})})},Z={name:`EmptyState`,parameters:{docs:{description:{story:`Shows the agent table when no agents are available.`}}},render:()=>(0,U.jsx)(L,{mockResolvers:{Query:()=>({agent_nodes:{edges:[],count:0}})},children:(0,U.jsx)(G,{})})},Q={name:`DifferentStatuses`,parameters:{docs:{description:{story:`Displays agents with different statuses to show how the table renders each state.`}}},render:()=>(0,U.jsx)(L,{mockResolvers:{Query:()=>({agent_nodes:{edges:[{node:K(1,{status:`ALIVE`,schedulable:!0})},{node:K(2,{status:`TERMINATED`,schedulable:!1})},{node:K(3,{status:`ALIVE`,schedulable:!1})},{node:K(4,{status:`LOST`,schedulable:!1})}],count:4}})},children:(0,U.jsx)(G,{})})},$={name:`RealWorldUsage`,parameters:{docs:{description:{story:`Demonstrates a realistic use case combining clickable agent names, sorting, and custom columns.`}}},render:()=>{let[e,t]=(0,ht.useState)(null),[n,r]=(0,ht.useState)(`-first_contact`);return(0,U.jsxs)(`div`,{children:[(0,U.jsxs)(`div`,{style:{marginBottom:16,padding:12,background:`#f5f5f5`,borderRadius:4},children:[(0,U.jsxs)(`div`,{children:[(0,U.jsx)(`strong`,{children:`Selected Agent:`}),` `,e?e.row_id:`None`]}),(0,U.jsxs)(`div`,{children:[(0,U.jsx)(`strong`,{children:`Sort Order:`}),` `,n||`None`]})]}),(0,U.jsx)(L,{mockResolvers:{Query:()=>({agent_nodes:{edges:[{node:K(1)},{node:K(2,{status:`TERMINATED`})},{node:K(3)},{node:K(4,{schedulable:!1})},{node:K(5)},{node:K(6)}],count:6}})},children:(0,U.jsx)(G,{order:n,onClickAgentName:e=>t(e),onChangeOrder:e=>r(e),customizeColumns:e=>[{key:`actions`,title:`Actions`,fixed:`left`,width:100,render:(e,n)=>(0,U.jsx)(Ee,{size:`small`,type:`link`,onClick:()=>t(n),children:`Select`})},...e]})})]})}},q.parameters={...q.parameters,docs:{...(_t=q.parameters)==null?void 0:_t.docs,source:{originalSource:`{
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
}`,...(vt=q.parameters)==null||(vt=vt.docs)==null?void 0:vt.source},description:{story:`Basic agent table with mock data showing various agent states and configurations.`,...(yt=q.parameters)==null||(yt=yt.docs)==null?void 0:yt.description}}},J.parameters={...J.parameters,docs:{...(bt=J.parameters)==null?void 0:bt.docs,source:{originalSource:`{
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
}`,...(xt=J.parameters)==null||(xt=xt.docs)==null?void 0:xt.source},description:{story:`Agent table with clickable agent names. Click on any agent ID to see the callback in action.`,...(St=J.parameters)==null||(St=St.docs)==null?void 0:St.description}}},Y.parameters={...Y.parameters,docs:{...(Ct=Y.parameters)==null?void 0:Ct.docs,source:{originalSource:`{
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
}`,...(wt=Y.parameters)==null||(wt=wt.docs)==null?void 0:wt.source},description:{story:"Agent table with custom column configuration using the `customizeColumns` pattern.",...(Tt=Y.parameters)==null||(Tt=Tt.docs)==null?void 0:Tt.description}}},X.parameters={...X.parameters,docs:{...(Et=X.parameters)==null?void 0:Et.docs,source:{originalSource:`{
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
}`,...(Dt=X.parameters)==null||(Dt=Dt.docs)==null?void 0:Dt.source},description:{story:`Agent table in loading state.`,...(Ot=X.parameters)==null||(Ot=Ot.docs)==null?void 0:Ot.description}}},Z.parameters={...Z.parameters,docs:{...(kt=Z.parameters)==null?void 0:kt.docs,source:{originalSource:`{
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
}`,...(W=$.parameters)==null||(W=W.docs)==null?void 0:W.source},description:{story:`Real-world example combining multiple features.`,...(It=$.parameters)==null||(It=It.docs)==null?void 0:It.description}}},Bt=[`Default`,`WithClickableAgentNames`,`WithCustomColumns`,`Loading`,`Empty`,`DifferentStatuses`,`RealWorldExample`]})))()}Vt();export{q as Default,Q as DifferentStatuses,Z as Empty,X as Loading,$ as RealWorldExample,J as WithClickableAgentNames,Y as WithCustomColumns,Bt as __namedExportsOrder,zt as default};