import{n as e}from"./rolldown-runtime-2s6bX4vc.js";import{c as t,s as n}from"./iframe-DR2sIF5r.js";import{n as r,t as i}from"./BAIFlex-CAz1t6J5.js";import{n as a,t as o}from"./BAISelect-Dty2gXL7.js";import{useState as s}from"react";import{jsx as c,jsxs as l}from"react/jsx-runtime";var u,d,f,p,m,h,g,_,v,y;function b(){return(b=e((()=>{r(),a(),t(),u={title:`Select/BAISelect`,component:o,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:"\n**BAISelect** extends [Ant Design Select](https://ant.design/components/select).\n\n## BAI-Specific Props\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `ghost` | `boolean` | `false` | Transparent background style |\n| `autoSelectOption` | `boolean \\| (options) => value` | - | Auto-select first option when empty |\n| `tooltip` | `string` | `''` | Tooltip text for the select |\n| `footer` | `ReactNode \\| string` | - | Custom footer in dropdown |\n| `endReached` | `() => void` | - | Callback when scroll reaches end |\n| `searchAction` | `(value: string) => Promise<void>` | - | Async search with transition |\n| `atBottomThreshold` | `number` | `30` | Threshold for bottom detection (px) |\n| `atBottomStateChange` | `(atBottom: boolean) => void` | - | Callback for bottom state changes |\n\nFor all other props, refer to [Ant Design Select](https://ant.design/components/select).\n        "}}},argTypes:{ghost:{control:{type:`boolean`},description:`Transparent background style`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},autoSelectOption:{control:{type:`boolean`},description:`Auto-select first option when value is empty`,table:{type:{summary:`boolean | (options) => value`},defaultValue:{summary:`-`}}},tooltip:{control:{type:`text`},description:`Tooltip text displayed on hover`,table:{type:{summary:`string`},defaultValue:{summary:`''`}}},footer:{control:!1,description:`Custom footer content in dropdown`,table:{type:{summary:`ReactNode | string`},defaultValue:{summary:`-`}}},endReached:{control:!1,description:`Callback when scroll reaches end (for infinite scroll)`,table:{type:{summary:`() => void`},defaultValue:{summary:`-`}}},searchAction:{control:!1,description:`Async search action with React transition`,table:{type:{summary:`(value: string) => Promise<void>`},defaultValue:{summary:`-`}}},atBottomThreshold:{control:{type:`number`},description:`Threshold for bottom detection in pixels`,table:{type:{summary:`number`},defaultValue:{summary:`30`}}},atBottomStateChange:{control:!1,description:`Callback for bottom state changes`,table:{type:{summary:`(atBottom: boolean) => void`},defaultValue:{summary:`-`}}}}},d=[{label:`Option 1`,value:`option1`},{label:`Option 2`,value:`option2`},{label:`Option 3`,value:`option3`},{label:`Option 4`,value:`option4`}],f={name:`Basic`,args:{options:d,placeholder:`Select an option`,style:{width:200},ghost:!1,autoSelectOption:!1}},p={render:()=>l(i,{direction:`column`,gap:`md`,style:{padding:24,background:`#1890ff`},children:[l(i,{direction:`column`,gap:`xs`,children:[c(n,{style:{color:`white`},children:`Ghost Style (Transparent)`}),c(o,{options:d,placeholder:`Select option`,ghost:!0,style:{width:200}})]}),l(i,{direction:`column`,gap:`xs`,children:[c(n,{style:{color:`white`},children:`Normal Style`}),c(o,{options:d,placeholder:`Select option`,ghost:!1,style:{width:200}})]})]})},m={render:()=>{let[e,t]=s(),[r,a]=s();return l(i,{direction:`column`,gap:`md`,children:[l(i,{direction:`column`,gap:`xs`,children:[c(n,{children:`Auto-select enabled (first option selected)`}),c(o,{options:d,placeholder:`Auto-selects first option`,autoSelectOption:!0,value:e,onChange:t,style:{width:250}}),l(n,{type:`secondary`,children:[`Selected: `,e||`None`]})]}),l(i,{direction:`column`,gap:`xs`,children:[c(n,{children:`Auto-select disabled`}),c(o,{options:d,placeholder:`Select manually`,autoSelectOption:!1,value:r,onChange:a,style:{width:250}}),l(n,{type:`secondary`,children:[`Selected: `,r||`None`]})]})]})}},h={render:()=>c(i,{direction:`column`,gap:`md`,children:l(i,{direction:`column`,gap:`xs`,children:[c(n,{children:`Hover over the select to see tooltip`}),c(o,{options:d,placeholder:`Select an option`,tooltip:`This is a helpful tooltip message`,style:{width:250}})]})})},g={render:()=>l(i,{direction:`column`,gap:`md`,children:[l(i,{direction:`column`,gap:`xs`,children:[c(n,{children:`Select with custom footer (string)`}),c(o,{options:d,placeholder:`Open dropdown to see footer`,footer:`Total: 4 options`,style:{width:250}})]}),l(i,{direction:`column`,gap:`xs`,children:[c(n,{children:`Select with custom footer (ReactNode)`}),c(o,{options:d,placeholder:`Open dropdown`,footer:c(n,{type:`secondary`,style:{fontSize:`12px`},children:`Custom footer content`}),style:{width:250}})]})]})},_={render:()=>{let[e,t]=s(Array.from({length:20},(e,t)=>({label:`Option ${t+1}`,value:`option${t+1}`}))),[r,a]=s(!1);return l(i,{direction:`column`,gap:`xs`,children:[c(n,{children:`Scroll to bottom to load more options`}),c(o,{options:e,placeholder:`Scroll down to load more`,endReached:()=>{r||(a(!0),setTimeout(()=>{let n=e.length,r=Array.from({length:10},(e,t)=>({label:`Option ${n+t+1}`,value:`option${n+t+1}`}));t([...e,...r]),a(!1)},1e3))},loading:r,footer:r?`Loading more...`:`${e.length} options loaded`,style:{width:250}})]})}},v={render:()=>{let[e,t]=s(d);return l(i,{direction:`column`,gap:`xs`,children:[c(n,{children:`Type to search with async action`}),c(o,{options:e,placeholder:`Type to search...`,searchAction:async e=>{if(await new Promise(e=>setTimeout(e,500)),!e)t(d);else{let n=d.filter(t=>t.label.toLowerCase().includes(e.toLowerCase()));t(n)}},showSearch:!0,filterOption:!1,style:{width:250}})]})}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
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
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <BAIFlex direction="column" gap="md">
      <BAIFlex direction="column" gap="xs">
        <BAIText>Hover over the select to see tooltip</BAIText>
        <BAISelect options={sampleOptions} placeholder="Select an option" tooltip="This is a helpful tooltip message" style={{
        width: 250
      }} />
      </BAIFlex>
    </BAIFlex>
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source}}},y=[`Default`,`GhostStyle`,`AutoSelectOption`,`WithTooltip`,`WithFooter`,`InfiniteScroll`,`AsyncSearch`]})))()}b();export{v as AsyncSearch,m as AutoSelectOption,f as Default,p as GhostStyle,_ as InfiniteScroll,g as WithFooter,h as WithTooltip,y as __namedExportsOrder,u as default};