import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-DlPsW1c0.js";import{n,t as r}from"./compact-C9OPbfhP.js";import{i,t as a}from"./hooks-CWfVxhQL.js";import{n as o,t as ee}from"./forEach-Cs0R4zzP.js";import{n as s,t as c}from"./find-DWiBvCZH.js";import{n as l,t as u}from"./map-BLzs52H1.js";import{n as te,t as d}from"./isEmpty-CptDxjc2.js";import{t as f}from"./jsx-runtime-MKhVqBIO.js";import{n as ne,t as p}from"./useBAIi18n-HeDRJIs5.js";import{t as m}from"./compiler-runtime-DU4U6aph.js";import{n as h,t as g}from"./BAIModal-lr2vQ6Tv.js";import{n as _,t as v}from"./Form-Cu5lyLGy.js";import{b as y,y as re}from"./iframe-BUIYvSv6.js";import{n as b,t as x}from"./BAIFlex-DnaoYTJ1.js";import{t as S}from"./react-relay-sHama7hJ.js";import{n as C,t as ie}from"./BAISelect-BqpFaJbj.js";import{n as w,t as T}from"./BAIButton-DOGofbc0.js";import{n as E,t as ae}from"./BAIListAlert-BfIYoSJQ.js";import{n as D,t as oe}from"./BAIProjectResourcePolicySelect-GMSaXtcY.js";import{n as O,t as k}from"./RelayResolver-BnFyFQJn.js";var A;function j(){return(j=e((()=>{A=(function(){var e=[{defaultValue:null,kind:`LocalArgument`,name:`input`}],t={alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},n=[{alias:null,args:[{kind:`Variable`,name:`input`,variableName:`input`}],concreteType:`PartialBulkProjectsPayload`,kind:`LinkedField`,name:`partialBulkUpdateProjectsV2`,plural:!1,selections:[{alias:null,args:null,concreteType:`ProjectV2`,kind:`LinkedField`,name:`successes`,plural:!0,selections:[t,{alias:null,args:null,concreteType:`ProjectOrganizationInfo`,kind:`LinkedField`,name:`organization`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`resourcePolicy`,storageKey:null}],storageKey:null}],storageKey:null},{alias:null,args:null,concreteType:`PartialBulkFailure`,kind:`LinkedField`,name:`failed`,plural:!0,selections:[t,{alias:null,args:null,kind:`ScalarField`,name:`message`,storageKey:null}],storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:e,kind:`Fragment`,metadata:null,name:`BAIProjectBulkEditModalProjectMutation`,selections:n,type:`Mutation`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:e,kind:`Operation`,name:`BAIProjectBulkEditModalProjectMutation`,selections:n},params:{cacheID:`e224687758e85158fdb85089e64c48a7`,id:null,metadata:{},name:`BAIProjectBulkEditModalProjectMutation`,operationKind:`mutation`,text:`mutation BAIProjectBulkEditModalProjectMutation(
  $input: PartialBulkUpdateProjectsInput!
) {
  partialBulkUpdateProjectsV2(input: $input) {
    successes {
      id
      organization {
        resourcePolicy
      }
    }
    failed {
      id
      message
    }
  }
}
`}}})(),A.hash=`8cec9f2084a7e839f36155174748c551`})))()}var M;function N(){return(N=e((()=>{M={argumentDefinitions:[],kind:`Fragment`,metadata:{plural:!0},name:`BAIProjectBulkEditModalFragment`,selections:[{alias:null,args:null,kind:`ScalarField`,name:`name`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`row_id`,storageKey:null}],type:`GroupNode`,abstractKey:null},M.hash=`317d7350cbe767a8531fc765f9efe84b`})))()}function P(e){return e.row_id}function se(e){return{key:e.row_id,content:e.name}}var F,I,L,R,z;function B(){return(B=e((()=>{j(),N(),F=m(),y(),v(),a(),p(),b(),E(),h(),C(),D(),n(),u(),d(),o(),s(),I=t(),L=S(),R=f(),z=e=>{"use memo";let t=(0,F.c)(46),n,a;t[0]===e?(n=t[1],a=t[2]):({selectedProjectFragments:n,...a}=e,t[0]=e,t[1]=n,t[2]=a);let{t:o}=ne(),{message:s}=re.useApp(),[u]=_.useForm(),[d,f]=(0,I.useState)(!1),p=i(A),m=(0,L.useFragment)(M,n),h;t[3]===o?h=t[4]:(h=o(`comp:BAIProjectBulkEditModal.UpdateMultipleProjects`),t[3]=o,t[4]=h);let v;t[5]===o?v=t[6]:(v=o(`general.button.Save`),t[5]=o,t[6]=v);let y;t[7]!==u||t[8]!==s||t[9]!==p||t[10]!==m||t[11]!==a?(y=e=>{f(!0),u.validateFields().then(t=>{let n=r(l(m,P));return p({input:{items:l(n,e=>({id:e,input:{resourcePolicy:t.resource_policy}}))}}).then(t=>{let{partialBulkUpdateProjectsV2:n}=t;if(te(n.failed)){var r;(r=a.onOk)==null||r.call(a,e)}else ee(n.failed,e=>{var t;let n=(t=c(m,{row_id:e.id}))==null?void 0:t.name;s.error(n?`${n}: ${e.message}`:e.message)})})}).catch(e=>{e instanceof Error&&s.error(e.message)}).finally(()=>f(!1))},t[7]=u,t[8]=s,t[9]=p,t[10]=m,t[11]=a,t[12]=y):y=t[12];let b;t[13]===o?b=t[14]:(b=o(`comp:BAIProjectBulkEditModal.FollowingProjectsWillBeUpdated`),t[13]=o,t[14]=b);let S;t[15]===m?S=t[16]:(S=l(m,se),t[15]=m,t[16]=S);let C;t[17]!==b||t[18]!==S?(C=(0,R.jsx)(ae,{type:`info`,showIcon:!0,ghostInfoBg:!1,title:b,items:S}),t[17]=b,t[18]=S,t[19]=C):C=t[19];let w;t[20]===o?w=t[21]:(w=o(`comp:BAIProjectBulkEditModal.ProjectResourcePolicy`),t[20]=o,t[21]=w);let T;t[22]===Symbol.for(`react.memo_cache_sentinel`)?(T=(0,R.jsx)(ie,{loading:!0,disabled:!0}),t[22]=T):T=t[22];let E;t[23]===w?E=t[24]:(E=(0,R.jsx)(_.Item,{label:w,children:T}),t[23]=w,t[24]=E);let D;t[25]===o?D=t[26]:(D=o(`comp:BAIProjectBulkEditModal.ProjectResourcePolicy`),t[25]=o,t[26]=D);let O;t[27]===Symbol.for(`react.memo_cache_sentinel`)?(O=(0,R.jsx)(oe,{}),t[27]=O):O=t[27];let k;t[28]===D?k=t[29]:(k=(0,R.jsx)(_.Item,{label:D,name:`resource_policy`,children:O}),t[28]=D,t[29]=k);let j;t[30]!==k||t[31]!==E?(j=(0,R.jsx)(I.Suspense,{fallback:E,children:k}),t[30]=k,t[31]=E,t[32]=j):j=t[32];let N;t[33]!==u||t[34]!==j?(N=(0,R.jsx)(_,{form:u,children:j}),t[33]=u,t[34]=j,t[35]=N):N=t[35];let z;t[36]!==N||t[37]!==C?(z=(0,R.jsxs)(x,{direction:`column`,align:`stretch`,gap:`md`,children:[C,N]}),t[36]=N,t[37]=C,t[38]=z):z=t[38];let B;return t[39]!==d||t[40]!==h||t[41]!==z||t[42]!==v||t[43]!==y||t[44]!==a?(B=(0,R.jsx)(g,{...a,confirmLoading:d,title:h,okText:v,onOk:y,children:z}),t[39]=d,t[40]=h,t[41]=z,t[42]=v,t[43]=y,t[44]=a,t[45]=B):B=t[45],B}})))()}var V;function H(){return(H=e((()=>{V=(function(){var e=[{kind:`Literal`,name:`first`,value:3},{kind:`Literal`,name:`offset`,value:0}];return{fragment:{argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAIProjectBulkEditModalStoriesQuery`,selections:[{alias:null,args:e,concreteType:`GroupConnection`,kind:`LinkedField`,name:`group_nodes`,plural:!1,selections:[{alias:null,args:null,concreteType:`GroupEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`GroupNode`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{args:null,kind:`FragmentSpread`,name:`BAIProjectBulkEditModalFragment`}],storageKey:null}],storageKey:null}],storageKey:`group_nodes(first:3,offset:0)`}],type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[],kind:`Operation`,name:`BAIProjectBulkEditModalStoriesQuery`,selections:[{alias:null,args:e,concreteType:`GroupConnection`,kind:`LinkedField`,name:`group_nodes`,plural:!1,selections:[{alias:null,args:null,concreteType:`GroupEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`GroupNode`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`name`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`row_id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:`group_nodes(first:3,offset:0)`}]},params:{cacheID:`e95e83787e4e85b2c9d30b1fe5e4d330`,id:null,metadata:{},name:`BAIProjectBulkEditModalStoriesQuery`,operationKind:`query`,text:`query BAIProjectBulkEditModalStoriesQuery {
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
`}}})(),V.hash=`99a682fa622f83ed529364e1a889fbda`})))()}var U,W,G,K,q,J,Y,X,Z,Q;function $(){return($=e((()=>{H(),O(),w(),b(),B(),U=t(),W=S(),G=f(),Y={title:`Fragments/BAIProjectBulkEditModal`,component:z,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`
**BAIProjectBulkEditModal** is a modal for bulk editing multiple project settings with GraphQL mutation integration.

## BAI-Specific Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`selectedProjectFragments\` | \`BAIProjectBulkEditModalFragment$key\` | - | GraphQL fragment reference for selected projects (required) |
| \`onOk\` | \`(e: React.MouseEvent) => void\` | - | Called when every project was updated |
| \`onCancel\` | \`(e: React.MouseEvent) => void\` | - | Called when modal is cancelled |

## Features
- **Project List**: Shows all selected projects in an info alert
- **Resource Policy Selection**: Form field for changing project resource policy
- **Partial Bulk Mutation**: Updates every selected project in one \`partialBulkUpdateProjectsV2\` call
- **Loading State**: Shows loading spinner in select field while data loads (Suspense)
- **Confirm Loading**: Save button shows loading state during mutation execution
- **Auto Cleanup**: Wrap in \`BAIUnmountAfterClose\` to unmount the component when closed

For other props, refer to [BAIModal](/?path=/docs/modal-baimodal--docs).

## Storybook
Mutation is mocked and will execute successfully, closing the modal on completion.
        `}}},argTypes:{selectedProjectFragments:{control:!1,description:`GraphQL fragment reference for selected projects`,table:{type:{summary:`BAIProjectBulkEditModalFragment$key`}}},open:{control:!1,description:`Whether the modal is visible (managed by parent component)`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},onOk:{control:!1,description:`Called when every project was updated`,table:{type:{summary:`(e: React.MouseEvent) => void`}}},onCancel:{control:!1,description:`Called when modal is cancelled`,table:{type:{summary:`(e: React.MouseEvent) => void`}}}},decorators:[e=>(0,G.jsx)(e,{})]},X=()=>{var e;let[t,n]=(0,U.useState)(!1),{group_nodes:r}=(0,W.useLazyLoadQuery)(V,{}),i=r==null||(e=r.edges)==null?void 0:e.map(e=>e.node);return i&&i.length>0&&(0,G.jsxs)(x,{direction:`column`,gap:`md`,children:[(0,G.jsx)(T,{onClick:()=>n(!0),children:`Open Modal`}),(0,G.jsx)(z,{selectedProjectFragments:i,open:t,onOk:()=>n(!1),onCancel:()=>n(!1)})]})},Z={name:`Basic`,parameters:{docs:{description:{story:`Edit multiple projects at once.`}}},render:()=>(0,G.jsx)(k,{mockResolvers:{Query:()=>({project_resource_policies:[{id:`policy-1`,name:`default`},{id:`policy-2`,name:`premium`},{id:`policy-3`,name:`unlimited`}]}),PartialBulkProjectsPayload:()=>({failed:[]})},children:(0,G.jsx)(X,{})})},Z.parameters={...Z.parameters,docs:{...(K=Z.parameters)==null?void 0:K.docs,source:{originalSource:`{
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
    PartialBulkProjectsPayload: () => ({
      failed: []
    })
  }}>
      <QueryResolver />
    </RelayResolver>
}`,...(q=Z.parameters)==null||(q=q.docs)==null?void 0:q.source},description:{story:`Bulk edit multiple projects`,...(J=Z.parameters)==null||(J=J.docs)==null?void 0:J.description}}},Q=[`Default`]})))()}$();export{Z as Default,Q as __namedExportsOrder,Y as default};