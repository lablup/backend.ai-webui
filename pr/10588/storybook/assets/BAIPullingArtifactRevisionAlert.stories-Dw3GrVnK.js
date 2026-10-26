import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-MKhVqBIO.js";import{n,t as r}from"./useBAIi18n-Biey1teG.js";import{b as i,h as a,m as o,y as s}from"./iframe-DHcqzLLD.js";import{n as c,t as l}from"./BAIAlert-DjqA4pRR.js";import{n as u,t as d}from"./BAIFlex-BOFoS5KY.js";import{t as f}from"./react-relay-sBALIJlt.js";import{c as p,h as m}from"./helper-CVvTx27U.js";import{n as h,t as g}from"./BAIButton-BkLrwIfz.js";import{n as _,t as v}from"./RelayResolver-CMrgwoPg.js";var y;function b(){return(b=e((()=>{y={argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAIPullingArtifactRevisionAlertFragment`,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`status`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`version`,storageKey:null}],type:`ArtifactRevision`,abstractKey:null},y.hash=`8481a07489849ce66e12a3a734be08b5`})))()}var x;function S(){return(S=e((()=>{x=(function(){var e=[{defaultValue:null,kind:`LocalArgument`,name:`input`}],t=[{alias:null,args:[{kind:`Variable`,name:`input`,variableName:`input`}],concreteType:`CancelImportArtifactPayload`,kind:`LinkedField`,name:`cancelImportArtifact`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`artifactRevision`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`status`,storageKey:null}],storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:e,kind:`Fragment`,metadata:null,name:`BAIPullingArtifactRevisionAlertCancelMutation`,selections:t,type:`Mutation`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:e,kind:`Operation`,name:`BAIPullingArtifactRevisionAlertCancelMutation`,selections:t},params:{cacheID:`2b4debfb8df103ad97421b0869b31402`,id:null,metadata:{},name:`BAIPullingArtifactRevisionAlertCancelMutation`,operationKind:`mutation`,text:`mutation BAIPullingArtifactRevisionAlertCancelMutation(
  $input: CancelArtifactInput!
) {
  cancelImportArtifact(input: $input) {
    artifactRevision {
      id
      status
    }
  }
}
`}}})(),x.hash=`18b2b20bc4ed731fcd89e1469e73b49c`})))()}var C,w,T;function E(){return(E=e((()=>{b(),S(),i(),p(),r(),c(),h(),u(),a(),C=f(),w=t(),T=({pullingArtifactRevisionFrgmt:e,onOk:t})=>{let{t:r}=n(),{modal:i,message:a}=s.useApp(),c=(0,C.useFragment)(y,e),[u,f]=(0,C.useMutation)(x);return(0,w.jsx)(l,{type:`info`,showIcon:!0,title:r(`comp:BAIPullingArtifactRevisionAlert.VersionIsPullingNow`,{version:c.version}),action:(0,w.jsx)(g,{type:`text`,onClick:()=>{i.confirm({title:r(`comp:BAIPullingArtifactRevisionAlert.CancelPull`),content:(0,w.jsxs)(d,{direction:`column`,align:`stretch`,children:[(0,w.jsxs)(o,{children:[r(`comp:BAIPullingArtifactRevisionAlert.YouAreAboutToCancelThisVersion`),`:`,(0,w.jsxs)(o,{strong:!0,children:[`\xA0`,c.version]})]}),(0,w.jsx)(`br`,{}),(0,w.jsxs)(o,{type:`danger`,children:[(0,w.jsxs)(o,{type:`danger`,strong:!0,children:[r(`comp:BAIPullingArtifactRevisionAlert.WARNING`),`:`]}),`\xA0`,r(`comp:BAIPullingArtifactRevisionAlert.CancelingWillRestartThePulling`)]})]}),cancelText:r(`general.button.Close`),okButtonProps:{danger:!0,loading:f},onOk:()=>{u({variables:{input:{artifactRevisionId:m(c.id)}},onCompleted:(e,n)=>{n&&n.length>0?n.forEach(e=>a.error(e.message??r(`comp:BAIPullingArtifactRevisionAlert.FailedToCancelThePulling`))):(t?.(),a.success(r(`comp:BAIPullingArtifactRevisionAlert.VersionPullCanceledSuccessfully`,{version:c.version})))},onError:e=>{a.error(e.message??r(`comp:BAIPullingArtifactRevisionAlert.FailedToCancelThePulling`))}})}})},children:r(`general.button.Cancel`)})})}})))()}var D;function O(){return(O=e((()=>{D=(function(){var e=[{kind:`Literal`,name:`id`,value:`test-id`}];return{fragment:{argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAIPullingArtifactRevisionAlertStoriesQuery`,selections:[{alias:null,args:e,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`artifactRevision`,plural:!1,selections:[{args:null,kind:`FragmentSpread`,name:`BAIPullingArtifactRevisionAlertFragment`}],storageKey:`artifactRevision(id:"test-id")`}],type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[],kind:`Operation`,name:`BAIPullingArtifactRevisionAlertStoriesQuery`,selections:[{alias:null,args:e,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`artifactRevision`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`status`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`version`,storageKey:null}],storageKey:`artifactRevision(id:"test-id")`}]},params:{cacheID:`48eef0100b716d30964bc30242bb953a`,id:null,metadata:{},name:`BAIPullingArtifactRevisionAlertStoriesQuery`,operationKind:`query`,text:`query BAIPullingArtifactRevisionAlertStoriesQuery {
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
`}}})(),D.hash=`5879107e033d684c4cc44c48f350e669`})))()}var k,A,j,M,N,P,F;function I(){return(I=e((()=>{O(),_(),E(),k=f(),A=t(),j={title:`Fragments/BAIPullingArtifactRevisionAlert`,component:T,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:`
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
        `}}},argTypes:{pullingArtifactRevisionFrgmt:{control:!1,description:`Relay fragment reference for artifact revision`},onOk:{action:`onOk`,description:`Optional callback after successful cancellation`}},decorators:[e=>(0,A.jsx)(e,{})]},M=e=>{let{artifactRevision:t}=(0,k.useLazyLoadQuery)(D,{});return t&&(0,A.jsx)(T,{pullingArtifactRevisionFrgmt:t,...e})},N={name:`Basic`,parameters:{docs:{description:{story:`Displays an alert for an artifact revision being pulled. Click the Cancel button to see the confirmation modal.`}}},render:()=>(0,A.jsx)(v,{mockResolvers:{ArtifactRevision:()=>({id:`QXJ0aWZhY3RSZXZpc2lvbjox`,status:`PULLING`,version:`v1.2.3`})},children:(0,A.jsx)(M,{})})},P={parameters:{docs:{description:{story:`Demonstrates the onOk callback being triggered after successful cancellation. Check the Actions panel.`}}},render:e=>(0,A.jsx)(v,{mockResolvers:{ArtifactRevision:()=>({id:`QXJ0aWZhY3RSZXZpc2lvbjoy`,status:`PULLING`,version:`v2.0.0-beta.1`})},children:(0,A.jsx)(M,{onOk:e.onOk})})},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
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
}`,...N.parameters?.docs?.source},description:{story:`Default story showing a pulling artifact revision alert.`,...N.parameters?.docs?.description}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
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
}`,...P.parameters?.docs?.source},description:{story:`Story showing alert with onOk callback.`,...P.parameters?.docs?.description}}},F=[`Default`,`WithCallback`]})))()}I();export{N as Default,P as WithCallback,F as __namedExportsOrder,j as default};