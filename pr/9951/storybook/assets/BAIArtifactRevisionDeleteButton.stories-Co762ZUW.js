import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t,t as n}from"./omit-DR6wVUX5.js";import{t as r}from"./jsx-runtime-MKhVqBIO.js";import{n as i,r as a}from"./useTheme-B-966VfY.js";import{n as o,t as s}from"./trash-2-B7fSQQ_G.js";import{n as c,t as l}from"./BAIFlex-DnaoYTJ1.js";import{t as u}from"./react-relay-sHama7hJ.js";import{n as d,t as f}from"./BAIButton-CpsNkR3u.js";import{n as p,t as m}from"./RelayResolver-BnFyFQJn.js";var h;function g(){return(g=e((()=>{h={argumentDefinitions:[],kind:`Fragment`,metadata:{plural:!0},name:`BAIArtifactRevisionDeleteButtonFragment`,selections:[{alias:null,args:null,kind:`ScalarField`,name:`status`,storageKey:null}],type:`ArtifactRevision`,abstractKey:null},h.hash=`de15aa32192b0f0d63e3bd7f5f90d2b6`})))()}var _,v,y;function b(){return(b=e((()=>{g(),d(),i(),n(),o(),_=u(),v=r(),y=({revisionsFrgmt:e,...n})=>{let{token:r}=a(),i=(0,_.useFragment)(h,e).some(e=>e.status!==`SCANNED`&&e.status!==`PULLING`),o=n.disabled||n.loading||!i;return(0,v.jsx)(f,{icon:(0,v.jsx)(s,{size:`1em`}),disabled:o,type:`text`,style:{color:r(o?`--color-text-disabled`:`--color-error`),background:r(o?`--color-bg-container-disabled`:`--color-error-bg`),...n.style},...t(n,[`style`,`disabled`,`loading`])})}})))()}var x;function S(){return(S=e((()=>{x=(function(){var e=[{kind:`Literal`,name:`first`,value:10},{kind:`Literal`,name:`offset`,value:0}];return{fragment:{argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAIArtifactRevisionDeleteButtonStoriesQuery`,selections:[{alias:null,args:e,concreteType:`ArtifactRevisionConnection`,kind:`LinkedField`,name:`artifactRevisions`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactRevisionEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{args:null,kind:`FragmentSpread`,name:`BAIArtifactRevisionDeleteButtonFragment`}],storageKey:null}],storageKey:null}],storageKey:`artifactRevisions(first:10,offset:0)`}],type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[],kind:`Operation`,name:`BAIArtifactRevisionDeleteButtonStoriesQuery`,selections:[{alias:null,args:e,concreteType:`ArtifactRevisionConnection`,kind:`LinkedField`,name:`artifactRevisions`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactRevisionEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`status`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:`artifactRevisions(first:10,offset:0)`}]},params:{cacheID:`f9256d5d3a660072ce8d48a252703e6f`,id:null,metadata:{},name:`BAIArtifactRevisionDeleteButtonStoriesQuery`,operationKind:`query`,text:`query BAIArtifactRevisionDeleteButtonStoriesQuery {
  artifactRevisions(offset: 0, first: 10) {
    edges {
      node {
        ...BAIArtifactRevisionDeleteButtonFragment
        id
      }
    }
  }
}

fragment BAIArtifactRevisionDeleteButtonFragment on ArtifactRevision {
  status
}
`}}})(),x.hash=`9ca7f892cff7056588b89ee6cae001e2`})))()}var C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q;function J(){return(J=e((()=>{S(),p(),c(),b(),C=u(),w=r(),B={title:`Fragments/BAIArtifactRevisionDeleteButton`,component:y,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`
**BAIArtifactRevisionDeleteButton** is a specialized delete button for artifact revisions with automatic deletability checks based on GraphQL fragment data.

## BAI-Specific Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`revisionsFrgmt\` | \`BAIArtifactRevisionDeleteButtonFragment$key\` | - | GraphQL fragment reference for revision data (required) |
| \`loading\` | \`boolean\` | \`false\` | Loading state (inherited from BAIButtonProps) |

## Deletability Logic
The button automatically determines if revisions are deletable:
- **Deletable**: At least one revision with status !== 'SCANNED' && status !== 'PULLING'
- **Not Deletable**: All revisions have status 'SCANNED' or 'PULLING'

## Visual States
- **Enabled**: Error colors (red icon and background)
- **Disabled**: Disabled colors (gray)

For other props, refer to [BAIButton](?path=/docs/button-baibutton--docs).
        `}}},argTypes:{revisionsFrgmt:{control:!1,description:`GraphQL fragment reference for artifact revision data`,table:{type:{summary:`BAIArtifactRevisionDeleteButtonFragment$key`}}},loading:{control:{type:`boolean`},description:`Loading state`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},onClick:{action:`clicked`,description:`Click handler`,table:{type:{summary:`() => void`}}}}},V=({loading:e=!1,onClick:t})=>{var n;let{artifactRevisions:r}=(0,C.useLazyLoadQuery)(x,{}),i=r==null||(n=r.edges)==null?void 0:n.map(e=>e.node);return i&&i.length>0&&(0,w.jsx)(y,{revisionsFrgmt:i,loading:e,onClick:t})},H={name:`Basic`,args:{},parameters:{docs:{description:{story:`Revisions with deletable status (not SCANNED or PULLING). The button appears in error colors (red).`}}},render:e=>(0,w.jsx)(m,{mockResolvers:{ArtifactRevisionConnection:()=>({edges:[{node:{status:`READY`}},{node:{status:`FAILED`}}]})},children:(0,w.jsx)(V,{...e})})},U={name:`NotDeletable`,args:{},parameters:{docs:{description:{story:`All revisions are SCANNED or PULLING, making them non-deletable. The button is automatically disabled with gray styling.`}}},render:e=>(0,w.jsx)(m,{mockResolvers:{ArtifactRevisionConnection:()=>({edges:[{node:{status:`SCANNED`}},{node:{status:`PULLING`}}]})},children:(0,w.jsx)(V,{...e})})},W={name:`MixedStatus`,args:{},parameters:{docs:{description:{story:`Mix of deletable and non-deletable revisions. The button is enabled because at least one revision is deletable.`}}},render:e=>(0,w.jsx)(m,{mockResolvers:{ArtifactRevisionConnection:()=>({edges:[{node:{status:`SCANNED`}},{node:{status:`READY`}},{node:{status:`PULLING`}}]})},children:(0,w.jsx)(V,{...e})})},G={name:`LoadingState`,args:{loading:!0},parameters:{docs:{description:{story:`Button in loading state during deletion operation.`}}},render:e=>(0,w.jsx)(m,{mockResolvers:{ArtifactRevisionConnection:()=>({edges:[{node:{status:`READY`}}]})},children:(0,w.jsx)(V,{...e})})},K={name:`AllStates`,parameters:{docs:{description:{story:`Comparison of all button states: deletable, not deletable, and loading.`}}},render:()=>(0,w.jsxs)(l,{direction:`column`,gap:`md`,children:[(0,w.jsxs)(l,{align:`center`,gap:`sm`,children:[(0,w.jsx)(`span`,{style:{width:120},children:`Deletable:`}),(0,w.jsx)(m,{mockResolvers:{ArtifactRevisionConnection:()=>({edges:[{node:{status:`READY`}}]})},children:(0,w.jsx)(V,{})})]}),(0,w.jsxs)(l,{align:`center`,gap:`sm`,children:[(0,w.jsx)(`span`,{style:{width:120},children:`Not Deletable:`}),(0,w.jsx)(m,{mockResolvers:{ArtifactRevisionConnection:()=>({edges:[{node:{status:`SCANNED`}}]})},children:(0,w.jsx)(V,{})})]}),(0,w.jsxs)(l,{align:`center`,gap:`sm`,children:[(0,w.jsx)(`span`,{style:{width:120},children:`Loading:`}),(0,w.jsx)(m,{mockResolvers:{ArtifactRevisionConnection:()=>({edges:[{node:{status:`READY`}}]})},children:(0,w.jsx)(V,{loading:!0})})]})]})},H.parameters={...H.parameters,docs:{...(T=H.parameters)==null?void 0:T.docs,source:{originalSource:`{
  name: 'Basic',
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Revisions with deletable status (not SCANNED or PULLING). The button appears in error colors (red).'
      }
    }
  },
  render: args => <RelayResolver mockResolvers={{
    ArtifactRevisionConnection: () => ({
      edges: [{
        node: {
          status: 'READY'
        }
      }, {
        node: {
          status: 'FAILED'
        }
      }]
    })
  }}>
      <QueryResolver {...args} />
    </RelayResolver>
}`,...(E=H.parameters)==null||(E=E.docs)==null?void 0:E.source},description:{story:`Deletable revisions - button is enabled with error styling`,...(D=H.parameters)==null||(D=D.docs)==null?void 0:D.description}}},U.parameters={...U.parameters,docs:{...(O=U.parameters)==null?void 0:O.docs,source:{originalSource:`{
  name: 'NotDeletable',
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'All revisions are SCANNED or PULLING, making them non-deletable. The button is automatically disabled with gray styling.'
      }
    }
  },
  render: args => <RelayResolver mockResolvers={{
    ArtifactRevisionConnection: () => ({
      edges: [{
        node: {
          status: 'SCANNED'
        }
      }, {
        node: {
          status: 'PULLING'
        }
      }]
    })
  }}>
      <QueryResolver {...args} />
    </RelayResolver>
}`,...(k=U.parameters)==null||(k=k.docs)==null?void 0:k.source},description:{story:`All revisions are SCANNED or PULLING - button is disabled`,...(A=U.parameters)==null||(A=A.docs)==null?void 0:A.description}}},W.parameters={...W.parameters,docs:{...(j=W.parameters)==null?void 0:j.docs,source:{originalSource:`{
  name: 'MixedStatus',
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Mix of deletable and non-deletable revisions. The button is enabled because at least one revision is deletable.'
      }
    }
  },
  render: args => <RelayResolver mockResolvers={{
    ArtifactRevisionConnection: () => ({
      edges: [{
        node: {
          status: 'SCANNED'
        }
      }, {
        node: {
          status: 'READY'
        }
      }, {
        node: {
          status: 'PULLING'
        }
      }]
    })
  }}>
      <QueryResolver {...args} />
    </RelayResolver>
}`,...(M=W.parameters)==null||(M=M.docs)==null?void 0:M.source},description:{story:`Mixed status revisions - button is enabled if at least one is deletable`,...(N=W.parameters)==null||(N=N.docs)==null?void 0:N.description}}},G.parameters={...G.parameters,docs:{...(P=G.parameters)==null?void 0:P.docs,source:{originalSource:`{
  name: 'LoadingState',
  args: {
    loading: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Button in loading state during deletion operation.'
      }
    }
  },
  render: args => <RelayResolver mockResolvers={{
    ArtifactRevisionConnection: () => ({
      edges: [{
        node: {
          status: 'READY'
        }
      }]
    })
  }}>
      <QueryResolver {...args} />
    </RelayResolver>
}`,...(F=G.parameters)==null||(F=F.docs)==null?void 0:F.source},description:{story:`Loading state`,...(I=G.parameters)==null||(I=I.docs)==null?void 0:I.description}}},K.parameters={...K.parameters,docs:{...(L=K.parameters)==null?void 0:L.docs,source:{originalSource:`{
  name: 'AllStates',
  parameters: {
    docs: {
      description: {
        story: 'Comparison of all button states: deletable, not deletable, and loading.'
      }
    }
  },
  render: () => <BAIFlex direction="column" gap="md">
      <BAIFlex align="center" gap="sm">
        <span style={{
        width: 120
      }}>Deletable:</span>
        <RelayResolver mockResolvers={{
        ArtifactRevisionConnection: () => ({
          edges: [{
            node: {
              status: 'READY'
            }
          }]
        })
      }}>
          <QueryResolver />
        </RelayResolver>
      </BAIFlex>

      <BAIFlex align="center" gap="sm">
        <span style={{
        width: 120
      }}>Not Deletable:</span>
        <RelayResolver mockResolvers={{
        ArtifactRevisionConnection: () => ({
          edges: [{
            node: {
              status: 'SCANNED'
            }
          }]
        })
      }}>
          <QueryResolver />
        </RelayResolver>
      </BAIFlex>

      <BAIFlex align="center" gap="sm">
        <span style={{
        width: 120
      }}>Loading:</span>
        <RelayResolver mockResolvers={{
        ArtifactRevisionConnection: () => ({
          edges: [{
            node: {
              status: 'READY'
            }
          }]
        })
      }}>
          <QueryResolver loading />
        </RelayResolver>
      </BAIFlex>
    </BAIFlex>
}`,...(R=K.parameters)==null||(R=R.docs)==null?void 0:R.source},description:{story:`Comparison of all states`,...(z=K.parameters)==null||(z=z.docs)==null?void 0:z.description}}},q=[`Default`,`NotDeletable`,`MixedStatus`,`Loading`,`AllStates`]})))()}J();export{K as AllStates,H as Default,G as Loading,W as MixedStatus,U as NotDeletable,q as __namedExportsOrder,B as default};