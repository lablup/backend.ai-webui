import{r as d,j as e,B as o}from"./iframe-D6ueB574.js";import{B as t}from"./BAIFlex-DdICkgWY.js";import{B as s}from"./BAISelect-tPzsOEFL.js";import"./preload-helper-Dp1pzeXC.js";import"./astryxLabel-Bu1ztOt-.js";import"./BAIDisabledOptionReason-CNDUrN2S.js";import"./BAIIconWithTooltip-i8f_hSFf.js";import"./IconWithTooltip2-B7ND68Lv.js";import"./circle-alert-DhfBUcqP.js";import"./runtime-BhgYCK9T.js";import"./formControl-BdMhypQl.js";import"./FormLayoutContext-DGvy9QOT.js";import"./InputClearButton-B8WwyjHJ.js";import"./FieldStatus-Bnw2gM-d.js";import"./useIsHydrating-BtN3bWBg.js";import"./useDevWarning-gI2uejT9.js";import"./Selector-DQIQZCRi.js";import"./useMenuOverflow-BgHW6QYj.js";import"./useResolvedRequired-DbqtdhQV.js";import"./SelectorOption-BXuChrAF.js";import"./Item-DIi6-OEV.js";import"./computeTargetAndRel-BGwjeA1c.js";import"./fieldParts-CdytlXIl.js";import"./composeEventHandlers-BolWE7qY.js";import"./Section-CNDXFOLb.js";import"./usePopover-D8XgaSSe.js";import"./rtlStyles-T4i24HtE.js";import"./useIndicator-CU0a2nDT.js";import"./Divider-7NjVilx_.js";import"./isRtlElement-B2-7SF8s.js";import"./Badge-WASdQY4F.js";import"./CheckboxInput-BobnmP6T.js";import"./index-DsK0CQ2U.js";import"./isString-DwtXSowq.js";import"./isEmpty-D-2yJ_8c.js";const je={title:"Select/BAISelect",component:s,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:"\n**BAISelect** extends [Ant Design Select](https://ant.design/components/select).\n\n## BAI-Specific Props\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `ghost` | `boolean` | `false` | Transparent background style |\n| `autoSelectOption` | `boolean \\| (options) => value` | - | Auto-select first option when empty |\n| `tooltip` | `string` | `''` | Tooltip text for the select |\n| `footer` | `ReactNode \\| string` | - | Custom footer in dropdown |\n| `endReached` | `() => void` | - | Callback when scroll reaches end |\n| `searchAction` | `(value: string) => Promise<void>` | - | Async search with transition |\n| `atBottomThreshold` | `number` | `30` | Threshold for bottom detection (px) |\n| `atBottomStateChange` | `(atBottom: boolean) => void` | - | Callback for bottom state changes |\n\nFor all other props, refer to [Ant Design Select](https://ant.design/components/select).\n        "}}},argTypes:{ghost:{control:{type:"boolean"},description:"Transparent background style",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},autoSelectOption:{control:{type:"boolean"},description:"Auto-select first option when value is empty",table:{type:{summary:"boolean | (options) => value"},defaultValue:{summary:"-"}}},tooltip:{control:{type:"text"},description:"Tooltip text displayed on hover",table:{type:{summary:"string"},defaultValue:{summary:"''"}}},footer:{control:!1,description:"Custom footer content in dropdown",table:{type:{summary:"ReactNode | string"},defaultValue:{summary:"-"}}},endReached:{control:!1,description:"Callback when scroll reaches end (for infinite scroll)",table:{type:{summary:"() => void"},defaultValue:{summary:"-"}}},searchAction:{control:!1,description:"Async search action with React transition",table:{type:{summary:"(value: string) => Promise<void>"},defaultValue:{summary:"-"}}},atBottomThreshold:{control:{type:"number"},description:"Threshold for bottom detection in pixels",table:{type:{summary:"number"},defaultValue:{summary:"30"}}},atBottomStateChange:{control:!1,description:"Callback for bottom state changes",table:{type:{summary:"(atBottom: boolean) => void"},defaultValue:{summary:"-"}}}}},n=[{label:"Option 1",value:"option1"},{label:"Option 2",value:"option2"},{label:"Option 3",value:"option3"},{label:"Option 4",value:"option4"}],u={name:"Basic",args:{options:n,placeholder:"Select an option",style:{width:200},ghost:!1,autoSelectOption:!1}},h={render:()=>e.jsxs(t,{direction:"column",gap:"md",style:{padding:24,background:"#1890ff"},children:[e.jsxs(t,{direction:"column",gap:"xs",children:[e.jsx(o,{style:{color:"white"},children:"Ghost Style (Transparent)"}),e.jsx(s,{options:n,placeholder:"Select option",ghost:!0,style:{width:200}})]}),e.jsxs(t,{direction:"column",gap:"xs",children:[e.jsx(o,{style:{color:"white"},children:"Normal Style"}),e.jsx(s,{options:n,placeholder:"Select option",ghost:!1,style:{width:200}})]})]})},x={render:()=>{const[l,i]=d.useState(),[a,r]=d.useState();return e.jsxs(t,{direction:"column",gap:"md",children:[e.jsxs(t,{direction:"column",gap:"xs",children:[e.jsx(o,{children:"Auto-select enabled (first option selected)"}),e.jsx(s,{options:n,placeholder:"Auto-selects first option",autoSelectOption:!0,value:l,onChange:i,style:{width:250}}),e.jsxs(o,{type:"secondary",children:["Selected: ",l||"None"]})]}),e.jsxs(t,{direction:"column",gap:"xs",children:[e.jsx(o,{children:"Auto-select disabled"}),e.jsx(s,{options:n,placeholder:"Select manually",autoSelectOption:!1,value:a,onChange:r,style:{width:250}}),e.jsxs(o,{type:"secondary",children:["Selected: ",a||"None"]})]})]})}},y={render:()=>e.jsx(t,{direction:"column",gap:"md",children:e.jsxs(t,{direction:"column",gap:"xs",children:[e.jsx(o,{children:"Hover over the select to see tooltip"}),e.jsx(s,{options:n,placeholder:"Select an option",tooltip:"This is a helpful tooltip message",style:{width:250}})]})})},g={render:()=>e.jsxs(t,{direction:"column",gap:"md",children:[e.jsxs(t,{direction:"column",gap:"xs",children:[e.jsx(o,{children:"Select with custom footer (string)"}),e.jsx(s,{options:n,placeholder:"Open dropdown to see footer",footer:"Total: 4 options",style:{width:250}})]}),e.jsxs(t,{direction:"column",gap:"xs",children:[e.jsx(o,{children:"Select with custom footer (ReactNode)"}),e.jsx(s,{options:n,placeholder:"Open dropdown",footer:e.jsx(o,{type:"secondary",style:{fontSize:"12px"},children:"Custom footer content"}),style:{width:250}})]})]})},A={render:()=>{const[l,i]=d.useState(Array.from({length:20},(p,m)=>({label:`Option ${m+1}`,value:`option${m+1}`}))),[a,r]=d.useState(!1),c=()=>{a||(r(!0),setTimeout(()=>{const p=l.length,m=Array.from({length:10},(X,B)=>({label:`Option ${p+B+1}`,value:`option${p+B+1}`}));i([...l,...m]),r(!1)},1e3))};return e.jsxs(t,{direction:"column",gap:"xs",children:[e.jsx(o,{children:"Scroll to bottom to load more options"}),e.jsx(s,{options:l,placeholder:"Scroll down to load more",endReached:c,loading:a,footer:a?"Loading more...":`${l.length} options loaded`,style:{width:250}})]})}},f={render:()=>{const[l,i]=d.useState(n),a=async r=>{if(await new Promise(c=>setTimeout(c,500)),!r)i(n);else{const c=n.filter(p=>p.label.toLowerCase().includes(r.toLowerCase()));i(c)}};return e.jsxs(t,{direction:"column",gap:"xs",children:[e.jsx(o,{children:"Type to search with async action"}),e.jsx(s,{options:l,placeholder:"Type to search...",searchAction:a,showSearch:!0,filterOption:!1,style:{width:250}})]})}},S={name:"Disabled Option With Reason",args:{options:[{label:"AK1A2B3C4D",value:"ak1"},{label:"AK9Z8Y7X6W",value:"ak2",disabled:{reason:"This keypair is inactive."}},{label:"AK5E6F7G8H",value:"ak3"}],placeholder:"Select an access key",style:{width:280}}};var I,b,w;u.parameters={...u.parameters,docs:{...(I=u.parameters)==null?void 0:I.docs,source:{originalSource:`{
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
}`,...(w=(b=u.parameters)==null?void 0:b.docs)==null?void 0:w.source}}};var T,O,v;h.parameters={...h.parameters,docs:{...(T=h.parameters)==null?void 0:T.docs,source:{originalSource:`{
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
}`,...(v=(O=h.parameters)==null?void 0:O.docs)==null?void 0:v.source}}};var j,F,C;x.parameters={...x.parameters,docs:{...(j=x.parameters)==null?void 0:j.docs,source:{originalSource:`{
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
}`,...(C=(F=x.parameters)==null?void 0:F.docs)==null?void 0:C.source}}};var k,R,L;y.parameters={...y.parameters,docs:{...(k=y.parameters)==null?void 0:k.docs,source:{originalSource:`{
  render: () => <BAIFlex direction="column" gap="md">
      <BAIFlex direction="column" gap="xs">
        <BAIText>Hover over the select to see tooltip</BAIText>
        <BAISelect options={sampleOptions} placeholder="Select an option" tooltip="This is a helpful tooltip message" style={{
        width: 250
      }} />
      </BAIFlex>
    </BAIFlex>
}`,...(L=(R=y.parameters)==null?void 0:R.docs)==null?void 0:L.source}}};var V,D,N;g.parameters={...g.parameters,docs:{...(V=g.parameters)==null?void 0:V.docs,source:{originalSource:`{
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
}`,...(N=(D=g.parameters)==null?void 0:D.docs)==null?void 0:N.source}}};var $,E,W;A.parameters={...A.parameters,docs:{...($=A.parameters)==null?void 0:$.docs,source:{originalSource:`{
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
}`,...(W=(E=A.parameters)==null?void 0:E.docs)==null?void 0:W.source}}};var G,K,P;f.parameters={...f.parameters,docs:{...(G=f.parameters)==null?void 0:G.docs,source:{originalSource:`{
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
}`,...(P=(K=f.parameters)==null?void 0:K.docs)==null?void 0:P.source}}};var _,H,z;S.parameters={...S.parameters,docs:{...(_=S.parameters)==null?void 0:_.docs,source:{originalSource:`{
  name: 'Disabled Option With Reason',
  args: {
    options: [{
      label: 'AK1A2B3C4D',
      value: 'ak1'
    }, {
      label: 'AK9Z8Y7X6W',
      value: 'ak2',
      disabled: {
        reason: 'This keypair is inactive.'
      }
    }, {
      label: 'AK5E6F7G8H',
      value: 'ak3'
    }],
    placeholder: 'Select an access key',
    style: {
      width: 280
    }
  }
}`,...(z=(H=S.parameters)==null?void 0:H.docs)==null?void 0:z.source}}};const Fe=["Default","GhostStyle","AutoSelectOption","WithTooltip","WithFooter","InfiniteScroll","AsyncSearch","DisabledOptionReason"];export{f as AsyncSearch,x as AutoSelectOption,u as Default,S as DisabledOptionReason,h as GhostStyle,A as InfiniteScroll,g as WithFooter,y as WithTooltip,Fe as __namedExportsOrder,je as default};
