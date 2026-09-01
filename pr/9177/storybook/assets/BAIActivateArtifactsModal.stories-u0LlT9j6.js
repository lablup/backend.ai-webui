import{a as b,j as a,b as R,A as Q,r as x}from"./iframe-BFASBehI.js";import{R as S}from"./RelayResolver-D2XKkbwc.js";import{B as L}from"./BAIButton-DcZ1XMlN.js";import{B as K}from"./BAIFlex-DELa4JN6.js";import{t as T}from"./index-DQnTBqFH.js";import{B as Y}from"./BAIModal-wm8Iq28a.js";import{B as E}from"./BAIUnmountAfterClose-CjHG8xjE.js";import{r as f}from"./index-ztdbgyq-.js";import"./preload-helper-Dp1pzeXC.js";import"./index-DEcEm-XR.js";import"./astryxLabel-ByyV9bvg.js";import"./isNumber-DytZR2fJ.js";import"./toString-BPxHfOSA.js";import"./isSymbol-CMvc2ooO.js";import"./filter-RbpWbOZ8.js";import"./_baseEach-BPgr_fDl.js";import"./get-DjOx0fFB.js";import"./_baseGet-CPg0frqK.js";import"./identity-DKeuBCMA.js";import"./isEmpty-CdIyIR-Y.js";import"./VStack-Dsr2rG4L.js";const v={argumentDefinitions:[],kind:"Fragment",metadata:{plural:!0},name:"BAIActivateArtifactsModalArtifactsFragment",selections:[{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"name",storageKey:null}],type:"Artifact",abstractKey:null};v.hash="65926d795590871433bf9800c7c6a065";const h=(function(){var t=[{defaultValue:null,kind:"LocalArgument",name:"input"}],n=[{alias:null,args:[{kind:"Variable",name:"input",variableName:"input"}],concreteType:"RestoreArtifactsPayload",kind:"LinkedField",name:"restoreArtifacts",plural:!1,selections:[{alias:null,args:null,concreteType:"Artifact",kind:"LinkedField",name:"artifacts",plural:!0,selections:[{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"availability",storageKey:null}],storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:t,kind:"Fragment",metadata:null,name:"BAIActivateArtifactsModalArtifactsFragmentRestoreArtifactsMutation",selections:n,type:"Mutation",abstractKey:null},kind:"Request",operation:{argumentDefinitions:t,kind:"Operation",name:"BAIActivateArtifactsModalArtifactsFragmentRestoreArtifactsMutation",selections:n},params:{cacheID:"818ab68b4b27d1f6b18220eae06fef22",id:null,metadata:{},name:"BAIActivateArtifactsModalArtifactsFragmentRestoreArtifactsMutation",operationKind:"mutation",text:`mutation BAIActivateArtifactsModalArtifactsFragmentRestoreArtifactsMutation(
  $input: RestoreArtifactsInput!
) {
  restoreArtifacts(input: $input) {
    artifacts {
      id
      availability
    }
  }
}
`}}})();h.hash="e6f2f3dbacb79c2439cde2be032f9fe0";const k=({selectedArtifactsFragment:t,onOk:n,onCancel:i,...o})=>{const{t:e}=b(),{message:r}=Q.useApp(),s=f.useFragment(v,t),[B,I]=f.useMutation(h);return a.jsx(E,{children:a.jsx(Y,{title:e("comp:BAIActivateArtifactsModal.ActivateArtifacts"),centered:!0,...o,onOk:d=>{B({variables:{input:{artifactIds:s.map(c=>T(c.id))}},onCompleted:(c,m)=>{if(m&&m.length>0){m.forEach(F=>r.error(F.message??e("comp:BAIActivateArtifactsModal.FailedToActivateArtifacts")));return}r.success(e("comp:BAIActivateArtifactsModal.SuccessfullyActivated")),n==null||n(d)},onError:c=>{r.error(c.message??e("comp:BAIActivateArtifactsModal.FailedToActivateArtifacts"))}})},onCancel:d=>{i==null||i(d)},okText:e("comp:BAIActivateArtifactsModal.Activate"),okButtonProps:{loading:I},children:a.jsx(R,{children:s.length===1?e("comp:BAIActivateArtifactsModal.AreYouSureYouWantToActivateOne",{name:s[0].name}):e("comp:BAIActivateArtifactsModal.AreYouSureYouWantToActivateSome",{count:s.length})})})})},M=(function(){var t=[{kind:"Literal",name:"first",value:10},{kind:"Literal",name:"offset",value:0}];return{fragment:{argumentDefinitions:[],kind:"Fragment",metadata:null,name:"BAIActivateArtifactsModalStoriesQuery",selections:[{alias:null,args:t,concreteType:"ArtifactConnection",kind:"LinkedField",name:"artifacts",plural:!1,selections:[{alias:null,args:null,concreteType:"ArtifactEdge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"Artifact",kind:"LinkedField",name:"node",plural:!1,selections:[{args:null,kind:"FragmentSpread",name:"BAIActivateArtifactsModalArtifactsFragment"}],storageKey:null}],storageKey:null}],storageKey:"artifacts(first:10,offset:0)"}],type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[],kind:"Operation",name:"BAIActivateArtifactsModalStoriesQuery",selections:[{alias:null,args:t,concreteType:"ArtifactConnection",kind:"LinkedField",name:"artifacts",plural:!1,selections:[{alias:null,args:null,concreteType:"ArtifactEdge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"Artifact",kind:"LinkedField",name:"node",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"name",storageKey:null}],storageKey:null}],storageKey:null}],storageKey:"artifacts(first:10,offset:0)"}]},params:{cacheID:"6a579b9f3efbffeff3ed78d38d8fd4c5",id:null,metadata:{},name:"BAIActivateArtifactsModalStoriesQuery",operationKind:"query",text:`query BAIActivateArtifactsModalStoriesQuery {
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
`}}})();M.hash="c04be905fb0e56da729ca2f2c35c6bed";const nt={title:"Fragments/BAIActivateArtifactsModal",component:k,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:`
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
        `}}},argTypes:{selectedArtifactsFragment:{control:!1,description:"GraphQL fragment reference for selected artifacts",table:{type:{summary:"BAIActivateArtifactsModalArtifactsFragment$key"}}},open:{control:!1,description:"Whether the modal is visible (managed by parent component)",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},onOk:{control:!1,description:"Called after successful mutation completion",table:{type:{summary:"(e: React.MouseEvent) => void"}}},onCancel:{control:!1,description:"Called when modal is cancelled",table:{type:{summary:"(e: React.MouseEvent) => void"}}}},decorators:[t=>a.jsx(t,{})]},D=({defaultOpen:t=!1})=>{var r;const[n,i]=x.useState(t),{artifacts:o}=f.useLazyLoadQuery(M,{}),e=(r=o==null?void 0:o.edges)==null?void 0:r.map(s=>s.node);return e&&e.length>0&&a.jsxs(K,{direction:"column",gap:"md",children:[a.jsx(L,{onClick:()=>i(!0),children:"Open Modal"}),a.jsx(k,{selectedArtifactsFragment:e,open:n,onOk:()=>i(!1),onCancel:()=>i(!1)})]})},l={name:"Basic",parameters:{docs:{description:{story:"Activate a single artifact. The modal displays the artifact name in the confirmation message."}}},render:()=>a.jsx(S,{mockResolvers:{ArtifactConnection:()=>({edges:[{node:{id:"QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==",name:"my-model-v1.0"}}]}),RestoreArtifactsPayload:()=>({artifacts:[{id:"QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==",availability:"AVAILABLE"}]})},children:a.jsx(D,{})})};var u,A,p,g,y;l.parameters={...l.parameters,docs:{...(u=l.parameters)==null?void 0:u.docs,source:{originalSource:`{
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
}`,...(p=(A=l.parameters)==null?void 0:A.docs)==null?void 0:p.source},description:{story:"Single artifact activation",...(y=(g=l.parameters)==null?void 0:g.docs)==null?void 0:y.description}}};const it=["Default"];export{l as Default,it as __namedExportsOrder,nt as default};
