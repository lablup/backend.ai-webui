import{c as ke,b as oe,r as u,j as n,_ as L}from"./iframe-CML3nvMY.js";import{R as Pe}from"./RelayResolver-hFWFHWq9.js";import{B as je}from"./BAIButton-CXe4dQvQ.js";import{B as ne}from"./BAIFlex-Cj-BnQFD.js";import{a as Be,b as he}from"./index-Bf6wIr2d.js";import{B as be}from"./BAIListAlert-iEwRJgGr.js";import{B as Ae}from"./BAIModal-D6XNjGbc.js";import{B as Ie}from"./BAISelect-BuqLWXgj.js";import{u as ve,a as Se}from"./usePaginatedQuery-DxLuk4Yl.js";import{B as Fe}from"./BAIComplexSelect-CSfJaKd9.js";import{u as H}from"./useControllableValue-z4UC3gF3.js";import{c as K}from"./compact-CU4PNV0P.js";import{c as J}from"./castArray-Dd0AotaJ.js";import{m as g}from"./map-DKEacVL5.js";import{r as le}from"./index-Bjsc_WvM.js";import"./preload-helper-Dp1pzeXC.js";import"./index-Bsj2ML4w.js";import"./astryxLabel-xRlfaUIf.js";import"./useConnectedBAIClient-CjVpyVz5.js";import"./reactQueryAlias-iy1Ugwxt.js";import"./useUpdatableState-B_x2yqrg.js";import"./useEventNotStable-DL9pvx_x.js";import"./BAIAlert-9wZdwzZZ.js";import"./Banner-BMOJrJuU.js";import"./isRenderable-BUV0eL6r.js";import"./composeEventHandlers-BolWE7qY.js";/* empty css                 */import"./VStack-C_FPGFlH.js";import"./isString-outnnmQy.js";import"./isEmpty-CEZqQCn-.js";import"./InputGroupContext-C3-sd4ca.js";import"./FieldStatus-DzjxwPpe.js";import"./useDevWarning-kb7xILTt.js";import"./Selector-BTrecaJB.js";import"./useMenuOverflow-DPPgiIak.js";import"./useResolvedRequired-CqqdWN91.js";import"./SelectorOption-BFz4o33m.js";import"./Item-Czttiphg.js";import"./computeTargetAndRel-BGwjeA1c.js";import"./groupStyles-CyYnSg-D.js";import"./usePopover-CHzGtZ4m.js";import"./rtlStyles-T4i24HtE.js";import"./useIndicator-B3qgHjdf.js";import"./Divider-BF9pKoQw.js";import"./isRtlElement-B2-7SF8s.js";import"./Badge-DI63UweW.js";import"./CheckboxInput-FvYidkZu.js";import"./toNumber-CTn0D1hd.js";import"./_trimmedEndIndex-DuQxD0U0.js";import"./isSymbol-BCPZCccx.js";import"./uniqBy-DcWBpRuT.js";import"./_baseEach-BtP3wNsY.js";import"./get-DzMeoZIA.js";import"./_baseGet-DSJv0UK0.js";import"./toString-DPcQWTdv.js";import"./identity-DKeuBCMA.js";import"./_baseUniq-DlXfgtTN.js";import"./_arrayIncludes-B0rj_Tme.js";import"./_baseIndexOf-Be9UPhX8.js";import"./_baseFindIndex-Cj99RmFE.js";import"./compiled-D_YGP6zo.js";import"./Token-CFgX1Pvt.js";import"./useInteractiveRole-B9WYMEJh.js";const ae=(function(){var t=[{defaultValue:null,kind:"LocalArgument",name:"gid"},{defaultValue:null,kind:"LocalArgument",name:"props"}],e=[{alias:null,args:[{kind:"Variable",name:"gid",variableName:"gid"},{kind:"Variable",name:"props",variableName:"props"}],concreteType:"ModifyGroup",kind:"LinkedField",name:"modify_group",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"ok",storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:t,kind:"Fragment",metadata:null,name:"BAIProjectBulkEditModalProjectMutation",selections:e,type:"Mutation",abstractKey:null},kind:"Request",operation:{argumentDefinitions:t,kind:"Operation",name:"BAIProjectBulkEditModalProjectMutation",selections:e},params:{cacheID:"f40c80d0c744c4c03a07bd9c64c6cb58",id:null,metadata:{},name:"BAIProjectBulkEditModalProjectMutation",operationKind:"mutation",text:`mutation BAIProjectBulkEditModalProjectMutation(
  $gid: UUID!
  $props: ModifyGroupInput!
) {
  modify_group(gid: $gid, props: $props) {
    ok
  }
}
`}}})();ae.hash="7a741d4d92325e5c4775978312f23e3d";const re={argumentDefinitions:[],kind:"Fragment",metadata:{plural:!0},name:"BAIProjectBulkEditModalFragment",selections:[{alias:null,args:null,kind:"ScalarField",name:"name",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"row_id",storageKey:null}],type:"GroupNode",abstractKey:null};re.hash="317d7350cbe767a8531fc765f9efe84b";const ie=(function(){var t={defaultValue:null,kind:"LocalArgument",name:"filter"},e={defaultValue:null,kind:"LocalArgument",name:"limit"},o={defaultValue:null,kind:"LocalArgument",name:"offset"},l=[{alias:null,args:[{kind:"Variable",name:"filter",variableName:"filter"},{kind:"Variable",name:"limit",variableName:"limit"},{kind:"Variable",name:"offset",variableName:"offset"},{kind:"Literal",name:"orderBy",value:[{direction:"ASC",field:"NAME"}]}],concreteType:"ProjectResourcePolicyV2Connection",kind:"LinkedField",name:"adminProjectResourcePoliciesV2",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"count",storageKey:null},{alias:null,args:null,concreteType:"ProjectResourcePolicyV2Edge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"ProjectResourcePolicyV2",kind:"LinkedField",name:"node",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"name",storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:[t,e,o],kind:"Fragment",metadata:null,name:"BAIAdminProjectResourcePolicySelectPaginatedQuery",selections:l,type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[o,e,t],kind:"Operation",name:"BAIAdminProjectResourcePolicySelectPaginatedQuery",selections:l},params:{cacheID:"eab3f31d5c61a722472c4752c9b0e8fb",id:null,metadata:{},name:"BAIAdminProjectResourcePolicySelectPaginatedQuery",operationKind:"query",text:`query BAIAdminProjectResourcePolicySelectPaginatedQuery(
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
`}}})();ie.hash="e52acd5d85571c4cab0dc151a59a31b9";const Me=t=>{"use memo";var W;const e=ke.c(40);let o,l,a,i;e[0]!==t?({multiple:i,isLoading:o,ref:l,...a}=t,e[0]=t,e[1]=o,e[2]=l,e[3]=a,e[4]=i):(o=e[1],l=e[2],a=e[3],i=e[4]);const s=i===void 0?!1:i,{t:d}=oe();let c;e[5]===Symbol.for("react.memo_cache_sentinel")?(c={valuePropName:"value",trigger:"onChange"},e[5]=c):c=e[5];const[B,y]=H(a,c);let r;e[6]===Symbol.for("react.memo_cache_sentinel")?(r={valuePropName:"open",trigger:"onOpenChange",defaultValuePropName:"defaultOpen"},e[6]=r):r=e[6];const[ue,V]=H(a,r),de=u.useDeferredValue(ue),[k,me]=u.useState(""),P=ve(k),[pe,q]=u.useTransition(),[fe,h]=Be(),_=u.useDeferredValue(fe),U=u.useDeferredValue(B),ge=K(J(U??[]));let b,A;e[7]===Symbol.for("react.memo_cache_sentinel")?(b=ie,A={limit:10},e[7]=b,e[8]=A):(b=e[7],A=e[8]);let m;e[9]!==P?(m=P?{name:{contains:P}}:null,e[9]=P,e[10]=m):m=e[10];let I;e[11]!==m?(I={filter:m},e[11]=m,e[12]=I):I=e[12];const C=de?"network-only":"store-only";let v;e[13]!==_||e[14]!==C?(v={fetchPolicy:C,fetchKey:_},e[13]=_,e[14]=C,e[15]=v):v=e[15];let S;e[16]===Symbol.for("react.memo_cache_sentinel")?(S={getTotal:Re,getItem:xe,getId:Le},e[16]=S):S=e[16];const{paginationData:D,result:ye,loadNext:Q,isLoadingNext:w}=Se(b,A,I,v,S);let F,M;e[17]!==h?(F=()=>({refetch:()=>{q(()=>{h()})}}),M=[h,q],e[17]=h,e[18]=F,e[19]=M):(F=e[18],M=e[19]),u.useImperativeHandle(l,F,M);let R;e[20]!==D?(R=K(g(D,Ke)),e[20]=D,e[21]=R):R=e[21];const N=R;let O;e:{const x=g(ge,Ve);if(s){O=x;break e}O=x[0]??null}const T=O;let p;e[22]!==d?(p=d("comp:BAIAdminProjectResourcePolicySelect.SelectProjectResourcePolicy"),e[22]=d,e[23]=p):p=e[23];const $=o||B!==U||k!==P||pe,G=((W=ye.adminProjectResourcePoliciesV2)==null?void 0:W.count)??void 0;let f;e[24]!==s||e[25]!==y?(f=x=>{const z=g(K(J(x??[])),_e);y(s?z:z[0],void 0)},e[24]=s,e[25]=y,e[26]=f):f=e[26];let E;return e[27]!==w||e[28]!==T||e[29]!==Q||e[30]!==s||e[31]!==N||e[32]!==k||e[33]!==a||e[34]!==V||e[35]!==p||e[36]!==$||e[37]!==G||e[38]!==f?(E=n.jsx(Fe,{placeholder:p,...a,multiple:s,isLoading:$,isLoadingNext:w,total:G,options:N,value:T,onChange:f,searchValue:k,onSearch:me,onOpenChange:V,endReached:Q}),e[27]=w,e[28]=T,e[29]=Q,e[30]=s,e[31]=N,e[32]=k,e[33]=a,e[34]=V,e[35]=p,e[36]=$,e[37]=G,e[38]=f,e[39]=E):E=e[39],E};function Re(t){var e;return((e=t.adminProjectResourcePoliciesV2)==null?void 0:e.count)??void 0}function Ee(t){return t==null?void 0:t.node}function xe(t){var e,o;return(o=(e=t.adminProjectResourcePoliciesV2)==null?void 0:e.edges)==null?void 0:o.map(Ee)}function Le(t){return t==null?void 0:t.name}function Ke(t){return t!=null&&t.name?{value:t.name,label:t.name}:null}function Ve(t){return{label:t,value:t}}function _e(t){return t.value}const se=({selectedProjectFragments:t,...e})=>{const{t:o}=oe(),[l]=L.useForm(),[a,i]=u.useState(!1),s=he(ae),d=le.useFragment(re,t);return n.jsx(Ae,{...e,confirmLoading:a,title:o("comp:BAIProjectBulkEditModal.UpdateMultipleProjects"),okText:o("general.button.Save"),onOk:c=>{i(!0),l.validateFields().then(B=>{const y=g(K(g(d,r=>r.row_id)),r=>s({gid:r,props:{resource_policy:B.resource_policy}}));return Promise.all(y).then(()=>{var r;return(r=e.onOk)==null?void 0:r.call(e,c)})}).finally(()=>i(!1))},children:n.jsxs(ne,{direction:"column",align:"stretch",gap:"md",children:[n.jsx(be,{type:"info",showIcon:!0,ghostInfoBg:!1,title:o("comp:BAIProjectBulkEditModal.FollowingProjectsWillBeUpdated"),items:g(d,c=>({key:c.row_id,content:c.name}))}),n.jsx(L,{form:l,children:n.jsx(u.Suspense,{fallback:n.jsx(L.Item,{label:o("comp:BAIProjectBulkEditModal.ProjectResourcePolicy"),children:n.jsx(Ie,{loading:!0})}),children:n.jsx(L.Item,{label:o("comp:BAIProjectBulkEditModal.ProjectResourcePolicy"),name:"resource_policy",children:n.jsx(Me,{label:o("comp:BAIProjectBulkEditModal.ProjectResourcePolicy"),isLabelHidden:!0})})})})]})})},ce=(function(){var t=[{kind:"Literal",name:"first",value:3},{kind:"Literal",name:"offset",value:0}];return{fragment:{argumentDefinitions:[],kind:"Fragment",metadata:null,name:"BAIProjectBulkEditModalStoriesQuery",selections:[{alias:null,args:t,concreteType:"GroupConnection",kind:"LinkedField",name:"group_nodes",plural:!1,selections:[{alias:null,args:null,concreteType:"GroupEdge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"GroupNode",kind:"LinkedField",name:"node",plural:!1,selections:[{args:null,kind:"FragmentSpread",name:"BAIProjectBulkEditModalFragment"}],storageKey:null}],storageKey:null}],storageKey:"group_nodes(first:3,offset:0)"}],type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[],kind:"Operation",name:"BAIProjectBulkEditModalStoriesQuery",selections:[{alias:null,args:t,concreteType:"GroupConnection",kind:"LinkedField",name:"group_nodes",plural:!1,selections:[{alias:null,args:null,concreteType:"GroupEdge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"GroupNode",kind:"LinkedField",name:"node",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"name",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"row_id",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null}],storageKey:null}],storageKey:null}],storageKey:"group_nodes(first:3,offset:0)"}]},params:{cacheID:"e95e83787e4e85b2c9d30b1fe5e4d330",id:null,metadata:{},name:"BAIProjectBulkEditModalStoriesQuery",operationKind:"query",text:`query BAIProjectBulkEditModalStoriesQuery {
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
`}}})();ce.hash="99a682fa622f83ed529364e1a889fbda";const Ut={title:"Fragments/BAIProjectBulkEditModal",component:se,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:`
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
        `}}},argTypes:{selectedProjectFragments:{control:!1,description:"GraphQL fragment reference for selected projects",table:{type:{summary:"BAIProjectBulkEditModalFragment$key"}}},open:{control:!1,description:"Whether the modal is visible (managed by parent component)",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},onOk:{control:!1,description:"Called after all mutations complete successfully",table:{type:{summary:"(e: React.MouseEvent) => void"}}},onCancel:{control:!1,description:"Called when modal is cancelled",table:{type:{summary:"(e: React.MouseEvent) => void"}}}},decorators:[t=>n.jsx(t,{})]},Ce=()=>{var a;const[t,e]=u.useState(!1),{group_nodes:o}=le.useLazyLoadQuery(ce,{}),l=(a=o==null?void 0:o.edges)==null?void 0:a.map(i=>i.node);return l&&l.length>0&&n.jsxs(ne,{direction:"column",gap:"md",children:[n.jsx(je,{onClick:()=>e(!0),children:"Open Modal"}),n.jsx(se,{selectedProjectFragments:l,open:t,onOk:()=>e(!1),onCancel:()=>e(!1)})]})},j={name:"Basic",parameters:{docs:{description:{story:"Edit multiple projects at once."}}},render:()=>n.jsx(Pe,{mockResolvers:{Query:()=>({project_resource_policies:[{id:"policy-1",name:"default"},{id:"policy-2",name:"premium"},{id:"policy-3",name:"unlimited"}]}),ModifyGroup:()=>({ok:!0})},children:n.jsx(Ce,{})})};var X,Y,Z,ee,te;j.parameters={...j.parameters,docs:{...(X=j.parameters)==null?void 0:X.docs,source:{originalSource:`{
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
}`,...(Z=(Y=j.parameters)==null?void 0:Y.docs)==null?void 0:Z.source},description:{story:"Bulk edit multiple projects",...(te=(ee=j.parameters)==null?void 0:ee.docs)==null?void 0:te.description}}};const Wt=["Default"];export{j as Default,Wt as __namedExportsOrder,Ut as default};
