import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-D0Ex1IVc.js";import{n,t as r}from"./compact-C9OPbfhP.js";import{n as i,t as a}from"./map-CLZMgxwS.js";import{n as o,t as s}from"./uniq-BqHC1R2V.js";import{t as c}from"./jsx-runtime-MKhVqBIO.js";import{n as l,t as u}from"./useBAIi18n-Biey1teG.js";import{t as d}from"./compiler-runtime-CdReTaax.js";import{t as f}from"./react-relay-sBALIJlt.js";import{n as p,t as m}from"./BAISelect-CgNx8uBa.js";import{n as h,t as g}from"./RelayResolver-CMrgwoPg.js";var _;function v(){return(v=e((()=>{_=(function(){var e=[{defaultValue:null,kind:`LocalArgument`,name:`limit`}],t=[{kind:`Variable`,name:`limit`,variableName:`limit`},{kind:`Literal`,name:`offset`,value:0}],n={alias:null,args:null,kind:`ScalarField`,name:`proxy`,storageKey:null};return{fragment:{argumentDefinitions:e,kind:`Fragment`,metadata:null,name:`BAIStorageProxySelectQuery`,selections:[{alias:null,args:t,concreteType:`StorageVolumeList`,kind:`LinkedField`,name:`storage_volume_list`,plural:!1,selections:[{alias:null,args:null,concreteType:`StorageVolume`,kind:`LinkedField`,name:`items`,plural:!0,selections:[n],storageKey:null}],storageKey:null}],type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:e,kind:`Operation`,name:`BAIStorageProxySelectQuery`,selections:[{alias:null,args:t,concreteType:`StorageVolumeList`,kind:`LinkedField`,name:`storage_volume_list`,plural:!1,selections:[{alias:null,args:null,concreteType:`StorageVolume`,kind:`LinkedField`,name:`items`,plural:!0,selections:[n,{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null}],storageKey:null}],storageKey:null}]},params:{cacheID:`b18d8c964bbf7af60d564f4fa0f82338`,id:null,metadata:{},name:`BAIStorageProxySelectQuery`,operationKind:`query`,text:`query BAIStorageProxySelectQuery(
  $limit: Int!
) {
  storage_volume_list(limit: $limit, offset: 0) {
    items {
      proxy
      id
    }
  }
}
`}}})(),_.hash=`e0ada7211322acef77d2fdb321215b0b`})))()}function y(e){return e?.proxy}function b(e){return{label:e,value:e}}var x,S,C,w,T;function E(){return(E=e((()=>{v(),x=d(),u(),p(),s(),n(),a(),S=f(),C=c(),w=1e3,T=e=>{"use memo";let t=(0,x.c)(12),{t:n}=l(),a,s;t[0]===Symbol.for(`react.memo_cache_sentinel`)?(a={limit:w},s={},t[0]=a,t[1]=s):(a=t[0],s=t[1]);let{storage_volume_list:c}=(0,S.useLazyLoadQuery)(_,a,s),u,d;if(t[2]!==c?.items){let e=o(r(i(c?.items,y)));u=m,d=i(e,b),t[2]=c?.items,t[3]=u,t[4]=d}else u=t[3],d=t[4];let f;t[5]===n?f=t[6]:(f=n(`comp:BAIStorageProxySelect.SelectStorageProxy`),t[5]=n,t[6]=f);let p;return t[7]!==u||t[8]!==e||t[9]!==d||t[10]!==f?(p=(0,C.jsx)(u,{options:d,showSearch:!0,placeholder:f,...e}),t[7]=u,t[8]=e,t[9]=d,t[10]=f,t[11]=p):p=t[11],p}})))()}var D,O,k,A,j,M,N,P,F,I,L,R,z,B,V;function H(){return(H=e((()=>{h(),E(),D=t(),O=c(),k=[{proxy:`local`},{proxy:`ceph-proxy`},{proxy:`pure-proxy`}],A=[{proxy:`local`},{proxy:`local`},{proxy:`ceph-proxy`},{proxy:`ceph-proxy`},{proxy:`pure-proxy`},{proxy:`local`}],j=Array.from({length:15},(e,t)=>({proxy:`proxy-${t+1}`})),M={title:`Fragments/BAIStorageProxySelect`,component:T,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`
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
        `}}},argTypes:{placeholder:{control:{type:`text`},description:`Placeholder text when no value is selected`,table:{type:{summary:`string`},defaultValue:{summary:`i18n: comp:BAIStorageProxySelect.SelectStorageProxy`}}},autoSelectOption:{control:{type:`boolean`},description:`Auto-select the first option once options load and no value is set`,table:{type:{summary:`boolean | ((options) => value)`},defaultValue:{summary:`undefined`}}},disabled:{control:{type:`boolean`},description:`Whether the select is disabled`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},allowClear:{control:{type:`boolean`},description:`Show clear button`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},onChange:{action:`changed`,description:`Callback when selection changes`}}},N={name:`Basic`,parameters:{docs:{description:{story:`Basic usage showing 3 storage proxies. Search functionality is enabled by default, and the placeholder is internationalized.`}}},args:{},render:e=>(0,O.jsx)(g,{mockResolvers:{Query:()=>({storage_volume_list:{items:k}})},children:(0,O.jsx)(T,{...e,style:{width:`300px`}})})},P={name:`EmptyState`,parameters:{docs:{description:{story:`Shows the component when no storage proxies are configured.`}}},args:{},render:e=>(0,O.jsx)(g,{mockResolvers:{Query:()=>({storage_volume_list:{items:[]}})},children:(0,O.jsx)(T,{...e,style:{width:`300px`}})})},F={name:`AutomaticDeduplication`,parameters:{docs:{description:{story:`Demonstrates automatic deduplication when multiple volumes share the same proxy. Only distinct proxy names are shown (3 unique proxies from 6 volumes).`}}},args:{},render:e=>(0,O.jsx)(g,{mockResolvers:{Query:()=>({storage_volume_list:{items:A}})},children:(0,O.jsx)(T,{...e,style:{width:`300px`}})})},I={name:`AutoSelectFirstOption`,parameters:{docs:{description:{story:"With `autoSelectOption`, the first proxy is selected automatically once options load and no value is set — used by the SFTP Resource Group settings modal. This requires a controlled `value`/`onChange` pair (as a real consumer, e.g. an antd `Form.Item`, would provide) — `autoSelectOption` only *calls* `onChange`, it does not maintain the selection itself."}}},args:{autoSelectOption:!0},render:e=>{let[t,n]=(0,D.useState)();return(0,O.jsx)(g,{mockResolvers:{Query:()=>({storage_volume_list:{items:k}})},children:(0,O.jsx)(T,{...e,value:t,onChange:n,style:{width:`300px`}})})}},L={name:`MultipleSelection`,parameters:{docs:{description:{story:'With `mode="multiple"`, users can select several proxies from the existing options (as opposed to `mode="tags"`, which also allows free text entry).'}}},args:{mode:`multiple`,defaultValue:[`local`,`ceph-proxy`]},render:e=>(0,O.jsx)(g,{mockResolvers:{Query:()=>({storage_volume_list:{items:k}})},children:(0,O.jsx)(T,{...e,style:{width:`300px`}})})},R={name:`DisabledState`,parameters:{docs:{description:{story:`Shows the component in a disabled state where users cannot interact with it.`}}},args:{disabled:!0},render:e=>(0,O.jsx)(g,{mockResolvers:{Query:()=>({storage_volume_list:{items:k}})},children:(0,O.jsx)(T,{...e,style:{width:`300px`}})})},z={name:`ClearButton`,parameters:{docs:{description:{story:`Select with allowClear enabled, allowing users to clear their selection.`}}},args:{allowClear:!0},render:e=>(0,O.jsx)(g,{mockResolvers:{Query:()=>({storage_volume_list:{items:k}})},children:(0,O.jsx)(T,{...e,style:{width:`300px`}})})},B={name:`ManyOptions`,parameters:{docs:{description:{story:`Demonstrates the component with 15 storage proxies, showing a scrollable dropdown with search functionality.`}}},args:{allowClear:!0},render:e=>(0,O.jsx)(g,{mockResolvers:{Query:()=>({storage_volume_list:{items:j}})},children:(0,O.jsx)(T,{...e,style:{width:`300px`}})})},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
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
}`,...N.parameters?.docs?.source},description:{story:`Basic usage with 3 sample storage proxies.`,...N.parameters?.docs?.description}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
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
}`,...P.parameters?.docs?.source},description:{story:`Empty state when no storage volumes (and thus no proxies) are available.`,...P.parameters?.docs?.description}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
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
}`,...F.parameters?.docs?.source},description:{story:`Automatic deduplication of proxy names derived from multiple volumes.`,...F.parameters?.docs?.description}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
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
}`,...I.parameters?.docs?.source},description:{story:`Auto-select the first proxy once options load.`,...I.parameters?.docs?.description}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
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
}`,...L.parameters?.docs?.source},description:{story:`Multiple selection mode, picking from existing proxy options.`,...L.parameters?.docs?.description}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
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
}`,...R.parameters?.docs?.source},description:{story:`Disabled state of the select.`,...R.parameters?.docs?.description}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
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
}`,...z.parameters?.docs?.source},description:{story:`Select with clear button enabled.`,...z.parameters?.docs?.description}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
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
}`,...B.parameters?.docs?.source},description:{story:`Select with many storage proxies.`,...B.parameters?.docs?.description}}},V=[`Default`,`Empty`,`WithDuplicates`,`AutoSelectFirst`,`MultiSelect`,`Disabled`,`WithClearButton`,`ManyProxies`]})))()}H();export{I as AutoSelectFirst,N as Default,R as Disabled,P as Empty,B as ManyProxies,L as MultiSelect,z as WithClearButton,F as WithDuplicates,V as __namedExportsOrder,M as default};