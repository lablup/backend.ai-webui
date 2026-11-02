import{a as e,n as t}from"./rolldown-runtime-sJBDdmOt.js";import{t as n}from"./react-DlPsW1c0.js";import{n as r,t as i}from"./map-BLzs52H1.js";import{n as a,t as o}from"./BAITable-DjKp5dHj.js";import{t as s}from"./jsx-runtime-MKhVqBIO.js";import{n as ee,t as c}from"./useBAIi18n-CcFoH3bE.js";import{t as l}from"./dayjs.min-BHb7hAap.js";import{c as te,h as ne,m as u,o as re,s as ie}from"./iframe-Dr5snffI.js";import{n as ae,t as oe}from"./BAIFlex-DnaoYTJ1.js";import{t as d}from"./react-relay-sHama7hJ.js";import{c as se,o as ce,r as le}from"./helper-p-d7z67I.js";import{n as ue,t as de}from"./Badge-DMuqwqp2.js";import{n as fe,t as f}from"./BAIButton-CzGzKWte.js";import{n as pe,t as me}from"./BAIArtifactStatusBadge-CoRH093v.js";import{a as he,i as ge,n as _e,r as ve}from"./storybook-mock-utils-BqLAdkd_.js";import{n as ye,t as p}from"./RelayResolver-BnFyFQJn.js";var m;function h(){return(h=t((()=>{m={argumentDefinitions:[],kind:`Fragment`,metadata:{plural:!0},name:`BAIArtifactRevisionTableArtifactRevisionFragment`,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`version`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`size`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`status`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`updatedAt`,storageKey:null},{args:null,kind:`FragmentSpread`,name:`BAIArtifactStatusBadgeFragment`},{args:null,kind:`FragmentSpread`,name:`BAIArtifactRevisionDownloadButtonFragment`},{args:null,kind:`FragmentSpread`,name:`BAIArtifactRevisionDeleteButtonFragment`}],type:`ArtifactRevision`,abstractKey:null},m.hash=`4b886a8f1069332114e0162802fc049f`})))()}var g;function be(){return(be=t((()=>{g={argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAIArtifactRevisionTableLatestRevisionFragment`,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null}],type:`ArtifactRevision`,abstractKey:null},g.hash=`7598c47b813de8a7d1823fd229eeda60`})))()}var _,xe,v,y,b;function x(){return(x=t((()=>{h(),be(),se(),c(),ae(),ne(),a(),pe(),ue(),_=e(l(),1),xe=e(te(),1),i(),v=d(),y=s(),_.default.extend(xe.default),b=({artifactRevisionFrgmt:e,latestRevisionFrgmt:t,customizeColumns:n,...i})=>{let{t:a}=ee(),s=(0,v.useFragment)(m,e),c=(0,v.useFragment)(g,t),l=r(ce([{title:a(`comp:BAIArtifactRevisionTable.Version`),dataIndex:`version`,key:`version`,render:(e,t)=>(0,y.jsx)(`div`,{children:(0,y.jsxs)(oe,{align:`center`,gap:`xs`,children:[(0,y.jsx)(u,{monospace:!0,strong:!0,children:e}),c&&c.id===t.id&&(0,y.jsx)(de,{variant:`info`,label:`Latest`}),t.status===`PULLED`&&(0,y.jsx)(de,{variant:`neutral`,label:t.status})]})})},{title:a(`comp:BAIArtifactRevisionTable.Status`),dataIndex:`status`,key:`status`,render:(e,t)=>(0,y.jsx)(me,{artifactRevisionFrgmt:t})},{title:a(`comp:BAIArtifactRevisionTable.Size`),dataIndex:`size`,key:`size`,render:e=>{var t;return e?(0,y.jsx)(u,{monospace:!0,children:(t=le(e,`auto`))==null?void 0:t.displayValue}):(0,y.jsx)(u,{monospace:!0,children:`N/A`})}},{title:a(`comp:BAIArtifactTable.Updated`),dataIndex:`updatedAt`,key:`updatedAt`,render:e=>e?(0,y.jsx)(u,{type:`secondary`,title:(0,_.default)(e).toString(),children:(0,_.default)(e).fromNow()}):`N/A`}])),te=n?n(l):l;return(0,y.jsx)(o,{scroll:{x:`max-content`},rowKey:e=>e.id,resizable:!0,columns:te,dataSource:s,...i})}})))()}var S;function C(){return(C=t((()=>{S=(function(){var e=[{kind:`Literal`,name:`id`,value:`artifact-1`}],t=[{kind:`Literal`,name:`limit`,value:100},{kind:`Literal`,name:`offset`,value:0}],n=[{kind:`Literal`,name:`limit`,value:1},{kind:`Literal`,name:`orderBy`,value:[{direction:`DESC`,field:`VERSION`},{direction:`DESC`,field:`UPDATED_AT`}]}],r={alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null};return{fragment:{argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAIArtifactRevisionTableStoriesQuery`,selections:[{alias:null,args:e,concreteType:`Artifact`,kind:`LinkedField`,name:`artifact`,plural:!1,selections:[{alias:null,args:t,concreteType:`ArtifactRevisionConnection`,kind:`LinkedField`,name:`revisions`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactRevisionEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{args:null,kind:`FragmentSpread`,name:`BAIArtifactRevisionTableArtifactRevisionFragment`}],storageKey:null}],storageKey:null}],storageKey:`revisions(limit:100,offset:0)`},{alias:`latestVersion`,args:n,concreteType:`ArtifactRevisionConnection`,kind:`LinkedField`,name:`revisions`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactRevisionEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{args:null,kind:`FragmentSpread`,name:`BAIArtifactRevisionTableLatestRevisionFragment`}],storageKey:null}],storageKey:null}],storageKey:`revisions(limit:1,orderBy:[{"direction":"DESC","field":"VERSION"},{"direction":"DESC","field":"UPDATED_AT"}])`}],storageKey:`artifact(id:"artifact-1")`}],type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[],kind:`Operation`,name:`BAIArtifactRevisionTableStoriesQuery`,selections:[{alias:null,args:e,concreteType:`Artifact`,kind:`LinkedField`,name:`artifact`,plural:!1,selections:[{alias:null,args:t,concreteType:`ArtifactRevisionConnection`,kind:`LinkedField`,name:`revisions`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactRevisionEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`node`,plural:!1,selections:[r,{alias:null,args:null,kind:`ScalarField`,name:`version`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`size`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`status`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`updatedAt`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:`revisions(limit:100,offset:0)`},{alias:`latestVersion`,args:n,concreteType:`ArtifactRevisionConnection`,kind:`LinkedField`,name:`revisions`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactRevisionEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`node`,plural:!1,selections:[r],storageKey:null}],storageKey:null}],storageKey:`revisions(limit:1,orderBy:[{"direction":"DESC","field":"VERSION"},{"direction":"DESC","field":"UPDATED_AT"}])`},r],storageKey:`artifact(id:"artifact-1")`}]},params:{cacheID:`71987b8f9a83a0e6c2c99b50af2f685f`,id:null,metadata:{},name:`BAIArtifactRevisionTableStoriesQuery`,operationKind:`query`,text:`query BAIArtifactRevisionTableStoriesQuery {
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
  ...BAIArtifactStatusBadgeFragment
  ...BAIArtifactRevisionDownloadButtonFragment
  ...BAIArtifactRevisionDeleteButtonFragment
}

fragment BAIArtifactRevisionTableLatestRevisionFragment on ArtifactRevision {
  id
}

fragment BAIArtifactStatusBadgeFragment on ArtifactRevision {
  status
}
`}}})(),S.hash=`c76ddd2bc0d0edc5ec72cca26edf6ad9`})))()}var w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,Se,G,K,q,J,Y,X,Z,Q,Ce;function $(){return($=t((()=>{C(),ye(),_e(),fe(),ie(),x(),w=n(),T=d(),E=s(),Se={title:`Fragments/BAIArtifactRevisionTable`,component:b,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:`
**BAIArtifactRevisionTable** is a specialized table component for displaying artifact revision history with Relay GraphQL integration.

## BAI-Specific Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`artifactRevisionFrgmt\` | \`BAIArtifactRevisionTableArtifactRevisionFragment$key\` | - | GraphQL fragment reference for revisions (required) |
| \`latestRevisionFrgmt\` | \`BAIArtifactRevisionTableLatestRevisionFragment$key \\| null\` | - | Fragment reference for latest revision indicator |
| \`customizeColumns\` | \`(baseColumns) => BAIColumnType[]\` | - | Function to customize table columns |

## Pre-configured Columns
- **Version**: Revision version with "Latest" badge and PULLED status badge
- **Status**: Revision status (SCANNED, PULLING, VERIFYING, FAILED) with tag
- **Size**: Revision size in human-readable format
- **Updated**: Time since last update (relative time)

For other props (loading, pagination, etc.), refer to [BAITable](?path=/docs/table-baitable--docs).
        `}}},argTypes:{artifactRevisionFrgmt:{control:!1,description:`GraphQL fragment reference for artifact revisions`,table:{type:{summary:`BAIArtifactRevisionTableArtifactRevisionFragment$key`}}},latestRevisionFrgmt:{control:!1,description:`GraphQL fragment reference for latest revision indicator`,table:{type:{summary:`BAIArtifactRevisionTableLatestRevisionFragment$key | null | undefined`}}},customizeColumns:{control:!1,description:`Function to customize table columns. Receives base columns and returns customized columns.`,table:{type:{summary:`(baseColumns: BAIColumnType[]) => BAIColumnType[]`}}}},decorators:[(e,t)=>{let n=t.globals.locale||`en`,r=ve[n]||ve.en;return(0,E.jsx)(re,{locale:r,clientPromise:he,anonymousClientFactory:ge,children:(0,E.jsx)(e,{})})}]},G=({customizeColumns:e,loading:t})=>{var n,r;let{artifact:i}=(0,T.useLazyLoadQuery)(S,{}),a=(i==null||(n=i.revisions)==null?void 0:n.edges.map(e=>e==null?void 0:e.node).filter(e=>!!e))??[],o=(i==null||(r=i.latestVersion)==null||(r=r.edges)==null||(r=r[0])==null?void 0:r.node)??null;return(0,E.jsx)(b,{artifactRevisionFrgmt:a,latestRevisionFrgmt:o,customizeColumns:e,loading:t,pagination:{total:a.length,pageSize:10}})},K=(e,t={})=>({id:btoa(`ArtifactRevisionNode:revision-${e}`),version:`v1.${e}.0`,size:`${(e+1)*1024*1024*100}`,status:`SCANNED`,updatedAt:new Date(Date.now()-e*24*60*60*1e3).toISOString(),...t}),q={name:`Basic`,parameters:{docs:{description:{story:`Basic artifact revision table displaying multiple revisions with their statuses and metadata.`}}},render:e=>(0,E.jsx)(p,{mockResolvers:{Query:()=>({artifact:{revisions:{edges:[{node:K(1)},{node:K(2,{status:`PULLING`})},{node:K(3)},{node:K(4,{status:`VERIFYING`})},{node:K(5)}]},latestVersion:{edges:[{node:{id:btoa(`ArtifactRevisionNode:revision-1`)}}]}}})},children:(0,E.jsx)(G,{...e})})},J={name:`DifferentStatuses`,parameters:{docs:{description:{story:`Displays artifact revisions with different statuses (SCANNED, PULLING, VERIFYING, FAILED, PULLED).`}}},render:()=>(0,E.jsx)(p,{mockResolvers:{Query:()=>({artifact:{revisions:{edges:[{node:K(1,{status:`SCANNED`,version:`v2.0.0`})},{node:K(2,{status:`PULLING`,version:`v1.9.0`})},{node:K(3,{status:`VERIFYING`,version:`v1.8.0`})},{node:K(4,{status:`FAILED`,version:`v1.7.0`})},{node:K(5,{status:`PULLED`,version:`v1.6.0`})}]},latestVersion:{edges:[{node:{id:btoa(`ArtifactRevisionNode:revision-1`)}}]}}})},children:(0,E.jsx)(G,{})})},Y={name:`CustomColumns`,parameters:{docs:{description:{story:`Demonstrates column customization by adding an actions column to the table.`}}},render:()=>(0,E.jsx)(p,{mockResolvers:{Query:()=>({artifact:{revisions:{edges:[{node:K(1)},{node:K(2)},{node:K(3)}]},latestVersion:{edges:[{node:{id:btoa(`ArtifactRevisionNode:revision-1`)}}]}}})},children:(0,E.jsx)(G,{customizeColumns:e=>[...e,{key:`actions`,title:`Actions`,width:150,render:()=>(0,E.jsx)(f,{type:`primary`,size:`small`,children:`Download`})}]})})},X={name:`LoadingState`,parameters:{docs:{description:{story:`Shows the artifact revision table in a loading state with reduced opacity.`}}},render:()=>(0,E.jsx)(p,{mockResolvers:{Query:()=>({artifact:{revisions:{edges:[{node:K(1)},{node:K(2)}]},latestVersion:{edges:[{node:{id:btoa(`ArtifactRevisionNode:revision-1`)}}]}}})},children:(0,E.jsx)(G,{loading:!0})})},Z={name:`EmptyState`,parameters:{docs:{description:{story:`Shows the artifact revision table when no revisions are available.`}}},render:()=>(0,E.jsx)(p,{mockResolvers:{Query:()=>({artifact:{revisions:{edges:[]},latestVersion:{edges:[]}}})},children:(0,E.jsx)(G,{})})},Q={name:`RealWorldUsage`,parameters:{docs:{description:{story:`Demonstrates a realistic use case showing version history with latest revision indicator.`}}},render:()=>{let[e,t]=(0,w.useState)(null);return(0,E.jsxs)(`div`,{children:[(0,E.jsxs)(`div`,{style:{marginBottom:16,padding:12,background:`#f5f5f5`,borderRadius:4},children:[(0,E.jsx)(`strong`,{children:`Selected Revision:`}),` `,e||`None selected`]}),(0,E.jsx)(p,{mockResolvers:{Query:()=>({artifact:{revisions:{edges:[{node:K(1,{version:`v2.1.0`,status:`SCANNED`,size:`524288000`})},{node:K(2,{version:`v2.0.1`,status:`PULLED`,size:`520093696`})},{node:K(3,{version:`v2.0.0`,status:`SCANNED`,size:`515899392`})},{node:K(4,{version:`v1.9.5`,status:`PULLING`,size:`511705088`})},{node:K(5,{version:`v1.9.0`,status:`SCANNED`,size:`507510784`})}]},latestVersion:{edges:[{node:{id:btoa(`ArtifactRevisionNode:revision-1`)}}]}}})},children:(0,E.jsx)(G,{customizeColumns:e=>[...e,{key:`actions`,title:`Actions`,width:120,render:(e,n)=>(0,E.jsx)(f,{type:`link`,size:`small`,onClick:()=>t(n.version),children:`Select`})}]})})]})}},q.parameters={...q.parameters,docs:{...(D=q.parameters)==null?void 0:D.docs,source:{originalSource:`{
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
}`,...(O=q.parameters)==null||(O=O.docs)==null?void 0:O.source},description:{story:`Basic revision table with multiple revisions showing version history.`,...(k=q.parameters)==null||(k=k.docs)==null?void 0:k.description}}},J.parameters={...J.parameters,docs:{...(A=J.parameters)==null?void 0:A.docs,source:{originalSource:`{
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
}`,...(j=J.parameters)==null||(j=j.docs)==null?void 0:j.source},description:{story:`Revision table showing different revision statuses.`,...(M=J.parameters)==null||(M=M.docs)==null?void 0:M.description}}},Y.parameters={...Y.parameters,docs:{...(N=Y.parameters)==null?void 0:N.docs,source:{originalSource:`{
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
}`,...(P=Y.parameters)==null||(P=P.docs)==null?void 0:P.source},description:{story:`Revision table with custom columns including action buttons.`,...(F=Y.parameters)==null||(F=F.docs)==null?void 0:F.description}}},X.parameters={...X.parameters,docs:{...(I=X.parameters)==null?void 0:I.docs,source:{originalSource:`{
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
}`,...(L=X.parameters)==null||(L=L.docs)==null?void 0:L.source},description:{story:`Revision table in loading state.`,...(R=X.parameters)==null||(R=R.docs)==null?void 0:R.description}}},Z.parameters={...Z.parameters,docs:{...(z=Z.parameters)==null?void 0:z.docs,source:{originalSource:`{
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
}`,...(B=Z.parameters)==null||(B=B.docs)==null?void 0:B.source},description:{story:`Revision table with no revisions (empty state).`,...(V=Z.parameters)==null||(V=V.docs)==null?void 0:V.description}}},Q.parameters={...Q.parameters,docs:{...(H=Q.parameters)==null?void 0:H.docs,source:{originalSource:`{
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
}`,...(U=Q.parameters)==null||(U=U.docs)==null?void 0:U.source},description:{story:`Real-world example with version history and latest revision indicator.`,...(W=Q.parameters)==null||(W=W.docs)==null?void 0:W.description}}},Ce=[`Default`,`DifferentStatuses`,`WithCustomColumns`,`Loading`,`Empty`,`RealWorldExample`]})))()}$();export{q as Default,J as DifferentStatuses,Z as Empty,X as Loading,Q as RealWorldExample,Y as WithCustomColumns,Ce as __namedExportsOrder,Se as default};