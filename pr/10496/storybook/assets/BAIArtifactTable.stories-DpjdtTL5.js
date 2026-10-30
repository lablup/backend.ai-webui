import{a as e,n as t}from"./rolldown-runtime-sJBDdmOt.js";import{t as n}from"./react-DlPsW1c0.js";import{n as r,t as i}from"./omit-DR6wVUX5.js";import{n as ee,t as a}from"./map-BLzs52H1.js";import{n as o,t as s}from"./includes-CyC0lXf3.js";import{n as c,t as l}from"./isEmpty-CptDxjc2.js";import{t as u}from"./jsx-runtime-MKhVqBIO.js";import{n as te,t as d}from"./useBAIi18n-BiRHq6o1.js";import{t as f}from"./dayjs.min-BHb7hAap.js";import{t as p}from"./compiler-runtime-DU4U6aph.js";import{n as m,t as h}from"./createLucideIcon-DF5UGKo-.js";import{n as g,t as ne}from"./ban-BxyDRdak.js";import{n as _,t as v}from"./BAIArtifactTypeToken-YF1Dp_hH.js";import{n as y,t as b}from"./Text-Cj3JSrHf.js";import{c as re,h as ie,m as x,o as ae,s as oe}from"./iframe-lMx8nTtI.js";import{n as se,t as S}from"./BAIFlex-DnaoYTJ1.js";import{t as ce}from"./react-relay-sHama7hJ.js";import{c as le,o as ue,r as de,s as fe}from"./helper-p-d7z67I.js";import{n as pe,t as me}from"./Link-BZ6fGE5t.js";import{n as he,r as ge}from"./dist-VyLUzrdQ.js";import{n as _e,t as ve}from"./BAIButton-CO5MqbEr.js";import{n as ye,t as be}from"./BAILink-D7VuC3Oo.js";import{n as xe,t as Se}from"./BAITable-C4pOeazS.js";import{n as Ce,t as we}from"./BAIArtifactStatusBadge-CoRH093v.js";import{n as Te,t as Ee}from"./BAIArtifactRevisionDownloadButton-CxEHUdai.js";import{a as De,i as Oe,n as ke,r as Ae}from"./storybook-mock-utils-BqLAdkd_.js";import{n as je,t as C}from"./RelayResolver-BnFyFQJn.js";var Me,w;function Ne(){return(Ne=t((()=>{m(),Me=[[`path`,{d:`M3 7v6h6`,key:`1v2h90`}],[`path`,{d:`M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13`,key:`1r6uu6`}]],w=h(`undo`,Me)})))()}var T;function Pe(){return(Pe=t((()=>{T=(function(){var e={alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},t={alias:null,args:null,kind:`ScalarField`,name:`name`,storageKey:null},n=[t,{alias:null,args:null,kind:`ScalarField`,name:`url`,storageKey:null}];return{argumentDefinitions:[],kind:`Fragment`,metadata:{plural:!0},name:`BAIArtifactTableArtifactFragment`,selections:[e,{alias:null,args:null,kind:`ScalarField`,name:`entityId`,storageKey:null},t,{alias:null,args:null,kind:`ScalarField`,name:`description`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`updatedAt`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`scannedAt`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`availability`,storageKey:null},{alias:null,args:null,concreteType:`SourceInfo`,kind:`LinkedField`,name:`registry`,plural:!1,selections:n,storageKey:null},{alias:null,args:null,concreteType:`SourceInfo`,kind:`LinkedField`,name:`source`,plural:!1,selections:n,storageKey:null},{args:null,kind:`FragmentSpread`,name:`BAIArtifactTypeTokenFragment`},{alias:`latestVersion`,args:[{kind:`Literal`,name:`limit`,value:1},{kind:`Literal`,name:`orderBy`,value:[{direction:`DESC`,field:`VERSION`},{direction:`DESC`,field:`UPDATED_AT`}]}],concreteType:`ArtifactRevisionConnection`,kind:`LinkedField`,name:`revisions`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactRevisionEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`node`,plural:!1,selections:[e,{alias:null,args:null,kind:`ScalarField`,name:`version`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`size`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`status`,storageKey:null},{args:null,kind:`FragmentSpread`,name:`BAIArtifactStatusBadgeFragment`},{args:null,kind:`FragmentSpread`,name:`BAIArtifactRevisionDownloadButtonFragment`}],storageKey:null}],storageKey:null}],storageKey:`revisions(limit:1,orderBy:[{"direction":"DESC","field":"VERSION"},{"direction":"DESC","field":"UPDATED_AT"}])`}],type:`Artifact`,abstractKey:null}})(),T.hash=`99d9088d9d3951f760b1f65d41b319f9`})))()}function Fe(e,t){return(0,D.jsxs)(S,{direction:`column`,align:`start`,wrap:`wrap`,children:[(0,D.jsxs)(S,{gap:`xs`,children:[(0,D.jsx)(be,{to:`/reservoir/`+t.entityId,style:{},children:e}),(0,D.jsx)(v,{artifactTypeFrgmt:t})]}),t.description&&(0,D.jsx)(b,{color:`secondary`,size:`sm`,display:`block`,children:t.description})]})}function Ie(e,t){var n,r;let i=(n=t.latestVersion)==null||(n=n.edges[0])==null?void 0:n.node;return!i||c(i)||!i.size?(0,D.jsx)(x,{monospace:!0,children:`N/A`}):(0,D.jsx)(x,{monospace:!0,children:(r=de(i.size,`auto`))==null?void 0:r.displayValue})}function Le(e){return!e||c(e)?(0,D.jsx)(b,{color:`secondary`,children:`N/A`}):(0,D.jsx)(b,{color:`secondary`,children:(0,E.default)(e).fromNow()})}function Re(e){return!e||c(e)?(0,D.jsx)(b,{color:`secondary`,children:`N/A`}):(0,D.jsx)(b,{color:`secondary`,children:(0,E.default)(e).fromNow()})}function ze(e,t){return(0,D.jsx)(v,{artifactTypeFrgmt:t})}function Be(e,t){return t!=null&&t.source?(0,D.jsx)(b,{children:t!=null&&t.registry?`${t.registry.name} (${t.registry.url})`:`N/A`}):`-`}function Ve(e,t){return t!=null&&t.source?(0,D.jsx)(me,{href:t.source.url??``,target:`_blank`,rel:`noopener noreferrer`,children:t.source.name||`N/A`}):`-`}function He(e){return e.id}var Ue,E,We,Ge,D,O,k,A;function Ke(){return(Ke=t((()=>{Pe(),Ue=p(),le(),d(),_e(),se(),ye(),ie(),xe(),Te(),Ce(),_(),pe(),y(),E=e(f(),1),We=e(re(),1),o(),l(),i(),a(),g(),Ne(),Ge=ce(),D=u(),E.default.extend(We.default),O=[`name`,`type`,`size`,`scannedAt`,`updatedAt`],[...O,...O.map(e=>`-${e}`)],k=e=>s(O,e),A=e=>{"use memo";let t=(0,Ue.c)(39),n,i,a,o,s,l,u;t[0]===e?(n=t[1],i=t[2],a=t[3],o=t[4],s=t[5],l=t[6],u=t[7]):({artifactFragment:n,onClickPull:s,onClickDelete:o,onClickRestore:l,disableSorter:i,onChangeOrder:a,...u}=e,t[0]=e,t[1]=n,t[2]=i,t[3]=a,t[4]=o,t[5]=s,t[6]=l,t[7]=u);let{t:d}=te(),f=(0,Ge.useFragment)(T,n),p,m,h,g;if(t[8]!==i||t[9]!==o||t[10]!==s||t[11]!==l||t[12]!==d){let e;t[17]!==o||t[18]!==l||t[19]!==d?(e=(e,t)=>{let n=t.availability;if(n===`ALIVE`)return(0,D.jsx)(ve,{title:d(`comp:BAIArtifactTable.Deactivate`),size:`small`,danger:!0,icon:(0,D.jsx)(ne,{}),onClick:()=>o(t.id)});if(n===`DELETED`)return(0,D.jsx)(ve,{title:d(`comp:BAIArtifactTable.Activate`),size:`small`,icon:(0,D.jsx)(w,{}),onClick:()=>l(t.id)})},t[17]=o,t[18]=l,t[19]=d,t[20]=e):e=t[20];let n;t[21]!==s||t[22]!==d?(n=(e,t)=>{var n;let r=(n=t.latestVersion)==null||(n=n.edges[0])==null?void 0:n.node;return!r||c(r)?(0,D.jsx)(x,{monospace:!0,children:`N/A`}):(0,D.jsxs)(S,{gap:`xs`,wrap:`wrap`,align:`center`,children:[(0,D.jsx)(x,{monospace:!0,children:r.version}),(0,D.jsx)(we,{artifactRevisionFrgmt:r}),r.status===`SCANNED`?(0,D.jsx)(Ee,{title:d(`comp:BAIArtifactTable.PullLatestVersion`),revisionsFrgmt:[r],disabled:t.availability!==`ALIVE`,size:`small`,onClick:()=>s(t.id,r.id)}):null]})},t[21]=s,t[22]=d,t[23]=n):n=t[23];let a=[{title:d(`comp:BAIArtifactRevisionTable.Name`),dataIndex:`name`,key:`name`,sorter:k(`name`),render:Fe},{title:d(`comp:BAIArtifactTable.Controls`),key:`controls`,render:e},{title:d(`comp:BAIArtifactRevisionTable.LatestVersion`),key:`latest_version`,render:n},{title:d(`comp:BAIArtifactRevisionTable.Size`),key:`size`,sorter:k(`size`),render:Ie},{title:d(`comp:BAIArtifactTable.Scanned`),dataIndex:`scannedAt`,key:`scanned_at`,sorter:k(`scannedAt`),render:Le},{title:d(`comp:BAIArtifactRevisionTable.Updated`),dataIndex:`updatedAt`,key:`updated_at`,sorter:k(`updatedAt`),render:Re},{title:d(`comp:BAIArtifactDescriptions.Type`),key:`type`,sorter:k(`type`),render:ze,defaultHidden:!0},{title:d(`comp:BAIArtifactTable.Registry`),dataIndex:`registry.name`,key:`registry.name`,render:Be,defaultHidden:!0},{title:d(`comp:BAIArtifactTable.Source`),dataIndex:`source.name`,key:`source.name`,render:Ve,defaultHidden:!0}];p=Se,t[24]===Symbol.for(`react.memo_cache_sentinel`)?(m={x:`max-content`},t[24]=m):m=t[24],h=He;let u;t[25]===i?u=t[26]:(u=e=>i?r(e,`sorter`):e,t[25]=i,t[26]=u),g=ee(ue(a),u),t[8]=i,t[9]=o,t[10]=s,t[11]=l,t[12]=d,t[13]=p,t[14]=m,t[15]=h,t[16]=g}else p=t[13],m=t[14],h=t[15],g=t[16];let _;t[27]===f?_=t[28]:(_=fe(f),t[27]=f,t[28]=_);let v;t[29]===a?v=t[30]:(v=e=>{a==null||a(e||null)},t[29]=a,t[30]=v);let y;return t[31]!==p||t[32]!==m||t[33]!==h||t[34]!==g||t[35]!==_||t[36]!==v||t[37]!==u?(y=(0,D.jsx)(p,{scroll:m,rowKey:h,columns:g,dataSource:_,onChangeOrder:v,...u}),t[31]=p,t[32]=m,t[33]=h,t[34]=g,t[35]=_,t[36]=v,t[37]=u,t[38]=y):y=t[38],y}})))()}var j;function qe(){return(qe=t((()=>{j=(function(){var e=[{kind:`Literal`,name:`limit`,value:100},{kind:`Literal`,name:`offset`,value:0}],t={alias:null,args:null,kind:`ScalarField`,name:`count`,storageKey:null},n={alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},r={alias:null,args:null,kind:`ScalarField`,name:`name`,storageKey:null},i=[r,{alias:null,args:null,kind:`ScalarField`,name:`url`,storageKey:null}];return{fragment:{argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAIArtifactTableStoriesQuery`,selections:[{alias:null,args:e,concreteType:`ArtifactConnection`,kind:`LinkedField`,name:`artifacts`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`Artifact`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{args:null,kind:`FragmentSpread`,name:`BAIArtifactTableArtifactFragment`}],storageKey:null}],storageKey:null},t],storageKey:`artifacts(limit:100,offset:0)`}],type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[],kind:`Operation`,name:`BAIArtifactTableStoriesQuery`,selections:[{alias:null,args:e,concreteType:`ArtifactConnection`,kind:`LinkedField`,name:`artifacts`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`Artifact`,kind:`LinkedField`,name:`node`,plural:!1,selections:[n,{alias:null,args:null,kind:`ScalarField`,name:`entityId`,storageKey:null},r,{alias:null,args:null,kind:`ScalarField`,name:`description`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`updatedAt`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`scannedAt`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`availability`,storageKey:null},{alias:null,args:null,concreteType:`SourceInfo`,kind:`LinkedField`,name:`registry`,plural:!1,selections:i,storageKey:null},{alias:null,args:null,concreteType:`SourceInfo`,kind:`LinkedField`,name:`source`,plural:!1,selections:i,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`type`,storageKey:null},{alias:`latestVersion`,args:[{kind:`Literal`,name:`limit`,value:1},{kind:`Literal`,name:`orderBy`,value:[{direction:`DESC`,field:`VERSION`},{direction:`DESC`,field:`UPDATED_AT`}]}],concreteType:`ArtifactRevisionConnection`,kind:`LinkedField`,name:`revisions`,plural:!1,selections:[{alias:null,args:null,concreteType:`ArtifactRevisionEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`node`,plural:!1,selections:[n,{alias:null,args:null,kind:`ScalarField`,name:`version`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`size`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`status`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:`revisions(limit:1,orderBy:[{"direction":"DESC","field":"VERSION"},{"direction":"DESC","field":"UPDATED_AT"}])`}],storageKey:null}],storageKey:null},t],storageKey:`artifacts(limit:100,offset:0)`}]},params:{cacheID:`b60b066f7e3f39045d87d4e23ad6274a`,id:null,metadata:{},name:`BAIArtifactTableStoriesQuery`,operationKind:`query`,text:`query BAIArtifactTableStoriesQuery {
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
`}}})(),j.hash=`225cd0f6f4c5c53ba620f42b9e8c1442`})))()}var M,Je,N,Ye,P,F,Xe,I,L,Ze,R,z,Qe,B,V,$e,H,U,et,W,G,tt,K,q,J,Y,X,Z,Q,$,nt;function rt(){return(rt=t((()=>{qe(),je(),ke(),oe(),Ke(),M=n(),Je=ce(),he(),N=u(),tt={title:`Fragments/BAIArtifactTable`,component:A,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:"\n**BAIArtifactTable** is a specialized table component for displaying Backend.AI artifact information with Relay GraphQL integration.\n\n## BAI-Specific Props\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `artifactFragment` | `BAIArtifactTableArtifactFragment$key` | - | GraphQL fragment reference (required) |\n| `onClickPull` | `(artifactId: string, revisionId: string) => void` | - | Callback when pull button is clicked |\n| `onClickDelete` | `(artifactId: string) => void` | - | Callback when deactivate button is clicked |\n| `onClickRestore` | `(artifactId: string) => void` | - | Callback when activate button is clicked |\n| `order` | `(typeof availableArtifactSorterValues)[number] \\| null` | - | Current sort, e.g. `name` / `-updatedAt` (server-side) |\n| `onChangeOrder` | `(order: (typeof availableArtifactSorterValues)[number] \\| null) => void` | - | Callback when a sortable header is clicked |\n| `disableSorter` | `boolean` | `false` | Strips every column sorter |\n\n## Pre-configured Columns\n- **Name**: Artifact name with type token and description\n- **Controls**: Activate/Deactivate buttons based on artifact availability\n- **Latest Version**: Latest revision version with status badge and pull button\n- **Size**: Latest revision size in human-readable format\n- **Scanned**: Time since last scan (relative time)\n- **Updated**: Time since last update (relative time)\n- **Type**: Artifact type tag (hidden by default; carries the `TYPE` ordering)\n- **Registry**: Registry name and URL (hidden by default)\n- **Source**: Source repository link (hidden by default)\n\nName, Type, Size, Scanned and Updated carry **server-side** sorters: the table is order-controlled, so\n`order` and `onChangeOrder` must be wired together. These stories hold the order in local state, so the\nheader arrows respond, but the mocked resolver does not re-sort the rows — only the real query does.\n\nFor other props (loading, pagination, etc.), refer to [BAITable](?path=/docs/table-baitable--docs).\n        "}}},argTypes:{artifactFragment:{control:!1,description:`GraphQL fragment reference for artifact data`,table:{type:{summary:`BAIArtifactTableArtifactFragment$key`}}},onClickPull:{action:`pull-clicked`,description:`Callback when pull button is clicked`,table:{type:{summary:`(artifactId: string, revisionId: string) => void`}}},onClickDelete:{action:`delete-clicked`,description:`Callback when deactivate button is clicked`,table:{type:{summary:`(artifactId: string) => void`}}},onClickRestore:{action:`restore-clicked`,description:`Callback when activate button is clicked`,table:{type:{summary:`(artifactId: string) => void`}}}},decorators:[(e,t)=>{let n=t.globals.locale||`en`,r=Ae[n]||Ae.en;return(0,N.jsx)(ge,{children:(0,N.jsx)(ae,{locale:r,clientPromise:De,anonymousClientFactory:Oe,children:(0,N.jsx)(e,{})})})}]},K=({onClickPull:e,onClickDelete:t,onClickRestore:n,loading:r})=>{let[i,ee]=(0,M.useState)(null),{artifacts:a}=(0,Je.useLazyLoadQuery)(j,{}),o=(a==null?void 0:a.edges.map(e=>e==null?void 0:e.node).filter(e=>!!e))??[];return(0,N.jsx)(A,{artifactFragment:o,order:i,onChangeOrder:ee,onClickPull:e,onClickDelete:t,onClickRestore:n,loading:r,pagination:{total:(a==null?void 0:a.count)??0,pageSize:10}})},q=(e,t={})=>({id:btoa(`ArtifactNode:artifact-${e}`),name:`artifact-${e}`,description:`Description for artifact ${e}`,updatedAt:new Date(Date.now()-e*24*60*60*1e3).toISOString(),scannedAt:new Date(Date.now()-e*12*60*60*1e3).toISOString(),availability:`ALIVE`,type:e%3==0?`MODEL`:e%3==1?`PACKAGE`:`IMAGE`,registry:{name:`docker.io`,url:`https://hub.docker.com`},source:{name:`github.com/org/repo-${e}`,url:`https://github.com/org/repo-${e}`},latestVersion:{edges:[{node:{id:btoa(`ArtifactRevisionNode:revision-${e}`),version:`v1.${e}.0`,size:`${(e+1)*1024*1024*100}`,status:`SCANNED`}}]},...t}),J={name:`Basic`,parameters:{docs:{description:{story:`Basic artifact table displaying multiple artifacts with their latest versions and statuses.`}}},render:e=>(0,N.jsx)(C,{mockResolvers:{Query:()=>({artifacts:{edges:[{node:q(1,{type:`MODEL`})},{node:q(2,{type:`PACKAGE`})},{node:q(3,{type:`IMAGE`})},{node:q(4,{type:`MODEL`,availability:`DELETED`})},{node:q(5,{type:`PACKAGE`,latestVersion:{edges:[{node:{id:btoa(`ArtifactRevisionNode:revision-5`),version:`v1.5.0`,size:`524288000`,status:`PULLING`}}]}})}],count:5}})},children:(0,N.jsx)(K,{...e})})},Y={name:`ActivateDeactivate`,parameters:{docs:{description:{story:`Demonstrates activate and deactivate controls. Click deactivate (ban icon) to mark as deleted, or activate (undo icon) to restore.`}}},render:()=>{let[e,t]=(0,M.useState)(null);return(0,N.jsxs)(`div`,{children:[(0,N.jsxs)(`div`,{style:{marginBottom:16},children:[(0,N.jsx)(`strong`,{children:`Last Action:`}),` `,e||`None`]}),(0,N.jsx)(C,{mockResolvers:{Query:()=>({artifacts:{edges:[{node:q(1,{availability:`ALIVE`,type:`MODEL`})},{node:q(2,{availability:`DELETED`,type:`PACKAGE`})},{node:q(3,{availability:`ALIVE`,type:`IMAGE`})}],count:3}})},children:(0,N.jsx)(K,{onClickDelete:e=>t(`Deactivate ${e}`),onClickRestore:e=>t(`Activate ${e}`),onClickPull:(e,n)=>t(`Pull ${e}/${n}`)})})]})}},X={name:`DifferentStatuses`,parameters:{docs:{description:{story:`Displays artifacts with different revision statuses (SCANNED, PULLING, VERIFYING, FAILED).`}}},render:()=>(0,N.jsx)(C,{mockResolvers:{Query:()=>({artifacts:{edges:[{node:q(1,{latestVersion:{edges:[{node:{id:btoa(`ArtifactRevisionNode:revision-1`),version:`v1.1.0`,size:`104857600`,status:`SCANNED`}}]}})},{node:q(2,{latestVersion:{edges:[{node:{id:btoa(`ArtifactRevisionNode:revision-2`),version:`v1.2.0`,size:`209715200`,status:`PULLING`}}]}})},{node:q(3,{latestVersion:{edges:[{node:{id:btoa(`ArtifactRevisionNode:revision-3`),version:`v1.3.0`,size:`314572800`,status:`VERIFYING`}}]}})},{node:q(4,{latestVersion:{edges:[{node:{id:btoa(`ArtifactRevisionNode:revision-4`),version:`v1.4.0`,size:`419430400`,status:`FAILED`}}]}})}],count:4}})},children:(0,N.jsx)(K,{onClickPull:()=>{},onClickDelete:()=>{},onClickRestore:()=>{}})})},Z={name:`LoadingState`,parameters:{docs:{description:{story:`Shows the artifact table in a loading state with reduced opacity.`}}},render:()=>(0,N.jsx)(C,{mockResolvers:{Query:()=>({artifacts:{edges:[{node:q(1)},{node:q(2)}],count:2}})},children:(0,N.jsx)(K,{loading:!0,onClickPull:()=>{},onClickDelete:()=>{},onClickRestore:()=>{}})})},Q={name:`EmptyState`,parameters:{docs:{description:{story:`Shows the artifact table when no artifacts are available.`}}},render:()=>(0,N.jsx)(C,{mockResolvers:{Query:()=>({artifacts:{edges:[],count:0}})},children:(0,N.jsx)(K,{onClickPull:()=>{},onClickDelete:()=>{},onClickRestore:()=>{}})})},$={name:`RealWorldUsage`,parameters:{docs:{description:{story:`Demonstrates a realistic use case combining pull, activate, and deactivate actions.`}}},render:()=>{let[e,t]=(0,M.useState)([]),n=e=>{t(t=>[e,...t].slice(0,5))};return(0,N.jsxs)(`div`,{children:[(0,N.jsxs)(`div`,{style:{marginBottom:16,padding:12,background:`#f5f5f5`,borderRadius:4},children:[(0,N.jsx)(`strong`,{children:`Recent Actions:`}),e.length>0?(0,N.jsx)(`ul`,{style:{margin:`8px 0 0 0`,paddingLeft:20},children:e.map((e,t)=>(0,N.jsx)(`li`,{children:e},t))}):(0,N.jsx)(`div`,{style:{marginTop:8},children:`No actions yet`})]}),(0,N.jsx)(C,{mockResolvers:{Query:()=>({artifacts:{edges:[{node:q(1,{type:`MODEL`,availability:`ALIVE`})},{node:q(2,{type:`PACKAGE`,availability:`DELETED`})},{node:q(3,{type:`IMAGE`,availability:`ALIVE`,latestVersion:{edges:[{node:{id:btoa(`ArtifactRevisionNode:revision-3`),version:`v2.0.1`,size:`314572800`,status:`SCANNED`}}]}})},{node:q(4,{type:`MODEL`,availability:`ALIVE`,latestVersion:{edges:[{node:{id:btoa(`ArtifactRevisionNode:revision-4`),version:`v3.1.0`,size:`524288000`,status:`PULLING`}}]}})}],count:4}})},children:(0,N.jsx)(K,{onClickPull:(e,t)=>n(`Pull: ${e} (revision: ${t})`),onClickDelete:e=>n(`Deactivate: ${e}`),onClickRestore:e=>n(`Activate: ${e}`)})})]})}},J.parameters={...J.parameters,docs:{...(Ye=J.parameters)==null?void 0:Ye.docs,source:{originalSource:`{
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
}`,...(P=J.parameters)==null||(P=P.docs)==null?void 0:P.source},description:{story:`Basic artifact table with mock data showing various artifact types and statuses.`,...(F=J.parameters)==null||(F=F.docs)==null?void 0:F.description}}},Y.parameters={...Y.parameters,docs:{...(Xe=Y.parameters)==null?void 0:Xe.docs,source:{originalSource:`{
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
}`,...(I=Y.parameters)==null||(I=I.docs)==null?void 0:I.source},description:{story:`Artifact table with activate/deactivate functionality demonstration.`,...(L=Y.parameters)==null||(L=L.docs)==null?void 0:L.description}}},X.parameters={...X.parameters,docs:{...(Ze=X.parameters)==null?void 0:Ze.docs,source:{originalSource:`{
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
}`,...(R=X.parameters)==null||(R=R.docs)==null?void 0:R.source},description:{story:`Artifact table showing different revision statuses.`,...(z=X.parameters)==null||(z=z.docs)==null?void 0:z.description}}},Z.parameters={...Z.parameters,docs:{...(Qe=Z.parameters)==null?void 0:Qe.docs,source:{originalSource:`{
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
}`,...(B=Z.parameters)==null||(B=B.docs)==null?void 0:B.source},description:{story:`Artifact table in loading state.`,...(V=Z.parameters)==null||(V=V.docs)==null?void 0:V.description}}},Q.parameters={...Q.parameters,docs:{...($e=Q.parameters)==null?void 0:$e.docs,source:{originalSource:`{
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
}`,...(H=Q.parameters)==null||(H=H.docs)==null?void 0:H.source},description:{story:`Artifact table with no artifacts (empty state).`,...(U=Q.parameters)==null||(U=U.docs)==null?void 0:U.description}}},$.parameters={...$.parameters,docs:{...(et=$.parameters)==null?void 0:et.docs,source:{originalSource:`{
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
}`,...(W=$.parameters)==null||(W=W.docs)==null?void 0:W.source},description:{story:`Real-world example combining multiple features.`,...(G=$.parameters)==null||(G=G.docs)==null?void 0:G.description}}},nt=[`Default`,`WithControls`,`DifferentStatuses`,`Loading`,`Empty`,`RealWorldExample`]})))()}rt();export{J as Default,X as DifferentStatuses,Q as Empty,Z as Loading,$ as RealWorldExample,Y as WithControls,nt as __namedExportsOrder,tt as default};