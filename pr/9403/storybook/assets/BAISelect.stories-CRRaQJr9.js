import{r as d,j as e,B as o}from"./iframe-DmQqQVMA.js";import{B as t}from"./BAIFlex-Clxe_jdZ.js";import{B as s}from"./BAISelect-s1KMzRsw.js";import"./preload-helper-Dp1pzeXC.js";import"./astryxLabel-IvlKeJTj.js";import"./isString-D6wMu39F.js";import"./isEmpty-aBX7fcgQ.js";import"./usePopover-B3i0E5rw.js";import"./useDevWarning-C_RgMo7-.js";import"./rtlStyles-T4i24HtE.js";import"./InputClearButton-0l_GfJYj.js";import"./useResolvedRequired-DpPF9iMk.js";import"./Selector-BHLPEFhA.js";import"./useTypeahead-uFyAL8y4.js";import"./SelectorOption-DpNFZShj.js";import"./Item-CMR8m2XX.js";import"./InputGroupContext-RZo5ElI8.js";import"./useIndicator-Y3UpRkA2.js";import"./isRenderable-BUV0eL6r.js";import"./Divider-C8Tld6pH.js";import"./Badge-BKfmPevg.js";import"./CheckboxInput-CdNXB4Ut.js";const de={title:"Select/BAISelect",component:s,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:"\n**BAISelect** extends [Ant Design Select](https://ant.design/components/select).\n\n## BAI-Specific Props\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `ghost` | `boolean` | `false` | Transparent background style |\n| `autoSelectOption` | `boolean \\| (options) => value` | - | Auto-select first option when empty |\n| `tooltip` | `string` | `''` | Tooltip text for the select |\n| `footer` | `ReactNode \\| string` | - | Custom footer in dropdown |\n| `endReached` | `() => void` | - | Callback when scroll reaches end |\n| `searchAction` | `(value: string) => Promise<void>` | - | Async search with transition |\n| `atBottomThreshold` | `number` | `30` | Threshold for bottom detection (px) |\n| `atBottomStateChange` | `(atBottom: boolean) => void` | - | Callback for bottom state changes |\n\nFor all other props, refer to [Ant Design Select](https://ant.design/components/select).\n        "}}},argTypes:{ghost:{control:{type:"boolean"},description:"Transparent background style",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},autoSelectOption:{control:{type:"boolean"},description:"Auto-select first option when value is empty",table:{type:{summary:"boolean | (options) => value"},defaultValue:{summary:"-"}}},tooltip:{control:{type:"text"},description:"Tooltip text displayed on hover",table:{type:{summary:"string"},defaultValue:{summary:"''"}}},footer:{control:!1,description:"Custom footer content in dropdown",table:{type:{summary:"ReactNode | string"},defaultValue:{summary:"-"}}},endReached:{control:!1,description:"Callback when scroll reaches end (for infinite scroll)",table:{type:{summary:"() => void"},defaultValue:{summary:"-"}}},searchAction:{control:!1,description:"Async search action with React transition",table:{type:{summary:"(value: string) => Promise<void>"},defaultValue:{summary:"-"}}},atBottomThreshold:{control:{type:"number"},description:"Threshold for bottom detection in pixels",table:{type:{summary:"number"},defaultValue:{summary:"30"}}},atBottomStateChange:{control:!1,description:"Callback for bottom state changes",table:{type:{summary:"(atBottom: boolean) => void"},defaultValue:{summary:"-"}}}}},n=[{label:"Option 1",value:"option1"},{label:"Option 2",value:"option2"},{label:"Option 3",value:"option3"},{label:"Option 4",value:"option4"}],u={name:"Basic",args:{options:n,placeholder:"Select an option",style:{width:200},ghost:!1,autoSelectOption:!1}},h={render:()=>e.jsxs(t,{direction:"column",gap:"md",style:{padding:24,background:"#1890ff"},children:[e.jsxs(t,{direction:"column",gap:"xs",children:[e.jsx(o,{style:{color:"white"},children:"Ghost Style (Transparent)"}),e.jsx(s,{options:n,placeholder:"Select option",ghost:!0,style:{width:200}})]}),e.jsxs(t,{direction:"column",gap:"xs",children:[e.jsx(o,{style:{color:"white"},children:"Normal Style"}),e.jsx(s,{options:n,placeholder:"Select option",ghost:!1,style:{width:200}})]})]})},x={render:()=>{const[l,i]=d.useState(),[r,a]=d.useState();return e.jsxs(t,{direction:"column",gap:"md",children:[e.jsxs(t,{direction:"column",gap:"xs",children:[e.jsx(o,{children:"Auto-select enabled (first option selected)"}),e.jsx(s,{options:n,placeholder:"Auto-selects first option",autoSelectOption:!0,value:l,onChange:i,style:{width:250}}),e.jsxs(o,{type:"secondary",children:["Selected: ",l||"None"]})]}),e.jsxs(t,{direction:"column",gap:"xs",children:[e.jsx(o,{children:"Auto-select disabled"}),e.jsx(s,{options:n,placeholder:"Select manually",autoSelectOption:!1,value:r,onChange:a,style:{width:250}}),e.jsxs(o,{type:"secondary",children:["Selected: ",r||"None"]})]})]})}},g={render:()=>e.jsx(t,{direction:"column",gap:"md",children:e.jsxs(t,{direction:"column",gap:"xs",children:[e.jsx(o,{children:"Hover over the select to see tooltip"}),e.jsx(s,{options:n,placeholder:"Select an option",tooltip:"This is a helpful tooltip message",style:{width:250}})]})})},y={render:()=>e.jsxs(t,{direction:"column",gap:"md",children:[e.jsxs(t,{direction:"column",gap:"xs",children:[e.jsx(o,{children:"Select with custom footer (string)"}),e.jsx(s,{options:n,placeholder:"Open dropdown to see footer",footer:"Total: 4 options",style:{width:250}})]}),e.jsxs(t,{direction:"column",gap:"xs",children:[e.jsx(o,{children:"Select with custom footer (ReactNode)"}),e.jsx(s,{options:n,placeholder:"Open dropdown",footer:e.jsx(o,{type:"secondary",style:{fontSize:"12px"},children:"Custom footer content"}),style:{width:250}})]})]})},f={render:()=>{const[l,i]=d.useState(Array.from({length:20},(p,m)=>({label:`Option ${m+1}`,value:`option${m+1}`}))),[r,a]=d.useState(!1),c=()=>{r||(a(!0),setTimeout(()=>{const p=l.length,m=Array.from({length:10},(W,S)=>({label:`Option ${p+S+1}`,value:`option${p+S+1}`}));i([...l,...m]),a(!1)},1e3))};return e.jsxs(t,{direction:"column",gap:"xs",children:[e.jsx(o,{children:"Scroll to bottom to load more options"}),e.jsx(s,{options:l,placeholder:"Scroll down to load more",endReached:c,loading:r,footer:r?"Loading more...":`${l.length} options loaded`,style:{width:250}})]})}},A={render:()=>{const[l,i]=d.useState(n),r=async a=>{if(await new Promise(c=>setTimeout(c,500)),!a)i(n);else{const c=n.filter(p=>p.label.toLowerCase().includes(a.toLowerCase()));i(c)}};return e.jsxs(t,{direction:"column",gap:"xs",children:[e.jsx(o,{children:"Type to search with async action"}),e.jsx(s,{options:l,placeholder:"Type to search...",searchAction:r,showSearch:!0,filterOption:!1,style:{width:250}})]})}};var B,I,w;u.parameters={...u.parameters,docs:{...(B=u.parameters)==null?void 0:B.docs,source:{originalSource:`{
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
}`,...(w=(I=u.parameters)==null?void 0:I.docs)==null?void 0:w.source}}};var T,b,O;h.parameters={...h.parameters,docs:{...(T=h.parameters)==null?void 0:T.docs,source:{originalSource:`{
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
}`,...(O=(b=h.parameters)==null?void 0:b.docs)==null?void 0:O.source}}};var v,j,F;x.parameters={...x.parameters,docs:{...(v=x.parameters)==null?void 0:v.docs,source:{originalSource:`{
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
}`,...(F=(j=x.parameters)==null?void 0:j.docs)==null?void 0:F.source}}};var C,L,V;g.parameters={...g.parameters,docs:{...(C=g.parameters)==null?void 0:C.docs,source:{originalSource:`{
  render: () => <BAIFlex direction="column" gap="md">
      <BAIFlex direction="column" gap="xs">
        <BAIText>Hover over the select to see tooltip</BAIText>
        <BAISelect options={sampleOptions} placeholder="Select an option" tooltip="This is a helpful tooltip message" style={{
        width: 250
      }} />
      </BAIFlex>
    </BAIFlex>
}`,...(V=(L=g.parameters)==null?void 0:L.docs)==null?void 0:V.source}}};var R,N,$;y.parameters={...y.parameters,docs:{...(R=y.parameters)==null?void 0:R.docs,source:{originalSource:`{
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
}`,...($=(N=y.parameters)==null?void 0:N.docs)==null?void 0:$.source}}};var k,D,E;f.parameters={...f.parameters,docs:{...(k=f.parameters)==null?void 0:k.docs,source:{originalSource:`{
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
}`,...(E=(D=f.parameters)==null?void 0:D.docs)==null?void 0:E.source}}};var P,_,G;A.parameters={...A.parameters,docs:{...(P=A.parameters)==null?void 0:P.docs,source:{originalSource:`{
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
}`,...(G=(_=A.parameters)==null?void 0:_.docs)==null?void 0:G.source}}};const me=["Default","GhostStyle","AutoSelectOption","WithTooltip","WithFooter","InfiniteScroll","AsyncSearch"];export{A as AsyncSearch,x as AutoSelectOption,u as Default,h as GhostStyle,f as InfiniteScroll,y as WithFooter,g as WithTooltip,me as __namedExportsOrder,de as default};
