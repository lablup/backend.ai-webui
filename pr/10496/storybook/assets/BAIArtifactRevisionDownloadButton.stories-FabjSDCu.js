import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-MKhVqBIO.js";import{n,t as r}from"./BAIFlex-DnaoYTJ1.js";import{t as i}from"./react-relay-sHama7hJ.js";import{n as a,t as o}from"./BAIArtifactRevisionDownloadButton-DumFTiNl.js";import{n as s,t as c}from"./RelayResolver-BnFyFQJn.js";var l;function u(){return(u=e((()=>{l=(function(){var e=[{kind:`Literal`,name:`first`,value:10},{kind:`Literal`,name:`offset`,value:0}];return{fragment:{argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAIArtifactRevisionDownloadButtonStoriesQuery`,selections:[{alias:null,args:e,concreteType:`ArtifactRevisionConnection`,kind:`LinkedField`,name:`artifactRevisions`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactRevisionEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{args:null,kind:`FragmentSpread`,name:`BAIArtifactRevisionDownloadButtonFragment`}],storageKey:null}],storageKey:null}],storageKey:`artifactRevisions(first:10,offset:0)`}],type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[],kind:`Operation`,name:`BAIArtifactRevisionDownloadButtonStoriesQuery`,selections:[{alias:null,args:e,concreteType:`ArtifactRevisionConnection`,kind:`LinkedField`,name:`artifactRevisions`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactRevisionEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`status`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:`artifactRevisions(first:10,offset:0)`}]},params:{cacheID:`77a4d987273a48514738c15aca128a7e`,id:null,metadata:{},name:`BAIArtifactRevisionDownloadButtonStoriesQuery`,operationKind:`query`,text:`query BAIArtifactRevisionDownloadButtonStoriesQuery {
  artifactRevisions(offset: 0, first: 10) {
    edges {
      node {
        ...BAIArtifactRevisionDownloadButtonFragment
        id
      }
    }
  }
}

fragment BAIArtifactRevisionDownloadButtonFragment on ArtifactRevision {
  status
}
`}}})(),l.hash=`110e07e8baadc5bd84cb7bb1803ec55c`})))()}var d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F;function I(){return(I=e((()=>{u(),s(),n(),a(),d=i(),f=t(),O={title:`Fragments/BAIArtifactRevisionDownloadButton`,component:o,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`
**BAIArtifactRevisionDownloadButton** is a specialized download button for artifact revisions with automatic downloadability checks based on GraphQL fragment data.

