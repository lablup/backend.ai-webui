import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-DlPsW1c0.js";import{n,t as ee}from"./compact-C9OPbfhP.js";import{n as te,t as r}from"./map-BLzs52H1.js";import{n as ne,t as i}from"./uniq-DmtnzBGk.js";import{t as a}from"./jsx-runtime-MKhVqBIO.js";import{n as re,t as o}from"./useBAIi18n-CcDjjg8q.js";import{t as s}from"./compiler-runtime-DU4U6aph.js";import{t as c}from"./react-relay-sHama7hJ.js";import{n as l,t as ie}from"./BAISelect-CfnfZEG0.js";import{n as ae,t as u}from"./RelayResolver-BnFyFQJn.js";var d;function oe(){return(oe=e((()=>{d=(function(){var e=[{defaultValue:null,kind:`LocalArgument`,name:`limit`}],t=[{kind:`Variable`,name:`limit`,variableName:`limit`},{kind:`Literal`,name:`offset`,value:0}],n={alias:null,args:null,kind:`ScalarField`,name:`proxy`,storageKey:null};return{fragment:{argumentDefinitions:e,kind:`Fragment`,metadata:null,name:`BAIStorageProxySelectQuery`,selections:[{alias:null,args:t,concreteType:`StorageVolumeList`,kind:`LinkedField`,name:`storage_volume_list`,plural:!1,selections:[{alias:null,args:null,concreteType:`StorageVolume`,kind:`LinkedField`,name:`items`,plural:!0,selections:[n],storageKey:null}],storageKey:null}],type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:e,kind:`Operation`,name:`BAIStorageProxySelectQuery`,selections:[{alias:null,args:t,concreteType:`StorageVolumeList`,kind:`LinkedField`,name:`storage_volume_list`,plural:!1,selections:[{alias:null,args:null,concreteType:`StorageVolume`,kind:`LinkedField`,name:`items`,plural:!0,selections:[n,{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null}],storageKey:null}],storageKey:null}]},params:{cacheID:`b18d8c964bbf7af60d564f4fa0f82338`,id:null,metadata:{},name:`BAIStorageProxySelectQuery`,operationKind:`query`,text:`query BAIStorageProxySelectQuery(
  $limit: Int!
) {
  storage_volume_list(limit: $limit, offset: 0) {
    items {
      proxy
      id
    }
  }
}
`}}})(),d.hash=`e0ada7211322acef77d2fdb321215b0b`})))()}function se(e){return e==null?void 0:e.proxy}function ce(e){return{label:e,value:e}}var f,p,le,m,h;function g(){return(g=e((()=>{oe(),f=s(),o(),l(),i(),n(),r(),p=c(),le=a(),m=1e3,h=e=>{"use memo";let t=(0,f.c)(12),{t:n}=re(),r,i;t[0]===Symbol.for(`react.memo_cache_sentinel`)?(r={limit:m},i={},t[0]=r,t[1]=i):(r=t[0],i=t[1]);let{storage_volume_list:a}=(0,p.useLazyLoadQuery)(d,r,i),o,s;if(t[2]!==(a==null?void 0:a.items)){let e=ne(ee(te(a==null?void 0:a.items,se)));o=ie,s=te(e,ce),t[2]=a==null?void 0:a.items,t[3]=o,t[4]=s}else o=t[3],s=t[4];let c;t[5]===n?c=t[6]:(c=n(`comp:BAIStorageProxySelect.SelectStorageProxy`),t[5]=n,t[6]=c);let l;return t[7]!==o||t[8]!==e||t[9]!==s||t[10]!==c?(l=(0,le.jsx)(o,{options:s,showSearch:!0,placeholder:c,...e}),t[7]=o,t[8]=e,t[9]=s,t[10]=c,t[11]=l):l=t[11],l}})))()}var _,v,ue,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q,$,de;function fe(){return(fe=e((()=>{ae(),g(),_=t(),v=a(),H=[{proxy:`local`},{proxy:`ceph-proxy`},{proxy:`pure-proxy`}],U=[{proxy:`local`},{proxy:`local`},{proxy:`ceph-proxy`},{proxy:`ceph-proxy`},{proxy:`pure-proxy`},{proxy:`local`}],W=Array.from({length:15},(e,t)=>({proxy:`proxy-${t+1}`})),G={title:`Fragments/BAIStorageProxySelect`,component:h,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`
**BAIStorageProxySelect** extends [BAISelect](/?path=/docs/components-input-baiselect--docs) to fetch storage volumes and present the distinct storage-proxy names.

