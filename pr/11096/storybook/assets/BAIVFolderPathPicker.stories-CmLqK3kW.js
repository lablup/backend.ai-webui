import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-DlPsW1c0.js";import{n,t as r}from"./castArray-AZdtGfv6.js";import{n as i,t as a}from"./compact-C9OPbfhP.js";import{m as o,r as ee,t as s}from"./hooks-CWfVxhQL.js";import{a as c,c as l,d as u,f as d,l as f,n as p,o as m,p as h,t as g,u as te}from"./MockVFolderFileProviders-dwTZJr1Q.js";import{n as _,t as ne}from"./find-DWiBvCZH.js";import{n as re,t as ie}from"./map-BLzs52H1.js";import{t as v}from"./jsx-runtime-MKhVqBIO.js";import{n as ae,t as y}from"./useBAIi18n-HeDRJIs5.js";import{t as oe}from"./compiler-runtime-DU4U6aph.js";import{n as b,t as se}from"./Form-CbH8rTux.js";import{h as x,m as S}from"./iframe-Ch73BeHZ.js";import{n as ce,t as le}from"./BAIFlex-DnaoYTJ1.js";import{t as ue}from"./react-relay-sHama7hJ.js";import{c as de,h as fe,m as pe}from"./helper-p-d7z67I.js";import{i as me,n as he,r as ge,t as C}from"./usePaginatedQuery-D9imlr06.js";import{n as w,t as T}from"./BAIButton-DhPJGWFQ.js";import{n as E,t as _e}from"./BAIComplexSelect-B6mCcA4n.js";import{n as D,t as O}from"./BAIUnmountAfterClose-BFd4mgc4.js";var ve;function k(){return(k=e((()=>{ve=(function(){var e={defaultValue:null,kind:`LocalArgument`,name:`filter`},t={defaultValue:null,kind:`LocalArgument`,name:`limit`},n={defaultValue:null,kind:`LocalArgument`,name:`scope`},r={defaultValue:null,kind:`LocalArgument`,name:`skip`},i=[{kind:`Variable`,name:`filter`,variableName:`filter`},{kind:`Variable`,name:`limit`,variableName:`limit`},{kind:`Variable`,name:`scope`,variableName:`scope`}],a={alias:null,args:null,kind:`ScalarField`,name:`entityId`,storageKey:null},o={alias:null,args:null,concreteType:`VFolderMetadataInfo`,kind:`LinkedField`,name:`metadata`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`name`,storageKey:null}],storageKey:null};return{fragment:{argumentDefinitions:[e,t,n,r],kind:`Fragment`,metadata:null,name:`BAIVFolderSelectValueQuery`,selections:[{condition:`skip`,kind:`Condition`,passingValue:!1,selections:[{alias:null,args:i,concreteType:`VFolderConnection`,kind:`LinkedField`,name:`scopedVFoldersV2`,plural:!1,selections:[{alias:null,args:null,concreteType:`VFolderEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`VFolder`,kind:`LinkedField`,name:`node`,plural:!1,selections:[a,o],storageKey:null}],storageKey:null}],storageKey:null}]}],type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[n,e,t,r],kind:`Operation`,name:`BAIVFolderSelectValueQuery`,selections:[{condition:`skip`,kind:`Condition`,passingValue:!1,selections:[{alias:null,args:i,concreteType:`VFolderConnection`,kind:`LinkedField`,name:`scopedVFoldersV2`,plural:!1,selections:[{alias:null,args:null,concreteType:`VFolderEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`VFolder`,kind:`LinkedField`,name:`node`,plural:!1,selections:[a,o,{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}]}]},params:{cacheID:`b4a9c546a6716bf73971af526f839cc1`,id:null,metadata:{},name:`BAIVFolderSelectValueQuery`,operationKind:`query`,text:`query BAIVFolderSelectValueQuery(
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
`}}})(),ve.hash=`6bd89e3f80121249cadec8a0f1149957`})))()}var ye;function A(){return(A=e((()=>{ye=(function(){var e={defaultValue:null,kind:`LocalArgument`,name:`filter`},t={defaultValue:null,kind:`LocalArgument`,name:`limit`},n={defaultValue:null,kind:`LocalArgument`,name:`offset`},r={defaultValue:null,kind:`LocalArgument`,name:`scope`},i=[{kind:`Variable`,name:`filter`,variableName:`filter`},{kind:`Variable`,name:`limit`,variableName:`limit`},{kind:`Variable`,name:`offset`,variableName:`offset`},{kind:`Literal`,name:`orderBy`,value:[{direction:`DESC`,field:`CREATED_AT`}]},{kind:`Variable`,name:`scope`,variableName:`scope`}],a={alias:null,args:null,kind:`ScalarField`,name:`count`,storageKey:null},o={alias:null,args:null,kind:`ScalarField`,name:`entityId`,storageKey:null},ee={alias:null,args:null,concreteType:`VFolderMetadataInfo`,kind:`LinkedField`,name:`metadata`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`name`,storageKey:null}],storageKey:null};return{fragment:{argumentDefinitions:[e,t,n,r],kind:`Fragment`,metadata:null,name:`BAIVFolderSelectPaginatedQuery`,selections:[{alias:null,args:i,concreteType:`VFolderConnection`,kind:`LinkedField`,name:`scopedVFoldersV2`,plural:!1,selections:[a,{alias:null,args:null,concreteType:`VFolderEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`VFolder`,kind:`LinkedField`,name:`node`,plural:!1,selections:[o,ee],storageKey:null}],storageKey:null}],storageKey:null}],type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[r,e,t,n],kind:`Operation`,name:`BAIVFolderSelectPaginatedQuery`,selections:[{alias:null,args:i,concreteType:`VFolderConnection`,kind:`LinkedField`,name:`scopedVFoldersV2`,plural:!1,selections:[a,{alias:null,args:null,concreteType:`VFolderEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`VFolder`,kind:`LinkedField`,name:`node`,plural:!1,selections:[o,ee,{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}]},params:{cacheID:`00892b922f6cdd51923deba15d1fc80a`,id:null,metadata:{},name:`BAIVFolderSelectPaginatedQuery`,operationKind:`query`,text:`query BAIVFolderSelectPaginatedQuery(
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
`}}})(),ye.hash=`2a39a339354da148131a9b6bab420a32`})))()}function be(e){var t;return((t=e.scopedVFoldersV2)==null?void 0:t.count)??void 0}function j(e){return e.node}function xe(e){var t;return(t=e.scopedVFoldersV2)==null?void 0:t.edges.map(j)}function Se(e){return e==null?void 0:e.entityId}function Ce(e){return e.value}var we,M,Te,Ee,De,N;function P(){return(P=e((()=>{k(),A(),we=oe(),de(),ge(),s(),y(),C(),E(),i(),n(),ie(),_(),M=t(),Te=ue(),Ee=v(),De={status:{notIn:[`DELETE_PENDING`,`DELETE_ONGOING`,`DELETE_ERROR`,`DELETE_COMPLETE`]}},N=e=>{"use memo";var t;let n=(0,we.c)(56),i,s,c,l,u,d,f,p,m;n[0]===e?(i=n[1],s=n[2],c=n[3],l=n[4],u=n[5],d=n[6],f=n[7],p=n[8],m=n[9]):({scope:d,filter:c,excludeDeleted:i,valuePropName:p,fallbackLabels:s,multiple:m,isLoading:l,ref:u,...f}=e,n[0]=e,n[1]=i,n[2]=s,n[3]=c,n[4]=l,n[5]=u,n[6]=d,n[7]=f,n[8]=p,n[9]=m);let h=p===void 0?`id`:p,g=m!==void 0&&m,{t:te}=ae(),_;n[10]===Symbol.for(`react.memo_cache_sentinel`)?(_={valuePropName:`value`,trigger:`onChange`},n[10]=_):_=n[10];let[ie,v]=o(f,_),y;n[11]===Symbol.for(`react.memo_cache_sentinel`)?(y={valuePropName:`open`,trigger:`onOpenChange`,defaultValuePropName:`defaultOpen`},n[11]=y):y=n[11];let[oe,b]=o(f,y),se=(0,M.useDeferredValue)(oe),[x,S]=(0,M.useState)(``),ce=me(x),[le,ue]=(0,M.useTransition)(),de=a([i?De:null,c]),[ge,C]=ee(),w=(0,M.useDeferredValue)(ge),T=(0,M.useDeferredValue)(ie),E;n[12]===T?E=n[13]:(E=T??[],n[12]=T,n[13]=E);let D=a(r(E)),O;n[14]===h?O=n[15]:(O=e=>h===`id`?pe(`VirtualFolderNode`,e):e,n[14]=h,n[15]=O);let k=O,A;n[16]===h?A=n[17]:(A=e=>h===`id`?fe(e):e,n[16]=h,n[17]=A);let j=A,N=D.length?`store-or-network`:`store-only`,P;n[18]!==w||n[19]!==N?(P={fetchPolicy:N,fetchKey:w},n[18]=w,n[19]=N,n[20]=P):P=n[20];let{scopedVFoldersV2:F}=(0,Te.useLazyLoadQuery)(ve,{scope:d,filter:{AND:[...de,{entityId:{in:re(D,j)}}]},limit:Math.max(D.length,1),skip:D.length===0},P),I;n[21]===Symbol.for(`react.memo_cache_sentinel`)?(I={limit:10},n[21]=I):I=n[21];let L=se?`network-only`:`store-only`,R;n[22]!==w||n[23]!==L?(R={fetchPolicy:L,fetchKey:w},n[22]=w,n[23]=L,n[24]=R):R=n[24];let z;n[25]===Symbol.for(`react.memo_cache_sentinel`)?(z={getTotal:be,getItem:xe,getId:Se},n[25]=z):z=n[25];let{paginationData:B,result:V,loadNext:H,isLoadingNext:U}=he(ye,I,{scope:d,filter:{AND:a([...de,ce?{name:{iContains:ce}}:null])}},R,z),W,G;n[26]===C?(W=n[27],G=n[28]):(W=()=>({refetch:()=>{ue(()=>{C()})}}),G=[C,ue],n[26]=C,n[27]=W,n[28]=G),(0,M.useImperativeHandle)(u,W,G);let K;if(n[29]!==k||n[30]!==B){let e;n[32]===k?e=n[33]:(e=e=>({value:k(e.entityId),label:e.metadata.name,description:e.entityId}),n[32]=k,n[33]=e),K=re(B,e),n[29]=k,n[30]=B,n[31]=K}else K=n[31];let q=K,J;bb0:{let e;n[34]!==j||n[35]!==s||n[36]!==(F==null?void 0:F.edges)?(e=e=>{let t=ne(F==null?void 0:F.edges,t=>t.node.entityId===j(e));return{label:(t==null?void 0:t.node.metadata.name)??(s==null?void 0:s[e])??j(e),value:e}},n[34]=j,n[35]=s,n[36]=F==null?void 0:F.edges,n[37]=e):e=n[37];let t=re(D,e);if(g){J=t;break bb0}J=t[0]??null}let Y=J,X;n[38]===te?X=n[39]:(X=te(`comp:BAIVFolderSelect.SelectFolder`),n[38]=te,n[39]=X);let Z=l||!!oe&&!se||ie!==T||x!==ce||le,Q=((t=V.scopedVFoldersV2)==null?void 0:t.count)??void 0,$;n[40]!==g||n[41]!==v?($=e=>{let t=a(r(e??[])),n=re(t,Ce);v(g?n:n[0],g?t:t[0])},n[40]=g,n[41]=v,n[42]=$):$=n[42];let Oe;return n[43]!==U||n[44]!==Y||n[45]!==H||n[46]!==g||n[47]!==q||n[48]!==x||n[49]!==f||n[50]!==b||n[51]!==X||n[52]!==Z||n[53]!==Q||n[54]!==$?(Oe=(0,Ee.jsx)(_e,{placeholder:X,...f,multiple:g,isLoading:Z,isLoadingNext:U,total:Q,options:q,value:Y,onChange:$,searchValue:x,onSearch:S,onOpenChange:b,endReached:H}),n[43]=U,n[44]=Y,n[45]=H,n[46]=g,n[47]=q,n[48]=x,n[49]=f,n[50]=b,n[51]=X,n[52]=Z,n[53]=Q,n[54]=$,n[55]=Oe):Oe=n[55],Oe}})))()}var F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q;function $(){return($=e((()=>{se(),p(),c(),w(),ce(),x(),D(),P(),h(),te(),F=t(),I=ue(),L=v(),W=`00000000-0000-0000-0000-000000000001`,G=[{name:`my-workspace`,row_id:`11111111-1111-1111-1111-111111111111`},{name:`team-shared-data`,row_id:`22222222-2222-2222-2222-222222222222`,permissions:[`READ`]}],K=()=>({[G[0].row_id]:{".":[l(`models`,`DIRECTORY`,`2026-07-21T14:02:00`),l(`datasets`,`DIRECTORY`,`2026-07-18T09:45:00`),l(`outputs`,`DIRECTORY`,`2026-07-28T22:10:00`),l(`README.md`,`FILE`,`2026-07-01T11:20:00`),l(`train.py`,`FILE`,`2026-07-25T16:33:00`)],models:[l(`checkpoints`,`DIRECTORY`,`2026-07-27T03:12:00`),l(`llama-3-ft`,`DIRECTORY`,`2026-07-26T19:40:00`),l(`model_definition.yaml`,`FILE`,`2026-07-22T10:05:00`)],"models/checkpoints":[l(`epoch-001`,`DIRECTORY`,`2026-07-27T03:12:00`),l(`epoch-002`,`DIRECTORY`,`2026-07-27T09:47:00`),l(`latest.pt`,`FILE`,`2026-07-27T09:47:00`)],"models/checkpoints/epoch-001":[],"models/checkpoints/epoch-002":[],"models/llama-3-ft":[l(`adapter_config.json`,`FILE`,`2026-07-26T19:40:00`)],datasets:[l(`raw`,`DIRECTORY`,`2026-07-18T09:45:00`),l(`cleaned.parquet`,`FILE`,`2026-07-19T08:00:00`)],"datasets/raw":[],outputs:[]},[G[1].row_id]:{".":[l(`shared-corpus`,`DIRECTORY`,`2026-07-10T08:00:00`),l(`LICENSE`,`FILE`,`2026-07-02T12:00:00`)],"shared-corpus":[]}}),q={title:`Input/BAIVFolderPathPicker`,component:f,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:"\n**BAIVFolderPathPicker** is a sub path picker for a given vfolder: a select-like trigger that opens a directory-only picker modal. The vfolder itself is chosen elsewhere (e.g. a `BAIVFolderSelect`) and passed in as `vfolderUuid`. The modal's vfolder query is preloaded from the open gesture (`useQueryLoader` + transition), so the trigger shows its own `loading` state while the data is in flight.\n\nThe value is the **sub path inside the vfolder** — `''` for the vfolder root, `\"sub/path\"` below it, `undefined` while nothing is picked — so it plugs directly into a Form.Item; `value`/`onChange` follow the controllable-state convention, so the component works both controlled and uncontrolled. Files are visible but disabled inside the picker; only directories can be entered and chosen. Folder CRUD (create / rename / delete) stays available via `BAIFileExplorer`'s `directoryPicker` mode. When the vfolder changes, reset the value — a sub path only makes sense within the vfolder it was picked from.\n\n## BAI-Specific Props\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `vfolderUuid` | `string` | - | UUID of the vfolder to browse; pair with `disabled={!vfolderUuid}` until one is selected |\n| `value` | `string` | - | Selected sub path (`''` = vfolder root) |\n| `defaultValue` | `string` | - | Initial value for uncontrolled usage |\n| `onChange` | `(selectedSubPath?: string) => void` | - | Fired when a location is confirmed in the modal; the parameter is optional so a clear action can emit `undefined` |\n| `label` | `string` | \"Select a path\" | Accessible name of the trigger (visually hidden; the surrounding Form.Item renders the visible label) |\n\n> The stories run against a mock Relay environment and a mock `BAIClient`, so vfolder search, browsing, mkdir, rename and delete all work without a backend. The second folder (`team-shared-data`) is read-only — pick it in the Form story to see permission gating disable folder CRUD inside the modal.\n        "}}}},J={name:`Basic Usage (uncontrolled)`,render:()=>{let[e,t]=(0,F.useState)();return(0,L.jsx)(g,{vfolders:G,trees:K,children:(0,L.jsxs)(le,{direction:`column`,align:`stretch`,gap:`md`,style:{width:560},children:[(0,L.jsx)(f,{vfolderUuid:G[0].row_id,onChange:t}),(0,L.jsxs)(S,{type:`secondary`,children:[`onChange:`,` `,(0,L.jsx)(S,{code:!0,children:e===void 0?`undefined`:JSON.stringify(e)})]})]})})}},Y={name:`Within Form (with external BAIVFolderSelect)`,parameters:{docs:{description:{story:'The intended composition: a separate `BAIVFolderSelect` (with `valuePropName="entityId"` so the field holds the UUID) feeds `vfolderUuid`, and the picker plugs into its own Form.Item with `disabled={!vfolderUuid}` until a folder is chosen. Changing the vfolder resets the path field, and the required rule uses a custom validator because `""` (the vfolder root) is a valid pick.'}}},render:()=>{let[e]=b.useForm(),t=b.useWatch(`vfolderUuid`,e),[n,r]=(0,F.useState)();return(0,L.jsx)(g,{vfolders:G,folders:G.map(({row_id:e,name:t})=>m({id:e,name:t})),trees:K,children:(0,L.jsxs)(b,{form:e,layout:`vertical`,style:{width:560},onFinish:e=>{r(JSON.stringify(e))},children:[(0,L.jsx)(b.Item,{name:`vfolderUuid`,label:`Folder`,rules:[{required:!0}],children:(0,L.jsx)(N,{label:`Folder`,isLabelHidden:!0,valuePropName:`entityId`,scope:{user:[{value:W}]},onChange:()=>{e.setFieldValue(`destination`,void 0)}})}),(0,L.jsx)(b.Item,{name:`destination`,label:`Destination`,required:!0,rules:[{validator:(e,t)=>t===void 0?Promise.reject(Error(`Please select a path`)):Promise.resolve()}],children:(0,L.jsx)(f,{vfolderUuid:t,disabled:!t})}),(0,L.jsxs)(le,{direction:`column`,align:`start`,gap:`sm`,children:[(0,L.jsx)(T,{type:`primary`,onClick:()=>e.submit(),children:`Submit`}),n&&(0,L.jsxs)(S,{type:`secondary`,children:[`submitted: `,(0,L.jsx)(S,{code:!0,children:n})]})]})]})})}},X=()=>{let[e,t]=(0,F.useState)(!1),[n,r]=(0,F.useTransition)(),[i,a]=(0,F.useState)(),[o,ee]=(0,I.useQueryLoader)(d);return(0,L.jsxs)(le,{direction:`column`,gap:`md`,align:`start`,children:[(0,L.jsx)(T,{type:`primary`,loading:n,onClick:()=>{r(()=>{ee({vfolderId:G[0].row_id},{fetchPolicy:`store-and-network`}),t(!0)})},children:`Open directory picker`}),(0,L.jsxs)(S,{type:`secondary`,children:[`Last selection:`,` `,(0,L.jsx)(S,{code:!0,children:i===void 0?`(none)`:JSON.stringify(i)})]}),o!=null&&(0,L.jsx)(O,{children:(0,L.jsx)(u,{open:e,vfolderUuid:G[0].row_id,queryRef:o,onRequestClose:e=>{e!==void 0&&a(e),t(!1)}})})]})},Z={name:`Directory Picker Modal`,parameters:{docs:{description:{story:"`BAIDirectoryPickerModal` can also be driven directly — preload `BAIDirectoryPickerQuery` with `useQueryLoader` in the opening event (wrapped in a transition, since the modal suspends until the query resolves), pass the `queryRef`, and receive the chosen sub path via `onRequestClose` (`undefined` when cancelled)."}}},render:()=>(0,L.jsx)(g,{vfolders:G,trees:K,children:(0,L.jsx)(X,{})})},J.parameters={...J.parameters,docs:{...(R=J.parameters)==null?void 0:R.docs,source:{originalSource:`{
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
}`,...(z=J.parameters)==null||(z=z.docs)==null?void 0:z.source}}},Y.parameters={...Y.parameters,docs:{...(B=Y.parameters)==null?void 0:B.docs,source:{originalSource:`{
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
}`,...(V=Y.parameters)==null||(V=V.docs)==null?void 0:V.source}}},Z.parameters={...Z.parameters,docs:{...(H=Z.parameters)==null?void 0:H.docs,source:{originalSource:`{
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
}`,...(U=Z.parameters)==null||(U=U.docs)==null?void 0:U.source}}},Q=[`Default`,`WithinForm`,`PickerModalOnly`]})))()}$();export{J as Default,Z as PickerModalOnly,Y as WithinForm,Q as __namedExportsOrder,q as default};