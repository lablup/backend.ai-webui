import{a as x,r as m,j as e}from"./iframe-CHHFS3of.js";import{R as S}from"./RelayResolver-FjNL_eHA.js";import{B as b}from"./BAIButton-D2d_9Wr2.js";import{B}from"./BAIFlex-Bhrcnfos.js";import{b as R}from"./index-B73M33YN.js";import{B as L}from"./BAIListAlert-C-pX80yV.js";import{B as _}from"./BAIModal-DfwPSMhk.js";import{B as K}from"./BAISelect-Cy8oh3DZ.js";import{B as w}from"./BAIProjectResourcePolicySelect--9SctO36.js";import{r as h}from"./index-CRNhr6lx.js";import{F as c}from"./engine-Bs4gAlf7.js";import{m as u}from"./map-ji6Q_oYx.js";import{c as G}from"./compact-CU4PNV0P.js";import"./preload-helper-Dp1pzeXC.js";import"./index-BErsjfHR.js";import"./astryxLabel-BtB-c6wj.js";import"./useConnectedBAIClient-DnD5_jXe.js";import"./reactQueryAlias-OolJgfyS.js";import"./useEventNotStable-Dj_FxhyJ.js";import"./BAIAlert-DvrTDRw0.js";import"./Banner-DqVpmZAf.js";import"./isRenderable-BUV0eL6r.js";import"./composeEventHandlers-BolWE7qY.js";import"./isEmpty-BNAn4tbM.js";import"./VStack-D9PzmTXH.js";import"./isString-D1mXrtp5.js";import"./usePopover-CkJngAYV.js";import"./useDevWarning-DhtY37Q8.js";import"./rtlStyles-T4i24HtE.js";import"./InputClearButton-BqnzD2RX.js";import"./useResolvedRequired-B_PCsUnI.js";import"./Selector-CvPQHPQ5.js";import"./useTypeahead-D_ryBd5s.js";import"./SelectorOption-DZgQXzyv.js";import"./Item-CvcIE_Ms.js";import"./InputGroupContext-DdKZITlc.js";import"./useIndicator-BqJHlcpe.js";import"./Divider-Dfj-wqvB.js";import"./Badge-DdcCw5H1.js";import"./CheckboxInput-BjmIhE9V.js";import"./sortBy-DDGvpPz4.js";import"./_baseFlatten-DqUBRUR_.js";import"./toString-BRpQWpnP.js";import"./isSymbol-MI8TWXZd.js";import"./_baseGet-BvLvbsIf.js";import"./_baseEach-BT3s913C.js";import"./get-Cmsft4qe.js";import"./identity-DKeuBCMA.js";import"./_overRest-BSVZEqO6.js";import"./_defineProperty-B9chShFc.js";import"./_isIterateeCall-Bd2xWEkl.js";import"./circle-question-mark-Bn-vpHcB.js";const P=(function(){var o=[{defaultValue:null,kind:"LocalArgument",name:"gid"},{defaultValue:null,kind:"LocalArgument",name:"props"}],t=[{alias:null,args:[{kind:"Variable",name:"gid",variableName:"gid"},{kind:"Variable",name:"props",variableName:"props"}],concreteType:"ModifyGroup",kind:"LinkedField",name:"modify_group",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"ok",storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:o,kind:"Fragment",metadata:null,name:"BAIProjectBulkEditModalProjectMutation",selections:t,type:"Mutation",abstractKey:null},kind:"Request",operation:{argumentDefinitions:o,kind:"Operation",name:"BAIProjectBulkEditModalProjectMutation",selections:t},params:{cacheID:"f40c80d0c744c4c03a07bd9c64c6cb58",id:null,metadata:{},name:"BAIProjectBulkEditModalProjectMutation",operationKind:"mutation",text:`mutation BAIProjectBulkEditModalProjectMutation(
  $gid: UUID!
  $props: ModifyGroupInput!
) {
  modify_group(gid: $gid, props: $props) {
    ok
  }
}
`}}})();P.hash="7a741d4d92325e5c4775978312f23e3d";const M={argumentDefinitions:[],kind:"Fragment",metadata:{plural:!0},name:"BAIProjectBulkEditModalFragment",selections:[{alias:null,args:null,kind:"ScalarField",name:"name",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"row_id",storageKey:null}],type:"GroupNode",abstractKey:null};M.hash="317d7350cbe767a8531fc765f9efe84b";const I=({selectedProjectFragments:o,...t})=>{const{t:n}=x(),[r]=c.useForm(),[i,s]=m.useState(!1),A=R(P),p=h.useFragment(M,o);return e.jsx(_,{...t,confirmLoading:i,title:n("comp:BAIProjectBulkEditModal.UpdateMultipleProjects"),okText:n("general.button.Save"),onOk:d=>{s(!0),r.validateFields().then(E=>{const v=u(G(u(p,a=>a.row_id)),a=>A({gid:a,props:{resource_policy:E.resource_policy}}));return Promise.all(v).then(()=>{var a;return(a=t.onOk)==null?void 0:a.call(t,d)})}).finally(()=>s(!1))},destroyOnHidden:!0,children:e.jsxs(B,{direction:"column",align:"stretch",gap:"md",children:[e.jsx(L,{type:"info",showIcon:!0,ghostInfoBg:!1,title:n("comp:BAIProjectBulkEditModal.FollowingProjectsWillBeUpdated"),items:u(p,d=>({key:d.row_id,content:d.name}))}),e.jsx(c,{form:r,children:e.jsx(m.Suspense,{fallback:e.jsx(c.Item,{label:n("comp:BAIProjectBulkEditModal.ProjectResourcePolicy"),children:e.jsx(K,{loading:!0})}),children:e.jsx(c.Item,{label:n("comp:BAIProjectBulkEditModal.ProjectResourcePolicy"),name:"resource_policy",children:e.jsx(w,{})})})})]})})},F=(function(){var o=[{kind:"Literal",name:"first",value:3},{kind:"Literal",name:"offset",value:0}];return{fragment:{argumentDefinitions:[],kind:"Fragment",metadata:null,name:"BAIProjectBulkEditModalStoriesQuery",selections:[{alias:null,args:o,concreteType:"GroupConnection",kind:"LinkedField",name:"group_nodes",plural:!1,selections:[{alias:null,args:null,concreteType:"GroupEdge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"GroupNode",kind:"LinkedField",name:"node",plural:!1,selections:[{args:null,kind:"FragmentSpread",name:"BAIProjectBulkEditModalFragment"}],storageKey:null}],storageKey:null}],storageKey:"group_nodes(first:3,offset:0)"}],type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[],kind:"Operation",name:"BAIProjectBulkEditModalStoriesQuery",selections:[{alias:null,args:o,concreteType:"GroupConnection",kind:"LinkedField",name:"group_nodes",plural:!1,selections:[{alias:null,args:null,concreteType:"GroupEdge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"GroupNode",kind:"LinkedField",name:"node",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"name",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"row_id",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null}],storageKey:null}],storageKey:null}],storageKey:"group_nodes(first:3,offset:0)"}]},params:{cacheID:"e95e83787e4e85b2c9d30b1fe5e4d330",id:null,metadata:{},name:"BAIProjectBulkEditModalStoriesQuery",operationKind:"query",text:`query BAIProjectBulkEditModalStoriesQuery {
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
`}}})();F.hash="99a682fa622f83ed529364e1a889fbda";const Ge={title:"Fragments/BAIProjectBulkEditModal",component:I,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:`
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
- **Auto Cleanup**: Uses \`destroyOnHidden\` to unmount component when closed

For other props, refer to [BAIModal](/?path=/docs/modal-baimodal--docs).

## Storybook
Mutation is mocked and will execute successfully, closing the modal on completion.
        `}}},argTypes:{selectedProjectFragments:{control:!1,description:"GraphQL fragment reference for selected projects",table:{type:{summary:"BAIProjectBulkEditModalFragment$key"}}},open:{control:!1,description:"Whether the modal is visible (managed by parent component)",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},onOk:{control:!1,description:"Called after all mutations complete successfully",table:{type:{summary:"(e: React.MouseEvent) => void"}}},onCancel:{control:!1,description:"Called when modal is cancelled",table:{type:{summary:"(e: React.MouseEvent) => void"}}}},decorators:[o=>e.jsx(o,{})]},Q=()=>{var i;const[o,t]=m.useState(!1),{group_nodes:n}=h.useLazyLoadQuery(F,{}),r=(i=n==null?void 0:n.edges)==null?void 0:i.map(s=>s.node);return r&&r.length>0&&e.jsxs(B,{direction:"column",gap:"md",children:[e.jsx(b,{onClick:()=>t(!0),children:"Open Modal"}),e.jsx(I,{selectedProjectFragments:r,open:o,onOk:()=>t(!1),onCancel:()=>t(!1)})]})},l={name:"Basic",parameters:{docs:{description:{story:"Edit multiple projects at once."}}},render:()=>e.jsx(S,{mockResolvers:{Query:()=>({project_resource_policies:[{id:"policy-1",name:"default"},{id:"policy-2",name:"premium"},{id:"policy-3",name:"unlimited"}]}),ModifyGroup:()=>({ok:!0})},children:e.jsx(Q,{})})};var f,g,y,k,j;l.parameters={...l.parameters,docs:{...(f=l.parameters)==null?void 0:f.docs,source:{originalSource:`{
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
}`,...(y=(g=l.parameters)==null?void 0:g.docs)==null?void 0:y.source},description:{story:"Bulk edit multiple projects",...(j=(k=l.parameters)==null?void 0:k.docs)==null?void 0:j.description}}};const Qe=["Default"];export{l as Default,Qe as __namedExportsOrder,Ge as default};
