import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-DlPsW1c0.js";import{t as n}from"./jsx-runtime-MKhVqBIO.js";import{n as r,t as i}from"./useBAIi18n-HeDRJIs5.js";import{n as a,t as o}from"./BAIModal-BAvZLbyI.js";import{n as s,t as c}from"./Text-DkX6BHgk.js";import{n as l,t as u}from"./BAIBulkErrorModal-C2vcbsR0.js";import{b as d,y as f}from"./iframe-jSVuEbUn.js";import{n as p,t as m}from"./BAIFlex-DnaoYTJ1.js";import{t as h}from"./react-relay-sHama7hJ.js";import{n as g,t as _}from"./BAIButton--2vZ3BVA.js";import{n as v,t as y}from"./BAIUnmountAfterClose-BFd4mgc4.js";import{n as b,t as x}from"./RelayResolver-BnFyFQJn.js";var S;function C(){return(C=e((()=>{S={argumentDefinitions:[],kind:`Fragment`,metadata:{plural:!0},name:`BAIDeactivateArtifactsModalArtifactsFragment`,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`entityId`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`name`,storageKey:null}],type:`Artifact`,abstractKey:null},S.hash=`dc9ed8e2de13dae6ba39bd5450666daa`})))()}var w;function T(){return(T=e((()=>{w=(function(){var e=[{defaultValue:null,kind:`LocalArgument`,name:`input`}],t={alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},n=[{alias:null,args:[{kind:`Variable`,name:`input`,variableName:`input`}],concreteType:`PartialBulkArtifactsPayload`,kind:`LinkedField`,name:`partialBulkDeleteArtifacts`,plural:!1,selections:[{alias:null,args:null,concreteType:`Artifact`,kind:`LinkedField`,name:`successes`,plural:!0,selections:[t,{alias:null,args:null,kind:`ScalarField`,name:`availability`,storageKey:null}],storageKey:null},{alias:null,args:null,concreteType:`PartialBulkFailure`,kind:`LinkedField`,name:`failed`,plural:!0,selections:[t,{alias:null,args:null,kind:`ScalarField`,name:`message`,storageKey:null}],storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:e,kind:`Fragment`,metadata:null,name:`BAIDeactivateArtifactsModalDeleteArtifactsMutation`,selections:n,type:`Mutation`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:e,kind:`Operation`,name:`BAIDeactivateArtifactsModalDeleteArtifactsMutation`,selections:n},params:{cacheID:`6c07b526af3f353eaa93e3b6dfd88147`,id:null,metadata:{},name:`BAIDeactivateArtifactsModalDeleteArtifactsMutation`,operationKind:`mutation`,text:`mutation BAIDeactivateArtifactsModalDeleteArtifactsMutation(
  $input: PartialBulkDeleteArtifactsInput!
) {
  partialBulkDeleteArtifacts(input: $input) {
    successes {
      id
      availability
    }
    failed {
      id
      message
    }
  }
}
`}}})(),w.hash=`ce674ac703257f81a2cdc6cc92108cc6`})))()}var E,D,O,k;function A(){return(A=e((()=>{C(),T(),d(),i(),l(),a(),v(),s(),E=t(),D=h(),O=n(),k=({selectedArtifactsFragment:e,onOk:t,onCancel:n,...i})=>{let{t:a}=r(),{message:s}=f.useApp(),l=(0,D.useFragment)(S,e),[d,p]=(0,D.useMutation)(w),[m,h]=(0,E.useState)([]),g=(e,n)=>{s.error(a(`comp:BAIDeactivateArtifactsModal.SomeArtifactsFailedToDeactivate`,{count:n.length})),h(n),t==null||t(e,n.map(e=>e.key))};return(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(y,{children:(0,O.jsx)(o,{title:a(`comp:BAIDeactivateArtifactsModal.DeactivateArtifacts`),centered:!0,okText:a(`comp:BAIDeactivateArtifactsModal.Deactivate`),onOk:e=>{d({variables:{input:{ids:l.map(e=>e.entityId)}},onCompleted:(n,r)=>{if(r&&r.length>0){g(e,l.map(e=>{var t;return{key:e.id,name:e.name,error:((t=r[0])==null?void 0:t.message)??a(`comp:BAIDeactivateArtifactsModal.FailedToDeactivateArtifacts`)}}));return}let{failed:i}=n.partialBulkDeleteArtifacts;i.length===0?(s.success(a(`comp:BAIDeactivateArtifactsModal.SuccessfullyDeactivated`)),t==null||t(e,[])):g(e,i.map(e=>{let t=l.find(t=>t.entityId===e.id);return{key:(t==null?void 0:t.id)??e.id,name:(t==null?void 0:t.name)??e.id,error:e.message}}))},onError:t=>{g(e,l.map(e=>({key:e.id,name:e.name,error:t.message??a(`comp:BAIDeactivateArtifactsModal.FailedToDeactivateArtifacts`)})))}})},onCancel:e=>{n==null||n(e)},okButtonProps:{danger:!0,loading:p},...i,children:(0,O.jsx)(c,{children:l.length===1?a(`comp:BAIDeactivateArtifactsModal.AreYouSureYouWantToDeactivateOne`,{name:l[0].name}):a(`comp:BAIDeactivateArtifactsModal.AreYouSureYouWantToDeactivateSome`,{count:l.length})})})}),(0,O.jsx)(u,{open:m.length>0,title:a(`comp:BAIDeactivateArtifactsModal.SomeArtifactsFailedToDeactivate`,{count:m.length}),columns:[{key:`name`,dataIndex:`name`,title:a(`comp:BAIDeactivateArtifactsModal.Name`)},{key:`error`,dataIndex:`error`,title:a(`comp:BAIDeactivateArtifactsModal.Error`)}],dataSource:m,onRequestClose:()=>h([])})]})}})))()}var j;function M(){return(M=e((()=>{j=(function(){var e=[{kind:`Literal`,name:`first`,value:10},{kind:`Literal`,name:`offset`,value:0}];return{fragment:{argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAIDeactivateArtifactsModalStoriesQuery`,selections:[{alias:null,args:e,concreteType:`ArtifactConnection`,kind:`LinkedField`,name:`artifacts`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`Artifact`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{args:null,kind:`FragmentSpread`,name:`BAIDeactivateArtifactsModalArtifactsFragment`}],storageKey:null}],storageKey:null}],storageKey:`artifacts(first:10,offset:0)`}],type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[],kind:`Operation`,name:`BAIDeactivateArtifactsModalStoriesQuery`,selections:[{alias:null,args:e,concreteType:`ArtifactConnection`,kind:`LinkedField`,name:`artifacts`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`Artifact`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`entityId`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`name`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:`artifacts(first:10,offset:0)`}]},params:{cacheID:`b8f5f0b37bbe1588144e5664d2b6128a`,id:null,metadata:{},name:`BAIDeactivateArtifactsModalStoriesQuery`,operationKind:`query`,text:`query BAIDeactivateArtifactsModalStoriesQuery {
  artifacts(offset: 0, first: 10) {
    edges {
      node {
        ...BAIDeactivateArtifactsModalArtifactsFragment
        id
      }
    }
  }
}

fragment BAIDeactivateArtifactsModalArtifactsFragment on Artifact {
  id
  entityId
  name
}
`}}})(),j.hash=`62755d4a528917eb88590facd80b7764`})))()}var N,P,F,I,L,R,z,B,V,H;function U(){return(U=e((()=>{M(),b(),g(),p(),A(),N=t(),P=h(),F=n(),z={title:`Fragments/BAIDeactivateArtifactsModal`,component:k,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`
**BAIDeactivateArtifactsModal** is a confirmation modal for deactivating (deleting) artifacts with GraphQL mutation integration.

## BAI-Specific Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`selectedArtifactsFragment\` | \`BAIDeactivateArtifactsModalArtifactsFragment$key\` | - | GraphQL fragment reference for selected artifacts (required) |
| \`onOk\` | \`(e: React.MouseEvent) => void\` | - | Called after successful mutation completion (not on button click) |
| \`onCancel\` | \`(e: React.MouseEvent) => void\` | - | Called when modal is cancelled |

## Features
- **Confirmation Message**: Shows different messages for single artifact ("artifact name") vs multiple artifacts ("N artifacts")
- **Mutation Integration**: Uses \`deleteArtifacts\` mutation to deactivate selected artifacts
- **Success/Error Handling**: Displays success/error messages via Ant Design message component
- **Loading State**: OK button shows loading state during mutation execution
- **Danger Button**: OK button is styled as danger (red) to indicate destructive action

## Usage Pattern
The modal is typically used with a table selection:
1. User selects one or more artifacts
2. Clicks "Deactivate" button
3. Modal shows confirmation with artifact names/count
4. On OK, mutation executes and modal closes on success

For other props, refer to [Ant Design Modal](https://ant.design/components/modal).

## Storybook
Mutation is mocked and will execute successfully, closing the modal on completion.
        `}}},argTypes:{selectedArtifactsFragment:{control:!1,description:`GraphQL fragment reference for selected artifacts`,table:{type:{summary:`BAIDeactivateArtifactsModalArtifactsFragment$key`}}},open:{control:!1,description:`Whether the modal is visible (managed by parent component)`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},onOk:{control:!1,description:`Called after successful mutation completion`,table:{type:{summary:`(e: React.MouseEvent) => void`}}},onCancel:{control:!1,description:`Called when modal is cancelled`,table:{type:{summary:`(e: React.MouseEvent) => void`}}}},decorators:[e=>(0,F.jsx)(e,{})]},B=()=>{var e;let[t,n]=(0,N.useState)(!1),{artifacts:r}=(0,P.useLazyLoadQuery)(j,{}),i=r==null||(e=r.edges)==null?void 0:e.map(e=>e.node);return i&&i.length>0&&(0,F.jsxs)(m,{direction:`column`,gap:`md`,children:[(0,F.jsx)(_,{onClick:()=>n(!0),children:`Open Modal`}),(0,F.jsx)(k,{selectedArtifactsFragment:i,open:t,onOk:()=>n(!1),onCancel:()=>n(!1)})]})},V={name:`Basic`,parameters:{docs:{description:{story:`Deactivate a single artifact. The modal displays the artifact name in the confirmation message with a danger-styled button.`}}},render:()=>(0,F.jsx)(x,{mockResolvers:{ArtifactConnection:()=>({edges:[{node:{id:`QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==`,name:`my-model-v1.0`}}]}),DeleteArtifactsPayload:()=>({artifacts:[{id:`QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==`,availability:`ARCHIVED`}]})},children:(0,F.jsx)(B,{})})},V.parameters={...V.parameters,docs:{...(I=V.parameters)==null?void 0:I.docs,source:{originalSource:`{
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'Deactivate a single artifact. The modal displays the artifact name in the confirmation message with a danger-styled button.'
      }
    }
  },
  render: () => <RelayResolver mockResolvers={{
    ArtifactConnection: () => ({
      edges: [{
        node: {
          id: 'QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==',
          name: 'my-model-v1.0'
        }
      }]
    }),
    DeleteArtifactsPayload: () => ({
      artifacts: [{
        id: 'QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==',
        availability: 'ARCHIVED'
      }]
    })
  }}>
      <QueryResolver />
    </RelayResolver>
}`,...(L=V.parameters)==null||(L=L.docs)==null?void 0:L.source},description:{story:`Single artifact deactivation`,...(R=V.parameters)==null||(R=R.docs)==null?void 0:R.description}}},H=[`Default`]})))()}U();export{V as Default,H as __namedExportsOrder,z as default};