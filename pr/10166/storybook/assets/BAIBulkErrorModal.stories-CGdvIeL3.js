import{aC as v,j as t,b2 as F,aK as D,aV as T,c as P,ay as _,r as y}from"./iframe-D5vITUJg.js";/* empty css                 */import{A as z,t as G,f as $}from"./DataGrid2-CBUB-BCq.js";import{V as N}from"./VStack-CY2A38JS.js";import{B as K}from"./Banner-BrhiQztM.js";import{B}from"./BAIButton-v6tw7Wj6.js";import"./preload-helper-Dp1pzeXC.js";import"./flatMap-D5rzDOZk.js";import"./_baseFlatten-BEgGO4AL.js";import"./map-D_eMS0Jc.js";import"./toString-eOKMSjzl.js";import"./isSymbol-CTOyZ9sy.js";import"./_baseEach-yyABAuaQ.js";import"./get-CigUrmkg.js";import"./_baseGet-BnSPsTxS.js";import"./identity-DKeuBCMA.js";import"./isEmpty-8OIGE9ud.js";import"./castArray-B4OeBsyC.js";import"./TextInput-C_w_g7X2.js";import"./InputGroupContext-tuoyKCHd.js";import"./FieldStatus-DLuE0H4C.js";import"./useInputStatusIcon-B6tdyxv1.js";import"./useResolvedRequired-RO0MA6oF.js";import"./InputClearButton-H6k6R531.js";import"./useDevWarning-HLPl9pd2.js";import"./CheckboxInput-BNUHD0Qx.js";import"./useIndicator-CRwzqeKG.js";import"./isRenderable-BUV0eL6r.js";import"./rtlStyles-T4i24HtE.js";import"./characters-DWaYg7k3.js";import"./renderDropdownItems-BtCR1AcE.js";import"./Divider-JSSI_6M6.js";import"./Item-uNPfah_7.js";import"./computeTargetAndRel-BGwjeA1c.js";import"./useListFocus-2rfSswdw.js";import"./isRtlElement-B2-7SF8s.js";import"./useMenuHover-380uPhMh.js";import"./useFocusReturnVisibility-BJsPOpYV.js";import"./EmptyState-DBJe7c3Y.js";import"./useScrollableArea-DNwYK1aQ.js";import"./Selector-D3qBGhxJ.js";import"./SelectorOption-CH7srW78.js";import"./usePopover-D5Z5b-Fg.js";import"./NumberInput-Dsart8uI.js";import"./settings-GwLWD2KW.js";import"./composeEventHandlers-BolWE7qY.js";import"./astryxLabel-DUQFdjmM.js";var V=720,W=10;function H({columns:o,data:e,idKey:a,description:s,descriptionTitle:r,title:i,width:n=V,...l}){let p=v();return t.jsx(F,{...l,width:n,title:i??t.jsxs(D,{gap:2,align:"center",children:[t.jsx(T,{color:"currentColor",size:"1em",className:"uic-bulk-error-modal__icon","aria-hidden":!0}),p("uic.BulkErrorModal.title")]}),footer:null,children:t.jsxs(N,{gap:3,align:"stretch",children:[s?t.jsx(K,{status:"error",title:r??p("uic.BulkErrorModal.errorOccurred"),description:s}):null,t.jsx(z,{columns:o,data:e,idKey:a,scrollWidth:"max-content",pagination:{pageSize:W,hasPageSizeSelector:!1,isHiddenOnSinglePage:!0},isResizable:!1,density:"compact",dividers:"grid"})]})})}const x=o=>{"use memo";const e=P.c(22);let a,s,r,i,n,l,p;e[0]!==o?({open:p,columns:s,dataSource:r,alertDescription:a,onRequestClose:l,headerClassName:i,...n}=o,e[0]=o,e[1]=a,e[2]=s,e[3]=r,e[4]=i,e[5]=n,e[6]=l,e[7]=p):(a=e[1],s=e[2],r=e[3],i=e[4],n=e[5],l=e[6],p=e[7]);const k=p===void 0?!1:p;let c;e[8]!==l?(c=M=>{M||l()},e[8]=l,e[9]=c):c=e[9];let d;e[10]!==i?(d=_("bai-modal__header",i),e[10]=i,e[11]=d):d=e[11];let m;e[12]!==s?(m=G($(s)),e[12]=s,e[13]=m):m=e[13];let u;return e[14]!==a||e[15]!==r||e[16]!==n||e[17]!==k||e[18]!==c||e[19]!==d||e[20]!==m?(u=t.jsx(H,{...n,isOpen:k,onOpenChange:c,headerClassName:d,columns:m,data:r,description:a}),e[14]=a,e[15]=r,e[16]=n,e[17]=k,e[18]=c,e[19]=d,e[20]=m,e[21]=u):u=e[21],u},I=[{key:"1",target:"project-alpha",action:"Grant",message:"Permission denied"},{key:"2",target:"project-beta",action:"Revoke",message:"Permission not found"},{key:"3",target:"project-gamma",action:"Grant",message:"Duplicate permission entry"}],C=[{key:"target",title:"Target",dataIndex:"target"},{key:"action",title:"Action",dataIndex:"action"},{key:"message",title:"Error Message",dataIndex:"message"}],Ge={title:"Modal/BAIBulkErrorModal",component:x,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:'\n**BAIBulkErrorModal** surfaces the per-request errors of a bulk operation in a table — one row per failed request.\n\n## Behavior\n- Every bulk operation has its own response shape, so the caller provides the table `columns`; nothing is hardcoded.\n- The title defaults to a localized "Action execution failed" with an error icon; pass `title` for operation-specific copy.\n- Purely informational: there is no footer — dismissal happens through the header X (or mask / Esc) and is reported through `onRequestClose` so the caller decides what happens next (typically keeping its own form open for a retry).\n- Client-side pagination shows at most 10 rows per page; the pager is hidden while the failures fit on a single page.\n- Built on `BAIModal` and `BAITable`.\n        '}}},argTypes:{columns:{control:!1,description:"Caller-defined column definitions for the failure table"},dataSource:{control:!1,description:"One record per failed request"},alertDescription:{control:"text",description:"Optional guidance (string) rendered as the body of an error alert above the table"}}},h={parameters:{docs:{description:{story:'Default state: localized "Action execution failed" title with error icon and caller-provided columns.'}}},render:()=>{const[o,e]=y.useState(!1);return t.jsxs(t.Fragment,{children:[t.jsx(B,{danger:!0,onClick:()=>e(!0),children:"Show bulk errors"}),t.jsx(x,{open:o,columns:C,dataSource:I,onRequestClose:()=>e(!1)})]})}},f={parameters:{docs:{description:{story:"More than 10 failed requests: the table paginates client-side at 10 rows per page."}}},render:()=>{const[o,e]=y.useState(!1),a=Array.from({length:23},(s,r)=>({key:`${r+1}`,target:`project-${r+1}`,action:r%2===0?"Grant":"Revoke",message:"Permission denied"}));return t.jsxs(t.Fragment,{children:[t.jsx(B,{danger:!0,onClick:()=>e(!0),children:"Show bulk errors"}),t.jsx(x,{open:o,columns:C,dataSource:a,onRequestClose:()=>e(!1)})]})}},g={parameters:{docs:{description:{story:"Operation-specific title plus a description explaining how to retry the failed items."}}},render:()=>{const[o,e]=y.useState(!1);return t.jsxs(t.Fragment,{children:[t.jsx(B,{danger:!0,onClick:()=>e(!0),children:"Show bulk errors"}),t.jsx(x,{open:o,title:"3 permission change(s) failed",alertDescription:"The failed changes are kept in the form. Fix them and save again — changes that were already applied will not be re-submitted.",columns:C,dataSource:I,onRequestClose:()=>e(!1)})]})}};var S,b,w;h.parameters={...h.parameters,docs:{...(S=h.parameters)==null?void 0:S.docs,source:{originalSource:`{
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
}`,...(w=(b=h.parameters)==null?void 0:b.docs)==null?void 0:w.source}}};var A,j,O;f.parameters={...f.parameters,docs:{...(A=f.parameters)==null?void 0:A.docs,source:{originalSource:`{
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
}`,...(E=(q=g.parameters)==null?void 0:q.docs)==null?void 0:E.source}}};const $e=["Basic","ManyFailures","WithCustomTitleAndDescription"];export{h as Basic,f as ManyFailures,g as WithCustomTitleAndDescription,$e as __namedExportsOrder,Ge as default};
