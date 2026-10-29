import{a as e,n as t}from"./rolldown-runtime-sJBDdmOt.js";import{t as n}from"./react-D0Ex1IVc.js";import{t as r}from"./jsx-runtime-MKhVqBIO.js";import{n as i,t as a}from"./useUicTranslator-CyZ7u-SQ.js";import{t as o}from"./compiler-runtime-CdReTaax.js";import{n as s,t as c}from"./HStack-CvfTXYkS.js";import{n as l,t as u}from"./VStack-1ucqJdFC.js";import{i as d,n as f,o as p,r as m,t as h}from"./DataGrid2-D-6EtZ7_.js";import{E as g,T as _,bt as v,g as y,yt as b}from"./iframe-Dr8rBQk-.js";import{n as x,t as S}from"./Banner-C5hexdPm.js";import{n as C,t as w}from"./BAIButton-Cmy7Zzgj.js";import"./BAIModal-CO3ZkWeA.js";function T({columns:e,data:t,idKey:n,description:r,descriptionTitle:i,title:o,width:s=D,...l}){let d=a();return(0,E.jsx)(_,{...l,width:s,title:o??(0,E.jsxs)(c,{gap:2,align:`center`,children:[(0,E.jsx)(b,{color:`currentColor`,size:`1em`,className:`uic-bulk-error-modal__icon`,"aria-hidden":!0}),d(`uic.BulkErrorModal.title`)]}),footer:null,children:(0,E.jsxs)(u,{gap:3,align:`stretch`,children:[r?(0,E.jsx)(S,{status:`error`,title:i??d(`uic.BulkErrorModal.errorOccurred`),description:r}):null,(0,E.jsx)(h,{columns:e,data:t,idKey:n,scrollWidth:`max-content`,pagination:{pageSize:O,hasPageSizeSelector:!1,isHiddenOnSinglePage:!0},isResizable:!1,density:`compact`,dividers:`grid`})]})})}var E,D,O;function k(){return(k=t((()=>{i(),g(),f(),s(),l(),E=r(),v(),x(),D=720,O=10})))()}var A,j,M,N;function P(){return(P=t((()=>{A=o(),d(),k(),j=e(y(),1),M=r(),N=e=>{"use memo";let t=(0,A.c)(22),n,r,i,a,o,s,c;t[0]===e?(n=t[1],r=t[2],i=t[3],a=t[4],o=t[5],s=t[6],c=t[7]):({open:c,columns:r,dataSource:i,alertDescription:n,onRequestClose:s,headerClassName:a,...o}=e,t[0]=e,t[1]=n,t[2]=r,t[3]=i,t[4]=a,t[5]=o,t[6]=s,t[7]=c);let l=c!==void 0&&c,u;t[8]===s?u=t[9]:(u=e=>{e||s()},t[8]=s,t[9]=u);let d;t[10]===a?d=t[11]:(d=(0,j.default)(`bai-modal__header`,a),t[10]=a,t[11]=d);let f;t[12]===r?f=t[13]:(f=p(m(r)),t[12]=r,t[13]=f);let h;return t[14]!==n||t[15]!==i||t[16]!==o||t[17]!==l||t[18]!==u||t[19]!==d||t[20]!==f?(h=(0,M.jsx)(T,{...o,isOpen:l,onOpenChange:u,headerClassName:d,columns:f,data:i,description:n}),t[14]=n,t[15]=i,t[16]=o,t[17]=l,t[18]=u,t[19]=d,t[20]=f,t[21]=h):h=t[21],h}})))()}var F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y;function X(){return(X=t((()=>{P(),C(),F=n(),I=r(),U=[{key:`1`,target:`project-alpha`,action:`Grant`,message:`Permission denied`},{key:`2`,target:`project-beta`,action:`Revoke`,message:`Permission not found`},{key:`3`,target:`project-gamma`,action:`Grant`,message:`Duplicate permission entry`}],W=[{key:`target`,title:`Target`,dataIndex:`target`},{key:`action`,title:`Action`,dataIndex:`action`},{key:`message`,title:`Error Message`,dataIndex:`message`}],G={title:`Modal/BAIBulkErrorModal`,component:N,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:'\n**BAIBulkErrorModal** surfaces the per-request errors of a bulk operation in a table — one row per failed request.\n\n## Behavior\n- Every bulk operation has its own response shape, so the caller provides the table `columns`; nothing is hardcoded.\n- The title defaults to a localized "Action execution failed" with an error icon; pass `title` for operation-specific copy.\n- Purely informational: there is no footer — dismissal happens through the header X (or mask / Esc) and is reported through `onRequestClose` so the caller decides what happens next (typically keeping its own form open for a retry).\n- Client-side pagination shows at most 10 rows per page; the pager is hidden while the failures fit on a single page.\n- Built on `BAIModal` and `BAITable`.\n        '}}},argTypes:{columns:{control:!1,description:`Caller-defined column definitions for the failure table`},dataSource:{control:!1,description:`One record per failed request`},alertDescription:{control:`text`,description:`Optional guidance (string) rendered as the body of an error alert above the table`}}},K={parameters:{docs:{description:{story:`Default state: localized "Action execution failed" title with error icon and caller-provided columns.`}}},render:()=>{let[e,t]=(0,F.useState)(!1);return(0,I.jsxs)(I.Fragment,{children:[(0,I.jsx)(w,{danger:!0,onClick:()=>t(!0),children:`Show bulk errors`}),(0,I.jsx)(N,{open:e,columns:W,dataSource:U,onRequestClose:()=>t(!1)})]})}},q={parameters:{docs:{description:{story:`More than 10 failed requests: the table paginates client-side at 10 rows per page.`}}},render:()=>{let[e,t]=(0,F.useState)(!1),n=Array.from({length:23},(e,t)=>({key:`${t+1}`,target:`project-${t+1}`,action:t%2==0?`Grant`:`Revoke`,message:`Permission denied`}));return(0,I.jsxs)(I.Fragment,{children:[(0,I.jsx)(w,{danger:!0,onClick:()=>t(!0),children:`Show bulk errors`}),(0,I.jsx)(N,{open:e,columns:W,dataSource:n,onRequestClose:()=>t(!1)})]})}},J={parameters:{docs:{description:{story:`Operation-specific title plus a description explaining how to retry the failed items.`}}},render:()=>{let[e,t]=(0,F.useState)(!1);return(0,I.jsxs)(I.Fragment,{children:[(0,I.jsx)(w,{danger:!0,onClick:()=>t(!0),children:`Show bulk errors`}),(0,I.jsx)(N,{open:e,title:`3 permission change(s) failed`,alertDescription:`The failed changes are kept in the form. Fix them and save again — changes that were already applied will not be re-submitted.`,columns:W,dataSource:U,onRequestClose:()=>t(!1)})]})}},K.parameters={...K.parameters,docs:{...(L=K.parameters)==null?void 0:L.docs,source:{originalSource:`{
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
}`,...(R=K.parameters)==null||(R=R.docs)==null?void 0:R.source}}},q.parameters={...q.parameters,docs:{...(z=q.parameters)==null?void 0:z.docs,source:{originalSource:`{
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
}`,...(B=q.parameters)==null||(B=B.docs)==null?void 0:B.source}}},J.parameters={...J.parameters,docs:{...(V=J.parameters)==null?void 0:V.docs,source:{originalSource:`{
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
}`,...(H=J.parameters)==null||(H=H.docs)==null?void 0:H.source}}},Y=[`Basic`,`ManyFailures`,`WithCustomTitleAndDescription`]})))()}X();export{K as Basic,q as ManyFailures,J as WithCustomTitleAndDescription,Y as __namedExportsOrder,G as default};