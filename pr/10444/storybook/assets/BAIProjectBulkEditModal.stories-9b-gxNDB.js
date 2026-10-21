import{b as x,_ as c,r as u,j as e}from"./iframe-Dd7gFUlb.js";import{R as S}from"./RelayResolver-D3opRGfD.js";import{B as b}from"./BAIButton-phleT-id.js";import{B}from"./BAIFlex-BoORDRaj.js";import{b as R}from"./index-BW_XPKvr.js";import{B as L}from"./BAIListAlert-BvK9Q-PJ.js";import{B as _}from"./BAIModal-DbxXIqr9.js";import{B as K}from"./BAISelect-VicUHsH5.js";import{B as w}from"./BAIProjectResourcePolicySelect-B0vfNUjb.js";import{r as h}from"./index-By9gTfg8.js";import{m}from"./map-D-mJbpH6.js";import{c as G}from"./compact-CU4PNV0P.js";import"./preload-helper-Dp1pzeXC.js";import"./index-D6Fv3wVn.js";import"./astryxLabel-C-lQR1tT.js";import"./useConnectedBAIClient-bBkfb4eT.js";import"./reactQueryAlias-RdCkhOvm.js";import"./useUpdatableState-BggswQGg.js";import"./useEventNotStable-BRpIJQCm.js";import"./BAIAlert-DeiMYW4y.js";import"./Banner-BBGTW4Pf.js";import"./isRenderable-BUV0eL6r.js";import"./composeEventHandlers-BolWE7qY.js";/* empty css                 */import"./VStack-CX-cFgm5.js";import"./isString-DDzZp9QI.js";import"./isEmpty-BMTMQNr8.js";import"./InputGroupContext-YDUlzWHO.js";import"./FieldStatus-1L4VoOZI.js";import"./useDevWarning-BicIpZVo.js";import"./Selector-Cy9pEdOT.js";import"./useMenuOverflow-Dl7_fIOs.js";import"./useResolvedRequired-BQj_S4BA.js";import"./SelectorOption-C-tcT0rE.js";import"./Item-Da2fhn6E.js";import"./computeTargetAndRel-BGwjeA1c.js";import"./groupStyles-Cg8tvvGD.js";import"./usePopover-C8Fm298T.js";import"./rtlStyles-T4i24HtE.js";import"./useIndicator-kNg7RLLy.js";import"./Divider-Bu1Ek1sN.js";import"./isRtlElement-B2-7SF8s.js";import"./Badge-DZ9n88n_.js";import"./CheckboxInput-C5O3BB5-.js";import"./sortBy-2Cby8wbx.js";import"./_baseFlatten-Dhtp5r9R.js";import"./toString-D-TZgB2n.js";import"./isSymbol-BLhjG1b3.js";import"./_baseGet-rXet5EZ2.js";import"./_baseIteratee-D_uP-5dr.js";import"./get-Buf3onfO.js";import"./identity-DKeuBCMA.js";import"./_baseRest-BTKoYwLE.js";import"./_overRest-Cs4KXYC2.js";import"./_defineProperty-B1_dgioS.js";import"./_isIterateeCall-BRhWIFxn.js";import"./_baseEach-BKHUhn70.js";const P=(function(){var o=[{defaultValue:null,kind:"LocalArgument",name:"gid"},{defaultValue:null,kind:"LocalArgument",name:"props"}],t=[{alias:null,args:[{kind:"Variable",name:"gid",variableName:"gid"},{kind:"Variable",name:"props",variableName:"props"}],concreteType:"ModifyGroup",kind:"LinkedField",name:"modify_group",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"ok",storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:o,kind:"Fragment",metadata:null,name:"BAIProjectBulkEditModalProjectMutation",selections:t,type:"Mutation",abstractKey:null},kind:"Request",operation:{argumentDefinitions:o,kind:"Operation",name:"BAIProjectBulkEditModalProjectMutation",selections:t},params:{cacheID:"f40c80d0c744c4c03a07bd9c64c6cb58",id:null,metadata:{},name:"BAIProjectBulkEditModalProjectMutation",operationKind:"mutation",text:`mutation BAIProjectBulkEditModalProjectMutation(
  $gid: UUID!
  $props: ModifyGroupInput!
) {
  modify_group(gid: $gid, props: $props) {
    ok
  }
}
`}}})();P.hash="7a741d4d92325e5c4775978312f23e3d";const M={argumentDefinitions:[],kind:"Fragment",metadata:{plural:!0},name:"BAIProjectBulkEditModalFragment",selections:[{alias:null,args:null,kind:"ScalarField",name:"name",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"row_id",storageKey:null}],type:"GroupNode",abstractKey:null};M.hash="317d7350cbe767a8531fc765f9efe84b";const I=({selectedProjectFragments:o,...t})=>{const{t:n}=x(),[r]=c.useForm(),[i,s]=u.useState(!1),F=R(P),p=h.useFragment(M,o);return e.jsx(_,{...t,confirmLoading:i,title:n("comp:BAIProjectBulkEditModal.UpdateMultipleProjects"),okText:n("general.button.Save"),onOk:d=>{s(!0),r.validateFields().then(E=>{const v=m(G(m(p,a=>a.row_id)),a=>F({gid:a,props:{resource_policy:E.resource_policy}}));return Promise.all(v).then(()=>{var a;return(a=t.onOk)==null?void 0:a.call(t,d)})}).finally(()=>s(!1))},children:e.jsxs(B,{direction:"column",align:"stretch",gap:"md",children:[e.jsx(L,{type:"info",showIcon:!0,ghostInfoBg:!1,title:n("comp:BAIProjectBulkEditModal.FollowingProjectsWillBeUpdated"),items:m(p,d=>({key:d.row_id,content:d.name}))}),e.jsx(c,{form:r,children:e.jsx(u.Suspense,{fallback:e.jsx(c.Item,{label:n("comp:BAIProjectBulkEditModal.ProjectResourcePolicy"),children:e.jsx(K,{loading:!0})}),children:e.jsx(c.Item,{label:n("comp:BAIProjectBulkEditModal.ProjectResourcePolicy"),name:"resource_policy",children:e.jsx(w,{})})})})]})})},A=(function(){var o=[{kind:"Literal",name:"first",value:3},{kind:"Literal",name:"offset",value:0}];return{fragment:{argumentDefinitions:[],kind:"Fragment",metadata:null,name:"BAIProjectBulkEditModalStoriesQuery",selections:[{alias:null,args:o,concreteType:"GroupConnection",kind:"LinkedField",name:"group_nodes",plural:!1,selections:[{alias:null,args:null,concreteType:"GroupEdge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"GroupNode",kind:"LinkedField",name:"node",plural:!1,selections:[{args:null,kind:"FragmentSpread",name:"BAIProjectBulkEditModalFragment"}],storageKey:null}],storageKey:null}],storageKey:"group_nodes(first:3,offset:0)"}],type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[],kind:"Operation",name:"BAIProjectBulkEditModalStoriesQuery",selections:[{alias:null,args:o,concreteType:"GroupConnection",kind:"LinkedField",name:"group_nodes",plural:!1,selections:[{alias:null,args:null,concreteType:"GroupEdge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"GroupNode",kind:"LinkedField",name:"node",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"name",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"row_id",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null}],storageKey:null}],storageKey:null}],storageKey:"group_nodes(first:3,offset:0)"}]},params:{cacheID:"e95e83787e4e85b2c9d30b1fe5e4d330",id:null,metadata:{},name:"BAIProjectBulkEditModalStoriesQuery",operationKind:"query",text:`query BAIProjectBulkEditModalStoriesQuery {
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
`}}})();A.hash="99a682fa622f83ed529364e1a889fbda";const Te={title:"Fragments/BAIProjectBulkEditModal",component:I,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:`
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
        `}}},argTypes:{selectedProjectFragments:{control:!1,description:"GraphQL fragment reference for selected projects",table:{type:{summary:"BAIProjectBulkEditModalFragment$key"}}},open:{control:!1,description:"Whether the modal is visible (managed by parent component)",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},onOk:{control:!1,description:"Called after all mutations complete successfully",table:{type:{summary:"(e: React.MouseEvent) => void"}}},onCancel:{control:!1,description:"Called when modal is cancelled",table:{type:{summary:"(e: React.MouseEvent) => void"}}}},decorators:[o=>e.jsx(o,{})]},C=()=>{var i;const[o,t]=u.useState(!1),{group_nodes:n}=h.useLazyLoadQuery(A,{}),r=(i=n==null?void 0:n.edges)==null?void 0:i.map(s=>s.node);return r&&r.length>0&&e.jsxs(B,{direction:"column",gap:"md",children:[e.jsx(b,{onClick:()=>t(!0),children:"Open Modal"}),e.jsx(I,{selectedProjectFragments:r,open:o,onOk:()=>t(!1),onCancel:()=>t(!1)})]})},l={name:"Basic",parameters:{docs:{description:{story:"Edit multiple projects at once."}}},render:()=>e.jsx(S,{mockResolvers:{Query:()=>({project_resource_policies:[{id:"policy-1",name:"default"},{id:"policy-2",name:"premium"},{id:"policy-3",name:"unlimited"}]}),ModifyGroup:()=>({ok:!0})},children:e.jsx(C,{})})};var f,g,y,k,j;l.parameters={...l.parameters,docs:{...(f=l.parameters)==null?void 0:f.docs,source:{originalSource:`{
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
}`,...(y=(g=l.parameters)==null?void 0:g.docs)==null?void 0:y.source},description:{story:"Bulk edit multiple projects",...(j=(k=l.parameters)==null?void 0:k.docs)==null?void 0:j.description}}};const $e=["Default"];export{l as Default,$e as __namedExportsOrder,Te as default};
