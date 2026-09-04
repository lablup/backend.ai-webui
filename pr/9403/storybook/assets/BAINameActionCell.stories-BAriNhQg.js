import{d as ge,j as e,aK as r,R as k,au as be}from"./iframe-BNdPrXzC.js";import{B as A,S as me}from"./BAINameActionCell-s0jMQmO8.js";import{F as o}from"./folder-Dzb2m_zV.js";import{T as ye}from"./trash-N0v6Uxmz.js";import{M as ve}from"./index-XLyDeAS2.js";import"./preload-helper-Dp1pzeXC.js";import"./useEventNotStable-DBUuqDWT.js";import"./BAIButton-UJBy1tnn.js";import"./astryxLabel-BBr4_hNq.js";import"./BAILink-CA-0j3sg.js";import"./DropdownMenu-DdKoIT9a.js";import"./usePopover-uDFOLR8W.js";import"./useDevWarning-DB5sqgz4.js";import"./rtlStyles-T4i24HtE.js";import"./renderDropdownItems-B5DdP8Q9.js";import"./Item-DJgvdMxu.js";import"./Divider-A-BbIOXX.js";import"./useListFocus-C9waQbxr.js";import"./isRtlElement-B2-7SF8s.js";import"./useMenuHover-_bVgoPYY.js";import"./useTypeahead-DFc0X2vc.js";import"./Popover-9JxpjPUr.js";import"./VStack-CIJ8rv82.js";/**
 * @license lucide-react v1.29.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const xe=[["circle",{cx:"18",cy:"5",r:"3",key:"gq8acd"}],["circle",{cx:"6",cy:"12",r:"3",key:"w7nqdw"}],["circle",{cx:"18",cy:"19",r:"3",key:"1xt0gg"}],["line",{x1:"8.59",x2:"15.42",y1:"13.51",y2:"17.49",key:"47mynk"}],["line",{x1:"15.41",x2:"8.59",y1:"6.51",y2:"10.49",key:"1n3mei"}]],he=ge("share-2",xe),ue={},Ae=Promise.resolve(ue),ke=()=>ue,f={en:{lang:"en"},ko:{lang:"ko"}},Ge={title:"Table/BAINameActionCell",component:A,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:`
BAINameActionCell is a reusable table cell layout component that combines a title area (icon + text) with responsive action buttons.

## Features

- **Hover actions**: Action buttons appear on hover by default
- **Responsive overflow**: Actions collapse into a "more" menu when the cell is too narrow
- **Navigation support**: Title can be a link via \`to\` prop (React Router)
- **Ellipsis**: Title auto-truncates with tooltip when space is limited
- **Action types**: Supports default and danger action styles
- **Async actions**: Supports \`action\` prop for automatic loading state
        `}}},argTypes:{title:{control:{type:"text"},description:"Primary title text displayed in the cell.",table:{type:{summary:"string | React.ReactNode"},defaultValue:{summary:"-"}}},to:{control:{type:"text"},description:"Optional React Router path. When set, the title is rendered as a link.",table:{type:{summary:"string"},defaultValue:{summary:"undefined"}}},actions:{control:!1,description:"List of action definitions rendered as buttons or in the overflow menu.",table:{type:{summary:"BAINameActionCellAction[]"},defaultValue:{summary:"[]"}}},showActions:{control:{type:"inline-radio"},description:"When to show the actions area.",table:{type:{summary:"'hover' | 'always'"},defaultValue:{summary:"'hover'"}}},minVisibleActions:{control:{type:"number"},description:'Minimum number of actions to keep visible before collapsing into the "more" menu.',table:{type:{summary:"number"},defaultValue:{summary:"0"}}},copyable:{control:{type:"boolean"},description:"Show a copy-to-clipboard icon on hover next to the title text.",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},icon:{control:!1,description:"Optional icon rendered before the title.",table:{type:{summary:"React.ReactNode"},defaultValue:{summary:"undefined"}}}},decorators:[(t,i)=>{const a=i.globals.locale||"en",we=f[a]||f.en;return e.jsx(ve,{children:e.jsx(be,{locale:we,clientPromise:Ae,anonymousClientFactory:ke,children:e.jsx(t,{})})})}]},s=[{key:"edit",title:"Edit",icon:e.jsx(me,{}),onClick:()=>console.log("Edit clicked")},{key:"share",title:"Share",icon:e.jsx(he,{size:"1em"}),onClick:()=>console.log("Share clicked")},{key:"copy",title:"Copy",icon:e.jsx(r,{size:"1em"}),onClick:()=>console.log("Copy clicked")},{key:"delete",title:"Delete",icon:e.jsx(ye,{size:"1em"}),type:"danger",onClick:()=>console.log("Delete clicked")}],n={name:"Basic",parameters:{docs:{description:{story:"Default cell with icon, title, and hover action buttons."}}},args:{icon:e.jsx(o,{size:"1em"}),title:"My Project Folder",actions:s}},l={parameters:{docs:{description:{story:"Title rendered as a React Router link using the `to` prop."}}},args:{icon:e.jsx(o,{size:"1em"}),title:"Navigable Folder",to:"/folders/123",actions:s.slice(0,2)}},c={parameters:{docs:{description:{story:"Actions are always visible, not just on hover."}}},args:{icon:e.jsx(o,{size:"1em"}),title:"Always Visible Actions",actions:s,showActions:"always"}},d={parameters:{docs:{description:{story:"Disabled actions show a reason tooltip and cannot be clicked."}}},args:{icon:e.jsx(o,{size:"1em"}),title:"Has Disabled Action",actions:[...s.slice(0,2),{key:"restore",title:"Restore",icon:e.jsx(r,{size:"1em"}),disabled:{reason:"Cannot restore pipeline folders"}}]}},p={parameters:{docs:{description:{story:"A disabled action keeps its reason after it collapses into the overflow menu. The visible icon button explains itself with a tooltip; the menu row cannot carry one (Astryx types `DropdownMenuItemData.label` as a plain string), so the reason is folded into the label instead. Narrow the container to compare the two. See FR-3423."}}},render:()=>{const[t,i]=k.useState(400);return e.jsxs("div",{children:[e.jsx("div",{style:{marginBottom:16},children:e.jsxs("label",{children:["Container width: ",t,"px",e.jsx("input",{type:"range",min:120,max:600,value:t,onChange:a=>i(Number(a.target.value)),style:{marginLeft:8,width:200}})]})}),e.jsx("div",{style:{width:t,border:"1px solid #d9d9d9",padding:"8px 12px",borderRadius:4},children:e.jsx(A,{icon:e.jsx(o,{size:"1em"}),title:"model-weights",showActions:"always",actions:[...s,{key:"start-service",title:"Deploy as service",icon:e.jsx(r,{size:"1em"}),disabled:{reason:"Create deployments from a project's Data page"}}]})})]})}},m={parameters:{docs:{description:{story:"Long titles are truncated with an ellipsis tooltip."}}},args:{icon:e.jsx(o,{size:"1em"}),title:"This is a very long folder name that should be truncated with ellipsis when the column is narrow",actions:s},decorators:[t=>e.jsx("div",{style:{width:300},children:e.jsx(t,{})})]},y={parameters:{docs:{description:{story:"Drag the slider to see actions collapse into the overflow menu."}}},render:()=>{const[t,i]=k.useState(400);return e.jsxs("div",{children:[e.jsx("div",{style:{marginBottom:16},children:e.jsxs("label",{children:["Container width: ",t,"px",e.jsx("input",{type:"range",min:120,max:600,value:t,onChange:a=>i(Number(a.target.value)),style:{marginLeft:8,width:200}})]})}),e.jsx("div",{style:{width:t,border:"1px solid #d9d9d9",padding:"8px 12px",borderRadius:4},children:e.jsx(A,{icon:e.jsx(o,{size:"1em"}),title:"Resize to see overflow",actions:s,showActions:"always"})})]})}},h={parameters:{docs:{description:{story:"Responsive overflow combined with a navigable title link."}}},render:()=>{const[t,i]=k.useState(400);return e.jsxs("div",{children:[e.jsx("div",{style:{marginBottom:16},children:e.jsxs("label",{children:["Container width: ",t,"px",e.jsx("input",{type:"range",min:120,max:600,value:t,onChange:a=>i(Number(a.target.value)),style:{marginLeft:8,width:200}})]})}),e.jsx("div",{style:{width:t,border:"1px solid #d9d9d9",padding:"8px 12px",borderRadius:4},children:e.jsx(A,{icon:e.jsx(o,{size:"1em"}),title:"This is a long navigable folder name for ellipsis testing",to:"/folders/123",actions:s,showActions:"always"})})]})}},u={parameters:{docs:{description:{story:'Actions with `showInMenu: "always"` are always placed in the dropdown menu.'}}},args:{icon:e.jsx(o,{size:"1em"}),title:"Some actions are menu-only",actions:[{key:"edit",title:"Edit",icon:e.jsx(me,{}),onClick:()=>console.log("Edit clicked")},{key:"share",title:"Share",icon:e.jsx(he,{size:"1em"}),onClick:()=>console.log("Share clicked")},{key:"copy",title:"Copy",icon:e.jsx(r,{size:"1em"}),showInMenu:"always",onClick:()=>console.log("Copy clicked")},{key:"delete",title:"Delete",icon:e.jsx(ye,{size:"1em"}),type:"danger",showInMenu:"always",onClick:()=>console.log("Delete clicked")}],showActions:"always"}},w={parameters:{docs:{description:{story:"A copy-to-clipboard icon appears on hover next to the title text. Works with plain text, links, and clickable titles."}}},args:{icon:e.jsx(o,{size:"1em"}),title:"Copyable Folder Name",actions:s.slice(0,2),copyable:!0}},g={parameters:{docs:{description:{story:"Copyable name combined with a navigable title link. The copy icon appears on hover."}}},args:{icon:e.jsx(o,{size:"1em"}),title:"Navigable Copyable Folder",to:"/folders/123",actions:s.slice(0,2),copyable:!0}},b={parameters:{docs:{description:{story:"Copyable name with action buttons always visible (not hover-only). Verifies copy icon positioning alongside persistent actions."}}},args:{icon:e.jsx(o,{size:"1em"}),title:"Copyable With Always Actions",actions:s.slice(0,2),copyable:!0,showActions:"always"}},v={parameters:{docs:{description:{story:"Cell without any actions — only icon and title."}}},args:{icon:e.jsx(o,{size:"1em"}),title:"No actions, title only"}},x={parameters:{docs:{description:{story:"Async action with automatic loading state via the `action` prop."}}},args:{icon:e.jsx(o,{size:"1em"}),title:"With Async Action",actions:[{key:"deploy",title:"Deploy (takes 2s)",icon:e.jsx(r,{size:"1em"}),action:()=>new Promise(t=>setTimeout(t,2e3))}],showActions:"always"}};var C,j,z;n.parameters={...n.parameters,docs:{...(C=n.parameters)==null?void 0:C.docs,source:{originalSource:`{
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
}`,...(z=(j=n.parameters)==null?void 0:j.docs)==null?void 0:z.source}}};var S,R,N;l.parameters={...l.parameters,docs:{...(S=l.parameters)==null?void 0:S.docs,source:{originalSource:`{
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
}`,...(N=(R=l.parameters)==null?void 0:R.docs)==null?void 0:N.source}}};var D,F,W;c.parameters={...c.parameters,docs:{...(D=c.parameters)==null?void 0:D.docs,source:{originalSource:`{
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
}`,...(W=(F=c.parameters)==null?void 0:F.docs)==null?void 0:W.source}}};var T,I,B;d.parameters={...d.parameters,docs:{...(T=d.parameters)==null?void 0:T.docs,source:{originalSource:`{
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
}`,...(B=(I=d.parameters)==null?void 0:I.docs)==null?void 0:B.source}}};var L,M,V;p.parameters={...p.parameters,docs:{...(L=p.parameters)==null?void 0:L.docs,source:{originalSource:`{
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
}`,...(V=(M=p.parameters)==null?void 0:M.docs)==null?void 0:V.source}}};var O,P,E;m.parameters={...m.parameters,docs:{...(O=m.parameters)==null?void 0:O.docs,source:{originalSource:`{
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
}`,...(E=(P=m.parameters)==null?void 0:P.docs)==null?void 0:E.source}}};var q,_,H;y.parameters={...y.parameters,docs:{...(q=y.parameters)==null?void 0:q.docs,source:{originalSource:`{
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
}`,...(H=(_=y.parameters)==null?void 0:_.docs)==null?void 0:H.source}}};var K,G,J;h.parameters={...h.parameters,docs:{...(K=h.parameters)==null?void 0:K.docs,source:{originalSource:`{
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
}`,...(J=(G=h.parameters)==null?void 0:G.docs)==null?void 0:J.source}}};var Q,U,X;u.parameters={...u.parameters,docs:{...(Q=u.parameters)==null?void 0:Q.docs,source:{originalSource:`{
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
}`,...(X=(U=u.parameters)==null?void 0:U.docs)==null?void 0:X.source}}};var Y,Z,$;w.parameters={...w.parameters,docs:{...(Y=w.parameters)==null?void 0:Y.docs,source:{originalSource:`{
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
}`,...($=(Z=w.parameters)==null?void 0:Z.docs)==null?void 0:$.source}}};var ee,te,oe;g.parameters={...g.parameters,docs:{...(ee=g.parameters)==null?void 0:ee.docs,source:{originalSource:`{
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
}`,...(oe=(te=g.parameters)==null?void 0:te.docs)==null?void 0:oe.source}}};var se,ie,ae;b.parameters={...b.parameters,docs:{...(se=b.parameters)==null?void 0:se.docs,source:{originalSource:`{
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
}`,...(ae=(ie=b.parameters)==null?void 0:ie.docs)==null?void 0:ae.source}}};var re,ne,le;v.parameters={...v.parameters,docs:{...(re=v.parameters)==null?void 0:re.docs,source:{originalSource:`{
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
}`,...(le=(ne=v.parameters)==null?void 0:ne.docs)==null?void 0:le.source}}};var ce,de,pe;x.parameters={...x.parameters,docs:{...(ce=x.parameters)==null?void 0:ce.docs,source:{originalSource:`{
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
}`,...(pe=(de=x.parameters)==null?void 0:de.docs)==null?void 0:pe.source}}};const Je=["Default","WithNavigation","AlwaysShowActions","WithDisabledAction","DisabledActionInOverflowMenu","LongTitle","ResponsiveOverflow","ResponsiveOverflowWithLink","MenuOnlyActions","CopyableName","CopyableNameWithLink","CopyableNameWithAlwaysVisibleActions","TitleOnly","AsyncAction"];export{c as AlwaysShowActions,x as AsyncAction,w as CopyableName,b as CopyableNameWithAlwaysVisibleActions,g as CopyableNameWithLink,n as Default,p as DisabledActionInOverflowMenu,m as LongTitle,u as MenuOnlyActions,y as ResponsiveOverflow,h as ResponsiveOverflowWithLink,v as TitleOnly,d as WithDisabledAction,l as WithNavigation,Je as __namedExportsOrder,Ge as default};
