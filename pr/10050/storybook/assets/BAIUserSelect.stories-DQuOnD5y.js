import{j as r,r as D}from"./iframe-CL7gxDZj.js";import{R as L}from"./RelayResolver-BNO84kw2.js";import{B as R}from"./BAIUserSelect-df-ghaeZ.js";import"./preload-helper-Dp1pzeXC.js";import"./index-BrWOE613.js";import"./index-B6ozbOje.js";import"./index-B6J0DT_y.js";import"./isNumber-DxzprNrZ.js";import"./toString-CBCtgz1Z.js";import"./isSymbol-BS2xVMGY.js";import"./filter-DVA3r-hQ.js";import"./_baseEach-CSBkbyrA.js";import"./get-CZb3tCEy.js";import"./_baseGet-DWxs046T.js";import"./identity-DKeuBCMA.js";import"./isEmpty-AW6KL3QE.js";import"./useDebounce-IpiCGJf6.js";import"./useEventNotStable-DXB69Aao.js";import"./uniqBy-DtnLOuBN.js";import"./_baseUniq-dzKkc6pk.js";import"./_arrayIncludes-B0rj_Tme.js";import"./_baseIndexOf-Be9UPhX8.js";import"./_baseFindIndex-Cj99RmFE.js";import"./useControllableValue-B0Z4kFLY.js";import"./toNumber-BI2CEct6.js";import"./_trimmedEndIndex-DuQxD0U0.js";import"./index-CD_22-Yl.js";import"./useConnectedBAIClient-CXQjDm4A.js";import"./reactQueryAlias-CKKi6Vao.js";import"./useUpdatableState-f1S_QC8P.js";import"./BAIComplexSelect-Btwt63eI.js";import"./compiled-D_YGP6zo.js";import"./usePopover-DgVj0SSk.js";import"./useDevWarning-CYjNHf_l.js";import"./rtlStyles-T4i24HtE.js";import"./isRenderable-BUV0eL6r.js";import"./InputClearButton-qaNYZtp6.js";import"./FieldStatus-CqsBaKvU.js";import"./composeEventHandlers-BolWE7qY.js";import"./useIndicator-6MxkXWuS.js";import"./Token-D0MKNqnL.js";import"./Divider-BIYBQTng.js";import"./SelectorOption-C7ggK8lv.js";import"./Item-T8DT8Bpf.js";import"./compact-CU4PNV0P.js";import"./castArray-ufwSILLR.js";import"./map-BdIEQFnI.js";const Ce={title:"Fragments/BAIUserSelect",component:R,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:"\n**BAIUserSelect** — the user picker for screens outside the admin menu: the members of one project. Built on `BAIComplexSelect`. Admin pages use `BAIAdminUserSelect`.\n\n- `projectId` (required): the project whose members are listed, through `scopedUsersV2` with a project scope.\n- `valuePropName`: `'email'` (default) or `'id'` — which field is the plain-key value. Only `'id'` runs the `uuid in` label-resolution query; with emails the key already is the label.\n- `filter` / `excludeInactive`: composed into a `UserV2Filter` through the schema's `AND` combinator, together with the debounced `email: { iContains }` search.\n- Needs a manager >= 26.9.0, where `scopedUsersV2` exists.\n\nSee `BAIComplexSelect.stories.tsx` for the underlying popup-body component with static options.\n        "}}},argTypes:{value:{control:!1},onChange:{control:!1},filter:{control:!1},projectId:{control:!1},multiple:{control:{type:"boolean"}},excludeInactive:{control:{type:"boolean"}},valuePropName:{control:{type:"select"},options:["email","id"]}}},T=[{id:"VXNlclYyOjE=",basicInfo:{email:"admin@example.com",fullName:"System Administrator"}},{id:"VXNlclYyOjI=",basicInfo:{email:"alice@example.com",fullName:"Alice Kim"}},{id:"VXNlclYyOjM=",basicInfo:{email:"bob@example.com",fullName:"Bob Lee"}},{id:"VXNlclYyOjQ=",basicInfo:{email:"carol@example.com",fullName:"Carol Park"}}],B=e=>({count:e.length,edges:e.map(m=>({node:m}))}),F={Query:()=>({scopedUsersV2:B(T)})},X={Query:()=>({scopedUsersV2:B([])})},s=({initialValue:e=null,resolvers:m=F,...P})=>{const[q,C]=D.useState(e);return r.jsx(L,{mockResolvers:m,children:r.jsx(R,{...P,projectId:"5c3b5a9e-0000-4000-8000-000000000001",value:q,onChange:M=>C(M??null)})})},t={parameters:{docs:{description:{story:"Reads `scopedUsersV2` with a project scope: the members of the project `projectId` names."}}},render:e=>r.jsx(s,{...e,label:"Owner",defaultOpen:!0})},o={name:"Multiple Select",parameters:{docs:{description:{story:"Multi-selection: the value is an array of keys and the trigger lists the selected emails."}}},render:e=>r.jsx(s,{...e,label:"Users",multiple:!0,initialValue:["admin@example.com"]})},a={name:"Exclude Inactive Users",parameters:{docs:{description:{story:"`excludeInactive` composes `status: { equals: ACTIVE }` into the `UserV2Filter`."}}},render:e=>r.jsx(s,{...e,label:"User",excludeInactive:!0})},i={name:"ID-valued",parameters:{docs:{description:{story:'`valuePropName="id"` — the plain-key value is the local user UUID, which is what `adminBulkAssignRole` and friends take. This is the only mode that runs the `uuid in` label-resolution query.'}}},render:e=>r.jsx(s,{...e,label:"User",valuePropName:"id"})},n={parameters:{docs:{description:{story:"Caller-side `isLoading`, which spins the trigger the same way the internal debounce and refetch pending states do."}}},render:e=>r.jsx(s,{...e,label:"User",isLoading:!0,isDisabled:!0})},l={parameters:{docs:{description:{story:"No users match the query — the popup shows the shared empty-state text."}}},render:e=>r.jsx(s,{...e,label:"User",resolvers:X,defaultOpen:!0})},c={parameters:{docs:{description:{story:"The error status a form item sets when its `required` rule fails."}}},render:e=>r.jsx(s,{...e,label:"User",status:{type:"error",message:"Please select users."}})};var p,d,u;t.parameters={...t.parameters,docs:{...(p=t.parameters)==null?void 0:p.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Reads \`scopedUsersV2\` with a project scope: the members of the project \`projectId\` names.'
      }
    }
  },
  render: args => <Sandbox {...args} label="Owner" defaultOpen />
}`,...(u=(d=t.parameters)==null?void 0:d.docs)==null?void 0:u.source}}};var h,y,g;o.parameters={...o.parameters,docs:{...(h=o.parameters)==null?void 0:h.docs,source:{originalSource:`{
  name: 'Multiple Select',
  parameters: {
    docs: {
      description: {
        story: 'Multi-selection: the value is an array of keys and the trigger lists the selected emails.'
      }
    }
  },
  render: args => <Sandbox {...args} label="Users" multiple initialValue={['admin@example.com']} />
}`,...(g=(y=o.parameters)==null?void 0:y.docs)==null?void 0:g.source}}};var b,x,f;a.parameters={...a.parameters,docs:{...(b=a.parameters)==null?void 0:b.docs,source:{originalSource:`{
  name: 'Exclude Inactive Users',
  parameters: {
    docs: {
      description: {
        story: '\`excludeInactive\` composes \`status: { equals: ACTIVE }\` into the \`UserV2Filter\`.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" excludeInactive />
}`,...(f=(x=a.parameters)==null?void 0:x.docs)==null?void 0:f.source}}};var I,v,U;i.parameters={...i.parameters,docs:{...(I=i.parameters)==null?void 0:I.docs,source:{originalSource:`{
  name: 'ID-valued',
  parameters: {
    docs: {
      description: {
        story: '\`valuePropName="id"\` — the plain-key value is the local user UUID, which is what \`adminBulkAssignRole\` and friends take. This is the only mode that runs the \`uuid in\` label-resolution query.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" valuePropName="id" />
}`,...(U=(v=i.parameters)==null?void 0:v.docs)==null?void 0:U.source}}};var j,S,w;n.parameters={...n.parameters,docs:{...(j=n.parameters)==null?void 0:j.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Caller-side \`isLoading\`, which spins the trigger the same way the internal debounce and refetch pending states do.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" isLoading isDisabled />
}`,...(w=(S=n.parameters)==null?void 0:S.docs)==null?void 0:w.source}}};var V,N,k;l.parameters={...l.parameters,docs:{...(V=l.parameters)==null?void 0:V.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'No users match the query — the popup shows the shared empty-state text.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" resolvers={emptyResolvers} defaultOpen />
}`,...(k=(N=l.parameters)==null?void 0:N.docs)==null?void 0:k.source}}};var A,E,O;c.parameters={...c.parameters,docs:{...(A=c.parameters)==null?void 0:A.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'The error status a form item sets when its \`required\` rule fails.'
      }
    }
  },
  render: args => <Sandbox {...args} label="User" status={{
    type: 'error',
    message: 'Please select users.'
  }} />
}`,...(O=(E=c.parameters)==null?void 0:E.docs)==null?void 0:O.source}}};const Me=["ProjectMembers","Multiple","ExcludeInactive","IdValued","Loading","Empty","Error"];export{l as Empty,c as Error,a as ExcludeInactive,i as IdValued,n as Loading,o as Multiple,t as ProjectMembers,Me as __namedExportsOrder,Ce as default};
