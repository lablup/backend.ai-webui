import{j as e}from"./iframe-CoGUfi_Y.js";import{R as o}from"./RelayResolver-CjphTiXS.js";import{B as d}from"./BAIFlex-C8Mp0x1j.js";import{B as Y}from"./BAIArtifactRevisionDownloadButton-BAu54cc-.js";import{r as q}from"./index--RifkUQe.js";import"./preload-helper-Dp1pzeXC.js";import"./index-CgsWl5_T.js";import"./BAIButton-nvQyQmeW.js";import"./astryxLabel-1bSCCcCh.js";import"./omit-D3bNxr99.js";import"./toString-C2pgbtI7.js";import"./isSymbol-DksdDKnx.js";import"./_arrayEach-DpGxo2Of.js";import"./_getAllKeysIn-CsbtHY2j.js";import"./_baseAssignValue-DHv7y8x0.js";import"./_defineProperty-B97TdMKK.js";import"./_baseGet-Nlg0RAi7.js";import"./_baseSlice-F8doVSIJ.js";import"./_baseFlatten-xk3M1AqI.js";import"./_overRest-DTqh0eVG.js";import"./identity-DKeuBCMA.js";import"./download-D2klQy2H.js";const G=(function(){var n=[{kind:"Literal",name:"first",value:10},{kind:"Literal",name:"offset",value:0}];return{fragment:{argumentDefinitions:[],kind:"Fragment",metadata:null,name:"BAIArtifactRevisionDownloadButtonStoriesQuery",selections:[{alias:null,args:n,concreteType:"ArtifactRevisionConnection",kind:"LinkedField",name:"artifactRevisions",plural:!1,selections:[{alias:null,args:null,concreteType:"ArtifactRevisionEdge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"ArtifactRevision",kind:"LinkedField",name:"node",plural:!1,selections:[{args:null,kind:"FragmentSpread",name:"BAIArtifactRevisionDownloadButtonFragment"}],storageKey:null}],storageKey:null}],storageKey:"artifactRevisions(first:10,offset:0)"}],type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[],kind:"Operation",name:"BAIArtifactRevisionDownloadButtonStoriesQuery",selections:[{alias:null,args:n,concreteType:"ArtifactRevisionConnection",kind:"LinkedField",name:"artifactRevisions",plural:!1,selections:[{alias:null,args:null,concreteType:"ArtifactRevisionEdge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"ArtifactRevision",kind:"LinkedField",name:"node",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"status",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null}],storageKey:null}],storageKey:null}],storageKey:"artifactRevisions(first:10,offset:0)"}]},params:{cacheID:"77a4d987273a48514738c15aca128a7e",id:null,metadata:{},name:"BAIArtifactRevisionDownloadButtonStoriesQuery",operationKind:"query",text:`query BAIArtifactRevisionDownloadButtonStoriesQuery {
  artifactRevisions(offset: 0, first: 10) {
    edges {
      node {
        ...BAIArtifactRevisionDownloadButtonFragment
        id
      }
    }
  }
}

fragment BAIArtifactRevisionDownloadButtonFragment on ArtifactRevision {
  status
}
`}}})();G.hash="110e07e8baadc5bd84cb7bb1803ec55c";const ue={title:"Fragments/BAIArtifactRevisionDownloadButton",component:Y,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:`
**BAIArtifactRevisionDownloadButton** is a specialized download button for artifact revisions with automatic downloadability checks based on GraphQL fragment data.

## BAI-Specific Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`revisionsFrgmt\` | \`BAIArtifactRevisionDownloadButtonFragment$key\` | - | GraphQL fragment reference for revision data (required) |
| \`loading\` | \`boolean\` | \`false\` | Loading state (inherited from BAIButtonProps) |

## Downloadability Logic
The button automatically determines if revisions are downloadable:
- **Downloadable**: At least one revision with status === 'SCANNED'
- **Not Downloadable**: No revisions have status 'SCANNED'

## Visual States
- **Enabled**: Info colors (blue icon and background)
- **Disabled**: Disabled colors (gray)

For other props, refer to [BAIButton](?path=/docs/button-baibutton--docs).
        `}}},argTypes:{revisionsFrgmt:{control:!1,description:"GraphQL fragment reference for artifact revision data",table:{type:{summary:"BAIArtifactRevisionDownloadButtonFragment$key"}}},loading:{control:{type:"boolean"},description:"Loading state",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},onClick:{action:"clicked",description:"Click handler",table:{type:{summary:"() => void"}}}}},s=({loading:n=!1,onClick:M})=>{var m;const{artifactRevisions:c}=q.useLazyLoadQuery(G,{}),u=(m=c==null?void 0:c.edges)==null?void 0:m.map(P=>P.node);return u&&u.length>0&&e.jsx(Y,{revisionsFrgmt:u,loading:n,onClick:M})},t={name:"Basic",args:{},parameters:{docs:{description:{story:"Revisions with SCANNED status are downloadable. The button appears in info colors (blue)."}}},render:n=>e.jsx(o,{mockResolvers:{ArtifactRevisionConnection:()=>({edges:[{node:{status:"SCANNED"}},{node:{status:"READY"}}]})},children:e.jsx(s,{...n})})},a={name:"NotDownloadable",args:{},parameters:{docs:{description:{story:"No revisions have SCANNED status, making them non-downloadable. The button is automatically disabled with gray styling."}}},render:n=>e.jsx(o,{mockResolvers:{ArtifactRevisionConnection:()=>({edges:[{node:{status:"READY"}},{node:{status:"PULLING"}}]})},children:e.jsx(s,{...n})})},r={name:"MixedStatus",args:{},parameters:{docs:{description:{story:"Mix of SCANNED and non-SCANNED revisions. The button is enabled because at least one revision is downloadable."}}},render:n=>e.jsx(o,{mockResolvers:{ArtifactRevisionConnection:()=>({edges:[{node:{status:"READY"}},{node:{status:"SCANNED"}},{node:{status:"PULLING"}}]})},children:e.jsx(s,{...n})})},i={name:"LoadingState",args:{loading:!0},parameters:{docs:{description:{story:"Button in loading state during download operation."}}},render:n=>e.jsx(o,{mockResolvers:{ArtifactRevisionConnection:()=>({edges:[{node:{status:"SCANNED"}}]})},children:e.jsx(s,{...n})})},l={name:"AllStates",parameters:{docs:{description:{story:"Comparison of all button states: downloadable, not downloadable, and loading."}}},render:()=>e.jsxs(d,{direction:"column",gap:"md",children:[e.jsxs(d,{align:"center",gap:"sm",children:[e.jsx("span",{style:{width:140},children:"Downloadable:"}),e.jsx(o,{mockResolvers:{ArtifactRevisionConnection:()=>({edges:[{node:{status:"SCANNED"}}]})},children:e.jsx(s,{})})]}),e.jsxs(d,{align:"center",gap:"sm",children:[e.jsx("span",{style:{width:140},children:"Not Downloadable:"}),e.jsx(o,{mockResolvers:{ArtifactRevisionConnection:()=>({edges:[{node:{status:"READY"}}]})},children:e.jsx(s,{})})]}),e.jsxs(d,{align:"center",gap:"sm",children:[e.jsx("span",{style:{width:140},children:"Loading:"}),e.jsx(o,{mockResolvers:{ArtifactRevisionConnection:()=>({edges:[{node:{status:"SCANNED"}}]})},children:e.jsx(s,{loading:!0})})]})]})};var p,g,v,R,f;t.parameters={...t.parameters,docs:{...(p=t.parameters)==null?void 0:p.docs,source:{originalSource:`{
  name: 'Basic',
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Revisions with SCANNED status are downloadable. The button appears in info colors (blue).'
      }
    }
  },
  render: args => <RelayResolver mockResolvers={{
    ArtifactRevisionConnection: () => ({
      edges: [{
        node: {
          status: 'SCANNED'
        }
      }, {
        node: {
          status: 'READY'
        }
      }]
    })
  }}>
      <QueryResolver {...args} />
    </RelayResolver>
}`,...(v=(g=t.parameters)==null?void 0:g.docs)==null?void 0:v.source},description:{story:"Downloadable revisions - button is enabled with info styling",...(f=(R=t.parameters)==null?void 0:R.docs)==null?void 0:f.description}}};var y,A,b,D,N;a.parameters={...a.parameters,docs:{...(y=a.parameters)==null?void 0:y.docs,source:{originalSource:`{
  name: 'NotDownloadable',
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'No revisions have SCANNED status, making them non-downloadable. The button is automatically disabled with gray styling.'
      }
    }
  },
  render: args => <RelayResolver mockResolvers={{
    ArtifactRevisionConnection: () => ({
      edges: [{
        node: {
          status: 'READY'
        }
      }, {
        node: {
          status: 'PULLING'
        }
      }]
    })
  }}>
      <QueryResolver {...args} />
    </RelayResolver>
}`,...(b=(A=a.parameters)==null?void 0:A.docs)==null?void 0:b.source},description:{story:"No SCANNED revisions - button is disabled",...(N=(D=a.parameters)==null?void 0:D.docs)==null?void 0:N.description}}};var w,h,S,x,B;r.parameters={...r.parameters,docs:{...(w=r.parameters)==null?void 0:w.docs,source:{originalSource:`{
  name: 'MixedStatus',
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Mix of SCANNED and non-SCANNED revisions. The button is enabled because at least one revision is downloadable.'
      }
    }
  },
  render: args => <RelayResolver mockResolvers={{
    ArtifactRevisionConnection: () => ({
      edges: [{
        node: {
          status: 'READY'
        }
      }, {
        node: {
          status: 'SCANNED'
        }
      }, {
        node: {
          status: 'PULLING'
        }
      }]
    })
  }}>
      <QueryResolver {...args} />
    </RelayResolver>
}`,...(S=(h=r.parameters)==null?void 0:h.docs)==null?void 0:S.source},description:{story:"Mixed status revisions - button is enabled if at least one is SCANNED",...(B=(x=r.parameters)==null?void 0:x.docs)==null?void 0:B.description}}};var k,C,E,L,I;i.parameters={...i.parameters,docs:{...(k=i.parameters)==null?void 0:k.docs,source:{originalSource:`{
  name: 'LoadingState',
  args: {
    loading: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Button in loading state during download operation.'
      }
    }
  },
  render: args => <RelayResolver mockResolvers={{
    ArtifactRevisionConnection: () => ({
      edges: [{
        node: {
          status: 'SCANNED'
        }
      }]
    })
  }}>
      <QueryResolver {...args} />
    </RelayResolver>
}`,...(E=(C=i.parameters)==null?void 0:C.docs)==null?void 0:E.source},description:{story:"Loading state",...(I=(L=i.parameters)==null?void 0:L.docs)==null?void 0:I.description}}};var F,j,Q,T,K;l.parameters={...l.parameters,docs:{...(F=l.parameters)==null?void 0:F.docs,source:{originalSource:`{
  name: 'AllStates',
  parameters: {
    docs: {
      description: {
        story: 'Comparison of all button states: downloadable, not downloadable, and loading.'
      }
    }
  },
  render: () => <BAIFlex direction="column" gap="md">
      <BAIFlex align="center" gap="sm">
        <span style={{
        width: 140
      }}>Downloadable:</span>
        <RelayResolver mockResolvers={{
        ArtifactRevisionConnection: () => ({
          edges: [{
            node: {
              status: 'SCANNED'
            }
          }]
        })
      }}>
          <QueryResolver />
        </RelayResolver>
      </BAIFlex>

      <BAIFlex align="center" gap="sm">
        <span style={{
        width: 140
      }}>Not Downloadable:</span>
        <RelayResolver mockResolvers={{
        ArtifactRevisionConnection: () => ({
          edges: [{
            node: {
              status: 'READY'
            }
          }]
        })
      }}>
          <QueryResolver />
        </RelayResolver>
      </BAIFlex>

      <BAIFlex align="center" gap="sm">
        <span style={{
        width: 140
      }}>Loading:</span>
        <RelayResolver mockResolvers={{
        ArtifactRevisionConnection: () => ({
          edges: [{
            node: {
              status: 'SCANNED'
            }
          }]
        })
      }}>
          <QueryResolver loading />
        </RelayResolver>
      </BAIFlex>
    </BAIFlex>
}`,...(Q=(j=l.parameters)==null?void 0:j.docs)==null?void 0:Q.source},description:{story:"Comparison of all states",...(K=(T=l.parameters)==null?void 0:T.docs)==null?void 0:K.description}}};const me=["Default","NotDownloadable","MixedStatus","Loading","AllStates"];export{l as AllStates,t as Default,i as Loading,r as MixedStatus,a as NotDownloadable,me as __namedExportsOrder,ue as default};
