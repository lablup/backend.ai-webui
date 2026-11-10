import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-DlPsW1c0.js";import{n,t as r}from"./_baseAssignValue-BWbtd6qj.js";import{n as i,t as a}from"./castArray-AZdtGfv6.js";import{n as o,t as s}from"./compact-C9OPbfhP.js";import{i as c,r as l}from"./keyBy-CtdSHXF8.js";import{m as ee,r as te,t as u}from"./hooks-CWfVxhQL.js";import{_ as d,a as f,c as p,g as m,h,i as g,l as ne,m as re,n as ie,o as ae,r as _,s as oe,t as se,u as ce}from"./MockVFolderFileProviders-CuS5CkPV.js";import{n as le,t as v}from"./map-BLzs52H1.js";import{i as ue,r as de}from"./includes-9bFBXpF0.js";import{n as y,t as fe}from"./sortBy-Cms5zVAV.js";import{n as b,t as x}from"./some-h0q6V2XB.js";import{t as S}from"./jsx-runtime-MKhVqBIO.js";import{n as pe,t as me}from"./useBAIi18n-esubnAWm.js";import{t as he}from"./compiler-runtime-DU4U6aph.js";import{n as ge,t as _e}from"./createLucideIcon-DF5UGKo-.js";import{i as ve,r as ye}from"./BAIFetchKeyButton-D9IupbMu.js";import{n as C,t as be}from"./plus-0g6MD8er.js";import{n as w,t as xe}from"./rotate-cw-C85JqMGf.js";import{n as T,r as Se}from"./useTheme-CojPMc66.js";import{n as E,t as Ce}from"./BAICard-BrzEFIOF.js";import{r as D,t as we}from"./Tooltip-DxNOv_UE.js";import{n as Te,t as O}from"./Form-w-lKRWO0.js";import{b as k,h as A,lt as Ee,m as j,ut as M,y as De}from"./iframe-C67DjySv.js";import{n as N,t as Oe}from"./BAIFlex-DnaoYTJ1.js";import{t as P}from"./react-relay-sHama7hJ.js";import{n as ke,r as F}from"./dist-VyLUzrdQ.js";import{n as I,t as Ae}from"./BAIButton-dUi_XO8L.js";import{n as L,t as je}from"./Token-ClRafBlU.js";import{n as R,t as Me}from"./TextInput-zhfozUS6.js";import{n as z,t as Ne}from"./BAIQuestionIconWithTooltip-kHK1Y7-8.js";import{n as B,t as Pe}from"./BAILink-CuxOL-Ak.js";var V,Fe;function Ie(){return(Ie=e((()=>{n(),c(),V=Object.prototype.hasOwnProperty,Fe=l(function(e,t,n){V.call(e,n)?++e[n]:r(e,n,1)})})))()}function Le(e){for(var t=-1,n=e==null?0:e.length,i={};++t<n;){var a=e[t];r(i,a[0],a[1])}return i}function Re(){return(Re=e((()=>{n()})))()}var ze,Be;function Ve(){return(Ve=e((()=>{ge(),ze=[[`path`,{d:`M5 12h14`,key:`1ays0h`}],[`path`,{d:`m12 5 7 7-7 7`,key:`xquz4c`}]],Be=_e(`arrow-right`,ze)})))()}var He;function Ue(){return(Ue=e((()=>{He=(function(){var e={defaultValue:null,kind:`LocalArgument`,name:`filter`},t={defaultValue:null,kind:`LocalArgument`,name:`limit`},n={defaultValue:null,kind:`LocalArgument`,name:`scope`},r=[{kind:`Variable`,name:`filter`,variableName:`filter`},{kind:`Variable`,name:`limit`,variableName:`limit`},{kind:`Literal`,name:`orderBy`,value:[{direction:`ASC`,field:`NAME`}]},{kind:`Variable`,name:`scope`,variableName:`scope`}],i={alias:null,args:null,kind:`ScalarField`,name:`entityId`,storageKey:null},a={alias:null,args:null,concreteType:`VFolderAccessControlInfo`,kind:`LinkedField`,name:`accessControl`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`permission`,storageKey:null}],storageKey:null},o={alias:null,args:null,concreteType:`VFolderMetadataInfo`,kind:`LinkedField`,name:`metadata`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`name`,storageKey:null}],storageKey:null};return{fragment:{argumentDefinitions:[e,t,n],kind:`Fragment`,metadata:null,name:`useMountableVFoldersAutoMountedQuery`,selections:[{alias:null,args:r,concreteType:`VFolderConnection`,kind:`LinkedField`,name:`scopedVFoldersV2`,plural:!1,selections:[{alias:null,args:null,concreteType:`VFolderEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`VFolder`,kind:`LinkedField`,name:`node`,plural:!1,selections:[i,a,o],storageKey:null}],storageKey:null}],storageKey:null}],type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[n,e,t],kind:`Operation`,name:`useMountableVFoldersAutoMountedQuery`,selections:[{alias:null,args:r,concreteType:`VFolderConnection`,kind:`LinkedField`,name:`scopedVFoldersV2`,plural:!1,selections:[{alias:null,args:null,concreteType:`VFolderEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`VFolder`,kind:`LinkedField`,name:`node`,plural:!1,selections:[i,a,o,{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}]},params:{cacheID:`e1e328b5bd503f08c2eca311e44d22f5`,id:null,metadata:{},name:`useMountableVFoldersAutoMountedQuery`,operationKind:`query`,text:`query useMountableVFoldersAutoMountedQuery(
  $scope: VFolderScope!
  $filter: VFolderFilter
  $limit: Int!
) {
  scopedVFoldersV2(scope: $scope, filter: $filter, limit: $limit, orderBy: [{field: NAME, direction: ASC}]) {
    edges {
      node {
        entityId
        accessControl {
          permission
        }
        metadata {
          name
        }
        id
      }
    }
  }
}
`}}})(),He.hash=`7b931aebf8a54ff24ec5713274ca9fbc`})))()}function We(e){let{node:t}=e;return t.accessControl.permission===`NONE`?null:{vfolderId:t.entityId,name:t.metadata.name}}var Ge,Ke,qe,Je,Ye;function Xe(){return(Xe=e((()=>{Ue(),Ge=he(),u(),fe(),o(),v(),Ke=P(),qe=e=>({host:{in:y(e)},status:{notIn:[`DELETE_COMPLETE`]}}),Je=100,Ye=e=>{"use memo";let t=(0,Ge.c)(17),{scope:n,mountableHosts:r}=e,[i,a]=te(),o;t[0]===r?o=t[1]:(o=qe(r),t[0]=r,t[1]=o);let c;t[2]===Symbol.for(`react.memo_cache_sentinel`)?(c={name:{startsWith:`.`},status:{equals:`READY`}},t[2]=c):c=t[2];let l;t[3]===o?l=t[4]:(l={AND:[o,c]},t[3]=o,t[4]=l);let ee;t[5]!==n||t[6]!==l?(ee={scope:n,filter:l,limit:Je},t[5]=n,t[6]=l,t[7]=ee):ee=t[7];let u;t[8]===i?u=t[9]:(u={fetchKey:i,fetchPolicy:`store-and-network`},t[8]=i,t[9]=u);let{scopedVFoldersV2:d}=(0,Ke.useLazyLoadQuery)(He,ee,u),f;t[10]===(d==null?void 0:d.edges)?f=t[11]:(f=s(le(d==null?void 0:d.edges,We)),t[10]=d==null?void 0:d.edges,t[11]=f);let p=f,m;t[12]===a?m=t[13]:(m=()=>a(),t[12]=a,t[13]=m);let h;return t[14]!==p||t[15]!==m?(h={autoMountedFolders:p,refetch:m},t[14]=p,t[15]=m,t[16]=h):h=t[16],h}})))()}function Ze(e){return e.subpathError}function Qe(e){return[e.entityId,e.name]}function $e(e){return e.vfolderId}function et(e){return e.name?[e.vfolderId,e.name]:null}var tt,nt,H,rt,it,at,ot,st,ct,lt;function ut(){return(ut=e((()=>{tt=he(),k(),O(),u(),me(),Xe(),I(),E(),N(),B(),z(),A(),R(),d(),ce(),h(),ve(),L(),D(),T(),Ie(),de(),x(),Re(),o(),i(),Ve(),C(),w(),M(),nt=t(),H=S(),rt=/^[a-zA-Z0-9_/.-]*$/,it=`/home/work/`,at=(e,t,n=it)=>{let r=t==null?void 0:t.trim();return r?r.startsWith(`/`)?r:`${n}${r}`:`${n}${e}`},ot=e=>{let t=e==null?void 0:e.trim();return t?t.startsWith(`/`)?!0:t.split(`/`).some(e=>e===`..`):!1},st=(e,t)=>{let n=(t==null?void 0:t.aliasBasePath)??`/home/work/`,r=e??[],i={};r.forEach(e=>{i[e.vfolderId]=at(e.name||e.vfolderId,e.mountDestination,n)});let a=new Set(((t==null?void 0:t.autoMountedFolders)??[]).map(e=>at(e.name,``,n))),o=Fe([...Object.values(i),...a]),s=(e,t)=>{if(!rt.test(e.mountDestination??``))return`invalidFormat`;if(!(o[t]<=1))return a.has(t)?`overlappingWithAutoMount`:`overlapping`},c={};return r.forEach(e=>{let t=i[e.vfolderId];c[e.vfolderId]={mountDestination:t,aliasError:s(e,t),subpathError:ot(e.subpath)}}),c},ct=e=>{"use memo";let t=(0,tt.c)(3),{t:n}=pe(),r;return t[0]!==e||t[1]!==n?(r={validator:(t,r)=>{let i=ue(st(r,e)),a=e=>Promise.reject(Error(n(e))),o=e=>b(i,t=>t.aliasError===e);return o(`invalidFormat`)?a(`comp:BAIVFolderMountConfigInput.AliasInvalid`):o(`overlappingWithAutoMount`)?a(`comp:BAIVFolderMountConfigInput.AliasOverlappingWithAutoMount`):o(`overlapping`)?a(`comp:BAIVFolderMountConfigInput.AliasOverlapping`):b(i,Ze)?a(`comp:BAIVFolderMountConfigInput.SubpathInvalid`):Promise.resolve()}},t[0]=e,t[1]=n,t[2]=r):r=t[2],r},lt=e=>{"use memo";let t=(0,tt.c)(96),n,r,i,o,c,l,te,u,d;t[0]===e?(n=t[1],r=t[2],i=t[3],o=t[4],c=t[5],l=t[6],te=t[7],u=t[8],d=t[9]):({scope:u,mountableHosts:o,filter:r,disabled:n,aliasBasePath:d,folderExplorerPath:i,onClickCreateFolder:c,ref:te,...l}=e,t[0]=e,t[1]=n,t[2]=r,t[3]=i,t[4]=o,t[5]=c,t[6]=l,t[7]=te,t[8]=u,t[9]=d);let f=d===void 0?it:d,{t:p}=pe(),{message:h}=De.useApp(),{token:g}=Se(),ie;t[10]===Symbol.for(`react.memo_cache_sentinel`)?(ie={defaultValue:[]},t[10]=ie):ie=t[10];let[ae,_]=ee(l,ie),oe=(0,nt.useRef)(null),[se,ce]=(0,nt.useTransition)(),le;t[11]!==o||t[12]!==u?(le={scope:u,mountableHosts:o},t[11]=o,t[12]=u,t[13]=le):le=t[13];let{autoMountedFolders:v,refetch:ue}=Ye(le),de;t[14]===ue?de=t[15]:(de=()=>{ce(()=>{var e;(e=oe.current)==null||e.refetch(),ue()})},t[14]=ue,t[15]=de);let y=de,fe;t[16]===y?fe=t[17]:(fe=()=>({refetch:y}),t[16]=y,t[17]=fe),(0,nt.useImperativeHandle)(te,fe);let b;t[18]===ae?b=t[19]:(b=ae??[],t[18]=ae,t[19]=b);let x=b,S;t[20]!==f||t[21]!==v||t[22]!==x?(S=st(x,{aliasBasePath:f,autoMountedFolders:v}),t[20]=f,t[21]=v,t[22]=x,t[23]=S):S=t[23];let me=S,he;t[24]!==h||t[25]!==x||t[26]!==_||t[27]!==p?(he=e=>{let{resolved:t,unresolved:n}=e,r=Le(t.map(Qe)),i=e=>!!r[e.vfolderId]&&e.name!==r[e.vfolderId];(n.length!==0||x.some(i))&&(_(e=>e.filter(e=>!n.includes(e.vfolderId)).map(e=>i(e)?{...e,name:r[e.vfolderId]}:e)),n.length>0&&h.warning(p(`comp:BAIVFolderMountConfigInput.UnmountableFoldersRemoved`)))},t[24]=h,t[25]=x,t[26]=_,t[27]=p,t[28]=he):he=t[28];let ge=he,_e;t[29]!==x||t[30]!==_?(_e=e=>{_(e.map(e=>{let t=x.find(t=>t.vfolderId===e.value);return t?{...t,name:e.label}:{vfolderId:e.value,name:e.label,mountDestination:``,subpath:``}}))},t[29]=x,t[30]=_,t[31]=_e):_e=t[31];let ve=_e,C;t[32]===p?C=t[33]:(C=p(`comp:BAIVFolderMountConfigInput.SelectFolder`),t[32]=p,t[33]=C);let w;t[34]===p?w=t[35]:(w=p(`comp:BAIVFolderMountConfigInput.SelectFolder`),t[34]=p,t[35]=w);let T;t[36]===o?T=t[37]:(T=qe(o),t[36]=o,t[37]=T);let E;t[38]===r?E=t[39]:(E=s([{status:{equals:`READY`}},{name:{notStartsWith:`.`}},r]),t[38]=r,t[39]=E);let D;t[40]===E?D=t[41]:(D={AND:E},t[40]=E,t[41]=D);let O;t[42]===x?O=t[43]:(O=x.map($e),t[42]=x,t[43]=O);let k;t[44]===x?k=t[45]:(k=Le(s(x.map(et))),t[44]=x,t[45]=k);let A;t[46]===ve?A=t[47]:(A=(e,t)=>ve(a(t??[])),t[46]=ve,t[47]=A);let M;t[48]!==n||t[49]!==ge||t[50]!==u||t[51]!==C||t[52]!==w||t[53]!==T||t[54]!==D||t[55]!==O||t[56]!==k||t[57]!==A?(M=(0,H.jsx)(re,{ref:oe,multiple:!0,allowClear:!0,selectionMark:`checkbox`,label:C,isLabelHidden:!0,isDisabled:n,placeholder:w,scope:u,filter:T,optionFilter:D,disableUnmountable:!0,value:O,fallbackLabels:k,onChange:A,onResolve:ge}),t[48]=n,t[49]=ge,t[50]=u,t[51]=C,t[52]=w,t[53]=T,t[54]=D,t[55]=O,t[56]=k,t[57]=A,t[58]=M):M=t[58];let N;t[59]===p?N=t[60]:(N=p(`comp:BAIVFolderMountConfigInput.Folders`),t[59]=p,t[60]=N);let P;t[61]!==n||t[62]!==c||t[63]!==p?(P=c?(0,H.jsx)(Ae,{icon:(0,H.jsx)(be,{size:`1em`}),title:p(`comp:BAIVFolderMountConfigInput.CreateFolder`),disabled:n,onClick:c}):null,t[61]=n,t[62]=c,t[63]=p,t[64]=P):P=t[64];let ke;t[65]===Symbol.for(`react.memo_cache_sentinel`)?(ke=(0,H.jsx)(xe,{size:`1em`}),t[65]=ke):ke=t[65];let F;t[66]===p?F=t[67]:(F=p(`comp:BAIVFolderMountConfigInput.Refresh`),t[66]=p,t[67]=F);let I;t[68]!==n||t[69]!==se||t[70]!==y||t[71]!==F?(I=(0,H.jsx)(Ae,{icon:ke,title:F,loading:se,disabled:n,onClick:y}),t[68]=n,t[69]=se,t[70]=y,t[71]=F,t[72]=I):I=t[72];let L;t[73]!==N||t[74]!==P||t[75]!==I?(L=(0,H.jsxs)(ye,{label:N,children:[P,I]}),t[73]=N,t[74]=P,t[75]=I,t[76]=L):L=t[76];let R;t[77]!==M||t[78]!==L?(R=(0,H.jsxs)(Oe,{direction:`row`,gap:`xs`,justify:`between`,children:[M,L]}),t[77]=M,t[78]=L,t[79]=R):R=t[79];let z;t[80]!==n||t[81]!==i||t[82]!==x||t[83]!==_||t[84]!==me||t[85]!==p||t[86]!==g?(z=x.length>0&&(0,H.jsx)(Ce,{size:`small`,children:(0,H.jsxs)(`div`,{className:`bai-vfolder-mount-config__grid`,role:`list`,children:[(0,H.jsxs)(`div`,{className:`bai-vfolder-mount-config__header`,children:[(0,H.jsxs)(Oe,{gap:`xxs`,align:`center`,children:[(0,H.jsx)(j,{type:`secondary`,children:p(`comp:BAIVFolderMountConfigInput.SourcePath`)}),(0,H.jsx)(Ne,{title:p(`comp:BAIVFolderMountConfigInput.SubpathTooltip`)})]}),(0,H.jsx)(`span`,{}),(0,H.jsxs)(Oe,{gap:`xxs`,align:`center`,children:[(0,H.jsx)(j,{type:`secondary`,children:p(`comp:BAIVFolderMountConfigInput.DestinationPath`)}),(0,H.jsx)(Ne,{title:p(`comp:BAIVFolderMountConfigInput.PathAndAliasTooltip`)})]}),(0,H.jsx)(`span`,{})]}),x.map(e=>{let t=e.name||e.vfolderId,r=e.mountDestination??``,a=me[e.vfolderId],o=a.aliasError?p({invalidFormat:`comp:BAIVFolderMountConfigInput.AliasInvalid`,overlapping:`comp:BAIVFolderMountConfigInput.AliasOverlapping`,overlappingWithAutoMount:`comp:BAIVFolderMountConfigInput.AliasOverlappingWithAutoMount`}[a.aliasError]):void 0,s=!!a.subpathError,c=t=>_(n=>n.map(n=>n.vfolderId===e.vfolderId?{...n,...t}:n));return(0,H.jsxs)(`div`,{className:`bai-vfolder-mount-config__row`,role:`listitem`,children:[(0,H.jsx)(Te.Item,{validateStatus:s?`error`:void 0,help:s?p(`comp:BAIVFolderMountConfigInput.SubpathInvalid`):void 0,style:{marginBottom:0,minWidth:0},children:(0,H.jsxs)(`div`,{className:`bai-vfolder-mount-config__source`,children:[(0,H.jsxs)(`div`,{className:`bai-vfolder-mount-config__folder`,children:[(0,H.jsx)(m,{vfolderId:e.vfolderId}),(0,H.jsx)(`span`,{className:`bai-vfolder-mount-config__folder-name`,children:i?(0,H.jsx)(Pe,{to:i(e.vfolderId),ellipsis:!0,children:t}):(0,H.jsx)(j,{ellipsis:{tooltip:!0},children:t})}),(0,H.jsx)(`span`,{className:`bai-vfolder-mount-config__separator`,children:`/`})]}),(0,H.jsx)(ne,{label:p(`comp:BAIVFolderMountConfigInput.Subpath`),placeholder:p(`comp:VFolderPathPicker.SelectAPath`),allowClear:!0,disabled:n,vfolderUuid:e.vfolderId,value:e.subpath,onChange:e=>c({subpath:e??``})})]})}),(0,H.jsx)(`span`,{className:`bai-vfolder-mount-config__arrow`,"aria-hidden":!0,children:(0,H.jsx)(Be,{size:`1em`})}),(0,H.jsx)(Te.Item,{validateStatus:o?`error`:void 0,help:o,extra:r.trim()&&r.trim()!==a.mountDestination?(0,H.jsx)(j,{type:`secondary`,ellipsis:{tooltip:!0},children:a.mountDestination}):void 0,style:{marginBottom:0,minWidth:0},children:(0,H.jsx)(Me,{"aria-label":p(`comp:BAIVFolderMountConfigInput.AliasPlaceholder`),hasClear:!0,disabled:n,placeholder:a.mountDestination,value:r,onChange:e=>c({mountDestination:e})})}),(0,H.jsx)(`div`,{className:`bai-vfolder-mount-config__remove`,children:(0,H.jsx)(we,{content:p(`comp:BAIVFolderMountConfigInput.RemoveFolder`),children:(0,H.jsx)(Ae,{type:`text`,size:`small`,disabled:n,"aria-label":p(`comp:BAIVFolderMountConfigInput.RemoveFolder`),icon:(0,H.jsx)(Ee,{size:g(`--spacing-4`),color:g(`--color-text-quaternary`)}),style:{flexShrink:0,height:g(`--size-element-md`)},onClick:()=>_(t=>t.filter(t=>t.vfolderId!==e.vfolderId))})})})]},e.vfolderId)})]})}),t[80]=n,t[81]=i,t[82]=x,t[83]=_,t[84]=me,t[85]=p,t[86]=g,t[87]=z):z=t[87];let B;t[88]!==v||t[89]!==i||t[90]!==p?(B=v.length>0&&(0,H.jsxs)(Oe,{gap:`xxs`,align:`center`,wrap:`wrap`,children:[(0,H.jsx)(j,{type:`secondary`,children:p(`comp:BAIVFolderMountConfigInput.AutoMountedFolders`)}),v.map(e=>i?(0,H.jsx)(Pe,{to:i(e.vfolderId),children:(0,H.jsx)(je,{label:e.name})},e.vfolderId):(0,H.jsx)(je,{label:e.name},e.vfolderId))]}),t[88]=v,t[89]=i,t[90]=p,t[91]=B):B=t[91];let V;return t[92]!==R||t[93]!==z||t[94]!==B?(V=(0,H.jsxs)(Oe,{direction:`column`,align:`stretch`,gap:`xs`,children:[R,z,B]}),t[92]=R,t[93]=z,t[94]=B,t[95]=V):V=t[95],V}})))()}var dt,U,ft,pt,mt,ht,gt,_t,vt,yt,bt,xt,St,Ct,wt,Tt,Et,Dt,Ot,kt,At,jt,Mt,Nt,Pt,Ft,It,Lt,Rt,zt,W,G,Bt,K,Vt,Ht,q,Ut,J,Y,X,Z,Q,Wt,Gt,$,Kt;function qt(){return(qt=e((()=>{O(),Xe(),ie(),f(),I(),A(),ut(),dt=t(),ke(),U=S(),{action:Lt}=__STORYBOOK_MODULE_ACTIONS__,Rt=760,zt=[...oe,ae({id:`aaaaaaaa-bbbb-cccc-dddd-eeeeffff0006`,name:`model-checkpoints`})],W=e=>zt[e].id,G=e=>zt[e].name,Bt=()=>({[W(0)]:{".":[p(`dataset`,`DIRECTORY`,`2026-07-21T14:02:00`),p(`scripts`,`DIRECTORY`,`2026-07-18T09:45:00`),p(`README.md`,`FILE`,`2026-07-01T11:20:00`)],dataset:[p(`train`,`DIRECTORY`,`2026-07-22T10:05:00`),p(`validation`,`DIRECTORY`,`2026-07-22T10:05:00`)],"dataset/train":[],"dataset/validation":[],scripts:[]},[W(1)]:{".":[p(`imagenet`,`DIRECTORY`,`2026-07-10T08:00:00`),p(`LICENSE`,`FILE`,`2026-07-02T12:00:00`)],imagenet:[]},[W(5)]:{".":[p(`epoch-001`,`DIRECTORY`,`2026-07-27T03:12:00`)],"epoch-001":[]}}),K=({initialValue:e=[],...t})=>{let[n,r]=(0,dt.useState)(e),i=(0,dt.useRef)(null);return(0,U.jsxs)(`div`,{style:{width:Rt},children:[(0,U.jsx)(lt,{ref:i,scope:g,mountableHosts:_,...t,value:n,onChange:e=>{var n;r(e),(n=t.onChange)==null||n.call(t,e)}}),(0,U.jsx)(`div`,{style:{marginTop:16},children:(0,U.jsx)(Ae,{onClick:()=>{var e;return(e=i.current)==null?void 0:e.refetch()},children:`Refetch via ref`})}),(0,U.jsxs)(`div`,{style:{marginTop:24},children:[(0,U.jsx)(j,{strong:!0,children:`Form value (onChange result)`}),(0,U.jsx)(`pre`,{style:{marginTop:8,padding:12,background:`rgba(0,0,0,0.04)`,borderRadius:6,fontSize:12},children:JSON.stringify(n,null,2)})]})]})},Vt=[{vfolderId:W(0),name:G(0),mountDestination:`shared`,subpath:``},{vfolderId:W(1),name:G(1),mountDestination:`shared`,subpath:``}],Ht={title:`Fragments/BAIVFolderMountConfigInput`,component:lt,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:"\n**BAIVFolderMountConfigInput** is a reusable, schema-agnostic controlled input\nfor configuring vfolder mounts.\n\n- Picks folders with `BAIScopedVFolderSelect`, which pages `scopedVFoldersV2` over the\n  `scope` the caller passes (usually its own folders and the current project's), filtered on the server: the host must be in\n  `mountableHosts` (those granting `mount-in-session`), the folder must be ready,\n  and dotfile folders are left out (the session mounts them anyway). Search runs\n  on the server too, and `filter` (a `VFolderFilter`) narrows the options further\n  without shrinking the selection. A folder whose mount level is NONE is listed\n  but cannot be picked.\n- It **suspends** on the first page, so the consumer owns the Suspense boundary. A\n  selected folder the loaded options do not cover is looked up by id; one the\n  mount gates reject is dropped from the value with a warning toast.\n- Beside the select sits a button group: **⟳** always re-runs the folder query (also\n  exposed imperatively as `ref.refetch()`), and **+** is rendered only when\n  `onClickCreateFolder` is given — the folder-creation modal belongs to the host app.\n- Each selected folder appears as a row with a **mount path (alias)** input and an\n  optional **subpath** picker (which subfolder of the vfolder to mount as the source; `/` = root),\n  which opens a directory browser instead of accepting typed text.\n- `mountDestination` stores the **raw alias** the user typed — `''` mounts at the default\n  `/home/work/<name>`, a relative segment like `data` resolves to `/home/work/data`, and an\n  absolute path like `/data` is used as-is. Resolve it with the exported `inputToMountDestination`.\n- It reads the auto-mounted folders (ready dotfile folders in the same scope) itself: they join the\n  overlap check (a user alias colliding with one is flagged) and are shown as read-only tokens at the bottom.\n- `folderExplorerPath` turns every folder name the component renders — each mount row and each\n  auto-mounted badge — into a link into the host app's folder explorer (see **WithFolderExplorerLinks**).\n- Emits a single `VFolderMountConfigValue[]`. The inline per-row errors are advisory UX; to gate a\n  form, wrap the component in one named `Form.Item` whose `rules` carry\n  `useVFolderMountConfigFormRule` (see the **WithFormValidation** story).\n\nThe stories below mock the folder list behind the providers' `suspenseFallback`,\nso of the six fixture folders `cold-archive` is dropped (its host is not in\n`mountableHosts`), `other-team-data` belongs to another project, and `.config` is\nnever offered but listed as an auto-mounted folder.\n"}}},decorators:[e=>(0,U.jsx)(F,{children:(0,U.jsx)(se,{folders:zt,trees:Bt,suspenseFallback:`Loading...`,children:(0,U.jsx)(e,{})})})],argTypes:{value:{description:`Controlled list of vfolder mount configurations`,table:{type:{summary:`VFolderMountConfigValue[]`}}},onChange:{action:`changed`,description:`Called with the updated mount configuration list`},scope:{control:!1,description:"The scopes a session mounts from (usually `mountableVFolderScope(userId, projectId)`)",table:{type:{summary:`VFolderScope`}}},filter:{control:!1,description:`Server-side VFolderFilter ANDed onto the options query; narrows the options only`,table:{type:{summary:`VFolderFilter`}}},disabled:{control:{type:`boolean`},description:`Disable selection and all row inputs`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},aliasBasePath:{control:{type:`text`},description:`Base path prepended to a relative alias input`,table:{type:{summary:`string`},defaultValue:{summary:`/home/work/`}}},folderExplorerPath:{control:!1,description:`Route that opens a folder in the host app's folder explorer; given, folder names render as links`,table:{type:{summary:`(vfolderId: string) => LinkProps['to']`}}},mountableHosts:{control:{type:`object`},description:"Hosts granting `mount-in-session`, supplied by the host app",table:{type:{summary:`string[]`}}},onClickCreateFolder:{control:!1,description:`Opens the host app's folder-creation modal; the create button appears only when it is given`,table:{type:{summary:`() => void`}}}},args:{scope:g,mountableHosts:_}},q={parameters:{docs:{description:{story:"Empty initial state. The dropdown offers only the mountable folders of the current project. Select one to add a row, then type its mount path and click its subpath field to browse the folder. New rows start at the folder root, shown as `/`. The live form value is shown below — note `mountDestination` holds the raw alias you typed, while `subpath` only ever comes from the picker."}}},render:e=>(0,U.jsx)(K,{...e})},Ut={parameters:{docs:{description:{story:"Prefilled with three folders demonstrating each alias mode: a relative segment (`data` → `/home/work/data`), an absolute path (`/mnt/shared`, used as-is), and an empty alias (falls back to `/home/work/<name>`). The first mounts the `dataset/train` subpath; the other two mount the folder root, which the picker shows as `/`."}}},render:e=>(0,U.jsx)(K,{...e,initialValue:[{vfolderId:W(0),name:G(0),mountDestination:`data`,subpath:`dataset/train`},{vfolderId:W(1),name:G(1),mountDestination:`/mnt/shared`,subpath:``},{vfolderId:W(5),name:G(5),mountDestination:``,subpath:``}]})},J={parameters:{docs:{description:{story:"Two folders use the same alias (`shared`), so both resolve to `/home/work/shared` and are flagged with the overlap error. The third row types an alias the format check rejects. `useVFolderMountConfigFormRule` rejects this value."}}},render:e=>(0,U.jsx)(K,{...e,initialValue:[...Vt,{vfolderId:W(5),name:G(5),mountDestination:`bad path!`,subpath:``}]})},Y={parameters:{docs:{description:{story:"The ready dotfile folder `.config` is read as auto-mounted and listed as a read-only token below the rows (dotfile folders are never offered in the select). The first folder aliases to `.config`, colliding with the auto-mounted `/home/work/.config`, so it shows the overlap error."}}},render:e=>(0,U.jsx)(K,{...e,initialValue:[{vfolderId:W(0),name:G(0),mountDestination:`.config`,subpath:`dataset`},{vfolderId:W(5),name:G(5),mountDestination:`checkpoints`,subpath:``}]})},X={args:{folderExplorerPath:e=>`#folder=${e}`},parameters:{docs:{description:{story:"With `folderExplorerPath` given, each row's folder name renders as a link (still truncating with a tooltip) and each auto-mounted badge becomes one too. Without it they stay plain text, as in the other stories."}}},render:e=>(0,U.jsx)(K,{...e,initialValue:[{vfolderId:W(0),name:G(0),mountDestination:`data`,subpath:``}]})},Z={parameters:{docs:{description:{story:"The component is wrapped in one named `Form.Item` whose `rules` carry `useVFolderMountConfigFormRule`, so submitting with the two colliding `shared` aliases fails validation with the already-translated message. Fix the aliases and submit again to pass."}}},render:e=>(0,U.jsx)(()=>{let[t]=Te.useForm(),[n,r]=(0,dt.useState)(``),{autoMountedFolders:i}=Ye({scope:g,mountableHosts:e.mountableHosts}),a=ct({aliasBasePath:e.aliasBasePath,autoMountedFolders:i});return(0,U.jsxs)(Te,{form:t,layout:`vertical`,style:{width:Rt},initialValues:{mounts:Vt},children:[(0,U.jsx)(Te.Item,{name:`mounts`,label:`VFolder mounts`,rules:[a],children:(0,U.jsx)(lt,{...e})}),(0,U.jsx)(Ae,{type:`primary`,onClick:()=>{t.validateFields().then(()=>r(`✅ Valid — form submitted.`)).catch(()=>r(`❌ Invalid — fix the flagged rows.`))},children:`Validate & submit`}),n?(0,U.jsx)(`div`,{style:{marginTop:16},children:(0,U.jsx)(j,{children:n})}):null]})},{})},Q={parameters:{docs:{description:{story:"Passing `onClickCreateFolder` adds a **+** button to the group beside the select; clicking it logs to the Actions panel, standing in for the host opening its folder-creation modal. In the app the host then calls `ref.refetch()` (the **Refetch via ref** button below does the same) and appends the created folder to the value. The **⟳** button next to it is always rendered and re-runs the folder list on its own."}}},render:e=>(0,U.jsx)(K,{...e,onClickCreateFolder:Lt(`createFolderClicked`)})},Wt={parameters:{docs:{description:{story:"`mountableHosts={[]}` — no host grants `mount-in-session`, so every folder is gated out and the popup shows the empty state. This is the case a launcher has to surface rather than letting the user pick a folder the session cannot mount."}}},render:e=>(0,U.jsx)(K,{...e,mountableHosts:[]})},Gt={parameters:{docs:{description:{story:"A value restored from a template can name a folder this owner cannot mount. With `mountableHosts={[]}` nothing passes the host gate, so the prefilled entries are dropped from the value on mount and a warning toast explains the shrinking selection — the emitted `onChange` payload below goes straight to `[]`."}}},render:e=>(0,U.jsx)(K,{...e,mountableHosts:[],initialValue:[{vfolderId:W(0),name:G(0),mountDestination:``,subpath:``},{vfolderId:W(1),name:G(1),mountDestination:`shared`,subpath:``}]})},$={parameters:{docs:{description:{story:`Disabled state — the select, the alias input, the subpath picker and the remove button are all inert; the picked subpath stays readable.`}}},render:e=>(0,U.jsx)(K,{...e,disabled:!0,initialValue:[{vfolderId:W(1),name:G(1),mountDestination:`shared`,subpath:``}]})},q.parameters={...q.parameters,docs:{...(ft=q.parameters)==null?void 0:ft.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Empty initial state. The dropdown offers only the mountable folders of the current project. Select one to add a row, then type its mount path and click its subpath field to browse the folder. New rows start at the folder root, shown as \`/\`. The live form value is shown below — note \`mountDestination\` holds the raw alias you typed, while \`subpath\` only ever comes from the picker.'
      }
    }
  },
  render: args => <ControlledDemo {...args} />
}`,...(pt=q.parameters)==null||(pt=pt.docs)==null?void 0:pt.source}}},Ut.parameters={...Ut.parameters,docs:{...(mt=Ut.parameters)==null?void 0:mt.docs,source:{originalSource:`{
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
}`,...(ht=Ut.parameters)==null||(ht=ht.docs)==null?void 0:ht.source}}},J.parameters={...J.parameters,docs:{...(gt=J.parameters)==null?void 0:gt.docs,source:{originalSource:`{
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
}`,...(_t=J.parameters)==null||(_t=_t.docs)==null?void 0:_t.source},description:{story:`Error state — two folders resolve to the same mount path, so both rows show
the overlap error.`,...(vt=J.parameters)==null||(vt=vt.docs)==null?void 0:vt.description}}},Y.parameters={...Y.parameters,docs:{...(yt=Y.parameters)==null?void 0:yt.docs,source:{originalSource:`{
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
}`,...(bt=Y.parameters)==null||(bt=bt.docs)==null?void 0:bt.source},description:{story:`Auto-mounted folders are listed as read-only tags at the bottom, and a user
alias that collides with one of them is flagged as an overlap.`,...(xt=Y.parameters)==null||(xt=xt.docs)==null?void 0:xt.description}}},X.parameters={...X.parameters,docs:{...(St=X.parameters)==null?void 0:St.docs,source:{originalSource:`{
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
}`,...(Ct=X.parameters)==null||(Ct=Ct.docs)==null?void 0:Ct.source},description:{story:"`folderExplorerPath` turns the folder names into links into the host app's\nfolder explorer — both the mount rows and the auto-mounted badges.",...(wt=X.parameters)==null||(wt=wt.docs)==null?void 0:wt.description}}},Z.parameters={...Z.parameters,docs:{...(Tt=Z.parameters)==null?void 0:Tt.docs,source:{originalSource:`{
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
}`,...(Et=Z.parameters)==null||(Et=Et.docs)==null?void 0:Et.source},description:{story:"Demonstrates the recommended form-gate pattern: a single named `Form.Item`\nwrapping the component, with `useVFolderMountConfigFormRule` in `rules` so\n`form.validateFields()` rejects on invalid input.",...(Dt=Z.parameters)==null||(Dt=Dt.docs)==null?void 0:Dt.description}}},Q.parameters={...Q.parameters,docs:{...(Ot=Q.parameters)==null?void 0:Ot.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Passing \`onClickCreateFolder\` adds a **+** button to the group beside the select; clicking it logs to the Actions panel, standing in for the host opening its folder-creation modal. In the app the host then calls \`ref.refetch()\` (the **Refetch via ref** button below does the same) and appends the created folder to the value. The **⟳** button next to it is always rendered and re-runs the folder list on its own.'
      }
    }
  },
  render: args => <ControlledDemo {...args} onClickCreateFolder={action('createFolderClicked')} />
}`,...(kt=Q.parameters)==null||(kt=kt.docs)==null?void 0:kt.source},description:{story:"The create button next to the select appears only when the host supplies\n`onClickCreateFolder`, because the folder-creation modal is a host component.",...(At=Q.parameters)==null||(At=At.docs)==null?void 0:At.description}}},Wt.parameters={...Wt.parameters,docs:{...(jt=Wt.parameters)==null?void 0:jt.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: '\`mountableHosts={[]}\` — no host grants \`mount-in-session\`, so every folder is gated out and the popup shows the empty state. This is the case a launcher has to surface rather than letting the user pick a folder the session cannot mount.'
      }
    }
  },
  render: args => <ControlledDemo {...args} mountableHosts={[]} />
}`,...(Mt=Wt.parameters)==null||(Mt=Mt.docs)==null?void 0:Mt.source}}},Gt.parameters={...Gt.parameters,docs:{...(Nt=Gt.parameters)==null?void 0:Nt.docs,source:{originalSource:`{
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
}`,...(Pt=Gt.parameters)==null||(Pt=Pt.docs)==null?void 0:Pt.source}}},$.parameters={...$.parameters,docs:{...(Ft=$.parameters)==null?void 0:Ft.docs,source:{originalSource:`{
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
}`,...(It=$.parameters)==null||(It=It.docs)==null?void 0:It.source}}},Kt=[`Interactive`,`Prefilled`,`OverlappingPaths`,`WithAutoMountedFolders`,`WithFolderExplorerLinks`,`WithFormValidation`,`WithCreateFolderButton`,`NoMountableHost`,`PrunesUnmountableSelection`,`Disabled`]})))()}qt();export{$ as Disabled,q as Interactive,Wt as NoMountableHost,J as OverlappingPaths,Ut as Prefilled,Gt as PrunesUnmountableSelection,Y as WithAutoMountedFolders,Q as WithCreateFolderButton,X as WithFolderExplorerLinks,Z as WithFormValidation,Kt as __namedExportsOrder,Ht as default};