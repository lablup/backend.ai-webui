import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-DlPsW1c0.js";import{n,t as r}from"./castArray-AZdtGfv6.js";import{n as i,t as a}from"./compact-C9OPbfhP.js";import{m as o,r as ee,t as te}from"./hooks-CqTIG_8a.js";import{a as s,c,d as l,f as u,l as d,n as f,p,t as m,u as h}from"./MockVFolderFileProviders-CoymspkQ.js";import{n as ne,t as re}from"./find-DAho-s_l.js";import{n as g,r as _}from"./BAIPropertyFilter-SGdgShBr.js";import{n as v,t as ie}from"./map-BLzs52H1.js";import{t as y}from"./jsx-runtime-MKhVqBIO.js";import{n as ae,t as b}from"./useBAIi18n-BiRHq6o1.js";import{n as x,t as S}from"./Form-BRtsXIQ7.js";import{h as oe,m as C}from"./iframe-lMx8nTtI.js";import{n as w,t as T}from"./BAIFlex-DnaoYTJ1.js";import{t as E}from"./react-relay-sHama7hJ.js";import{c as D,h as O}from"./helper-p-d7z67I.js";import{i as se,n as ce,r as k,t as A}from"./usePaginatedQuery-Ni9VC5r0.js";import{n as j,t as M}from"./BAIButton-CO5MqbEr.js";import{n as le,t as ue}from"./BAIComplexSelect-CeKT0Ccl.js";import{n as de,t as fe}from"./BAIUnmountAfterClose-BFd4mgc4.js";var N;function P(){return(P=e((()=>{N=(function(){var e={defaultValue:null,kind:`LocalArgument`,name:`first`},t={defaultValue:null,kind:`LocalArgument`,name:`scopeId`},n={defaultValue:null,kind:`LocalArgument`,name:`selectedFilter`},r={defaultValue:null,kind:`LocalArgument`,name:`skipSelectedVFolder`},i=[{condition:`skipSelectedVFolder`,kind:`Condition`,passingValue:!1,selections:[{alias:null,args:[{kind:`Variable`,name:`filter`,variableName:`selectedFilter`},{kind:`Variable`,name:`first`,variableName:`first`},{kind:`Literal`,name:`permission`,value:`read_attribute`},{kind:`Variable`,name:`scope_id`,variableName:`scopeId`}],concreteType:`VirtualFolderConnection`,kind:`LinkedField`,name:`vfolder_nodes`,plural:!1,selections:[{alias:null,args:null,concreteType:`VirtualFolderEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`VirtualFolderNode`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`name`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`row_id`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}]}];return{fragment:{argumentDefinitions:[e,t,n,r],kind:`Fragment`,metadata:null,name:`BAIVFolderSelectValueQuery`,selections:i,type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[n,e,r,t],kind:`Operation`,name:`BAIVFolderSelectValueQuery`,selections:i},params:{cacheID:`10b4d03752ab72bdea0c8473bffc577d`,id:null,metadata:{},name:`BAIVFolderSelectValueQuery`,operationKind:`query`,text:`query BAIVFolderSelectValueQuery(
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
`}}})(),N.hash=`f2f9fac35a9f022e6de82b4592e8acf2`})))()}var F;function I(){return(I=e((()=>{F=(function(){var e={defaultValue:null,kind:`LocalArgument`,name:`filter`},t={defaultValue:null,kind:`LocalArgument`,name:`limit`},n={defaultValue:null,kind:`LocalArgument`,name:`offset`},r={defaultValue:null,kind:`LocalArgument`,name:`permission`},i={defaultValue:null,kind:`LocalArgument`,name:`scopeId`},a=[{alias:null,args:[{kind:`Variable`,name:`filter`,variableName:`filter`},{kind:`Variable`,name:`first`,variableName:`limit`},{kind:`Variable`,name:`offset`,variableName:`offset`},{kind:`Literal`,name:`order`,value:`-created_at`},{kind:`Variable`,name:`permission`,variableName:`permission`},{kind:`Variable`,name:`scope_id`,variableName:`scopeId`}],concreteType:`VirtualFolderConnection`,kind:`LinkedField`,name:`vfolder_nodes`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`count`,storageKey:null},{alias:null,args:null,concreteType:`VirtualFolderEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`VirtualFolderNode`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`name`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`row_id`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:[e,t,n,r,i],kind:`Fragment`,metadata:null,name:`BAIVFolderSelectPaginatedQuery`,selections:a,type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[n,t,i,e,r],kind:`Operation`,name:`BAIVFolderSelectPaginatedQuery`,selections:a},params:{cacheID:`eddda0f4ea4f7ad2fb75f7f417cfe31d`,id:null,metadata:{},name:`BAIVFolderSelectPaginatedQuery`,operationKind:`query`,text:`query BAIVFolderSelectPaginatedQuery(
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
`}}})(),F.hash=`7a6826cee67c39bf1f4841f69c578621`})))()}var L,R,z,B,V;function H(){return(H=e((()=>{P(),I(),D(),k(),te(),b(),A(),le(),g(),i(),n(),ie(),ne(),L=t(),R=E(),z=y(),B=`status != "DELETE_PENDING" & status != "DELETE_ONGOING" & status != "DELETE_ERROR" & status != "DELETE_COMPLETE"`,V=({currentProjectId:e,filter:t,excludeDeleted:n,valuePropName:i=`id`,requiredPermission:te=`read_attribute`,onResolvedNamesChange:s,fallbackLabels:c,multiple:l=!1,isLoading:u,ref:d,...f})=>{"use memo";var p;let{t:m}=ae(),[h,ne]=o(f,{valuePropName:`value`,trigger:`onChange`}),[g,ie]=o(f,{valuePropName:`open`,trigger:`onOpenChange`,defaultValuePropName:`defaultOpen`}),y=(0,L.useDeferredValue)(g),[b,x]=(0,L.useState)(``),S=se(b),[oe,C]=(0,L.useTransition)(),w=_([n?B:null,t]),[T,E]=ee(),D=(0,L.useDeferredValue)(T),k=(0,L.useDeferredValue)(h),A=a(r(k??[])),j=e=>{if(e)return i===`id`?e.id:e.row_id??void 0},{vfolder_nodes:M}=(0,R.useLazyLoadQuery)(N,{selectedFilter:_([A.length?_(v(A,e=>`id == "${i===`id`?O(e):e}"`),`|`):null,w],`&`),first:Math.max(A.length,1),skipSelectedVFolder:A.length===0,scopeId:e?`project:${e}`:void 0},{fetchPolicy:A.length?`store-or-network`:`store-only`,fetchKey:D}),{paginationData:le,result:de,loadNext:fe,isLoadingNext:P}=ce(F,{limit:10},{filter:_([w,S?`name ilike "%${S}%"`:null]),scopeId:e?`project:${e}`:void 0,permission:te},{fetchPolicy:y?`network-only`:`store-only`,fetchKey:D},{getTotal:e=>{var t;return((t=e.vfolder_nodes)==null?void 0:t.count)??void 0},getItem:e=>{var t;return(t=e.vfolder_nodes)==null||(t=t.edges)==null?void 0:t.map(e=>e==null?void 0:e.node)},getId:e=>e==null?void 0:e.id});(0,L.useImperativeHandle)(d,()=>({refetch:()=>{C(()=>{E()})}}),[E,C]),(0,L.useEffect)(()=>{if(s&&M!=null&&M.edges){let e={};M.edges.forEach(t=>{var n;let r=j(t==null?void 0:t.node),i=t==null||(n=t.node)==null?void 0:n.name;r&&i&&(e[r]=i)}),s(e)}},[M]);let I=a(v(le,e=>{let t=j(e);if(!t)return null;let n=i===`id`?O(t):t;return{value:t,label:(e==null?void 0:e.name)??t,description:n}})),V=(()=>{let e=v(A,e=>{var t;let n=re(M==null?void 0:M.edges,t=>j(t==null?void 0:t.node)===e),r=(c==null?void 0:c[e])??(i===`id`?O(e)??e:e);return{label:(n==null||(t=n.node)==null?void 0:t.name)??r,value:e}});return l?e:e[0]??null})();return(0,z.jsx)(ue,{placeholder:m(`comp:BAIVFolderSelect.SelectFolder`),...f,multiple:l,isLoading:u||!!g&&!y||h!==k||b!==S||oe,isLoadingNext:P,total:((p=de.vfolder_nodes)==null?void 0:p.count)??void 0,options:I,value:V,onChange:e=>{let t=a(r(e??[])),n=v(t,e=>e.value);ne(l?n:n[0],l?t:t[0])},searchValue:b,onSearch:x,onOpenChange:ie,endReached:fe})}})))()}var U,pe,W,me,G,he,K,ge,q,J,Y,X,Z,Q,_e,$,ve;function ye(){return(ye=e((()=>{S(),f(),s(),j(),w(),oe(),de(),H(),p(),h(),U=t(),pe=E(),W=y(),J=[{name:`my-workspace`,row_id:`11111111-1111-1111-1111-111111111111`},{name:`team-shared-data`,row_id:`22222222-2222-2222-2222-222222222222`,permissions:[`READ`]}],Y=()=>({[J[0].row_id]:{".":[c(`models`,`DIRECTORY`,`2026-07-21T14:02:00`),c(`datasets`,`DIRECTORY`,`2026-07-18T09:45:00`),c(`outputs`,`DIRECTORY`,`2026-07-28T22:10:00`),c(`README.md`,`FILE`,`2026-07-01T11:20:00`),c(`train.py`,`FILE`,`2026-07-25T16:33:00`)],models:[c(`checkpoints`,`DIRECTORY`,`2026-07-27T03:12:00`),c(`llama-3-ft`,`DIRECTORY`,`2026-07-26T19:40:00`),c(`model_definition.yaml`,`FILE`,`2026-07-22T10:05:00`)],"models/checkpoints":[c(`epoch-001`,`DIRECTORY`,`2026-07-27T03:12:00`),c(`epoch-002`,`DIRECTORY`,`2026-07-27T09:47:00`),c(`latest.pt`,`FILE`,`2026-07-27T09:47:00`)],"models/checkpoints/epoch-001":[],"models/checkpoints/epoch-002":[],"models/llama-3-ft":[c(`adapter_config.json`,`FILE`,`2026-07-26T19:40:00`)],datasets:[c(`raw`,`DIRECTORY`,`2026-07-18T09:45:00`),c(`cleaned.parquet`,`FILE`,`2026-07-19T08:00:00`)],"datasets/raw":[],outputs:[]},[J[1].row_id]:{".":[c(`shared-corpus`,`DIRECTORY`,`2026-07-10T08:00:00`),c(`LICENSE`,`FILE`,`2026-07-02T12:00:00`)],"shared-corpus":[]}}),X={title:`Input/BAIVFolderPathPicker`,component:d,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:"\n**BAIVFolderPathPicker** is a sub path picker for a given vfolder: a select-like trigger that opens a directory-only picker modal. The vfolder itself is chosen elsewhere (e.g. a `BAIVFolderSelect`) and passed in as `vfolderUuid`. The modal's vfolder query is preloaded from the open gesture (`useQueryLoader` + transition), so the trigger shows its own `loading` state while the data is in flight.\n\nThe value is the **sub path inside the vfolder** — `''` for the vfolder root, `\"sub/path\"` below it, `undefined` while nothing is picked — so it plugs directly into a Form.Item; `value`/`onChange` follow the controllable-state convention, so the component works both controlled and uncontrolled. Files are visible but disabled inside the picker; only directories can be entered and chosen. Folder CRUD (create / rename / delete) stays available via `BAIFileExplorer`'s `directoryPicker` mode. When the vfolder changes, reset the value — a sub path only makes sense within the vfolder it was picked from.\n\n## BAI-Specific Props\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `vfolderUuid` | `string` | - | UUID of the vfolder to browse; pair with `disabled={!vfolderUuid}` until one is selected |\n| `value` | `string` | - | Selected sub path (`''` = vfolder root) |\n| `defaultValue` | `string` | - | Initial value for uncontrolled usage |\n| `onChange` | `(selectedSubPath?: string) => void` | - | Fired when a location is confirmed in the modal; the parameter is optional so a clear action can emit `undefined` |\n| `label` | `string` | \"Select a path\" | Accessible name of the trigger (visually hidden; the surrounding Form.Item renders the visible label) |\n\n> The stories run against a mock Relay environment and a mock `BAIClient`, so vfolder search, browsing, mkdir, rename and delete all work without a backend. The second folder (`team-shared-data`) is read-only — pick it in the Form story to see permission gating disable folder CRUD inside the modal.\n        "}}}},Z={name:`Basic Usage (uncontrolled)`,render:()=>{let[e,t]=(0,U.useState)();return(0,W.jsx)(m,{vfolders:J,trees:Y,children:(0,W.jsxs)(T,{direction:`column`,align:`stretch`,gap:`md`,style:{width:560},children:[(0,W.jsx)(d,{vfolderUuid:J[0].row_id,onChange:t}),(0,W.jsxs)(C,{type:`secondary`,children:[`onChange:`,` `,(0,W.jsx)(C,{code:!0,children:e===void 0?`undefined`:JSON.stringify(e)})]})]})})}},Q={name:`Within Form (with external BAIVFolderSelect)`,parameters:{docs:{description:{story:'The intended composition: a separate `BAIVFolderSelect` (with `valuePropName="row_id"` so the field holds the UUID) feeds `vfolderUuid`, and the picker plugs into its own Form.Item with `disabled={!vfolderUuid}` until a folder is chosen. Changing the vfolder resets the path field, and the required rule uses a custom validator because `""` (the vfolder root) is a valid pick.'}}},render:()=>{let[e]=x.useForm(),t=x.useWatch(`vfolderUuid`,e),[n,r]=(0,U.useState)();return(0,W.jsx)(m,{vfolders:J,trees:Y,children:(0,W.jsxs)(x,{form:e,layout:`vertical`,style:{width:560},onFinish:e=>{r(JSON.stringify(e))},children:[(0,W.jsx)(x.Item,{name:`vfolderUuid`,label:`Folder`,rules:[{required:!0}],children:(0,W.jsx)(V,{label:`Folder`,isLabelHidden:!0,valuePropName:`row_id`,onChange:()=>{e.setFieldValue(`destination`,void 0)}})}),(0,W.jsx)(x.Item,{name:`destination`,label:`Destination`,required:!0,rules:[{validator:(e,t)=>t===void 0?Promise.reject(Error(`Please select a path`)):Promise.resolve()}],children:(0,W.jsx)(d,{vfolderUuid:t,disabled:!t})}),(0,W.jsxs)(T,{direction:`column`,align:`start`,gap:`sm`,children:[(0,W.jsx)(M,{type:`primary`,onClick:()=>e.submit(),children:`Submit`}),n&&(0,W.jsxs)(C,{type:`secondary`,children:[`submitted: `,(0,W.jsx)(C,{code:!0,children:n})]})]})]})})}},_e=()=>{let[e,t]=(0,U.useState)(!1),[n,r]=(0,U.useTransition)(),[i,a]=(0,U.useState)(),[o,ee]=(0,pe.useQueryLoader)(u);return(0,W.jsxs)(T,{direction:`column`,gap:`md`,align:`start`,children:[(0,W.jsx)(M,{type:`primary`,loading:n,onClick:()=>{r(()=>{ee({vfolderId:J[0].row_id},{fetchPolicy:`store-and-network`}),t(!0)})},children:`Open directory picker`}),(0,W.jsxs)(C,{type:`secondary`,children:[`Last selection:`,` `,(0,W.jsx)(C,{code:!0,children:i===void 0?`(none)`:JSON.stringify(i)})]}),o!=null&&(0,W.jsx)(fe,{children:(0,W.jsx)(l,{open:e,vfolderUuid:J[0].row_id,queryRef:o,onRequestClose:e=>{e!==void 0&&a(e),t(!1)}})})]})},$={name:`Directory Picker Modal`,parameters:{docs:{description:{story:"`BAIDirectoryPickerModal` can also be driven directly — preload `BAIDirectoryPickerQuery` with `useQueryLoader` in the opening event (wrapped in a transition, since the modal suspends until the query resolves), pass the `queryRef`, and receive the chosen sub path via `onRequestClose` (`undefined` when cancelled)."}}},render:()=>(0,W.jsx)(m,{vfolders:J,trees:Y,children:(0,W.jsx)(_e,{})})},Z.parameters={...Z.parameters,docs:{...(me=Z.parameters)==null?void 0:me.docs,source:{originalSource:`{
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
}`,...(G=Z.parameters)==null||(G=G.docs)==null?void 0:G.source}}},Q.parameters={...Q.parameters,docs:{...(he=Q.parameters)==null?void 0:he.docs,source:{originalSource:`{
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
}`,...(K=Q.parameters)==null||(K=K.docs)==null?void 0:K.source}}},$.parameters={...$.parameters,docs:{...(ge=$.parameters)==null?void 0:ge.docs,source:{originalSource:`{
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
}`,...(q=$.parameters)==null||(q=q.docs)==null?void 0:q.source}}},ve=[`Default`,`WithinForm`,`PickerModalOnly`]})))()}ye();export{Z as Default,$ as PickerModalOnly,Q as WithinForm,ve as __namedExportsOrder,X as default};