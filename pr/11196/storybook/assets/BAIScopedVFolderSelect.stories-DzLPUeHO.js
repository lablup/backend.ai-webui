import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-DlPsW1c0.js";import{a as n,c as r,i,m as a,n as o,o as s,p as c,r as l,s as u,t as d}from"./MockVFolderFileProviders-DbDffiPU.js";import{t as f}from"./jsx-runtime-MKhVqBIO.js";import{t as p}from"./compiler-runtime-DU4U6aph.js";import{h as m,m as h}from"./iframe-DIwYitl4.js";import{n as g,t as _}from"./BAIFlex-DnaoYTJ1.js";import{n as v,r as y,t as b}from"./useMountableVFolders-oRoz3yWL.js";import{n as x,t as S}from"./BAIButton-7DxxWwyk.js";function C(e){return e.name}var w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K;function q(){return(q=e((()=>{w=p(),b(),o(),s(),x(),g(),m(),a(),T=t(),E=f(),{action:D}=__STORYBOOK_MODULE_ACTIONS__,O=420,k=[u({id:`aaaaaaaa-bbbb-cccc-dddd-eeeeffff0016`,name:`restoring-data`,status:`PROVISIONING`,createdAt:`2026-08-07T09:00:00+00:00`}),u({id:`aaaaaaaa-bbbb-cccc-dddd-eeeeffff0015`,name:`trashed-checkpoint`,usageMode:`MODEL`,status:`DELETE_PENDING`,createdAt:`2026-08-06T09:00:00+00:00`}),u({id:`aaaaaaaa-bbbb-cccc-dddd-eeeeffff0014`,name:`llama-checkpoint`,usageMode:`MODEL`,createdAt:`2026-08-05T09:00:00+00:00`}),u({id:`aaaaaaaa-bbbb-cccc-dddd-eeeeffff0013`,name:`invited-no-mount`,permission:`NONE`,createdAt:`2026-08-04T09:00:00+00:00`}),u({id:`aaaaaaaa-bbbb-cccc-dddd-eeeeffff0012`,name:`team-scratch`,permission:`READ_WRITE`,ownershipType:`GROUP`,projectId:n,creatorEmail:`teammate@lablup.com`,createdAt:`2026-08-03T09:00:00+00:00`}),u({id:`aaaaaaaa-bbbb-cccc-dddd-eeeeffff0011`,name:`read-only-reference`,permission:`READ_ONLY`,createdAt:`2026-08-02T09:00:00+00:00`}),...r],A=Array.from({length:45},(e,t)=>{let n=45-t;return u({id:`bbbbbbbb-0000-4000-8000-${String(n).padStart(12,`0`)}`,name:`experiment-${String(n).padStart(2,`0`)}`,createdAt:new Date(Date.UTC(2026,6,1+n,9)).toISOString()})}),j=e=>{let t=k.find(t=>t.name===e);if(!t)throw new globalThis.Error(`No story folder named "${e}"`);return t},M=v(l),N=e=>{"use memo";let t=(0,w.c)(38),n,r,a,o;t[0]===e?(n=t[1],r=t[2],a=t[3],o=t[4]):({scope:r,initialValue:a,folders:o,...n}=e,t[0]=e,t[1]=n,t[2]=r,t[3]=a,t[4]=o);let s=r===void 0?i:r,l=a===void 0?null:a,u=o===void 0?k:o,[f,p]=(0,T.useState)(l),[m,g]=(0,T.useState)(),v;t[5]!==n.multiple||t[6]!==f?(v=n.multiple?f==null?[]:[f].flat():Array.isArray(f)?f[0]??null:f,t[5]=n.multiple,t[6]=f,t[7]=v):v=t[7];let y=v,b=(0,T.useRef)(null),x=n.width??O,A,j;t[8]===Symbol.for(`react.memo_cache_sentinel`)?(A=(e,t)=>{p(e??null),D(`onChange`)(e,t)},j=e=>{g(e),D(`onResolve`)(e)},t[8]=A,t[9]=j):(A=t[8],j=t[9]);let M;t[10]!==n||t[11]!==s||t[12]!==y||t[13]!==x?(M=(0,E.jsx)(c,{...n,width:x,ref:b,scope:s,value:y,onChange:A,onResolve:j}),t[10]=n,t[11]=s,t[12]=y,t[13]=x,t[14]=M):M=t[14];let N;t[15]===Symbol.for(`react.memo_cache_sentinel`)?(N=(0,E.jsx)(S,{onClick:()=>b.current?.refetch(),children:`Refetch via ref`}),t[15]=N):N=t[15];let P;t[16]===y?P=t[17]:(P=JSON.stringify(y),t[16]=y,t[17]=P);let F;t[18]===P?F=t[19]:(F=(0,E.jsxs)(h,{type:`secondary`,code:!0,children:[`value: `,P]}),t[18]=P,t[19]=F);let I;t[20]===m?.resolved?I=t[21]:(I=JSON.stringify(m?.resolved.map(C)??[]),t[20]=m?.resolved,t[21]=I);let L;t[22]===I?L=t[23]:(L=(0,E.jsxs)(h,{type:`secondary`,code:!0,children:[`resolved:`,` `,I]}),t[22]=I,t[23]=L);let R;t[24]===m?.unresolved?R=t[25]:(R=JSON.stringify(m?.unresolved??[]),t[24]=m?.unresolved,t[25]=R);let z;t[26]===R?z=t[27]:(z=(0,E.jsxs)(h,{type:`secondary`,code:!0,children:[`unresolved: `,R]}),t[26]=R,t[27]=z);let B;t[28]!==F||t[29]!==L||t[30]!==z?(B=(0,E.jsxs)(_,{direction:`column`,align:`start`,gap:`xxs`,children:[F,L,z]}),t[28]=F,t[29]=L,t[30]=z,t[31]=B):B=t[31];let V;t[32]!==B||t[33]!==M?(V=(0,E.jsxs)(_,{direction:`column`,align:`start`,gap:`md`,children:[M,N,B]}),t[32]=B,t[33]=M,t[34]=V):V=t[34];let H;return t[35]!==u||t[36]!==V?(H=(0,E.jsx)(d,{folders:u,suspenseFallback:`Loading...`,children:V}),t[35]=u,t[36]=V,t[37]=H):H=t[37],H},P={title:`Fragments/BAIScopedVFolderSelect`,component:c,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:"\n**BAIScopedVFolderSelect** — the virtual folder picker, built on `BAIComplexSelect` and paged through `scopedVFoldersV2` (manager 26.9.0; the selected-value lookup filters on `VFolderFilter.entityId`, which needs manager 26.10.0).\n\n- `scope` (required): the `VFolderScope` input (`user`, `project`, `domain` lists, ORed). A scope whose lists are all empty reads nothing.\n- `filter`: ANDed onto the options **and** the lookup of selected ids; a selected folder outside it is reported unresolved.\n- `optionFilter`: ANDed onto the options only; a selected folder it hides stays selected and resolved.\n- `disableUnmountable`: lists a folder whose mount level is `NONE` as disabled and reports a matching selection unresolved.\n- `fallbackLabels` / `onResolve`: name an id the scope no longer reaches, and learn which selected ids are still reachable.\n- The value is folder UUIDs (`VFolder.entityId`). The selected-value lookup suspends on first load, so the caller owns the Suspense boundary.\n\nThe options are read only once the popup opens, so click a select to see its list. The lines under each select show the value and the last `onResolve` outcome.\n        "}}},argTypes:{value:{control:!1},onChange:{control:!1},onResolve:{control:!1},scope:{control:!1},filter:{control:!1},optionFilter:{control:!1},fallbackLabels:{control:!1},multiple:{control:{type:`boolean`}},disableUnmountable:{control:{type:`boolean`}}}},F={name:`Basic`,parameters:{docs:{description:{story:"The user folders and the current project's folders, newest first. Each option shows the creator, usage mode, host and creation date, and the caller's mount level as R/W/D tokens. `other-team-data` belongs to another project, so the scope leaves it out."}}},render:e=>(0,E.jsx)(N,{...e,label:`Folder`})},I={name:`Session mount folders`,args:{multiple:!0,disableUnmountable:!0},parameters:{docs:{description:{story:"Folders a session may mount: `filter` keeps folders on hosts that grant `mount-in-session` (so `cold-archive` is gone), `optionFilter` hides dotfile folders and folders that are not ready (`restoring-data`), and `disableUnmountable` lists `invited-no-mount` disabled with the reason."}}},render:e=>(0,E.jsx)(N,{...e,label:`Folders`,filter:M,optionFilter:{AND:[{status:{equals:`READY`}},{name:{notStartsWith:`.`}}]}})},L={name:`Multiple Select`,args:{multiple:!0},parameters:{docs:{description:{story:`Multi-selection: the value is an array of folder UUIDs, and the selected ids are labelled by the value lookup before the popup is opened.`}}},render:e=>(0,E.jsx)(N,{...e,label:`Folders`,initialValue:[j(`my-project-data`).id,j(`shared-datasets`).id]})},R={name:`Model folder`,parameters:{docs:{description:{story:"A single model folder, as the deployment form picks it: `filter` keeps `usageMode: MODEL` and leaves out folders being deleted, so `trashed-checkpoint` (in the trash) is not offered."}}},render:e=>(0,E.jsx)(N,{...e,label:`Model folder`,filter:{AND:[y,{usageMode:{equals:`MODEL`}}]}})},z={name:`Selection hidden by optionFilter`,args:{multiple:!0},parameters:{docs:{description:{story:"`.config` is selected but `optionFilter` keeps dotfile folders out of the list. The lookup still finds it within `filter`, so it keeps its name and is reported resolved."}}},render:e=>(0,E.jsx)(N,{...e,label:`Folders`,filter:M,optionFilter:{name:{notStartsWith:`.`}},initialValue:[j(`.config`).id]})},B={name:`Unresolved selection`,args:{multiple:!0,disableUnmountable:!0},parameters:{docs:{description:{story:"`cold-archive` is on a host `filter` rejects and `invited-no-mount` fails `disableUnmountable`, so both are reported unresolved while `my-project-data` resolves. `fallbackLabels` keeps `cold-archive` from showing as a bare UUID; `invited-no-mount` is still found by the lookup, so it keeps its own name."}}},render:e=>(0,E.jsx)(N,{...e,label:`Folders`,filter:M,initialValue:[j(`my-project-data`).id,j(`cold-archive`).id,j(`invited-no-mount`).id],fallbackLabels:{[j(`cold-archive`).id]:`cold-archive (stored)`,[j(`invited-no-mount`).id]:`invited-no-mount (stored)`}})},V={name:`Paging and search`,parameters:{docs:{description:{story:"45 folders, read 20 at a time: scrolling to the end of the list loads the next page. Typing in the search box filters on the server by name (`iContains`), e.g. `experiment-4`."}}},render:e=>(0,E.jsx)(N,{...e,label:`Folder`,folders:A})},H={name:`No scope yet`,parameters:{docs:{description:{story:`A caller without a range yet passes empty scope lists and disables the select; nothing is read.`}}},render:e=>(0,E.jsx)(N,{...e,label:`Folder`,scope:{project:[]},isDisabled:!0})},U={name:`EmptyState`,parameters:{docs:{description:{story:`No folder matches — opening the popup shows the shared empty-state text.`}}},render:e=>(0,E.jsx)(N,{...e,label:`Folder`,folders:[]})},W={name:`LoadingState`,parameters:{docs:{description:{story:"Caller-side `isLoading`, which spins the trigger the same way the internal search debounce and refetch states do."}}},render:e=>(0,E.jsx)(N,{...e,label:`Folder`,isLoading:!0,isDisabled:!0})},G={name:`ErrorState`,parameters:{docs:{description:{story:"The select's own `status`: a red border and the message under the control, for a caller that validates the pick itself. Inside a Form.Item the item shows its rule message instead."}}},render:e=>(0,E.jsx)(N,{...e,label:`Folder`,status:{type:`error`,message:`Please select a folder.`}})},K=[`Default`,`SessionMountFolders`,`Multiple`,`ModelFolder`,`HiddenSelection`,`UnresolvedSelection`,`Paging`,`NoScope`,`Empty`,`Loading`,`Error`],F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: "The user folders and the current project's folders, newest first. Each option shows the creator, usage mode, host and creation date, and the caller's mount level as R/W/D tokens. \`other-team-data\` belongs to another project, so the scope leaves it out."
      }
    }
  },
  render: args => <Sandbox {...args} label="Folder" />
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  name: 'Session mount folders',
  args: {
    multiple: true,
    disableUnmountable: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Folders a session may mount: \`filter\` keeps folders on hosts that grant \`mount-in-session\` (so \`cold-archive\` is gone), \`optionFilter\` hides dotfile folders and folders that are not ready (\`restoring-data\`), and \`disableUnmountable\` lists \`invited-no-mount\` disabled with the reason.'
      }
    }
  },
  render: args => <Sandbox {...args} label="Folders" filter={mountFilter} optionFilter={{
    AND: [{
      status: {
        equals: 'READY'
      }
    }, {
      name: {
        notStartsWith: '.'
      }
    }]
  }} />
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  name: 'Multiple Select',
  args: {
    multiple: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Multi-selection: the value is an array of folder UUIDs, and the selected ids are labelled by the value lookup before the popup is opened.'
      }
    }
  },
  render: args => <Sandbox {...args} label="Folders" initialValue={[folderByName('my-project-data').id, folderByName('shared-datasets').id]} />
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  name: 'Model folder',
  parameters: {
    docs: {
      description: {
        story: 'A single model folder, as the deployment form picks it: \`filter\` keeps \`usageMode: MODEL\` and leaves out folders being deleted, so \`trashed-checkpoint\` (in the trash) is not offered.'
      }
    }
  },
  render: args => <Sandbox {...args} label="Model folder" filter={{
    AND: [notDeletedVFolderFilter, {
      usageMode: {
        equals: 'MODEL'
      }
    }]
  }} />
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  name: 'Selection hidden by optionFilter',
  args: {
    multiple: true
  },
  parameters: {
    docs: {
      description: {
        story: '\`.config\` is selected but \`optionFilter\` keeps dotfile folders out of the list. The lookup still finds it within \`filter\`, so it keeps its name and is reported resolved.'
      }
    }
  },
  render: args => <Sandbox {...args} label="Folders" filter={mountFilter} optionFilter={{
    name: {
      notStartsWith: '.'
    }
  }} initialValue={[folderByName('.config').id]} />
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  name: 'Unresolved selection',
  args: {
    multiple: true,
    disableUnmountable: true
  },
  parameters: {
    docs: {
      description: {
        story: '\`cold-archive\` is on a host \`filter\` rejects and \`invited-no-mount\` fails \`disableUnmountable\`, so both are reported unresolved while \`my-project-data\` resolves. \`fallbackLabels\` keeps \`cold-archive\` from showing as a bare UUID; \`invited-no-mount\` is still found by the lookup, so it keeps its own name.'
      }
    }
  },
  render: args => <Sandbox {...args} label="Folders" filter={mountFilter} initialValue={[folderByName('my-project-data').id, folderByName('cold-archive').id, folderByName('invited-no-mount').id]} fallbackLabels={{
    [folderByName('cold-archive').id]: 'cold-archive (stored)',
    [folderByName('invited-no-mount').id]: 'invited-no-mount (stored)'
  }} />
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  name: 'Paging and search',
  parameters: {
    docs: {
      description: {
        story: '45 folders, read 20 at a time: scrolling to the end of the list loads the next page. Typing in the search box filters on the server by name (\`iContains\`), e.g. \`experiment-4\`.'
      }
    }
  },
  render: args => <Sandbox {...args} label="Folder" folders={manyFolders} />
}`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
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
}`,...H.parameters?.docs?.source}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  name: 'EmptyState',
  parameters: {
    docs: {
      description: {
        story: 'No folder matches — opening the popup shows the shared empty-state text.'
      }
    }
  },
  render: args => <Sandbox {...args} label="Folder" folders={[]} />
}`,...U.parameters?.docs?.source}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  name: 'LoadingState',
  parameters: {
    docs: {
      description: {
        story: 'Caller-side \`isLoading\`, which spins the trigger the same way the internal search debounce and refetch states do.'
      }
    }
  },
  render: args => <Sandbox {...args} label="Folder" isLoading isDisabled />
}`,...W.parameters?.docs?.source}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  name: 'ErrorState',
  parameters: {
    docs: {
      description: {
        story: "The select's own \`status\`: a red border and the message under the control, for a caller that validates the pick itself. Inside a Form.Item the item shows its rule message instead."
      }
    }
  },
  render: args => <Sandbox {...args} label="Folder" status={{
    type: 'error',
    message: 'Please select a folder.'
  }} />
}`,...G.parameters?.docs?.source}}}})))()}q();export{F as Default,U as Empty,G as Error,z as HiddenSelection,W as Loading,R as ModelFolder,L as Multiple,H as NoScope,V as Paging,I as SessionMountFolders,B as UnresolvedSelection,K as __namedExportsOrder,P as default};