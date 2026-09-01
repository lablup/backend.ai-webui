import{a as x,r as m,j as e}from"./iframe-BgaR6W86.js";import{R as S}from"./RelayResolver-CR8WOf9q.js";import{B as b}from"./BAIButton-DeYlQg_6.js";import{B}from"./BAIFlex-BReP981K.js";import{b as R}from"./index-B9gp23TP.js";import{B as L}from"./BAIListAlert-rWzUIO8W.js";import{B as _}from"./BAIModal-C7KFJ2OE.js";import{B as K}from"./BAISelect-CkeiKCPg.js";import{B as w}from"./BAIProjectResourcePolicySelect-BrhL6RaF.js";import{r as h}from"./index-DVKtKgn0.js";import{F as c}from"./engine-zFKF5kAy.js";import{m as u}from"./map-RBhnI4yw.js";import{c as G}from"./compact-CU4PNV0P.js";import"./preload-helper-Dp1pzeXC.js";import"./index-qfIogcY4.js";import"./astryxLabel-CG99bAkm.js";import"./useConnectedBAIClient-8NyCy_Sb.js";import"./reactQueryAlias-DH6mGtP2.js";import"./useEventNotStable-B1T7INE7.js";import"./BAIAlert-D60vsNFG.js";import"./Banner-CWY8HHNq.js";import"./isRenderable-BUV0eL6r.js";import"./composeEventHandlers-BolWE7qY.js";import"./isEmpty-DuekF-0z.js";import"./VStack-CUQ6QTqh.js";import"./isString-ZGfZbGem.js";import"./usePopover-CTpJClQ2.js";import"./useDevWarning-D0o9UoUz.js";import"./rtlStyles-T4i24HtE.js";import"./InputClearButton-BVR5cD_d.js";import"./useResolvedRequired-B6GLv2yE.js";import"./Selector-BoZI311t.js";import"./useTypeahead-DmCUE80t.js";import"./SelectorOption-CULSo2Pu.js";import"./Item-BO3VQ67s.js";import"./InputGroupContext-DHd-PeYI.js";import"./useIndicator-Bnn9CHA2.js";import"./Divider-DlzJWL5K.js";import"./Badge-1Ky0L4IN.js";import"./CheckboxInput-DBCoPTC3.js";import"./sortBy-CQStWcg1.js";import"./_baseFlatten-oXAtzhi4.js";import"./toString-DaRP1wp9.js";import"./isSymbol-qj2tQINM.js";import"./_baseGet-DLXUJTfR.js";import"./_baseEach-CZxQopLi.js";import"./get-BIAi8pXR.js";import"./identity-DKeuBCMA.js";import"./_overRest-BvT7bHFb.js";import"./_defineProperty-BY0sodds.js";import"./_isIterateeCall-m8m-c_fh.js";import"./circle-question-mark-0PUHvvVR.js";const P=(function(){var o=[{defaultValue:null,kind:"LocalArgument",name:"gid"},{defaultValue:null,kind:"LocalArgument",name:"props"}],t=[{alias:null,args:[{kind:"Variable",name:"gid",variableName:"gid"},{kind:"Variable",name:"props",variableName:"props"}],concreteType:"ModifyGroup",kind:"LinkedField",name:"modify_group",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"ok",storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:o,kind:"Fragment",metadata:null,name:"BAIProjectBulkEditModalProjectMutation",selections:t,type:"Mutation",abstractKey:null},kind:"Request",operation:{argumentDefinitions:o,kind:"Operation",name:"BAIProjectBulkEditModalProjectMutation",selections:t},params:{cacheID:"f40c80d0c744c4c03a07bd9c64c6cb58",id:null,metadata:{},name:"BAIProjectBulkEditModalProjectMutation",operationKind:"mutation",text:`mutation BAIProjectBulkEditModalProjectMutation(
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
