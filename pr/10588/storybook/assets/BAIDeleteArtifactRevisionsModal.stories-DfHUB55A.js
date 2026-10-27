import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-D0Ex1IVc.js";import{n,t as r}from"./isEmpty-SRC6Jtfi.js";import{t as i}from"./jsx-runtime-MKhVqBIO.js";import{n as a,t as o}from"./useBAIi18n-Biey1teG.js";import{n as s,r as c}from"./useTheme-Br6nszEH.js";import{n as l,t as u}from"./BAIModal-BkVS6TrM.js";import{b as d,h as f,m as p,mt as m}from"./iframe-BF4Nk2qQ.js";import{n as h,t as ee}from"./BAIAlert-Dbdp9ksW.js";import{n as g,t as _}from"./BAIFlex-BOFoS5KY.js";import{t as v}from"./react-relay-sBALIJlt.js";import{c as y,o as b,r as x,s as te}from"./helper-CPPrFJ2v.js";import{n as ne,r as S}from"./dist-BWBbun8L.js";import{n as re,t as ie}from"./BAIButton-BCdRP02k.js";import{n as ae,t as C}from"./BAIUnmountAfterClose-BLNmR2Ks.js";import{n as w,t as T}from"./BAIQuestionIconWithTooltip-Cd1Zvmh3.js";import{n as E,t as D}from"./BAITable-BYZKAaal.js";import{n as oe,t as O}from"./BAIArtifactDescriptions-DmnXBRuc.js";import{n as k,t as A}from"./RelayResolver-CMrgwoPg.js";var j;function M(){return(M=e((()=>{j=(function(){var e=[{defaultValue:null,kind:`LocalArgument`,name:`input`}],t=[{kind:`Variable`,name:`input`,variableName:`input`}],n={alias:null,args:null,kind:`ScalarField`,name:`status`,storageKey:null};return{fragment:{argumentDefinitions:e,kind:`Fragment`,metadata:null,name:`BAIDeleteArtifactRevisionsModalCleanupVersionMutation`,selections:[{alias:null,args:t,concreteType:`CleanupArtifactRevisionsPayload`,kind:`LinkedField`,name:`cleanupArtifactRevisions`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactRevisionConnection`,kind:`LinkedField`,name:`artifactRevisions`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactRevisionEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`node`,plural:!1,selections:[n],storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}],type:`Mutation`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:e,kind:`Operation`,name:`BAIDeleteArtifactRevisionsModalCleanupVersionMutation`,selections:[{alias:null,args:t,concreteType:`CleanupArtifactRevisionsPayload`,kind:`LinkedField`,name:`cleanupArtifactRevisions`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactRevisionConnection`,kind:`LinkedField`,name:`artifactRevisions`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactRevisionEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`node`,plural:!1,selections:[n,{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}]},params:{cacheID:`03897a25039ccf906a0013edbae95224`,id:null,metadata:{},name:`BAIDeleteArtifactRevisionsModalCleanupVersionMutation`,operationKind:`mutation`,text:`mutation BAIDeleteArtifactRevisionsModalCleanupVersionMutation(
  $input: CleanupArtifactRevisionsInput!
) {
  cleanupArtifactRevisions(input: $input) {
    artifactRevisions {
      edges {
        node {
          status
          id
        }
      }
    }
  }
}
`}}})(),j.hash=`a1b18aa3dacff842d5e39ba15c4e3994`})))()}var N;function P(){return(P=e((()=>{N={argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAIDeleteArtifactRevisionsModalArtifactFragment`,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{args:null,kind:`FragmentSpread`,name:`BAIArtifactDescriptionsFragment`}],type:`Artifact`,abstractKey:null},N.hash=`8eac061158289fcc677ac78d52d22410`})))()}var F;function I(){return(I=e((()=>{F={argumentDefinitions:[],kind:`Fragment`,metadata:{plural:!0},name:`BAIDeleteArtifactRevisionsModalArtifactRevisionFragment`,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`fieldId`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`version`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`size`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`status`,storageKey:null}],type:`ArtifactRevision`,abstractKey:null},F.hash=`621b082dd3c1f76c46533833531e4ecd`})))()}var L,R,z;function B(){return(B=e((()=>{M(),P(),I(),d(),y(),o(),h(),g(),l(),w(),f(),ae(),E(),oe(),s(),r(),L=v(),R=i(),z=({selectedArtifactFrgmt:e,selectedArtifactRevisionFrgmt:t,onOk:r,onCancel:i,...o})=>{let{t:s}=a(),{token:l}=c(),[d,f]=(0,L.useMutation)(j),h=(0,L.useFragment)(N,e),g=(0,L.useFragment)(F,t),v=g.filter(e=>e.status!==`PULLING`&&e.status!==`SCANNED`),y=[{title:s(`comp:BAIDeleteArtifactModal.Version`),dataIndex:`version`,key:`version`,render:e=>(0,R.jsx)(p,{monospace:!0,children:e}),width:`50%`},{title:s(`comp:BAIDeleteArtifactModal.Size`),dataIndex:`size`,key:`size`,render:e=>(0,R.jsx)(p,{monospace:!0,children:e?x(e,`auto`)?.displayValue:`N/A`})}];return(0,R.jsx)(C,{children:(0,R.jsx)(u,{title:s(`comp:BAIDeleteArtifactModal.RemoveVersions`),centered:!0,onOk:e=>{d({variables:{input:{artifactRevisionIds:v.map(e=>e.fieldId)}},onCompleted:(t,n)=>{if(n&&n.length>0){n.forEach(e=>{m.error(e.message??s(`comp:BAIDeleteArtifactModal.FailedToRemoveVersions`))});return}let i=t.cleanupArtifactRevisions;i?(m.success(s(`comp:BAIDeleteArtifactModal.SuccessFullyRemoved`,{count:i.artifactRevisions.edges.length})),r(e)):m.error(s(`comp:BAIDeleteArtifactModal.FailedToRemoveVersions`))},onError:e=>{m.error(e.message??s(`comp:BAIDeleteArtifactModal.FailedToRemoveVersions`))}})},onCancel:e=>{i(e)},okText:s(`general.button.Remove`),cancelText:s(`general.button.Cancel`),okButtonProps:{danger:!0,loading:f,disabled:n(v)||f},...o,children:(0,R.jsxs)(_,{direction:`column`,gap:`sm`,align:`stretch`,children:[v.length===g.length?null:(0,R.jsx)(ee,{icon:(0,R.jsx)(T,{title:s(`comp:BAIDeleteArtifactModal.OnlyVersionsNotInPULLINGOrSCANNED`),iconProps:{style:{color:l(`--color-info`)}},style:{marginRight:l(`--spacing-2`)}}),showIcon:!0,title:s(`comp:BAIDeleteArtifactModal.ExcludedVersions`,{count:g.length-v.length})}),h&&(0,R.jsx)(O,{artifactFrgmt:h}),(0,R.jsx)(D,{columns:b(y),dataSource:te(g),pagination:{showSizeChanger:!1}})]})})})}})))()}var V;function H(){return(H=e((()=>{V=(function(){var e={kind:`Literal`,name:`offset`,value:0},t=[{kind:`Literal`,name:`first`,value:1},e],n=[{kind:`Literal`,name:`first`,value:10},e],r={alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},i={alias:null,args:null,kind:`ScalarField`,name:`name`,storageKey:null};return{fragment:{argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAIDeleteArtifactRevisionsModalStoriesQuery`,selections:[{alias:null,args:t,concreteType:`ArtifactConnection`,kind:`LinkedField`,name:`artifacts`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`Artifact`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{args:null,kind:`FragmentSpread`,name:`BAIDeleteArtifactRevisionsModalArtifactFragment`}],storageKey:null}],storageKey:null}],storageKey:`artifacts(first:1,offset:0)`},{alias:null,args:n,concreteType:`ArtifactRevisionConnection`,kind:`LinkedField`,name:`artifactRevisions`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactRevisionEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{args:null,kind:`FragmentSpread`,name:`BAIDeleteArtifactRevisionsModalArtifactRevisionFragment`}],storageKey:null}],storageKey:null}],storageKey:`artifactRevisions(first:10,offset:0)`}],type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[],kind:`Operation`,name:`BAIDeleteArtifactRevisionsModalStoriesQuery`,selections:[{alias:null,args:t,concreteType:`ArtifactConnection`,kind:`LinkedField`,name:`artifacts`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`Artifact`,kind:`LinkedField`,name:`node`,plural:!1,selections:[r,i,{alias:null,args:null,kind:`ScalarField`,name:`description`,storageKey:null},{alias:null,args:null,concreteType:`SourceInfo`,kind:`LinkedField`,name:`source`,plural:!1,selections:[i,{alias:null,args:null,kind:`ScalarField`,name:`url`,storageKey:null}],storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`type`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:`artifacts(first:1,offset:0)`},{alias:null,args:n,concreteType:`ArtifactRevisionConnection`,kind:`LinkedField`,name:`artifactRevisions`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactRevisionEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`node`,plural:!1,selections:[r,{alias:null,args:null,kind:`ScalarField`,name:`fieldId`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`version`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`size`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`status`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:`artifactRevisions(first:10,offset:0)`}]},params:{cacheID:`d17d10a95746d621fca6c70d41733383`,id:null,metadata:{},name:`BAIDeleteArtifactRevisionsModalStoriesQuery`,operationKind:`query`,text:`query BAIDeleteArtifactRevisionsModalStoriesQuery {
  artifacts(offset: 0, first: 1) {
    edges {
      node {
        ...BAIDeleteArtifactRevisionsModalArtifactFragment
        id
      }
    }
  }
  artifactRevisions(offset: 0, first: 10) {
    edges {
      node {
        ...BAIDeleteArtifactRevisionsModalArtifactRevisionFragment
        id
      }
    }
  }
}

fragment BAIArtifactDescriptionsFragment on Artifact {
  name
  description
  source {
    name
    url
  }
  ...BAIArtifactTypeTokenFragment
}

fragment BAIArtifactTypeTokenFragment on Artifact {
  type
}

fragment BAIDeleteArtifactRevisionsModalArtifactFragment on Artifact {
  id
  ...BAIArtifactDescriptionsFragment
}

fragment BAIDeleteArtifactRevisionsModalArtifactRevisionFragment on ArtifactRevision {
  id
  fieldId
  version
  size
  status
}
`}}})(),V.hash=`219164404d6fd8910ca00a4e7fff6816`})))()}var U,W,G,K,q,J,Y,X,Z,Q;function $(){return($=e((()=>{H(),k(),re(),g(),B(),U=t(),W=v(),ne(),G=i(),K={title:`Fragments/BAIDeleteArtifactRevisionsModal`,component:z,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`
**BAIDeleteArtifactRevisionsModal** is a modal for deleting artifact revisions with table view and filtering.

## BAI-Specific Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`selectedArtifactFrgmt\` | \`BAIDeleteArtifactRevisionsModalArtifactFragment$key \\| null\` | - | GraphQL fragment reference for artifact data |
| \`selectedArtifactRevisionFrgmt\` | \`BAIDeleteArtifactRevisionsModalArtifactRevisionFragment$key\` | - | GraphQL fragment reference for artifact revisions (required) |
| \`onOk\` | \`(e: React.MouseEvent) => void\` | - | Called after successful mutation completion (not on button click) |
| \`onCancel\` | \`(e: React.MouseEvent) => void\` | - | Called when modal is cancelled |

## Features
- **Revision Table**: Shows version and size columns for selected revisions
- **Status Filtering**: Automatically filters out PULLING and SCANNED status revisions
- **Exclusion Alert**: Displays alert when some revisions are excluded from deletion
- **Artifact Info**: Shows artifact description (name, type, architecture)
- **Mutation Integration**: Uses \`cleanupArtifactRevisions\` mutation
- **Success/Error Handling**: Displays success/error messages via Ant Design message component
- **Loading State**: Remove button shows loading state during mutation execution
- **Danger Button**: Remove button is styled as danger (red) to indicate destructive action
- **Smart Disabling**: Button disabled when no deletable revisions or during execution

## Usage Pattern
The modal is typically used with artifact revision selection:
1. User selects one or more artifact revisions
2. Clicks "Remove" button
3. Modal shows table of selected revisions with artifact info
4. Revisions with PULLING or SCANNED status are filtered out with alert
5. On Remove, mutation executes and modal closes on success

For other props, refer to [Ant Design Modal](https://ant.design/components/modal).

## Storybook
Mutation is mocked and will execute successfully, closing the modal on completion.
        `}}},argTypes:{selectedArtifactFrgmt:{control:!1,description:`GraphQL fragment reference for artifact data (can be null)`,table:{type:{summary:`BAIDeleteArtifactRevisionsModalArtifactFragment$key | null`}}},selectedArtifactRevisionFrgmt:{control:!1,description:`GraphQL fragment reference for artifact revisions`,table:{type:{summary:`BAIDeleteArtifactRevisionsModalArtifactRevisionFragment$key`}}},open:{control:!1,description:`Whether the modal is visible (managed by parent component)`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},onOk:{control:!1,description:`Called after successful mutation completion`,table:{type:{summary:`(e: React.MouseEvent) => void`}}},onCancel:{control:!1,description:`Called when modal is cancelled`,table:{type:{summary:`(e: React.MouseEvent) => void`}}}},decorators:[e=>(0,G.jsx)(S,{children:(0,G.jsx)(e,{})})]},q=()=>{let[e,t]=(0,U.useState)(!1),{artifacts:n,artifactRevisions:r}=(0,W.useLazyLoadQuery)(V,{}),i=n?.edges?.[0]?.node,a=r?.edges?.map(e=>e.node);return a&&a.length>0&&(0,G.jsxs)(_,{direction:`column`,gap:`md`,children:[(0,G.jsx)(ie,{onClick:()=>t(!0),children:`Open Modal`}),(0,G.jsx)(z,{selectedArtifactFrgmt:i??null,selectedArtifactRevisionFrgmt:a,open:e,onOk:()=>t(!1),onCancel:()=>t(!1)})]})},J={name:`Basic`,parameters:{docs:{description:{story:`Delete multiple artifact revisions. The modal displays a table with version and size columns.`}}},render:()=>(0,G.jsx)(A,{mockResolvers:{Artifact:()=>({id:`QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==`,name:`my-model`,type:`model`,architecture:`x86_64`,description:`A trained machine learning model`,source:{name:`HuggingFace`,url:`https://huggingface.co/my-model`}}),ArtifactRevisionConnection:()=>({edges:[{node:{id:`QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMQ==`,version:`v1.0.0`,size:`1073741824`,status:`READY`}},{node:{id:`QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMg==`,version:`v1.1.0`,size:`2147483648`,status:`READY`}},{node:{id:`QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMw==`,version:`v2.0.0`,size:`3221225472`,status:`READY`}}]}),CleanupArtifactRevisionsPayload:()=>({artifactRevisions:{edges:[]}})},children:(0,G.jsx)(q,{})})},Y={name:`WithExcludedRevisions`,parameters:{docs:{description:{story:`Some revisions are excluded from deletion due to PULLING or SCANNED status. An alert shows how many are excluded.`}}},render:()=>(0,G.jsx)(A,{mockResolvers:{Artifact:()=>({id:`QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==`,name:`dataset-train`,type:`dataset`,architecture:`aarch64`,description:`Training dataset for ML model`,source:{name:`S3 Bucket`,url:`https://s3.amazonaws.com/datasets/train`}}),ArtifactRevisionConnection:()=>({edges:[{node:{id:`QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMQ==`,version:`v1.0.0`,size:`1073741824`,status:`READY`}},{node:{id:`QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMg==`,version:`v1.1.0`,size:`2147483648`,status:`PULLING`}},{node:{id:`QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMw==`,version:`v2.0.0`,size:`3221225472`,status:`SCANNED`}},{node:{id:`QXJ0aWZhY3RSZXZpc2lvbjpyZXYtNA==`,version:`v2.1.0`,size:`4294967296`,status:`READY`}}]}),CleanupArtifactRevisionsPayload:()=>({artifactRevisions:{edges:[]}})},children:(0,G.jsx)(q,{})})},X={name:`SingleRevision`,parameters:{docs:{description:{story:`Delete a single artifact revision.`}}},render:()=>(0,G.jsx)(A,{mockResolvers:{Artifact:()=>({id:`QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==`,name:`config-file`,type:`other`,architecture:`noarch`,description:`Configuration file`,source:{name:`Local`,url:``}}),ArtifactRevisionConnection:()=>({edges:[{node:{id:`QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMQ==`,version:`latest`,size:`1024`,status:`READY`}}]}),CleanupArtifactRevisionsPayload:()=>({artifactRevisions:{edges:[]}})},children:(0,G.jsx)(q,{})})},Z={name:`AllExcluded`,parameters:{docs:{description:{story:`All revisions are in PULLING or SCANNED status, so the Remove button is disabled.`}}},render:()=>(0,G.jsx)(A,{mockResolvers:{Artifact:()=>({id:`QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==`,name:`in-progress-model`,type:`model`,architecture:`x86_64`,description:`Model currently being processed`,source:{name:`GitHub`,url:`https://github.com/org/model`}}),ArtifactRevisionConnection:()=>({edges:[{node:{id:`QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMQ==`,version:`v1.0.0`,size:`1073741824`,status:`PULLING`}},{node:{id:`QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMg==`,version:`v2.0.0`,size:`2147483648`,status:`SCANNED`}}]}),CleanupArtifactRevisionsPayload:()=>({artifactRevisions:{edges:[]}})},children:(0,G.jsx)(q,{})})},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'Delete multiple artifact revisions. The modal displays a table with version and size columns.'
      }
    }
  },
  render: () => <RelayResolver mockResolvers={{
    Artifact: () => ({
      id: 'QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==',
      name: 'my-model',
      type: 'model',
      architecture: 'x86_64',
      description: 'A trained machine learning model',
      source: {
        name: 'HuggingFace',
        url: 'https://huggingface.co/my-model'
      }
    }),
    ArtifactRevisionConnection: () => ({
      edges: [{
        node: {
          id: 'QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMQ==',
          version: 'v1.0.0',
          size: '1073741824',
          // 1GB
          status: 'READY'
        }
      }, {
        node: {
          id: 'QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMg==',
          version: 'v1.1.0',
          size: '2147483648',
          // 2GB
          status: 'READY'
        }
      }, {
        node: {
          id: 'QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMw==',
          version: 'v2.0.0',
          size: '3221225472',
          // 3GB
          status: 'READY'
        }
      }]
    }),
    CleanupArtifactRevisionsPayload: () => ({
      artifactRevisions: {
        edges: []
      }
    })
  }}>
      <QueryResolver />
    </RelayResolver>
}`,...J.parameters?.docs?.source},description:{story:`Multiple revisions deletion`,...J.parameters?.docs?.description}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  name: 'WithExcludedRevisions',
  parameters: {
    docs: {
      description: {
        story: 'Some revisions are excluded from deletion due to PULLING or SCANNED status. An alert shows how many are excluded.'
      }
    }
  },
  render: () => <RelayResolver mockResolvers={{
    Artifact: () => ({
      id: 'QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==',
      name: 'dataset-train',
      type: 'dataset',
      architecture: 'aarch64',
      description: 'Training dataset for ML model',
      source: {
        name: 'S3 Bucket',
        url: 'https://s3.amazonaws.com/datasets/train'
      }
    }),
    ArtifactRevisionConnection: () => ({
      edges: [{
        node: {
          id: 'QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMQ==',
          version: 'v1.0.0',
          size: '1073741824',
          status: 'READY'
        }
      }, {
        node: {
          id: 'QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMg==',
          version: 'v1.1.0',
          size: '2147483648',
          status: 'PULLING' // Will be excluded
        }
      }, {
        node: {
          id: 'QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMw==',
          version: 'v2.0.0',
          size: '3221225472',
          status: 'SCANNED' // Will be excluded
        }
      }, {
        node: {
          id: 'QXJ0aWZhY3RSZXZpc2lvbjpyZXYtNA==',
          version: 'v2.1.0',
          size: '4294967296',
          status: 'READY'
        }
      }]
    }),
    CleanupArtifactRevisionsPayload: () => ({
      artifactRevisions: {
        edges: []
      }
    })
  }}>
      <QueryResolver />
    </RelayResolver>
}`,...Y.parameters?.docs?.source},description:{story:`With excluded revisions (PULLING/SCANNED status)`,...Y.parameters?.docs?.description}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  name: 'SingleRevision',
  parameters: {
    docs: {
      description: {
        story: 'Delete a single artifact revision.'
      }
    }
  },
  render: () => <RelayResolver mockResolvers={{
    Artifact: () => ({
      id: 'QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==',
      name: 'config-file',
      type: 'other',
      architecture: 'noarch',
      description: 'Configuration file',
      source: {
        name: 'Local',
        url: ''
      }
    }),
    ArtifactRevisionConnection: () => ({
      edges: [{
        node: {
          id: 'QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMQ==',
          version: 'latest',
          size: '1024',
          // 1KB
          status: 'READY'
        }
      }]
    }),
    CleanupArtifactRevisionsPayload: () => ({
      artifactRevisions: {
        edges: []
      }
    })
  }}>
      <QueryResolver />
    </RelayResolver>
}`,...X.parameters?.docs?.source},description:{story:`Single revision deletion`,...X.parameters?.docs?.description}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
  name: 'AllExcluded',
  parameters: {
    docs: {
      description: {
        story: 'All revisions are in PULLING or SCANNED status, so the Remove button is disabled.'
      }
    }
  },
  render: () => <RelayResolver mockResolvers={{
    Artifact: () => ({
      id: 'QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==',
      name: 'in-progress-model',
      type: 'model',
      architecture: 'x86_64',
      description: 'Model currently being processed',
      source: {
        name: 'GitHub',
        url: 'https://github.com/org/model'
      }
    }),
    ArtifactRevisionConnection: () => ({
      edges: [{
        node: {
          id: 'QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMQ==',
          version: 'v1.0.0',
          size: '1073741824',
          status: 'PULLING'
        }
      }, {
        node: {
          id: 'QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMg==',
          version: 'v2.0.0',
          size: '2147483648',
          status: 'SCANNED'
        }
      }]
    }),
    CleanupArtifactRevisionsPayload: () => ({
      artifactRevisions: {
        edges: []
      }
    })
  }}>
      <QueryResolver />
    </RelayResolver>
}`,...Z.parameters?.docs?.source},description:{story:`All revisions excluded (no deletable revisions)`,...Z.parameters?.docs?.description}}},Q=[`Default`,`WithExcludedRevisions`,`SingleRevision`,`AllExcluded`]})))()}$();export{Z as AllExcluded,J as Default,X as SingleRevision,Y as WithExcludedRevisions,Q as __namedExportsOrder,K as default};