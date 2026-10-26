import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-D0Ex1IVc.js";import{n,t as r}from"./castArray-AZdtGfv6.js";import{n as i,t as a}from"./compact-C9OPbfhP.js";import{m as o,r as s,t as ee}from"./hooks-C37w8Ol6.js";import{a as c,c as l,d as u,f as te,l as d,n as f,p as ne,t as p,u as re}from"./MockVFolderFileProviders-ATc9sUwL.js";import{n as m,t as ie}from"./find-DwRoxbKX.js";import{n as h,r as g}from"./BAIPropertyFilter-BV1tPnJk.js";import{n as _,t as v}from"./map-CLZMgxwS.js";import{t as y}from"./jsx-runtime-MKhVqBIO.js";import{n as ae,t as b}from"./useBAIi18n-Biey1teG.js";import{n as x,t as oe}from"./Form-D8tC8Qyr.js";import{h as S,m as C}from"./iframe-DHcqzLLD.js";import{n as w,t as T}from"./BAIFlex-BOFoS5KY.js";import{t as E}from"./react-relay-sBALIJlt.js";import{c as D,h as O}from"./helper-CVvTx27U.js";import{i as se,n as ce,r as k,t as A}from"./usePaginatedQuery-CRYleCKz.js";import{n as j,t as M}from"./BAIButton-BkLrwIfz.js";import{n as N,t as le}from"./BAIComplexSelect-D0tPiGCY.js";import{n as P,t as F}from"./BAIUnmountAfterClose-BLNmR2Ks.js";var I;function L(){return(L=e((()=>{I=(function(){var e={defaultValue:null,kind:`LocalArgument`,name:`first`},t={defaultValue:null,kind:`LocalArgument`,name:`scopeId`},n={defaultValue:null,kind:`LocalArgument`,name:`selectedFilter`},r={defaultValue:null,kind:`LocalArgument`,name:`skipSelectedVFolder`},i=[{condition:`skipSelectedVFolder`,kind:`Condition`,passingValue:!1,selections:[{alias:null,args:[{kind:`Variable`,name:`filter`,variableName:`selectedFilter`},{kind:`Variable`,name:`first`,variableName:`first`},{kind:`Literal`,name:`permission`,value:`read_attribute`},{kind:`Variable`,name:`scope_id`,variableName:`scopeId`}],concreteType:`VirtualFolderConnection`,kind:`LinkedField`,name:`vfolder_nodes`,plural:!1,selections:[{alias:null,args:null,concreteType:`VirtualFolderEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`VirtualFolderNode`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`name`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`row_id`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}]}];return{fragment:{argumentDefinitions:[e,t,n,r],kind:`Fragment`,metadata:null,name:`BAIVFolderSelectValueQuery`,selections:i,type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[n,e,r,t],kind:`Operation`,name:`BAIVFolderSelectValueQuery`,selections:i},params:{cacheID:`10b4d03752ab72bdea0c8473bffc577d`,id:null,metadata:{},name:`BAIVFolderSelectValueQuery`,operationKind:`query`,text:`query BAIVFolderSelectValueQuery(
  $selectedFilter: String
  $first: Int!
  $skipSelectedVFolder: Boolean!
  $scopeId: ScopeField
) {
  vfolder_nodes(scope_id: $scopeId, filter: $selectedFilter, first: $first, permission: "read_attribute") @skip(if: $skipSelectedVFolder) {
    edges {
      node {
        name
        id
        row_id
      }
    }
  }
}
`}}})(),I.hash=`f2f9fac35a9f022e6de82b4592e8acf2`})))()}var R;function z(){return(z=e((()=>{R=(function(){var e={defaultValue:null,kind:`LocalArgument`,name:`filter`},t={defaultValue:null,kind:`LocalArgument`,name:`limit`},n={defaultValue:null,kind:`LocalArgument`,name:`offset`},r={defaultValue:null,kind:`LocalArgument`,name:`permission`},i={defaultValue:null,kind:`LocalArgument`,name:`scopeId`},a=[{alias:null,args:[{kind:`Variable`,name:`filter`,variableName:`filter`},{kind:`Variable`,name:`first`,variableName:`limit`},{kind:`Variable`,name:`offset`,variableName:`offset`},{kind:`Literal`,name:`order`,value:`-created_at`},{kind:`Variable`,name:`permission`,variableName:`permission`},{kind:`Variable`,name:`scope_id`,variableName:`scopeId`}],concreteType:`VirtualFolderConnection`,kind:`LinkedField`,name:`vfolder_nodes`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`count`,storageKey:null},{alias:null,args:null,concreteType:`VirtualFolderEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`VirtualFolderNode`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`name`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`row_id`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:[e,t,n,r,i],kind:`Fragment`,metadata:null,name:`BAIVFolderSelectPaginatedQuery`,selections:a,type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[n,t,i,e,r],kind:`Operation`,name:`BAIVFolderSelectPaginatedQuery`,selections:a},params:{cacheID:`eddda0f4ea4f7ad2fb75f7f417cfe31d`,id:null,metadata:{},name:`BAIVFolderSelectPaginatedQuery`,operationKind:`query`,text:`query BAIVFolderSelectPaginatedQuery(
  $offset: Int!
  $limit: Int!
  $scopeId: ScopeField
  $filter: String
  $permission: VFolderPermissionValueField
) {
  vfolder_nodes(scope_id: $scopeId, offset: $offset, first: $limit, filter: $filter, permission: $permission, order: "-created_at") {
    count
    edges {
      node {
        id
        name
        row_id
      }
    }
  }
}
`}}})(),R.hash=`7a6826cee67c39bf1f4841f69c578621`})))()}var B,V,H,U,W;function G(){return(G=e((()=>{L(),z(),D(),k(),ee(),b(),A(),N(),h(),i(),n(),v(),m(),B=t(),V=E(),H=y(),U=`status != "DELETE_PENDING" & status != "DELETE_ONGOING" & status != "DELETE_ERROR" & status != "DELETE_COMPLETE"`,W=({currentProjectId:e,filter:t,excludeDeleted:n,valuePropName:i=`id`,requiredPermission:ee=`read_attribute`,onResolvedNamesChange:c,fallbackLabels:l,multiple:u=!1,isLoading:te,ref:d,...f})=>{"use memo";let{t:ne}=ae(),[p,re]=o(f,{valuePropName:`value`,trigger:`onChange`}),[m,h]=o(f,{valuePropName:`open`,trigger:`onOpenChange`,defaultValuePropName:`defaultOpen`}),v=(0,B.useDeferredValue)(m),[y,b]=(0,B.useState)(``),x=se(y),[oe,S]=(0,B.useTransition)(),C=g([n?U:null,t]),[w,T]=s(),E=(0,B.useDeferredValue)(w),D=(0,B.useDeferredValue)(p),k=a(r(D??[])),A=e=>{if(e)return i===`id`?e.id:e.row_id??void 0},{vfolder_nodes:j}=(0,V.useLazyLoadQuery)(I,{selectedFilter:g([k.length?g(_(k,e=>`id == "${i===`id`?O(e):e}"`),`|`):null,C],`&`),first:Math.max(k.length,1),skipSelectedVFolder:k.length===0,scopeId:e?`project:${e}`:void 0},{fetchPolicy:k.length?`store-or-network`:`store-only`,fetchKey:E}),{paginationData:M,result:N,loadNext:P,isLoadingNext:F}=ce(R,{limit:10},{filter:g([C,x?`name ilike "%${x}%"`:null]),scopeId:e?`project:${e}`:void 0,permission:ee},{fetchPolicy:v?`network-only`:`store-only`,fetchKey:E},{getTotal:e=>e.vfolder_nodes?.count??void 0,getItem:e=>e.vfolder_nodes?.edges?.map(e=>e?.node),getId:e=>e?.id});(0,B.useImperativeHandle)(d,()=>({refetch:()=>{S(()=>{T()})}}),[T,S]),(0,B.useEffect)(()=>{if(c&&j?.edges){let e={};j.edges.forEach(t=>{let n=A(t?.node),r=t?.node?.name;n&&r&&(e[n]=r)}),c(e)}},[j]);let L=a(_(M,e=>{let t=A(e);if(!t)return null;let n=i===`id`?O(t):t;return{value:t,label:e?.name??t,description:n}})),z=(()=>{let e=_(k,e=>{let t=ie(j?.edges,t=>A(t?.node)===e),n=l?.[e]??(i===`id`?O(e)??e:e);return{label:t?.node?.name??n,value:e}});return u?e:e[0]??null})();return(0,H.jsx)(le,{placeholder:ne(`comp:BAIVFolderSelect.SelectFolder`),...f,multiple:u,isLoading:te||!!m&&!v||p!==D||y!==x||oe,isLoadingNext:F,total:N.vfolder_nodes?.count??void 0,options:L,value:z,onChange:e=>{let t=a(r(e??[])),n=_(t,e=>e.value);re(u?n:n[0],u?t:t[0])},searchValue:y,onSearch:b,onOpenChange:h,endReached:P})}})))()}var K,q,J,Y,X,ue,Z,Q,de,$,fe;function pe(){return(pe=e((()=>{oe(),f(),c(),j(),w(),S(),P(),G(),ne(),re(),K=t(),q=E(),J=y(),Y=[{name:`my-workspace`,row_id:`11111111-1111-1111-1111-111111111111`},{name:`team-shared-data`,row_id:`22222222-2222-2222-2222-222222222222`,permissions:[`READ`]}],X=()=>({[Y[0].row_id]:{".":[l(`models`,`DIRECTORY`,`2026-07-21T14:02:00`),l(`datasets`,`DIRECTORY`,`2026-07-18T09:45:00`),l(`outputs`,`DIRECTORY`,`2026-07-28T22:10:00`),l(`README.md`,`FILE`,`2026-07-01T11:20:00`),l(`train.py`,`FILE`,`2026-07-25T16:33:00`)],models:[l(`checkpoints`,`DIRECTORY`,`2026-07-27T03:12:00`),l(`llama-3-ft`,`DIRECTORY`,`2026-07-26T19:40:00`),l(`model_definition.yaml`,`FILE`,`2026-07-22T10:05:00`)],"models/checkpoints":[l(`epoch-001`,`DIRECTORY`,`2026-07-27T03:12:00`),l(`epoch-002`,`DIRECTORY`,`2026-07-27T09:47:00`),l(`latest.pt`,`FILE`,`2026-07-27T09:47:00`)],"models/checkpoints/epoch-001":[],"models/checkpoints/epoch-002":[],"models/llama-3-ft":[l(`adapter_config.json`,`FILE`,`2026-07-26T19:40:00`)],datasets:[l(`raw`,`DIRECTORY`,`2026-07-18T09:45:00`),l(`cleaned.parquet`,`FILE`,`2026-07-19T08:00:00`)],"datasets/raw":[],outputs:[]},[Y[1].row_id]:{".":[l(`shared-corpus`,`DIRECTORY`,`2026-07-10T08:00:00`),l(`LICENSE`,`FILE`,`2026-07-02T12:00:00`)],"shared-corpus":[]}}),ue={title:`Input/BAIVFolderPathPicker`,component:d,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:"\n**BAIVFolderPathPicker** is a sub path picker for a given vfolder: a select-like trigger that opens a directory-only picker modal. The vfolder itself is chosen elsewhere (e.g. a `BAIVFolderSelect`) and passed in as `vfolderUuid`. The modal's vfolder query is preloaded from the open gesture (`useQueryLoader` + transition), so the trigger shows its own `loading` state while the data is in flight.\n\nThe value is the **sub path inside the vfolder** — `''` for the vfolder root, `\"sub/path\"` below it, `undefined` while nothing is picked — so it plugs directly into a Form.Item; `value`/`onChange` follow the controllable-state convention, so the component works both controlled and uncontrolled. Files are visible but disabled inside the picker; only directories can be entered and chosen. Folder CRUD (create / rename / delete) stays available via `BAIFileExplorer`'s `directoryPicker` mode. When the vfolder changes, reset the value — a sub path only makes sense within the vfolder it was picked from.\n\n## BAI-Specific Props\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `vfolderUuid` | `string` | - | UUID of the vfolder to browse; pair with `disabled={!vfolderUuid}` until one is selected |\n| `value` | `string` | - | Selected sub path (`''` = vfolder root) |\n| `defaultValue` | `string` | - | Initial value for uncontrolled usage |\n| `onChange` | `(selectedSubPath?: string) => void` | - | Fired when a location is confirmed in the modal; the parameter is optional so a clear action can emit `undefined` |\n| `label` | `string` | \"Select a path\" | Accessible name of the trigger (visually hidden; the surrounding Form.Item renders the visible label) |\n\n> The stories run against a mock Relay environment and a mock `BAIClient`, so vfolder search, browsing, mkdir, rename and delete all work without a backend. The second folder (`team-shared-data`) is read-only — pick it in the Form story to see permission gating disable folder CRUD inside the modal.\n        "}}}},Z={name:`Basic Usage (uncontrolled)`,render:()=>{let[e,t]=(0,K.useState)();return(0,J.jsx)(p,{vfolders:Y,trees:X,children:(0,J.jsxs)(T,{direction:`column`,align:`stretch`,gap:`md`,style:{width:560},children:[(0,J.jsx)(d,{vfolderUuid:Y[0].row_id,onChange:t}),(0,J.jsxs)(C,{type:`secondary`,children:[`onChange:`,` `,(0,J.jsx)(C,{code:!0,children:e===void 0?`undefined`:JSON.stringify(e)})]})]})})}},Q={name:`Within Form (with external BAIVFolderSelect)`,parameters:{docs:{description:{story:'The intended composition: a separate `BAIVFolderSelect` (with `valuePropName="row_id"` so the field holds the UUID) feeds `vfolderUuid`, and the picker plugs into its own Form.Item with `disabled={!vfolderUuid}` until a folder is chosen. Changing the vfolder resets the path field, and the required rule uses a custom validator because `""` (the vfolder root) is a valid pick.'}}},render:()=>{let[e]=x.useForm(),t=x.useWatch(`vfolderUuid`,e),[n,r]=(0,K.useState)();return(0,J.jsx)(p,{vfolders:Y,trees:X,children:(0,J.jsxs)(x,{form:e,layout:`vertical`,style:{width:560},onFinish:e=>{r(JSON.stringify(e))},children:[(0,J.jsx)(x.Item,{name:`vfolderUuid`,label:`Folder`,rules:[{required:!0}],children:(0,J.jsx)(W,{label:`Folder`,isLabelHidden:!0,valuePropName:`row_id`,onChange:()=>{e.setFieldValue(`destination`,void 0)}})}),(0,J.jsx)(x.Item,{name:`destination`,label:`Destination`,required:!0,rules:[{validator:(e,t)=>t===void 0?Promise.reject(Error(`Please select a path`)):Promise.resolve()}],children:(0,J.jsx)(d,{vfolderUuid:t,disabled:!t})}),(0,J.jsxs)(T,{direction:`column`,align:`start`,gap:`sm`,children:[(0,J.jsx)(M,{type:`primary`,onClick:()=>e.submit(),children:`Submit`}),n&&(0,J.jsxs)(C,{type:`secondary`,children:[`submitted: `,(0,J.jsx)(C,{code:!0,children:n})]})]})]})})}},de=()=>{let[e,t]=(0,K.useState)(!1),[n,r]=(0,K.useTransition)(),[i,a]=(0,K.useState)(),[o,s]=(0,q.useQueryLoader)(te);return(0,J.jsxs)(T,{direction:`column`,gap:`md`,align:`start`,children:[(0,J.jsx)(M,{type:`primary`,loading:n,onClick:()=>{r(()=>{s({vfolderId:Y[0].row_id},{fetchPolicy:`store-and-network`}),t(!0)})},children:`Open directory picker`}),(0,J.jsxs)(C,{type:`secondary`,children:[`Last selection:`,` `,(0,J.jsx)(C,{code:!0,children:i===void 0?`(none)`:JSON.stringify(i)})]}),o!=null&&(0,J.jsx)(F,{children:(0,J.jsx)(u,{open:e,vfolderUuid:Y[0].row_id,queryRef:o,onRequestClose:e=>{e!==void 0&&a(e),t(!1)}})})]})},$={name:`Directory Picker Modal`,parameters:{docs:{description:{story:"`BAIDirectoryPickerModal` can also be driven directly — preload `BAIDirectoryPickerQuery` with `useQueryLoader` in the opening event (wrapped in a transition, since the modal suspends until the query resolves), pass the `queryRef`, and receive the chosen sub path via `onRequestClose` (`undefined` when cancelled)."}}},render:()=>(0,J.jsx)(p,{vfolders:Y,trees:X,children:(0,J.jsx)(de,{})})},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
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
}`,...Z.parameters?.docs?.source}}},Q.parameters={...Q.parameters,docs:{...Q.parameters?.docs,source:{originalSource:`{
  name: 'Within Form (with external BAIVFolderSelect)',
  parameters: {
    docs: {
      description: {
        story: 'The intended composition: a separate \`BAIVFolderSelect\` (with \`valuePropName="row_id"\` so the field holds the UUID) feeds \`vfolderUuid\`, and the picker plugs into its own Form.Item with \`disabled={!vfolderUuid}\` until a folder is chosen. Changing the vfolder resets the path field, and the required rule uses a custom validator because \`""\` (the vfolder root) is a valid pick.'
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
    return <MockVFolderFileProviders vfolders={MOCK_VFOLDERS} trees={createInitialTrees}>
        <Form form={form} layout="vertical" style={{
        width: 560
      }} onFinish={values => {
        setSubmitted(JSON.stringify(values));
      }}>
          <Form.Item name="vfolderUuid" label="Folder" rules={[{
          required: true
        }]}>
            <BAIVFolderSelect label="Folder" isLabelHidden valuePropName="row_id" onChange={() => {
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
}`,...Q.parameters?.docs?.source}}},$.parameters={...$.parameters,docs:{...$.parameters?.docs,source:{originalSource:`{
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
}`,...$.parameters?.docs?.source}}},fe=[`Default`,`WithinForm`,`PickerModalOnly`]})))()}pe();export{Z as Default,$ as PickerModalOnly,Q as WithinForm,fe as __namedExportsOrder,ue as default};