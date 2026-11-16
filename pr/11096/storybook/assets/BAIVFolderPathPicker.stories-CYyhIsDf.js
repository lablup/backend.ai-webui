import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-DlPsW1c0.js";import{a as n,c as r,d as i,f as a,h as o,l as s,m as c,n as l,o as u,p as d,t as f,u as p}from"./MockVFolderFileProviders-CuS5CkPV.js";import{t as m}from"./jsx-runtime-MKhVqBIO.js";import{n as h,t as g}from"./Form-w-lKRWO0.js";import{h as _,m as v}from"./iframe-C67DjySv.js";import{n as y,t as b}from"./BAIFlex-DnaoYTJ1.js";import{t as x}from"./react-relay-sHama7hJ.js";import{n as S,t as C}from"./BAIButton-dUi_XO8L.js";import{n as w,t as T}from"./BAIUnmountAfterClose-BFd4mgc4.js";var E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U;function W(){return(W=e((()=>{g(),l(),n(),S(),y(),_(),w(),o(),d(),p(),E=t(),D=x(),O=m(),F=`00000000-0000-0000-0000-000000000001`,I=[{name:`my-workspace`,row_id:`11111111-1111-1111-1111-111111111111`},{name:`team-shared-data`,row_id:`22222222-2222-2222-2222-222222222222`,permissions:[`READ`]}],L=()=>({[I[0].row_id]:{".":[r(`models`,`DIRECTORY`,`2026-07-21T14:02:00`),r(`datasets`,`DIRECTORY`,`2026-07-18T09:45:00`),r(`outputs`,`DIRECTORY`,`2026-07-28T22:10:00`),r(`README.md`,`FILE`,`2026-07-01T11:20:00`),r(`train.py`,`FILE`,`2026-07-25T16:33:00`)],models:[r(`checkpoints`,`DIRECTORY`,`2026-07-27T03:12:00`),r(`llama-3-ft`,`DIRECTORY`,`2026-07-26T19:40:00`),r(`model_definition.yaml`,`FILE`,`2026-07-22T10:05:00`)],"models/checkpoints":[r(`epoch-001`,`DIRECTORY`,`2026-07-27T03:12:00`),r(`epoch-002`,`DIRECTORY`,`2026-07-27T09:47:00`),r(`latest.pt`,`FILE`,`2026-07-27T09:47:00`)],"models/checkpoints/epoch-001":[],"models/checkpoints/epoch-002":[],"models/llama-3-ft":[r(`adapter_config.json`,`FILE`,`2026-07-26T19:40:00`)],datasets:[r(`raw`,`DIRECTORY`,`2026-07-18T09:45:00`),r(`cleaned.parquet`,`FILE`,`2026-07-19T08:00:00`)],"datasets/raw":[],outputs:[]},[I[1].row_id]:{".":[r(`shared-corpus`,`DIRECTORY`,`2026-07-10T08:00:00`),r(`LICENSE`,`FILE`,`2026-07-02T12:00:00`)],"shared-corpus":[]}}),R={title:`Input/BAIVFolderPathPicker`,component:s,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:"\n**BAIVFolderPathPicker** is a sub path picker for a given vfolder: a select-like trigger that opens a directory-only picker modal. The vfolder itself is chosen elsewhere (e.g. a `BAIScopedVFolderSelect`) and passed in as `vfolderUuid`. The modal's vfolder query is preloaded from the open gesture (`useQueryLoader` + transition), so the trigger shows its own `loading` state while the data is in flight.\n\nThe value is the **sub path inside the vfolder** — `''` for the vfolder root, `\"sub/path\"` below it, `undefined` while nothing is picked — so it plugs directly into a Form.Item; `value`/`onChange` follow the controllable-state convention, so the component works both controlled and uncontrolled. Files are visible but disabled inside the picker; only directories can be entered and chosen. Folder CRUD (create / rename / delete) stays available via `BAIFileExplorer`'s `directoryPicker` mode. When the vfolder changes, reset the value — a sub path only makes sense within the vfolder it was picked from.\n\n## BAI-Specific Props\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `vfolderUuid` | `string` | - | UUID of the vfolder to browse; pair with `disabled={!vfolderUuid}` until one is selected |\n| `value` | `string` | - | Selected sub path (`''` = vfolder root) |\n| `defaultValue` | `string` | - | Initial value for uncontrolled usage |\n| `onChange` | `(selectedSubPath?: string) => void` | - | Fired when a location is confirmed in the modal; the parameter is optional so a clear action can emit `undefined` |\n| `label` | `string` | \"Select a path\" | Accessible name of the trigger (visually hidden; the surrounding Form.Item renders the visible label) |\n\n> The stories run against a mock Relay environment and a mock `BAIClient`, so vfolder search, browsing, mkdir, rename and delete all work without a backend. The second folder (`team-shared-data`) is read-only — pick it in the Form story to see permission gating disable folder CRUD inside the modal.\n        "}}}},z={name:`Basic Usage (uncontrolled)`,render:()=>{let[e,t]=(0,E.useState)();return(0,O.jsx)(f,{vfolders:I,trees:L,children:(0,O.jsxs)(b,{direction:`column`,align:`stretch`,gap:`md`,style:{width:560},children:[(0,O.jsx)(s,{vfolderUuid:I[0].row_id,onChange:t}),(0,O.jsxs)(v,{type:`secondary`,children:[`onChange:`,` `,(0,O.jsx)(v,{code:!0,children:e===void 0?`undefined`:JSON.stringify(e)})]})]})})}},B={name:`Within Form (with external BAIScopedVFolderSelect)`,parameters:{docs:{description:{story:'The intended composition: a separate `BAIScopedVFolderSelect` (its value is the folder UUID) feeds `vfolderUuid`, and the picker plugs into its own Form.Item with `disabled={!vfolderUuid}` until a folder is chosen. Changing the vfolder resets the path field, and the required rule uses a custom validator because `""` (the vfolder root) is a valid pick.'}}},render:()=>{let[e]=h.useForm(),t=h.useWatch(`vfolderUuid`,e),[n,r]=(0,E.useState)();return(0,O.jsx)(f,{vfolders:I,folders:I.map(({row_id:e,name:t})=>u({id:e,name:t})),trees:L,children:(0,O.jsxs)(h,{form:e,layout:`vertical`,style:{width:560},onFinish:e=>{r(JSON.stringify(e))},children:[(0,O.jsx)(h.Item,{name:`vfolderUuid`,label:`Folder`,rules:[{required:!0}],children:(0,O.jsx)(c,{label:`Folder`,isLabelHidden:!0,scope:{user:[{value:F}]},onChange:()=>{e.setFieldValue(`destination`,void 0)}})}),(0,O.jsx)(h.Item,{name:`destination`,label:`Destination`,required:!0,rules:[{validator:(e,t)=>t===void 0?Promise.reject(Error(`Please select a path`)):Promise.resolve()}],children:(0,O.jsx)(s,{vfolderUuid:t,disabled:!t})}),(0,O.jsxs)(b,{direction:`column`,align:`start`,gap:`sm`,children:[(0,O.jsx)(C,{type:`primary`,onClick:()=>e.submit(),children:`Submit`}),n&&(0,O.jsxs)(v,{type:`secondary`,children:[`submitted: `,(0,O.jsx)(v,{code:!0,children:n})]})]})]})})}},V=()=>{let[e,t]=(0,E.useState)(!1),[n,r]=(0,E.useTransition)(),[o,s]=(0,E.useState)(),[c,l]=(0,D.useQueryLoader)(a);return(0,O.jsxs)(b,{direction:`column`,gap:`md`,align:`start`,children:[(0,O.jsx)(C,{type:`primary`,loading:n,onClick:()=>{r(()=>{l({vfolderId:I[0].row_id},{fetchPolicy:`store-and-network`}),t(!0)})},children:`Open directory picker`}),(0,O.jsxs)(v,{type:`secondary`,children:[`Last selection:`,` `,(0,O.jsx)(v,{code:!0,children:o===void 0?`(none)`:JSON.stringify(o)})]}),c!=null&&(0,O.jsx)(T,{children:(0,O.jsx)(i,{open:e,vfolderUuid:I[0].row_id,queryRef:c,onRequestClose:e=>{e!==void 0&&s(e),t(!1)}})})]})},H={name:`Directory Picker Modal`,parameters:{docs:{description:{story:"`BAIDirectoryPickerModal` can also be driven directly — preload `BAIDirectoryPickerQuery` with `useQueryLoader` in the opening event (wrapped in a transition, since the modal suspends until the query resolves), pass the `queryRef`, and receive the chosen sub path via `onRequestClose` (`undefined` when cancelled)."}}},render:()=>(0,O.jsx)(f,{vfolders:I,trees:L,children:(0,O.jsx)(V,{})})},z.parameters={...z.parameters,docs:{...(k=z.parameters)==null?void 0:k.docs,source:{originalSource:`{
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
}`,...(A=z.parameters)==null||(A=A.docs)==null?void 0:A.source}}},B.parameters={...B.parameters,docs:{...(j=B.parameters)==null?void 0:j.docs,source:{originalSource:`{
  name: 'Within Form (with external BAIScopedVFolderSelect)',
  parameters: {
    docs: {
      description: {
        story: 'The intended composition: a separate \`BAIScopedVFolderSelect\` (its value is the folder UUID) feeds \`vfolderUuid\`, and the picker plugs into its own Form.Item with \`disabled={!vfolderUuid}\` until a folder is chosen. Changing the vfolder resets the path field, and the required rule uses a custom validator because \`""\` (the vfolder root) is a valid pick.'
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
            <BAIScopedVFolderSelect label="Folder" isLabelHidden scope={{
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
}`,...(M=B.parameters)==null||(M=M.docs)==null?void 0:M.source}}},H.parameters={...H.parameters,docs:{...(N=H.parameters)==null?void 0:N.docs,source:{originalSource:`{
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
}`,...(P=H.parameters)==null||(P=P.docs)==null?void 0:P.source}}},U=[`Default`,`WithinForm`,`PickerModalOnly`]})))()}W();export{z as Default,H as PickerModalOnly,B as WithinForm,U as __namedExportsOrder,R as default};