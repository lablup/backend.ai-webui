import{a as e,n as t}from"./rolldown-runtime-sJBDdmOt.js";import{t as n}from"./react-DlPsW1c0.js";import{n as r,t as i}from"./toString-DisgP18h.js";import{i as a,n as o,r as s,t as c}from"./toFinite-h-2-9ZQn.js";import{n as l,t as u}from"./toInteger-CZy_sk2Z.js";import{_ as d,v as f}from"./_Uint8Array-Cb-jzVD9.js";import{O as p,k as m,t as h}from"./hooks-T_PEg8sW.js";import{n as g,t as _}from"./forEach-D-EZKVpC.js";import{n as v,t as y}from"./map-CLZMgxwS.js";import{n as b,t as x}from"./includes-DMTgV4pD.js";import{n as S,t as C}from"./isEmpty-SRC6Jtfi.js";import{n as w,t as T}from"./split-BSW2HsXS.js";import{a as E,i as D,n as O,o as ee,r as te,s as ne}from"./BAIResourceNumberWithIcon-XOEoeVmc.js";import{t as re}from"./jsx-runtime-MKhVqBIO.js";import{n as ie,t as ae}from"./useBAIi18n-D1AzK-FG.js";import{t as oe}from"./dayjs.min-D7GtMU8l.js";import{t as se}from"./compiler-runtime-DU4U6aph.js";import{n as ce,t as le}from"./circle-check-CJK0NgR9.js";import{n as ue,t as de}from"./circle-minus-Ca6OtsWu.js";import{n as fe,r as pe}from"./useTheme-CwCA677L.js";import{n as me,t as k}from"./Text-DZ3td4AE.js";import{n as he}from"./useBAILogger-DeHwYL5G.js";import{h as ge,m as A,o as _e,s as ve}from"./iframe-BczH89d2.js";import{n as ye,t as j}from"./BAIFlex-DnaoYTJ1.js";import{n as be,t as xe}from"./BAIAlertIconWithTooltip-BzAVV_mE.js";import{t as Se}from"./react-relay-CDKBZFrB.js";import{t as Ce}from"./astryxTagVariant-G-qTOScM.js";import{c as we,i as Te,n as M,p as N,r as Ee}from"./helper-CBd75l-d.js";import{n as De,t as Oe}from"./Badge-CZA6YleA.js";import{n as ke,t as Ae}from"./BAIButton-CMGaOMCH.js";import{n as je,t as Me}from"./Token-BVB5vSg6.js";import{n as Ne,t as Pe}from"./BAIDoubleBadge-DQ7eXY8Y.js";import{n as Fe,t as Ie}from"./BAIDoubleToken-bMHRJ7NW.js";import{n as Le,t as Re}from"./BAILink-DVFULAmY.js";import{n as ze,t as Be}from"./BAIIntervalView-CRE79HMo.js";import{n as Ve,t as P}from"./BAIProgressWithLabel-13y3klmD.js";import{n as He,t as Ue}from"./BAITable-CFKIntCW.js";import{n as We,o as Ge,r as Ke,t as qe}from"./storybook-mock-utils-BqLAdkd_.js";import{n as Je,t as F}from"./RelayResolver-BK8h-MjU.js";function Ye(e=[],t=[]){return e.length!==t.length||e.some((e,n)=>!Object.is(e,t[n]))}var I,Xe,L,Ze;function Qe(){return(Qe=t((()=>{I=n(),Xe=(0,I.createContext)(null),L={didCatch:!1,error:null},Ze=class extends I.Component{constructor(e){super(e),this.resetErrorBoundary=this.resetErrorBoundary.bind(this),this.state=L}static getDerivedStateFromError(e){return{didCatch:!0,error:e}}resetErrorBoundary(...e){let{error:t}=this.state;t!==null&&(this.props.onReset?.({args:e,reason:`imperative-api`}),this.setState(L))}componentDidCatch(e,t){this.props.onError?.(e,t)}componentDidUpdate(e,t){let{didCatch:n}=this.state,{resetKeys:r}=this.props;n&&t.error!==null&&Ye(e.resetKeys,r)&&(this.props.onReset?.({next:r,prev:e.resetKeys,reason:`keys`}),this.setState(L))}render(){let{children:e,fallbackRender:t,FallbackComponent:n,fallback:r}=this.props,{didCatch:i,error:a}=this.state,o=e;if(i){let e={error:a,resetErrorBoundary:this.resetErrorBoundary};if(typeof t==`function`)o=t(e);else if(n)o=(0,I.createElement)(n,e);else if(r!==void 0)o=r;else throw a}return(0,I.createElement)(Xe.Provider,{value:{didCatch:i,error:a,resetErrorBoundary:this.resetErrorBoundary}},o)}}})))()}var $e;function et(){return(et=t((()=>{$e={argumentDefinitions:[],kind:`Fragment`,metadata:{plural:!0},name:`BAIAgentTableFragment`,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`row_id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`addr`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`region`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`architecture`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`first_contact`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`occupied_slots`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`available_slots`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`live_stat`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`status`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`scaling_group`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`compute_plugins`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`version`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`schedulable`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`lost_at`,storageKey:null}],type:`AgentNode`,abstractKey:null},$e.hash=`73cb32c95a2360f7165430aa991c1b7d`})))()}function tt(e){return(0,z.jsx)(k,{children:e?(0,st.default)(e).format(`ll LTS`):`-`})}function nt(e,t){return(0,z.jsx)(H,{resetKeys:[t?.occupied_slots,t?.available_slots],children:(0,z.jsx)(lt,{record:t})})}function rt(e,t){return(0,z.jsx)(H,{resetKeys:[e,t?.available_slots],children:(0,z.jsx)(ut,{value:e,record:t})})}function it(e,t){return(0,z.jsx)(H,{resetKeys:[t?.live_stat],children:(0,z.jsx)(dt,{record:t})})}function at(e,t){return(0,z.jsx)(H,{resetKeys:[e,t?.compute_plugins,t?.available_slots],children:(0,z.jsx)(ft,{value:e,record:t})})}function ot(e){return e.id}var R,st,ct,z,B,V,H,lt,ut,dt,ft,pt;function mt(){return(mt=t((()=>{et(),R=se(),we(),h(),ae(),be(),Ne(),Fe(),ye(),ze(),Le(),Ve(),te(),ge(),He(),D(),p(),De(),me(),je(),fe(),st=e(oe(),1),b(),y(),c(),s(),d(),u(),g(),i(),T(),C(),ce(),ue(),Qe(),ct=Se(),z=re(),B=[`id`,`first_contact`,`scaling_group`,`status`,`schedulable`,`region`,`version`,`lost_at`],[...B,...B.map(e=>`-${e}`)],V=e=>x(B,e),H=e=>{"use memo";let t=(0,R.c)(12),n,r;t[0]===e?(n=t[1],r=t[2]):({children:n,...r}=e,t[0]=e,t[1]=n,t[2]=r);let{t:i}=ie(),{logger:a}=he(),o;t[3]===a?o=t[4]:(o=(e,t)=>a.error(`[BAIAgentTable] Cell render failed:`,e,t.componentStack),t[3]=a,t[4]=o);let s;t[5]===i?s=t[6]:(s=()=>(0,z.jsx)(xe,{type:`error`,title:i(`comp:AgentTable.FailedToLoadCellData`)}),t[5]=i,t[6]=s);let c;return t[7]!==n||t[8]!==r||t[9]!==o||t[10]!==s?(c=(0,z.jsx)(Ze,{onError:o,fallbackRender:s,...r,children:n}),t[7]=n,t[8]=r,t[9]=o,t[10]=s,t[11]=c):c=t[11],c},lt=e=>{"use memo";let t=(0,R.c)(13),{record:n}=e,{token:r}=pe(),{mergedResourceSlots:i}=E(),s,c,l,u;if(t[0]!==i||t[1]!==n?.available_slots||t[2]!==n?.occupied_slots||t[3]!==r){let e=JSON.parse(n?.occupied_slots||`{}`),d=JSON.parse(n?.available_slots||`{}`);s=j,c=`column`,l=`xxs`,u=v(d,(t,n)=>{if(n===`cpu`){let t=o(a(e.cpu)/a(d.cpu)*100);return(0,z.jsxs)(j,{justify:`between`,style:{width:`100%`},gap:`xs`,children:[(0,z.jsxs)(j,{gap:`xxs`,children:[(0,z.jsx)(O,{type:n},n),(0,z.jsxs)(k,{children:[N(e.cpu||0,0),`\xA0/\xA0`,N(d.cpu||0,0)]}),(0,z.jsx)(k,{color:`secondary`,style:{fontSize:r(`--spacing-2`)},children:i.cpu?.display_unit})]}),(0,z.jsx)(P,{percent:t,strokeColor:r(t>80?`--color-error`:`--color-success`),width:120,valueLabel:N(t,1)+` %`})]},n)}if(n===`mem`){let t=o(a(e.mem)/a(d.mem)*100);return(0,z.jsxs)(j,{justify:`between`,style:{width:`100%`},gap:`xs`,children:[(0,z.jsxs)(j,{gap:`xxs`,children:[(0,z.jsx)(O,{type:`mem`}),(0,z.jsxs)(k,{children:[M(e.mem,`g`,0)?.numberFixed??0,`\xA0/\xA0`,M(d.mem,`g`,0)?.numberFixed??0]}),(0,z.jsx)(k,{color:`secondary`,style:{fontSize:r(`--spacing-2`)},children:`GiB`})]}),(0,z.jsx)(P,{percent:t,strokeColor:r(t>80?`--color-error`:`--color-success`),width:120,valueLabel:N(t,1)+` %`})]},`mem`)}if(d[n]){let t=o(a(e[n])/a(d[n])*100);return(0,z.jsxs)(j,{justify:`between`,gap:`xs`,style:{width:`100%`},children:[(0,z.jsxs)(j,{gap:`xxs`,children:[(0,z.jsx)(O,{type:n},n),(0,z.jsxs)(k,{children:[N(e[n]||0,2),`\xA0/\xA0`,N(d[n],2)]}),(0,z.jsx)(k,{color:`secondary`,style:{fontSize:r(`--spacing-2`)},children:i[n]?.display_unit})]}),(0,z.jsx)(P,{percent:t,strokeColor:r(t>80?`--color-error`:`--color-success`),width:120,valueLabel:N(t,1)+` %`})]},n)}}),t[0]=i,t[1]=n?.available_slots,t[2]=n?.occupied_slots,t[3]=r,t[4]=s,t[5]=c,t[6]=l,t[7]=u}else s=t[4],c=t[5],l=t[6],u=t[7];let d;return t[8]!==s||t[9]!==c||t[10]!==l||t[11]!==u?(d=(0,z.jsx)(s,{direction:c,gap:l,children:u}),t[8]=s,t[9]=c,t[10]=l,t[11]=u,t[12]=d):d=t[12],d},ut=e=>{"use memo";let t=(0,R.c)(28),{value:n,record:i}=e,{t:a}=ie(),{mergedResourceSlots:s}=E(),c;if(t[0]!==s||t[1]!==i?.available_slots||t[2]!==i?.status||t[3]!==a||t[4]!==n){c=Symbol.for(`react.early_return_sentinel`);bb0:{let e=JSON.parse(n||`{}`),u=JSON.parse(i?.available_slots||`{}`);if(i?.status===`ALIVE`){let n={cpu_util:{capacity:0,current:0,ratio:0},mem_util:{capacity:0,current:0,ratio:0}};if(e&&e.node&&e.devices){let t=f(e.devices.cpu_util).length;n.cpu_util.capacity=o(e.node.cpu_util.capacity),n.cpu_util.current=o(e.node.cpu_util.current),n.cpu_util.ratio=Math.min(o(e.node.cpu_util.pct)/100/(t||1),1),n.mem_util.capacity=l(u.mem||e.node.mem.capacity),n.mem_util.current=l(e.node.mem.current),n.mem_util.ratio=n.mem_util.current/n.mem_util.capacity||0}_(f(e?.node),t=>{[`cpu_util`,`mem`,`disk`,`net_rx`,`net_tx`].includes(t)||(x(t,`_util`)?n[t]={capacity:o(e.node[t].capacity)||100,current:o(e.node[t].current),ratio:o(e.node[t].current)/100||0}:t.includes(`_mem`)&&(n[t]={capacity:o(e.node[t].capacity),current:o(e.node[t].current),ratio:o(e.node[t].pct)/100||0}))});let i=Te(r(n.mem_util.capacity),`auto`)?.unit||`g`,a;t[6]===Symbol.for(`react.memo_cache_sentinel`)?(a={minWidth:200,width:`100%`},t[6]=a):a=t[6];let d=s.cpu?.human_readable_name,p;t[7]===d?p=t[8]:(p=(0,z.jsx)(k,{children:d}),t[7]=d,t[8]=p);let m=n.cpu_util.ratio*100,h=N(o(n.cpu_util.ratio*100),1)+` %`,g;t[9]!==m||t[10]!==h?(g=(0,z.jsx)(P,{percent:m,width:120,valueLabel:h}),t[9]=m,t[10]=h,t[11]=g):g=t[11];let y;t[12]!==p||t[13]!==g?(y=(0,z.jsxs)(j,{justify:`between`,style:a,"data-testid":`live-stat-cpu`,children:[p,g]}),t[12]=p,t[13]=g,t[14]=y):y=t[14];let b;t[15]===Symbol.for(`react.memo_cache_sentinel`)?(b={minWidth:200,width:`100%`},t[15]=b):b=t[15];let S=s.mem?.human_readable_name,C;t[16]===S?C=t[17]:(C=(0,z.jsx)(k,{children:S}),t[16]=S,t[17]=C);let T=n.mem_util.ratio*100,E=M(r(n.mem_util.current),i)?.numberFixed+` / `+M(r(n.mem_util.capacity),i)?.displayValue,D;t[18]!==T||t[19]!==E?(D=(0,z.jsx)(P,{percent:T,width:120,valueLabel:E}),t[18]=T,t[19]=E,t[20]=D):D=t[20];let O;t[21]!==C||t[22]!==D?(O=(0,z.jsxs)(j,{justify:`between`,style:b,"data-testid":`live-stat-mem`,children:[C,D]}),t[21]=C,t[22]=D,t[23]=O):O=t[23],c=(0,z.jsxs)(j,{direction:`column`,gap:`xxs`,children:[y,O,v(f(e?.node),t=>{if(![`cpu_util`,`mem`,`disk`].includes(t)){if(x(t,`_util`)){let e=w(t,`_`)[0]+`.device`;return(0,z.jsxs)(j,{justify:`between`,style:{minWidth:200,width:`100%`},gap:`xxs`,"data-testid":`live-stat-${t}`,children:[(0,z.jsxs)(k,{children:[s[e]?.human_readable_name,`(util)`]}),(0,z.jsx)(P,{width:120,percent:n[t].current/n[t].capacity*100||0,valueLabel:o(N(n[t].ratio*100,1))+` %`})]},t)}if(x(t,`_mem`)){let e=w(t,`_`)[0]+`.device`,i=Te(r(n[t].capacity),`auto`)?.unit||`g`;return(0,z.jsxs)(j,{justify:`between`,style:{minWidth:200,width:`100%`},gap:`xxs`,"data-testid":`live-stat-${t}`,children:[(0,z.jsxs)(k,{children:[s[e]?.human_readable_name,`(mem)`]}),(0,z.jsx)(P,{width:120,percent:n[t].current/n[t].capacity*100||0,valueLabel:M(r(n[t].current),i)?.numberFixed+` / `+M(r(n[t].capacity),i)?.displayValue})]},t)}if(x(t,`_power`)){let n=w(t,`_`).slice(0,-1).join(`-`)+`.device`,r=s[n]?.human_readable_name;return(0,z.jsxs)(j,{justify:`between`,style:{minWidth:200,width:`100%`},gap:`xxs`,"data-testid":`live-stat-${t}`,children:[(0,z.jsx)(A,{children:`${r}(power)`}),(0,z.jsx)(A,{children:`${N(e.node[t]?.current,2)} ${e.node[t].unit_hint}`})]},t)}if(x(t,`_temperature`)){let n=w(t,`_`).slice(0,-1).join(`_`)+`.device`,r=s[n]?.human_readable_name;return(0,z.jsxs)(j,{justify:`between`,style:{minWidth:200,width:`100%`},gap:`xxs`,"data-testid":`live-stat-${t}`,children:[(0,z.jsx)(A,{children:`${r}(temp)`}),(0,z.jsx)(A,{children:`${N(e.node[t]?.current,2)} °C`})]},t)}if(x([`net_rx`,`net_tx`],t)){let n=Ee(e.node[t]?.current,`auto`);return(0,z.jsxs)(j,{justify:`between`,style:{minWidth:200,width:`100%`},gap:`xxs`,"data-testid":`live-stat-${t}`,children:[(0,z.jsx)(A,{children:t===`net_rx`?`Net Rx`:`Net Tx`}),(0,z.jsx)(A,{children:`${n?.numberFixed??0} ${n?.unit.toUpperCase()??``}bps`})]},t)}return(0,z.jsxs)(j,{justify:`between`,style:{minWidth:200,width:`100%`},gap:`xxs`,"data-testid":`live-stat-${t}`,children:[(0,z.jsx)(A,{children:t}),(0,z.jsx)(A,{children:`${N(e.node[t]?.current??0,2)}${e.node[t]?.unit_hint?` ${e.node[t].unit_hint}`:``}`})]},t)}})]});break bb0}{let e;t[24]===a?e=t[25]:(e=a(`comp:AgentTable.NoAvailableLiveStat`),t[24]=a,t[25]=e);let n;t[26]===e?n=t[27]:(n=(0,z.jsx)(z.Fragment,{children:e}),t[26]=e,t[27]=n),c=n;break bb0}}t[0]=s,t[1]=i?.available_slots,t[2]=i?.status,t[3]=a,t[4]=n,t[5]=c}else c=t[5];if(c!==Symbol.for(`react.early_return_sentinel`))return c},dt=e=>{"use memo";let t=(0,R.c)(3),{record:n}=e,{token:r}=pe(),i;if(t[0]!==n?.live_stat||t[1]!==r){let e=JSON.parse(n?.live_stat||`{}`)?.node?.disk??{},a=o(e.pct)||0,s=o(N(a,2)),c=r(s>80?`--color-error`:`--color-success`),l=Te(e?.capacity,`auto`,{base:1e3})?.unit||`g`;i=(0,z.jsxs)(j,{direction:`column`,align:`end`,children:[(0,z.jsx)(P,{valueLabel:N(s,1)+` %`,percent:s,strokeColor:c,width:120}),!S(e)&&(0,z.jsxs)(k,{style:{fontSize:r(`--font-size-sm`)},children:[Ee(e?.current,l)?.numberFixed,`\xA0/\xA0`,Ee(e?.capacity,l)?.displayValue]})]}),t[0]=n?.live_stat,t[1]=r,t[2]=i}else i=t[2];return i},ft=e=>{"use memo";let t=(0,R.c)(15),{value:n,record:r}=e,i;t[0]===r?.compute_plugins?i=t[1]:(i=JSON.parse(r?.compute_plugins||`{}`),t[0]=r?.compute_plugins,t[1]=i);let a=i,o;if(t[2]!==a?.cuda||t[3]!==r?.available_slots||t[4]!==r?.version||t[5]!==n){let e=JSON.parse(r?.available_slots||`{}`),i;t[7]===Symbol.for(`react.memo_cache_sentinel`)?(i={label:`Agent`},t[7]=i):i=t[7];let s=r?.version||``,c;t[8]===n?c=t[9]:(c=Ce(`agent`,n),t[8]=n,t[9]=c);let l;t[10]!==s||t[11]!==c?(l=(0,z.jsx)(Pe,{values:[i,{label:s,variant:c}]}),t[10]=s,t[11]=c,t[12]=l):l=t[12];let u;t[13]===n?u=t[14]:(u=n&&n!==`ALIVE`?(0,z.jsx)(Oe,{variant:Ce(`agent`,n),label:n}):null,t[13]=n,t[14]=u),o=(0,z.jsxs)(j,{direction:`column`,gap:`xxs`,align:`start`,children:[l,u,a?.cuda?(0,z.jsxs)(z.Fragment,{children:[a?.cuda?.cuda_version?(0,z.jsx)(Ie,{values:[{label:`CUDA`},{label:a?.cuda?.cuda_version,color:`green`}]}):(0,z.jsx)(Me,{color:`green`,label:`CUDA Disabled`}),(0,z.jsx)(Ie,{values:[{label:`CUDA Plugin`},{label:a?.cuda?.version,color:`blue`}]}),x(f(e),`cuda.shares`)?(0,z.jsx)(Me,{color:`blue`,label:`Fractional GPU™`}):null]}):null]}),t[2]=a?.cuda,t[3]=r?.available_slots,t[4]=r?.version,t[5]=n,t[6]=o}else o=t[6];return o},pt=e=>{"use memo";let t=(0,R.c)(32),n,r,i,a,o;t[0]===e?(n=t[1],r=t[2],i=t[3],a=t[4],o=t[5]):({agentsFragment:n,onClickAgentName:a,onChangeOrder:i,customizeColumns:r,...o}=e,t[0]=e,t[1]=n,t[2]=r,t[3]=i,t[4]=a,t[5]=o);let{t:s}=ie(),{token:c}=pe(),l=m(),u=(0,ct.useFragment)($e,n),d;t[6]===s?d=t[7]:(d=s(`comp:AgentTable.Endpoint`),t[6]=s,t[7]=d);let f;t[8]===d?f=t[9]:(f=(0,z.jsxs)(z.Fragment,{children:[`ID / `,d]}),t[8]=d,t[9]=f);let p;t[10]===a?p=t[11]:(p=(e,t)=>(0,z.jsxs)(j,{direction:`column`,align:`start`,children:[a?(0,z.jsx)(Re,{type:`hover`,onClick:()=>{a(t)},children:e}):(0,z.jsx)(k,{children:e}),(0,z.jsx)(k,{color:`secondary`,children:t?.addr})]}),t[10]=a,t[11]=p);let h;if(t[12]!==l||t[13]!==r||t[14]!==s||t[15]!==f||t[16]!==p||t[17]!==c){let e;t[19]!==l||t[20]!==s?(e=(e,t)=>(0,z.jsxs)(j,{direction:`column`,align:`start`,children:[(0,z.jsx)(k,{children:(0,st.default)(e).format(`ll LTS`)}),t?.status===`ALIVE`&&(0,z.jsx)(Be,{callback:()=>l.utils.elapsedTime(e,Date.now()),delay:1e3,render:e=>(0,z.jsx)(Pe,{values:[{label:s(`comp:AgentTable.Running`)},{label:e}]})})]}),t[19]=l,t[20]=s,t[21]=e):e=t[21];let n;t[22]===c?n=t[23]:(n=e=>(0,z.jsx)(j,{justify:`center`,children:e===!0?(0,z.jsx)(le,{style:{color:c(`--color-success`),fontSize:c(`--font-size-xl`)},size:`1em`}):(0,z.jsx)(de,{style:{color:c(`--color-text-disabled`),fontSize:c(`--font-size-xl`)},size:`1em`})}),t[22]=c,t[23]=n);let i=[{title:f,key:`row_id`,dataIndex:`row_id`,fixed:`left`,render:p,sortKey:`id`,sorter:V(`id`)},{title:s(`comp:AgentTable.Region`),key:`region`,dataIndex:`region`,sorter:V(`region`)},{title:s(`comp:AgentTable.Architecture`),key:`architecture`,dataIndex:`architecture`,sorter:V(`architecture`)},{title:s(`comp:AgentTable.Version`),key:`version`,dataIndex:`version`,defaultHidden:!0,sorter:V(`version`)},{title:s(`comp:AgentTable.Starts`),key:`first_contact`,dataIndex:`first_contact`,render:e,sorter:V(`first_contact`)},{title:s(`comp:AgentTable.LostAt`),key:`lost_at`,dataIndex:`lost_at`,defaultHidden:!0,render:tt,sorter:V(`lost_at`)},{title:s(`comp:AgentTable.Allocation`),key:`allocated_resources`,render:nt},{title:s(`comp:AgentTable.Utilization`),key:`live_stat`,dataIndex:`live_stat`,render:rt},{title:s(`comp:AgentTable.DiskPerc`),key:`disk_pct`,render:it},{title:s(`comp:AgentTable.ResourceGroup`),key:`scaling_group`,dataIndex:`scaling_group`,sorter:V(`scaling_group`)},{title:s(`comp:AgentTable.Status`),key:`status`,dataIndex:`status`,render:at,sorter:V(`status`)},{title:s(`comp:AgentTable.Schedulable`),key:`schedulable`,dataIndex:`schedulable`,render:n,sorter:V(`schedulable`)}];h=r?r(i):i,t[12]=l,t[13]=r,t[14]=s,t[15]=f,t[16]=p,t[17]=c,t[18]=h}else h=t[18];let g=h,_;t[24]===Symbol.for(`react.memo_cache_sentinel`)?(_={x:`max-content`},t[24]=_):_=t[24];let v;t[25]===i?v=t[26]:(v=e=>{i?.(e||null)},t[25]=i,t[26]=v);let y;return t[27]!==u||t[28]!==g||t[29]!==v||t[30]!==o?(y=(0,z.jsx)(Ue,{scroll:_,...o,rowKey:ot,dataSource:u,columns:g,onChangeOrder:v}),t[27]=u,t[28]=g,t[29]=v,t[30]=o,t[31]=y):y=t[31],y}})))()}var ht;function gt(){return(gt=t((()=>{ht=(function(){var e=[{kind:`Literal`,name:`first`,value:100},{kind:`Literal`,name:`offset`,value:0}],t={alias:null,args:null,kind:`ScalarField`,name:`count`,storageKey:null};return{fragment:{argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAIAgentTableStoriesQuery`,selections:[{alias:null,args:e,concreteType:`AgentConnection`,kind:`LinkedField`,name:`agent_nodes`,plural:!1,selections:[{alias:null,args:null,concreteType:`AgentEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`AgentNode`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{args:null,kind:`FragmentSpread`,name:`BAIAgentTableFragment`}],storageKey:null}],storageKey:null},t],storageKey:`agent_nodes(first:100,offset:0)`}],type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[],kind:`Operation`,name:`BAIAgentTableStoriesQuery`,selections:[{alias:null,args:e,concreteType:`AgentConnection`,kind:`LinkedField`,name:`agent_nodes`,plural:!1,selections:[{alias:null,args:null,concreteType:`AgentEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`AgentNode`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`row_id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`addr`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`region`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`architecture`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`first_contact`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`occupied_slots`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`available_slots`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`live_stat`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`status`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`scaling_group`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`compute_plugins`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`version`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`schedulable`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`lost_at`,storageKey:null}],storageKey:null}],storageKey:null},t],storageKey:`agent_nodes(first:100,offset:0)`}]},params:{cacheID:`d411b518001a19dfaef437faaefa9a68`,id:null,metadata:{},name:`BAIAgentTableStoriesQuery`,operationKind:`query`,text:`query BAIAgentTableStoriesQuery {
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
`}}})(),ht.hash=`c18fa3690ef39135a96d3bbca6af1bdf`})))()}var U,_t,W,vt,yt,bt,G,K,q,J,Y,X,Z,Q,$,xt;function St(){return(St=t((()=>{gt(),Je(),We(),ke(),ve(),ne(),mt(),U=n(),_t=Se(),W=re(),{mockClientPromise:vt,mockAnonymousClientFactory:yt}=qe(),bt={title:`Fragments/BAIAgentTable`,component:pt,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:"\n**BAIAgentTable** is a specialized table component for displaying Backend.AI agent information with Relay GraphQL integration.\n\n## BAI-Specific Props\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `agentsFragment` | `BAIAgentTableFragment$key` | - | GraphQL fragment reference (required) |\n| `onClickAgentName` | `(agent: AgentNodeInList) => void` | - | Callback when agent name is clicked |\n| `onChangeOrder` | `(order: string \\| undefined) => void` | - | Callback for sorting with typed order values |\n| `customizeColumns` | `(baseColumns: BAIColumnType[]) => BAIColumnType[]` | - | Function to customize table columns |\n\n## Available Sorter Keys\n- `id` (the ID column renders `row_id` but the server orders by `id`)\n- `first_contact`\n- `scaling_group`\n- `status`\n- `schedulable`\n- `region`\n- `version`\n- `lost_at`\n\nUse with prefix `-` for descending order (e.g., `'-first_contact'`).\nThe list mirrors `_queryorder_colmap` of the graphene `agent_nodes` resolver.\n\n## Pre-configured Columns\n- **ID / Endpoint**: Agent row ID and address\n- **Region**: Agent region\n- **Architecture**: CPU architecture (no server order key, so not sortable)\n- **Version**: Agent version — `defaultHidden`; the status cell already prints it, so the column exists to make the `version` ordering reachable\n- **Starts**: First contact time and running duration\n- **Lost At**: When the agent was lost — `defaultHidden`; only meaningful on terminated agents, and makes the `lost_at` ordering reachable\n- **Allocation**: Resource allocation (CPU, memory, GPU, etc.) with progress bars\n- **Utilization**: Live resource utilization statistics\n- **Disk %**: Disk usage percentage\n- **Resource Group**: Scaling group name\n- **Status**: Agent status, CUDA version, plugin info\n- **Schedulable**: Whether agent can schedule new sessions\n\nHidden-by-default columns are opt-in through the table's column settings.\n\n## Customizing Columns\n`customizeColumns` receives the base array and its return value is used verbatim.\nMatch entries on `column.key`, never by index — the base list grows, and an index\nslice silently drops whichever column moved into the gap.\n\nFor other props (loading, pagination, etc.), refer to [BAITable](?path=/docs/table-baitable--docs).\n        "}}},argTypes:{agentsFragment:{control:!1,description:`GraphQL fragment reference for agent data`,table:{type:{summary:`BAIAgentTableFragment$key`}}},onClickAgentName:{action:`agent-name-clicked`,description:`Callback when agent name is clicked`,table:{type:{summary:`(agent: AgentNodeInList) => void`}}},onChangeOrder:{action:`order-changed`,description:`Callback for sorting with typed order values`,table:{type:{summary:`(order: string | undefined) => void`}}},customizeColumns:{control:!1,description:`Function to customize table columns`,table:{type:{summary:`(baseColumns: BAIColumnType[]) => BAIColumnType[]`}}}},decorators:[(e,t)=>{let n=t.globals.locale||`en`,r=Ke[n]||Ke.en;return(0,W.jsx)(_e,{locale:r,clientPromise:vt,anonymousClientFactory:yt,children:(0,W.jsx)(ee,{deviceMetaData:Ge,children:(0,W.jsx)(e,{})})})}]},G=({onClickAgentName:e,onChangeOrder:t,customizeColumns:n,loading:r,order:i})=>{let{agent_nodes:a}=(0,_t.useLazyLoadQuery)(ht,{}),o=a?.edges.map(e=>e?.node).filter(e=>!!e)??[];return(0,W.jsx)(pt,{agentsFragment:o,onClickAgentName:e,onChangeOrder:t,customizeColumns:n,loading:r,order:i,pagination:{total:a?.count??0,pageSize:10}})},K=(e,t={})=>({id:`agent-${e}`,row_id:`agent-00${e}`,addr:`192.168.1.${100+e}:6001`,region:e%2==0?`us-west-2`:`us-east-1`,architecture:`x86_64`,first_contact:new Date(Date.now()-e*24*60*60*1e3).toISOString(),occupied_slots:JSON.stringify({cpu:`4`,mem:`8589934592`,"cuda.device":`1`}),available_slots:JSON.stringify({cpu:`16`,mem:`34359738368`,"cuda.device":`2`,"cuda.shares":`2.0`}),live_stat:JSON.stringify({node:{cpu_util:{current:25.5+e*5,capacity:100,pct:25.5+e*5},mem:{current:`8589934592`,capacity:`34359738368`,pct:`25`},disk:{current:`107374182400`,capacity:`536870912000`,pct:`20`},net_rx:{current:`1048576`},net_tx:{current:`524288`},cuda_util:{current:`50`,capacity:`100`},cuda_mem:{current:`4294967296`,capacity:`8589934592`,pct:`50`}},devices:{cpu_util:{0:25.5,1:30,2:20,3:28.5}}}),status:`ALIVE`,scaling_group:`default`,compute_plugins:JSON.stringify({cuda:{version:`12.0.1`,cuda_version:`12.0`}}),version:`24.03.0`,schedulable:!0,lost_at:null,...t}),q={name:`Basic`,parameters:{docs:{description:{story:`Basic agent table displaying multiple agents with their resource allocations, utilization, and status.`}}},render:e=>(0,W.jsx)(F,{mockResolvers:{Query:()=>({agent_nodes:{edges:[{node:K(1)},{node:K(2,{status:`TERMINATED`})},{node:K(3)},{node:K(4,{schedulable:!1})},{node:K(5)}],count:5}})},children:(0,W.jsx)(G,{...e})})},J={name:`ClickableAgentNames`,parameters:{docs:{description:{story:`Demonstrates clickable agent names. Click on any agent ID to trigger the callback.`}}},render:()=>{let[e,t]=(0,U.useState)(null);return(0,W.jsxs)(`div`,{children:[(0,W.jsxs)(`div`,{style:{marginBottom:16},children:[(0,W.jsx)(`strong`,{children:`Selected Agent:`}),` `,e?e.row_id:`None`]}),(0,W.jsx)(F,{mockResolvers:{Query:()=>({agent_nodes:{edges:[{node:K(1)},{node:K(2)},{node:K(3)}],count:3}})},children:(0,W.jsx)(G,{onClickAgentName:e=>{t(e)}})})]})}},Y={name:`CustomColumns`,parameters:{docs:{description:{story:`Demonstrates column customization by adding an actions column at the beginning of the table.`}}},render:()=>(0,W.jsx)(F,{mockResolvers:{Query:()=>({agent_nodes:{edges:[{node:K(1)},{node:K(2)},{node:K(3)}],count:3}})},children:(0,W.jsx)(G,{customizeColumns:e=>[{key:`actions`,title:`Actions`,fixed:`left`,width:100,render:(e,t)=>(0,W.jsx)(Ae,{size:`small`,onClick:()=>alert(`Managing agent: ${t.row_id}`),children:`Manage`})},...e]})})},X={name:`LoadingState`,parameters:{docs:{description:{story:`Shows the agent table in a loading state with reduced opacity.`}}},render:()=>(0,W.jsx)(F,{mockResolvers:{Query:()=>({agent_nodes:{edges:[{node:K(1)},{node:K(2)}],count:2}})},children:(0,W.jsx)(G,{loading:!0})})},Z={name:`EmptyState`,parameters:{docs:{description:{story:`Shows the agent table when no agents are available.`}}},render:()=>(0,W.jsx)(F,{mockResolvers:{Query:()=>({agent_nodes:{edges:[],count:0}})},children:(0,W.jsx)(G,{})})},Q={name:`DifferentStatuses`,parameters:{docs:{description:{story:`Displays agents with different statuses to show how the table renders each state.`}}},render:()=>(0,W.jsx)(F,{mockResolvers:{Query:()=>({agent_nodes:{edges:[{node:K(1,{status:`ALIVE`,schedulable:!0})},{node:K(2,{status:`TERMINATED`,schedulable:!1})},{node:K(3,{status:`ALIVE`,schedulable:!1})},{node:K(4,{status:`LOST`,schedulable:!1})}],count:4}})},children:(0,W.jsx)(G,{})})},$={name:`RealWorldUsage`,parameters:{docs:{description:{story:`Demonstrates a realistic use case combining clickable agent names, sorting, and custom columns.`}}},render:()=>{let[e,t]=(0,U.useState)(null),[n,r]=(0,U.useState)(`-first_contact`);return(0,W.jsxs)(`div`,{children:[(0,W.jsxs)(`div`,{style:{marginBottom:16,padding:12,background:`#f5f5f5`,borderRadius:4},children:[(0,W.jsxs)(`div`,{children:[(0,W.jsx)(`strong`,{children:`Selected Agent:`}),` `,e?e.row_id:`None`]}),(0,W.jsxs)(`div`,{children:[(0,W.jsx)(`strong`,{children:`Sort Order:`}),` `,n||`None`]})]}),(0,W.jsx)(F,{mockResolvers:{Query:()=>({agent_nodes:{edges:[{node:K(1)},{node:K(2,{status:`TERMINATED`})},{node:K(3)},{node:K(4,{schedulable:!1})},{node:K(5)},{node:K(6)}],count:6}})},children:(0,W.jsx)(G,{order:n,onClickAgentName:e=>t(e),onChangeOrder:e=>r(e),customizeColumns:e=>[{key:`actions`,title:`Actions`,fixed:`left`,width:100,render:(e,n)=>(0,W.jsx)(Ae,{size:`small`,type:`link`,onClick:()=>t(n),children:`Select`})},...e]})})]})}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
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
}`,...q.parameters?.docs?.source},description:{story:`Basic agent table with mock data showing various agent states and configurations.`,...q.parameters?.docs?.description}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
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
}`,...J.parameters?.docs?.source},description:{story:`Agent table with clickable agent names. Click on any agent ID to see the callback in action.`,...J.parameters?.docs?.description}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
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
}`,...Y.parameters?.docs?.source},description:{story:"Agent table with custom column configuration using the `customizeColumns` pattern.",...Y.parameters?.docs?.description}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
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
}`,...X.parameters?.docs?.source},description:{story:`Agent table in loading state.`,...X.parameters?.docs?.description}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
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
}`,...Z.parameters?.docs?.source},description:{story:`Agent table with no agents (empty state).`,...Z.parameters?.docs?.description}}},Q.parameters={...Q.parameters,docs:{...Q.parameters?.docs,source:{originalSource:`{
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
}`,...Q.parameters?.docs?.source},description:{story:`Agent table showing different agent statuses (ALIVE, TERMINATED, etc.).`,...Q.parameters?.docs?.description}}},$.parameters={...$.parameters,docs:{...$.parameters?.docs,source:{originalSource:`{
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
}`,...$.parameters?.docs?.source},description:{story:`Real-world example combining multiple features.`,...$.parameters?.docs?.description}}},xt=[`Default`,`WithClickableAgentNames`,`WithCustomColumns`,`Loading`,`Empty`,`DifferentStatuses`,`RealWorldExample`]})))()}St();export{q as Default,Q as DifferentStatuses,Z as Empty,X as Loading,$ as RealWorldExample,J as WithClickableAgentNames,Y as WithCustomColumns,xt as __namedExportsOrder,bt as default};