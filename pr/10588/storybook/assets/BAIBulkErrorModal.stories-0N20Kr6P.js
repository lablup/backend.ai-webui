import{n as e,o as t}from"./rolldown-runtime-2s6bX4vc.js";import{l as n}from"./iframe-DR2sIF5r.js";import{n as r,t as i}from"./BAIButton-C-o5ANgR.js";import"./BAIModal-DJxH9R0X.js";import{i as a,n as o,t as s}from"./dataGridColumns-csjtDuHL.js";import{useState as c}from"react";import{Fragment as l,jsx as u,jsxs as d}from"react/jsx-runtime";import{c as f}from"react/compiler-runtime";import{BulkErrorModal as p}from"@lablup/ui-common/components/BulkErrorModal";var m,h;function g(){return(g=e((()=>{o(),m=t(n(),1),h=e=>{"use memo";let t=f(22),n,r,i,o,c,l,d;t[0]===e?(n=t[1],r=t[2],i=t[3],o=t[4],c=t[5],l=t[6],d=t[7]):({open:d,columns:r,dataSource:i,alertDescription:n,onRequestClose:l,headerClassName:o,...c}=e,t[0]=e,t[1]=n,t[2]=r,t[3]=i,t[4]=o,t[5]=c,t[6]=l,t[7]=d);let h=d!==void 0&&d,g;t[8]===l?g=t[9]:(g=e=>{e||l()},t[8]=l,t[9]=g);let _;t[10]===o?_=t[11]:(_=(0,m.default)(`bai-modal__header`,o),t[10]=o,t[11]=_);let v;t[12]===r?v=t[13]:(v=a(s(r)),t[12]=r,t[13]=v);let y;return t[14]!==n||t[15]!==i||t[16]!==c||t[17]!==h||t[18]!==g||t[19]!==_||t[20]!==v?(y=u(p,{...c,isOpen:h,onOpenChange:g,headerClassName:_,columns:v,data:i,description:n}),t[14]=n,t[15]=i,t[16]=c,t[17]=h,t[18]=g,t[19]=_,t[20]=v,t[21]=y):y=t[21],y}})))()}var _,v,y,b,x,S,C;function w(){return(w=e((()=>{g(),r(),_=[{key:`1`,target:`project-alpha`,action:`Grant`,message:`Permission denied`},{key:`2`,target:`project-beta`,action:`Revoke`,message:`Permission not found`},{key:`3`,target:`project-gamma`,action:`Grant`,message:`Duplicate permission entry`}],v=[{key:`target`,title:`Target`,dataIndex:`target`},{key:`action`,title:`Action`,dataIndex:`action`},{key:`message`,title:`Error Message`,dataIndex:`message`}],y={title:`Modal/BAIBulkErrorModal`,component:h,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:'\n**BAIBulkErrorModal** surfaces the per-request errors of a bulk operation in a table — one row per failed request.\n\n## Behavior\n- Every bulk operation has its own response shape, so the caller provides the table `columns`; nothing is hardcoded.\n- The title defaults to a localized "Action execution failed" with an error icon; pass `title` for operation-specific copy.\n- Purely informational: there is no footer — dismissal happens through the header X (or mask / Esc) and is reported through `onRequestClose` so the caller decides what happens next (typically keeping its own form open for a retry).\n- Client-side pagination shows at most 10 rows per page; the pager is hidden while the failures fit on a single page.\n- Built on `BAIModal` and `BAITable`.\n        '}}},argTypes:{columns:{control:!1,description:`Caller-defined column definitions for the failure table`},dataSource:{control:!1,description:`One record per failed request`},alertDescription:{control:`text`,description:`Optional guidance (string) rendered as the body of an error alert above the table`}}},b={parameters:{docs:{description:{story:`Default state: localized "Action execution failed" title with error icon and caller-provided columns.`}}},render:()=>{let[e,t]=c(!1);return d(l,{children:[u(i,{danger:!0,onClick:()=>t(!0),children:`Show bulk errors`}),u(h,{open:e,columns:v,dataSource:_,onRequestClose:()=>t(!1)})]})}},x={parameters:{docs:{description:{story:`More than 10 failed requests: the table paginates client-side at 10 rows per page.`}}},render:()=>{let[e,t]=c(!1),n=Array.from({length:23},(e,t)=>({key:`${t+1}`,target:`project-${t+1}`,action:t%2==0?`Grant`:`Revoke`,message:`Permission denied`}));return d(l,{children:[u(i,{danger:!0,onClick:()=>t(!0),children:`Show bulk errors`}),u(h,{open:e,columns:v,dataSource:n,onRequestClose:()=>t(!1)})]})}},S={parameters:{docs:{description:{story:`Operation-specific title plus a description explaining how to retry the failed items.`}}},render:()=>{let[e,t]=c(!1);return d(l,{children:[u(i,{danger:!0,onClick:()=>t(!0),children:`Show bulk errors`}),u(h,{open:e,title:`3 permission change(s) failed`,alertDescription:`The failed changes are kept in the form. Fix them and save again — changes that were already applied will not be re-submitted.`,columns:v,dataSource:_,onRequestClose:()=>t(!1)})]})}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}},C=[`Basic`,`ManyFailures`,`WithCustomTitleAndDescription`]})))()}w();export{b as Basic,x as ManyFailures,S as WithCustomTitleAndDescription,C as __namedExportsOrder,y as default};