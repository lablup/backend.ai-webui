import{n as e}from"./rolldown-runtime-2s6bX4vc.js";import{n as t,t as n}from"./useBAIi18n-BoXCk5K0.js";import{n as r,t as i}from"./BAIModal-DjFLUMha.js";import{d as a,u as o}from"./iframe-DR2sIF5r.js";import{n as s,t as c}from"./BAIFlex-CAz1t6J5.js";import{n as l,t as u}from"./BAIButton-C-o5ANgR.js";import{n as d,t as f}from"./BAIUnmountAfterClose-wB0Iuoj_.js";import{n as p,t as m}from"./RelayResolver-b1nJU57O.js";import{useState as h}from"react";import{jsx as g,jsxs as _}from"react/jsx-runtime";import{useFragment as v,useLazyLoadQuery as y,useMutation as b}from"react-relay";import{Text as x}from"@lablup/ui-common/Text";var S;function C(){return(C=e((()=>{S={argumentDefinitions:[],kind:`Fragment`,metadata:{plural:!0},name:`BAIActivateArtifactsModalArtifactsFragment`,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`entityId`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`name`,storageKey:null}],type:`Artifact`,abstractKey:null},S.hash=`bf32ede777b45c0c2511693a250a8853`})))()}var w;function T(){return(T=e((()=>{w=(function(){var e=[{defaultValue:null,kind:`LocalArgument`,name:`input`}],t=[{alias:null,args:[{kind:`Variable`,name:`input`,variableName:`input`}],concreteType:`RestoreArtifactsPayload`,kind:`LinkedField`,name:`restoreArtifacts`,plural:!1,selections:[{alias:null,args:null,concreteType:`Artifact`,kind:`LinkedField`,name:`artifacts`,plural:!0,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`availability`,storageKey:null}],storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:e,kind:`Fragment`,metadata:null,name:`BAIActivateArtifactsModalArtifactsFragmentRestoreArtifactsMutation`,selections:t,type:`Mutation`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:e,kind:`Operation`,name:`BAIActivateArtifactsModalArtifactsFragmentRestoreArtifactsMutation`,selections:t},params:{cacheID:`818ab68b4b27d1f6b18220eae06fef22`,id:null,metadata:{},name:`BAIActivateArtifactsModalArtifactsFragmentRestoreArtifactsMutation`,operationKind:`mutation`,text:`mutation BAIActivateArtifactsModalArtifactsFragmentRestoreArtifactsMutation(
  $input: RestoreArtifactsInput!
) {
  restoreArtifacts(input: $input) {
    artifacts {
      id
      availability
    }
  }
}
`}}})(),w.hash=`e6f2f3dbacb79c2439cde2be032f9fe0`})))()}var E;function D(){return(D=e((()=>{C(),T(),a(),n(),r(),d(),E=({selectedArtifactsFragment:e,onOk:n,onCancel:r,...a})=>{let{t:s}=t(),{message:c}=o.useApp(),l=v(S,e),[u,d]=b(w);return g(f,{children:g(i,{title:s(`comp:BAIActivateArtifactsModal.ActivateArtifacts`),centered:!0,...a,onOk:e=>{u({variables:{input:{artifactIds:l.map(e=>e.entityId)}},onCompleted:(t,r)=>{r&&r.length>0?r.forEach(e=>c.error(e.message??s(`comp:BAIActivateArtifactsModal.FailedToActivateArtifacts`))):(c.success(s(`comp:BAIActivateArtifactsModal.SuccessfullyActivated`)),n?.(e))},onError:e=>{c.error(e.message??s(`comp:BAIActivateArtifactsModal.FailedToActivateArtifacts`))}})},onCancel:e=>{r?.(e)},okText:s(`comp:BAIActivateArtifactsModal.Activate`),okButtonProps:{loading:d},children:g(x,{children:l.length===1?s(`comp:BAIActivateArtifactsModal.AreYouSureYouWantToActivateOne`,{name:l[0].name}):s(`comp:BAIActivateArtifactsModal.AreYouSureYouWantToActivateSome`,{count:l.length})})})})}})))()}var O;function k(){return(k=e((()=>{O=(function(){var e=[{kind:`Literal`,name:`first`,value:10},{kind:`Literal`,name:`offset`,value:0}];return{fragment:{argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAIActivateArtifactsModalStoriesQuery`,selections:[{alias:null,args:e,concreteType:`ArtifactConnection`,kind:`LinkedField`,name:`artifacts`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`Artifact`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{args:null,kind:`FragmentSpread`,name:`BAIActivateArtifactsModalArtifactsFragment`}],storageKey:null}],storageKey:null}],storageKey:`artifacts(first:10,offset:0)`}],type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[],kind:`Operation`,name:`BAIActivateArtifactsModalStoriesQuery`,selections:[{alias:null,args:e,concreteType:`ArtifactConnection`,kind:`LinkedField`,name:`artifacts`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`Artifact`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`entityId`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`name`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:`artifacts(first:10,offset:0)`}]},params:{cacheID:`e6c74cb0fe8bbbd23f3866fdd1a37e12`,id:null,metadata:{},name:`BAIActivateArtifactsModalStoriesQuery`,operationKind:`query`,text:`query BAIActivateArtifactsModalStoriesQuery {
  artifacts(offset: 0, first: 10) {
    edges {
      node {
        ...BAIActivateArtifactsModalArtifactsFragment
        id
      }
    }
  }
}

fragment BAIActivateArtifactsModalArtifactsFragment on Artifact {
  id
  entityId
  name
}
`}}})(),O.hash=`c04be905fb0e56da729ca2f2c35c6bed`})))()}var A,j,M,N;function P(){return(P=e((()=>{k(),p(),l(),s(),D(),A={title:`Fragments/BAIActivateArtifactsModal`,component:E,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`
**BAIActivateArtifactsModal** is a confirmation modal for activating (restoring) archived artifacts with GraphQL mutation integration.

## BAI-Specific Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`selectedArtifactsFragment\` | \`BAIActivateArtifactsModalArtifactsFragment$key\` | - | GraphQL fragment reference for selected artifacts (required) |
| \`onOk\` | \`(e: React.MouseEvent) => void\` | - | Called after successful mutation completion (not on button click) |
| \`onCancel\` | \`(e: React.MouseEvent) => void\` | - | Called when modal is cancelled |

## Features
- **Confirmation Message**: Shows different messages for single artifact ("artifact name") vs multiple artifacts ("N artifacts")
- **Mutation Integration**: Uses \`restoreArtifacts\` mutation to activate selected artifacts
- **Success/Error Handling**: Displays success/error messages via Ant Design message component
- **Loading State**: OK button shows loading state during mutation execution

## Usage Pattern
The modal is typically used with a table selection:
1. User selects one or more archived artifacts
2. Clicks "Activate" button
3. Modal shows confirmation with artifact names/count
4. On OK, mutation executes and modal closes on success

For other props, refer to [Ant Design Modal](https://ant.design/components/modal).

## Storybook
Mutation is mocked and will execute successfully, closing the modal on completion.
        `}}},argTypes:{selectedArtifactsFragment:{control:!1,description:`GraphQL fragment reference for selected artifacts`,table:{type:{summary:`BAIActivateArtifactsModalArtifactsFragment$key`}}},open:{control:!1,description:`Whether the modal is visible (managed by parent component)`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},onOk:{control:!1,description:`Called after successful mutation completion`,table:{type:{summary:`(e: React.MouseEvent) => void`}}},onCancel:{control:!1,description:`Called when modal is cancelled`,table:{type:{summary:`(e: React.MouseEvent) => void`}}}},decorators:[e=>g(e,{})]},j=({defaultOpen:e=!1})=>{let[t,n]=h(e),{artifacts:r}=y(O,{}),i=r?.edges?.map(e=>e.node);return i&&i.length>0&&_(c,{direction:`column`,gap:`md`,children:[g(u,{onClick:()=>n(!0),children:`Open Modal`}),g(E,{selectedArtifactsFragment:i,open:t,onOk:()=>n(!1),onCancel:()=>n(!1)})]})},M={name:`Basic`,parameters:{docs:{description:{story:`Activate a single artifact. The modal displays the artifact name in the confirmation message.`}}},render:()=>g(m,{mockResolvers:{ArtifactConnection:()=>({edges:[{node:{id:`QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==`,name:`my-model-v1.0`}}]}),RestoreArtifactsPayload:()=>({artifacts:[{id:`QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==`,availability:`AVAILABLE`}]})},children:g(j,{})})},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'Activate a single artifact. The modal displays the artifact name in the confirmation message.'
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
    RestoreArtifactsPayload: () => ({
      artifacts: [{
        id: 'QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==',
        availability: 'AVAILABLE'
      }]
    })
  }}>
      <QueryResolver />
    </RelayResolver>
}`,...M.parameters?.docs?.source},description:{story:`Single artifact activation`,...M.parameters?.docs?.description}}},N=[`Default`]})))()}P();export{M as Default,N as __namedExportsOrder,A as default};