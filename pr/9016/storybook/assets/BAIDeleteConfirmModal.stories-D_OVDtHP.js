import{r as o,j as e}from"./iframe-BgaR6W86.js";import{B as i}from"./BAIButton-DeYlQg_6.js";import{B}from"./BAICheckbox-B_PcJU84.js";import{B as n}from"./BAIDeleteConfirmModal-Cls28rLF.js";import{B as k}from"./BAIFlex-BReP981K.js";import{B as I}from"./BAITag-3OifubZq.js";import{T as a}from"./trash-2-2q1nIvxT.js";import{F as j}from"./folder-B3sPAZ1O.js";import"./preload-helper-Dp1pzeXC.js";import"./astryxLabel-CG99bAkm.js";import"./CheckboxInput-DBCoPTC3.js";import"./useResolvedRequired-B6GLv2yE.js";import"./useIndicator-Bnn9CHA2.js";import"./isRenderable-BUV0eL6r.js";import"./BAIModal-C7KFJ2OE.js";import"./VStack-CUQ6QTqh.js";import"./TextInput-BbOxdFTy.js";import"./InputGroupContext-DHd-PeYI.js";import"./useInputStatusIcon-G4nA6Jzc.js";import"./InputClearButton-BVR5cD_d.js";import"./useDevWarning-D0o9UoUz.js";import"./circle-alert-BD9BREpo.js";import"./Banner-CWY8HHNq.js";import"./composeEventHandlers-BolWE7qY.js";import"./astryxTagVariant-CPCr7vTB.js";import"./Token-BeKMuNR-.js";import"./Badge-1Ky0L4IN.js";const Fe={title:"Modal/BAIDeleteConfirmModal",component:n,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:`
**BAIDeleteConfirmModal** is a unified delete confirmation modal for table row deletion.

## Behavior
- **Single item**: Simple confirm dialog. OK button is immediately enabled.
- **Single item + \`requireConfirmInput\`**: Requires typing the item name. Item list is hidden — the name already appears in the description.
- **Multiple items (2+)**: Shows scrollable item list followed by a confirmation input requiring "Delete" to be typed.
- **\`reversible\`**: Keeps the exact same modal chrome but never renders the typed-confirmation input (even for multiple items or with \`requireConfirmInput\`) and omits the "This action cannot be undone." warning. Use for actions the user can recover from in <30s without support (e.g. revoke a role assignment, remove a permission from a role).

## Key Features
- Accepts \`React.ReactNode\` for item labels (icons, tags, custom rendering)
- Scrollable item list for multi-item selections
- \`target\` prop produces a resource-type-aware default description ("Are you sure you want to permanently delete {target}?")
- \`reversible\` prop downgrades the modal for reversible actions while keeping a consistent design
- Long, unbreakable titles (e.g. full image references) wrap inside the header instead of overflowing
- \`extraContent\` slot for domain-specific additions (checkboxes, warnings)
- Built on \`BAIModal\`
        `}}}},l={parameters:{docs:{description:{story:"Single item deletion with simple confirm. No text input required."}}},render:()=>{const[r,t]=o.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx(i,{danger:!0,icon:e.jsx(a,{size:"1em"}),onClick:()=>t(!0),children:"Delete Item"}),e.jsx(n,{open:r,items:[{key:"1",label:"my-important-resource"}],onOk:()=>t(!1),onCancel:()=>t(!1)})]})}},d={parameters:{docs:{description:{story:"Single item with `requireConfirmInput={true}`. Item list is hidden (name already appears in description). User must type the item name into the confirmation input to enable the Delete button."}}},render:()=>{const[r,t]=o.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx(i,{danger:!0,icon:e.jsx(a,{size:"1em"}),onClick:()=>t(!0),children:"Delete (Confirm Required)"}),e.jsx(n,{open:r,items:[{key:"1",label:"production-database"}],requireConfirmInput:!0,onOk:()=>t(!1),onCancel:()=>t(!1)})]})}},c={parameters:{docs:{description:{story:'Resource-typed deletion using the `target` prop. The default description becomes "Are you sure you want to permanently delete {target}?", surfacing the resource type (e.g. "Resource Preset", "Resource Policy") in the dialog copy. Typically paired with `requireConfirmInput` for irreversible deletes.'}}},render:()=>{const[r,t]=o.useState(!1),s="gpu-large-preset";return e.jsxs(e.Fragment,{children:[e.jsx(i,{danger:!0,icon:e.jsx(a,{size:"1em"}),onClick:()=>t(!0),children:"Delete Resource Preset"}),e.jsx(n,{open:r,title:"Delete Resource Preset",target:"Resource Preset",items:[{key:s,label:s}],confirmText:s,requireConfirmInput:!0,inputProps:{placeholder:s},onOk:()=>t(!1),onCancel:()=>t(!1)})]})}},p={parameters:{docs:{description:{story:'Multiple items require typing "Delete" to confirm. Shows scrollable item list above the confirmation input.'}}},render:()=>{const[r,t]=o.useState(!1),s=[{key:"1",label:"project-alpha"},{key:"2",label:"project-beta"},{key:"3",label:"project-gamma"},{key:"4",label:"project-delta"},{key:"5",label:"project-epsilon"}];return e.jsxs(e.Fragment,{children:[e.jsx(i,{danger:!0,icon:e.jsx(a,{size:"1em"}),onClick:()=>t(!0),children:"Delete 5 Items"}),e.jsx(n,{open:r,items:s,onOk:()=>t(!1),onCancel:()=>t(!1)})]})}},m={parameters:{docs:{description:{story:"Large selection (50 items) demonstrating scroll behavior within the item list."}}},render:()=>{const[r,t]=o.useState(!1),s=Array.from({length:50},(ae,C)=>({key:String(C),label:`resource-${String(C+1).padStart(3,"0")}`}));return e.jsxs(e.Fragment,{children:[e.jsx(i,{danger:!0,icon:e.jsx(a,{size:"1em"}),onClick:()=>t(!0),children:"Delete 50 Items"}),e.jsx(n,{open:r,items:s,onOk:()=>t(!1),onCancel:()=>t(!1)})]})}},u={parameters:{docs:{description:{story:"Items with ReactNode labels — icons, tags, and custom components."}}},render:()=>{const[r,t]=o.useState(!1),s=[{key:"1",label:e.jsxs(k,{gap:"xs",align:"center",children:[e.jsx(j,{size:"1em"}),e.jsx("span",{children:"shared-dataset"}),e.jsx(I,{color:"blue",children:"Public"})]})},{key:"2",label:e.jsxs(k,{gap:"xs",align:"center",children:[e.jsx(j,{size:"1em"}),e.jsx("span",{children:"model-weights-v2"}),e.jsx(I,{color:"red",children:"Private"})]})},{key:"3",label:e.jsxs(k,{gap:"xs",align:"center",children:[e.jsx(j,{size:"1em"}),e.jsx("span",{children:"training-logs"}),e.jsx(I,{color:"green",children:"Archived"})]})}];return e.jsxs(e.Fragment,{children:[e.jsx(i,{danger:!0,icon:e.jsx(a,{size:"1em"}),onClick:()=>t(!0),children:"Delete Folders"}),e.jsx(n,{open:r,items:s,onOk:()=>t(!1),onCancel:()=>t(!1)})]})}},h={parameters:{docs:{description:{story:"Extra content slot with checkboxes, similar to PurgeUsersModal pattern."}}},render:()=>{const[r,t]=o.useState(!1),s=[{key:"1",label:"user-john@example.com"},{key:"2",label:"user-jane@example.com"}];return e.jsxs(e.Fragment,{children:[e.jsx(i,{danger:!0,icon:e.jsx(a,{size:"1em"}),onClick:()=>t(!0),children:"Purge Users"}),e.jsx(n,{open:r,items:s,extraContent:e.jsxs(k,{direction:"column",align:"start",children:[e.jsx(B,{children:"Also delete shared folders"}),e.jsx(B,{children:"Terminate running sessions"})]}),onOk:()=>t(!1),onCancel:()=>t(!1)})]})}},g={parameters:{docs:{description:{story:'Reversible action (e.g. revoke a role assignment, remove a permission from a role). `reversible` keeps the exact same modal chrome as the irreversible-delete modal but never renders the typed-confirmation input and omits the "This action cannot be undone." warning.'}}},render:()=>{const[r,t]=o.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx(i,{danger:!0,icon:e.jsx(a,{size:"1em"}),onClick:()=>t(!0),children:"Revoke User"}),e.jsx(n,{open:r,reversible:!0,title:"Revoke User",description:"Revoke the following user(s) from this role?",okText:"Revoke User",items:[{key:"1",label:"user-john@example.com"}],onOk:()=>t(!1),onCancel:()=>t(!1)})]})}},f={parameters:{docs:{description:{story:'Reversible variant with multiple items. Normally 2+ items force the typed-confirmation input; with `reversible` the item list is still shown but no input is required and the "cannot be undone" warning is omitted.'}}},render:()=>{const[r,t]=o.useState(!1),s=[{key:"1",label:"user-john@example.com"},{key:"2",label:"user-jane@example.com"},{key:"3",label:"user-bob@example.com"}];return e.jsxs(e.Fragment,{children:[e.jsx(i,{danger:!0,icon:e.jsx(a,{size:"1em"}),onClick:()=>t(!0),children:"Revoke 3 Users"}),e.jsx(n,{open:r,reversible:!0,title:"Revoke User",description:"Revoke the following user(s) from this role?",okText:"Revoke User",items:s,onOk:()=>t(!1),onCancel:()=>t(!1)})]})}},b={parameters:{docs:{description:{story:"Long, unbreakable titles (e.g. a full container image reference) wrap inside the modal header instead of overflowing past the modal border."}}},render:()=>{const[r,t]=o.useState(!1),s="cr.backend.ai/testing/aimet:1.22.2-tf24-py38-cuda11.1-customized_274887c86af24173aa004423019dfcc5@x86_64";return e.jsxs(e.Fragment,{children:[e.jsx(i,{danger:!0,icon:e.jsx(a,{size:"1em"}),onClick:()=>t(!0),children:"Delete Image"}),e.jsx(n,{open:r,title:`Delete "${s}"`,items:[{key:s,label:s}],requireConfirmInput:!0,confirmText:s,inputProps:{placeholder:s},onOk:()=>t(!1),onCancel:()=>t(!1)})]})}},x={parameters:{docs:{description:{story:"`plainItems` drops the default surface (background / border / padding / scroll) around the item list. Use when an item `label` is already a self-contained block (e.g. a table or card) so the default box does not produce a redundant double border."}}},render:()=>{const[r,t]=o.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx(i,{danger:!0,icon:e.jsx(a,{size:"1em"}),onClick:()=>t(!0),children:"Remove Permission"}),e.jsx(n,{open:r,reversible:!0,plainItems:!0,title:"Remove Permission",description:"Remove the following permission from this role?",okText:"Remove Permission",items:[{key:"1",label:e.jsxs("table",{style:{width:"100%",borderCollapse:"collapse",border:"1px solid #d9d9d9"},children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{style:{border:"1px solid #d9d9d9",padding:8},children:"Scope"}),e.jsx("th",{style:{border:"1px solid #d9d9d9",padding:8},children:"Target"}),e.jsx("th",{style:{border:"1px solid #d9d9d9",padding:8},children:"Entity"}),e.jsx("th",{style:{border:"1px solid #d9d9d9",padding:8},children:"Operation"})]})}),e.jsx("tbody",{children:e.jsxs("tr",{children:[e.jsx("td",{style:{border:"1px solid #d9d9d9",padding:8},children:"User"}),e.jsx("td",{style:{border:"1px solid #d9d9d9",padding:8},children:"test@lablup.com"}),e.jsx("td",{style:{border:"1px solid #d9d9d9",padding:8},children:"Notification Channel"}),e.jsx("td",{style:{border:"1px solid #d9d9d9",padding:8},children:"Create"})]})})]})}],onOk:()=>t(!1),onCancel:()=>t(!1)})]})}},y={parameters:{docs:{description:{story:"Edge case: empty items array. OK button is disabled."}}},render:()=>{const[r,t]=o.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx(i,{danger:!0,icon:e.jsx(a,{size:"1em"}),onClick:()=>t(!0),children:"Delete (No Selection)"}),e.jsx(n,{open:r,items:[],onOk:()=>t(!1),onCancel:()=>t(!1)})]})}};var O,v,A;l.parameters={...l.parameters,docs:{...(O=l.parameters)==null?void 0:O.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Single item deletion with simple confirm. No text input required.'
      }
    }
  },
  render: () => {
    const [open, setOpen] = useState(false);
    return <>
        <BAIButton danger icon={<Trash2 size="1em" />} onClick={() => setOpen(true)}>
          Delete Item
        </BAIButton>
        <BAIDeleteConfirmModal open={open} items={[{
        key: '1',
        label: 'my-important-resource'
      }]} onOk={() => setOpen(false)} onCancel={() => setOpen(false)} />
      </>;
  }
}`,...(A=(v=l.parameters)==null?void 0:v.docs)==null?void 0:A.source}}};var R,S,w;d.parameters={...d.parameters,docs:{...(R=d.parameters)==null?void 0:R.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Single item with \`requireConfirmInput={true}\`. Item list is hidden (name already appears in description). User must type the item name into the confirmation input to enable the Delete button.'
      }
    }
  },
  render: () => {
    const [open, setOpen] = useState(false);
    return <>
        <BAIButton danger icon={<Trash2 size="1em" />} onClick={() => setOpen(true)}>
          Delete (Confirm Required)
        </BAIButton>
        <BAIDeleteConfirmModal open={open} items={[{
        key: '1',
        label: 'production-database'
      }]} requireConfirmInput onOk={() => setOpen(false)} onCancel={() => setOpen(false)} />
      </>;
  }
}`,...(w=(S=d.parameters)==null?void 0:S.docs)==null?void 0:w.source}}};var T,D,z;c.parameters={...c.parameters,docs:{...(T=c.parameters)==null?void 0:T.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Resource-typed deletion using the \`target\` prop. The default description becomes "Are you sure you want to permanently delete {target}?", surfacing the resource type (e.g. "Resource Preset", "Resource Policy") in the dialog copy. Typically paired with \`requireConfirmInput\` for irreversible deletes.'
      }
    }
  },
  render: () => {
    const [open, setOpen] = useState(false);
    const itemName = 'gpu-large-preset';
    return <>
        <BAIButton danger icon={<Trash2 size="1em" />} onClick={() => setOpen(true)}>
          Delete Resource Preset
        </BAIButton>
        <BAIDeleteConfirmModal open={open} title="Delete Resource Preset" target="Resource Preset" items={[{
        key: itemName,
        label: itemName
      }]} confirmText={itemName} requireConfirmInput inputProps={{
        placeholder: itemName
      }} onOk={() => setOpen(false)} onCancel={() => setOpen(false)} />
      </>;
  }
}`,...(z=(D=c.parameters)==null?void 0:D.docs)==null?void 0:z.source}}};var P,F,M;p.parameters={...p.parameters,docs:{...(P=p.parameters)==null?void 0:P.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Multiple items require typing "Delete" to confirm. Shows scrollable item list above the confirmation input.'
      }
    }
  },
  render: () => {
    const [open, setOpen] = useState(false);
    const items = [{
      key: '1',
      label: 'project-alpha'
    }, {
      key: '2',
      label: 'project-beta'
    }, {
      key: '3',
      label: 'project-gamma'
    }, {
      key: '4',
      label: 'project-delta'
    }, {
      key: '5',
      label: 'project-epsilon'
    }];
    return <>
        <BAIButton danger icon={<Trash2 size="1em" />} onClick={() => setOpen(true)}>
          Delete 5 Items
        </BAIButton>
        <BAIDeleteConfirmModal open={open} items={items} onOk={() => setOpen(false)} onCancel={() => setOpen(false)} />
      </>;
  }
}`,...(M=(F=p.parameters)==null?void 0:F.docs)==null?void 0:M.source}}};var U,q,N;m.parameters={...m.parameters,docs:{...(U=m.parameters)==null?void 0:U.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Large selection (50 items) demonstrating scroll behavior within the item list.'
      }
    }
  },
  render: () => {
    const [open, setOpen] = useState(false);
    const items = Array.from({
      length: 50
    }, (_, i) => ({
      key: String(i),
      label: \`resource-\${String(i + 1).padStart(3, '0')}\`
    }));
    return <>
        <BAIButton danger icon={<Trash2 size="1em" />} onClick={() => setOpen(true)}>
          Delete 50 Items
        </BAIButton>
        <BAIDeleteConfirmModal open={open} items={items} onOk={() => setOpen(false)} onCancel={() => setOpen(false)} />
      </>;
  }
}`,...(N=(q=m.parameters)==null?void 0:q.docs)==null?void 0:N.source}}};var E,_,L;u.parameters={...u.parameters,docs:{...(E=u.parameters)==null?void 0:E.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Items with ReactNode labels — icons, tags, and custom components.'
      }
    }
  },
  render: () => {
    const [open, setOpen] = useState(false);
    const items = [{
      key: '1',
      label: <BAIFlex gap="xs" align="center">
            <Folder size="1em" />
            <span>shared-dataset</span>
            <BAITag color="blue">Public</BAITag>
          </BAIFlex>
    }, {
      key: '2',
      label: <BAIFlex gap="xs" align="center">
            <Folder size="1em" />
            <span>model-weights-v2</span>
            <BAITag color="red">Private</BAITag>
          </BAIFlex>
    }, {
      key: '3',
      label: <BAIFlex gap="xs" align="center">
            <Folder size="1em" />
            <span>training-logs</span>
            <BAITag color="green">Archived</BAITag>
          </BAIFlex>
    }];
    return <>
        <BAIButton danger icon={<Trash2 size="1em" />} onClick={() => setOpen(true)}>
          Delete Folders
        </BAIButton>
        <BAIDeleteConfirmModal open={open} items={items} onOk={() => setOpen(false)} onCancel={() => setOpen(false)} />
      </>;
  }
}`,...(L=(_=u.parameters)==null?void 0:_.docs)==null?void 0:L.source}}};var W,K,$;h.parameters={...h.parameters,docs:{...(W=h.parameters)==null?void 0:W.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Extra content slot with checkboxes, similar to PurgeUsersModal pattern.'
      }
    }
  },
  render: () => {
    const [open, setOpen] = useState(false);
    const items = [{
      key: '1',
      label: 'user-john@example.com'
    }, {
      key: '2',
      label: 'user-jane@example.com'
    }];
    return <>
        <BAIButton danger icon={<Trash2 size="1em" />} onClick={() => setOpen(true)}>
          Purge Users
        </BAIButton>
        <BAIDeleteConfirmModal open={open} items={items} extraContent={<BAIFlex direction="column" align="start">
              <BAICheckbox>Also delete shared folders</BAICheckbox>
              <BAICheckbox>Terminate running sessions</BAICheckbox>
            </BAIFlex>} onOk={() => setOpen(false)} onCancel={() => setOpen(false)} />
      </>;
  }
}`,...($=(K=h.parameters)==null?void 0:K.docs)==null?void 0:$.source}}};var G,H,J;g.parameters={...g.parameters,docs:{...(G=g.parameters)==null?void 0:G.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Reversible action (e.g. revoke a role assignment, remove a permission from a role). \`reversible\` keeps the exact same modal chrome as the irreversible-delete modal but never renders the typed-confirmation input and omits the "This action cannot be undone." warning.'
      }
    }
  },
  render: () => {
    const [open, setOpen] = useState(false);
    return <>
        <BAIButton danger icon={<Trash2 size="1em" />} onClick={() => setOpen(true)}>
          Revoke User
        </BAIButton>
        <BAIDeleteConfirmModal open={open} reversible title="Revoke User" description="Revoke the following user(s) from this role?" okText="Revoke User" items={[{
        key: '1',
        label: 'user-john@example.com'
      }]} onOk={() => setOpen(false)} onCancel={() => setOpen(false)} />
      </>;
  }
}`,...(J=(H=g.parameters)==null?void 0:H.docs)==null?void 0:J.source}}};var Q,V,X;f.parameters={...f.parameters,docs:{...(Q=f.parameters)==null?void 0:Q.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Reversible variant with multiple items. Normally 2+ items force the typed-confirmation input; with \`reversible\` the item list is still shown but no input is required and the "cannot be undone" warning is omitted.'
      }
    }
  },
  render: () => {
    const [open, setOpen] = useState(false);
    const items = [{
      key: '1',
      label: 'user-john@example.com'
    }, {
      key: '2',
      label: 'user-jane@example.com'
    }, {
      key: '3',
      label: 'user-bob@example.com'
    }];
    return <>
        <BAIButton danger icon={<Trash2 size="1em" />} onClick={() => setOpen(true)}>
          Revoke 3 Users
        </BAIButton>
        <BAIDeleteConfirmModal open={open} reversible title="Revoke User" description="Revoke the following user(s) from this role?" okText="Revoke User" items={items} onOk={() => setOpen(false)} onCancel={() => setOpen(false)} />
      </>;
  }
}`,...(X=(V=f.parameters)==null?void 0:V.docs)==null?void 0:X.source}}};var Y,Z,ee;b.parameters={...b.parameters,docs:{...(Y=b.parameters)==null?void 0:Y.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Long, unbreakable titles (e.g. a full container image reference) wrap inside the modal header instead of overflowing past the modal border.'
      }
    }
  },
  render: () => {
    const [open, setOpen] = useState(false);
    const imageRef = 'cr.backend.ai/testing/aimet:1.22.2-tf24-py38-cuda11.1-customized_274887c86af24173aa004423019dfcc5@x86_64';
    return <>
        <BAIButton danger icon={<Trash2 size="1em" />} onClick={() => setOpen(true)}>
          Delete Image
        </BAIButton>
        <BAIDeleteConfirmModal open={open} title={\`Delete "\${imageRef}"\`} items={[{
        key: imageRef,
        label: imageRef
      }]} requireConfirmInput confirmText={imageRef} inputProps={{
        placeholder: imageRef
      }} onOk={() => setOpen(false)} onCancel={() => setOpen(false)} />
      </>;
  }
}`,...(ee=(Z=b.parameters)==null?void 0:Z.docs)==null?void 0:ee.source}}};var te,re,se;x.parameters={...x.parameters,docs:{...(te=x.parameters)==null?void 0:te.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: '\`plainItems\` drops the default surface (background / border / padding / scroll) around the item list. Use when an item \`label\` is already a self-contained block (e.g. a table or card) so the default box does not produce a redundant double border.'
      }
    }
  },
  render: () => {
    const [open, setOpen] = useState(false);
    return <>
        <BAIButton danger icon={<Trash2 size="1em" />} onClick={() => setOpen(true)}>
          Remove Permission
        </BAIButton>
        <BAIDeleteConfirmModal open={open} reversible plainItems title="Remove Permission" description="Remove the following permission from this role?" okText="Remove Permission" items={[{
        key: '1',
        label: <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: '1px solid #d9d9d9'
        }}>
                  <thead>
                    <tr>
                      <th style={{
                border: '1px solid #d9d9d9',
                padding: 8
              }}>
                        Scope
                      </th>
                      <th style={{
                border: '1px solid #d9d9d9',
                padding: 8
              }}>
                        Target
                      </th>
                      <th style={{
                border: '1px solid #d9d9d9',
                padding: 8
              }}>
                        Entity
                      </th>
                      <th style={{
                border: '1px solid #d9d9d9',
                padding: 8
              }}>
                        Operation
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{
                border: '1px solid #d9d9d9',
                padding: 8
              }}>
                        User
                      </td>
                      <td style={{
                border: '1px solid #d9d9d9',
                padding: 8
              }}>
                        test@lablup.com
                      </td>
                      <td style={{
                border: '1px solid #d9d9d9',
                padding: 8
              }}>
                        Notification Channel
                      </td>
                      <td style={{
                border: '1px solid #d9d9d9',
                padding: 8
              }}>
                        Create
                      </td>
                    </tr>
                  </tbody>
                </table>
      }]} onOk={() => setOpen(false)} onCancel={() => setOpen(false)} />
      </>;
  }
}`,...(se=(re=x.parameters)==null?void 0:re.docs)==null?void 0:se.source}}};var ne,oe,ie;y.parameters={...y.parameters,docs:{...(ne=y.parameters)==null?void 0:ne.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Edge case: empty items array. OK button is disabled.'
      }
    }
  },
  render: () => {
    const [open, setOpen] = useState(false);
    return <>
        <BAIButton danger icon={<Trash2 size="1em" />} onClick={() => setOpen(true)}>
          Delete (No Selection)
        </BAIButton>
        <BAIDeleteConfirmModal open={open} items={[]} onOk={() => setOpen(false)} onCancel={() => setOpen(false)} />
      </>;
  }
}`,...(ie=(oe=y.parameters)==null?void 0:oe.docs)==null?void 0:ie.source}}};const Me=["SingleItem","SingleItemWithInput","WithTarget","MultipleItems","ManyItems","CustomRenderedItems","WithExtraContent","Reversible","ReversibleMultipleItems","LongTitle","PlainItems","EmptyItems"];export{u as CustomRenderedItems,y as EmptyItems,b as LongTitle,m as ManyItems,p as MultipleItems,x as PlainItems,g as Reversible,f as ReversibleMultipleItems,l as SingleItem,d as SingleItemWithInput,h as WithExtraContent,c as WithTarget,Me as __namedExportsOrder,Fe as default};
