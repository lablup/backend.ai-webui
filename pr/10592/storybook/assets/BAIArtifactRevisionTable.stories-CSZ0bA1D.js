import{a as oe,j as e,B as b,b7 as I,bc as le,r as de,aS as ce}from"./iframe-BsIzX8i3.js";import{R as d}from"./RelayResolver-C2zyL-Et.js";import{m as me,a as ue,l as F}from"./storybook-mock-utils-gk3nbAE0.js";import{B as ne}from"./BAIButton-4EjzAJ-Z.js";import{f as ve,a as pe}from"./index-DjvrADwV.js";import{B as ge}from"./BAIFlex-DFWVO9SM.js";import{B as fe}from"./BAIArtifactStatusBadge-BN4w7Og4.js";import{r as S}from"./index-BX15HoEG.js";import{m as Re}from"./map-DaM3fPgv.js";import{B}from"./Badge-D4nN5mhJ.js";import{B as ye}from"./BAITable-Dm3JLe6J.js";import"./preload-helper-Dp1pzeXC.js";import"./index-BM3WsMDZ.js";import"./astryxLabel-Dgy7MIxD.js";import"./isNumber-Dmm_ReUB.js";import"./toString-CXaxLiMU.js";import"./isSymbol-BT_lbwvb.js";import"./filter-BI86odnu.js";import"./_baseEach-IogFqdiy.js";import"./get-BEk1ufgu.js";import"./_baseGet-CYhQvcug.js";import"./identity-DKeuBCMA.js";import"./isEmpty-JurY7Mbc.js";import"./DataGrid2-iBuEaEJi.js";import"./flatMap-BLly6RwB.js";import"./_baseFlatten-CTzlWWNt.js";import"./castArray-Bf2HNqPo.js";import"./VStack-Cc9A1SyR.js";import"./Banner-DP07hQ3Q.js";import"./composeEventHandlers-BolWE7qY.js";import"./TextInput-B3qNFuh1.js";import"./FieldStatus-WlEnO4O4.js";import"./FormLayoutContext-CPeezq34.js";import"./useIsHydrating-Cc0gww62.js";import"./useInputStatusIcon-CtCG24Ql.js";import"./useResolvedRequired-95d4qc9n.js";import"./fieldParts-DXOPpLha.js";import"./useDevWarning-drndngcz.js";import"./inputAria-CStWn1wH.js";import"./InputClearButton-C4jGXrEI.js";import"./inputStyles.stylex-Bztz6H8O.js";import"./Field-C7-YToXo.js";import"./CheckboxInput-DHi-H5d7.js";import"./indicator.markers.stylex-C9_xmYKS.js";import"./useIndicator-C58SfcF3.js";import"./rtlStyles-T4i24HtE.js";import"./characters-DWaYg7k3.js";import"./MenuBottomSheetActionList-CLq-WX6o.js";import"./useMenuOverflow-DQWPxV1x.js";import"./useMenuDrillIn-CxN2vn_k.js";import"./Item-B9y3gd7i.js";import"./computeTargetAndRel-BGwjeA1c.js";import"./Divider-BEn9iqry.js";import"./useListFocus-hDNhIoo6.js";import"./isRtlElement-B2-7SF8s.js";import"./useMenuHover-B5K2r7e2.js";import"./clampInlineSize-CP0OWgfb.js";import"./useFocusReturnVisibility-CQt6pVP7.js";import"./ListItem-BHAhqq_Q.js";import"./EmptyState-IKOUyLzH.js";import"./useScrollableArea-Bs0pU5Sy.js";import"./Selector-BcVzkAsb.js";import"./selectorPresentation.stylex-DKsmM8T7.js";import"./Section-CpmaAer3.js";import"./usePopover-CljR6LCt.js";import"./useAnnounceRenderedText-Bt6kuLMh.js";import"./useHighlightedOptionScroll-CrdfIFZH.js";import"./SelectorOption-Bi1iOQQz.js";import"./NumberInput-8YGMGMsR.js";import"./useLocale-C9ja8GkH.js";import"./settings-Dq3tazyi.js";import"./find-C06614D5.js";import"./_baseFindIndex-Cj99RmFE.js";import"./toInteger-1JYF8OaH.js";import"./toFinite-BHh6t22u.js";import"./toNumber-DUjOngbv.js";import"./_trimmedEndIndex-DuQxD0U0.js";import"./sortBy-Cjnhn48h.js";import"./_baseRest-DfotC6E1.js";import"./_overRest-COpdWwzJ.js";import"./_defineProperty-Za5waWEb.js";import"./_isIterateeCall-BdZeXwS2.js";import"./uniq-C3oXKyfe.js";import"./_baseUniq-BASqIFMi.js";import"./_baseIndexOf-Be9UPhX8.js";const ie={argumentDefinitions:[],kind:"Fragment",metadata:{plural:!0},name:"BAIArtifactRevisionTableArtifactRevisionFragment",selections:[{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"version",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"size",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"status",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"updatedAt",storageKey:null},{args:null,kind:"FragmentSpread",name:"BAIArtifactStatusBadgeFragment"},{args:null,kind:"FragmentSpread",name:"BAIArtifactRevisionDownloadButtonFragment"},{args:null,kind:"FragmentSpread",name:"BAIArtifactRevisionDeleteButtonFragment"}],type:"ArtifactRevision",abstractKey:null};ie.hash="4b886a8f1069332114e0162802fc049f";const se={argumentDefinitions:[],kind:"Fragment",metadata:null,name:"BAIArtifactRevisionTableLatestRevisionFragment",selections:[{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null}],type:"ArtifactRevision",abstractKey:null};se.hash="7598c47b813de8a7d1823fd229eeda60";I.extend(le);const ae=({artifactRevisionFrgmt:n,latestRevisionFrgmt:a,customizeColumns:s,...r})=>{const{t:o}=oe(),A=S.useFragment(ie,n),m=S.useFragment(se,a),u=Re(ve([{title:o("comp:BAIArtifactRevisionTable.Version"),dataIndex:"version",key:"version",render:(i,l)=>e.jsx("div",{children:e.jsxs(ge,{align:"center",gap:"xs",children:[e.jsx(b,{monospace:!0,strong:!0,children:i}),m&&m.id===l.id&&e.jsx(B,{variant:"info",label:"Latest"}),l.status==="PULLED"&&e.jsx(B,{variant:"neutral",label:l.status})]})})},{title:o("comp:BAIArtifactRevisionTable.Status"),dataIndex:"status",key:"status",render:(i,l)=>e.jsx(fe,{artifactRevisionFrgmt:l})},{title:o("comp:BAIArtifactRevisionTable.Size"),dataIndex:"size",key:"size",render:i=>{var l;return i?e.jsx(b,{monospace:!0,children:(l=pe(i,"auto"))==null?void 0:l.displayValue}):e.jsx(b,{monospace:!0,children:"N/A"})}},{title:o("comp:BAIArtifactTable.Updated"),dataIndex:"updatedAt",key:"updatedAt",render:i=>i?e.jsx(b,{type:"secondary",title:I(i).toString(),children:I(i).fromNow()}):"N/A"}])),k=s?s(u):u;return e.jsx(ye,{scroll:{x:"max-content"},rowKey:i=>i.id,resizable:!0,columns:k,dataSource:A,...r})},re=(function(){var n=[{kind:"Literal",name:"id",value:"artifact-1"}],a=[{kind:"Literal",name:"limit",value:100},{kind:"Literal",name:"offset",value:0}],s=[{kind:"Literal",name:"limit",value:1},{kind:"Literal",name:"orderBy",value:[{direction:"DESC",field:"VERSION"},{direction:"DESC",field:"UPDATED_AT"}]}],r={alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null};return{fragment:{argumentDefinitions:[],kind:"Fragment",metadata:null,name:"BAIArtifactRevisionTableStoriesQuery",selections:[{alias:null,args:n,concreteType:"Artifact",kind:"LinkedField",name:"artifact",plural:!1,selections:[{alias:null,args:a,concreteType:"ArtifactRevisionConnection",kind:"LinkedField",name:"revisions",plural:!1,selections:[{alias:null,args:null,concreteType:"ArtifactRevisionEdge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"ArtifactRevision",kind:"LinkedField",name:"node",plural:!1,selections:[{args:null,kind:"FragmentSpread",name:"BAIArtifactRevisionTableArtifactRevisionFragment"}],storageKey:null}],storageKey:null}],storageKey:"revisions(limit:100,offset:0)"},{alias:"latestVersion",args:s,concreteType:"ArtifactRevisionConnection",kind:"LinkedField",name:"revisions",plural:!1,selections:[{alias:null,args:null,concreteType:"ArtifactRevisionEdge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"ArtifactRevision",kind:"LinkedField",name:"node",plural:!1,selections:[{args:null,kind:"FragmentSpread",name:"BAIArtifactRevisionTableLatestRevisionFragment"}],storageKey:null}],storageKey:null}],storageKey:'revisions(limit:1,orderBy:[{"direction":"DESC","field":"VERSION"},{"direction":"DESC","field":"UPDATED_AT"}])'}],storageKey:'artifact(id:"artifact-1")'}],type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[],kind:"Operation",name:"BAIArtifactRevisionTableStoriesQuery",selections:[{alias:null,args:n,concreteType:"Artifact",kind:"LinkedField",name:"artifact",plural:!1,selections:[{alias:null,args:a,concreteType:"ArtifactRevisionConnection",kind:"LinkedField",name:"revisions",plural:!1,selections:[{alias:null,args:null,concreteType:"ArtifactRevisionEdge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"ArtifactRevision",kind:"LinkedField",name:"node",plural:!1,selections:[r,{alias:null,args:null,kind:"ScalarField",name:"version",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"size",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"status",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"updatedAt",storageKey:null}],storageKey:null}],storageKey:null}],storageKey:"revisions(limit:100,offset:0)"},{alias:"latestVersion",args:s,concreteType:"ArtifactRevisionConnection",kind:"LinkedField",name:"revisions",plural:!1,selections:[{alias:null,args:null,concreteType:"ArtifactRevisionEdge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"ArtifactRevision",kind:"LinkedField",name:"node",plural:!1,selections:[r],storageKey:null}],storageKey:null}],storageKey:'revisions(limit:1,orderBy:[{"direction":"DESC","field":"VERSION"},{"direction":"DESC","field":"UPDATED_AT"}])'},r],storageKey:'artifact(id:"artifact-1")'}]},params:{cacheID:"71987b8f9a83a0e6c2c99b50af2f685f",id:null,metadata:{},name:"BAIArtifactRevisionTableStoriesQuery",operationKind:"query",text:`query BAIArtifactRevisionTableStoriesQuery {
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
`}}})();re.hash="c76ddd2bc0d0edc5ec72cca26edf6ad9";const Ht={title:"Fragments/BAIArtifactRevisionTable",component:ae,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:`
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
        `}}},argTypes:{artifactRevisionFrgmt:{control:!1,description:"GraphQL fragment reference for artifact revisions",table:{type:{summary:"BAIArtifactRevisionTableArtifactRevisionFragment$key"}}},latestRevisionFrgmt:{control:!1,description:"GraphQL fragment reference for latest revision indicator",table:{type:{summary:"BAIArtifactRevisionTableLatestRevisionFragment$key | null | undefined"}}},customizeColumns:{control:!1,description:"Function to customize table columns. Receives base columns and returns customized columns.",table:{type:{summary:"(baseColumns: BAIColumnType[]) => BAIColumnType[]"}}}},decorators:[(n,a)=>{const s=a.globals.locale||"en",r=F[s]||F.en;return e.jsx(ce,{locale:r,clientPromise:ue,anonymousClientFactory:me,children:e.jsx(n,{})})}]},c=({customizeColumns:n,loading:a})=>{var A,m,u,k;const{artifact:s}=S.useLazyLoadQuery(re,{}),r=((A=s==null?void 0:s.revisions)==null?void 0:A.edges.map(i=>i==null?void 0:i.node).filter(i=>!!i))??[],o=((k=(u=(m=s==null?void 0:s.latestVersion)==null?void 0:m.edges)==null?void 0:u[0])==null?void 0:k.node)??null;return e.jsx(ae,{artifactRevisionFrgmt:r,latestRevisionFrgmt:o,customizeColumns:n,loading:a,pagination:{total:r.length,pageSize:10}})},t=(n,a={})=>({id:btoa(`ArtifactRevisionNode:revision-${n}`),version:`v1.${n}.0`,size:`${(n+1)*1024*1024*100}`,status:"SCANNED",updatedAt:new Date(Date.now()-n*24*60*60*1e3).toISOString(),...a}),v={name:"Basic",parameters:{docs:{description:{story:"Basic artifact revision table displaying multiple revisions with their statuses and metadata."}}},render:n=>e.jsx(d,{mockResolvers:{Query:()=>({artifact:{revisions:{edges:[{node:t(1)},{node:t(2,{status:"PULLING"})},{node:t(3)},{node:t(4,{status:"VERIFYING"})},{node:t(5)}]},latestVersion:{edges:[{node:{id:btoa("ArtifactRevisionNode:revision-1")}}]}}})},children:e.jsx(c,{...n})})},p={name:"DifferentStatuses",parameters:{docs:{description:{story:"Displays artifact revisions with different statuses (SCANNED, PULLING, VERIFYING, FAILED, PULLED)."}}},render:()=>e.jsx(d,{mockResolvers:{Query:()=>({artifact:{revisions:{edges:[{node:t(1,{status:"SCANNED",version:"v2.0.0"})},{node:t(2,{status:"PULLING",version:"v1.9.0"})},{node:t(3,{status:"VERIFYING",version:"v1.8.0"})},{node:t(4,{status:"FAILED",version:"v1.7.0"})},{node:t(5,{status:"PULLED",version:"v1.6.0"})}]},latestVersion:{edges:[{node:{id:btoa("ArtifactRevisionNode:revision-1")}}]}}})},children:e.jsx(c,{})})},g={name:"CustomColumns",parameters:{docs:{description:{story:"Demonstrates column customization by adding an actions column to the table."}}},render:()=>e.jsx(d,{mockResolvers:{Query:()=>({artifact:{revisions:{edges:[{node:t(1)},{node:t(2)},{node:t(3)}]},latestVersion:{edges:[{node:{id:btoa("ArtifactRevisionNode:revision-1")}}]}}})},children:e.jsx(c,{customizeColumns:n=>[...n,{key:"actions",title:"Actions",width:150,render:()=>e.jsx(ne,{type:"primary",size:"small",children:"Download"})}]})})},f={name:"LoadingState",parameters:{docs:{description:{story:"Shows the artifact revision table in a loading state with reduced opacity."}}},render:()=>e.jsx(d,{mockResolvers:{Query:()=>({artifact:{revisions:{edges:[{node:t(1)},{node:t(2)}]},latestVersion:{edges:[{node:{id:btoa("ArtifactRevisionNode:revision-1")}}]}}})},children:e.jsx(c,{loading:!0})})},R={name:"EmptyState",parameters:{docs:{description:{story:"Shows the artifact revision table when no revisions are available."}}},render:()=>e.jsx(d,{mockResolvers:{Query:()=>({artifact:{revisions:{edges:[]},latestVersion:{edges:[]}}})},children:e.jsx(c,{})})},y={name:"RealWorldUsage",parameters:{docs:{description:{story:"Demonstrates a realistic use case showing version history with latest revision indicator."}}},render:()=>{const[n,a]=de.useState(null);return e.jsxs("div",{children:[e.jsxs("div",{style:{marginBottom:16,padding:12,background:"#f5f5f5",borderRadius:4},children:[e.jsx("strong",{children:"Selected Revision:"})," ",n||"None selected"]}),e.jsx(d,{mockResolvers:{Query:()=>({artifact:{revisions:{edges:[{node:t(1,{version:"v2.1.0",status:"SCANNED",size:"524288000"})},{node:t(2,{version:"v2.0.1",status:"PULLED",size:"520093696"})},{node:t(3,{version:"v2.0.0",status:"SCANNED",size:"515899392"})},{node:t(4,{version:"v1.9.5",status:"PULLING",size:"511705088"})},{node:t(5,{version:"v1.9.0",status:"SCANNED",size:"507510784"})}]},latestVersion:{edges:[{node:{id:btoa("ArtifactRevisionNode:revision-1")}}]}}})},children:e.jsx(c,{customizeColumns:s=>[...s,{key:"actions",title:"Actions",width:120,render:(r,o)=>e.jsx(ne,{type:"link",size:"small",onClick:()=>a(o.version),children:"Select"})}]})})]})}};var h,L,D,E,N;v.parameters={...v.parameters,docs:{...(h=v.parameters)==null?void 0:h.docs,source:{originalSource:`{
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
}`,...(D=(L=v.parameters)==null?void 0:L.docs)==null?void 0:D.source},description:{story:"Basic revision table with multiple revisions showing version history.",...(N=(E=v.parameters)==null?void 0:E.docs)==null?void 0:N.description}}};var T,C,x,w,z;p.parameters={...p.parameters,docs:{...(T=p.parameters)==null?void 0:T.docs,source:{originalSource:`{
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
}`,...(x=(C=p.parameters)==null?void 0:C.docs)==null?void 0:x.source},description:{story:"Revision table showing different revision statuses.",...(z=(w=p.parameters)==null?void 0:w.docs)==null?void 0:z.description}}};var j,K,V,Q,P;g.parameters={...g.parameters,docs:{...(j=g.parameters)==null?void 0:j.docs,source:{originalSource:`{
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
}`,...(V=(K=g.parameters)==null?void 0:K.docs)==null?void 0:V.source},description:{story:"Revision table with custom columns including action buttons.",...(P=(Q=g.parameters)==null?void 0:Q.docs)==null?void 0:P.description}}};var U,M,G,$,O;f.parameters={...f.parameters,docs:{...(U=f.parameters)==null?void 0:U.docs,source:{originalSource:`{
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
}`,...(G=(M=f.parameters)==null?void 0:M.docs)==null?void 0:G.source},description:{story:"Revision table in loading state.",...(O=($=f.parameters)==null?void 0:$.docs)==null?void 0:O.description}}};var Y,_,W,q,H;R.parameters={...R.parameters,docs:{...(Y=R.parameters)==null?void 0:Y.docs,source:{originalSource:`{
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
}`,...(W=(_=R.parameters)==null?void 0:_.docs)==null?void 0:W.source},description:{story:"Revision table with no revisions (empty state).",...(H=(q=R.parameters)==null?void 0:q.docs)==null?void 0:H.description}}};var J,X,Z,ee,te;y.parameters={...y.parameters,docs:{...(J=y.parameters)==null?void 0:J.docs,source:{originalSource:`{
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
}`,...(Z=(X=y.parameters)==null?void 0:X.docs)==null?void 0:Z.source},description:{story:"Real-world example with version history and latest revision indicator.",...(te=(ee=y.parameters)==null?void 0:ee.docs)==null?void 0:te.description}}};const Jt=["Default","DifferentStatuses","WithCustomColumns","Loading","Empty","RealWorldExample"];export{v as Default,p as DifferentStatuses,R as Empty,f as Loading,y as RealWorldExample,g as WithCustomColumns,Jt as __namedExportsOrder,Ht as default};
