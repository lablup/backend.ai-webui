import{b as ee,aN as ne,j as e,B as M,bG as R,r as te}from"./iframe-CL7gxDZj.js";import{R as k}from"./RelayResolver-BNO84kw2.js";import{B as ie}from"./BAIButton-C-0gCoxD.js";import{B as G}from"./BAIFlex-CXz0AZ6l.js";import{a as ae,d as se,f as re,t as oe}from"./index-B6J0DT_y.js";import{B as le}from"./BAIAlert-DLNgnn8d.js";import{B as ce}from"./BAIModal-Ci80u6T-.js";import{B as de}from"./BAIQuestionIconWithTooltip-DsSr7mw1.js";import{B as ue}from"./BAIUnmountAfterClose-De8JKJV6.js";import{B as me}from"./BAIArtifactDescriptions-DCYBRk_3.js";import{r as h}from"./index-BrWOE613.js";import{B as pe}from"./BAITable-BBAWDe6g.js";import{i as fe}from"./isEmpty-AW6KL3QE.js";import{M as ve}from"./index-ByVtQ-qE.js";import"./preload-helper-Dp1pzeXC.js";import"./index-B6ozbOje.js";import"./astryxLabel-UiL2YHAO.js";import"./isNumber-DxzprNrZ.js";import"./toString-CBCtgz1Z.js";import"./isSymbol-BS2xVMGY.js";import"./filter-DVA3r-hQ.js";import"./_baseEach-CSBkbyrA.js";import"./get-CZb3tCEy.js";import"./_baseGet-DWxs046T.js";import"./identity-DKeuBCMA.js";import"./Banner-DlxMf04L.js";import"./isRenderable-BUV0eL6r.js";import"./composeEventHandlers-BolWE7qY.js";/* empty css                 */import"./VStack-2MZkE6dj.js";import"./astryxPlacement-BxR6_qos.js";import"./BAIIconWithTooltip-DWMehpay.js";import"./IconWithTooltip2-D0ouVERf.js";import"./BAILink-Cz5NX3uc.js";import"./BAIMetadataList-CRumFSSp.js";import"./BAIArtifactTypeToken-BWsa4ajU.js";import"./Token-D0MKNqnL.js";import"./DataGrid2-BEHpKMuu.js";import"./flatMap-BY3NFlzm.js";import"./_baseFlatten-BPZSTBPw.js";import"./map-BdIEQFnI.js";import"./castArray-ufwSILLR.js";import"./TextInput-DsbFAhlD.js";import"./InputGroupContext-Cj00u4YI.js";import"./FieldStatus-CqsBaKvU.js";import"./useInputStatusIcon-EB7oCpjK.js";import"./useResolvedRequired-DbSsxOSW.js";import"./InputClearButton-qaNYZtp6.js";import"./useDevWarning-CYjNHf_l.js";import"./CheckboxInput-Pc6u6DFZ.js";import"./useIndicator-6MxkXWuS.js";import"./rtlStyles-T4i24HtE.js";import"./characters-DWaYg7k3.js";import"./renderDropdownItems-BUefcFR1.js";import"./Divider-BIYBQTng.js";import"./Item-T8DT8Bpf.js";import"./useListFocus-Cpjsrd4B.js";import"./isRtlElement-B2-7SF8s.js";import"./useMenuHover-C2PIZlSo.js";import"./useFocusReturnVisibility-DpMvjDAg.js";import"./EmptyState-AyUsNJjN.js";import"./Selector-DjnrHB8q.js";import"./SelectorOption-C7ggK8lv.js";import"./usePopover-DgVj0SSk.js";import"./NumberInput-ccaqTv5V.js";import"./settings-okGq8Z-T.js";import"./find-BmbEl-9z.js";import"./_baseFindIndex-Cj99RmFE.js";import"./toInteger-hmVt6p8B.js";import"./toFinite-B8rvAiZr.js";import"./toNumber-BI2CEct6.js";import"./_trimmedEndIndex-DuQxD0U0.js";const U=(function(){var t=[{defaultValue:null,kind:"LocalArgument",name:"input"}],i=[{kind:"Variable",name:"input",variableName:"input"}],a={alias:null,args:null,kind:"ScalarField",name:"status",storageKey:null};return{fragment:{argumentDefinitions:t,kind:"Fragment",metadata:null,name:"BAIDeleteArtifactRevisionsModalCleanupVersionMutation",selections:[{alias:null,args:i,concreteType:"CleanupArtifactRevisionsPayload",kind:"LinkedField",name:"cleanupArtifactRevisions",plural:!1,selections:[{alias:null,args:null,concreteType:"ArtifactRevisionConnection",kind:"LinkedField",name:"artifactRevisions",plural:!1,selections:[{alias:null,args:null,concreteType:"ArtifactRevisionEdge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"ArtifactRevision",kind:"LinkedField",name:"node",plural:!1,selections:[a],storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}],type:"Mutation",abstractKey:null},kind:"Request",operation:{argumentDefinitions:t,kind:"Operation",name:"BAIDeleteArtifactRevisionsModalCleanupVersionMutation",selections:[{alias:null,args:i,concreteType:"CleanupArtifactRevisionsPayload",kind:"LinkedField",name:"cleanupArtifactRevisions",plural:!1,selections:[{alias:null,args:null,concreteType:"ArtifactRevisionConnection",kind:"LinkedField",name:"artifactRevisions",plural:!1,selections:[{alias:null,args:null,concreteType:"ArtifactRevisionEdge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"ArtifactRevision",kind:"LinkedField",name:"node",plural:!1,selections:[a,{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}]},params:{cacheID:"03897a25039ccf906a0013edbae95224",id:null,metadata:{},name:"BAIDeleteArtifactRevisionsModalCleanupVersionMutation",operationKind:"mutation",text:`mutation BAIDeleteArtifactRevisionsModalCleanupVersionMutation(
  $input: CleanupArtifactRevisionsInput!
) {
  cleanupArtifactRevisions(input: $input) {
    artifactRevisions {
      edges {
        node {
          status
          id
        }
      }
    }
  }
}
`}}})();U.hash="a1b18aa3dacff842d5e39ba15c4e3994";const V={argumentDefinitions:[],kind:"Fragment",metadata:null,name:"BAIDeleteArtifactRevisionsModalArtifactFragment",selections:[{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null},{args:null,kind:"FragmentSpread",name:"BAIArtifactDescriptionsFragment"}],type:"Artifact",abstractKey:null};V.hash="8eac061158289fcc677ac78d52d22410";const O={argumentDefinitions:[],kind:"Fragment",metadata:{plural:!0},name:"BAIDeleteArtifactRevisionsModalArtifactRevisionFragment",selections:[{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"version",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"size",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"status",storageKey:null}],type:"ArtifactRevision",abstractKey:null};O.hash="26bb2a6744453c3301f6e2e94a0922c3";const $=({selectedArtifactFrgmt:t,selectedArtifactRevisionFrgmt:i,onOk:a,onCancel:r,...l})=>{const{t:n}=ee(),{token:c}=ne(),[v,d]=h.useMutation(U),g=h.useFragment(V,t),A=h.useFragment(O,i),y=A.filter(s=>s.status!=="PULLING"&&s.status!=="SCANNED"),q=[{title:n("comp:BAIDeleteArtifactModal.Version"),dataIndex:"version",key:"version",render:s=>e.jsx(M,{monospace:!0,children:s}),width:"50%"},{title:n("comp:BAIDeleteArtifactModal.Size"),dataIndex:"size",key:"size",render:s=>{var o;return e.jsx(M,{monospace:!0,children:s?(o=ae(s,"auto"))==null?void 0:o.displayValue:"N/A"})}}];return e.jsx(ue,{children:e.jsx(ce,{title:n("comp:BAIDeleteArtifactModal.RemoveVersions"),centered:!0,onOk:s=>{v({variables:{input:{artifactRevisionIds:y.map(o=>oe(o.id))}},onCompleted:(o,D)=>{if(D&&D.length>0){D.forEach(H=>{R.error(H.message??n("comp:BAIDeleteArtifactModal.FailedToRemoveVersions"))});return}const S=o.cleanupArtifactRevisions;if(!S){R.error(n("comp:BAIDeleteArtifactModal.FailedToRemoveVersions"));return}R.success(n("comp:BAIDeleteArtifactModal.SuccessFullyRemoved",{count:S.artifactRevisions.edges.length})),a(s)},onError:o=>{R.error(o.message??n("comp:BAIDeleteArtifactModal.FailedToRemoveVersions"))}})},onCancel:s=>{r(s)},okText:n("general.button.Remove"),cancelText:n("general.button.Cancel"),okButtonProps:{danger:!0,loading:d,disabled:fe(y)||d},...l,children:e.jsxs(G,{direction:"column",gap:"sm",align:"stretch",children:[y.length!==A.length?e.jsx(le,{icon:e.jsx(de,{title:n("comp:BAIDeleteArtifactModal.OnlyVersionsNotInPULLINGOrSCANNED"),iconProps:{style:{color:c("--color-info")}},style:{marginRight:c("--spacing-2")}}),showIcon:!0,title:n("comp:BAIDeleteArtifactModal.ExcludedVersions",{count:A.length-y.length})}):null,g&&e.jsx(me,{artifactFrgmt:g}),e.jsx(pe,{columns:re(q),dataSource:se(A),pagination:{showSizeChanger:!1}})]})})})},_=(function(){var t={kind:"Literal",name:"offset",value:0},i=[{kind:"Literal",name:"first",value:1},t],a=[{kind:"Literal",name:"first",value:10},t],r={alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null},l={alias:null,args:null,kind:"ScalarField",name:"name",storageKey:null};return{fragment:{argumentDefinitions:[],kind:"Fragment",metadata:null,name:"BAIDeleteArtifactRevisionsModalStoriesQuery",selections:[{alias:null,args:i,concreteType:"ArtifactConnection",kind:"LinkedField",name:"artifacts",plural:!1,selections:[{alias:null,args:null,concreteType:"ArtifactEdge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"Artifact",kind:"LinkedField",name:"node",plural:!1,selections:[{args:null,kind:"FragmentSpread",name:"BAIDeleteArtifactRevisionsModalArtifactFragment"}],storageKey:null}],storageKey:null}],storageKey:"artifacts(first:1,offset:0)"},{alias:null,args:a,concreteType:"ArtifactRevisionConnection",kind:"LinkedField",name:"artifactRevisions",plural:!1,selections:[{alias:null,args:null,concreteType:"ArtifactRevisionEdge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"ArtifactRevision",kind:"LinkedField",name:"node",plural:!1,selections:[{args:null,kind:"FragmentSpread",name:"BAIDeleteArtifactRevisionsModalArtifactRevisionFragment"}],storageKey:null}],storageKey:null}],storageKey:"artifactRevisions(first:10,offset:0)"}],type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[],kind:"Operation",name:"BAIDeleteArtifactRevisionsModalStoriesQuery",selections:[{alias:null,args:i,concreteType:"ArtifactConnection",kind:"LinkedField",name:"artifacts",plural:!1,selections:[{alias:null,args:null,concreteType:"ArtifactEdge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"Artifact",kind:"LinkedField",name:"node",plural:!1,selections:[r,l,{alias:null,args:null,kind:"ScalarField",name:"description",storageKey:null},{alias:null,args:null,concreteType:"SourceInfo",kind:"LinkedField",name:"source",plural:!1,selections:[l,{alias:null,args:null,kind:"ScalarField",name:"url",storageKey:null}],storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"type",storageKey:null}],storageKey:null}],storageKey:null}],storageKey:"artifacts(first:1,offset:0)"},{alias:null,args:a,concreteType:"ArtifactRevisionConnection",kind:"LinkedField",name:"artifactRevisions",plural:!1,selections:[{alias:null,args:null,concreteType:"ArtifactRevisionEdge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"ArtifactRevision",kind:"LinkedField",name:"node",plural:!1,selections:[r,{alias:null,args:null,kind:"ScalarField",name:"version",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"size",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"status",storageKey:null}],storageKey:null}],storageKey:null}],storageKey:"artifactRevisions(first:10,offset:0)"}]},params:{cacheID:"dce7be04285aeb014d5359c8a8e882f6",id:null,metadata:{},name:"BAIDeleteArtifactRevisionsModalStoriesQuery",operationKind:"query",text:`query BAIDeleteArtifactRevisionsModalStoriesQuery {
  artifacts(offset: 0, first: 1) {
    edges {
      node {
        ...BAIDeleteArtifactRevisionsModalArtifactFragment
        id
      }
    }
  }
  artifactRevisions(offset: 0, first: 10) {
    edges {
      node {
        ...BAIDeleteArtifactRevisionsModalArtifactRevisionFragment
        id
      }
    }
  }
}

fragment BAIArtifactDescriptionsFragment on Artifact {
  name
  description
  source {
    name
    url
  }
  ...BAIArtifactTypeTokenFragment
}

fragment BAIArtifactTypeTokenFragment on Artifact {
  type
}

fragment BAIDeleteArtifactRevisionsModalArtifactFragment on Artifact {
  id
  ...BAIArtifactDescriptionsFragment
}

fragment BAIDeleteArtifactRevisionsModalArtifactRevisionFragment on ArtifactRevision {
  id
  version
  size
  status
}
`}}})();_.hash="219164404d6fd8910ca00a4e7fff6816";const Cn={title:"Fragments/BAIDeleteArtifactRevisionsModal",component:$,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:`
**BAIDeleteArtifactRevisionsModal** is a modal for deleting artifact revisions with table view and filtering.

## BAI-Specific Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`selectedArtifactFrgmt\` | \`BAIDeleteArtifactRevisionsModalArtifactFragment$key \\| null\` | - | GraphQL fragment reference for artifact data |
| \`selectedArtifactRevisionFrgmt\` | \`BAIDeleteArtifactRevisionsModalArtifactRevisionFragment$key\` | - | GraphQL fragment reference for artifact revisions (required) |
| \`onOk\` | \`(e: React.MouseEvent) => void\` | - | Called after successful mutation completion (not on button click) |
| \`onCancel\` | \`(e: React.MouseEvent) => void\` | - | Called when modal is cancelled |

## Features
- **Revision Table**: Shows version and size columns for selected revisions
- **Status Filtering**: Automatically filters out PULLING and SCANNED status revisions
- **Exclusion Alert**: Displays alert when some revisions are excluded from deletion
- **Artifact Info**: Shows artifact description (name, type, architecture)
- **Mutation Integration**: Uses \`cleanupArtifactRevisions\` mutation
- **Success/Error Handling**: Displays success/error messages via Ant Design message component
- **Loading State**: Remove button shows loading state during mutation execution
- **Danger Button**: Remove button is styled as danger (red) to indicate destructive action
- **Smart Disabling**: Button disabled when no deletable revisions or during execution

## Usage Pattern
The modal is typically used with artifact revision selection:
1. User selects one or more artifact revisions
2. Clicks "Remove" button
3. Modal shows table of selected revisions with artifact info
4. Revisions with PULLING or SCANNED status are filtered out with alert
5. On Remove, mutation executes and modal closes on success

For other props, refer to [Ant Design Modal](https://ant.design/components/modal).

## Storybook
Mutation is mocked and will execute successfully, closing the modal on completion.
        `}}},argTypes:{selectedArtifactFrgmt:{control:!1,description:"GraphQL fragment reference for artifact data (can be null)",table:{type:{summary:"BAIDeleteArtifactRevisionsModalArtifactFragment$key | null"}}},selectedArtifactRevisionFrgmt:{control:!1,description:"GraphQL fragment reference for artifact revisions",table:{type:{summary:"BAIDeleteArtifactRevisionsModalArtifactRevisionFragment$key"}}},open:{control:!1,description:"Whether the modal is visible (managed by parent component)",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},onOk:{control:!1,description:"Called after successful mutation completion",table:{type:{summary:"(e: React.MouseEvent) => void"}}},onCancel:{control:!1,description:"Called when modal is cancelled",table:{type:{summary:"(e: React.MouseEvent) => void"}}}},decorators:[t=>e.jsx(ve,{children:e.jsx(t,{})})]},Z=()=>{var c,v,d;const[t,i]=te.useState(!1),{artifacts:a,artifactRevisions:r}=h.useLazyLoadQuery(_,{}),l=(v=(c=a==null?void 0:a.edges)==null?void 0:c[0])==null?void 0:v.node,n=(d=r==null?void 0:r.edges)==null?void 0:d.map(g=>g.node);return n&&n.length>0&&e.jsxs(G,{direction:"column",gap:"md",children:[e.jsx(ie,{onClick:()=>i(!0),children:"Open Modal"}),e.jsx($,{selectedArtifactFrgmt:l??null,selectedArtifactRevisionFrgmt:n,open:t,onOk:()=>i(!1),onCancel:()=>i(!1)})]})},u={name:"Basic",parameters:{docs:{description:{story:"Delete multiple artifact revisions. The modal displays a table with version and size columns."}}},render:()=>e.jsx(k,{mockResolvers:{Artifact:()=>({id:"QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==",name:"my-model",type:"model",architecture:"x86_64",description:"A trained machine learning model",source:{name:"HuggingFace",url:"https://huggingface.co/my-model"}}),ArtifactRevisionConnection:()=>({edges:[{node:{id:"QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMQ==",version:"v1.0.0",size:"1073741824",status:"READY"}},{node:{id:"QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMg==",version:"v1.1.0",size:"2147483648",status:"READY"}},{node:{id:"QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMw==",version:"v2.0.0",size:"3221225472",status:"READY"}}]}),CleanupArtifactRevisionsPayload:()=>({artifactRevisions:{edges:[]}})},children:e.jsx(Z,{})})},m={name:"WithExcludedRevisions",parameters:{docs:{description:{story:"Some revisions are excluded from deletion due to PULLING or SCANNED status. An alert shows how many are excluded."}}},render:()=>e.jsx(k,{mockResolvers:{Artifact:()=>({id:"QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==",name:"dataset-train",type:"dataset",architecture:"aarch64",description:"Training dataset for ML model",source:{name:"S3 Bucket",url:"https://s3.amazonaws.com/datasets/train"}}),ArtifactRevisionConnection:()=>({edges:[{node:{id:"QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMQ==",version:"v1.0.0",size:"1073741824",status:"READY"}},{node:{id:"QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMg==",version:"v1.1.0",size:"2147483648",status:"PULLING"}},{node:{id:"QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMw==",version:"v2.0.0",size:"3221225472",status:"SCANNED"}},{node:{id:"QXJ0aWZhY3RSZXZpc2lvbjpyZXYtNA==",version:"v2.1.0",size:"4294967296",status:"READY"}}]}),CleanupArtifactRevisionsPayload:()=>({artifactRevisions:{edges:[]}})},children:e.jsx(Z,{})})},p={name:"SingleRevision",parameters:{docs:{description:{story:"Delete a single artifact revision."}}},render:()=>e.jsx(k,{mockResolvers:{Artifact:()=>({id:"QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==",name:"config-file",type:"other",architecture:"noarch",description:"Configuration file",source:{name:"Local",url:""}}),ArtifactRevisionConnection:()=>({edges:[{node:{id:"QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMQ==",version:"latest",size:"1024",status:"READY"}}]}),CleanupArtifactRevisionsPayload:()=>({artifactRevisions:{edges:[]}})},children:e.jsx(Z,{})})},f={name:"AllExcluded",parameters:{docs:{description:{story:"All revisions are in PULLING or SCANNED status, so the Remove button is disabled."}}},render:()=>e.jsx(k,{mockResolvers:{Artifact:()=>({id:"QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==",name:"in-progress-model",type:"model",architecture:"x86_64",description:"Model currently being processed",source:{name:"GitHub",url:"https://github.com/org/model"}}),ArtifactRevisionConnection:()=>({edges:[{node:{id:"QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMQ==",version:"v1.0.0",size:"1073741824",status:"PULLING"}},{node:{id:"QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMg==",version:"v2.0.0",size:"2147483648",status:"SCANNED"}}]}),CleanupArtifactRevisionsPayload:()=>({artifactRevisions:{edges:[]}})},children:e.jsx(Z,{})})};var F,Q,X,Y,b;u.parameters={...u.parameters,docs:{...(F=u.parameters)==null?void 0:F.docs,source:{originalSource:`{
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'Delete multiple artifact revisions. The modal displays a table with version and size columns.'
      }
    }
  },
  render: () => <RelayResolver mockResolvers={{
    Artifact: () => ({
      id: 'QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==',
      name: 'my-model',
      type: 'model',
      architecture: 'x86_64',
      description: 'A trained machine learning model',
      source: {
        name: 'HuggingFace',
        url: 'https://huggingface.co/my-model'
      }
    }),
    ArtifactRevisionConnection: () => ({
      edges: [{
        node: {
          id: 'QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMQ==',
          version: 'v1.0.0',
          size: '1073741824',
          // 1GB
          status: 'READY'
        }
      }, {
        node: {
          id: 'QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMg==',
          version: 'v1.1.0',
          size: '2147483648',
          // 2GB
          status: 'READY'
        }
      }, {
        node: {
          id: 'QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMw==',
          version: 'v2.0.0',
          size: '3221225472',
          // 3GB
          status: 'READY'
        }
      }]
    }),
    CleanupArtifactRevisionsPayload: () => ({
      artifactRevisions: {
        edges: []
      }
    })
  }}>
      <QueryResolver />
    </RelayResolver>
}`,...(X=(Q=u.parameters)==null?void 0:Q.docs)==null?void 0:X.source},description:{story:"Multiple revisions deletion",...(b=(Y=u.parameters)==null?void 0:Y.docs)==null?void 0:b.description}}};var I,B,x,L,C;m.parameters={...m.parameters,docs:{...(I=m.parameters)==null?void 0:I.docs,source:{originalSource:`{
  name: 'WithExcludedRevisions',
  parameters: {
    docs: {
      description: {
        story: 'Some revisions are excluded from deletion due to PULLING or SCANNED status. An alert shows how many are excluded.'
      }
    }
  },
  render: () => <RelayResolver mockResolvers={{
    Artifact: () => ({
      id: 'QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==',
      name: 'dataset-train',
      type: 'dataset',
      architecture: 'aarch64',
      description: 'Training dataset for ML model',
      source: {
        name: 'S3 Bucket',
        url: 'https://s3.amazonaws.com/datasets/train'
      }
    }),
    ArtifactRevisionConnection: () => ({
      edges: [{
        node: {
          id: 'QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMQ==',
          version: 'v1.0.0',
          size: '1073741824',
          status: 'READY'
        }
      }, {
        node: {
          id: 'QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMg==',
          version: 'v1.1.0',
          size: '2147483648',
          status: 'PULLING' // Will be excluded
        }
      }, {
        node: {
          id: 'QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMw==',
          version: 'v2.0.0',
          size: '3221225472',
          status: 'SCANNED' // Will be excluded
        }
      }, {
        node: {
          id: 'QXJ0aWZhY3RSZXZpc2lvbjpyZXYtNA==',
          version: 'v2.1.0',
          size: '4294967296',
          status: 'READY'
        }
      }]
    }),
    CleanupArtifactRevisionsPayload: () => ({
      artifactRevisions: {
        edges: []
      }
    })
  }}>
      <QueryResolver />
    </RelayResolver>
}`,...(x=(B=m.parameters)==null?void 0:B.docs)==null?void 0:x.source},description:{story:"With excluded revisions (PULLING/SCANNED status)",...(C=(L=m.parameters)==null?void 0:L.docs)==null?void 0:C.description}}};var E,N,W,j,K;p.parameters={...p.parameters,docs:{...(E=p.parameters)==null?void 0:E.docs,source:{originalSource:`{
  name: 'SingleRevision',
  parameters: {
    docs: {
      description: {
        story: 'Delete a single artifact revision.'
      }
    }
  },
  render: () => <RelayResolver mockResolvers={{
    Artifact: () => ({
      id: 'QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==',
      name: 'config-file',
      type: 'other',
      architecture: 'noarch',
      description: 'Configuration file',
      source: {
        name: 'Local',
        url: ''
      }
    }),
    ArtifactRevisionConnection: () => ({
      edges: [{
        node: {
          id: 'QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMQ==',
          version: 'latest',
          size: '1024',
          // 1KB
          status: 'READY'
        }
      }]
    }),
    CleanupArtifactRevisionsPayload: () => ({
      artifactRevisions: {
        edges: []
      }
    })
  }}>
      <QueryResolver />
    </RelayResolver>
}`,...(W=(N=p.parameters)==null?void 0:N.docs)==null?void 0:W.source},description:{story:"Single revision deletion",...(K=(j=p.parameters)==null?void 0:j.docs)==null?void 0:K.description}}};var T,J,z,w,P;f.parameters={...f.parameters,docs:{...(T=f.parameters)==null?void 0:T.docs,source:{originalSource:`{
  name: 'AllExcluded',
  parameters: {
    docs: {
      description: {
        story: 'All revisions are in PULLING or SCANNED status, so the Remove button is disabled.'
      }
    }
  },
  render: () => <RelayResolver mockResolvers={{
    Artifact: () => ({
      id: 'QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==',
      name: 'in-progress-model',
      type: 'model',
      architecture: 'x86_64',
      description: 'Model currently being processed',
      source: {
        name: 'GitHub',
        url: 'https://github.com/org/model'
      }
    }),
    ArtifactRevisionConnection: () => ({
      edges: [{
        node: {
          id: 'QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMQ==',
          version: 'v1.0.0',
          size: '1073741824',
          status: 'PULLING'
        }
      }, {
        node: {
          id: 'QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMg==',
          version: 'v2.0.0',
          size: '2147483648',
          status: 'SCANNED'
        }
      }]
    }),
    CleanupArtifactRevisionsPayload: () => ({
      artifactRevisions: {
        edges: []
      }
    })
  }}>
      <QueryResolver />
    </RelayResolver>
}`,...(z=(J=f.parameters)==null?void 0:J.docs)==null?void 0:z.source},description:{story:"All revisions excluded (no deletable revisions)",...(P=(w=f.parameters)==null?void 0:w.docs)==null?void 0:P.description}}};const En=["Default","WithExcludedRevisions","SingleRevision","AllExcluded"];export{f as AllExcluded,u as Default,p as SingleRevision,m as WithExcludedRevisions,En as __namedExportsOrder,Cn as default};
