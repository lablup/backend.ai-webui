import{a as e,n as t}from"./rolldown-runtime-sJBDdmOt.js";import{t as n}from"./react-DlPsW1c0.js";import{t as r}from"./jsx-runtime-MKhVqBIO.js";import{n as i,t as a}from"./createLucideIcon-BXqG86fR.js";import{n as o,r as s}from"./copy-to-clipboard-CK9oSJ_O.js";import{i as c,n as l,r as u,t as d}from"./BAINameActionCell-lAcAbO7D.js";import{n as f,t as p}from"./folder-yfByioMe.js";import{n as m,t as h}from"./trash-FTNL_zRp.js";import{o as g,s as _}from"./iframe-DzeX84rh.js";import{n as v,r as y}from"./dist-CCUsDPCX.js";var b,x;function S(){return(S=t((()=>{i(),b={name:`share-2`,size:24,node:[[`circle`,{cx:`18`,cy:`5`,r:`3`,key:`gq8acd`}],[`circle`,{cx:`6`,cy:`12`,r:`3`,key:`w7nqdw`}],[`circle`,{cx:`18`,cy:`19`,r:`3`,key:`1xt0gg`}],[`line`,{x1:`8.59`,x2:`15.42`,y1:`13.51`,y2:`17.49`,key:`47mynk`}],[`line`,{x1:`15.41`,x2:`8.59`,y1:`6.51`,y2:`10.49`,key:`1n3mei`}]]},b.node,x=a(b)})))()}var C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G;function K(){return(K=t((()=>{_(),l(),s(),m(),f(),S(),c(),C=e(n(),1),v(),w=r(),T={},E=Promise.resolve(T),D=()=>T,O={en:{lang:`en`},ko:{lang:`ko`}},k={title:`Table/BAINameActionCell`,component:d,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:`
BAINameActionCell is a reusable table cell layout component that combines a title area (icon + text) with responsive action buttons.

## Features

- **Hover actions**: Action buttons appear on hover by default
- **Responsive overflow**: Actions collapse into a "more" menu when the cell is too narrow
- **Navigation support**: Title can be a link via \`to\` prop (React Router)
- **Ellipsis**: Title auto-truncates with tooltip when space is limited
- **Action types**: Supports default and danger action styles
- **Async actions**: Supports \`action\` prop for automatic loading state
        `}}},argTypes:{title:{control:{type:`text`},description:`Primary title text displayed in the cell.`,table:{type:{summary:`string | React.ReactNode`},defaultValue:{summary:`-`}}},to:{control:{type:`text`},description:`Optional React Router path. When set, the title is rendered as a link.`,table:{type:{summary:`string`},defaultValue:{summary:`undefined`}}},actions:{control:!1,description:`List of action definitions rendered as buttons or in the overflow menu.`,table:{type:{summary:`BAINameActionCellAction[]`},defaultValue:{summary:`[]`}}},showActions:{control:{type:`inline-radio`},description:`When to show the actions area.`,table:{type:{summary:`'hover' | 'always'`},defaultValue:{summary:`'hover'`}}},minVisibleActions:{control:{type:`number`},description:`Minimum number of actions to keep visible before collapsing into the "more" menu.`,table:{type:{summary:`number`},defaultValue:{summary:`0`}}},copyable:{control:{type:`boolean`},description:`Show a copy-to-clipboard icon on hover next to the title text.`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},icon:{control:!1,description:`Optional icon rendered before the title.`,table:{type:{summary:`React.ReactNode`},defaultValue:{summary:`undefined`}}}},decorators:[(e,t)=>{let n=t.globals.locale||`en`,r=O[n]||O.en;return(0,w.jsx)(y,{children:(0,w.jsx)(g,{locale:r,clientPromise:E,anonymousClientFactory:D,children:(0,w.jsx)(e,{})})})}]},A=[{key:`edit`,title:`Edit`,icon:(0,w.jsx)(u,{}),onClick:()=>console.log(`Edit clicked`)},{key:`share`,title:`Share`,icon:(0,w.jsx)(x,{size:`1em`}),onClick:()=>console.log(`Share clicked`)},{key:`copy`,title:`Copy`,icon:(0,w.jsx)(o,{size:`1em`}),onClick:()=>console.log(`Copy clicked`)},{key:`delete`,title:`Delete`,icon:(0,w.jsx)(h,{size:`1em`}),type:`danger`,onClick:()=>console.log(`Delete clicked`)}],j={name:`Basic`,parameters:{docs:{description:{story:`Default cell with icon, title, and hover action buttons.`}}},args:{icon:(0,w.jsx)(p,{size:`1em`}),title:`My Project Folder`,actions:A}},M={parameters:{docs:{description:{story:"Title rendered as a React Router link using the `to` prop."}}},args:{icon:(0,w.jsx)(p,{size:`1em`}),title:`Navigable Folder`,to:`/folders/123`,actions:A.slice(0,2)}},N={parameters:{docs:{description:{story:`Actions are always visible, not just on hover.`}}},args:{icon:(0,w.jsx)(p,{size:`1em`}),title:`Always Visible Actions`,actions:A,showActions:`always`}},P={parameters:{docs:{description:{story:`Disabled actions show a reason tooltip and cannot be clicked.`}}},args:{icon:(0,w.jsx)(p,{size:`1em`}),title:`Has Disabled Action`,actions:[...A.slice(0,2),{key:`restore`,title:`Restore`,icon:(0,w.jsx)(o,{size:`1em`}),disabled:{reason:`Cannot restore pipeline folders`}}]}},F={parameters:{docs:{description:{story:`A disabled action keeps its reason after it collapses into the overflow menu. The visible icon button explains itself with a tooltip, and so does the menu row: hover its label to read the reason. Narrow the container to compare the two.`}}},render:()=>{let[e,t]=C.useState(400);return(0,w.jsxs)(`div`,{children:[(0,w.jsx)(`div`,{style:{marginBottom:16},children:(0,w.jsxs)(`label`,{children:[`Container width: `,e,`px`,(0,w.jsx)(`input`,{type:`range`,min:120,max:600,value:e,onChange:e=>t(Number(e.target.value)),style:{marginLeft:8,width:200}})]})}),(0,w.jsx)(`div`,{style:{width:e,border:`1px solid #d9d9d9`,padding:`8px 12px`,borderRadius:4},children:(0,w.jsx)(d,{icon:(0,w.jsx)(p,{size:`1em`}),title:`model-weights`,showActions:`always`,actions:[...A,{key:`start-service`,title:`Deploy as service`,icon:(0,w.jsx)(o,{size:`1em`}),disabled:{reason:`Create deployments from a project's Data page`}}]})})]})}},I={parameters:{docs:{description:{story:`Long titles are truncated with an ellipsis tooltip.`}}},args:{icon:(0,w.jsx)(p,{size:`1em`}),title:`This is a very long folder name that should be truncated with ellipsis when the column is narrow`,actions:A},decorators:[e=>(0,w.jsx)(`div`,{style:{width:300},children:(0,w.jsx)(e,{})})]},L={parameters:{docs:{description:{story:`Drag the slider to see actions collapse into the overflow menu.`}}},render:()=>{let[e,t]=C.useState(400);return(0,w.jsxs)(`div`,{children:[(0,w.jsx)(`div`,{style:{marginBottom:16},children:(0,w.jsxs)(`label`,{children:[`Container width: `,e,`px`,(0,w.jsx)(`input`,{type:`range`,min:120,max:600,value:e,onChange:e=>t(Number(e.target.value)),style:{marginLeft:8,width:200}})]})}),(0,w.jsx)(`div`,{style:{width:e,border:`1px solid #d9d9d9`,padding:`8px 12px`,borderRadius:4},children:(0,w.jsx)(d,{icon:(0,w.jsx)(p,{size:`1em`}),title:`Resize to see overflow`,actions:A,showActions:`always`})})]})}},R={parameters:{docs:{description:{story:`Responsive overflow combined with a navigable title link.`}}},render:()=>{let[e,t]=C.useState(400);return(0,w.jsxs)(`div`,{children:[(0,w.jsx)(`div`,{style:{marginBottom:16},children:(0,w.jsxs)(`label`,{children:[`Container width: `,e,`px`,(0,w.jsx)(`input`,{type:`range`,min:120,max:600,value:e,onChange:e=>t(Number(e.target.value)),style:{marginLeft:8,width:200}})]})}),(0,w.jsx)(`div`,{style:{width:e,border:`1px solid #d9d9d9`,padding:`8px 12px`,borderRadius:4},children:(0,w.jsx)(d,{icon:(0,w.jsx)(p,{size:`1em`}),title:`This is a long navigable folder name for ellipsis testing`,to:`/folders/123`,actions:A,showActions:`always`})})]})}},z={parameters:{docs:{description:{story:'Actions with `showInMenu: "always"` are always placed in the dropdown menu.'}}},args:{icon:(0,w.jsx)(p,{size:`1em`}),title:`Some actions are menu-only`,actions:[{key:`edit`,title:`Edit`,icon:(0,w.jsx)(u,{}),onClick:()=>console.log(`Edit clicked`)},{key:`share`,title:`Share`,icon:(0,w.jsx)(x,{size:`1em`}),onClick:()=>console.log(`Share clicked`)},{key:`copy`,title:`Copy`,icon:(0,w.jsx)(o,{size:`1em`}),showInMenu:`always`,onClick:()=>console.log(`Copy clicked`)},{key:`delete`,title:`Delete`,icon:(0,w.jsx)(h,{size:`1em`}),type:`danger`,showInMenu:`always`,onClick:()=>console.log(`Delete clicked`)}],showActions:`always`}},B={parameters:{docs:{description:{story:`A copy-to-clipboard icon appears on hover next to the title text. Works with plain text, links, and clickable titles.`}}},args:{icon:(0,w.jsx)(p,{size:`1em`}),title:`Copyable Folder Name`,actions:A.slice(0,2),copyable:!0}},V={parameters:{docs:{description:{story:`Copyable name combined with a navigable title link. The copy icon appears on hover.`}}},args:{icon:(0,w.jsx)(p,{size:`1em`}),title:`Navigable Copyable Folder`,to:`/folders/123`,actions:A.slice(0,2),copyable:!0}},H={parameters:{docs:{description:{story:`Copyable name with action buttons always visible (not hover-only). Verifies copy icon positioning alongside persistent actions.`}}},args:{icon:(0,w.jsx)(p,{size:`1em`}),title:`Copyable With Always Actions`,actions:A.slice(0,2),copyable:!0,showActions:`always`}},U={parameters:{docs:{description:{story:`Cell without any actions — only icon and title.`}}},args:{icon:(0,w.jsx)(p,{size:`1em`}),title:`No actions, title only`}},W={parameters:{docs:{description:{story:"Async action with automatic loading state via the `action` prop."}}},args:{icon:(0,w.jsx)(p,{size:`1em`}),title:`With Async Action`,actions:[{key:`deploy`,title:`Deploy (takes 2s)`,icon:(0,w.jsx)(o,{size:`1em`}),action:()=>new Promise(e=>setTimeout(e,2e3))}],showActions:`always`}},G=[`Default`,`WithNavigation`,`AlwaysShowActions`,`WithDisabledAction`,`DisabledActionInOverflowMenu`,`LongTitle`,`ResponsiveOverflow`,`ResponsiveOverflowWithLink`,`MenuOnlyActions`,`CopyableName`,`CopyableNameWithLink`,`CopyableNameWithAlwaysVisibleActions`,`TitleOnly`,`AsyncAction`],j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'Default cell with icon, title, and hover action buttons.'
      }
    }
  },
  args: {
    icon: <Folder size="1em" />,
    title: 'My Project Folder',
    actions: sampleActions
  }
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Title rendered as a React Router link using the \`to\` prop.'
      }
    }
  },
  args: {
    icon: <Folder size="1em" />,
    title: 'Navigable Folder',
    to: '/folders/123',
    actions: sampleActions.slice(0, 2)
  }
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Actions are always visible, not just on hover.'
      }
    }
  },
  args: {
    icon: <Folder size="1em" />,
    title: 'Always Visible Actions',
    actions: sampleActions,
    showActions: 'always'
  }
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Disabled actions show a reason tooltip and cannot be clicked.'
      }
    }
  },
  args: {
    icon: <Folder size="1em" />,
    title: 'Has Disabled Action',
    actions: [...sampleActions.slice(0, 2), {
      key: 'restore',
      title: 'Restore',
      icon: <Copy size="1em" />,
      disabled: {
        reason: 'Cannot restore pipeline folders'
      }
    }]
  }
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'A disabled action keeps its reason after it collapses into the ' + 'overflow menu. The visible icon button explains itself with a ' + 'tooltip, and so does the menu row: hover its label to read the ' + 'reason. Narrow the container to compare the two.'
      }
    }
  },
  render: () => {
    const [width, setWidth] = React.useState(400);
    return <div>
        <div style={{
        marginBottom: 16
      }}>
          <label>
            Container width: {width}px
            <input type="range" min={120} max={600} value={width} onChange={e => setWidth(Number(e.target.value))} style={{
            marginLeft: 8,
            width: 200
          }} />
          </label>
        </div>
        <div style={{
        width,
        border: '1px solid #d9d9d9',
        padding: '8px 12px',
        borderRadius: 4
      }}>
          <BAINameActionCell icon={<Folder size="1em" />} title="model-weights" showActions="always" actions={[...sampleActions, {
          key: 'start-service',
          title: 'Deploy as service',
          icon: <Copy size="1em" />,
          disabled: {
            reason: "Create deployments from a project's Data page"
          }
        }]} />
        </div>
      </div>;
  }
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Long titles are truncated with an ellipsis tooltip.'
      }
    }
  },
  args: {
    icon: <Folder size="1em" />,
    title: 'This is a very long folder name that should be truncated with ellipsis when the column is narrow',
    actions: sampleActions
  },
  decorators: [Story => <div style={{
    width: 300
  }}>
        <Story />
      </div>]
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Drag the slider to see actions collapse into the overflow menu.'
      }
    }
  },
  render: () => {
    const [width, setWidth] = React.useState(400);
    return <div>
        <div style={{
        marginBottom: 16
      }}>
          <label>
            Container width: {width}px
            <input type="range" min={120} max={600} value={width} onChange={e => setWidth(Number(e.target.value))} style={{
            marginLeft: 8,
            width: 200
          }} />
          </label>
        </div>
        <div style={{
        width,
        border: '1px solid #d9d9d9',
        padding: '8px 12px',
        borderRadius: 4
      }}>
          <BAINameActionCell icon={<Folder size="1em" />} title="Resize to see overflow" actions={sampleActions} showActions="always" />
        </div>
      </div>;
  }
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Responsive overflow combined with a navigable title link.'
      }
    }
  },
  render: () => {
    const [width, setWidth] = React.useState(400);
    return <div>
        <div style={{
        marginBottom: 16
      }}>
          <label>
            Container width: {width}px
            <input type="range" min={120} max={600} value={width} onChange={e => setWidth(Number(e.target.value))} style={{
            marginLeft: 8,
            width: 200
          }} />
          </label>
        </div>
        <div style={{
        width,
        border: '1px solid #d9d9d9',
        padding: '8px 12px',
        borderRadius: 4
      }}>
          <BAINameActionCell icon={<Folder size="1em" />} title="This is a long navigable folder name for ellipsis testing" to="/folders/123" actions={sampleActions} showActions="always" />
        </div>
      </div>;
  }
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Actions with \`showInMenu: "always"\` are always placed in the dropdown menu.'
      }
    }
  },
  args: {
    icon: <Folder size="1em" />,
    title: 'Some actions are menu-only',
    actions: [{
      key: 'edit',
      title: 'Edit',
      icon: <SquarePenIcon />,
      onClick: () => console.log('Edit clicked')
    }, {
      key: 'share',
      title: 'Share',
      icon: <Share2 size="1em" />,
      onClick: () => console.log('Share clicked')
    }, {
      key: 'copy',
      title: 'Copy',
      icon: <Copy size="1em" />,
      showInMenu: 'always',
      onClick: () => console.log('Copy clicked')
    }, {
      key: 'delete',
      title: 'Delete',
      icon: <Trash size="1em" />,
      type: 'danger',
      showInMenu: 'always',
      onClick: () => console.log('Delete clicked')
    }],
    showActions: 'always'
  }
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'A copy-to-clipboard icon appears on hover next to the title text. Works with plain text, links, and clickable titles.'
      }
    }
  },
  args: {
    icon: <Folder size="1em" />,
    title: 'Copyable Folder Name',
    actions: sampleActions.slice(0, 2),
    copyable: true
  }
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Copyable name combined with a navigable title link. The copy icon appears on hover.'
      }
    }
  },
  args: {
    icon: <Folder size="1em" />,
    title: 'Navigable Copyable Folder',
    to: '/folders/123',
    actions: sampleActions.slice(0, 2),
    copyable: true
  }
}`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Copyable name with action buttons always visible (not hover-only). Verifies copy icon positioning alongside persistent actions.'
      }
    }
  },
  args: {
    icon: <Folder size="1em" />,
    title: 'Copyable With Always Actions',
    actions: sampleActions.slice(0, 2),
    copyable: true,
    showActions: 'always'
  }
}`,...H.parameters?.docs?.source}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Cell without any actions — only icon and title.'
      }
    }
  },
  args: {
    icon: <Folder size="1em" />,
    title: 'No actions, title only'
  }
}`,...U.parameters?.docs?.source}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Async action with automatic loading state via the \`action\` prop.'
      }
    }
  },
  args: {
    icon: <Folder size="1em" />,
    title: 'With Async Action',
    actions: [{
      key: 'deploy',
      title: 'Deploy (takes 2s)',
      icon: <Copy size="1em" />,
      action: () => new Promise(resolve => setTimeout(resolve, 2000))
    }],
    showActions: 'always'
  }
}`,...W.parameters?.docs?.source}}}})))()}K();export{N as AlwaysShowActions,W as AsyncAction,B as CopyableName,H as CopyableNameWithAlwaysVisibleActions,V as CopyableNameWithLink,j as Default,F as DisabledActionInOverflowMenu,I as LongTitle,z as MenuOnlyActions,L as ResponsiveOverflow,R as ResponsiveOverflowWithLink,U as TitleOnly,P as WithDisabledAction,M as WithNavigation,G as __namedExportsOrder,k as default};