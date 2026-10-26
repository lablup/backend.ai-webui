import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-D0Ex1IVc.js";import{n,t as r}from"./isEmpty-SRC6Jtfi.js";import{t as i}from"./jsx-runtime-MKhVqBIO.js";import{n as a,t as o}from"./useBAIi18n-Biey1teG.js";import{n as s,r as c}from"./useTheme-Br6nszEH.js";import{n as l,t as ee}from"./BAIModal-C5hesmkh.js";import{b as u,h as d,m as f,y as te}from"./iframe-DHcqzLLD.js";import{n as p,t as ne}from"./BAIAlert-DjqA4pRR.js";import{n as m,t as h}from"./BAIFlex-BOFoS5KY.js";import{t as g}from"./react-relay-sBALIJlt.js";import{c as _,h as v,o as re,r as y,s as b}from"./helper-CVvTx27U.js";import{n as x,r as S}from"./dist-BWBbun8L.js";import{n as ie,t as ae}from"./BAIButton-BkLrwIfz.js";import{n as oe,t as se}from"./BAIUnmountAfterClose-BLNmR2Ks.js";import{n as C,t as w}from"./BAIQuestionIconWithTooltip-Cd1Zvmh3.js";import{n as T,t as E}from"./BAITable-BK-ci4bB.js";import{n as D,t as O}from"./BAIArtifactDescriptions-C_rJQBir.js";import{n as k,t as A}from"./RelayResolver-CMrgwoPg.js";var j;function M(){return(M=e((()=>{j={argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAIImportArtifactModalArtifactFragment`,selections:[{kind:`RequiredField`,field:{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},action:`THROW`},{kind:`RequiredField`,field:{alias:null,args:null,kind:`ScalarField`,name:`name`,storageKey:null},action:`THROW`},{args:null,kind:`FragmentSpread`,name:`BAIArtifactDescriptionsFragment`}],type:`Artifact`,abstractKey:null},j.hash=`20983eccde7bea0a9ca172aa30beca15`})))()}var N;function P(){return(P=e((()=>{N={argumentDefinitions:[],kind:`Fragment`,metadata:{plural:!0},name:`BAIImportArtifactModalArtifactRevisionFragment`,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`version`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`size`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`status`,storageKey:null}],type:`ArtifactRevision`,abstractKey:null},N.hash=`be471319e927479366f2951cd59d48f3`})))()}var F;function I(){return(I=e((()=>{F=(function(){var e={defaultValue:null,kind:`LocalArgument`,name:`connectionIds`},t={defaultValue:null,kind:`LocalArgument`,name:`input`},n=[{kind:`Variable`,name:`input`,variableName:`input`}],r={alias:null,args:null,kind:`ScalarField`,name:`taskId`,storageKey:null},i={alias:null,args:null,kind:`ScalarField`,name:`version`,storageKey:null},a={alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},o={alias:null,args:null,concreteType:`ArtifactRevisionEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`node`,plural:!1,selections:[a,{alias:null,args:null,kind:`ScalarField`,name:`status`,storageKey:null}],storageKey:null}],storageKey:null};return{fragment:{argumentDefinitions:[e,t],kind:`Fragment`,metadata:null,name:`BAIImportArtifactModalImportArtifactsMutation`,selections:[{alias:null,args:n,concreteType:`ImportArtifactsPayload`,kind:`LinkedField`,name:`importArtifacts`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactRevisionImportTask`,kind:`LinkedField`,name:`tasks`,plural:!0,selections:[r,{alias:null,args:null,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`artifactRevision`,plural:!1,selections:[i],storageKey:null}],storageKey:null},{alias:null,args:null,concreteType:`ArtifactRevisionConnection`,kind:`LinkedField`,name:`artifactRevisions`,plural:!1,selections:[o],storageKey:null}],storageKey:null}],type:`Mutation`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[t,e],kind:`Operation`,name:`BAIImportArtifactModalImportArtifactsMutation`,selections:[{alias:null,args:n,concreteType:`ImportArtifactsPayload`,kind:`LinkedField`,name:`importArtifacts`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactRevisionImportTask`,kind:`LinkedField`,name:`tasks`,plural:!0,selections:[r,{alias:null,args:null,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`artifactRevision`,plural:!1,selections:[i,a],storageKey:null}],storageKey:null},{alias:null,args:null,concreteType:`ArtifactRevisionConnection`,kind:`LinkedField`,name:`artifactRevisions`,plural:!1,selections:[o,{alias:null,args:null,filters:null,handle:`appendEdge`,key:``,kind:`LinkedHandle`,name:`edges`,handleArgs:[{kind:`Variable`,name:`connections`,variableName:`connectionIds`}]}],storageKey:null}],storageKey:null}]},params:{cacheID:`7ff02c568f1c337b76719e22a948ac6b`,id:null,metadata:{},name:`BAIImportArtifactModalImportArtifactsMutation`,operationKind:`mutation`,text:`mutation BAIImportArtifactModalImportArtifactsMutation(
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
`}}})(),F.hash=`7918fb18108ff64999034b77bf975aa9`})))()}var L,R,z;function B(){return(B=e((()=>{M(),P(),I(),u(),_(),o(),p(),m(),l(),C(),d(),oe(),T(),D(),s(),r(),L=g(),R=i(),z=({selectedArtifactFrgmt:e,selectedArtifactRevisionFrgmt:t,onOk:r,onCancel:i,connectionIds:o,...s})=>{let{t:l}=a(),{message:u}=te.useApp(),{token:d}=c(),p=(0,L.useFragment)(j,e),m=(0,L.useFragment)(N,t),[g,_]=(0,L.useMutation)(F),x=m.filter(e=>e.status===`SCANNED`),S=[{title:l(`comp:BAIImportArtifactModal.Version`),dataIndex:`version`,key:`version`,render:e=>(0,R.jsx)(f,{monospace:!0,children:e}),width:`50%`},{title:l(`comp:BAIImportArtifactModal.Size`),dataIndex:`size`,key:`size`,render:e=>(0,R.jsx)(f,{monospace:!0,children:e?y(e,`auto`)?.displayValue:`N/A`})}];return(0,R.jsx)(se,{children:(0,R.jsx)(ee,{title:l(`comp:BAIImportArtifactModal.PullVersion`),centered:!0,onOk:e=>{g({variables:{input:{artifactRevisionIds:x.map(e=>v(e.id))},connectionIds:o??[]},onCompleted:(t,n)=>{if(n&&n.length>0){n.forEach(e=>u.error(e.message??l(`comp:BAIImportArtifactModal.FailedToPullVersions`)));return}let i=t.importArtifacts;i?(u.success(l(`comp:BAIImportArtifactModal.SuccessFullyPulled`,{count:i.artifactRevisions.edges.length})),r(e,i.tasks.filter(e=>e.taskId!=null).map(e=>({taskId:e.taskId,version:e.artifactRevision.version,artifact:{id:v(p?.id??``),name:p?.name??``}})))):u.error(l(`comp:BAIImportArtifactModal.FailedToPullVersions`))},onError:e=>{u.error(e.message??l(`comp:BAIImportArtifactModal.FailedToPullVersions`))}})},onCancel:e=>{i(e)},okText:l(`comp:BAIImportArtifactModal.Pull`),cancelText:l(`general.button.Cancel`),okButtonProps:{loading:_,disabled:_||n(x)},...s,children:(0,R.jsxs)(h,{direction:`column`,gap:`md`,align:`stretch`,children:[x.length!==m.length&&(0,R.jsx)(ne,{icon:(0,R.jsx)(w,{title:l(`comp:BAIImportArtifactModal.OnlySCANNEDVersionsCanBePulled`),iconProps:{style:{color:d(`--color-info`)}},style:{marginRight:d(`--spacing-2`)}}),showIcon:!0,title:l(`comp:BAIImportArtifactModal.ExcludedVersions`,{count:m.length-x.length})}),p&&(0,R.jsx)(O,{artifactFrgmt:p}),(0,R.jsx)(E,{columns:re(S),dataSource:b(x),pagination:{showSizeChanger:!1}})]})})})}})))()}var V;function H(){return(H=e((()=>{V=(function(){var e={kind:`Literal`,name:`offset`,value:0},t=[{kind:`Literal`,name:`first`,value:1},e],n=[{kind:`Literal`,name:`first`,value:10},e],r={alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},i={alias:null,args:null,kind:`ScalarField`,name:`name`,storageKey:null};return{fragment:{argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAIImportArtifactModalStoriesQuery`,selections:[{alias:null,args:t,concreteType:`ArtifactConnection`,kind:`LinkedField`,name:`artifacts`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`Artifact`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{args:null,kind:`FragmentSpread`,name:`BAIImportArtifactModalArtifactFragment`}],storageKey:null}],storageKey:null}],storageKey:`artifacts(first:1,offset:0)`},{alias:null,args:n,concreteType:`ArtifactRevisionConnection`,kind:`LinkedField`,name:`artifactRevisions`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactRevisionEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{args:null,kind:`FragmentSpread`,name:`BAIImportArtifactModalArtifactRevisionFragment`}],storageKey:null}],storageKey:null}],storageKey:`artifactRevisions(first:10,offset:0)`}],type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[],kind:`Operation`,name:`BAIImportArtifactModalStoriesQuery`,selections:[{alias:null,args:t,concreteType:`ArtifactConnection`,kind:`LinkedField`,name:`artifacts`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`Artifact`,kind:`LinkedField`,name:`node`,plural:!1,selections:[r,i,{alias:null,args:null,kind:`ScalarField`,name:`description`,storageKey:null},{alias:null,args:null,concreteType:`SourceInfo`,kind:`LinkedField`,name:`source`,plural:!1,selections:[i,{alias:null,args:null,kind:`ScalarField`,name:`url`,storageKey:null}],storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`type`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:`artifacts(first:1,offset:0)`},{alias:null,args:n,concreteType:`ArtifactRevisionConnection`,kind:`LinkedField`,name:`artifactRevisions`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactRevisionEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`node`,plural:!1,selections:[r,{alias:null,args:null,kind:`ScalarField`,name:`version`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`size`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`status`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:`artifactRevisions(first:10,offset:0)`}]},params:{cacheID:`eb50fa7bda4ed7e2180d5b0e1002389a`,id:null,metadata:{},name:`BAIImportArtifactModalStoriesQuery`,operationKind:`query`,text:`query BAIImportArtifactModalStoriesQuery {
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
  name
  ...BAIArtifactDescriptionsFragment
}

fragment BAIImportArtifactModalArtifactRevisionFragment on ArtifactRevision {
  id
  version
  size
  status
}
`}}})(),V.hash=`394fcfbbf5961a2e6360c1529efe1be7`})))()}var U,W,G,K,q,J,Y,X,Z,Q;function $(){return($=e((()=>{H(),k(),ie(),m(),B(),U=t(),W=g(),x(),G=i(),K={title:`Fragments/BAIImportArtifactModal`,component:z,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`
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
        `}}},argTypes:{selectedArtifactFrgmt:{control:!1,description:`GraphQL fragment reference for artifact data (can be null)`,table:{type:{summary:`BAIImportArtifactModalArtifactFragment$key | null`}}},selectedArtifactRevisionFrgmt:{control:!1,description:`GraphQL fragment reference for artifact revisions`,table:{type:{summary:`BAIImportArtifactModalArtifactRevisionFragment$key`}}},open:{control:!1,description:`Whether the modal is visible (managed by parent component)`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},onOk:{control:!1,description:`Called after successful mutation completion with task information`,table:{type:{summary:`(e: React.MouseEvent, tasks: { taskId: string; version: string; artifact: { id: string; name: string } }[]) => void`}}},onCancel:{control:!1,description:`Called when modal is cancelled`,table:{type:{summary:`(e: React.MouseEvent) => void`}}},connectionIds:{control:!1,description:`Optional Relay connection IDs for cache updates`,table:{type:{summary:`string[]`}}}},decorators:[e=>(0,G.jsx)(S,{children:(0,G.jsx)(e,{})})]},q=()=>{let[e,t]=(0,U.useState)(!1),{artifacts:n,artifactRevisions:r}=(0,W.useLazyLoadQuery)(V,{}),i=n?.edges?.[0]?.node,a=r?.edges?.map(e=>e.node);return a&&a.length>0&&(0,G.jsxs)(h,{direction:`column`,gap:`md`,children:[(0,G.jsx)(ae,{onClick:()=>t(!0),children:`Open Modal`}),(0,G.jsx)(z,{selectedArtifactFrgmt:i??null,selectedArtifactRevisionFrgmt:a,open:e,onOk:()=>{t(!1)},onCancel:()=>t(!1)})]})},J={name:`Basic`,parameters:{docs:{description:{story:`Import multiple artifact revisions with SCANNED status. The modal displays a table with version and size columns.`}}},render:()=>(0,G.jsx)(A,{mockResolvers:{Artifact:()=>({id:`QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==`,name:`pytorch-model`,type:`model`,architecture:`x86_64`,description:`PyTorch deep learning model`,source:{name:`HuggingFace Hub`,url:`https://huggingface.co/pytorch/model`}}),ArtifactRevisionConnection:()=>({edges:[{node:{id:`QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMQ==`,version:`v1.0.0`,size:`2147483648`,status:`SCANNED`}},{node:{id:`QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMg==`,version:`v1.1.0`,size:`3221225472`,status:`SCANNED`}},{node:{id:`QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMw==`,version:`v2.0.0`,size:`4294967296`,status:`SCANNED`}}]}),ImportArtifactsPayload:()=>({tasks:[{taskId:`task-1`,artifactRevision:{version:`v1.0.0`}}]})},children:(0,G.jsx)(q,{})})},Y={name:`WithExcludedRevisions`,parameters:{docs:{description:{story:`Some revisions are excluded from import because they are not in SCANNED status. An alert shows how many are excluded.`}}},render:()=>(0,G.jsx)(A,{mockResolvers:{Artifact:()=>({id:`QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==`,name:`tensorflow-dataset`,type:`dataset`,architecture:`noarch`,description:`TensorFlow training dataset`,source:{name:`Google Cloud Storage`,url:`https://storage.googleapis.com/datasets/tf`}}),ArtifactRevisionConnection:()=>({edges:[{node:{id:`QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMQ==`,version:`v1.0.0`,size:`1073741824`,status:`SCANNED`}},{node:{id:`QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMg==`,version:`v1.1.0`,size:`2147483648`,status:`PULLING`}},{node:{id:`QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMw==`,version:`v2.0.0`,size:`3221225472`,status:`READY`}},{node:{id:`QXJ0aWZhY3RSZXZpc2lvbjpyZXYtNA==`,version:`v2.1.0`,size:`4294967296`,status:`SCANNED`}}]}),ImportArtifactsPayload:()=>({tasks:[{taskId:`task-1`,artifactRevision:{version:`v1.0.0`}}]})},children:(0,G.jsx)(q,{})})},X={name:`SingleRevision`,parameters:{docs:{description:{story:`Import a single artifact revision.`}}},render:()=>(0,G.jsx)(A,{mockResolvers:{Artifact:()=>({id:`QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==`,name:`llm-weights`,type:`model`,architecture:`x86_64`,description:`Large language model weights`,source:{name:`HuggingFace`,url:`https://huggingface.co/llm/weights`}}),ArtifactRevisionConnection:()=>({edges:[{node:{id:`QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMQ==`,version:`latest`,size:`10737418240`,status:`SCANNED`}}]}),ImportArtifactsPayload:()=>({tasks:[{taskId:`task-1`,artifactRevision:{version:`latest`}}]})},children:(0,G.jsx)(q,{})})},Z={name:`AllExcluded`,parameters:{docs:{description:{story:`All revisions are not in SCANNED status, so the Pull button is disabled.`}}},render:()=>(0,G.jsx)(A,{mockResolvers:{Artifact:()=>({id:`QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==`,name:`processing-artifact`,type:`model`,architecture:`aarch64`,description:`Artifact currently being processed`,source:{name:`Internal Registry`,url:`https://registry.internal/artifacts`}}),ArtifactRevisionConnection:()=>({edges:[{node:{id:`QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMQ==`,version:`v1.0.0`,size:`1073741824`,status:`PULLING`}},{node:{id:`QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMg==`,version:`v2.0.0`,size:`2147483648`,status:`READY`}}]}),ImportArtifactsPayload:()=>({tasks:[]})},children:(0,G.jsx)(q,{})})},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
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