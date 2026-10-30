import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-DlPsW1c0.js";import{t as n}from"./jsx-runtime-MKhVqBIO.js";import{n as r,t as i}from"./useBAIi18n-CouhYuVu.js";import{n as a,t as o}from"./BAIModal-DpoIv_tX.js";import{n as s,t as c}from"./Text-Cj3JSrHf.js";import{b as l,y as u}from"./iframe-DnpvlTFX.js";import{n as d,t as f}from"./BAIFlex-DnaoYTJ1.js";import{t as p}from"./react-relay-sHama7hJ.js";import{n as m,t as h}from"./BAIButton-Di63xsXg.js";import{n as g,t as _}from"./BAIUnmountAfterClose-BFd4mgc4.js";import{n as v,t as y}from"./RelayResolver-BnFyFQJn.js";var b;function x(){return(x=e((()=>{b={argumentDefinitions:[],kind:`Fragment`,metadata:{plural:!0},name:`BAIDeactivateArtifactsModalArtifactsFragment`,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`entityId`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`name`,storageKey:null}],type:`Artifact`,abstractKey:null},b.hash=`dc9ed8e2de13dae6ba39bd5450666daa`})))()}var S;function C(){return(C=e((()=>{S=(function(){var e=[{defaultValue:null,kind:`LocalArgument`,name:`input`}],t=[{alias:null,args:[{kind:`Variable`,name:`input`,variableName:`input`}],concreteType:`DeleteArtifactsPayload`,kind:`LinkedField`,name:`deleteArtifacts`,plural:!1,selections:[{alias:null,args:null,concreteType:`Artifact`,kind:`LinkedField`,name:`artifacts`,plural:!0,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`availability`,storageKey:null}],storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:e,kind:`Fragment`,metadata:null,name:`BAIDeactivateArtifactsModalDeleteArtifactsMutation`,selections:t,type:`Mutation`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:e,kind:`Operation`,name:`BAIDeactivateArtifactsModalDeleteArtifactsMutation`,selections:t},params:{cacheID:`e45a6c0badd3acc1f5f3b7801541d496`,id:null,metadata:{},name:`BAIDeactivateArtifactsModalDeleteArtifactsMutation`,operationKind:`mutation`,text:`mutation BAIDeactivateArtifactsModalDeleteArtifactsMutation(
  $input: DeleteArtifactsInput!
) {
  deleteArtifacts(input: $input) {
    artifacts {
      id
      availability
    }
  }
}
`}}})(),S.hash=`377ca74de3de373f6dda7069cc9b34eb`})))()}var w,T,E;function D(){return(D=e((()=>{x(),C(),l(),i(),a(),g(),s(),w=p(),T=n(),E=({selectedArtifactsFragment:e,onOk:t,onCancel:n,...i})=>{let{t:a}=r(),{message:s}=u.useApp(),l=(0,w.useFragment)(b,e),[d,f]=(0,w.useMutation)(S);return(0,T.jsx)(_,{children:(0,T.jsx)(o,{title:a(`comp:BAIDeactivateArtifactsModal.DeactivateArtifacts`),centered:!0,okText:a(`comp:BAIDeactivateArtifactsModal.Deactivate`),onOk:e=>{d({variables:{input:{artifactIds:l.map(e=>e.entityId)}},onCompleted:(n,r)=>{r&&r.length>0?r.forEach(e=>s.error(e.message??a(`comp:BAIDeactivateArtifactsModal.FailedToDeactivateArtifacts`))):(s.success(a(`comp:BAIDeactivateArtifactsModal.SuccessfullyDeactivated`)),t==null||t(e))},onError:e=>{s.error(e.message??a(`comp:BAIDeactivateArtifactsModal.FailedToDeactivateArtifacts`))}})},onCancel:e=>{n==null||n(e)},okButtonProps:{danger:!0,loading:f},...i,children:(0,T.jsx)(c,{children:l.length===1?a(`comp:BAIDeactivateArtifactsModal.AreYouSureYouWantToDeactivateOne`,{name:l[0].name}):a(`comp:BAIDeactivateArtifactsModal.AreYouSureYouWantToDeactivateSome`,{count:l.length})})})})}})))()}var O;function k(){return(k=e((()=>{O=(function(){var e=[{kind:`Literal`,name:`first`,value:10},{kind:`Literal`,name:`offset`,value:0}];return{fragment:{argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAIDeactivateArtifactsModalStoriesQuery`,selections:[{alias:null,args:e,concreteType:`ArtifactConnection`,kind:`LinkedField`,name:`artifacts`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`Artifact`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{args:null,kind:`FragmentSpread`,name:`BAIDeactivateArtifactsModalArtifactsFragment`}],storageKey:null}],storageKey:null}],storageKey:`artifacts(first:10,offset:0)`}],type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[],kind:`Operation`,name:`BAIDeactivateArtifactsModalStoriesQuery`,selections:[{alias:null,args:e,concreteType:`ArtifactConnection`,kind:`LinkedField`,name:`artifacts`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`Artifact`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`entityId`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`name`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:`artifacts(first:10,offset:0)`}]},params:{cacheID:`b8f5f0b37bbe1588144e5664d2b6128a`,id:null,metadata:{},name:`BAIDeactivateArtifactsModalStoriesQuery`,operationKind:`query`,text:`query BAIDeactivateArtifactsModalStoriesQuery {
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
`}}})(),O.hash=`62755d4a528917eb88590facd80b7764`})))()}var A,j,M,N,P,F,I,L,R,z;function B(){return(B=e((()=>{k(),v(),m(),d(),D(),A=t(),j=p(),M=n(),I={title:`Fragments/BAIDeactivateArtifactsModal`,component:E,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`
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
        `}}},argTypes:{selectedArtifactsFragment:{control:!1,description:`GraphQL fragment reference for selected artifacts`,table:{type:{summary:`BAIDeactivateArtifactsModalArtifactsFragment$key`}}},open:{control:!1,description:`Whether the modal is visible (managed by parent component)`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},onOk:{control:!1,description:`Called after successful mutation completion`,table:{type:{summary:`(e: React.MouseEvent) => void`}}},onCancel:{control:!1,description:`Called when modal is cancelled`,table:{type:{summary:`(e: React.MouseEvent) => void`}}}},decorators:[e=>(0,M.jsx)(e,{})]},L=()=>{var e;let[t,n]=(0,A.useState)(!1),{artifacts:r}=(0,j.useLazyLoadQuery)(O,{}),i=r==null||(e=r.edges)==null?void 0:e.map(e=>e.node);return i&&i.length>0&&(0,M.jsxs)(f,{direction:`column`,gap:`md`,children:[(0,M.jsx)(h,{onClick:()=>n(!0),children:`Open Modal`}),(0,M.jsx)(E,{selectedArtifactsFragment:i,open:t,onOk:()=>n(!1),onCancel:()=>n(!1)})]})},R={name:`Basic`,parameters:{docs:{description:{story:`Deactivate a single artifact. The modal displays the artifact name in the confirmation message with a danger-styled button.`}}},render:()=>(0,M.jsx)(y,{mockResolvers:{ArtifactConnection:()=>({edges:[{node:{id:`QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==`,name:`my-model-v1.0`}}]}),DeleteArtifactsPayload:()=>({artifacts:[{id:`QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==`,availability:`ARCHIVED`}]})},children:(0,M.jsx)(L,{})})},R.parameters={...R.parameters,docs:{...(N=R.parameters)==null?void 0:N.docs,source:{originalSource:`{
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
}`,...(P=R.parameters)==null||(P=P.docs)==null?void 0:P.source},description:{story:`Single artifact deactivation`,...(F=R.parameters)==null||(F=F.docs)==null?void 0:F.description}}},z=[`Default`]})))()}B();export{R as Default,z as __namedExportsOrder,I as default};