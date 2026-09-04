import{j as e}from"./iframe-BNdPrXzC.js";import{B as r}from"./BAIFlex-t7v_7TWh.js";import{B as t}from"./BAIStatistic-CHT_K-CG.js";import"./preload-helper-Dp1pzeXC.js";import"./isUndefined-DCTLXrZ8.js";import"./_castFunction-a6W-o7Lo.js";import"./identity-DKeuBCMA.js";import"./toInteger-Cv9eXtLj.js";import"./toFinite-BTGwAuhk.js";import"./_trimmedEndIndex-DuQxD0U0.js";import"./isSymbol-BE2u8Ce6.js";const L={title:"Statistic/BAIStatistic",component:t,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:"\n**BAIStatistic** is a statistic display component for showing numerical metrics with optional progress bars.\n\n## Features\n- Displays current/total statistics with customizable units\n- Supports infinity values with custom display text\n- Multiple progress bar modes (normal, ghost, hidden)\n- Configurable precision for decimal numbers\n- Automatic percentage calculation for progress\n- Tooltip support for progress bars\n\n## Props\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `title` | `ReactNode` | - | Statistic title |\n| `current` | `number` | - | Current value |\n| `total` | `number` | - | Total value (for percentage calculation) |\n| `unit` | `string` | `''` | Unit label (e.g., 'GB', 'sessions') |\n| `precision` | `number` | `2` | Decimal precision |\n| `infinityDisplay` | `string` | `'∞'` | Text to display for infinity values |\n| `progressMode` | `'ghost' \\| 'hidden' \\| 'normal'` | `'hidden'` | Progress bar display mode |\n| `progressSteps` | `number` | `20` | Number of steps in progress bar |\n| `style` | `CSSProperties` | - | Custom styles (color affects value and progress) |\n\nThis is a BAI-specific component (not extending Ant Design).\n        "}}},argTypes:{title:{control:{type:"text"},description:"Statistic title",table:{type:{summary:"ReactNode"}}},current:{control:{type:"number"},description:"Current value",table:{type:{summary:"number"}}},total:{control:{type:"number"},description:"Total value (for percentage calculation)",table:{type:{summary:"number"}}},unit:{control:{type:"text"},description:"Unit label",table:{type:{summary:"string"},defaultValue:{summary:"''"}}},precision:{control:{type:"number"},description:"Decimal precision",table:{type:{summary:"number"},defaultValue:{summary:"2"}}},infinityDisplay:{control:{type:"text"},description:"Text to display for infinity values",table:{type:{summary:"string"},defaultValue:{summary:"'∞'"}}},progressMode:{control:{type:"select"},options:["hidden","normal","ghost"],description:"Progress bar display mode",table:{type:{summary:"'ghost' | 'hidden' | 'normal'"},defaultValue:{summary:"'hidden'"}}},progressSteps:{control:{type:"number"},description:"Number of steps in progress bar",table:{type:{summary:"number"},defaultValue:{summary:"20"}}},style:{control:!1,description:"Custom styles",table:{type:{summary:"CSSProperties"}}}}},s={args:{title:"CPU Usage",current:45.5,total:100,unit:"cores",progressMode:"normal"}},o={parameters:{docs:{description:{story:"BAIStatistic supports three progress modes: `normal` (with tooltip), `ghost` (placeholder), and `hidden` (no progress bar)."}}},render:()=>e.jsxs(r,{gap:"xl",wrap:"wrap",children:[e.jsx(t,{title:"Normal Mode",current:75,total:100,unit:"GB",progressMode:"normal"}),e.jsx(t,{title:"Ghost Mode",current:75,total:100,unit:"GB",progressMode:"ghost"}),e.jsx(t,{title:"Hidden Mode",current:75,total:100,unit:"GB",progressMode:"hidden"})]})},i={parameters:{docs:{description:{story:'When `current` is `Infinity`, displays custom text (default: "∞" or "Unlimited"). Use `infinityDisplay` to customize.'}}},render:()=>e.jsxs(r,{gap:"xl",wrap:"wrap",children:[e.jsx(t,{title:"Memory Limit",current:1/0,unit:"GB"}),e.jsx(t,{title:"Storage Quota",current:1/0,unit:"TB",infinityDisplay:"No Limit"})]})},n={parameters:{docs:{description:{story:"Control decimal precision using the `precision` prop. Trailing zeros are automatically removed."}}},render:()=>e.jsxs(r,{gap:"xl",wrap:"wrap",children:[e.jsx(t,{title:"Default Precision (2)",current:12.3456,unit:"GB",precision:2,progressMode:"normal",total:100}),e.jsx(t,{title:"High Precision (4)",current:12.3456,unit:"GB",precision:4,progressMode:"normal",total:100}),e.jsx(t,{title:"No Decimal (0)",current:12.3456,unit:"GB",precision:0,progressMode:"normal",total:100})]})},a={parameters:{docs:{description:{story:"Use `style` prop to customize appearance. The `color` property affects both the value text and progress bar."}}},render:()=>e.jsxs(r,{gap:"xl",wrap:"wrap",children:[e.jsx(t,{title:"Success State",current:25,total:100,unit:"sessions",progressMode:"normal",style:{color:"#52c41a"}}),e.jsx(t,{title:"Warning State",current:75,total:100,unit:"sessions",progressMode:"normal",style:{color:"#faad14"}}),e.jsx(t,{title:"Danger State",current:95,total:100,unit:"sessions",progressMode:"normal",style:{color:"#ff4d4f"}})]})},l={parameters:{docs:{description:{story:"Customize the number of progress bar steps using `progressSteps` prop."}}},render:()=>e.jsxs(r,{gap:"xl",wrap:"wrap",children:[e.jsx(t,{title:"5 Steps",current:60,total:100,unit:"%",progressMode:"normal",progressSteps:5}),e.jsx(t,{title:"10 Steps",current:60,total:100,unit:"%",progressMode:"normal",progressSteps:10}),e.jsx(t,{title:"20 Steps (Default)",current:60,total:100,unit:"%",progressMode:"normal",progressSteps:20})]})},p={parameters:{docs:{description:{story:"Real-world usage examples showing different metric types commonly found in Backend.AI."}}},render:()=>e.jsxs(r,{gap:"xl",wrap:"wrap",children:[e.jsx(t,{title:"Active Sessions",current:8,total:50,unit:"sessions",progressMode:"normal"}),e.jsx(t,{title:"GPU Memory",current:15.75,total:32,unit:"GB",progressMode:"normal",style:{color:"#1890ff"}}),e.jsx(t,{title:"Storage Used",current:256.8,total:1e3,unit:"GB",progressMode:"normal",precision:1}),e.jsx(t,{title:"CPU Cores",current:1/0,unit:"cores",progressMode:"hidden"})]})};var c,u,d;s.parameters={...s.parameters,docs:{...(c=s.parameters)==null?void 0:c.docs,source:{originalSource:`{
  args: {
    title: 'CPU Usage',
    current: 45.5,
    total: 100,
    unit: 'cores',
    progressMode: 'normal'
  }
}`,...(d=(u=s.parameters)==null?void 0:u.docs)==null?void 0:d.source}}};var m,g,y;o.parameters={...o.parameters,docs:{...(m=o.parameters)==null?void 0:m.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'BAIStatistic supports three progress modes: \`normal\` (with tooltip), \`ghost\` (placeholder), and \`hidden\` (no progress bar).'
      }
    }
  },
  render: () => <BAIFlex gap="xl" wrap="wrap">
      <BAIStatistic title="Normal Mode" current={75} total={100} unit="GB" progressMode="normal" />
      <BAIStatistic title="Ghost Mode" current={75} total={100} unit="GB" progressMode="ghost" />
      <BAIStatistic title="Hidden Mode" current={75} total={100} unit="GB" progressMode="hidden" />
    </BAIFlex>
}`,...(y=(g=o.parameters)==null?void 0:g.docs)==null?void 0:y.source}}};var f,S,x;i.parameters={...i.parameters,docs:{...(f=i.parameters)==null?void 0:f.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'When \`current\` is \`Infinity\`, displays custom text (default: "∞" or "Unlimited"). Use \`infinityDisplay\` to customize.'
      }
    }
  },
  render: () => <BAIFlex gap="xl" wrap="wrap">
      <BAIStatistic title="Memory Limit" current={Infinity} unit="GB" />
      <BAIStatistic title="Storage Quota" current={Infinity} unit="TB" infinityDisplay="No Limit" />
    </BAIFlex>
}`,...(x=(S=i.parameters)==null?void 0:S.docs)==null?void 0:x.source}}};var B,h,I;n.parameters={...n.parameters,docs:{...(B=n.parameters)==null?void 0:B.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Control decimal precision using the \`precision\` prop. Trailing zeros are automatically removed.'
      }
    }
  },
  render: () => <BAIFlex gap="xl" wrap="wrap">
      <BAIStatistic title="Default Precision (2)" current={12.3456} unit="GB" precision={2} progressMode="normal" total={100} />
      <BAIStatistic title="High Precision (4)" current={12.3456} unit="GB" precision={4} progressMode="normal" total={100} />
      <BAIStatistic title="No Decimal (0)" current={12.3456} unit="GB" precision={0} progressMode="normal" total={100} />
    </BAIFlex>
}`,...(I=(h=n.parameters)==null?void 0:h.docs)==null?void 0:I.source}}};var M,b,A;a.parameters={...a.parameters,docs:{...(M=a.parameters)==null?void 0:M.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Use \`style\` prop to customize appearance. The \`color\` property affects both the value text and progress bar.'
      }
    }
  },
  render: () => <BAIFlex gap="xl" wrap="wrap">
      <BAIStatistic title="Success State" current={25} total={100} unit="sessions" progressMode="normal" style={{
      color: '#52c41a'
    }} />
      <BAIStatistic title="Warning State" current={75} total={100} unit="sessions" progressMode="normal" style={{
      color: '#faad14'
    }} />
      <BAIStatistic title="Danger State" current={95} total={100} unit="sessions" progressMode="normal" style={{
      color: '#ff4d4f'
    }} />
    </BAIFlex>
}`,...(A=(b=a.parameters)==null?void 0:b.docs)==null?void 0:A.source}}};var w,j,G;l.parameters={...l.parameters,docs:{...(w=l.parameters)==null?void 0:w.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Customize the number of progress bar steps using \`progressSteps\` prop.'
      }
    }
  },
  render: () => <BAIFlex gap="xl" wrap="wrap">
      <BAIStatistic title="5 Steps" current={60} total={100} unit="%" progressMode="normal" progressSteps={5} />
      <BAIStatistic title="10 Steps" current={60} total={100} unit="%" progressMode="normal" progressSteps={10} />
      <BAIStatistic title="20 Steps (Default)" current={60} total={100} unit="%" progressMode="normal" progressSteps={20} />
    </BAIFlex>
}`,...(G=(j=l.parameters)==null?void 0:j.docs)==null?void 0:G.source}}};var D,P,C;p.parameters={...p.parameters,docs:{...(D=p.parameters)==null?void 0:D.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Real-world usage examples showing different metric types commonly found in Backend.AI.'
      }
    }
  },
  render: () => <BAIFlex gap="xl" wrap="wrap">
      <BAIStatistic title="Active Sessions" current={8} total={50} unit="sessions" progressMode="normal" />
      <BAIStatistic title="GPU Memory" current={15.75} total={32} unit="GB" progressMode="normal" style={{
      color: '#1890ff'
    }} />
      <BAIStatistic title="Storage Used" current={256.8} total={1000} unit="GB" progressMode="normal" precision={1} />
      <BAIStatistic title="CPU Cores" current={Infinity} unit="cores" progressMode="hidden" />
    </BAIFlex>
}`,...(C=(P=p.parameters)==null?void 0:P.docs)==null?void 0:C.source}}};const k=["Default","ProgressModes","InfinityValue","Precision","CustomStyling","ProgressSteps","RealWorldExamples"];export{a as CustomStyling,s as Default,i as InfinityValue,n as Precision,o as ProgressModes,l as ProgressSteps,p as RealWorldExamples,k as __namedExportsOrder,L as default};
