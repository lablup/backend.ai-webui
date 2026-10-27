import{n as e,o as t}from"./rolldown-runtime-2s6bX4vc.js";import{n,t as r}from"./omit-DJc6Ke-e.js";import{n as i,t as a}from"./map-CIqW7OVA.js";import{n as o,t as s}from"./includes-B4oWcpQa.js";import{n as c,t as l}from"./isEmpty-C3CFE_pY.js";import{n as u,t as d}from"./useBAIi18n-BoXCk5K0.js";import{t as f}from"./dayjs.min-B7AEa451.js";import{n as p,t as m}from"./createLucideIcon-CRb7bAU8.js";import{n as h,t as ee}from"./ban-CcKZ-miZ.js";import{n as g,t as _}from"./BAIArtifactTypeToken-12zlAIFn.js";import{a as v,c as y,i as b,o as x,s as S}from"./iframe-DR2sIF5r.js";import{n as te,t as C}from"./BAIFlex-CAz1t6J5.js";import{c as ne,o as re,r as ie,s as ae}from"./helper-DV0q0X9R.js";import{n as oe,t as w}from"./BAIButton-C-o5ANgR.js";import{n as se,t as ce}from"./BAILink-f1waJzHB.js";import{n as le,t as ue}from"./BAITable-BlL2P1wn.js";import{n as de,t as fe}from"./BAIArtifactStatusBadge-D59KigO4.js";import{n as pe,t as me}from"./BAIArtifactRevisionDownloadButton-3fsAJ2CZ.js";import{a as he,i as ge,n as _e,r as T}from"./storybook-mock-utils-B0PJ9qWR.js";import{n as ve,t as E}from"./RelayResolver-b1nJU57O.js";import{useState as D}from"react";import{jsx as O,jsxs as k}from"react/jsx-runtime";import{c as ye}from"react/compiler-runtime";import{useFragment as be,useLazyLoadQuery as xe}from"react-relay";import{Text as A}from"@lablup/ui-common/Text";import{MemoryRouter as Se}from"react-router-dom";import{Link as Ce}from"@lablup/ui-common/Link";var j,M;function N(){return(N=e((()=>{p(),j=[[`path`,{d:`M3 7v6h6`,key:`1v2h90`}],[`path`,{d:`M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13`,key:`1r6uu6`}]],M=m(`undo`,j)})))()}var P;function F(){return(F=e((()=>{P=(function(){var e={alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},t={alias:null,args:null,kind:`ScalarField`,name:`name`,storageKey:null},n=[t,{alias:null,args:null,kind:`ScalarField`,name:`url`,storageKey:null}];return{argumentDefinitions:[],kind:`Fragment`,metadata:{plural:!0},name:`BAIArtifactTableArtifactFragment`,selections:[e,{alias:null,args:null,kind:`ScalarField`,name:`entityId`,storageKey:null},t,{alias:null,args:null,kind:`ScalarField`,name:`description`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`updatedAt`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`scannedAt`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`availability`,storageKey:null},{alias:null,args:null,concreteType:`SourceInfo`,kind:`LinkedField`,name:`registry`,plural:!1,selections:n,storageKey:null},{alias:null,args:null,concreteType:`SourceInfo`,kind:`LinkedField`,name:`source`,plural:!1,selections:n,storageKey:null},{args:null,kind:`FragmentSpread`,name:`BAIArtifactTypeTokenFragment`},{alias:`latestVersion`,args:[{kind:`Literal`,name:`limit`,value:1},{kind:`Literal`,name:`orderBy`,value:[{direction:`DESC`,field:`VERSION`},{direction:`DESC`,field:`UPDATED_AT`}]}],concreteType:`ArtifactRevisionConnection`,kind:`LinkedField`,name:`revisions`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactRevisionEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`node`,plural:!1,selections:[e,{alias:null,args:null,kind:`ScalarField`,name:`version`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`size`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`status`,storageKey:null},{args:null,kind:`FragmentSpread`,name:`BAIArtifactStatusBadgeFragment`},{args:null,kind:`FragmentSpread`,name:`BAIArtifactRevisionDownloadButtonFragment`}],storageKey:null}],storageKey:null}],storageKey:`revisions(limit:1,orderBy:[{"direction":"DESC","field":"VERSION"},{"direction":"DESC","field":"UPDATED_AT"}])`}],type:`Artifact`,abstractKey:null}})(),P.hash=`99d9088d9d3951f760b1f65d41b319f9`})))()}function we(e,t){return k(C,{direction:`column`,align:`start`,wrap:`wrap`,children:[k(C,{gap:`xs`,children:[O(ce,{to:`/reservoir/`+t.entityId,style:{},children:e}),O(_,{artifactTypeFrgmt:t})]}),t.description&&O(A,{color:`secondary`,size:`sm`,display:`block`,children:t.description})]})}function Te(e,t){let n=t.latestVersion?.edges[0]?.node;return!n||c(n)||!n.size?O(S,{monospace:!0,children:`N/A`}):O(S,{monospace:!0,children:ie(n.size,`auto`)?.displayValue})}function Ee(e){return!e||c(e)?O(A,{color:`secondary`,children:`N/A`}):O(A,{color:`secondary`,children:(0,I.default)(e).fromNow()})}function De(e){return!e||c(e)?O(A,{color:`secondary`,children:`N/A`}):O(A,{color:`secondary`,children:(0,I.default)(e).fromNow()})}function Oe(e,t){return O(_,{artifactTypeFrgmt:t})}function ke(e,t){return t?.source?O(A,{children:t?.registry?`${t.registry.name} (${t.registry.url})`:`N/A`}):`-`}function Ae(e,t){return t?.source?O(Ce,{href:t.source.url??``,target:`_blank`,rel:`noopener noreferrer`,children:t.source.name||`N/A`}):`-`}function je(e){return e.id}var I,L,R,z,B;function V(){return(V=e((()=>{F(),ne(),d(),oe(),te(),se(),y(),le(),pe(),de(),g(),I=t(f(),1),L=t(x(),1),o(),l(),r(),a(),h(),N(),I.default.extend(L.default),R=[`name`,`type`,`size`,`scannedAt`,`updatedAt`],[...R,...R.map(e=>`-${e}`)],z=e=>s(R,e),B=e=>{"use memo";let t=ye(39),r,a,o,s,l,d,f;t[0]===e?(r=t[1],a=t[2],o=t[3],s=t[4],l=t[5],d=t[6],f=t[7]):({artifactFragment:r,onClickPull:l,onClickDelete:s,onClickRestore:d,disableSorter:a,onChangeOrder:o,...f}=e,t[0]=e,t[1]=r,t[2]=a,t[3]=o,t[4]=s,t[5]=l,t[6]=d,t[7]=f);let{t:p}=u(),m=be(P,r),h,g,_,v;if(t[8]!==a||t[9]!==s||t[10]!==l||t[11]!==d||t[12]!==p){let e;t[17]!==s||t[18]!==d||t[19]!==p?(e=(e,t)=>{let n=t.availability;if(n===`ALIVE`)return O(w,{title:p(`comp:BAIArtifactTable.Deactivate`),size:`small`,danger:!0,icon:O(ee,{}),onClick:()=>s(t.id)});if(n===`DELETED`)return O(w,{title:p(`comp:BAIArtifactTable.Activate`),size:`small`,icon:O(M,{}),onClick:()=>d(t.id)})},t[17]=s,t[18]=d,t[19]=p,t[20]=e):e=t[20];let r;t[21]!==l||t[22]!==p?(r=(e,t)=>{let n=t.latestVersion?.edges[0]?.node;return!n||c(n)?O(S,{monospace:!0,children:`N/A`}):k(C,{gap:`xs`,wrap:`wrap`,align:`center`,children:[O(S,{monospace:!0,children:n.version}),O(fe,{artifactRevisionFrgmt:n}),n.status===`SCANNED`?O(me,{title:p(`comp:BAIArtifactTable.PullLatestVersion`),revisionsFrgmt:[n],disabled:t.availability!==`ALIVE`,size:`small`,onClick:()=>l(t.id,n.id)}):null]})},t[21]=l,t[22]=p,t[23]=r):r=t[23];let o=[{title:p(`comp:BAIArtifactRevisionTable.Name`),dataIndex:`name`,key:`name`,sorter:z(`name`),render:we},{title:p(`comp:BAIArtifactTable.Controls`),key:`controls`,render:e},{title:p(`comp:BAIArtifactRevisionTable.LatestVersion`),key:`latest_version`,render:r},{title:p(`comp:BAIArtifactRevisionTable.Size`),key:`size`,sorter:z(`size`),render:Te},{title:p(`comp:BAIArtifactTable.Scanned`),dataIndex:`scannedAt`,key:`scanned_at`,sorter:z(`scannedAt`),render:Ee},{title:p(`comp:BAIArtifactRevisionTable.Updated`),dataIndex:`updatedAt`,key:`updated_at`,sorter:z(`updatedAt`),render:De},{title:p(`comp:BAIArtifactDescriptions.Type`),key:`type`,sorter:z(`type`),render:Oe,defaultHidden:!0},{title:p(`comp:BAIArtifactTable.Registry`),dataIndex:`registry.name`,key:`registry.name`,render:ke,defaultHidden:!0},{title:p(`comp:BAIArtifactTable.Source`),dataIndex:`source.name`,key:`source.name`,render:Ae,defaultHidden:!0}];h=ue,t[24]===Symbol.for(`react.memo_cache_sentinel`)?(g={x:`max-content`},t[24]=g):g=t[24],_=je;let u;t[25]===a?u=t[26]:(u=e=>a?n(e,`sorter`):e,t[25]=a,t[26]=u),v=i(re(o),u),t[8]=a,t[9]=s,t[10]=l,t[11]=d,t[12]=p,t[13]=h,t[14]=g,t[15]=_,t[16]=v}else h=t[13],g=t[14],_=t[15],v=t[16];let y;t[27]===m?y=t[28]:(y=ae(m),t[27]=m,t[28]=y);let b;t[29]===o?b=t[30]:(b=e=>{o?.(e||null)},t[29]=o,t[30]=b);let x;return t[31]!==h||t[32]!==g||t[33]!==_||t[34]!==v||t[35]!==y||t[36]!==b||t[37]!==f?(x=O(h,{scroll:g,rowKey:_,columns:v,dataSource:y,onChangeOrder:b,...f}),t[31]=h,t[32]=g,t[33]=_,t[34]=v,t[35]=y,t[36]=b,t[37]=f,t[38]=x):x=t[38],x}})))()}var H;function U(){return(U=e((()=>{H=(function(){var e=[{kind:`Literal`,name:`limit`,value:100},{kind:`Literal`,name:`offset`,value:0}],t={alias:null,args:null,kind:`ScalarField`,name:`count`,storageKey:null},n={alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},r={alias:null,args:null,kind:`ScalarField`,name:`name`,storageKey:null},i=[r,{alias:null,args:null,kind:`ScalarField`,name:`url`,storageKey:null}];return{fragment:{argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAIArtifactTableStoriesQuery`,selections:[{alias:null,args:e,concreteType:`ArtifactConnection`,kind:`LinkedField`,name:`artifacts`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`Artifact`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{args:null,kind:`FragmentSpread`,name:`BAIArtifactTableArtifactFragment`}],storageKey:null}],storageKey:null},t],storageKey:`artifacts(limit:100,offset:0)`}],type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[],kind:`Operation`,name:`BAIArtifactTableStoriesQuery`,selections:[{alias:null,args:e,concreteType:`ArtifactConnection`,kind:`LinkedField`,name:`artifacts`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`Artifact`,kind:`LinkedField`,name:`node`,plural:!1,selections:[n,{alias:null,args:null,kind:`ScalarField`,name:`entityId`,storageKey:null},r,{alias:null,args:null,kind:`ScalarField`,name:`description`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`updatedAt`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`scannedAt`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`availability`,storageKey:null},{alias:null,args:null,concreteType:`SourceInfo`,kind:`LinkedField`,name:`registry`,plural:!1,selections:i,storageKey:null},{alias:null,args:null,concreteType:`SourceInfo`,kind:`LinkedField`,name:`source`,plural:!1,selections:i,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`type`,storageKey:null},{alias:`latestVersion`,args:[{kind:`Literal`,name:`limit`,value:1},{kind:`Literal`,name:`orderBy`,value:[{direction:`DESC`,field:`VERSION`},{direction:`DESC`,field:`UPDATED_AT`}]}],concreteType:`ArtifactRevisionConnection`,kind:`LinkedField`,name:`revisions`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactRevisionEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`node`,plural:!1,selections:[n,{alias:null,args:null,kind:`ScalarField`,name:`version`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`size`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`status`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:`revisions(limit:1,orderBy:[{"direction":"DESC","field":"VERSION"},{"direction":"DESC","field":"UPDATED_AT"}])`}],storageKey:null}],storageKey:null},t],storageKey:`artifacts(limit:100,offset:0)`}]},params:{cacheID:`b60b066f7e3f39045d87d4e23ad6274a`,id:null,metadata:{},name:`BAIArtifactTableStoriesQuery`,operationKind:`query`,text:`query BAIArtifactTableStoriesQuery {
  artifacts(limit: 100, offset: 0) {
    edges {
      node {
        ...BAIArtifactTableArtifactFragment
        id
      }
    }
    count
  }
}

fragment BAIArtifactRevisionDownloadButtonFragment on ArtifactRevision {
  status
}

fragment BAIArtifactStatusBadgeFragment on ArtifactRevision {
  status
}

fragment BAIArtifactTableArtifactFragment on Artifact {
  id
  entityId
  name
  description
  updatedAt
  scannedAt
  availability
  registry {
    name
    url
  }
  source {
    name
    url
  }
  ...BAIArtifactTypeTokenFragment
  latestVersion: revisions(limit: 1, orderBy: [{field: VERSION, direction: DESC}, {field: UPDATED_AT, direction: DESC}]) {
    edges {
      node {
        id
        version
        size
        status
        ...BAIArtifactStatusBadgeFragment
        ...BAIArtifactRevisionDownloadButtonFragment
      }
    }
  }
}

fragment BAIArtifactTypeTokenFragment on Artifact {
  type
}
`}}})(),H.hash=`225cd0f6f4c5c53ba620f42b9e8c1442`})))()}var W,G,K,q,J,Y,X,Z,Q,Me;function $(){return($=e((()=>{U(),ve(),_e(),v(),V(),W={title:`Fragments/BAIArtifactTable`,component:B,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:"\n**BAIArtifactTable** is a specialized table component for displaying Backend.AI artifact information with Relay GraphQL integration.\n\n## BAI-Specific Props\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `artifactFragment` | `BAIArtifactTableArtifactFragment$key` | - | GraphQL fragment reference (required) |\n| `onClickPull` | `(artifactId: string, revisionId: string) => void` | - | Callback when pull button is clicked |\n| `onClickDelete` | `(artifactId: string) => void` | - | Callback when deactivate button is clicked |\n| `onClickRestore` | `(artifactId: string) => void` | - | Callback when activate button is clicked |\n| `order` | `(typeof availableArtifactSorterValues)[number] \\| null` | - | Current sort, e.g. `name` / `-updatedAt` (server-side) |\n| `onChangeOrder` | `(order: (typeof availableArtifactSorterValues)[number] \\| null) => void` | - | Callback when a sortable header is clicked |\n| `disableSorter` | `boolean` | `false` | Strips every column sorter |\n\n## Pre-configured Columns\n- **Name**: Artifact name with type token and description\n- **Controls**: Activate/Deactivate buttons based on artifact availability\n- **Latest Version**: Latest revision version with status badge and pull button\n- **Size**: Latest revision size in human-readable format\n- **Scanned**: Time since last scan (relative time)\n- **Updated**: Time since last update (relative time)\n- **Type**: Artifact type tag (hidden by default; carries the `TYPE` ordering)\n- **Registry**: Registry name and URL (hidden by default)\n- **Source**: Source repository link (hidden by default)\n\nName, Type, Size, Scanned and Updated carry **server-side** sorters: the table is order-controlled, so\n`order` and `onChangeOrder` must be wired together. These stories hold the order in local state, so the\nheader arrows respond, but the mocked resolver does not re-sort the rows — only the real query does.\n\nFor other props (loading, pagination, etc.), refer to [BAITable](?path=/docs/table-baitable--docs).\n        "}}},argTypes:{artifactFragment:{control:!1,description:`GraphQL fragment reference for artifact data`,table:{type:{summary:`BAIArtifactTableArtifactFragment$key`}}},onClickPull:{action:`pull-clicked`,description:`Callback when pull button is clicked`,table:{type:{summary:`(artifactId: string, revisionId: string) => void`}}},onClickDelete:{action:`delete-clicked`,description:`Callback when deactivate button is clicked`,table:{type:{summary:`(artifactId: string) => void`}}},onClickRestore:{action:`restore-clicked`,description:`Callback when activate button is clicked`,table:{type:{summary:`(artifactId: string) => void`}}}},decorators:[(e,t)=>{let n=t.globals.locale||`en`,r=T[n]||T.en;return O(Se,{children:O(b,{locale:r,clientPromise:he,anonymousClientFactory:ge,children:O(e,{})})})}]},G=({onClickPull:e,onClickDelete:t,onClickRestore:n,loading:r})=>{let[i,a]=D(null),{artifacts:o}=xe(H,{}),s=o?.edges.map(e=>e?.node).filter(e=>!!e)??[];return O(B,{artifactFragment:s,order:i,onChangeOrder:a,onClickPull:e,onClickDelete:t,onClickRestore:n,loading:r,pagination:{total:o?.count??0,pageSize:10}})},K=(e,t={})=>({id:btoa(`ArtifactNode:artifact-${e}`),name:`artifact-${e}`,description:`Description for artifact ${e}`,updatedAt:new Date(Date.now()-e*24*60*60*1e3).toISOString(),scannedAt:new Date(Date.now()-e*12*60*60*1e3).toISOString(),availability:`ALIVE`,type:e%3==0?`MODEL`:e%3==1?`PACKAGE`:`IMAGE`,registry:{name:`docker.io`,url:`https://hub.docker.com`},source:{name:`github.com/org/repo-${e}`,url:`https://github.com/org/repo-${e}`},latestVersion:{edges:[{node:{id:btoa(`ArtifactRevisionNode:revision-${e}`),version:`v1.${e}.0`,size:`${(e+1)*1024*1024*100}`,status:`SCANNED`}}]},...t}),q={name:`Basic`,parameters:{docs:{description:{story:`Basic artifact table displaying multiple artifacts with their latest versions and statuses.`}}},render:e=>O(E,{mockResolvers:{Query:()=>({artifacts:{edges:[{node:K(1,{type:`MODEL`})},{node:K(2,{type:`PACKAGE`})},{node:K(3,{type:`IMAGE`})},{node:K(4,{type:`MODEL`,availability:`DELETED`})},{node:K(5,{type:`PACKAGE`,latestVersion:{edges:[{node:{id:btoa(`ArtifactRevisionNode:revision-5`),version:`v1.5.0`,size:`524288000`,status:`PULLING`}}]}})}],count:5}})},children:O(G,{...e})})},J={name:`ActivateDeactivate`,parameters:{docs:{description:{story:`Demonstrates activate and deactivate controls. Click deactivate (ban icon) to mark as deleted, or activate (undo icon) to restore.`}}},render:()=>{let[e,t]=D(null);return k(`div`,{children:[k(`div`,{style:{marginBottom:16},children:[O(`strong`,{children:`Last Action:`}),` `,e||`None`]}),O(E,{mockResolvers:{Query:()=>({artifacts:{edges:[{node:K(1,{availability:`ALIVE`,type:`MODEL`})},{node:K(2,{availability:`DELETED`,type:`PACKAGE`})},{node:K(3,{availability:`ALIVE`,type:`IMAGE`})}],count:3}})},children:O(G,{onClickDelete:e=>t(`Deactivate ${e}`),onClickRestore:e=>t(`Activate ${e}`),onClickPull:(e,n)=>t(`Pull ${e}/${n}`)})})]})}},Y={name:`DifferentStatuses`,parameters:{docs:{description:{story:`Displays artifacts with different revision statuses (SCANNED, PULLING, VERIFYING, FAILED).`}}},render:()=>O(E,{mockResolvers:{Query:()=>({artifacts:{edges:[{node:K(1,{latestVersion:{edges:[{node:{id:btoa(`ArtifactRevisionNode:revision-1`),version:`v1.1.0`,size:`104857600`,status:`SCANNED`}}]}})},{node:K(2,{latestVersion:{edges:[{node:{id:btoa(`ArtifactRevisionNode:revision-2`),version:`v1.2.0`,size:`209715200`,status:`PULLING`}}]}})},{node:K(3,{latestVersion:{edges:[{node:{id:btoa(`ArtifactRevisionNode:revision-3`),version:`v1.3.0`,size:`314572800`,status:`VERIFYING`}}]}})},{node:K(4,{latestVersion:{edges:[{node:{id:btoa(`ArtifactRevisionNode:revision-4`),version:`v1.4.0`,size:`419430400`,status:`FAILED`}}]}})}],count:4}})},children:O(G,{onClickPull:()=>{},onClickDelete:()=>{},onClickRestore:()=>{}})})},X={name:`LoadingState`,parameters:{docs:{description:{story:`Shows the artifact table in a loading state with reduced opacity.`}}},render:()=>O(E,{mockResolvers:{Query:()=>({artifacts:{edges:[{node:K(1)},{node:K(2)}],count:2}})},children:O(G,{loading:!0,onClickPull:()=>{},onClickDelete:()=>{},onClickRestore:()=>{}})})},Z={name:`EmptyState`,parameters:{docs:{description:{story:`Shows the artifact table when no artifacts are available.`}}},render:()=>O(E,{mockResolvers:{Query:()=>({artifacts:{edges:[],count:0}})},children:O(G,{onClickPull:()=>{},onClickDelete:()=>{},onClickRestore:()=>{}})})},Q={name:`RealWorldUsage`,parameters:{docs:{description:{story:`Demonstrates a realistic use case combining pull, activate, and deactivate actions.`}}},render:()=>{let[e,t]=D([]),n=e=>{t(t=>[e,...t].slice(0,5))};return k(`div`,{children:[k(`div`,{style:{marginBottom:16,padding:12,background:`#f5f5f5`,borderRadius:4},children:[O(`strong`,{children:`Recent Actions:`}),e.length>0?O(`ul`,{style:{margin:`8px 0 0 0`,paddingLeft:20},children:e.map((e,t)=>O(`li`,{children:e},t))}):O(`div`,{style:{marginTop:8},children:`No actions yet`})]}),O(E,{mockResolvers:{Query:()=>({artifacts:{edges:[{node:K(1,{type:`MODEL`,availability:`ALIVE`})},{node:K(2,{type:`PACKAGE`,availability:`DELETED`})},{node:K(3,{type:`IMAGE`,availability:`ALIVE`,latestVersion:{edges:[{node:{id:btoa(`ArtifactRevisionNode:revision-3`),version:`v2.0.1`,size:`314572800`,status:`SCANNED`}}]}})},{node:K(4,{type:`MODEL`,availability:`ALIVE`,latestVersion:{edges:[{node:{id:btoa(`ArtifactRevisionNode:revision-4`),version:`v3.1.0`,size:`524288000`,status:`PULLING`}}]}})}],count:4}})},children:O(G,{onClickPull:(e,t)=>n(`Pull: ${e} (revision: ${t})`),onClickDelete:e=>n(`Deactivate: ${e}`),onClickRestore:e=>n(`Activate: ${e}`)})})]})}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'Basic artifact table displaying multiple artifacts with their latest versions and statuses.'
      }
    }
  },
  render: args => <RelayResolver mockResolvers={{
    Query: () => ({
      artifacts: {
        edges: [{
          node: generateMockArtifact(1, {
            type: 'MODEL'
          })
        }, {
          node: generateMockArtifact(2, {
            type: 'PACKAGE'
          })
        }, {
          node: generateMockArtifact(3, {
            type: 'IMAGE'
          })
        }, {
          node: generateMockArtifact(4, {
            type: 'MODEL',
            availability: 'DELETED'
          })
        }, {
          node: generateMockArtifact(5, {
            type: 'PACKAGE',
            latestVersion: {
              edges: [{
                node: {
                  id: btoa('ArtifactRevisionNode:revision-5'),
                  version: 'v1.5.0',
                  size: '524288000',
                  status: 'PULLING'
                }
              }]
            }
          })
        }],
        count: 5
      }
    })
  }}>
      <QueryResolver {...args} />
    </RelayResolver>
}`,...q.parameters?.docs?.source},description:{story:`Basic artifact table with mock data showing various artifact types and statuses.`,...q.parameters?.docs?.description}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  name: 'ActivateDeactivate',
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates activate and deactivate controls. Click deactivate (ban icon) to mark as deleted, or activate (undo icon) to restore.'
      }
    }
  },
  render: () => {
    const [selectedAction, setSelectedAction] = useState<string | null>(null);
    return <div>
        <div style={{
        marginBottom: 16
      }}>
          <strong>Last Action:</strong> {selectedAction || 'None'}
        </div>
        <RelayResolver mockResolvers={{
        Query: () => ({
          artifacts: {
            edges: [{
              node: generateMockArtifact(1, {
                availability: 'ALIVE',
                type: 'MODEL'
              })
            }, {
              node: generateMockArtifact(2, {
                availability: 'DELETED',
                type: 'PACKAGE'
              })
            }, {
              node: generateMockArtifact(3, {
                availability: 'ALIVE',
                type: 'IMAGE'
              })
            }],
            count: 3
          }
        })
      }}>
          <QueryResolver onClickDelete={id => setSelectedAction(\`Deactivate \${id}\`)} onClickRestore={id => setSelectedAction(\`Activate \${id}\`)} onClickPull={(artifactId, revisionId) => setSelectedAction(\`Pull \${artifactId}/\${revisionId}\`)} />
        </RelayResolver>
      </div>;
  }
}`,...J.parameters?.docs?.source},description:{story:`Artifact table with activate/deactivate functionality demonstration.`,...J.parameters?.docs?.description}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  name: 'DifferentStatuses',
  parameters: {
    docs: {
      description: {
        story: 'Displays artifacts with different revision statuses (SCANNED, PULLING, VERIFYING, FAILED).'
      }
    }
  },
  render: () => <RelayResolver mockResolvers={{
    Query: () => ({
      artifacts: {
        edges: [{
          node: generateMockArtifact(1, {
            latestVersion: {
              edges: [{
                node: {
                  id: btoa('ArtifactRevisionNode:revision-1'),
                  version: 'v1.1.0',
                  size: '104857600',
                  status: 'SCANNED'
                }
              }]
            }
          })
        }, {
          node: generateMockArtifact(2, {
            latestVersion: {
              edges: [{
                node: {
                  id: btoa('ArtifactRevisionNode:revision-2'),
                  version: 'v1.2.0',
                  size: '209715200',
                  status: 'PULLING'
                }
              }]
            }
          })
        }, {
          node: generateMockArtifact(3, {
            latestVersion: {
              edges: [{
                node: {
                  id: btoa('ArtifactRevisionNode:revision-3'),
                  version: 'v1.3.0',
                  size: '314572800',
                  status: 'VERIFYING'
                }
              }]
            }
          })
        }, {
          node: generateMockArtifact(4, {
            latestVersion: {
              edges: [{
                node: {
                  id: btoa('ArtifactRevisionNode:revision-4'),
                  version: 'v1.4.0',
                  size: '419430400',
                  status: 'FAILED'
                }
              }]
            }
          })
        }],
        count: 4
      }
    })
  }}>
      <QueryResolver onClickPull={() => {}} onClickDelete={() => {}} onClickRestore={() => {}} />
    </RelayResolver>
}`,...Y.parameters?.docs?.source},description:{story:`Artifact table showing different revision statuses.`,...Y.parameters?.docs?.description}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  name: 'LoadingState',
  parameters: {
    docs: {
      description: {
        story: 'Shows the artifact table in a loading state with reduced opacity.'
      }
    }
  },
  render: () => <RelayResolver mockResolvers={{
    Query: () => ({
      artifacts: {
        edges: [{
          node: generateMockArtifact(1)
        }, {
          node: generateMockArtifact(2)
        }],
        count: 2
      }
    })
  }}>
      <QueryResolver loading={true} onClickPull={() => {}} onClickDelete={() => {}} onClickRestore={() => {}} />
    </RelayResolver>
}`,...X.parameters?.docs?.source},description:{story:`Artifact table in loading state.`,...X.parameters?.docs?.description}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
  name: 'EmptyState',
  parameters: {
    docs: {
      description: {
        story: 'Shows the artifact table when no artifacts are available.'
      }
    }
  },
  render: () => <RelayResolver mockResolvers={{
    Query: () => ({
      artifacts: {
        edges: [],
        count: 0
      }
    })
  }}>
      <QueryResolver onClickPull={() => {}} onClickDelete={() => {}} onClickRestore={() => {}} />
    </RelayResolver>
}`,...Z.parameters?.docs?.source},description:{story:`Artifact table with no artifacts (empty state).`,...Z.parameters?.docs?.description}}},Q.parameters={...Q.parameters,docs:{...Q.parameters?.docs,source:{originalSource:`{
  name: 'RealWorldUsage',
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates a realistic use case combining pull, activate, and deactivate actions.'
      }
    }
  },
  render: () => {
    const [actions, setActions] = useState<string[]>([]);
    const addAction = (action: string) => {
      setActions(prev => [action, ...prev].slice(0, 5));
    };
    return <div>
        <div style={{
        marginBottom: 16,
        padding: 12,
        background: '#f5f5f5',
        borderRadius: 4
      }}>
          <strong>Recent Actions:</strong>
          {actions.length > 0 ? <ul style={{
          margin: '8px 0 0 0',
          paddingLeft: 20
        }}>
              {actions.map((action, idx) => <li key={idx}>{action}</li>)}
            </ul> : <div style={{
          marginTop: 8
        }}>No actions yet</div>}
        </div>
        <RelayResolver mockResolvers={{
        Query: () => ({
          artifacts: {
            edges: [{
              node: generateMockArtifact(1, {
                type: 'MODEL',
                availability: 'ALIVE'
              })
            }, {
              node: generateMockArtifact(2, {
                type: 'PACKAGE',
                availability: 'DELETED'
              })
            }, {
              node: generateMockArtifact(3, {
                type: 'IMAGE',
                availability: 'ALIVE',
                latestVersion: {
                  edges: [{
                    node: {
                      id: btoa('ArtifactRevisionNode:revision-3'),
                      version: 'v2.0.1',
                      size: '314572800',
                      status: 'SCANNED'
                    }
                  }]
                }
              })
            }, {
              node: generateMockArtifact(4, {
                type: 'MODEL',
                availability: 'ALIVE',
                latestVersion: {
                  edges: [{
                    node: {
                      id: btoa('ArtifactRevisionNode:revision-4'),
                      version: 'v3.1.0',
                      size: '524288000',
                      status: 'PULLING'
                    }
                  }]
                }
              })
            }],
            count: 4
          }
        })
      }}>
          <QueryResolver onClickPull={(artifactId, revisionId) => addAction(\`Pull: \${artifactId} (revision: \${revisionId})\`)} onClickDelete={id => addAction(\`Deactivate: \${id}\`)} onClickRestore={id => addAction(\`Activate: \${id}\`)} />
        </RelayResolver>
      </div>;
  }
}`,...Q.parameters?.docs?.source},description:{story:`Real-world example combining multiple features.`,...Q.parameters?.docs?.description}}},Me=[`Default`,`WithControls`,`DifferentStatuses`,`Loading`,`Empty`,`RealWorldExample`]})))()}$();export{q as Default,Y as DifferentStatuses,Z as Empty,X as Loading,Q as RealWorldExample,J as WithControls,Me as __namedExportsOrder,W as default};