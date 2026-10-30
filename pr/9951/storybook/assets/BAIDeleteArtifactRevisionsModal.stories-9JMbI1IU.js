import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-DlPsW1c0.js";import{n,t as r}from"./BAITable-DjKp5dHj.js";import{n as i,t as a}from"./isEmpty-CptDxjc2.js";import{t as o}from"./jsx-runtime-MKhVqBIO.js";import{n as s,t as c}from"./useBAIi18n-CcFoH3bE.js";import{n as l,r as ee}from"./useTheme-B-966VfY.js";import{n as u,t as te}from"./BAIModal-CEOJGwNl.js";import{b as d,h as f,m as p,mt as m}from"./iframe-Dr5snffI.js";import{n as h,t as ne}from"./BAIAlert-BP9phjtI.js";import{n as g,t as _}from"./BAIFlex-DnaoYTJ1.js";import{t as v}from"./react-relay-sHama7hJ.js";import{c as re,o as ie,r as ae,s as oe}from"./helper-p-d7z67I.js";import{n as se,r as ce}from"./dist-VyLUzrdQ.js";import{n as le,t as ue}from"./BAIButton-CzGzKWte.js";import{n as de,t as fe}from"./BAIUnmountAfterClose-BFd4mgc4.js";import{n as pe,t as me}from"./BAIQuestionIconWithTooltip-Bp6GouaJ.js";import{n as he,t as ge}from"./BAIArtifactDescriptions-CYTT4rNS.js";import{n as _e,t as y}from"./RelayResolver-BnFyFQJn.js";var b;function x(){return(x=e((()=>{b=(function(){var e=[{defaultValue:null,kind:`LocalArgument`,name:`input`}],t=[{kind:`Variable`,name:`input`,variableName:`input`}],n={alias:null,args:null,kind:`ScalarField`,name:`status`,storageKey:null};return{fragment:{argumentDefinitions:e,kind:`Fragment`,metadata:null,name:`BAIDeleteArtifactRevisionsModalCleanupVersionMutation`,selections:[{alias:null,args:t,concreteType:`CleanupArtifactRevisionsPayload`,kind:`LinkedField`,name:`cleanupArtifactRevisions`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactRevisionConnection`,kind:`LinkedField`,name:`artifactRevisions`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactRevisionEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`node`,plural:!1,selections:[n],storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}],type:`Mutation`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:e,kind:`Operation`,name:`BAIDeleteArtifactRevisionsModalCleanupVersionMutation`,selections:[{alias:null,args:t,concreteType:`CleanupArtifactRevisionsPayload`,kind:`LinkedField`,name:`cleanupArtifactRevisions`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactRevisionConnection`,kind:`LinkedField`,name:`artifactRevisions`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactRevisionEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`node`,plural:!1,selections:[n,{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}]},params:{cacheID:`03897a25039ccf906a0013edbae95224`,id:null,metadata:{},name:`BAIDeleteArtifactRevisionsModalCleanupVersionMutation`,operationKind:`mutation`,text:`mutation BAIDeleteArtifactRevisionsModalCleanupVersionMutation(
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
`}}})(),b.hash=`a1b18aa3dacff842d5e39ba15c4e3994`})))()}var S;function C(){return(C=e((()=>{S={argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAIDeleteArtifactRevisionsModalArtifactFragment`,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{args:null,kind:`FragmentSpread`,name:`BAIArtifactDescriptionsFragment`}],type:`Artifact`,abstractKey:null},S.hash=`8eac061158289fcc677ac78d52d22410`})))()}var w;function T(){return(T=e((()=>{w={argumentDefinitions:[],kind:`Fragment`,metadata:{plural:!0},name:`BAIDeleteArtifactRevisionsModalArtifactRevisionFragment`,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`fieldId`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`version`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`size`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`status`,storageKey:null}],type:`ArtifactRevision`,abstractKey:null},w.hash=`621b082dd3c1f76c46533833531e4ecd`})))()}var E,D,O;function k(){return(k=e((()=>{x(),C(),T(),d(),re(),c(),h(),g(),u(),pe(),f(),de(),n(),he(),l(),a(),E=v(),D=o(),O=({selectedArtifactFrgmt:e,selectedArtifactRevisionFrgmt:t,onOk:n,onCancel:a,...o})=>{let{t:c}=s(),{token:l}=ee(),[u,d]=(0,E.useMutation)(b),f=(0,E.useFragment)(S,e),h=(0,E.useFragment)(w,t),g=h.filter(e=>e.status!==`PULLING`&&e.status!==`SCANNED`),v=[{title:c(`comp:BAIDeleteArtifactModal.Version`),dataIndex:`version`,key:`version`,render:e=>(0,D.jsx)(p,{monospace:!0,children:e}),width:`50%`},{title:c(`comp:BAIDeleteArtifactModal.Size`),dataIndex:`size`,key:`size`,render:e=>{var t;return(0,D.jsx)(p,{monospace:!0,children:e?(t=ae(e,`auto`))==null?void 0:t.displayValue:`N/A`})}}];return(0,D.jsx)(fe,{children:(0,D.jsx)(te,{title:c(`comp:BAIDeleteArtifactModal.RemoveVersions`),centered:!0,onOk:e=>{u({variables:{input:{artifactRevisionIds:g.map(e=>e.fieldId)}},onCompleted:(t,r)=>{if(r&&r.length>0){r.forEach(e=>{m.error(e.message??c(`comp:BAIDeleteArtifactModal.FailedToRemoveVersions`))});return}let i=t.cleanupArtifactRevisions;i?(m.success(c(`comp:BAIDeleteArtifactModal.SuccessFullyRemoved`,{count:i.artifactRevisions.edges.length})),n(e)):m.error(c(`comp:BAIDeleteArtifactModal.FailedToRemoveVersions`))},onError:e=>{m.error(e.message??c(`comp:BAIDeleteArtifactModal.FailedToRemoveVersions`))}})},onCancel:e=>{a(e)},okText:c(`general.button.Remove`),cancelText:c(`general.button.Cancel`),okButtonProps:{danger:!0,loading:d,disabled:i(g)||d},...o,children:(0,D.jsxs)(_,{direction:`column`,gap:`sm`,align:`stretch`,children:[g.length===h.length?null:(0,D.jsx)(ne,{icon:(0,D.jsx)(me,{title:c(`comp:BAIDeleteArtifactModal.OnlyVersionsNotInPULLINGOrSCANNED`),iconProps:{style:{color:l(`--color-info`)}},style:{marginRight:l(`--spacing-2`)}}),showIcon:!0,title:c(`comp:BAIDeleteArtifactModal.ExcludedVersions`,{count:h.length-g.length})}),f&&(0,D.jsx)(ge,{artifactFrgmt:f}),(0,D.jsx)(r,{columns:ie(v),dataSource:oe(h),pagination:{showSizeChanger:!1}})]})})})}})))()}var A;function j(){return(j=e((()=>{A=(function(){var e={kind:`Literal`,name:`offset`,value:0},t=[{kind:`Literal`,name:`first`,value:1},e],n=[{kind:`Literal`,name:`first`,value:10},e],r={alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},i={alias:null,args:null,kind:`ScalarField`,name:`name`,storageKey:null};return{fragment:{argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAIDeleteArtifactRevisionsModalStoriesQuery`,selections:[{alias:null,args:t,concreteType:`ArtifactConnection`,kind:`LinkedField`,name:`artifacts`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`Artifact`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{args:null,kind:`FragmentSpread`,name:`BAIDeleteArtifactRevisionsModalArtifactFragment`}],storageKey:null}],storageKey:null}],storageKey:`artifacts(first:1,offset:0)`},{alias:null,args:n,concreteType:`ArtifactRevisionConnection`,kind:`LinkedField`,name:`artifactRevisions`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactRevisionEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{args:null,kind:`FragmentSpread`,name:`BAIDeleteArtifactRevisionsModalArtifactRevisionFragment`}],storageKey:null}],storageKey:null}],storageKey:`artifactRevisions(first:10,offset:0)`}],type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[],kind:`Operation`,name:`BAIDeleteArtifactRevisionsModalStoriesQuery`,selections:[{alias:null,args:t,concreteType:`ArtifactConnection`,kind:`LinkedField`,name:`artifacts`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`Artifact`,kind:`LinkedField`,name:`node`,plural:!1,selections:[r,i,{alias:null,args:null,kind:`ScalarField`,name:`description`,storageKey:null},{alias:null,args:null,concreteType:`SourceInfo`,kind:`LinkedField`,name:`source`,plural:!1,selections:[i,{alias:null,args:null,kind:`ScalarField`,name:`url`,storageKey:null}],storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`type`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:`artifacts(first:1,offset:0)`},{alias:null,args:n,concreteType:`ArtifactRevisionConnection`,kind:`LinkedField`,name:`artifactRevisions`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactRevisionEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`node`,plural:!1,selections:[r,{alias:null,args:null,kind:`ScalarField`,name:`fieldId`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`version`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`size`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`status`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:`artifactRevisions(first:10,offset:0)`}]},params:{cacheID:`d17d10a95746d621fca6c70d41733383`,id:null,metadata:{},name:`BAIDeleteArtifactRevisionsModalStoriesQuery`,operationKind:`query`,text:`query BAIDeleteArtifactRevisionsModalStoriesQuery {
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
`}}})(),A.hash=`219164404d6fd8910ca00a4e7fff6816`})))()}var M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q,ve;function $(){return($=e((()=>{j(),_e(),le(),g(),k(),M=t(),N=v(),se(),P=o(),q={title:`Fragments/BAIDeleteArtifactRevisionsModal`,component:O,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`
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
        `}}},argTypes:{selectedArtifactFrgmt:{control:!1,description:`GraphQL fragment reference for artifact data (can be null)`,table:{type:{summary:`BAIDeleteArtifactRevisionsModalArtifactFragment$key | null`}}},selectedArtifactRevisionFrgmt:{control:!1,description:`GraphQL fragment reference for artifact revisions`,table:{type:{summary:`BAIDeleteArtifactRevisionsModalArtifactRevisionFragment$key`}}},open:{control:!1,description:`Whether the modal is visible (managed by parent component)`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},onOk:{control:!1,description:`Called after successful mutation completion`,table:{type:{summary:`(e: React.MouseEvent) => void`}}},onCancel:{control:!1,description:`Called when modal is cancelled`,table:{type:{summary:`(e: React.MouseEvent) => void`}}}},decorators:[e=>(0,P.jsx)(ce,{children:(0,P.jsx)(e,{})})]},J=()=>{var e,t;let[n,r]=(0,M.useState)(!1),{artifacts:i,artifactRevisions:a}=(0,N.useLazyLoadQuery)(A,{}),o=i==null||(e=i.edges)==null||(e=e[0])==null?void 0:e.node,s=a==null||(t=a.edges)==null?void 0:t.map(e=>e.node);return s&&s.length>0&&(0,P.jsxs)(_,{direction:`column`,gap:`md`,children:[(0,P.jsx)(ue,{onClick:()=>r(!0),children:`Open Modal`}),(0,P.jsx)(O,{selectedArtifactFrgmt:o??null,selectedArtifactRevisionFrgmt:s,open:n,onOk:()=>r(!1),onCancel:()=>r(!1)})]})},Y={name:`Basic`,parameters:{docs:{description:{story:`Delete multiple artifact revisions. The modal displays a table with version and size columns.`}}},render:()=>(0,P.jsx)(y,{mockResolvers:{Artifact:()=>({id:`QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==`,name:`my-model`,type:`model`,architecture:`x86_64`,description:`A trained machine learning model`,source:{name:`HuggingFace`,url:`https://huggingface.co/my-model`}}),ArtifactRevisionConnection:()=>({edges:[{node:{id:`QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMQ==`,version:`v1.0.0`,size:`1073741824`,status:`READY`}},{node:{id:`QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMg==`,version:`v1.1.0`,size:`2147483648`,status:`READY`}},{node:{id:`QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMw==`,version:`v2.0.0`,size:`3221225472`,status:`READY`}}]}),CleanupArtifactRevisionsPayload:()=>({artifactRevisions:{edges:[]}})},children:(0,P.jsx)(J,{})})},X={name:`WithExcludedRevisions`,parameters:{docs:{description:{story:`Some revisions are excluded from deletion due to PULLING or SCANNED status. An alert shows how many are excluded.`}}},render:()=>(0,P.jsx)(y,{mockResolvers:{Artifact:()=>({id:`QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==`,name:`dataset-train`,type:`dataset`,architecture:`aarch64`,description:`Training dataset for ML model`,source:{name:`S3 Bucket`,url:`https://s3.amazonaws.com/datasets/train`}}),ArtifactRevisionConnection:()=>({edges:[{node:{id:`QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMQ==`,version:`v1.0.0`,size:`1073741824`,status:`READY`}},{node:{id:`QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMg==`,version:`v1.1.0`,size:`2147483648`,status:`PULLING`}},{node:{id:`QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMw==`,version:`v2.0.0`,size:`3221225472`,status:`SCANNED`}},{node:{id:`QXJ0aWZhY3RSZXZpc2lvbjpyZXYtNA==`,version:`v2.1.0`,size:`4294967296`,status:`READY`}}]}),CleanupArtifactRevisionsPayload:()=>({artifactRevisions:{edges:[]}})},children:(0,P.jsx)(J,{})})},Z={name:`SingleRevision`,parameters:{docs:{description:{story:`Delete a single artifact revision.`}}},render:()=>(0,P.jsx)(y,{mockResolvers:{Artifact:()=>({id:`QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==`,name:`config-file`,type:`other`,architecture:`noarch`,description:`Configuration file`,source:{name:`Local`,url:``}}),ArtifactRevisionConnection:()=>({edges:[{node:{id:`QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMQ==`,version:`latest`,size:`1024`,status:`READY`}}]}),CleanupArtifactRevisionsPayload:()=>({artifactRevisions:{edges:[]}})},children:(0,P.jsx)(J,{})})},Q={name:`AllExcluded`,parameters:{docs:{description:{story:`All revisions are in PULLING or SCANNED status, so the Remove button is disabled.`}}},render:()=>(0,P.jsx)(y,{mockResolvers:{Artifact:()=>({id:`QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==`,name:`in-progress-model`,type:`model`,architecture:`x86_64`,description:`Model currently being processed`,source:{name:`GitHub`,url:`https://github.com/org/model`}}),ArtifactRevisionConnection:()=>({edges:[{node:{id:`QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMQ==`,version:`v1.0.0`,size:`1073741824`,status:`PULLING`}},{node:{id:`QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMg==`,version:`v2.0.0`,size:`2147483648`,status:`SCANNED`}}]}),CleanupArtifactRevisionsPayload:()=>({artifactRevisions:{edges:[]}})},children:(0,P.jsx)(J,{})})},Y.parameters={...Y.parameters,docs:{...(F=Y.parameters)==null?void 0:F.docs,source:{originalSource:`{
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
}`,...(I=Y.parameters)==null||(I=I.docs)==null?void 0:I.source},description:{story:`Multiple revisions deletion`,...(L=Y.parameters)==null||(L=L.docs)==null?void 0:L.description}}},X.parameters={...X.parameters,docs:{...(R=X.parameters)==null?void 0:R.docs,source:{originalSource:`{
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
}`,...(z=X.parameters)==null||(z=z.docs)==null?void 0:z.source},description:{story:`With excluded revisions (PULLING/SCANNED status)`,...(B=X.parameters)==null||(B=B.docs)==null?void 0:B.description}}},Z.parameters={...Z.parameters,docs:{...(V=Z.parameters)==null?void 0:V.docs,source:{originalSource:`{
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
}`,...(H=Z.parameters)==null||(H=H.docs)==null?void 0:H.source},description:{story:`Single revision deletion`,...(U=Z.parameters)==null||(U=U.docs)==null?void 0:U.description}}},Q.parameters={...Q.parameters,docs:{...(W=Q.parameters)==null?void 0:W.docs,source:{originalSource:`{
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
}`,...(G=Q.parameters)==null||(G=G.docs)==null?void 0:G.source},description:{story:`All revisions excluded (no deletable revisions)`,...(K=Q.parameters)==null||(K=K.docs)==null?void 0:K.description}}},ve=[`Default`,`WithExcludedRevisions`,`SingleRevision`,`AllExcluded`]})))()}$();export{Q as AllExcluded,Y as Default,Z as SingleRevision,X as WithExcludedRevisions,ve as __namedExportsOrder,q as default};