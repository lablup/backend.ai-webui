import{t as $,j as e}from"./iframe-NxRhXk15.js";import{R as s}from"./RelayResolver-BiGrcwDj.js";import{B as g}from"./BAIFlex-HfD0JH3k.js";import{B as O}from"./BAIButton-B2-bq7ug.js";import{r as Y}from"./index-q-1QDwld.js";import{o as V}from"./omit-8Wk8UJFE.js";import{T as _}from"./trash-2-Ci8K2ZIY.js";import"./preload-helper-Dp1pzeXC.js";import"./index-CryzbZR6.js";import"./astryxLabel-CMVJoIqR.js";import"./toString-4qKJ7WK1.js";import"./isSymbol-CJ2kQNmN.js";import"./_arrayEach-DpGxo2Of.js";import"./_getAllKeysIn-BU37MplN.js";import"./_baseAssignValue-DVZdp-BN.js";import"./_defineProperty-LfGfKNi6.js";import"./_baseGet-CyEDQauf.js";import"./_baseSlice-F8doVSIJ.js";import"./_baseFlatten-CJjgC08-.js";import"./_overRest-DhxEsLZZ.js";import"./identity-DKeuBCMA.js";const M={argumentDefinitions:[],kind:"Fragment",metadata:{plural:!0},name:"BAIArtifactRevisionDeleteButtonFragment",selections:[{alias:null,args:null,kind:"ScalarField",name:"status",storageKey:null}],type:"ArtifactRevision",abstractKey:null};M.hash="de15aa32192b0f0d63e3bd7f5f90d2b6";const q=({revisionsFrgmt:t,...o})=>{const{token:n}=$.useToken(),p=Y.useFragment(M,t).some(R=>R.status!=="SCANNED"&&R.status!=="PULLING"),r=o.disabled||o.loading||!p;return e.jsx(O,{icon:e.jsx(_,{size:"1em"}),disabled:r,type:"text",style:{color:r?n.colorTextDisabled:n.colorError,background:r?n.colorBgContainerDisabled:n.colorErrorBg,...o.style},...V(o,["style","disabled","loading"])})},z=(function(){var t=[{kind:"Literal",name:"first",value:10},{kind:"Literal",name:"offset",value:0}];return{fragment:{argumentDefinitions:[],kind:"Fragment",metadata:null,name:"BAIArtifactRevisionDeleteButtonStoriesQuery",selections:[{alias:null,args:t,concreteType:"ArtifactRevisionConnection",kind:"LinkedField",name:"artifactRevisions",plural:!1,selections:[{alias:null,args:null,concreteType:"ArtifactRevisionEdge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"ArtifactRevision",kind:"LinkedField",name:"node",plural:!1,selections:[{args:null,kind:"FragmentSpread",name:"BAIArtifactRevisionDeleteButtonFragment"}],storageKey:null}],storageKey:null}],storageKey:"artifactRevisions(first:10,offset:0)"}],type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[],kind:"Operation",name:"BAIArtifactRevisionDeleteButtonStoriesQuery",selections:[{alias:null,args:t,concreteType:"ArtifactRevisionConnection",kind:"LinkedField",name:"artifactRevisions",plural:!1,selections:[{alias:null,args:null,concreteType:"ArtifactRevisionEdge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"ArtifactRevision",kind:"LinkedField",name:"node",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"status",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null}],storageKey:null}],storageKey:null}],storageKey:"artifactRevisions(first:10,offset:0)"}]},params:{cacheID:"f9256d5d3a660072ce8d48a252703e6f",id:null,metadata:{},name:"BAIArtifactRevisionDeleteButtonStoriesQuery",operationKind:"query",text:`query BAIArtifactRevisionDeleteButtonStoriesQuery {
  artifactRevisions(offset: 0, first: 10) {
    edges {
      node {
        ...BAIArtifactRevisionDeleteButtonFragment
        id
      }
    }
  }
}

fragment BAIArtifactRevisionDeleteButtonFragment on ArtifactRevision {
  status
}
`}}})();z.hash="9ca7f892cff7056588b89ee6cae001e2";const fe={title:"Fragments/BAIArtifactRevisionDeleteButton",component:q,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:`
**BAIArtifactRevisionDeleteButton** is a specialized delete button for artifact revisions with automatic deletability checks based on GraphQL fragment data.

## BAI-Specific Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`revisionsFrgmt\` | \`BAIArtifactRevisionDeleteButtonFragment$key\` | - | GraphQL fragment reference for revision data (required) |
| \`loading\` | \`boolean\` | \`false\` | Loading state (inherited from BAIButtonProps) |

## Deletability Logic
The button automatically determines if revisions are deletable:
- **Deletable**: At least one revision with status !== 'SCANNED' && status !== 'PULLING'
- **Not Deletable**: All revisions have status 'SCANNED' or 'PULLING'

## Visual States
- **Enabled**: Error colors (red icon and background)
- **Disabled**: Disabled colors (gray)

For other props, refer to [BAIButton](?path=/docs/button-baibutton--docs).
        `}}},argTypes:{revisionsFrgmt:{control:!1,description:"GraphQL fragment reference for artifact revision data",table:{type:{summary:"BAIArtifactRevisionDeleteButtonFragment$key"}}},loading:{control:{type:"boolean"},description:"Loading state",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},onClick:{action:"clicked",description:"Click handler",table:{type:{summary:"() => void"}}}}},a=({loading:t=!1,onClick:o})=>{var p;const{artifactRevisions:n}=Y.useLazyLoadQuery(z,{}),m=(p=n==null?void 0:n.edges)==null?void 0:p.map(r=>r.node);return m&&m.length>0&&e.jsx(q,{revisionsFrgmt:m,loading:t,onClick:o})},i={name:"Basic",args:{},parameters:{docs:{description:{story:"Revisions with deletable status (not SCANNED or PULLING). The button appears in error colors (red)."}}},render:t=>e.jsx(s,{mockResolvers:{ArtifactRevisionConnection:()=>({edges:[{node:{status:"READY"}},{node:{status:"FAILED"}}]})},children:e.jsx(a,{...t})})},l={name:"NotDeletable",args:{},parameters:{docs:{description:{story:"All revisions are SCANNED or PULLING, making them non-deletable. The button is automatically disabled with gray styling."}}},render:t=>e.jsx(s,{mockResolvers:{ArtifactRevisionConnection:()=>({edges:[{node:{status:"SCANNED"}},{node:{status:"PULLING"}}]})},children:e.jsx(a,{...t})})},d={name:"MixedStatus",args:{},parameters:{docs:{description:{story:"Mix of deletable and non-deletable revisions. The button is enabled because at least one revision is deletable."}}},render:t=>e.jsx(s,{mockResolvers:{ArtifactRevisionConnection:()=>({edges:[{node:{status:"SCANNED"}},{node:{status:"READY"}},{node:{status:"PULLING"}}]})},children:e.jsx(a,{...t})})},c={name:"LoadingState",args:{loading:!0},parameters:{docs:{description:{story:"Button in loading state during deletion operation."}}},render:t=>e.jsx(s,{mockResolvers:{ArtifactRevisionConnection:()=>({edges:[{node:{status:"READY"}}]})},children:e.jsx(a,{...t})})},u={name:"AllStates",parameters:{docs:{description:{story:"Comparison of all button states: deletable, not deletable, and loading."}}},render:()=>e.jsxs(g,{direction:"column",gap:"md",children:[e.jsxs(g,{align:"center",gap:"sm",children:[e.jsx("span",{style:{width:120},children:"Deletable:"}),e.jsx(s,{mockResolvers:{ArtifactRevisionConnection:()=>({edges:[{node:{status:"READY"}}]})},children:e.jsx(a,{})})]}),e.jsxs(g,{align:"center",gap:"sm",children:[e.jsx("span",{style:{width:120},children:"Not Deletable:"}),e.jsx(s,{mockResolvers:{ArtifactRevisionConnection:()=>({edges:[{node:{status:"SCANNED"}}]})},children:e.jsx(a,{})})]}),e.jsxs(g,{align:"center",gap:"sm",children:[e.jsx("span",{style:{width:120},children:"Loading:"}),e.jsx(s,{mockResolvers:{ArtifactRevisionConnection:()=>({edges:[{node:{status:"READY"}}]})},children:e.jsx(a,{loading:!0})})]})]})};var f,v,y,A,b;i.parameters={...i.parameters,docs:{...(f=i.parameters)==null?void 0:f.docs,source:{originalSource:`{
  name: 'Basic',
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Revisions with deletable status (not SCANNED or PULLING). The button appears in error colors (red).'
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
          status: 'FAILED'
        }
      }]
    })
  }}>
      <QueryResolver {...args} />
    </RelayResolver>
}`,...(y=(v=i.parameters)==null?void 0:v.docs)==null?void 0:y.source},description:{story:"Deletable revisions - button is enabled with error styling",...(b=(A=i.parameters)==null?void 0:A.docs)==null?void 0:b.description}}};var D,h,B,L,k;l.parameters={...l.parameters,docs:{...(D=l.parameters)==null?void 0:D.docs,source:{originalSource:`{
  name: 'NotDeletable',
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'All revisions are SCANNED or PULLING, making them non-deletable. The button is automatically disabled with gray styling.'
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
          status: 'PULLING'
        }
      }]
    })
  }}>
      <QueryResolver {...args} />
    </RelayResolver>
}`,...(B=(h=l.parameters)==null?void 0:h.docs)==null?void 0:B.source},description:{story:"All revisions are SCANNED or PULLING - button is disabled",...(k=(L=l.parameters)==null?void 0:L.docs)==null?void 0:k.description}}};var x,N,I,S,C;d.parameters={...d.parameters,docs:{...(x=d.parameters)==null?void 0:x.docs,source:{originalSource:`{
  name: 'MixedStatus',
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Mix of deletable and non-deletable revisions. The button is enabled because at least one revision is deletable.'
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
      }, {
        node: {
          status: 'PULLING'
        }
      }]
    })
  }}>
      <QueryResolver {...args} />
    </RelayResolver>
}`,...(I=(N=d.parameters)==null?void 0:N.docs)==null?void 0:I.source},description:{story:"Mixed status revisions - button is enabled if at least one is deletable",...(C=(S=d.parameters)==null?void 0:S.docs)==null?void 0:C.description}}};var E,F,j,T,Q;c.parameters={...c.parameters,docs:{...(E=c.parameters)==null?void 0:E.docs,source:{originalSource:`{
  name: 'LoadingState',
  args: {
    loading: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Button in loading state during deletion operation.'
      }
    }
  },
  render: args => <RelayResolver mockResolvers={{
    ArtifactRevisionConnection: () => ({
      edges: [{
        node: {
          status: 'READY'
        }
      }]
    })
  }}>
      <QueryResolver {...args} />
    </RelayResolver>
}`,...(j=(F=c.parameters)==null?void 0:F.docs)==null?void 0:j.source},description:{story:"Loading state",...(Q=(T=c.parameters)==null?void 0:T.docs)==null?void 0:Q.description}}};var G,w,K,P,U;u.parameters={...u.parameters,docs:{...(G=u.parameters)==null?void 0:G.docs,source:{originalSource:`{
  name: 'AllStates',
  parameters: {
    docs: {
      description: {
        story: 'Comparison of all button states: deletable, not deletable, and loading.'
      }
    }
  },
  render: () => <BAIFlex direction="column" gap="md">
      <BAIFlex align="center" gap="sm">
        <span style={{
        width: 120
      }}>Deletable:</span>
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
        width: 120
      }}>Not Deletable:</span>
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
        width: 120
      }}>Loading:</span>
        <RelayResolver mockResolvers={{
        ArtifactRevisionConnection: () => ({
          edges: [{
            node: {
              status: 'READY'
            }
          }]
        })
      }}>
          <QueryResolver loading />
        </RelayResolver>
      </BAIFlex>
    </BAIFlex>
}`,...(K=(w=u.parameters)==null?void 0:w.docs)==null?void 0:K.source},description:{story:"Comparison of all states",...(U=(P=u.parameters)==null?void 0:P.docs)==null?void 0:U.description}}};const ve=["Default","NotDeletable","MixedStatus","Loading","AllStates"];export{u as AllStates,i as Default,c as Loading,d as MixedStatus,l as NotDeletable,ve as __namedExportsOrder,fe as default};
