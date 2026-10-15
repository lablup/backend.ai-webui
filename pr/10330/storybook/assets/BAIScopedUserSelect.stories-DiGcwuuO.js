import{d as Ia,c as Va,b as Ua,r as h,j as o}from"./iframe-Cnh6__zv.js";import{R as xa}from"./RelayResolver-7xGkXhtg.js";import{t as Te}from"./index-Dt0icEER.js";import{u as Ca,a as Na}from"./usePaginatedQuery-oeOEZK7i.js";import{a as Aa}from"./index-Dwjh4thj.js";import{B as La}from"./BAIComplexSelect-zLYZR2Go.js";import{r as Ba}from"./index-gJP0KBCm.js";import{u as Oe}from"./useControllableValue-d9KLrmqd.js";import{c as Ie}from"./combineFilters-CraaN1TU.js";import{c as L}from"./compact-CU4PNV0P.js";import{m as k}from"./map-Bq0x4aBJ.js";import{s as Fa}from"./some-CdLH7goA.js";import{c as Ue}from"./castArray-5AcoEgEY.js";import{f as ja}from"./find-KXgi38eJ.js";import"./preload-helper-Dp1pzeXC.js";import"./index-CPSfwZyT.js";import"./isNumber-DjPqpByP.js";import"./toString-Dhk_Qnu5.js";import"./isSymbol-C5k1y_Yq.js";import"./filter-D-0eNRXy.js";import"./_baseEach-DusBxcGj.js";import"./get-CVBnrn9r.js";import"./_baseGet-DUnsI1t8.js";import"./identity-DKeuBCMA.js";import"./isEmpty-zN1yZYjv.js";import"./toNumber-CViDdbsJ.js";import"./_trimmedEndIndex-DuQxD0U0.js";import"./useEventNotStable-CS8SbLnQ.js";import"./uniqBy-DngbewnF.js";import"./_baseUniq-B7jIxW-z.js";import"./_arrayIncludes-B0rj_Tme.js";import"./_baseIndexOf-Be9UPhX8.js";import"./_baseFindIndex-Cj99RmFE.js";import"./useConnectedBAIClient-CKIVu-Iz.js";import"./reactQueryAlias-CvBr5tmd.js";import"./useUpdatableState-D4JdiSIV.js";import"./compiled-D_YGP6zo.js";import"./useDevWarning-IJRqsHLQ.js";import"./usePopover-CIMv-dj2.js";import"./rtlStyles-T4i24HtE.js";import"./composeEventHandlers-BolWE7qY.js";import"./isRenderable-BUV0eL6r.js";import"./InputGroupContext-BoSs1oNv.js";import"./Field-DKkoV1qM.js";import"./FieldStatus-BXwAywT6.js";import"./useIndicator-oiNMY1t-.js";import"./Token-zmd4QIwT.js";import"./useInteractiveRole-Czloh0Si.js";import"./Divider-3WPvhZvX.js";import"./SelectorOption-B9FQiGzA.js";import"./Item-DNaHi-8F.js";import"./computeTargetAndRel-BGwjeA1c.js";import"./toInteger-3vcVox_O.js";import"./toFinite-COPrM99X.js";/**
 * @license lucide-react v1.37.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Pa=[["path",{d:"M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8",key:"12jkf8"}],["path",{d:"m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7",key:"1ocrg3"}],["path",{d:"M19 16v6",key:"tddt3s"}],["path",{d:"M16 19h6",key:"xwg31i"}]],wa=Ia("mail-plus",Pa),ua=(function(){var a={defaultValue:null,kind:"LocalArgument",name:"limit"},e={defaultValue:null,kind:"LocalArgument",name:"scope"},s={defaultValue:null,kind:"LocalArgument",name:"selectedFilter"},l={defaultValue:null,kind:"LocalArgument",name:"skipSelected"},n=[{condition:"skipSelected",kind:"Condition",passingValue:!1,selections:[{alias:null,args:[{kind:"Variable",name:"filter",variableName:"selectedFilter"},{kind:"Variable",name:"limit",variableName:"limit"},{kind:"Variable",name:"scope",variableName:"scope"}],concreteType:"UserV2Connection",kind:"LinkedField",name:"scopedUsersV2",plural:!1,selections:[{alias:null,args:null,concreteType:"UserV2Edge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"UserV2",kind:"LinkedField",name:"node",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null},{alias:null,args:null,concreteType:"UserV2BasicInfo",kind:"LinkedField",name:"basicInfo",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"email",storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}]}];return{fragment:{argumentDefinitions:[a,e,s,l],kind:"Fragment",metadata:null,name:"BAIScopedUserSelectValueQuery",selections:n,type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[e,s,a,l],kind:"Operation",name:"BAIScopedUserSelectValueQuery",selections:n},params:{cacheID:"f16973f68332dd00d48ab2336de6c06e",id:null,metadata:{},name:"BAIScopedUserSelectValueQuery",operationKind:"query",text:`query BAIScopedUserSelectValueQuery(
  $scope: UserScope!
  $selectedFilter: UserV2Filter
  $limit: Int!
  $skipSelected: Boolean!
) {
  scopedUsersV2(scope: $scope, filter: $selectedFilter, limit: $limit) @skip(if: $skipSelected) {
    edges {
      node {
        id
        basicInfo {
          email
        }
      }
    }
  }
}
`}}})();ua.hash="b40981905f124c7267cb9a0cf0e7455e";const pa=(function(){var a={defaultValue:null,kind:"LocalArgument",name:"filter"},e={defaultValue:null,kind:"LocalArgument",name:"limit"},s={defaultValue:null,kind:"LocalArgument",name:"offset"},l={defaultValue:null,kind:"LocalArgument",name:"orderBy"},n={defaultValue:null,kind:"LocalArgument",name:"scope"},c=[{alias:null,args:[{kind:"Variable",name:"filter",variableName:"filter"},{kind:"Variable",name:"limit",variableName:"limit"},{kind:"Variable",name:"offset",variableName:"offset"},{kind:"Variable",name:"orderBy",variableName:"orderBy"},{kind:"Variable",name:"scope",variableName:"scope"}],concreteType:"UserV2Connection",kind:"LinkedField",name:"scopedUsersV2",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"count",storageKey:null},{alias:null,args:null,concreteType:"UserV2Edge",kind:"LinkedField",name:"edges",plural:!0,selections:[{alias:null,args:null,concreteType:"UserV2",kind:"LinkedField",name:"node",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null},{alias:null,args:null,concreteType:"UserV2BasicInfo",kind:"LinkedField",name:"basicInfo",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"username",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"email",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"fullName",storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}];return{fragment:{argumentDefinitions:[a,e,s,l,n],kind:"Fragment",metadata:null,name:"BAIScopedUserSelectPaginatedQuery",selections:c,type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[n,s,e,a,l],kind:"Operation",name:"BAIScopedUserSelectPaginatedQuery",selections:c},params:{cacheID:"36e2c0b9510147cf82ee84cf23b112df",id:null,metadata:{},name:"BAIScopedUserSelectPaginatedQuery",operationKind:"query",text:`query BAIScopedUserSelectPaginatedQuery(
  $scope: UserScope!
  $offset: Int!
  $limit: Int!
  $filter: UserV2Filter
  $orderBy: [UserV2OrderBy!]
) {
  scopedUsersV2(scope: $scope, offset: $offset, limit: $limit, filter: $filter, orderBy: $orderBy) {
    count
    edges {
      node {
        id
        basicInfo {
          username
          email
          fullName
        }
      }
    }
  }
}
`}}})();pa.hash="5b6e47ac7cc1fbcced51d7cc0e737eb9";const Ka=/^[^\s@]+@[^\s@]+\.[^\s@]+$/,Ve=a=>k(L(Ue(a??[])),e=>({value:e})),fa=a=>{"use memo";var Ke;const e=Va.c(55);let s,l,n,c,B,F,u,I,V,U,x;e[0]!==a?({domainId:s,projectId:c,roleId:F,allowCustomSelect:I,filter:l,excludeInactive:V,valuePropName:U,multiple:x,isLoading:n,ref:B,...u}=a,e[0]=a,e[1]=s,e[2]=l,e[3]=n,e[4]=c,e[5]=B,e[6]=F,e[7]=u,e[8]=I,e[9]=V,e[10]=U,e[11]=x):(s=e[1],l=e[2],n=e[3],c=e[4],B=e[5],F=e[6],u=e[7],I=e[8],V=e[9],U=e[10],x=e[11]);const ha=I===void 0?!1:I,ga=V===void 0?!1:V,C=U===void 0?"email":U,p=x===void 0?!1:x,{t:j}=Ua();let P;e[12]===Symbol.for("react.memo_cache_sentinel")?(P={valuePropName:"value",trigger:"onChange"},e[12]=P):P=e[12];const[xe,ne]=Oe(u,P);let w;e[13]===Symbol.for("react.memo_cache_sentinel")?(w={valuePropName:"open",trigger:"onOpenChange",defaultValuePropName:"defaultOpen"},e[13]=w):w=e[13];const[Ce,ie]=Oe(u,w),Ne=h.useDeferredValue(Ce),[N,ba]=h.useState(""),K=Ca(N),[Sa,Ae]=h.useTransition(),[va,T]=Aa(),g=h.useDeferredValue(va),Le=Ve(s),Be=Ve(c),Fe=Ve(F),je={...Le.length?{domain:Le}:{},...Be.length?{project:Be}:{},...Fe.length?{role:Fe}:{}},Pe=Ie([ga?{status:{equals:"ACTIVE"}}:null,l]),we=h.useDeferredValue(xe),O=L(Ue(we??[])),ce=C==="id"&&O.length>0;let E;e[14]===Symbol.for("react.memo_cache_sentinel")?(E=ua,e[14]=E):E=e[14];const de=ce?"store-or-network":"store-only";let D;e[15]!==g||e[16]!==de?(D={fetchPolicy:de,fetchKey:g},e[15]=g,e[16]=de,e[17]=D):D=e[17];const{scopedUsersV2:me}=Ba.useLazyLoadQuery(E,{scope:je,selectedFilter:ce?Ie([{uuid:{in:O}},Pe]):null,limit:Math.max(O.length,1),skipSelected:!ce},D);let R,$;e[18]===Symbol.for("react.memo_cache_sentinel")?(R=pa,$={limit:10},e[18]=R,e[19]=$):(R=e[18],$=e[19]);const ue=Ne?"network-only":"store-only";let M;e[20]!==g||e[21]!==ue?(M={fetchPolicy:ue,fetchKey:g},e[20]=g,e[21]=ue,e[22]=M):M=e[22];let Q;e[23]===Symbol.for("react.memo_cache_sentinel")?(Q={getTotal:Ta,getItem:Ea,getId:Da},e[23]=Q):Q=e[23];const{paginationData:q,result:ka,loadNext:pe,isLoadingNext:fe}=Na(R,$,{scope:je,filter:Ie([Pe,K?{email:{iContains:K}}:null]),orderBy:[{field:"EMAIL",direction:"ASC"}]},M,Q);let z,X;e[24]!==T?(z=()=>({refetch:()=>{Ae(()=>{T()})}}),X=[T,Ae],e[24]=T,e[25]=z,e[26]=X):(z=e[25],X=e[26]),h.useImperativeHandle(B,z,X);let Y;e[27]!==C?(Y=t=>{var i;if(t)return C==="id"?Te(t.id):((i=t.basicInfo)==null?void 0:i.email)??void 0},e[27]=C,e[28]=Y):Y=e[28];const d=Y;let H;e[29]!==d?(H=t=>{var f,r;const i=d(t);return i?{value:i,label:((f=t==null?void 0:t.basicInfo)==null?void 0:f.email)??i,description:((r=t==null?void 0:t.basicInfo)==null?void 0:r.fullName)??void 0}:null},e[29]=d,e[30]=H):H=e[30];const ye=L(k(q,H)),J=K.trim(),b=ha&&C==="email"&&Ka.test(J)&&!Fa(ye,t=>t.value.toLowerCase()===J.toLowerCase())?{value:J,label:J,description:j("comp:BAIScopedUserSelect.InviteByEmail"),icon:o.jsx(wa,{size:"1em"})}:null;let he;e:{let t;e[31]!==d?(t=r=>{var A,W;const y=d(r==null?void 0:r.node);return y?[y,(W=(A=r==null?void 0:r.node)==null?void 0:A.basicInfo)==null?void 0:W.email]:null},e[31]=d,e[32]=t):t=e[32];const i=new Map(L(k(me==null?void 0:me.edges,t))),f=k(O,r=>({label:i.get(r)??r,value:r}));if(p){he=f;break e}he=f[0]??null}const ge=he,be=La;let S;e[33]!==j?(S=j("comp:BAIUserSelect.SelectUser"),e[33]=j,e[34]=S):S=e[34];const Se=n||xe!==we||Ce!==Ne||N!==K||Sa,ve=((Ke=ka.scopedUsersV2)==null?void 0:Ke.count)??void 0,ke=b?[...ye,b]:ye;let v;e[35]!==b||e[36]!==d||e[37]!==p||e[38]!==q||e[39]!==ne?(v=t=>{const i=L(Ue(t??[])),f=k(i,Ra),r=k(i,y=>{const A=ja(q,W=>d(W)===y.value);return A?{...y,userId:Te(A.id)}:b&&y.value===b.value?{...y,isCustom:!0}:y});ne(p?f:f[0],p?r:r[0])},e[35]=b,e[36]=d,e[37]=p,e[38]=q,e[39]=ne,e[40]=v):v=e[40];let G;return e[41]!==be||e[42]!==fe||e[43]!==ge||e[44]!==pe||e[45]!==p||e[46]!==N||e[47]!==u||e[48]!==ie||e[49]!==S||e[50]!==Se||e[51]!==ve||e[52]!==ke||e[53]!==v?(G=o.jsx(be,{placeholder:S,...u,multiple:p,isLoading:Se,isLoadingNext:fe,total:ve,options:ke,value:ge,onChange:v,searchValue:N,onSearch:ba,onOpenChange:ie,endReached:pe}),e[41]=be,e[42]=fe,e[43]=ge,e[44]=pe,e[45]=p,e[46]=N,e[47]=u,e[48]=ie,e[49]=S,e[50]=Se,e[51]=ve,e[52]=ke,e[53]=v,e[54]=G):G=e[54],G};function Ta(a){var e;return((e=a.scopedUsersV2)==null?void 0:e.count)??void 0}function Oa(a){return a==null?void 0:a.node}function Ea(a){var e,s;return(s=(e=a.scopedUsersV2)==null?void 0:e.edges)==null?void 0:s.map(Oa)}function Da(a){return a==null?void 0:a.id}function Ra(a){return a.value}const Qt={title:"Fragments/BAIScopedUserSelect",component:fa,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:"\n**BAIScopedUserSelect** — user picker over `scopedUsersV2` (managers >= 26.9.0). Built on `BAIComplexSelect`.\n\n- `domainId` / `projectId` / `roleId`: one id or several each; only the keys a caller names go into the `UserScope` input, and the server OR-combines them after authorizing each one.\n- `valuePropName`: `'email'` (default) or `'id'` — which field is the plain-key value. Only `'id'` runs the `uuid in` label-resolution query; with emails the key already is the label.\n- `filter` / `excludeInactive`: composed into a `UserV2Filter` through the schema's `AND` combinator, together with the debounced `email: { iContains }` search.\n- Pagination is offset mode (`limit`/`offset`) — the V2 connections reject a mix with `first`/`after` at runtime.\n\nSee `BAIAdminUserV2Select.stories.tsx` for the superadmin-wide sibling and `BAIComplexSelect.stories.tsx` for the popup body with static options.\n        "}}},argTypes:{value:{control:!1},onChange:{control:!1},filter:{control:!1},domainId:{control:!1},projectId:{control:!1},roleId:{control:!1},multiple:{control:{type:"boolean"}},excludeInactive:{control:{type:"boolean"}},valuePropName:{control:{type:"select"},options:["email","id"]}}},ya="11111111-2222-4333-8444-555555555555",Ee=[{id:"VXNlclYyOjE=",basicInfo:{username:"admin",email:"admin@example.com",fullName:"System Administrator"}},{id:"VXNlclYyOjI=",basicInfo:{username:"alice",email:"alice@example.com",fullName:"Alice Kim"}},{id:"VXNlclYyOjM=",basicInfo:{username:"bob",email:"bob@example.com",fullName:"Bob Lee"}},{id:"VXNlclYyOjQ=",basicInfo:{username:"carol",email:"carol@example.com",fullName:"Carol Park"}}],$a={Query:()=>({scopedUsersV2:{count:Ee.length,edges:Ee.map(a=>({node:a}))}})},Ma={Query:()=>({scopedUsersV2:{count:0,edges:[]}})},m=({initialValue:a=null,resolvers:e=$a,...s})=>{const[l,n]=h.useState(a);return o.jsx(xa,{mockResolvers:e,children:o.jsx(fa,{projectId:ya,...s,value:l,onChange:c=>n(c??null)})})},Z={name:"Single Select",parameters:{docs:{description:{story:'Single user select scoped to one project, `valuePropName="email"` (default).'}}},render:a=>o.jsx(m,{...a,label:"User"})},_={name:"Multiple Select",parameters:{docs:{description:{story:"Multi-selection: the value is an array of keys and the trigger lists the selected emails."}}},render:a=>o.jsx(m,{...a,label:"Users",multiple:!0,initialValue:["admin@example.com"]})},ee={parameters:{docs:{description:{story:"Two projects and one role named at once: every key present in the props goes into `UserScope`, and the server OR-combines them."}}},render:a=>o.jsx(m,{...a,label:"User",projectId:[ya,"66666666-7777-4888-8999-aaaaaaaaaaaa"],roleId:"bbbbbbbb-cccc-4ddd-8eee-ffffffffffff"})},ae={name:"Custom e-mail entry",parameters:{docs:{description:{story:"`allowCustomSelect` — an e-mail address typed in the search box that no listed user matches is offered as one more option; picking it makes the value that address and `onChange` marks it `isCustom`."}}},render:a=>o.jsx(m,{...a,label:"User",allowCustomSelect:!0,defaultOpen:!0})},te={name:"Exclude Inactive Users",parameters:{docs:{description:{story:"`excludeInactive` composes `status: { equals: ACTIVE }` into the `UserV2Filter`."}}},render:a=>o.jsx(m,{...a,label:"User",excludeInactive:!0})},re={name:"ID-valued",parameters:{docs:{description:{story:'`valuePropName="id"` — the plain-key value is the local user UUID, which is what `setVFolderMountPolicy` and friends take. This is the only mode that runs the `uuid in` label-resolution query.'}}},render:a=>o.jsx(m,{...a,label:"User",valuePropName:"id"})},se={parameters:{docs:{description:{story:"Caller-side `isLoading`, which spins the trigger the same way the internal debounce and refetch pending states do."}}},render:a=>o.jsx(m,{...a,label:"User",isLoading:!0,isDisabled:!0})},oe={parameters:{docs:{description:{story:"No users in the scope — the popup shows the shared empty-state text."}}},render:a=>o.jsx(m,{...a,label:"User",resolvers:Ma,defaultOpen:!0})},le={parameters:{docs:{description:{story:"The error status a form item sets when its `required` rule fails."}}},render:a=>o.jsx(m,{...a,label:"User",status:{type:"error",message:"Please select a user."}})};var De,Re,$e;Z.parameters={...Z.parameters,docs:{...(De=Z.parameters)==null?void 0:De.docs,source:{originalSource:`{
  name: 'Single Select',
  parameters: {
    docs: {
      description: {
        story: 'Single user select scoped to one project, \`valuePropName="email"\` (default).'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" />
}`,...($e=(Re=Z.parameters)==null?void 0:Re.docs)==null?void 0:$e.source}}};var Me,Qe,qe;_.parameters={..._.parameters,docs:{...(Me=_.parameters)==null?void 0:Me.docs,source:{originalSource:`{
  name: 'Multiple Select',
  parameters: {
    docs: {
      description: {
        story: 'Multi-selection: the value is an array of keys and the trigger lists the selected emails.'
      }
    }
  },
  render: args => <Sandbox {...args} label="Users" multiple initialValue={['admin@example.com']} />
}`,...(qe=(Qe=_.parameters)==null?void 0:Qe.docs)==null?void 0:qe.source}}};var ze,Xe,Ye;ee.parameters={...ee.parameters,docs:{...(ze=ee.parameters)==null?void 0:ze.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Two projects and one role named at once: every key present in the props goes into \`UserScope\`, and the server OR-combines them.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" projectId={[PROJECT_ID, '66666666-7777-4888-8999-aaaaaaaaaaaa']} roleId="bbbbbbbb-cccc-4ddd-8eee-ffffffffffff" />
}`,...(Ye=(Xe=ee.parameters)==null?void 0:Xe.docs)==null?void 0:Ye.source}}};var He,Je,Ge;ae.parameters={...ae.parameters,docs:{...(He=ae.parameters)==null?void 0:He.docs,source:{originalSource:`{
  name: 'Custom e-mail entry',
  parameters: {
    docs: {
      description: {
        story: '\`allowCustomSelect\` — an e-mail address typed in the search box that no listed user matches is offered as one more option; picking it makes the value that address and \`onChange\` marks it \`isCustom\`.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" allowCustomSelect defaultOpen />
}`,...(Ge=(Je=ae.parameters)==null?void 0:Je.docs)==null?void 0:Ge.source}}};var We,Ze,_e;te.parameters={...te.parameters,docs:{...(We=te.parameters)==null?void 0:We.docs,source:{originalSource:`{
  name: 'Exclude Inactive Users',
  parameters: {
    docs: {
      description: {
        story: '\`excludeInactive\` composes \`status: { equals: ACTIVE }\` into the \`UserV2Filter\`.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" excludeInactive />
}`,...(_e=(Ze=te.parameters)==null?void 0:Ze.docs)==null?void 0:_e.source}}};var ea,aa,ta;re.parameters={...re.parameters,docs:{...(ea=re.parameters)==null?void 0:ea.docs,source:{originalSource:`{
  name: 'ID-valued',
  parameters: {
    docs: {
      description: {
        story: '\`valuePropName="id"\` — the plain-key value is the local user UUID, which is what \`setVFolderMountPolicy\` and friends take. This is the only mode that runs the \`uuid in\` label-resolution query.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" valuePropName="id" />
}`,...(ta=(aa=re.parameters)==null?void 0:aa.docs)==null?void 0:ta.source}}};var ra,sa,oa;se.parameters={...se.parameters,docs:{...(ra=se.parameters)==null?void 0:ra.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Caller-side \`isLoading\`, which spins the trigger the same way the internal debounce and refetch pending states do.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" isLoading isDisabled />
}`,...(oa=(sa=se.parameters)==null?void 0:sa.docs)==null?void 0:oa.source}}};var la,na,ia;oe.parameters={...oe.parameters,docs:{...(la=oe.parameters)==null?void 0:la.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'No users in the scope — the popup shows the shared empty-state text.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" resolvers={emptyResolvers} defaultOpen />
}`,...(ia=(na=oe.parameters)==null?void 0:na.docs)==null?void 0:ia.source}}};var ca,da,ma;le.parameters={...le.parameters,docs:{...(ca=le.parameters)==null?void 0:ca.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'The error status a form item sets when its \`required\` rule fails.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" status={{
    type: 'error',
    message: 'Please select a user.'
  }} />
}`,...(ma=(da=le.parameters)==null?void 0:da.docs)==null?void 0:ma.source}}};const qt=["Basic","Multiple","SeveralScopes","CustomSelect","ExcludeInactive","IdValued","Loading","Empty","Error"];export{Z as Basic,ae as CustomSelect,oe as Empty,le as Error,te as ExcludeInactive,re as IdValued,se as Loading,_ as Multiple,ee as SeveralScopes,qt as __namedExportsOrder,Qt as default};
