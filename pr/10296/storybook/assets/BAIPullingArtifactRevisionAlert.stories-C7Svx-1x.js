import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-MKhVqBIO.js";import{n,t as r}from"./useBAIi18n-CouhYuVu.js";import{b as i,h as a,m as o,y as s}from"./iframe-DnpvlTFX.js";import{n as c,t as l}from"./BAIAlert-CfiaGjDe.js";import{n as u,t as d}from"./BAIFlex-DnaoYTJ1.js";import{t as f}from"./react-relay-sHama7hJ.js";import{n as p,t as m}from"./BAIButton-Di63xsXg.js";import{n as h,t as g}from"./RelayResolver-BnFyFQJn.js";var _;function v(){return(v=e((()=>{_={argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAIPullingArtifactRevisionAlertFragment`,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`fieldId`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`status`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`version`,storageKey:null}],type:`ArtifactRevision`,abstractKey:null},_.hash=`e6966f472baffdb60ebb71b731174e9e`})))()}var y;function b(){return(b=e((()=>{y=(function(){var e=[{defaultValue:null,kind:`LocalArgument`,name:`input`}],t=[{alias:null,args:[{kind:`Variable`,name:`input`,variableName:`input`}],concreteType:`CancelImportArtifactPayload`,kind:`LinkedField`,name:`cancelImportArtifact`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`artifactRevision`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`status`,storageKey:null}],storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:e,kind:`Fragment`,metadata:null,name:`BAIPullingArtifactRevisionAlertCancelMutation`,selections:t,type:`Mutation`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:e,kind:`Operation`,name:`BAIPullingArtifactRevisionAlertCancelMutation`,selections:t},params:{cacheID:`2b4debfb8df103ad97421b0869b31402`,id:null,metadata:{},name:`BAIPullingArtifactRevisionAlertCancelMutation`,operationKind:`mutation`,text:`mutation BAIPullingArtifactRevisionAlertCancelMutation(
  $input: CancelArtifactInput!
) {
  cancelImportArtifact(input: $input) {
    artifactRevision {
      id
      status
    }
  }
}
`}}})(),y.hash=`18b2b20bc4ed731fcd89e1469e73b49c`})))()}var x,S,C;function w(){return(w=e((()=>{v(),b(),i(),r(),c(),p(),u(),a(),x=f(),S=t(),C=({pullingArtifactRevisionFrgmt:e,onOk:t})=>{let{t:r}=n(),{modal:i,message:a}=s.useApp(),c=(0,x.useFragment)(_,e),[u,f]=(0,x.useMutation)(y);return(0,S.jsx)(l,{type:`info`,showIcon:!0,title:r(`comp:BAIPullingArtifactRevisionAlert.VersionIsPullingNow`,{version:c.version}),action:(0,S.jsx)(m,{type:`text`,onClick:()=>{i.confirm({title:r(`comp:BAIPullingArtifactRevisionAlert.CancelPull`),content:(0,S.jsxs)(d,{direction:`column`,align:`stretch`,children:[(0,S.jsxs)(o,{children:[r(`comp:BAIPullingArtifactRevisionAlert.YouAreAboutToCancelThisVersion`),`:`,(0,S.jsxs)(o,{strong:!0,children:[`\xA0`,c.version]})]}),(0,S.jsx)(`br`,{}),(0,S.jsxs)(o,{type:`danger`,children:[(0,S.jsxs)(o,{type:`danger`,strong:!0,children:[r(`comp:BAIPullingArtifactRevisionAlert.WARNING`),`:`]}),`\xA0`,r(`comp:BAIPullingArtifactRevisionAlert.CancelingWillRestartThePulling`)]})]}),cancelText:r(`general.button.Close`),okButtonProps:{danger:!0,loading:f},onOk:()=>{u({variables:{input:{artifactRevisionId:c.fieldId}},onCompleted:(e,n)=>{n&&n.length>0?n.forEach(e=>a.error(e.message??r(`comp:BAIPullingArtifactRevisionAlert.FailedToCancelThePulling`))):(t==null||t(),a.success(r(`comp:BAIPullingArtifactRevisionAlert.VersionPullCanceledSuccessfully`,{version:c.version})))},onError:e=>{a.error(e.message??r(`comp:BAIPullingArtifactRevisionAlert.FailedToCancelThePulling`))}})}})},children:r(`general.button.Cancel`)})})}})))()}var T;function E(){return(E=e((()=>{T=(function(){var e=[{kind:`Literal`,name:`id`,value:`test-id`}];return{fragment:{argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAIPullingArtifactRevisionAlertStoriesQuery`,selections:[{alias:null,args:e,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`artifactRevision`,plural:!1,selections:[{args:null,kind:`FragmentSpread`,name:`BAIPullingArtifactRevisionAlertFragment`}],storageKey:`artifactRevision(id:"test-id")`}],type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[],kind:`Operation`,name:`BAIPullingArtifactRevisionAlertStoriesQuery`,selections:[{alias:null,args:e,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`artifactRevision`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`fieldId`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`status`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`version`,storageKey:null}],storageKey:`artifactRevision(id:"test-id")`}]},params:{cacheID:`7ea13ce7a349644de23f406d2cd82136`,id:null,metadata:{},name:`BAIPullingArtifactRevisionAlertStoriesQuery`,operationKind:`query`,text:`query BAIPullingArtifactRevisionAlertStoriesQuery {
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
`}}})(),T.hash=`5879107e033d684c4cc44c48f350e669`})))()}var D,O,k,A,j,M,N,P,F,I,L,R,z;function B(){return(B=e((()=>{E(),h(),w(),D=f(),O=t(),F={title:`Fragments/BAIPullingArtifactRevisionAlert`,component:C,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:`
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
        `}}},argTypes:{pullingArtifactRevisionFrgmt:{control:!1,description:`Relay fragment reference for artifact revision`},onOk:{action:`onOk`,description:`Optional callback after successful cancellation`}},decorators:[e=>(0,O.jsx)(e,{})]},I=e=>{let{artifactRevision:t}=(0,D.useLazyLoadQuery)(T,{});return t&&(0,O.jsx)(C,{pullingArtifactRevisionFrgmt:t,...e})},L={name:`Basic`,parameters:{docs:{description:{story:`Displays an alert for an artifact revision being pulled. Click the Cancel button to see the confirmation modal.`}}},render:()=>(0,O.jsx)(g,{mockResolvers:{ArtifactRevision:()=>({id:`QXJ0aWZhY3RSZXZpc2lvbjox`,status:`PULLING`,version:`v1.2.3`})},children:(0,O.jsx)(I,{})})},R={parameters:{docs:{description:{story:`Demonstrates the onOk callback being triggered after successful cancellation. Check the Actions panel.`}}},render:e=>(0,O.jsx)(g,{mockResolvers:{ArtifactRevision:()=>({id:`QXJ0aWZhY3RSZXZpc2lvbjoy`,status:`PULLING`,version:`v2.0.0-beta.1`})},children:(0,O.jsx)(I,{onOk:e.onOk})})},L.parameters={...L.parameters,docs:{...(k=L.parameters)==null?void 0:k.docs,source:{originalSource:`{
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
}`,...(A=L.parameters)==null||(A=A.docs)==null?void 0:A.source},description:{story:`Default story showing a pulling artifact revision alert.`,...(j=L.parameters)==null||(j=j.docs)==null?void 0:j.description}}},R.parameters={...R.parameters,docs:{...(M=R.parameters)==null?void 0:M.docs,source:{originalSource:`{
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
}`,...(N=R.parameters)==null||(N=N.docs)==null?void 0:N.source},description:{story:`Story showing alert with onOk callback.`,...(P=R.parameters)==null||(P=P.docs)==null?void 0:P.description}}},z=[`Default`,`WithCallback`]})))()}B();export{L as Default,R as WithCallback,z as __namedExportsOrder,F as default};