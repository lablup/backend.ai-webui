import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-DlPsW1c0.js";import{n,t as r}from"./compact-C9OPbfhP.js";import{i,t as a,y as ee}from"./hooks-BF5vZost.js";import{n as o,t as te}from"./forEach-Cs0R4zzP.js";import{n as s,t as ne}from"./find-DWiBvCZH.js";import{n as c,t as l}from"./map-BLzs52H1.js";import{n as re,t as u}from"./isEmpty-CptDxjc2.js";import{t as d}from"./jsx-runtime-MKhVqBIO.js";import{n as ie,t as f}from"./useBAIi18n-HeDRJIs5.js";import{t as p}from"./compiler-runtime-DU4U6aph.js";import{n as m,t as ae}from"./BAIModal-CwMuFUbu.js";import{n as h,t as g}from"./Form-B52hVM62.js";import{b as _,y as oe}from"./iframe-CH0qtSBN.js";import{n as v,t as y}from"./BAIFlex-DnaoYTJ1.js";import{t as b}from"./react-relay-sHama7hJ.js";import{n as x,t as S}from"./BAISelect-DPd5l2bg.js";import{n as C,t as w}from"./BAIButton-CeG0Kegq.js";import{n as T,t as se}from"./BAIListAlert-CXn91WSI.js";import{n as E,t as ce}from"./BAIProjectResourcePolicySelect-CDWT102n.js";import{n as D,t as O}from"./RelayResolver-BnFyFQJn.js";var k;function A(){return(A=e((()=>{k=(function(){var e=[{defaultValue:null,kind:`LocalArgument`,name:`input`}],t={alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},n=[{alias:null,args:[{kind:`Variable`,name:`input`,variableName:`input`}],concreteType:`PartialBulkProjectsPayload`,kind:`LinkedField`,name:`partialBulkUpdateProjectsV2`,plural:!1,selections:[{alias:null,args:null,concreteType:`ProjectV2`,kind:`LinkedField`,name:`successes`,plural:!0,selections:[t],storageKey:null},{alias:null,args:null,concreteType:`PartialBulkFailure`,kind:`LinkedField`,name:`failed`,plural:!0,selections:[t,{alias:null,args:null,kind:`ScalarField`,name:`message`,storageKey:null}],storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:e,kind:`Fragment`,metadata:null,name:`BAIProjectBulkEditModalProjectMutation`,selections:n,type:`Mutation`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:e,kind:`Operation`,name:`BAIProjectBulkEditModalProjectMutation`,selections:n},params:{cacheID:`7e9c908b74d4c483d68699d851195eef`,id:null,metadata:{},name:`BAIProjectBulkEditModalProjectMutation`,operationKind:`mutation`,text:`mutation BAIProjectBulkEditModalProjectMutation(
  $input: PartialBulkUpdateProjectsInput!
) {
  partialBulkUpdateProjectsV2(input: $input) {
    successes {
      id
    }
    failed {
      id
      message
    }
  }
}
`}}})(),k.hash=`cc4fd05715293523cb12284592d64f6e`})))()}var j;function M(){return(M=e((()=>{j={argumentDefinitions:[],kind:`Fragment`,metadata:{plural:!0},name:`BAIProjectBulkEditModalFragment`,selections:[{alias:null,args:null,kind:`ScalarField`,name:`name`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`row_id`,storageKey:null}],type:`GroupNode`,abstractKey:null},j.hash=`317d7350cbe767a8531fc765f9efe84b`})))()}function N(e){return e.row_id}function P(e){return{key:e.row_id,content:e.name}}var F,I,L,R,z;function B(){return(B=e((()=>{A(),M(),F=p(),_(),g(),a(),f(),v(),T(),m(),x(),E(),n(),l(),u(),o(),s(),I=t(),L=b(),R=d(),z=e=>{"use memo";let t=(0,F.c)(47),n,a;t[0]===e?(n=t[1],a=t[2]):({selectedProjectFragments:n,...a}=e,t[0]=e,t[1]=n,t[2]=a);let{t:o}=ie(),{message:s}=oe.useApp(),{getErrorMessage:l}=ee(),[u]=h.useForm(),[d,f]=(0,I.useState)(!1),p=i(k),m=(0,L.useFragment)(j,n),g;t[3]===o?g=t[4]:(g=o(`comp:BAIProjectBulkEditModal.UpdateMultipleProjects`),t[3]=o,t[4]=g);let _;t[5]===o?_=t[6]:(_=o(`general.button.Save`),t[5]=o,t[6]=_);let v;t[7]!==u||t[8]!==l||t[9]!==s||t[10]!==p||t[11]!==m||t[12]!==a?(v=e=>{f(!0),u.validateFields().then(t=>{let n=r(c(m,N));return p({input:{items:c(n,e=>({id:e,input:{resourcePolicy:t.resource_policy}}))}}).then(t=>{let{partialBulkUpdateProjectsV2:n}=t;if(re(n.failed)){var r;(r=a.onOk)==null||r.call(a,e)}else te(n.failed,e=>{var t;let n=(t=ne(m,{row_id:e.id}))==null?void 0:t.name;s.error(n?`${n}: ${e.message}`:e.message)})})}).catch(e=>{e!=null&&e.errorFields||s.error(l(e))}).finally(()=>f(!1))},t[7]=u,t[8]=l,t[9]=s,t[10]=p,t[11]=m,t[12]=a,t[13]=v):v=t[13];let b;t[14]===o?b=t[15]:(b=o(`comp:BAIProjectBulkEditModal.FollowingProjectsWillBeUpdated`),t[14]=o,t[15]=b);let x;t[16]===m?x=t[17]:(x=c(m,P),t[16]=m,t[17]=x);let C;t[18]!==b||t[19]!==x?(C=(0,R.jsx)(se,{type:`info`,showIcon:!0,ghostInfoBg:!1,title:b,items:x}),t[18]=b,t[19]=x,t[20]=C):C=t[20];let w;t[21]===o?w=t[22]:(w=o(`comp:BAIProjectBulkEditModal.ProjectResourcePolicy`),t[21]=o,t[22]=w);let T;t[23]===Symbol.for(`react.memo_cache_sentinel`)?(T=(0,R.jsx)(S,{loading:!0,disabled:!0}),t[23]=T):T=t[23];let E;t[24]===w?E=t[25]:(E=(0,R.jsx)(h.Item,{label:w,children:T}),t[24]=w,t[25]=E);let D;t[26]===o?D=t[27]:(D=o(`comp:BAIProjectBulkEditModal.ProjectResourcePolicy`),t[26]=o,t[27]=D);let O;t[28]===Symbol.for(`react.memo_cache_sentinel`)?(O=(0,R.jsx)(ce,{}),t[28]=O):O=t[28];let A;t[29]===D?A=t[30]:(A=(0,R.jsx)(h.Item,{label:D,name:`resource_policy`,children:O}),t[29]=D,t[30]=A);let M;t[31]!==A||t[32]!==E?(M=(0,R.jsx)(I.Suspense,{fallback:E,children:A}),t[31]=A,t[32]=E,t[33]=M):M=t[33];let z;t[34]!==u||t[35]!==M?(z=(0,R.jsx)(h,{form:u,children:M}),t[34]=u,t[35]=M,t[36]=z):z=t[36];let B;t[37]!==z||t[38]!==C?(B=(0,R.jsxs)(y,{direction:`column`,align:`stretch`,gap:`md`,children:[C,z]}),t[37]=z,t[38]=C,t[39]=B):B=t[39];let V;return t[40]!==d||t[41]!==g||t[42]!==B||t[43]!==_||t[44]!==v||t[45]!==a?(V=(0,R.jsx)(ae,{...a,confirmLoading:d,title:g,okText:_,onOk:v,children:B}),t[40]=d,t[41]=g,t[42]=B,t[43]=_,t[44]=v,t[45]=a,t[46]=V):V=t[46],V}})))()}var V;function H(){return(H=e((()=>{V=(function(){var e=[{kind:`Literal`,name:`first`,value:3},{kind:`Literal`,name:`offset`,value:0}];return{fragment:{argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAIProjectBulkEditModalStoriesQuery`,selections:[{alias:null,args:e,concreteType:`GroupConnection`,kind:`LinkedField`,name:`group_nodes`,plural:!1,selections:[{alias:null,args:null,concreteType:`GroupEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`GroupNode`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{args:null,kind:`FragmentSpread`,name:`BAIProjectBulkEditModalFragment`}],storageKey:null}],storageKey:null}],storageKey:`group_nodes(first:3,offset:0)`}],type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[],kind:`Operation`,name:`BAIProjectBulkEditModalStoriesQuery`,selections:[{alias:null,args:e,concreteType:`GroupConnection`,kind:`LinkedField`,name:`group_nodes`,plural:!1,selections:[{alias:null,args:null,concreteType:`GroupEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`GroupNode`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`name`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`row_id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:`group_nodes(first:3,offset:0)`}]},params:{cacheID:`e95e83787e4e85b2c9d30b1fe5e4d330`,id:null,metadata:{},name:`BAIProjectBulkEditModalStoriesQuery`,operationKind:`query`,text:`query BAIProjectBulkEditModalStoriesQuery {
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
`}}})(),V.hash=`99a682fa622f83ed529364e1a889fbda`})))()}var U,W,G,K,q,J,Y,X,Z,Q;function $(){return($=e((()=>{H(),D(),C(),v(),B(),U=t(),W=b(),G=d(),Y={title:`Fragments/BAIProjectBulkEditModal`,component:z,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`
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
        `}}},argTypes:{selectedProjectFragments:{control:!1,description:`GraphQL fragment reference for selected projects`,table:{type:{summary:`BAIProjectBulkEditModalFragment$key`}}},open:{control:!1,description:`Whether the modal is visible (managed by parent component)`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},onOk:{control:!1,description:`Called when every project was updated`,table:{type:{summary:`(e: React.MouseEvent) => void`}}},onCancel:{control:!1,description:`Called when modal is cancelled`,table:{type:{summary:`(e: React.MouseEvent) => void`}}}},decorators:[e=>(0,G.jsx)(e,{})]},X=()=>{var e;let[t,n]=(0,U.useState)(!1),{group_nodes:r}=(0,W.useLazyLoadQuery)(V,{}),i=r==null||(e=r.edges)==null?void 0:e.map(e=>e.node);return i&&i.length>0&&(0,G.jsxs)(y,{direction:`column`,gap:`md`,children:[(0,G.jsx)(w,{onClick:()=>n(!0),children:`Open Modal`}),(0,G.jsx)(z,{selectedProjectFragments:i,open:t,onOk:()=>n(!1),onCancel:()=>n(!1)})]})},Z={name:`Basic`,parameters:{docs:{description:{story:`Edit multiple projects at once.`}}},render:()=>(0,G.jsx)(O,{mockResolvers:{Query:()=>({project_resource_policies:[{id:`policy-1`,name:`default`},{id:`policy-2`,name:`premium`},{id:`policy-3`,name:`unlimited`}]}),PartialBulkProjectsPayload:()=>({failed:[]})},children:(0,G.jsx)(X,{})})},Z.parameters={...Z.parameters,docs:{...(K=Z.parameters)==null?void 0:K.docs,source:{originalSource:`{
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