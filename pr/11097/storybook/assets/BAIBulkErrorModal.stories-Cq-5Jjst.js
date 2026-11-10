import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-DlPsW1c0.js";import{t as n}from"./jsx-runtime-MKhVqBIO.js";import{n as r,t as i}from"./BAIButton-BM9wrdQx.js";import{n as a,t as o}from"./BAIBulkErrorModal-Dponib-X.js";var s,c,l,u,d,f,p,m,h,g,_,v,y,b,x;function S(){return(S=e((()=>{a(),r(),s=t(),c=n(),h=[{key:`1`,target:`project-alpha`,action:`Grant`,message:`Permission denied`},{key:`2`,target:`project-beta`,action:`Revoke`,message:`Permission not found`},{key:`3`,target:`project-gamma`,action:`Grant`,message:`Duplicate permission entry`}],g=[{key:`target`,title:`Target`,dataIndex:`target`},{key:`action`,title:`Action`,dataIndex:`action`},{key:`message`,title:`Error Message`,dataIndex:`message`}],_={title:`Modal/BAIBulkErrorModal`,component:o,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:'\n**BAIBulkErrorModal** surfaces the per-request errors of a bulk operation in a table — one row per failed request.\n\n## Behavior\n- Every bulk operation has its own response shape, so the caller provides the table `columns`; nothing is hardcoded.\n- The title defaults to a localized "Action execution failed" with an error icon; pass `title` for operation-specific copy.\n- Purely informational: there is no footer — dismissal happens through the header X (or mask / Esc) and is reported through `onRequestClose` so the caller decides what happens next (typically keeping its own form open for a retry).\n- Client-side pagination shows at most 10 rows per page; the pager is hidden while the failures fit on a single page.\n- Built on `BAIModal` and `BAITable`.\n        '}}},argTypes:{columns:{control:!1,description:`Caller-defined column definitions for the failure table`},dataSource:{control:!1,description:`One record per failed request`},alertDescription:{control:`text`,description:`Optional guidance (string) rendered as the body of an error alert above the table`}}},v={parameters:{docs:{description:{story:`Default state: localized "Action execution failed" title with error icon and caller-provided columns.`}}},render:()=>{let[e,t]=(0,s.useState)(!1);return(0,c.jsxs)(c.Fragment,{children:[(0,c.jsx)(i,{danger:!0,onClick:()=>t(!0),children:`Show bulk errors`}),(0,c.jsx)(o,{open:e,columns:g,dataSource:h,onRequestClose:()=>t(!1)})]})}},y={parameters:{docs:{description:{story:`More than 10 failed requests: the table paginates client-side at 10 rows per page.`}}},render:()=>{let[e,t]=(0,s.useState)(!1),n=Array.from({length:23},(e,t)=>({key:`${t+1}`,target:`project-${t+1}`,action:t%2==0?`Grant`:`Revoke`,message:`Permission denied`}));return(0,c.jsxs)(c.Fragment,{children:[(0,c.jsx)(i,{danger:!0,onClick:()=>t(!0),children:`Show bulk errors`}),(0,c.jsx)(o,{open:e,columns:g,dataSource:n,onRequestClose:()=>t(!1)})]})}},b={parameters:{docs:{description:{story:`Operation-specific title plus a description explaining how to retry the failed items.`}}},render:()=>{let[e,t]=(0,s.useState)(!1);return(0,c.jsxs)(c.Fragment,{children:[(0,c.jsx)(i,{danger:!0,onClick:()=>t(!0),children:`Show bulk errors`}),(0,c.jsx)(o,{open:e,title:`3 permission change(s) failed`,alertDescription:`The failed changes are kept in the form. Fix them and save again — changes that were already applied will not be re-submitted.`,columns:g,dataSource:h,onRequestClose:()=>t(!1)})]})}},v.parameters={...v.parameters,docs:{...(l=v.parameters)==null?void 0:l.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Default state: localized "Action execution failed" title with error icon and caller-provided columns.'
      }
    }
  },
  render: () => {
    const [open, setOpen] = useState(false);
    return <>
        <BAIButton danger onClick={() => setOpen(true)}>
          Show bulk errors
        </BAIButton>
        <BAIBulkErrorModal<FailedRequestExample> open={open} columns={exampleColumns} dataSource={failedRequests} onRequestClose={() => setOpen(false)} />
      </>;
  }
}`,...(u=v.parameters)==null||(u=u.docs)==null?void 0:u.source}}},y.parameters={...y.parameters,docs:{...(d=y.parameters)==null?void 0:d.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'More than 10 failed requests: the table paginates client-side at 10 rows per page.'
      }
    }
  },
  render: () => {
    const [open, setOpen] = useState(false);
    const manyFailures: FailedRequestExample[] = Array.from({
      length: 23
    }, (_ignored, index) => ({
      key: \`\${index + 1}\`,
      target: \`project-\${index + 1}\`,
      action: index % 2 === 0 ? 'Grant' : 'Revoke',
      message: 'Permission denied'
    }));
    return <>
        <BAIButton danger onClick={() => setOpen(true)}>
          Show bulk errors
        </BAIButton>
        <BAIBulkErrorModal<FailedRequestExample> open={open} columns={exampleColumns} dataSource={manyFailures} onRequestClose={() => setOpen(false)} />
      </>;
  }
}`,...(f=y.parameters)==null||(f=f.docs)==null?void 0:f.source}}},b.parameters={...b.parameters,docs:{...(p=b.parameters)==null?void 0:p.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Operation-specific title plus a description explaining how to retry the failed items.'
      }
    }
  },
  render: () => {
    const [open, setOpen] = useState(false);
    return <>
        <BAIButton danger onClick={() => setOpen(true)}>
          Show bulk errors
        </BAIButton>
        <BAIBulkErrorModal<FailedRequestExample> open={open} title="3 permission change(s) failed" alertDescription="The failed changes are kept in the form. Fix them and save again — changes that were already applied will not be re-submitted." columns={exampleColumns} dataSource={failedRequests} onRequestClose={() => setOpen(false)} />
      </>;
  }
}`,...(m=b.parameters)==null||(m=m.docs)==null?void 0:m.source}}},x=[`Basic`,`ManyFailures`,`WithCustomTitleAndDescription`]})))()}S();export{v as Basic,y as ManyFailures,b as WithCustomTitleAndDescription,x as __namedExportsOrder,_ as default};