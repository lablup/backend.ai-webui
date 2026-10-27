import{a as e,n as t}from"./rolldown-runtime-sJBDdmOt.js";import{t as n}from"./react-D0Ex1IVc.js";import{n as r,t as i}from"./toString-DisgP18h.js";import{i as a,n as o,r as s,t as c}from"./toFinite-h-2-9ZQn.js";import{n as l,t as u}from"./toInteger-CZy_sk2Z.js";import{_ as d,v as f}from"./_Uint8Array-Cb-jzVD9.js";import{A as p,j as m,k as h,t as g}from"./hooks-C37w8Ol6.js";import{n as _,t as v}from"./forEach-D-EZKVpC.js";import{n as y,t as b}from"./map-CLZMgxwS.js";import{n as x,t as S}from"./includes-wS99WMPj.js";import{n as C,t as w}from"./isEmpty-SRC6Jtfi.js";import{n as T,t as E}from"./split-BrWwcC2A.js";import{a as D,i as O,n as ee,o as te,r as ne,s as re}from"./BAIResourceNumberWithIcon-DJ0kDeg2.js";import{t as ie}from"./jsx-runtime-MKhVqBIO.js";import{n as ae,t as oe}from"./useBAIi18n-Biey1teG.js";import{t as se}from"./dayjs.min-D7GtMU8l.js";import{t as ce}from"./compiler-runtime-CdReTaax.js";import{n as le,r as ue}from"./useTheme-Br6nszEH.js";import{n as de,t as fe}from"./createLucideIcon-R1KMo-hV.js";import{n as pe,t as me}from"./circle-check-B5h9rKkc.js";import{n as he,t as k}from"./Text-Rtk9ZYap.js";import{h as ge,m as A,o as _e,s as ve}from"./iframe-BF4Nk2qQ.js";import{n as ye,t as j}from"./BAIFlex-BOFoS5KY.js";import{n as be,t as xe}from"./BAIAlertIconWithTooltip-CKa6868j.js";import{t as Se}from"./react-relay-sBALIJlt.js";import{t as Ce}from"./astryxTagVariant-0xB0K5Rk.js";import{c as we,i as Te,n as M,p as N,r as Ee}from"./helper-CPPrFJ2v.js";import{n as De,t as Oe}from"./BAIButton-BCdRP02k.js";import{n as ke,t as Ae}from"./Token-B3CV8z6f.js";import{n as je,t as Me}from"./BAIDoubleBadge-Dhbgsyxd.js";import{n as Ne,t as Pe}from"./BAIDoubleToken-DaAQBmVs.js";import{n as Fe,t as Ie}from"./BAILink-wVbYRKSR.js";import{n as Le,t as Re}from"./BAIIntervalView-DCvE4Ys-.js";import{n as ze,t as P}from"./BAIProgressWithLabel-B2WvSOjQ.js";import{n as Be,t as Ve}from"./BAITable-BYZKAaal.js";import{n as He,o as Ue,r as We,t as Ge}from"./storybook-mock-utils-BqLAdkd_.js";import{n as Ke,t as F}from"./RelayResolver-CMrgwoPg.js";var qe,Je;function Ye(){return(Ye=t((()=>{de(),qe=[[`circle`,{cx:`12`,cy:`12`,r:`10`,key:`1mglay`}],[`path`,{d:`M8 12h8`,key:`1wcyev`}]],Je=fe(`circle-minus`,qe)})))()}function Xe(e=[],t=[]){return e.length!==t.length||e.some((e,n)=>!Object.is(e,t[n]))}var I,Ze,L,Qe;function $e(){return($e=t((()=>{I=n(),Ze=(0,I.createContext)(null),L={didCatch:!1,error:null},Qe=class extends I.Component{constructor(e){super(e),this.resetErrorBoundary=this.resetErrorBoundary.bind(this),this.state=L}static getDerivedStateFromError(e){return{didCatch:!0,error:e}}resetErrorBoundary(...e){let{error:t}=this.state;t!==null&&(this.props.onReset?.({args:e,reason:`imperative-api`}),this.setState(L))}componentDidCatch(e,t){this.props.onError?.(e,t)}componentDidUpdate(e,t){let{didCatch:n}=this.state,{resetKeys:r}=this.props;n&&t.error!==null&&Xe(e.resetKeys,r)&&(this.props.onReset?.({next:r,prev:e.resetKeys,reason:`keys`}),this.setState(L))}render(){let{children:e,fallbackRender:t,FallbackComponent:n,fallback:r}=this.props,{didCatch:i,error:a}=this.state,o=e;if(i){let e={error:a,resetErrorBoundary:this.resetErrorBoundary};if(typeof t==`function`)o=t(e);else if(n)o=(0,I.createElement)(n,e);else if(r!==void 0)o=r;else throw a}return(0,I.createElement)(Ze.Provider,{value:{didCatch:i,error:a,resetErrorBoundary:this.resetErrorBoundary}},o)}}})))()}var et;function tt(){return(tt=t((()=>{et={argumentDefinitions:[],kind:`Fragment`,metadata:{plural:!0},name:`BAIAgentTableFragment`,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`row_id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`addr`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`region`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`architecture`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`first_contact`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`occupied_slots`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`available_slots`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`live_stat`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`status`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`scaling_group`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`compute_plugins`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`version`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`schedulable`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`lost_at`,storageKey:null}],type:`AgentNode`,abstractKey:null},et.hash=`73cb32c95a2360f7165430aa991c1b7d`})))()}function nt(e){return(0,z.jsx)(k,{children:e?(0,ct.default)(e).format(`ll LTS`):`-`})}function rt(e,t){return(0,z.jsx)(H,{resetKeys:[t?.occupied_slots,t?.available_slots],children:(0,z.jsx)(ut,{record:t})})}function it(e,t){return(0,z.jsx)(H,{resetKeys:[e,t?.available_slots],children:(0,z.jsx)(dt,{value:e,record:t})})}function at(e,t){return(0,z.jsx)(H,{resetKeys:[t?.live_stat],children:(0,z.jsx)(ft,{record:t})})}function ot(e,t){return(0,z.jsx)(H,{resetKeys:[e,t?.compute_plugins,t?.available_slots],children:(0,z.jsx)(pt,{value:e,record:t})})}function st(e){return e.id}var R,ct,lt,z,B,V,H,ut,dt,ft,pt,mt;function ht(){return(ht=t((()=>{tt(),R=ce(),we(),g(),oe(),be(),je(),Ne(),ye(),Le(),Fe(),ze(),ne(),ge(),Be(),O(),p(),he(),ke(),le(),ct=e(se(),1),x(),b(),c(),s(),d(),u(),_(),i(),E(),w(),pe(),Ye(),$e(),lt=Se(),z=ie(),B=[`id`,`first_contact`,`scaling_group`,`status`,`schedulable`,`region`,`version`,`lost_at`],[...B,...B.map(e=>`-${e}`)],V=e=>S(B,e),H=e=>{"use memo";let t=(0,R.c)(12),n,r;t[0]===e?(n=t[1],r=t[2]):({children:n,...r}=e,t[0]=e,t[1]=n,t[2]=r);let{t:i}=ae(),{logger:a}=h(),o;t[3]===a?o=t[4]:(o=(e,t)=>a.error(`[BAIAgentTable] Cell render failed:`,e,t.componentStack),t[3]=a,t[4]=o);let s;t[5]===i?s=t[6]:(s=()=>(0,z.jsx)(xe,{type:`error`,title:i(`comp:AgentTable.FailedToLoadCellData`)}),t[5]=i,t[6]=s);let c;return t[7]!==n||t[8]!==r||t[9]!==o||t[10]!==s?(c=(0,z.jsx)(Qe,{onError:o,fallbackRender:s,...r,children:n}),t[7]=n,t[8]=r,t[9]=o,t[10]=s,t[11]=c):c=t[11],c},ut=e=>{"use memo";let t=(0,R.c)(13),{record:n}=e,{token:r}=ue(),{mergedResourceSlots:i}=D(),s,c,l,u;if(t[0]!==i||t[1]!==n?.available_slots||t[2]!==n?.occupied_slots||t[3]!==r){let e=JSON.parse(n?.occupied_slots||`{}`),d=JSON.parse(n?.available_slots||`{}`);s=j,c=`column`,l=`xxs`,u=y(d,(t,n)=>{if(n===`cpu`){let t=o(a(e.cpu)/a(d.cpu)*100);return(0,z.jsxs)(j,{justify:`between`,style:{width:`100%`},gap:`xs`,children:[(0,z.jsxs)(j,{gap:`xxs`,children:[(0,z.jsx)(ee,{type:n},n),(0,z.jsxs)(k,{children:[N(e.cpu||0,0),`\xA0/\xA0`,N(d.cpu||0,0)]}),(0,z.jsx)(k,{color:`secondary`,style:{fontSize:r(`--spacing-2`)},children:i.cpu?.display_unit})]}),(0,z.jsx)(P,{percent:t,strokeColor:r(t>80?`--color-error`:`--color-success`),width:120,valueLabel:N(t,1)+` %`})]},n)}if(n===`mem`){let t=o(a(e.mem)/a(d.mem)*100);return(0,z.jsxs)(j,{justify:`between`,style:{width:`100%`},gap:`xs`,children:[(0,z.jsxs)(j,{gap:`xxs`,children:[(0,z.jsx)(ee,{type:`mem`}),(0,z.jsxs)(k,{children:[M(e.mem,`g`,0)?.numberFixed??0,`\xA0/\xA0`,M(d.mem,`g`,0)?.numberFixed??0]}),(0,z.jsx)(k,{color:`secondary`,style:{fontSize:r(`--spacing-2`)},children:`GiB`})]}),(0,z.jsx)(P,{percent:t,strokeColor:r(t>80?`--color-error`:`--color-success`),width:120,valueLabel:N(t,1)+` %`})]},`mem`)}if(d[n]){let t=o(a(e[n])/a(d[n])*100);return(0,z.jsxs)(j,{justify:`between`,gap:`xs`,style:{width:`100%`},children:[(0,z.jsxs)(j,{gap:`xxs`,children:[(0,z.jsx)(ee,{type:n},n),(0,z.jsxs)(k,{children:[N(e[n]||0,2),`\xA0/\xA0`,N(d[n],2)]}),(0,z.jsx)(k,{color:`secondary`,style:{fontSize:r(`--spacing-2`)},children:i[n]?.display_unit})]}),(0,z.jsx)(P,{percent:t,strokeColor:r(t>80?`--color-error`:`--color-success`),width:120,valueLabel:N(t,1)+` %`})]},n)}}),t[0]=i,t[1]=n?.available_slots,t[2]=n?.occupied_slots,t[3]=r,t[4]=s,t[5]=c,t[6]=l,t[7]=u}else s=t[4],c=t[5],l=t[6],u=t[7];let d;return t[8]!==s||t[9]!==c||t[10]!==l||t[11]!==u?(d=(0,z.jsx)(s,{direction:c,gap:l,children:u}),t[8]=s,t[9]=c,t[10]=l,t[11]=u,t[12]=d):d=t[12],d},dt=e=>{"use memo";let t=(0,R.c)(28),{value:n,record:i}=e,{t:a}=ae(),{mergedResourceSlots:s}=D(),c;if(t[0]!==s||t[1]!==i?.available_slots||t[2]!==i?.status||t[3]!==a||t[4]!==n){c=Symbol.for(`react.early_return_sentinel`);bb0:{let e=JSON.parse(n||`{}`),u=JSON.parse(i?.available_slots||`{}`);if(i?.status===`ALIVE`){let n={cpu_util:{capacity:0,current:0,ratio:0},mem_util:{capacity:0,current:0,ratio:0}};if(e&&e.node&&e.devices){let t=f(e.devices.cpu_util).length;n.cpu_util.capacity=o(e.node.cpu_util.capacity),n.cpu_util.current=o(e.node.cpu_util.current),n.cpu_util.ratio=Math.min(o(e.node.cpu_util.pct)/100/(t||1),1),n.mem_util.capacity=l(u.mem||e.node.mem.capacity),n.mem_util.current=l(e.node.mem.current),n.mem_util.ratio=n.mem_util.current/n.mem_util.capacity||0}v(f(e?.node),t=>{[`cpu_util`,`mem`,`disk`,`net_rx`,`net_tx`].includes(t)||(S(t,`_util`)?n[t]={capacity:o(e.node[t].capacity)||100,current:o(e.node[t].current),ratio:o(e.node[t].current)/100||0}:t.includes(`_mem`)&&(n[t]={capacity:o(e.node[t].capacity),current:o(e.node[t].current),ratio:o(e.node[t].pct)/100||0}))});let i=Te(r(n.mem_util.capacity),`auto`)?.unit||`g`,a;t[6]===Symbol.for(`react.memo_cache_sentinel`)?(a={minWidth:200,width:`100%`},t[6]=a):a=t[6];let d=s.cpu?.human_readable_name,p;t[7]===d?p=t[8]:(p=(0,z.jsx)(k,{children:d}),t[7]=d,t[8]=p);let m=n.cpu_util.ratio*100,h=N(o(n.cpu_util.ratio*100),1)+` %`,g;t[9]!==m||t[10]!==h?(g=(0,z.jsx)(P,{percent:m,width:120,valueLabel:h}),t[9]=m,t[10]=h,t[11]=g):g=t[11];let _;t[12]!==p||t[13]!==g?(_=(0,z.jsxs)(j,{justify:`between`,style:a,"data-testid":`live-stat-cpu`,children:[p,g]}),t[12]=p,t[13]=g,t[14]=_):_=t[14];let b;t[15]===Symbol.for(`react.memo_cache_sentinel`)?(b={minWidth:200,width:`100%`},t[15]=b):b=t[15];let x=s.mem?.human_readable_name,C;t[16]===x?C=t[17]:(C=(0,z.jsx)(k,{children:x}),t[16]=x,t[17]=C);let w=n.mem_util.ratio*100,E=M(r(n.mem_util.current),i)?.numberFixed+` / `+M(r(n.mem_util.capacity),i)?.displayValue,D;t[18]!==w||t[19]!==E?(D=(0,z.jsx)(P,{percent:w,width:120,valueLabel:E}),t[18]=w,t[19]=E,t[20]=D):D=t[20];let O;t[21]!==C||t[22]!==D?(O=(0,z.jsxs)(j,{justify:`between`,style:b,"data-testid":`live-stat-mem`,children:[C,D]}),t[21]=C,t[22]=D,t[23]=O):O=t[23],c=(0,z.jsxs)(j,{direction:`column`,gap:`xxs`,children:[_,O,y(f(e?.node),t=>{if(![`cpu_util`,`mem`,`disk`].includes(t)){if(S(t,`_util`)){let e=T(t,`_`)[0]+`.device`;return(0,z.jsxs)(j,{justify:`between`,style:{minWidth:200,width:`100%`},gap:`xxs`,"data-testid":`live-stat-${t}`,children:[(0,z.jsxs)(k,{children:[s[e]?.human_readable_name,`(util)`]}),(0,z.jsx)(P,{width:120,percent:n[t].current/n[t].capacity*100||0,valueLabel:o(N(n[t].ratio*100,1))+` %`})]},t)}if(S(t,`_mem`)){let e=T(t,`_`)[0]+`.device`,i=Te(r(n[t].capacity),`auto`)?.unit||`g`;return(0,z.jsxs)(j,{justify:`between`,style:{minWidth:200,width:`100%`},gap:`xxs`,"data-testid":`live-stat-${t}`,children:[(0,z.jsxs)(k,{children:[s[e]?.human_readable_name,`(mem)`]}),(0,z.jsx)(P,{width:120,percent:n[t].current/n[t].capacity*100||0,valueLabel:M(r(n[t].current),i)?.numberFixed+` / `+M(r(n[t].capacity),i)?.displayValue})]},t)}if(S(t,`_power`)){let n=T(t,`_`).slice(0,-1).join(`-`)+`.device`,r=s[n]?.human_readable_name;return(0,z.jsxs)(j,{justify:`between`,style:{minWidth:200,width:`100%`},gap:`xxs`,"data-testid":`live-stat-${t}`,children:[(0,z.jsx)(A,{children:`${r}(power)`}),(0,z.jsx)(A,{children:`${N(e.node[t]?.current,2)} ${e.node[t].unit_hint}`})]},t)}if(S(t,`_temperature`)){let n=T(t,`_`).slice(0,-1).join(`_`)+`.device`,r=s[n]?.human_readable_name;return(0,z.jsxs)(j,{justify:`between`,style:{minWidth:200,width:`100%`},gap:`xxs`,"data-testid":`live-stat-${t}`,children:[(0,z.jsx)(A,{children:`${r}(temp)`}),(0,z.jsx)(A,{children:`${N(e.node[t]?.current,2)} °C`})]},t)}if(S([`net_rx`,`net_tx`],t)){let n=Ee(e.node[t]?.current,`auto`);return(0,z.jsxs)(j,{justify:`between`,style:{minWidth:200,width:`100%`},gap:`xxs`,"data-testid":`live-stat-${t}`,children:[(0,z.jsx)(A,{children:t===`net_rx`?`Net Rx`:`Net Tx`}),(0,z.jsx)(A,{children:`${n?.numberFixed??0} ${n?.unit.toUpperCase()??``}bps`})]},t)}return(0,z.jsxs)(j,{justify:`between`,style:{minWidth:200,width:`100%`},gap:`xxs`,"data-testid":`live-stat-${t}`,children:[(0,z.jsx)(A,{children:t}),(0,z.jsx)(A,{children:`${N(e.node[t]?.current??0,2)}${e.node[t]?.unit_hint?` ${e.node[t].unit_hint}`:``}`})]},t)}})]});break bb0}{let e;t[24]===a?e=t[25]:(e=a(`comp:AgentTable.NoAvailableLiveStat`),t[24]=a,t[25]=e);let n;t[26]===e?n=t[27]:(n=(0,z.jsx)(z.Fragment,{children:e}),t[26]=e,t[27]=n),c=n;break bb0}}t[0]=s,t[1]=i?.available_slots,t[2]=i?.status,t[3]=a,t[4]=n,t[5]=c}else c=t[5];if(c!==Symbol.for(`react.early_return_sentinel`))return c},ft=e=>{"use memo";let t=(0,R.c)(3),{record:n}=e,{token:r}=ue(),i;if(t[0]!==n?.live_stat||t[1]!==r){let e=JSON.parse(n?.live_stat||`{}`)?.node?.disk??{},a=o(e.pct)||0,s=o(N(a,2)),c=r(s>80?`--color-error`:`--color-success`),l=Te(e?.capacity,`auto`,{base:1e3})?.unit||`g`;i=(0,z.jsxs)(j,{direction:`column`,align:`end`,children:[(0,z.jsx)(P,{valueLabel:N(s,1)+` %`,percent:s,strokeColor:c,width:120}),!C(e)&&(0,z.jsxs)(k,{style:{fontSize:r(`--font-size-sm`)},children:[Ee(e?.current,l)?.numberFixed,`\xA0/\xA0`,Ee(e?.capacity,l)?.displayValue]})]}),t[0]=n?.live_stat,t[1]=r,t[2]=i}else i=t[2];return i},pt=e=>{"use memo";let t=(0,R.c)(13),{value:n,record:r}=e,i;t[0]===r?.compute_plugins?i=t[1]:(i=JSON.parse(r?.compute_plugins||`{}`),t[0]=r?.compute_plugins,t[1]=i);let a=i,o;if(t[2]!==a?.cuda||t[3]!==r?.available_slots||t[4]!==r?.version||t[5]!==n){let e=JSON.parse(r?.available_slots||`{}`),i;t[7]===Symbol.for(`react.memo_cache_sentinel`)?(i={label:`Agent`},t[7]=i):i=t[7];let s=r?.version||``,c;t[8]===n?c=t[9]:(c=Ce(`agent`,n),t[8]=n,t[9]=c);let l;t[10]!==s||t[11]!==c?(l=(0,z.jsx)(Me,{values:[i,{label:s,variant:c}]}),t[10]=s,t[11]=c,t[12]=l):l=t[12],o=(0,z.jsxs)(j,{direction:`column`,gap:`xxs`,align:`start`,children:[l,a?.cuda?(0,z.jsxs)(z.Fragment,{children:[a?.cuda?.cuda_version?(0,z.jsx)(Pe,{values:[{label:`CUDA`},{label:a?.cuda?.cuda_version,color:`green`}]}):(0,z.jsx)(Ae,{color:`green`,label:`CUDA Disabled`}),(0,z.jsx)(Pe,{values:[{label:`CUDA Plugin`},{label:a?.cuda?.version,color:`blue`}]}),S(f(e),`cuda.shares`)?(0,z.jsx)(Ae,{color:`blue`,label:`Fractional GPU™`}):null]}):null]}),t[2]=a?.cuda,t[3]=r?.available_slots,t[4]=r?.version,t[5]=n,t[6]=o}else o=t[6];return o},mt=e=>{"use memo";let t=(0,R.c)(32),n,r,i,a,o;t[0]===e?(n=t[1],r=t[2],i=t[3],a=t[4],o=t[5]):({agentsFragment:n,onClickAgentName:a,onChangeOrder:i,customizeColumns:r,...o}=e,t[0]=e,t[1]=n,t[2]=r,t[3]=i,t[4]=a,t[5]=o);let{t:s}=ae(),{token:c}=ue(),l=m(),u=(0,lt.useFragment)(et,n),d;t[6]===s?d=t[7]:(d=s(`comp:AgentTable.Endpoint`),t[6]=s,t[7]=d);let f;t[8]===d?f=t[9]:(f=(0,z.jsxs)(z.Fragment,{children:[`ID / `,d]}),t[8]=d,t[9]=f);let p;t[10]===a?p=t[11]:(p=(e,t)=>(0,z.jsxs)(j,{direction:`column`,align:`start`,children:[a?(0,z.jsx)(Ie,{type:`hover`,onClick:()=>{a(t)},children:e}):(0,z.jsx)(k,{children:e}),(0,z.jsx)(k,{color:`secondary`,children:t?.addr})]}),t[10]=a,t[11]=p);let h;if(t[12]!==l||t[13]!==r||t[14]!==s||t[15]!==f||t[16]!==p||t[17]!==c){let e;t[19]!==l||t[20]!==s?(e=(e,t)=>(0,z.jsxs)(j,{direction:`column`,align:`start`,children:[(0,z.jsx)(k,{children:(0,ct.default)(e).format(`ll LTS`)}),t?.status===`ALIVE`&&(0,z.jsx)(Re,{callback:()=>l.utils.elapsedTime(e,Date.now()),delay:1e3,render:e=>(0,z.jsx)(Me,{values:[{label:s(`comp:AgentTable.Running`)},{label:e}]})})]}),t[19]=l,t[20]=s,t[21]=e):e=t[21];let n;t[22]===c?n=t[23]:(n=e=>(0,z.jsx)(j,{justify:`center`,children:e===!0?(0,z.jsx)(me,{style:{color:c(`--color-success`),fontSize:c(`--font-size-xl`)},size:`1em`}):(0,z.jsx)(Je,{style:{color:c(`--color-text-disabled`),fontSize:c(`--font-size-xl`)},size:`1em`})}),t[22]=c,t[23]=n);let i=[{title:f,key:`row_id`,dataIndex:`row_id`,fixed:`left`,render:p,sortKey:`id`,sorter:V(`id`)},{title:s(`comp:AgentTable.Region`),key:`region`,dataIndex:`region`,sorter:V(`region`)},{title:s(`comp:AgentTable.Architecture`),key:`architecture`,dataIndex:`architecture`,sorter:V(`architecture`)},{title:s(`comp:AgentTable.Version`),key:`version`,dataIndex:`version`,defaultHidden:!0,sorter:V(`version`)},{title:s(`comp:AgentTable.Starts`),key:`first_contact`,dataIndex:`first_contact`,render:e,sorter:V(`first_contact`)},{title:s(`comp:AgentTable.LostAt`),key:`lost_at`,dataIndex:`lost_at`,defaultHidden:!0,render:nt,sorter:V(`lost_at`)},{title:s(`comp:AgentTable.Allocation`),key:`allocated_resources`,render:rt},{title:s(`comp:AgentTable.Utilization`),key:`live_stat`,dataIndex:`live_stat`,render:it},{title:s(`comp:AgentTable.DiskPerc`),key:`disk_pct`,render:at},{title:s(`comp:AgentTable.ResourceGroup`),key:`scaling_group`,dataIndex:`scaling_group`,sorter:V(`scaling_group`)},{title:s(`comp:AgentTable.Status`),key:`status`,dataIndex:`status`,render:ot,sorter:V(`status`)},{title:s(`comp:AgentTable.Schedulable`),key:`schedulable`,dataIndex:`schedulable`,render:n,sorter:V(`schedulable`)}];h=r?r(i):i,t[12]=l,t[13]=r,t[14]=s,t[15]=f,t[16]=p,t[17]=c,t[18]=h}else h=t[18];let g=h,_;t[24]===Symbol.for(`react.memo_cache_sentinel`)?(_={x:`max-content`},t[24]=_):_=t[24];let v;t[25]===i?v=t[26]:(v=e=>{i?.(e||null)},t[25]=i,t[26]=v);let y;return t[27]!==u||t[28]!==g||t[29]!==v||t[30]!==o?(y=(0,z.jsx)(Ve,{scroll:_,...o,rowKey:st,dataSource:u,columns:g,onChangeOrder:v}),t[27]=u,t[28]=g,t[29]=v,t[30]=o,t[31]=y):y=t[31],y}})))()}var gt;function _t(){return(_t=t((()=>{gt=(function(){var e=[{kind:`Literal`,name:`first`,value:100},{kind:`Literal`,name:`offset`,value:0}],t={alias:null,args:null,kind:`ScalarField`,name:`count`,storageKey:null};return{fragment:{argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAIAgentTableStoriesQuery`,selections:[{alias:null,args:e,concreteType:`AgentConnection`,kind:`LinkedField`,name:`agent_nodes`,plural:!1,selections:[{alias:null,args:null,concreteType:`AgentEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`AgentNode`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{args:null,kind:`FragmentSpread`,name:`BAIAgentTableFragment`}],storageKey:null}],storageKey:null},t],storageKey:`agent_nodes(first:100,offset:0)`}],type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[],kind:`Operation`,name:`BAIAgentTableStoriesQuery`,selections:[{alias:null,args:e,concreteType:`AgentConnection`,kind:`LinkedField`,name:`agent_nodes`,plural:!1,selections:[{alias:null,args:null,concreteType:`AgentEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`AgentNode`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`row_id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`addr`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`region`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`architecture`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`first_contact`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`occupied_slots`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`available_slots`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`live_stat`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`status`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`scaling_group`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`compute_plugins`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`version`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`schedulable`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`lost_at`,storageKey:null}],storageKey:null}],storageKey:null},t],storageKey:`agent_nodes(first:100,offset:0)`}]},params:{cacheID:`d411b518001a19dfaef437faaefa9a68`,id:null,metadata:{},name:`BAIAgentTableStoriesQuery`,operationKind:`query`,text:`query BAIAgentTableStoriesQuery {
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
`}}})(),gt.hash=`c18fa3690ef39135a96d3bbca6af1bdf`})))()}var U,vt,W,yt,bt,xt,G,K,q,J,Y,X,Z,Q,$,St;function Ct(){return(Ct=t((()=>{_t(),Ke(),He(),De(),ve(),re(),ht(),U=n(),vt=Se(),W=ie(),{mockClientPromise:yt,mockAnonymousClientFactory:bt}=Ge(),xt={title:`Fragments/BAIAgentTable`,component:mt,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:"\n**BAIAgentTable** is a specialized table component for displaying Backend.AI agent information with Relay GraphQL integration.\n\n## BAI-Specific Props\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `agentsFragment` | `BAIAgentTableFragment$key` | - | GraphQL fragment reference (required) |\n| `onClickAgentName` | `(agent: AgentNodeInList) => void` | - | Callback when agent name is clicked |\n| `onChangeOrder` | `(order: string \\| undefined) => void` | - | Callback for sorting with typed order values |\n| `customizeColumns` | `(baseColumns: BAIColumnType[]) => BAIColumnType[]` | - | Function to customize table columns |\n\n## Available Sorter Keys\n- `id` (the ID column renders `row_id` but the server orders by `id`)\n- `first_contact`\n- `scaling_group`\n- `status`\n- `schedulable`\n- `region`\n- `version`\n- `lost_at`\n\nUse with prefix `-` for descending order (e.g., `'-first_contact'`).\nThe list mirrors `_queryorder_colmap` of the graphene `agent_nodes` resolver.\n\n## Pre-configured Columns\n- **ID / Endpoint**: Agent row ID and address\n- **Region**: Agent region\n- **Architecture**: CPU architecture (no server order key, so not sortable)\n- **Version**: Agent version — `defaultHidden`; the status cell already prints it, so the column exists to make the `version` ordering reachable\n- **Starts**: First contact time and running duration\n- **Lost At**: When the agent was lost — `defaultHidden`; only meaningful on terminated agents, and makes the `lost_at` ordering reachable\n- **Allocation**: Resource allocation (CPU, memory, GPU, etc.) with progress bars\n- **Utilization**: Live resource utilization statistics\n- **Disk %**: Disk usage percentage\n- **Resource Group**: Scaling group name\n- **Status**: Agent status, CUDA version, plugin info\n- **Schedulable**: Whether agent can schedule new sessions\n\nHidden-by-default columns are opt-in through the table's column settings.\n\n## Customizing Columns\n`customizeColumns` receives the base array and its return value is used verbatim.\nMatch entries on `column.key`, never by index — the base list grows, and an index\nslice silently drops whichever column moved into the gap.\n\nFor other props (loading, pagination, etc.), refer to [BAITable](?path=/docs/table-baitable--docs).\n        "}}},argTypes:{agentsFragment:{control:!1,description:`GraphQL fragment reference for agent data`,table:{type:{summary:`BAIAgentTableFragment$key`}}},onClickAgentName:{action:`agent-name-clicked`,description:`Callback when agent name is clicked`,table:{type:{summary:`(agent: AgentNodeInList) => void`}}},onChangeOrder:{action:`order-changed`,description:`Callback for sorting with typed order values`,table:{type:{summary:`(order: string | undefined) => void`}}},customizeColumns:{control:!1,description:`Function to customize table columns`,table:{type:{summary:`(baseColumns: BAIColumnType[]) => BAIColumnType[]`}}}},decorators:[(e,t)=>{let n=t.globals.locale||`en`,r=We[n]||We.en;return(0,W.jsx)(_e,{locale:r,clientPromise:yt,anonymousClientFactory:bt,children:(0,W.jsx)(te,{deviceMetaData:Ue,children:(0,W.jsx)(e,{})})})}]},G=({onClickAgentName:e,onChangeOrder:t,customizeColumns:n,loading:r,order:i})=>{let{agent_nodes:a}=(0,vt.useLazyLoadQuery)(gt,{}),o=a?.edges.map(e=>e?.node).filter(e=>!!e)??[];return(0,W.jsx)(mt,{agentsFragment:o,onClickAgentName:e,onChangeOrder:t,customizeColumns:n,loading:r,order:i,pagination:{total:a?.count??0,pageSize:10}})},K=(e,t={})=>({id:`agent-${e}`,row_id:`agent-00${e}`,addr:`192.168.1.${100+e}:6001`,region:e%2==0?`us-west-2`:`us-east-1`,architecture:`x86_64`,first_contact:new Date(Date.now()-e*24*60*60*1e3).toISOString(),occupied_slots:JSON.stringify({cpu:`4`,mem:`8589934592`,"cuda.device":`1`}),available_slots:JSON.stringify({cpu:`16`,mem:`34359738368`,"cuda.device":`2`,"cuda.shares":`2.0`}),live_stat:JSON.stringify({node:{cpu_util:{current:25.5+e*5,capacity:100,pct:25.5+e*5},mem:{current:`8589934592`,capacity:`34359738368`,pct:`25`},disk:{current:`107374182400`,capacity:`536870912000`,pct:`20`},net_rx:{current:`1048576`},net_tx:{current:`524288`},cuda_util:{current:`50`,capacity:`100`},cuda_mem:{current:`4294967296`,capacity:`8589934592`,pct:`50`}},devices:{cpu_util:{0:25.5,1:30,2:20,3:28.5}}}),status:`ALIVE`,scaling_group:`default`,compute_plugins:JSON.stringify({cuda:{version:`12.0.1`,cuda_version:`12.0`}}),version:`24.03.0`,schedulable:!0,lost_at:null,...t}),q={name:`Basic`,parameters:{docs:{description:{story:`Basic agent table displaying multiple agents with their resource allocations, utilization, and status.`}}},render:e=>(0,W.jsx)(F,{mockResolvers:{Query:()=>({agent_nodes:{edges:[{node:K(1)},{node:K(2,{status:`TERMINATED`})},{node:K(3)},{node:K(4,{schedulable:!1})},{node:K(5)}],count:5}})},children:(0,W.jsx)(G,{...e})})},J={name:`ClickableAgentNames`,parameters:{docs:{description:{story:`Demonstrates clickable agent names. Click on any agent ID to trigger the callback.`}}},render:()=>{let[e,t]=(0,U.useState)(null);return(0,W.jsxs)(`div`,{children:[(0,W.jsxs)(`div`,{style:{marginBottom:16},children:[(0,W.jsx)(`strong`,{children:`Selected Agent:`}),` `,e?e.row_id:`None`]}),(0,W.jsx)(F,{mockResolvers:{Query:()=>({agent_nodes:{edges:[{node:K(1)},{node:K(2)},{node:K(3)}],count:3}})},children:(0,W.jsx)(G,{onClickAgentName:e=>{t(e)}})})]})}},Y={name:`CustomColumns`,parameters:{docs:{description:{story:`Demonstrates column customization by adding an actions column at the beginning of the table.`}}},render:()=>(0,W.jsx)(F,{mockResolvers:{Query:()=>({agent_nodes:{edges:[{node:K(1)},{node:K(2)},{node:K(3)}],count:3}})},children:(0,W.jsx)(G,{customizeColumns:e=>[{key:`actions`,title:`Actions`,fixed:`left`,width:100,render:(e,t)=>(0,W.jsx)(Oe,{size:`small`,onClick:()=>alert(`Managing agent: ${t.row_id}`),children:`Manage`})},...e]})})},X={name:`LoadingState`,parameters:{docs:{description:{story:`Shows the agent table in a loading state with reduced opacity.`}}},render:()=>(0,W.jsx)(F,{mockResolvers:{Query:()=>({agent_nodes:{edges:[{node:K(1)},{node:K(2)}],count:2}})},children:(0,W.jsx)(G,{loading:!0})})},Z={name:`EmptyState`,parameters:{docs:{description:{story:`Shows the agent table when no agents are available.`}}},render:()=>(0,W.jsx)(F,{mockResolvers:{Query:()=>({agent_nodes:{edges:[],count:0}})},children:(0,W.jsx)(G,{})})},Q={name:`DifferentStatuses`,parameters:{docs:{description:{story:`Displays agents with different statuses to show how the table renders each state.`}}},render:()=>(0,W.jsx)(F,{mockResolvers:{Query:()=>({agent_nodes:{edges:[{node:K(1,{status:`ALIVE`,schedulable:!0})},{node:K(2,{status:`TERMINATED`,schedulable:!1})},{node:K(3,{status:`ALIVE`,schedulable:!1})},{node:K(4,{status:`LOST`,schedulable:!1})}],count:4}})},children:(0,W.jsx)(G,{})})},$={name:`RealWorldUsage`,parameters:{docs:{description:{story:`Demonstrates a realistic use case combining clickable agent names, sorting, and custom columns.`}}},render:()=>{let[e,t]=(0,U.useState)(null),[n,r]=(0,U.useState)(`-first_contact`);return(0,W.jsxs)(`div`,{children:[(0,W.jsxs)(`div`,{style:{marginBottom:16,padding:12,background:`#f5f5f5`,borderRadius:4},children:[(0,W.jsxs)(`div`,{children:[(0,W.jsx)(`strong`,{children:`Selected Agent:`}),` `,e?e.row_id:`None`]}),(0,W.jsxs)(`div`,{children:[(0,W.jsx)(`strong`,{children:`Sort Order:`}),` `,n||`None`]})]}),(0,W.jsx)(F,{mockResolvers:{Query:()=>({agent_nodes:{edges:[{node:K(1)},{node:K(2,{status:`TERMINATED`})},{node:K(3)},{node:K(4,{schedulable:!1})},{node:K(5)},{node:K(6)}],count:6}})},children:(0,W.jsx)(G,{order:n,onClickAgentName:e=>t(e),onChangeOrder:e=>r(e),customizeColumns:e=>[{key:`actions`,title:`Actions`,fixed:`left`,width:100,render:(e,n)=>(0,W.jsx)(Oe,{size:`small`,type:`link`,onClick:()=>t(n),children:`Select`})},...e]})})]})}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
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
}`,...$.parameters?.docs?.source},description:{story:`Real-world example combining multiple features.`,...$.parameters?.docs?.description}}},St=[`Default`,`WithClickableAgentNames`,`WithCustomColumns`,`Loading`,`Empty`,`DifferentStatuses`,`RealWorldExample`]})))()}Ct();export{q as Default,Q as DifferentStatuses,Z as Empty,X as Loading,$ as RealWorldExample,J as WithClickableAgentNames,Y as WithCustomColumns,St as __namedExportsOrder,xt as default};