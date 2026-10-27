import{n as e}from"./rolldown-runtime-2s6bX4vc.js";import{n as t,t as n}from"./omit-DJc6Ke-e.js";import{n as r,t as i}from"./trash-2-BDu36rko.js";import{n as a,t as o}from"./BAIFlex-CAz1t6J5.js";import{n as s,t as c}from"./BAIButton-C-o5ANgR.js";import{n as l,t as u}from"./RelayResolver-b1nJU57O.js";import{jsx as d,jsxs as f}from"react/jsx-runtime";import{useTheme as p}from"@lablup/ui-common/theme";import{useFragment as m,useLazyLoadQuery as h}from"react-relay";var g;function _(){return(_=e((()=>{g={argumentDefinitions:[],kind:`Fragment`,metadata:{plural:!0},name:`BAIArtifactRevisionDeleteButtonFragment`,selections:[{alias:null,args:null,kind:`ScalarField`,name:`status`,storageKey:null}],type:`ArtifactRevision`,abstractKey:null},g.hash=`de15aa32192b0f0d63e3bd7f5f90d2b6`})))()}var v;function y(){return(y=e((()=>{_(),s(),n(),r(),v=({revisionsFrgmt:e,...n})=>{let{token:r}=p(),a=m(g,e).some(e=>e.status!==`SCANNED`&&e.status!==`PULLING`),o=n.disabled||n.loading||!a;return d(c,{icon:d(i,{size:`1em`}),disabled:o,type:`text`,style:{color:r(o?`--color-text-disabled`:`--color-error`),background:r(o?`--color-bg-container-disabled`:`--color-error-bg`),...n.style},...t(n,[`style`,`disabled`,`loading`])})}})))()}var b;function x(){return(x=e((()=>{b=(function(){var e=[{kind:`Literal`,name:`first`,value:10},{kind:`Literal`,name:`offset`,value:0}];return{fragment:{argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAIArtifactRevisionDeleteButtonStoriesQuery`,selections:[{alias:null,args:e,concreteType:`ArtifactRevisionConnection`,kind:`LinkedField`,name:`artifactRevisions`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactRevisionEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{args:null,kind:`FragmentSpread`,name:`BAIArtifactRevisionDeleteButtonFragment`}],storageKey:null}],storageKey:null}],storageKey:`artifactRevisions(first:10,offset:0)`}],type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[],kind:`Operation`,name:`BAIArtifactRevisionDeleteButtonStoriesQuery`,selections:[{alias:null,args:e,concreteType:`ArtifactRevisionConnection`,kind:`LinkedField`,name:`artifactRevisions`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactRevisionEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`status`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:`artifactRevisions(first:10,offset:0)`}]},params:{cacheID:`f9256d5d3a660072ce8d48a252703e6f`,id:null,metadata:{},name:`BAIArtifactRevisionDeleteButtonStoriesQuery`,operationKind:`query`,text:`query BAIArtifactRevisionDeleteButtonStoriesQuery {
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
`}}})(),b.hash=`9ca7f892cff7056588b89ee6cae001e2`})))()}var S,C,w,T,E,D,O,k;function A(){return(A=e((()=>{x(),l(),a(),y(),S={title:`Fragments/BAIArtifactRevisionDeleteButton`,component:v,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`
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
        `}}},argTypes:{revisionsFrgmt:{control:!1,description:`GraphQL fragment reference for artifact revision data`,table:{type:{summary:`BAIArtifactRevisionDeleteButtonFragment$key`}}},loading:{control:{type:`boolean`},description:`Loading state`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},onClick:{action:`clicked`,description:`Click handler`,table:{type:{summary:`() => void`}}}}},C=({loading:e=!1,onClick:t})=>{let{artifactRevisions:n}=h(b,{}),r=n?.edges?.map(e=>e.node);return r&&r.length>0&&d(v,{revisionsFrgmt:r,loading:e,onClick:t})},w={name:`Basic`,args:{},parameters:{docs:{description:{story:`Revisions with deletable status (not SCANNED or PULLING). The button appears in error colors (red).`}}},render:e=>d(u,{mockResolvers:{ArtifactRevisionConnection:()=>({edges:[{node:{status:`READY`}},{node:{status:`FAILED`}}]})},children:d(C,{...e})})},T={name:`NotDeletable`,args:{},parameters:{docs:{description:{story:`All revisions are SCANNED or PULLING, making them non-deletable. The button is automatically disabled with gray styling.`}}},render:e=>d(u,{mockResolvers:{ArtifactRevisionConnection:()=>({edges:[{node:{status:`SCANNED`}},{node:{status:`PULLING`}}]})},children:d(C,{...e})})},E={name:`MixedStatus`,args:{},parameters:{docs:{description:{story:`Mix of deletable and non-deletable revisions. The button is enabled because at least one revision is deletable.`}}},render:e=>d(u,{mockResolvers:{ArtifactRevisionConnection:()=>({edges:[{node:{status:`SCANNED`}},{node:{status:`READY`}},{node:{status:`PULLING`}}]})},children:d(C,{...e})})},D={name:`LoadingState`,args:{loading:!0},parameters:{docs:{description:{story:`Button in loading state during deletion operation.`}}},render:e=>d(u,{mockResolvers:{ArtifactRevisionConnection:()=>({edges:[{node:{status:`READY`}}]})},children:d(C,{...e})})},O={name:`AllStates`,parameters:{docs:{description:{story:`Comparison of all button states: deletable, not deletable, and loading.`}}},render:()=>f(o,{direction:`column`,gap:`md`,children:[f(o,{align:`center`,gap:`sm`,children:[d(`span`,{style:{width:120},children:`Deletable:`}),d(u,{mockResolvers:{ArtifactRevisionConnection:()=>({edges:[{node:{status:`READY`}}]})},children:d(C,{})})]}),f(o,{align:`center`,gap:`sm`,children:[d(`span`,{style:{width:120},children:`Not Deletable:`}),d(u,{mockResolvers:{ArtifactRevisionConnection:()=>({edges:[{node:{status:`SCANNED`}}]})},children:d(C,{})})]}),f(o,{align:`center`,gap:`sm`,children:[d(`span`,{style:{width:120},children:`Loading:`}),d(u,{mockResolvers:{ArtifactRevisionConnection:()=>({edges:[{node:{status:`READY`}}]})},children:d(C,{loading:!0})})]})]})},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
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
}`,...w.parameters?.docs?.source},description:{story:`Deletable revisions - button is enabled with error styling`,...w.parameters?.docs?.description}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
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
}`,...T.parameters?.docs?.source},description:{story:`All revisions are SCANNED or PULLING - button is disabled`,...T.parameters?.docs?.description}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
}`,...E.parameters?.docs?.source},description:{story:`Mixed status revisions - button is enabled if at least one is deletable`,...E.parameters?.docs?.description}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
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
}`,...D.parameters?.docs?.source},description:{story:`Loading state`,...D.parameters?.docs?.description}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
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
}`,...O.parameters?.docs?.source},description:{story:`Comparison of all states`,...O.parameters?.docs?.description}}},k=[`Default`,`NotDeletable`,`MixedStatus`,`Loading`,`AllStates`]})))()}A();export{O as AllStates,w as Default,D as Loading,E as MixedStatus,T as NotDeletable,k as __namedExportsOrder,S as default};