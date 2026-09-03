import{a as b,j as n,d as F,A as Q,r as x}from"./iframe-fCvOZk0c.js";import{R as S}from"./RelayResolver-B4ZySwzU.js";import{B as K}from"./BAIButton-BOIOHvzx.js";import{B as R}from"./BAIFlex-BsahEmA0.js";import{t as T}from"./index-CaIORILH.js";import{B as L}from"./BAIModal-BhoxcuWk.js";import{B as Y}from"./BAIUnmountAfterClose-DQWalqJl.js";import{r as u}from"./index-B4W0y0hS.js";import"./preload-helper-Dp1pzeXC.js";import"./index-CAWKoKxh.js";import"./astryxLabel-DbojF4SE.js";import"./isNumber-1eTdYMZX.js";import"./toString-CNMxmVDC.js";import"./isSymbol-GUrnTH49.js";import"./filter-AyiWRYPm.js";import"./_baseEach-CWfP9GI1.js";import"./get-3tvNXMk5.js";import"./_baseGet-Dhf0F7Uh.js";import"./identity-DKeuBCMA.js";import"./isEmpty-ImTowPM3.js";import"./VStack-BMWIuZDC.js";const v={argumentDefinitions:[],kind:"Fragment",metadata:{plural:!0},name:"BAIDeactivateArtifactsModalArtifactsFragment",selections:[{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"name",storageKey:null}],type:"Artifact",abstractKey:null};v.hash="26ee1b9a7472e661b724e54fd20b19a2";const D=(function(){var e=[{defaultValue:null,kind:"LocalArgument",name:"input"}],t=[{alias:null,args:[{kind:"Variable",name:"input",variableName:"input"}],concreteType:"DeleteArtifactsPayload",kind:"LinkedField",name:"deleteArtifacts",plural:!1,selections:[{alias:null,args:null,concreteType:"Artifact",kind:"LinkedField",name:"artifacts",plural:!0,selections:[{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"availability",storageKey:null}],storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:e,kind:"Fragment",metadata:null,name:"BAIDeactivateArtifactsModalDeleteArtifactsMutation",selections:t,type:"Mutation",abstractKey:null},kind:"Request",operation:{argumentDefinitions:e,kind:"Operation",name:"BAIDeactivateArtifactsModalDeleteArtifactsMutation",selections:t},params:{cacheID:"e45a6c0badd3acc1f5f3b7801541d496",id:null,metadata:{},name:"BAIDeactivateArtifactsModalDeleteArtifactsMutation",operationKind:"mutation",text:`mutation BAIDeactivateArtifactsModalDeleteArtifactsMutation(
  $input: DeleteArtifactsInput!
) {
  deleteArtifacts(input: $input) {
    artifacts {
      id
      availability
    }
  }
}
`}}})();D.hash="377ca74de3de373f6dda7069cc9b34eb";const h=({selectedArtifactsFragment:e,onOk:t,onCancel:i,...s})=>{const{t:a}=b(),{message:r}=Q.useApp(),l=u.useFragment(v,e),[M,B]=u.useMutation(D);return n.jsx(Y,{children:n.jsx(L,{title:a("comp:BAIDeactivateArtifactsModal.DeactivateArtifacts"),centered:!0,okText:a("comp:BAIDeactivateArtifactsModal.Deactivate"),onOk:d=>{M({variables:{input:{artifactIds:l.map(c=>T(c.id))}},onCompleted:(c,m)=>{if(m&&m.length>0){m.forEach(I=>r.error(I.message??a("comp:BAIDeactivateArtifactsModal.FailedToDeactivateArtifacts")));return}r.success(a("comp:BAIDeactivateArtifactsModal.SuccessfullyDeactivated")),t==null||t(d)},onError:c=>{r.error(c.message??a("comp:BAIDeactivateArtifactsModal.FailedToDeactivateArtifacts"))}})},onCancel:d=>{i==null||i(d)},okButtonProps:{danger:!0,loading:B},...s,children:n.jsx(F,{children:l.length===1?a("comp:BAIDeactivateArtifactsModal.AreYouSureYouWantToDeactivateOne",{name:l[0].name}):a("comp:BAIDeactivateArtifactsModal.AreYouSureYouWantToDeactivateSome",{count:l.length})})})})},k=(function(){var e=[{kind:"Literal",name:"first",value:10},{kind:"Literal",name:"offset",value:0}];return{fragment:{argumentDefinitions:[],kind:"Fragment",metadata:null,name:"BAIDeactivateArtifactsModalStoriesQuery",selections:[{alias:null,args:e,concreteType:"ArtifactConnection",kind:"LinkedField",name:"artifacts",plural:!1,selections:[{alias:null,args:null,concreteType:"ArtifactEdge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"Artifact",kind:"LinkedField",name:"node",plural:!1,selections:[{args:null,kind:"FragmentSpread",name:"BAIDeactivateArtifactsModalArtifactsFragment"}],storageKey:null}],storageKey:null}],storageKey:"artifacts(first:10,offset:0)"}],type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[],kind:"Operation",name:"BAIDeactivateArtifactsModalStoriesQuery",selections:[{alias:null,args:e,concreteType:"ArtifactConnection",kind:"LinkedField",name:"artifacts",plural:!1,selections:[{alias:null,args:null,concreteType:"ArtifactEdge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"Artifact",kind:"LinkedField",name:"node",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"name",storageKey:null}],storageKey:null}],storageKey:null}],storageKey:"artifacts(first:10,offset:0)"}]},params:{cacheID:"18e18a043c534bc5e25da6405e7b1af9",id:null,metadata:{},name:"BAIDeactivateArtifactsModalStoriesQuery",operationKind:"query",text:`query BAIDeactivateArtifactsModalStoriesQuery {
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
  name
}
`}}})();k.hash="62755d4a528917eb88590facd80b7764";const ne={title:"Fragments/BAIDeactivateArtifactsModal",component:h,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:`
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
        `}}},argTypes:{selectedArtifactsFragment:{control:!1,description:"GraphQL fragment reference for selected artifacts",table:{type:{summary:"BAIDeactivateArtifactsModalArtifactsFragment$key"}}},open:{control:!1,description:"Whether the modal is visible (managed by parent component)",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},onOk:{control:!1,description:"Called after successful mutation completion",table:{type:{summary:"(e: React.MouseEvent) => void"}}},onCancel:{control:!1,description:"Called when modal is cancelled",table:{type:{summary:"(e: React.MouseEvent) => void"}}}},decorators:[e=>n.jsx(e,{})]},C=()=>{var a;const[e,t]=x.useState(!1),{artifacts:i}=u.useLazyLoadQuery(k,{}),s=(a=i==null?void 0:i.edges)==null?void 0:a.map(r=>r.node);return s&&s.length>0&&n.jsxs(R,{direction:"column",gap:"md",children:[n.jsx(K,{onClick:()=>t(!0),children:"Open Modal"}),n.jsx(h,{selectedArtifactsFragment:s,open:e,onOk:()=>t(!1),onCancel:()=>t(!1)})]})},o={name:"Basic",parameters:{docs:{description:{story:"Deactivate a single artifact. The modal displays the artifact name in the confirmation message with a danger-styled button."}}},render:()=>n.jsx(S,{mockResolvers:{ArtifactConnection:()=>({edges:[{node:{id:"QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==",name:"my-model-v1.0"}}]}),DeleteArtifactsPayload:()=>({artifacts:[{id:"QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==",availability:"ARCHIVED"}]})},children:n.jsx(C,{})})};var f,p,g,A,y;o.parameters={...o.parameters,docs:{...(f=o.parameters)==null?void 0:f.docs,source:{originalSource:`{
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
}`,...(g=(p=o.parameters)==null?void 0:p.docs)==null?void 0:g.source},description:{story:"Single artifact deactivation",...(y=(A=o.parameters)==null?void 0:A.docs)==null?void 0:y.description}}};const ie=["Default"];export{o as Default,ie as __namedExportsOrder,ne as default};
