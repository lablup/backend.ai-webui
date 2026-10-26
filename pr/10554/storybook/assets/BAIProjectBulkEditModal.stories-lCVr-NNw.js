import{a as x,v as c,r as u,j as e}from"./iframe-Di_XecXq.js";import{R as S}from"./RelayResolver-DQZD-MkR.js";import{B as b}from"./BAIButton-C1saA3Jb.js";import{B}from"./BAIFlex-CJFLln3b.js";import{b as R}from"./index-DCRx9DZW.js";import{B as L}from"./BAIListAlert-DHv1RKG1.js";import{B as _}from"./BAIModal-D1pED4R6.js";import{B as K}from"./BAISelect-CchNDjZ9.js";import{B as w}from"./BAIProjectResourcePolicySelect-DKM5nnVG.js";import{r as h}from"./index-CUjBmros.js";import{m}from"./map-C07nJouJ.js";import{c as G}from"./compact-CU4PNV0P.js";import"./preload-helper-Dp1pzeXC.js";import"./index-Ci86ErvM.js";import"./astryxLabel-B1TNXW_F.js";import"./useConnectedBAIClient-J0Akp-35.js";import"./reactQueryAlias-DsOKzDPV.js";import"./useUpdatableState-DKfqux_e.js";import"./useEventNotStable-B2J1PXln.js";import"./BAIAlert-XrOfFl59.js";import"./Banner-Cx9Tf9-O.js";import"./composeEventHandlers-BolWE7qY.js";/* empty css                 */import"./VStack-C1uSbEEZ.js";import"./isString-Digz9kF-.js";import"./isEmpty-Ddx88K_P.js";import"./index-C1noMiXy.js";import"./runtime-BhgYCK9T.js";import"./formControl-yDi8ZhE9.js";import"./FormLayoutContext-CRUCCzsJ.js";import"./InputClearButton-BtChBCU4.js";import"./selectorPresentation.stylex-Cqa2LNg7.js";import"./Section-BxAKnwrx.js";import"./usePopover-DESJi4Cf.js";import"./useDevWarning-BsyZ8wza.js";import"./rtlStyles-T4i24HtE.js";import"./useFocusReturnVisibility-CH3kfbxQ.js";import"./isRtlElement-B2-7SF8s.js";import"./useHighlightedOptionScroll-C3lQmDXG.js";import"./useAnnounceRenderedText-BOgI6usD.js";import"./useResolvedRequired-CGC_LxF2.js";import"./fieldParts-CE36oM2V.js";import"./inputAria-CStWn1wH.js";import"./Badge-BUDzgrLN.js";import"./CheckboxInput-Btc2rrRL.js";import"./FieldStatus-B7qhiKO8.js";import"./useIsHydrating-DTbsppsP.js";import"./indicator.markers.stylex-BihYEKkF.js";import"./useIndicator-CPJ0h6HQ.js";import"./Divider-BJtW0HkZ.js";import"./inputStyles.stylex-Bztz6H8O.js";import"./Field-DPoAktDR.js";import"./index-CD8cimzP.js";import"./Selector-THRRKoq1.js";import"./useMenuOverflow-DjAY5N7o.js";import"./SelectorOption-7-PL2lKU.js";import"./Item-BDOUOfBO.js";import"./computeTargetAndRel-BGwjeA1c.js";import"./sortBy-D47FuwGn.js";import"./_baseFlatten-Cqa7CIq0.js";import"./toString-aoxMCqTi.js";import"./isSymbol-DBdgWIE3.js";import"./_baseGet-CWgtBitX.js";import"./_baseEach-CbD2EVWg.js";import"./get-CWVOTsGl.js";import"./identity-DKeuBCMA.js";import"./_baseRest-D3NBfzmC.js";import"./_overRest-Z7JlNkGu.js";import"./_defineProperty-BgQ4GKgh.js";import"./_isIterateeCall-qTczJDGg.js";const P=(function(){var o=[{defaultValue:null,kind:"LocalArgument",name:"gid"},{defaultValue:null,kind:"LocalArgument",name:"props"}],t=[{alias:null,args:[{kind:"Variable",name:"gid",variableName:"gid"},{kind:"Variable",name:"props",variableName:"props"}],concreteType:"ModifyGroup",kind:"LinkedField",name:"modify_group",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"ok",storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:o,kind:"Fragment",metadata:null,name:"BAIProjectBulkEditModalProjectMutation",selections:t,type:"Mutation",abstractKey:null},kind:"Request",operation:{argumentDefinitions:o,kind:"Operation",name:"BAIProjectBulkEditModalProjectMutation",selections:t},params:{cacheID:"f40c80d0c744c4c03a07bd9c64c6cb58",id:null,metadata:{},name:"BAIProjectBulkEditModalProjectMutation",operationKind:"mutation",text:`mutation BAIProjectBulkEditModalProjectMutation(
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
