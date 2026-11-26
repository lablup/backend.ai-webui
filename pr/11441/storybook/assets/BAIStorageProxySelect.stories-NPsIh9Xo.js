import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t,t as n}from"./compact-C9OPbfhP.js";import{n as r,t as i}from"./map-IIuwj5IU.js";import{n as a,t as o}from"./uniq-D-1D18qO.js";import{t as s}from"./jsx-runtime-MKhVqBIO.js";import{n as c,t as l}from"./useBAIi18n-CXS6vCcL.js";import{t as u}from"./compiler-runtime-DU4U6aph.js";import{t as d}from"./react-relay-CDKBZFrB.js";import{n as f,t as p}from"./MultiSelector-B9j76nji.js";import{n as m,t as h}from"./RelayResolver-BK8h-MjU.js";var g;function _(){return(_=e((()=>{g=(function(){var e=[{defaultValue:null,kind:`LocalArgument`,name:`limit`}],t=[{kind:`Variable`,name:`limit`,variableName:`limit`},{kind:`Literal`,name:`offset`,value:0}],n={alias:null,args:null,kind:`ScalarField`,name:`proxy`,storageKey:null};return{fragment:{argumentDefinitions:e,kind:`Fragment`,metadata:null,name:`BAIStorageProxySelectQuery`,selections:[{alias:null,args:t,concreteType:`StorageVolumeList`,kind:`LinkedField`,name:`storage_volume_list`,plural:!1,selections:[{alias:null,args:null,concreteType:`StorageVolume`,kind:`LinkedField`,name:`items`,plural:!0,selections:[n],storageKey:null}],storageKey:null}],type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:e,kind:`Operation`,name:`BAIStorageProxySelectQuery`,selections:[{alias:null,args:t,concreteType:`StorageVolumeList`,kind:`LinkedField`,name:`storage_volume_list`,plural:!1,selections:[{alias:null,args:null,concreteType:`StorageVolume`,kind:`LinkedField`,name:`items`,plural:!0,selections:[n,{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null}],storageKey:null}],storageKey:null}]},params:{cacheID:`b18d8c964bbf7af60d564f4fa0f82338`,id:null,metadata:{},name:`BAIStorageProxySelectQuery`,operationKind:`query`,text:`query BAIStorageProxySelectQuery(
  $limit: Int!
) {
  storage_volume_list(limit: $limit, offset: 0) {
    items {
      proxy
      id
    }
  }
}
`}}})(),g.hash=`e0ada7211322acef77d2fdb321215b0b`})))()}function v(e){return e?.proxy}function y(e){return{label:e,value:e}}var b,x,S,C,w;function T(){return(T=e((()=>{_(),b=u(),l(),p(),o(),t(),i(),x=d(),S=s(),C=1e3,w=e=>{"use memo";let t=(0,b.c)(14),{t:i}=c(),o,s;t[0]===Symbol.for(`react.memo_cache_sentinel`)?(o={limit:C},s={},t[0]=o,t[1]=s):(o=t[0],s=t[1]);let{storage_volume_list:l}=(0,x.useLazyLoadQuery)(g,o,s),u,d,p;if(t[2]!==l?.items){let e=a(n(r(l?.items,v)));u=f,d=!0,p=r(e,y),t[2]=l?.items,t[3]=u,t[4]=d,t[5]=p}else u=t[3],d=t[4],p=t[5];let m;t[6]===i?m=t[7]:(m=i(`comp:BAIStorageProxySelect.SelectStorageProxy`),t[6]=i,t[7]=m);let h;return t[8]!==u||t[9]!==e||t[10]!==d||t[11]!==p||t[12]!==m?(h=(0,S.jsx)(u,{hasSearch:d,options:p,placeholder:m,...e}),t[8]=u,t[9]=e,t[10]=d,t[11]=p,t[12]=m,t[13]=h):h=t[13],h}})))()}var E,D,O,k,A,j,M,N,P,F,I,L,R;function z(){return(z=e((()=>{m(),T(),E=s(),D=[{proxy:`local`},{proxy:`ceph-proxy`},{proxy:`pure-proxy`}],O=[{proxy:`local`},{proxy:`local`},{proxy:`ceph-proxy`},{proxy:`ceph-proxy`},{proxy:`pure-proxy`},{proxy:`local`}],k=Array.from({length:15},(e,t)=>({proxy:`proxy-${t+1}`})),A={title:`Fragments/BAIStorageProxySelect`,component:w,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`
**BAIStorageProxySelect** is a [BAIMultiSelector](/?path=/docs/select-baimultiselector--docs) that fetches storage volumes and presents the distinct storage-proxy names. Its value is \`string[]\`.

## Features
- Fetches volumes from GraphQL query \`BAIStorageProxySelectQuery\` and derives distinct proxy names
- Automatically removes duplicate proxy names using \`_.uniq\` + \`_.compact\`
- Search on by default (\`hasSearch\`)
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
  hasClear
  onChange={(values) => setProxies(values)}
/>
\`\`\`

Every other BAIMultiSelector prop except \`options\` passes through; see [BAIMultiSelector](/?path=/docs/select-baimultiselector--docs).
        `}}},argTypes:{placeholder:{control:{type:`text`},description:`Placeholder text when no value is selected`,table:{type:{summary:`string`},defaultValue:{summary:`i18n: comp:BAIStorageProxySelect.SelectStorageProxy`}}},disabled:{control:{type:`boolean`},description:`Whether the select is disabled`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},hasClear:{control:{type:`boolean`},description:`Show clear button`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},hasSearch:{control:{type:`boolean`},description:`The search field in the listbox`,table:{type:{summary:`boolean`},defaultValue:{summary:`true`}}},onChange:{action:`changed`,description:`Callback with the selected proxy names`}}},j={name:`Basic`,parameters:{docs:{description:{story:`Basic usage showing 3 storage proxies. Search functionality is enabled by default, and the placeholder is internationalized.`}}},args:{},render:e=>(0,E.jsx)(h,{mockResolvers:{Query:()=>({storage_volume_list:{items:D}})},children:(0,E.jsx)(w,{...e,width:300})})},M={name:`EmptyState`,parameters:{docs:{description:{story:`Shows the component when no storage proxies are configured.`}}},args:{},render:e=>(0,E.jsx)(h,{mockResolvers:{Query:()=>({storage_volume_list:{items:[]}})},children:(0,E.jsx)(w,{...e,width:300})})},N={name:`AutomaticDeduplication`,parameters:{docs:{description:{story:`Demonstrates automatic deduplication when multiple volumes share the same proxy. Only distinct proxy names are shown (3 unique proxies from 6 volumes).`}}},args:{},render:e=>(0,E.jsx)(h,{mockResolvers:{Query:()=>({storage_volume_list:{items:O}})},children:(0,E.jsx)(w,{...e,width:300})})},P={name:`MultipleSelection`,parameters:{docs:{description:{story:`Users select several proxies from the existing options; the trigger names the selected proxies and the value is a list of their names.`}}},args:{defaultValue:[`local`,`ceph-proxy`]},render:e=>(0,E.jsx)(h,{mockResolvers:{Query:()=>({storage_volume_list:{items:D}})},children:(0,E.jsx)(w,{...e,width:300})})},F={name:`DisabledState`,parameters:{docs:{description:{story:`Shows the component in a disabled state where users cannot interact with it.`}}},args:{disabled:!0},render:e=>(0,E.jsx)(h,{mockResolvers:{Query:()=>({storage_volume_list:{items:D}})},children:(0,E.jsx)(w,{...e,width:300})})},I={name:`ClearButton`,parameters:{docs:{description:{story:`Select with hasClear enabled, allowing users to clear their selection.`}}},args:{hasClear:!0},render:e=>(0,E.jsx)(h,{mockResolvers:{Query:()=>({storage_volume_list:{items:D}})},children:(0,E.jsx)(w,{...e,width:300})})},L={name:`ManyOptions`,parameters:{docs:{description:{story:`Demonstrates the component with 15 storage proxies, showing a scrollable dropdown with search functionality.`}}},args:{hasClear:!0},render:e=>(0,E.jsx)(h,{mockResolvers:{Query:()=>({storage_volume_list:{items:k}})},children:(0,E.jsx)(w,{...e,width:300})})},R=[`Default`,`Empty`,`WithDuplicates`,`MultiSelect`,`Disabled`,`WithClearButton`,`ManyProxies`],j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
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
      <BAIStorageProxySelect {...args} width={300} />
    </RelayResolver>
}`,...j.parameters?.docs?.source},description:{story:`Basic usage with 3 sample storage proxies.`,...j.parameters?.docs?.description}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
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
      <BAIStorageProxySelect {...args} width={300} />
    </RelayResolver>
}`,...M.parameters?.docs?.source},description:{story:`Empty state when no storage volumes (and thus no proxies) are available.`,...M.parameters?.docs?.description}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
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
      <BAIStorageProxySelect {...args} width={300} />
    </RelayResolver>
}`,...N.parameters?.docs?.source},description:{story:`Automatic deduplication of proxy names derived from multiple volumes.`,...N.parameters?.docs?.description}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  name: 'MultipleSelection',
  parameters: {
    docs: {
      description: {
        story: 'Users select several proxies from the existing options; the trigger names the selected proxies and the value is a list of their names.'
      }
    }
  },
  args: {
    defaultValue: ['local', 'ceph-proxy']
  },
  render: args => <RelayResolver mockResolvers={{
    Query: () => ({
      storage_volume_list: {
        items: sampleVolumes
      }
    })
  }}>
      <BAIStorageProxySelect {...args} width={300} />
    </RelayResolver>
}`,...P.parameters?.docs?.source},description:{story:`Several proxies selected at once, picking from existing proxy options.`,...P.parameters?.docs?.description}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
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
      <BAIStorageProxySelect {...args} width={300} />
    </RelayResolver>
}`,...F.parameters?.docs?.source},description:{story:`Disabled state of the select.`,...F.parameters?.docs?.description}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  name: 'ClearButton',
  parameters: {
    docs: {
      description: {
        story: 'Select with hasClear enabled, allowing users to clear their selection.'
      }
    }
  },
  args: {
    hasClear: true
  },
  render: args => <RelayResolver mockResolvers={{
    Query: () => ({
      storage_volume_list: {
        items: sampleVolumes
      }
    })
  }}>
      <BAIStorageProxySelect {...args} width={300} />
    </RelayResolver>
}`,...I.parameters?.docs?.source},description:{story:`Select with clear button enabled.`,...I.parameters?.docs?.description}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  name: 'ManyOptions',
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the component with 15 storage proxies, showing a scrollable dropdown with search functionality.'
      }
    }
  },
  args: {
    hasClear: true
  },
  render: args => <RelayResolver mockResolvers={{
    Query: () => ({
      storage_volume_list: {
        items: sampleManyVolumes
      }
    })
  }}>
      <BAIStorageProxySelect {...args} width={300} />
    </RelayResolver>
}`,...L.parameters?.docs?.source},description:{story:`Select with many storage proxies.`,...L.parameters?.docs?.description}}}})))()}z();export{j as Default,F as Disabled,M as Empty,L as ManyProxies,P as MultiSelect,I as WithClearButton,N as WithDuplicates,R as __namedExportsOrder,A as default};