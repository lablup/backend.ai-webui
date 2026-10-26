import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-MKhVqBIO.js";import{n,t as r}from"./BAIFlex-BOFoS5KY.js";import{t as i}from"./react-relay-sBALIJlt.js";import{n as a,t as o}from"./BAIArtifactRevisionDownloadButton-5EbeAne7.js";import{n as s,t as c}from"./RelayResolver-CMrgwoPg.js";var l;function u(){return(u=e((()=>{l=(function(){var e=[{kind:`Literal`,name:`first`,value:10},{kind:`Literal`,name:`offset`,value:0}];return{fragment:{argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAIArtifactRevisionDownloadButtonStoriesQuery`,selections:[{alias:null,args:e,concreteType:`ArtifactRevisionConnection`,kind:`LinkedField`,name:`artifactRevisions`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactRevisionEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{args:null,kind:`FragmentSpread`,name:`BAIArtifactRevisionDownloadButtonFragment`}],storageKey:null}],storageKey:null}],storageKey:`artifactRevisions(first:10,offset:0)`}],type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[],kind:`Operation`,name:`BAIArtifactRevisionDownloadButtonStoriesQuery`,selections:[{alias:null,args:e,concreteType:`ArtifactRevisionConnection`,kind:`LinkedField`,name:`artifactRevisions`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactRevisionEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`status`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:`artifactRevisions(first:10,offset:0)`}]},params:{cacheID:`77a4d987273a48514738c15aca128a7e`,id:null,metadata:{},name:`BAIArtifactRevisionDownloadButtonStoriesQuery`,operationKind:`query`,text:`query BAIArtifactRevisionDownloadButtonStoriesQuery {
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
`}}})(),l.hash=`110e07e8baadc5bd84cb7bb1803ec55c`})))()}var d,f,p,m,h,g,_,v,y,b;function x(){return(x=e((()=>{u(),s(),n(),a(),d=i(),f=t(),p={title:`Fragments/BAIArtifactRevisionDownloadButton`,component:o,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`
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
        `}}},argTypes:{revisionsFrgmt:{control:!1,description:`GraphQL fragment reference for artifact revision data`,table:{type:{summary:`BAIArtifactRevisionDownloadButtonFragment$key`}}},loading:{control:{type:`boolean`},description:`Loading state`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},onClick:{action:`clicked`,description:`Click handler`,table:{type:{summary:`() => void`}}}}},m=({loading:e=!1,onClick:t})=>{let{artifactRevisions:n}=(0,d.useLazyLoadQuery)(l,{}),r=n?.edges?.map(e=>e.node);return r&&r.length>0&&(0,f.jsx)(o,{revisionsFrgmt:r,loading:e,onClick:t})},h={name:`Basic`,args:{},parameters:{docs:{description:{story:`Revisions with SCANNED status are downloadable. The button appears in info colors (blue).`}}},render:e=>(0,f.jsx)(c,{mockResolvers:{ArtifactRevisionConnection:()=>({edges:[{node:{status:`SCANNED`}},{node:{status:`READY`}}]})},children:(0,f.jsx)(m,{...e})})},g={name:`NotDownloadable`,args:{},parameters:{docs:{description:{story:`No revisions have SCANNED status, making them non-downloadable. The button is automatically disabled with gray styling.`}}},render:e=>(0,f.jsx)(c,{mockResolvers:{ArtifactRevisionConnection:()=>({edges:[{node:{status:`READY`}},{node:{status:`PULLING`}}]})},children:(0,f.jsx)(m,{...e})})},_={name:`MixedStatus`,args:{},parameters:{docs:{description:{story:`Mix of SCANNED and non-SCANNED revisions. The button is enabled because at least one revision is downloadable.`}}},render:e=>(0,f.jsx)(c,{mockResolvers:{ArtifactRevisionConnection:()=>({edges:[{node:{status:`READY`}},{node:{status:`SCANNED`}},{node:{status:`PULLING`}}]})},children:(0,f.jsx)(m,{...e})})},v={name:`LoadingState`,args:{loading:!0},parameters:{docs:{description:{story:`Button in loading state during download operation.`}}},render:e=>(0,f.jsx)(c,{mockResolvers:{ArtifactRevisionConnection:()=>({edges:[{node:{status:`SCANNED`}}]})},children:(0,f.jsx)(m,{...e})})},y={name:`AllStates`,parameters:{docs:{description:{story:`Comparison of all button states: downloadable, not downloadable, and loading.`}}},render:()=>(0,f.jsxs)(r,{direction:`column`,gap:`md`,children:[(0,f.jsxs)(r,{align:`center`,gap:`sm`,children:[(0,f.jsx)(`span`,{style:{width:140},children:`Downloadable:`}),(0,f.jsx)(c,{mockResolvers:{ArtifactRevisionConnection:()=>({edges:[{node:{status:`SCANNED`}}]})},children:(0,f.jsx)(m,{})})]}),(0,f.jsxs)(r,{align:`center`,gap:`sm`,children:[(0,f.jsx)(`span`,{style:{width:140},children:`Not Downloadable:`}),(0,f.jsx)(c,{mockResolvers:{ArtifactRevisionConnection:()=>({edges:[{node:{status:`READY`}}]})},children:(0,f.jsx)(m,{})})]}),(0,f.jsxs)(r,{align:`center`,gap:`sm`,children:[(0,f.jsx)(`span`,{style:{width:140},children:`Loading:`}),(0,f.jsx)(c,{mockResolvers:{ArtifactRevisionConnection:()=>({edges:[{node:{status:`SCANNED`}}]})},children:(0,f.jsx)(m,{loading:!0})})]})]})},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source},description:{story:`Downloadable revisions - button is enabled with info styling`,...h.parameters?.docs?.description}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source},description:{story:`No SCANNED revisions - button is disabled`,...g.parameters?.docs?.description}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source},description:{story:`Mixed status revisions - button is enabled if at least one is SCANNED`,..._.parameters?.docs?.description}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source},description:{story:`Loading state`,...v.parameters?.docs?.description}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source},description:{story:`Comparison of all states`,...y.parameters?.docs?.description}}},b=[`Default`,`NotDownloadable`,`MixedStatus`,`Loading`,`AllStates`]})))()}x();export{y as AllStates,h as Default,v as Loading,_ as MixedStatus,g as NotDownloadable,b as __namedExportsOrder,p as default};