import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-DlPsW1c0.js";import{n,t as r}from"./_baseAssignValue-BMP2r3Q5.js";import{n as i,t as a}from"./castArray-AZdtGfv6.js";import{n as o,t as s}from"./compact-C9OPbfhP.js";import{i as c,r as ee}from"./keyBy-DTb2LvP4.js";import{m as te,t as ne}from"./hooks-T_PEg8sW.js";import{c as l,g as u,h as re,i as d,l as f,m as ie,n as p,o as ae,p as oe,r as m,s as se,t as ce}from"./MockVFolderFileProviders-BXH67Cjd.js";import{n as le,t as h}from"./map-CLZMgxwS.js";import{i as ue,r as de}from"./includes-DMTgV4pD.js";import{n as fe,t as pe}from"./some-DkjZXzzg.js";import{t as g}from"./jsx-runtime-MKhVqBIO.js";import{n as me,t as he}from"./useBAIi18n-EcIybVeJ.js";import{t as ge}from"./compiler-runtime-DU4U6aph.js";import{n as _,t as _e}from"./createLucideIcon-BXqG86fR.js";import{i as ve,r as ye}from"./BAIFetchKeyButton-B6YaDYOt.js";import{n as v,t as be}from"./plus-DAwTrFAj.js";import{n as xe,t as Se}from"./rotate-cw-L-Bh31u8.js";import{a as Ce,o as we}from"./touchPresentation-SlIXP8m0.js";import{n as Te,t as Ee}from"./BAICard-FkRM4egm.js";import{r as De,t as Oe}from"./Tooltip-Cfb-ZzrB.js";import{n as y,t as b}from"./Form-Dvjnp2p3.js";import{Tn as ke,b as x,h as S,m as C,wn as Ae,y as je}from"./iframe-DrJN4crA.js";import{n as w,t as Me}from"./BAIFlex-DnaoYTJ1.js";import{i as Ne,n as Pe,t as T}from"./useMountableVFolders-tAZvtg7B.js";import{n as E,r as D}from"./dist-CCUsDPCX.js";import{n as O,t as Fe}from"./BAIButton-wlaB8OZ3.js";import{n as k,t as Ie}from"./Token-BqAd0GQ-.js";import{n as A,t as Le}from"./TextInput-Bv-4RCoU.js";import{n as j,t as Re}from"./BAIQuestionIconWithTooltip-8wSi6Edo.js";import{n as M,t as ze}from"./BAILink-Do6xWH6-.js";import{n as Be,t as Ve}from"./BAIVFolderPathPicker-CiiZdOJu.js";var N,P;function F(){return(F=e((()=>{n(),c(),N=Object.prototype.hasOwnProperty,P=ee(function(e,t,n){N.call(e,n)?++e[n]:r(e,n,1)})})))()}function He(e){for(var t=-1,n=e==null?0:e.length,i={};++t<n;){var a=e[t];r(i,a[0],a[1])}return i}function I(){return(I=e((()=>{n()})))()}var L,Ue;function R(){return(R=e((()=>{_(),L={name:`arrow-right`,size:24,node:[[`path`,{d:`M5 12h14`,key:`1ays0h`}],[`path`,{d:`m12 5 7 7-7 7`,key:`xquz4c`}]]},L.node,Ue=_e(L)})))()}function We(e){return e.subpathError}function Ge(e){return[e.entityId,e.name]}function Ke(e){return e.vfolderId}function qe(e){return e.name?[e.vfolderId,e.name]:null}var Je,Ye,z,Xe,Ze,Qe,$e,et,tt,nt;function rt(){return(rt=e((()=>{Je=ge(),x(),b(),ne(),he(),T(),O(),Te(),w(),M(),j(),S(),A(),u(),Be(),ie(),ve(),k(),De(),Ce(),F(),de(),pe(),I(),h(),o(),i(),R(),v(),xe(),ke(),Ye=t(),z=g(),Xe=/^[a-zA-Z0-9_/.-]*$/,Ze=`/home/work/`,Qe=(e,t,n=Ze)=>{let r=t?.trim();return r?r.startsWith(`/`)?r:`${n}${r}`:`${n}${e}`},$e=e=>{let t=e?.trim();return t?t.startsWith(`/`)?!0:t.split(`/`).some(e=>e===`..`):!1},et=(e,t)=>{let n=t?.aliasBasePath??`/home/work/`,r=e??[],i={};r.forEach(e=>{i[e.vfolderId]=Qe(e.name||e.vfolderId,e.mountDestination,n)});let a=new Set((t?.autoMountedFolders??[]).map(e=>Qe(e.name,e.mountDestination??``,n))),o=P([...Object.values(i),...a]),s=(e,t)=>{if(!Xe.test(e.mountDestination??``))return`invalidFormat`;if(!(o[t]<=1))return a.has(t)?`overlappingWithAutoMount`:`overlapping`},c={};return r.forEach(e=>{let t=i[e.vfolderId];c[e.vfolderId]={mountDestination:t,aliasError:s(e,t),subpathError:$e(e.subpath)}}),c},tt=e=>{"use memo";let t=(0,Je.c)(3),{t:n}=me(),r;return t[0]!==e||t[1]!==n?(r={validator:(t,r)=>{let i=ue(et(r,e)),a=e=>Promise.reject(Error(n(e))),o=e=>fe(i,t=>t.aliasError===e);return o(`invalidFormat`)?a(`comp:BAIVFolderMountConfigInput.AliasInvalid`):o(`overlappingWithAutoMount`)?a(`comp:BAIVFolderMountConfigInput.AliasOverlappingWithAutoMount`):o(`overlapping`)?a(`comp:BAIVFolderMountConfigInput.AliasOverlapping`):fe(i,We)?a(`comp:BAIVFolderMountConfigInput.SubpathInvalid`):Promise.resolve()}},t[0]=e,t[1]=n,t[2]=r):r=t[2],r},nt=e=>{"use memo";let t=(0,Je.c)(104),n,r,i,o,c,ee,ne,l,u,d;t[0]===e?(n=t[1],r=t[2],i=t[3],o=t[4],c=t[5],ee=t[6],ne=t[7],l=t[8],u=t[9],d=t[10]):({scope:l,mountableHosts:o,filter:r,disabled:n,aliasBasePath:u,folderExplorerPath:i,onClickCreateFolder:c,isDirectorySizeVisible:d,ref:ne,...ee}=e,t[0]=e,t[1]=n,t[2]=r,t[3]=i,t[4]=o,t[5]=c,t[6]=ee,t[7]=ne,t[8]=l,t[9]=u,t[10]=d);let f=u===void 0?Ze:u,ie=d!==void 0&&d,{t:p}=me(),{message:ae}=je.useApp(),{token:m}=we(),se;t[11]===Symbol.for(`react.memo_cache_sentinel`)?(se={defaultValue:[]},t[11]=se):se=t[11];let[ce,h]=te(ee,se),ue=(0,Ye.useRef)(null),[de,fe]=(0,Ye.useTransition)(),pe;t[12]!==o||t[13]!==l?(pe={scope:l,mountableHosts:o},t[12]=o,t[13]=l,t[14]=pe):pe=t[14];let{autoMountedFolders:g,refetch:he}=Ne(pe),ge;t[15]===he?ge=t[16]:(ge=()=>{fe(()=>{ue.current?.refetch(),he()})},t[15]=he,t[16]=ge);let _=ge,_e;t[17]===_?_e=t[18]:(_e=()=>({refetch:_}),t[17]=_,t[18]=_e),(0,Ye.useImperativeHandle)(ne,_e);let ve;t[19]===ce?ve=t[20]:(ve=ce??[],t[19]=ce,t[20]=ve);let v=ve,xe;t[21]!==f||t[22]!==g||t[23]!==v?(xe=et(v,{aliasBasePath:f,autoMountedFolders:g}),t[21]=f,t[22]=g,t[23]=v,t[24]=xe):xe=t[24];let Ce=xe,Te;t[25]!==ae||t[26]!==v||t[27]!==h||t[28]!==p?(Te=e=>{let{resolved:t,unresolved:n}=e,r=He(t.map(Ge)),i=e=>!!r[e.vfolderId]&&e.name!==r[e.vfolderId];(n.length!==0||v.some(i))&&(h(e=>e.filter(e=>!n.includes(e.vfolderId)).map(e=>i(e)?{...e,name:r[e.vfolderId]}:e)),n.length>0&&ae.warning(p(`comp:BAIVFolderMountConfigInput.UnmountableFoldersRemoved`)))},t[25]=ae,t[26]=v,t[27]=h,t[28]=p,t[29]=Te):Te=t[29];let De=Te,b;t[30]!==v||t[31]!==h?(b=e=>{h(e.map(e=>{let t=v.find(t=>t.vfolderId===e.value);return t?{...t,name:e.label}:{vfolderId:e.value,name:e.label,mountDestination:``,subpath:``}}))},t[30]=v,t[31]=h,t[32]=b):b=t[32];let ke=b,x;t[33]===p?x=t[34]:(x=p(`comp:BAIVFolderMountConfigInput.SelectFolder`),t[33]=p,t[34]=x);let S;t[35]===p?S=t[36]:(S=p(`comp:BAIVFolderMountConfigInput.SelectFolder`),t[35]=p,t[36]=S);let w;t[37]===o?w=t[38]:(w=Pe(o),t[37]=o,t[38]=w);let T;if(t[39]!==r||t[40]!==l.project||t[41]!==l.user){let e;t[43]===l.project?e=t[44]:(e=l.project&&{scopeType:{equals:`PROJECT`},scopeId:{in:le(l.project,`value`)}},t[43]=l.project,t[44]=e);let n;t[45]===l.user?n=t[46]:(n=l.user&&{scopeType:{equals:`USER`},scopeId:{in:le(l.user,`value`)}},t[45]=l.user,t[46]=n),T=s([{status:{equals:`READY`}},{autoMounts:{none:{OR:s([e,n])}}},r]),t[39]=r,t[40]=l.project,t[41]=l.user,t[42]=T}else T=t[42];let E;t[47]===T?E=t[48]:(E={AND:T},t[47]=T,t[48]=E);let D;t[49]===v?D=t[50]:(D=v.map(Ke),t[49]=v,t[50]=D);let O;t[51]===v?O=t[52]:(O=He(s(v.map(qe))),t[51]=v,t[52]=O);let k;t[53]===ke?k=t[54]:(k=(e,t)=>ke(a(t??[])),t[53]=ke,t[54]=k);let A;t[55]!==n||t[56]!==De||t[57]!==l||t[58]!==x||t[59]!==S||t[60]!==w||t[61]!==E||t[62]!==D||t[63]!==O||t[64]!==k?(A=(0,z.jsx)(oe,{ref:ue,multiple:!0,allowClear:!0,selectionMark:`checkbox`,label:x,isLabelHidden:!0,isDisabled:n,placeholder:S,scope:l,filter:w,optionFilter:E,disableUnmountable:!0,value:D,fallbackLabels:O,onChange:k,onResolve:De}),t[55]=n,t[56]=De,t[57]=l,t[58]=x,t[59]=S,t[60]=w,t[61]=E,t[62]=D,t[63]=O,t[64]=k,t[65]=A):A=t[65];let j;t[66]===p?j=t[67]:(j=p(`comp:BAIVFolderMountConfigInput.Folders`),t[66]=p,t[67]=j);let M;t[68]!==n||t[69]!==c||t[70]!==p?(M=c?(0,z.jsx)(Fe,{icon:(0,z.jsx)(be,{size:`1em`}),title:p(`comp:BAIVFolderMountConfigInput.CreateFolder`),disabled:n,onClick:c}):null,t[68]=n,t[69]=c,t[70]=p,t[71]=M):M=t[71];let Be;t[72]===Symbol.for(`react.memo_cache_sentinel`)?(Be=(0,z.jsx)(Se,{size:`1em`}),t[72]=Be):Be=t[72];let N;t[73]===p?N=t[74]:(N=p(`comp:BAIVFolderMountConfigInput.Refresh`),t[73]=p,t[74]=N);let P;t[75]!==n||t[76]!==de||t[77]!==_||t[78]!==N?(P=(0,z.jsx)(Fe,{icon:Be,title:N,loading:de,disabled:n,onClick:_}),t[75]=n,t[76]=de,t[77]=_,t[78]=N,t[79]=P):P=t[79];let F;t[80]!==j||t[81]!==M||t[82]!==P?(F=(0,z.jsxs)(ye,{label:j,children:[M,P]}),t[80]=j,t[81]=M,t[82]=P,t[83]=F):F=t[83];let I;t[84]!==A||t[85]!==F?(I=(0,z.jsxs)(Me,{direction:`row`,gap:`xs`,justify:`between`,children:[A,F]}),t[84]=A,t[85]=F,t[86]=I):I=t[86];let L;t[87]!==n||t[88]!==i||t[89]!==ie||t[90]!==v||t[91]!==h||t[92]!==Ce||t[93]!==p||t[94]!==m?(L=v.length>0&&(0,z.jsx)(Ee,{size:`small`,children:(0,z.jsxs)(`div`,{className:`bai-vfolder-mount-config__grid`,role:`list`,children:[(0,z.jsxs)(`div`,{className:`bai-vfolder-mount-config__header`,children:[(0,z.jsxs)(Me,{gap:`xxs`,align:`center`,children:[(0,z.jsx)(C,{type:`secondary`,children:p(`comp:BAIVFolderMountConfigInput.SourcePath`)}),(0,z.jsx)(Re,{title:p(`comp:BAIVFolderMountConfigInput.SubpathTooltip`)})]}),(0,z.jsx)(`span`,{}),(0,z.jsxs)(Me,{gap:`xxs`,align:`center`,children:[(0,z.jsx)(C,{type:`secondary`,children:p(`comp:BAIVFolderMountConfigInput.DestinationPath`)}),(0,z.jsx)(Re,{title:p(`comp:BAIVFolderMountConfigInput.PathAndAliasTooltip`)})]}),(0,z.jsx)(`span`,{})]}),v.map(e=>{let t=e.name||e.vfolderId,r=e.mountDestination??``,a=Ce[e.vfolderId],o=a.aliasError?p({invalidFormat:`comp:BAIVFolderMountConfigInput.AliasInvalid`,overlapping:`comp:BAIVFolderMountConfigInput.AliasOverlapping`,overlappingWithAutoMount:`comp:BAIVFolderMountConfigInput.AliasOverlappingWithAutoMount`}[a.aliasError]):void 0,s=!!a.subpathError,c=t=>h(n=>n.map(n=>n.vfolderId===e.vfolderId?{...n,...t}:n));return(0,z.jsxs)(`div`,{className:`bai-vfolder-mount-config__row`,role:`listitem`,children:[(0,z.jsx)(y.Item,{validateStatus:s?`error`:void 0,help:s?p(`comp:BAIVFolderMountConfigInput.SubpathInvalid`):void 0,style:{marginBottom:0,minWidth:0},children:(0,z.jsxs)(`div`,{className:`bai-vfolder-mount-config__source`,children:[(0,z.jsxs)(`div`,{className:`bai-vfolder-mount-config__folder`,children:[(0,z.jsx)(re,{vfolderId:e.vfolderId}),(0,z.jsx)(`span`,{className:`bai-vfolder-mount-config__folder-name`,children:i?(0,z.jsx)(ze,{to:i(e.vfolderId),ellipsis:!0,children:t}):(0,z.jsx)(C,{ellipsis:{tooltip:!0},children:t})}),(0,z.jsx)(`span`,{className:`bai-vfolder-mount-config__separator`,children:`/`})]}),(0,z.jsx)(Ve,{label:p(`comp:BAIVFolderMountConfigInput.Subpath`),placeholder:p(`comp:VFolderPathPicker.SelectAPath`),allowClear:!0,disabled:n,vfolderUuid:e.vfolderId,isDirectorySizeVisible:ie,value:e.subpath,onChange:e=>c({subpath:e??``})})]})}),(0,z.jsx)(`span`,{className:`bai-vfolder-mount-config__arrow`,"aria-hidden":!0,children:(0,z.jsx)(Ue,{size:`1em`})}),(0,z.jsx)(y.Item,{validateStatus:o?`error`:void 0,help:o,extra:r.trim()&&r.trim()!==a.mountDestination?(0,z.jsx)(C,{type:`secondary`,ellipsis:{tooltip:!0},children:a.mountDestination}):void 0,style:{marginBottom:0,minWidth:0},children:(0,z.jsx)(Le,{"aria-label":p(`comp:BAIVFolderMountConfigInput.AliasPlaceholder`),hasClear:!0,disabled:n,placeholder:a.mountDestination,value:r,onChange:e=>c({mountDestination:e})})}),(0,z.jsx)(`div`,{className:`bai-vfolder-mount-config__remove`,children:(0,z.jsx)(Oe,{content:p(`comp:BAIVFolderMountConfigInput.RemoveFolder`),children:(0,z.jsx)(Fe,{type:`text`,size:`small`,disabled:n,"aria-label":p(`comp:BAIVFolderMountConfigInput.RemoveFolder`),icon:(0,z.jsx)(Ae,{size:m(`--spacing-4`),color:m(`--color-text-quaternary`)}),style:{flexShrink:0,height:m(`--size-element-md`)},onClick:()=>h(t=>t.filter(t=>t.vfolderId!==e.vfolderId))})})})]},e.vfolderId)})]})}),t[87]=n,t[88]=i,t[89]=ie,t[90]=v,t[91]=h,t[92]=Ce,t[93]=p,t[94]=m,t[95]=L):L=t[95];let R;t[96]!==g||t[97]!==i||t[98]!==p?(R=g.length>0&&(0,z.jsxs)(Me,{gap:`xxs`,align:`center`,wrap:`wrap`,children:[(0,z.jsx)(C,{type:`secondary`,children:p(`comp:BAIVFolderMountConfigInput.AutoMountedFolders`)}),g.map(e=>i?(0,z.jsx)(ze,{to:i(e.vfolderId),children:(0,z.jsx)(Ie,{label:e.name})},e.vfolderId):(0,z.jsx)(Ie,{label:e.name},e.vfolderId))]}),t[96]=g,t[97]=i,t[98]=p,t[99]=R):R=t[99];let We;return t[100]!==I||t[101]!==L||t[102]!==R?(We=(0,z.jsxs)(Me,{direction:`column`,align:`stretch`,gap:`xs`,children:[I,L,R]}),t[100]=I,t[101]=L,t[102]=R,t[103]=We):We=t[103],We}})))()}var it,B,at,ot,st,V,H,ct,U,lt,ut,W,G,K,q,J,Y,X,Z,Q,$,dt;function ft(){return(ft=e((()=>{b(),T(),p(),ae(),O(),S(),rt(),it=t(),E(),B=g(),{action:at}=__STORYBOOK_MODULE_ACTIONS__,ot=760,st=[...l,se({id:`aaaaaaaa-bbbb-cccc-dddd-eeeeffff0006`,name:`model-checkpoints`})],V=e=>st[e].id,H=e=>st[e].name,ct=()=>({[V(0)]:{".":[f(`dataset`,`DIRECTORY`,`2026-07-21T14:02:00`),f(`scripts`,`DIRECTORY`,`2026-07-18T09:45:00`),f(`README.md`,`FILE`,`2026-07-01T11:20:00`)],dataset:[f(`train`,`DIRECTORY`,`2026-07-22T10:05:00`),f(`validation`,`DIRECTORY`,`2026-07-22T10:05:00`)],"dataset/train":[],"dataset/validation":[],scripts:[]},[V(1)]:{".":[f(`imagenet`,`DIRECTORY`,`2026-07-10T08:00:00`),f(`LICENSE`,`FILE`,`2026-07-02T12:00:00`)],imagenet:[]},[V(5)]:{".":[f(`epoch-001`,`DIRECTORY`,`2026-07-27T03:12:00`)],"epoch-001":[]}}),U=({initialValue:e=[],...t})=>{let[n,r]=(0,it.useState)(e),i=(0,it.useRef)(null);return(0,B.jsxs)(`div`,{style:{width:ot},children:[(0,B.jsx)(nt,{ref:i,scope:d,mountableHosts:m,...t,value:n,onChange:e=>{r(e),t.onChange?.(e)}}),(0,B.jsx)(`div`,{style:{marginTop:16},children:(0,B.jsx)(Fe,{onClick:()=>i.current?.refetch(),children:`Refetch via ref`})}),(0,B.jsxs)(`div`,{style:{marginTop:24},children:[(0,B.jsx)(C,{strong:!0,children:`Form value (onChange result)`}),(0,B.jsx)(`pre`,{style:{marginTop:8,padding:12,background:`rgba(0,0,0,0.04)`,borderRadius:6,fontSize:12},children:JSON.stringify(n,null,2)})]})]})},lt=[{vfolderId:V(0),name:H(0),mountDestination:`shared`,subpath:``},{vfolderId:V(1),name:H(1),mountDestination:`shared`,subpath:``}],ut={title:`Fragments/BAIVFolderMountConfigInput`,component:nt,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:"\n**BAIVFolderMountConfigInput** is a reusable, schema-agnostic controlled input\nfor configuring vfolder mounts.\n\n- Picks folders with `BAIScopedVFolderSelect`, which pages `scopedVFoldersV2` over the\n  `scope` the caller passes (usually its own folders and the current project's), filtered on the server: the host must be in\n  `mountableHosts` (those granting `mount-in-session`), the folder must be ready,\n  and folders the scope's auto-mount settings already name are left out. Search runs\n  on the server too, and `filter` (a `VFolderFilter`) narrows the options further\n  without shrinking the selection. A folder whose mount level is NONE is listed\n  but cannot be picked.\n- It **suspends** on the first page, so the consumer owns the Suspense boundary. A\n  selected folder the loaded options do not cover is looked up by id; one the\n  mount gates reject is dropped from the value with a warning toast.\n- Beside the select sits a button group: **⟳** always re-runs the folder query (also\n  exposed imperatively as `ref.refetch()`), and **+** is rendered only when\n  `onClickCreateFolder` is given — the folder-creation modal belongs to the host app.\n- Each selected folder appears as a row with a **mount path (alias)** input and an\n  optional **subpath** picker (which subfolder of the vfolder to mount as the source; `/` = root),\n  which opens a directory browser instead of accepting typed text.\n- `mountDestination` stores the **raw alias** the user typed — `''` mounts at the default\n  `/home/work/<name>`, a relative segment like `data` resolves to `/home/work/data`, and an\n  absolute path like `/data` is used as-is. Resolve it with the exported `inputToMountDestination`.\n- It reads the auto-mounted folders (the ones the user's and project's auto-mount settings name) itself: they join the\n  overlap check (a user alias colliding with one is flagged) and are shown as read-only tokens at the bottom.\n- `folderExplorerPath` turns every folder name the component renders — each mount row and each\n  auto-mounted badge — into a link into the host app's folder explorer (see **WithFolderExplorerLinks**).\n- Emits a single `VFolderMountConfigValue[]`. The inline per-row errors are advisory UX; to gate a\n  form, wrap the component in one named `Form.Item` whose `rules` carry\n  `useVFolderMountConfigFormRule` (see the **WithFormValidation** story).\n\nThe stories below mock the folder list behind the providers' `suspenseFallback`,\nso of the six fixture folders `cold-archive` is dropped (its host is not in\n`mountableHosts`), `other-team-data` belongs to another project, and `team-config`,\nnamed by a mocked auto-mount setting, is never offered but listed as an auto-mounted folder.\n"}}},decorators:[e=>(0,B.jsx)(D,{children:(0,B.jsx)(ce,{folders:st,trees:ct,suspenseFallback:`Loading...`,children:(0,B.jsx)(e,{})})})],argTypes:{value:{description:`Controlled list of vfolder mount configurations`,table:{type:{summary:`VFolderMountConfigValue[]`}}},onChange:{action:`changed`,description:`Called with the updated mount configuration list`},scope:{control:!1,description:"The scopes a session mounts from (usually `mountableVFolderScope(userId, projectId)`)",table:{type:{summary:`VFolderScope`}}},filter:{control:!1,description:`Server-side VFolderFilter ANDed onto the options query; narrows the options only`,table:{type:{summary:`VFolderFilter`}}},disabled:{control:{type:`boolean`},description:`Disable selection and all row inputs`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},aliasBasePath:{control:{type:`text`},description:`Base path prepended to a relative alias input`,table:{type:{summary:`string`},defaultValue:{summary:`/home/work/`}}},folderExplorerPath:{control:!1,description:`Route that opens a folder in the host app's folder explorer; given, folder names render as links`,table:{type:{summary:`(vfolderId: string) => LinkProps['to']`}}},mountableHosts:{control:{type:`object`},description:"Hosts granting `mount-in-session`, supplied by the host app",table:{type:{summary:`string[]`}}},onClickCreateFolder:{control:!1,description:`Opens the host app's folder-creation modal; the create button appears only when it is given`,table:{type:{summary:`() => void`}}}},args:{scope:d,mountableHosts:m}},W={parameters:{docs:{description:{story:"Empty initial state. The dropdown offers only the mountable folders of the current project. Select one to add a row, then type its mount path and click its subpath field to browse the folder. New rows start at the folder root, shown as `/`. The live form value is shown below — note `mountDestination` holds the raw alias you typed, while `subpath` only ever comes from the picker."}}},render:e=>(0,B.jsx)(U,{...e})},G={parameters:{docs:{description:{story:"Prefilled with three folders demonstrating each alias mode: a relative segment (`data` → `/home/work/data`), an absolute path (`/mnt/shared`, used as-is), and an empty alias (falls back to `/home/work/<name>`). The first mounts the `dataset/train` subpath; the other two mount the folder root, which the picker shows as `/`."}}},render:e=>(0,B.jsx)(U,{...e,initialValue:[{vfolderId:V(0),name:H(0),mountDestination:`data`,subpath:`dataset/train`},{vfolderId:V(1),name:H(1),mountDestination:`/mnt/shared`,subpath:``},{vfolderId:V(5),name:H(5),mountDestination:``,subpath:``}]})},K={parameters:{docs:{description:{story:"Two folders use the same alias (`shared`), so both resolve to `/home/work/shared` and are flagged with the overlap error. The third row types an alias the format check rejects. `useVFolderMountConfigFormRule` rejects this value."}}},render:e=>(0,B.jsx)(U,{...e,initialValue:[...lt,{vfolderId:V(5),name:H(5),mountDestination:`bad path!`,subpath:``}]})},q={parameters:{docs:{description:{story:"A mocked auto-mount setting names `team-config`, so it is listed as a read-only token below the rows and never offered in the select. The first folder aliases to `team-config`, colliding with the auto-mounted `/home/work/team-config`, so it shows the overlap error."}}},render:e=>(0,B.jsx)(U,{...e,initialValue:[{vfolderId:V(0),name:H(0),mountDestination:`team-config`,subpath:`dataset`},{vfolderId:V(5),name:H(5),mountDestination:`checkpoints`,subpath:``}]})},J={args:{folderExplorerPath:e=>`#folder=${e}`},parameters:{docs:{description:{story:"With `folderExplorerPath` given, each row's folder name renders as a link (still truncating with a tooltip) and each auto-mounted badge becomes one too. Without it they stay plain text, as in the other stories."}}},render:e=>(0,B.jsx)(U,{...e,initialValue:[{vfolderId:V(0),name:H(0),mountDestination:`data`,subpath:``}]})},Y={parameters:{docs:{description:{story:"The component is wrapped in one named `Form.Item` whose `rules` carry `useVFolderMountConfigFormRule`, so submitting with the two colliding `shared` aliases fails validation with the already-translated message. Fix the aliases and submit again to pass."}}},render:e=>(0,B.jsx)(()=>{let[t]=y.useForm(),[n,r]=(0,it.useState)(``),{autoMountedFolders:i}=Ne({scope:d,mountableHosts:e.mountableHosts}),a=tt({aliasBasePath:e.aliasBasePath,autoMountedFolders:i});return(0,B.jsxs)(y,{form:t,layout:`vertical`,style:{width:ot},initialValues:{mounts:lt},children:[(0,B.jsx)(y.Item,{name:`mounts`,label:`VFolder mounts`,rules:[a],children:(0,B.jsx)(nt,{...e})}),(0,B.jsx)(Fe,{type:`primary`,onClick:()=>{t.validateFields().then(()=>r(`✅ Valid — form submitted.`)).catch(()=>r(`❌ Invalid — fix the flagged rows.`))},children:`Validate & submit`}),n?(0,B.jsx)(`div`,{style:{marginTop:16},children:(0,B.jsx)(C,{children:n})}):null]})},{})},X={parameters:{docs:{description:{story:"Passing `onClickCreateFolder` adds a **+** button to the group beside the select; clicking it logs to the Actions panel, standing in for the host opening its folder-creation modal. In the app the host then calls `ref.refetch()` (the **Refetch via ref** button below does the same) and appends the created folder to the value. The **⟳** button next to it is always rendered and re-runs the folder list on its own."}}},render:e=>(0,B.jsx)(U,{...e,onClickCreateFolder:at(`createFolderClicked`)})},Z={parameters:{docs:{description:{story:"`mountableHosts={[]}` — no host grants `mount-in-session`, so every folder is gated out and the popup shows the empty state. This is the case a launcher has to surface rather than letting the user pick a folder the session cannot mount."}}},render:e=>(0,B.jsx)(U,{...e,mountableHosts:[]})},Q={parameters:{docs:{description:{story:"A value restored from a template can name a folder this owner cannot mount. With `mountableHosts={[]}` nothing passes the host gate, so the prefilled entries are dropped from the value on mount and a warning toast explains the shrinking selection — the emitted `onChange` payload below goes straight to `[]`."}}},render:e=>(0,B.jsx)(U,{...e,mountableHosts:[],initialValue:[{vfolderId:V(0),name:H(0),mountDestination:``,subpath:``},{vfolderId:V(1),name:H(1),mountDestination:`shared`,subpath:``}]})},$={parameters:{docs:{description:{story:`Disabled state — the select, the alias input, the subpath picker and the remove button are all inert; the picked subpath stays readable.`}}},render:e=>(0,B.jsx)(U,{...e,disabled:!0,initialValue:[{vfolderId:V(1),name:H(1),mountDestination:`shared`,subpath:``}]})},dt=[`Interactive`,`Prefilled`,`OverlappingPaths`,`WithAutoMountedFolders`,`WithFolderExplorerLinks`,`WithFormValidation`,`WithCreateFolderButton`,`NoMountableHost`,`PrunesUnmountableSelection`,`Disabled`],W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Empty initial state. The dropdown offers only the mountable folders of the current project. Select one to add a row, then type its mount path and click its subpath field to browse the folder. New rows start at the folder root, shown as \`/\`. The live form value is shown below — note \`mountDestination\` holds the raw alias you typed, while \`subpath\` only ever comes from the picker.'
      }
    }
  },
  render: args => <ControlledDemo {...args} />
}`,...W.parameters?.docs?.source}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
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
}`,...G.parameters?.docs?.source}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
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
}`,...K.parameters?.docs?.source},description:{story:`Error state — two folders resolve to the same mount path, so both rows show
the overlap error.`,...K.parameters?.docs?.description}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'A mocked auto-mount setting names \`team-config\`, so it is listed as a read-only token below the rows and never offered in the select. The first folder aliases to \`team-config\`, colliding with the auto-mounted \`/home/work/team-config\`, so it shows the overlap error.'
      }
    }
  },
  render: args => <ControlledDemo {...args} initialValue={[{
    vfolderId: folderId(0),
    name: folderName(0),
    mountDestination: 'team-config',
    subpath: 'dataset'
  }, {
    vfolderId: folderId(5),
    name: folderName(5),
    mountDestination: 'checkpoints',
    subpath: ''
  }]} />
}`,...q.parameters?.docs?.source},description:{story:`Auto-mounted folders are listed as read-only tags at the bottom, and a user
alias that collides with one of them is flagged as an overlap.`,...q.parameters?.docs?.description}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
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
}`,...J.parameters?.docs?.source},description:{story:"`folderExplorerPath` turns the folder names into links into the host app's\nfolder explorer — both the mount rows and the auto-mounted badges.",...J.parameters?.docs?.description}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
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
}`,...Y.parameters?.docs?.source},description:{story:"Demonstrates the recommended form-gate pattern: a single named `Form.Item`\nwrapping the component, with `useVFolderMountConfigFormRule` in `rules` so\n`form.validateFields()` rejects on invalid input.",...Y.parameters?.docs?.description}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Passing \`onClickCreateFolder\` adds a **+** button to the group beside the select; clicking it logs to the Actions panel, standing in for the host opening its folder-creation modal. In the app the host then calls \`ref.refetch()\` (the **Refetch via ref** button below does the same) and appends the created folder to the value. The **⟳** button next to it is always rendered and re-runs the folder list on its own.'
      }
    }
  },
  render: args => <ControlledDemo {...args} onClickCreateFolder={action('createFolderClicked')} />
}`,...X.parameters?.docs?.source},description:{story:"The create button next to the select appears only when the host supplies\n`onClickCreateFolder`, because the folder-creation modal is a host component.",...X.parameters?.docs?.description}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: '\`mountableHosts={[]}\` — no host grants \`mount-in-session\`, so every folder is gated out and the popup shows the empty state. This is the case a launcher has to surface rather than letting the user pick a folder the session cannot mount.'
      }
    }
  },
  render: args => <ControlledDemo {...args} mountableHosts={[]} />
}`,...Z.parameters?.docs?.source}}},Q.parameters={...Q.parameters,docs:{...Q.parameters?.docs,source:{originalSource:`{
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
}`,...Q.parameters?.docs?.source}}},$.parameters={...$.parameters,docs:{...$.parameters?.docs,source:{originalSource:`{
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
}`,...$.parameters?.docs?.source}}}})))()}ft();export{$ as Disabled,W as Interactive,Z as NoMountableHost,K as OverlappingPaths,G as Prefilled,Q as PrunesUnmountableSelection,q as WithAutoMountedFolders,X as WithCreateFolderButton,J as WithFolderExplorerLinks,Y as WithFormValidation,dt as __namedExportsOrder,ut as default};