import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-DlPsW1c0.js";import{n,t as r}from"./compact-C9OPbfhP.js";import{n as i,t as a}from"./map-CLZMgxwS.js";import{t as o}from"./jsx-runtime-MKhVqBIO.js";import{n as s,t as c}from"./useBAIi18n-D1AzK-FG.js";import{t as l}from"./compiler-runtime-DU4U6aph.js";import{n as u,t as d}from"./circle-minus-Ca6OtsWu.js";import{n as f,t as p}from"./plus-0g6MD8er.js";import{n as m,t as h}from"./Button-8IF0YmBG.js";import{n as g,t as _}from"./Form-CMW7OOat.js";import{_ as v,v as y}from"./iframe-BczH89d2.js";import{n as b,t as x}from"./BAIFlex-DnaoYTJ1.js";import{n as S,t as C}from"./TextInput-Bsdmjnyk.js";function w(e){return O(e.width)}function T(e){return(0,D.jsx)(`span`,{className:`bai-dynamic-list__header`,"data-bai-dynamic-list-column-header":e.key,children:e.header},e.key)}var E,D,O,k;function A(){return(A=e((()=>{E=l(),c(),m(),y(),a(),n(),u(),f(),D=o(),O=e=>typeof e==`string`?e:`minmax(0, ${e??1}fr)`,k=e=>{"use memo";let t=(0,E.c)(43),n,a,o,c,l,u,f,m;t[0]===e?(n=t[1],a=t[2],o=t[3],c=t[4],l=t[5],u=t[6],f=t[7],m=t[8]):({columns:o,items:u,onRemove:m,addButton:n,disabled:c,maxItems:f,className:a,...l}=e,t[0]=e,t[1]=n,t[2]=a,t[3]=o,t[4]=c,t[5]=l,t[6]=u,t[7]=f,t[8]=m);let{t:g}=s(),_;t[9]===g?_=t[10]:(_=g(`general.button.Remove`),t[9]=g,t[10]=_);let y=_,b;t[11]===o?b=t[12]:(b=i(o,w).join(` `),t[11]=o,t[12]=b);let x=`${b} auto`,S;t[13]===a?S=t[14]:(S=r([`bai-dynamic-list`,a]).join(` `),t[13]=a,t[14]=S);let C;t[15]!==o||t[16]!==x||t[17]!==u.length?(C=u.length>0&&(0,D.jsxs)(`div`,{className:`bai-dynamic-list__row`,style:{gridTemplateColumns:x},"data-bai-dynamic-list-header":``,"aria-hidden":!0,children:[i(o,T),(0,D.jsx)(`span`,{className:`bai-dynamic-list__remove-slot`})]}),t[15]=o,t[16]=x,t[17]=u.length,t[18]=C):C=t[18];let O;if(t[19]!==o||t[20]!==c||t[21]!==x||t[22]!==u||t[23]!==m||t[24]!==y){let e;t[26]!==o||t[27]!==c||t[28]!==x||t[29]!==m||t[30]!==y?(e=(e,t)=>(0,D.jsxs)(`div`,{className:`bai-dynamic-list__row`,style:{gridTemplateColumns:x},"data-bai-dynamic-list-row":t,children:[i(o,n=>(0,D.jsx)(`div`,{className:`bai-dynamic-list__cell`,"data-bai-dynamic-list-cell":n.key,children:n.render(e,t)},n.key)),(0,D.jsx)(v,{variant:`ghost`,label:y,tooltip:y,icon:(0,D.jsx)(d,{size:`1em`}),isDisabled:c,onClick:()=>m(e,t)})]},e.key),t[26]=o,t[27]=c,t[28]=x,t[29]=m,t[30]=y,t[31]=e):e=t[31],O=i(u,e),t[19]=o,t[20]=c,t[21]=x,t[22]=u,t[23]=m,t[24]=y,t[25]=O}else O=t[25];let k;t[32]===Symbol.for(`react.memo_cache_sentinel`)?(k=(0,D.jsx)(p,{size:`1em`}),t[32]=k):k=t[32];let A=c||f!==void 0&&u.length>=f,j;t[33]!==n.label||t[34]!==n.onClick||t[35]!==A?(j=(0,D.jsx)(h,{variant:`secondary`,label:n.label,icon:k,width:`100%`,isDisabled:A,onClick:n.onClick}),t[33]=n.label,t[34]=n.onClick,t[35]=A,t[36]=j):j=t[36];let M;return t[37]!==l||t[38]!==S||t[39]!==C||t[40]!==O||t[41]!==j?(M=(0,D.jsxs)(`div`,{...l,className:S,"data-bai-dynamic-list":``,children:[C,O,j]}),t[37]=l,t[38]=S,t[39]=C,t[40]=O,t[41]=j,t[42]=M):M=t[42],M}})))()}var j,M,N,P,F,I,L,R,z,B,V,H;function U(){return(U=e((()=>{_(),A(),b(),S(),j=t(),M=o(),N={title:`Input/BAIDynamicList`,component:k,tags:[`autodocs`],parameters:{reactDocgen:!1,docs:{description:{component:"Rows of the same fields with an Add action below them and a Remove action on each row. Column headers show once above the first row. It owns no form state: each column’s `render(item, index)` returns the cell, so inside a `Form.List` the caller wraps each control in its own `Form.Item`, and a failed rule shows its message under that cell."}}},argTypes:{columns:{control:!1,description:`One entry per field.`},items:{control:!1,description:`The rows.`},onRemove:{action:`remove`},addButton:{control:!1,description:"The Add action: `onClick` and `label`."},disabled:{control:`boolean`},maxItems:{control:`number`}}},P=({initial:e,maxItems:t,disabled:n})=>{let[r,i]=(0,j.useState)(e),a=(e,t)=>i(n=>n.map(n=>n.key===e?{...n,...t}:n));return(0,M.jsx)(k,{items:r,onRemove:e=>i(t=>t.filter(t=>t.key!==e.key)),addButton:{onClick:()=>i(e=>[...e,{key:Date.now(),name:``,value:``}]),label:`Add label`},maxItems:t,disabled:n,columns:[{key:`name`,header:`Key`,render:(e,t)=>(0,M.jsx)(C,{"aria-label":`Key ${t+1}`,placeholder:`e.g., team`,value:e.name,disabled:n,onChange:t=>a(e.key,{name:t})})},{key:`value`,header:`Value`,render:(e,t)=>(0,M.jsx)(C,{"aria-label":`Value ${t+1}`,placeholder:`e.g., frontend`,value:e.value,disabled:n,onChange:t=>a(e.key,{value:t})})}]})},F={render:()=>(0,M.jsx)(P,{initial:[{key:1,name:`team`,value:`frontend`},{key:2,name:`stage`,value:`dev`}]}),parameters:{docs:{description:{story:`Two rows held in component state, no form. The headers show once; Add appends a row and each minus button removes its own.`}}}},I={render:()=>(0,M.jsx)(P,{initial:[]}),parameters:{docs:{description:{story:`An empty list shows only the Add action; the header row appears with the first row.`}}}},L=({validateOnMount:e})=>{let[t]=g.useForm();return(0,j.useEffect)(()=>{e&&t.validateFields().catch(()=>{})},[t,e]),(0,M.jsx)(g,{form:t,layout:`vertical`,initialValues:{envvars:e?[{variable:`MY_VAR`,value:`1`},{variable:`MY_VAR`,value:`2`},{variable:``,value:``}]:[{variable:`MY_VAR`,value:`1`}]},children:(0,M.jsx)(g.List,{name:`envvars`,children:(e,{add:t,remove:n},{errors:r})=>(0,M.jsxs)(M.Fragment,{children:[(0,M.jsx)(k,{items:e,onRemove:e=>n(e.name),addButton:{onClick:()=>t(),label:`Add environment variables`},columns:[{key:`variable`,header:`Variable`,render:({key:e,name:t,...n},r)=>(0,M.jsx)(g.Item,{...n,name:[t,`variable`],style:{marginBottom:0},validateTrigger:[`onChange`,`onBlur`],rules:[{required:!0,message:`Enter variable name`},({getFieldValue:e})=>({validator(t,n){let r=(e(`envvars`)??[]).map(e=>e?.variable);return n&&r.filter(e=>e===n).length>1?Promise.reject(`A variable name that already exists.`):Promise.resolve()}})],children:(0,M.jsx)(C,{"aria-label":`Variable ${r+1}`,placeholder:`e.g., MY_VARIABLE`})})},{key:`value`,header:`Value`,render:({key:e,name:t,...n},r)=>(0,M.jsx)(g.Item,{...n,name:[t,`value`],style:{marginBottom:0},validateTrigger:[`onChange`,`onBlur`],rules:[{required:!0,message:`Please enter a value.`}],children:(0,M.jsx)(C,{"aria-label":`Value ${r+1}`})})}]}),(0,M.jsx)(g.ErrorList,{errors:r})]})})})},R={render:()=>(0,M.jsx)(L,{}),parameters:{docs:{description:{story:"Inside a `Form.List`: each cell is the caller’s `Form.Item` with its own rules, validating on change and on blur. Leave a field empty or repeat a name to see the message under that cell."}}}},z={render:()=>(0,M.jsx)(L,{validateOnMount:!0}),parameters:{docs:{description:{story:`Two rows share a name and the third is empty. Each message sits under its own cell, so only those rows grow and the minus button stays on the input line.`}}}},B={render:()=>{let[e,t]=(0,j.useState)([{key:1}]);return(0,M.jsx)(k,{items:e,onRemove:e=>t(t=>t.filter(t=>t.key!==e.key)),addButton:{onClick:()=>t(e=>[...e,{key:Date.now()}]),label:`Add Pre-Start Action`},columns:[{key:`action`,header:`Action`,render:(e,t)=>(0,M.jsx)(C,{"aria-label":`Action ${t+1}`,placeholder:`e.g., wait_for_file`})},{key:`args`,header:`Args (JSON)`,width:2,render:(e,t)=>(0,M.jsx)(C,{"aria-label":`Args (JSON) ${t+1}`,placeholder:`e.g., {}`})}]})},parameters:{docs:{description:{story:"A numeric `width` is a share of the free width: here Args (JSON) takes twice the width of Action. A string is used as a CSS track size."}}}},V={render:()=>(0,M.jsxs)(x,{direction:`column`,align:`stretch`,gap:`lg`,children:[(0,M.jsx)(P,{initial:[{key:1,name:`team`,value:`frontend`},{key:2,name:`stage`,value:`dev`}],maxItems:2}),(0,M.jsx)(P,{initial:[{key:1,name:`team`,value:`frontend`}],disabled:!0})]}),parameters:{docs:{description:{story:"Top: `maxItems={2}` disables Add once two rows exist. Bottom: `disabled` turns off Add and every Remove."}}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
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
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  render: () => <PlainList initial={[]} />,
  parameters: {
    docs: {
      description: {
        story: 'An empty list shows only the Add action; the header row appears with the first row.'
      }
    }
  }
}`,...I.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  render: () => <EnvVarForm />,
  parameters: {
    docs: {
      description: {
        story: 'Inside a \`Form.List\`: each cell is the caller’s \`Form.Item\` with its own rules, validating on change and on blur. Leave a field empty or repeat a name to see the message under that cell.'
      }
    }
  }
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  render: () => <EnvVarForm validateOnMount />,
  parameters: {
    docs: {
      description: {
        story: 'Two rows share a name and the third is empty. Each message sits under its own cell, so only those rows grow and the minus button stays on the input line.'
      }
    }
  }
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
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
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
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
}`,...V.parameters?.docs?.source}}},H=[`Basic`,`Empty`,`InFormList`,`ValidationErrors`,`ColumnWidths`,`MaxItemsAndDisabled`]})))()}U();export{F as Basic,B as ColumnWidths,I as Empty,R as InFormList,V as MaxItemsAndDisabled,z as ValidationErrors,H as __namedExportsOrder,N as default};