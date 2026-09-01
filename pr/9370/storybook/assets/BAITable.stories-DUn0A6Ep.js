import{j as a,r as w}from"./iframe-C4hJf4CE.js";import{B as ee}from"./BAITag-BPphxYtF.js";import{B as s}from"./BAITable-CVqUdvh6.js";import"./preload-helper-Dp1pzeXC.js";import"./astryxTagVariant-CPCr7vTB.js";import"./Token-43K-r68i.js";import"./composeEventHandlers-BolWE7qY.js";import"./Badge-CB__m4tQ.js";import"./BAIButton-DMfPDtkP.js";import"./astryxLabel-CJkN2LOf.js";import"./BAIUnmountAfterClose-BS5oVSBf.js";import"./map-DhSRSGh8.js";import"./toString-9rc3hb-x.js";import"./isSymbol-kh7jKqEz.js";import"./_baseEach-BTi2Qs_x.js";import"./get-Cq2ZNdxH.js";import"./_baseGet-BNSAl3dw.js";import"./identity-DKeuBCMA.js";import"./forEach-CIr-Arqd.js";import"./_arrayEach-DpGxo2Of.js";import"./_castFunction-a6W-o7Lo.js";import"./filter-Cw5lxnGM.js";import"./isEmpty-BFFsagb_.js";import"./TextInput-D_bzC6wl.js";import"./InputGroupContext-Cs9mRzxQ.js";import"./useResolvedRequired-If7smKRn.js";import"./useInputStatusIcon-Be58_QeT.js";import"./InputClearButton-D1gCpyrR.js";import"./useDevWarning-CYe7Wx_E.js";import"./CheckboxInput-BZ8UlAKi.js";import"./useIndicator-B_8OAC3y.js";import"./isRenderable-BUV0eL6r.js";import"./VStack-DPZ16Ccp.js";import"./uniq-Dbd4n74-.js";import"./_baseUniq-D71EhqEf.js";import"./_baseIndexOf-Be9UPhX8.js";import"./_baseFindIndex-Cj99RmFE.js";import"./noop-DX6rZLP_.js";import"./flatMap-BCNIvge_.js";import"./_baseFlatten-HoBskRqx.js";import"./includes-1xMtaDd2.js";import"./isString-NdX3-S9N.js";import"./toInteger-Bsbk3djy.js";import"./toFinite-B68ZqJ0A.js";import"./_trimmedEndIndex-DuQxD0U0.js";import"./toLower-DVoigPAP.js";import"./_baseAssignValue-D1LXsUrI.js";import"./_defineProperty-Bs2cKAwY.js";import"./negate-CgKyvzXE.js";import"./sortBy-DOPfQokU.js";import"./_overRest-DX6xrhmu.js";import"./_isIterateeCall-DKrihkv0.js";import"./some-X9r7Grab.js";import"./useControllableValue-Cins-RpU.js";import"./find-Dy7OLZZE.js";import"./clamp-DgBiIQxM.js";import"./_baseClamp-DVUOCJN_.js";import"./characters-DWaYg7k3.js";import"./renderDropdownItems-CjLUQdh0.js";import"./Item-CRq6KEn-.js";import"./Divider-ClZl7If0.js";import"./useListFocus-Bc9oHZFP.js";import"./isRtlElement-B2-7SF8s.js";import"./useMenuHover-DGoojbtz.js";import"./useTypeahead-CMx5ZOES.js";import"./EmptyState-V-IRSiEY.js";import"./Selector-BXu0Keys.js";import"./usePopover-B3W6iJi2.js";import"./rtlStyles-T4i24HtE.js";import"./SelectorOption-Oe-sJ6mc.js";import"./NumberInput-D5yCReNl.js";import"./settings-RClYQaGX.js";import"./compact-CU4PNV0P.js";const vt={title:"Table/BAITable",component:s,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:"\n**BAITable** renders through Astryx instead of the retired antd engine, keeping the same public contract:\n\n- **Column visibility** via `tableSettings` (Astryx `Dialog` settings modal, not the antd one)\n- **Resizable columns** — drag-to-resize, persisted into `columnOverrides[key].width`\n- **Sorting** via `order`/`onChangeOrder` order strings\n- **Pagination** — a custom bottom bar (not antd's pager). Client-side data is sliced here; a `total` larger than `dataSource` means the caller already sliced server-side (FR-3563)\n\n- **Horizontal scroll** via antd-shaped `scroll={{ x }}` — width-less columns take their content's intrinsic width (FR-3500)\n- **Vertical scroll** via `scroll={{ y }}` — the body is capped at `y` and the header row sticks (FR-3500)\n\n## Dropped vs BAITable (see ticket 25 \"Feature matrix\" for the full list)\n- `loading` dims rows but shows no spinner\n- `scroll.y`'s sticky header loses its bottom rule while scrolled (a collapsed-border rule cannot travel with a sticky cell)\n- Column groups (`columns[].children`) are flattened, not spanned\n- Row virtualization (deferred, explicit product decision)\n        "}}},argTypes:{loading:{control:{type:"boolean"},description:"Dims the rows while a refetch is in flight (no spinner)"},size:{control:{type:"select"},options:["small","middle","large"],description:"Row density, mapped to Astryx `density`"},resizable:{control:{type:"boolean"},description:"Enable column resizing by dragging column borders"},bordered:{control:{type:"boolean"},description:'Grid dividers between cells (-> Astryx `dividers="grid"`)'},order:{control:{type:"text"},description:'Sort order string (e.g. "name" ascending, "-name" descending)'},scroll:{control:{type:"object"},description:"antd-shaped `{ x?, y? }` — `x` sizes the table from its content, `y` caps the body height with a sticky header"}}},o=[{title:"Name",dataIndex:"name",key:"name",sorter:!0,width:150,required:!0},{title:"Age",dataIndex:"age",key:"age",sorter:!0,width:80},{title:"Status",dataIndex:"status",key:"status",render:e=>{const t={active:"green",inactive:"red",pending:"orange"};return a.jsx(ee,{color:t[e],children:e})},width:100},{title:"Department",dataIndex:"department",key:"department",defaultHidden:!0,width:120},{title:"Email",dataIndex:"email",key:"email",defaultHidden:!0,width:220}],n=[{key:"1",name:"John Brown",age:32,email:"john.brown@example.com",status:"active",department:"Engineering"},{key:"2",name:"Jim Green",age:42,email:"jim.green@example.com",status:"inactive",department:"Marketing"},{key:"3",name:"Joe Black",age:28,email:"joe.black@example.com",status:"pending",department:"Sales"},{key:"4",name:"Alice Johnson",age:35,email:"alice.johnson@example.com",status:"active",department:"HR"},{key:"5",name:"Bob Smith",age:29,email:"bob.smith@example.com",status:"active",department:"Engineering"}],Y=[{title:"Name",dataIndex:"name",key:"name",width:120,fixed:"left"},{title:"Allocation",dataIndex:"allocation",key:"allocation"},{title:"Usage",dataIndex:"usage",key:"usage"},{title:"Status",dataIndex:"status",key:"status"}],S=[{key:"a1",name:"agent-node-with-a-deliberately-long-name-01",allocation:"CPU 126.9 / 128 cores · MEM 972.3 / 1024 GiB",usage:"CPU 87% (111.4 cores) · MEM 63% (645.1 GiB) · GPU 4/8 (fGPU 3.5)",status:"ALIVE (schedulable)"},{key:"a2",name:"agent-node-02",allocation:"CPU 12 / 64 cores · MEM 96 / 512 GiB",usage:"CPU 12% (7.7 cores) · MEM 18% (92.2 GiB) · GPU 0/4 (fGPU 0)",status:"ALIVE (schedulable)"}],x=Array.from({length:15},(e,t)=>({...S[t%S.length],key:`n${t+1}`})),i={name:"Basic Table",parameters:{docs:{description:{story:"Basic table with sample data. `department` and `email` are hidden by default (`defaultHidden: true`) — open the settings gear to reveal them."}}},args:{columns:o,dataSource:n,pagination:{total:n.length,pageSize:10}}},Z=(e,t)=>Array.from({length:e},(r,b)=>({...n[b%n.length],key:`${t}${b+1}`,name:`Person ${b+1}`})),te=Z(42,"p"),l={name:"Client-side Pagination",parameters:{docs:{description:{story:"A whole list handed over at once, with no `total`: the table slices it and the pager walks all 42 rows. Passing a `total` larger than `dataSource` instead declares the rows already server-sliced, and the table leaves them alone (FR-3563)."}}},args:{columns:o,dataSource:te,pagination:{pageSize:10}}},v=Z(177,"s"),c={name:"Invalid Page Number",parameters:{docs:{description:{story:'A server-sliced page past the last one: the caller holds page 20 of a 177-row result set and the server returned nothing. Instead of "No data to display", the body offers a way back; "Go to first page" resets the caller\'s page through `pagination.onChange`, which is what refetches (FR-3703).'}}},render:()=>{const[e,t]=w.useState(20),r=10;return a.jsx(s,{columns:o,dataSource:v.slice((e-1)*r,e*r),pagination:{current:e,pageSize:r,total:v.length,onChange:t}})}},d={name:"Horizontal Scroll (scroll.x)",parameters:{docs:{description:{story:"antd-shaped `scroll={{ x: 'max-content' }}` inside a 560px container: width-less columns (Allocation / Usage / Status) take their content's intrinsic width and the table scrolls horizontally; the pixel-width `Name` column stays 120px and still truncates. Without `scroll.x` the same table squeezes every column into the container and clips the labels (FR-3500)."}}},render:()=>a.jsx("div",{style:{width:560},children:a.jsx(s,{scroll:{x:"max-content"},columns:Y,dataSource:S,pagination:{total:S.length,pageSize:10}})})},m={name:"Vertical Scroll (scroll.y)",parameters:{docs:{description:{story:"`scroll={{ x: 'max-content', y: 240 }}` — the shape an `x`+`y` call site passes. `y` caps the scroll container at 240px and sticks the header row over an opaque base, so all 15 rows render inside a fixed-height body instead of growing the page. Both axes scroll in the same container: the `Name` column stays pinned while scrolling sideways, and its header stays put while scrolling down."}}},render:()=>a.jsx("div",{style:{width:560},children:a.jsx(s,{scroll:{x:"max-content",y:240},columns:Y,dataSource:x,pagination:{total:x.length,pageSize:20}})})},p={name:"Column Visibility Settings",parameters:{docs:{description:{story:"Table with `tableSettings` wired to local state. Click the gear icon to open the Astryx settings dialog and toggle column visibility."}}},render:()=>{const[e,t]=w.useState({});return a.jsx(s,{columns:o,dataSource:n,resizable:!0,tableSettings:{columnOverrides:e,onColumnOverridesChange:t},pagination:{total:n.length,pageSize:10}})}},g={name:"Sortable Columns",parameters:{docs:{description:{story:'Uses `order`/`onChangeOrder` order strings (e.g. `"name"`, `"-age"`) instead of an antd sorter object.'}}},render:()=>{const[e,t]=w.useState("name");return a.jsx(s,{columns:o,dataSource:n,order:e,onChangeOrder:r=>t(r??null),pagination:!1})}},u={parameters:{docs:{description:{story:"Checkbox row selection, same `rowSelection` shape as antd."}}},render:()=>{const[e,t]=w.useState([]);return a.jsx(s,{columns:o,dataSource:n,rowKey:"key",rowSelection:{selectedRowKeys:e,onChange:r=>t([...r])},pagination:!1})}},h={name:"Loading State",parameters:{docs:{description:{story:"Rows dim while `loading` is true. Unlike antd there is no centred spinner (ticket 25 PILOT-DECISION 4)."}}},args:{columns:o,dataSource:n,loading:!0,pagination:!1}},y={parameters:{docs:{description:{story:"No rows — renders the empty state in place of the body."}}},args:{columns:o,dataSource:[],pagination:!1}};var f,C,k;i.parameters={...i.parameters,docs:{...(f=i.parameters)==null?void 0:f.docs,source:{originalSource:`{
  name: 'Basic Table',
  parameters: {
    docs: {
      description: {
        story: 'Basic table with sample data. \`department\` and \`email\` are hidden by default (\`defaultHidden: true\`) — open the settings gear to reveal them.'
      }
    }
  },
  args: {
    columns: sampleColumns,
    dataSource: sampleData,
    pagination: {
      total: sampleData.length,
      pageSize: 10
    }
  }
}`,...(k=(C=i.parameters)==null?void 0:C.docs)==null?void 0:k.source}}};var I,z,A;l.parameters={...l.parameters,docs:{...(I=l.parameters)==null?void 0:I.docs,source:{originalSource:`{
  name: 'Client-side Pagination',
  parameters: {
    docs: {
      description: {
        story: 'A whole list handed over at once, with no \`total\`: the table slices it and the pager walks all 42 rows. Passing a \`total\` larger than \`dataSource\` instead declares the rows already server-sliced, and the table leaves them alone (FR-3563).'
      }
    }
  },
  args: {
    columns: sampleColumns,
    dataSource: clientPagedData,
    pagination: {
      pageSize: 10
    }
  }
}`,...(A=(z=l.parameters)==null?void 0:z.docs)==null?void 0:A.source}}};var P,B,D;c.parameters={...c.parameters,docs:{...(P=c.parameters)==null?void 0:P.docs,source:{originalSource:`{
  name: 'Invalid Page Number',
  parameters: {
    docs: {
      description: {
        story: 'A server-sliced page past the last one: the caller holds page 20 of a 177-row result set and the server returned nothing. Instead of "No data to display", the body offers a way back; "Go to first page" resets the caller\\'s page through \`pagination.onChange\`, which is what refetches (FR-3703).'
      }
    }
  },
  render: () => {
    const [page, setPage] = useState(20);
    const pageSize = 10;
    return <BAITable columns={sampleColumns} dataSource={serverPagedData.slice((page - 1) * pageSize, page * pageSize)} pagination={{
      current: page,
      pageSize,
      total: serverPagedData.length,
      onChange: setPage
    }} />;
  }
}`,...(D=(B=c.parameters)==null?void 0:B.docs)==null?void 0:D.source}}};var R,O,T;d.parameters={...d.parameters,docs:{...(R=d.parameters)==null?void 0:R.docs,source:{originalSource:`{
  name: 'Horizontal Scroll (scroll.x)',
  parameters: {
    docs: {
      description: {
        story: "antd-shaped \`scroll={{ x: 'max-content' }}\` inside a 560px container: width-less columns (Allocation / Usage / Status) take their content's intrinsic width and the table scrolls horizontally; the pixel-width \`Name\` column stays 120px and still truncates. Without \`scroll.x\` the same table squeezes every column into the container and clips the labels (FR-3500)."
      }
    }
  },
  render: () => <div style={{
    width: 560
  }}>
      <BAITable scroll={{
      x: 'max-content'
    }} columns={scrollColumns} dataSource={scrollData} pagination={{
      total: scrollData.length,
      pageSize: 10
    }} />
    </div>
}`,...(T=(O=d.parameters)==null?void 0:O.docs)==null?void 0:T.source}}};var j,E,U;m.parameters={...m.parameters,docs:{...(j=m.parameters)==null?void 0:j.docs,source:{originalSource:`{
  name: 'Vertical Scroll (scroll.y)',
  parameters: {
    docs: {
      description: {
        story: "\`scroll={{ x: 'max-content', y: 240 }}\` — the shape an \`x\`+\`y\` call site passes. \`y\` caps the scroll container at 240px and sticks the header row over an opaque base, so all 15 rows render inside a fixed-height body instead of growing the page. Both axes scroll in the same container: the \`Name\` column stays pinned while scrolling sideways, and its header stays put while scrolling down."
      }
    }
  },
  render: () => <div style={{
    width: 560
  }}>
      <BAITable scroll={{
      x: 'max-content',
      y: 240
    }} columns={scrollColumns} dataSource={verticalScrollData} pagination={{
      total: verticalScrollData.length,
      pageSize: 20
    }} />
    </div>
}`,...(U=(E=m.parameters)==null?void 0:E.docs)==null?void 0:U.source}}};var N,G,F;p.parameters={...p.parameters,docs:{...(N=p.parameters)==null?void 0:N.docs,source:{originalSource:`{
  name: 'Column Visibility Settings',
  parameters: {
    docs: {
      description: {
        story: 'Table with \`tableSettings\` wired to local state. Click the gear icon to open the Astryx settings dialog and toggle column visibility.'
      }
    }
  },
  render: () => {
    const [columnOverrides, setColumnOverrides] = useState<Record<string, BAITableColumnOverrideItem>>({});
    return <BAITable columns={sampleColumns} dataSource={sampleData} resizable tableSettings={{
      columnOverrides,
      onColumnOverridesChange: setColumnOverrides
    }} pagination={{
      total: sampleData.length,
      pageSize: 10
    }} />;
  }
}`,...(F=(G=p.parameters)==null?void 0:G.docs)==null?void 0:F.source}}};var H,K,M;g.parameters={...g.parameters,docs:{...(H=g.parameters)==null?void 0:H.docs,source:{originalSource:`{
  name: 'Sortable Columns',
  parameters: {
    docs: {
      description: {
        story: 'Uses \`order\`/\`onChangeOrder\` order strings (e.g. \`"name"\`, \`"-age"\`) instead of an antd sorter object.'
      }
    }
  },
  render: () => {
    const [order, setOrder] = useState<string | null>('name');
    return <BAITable columns={sampleColumns} dataSource={sampleData} order={order} onChangeOrder={next => setOrder(next ?? null)} pagination={false} />;
  }
}`,...(M=(K=g.parameters)==null?void 0:K.docs)==null?void 0:M.source}}};var V,L,W;u.parameters={...u.parameters,docs:{...(V=u.parameters)==null?void 0:V.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Checkbox row selection, same \`rowSelection\` shape as antd.'
      }
    }
  },
  render: () => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<Array<Key>>([]);
    return <BAITable columns={sampleColumns} dataSource={sampleData} rowKey="key" rowSelection={{
      selectedRowKeys,
      onChange: keys => setSelectedRowKeys([...keys])
    }} pagination={false} />;
  }
}`,...(W=(L=u.parameters)==null?void 0:L.docs)==null?void 0:W.source}}};var q,J,_;h.parameters={...h.parameters,docs:{...(q=h.parameters)==null?void 0:q.docs,source:{originalSource:`{
  name: 'Loading State',
  parameters: {
    docs: {
      description: {
        story: 'Rows dim while \`loading\` is true. Unlike antd there is no centred spinner (ticket 25 PILOT-DECISION 4).'
      }
    }
  },
  args: {
    columns: sampleColumns,
    dataSource: sampleData,
    loading: true,
    pagination: false
  }
}`,...(_=(J=h.parameters)==null?void 0:J.docs)==null?void 0:_.source}}};var $,Q,X;y.parameters={...y.parameters,docs:{...($=y.parameters)==null?void 0:$.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'No rows — renders the empty state in place of the body.'
      }
    }
  },
  args: {
    columns: sampleColumns,
    dataSource: [],
    pagination: false
  }
}`,...(X=(Q=y.parameters)==null?void 0:Q.docs)==null?void 0:X.source}}};const ft=["Default","ClientSidePagination","InvalidPage","HorizontalScroll","VerticalScroll","WithColumnSettings","WithSorting","RowSelection","Loading","EmptyState"];export{l as ClientSidePagination,i as Default,y as EmptyState,d as HorizontalScroll,c as InvalidPage,h as Loading,u as RowSelection,m as VerticalScroll,p as WithColumnSettings,g as WithSorting,ft as __namedExportsOrder,vt as default};
