import{n as e}from"./rolldown-runtime-2s6bX4vc.js";import{n as t,t as n}from"./useBAIi18n-BoXCk5K0.js";import{c as r,d as i,s as a,u as o}from"./iframe-DR2sIF5r.js";import{n as s,t as c}from"./BAIAlert-BINqT0IN.js";import{n as l,t as u}from"./BAIFlex-CAz1t6J5.js";import{n as d,t as f}from"./BAIButton-C-o5ANgR.js";import{n as p,t as m}from"./RelayResolver-b1nJU57O.js";import{jsx as h,jsxs as g}from"react/jsx-runtime";import{useFragment as _,useLazyLoadQuery as v,useMutation as y}from"react-relay";var b;function x(){return(x=e((()=>{b={argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAIPullingArtifactRevisionAlertFragment`,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`fieldId`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`status`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`version`,storageKey:null}],type:`ArtifactRevision`,abstractKey:null},b.hash=`e6966f472baffdb60ebb71b731174e9e`})))()}var S;function C(){return(C=e((()=>{S=(function(){var e=[{defaultValue:null,kind:`LocalArgument`,name:`input`}],t=[{alias:null,args:[{kind:`Variable`,name:`input`,variableName:`input`}],concreteType:`CancelImportArtifactPayload`,kind:`LinkedField`,name:`cancelImportArtifact`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`artifactRevision`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`status`,storageKey:null}],storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:e,kind:`Fragment`,metadata:null,name:`BAIPullingArtifactRevisionAlertCancelMutation`,selections:t,type:`Mutation`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:e,kind:`Operation`,name:`BAIPullingArtifactRevisionAlertCancelMutation`,selections:t},params:{cacheID:`2b4debfb8df103ad97421b0869b31402`,id:null,metadata:{},name:`BAIPullingArtifactRevisionAlertCancelMutation`,operationKind:`mutation`,text:`mutation BAIPullingArtifactRevisionAlertCancelMutation(
  $input: CancelArtifactInput!
) {
  cancelImportArtifact(input: $input) {
    artifactRevision {
      id
      status
    }
  }
}
`}}})(),S.hash=`18b2b20bc4ed731fcd89e1469e73b49c`})))()}var w;function T(){return(T=e((()=>{x(),C(),i(),n(),s(),d(),l(),r(),w=({pullingArtifactRevisionFrgmt:e,onOk:n})=>{let{t:r}=t(),{modal:i,message:s}=o.useApp(),l=_(b,e),[d,p]=y(S);return h(c,{type:`info`,showIcon:!0,title:r(`comp:BAIPullingArtifactRevisionAlert.VersionIsPullingNow`,{version:l.version}),action:h(f,{type:`text`,onClick:()=>{i.confirm({title:r(`comp:BAIPullingArtifactRevisionAlert.CancelPull`),content:g(u,{direction:`column`,align:`stretch`,children:[g(a,{children:[r(`comp:BAIPullingArtifactRevisionAlert.YouAreAboutToCancelThisVersion`),`:`,g(a,{strong:!0,children:[`\xA0`,l.version]})]}),h(`br`,{}),g(a,{type:`danger`,children:[g(a,{type:`danger`,strong:!0,children:[r(`comp:BAIPullingArtifactRevisionAlert.WARNING`),`:`]}),`\xA0`,r(`comp:BAIPullingArtifactRevisionAlert.CancelingWillRestartThePulling`)]})]}),cancelText:r(`general.button.Close`),okButtonProps:{danger:!0,loading:p},onOk:()=>{d({variables:{input:{artifactRevisionId:l.fieldId}},onCompleted:(e,t)=>{t&&t.length>0?t.forEach(e=>s.error(e.message??r(`comp:BAIPullingArtifactRevisionAlert.FailedToCancelThePulling`))):(n?.(),s.success(r(`comp:BAIPullingArtifactRevisionAlert.VersionPullCanceledSuccessfully`,{version:l.version})))},onError:e=>{s.error(e.message??r(`comp:BAIPullingArtifactRevisionAlert.FailedToCancelThePulling`))}})}})},children:r(`general.button.Cancel`)})})}})))()}var E;function D(){return(D=e((()=>{E=(function(){var e=[{kind:`Literal`,name:`id`,value:`test-id`}];return{fragment:{argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAIPullingArtifactRevisionAlertStoriesQuery`,selections:[{alias:null,args:e,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`artifactRevision`,plural:!1,selections:[{args:null,kind:`FragmentSpread`,name:`BAIPullingArtifactRevisionAlertFragment`}],storageKey:`artifactRevision(id:"test-id")`}],type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[],kind:`Operation`,name:`BAIPullingArtifactRevisionAlertStoriesQuery`,selections:[{alias:null,args:e,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`artifactRevision`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`fieldId`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`status`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`version`,storageKey:null}],storageKey:`artifactRevision(id:"test-id")`}]},params:{cacheID:`7ea13ce7a349644de23f406d2cd82136`,id:null,metadata:{},name:`BAIPullingArtifactRevisionAlertStoriesQuery`,operationKind:`query`,text:`query BAIPullingArtifactRevisionAlertStoriesQuery {
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
`}}})(),E.hash=`5879107e033d684c4cc44c48f350e669`})))()}var O,k,A,j,M;function N(){return(N=e((()=>{D(),p(),T(),O={title:`Fragments/BAIPullingArtifactRevisionAlert`,component:w,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:`
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
        `}}},argTypes:{pullingArtifactRevisionFrgmt:{control:!1,description:`Relay fragment reference for artifact revision`},onOk:{action:`onOk`,description:`Optional callback after successful cancellation`}},decorators:[e=>h(e,{})]},k=e=>{let{artifactRevision:t}=v(E,{});return t&&h(w,{pullingArtifactRevisionFrgmt:t,...e})},A={name:`Basic`,parameters:{docs:{description:{story:`Displays an alert for an artifact revision being pulled. Click the Cancel button to see the confirmation modal.`}}},render:()=>h(m,{mockResolvers:{ArtifactRevision:()=>({id:`QXJ0aWZhY3RSZXZpc2lvbjox`,status:`PULLING`,version:`v1.2.3`})},children:h(k,{})})},j={parameters:{docs:{description:{story:`Demonstrates the onOk callback being triggered after successful cancellation. Check the Actions panel.`}}},render:e=>h(m,{mockResolvers:{ArtifactRevision:()=>({id:`QXJ0aWZhY3RSZXZpc2lvbjoy`,status:`PULLING`,version:`v2.0.0-beta.1`})},children:h(k,{onOk:e.onOk})})},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
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
}`,...A.parameters?.docs?.source},description:{story:`Default story showing a pulling artifact revision alert.`,...A.parameters?.docs?.description}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
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
}`,...j.parameters?.docs?.source},description:{story:`Story showing alert with onOk callback.`,...j.parameters?.docs?.description}}},M=[`Default`,`WithCallback`]})))()}N();export{A as Default,j as WithCallback,M as __namedExportsOrder,O as default};