## BAI-Specific Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`revisionsFrgmt\` | \`BAIArtifactRevisionDownloadButtonFragment$key\` | - | GraphQL fragment reference for revision data (required) |
| \`loading\` | \`boolean\` | \`false\` | Loading state (inherited from BAIButtonProps) |

## Downloadability Logic
The button automatically determines if revisions are downloadable:
- **Downloadable**: At least one revision with status === 'SCANNED'
- **Not Downloadable**: No revisions have status 'SCANNED'

## Visual States
- **Enabled**: Info colors (blue icon and background)
- **Disabled**: Disabled colors (gray)

For other props, refer to [BAIButton](?path=/docs/button-baibutton--docs).
        `}}},argTypes:{revisionsFrgmt:{control:!1,description:`GraphQL fragment reference for artifact revision data`,table:{type:{summary:`BAIArtifactRevisionDownloadButtonFragment$key`}}},loading:{control:{type:`boolean`},description:`Loading state`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},onClick:{action:`clicked`,description:`Click handler`,table:{type:{summary:`() => void`}}}}},k=({loading:e=!1,onClick:t})=>{var n;let{artifactRevisions:r}=(0,d.useLazyLoadQuery)(l,{}),i=r==null||(n=r.edges)==null?void 0:n.map(e=>e.node);return i&&i.length>0&&(0,f.jsx)(o,{revisionsFrgmt:i,loading:e,onClick:t})},A={name:`Basic`,args:{},parameters:{docs:{description:{story:`Revisions with SCANNED status are downloadable. The button appears in info colors (blue).`}}},render:e=>(0,f.jsx)(c,{mockResolvers:{ArtifactRevisionConnection:()=>({edges:[{node:{status:`SCANNED`}},{node:{status:`READY`}}]})},children:(0,f.jsx)(k,{...e})})},j={name:`NotDownloadable`,args:{},parameters:{docs:{description:{story:`No revisions have SCANNED status, making them non-downloadable. The button is automatically disabled with gray styling.`}}},render:e=>(0,f.jsx)(c,{mockResolvers:{ArtifactRevisionConnection:()=>({edges:[{node:{status:`READY`}},{node:{status:`PULLING`}}]})},children:(0,f.jsx)(k,{...e})})},M={name:`MixedStatus`,args:{},parameters:{docs:{description:{story:`Mix of SCANNED and non-SCANNED revisions. The button is enabled because at least one revision is downloadable.`}}},render:e=>(0,f.jsx)(c,{mockResolvers:{ArtifactRevisionConnection:()=>({edges:[{node:{status:`READY`}},{node:{status:`SCANNED`}},{node:{status:`PULLING`}}]})},children:(0,f.jsx)(k,{...e})})},N={name:`LoadingState`,args:{loading:!0},parameters:{docs:{description:{story:`Button in loading state during download operation.`}}},render:e=>(0,f.jsx)(c,{mockResolvers:{ArtifactRevisionConnection:()=>({edges:[{node:{status:`SCANNED`}}]})},children:(0,f.jsx)(k,{...e})})},P={name:`AllStates`,parameters:{docs:{description:{story:`Comparison of all button states: downloadable, not downloadable, and loading.`}}},render:()=>(0,f.jsxs)(r,{direction:`column`,gap:`md`,children:[(0,f.jsxs)(r,{align:`center`,gap:`sm`,children:[(0,f.jsx)(`span`,{style:{width:140},children:`Downloadable:`}),(0,f.jsx)(c,{mockResolvers:{ArtifactRevisionConnection:()=>({edges:[{node:{status:`SCANNED`}}]})},children:(0,f.jsx)(k,{})})]}),(0,f.jsxs)(r,{align:`center`,gap:`sm`,children:[(0,f.jsx)(`span`,{style:{width:140},children:`Not Downloadable:`}),(0,f.jsx)(c,{mockResolvers:{ArtifactRevisionConnection:()=>({edges:[{node:{status:`READY`}}]})},children:(0,f.jsx)(k,{})})]}),(0,f.jsxs)(r,{align:`center`,gap:`sm`,children:[(0,f.jsx)(`span`,{style:{width:140},children:`Loading:`}),(0,f.jsx)(c,{mockResolvers:{ArtifactRevisionConnection:()=>({edges:[{node:{status:`SCANNED`}}]})},children:(0,f.jsx)(k,{loading:!0})})]})]})},A.parameters={...A.parameters,docs:{...(p=A.parameters)==null?void 0:p.docs,source:{originalSource:`{
  name: 'Basic',
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Revisions with SCANNED status are downloadable. The button appears in info colors (blue).'
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
      }]
    })
  }}>
      <QueryResolver {...args} />
    </RelayResolver>
}`,...(m=A.parameters)==null||(m=m.docs)==null?void 0:m.source},description:{story:`Downloadable revisions - button is enabled with info styling`,...(h=A.parameters)==null||(h=h.docs)==null?void 0:h.description}}},j.parameters={...j.parameters,docs:{...(g=j.parameters)==null?void 0:g.docs,source:{originalSource:`{
  name: 'NotDownloadable',
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'No revisions have SCANNED status, making them non-downloadable. The button is automatically disabled with gray styling.'
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
          status: 'PULLING'
        }
      }]
    })
  }}>
      <QueryResolver {...args} />
    </RelayResolver>
}`,...(_=j.parameters)==null||(_=_.docs)==null?void 0:_.source},description:{story:`No SCANNED revisions - button is disabled`,...(v=j.parameters)==null||(v=v.docs)==null?void 0:v.description}}},M.parameters={...M.parameters,docs:{...(y=M.parameters)==null?void 0:y.docs,source:{originalSource:`{
  name: 'MixedStatus',
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Mix of SCANNED and non-SCANNED revisions. The button is enabled because at least one revision is downloadable.'
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
}`,...(b=M.parameters)==null||(b=b.docs)==null?void 0:b.source},description:{story:`Mixed status revisions - button is enabled if at least one is SCANNED`,...(x=M.parameters)==null||(x=x.docs)==null?void 0:x.description}}},N.parameters={...N.parameters,docs:{...(S=N.parameters)==null?void 0:S.docs,source:{originalSource:`{
  name: 'LoadingState',
  args: {
    loading: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Button in loading state during download operation.'
      }
    }
  },
  render: args => <RelayResolver mockResolvers={{
    ArtifactRevisionConnection: () => ({
      edges: [{
        node: {
          status: 'SCANNED'
        }
      }]
    })
  }}>
      <QueryResolver {...args} />
    </RelayResolver>
}`,...(C=N.parameters)==null||(C=C.docs)==null?void 0:C.source},description:{story:`Loading state`,...(w=N.parameters)==null||(w=w.docs)==null?void 0:w.description}}},P.parameters={...P.parameters,docs:{...(T=P.parameters)==null?void 0:T.docs,source:{originalSource:`{
  name: 'AllStates',
  parameters: {
    docs: {
      description: {
        story: 'Comparison of all button states: downloadable, not downloadable, and loading.'
      }
    }
  },
  render: () => <BAIFlex direction="column" gap="md">
      <BAIFlex align="center" gap="sm">
        <span style={{
        width: 140
      }}>Downloadable:</span>
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
        width: 140
      }}>Not Downloadable:</span>
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
        width: 140
      }}>Loading:</span>
        <RelayResolver mockResolvers={{
        ArtifactRevisionConnection: () => ({
          edges: [{
            node: {
              status: 'SCANNED'
            }
          }]
        })
      }}>
          <QueryResolver loading />
        </RelayResolver>
      </BAIFlex>
    </BAIFlex>
}`,...(E=P.parameters)==null||(E=E.docs)==null?void 0:E.source},description:{story:`Comparison of all states`,...(D=P.parameters)==null||(D=D.docs)==null?void 0:D.description}}},F=[`Default`,`NotDownloadable`,`MixedStatus`,`Loading`,`AllStates`]})))()}I();export{P as AllStates,A as Default,N as Loading,M as MixedStatus,j as NotDownloadable,F as __namedExportsOrder,O as default};