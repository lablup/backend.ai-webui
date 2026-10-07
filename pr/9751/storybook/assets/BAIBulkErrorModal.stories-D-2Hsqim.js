import{aA as v,j as t,b0 as F,aI as T,aT as D,c as P,aw as _,r as y}from"./iframe-HO026Ki4.js";/* empty css                 */import{A as z,t as G,f as $}from"./DataGrid2-QL-GMKZv.js";import{V as N}from"./VStack-DvKoSIPn.js";import{B as W}from"./Banner-CCo9_vBG.js";import{B}from"./BAIButton-ZcOBhsuK.js";import"./preload-helper-Dp1pzeXC.js";import"./flatMap-D1bBDU39.js";import"./_baseFlatten-DkVu7Qo7.js";import"./map-Yu8rQ6r9.js";import"./toString-DpzR-1ci.js";import"./isSymbol-JoTKyUQl.js";import"./_baseEach-CqaOb05O.js";import"./get-DunlZipC.js";import"./_baseGet-BHZBflHg.js";import"./identity-DKeuBCMA.js";import"./isEmpty-Btdh0VZi.js";import"./castArray-DKenLnWC.js";import"./TextInput-BM173fsc.js";import"./InputGroupContext-BYs4G0kD.js";import"./FieldStatus-BgryaYlt.js";import"./useInputStatusIcon-CJvUmwVQ.js";import"./useResolvedRequired-BnxNTZbR.js";import"./InputClearButton-BqusFEKQ.js";import"./useDevWarning-CFaPhRTB.js";import"./CheckboxInput-DcUevsLQ.js";import"./useIndicator-ZC2t5AAk.js";import"./isRenderable-BUV0eL6r.js";import"./rtlStyles-T4i24HtE.js";import"./characters-DWaYg7k3.js";import"./renderDropdownItems-Ckpbw9PK.js";import"./Divider-DYqPr1bn.js";import"./Item-BSbTc_B6.js";import"./computeTargetAndRel-BGwjeA1c.js";import"./useListFocus-Dfeo-w2J.js";import"./isRtlElement-B2-7SF8s.js";import"./useMenuHover-DCNoGmgs.js";import"./useFocusReturnVisibility-DL3coco0.js";import"./EmptyState-BA1vek5z.js";import"./Selector-RLxBCUZR.js";import"./SelectorOption-BHI4KaPR.js";import"./usePopover-D_xqYboa.js";import"./NumberInput-AlXJ6tOS.js";import"./settings-CmzF5dK4.js";import"./composeEventHandlers-BolWE7qY.js";import"./astryxLabel-BZ-0mOkY.js";var H=720,K=10;function V({columns:o,data:e,idKey:a,description:s,descriptionTitle:r,title:n,width:i=H,...l}){let p=v();return t.jsx(F,{...l,width:i,title:n??t.jsxs(T,{gap:2,align:"center",children:[t.jsx(D,{color:"currentColor",size:"1em",className:"uic-bulk-error-modal__icon","aria-hidden":!0}),p("uic.BulkErrorModal.title")]}),footer:null,children:t.jsxs(N,{gap:3,align:"stretch",children:[s?t.jsx(W,{status:"error",title:r??p("uic.BulkErrorModal.errorOccurred"),description:s}):null,t.jsx(z,{columns:o,data:e,idKey:a,scrollWidth:"max-content",pagination:{pageSize:K,hasPageSizeSelector:!1,isHiddenOnSinglePage:!0},isResizable:!1,density:"compact",dividers:"grid"})]})})}const x=o=>{"use memo";const e=P.c(22);let a,s,r,n,i,l,p;e[0]!==o?({open:p,columns:s,dataSource:r,alertDescription:a,onRequestClose:l,headerClassName:n,...i}=o,e[0]=o,e[1]=a,e[2]=s,e[3]=r,e[4]=n,e[5]=i,e[6]=l,e[7]=p):(a=e[1],s=e[2],r=e[3],n=e[4],i=e[5],l=e[6],p=e[7]);const k=p===void 0?!1:p;let c;e[8]!==l?(c=M=>{M||l()},e[8]=l,e[9]=c):c=e[9];let d;e[10]!==n?(d=_("bai-modal__header",n),e[10]=n,e[11]=d):d=e[11];let m;e[12]!==s?(m=G($(s)),e[12]=s,e[13]=m):m=e[13];let u;return e[14]!==a||e[15]!==r||e[16]!==i||e[17]!==k||e[18]!==c||e[19]!==d||e[20]!==m?(u=t.jsx(V,{...i,isOpen:k,onOpenChange:c,headerClassName:d,columns:m,data:r,description:a}),e[14]=a,e[15]=r,e[16]=i,e[17]=k,e[18]=c,e[19]=d,e[20]=m,e[21]=u):u=e[21],u},I=[{key:"1",target:"project-alpha",action:"Grant",message:"Permission denied"},{key:"2",target:"project-beta",action:"Revoke",message:"Permission not found"},{key:"3",target:"project-gamma",action:"Grant",message:"Duplicate permission entry"}],S=[{key:"target",title:"Target",dataIndex:"target"},{key:"action",title:"Action",dataIndex:"action"},{key:"message",title:"Error Message",dataIndex:"message"}],ze={title:"Modal/BAIBulkErrorModal",component:x,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:'\n**BAIBulkErrorModal** surfaces the per-request errors of a bulk operation in a table — one row per failed request.\n\n## Behavior\n- Every bulk operation has its own response shape, so the caller provides the table `columns`; nothing is hardcoded.\n- The title defaults to a localized "Action execution failed" with an error icon; pass `title` for operation-specific copy.\n- Purely informational: there is no footer — dismissal happens through the header X (or mask / Esc) and is reported through `onRequestClose` so the caller decides what happens next (typically keeping its own form open for a retry).\n- Client-side pagination shows at most 10 rows per page; the pager is hidden while the failures fit on a single page.\n- Built on `BAIModal` and `BAITable`.\n        '}}},argTypes:{columns:{control:!1,description:"Caller-defined column definitions for the failure table"},dataSource:{control:!1,description:"One record per failed request"},alertDescription:{control:"text",description:"Optional guidance (string) rendered as the body of an error alert above the table"}}},h={parameters:{docs:{description:{story:'Default state: localized "Action execution failed" title with error icon and caller-provided columns.'}}},render:()=>{const[o,e]=y.useState(!1);return t.jsxs(t.Fragment,{children:[t.jsx(B,{danger:!0,onClick:()=>e(!0),children:"Show bulk errors"}),t.jsx(x,{open:o,columns:S,dataSource:I,onRequestClose:()=>e(!1)})]})}},f={parameters:{docs:{description:{story:"More than 10 failed requests: the table paginates client-side at 10 rows per page."}}},render:()=>{const[o,e]=y.useState(!1),a=Array.from({length:23},(s,r)=>({key:`${r+1}`,target:`project-${r+1}`,action:r%2===0?"Grant":"Revoke",message:"Permission denied"}));return t.jsxs(t.Fragment,{children:[t.jsx(B,{danger:!0,onClick:()=>e(!0),children:"Show bulk errors"}),t.jsx(x,{open:o,columns:S,dataSource:a,onRequestClose:()=>e(!1)})]})}},g={parameters:{docs:{description:{story:"Operation-specific title plus a description explaining how to retry the failed items."}}},render:()=>{const[o,e]=y.useState(!1);return t.jsxs(t.Fragment,{children:[t.jsx(B,{danger:!0,onClick:()=>e(!0),children:"Show bulk errors"}),t.jsx(x,{open:o,title:"3 permission change(s) failed",alertDescription:"The failed changes are kept in the form. Fix them and save again — changes that were already applied will not be re-submitted.",columns:S,dataSource:I,onRequestClose:()=>e(!1)})]})}};var C,w,A;h.parameters={...h.parameters,docs:{...(C=h.parameters)==null?void 0:C.docs,source:{originalSource:`{
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
}`,...(A=(w=h.parameters)==null?void 0:w.docs)==null?void 0:A.source}}};var b,j,O;f.parameters={...f.parameters,docs:{...(b=f.parameters)==null?void 0:b.docs,source:{originalSource:`{
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
}`,...(O=(j=f.parameters)==null?void 0:j.docs)==null?void 0:O.source}}};var R,q,E;g.parameters={...g.parameters,docs:{...(R=g.parameters)==null?void 0:R.docs,source:{originalSource:`{
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
}`,...(E=(q=g.parameters)==null?void 0:q.docs)==null?void 0:E.source}}};const Ge=["Basic","ManyFailures","WithCustomTitleAndDescription"];export{h as Basic,f as ManyFailures,g as WithCustomTitleAndDescription,Ge as __namedExportsOrder,ze as default};
