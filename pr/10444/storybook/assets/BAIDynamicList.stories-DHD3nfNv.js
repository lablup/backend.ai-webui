import{c as oe,a as ie,j as a,ab as de,bg as le,w as me,r as K,v as x}from"./iframe-CW7BtzKD.js";import{m as R}from"./map-BRK7mTYr.js";import{c as ce}from"./compact-CU4PNV0P.js";import{P as pe}from"./plus-BjYfC-Nb.js";import{B as he}from"./BAIFlex-BJE_ZoP7.js";import{a as A}from"./TextInput-BBMBtMiX.js";import"./preload-helper-Dp1pzeXC.js";import"./toString-9qzM-rJw.js";import"./isSymbol-BTCdFl0T.js";import"./_baseEach-3fKN3uQN.js";import"./get-CIowHhqU.js";import"./_baseGet-DAylmCAP.js";import"./identity-DKeuBCMA.js";import"./formControl-BcvpCDxI.js";import"./FormLayoutContext-C5rF8bQt.js";import"./TextInput-Dnyk6n_O.js";import"./FieldStatus-DrCw2I2Z.js";import"./useIsHydrating-BWyi3wJ7.js";import"./useInputStatusIcon-6lBRJWTP.js";import"./useResolvedRequired-B4CldVvx.js";import"./fieldParts-CKNAjuQn.js";import"./useDevWarning-BwUNkzt0.js";import"./inputAria-CStWn1wH.js";import"./InputClearButton-DpZWS0Ia.js";import"./inputStyles.stylex-Bztz6H8O.js";import"./Field-BkNinzWv.js";const ue=n=>typeof n=="string"?n:`minmax(0, ${n??1}fr)`,P=n=>{"use memo";const e=oe.c(47);let o,d,r,l,t,i,s,m,h,p;e[0]!==n?({columns:r,items:s,getItemKey:i,onAdd:h,onRemove:p,addLabel:o,disabled:l,maxItems:m,className:d,...t}=n,e[0]=n,e[1]=o,e[2]=d,e[3]=r,e[4]=l,e[5]=t,e[6]=i,e[7]=s,e[8]=m,e[9]=h,e[10]=p):(o=e[1],d=e[2],r=e[3],l=e[4],t=e[5],i=e[6],s=e[7],m=e[8],h=e[9],p=e[10]);const{t:v}=ie();let y;e[11]!==v?(y=v("general.button.Remove"),e[11]=v,e[12]=y):y=e[12];const c=y;let I;e[13]!==r?(I=R(r,ve).join(" "),e[13]=r,e[14]=I):I=e[14];const u=`${I} auto`;let g;e[15]!==d?(g=ce(["bai-dynamic-list",d]).join(" "),e[15]=d,e[16]=g):g=e[16];let w;e[17]!==r||e[18]!==u||e[19]!==s.length?(w=s.length>0&&a.jsxs("div",{className:"bai-dynamic-list__row",style:{gridTemplateColumns:u},"data-bai-dynamic-list-header":"","aria-hidden":!0,children:[R(r,ye),a.jsx("span",{className:"bai-dynamic-list__remove-slot"})]}),e[17]=r,e[18]=u,e[19]=s.length,e[20]=w):w=e[20];let f;if(e[21]!==r||e[22]!==l||e[23]!==i||e[24]!==u||e[25]!==s||e[26]!==p||e[27]!==c){let L;e[29]!==r||e[30]!==l||e[31]!==i||e[32]!==u||e[33]!==p||e[34]!==c?(L=(D,k)=>a.jsxs("div",{className:"bai-dynamic-list__row",style:{gridTemplateColumns:u},"data-bai-dynamic-list-row":k,children:[R(r,$=>a.jsx("div",{className:"bai-dynamic-list__cell","data-bai-dynamic-list-cell":$.key,children:$.render(D,k)},$.key)),a.jsx(de,{variant:"ghost",label:c,tooltip:c,icon:a.jsx(le,{size:"1em"}),isDisabled:l,onClick:()=>p(D,k)})]},i(D,k)),e[29]=r,e[30]=l,e[31]=i,e[32]=u,e[33]=p,e[34]=c,e[35]=L):L=e[35],f=R(s,L),e[21]=r,e[22]=l,e[23]=i,e[24]=u,e[25]=s,e[26]=p,e[27]=c,e[28]=f}else f=e[28];let j;e[36]===Symbol.for("react.memo_cache_sentinel")?(j=a.jsx(pe,{size:"1em"}),e[36]=j):j=e[36];const C=l||m!==void 0&&s.length>=m;let b;e[37]!==o||e[38]!==h||e[39]!==C?(b=a.jsx(me,{variant:"secondary",label:o,icon:j,isDisabled:C,onClick:h}),e[37]=o,e[38]=h,e[39]=C,e[40]=b):b=e[40];let _;return e[41]!==t||e[42]!==g||e[43]!==w||e[44]!==f||e[45]!==b?(_=a.jsxs("div",{...t,className:g,"data-bai-dynamic-list":"",children:[w,f,b]}),e[41]=t,e[42]=g,e[43]=w,e[44]=f,e[45]=b,e[46]=_):_=e[46],_};function ve(n){return ue(n.width)}function ye(n){return a.jsx("span",{className:"bai-dynamic-list__header","data-bai-dynamic-list-column-header":n.key,children:n.header},n.key)}const Me={title:"Input/BAIDynamicList",component:P,tags:["autodocs"],parameters:{reactDocgen:!1,docs:{description:{component:"Rows of the same fields with an Add action below them and a Remove action on each row. Column headers show once above the first row. It owns no form state: each column’s `render(item, index)` returns the cell, so inside a `Form.List` the caller wraps each control in its own `Form.Item`, and a failed rule shows its message under that cell."}}},argTypes:{columns:{control:!1,description:"One entry per field."},items:{control:!1,description:"The rows."},getItemKey:{control:!1},onAdd:{action:"add"},onRemove:{action:"remove"},addLabel:{control:"text",description:"Text of the Add action."},disabled:{control:"boolean"},maxItems:{control:"number"}}},N=({initial:n,maxItems:e,disabled:o})=>{const[d,r]=K.useState(n),l=(t,i)=>r(s=>s.map(m=>m.id===t?{...m,...i}:m));return a.jsx(P,{items:d,getItemKey:t=>t.id,onAdd:()=>r(t=>[...t,{id:Date.now(),name:"",value:""}]),onRemove:t=>r(i=>i.filter(s=>s.id!==t.id)),addLabel:"Add label",maxItems:e,disabled:o,columns:[{key:"name",header:"Key",render:(t,i)=>a.jsx(A,{"aria-label":`Key ${i+1}`,placeholder:"e.g., team",value:t.name,disabled:o,onChange:s=>l(t.id,{name:s})})},{key:"value",header:"Value",render:(t,i)=>a.jsx(A,{"aria-label":`Value ${i+1}`,placeholder:"e.g., frontend",value:t.value,disabled:o,onChange:s=>l(t.id,{value:s})})}]})},S={render:()=>a.jsx(N,{initial:[{id:1,name:"team",value:"frontend"},{id:2,name:"stage",value:"dev"}]}),parameters:{docs:{description:{story:"Two rows held in component state, no form. The headers show once; Add appends a row and each X removes its own."}}}},B={render:()=>a.jsx(N,{initial:[]}),parameters:{docs:{description:{story:"An empty list shows only the Add action; the header row appears with the first row."}}}},ne=({validateOnMount:n})=>{const[e]=x.useForm();return K.useEffect(()=>{n&&e.validateFields().catch(()=>{})},[e,n]),a.jsx(x,{form:e,layout:"vertical",initialValues:{envvars:n?[{variable:"MY_VAR",value:"1"},{variable:"MY_VAR",value:"2"},{variable:"",value:""}]:[{variable:"MY_VAR",value:"1"}]},children:a.jsx(x.List,{name:"envvars",children:(o,{add:d,remove:r},{errors:l})=>a.jsxs(a.Fragment,{children:[a.jsx(P,{items:o,getItemKey:t=>t.key,onAdd:()=>d(),onRemove:t=>r(t.name),addLabel:"Add environment variables",columns:[{key:"variable",header:"Variable",render:({key:t,name:i,...s},m)=>a.jsx(x.Item,{...s,name:[i,"variable"],style:{marginBottom:0},validateTrigger:["onChange","onBlur"],rules:[{required:!0,message:"Enter variable name"},({getFieldValue:h})=>({validator(p,v){const y=(h("envvars")??[]).map(c=>c==null?void 0:c.variable);return v&&y.filter(c=>c===v).length>1?Promise.reject("A variable name that already exists."):Promise.resolve()}})],children:a.jsx(A,{"aria-label":`Variable ${m+1}`,placeholder:"e.g., MY_VARIABLE"})})},{key:"value",header:"Value",render:({key:t,name:i,...s},m)=>a.jsx(x.Item,{...s,name:[i,"value"],style:{marginBottom:0},validateTrigger:["onChange","onBlur"],rules:[{required:!0,message:"Please enter a value."}],children:a.jsx(A,{"aria-label":`Value ${m+1}`})})}]}),a.jsx(x.ErrorList,{errors:l})]})})})},E={render:()=>a.jsx(ne,{}),parameters:{docs:{description:{story:"Inside a `Form.List`: each cell is the caller’s `Form.Item` with its own rules, validating on change and on blur. Leave a field empty or repeat a name to see the message under that cell."}}}},F={render:()=>a.jsx(ne,{validateOnMount:!0}),parameters:{docs:{description:{story:"Two rows share a name and the third is empty. Each message sits under its own cell, so only those rows grow and the X stays on the input line."}}}},T={render:()=>{const[n,e]=K.useState([{id:1}]);return a.jsx(P,{items:n,getItemKey:o=>o.id,onAdd:()=>e(o=>[...o,{id:Date.now()}]),onRemove:o=>e(d=>d.filter(r=>r.id!==o.id)),addLabel:"Add Pre-Start Action",columns:[{key:"action",header:"Action",render:(o,d)=>a.jsx(A,{"aria-label":`Action ${d+1}`,placeholder:"e.g., wait_for_file"})},{key:"args",header:"Args (JSON)",width:2,render:(o,d)=>a.jsx(A,{"aria-label":`Args (JSON) ${d+1}`,placeholder:"e.g., {}"})}]})},parameters:{docs:{description:{story:"A numeric `width` is a share of the free width: here Args (JSON) takes twice the width of Action. A string is used as a CSS track size."}}}},V={render:()=>a.jsxs(he,{direction:"column",align:"stretch",gap:"lg",children:[a.jsx(N,{initial:[{id:1,name:"team",value:"frontend"},{id:2,name:"stage",value:"dev"}],maxItems:2}),a.jsx(N,{initial:[{id:1,name:"team",value:"frontend"}],disabled:!0})]}),parameters:{docs:{description:{story:"Top: `maxItems={2}` disables Add once two rows exist. Bottom: `disabled` turns off Add and every Remove."}}}};var O,J,M;S.parameters={...S.parameters,docs:{...(O=S.parameters)==null?void 0:O.docs,source:{originalSource:`{
  render: () => <PlainList initial={[{
    id: 1,
    name: 'team',
    value: 'frontend'
  }, {
    id: 2,
    name: 'stage',
    value: 'dev'
  }]} />,
  parameters: {
    docs: {
      description: {
        story: 'Two rows held in component state, no form. The headers show once; Add appends a row and each X removes its own.'
      }
    }
  }
}`,...(M=(J=S.parameters)==null?void 0:J.docs)==null?void 0:M.source}}};var X,z,Y;B.parameters={...B.parameters,docs:{...(X=B.parameters)==null?void 0:X.docs,source:{originalSource:`{
  render: () => <PlainList initial={[]} />,
  parameters: {
    docs: {
      description: {
        story: 'An empty list shows only the Add action; the header row appears with the first row.'
      }
    }
  }
}`,...(Y=(z=B.parameters)==null?void 0:z.docs)==null?void 0:Y.source}}};var q,W,G;E.parameters={...E.parameters,docs:{...(q=E.parameters)==null?void 0:q.docs,source:{originalSource:`{
  render: () => <EnvVarForm />,
  parameters: {
    docs: {
      description: {
        story: 'Inside a \`Form.List\`: each cell is the caller’s \`Form.Item\` with its own rules, validating on change and on blur. Leave a field empty or repeat a name to see the message under that cell.'
      }
    }
  }
}`,...(G=(W=E.parameters)==null?void 0:W.docs)==null?void 0:G.source}}};var H,Q,U;F.parameters={...F.parameters,docs:{...(H=F.parameters)==null?void 0:H.docs,source:{originalSource:`{
  render: () => <EnvVarForm validateOnMount />,
  parameters: {
    docs: {
      description: {
        story: 'Two rows share a name and the third is empty. Each message sits under its own cell, so only those rows grow and the X stays on the input line.'
      }
    }
  }
}`,...(U=(Q=F.parameters)==null?void 0:Q.docs)==null?void 0:U.source}}};var Z,ee,ae;T.parameters={...T.parameters,docs:{...(Z=T.parameters)==null?void 0:Z.docs,source:{originalSource:`{
  render: () => {
    const [rows, setRows] = useState([{
      id: 1
    }]);
    return <BAIDynamicList<{
      id: number;
    }> items={rows} getItemKey={row => row.id} onAdd={() => setRows(prev => [...prev, {
      id: Date.now()
    }])} onRemove={row => setRows(prev => prev.filter(r => r.id !== row.id))} addLabel="Add Pre-Start Action" columns={[{
      key: 'action',
      header: 'Action',
      render: (_row, index) => <BAITextInput aria-label={\`Action \${index + 1}\`} placeholder="e.g., wait_for_file" />
    }, {
      key: 'args',
      header: 'Args (JSON)',
      width: 2,
      render: (_row, index) => <BAITextInput aria-label={\`Args (JSON) \${index + 1}\`} placeholder="e.g., {}" />
    }]} />;
  },
  parameters: {
    docs: {
      description: {
        story: 'A numeric \`width\` is a share of the free width: here Args (JSON) takes twice the width of Action. A string is used as a CSS track size.'
      }
    }
  }
}`,...(ae=(ee=T.parameters)==null?void 0:ee.docs)==null?void 0:ae.source}}};var te,re,se;V.parameters={...V.parameters,docs:{...(te=V.parameters)==null?void 0:te.docs,source:{originalSource:`{
  render: () => <BAIFlex direction="column" align="stretch" gap="lg">
      <PlainList initial={[{
      id: 1,
      name: 'team',
      value: 'frontend'
    }, {
      id: 2,
      name: 'stage',
      value: 'dev'
    }]} maxItems={2} />
      <PlainList initial={[{
      id: 1,
      name: 'team',
      value: 'frontend'
    }]} disabled />
    </BAIFlex>,
  parameters: {
    docs: {
      description: {
        story: 'Top: \`maxItems={2}\` disables Add once two rows exist. Bottom: \`disabled\` turns off Add and every Remove.'
      }
    }
  }
}`,...(se=(re=V.parameters)==null?void 0:re.docs)==null?void 0:se.source}}};const Xe=["Basic","Empty","InFormList","ValidationErrors","ColumnWidths","MaxItemsAndDisabled"];export{S as Basic,T as ColumnWidths,B as Empty,E as InFormList,V as MaxItemsAndDisabled,F as ValidationErrors,Xe as __namedExportsOrder,Me as default};
