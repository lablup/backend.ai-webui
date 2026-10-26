import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-MKhVqBIO.js";import{n,t as r}from"./BAIFlex-BOFoS5KY.js";import{n as i,t as a}from"./BAIStatistic-B8x5tJgv.js";var o,s,c,l,u,d,f,p,m,h;function g(){return(g=e((()=>{n(),i(),o=t(),s={title:`Statistic/BAIStatistic`,component:a,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:"\n**BAIStatistic** is a statistic display component for showing numerical metrics with optional progress bars.\n\n## Features\n- Displays current/total statistics with customizable units\n- Supports infinity values with custom display text\n- Multiple progress bar modes (normal, ghost, hidden)\n- Configurable precision for decimal numbers\n- Automatic percentage calculation for progress\n- Tooltip support for progress bars\n\n## Props\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `title` | `ReactNode` | - | Statistic title |\n| `current` | `number` | - | Current value |\n| `total` | `number` | - | Total value (for percentage calculation) |\n| `unit` | `string` | `''` | Unit label (e.g., 'GB', 'sessions') |\n| `precision` | `number` | `2` | Decimal precision |\n| `infinityDisplay` | `string` | `'∞'` | Text to display for infinity values |\n| `progressMode` | `'ghost' \\| 'hidden' \\| 'normal'` | `'hidden'` | Progress bar display mode |\n| `progressSteps` | `number` | `20` | Number of steps in progress bar |\n| `style` | `CSSProperties` | - | Custom styles (color affects value and progress) |\n\nThis is a BAI-specific component (not extending Ant Design).\n        "}}},argTypes:{title:{control:{type:`text`},description:`Statistic title`,table:{type:{summary:`ReactNode`}}},current:{control:{type:`number`},description:`Current value`,table:{type:{summary:`number`}}},total:{control:{type:`number`},description:`Total value (for percentage calculation)`,table:{type:{summary:`number`}}},unit:{control:{type:`text`},description:`Unit label`,table:{type:{summary:`string`},defaultValue:{summary:`''`}}},precision:{control:{type:`number`},description:`Decimal precision`,table:{type:{summary:`number`},defaultValue:{summary:`2`}}},infinityDisplay:{control:{type:`text`},description:`Text to display for infinity values`,table:{type:{summary:`string`},defaultValue:{summary:`'∞'`}}},progressMode:{control:{type:`select`},options:[`hidden`,`normal`,`ghost`],description:`Progress bar display mode`,table:{type:{summary:`'ghost' | 'hidden' | 'normal'`},defaultValue:{summary:`'hidden'`}}},progressSteps:{control:{type:`number`},description:`Number of steps in progress bar`,table:{type:{summary:`number`},defaultValue:{summary:`20`}}},style:{control:!1,description:`Custom styles`,table:{type:{summary:`CSSProperties`}}}}},c={args:{title:`CPU Usage`,current:45.5,total:100,unit:`cores`,progressMode:`normal`}},l={parameters:{docs:{description:{story:"BAIStatistic supports three progress modes: `normal` (with tooltip), `ghost` (placeholder), and `hidden` (no progress bar)."}}},render:()=>(0,o.jsxs)(r,{gap:`xl`,wrap:`wrap`,children:[(0,o.jsx)(a,{title:`Normal Mode`,current:75,total:100,unit:`GB`,progressMode:`normal`}),(0,o.jsx)(a,{title:`Ghost Mode`,current:75,total:100,unit:`GB`,progressMode:`ghost`}),(0,o.jsx)(a,{title:`Hidden Mode`,current:75,total:100,unit:`GB`,progressMode:`hidden`})]})},u={parameters:{docs:{description:{story:'When `current` is `Infinity`, displays custom text (default: "∞" or "Unlimited"). Use `infinityDisplay` to customize.'}}},render:()=>(0,o.jsxs)(r,{gap:`xl`,wrap:`wrap`,children:[(0,o.jsx)(a,{title:`Memory Limit`,current:1/0,unit:`GB`}),(0,o.jsx)(a,{title:`Storage Quota`,current:1/0,unit:`TB`,infinityDisplay:`No Limit`})]})},d={parameters:{docs:{description:{story:"Control decimal precision using the `precision` prop. Trailing zeros are automatically removed."}}},render:()=>(0,o.jsxs)(r,{gap:`xl`,wrap:`wrap`,children:[(0,o.jsx)(a,{title:`Default Precision (2)`,current:12.3456,unit:`GB`,precision:2,progressMode:`normal`,total:100}),(0,o.jsx)(a,{title:`High Precision (4)`,current:12.3456,unit:`GB`,precision:4,progressMode:`normal`,total:100}),(0,o.jsx)(a,{title:`No Decimal (0)`,current:12.3456,unit:`GB`,precision:0,progressMode:`normal`,total:100})]})},f={parameters:{docs:{description:{story:"Use `style` prop to customize appearance. The `color` property affects both the value text and progress bar."}}},render:()=>(0,o.jsxs)(r,{gap:`xl`,wrap:`wrap`,children:[(0,o.jsx)(a,{title:`Success State`,current:25,total:100,unit:`sessions`,progressMode:`normal`,style:{color:`#52c41a`}}),(0,o.jsx)(a,{title:`Warning State`,current:75,total:100,unit:`sessions`,progressMode:`normal`,style:{color:`#faad14`}}),(0,o.jsx)(a,{title:`Danger State`,current:95,total:100,unit:`sessions`,progressMode:`normal`,style:{color:`#ff4d4f`}})]})},p={parameters:{docs:{description:{story:"Customize the number of progress bar steps using `progressSteps` prop."}}},render:()=>(0,o.jsxs)(r,{gap:`xl`,wrap:`wrap`,children:[(0,o.jsx)(a,{title:`5 Steps`,current:60,total:100,unit:`%`,progressMode:`normal`,progressSteps:5}),(0,o.jsx)(a,{title:`10 Steps`,current:60,total:100,unit:`%`,progressMode:`normal`,progressSteps:10}),(0,o.jsx)(a,{title:`20 Steps (Default)`,current:60,total:100,unit:`%`,progressMode:`normal`,progressSteps:20})]})},m={parameters:{docs:{description:{story:`Real-world usage examples showing different metric types commonly found in Backend.AI.`}}},render:()=>(0,o.jsxs)(r,{gap:`xl`,wrap:`wrap`,children:[(0,o.jsx)(a,{title:`Active Sessions`,current:8,total:50,unit:`sessions`,progressMode:`normal`}),(0,o.jsx)(a,{title:`GPU Memory`,current:15.75,total:32,unit:`GB`,progressMode:`normal`,style:{color:`#1890ff`}}),(0,o.jsx)(a,{title:`Storage Used`,current:256.8,total:1e3,unit:`GB`,progressMode:`normal`,precision:1}),(0,o.jsx)(a,{title:`CPU Cores`,current:1/0,unit:`cores`,progressMode:`hidden`})]})},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    title: 'CPU Usage',
    current: 45.5,
    total: 100,
    unit: 'cores',
    progressMode: 'normal'
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
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
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
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
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
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
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
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
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}},h=[`Default`,`ProgressModes`,`InfinityValue`,`Precision`,`CustomStyling`,`ProgressSteps`,`RealWorldExamples`]})))()}g();export{f as CustomStyling,c as Default,u as InfinityValue,d as Precision,l as ProgressModes,p as ProgressSteps,m as RealWorldExamples,h as __namedExportsOrder,s as default};