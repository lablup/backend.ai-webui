import{n as e}from"./rolldown-runtime-2s6bX4vc.js";import{n as t,t as n}from"./BAIFlex-CAz1t6J5.js";import{n as r,t as i}from"./BAIArtifactRevisionDownloadButton-3fsAJ2CZ.js";import{n as a,t as o}from"./RelayResolver-b1nJU57O.js";import{jsx as s,jsxs as c}from"react/jsx-runtime";import{useLazyLoadQuery as l}from"react-relay";var u;function d(){return(d=e((()=>{u=(function(){var e=[{kind:`Literal`,name:`first`,value:10},{kind:`Literal`,name:`offset`,value:0}];return{fragment:{argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAIArtifactRevisionDownloadButtonStoriesQuery`,selections:[{alias:null,args:e,concreteType:`ArtifactRevisionConnection`,kind:`LinkedField`,name:`artifactRevisions`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactRevisionEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{args:null,kind:`FragmentSpread`,name:`BAIArtifactRevisionDownloadButtonFragment`}],storageKey:null}],storageKey:null}],storageKey:`artifactRevisions(first:10,offset:0)`}],type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[],kind:`Operation`,name:`BAIArtifactRevisionDownloadButtonStoriesQuery`,selections:[{alias:null,args:e,concreteType:`ArtifactRevisionConnection`,kind:`LinkedField`,name:`artifactRevisions`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactRevisionEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`status`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:`artifactRevisions(first:10,offset:0)`}]},params:{cacheID:`77a4d987273a48514738c15aca128a7e`,id:null,metadata:{},name:`BAIArtifactRevisionDownloadButtonStoriesQuery`,operationKind:`query`,text:`query BAIArtifactRevisionDownloadButtonStoriesQuery {
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
`}}})(),u.hash=`110e07e8baadc5bd84cb7bb1803ec55c`})))()}var f,p,m,h,g,_,v,y;function b(){return(b=e((()=>{d(),a(),t(),r(),f={title:`Fragments/BAIArtifactRevisionDownloadButton`,component:i,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`
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
        `}}},argTypes:{revisionsFrgmt:{control:!1,description:`GraphQL fragment reference for artifact revision data`,table:{type:{summary:`BAIArtifactRevisionDownloadButtonFragment$key`}}},loading:{control:{type:`boolean`},description:`Loading state`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},onClick:{action:`clicked`,description:`Click handler`,table:{type:{summary:`() => void`}}}}},p=({loading:e=!1,onClick:t})=>{let{artifactRevisions:n}=l(u,{}),r=n?.edges?.map(e=>e.node);return r&&r.length>0&&s(i,{revisionsFrgmt:r,loading:e,onClick:t})},m={name:`Basic`,args:{},parameters:{docs:{description:{story:`Revisions with SCANNED status are downloadable. The button appears in info colors (blue).`}}},render:e=>s(o,{mockResolvers:{ArtifactRevisionConnection:()=>({edges:[{node:{status:`SCANNED`}},{node:{status:`READY`}}]})},children:s(p,{...e})})},h={name:`NotDownloadable`,args:{},parameters:{docs:{description:{story:`No revisions have SCANNED status, making them non-downloadable. The button is automatically disabled with gray styling.`}}},render:e=>s(o,{mockResolvers:{ArtifactRevisionConnection:()=>({edges:[{node:{status:`READY`}},{node:{status:`PULLING`}}]})},children:s(p,{...e})})},g={name:`MixedStatus`,args:{},parameters:{docs:{description:{story:`Mix of SCANNED and non-SCANNED revisions. The button is enabled because at least one revision is downloadable.`}}},render:e=>s(o,{mockResolvers:{ArtifactRevisionConnection:()=>({edges:[{node:{status:`READY`}},{node:{status:`SCANNED`}},{node:{status:`PULLING`}}]})},children:s(p,{...e})})},_={name:`LoadingState`,args:{loading:!0},parameters:{docs:{description:{story:`Button in loading state during download operation.`}}},render:e=>s(o,{mockResolvers:{ArtifactRevisionConnection:()=>({edges:[{node:{status:`SCANNED`}}]})},children:s(p,{...e})})},v={name:`AllStates`,parameters:{docs:{description:{story:`Comparison of all button states: downloadable, not downloadable, and loading.`}}},render:()=>c(n,{direction:`column`,gap:`md`,children:[c(n,{align:`center`,gap:`sm`,children:[s(`span`,{style:{width:140},children:`Downloadable:`}),s(o,{mockResolvers:{ArtifactRevisionConnection:()=>({edges:[{node:{status:`SCANNED`}}]})},children:s(p,{})})]}),c(n,{align:`center`,gap:`sm`,children:[s(`span`,{style:{width:140},children:`Not Downloadable:`}),s(o,{mockResolvers:{ArtifactRevisionConnection:()=>({edges:[{node:{status:`READY`}}]})},children:s(p,{})})]}),c(n,{align:`center`,gap:`sm`,children:[s(`span`,{style:{width:140},children:`Loading:`}),s(o,{mockResolvers:{ArtifactRevisionConnection:()=>({edges:[{node:{status:`SCANNED`}}]})},children:s(p,{loading:!0})})]})]})},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source},description:{story:`Downloadable revisions - button is enabled with info styling`,...m.parameters?.docs?.description}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source},description:{story:`No SCANNED revisions - button is disabled`,...h.parameters?.docs?.description}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source},description:{story:`Mixed status revisions - button is enabled if at least one is SCANNED`,...g.parameters?.docs?.description}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source},description:{story:`Loading state`,..._.parameters?.docs?.description}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source},description:{story:`Comparison of all states`,...v.parameters?.docs?.description}}},y=[`Default`,`NotDownloadable`,`MixedStatus`,`Loading`,`AllStates`]})))()}b();export{v as AllStates,m as Default,_ as Loading,g as MixedStatus,h as NotDownloadable,y as __namedExportsOrder,f as default};