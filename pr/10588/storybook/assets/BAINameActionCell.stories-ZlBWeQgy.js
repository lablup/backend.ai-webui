import{n as e}from"./rolldown-runtime-2s6bX4vc.js";import{n as t,t as n}from"./createLucideIcon-CRb7bAU8.js";import{n as r,r as i}from"./copy-to-clipboard-Br8kShL2.js";import{i as a,n as o,r as s,t as c}from"./BAINameActionCell-BWY4UVgq.js";import{n as l,t as u}from"./folder-BN1waz-_.js";import{a as d,i as f}from"./iframe-DR2sIF5r.js";import p from"react";import{jsx as m,jsxs as h}from"react/jsx-runtime";import{MemoryRouter as g}from"react-router-dom";var _,v;function y(){return(y=e((()=>{t(),_=[[`circle`,{cx:`18`,cy:`5`,r:`3`,key:`gq8acd`}],[`circle`,{cx:`6`,cy:`12`,r:`3`,key:`w7nqdw`}],[`circle`,{cx:`18`,cy:`19`,r:`3`,key:`1xt0gg`}],[`line`,{x1:`8.59`,x2:`15.42`,y1:`13.51`,y2:`17.49`,key:`47mynk`}],[`line`,{x1:`15.41`,x2:`8.59`,y1:`6.51`,y2:`10.49`,key:`1n3mei`}]],v=n(`share-2`,_)})))()}var b,x;function S(){return(S=e((()=>{t(),b=[[`path`,{d:`M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6`,key:`miytrc`}],[`path`,{d:`M3 6h18`,key:`d0wm0j`}],[`path`,{d:`M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2`,key:`e791ji`}]],x=n(`trash`,b)})))()}var C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U;function W(){return(W=e((()=>{d(),o(),i(),S(),l(),y(),a(),C={},w=Promise.resolve(C),T=()=>C,E={en:{lang:`en`},ko:{lang:`ko`}},D={title:`Table/BAINameActionCell`,component:c,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:`
BAINameActionCell is a reusable table cell layout component that combines a title area (icon + text) with responsive action buttons.

## Features

- **Hover actions**: Action buttons appear on hover by default
- **Responsive overflow**: Actions collapse into a "more" menu when the cell is too narrow
- **Navigation support**: Title can be a link via \`to\` prop (React Router)
- **Ellipsis**: Title auto-truncates with tooltip when space is limited
- **Action types**: Supports default and danger action styles
- **Async actions**: Supports \`action\` prop for automatic loading state
        `}}},argTypes:{title:{control:{type:`text`},description:`Primary title text displayed in the cell.`,table:{type:{summary:`string | React.ReactNode`},defaultValue:{summary:`-`}}},to:{control:{type:`text`},description:`Optional React Router path. When set, the title is rendered as a link.`,table:{type:{summary:`string`},defaultValue:{summary:`undefined`}}},actions:{control:!1,description:`List of action definitions rendered as buttons or in the overflow menu.`,table:{type:{summary:`BAINameActionCellAction[]`},defaultValue:{summary:`[]`}}},showActions:{control:{type:`inline-radio`},description:`When to show the actions area.`,table:{type:{summary:`'hover' | 'always'`},defaultValue:{summary:`'hover'`}}},minVisibleActions:{control:{type:`number`},description:`Minimum number of actions to keep visible before collapsing into the "more" menu.`,table:{type:{summary:`number`},defaultValue:{summary:`0`}}},copyable:{control:{type:`boolean`},description:`Show a copy-to-clipboard icon on hover next to the title text.`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},icon:{control:!1,description:`Optional icon rendered before the title.`,table:{type:{summary:`React.ReactNode`},defaultValue:{summary:`undefined`}}}},decorators:[(e,t)=>{let n=t.globals.locale||`en`,r=E[n]||E.en;return m(g,{children:m(f,{locale:r,clientPromise:w,anonymousClientFactory:T,children:m(e,{})})})}]},O=[{key:`edit`,title:`Edit`,icon:m(s,{}),onClick:()=>console.log(`Edit clicked`)},{key:`share`,title:`Share`,icon:m(v,{size:`1em`}),onClick:()=>console.log(`Share clicked`)},{key:`copy`,title:`Copy`,icon:m(r,{size:`1em`}),onClick:()=>console.log(`Copy clicked`)},{key:`delete`,title:`Delete`,icon:m(x,{size:`1em`}),type:`danger`,onClick:()=>console.log(`Delete clicked`)}],k={name:`Basic`,parameters:{docs:{description:{story:`Default cell with icon, title, and hover action buttons.`}}},args:{icon:m(u,{size:`1em`}),title:`My Project Folder`,actions:O}},A={parameters:{docs:{description:{story:"Title rendered as a React Router link using the `to` prop."}}},args:{icon:m(u,{size:`1em`}),title:`Navigable Folder`,to:`/folders/123`,actions:O.slice(0,2)}},j={parameters:{docs:{description:{story:`Actions are always visible, not just on hover.`}}},args:{icon:m(u,{size:`1em`}),title:`Always Visible Actions`,actions:O,showActions:`always`}},M={parameters:{docs:{description:{story:`Disabled actions show a reason tooltip and cannot be clicked.`}}},args:{icon:m(u,{size:`1em`}),title:`Has Disabled Action`,actions:[...O.slice(0,2),{key:`restore`,title:`Restore`,icon:m(r,{size:`1em`}),disabled:{reason:`Cannot restore pipeline folders`}}]}},N={parameters:{docs:{description:{story:"A disabled action keeps its reason after it collapses into the overflow menu. The visible icon button explains itself with a tooltip; the menu row cannot carry one (Astryx types `DropdownMenuItemData.label` as a plain string), so the reason is folded into the label instead. Narrow the container to compare the two. See FR-3423."}}},render:()=>{let[e,t]=p.useState(400);return h(`div`,{children:[m(`div`,{style:{marginBottom:16},children:h(`label`,{children:[`Container width: `,e,`px`,m(`input`,{type:`range`,min:120,max:600,value:e,onChange:e=>t(Number(e.target.value)),style:{marginLeft:8,width:200}})]})}),m(`div`,{style:{width:e,border:`1px solid #d9d9d9`,padding:`8px 12px`,borderRadius:4},children:m(c,{icon:m(u,{size:`1em`}),title:`model-weights`,showActions:`always`,actions:[...O,{key:`start-service`,title:`Deploy as service`,icon:m(r,{size:`1em`}),disabled:{reason:`Create deployments from a project's Data page`}}]})})]})}},P={parameters:{docs:{description:{story:`Long titles are truncated with an ellipsis tooltip.`}}},args:{icon:m(u,{size:`1em`}),title:`This is a very long folder name that should be truncated with ellipsis when the column is narrow`,actions:O},decorators:[e=>m(`div`,{style:{width:300},children:m(e,{})})]},F={parameters:{docs:{description:{story:`Drag the slider to see actions collapse into the overflow menu.`}}},render:()=>{let[e,t]=p.useState(400);return h(`div`,{children:[m(`div`,{style:{marginBottom:16},children:h(`label`,{children:[`Container width: `,e,`px`,m(`input`,{type:`range`,min:120,max:600,value:e,onChange:e=>t(Number(e.target.value)),style:{marginLeft:8,width:200}})]})}),m(`div`,{style:{width:e,border:`1px solid #d9d9d9`,padding:`8px 12px`,borderRadius:4},children:m(c,{icon:m(u,{size:`1em`}),title:`Resize to see overflow`,actions:O,showActions:`always`})})]})}},I={parameters:{docs:{description:{story:`Responsive overflow combined with a navigable title link.`}}},render:()=>{let[e,t]=p.useState(400);return h(`div`,{children:[m(`div`,{style:{marginBottom:16},children:h(`label`,{children:[`Container width: `,e,`px`,m(`input`,{type:`range`,min:120,max:600,value:e,onChange:e=>t(Number(e.target.value)),style:{marginLeft:8,width:200}})]})}),m(`div`,{style:{width:e,border:`1px solid #d9d9d9`,padding:`8px 12px`,borderRadius:4},children:m(c,{icon:m(u,{size:`1em`}),title:`This is a long navigable folder name for ellipsis testing`,to:`/folders/123`,actions:O,showActions:`always`})})]})}},L={parameters:{docs:{description:{story:'Actions with `showInMenu: "always"` are always placed in the dropdown menu.'}}},args:{icon:m(u,{size:`1em`}),title:`Some actions are menu-only`,actions:[{key:`edit`,title:`Edit`,icon:m(s,{}),onClick:()=>console.log(`Edit clicked`)},{key:`share`,title:`Share`,icon:m(v,{size:`1em`}),onClick:()=>console.log(`Share clicked`)},{key:`copy`,title:`Copy`,icon:m(r,{size:`1em`}),showInMenu:`always`,onClick:()=>console.log(`Copy clicked`)},{key:`delete`,title:`Delete`,icon:m(x,{size:`1em`}),type:`danger`,showInMenu:`always`,onClick:()=>console.log(`Delete clicked`)}],showActions:`always`}},R={parameters:{docs:{description:{story:`A copy-to-clipboard icon appears on hover next to the title text. Works with plain text, links, and clickable titles.`}}},args:{icon:m(u,{size:`1em`}),title:`Copyable Folder Name`,actions:O.slice(0,2),copyable:!0}},z={parameters:{docs:{description:{story:`Copyable name combined with a navigable title link. The copy icon appears on hover.`}}},args:{icon:m(u,{size:`1em`}),title:`Navigable Copyable Folder`,to:`/folders/123`,actions:O.slice(0,2),copyable:!0}},B={parameters:{docs:{description:{story:`Copyable name with action buttons always visible (not hover-only). Verifies copy icon positioning alongside persistent actions.`}}},args:{icon:m(u,{size:`1em`}),title:`Copyable With Always Actions`,actions:O.slice(0,2),copyable:!0,showActions:`always`}},V={parameters:{docs:{description:{story:`Cell without any actions — only icon and title.`}}},args:{icon:m(u,{size:`1em`}),title:`No actions, title only`}},H={parameters:{docs:{description:{story:"Async action with automatic loading state via the `action` prop."}}},args:{icon:m(u,{size:`1em`}),title:`With Async Action`,actions:[{key:`deploy`,title:`Deploy (takes 2s)`,icon:m(r,{size:`1em`}),action:()=>new Promise(e=>setTimeout(e,2e3))}],showActions:`always`}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
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
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
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
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
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
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
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
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
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
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
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
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
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
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
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
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
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
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
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
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
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
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
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
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
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
}`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
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
}`,...H.parameters?.docs?.source}}},U=[`Default`,`WithNavigation`,`AlwaysShowActions`,`WithDisabledAction`,`DisabledActionInOverflowMenu`,`LongTitle`,`ResponsiveOverflow`,`ResponsiveOverflowWithLink`,`MenuOnlyActions`,`CopyableName`,`CopyableNameWithLink`,`CopyableNameWithAlwaysVisibleActions`,`TitleOnly`,`AsyncAction`]})))()}W();export{j as AlwaysShowActions,H as AsyncAction,R as CopyableName,B as CopyableNameWithAlwaysVisibleActions,z as CopyableNameWithLink,k as Default,N as DisabledActionInOverflowMenu,P as LongTitle,L as MenuOnlyActions,F as ResponsiveOverflow,I as ResponsiveOverflowWithLink,V as TitleOnly,M as WithDisabledAction,A as WithNavigation,U as __namedExportsOrder,D as default};