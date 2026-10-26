import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-D0Ex1IVc.js";import{t as n}from"./jsx-runtime-MKhVqBIO.js";import{n as r,t as i}from"./useBAIi18n-Biey1teG.js";import{n as a,t as o}from"./BAIModal-C5hesmkh.js";import{n as s,t as c}from"./Text-Rtk9ZYap.js";import{b as l,y as u}from"./iframe-DHcqzLLD.js";import{n as d,t as f}from"./BAIFlex-BOFoS5KY.js";import{t as p}from"./react-relay-sBALIJlt.js";import{c as m,h}from"./helper-CVvTx27U.js";import{n as g,t as _}from"./BAIButton-BkLrwIfz.js";import{n as v,t as y}from"./BAIUnmountAfterClose-BLNmR2Ks.js";import{n as b,t as x}from"./RelayResolver-CMrgwoPg.js";var S;function C(){return(C=e((()=>{S={argumentDefinitions:[],kind:`Fragment`,metadata:{plural:!0},name:`BAIActivateArtifactsModalArtifactsFragment`,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`name`,storageKey:null}],type:`Artifact`,abstractKey:null},S.hash=`65926d795590871433bf9800c7c6a065`})))()}var w;function T(){return(T=e((()=>{w=(function(){var e=[{defaultValue:null,kind:`LocalArgument`,name:`input`}],t=[{alias:null,args:[{kind:`Variable`,name:`input`,variableName:`input`}],concreteType:`RestoreArtifactsPayload`,kind:`LinkedField`,name:`restoreArtifacts`,plural:!1,selections:[{alias:null,args:null,concreteType:`Artifact`,kind:`LinkedField`,name:`artifacts`,plural:!0,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`availability`,storageKey:null}],storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:e,kind:`Fragment`,metadata:null,name:`BAIActivateArtifactsModalArtifactsFragmentRestoreArtifactsMutation`,selections:t,type:`Mutation`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:e,kind:`Operation`,name:`BAIActivateArtifactsModalArtifactsFragmentRestoreArtifactsMutation`,selections:t},params:{cacheID:`818ab68b4b27d1f6b18220eae06fef22`,id:null,metadata:{},name:`BAIActivateArtifactsModalArtifactsFragmentRestoreArtifactsMutation`,operationKind:`mutation`,text:`mutation BAIActivateArtifactsModalArtifactsFragmentRestoreArtifactsMutation(
  $input: RestoreArtifactsInput!
) {
  restoreArtifacts(input: $input) {
    artifacts {
      id
      availability
    }
  }
}
`}}})(),w.hash=`e6f2f3dbacb79c2439cde2be032f9fe0`})))()}var E,D,O;function k(){return(k=e((()=>{C(),T(),l(),m(),i(),a(),v(),s(),E=p(),D=n(),O=({selectedArtifactsFragment:e,onOk:t,onCancel:n,...i})=>{let{t:a}=r(),{message:s}=u.useApp(),l=(0,E.useFragment)(S,e),[d,f]=(0,E.useMutation)(w);return(0,D.jsx)(y,{children:(0,D.jsx)(o,{title:a(`comp:BAIActivateArtifactsModal.ActivateArtifacts`),centered:!0,...i,onOk:e=>{d({variables:{input:{artifactIds:l.map(e=>h(e.id))}},onCompleted:(n,r)=>{r&&r.length>0?r.forEach(e=>s.error(e.message??a(`comp:BAIActivateArtifactsModal.FailedToActivateArtifacts`))):(s.success(a(`comp:BAIActivateArtifactsModal.SuccessfullyActivated`)),t?.(e))},onError:e=>{s.error(e.message??a(`comp:BAIActivateArtifactsModal.FailedToActivateArtifacts`))}})},onCancel:e=>{n?.(e)},okText:a(`comp:BAIActivateArtifactsModal.Activate`),okButtonProps:{loading:f},children:(0,D.jsx)(c,{children:l.length===1?a(`comp:BAIActivateArtifactsModal.AreYouSureYouWantToActivateOne`,{name:l[0].name}):a(`comp:BAIActivateArtifactsModal.AreYouSureYouWantToActivateSome`,{count:l.length})})})})}})))()}var A;function j(){return(j=e((()=>{A=(function(){var e=[{kind:`Literal`,name:`first`,value:10},{kind:`Literal`,name:`offset`,value:0}];return{fragment:{argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAIActivateArtifactsModalStoriesQuery`,selections:[{alias:null,args:e,concreteType:`ArtifactConnection`,kind:`LinkedField`,name:`artifacts`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`Artifact`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{args:null,kind:`FragmentSpread`,name:`BAIActivateArtifactsModalArtifactsFragment`}],storageKey:null}],storageKey:null}],storageKey:`artifacts(first:10,offset:0)`}],type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[],kind:`Operation`,name:`BAIActivateArtifactsModalStoriesQuery`,selections:[{alias:null,args:e,concreteType:`ArtifactConnection`,kind:`LinkedField`,name:`artifacts`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`Artifact`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`name`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:`artifacts(first:10,offset:0)`}]},params:{cacheID:`6a579b9f3efbffeff3ed78d38d8fd4c5`,id:null,metadata:{},name:`BAIActivateArtifactsModalStoriesQuery`,operationKind:`query`,text:`query BAIActivateArtifactsModalStoriesQuery {
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
  name
}
`}}})(),A.hash=`c04be905fb0e56da729ca2f2c35c6bed`})))()}var M,N,P,F,I,L,R;function z(){return(z=e((()=>{j(),b(),g(),d(),k(),M=t(),N=p(),P=n(),F={title:`Fragments/BAIActivateArtifactsModal`,component:O,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`
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
        `}}},argTypes:{selectedArtifactsFragment:{control:!1,description:`GraphQL fragment reference for selected artifacts`,table:{type:{summary:`BAIActivateArtifactsModalArtifactsFragment$key`}}},open:{control:!1,description:`Whether the modal is visible (managed by parent component)`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},onOk:{control:!1,description:`Called after successful mutation completion`,table:{type:{summary:`(e: React.MouseEvent) => void`}}},onCancel:{control:!1,description:`Called when modal is cancelled`,table:{type:{summary:`(e: React.MouseEvent) => void`}}}},decorators:[e=>(0,P.jsx)(e,{})]},I=({defaultOpen:e=!1})=>{let[t,n]=(0,M.useState)(e),{artifacts:r}=(0,N.useLazyLoadQuery)(A,{}),i=r?.edges?.map(e=>e.node);return i&&i.length>0&&(0,P.jsxs)(f,{direction:`column`,gap:`md`,children:[(0,P.jsx)(_,{onClick:()=>n(!0),children:`Open Modal`}),(0,P.jsx)(O,{selectedArtifactsFragment:i,open:t,onOk:()=>n(!1),onCancel:()=>n(!1)})]})},L={name:`Basic`,parameters:{docs:{description:{story:`Activate a single artifact. The modal displays the artifact name in the confirmation message.`}}},render:()=>(0,P.jsx)(x,{mockResolvers:{ArtifactConnection:()=>({edges:[{node:{id:`QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==`,name:`my-model-v1.0`}}]}),RestoreArtifactsPayload:()=>({artifacts:[{id:`QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==`,availability:`AVAILABLE`}]})},children:(0,P.jsx)(I,{})})},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
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
}`,...L.parameters?.docs?.source},description:{story:`Single artifact activation`,...L.parameters?.docs?.description}}},R=[`Default`]})))()}z();export{L as Default,R as __namedExportsOrder,F as default};