import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-DlPsW1c0.js";import{n,t as r}from"./isEmpty-CptDxjc2.js";import{t as i}from"./jsx-runtime-MKhVqBIO.js";import{n as a,t as o}from"./useBAIi18n-DGn2iC2x.js";import{n as s,r as ee}from"./useTheme-B-966VfY.js";import{n as c,t as te}from"./BAIModal-CuFaRLdT.js";import{b as l,h as u,m as d,mt as f}from"./iframe-BRl5vSB8.js";import{n as p,t as ne}from"./BAIAlert-B6Zs5Dnk.js";import{n as m,t as h}from"./BAIFlex-DnaoYTJ1.js";import{t as g}from"./react-relay-sHama7hJ.js";import{c as _,o as re,r as ie,s as ae}from"./helper-p-d7z67I.js";import{n as oe,r as se}from"./dist-VyLUzrdQ.js";import{n as ce,t as le}from"./BAIButton-Buz9-z_0.js";import{n as ue,t as de}from"./BAIUnmountAfterClose-BFd4mgc4.js";import{n as fe,t as pe}from"./BAIQuestionIconWithTooltip-Bp6GouaJ.js";import{n as me,t as he}from"./BAITable-wiufPHtC.js";import{n as ge,t as _e}from"./BAIArtifactDescriptions-DByNn-nr.js";import{n as ve,t as v}from"./RelayResolver-BnFyFQJn.js";var y;function b(){return(b=e((()=>{y=(function(){var e=[{defaultValue:null,kind:`LocalArgument`,name:`input`}],t=[{kind:`Variable`,name:`input`,variableName:`input`}],n={alias:null,args:null,kind:`ScalarField`,name:`status`,storageKey:null};return{fragment:{argumentDefinitions:e,kind:`Fragment`,metadata:null,name:`BAIDeleteArtifactRevisionsModalCleanupVersionMutation`,selections:[{alias:null,args:t,concreteType:`CleanupArtifactRevisionsPayload`,kind:`LinkedField`,name:`cleanupArtifactRevisions`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactRevisionConnection`,kind:`LinkedField`,name:`artifactRevisions`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactRevisionEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`node`,plural:!1,selections:[n],storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}],type:`Mutation`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:e,kind:`Operation`,name:`BAIDeleteArtifactRevisionsModalCleanupVersionMutation`,selections:[{alias:null,args:t,concreteType:`CleanupArtifactRevisionsPayload`,kind:`LinkedField`,name:`cleanupArtifactRevisions`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactRevisionConnection`,kind:`LinkedField`,name:`artifactRevisions`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactRevisionEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`node`,plural:!1,selections:[n,{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}]},params:{cacheID:`03897a25039ccf906a0013edbae95224`,id:null,metadata:{},name:`BAIDeleteArtifactRevisionsModalCleanupVersionMutation`,operationKind:`mutation`,text:`mutation BAIDeleteArtifactRevisionsModalCleanupVersionMutation(
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
`}}})(),y.hash=`a1b18aa3dacff842d5e39ba15c4e3994`})))()}var x;function S(){return(S=e((()=>{x={argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAIDeleteArtifactRevisionsModalArtifactFragment`,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{args:null,kind:`FragmentSpread`,name:`BAIArtifactDescriptionsFragment`}],type:`Artifact`,abstractKey:null},x.hash=`8eac061158289fcc677ac78d52d22410`})))()}var C;function w(){return(w=e((()=>{C={argumentDefinitions:[],kind:`Fragment`,metadata:{plural:!0},name:`BAIDeleteArtifactRevisionsModalArtifactRevisionFragment`,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`fieldId`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`version`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`size`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`status`,storageKey:null}],type:`ArtifactRevision`,abstractKey:null},C.hash=`621b082dd3c1f76c46533833531e4ecd`})))()}var T,E,D;function O(){return(O=e((()=>{b(),S(),w(),l(),_(),o(),p(),m(),c(),fe(),u(),ue(),me(),ge(),s(),r(),T=g(),E=i(),D=({selectedArtifactFrgmt:e,selectedArtifactRevisionFrgmt:t,onOk:r,onCancel:i,...o})=>{let{t:s}=a(),{token:c}=ee(),[l,u]=(0,T.useMutation)(y),p=(0,T.useFragment)(x,e),m=(0,T.useFragment)(C,t),g=m.filter(e=>e.status!==`PULLING`&&e.status!==`SCANNED`),_=[{title:s(`comp:BAIDeleteArtifactModal.Version`),dataIndex:`version`,key:`version`,render:e=>(0,E.jsx)(d,{monospace:!0,children:e}),width:`50%`},{title:s(`comp:BAIDeleteArtifactModal.Size`),dataIndex:`size`,key:`size`,render:e=>{var t;return(0,E.jsx)(d,{monospace:!0,children:e?(t=ie(e,`auto`))==null?void 0:t.displayValue:`N/A`})}}];return(0,E.jsx)(de,{children:(0,E.jsx)(te,{title:s(`comp:BAIDeleteArtifactModal.RemoveVersions`),centered:!0,onOk:e=>{l({variables:{input:{artifactRevisionIds:g.map(e=>e.fieldId)}},onCompleted:(t,n)=>{if(n&&n.length>0){n.forEach(e=>{f.error(e.message??s(`comp:BAIDeleteArtifactModal.FailedToRemoveVersions`))});return}let i=t.cleanupArtifactRevisions;i?(f.success(s(`comp:BAIDeleteArtifactModal.SuccessFullyRemoved`,{count:i.artifactRevisions.edges.length})),r(e)):f.error(s(`comp:BAIDeleteArtifactModal.FailedToRemoveVersions`))},onError:e=>{f.error(e.message??s(`comp:BAIDeleteArtifactModal.FailedToRemoveVersions`))}})},onCancel:e=>{i(e)},okText:s(`general.button.Remove`),cancelText:s(`general.button.Cancel`),okButtonProps:{danger:!0,loading:u,disabled:n(g)||u},...o,children:(0,E.jsxs)(h,{direction:`column`,gap:`sm`,align:`stretch`,children:[g.length===m.length?null:(0,E.jsx)(ne,{icon:(0,E.jsx)(pe,{title:s(`comp:BAIDeleteArtifactModal.OnlyVersionsNotInPULLINGOrSCANNED`),iconProps:{style:{color:c(`--color-info`)}},style:{marginRight:c(`--spacing-2`)}}),showIcon:!0,title:s(`comp:BAIDeleteArtifactModal.ExcludedVersions`,{count:m.length-g.length})}),p&&(0,E.jsx)(_e,{artifactFrgmt:p}),(0,E.jsx)(he,{columns:re(_),dataSource:ae(m),pagination:{showSizeChanger:!1}})]})})})}})))()}var k;function A(){return(A=e((()=>{k=(function(){var e={kind:`Literal`,name:`offset`,value:0},t=[{kind:`Literal`,name:`first`,value:1},e],n=[{kind:`Literal`,name:`first`,value:10},e],r={alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},i={alias:null,args:null,kind:`ScalarField`,name:`name`,storageKey:null};return{fragment:{argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAIDeleteArtifactRevisionsModalStoriesQuery`,selections:[{alias:null,args:t,concreteType:`ArtifactConnection`,kind:`LinkedField`,name:`artifacts`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`Artifact`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{args:null,kind:`FragmentSpread`,name:`BAIDeleteArtifactRevisionsModalArtifactFragment`}],storageKey:null}],storageKey:null}],storageKey:`artifacts(first:1,offset:0)`},{alias:null,args:n,concreteType:`ArtifactRevisionConnection`,kind:`LinkedField`,name:`artifactRevisions`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactRevisionEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{args:null,kind:`FragmentSpread`,name:`BAIDeleteArtifactRevisionsModalArtifactRevisionFragment`}],storageKey:null}],storageKey:null}],storageKey:`artifactRevisions(first:10,offset:0)`}],type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[],kind:`Operation`,name:`BAIDeleteArtifactRevisionsModalStoriesQuery`,selections:[{alias:null,args:t,concreteType:`ArtifactConnection`,kind:`LinkedField`,name:`artifacts`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`Artifact`,kind:`LinkedField`,name:`node`,plural:!1,selections:[r,i,{alias:null,args:null,kind:`ScalarField`,name:`description`,storageKey:null},{alias:null,args:null,concreteType:`SourceInfo`,kind:`LinkedField`,name:`source`,plural:!1,selections:[i,{alias:null,args:null,kind:`ScalarField`,name:`url`,storageKey:null}],storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`type`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:`artifacts(first:1,offset:0)`},{alias:null,args:n,concreteType:`ArtifactRevisionConnection`,kind:`LinkedField`,name:`artifactRevisions`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactRevisionEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`node`,plural:!1,selections:[r,{alias:null,args:null,kind:`ScalarField`,name:`fieldId`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`version`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`size`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`status`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:`artifactRevisions(first:10,offset:0)`}]},params:{cacheID:`d17d10a95746d621fca6c70d41733383`,id:null,metadata:{},name:`BAIDeleteArtifactRevisionsModalStoriesQuery`,operationKind:`query`,text:`query BAIDeleteArtifactRevisionsModalStoriesQuery {
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
`}}})(),k.hash=`219164404d6fd8910ca00a4e7fff6816`})))()}var j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q;function $(){return($=e((()=>{A(),ve(),ce(),m(),O(),j=t(),M=g(),oe(),N=i(),K={title:`Fragments/BAIDeleteArtifactRevisionsModal`,component:D,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`
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
        `}}},argTypes:{selectedArtifactFrgmt:{control:!1,description:`GraphQL fragment reference for artifact data (can be null)`,table:{type:{summary:`BAIDeleteArtifactRevisionsModalArtifactFragment$key | null`}}},selectedArtifactRevisionFrgmt:{control:!1,description:`GraphQL fragment reference for artifact revisions`,table:{type:{summary:`BAIDeleteArtifactRevisionsModalArtifactRevisionFragment$key`}}},open:{control:!1,description:`Whether the modal is visible (managed by parent component)`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},onOk:{control:!1,description:`Called after successful mutation completion`,table:{type:{summary:`(e: React.MouseEvent) => void`}}},onCancel:{control:!1,description:`Called when modal is cancelled`,table:{type:{summary:`(e: React.MouseEvent) => void`}}}},decorators:[e=>(0,N.jsx)(se,{children:(0,N.jsx)(e,{})})]},q=()=>{var e,t;let[n,r]=(0,j.useState)(!1),{artifacts:i,artifactRevisions:a}=(0,M.useLazyLoadQuery)(k,{}),o=i==null||(e=i.edges)==null||(e=e[0])==null?void 0:e.node,s=a==null||(t=a.edges)==null?void 0:t.map(e=>e.node);return s&&s.length>0&&(0,N.jsxs)(h,{direction:`column`,gap:`md`,children:[(0,N.jsx)(le,{onClick:()=>r(!0),children:`Open Modal`}),(0,N.jsx)(D,{selectedArtifactFrgmt:o??null,selectedArtifactRevisionFrgmt:s,open:n,onOk:()=>r(!1),onCancel:()=>r(!1)})]})},J={name:`Basic`,parameters:{docs:{description:{story:`Delete multiple artifact revisions. The modal displays a table with version and size columns.`}}},render:()=>(0,N.jsx)(v,{mockResolvers:{Artifact:()=>({id:`QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==`,name:`my-model`,type:`model`,architecture:`x86_64`,description:`A trained machine learning model`,source:{name:`HuggingFace`,url:`https://huggingface.co/my-model`}}),ArtifactRevisionConnection:()=>({edges:[{node:{id:`QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMQ==`,version:`v1.0.0`,size:`1073741824`,status:`READY`}},{node:{id:`QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMg==`,version:`v1.1.0`,size:`2147483648`,status:`READY`}},{node:{id:`QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMw==`,version:`v2.0.0`,size:`3221225472`,status:`READY`}}]}),CleanupArtifactRevisionsPayload:()=>({artifactRevisions:{edges:[]}})},children:(0,N.jsx)(q,{})})},Y={name:`WithExcludedRevisions`,parameters:{docs:{description:{story:`Some revisions are excluded from deletion due to PULLING or SCANNED status. An alert shows how many are excluded.`}}},render:()=>(0,N.jsx)(v,{mockResolvers:{Artifact:()=>({id:`QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==`,name:`dataset-train`,type:`dataset`,architecture:`aarch64`,description:`Training dataset for ML model`,source:{name:`S3 Bucket`,url:`https://s3.amazonaws.com/datasets/train`}}),ArtifactRevisionConnection:()=>({edges:[{node:{id:`QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMQ==`,version:`v1.0.0`,size:`1073741824`,status:`READY`}},{node:{id:`QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMg==`,version:`v1.1.0`,size:`2147483648`,status:`PULLING`}},{node:{id:`QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMw==`,version:`v2.0.0`,size:`3221225472`,status:`SCANNED`}},{node:{id:`QXJ0aWZhY3RSZXZpc2lvbjpyZXYtNA==`,version:`v2.1.0`,size:`4294967296`,status:`READY`}}]}),CleanupArtifactRevisionsPayload:()=>({artifactRevisions:{edges:[]}})},children:(0,N.jsx)(q,{})})},X={name:`SingleRevision`,parameters:{docs:{description:{story:`Delete a single artifact revision.`}}},render:()=>(0,N.jsx)(v,{mockResolvers:{Artifact:()=>({id:`QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==`,name:`config-file`,type:`other`,architecture:`noarch`,description:`Configuration file`,source:{name:`Local`,url:``}}),ArtifactRevisionConnection:()=>({edges:[{node:{id:`QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMQ==`,version:`latest`,size:`1024`,status:`READY`}}]}),CleanupArtifactRevisionsPayload:()=>({artifactRevisions:{edges:[]}})},children:(0,N.jsx)(q,{})})},Z={name:`AllExcluded`,parameters:{docs:{description:{story:`All revisions are in PULLING or SCANNED status, so the Remove button is disabled.`}}},render:()=>(0,N.jsx)(v,{mockResolvers:{Artifact:()=>({id:`QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==`,name:`in-progress-model`,type:`model`,architecture:`x86_64`,description:`Model currently being processed`,source:{name:`GitHub`,url:`https://github.com/org/model`}}),ArtifactRevisionConnection:()=>({edges:[{node:{id:`QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMQ==`,version:`v1.0.0`,size:`1073741824`,status:`PULLING`}},{node:{id:`QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMg==`,version:`v2.0.0`,size:`2147483648`,status:`SCANNED`}}]}),CleanupArtifactRevisionsPayload:()=>({artifactRevisions:{edges:[]}})},children:(0,N.jsx)(q,{})})},J.parameters={...J.parameters,docs:{...(P=J.parameters)==null?void 0:P.docs,source:{originalSource:`{
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
}`,...(F=J.parameters)==null||(F=F.docs)==null?void 0:F.source},description:{story:`Multiple revisions deletion`,...(I=J.parameters)==null||(I=I.docs)==null?void 0:I.description}}},Y.parameters={...Y.parameters,docs:{...(L=Y.parameters)==null?void 0:L.docs,source:{originalSource:`{
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
}`,...(R=Y.parameters)==null||(R=R.docs)==null?void 0:R.source},description:{story:`With excluded revisions (PULLING/SCANNED status)`,...(z=Y.parameters)==null||(z=z.docs)==null?void 0:z.description}}},X.parameters={...X.parameters,docs:{...(B=X.parameters)==null?void 0:B.docs,source:{originalSource:`{
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
}`,...(V=X.parameters)==null||(V=V.docs)==null?void 0:V.source},description:{story:`Single revision deletion`,...(H=X.parameters)==null||(H=H.docs)==null?void 0:H.description}}},Z.parameters={...Z.parameters,docs:{...(U=Z.parameters)==null?void 0:U.docs,source:{originalSource:`{
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
}`,...(W=Z.parameters)==null||(W=W.docs)==null?void 0:W.source},description:{story:`All revisions excluded (no deletable revisions)`,...(G=Z.parameters)==null||(G=G.docs)==null?void 0:G.description}}},Q=[`Default`,`WithExcludedRevisions`,`SingleRevision`,`AllExcluded`]})))()}$();export{Z as AllExcluded,J as Default,X as SingleRevision,Y as WithExcludedRevisions,Q as __namedExportsOrder,K as default};