import{j as s,r as i}from"./iframe-CL7gxDZj.js";import{B as r}from"./BAITable-BBAWDe6g.js";import{T as le}from"./Token-D0MKNqnL.js";import"./preload-helper-Dp1pzeXC.js";import"./DataGrid2-BEHpKMuu.js";import"./flatMap-BY3NFlzm.js";import"./_baseFlatten-BPZSTBPw.js";import"./map-BdIEQFnI.js";import"./toString-CBCtgz1Z.js";import"./isSymbol-BS2xVMGY.js";import"./_baseEach-CSBkbyrA.js";import"./get-CZb3tCEy.js";import"./_baseGet-DWxs046T.js";import"./identity-DKeuBCMA.js";import"./isEmpty-AW6KL3QE.js";import"./castArray-ufwSILLR.js";import"./VStack-2MZkE6dj.js";import"./Banner-DlxMf04L.js";import"./isRenderable-BUV0eL6r.js";import"./composeEventHandlers-BolWE7qY.js";import"./TextInput-DsbFAhlD.js";import"./InputGroupContext-Cj00u4YI.js";import"./FieldStatus-CqsBaKvU.js";import"./useInputStatusIcon-EB7oCpjK.js";import"./useResolvedRequired-DbSsxOSW.js";import"./InputClearButton-qaNYZtp6.js";import"./useDevWarning-CYjNHf_l.js";import"./CheckboxInput-Pc6u6DFZ.js";import"./useIndicator-6MxkXWuS.js";import"./rtlStyles-T4i24HtE.js";import"./characters-DWaYg7k3.js";import"./renderDropdownItems-BUefcFR1.js";import"./Divider-BIYBQTng.js";import"./Item-T8DT8Bpf.js";import"./useListFocus-Cpjsrd4B.js";import"./isRtlElement-B2-7SF8s.js";import"./useMenuHover-C2PIZlSo.js";import"./useFocusReturnVisibility-DpMvjDAg.js";import"./EmptyState-AyUsNJjN.js";import"./Selector-DjnrHB8q.js";import"./SelectorOption-C7ggK8lv.js";import"./usePopover-DgVj0SSk.js";import"./NumberInput-ccaqTv5V.js";import"./settings-okGq8Z-T.js";import"./find-BmbEl-9z.js";import"./_baseFindIndex-Cj99RmFE.js";import"./toInteger-hmVt6p8B.js";import"./toFinite-B8rvAiZr.js";import"./toNumber-BI2CEct6.js";import"./_trimmedEndIndex-DuQxD0U0.js";const rt={title:"Table/BAITable",component:r,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:"\n**BAITable** renders through Astryx instead of the retired antd engine, keeping the same public contract:\n\n- **Column visibility** via `tableSettings` (Astryx `Dialog` settings modal, not the antd one)\n- **Resizable columns** — drag-to-resize, persisted into `columnOverrides[key].width`\n- **Sorting** via `order`/`onChangeOrder` order strings\n- **Pagination** — a custom bottom bar (not antd's pager). Client-side data is sliced here; a `total` larger than `dataSource` means the caller already sliced server-side (FR-3563)\n\n- **Horizontal scroll** via antd-shaped `scroll={{ x }}` — width-less columns take their content's intrinsic width (FR-3500)\n- **Vertical scroll** via `scroll={{ y }}` — the body is capped at `y` and the header row sticks (FR-3500)\n\n## Dropped vs BAITable (see ticket 25 \"Feature matrix\" for the full list)\n- `loading` dims rows but shows no spinner\n- `scroll.y`'s sticky header loses its bottom rule while scrolled (a collapsed-border rule cannot travel with a sticky cell)\n- Column groups (`columns[].children`) are flattened, not spanned\n- Row virtualization (deferred, explicit product decision)\n        "}}},argTypes:{loading:{control:{type:"boolean"},description:"Dims the rows while a refetch is in flight (no spinner)"},size:{control:{type:"select"},options:["small","middle","large"],description:"Row density, mapped to Astryx `density`"},resizable:{control:{type:"boolean"},description:"Enable column resizing by dragging column borders"},bordered:{control:{type:"boolean"},description:'Grid dividers between cells (-> Astryx `dividers="grid"`)'},order:{control:{type:"text"},description:'Sort order string (e.g. "name" ascending, "-name" descending)'},scroll:{control:{type:"object"},description:"antd-shaped `{ x?, y? }` — `x` sizes the table from its content, `y` caps the body height with a sticky header"}}},o=[{title:"Name",dataIndex:"name",key:"name",sorter:!0,width:150,required:!0},{title:"Age",dataIndex:"age",key:"age",sorter:!0,width:80},{title:"Status",dataIndex:"status",key:"status",render:e=>{const t={active:"green",inactive:"red",pending:"orange"};return s.jsx(le,{color:t[e],label:e})},width:100},{title:"Department",dataIndex:"department",key:"department",defaultHidden:!0,width:120},{title:"Email",dataIndex:"email",key:"email",defaultHidden:!0,width:220}],n=[{key:"1",name:"John Brown",age:32,email:"john.brown@example.com",status:"active",department:"Engineering"},{key:"2",name:"Jim Green",age:42,email:"jim.green@example.com",status:"inactive",department:"Marketing"},{key:"3",name:"Joe Black",age:28,email:"joe.black@example.com",status:"pending",department:"Sales"},{key:"4",name:"Alice Johnson",age:35,email:"alice.johnson@example.com",status:"active",department:"HR"},{key:"5",name:"Bob Smith",age:29,email:"bob.smith@example.com",status:"active",department:"Engineering"}],re=[{title:"Name",dataIndex:"name",key:"name",width:120,fixed:"left"},{title:"Allocation",dataIndex:"allocation",key:"allocation"},{title:"Usage",dataIndex:"usage",key:"usage"},{title:"Status",dataIndex:"status",key:"status"}],x=[{key:"a1",name:"agent-node-with-a-deliberately-long-name-01",allocation:"CPU 126.9 / 128 cores · MEM 972.3 / 1024 GiB",usage:"CPU 87% (111.4 cores) · MEM 63% (645.1 GiB) · GPU 4/8 (fGPU 3.5)",status:"ALIVE (schedulable)"},{key:"a2",name:"agent-node-02",allocation:"CPU 12 / 64 cores · MEM 96 / 512 GiB",usage:"CPU 12% (7.7 cores) · MEM 18% (92.2 GiB) · GPU 0/4 (fGPU 0)",status:"ALIVE (schedulable)"}],C=Array.from({length:15},(e,t)=>({...x[t%x.length],key:`n${t+1}`})),l={name:"Basic Table",parameters:{docs:{description:{story:"Basic table with sample data. `department` and `email` are hidden by default (`defaultHidden: true`) — open the settings gear to reveal them."}}},args:{columns:o,dataSource:n,pagination:{total:n.length,pageSize:10}}},ie=(e,t)=>Array.from({length:e},(a,v)=>({...n[v%n.length],key:`${t}${v+1}`,name:`Person ${v+1}`})),ce=ie(42,"p"),c={name:"Client-side Pagination",parameters:{docs:{description:{story:"A whole list handed over at once, with no `total`: the table slices it and the pager walks all 42 rows. Passing a `total` larger than `dataSource` instead declares the rows already server-sliced, and the table leaves them alone (FR-3563)."}}},args:{columns:o,dataSource:ce,pagination:{pageSize:10}}},k=ie(177,"s"),d={name:"Invalid Page Number",parameters:{docs:{description:{story:'A server-sliced page past the last one: the caller holds page 20 of a 177-row result set and the server returned nothing. Instead of "No data to display", the body offers a way back; "Go to first page" resets the caller\'s page through `pagination.onChange`, which is what refetches (FR-3703).'}}},render:()=>{const[e,t]=i.useState(20),a=10;return s.jsx(r,{columns:o,dataSource:k.slice((e-1)*a,e*a),pagination:{current:e,pageSize:a,total:k.length,onChange:t}})}},p={name:"Horizontal Scroll (scroll.x)",parameters:{docs:{description:{story:"antd-shaped `scroll={{ x: 'max-content' }}` inside a 560px container: width-less columns (Allocation / Usage / Status) take their content's intrinsic width and the table scrolls horizontally; the pixel-width `Name` column stays 120px and still truncates. Without `scroll.x` the same table squeezes every column into the container and clips the labels (FR-3500)."}}},render:()=>s.jsx("div",{style:{width:560},children:s.jsx(r,{scroll:{x:"max-content"},columns:re,dataSource:x,pagination:{total:x.length,pageSize:10}})})},m={name:"Vertical Scroll (scroll.y)",parameters:{docs:{description:{story:"`scroll={{ x: 'max-content', y: 240 }}` — the shape an `x`+`y` call site passes. `y` caps the scroll container at 240px and sticks the header row over an opaque base, so all 15 rows render inside a fixed-height body instead of growing the page. Both axes scroll in the same container: the `Name` column stays pinned while scrolling sideways, and its header stays put while scrolling down."}}},render:()=>s.jsx("div",{style:{width:560},children:s.jsx(r,{scroll:{x:"max-content",y:240},columns:re,dataSource:C,pagination:{total:C.length,pageSize:20}})})},g={name:"Column Visibility Settings",parameters:{docs:{description:{story:"Table with `tableSettings` wired to local state. Click the gear icon to open the Astryx settings dialog and toggle column visibility."}}},render:()=>{const[e,t]=i.useState({});return s.jsx(r,{columns:o,dataSource:n,resizable:!0,tableSettings:{columnOverrides:e,onColumnOverridesChange:t},pagination:{total:n.length,pageSize:10}})}},h={name:"CSV Export",parameters:{docs:{description:{story:"Table with `exportSettings`. Click the download icon to open the CSV export dialog: every column whose export key is in `supportedFields` starts checked, the rest are disabled, and `notice` warns above the list."}}},render:()=>s.jsx(r,{columns:o,dataSource:n,exportSettings:{supportedFields:["name","age"],onExport:async()=>{},notice:"Only the first 1,000 rows are exported."},pagination:{total:n.length,pageSize:10}})},u={name:"Sortable Columns",parameters:{docs:{description:{story:'Uses `order`/`onChangeOrder` order strings (e.g. `"name"`, `"-age"`) instead of an antd sorter object.'}}},render:()=>{const[e,t]=i.useState("name");return s.jsx(r,{columns:o,dataSource:n,order:e,onChangeOrder:a=>t(a??null),pagination:!1})}},y={parameters:{docs:{description:{story:"Checkbox row selection, same `rowSelection` shape as antd."}}},render:()=>{const[e,t]=i.useState([]);return s.jsx(r,{columns:o,dataSource:n,rowKey:"key",rowSelection:{selectedRowKeys:e,onChange:a=>t([...a])},pagination:!1})}},S={name:"Row Selection with Disabled Rows",parameters:{docs:{description:{story:"`rowSelection.getCheckboxProps` disables the inactive and pending rows; Jim Green starts selected. Select-all adds and removes only the enabled rows, so Jim Green stays selected either way, and the header is checked once every enabled row is."}}},render:()=>{const[e,t]=i.useState(["2"]);return s.jsx(r,{columns:o,dataSource:n,rowKey:"key",rowSelection:{selectedRowKeys:e,onChange:a=>t([...a]),getCheckboxProps:a=>({disabled:a.status!=="active"})},pagination:!1})}},w={name:"Loading State",parameters:{docs:{description:{story:"Rows dim while `loading` is true. Unlike antd there is no centred spinner (ticket 25 PILOT-DECISION 4)."}}},args:{columns:o,dataSource:n,loading:!0,pagination:!1}},b={parameters:{docs:{description:{story:"No rows — renders the empty state in place of the body."}}},args:{columns:o,dataSource:[],pagination:!1}};var f,R,I;l.parameters={...l.parameters,docs:{...(f=l.parameters)==null?void 0:f.docs,source:{originalSource:`{
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
}`,...(I=(R=l.parameters)==null?void 0:R.docs)==null?void 0:I.source}}};var z,P,A;c.parameters={...c.parameters,docs:{...(z=c.parameters)==null?void 0:z.docs,source:{originalSource:`{
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
}`,...(A=(P=c.parameters)==null?void 0:P.docs)==null?void 0:A.source}}};var D,B,O;d.parameters={...d.parameters,docs:{...(D=d.parameters)==null?void 0:D.docs,source:{originalSource:`{
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
}`,...(O=(B=d.parameters)==null?void 0:B.docs)==null?void 0:O.source}}};var T,E,j;p.parameters={...p.parameters,docs:{...(T=p.parameters)==null?void 0:T.docs,source:{originalSource:`{
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
}`,...(j=(E=p.parameters)==null?void 0:E.docs)==null?void 0:j.source}}};var K,G,U;m.parameters={...m.parameters,docs:{...(K=m.parameters)==null?void 0:K.docs,source:{originalSource:`{
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
}`,...(U=(G=m.parameters)==null?void 0:G.docs)==null?void 0:U.source}}};var F,N,V;g.parameters={...g.parameters,docs:{...(F=g.parameters)==null?void 0:F.docs,source:{originalSource:`{
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
}`,...(V=(N=g.parameters)==null?void 0:N.docs)==null?void 0:V.source}}};var H,W,M;h.parameters={...h.parameters,docs:{...(H=h.parameters)==null?void 0:H.docs,source:{originalSource:`{
  name: 'CSV Export',
  parameters: {
    docs: {
      description: {
        story: 'Table with \`exportSettings\`. Click the download icon to open the CSV export dialog: every column whose export key is in \`supportedFields\` starts checked, the rest are disabled, and \`notice\` warns above the list.'
      }
    }
  },
  render: () => <BAITable columns={sampleColumns} dataSource={sampleData} exportSettings={{
    supportedFields: ['name', 'age'],
    onExport: async () => {},
    notice: 'Only the first 1,000 rows are exported.'
  }} pagination={{
    total: sampleData.length,
    pageSize: 10
  }} />
}`,...(M=(W=h.parameters)==null?void 0:W.docs)==null?void 0:M.source}}};var J,L,q;u.parameters={...u.parameters,docs:{...(J=u.parameters)==null?void 0:J.docs,source:{originalSource:`{
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
}`,...(q=(L=u.parameters)==null?void 0:L.docs)==null?void 0:q.source}}};var _,$,Q;y.parameters={...y.parameters,docs:{...(_=y.parameters)==null?void 0:_.docs,source:{originalSource:`{
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
}`,...(Q=($=y.parameters)==null?void 0:$.docs)==null?void 0:Q.source}}};var X,Y,Z;S.parameters={...S.parameters,docs:{...(X=S.parameters)==null?void 0:X.docs,source:{originalSource:`{
  name: 'Row Selection with Disabled Rows',
  parameters: {
    docs: {
      description: {
        story: '\`rowSelection.getCheckboxProps\` disables the inactive and pending rows; Jim Green starts selected. Select-all adds and removes only the enabled rows, so Jim Green stays selected either way, and the header is checked once every enabled row is.'
      }
    }
  },
  render: () => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<Array<Key>>(['2']);
    return <BAITable columns={sampleColumns} dataSource={sampleData} rowKey="key" rowSelection={{
      selectedRowKeys,
      onChange: keys => setSelectedRowKeys([...keys]),
      getCheckboxProps: record => ({
        disabled: record.status !== 'active'
      })
    }} pagination={false} />;
  }
}`,...(Z=(Y=S.parameters)==null?void 0:Y.docs)==null?void 0:Z.source}}};var ee,te,ae;w.parameters={...w.parameters,docs:{...(ee=w.parameters)==null?void 0:ee.docs,source:{originalSource:`{
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
}`,...(ae=(te=w.parameters)==null?void 0:te.docs)==null?void 0:ae.source}}};var ne,se,oe;b.parameters={...b.parameters,docs:{...(ne=b.parameters)==null?void 0:ne.docs,source:{originalSource:`{
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
}`,...(oe=(se=b.parameters)==null?void 0:se.docs)==null?void 0:oe.source}}};const it=["Default","ClientSidePagination","InvalidPage","HorizontalScroll","VerticalScroll","WithColumnSettings","WithCsvExport","WithSorting","RowSelection","RowSelectionWithDisabledRows","Loading","EmptyState"];export{c as ClientSidePagination,l as Default,b as EmptyState,p as HorizontalScroll,d as InvalidPage,w as Loading,y as RowSelection,S as RowSelectionWithDisabledRows,m as VerticalScroll,g as WithColumnSettings,h as WithCsvExport,u as WithSorting,it as __namedExportsOrder,rt as default};
