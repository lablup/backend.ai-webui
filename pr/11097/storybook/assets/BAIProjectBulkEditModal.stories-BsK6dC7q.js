import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-DlPsW1c0.js";import{n,t as r}from"./compact-C9OPbfhP.js";import{n as i,t as a}from"./keyBy-CtdSHXF8.js";import{i as o,t as s,y as ee}from"./hooks-BF5vZost.js";import{i as c,r as l}from"./isNumber-B1IK5yAq.js";import{n as u,t as d}from"./map-BLzs52H1.js";import{t as f}from"./jsx-runtime-MKhVqBIO.js";import{n as te,t as p}from"./useBAIi18n-HeDRJIs5.js";import{t as m}from"./compiler-runtime-DU4U6aph.js";import{n as h,t as ne}from"./BAIModal-DMlDh7YW.js";import{n as g,t as _}from"./Form-P0oZga1u.js";import{b as v,y as re}from"./iframe-Cn1sHQ4y.js";import{n as y,t as b}from"./BAIFlex-DnaoYTJ1.js";import{t as x}from"./react-relay-sHama7hJ.js";import{n as S,t as C}from"./BAISelect-Dzu1Cphm.js";import{n as w,t as T}from"./BAIButton-BM9wrdQx.js";import{n as E,t as ie}from"./BAIListAlert-BffBY6QK.js";import{n as D,t as O}from"./BAIProjectResourcePolicySelect-CTuQ8ZuQ.js";import{n as k,t as A}from"./RelayResolver-BnFyFQJn.js";var j;function M(){return(M=e((()=>{j=(function(){var e=[{defaultValue:null,kind:`LocalArgument`,name:`input`}],t={alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},n=[{alias:null,args:[{kind:`Variable`,name:`input`,variableName:`input`}],concreteType:`PartialBulkProjectsPayload`,kind:`LinkedField`,name:`partialBulkUpdateProjectsV2`,plural:!1,selections:[{alias:null,args:null,concreteType:`ProjectV2`,kind:`LinkedField`,name:`successes`,plural:!0,selections:[t,{alias:null,args:null,kind:`ScalarField`,name:`entityId`,storageKey:null}],storageKey:null},{alias:null,args:null,concreteType:`PartialBulkFailure`,kind:`LinkedField`,name:`failed`,plural:!0,selections:[t,{alias:null,args:null,kind:`ScalarField`,name:`message`,storageKey:null}],storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:e,kind:`Fragment`,metadata:null,name:`BAIProjectBulkEditModalProjectMutation`,selections:n,type:`Mutation`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:e,kind:`Operation`,name:`BAIProjectBulkEditModalProjectMutation`,selections:n},params:{cacheID:`d1c3dcd8ddd37770e4e74c52c0c7563f`,id:null,metadata:{},name:`BAIProjectBulkEditModalProjectMutation`,operationKind:`mutation`,text:`mutation BAIProjectBulkEditModalProjectMutation(
  $input: PartialBulkUpdateProjectsInput!
) {
  partialBulkUpdateProjectsV2(input: $input) {
    successes {
      id
      entityId
    }
    failed {
      id
      message
    }
  }
}
`}}})(),j.hash=`0d72be36233058ecc9143192d3395b6c`})))()}var N;function P(){return(P=e((()=>{N={argumentDefinitions:[],kind:`Fragment`,metadata:{plural:!0},name:`BAIProjectBulkEditModalFragment`,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`name`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`row_id`,storageKey:null}],type:`GroupNode`,abstractKey:null},N.hash=`10772c6331209f8670097b9a3249fbbd`})))()}function ae(e){return!!e.row_id}function oe(e){return{key:e.row_id,content:e.name}}var F,I,L,R,z;function B(){return(B=e((()=>{M(),P(),F=m(),v(),_(),s(),p(),y(),E(),h(),S(),D(),c(),a(),d(),n(),I=t(),L=x(),R=f(),z=e=>{"use memo";let t=(0,F.c)(48),n,a,s;t[0]===e?(n=t[1],a=t[2],s=t[3]):({selectedProjectFragments:s,onCompleted:a,...n}=e,t[0]=e,t[1]=n,t[2]=a,t[3]=s);let{t:c}=te(),{message:d}=re.useApp(),{getErrorMessage:f}=ee(),[p]=g.useForm(),[m,h]=(0,I.useState)(!1),_=o(j),v=(0,L.useFragment)(N,s),y;t[4]===c?y=t[5]:(y=c(`comp:BAIProjectBulkEditModal.UpdateMultipleProjects`),t[4]=c,t[5]=y);let x;t[6]===c?x=t[7]:(x=c(`general.button.Save`),t[6]=c,t[7]=x);let S;t[8]!==p||t[9]!==f||t[10]!==d||t[11]!==_||t[12]!==a||t[13]!==v?(S=()=>{h(!0),p.validateFields().then(e=>{let t=l(v,ae),n=i(t,`row_id`);return _({input:{items:u(t,t=>({id:t.row_id,input:{resourcePolicy:e.resource_policy}}))}}).then(e=>{let{partialBulkUpdateProjectsV2:t}=e;a==null||a({succeededIds:r(u(t.successes,e=>{var t;return(t=n[e.entityId])==null?void 0:t.id})),failures:u(t.failed,e=>{var t,r;return{id:((t=n[e.id])==null?void 0:t.id)??e.id,name:((r=n[e.id])==null?void 0:r.name)??e.id,message:e.message}})})},e=>{let n=f(e);a==null||a({succeededIds:[],failures:u(t,e=>({id:e.id,name:e.name??e.id,message:n}))})})}).catch(e=>{e!=null&&e.errorFields||d.error(f(e))}).finally(()=>h(!1))},t[8]=p,t[9]=f,t[10]=d,t[11]=_,t[12]=a,t[13]=v,t[14]=S):S=t[14];let w;t[15]===c?w=t[16]:(w=c(`comp:BAIProjectBulkEditModal.FollowingProjectsWillBeUpdated`),t[15]=c,t[16]=w);let T;t[17]===v?T=t[18]:(T=u(v,oe),t[17]=v,t[18]=T);let E;t[19]!==w||t[20]!==T?(E=(0,R.jsx)(ie,{type:`info`,showIcon:!0,ghostInfoBg:!1,title:w,items:T}),t[19]=w,t[20]=T,t[21]=E):E=t[21];let D;t[22]===c?D=t[23]:(D=c(`comp:BAIProjectBulkEditModal.ProjectResourcePolicy`),t[22]=c,t[23]=D);let k;t[24]===Symbol.for(`react.memo_cache_sentinel`)?(k=(0,R.jsx)(C,{loading:!0,disabled:!0}),t[24]=k):k=t[24];let A;t[25]===D?A=t[26]:(A=(0,R.jsx)(g.Item,{label:D,children:k}),t[25]=D,t[26]=A);let M;t[27]===c?M=t[28]:(M=c(`comp:BAIProjectBulkEditModal.ProjectResourcePolicy`),t[27]=c,t[28]=M);let P;t[29]===Symbol.for(`react.memo_cache_sentinel`)?(P=(0,R.jsx)(O,{}),t[29]=P):P=t[29];let z;t[30]===M?z=t[31]:(z=(0,R.jsx)(g.Item,{label:M,name:`resource_policy`,children:P}),t[30]=M,t[31]=z);let B;t[32]!==z||t[33]!==A?(B=(0,R.jsx)(I.Suspense,{fallback:A,children:z}),t[32]=z,t[33]=A,t[34]=B):B=t[34];let V;t[35]!==p||t[36]!==B?(V=(0,R.jsx)(g,{form:p,children:B}),t[35]=p,t[36]=B,t[37]=V):V=t[37];let H;t[38]!==V||t[39]!==E?(H=(0,R.jsxs)(b,{direction:`column`,align:`stretch`,gap:`md`,children:[E,V]}),t[38]=V,t[39]=E,t[40]=H):H=t[40];let U;return t[41]!==m||t[42]!==n||t[43]!==y||t[44]!==H||t[45]!==x||t[46]!==S?(U=(0,R.jsx)(ne,{...n,confirmLoading:m,title:y,okText:x,onOk:S,children:H}),t[41]=m,t[42]=n,t[43]=y,t[44]=H,t[45]=x,t[46]=S,t[47]=U):U=t[47],U}})))()}var V;function H(){return(H=e((()=>{V=(function(){var e=[{kind:`Literal`,name:`first`,value:3},{kind:`Literal`,name:`offset`,value:0}];return{fragment:{argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAIProjectBulkEditModalStoriesQuery`,selections:[{alias:null,args:e,concreteType:`GroupConnection`,kind:`LinkedField`,name:`group_nodes`,plural:!1,selections:[{alias:null,args:null,concreteType:`GroupEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`GroupNode`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{args:null,kind:`FragmentSpread`,name:`BAIProjectBulkEditModalFragment`}],storageKey:null}],storageKey:null}],storageKey:`group_nodes(first:3,offset:0)`}],type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[],kind:`Operation`,name:`BAIProjectBulkEditModalStoriesQuery`,selections:[{alias:null,args:e,concreteType:`GroupConnection`,kind:`LinkedField`,name:`group_nodes`,plural:!1,selections:[{alias:null,args:null,concreteType:`GroupEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`GroupNode`,kind:`LinkedField`,name:`node`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`name`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`row_id`,storageKey:null}],storageKey:null}],storageKey:null}],storageKey:`group_nodes(first:3,offset:0)`}]},params:{cacheID:`681bcc2fc043801367139278748459f5`,id:null,metadata:{},name:`BAIProjectBulkEditModalStoriesQuery`,operationKind:`query`,text:`query BAIProjectBulkEditModalStoriesQuery {
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
  id
  name
  row_id
}
`}}})(),V.hash=`99a682fa622f83ed529364e1a889fbda`})))()}var U,W,G,K,q,J,Y,X,Z,Q;function $(){return($=e((()=>{H(),k(),w(),y(),B(),U=t(),W=x(),G=f(),Y={title:`Fragments/BAIProjectBulkEditModal`,component:z,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`
**BAIProjectBulkEditModal** is a modal for bulk editing multiple project settings with GraphQL mutation integration.

## BAI-Specific Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`selectedProjectFragments\` | \`BAIProjectBulkEditModalFragment$key\` | - | GraphQL fragment reference for selected projects (required) |
| \`onCompleted\` | \`(result: BAIProjectBulkEditResult) => void\` | - | Called when the mutation settles, with the updated ids and the failed projects |
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
        `}}},argTypes:{selectedProjectFragments:{control:!1,description:`GraphQL fragment reference for selected projects`,table:{type:{summary:`BAIProjectBulkEditModalFragment$key`}}},open:{control:!1,description:`Whether the modal is visible (managed by parent component)`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},onCompleted:{control:!1,description:"Called when the mutation settles, with `succeededIds` and `failures` (id, name, message)",table:{type:{summary:`(result: BAIProjectBulkEditResult) => void`}}},onCancel:{control:!1,description:`Called when modal is cancelled`,table:{type:{summary:`(e: React.MouseEvent) => void`}}}},decorators:[e=>(0,G.jsx)(e,{})]},X=()=>{var e;let[t,n]=(0,U.useState)(!1),{group_nodes:r}=(0,W.useLazyLoadQuery)(V,{}),i=r==null||(e=r.edges)==null?void 0:e.map(e=>e.node);return i&&i.length>0&&(0,G.jsxs)(b,{direction:`column`,gap:`md`,children:[(0,G.jsx)(T,{onClick:()=>n(!0),children:`Open Modal`}),(0,G.jsx)(z,{selectedProjectFragments:i,open:t,onCompleted:()=>n(!1),onCancel:()=>n(!1)})]})},Z={name:`Basic`,parameters:{docs:{description:{story:`Edit multiple projects at once.`}}},render:()=>(0,G.jsx)(A,{mockResolvers:{Query:()=>({project_resource_policies:[{id:`policy-1`,name:`default`},{id:`policy-2`,name:`premium`},{id:`policy-3`,name:`unlimited`}]}),PartialBulkProjectsPayload:()=>({failed:[]})},children:(0,G.jsx)(X,{})})},Z.parameters={...Z.parameters,docs:{...(K=Z.parameters)==null?void 0:K.docs,source:{originalSource:`{
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