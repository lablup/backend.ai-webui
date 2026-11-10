import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-DlPsW1c0.js";import{t as n}from"./jsx-runtime-MKhVqBIO.js";import{n as r,t as i}from"./useBAIi18n-HeDRJIs5.js";import{n as a,t as o}from"./BAIModal-lr2vQ6Tv.js";import{n as s,t as c}from"./Text-DTxx1K0Q.js";import{b as l,y as u}from"./iframe-BUIYvSv6.js";import{n as d,t as f}from"./BAIFlex-DnaoYTJ1.js";import{t as p}from"./react-relay-sHama7hJ.js";import{n as m,t as h}from"./BAIButton-DOGofbc0.js";import{n as g,t as _}from"./BAIBulkErrorModal-Dn6GwweH.js";import{n as v,t as y}from"./BAIUnmountAfterClose-BFd4mgc4.js";import{n as b,t as x}from"./RelayResolver-BnFyFQJn.js";var S;function C(){return(C=e((()=>{S={argumentDefinitions:[],kind:`Fragment`,metadata:{plural:!0},name:`BAIActivateArtifactsModalArtifactsFragment`,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`entityId`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`name`,storageKey:null}],type:`Artifact`,abstractKey:null},S.hash=`bf32ede777b45c0c2511693a250a8853`})))()}var w;function T(){return(T=e((()=>{w=(function(){var e=[{defaultValue:null,kind:`LocalArgument`,name:`input`}],t={alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},n=[{alias:null,args:[{kind:`Variable`,name:`input`,variableName:`input`}],concreteType:`PartialBulkArtifactsPayload`,kind:`LinkedField`,name:`partialBulkRestoreArtifacts`,plural:!1,selections:[{alias:null,args:null,concreteType:`Artifact`,kind:`LinkedField`,name:`successes`,plural:!0,selections:[t,{alias:null,args:null,kind:`ScalarField`,name:`availability`,storageKey:null}],storageKey:null},{alias:null,args:null,concreteType:`PartialBulkFailure`,kind:`LinkedField`,name:`failed`,plural:!0,selections:[t,{alias:null,args:null,kind:`ScalarField`,name:`message`,storageKey:null}],storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:e,kind:`Fragment`,metadata:null,name:`BAIActivateArtifactsModalArtifactsFragmentRestoreArtifactsMutation`,selections:n,type:`Mutation`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:e,kind:`Operation`,name:`BAIActivateArtifactsModalArtifactsFragmentRestoreArtifactsMutation`,selections:n},params:{cacheID:`432d20cc8421a9533d0a1abdafb0584c`,id:null,metadata:{},name:`BAIActivateArtifactsModalArtifactsFragmentRestoreArtifactsMutation`,operationKind:`mutation`,text:`mutation BAIActivateArtifactsModalArtifactsFragmentRestoreArtifactsMutation(
  $input: PartialBulkRestoreArtifactsInput!
) {
  partialBulkRestoreArtifacts(input: $input) {
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
`}}})(),w.hash=`fd1ec5137350e8e324994d4c7dfe351f`})))()}var E,D,O,k;function A(){return(A=e((()=>{C(),T(),l(),i(),g(),a(),v(),s(),E=t(),D=p(),O=n(),k=({selectedArtifactsFragment:e,onOk:t,onCancel:n,...i})=>{let{t:a}=r(),{message:s}=u.useApp(),[l,d]=(0,E.useState)([]),f=(0,D.useFragment)(S,e),[p,m]=(0,D.useMutation)(w),h=(e,n)=>{s.error(a(`comp:BAIActivateArtifactsModal.SomeArtifactsFailedToActivate`,{count:n.length})),d(n),t==null||t(e,n.map(e=>e.key))};return(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(y,{children:(0,O.jsx)(o,{title:a(`comp:BAIActivateArtifactsModal.ActivateArtifacts`),centered:!0,...i,onOk:e=>{p({variables:{input:{ids:f.map(e=>e.entityId)}},onCompleted:(n,r)=>{if(r&&r.length>0){h(e,f.map(e=>{var t;return{key:e.id,name:e.name,error:((t=r[0])==null?void 0:t.message)??a(`comp:BAIActivateArtifactsModal.FailedToActivateArtifacts`)}}));return}let{failed:i}=n.partialBulkRestoreArtifacts;i.length===0?(s.success(a(`comp:BAIActivateArtifactsModal.SuccessfullyActivated`)),t==null||t(e,[])):h(e,i.map(e=>{let t=f.find(t=>t.entityId===e.id);return{key:(t==null?void 0:t.id)??e.id,name:(t==null?void 0:t.name)??e.id,error:e.message}}))},onError:t=>{h(e,f.map(e=>({key:e.id,name:e.name,error:t.message??a(`comp:BAIActivateArtifactsModal.FailedToActivateArtifacts`)})))}})},onCancel:e=>{n==null||n(e)},okText:a(`comp:BAIActivateArtifactsModal.Activate`),okButtonProps:{loading:m},children:(0,O.jsx)(c,{children:f.length===1?a(`comp:BAIActivateArtifactsModal.AreYouSureYouWantToActivateOne`,{name:f[0].name}):a(`comp:BAIActivateArtifactsModal.AreYouSureYouWantToActivateSome`,{count:f.length})})})}),(0,O.jsx)(_,{open:l.length>0,title:a(`comp:BAIActivateArtifactsModal.SomeArtifactsFailedToActivate`,{count:l.length}),columns:[{key:`name`,dataIndex:`name`,title:a(`comp:BAIActivateArtifactsModal.Name`)},{key:`error`,dataIndex:`error`,title:a(`comp:BAIActivateArtifactsModal.Error`)}],dataSource:l,onRequestClose:()=>d([])})]})}})))()}var j;function M(){return(M=e((()=>{j=(function(){var e=[{kind:`Literal`,name:`first`,value:10},{kind:`Literal`,name:`offset`,value:0}];return{fragment:{argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAIActivateArtifactsModalStoriesQuery`,selections:[{alias:null,args:e,concreteType:`ArtifactConnection`,kind:`LinkedField`,name:`artifacts`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`Artifact`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{args:null,kind:`FragmentSpread`,name:`BAIActivateArtifactsModalArtifactsFragment`}],storageKey:null}],storageKey:null}],storageKey:`artifacts(first:10,offset:0)`}],type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[],kind:`Operation`,name:`BAIActivateArtifactsModalStoriesQuery`,selections:[{alias:null,args:e,concreteType:`ArtifactConnection`,kind:`LinkedField`,name:`artifacts`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`Artifact`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`entityId`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`name`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:`artifacts(first:10,offset:0)`}]},params:{cacheID:`e6c74cb0fe8bbbd23f3866fdd1a37e12`,id:null,metadata:{},name:`BAIActivateArtifactsModalStoriesQuery`,operationKind:`query`,text:`query BAIActivateArtifactsModalStoriesQuery {
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
`}}})(),j.hash=`c04be905fb0e56da729ca2f2c35c6bed`})))()}var N,P,F,I,L,R,z,B,V,H;function U(){return(U=e((()=>{M(),b(),m(),d(),A(),N=t(),P=p(),F=n(),z={title:`Fragments/BAIActivateArtifactsModal`,component:k,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`
**BAIActivateArtifactsModal** is a confirmation modal for activating (restoring) archived artifacts with GraphQL mutation integration.

## BAI-Specific Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`selectedArtifactsFragment\` | \`BAIActivateArtifactsModalArtifactsFragment$key\` | - | GraphQL fragment reference for selected artifacts (required) |
| \`onOk\` | \`(e: React.MouseEvent, failedArtifactIds: string[]) => void\` | - | Called once the mutation settles, with the ids of the artifacts that failed |
| \`onCancel\` | \`(e: React.MouseEvent) => void\` | - | Called when modal is cancelled |

## Features
- **Confirmation Message**: Shows different messages for single artifact ("artifact name") vs multiple artifacts ("N artifacts")
- **Mutation Integration**: Uses \`partialBulkRestoreArtifacts\` mutation to activate selected artifacts
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
        `}}},argTypes:{selectedArtifactsFragment:{control:!1,description:`GraphQL fragment reference for selected artifacts`,table:{type:{summary:`BAIActivateArtifactsModalArtifactsFragment$key`}}},open:{control:!1,description:`Whether the modal is visible (managed by parent component)`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},onOk:{control:!1,description:`Called once the mutation settles, with the ids of the artifacts that failed`,table:{type:{summary:`(e: React.MouseEvent, failedArtifactIds: string[]) => void`}}},onCancel:{control:!1,description:`Called when modal is cancelled`,table:{type:{summary:`(e: React.MouseEvent) => void`}}}},decorators:[e=>(0,F.jsx)(e,{})]},B=({defaultOpen:e=!1})=>{var t;let[n,r]=(0,N.useState)(e),{artifacts:i}=(0,P.useLazyLoadQuery)(j,{}),a=i==null||(t=i.edges)==null?void 0:t.map(e=>e.node);return a&&a.length>0&&(0,F.jsxs)(f,{direction:`column`,gap:`md`,children:[(0,F.jsx)(h,{onClick:()=>r(!0),children:`Open Modal`}),(0,F.jsx)(k,{selectedArtifactsFragment:a,open:n,onOk:()=>r(!1),onCancel:()=>r(!1)})]})},V={name:`Basic`,parameters:{docs:{description:{story:`Activate a single artifact. The modal displays the artifact name in the confirmation message.`}}},render:()=>(0,F.jsx)(x,{mockResolvers:{ArtifactConnection:()=>({edges:[{node:{id:`QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==`,name:`my-model-v1.0`}}]}),RestoreArtifactsPayload:()=>({artifacts:[{id:`QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==`,availability:`AVAILABLE`}]})},children:(0,F.jsx)(B,{})})},V.parameters={...V.parameters,docs:{...(I=V.parameters)==null?void 0:I.docs,source:{originalSource:`{
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
}`,...(L=V.parameters)==null||(L=L.docs)==null?void 0:L.source},description:{story:`Single artifact activation`,...(R=V.parameters)==null||(R=R.docs)==null?void 0:R.description}}},H=[`Default`]})))()}U();export{V as Default,H as __namedExportsOrder,z as default};