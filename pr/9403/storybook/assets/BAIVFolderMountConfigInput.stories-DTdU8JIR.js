import{c as Pe,a as Te,t as _e,j as o,B as g,T as Ee,aZ as Re,aJ as Ne,r as N}from"./iframe-DS2Dz7J1.js";import{B as Me}from"./BAIButton-wvlLE7Tz.js";import{B as I}from"./BAIFlex-DaddEd6z.js";import{B as q}from"./BAIQuestionIconWithTooltip-Dbb8t9cn.js";import{B as Oe}from"./BAIVFolderSelect-CzHV__5P.js";import{u as ze}from"./useControllableValue-CK0TXVFU.js";import{F as R}from"./engine-D_LTotOu.js";import{T as G}from"./TextInput-DaRZavQP.js";import{b as We}from"./_baseAssignValue-Cp6BcXAT.js";import{c as $e}from"./toLower-BG1c2-4p.js";import{B as He}from"./Badge-Bex2TrkE.js";import{c as Le}from"./BAIComplexSelect-CSamZrmI.js";import{r as Ue}from"./index-DMij6bXE.js";import{r as K}from"./index-DoQOkQ1n.js";import"./preload-helper-Dp1pzeXC.js";import"./astryxLabel-nDvnbzyc.js";import"./BAIIconWithTooltip-BBAgWigo.js";import"./astryxPlacement-BxR6_qos.js";import"./circle-question-mark-CRih9bn9.js";import"./index-UsBAikBU.js";import"./isNumber-DSYEdIoR.js";import"./toString-DdQhsmw4.js";import"./isSymbol-CQpN3Rvj.js";import"./filter-Bfhwm2ig.js";import"./_baseEach-CMXPdK5J.js";import"./get-CQFSoXTW.js";import"./_baseGet-BhP5sQkk.js";import"./identity-DKeuBCMA.js";import"./isEmpty-CDwewnbw.js";import"./useDebounce-DQQc2QlR.js";import"./useEventNotStable-DdR1m1BF.js";import"./uniqBy-Bl8f1bvo.js";import"./_baseUniq-CWPKlTnZ.js";import"./_baseIndexOf-Be9UPhX8.js";import"./_baseFindIndex-Cj99RmFE.js";import"./noop-DX6rZLP_.js";import"./toFinite-YvvTBlGy.js";import"./_trimmedEndIndex-DuQxD0U0.js";import"./index-BSb_6vzA.js";import"./useConnectedBAIClient-jhd8rhGr.js";import"./reactQueryAlias-D6JtDqX8.js";import"./BAIPropertyFilter-Dp4L2uML.js";import"./PowerSearch-CcsWN7wd.js";import"./_charsEndIndex-BHSW-HpW.js";import"./_baseSlice-F8doVSIJ.js";import"./compact-CU4PNV0P.js";import"./map-DqL41cA0.js";import"./isNil-CHIgUVhi.js";import"./includes-DANd5LwM.js";import"./isString-CsXXwpAL.js";import"./toInteger-fWue3xbM.js";import"./usePopover-xf8NdkU-.js";import"./useDevWarning-CnB5nuES.js";import"./rtlStyles-T4i24HtE.js";import"./characters-DWaYg7k3.js";import"./NumberInput-D0DvUzse.js";import"./useResolvedRequired-CbfFEjjf.js";import"./useInputStatusIcon-CRWAcmdt.js";import"./InputGroupContext-wrkjdme_.js";import"./InputClearButton-DGC1LwaM.js";import"./Token-C5sW_P43.js";import"./composeEventHandlers-BolWE7qY.js";import"./Selector-snWg4Dn4.js";import"./useTypeahead-ChypKPMu.js";import"./SelectorOption-CDUeYVLS.js";import"./Item-BArnhw1P.js";import"./useIndicator-DBvPaegY.js";import"./isRenderable-BUV0eL6r.js";import"./Divider-A0dFDhPD.js";import"./isRtlElement-B2-7SF8s.js";import"./VStack-BwX0H1Ty.js";import"./find-DueMjuRn.js";import"./join-DKskq_cE.js";import"./forEach-yBNS1lRE.js";import"./_arrayEach-DpGxo2Of.js";import"./_castFunction-a6W-o7Lo.js";import"./split-BRUhyFtS.js";import"./_isIterateeCall-CiWaSrA0.js";import"./uniq-BCL9Wk3Y.js";import"./_defineProperty-DoPihgKb.js";import"./clamp-Dzh6FHtT.js";import"./_baseClamp-DVUOCJN_.js";import"./some-BTKdk4vU.js";var Qe=Object.prototype,Je=Qe.hasOwnProperty,Xe=$e(function(t,e,a){Je.call(t,a)?++t[a]:We(t,a,1)});const Ze=/^[a-zA-Z0-9_/.-]*$/,Se="/home/work/",Y=(t,e,a)=>{const n=e==null?void 0:e.trim();return n?n.startsWith("/")?n:`${a}${n}`:`${a}${t}`},qe=t=>{const e=t==null?void 0:t.trim();return e?e.startsWith("/")?!0:e.split("/").some(a=>a===".."):!1},ke=(t,e)=>{const a=(e==null?void 0:e.aliasBasePath)??Se,n=t??[],i={};n.forEach(d=>{i[d.vfolderId]=Y(d.name||d.vfolderId,d.mountDestination,a)});const u=((e==null?void 0:e.autoMountedFolderNames)??[]).map(d=>Y(d,"",a)),h=Xe([...Object.values(i),...u]),f={};return n.forEach(d=>{const r=i[d.vfolderId];f[d.vfolderId]={mountDestination:r,aliasError:Ze.test(d.mountDestination??"")?h[r]>1?"overlapping":void 0:"invalidFormat",subpathError:qe(d.subpath)}}),f},Ge=(t,e)=>Object.values(ke(t,e)).every(a=>!a.aliasError&&!a.subpathError),X=t=>{"use memo";const e=Pe.c(43);let a,n,i,u,h,f;e[0]!==t?({currentProjectId:n,filter:u,disabled:i,aliasBasePath:f,autoMountedFolderNames:a,...h}=t,e[0]=t,e[1]=a,e[2]=n,e[3]=i,e[4]=u,e[5]=h,e[6]=f):(a=e[1],n=e[2],i=e[3],u=e[4],h=e[5],f=e[6]);const d=f===void 0?Se:f,{t:r}=Te(),{token:v}=_e.useToken();let z;e[7]===Symbol.for("react.memo_cache_sentinel")?(z={defaultValue:[]},e[7]=z):z=e[7];const[L,c]=ze(h,z);let l,w,W;e[8]!==d||e[9]!==a||e[10]!==L?(l=L??[],w=l.map(Ke),W=ke(l,{aliasBasePath:d,autoMountedFolderNames:a}),e[8]=d,e[9]=a,e[10]=L,e[11]=l,e[12]=w,e[13]=W):(l=e[11],w=e[12],W=e[13]);const U=W;let $;e[14]===Symbol.for("react.memo_cache_sentinel")?($=o.jsx(Ne,{height:28,width:"100%"}),e[14]=$):$=e[14];let F;e[15]!==r?(F=r("comp:BAIVFolderSelect.SelectFolder"),e[15]=r,e[16]=F):F=e[16];let x,V;e[17]!==l||e[18]!==c?(x=m=>{let D=!1;const A=l.map(p=>{const C=m[p.vfolderId];return!p.name&&C?(D=!0,{...p,name:C}):p});D&&c(A)},V=m=>{const D=Le(m??[]);c(D.map(A=>{const p=l.find(C=>C.vfolderId===A);return p||{vfolderId:A,mountDestination:"",subpath:""}}))},e[17]=l,e[18]=c,e[19]=x,e[20]=V):(x=e[19],V=e[20]);let y;e[21]!==n||e[22]!==i||e[23]!==u||e[24]!==w||e[25]!==F||e[26]!==x||e[27]!==V?(y=o.jsx(N.Suspense,{fallback:$,children:o.jsx(Oe,{multiple:!0,label:F,isLabelHidden:!0,isDisabled:i,currentProjectId:n,filter:u,valuePropName:"row_id",value:w,onResolvedNamesChange:x,onChange:V})}),e[21]=n,e[22]=i,e[23]=u,e[24]=w,e[25]=F,e[26]=x,e[27]=V,e[28]=y):y=e[28];let j;e[29]!==i||e[30]!==l||e[31]!==c||e[32]!==U||e[33]!==r||e[34]!==v?(j=l.length>0&&o.jsxs(I,{direction:"column",align:"stretch",gap:"xxs",children:[o.jsxs(I,{gap:"xxs",align:"center",children:[o.jsx(g,{type:"secondary",style:{width:150,flexShrink:0},children:r("comp:BAIVFolderMountConfigInput.Name")}),o.jsxs(I,{gap:"xxs",align:"center",style:{flex:1},children:[o.jsx(g,{type:"secondary",children:r("comp:BAIVFolderMountConfigInput.PathAndAlias")}),o.jsx(q,{title:r("comp:BAIVFolderMountConfigInput.PathAndAliasTooltip")})]}),o.jsxs(I,{gap:"xxs",align:"center",style:{flex:1},children:[o.jsx(g,{type:"secondary",children:r("comp:BAIVFolderMountConfigInput.Subpath")}),o.jsx(q,{title:r("comp:BAIVFolderMountConfigInput.SubpathTooltip")})]}),o.jsx("span",{style:{width:v.size,flexShrink:0}})]}),l.map(m=>{const D=m.name||m.vfolderId,A=m.mountDestination??"",p=U[m.vfolderId],C=p.mountDestination,Q=p.aliasError==="invalidFormat",J=p.aliasError==="overlapping",Z=!!p.subpathError;return o.jsxs(I,{direction:"row",align:"start",gap:"xxs",children:[o.jsx(g,{ellipsis:{tooltip:!0},style:{width:150,flexShrink:0,lineHeight:`${v.controlHeight}px`},children:D}),o.jsx(R.Item,{validateStatus:Q||J?"error":void 0,help:Q?r("comp:BAIVFolderMountConfigInput.AliasInvalid"):J?r("comp:BAIVFolderMountConfigInput.AliasOverlapping"):void 0,extra:Q||J?void 0:o.jsx(g,{type:"secondary",ellipsis:!0,children:C}),style:{flex:1,marginBottom:0},children:o.jsx(G,{label:r("comp:BAIVFolderMountConfigInput.AliasPlaceholder"),isLabelHidden:!0,size:"sm",isDisabled:i,placeholder:r("comp:BAIVFolderMountConfigInput.AliasPlaceholder"),value:A??"",onChange:M=>c(l.map(b=>b.vfolderId===m.vfolderId?{...b,mountDestination:M}:b))})}),o.jsx(R.Item,{validateStatus:Z?"error":void 0,help:Z?r("comp:BAIVFolderMountConfigInput.SubpathInvalid"):void 0,style:{flex:1,marginBottom:0},children:o.jsx(G,{label:r("comp:BAIVFolderMountConfigInput.SubpathPlaceholder"),isLabelHidden:!0,size:"sm",isDisabled:i,placeholder:r("comp:BAIVFolderMountConfigInput.SubpathPlaceholder"),value:m.subpath??"",onChange:M=>c(l.map(b=>b.vfolderId===m.vfolderId?{...b,subpath:M}:b))})}),o.jsx(Ee,{content:r("comp:BAIVFolderMountConfigInput.RemoveFolder"),children:o.jsx(Me,{type:"text",size:"small",disabled:i,"aria-label":r("comp:BAIVFolderMountConfigInput.RemoveFolder"),icon:o.jsx(Re,{size:v.size,color:v.colorTextQuaternary}),style:{flexShrink:0,height:v.controlHeight},onClick:()=>c(l.filter(M=>M.vfolderId!==m.vfolderId))})})]},m.vfolderId)})]}),e[29]=i,e[30]=l,e[31]=c,e[32]=U,e[33]=r,e[34]=v,e[35]=j):j=e[35];let B;e[36]!==a||e[37]!==r?(B=a&&a.length>0&&o.jsxs(I,{gap:"xxs",align:"center",wrap:"wrap",children:[o.jsx(g,{type:"secondary",children:r("comp:BAIVFolderMountConfigInput.AutoMountedFolders")}),a.map(Ye)]}),e[36]=a,e[37]=r,e[38]=B):B=e[38];let H;return e[39]!==B||e[40]!==y||e[41]!==j?(H=o.jsxs(I,{direction:"column",align:"stretch",gap:"xs",children:[y,j,B]}),e[39]=B,e[40]=y,e[41]=j,e[42]=H):H=e[42],H};function Ke(t){return t.vfolderId}function Ye(t){return o.jsx(He,{variant:"neutral",label:t},t)}const eo=({children:t,mockResolvers:e={}})=>{const a=N.useMemo(()=>{const n=K.createMockEnvironment();for(let i=0;i<20;i++)n.mock.queueOperationResolver(u=>K.MockPayloadGenerator.generate(u,e));return n},[e]);return o.jsx(Ue.RelayEnvironmentProvider,{environment:a,children:o.jsx(N.Suspense,{fallback:"Loading...",children:t})})},s=[{name:"my-project-data",row_id:"abcd1234-5678-90ef-1234-567890abcdef"},{name:"shared-datasets",row_id:"wxyz9876-5432-10ab-cdef-001122334455"},{name:"model-checkpoints",row_id:"aaaa1111-2222-3333-4444-555566667777"},{name:"training-logs",row_id:"bbbb2222-3333-4444-5555-666677778888"}].map(t=>({node:{id:`vfolder-node-${t.row_id}`,name:t.name,row_id:t.row_id}})),oo={Query:()=>({vfolder_nodes:{count:s.length,edges:s}})},O=({initialValue:t=[],...e})=>{const[a,n]=N.useState(t);return o.jsxs("div",{style:{width:680},children:[o.jsx(X,{...e,value:a,onChange:n}),o.jsxs("div",{style:{marginTop:24},children:[o.jsx(g,{strong:!0,children:"Form value (onChange result)"}),o.jsx("pre",{style:{marginTop:8,padding:12,background:"rgba(0,0,0,0.04)",borderRadius:6,fontSize:12},children:JSON.stringify(a,null,2)})]})]})},kt={title:"Fragments/BAIVFolderMountConfigInput",component:X,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:"\n**BAIVFolderMountConfigInput** is a reusable, schema-agnostic controlled input\nfor configuring vfolder mounts.\n\n- Composes [BAIVFolderSelect](/?path=/docs/fragments-baivfolderselect--docs) to pick\n  vfolders (`row_id` mode, so the value is the vfolder UUID).\n- Each selected folder appears as a row with a **mount path (alias)** input and an\n  optional **subpath** input (which subfolder of the vfolder to mount as the source; empty = root).\n- `mountDestination` stores the **raw alias** the user typed — `''` mounts at the default\n  `/home/work/<name>`, a relative segment like `data` resolves to `/home/work/data`, and an\n  absolute path like `/data` is used as-is. Resolve it with the exported `inputToMountDestination`.\n- `autoMountedFolderNames` are folded into the overlap check (a user alias colliding with an\n  auto-mounted folder is flagged) and shown as read-only tags at the bottom.\n- Emits a single `VFolderMountConfigValue[]`. The inline per-row errors are advisory UX; to gate a\n  form, wrap the component in one named `Form.Item` and call `isVFolderMountConfigValid` from a\n  `rules` validator (see the **WithFormValidation** story).\n\nThe stories below use a mocked Relay environment so multiple sample folders can be selected.\n"}}},decorators:[t=>o.jsx(eo,{mockResolvers:oo,children:o.jsx(t,{})})],argTypes:{value:{description:"Controlled list of vfolder mount configurations",table:{type:{summary:"VFolderMountConfigValue[]"}}},onChange:{action:"changed",description:"Called with the updated mount configuration list"},currentProjectId:{control:{type:"text"},description:"Project ID to scope vfolder selection",table:{type:{summary:"string"}}},filter:{control:{type:"text"},description:"Additional filter string passed to BAIVFolderSelect",table:{type:{summary:"string"}}},disabled:{control:{type:"boolean"},description:"Disable selection and all row inputs",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},aliasBasePath:{control:{type:"text"},description:"Base path prepended to a relative alias input",table:{type:{summary:"string"},defaultValue:{summary:"/home/work/"}}},autoMountedFolderNames:{control:{type:"object"},description:"Names of auto-mounted folders: folded into the overlap check and shown as read-only tags",table:{type:{summary:"string[]"}}}}},S={parameters:{docs:{description:{story:"Empty initial state. Select folders from the dropdown to add rows, then edit each row's mount path and subpath. The live form value is shown below — note `mountDestination` holds the raw alias you typed."}}},render:t=>o.jsx(O,{...t})},k={parameters:{docs:{description:{story:"Prefilled with three folders demonstrating each alias mode: a relative segment (`data` → `/home/work/data`), an absolute path (`/mnt/shared`, used as-is), and an empty alias (falls back to `/home/work/<name>`). The first also mounts a subpath."}}},render:t=>o.jsx(O,{...t,initialValue:[{vfolderId:s[0].node.row_id,name:s[0].node.name,mountDestination:"data",subpath:"dataset/train"},{vfolderId:s[1].node.row_id,name:s[1].node.name,mountDestination:"/mnt/shared",subpath:""},{vfolderId:s[2].node.row_id,name:s[2].node.name,mountDestination:"",subpath:""}]})},P={parameters:{docs:{description:{story:"Two folders use the same alias (`shared`), so both resolve to `/home/work/shared` and are flagged with the overlap error. `isVFolderMountConfigValid` returns `false` for this value."}}},render:t=>o.jsx(O,{...t,initialValue:[{vfolderId:s[0].node.row_id,name:s[0].node.name,mountDestination:"shared",subpath:""},{vfolderId:s[1].node.row_id,name:s[1].node.name,mountDestination:"shared",subpath:""}]})},T={parameters:{docs:{description:{story:'Passing `autoMountedFolderNames={[".local", ".config"]}` renders them as read-only tags below the rows. The first folder aliases to `.config`, colliding with the auto-mounted `/home/work/.config`, so it shows the overlap error.'}}},render:t=>o.jsx(O,{...t,autoMountedFolderNames:[".local",".config"],initialValue:[{vfolderId:s[0].node.row_id,name:s[0].node.name,mountDestination:".config",subpath:""},{vfolderId:s[2].node.row_id,name:s[2].node.name,mountDestination:"checkpoints",subpath:""}]})},_={parameters:{docs:{description:{story:"The component is wrapped in one named `Form.Item`. The `rules` validator calls `isVFolderMountConfigValid`, so submitting with the two colliding `shared` aliases fails validation. Fix the aliases and submit again to pass."}}},render:t=>{const e=()=>{const[a]=R.useForm(),[n,i]=N.useState("");return o.jsxs(R,{form:a,layout:"vertical",style:{width:680},initialValues:{mounts:[{vfolderId:s[0].node.row_id,name:s[0].node.name,mountDestination:"shared",subpath:""},{vfolderId:s[1].node.row_id,name:s[1].node.name,mountDestination:"shared",subpath:""}]},children:[o.jsx(R.Item,{name:"mounts",label:"VFolder mounts",rules:[{validator:(u,h)=>Ge(h,{aliasBasePath:t.aliasBasePath,autoMountedFolderNames:t.autoMountedFolderNames})?Promise.resolve():Promise.reject(new Error("Some mounts have an invalid or overlapping path."))}],children:o.jsx(X,{...t})}),o.jsx(Me,{type:"primary",onClick:()=>{a.validateFields().then(()=>i("✅ Valid — form submitted.")).catch(()=>i("❌ Invalid — fix the flagged rows."))},children:"Validate & submit"}),n?o.jsx("div",{style:{marginTop:16},children:o.jsx(g,{children:n})}):null]})};return o.jsx(e,{})}},E={parameters:{docs:{description:{story:"Disabled state — selection and all row inputs are read-only."}}},render:t=>o.jsx(O,{...t,disabled:!0,initialValue:[{vfolderId:s[1].node.row_id,name:s[1].node.name,mountDestination:"shared",subpath:""}]})};var ee,oe,te,ae,re;S.parameters={...S.parameters,docs:{...(ee=S.parameters)==null?void 0:ee.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "Empty initial state. Select folders from the dropdown to add rows, then edit each row's mount path and subpath. The live form value is shown below — note \`mountDestination\` holds the raw alias you typed."
      }
    }
  },
  render: args => <ControlledDemo {...args} />
}`,...(te=(oe=S.parameters)==null?void 0:oe.docs)==null?void 0:te.source},description:{story:`Empty initial state. Select folders from the dropdown to add rows, then edit
each row's mount path and subpath. The live form value is shown below.`,...(re=(ae=S.parameters)==null?void 0:ae.docs)==null?void 0:re.description}}};var ne,se,ie,le,de;k.parameters={...k.parameters,docs:{...(ne=k.parameters)==null?void 0:ne.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Prefilled with three folders demonstrating each alias mode: a relative segment (\`data\` → \`/home/work/data\`), an absolute path (\`/mnt/shared\`, used as-is), and an empty alias (falls back to \`/home/work/<name>\`). The first also mounts a subpath.'
      }
    }
  },
  render: args => <ControlledDemo {...args} initialValue={[{
    vfolderId: sampleVFolders[0].node.row_id,
    name: sampleVFolders[0].node.name,
    mountDestination: 'data',
    subpath: 'dataset/train'
  }, {
    vfolderId: sampleVFolders[1].node.row_id,
    name: sampleVFolders[1].node.name,
    mountDestination: '/mnt/shared',
    subpath: ''
  }, {
    vfolderId: sampleVFolders[2].node.row_id,
    name: sampleVFolders[2].node.name,
    mountDestination: '',
    subpath: ''
  }]} />
}`,...(ie=(se=k.parameters)==null?void 0:se.docs)==null?void 0:ie.source},description:{story:`Prefilled showing all three alias modes: a relative alias, an absolute path,
and an empty alias that falls back to the default mount path.`,...(de=(le=k.parameters)==null?void 0:le.docs)==null?void 0:de.description}}};var me,pe,ue,ce,he;P.parameters={...P.parameters,docs:{...(me=P.parameters)==null?void 0:me.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Two folders use the same alias (\`shared\`), so both resolve to \`/home/work/shared\` and are flagged with the overlap error. \`isVFolderMountConfigValid\` returns \`false\` for this value.'
      }
    }
  },
  render: args => <ControlledDemo {...args} initialValue={[{
    vfolderId: sampleVFolders[0].node.row_id,
    name: sampleVFolders[0].node.name,
    mountDestination: 'shared',
    subpath: ''
  }, {
    vfolderId: sampleVFolders[1].node.row_id,
    name: sampleVFolders[1].node.name,
    mountDestination: 'shared',
    subpath: ''
  }]} />
}`,...(ue=(pe=P.parameters)==null?void 0:pe.docs)==null?void 0:ue.source},description:{story:`Error state — two folders resolve to the same mount path, so both rows show
the overlap error.`,...(he=(ce=P.parameters)==null?void 0:ce.docs)==null?void 0:he.description}}};var fe,ge,ve,be,Ie;T.parameters={...T.parameters,docs:{...(fe=T.parameters)==null?void 0:fe.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Passing \`autoMountedFolderNames={[".local", ".config"]}\` renders them as read-only tags below the rows. The first folder aliases to \`.config\`, colliding with the auto-mounted \`/home/work/.config\`, so it shows the overlap error.'
      }
    }
  },
  render: args => <ControlledDemo {...args} autoMountedFolderNames={['.local', '.config']} initialValue={[{
    vfolderId: sampleVFolders[0].node.row_id,
    name: sampleVFolders[0].node.name,
    mountDestination: '.config',
    subpath: ''
  }, {
    vfolderId: sampleVFolders[2].node.row_id,
    name: sampleVFolders[2].node.name,
    mountDestination: 'checkpoints',
    subpath: ''
  }]} />
}`,...(ve=(ge=T.parameters)==null?void 0:ge.docs)==null?void 0:ve.source},description:{story:`Auto-mounted folders are listed as read-only tags at the bottom, and a user
alias that collides with one of them is flagged as an overlap.`,...(Ie=(be=T.parameters)==null?void 0:be.docs)==null?void 0:Ie.description}}};var we,Fe,xe,Ve,ye;_.parameters={..._.parameters,docs:{...(we=_.parameters)==null?void 0:we.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'The component is wrapped in one named \`Form.Item\`. The \`rules\` validator calls \`isVFolderMountConfigValid\`, so submitting with the two colliding \`shared\` aliases fails validation. Fix the aliases and submit again to pass.'
      }
    }
  },
  render: args => {
    const FormValidationDemo = () => {
      const [form] = Form.useForm();
      const [result, setResult] = useState<string>('');
      return <Form form={form} layout="vertical" style={{
        width: 680
      }} initialValues={{
        mounts: [{
          vfolderId: sampleVFolders[0].node.row_id,
          name: sampleVFolders[0].node.name,
          mountDestination: 'shared',
          subpath: ''
        }, {
          vfolderId: sampleVFolders[1].node.row_id,
          name: sampleVFolders[1].node.name,
          mountDestination: 'shared',
          subpath: ''
        }]
      }}>
          <Form.Item name="mounts" label="VFolder mounts" rules={[{
          validator: (_rule, value) => isVFolderMountConfigValid(value, {
            aliasBasePath: args.aliasBasePath,
            autoMountedFolderNames: args.autoMountedFolderNames
          }) ? Promise.resolve() : Promise.reject(new Error('Some mounts have an invalid or overlapping path.'))
        }]}>
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
}`,...(xe=(Fe=_.parameters)==null?void 0:Fe.docs)==null?void 0:xe.source},description:{story:"Demonstrates the recommended form-gate pattern: a single named `Form.Item`\nwrapping the component, with `isVFolderMountConfigValid` in a `rules`\nvalidator so `form.validateFields()` rejects on invalid input.",...(ye=(Ve=_.parameters)==null?void 0:Ve.docs)==null?void 0:ye.description}}};var je,Be,De,Ae,Ce;E.parameters={...E.parameters,docs:{...(je=E.parameters)==null?void 0:je.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Disabled state — selection and all row inputs are read-only.'
      }
    }
  },
  render: args => <ControlledDemo {...args} disabled initialValue={[{
    vfolderId: sampleVFolders[1].node.row_id,
    name: sampleVFolders[1].node.name,
    mountDestination: 'shared',
    subpath: ''
  }]} />
}`,...(De=(Be=E.parameters)==null?void 0:Be.docs)==null?void 0:De.source},description:{story:"Disabled state — selection and inputs are read-only.",...(Ce=(Ae=E.parameters)==null?void 0:Ae.docs)==null?void 0:Ce.description}}};const Pt=["Interactive","Prefilled","OverlappingPaths","WithAutoMountedFolders","WithFormValidation","Disabled"];export{E as Disabled,S as Interactive,P as OverlappingPaths,k as Prefilled,T as WithAutoMountedFolders,_ as WithFormValidation,Pt as __namedExportsOrder,kt as default};
