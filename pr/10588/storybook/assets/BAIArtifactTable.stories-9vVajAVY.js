import{a as e,n as t}from"./rolldown-runtime-sJBDdmOt.js";import{t as n}from"./react-D0Ex1IVc.js";import{n as r,t as i}from"./omit-CntEYmYa.js";import{n as a,t as o}from"./map-CLZMgxwS.js";import{n as s,t as c}from"./includes-wS99WMPj.js";import{n as l,t as u}from"./isEmpty-SRC6Jtfi.js";import{t as d}from"./jsx-runtime-MKhVqBIO.js";import{n as ee,t as f}from"./useBAIi18n-Biey1teG.js";import{t as p}from"./dayjs.min-D7GtMU8l.js";import{t as m}from"./compiler-runtime-CdReTaax.js";import{n as h,t as g}from"./createLucideIcon-R1KMo-hV.js";import{n as _,t as te}from"./ban-BMEQsfDP.js";import{n as v,t as y}from"./BAIArtifactTypeToken-CYdaGMHr.js";import{n as b,t as x}from"./Text-Rtk9ZYap.js";import{c as ne,h as re,m as S,o as ie,s as ae}from"./iframe-BF4Nk2qQ.js";import{n as oe,t as C}from"./BAIFlex-BOFoS5KY.js";import{t as se}from"./react-relay-sBALIJlt.js";import{c as ce,o as le,r as ue,s as de}from"./helper-CPPrFJ2v.js";import{n as fe,t as pe}from"./Link-CKI1ETQz.js";import{n as me,r as he}from"./dist-BWBbun8L.js";import{n as ge,t as _e}from"./BAIButton-BCdRP02k.js";import{n as ve,t as ye}from"./BAILink-wVbYRKSR.js";import{n as be,t as xe}from"./BAITable-BYZKAaal.js";import{n as Se,t as Ce}from"./BAIArtifactStatusBadge-DnBgKXh3.js";import{n as we,t as Te}from"./BAIArtifactRevisionDownloadButton-BpT9SBCM.js";import{a as Ee,i as De,n as Oe,r as w}from"./storybook-mock-utils-BqLAdkd_.js";import{n as ke,t as T}from"./RelayResolver-CMrgwoPg.js";var E,D;function O(){return(O=t((()=>{h(),E=[[`path`,{d:`M3 7v6h6`,key:`1v2h90`}],[`path`,{d:`M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13`,key:`1r6uu6`}]],D=g(`undo`,E)})))()}var k;function A(){return(A=t((()=>{k=(function(){var e={alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},t={alias:null,args:null,kind:`ScalarField`,name:`name`,storageKey:null},n=[t,{alias:null,args:null,kind:`ScalarField`,name:`url`,storageKey:null}];return{argumentDefinitions:[],kind:`Fragment`,metadata:{plural:!0},name:`BAIArtifactTableArtifactFragment`,selections:[e,{alias:null,args:null,kind:`ScalarField`,name:`entityId`,storageKey:null},t,{alias:null,args:null,kind:`ScalarField`,name:`description`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`updatedAt`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`scannedAt`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`availability`,storageKey:null},{alias:null,args:null,concreteType:`SourceInfo`,kind:`LinkedField`,name:`registry`,plural:!1,selections:n,storageKey:null},{alias:null,args:null,concreteType:`SourceInfo`,kind:`LinkedField`,name:`source`,plural:!1,selections:n,storageKey:null},{args:null,kind:`FragmentSpread`,name:`BAIArtifactTypeTokenFragment`},{alias:`latestVersion`,args:[{kind:`Literal`,name:`limit`,value:1},{kind:`Literal`,name:`orderBy`,value:[{direction:`DESC`,field:`VERSION`},{direction:`DESC`,field:`UPDATED_AT`}]}],concreteType:`ArtifactRevisionConnection`,kind:`LinkedField`,name:`revisions`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactRevisionEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`node`,plural:!1,selections:[e,{alias:null,args:null,kind:`ScalarField`,name:`version`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`size`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`status`,storageKey:null},{args:null,kind:`FragmentSpread`,name:`BAIArtifactStatusBadgeFragment`},{args:null,kind:`FragmentSpread`,name:`BAIArtifactRevisionDownloadButtonFragment`}],storageKey:null}],storageKey:null}],storageKey:`revisions(limit:1,orderBy:[{"direction":"DESC","field":"VERSION"},{"direction":"DESC","field":"UPDATED_AT"}])`}],type:`Artifact`,abstractKey:null}})(),k.hash=`99d9088d9d3951f760b1f65d41b319f9`})))()}function Ae(e,t){return(0,F.jsxs)(C,{direction:`column`,align:`start`,wrap:`wrap`,children:[(0,F.jsxs)(C,{gap:`xs`,children:[(0,F.jsx)(ye,{to:`/reservoir/`+t.entityId,style:{},children:e}),(0,F.jsx)(y,{artifactTypeFrgmt:t})]}),t.description&&(0,F.jsx)(x,{color:`secondary`,size:`sm`,display:`block`,children:t.description})]})}function je(e,t){let n=t.latestVersion?.edges[0]?.node;return!n||l(n)||!n.size?(0,F.jsx)(S,{monospace:!0,children:`N/A`}):(0,F.jsx)(S,{monospace:!0,children:ue(n.size,`auto`)?.displayValue})}function Me(e){return!e||l(e)?(0,F.jsx)(x,{color:`secondary`,children:`N/A`}):(0,F.jsx)(x,{color:`secondary`,children:(0,M.default)(e).fromNow()})}function Ne(e){return!e||l(e)?(0,F.jsx)(x,{color:`secondary`,children:`N/A`}):(0,F.jsx)(x,{color:`secondary`,children:(0,M.default)(e).fromNow()})}function Pe(e,t){return(0,F.jsx)(y,{artifactTypeFrgmt:t})}function Fe(e,t){return t?.source?(0,F.jsx)(x,{children:t?.registry?`${t.registry.name} (${t.registry.url})`:`N/A`}):`-`}function Ie(e,t){return t?.source?(0,F.jsx)(pe,{href:t.source.url??``,target:`_blank`,rel:`noopener noreferrer`,children:t.source.name||`N/A`}):`-`}function Le(e){return e.id}var j,M,N,P,F,I,L,R;function z(){return(z=t((()=>{A(),j=m(),ce(),f(),ge(),oe(),ve(),re(),be(),we(),Se(),v(),fe(),b(),M=e(p(),1),N=e(ne(),1),s(),u(),i(),o(),_(),O(),P=se(),F=d(),M.default.extend(N.default),I=[`name`,`type`,`size`,`scannedAt`,`updatedAt`],[...I,...I.map(e=>`-${e}`)],L=e=>c(I,e),R=e=>{"use memo";let t=(0,j.c)(39),n,i,o,s,c,u,d;t[0]===e?(n=t[1],i=t[2],o=t[3],s=t[4],c=t[5],u=t[6],d=t[7]):({artifactFragment:n,onClickPull:c,onClickDelete:s,onClickRestore:u,disableSorter:i,onChangeOrder:o,...d}=e,t[0]=e,t[1]=n,t[2]=i,t[3]=o,t[4]=s,t[5]=c,t[6]=u,t[7]=d);let{t:f}=ee(),p=(0,P.useFragment)(k,n),m,h,g,_;if(t[8]!==i||t[9]!==s||t[10]!==c||t[11]!==u||t[12]!==f){let e;t[17]!==s||t[18]!==u||t[19]!==f?(e=(e,t)=>{let n=t.availability;if(n===`ALIVE`)return(0,F.jsx)(_e,{title:f(`comp:BAIArtifactTable.Deactivate`),size:`small`,danger:!0,icon:(0,F.jsx)(te,{}),onClick:()=>s(t.id)});if(n===`DELETED`)return(0,F.jsx)(_e,{title:f(`comp:BAIArtifactTable.Activate`),size:`small`,icon:(0,F.jsx)(D,{}),onClick:()=>u(t.id)})},t[17]=s,t[18]=u,t[19]=f,t[20]=e):e=t[20];let n;t[21]!==c||t[22]!==f?(n=(e,t)=>{let n=t.latestVersion?.edges[0]?.node;return!n||l(n)?(0,F.jsx)(S,{monospace:!0,children:`N/A`}):(0,F.jsxs)(C,{gap:`xs`,wrap:`wrap`,align:`center`,children:[(0,F.jsx)(S,{monospace:!0,children:n.version}),(0,F.jsx)(Ce,{artifactRevisionFrgmt:n}),n.status===`SCANNED`?(0,F.jsx)(Te,{title:f(`comp:BAIArtifactTable.PullLatestVersion`),revisionsFrgmt:[n],disabled:t.availability!==`ALIVE`,size:`small`,onClick:()=>c(t.id,n.id)}):null]})},t[21]=c,t[22]=f,t[23]=n):n=t[23];let o=[{title:f(`comp:BAIArtifactRevisionTable.Name`),dataIndex:`name`,key:`name`,sorter:L(`name`),render:Ae},{title:f(`comp:BAIArtifactTable.Controls`),key:`controls`,render:e},{title:f(`comp:BAIArtifactRevisionTable.LatestVersion`),key:`latest_version`,render:n},{title:f(`comp:BAIArtifactRevisionTable.Size`),key:`size`,sorter:L(`size`),render:je},{title:f(`comp:BAIArtifactTable.Scanned`),dataIndex:`scannedAt`,key:`scanned_at`,sorter:L(`scannedAt`),render:Me},{title:f(`comp:BAIArtifactRevisionTable.Updated`),dataIndex:`updatedAt`,key:`updated_at`,sorter:L(`updatedAt`),render:Ne},{title:f(`comp:BAIArtifactDescriptions.Type`),key:`type`,sorter:L(`type`),render:Pe,defaultHidden:!0},{title:f(`comp:BAIArtifactTable.Registry`),dataIndex:`registry.name`,key:`registry.name`,render:Fe,defaultHidden:!0},{title:f(`comp:BAIArtifactTable.Source`),dataIndex:`source.name`,key:`source.name`,render:Ie,defaultHidden:!0}];m=xe,t[24]===Symbol.for(`react.memo_cache_sentinel`)?(h={x:`max-content`},t[24]=h):h=t[24],g=Le;let d;t[25]===i?d=t[26]:(d=e=>i?r(e,`sorter`):e,t[25]=i,t[26]=d),_=a(le(o),d),t[8]=i,t[9]=s,t[10]=c,t[11]=u,t[12]=f,t[13]=m,t[14]=h,t[15]=g,t[16]=_}else m=t[13],h=t[14],g=t[15],_=t[16];let v;t[27]===p?v=t[28]:(v=de(p),t[27]=p,t[28]=v);let y;t[29]===o?y=t[30]:(y=e=>{o?.(e||null)},t[29]=o,t[30]=y);let b;return t[31]!==m||t[32]!==h||t[33]!==g||t[34]!==_||t[35]!==v||t[36]!==y||t[37]!==d?(b=(0,F.jsx)(m,{scroll:h,rowKey:g,columns:_,dataSource:v,onChangeOrder:y,...d}),t[31]=m,t[32]=h,t[33]=g,t[34]=_,t[35]=v,t[36]=y,t[37]=d,t[38]=b):b=t[38],b}})))()}var B;function V(){return(V=t((()=>{B=(function(){var e=[{kind:`Literal`,name:`limit`,value:100},{kind:`Literal`,name:`offset`,value:0}],t={alias:null,args:null,kind:`ScalarField`,name:`count`,storageKey:null},n={alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},r={alias:null,args:null,kind:`ScalarField`,name:`name`,storageKey:null},i=[r,{alias:null,args:null,kind:`ScalarField`,name:`url`,storageKey:null}];return{fragment:{argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAIArtifactTableStoriesQuery`,selections:[{alias:null,args:e,concreteType:`ArtifactConnection`,kind:`LinkedField`,name:`artifacts`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`Artifact`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{args:null,kind:`FragmentSpread`,name:`BAIArtifactTableArtifactFragment`}],storageKey:null}],storageKey:null},t],storageKey:`artifacts(limit:100,offset:0)`}],type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[],kind:`Operation`,name:`BAIArtifactTableStoriesQuery`,selections:[{alias:null,args:e,concreteType:`ArtifactConnection`,kind:`LinkedField`,name:`artifacts`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`Artifact`,kind:`LinkedField`,name:`node`,plural:!1,selections:[n,{alias:null,args:null,kind:`ScalarField`,name:`entityId`,storageKey:null},r,{alias:null,args:null,kind:`ScalarField`,name:`description`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`updatedAt`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`scannedAt`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`availability`,storageKey:null},{alias:null,args:null,concreteType:`SourceInfo`,kind:`LinkedField`,name:`registry`,plural:!1,selections:i,storageKey:null},{alias:null,args:null,concreteType:`SourceInfo`,kind:`LinkedField`,name:`source`,plural:!1,selections:i,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`type`,storageKey:null},{alias:`latestVersion`,args:[{kind:`Literal`,name:`limit`,value:1},{kind:`Literal`,name:`orderBy`,value:[{direction:`DESC`,field:`VERSION`},{direction:`DESC`,field:`UPDATED_AT`}]}],concreteType:`ArtifactRevisionConnection`,kind:`LinkedField`,name:`revisions`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactRevisionEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`node`,plural:!1,selections:[n,{alias:null,args:null,kind:`ScalarField`,name:`version`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`size`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`status`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:`revisions(limit:1,orderBy:[{"direction":"DESC","field":"VERSION"},{"direction":"DESC","field":"UPDATED_AT"}])`}],storageKey:null}],storageKey:null},t],storageKey:`artifacts(limit:100,offset:0)`}]},params:{cacheID:`b60b066f7e3f39045d87d4e23ad6274a`,id:null,metadata:{},name:`BAIArtifactTableStoriesQuery`,operationKind:`query`,text:`query BAIArtifactTableStoriesQuery {
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
`}}})(),B.hash=`225cd0f6f4c5c53ba620f42b9e8c1442`})))()}var H,U,W,Re,G,K,q,J,Y,X,Z,Q,ze;function $(){return($=t((()=>{V(),ke(),Oe(),ae(),z(),H=n(),U=se(),me(),W=d(),Re={title:`Fragments/BAIArtifactTable`,component:R,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:"\n**BAIArtifactTable** is a specialized table component for displaying Backend.AI artifact information with Relay GraphQL integration.\n\n## BAI-Specific Props\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `artifactFragment` | `BAIArtifactTableArtifactFragment$key` | - | GraphQL fragment reference (required) |\n| `onClickPull` | `(artifactId: string, revisionId: string) => void` | - | Callback when pull button is clicked |\n| `onClickDelete` | `(artifactId: string) => void` | - | Callback when deactivate button is clicked |\n| `onClickRestore` | `(artifactId: string) => void` | - | Callback when activate button is clicked |\n| `order` | `(typeof availableArtifactSorterValues)[number] \\| null` | - | Current sort, e.g. `name` / `-updatedAt` (server-side) |\n| `onChangeOrder` | `(order: (typeof availableArtifactSorterValues)[number] \\| null) => void` | - | Callback when a sortable header is clicked |\n| `disableSorter` | `boolean` | `false` | Strips every column sorter |\n\n## Pre-configured Columns\n- **Name**: Artifact name with type token and description\n- **Controls**: Activate/Deactivate buttons based on artifact availability\n- **Latest Version**: Latest revision version with status badge and pull button\n- **Size**: Latest revision size in human-readable format\n- **Scanned**: Time since last scan (relative time)\n- **Updated**: Time since last update (relative time)\n- **Type**: Artifact type tag (hidden by default; carries the `TYPE` ordering)\n- **Registry**: Registry name and URL (hidden by default)\n- **Source**: Source repository link (hidden by default)\n\nName, Type, Size, Scanned and Updated carry **server-side** sorters: the table is order-controlled, so\n`order` and `onChangeOrder` must be wired together. These stories hold the order in local state, so the\nheader arrows respond, but the mocked resolver does not re-sort the rows — only the real query does.\n\nFor other props (loading, pagination, etc.), refer to [BAITable](?path=/docs/table-baitable--docs).\n        "}}},argTypes:{artifactFragment:{control:!1,description:`GraphQL fragment reference for artifact data`,table:{type:{summary:`BAIArtifactTableArtifactFragment$key`}}},onClickPull:{action:`pull-clicked`,description:`Callback when pull button is clicked`,table:{type:{summary:`(artifactId: string, revisionId: string) => void`}}},onClickDelete:{action:`delete-clicked`,description:`Callback when deactivate button is clicked`,table:{type:{summary:`(artifactId: string) => void`}}},onClickRestore:{action:`restore-clicked`,description:`Callback when activate button is clicked`,table:{type:{summary:`(artifactId: string) => void`}}}},decorators:[(e,t)=>{let n=t.globals.locale||`en`,r=w[n]||w.en;return(0,W.jsx)(he,{children:(0,W.jsx)(ie,{locale:r,clientPromise:Ee,anonymousClientFactory:De,children:(0,W.jsx)(e,{})})})}]},G=({onClickPull:e,onClickDelete:t,onClickRestore:n,loading:r})=>{let[i,a]=(0,H.useState)(null),{artifacts:o}=(0,U.useLazyLoadQuery)(B,{}),s=o?.edges.map(e=>e?.node).filter(e=>!!e)??[];return(0,W.jsx)(R,{artifactFragment:s,order:i,onChangeOrder:a,onClickPull:e,onClickDelete:t,onClickRestore:n,loading:r,pagination:{total:o?.count??0,pageSize:10}})},K=(e,t={})=>({id:btoa(`ArtifactNode:artifact-${e}`),name:`artifact-${e}`,description:`Description for artifact ${e}`,updatedAt:new Date(Date.now()-e*24*60*60*1e3).toISOString(),scannedAt:new Date(Date.now()-e*12*60*60*1e3).toISOString(),availability:`ALIVE`,type:e%3==0?`MODEL`:e%3==1?`PACKAGE`:`IMAGE`,registry:{name:`docker.io`,url:`https://hub.docker.com`},source:{name:`github.com/org/repo-${e}`,url:`https://github.com/org/repo-${e}`},latestVersion:{edges:[{node:{id:btoa(`ArtifactRevisionNode:revision-${e}`),version:`v1.${e}.0`,size:`${(e+1)*1024*1024*100}`,status:`SCANNED`}}]},...t}),q={name:`Basic`,parameters:{docs:{description:{story:`Basic artifact table displaying multiple artifacts with their latest versions and statuses.`}}},render:e=>(0,W.jsx)(T,{mockResolvers:{Query:()=>({artifacts:{edges:[{node:K(1,{type:`MODEL`})},{node:K(2,{type:`PACKAGE`})},{node:K(3,{type:`IMAGE`})},{node:K(4,{type:`MODEL`,availability:`DELETED`})},{node:K(5,{type:`PACKAGE`,latestVersion:{edges:[{node:{id:btoa(`ArtifactRevisionNode:revision-5`),version:`v1.5.0`,size:`524288000`,status:`PULLING`}}]}})}],count:5}})},children:(0,W.jsx)(G,{...e})})},J={name:`ActivateDeactivate`,parameters:{docs:{description:{story:`Demonstrates activate and deactivate controls. Click deactivate (ban icon) to mark as deleted, or activate (undo icon) to restore.`}}},render:()=>{let[e,t]=(0,H.useState)(null);return(0,W.jsxs)(`div`,{children:[(0,W.jsxs)(`div`,{style:{marginBottom:16},children:[(0,W.jsx)(`strong`,{children:`Last Action:`}),` `,e||`None`]}),(0,W.jsx)(T,{mockResolvers:{Query:()=>({artifacts:{edges:[{node:K(1,{availability:`ALIVE`,type:`MODEL`})},{node:K(2,{availability:`DELETED`,type:`PACKAGE`})},{node:K(3,{availability:`ALIVE`,type:`IMAGE`})}],count:3}})},children:(0,W.jsx)(G,{onClickDelete:e=>t(`Deactivate ${e}`),onClickRestore:e=>t(`Activate ${e}`),onClickPull:(e,n)=>t(`Pull ${e}/${n}`)})})]})}},Y={name:`DifferentStatuses`,parameters:{docs:{description:{story:`Displays artifacts with different revision statuses (SCANNED, PULLING, VERIFYING, FAILED).`}}},render:()=>(0,W.jsx)(T,{mockResolvers:{Query:()=>({artifacts:{edges:[{node:K(1,{latestVersion:{edges:[{node:{id:btoa(`ArtifactRevisionNode:revision-1`),version:`v1.1.0`,size:`104857600`,status:`SCANNED`}}]}})},{node:K(2,{latestVersion:{edges:[{node:{id:btoa(`ArtifactRevisionNode:revision-2`),version:`v1.2.0`,size:`209715200`,status:`PULLING`}}]}})},{node:K(3,{latestVersion:{edges:[{node:{id:btoa(`ArtifactRevisionNode:revision-3`),version:`v1.3.0`,size:`314572800`,status:`VERIFYING`}}]}})},{node:K(4,{latestVersion:{edges:[{node:{id:btoa(`ArtifactRevisionNode:revision-4`),version:`v1.4.0`,size:`419430400`,status:`FAILED`}}]}})}],count:4}})},children:(0,W.jsx)(G,{onClickPull:()=>{},onClickDelete:()=>{},onClickRestore:()=>{}})})},X={name:`LoadingState`,parameters:{docs:{description:{story:`Shows the artifact table in a loading state with reduced opacity.`}}},render:()=>(0,W.jsx)(T,{mockResolvers:{Query:()=>({artifacts:{edges:[{node:K(1)},{node:K(2)}],count:2}})},children:(0,W.jsx)(G,{loading:!0,onClickPull:()=>{},onClickDelete:()=>{},onClickRestore:()=>{}})})},Z={name:`EmptyState`,parameters:{docs:{description:{story:`Shows the artifact table when no artifacts are available.`}}},render:()=>(0,W.jsx)(T,{mockResolvers:{Query:()=>({artifacts:{edges:[],count:0}})},children:(0,W.jsx)(G,{onClickPull:()=>{},onClickDelete:()=>{},onClickRestore:()=>{}})})},Q={name:`RealWorldUsage`,parameters:{docs:{description:{story:`Demonstrates a realistic use case combining pull, activate, and deactivate actions.`}}},render:()=>{let[e,t]=(0,H.useState)([]),n=e=>{t(t=>[e,...t].slice(0,5))};return(0,W.jsxs)(`div`,{children:[(0,W.jsxs)(`div`,{style:{marginBottom:16,padding:12,background:`#f5f5f5`,borderRadius:4},children:[(0,W.jsx)(`strong`,{children:`Recent Actions:`}),e.length>0?(0,W.jsx)(`ul`,{style:{margin:`8px 0 0 0`,paddingLeft:20},children:e.map((e,t)=>(0,W.jsx)(`li`,{children:e},t))}):(0,W.jsx)(`div`,{style:{marginTop:8},children:`No actions yet`})]}),(0,W.jsx)(T,{mockResolvers:{Query:()=>({artifacts:{edges:[{node:K(1,{type:`MODEL`,availability:`ALIVE`})},{node:K(2,{type:`PACKAGE`,availability:`DELETED`})},{node:K(3,{type:`IMAGE`,availability:`ALIVE`,latestVersion:{edges:[{node:{id:btoa(`ArtifactRevisionNode:revision-3`),version:`v2.0.1`,size:`314572800`,status:`SCANNED`}}]}})},{node:K(4,{type:`MODEL`,availability:`ALIVE`,latestVersion:{edges:[{node:{id:btoa(`ArtifactRevisionNode:revision-4`),version:`v3.1.0`,size:`524288000`,status:`PULLING`}}]}})}],count:4}})},children:(0,W.jsx)(G,{onClickPull:(e,t)=>n(`Pull: ${e} (revision: ${t})`),onClickDelete:e=>n(`Deactivate: ${e}`),onClickRestore:e=>n(`Activate: ${e}`)})})]})}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
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
}`,...Q.parameters?.docs?.source},description:{story:`Real-world example combining multiple features.`,...Q.parameters?.docs?.description}}},ze=[`Default`,`WithControls`,`DifferentStatuses`,`Loading`,`Empty`,`RealWorldExample`]})))()}$();export{q as Default,Y as DifferentStatuses,Z as Empty,X as Loading,Q as RealWorldExample,J as WithControls,ze as __namedExportsOrder,Re as default};