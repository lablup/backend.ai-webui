import{a as re,j as e,B as b,aL as I,aO as oe,r as le,ay as de}from"./iframe-YbKAjBqK.js";import{R as d}from"./RelayResolver-DkkuVct6.js";import{m as ce,a as me,l as F}from"./storybook-mock-utils-gk3nbAE0.js";import{B as te}from"./BAIButton-2X2d5Unz.js";import{f as ue,a as ve}from"./index-BAxOKgo2.js";import{B as pe}from"./BAIFlex-CPWk3Nvd.js";import{B as ge}from"./BAITag-D57JRLHD.js";import{B as fe}from"./BAIArtifactStatusTag-DE--65n8.js";import{r as S}from"./index-wKfO5w4h.js";import{m as Re}from"./map-BiL0oXjg.js";import{B as ye}from"./Badge-DDwj7jC9.js";import{b as Ae}from"./astryxTagVariant-CwljjlK9.js";import{B as ke}from"./BAITable-Da_eQCJw.js";import"./preload-helper-Dp1pzeXC.js";import"./index-CistYSMg.js";import"./astryxLabel-CHPjtF2B.js";import"./isNumber-CiwPP0MB.js";import"./toString-DarQ6fEL.js";import"./isSymbol-C9I3gfh4.js";import"./filter-CjU4bN_C.js";import"./_baseEach-B8S7icT5.js";import"./get-CK1oqG1l.js";import"./_baseGet-jwkBtEIr.js";import"./identity-DKeuBCMA.js";import"./isEmpty-C0ciaT1u.js";import"./Token-ByT2mLYR.js";import"./composeEventHandlers-BolWE7qY.js";import"./BAIUnmountAfterClose-D-i4qLds.js";import"./forEach-CuS5Ij-B.js";import"./_arrayEach-DpGxo2Of.js";import"./_castFunction-a6W-o7Lo.js";import"./TextInput-DmMnqK8u.js";import"./InputGroupContext-yaR0sVH_.js";import"./useResolvedRequired-BNfqhKnT.js";import"./useInputStatusIcon-CCpuk0kH.js";import"./InputClearButton-BpaSGf6m.js";import"./useDevWarning-k8HFvEx1.js";import"./CheckboxInput-BeLWopaa.js";import"./useIndicator-BSXi9X-u.js";import"./isRenderable-BUV0eL6r.js";import"./rtlStyles-T4i24HtE.js";import"./VStack-PJP68IDd.js";import"./uniq-Cy_ozCqk.js";import"./_baseUniq-Cp40PGvz.js";import"./_baseIndexOf-Be9UPhX8.js";import"./_baseFindIndex-Cj99RmFE.js";import"./noop-DX6rZLP_.js";import"./flatMap-CpQSQa6r.js";import"./_baseFlatten-D97p3tFE.js";import"./includes-O-9SsDWy.js";import"./isString-CyqrdabS.js";import"./toInteger-CsOZe4eb.js";import"./toFinite-BvYpg2YM.js";import"./_trimmedEndIndex-DuQxD0U0.js";import"./toLower-C7stX9rS.js";import"./_baseAssignValue-C5B5VT7j.js";import"./_defineProperty-edlbD2gG.js";import"./negate-CgKyvzXE.js";import"./sortBy-Dp-HFx_O.js";import"./_overRest-_o6BRfg7.js";import"./_isIterateeCall-Ck_1iCdN.js";import"./some-B829qlRW.js";import"./useControllableValue-Bc04NxV-.js";import"./find-D3FEfDaO.js";import"./clamp-2b8eoQnR.js";import"./_baseClamp-DVUOCJN_.js";import"./characters-DWaYg7k3.js";import"./renderDropdownItems-CFFkfXQn.js";import"./Divider-hxLMwh6q.js";import"./Item-RwhxLSqv.js";import"./useListFocus-Cd34UBA7.js";import"./isRtlElement-B2-7SF8s.js";import"./useMenuHover-BsrTRDDz.js";import"./useFocusReturnVisibility-BlFLUTw8.js";import"./EmptyState-C8wAjv1j.js";import"./Selector-DJvpXWPa.js";import"./SelectorOption-C-R-7XLY.js";import"./usePopover-CyH-d-NI.js";import"./NumberInput-CnpI-WLo.js";import"./settings-D9Tro4qu.js";import"./compact-CU4PNV0P.js";const ne={argumentDefinitions:[],kind:"Fragment",metadata:{plural:!0},name:"BAIArtifactRevisionTableArtifactRevisionFragment",selections:[{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"version",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"size",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"status",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"updatedAt",storageKey:null},{args:null,kind:"FragmentSpread",name:"BAIArtifactStatusTagFragment"},{args:null,kind:"FragmentSpread",name:"BAIArtifactRevisionDownloadButtonFragment"},{args:null,kind:"FragmentSpread",name:"BAIArtifactRevisionDeleteButtonFragment"}],type:"ArtifactRevision",abstractKey:null};ne.hash="158ee46c42cc9ac1a45a9f1d359de5db";const ie={argumentDefinitions:[],kind:"Fragment",metadata:null,name:"BAIArtifactRevisionTableLatestRevisionFragment",selections:[{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null}],type:"ArtifactRevision",abstractKey:null};ie.hash="7598c47b813de8a7d1823fd229eeda60";I.extend(oe);const se=({artifactRevisionFrgmt:n,latestRevisionFrgmt:a,customizeColumns:s,...r})=>{const{t:o}=re(),A=S.useFragment(ne,n),m=S.useFragment(ie,a),u=Re(ue([{title:o("comp:BAIArtifactRevisionTable.Version"),dataIndex:"version",key:"version",render:(i,l)=>e.jsx("div",{children:e.jsxs(pe,{align:"center",gap:"xs",children:[e.jsx(b,{monospace:!0,strong:!0,children:i}),m&&m.id===l.id&&e.jsx(ye,{variant:Ae("blue"),label:"Latest"}),l.status==="PULLED"&&e.jsx(ge,{children:l.status})]})})},{title:o("comp:BAIArtifactRevisionTable.Status"),dataIndex:"status",key:"status",render:(i,l)=>e.jsx(fe,{artifactRevisionFrgmt:l})},{title:o("comp:BAIArtifactRevisionTable.Size"),dataIndex:"size",key:"size",render:i=>{var l;return i?e.jsx(b,{monospace:!0,children:(l=ve(i,"auto"))==null?void 0:l.displayValue}):e.jsx(b,{monospace:!0,children:"N/A"})}},{title:o("comp:BAIArtifactTable.Updated"),dataIndex:"updatedAt",key:"updatedAt",render:i=>i?e.jsx(b,{type:"secondary",title:I(i).toString(),children:I(i).fromNow()}):"N/A"}])),k=s?s(u):u;return e.jsx(ke,{scroll:{x:"max-content"},rowKey:i=>i.id,resizable:!0,columns:k,dataSource:A,...r})},ae=(function(){var n=[{kind:"Literal",name:"id",value:"artifact-1"}],a=[{kind:"Literal",name:"limit",value:100},{kind:"Literal",name:"offset",value:0}],s=[{kind:"Literal",name:"limit",value:1},{kind:"Literal",name:"orderBy",value:[{direction:"DESC",field:"VERSION"},{direction:"DESC",field:"UPDATED_AT"}]}],r={alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null};return{fragment:{argumentDefinitions:[],kind:"Fragment",metadata:null,name:"BAIArtifactRevisionTableStoriesQuery",selections:[{alias:null,args:n,concreteType:"Artifact",kind:"LinkedField",name:"artifact",plural:!1,selections:[{alias:null,args:a,concreteType:"ArtifactRevisionConnection",kind:"LinkedField",name:"revisions",plural:!1,selections:[{alias:null,args:null,concreteType:"ArtifactRevisionEdge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"ArtifactRevision",kind:"LinkedField",name:"node",plural:!1,selections:[{args:null,kind:"FragmentSpread",name:"BAIArtifactRevisionTableArtifactRevisionFragment"}],storageKey:null}],storageKey:null}],storageKey:"revisions(limit:100,offset:0)"},{alias:"latestVersion",args:s,concreteType:"ArtifactRevisionConnection",kind:"LinkedField",name:"revisions",plural:!1,selections:[{alias:null,args:null,concreteType:"ArtifactRevisionEdge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"ArtifactRevision",kind:"LinkedField",name:"node",plural:!1,selections:[{args:null,kind:"FragmentSpread",name:"BAIArtifactRevisionTableLatestRevisionFragment"}],storageKey:null}],storageKey:null}],storageKey:'revisions(limit:1,orderBy:[{"direction":"DESC","field":"VERSION"},{"direction":"DESC","field":"UPDATED_AT"}])'}],storageKey:'artifact(id:"artifact-1")'}],type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[],kind:"Operation",name:"BAIArtifactRevisionTableStoriesQuery",selections:[{alias:null,args:n,concreteType:"Artifact",kind:"LinkedField",name:"artifact",plural:!1,selections:[{alias:null,args:a,concreteType:"ArtifactRevisionConnection",kind:"LinkedField",name:"revisions",plural:!1,selections:[{alias:null,args:null,concreteType:"ArtifactRevisionEdge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"ArtifactRevision",kind:"LinkedField",name:"node",plural:!1,selections:[r,{alias:null,args:null,kind:"ScalarField",name:"version",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"size",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"status",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"updatedAt",storageKey:null}],storageKey:null}],storageKey:null}],storageKey:"revisions(limit:100,offset:0)"},{alias:"latestVersion",args:s,concreteType:"ArtifactRevisionConnection",kind:"LinkedField",name:"revisions",plural:!1,selections:[{alias:null,args:null,concreteType:"ArtifactRevisionEdge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"ArtifactRevision",kind:"LinkedField",name:"node",plural:!1,selections:[r],storageKey:null}],storageKey:null}],storageKey:'revisions(limit:1,orderBy:[{"direction":"DESC","field":"VERSION"},{"direction":"DESC","field":"UPDATED_AT"}])'},r],storageKey:'artifact(id:"artifact-1")'}]},params:{cacheID:"280a372f093b2e970e9fa51c09e21ed2",id:null,metadata:{},name:"BAIArtifactRevisionTableStoriesQuery",operationKind:"query",text:`query BAIArtifactRevisionTableStoriesQuery {
  artifact(id: "artifact-1") {
    revisions(limit: 100, offset: 0) {
      edges {
        node {
          ...BAIArtifactRevisionTableArtifactRevisionFragment
          id
        }
      }
    }
    latestVersion: revisions(limit: 1, orderBy: [{field: VERSION, direction: DESC}, {field: UPDATED_AT, direction: DESC}]) {
      edges {
        node {
          ...BAIArtifactRevisionTableLatestRevisionFragment
          id
        }
      }
    }
    id
  }
}

fragment BAIArtifactRevisionDeleteButtonFragment on ArtifactRevision {
  status
}

fragment BAIArtifactRevisionDownloadButtonFragment on ArtifactRevision {
  status
}

fragment BAIArtifactRevisionTableArtifactRevisionFragment on ArtifactRevision {
  id
  version
  size
  status
  updatedAt
  ...BAIArtifactStatusTagFragment
  ...BAIArtifactRevisionDownloadButtonFragment
  ...BAIArtifactRevisionDeleteButtonFragment
}

fragment BAIArtifactRevisionTableLatestRevisionFragment on ArtifactRevision {
  id
}

fragment BAIArtifactStatusTagFragment on ArtifactRevision {
  status
}
`}}})();ae.hash="c76ddd2bc0d0edc5ec72cca26edf6ad9";const Wt={title:"Fragments/BAIArtifactRevisionTable",component:se,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:`
**BAIArtifactRevisionTable** is a specialized table component for displaying artifact revision history with Relay GraphQL integration.

## BAI-Specific Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`artifactRevisionFrgmt\` | \`BAIArtifactRevisionTableArtifactRevisionFragment$key\` | - | GraphQL fragment reference for revisions (required) |
| \`latestRevisionFrgmt\` | \`BAIArtifactRevisionTableLatestRevisionFragment$key \\| null\` | - | Fragment reference for latest revision indicator |
| \`customizeColumns\` | \`(baseColumns) => BAIColumnType[]\` | - | Function to customize table columns |

## Pre-configured Columns
- **Version**: Revision version with "Latest" badge and PULLED status tag
- **Status**: Revision status (SCANNED, PULLING, VERIFYING, FAILED) with tag
- **Size**: Revision size in human-readable format
- **Updated**: Time since last update (relative time)

For other props (loading, pagination, etc.), refer to [BAITable](?path=/docs/table-baitable--docs).
        `}}},argTypes:{artifactRevisionFrgmt:{control:!1,description:"GraphQL fragment reference for artifact revisions",table:{type:{summary:"BAIArtifactRevisionTableArtifactRevisionFragment$key"}}},latestRevisionFrgmt:{control:!1,description:"GraphQL fragment reference for latest revision indicator",table:{type:{summary:"BAIArtifactRevisionTableLatestRevisionFragment$key | null | undefined"}}},customizeColumns:{control:!1,description:"Function to customize table columns. Receives base columns and returns customized columns.",table:{type:{summary:"(baseColumns: BAIColumnType[]) => BAIColumnType[]"}}}},decorators:[(n,a)=>{const s=a.globals.locale||"en",r=F[s]||F.en;return e.jsx(de,{locale:r,clientPromise:me,anonymousClientFactory:ce,children:e.jsx(n,{})})}]},c=({customizeColumns:n,loading:a})=>{var A,m,u,k;const{artifact:s}=S.useLazyLoadQuery(ae,{}),r=((A=s==null?void 0:s.revisions)==null?void 0:A.edges.map(i=>i==null?void 0:i.node).filter(i=>!!i))??[],o=((k=(u=(m=s==null?void 0:s.latestVersion)==null?void 0:m.edges)==null?void 0:u[0])==null?void 0:k.node)??null;return e.jsx(se,{artifactRevisionFrgmt:r,latestRevisionFrgmt:o,customizeColumns:n,loading:a,pagination:{total:r.length,pageSize:10}})},t=(n,a={})=>({id:btoa(`ArtifactRevisionNode:revision-${n}`),version:`v1.${n}.0`,size:`${(n+1)*1024*1024*100}`,status:"SCANNED",updatedAt:new Date(Date.now()-n*24*60*60*1e3).toISOString(),...a}),v={name:"Basic",parameters:{docs:{description:{story:"Basic artifact revision table displaying multiple revisions with their statuses and metadata."}}},render:n=>e.jsx(d,{mockResolvers:{Query:()=>({artifact:{revisions:{edges:[{node:t(1)},{node:t(2,{status:"PULLING"})},{node:t(3)},{node:t(4,{status:"VERIFYING"})},{node:t(5)}]},latestVersion:{edges:[{node:{id:btoa("ArtifactRevisionNode:revision-1")}}]}}})},children:e.jsx(c,{...n})})},p={name:"DifferentStatuses",parameters:{docs:{description:{story:"Displays artifact revisions with different statuses (SCANNED, PULLING, VERIFYING, FAILED, PULLED)."}}},render:()=>e.jsx(d,{mockResolvers:{Query:()=>({artifact:{revisions:{edges:[{node:t(1,{status:"SCANNED",version:"v2.0.0"})},{node:t(2,{status:"PULLING",version:"v1.9.0"})},{node:t(3,{status:"VERIFYING",version:"v1.8.0"})},{node:t(4,{status:"FAILED",version:"v1.7.0"})},{node:t(5,{status:"PULLED",version:"v1.6.0"})}]},latestVersion:{edges:[{node:{id:btoa("ArtifactRevisionNode:revision-1")}}]}}})},children:e.jsx(c,{})})},g={name:"CustomColumns",parameters:{docs:{description:{story:"Demonstrates column customization by adding an actions column to the table."}}},render:()=>e.jsx(d,{mockResolvers:{Query:()=>({artifact:{revisions:{edges:[{node:t(1)},{node:t(2)},{node:t(3)}]},latestVersion:{edges:[{node:{id:btoa("ArtifactRevisionNode:revision-1")}}]}}})},children:e.jsx(c,{customizeColumns:n=>[...n,{key:"actions",title:"Actions",width:150,render:()=>e.jsx(te,{type:"primary",size:"small",children:"Download"})}]})})},f={name:"LoadingState",parameters:{docs:{description:{story:"Shows the artifact revision table in a loading state with reduced opacity."}}},render:()=>e.jsx(d,{mockResolvers:{Query:()=>({artifact:{revisions:{edges:[{node:t(1)},{node:t(2)}]},latestVersion:{edges:[{node:{id:btoa("ArtifactRevisionNode:revision-1")}}]}}})},children:e.jsx(c,{loading:!0})})},R={name:"EmptyState",parameters:{docs:{description:{story:"Shows the artifact revision table when no revisions are available."}}},render:()=>e.jsx(d,{mockResolvers:{Query:()=>({artifact:{revisions:{edges:[]},latestVersion:{edges:[]}}})},children:e.jsx(c,{})})},y={name:"RealWorldUsage",parameters:{docs:{description:{story:"Demonstrates a realistic use case showing version history with latest revision indicator."}}},render:()=>{const[n,a]=le.useState(null);return e.jsxs("div",{children:[e.jsxs("div",{style:{marginBottom:16,padding:12,background:"#f5f5f5",borderRadius:4},children:[e.jsx("strong",{children:"Selected Revision:"})," ",n||"None selected"]}),e.jsx(d,{mockResolvers:{Query:()=>({artifact:{revisions:{edges:[{node:t(1,{version:"v2.1.0",status:"SCANNED",size:"524288000"})},{node:t(2,{version:"v2.0.1",status:"PULLED",size:"520093696"})},{node:t(3,{version:"v2.0.0",status:"SCANNED",size:"515899392"})},{node:t(4,{version:"v1.9.5",status:"PULLING",size:"511705088"})},{node:t(5,{version:"v1.9.0",status:"SCANNED",size:"507510784"})}]},latestVersion:{edges:[{node:{id:btoa("ArtifactRevisionNode:revision-1")}}]}}})},children:e.jsx(c,{customizeColumns:s=>[...s,{key:"actions",title:"Actions",width:120,render:(r,o)=>e.jsx(te,{type:"link",size:"small",onClick:()=>a(o.version),children:"Select"})}]})})]})}};var B,h,L,D,E;v.parameters={...v.parameters,docs:{...(B=v.parameters)==null?void 0:B.docs,source:{originalSource:`{
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'Basic artifact revision table displaying multiple revisions with their statuses and metadata.'
      }
    }
  },
  render: args => <RelayResolver mockResolvers={{
    Query: () => ({
      artifact: {
        revisions: {
          edges: [{
            node: generateMockRevision(1)
          }, {
            node: generateMockRevision(2, {
              status: 'PULLING'
            })
          }, {
            node: generateMockRevision(3)
          }, {
            node: generateMockRevision(4, {
              status: 'VERIFYING'
            })
          }, {
            node: generateMockRevision(5)
          }]
        },
        latestVersion: {
          edges: [{
            node: {
              id: btoa('ArtifactRevisionNode:revision-1')
            }
          }]
        }
      }
    })
  }}>
      <QueryResolver {...args} />
    </RelayResolver>
}`,...(L=(h=v.parameters)==null?void 0:h.docs)==null?void 0:L.source},description:{story:"Basic revision table with multiple revisions showing version history.",...(E=(D=v.parameters)==null?void 0:D.docs)==null?void 0:E.description}}};var N,T,C,x,w;p.parameters={...p.parameters,docs:{...(N=p.parameters)==null?void 0:N.docs,source:{originalSource:`{
  name: 'DifferentStatuses',
  parameters: {
    docs: {
      description: {
        story: 'Displays artifact revisions with different statuses (SCANNED, PULLING, VERIFYING, FAILED, PULLED).'
      }
    }
  },
  render: () => <RelayResolver mockResolvers={{
    Query: () => ({
      artifact: {
        revisions: {
          edges: [{
            node: generateMockRevision(1, {
              status: 'SCANNED',
              version: 'v2.0.0'
            })
          }, {
            node: generateMockRevision(2, {
              status: 'PULLING',
              version: 'v1.9.0'
            })
          }, {
            node: generateMockRevision(3, {
              status: 'VERIFYING',
              version: 'v1.8.0'
            })
          }, {
            node: generateMockRevision(4, {
              status: 'FAILED',
              version: 'v1.7.0'
            })
          }, {
            node: generateMockRevision(5, {
              status: 'PULLED',
              version: 'v1.6.0'
            })
          }]
        },
        latestVersion: {
          edges: [{
            node: {
              id: btoa('ArtifactRevisionNode:revision-1')
            }
          }]
        }
      }
    })
  }}>
      <QueryResolver />
    </RelayResolver>
}`,...(C=(T=p.parameters)==null?void 0:T.docs)==null?void 0:C.source},description:{story:"Revision table showing different revision statuses.",...(w=(x=p.parameters)==null?void 0:x.docs)==null?void 0:w.description}}};var z,j,V,K,Q;g.parameters={...g.parameters,docs:{...(z=g.parameters)==null?void 0:z.docs,source:{originalSource:`{
  name: 'CustomColumns',
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates column customization by adding an actions column to the table.'
      }
    }
  },
  render: () => <RelayResolver mockResolvers={{
    Query: () => ({
      artifact: {
        revisions: {
          edges: [{
            node: generateMockRevision(1)
          }, {
            node: generateMockRevision(2)
          }, {
            node: generateMockRevision(3)
          }]
        },
        latestVersion: {
          edges: [{
            node: {
              id: btoa('ArtifactRevisionNode:revision-1')
            }
          }]
        }
      }
    })
  }}>
      <QueryResolver customizeColumns={baseColumns => [...baseColumns, {
      key: 'actions',
      title: 'Actions',
      width: 150,
      render: () => <BAIButton type="primary" size="small">
                Download
              </BAIButton>
    }]} />
    </RelayResolver>
}`,...(V=(j=g.parameters)==null?void 0:j.docs)==null?void 0:V.source},description:{story:"Revision table with custom columns including action buttons.",...(Q=(K=g.parameters)==null?void 0:K.docs)==null?void 0:Q.description}}};var P,U,M,G,O;f.parameters={...f.parameters,docs:{...(P=f.parameters)==null?void 0:P.docs,source:{originalSource:`{
  name: 'LoadingState',
  parameters: {
    docs: {
      description: {
        story: 'Shows the artifact revision table in a loading state with reduced opacity.'
      }
    }
  },
  render: () => <RelayResolver mockResolvers={{
    Query: () => ({
      artifact: {
        revisions: {
          edges: [{
            node: generateMockRevision(1)
          }, {
            node: generateMockRevision(2)
          }]
        },
        latestVersion: {
          edges: [{
            node: {
              id: btoa('ArtifactRevisionNode:revision-1')
            }
          }]
        }
      }
    })
  }}>
      <QueryResolver loading={true} />
    </RelayResolver>
}`,...(M=(U=f.parameters)==null?void 0:U.docs)==null?void 0:M.source},description:{story:"Revision table in loading state.",...(O=(G=f.parameters)==null?void 0:G.docs)==null?void 0:O.description}}};var $,Y,_,W,q;R.parameters={...R.parameters,docs:{...($=R.parameters)==null?void 0:$.docs,source:{originalSource:`{
  name: 'EmptyState',
  parameters: {
    docs: {
      description: {
        story: 'Shows the artifact revision table when no revisions are available.'
      }
    }
  },
  render: () => <RelayResolver mockResolvers={{
    Query: () => ({
      artifact: {
        revisions: {
          edges: []
        },
        latestVersion: {
          edges: []
        }
      }
    })
  }}>
      <QueryResolver />
    </RelayResolver>
}`,...(_=(Y=R.parameters)==null?void 0:Y.docs)==null?void 0:_.source},description:{story:"Revision table with no revisions (empty state).",...(q=(W=R.parameters)==null?void 0:W.docs)==null?void 0:q.description}}};var H,J,X,Z,ee;y.parameters={...y.parameters,docs:{...(H=y.parameters)==null?void 0:H.docs,source:{originalSource:`{
  name: 'RealWorldUsage',
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates a realistic use case showing version history with latest revision indicator.'
      }
    }
  },
  render: () => {
    const [selectedRevision, setSelectedRevision] = useState<string | null>(null);
    return <div>
        <div style={{
        marginBottom: 16,
        padding: 12,
        background: '#f5f5f5',
        borderRadius: 4
      }}>
          <strong>Selected Revision:</strong>{' '}
          {selectedRevision || 'None selected'}
        </div>
        <RelayResolver mockResolvers={{
        Query: () => ({
          artifact: {
            revisions: {
              edges: [{
                node: generateMockRevision(1, {
                  version: 'v2.1.0',
                  status: 'SCANNED',
                  size: '524288000'
                })
              }, {
                node: generateMockRevision(2, {
                  version: 'v2.0.1',
                  status: 'PULLED',
                  size: '520093696'
                })
              }, {
                node: generateMockRevision(3, {
                  version: 'v2.0.0',
                  status: 'SCANNED',
                  size: '515899392'
                })
              }, {
                node: generateMockRevision(4, {
                  version: 'v1.9.5',
                  status: 'PULLING',
                  size: '511705088'
                })
              }, {
                node: generateMockRevision(5, {
                  version: 'v1.9.0',
                  status: 'SCANNED',
                  size: '507510784'
                })
              }]
            },
            latestVersion: {
              edges: [{
                node: {
                  id: btoa('ArtifactRevisionNode:revision-1')
                }
              }]
            }
          }
        })
      }}>
          <QueryResolver customizeColumns={baseColumns => [...baseColumns, {
          key: 'actions',
          title: 'Actions',
          width: 120,
          render: (_text, record) => <BAIButton type="link" size="small" onClick={() => setSelectedRevision(record.version)}>
                    Select
                  </BAIButton>
        }]} />
        </RelayResolver>
      </div>;
  }
}`,...(X=(J=y.parameters)==null?void 0:J.docs)==null?void 0:X.source},description:{story:"Real-world example with version history and latest revision indicator.",...(ee=(Z=y.parameters)==null?void 0:Z.docs)==null?void 0:ee.description}}};const qt=["Default","DifferentStatuses","WithCustomColumns","Loading","Empty","RealWorldExample"];export{v as Default,p as DifferentStatuses,R as Empty,f as Loading,y as RealWorldExample,g as WithCustomColumns,qt as __namedExportsOrder,Wt as default};
