import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-D0Ex1IVc.js";import{n,t as r}from"./compact-C9OPbfhP.js";import{i,t as a}from"./hooks-C37w8Ol6.js";import{n as o,t as s}from"./map-CLZMgxwS.js";import{t as c}from"./jsx-runtime-MKhVqBIO.js";import{n as l,t as u}from"./useBAIi18n-Biey1teG.js";import{n as d,t as f}from"./BAIModal-C5hesmkh.js";import{n as p,t as m}from"./Form-D8tC8Qyr.js";import{n as h,t as g}from"./BAIFlex-BOFoS5KY.js";import{t as _}from"./react-relay-sBALIJlt.js";import{n as v,t as y}from"./BAISelect-DFNH8Oeg.js";import{n as b,t as x}from"./BAIButton-BkLrwIfz.js";import{n as S,t as C}from"./BAIListAlert-M2rHuyIr.js";import{n as w,t as T}from"./BAIProjectResourcePolicySelect-couJFHFc.js";import{n as E,t as D}from"./RelayResolver-CMrgwoPg.js";var O;function k(){return(k=e((()=>{O=(function(){var e=[{defaultValue:null,kind:`LocalArgument`,name:`gid`},{defaultValue:null,kind:`LocalArgument`,name:`props`}],t=[{alias:null,args:[{kind:`Variable`,name:`gid`,variableName:`gid`},{kind:`Variable`,name:`props`,variableName:`props`}],concreteType:`ModifyGroup`,kind:`LinkedField`,name:`modify_group`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`ok`,storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:e,kind:`Fragment`,metadata:null,name:`BAIProjectBulkEditModalProjectMutation`,selections:t,type:`Mutation`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:e,kind:`Operation`,name:`BAIProjectBulkEditModalProjectMutation`,selections:t},params:{cacheID:`f40c80d0c744c4c03a07bd9c64c6cb58`,id:null,metadata:{},name:`BAIProjectBulkEditModalProjectMutation`,operationKind:`mutation`,text:`mutation BAIProjectBulkEditModalProjectMutation(
  $gid: UUID!
  $props: ModifyGroupInput!
) {
  modify_group(gid: $gid, props: $props) {
    ok
  }
}
`}}})(),O.hash=`7a741d4d92325e5c4775978312f23e3d`})))()}var A;function j(){return(j=e((()=>{A={argumentDefinitions:[],kind:`Fragment`,metadata:{plural:!0},name:`BAIProjectBulkEditModalFragment`,selections:[{alias:null,args:null,kind:`ScalarField`,name:`name`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`row_id`,storageKey:null}],type:`GroupNode`,abstractKey:null},A.hash=`317d7350cbe767a8531fc765f9efe84b`})))()}var M,N,P,F;function I(){return(I=e((()=>{k(),j(),m(),a(),u(),h(),S(),d(),v(),w(),s(),n(),M=t(),N=_(),P=c(),F=({selectedProjectFragments:e,...t})=>{let{t:n}=l(),[a]=p.useForm(),[s,c]=(0,M.useState)(!1),u=i(O),d=(0,N.useFragment)(A,e);return(0,P.jsx)(f,{...t,confirmLoading:s,title:n(`comp:BAIProjectBulkEditModal.UpdateMultipleProjects`),okText:n(`general.button.Save`),onOk:e=>{c(!0),a.validateFields().then(n=>{let i=o(r(o(d,e=>e.row_id)),e=>u({gid:e,props:{resource_policy:n.resource_policy}}));return Promise.all(i).then(()=>t.onOk?.(e))}).finally(()=>c(!1))},children:(0,P.jsxs)(g,{direction:`column`,align:`stretch`,gap:`md`,children:[(0,P.jsx)(C,{type:`info`,showIcon:!0,ghostInfoBg:!1,title:n(`comp:BAIProjectBulkEditModal.FollowingProjectsWillBeUpdated`),items:o(d,e=>({key:e.row_id,content:e.name}))}),(0,P.jsx)(p,{form:a,children:(0,P.jsx)(M.Suspense,{fallback:(0,P.jsx)(p.Item,{label:n(`comp:BAIProjectBulkEditModal.ProjectResourcePolicy`),children:(0,P.jsx)(y,{loading:!0})}),children:(0,P.jsx)(p.Item,{label:n(`comp:BAIProjectBulkEditModal.ProjectResourcePolicy`),name:`resource_policy`,children:(0,P.jsx)(T,{})})})})]})})}})))()}var L;function R(){return(R=e((()=>{L=(function(){var e=[{kind:`Literal`,name:`first`,value:3},{kind:`Literal`,name:`offset`,value:0}];return{fragment:{argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAIProjectBulkEditModalStoriesQuery`,selections:[{alias:null,args:e,concreteType:`GroupConnection`,kind:`LinkedField`,name:`group_nodes`,plural:!1,selections:[{alias:null,args:null,concreteType:`GroupEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`GroupNode`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{args:null,kind:`FragmentSpread`,name:`BAIProjectBulkEditModalFragment`}],storageKey:null}],storageKey:null}],storageKey:`group_nodes(first:3,offset:0)`}],type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[],kind:`Operation`,name:`BAIProjectBulkEditModalStoriesQuery`,selections:[{alias:null,args:e,concreteType:`GroupConnection`,kind:`LinkedField`,name:`group_nodes`,plural:!1,selections:[{alias:null,args:null,concreteType:`GroupEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`GroupNode`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`name`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`row_id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:`group_nodes(first:3,offset:0)`}]},params:{cacheID:`e95e83787e4e85b2c9d30b1fe5e4d330`,id:null,metadata:{},name:`BAIProjectBulkEditModalStoriesQuery`,operationKind:`query`,text:`query BAIProjectBulkEditModalStoriesQuery {
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
`}}})(),L.hash=`99a682fa622f83ed529364e1a889fbda`})))()}var z,B,V,H,U,W,G;function K(){return(K=e((()=>{R(),E(),b(),h(),I(),z=t(),B=_(),V=c(),H={title:`Fragments/BAIProjectBulkEditModal`,component:F,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`
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
        `}}},argTypes:{selectedProjectFragments:{control:!1,description:`GraphQL fragment reference for selected projects`,table:{type:{summary:`BAIProjectBulkEditModalFragment$key`}}},open:{control:!1,description:`Whether the modal is visible (managed by parent component)`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},onOk:{control:!1,description:`Called after all mutations complete successfully`,table:{type:{summary:`(e: React.MouseEvent) => void`}}},onCancel:{control:!1,description:`Called when modal is cancelled`,table:{type:{summary:`(e: React.MouseEvent) => void`}}}},decorators:[e=>(0,V.jsx)(e,{})]},U=()=>{let[e,t]=(0,z.useState)(!1),{group_nodes:n}=(0,B.useLazyLoadQuery)(L,{}),r=n?.edges?.map(e=>e.node);return r&&r.length>0&&(0,V.jsxs)(g,{direction:`column`,gap:`md`,children:[(0,V.jsx)(x,{onClick:()=>t(!0),children:`Open Modal`}),(0,V.jsx)(F,{selectedProjectFragments:r,open:e,onOk:()=>t(!1),onCancel:()=>t(!1)})]})},W={name:`Basic`,parameters:{docs:{description:{story:`Edit multiple projects at once.`}}},render:()=>(0,V.jsx)(D,{mockResolvers:{Query:()=>({project_resource_policies:[{id:`policy-1`,name:`default`},{id:`policy-2`,name:`premium`},{id:`policy-3`,name:`unlimited`}]}),ModifyGroup:()=>({ok:!0})},children:(0,V.jsx)(U,{})})},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
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
}`,...W.parameters?.docs?.source},description:{story:`Bulk edit multiple projects`,...W.parameters?.docs?.description}}},G=[`Default`]})))()}K();export{W as Default,G as __namedExportsOrder,H as default};