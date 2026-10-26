import{a as e,n as t}from"./rolldown-runtime-sJBDdmOt.js";import{t as n}from"./react-D0Ex1IVc.js";import{t as r}from"./jsx-runtime-MKhVqBIO.js";import{n as i,t as a}from"./createLucideIcon-R1KMo-hV.js";import{n as o,r as s}from"./copy-to-clipboard-Di__bUGN.js";import{i as c,n as l,r as u,t as d}from"./BAINameActionCell-CnBtZnxf.js";import{n as f,t as p}from"./folder-FzHgyPql.js";import{o as m,s as h}from"./iframe-DHcqzLLD.js";import{n as g,r as _}from"./dist-BWBbun8L.js";var v,y;function b(){return(b=t((()=>{i(),v=[[`circle`,{cx:`18`,cy:`5`,r:`3`,key:`gq8acd`}],[`circle`,{cx:`6`,cy:`12`,r:`3`,key:`w7nqdw`}],[`circle`,{cx:`18`,cy:`19`,r:`3`,key:`1xt0gg`}],[`line`,{x1:`8.59`,x2:`15.42`,y1:`13.51`,y2:`17.49`,key:`47mynk`}],[`line`,{x1:`15.41`,x2:`8.59`,y1:`6.51`,y2:`10.49`,key:`1n3mei`}]],y=a(`share-2`,v)})))()}var x,S;function C(){return(C=t((()=>{i(),x=[[`path`,{d:`M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6`,key:`miytrc`}],[`path`,{d:`M3 6h18`,key:`d0wm0j`}],[`path`,{d:`M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2`,key:`e791ji`}]],S=a(`trash`,x)})))()}var w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K;function q(){return(q=t((()=>{h(),l(),s(),C(),f(),b(),c(),w=e(n(),1),g(),T=r(),E={},D=Promise.resolve(E),O=()=>E,k={en:{lang:`en`},ko:{lang:`ko`}},A={title:`Table/BAINameActionCell`,component:d,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:`
BAINameActionCell is a reusable table cell layout component that combines a title area (icon + text) with responsive action buttons.

## Features

- **Hover actions**: Action buttons appear on hover by default
- **Responsive overflow**: Actions collapse into a "more" menu when the cell is too narrow
- **Navigation support**: Title can be a link via \`to\` prop (React Router)
- **Ellipsis**: Title auto-truncates with tooltip when space is limited
- **Action types**: Supports default and danger action styles
- **Async actions**: Supports \`action\` prop for automatic loading state
        `}}},argTypes:{title:{control:{type:`text`},description:`Primary title text displayed in the cell.`,table:{type:{summary:`string | React.ReactNode`},defaultValue:{summary:`-`}}},to:{control:{type:`text`},description:`Optional React Router path. When set, the title is rendered as a link.`,table:{type:{summary:`string`},defaultValue:{summary:`undefined`}}},actions:{control:!1,description:`List of action definitions rendered as buttons or in the overflow menu.`,table:{type:{summary:`BAINameActionCellAction[]`},defaultValue:{summary:`[]`}}},showActions:{control:{type:`inline-radio`},description:`When to show the actions area.`,table:{type:{summary:`'hover' | 'always'`},defaultValue:{summary:`'hover'`}}},minVisibleActions:{control:{type:`number`},description:`Minimum number of actions to keep visible before collapsing into the "more" menu.`,table:{type:{summary:`number`},defaultValue:{summary:`0`}}},copyable:{control:{type:`boolean`},description:`Show a copy-to-clipboard icon on hover next to the title text.`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},icon:{control:!1,description:`Optional icon rendered before the title.`,table:{type:{summary:`React.ReactNode`},defaultValue:{summary:`undefined`}}}},decorators:[(e,t)=>{let n=t.globals.locale||`en`,r=k[n]||k.en;return(0,T.jsx)(_,{children:(0,T.jsx)(m,{locale:r,clientPromise:D,anonymousClientFactory:O,children:(0,T.jsx)(e,{})})})}]},j=[{key:`edit`,title:`Edit`,icon:(0,T.jsx)(u,{}),onClick:()=>console.log(`Edit clicked`)},{key:`share`,title:`Share`,icon:(0,T.jsx)(y,{size:`1em`}),onClick:()=>console.log(`Share clicked`)},{key:`copy`,title:`Copy`,icon:(0,T.jsx)(o,{size:`1em`}),onClick:()=>console.log(`Copy clicked`)},{key:`delete`,title:`Delete`,icon:(0,T.jsx)(S,{size:`1em`}),type:`danger`,onClick:()=>console.log(`Delete clicked`)}],M={name:`Basic`,parameters:{docs:{description:{story:`Default cell with icon, title, and hover action buttons.`}}},args:{icon:(0,T.jsx)(p,{size:`1em`}),title:`My Project Folder`,actions:j}},N={parameters:{docs:{description:{story:"Title rendered as a React Router link using the `to` prop."}}},args:{icon:(0,T.jsx)(p,{size:`1em`}),title:`Navigable Folder`,to:`/folders/123`,actions:j.slice(0,2)}},P={parameters:{docs:{description:{story:`Actions are always visible, not just on hover.`}}},args:{icon:(0,T.jsx)(p,{size:`1em`}),title:`Always Visible Actions`,actions:j,showActions:`always`}},F={parameters:{docs:{description:{story:`Disabled actions show a reason tooltip and cannot be clicked.`}}},args:{icon:(0,T.jsx)(p,{size:`1em`}),title:`Has Disabled Action`,actions:[...j.slice(0,2),{key:`restore`,title:`Restore`,icon:(0,T.jsx)(o,{size:`1em`}),disabled:{reason:`Cannot restore pipeline folders`}}]}},I={parameters:{docs:{description:{story:"A disabled action keeps its reason after it collapses into the overflow menu. The visible icon button explains itself with a tooltip; the menu row cannot carry one (Astryx types `DropdownMenuItemData.label` as a plain string), so the reason is folded into the label instead. Narrow the container to compare the two. See FR-3423."}}},render:()=>{let[e,t]=w.useState(400);return(0,T.jsxs)(`div`,{children:[(0,T.jsx)(`div`,{style:{marginBottom:16},children:(0,T.jsxs)(`label`,{children:[`Container width: `,e,`px`,(0,T.jsx)(`input`,{type:`range`,min:120,max:600,value:e,onChange:e=>t(Number(e.target.value)),style:{marginLeft:8,width:200}})]})}),(0,T.jsx)(`div`,{style:{width:e,border:`1px solid #d9d9d9`,padding:`8px 12px`,borderRadius:4},children:(0,T.jsx)(d,{icon:(0,T.jsx)(p,{size:`1em`}),title:`model-weights`,showActions:`always`,actions:[...j,{key:`start-service`,title:`Deploy as service`,icon:(0,T.jsx)(o,{size:`1em`}),disabled:{reason:`Create deployments from a project's Data page`}}]})})]})}},L={parameters:{docs:{description:{story:`Long titles are truncated with an ellipsis tooltip.`}}},args:{icon:(0,T.jsx)(p,{size:`1em`}),title:`This is a very long folder name that should be truncated with ellipsis when the column is narrow`,actions:j},decorators:[e=>(0,T.jsx)(`div`,{style:{width:300},children:(0,T.jsx)(e,{})})]},R={parameters:{docs:{description:{story:`Drag the slider to see actions collapse into the overflow menu.`}}},render:()=>{let[e,t]=w.useState(400);return(0,T.jsxs)(`div`,{children:[(0,T.jsx)(`div`,{style:{marginBottom:16},children:(0,T.jsxs)(`label`,{children:[`Container width: `,e,`px`,(0,T.jsx)(`input`,{type:`range`,min:120,max:600,value:e,onChange:e=>t(Number(e.target.value)),style:{marginLeft:8,width:200}})]})}),(0,T.jsx)(`div`,{style:{width:e,border:`1px solid #d9d9d9`,padding:`8px 12px`,borderRadius:4},children:(0,T.jsx)(d,{icon:(0,T.jsx)(p,{size:`1em`}),title:`Resize to see overflow`,actions:j,showActions:`always`})})]})}},z={parameters:{docs:{description:{story:`Responsive overflow combined with a navigable title link.`}}},render:()=>{let[e,t]=w.useState(400);return(0,T.jsxs)(`div`,{children:[(0,T.jsx)(`div`,{style:{marginBottom:16},children:(0,T.jsxs)(`label`,{children:[`Container width: `,e,`px`,(0,T.jsx)(`input`,{type:`range`,min:120,max:600,value:e,onChange:e=>t(Number(e.target.value)),style:{marginLeft:8,width:200}})]})}),(0,T.jsx)(`div`,{style:{width:e,border:`1px solid #d9d9d9`,padding:`8px 12px`,borderRadius:4},children:(0,T.jsx)(d,{icon:(0,T.jsx)(p,{size:`1em`}),title:`This is a long navigable folder name for ellipsis testing`,to:`/folders/123`,actions:j,showActions:`always`})})]})}},B={parameters:{docs:{description:{story:'Actions with `showInMenu: "always"` are always placed in the dropdown menu.'}}},args:{icon:(0,T.jsx)(p,{size:`1em`}),title:`Some actions are menu-only`,actions:[{key:`edit`,title:`Edit`,icon:(0,T.jsx)(u,{}),onClick:()=>console.log(`Edit clicked`)},{key:`share`,title:`Share`,icon:(0,T.jsx)(y,{size:`1em`}),onClick:()=>console.log(`Share clicked`)},{key:`copy`,title:`Copy`,icon:(0,T.jsx)(o,{size:`1em`}),showInMenu:`always`,onClick:()=>console.log(`Copy clicked`)},{key:`delete`,title:`Delete`,icon:(0,T.jsx)(S,{size:`1em`}),type:`danger`,showInMenu:`always`,onClick:()=>console.log(`Delete clicked`)}],showActions:`always`}},V={parameters:{docs:{description:{story:`A copy-to-clipboard icon appears on hover next to the title text. Works with plain text, links, and clickable titles.`}}},args:{icon:(0,T.jsx)(p,{size:`1em`}),title:`Copyable Folder Name`,actions:j.slice(0,2),copyable:!0}},H={parameters:{docs:{description:{story:`Copyable name combined with a navigable title link. The copy icon appears on hover.`}}},args:{icon:(0,T.jsx)(p,{size:`1em`}),title:`Navigable Copyable Folder`,to:`/folders/123`,actions:j.slice(0,2),copyable:!0}},U={parameters:{docs:{description:{story:`Copyable name with action buttons always visible (not hover-only). Verifies copy icon positioning alongside persistent actions.`}}},args:{icon:(0,T.jsx)(p,{size:`1em`}),title:`Copyable With Always Actions`,actions:j.slice(0,2),copyable:!0,showActions:`always`}},W={parameters:{docs:{description:{story:`Cell without any actions — only icon and title.`}}},args:{icon:(0,T.jsx)(p,{size:`1em`}),title:`No actions, title only`}},G={parameters:{docs:{description:{story:"Async action with automatic loading state via the `action` prop."}}},args:{icon:(0,T.jsx)(p,{size:`1em`}),title:`With Async Action`,actions:[{key:`deploy`,title:`Deploy (takes 2s)`,icon:(0,T.jsx)(o,{size:`1em`}),action:()=>new Promise(e=>setTimeout(e,2e3))}],showActions:`always`}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
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
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
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
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
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
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
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
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'A disabled action keeps its reason after it collapses into the ' + 'overflow menu. The visible icon button explains itself with a ' + 'tooltip; the menu row cannot carry one (Astryx types ' + '\`DropdownMenuItemData.label\` as a plain string), so the reason is ' + 'folded into the label instead. Narrow the container to compare ' + 'the two. See FR-3423.'
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
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
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
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
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
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
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
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
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
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
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
}`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
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
}`,...H.parameters?.docs?.source}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
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
}`,...U.parameters?.docs?.source}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
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
}`,...W.parameters?.docs?.source}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
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
}`,...G.parameters?.docs?.source}}},K=[`Default`,`WithNavigation`,`AlwaysShowActions`,`WithDisabledAction`,`DisabledActionInOverflowMenu`,`LongTitle`,`ResponsiveOverflow`,`ResponsiveOverflowWithLink`,`MenuOnlyActions`,`CopyableName`,`CopyableNameWithLink`,`CopyableNameWithAlwaysVisibleActions`,`TitleOnly`,`AsyncAction`]})))()}q();export{P as AlwaysShowActions,G as AsyncAction,V as CopyableName,U as CopyableNameWithAlwaysVisibleActions,H as CopyableNameWithLink,M as Default,I as DisabledActionInOverflowMenu,L as LongTitle,B as MenuOnlyActions,R as ResponsiveOverflow,z as ResponsiveOverflowWithLink,W as TitleOnly,F as WithDisabledAction,N as WithNavigation,K as __namedExportsOrder,A as default};