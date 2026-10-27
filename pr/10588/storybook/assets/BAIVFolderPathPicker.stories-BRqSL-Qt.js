import{n as e}from"./rolldown-runtime-2s6bX4vc.js";import{n as t,t as n}from"./castArray-D5wfhmm_.js";import{n as r,t as i}from"./compact-BqEdnGyS.js";import{m as a,r as o,t as s}from"./hooks-BKuvs6Qg.js";import{a as c,c as l,d as u,f as d,l as f,n as p,p as m,t as h,u as g}from"./MockVFolderFileProviders-DciQ_4zd.js";import{n as ee,t as te}from"./find-BPjeGL13.js";import{n as _,r as v}from"./BAIPropertyFilter-CGMDGJS6.js";import{n as y,t as b}from"./map-CIqW7OVA.js";import{n as ne,t as x}from"./useBAIi18n-BoXCk5K0.js";import{c as S,n as C,r as w,s as T}from"./iframe-DR2sIF5r.js";import{n as E,t as D}from"./BAIFlex-CAz1t6J5.js";import{c as re,h as O}from"./helper-DV0q0X9R.js";import{i as ie,n as ae,r as k,t as A}from"./usePaginatedQuery-C_PT0rpZ.js";import{n as j,t as M}from"./BAIButton-C-o5ANgR.js";import{n as N,t as oe}from"./BAIComplexSelect-D5bBzCyR.js";import{n as P,t as F}from"./BAIUnmountAfterClose-wB0Iuoj_.js";import{useDeferredValue as I,useEffect as se,useImperativeHandle as ce,useState as L,useTransition as R}from"react";import{jsx as z,jsxs as B}from"react/jsx-runtime";import{useLazyLoadQuery as le,useQueryLoader as V}from"react-relay";var H;function U(){return(U=e((()=>{H=(function(){var e={defaultValue:null,kind:`LocalArgument`,name:`first`},t={defaultValue:null,kind:`LocalArgument`,name:`scopeId`},n={defaultValue:null,kind:`LocalArgument`,name:`selectedFilter`},r={defaultValue:null,kind:`LocalArgument`,name:`skipSelectedVFolder`},i=[{condition:`skipSelectedVFolder`,kind:`Condition`,passingValue:!1,selections:[{alias:null,args:[{kind:`Variable`,name:`filter`,variableName:`selectedFilter`},{kind:`Variable`,name:`first`,variableName:`first`},{kind:`Literal`,name:`permission`,value:`read_attribute`},{kind:`Variable`,name:`scope_id`,variableName:`scopeId`}],concreteType:`VirtualFolderConnection`,kind:`LinkedField`,name:`vfolder_nodes`,plural:!1,selections:[{alias:null,args:null,concreteType:`VirtualFolderEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`VirtualFolderNode`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`name`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`row_id`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}]}];return{fragment:{argumentDefinitions:[e,t,n,r],kind:`Fragment`,metadata:null,name:`BAIVFolderSelectValueQuery`,selections:i,type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[n,e,r,t],kind:`Operation`,name:`BAIVFolderSelectValueQuery`,selections:i},params:{cacheID:`10b4d03752ab72bdea0c8473bffc577d`,id:null,metadata:{},name:`BAIVFolderSelectValueQuery`,operationKind:`query`,text:`query BAIVFolderSelectValueQuery(
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
`}}})(),H.hash=`f2f9fac35a9f022e6de82b4592e8acf2`})))()}var W;function G(){return(G=e((()=>{W=(function(){var e={defaultValue:null,kind:`LocalArgument`,name:`filter`},t={defaultValue:null,kind:`LocalArgument`,name:`limit`},n={defaultValue:null,kind:`LocalArgument`,name:`offset`},r={defaultValue:null,kind:`LocalArgument`,name:`permission`},i={defaultValue:null,kind:`LocalArgument`,name:`scopeId`},a=[{alias:null,args:[{kind:`Variable`,name:`filter`,variableName:`filter`},{kind:`Variable`,name:`first`,variableName:`limit`},{kind:`Variable`,name:`offset`,variableName:`offset`},{kind:`Literal`,name:`order`,value:`-created_at`},{kind:`Variable`,name:`permission`,variableName:`permission`},{kind:`Variable`,name:`scope_id`,variableName:`scopeId`}],concreteType:`VirtualFolderConnection`,kind:`LinkedField`,name:`vfolder_nodes`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`count`,storageKey:null},{alias:null,args:null,concreteType:`VirtualFolderEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`VirtualFolderNode`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`name`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`row_id`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:[e,t,n,r,i],kind:`Fragment`,metadata:null,name:`BAIVFolderSelectPaginatedQuery`,selections:a,type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[n,t,i,e,r],kind:`Operation`,name:`BAIVFolderSelectPaginatedQuery`,selections:a},params:{cacheID:`eddda0f4ea4f7ad2fb75f7f417cfe31d`,id:null,metadata:{},name:`BAIVFolderSelectPaginatedQuery`,operationKind:`query`,text:`query BAIVFolderSelectPaginatedQuery(
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
`}}})(),W.hash=`7a6826cee67c39bf1f4841f69c578621`})))()}var K,q;function J(){return(J=e((()=>{U(),G(),re(),k(),s(),x(),A(),N(),_(),r(),t(),b(),ee(),K=`status != "DELETE_PENDING" & status != "DELETE_ONGOING" & status != "DELETE_ERROR" & status != "DELETE_COMPLETE"`,q=({currentProjectId:e,filter:t,excludeDeleted:r,valuePropName:s=`id`,requiredPermission:c=`read_attribute`,onResolvedNamesChange:l,fallbackLabels:u,multiple:d=!1,isLoading:f,ref:p,...m})=>{"use memo";let{t:h}=ne(),[g,ee]=a(m,{valuePropName:`value`,trigger:`onChange`}),[_,b]=a(m,{valuePropName:`open`,trigger:`onOpenChange`,defaultValuePropName:`defaultOpen`}),x=I(_),[S,C]=L(``),w=ie(S),[T,E]=R(),D=v([r?K:null,t]),[re,k]=o(),A=I(re),j=I(g),M=i(n(j??[])),N=e=>{if(e)return s===`id`?e.id:e.row_id??void 0},{vfolder_nodes:P}=le(H,{selectedFilter:v([M.length?v(y(M,e=>`id == "${s===`id`?O(e):e}"`),`|`):null,D],`&`),first:Math.max(M.length,1),skipSelectedVFolder:M.length===0,scopeId:e?`project:${e}`:void 0},{fetchPolicy:M.length?`store-or-network`:`store-only`,fetchKey:A}),{paginationData:F,result:B,loadNext:V,isLoadingNext:U}=ae(W,{limit:10},{filter:v([D,w?`name ilike "%${w}%"`:null]),scopeId:e?`project:${e}`:void 0,permission:c},{fetchPolicy:x?`network-only`:`store-only`,fetchKey:A},{getTotal:e=>e.vfolder_nodes?.count??void 0,getItem:e=>e.vfolder_nodes?.edges?.map(e=>e?.node),getId:e=>e?.id});ce(p,()=>({refetch:()=>{E(()=>{k()})}}),[k,E]),se(()=>{if(l&&P?.edges){let e={};P.edges.forEach(t=>{let n=N(t?.node),r=t?.node?.name;n&&r&&(e[n]=r)}),l(e)}},[P]);let G=i(y(F,e=>{let t=N(e);if(!t)return null;let n=s===`id`?O(t):t;return{value:t,label:e?.name??t,description:n}})),q=(()=>{let e=y(M,e=>{let t=te(P?.edges,t=>N(t?.node)===e),n=u?.[e]??(s===`id`?O(e)??e:e);return{label:t?.node?.name??n,value:e}});return d?e:e[0]??null})();return z(oe,{placeholder:h(`comp:BAIVFolderSelect.SelectFolder`),...m,multiple:d,isLoading:f||!!_&&!x||g!==j||S!==w||T,isLoadingNext:U,total:B.vfolder_nodes?.count??void 0,options:G,value:q,onChange:e=>{let t=i(n(e??[])),r=y(t,e=>e.value);ee(d?r:r[0],d?t:t[0])},searchValue:S,onSearch:C,onOpenChange:b,endReached:V})}})))()}var Y,X,ue,Z,Q,de,$,fe;function pe(){return(pe=e((()=>{w(),p(),c(),j(),E(),S(),P(),J(),m(),g(),Y=[{name:`my-workspace`,row_id:`11111111-1111-1111-1111-111111111111`},{name:`team-shared-data`,row_id:`22222222-2222-2222-2222-222222222222`,permissions:[`READ`]}],X=()=>({[Y[0].row_id]:{".":[l(`models`,`DIRECTORY`,`2026-07-21T14:02:00`),l(`datasets`,`DIRECTORY`,`2026-07-18T09:45:00`),l(`outputs`,`DIRECTORY`,`2026-07-28T22:10:00`),l(`README.md`,`FILE`,`2026-07-01T11:20:00`),l(`train.py`,`FILE`,`2026-07-25T16:33:00`)],models:[l(`checkpoints`,`DIRECTORY`,`2026-07-27T03:12:00`),l(`llama-3-ft`,`DIRECTORY`,`2026-07-26T19:40:00`),l(`model_definition.yaml`,`FILE`,`2026-07-22T10:05:00`)],"models/checkpoints":[l(`epoch-001`,`DIRECTORY`,`2026-07-27T03:12:00`),l(`epoch-002`,`DIRECTORY`,`2026-07-27T09:47:00`),l(`latest.pt`,`FILE`,`2026-07-27T09:47:00`)],"models/checkpoints/epoch-001":[],"models/checkpoints/epoch-002":[],"models/llama-3-ft":[l(`adapter_config.json`,`FILE`,`2026-07-26T19:40:00`)],datasets:[l(`raw`,`DIRECTORY`,`2026-07-18T09:45:00`),l(`cleaned.parquet`,`FILE`,`2026-07-19T08:00:00`)],"datasets/raw":[],outputs:[]},[Y[1].row_id]:{".":[l(`shared-corpus`,`DIRECTORY`,`2026-07-10T08:00:00`),l(`LICENSE`,`FILE`,`2026-07-02T12:00:00`)],"shared-corpus":[]}}),ue={title:`Input/BAIVFolderPathPicker`,component:f,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:"\n**BAIVFolderPathPicker** is a sub path picker for a given vfolder: a select-like trigger that opens a directory-only picker modal. The vfolder itself is chosen elsewhere (e.g. a `BAIVFolderSelect`) and passed in as `vfolderUuid`. The modal's vfolder query is preloaded from the open gesture (`useQueryLoader` + transition), so the trigger shows its own `loading` state while the data is in flight.\n\nThe value is the **sub path inside the vfolder** — `''` for the vfolder root, `\"sub/path\"` below it, `undefined` while nothing is picked — so it plugs directly into a Form.Item; `value`/`onChange` follow the controllable-state convention, so the component works both controlled and uncontrolled. Files are visible but disabled inside the picker; only directories can be entered and chosen. Folder CRUD (create / rename / delete) stays available via `BAIFileExplorer`'s `directoryPicker` mode. When the vfolder changes, reset the value — a sub path only makes sense within the vfolder it was picked from.\n\n## BAI-Specific Props\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `vfolderUuid` | `string` | - | UUID of the vfolder to browse; pair with `disabled={!vfolderUuid}` until one is selected |\n| `value` | `string` | - | Selected sub path (`''` = vfolder root) |\n| `defaultValue` | `string` | - | Initial value for uncontrolled usage |\n| `onChange` | `(selectedSubPath?: string) => void` | - | Fired when a location is confirmed in the modal; the parameter is optional so a clear action can emit `undefined` |\n| `label` | `string` | \"Select a path\" | Accessible name of the trigger (visually hidden; the surrounding Form.Item renders the visible label) |\n\n> The stories run against a mock Relay environment and a mock `BAIClient`, so vfolder search, browsing, mkdir, rename and delete all work without a backend. The second folder (`team-shared-data`) is read-only — pick it in the Form story to see permission gating disable folder CRUD inside the modal.\n        "}}}},Z={name:`Basic Usage (uncontrolled)`,render:()=>{let[e,t]=L();return z(h,{vfolders:Y,trees:X,children:B(D,{direction:`column`,align:`stretch`,gap:`md`,style:{width:560},children:[z(f,{vfolderUuid:Y[0].row_id,onChange:t}),B(T,{type:`secondary`,children:[`onChange:`,` `,z(T,{code:!0,children:e===void 0?`undefined`:JSON.stringify(e)})]})]})})}},Q={name:`Within Form (with external BAIVFolderSelect)`,parameters:{docs:{description:{story:'The intended composition: a separate `BAIVFolderSelect` (with `valuePropName="row_id"` so the field holds the UUID) feeds `vfolderUuid`, and the picker plugs into its own Form.Item with `disabled={!vfolderUuid}` until a folder is chosen. Changing the vfolder resets the path field, and the required rule uses a custom validator because `""` (the vfolder root) is a valid pick.'}}},render:()=>{let[e]=C.useForm(),t=C.useWatch(`vfolderUuid`,e),[n,r]=L();return z(h,{vfolders:Y,trees:X,children:B(C,{form:e,layout:`vertical`,style:{width:560},onFinish:e=>{r(JSON.stringify(e))},children:[z(C.Item,{name:`vfolderUuid`,label:`Folder`,rules:[{required:!0}],children:z(q,{label:`Folder`,isLabelHidden:!0,valuePropName:`row_id`,onChange:()=>{e.setFieldValue(`destination`,void 0)}})}),z(C.Item,{name:`destination`,label:`Destination`,required:!0,rules:[{validator:(e,t)=>t===void 0?Promise.reject(Error(`Please select a path`)):Promise.resolve()}],children:z(f,{vfolderUuid:t,disabled:!t})}),B(D,{direction:`column`,align:`start`,gap:`sm`,children:[z(M,{type:`primary`,onClick:()=>e.submit(),children:`Submit`}),n&&B(T,{type:`secondary`,children:[`submitted: `,z(T,{code:!0,children:n})]})]})]})})}},de=()=>{let[e,t]=L(!1),[n,r]=R(),[i,a]=L(),[o,s]=V(d);return B(D,{direction:`column`,gap:`md`,align:`start`,children:[z(M,{type:`primary`,loading:n,onClick:()=>{r(()=>{s({vfolderId:Y[0].row_id},{fetchPolicy:`store-and-network`}),t(!0)})},children:`Open directory picker`}),B(T,{type:`secondary`,children:[`Last selection:`,` `,z(T,{code:!0,children:i===void 0?`(none)`:JSON.stringify(i)})]}),o!=null&&z(F,{children:z(u,{open:e,vfolderUuid:Y[0].row_id,queryRef:o,onRequestClose:e=>{e!==void 0&&a(e),t(!1)}})})]})},$={name:`Directory Picker Modal`,parameters:{docs:{description:{story:"`BAIDirectoryPickerModal` can also be driven directly — preload `BAIDirectoryPickerQuery` with `useQueryLoader` in the opening event (wrapped in a transition, since the modal suspends until the query resolves), pass the `queryRef`, and receive the chosen sub path via `onRequestClose` (`undefined` when cancelled)."}}},render:()=>z(h,{vfolders:Y,trees:X,children:z(de,{})})},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
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