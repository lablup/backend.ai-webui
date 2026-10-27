import{n as e}from"./rolldown-runtime-2s6bX4vc.js";import{n as t,t as n}from"./compact-BqEdnGyS.js";import{n as r,t as i}from"./map-CIqW7OVA.js";import{n as a,t as o}from"./uniq-38em2tZ_.js";import{n as s,t as c}from"./useBAIi18n-BoXCk5K0.js";import{n as l,t as u}from"./BAISelect-Dty2gXL7.js";import{n as d,t as f}from"./RelayResolver-b1nJU57O.js";import{useState as p}from"react";import{jsx as m}from"react/jsx-runtime";import{c as h}from"react/compiler-runtime";import{useLazyLoadQuery as g}from"react-relay";var _;function v(){return(v=e((()=>{_=(function(){var e=[{defaultValue:null,kind:`LocalArgument`,name:`limit`}],t=[{kind:`Variable`,name:`limit`,variableName:`limit`},{kind:`Literal`,name:`offset`,value:0}],n={alias:null,args:null,kind:`ScalarField`,name:`proxy`,storageKey:null};return{fragment:{argumentDefinitions:e,kind:`Fragment`,metadata:null,name:`BAIStorageProxySelectQuery`,selections:[{alias:null,args:t,concreteType:`StorageVolumeList`,kind:`LinkedField`,name:`storage_volume_list`,plural:!1,selections:[{alias:null,args:null,concreteType:`StorageVolume`,kind:`LinkedField`,name:`items`,plural:!0,selections:[n],storageKey:null}],storageKey:null}],type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:e,kind:`Operation`,name:`BAIStorageProxySelectQuery`,selections:[{alias:null,args:t,concreteType:`StorageVolumeList`,kind:`LinkedField`,name:`storage_volume_list`,plural:!1,selections:[{alias:null,args:null,concreteType:`StorageVolume`,kind:`LinkedField`,name:`items`,plural:!0,selections:[n,{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null}],storageKey:null}],storageKey:null}]},params:{cacheID:`b18d8c964bbf7af60d564f4fa0f82338`,id:null,metadata:{},name:`BAIStorageProxySelectQuery`,operationKind:`query`,text:`query BAIStorageProxySelectQuery(
  $limit: Int!
) {
  storage_volume_list(limit: $limit, offset: 0) {
    items {
      proxy
      id
    }
  }
}
`}}})(),_.hash=`e0ada7211322acef77d2fdb321215b0b`})))()}function y(e){return e?.proxy}function b(e){return{label:e,value:e}}var x,S;function C(){return(C=e((()=>{v(),c(),l(),o(),t(),i(),x=1e3,S=e=>{"use memo";let t=h(12),{t:i}=s(),o,c;t[0]===Symbol.for(`react.memo_cache_sentinel`)?(o={limit:x},c={},t[0]=o,t[1]=c):(o=t[0],c=t[1]);let{storage_volume_list:l}=g(_,o,c),d,f;if(t[2]!==l?.items){let e=a(n(r(l?.items,y)));d=u,f=r(e,b),t[2]=l?.items,t[3]=d,t[4]=f}else d=t[3],f=t[4];let p;t[5]===i?p=t[6]:(p=i(`comp:BAIStorageProxySelect.SelectStorageProxy`),t[5]=i,t[6]=p);let v;return t[7]!==d||t[8]!==e||t[9]!==f||t[10]!==p?(v=m(d,{options:f,showSearch:!0,placeholder:p,...e}),t[7]=d,t[8]=e,t[9]=f,t[10]=p,t[11]=v):v=t[11],v}})))()}var w,T,E,D,O,k,A,j,M,N,P,F,I;function L(){return(L=e((()=>{d(),C(),w=[{proxy:`local`},{proxy:`ceph-proxy`},{proxy:`pure-proxy`}],T=[{proxy:`local`},{proxy:`local`},{proxy:`ceph-proxy`},{proxy:`ceph-proxy`},{proxy:`pure-proxy`},{proxy:`local`}],E=Array.from({length:15},(e,t)=>({proxy:`proxy-${t+1}`})),D={title:`Fragments/BAIStorageProxySelect`,component:S,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`
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
        `}}},argTypes:{placeholder:{control:{type:`text`},description:`Placeholder text when no value is selected`,table:{type:{summary:`string`},defaultValue:{summary:`i18n: comp:BAIStorageProxySelect.SelectStorageProxy`}}},autoSelectOption:{control:{type:`boolean`},description:`Auto-select the first option once options load and no value is set`,table:{type:{summary:`boolean | ((options) => value)`},defaultValue:{summary:`undefined`}}},disabled:{control:{type:`boolean`},description:`Whether the select is disabled`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},allowClear:{control:{type:`boolean`},description:`Show clear button`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},onChange:{action:`changed`,description:`Callback when selection changes`}}},O={name:`Basic`,parameters:{docs:{description:{story:`Basic usage showing 3 storage proxies. Search functionality is enabled by default, and the placeholder is internationalized.`}}},args:{},render:e=>m(f,{mockResolvers:{Query:()=>({storage_volume_list:{items:w}})},children:m(S,{...e,style:{width:`300px`}})})},k={name:`EmptyState`,parameters:{docs:{description:{story:`Shows the component when no storage proxies are configured.`}}},args:{},render:e=>m(f,{mockResolvers:{Query:()=>({storage_volume_list:{items:[]}})},children:m(S,{...e,style:{width:`300px`}})})},A={name:`AutomaticDeduplication`,parameters:{docs:{description:{story:`Demonstrates automatic deduplication when multiple volumes share the same proxy. Only distinct proxy names are shown (3 unique proxies from 6 volumes).`}}},args:{},render:e=>m(f,{mockResolvers:{Query:()=>({storage_volume_list:{items:T}})},children:m(S,{...e,style:{width:`300px`}})})},j={name:`AutoSelectFirstOption`,parameters:{docs:{description:{story:"With `autoSelectOption`, the first proxy is selected automatically once options load and no value is set — used by the SFTP Resource Group settings modal. This requires a controlled `value`/`onChange` pair (as a real consumer, e.g. an antd `Form.Item`, would provide) — `autoSelectOption` only *calls* `onChange`, it does not maintain the selection itself."}}},args:{autoSelectOption:!0},render:e=>{let[t,n]=p();return m(f,{mockResolvers:{Query:()=>({storage_volume_list:{items:w}})},children:m(S,{...e,value:t,onChange:n,style:{width:`300px`}})})}},M={name:`MultipleSelection`,parameters:{docs:{description:{story:'With `mode="multiple"`, users can select several proxies from the existing options (as opposed to `mode="tags"`, which also allows free text entry).'}}},args:{mode:`multiple`,defaultValue:[`local`,`ceph-proxy`]},render:e=>m(f,{mockResolvers:{Query:()=>({storage_volume_list:{items:w}})},children:m(S,{...e,style:{width:`300px`}})})},N={name:`DisabledState`,parameters:{docs:{description:{story:`Shows the component in a disabled state where users cannot interact with it.`}}},args:{disabled:!0},render:e=>m(f,{mockResolvers:{Query:()=>({storage_volume_list:{items:w}})},children:m(S,{...e,style:{width:`300px`}})})},P={name:`ClearButton`,parameters:{docs:{description:{story:`Select with allowClear enabled, allowing users to clear their selection.`}}},args:{allowClear:!0},render:e=>m(f,{mockResolvers:{Query:()=>({storage_volume_list:{items:w}})},children:m(S,{...e,style:{width:`300px`}})})},F={name:`ManyOptions`,parameters:{docs:{description:{story:`Demonstrates the component with 15 storage proxies, showing a scrollable dropdown with search functionality.`}}},args:{allowClear:!0},render:e=>m(f,{mockResolvers:{Query:()=>({storage_volume_list:{items:E}})},children:m(S,{...e,style:{width:`300px`}})})},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
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
}`,...O.parameters?.docs?.source},description:{story:`Basic usage with 3 sample storage proxies.`,...O.parameters?.docs?.description}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
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
}`,...k.parameters?.docs?.source},description:{story:`Empty state when no storage volumes (and thus no proxies) are available.`,...k.parameters?.docs?.description}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
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
}`,...A.parameters?.docs?.source},description:{story:`Automatic deduplication of proxy names derived from multiple volumes.`,...A.parameters?.docs?.description}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
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
}`,...j.parameters?.docs?.source},description:{story:`Auto-select the first proxy once options load.`,...j.parameters?.docs?.description}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
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
}`,...M.parameters?.docs?.source},description:{story:`Multiple selection mode, picking from existing proxy options.`,...M.parameters?.docs?.description}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
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
}`,...N.parameters?.docs?.source},description:{story:`Disabled state of the select.`,...N.parameters?.docs?.description}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
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
}`,...P.parameters?.docs?.source},description:{story:`Select with clear button enabled.`,...P.parameters?.docs?.description}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
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
}`,...F.parameters?.docs?.source},description:{story:`Select with many storage proxies.`,...F.parameters?.docs?.description}}},I=[`Default`,`Empty`,`WithDuplicates`,`AutoSelectFirst`,`MultiSelect`,`Disabled`,`WithClearButton`,`ManyProxies`]})))()}L();export{j as AutoSelectFirst,O as Default,N as Disabled,k as Empty,F as ManyProxies,M as MultiSelect,P as WithClearButton,A as WithDuplicates,I as __namedExportsOrder,D as default};