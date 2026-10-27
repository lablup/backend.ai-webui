import{n as e,o as t}from"./rolldown-runtime-2s6bX4vc.js";import{n,t as r}from"./map-CIqW7OVA.js";import{n as i,t as a}from"./useBAIi18n-BoXCk5K0.js";import{t as o}from"./dayjs.min-B7AEa451.js";import{a as s,c,i as l,o as u,s as d}from"./iframe-DR2sIF5r.js";import{n as ee,t as te}from"./BAIFlex-CAz1t6J5.js";import{c as f,o as p,r as m}from"./helper-DV0q0X9R.js";import{n as h,t as g}from"./BAIButton-C-o5ANgR.js";import{n as _,t as v}from"./BAITable-BlL2P1wn.js";import{n as y,t as b}from"./BAIArtifactStatusBadge-D59KigO4.js";import{a as x,i as S,n as C,r as w}from"./storybook-mock-utils-B0PJ9qWR.js";import{n as T,t as E}from"./RelayResolver-b1nJU57O.js";import{useState as D}from"react";import{jsx as O,jsxs as k}from"react/jsx-runtime";import{useFragment as A,useLazyLoadQuery as j}from"react-relay";import{Badge as M}from"@lablup/ui-common/Badge";var N;function P(){return(P=e((()=>{N={argumentDefinitions:[],kind:`Fragment`,metadata:{plural:!0},name:`BAIArtifactRevisionTableArtifactRevisionFragment`,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`version`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`size`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`status`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`updatedAt`,storageKey:null},{args:null,kind:`FragmentSpread`,name:`BAIArtifactStatusBadgeFragment`},{args:null,kind:`FragmentSpread`,name:`BAIArtifactRevisionDownloadButtonFragment`},{args:null,kind:`FragmentSpread`,name:`BAIArtifactRevisionDeleteButtonFragment`}],type:`ArtifactRevision`,abstractKey:null},N.hash=`4b886a8f1069332114e0162802fc049f`})))()}var F;function I(){return(I=e((()=>{F={argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAIArtifactRevisionTableLatestRevisionFragment`,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null}],type:`ArtifactRevision`,abstractKey:null},F.hash=`7598c47b813de8a7d1823fd229eeda60`})))()}var L,R,z;function B(){return(B=e((()=>{P(),I(),f(),a(),ee(),c(),_(),y(),L=t(o(),1),R=t(u(),1),r(),L.default.extend(R.default),z=({artifactRevisionFrgmt:e,latestRevisionFrgmt:t,customizeColumns:r,...a})=>{let{t:o}=i(),s=A(N,e),c=A(F,t),l=n(p([{title:o(`comp:BAIArtifactRevisionTable.Version`),dataIndex:`version`,key:`version`,render:(e,t)=>O(`div`,{children:k(te,{align:`center`,gap:`xs`,children:[O(d,{monospace:!0,strong:!0,children:e}),c&&c.id===t.id&&O(M,{variant:`info`,label:`Latest`}),t.status===`PULLED`&&O(M,{variant:`neutral`,label:t.status})]})})},{title:o(`comp:BAIArtifactRevisionTable.Status`),dataIndex:`status`,key:`status`,render:(e,t)=>O(b,{artifactRevisionFrgmt:t})},{title:o(`comp:BAIArtifactRevisionTable.Size`),dataIndex:`size`,key:`size`,render:e=>e?O(d,{monospace:!0,children:m(e,`auto`)?.displayValue}):O(d,{monospace:!0,children:`N/A`})},{title:o(`comp:BAIArtifactTable.Updated`),dataIndex:`updatedAt`,key:`updatedAt`,render:e=>e?O(d,{type:`secondary`,title:(0,L.default)(e).toString(),children:(0,L.default)(e).fromNow()}):`N/A`}])),u=r?r(l):l;return O(v,{scroll:{x:`max-content`},rowKey:e=>e.id,resizable:!0,columns:u,dataSource:s,...a})}})))()}var V;function H(){return(H=e((()=>{V=(function(){var e=[{kind:`Literal`,name:`id`,value:`artifact-1`}],t=[{kind:`Literal`,name:`limit`,value:100},{kind:`Literal`,name:`offset`,value:0}],n=[{kind:`Literal`,name:`limit`,value:1},{kind:`Literal`,name:`orderBy`,value:[{direction:`DESC`,field:`VERSION`},{direction:`DESC`,field:`UPDATED_AT`}]}],r={alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null};return{fragment:{argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAIArtifactRevisionTableStoriesQuery`,selections:[{alias:null,args:e,concreteType:`Artifact`,kind:`LinkedField`,name:`artifact`,plural:!1,selections:[{alias:null,args:t,concreteType:`ArtifactRevisionConnection`,kind:`LinkedField`,name:`revisions`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactRevisionEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{args:null,kind:`FragmentSpread`,name:`BAIArtifactRevisionTableArtifactRevisionFragment`}],storageKey:null}],storageKey:null}],storageKey:`revisions(limit:100,offset:0)`},{alias:`latestVersion`,args:n,concreteType:`ArtifactRevisionConnection`,kind:`LinkedField`,name:`revisions`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactRevisionEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{args:null,kind:`FragmentSpread`,name:`BAIArtifactRevisionTableLatestRevisionFragment`}],storageKey:null}],storageKey:null}],storageKey:`revisions(limit:1,orderBy:[{"direction":"DESC","field":"VERSION"},{"direction":"DESC","field":"UPDATED_AT"}])`}],storageKey:`artifact(id:"artifact-1")`}],type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[],kind:`Operation`,name:`BAIArtifactRevisionTableStoriesQuery`,selections:[{alias:null,args:e,concreteType:`Artifact`,kind:`LinkedField`,name:`artifact`,plural:!1,selections:[{alias:null,args:t,concreteType:`ArtifactRevisionConnection`,kind:`LinkedField`,name:`revisions`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactRevisionEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`node`,plural:!1,selections:[r,{alias:null,args:null,kind:`ScalarField`,name:`version`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`size`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`status`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`updatedAt`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:`revisions(limit:100,offset:0)`},{alias:`latestVersion`,args:n,concreteType:`ArtifactRevisionConnection`,kind:`LinkedField`,name:`revisions`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactRevisionEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`node`,plural:!1,selections:[r],storageKey:null}],storageKey:null}],storageKey:`revisions(limit:1,orderBy:[{"direction":"DESC","field":"VERSION"},{"direction":"DESC","field":"UPDATED_AT"}])`},r],storageKey:`artifact(id:"artifact-1")`}]},params:{cacheID:`71987b8f9a83a0e6c2c99b50af2f685f`,id:null,metadata:{},name:`BAIArtifactRevisionTableStoriesQuery`,operationKind:`query`,text:`query BAIArtifactRevisionTableStoriesQuery {
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
`}}})(),V.hash=`c76ddd2bc0d0edc5ec72cca26edf6ad9`})))()}var U,W,G,K,q,J,Y,X,Z,Q;function $(){return($=e((()=>{H(),T(),C(),h(),s(),B(),U={title:`Fragments/BAIArtifactRevisionTable`,component:z,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:`
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
        `}}},argTypes:{artifactRevisionFrgmt:{control:!1,description:`GraphQL fragment reference for artifact revisions`,table:{type:{summary:`BAIArtifactRevisionTableArtifactRevisionFragment$key`}}},latestRevisionFrgmt:{control:!1,description:`GraphQL fragment reference for latest revision indicator`,table:{type:{summary:`BAIArtifactRevisionTableLatestRevisionFragment$key | null | undefined`}}},customizeColumns:{control:!1,description:`Function to customize table columns. Receives base columns and returns customized columns.`,table:{type:{summary:`(baseColumns: BAIColumnType[]) => BAIColumnType[]`}}}},decorators:[(e,t)=>{let n=t.globals.locale||`en`,r=w[n]||w.en;return O(l,{locale:r,clientPromise:x,anonymousClientFactory:S,children:O(e,{})})}]},W=({customizeColumns:e,loading:t})=>{let{artifact:n}=j(V,{}),r=n?.revisions?.edges.map(e=>e?.node).filter(e=>!!e)??[],i=n?.latestVersion?.edges?.[0]?.node??null;return O(z,{artifactRevisionFrgmt:r,latestRevisionFrgmt:i,customizeColumns:e,loading:t,pagination:{total:r.length,pageSize:10}})},G=(e,t={})=>({id:btoa(`ArtifactRevisionNode:revision-${e}`),version:`v1.${e}.0`,size:`${(e+1)*1024*1024*100}`,status:`SCANNED`,updatedAt:new Date(Date.now()-e*24*60*60*1e3).toISOString(),...t}),K={name:`Basic`,parameters:{docs:{description:{story:`Basic artifact revision table displaying multiple revisions with their statuses and metadata.`}}},render:e=>O(E,{mockResolvers:{Query:()=>({artifact:{revisions:{edges:[{node:G(1)},{node:G(2,{status:`PULLING`})},{node:G(3)},{node:G(4,{status:`VERIFYING`})},{node:G(5)}]},latestVersion:{edges:[{node:{id:btoa(`ArtifactRevisionNode:revision-1`)}}]}}})},children:O(W,{...e})})},q={name:`DifferentStatuses`,parameters:{docs:{description:{story:`Displays artifact revisions with different statuses (SCANNED, PULLING, VERIFYING, FAILED, PULLED).`}}},render:()=>O(E,{mockResolvers:{Query:()=>({artifact:{revisions:{edges:[{node:G(1,{status:`SCANNED`,version:`v2.0.0`})},{node:G(2,{status:`PULLING`,version:`v1.9.0`})},{node:G(3,{status:`VERIFYING`,version:`v1.8.0`})},{node:G(4,{status:`FAILED`,version:`v1.7.0`})},{node:G(5,{status:`PULLED`,version:`v1.6.0`})}]},latestVersion:{edges:[{node:{id:btoa(`ArtifactRevisionNode:revision-1`)}}]}}})},children:O(W,{})})},J={name:`CustomColumns`,parameters:{docs:{description:{story:`Demonstrates column customization by adding an actions column to the table.`}}},render:()=>O(E,{mockResolvers:{Query:()=>({artifact:{revisions:{edges:[{node:G(1)},{node:G(2)},{node:G(3)}]},latestVersion:{edges:[{node:{id:btoa(`ArtifactRevisionNode:revision-1`)}}]}}})},children:O(W,{customizeColumns:e=>[...e,{key:`actions`,title:`Actions`,width:150,render:()=>O(g,{type:`primary`,size:`small`,children:`Download`})}]})})},Y={name:`LoadingState`,parameters:{docs:{description:{story:`Shows the artifact revision table in a loading state with reduced opacity.`}}},render:()=>O(E,{mockResolvers:{Query:()=>({artifact:{revisions:{edges:[{node:G(1)},{node:G(2)}]},latestVersion:{edges:[{node:{id:btoa(`ArtifactRevisionNode:revision-1`)}}]}}})},children:O(W,{loading:!0})})},X={name:`EmptyState`,parameters:{docs:{description:{story:`Shows the artifact revision table when no revisions are available.`}}},render:()=>O(E,{mockResolvers:{Query:()=>({artifact:{revisions:{edges:[]},latestVersion:{edges:[]}}})},children:O(W,{})})},Z={name:`RealWorldUsage`,parameters:{docs:{description:{story:`Demonstrates a realistic use case showing version history with latest revision indicator.`}}},render:()=>{let[e,t]=D(null);return k(`div`,{children:[k(`div`,{style:{marginBottom:16,padding:12,background:`#f5f5f5`,borderRadius:4},children:[O(`strong`,{children:`Selected Revision:`}),` `,e||`None selected`]}),O(E,{mockResolvers:{Query:()=>({artifact:{revisions:{edges:[{node:G(1,{version:`v2.1.0`,status:`SCANNED`,size:`524288000`})},{node:G(2,{version:`v2.0.1`,status:`PULLED`,size:`520093696`})},{node:G(3,{version:`v2.0.0`,status:`SCANNED`,size:`515899392`})},{node:G(4,{version:`v1.9.5`,status:`PULLING`,size:`511705088`})},{node:G(5,{version:`v1.9.0`,status:`SCANNED`,size:`507510784`})}]},latestVersion:{edges:[{node:{id:btoa(`ArtifactRevisionNode:revision-1`)}}]}}})},children:O(W,{customizeColumns:e=>[...e,{key:`actions`,title:`Actions`,width:120,render:(e,n)=>O(g,{type:`link`,size:`small`,onClick:()=>t(n.version),children:`Select`})}]})})]})}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
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
}`,...K.parameters?.docs?.source},description:{story:`Basic revision table with multiple revisions showing version history.`,...K.parameters?.docs?.description}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
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
}`,...q.parameters?.docs?.source},description:{story:`Revision table showing different revision statuses.`,...q.parameters?.docs?.description}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
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
}`,...J.parameters?.docs?.source},description:{story:`Revision table with custom columns including action buttons.`,...J.parameters?.docs?.description}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
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
}`,...Y.parameters?.docs?.source},description:{story:`Revision table in loading state.`,...Y.parameters?.docs?.description}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
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
}`,...X.parameters?.docs?.source},description:{story:`Revision table with no revisions (empty state).`,...X.parameters?.docs?.description}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
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
}`,...Z.parameters?.docs?.source},description:{story:`Real-world example with version history and latest revision indicator.`,...Z.parameters?.docs?.description}}},Q=[`Default`,`DifferentStatuses`,`WithCustomColumns`,`Loading`,`Empty`,`RealWorldExample`]})))()}$();export{K as Default,q as DifferentStatuses,X as Empty,Y as Loading,Z as RealWorldExample,J as WithCustomColumns,Q as __namedExportsOrder,U as default};