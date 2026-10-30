import{a as b,j as a,T as R,as as Q,r as S}from"./iframe-Cv5RQ7b1.js";import{R as x}from"./RelayResolver-DmvHfXes.js";import{B as K}from"./BAIButton-DLmuHQx0.js";import{B as L}from"./BAIFlex-DzKh4mym.js";import{B as T}from"./BAIModal-va9P3Gfm.js";import{B as Y}from"./BAIUnmountAfterClose-Dpr-TRuw.js";import{r as u}from"./index-BIkJ5xhM.js";import"./preload-helper-Dp1pzeXC.js";import"./index-CTLq9660.js";import"./astryxLabel-CLt3XAc_.js";/* empty css                 */import"./VStack-BgcOc1l3.js";const v={argumentDefinitions:[],kind:"Fragment",metadata:{plural:!0},name:"BAIActivateArtifactsModalArtifactsFragment",selections:[{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"entityId",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"name",storageKey:null}],type:"Artifact",abstractKey:null};v.hash="bf32ede777b45c0c2511693a250a8853";const h=(function(){var e=[{defaultValue:null,kind:"LocalArgument",name:"input"}],n=[{alias:null,args:[{kind:"Variable",name:"input",variableName:"input"}],concreteType:"RestoreArtifactsPayload",kind:"LinkedField",name:"restoreArtifacts",plural:!1,selections:[{alias:null,args:null,concreteType:"Artifact",kind:"LinkedField",name:"artifacts",plural:!0,selections:[{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"availability",storageKey:null}],storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:e,kind:"Fragment",metadata:null,name:"BAIActivateArtifactsModalArtifactsFragmentRestoreArtifactsMutation",selections:n,type:"Mutation",abstractKey:null},kind:"Request",operation:{argumentDefinitions:e,kind:"Operation",name:"BAIActivateArtifactsModalArtifactsFragmentRestoreArtifactsMutation",selections:n},params:{cacheID:"818ab68b4b27d1f6b18220eae06fef22",id:null,metadata:{},name:"BAIActivateArtifactsModalArtifactsFragmentRestoreArtifactsMutation",operationKind:"mutation",text:`mutation BAIActivateArtifactsModalArtifactsFragmentRestoreArtifactsMutation(
  $input: RestoreArtifactsInput!
) {
  restoreArtifacts(input: $input) {
    artifacts {
      id
      availability
    }
  }
}
`}}})();h.hash="e6f2f3dbacb79c2439cde2be032f9fe0";const k=({selectedArtifactsFragment:e,onOk:n,onCancel:i,...o})=>{const{t}=b(),{message:s}=Q.useApp(),r=u.useFragment(v,e),[I,B]=u.useMutation(h);return a.jsx(Y,{children:a.jsx(T,{title:t("comp:BAIActivateArtifactsModal.ActivateArtifacts"),centered:!0,...o,onOk:d=>{I({variables:{input:{artifactIds:r.map(c=>c.entityId)}},onCompleted:(c,m)=>{if(m&&m.length>0){m.forEach(F=>s.error(F.message??t("comp:BAIActivateArtifactsModal.FailedToActivateArtifacts")));return}s.success(t("comp:BAIActivateArtifactsModal.SuccessfullyActivated")),n==null||n(d)},onError:c=>{s.error(c.message??t("comp:BAIActivateArtifactsModal.FailedToActivateArtifacts"))}})},onCancel:d=>{i==null||i(d)},okText:t("comp:BAIActivateArtifactsModal.Activate"),okButtonProps:{loading:B},children:a.jsx(R,{children:r.length===1?t("comp:BAIActivateArtifactsModal.AreYouSureYouWantToActivateOne",{name:r[0].name}):t("comp:BAIActivateArtifactsModal.AreYouSureYouWantToActivateSome",{count:r.length})})})})},M=(function(){var e=[{kind:"Literal",name:"first",value:10},{kind:"Literal",name:"offset",value:0}];return{fragment:{argumentDefinitions:[],kind:"Fragment",metadata:null,name:"BAIActivateArtifactsModalStoriesQuery",selections:[{alias:null,args:e,concreteType:"ArtifactConnection",kind:"LinkedField",name:"artifacts",plural:!1,selections:[{alias:null,args:null,concreteType:"ArtifactEdge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"Artifact",kind:"LinkedField",name:"node",plural:!1,selections:[{args:null,kind:"FragmentSpread",name:"BAIActivateArtifactsModalArtifactsFragment"}],storageKey:null}],storageKey:null}],storageKey:"artifacts(first:10,offset:0)"}],type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[],kind:"Operation",name:"BAIActivateArtifactsModalStoriesQuery",selections:[{alias:null,args:e,concreteType:"ArtifactConnection",kind:"LinkedField",name:"artifacts",plural:!1,selections:[{alias:null,args:null,concreteType:"ArtifactEdge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"Artifact",kind:"LinkedField",name:"node",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"entityId",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"name",storageKey:null}],storageKey:null}],storageKey:null}],storageKey:"artifacts(first:10,offset:0)"}]},params:{cacheID:"e6c74cb0fe8bbbd23f3866fdd1a37e12",id:null,metadata:{},name:"BAIActivateArtifactsModalStoriesQuery",operationKind:"query",text:`query BAIActivateArtifactsModalStoriesQuery {
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
`}}})();M.hash="c04be905fb0e56da729ca2f2c35c6bed";const V={title:"Fragments/BAIActivateArtifactsModal",component:k,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:`
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
        `}}},argTypes:{selectedArtifactsFragment:{control:!1,description:"GraphQL fragment reference for selected artifacts",table:{type:{summary:"BAIActivateArtifactsModalArtifactsFragment$key"}}},open:{control:!1,description:"Whether the modal is visible (managed by parent component)",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},onOk:{control:!1,description:"Called after successful mutation completion",table:{type:{summary:"(e: React.MouseEvent) => void"}}},onCancel:{control:!1,description:"Called when modal is cancelled",table:{type:{summary:"(e: React.MouseEvent) => void"}}}},decorators:[e=>a.jsx(e,{})]},E=({defaultOpen:e=!1})=>{var s;const[n,i]=S.useState(e),{artifacts:o}=u.useLazyLoadQuery(M,{}),t=(s=o==null?void 0:o.edges)==null?void 0:s.map(r=>r.node);return t&&t.length>0&&a.jsxs(L,{direction:"column",gap:"md",children:[a.jsx(K,{onClick:()=>i(!0),children:"Open Modal"}),a.jsx(k,{selectedArtifactsFragment:t,open:n,onOk:()=>i(!1),onCancel:()=>i(!1)})]})},l={name:"Basic",parameters:{docs:{description:{story:"Activate a single artifact. The modal displays the artifact name in the confirmation message."}}},render:()=>a.jsx(x,{mockResolvers:{ArtifactConnection:()=>({edges:[{node:{id:"QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==",name:"my-model-v1.0"}}]}),RestoreArtifactsPayload:()=>({artifacts:[{id:"QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==",availability:"AVAILABLE"}]})},children:a.jsx(E,{})})};var f,A,p,g,y;l.parameters={...l.parameters,docs:{...(f=l.parameters)==null?void 0:f.docs,source:{originalSource:`{
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
}`,...(p=(A=l.parameters)==null?void 0:A.docs)==null?void 0:p.source},description:{story:"Single artifact activation",...(y=(g=l.parameters)==null?void 0:g.docs)==null?void 0:y.description}}};const U=["Default"];export{l as Default,U as __namedExportsOrder,V as default};
