import{c as re,j as r,P as se}from"./iframe-PLX0yNQC.js";import{R as n}from"./RelayResolver-wM8HO-Uj.js";import{B as y}from"./BAIFlex-CNRAFqAY.js";import{r as W}from"./index-BDHK03Zy.js";import{T as oe}from"./trash-DjuYSjJg.js";import"./preload-helper-Dp1pzeXC.js";import"./index-eyeIWQNH.js";const X={argumentDefinitions:[],kind:"Fragment",metadata:{plural:!0},name:"BAIVFolderDeleteButtonFragment",selections:[{alias:null,args:null,kind:"ScalarField",name:"permissions",storageKey:null}],type:"VirtualFolderNode",abstractKey:null};X.hash="cb17a791cc786c6a04cd5573ab7b3494";const Y=s=>{"use memo";const e=re.c(10),{vfolderFrgmt:t,label:o,tooltip:p,isDisabled:b,onClick:h,size:x}=s,F=x===void 0?"md":x;let u;e[0]===Symbol.for("react.memo_cache_sentinel")?(u=X,e[0]=u):u=e[0];const _=W.useFragment(u,t);let f;e[1]!==_?(f=_.some(ne),e[1]=_,e[2]=f):f=e[2];const ee=f,R=p??o;let v;e[3]===Symbol.for("react.memo_cache_sentinel")?(v=r.jsx(oe,{}),e[3]=v):v=e[3];const D=b||!ee;let g;return e[4]!==o||e[5]!==h||e[6]!==F||e[7]!==R||e[8]!==D?(g=r.jsx(se,{label:o,tooltip:R,icon:v,variant:"ghost",size:F,className:"bai-name-action-cell-danger",isDisabled:D,onClick:h}),e[4]=o,e[5]=h,e[6]=F,e[7]=R,e[8]=D,e[9]=g):g=e[9],g};function ne(s){var e;return(e=s.permissions)==null?void 0:e.includes("delete_vfolder")}const Z=(function(){var s=[{defaultValue:null,kind:"LocalArgument",name:"permission"}],e=[{kind:"Literal",name:"first",value:10},{kind:"Literal",name:"offset",value:0},{kind:"Variable",name:"permission",variableName:"permission"}];return{fragment:{argumentDefinitions:s,kind:"Fragment",metadata:null,name:"BAIVFolderDeleteButtonStoriesQuery",selections:[{alias:null,args:e,concreteType:"VirtualFolderConnection",kind:"LinkedField",name:"vfolder_nodes",plural:!1,selections:[{alias:null,args:null,concreteType:"VirtualFolderEdge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"VirtualFolderNode",kind:"LinkedField",name:"node",plural:!1,selections:[{args:null,kind:"FragmentSpread",name:"BAIVFolderDeleteButtonFragment"}],storageKey:null}],storageKey:null}],storageKey:null}],type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:s,kind:"Operation",name:"BAIVFolderDeleteButtonStoriesQuery",selections:[{alias:null,args:e,concreteType:"VirtualFolderConnection",kind:"LinkedField",name:"vfolder_nodes",plural:!1,selections:[{alias:null,args:null,concreteType:"VirtualFolderEdge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"VirtualFolderNode",kind:"LinkedField",name:"node",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"permissions",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}]},params:{cacheID:"b98fed36f9dfbe3a9951963ce651416d",id:null,metadata:{},name:"BAIVFolderDeleteButtonStoriesQuery",operationKind:"query",text:`query BAIVFolderDeleteButtonStoriesQuery(
  $permission: VFolderPermissionValueField
) {
  vfolder_nodes(offset: 0, first: 10, permission: $permission) {
    edges {
      node {
        ...BAIVFolderDeleteButtonFragment
        id
      }
    }
  }
}

fragment BAIVFolderDeleteButtonFragment on VirtualFolderNode {
  permissions
}
`}}})();Z.hash="d9fac626e9fb6578a0897e22c408e285";const pe={title:"Button/BAIVFolderDeleteButton",component:Y,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:`
**BAIVFolderDeleteButton** is a specialized delete button for virtual folders with automatic deletability checks based on GraphQL fragment data.

## BAI-Specific Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`vfolderFrgmt\` | \`BAIVFolderDeleteButtonFragment$key\` | - | GraphQL fragment reference for vfolder data (required) |
| \`label\` | \`string\` | - | Accessible name for the icon button (required) |
| \`tooltip\` | \`string\` | \`label\` | Tooltip content |

## Deletability Logic
The button automatically determines if vfolders are deletable:
- **Deletable**: At least one vfolder has 'delete_vfolder' permission
- **Not Deletable**: No vfolders have 'delete_vfolder' permission

## Visual States
- **Enabled**: Ghost icon button with error-colored (red) trash icon
- **Disabled**: Disabled button chrome while the icon keeps its danger styling
        `}}},argTypes:{vfolderFrgmt:{control:!1,description:"GraphQL fragment reference for virtual folder data",table:{type:{summary:"BAIVFolderDeleteButtonFragment$key"}}},label:{control:{type:"text"},description:"Accessible name for the icon button",table:{type:{summary:"string"}}},isDisabled:{control:{type:"boolean"},description:"Disabled state",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},onClick:{action:"clicked",description:"Click handler",table:{type:{summary:"() => void"}}}}},l=({isDisabled:s=!1,onClick:e})=>{var p;const{vfolder_nodes:t}=W.useLazyLoadQuery(Z,{permission:"read_attribute"}),o=(p=t==null?void 0:t.edges)==null?void 0:p.map(b=>b.node);return o&&o.length>0&&r.jsx(Y,{vfolderFrgmt:o,label:"Delete",isDisabled:s,onClick:e})},a={name:"Basic",args:{},parameters:{docs:{description:{story:"Virtual folders with delete_vfolder permission. The button appears in error colors (red)."}}},render:s=>r.jsx(n,{mockResolvers:{VirtualFolderConnection:()=>({edges:[{node:{permissions:["read_vfolder","write_vfolder","delete_vfolder"]}},{node:{permissions:["read_vfolder","write_vfolder"]}}]})},children:r.jsx(l,{...s})})},i={name:"NotDeletable",args:{},parameters:{docs:{description:{story:"No vfolders have delete_vfolder permission. The button is automatically disabled with gray styling."}}},render:s=>r.jsx(n,{mockResolvers:{VirtualFolderConnection:()=>({edges:[{node:{permissions:["read_vfolder","write_vfolder"]}},{node:{permissions:["read_vfolder"]}}]})},children:r.jsx(l,{...s})})},d={name:"MixedPermissions",args:{},parameters:{docs:{description:{story:"Mix of vfolders with and without delete_vfolder permission. The button is enabled because at least one vfolder is deletable."}}},render:s=>r.jsx(n,{mockResolvers:{VirtualFolderConnection:()=>({edges:[{node:{permissions:["read_vfolder"]}},{node:{permissions:["read_vfolder","write_vfolder","delete_vfolder"]}},{node:{permissions:["read_vfolder","write_vfolder"]}}]})},children:r.jsx(l,{...s})})},c={name:"DisabledState",args:{isDisabled:!0},parameters:{docs:{description:{story:"Button in disabled state via prop, even though vfolders have delete permission."}}},render:s=>r.jsx(n,{mockResolvers:{VirtualFolderConnection:()=>({edges:[{node:{permissions:["read_vfolder","write_vfolder","delete_vfolder"]}}]})},children:r.jsx(l,{...s})})},m={name:"AllStates",parameters:{docs:{description:{story:"Comparison of all button states: deletable, not deletable, and disabled."}}},render:()=>r.jsxs(y,{direction:"column",gap:"md",children:[r.jsxs(y,{align:"center",gap:"sm",children:[r.jsx("span",{style:{width:140},children:"Deletable:"}),r.jsx(n,{mockResolvers:{VirtualFolderConnection:()=>({edges:[{node:{permissions:["read_vfolder","write_vfolder","delete_vfolder"]}}]})},children:r.jsx(l,{})})]}),r.jsxs(y,{align:"center",gap:"sm",children:[r.jsx("span",{style:{width:140},children:"Not Deletable:"}),r.jsx(n,{mockResolvers:{VirtualFolderConnection:()=>({edges:[{node:{permissions:["read_vfolder","write_vfolder"]}}]})},children:r.jsx(l,{})})]}),r.jsxs(y,{align:"center",gap:"sm",children:[r.jsx("span",{style:{width:140},children:"Disabled:"}),r.jsx(n,{mockResolvers:{VirtualFolderConnection:()=>({edges:[{node:{permissions:["read_vfolder","write_vfolder","delete_vfolder"]}}]})},children:r.jsx(l,{isDisabled:!0})})]})]})};var k,B,V,w,A;a.parameters={...a.parameters,docs:{...(k=a.parameters)==null?void 0:k.docs,source:{originalSource:`{
  name: 'Basic',
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Virtual folders with delete_vfolder permission. The button appears in error colors (red).'
      }
    }
  },
  render: args => <RelayResolver mockResolvers={{
    VirtualFolderConnection: () => ({
      edges: [{
        node: {
          permissions: ['read_vfolder', 'write_vfolder', 'delete_vfolder']
        }
      }, {
        node: {
          permissions: ['read_vfolder', 'write_vfolder']
        }
      }]
    })
  }}>
      <QueryResolver {...args} />
    </RelayResolver>
}`,...(V=(B=a.parameters)==null?void 0:B.docs)==null?void 0:V.source},description:{story:"Deletable vfolders - button is enabled with error styling",...(A=(w=a.parameters)==null?void 0:w.docs)==null?void 0:A.description}}};var j,I,S,C,T;i.parameters={...i.parameters,docs:{...(j=i.parameters)==null?void 0:j.docs,source:{originalSource:`{
  name: 'NotDeletable',
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'No vfolders have delete_vfolder permission. The button is automatically disabled with gray styling.'
      }
    }
  },
  render: args => <RelayResolver mockResolvers={{
    VirtualFolderConnection: () => ({
      edges: [{
        node: {
          permissions: ['read_vfolder', 'write_vfolder']
        }
      }, {
        node: {
          permissions: ['read_vfolder']
        }
      }]
    })
  }}>
      <QueryResolver {...args} />
    </RelayResolver>
}`,...(S=(I=i.parameters)==null?void 0:I.docs)==null?void 0:S.source},description:{story:"No delete permission - button is disabled",...(T=(C=i.parameters)==null?void 0:C.docs)==null?void 0:T.description}}};var N,Q,L,K,P;d.parameters={...d.parameters,docs:{...(N=d.parameters)==null?void 0:N.docs,source:{originalSource:`{
  name: 'MixedPermissions',
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Mix of vfolders with and without delete_vfolder permission. The button is enabled because at least one vfolder is deletable.'
      }
    }
  },
  render: args => <RelayResolver mockResolvers={{
    VirtualFolderConnection: () => ({
      edges: [{
        node: {
          permissions: ['read_vfolder']
        }
      }, {
        node: {
          permissions: ['read_vfolder', 'write_vfolder', 'delete_vfolder']
        }
      }, {
        node: {
          permissions: ['read_vfolder', 'write_vfolder']
        }
      }]
    })
  }}>
      <QueryResolver {...args} />
    </RelayResolver>
}`,...(L=(Q=d.parameters)==null?void 0:Q.docs)==null?void 0:L.source},description:{story:"Mixed permissions - button is enabled if at least one has delete permission",...(P=(K=d.parameters)==null?void 0:K.docs)==null?void 0:P.description}}};var E,M,$,q,z;c.parameters={...c.parameters,docs:{...(E=c.parameters)==null?void 0:E.docs,source:{originalSource:`{
  name: 'DisabledState',
  args: {
    isDisabled: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Button in disabled state via prop, even though vfolders have delete permission.'
      }
    }
  },
  render: args => <RelayResolver mockResolvers={{
    VirtualFolderConnection: () => ({
      edges: [{
        node: {
          permissions: ['read_vfolder', 'write_vfolder', 'delete_vfolder']
        }
      }]
    })
  }}>
      <QueryResolver {...args} />
    </RelayResolver>
}`,...($=(M=c.parameters)==null?void 0:M.docs)==null?void 0:$.source},description:{story:"Disabled state",...(z=(q=c.parameters)==null?void 0:q.docs)==null?void 0:z.description}}};var G,O,H,J,U;m.parameters={...m.parameters,docs:{...(G=m.parameters)==null?void 0:G.docs,source:{originalSource:`{
  name: 'AllStates',
  parameters: {
    docs: {
      description: {
        story: 'Comparison of all button states: deletable, not deletable, and disabled.'
      }
    }
  },
  render: () => <BAIFlex direction="column" gap="md">
      <BAIFlex align="center" gap="sm">
        <span style={{
        width: 140
      }}>Deletable:</span>
        <RelayResolver mockResolvers={{
        VirtualFolderConnection: () => ({
          edges: [{
            node: {
              permissions: ['read_vfolder', 'write_vfolder', 'delete_vfolder']
            }
          }]
        })
      }}>
          <QueryResolver />
        </RelayResolver>
      </BAIFlex>

      <BAIFlex align="center" gap="sm">
        <span style={{
        width: 140
      }}>Not Deletable:</span>
        <RelayResolver mockResolvers={{
        VirtualFolderConnection: () => ({
          edges: [{
            node: {
              permissions: ['read_vfolder', 'write_vfolder']
            }
          }]
        })
      }}>
          <QueryResolver />
        </RelayResolver>
      </BAIFlex>

      <BAIFlex align="center" gap="sm">
        <span style={{
        width: 140
      }}>Disabled:</span>
        <RelayResolver mockResolvers={{
        VirtualFolderConnection: () => ({
          edges: [{
            node: {
              permissions: ['read_vfolder', 'write_vfolder', 'delete_vfolder']
            }
          }]
        })
      }}>
          <QueryResolver isDisabled />
        </RelayResolver>
      </BAIFlex>
    </BAIFlex>
}`,...(H=(O=m.parameters)==null?void 0:O.docs)==null?void 0:H.source},description:{story:"Comparison of all states",...(U=(J=m.parameters)==null?void 0:J.docs)==null?void 0:U.description}}};const ue=["Default","NotDeletable","MixedPermissions","Disabled","AllStates"];export{m as AllStates,a as Default,c as Disabled,d as MixedPermissions,i as NotDeletable,ue as __namedExportsOrder,pe as default};
