import{n as e}from"./rolldown-runtime-2s6bX4vc.js";import{n as t,t as n}from"./useBAIi18n-BoXCk5K0.js";import{n as r,t as i}from"./BAIModal-DjFLUMha.js";import{d as a,u as o}from"./iframe-DR2sIF5r.js";import{n as s,t as c}from"./BAIFlex-CAz1t6J5.js";import{n as l,t as u}from"./BAIButton-C-o5ANgR.js";import{n as d,t as f}from"./BAIUnmountAfterClose-wB0Iuoj_.js";import{n as p,t as m}from"./RelayResolver-b1nJU57O.js";import{useState as h}from"react";import{jsx as g,jsxs as _}from"react/jsx-runtime";import{useFragment as v,useLazyLoadQuery as y,useMutation as b}from"react-relay";import{Text as x}from"@lablup/ui-common/Text";var S;function C(){return(C=e((()=>{S={argumentDefinitions:[],kind:`Fragment`,metadata:{plural:!0},name:`BAIDeactivateArtifactsModalArtifactsFragment`,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`entityId`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`name`,storageKey:null}],type:`Artifact`,abstractKey:null},S.hash=`dc9ed8e2de13dae6ba39bd5450666daa`})))()}var w;function T(){return(T=e((()=>{w=(function(){var e=[{defaultValue:null,kind:`LocalArgument`,name:`input`}],t=[{alias:null,args:[{kind:`Variable`,name:`input`,variableName:`input`}],concreteType:`DeleteArtifactsPayload`,kind:`LinkedField`,name:`deleteArtifacts`,plural:!1,selections:[{alias:null,args:null,concreteType:`Artifact`,kind:`LinkedField`,name:`artifacts`,plural:!0,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`availability`,storageKey:null}],storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:e,kind:`Fragment`,metadata:null,name:`BAIDeactivateArtifactsModalDeleteArtifactsMutation`,selections:t,type:`Mutation`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:e,kind:`Operation`,name:`BAIDeactivateArtifactsModalDeleteArtifactsMutation`,selections:t},params:{cacheID:`e45a6c0badd3acc1f5f3b7801541d496`,id:null,metadata:{},name:`BAIDeactivateArtifactsModalDeleteArtifactsMutation`,operationKind:`mutation`,text:`mutation BAIDeactivateArtifactsModalDeleteArtifactsMutation(
  $input: DeleteArtifactsInput!
) {
  deleteArtifacts(input: $input) {
    artifacts {
      id
      availability
    }
  }
}
`}}})(),w.hash=`377ca74de3de373f6dda7069cc9b34eb`})))()}var E;function D(){return(D=e((()=>{C(),T(),a(),n(),r(),d(),E=({selectedArtifactsFragment:e,onOk:n,onCancel:r,...a})=>{let{t:s}=t(),{message:c}=o.useApp(),l=v(S,e),[u,d]=b(w);return g(f,{children:g(i,{title:s(`comp:BAIDeactivateArtifactsModal.DeactivateArtifacts`),centered:!0,okText:s(`comp:BAIDeactivateArtifactsModal.Deactivate`),onOk:e=>{u({variables:{input:{artifactIds:l.map(e=>e.entityId)}},onCompleted:(t,r)=>{r&&r.length>0?r.forEach(e=>c.error(e.message??s(`comp:BAIDeactivateArtifactsModal.FailedToDeactivateArtifacts`))):(c.success(s(`comp:BAIDeactivateArtifactsModal.SuccessfullyDeactivated`)),n?.(e))},onError:e=>{c.error(e.message??s(`comp:BAIDeactivateArtifactsModal.FailedToDeactivateArtifacts`))}})},onCancel:e=>{r?.(e)},okButtonProps:{danger:!0,loading:d},...a,children:g(x,{children:l.length===1?s(`comp:BAIDeactivateArtifactsModal.AreYouSureYouWantToDeactivateOne`,{name:l[0].name}):s(`comp:BAIDeactivateArtifactsModal.AreYouSureYouWantToDeactivateSome`,{count:l.length})})})})}})))()}var O;function k(){return(k=e((()=>{O=(function(){var e=[{kind:`Literal`,name:`first`,value:10},{kind:`Literal`,name:`offset`,value:0}];return{fragment:{argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAIDeactivateArtifactsModalStoriesQuery`,selections:[{alias:null,args:e,concreteType:`ArtifactConnection`,kind:`LinkedField`,name:`artifacts`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`Artifact`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{args:null,kind:`FragmentSpread`,name:`BAIDeactivateArtifactsModalArtifactsFragment`}],storageKey:null}],storageKey:null}],storageKey:`artifacts(first:10,offset:0)`}],type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[],kind:`Operation`,name:`BAIDeactivateArtifactsModalStoriesQuery`,selections:[{alias:null,args:e,concreteType:`ArtifactConnection`,kind:`LinkedField`,name:`artifacts`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`Artifact`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`entityId`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`name`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:`artifacts(first:10,offset:0)`}]},params:{cacheID:`b8f5f0b37bbe1588144e5664d2b6128a`,id:null,metadata:{},name:`BAIDeactivateArtifactsModalStoriesQuery`,operationKind:`query`,text:`query BAIDeactivateArtifactsModalStoriesQuery {
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
`}}})(),O.hash=`62755d4a528917eb88590facd80b7764`})))()}var A,j,M,N;function P(){return(P=e((()=>{k(),p(),l(),s(),D(),A={title:`Fragments/BAIDeactivateArtifactsModal`,component:E,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`
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
        `}}},argTypes:{selectedArtifactsFragment:{control:!1,description:`GraphQL fragment reference for selected artifacts`,table:{type:{summary:`BAIDeactivateArtifactsModalArtifactsFragment$key`}}},open:{control:!1,description:`Whether the modal is visible (managed by parent component)`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},onOk:{control:!1,description:`Called after successful mutation completion`,table:{type:{summary:`(e: React.MouseEvent) => void`}}},onCancel:{control:!1,description:`Called when modal is cancelled`,table:{type:{summary:`(e: React.MouseEvent) => void`}}}},decorators:[e=>g(e,{})]},j=()=>{let[e,t]=h(!1),{artifacts:n}=y(O,{}),r=n?.edges?.map(e=>e.node);return r&&r.length>0&&_(c,{direction:`column`,gap:`md`,children:[g(u,{onClick:()=>t(!0),children:`Open Modal`}),g(E,{selectedArtifactsFragment:r,open:e,onOk:()=>t(!1),onCancel:()=>t(!1)})]})},M={name:`Basic`,parameters:{docs:{description:{story:`Deactivate a single artifact. The modal displays the artifact name in the confirmation message with a danger-styled button.`}}},render:()=>g(m,{mockResolvers:{ArtifactConnection:()=>({edges:[{node:{id:`QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==`,name:`my-model-v1.0`}}]}),DeleteArtifactsPayload:()=>({artifacts:[{id:`QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==`,availability:`ARCHIVED`}]})},children:g(j,{})})},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
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
}`,...M.parameters?.docs?.source},description:{story:`Single artifact deactivation`,...M.parameters?.docs?.description}}},N=[`Default`]})))()}P();export{M as Default,N as __namedExportsOrder,A as default};