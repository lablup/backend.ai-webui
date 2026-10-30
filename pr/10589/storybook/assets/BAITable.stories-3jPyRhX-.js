import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-DlPsW1c0.js";import{t as n}from"./jsx-runtime-MKhVqBIO.js";import{n as ee,t as r}from"./Token-CkYGHrVw.js";import{n as te,t as i}from"./BAITable-DQ99_YbJ.js";var a,o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q;function $(){return($=e((()=>{te(),ee(),a=t(),o=n(),j={title:`Table/BAITable`,component:i,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:"\n**BAITable** renders through Astryx instead of the retired antd engine, keeping the same public contract:\n\n- **Column visibility** via `tableSettings` (Astryx `Dialog` settings modal, not the antd one)\n- **Resizable columns** — drag-to-resize, persisted into `columnOverrides[key].width`\n- **Sorting** via `order`/`onChangeOrder` order strings\n- **Pagination** — a custom bottom bar (not antd's pager). Client-side data is sliced here; a `total` larger than `dataSource` means the caller already sliced server-side (FR-3563)\n\n- **Horizontal scroll** via antd-shaped `scroll={{ x }}` — width-less columns take their content's intrinsic width (FR-3500)\n- **Vertical scroll** via `scroll={{ y }}` — the body is capped at `y` and the header row sticks (FR-3500)\n\n## Dropped vs BAITable (see ticket 25 \"Feature matrix\" for the full list)\n- `loading` dims rows but shows no spinner\n- `scroll.y`'s sticky header loses its bottom rule while scrolled (a collapsed-border rule cannot travel with a sticky cell)\n- Column groups (`columns[].children`) are flattened, not spanned\n- Row virtualization (deferred, explicit product decision)\n        "}}},argTypes:{loading:{control:{type:`boolean`},description:`Dims the rows while a refetch is in flight (no spinner)`},size:{control:{type:`select`},options:[`small`,`middle`,`large`],description:"Row density, mapped to Astryx `density`"},resizable:{control:{type:`boolean`},description:`Enable column resizing by dragging column borders`},bordered:{control:{type:`boolean`},description:'Grid dividers between cells (-> Astryx `dividers="grid"`)'},order:{control:{type:`text`},description:`Sort order string (e.g. "name" ascending, "-name" descending)`},scroll:{control:{type:`object`},description:"antd-shaped `{ x?, y? }` — `x` sizes the table from its content, `y` caps the body height with a sticky header"}}},M=[{title:`Name`,dataIndex:`name`,key:`name`,sorter:!0,width:150,required:!0},{title:`Age`,dataIndex:`age`,key:`age`,sorter:!0,width:80},{title:`Status`,dataIndex:`status`,key:`status`,render:e=>(0,o.jsx)(r,{color:{active:`green`,inactive:`red`,pending:`orange`}[e],label:e}),width:100},{title:`Department`,dataIndex:`department`,key:`department`,defaultHidden:!0,width:120},{title:`Email`,dataIndex:`email`,key:`email`,defaultHidden:!0,width:220}],N=[{key:`1`,name:`John Brown`,age:32,email:`john.brown@example.com`,status:`active`,department:`Engineering`},{key:`2`,name:`Jim Green`,age:42,email:`jim.green@example.com`,status:`inactive`,department:`Marketing`},{key:`3`,name:`Joe Black`,age:28,email:`joe.black@example.com`,status:`pending`,department:`Sales`},{key:`4`,name:`Alice Johnson`,age:35,email:`alice.johnson@example.com`,status:`active`,department:`HR`},{key:`5`,name:`Bob Smith`,age:29,email:`bob.smith@example.com`,status:`active`,department:`Engineering`}],P=[{title:`Name`,dataIndex:`name`,key:`name`,width:120,fixed:`left`},{title:`Allocation`,dataIndex:`allocation`,key:`allocation`},{title:`Usage`,dataIndex:`usage`,key:`usage`},{title:`Status`,dataIndex:`status`,key:`status`}],F=[{key:`a1`,name:`agent-node-with-a-deliberately-long-name-01`,allocation:`CPU 126.9 / 128 cores · MEM 972.3 / 1024 GiB`,usage:`CPU 87% (111.4 cores) · MEM 63% (645.1 GiB) · GPU 4/8 (fGPU 3.5)`,status:`ALIVE (schedulable)`},{key:`a2`,name:`agent-node-02`,allocation:`CPU 12 / 64 cores · MEM 96 / 512 GiB`,usage:`CPU 12% (7.7 cores) · MEM 18% (92.2 GiB) · GPU 0/4 (fGPU 0)`,status:`ALIVE (schedulable)`}],I=Array.from({length:15},(e,t)=>({...F[t%F.length],key:`n${t+1}`})),L={name:`Basic Table`,parameters:{docs:{description:{story:"Basic table with sample data. `department` and `email` are hidden by default (`defaultHidden: true`) — open the settings gear to reveal them."}}},args:{columns:M,dataSource:N,pagination:{total:N.length,pageSize:10}}},R=(e,t)=>Array.from({length:e},(e,n)=>({...N[n%N.length],key:`${t}${n+1}`,name:`Person ${n+1}`})),z=R(42,`p`),B={name:`Client-side Pagination`,parameters:{docs:{description:{story:"A whole list handed over at once, with no `total`: the table slices it and the pager walks all 42 rows. Passing a `total` larger than `dataSource` instead declares the rows already server-sliced, and the table leaves them alone (FR-3563)."}}},args:{columns:M,dataSource:z,pagination:{pageSize:10}}},V=R(177,`s`),H={name:`Invalid Page Number`,parameters:{docs:{description:{story:'A server-sliced page past the last one: the caller holds page 20 of a 177-row result set and the server returned nothing. Instead of "No data to display", the body offers a way back; "Go to first page" resets the caller\'s page through `pagination.onChange`, which is what refetches (FR-3703).'}}},render:()=>{let[e,t]=(0,a.useState)(20);return(0,o.jsx)(i,{columns:M,dataSource:V.slice((e-1)*10,e*10),pagination:{current:e,pageSize:10,total:V.length,onChange:t}})}},U={name:`Horizontal Scroll (scroll.x)`,parameters:{docs:{description:{story:"antd-shaped `scroll={{ x: 'max-content' }}` inside a 560px container: width-less columns (Allocation / Usage / Status) take their content's intrinsic width and the table scrolls horizontally; the pixel-width `Name` column stays 120px and still truncates. Without `scroll.x` the same table squeezes every column into the container and clips the labels (FR-3500)."}}},render:()=>(0,o.jsx)(`div`,{style:{width:560},children:(0,o.jsx)(i,{scroll:{x:`max-content`},columns:P,dataSource:F,pagination:{total:F.length,pageSize:10}})})},W={name:`Vertical Scroll (scroll.y)`,parameters:{docs:{description:{story:"`scroll={{ x: 'max-content', y: 240 }}` — the shape an `x`+`y` call site passes. `y` caps the scroll container at 240px and sticks the header row over an opaque base, so all 15 rows render inside a fixed-height body instead of growing the page. Both axes scroll in the same container: the `Name` column stays pinned while scrolling sideways, and its header stays put while scrolling down."}}},render:()=>(0,o.jsx)(`div`,{style:{width:560},children:(0,o.jsx)(i,{scroll:{x:`max-content`,y:240},columns:P,dataSource:I,pagination:{total:I.length,pageSize:20}})})},G={name:`Column Visibility Settings`,parameters:{docs:{description:{story:"Table with `tableSettings` wired to local state. Click the gear icon to open the Astryx settings dialog and toggle column visibility."}}},render:()=>{let[e,t]=(0,a.useState)({});return(0,o.jsx)(i,{columns:M,dataSource:N,resizable:!0,tableSettings:{columnOverrides:e,onColumnOverridesChange:t},pagination:{total:N.length,pageSize:10}})}},K={name:`CSV Export`,parameters:{docs:{description:{story:"Table with `exportSettings`. Click the download icon to open the CSV export dialog: every column whose export key is in `supportedFields` starts checked, the rest are disabled, and `notice` warns above the list."}}},render:()=>(0,o.jsx)(i,{columns:M,dataSource:N,exportSettings:{supportedFields:[`name`,`age`],onExport:async()=>{},notice:`Only the first 1,000 rows are exported.`},pagination:{total:N.length,pageSize:10}})},q={name:`Sortable Columns`,parameters:{docs:{description:{story:'Uses `order`/`onChangeOrder` order strings (e.g. `"name"`, `"-age"`) instead of an antd sorter object.'}}},render:()=>{let[e,t]=(0,a.useState)(`name`);return(0,o.jsx)(i,{columns:M,dataSource:N,order:e,onChangeOrder:e=>t(e??null),pagination:!1})}},J={parameters:{docs:{description:{story:"Checkbox row selection, same `rowSelection` shape as antd."}}},render:()=>{let[e,t]=(0,a.useState)([]);return(0,o.jsx)(i,{columns:M,dataSource:N,rowKey:`key`,rowSelection:{selectedRowKeys:e,onChange:e=>t([...e])},pagination:!1})}},Y={name:`Row Selection with Disabled Rows`,parameters:{docs:{description:{story:"`rowSelection.getCheckboxProps` disables the inactive and pending rows; Jim Green starts selected. Select-all adds and removes only the enabled rows, so Jim Green stays selected either way, and the header is checked once every enabled row is."}}},render:()=>{let[e,t]=(0,a.useState)([`2`]);return(0,o.jsx)(i,{columns:M,dataSource:N,rowKey:`key`,rowSelection:{selectedRowKeys:e,onChange:e=>t([...e]),getCheckboxProps:e=>({disabled:e.status!==`active`})},pagination:!1})}},X={name:`Loading State`,parameters:{docs:{description:{story:"Rows dim while `loading` is true. Unlike antd there is no centred spinner (ticket 25 PILOT-DECISION 4)."}}},args:{columns:M,dataSource:N,loading:!0,pagination:!1}},Z={parameters:{docs:{description:{story:`No rows — renders the empty state in place of the body.`}}},args:{columns:M,dataSource:[],pagination:!1}},L.parameters={...L.parameters,docs:{...(s=L.parameters)==null?void 0:s.docs,source:{originalSource:`{
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
}`,...(c=L.parameters)==null||(c=c.docs)==null?void 0:c.source}}},B.parameters={...B.parameters,docs:{...(l=B.parameters)==null?void 0:l.docs,source:{originalSource:`{
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
}`,...(u=B.parameters)==null||(u=u.docs)==null?void 0:u.source}}},H.parameters={...H.parameters,docs:{...(d=H.parameters)==null?void 0:d.docs,source:{originalSource:`{
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
}`,...(f=H.parameters)==null||(f=f.docs)==null?void 0:f.source}}},U.parameters={...U.parameters,docs:{...(p=U.parameters)==null?void 0:p.docs,source:{originalSource:`{
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
}`,...(m=U.parameters)==null||(m=m.docs)==null?void 0:m.source}}},W.parameters={...W.parameters,docs:{...(h=W.parameters)==null?void 0:h.docs,source:{originalSource:`{
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
}`,...(g=W.parameters)==null||(g=g.docs)==null?void 0:g.source}}},G.parameters={...G.parameters,docs:{...(_=G.parameters)==null?void 0:_.docs,source:{originalSource:`{
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
}`,...(v=G.parameters)==null||(v=v.docs)==null?void 0:v.source}}},K.parameters={...K.parameters,docs:{...(y=K.parameters)==null?void 0:y.docs,source:{originalSource:`{
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
}`,...(b=K.parameters)==null||(b=b.docs)==null?void 0:b.source}}},q.parameters={...q.parameters,docs:{...(x=q.parameters)==null?void 0:x.docs,source:{originalSource:`{
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
}`,...(S=q.parameters)==null||(S=S.docs)==null?void 0:S.source}}},J.parameters={...J.parameters,docs:{...(C=J.parameters)==null?void 0:C.docs,source:{originalSource:`{
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
}`,...(w=J.parameters)==null||(w=w.docs)==null?void 0:w.source}}},Y.parameters={...Y.parameters,docs:{...(T=Y.parameters)==null?void 0:T.docs,source:{originalSource:`{
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
}`,...(E=Y.parameters)==null||(E=E.docs)==null?void 0:E.source}}},X.parameters={...X.parameters,docs:{...(D=X.parameters)==null?void 0:D.docs,source:{originalSource:`{
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
}`,...(O=X.parameters)==null||(O=O.docs)==null?void 0:O.source}}},Z.parameters={...Z.parameters,docs:{...(k=Z.parameters)==null?void 0:k.docs,source:{originalSource:`{
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
}`,...(A=Z.parameters)==null||(A=A.docs)==null?void 0:A.source}}},Q=[`Default`,`ClientSidePagination`,`InvalidPage`,`HorizontalScroll`,`VerticalScroll`,`WithColumnSettings`,`WithCsvExport`,`WithSorting`,`RowSelection`,`RowSelectionWithDisabledRows`,`Loading`,`EmptyState`]})))()}$();export{B as ClientSidePagination,L as Default,Z as EmptyState,U as HorizontalScroll,H as InvalidPage,X as Loading,J as RowSelection,Y as RowSelectionWithDisabledRows,W as VerticalScroll,G as WithColumnSettings,K as WithCsvExport,q as WithSorting,Q as __namedExportsOrder,j as default};