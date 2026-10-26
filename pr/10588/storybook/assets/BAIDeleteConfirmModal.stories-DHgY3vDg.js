import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-D0Ex1IVc.js";import{t as n}from"./jsx-runtime-MKhVqBIO.js";import{n as r,t as i}from"./folder-FzHgyPql.js";import{n as a,t as o}from"./trash-2-CK7uYwlt.js";import{n as s,t as c}from"./BAIFlex-BOFoS5KY.js";import{n as l,t as u}from"./BAIButton-BkLrwIfz.js";import{n as d,t as f}from"./Token-GN1sUHwR.js";import{n as p,t as m}from"./BAICheckbox-BQl8XiyC.js";import{n as h,t as g}from"./BAIDeleteConfirmModal-CADlixod.js";var _,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M;function N(){return(N=e((()=>{l(),p(),h(),s(),d(),a(),r(),_=t(),v=n(),y={title:`Modal/BAIDeleteConfirmModal`,component:g,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:`
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
        `}}}},b={parameters:{docs:{description:{story:`Single item deletion with simple confirm. No text input required.`}}},render:()=>{let[e,t]=(0,_.useState)(!1);return(0,v.jsxs)(v.Fragment,{children:[(0,v.jsx)(u,{danger:!0,icon:(0,v.jsx)(o,{size:`1em`}),onClick:()=>t(!0),children:`Delete Item`}),(0,v.jsx)(g,{open:e,items:[{key:`1`,label:`my-important-resource`}],onOk:()=>t(!1),onCancel:()=>t(!1)})]})}},x={parameters:{docs:{description:{story:"Single item with `requireConfirmInput={true}`. Item list is hidden (name already appears in description). User must type the item name into the confirmation input to enable the Delete button."}}},render:()=>{let[e,t]=(0,_.useState)(!1);return(0,v.jsxs)(v.Fragment,{children:[(0,v.jsx)(u,{danger:!0,icon:(0,v.jsx)(o,{size:`1em`}),onClick:()=>t(!0),children:`Delete (Confirm Required)`}),(0,v.jsx)(g,{open:e,items:[{key:`1`,label:`production-database`}],requireConfirmInput:!0,onOk:()=>t(!1),onCancel:()=>t(!1)})]})}},S={parameters:{docs:{description:{story:'Resource-typed deletion using the `target` prop. The default description becomes "Are you sure you want to permanently delete {target}?", surfacing the resource type (e.g. "Resource Preset", "Resource Policy") in the dialog copy. Typically paired with `requireConfirmInput` for irreversible deletes.'}}},render:()=>{let[e,t]=(0,_.useState)(!1),n=`gpu-large-preset`;return(0,v.jsxs)(v.Fragment,{children:[(0,v.jsx)(u,{danger:!0,icon:(0,v.jsx)(o,{size:`1em`}),onClick:()=>t(!0),children:`Delete Resource Preset`}),(0,v.jsx)(g,{open:e,title:`Delete Resource Preset`,target:`Resource Preset`,items:[{key:n,label:n}],confirmText:n,requireConfirmInput:!0,inputProps:{placeholder:n},onOk:()=>t(!1),onCancel:()=>t(!1)})]})}},C={parameters:{docs:{description:{story:`Multiple items require typing "Delete" to confirm. Shows scrollable item list above the confirmation input.`}}},render:()=>{let[e,t]=(0,_.useState)(!1);return(0,v.jsxs)(v.Fragment,{children:[(0,v.jsx)(u,{danger:!0,icon:(0,v.jsx)(o,{size:`1em`}),onClick:()=>t(!0),children:`Delete 5 Items`}),(0,v.jsx)(g,{open:e,items:[{key:`1`,label:`project-alpha`},{key:`2`,label:`project-beta`},{key:`3`,label:`project-gamma`},{key:`4`,label:`project-delta`},{key:`5`,label:`project-epsilon`}],onOk:()=>t(!1),onCancel:()=>t(!1)})]})}},w={parameters:{docs:{description:{story:`Large selection (50 items) demonstrating scroll behavior within the item list.`}}},render:()=>{let[e,t]=(0,_.useState)(!1),n=Array.from({length:50},(e,t)=>({key:String(t),label:`resource-${String(t+1).padStart(3,`0`)}`}));return(0,v.jsxs)(v.Fragment,{children:[(0,v.jsx)(u,{danger:!0,icon:(0,v.jsx)(o,{size:`1em`}),onClick:()=>t(!0),children:`Delete 50 Items`}),(0,v.jsx)(g,{open:e,items:n,onOk:()=>t(!1),onCancel:()=>t(!1)})]})}},T={parameters:{docs:{description:{story:`Items with ReactNode labels — icons, tags, and custom components.`}}},render:()=>{let[e,t]=(0,_.useState)(!1);return(0,v.jsxs)(v.Fragment,{children:[(0,v.jsx)(u,{danger:!0,icon:(0,v.jsx)(o,{size:`1em`}),onClick:()=>t(!0),children:`Delete Folders`}),(0,v.jsx)(g,{open:e,items:[{key:`1`,label:(0,v.jsxs)(c,{gap:`xs`,align:`center`,children:[(0,v.jsx)(i,{size:`1em`}),(0,v.jsx)(`span`,{children:`shared-dataset`}),(0,v.jsx)(f,{color:`blue`,label:`Public`})]})},{key:`2`,label:(0,v.jsxs)(c,{gap:`xs`,align:`center`,children:[(0,v.jsx)(i,{size:`1em`}),(0,v.jsx)(`span`,{children:`model-weights-v2`}),(0,v.jsx)(f,{color:`red`,label:`Private`})]})},{key:`3`,label:(0,v.jsxs)(c,{gap:`xs`,align:`center`,children:[(0,v.jsx)(i,{size:`1em`}),(0,v.jsx)(`span`,{children:`training-logs`}),(0,v.jsx)(f,{color:`green`,label:`Archived`})]})}],onOk:()=>t(!1),onCancel:()=>t(!1)})]})}},E={parameters:{docs:{description:{story:`Extra content slot with checkboxes, similar to PurgeUsersModal pattern.`}}},render:()=>{let[e,t]=(0,_.useState)(!1);return(0,v.jsxs)(v.Fragment,{children:[(0,v.jsx)(u,{danger:!0,icon:(0,v.jsx)(o,{size:`1em`}),onClick:()=>t(!0),children:`Purge Users`}),(0,v.jsx)(g,{open:e,items:[{key:`1`,label:`user-john@example.com`},{key:`2`,label:`user-jane@example.com`}],extraContent:(0,v.jsxs)(c,{direction:`column`,align:`start`,children:[(0,v.jsx)(m,{children:`Also delete shared folders`}),(0,v.jsx)(m,{children:`Terminate running sessions`})]}),onOk:()=>t(!1),onCancel:()=>t(!1)})]})}},D={parameters:{docs:{description:{story:'Reversible action (e.g. revoke a role assignment, remove a permission from a role). `reversible` keeps the exact same modal chrome as the irreversible-delete modal but never renders the typed-confirmation input and omits the "This action cannot be undone." warning.'}}},render:()=>{let[e,t]=(0,_.useState)(!1);return(0,v.jsxs)(v.Fragment,{children:[(0,v.jsx)(u,{danger:!0,icon:(0,v.jsx)(o,{size:`1em`}),onClick:()=>t(!0),children:`Revoke User`}),(0,v.jsx)(g,{open:e,reversible:!0,title:`Revoke User`,description:`Revoke the following user(s) from this role?`,okText:`Revoke User`,items:[{key:`1`,label:`user-john@example.com`}],onOk:()=>t(!1),onCancel:()=>t(!1)})]})}},O={parameters:{docs:{description:{story:'Reversible variant with multiple items. Normally 2+ items force the typed-confirmation input; with `reversible` the item list is still shown but no input is required and the "cannot be undone" warning is omitted.'}}},render:()=>{let[e,t]=(0,_.useState)(!1);return(0,v.jsxs)(v.Fragment,{children:[(0,v.jsx)(u,{danger:!0,icon:(0,v.jsx)(o,{size:`1em`}),onClick:()=>t(!0),children:`Revoke 3 Users`}),(0,v.jsx)(g,{open:e,reversible:!0,title:`Revoke User`,description:`Revoke the following user(s) from this role?`,okText:`Revoke User`,items:[{key:`1`,label:`user-john@example.com`},{key:`2`,label:`user-jane@example.com`},{key:`3`,label:`user-bob@example.com`}],onOk:()=>t(!1),onCancel:()=>t(!1)})]})}},k={parameters:{docs:{description:{story:`Long, unbreakable titles (e.g. a full container image reference) wrap inside the modal header instead of overflowing past the modal border.`}}},render:()=>{let[e,t]=(0,_.useState)(!1),n=`cr.backend.ai/testing/aimet:1.22.2-tf24-py38-cuda11.1-customized_274887c86af24173aa004423019dfcc5@x86_64`;return(0,v.jsxs)(v.Fragment,{children:[(0,v.jsx)(u,{danger:!0,icon:(0,v.jsx)(o,{size:`1em`}),onClick:()=>t(!0),children:`Delete Image`}),(0,v.jsx)(g,{open:e,title:`Delete "${n}"`,items:[{key:n,label:n}],requireConfirmInput:!0,confirmText:n,inputProps:{placeholder:n},onOk:()=>t(!1),onCancel:()=>t(!1)})]})}},A={parameters:{docs:{description:{story:"`plainItems` drops the default surface (background / border / padding / scroll) around the item list. Use when an item `label` is already a self-contained block (e.g. a table or card) so the default box does not produce a redundant double border."}}},render:()=>{let[e,t]=(0,_.useState)(!1);return(0,v.jsxs)(v.Fragment,{children:[(0,v.jsx)(u,{danger:!0,icon:(0,v.jsx)(o,{size:`1em`}),onClick:()=>t(!0),children:`Remove Permission`}),(0,v.jsx)(g,{open:e,reversible:!0,plainItems:!0,title:`Remove Permission`,description:`Remove the following permission from this role?`,okText:`Remove Permission`,items:[{key:`1`,label:(0,v.jsxs)(`table`,{style:{width:`100%`,borderCollapse:`collapse`,border:`1px solid #d9d9d9`},children:[(0,v.jsx)(`thead`,{children:(0,v.jsxs)(`tr`,{children:[(0,v.jsx)(`th`,{style:{border:`1px solid #d9d9d9`,padding:8},children:`Scope`}),(0,v.jsx)(`th`,{style:{border:`1px solid #d9d9d9`,padding:8},children:`Target`}),(0,v.jsx)(`th`,{style:{border:`1px solid #d9d9d9`,padding:8},children:`Entity`}),(0,v.jsx)(`th`,{style:{border:`1px solid #d9d9d9`,padding:8},children:`Operation`})]})}),(0,v.jsx)(`tbody`,{children:(0,v.jsxs)(`tr`,{children:[(0,v.jsx)(`td`,{style:{border:`1px solid #d9d9d9`,padding:8},children:`User`}),(0,v.jsx)(`td`,{style:{border:`1px solid #d9d9d9`,padding:8},children:`test@lablup.com`}),(0,v.jsx)(`td`,{style:{border:`1px solid #d9d9d9`,padding:8},children:`Notification Channel`}),(0,v.jsx)(`td`,{style:{border:`1px solid #d9d9d9`,padding:8},children:`Create`})]})})]})}],onOk:()=>t(!1),onCancel:()=>t(!1)})]})}},j={parameters:{docs:{description:{story:`Edge case: empty items array. OK button is disabled.`}}},render:()=>{let[e,t]=(0,_.useState)(!1);return(0,v.jsxs)(v.Fragment,{children:[(0,v.jsx)(u,{danger:!0,icon:(0,v.jsx)(o,{size:`1em`}),onClick:()=>t(!0),children:`Delete (No Selection)`}),(0,v.jsx)(g,{open:e,items:[],onOk:()=>t(!1),onCancel:()=>t(!1)})]})}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
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
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
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
            <Token color="blue" label="Public" />
          </BAIFlex>
    }, {
      key: '2',
      label: <BAIFlex gap="xs" align="center">
            <Folder size="1em" />
            <span>model-weights-v2</span>
            <Token color="red" label="Private" />
          </BAIFlex>
    }, {
      key: '3',
      label: <BAIFlex gap="xs" align="center">
            <Folder size="1em" />
            <span>training-logs</span>
            <Token color="green" label="Archived" />
          </BAIFlex>
    }];
    return <>
        <BAIButton danger icon={<Trash2 size="1em" />} onClick={() => setOpen(true)}>
          Delete Folders
        </BAIButton>
        <BAIDeleteConfirmModal open={open} items={items} onOk={() => setOpen(false)} onCancel={() => setOpen(false)} />
      </>;
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
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
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
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
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
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
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
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
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
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
}`,...j.parameters?.docs?.source}}},M=[`SingleItem`,`SingleItemWithInput`,`WithTarget`,`MultipleItems`,`ManyItems`,`CustomRenderedItems`,`WithExtraContent`,`Reversible`,`ReversibleMultipleItems`,`LongTitle`,`PlainItems`,`EmptyItems`]})))()}N();export{T as CustomRenderedItems,j as EmptyItems,k as LongTitle,w as ManyItems,C as MultipleItems,A as PlainItems,D as Reversible,O as ReversibleMultipleItems,b as SingleItem,x as SingleItemWithInput,E as WithExtraContent,S as WithTarget,M as __namedExportsOrder,y as default};