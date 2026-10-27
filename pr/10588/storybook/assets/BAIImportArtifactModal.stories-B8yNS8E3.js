import{n as e}from"./rolldown-runtime-2s6bX4vc.js";import{n as t,t as n}from"./isEmpty-C3CFE_pY.js";import{n as r,t as i}from"./useBAIi18n-BoXCk5K0.js";import{n as a,t as o}from"./BAIModal-DjFLUMha.js";import{c as s,d as c,s as l,u}from"./iframe-DR2sIF5r.js";import{n as d,t as ee}from"./BAIAlert-BINqT0IN.js";import{n as f,t as p}from"./BAIFlex-CAz1t6J5.js";import{c as m,o as h,r as g,s as _}from"./helper-DV0q0X9R.js";import{n as v,t as y}from"./BAIButton-C-o5ANgR.js";import{n as b,t as x}from"./BAIUnmountAfterClose-wB0Iuoj_.js";import{n as S,t as te}from"./BAIQuestionIconWithTooltip-W14m4lZB.js";import{n as C,t as ne}from"./BAITable-BlL2P1wn.js";import{n as w,t as T}from"./BAIArtifactDescriptions-BtI-sKL1.js";import{n as E,t as D}from"./RelayResolver-b1nJU57O.js";import{useState as O}from"react";import{jsx as k,jsxs as A}from"react/jsx-runtime";import{useTheme as j}from"@lablup/ui-common/theme";import{useFragment as M,useLazyLoadQuery as N,useMutation as P}from"react-relay";import{MemoryRouter as F}from"react-router-dom";var I;function L(){return(L=e((()=>{I={argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAIImportArtifactModalArtifactFragment`,selections:[{kind:`RequiredField`,field:{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},action:`THROW`},{alias:null,args:null,kind:`ScalarField`,name:`entityId`,storageKey:null},{kind:`RequiredField`,field:{alias:null,args:null,kind:`ScalarField`,name:`name`,storageKey:null},action:`THROW`},{args:null,kind:`FragmentSpread`,name:`BAIArtifactDescriptionsFragment`}],type:`Artifact`,abstractKey:null},I.hash=`0acb4346670ccea65e9b31dd5d1dde6b`})))()}var R;function z(){return(z=e((()=>{R={argumentDefinitions:[],kind:`Fragment`,metadata:{plural:!0},name:`BAIImportArtifactModalArtifactRevisionFragment`,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`fieldId`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`version`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`size`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`status`,storageKey:null}],type:`ArtifactRevision`,abstractKey:null},R.hash=`ffe03fd9195e02d00eac623a59a5915e`})))()}var B;function V(){return(V=e((()=>{B=(function(){var e={defaultValue:null,kind:`LocalArgument`,name:`connectionIds`},t={defaultValue:null,kind:`LocalArgument`,name:`input`},n=[{kind:`Variable`,name:`input`,variableName:`input`}],r={alias:null,args:null,kind:`ScalarField`,name:`taskId`,storageKey:null},i={alias:null,args:null,kind:`ScalarField`,name:`version`,storageKey:null},a={alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},o={alias:null,args:null,concreteType:`ArtifactRevisionEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`node`,plural:!1,selections:[a,{alias:null,args:null,kind:`ScalarField`,name:`status`,storageKey:null}],storageKey:null}],storageKey:null};return{fragment:{argumentDefinitions:[e,t],kind:`Fragment`,metadata:null,name:`BAIImportArtifactModalImportArtifactsMutation`,selections:[{alias:null,args:n,concreteType:`ImportArtifactsPayload`,kind:`LinkedField`,name:`importArtifacts`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactRevisionImportTask`,kind:`LinkedField`,name:`tasks`,plural:!0,selections:[r,{alias:null,args:null,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`artifactRevision`,plural:!1,selections:[i],storageKey:null}],storageKey:null},{alias:null,args:null,concreteType:`ArtifactRevisionConnection`,kind:`LinkedField`,name:`artifactRevisions`,plural:!1,selections:[o],storageKey:null}],storageKey:null}],type:`Mutation`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[t,e],kind:`Operation`,name:`BAIImportArtifactModalImportArtifactsMutation`,selections:[{alias:null,args:n,concreteType:`ImportArtifactsPayload`,kind:`LinkedField`,name:`importArtifacts`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactRevisionImportTask`,kind:`LinkedField`,name:`tasks`,plural:!0,selections:[r,{alias:null,args:null,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`artifactRevision`,plural:!1,selections:[i,a],storageKey:null}],storageKey:null},{alias:null,args:null,concreteType:`ArtifactRevisionConnection`,kind:`LinkedField`,name:`artifactRevisions`,plural:!1,selections:[o,{alias:null,args:null,filters:null,handle:`appendEdge`,key:``,kind:`LinkedHandle`,name:`edges`,handleArgs:[{kind:`Variable`,name:`connections`,variableName:`connectionIds`}]}],storageKey:null}],storageKey:null}]},params:{cacheID:`7ff02c568f1c337b76719e22a948ac6b`,id:null,metadata:{},name:`BAIImportArtifactModalImportArtifactsMutation`,operationKind:`mutation`,text:`mutation BAIImportArtifactModalImportArtifactsMutation(
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
`}}})(),B.hash=`7918fb18108ff64999034b77bf975aa9`})))()}var H;function U(){return(U=e((()=>{L(),z(),V(),c(),m(),i(),d(),f(),a(),S(),s(),b(),C(),w(),n(),H=({selectedArtifactFrgmt:e,selectedArtifactRevisionFrgmt:n,onOk:i,onCancel:a,connectionIds:s,...c})=>{let{t:d}=r(),{message:f}=u.useApp(),{token:m}=j(),v=M(I,e),y=M(R,n),[b,S]=P(B),C=y.filter(e=>e.status===`SCANNED`),w=[{title:d(`comp:BAIImportArtifactModal.Version`),dataIndex:`version`,key:`version`,render:e=>k(l,{monospace:!0,children:e}),width:`50%`},{title:d(`comp:BAIImportArtifactModal.Size`),dataIndex:`size`,key:`size`,render:e=>k(l,{monospace:!0,children:e?g(e,`auto`)?.displayValue:`N/A`})}];return k(x,{children:k(o,{title:d(`comp:BAIImportArtifactModal.PullVersion`),centered:!0,onOk:e=>{b({variables:{input:{artifactRevisionIds:C.map(e=>e.fieldId)},connectionIds:s??[]},onCompleted:(t,n)=>{if(n&&n.length>0){n.forEach(e=>f.error(e.message??d(`comp:BAIImportArtifactModal.FailedToPullVersions`)));return}let r=t.importArtifacts;r?(f.success(d(`comp:BAIImportArtifactModal.SuccessFullyPulled`,{count:r.artifactRevisions.edges.length})),i(e,r.tasks.filter(e=>e.taskId!=null).map(e=>({taskId:e.taskId,version:e.artifactRevision.version,artifact:{id:v?.entityId??``,name:v?.name??``}})))):f.error(d(`comp:BAIImportArtifactModal.FailedToPullVersions`))},onError:e=>{f.error(e.message??d(`comp:BAIImportArtifactModal.FailedToPullVersions`))}})},onCancel:e=>{a(e)},okText:d(`comp:BAIImportArtifactModal.Pull`),cancelText:d(`general.button.Cancel`),okButtonProps:{loading:S,disabled:S||t(C)},...c,children:A(p,{direction:`column`,gap:`md`,align:`stretch`,children:[C.length!==y.length&&k(ee,{icon:k(te,{title:d(`comp:BAIImportArtifactModal.OnlySCANNEDVersionsCanBePulled`),iconProps:{style:{color:m(`--color-info`)}},style:{marginRight:m(`--spacing-2`)}}),showIcon:!0,title:d(`comp:BAIImportArtifactModal.ExcludedVersions`,{count:y.length-C.length})}),v&&k(T,{artifactFrgmt:v}),k(ne,{columns:h(w),dataSource:_(C),pagination:{showSizeChanger:!1}})]})})})}})))()}var W;function G(){return(G=e((()=>{W=(function(){var e={kind:`Literal`,name:`offset`,value:0},t=[{kind:`Literal`,name:`first`,value:1},e],n=[{kind:`Literal`,name:`first`,value:10},e],r={alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},i={alias:null,args:null,kind:`ScalarField`,name:`name`,storageKey:null};return{fragment:{argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAIImportArtifactModalStoriesQuery`,selections:[{alias:null,args:t,concreteType:`ArtifactConnection`,kind:`LinkedField`,name:`artifacts`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`Artifact`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{args:null,kind:`FragmentSpread`,name:`BAIImportArtifactModalArtifactFragment`}],storageKey:null}],storageKey:null}],storageKey:`artifacts(first:1,offset:0)`},{alias:null,args:n,concreteType:`ArtifactRevisionConnection`,kind:`LinkedField`,name:`artifactRevisions`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactRevisionEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{args:null,kind:`FragmentSpread`,name:`BAIImportArtifactModalArtifactRevisionFragment`}],storageKey:null}],storageKey:null}],storageKey:`artifactRevisions(first:10,offset:0)`}],type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[],kind:`Operation`,name:`BAIImportArtifactModalStoriesQuery`,selections:[{alias:null,args:t,concreteType:`ArtifactConnection`,kind:`LinkedField`,name:`artifacts`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`Artifact`,kind:`LinkedField`,name:`node`,plural:!1,selections:[r,{alias:null,args:null,kind:`ScalarField`,name:`entityId`,storageKey:null},i,{alias:null,args:null,kind:`ScalarField`,name:`description`,storageKey:null},{alias:null,args:null,concreteType:`SourceInfo`,kind:`LinkedField`,name:`source`,plural:!1,selections:[i,{alias:null,args:null,kind:`ScalarField`,name:`url`,storageKey:null}],storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`type`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:`artifacts(first:1,offset:0)`},{alias:null,args:n,concreteType:`ArtifactRevisionConnection`,kind:`LinkedField`,name:`artifactRevisions`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactRevisionEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`node`,plural:!1,selections:[r,{alias:null,args:null,kind:`ScalarField`,name:`fieldId`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`version`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`size`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`status`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:`artifactRevisions(first:10,offset:0)`}]},params:{cacheID:`e2b3f70afea0f5dae44f15a93d48db98`,id:null,metadata:{},name:`BAIImportArtifactModalStoriesQuery`,operationKind:`query`,text:`query BAIImportArtifactModalStoriesQuery {
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
`}}})(),W.hash=`394fcfbbf5961a2e6360c1529efe1be7`})))()}var K,q,J,Y,X,Z,Q;function $(){return($=e((()=>{G(),E(),v(),f(),U(),K={title:`Fragments/BAIImportArtifactModal`,component:H,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`
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
        `}}},argTypes:{selectedArtifactFrgmt:{control:!1,description:`GraphQL fragment reference for artifact data (can be null)`,table:{type:{summary:`BAIImportArtifactModalArtifactFragment$key | null`}}},selectedArtifactRevisionFrgmt:{control:!1,description:`GraphQL fragment reference for artifact revisions`,table:{type:{summary:`BAIImportArtifactModalArtifactRevisionFragment$key`}}},open:{control:!1,description:`Whether the modal is visible (managed by parent component)`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},onOk:{control:!1,description:`Called after successful mutation completion with task information`,table:{type:{summary:`(e: React.MouseEvent, tasks: { taskId: string; version: string; artifact: { id: string; name: string } }[]) => void`}}},onCancel:{control:!1,description:`Called when modal is cancelled`,table:{type:{summary:`(e: React.MouseEvent) => void`}}},connectionIds:{control:!1,description:`Optional Relay connection IDs for cache updates`,table:{type:{summary:`string[]`}}}},decorators:[e=>k(F,{children:k(e,{})})]},q=()=>{let[e,t]=O(!1),{artifacts:n,artifactRevisions:r}=N(W,{}),i=n?.edges?.[0]?.node,a=r?.edges?.map(e=>e.node);return a&&a.length>0&&A(p,{direction:`column`,gap:`md`,children:[k(y,{onClick:()=>t(!0),children:`Open Modal`}),k(H,{selectedArtifactFrgmt:i??null,selectedArtifactRevisionFrgmt:a,open:e,onOk:()=>{t(!1)},onCancel:()=>t(!1)})]})},J={name:`Basic`,parameters:{docs:{description:{story:`Import multiple artifact revisions with SCANNED status. The modal displays a table with version and size columns.`}}},render:()=>k(D,{mockResolvers:{Artifact:()=>({id:`QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==`,name:`pytorch-model`,type:`model`,architecture:`x86_64`,description:`PyTorch deep learning model`,source:{name:`HuggingFace Hub`,url:`https://huggingface.co/pytorch/model`}}),ArtifactRevisionConnection:()=>({edges:[{node:{id:`QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMQ==`,version:`v1.0.0`,size:`2147483648`,status:`SCANNED`}},{node:{id:`QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMg==`,version:`v1.1.0`,size:`3221225472`,status:`SCANNED`}},{node:{id:`QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMw==`,version:`v2.0.0`,size:`4294967296`,status:`SCANNED`}}]}),ImportArtifactsPayload:()=>({tasks:[{taskId:`task-1`,artifactRevision:{version:`v1.0.0`}}]})},children:k(q,{})})},Y={name:`WithExcludedRevisions`,parameters:{docs:{description:{story:`Some revisions are excluded from import because they are not in SCANNED status. An alert shows how many are excluded.`}}},render:()=>k(D,{mockResolvers:{Artifact:()=>({id:`QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==`,name:`tensorflow-dataset`,type:`dataset`,architecture:`noarch`,description:`TensorFlow training dataset`,source:{name:`Google Cloud Storage`,url:`https://storage.googleapis.com/datasets/tf`}}),ArtifactRevisionConnection:()=>({edges:[{node:{id:`QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMQ==`,version:`v1.0.0`,size:`1073741824`,status:`SCANNED`}},{node:{id:`QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMg==`,version:`v1.1.0`,size:`2147483648`,status:`PULLING`}},{node:{id:`QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMw==`,version:`v2.0.0`,size:`3221225472`,status:`READY`}},{node:{id:`QXJ0aWZhY3RSZXZpc2lvbjpyZXYtNA==`,version:`v2.1.0`,size:`4294967296`,status:`SCANNED`}}]}),ImportArtifactsPayload:()=>({tasks:[{taskId:`task-1`,artifactRevision:{version:`v1.0.0`}}]})},children:k(q,{})})},X={name:`SingleRevision`,parameters:{docs:{description:{story:`Import a single artifact revision.`}}},render:()=>k(D,{mockResolvers:{Artifact:()=>({id:`QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==`,name:`llm-weights`,type:`model`,architecture:`x86_64`,description:`Large language model weights`,source:{name:`HuggingFace`,url:`https://huggingface.co/llm/weights`}}),ArtifactRevisionConnection:()=>({edges:[{node:{id:`QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMQ==`,version:`latest`,size:`10737418240`,status:`SCANNED`}}]}),ImportArtifactsPayload:()=>({tasks:[{taskId:`task-1`,artifactRevision:{version:`latest`}}]})},children:k(q,{})})},Z={name:`AllExcluded`,parameters:{docs:{description:{story:`All revisions are not in SCANNED status, so the Pull button is disabled.`}}},render:()=>k(D,{mockResolvers:{Artifact:()=>({id:`QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==`,name:`processing-artifact`,type:`model`,architecture:`aarch64`,description:`Artifact currently being processed`,source:{name:`Internal Registry`,url:`https://registry.internal/artifacts`}}),ArtifactRevisionConnection:()=>({edges:[{node:{id:`QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMQ==`,version:`v1.0.0`,size:`1073741824`,status:`PULLING`}},{node:{id:`QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMg==`,version:`v2.0.0`,size:`2147483648`,status:`READY`}}]}),ImportArtifactsPayload:()=>({tasks:[]})},children:k(q,{})})},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
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
}`,...J.parameters?.docs?.source},description:{story:`Multiple SCANNED revisions ready to be pulled`,...J.parameters?.docs?.description}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
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
}`,...Y.parameters?.docs?.source},description:{story:`With excluded revisions (non-SCANNED status)`,...Y.parameters?.docs?.description}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
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
}`,...X.parameters?.docs?.source},description:{story:`Single revision import`,...X.parameters?.docs?.description}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
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
}`,...Z.parameters?.docs?.source},description:{story:`All revisions excluded (no pullable revisions)`,...Z.parameters?.docs?.description}}},Q=[`Default`,`WithExcludedRevisions`,`SingleRevision`,`AllExcluded`]})))()}$();export{Z as AllExcluded,J as Default,X as SingleRevision,Y as WithExcludedRevisions,Q as __namedExportsOrder,K as default};