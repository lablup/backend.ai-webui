import{a as L,j as e,B as s,as as D}from"./iframe-DeQ4tvgM.js";import{R as b}from"./RelayResolver-DS1ACjbF.js";import{B as T}from"./BAIAlert-BnbvMPGw.js";import{B as O}from"./BAIButton-BbMiwDJG.js";import{B as Q}from"./BAIFlex-D7hWKYQt.js";import{r as u}from"./index-D4up6eph.js";import"./preload-helper-Dp1pzeXC.js";import"./index-BSkymyEX.js";import"./Banner-C7eXz_8I.js";import"./composeEventHandlers-BolWE7qY.js";import"./astryxLabel-Da6i1_sG.js";const h={argumentDefinitions:[],kind:"Fragment",metadata:null,name:"BAIPullingArtifactRevisionAlertFragment",selections:[{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"fieldId",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"status",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"version",storageKey:null}],type:"ArtifactRevision",abstractKey:null};h.hash="e6966f472baffdb60ebb71b731174e9e";const P=(function(){var n=[{defaultValue:null,kind:"LocalArgument",name:"input"}],i=[{alias:null,args:[{kind:"Variable",name:"input",variableName:"input"}],concreteType:"CancelImportArtifactPayload",kind:"LinkedField",name:"cancelImportArtifact",plural:!1,selections:[{alias:null,args:null,concreteType:"ArtifactRevision",kind:"LinkedField",name:"artifactRevision",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"status",storageKey:null}],storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:n,kind:"Fragment",metadata:null,name:"BAIPullingArtifactRevisionAlertCancelMutation",selections:i,type:"Mutation",abstractKey:null},kind:"Request",operation:{argumentDefinitions:n,kind:"Operation",name:"BAIPullingArtifactRevisionAlertCancelMutation",selections:i},params:{cacheID:"2b4debfb8df103ad97421b0869b31402",id:null,metadata:{},name:"BAIPullingArtifactRevisionAlertCancelMutation",operationKind:"mutation",text:`mutation BAIPullingArtifactRevisionAlertCancelMutation(
  $input: CancelArtifactInput!
) {
  cancelImportArtifact(input: $input) {
    artifactRevision {
      id
      status
    }
  }
}
`}}})();P.hash="18b2b20bc4ed731fcd89e1469e73b49c";const B=({pullingArtifactRevisionFrgmt:n,onOk:i})=>{const{t}=L(),{modal:C,message:o}=D.useApp(),r=u.useFragment(h,n),[S,j]=u.useMutation(P);return e.jsx(T,{type:"info",showIcon:!0,title:t("comp:BAIPullingArtifactRevisionAlert.VersionIsPullingNow",{version:r.version}),action:e.jsx(O,{type:"text",onClick:()=>{C.confirm({title:t("comp:BAIPullingArtifactRevisionAlert.CancelPull"),content:e.jsxs(Q,{direction:"column",align:"stretch",children:[e.jsxs(s,{children:[t("comp:BAIPullingArtifactRevisionAlert.YouAreAboutToCancelThisVersion"),":",e.jsxs(s,{strong:!0,children:[" ",r.version]})]}),e.jsx("br",{}),e.jsxs(s,{type:"danger",children:[e.jsxs(s,{type:"danger",strong:!0,children:[t("comp:BAIPullingArtifactRevisionAlert.WARNING"),":"]})," ",t("comp:BAIPullingArtifactRevisionAlert.CancelingWillRestartThePulling")]})]}),cancelText:t("general.button.Close"),okButtonProps:{danger:!0,loading:j},onOk:()=>{S({variables:{input:{artifactRevisionId:r.fieldId}},onCompleted:(d,c)=>{if(c&&c.length>0){c.forEach(K=>o.error(K.message??t("comp:BAIPullingArtifactRevisionAlert.FailedToCancelThePulling")));return}i==null||i(),o.success(t("comp:BAIPullingArtifactRevisionAlert.VersionPullCanceledSuccessfully",{version:r.version}))},onError:d=>{o.error(d.message??t("comp:BAIPullingArtifactRevisionAlert.FailedToCancelThePulling"))}})}})},children:t("general.button.Cancel")})})},F=(function(){var n=[{kind:"Literal",name:"id",value:"test-id"}];return{fragment:{argumentDefinitions:[],kind:"Fragment",metadata:null,name:"BAIPullingArtifactRevisionAlertStoriesQuery",selections:[{alias:null,args:n,concreteType:"ArtifactRevision",kind:"LinkedField",name:"artifactRevision",plural:!1,selections:[{args:null,kind:"FragmentSpread",name:"BAIPullingArtifactRevisionAlertFragment"}],storageKey:'artifactRevision(id:"test-id")'}],type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[],kind:"Operation",name:"BAIPullingArtifactRevisionAlertStoriesQuery",selections:[{alias:null,args:n,concreteType:"ArtifactRevision",kind:"LinkedField",name:"artifactRevision",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"fieldId",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"status",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"version",storageKey:null}],storageKey:'artifactRevision(id:"test-id")'}]},params:{cacheID:"7ea13ce7a349644de23f406d2cd82136",id:null,metadata:{},name:"BAIPullingArtifactRevisionAlertStoriesQuery",operationKind:"query",text:`query BAIPullingArtifactRevisionAlertStoriesQuery {
  artifactRevision(id: "test-id") {
    ...BAIPullingArtifactRevisionAlertFragment
    id
  }
}

fragment BAIPullingArtifactRevisionAlertFragment on ArtifactRevision {
  id
  fieldId
  status
  version
}
`}}})();F.hash="5879107e033d684c4cc44c48f350e669";const $={title:"Fragments/BAIPullingArtifactRevisionAlert",component:B,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:`
**BAIPullingArtifactRevisionAlert** displays an alert for artifact revisions being pulled.

## Features
- Info alert showing version being pulled
- Cancel button to stop pulling process
- Confirmation modal with warning message
- GraphQL mutation to cancel import
- Success/error message notifications
- Optional callback after successful cancellation

## Usage
\`\`\`tsx
<BAIPullingArtifactRevisionAlert
  pullingArtifactRevisionFrgmt={artifactRevision}
  onOk={() => console.log('Cancelled')}
/>
\`\`\`

## Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| \`pullingArtifactRevisionFrgmt\` | \`BAIPullingArtifactRevisionAlertFragment$key\` | - | Relay fragment reference for artifact revision |
| \`onOk\` | \`() => void\` | - | Optional callback after successful cancellation |
        `}}},argTypes:{pullingArtifactRevisionFrgmt:{control:!1,description:"Relay fragment reference for artifact revision"},onOk:{action:"onOk",description:"Optional callback after successful cancellation"}},decorators:[n=>e.jsx(n,{})]},x=n=>{const{artifactRevision:i}=u.useLazyLoadQuery(F,{});return i&&e.jsx(B,{pullingArtifactRevisionFrgmt:i,...n})},a={name:"Basic",parameters:{docs:{description:{story:"Displays an alert for an artifact revision being pulled. Click the Cancel button to see the confirmation modal."}}},render:()=>e.jsx(b,{mockResolvers:{ArtifactRevision:()=>({id:"QXJ0aWZhY3RSZXZpc2lvbjox",status:"PULLING",version:"v1.2.3"})},children:e.jsx(x,{})})},l={parameters:{docs:{description:{story:"Demonstrates the onOk callback being triggered after successful cancellation. Check the Actions panel."}}},render:n=>e.jsx(b,{mockResolvers:{ArtifactRevision:()=>({id:"QXJ0aWZhY3RSZXZpc2lvbjoy",status:"PULLING",version:"v2.0.0-beta.1"})},children:e.jsx(x,{onOk:n.onOk})})};var m,g,f,p,A;a.parameters={...a.parameters,docs:{...(m=a.parameters)==null?void 0:m.docs,source:{originalSource:`{
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'Displays an alert for an artifact revision being pulled. Click the Cancel button to see the confirmation modal.'
      }
    }
  },
  render: () => <RelayResolver mockResolvers={{
    ArtifactRevision: () => ({
      id: 'QXJ0aWZhY3RSZXZpc2lvbjox',
      status: 'PULLING',
      version: 'v1.2.3'
    })
  }}>
      <QueryResolver />
    </RelayResolver>
}`,...(f=(g=a.parameters)==null?void 0:g.docs)==null?void 0:f.source},description:{story:"Default story showing a pulling artifact revision alert.",...(A=(p=a.parameters)==null?void 0:p.docs)==null?void 0:A.description}}};var v,R,y,k,I;l.parameters={...l.parameters,docs:{...(v=l.parameters)==null?void 0:v.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the onOk callback being triggered after successful cancellation. Check the Actions panel.'
      }
    }
  },
  render: args => <RelayResolver mockResolvers={{
    ArtifactRevision: () => ({
      id: 'QXJ0aWZhY3RSZXZpc2lvbjoy',
      status: 'PULLING',
      version: 'v2.0.0-beta.1'
    })
  }}>
      <QueryResolver onOk={args.onOk} />
    </RelayResolver>
}`,...(y=(R=l.parameters)==null?void 0:R.docs)==null?void 0:y.source},description:{story:"Story showing alert with onOk callback.",...(I=(k=l.parameters)==null?void 0:k.docs)==null?void 0:I.description}}};const q=["Default","WithCallback"];export{a as Default,l as WithCallback,q as __namedExportsOrder,$ as default};
