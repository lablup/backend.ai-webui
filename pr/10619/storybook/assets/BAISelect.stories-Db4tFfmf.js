import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-DlPsW1c0.js";import{t as n}from"./jsx-runtime-MKhVqBIO.js";import{h as r,m as i}from"./iframe-C68hoPP6.js";import{n as a,t as o}from"./BAIFlex-DnaoYTJ1.js";import{n as s,t as c}from"./BAISelect-B8dfxHSu.js";var l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P;function F(){return(F=e((()=>{a(),s(),r(),l=t(),u=n(),T={title:`Select/BAISelect`,component:c,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:"\n**BAISelect** extends [Ant Design Select](https://ant.design/components/select).\n\n## BAI-Specific Props\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `ghost` | `boolean` | `false` | Transparent background style |\n| `autoSelectOption` | `boolean \\| (options) => value` | - | Auto-select first option when empty |\n| `tooltip` | `string` | `''` | Tooltip text for the select |\n| `footer` | `ReactNode \\| string` | - | Custom footer in dropdown |\n| `endReached` | `() => void` | - | Callback when scroll reaches end |\n| `searchAction` | `(value: string) => Promise<void>` | - | Async search with transition |\n| `atBottomThreshold` | `number` | `30` | Threshold for bottom detection (px) |\n| `atBottomStateChange` | `(atBottom: boolean) => void` | - | Callback for bottom state changes |\n\nFor all other props, refer to [Ant Design Select](https://ant.design/components/select).\n        "}}},argTypes:{ghost:{control:{type:`boolean`},description:`Transparent background style`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},autoSelectOption:{control:{type:`boolean`},description:`Auto-select first option when value is empty`,table:{type:{summary:`boolean | (options) => value`},defaultValue:{summary:`-`}}},tooltip:{control:{type:`text`},description:`Tooltip text displayed on hover`,table:{type:{summary:`string`},defaultValue:{summary:`''`}}},footer:{control:!1,description:`Custom footer content in dropdown`,table:{type:{summary:`ReactNode | string`},defaultValue:{summary:`-`}}},endReached:{control:!1,description:`Callback when scroll reaches end (for infinite scroll)`,table:{type:{summary:`() => void`},defaultValue:{summary:`-`}}},searchAction:{control:!1,description:`Async search action with React transition`,table:{type:{summary:`(value: string) => Promise<void>`},defaultValue:{summary:`-`}}},atBottomThreshold:{control:{type:`number`},description:`Threshold for bottom detection in pixels`,table:{type:{summary:`number`},defaultValue:{summary:`30`}}},atBottomStateChange:{control:!1,description:`Callback for bottom state changes`,table:{type:{summary:`(atBottom: boolean) => void`},defaultValue:{summary:`-`}}}}},E=[{label:`Option 1`,value:`option1`},{label:`Option 2`,value:`option2`},{label:`Option 3`,value:`option3`},{label:`Option 4`,value:`option4`}],D={name:`Basic`,args:{options:E,placeholder:`Select an option`,style:{width:200},ghost:!1,autoSelectOption:!1}},O={render:()=>(0,u.jsxs)(o,{direction:`column`,gap:`md`,style:{padding:24,background:`#1890ff`},children:[(0,u.jsxs)(o,{direction:`column`,gap:`xs`,children:[(0,u.jsx)(i,{style:{color:`white`},children:`Ghost Style (Transparent)`}),(0,u.jsx)(c,{options:E,placeholder:`Select option`,ghost:!0,style:{width:200}})]}),(0,u.jsxs)(o,{direction:`column`,gap:`xs`,children:[(0,u.jsx)(i,{style:{color:`white`},children:`Normal Style`}),(0,u.jsx)(c,{options:E,placeholder:`Select option`,ghost:!1,style:{width:200}})]})]})},k={render:()=>{let[e,t]=(0,l.useState)(),[n,r]=(0,l.useState)();return(0,u.jsxs)(o,{direction:`column`,gap:`md`,children:[(0,u.jsxs)(o,{direction:`column`,gap:`xs`,children:[(0,u.jsx)(i,{children:`Auto-select enabled (first option selected)`}),(0,u.jsx)(c,{options:E,placeholder:`Auto-selects first option`,autoSelectOption:!0,value:e,onChange:t,style:{width:250}}),(0,u.jsxs)(i,{type:`secondary`,children:[`Selected: `,e||`None`]})]}),(0,u.jsxs)(o,{direction:`column`,gap:`xs`,children:[(0,u.jsx)(i,{children:`Auto-select disabled`}),(0,u.jsx)(c,{options:E,placeholder:`Select manually`,autoSelectOption:!1,value:n,onChange:r,style:{width:250}}),(0,u.jsxs)(i,{type:`secondary`,children:[`Selected: `,n||`None`]})]})]})}},A={render:()=>(0,u.jsx)(o,{direction:`column`,gap:`md`,children:(0,u.jsxs)(o,{direction:`column`,gap:`xs`,children:[(0,u.jsx)(i,{children:`Hover over the select to see tooltip`}),(0,u.jsx)(c,{options:E,placeholder:`Select an option`,tooltip:`This is a helpful tooltip message`,style:{width:250}})]})})},j={render:()=>(0,u.jsxs)(o,{direction:`column`,gap:`md`,children:[(0,u.jsxs)(o,{direction:`column`,gap:`xs`,children:[(0,u.jsx)(i,{children:`Select with custom footer (string)`}),(0,u.jsx)(c,{options:E,placeholder:`Open dropdown to see footer`,footer:`Total: 4 options`,style:{width:250}})]}),(0,u.jsxs)(o,{direction:`column`,gap:`xs`,children:[(0,u.jsx)(i,{children:`Select with custom footer (ReactNode)`}),(0,u.jsx)(c,{options:E,placeholder:`Open dropdown`,footer:(0,u.jsx)(i,{type:`secondary`,style:{fontSize:`12px`},children:`Custom footer content`}),style:{width:250}})]})]})},M={render:()=>{let[e,t]=(0,l.useState)(Array.from({length:20},(e,t)=>({label:`Option ${t+1}`,value:`option${t+1}`}))),[n,r]=(0,l.useState)(!1);return(0,u.jsxs)(o,{direction:`column`,gap:`xs`,children:[(0,u.jsx)(i,{children:`Scroll to bottom to load more options`}),(0,u.jsx)(c,{options:e,placeholder:`Scroll down to load more`,endReached:()=>{n||(r(!0),setTimeout(()=>{let n=e.length,i=Array.from({length:10},(e,t)=>({label:`Option ${n+t+1}`,value:`option${n+t+1}`}));t([...e,...i]),r(!1)},1e3))},loading:n,footer:n?`Loading more...`:`${e.length} options loaded`,style:{width:250}})]})}},N={render:()=>{let[e,t]=(0,l.useState)(E);return(0,u.jsxs)(o,{direction:`column`,gap:`xs`,children:[(0,u.jsx)(i,{children:`Type to search with async action`}),(0,u.jsx)(c,{options:e,placeholder:`Type to search...`,searchAction:async e=>{if(await new Promise(e=>setTimeout(e,500)),!e)t(E);else{let n=E.filter(t=>t.label.toLowerCase().includes(e.toLowerCase()));t(n)}},showSearch:!0,filterOption:!1,style:{width:250}})]})}},D.parameters={...D.parameters,docs:{...(d=D.parameters)==null?void 0:d.docs,source:{originalSource:`{
  name: 'Basic',
  args: {
    options: sampleOptions,
    placeholder: 'Select an option',
    style: {
      width: 200
    },
    ghost: false,
    autoSelectOption: false
  }
}`,...(f=D.parameters)==null||(f=f.docs)==null?void 0:f.source}}},O.parameters={...O.parameters,docs:{...(p=O.parameters)==null?void 0:p.docs,source:{originalSource:`{
  render: () => <BAIFlex direction="column" gap="md" style={{
    padding: 24,
    background: '#1890ff'
  }}>
      <BAIFlex direction="column" gap="xs">
        <BAIText style={{
        color: 'white'
      }}>Ghost Style (Transparent)</BAIText>
        <BAISelect options={sampleOptions} placeholder="Select option" ghost={true} style={{
        width: 200
      }} />
      </BAIFlex>
      <BAIFlex direction="column" gap="xs">
        <BAIText style={{
        color: 'white'
      }}>Normal Style</BAIText>
        <BAISelect options={sampleOptions} placeholder="Select option" ghost={false} style={{
        width: 200
      }} />
      </BAIFlex>
    </BAIFlex>
}`,...(m=O.parameters)==null||(m=m.docs)==null?void 0:m.source}}},k.parameters={...k.parameters,docs:{...(h=k.parameters)==null?void 0:h.docs,source:{originalSource:`{
  render: () => {
    const [value1, setValue1] = useState<string>();
    const [value2, setValue2] = useState<string>();
    return <BAIFlex direction="column" gap="md">
        <BAIFlex direction="column" gap="xs">
          <BAIText>Auto-select enabled (first option selected)</BAIText>
          <BAISelect options={sampleOptions} placeholder="Auto-selects first option" autoSelectOption={true} value={value1} onChange={setValue1} style={{
          width: 250
        }} />
          <BAIText type="secondary">Selected: {value1 || 'None'}</BAIText>
        </BAIFlex>
        <BAIFlex direction="column" gap="xs">
          <BAIText>Auto-select disabled</BAIText>
          <BAISelect options={sampleOptions} placeholder="Select manually" autoSelectOption={false} value={value2} onChange={setValue2} style={{
          width: 250
        }} />
          <BAIText type="secondary">Selected: {value2 || 'None'}</BAIText>
        </BAIFlex>
      </BAIFlex>;
  }
}`,...(g=k.parameters)==null||(g=g.docs)==null?void 0:g.source}}},A.parameters={...A.parameters,docs:{...(_=A.parameters)==null?void 0:_.docs,source:{originalSource:`{
  render: () => <BAIFlex direction="column" gap="md">
      <BAIFlex direction="column" gap="xs">
        <BAIText>Hover over the select to see tooltip</BAIText>
        <BAISelect options={sampleOptions} placeholder="Select an option" tooltip="This is a helpful tooltip message" style={{
        width: 250
      }} />
      </BAIFlex>
    </BAIFlex>
}`,...(v=A.parameters)==null||(v=v.docs)==null?void 0:v.source}}},j.parameters={...j.parameters,docs:{...(y=j.parameters)==null?void 0:y.docs,source:{originalSource:`{
  render: () => <BAIFlex direction="column" gap="md">
      <BAIFlex direction="column" gap="xs">
        <BAIText>Select with custom footer (string)</BAIText>
        <BAISelect options={sampleOptions} placeholder="Open dropdown to see footer" footer="Total: 4 options" style={{
        width: 250
      }} />
      </BAIFlex>
      <BAIFlex direction="column" gap="xs">
        <BAIText>Select with custom footer (ReactNode)</BAIText>
        <BAISelect options={sampleOptions} placeholder="Open dropdown" footer={<BAIText type="secondary" style={{
        fontSize: '12px'
      }}>
              Custom footer content
            </BAIText>} style={{
        width: 250
      }} />
      </BAIFlex>
    </BAIFlex>
}`,...(b=j.parameters)==null||(b=b.docs)==null?void 0:b.source}}},M.parameters={...M.parameters,docs:{...(x=M.parameters)==null?void 0:x.docs,source:{originalSource:`{
  render: () => {
    const [options, setOptions] = useState(Array.from({
      length: 20
    }, (_, i) => ({
      label: \`Option \${i + 1}\`,
      value: \`option\${i + 1}\`
    })));
    const [loading, setLoading] = useState(false);
    const handleEndReached = () => {
      if (loading) return;
      setLoading(true);
      // Simulate loading more options
      setTimeout(() => {
        const currentLength = options.length;
        const newOptions = Array.from({
          length: 10
        }, (_, i) => ({
          label: \`Option \${currentLength + i + 1}\`,
          value: \`option\${currentLength + i + 1}\`
        }));
        setOptions([...options, ...newOptions]);
        setLoading(false);
      }, 1000);
    };
    return <BAIFlex direction="column" gap="xs">
        <BAIText>Scroll to bottom to load more options</BAIText>
        <BAISelect options={options} placeholder="Scroll down to load more" endReached={handleEndReached} loading={loading} footer={loading ? 'Loading more...' : \`\${options.length} options loaded\`} style={{
        width: 250
      }} />
      </BAIFlex>;
  }
}`,...(S=M.parameters)==null||(S=S.docs)==null?void 0:S.source}}},N.parameters={...N.parameters,docs:{...(C=N.parameters)==null?void 0:C.docs,source:{originalSource:`{
  render: () => {
    const [options, setOptions] = useState(sampleOptions);
    const handleSearch = async (value: string) => {
      // Simulate async search
      await new Promise(resolve => setTimeout(resolve, 500));
      if (!value) {
        setOptions(sampleOptions);
      } else {
        const filtered = sampleOptions.filter(opt => opt.label.toLowerCase().includes(value.toLowerCase()));
        setOptions(filtered);
      }
    };
    return <BAIFlex direction="column" gap="xs">
        <BAIText>Type to search with async action</BAIText>
        <BAISelect options={options} placeholder="Type to search..." searchAction={handleSearch} showSearch filterOption={false} style={{
        width: 250
      }} />
      </BAIFlex>;
  }
}`,...(w=N.parameters)==null||(w=w.docs)==null?void 0:w.source}}},P=[`Default`,`GhostStyle`,`AutoSelectOption`,`WithTooltip`,`WithFooter`,`InfiniteScroll`,`AsyncSearch`]})))()}F();export{N as AsyncSearch,k as AutoSelectOption,D as Default,O as GhostStyle,M as InfiniteScroll,j as WithFooter,A as WithTooltip,P as __namedExportsOrder,T as default};