import{n as e,o as t}from"./rolldown-runtime-2s6bX4vc.js";import{n,t as r}from"./toString-D-HqYh4D.js";import{i,n as a,r as o,t as s}from"./toFinite-DD6pcloH.js";import{n as c,t as l}from"./toInteger-Bwm_SNjN.js";import{_ as u,v as d}from"./_Uint8Array-BGVRJxrU.js";import{C as f,T as p,t as m,w as h}from"./hooks-BKuvs6Qg.js";import{n as g,t as _}from"./forEach-DSbmngGw.js";import{n as v,t as y}from"./map-CIqW7OVA.js";import{n as b,t as x}from"./includes-B4oWcpQa.js";import{n as S,t as C}from"./isEmpty-C3CFE_pY.js";import{n as w,t as T}from"./split-Djnna1OQ.js";import{a as E,i as D,n as O,o as ee,r as te,s as ne}from"./BAIResourceNumberWithIcon-BouCFg2X.js";import{n as k,t as re}from"./useBAIi18n-BoXCk5K0.js";import{t as ie}from"./dayjs.min-B7AEa451.js";import{n as ae,t as oe}from"./createLucideIcon-CRb7bAU8.js";import{n as se,t as ce}from"./circle-check-FjYoeWei.js";import{a as le,c as ue,i as de,s as A}from"./iframe-DR2sIF5r.js";import{n as fe,t as j}from"./BAIFlex-CAz1t6J5.js";import{n as pe,t as me}from"./BAIAlertIconWithTooltip-yaMgFFQ7.js";import{t as he}from"./astryxTagVariant-Gg8xzDlT.js";import{c as ge,i as M,n as N,p as P,r as _e}from"./helper-DV0q0X9R.js";import{n as ve,t as ye}from"./BAIButton-C-o5ANgR.js";import{n as be,t as xe}from"./BAIDoubleBadge-BEAKtl8w.js";import{n as Se,t as Ce}from"./BAIDoubleToken-CiIWtXg6.js";import{n as we,t as Te}from"./BAILink-f1waJzHB.js";import{n as Ee,t as De}from"./BAIIntervalView-Ci3l1zze.js";import{n as Oe,t as F}from"./BAIProgressWithLabel-Bme_HDIB.js";import{n as ke,t as Ae}from"./BAITable-BlL2P1wn.js";import{n as je,o as Me,r as Ne,t as Pe}from"./storybook-mock-utils-B0PJ9qWR.js";import{n as Fe,t as I}from"./RelayResolver-b1nJU57O.js";import{Component as Ie,createContext as Le,createElement as Re,useState as ze}from"react";import{Fragment as Be,jsx as L,jsxs as R}from"react/jsx-runtime";import{c as z}from"react/compiler-runtime";import{useTheme as Ve}from"@lablup/ui-common/theme";import{useFragment as He,useLazyLoadQuery as Ue}from"react-relay";import{Text as B}from"@lablup/ui-common/Text";import{Token as We}from"@lablup/ui-common/Token";var Ge,Ke;function qe(){return(qe=e((()=>{ae(),Ge=[[`circle`,{cx:`12`,cy:`12`,r:`10`,key:`1mglay`}],[`path`,{d:`M8 12h8`,key:`1wcyev`}]],Ke=oe(`circle-minus`,Ge)})))()}function Je(e=[],t=[]){return e.length!==t.length||e.some((e,n)=>!Object.is(e,t[n]))}var Ye,V,Xe;function Ze(){return(Ze=e((()=>{Ye=Le(null),V={didCatch:!1,error:null},Xe=class extends Ie{constructor(e){super(e),this.resetErrorBoundary=this.resetErrorBoundary.bind(this),this.state=V}static getDerivedStateFromError(e){return{didCatch:!0,error:e}}resetErrorBoundary(...e){let{error:t}=this.state;t!==null&&(this.props.onReset?.({args:e,reason:`imperative-api`}),this.setState(V))}componentDidCatch(e,t){this.props.onError?.(e,t)}componentDidUpdate(e,t){let{didCatch:n}=this.state,{resetKeys:r}=this.props;n&&t.error!==null&&Je(e.resetKeys,r)&&(this.props.onReset?.({next:r,prev:e.resetKeys,reason:`keys`}),this.setState(V))}render(){let{children:e,fallbackRender:t,FallbackComponent:n,fallback:r}=this.props,{didCatch:i,error:a}=this.state,o=e;if(i){let e={error:a,resetErrorBoundary:this.resetErrorBoundary};if(typeof t==`function`)o=t(e);else if(n)o=Re(n,e);else if(r!==void 0)o=r;else throw a}return Re(Ye.Provider,{value:{didCatch:i,error:a,resetErrorBoundary:this.resetErrorBoundary}},o)}}})))()}var Qe;function $e(){return($e=e((()=>{Qe={argumentDefinitions:[],kind:`Fragment`,metadata:{plural:!0},name:`BAIAgentTableFragment`,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`row_id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`addr`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`region`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`architecture`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`first_contact`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`occupied_slots`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`available_slots`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`live_stat`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`status`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`scaling_group`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`compute_plugins`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`version`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`schedulable`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`lost_at`,storageKey:null}],type:`AgentNode`,abstractKey:null},Qe.hash=`73cb32c95a2360f7165430aa991c1b7d`})))()}function et(e){return L(B,{children:e?(0,ot.default)(e).format(`ll LTS`):`-`})}function tt(e,t){return L(W,{resetKeys:[t?.occupied_slots,t?.available_slots],children:L(st,{record:t})})}function nt(e,t){return L(W,{resetKeys:[e,t?.available_slots],children:L(ct,{value:e,record:t})})}function rt(e,t){return L(W,{resetKeys:[t?.live_stat],children:L(lt,{record:t})})}function it(e,t){return L(W,{resetKeys:[e,t?.compute_plugins,t?.available_slots],children:L(ut,{value:e,record:t})})}function at(e){return e.id}var ot,H,U,W,st,ct,lt,ut,dt;function ft(){return(ft=e((()=>{$e(),ge(),m(),re(),pe(),be(),Se(),fe(),Ee(),we(),Oe(),te(),ue(),ke(),D(),h(),ot=t(ie(),1),b(),y(),s(),o(),u(),l(),g(),r(),T(),C(),se(),qe(),Ze(),H=[`id`,`first_contact`,`scaling_group`,`status`,`schedulable`,`region`,`version`,`lost_at`],[...H,...H.map(e=>`-${e}`)],U=e=>x(H,e),W=e=>{"use memo";let t=z(12),n,r;t[0]===e?(n=t[1],r=t[2]):({children:n,...r}=e,t[0]=e,t[1]=n,t[2]=r);let{t:i}=k(),{logger:a}=f(),o;t[3]===a?o=t[4]:(o=(e,t)=>a.error(`[BAIAgentTable] Cell render failed:`,e,t.componentStack),t[3]=a,t[4]=o);let s;t[5]===i?s=t[6]:(s=()=>L(me,{type:`error`,title:i(`comp:AgentTable.FailedToLoadCellData`)}),t[5]=i,t[6]=s);let c;return t[7]!==n||t[8]!==r||t[9]!==o||t[10]!==s?(c=L(Xe,{onError:o,fallbackRender:s,...r,children:n}),t[7]=n,t[8]=r,t[9]=o,t[10]=s,t[11]=c):c=t[11],c},st=e=>{"use memo";let t=z(13),{record:n}=e,{token:r}=Ve(),{mergedResourceSlots:o}=E(),s,c,l,u;if(t[0]!==o||t[1]!==n?.available_slots||t[2]!==n?.occupied_slots||t[3]!==r){let e=JSON.parse(n?.occupied_slots||`{}`),d=JSON.parse(n?.available_slots||`{}`);s=j,c=`column`,l=`xxs`,u=v(d,(t,n)=>{if(n===`cpu`){let t=a(i(e.cpu)/i(d.cpu)*100);return R(j,{justify:`between`,style:{width:`100%`},gap:`xs`,children:[R(j,{gap:`xxs`,children:[L(O,{type:n},n),R(B,{children:[P(e.cpu||0,0),`\xA0/\xA0`,P(d.cpu||0,0)]}),L(B,{color:`secondary`,style:{fontSize:r(`--spacing-2`)},children:o.cpu?.display_unit})]}),L(F,{percent:t,strokeColor:r(t>80?`--color-error`:`--color-success`),width:120,valueLabel:P(t,1)+` %`})]},n)}if(n===`mem`){let t=a(i(e.mem)/i(d.mem)*100);return R(j,{justify:`between`,style:{width:`100%`},gap:`xs`,children:[R(j,{gap:`xxs`,children:[L(O,{type:`mem`}),R(B,{children:[N(e.mem,`g`,0)?.numberFixed??0,`\xA0/\xA0`,N(d.mem,`g`,0)?.numberFixed??0]}),L(B,{color:`secondary`,style:{fontSize:r(`--spacing-2`)},children:`GiB`})]}),L(F,{percent:t,strokeColor:r(t>80?`--color-error`:`--color-success`),width:120,valueLabel:P(t,1)+` %`})]},`mem`)}if(d[n]){let t=a(i(e[n])/i(d[n])*100);return R(j,{justify:`between`,gap:`xs`,style:{width:`100%`},children:[R(j,{gap:`xxs`,children:[L(O,{type:n},n),R(B,{children:[P(e[n]||0,2),`\xA0/\xA0`,P(d[n],2)]}),L(B,{color:`secondary`,style:{fontSize:r(`--spacing-2`)},children:o[n]?.display_unit})]}),L(F,{percent:t,strokeColor:r(t>80?`--color-error`:`--color-success`),width:120,valueLabel:P(t,1)+` %`})]},n)}}),t[0]=o,t[1]=n?.available_slots,t[2]=n?.occupied_slots,t[3]=r,t[4]=s,t[5]=c,t[6]=l,t[7]=u}else s=t[4],c=t[5],l=t[6],u=t[7];let d;return t[8]!==s||t[9]!==c||t[10]!==l||t[11]!==u?(d=L(s,{direction:c,gap:l,children:u}),t[8]=s,t[9]=c,t[10]=l,t[11]=u,t[12]=d):d=t[12],d},ct=e=>{"use memo";let t=z(28),{value:r,record:i}=e,{t:o}=k(),{mergedResourceSlots:s}=E(),l;if(t[0]!==s||t[1]!==i?.available_slots||t[2]!==i?.status||t[3]!==o||t[4]!==r){l=Symbol.for(`react.early_return_sentinel`);bb0:{let e=JSON.parse(r||`{}`),u=JSON.parse(i?.available_slots||`{}`);if(i?.status===`ALIVE`){let r={cpu_util:{capacity:0,current:0,ratio:0},mem_util:{capacity:0,current:0,ratio:0}};if(e&&e.node&&e.devices){let t=d(e.devices.cpu_util).length;r.cpu_util.capacity=a(e.node.cpu_util.capacity),r.cpu_util.current=a(e.node.cpu_util.current),r.cpu_util.ratio=Math.min(a(e.node.cpu_util.pct)/100/(t||1),1),r.mem_util.capacity=c(u.mem||e.node.mem.capacity),r.mem_util.current=c(e.node.mem.current),r.mem_util.ratio=r.mem_util.current/r.mem_util.capacity||0}_(d(e?.node),t=>{[`cpu_util`,`mem`,`disk`,`net_rx`,`net_tx`].includes(t)||(x(t,`_util`)?r[t]={capacity:a(e.node[t].capacity)||100,current:a(e.node[t].current),ratio:a(e.node[t].current)/100||0}:t.includes(`_mem`)&&(r[t]={capacity:a(e.node[t].capacity),current:a(e.node[t].current),ratio:a(e.node[t].pct)/100||0}))});let i=M(n(r.mem_util.capacity),`auto`)?.unit||`g`,o;t[6]===Symbol.for(`react.memo_cache_sentinel`)?(o={minWidth:200,width:`100%`},t[6]=o):o=t[6];let f=s.cpu?.human_readable_name,p;t[7]===f?p=t[8]:(p=L(B,{children:f}),t[7]=f,t[8]=p);let m=r.cpu_util.ratio*100,h=P(a(r.cpu_util.ratio*100),1)+` %`,g;t[9]!==m||t[10]!==h?(g=L(F,{percent:m,width:120,valueLabel:h}),t[9]=m,t[10]=h,t[11]=g):g=t[11];let y;t[12]!==p||t[13]!==g?(y=R(j,{justify:`between`,style:o,"data-testid":`live-stat-cpu`,children:[p,g]}),t[12]=p,t[13]=g,t[14]=y):y=t[14];let b;t[15]===Symbol.for(`react.memo_cache_sentinel`)?(b={minWidth:200,width:`100%`},t[15]=b):b=t[15];let S=s.mem?.human_readable_name,C;t[16]===S?C=t[17]:(C=L(B,{children:S}),t[16]=S,t[17]=C);let T=r.mem_util.ratio*100,E=N(n(r.mem_util.current),i)?.numberFixed+` / `+N(n(r.mem_util.capacity),i)?.displayValue,D;t[18]!==T||t[19]!==E?(D=L(F,{percent:T,width:120,valueLabel:E}),t[18]=T,t[19]=E,t[20]=D):D=t[20];let O;t[21]!==C||t[22]!==D?(O=R(j,{justify:`between`,style:b,"data-testid":`live-stat-mem`,children:[C,D]}),t[21]=C,t[22]=D,t[23]=O):O=t[23],l=R(j,{direction:`column`,gap:`xxs`,children:[y,O,v(d(e?.node),t=>{if(![`cpu_util`,`mem`,`disk`].includes(t)){if(x(t,`_util`)){let e=w(t,`_`)[0]+`.device`;return R(j,{justify:`between`,style:{minWidth:200,width:`100%`},gap:`xxs`,"data-testid":`live-stat-${t}`,children:[R(B,{children:[s[e]?.human_readable_name,`(util)`]}),L(F,{width:120,percent:r[t].current/r[t].capacity*100||0,valueLabel:a(P(r[t].ratio*100,1))+` %`})]},t)}if(x(t,`_mem`)){let e=w(t,`_`)[0]+`.device`,i=M(n(r[t].capacity),`auto`)?.unit||`g`;return R(j,{justify:`between`,style:{minWidth:200,width:`100%`},gap:`xxs`,"data-testid":`live-stat-${t}`,children:[R(B,{children:[s[e]?.human_readable_name,`(mem)`]}),L(F,{width:120,percent:r[t].current/r[t].capacity*100||0,valueLabel:N(n(r[t].current),i)?.numberFixed+` / `+N(n(r[t].capacity),i)?.displayValue})]},t)}if(x(t,`_power`)){let n=w(t,`_`).slice(0,-1).join(`-`)+`.device`,r=s[n]?.human_readable_name;return R(j,{justify:`between`,style:{minWidth:200,width:`100%`},gap:`xxs`,"data-testid":`live-stat-${t}`,children:[L(A,{children:`${r}(power)`}),L(A,{children:`${P(e.node[t]?.current,2)} ${e.node[t].unit_hint}`})]},t)}if(x(t,`_temperature`)){let n=w(t,`_`).slice(0,-1).join(`_`)+`.device`,r=s[n]?.human_readable_name;return R(j,{justify:`between`,style:{minWidth:200,width:`100%`},gap:`xxs`,"data-testid":`live-stat-${t}`,children:[L(A,{children:`${r}(temp)`}),L(A,{children:`${P(e.node[t]?.current,2)} °C`})]},t)}if(x([`net_rx`,`net_tx`],t)){let n=_e(e.node[t]?.current,`auto`);return R(j,{justify:`between`,style:{minWidth:200,width:`100%`},gap:`xxs`,"data-testid":`live-stat-${t}`,children:[L(A,{children:t===`net_rx`?`Net Rx`:`Net Tx`}),L(A,{children:`${n?.numberFixed??0} ${n?.unit.toUpperCase()??``}bps`})]},t)}return R(j,{justify:`between`,style:{minWidth:200,width:`100%`},gap:`xxs`,"data-testid":`live-stat-${t}`,children:[L(A,{children:t}),L(A,{children:`${P(e.node[t]?.current??0,2)}${e.node[t]?.unit_hint?` ${e.node[t].unit_hint}`:``}`})]},t)}})]});break bb0}{let e;t[24]===o?e=t[25]:(e=o(`comp:AgentTable.NoAvailableLiveStat`),t[24]=o,t[25]=e);let n;t[26]===e?n=t[27]:(n=L(Be,{children:e}),t[26]=e,t[27]=n),l=n;break bb0}}t[0]=s,t[1]=i?.available_slots,t[2]=i?.status,t[3]=o,t[4]=r,t[5]=l}else l=t[5];if(l!==Symbol.for(`react.early_return_sentinel`))return l},lt=e=>{"use memo";let t=z(3),{record:n}=e,{token:r}=Ve(),i;if(t[0]!==n?.live_stat||t[1]!==r){let e=JSON.parse(n?.live_stat||`{}`)?.node?.disk??{},o=a(e.pct)||0,s=a(P(o,2)),c=r(s>80?`--color-error`:`--color-success`),l=M(e?.capacity,`auto`,{base:1e3})?.unit||`g`;i=R(j,{direction:`column`,align:`end`,children:[L(F,{valueLabel:P(s,1)+` %`,percent:s,strokeColor:c,width:120}),!S(e)&&R(B,{style:{fontSize:r(`--font-size-sm`)},children:[_e(e?.current,l)?.numberFixed,`\xA0/\xA0`,_e(e?.capacity,l)?.displayValue]})]}),t[0]=n?.live_stat,t[1]=r,t[2]=i}else i=t[2];return i},ut=e=>{"use memo";let t=z(13),{value:n,record:r}=e,i;t[0]===r?.compute_plugins?i=t[1]:(i=JSON.parse(r?.compute_plugins||`{}`),t[0]=r?.compute_plugins,t[1]=i);let a=i,o;if(t[2]!==a?.cuda||t[3]!==r?.available_slots||t[4]!==r?.version||t[5]!==n){let e=JSON.parse(r?.available_slots||`{}`),i;t[7]===Symbol.for(`react.memo_cache_sentinel`)?(i={label:`Agent`},t[7]=i):i=t[7];let s=r?.version||``,c;t[8]===n?c=t[9]:(c=he(`agent`,n),t[8]=n,t[9]=c);let l;t[10]!==s||t[11]!==c?(l=L(xe,{values:[i,{label:s,variant:c}]}),t[10]=s,t[11]=c,t[12]=l):l=t[12],o=R(j,{direction:`column`,gap:`xxs`,align:`start`,children:[l,a?.cuda?R(Be,{children:[a?.cuda?.cuda_version?L(Ce,{values:[{label:`CUDA`},{label:a?.cuda?.cuda_version,color:`green`}]}):L(We,{color:`green`,label:`CUDA Disabled`}),L(Ce,{values:[{label:`CUDA Plugin`},{label:a?.cuda?.version,color:`blue`}]}),x(d(e),`cuda.shares`)?L(We,{color:`blue`,label:`Fractional GPU™`}):null]}):null]}),t[2]=a?.cuda,t[3]=r?.available_slots,t[4]=r?.version,t[5]=n,t[6]=o}else o=t[6];return o},dt=e=>{"use memo";let t=z(32),n,r,i,a,o;t[0]===e?(n=t[1],r=t[2],i=t[3],a=t[4],o=t[5]):({agentsFragment:n,onClickAgentName:a,onChangeOrder:i,customizeColumns:r,...o}=e,t[0]=e,t[1]=n,t[2]=r,t[3]=i,t[4]=a,t[5]=o);let{t:s}=k(),{token:c}=Ve(),l=p(),u=He(Qe,n),d;t[6]===s?d=t[7]:(d=s(`comp:AgentTable.Endpoint`),t[6]=s,t[7]=d);let f;t[8]===d?f=t[9]:(f=R(Be,{children:[`ID / `,d]}),t[8]=d,t[9]=f);let m;t[10]===a?m=t[11]:(m=(e,t)=>R(j,{direction:`column`,align:`start`,children:[a?L(Te,{type:`hover`,onClick:()=>{a(t)},children:e}):L(B,{children:e}),L(B,{color:`secondary`,children:t?.addr})]}),t[10]=a,t[11]=m);let h;if(t[12]!==l||t[13]!==r||t[14]!==s||t[15]!==f||t[16]!==m||t[17]!==c){let e;t[19]!==l||t[20]!==s?(e=(e,t)=>R(j,{direction:`column`,align:`start`,children:[L(B,{children:(0,ot.default)(e).format(`ll LTS`)}),t?.status===`ALIVE`&&L(De,{callback:()=>l.utils.elapsedTime(e,Date.now()),delay:1e3,render:e=>L(xe,{values:[{label:s(`comp:AgentTable.Running`)},{label:e}]})})]}),t[19]=l,t[20]=s,t[21]=e):e=t[21];let n;t[22]===c?n=t[23]:(n=e=>L(j,{justify:`center`,children:e===!0?L(ce,{style:{color:c(`--color-success`),fontSize:c(`--font-size-xl`)},size:`1em`}):L(Ke,{style:{color:c(`--color-text-disabled`),fontSize:c(`--font-size-xl`)},size:`1em`})}),t[22]=c,t[23]=n);let i=[{title:f,key:`row_id`,dataIndex:`row_id`,fixed:`left`,render:m,sortKey:`id`,sorter:U(`id`)},{title:s(`comp:AgentTable.Region`),key:`region`,dataIndex:`region`,sorter:U(`region`)},{title:s(`comp:AgentTable.Architecture`),key:`architecture`,dataIndex:`architecture`,sorter:U(`architecture`)},{title:s(`comp:AgentTable.Version`),key:`version`,dataIndex:`version`,defaultHidden:!0,sorter:U(`version`)},{title:s(`comp:AgentTable.Starts`),key:`first_contact`,dataIndex:`first_contact`,render:e,sorter:U(`first_contact`)},{title:s(`comp:AgentTable.LostAt`),key:`lost_at`,dataIndex:`lost_at`,defaultHidden:!0,render:et,sorter:U(`lost_at`)},{title:s(`comp:AgentTable.Allocation`),key:`allocated_resources`,render:tt},{title:s(`comp:AgentTable.Utilization`),key:`live_stat`,dataIndex:`live_stat`,render:nt},{title:s(`comp:AgentTable.DiskPerc`),key:`disk_pct`,render:rt},{title:s(`comp:AgentTable.ResourceGroup`),key:`scaling_group`,dataIndex:`scaling_group`,sorter:U(`scaling_group`)},{title:s(`comp:AgentTable.Status`),key:`status`,dataIndex:`status`,render:it,sorter:U(`status`)},{title:s(`comp:AgentTable.Schedulable`),key:`schedulable`,dataIndex:`schedulable`,render:n,sorter:U(`schedulable`)}];h=r?r(i):i,t[12]=l,t[13]=r,t[14]=s,t[15]=f,t[16]=m,t[17]=c,t[18]=h}else h=t[18];let g=h,_;t[24]===Symbol.for(`react.memo_cache_sentinel`)?(_={x:`max-content`},t[24]=_):_=t[24];let v;t[25]===i?v=t[26]:(v=e=>{i?.(e||null)},t[25]=i,t[26]=v);let y;return t[27]!==u||t[28]!==g||t[29]!==v||t[30]!==o?(y=L(Ae,{scroll:_,...o,rowKey:at,dataSource:u,columns:g,onChangeOrder:v}),t[27]=u,t[28]=g,t[29]=v,t[30]=o,t[31]=y):y=t[31],y}})))()}var pt;function mt(){return(mt=e((()=>{pt=(function(){var e=[{kind:`Literal`,name:`first`,value:100},{kind:`Literal`,name:`offset`,value:0}],t={alias:null,args:null,kind:`ScalarField`,name:`count`,storageKey:null};return{fragment:{argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAIAgentTableStoriesQuery`,selections:[{alias:null,args:e,concreteType:`AgentConnection`,kind:`LinkedField`,name:`agent_nodes`,plural:!1,selections:[{alias:null,args:null,concreteType:`AgentEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`AgentNode`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{args:null,kind:`FragmentSpread`,name:`BAIAgentTableFragment`}],storageKey:null}],storageKey:null},t],storageKey:`agent_nodes(first:100,offset:0)`}],type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[],kind:`Operation`,name:`BAIAgentTableStoriesQuery`,selections:[{alias:null,args:e,concreteType:`AgentConnection`,kind:`LinkedField`,name:`agent_nodes`,plural:!1,selections:[{alias:null,args:null,concreteType:`AgentEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`AgentNode`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`row_id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`addr`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`region`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`architecture`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`first_contact`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`occupied_slots`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`available_slots`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`live_stat`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`status`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`scaling_group`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`compute_plugins`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`version`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`schedulable`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`lost_at`,storageKey:null}],storageKey:null}],storageKey:null},t],storageKey:`agent_nodes(first:100,offset:0)`}]},params:{cacheID:`d411b518001a19dfaef437faaefa9a68`,id:null,metadata:{},name:`BAIAgentTableStoriesQuery`,operationKind:`query`,text:`query BAIAgentTableStoriesQuery {
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
`}}})(),pt.hash=`c18fa3690ef39135a96d3bbca6af1bdf`})))()}var ht,gt,_t,G,K,q,J,Y,X,Z,Q,$,vt;function yt(){return(yt=e((()=>{mt(),Fe(),je(),ve(),le(),ne(),ft(),{mockClientPromise:ht,mockAnonymousClientFactory:gt}=Pe(),_t={title:`Fragments/BAIAgentTable`,component:dt,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:"\n**BAIAgentTable** is a specialized table component for displaying Backend.AI agent information with Relay GraphQL integration.\n\n## BAI-Specific Props\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `agentsFragment` | `BAIAgentTableFragment$key` | - | GraphQL fragment reference (required) |\n| `onClickAgentName` | `(agent: AgentNodeInList) => void` | - | Callback when agent name is clicked |\n| `onChangeOrder` | `(order: string \\| undefined) => void` | - | Callback for sorting with typed order values |\n| `customizeColumns` | `(baseColumns: BAIColumnType[]) => BAIColumnType[]` | - | Function to customize table columns |\n\n## Available Sorter Keys\n- `id` (the ID column renders `row_id` but the server orders by `id`)\n- `first_contact`\n- `scaling_group`\n- `status`\n- `schedulable`\n- `region`\n- `version`\n- `lost_at`\n\nUse with prefix `-` for descending order (e.g., `'-first_contact'`).\nThe list mirrors `_queryorder_colmap` of the graphene `agent_nodes` resolver.\n\n## Pre-configured Columns\n- **ID / Endpoint**: Agent row ID and address\n- **Region**: Agent region\n- **Architecture**: CPU architecture (no server order key, so not sortable)\n- **Version**: Agent version — `defaultHidden`; the status cell already prints it, so the column exists to make the `version` ordering reachable\n- **Starts**: First contact time and running duration\n- **Lost At**: When the agent was lost — `defaultHidden`; only meaningful on terminated agents, and makes the `lost_at` ordering reachable\n- **Allocation**: Resource allocation (CPU, memory, GPU, etc.) with progress bars\n- **Utilization**: Live resource utilization statistics\n- **Disk %**: Disk usage percentage\n- **Resource Group**: Scaling group name\n- **Status**: Agent status, CUDA version, plugin info\n- **Schedulable**: Whether agent can schedule new sessions\n\nHidden-by-default columns are opt-in through the table's column settings.\n\n## Customizing Columns\n`customizeColumns` receives the base array and its return value is used verbatim.\nMatch entries on `column.key`, never by index — the base list grows, and an index\nslice silently drops whichever column moved into the gap.\n\nFor other props (loading, pagination, etc.), refer to [BAITable](?path=/docs/table-baitable--docs).\n        "}}},argTypes:{agentsFragment:{control:!1,description:`GraphQL fragment reference for agent data`,table:{type:{summary:`BAIAgentTableFragment$key`}}},onClickAgentName:{action:`agent-name-clicked`,description:`Callback when agent name is clicked`,table:{type:{summary:`(agent: AgentNodeInList) => void`}}},onChangeOrder:{action:`order-changed`,description:`Callback for sorting with typed order values`,table:{type:{summary:`(order: string | undefined) => void`}}},customizeColumns:{control:!1,description:`Function to customize table columns`,table:{type:{summary:`(baseColumns: BAIColumnType[]) => BAIColumnType[]`}}}},decorators:[(e,t)=>{let n=t.globals.locale||`en`,r=Ne[n]||Ne.en;return L(de,{locale:r,clientPromise:ht,anonymousClientFactory:gt,children:L(ee,{deviceMetaData:Me,children:L(e,{})})})}]},G=({onClickAgentName:e,onChangeOrder:t,customizeColumns:n,loading:r,order:i})=>{let{agent_nodes:a}=Ue(pt,{}),o=a?.edges.map(e=>e?.node).filter(e=>!!e)??[];return L(dt,{agentsFragment:o,onClickAgentName:e,onChangeOrder:t,customizeColumns:n,loading:r,order:i,pagination:{total:a?.count??0,pageSize:10}})},K=(e,t={})=>({id:`agent-${e}`,row_id:`agent-00${e}`,addr:`192.168.1.${100+e}:6001`,region:e%2==0?`us-west-2`:`us-east-1`,architecture:`x86_64`,first_contact:new Date(Date.now()-e*24*60*60*1e3).toISOString(),occupied_slots:JSON.stringify({cpu:`4`,mem:`8589934592`,"cuda.device":`1`}),available_slots:JSON.stringify({cpu:`16`,mem:`34359738368`,"cuda.device":`2`,"cuda.shares":`2.0`}),live_stat:JSON.stringify({node:{cpu_util:{current:25.5+e*5,capacity:100,pct:25.5+e*5},mem:{current:`8589934592`,capacity:`34359738368`,pct:`25`},disk:{current:`107374182400`,capacity:`536870912000`,pct:`20`},net_rx:{current:`1048576`},net_tx:{current:`524288`},cuda_util:{current:`50`,capacity:`100`},cuda_mem:{current:`4294967296`,capacity:`8589934592`,pct:`50`}},devices:{cpu_util:{0:25.5,1:30,2:20,3:28.5}}}),status:`ALIVE`,scaling_group:`default`,compute_plugins:JSON.stringify({cuda:{version:`12.0.1`,cuda_version:`12.0`}}),version:`24.03.0`,schedulable:!0,lost_at:null,...t}),q={name:`Basic`,parameters:{docs:{description:{story:`Basic agent table displaying multiple agents with their resource allocations, utilization, and status.`}}},render:e=>L(I,{mockResolvers:{Query:()=>({agent_nodes:{edges:[{node:K(1)},{node:K(2,{status:`TERMINATED`})},{node:K(3)},{node:K(4,{schedulable:!1})},{node:K(5)}],count:5}})},children:L(G,{...e})})},J={name:`ClickableAgentNames`,parameters:{docs:{description:{story:`Demonstrates clickable agent names. Click on any agent ID to trigger the callback.`}}},render:()=>{let[e,t]=ze(null);return R(`div`,{children:[R(`div`,{style:{marginBottom:16},children:[L(`strong`,{children:`Selected Agent:`}),` `,e?e.row_id:`None`]}),L(I,{mockResolvers:{Query:()=>({agent_nodes:{edges:[{node:K(1)},{node:K(2)},{node:K(3)}],count:3}})},children:L(G,{onClickAgentName:e=>{t(e)}})})]})}},Y={name:`CustomColumns`,parameters:{docs:{description:{story:`Demonstrates column customization by adding an actions column at the beginning of the table.`}}},render:()=>L(I,{mockResolvers:{Query:()=>({agent_nodes:{edges:[{node:K(1)},{node:K(2)},{node:K(3)}],count:3}})},children:L(G,{customizeColumns:e=>[{key:`actions`,title:`Actions`,fixed:`left`,width:100,render:(e,t)=>L(ye,{size:`small`,onClick:()=>alert(`Managing agent: ${t.row_id}`),children:`Manage`})},...e]})})},X={name:`LoadingState`,parameters:{docs:{description:{story:`Shows the agent table in a loading state with reduced opacity.`}}},render:()=>L(I,{mockResolvers:{Query:()=>({agent_nodes:{edges:[{node:K(1)},{node:K(2)}],count:2}})},children:L(G,{loading:!0})})},Z={name:`EmptyState`,parameters:{docs:{description:{story:`Shows the agent table when no agents are available.`}}},render:()=>L(I,{mockResolvers:{Query:()=>({agent_nodes:{edges:[],count:0}})},children:L(G,{})})},Q={name:`DifferentStatuses`,parameters:{docs:{description:{story:`Displays agents with different statuses to show how the table renders each state.`}}},render:()=>L(I,{mockResolvers:{Query:()=>({agent_nodes:{edges:[{node:K(1,{status:`ALIVE`,schedulable:!0})},{node:K(2,{status:`TERMINATED`,schedulable:!1})},{node:K(3,{status:`ALIVE`,schedulable:!1})},{node:K(4,{status:`LOST`,schedulable:!1})}],count:4}})},children:L(G,{})})},$={name:`RealWorldUsage`,parameters:{docs:{description:{story:`Demonstrates a realistic use case combining clickable agent names, sorting, and custom columns.`}}},render:()=>{let[e,t]=ze(null),[n,r]=ze(`-first_contact`);return R(`div`,{children:[R(`div`,{style:{marginBottom:16,padding:12,background:`#f5f5f5`,borderRadius:4},children:[R(`div`,{children:[L(`strong`,{children:`Selected Agent:`}),` `,e?e.row_id:`None`]}),R(`div`,{children:[L(`strong`,{children:`Sort Order:`}),` `,n||`None`]})]}),L(I,{mockResolvers:{Query:()=>({agent_nodes:{edges:[{node:K(1)},{node:K(2,{status:`TERMINATED`})},{node:K(3)},{node:K(4,{schedulable:!1})},{node:K(5)},{node:K(6)}],count:6}})},children:L(G,{order:n,onClickAgentName:e=>t(e),onChangeOrder:e=>r(e),customizeColumns:e=>[{key:`actions`,title:`Actions`,fixed:`left`,width:100,render:(e,n)=>L(ye,{size:`small`,type:`link`,onClick:()=>t(n),children:`Select`})},...e]})})]})}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
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
}`,...$.parameters?.docs?.source},description:{story:`Real-world example combining multiple features.`,...$.parameters?.docs?.description}}},vt=[`Default`,`WithClickableAgentNames`,`WithCustomColumns`,`Loading`,`Empty`,`DifferentStatuses`,`RealWorldExample`]})))()}yt();export{q as Default,Q as DifferentStatuses,Z as Empty,X as Loading,$ as RealWorldExample,J as WithClickableAgentNames,Y as WithCustomColumns,vt as __namedExportsOrder,_t as default};