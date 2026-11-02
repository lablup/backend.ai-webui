import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-DlPsW1c0.js";import{n,t as r}from"./castArray-AZdtGfv6.js";import{n as i,t as a}from"./compact-C9OPbfhP.js";import{i as o,m as s,r as c,t as l}from"./hooks-CqTIG_8a.js";import{n as u,t as d}from"./map-BLzs52H1.js";import{t as f}from"./jsx-runtime-MKhVqBIO.js";import{n as ee,t as p}from"./useBAIi18n-DjEVxV1U.js";import{t as m}from"./compiler-runtime-DU4U6aph.js";import{n as h,t as g}from"./BAIModal-tyOIzFCg.js";import{n as _,t as te}from"./Form-Dj0_GWUk.js";import{n as v,t as y}from"./BAIFlex-DnaoYTJ1.js";import{t as b}from"./react-relay-sHama7hJ.js";import{i as ne,n as re,r as ie,t as x}from"./usePaginatedQuery-BEPvH5tH.js";import{n as ae,t as S}from"./BAISelect-DK-qzwkF.js";import{n as C,t as w}from"./BAIButton-DnDeEeBF.js";import{n as T,t as oe}from"./BAIComplexSelect-BaarRuE6.js";import{n as E,t as D}from"./BAIListAlert-_owJ2lrx.js";import{n as se,t as O}from"./RelayResolver-BnFyFQJn.js";var k;function A(){return(A=e((()=>{k=(function(){var e=[{defaultValue:null,kind:`LocalArgument`,name:`gid`},{defaultValue:null,kind:`LocalArgument`,name:`props`}],t=[{alias:null,args:[{kind:`Variable`,name:`gid`,variableName:`gid`},{kind:`Variable`,name:`props`,variableName:`props`}],concreteType:`ModifyGroup`,kind:`LinkedField`,name:`modify_group`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`ok`,storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:e,kind:`Fragment`,metadata:null,name:`BAIProjectBulkEditModalProjectMutation`,selections:t,type:`Mutation`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:e,kind:`Operation`,name:`BAIProjectBulkEditModalProjectMutation`,selections:t},params:{cacheID:`f40c80d0c744c4c03a07bd9c64c6cb58`,id:null,metadata:{},name:`BAIProjectBulkEditModalProjectMutation`,operationKind:`mutation`,text:`mutation BAIProjectBulkEditModalProjectMutation(
  $gid: UUID!
  $props: ModifyGroupInput!
) {
  modify_group(gid: $gid, props: $props) {
    ok
  }
}
`}}})(),k.hash=`7a741d4d92325e5c4775978312f23e3d`})))()}var j;function M(){return(M=e((()=>{j={argumentDefinitions:[],kind:`Fragment`,metadata:{plural:!0},name:`BAIProjectBulkEditModalFragment`,selections:[{alias:null,args:null,kind:`ScalarField`,name:`name`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`row_id`,storageKey:null}],type:`GroupNode`,abstractKey:null},j.hash=`317d7350cbe767a8531fc765f9efe84b`})))()}var N;function P(){return(P=e((()=>{N=(function(){var e={defaultValue:null,kind:`LocalArgument`,name:`filter`},t={defaultValue:null,kind:`LocalArgument`,name:`limit`},n={defaultValue:null,kind:`LocalArgument`,name:`offset`},r=[{alias:null,args:[{kind:`Variable`,name:`filter`,variableName:`filter`},{kind:`Variable`,name:`limit`,variableName:`limit`},{kind:`Variable`,name:`offset`,variableName:`offset`},{kind:`Literal`,name:`orderBy`,value:[{direction:`ASC`,field:`NAME`}]}],concreteType:`ProjectResourcePolicyV2Connection`,kind:`LinkedField`,name:`adminProjectResourcePoliciesV2`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`count`,storageKey:null},{alias:null,args:null,concreteType:`ProjectResourcePolicyV2Edge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`ProjectResourcePolicyV2`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`name`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:[e,t,n],kind:`Fragment`,metadata:null,name:`BAIAdminProjectResourcePolicySelectPaginatedQuery`,selections:r,type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[n,t,e],kind:`Operation`,name:`BAIAdminProjectResourcePolicySelectPaginatedQuery`,selections:r},params:{cacheID:`eab3f31d5c61a722472c4752c9b0e8fb`,id:null,metadata:{},name:`BAIAdminProjectResourcePolicySelectPaginatedQuery`,operationKind:`query`,text:`query BAIAdminProjectResourcePolicySelectPaginatedQuery(
  $offset: Int!
  $limit: Int!
  $filter: ProjectResourcePolicyV2Filter
) {
  adminProjectResourcePoliciesV2(offset: $offset, limit: $limit, filter: $filter, orderBy: [{field: NAME, direction: ASC}]) {
    count
    edges {
      node {
        id
        name
      }
    }
  }
}
`}}})(),N.hash=`e52acd5d85571c4cab0dc151a59a31b9`})))()}function ce(e){var t;return((t=e.adminProjectResourcePoliciesV2)==null?void 0:t.count)??void 0}function F(e){return e==null?void 0:e.node}function le(e){var t;return(t=e.adminProjectResourcePoliciesV2)==null||(t=t.edges)==null?void 0:t.map(F)}function ue(e){return e==null?void 0:e.name}function de(e){return e!=null&&e.name?{value:e.name,label:e.name}:null}function fe(e){return{label:e,value:e}}function pe(e){return e.value}var me,I,L,R;function z(){return(z=e((()=>{P(),me=m(),ie(),l(),p(),x(),T(),i(),n(),d(),I=t(),L=f(),R=e=>{"use memo";var t;let n=(0,me.c)(41),i,o,l,d;n[0]===e?(i=n[1],o=n[2],l=n[3],d=n[4]):({multiple:d,isLoading:i,ref:o,...l}=e,n[0]=e,n[1]=i,n[2]=o,n[3]=l,n[4]=d);let f=d!==void 0&&d,{t:p}=ee(),m;n[5]===Symbol.for(`react.memo_cache_sentinel`)?(m={valuePropName:`value`,trigger:`onChange`},n[5]=m):m=n[5];let[h,g]=s(l,m),_;n[6]===Symbol.for(`react.memo_cache_sentinel`)?(_={valuePropName:`open`,trigger:`onOpenChange`,defaultValuePropName:`defaultOpen`},n[6]=_):_=n[6];let[te,v]=s(l,_),y=(0,I.useDeferredValue)(te),[b,ie]=(0,I.useState)(``),x=ne(b),[ae,S]=(0,I.useTransition)(),[C,w]=c(),T=(0,I.useDeferredValue)(C),E=(0,I.useDeferredValue)(h),D;n[7]===E?D=n[8]:(D=E??[],n[7]=E,n[8]=D);let se=a(r(D)),O;n[9]===Symbol.for(`react.memo_cache_sentinel`)?(O={limit:10},n[9]=O):O=n[9];let k;n[10]===x?k=n[11]:(k=x?{name:{contains:x}}:null,n[10]=x,n[11]=k);let A;n[12]===k?A=n[13]:(A={filter:k},n[12]=k,n[13]=A);let j=y?`network-only`:`store-only`,M;n[14]!==T||n[15]!==j?(M={fetchPolicy:j,fetchKey:T},n[14]=T,n[15]=j,n[16]=M):M=n[16];let P;n[17]===Symbol.for(`react.memo_cache_sentinel`)?(P={getTotal:ce,getItem:le,getId:ue},n[17]=P):P=n[17];let{paginationData:F,result:R,loadNext:z,isLoadingNext:B}=re(N,O,A,M,P),V,H;n[18]===w?(V=n[19],H=n[20]):(V=()=>({refetch:()=>{S(()=>{w()})}}),H=[w,S],n[18]=w,n[19]=V,n[20]=H),(0,I.useImperativeHandle)(o,V,H);let U;n[21]===F?U=n[22]:(U=a(u(F,de)),n[21]=F,n[22]=U);let W=U,G;bb0:{let e=u(se,fe);if(f){G=e;break bb0}G=e[0]??null}let K=G,q;n[23]===p?q=n[24]:(q=p(`comp:BAIAdminProjectResourcePolicySelect.SelectProjectResourcePolicy`),n[23]=p,n[24]=q);let J=i||h!==E||b!==x||ae,Y=((t=R.adminProjectResourcePoliciesV2)==null?void 0:t.count)??void 0,X;n[25]!==f||n[26]!==g?(X=e=>{let t=u(a(r(e??[])),pe);g(f?t:t[0],void 0)},n[25]=f,n[26]=g,n[27]=X):X=n[27];let Z;return n[28]!==B||n[29]!==K||n[30]!==z||n[31]!==f||n[32]!==W||n[33]!==b||n[34]!==l||n[35]!==v||n[36]!==q||n[37]!==J||n[38]!==Y||n[39]!==X?(Z=(0,L.jsx)(oe,{placeholder:q,...l,multiple:f,isLoading:J,isLoadingNext:B,total:Y,options:W,value:K,onChange:X,searchValue:b,onSearch:ie,onOpenChange:v,endReached:z}),n[28]=B,n[29]=K,n[30]=z,n[31]=f,n[32]=W,n[33]=b,n[34]=l,n[35]=v,n[36]=q,n[37]=J,n[38]=Y,n[39]=X,n[40]=Z):Z=n[40],Z}})))()}var B,V,H,U;function W(){return(W=e((()=>{A(),M(),te(),l(),p(),v(),E(),h(),ae(),z(),d(),i(),B=t(),V=b(),H=f(),U=({selectedProjectFragments:e,...t})=>{let{t:n}=ee(),[r]=_.useForm(),[i,s]=(0,B.useState)(!1),c=o(k),l=(0,V.useFragment)(j,e);return(0,H.jsx)(g,{...t,confirmLoading:i,title:n(`comp:BAIProjectBulkEditModal.UpdateMultipleProjects`),okText:n(`general.button.Save`),onOk:e=>{s(!0),r.validateFields().then(n=>{let r=u(a(u(l,e=>e.row_id)),e=>c({gid:e,props:{resource_policy:n.resource_policy}}));return Promise.all(r).then(()=>{var n;return(n=t.onOk)==null?void 0:n.call(t,e)})}).finally(()=>s(!1))},children:(0,H.jsxs)(y,{direction:`column`,align:`stretch`,gap:`md`,children:[(0,H.jsx)(D,{type:`info`,showIcon:!0,ghostInfoBg:!1,title:n(`comp:BAIProjectBulkEditModal.FollowingProjectsWillBeUpdated`),items:u(l,e=>({key:e.row_id,content:e.name}))}),(0,H.jsx)(_,{form:r,children:(0,H.jsx)(B.Suspense,{fallback:(0,H.jsx)(_.Item,{label:n(`comp:BAIProjectBulkEditModal.ProjectResourcePolicy`),children:(0,H.jsx)(S,{loading:!0})}),children:(0,H.jsx)(_.Item,{label:n(`comp:BAIProjectBulkEditModal.ProjectResourcePolicy`),name:`resource_policy`,children:(0,H.jsx)(R,{label:n(`comp:BAIProjectBulkEditModal.ProjectResourcePolicy`),isLabelHidden:!0})})})})]})})}})))()}var G;function K(){return(K=e((()=>{G=(function(){var e=[{kind:`Literal`,name:`first`,value:3},{kind:`Literal`,name:`offset`,value:0}];return{fragment:{argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAIProjectBulkEditModalStoriesQuery`,selections:[{alias:null,args:e,concreteType:`GroupConnection`,kind:`LinkedField`,name:`group_nodes`,plural:!1,selections:[{alias:null,args:null,concreteType:`GroupEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`GroupNode`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{args:null,kind:`FragmentSpread`,name:`BAIProjectBulkEditModalFragment`}],storageKey:null}],storageKey:null}],storageKey:`group_nodes(first:3,offset:0)`}],type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[],kind:`Operation`,name:`BAIProjectBulkEditModalStoriesQuery`,selections:[{alias:null,args:e,concreteType:`GroupConnection`,kind:`LinkedField`,name:`group_nodes`,plural:!1,selections:[{alias:null,args:null,concreteType:`GroupEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`GroupNode`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`name`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`row_id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:`group_nodes(first:3,offset:0)`}]},params:{cacheID:`e95e83787e4e85b2c9d30b1fe5e4d330`,id:null,metadata:{},name:`BAIProjectBulkEditModalStoriesQuery`,operationKind:`query`,text:`query BAIProjectBulkEditModalStoriesQuery {
  group_nodes(offset: 0, first: 3) {
    edges {
      node {
        ...BAIProjectBulkEditModalFragment
        id
      }
    }
  }
}

fragment BAIProjectBulkEditModalFragment on GroupNode {
  name
  row_id
}
`}}})(),G.hash=`99a682fa622f83ed529364e1a889fbda`})))()}var q,J,Y,X,Z,Q,he,ge,$,_e;function ve(){return(ve=e((()=>{K(),se(),C(),v(),W(),q=t(),J=b(),Y=f(),he={title:`Fragments/BAIProjectBulkEditModal`,component:U,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`
**BAIProjectBulkEditModal** is a modal for bulk editing multiple project settings with GraphQL mutation integration.

## BAI-Specific Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`selectedProjectFragments\` | \`BAIProjectBulkEditModalFragment$key\` | - | GraphQL fragment reference for selected projects (required) |
| \`onOk\` | \`(e: React.MouseEvent) => void\` | - | Called after all mutations complete successfully |
| \`onCancel\` | \`(e: React.MouseEvent) => void\` | - | Called when modal is cancelled |

## Features
- **Project List**: Shows all selected projects in an info alert
- **Resource Policy Selection**: Form field for changing project resource policy
- **Parallel Mutations**: Executes mutations for all projects simultaneously using Promise.all
- **Loading State**: Shows loading spinner in select field while data loads (Suspense)
- **Confirm Loading**: Save button shows loading state during mutation execution
- **Auto Cleanup**: Wrap in \`BAIUnmountAfterClose\` to unmount the component when closed

For other props, refer to [BAIModal](/?path=/docs/modal-baimodal--docs).

## Storybook
Mutation is mocked and will execute successfully, closing the modal on completion.
        `}}},argTypes:{selectedProjectFragments:{control:!1,description:`GraphQL fragment reference for selected projects`,table:{type:{summary:`BAIProjectBulkEditModalFragment$key`}}},open:{control:!1,description:`Whether the modal is visible (managed by parent component)`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},onOk:{control:!1,description:`Called after all mutations complete successfully`,table:{type:{summary:`(e: React.MouseEvent) => void`}}},onCancel:{control:!1,description:`Called when modal is cancelled`,table:{type:{summary:`(e: React.MouseEvent) => void`}}}},decorators:[e=>(0,Y.jsx)(e,{})]},ge=()=>{var e;let[t,n]=(0,q.useState)(!1),{group_nodes:r}=(0,J.useLazyLoadQuery)(G,{}),i=r==null||(e=r.edges)==null?void 0:e.map(e=>e.node);return i&&i.length>0&&(0,Y.jsxs)(y,{direction:`column`,gap:`md`,children:[(0,Y.jsx)(w,{onClick:()=>n(!0),children:`Open Modal`}),(0,Y.jsx)(U,{selectedProjectFragments:i,open:t,onOk:()=>n(!1),onCancel:()=>n(!1)})]})},$={name:`Basic`,parameters:{docs:{description:{story:`Edit multiple projects at once.`}}},render:()=>(0,Y.jsx)(O,{mockResolvers:{Query:()=>({project_resource_policies:[{id:`policy-1`,name:`default`},{id:`policy-2`,name:`premium`},{id:`policy-3`,name:`unlimited`}]}),ModifyGroup:()=>({ok:!0})},children:(0,Y.jsx)(ge,{})})},$.parameters={...$.parameters,docs:{...(X=$.parameters)==null?void 0:X.docs,source:{originalSource:`{
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'Edit multiple projects at once.'
      }
    }
  },
  render: () => <RelayResolver mockResolvers={{
    Query: () => ({
      project_resource_policies: [{
        id: 'policy-1',
        name: 'default'
      }, {
        id: 'policy-2',
        name: 'premium'
      }, {
        id: 'policy-3',
        name: 'unlimited'
      }]
    }),
    ModifyGroup: () => ({
      ok: true
    })
  }}>
      <QueryResolver />
    </RelayResolver>
}`,...(Z=$.parameters)==null||(Z=Z.docs)==null?void 0:Z.source},description:{story:`Bulk edit multiple projects`,...(Q=$.parameters)==null||(Q=Q.docs)==null?void 0:Q.description}}},_e=[`Default`]})))()}ve();export{$ as Default,_e as __namedExportsOrder,he as default};