## Features
- Fetches volumes from GraphQL query \`BAIStorageProxySelectQuery\` and derives distinct proxy names
- Automatically removes duplicate proxy names using \`_.uniq\` + \`_.compact\`
- Built-in search functionality enabled by default
- Internationalized placeholder using \`comp:BAIStorageProxySelect.SelectStorageProxy\`
- Uses the proxy name as both label and value

## GraphQL Query
\`\`\`graphql
query BAIStorageProxySelectQuery($limit: Int!) {
  storage_volume_list(limit: $limit, offset: 0) {
    items {
      proxy
    }
  }
}
\`\`\`

There is no dedicated storage-proxy list field yet, so proxies are derived from the volume list (see the \`TODO(needs-backend)\` in the source).

## Usage
\`\`\`tsx
<BAIStorageProxySelect
  autoSelectOption
  onChange={(value) => console.log(value)}
/>
\`\`\`

For all other props, refer to [BAISelect](/?path=/docs/components-input-baiselect--docs).
        `}}},argTypes:{placeholder:{control:{type:`text`},description:`Placeholder text when no value is selected`,table:{type:{summary:`string`},defaultValue:{summary:`i18n: comp:BAIStorageProxySelect.SelectStorageProxy`}}},autoSelectOption:{control:{type:`boolean`},description:`Auto-select the first option once options load and no value is set`,table:{type:{summary:`boolean | ((options) => value)`},defaultValue:{summary:`undefined`}}},disabled:{control:{type:`boolean`},description:`Whether the select is disabled`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},allowClear:{control:{type:`boolean`},description:`Show clear button`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},onChange:{action:`changed`,description:`Callback when selection changes`}}},K={name:`Basic`,parameters:{docs:{description:{story:`Basic usage showing 3 storage proxies. Search functionality is enabled by default, and the placeholder is internationalized.`}}},args:{},render:e=>(0,v.jsx)(u,{mockResolvers:{Query:()=>({storage_volume_list:{items:H}})},children:(0,v.jsx)(h,{...e,style:{width:`300px`}})})},q={name:`EmptyState`,parameters:{docs:{description:{story:`Shows the component when no storage proxies are configured.`}}},args:{},render:e=>(0,v.jsx)(u,{mockResolvers:{Query:()=>({storage_volume_list:{items:[]}})},children:(0,v.jsx)(h,{...e,style:{width:`300px`}})})},J={name:`AutomaticDeduplication`,parameters:{docs:{description:{story:`Demonstrates automatic deduplication when multiple volumes share the same proxy. Only distinct proxy names are shown (3 unique proxies from 6 volumes).`}}},args:{},render:e=>(0,v.jsx)(u,{mockResolvers:{Query:()=>({storage_volume_list:{items:U}})},children:(0,v.jsx)(h,{...e,style:{width:`300px`}})})},Y={name:`AutoSelectFirstOption`,parameters:{docs:{description:{story:"With `autoSelectOption`, the first proxy is selected automatically once options load and no value is set — used by the SFTP Resource Group settings modal. This requires a controlled `value`/`onChange` pair (as a real consumer, e.g. an antd `Form.Item`, would provide) — `autoSelectOption` only *calls* `onChange`, it does not maintain the selection itself."}}},args:{autoSelectOption:!0},render:e=>{let[t,n]=(0,_.useState)();return(0,v.jsx)(u,{mockResolvers:{Query:()=>({storage_volume_list:{items:H}})},children:(0,v.jsx)(h,{...e,value:t,onChange:n,style:{width:`300px`}})})}},X={name:`MultipleSelection`,parameters:{docs:{description:{story:'With `mode="multiple"`, users can select several proxies from the existing options (as opposed to `mode="tags"`, which also allows free text entry).'}}},args:{mode:`multiple`,defaultValue:[`local`,`ceph-proxy`]},render:e=>(0,v.jsx)(u,{mockResolvers:{Query:()=>({storage_volume_list:{items:H}})},children:(0,v.jsx)(h,{...e,style:{width:`300px`}})})},Z={name:`DisabledState`,parameters:{docs:{description:{story:`Shows the component in a disabled state where users cannot interact with it.`}}},args:{disabled:!0},render:e=>(0,v.jsx)(u,{mockResolvers:{Query:()=>({storage_volume_list:{items:H}})},children:(0,v.jsx)(h,{...e,style:{width:`300px`}})})},Q={name:`ClearButton`,parameters:{docs:{description:{story:`Select with allowClear enabled, allowing users to clear their selection.`}}},args:{allowClear:!0},render:e=>(0,v.jsx)(u,{mockResolvers:{Query:()=>({storage_volume_list:{items:H}})},children:(0,v.jsx)(h,{...e,style:{width:`300px`}})})},$={name:`ManyOptions`,parameters:{docs:{description:{story:`Demonstrates the component with 15 storage proxies, showing a scrollable dropdown with search functionality.`}}},args:{allowClear:!0},render:e=>(0,v.jsx)(u,{mockResolvers:{Query:()=>({storage_volume_list:{items:W}})},children:(0,v.jsx)(h,{...e,style:{width:`300px`}})})},K.parameters={...K.parameters,docs:{...(ue=K.parameters)==null?void 0:ue.docs,source:{originalSource:`{
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'Basic usage showing 3 storage proxies. Search functionality is enabled by default, and the placeholder is internationalized.'
      }
    }
  },
  args: {},
  render: args => <RelayResolver mockResolvers={{
    Query: () => ({
      storage_volume_list: {
        items: sampleVolumes
      }
    })
  }}>
      <BAIStorageProxySelect {...args} style={{
      width: '300px'
    }} />
    </RelayResolver>
}`,...(y=K.parameters)==null||(y=y.docs)==null?void 0:y.source},description:{story:`Basic usage with 3 sample storage proxies.`,...(b=K.parameters)==null||(b=b.docs)==null?void 0:b.description}}},q.parameters={...q.parameters,docs:{...(x=q.parameters)==null?void 0:x.docs,source:{originalSource:`{
  name: 'EmptyState',
  parameters: {
    docs: {
      description: {
        story: 'Shows the component when no storage proxies are configured.'
      }
    }
  },
  args: {},
  render: args => <RelayResolver mockResolvers={{
    Query: () => ({
      storage_volume_list: {
        items: []
      }
    })
  }}>
      <BAIStorageProxySelect {...args} style={{
      width: '300px'
    }} />
    </RelayResolver>
}`,...(S=q.parameters)==null||(S=S.docs)==null?void 0:S.source},description:{story:`Empty state when no storage volumes (and thus no proxies) are available.`,...(C=q.parameters)==null||(C=C.docs)==null?void 0:C.description}}},J.parameters={...J.parameters,docs:{...(w=J.parameters)==null?void 0:w.docs,source:{originalSource:`{
  name: 'AutomaticDeduplication',
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates automatic deduplication when multiple volumes share the same proxy. Only distinct proxy names are shown (3 unique proxies from 6 volumes).'
      }
    }
  },
  args: {},
  render: args => <RelayResolver mockResolvers={{
    Query: () => ({
      storage_volume_list: {
        items: sampleVolumesWithDuplicateProxies
      }
    })
  }}>
      <BAIStorageProxySelect {...args} style={{
      width: '300px'
    }} />
    </RelayResolver>
}`,...(T=J.parameters)==null||(T=T.docs)==null?void 0:T.source},description:{story:`Automatic deduplication of proxy names derived from multiple volumes.`,...(E=J.parameters)==null||(E=E.docs)==null?void 0:E.description}}},Y.parameters={...Y.parameters,docs:{...(D=Y.parameters)==null?void 0:D.docs,source:{originalSource:`{
  name: 'AutoSelectFirstOption',
  parameters: {
    docs: {
      description: {
        story: 'With \`autoSelectOption\`, the first proxy is selected automatically once options load and no value is set — used by the SFTP Resource Group settings modal. This requires a controlled \`value\`/\`onChange\` pair (as a real consumer, e.g. an antd \`Form.Item\`, would provide) — \`autoSelectOption\` only *calls* \`onChange\`, it does not maintain the selection itself.'
      }
    }
  },
  args: {
    autoSelectOption: true
  },
  render: args => {
    const [value, setValue] = useState<string>();
    return <RelayResolver mockResolvers={{
      Query: () => ({
        storage_volume_list: {
          items: sampleVolumes
        }
      })
    }}>
        <BAIStorageProxySelect {...args} value={value} onChange={setValue} style={{
        width: '300px'
      }} />
      </RelayResolver>;
  }
}`,...(O=Y.parameters)==null||(O=O.docs)==null?void 0:O.source},description:{story:`Auto-select the first proxy once options load.`,...(k=Y.parameters)==null||(k=k.docs)==null?void 0:k.description}}},X.parameters={...X.parameters,docs:{...(A=X.parameters)==null?void 0:A.docs,source:{originalSource:`{
  name: 'MultipleSelection',
  parameters: {
    docs: {
      description: {
        story: 'With \`mode="multiple"\`, users can select several proxies from the existing options (as opposed to \`mode="tags"\`, which also allows free text entry).'
      }
    }
  },
  args: {
    mode: 'multiple',
    defaultValue: ['local', 'ceph-proxy']
  },
  render: args => <RelayResolver mockResolvers={{
    Query: () => ({
      storage_volume_list: {
        items: sampleVolumes
      }
    })
  }}>
      <BAIStorageProxySelect {...args} style={{
      width: '300px'
    }} />
    </RelayResolver>
}`,...(j=X.parameters)==null||(j=j.docs)==null?void 0:j.source},description:{story:`Multiple selection mode, picking from existing proxy options.`,...(M=X.parameters)==null||(M=M.docs)==null?void 0:M.description}}},Z.parameters={...Z.parameters,docs:{...(N=Z.parameters)==null?void 0:N.docs,source:{originalSource:`{
  name: 'DisabledState',
  parameters: {
    docs: {
      description: {
        story: 'Shows the component in a disabled state where users cannot interact with it.'
      }
    }
  },
  args: {
    disabled: true
  },
  render: args => <RelayResolver mockResolvers={{
    Query: () => ({
      storage_volume_list: {
        items: sampleVolumes
      }
    })
  }}>
      <BAIStorageProxySelect {...args} style={{
      width: '300px'
    }} />
    </RelayResolver>
}`,...(P=Z.parameters)==null||(P=P.docs)==null?void 0:P.source},description:{story:`Disabled state of the select.`,...(F=Z.parameters)==null||(F=F.docs)==null?void 0:F.description}}},Q.parameters={...Q.parameters,docs:{...(I=Q.parameters)==null?void 0:I.docs,source:{originalSource:`{
  name: 'ClearButton',
  parameters: {
    docs: {
      description: {
        story: 'Select with allowClear enabled, allowing users to clear their selection.'
      }
    }
  },
  args: {
    allowClear: true
  },
  render: args => <RelayResolver mockResolvers={{
    Query: () => ({
      storage_volume_list: {
        items: sampleVolumes
      }
    })
  }}>
      <BAIStorageProxySelect {...args} style={{
      width: '300px'
    }} />
    </RelayResolver>
}`,...(L=Q.parameters)==null||(L=L.docs)==null?void 0:L.source},description:{story:`Select with clear button enabled.`,...(R=Q.parameters)==null||(R=R.docs)==null?void 0:R.description}}},$.parameters={...$.parameters,docs:{...(z=$.parameters)==null?void 0:z.docs,source:{originalSource:`{
  name: 'ManyOptions',
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the component with 15 storage proxies, showing a scrollable dropdown with search functionality.'
      }
    }
  },
  args: {
    allowClear: true
  },
  render: args => <RelayResolver mockResolvers={{
    Query: () => ({
      storage_volume_list: {
        items: sampleManyVolumes
      }
    })
  }}>
      <BAIStorageProxySelect {...args} style={{
      width: '300px'
    }} />
    </RelayResolver>
}`,...(B=$.parameters)==null||(B=B.docs)==null?void 0:B.source},description:{story:`Select with many storage proxies.`,...(V=$.parameters)==null||(V=V.docs)==null?void 0:V.description}}},de=[`Default`,`Empty`,`WithDuplicates`,`AutoSelectFirst`,`MultiSelect`,`Disabled`,`WithClearButton`,`ManyProxies`]})))()}fe();export{Y as AutoSelectFirst,K as Default,Z as Disabled,q as Empty,$ as ManyProxies,X as MultiSelect,Q as WithClearButton,J as WithDuplicates,de as __namedExportsOrder,G as default};