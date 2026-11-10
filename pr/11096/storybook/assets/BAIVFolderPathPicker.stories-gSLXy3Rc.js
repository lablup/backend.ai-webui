import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-DlPsW1c0.js";import{n,t as r}from"./castArray-AZdtGfv6.js";import{n as i,t as a}from"./compact-C9OPbfhP.js";import{m as o,r as ee,t as s}from"./hooks-CWfVxhQL.js";import{a as c,c as l,d as u,f as d,l as f,n as p,o as m,p as h,t as g,u as te}from"./MockVFolderFileProviders-hnPKsQWe.js";import{n as _,t as ne}from"./find-DWiBvCZH.js";import{n as re,t as ie}from"./map-BLzs52H1.js";import{n as ae,t as v}from"./isEmpty-CptDxjc2.js";import{n as oe,t as se}from"./some-h0q6V2XB.js";import{t as y}from"./jsx-runtime-MKhVqBIO.js";import{n as ce,t as le}from"./useBAIi18n-HeDRJIs5.js";import{t as b}from"./compiler-runtime-DU4U6aph.js";import{n as x,t as ue}from"./Form-CzLFkQoV.js";import{h as de,m as S}from"./iframe-LpNykWPe.js";import{n as fe,t as pe}from"./BAIFlex-DnaoYTJ1.js";import{t as C}from"./react-relay-sHama7hJ.js";import{c as w,h as me,m as he}from"./helper-p-d7z67I.js";import{i as ge,n as _e,r as T,t as E}from"./usePaginatedQuery-XIXjqat_.js";import{n as ve,t as D}from"./BAIButton-C4u8iB23.js";import{n as O,t as ye}from"./BAIComplexSelect-BsU4vso3.js";import{n as k,t as A}from"./BAIUnmountAfterClose-BFd4mgc4.js";var be;function j(){return(j=e((()=>{be=(function(){var e={defaultValue:null,kind:`LocalArgument`,name:`filter`},t={defaultValue:null,kind:`LocalArgument`,name:`limit`},n={defaultValue:null,kind:`LocalArgument`,name:`scope`},r={defaultValue:null,kind:`LocalArgument`,name:`skip`},i=[{kind:`Variable`,name:`filter`,variableName:`filter`},{kind:`Variable`,name:`limit`,variableName:`limit`},{kind:`Variable`,name:`scope`,variableName:`scope`}],a={alias:null,args:null,kind:`ScalarField`,name:`entityId`,storageKey:null},o={alias:null,args:null,concreteType:`VFolderMetadataInfo`,kind:`LinkedField`,name:`metadata`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`name`,storageKey:null}],storageKey:null};return{fragment:{argumentDefinitions:[e,t,n,r],kind:`Fragment`,metadata:null,name:`BAIVFolderSelectValueQuery`,selections:[{condition:`skip`,kind:`Condition`,passingValue:!1,selections:[{alias:null,args:i,concreteType:`VFolderConnection`,kind:`LinkedField`,name:`scopedVFoldersV2`,plural:!1,selections:[{alias:null,args:null,concreteType:`VFolderEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`VFolder`,kind:`LinkedField`,name:`node`,plural:!1,selections:[a,o],storageKey:null}],storageKey:null}],storageKey:null}]}],type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[n,e,t,r],kind:`Operation`,name:`BAIVFolderSelectValueQuery`,selections:[{condition:`skip`,kind:`Condition`,passingValue:!1,selections:[{alias:null,args:i,concreteType:`VFolderConnection`,kind:`LinkedField`,name:`scopedVFoldersV2`,plural:!1,selections:[{alias:null,args:null,concreteType:`VFolderEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`VFolder`,kind:`LinkedField`,name:`node`,plural:!1,selections:[a,o,{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}]}]},params:{cacheID:`b4a9c546a6716bf73971af526f839cc1`,id:null,metadata:{},name:`BAIVFolderSelectValueQuery`,operationKind:`query`,text:`query BAIVFolderSelectValueQuery(
  $scope: VFolderScope!
  $filter: VFolderFilter
  $limit: Int!
  $skip: Boolean!
) {
  scopedVFoldersV2(scope: $scope, filter: $filter, limit: $limit) @skip(if: $skip) {
    edges {
      node {
        entityId
        metadata {
          name
        }
        id
      }
    }
  }
}
`}}})(),be.hash=`6bd89e3f80121249cadec8a0f1149957`})))()}var xe;function M(){return(M=e((()=>{xe=(function(){var e={defaultValue:null,kind:`LocalArgument`,name:`filter`},t={defaultValue:null,kind:`LocalArgument`,name:`limit`},n={defaultValue:null,kind:`LocalArgument`,name:`offset`},r={defaultValue:null,kind:`LocalArgument`,name:`scope`},i=[{kind:`Variable`,name:`filter`,variableName:`filter`},{kind:`Variable`,name:`limit`,variableName:`limit`},{kind:`Variable`,name:`offset`,variableName:`offset`},{kind:`Literal`,name:`orderBy`,value:[{direction:`DESC`,field:`CREATED_AT`}]},{kind:`Variable`,name:`scope`,variableName:`scope`}],a={alias:null,args:null,kind:`ScalarField`,name:`count`,storageKey:null},o={alias:null,args:null,kind:`ScalarField`,name:`entityId`,storageKey:null},ee={alias:null,args:null,concreteType:`VFolderMetadataInfo`,kind:`LinkedField`,name:`metadata`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`name`,storageKey:null}],storageKey:null};return{fragment:{argumentDefinitions:[e,t,n,r],kind:`Fragment`,metadata:null,name:`BAIVFolderSelectPaginatedQuery`,selections:[{alias:null,args:i,concreteType:`VFolderConnection`,kind:`LinkedField`,name:`scopedVFoldersV2`,plural:!1,selections:[a,{alias:null,args:null,concreteType:`VFolderEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`VFolder`,kind:`LinkedField`,name:`node`,plural:!1,selections:[o,ee],storageKey:null}],storageKey:null}],storageKey:null}],type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[r,e,t,n],kind:`Operation`,name:`BAIVFolderSelectPaginatedQuery`,selections:[{alias:null,args:i,concreteType:`VFolderConnection`,kind:`LinkedField`,name:`scopedVFoldersV2`,plural:!1,selections:[a,{alias:null,args:null,concreteType:`VFolderEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`VFolder`,kind:`LinkedField`,name:`node`,plural:!1,selections:[o,ee,{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}]},params:{cacheID:`00892b922f6cdd51923deba15d1fc80a`,id:null,metadata:{},name:`BAIVFolderSelectPaginatedQuery`,operationKind:`query`,text:`query BAIVFolderSelectPaginatedQuery(
  $scope: VFolderScope!
  $filter: VFolderFilter
  $limit: Int!
  $offset: Int!
) {
  scopedVFoldersV2(scope: $scope, filter: $filter, limit: $limit, offset: $offset, orderBy: [{field: CREATED_AT, direction: DESC}]) {
    count
    edges {
      node {
        entityId
        metadata {
          name
        }
        id
      }
    }
  }
}
`}}})(),xe.hash=`2a39a339354da148131a9b6bab420a32`})))()}function Se(e){return!ae(e)}function Ce(e){var t;return((t=e.scopedVFoldersV2)==null?void 0:t.count)??void 0}function we(e){return e.node}function Te(e){var t;return(t=e.scopedVFoldersV2)==null?void 0:t.edges.map(we)}function Ee(e){return e==null?void 0:e.entityId}function De(e){return e.value}var Oe,N,ke,Ae,je,P;function F(){return(F=e((()=>{j(),M(),Oe=b(),w(),T(),s(),le(),E(),O(),i(),n(),ie(),se(),_(),v(),N=t(),ke=C(),Ae=y(),je={status:{notIn:[`DELETE_PENDING`,`DELETE_ONGOING`,`DELETE_ERROR`,`DELETE_COMPLETE`]}},P=e=>{"use memo";var t;let n=(0,Oe.c)(58),i,s,c,l,u,d,f,p,m;n[0]===e?(i=n[1],s=n[2],c=n[3],l=n[4],u=n[5],d=n[6],f=n[7],p=n[8],m=n[9]):({scope:d,filter:c,excludeDeleted:i,valuePropName:p,fallbackLabels:s,multiple:m,isLoading:l,ref:u,...f}=e,n[0]=e,n[1]=i,n[2]=s,n[3]=c,n[4]=l,n[5]=u,n[6]=d,n[7]=f,n[8]=p,n[9]=m);let h=p===void 0?`id`:p,g=m!==void 0&&m,{t:te}=ce(),_;n[10]===Symbol.for(`react.memo_cache_sentinel`)?(_={valuePropName:`value`,trigger:`onChange`},n[10]=_):_=n[10];let[ie,ae]=o(f,_),v;n[11]===Symbol.for(`react.memo_cache_sentinel`)?(v={valuePropName:`open`,trigger:`onOpenChange`,defaultValuePropName:`defaultOpen`},n[11]=v):v=n[11];let[se,y]=o(f,v),le=(0,N.useDeferredValue)(se),[b,x]=(0,N.useState)(``),ue=ge(b),[de,S]=(0,N.useTransition)(),fe=a([i?je:null,c]),[pe,C]=ee(),w=(0,N.useDeferredValue)(pe),T=(0,N.useDeferredValue)(ie),E;n[12]===T?E=n[13]:(E=T??[],n[12]=T,n[13]=E);let ve=a(r(E)),D;n[14]===h?D=n[15]:(D=e=>h===`id`?he(`VirtualFolderNode`,e):e,n[14]=h,n[15]=D);let O=D,k;n[16]===h?k=n[17]:(k=e=>h===`id`?me(e):e,n[16]=h,n[17]=k);let A=k,j=a(re(ve,A)),M;n[18]===d?M=n[19]:(M=oe(d,Se),n[18]=d,n[19]=M);let we=M,P=j.length&&we?`store-or-network`:`store-only`,F;n[20]!==w||n[21]!==P?(F={fetchPolicy:P,fetchKey:w},n[20]=w,n[21]=P,n[22]=F):F=n[22];let{scopedVFoldersV2:I}=(0,ke.useLazyLoadQuery)(be,{scope:d,filter:{AND:[...fe,{entityId:{in:j}}]},limit:Math.max(j.length,1),skip:j.length===0||!we},F),L;n[23]===Symbol.for(`react.memo_cache_sentinel`)?(L={limit:10},n[23]=L):L=n[23];let R=le&&we?`network-only`:`store-only`,z;n[24]!==w||n[25]!==R?(z={fetchPolicy:R,fetchKey:w},n[24]=w,n[25]=R,n[26]=z):z=n[26];let B;n[27]===Symbol.for(`react.memo_cache_sentinel`)?(B={getTotal:Ce,getItem:Te,getId:Ee},n[27]=B):B=n[27];let{paginationData:V,result:H,loadNext:U,isLoadingNext:W}=_e(xe,L,{scope:d,filter:{AND:a([...fe,ue?{name:{iContains:ue}}:null])}},z,B),G,K;n[28]===C?(G=n[29],K=n[30]):(G=()=>({refetch:()=>{S(()=>{C()})}}),K=[C,S],n[28]=C,n[29]=G,n[30]=K),(0,N.useImperativeHandle)(u,G,K);let q;if(n[31]!==O||n[32]!==V){let e;n[34]===O?e=n[35]:(e=e=>({value:O(e.entityId),label:e.metadata.name,description:e.entityId}),n[34]=O,n[35]=e),q=re(V,e),n[31]=O,n[32]=V,n[33]=q}else q=n[33];let J=q,Y;bb0:{let e;n[36]!==A||n[37]!==s||n[38]!==(I==null?void 0:I.edges)?(e=e=>{let t=ne(I==null?void 0:I.edges,t=>t.node.entityId===A(e));return{label:(t==null?void 0:t.node.metadata.name)??(s==null?void 0:s[e])??A(e)??e,value:e}},n[36]=A,n[37]=s,n[38]=I==null?void 0:I.edges,n[39]=e):e=n[39];let t=re(ve,e);if(g){Y=t;break bb0}Y=t[0]??null}let X=Y,Z;n[40]===te?Z=n[41]:(Z=te(`comp:BAIVFolderSelect.SelectFolder`),n[40]=te,n[41]=Z);let Q=l||!!se&&!le||ie!==T||b!==ue||de,Me=((t=H.scopedVFoldersV2)==null?void 0:t.count)??void 0,$;n[42]!==g||n[43]!==ae?($=e=>{let t=a(r(e??[])),n=re(t,De);ae(g?n:n[0],g?t:t[0])},n[42]=g,n[43]=ae,n[44]=$):$=n[44];let Ne;return n[45]!==W||n[46]!==X||n[47]!==U||n[48]!==g||n[49]!==J||n[50]!==b||n[51]!==f||n[52]!==y||n[53]!==Z||n[54]!==Q||n[55]!==Me||n[56]!==$?(Ne=(0,Ae.jsx)(ye,{placeholder:Z,...f,multiple:g,isLoading:Q,isLoadingNext:W,total:Me,options:J,value:X,onChange:$,searchValue:b,onSearch:x,onOpenChange:y,endReached:U}),n[45]=W,n[46]=X,n[47]=U,n[48]=g,n[49]=J,n[50]=b,n[51]=f,n[52]=y,n[53]=Z,n[54]=Q,n[55]=Me,n[56]=$,n[57]=Ne):Ne=n[57],Ne}})))()}var I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q,Me;function $(){return($=e((()=>{ue(),p(),c(),ve(),fe(),de(),k(),F(),h(),te(),I=t(),L=C(),R=y(),G=`00000000-0000-0000-0000-000000000001`,K=[{name:`my-workspace`,row_id:`11111111-1111-1111-1111-111111111111`},{name:`team-shared-data`,row_id:`22222222-2222-2222-2222-222222222222`,permissions:[`READ`]}],q=()=>({[K[0].row_id]:{".":[l(`models`,`DIRECTORY`,`2026-07-21T14:02:00`),l(`datasets`,`DIRECTORY`,`2026-07-18T09:45:00`),l(`outputs`,`DIRECTORY`,`2026-07-28T22:10:00`),l(`README.md`,`FILE`,`2026-07-01T11:20:00`),l(`train.py`,`FILE`,`2026-07-25T16:33:00`)],models:[l(`checkpoints`,`DIRECTORY`,`2026-07-27T03:12:00`),l(`llama-3-ft`,`DIRECTORY`,`2026-07-26T19:40:00`),l(`model_definition.yaml`,`FILE`,`2026-07-22T10:05:00`)],"models/checkpoints":[l(`epoch-001`,`DIRECTORY`,`2026-07-27T03:12:00`),l(`epoch-002`,`DIRECTORY`,`2026-07-27T09:47:00`),l(`latest.pt`,`FILE`,`2026-07-27T09:47:00`)],"models/checkpoints/epoch-001":[],"models/checkpoints/epoch-002":[],"models/llama-3-ft":[l(`adapter_config.json`,`FILE`,`2026-07-26T19:40:00`)],datasets:[l(`raw`,`DIRECTORY`,`2026-07-18T09:45:00`),l(`cleaned.parquet`,`FILE`,`2026-07-19T08:00:00`)],"datasets/raw":[],outputs:[]},[K[1].row_id]:{".":[l(`shared-corpus`,`DIRECTORY`,`2026-07-10T08:00:00`),l(`LICENSE`,`FILE`,`2026-07-02T12:00:00`)],"shared-corpus":[]}}),J={title:`Input/BAIVFolderPathPicker`,component:f,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:"\n**BAIVFolderPathPicker** is a sub path picker for a given vfolder: a select-like trigger that opens a directory-only picker modal. The vfolder itself is chosen elsewhere (e.g. a `BAIVFolderSelect`) and passed in as `vfolderUuid`. The modal's vfolder query is preloaded from the open gesture (`useQueryLoader` + transition), so the trigger shows its own `loading` state while the data is in flight.\n\nThe value is the **sub path inside the vfolder** — `''` for the vfolder root, `\"sub/path\"` below it, `undefined` while nothing is picked — so it plugs directly into a Form.Item; `value`/`onChange` follow the controllable-state convention, so the component works both controlled and uncontrolled. Files are visible but disabled inside the picker; only directories can be entered and chosen. Folder CRUD (create / rename / delete) stays available via `BAIFileExplorer`'s `directoryPicker` mode. When the vfolder changes, reset the value — a sub path only makes sense within the vfolder it was picked from.\n\n## BAI-Specific Props\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `vfolderUuid` | `string` | - | UUID of the vfolder to browse; pair with `disabled={!vfolderUuid}` until one is selected |\n| `value` | `string` | - | Selected sub path (`''` = vfolder root) |\n| `defaultValue` | `string` | - | Initial value for uncontrolled usage |\n| `onChange` | `(selectedSubPath?: string) => void` | - | Fired when a location is confirmed in the modal; the parameter is optional so a clear action can emit `undefined` |\n| `label` | `string` | \"Select a path\" | Accessible name of the trigger (visually hidden; the surrounding Form.Item renders the visible label) |\n\n> The stories run against a mock Relay environment and a mock `BAIClient`, so vfolder search, browsing, mkdir, rename and delete all work without a backend. The second folder (`team-shared-data`) is read-only — pick it in the Form story to see permission gating disable folder CRUD inside the modal.\n        "}}}},Y={name:`Basic Usage (uncontrolled)`,render:()=>{let[e,t]=(0,I.useState)();return(0,R.jsx)(g,{vfolders:K,trees:q,children:(0,R.jsxs)(pe,{direction:`column`,align:`stretch`,gap:`md`,style:{width:560},children:[(0,R.jsx)(f,{vfolderUuid:K[0].row_id,onChange:t}),(0,R.jsxs)(S,{type:`secondary`,children:[`onChange:`,` `,(0,R.jsx)(S,{code:!0,children:e===void 0?`undefined`:JSON.stringify(e)})]})]})})}},X={name:`Within Form (with external BAIVFolderSelect)`,parameters:{docs:{description:{story:'The intended composition: a separate `BAIVFolderSelect` (with `valuePropName="entityId"` so the field holds the UUID) feeds `vfolderUuid`, and the picker plugs into its own Form.Item with `disabled={!vfolderUuid}` until a folder is chosen. Changing the vfolder resets the path field, and the required rule uses a custom validator because `""` (the vfolder root) is a valid pick.'}}},render:()=>{let[e]=x.useForm(),t=x.useWatch(`vfolderUuid`,e),[n,r]=(0,I.useState)();return(0,R.jsx)(g,{vfolders:K,folders:K.map(({row_id:e,name:t})=>m({id:e,name:t})),trees:q,children:(0,R.jsxs)(x,{form:e,layout:`vertical`,style:{width:560},onFinish:e=>{r(JSON.stringify(e))},children:[(0,R.jsx)(x.Item,{name:`vfolderUuid`,label:`Folder`,rules:[{required:!0}],children:(0,R.jsx)(P,{label:`Folder`,isLabelHidden:!0,valuePropName:`entityId`,scope:{user:[{value:G}]},onChange:()=>{e.setFieldValue(`destination`,void 0)}})}),(0,R.jsx)(x.Item,{name:`destination`,label:`Destination`,required:!0,rules:[{validator:(e,t)=>t===void 0?Promise.reject(Error(`Please select a path`)):Promise.resolve()}],children:(0,R.jsx)(f,{vfolderUuid:t,disabled:!t})}),(0,R.jsxs)(pe,{direction:`column`,align:`start`,gap:`sm`,children:[(0,R.jsx)(D,{type:`primary`,onClick:()=>e.submit(),children:`Submit`}),n&&(0,R.jsxs)(S,{type:`secondary`,children:[`submitted: `,(0,R.jsx)(S,{code:!0,children:n})]})]})]})})}},Z=()=>{let[e,t]=(0,I.useState)(!1),[n,r]=(0,I.useTransition)(),[i,a]=(0,I.useState)(),[o,ee]=(0,L.useQueryLoader)(d);return(0,R.jsxs)(pe,{direction:`column`,gap:`md`,align:`start`,children:[(0,R.jsx)(D,{type:`primary`,loading:n,onClick:()=>{r(()=>{ee({vfolderId:K[0].row_id},{fetchPolicy:`store-and-network`}),t(!0)})},children:`Open directory picker`}),(0,R.jsxs)(S,{type:`secondary`,children:[`Last selection:`,` `,(0,R.jsx)(S,{code:!0,children:i===void 0?`(none)`:JSON.stringify(i)})]}),o!=null&&(0,R.jsx)(A,{children:(0,R.jsx)(u,{open:e,vfolderUuid:K[0].row_id,queryRef:o,onRequestClose:e=>{e!==void 0&&a(e),t(!1)}})})]})},Q={name:`Directory Picker Modal`,parameters:{docs:{description:{story:"`BAIDirectoryPickerModal` can also be driven directly — preload `BAIDirectoryPickerQuery` with `useQueryLoader` in the opening event (wrapped in a transition, since the modal suspends until the query resolves), pass the `queryRef`, and receive the chosen sub path via `onRequestClose` (`undefined` when cancelled)."}}},render:()=>(0,R.jsx)(g,{vfolders:K,trees:q,children:(0,R.jsx)(Z,{})})},Y.parameters={...Y.parameters,docs:{...(z=Y.parameters)==null?void 0:z.docs,source:{originalSource:`{
  name: 'Basic Usage (uncontrolled)',
  render: () => {
    const [lastChange, setLastChange] = useState<string | undefined>();
    return <MockVFolderFileProviders vfolders={MOCK_VFOLDERS} trees={createInitialTrees}>
        <BAIFlex direction="column" align="stretch" gap="md" style={{
        width: 560
      }}>
          <BAIVFolderPathPicker vfolderUuid={MOCK_VFOLDERS[0].row_id} onChange={setLastChange} />
          <BAIText type="secondary">
            onChange:{' '}
            <BAIText code>
              {lastChange === undefined ? 'undefined' : JSON.stringify(lastChange)}
            </BAIText>
          </BAIText>
        </BAIFlex>
      </MockVFolderFileProviders>;
  }
}`,...(B=Y.parameters)==null||(B=B.docs)==null?void 0:B.source}}},X.parameters={...X.parameters,docs:{...(V=X.parameters)==null?void 0:V.docs,source:{originalSource:`{
  name: 'Within Form (with external BAIVFolderSelect)',
  parameters: {
    docs: {
      description: {
        story: 'The intended composition: a separate \`BAIVFolderSelect\` (with \`valuePropName="entityId"\` so the field holds the UUID) feeds \`vfolderUuid\`, and the picker plugs into its own Form.Item with \`disabled={!vfolderUuid}\` until a folder is chosen. Changing the vfolder resets the path field, and the required rule uses a custom validator because \`""\` (the vfolder root) is a valid pick.'
      }
    }
  },
  render: () => {
    const [form] = Form.useForm<{
      vfolderUuid?: string;
      destination?: string;
    }>();
    const vfolderUuid = Form.useWatch('vfolderUuid', form);
    const [submitted, setSubmitted] = useState<string>();
    return <MockVFolderFileProviders vfolders={MOCK_VFOLDERS} folders={MOCK_VFOLDERS.map(({
      row_id,
      name
    }) => mockMountFolder({
      id: row_id,
      name
    }))} trees={createInitialTrees}>
        <Form form={form} layout="vertical" style={{
        width: 560
      }} onFinish={values => {
        setSubmitted(JSON.stringify(values));
      }}>
          <Form.Item name="vfolderUuid" label="Folder" rules={[{
          required: true
        }]}>
            <BAIVFolderSelect label="Folder" isLabelHidden valuePropName="entityId" scope={{
            user: [{
              value: MOCK_USER_ID
            }]
          }} onChange={() => {
            // A sub path belongs to the vfolder it was picked from.
            form.setFieldValue('destination', undefined);
          }} />
          </Form.Item>
          <Form.Item name="destination" label="Destination" required rules={[{
          // \`''\` (vfolder root) is a valid pick, so \`required: true\`
          // (which rejects empty strings) cannot be used here.
          validator: (_rule, value) => value === undefined ? Promise.reject(new Error('Please select a path')) : Promise.resolve()
        }]}>
            <BAIVFolderPathPicker vfolderUuid={vfolderUuid} disabled={!vfolderUuid} />
          </Form.Item>
          <BAIFlex direction="column" align="start" gap="sm">
            {/* \`BAIButton\` deliberately does not expose antd's \`htmlType\`
                (PILOT-DECISION in \`BAIButton.tsx\`), and Astryx \`Button\`
                defaults its native \`type\` to \`'button'\` — so a bare click would
                never submit. This form already holds an instance, so driving it
                directly is the engine-native equivalent and keeps the \`rules\`
                validation in the loop. */}
            <BAIButton type="primary" onClick={() => form.submit()}>
              Submit
            </BAIButton>
            {submitted && <BAIText type="secondary">
                submitted: <BAIText code>{submitted}</BAIText>
              </BAIText>}
          </BAIFlex>
        </Form>
      </MockVFolderFileProviders>;
  }
}`,...(H=X.parameters)==null||(H=H.docs)==null?void 0:H.source}}},Q.parameters={...Q.parameters,docs:{...(U=Q.parameters)==null?void 0:U.docs,source:{originalSource:`{
  name: 'Directory Picker Modal',
  parameters: {
    docs: {
      description: {
        story: '\`BAIDirectoryPickerModal\` can also be driven directly — preload \`BAIDirectoryPickerQuery\` with \`useQueryLoader\` in the opening event (wrapped in a transition, since the modal suspends until the query resolves), pass the \`queryRef\`, and receive the chosen sub path via \`onRequestClose\` (\`undefined\` when cancelled).'
      }
    }
  },
  render: () => <MockVFolderFileProviders vfolders={MOCK_VFOLDERS} trees={createInitialTrees}>
      <DirectoryPickerModalDemo />
    </MockVFolderFileProviders>
}`,...(W=Q.parameters)==null||(W=W.docs)==null?void 0:W.source}}},Me=[`Default`,`WithinForm`,`PickerModalOnly`]})))()}$();export{Y as Default,Q as PickerModalOnly,X as WithinForm,Me as __namedExportsOrder,J as default};