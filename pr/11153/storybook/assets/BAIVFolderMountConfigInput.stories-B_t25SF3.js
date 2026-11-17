import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-DlPsW1c0.js";import{n,t as r}from"./_baseAssignValue-BMP2r3Q5.js";import{n as i,t as a}from"./castArray-AZdtGfv6.js";import{n as o,t as s}from"./compact-C9OPbfhP.js";import{i as c,r as ee}from"./keyBy-DTb2LvP4.js";import{m as te,t as ne}from"./hooks-T_PEg8sW.js";import{c as l,g as u,h as re,i as d,l as f,m as ie,n as p,o as ae,p as oe,r as m,s as h,t as se}from"./MockVFolderFileProviders-DU5KdSsc.js";import{i as ce,r as le}from"./includes-DMTgV4pD.js";import{n as g,t as _}from"./some-DkjZXzzg.js";import{t as ue}from"./jsx-runtime-MKhVqBIO.js";import{n as de,t as fe}from"./useBAIi18n-BSL91J13.js";import{t as v}from"./compiler-runtime-DU4U6aph.js";import{n as pe,t as me}from"./createLucideIcon-BXqG86fR.js";import{i as y,r as he}from"./BAIFetchKeyButton-Bq4bfwS8.js";import{n as ge,t as _e}from"./plus-DAwTrFAj.js";import{n as ve,t as ye}from"./rotate-cw-L-Bh31u8.js";import{a as be,o as xe}from"./touchPresentation-SlIXP8m0.js";import{n as Se,t as Ce}from"./BAICard-DIA7uxNc.js";import{r as we,t as Te}from"./Tooltip-Cfb-ZzrB.js";import{n as Ee,t as De}from"./Form-Cgj3iAwB.js";import{Tn as b,b as x,h as S,m as C,wn as Oe,y as ke}from"./iframe-B8SqekXp.js";import{n as w,t as Ae}from"./BAIFlex-DnaoYTJ1.js";import{i as je,n as Me,t as T}from"./useMountableVFolders-oRoz3yWL.js";import{n as E,r as D}from"./dist-CCUsDPCX.js";import{n as O,t as Ne}from"./BAIButton-CKK6R101.js";import{n as k,t as Pe}from"./Token-BqAd0GQ-.js";import{n as A,t as Fe}from"./TextInput-Bv-4RCoU.js";import{n as j,t as Ie}from"./BAIQuestionIconWithTooltip-8wSi6Edo.js";import{n as Le,t as Re}from"./BAILink-C5M4RBbI.js";import{n as M,t as ze}from"./BAIVFolderPathPicker-Ci1DgERq.js";var N,P;function F(){return(F=e((()=>{n(),c(),N=Object.prototype.hasOwnProperty,P=ee(function(e,t,n){N.call(e,n)?++e[n]:r(e,n,1)})})))()}function Be(e){for(var t=-1,n=e==null?0:e.length,i={};++t<n;){var a=e[t];r(i,a[0],a[1])}return i}function I(){return(I=e((()=>{n()})))()}var L,Ve;function R(){return(R=e((()=>{pe(),L={name:`arrow-right`,size:24,node:[[`path`,{d:`M5 12h14`,key:`1ays0h`}],[`path`,{d:`m12 5 7 7-7 7`,key:`xquz4c`}]]},L.node,Ve=me(L)})))()}function He(e){return e.subpathError}function Ue(e){return[e.entityId,e.name]}function We(e){return e.vfolderId}function Ge(e){return e.name?[e.vfolderId,e.name]:null}var Ke,qe,z,Je,Ye,Xe,Ze,Qe,$e,et;function tt(){return(tt=e((()=>{Ke=v(),x(),De(),ne(),fe(),T(),O(),Se(),w(),Le(),j(),S(),A(),u(),M(),ie(),y(),k(),we(),be(),F(),le(),_(),I(),o(),i(),R(),ge(),ve(),b(),qe=t(),z=ue(),Je=/^[a-zA-Z0-9_/.-]*$/,Ye=`/home/work/`,Xe=(e,t,n=Ye)=>{let r=t?.trim();return r?r.startsWith(`/`)?r:`${n}${r}`:`${n}${e}`},Ze=e=>{let t=e?.trim();return t?t.startsWith(`/`)?!0:t.split(`/`).some(e=>e===`..`):!1},Qe=(e,t)=>{let n=t?.aliasBasePath??`/home/work/`,r=e??[],i={};r.forEach(e=>{i[e.vfolderId]=Xe(e.name||e.vfolderId,e.mountDestination,n)});let a=new Set((t?.autoMountedFolders??[]).map(e=>Xe(e.name,``,n))),o=P([...Object.values(i),...a]),s=(e,t)=>{if(!Je.test(e.mountDestination??``))return`invalidFormat`;if(!(o[t]<=1))return a.has(t)?`overlappingWithAutoMount`:`overlapping`},c={};return r.forEach(e=>{let t=i[e.vfolderId];c[e.vfolderId]={mountDestination:t,aliasError:s(e,t),subpathError:Ze(e.subpath)}}),c},$e=e=>{"use memo";let t=(0,Ke.c)(3),{t:n}=de(),r;return t[0]!==e||t[1]!==n?(r={validator:(t,r)=>{let i=ce(Qe(r,e)),a=e=>Promise.reject(Error(n(e))),o=e=>g(i,t=>t.aliasError===e);return o(`invalidFormat`)?a(`comp:BAIVFolderMountConfigInput.AliasInvalid`):o(`overlappingWithAutoMount`)?a(`comp:BAIVFolderMountConfigInput.AliasOverlappingWithAutoMount`):o(`overlapping`)?a(`comp:BAIVFolderMountConfigInput.AliasOverlapping`):g(i,He)?a(`comp:BAIVFolderMountConfigInput.SubpathInvalid`):Promise.resolve()}},t[0]=e,t[1]=n,t[2]=r):r=t[2],r},et=e=>{"use memo";let t=(0,Ke.c)(96),n,r,i,o,c,ee,ne,l,u;t[0]===e?(n=t[1],r=t[2],i=t[3],o=t[4],c=t[5],ee=t[6],ne=t[7],l=t[8],u=t[9]):({scope:l,mountableHosts:o,filter:r,disabled:n,aliasBasePath:u,folderExplorerPath:i,onClickCreateFolder:c,ref:ne,...ee}=e,t[0]=e,t[1]=n,t[2]=r,t[3]=i,t[4]=o,t[5]=c,t[6]=ee,t[7]=ne,t[8]=l,t[9]=u);let d=u===void 0?Ye:u,{t:f}=de(),{message:ie}=ke.useApp(),{token:p}=xe(),ae;t[10]===Symbol.for(`react.memo_cache_sentinel`)?(ae={defaultValue:[]},t[10]=ae):ae=t[10];let[m,h]=te(ee,ae),se=(0,qe.useRef)(null),[ce,le]=(0,qe.useTransition)(),g;t[11]!==o||t[12]!==l?(g={scope:l,mountableHosts:o},t[11]=o,t[12]=l,t[13]=g):g=t[13];let{autoMountedFolders:_,refetch:ue}=je(g),fe;t[14]===ue?fe=t[15]:(fe=()=>{le(()=>{se.current?.refetch(),ue()})},t[14]=ue,t[15]=fe);let v=fe,pe;t[16]===v?pe=t[17]:(pe=()=>({refetch:v}),t[16]=v,t[17]=pe),(0,qe.useImperativeHandle)(ne,pe);let me;t[18]===m?me=t[19]:(me=m??[],t[18]=m,t[19]=me);let y=me,ge;t[20]!==d||t[21]!==_||t[22]!==y?(ge=Qe(y,{aliasBasePath:d,autoMountedFolders:_}),t[20]=d,t[21]=_,t[22]=y,t[23]=ge):ge=t[23];let ve=ge,be;t[24]!==ie||t[25]!==y||t[26]!==h||t[27]!==f?(be=e=>{let{resolved:t,unresolved:n}=e,r=Be(t.map(Ue)),i=e=>!!r[e.vfolderId]&&e.name!==r[e.vfolderId];(n.length!==0||y.some(i))&&(h(e=>e.filter(e=>!n.includes(e.vfolderId)).map(e=>i(e)?{...e,name:r[e.vfolderId]}:e)),n.length>0&&ie.warning(f(`comp:BAIVFolderMountConfigInput.UnmountableFoldersRemoved`)))},t[24]=ie,t[25]=y,t[26]=h,t[27]=f,t[28]=be):be=t[28];let Se=be,we;t[29]!==y||t[30]!==h?(we=e=>{h(e.map(e=>{let t=y.find(t=>t.vfolderId===e.value);return t?{...t,name:e.label}:{vfolderId:e.value,name:e.label,mountDestination:``,subpath:``}}))},t[29]=y,t[30]=h,t[31]=we):we=t[31];let De=we,b;t[32]===f?b=t[33]:(b=f(`comp:BAIVFolderMountConfigInput.SelectFolder`),t[32]=f,t[33]=b);let x;t[34]===f?x=t[35]:(x=f(`comp:BAIVFolderMountConfigInput.SelectFolder`),t[34]=f,t[35]=x);let S;t[36]===o?S=t[37]:(S=Me(o),t[36]=o,t[37]=S);let w;t[38]===r?w=t[39]:(w=s([{status:{equals:`READY`}},{name:{notStartsWith:`.`}},r]),t[38]=r,t[39]=w);let T;t[40]===w?T=t[41]:(T={AND:w},t[40]=w,t[41]=T);let E;t[42]===y?E=t[43]:(E=y.map(We),t[42]=y,t[43]=E);let D;t[44]===y?D=t[45]:(D=Be(s(y.map(Ge))),t[44]=y,t[45]=D);let O;t[46]===De?O=t[47]:(O=(e,t)=>De(a(t??[])),t[46]=De,t[47]=O);let k;t[48]!==n||t[49]!==Se||t[50]!==l||t[51]!==b||t[52]!==x||t[53]!==S||t[54]!==T||t[55]!==E||t[56]!==D||t[57]!==O?(k=(0,z.jsx)(oe,{ref:se,multiple:!0,allowClear:!0,selectionMark:`checkbox`,label:b,isLabelHidden:!0,isDisabled:n,placeholder:x,scope:l,filter:S,optionFilter:T,disableUnmountable:!0,value:E,fallbackLabels:D,onChange:O,onResolve:Se}),t[48]=n,t[49]=Se,t[50]=l,t[51]=b,t[52]=x,t[53]=S,t[54]=T,t[55]=E,t[56]=D,t[57]=O,t[58]=k):k=t[58];let A;t[59]===f?A=t[60]:(A=f(`comp:BAIVFolderMountConfigInput.Folders`),t[59]=f,t[60]=A);let j;t[61]!==n||t[62]!==c||t[63]!==f?(j=c?(0,z.jsx)(Ne,{icon:(0,z.jsx)(_e,{size:`1em`}),title:f(`comp:BAIVFolderMountConfigInput.CreateFolder`),disabled:n,onClick:c}):null,t[61]=n,t[62]=c,t[63]=f,t[64]=j):j=t[64];let Le;t[65]===Symbol.for(`react.memo_cache_sentinel`)?(Le=(0,z.jsx)(ye,{size:`1em`}),t[65]=Le):Le=t[65];let M;t[66]===f?M=t[67]:(M=f(`comp:BAIVFolderMountConfigInput.Refresh`),t[66]=f,t[67]=M);let N;t[68]!==n||t[69]!==ce||t[70]!==v||t[71]!==M?(N=(0,z.jsx)(Ne,{icon:Le,title:M,loading:ce,disabled:n,onClick:v}),t[68]=n,t[69]=ce,t[70]=v,t[71]=M,t[72]=N):N=t[72];let P;t[73]!==A||t[74]!==j||t[75]!==N?(P=(0,z.jsxs)(he,{label:A,children:[j,N]}),t[73]=A,t[74]=j,t[75]=N,t[76]=P):P=t[76];let F;t[77]!==k||t[78]!==P?(F=(0,z.jsxs)(Ae,{direction:`row`,gap:`xs`,justify:`between`,children:[k,P]}),t[77]=k,t[78]=P,t[79]=F):F=t[79];let I;t[80]!==n||t[81]!==i||t[82]!==y||t[83]!==h||t[84]!==ve||t[85]!==f||t[86]!==p?(I=y.length>0&&(0,z.jsx)(Ce,{size:`small`,children:(0,z.jsxs)(`div`,{className:`bai-vfolder-mount-config__grid`,role:`list`,children:[(0,z.jsxs)(`div`,{className:`bai-vfolder-mount-config__header`,children:[(0,z.jsxs)(Ae,{gap:`xxs`,align:`center`,children:[(0,z.jsx)(C,{type:`secondary`,children:f(`comp:BAIVFolderMountConfigInput.SourcePath`)}),(0,z.jsx)(Ie,{title:f(`comp:BAIVFolderMountConfigInput.SubpathTooltip`)})]}),(0,z.jsx)(`span`,{}),(0,z.jsxs)(Ae,{gap:`xxs`,align:`center`,children:[(0,z.jsx)(C,{type:`secondary`,children:f(`comp:BAIVFolderMountConfigInput.DestinationPath`)}),(0,z.jsx)(Ie,{title:f(`comp:BAIVFolderMountConfigInput.PathAndAliasTooltip`)})]}),(0,z.jsx)(`span`,{})]}),y.map(e=>{let t=e.name||e.vfolderId,r=e.mountDestination??``,a=ve[e.vfolderId],o=a.aliasError?f({invalidFormat:`comp:BAIVFolderMountConfigInput.AliasInvalid`,overlapping:`comp:BAIVFolderMountConfigInput.AliasOverlapping`,overlappingWithAutoMount:`comp:BAIVFolderMountConfigInput.AliasOverlappingWithAutoMount`}[a.aliasError]):void 0,s=!!a.subpathError,c=t=>h(n=>n.map(n=>n.vfolderId===e.vfolderId?{...n,...t}:n));return(0,z.jsxs)(`div`,{className:`bai-vfolder-mount-config__row`,role:`listitem`,children:[(0,z.jsx)(Ee.Item,{validateStatus:s?`error`:void 0,help:s?f(`comp:BAIVFolderMountConfigInput.SubpathInvalid`):void 0,style:{marginBottom:0,minWidth:0},children:(0,z.jsxs)(`div`,{className:`bai-vfolder-mount-config__source`,children:[(0,z.jsxs)(`div`,{className:`bai-vfolder-mount-config__folder`,children:[(0,z.jsx)(re,{vfolderId:e.vfolderId}),(0,z.jsx)(`span`,{className:`bai-vfolder-mount-config__folder-name`,children:i?(0,z.jsx)(Re,{to:i(e.vfolderId),ellipsis:!0,children:t}):(0,z.jsx)(C,{ellipsis:{tooltip:!0},children:t})}),(0,z.jsx)(`span`,{className:`bai-vfolder-mount-config__separator`,children:`/`})]}),(0,z.jsx)(ze,{label:f(`comp:BAIVFolderMountConfigInput.Subpath`),placeholder:f(`comp:VFolderPathPicker.SelectAPath`),allowClear:!0,disabled:n,vfolderUuid:e.vfolderId,value:e.subpath,onChange:e=>c({subpath:e??``})})]})}),(0,z.jsx)(`span`,{className:`bai-vfolder-mount-config__arrow`,"aria-hidden":!0,children:(0,z.jsx)(Ve,{size:`1em`})}),(0,z.jsx)(Ee.Item,{validateStatus:o?`error`:void 0,help:o,extra:r.trim()&&r.trim()!==a.mountDestination?(0,z.jsx)(C,{type:`secondary`,ellipsis:{tooltip:!0},children:a.mountDestination}):void 0,style:{marginBottom:0,minWidth:0},children:(0,z.jsx)(Fe,{"aria-label":f(`comp:BAIVFolderMountConfigInput.AliasPlaceholder`),hasClear:!0,disabled:n,placeholder:a.mountDestination,value:r,onChange:e=>c({mountDestination:e})})}),(0,z.jsx)(`div`,{className:`bai-vfolder-mount-config__remove`,children:(0,z.jsx)(Te,{content:f(`comp:BAIVFolderMountConfigInput.RemoveFolder`),children:(0,z.jsx)(Ne,{type:`text`,size:`small`,disabled:n,"aria-label":f(`comp:BAIVFolderMountConfigInput.RemoveFolder`),icon:(0,z.jsx)(Oe,{size:p(`--spacing-4`),color:p(`--color-text-quaternary`)}),style:{flexShrink:0,height:p(`--size-element-md`)},onClick:()=>h(t=>t.filter(t=>t.vfolderId!==e.vfolderId))})})})]},e.vfolderId)})]})}),t[80]=n,t[81]=i,t[82]=y,t[83]=h,t[84]=ve,t[85]=f,t[86]=p,t[87]=I):I=t[87];let L;t[88]!==_||t[89]!==i||t[90]!==f?(L=_.length>0&&(0,z.jsxs)(Ae,{gap:`xxs`,align:`center`,wrap:`wrap`,children:[(0,z.jsx)(C,{type:`secondary`,children:f(`comp:BAIVFolderMountConfigInput.AutoMountedFolders`)}),_.map(e=>i?(0,z.jsx)(Re,{to:i(e.vfolderId),children:(0,z.jsx)(Pe,{label:e.name})},e.vfolderId):(0,z.jsx)(Pe,{label:e.name},e.vfolderId))]}),t[88]=_,t[89]=i,t[90]=f,t[91]=L):L=t[91];let R;return t[92]!==F||t[93]!==I||t[94]!==L?(R=(0,z.jsxs)(Ae,{direction:`column`,align:`stretch`,gap:`xs`,children:[F,I,L]}),t[92]=F,t[93]=I,t[94]=L,t[95]=R):R=t[95],R}})))()}var nt,B,rt,it,at,V,H,ot,U,st,ct,W,G,K,q,J,Y,X,Z,Q,$,lt;function ut(){return(ut=e((()=>{De(),T(),p(),ae(),O(),S(),tt(),nt=t(),E(),B=ue(),{action:rt}=__STORYBOOK_MODULE_ACTIONS__,it=760,at=[...l,h({id:`aaaaaaaa-bbbb-cccc-dddd-eeeeffff0006`,name:`model-checkpoints`})],V=e=>at[e].id,H=e=>at[e].name,ot=()=>({[V(0)]:{".":[f(`dataset`,`DIRECTORY`,`2026-07-21T14:02:00`),f(`scripts`,`DIRECTORY`,`2026-07-18T09:45:00`),f(`README.md`,`FILE`,`2026-07-01T11:20:00`)],dataset:[f(`train`,`DIRECTORY`,`2026-07-22T10:05:00`),f(`validation`,`DIRECTORY`,`2026-07-22T10:05:00`)],"dataset/train":[],"dataset/validation":[],scripts:[]},[V(1)]:{".":[f(`imagenet`,`DIRECTORY`,`2026-07-10T08:00:00`),f(`LICENSE`,`FILE`,`2026-07-02T12:00:00`)],imagenet:[]},[V(5)]:{".":[f(`epoch-001`,`DIRECTORY`,`2026-07-27T03:12:00`)],"epoch-001":[]}}),U=({initialValue:e=[],...t})=>{let[n,r]=(0,nt.useState)(e),i=(0,nt.useRef)(null);return(0,B.jsxs)(`div`,{style:{width:it},children:[(0,B.jsx)(et,{ref:i,scope:d,mountableHosts:m,...t,value:n,onChange:e=>{r(e),t.onChange?.(e)}}),(0,B.jsx)(`div`,{style:{marginTop:16},children:(0,B.jsx)(Ne,{onClick:()=>i.current?.refetch(),children:`Refetch via ref`})}),(0,B.jsxs)(`div`,{style:{marginTop:24},children:[(0,B.jsx)(C,{strong:!0,children:`Form value (onChange result)`}),(0,B.jsx)(`pre`,{style:{marginTop:8,padding:12,background:`rgba(0,0,0,0.04)`,borderRadius:6,fontSize:12},children:JSON.stringify(n,null,2)})]})]})},st=[{vfolderId:V(0),name:H(0),mountDestination:`shared`,subpath:``},{vfolderId:V(1),name:H(1),mountDestination:`shared`,subpath:``}],ct={title:`Fragments/BAIVFolderMountConfigInput`,component:et,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:"\n**BAIVFolderMountConfigInput** is a reusable, schema-agnostic controlled input\nfor configuring vfolder mounts.\n\n- Picks folders with `BAIScopedVFolderSelect`, which pages `scopedVFoldersV2` over the\n  `scope` the caller passes (usually its own folders and the current project's), filtered on the server: the host must be in\n  `mountableHosts` (those granting `mount-in-session`), the folder must be ready,\n  and dotfile folders are left out (the session mounts them anyway). Search runs\n  on the server too, and `filter` (a `VFolderFilter`) narrows the options further\n  without shrinking the selection. A folder whose mount level is NONE is listed\n  but cannot be picked.\n- It **suspends** on the first page, so the consumer owns the Suspense boundary. A\n  selected folder the loaded options do not cover is looked up by id; one the\n  mount gates reject is dropped from the value with a warning toast.\n- Beside the select sits a button group: **⟳** always re-runs the folder query (also\n  exposed imperatively as `ref.refetch()`), and **+** is rendered only when\n  `onClickCreateFolder` is given — the folder-creation modal belongs to the host app.\n- Each selected folder appears as a row with a **mount path (alias)** input and an\n  optional **subpath** picker (which subfolder of the vfolder to mount as the source; `/` = root),\n  which opens a directory browser instead of accepting typed text.\n- `mountDestination` stores the **raw alias** the user typed — `''` mounts at the default\n  `/home/work/<name>`, a relative segment like `data` resolves to `/home/work/data`, and an\n  absolute path like `/data` is used as-is. Resolve it with the exported `inputToMountDestination`.\n- It reads the auto-mounted folders (ready dotfile folders in the same scope) itself: they join the\n  overlap check (a user alias colliding with one is flagged) and are shown as read-only tokens at the bottom.\n- `folderExplorerPath` turns every folder name the component renders — each mount row and each\n  auto-mounted badge — into a link into the host app's folder explorer (see **WithFolderExplorerLinks**).\n- Emits a single `VFolderMountConfigValue[]`. The inline per-row errors are advisory UX; to gate a\n  form, wrap the component in one named `Form.Item` whose `rules` carry\n  `useVFolderMountConfigFormRule` (see the **WithFormValidation** story).\n\nThe stories below mock the folder list behind the providers' `suspenseFallback`,\nso of the six fixture folders `cold-archive` is dropped (its host is not in\n`mountableHosts`), `other-team-data` belongs to another project, and `.config` is\nnever offered but listed as an auto-mounted folder.\n"}}},decorators:[e=>(0,B.jsx)(D,{children:(0,B.jsx)(se,{folders:at,trees:ot,suspenseFallback:`Loading...`,children:(0,B.jsx)(e,{})})})],argTypes:{value:{description:`Controlled list of vfolder mount configurations`,table:{type:{summary:`VFolderMountConfigValue[]`}}},onChange:{action:`changed`,description:`Called with the updated mount configuration list`},scope:{control:!1,description:"The scopes a session mounts from (usually `mountableVFolderScope(userId, projectId)`)",table:{type:{summary:`VFolderScope`}}},filter:{control:!1,description:`Server-side VFolderFilter ANDed onto the options query; narrows the options only`,table:{type:{summary:`VFolderFilter`}}},disabled:{control:{type:`boolean`},description:`Disable selection and all row inputs`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},aliasBasePath:{control:{type:`text`},description:`Base path prepended to a relative alias input`,table:{type:{summary:`string`},defaultValue:{summary:`/home/work/`}}},folderExplorerPath:{control:!1,description:`Route that opens a folder in the host app's folder explorer; given, folder names render as links`,table:{type:{summary:`(vfolderId: string) => LinkProps['to']`}}},mountableHosts:{control:{type:`object`},description:"Hosts granting `mount-in-session`, supplied by the host app",table:{type:{summary:`string[]`}}},onClickCreateFolder:{control:!1,description:`Opens the host app's folder-creation modal; the create button appears only when it is given`,table:{type:{summary:`() => void`}}}},args:{scope:d,mountableHosts:m}},W={parameters:{docs:{description:{story:"Empty initial state. The dropdown offers only the mountable folders of the current project. Select one to add a row, then type its mount path and click its subpath field to browse the folder. New rows start at the folder root, shown as `/`. The live form value is shown below — note `mountDestination` holds the raw alias you typed, while `subpath` only ever comes from the picker."}}},render:e=>(0,B.jsx)(U,{...e})},G={parameters:{docs:{description:{story:"Prefilled with three folders demonstrating each alias mode: a relative segment (`data` → `/home/work/data`), an absolute path (`/mnt/shared`, used as-is), and an empty alias (falls back to `/home/work/<name>`). The first mounts the `dataset/train` subpath; the other two mount the folder root, which the picker shows as `/`."}}},render:e=>(0,B.jsx)(U,{...e,initialValue:[{vfolderId:V(0),name:H(0),mountDestination:`data`,subpath:`dataset/train`},{vfolderId:V(1),name:H(1),mountDestination:`/mnt/shared`,subpath:``},{vfolderId:V(5),name:H(5),mountDestination:``,subpath:``}]})},K={parameters:{docs:{description:{story:"Two folders use the same alias (`shared`), so both resolve to `/home/work/shared` and are flagged with the overlap error. The third row types an alias the format check rejects. `useVFolderMountConfigFormRule` rejects this value."}}},render:e=>(0,B.jsx)(U,{...e,initialValue:[...st,{vfolderId:V(5),name:H(5),mountDestination:`bad path!`,subpath:``}]})},q={parameters:{docs:{description:{story:"The ready dotfile folder `.config` is read as auto-mounted and listed as a read-only token below the rows (dotfile folders are never offered in the select). The first folder aliases to `.config`, colliding with the auto-mounted `/home/work/.config`, so it shows the overlap error."}}},render:e=>(0,B.jsx)(U,{...e,initialValue:[{vfolderId:V(0),name:H(0),mountDestination:`.config`,subpath:`dataset`},{vfolderId:V(5),name:H(5),mountDestination:`checkpoints`,subpath:``}]})},J={args:{folderExplorerPath:e=>`#folder=${e}`},parameters:{docs:{description:{story:"With `folderExplorerPath` given, each row's folder name renders as a link (still truncating with a tooltip) and each auto-mounted badge becomes one too. Without it they stay plain text, as in the other stories."}}},render:e=>(0,B.jsx)(U,{...e,initialValue:[{vfolderId:V(0),name:H(0),mountDestination:`data`,subpath:``}]})},Y={parameters:{docs:{description:{story:"The component is wrapped in one named `Form.Item` whose `rules` carry `useVFolderMountConfigFormRule`, so submitting with the two colliding `shared` aliases fails validation with the already-translated message. Fix the aliases and submit again to pass."}}},render:e=>(0,B.jsx)(()=>{let[t]=Ee.useForm(),[n,r]=(0,nt.useState)(``),{autoMountedFolders:i}=je({scope:d,mountableHosts:e.mountableHosts}),a=$e({aliasBasePath:e.aliasBasePath,autoMountedFolders:i});return(0,B.jsxs)(Ee,{form:t,layout:`vertical`,style:{width:it},initialValues:{mounts:st},children:[(0,B.jsx)(Ee.Item,{name:`mounts`,label:`VFolder mounts`,rules:[a],children:(0,B.jsx)(et,{...e})}),(0,B.jsx)(Ne,{type:`primary`,onClick:()=>{t.validateFields().then(()=>r(`✅ Valid — form submitted.`)).catch(()=>r(`❌ Invalid — fix the flagged rows.`))},children:`Validate & submit`}),n?(0,B.jsx)(`div`,{style:{marginTop:16},children:(0,B.jsx)(C,{children:n})}):null]})},{})},X={parameters:{docs:{description:{story:"Passing `onClickCreateFolder` adds a **+** button to the group beside the select; clicking it logs to the Actions panel, standing in for the host opening its folder-creation modal. In the app the host then calls `ref.refetch()` (the **Refetch via ref** button below does the same) and appends the created folder to the value. The **⟳** button next to it is always rendered and re-runs the folder list on its own."}}},render:e=>(0,B.jsx)(U,{...e,onClickCreateFolder:rt(`createFolderClicked`)})},Z={parameters:{docs:{description:{story:"`mountableHosts={[]}` — no host grants `mount-in-session`, so every folder is gated out and the popup shows the empty state. This is the case a launcher has to surface rather than letting the user pick a folder the session cannot mount."}}},render:e=>(0,B.jsx)(U,{...e,mountableHosts:[]})},Q={parameters:{docs:{description:{story:"A value restored from a template can name a folder this owner cannot mount. With `mountableHosts={[]}` nothing passes the host gate, so the prefilled entries are dropped from the value on mount and a warning toast explains the shrinking selection — the emitted `onChange` payload below goes straight to `[]`."}}},render:e=>(0,B.jsx)(U,{...e,mountableHosts:[],initialValue:[{vfolderId:V(0),name:H(0),mountDestination:``,subpath:``},{vfolderId:V(1),name:H(1),mountDestination:`shared`,subpath:``}]})},$={parameters:{docs:{description:{story:`Disabled state — the select, the alias input, the subpath picker and the remove button are all inert; the picked subpath stays readable.`}}},render:e=>(0,B.jsx)(U,{...e,disabled:!0,initialValue:[{vfolderId:V(1),name:H(1),mountDestination:`shared`,subpath:``}]})},lt=[`Interactive`,`Prefilled`,`OverlappingPaths`,`WithAutoMountedFolders`,`WithFolderExplorerLinks`,`WithFormValidation`,`WithCreateFolderButton`,`NoMountableHost`,`PrunesUnmountableSelection`,`Disabled`],W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
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