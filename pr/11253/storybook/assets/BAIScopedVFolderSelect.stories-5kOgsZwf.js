import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-DlPsW1c0.js";import{a as n,f as r,i,n as a,o,p as s,r as c,s as l,t as ee}from"./MockVFolderFileProviders-CS5AuBjM.js";import{t as u}from"./jsx-runtime-MKhVqBIO.js";import{h as d,m as te}from"./iframe-iQXj_cRb.js";import{n as ne,t as f}from"./BAIFlex-DnaoYTJ1.js";import{n as re,t as ie}from"./useMountableVFolders-XTLZ8hIa.js";import{n as ae,t as oe}from"./BAIButton-DIw4KWW-.js";var p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q;function $(){return($=e((()=>{ie(),a(),n(),ae(),ne(),d(),s(),p=t(),m=u(),{action:F}=__STORYBOOK_MODULE_ACTIONS__,I=420,L=[o({id:`aaaaaaaa-bbbb-cccc-dddd-eeeeffff0014`,name:`llama-checkpoint`,usageMode:`MODEL`,createdAt:`2026-08-05T09:00:00+00:00`}),o({id:`aaaaaaaa-bbbb-cccc-dddd-eeeeffff0013`,name:`invited-no-mount`,permission:`NONE`,createdAt:`2026-08-04T09:00:00+00:00`}),o({id:`aaaaaaaa-bbbb-cccc-dddd-eeeeffff0012`,name:`team-scratch`,permission:`READ_WRITE`,ownershipType:`GROUP`,projectId:i.project[0].value,creatorEmail:`teammate@lablup.com`,createdAt:`2026-08-03T09:00:00+00:00`}),o({id:`aaaaaaaa-bbbb-cccc-dddd-eeeeffff0011`,name:`read-only-reference`,permission:`READ_ONLY`,createdAt:`2026-08-02T09:00:00+00:00`}),...l],R=e=>L.find(t=>t.name===e),z=re(c),B=({scope:e=i,initialValue:t=null,folders:n=L,...a})=>{let[o,s]=(0,p.useState)(t),[c,l]=(0,p.useState)(),u=(0,p.useRef)(null);return(0,m.jsx)(ee,{folders:n,suspenseFallback:`Loading...`,children:(0,m.jsxs)(f,{direction:`column`,align:`stretch`,gap:`md`,style:{width:I},children:[(0,m.jsx)(r,{...a,ref:u,scope:e,value:o,onChange:(e,t)=>{s(e??null),F(`onChange`)(e,t)},onResolve:e=>{l(e),F(`onResolve`)(e)}}),(0,m.jsx)(f,{gap:`xs`,children:(0,m.jsx)(oe,{onClick:()=>{var e;return(e=u.current)==null?void 0:e.refetch()},children:`Refetch via ref`})}),(0,m.jsx)(te,{type:`secondary`,code:!0,children:JSON.stringify({value:o,resolved:c==null?void 0:c.resolved.map(e=>e.name),unresolved:c==null?void 0:c.unresolved},null,2)})]})})},V={title:`Fragments/BAIScopedVFolderSelect`,component:r,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:"\n**BAIScopedVFolderSelect** — the virtual folder picker, built on `BAIComplexSelect` and paged through `scopedVFoldersV2` (manager 26.9.0).\n\n- `scope` (required): the `VFolderScope` input (`user`, `project`, `domain` lists, ORed). A scope whose lists are all empty reads nothing.\n- `filter`: ANDed onto the options **and** the lookup of selected ids; a selected folder outside it is reported unresolved.\n- `optionFilter`: ANDed onto the options only; a selected folder it hides stays selected and resolved.\n- `disableUnmountable`: lists a folder whose mount level is `NONE` as disabled and reports a matching selection unresolved.\n- `fallbackLabels` / `onResolve`: name an id the scope no longer reaches, and learn which selected ids are still reachable.\n- The value is folder UUIDs (`VFolder.entityId`). The selected-value lookup suspends on first load, so the caller owns the Suspense boundary.\n\nThe stories answer from an in-memory folder list; the panel under each select shows the value and the last `onResolve` outcome.\n        "}}},argTypes:{value:{control:!1},onChange:{control:!1},onResolve:{control:!1},scope:{control:!1},filter:{control:!1},optionFilter:{control:!1},fallbackLabels:{control:!1},multiple:{control:{type:`boolean`}},disableUnmountable:{control:{type:`boolean`}}}},H={parameters:{docs:{description:{story:"The user folders and the current project's folders, newest first. Each option shows the creator, usage mode, host and creation date, and the caller's mount level as R/W/D tokens. `other-team-data` belongs to another project, so the scope leaves it out."}}},render:e=>(0,m.jsx)(B,{...e,label:`Folder`})},U={name:`Session mount folders`,parameters:{docs:{description:{story:"The session launcher's setup: `filter` keeps folders on hosts that grant `mount-in-session` (so `cold-archive` is gone), `optionFilter` hides dotfile folders, and `disableUnmountable` lists `invited-no-mount` disabled with the reason."}}},render:e=>(0,m.jsx)(B,{...e,label:`Folders`,multiple:!0,filter:z,optionFilter:{AND:[{status:{equals:`READY`}},{name:{notStartsWith:`.`}}]},disableUnmountable:!0})},W={name:`Multiple Select`,parameters:{docs:{description:{story:`Multi-selection: the value is an array of folder UUIDs, and the selected ids are labelled by the value lookup before the popup is opened.`}}},render:e=>(0,m.jsx)(B,{...e,label:`Folders`,multiple:!0,initialValue:[R(`my-project-data`).id,R(`shared-datasets`).id]})},G={name:`Model folder`,parameters:{docs:{description:{story:"A single model folder, as a deployment form picks it: `filter` narrows the folders to `usageMode: MODEL`."}}},render:e=>(0,m.jsx)(B,{...e,label:`Model folder`,filter:{AND:[z,{usageMode:{equals:`MODEL`}}]}})},K={name:`Selection hidden by optionFilter`,parameters:{docs:{description:{story:"`.config` is selected but `optionFilter` keeps dotfile folders out of the list. The lookup still finds it within `filter`, so it keeps its name and is reported resolved."}}},render:e=>(0,m.jsx)(B,{...e,label:`Folders`,multiple:!0,filter:z,optionFilter:{name:{notStartsWith:`.`}},initialValue:[R(`.config`).id]})},q={name:`Unresolved selection`,parameters:{docs:{description:{story:"`cold-archive` is on a host `filter` rejects and `invited-no-mount` fails `disableUnmountable`, so both are reported unresolved while `my-project-data` resolves. `fallbackLabels` keeps `cold-archive` from showing as a bare UUID; `invited-no-mount` is still found by the lookup, so it keeps its own name."}}},render:e=>(0,m.jsx)(B,{...e,label:`Folders`,multiple:!0,filter:z,disableUnmountable:!0,initialValue:[R(`my-project-data`).id,R(`cold-archive`).id,R(`invited-no-mount`).id],fallbackLabels:{[R(`cold-archive`).id]:`cold-archive (stored)`,[R(`invited-no-mount`).id]:`invited-no-mount (stored)`}})},J={name:`No scope yet`,parameters:{docs:{description:{story:`A caller without a range yet passes empty scope lists and disables the select; nothing is read.`}}},render:e=>(0,m.jsx)(B,{...e,label:`Folder`,scope:{project:[]},isDisabled:!0})},Y={parameters:{docs:{description:{story:`No folder matches — the popup shows the shared empty-state text.`}}},render:e=>(0,m.jsx)(B,{...e,label:`Folder`,folders:[]})},X={parameters:{docs:{description:{story:"Caller-side `isLoading`, which spins the trigger the same way the internal search debounce and refetch states do."}}},render:e=>(0,m.jsx)(B,{...e,label:`Folder`,isLoading:!0,isDisabled:!0})},Z={parameters:{docs:{description:{story:"The error status a form item sets when its `required` rule fails."}}},render:e=>(0,m.jsx)(B,{...e,label:`Folder`,status:{type:`error`,message:`Please select a folder.`}})},H.parameters={...H.parameters,docs:{...(h=H.parameters)==null?void 0:h.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "The user folders and the current project's folders, newest first. Each option shows the creator, usage mode, host and creation date, and the caller's mount level as R/W/D tokens. \`other-team-data\` belongs to another project, so the scope leaves it out."
      }
    }
  },
  render: args => <Sandbox {...args} label="Folder" />
}`,...(g=H.parameters)==null||(g=g.docs)==null?void 0:g.source}}},U.parameters={...U.parameters,docs:{...(_=U.parameters)==null?void 0:_.docs,source:{originalSource:`{
  name: 'Session mount folders',
  parameters: {
    docs: {
      description: {
        story: "The session launcher's setup: \`filter\` keeps folders on hosts that grant \`mount-in-session\` (so \`cold-archive\` is gone), \`optionFilter\` hides dotfile folders, and \`disableUnmountable\` lists \`invited-no-mount\` disabled with the reason."
      }
    }
  },
  render: args => <Sandbox {...args} label="Folders" multiple filter={mountFilter} optionFilter={{
    AND: [{
      status: {
        equals: 'READY'
      }
    }, {
      name: {
        notStartsWith: '.'
      }
    }]
  }} disableUnmountable />
}`,...(v=U.parameters)==null||(v=v.docs)==null?void 0:v.source}}},W.parameters={...W.parameters,docs:{...(y=W.parameters)==null?void 0:y.docs,source:{originalSource:`{
  name: 'Multiple Select',
  parameters: {
    docs: {
      description: {
        story: 'Multi-selection: the value is an array of folder UUIDs, and the selected ids are labelled by the value lookup before the popup is opened.'
      }
    }
  },
  render: args => <Sandbox {...args} label="Folders" multiple initialValue={[folderByName('my-project-data').id, folderByName('shared-datasets').id]} />
}`,...(b=W.parameters)==null||(b=b.docs)==null?void 0:b.source}}},G.parameters={...G.parameters,docs:{...(x=G.parameters)==null?void 0:x.docs,source:{originalSource:`{
  name: 'Model folder',
  parameters: {
    docs: {
      description: {
        story: 'A single model folder, as a deployment form picks it: \`filter\` narrows the folders to \`usageMode: MODEL\`.'
      }
    }
  },
  render: args => <Sandbox {...args} label="Model folder" filter={{
    AND: [mountFilter, {
      usageMode: {
        equals: 'MODEL'
      }
    }]
  }} />
}`,...(S=G.parameters)==null||(S=S.docs)==null?void 0:S.source}}},K.parameters={...K.parameters,docs:{...(C=K.parameters)==null?void 0:C.docs,source:{originalSource:`{
  name: 'Selection hidden by optionFilter',
  parameters: {
    docs: {
      description: {
        story: '\`.config\` is selected but \`optionFilter\` keeps dotfile folders out of the list. The lookup still finds it within \`filter\`, so it keeps its name and is reported resolved.'
      }
    }
  },
  render: args => <Sandbox {...args} label="Folders" multiple filter={mountFilter} optionFilter={{
    name: {
      notStartsWith: '.'
    }
  }} initialValue={[folderByName('.config').id]} />
}`,...(w=K.parameters)==null||(w=w.docs)==null?void 0:w.source}}},q.parameters={...q.parameters,docs:{...(T=q.parameters)==null?void 0:T.docs,source:{originalSource:"{\n  name: 'Unresolved selection',\n  parameters: {\n    docs: {\n      description: {\n        story: '`cold-archive` is on a host `filter` rejects and `invited-no-mount` fails `disableUnmountable`, so both are reported unresolved while `my-project-data` resolves. `fallbackLabels` keeps `cold-archive` from showing as a bare UUID; `invited-no-mount` is still found by the lookup, so it keeps its own name.'\n      }\n    }\n  },\n  render: args => <Sandbox {...args} label=\"Folders\" multiple filter={mountFilter} disableUnmountable initialValue={[folderByName('my-project-data').id, folderByName('cold-archive').id, folderByName('invited-no-mount').id]} fallbackLabels={{\n    [folderByName('cold-archive').id]: 'cold-archive (stored)',\n    [folderByName('invited-no-mount').id]: 'invited-no-mount (stored)'\n  }} />\n}",...(E=q.parameters)==null||(E=E.docs)==null?void 0:E.source}}},J.parameters={...J.parameters,docs:{...(D=J.parameters)==null?void 0:D.docs,source:{originalSource:`{
  name: 'No scope yet',
  parameters: {
    docs: {
      description: {
        story: 'A caller without a range yet passes empty scope lists and disables the select; nothing is read.'
      }
    }
  },
  render: args => <Sandbox {...args} label="Folder" scope={{
    project: []
  }} isDisabled />
}`,...(O=J.parameters)==null||(O=O.docs)==null?void 0:O.source}}},Y.parameters={...Y.parameters,docs:{...(k=Y.parameters)==null?void 0:k.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'No folder matches — the popup shows the shared empty-state text.'
      }
    }
  },
  render: args => <Sandbox {...args} label="Folder" folders={[]} />
}`,...(A=Y.parameters)==null||(A=A.docs)==null?void 0:A.source}}},X.parameters={...X.parameters,docs:{...(j=X.parameters)==null?void 0:j.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Caller-side \`isLoading\`, which spins the trigger the same way the internal search debounce and refetch states do.'
      }
    }
  },
  render: args => <Sandbox {...args} label="Folder" isLoading isDisabled />
}`,...(M=X.parameters)==null||(M=M.docs)==null?void 0:M.source}}},Z.parameters={...Z.parameters,docs:{...(N=Z.parameters)==null?void 0:N.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'The error status a form item sets when its \`required\` rule fails.'
      }
    }
  },
  render: args => <Sandbox {...args} label="Folder" status={{
    type: 'error',
    message: 'Please select a folder.'
  }} />
}`,...(P=Z.parameters)==null||(P=P.docs)==null?void 0:P.source}}},Q=[`Default`,`SessionMountFolders`,`Multiple`,`ModelFolder`,`HiddenSelection`,`UnresolvedSelection`,`NoScope`,`Empty`,`Loading`,`Error`]})))()}$();export{H as Default,Y as Empty,Z as Error,K as HiddenSelection,X as Loading,G as ModelFolder,W as Multiple,J as NoScope,U as SessionMountFolders,q as UnresolvedSelection,Q as __namedExportsOrder,V as default};