import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-DlPsW1c0.js";import{a as n,c as r,i as ee,m as i,n as a,o,p as te,r as ne,s,t as re}from"./MockVFolderFileProviders-C-K19Sfn.js";import{t as c}from"./jsx-runtime-MKhVqBIO.js";import{t as ie}from"./compiler-runtime-DU4U6aph.js";import{h as l,m as u}from"./iframe-Cz5Dr-Wh.js";import{n as d,t as ae}from"./BAIFlex-DnaoYTJ1.js";import{n as f,r as p,t as m}from"./useMountableVFolders-jv70w8LE.js";import{n as h,t as oe}from"./BAIButton-BiW0W9Eo.js";function se(e){return e.name}var ce,g,_,v,y,b,x,S,C,w,T,E,D,le,O,k,A,ue,j,de,M,fe,N,P,F,I,L,R,z,B,V,H,pe,U,W,G,K,q,J,Y,X,Z,Q,$,me;function he(){return(he=e((()=>{ce=ie(),m(),a(),o(),h(),d(),l(),i(),g=t(),_=c(),{action:I}=__STORYBOOK_MODULE_ACTIONS__,L=420,R=[s({id:`aaaaaaaa-bbbb-cccc-dddd-eeeeffff0014`,name:`llama-checkpoint`,usageMode:`MODEL`,createdAt:`2026-08-05T09:00:00+00:00`}),s({id:`aaaaaaaa-bbbb-cccc-dddd-eeeeffff0013`,name:`invited-no-mount`,permission:`NONE`,createdAt:`2026-08-04T09:00:00+00:00`}),s({id:`aaaaaaaa-bbbb-cccc-dddd-eeeeffff0012`,name:`team-scratch`,permission:`READ_WRITE`,ownershipType:`GROUP`,projectId:n,creatorEmail:`teammate@lablup.com`,createdAt:`2026-08-03T09:00:00+00:00`}),s({id:`aaaaaaaa-bbbb-cccc-dddd-eeeeffff0011`,name:`read-only-reference`,permission:`READ_ONLY`,createdAt:`2026-08-02T09:00:00+00:00`}),...r],z=Array.from({length:45},(e,t)=>{let n=45-t;return s({id:`bbbbbbbb-0000-4000-8000-${String(n).padStart(12,`0`)}`,name:`experiment-${String(n).padStart(2,`0`)}`,createdAt:`2026-09-${String(Math.ceil(n/2)).padStart(2,`0`)}T09:00:00+00:00`})}),B=e=>{let t=R.find(t=>t.name===e);if(!t)throw new globalThis.Error(`No story folder named "${e}"`);return t},V=f(ne),H=e=>{"use memo";let t=(0,ce.c)(34),n,r,i,a;t[0]===e?(n=t[1],r=t[2],i=t[3],a=t[4]):({scope:r,initialValue:i,folders:a,...n}=e,t[0]=e,t[1]=n,t[2]=r,t[3]=i,t[4]=a);let o=r===void 0?ee:r,ne=i===void 0?null:i,s=a===void 0?R:a,[c,ie]=(0,g.useState)(ne),[l,d]=(0,g.useState)(),f=(0,g.useRef)(null),p,m;t[5]===Symbol.for(`react.memo_cache_sentinel`)?(p=(e,t)=>{ie(e??null),I(`onChange`)(e,t)},m=e=>{d(e),I(`onResolve`)(e)},t[5]=p,t[6]=m):(p=t[5],m=t[6]);let h;t[7]!==n||t[8]!==o||t[9]!==c?(h=(0,_.jsx)(te,{width:L,...n,ref:f,scope:o,value:c,onChange:p,onResolve:m}),t[7]=n,t[8]=o,t[9]=c,t[10]=h):h=t[10];let v;t[11]===Symbol.for(`react.memo_cache_sentinel`)?(v=(0,_.jsx)(oe,{onClick:()=>{var e;return(e=f.current)==null?void 0:e.refetch()},children:`Refetch via ref`}),t[11]=v):v=t[11];let y;t[12]===c?y=t[13]:(y=JSON.stringify(c),t[12]=c,t[13]=y);let b;t[14]===y?b=t[15]:(b=(0,_.jsxs)(u,{type:`secondary`,code:!0,children:[`value: `,y]}),t[14]=y,t[15]=b);let x;t[16]===(l==null?void 0:l.resolved)?x=t[17]:(x=JSON.stringify((l==null?void 0:l.resolved.map(se))??[]),t[16]=l==null?void 0:l.resolved,t[17]=x);let S;t[18]===x?S=t[19]:(S=(0,_.jsxs)(u,{type:`secondary`,code:!0,children:[`resolved:`,` `,x]}),t[18]=x,t[19]=S);let C;t[20]===(l==null?void 0:l.unresolved)?C=t[21]:(C=JSON.stringify((l==null?void 0:l.unresolved)??[]),t[20]=l==null?void 0:l.unresolved,t[21]=C);let w;t[22]===C?w=t[23]:(w=(0,_.jsxs)(u,{type:`secondary`,code:!0,children:[`unresolved: `,C]}),t[22]=C,t[23]=w);let T;t[24]!==S||t[25]!==w||t[26]!==b?(T=(0,_.jsxs)(ae,{direction:`column`,align:`start`,gap:`xxs`,children:[b,S,w]}),t[24]=S,t[25]=w,t[26]=b,t[27]=T):T=t[27];let E;t[28]!==T||t[29]!==h?(E=(0,_.jsxs)(ae,{direction:`column`,align:`start`,gap:`md`,children:[h,v,T]}),t[28]=T,t[29]=h,t[30]=E):E=t[30];let D;return t[31]!==s||t[32]!==E?(D=(0,_.jsx)(re,{folders:s,suspenseFallback:`Loading...`,children:E}),t[31]=s,t[32]=E,t[33]=D):D=t[33],D},pe={title:`Fragments/BAIScopedVFolderSelect`,component:te,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:"\n**BAIScopedVFolderSelect** — the virtual folder picker, built on `BAIComplexSelect` and paged through `scopedVFoldersV2` (manager 26.9.0; the selected-value lookup filters on `VFolderFilter.entityId`, which needs manager 26.10.0).\n\n- `scope` (required): the `VFolderScope` input (`user`, `project`, `domain` lists, ORed). A scope whose lists are all empty reads nothing.\n- `filter`: ANDed onto the options **and** the lookup of selected ids; a selected folder outside it is reported unresolved.\n- `optionFilter`: ANDed onto the options only; a selected folder it hides stays selected and resolved.\n- `disableUnmountable`: lists a folder whose mount level is `NONE` as disabled and reports a matching selection unresolved.\n- `fallbackLabels` / `onResolve`: name an id the scope no longer reaches, and learn which selected ids are still reachable.\n- The value is folder UUIDs (`VFolder.entityId`). The selected-value lookup suspends on first load, so the caller owns the Suspense boundary.\n\nThe options are read only once the popup opens, so click a select to see its list. The lines under each select show the value and the last `onResolve` outcome.\n        "}}},argTypes:{value:{control:!1},onChange:{control:!1},onResolve:{control:!1},scope:{control:!1},filter:{control:!1},optionFilter:{control:!1},fallbackLabels:{control:!1},multiple:{control:{type:`boolean`}},disableUnmountable:{control:{type:`boolean`}}}},U={name:`Basic`,parameters:{docs:{description:{story:"The user folders and the current project's folders, newest first. Each option shows the creator, usage mode, host and creation date, and the caller's mount level as R/W/D tokens. `other-team-data` belongs to another project, so the scope leaves it out."}}},render:e=>(0,_.jsx)(H,{...e,label:`Folder`})},W={name:`Session mount folders`,args:{multiple:!0,disableUnmountable:!0},parameters:{docs:{description:{story:"Folders a session may mount: `filter` keeps folders on hosts that grant `mount-in-session` (so `cold-archive` is gone), `optionFilter` hides dotfile folders and folders that are not ready, and `disableUnmountable` lists `invited-no-mount` disabled with the reason."}}},render:e=>(0,_.jsx)(H,{...e,label:`Folders`,filter:V,optionFilter:{AND:[{status:{equals:`READY`}},{name:{notStartsWith:`.`}}]}})},G={name:`Multiple Select`,args:{multiple:!0},parameters:{docs:{description:{story:`Multi-selection: the value is an array of folder UUIDs, and the selected ids are labelled by the value lookup before the popup is opened.`}}},render:e=>(0,_.jsx)(H,{...e,label:`Folders`,initialValue:[B(`my-project-data`).id,B(`shared-datasets`).id]})},K={name:`Model folder`,parameters:{docs:{description:{story:"A single model folder, as the deployment form picks it: `filter` leaves out deleted folders and keeps `usageMode: MODEL`."}}},render:e=>(0,_.jsx)(H,{...e,label:`Model folder`,filter:{AND:[p,{usageMode:{equals:`MODEL`}}]}})},q={name:`Selection hidden by optionFilter`,args:{multiple:!0},parameters:{docs:{description:{story:"`.config` is selected but `optionFilter` keeps dotfile folders out of the list. The lookup still finds it within `filter`, so it keeps its name and is reported resolved."}}},render:e=>(0,_.jsx)(H,{...e,label:`Folders`,filter:V,optionFilter:{name:{notStartsWith:`.`}},initialValue:[B(`.config`).id]})},J={name:`Unresolved selection`,args:{multiple:!0,disableUnmountable:!0},parameters:{docs:{description:{story:"`cold-archive` is on a host `filter` rejects and `invited-no-mount` fails `disableUnmountable`, so both are reported unresolved while `my-project-data` resolves. `fallbackLabels` keeps `cold-archive` from showing as a bare UUID; `invited-no-mount` is still found by the lookup, so it keeps its own name."}}},render:e=>(0,_.jsx)(H,{...e,label:`Folders`,filter:V,initialValue:[B(`my-project-data`).id,B(`cold-archive`).id,B(`invited-no-mount`).id],fallbackLabels:{[B(`cold-archive`).id]:`cold-archive (stored)`,[B(`invited-no-mount`).id]:`invited-no-mount (stored)`}})},Y={name:`Paging and search`,parameters:{docs:{description:{story:"45 folders, read 20 at a time: scrolling to the end of the list loads the next page. Typing in the search box filters on the server by name (`iContains`), e.g. `experiment-4`."}}},render:e=>(0,_.jsx)(H,{...e,label:`Folder`,folders:z})},X={name:`No scope yet`,parameters:{docs:{description:{story:`A caller without a range yet passes empty scope lists and disables the select; nothing is read.`}}},render:e=>(0,_.jsx)(H,{...e,label:`Folder`,scope:{project:[]},isDisabled:!0})},Z={name:`EmptyState`,parameters:{docs:{description:{story:`No folder matches — opening the popup shows the shared empty-state text.`}}},render:e=>(0,_.jsx)(H,{...e,label:`Folder`,folders:[]})},Q={name:`LoadingState`,parameters:{docs:{description:{story:"Caller-side `isLoading`, which spins the trigger the same way the internal search debounce and refetch states do."}}},render:e=>(0,_.jsx)(H,{...e,label:`Folder`,isLoading:!0,isDisabled:!0})},$={name:`ErrorState`,parameters:{docs:{description:{story:"The select's own `status`: a red border and the message under the control, for a caller that validates the pick itself. Inside a Form.Item the item shows its rule message instead."}}},render:e=>(0,_.jsx)(H,{...e,label:`Folder`,status:{type:`error`,message:`Please select a folder.`}})},U.parameters={...U.parameters,docs:{...(v=U.parameters)==null?void 0:v.docs,source:{originalSource:`{
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: "The user folders and the current project's folders, newest first. Each option shows the creator, usage mode, host and creation date, and the caller's mount level as R/W/D tokens. \`other-team-data\` belongs to another project, so the scope leaves it out."
      }
    }
  },
  render: args => <Sandbox {...args} label="Folder" />
}`,...(y=U.parameters)==null||(y=y.docs)==null?void 0:y.source}}},W.parameters={...W.parameters,docs:{...(b=W.parameters)==null?void 0:b.docs,source:{originalSource:`{
  name: 'Session mount folders',
  args: {
    multiple: true,
    disableUnmountable: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Folders a session may mount: \`filter\` keeps folders on hosts that grant \`mount-in-session\` (so \`cold-archive\` is gone), \`optionFilter\` hides dotfile folders and folders that are not ready, and \`disableUnmountable\` lists \`invited-no-mount\` disabled with the reason.'
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
}`,...(x=W.parameters)==null||(x=x.docs)==null?void 0:x.source}}},G.parameters={...G.parameters,docs:{...(S=G.parameters)==null?void 0:S.docs,source:{originalSource:`{
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
}`,...(C=G.parameters)==null||(C=C.docs)==null?void 0:C.source}}},K.parameters={...K.parameters,docs:{...(w=K.parameters)==null?void 0:w.docs,source:{originalSource:`{
  name: 'Model folder',
  parameters: {
    docs: {
      description: {
        story: 'A single model folder, as the deployment form picks it: \`filter\` leaves out deleted folders and keeps \`usageMode: MODEL\`.'
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
}`,...(T=K.parameters)==null||(T=T.docs)==null?void 0:T.source}}},q.parameters={...q.parameters,docs:{...(E=q.parameters)==null?void 0:E.docs,source:{originalSource:`{
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
}`,...(D=q.parameters)==null||(D=D.docs)==null?void 0:D.source}}},J.parameters={...J.parameters,docs:{...(le=J.parameters)==null?void 0:le.docs,source:{originalSource:`{
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
}`,...(O=J.parameters)==null||(O=O.docs)==null?void 0:O.source}}},Y.parameters={...Y.parameters,docs:{...(k=Y.parameters)==null?void 0:k.docs,source:{originalSource:`{
  name: 'Paging and search',
  parameters: {
    docs: {
      description: {
        story: '45 folders, read 20 at a time: scrolling to the end of the list loads the next page. Typing in the search box filters on the server by name (\`iContains\`), e.g. \`experiment-4\`.'
      }
    }
  },
  render: args => <Sandbox {...args} label="Folder" folders={manyFolders} />
}`,...(A=Y.parameters)==null||(A=A.docs)==null?void 0:A.source}}},X.parameters={...X.parameters,docs:{...(ue=X.parameters)==null?void 0:ue.docs,source:{originalSource:`{
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
}`,...(j=X.parameters)==null||(j=j.docs)==null?void 0:j.source}}},Z.parameters={...Z.parameters,docs:{...(de=Z.parameters)==null?void 0:de.docs,source:{originalSource:`{
  name: 'EmptyState',
  parameters: {
    docs: {
      description: {
        story: 'No folder matches — opening the popup shows the shared empty-state text.'
      }
    }
  },
  render: args => <Sandbox {...args} label="Folder" folders={[]} />
}`,...(M=Z.parameters)==null||(M=M.docs)==null?void 0:M.source}}},Q.parameters={...Q.parameters,docs:{...(fe=Q.parameters)==null?void 0:fe.docs,source:{originalSource:`{
  name: 'LoadingState',
  parameters: {
    docs: {
      description: {
        story: 'Caller-side \`isLoading\`, which spins the trigger the same way the internal search debounce and refetch states do.'
      }
    }
  },
  render: args => <Sandbox {...args} label="Folder" isLoading isDisabled />
}`,...(N=Q.parameters)==null||(N=N.docs)==null?void 0:N.source}}},$.parameters={...$.parameters,docs:{...(P=$.parameters)==null?void 0:P.docs,source:{originalSource:`{
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
}`,...(F=$.parameters)==null||(F=F.docs)==null?void 0:F.source}}},me=[`Default`,`SessionMountFolders`,`Multiple`,`ModelFolder`,`HiddenSelection`,`UnresolvedSelection`,`Paging`,`NoScope`,`Empty`,`Loading`,`Error`]})))()}he();export{U as Default,Z as Empty,$ as Error,q as HiddenSelection,Q as Loading,K as ModelFolder,G as Multiple,X as NoScope,Y as Paging,W as SessionMountFolders,J as UnresolvedSelection,me as __namedExportsOrder,pe as default};