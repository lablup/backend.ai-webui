import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-DlPsW1c0.js";import{t as n}from"./jsx-runtime-MKhVqBIO.js";import{n as r,t as i}from"./useBAIi18n-CcDjjg8q.js";import{n as a,t as o}from"./BAIModal-Dr1xntNn.js";import{n as s,t as c}from"./Text-Cj3JSrHf.js";import{b as l,y as u}from"./iframe-BkV1pDm7.js";import{n as d,t as f}from"./BAIFlex-DnaoYTJ1.js";import{t as p}from"./react-relay-sHama7hJ.js";import{n as m,t as h}from"./BAIButton-yVlY0Xmi.js";import{n as g,t as _}from"./BAIUnmountAfterClose-BFd4mgc4.js";import{n as v,t as y}from"./RelayResolver-BnFyFQJn.js";var b;function x(){return(x=e((()=>{b={argumentDefinitions:[],kind:`Fragment`,metadata:{plural:!0},name:`BAIActivateArtifactsModalArtifactsFragment`,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`entityId`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`name`,storageKey:null}],type:`Artifact`,abstractKey:null},b.hash=`bf32ede777b45c0c2511693a250a8853`})))()}var S;function C(){return(C=e((()=>{S=(function(){var e=[{defaultValue:null,kind:`LocalArgument`,name:`input`}],t=[{alias:null,args:[{kind:`Variable`,name:`input`,variableName:`input`}],concreteType:`RestoreArtifactsPayload`,kind:`LinkedField`,name:`restoreArtifacts`,plural:!1,selections:[{alias:null,args:null,concreteType:`Artifact`,kind:`LinkedField`,name:`artifacts`,plural:!0,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`availability`,storageKey:null}],storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:e,kind:`Fragment`,metadata:null,name:`BAIActivateArtifactsModalArtifactsFragmentRestoreArtifactsMutation`,selections:t,type:`Mutation`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:e,kind:`Operation`,name:`BAIActivateArtifactsModalArtifactsFragmentRestoreArtifactsMutation`,selections:t},params:{cacheID:`818ab68b4b27d1f6b18220eae06fef22`,id:null,metadata:{},name:`BAIActivateArtifactsModalArtifactsFragmentRestoreArtifactsMutation`,operationKind:`mutation`,text:`mutation BAIActivateArtifactsModalArtifactsFragmentRestoreArtifactsMutation(
  $input: RestoreArtifactsInput!
) {
  restoreArtifacts(input: $input) {
    artifacts {
      id
      availability
    }
  }
}
`}}})(),S.hash=`e6f2f3dbacb79c2439cde2be032f9fe0`})))()}var w,T,E;function D(){return(D=e((()=>{x(),C(),l(),i(),a(),g(),s(),w=p(),T=n(),E=({selectedArtifactsFragment:e,onOk:t,onCancel:n,...i})=>{let{t:a}=r(),{message:s}=u.useApp(),l=(0,w.useFragment)(b,e),[d,f]=(0,w.useMutation)(S);return(0,T.jsx)(_,{children:(0,T.jsx)(o,{title:a(`comp:BAIActivateArtifactsModal.ActivateArtifacts`),centered:!0,...i,onOk:e=>{d({variables:{input:{artifactIds:l.map(e=>e.entityId)}},onCompleted:(n,r)=>{r&&r.length>0?r.forEach(e=>s.error(e.message??a(`comp:BAIActivateArtifactsModal.FailedToActivateArtifacts`))):(s.success(a(`comp:BAIActivateArtifactsModal.SuccessfullyActivated`)),t==null||t(e))},onError:e=>{s.error(e.message??a(`comp:BAIActivateArtifactsModal.FailedToActivateArtifacts`))}})},onCancel:e=>{n==null||n(e)},okText:a(`comp:BAIActivateArtifactsModal.Activate`),okButtonProps:{loading:f},children:(0,T.jsx)(c,{children:l.length===1?a(`comp:BAIActivateArtifactsModal.AreYouSureYouWantToActivateOne`,{name:l[0].name}):a(`comp:BAIActivateArtifactsModal.AreYouSureYouWantToActivateSome`,{count:l.length})})})})}})))()}var O;function k(){return(k=e((()=>{O=(function(){var e=[{kind:`Literal`,name:`first`,value:10},{kind:`Literal`,name:`offset`,value:0}];return{fragment:{argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAIActivateArtifactsModalStoriesQuery`,selections:[{alias:null,args:e,concreteType:`ArtifactConnection`,kind:`LinkedField`,name:`artifacts`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`Artifact`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{args:null,kind:`FragmentSpread`,name:`BAIActivateArtifactsModalArtifactsFragment`}],storageKey:null}],storageKey:null}],storageKey:`artifacts(first:10,offset:0)`}],type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[],kind:`Operation`,name:`BAIActivateArtifactsModalStoriesQuery`,selections:[{alias:null,args:e,concreteType:`ArtifactConnection`,kind:`LinkedField`,name:`artifacts`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`Artifact`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`entityId`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`name`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:`artifacts(first:10,offset:0)`}]},params:{cacheID:`e6c74cb0fe8bbbd23f3866fdd1a37e12`,id:null,metadata:{},name:`BAIActivateArtifactsModalStoriesQuery`,operationKind:`query`,text:`query BAIActivateArtifactsModalStoriesQuery {
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
`}}})(),O.hash=`c04be905fb0e56da729ca2f2c35c6bed`})))()}var A,j,M,N,P,F,I,L,R,z;function B(){return(B=e((()=>{k(),v(),m(),d(),D(),A=t(),j=p(),M=n(),I={title:`Fragments/BAIActivateArtifactsModal`,component:E,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`
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
        `}}},argTypes:{selectedArtifactsFragment:{control:!1,description:`GraphQL fragment reference for selected artifacts`,table:{type:{summary:`BAIActivateArtifactsModalArtifactsFragment$key`}}},open:{control:!1,description:`Whether the modal is visible (managed by parent component)`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},onOk:{control:!1,description:`Called after successful mutation completion`,table:{type:{summary:`(e: React.MouseEvent) => void`}}},onCancel:{control:!1,description:`Called when modal is cancelled`,table:{type:{summary:`(e: React.MouseEvent) => void`}}}},decorators:[e=>(0,M.jsx)(e,{})]},L=({defaultOpen:e=!1})=>{var t;let[n,r]=(0,A.useState)(e),{artifacts:i}=(0,j.useLazyLoadQuery)(O,{}),a=i==null||(t=i.edges)==null?void 0:t.map(e=>e.node);return a&&a.length>0&&(0,M.jsxs)(f,{direction:`column`,gap:`md`,children:[(0,M.jsx)(h,{onClick:()=>r(!0),children:`Open Modal`}),(0,M.jsx)(E,{selectedArtifactsFragment:a,open:n,onOk:()=>r(!1),onCancel:()=>r(!1)})]})},R={name:`Basic`,parameters:{docs:{description:{story:`Activate a single artifact. The modal displays the artifact name in the confirmation message.`}}},render:()=>(0,M.jsx)(y,{mockResolvers:{ArtifactConnection:()=>({edges:[{node:{id:`QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==`,name:`my-model-v1.0`}}]}),RestoreArtifactsPayload:()=>({artifacts:[{id:`QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==`,availability:`AVAILABLE`}]})},children:(0,M.jsx)(L,{})})},R.parameters={...R.parameters,docs:{...(N=R.parameters)==null?void 0:N.docs,source:{originalSource:`{
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
}`,...(P=R.parameters)==null||(P=P.docs)==null?void 0:P.source},description:{story:`Single artifact activation`,...(F=R.parameters)==null||(F=F.docs)==null?void 0:F.description}}},z=[`Default`]})))()}B();export{R as Default,z as __namedExportsOrder,I as default};