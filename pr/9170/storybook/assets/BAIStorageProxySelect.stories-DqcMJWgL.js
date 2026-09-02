import{c as ue,a as de,j as o,r as ye}from"./iframe-eSaJPZVV.js";import{R as n}from"./RelayResolver-XVgy7jWB.js";import{B as ge}from"./BAISelect-CqLKtLpc.js";import{r as he}from"./index-S8jGATcg.js";import{u as xe}from"./uniq-CFAgyGU5.js";import{c as Se}from"./compact-CU4PNV0P.js";import{m as b}from"./map-BzpHoQMX.js";import"./preload-helper-Dp1pzeXC.js";import"./index-BsRK5Ak7.js";import"./astryxLabel-VMAuq5ql.js";import"./isString-CoP5Ys4K.js";import"./isEmpty-VUFcS9Nt.js";import"./usePopover-BeQuj46B.js";import"./useDevWarning-Dj3uY-I8.js";import"./rtlStyles-T4i24HtE.js";import"./InputClearButton-Cz502NBp.js";import"./useResolvedRequired-BD_GR8LJ.js";import"./Selector-PB62z3Jj.js";import"./useTypeahead-BcYsKFZI.js";import"./SelectorOption-Cqxn5S1s.js";import"./Item-D3v3XwNI.js";import"./InputGroupContext-NfMMR3b1.js";import"./useIndicator-Qnwoya5Q.js";import"./isRenderable-BUV0eL6r.js";import"./Divider-B1MBNzNh.js";import"./Badge-B0PnJUsY.js";import"./CheckboxInput-BpsAK5XN.js";import"./_baseUniq-CmVeZPf9.js";import"./_baseIndexOf-Be9UPhX8.js";import"./_baseFindIndex-Cj99RmFE.js";import"./noop-DX6rZLP_.js";import"./toString-mthJK0ac.js";import"./isSymbol-BXKDi34p.js";import"./_baseEach-Bj1BRR6m.js";import"./get-BzURJ83v.js";import"./_baseGet-al56Xyf3.js";import"./identity-DKeuBCMA.js";const me=(function(){var t=[{defaultValue:null,kind:"LocalArgument",name:"limit"}],e=[{kind:"Variable",name:"limit",variableName:"limit"},{kind:"Literal",name:"offset",value:0}],a={alias:null,args:null,kind:"ScalarField",name:"proxy",storageKey:null};return{fragment:{argumentDefinitions:t,kind:"Fragment",metadata:null,name:"BAIStorageProxySelectQuery",selections:[{alias:null,args:e,concreteType:"StorageVolumeList",kind:"LinkedField",name:"storage_volume_list",plural:!1,selections:[{alias:null,args:null,concreteType:"StorageVolume",kind:"LinkedField",name:"items",plural:!0,selections:[a],storageKey:null}],storageKey:null}],type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:t,kind:"Operation",name:"BAIStorageProxySelectQuery",selections:[{alias:null,args:e,concreteType:"StorageVolumeList",kind:"LinkedField",name:"storage_volume_list",plural:!1,selections:[{alias:null,args:null,concreteType:"StorageVolume",kind:"LinkedField",name:"items",plural:!0,selections:[a,{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null}],storageKey:null}],storageKey:null}]},params:{cacheID:"b18d8c964bbf7af60d564f4fa0f82338",id:null,metadata:{},name:"BAIStorageProxySelectQuery",operationKind:"query",text:`query BAIStorageProxySelectQuery(
  $limit: Int!
) {
  storage_volume_list(limit: $limit, offset: 0) {
    items {
      proxy
      id
    }
  }
}
`}}})();me.hash="e0ada7211322acef77d2fdb321215b0b";const ve=1e3,s=t=>{"use memo";const e=ue.c(13),{t:a}=de();let v,f,w;e[0]===Symbol.for("react.memo_cache_sentinel")?(v=me,f={limit:ve},w={},e[0]=v,e[1]=f,e[2]=w):(v=e[0],f=e[1],w=e[2]);const{storage_volume_list:r}=he.useLazyLoadQuery(v,f,w);let l,i;if(e[3]!==(r==null?void 0:r.items)){const pe=xe(Se(b(r==null?void 0:r.items,fe)));l=ge,i=b(pe,we),e[3]=r==null?void 0:r.items,e[4]=l,e[5]=i}else l=e[4],i=e[5];let c;e[6]!==a?(c=a("comp:BAIStorageProxySelect.SelectStorageProxy"),e[6]=a,e[7]=c):c=e[7];let R;return e[8]!==l||e[9]!==t||e[10]!==i||e[11]!==c?(R=o.jsx(l,{options:i,showSearch:!0,placeholder:c,...t}),e[8]=l,e[9]=t,e[10]=i,e[11]=c,e[12]=R):R=e[12],R};function fe(t){return t==null?void 0:t.proxy}function we(t){return{label:t,value:t}}const S=[{proxy:"local"},{proxy:"ceph-proxy"},{proxy:"pure-proxy"}],Re=[{proxy:"local"},{proxy:"local"},{proxy:"ceph-proxy"},{proxy:"ceph-proxy"},{proxy:"pure-proxy"},{proxy:"local"}],be=Array.from({length:15},(t,e)=>({proxy:`proxy-${e+1}`})),lt={title:"Fragments/BAIStorageProxySelect",component:s,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:`
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
        `}}},argTypes:{placeholder:{control:{type:"text"},description:"Placeholder text when no value is selected",table:{type:{summary:"string"},defaultValue:{summary:"i18n: comp:BAIStorageProxySelect.SelectStorageProxy"}}},autoSelectOption:{control:{type:"boolean"},description:"Auto-select the first option once options load and no value is set",table:{type:{summary:"boolean | ((options) => value)"},defaultValue:{summary:"undefined"}}},disabled:{control:{type:"boolean"},description:"Whether the select is disabled",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},allowClear:{control:{type:"boolean"},description:"Show clear button",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},onChange:{action:"changed",description:"Callback when selection changes"}}},m={name:"Basic",parameters:{docs:{description:{story:"Basic usage showing 3 storage proxies. Search functionality is enabled by default, and the placeholder is internationalized."}}},args:{},render:t=>o.jsx(n,{mockResolvers:{Query:()=>({storage_volume_list:{items:S}})},children:o.jsx(s,{...t,style:{width:"300px"}})})},p={name:"EmptyState",parameters:{docs:{description:{story:"Shows the component when no storage proxies are configured."}}},args:{},render:t=>o.jsx(n,{mockResolvers:{Query:()=>({storage_volume_list:{items:[]}})},children:o.jsx(s,{...t,style:{width:"300px"}})})},u={name:"AutomaticDeduplication",parameters:{docs:{description:{story:"Demonstrates automatic deduplication when multiple volumes share the same proxy. Only distinct proxy names are shown (3 unique proxies from 6 volumes)."}}},args:{},render:t=>o.jsx(n,{mockResolvers:{Query:()=>({storage_volume_list:{items:Re}})},children:o.jsx(s,{...t,style:{width:"300px"}})})},d={name:"AutoSelectFirstOption",parameters:{docs:{description:{story:"With `autoSelectOption`, the first proxy is selected automatically once options load and no value is set — used by the SFTP Resource Group settings modal. This requires a controlled `value`/`onChange` pair (as a real consumer, e.g. an antd `Form.Item`, would provide) — `autoSelectOption` only *calls* `onChange`, it does not maintain the selection itself."}}},args:{autoSelectOption:!0},render:t=>{const[e,a]=ye.useState();return o.jsx(n,{mockResolvers:{Query:()=>({storage_volume_list:{items:S}})},children:o.jsx(s,{...t,value:e,onChange:a,style:{width:"300px"}})})}},y={name:"MultipleSelection",parameters:{docs:{description:{story:'With `mode="multiple"`, users can select several proxies from the existing options (as opposed to `mode="tags"`, which also allows free text entry).'}}},args:{mode:"multiple",defaultValue:["local","ceph-proxy"]},render:t=>o.jsx(n,{mockResolvers:{Query:()=>({storage_volume_list:{items:S}})},children:o.jsx(s,{...t,style:{width:"300px"}})})},g={name:"DisabledState",parameters:{docs:{description:{story:"Shows the component in a disabled state where users cannot interact with it."}}},args:{disabled:!0},render:t=>o.jsx(n,{mockResolvers:{Query:()=>({storage_volume_list:{items:S}})},children:o.jsx(s,{...t,style:{width:"300px"}})})},h={name:"ClearButton",parameters:{docs:{description:{story:"Select with allowClear enabled, allowing users to clear their selection."}}},args:{allowClear:!0},render:t=>o.jsx(n,{mockResolvers:{Query:()=>({storage_volume_list:{items:S}})},children:o.jsx(s,{...t,style:{width:"300px"}})})},x={name:"ManyOptions",parameters:{docs:{description:{story:"Demonstrates the component with 15 storage proxies, showing a scrollable dropdown with search functionality."}}},args:{allowClear:!0},render:t=>o.jsx(n,{mockResolvers:{Query:()=>({storage_volume_list:{items:be}})},children:o.jsx(s,{...t,style:{width:"300px"}})})};var _,A,B,k,I;m.parameters={...m.parameters,docs:{...(_=m.parameters)==null?void 0:_.docs,source:{originalSource:`{
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
}`,...(B=(A=m.parameters)==null?void 0:A.docs)==null?void 0:B.source},description:{story:"Basic usage with 3 sample storage proxies.",...(I=(k=m.parameters)==null?void 0:k.docs)==null?void 0:I.description}}};var P,Q,V,C,D;p.parameters={...p.parameters,docs:{...(P=p.parameters)==null?void 0:P.docs,source:{originalSource:`{
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
}`,...(V=(Q=p.parameters)==null?void 0:Q.docs)==null?void 0:V.source},description:{story:"Empty state when no storage volumes (and thus no proxies) are available.",...(D=(C=p.parameters)==null?void 0:C.docs)==null?void 0:D.description}}};var F,j,O,L,T;u.parameters={...u.parameters,docs:{...(F=u.parameters)==null?void 0:F.docs,source:{originalSource:`{
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
}`,...(O=(j=u.parameters)==null?void 0:j.docs)==null?void 0:O.source},description:{story:"Automatic deduplication of proxy names derived from multiple volumes.",...(T=(L=u.parameters)==null?void 0:L.docs)==null?void 0:T.description}}};var M,q,E,W,K;d.parameters={...d.parameters,docs:{...(M=d.parameters)==null?void 0:M.docs,source:{originalSource:`{
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
}`,...(E=(q=d.parameters)==null?void 0:q.docs)==null?void 0:E.source},description:{story:"Auto-select the first proxy once options load.",...(K=(W=d.parameters)==null?void 0:W.docs)==null?void 0:K.description}}};var $,z,G,U,H;y.parameters={...y.parameters,docs:{...($=y.parameters)==null?void 0:$.docs,source:{originalSource:`{
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
}`,...(G=(z=y.parameters)==null?void 0:z.docs)==null?void 0:G.source},description:{story:"Multiple selection mode, picking from existing proxy options.",...(H=(U=y.parameters)==null?void 0:U.docs)==null?void 0:H.description}}};var N,J,X,Y,Z;g.parameters={...g.parameters,docs:{...(N=g.parameters)==null?void 0:N.docs,source:{originalSource:`{
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
}`,...(X=(J=g.parameters)==null?void 0:J.docs)==null?void 0:X.source},description:{story:"Disabled state of the select.",...(Z=(Y=g.parameters)==null?void 0:Y.docs)==null?void 0:Z.description}}};var ee,te,oe,re,se;h.parameters={...h.parameters,docs:{...(ee=h.parameters)==null?void 0:ee.docs,source:{originalSource:`{
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
}`,...(oe=(te=h.parameters)==null?void 0:te.docs)==null?void 0:oe.source},description:{story:"Select with clear button enabled.",...(se=(re=h.parameters)==null?void 0:re.docs)==null?void 0:se.description}}};var ae,ne,le,ie,ce;x.parameters={...x.parameters,docs:{...(ae=x.parameters)==null?void 0:ae.docs,source:{originalSource:`{
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
}`,...(le=(ne=x.parameters)==null?void 0:ne.docs)==null?void 0:le.source},description:{story:"Select with many storage proxies.",...(ce=(ie=x.parameters)==null?void 0:ie.docs)==null?void 0:ce.description}}};const it=["Default","Empty","WithDuplicates","AutoSelectFirst","MultiSelect","Disabled","WithClearButton","ManyProxies"];export{d as AutoSelectFirst,m as Default,g as Disabled,p as Empty,x as ManyProxies,y as MultiSelect,h as WithClearButton,u as WithDuplicates,it as __namedExportsOrder,lt as default};
