import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-DlPsW1c0.js";import{n,t as r}from"./_baseAssignValue-BWbtd6qj.js";import{n as i,t as a}from"./castArray-AZdtGfv6.js";import{n as o,t as ee}from"./compact-C9OPbfhP.js";import{i as s,r as te}from"./keyBy-CtdSHXF8.js";import{m as ne,t as re}from"./hooks-CWfVxhQL.js";import{c,g as l,h as ie,i as u,l as d,m as ae,n as f,o as oe,p as se,r as ce,s as p,t as le}from"./MockVFolderFileProviders-Ctl_efKF.js";import{i as ue,r as de}from"./includes-9bFBXpF0.js";import{n as m,t as h}from"./some-h0q6V2XB.js";import{t as fe}from"./jsx-runtime-MKhVqBIO.js";import{n as pe,t as g}from"./useBAIi18n-esubnAWm.js";import{t as _}from"./compiler-runtime-DU4U6aph.js";import{n as me,t as he}from"./createLucideIcon-DZQmmCGU.js";import{i as v,r as ge}from"./BAIFetchKeyButton-CC3pkMg0.js";import{n as _e,t as ve}from"./plus-DLzViOQa.js";import{n as ye,t as be}from"./rotate-cw-C9SgJujj.js";import{a as xe,o as Se}from"./touchPresentation-BRIObw72.js";import{n as Ce,t as we}from"./BAICard-B_J8IMyO.js";import{r as Te,t as Ee}from"./Tooltip-Dun_Df42.js";import{n as De,t as Oe}from"./Form-DNpvu-S0.js";import{Tn as y,b,h as x,m as S,wn as ke,y as Ae}from"./iframe-BIr0u5ls.js";import{n as C,t as je}from"./BAIFlex-DnaoYTJ1.js";import{i as Me,n as Ne,t as w}from"./useMountableVFolders-jv70w8LE.js";import{n as T,r as E}from"./dist-VyLUzrdQ.js";import{n as D,t as O}from"./BAIButton-CDoBL-Wt.js";import{n as k,t as Pe}from"./Token-rmm0akVf.js";import{n as A,t as Fe}from"./TextInput-Wc6ncg8a.js";import{n as j,t as Ie}from"./BAIQuestionIconWithTooltip-B9_fi1Y2.js";import{n as Le,t as Re}from"./BAILink-DSZln00I.js";import{n as M,t as ze}from"./BAIVFolderPathPicker-CA2i3CYl.js";var N,P;function F(){return(F=e((()=>{n(),s(),N=Object.prototype.hasOwnProperty,P=te(function(e,t,n){N.call(e,n)?++e[n]:r(e,n,1)})})))()}function Be(e){for(var t=-1,n=e==null?0:e.length,i={};++t<n;){var a=e[t];r(i,a[0],a[1])}return i}function I(){return(I=e((()=>{n()})))()}var L,Ve;function R(){return(R=e((()=>{me(),L={name:`arrow-right`,size:24,node:[[`path`,{d:`M5 12h14`,key:`1ays0h`}],[`path`,{d:`m12 5 7 7-7 7`,key:`xquz4c`}]]},L.node,Ve=he(L)})))()}function He(e){return e.subpathError}function Ue(e){return[e.entityId,e.name]}function We(e){return e.vfolderId}function Ge(e){return e.name?[e.vfolderId,e.name]:null}var Ke,qe,z,Je,Ye,Xe,Ze,Qe,$e,et;function tt(){return(tt=e((()=>{Ke=_(),b(),Oe(),re(),g(),w(),D(),Ce(),C(),Le(),j(),x(),A(),l(),M(),ae(),v(),k(),Te(),xe(),F(),de(),h(),I(),o(),i(),R(),_e(),ye(),y(),qe=t(),z=fe(),Je=/^[a-zA-Z0-9_/.-]*$/,Ye=`/home/work/`,Xe=(e,t,n=Ye)=>{let r=t==null?void 0:t.trim();return r?r.startsWith(`/`)?r:`${n}${r}`:`${n}${e}`},Ze=e=>{let t=e==null?void 0:e.trim();return t?t.startsWith(`/`)?!0:t.split(`/`).some(e=>e===`..`):!1},Qe=(e,t)=>{let n=(t==null?void 0:t.aliasBasePath)??`/home/work/`,r=e??[],i={};r.forEach(e=>{i[e.vfolderId]=Xe(e.name||e.vfolderId,e.mountDestination,n)});let a=new Set(((t==null?void 0:t.autoMountedFolders)??[]).map(e=>Xe(e.name,``,n))),o=P([...Object.values(i),...a]),ee=(e,t)=>{if(!Je.test(e.mountDestination??``))return`invalidFormat`;if(!(o[t]<=1))return a.has(t)?`overlappingWithAutoMount`:`overlapping`},s={};return r.forEach(e=>{let t=i[e.vfolderId];s[e.vfolderId]={mountDestination:t,aliasError:ee(e,t),subpathError:Ze(e.subpath)}}),s},$e=e=>{"use memo";let t=(0,Ke.c)(3),{t:n}=pe(),r;return t[0]!==e||t[1]!==n?(r={validator:(t,r)=>{let i=ue(Qe(r,e)),a=e=>Promise.reject(Error(n(e))),o=e=>m(i,t=>t.aliasError===e);return o(`invalidFormat`)?a(`comp:BAIVFolderMountConfigInput.AliasInvalid`):o(`overlappingWithAutoMount`)?a(`comp:BAIVFolderMountConfigInput.AliasOverlappingWithAutoMount`):o(`overlapping`)?a(`comp:BAIVFolderMountConfigInput.AliasOverlapping`):m(i,He)?a(`comp:BAIVFolderMountConfigInput.SubpathInvalid`):Promise.resolve()}},t[0]=e,t[1]=n,t[2]=r):r=t[2],r},et=e=>{"use memo";let t=(0,Ke.c)(96),n,r,i,o,s,te,re,c,l;t[0]===e?(n=t[1],r=t[2],i=t[3],o=t[4],s=t[5],te=t[6],re=t[7],c=t[8],l=t[9]):({scope:c,mountableHosts:o,filter:r,disabled:n,aliasBasePath:l,folderExplorerPath:i,onClickCreateFolder:s,ref:re,...te}=e,t[0]=e,t[1]=n,t[2]=r,t[3]=i,t[4]=o,t[5]=s,t[6]=te,t[7]=re,t[8]=c,t[9]=l);let u=l===void 0?Ye:l,{t:d}=pe(),{message:ae}=Ae.useApp(),{token:f}=Se(),oe;t[10]===Symbol.for(`react.memo_cache_sentinel`)?(oe={defaultValue:[]},t[10]=oe):oe=t[10];let[ce,p]=ne(te,oe),le=(0,qe.useRef)(null),[ue,de]=(0,qe.useTransition)(),m;t[11]!==o||t[12]!==c?(m={scope:c,mountableHosts:o},t[11]=o,t[12]=c,t[13]=m):m=t[13];let{autoMountedFolders:h,refetch:fe}=Me(m),g;t[14]===fe?g=t[15]:(g=()=>{de(()=>{var e;(e=le.current)==null||e.refetch(),fe()})},t[14]=fe,t[15]=g);let _=g,me;t[16]===_?me=t[17]:(me=()=>({refetch:_}),t[16]=_,t[17]=me),(0,qe.useImperativeHandle)(re,me);let he;t[18]===ce?he=t[19]:(he=ce??[],t[18]=ce,t[19]=he);let v=he,_e;t[20]!==u||t[21]!==h||t[22]!==v?(_e=Qe(v,{aliasBasePath:u,autoMountedFolders:h}),t[20]=u,t[21]=h,t[22]=v,t[23]=_e):_e=t[23];let ye=_e,xe;t[24]!==ae||t[25]!==v||t[26]!==p||t[27]!==d?(xe=e=>{let{resolved:t,unresolved:n}=e,r=Be(t.map(Ue)),i=e=>!!r[e.vfolderId]&&e.name!==r[e.vfolderId];(n.length!==0||v.some(i))&&(p(e=>e.filter(e=>!n.includes(e.vfolderId)).map(e=>i(e)?{...e,name:r[e.vfolderId]}:e)),n.length>0&&ae.warning(d(`comp:BAIVFolderMountConfigInput.UnmountableFoldersRemoved`)))},t[24]=ae,t[25]=v,t[26]=p,t[27]=d,t[28]=xe):xe=t[28];let Ce=xe,Te;t[29]!==v||t[30]!==p?(Te=e=>{p(e.map(e=>{let t=v.find(t=>t.vfolderId===e.value);return t?{...t,name:e.label}:{vfolderId:e.value,name:e.label,mountDestination:``,subpath:``}}))},t[29]=v,t[30]=p,t[31]=Te):Te=t[31];let Oe=Te,y;t[32]===d?y=t[33]:(y=d(`comp:BAIVFolderMountConfigInput.SelectFolder`),t[32]=d,t[33]=y);let b;t[34]===d?b=t[35]:(b=d(`comp:BAIVFolderMountConfigInput.SelectFolder`),t[34]=d,t[35]=b);let x;t[36]===o?x=t[37]:(x=Ne(o),t[36]=o,t[37]=x);let C;t[38]===r?C=t[39]:(C=ee([{status:{equals:`READY`}},{name:{notStartsWith:`.`}},r]),t[38]=r,t[39]=C);let w;t[40]===C?w=t[41]:(w={AND:C},t[40]=C,t[41]=w);let T;t[42]===v?T=t[43]:(T=v.map(We),t[42]=v,t[43]=T);let E;t[44]===v?E=t[45]:(E=Be(ee(v.map(Ge))),t[44]=v,t[45]=E);let D;t[46]===Oe?D=t[47]:(D=(e,t)=>Oe(a(t??[])),t[46]=Oe,t[47]=D);let k;t[48]!==n||t[49]!==Ce||t[50]!==c||t[51]!==y||t[52]!==b||t[53]!==x||t[54]!==w||t[55]!==T||t[56]!==E||t[57]!==D?(k=(0,z.jsx)(se,{ref:le,multiple:!0,allowClear:!0,selectionMark:`checkbox`,label:y,isLabelHidden:!0,isDisabled:n,placeholder:b,scope:c,filter:x,optionFilter:w,disableUnmountable:!0,value:T,fallbackLabels:E,onChange:D,onResolve:Ce}),t[48]=n,t[49]=Ce,t[50]=c,t[51]=y,t[52]=b,t[53]=x,t[54]=w,t[55]=T,t[56]=E,t[57]=D,t[58]=k):k=t[58];let A;t[59]===d?A=t[60]:(A=d(`comp:BAIVFolderMountConfigInput.Folders`),t[59]=d,t[60]=A);let j;t[61]!==n||t[62]!==s||t[63]!==d?(j=s?(0,z.jsx)(O,{icon:(0,z.jsx)(ve,{size:`1em`}),title:d(`comp:BAIVFolderMountConfigInput.CreateFolder`),disabled:n,onClick:s}):null,t[61]=n,t[62]=s,t[63]=d,t[64]=j):j=t[64];let Le;t[65]===Symbol.for(`react.memo_cache_sentinel`)?(Le=(0,z.jsx)(be,{size:`1em`}),t[65]=Le):Le=t[65];let M;t[66]===d?M=t[67]:(M=d(`comp:BAIVFolderMountConfigInput.Refresh`),t[66]=d,t[67]=M);let N;t[68]!==n||t[69]!==ue||t[70]!==_||t[71]!==M?(N=(0,z.jsx)(O,{icon:Le,title:M,loading:ue,disabled:n,onClick:_}),t[68]=n,t[69]=ue,t[70]=_,t[71]=M,t[72]=N):N=t[72];let P;t[73]!==A||t[74]!==j||t[75]!==N?(P=(0,z.jsxs)(ge,{label:A,children:[j,N]}),t[73]=A,t[74]=j,t[75]=N,t[76]=P):P=t[76];let F;t[77]!==k||t[78]!==P?(F=(0,z.jsxs)(je,{direction:`row`,gap:`xs`,justify:`between`,children:[k,P]}),t[77]=k,t[78]=P,t[79]=F):F=t[79];let I;t[80]!==n||t[81]!==i||t[82]!==v||t[83]!==p||t[84]!==ye||t[85]!==d||t[86]!==f?(I=v.length>0&&(0,z.jsx)(we,{size:`small`,children:(0,z.jsxs)(`div`,{className:`bai-vfolder-mount-config__grid`,role:`list`,children:[(0,z.jsxs)(`div`,{className:`bai-vfolder-mount-config__header`,children:[(0,z.jsxs)(je,{gap:`xxs`,align:`center`,children:[(0,z.jsx)(S,{type:`secondary`,children:d(`comp:BAIVFolderMountConfigInput.SourcePath`)}),(0,z.jsx)(Ie,{title:d(`comp:BAIVFolderMountConfigInput.SubpathTooltip`)})]}),(0,z.jsx)(`span`,{}),(0,z.jsxs)(je,{gap:`xxs`,align:`center`,children:[(0,z.jsx)(S,{type:`secondary`,children:d(`comp:BAIVFolderMountConfigInput.DestinationPath`)}),(0,z.jsx)(Ie,{title:d(`comp:BAIVFolderMountConfigInput.PathAndAliasTooltip`)})]}),(0,z.jsx)(`span`,{})]}),v.map(e=>{let t=e.name||e.vfolderId,r=e.mountDestination??``,a=ye[e.vfolderId],o=a.aliasError?d({invalidFormat:`comp:BAIVFolderMountConfigInput.AliasInvalid`,overlapping:`comp:BAIVFolderMountConfigInput.AliasOverlapping`,overlappingWithAutoMount:`comp:BAIVFolderMountConfigInput.AliasOverlappingWithAutoMount`}[a.aliasError]):void 0,ee=!!a.subpathError,s=t=>p(n=>n.map(n=>n.vfolderId===e.vfolderId?{...n,...t}:n));return(0,z.jsxs)(`div`,{className:`bai-vfolder-mount-config__row`,role:`listitem`,children:[(0,z.jsx)(De.Item,{validateStatus:ee?`error`:void 0,help:ee?d(`comp:BAIVFolderMountConfigInput.SubpathInvalid`):void 0,style:{marginBottom:0,minWidth:0},children:(0,z.jsxs)(`div`,{className:`bai-vfolder-mount-config__source`,children:[(0,z.jsxs)(`div`,{className:`bai-vfolder-mount-config__folder`,children:[(0,z.jsx)(ie,{vfolderId:e.vfolderId}),(0,z.jsx)(`span`,{className:`bai-vfolder-mount-config__folder-name`,children:i?(0,z.jsx)(Re,{to:i(e.vfolderId),ellipsis:!0,children:t}):(0,z.jsx)(S,{ellipsis:{tooltip:!0},children:t})}),(0,z.jsx)(`span`,{className:`bai-vfolder-mount-config__separator`,children:`/`})]}),(0,z.jsx)(ze,{label:d(`comp:BAIVFolderMountConfigInput.Subpath`),placeholder:d(`comp:VFolderPathPicker.SelectAPath`),allowClear:!0,disabled:n,vfolderUuid:e.vfolderId,value:e.subpath,onChange:e=>s({subpath:e??``})})]})}),(0,z.jsx)(`span`,{className:`bai-vfolder-mount-config__arrow`,"aria-hidden":!0,children:(0,z.jsx)(Ve,{size:`1em`})}),(0,z.jsx)(De.Item,{validateStatus:o?`error`:void 0,help:o,extra:r.trim()&&r.trim()!==a.mountDestination?(0,z.jsx)(S,{type:`secondary`,ellipsis:{tooltip:!0},children:a.mountDestination}):void 0,style:{marginBottom:0,minWidth:0},children:(0,z.jsx)(Fe,{"aria-label":d(`comp:BAIVFolderMountConfigInput.AliasPlaceholder`),hasClear:!0,disabled:n,placeholder:a.mountDestination,value:r,onChange:e=>s({mountDestination:e})})}),(0,z.jsx)(`div`,{className:`bai-vfolder-mount-config__remove`,children:(0,z.jsx)(Ee,{content:d(`comp:BAIVFolderMountConfigInput.RemoveFolder`),children:(0,z.jsx)(O,{type:`text`,size:`small`,disabled:n,"aria-label":d(`comp:BAIVFolderMountConfigInput.RemoveFolder`),icon:(0,z.jsx)(ke,{size:f(`--spacing-4`),color:f(`--color-text-quaternary`)}),style:{flexShrink:0,height:f(`--size-element-md`)},onClick:()=>p(t=>t.filter(t=>t.vfolderId!==e.vfolderId))})})})]},e.vfolderId)})]})}),t[80]=n,t[81]=i,t[82]=v,t[83]=p,t[84]=ye,t[85]=d,t[86]=f,t[87]=I):I=t[87];let L;t[88]!==h||t[89]!==i||t[90]!==d?(L=h.length>0&&(0,z.jsxs)(je,{gap:`xxs`,align:`center`,wrap:`wrap`,children:[(0,z.jsx)(S,{type:`secondary`,children:d(`comp:BAIVFolderMountConfigInput.AutoMountedFolders`)}),h.map(e=>i?(0,z.jsx)(Re,{to:i(e.vfolderId),children:(0,z.jsx)(Pe,{label:e.name})},e.vfolderId):(0,z.jsx)(Pe,{label:e.name},e.vfolderId))]}),t[88]=h,t[89]=i,t[90]=d,t[91]=L):L=t[91];let R;return t[92]!==F||t[93]!==I||t[94]!==L?(R=(0,z.jsxs)(je,{direction:`column`,align:`stretch`,gap:`xs`,children:[F,I,L]}),t[92]=F,t[93]=I,t[94]=L,t[95]=R):R=t[95],R}})))()}var nt,B,rt,it,at,ot,st,ct,lt,ut,dt,ft,pt,mt,ht,gt,_t,vt,yt,bt,xt,St,Ct,wt,Tt,Et,Dt,Ot,kt,At,V,H,jt,U,Mt,Nt,W,G,K,q,J,Y,X,Z,Q,$,Pt;function Ft(){return(Ft=e((()=>{Oe(),w(),f(),oe(),D(),x(),tt(),nt=t(),T(),B=fe(),{action:Ot}=__STORYBOOK_MODULE_ACTIONS__,kt=760,At=[...c,p({id:`aaaaaaaa-bbbb-cccc-dddd-eeeeffff0006`,name:`model-checkpoints`})],V=e=>At[e].id,H=e=>At[e].name,jt=()=>({[V(0)]:{".":[d(`dataset`,`DIRECTORY`,`2026-07-21T14:02:00`),d(`scripts`,`DIRECTORY`,`2026-07-18T09:45:00`),d(`README.md`,`FILE`,`2026-07-01T11:20:00`)],dataset:[d(`train`,`DIRECTORY`,`2026-07-22T10:05:00`),d(`validation`,`DIRECTORY`,`2026-07-22T10:05:00`)],"dataset/train":[],"dataset/validation":[],scripts:[]},[V(1)]:{".":[d(`imagenet`,`DIRECTORY`,`2026-07-10T08:00:00`),d(`LICENSE`,`FILE`,`2026-07-02T12:00:00`)],imagenet:[]},[V(5)]:{".":[d(`epoch-001`,`DIRECTORY`,`2026-07-27T03:12:00`)],"epoch-001":[]}}),U=({initialValue:e=[],...t})=>{let[n,r]=(0,nt.useState)(e),i=(0,nt.useRef)(null);return(0,B.jsxs)(`div`,{style:{width:kt},children:[(0,B.jsx)(et,{ref:i,scope:u,mountableHosts:ce,...t,value:n,onChange:e=>{var n;r(e),(n=t.onChange)==null||n.call(t,e)}}),(0,B.jsx)(`div`,{style:{marginTop:16},children:(0,B.jsx)(O,{onClick:()=>{var e;return(e=i.current)==null?void 0:e.refetch()},children:`Refetch via ref`})}),(0,B.jsxs)(`div`,{style:{marginTop:24},children:[(0,B.jsx)(S,{strong:!0,children:`Form value (onChange result)`}),(0,B.jsx)(`pre`,{style:{marginTop:8,padding:12,background:`rgba(0,0,0,0.04)`,borderRadius:6,fontSize:12},children:JSON.stringify(n,null,2)})]})]})},Mt=[{vfolderId:V(0),name:H(0),mountDestination:`shared`,subpath:``},{vfolderId:V(1),name:H(1),mountDestination:`shared`,subpath:``}],Nt={title:`Fragments/BAIVFolderMountConfigInput`,component:et,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:"\n**BAIVFolderMountConfigInput** is a reusable, schema-agnostic controlled input\nfor configuring vfolder mounts.\n\n- Picks folders with `BAIScopedVFolderSelect`, which pages `scopedVFoldersV2` over the\n  `scope` the caller passes (usually its own folders and the current project's), filtered on the server: the host must be in\n  `mountableHosts` (those granting `mount-in-session`), the folder must be ready,\n  and dotfile folders are left out (the session mounts them anyway). Search runs\n  on the server too, and `filter` (a `VFolderFilter`) narrows the options further\n  without shrinking the selection. A folder whose mount level is NONE is listed\n  but cannot be picked.\n- It **suspends** on the first page, so the consumer owns the Suspense boundary. A\n  selected folder the loaded options do not cover is looked up by id; one the\n  mount gates reject is dropped from the value with a warning toast.\n- Beside the select sits a button group: **⟳** always re-runs the folder query (also\n  exposed imperatively as `ref.refetch()`), and **+** is rendered only when\n  `onClickCreateFolder` is given — the folder-creation modal belongs to the host app.\n- Each selected folder appears as a row with a **mount path (alias)** input and an\n  optional **subpath** picker (which subfolder of the vfolder to mount as the source; `/` = root),\n  which opens a directory browser instead of accepting typed text.\n- `mountDestination` stores the **raw alias** the user typed — `''` mounts at the default\n  `/home/work/<name>`, a relative segment like `data` resolves to `/home/work/data`, and an\n  absolute path like `/data` is used as-is. Resolve it with the exported `inputToMountDestination`.\n- It reads the auto-mounted folders (ready dotfile folders in the same scope) itself: they join the\n  overlap check (a user alias colliding with one is flagged) and are shown as read-only tokens at the bottom.\n- `folderExplorerPath` turns every folder name the component renders — each mount row and each\n  auto-mounted badge — into a link into the host app's folder explorer (see **WithFolderExplorerLinks**).\n- Emits a single `VFolderMountConfigValue[]`. The inline per-row errors are advisory UX; to gate a\n  form, wrap the component in one named `Form.Item` whose `rules` carry\n  `useVFolderMountConfigFormRule` (see the **WithFormValidation** story).\n\nThe stories below mock the folder list behind the providers' `suspenseFallback`,\nso of the six fixture folders `cold-archive` is dropped (its host is not in\n`mountableHosts`), `other-team-data` belongs to another project, and `.config` is\nnever offered but listed as an auto-mounted folder.\n"}}},decorators:[e=>(0,B.jsx)(E,{children:(0,B.jsx)(le,{folders:At,trees:jt,suspenseFallback:`Loading...`,children:(0,B.jsx)(e,{})})})],argTypes:{value:{description:`Controlled list of vfolder mount configurations`,table:{type:{summary:`VFolderMountConfigValue[]`}}},onChange:{action:`changed`,description:`Called with the updated mount configuration list`},scope:{control:!1,description:"The scopes a session mounts from (usually `mountableVFolderScope(userId, projectId)`)",table:{type:{summary:`VFolderScope`}}},filter:{control:!1,description:`Server-side VFolderFilter ANDed onto the options query; narrows the options only`,table:{type:{summary:`VFolderFilter`}}},disabled:{control:{type:`boolean`},description:`Disable selection and all row inputs`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},aliasBasePath:{control:{type:`text`},description:`Base path prepended to a relative alias input`,table:{type:{summary:`string`},defaultValue:{summary:`/home/work/`}}},folderExplorerPath:{control:!1,description:`Route that opens a folder in the host app's folder explorer; given, folder names render as links`,table:{type:{summary:`(vfolderId: string) => LinkProps['to']`}}},mountableHosts:{control:{type:`object`},description:"Hosts granting `mount-in-session`, supplied by the host app",table:{type:{summary:`string[]`}}},onClickCreateFolder:{control:!1,description:`Opens the host app's folder-creation modal; the create button appears only when it is given`,table:{type:{summary:`() => void`}}}},args:{scope:u,mountableHosts:ce}},W={parameters:{docs:{description:{story:"Empty initial state. The dropdown offers only the mountable folders of the current project. Select one to add a row, then type its mount path and click its subpath field to browse the folder. New rows start at the folder root, shown as `/`. The live form value is shown below — note `mountDestination` holds the raw alias you typed, while `subpath` only ever comes from the picker."}}},render:e=>(0,B.jsx)(U,{...e})},G={parameters:{docs:{description:{story:"Prefilled with three folders demonstrating each alias mode: a relative segment (`data` → `/home/work/data`), an absolute path (`/mnt/shared`, used as-is), and an empty alias (falls back to `/home/work/<name>`). The first mounts the `dataset/train` subpath; the other two mount the folder root, which the picker shows as `/`."}}},render:e=>(0,B.jsx)(U,{...e,initialValue:[{vfolderId:V(0),name:H(0),mountDestination:`data`,subpath:`dataset/train`},{vfolderId:V(1),name:H(1),mountDestination:`/mnt/shared`,subpath:``},{vfolderId:V(5),name:H(5),mountDestination:``,subpath:``}]})},K={parameters:{docs:{description:{story:"Two folders use the same alias (`shared`), so both resolve to `/home/work/shared` and are flagged with the overlap error. The third row types an alias the format check rejects. `useVFolderMountConfigFormRule` rejects this value."}}},render:e=>(0,B.jsx)(U,{...e,initialValue:[...Mt,{vfolderId:V(5),name:H(5),mountDestination:`bad path!`,subpath:``}]})},q={parameters:{docs:{description:{story:"The ready dotfile folder `.config` is read as auto-mounted and listed as a read-only token below the rows (dotfile folders are never offered in the select). The first folder aliases to `.config`, colliding with the auto-mounted `/home/work/.config`, so it shows the overlap error."}}},render:e=>(0,B.jsx)(U,{...e,initialValue:[{vfolderId:V(0),name:H(0),mountDestination:`.config`,subpath:`dataset`},{vfolderId:V(5),name:H(5),mountDestination:`checkpoints`,subpath:``}]})},J={args:{folderExplorerPath:e=>`#folder=${e}`},parameters:{docs:{description:{story:"With `folderExplorerPath` given, each row's folder name renders as a link (still truncating with a tooltip) and each auto-mounted badge becomes one too. Without it they stay plain text, as in the other stories."}}},render:e=>(0,B.jsx)(U,{...e,initialValue:[{vfolderId:V(0),name:H(0),mountDestination:`data`,subpath:``}]})},Y={parameters:{docs:{description:{story:"The component is wrapped in one named `Form.Item` whose `rules` carry `useVFolderMountConfigFormRule`, so submitting with the two colliding `shared` aliases fails validation with the already-translated message. Fix the aliases and submit again to pass."}}},render:e=>(0,B.jsx)(()=>{let[t]=De.useForm(),[n,r]=(0,nt.useState)(``),{autoMountedFolders:i}=Me({scope:u,mountableHosts:e.mountableHosts}),a=$e({aliasBasePath:e.aliasBasePath,autoMountedFolders:i});return(0,B.jsxs)(De,{form:t,layout:`vertical`,style:{width:kt},initialValues:{mounts:Mt},children:[(0,B.jsx)(De.Item,{name:`mounts`,label:`VFolder mounts`,rules:[a],children:(0,B.jsx)(et,{...e})}),(0,B.jsx)(O,{type:`primary`,onClick:()=>{t.validateFields().then(()=>r(`✅ Valid — form submitted.`)).catch(()=>r(`❌ Invalid — fix the flagged rows.`))},children:`Validate & submit`}),n?(0,B.jsx)(`div`,{style:{marginTop:16},children:(0,B.jsx)(S,{children:n})}):null]})},{})},X={parameters:{docs:{description:{story:"Passing `onClickCreateFolder` adds a **+** button to the group beside the select; clicking it logs to the Actions panel, standing in for the host opening its folder-creation modal. In the app the host then calls `ref.refetch()` (the **Refetch via ref** button below does the same) and appends the created folder to the value. The **⟳** button next to it is always rendered and re-runs the folder list on its own."}}},render:e=>(0,B.jsx)(U,{...e,onClickCreateFolder:Ot(`createFolderClicked`)})},Z={parameters:{docs:{description:{story:"`mountableHosts={[]}` — no host grants `mount-in-session`, so every folder is gated out and the popup shows the empty state. This is the case a launcher has to surface rather than letting the user pick a folder the session cannot mount."}}},render:e=>(0,B.jsx)(U,{...e,mountableHosts:[]})},Q={parameters:{docs:{description:{story:"A value restored from a template can name a folder this owner cannot mount. With `mountableHosts={[]}` nothing passes the host gate, so the prefilled entries are dropped from the value on mount and a warning toast explains the shrinking selection — the emitted `onChange` payload below goes straight to `[]`."}}},render:e=>(0,B.jsx)(U,{...e,mountableHosts:[],initialValue:[{vfolderId:V(0),name:H(0),mountDestination:``,subpath:``},{vfolderId:V(1),name:H(1),mountDestination:`shared`,subpath:``}]})},$={parameters:{docs:{description:{story:`Disabled state — the select, the alias input, the subpath picker and the remove button are all inert; the picked subpath stays readable.`}}},render:e=>(0,B.jsx)(U,{...e,disabled:!0,initialValue:[{vfolderId:V(1),name:H(1),mountDestination:`shared`,subpath:``}]})},W.parameters={...W.parameters,docs:{...(rt=W.parameters)==null?void 0:rt.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Empty initial state. The dropdown offers only the mountable folders of the current project. Select one to add a row, then type its mount path and click its subpath field to browse the folder. New rows start at the folder root, shown as \`/\`. The live form value is shown below — note \`mountDestination\` holds the raw alias you typed, while \`subpath\` only ever comes from the picker.'
      }
    }
  },
  render: args => <ControlledDemo {...args} />
}`,...(it=W.parameters)==null||(it=it.docs)==null?void 0:it.source}}},G.parameters={...G.parameters,docs:{...(at=G.parameters)==null?void 0:at.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Prefilled with three folders demonstrating each alias mode: a relative segment (\`data\` → \`/home/work/data\`), an absolute path (\`/mnt/shared\`, used as-is), and an empty alias (falls back to \`/home/work/<name>\`). The first mounts the \`dataset/train\` subpath; the other two mount the folder root, which the picker shows as \`/\`.'
      }
    }
  },
  render: args => <ControlledDemo {...args} initialValue={[{
    vfolderId: folderId(0),
    name: folderName(0),
    mountDestination: 'data',
    subpath: 'dataset/train'
  }, {
    vfolderId: folderId(1),
    name: folderName(1),
    mountDestination: '/mnt/shared',
    subpath: ''
  }, {
    vfolderId: folderId(5),
    name: folderName(5),
    mountDestination: '',
    subpath: ''
  }]} />
}`,...(ot=G.parameters)==null||(ot=ot.docs)==null?void 0:ot.source}}},K.parameters={...K.parameters,docs:{...(st=K.parameters)==null?void 0:st.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Two folders use the same alias (\`shared\`), so both resolve to \`/home/work/shared\` and are flagged with the overlap error. The third row types an alias the format check rejects. \`useVFolderMountConfigFormRule\` rejects this value.'
      }
    }
  },
  render: args => <ControlledDemo {...args} initialValue={[...overlappingSharedAliases, {
    vfolderId: folderId(5),
    name: folderName(5),
    mountDestination: 'bad path!',
    subpath: ''
  }]} />
}`,...(ct=K.parameters)==null||(ct=ct.docs)==null?void 0:ct.source},description:{story:`Error state — two folders resolve to the same mount path, so both rows show
the overlap error.`,...(lt=K.parameters)==null||(lt=lt.docs)==null?void 0:lt.description}}},q.parameters={...q.parameters,docs:{...(ut=q.parameters)==null?void 0:ut.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'The ready dotfile folder \`.config\` is read as auto-mounted and listed as a read-only token below the rows (dotfile folders are never offered in the select). The first folder aliases to \`.config\`, colliding with the auto-mounted \`/home/work/.config\`, so it shows the overlap error.'
      }
    }
  },
  render: args => <ControlledDemo {...args} initialValue={[{
    vfolderId: folderId(0),
    name: folderName(0),
    mountDestination: '.config',
    subpath: 'dataset'
  }, {
    vfolderId: folderId(5),
    name: folderName(5),
    mountDestination: 'checkpoints',
    subpath: ''
  }]} />
}`,...(dt=q.parameters)==null||(dt=dt.docs)==null?void 0:dt.source},description:{story:`Auto-mounted folders are listed as read-only tags at the bottom, and a user
alias that collides with one of them is flagged as an overlap.`,...(ft=q.parameters)==null||(ft=ft.docs)==null?void 0:ft.description}}},J.parameters={...J.parameters,docs:{...(pt=J.parameters)==null?void 0:pt.docs,source:{originalSource:`{
  args: {
    // The host builds a real route; here the id just lands in the hash.
    folderExplorerPath: vfolderId => \`#folder=\${vfolderId}\`
  },
  parameters: {
    docs: {
      description: {
        story: "With \`folderExplorerPath\` given, each row's folder name renders as a link (still truncating with a tooltip) and each auto-mounted badge becomes one too. Without it they stay plain text, as in the other stories."
      }
    }
  },
  render: args => <ControlledDemo {...args} initialValue={[{
    vfolderId: folderId(0),
    name: folderName(0),
    mountDestination: 'data',
    subpath: ''
  }]} />
}`,...(mt=J.parameters)==null||(mt=mt.docs)==null?void 0:mt.source},description:{story:"`folderExplorerPath` turns the folder names into links into the host app's\nfolder explorer — both the mount rows and the auto-mounted badges.",...(ht=J.parameters)==null||(ht=ht.docs)==null?void 0:ht.description}}},Y.parameters={...Y.parameters,docs:{...(gt=Y.parameters)==null?void 0:gt.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'The component is wrapped in one named \`Form.Item\` whose \`rules\` carry \`useVFolderMountConfigFormRule\`, so submitting with the two colliding \`shared\` aliases fails validation with the already-translated message. Fix the aliases and submit again to pass.'
      }
    }
  },
  render: args => {
    const FormValidationDemo = () => {
      const [form] = Form.useForm();
      const [result, setResult] = useState<string>('');
      const {
        autoMountedFolders
      } = useSuspendedAutoMountedVFolders({
        scope: MOCK_MOUNT_SCOPE,
        mountableHosts: args.mountableHosts
      });
      const mountConfigRule = useVFolderMountConfigFormRule({
        aliasBasePath: args.aliasBasePath,
        autoMountedFolders
      });
      return <Form form={form} layout="vertical" style={{
        width: DEMO_WIDTH
      }} initialValues={{
        mounts: overlappingSharedAliases
      }}>
          <Form.Item name="mounts" label="VFolder mounts" rules={[mountConfigRule]}>
            <BAIVFolderMountConfigInput {...args} />
          </Form.Item>
          <BAIButton type="primary" onClick={() => {
          form.validateFields().then(() => setResult('✅ Valid — form submitted.')).catch(() => setResult('❌ Invalid — fix the flagged rows.'));
        }}>
            Validate &amp; submit
          </BAIButton>
          {result ? <div style={{
          marginTop: 16
        }}>
              <BAIText>{result}</BAIText>
            </div> : null}
        </Form>;
    };
    return <FormValidationDemo />;
  }
}`,...(_t=Y.parameters)==null||(_t=_t.docs)==null?void 0:_t.source},description:{story:"Demonstrates the recommended form-gate pattern: a single named `Form.Item`\nwrapping the component, with `useVFolderMountConfigFormRule` in `rules` so\n`form.validateFields()` rejects on invalid input.",...(vt=Y.parameters)==null||(vt=vt.docs)==null?void 0:vt.description}}},X.parameters={...X.parameters,docs:{...(yt=X.parameters)==null?void 0:yt.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Passing \`onClickCreateFolder\` adds a **+** button to the group beside the select; clicking it logs to the Actions panel, standing in for the host opening its folder-creation modal. In the app the host then calls \`ref.refetch()\` (the **Refetch via ref** button below does the same) and appends the created folder to the value. The **⟳** button next to it is always rendered and re-runs the folder list on its own.'
      }
    }
  },
  render: args => <ControlledDemo {...args} onClickCreateFolder={action('createFolderClicked')} />
}`,...(bt=X.parameters)==null||(bt=bt.docs)==null?void 0:bt.source},description:{story:"The create button next to the select appears only when the host supplies\n`onClickCreateFolder`, because the folder-creation modal is a host component.",...(xt=X.parameters)==null||(xt=xt.docs)==null?void 0:xt.description}}},Z.parameters={...Z.parameters,docs:{...(St=Z.parameters)==null?void 0:St.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: '\`mountableHosts={[]}\` — no host grants \`mount-in-session\`, so every folder is gated out and the popup shows the empty state. This is the case a launcher has to surface rather than letting the user pick a folder the session cannot mount.'
      }
    }
  },
  render: args => <ControlledDemo {...args} mountableHosts={[]} />
}`,...(Ct=Z.parameters)==null||(Ct=Ct.docs)==null?void 0:Ct.source}}},Q.parameters={...Q.parameters,docs:{...(wt=Q.parameters)==null?void 0:wt.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'A value restored from a template can name a folder this owner cannot mount. With \`mountableHosts={[]}\` nothing passes the host gate, so the prefilled entries are dropped from the value on mount and a warning toast explains the shrinking selection — the emitted \`onChange\` payload below goes straight to \`[]\`.'
      }
    }
  },
  render: args => <ControlledDemo {...args} mountableHosts={[]} initialValue={[{
    vfolderId: folderId(0),
    name: folderName(0),
    mountDestination: '',
    subpath: ''
  }, {
    vfolderId: folderId(1),
    name: folderName(1),
    mountDestination: 'shared',
    subpath: ''
  }]} />
}`,...(Tt=Q.parameters)==null||(Tt=Tt.docs)==null?void 0:Tt.source}}},$.parameters={...$.parameters,docs:{...(Et=$.parameters)==null?void 0:Et.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Disabled state — the select, the alias input, the subpath picker and the remove button are all inert; the picked subpath stays readable.'
      }
    }
  },
  render: args => <ControlledDemo {...args} disabled initialValue={[{
    vfolderId: folderId(1),
    name: folderName(1),
    mountDestination: 'shared',
    subpath: ''
  }]} />
}`,...(Dt=$.parameters)==null||(Dt=Dt.docs)==null?void 0:Dt.source}}},Pt=[`Interactive`,`Prefilled`,`OverlappingPaths`,`WithAutoMountedFolders`,`WithFolderExplorerLinks`,`WithFormValidation`,`WithCreateFolderButton`,`NoMountableHost`,`PrunesUnmountableSelection`,`Disabled`]})))()}Ft();export{$ as Disabled,W as Interactive,Z as NoMountableHost,K as OverlappingPaths,G as Prefilled,Q as PrunesUnmountableSelection,q as WithAutoMountedFolders,X as WithCreateFolderButton,J as WithFolderExplorerLinks,Y as WithFormValidation,Pt as __namedExportsOrder,Nt as default};