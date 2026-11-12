import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-DlPsW1c0.js";import{t as n}from"./jsx-runtime-MKhVqBIO.js";import{n as r,t as i}from"./BAIButton-CMGaOMCH.js";import{n as a,t as o}from"./BAIBulkErrorModal-DM3DP1lQ.js";var s,c,l,u,d,f,p,m,h;function g(){return(g=e((()=>{a(),r(),s=t(),c=n(),l=[{key:`1`,target:`project-alpha`,action:`Grant`,message:`Permission denied`},{key:`2`,target:`project-beta`,action:`Revoke`,message:`Permission not found`},{key:`3`,target:`project-gamma`,action:`Grant`,message:`Duplicate permission entry`}],u=[{key:`target`,title:`Target`,dataIndex:`target`},{key:`action`,title:`Action`,dataIndex:`action`},{key:`message`,title:`Error Message`,dataIndex:`message`}],d={title:`Modal/BAIBulkErrorModal`,component:o,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:'\n**BAIBulkErrorModal** surfaces the per-request errors of a bulk operation in a table — one row per failed request.\n\n## Behavior\n- Every bulk operation has its own response shape, so the caller provides the table `columns`; nothing is hardcoded.\n- The title defaults to a localized "Action execution failed" with an error icon; pass `title` for operation-specific copy.\n- Purely informational: there is no footer — dismissal happens through the header X (or mask / Esc) and is reported through `onRequestClose` so the caller decides what happens next (typically keeping its own form open for a retry).\n- Client-side pagination shows at most 10 rows per page; the pager is hidden while the failures fit on a single page.\n- Built on `BAIModal` and `BAITable`.\n        '}}},argTypes:{columns:{control:!1,description:`Caller-defined column definitions for the failure table`},dataSource:{control:!1,description:`One record per failed request`},alertDescription:{control:`text`,description:`Optional guidance (string) rendered as the body of an error alert above the table`}}},f={parameters:{docs:{description:{story:`Default state: localized "Action execution failed" title with error icon and caller-provided columns.`}}},render:()=>{let[e,t]=(0,s.useState)(!1);return(0,c.jsxs)(c.Fragment,{children:[(0,c.jsx)(i,{danger:!0,onClick:()=>t(!0),children:`Show bulk errors`}),(0,c.jsx)(o,{open:e,columns:u,dataSource:l,onRequestClose:()=>t(!1)})]})}},p={parameters:{docs:{description:{story:`More than 10 failed requests: the table paginates client-side at 10 rows per page.`}}},render:()=>{let[e,t]=(0,s.useState)(!1),n=Array.from({length:23},(e,t)=>({key:`${t+1}`,target:`project-${t+1}`,action:t%2==0?`Grant`:`Revoke`,message:`Permission denied`}));return(0,c.jsxs)(c.Fragment,{children:[(0,c.jsx)(i,{danger:!0,onClick:()=>t(!0),children:`Show bulk errors`}),(0,c.jsx)(o,{open:e,columns:u,dataSource:n,onRequestClose:()=>t(!1)})]})}},m={parameters:{docs:{description:{story:`Operation-specific title plus a description explaining how to retry the failed items.`}}},render:()=>{let[e,t]=(0,s.useState)(!1);return(0,c.jsxs)(c.Fragment,{children:[(0,c.jsx)(i,{danger:!0,onClick:()=>t(!0),children:`Show bulk errors`}),(0,c.jsx)(o,{open:e,title:`3 permission change(s) failed`,alertDescription:`The failed changes are kept in the form. Fix them and save again — changes that were already applied will not be re-submitted.`,columns:u,dataSource:l,onRequestClose:()=>t(!1)})]})}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
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
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}},h=[`Basic`,`ManyFailures`,`WithCustomTitleAndDescription`]})))()}g();export{f as Basic,p as ManyFailures,m as WithCustomTitleAndDescription,h as __namedExportsOrder,d as default};