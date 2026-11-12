import{a as e,n as t}from"./rolldown-runtime-sJBDdmOt.js";import{t as ee}from"./react-DlPsW1c0.js";import{t as n}from"./jsx-runtime-MKhVqBIO.js";import{n as te,t as ne}from"./createLucideIcon-DZQmmCGU.js";import{n as r,r as re}from"./copy-to-clipboard-B1sQBbES.js";import{i as ie,n as ae,r as oe,t as i}from"./BAINameActionCell-CyfVyuG0.js";import{n as se,t as a}from"./folder-CWFqlI_x.js";import{n as ce,t as le}from"./trash-CpqNGZEX.js";import{o as ue,s as de}from"./iframe-CG1vgv3M.js";import{n as fe,r as pe}from"./dist-VyLUzrdQ.js";var o,s;function me(){return(me=t((()=>{te(),o={name:`share-2`,size:24,node:[[`circle`,{cx:`18`,cy:`5`,r:`3`,key:`gq8acd`}],[`circle`,{cx:`6`,cy:`12`,r:`3`,key:`w7nqdw`}],[`circle`,{cx:`18`,cy:`19`,r:`3`,key:`1xt0gg`}],[`line`,{x1:`8.59`,x2:`15.42`,y1:`13.51`,y2:`17.49`,key:`47mynk`}],[`line`,{x1:`15.41`,x2:`8.59`,y1:`6.51`,y2:`10.49`,key:`1n3mei`}]]},o.node,s=ne(o)})))()}var c,l,u,d,f,p,he,m,h,g,_,v,y,b,ge,x,S,C,_e,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,ve,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q,$,ye;function be(){return(be=t((()=>{de(),ae(),re(),ce(),se(),me(),ie(),c=e(ee(),1),fe(),l=n(),F={},I=Promise.resolve(F),L=()=>F,R={en:{lang:`en`},ko:{lang:`ko`}},ve={title:`Table/BAINameActionCell`,component:i,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:`
BAINameActionCell is a reusable table cell layout component that combines a title area (icon + text) with responsive action buttons.

## Features

- **Hover actions**: Action buttons appear on hover by default
- **Responsive overflow**: Actions collapse into a "more" menu when the cell is too narrow
- **Navigation support**: Title can be a link via \`to\` prop (React Router)
- **Ellipsis**: Title auto-truncates with tooltip when space is limited
- **Action types**: Supports default and danger action styles
- **Async actions**: Supports \`action\` prop for automatic loading state
        `}}},argTypes:{title:{control:{type:`text`},description:`Primary title text displayed in the cell.`,table:{type:{summary:`string | React.ReactNode`},defaultValue:{summary:`-`}}},to:{control:{type:`text`},description:`Optional React Router path. When set, the title is rendered as a link.`,table:{type:{summary:`string`},defaultValue:{summary:`undefined`}}},actions:{control:!1,description:`List of action definitions rendered as buttons or in the overflow menu.`,table:{type:{summary:`BAINameActionCellAction[]`},defaultValue:{summary:`[]`}}},showActions:{control:{type:`inline-radio`},description:`When to show the actions area.`,table:{type:{summary:`'hover' | 'always'`},defaultValue:{summary:`'hover'`}}},minVisibleActions:{control:{type:`number`},description:`Minimum number of actions to keep visible before collapsing into the "more" menu.`,table:{type:{summary:`number`},defaultValue:{summary:`0`}}},copyable:{control:{type:`boolean`},description:`Show a copy-to-clipboard icon on hover next to the title text.`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},icon:{control:!1,description:`Optional icon rendered before the title.`,table:{type:{summary:`React.ReactNode`},defaultValue:{summary:`undefined`}}}},decorators:[(e,t)=>{let ee=t.globals.locale||`en`,n=R[ee]||R.en;return(0,l.jsx)(pe,{children:(0,l.jsx)(ue,{locale:n,clientPromise:I,anonymousClientFactory:L,children:(0,l.jsx)(e,{})})})}]},z=[{key:`edit`,title:`Edit`,icon:(0,l.jsx)(oe,{}),onClick:()=>console.log(`Edit clicked`)},{key:`share`,title:`Share`,icon:(0,l.jsx)(s,{size:`1em`}),onClick:()=>console.log(`Share clicked`)},{key:`copy`,title:`Copy`,icon:(0,l.jsx)(r,{size:`1em`}),onClick:()=>console.log(`Copy clicked`)},{key:`delete`,title:`Delete`,icon:(0,l.jsx)(le,{size:`1em`}),type:`danger`,onClick:()=>console.log(`Delete clicked`)}],B={name:`Basic`,parameters:{docs:{description:{story:`Default cell with icon, title, and hover action buttons.`}}},args:{icon:(0,l.jsx)(a,{size:`1em`}),title:`My Project Folder`,actions:z}},V={parameters:{docs:{description:{story:"Title rendered as a React Router link using the `to` prop."}}},args:{icon:(0,l.jsx)(a,{size:`1em`}),title:`Navigable Folder`,to:`/folders/123`,actions:z.slice(0,2)}},H={parameters:{docs:{description:{story:`Actions are always visible, not just on hover.`}}},args:{icon:(0,l.jsx)(a,{size:`1em`}),title:`Always Visible Actions`,actions:z,showActions:`always`}},U={parameters:{docs:{description:{story:`Disabled actions show a reason tooltip and cannot be clicked.`}}},args:{icon:(0,l.jsx)(a,{size:`1em`}),title:`Has Disabled Action`,actions:[...z.slice(0,2),{key:`restore`,title:`Restore`,icon:(0,l.jsx)(r,{size:`1em`}),disabled:{reason:`Cannot restore pipeline folders`}}]}},W={parameters:{docs:{description:{story:`A disabled action keeps its reason after it collapses into the overflow menu. The visible icon button explains itself with a tooltip, and so does the menu row: hover its label to read the reason. Narrow the container to compare the two.`}}},render:()=>{let[e,t]=c.useState(400);return(0,l.jsxs)(`div`,{children:[(0,l.jsx)(`div`,{style:{marginBottom:16},children:(0,l.jsxs)(`label`,{children:[`Container width: `,e,`px`,(0,l.jsx)(`input`,{type:`range`,min:120,max:600,value:e,onChange:e=>t(Number(e.target.value)),style:{marginLeft:8,width:200}})]})}),(0,l.jsx)(`div`,{style:{width:e,border:`1px solid #d9d9d9`,padding:`8px 12px`,borderRadius:4},children:(0,l.jsx)(i,{icon:(0,l.jsx)(a,{size:`1em`}),title:`model-weights`,showActions:`always`,actions:[...z,{key:`start-service`,title:`Deploy as service`,icon:(0,l.jsx)(r,{size:`1em`}),disabled:{reason:`Create deployments from a project's Data page`}}]})})]})}},G={parameters:{docs:{description:{story:`Long titles are truncated with an ellipsis tooltip.`}}},args:{icon:(0,l.jsx)(a,{size:`1em`}),title:`This is a very long folder name that should be truncated with ellipsis when the column is narrow`,actions:z},decorators:[e=>(0,l.jsx)(`div`,{style:{width:300},children:(0,l.jsx)(e,{})})]},K={parameters:{docs:{description:{story:`Drag the slider to see actions collapse into the overflow menu.`}}},render:()=>{let[e,t]=c.useState(400);return(0,l.jsxs)(`div`,{children:[(0,l.jsx)(`div`,{style:{marginBottom:16},children:(0,l.jsxs)(`label`,{children:[`Container width: `,e,`px`,(0,l.jsx)(`input`,{type:`range`,min:120,max:600,value:e,onChange:e=>t(Number(e.target.value)),style:{marginLeft:8,width:200}})]})}),(0,l.jsx)(`div`,{style:{width:e,border:`1px solid #d9d9d9`,padding:`8px 12px`,borderRadius:4},children:(0,l.jsx)(i,{icon:(0,l.jsx)(a,{size:`1em`}),title:`Resize to see overflow`,actions:z,showActions:`always`})})]})}},q={parameters:{docs:{description:{story:`Responsive overflow combined with a navigable title link.`}}},render:()=>{let[e,t]=c.useState(400);return(0,l.jsxs)(`div`,{children:[(0,l.jsx)(`div`,{style:{marginBottom:16},children:(0,l.jsxs)(`label`,{children:[`Container width: `,e,`px`,(0,l.jsx)(`input`,{type:`range`,min:120,max:600,value:e,onChange:e=>t(Number(e.target.value)),style:{marginLeft:8,width:200}})]})}),(0,l.jsx)(`div`,{style:{width:e,border:`1px solid #d9d9d9`,padding:`8px 12px`,borderRadius:4},children:(0,l.jsx)(i,{icon:(0,l.jsx)(a,{size:`1em`}),title:`This is a long navigable folder name for ellipsis testing`,to:`/folders/123`,actions:z,showActions:`always`})})]})}},J={parameters:{docs:{description:{story:'Actions with `showInMenu: "always"` are always placed in the dropdown menu.'}}},args:{icon:(0,l.jsx)(a,{size:`1em`}),title:`Some actions are menu-only`,actions:[{key:`edit`,title:`Edit`,icon:(0,l.jsx)(oe,{}),onClick:()=>console.log(`Edit clicked`)},{key:`share`,title:`Share`,icon:(0,l.jsx)(s,{size:`1em`}),onClick:()=>console.log(`Share clicked`)},{key:`copy`,title:`Copy`,icon:(0,l.jsx)(r,{size:`1em`}),showInMenu:`always`,onClick:()=>console.log(`Copy clicked`)},{key:`delete`,title:`Delete`,icon:(0,l.jsx)(le,{size:`1em`}),type:`danger`,showInMenu:`always`,onClick:()=>console.log(`Delete clicked`)}],showActions:`always`}},Y={parameters:{docs:{description:{story:`A copy-to-clipboard icon appears on hover next to the title text. Works with plain text, links, and clickable titles.`}}},args:{icon:(0,l.jsx)(a,{size:`1em`}),title:`Copyable Folder Name`,actions:z.slice(0,2),copyable:!0}},X={parameters:{docs:{description:{story:`Copyable name combined with a navigable title link. The copy icon appears on hover.`}}},args:{icon:(0,l.jsx)(a,{size:`1em`}),title:`Navigable Copyable Folder`,to:`/folders/123`,actions:z.slice(0,2),copyable:!0}},Z={parameters:{docs:{description:{story:`Copyable name with action buttons always visible (not hover-only). Verifies copy icon positioning alongside persistent actions.`}}},args:{icon:(0,l.jsx)(a,{size:`1em`}),title:`Copyable With Always Actions`,actions:z.slice(0,2),copyable:!0,showActions:`always`}},Q={parameters:{docs:{description:{story:`Cell without any actions — only icon and title.`}}},args:{icon:(0,l.jsx)(a,{size:`1em`}),title:`No actions, title only`}},$={parameters:{docs:{description:{story:"Async action with automatic loading state via the `action` prop."}}},args:{icon:(0,l.jsx)(a,{size:`1em`}),title:`With Async Action`,actions:[{key:`deploy`,title:`Deploy (takes 2s)`,icon:(0,l.jsx)(r,{size:`1em`}),action:()=>new Promise(e=>setTimeout(e,2e3))}],showActions:`always`}},B.parameters={...B.parameters,docs:{...(u=B.parameters)==null?void 0:u.docs,source:{originalSource:`{
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
}`,...(d=B.parameters)==null||(d=d.docs)==null?void 0:d.source}}},V.parameters={...V.parameters,docs:{...(f=V.parameters)==null?void 0:f.docs,source:{originalSource:`{
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
}`,...(p=V.parameters)==null||(p=p.docs)==null?void 0:p.source}}},H.parameters={...H.parameters,docs:{...(he=H.parameters)==null?void 0:he.docs,source:{originalSource:`{
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
}`,...(m=H.parameters)==null||(m=m.docs)==null?void 0:m.source}}},U.parameters={...U.parameters,docs:{...(h=U.parameters)==null?void 0:h.docs,source:{originalSource:`{
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
}`,...(g=U.parameters)==null||(g=g.docs)==null?void 0:g.source}}},W.parameters={...W.parameters,docs:{...(_=W.parameters)==null?void 0:_.docs,source:{originalSource:`{
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
}`,...(v=W.parameters)==null||(v=v.docs)==null?void 0:v.source}}},G.parameters={...G.parameters,docs:{...(y=G.parameters)==null?void 0:y.docs,source:{originalSource:`{
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
}`,...(b=G.parameters)==null||(b=b.docs)==null?void 0:b.source}}},K.parameters={...K.parameters,docs:{...(ge=K.parameters)==null?void 0:ge.docs,source:{originalSource:`{
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
}`,...(x=K.parameters)==null||(x=x.docs)==null?void 0:x.source}}},q.parameters={...q.parameters,docs:{...(S=q.parameters)==null?void 0:S.docs,source:{originalSource:`{
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
}`,...(C=q.parameters)==null||(C=C.docs)==null?void 0:C.source}}},J.parameters={...J.parameters,docs:{...(_e=J.parameters)==null?void 0:_e.docs,source:{originalSource:`{
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
}`,...(w=J.parameters)==null||(w=w.docs)==null?void 0:w.source}}},Y.parameters={...Y.parameters,docs:{...(T=Y.parameters)==null?void 0:T.docs,source:{originalSource:`{
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
}`,...(E=Y.parameters)==null||(E=E.docs)==null?void 0:E.source}}},X.parameters={...X.parameters,docs:{...(D=X.parameters)==null?void 0:D.docs,source:{originalSource:`{
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
}`,...(O=X.parameters)==null||(O=O.docs)==null?void 0:O.source}}},Z.parameters={...Z.parameters,docs:{...(k=Z.parameters)==null?void 0:k.docs,source:{originalSource:`{
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
}`,...(A=Z.parameters)==null||(A=A.docs)==null?void 0:A.source}}},Q.parameters={...Q.parameters,docs:{...(j=Q.parameters)==null?void 0:j.docs,source:{originalSource:`{
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
}`,...(M=Q.parameters)==null||(M=M.docs)==null?void 0:M.source}}},$.parameters={...$.parameters,docs:{...(N=$.parameters)==null?void 0:N.docs,source:{originalSource:`{
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
}`,...(P=$.parameters)==null||(P=P.docs)==null?void 0:P.source}}},ye=[`Default`,`WithNavigation`,`AlwaysShowActions`,`WithDisabledAction`,`DisabledActionInOverflowMenu`,`LongTitle`,`ResponsiveOverflow`,`ResponsiveOverflowWithLink`,`MenuOnlyActions`,`CopyableName`,`CopyableNameWithLink`,`CopyableNameWithAlwaysVisibleActions`,`TitleOnly`,`AsyncAction`]})))()}be();export{H as AlwaysShowActions,$ as AsyncAction,Y as CopyableName,Z as CopyableNameWithAlwaysVisibleActions,X as CopyableNameWithLink,B as Default,W as DisabledActionInOverflowMenu,G as LongTitle,J as MenuOnlyActions,K as ResponsiveOverflow,q as ResponsiveOverflowWithLink,Q as TitleOnly,U as WithDisabledAction,V as WithNavigation,ye as __namedExportsOrder,ve as default};