import{a as K,j as e,B as s,A as D}from"./iframe-DAafooS5.js";import{R as h}from"./RelayResolver-B1__u8RO.js";import{t as T}from"./index-NUVDqZtI.js";import{B as O}from"./BAIAlert-CUjViqUV.js";import{B as Q}from"./BAIButton-B8Mivb0I.js";import{B as Z}from"./BAIFlex-NsLHEc6R.js";import{r as u}from"./index-B9tPmwuK.js";import"./preload-helper-Dp1pzeXC.js";import"./index-iiwMzDnt.js";import"./isNumber-iMXiztm4.js";import"./toString-x0zywEl_.js";import"./isSymbol-C2coCXL5.js";import"./filter-DQTZ8PEN.js";import"./_baseEach-BkCY0drg.js";import"./get-G7p5lKzf.js";import"./_baseGet-DcwxXAZ3.js";import"./identity-DKeuBCMA.js";import"./isEmpty-BAtLKgQu.js";import"./Banner-mnZvDrde.js";import"./isRenderable-BUV0eL6r.js";import"./composeEventHandlers-BolWE7qY.js";import"./astryxLabel-CQFzQ6GQ.js";const I={argumentDefinitions:[],kind:"Fragment",metadata:null,name:"BAIPullingArtifactRevisionAlertFragment",selections:[{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"status",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"version",storageKey:null}],type:"ArtifactRevision",abstractKey:null};I.hash="8481a07489849ce66e12a3a734be08b5";const P=(function(){var n=[{defaultValue:null,kind:"LocalArgument",name:"input"}],i=[{alias:null,args:[{kind:"Variable",name:"input",variableName:"input"}],concreteType:"CancelImportArtifactPayload",kind:"LinkedField",name:"cancelImportArtifact",plural:!1,selections:[{alias:null,args:null,concreteType:"ArtifactRevision",kind:"LinkedField",name:"artifactRevision",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"status",storageKey:null}],storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:n,kind:"Fragment",metadata:null,name:"BAIPullingArtifactRevisionAlertCancelMutation",selections:i,type:"Mutation",abstractKey:null},kind:"Request",operation:{argumentDefinitions:n,kind:"Operation",name:"BAIPullingArtifactRevisionAlertCancelMutation",selections:i},params:{cacheID:"2b4debfb8df103ad97421b0869b31402",id:null,metadata:{},name:"BAIPullingArtifactRevisionAlertCancelMutation",operationKind:"mutation",text:`mutation BAIPullingArtifactRevisionAlertCancelMutation(
  $input: CancelArtifactInput!
) {
  cancelImportArtifact(input: $input) {
    artifactRevision {
      id
      status
    }
  }
}
`}}})();P.hash="18b2b20bc4ed731fcd89e1469e73b49c";const B=({pullingArtifactRevisionFrgmt:n,onOk:i})=>{const{t}=K(),{modal:C,message:o}=D.useApp(),l=u.useFragment(I,n),[S,j]=u.useMutation(P);return e.jsx(O,{type:"info",showIcon:!0,title:t("comp:BAIPullingArtifactRevisionAlert.VersionIsPullingNow",{version:l.version}),action:e.jsx(Q,{type:"text",onClick:()=>{C.confirm({title:t("comp:BAIPullingArtifactRevisionAlert.CancelPull"),content:e.jsxs(Z,{direction:"column",align:"stretch",children:[e.jsxs(s,{children:[t("comp:BAIPullingArtifactRevisionAlert.YouAreAboutToCancelThisVersion"),":",e.jsxs(s,{strong:!0,children:[" ",l.version]})]}),e.jsx("br",{}),e.jsxs(s,{type:"danger",children:[e.jsxs(s,{type:"danger",strong:!0,children:[t("comp:BAIPullingArtifactRevisionAlert.WARNING"),":"]})," ",t("comp:BAIPullingArtifactRevisionAlert.CancelingWillRestartThePulling")]})]}),cancelText:t("general.button.Close"),okButtonProps:{danger:!0,loading:j},onOk:()=>{S({variables:{input:{artifactRevisionId:T(l.id)}},onCompleted:(d,c)=>{if(c&&c.length>0){c.forEach(L=>o.error(L.message??t("comp:BAIPullingArtifactRevisionAlert.FailedToCancelThePulling")));return}i==null||i(),o.success(t("comp:BAIPullingArtifactRevisionAlert.VersionPullCanceledSuccessfully",{version:l.version}))},onError:d=>{o.error(d.message??t("comp:BAIPullingArtifactRevisionAlert.FailedToCancelThePulling"))}})}})},children:t("general.button.Cancel")})})},F=(function(){var n=[{kind:"Literal",name:"id",value:"test-id"}];return{fragment:{argumentDefinitions:[],kind:"Fragment",metadata:null,name:"BAIPullingArtifactRevisionAlertStoriesQuery",selections:[{alias:null,args:n,concreteType:"ArtifactRevision",kind:"LinkedField",name:"artifactRevision",plural:!1,selections:[{args:null,kind:"FragmentSpread",name:"BAIPullingArtifactRevisionAlertFragment"}],storageKey:'artifactRevision(id:"test-id")'}],type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[],kind:"Operation",name:"BAIPullingArtifactRevisionAlertStoriesQuery",selections:[{alias:null,args:n,concreteType:"ArtifactRevision",kind:"LinkedField",name:"artifactRevision",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"status",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"version",storageKey:null}],storageKey:'artifactRevision(id:"test-id")'}]},params:{cacheID:"48eef0100b716d30964bc30242bb953a",id:null,metadata:{},name:"BAIPullingArtifactRevisionAlertStoriesQuery",operationKind:"query",text:`query BAIPullingArtifactRevisionAlertStoriesQuery {
  artifactRevision(id: "test-id") {
    ...BAIPullingArtifactRevisionAlertFragment
    id
  }
}

fragment BAIPullingArtifactRevisionAlertFragment on ArtifactRevision {
  id
  status
  version
}
`}}})();F.hash="5879107e033d684c4cc44c48f350e669";const le={title:"Fragments/BAIPullingArtifactRevisionAlert",component:B,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:`
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
        `}}},argTypes:{pullingArtifactRevisionFrgmt:{control:!1,description:"Relay fragment reference for artifact revision"},onOk:{action:"onOk",description:"Optional callback after successful cancellation"}},decorators:[n=>e.jsx(n,{})]},x=n=>{const{artifactRevision:i}=u.useLazyLoadQuery(F,{});return i&&e.jsx(B,{pullingArtifactRevisionFrgmt:i,...n})},a={name:"Basic",parameters:{docs:{description:{story:"Displays an alert for an artifact revision being pulled. Click the Cancel button to see the confirmation modal."}}},render:()=>e.jsx(h,{mockResolvers:{ArtifactRevision:()=>({id:"QXJ0aWZhY3RSZXZpc2lvbjox",status:"PULLING",version:"v1.2.3"})},children:e.jsx(x,{})})},r={parameters:{docs:{description:{story:"Demonstrates the onOk callback being triggered after successful cancellation. Check the Actions panel."}}},render:n=>e.jsx(h,{mockResolvers:{ArtifactRevision:()=>({id:"QXJ0aWZhY3RSZXZpc2lvbjoy",status:"PULLING",version:"v2.0.0-beta.1"})},children:e.jsx(x,{onOk:n.onOk})})};var m,p,g,f,A;a.parameters={...a.parameters,docs:{...(m=a.parameters)==null?void 0:m.docs,source:{originalSource:`{
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
}`,...(g=(p=a.parameters)==null?void 0:p.docs)==null?void 0:g.source},description:{story:"Default story showing a pulling artifact revision alert.",...(A=(f=a.parameters)==null?void 0:f.docs)==null?void 0:A.description}}};var v,R,y,k,b;r.parameters={...r.parameters,docs:{...(v=r.parameters)==null?void 0:v.docs,source:{originalSource:`{
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
}`,...(y=(R=r.parameters)==null?void 0:R.docs)==null?void 0:y.source},description:{story:"Story showing alert with onOk callback.",...(b=(k=r.parameters)==null?void 0:k.docs)==null?void 0:b.description}}};const se=["Default","WithCallback"];export{a as Default,r as WithCallback,se as __namedExportsOrder,le as default};
