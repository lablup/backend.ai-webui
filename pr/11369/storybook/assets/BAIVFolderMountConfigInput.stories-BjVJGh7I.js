import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-DlPsW1c0.js";import{n,t as r}from"./_baseAssignValue-BMP2r3Q5.js";import{n as i,t as a}from"./castArray-AZdtGfv6.js";import{n as o,t as ee}from"./compact-C9OPbfhP.js";import{i as s,r as te}from"./keyBy-DTb2LvP4.js";import{m as ne,t as re}from"./hooks-T_PEg8sW.js";import{c,g as l,h as ie,i as u,l as d,m as ae,n as f,o as oe,p as se,r as p,s as ce,t as le}from"./MockVFolderFileProviders-DbDffiPU.js";import{i as m,r as ue}from"./includes-DMTgV4pD.js";import{n as de,t as fe}from"./some-DkjZXzzg.js";import{t as h}from"./jsx-runtime-MKhVqBIO.js";import{n as pe,t as g}from"./useBAIi18n-EcIybVeJ.js";import{t as me}from"./compiler-runtime-DU4U6aph.js";import{n as he,t as _}from"./createLucideIcon-BXqG86fR.js";import{i as ge,r as _e}from"./BAIFetchKeyButton-D63i3BDI.js";import{n as ve,t as ye}from"./plus-DAwTrFAj.js";import{n as v,t as be}from"./rotate-cw-L-Bh31u8.js";import{a as xe,o as Se}from"./touchPresentation-SlIXP8m0.js";import{n as Ce,t as we}from"./BAICard-CyLEDtPw.js";import{r as Te,t as Ee}from"./Tooltip-Cfb-ZzrB.js";import{n as De,t as Oe}from"./Form-D0nndWDj.js";import{Tn as ke,b as Ae,h as y,m as b,wn as je,y as Me}from"./iframe-DIwYitl4.js";import{n as x,t as Ne}from"./BAIFlex-DnaoYTJ1.js";import{i as Pe,n as Fe,t as S}from"./useMountableVFolders-oRoz3yWL.js";import{n as C,r as w}from"./dist-CCUsDPCX.js";import{n as T,t as Ie}from"./BAIButton-7DxxWwyk.js";import{n as E,t as Le}from"./Token-BqAd0GQ-.js";import{n as D,t as Re}from"./TextInput-Bv-4RCoU.js";import{n as O,t as ze}from"./BAIQuestionIconWithTooltip-8wSi6Edo.js";import{n as k,t as Be}from"./BAILink-mVkVIjo5.js";import{n as A,t as Ve}from"./BAIVFolderPathPicker-DcaH45Gx.js";var j,M;function N(){return(N=e((()=>{n(),s(),j=Object.prototype.hasOwnProperty,M=te(function(e,t,n){j.call(e,n)?++e[n]:r(e,n,1)})})))()}function He(e){for(var t=-1,n=e==null?0:e.length,i={};++t<n;){var a=e[t];r(i,a[0],a[1])}return i}function P(){return(P=e((()=>{n()})))()}var F,Ue;function I(){return(I=e((()=>{he(),F={name:`arrow-right`,size:24,node:[[`path`,{d:`M5 12h14`,key:`1ays0h`}],[`path`,{d:`m12 5 7 7-7 7`,key:`xquz4c`}]]},F.node,Ue=_(F)})))()}function L(e){return e.subpathError}function We(e){return[e.entityId,e.name]}function Ge(e){return e.vfolderId}function Ke(e){return e.name?[e.vfolderId,e.name]:null}var qe,Je,R,z,Ye,Xe,Ze,Qe,$e,et;function tt(){return(tt=e((()=>{qe=me(),Ae(),Oe(),re(),g(),S(),T(),Ce(),x(),k(),O(),y(),D(),l(),A(),ae(),ge(),E(),Te(),xe(),N(),ue(),fe(),P(),o(),i(),I(),ve(),v(),ke(),Je=t(),R=h(),z=/^[a-zA-Z0-9_/.-]*$/,Ye=`/home/work/`,Xe=(e,t,n=Ye)=>{let r=t?.trim();return r?r.startsWith(`/`)?r:`${n}${r}`:`${n}${e}`},Ze=e=>{let t=e?.trim();return t?t.startsWith(`/`)?!0:t.split(`/`).some(e=>e===`..`):!1},Qe=(e,t)=>{let n=t?.aliasBasePath??`/home/work/`,r=e??[],i={};r.forEach(e=>{i[e.vfolderId]=Xe(e.name||e.vfolderId,e.mountDestination,n)});let a=new Set((t?.autoMountedFolders??[]).map(e=>Xe(e.name,``,n))),o=M([...Object.values(i),...a]),ee=(e,t)=>{if(!z.test(e.mountDestination??``))return`invalidFormat`;if(!(o[t]<=1))return a.has(t)?`overlappingWithAutoMount`:`overlapping`},s={};return r.forEach(e=>{let t=i[e.vfolderId];s[e.vfolderId]={mountDestination:t,aliasError:ee(e,t),subpathError:Ze(e.subpath)}}),s},$e=e=>{"use memo";let t=(0,qe.c)(3),{t:n}=pe(),r;return t[0]!==e||t[1]!==n?(r={validator:(t,r)=>{let i=m(Qe(r,e)),a=e=>Promise.reject(Error(n(e))),o=e=>de(i,t=>t.aliasError===e);return o(`invalidFormat`)?a(`comp:BAIVFolderMountConfigInput.AliasInvalid`):o(`overlappingWithAutoMount`)?a(`comp:BAIVFolderMountConfigInput.AliasOverlappingWithAutoMount`):o(`overlapping`)?a(`comp:BAIVFolderMountConfigInput.AliasOverlapping`):de(i,L)?a(`comp:BAIVFolderMountConfigInput.SubpathInvalid`):Promise.resolve()}},t[0]=e,t[1]=n,t[2]=r):r=t[2],r},et=e=>{"use memo";let t=(0,qe.c)(98),n,r,i,o,s,te,re,c,l,u;t[0]===e?(n=t[1],r=t[2],i=t[3],o=t[4],s=t[5],te=t[6],re=t[7],c=t[8],l=t[9],u=t[10]):({scope:c,mountableHosts:o,filter:r,disabled:n,aliasBasePath:l,folderExplorerPath:i,onClickCreateFolder:s,isDirectorySizeVisible:u,ref:re,...te}=e,t[0]=e,t[1]=n,t[2]=r,t[3]=i,t[4]=o,t[5]=s,t[6]=te,t[7]=re,t[8]=c,t[9]=l,t[10]=u);let d=l===void 0?Ye:l,ae=u!==void 0&&u,{t:f}=pe(),{message:oe}=Me.useApp(),{token:p}=Se(),ce;t[11]===Symbol.for(`react.memo_cache_sentinel`)?(ce={defaultValue:[]},t[11]=ce):ce=t[11];let[le,m]=ne(te,ce),ue=(0,Je.useRef)(null),[de,fe]=(0,Je.useTransition)(),h;t[12]!==o||t[13]!==c?(h={scope:c,mountableHosts:o},t[12]=o,t[13]=c,t[14]=h):h=t[14];let{autoMountedFolders:g,refetch:me}=Pe(h),he;t[15]===me?he=t[16]:(he=()=>{fe(()=>{ue.current?.refetch(),me()})},t[15]=me,t[16]=he);let _=he,ge;t[17]===_?ge=t[18]:(ge=()=>({refetch:_}),t[17]=_,t[18]=ge),(0,Je.useImperativeHandle)(re,ge);let ve;t[19]===le?ve=t[20]:(ve=le??[],t[19]=le,t[20]=ve);let v=ve,xe;t[21]!==d||t[22]!==g||t[23]!==v?(xe=Qe(v,{aliasBasePath:d,autoMountedFolders:g}),t[21]=d,t[22]=g,t[23]=v,t[24]=xe):xe=t[24];let Ce=xe,Te;t[25]!==oe||t[26]!==v||t[27]!==m||t[28]!==f?(Te=e=>{let{resolved:t,unresolved:n}=e,r=He(t.map(We)),i=e=>!!r[e.vfolderId]&&e.name!==r[e.vfolderId];(n.length!==0||v.some(i))&&(m(e=>e.filter(e=>!n.includes(e.vfolderId)).map(e=>i(e)?{...e,name:r[e.vfolderId]}:e)),n.length>0&&oe.warning(f(`comp:BAIVFolderMountConfigInput.UnmountableFoldersRemoved`)))},t[25]=oe,t[26]=v,t[27]=m,t[28]=f,t[29]=Te):Te=t[29];let Oe=Te,ke;t[30]!==v||t[31]!==m?(ke=e=>{m(e.map(e=>{let t=v.find(t=>t.vfolderId===e.value);return t?{...t,name:e.label}:{vfolderId:e.value,name:e.label,mountDestination:``,subpath:``}}))},t[30]=v,t[31]=m,t[32]=ke):ke=t[32];let Ae=ke,y;t[33]===f?y=t[34]:(y=f(`comp:BAIVFolderMountConfigInput.SelectFolder`),t[33]=f,t[34]=y);let x;t[35]===f?x=t[36]:(x=f(`comp:BAIVFolderMountConfigInput.SelectFolder`),t[35]=f,t[36]=x);let S;t[37]===o?S=t[38]:(S=Fe(o),t[37]=o,t[38]=S);let C;t[39]===r?C=t[40]:(C=ee([{status:{equals:`READY`}},{name:{notStartsWith:`.`}},r]),t[39]=r,t[40]=C);let w;t[41]===C?w=t[42]:(w={AND:C},t[41]=C,t[42]=w);let T;t[43]===v?T=t[44]:(T=v.map(Ge),t[43]=v,t[44]=T);let E;t[45]===v?E=t[46]:(E=He(ee(v.map(Ke))),t[45]=v,t[46]=E);let D;t[47]===Ae?D=t[48]:(D=(e,t)=>Ae(a(t??[])),t[47]=Ae,t[48]=D);let O;t[49]!==n||t[50]!==Oe||t[51]!==c||t[52]!==y||t[53]!==x||t[54]!==S||t[55]!==w||t[56]!==T||t[57]!==E||t[58]!==D?(O=(0,R.jsx)(se,{ref:ue,multiple:!0,allowClear:!0,selectionMark:`checkbox`,label:y,isLabelHidden:!0,isDisabled:n,placeholder:x,scope:c,filter:S,optionFilter:w,disableUnmountable:!0,value:T,fallbackLabels:E,onChange:D,onResolve:Oe}),t[49]=n,t[50]=Oe,t[51]=c,t[52]=y,t[53]=x,t[54]=S,t[55]=w,t[56]=T,t[57]=E,t[58]=D,t[59]=O):O=t[59];let k;t[60]===f?k=t[61]:(k=f(`comp:BAIVFolderMountConfigInput.Folders`),t[60]=f,t[61]=k);let A;t[62]!==n||t[63]!==s||t[64]!==f?(A=s?(0,R.jsx)(Ie,{icon:(0,R.jsx)(ye,{size:`1em`}),title:f(`comp:BAIVFolderMountConfigInput.CreateFolder`),disabled:n,onClick:s}):null,t[62]=n,t[63]=s,t[64]=f,t[65]=A):A=t[65];let j;t[66]===Symbol.for(`react.memo_cache_sentinel`)?(j=(0,R.jsx)(be,{size:`1em`}),t[66]=j):j=t[66];let M;t[67]===f?M=t[68]:(M=f(`comp:BAIVFolderMountConfigInput.Refresh`),t[67]=f,t[68]=M);let N;t[69]!==n||t[70]!==de||t[71]!==_||t[72]!==M?(N=(0,R.jsx)(Ie,{icon:j,title:M,loading:de,disabled:n,onClick:_}),t[69]=n,t[70]=de,t[71]=_,t[72]=M,t[73]=N):N=t[73];let P;t[74]!==k||t[75]!==A||t[76]!==N?(P=(0,R.jsxs)(_e,{label:k,children:[A,N]}),t[74]=k,t[75]=A,t[76]=N,t[77]=P):P=t[77];let F;t[78]!==O||t[79]!==P?(F=(0,R.jsxs)(Ne,{direction:`row`,gap:`xs`,justify:`between`,children:[O,P]}),t[78]=O,t[79]=P,t[80]=F):F=t[80];let I;t[81]!==n||t[82]!==i||t[83]!==ae||t[84]!==v||t[85]!==m||t[86]!==Ce||t[87]!==f||t[88]!==p?(I=v.length>0&&(0,R.jsx)(we,{size:`small`,children:(0,R.jsxs)(`div`,{className:`bai-vfolder-mount-config__grid`,role:`list`,children:[(0,R.jsxs)(`div`,{className:`bai-vfolder-mount-config__header`,children:[(0,R.jsxs)(Ne,{gap:`xxs`,align:`center`,children:[(0,R.jsx)(b,{type:`secondary`,children:f(`comp:BAIVFolderMountConfigInput.SourcePath`)}),(0,R.jsx)(ze,{title:f(`comp:BAIVFolderMountConfigInput.SubpathTooltip`)})]}),(0,R.jsx)(`span`,{}),(0,R.jsxs)(Ne,{gap:`xxs`,align:`center`,children:[(0,R.jsx)(b,{type:`secondary`,children:f(`comp:BAIVFolderMountConfigInput.DestinationPath`)}),(0,R.jsx)(ze,{title:f(`comp:BAIVFolderMountConfigInput.PathAndAliasTooltip`)})]}),(0,R.jsx)(`span`,{})]}),v.map(e=>{let t=e.name||e.vfolderId,r=e.mountDestination??``,a=Ce[e.vfolderId],o=a.aliasError?f({invalidFormat:`comp:BAIVFolderMountConfigInput.AliasInvalid`,overlapping:`comp:BAIVFolderMountConfigInput.AliasOverlapping`,overlappingWithAutoMount:`comp:BAIVFolderMountConfigInput.AliasOverlappingWithAutoMount`}[a.aliasError]):void 0,ee=!!a.subpathError,s=t=>m(n=>n.map(n=>n.vfolderId===e.vfolderId?{...n,...t}:n));return(0,R.jsxs)(`div`,{className:`bai-vfolder-mount-config__row`,role:`listitem`,children:[(0,R.jsx)(De.Item,{validateStatus:ee?`error`:void 0,help:ee?f(`comp:BAIVFolderMountConfigInput.SubpathInvalid`):void 0,style:{marginBottom:0,minWidth:0},children:(0,R.jsxs)(`div`,{className:`bai-vfolder-mount-config__source`,children:[(0,R.jsxs)(`div`,{className:`bai-vfolder-mount-config__folder`,children:[(0,R.jsx)(ie,{vfolderId:e.vfolderId}),(0,R.jsx)(`span`,{className:`bai-vfolder-mount-config__folder-name`,children:i?(0,R.jsx)(Be,{to:i(e.vfolderId),ellipsis:!0,children:t}):(0,R.jsx)(b,{ellipsis:{tooltip:!0},children:t})}),(0,R.jsx)(`span`,{className:`bai-vfolder-mount-config__separator`,children:`/`})]}),(0,R.jsx)(Ve,{label:f(`comp:BAIVFolderMountConfigInput.Subpath`),placeholder:f(`comp:VFolderPathPicker.SelectAPath`),allowClear:!0,disabled:n,vfolderUuid:e.vfolderId,isDirectorySizeVisible:ae,value:e.subpath,onChange:e=>s({subpath:e??``})})]})}),(0,R.jsx)(`span`,{className:`bai-vfolder-mount-config__arrow`,"aria-hidden":!0,children:(0,R.jsx)(Ue,{size:`1em`})}),(0,R.jsx)(De.Item,{validateStatus:o?`error`:void 0,help:o,extra:r.trim()&&r.trim()!==a.mountDestination?(0,R.jsx)(b,{type:`secondary`,ellipsis:{tooltip:!0},children:a.mountDestination}):void 0,style:{marginBottom:0,minWidth:0},children:(0,R.jsx)(Re,{"aria-label":f(`comp:BAIVFolderMountConfigInput.AliasPlaceholder`),hasClear:!0,disabled:n,placeholder:a.mountDestination,value:r,onChange:e=>s({mountDestination:e})})}),(0,R.jsx)(`div`,{className:`bai-vfolder-mount-config__remove`,children:(0,R.jsx)(Ee,{content:f(`comp:BAIVFolderMountConfigInput.RemoveFolder`),children:(0,R.jsx)(Ie,{type:`text`,size:`small`,disabled:n,"aria-label":f(`comp:BAIVFolderMountConfigInput.RemoveFolder`),icon:(0,R.jsx)(je,{size:p(`--spacing-4`),color:p(`--color-text-quaternary`)}),style:{flexShrink:0,height:p(`--size-element-md`)},onClick:()=>m(t=>t.filter(t=>t.vfolderId!==e.vfolderId))})})})]},e.vfolderId)})]})}),t[81]=n,t[82]=i,t[83]=ae,t[84]=v,t[85]=m,t[86]=Ce,t[87]=f,t[88]=p,t[89]=I):I=t[89];let L;t[90]!==g||t[91]!==i||t[92]!==f?(L=g.length>0&&(0,R.jsxs)(Ne,{gap:`xxs`,align:`center`,wrap:`wrap`,children:[(0,R.jsx)(b,{type:`secondary`,children:f(`comp:BAIVFolderMountConfigInput.AutoMountedFolders`)}),g.map(e=>i?(0,R.jsx)(Be,{to:i(e.vfolderId),children:(0,R.jsx)(Le,{label:e.name})},e.vfolderId):(0,R.jsx)(Le,{label:e.name},e.vfolderId))]}),t[90]=g,t[91]=i,t[92]=f,t[93]=L):L=t[93];let z;return t[94]!==F||t[95]!==I||t[96]!==L?(z=(0,R.jsxs)(Ne,{direction:`column`,align:`stretch`,gap:`xs`,children:[F,I,L]}),t[94]=F,t[95]=I,t[96]=L,t[97]=z):z=t[97],z}})))()}var nt,B,rt,it,at,V,H,ot,U,st,ct,W,G,K,q,J,Y,X,Z,Q,$,lt;function ut(){return(ut=e((()=>{Oe(),S(),f(),oe(),T(),y(),tt(),nt=t(),C(),B=h(),{action:rt}=__STORYBOOK_MODULE_ACTIONS__,it=760,at=[...c,ce({id:`aaaaaaaa-bbbb-cccc-dddd-eeeeffff0006`,name:`model-checkpoints`})],V=e=>at[e].id,H=e=>at[e].name,ot=()=>({[V(0)]:{".":[d(`dataset`,`DIRECTORY`,`2026-07-21T14:02:00`),d(`scripts`,`DIRECTORY`,`2026-07-18T09:45:00`),d(`README.md`,`FILE`,`2026-07-01T11:20:00`)],dataset:[d(`train`,`DIRECTORY`,`2026-07-22T10:05:00`),d(`validation`,`DIRECTORY`,`2026-07-22T10:05:00`)],"dataset/train":[],"dataset/validation":[],scripts:[]},[V(1)]:{".":[d(`imagenet`,`DIRECTORY`,`2026-07-10T08:00:00`),d(`LICENSE`,`FILE`,`2026-07-02T12:00:00`)],imagenet:[]},[V(5)]:{".":[d(`epoch-001`,`DIRECTORY`,`2026-07-27T03:12:00`)],"epoch-001":[]}}),U=({initialValue:e=[],...t})=>{let[n,r]=(0,nt.useState)(e),i=(0,nt.useRef)(null);return(0,B.jsxs)(`div`,{style:{width:it},children:[(0,B.jsx)(et,{ref:i,scope:u,mountableHosts:p,...t,value:n,onChange:e=>{r(e),t.onChange?.(e)}}),(0,B.jsx)(`div`,{style:{marginTop:16},children:(0,B.jsx)(Ie,{onClick:()=>i.current?.refetch(),children:`Refetch via ref`})}),(0,B.jsxs)(`div`,{style:{marginTop:24},children:[(0,B.jsx)(b,{strong:!0,children:`Form value (onChange result)`}),(0,B.jsx)(`pre`,{style:{marginTop:8,padding:12,background:`rgba(0,0,0,0.04)`,borderRadius:6,fontSize:12},children:JSON.stringify(n,null,2)})]})]})},st=[{vfolderId:V(0),name:H(0),mountDestination:`shared`,subpath:``},{vfolderId:V(1),name:H(1),mountDestination:`shared`,subpath:``}],ct={title:`Fragments/BAIVFolderMountConfigInput`,component:et,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:"\n**BAIVFolderMountConfigInput** is a reusable, schema-agnostic controlled input\nfor configuring vfolder mounts.\n\n- Picks folders with `BAIScopedVFolderSelect`, which pages `scopedVFoldersV2` over the\n  `scope` the caller passes (usually its own folders and the current project's), filtered on the server: the host must be in\n  `mountableHosts` (those granting `mount-in-session`), the folder must be ready,\n  and dotfile folders are left out (the session mounts them anyway). Search runs\n  on the server too, and `filter` (a `VFolderFilter`) narrows the options further\n  without shrinking the selection. A folder whose mount level is NONE is listed\n  but cannot be picked.\n- It **suspends** on the first page, so the consumer owns the Suspense boundary. A\n  selected folder the loaded options do not cover is looked up by id; one the\n  mount gates reject is dropped from the value with a warning toast.\n- Beside the select sits a button group: **⟳** always re-runs the folder query (also\n  exposed imperatively as `ref.refetch()`), and **+** is rendered only when\n  `onClickCreateFolder` is given — the folder-creation modal belongs to the host app.\n- Each selected folder appears as a row with a **mount path (alias)** input and an\n  optional **subpath** picker (which subfolder of the vfolder to mount as the source; `/` = root),\n  which opens a directory browser instead of accepting typed text.\n- `mountDestination` stores the **raw alias** the user typed — `''` mounts at the default\n  `/home/work/<name>`, a relative segment like `data` resolves to `/home/work/data`, and an\n  absolute path like `/data` is used as-is. Resolve it with the exported `inputToMountDestination`.\n- It reads the auto-mounted folders (ready dotfile folders in the same scope) itself: they join the\n  overlap check (a user alias colliding with one is flagged) and are shown as read-only tokens at the bottom.\n- `folderExplorerPath` turns every folder name the component renders — each mount row and each\n  auto-mounted badge — into a link into the host app's folder explorer (see **WithFolderExplorerLinks**).\n- Emits a single `VFolderMountConfigValue[]`. The inline per-row errors are advisory UX; to gate a\n  form, wrap the component in one named `Form.Item` whose `rules` carry\n  `useVFolderMountConfigFormRule` (see the **WithFormValidation** story).\n\nThe stories below mock the folder list behind the providers' `suspenseFallback`,\nso of the six fixture folders `cold-archive` is dropped (its host is not in\n`mountableHosts`), `other-team-data` belongs to another project, and `.config` is\nnever offered but listed as an auto-mounted folder.\n"}}},decorators:[e=>(0,B.jsx)(w,{children:(0,B.jsx)(le,{folders:at,trees:ot,suspenseFallback:`Loading...`,children:(0,B.jsx)(e,{})})})],argTypes:{value:{description:`Controlled list of vfolder mount configurations`,table:{type:{summary:`VFolderMountConfigValue[]`}}},onChange:{action:`changed`,description:`Called with the updated mount configuration list`},scope:{control:!1,description:"The scopes a session mounts from (usually `mountableVFolderScope(userId, projectId)`)",table:{type:{summary:`VFolderScope`}}},filter:{control:!1,description:`Server-side VFolderFilter ANDed onto the options query; narrows the options only`,table:{type:{summary:`VFolderFilter`}}},disabled:{control:{type:`boolean`},description:`Disable selection and all row inputs`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},aliasBasePath:{control:{type:`text`},description:`Base path prepended to a relative alias input`,table:{type:{summary:`string`},defaultValue:{summary:`/home/work/`}}},folderExplorerPath:{control:!1,description:`Route that opens a folder in the host app's folder explorer; given, folder names render as links`,table:{type:{summary:`(vfolderId: string) => LinkProps['to']`}}},mountableHosts:{control:{type:`object`},description:"Hosts granting `mount-in-session`, supplied by the host app",table:{type:{summary:`string[]`}}},onClickCreateFolder:{control:!1,description:`Opens the host app's folder-creation modal; the create button appears only when it is given`,table:{type:{summary:`() => void`}}}},args:{scope:u,mountableHosts:p}},W={parameters:{docs:{description:{story:"Empty initial state. The dropdown offers only the mountable folders of the current project. Select one to add a row, then type its mount path and click its subpath field to browse the folder. New rows start at the folder root, shown as `/`. The live form value is shown below — note `mountDestination` holds the raw alias you typed, while `subpath` only ever comes from the picker."}}},render:e=>(0,B.jsx)(U,{...e})},G={parameters:{docs:{description:{story:"Prefilled with three folders demonstrating each alias mode: a relative segment (`data` → `/home/work/data`), an absolute path (`/mnt/shared`, used as-is), and an empty alias (falls back to `/home/work/<name>`). The first mounts the `dataset/train` subpath; the other two mount the folder root, which the picker shows as `/`."}}},render:e=>(0,B.jsx)(U,{...e,initialValue:[{vfolderId:V(0),name:H(0),mountDestination:`data`,subpath:`dataset/train`},{vfolderId:V(1),name:H(1),mountDestination:`/mnt/shared`,subpath:``},{vfolderId:V(5),name:H(5),mountDestination:``,subpath:``}]})},K={parameters:{docs:{description:{story:"Two folders use the same alias (`shared`), so both resolve to `/home/work/shared` and are flagged with the overlap error. The third row types an alias the format check rejects. `useVFolderMountConfigFormRule` rejects this value."}}},render:e=>(0,B.jsx)(U,{...e,initialValue:[...st,{vfolderId:V(5),name:H(5),mountDestination:`bad path!`,subpath:``}]})},q={parameters:{docs:{description:{story:"The ready dotfile folder `.config` is read as auto-mounted and listed as a read-only token below the rows (dotfile folders are never offered in the select). The first folder aliases to `.config`, colliding with the auto-mounted `/home/work/.config`, so it shows the overlap error."}}},render:e=>(0,B.jsx)(U,{...e,initialValue:[{vfolderId:V(0),name:H(0),mountDestination:`.config`,subpath:`dataset`},{vfolderId:V(5),name:H(5),mountDestination:`checkpoints`,subpath:``}]})},J={args:{folderExplorerPath:e=>`#folder=${e}`},parameters:{docs:{description:{story:"With `folderExplorerPath` given, each row's folder name renders as a link (still truncating with a tooltip) and each auto-mounted badge becomes one too. Without it they stay plain text, as in the other stories."}}},render:e=>(0,B.jsx)(U,{...e,initialValue:[{vfolderId:V(0),name:H(0),mountDestination:`data`,subpath:``}]})},Y={parameters:{docs:{description:{story:"The component is wrapped in one named `Form.Item` whose `rules` carry `useVFolderMountConfigFormRule`, so submitting with the two colliding `shared` aliases fails validation with the already-translated message. Fix the aliases and submit again to pass."}}},render:e=>(0,B.jsx)(()=>{let[t]=De.useForm(),[n,r]=(0,nt.useState)(``),{autoMountedFolders:i}=Pe({scope:u,mountableHosts:e.mountableHosts}),a=$e({aliasBasePath:e.aliasBasePath,autoMountedFolders:i});return(0,B.jsxs)(De,{form:t,layout:`vertical`,style:{width:it},initialValues:{mounts:st},children:[(0,B.jsx)(De.Item,{name:`mounts`,label:`VFolder mounts`,rules:[a],children:(0,B.jsx)(et,{...e})}),(0,B.jsx)(Ie,{type:`primary`,onClick:()=>{t.validateFields().then(()=>r(`✅ Valid — form submitted.`)).catch(()=>r(`❌ Invalid — fix the flagged rows.`))},children:`Validate & submit`}),n?(0,B.jsx)(`div`,{style:{marginTop:16},children:(0,B.jsx)(b,{children:n})}):null]})},{})},X={parameters:{docs:{description:{story:"Passing `onClickCreateFolder` adds a **+** button to the group beside the select; clicking it logs to the Actions panel, standing in for the host opening its folder-creation modal. In the app the host then calls `ref.refetch()` (the **Refetch via ref** button below does the same) and appends the created folder to the value. The **⟳** button next to it is always rendered and re-runs the folder list on its own."}}},render:e=>(0,B.jsx)(U,{...e,onClickCreateFolder:rt(`createFolderClicked`)})},Z={parameters:{docs:{description:{story:"`mountableHosts={[]}` — no host grants `mount-in-session`, so every folder is gated out and the popup shows the empty state. This is the case a launcher has to surface rather than letting the user pick a folder the session cannot mount."}}},render:e=>(0,B.jsx)(U,{...e,mountableHosts:[]})},Q={parameters:{docs:{description:{story:"A value restored from a template can name a folder this owner cannot mount. With `mountableHosts={[]}` nothing passes the host gate, so the prefilled entries are dropped from the value on mount and a warning toast explains the shrinking selection — the emitted `onChange` payload below goes straight to `[]`."}}},render:e=>(0,B.jsx)(U,{...e,mountableHosts:[],initialValue:[{vfolderId:V(0),name:H(0),mountDestination:``,subpath:``},{vfolderId:V(1),name:H(1),mountDestination:`shared`,subpath:``}]})},$={parameters:{docs:{description:{story:`Disabled state — the select, the alias input, the subpath picker and the remove button are all inert; the picked subpath stays readable.`}}},render:e=>(0,B.jsx)(U,{...e,disabled:!0,initialValue:[{vfolderId:V(1),name:H(1),mountDestination:`shared`,subpath:``}]})},lt=[`Interactive`,`Prefilled`,`OverlappingPaths`,`WithAutoMountedFolders`,`WithFolderExplorerLinks`,`WithFormValidation`,`WithCreateFolderButton`,`NoMountableHost`,`PrunesUnmountableSelection`,`Disabled`],W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
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
}`,...$.parameters?.docs?.source}}}})))()}ut();export{$ as Disabled,W as Interactive,Z as NoMountableHost,K as OverlappingPaths,G as Prefilled,Q as PrunesUnmountableSelection,q as WithAutoMountedFolders,X as WithCreateFolderButton,J as WithFolderExplorerLinks,Y as WithFormValidation,lt as __namedExportsOrder,ct as default};