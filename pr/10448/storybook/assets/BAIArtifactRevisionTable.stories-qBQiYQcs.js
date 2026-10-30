import{a as e,n as t}from"./rolldown-runtime-sJBDdmOt.js";import{t as n}from"./react-DlPsW1c0.js";import{n as r,t as i}from"./map-BLzs52H1.js";import{t as a}from"./jsx-runtime-MKhVqBIO.js";import{n as o,t as s}from"./useBAIi18n-CcDjjg8q.js";import{t as c}from"./dayjs.min-BHb7hAap.js";import{c as l,h as ee,m as u,o as te,s as ne}from"./iframe-D-Kclp6L.js";import{n as re,t as ie}from"./BAIFlex-DnaoYTJ1.js";import{t as ae}from"./react-relay-sHama7hJ.js";import{c as oe,o as se,r as ce}from"./helper-p-d7z67I.js";import{n as le,t as d}from"./Badge-DMuqwqp2.js";import{n as ue,t as f}from"./BAIButton-tK1USOml.js";import{n as de,t as fe}from"./BAITable-_PLHTT3d.js";import{n as pe,t as me}from"./BAIArtifactStatusBadge-CoRH093v.js";import{a as he,i as ge,n as _e,r as p}from"./storybook-mock-utils-BqLAdkd_.js";import{n as ve,t as m}from"./RelayResolver-BnFyFQJn.js";var h;function g(){return(g=t((()=>{h={argumentDefinitions:[],kind:`Fragment`,metadata:{plural:!0},name:`BAIArtifactRevisionTableArtifactRevisionFragment`,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`version`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`size`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`status`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`updatedAt`,storageKey:null},{args:null,kind:`FragmentSpread`,name:`BAIArtifactStatusBadgeFragment`},{args:null,kind:`FragmentSpread`,name:`BAIArtifactRevisionDownloadButtonFragment`},{args:null,kind:`FragmentSpread`,name:`BAIArtifactRevisionDeleteButtonFragment`}],type:`ArtifactRevision`,abstractKey:null},h.hash=`4b886a8f1069332114e0162802fc049f`})))()}var _;function v(){return(v=t((()=>{_={argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAIArtifactRevisionTableLatestRevisionFragment`,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null}],type:`ArtifactRevision`,abstractKey:null},_.hash=`7598c47b813de8a7d1823fd229eeda60`})))()}var y,ye,b,x,S;function C(){return(C=t((()=>{g(),v(),oe(),s(),re(),ee(),de(),pe(),le(),y=e(c(),1),ye=e(l(),1),i(),b=ae(),x=a(),y.default.extend(ye.default),S=({artifactRevisionFrgmt:e,latestRevisionFrgmt:t,customizeColumns:n,...i})=>{let{t:a}=o(),s=(0,b.useFragment)(h,e),c=(0,b.useFragment)(_,t),l=r(se([{title:a(`comp:BAIArtifactRevisionTable.Version`),dataIndex:`version`,key:`version`,render:(e,t)=>(0,x.jsx)(`div`,{children:(0,x.jsxs)(ie,{align:`center`,gap:`xs`,children:[(0,x.jsx)(u,{monospace:!0,strong:!0,children:e}),c&&c.id===t.id&&(0,x.jsx)(d,{variant:`info`,label:`Latest`}),t.status===`PULLED`&&(0,x.jsx)(d,{variant:`neutral`,label:t.status})]})})},{title:a(`comp:BAIArtifactRevisionTable.Status`),dataIndex:`status`,key:`status`,render:(e,t)=>(0,x.jsx)(me,{artifactRevisionFrgmt:t})},{title:a(`comp:BAIArtifactRevisionTable.Size`),dataIndex:`size`,key:`size`,render:e=>{var t;return e?(0,x.jsx)(u,{monospace:!0,children:(t=ce(e,`auto`))==null?void 0:t.displayValue}):(0,x.jsx)(u,{monospace:!0,children:`N/A`})}},{title:a(`comp:BAIArtifactTable.Updated`),dataIndex:`updatedAt`,key:`updatedAt`,render:e=>e?(0,x.jsx)(u,{type:`secondary`,title:(0,y.default)(e).toString(),children:(0,y.default)(e).fromNow()}):`N/A`}])),ee=n?n(l):l;return(0,x.jsx)(fe,{scroll:{x:`max-content`},rowKey:e=>e.id,resizable:!0,columns:ee,dataSource:s,...i})}})))()}var w;function T(){return(T=t((()=>{w=(function(){var e=[{kind:`Literal`,name:`id`,value:`artifact-1`}],t=[{kind:`Literal`,name:`limit`,value:100},{kind:`Literal`,name:`offset`,value:0}],n=[{kind:`Literal`,name:`limit`,value:1},{kind:`Literal`,name:`orderBy`,value:[{direction:`DESC`,field:`VERSION`},{direction:`DESC`,field:`UPDATED_AT`}]}],r={alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null};return{fragment:{argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAIArtifactRevisionTableStoriesQuery`,selections:[{alias:null,args:e,concreteType:`Artifact`,kind:`LinkedField`,name:`artifact`,plural:!1,selections:[{alias:null,args:t,concreteType:`ArtifactRevisionConnection`,kind:`LinkedField`,name:`revisions`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactRevisionEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{args:null,kind:`FragmentSpread`,name:`BAIArtifactRevisionTableArtifactRevisionFragment`}],storageKey:null}],storageKey:null}],storageKey:`revisions(limit:100,offset:0)`},{alias:`latestVersion`,args:n,concreteType:`ArtifactRevisionConnection`,kind:`LinkedField`,name:`revisions`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactRevisionEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{args:null,kind:`FragmentSpread`,name:`BAIArtifactRevisionTableLatestRevisionFragment`}],storageKey:null}],storageKey:null}],storageKey:`revisions(limit:1,orderBy:[{"direction":"DESC","field":"VERSION"},{"direction":"DESC","field":"UPDATED_AT"}])`}],storageKey:`artifact(id:"artifact-1")`}],type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[],kind:`Operation`,name:`BAIArtifactRevisionTableStoriesQuery`,selections:[{alias:null,args:e,concreteType:`Artifact`,kind:`LinkedField`,name:`artifact`,plural:!1,selections:[{alias:null,args:t,concreteType:`ArtifactRevisionConnection`,kind:`LinkedField`,name:`revisions`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactRevisionEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`node`,plural:!1,selections:[r,{alias:null,args:null,kind:`ScalarField`,name:`version`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`size`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`status`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`updatedAt`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:`revisions(limit:100,offset:0)`},{alias:`latestVersion`,args:n,concreteType:`ArtifactRevisionConnection`,kind:`LinkedField`,name:`revisions`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactRevisionEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`node`,plural:!1,selections:[r],storageKey:null}],storageKey:null}],storageKey:`revisions(limit:1,orderBy:[{"direction":"DESC","field":"VERSION"},{"direction":"DESC","field":"UPDATED_AT"}])`},r],storageKey:`artifact(id:"artifact-1")`}]},params:{cacheID:`71987b8f9a83a0e6c2c99b50af2f685f`,id:null,metadata:{},name:`BAIArtifactRevisionTableStoriesQuery`,operationKind:`query`,text:`query BAIArtifactRevisionTableStoriesQuery {
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
`}}})(),w.hash=`c76ddd2bc0d0edc5ec72cca26edf6ad9`})))()}var E,D,O,k,A,j,M,N,P,be,F,I,L,R,z,B,V,H,U,W,G,xe,K,q,J,Y,X,Z,Q,$,Se;function Ce(){return(Ce=t((()=>{T(),ve(),_e(),ue(),ne(),C(),E=n(),D=ae(),O=a(),xe={title:`Fragments/BAIArtifactRevisionTable`,component:S,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:`
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
        `}}},argTypes:{artifactRevisionFrgmt:{control:!1,description:`GraphQL fragment reference for artifact revisions`,table:{type:{summary:`BAIArtifactRevisionTableArtifactRevisionFragment$key`}}},latestRevisionFrgmt:{control:!1,description:`GraphQL fragment reference for latest revision indicator`,table:{type:{summary:`BAIArtifactRevisionTableLatestRevisionFragment$key | null | undefined`}}},customizeColumns:{control:!1,description:`Function to customize table columns. Receives base columns and returns customized columns.`,table:{type:{summary:`(baseColumns: BAIColumnType[]) => BAIColumnType[]`}}}},decorators:[(e,t)=>{let n=t.globals.locale||`en`,r=p[n]||p.en;return(0,O.jsx)(te,{locale:r,clientPromise:he,anonymousClientFactory:ge,children:(0,O.jsx)(e,{})})}]},K=({customizeColumns:e,loading:t})=>{var n,r;let{artifact:i}=(0,D.useLazyLoadQuery)(w,{}),a=(i==null||(n=i.revisions)==null?void 0:n.edges.map(e=>e==null?void 0:e.node).filter(e=>!!e))??[],o=(i==null||(r=i.latestVersion)==null||(r=r.edges)==null||(r=r[0])==null?void 0:r.node)??null;return(0,O.jsx)(S,{artifactRevisionFrgmt:a,latestRevisionFrgmt:o,customizeColumns:e,loading:t,pagination:{total:a.length,pageSize:10}})},q=(e,t={})=>({id:btoa(`ArtifactRevisionNode:revision-${e}`),version:`v1.${e}.0`,size:`${(e+1)*1024*1024*100}`,status:`SCANNED`,updatedAt:new Date(Date.now()-e*24*60*60*1e3).toISOString(),...t}),J={name:`Basic`,parameters:{docs:{description:{story:`Basic artifact revision table displaying multiple revisions with their statuses and metadata.`}}},render:e=>(0,O.jsx)(m,{mockResolvers:{Query:()=>({artifact:{revisions:{edges:[{node:q(1)},{node:q(2,{status:`PULLING`})},{node:q(3)},{node:q(4,{status:`VERIFYING`})},{node:q(5)}]},latestVersion:{edges:[{node:{id:btoa(`ArtifactRevisionNode:revision-1`)}}]}}})},children:(0,O.jsx)(K,{...e})})},Y={name:`DifferentStatuses`,parameters:{docs:{description:{story:`Displays artifact revisions with different statuses (SCANNED, PULLING, VERIFYING, FAILED, PULLED).`}}},render:()=>(0,O.jsx)(m,{mockResolvers:{Query:()=>({artifact:{revisions:{edges:[{node:q(1,{status:`SCANNED`,version:`v2.0.0`})},{node:q(2,{status:`PULLING`,version:`v1.9.0`})},{node:q(3,{status:`VERIFYING`,version:`v1.8.0`})},{node:q(4,{status:`FAILED`,version:`v1.7.0`})},{node:q(5,{status:`PULLED`,version:`v1.6.0`})}]},latestVersion:{edges:[{node:{id:btoa(`ArtifactRevisionNode:revision-1`)}}]}}})},children:(0,O.jsx)(K,{})})},X={name:`CustomColumns`,parameters:{docs:{description:{story:`Demonstrates column customization by adding an actions column to the table.`}}},render:()=>(0,O.jsx)(m,{mockResolvers:{Query:()=>({artifact:{revisions:{edges:[{node:q(1)},{node:q(2)},{node:q(3)}]},latestVersion:{edges:[{node:{id:btoa(`ArtifactRevisionNode:revision-1`)}}]}}})},children:(0,O.jsx)(K,{customizeColumns:e=>[...e,{key:`actions`,title:`Actions`,width:150,render:()=>(0,O.jsx)(f,{type:`primary`,size:`small`,children:`Download`})}]})})},Z={name:`LoadingState`,parameters:{docs:{description:{story:`Shows the artifact revision table in a loading state with reduced opacity.`}}},render:()=>(0,O.jsx)(m,{mockResolvers:{Query:()=>({artifact:{revisions:{edges:[{node:q(1)},{node:q(2)}]},latestVersion:{edges:[{node:{id:btoa(`ArtifactRevisionNode:revision-1`)}}]}}})},children:(0,O.jsx)(K,{loading:!0})})},Q={name:`EmptyState`,parameters:{docs:{description:{story:`Shows the artifact revision table when no revisions are available.`}}},render:()=>(0,O.jsx)(m,{mockResolvers:{Query:()=>({artifact:{revisions:{edges:[]},latestVersion:{edges:[]}}})},children:(0,O.jsx)(K,{})})},$={name:`RealWorldUsage`,parameters:{docs:{description:{story:`Demonstrates a realistic use case showing version history with latest revision indicator.`}}},render:()=>{let[e,t]=(0,E.useState)(null);return(0,O.jsxs)(`div`,{children:[(0,O.jsxs)(`div`,{style:{marginBottom:16,padding:12,background:`#f5f5f5`,borderRadius:4},children:[(0,O.jsx)(`strong`,{children:`Selected Revision:`}),` `,e||`None selected`]}),(0,O.jsx)(m,{mockResolvers:{Query:()=>({artifact:{revisions:{edges:[{node:q(1,{version:`v2.1.0`,status:`SCANNED`,size:`524288000`})},{node:q(2,{version:`v2.0.1`,status:`PULLED`,size:`520093696`})},{node:q(3,{version:`v2.0.0`,status:`SCANNED`,size:`515899392`})},{node:q(4,{version:`v1.9.5`,status:`PULLING`,size:`511705088`})},{node:q(5,{version:`v1.9.0`,status:`SCANNED`,size:`507510784`})}]},latestVersion:{edges:[{node:{id:btoa(`ArtifactRevisionNode:revision-1`)}}]}}})},children:(0,O.jsx)(K,{customizeColumns:e=>[...e,{key:`actions`,title:`Actions`,width:120,render:(e,n)=>(0,O.jsx)(f,{type:`link`,size:`small`,onClick:()=>t(n.version),children:`Select`})}]})})]})}},J.parameters={...J.parameters,docs:{...(k=J.parameters)==null?void 0:k.docs,source:{originalSource:`{
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
}`,...(A=J.parameters)==null||(A=A.docs)==null?void 0:A.source},description:{story:`Basic revision table with multiple revisions showing version history.`,...(j=J.parameters)==null||(j=j.docs)==null?void 0:j.description}}},Y.parameters={...Y.parameters,docs:{...(M=Y.parameters)==null?void 0:M.docs,source:{originalSource:`{
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
}`,...(N=Y.parameters)==null||(N=N.docs)==null?void 0:N.source},description:{story:`Revision table showing different revision statuses.`,...(P=Y.parameters)==null||(P=P.docs)==null?void 0:P.description}}},X.parameters={...X.parameters,docs:{...(be=X.parameters)==null?void 0:be.docs,source:{originalSource:`{
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
}`,...(F=X.parameters)==null||(F=F.docs)==null?void 0:F.source},description:{story:`Revision table with custom columns including action buttons.`,...(I=X.parameters)==null||(I=I.docs)==null?void 0:I.description}}},Z.parameters={...Z.parameters,docs:{...(L=Z.parameters)==null?void 0:L.docs,source:{originalSource:`{
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
}`,...(R=Z.parameters)==null||(R=R.docs)==null?void 0:R.source},description:{story:`Revision table in loading state.`,...(z=Z.parameters)==null||(z=z.docs)==null?void 0:z.description}}},Q.parameters={...Q.parameters,docs:{...(B=Q.parameters)==null?void 0:B.docs,source:{originalSource:`{
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
}`,...(V=Q.parameters)==null||(V=V.docs)==null?void 0:V.source},description:{story:`Revision table with no revisions (empty state).`,...(H=Q.parameters)==null||(H=H.docs)==null?void 0:H.description}}},$.parameters={...$.parameters,docs:{...(U=$.parameters)==null?void 0:U.docs,source:{originalSource:`{
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
}`,...(W=$.parameters)==null||(W=W.docs)==null?void 0:W.source},description:{story:`Real-world example with version history and latest revision indicator.`,...(G=$.parameters)==null||(G=G.docs)==null?void 0:G.description}}},Se=[`Default`,`DifferentStatuses`,`WithCustomColumns`,`Loading`,`Empty`,`RealWorldExample`]})))()}Ce();export{J as Default,Y as DifferentStatuses,Q as Empty,Z as Loading,$ as RealWorldExample,X as WithCustomColumns,Se as __namedExportsOrder,xe as default};