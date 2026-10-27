import{a as x,v as c,r as u,j as e}from"./iframe-QZwAMKiq.js";import{R as S}from"./RelayResolver-XAS5rJua.js";import{B as b}from"./BAIButton-PmKvnbug.js";import{B}from"./BAIFlex-4hFga1pS.js";import{b as R}from"./index-FeY6elwG.js";import{B as L}from"./BAIListAlert-BNNucjCt.js";import{B as _}from"./BAIModal-DvWL7vx9.js";import{B as K}from"./BAISelect-CBCf7xMM.js";import{B as w}from"./BAIProjectResourcePolicySelect-BRg_WISn.js";import{r as h}from"./index-Bp2JpKGK.js";import{m}from"./map-Ccjqb6Y2.js";import{c as G}from"./compact-CU4PNV0P.js";import"./preload-helper-Dp1pzeXC.js";import"./index-haGHnGZu.js";import"./astryxLabel-Dmpz-Ddg.js";import"./useConnectedBAIClient-tqqirz5N.js";import"./reactQueryAlias-Cdt1mSEj.js";import"./useUpdatableState-B3kr1mq1.js";import"./useEventNotStable-DIhK0t-d.js";import"./BAIAlert-CU5fD_5c.js";import"./Banner-DBsa2SX3.js";import"./composeEventHandlers-BolWE7qY.js";/* empty css                 */import"./VStack-5uFC5I5N.js";import"./isString-Xqfi90EC.js";import"./isEmpty-24JObc3c.js";import"./index-D3HG7oDv.js";import"./runtime-BhgYCK9T.js";import"./formControl-Dvzd_jn_.js";import"./FormLayoutContext-I_gPtqVy.js";import"./InputClearButton-CBqqb55A.js";import"./selectorPresentation.stylex-BOrHJyFv.js";import"./Section-DZb7CVx9.js";import"./usePopover-C1ZFSwUe.js";import"./useDevWarning-D7HuQA45.js";import"./rtlStyles-T4i24HtE.js";import"./useFocusReturnVisibility-D05EO0ij.js";import"./isRtlElement-B2-7SF8s.js";import"./useHighlightedOptionScroll-DHhnIL-O.js";import"./useAnnounceRenderedText-BwjcBGMJ.js";import"./useResolvedRequired-D8bRBVY6.js";import"./fieldParts-kR9vbQMi.js";import"./inputAria-CStWn1wH.js";import"./Badge-DIDipZtJ.js";import"./CheckboxInput-Cd3lFdmV.js";import"./FieldStatus-D8LGiDaF.js";import"./useIsHydrating-WluJ_xsU.js";import"./indicator.markers.stylex-COHQWIkK.js";import"./useIndicator-kou2pAYJ.js";import"./Divider-BTy0nMNZ.js";import"./inputStyles.stylex-Bztz6H8O.js";import"./Field-DhiK3BrB.js";import"./index-CV2KRCHe.js";import"./Selector-GlxVCQTH.js";import"./useMenuOverflow-CaKVcrOg.js";import"./SelectorOption-BYBqOLSD.js";import"./Item-ucHa-moD.js";import"./computeTargetAndRel-BGwjeA1c.js";import"./sortBy-ACjQLS_h.js";import"./_baseFlatten-pkljZvMB.js";import"./toString-BBOw5KUM.js";import"./isSymbol-Dw6EI7w6.js";import"./_baseGet-D3ijTykJ.js";import"./_baseEach-DUCw9RC_.js";import"./get-BD8VTAu5.js";import"./identity-DKeuBCMA.js";import"./_baseRest-LQkGLeGO.js";import"./_overRest-CdVcA557.js";import"./_defineProperty-BMJuKZxr.js";import"./_isIterateeCall-zsohFmb2.js";const P=(function(){var o=[{defaultValue:null,kind:"LocalArgument",name:"gid"},{defaultValue:null,kind:"LocalArgument",name:"props"}],t=[{alias:null,args:[{kind:"Variable",name:"gid",variableName:"gid"},{kind:"Variable",name:"props",variableName:"props"}],concreteType:"ModifyGroup",kind:"LinkedField",name:"modify_group",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"ok",storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:o,kind:"Fragment",metadata:null,name:"BAIProjectBulkEditModalProjectMutation",selections:t,type:"Mutation",abstractKey:null},kind:"Request",operation:{argumentDefinitions:o,kind:"Operation",name:"BAIProjectBulkEditModalProjectMutation",selections:t},params:{cacheID:"f40c80d0c744c4c03a07bd9c64c6cb58",id:null,metadata:{},name:"BAIProjectBulkEditModalProjectMutation",operationKind:"mutation",text:`mutation BAIProjectBulkEditModalProjectMutation(
  $gid: UUID!
  $props: ModifyGroupInput!
) {
  modify_group(gid: $gid, props: $props) {
    ok
  }
}
`}}})();P.hash="7a741d4d92325e5c4775978312f23e3d";const M={argumentDefinitions:[],kind:"Fragment",metadata:{plural:!0},name:"BAIProjectBulkEditModalFragment",selections:[{alias:null,args:null,kind:"ScalarField",name:"name",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"row_id",storageKey:null}],type:"GroupNode",abstractKey:null};M.hash="317d7350cbe767a8531fc765f9efe84b";const I=({selectedProjectFragments:o,...t})=>{const{t:r}=x(),[n]=c.useForm(),[l,s]=u.useState(!1),F=R(P),p=h.useFragment(M,o);return e.jsx(_,{...t,confirmLoading:l,title:r("comp:BAIProjectBulkEditModal.UpdateMultipleProjects"),okText:r("general.button.Save"),onOk:d=>{s(!0),n.validateFields().then(E=>{const v=m(G(m(p,a=>a.row_id)),a=>F({gid:a,props:{resource_policy:E.resource_policy}}));return Promise.all(v).then(()=>{var a;return(a=t.onOk)==null?void 0:a.call(t,d)})}).finally(()=>s(!1))},children:e.jsxs(B,{direction:"column",align:"stretch",gap:"md",children:[e.jsx(L,{type:"info",showIcon:!0,ghostInfoBg:!1,title:r("comp:BAIProjectBulkEditModal.FollowingProjectsWillBeUpdated"),items:m(p,d=>({key:d.row_id,content:d.name}))}),e.jsx(c,{form:n,children:e.jsx(u.Suspense,{fallback:e.jsx(c.Item,{label:r("comp:BAIProjectBulkEditModal.ProjectResourcePolicy"),children:e.jsx(K,{loading:!0})}),children:e.jsx(c.Item,{label:r("comp:BAIProjectBulkEditModal.ProjectResourcePolicy"),name:"resource_policy",children:e.jsx(w,{})})})})]})})},A=(function(){var o=[{kind:"Literal",name:"first",value:3},{kind:"Literal",name:"offset",value:0}];return{fragment:{argumentDefinitions:[],kind:"Fragment",metadata:null,name:"BAIProjectBulkEditModalStoriesQuery",selections:[{alias:null,args:o,concreteType:"GroupConnection",kind:"LinkedField",name:"group_nodes",plural:!1,selections:[{alias:null,args:null,concreteType:"GroupEdge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"GroupNode",kind:"LinkedField",name:"node",plural:!1,selections:[{args:null,kind:"FragmentSpread",name:"BAIProjectBulkEditModalFragment"}],storageKey:null}],storageKey:null}],storageKey:"group_nodes(first:3,offset:0)"}],type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[],kind:"Operation",name:"BAIProjectBulkEditModalStoriesQuery",selections:[{alias:null,args:o,concreteType:"GroupConnection",kind:"LinkedField",name:"group_nodes",plural:!1,selections:[{alias:null,args:null,concreteType:"GroupEdge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"GroupNode",kind:"LinkedField",name:"node",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"name",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"row_id",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null}],storageKey:null}],storageKey:null}],storageKey:"group_nodes(first:3,offset:0)"}]},params:{cacheID:"e95e83787e4e85b2c9d30b1fe5e4d330",id:null,metadata:{},name:"BAIProjectBulkEditModalStoriesQuery",operationKind:"query",text:`query BAIProjectBulkEditModalStoriesQuery {
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
`}}})();A.hash="99a682fa622f83ed529364e1a889fbda";const eo={title:"Fragments/BAIProjectBulkEditModal",component:I,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:`
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
        `}}},argTypes:{selectedProjectFragments:{control:!1,description:"GraphQL fragment reference for selected projects",table:{type:{summary:"BAIProjectBulkEditModalFragment$key"}}},open:{control:!1,description:"Whether the modal is visible (managed by parent component)",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},onOk:{control:!1,description:"Called after all mutations complete successfully",table:{type:{summary:"(e: React.MouseEvent) => void"}}},onCancel:{control:!1,description:"Called when modal is cancelled",table:{type:{summary:"(e: React.MouseEvent) => void"}}}},decorators:[o=>e.jsx(o,{})]},C=()=>{var l;const[o,t]=u.useState(!1),{group_nodes:r}=h.useLazyLoadQuery(A,{}),n=(l=r==null?void 0:r.edges)==null?void 0:l.map(s=>s.node);return n&&n.length>0&&e.jsxs(B,{direction:"column",gap:"md",children:[e.jsx(b,{onClick:()=>t(!0),children:"Open Modal"}),e.jsx(I,{selectedProjectFragments:n,open:o,onOk:()=>t(!1),onCancel:()=>t(!1)})]})},i={name:"Basic",parameters:{docs:{description:{story:"Edit multiple projects at once."}}},render:()=>e.jsx(S,{mockResolvers:{Query:()=>({project_resource_policies:[{id:"policy-1",name:"default"},{id:"policy-2",name:"premium"},{id:"policy-3",name:"unlimited"}]}),ModifyGroup:()=>({ok:!0})},children:e.jsx(C,{})})};var f,g,y,k,j;i.parameters={...i.parameters,docs:{...(f=i.parameters)==null?void 0:f.docs,source:{originalSource:`{
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
}`,...(y=(g=i.parameters)==null?void 0:g.docs)==null?void 0:y.source},description:{story:"Bulk edit multiple projects",...(j=(k=i.parameters)==null?void 0:k.docs)==null?void 0:j.description}}};const oo=["Default"];export{i as Default,oo as __namedExportsOrder,eo as default};
