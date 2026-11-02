import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-DlPsW1c0.js";import{n,t as r}from"./compact-C9OPbfhP.js";import{n as i,t as a}from"./map-BLzs52H1.js";import{t as o}from"./jsx-runtime-MKhVqBIO.js";import{n as s,t as c}from"./useBAIi18n-BiRHq6o1.js";import{t as l}from"./compiler-runtime-DU4U6aph.js";import{n as u,t as ee}from"./circle-minus-Ca6OtsWu.js";import{n as d,t as f}from"./plus-0g6MD8er.js";import{n as p,t as m}from"./Button-ntW_drb7.js";import{n as h,t as g}from"./Form-BRtsXIQ7.js";import{_,v}from"./iframe-lMx8nTtI.js";import{n as y,t as b}from"./BAIFlex-DnaoYTJ1.js";import{n as x,t as S}from"./TextInput-DSlwujhL.js";function C(e){return E(e.width)}function te(e){return(0,T.jsx)(`span`,{className:`bai-dynamic-list__header`,"data-bai-dynamic-list-column-header":e.key,children:e.header},e.key)}var w,T,E,D;function O(){return(O=e((()=>{w=l(),c(),p(),v(),a(),n(),u(),d(),T=o(),E=e=>typeof e==`string`?e:`minmax(0, ${e??1}fr)`,D=e=>{"use memo";let t=(0,w.c)(43),n,a,o,c,l,u,d,p;t[0]===e?(n=t[1],a=t[2],o=t[3],c=t[4],l=t[5],u=t[6],d=t[7],p=t[8]):({columns:o,items:u,onRemove:p,addButton:n,disabled:c,maxItems:d,className:a,...l}=e,t[0]=e,t[1]=n,t[2]=a,t[3]=o,t[4]=c,t[5]=l,t[6]=u,t[7]=d,t[8]=p);let{t:h}=s(),g;t[9]===h?g=t[10]:(g=h(`general.button.Remove`),t[9]=h,t[10]=g);let v=g,y;t[11]===o?y=t[12]:(y=i(o,C).join(` `),t[11]=o,t[12]=y);let b=`${y} auto`,x;t[13]===a?x=t[14]:(x=r([`bai-dynamic-list`,a]).join(` `),t[13]=a,t[14]=x);let S;t[15]!==o||t[16]!==b||t[17]!==u.length?(S=u.length>0&&(0,T.jsxs)(`div`,{className:`bai-dynamic-list__row`,style:{gridTemplateColumns:b},"data-bai-dynamic-list-header":``,"aria-hidden":!0,children:[i(o,te),(0,T.jsx)(`span`,{className:`bai-dynamic-list__remove-slot`})]}),t[15]=o,t[16]=b,t[17]=u.length,t[18]=S):S=t[18];let E;if(t[19]!==o||t[20]!==c||t[21]!==b||t[22]!==u||t[23]!==p||t[24]!==v){let e;t[26]!==o||t[27]!==c||t[28]!==b||t[29]!==p||t[30]!==v?(e=(e,t)=>(0,T.jsxs)(`div`,{className:`bai-dynamic-list__row`,style:{gridTemplateColumns:b},"data-bai-dynamic-list-row":t,children:[i(o,n=>(0,T.jsx)(`div`,{className:`bai-dynamic-list__cell`,"data-bai-dynamic-list-cell":n.key,children:n.render(e,t)},n.key)),(0,T.jsx)(_,{variant:`ghost`,label:v,tooltip:v,icon:(0,T.jsx)(ee,{size:`1em`}),isDisabled:c,onClick:()=>p(e,t)})]},e.key),t[26]=o,t[27]=c,t[28]=b,t[29]=p,t[30]=v,t[31]=e):e=t[31],E=i(u,e),t[19]=o,t[20]=c,t[21]=b,t[22]=u,t[23]=p,t[24]=v,t[25]=E}else E=t[25];let D;t[32]===Symbol.for(`react.memo_cache_sentinel`)?(D=(0,T.jsx)(f,{size:`1em`}),t[32]=D):D=t[32];let O=c||d!==void 0&&u.length>=d,k;t[33]!==n.label||t[34]!==n.onClick||t[35]!==O?(k=(0,T.jsx)(m,{variant:`secondary`,label:n.label,icon:D,width:`100%`,isDisabled:O,onClick:n.onClick}),t[33]=n.label,t[34]=n.onClick,t[35]=O,t[36]=k):k=t[36];let A;return t[37]!==l||t[38]!==x||t[39]!==S||t[40]!==E||t[41]!==k?(A=(0,T.jsxs)(`div`,{...l,className:x,"data-bai-dynamic-list":``,children:[S,E,k]}),t[37]=l,t[38]=x,t[39]=S,t[40]=E,t[41]=k,t[42]=A):A=t[42],A}})))()}var k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q;function $(){return($=e((()=>{g(),O(),y(),x(),k=t(),A=o(),U={title:`Input/BAIDynamicList`,component:D,tags:[`autodocs`],parameters:{reactDocgen:!1,docs:{description:{component:"Rows of the same fields with an Add action below them and a Remove action on each row. Column headers show once above the first row. It owns no form state: each column’s `render(item, index)` returns the cell, so inside a `Form.List` the caller wraps each control in its own `Form.Item`, and a failed rule shows its message under that cell."}}},argTypes:{columns:{control:!1,description:`One entry per field.`},items:{control:!1,description:`The rows.`},onRemove:{action:`remove`},addButton:{control:!1,description:"The Add action: `onClick` and `label`."},disabled:{control:`boolean`},maxItems:{control:`number`}}},W=({initial:e,maxItems:t,disabled:n})=>{let[r,i]=(0,k.useState)(e),a=(e,t)=>i(n=>n.map(n=>n.key===e?{...n,...t}:n));return(0,A.jsx)(D,{items:r,onRemove:e=>i(t=>t.filter(t=>t.key!==e.key)),addButton:{onClick:()=>i(e=>[...e,{key:Date.now(),name:``,value:``}]),label:`Add label`},maxItems:t,disabled:n,columns:[{key:`name`,header:`Key`,render:(e,t)=>(0,A.jsx)(S,{"aria-label":`Key ${t+1}`,placeholder:`e.g., team`,value:e.name,disabled:n,onChange:t=>a(e.key,{name:t})})},{key:`value`,header:`Value`,render:(e,t)=>(0,A.jsx)(S,{"aria-label":`Value ${t+1}`,placeholder:`e.g., frontend`,value:e.value,disabled:n,onChange:t=>a(e.key,{value:t})})}]})},G={render:()=>(0,A.jsx)(W,{initial:[{key:1,name:`team`,value:`frontend`},{key:2,name:`stage`,value:`dev`}]}),parameters:{docs:{description:{story:`Two rows held in component state, no form. The headers show once; Add appends a row and each minus button removes its own.`}}}},K={render:()=>(0,A.jsx)(W,{initial:[]}),parameters:{docs:{description:{story:`An empty list shows only the Add action; the header row appears with the first row.`}}}},q=({validateOnMount:e})=>{let[t]=h.useForm();return(0,k.useEffect)(()=>{e&&t.validateFields().catch(()=>{})},[t,e]),(0,A.jsx)(h,{form:t,layout:`vertical`,initialValues:{envvars:e?[{variable:`MY_VAR`,value:`1`},{variable:`MY_VAR`,value:`2`},{variable:``,value:``}]:[{variable:`MY_VAR`,value:`1`}]},children:(0,A.jsx)(h.List,{name:`envvars`,children:(e,{add:t,remove:n},{errors:r})=>(0,A.jsxs)(A.Fragment,{children:[(0,A.jsx)(D,{items:e,onRemove:e=>n(e.name),addButton:{onClick:()=>t(),label:`Add environment variables`},columns:[{key:`variable`,header:`Variable`,render:({key:e,name:t,...n},r)=>(0,A.jsx)(h.Item,{...n,name:[t,`variable`],style:{marginBottom:0},validateTrigger:[`onChange`,`onBlur`],rules:[{required:!0,message:`Enter variable name`},({getFieldValue:e})=>({validator(t,n){let r=(e(`envvars`)??[]).map(e=>e==null?void 0:e.variable);return n&&r.filter(e=>e===n).length>1?Promise.reject(`A variable name that already exists.`):Promise.resolve()}})],children:(0,A.jsx)(S,{"aria-label":`Variable ${r+1}`,placeholder:`e.g., MY_VARIABLE`})})},{key:`value`,header:`Value`,render:({key:e,name:t,...n},r)=>(0,A.jsx)(h.Item,{...n,name:[t,`value`],style:{marginBottom:0},validateTrigger:[`onChange`,`onBlur`],rules:[{required:!0,message:`Please enter a value.`}],children:(0,A.jsx)(S,{"aria-label":`Value ${r+1}`})})}]}),(0,A.jsx)(h.ErrorList,{errors:r})]})})})},J={render:()=>(0,A.jsx)(q,{}),parameters:{docs:{description:{story:"Inside a `Form.List`: each cell is the caller’s `Form.Item` with its own rules, validating on change and on blur. Leave a field empty or repeat a name to see the message under that cell."}}}},Y={render:()=>(0,A.jsx)(q,{validateOnMount:!0}),parameters:{docs:{description:{story:`Two rows share a name and the third is empty. Each message sits under its own cell, so only those rows grow and the minus button stays on the input line.`}}}},X={render:()=>{let[e,t]=(0,k.useState)([{key:1}]);return(0,A.jsx)(D,{items:e,onRemove:e=>t(t=>t.filter(t=>t.key!==e.key)),addButton:{onClick:()=>t(e=>[...e,{key:Date.now()}]),label:`Add Pre-Start Action`},columns:[{key:`action`,header:`Action`,render:(e,t)=>(0,A.jsx)(S,{"aria-label":`Action ${t+1}`,placeholder:`e.g., wait_for_file`})},{key:`args`,header:`Args (JSON)`,width:2,render:(e,t)=>(0,A.jsx)(S,{"aria-label":`Args (JSON) ${t+1}`,placeholder:`e.g., {}`})}]})},parameters:{docs:{description:{story:"A numeric `width` is a share of the free width: here Args (JSON) takes twice the width of Action. A string is used as a CSS track size."}}}},Z={render:()=>(0,A.jsxs)(b,{direction:`column`,align:`stretch`,gap:`lg`,children:[(0,A.jsx)(W,{initial:[{key:1,name:`team`,value:`frontend`},{key:2,name:`stage`,value:`dev`}],maxItems:2}),(0,A.jsx)(W,{initial:[{key:1,name:`team`,value:`frontend`}],disabled:!0})]}),parameters:{docs:{description:{story:"Top: `maxItems={2}` disables Add once two rows exist. Bottom: `disabled` turns off Add and every Remove."}}}},G.parameters={...G.parameters,docs:{...(j=G.parameters)==null?void 0:j.docs,source:{originalSource:`{
  render: () => <PlainList initial={[{
    key: 1,
    name: 'team',
    value: 'frontend'
  }, {
    key: 2,
    name: 'stage',
    value: 'dev'
  }]} />,
  parameters: {
    docs: {
      description: {
        story: 'Two rows held in component state, no form. The headers show once; Add appends a row and each minus button removes its own.'
      }
    }
  }
}`,...(M=G.parameters)==null||(M=M.docs)==null?void 0:M.source}}},K.parameters={...K.parameters,docs:{...(N=K.parameters)==null?void 0:N.docs,source:{originalSource:`{
  render: () => <PlainList initial={[]} />,
  parameters: {
    docs: {
      description: {
        story: 'An empty list shows only the Add action; the header row appears with the first row.'
      }
    }
  }
}`,...(P=K.parameters)==null||(P=P.docs)==null?void 0:P.source}}},J.parameters={...J.parameters,docs:{...(F=J.parameters)==null?void 0:F.docs,source:{originalSource:`{
  render: () => <EnvVarForm />,
  parameters: {
    docs: {
      description: {
        story: 'Inside a \`Form.List\`: each cell is the caller’s \`Form.Item\` with its own rules, validating on change and on blur. Leave a field empty or repeat a name to see the message under that cell.'
      }
    }
  }
}`,...(I=J.parameters)==null||(I=I.docs)==null?void 0:I.source}}},Y.parameters={...Y.parameters,docs:{...(L=Y.parameters)==null?void 0:L.docs,source:{originalSource:`{
  render: () => <EnvVarForm validateOnMount />,
  parameters: {
    docs: {
      description: {
        story: 'Two rows share a name and the third is empty. Each message sits under its own cell, so only those rows grow and the minus button stays on the input line.'
      }
    }
  }
}`,...(R=Y.parameters)==null||(R=R.docs)==null?void 0:R.source}}},X.parameters={...X.parameters,docs:{...(z=X.parameters)==null?void 0:z.docs,source:{originalSource:`{
  render: () => {
    const [rows, setRows] = useState([{
      key: 1
    }]);
    return <BAIDynamicList<{
      key: number;
    }> items={rows} onRemove={row => setRows(prev => prev.filter(r => r.key !== row.key))} addButton={{
      onClick: () => setRows(prev => [...prev, {
        key: Date.now()
      }]),
      label: 'Add Pre-Start Action'
    }} columns={[{
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
}`,...(B=X.parameters)==null||(B=B.docs)==null?void 0:B.source}}},Z.parameters={...Z.parameters,docs:{...(V=Z.parameters)==null?void 0:V.docs,source:{originalSource:`{
  render: () => <BAIFlex direction="column" align="stretch" gap="lg">
      <PlainList initial={[{
      key: 1,
      name: 'team',
      value: 'frontend'
    }, {
      key: 2,
      name: 'stage',
      value: 'dev'
    }]} maxItems={2} />
      <PlainList initial={[{
      key: 1,
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
}`,...(H=Z.parameters)==null||(H=H.docs)==null?void 0:H.source}}},Q=[`Basic`,`Empty`,`InFormList`,`ValidationErrors`,`ColumnWidths`,`MaxItemsAndDisabled`]})))()}$();export{G as Basic,X as ColumnWidths,K as Empty,J as InFormList,Z as MaxItemsAndDisabled,Y as ValidationErrors,Q as __namedExportsOrder,U as default};