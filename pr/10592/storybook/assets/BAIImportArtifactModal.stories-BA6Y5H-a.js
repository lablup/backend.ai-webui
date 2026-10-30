import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-DlPsW1c0.js";import{n,t as r}from"./isEmpty-CptDxjc2.js";import{t as i}from"./jsx-runtime-MKhVqBIO.js";import{n as a,t as o}from"./useBAIi18n-DURTYAKn.js";import{n as s,r as ee}from"./useTheme-B-966VfY.js";import{n as c,t as te}from"./BAIModal-CmC20hmO.js";import{b as l,h as u,m as d,y as ne}from"./iframe-S1YKfNYt.js";import{n as f,t as re}from"./BAIAlert-BQBU8OX7.js";import{n as p,t as m}from"./BAIFlex-DnaoYTJ1.js";import{t as h}from"./react-relay-sHama7hJ.js";import{c as g,o as ie,r as ae,s as oe}from"./helper-p-d7z67I.js";import{n as _,r as v}from"./dist-VyLUzrdQ.js";import{n as se,t as ce}from"./BAIButton-DHsNLRMw.js";import{n as le,t as ue}from"./BAIUnmountAfterClose-BFd4mgc4.js";import{n as de,t as fe}from"./BAIQuestionIconWithTooltip-Bp6GouaJ.js";import{n as pe,t as me}from"./BAITable-CtK_L12B.js";import{n as he,t as ge}from"./BAIArtifactDescriptions-RX29S677.js";import{n as _e,t as y}from"./RelayResolver-BnFyFQJn.js";var b;function x(){return(x=e((()=>{b={argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAIImportArtifactModalArtifactFragment`,selections:[{kind:`RequiredField`,field:{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},action:`THROW`},{alias:null,args:null,kind:`ScalarField`,name:`entityId`,storageKey:null},{kind:`RequiredField`,field:{alias:null,args:null,kind:`ScalarField`,name:`name`,storageKey:null},action:`THROW`},{args:null,kind:`FragmentSpread`,name:`BAIArtifactDescriptionsFragment`}],type:`Artifact`,abstractKey:null},b.hash=`0acb4346670ccea65e9b31dd5d1dde6b`})))()}var S;function C(){return(C=e((()=>{S={argumentDefinitions:[],kind:`Fragment`,metadata:{plural:!0},name:`BAIImportArtifactModalArtifactRevisionFragment`,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`fieldId`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`version`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`size`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`status`,storageKey:null}],type:`ArtifactRevision`,abstractKey:null},S.hash=`ffe03fd9195e02d00eac623a59a5915e`})))()}var w;function T(){return(T=e((()=>{w=(function(){var e={defaultValue:null,kind:`LocalArgument`,name:`connectionIds`},t={defaultValue:null,kind:`LocalArgument`,name:`input`},n=[{kind:`Variable`,name:`input`,variableName:`input`}],r={alias:null,args:null,kind:`ScalarField`,name:`taskId`,storageKey:null},i={alias:null,args:null,kind:`ScalarField`,name:`version`,storageKey:null},a={alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},o={alias:null,args:null,concreteType:`ArtifactRevisionEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`node`,plural:!1,selections:[a,{alias:null,args:null,kind:`ScalarField`,name:`status`,storageKey:null}],storageKey:null}],storageKey:null};return{fragment:{argumentDefinitions:[e,t],kind:`Fragment`,metadata:null,name:`BAIImportArtifactModalImportArtifactsMutation`,selections:[{alias:null,args:n,concreteType:`ImportArtifactsPayload`,kind:`LinkedField`,name:`importArtifacts`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactRevisionImportTask`,kind:`LinkedField`,name:`tasks`,plural:!0,selections:[r,{alias:null,args:null,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`artifactRevision`,plural:!1,selections:[i],storageKey:null}],storageKey:null},{alias:null,args:null,concreteType:`ArtifactRevisionConnection`,kind:`LinkedField`,name:`artifactRevisions`,plural:!1,selections:[o],storageKey:null}],storageKey:null}],type:`Mutation`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[t,e],kind:`Operation`,name:`BAIImportArtifactModalImportArtifactsMutation`,selections:[{alias:null,args:n,concreteType:`ImportArtifactsPayload`,kind:`LinkedField`,name:`importArtifacts`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactRevisionImportTask`,kind:`LinkedField`,name:`tasks`,plural:!0,selections:[r,{alias:null,args:null,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`artifactRevision`,plural:!1,selections:[i,a],storageKey:null}],storageKey:null},{alias:null,args:null,concreteType:`ArtifactRevisionConnection`,kind:`LinkedField`,name:`artifactRevisions`,plural:!1,selections:[o,{alias:null,args:null,filters:null,handle:`appendEdge`,key:``,kind:`LinkedHandle`,name:`edges`,handleArgs:[{kind:`Variable`,name:`connections`,variableName:`connectionIds`}]}],storageKey:null}],storageKey:null}]},params:{cacheID:`7ff02c568f1c337b76719e22a948ac6b`,id:null,metadata:{},name:`BAIImportArtifactModalImportArtifactsMutation`,operationKind:`mutation`,text:`mutation BAIImportArtifactModalImportArtifactsMutation(
  $input: ImportArtifactsInput!
) {
  importArtifacts(input: $input) {
    tasks {
      taskId
      artifactRevision {
        version
        id
      }
    }
    artifactRevisions {
      edges {
        node {
          id
          status
        }
      }
    }
  }
}
`}}})(),w.hash=`7918fb18108ff64999034b77bf975aa9`})))()}var E,D,O;function k(){return(k=e((()=>{x(),C(),T(),l(),g(),o(),f(),p(),c(),de(),u(),le(),pe(),he(),s(),r(),E=h(),D=i(),O=({selectedArtifactFrgmt:e,selectedArtifactRevisionFrgmt:t,onOk:r,onCancel:i,connectionIds:o,...s})=>{let{t:c}=a(),{message:l}=ne.useApp(),{token:u}=ee(),f=(0,E.useFragment)(b,e),p=(0,E.useFragment)(S,t),[h,g]=(0,E.useMutation)(w),_=p.filter(e=>e.status===`SCANNED`),v=[{title:c(`comp:BAIImportArtifactModal.Version`),dataIndex:`version`,key:`version`,render:e=>(0,D.jsx)(d,{monospace:!0,children:e}),width:`50%`},{title:c(`comp:BAIImportArtifactModal.Size`),dataIndex:`size`,key:`size`,render:e=>{var t;return(0,D.jsx)(d,{monospace:!0,children:e?(t=ae(e,`auto`))==null?void 0:t.displayValue:`N/A`})}}];return(0,D.jsx)(ue,{children:(0,D.jsx)(te,{title:c(`comp:BAIImportArtifactModal.PullVersion`),centered:!0,onOk:e=>{h({variables:{input:{artifactRevisionIds:_.map(e=>e.fieldId)},connectionIds:o??[]},onCompleted:(t,n)=>{if(n&&n.length>0){n.forEach(e=>l.error(e.message??c(`comp:BAIImportArtifactModal.FailedToPullVersions`)));return}let i=t.importArtifacts;i?(l.success(c(`comp:BAIImportArtifactModal.SuccessFullyPulled`,{count:i.artifactRevisions.edges.length})),r(e,i.tasks.filter(e=>e.taskId!=null).map(e=>({taskId:e.taskId,version:e.artifactRevision.version,artifact:{id:(f==null?void 0:f.entityId)??``,name:(f==null?void 0:f.name)??``}})))):l.error(c(`comp:BAIImportArtifactModal.FailedToPullVersions`))},onError:e=>{l.error(e.message??c(`comp:BAIImportArtifactModal.FailedToPullVersions`))}})},onCancel:e=>{i(e)},okText:c(`comp:BAIImportArtifactModal.Pull`),cancelText:c(`general.button.Cancel`),okButtonProps:{loading:g,disabled:g||n(_)},...s,children:(0,D.jsxs)(m,{direction:`column`,gap:`md`,align:`stretch`,children:[_.length!==p.length&&(0,D.jsx)(re,{icon:(0,D.jsx)(fe,{title:c(`comp:BAIImportArtifactModal.OnlySCANNEDVersionsCanBePulled`),iconProps:{style:{color:u(`--color-info`)}},style:{marginRight:u(`--spacing-2`)}}),showIcon:!0,title:c(`comp:BAIImportArtifactModal.ExcludedVersions`,{count:p.length-_.length})}),f&&(0,D.jsx)(ge,{artifactFrgmt:f}),(0,D.jsx)(me,{columns:ie(v),dataSource:oe(_),pagination:{showSizeChanger:!1}})]})})})}})))()}var A;function j(){return(j=e((()=>{A=(function(){var e={kind:`Literal`,name:`offset`,value:0},t=[{kind:`Literal`,name:`first`,value:1},e],n=[{kind:`Literal`,name:`first`,value:10},e],r={alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},i={alias:null,args:null,kind:`ScalarField`,name:`name`,storageKey:null};return{fragment:{argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAIImportArtifactModalStoriesQuery`,selections:[{alias:null,args:t,concreteType:`ArtifactConnection`,kind:`LinkedField`,name:`artifacts`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`Artifact`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{args:null,kind:`FragmentSpread`,name:`BAIImportArtifactModalArtifactFragment`}],storageKey:null}],storageKey:null}],storageKey:`artifacts(first:1,offset:0)`},{alias:null,args:n,concreteType:`ArtifactRevisionConnection`,kind:`LinkedField`,name:`artifactRevisions`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactRevisionEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{args:null,kind:`FragmentSpread`,name:`BAIImportArtifactModalArtifactRevisionFragment`}],storageKey:null}],storageKey:null}],storageKey:`artifactRevisions(first:10,offset:0)`}],type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[],kind:`Operation`,name:`BAIImportArtifactModalStoriesQuery`,selections:[{alias:null,args:t,concreteType:`ArtifactConnection`,kind:`LinkedField`,name:`artifacts`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`Artifact`,kind:`LinkedField`,name:`node`,plural:!1,selections:[r,{alias:null,args:null,kind:`ScalarField`,name:`entityId`,storageKey:null},i,{alias:null,args:null,kind:`ScalarField`,name:`description`,storageKey:null},{alias:null,args:null,concreteType:`SourceInfo`,kind:`LinkedField`,name:`source`,plural:!1,selections:[i,{alias:null,args:null,kind:`ScalarField`,name:`url`,storageKey:null}],storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`type`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:`artifacts(first:1,offset:0)`},{alias:null,args:n,concreteType:`ArtifactRevisionConnection`,kind:`LinkedField`,name:`artifactRevisions`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactRevisionEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`node`,plural:!1,selections:[r,{alias:null,args:null,kind:`ScalarField`,name:`fieldId`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`version`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`size`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`status`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:`artifactRevisions(first:10,offset:0)`}]},params:{cacheID:`e2b3f70afea0f5dae44f15a93d48db98`,id:null,metadata:{},name:`BAIImportArtifactModalStoriesQuery`,operationKind:`query`,text:`query BAIImportArtifactModalStoriesQuery {
  artifacts(offset: 0, first: 1) {
    edges {
      node {
        ...BAIImportArtifactModalArtifactFragment
        id
      }
    }
  }
  artifactRevisions(offset: 0, first: 10) {
    edges {
      node {
        ...BAIImportArtifactModalArtifactRevisionFragment
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

fragment BAIImportArtifactModalArtifactFragment on Artifact {
  id
  entityId
  name
  ...BAIArtifactDescriptionsFragment
}

fragment BAIImportArtifactModalArtifactRevisionFragment on ArtifactRevision {
  id
  fieldId
  version
  size
  status
}
`}}})(),A.hash=`394fcfbbf5961a2e6360c1529efe1be7`})))()}var M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q,ve;function $(){return($=e((()=>{j(),_e(),se(),p(),k(),M=t(),N=h(),_(),P=i(),q={title:`Fragments/BAIImportArtifactModal`,component:O,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`
**BAIImportArtifactModal** is a modal for importing (pulling) artifact revisions with table view and filtering.

## BAI-Specific Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`selectedArtifactFrgmt\` | \`BAIImportArtifactModalArtifactFragment$key \\| null\` | - | GraphQL fragment reference for artifact data |
| \`selectedArtifactRevisionFrgmt\` | \`BAIImportArtifactModalArtifactRevisionFragment$key\` | - | GraphQL fragment reference for artifact revisions (required) |
| \`onOk\` | \`(e: React.MouseEvent, tasks: Array) => void\` | - | Called after successful mutation with task information |
| \`onCancel\` | \`(e: React.MouseEvent) => void\` | - | Called when modal is cancelled |
| \`connectionIds\` | \`string[]\` | - | Optional Relay connection IDs for cache updates |

## Features
- **Revision Table**: Shows version and size columns for selected revisions
- **Status Filtering**: Only SCANNED status revisions can be imported
- **Exclusion Alert**: Displays alert when some revisions are excluded from import
- **Artifact Info**: Shows artifact description (name, type, architecture)
- **Mutation Integration**: Uses \`importArtifacts\` mutation
- **Success/Error Handling**: Displays success/error messages via Ant Design message component
- **Loading State**: Pull button shows loading state during mutation execution
- **Smart Disabling**: Button disabled when no importable revisions or during execution
- **Task Tracking**: Returns task information in onOk callback for progress tracking

## Usage Pattern
The modal is typically used with artifact revision selection:
1. User selects one or more artifact revisions
2. Clicks "Pull" button
3. Modal shows table of selected revisions with artifact info
4. Revisions without SCANNED status are filtered out with alert
5. On Pull, mutation executes and modal closes on success with task info

For other props, refer to [Ant Design Modal](https://ant.design/components/modal).

## Storybook
Mutation is mocked and will execute successfully, closing the modal on completion.
        `}}},argTypes:{selectedArtifactFrgmt:{control:!1,description:`GraphQL fragment reference for artifact data (can be null)`,table:{type:{summary:`BAIImportArtifactModalArtifactFragment$key | null`}}},selectedArtifactRevisionFrgmt:{control:!1,description:`GraphQL fragment reference for artifact revisions`,table:{type:{summary:`BAIImportArtifactModalArtifactRevisionFragment$key`}}},open:{control:!1,description:`Whether the modal is visible (managed by parent component)`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},onOk:{control:!1,description:`Called after successful mutation completion with task information`,table:{type:{summary:`(e: React.MouseEvent, tasks: { taskId: string; version: string; artifact: { id: string; name: string } }[]) => void`}}},onCancel:{control:!1,description:`Called when modal is cancelled`,table:{type:{summary:`(e: React.MouseEvent) => void`}}},connectionIds:{control:!1,description:`Optional Relay connection IDs for cache updates`,table:{type:{summary:`string[]`}}}},decorators:[e=>(0,P.jsx)(v,{children:(0,P.jsx)(e,{})})]},J=()=>{var e,t;let[n,r]=(0,M.useState)(!1),{artifacts:i,artifactRevisions:a}=(0,N.useLazyLoadQuery)(A,{}),o=i==null||(e=i.edges)==null||(e=e[0])==null?void 0:e.node,s=a==null||(t=a.edges)==null?void 0:t.map(e=>e.node);return s&&s.length>0&&(0,P.jsxs)(m,{direction:`column`,gap:`md`,children:[(0,P.jsx)(ce,{onClick:()=>r(!0),children:`Open Modal`}),(0,P.jsx)(O,{selectedArtifactFrgmt:o??null,selectedArtifactRevisionFrgmt:s,open:n,onOk:()=>{r(!1)},onCancel:()=>r(!1)})]})},Y={name:`Basic`,parameters:{docs:{description:{story:`Import multiple artifact revisions with SCANNED status. The modal displays a table with version and size columns.`}}},render:()=>(0,P.jsx)(y,{mockResolvers:{Artifact:()=>({id:`QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==`,name:`pytorch-model`,type:`model`,architecture:`x86_64`,description:`PyTorch deep learning model`,source:{name:`HuggingFace Hub`,url:`https://huggingface.co/pytorch/model`}}),ArtifactRevisionConnection:()=>({edges:[{node:{id:`QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMQ==`,version:`v1.0.0`,size:`2147483648`,status:`SCANNED`}},{node:{id:`QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMg==`,version:`v1.1.0`,size:`3221225472`,status:`SCANNED`}},{node:{id:`QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMw==`,version:`v2.0.0`,size:`4294967296`,status:`SCANNED`}}]}),ImportArtifactsPayload:()=>({tasks:[{taskId:`task-1`,artifactRevision:{version:`v1.0.0`}}]})},children:(0,P.jsx)(J,{})})},X={name:`WithExcludedRevisions`,parameters:{docs:{description:{story:`Some revisions are excluded from import because they are not in SCANNED status. An alert shows how many are excluded.`}}},render:()=>(0,P.jsx)(y,{mockResolvers:{Artifact:()=>({id:`QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==`,name:`tensorflow-dataset`,type:`dataset`,architecture:`noarch`,description:`TensorFlow training dataset`,source:{name:`Google Cloud Storage`,url:`https://storage.googleapis.com/datasets/tf`}}),ArtifactRevisionConnection:()=>({edges:[{node:{id:`QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMQ==`,version:`v1.0.0`,size:`1073741824`,status:`SCANNED`}},{node:{id:`QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMg==`,version:`v1.1.0`,size:`2147483648`,status:`PULLING`}},{node:{id:`QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMw==`,version:`v2.0.0`,size:`3221225472`,status:`READY`}},{node:{id:`QXJ0aWZhY3RSZXZpc2lvbjpyZXYtNA==`,version:`v2.1.0`,size:`4294967296`,status:`SCANNED`}}]}),ImportArtifactsPayload:()=>({tasks:[{taskId:`task-1`,artifactRevision:{version:`v1.0.0`}}]})},children:(0,P.jsx)(J,{})})},Z={name:`SingleRevision`,parameters:{docs:{description:{story:`Import a single artifact revision.`}}},render:()=>(0,P.jsx)(y,{mockResolvers:{Artifact:()=>({id:`QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==`,name:`llm-weights`,type:`model`,architecture:`x86_64`,description:`Large language model weights`,source:{name:`HuggingFace`,url:`https://huggingface.co/llm/weights`}}),ArtifactRevisionConnection:()=>({edges:[{node:{id:`QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMQ==`,version:`latest`,size:`10737418240`,status:`SCANNED`}}]}),ImportArtifactsPayload:()=>({tasks:[{taskId:`task-1`,artifactRevision:{version:`latest`}}]})},children:(0,P.jsx)(J,{})})},Q={name:`AllExcluded`,parameters:{docs:{description:{story:`All revisions are not in SCANNED status, so the Pull button is disabled.`}}},render:()=>(0,P.jsx)(y,{mockResolvers:{Artifact:()=>({id:`QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==`,name:`processing-artifact`,type:`model`,architecture:`aarch64`,description:`Artifact currently being processed`,source:{name:`Internal Registry`,url:`https://registry.internal/artifacts`}}),ArtifactRevisionConnection:()=>({edges:[{node:{id:`QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMQ==`,version:`v1.0.0`,size:`1073741824`,status:`PULLING`}},{node:{id:`QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMg==`,version:`v2.0.0`,size:`2147483648`,status:`READY`}}]}),ImportArtifactsPayload:()=>({tasks:[]})},children:(0,P.jsx)(J,{})})},Y.parameters={...Y.parameters,docs:{...(F=Y.parameters)==null?void 0:F.docs,source:{originalSource:`{
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'Import multiple artifact revisions with SCANNED status. The modal displays a table with version and size columns.'
      }
    }
  },
  render: () => <RelayResolver mockResolvers={{
    Artifact: () => ({
      id: 'QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==',
      name: 'pytorch-model',
      type: 'model',
      architecture: 'x86_64',
      description: 'PyTorch deep learning model',
      source: {
        name: 'HuggingFace Hub',
        url: 'https://huggingface.co/pytorch/model'
      }
    }),
    ArtifactRevisionConnection: () => ({
      edges: [{
        node: {
          id: 'QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMQ==',
          version: 'v1.0.0',
          size: '2147483648',
          // 2GB
          status: 'SCANNED'
        }
      }, {
        node: {
          id: 'QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMg==',
          version: 'v1.1.0',
          size: '3221225472',
          // 3GB
          status: 'SCANNED'
        }
      }, {
        node: {
          id: 'QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMw==',
          version: 'v2.0.0',
          size: '4294967296',
          // 4GB
          status: 'SCANNED'
        }
      }]
    }),
    ImportArtifactsPayload: () => ({
      tasks: [{
        taskId: 'task-1',
        artifactRevision: {
          version: 'v1.0.0'
        }
      }]
    })
  }}>
      <QueryResolver />
    </RelayResolver>
}`,...(I=Y.parameters)==null||(I=I.docs)==null?void 0:I.source},description:{story:`Multiple SCANNED revisions ready to be pulled`,...(L=Y.parameters)==null||(L=L.docs)==null?void 0:L.description}}},X.parameters={...X.parameters,docs:{...(R=X.parameters)==null?void 0:R.docs,source:{originalSource:`{
  name: 'WithExcludedRevisions',
  parameters: {
    docs: {
      description: {
        story: 'Some revisions are excluded from import because they are not in SCANNED status. An alert shows how many are excluded.'
      }
    }
  },
  render: () => <RelayResolver mockResolvers={{
    Artifact: () => ({
      id: 'QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==',
      name: 'tensorflow-dataset',
      type: 'dataset',
      architecture: 'noarch',
      description: 'TensorFlow training dataset',
      source: {
        name: 'Google Cloud Storage',
        url: 'https://storage.googleapis.com/datasets/tf'
      }
    }),
    ArtifactRevisionConnection: () => ({
      edges: [{
        node: {
          id: 'QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMQ==',
          version: 'v1.0.0',
          size: '1073741824',
          status: 'SCANNED'
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
          status: 'READY' // Will be excluded
        }
      }, {
        node: {
          id: 'QXJ0aWZhY3RSZXZpc2lvbjpyZXYtNA==',
          version: 'v2.1.0',
          size: '4294967296',
          status: 'SCANNED'
        }
      }]
    }),
    ImportArtifactsPayload: () => ({
      tasks: [{
        taskId: 'task-1',
        artifactRevision: {
          version: 'v1.0.0'
        }
      }]
    })
  }}>
      <QueryResolver />
    </RelayResolver>
}`,...(z=X.parameters)==null||(z=z.docs)==null?void 0:z.source},description:{story:`With excluded revisions (non-SCANNED status)`,...(B=X.parameters)==null||(B=B.docs)==null?void 0:B.description}}},Z.parameters={...Z.parameters,docs:{...(V=Z.parameters)==null?void 0:V.docs,source:{originalSource:`{
  name: 'SingleRevision',
  parameters: {
    docs: {
      description: {
        story: 'Import a single artifact revision.'
      }
    }
  },
  render: () => <RelayResolver mockResolvers={{
    Artifact: () => ({
      id: 'QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==',
      name: 'llm-weights',
      type: 'model',
      architecture: 'x86_64',
      description: 'Large language model weights',
      source: {
        name: 'HuggingFace',
        url: 'https://huggingface.co/llm/weights'
      }
    }),
    ArtifactRevisionConnection: () => ({
      edges: [{
        node: {
          id: 'QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMQ==',
          version: 'latest',
          size: '10737418240',
          // 10GB
          status: 'SCANNED'
        }
      }]
    }),
    ImportArtifactsPayload: () => ({
      tasks: [{
        taskId: 'task-1',
        artifactRevision: {
          version: 'latest'
        }
      }]
    })
  }}>
      <QueryResolver />
    </RelayResolver>
}`,...(H=Z.parameters)==null||(H=H.docs)==null?void 0:H.source},description:{story:`Single revision import`,...(U=Z.parameters)==null||(U=U.docs)==null?void 0:U.description}}},Q.parameters={...Q.parameters,docs:{...(W=Q.parameters)==null?void 0:W.docs,source:{originalSource:`{
  name: 'AllExcluded',
  parameters: {
    docs: {
      description: {
        story: 'All revisions are not in SCANNED status, so the Pull button is disabled.'
      }
    }
  },
  render: () => <RelayResolver mockResolvers={{
    Artifact: () => ({
      id: 'QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==',
      name: 'processing-artifact',
      type: 'model',
      architecture: 'aarch64',
      description: 'Artifact currently being processed',
      source: {
        name: 'Internal Registry',
        url: 'https://registry.internal/artifacts'
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
          status: 'READY'
        }
      }]
    }),
    ImportArtifactsPayload: () => ({
      tasks: []
    })
  }}>
      <QueryResolver />
    </RelayResolver>
}`,...(G=Q.parameters)==null||(G=G.docs)==null?void 0:G.source},description:{story:`All revisions excluded (no pullable revisions)`,...(K=Q.parameters)==null||(K=K.docs)==null?void 0:K.description}}},ve=[`Default`,`WithExcludedRevisions`,`SingleRevision`,`AllExcluded`]})))()}$();export{Q as AllExcluded,Y as Default,Z as SingleRevision,X as WithExcludedRevisions,ve as __namedExportsOrder,q as default};