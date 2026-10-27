import{n as e}from"./rolldown-runtime-2s6bX4vc.js";import{c as t,s as n}from"./iframe-DR2sIF5r.js";import{n as r,t as i}from"./BAIFlex-CAz1t6J5.js";import{n as a,t as o}from"./BAIButton-C-o5ANgR.js";import{useState as s}from"react";import{jsx as c,jsxs as l}from"react/jsx-runtime";var u,d,f,p,m,h,g;function _(){return(_=e((()=>{a(),r(),t(),{action:u}=__STORYBOOK_MODULE_ACTIONS__,d={title:`Button/BAIButton`,component:o,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:`
**BAIButton** extends [Ant Design Button](https://ant.design/components/button).

## BAI-Specific Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`action\` | \`() => Promise<void>\` | \`undefined\` | Async operation with automatic loading state via React Transition |

## Key Features
- **Automatic Loading State**: When \`action\` is provided, the button automatically shows loading state during async execution
- **React Transition Integration**: Uses \`useTransition\` for responsive UI updates
- **Double-Click Prevention**: Automatically prevents multiple clicks during execution
- **Composable**: Can combine \`action\` with \`onClick\` for sync + async logic

For all other props, refer to [Ant Design Button](https://ant.design/components/button).
        `}}},argTypes:{action:{control:!1,description:`Async operation with automatic loading state management via React Transition`,table:{type:{summary:`() => Promise<void>`},defaultValue:{summary:`undefined`}}}}},f={name:`Basic`,args:{children:`Click me`,type:`primary`,action:async()=>{await new Promise(e=>setTimeout(e,2e3)),u(`action completed`)()}}},p={render:()=>{let[e,t]=s(0);return l(i,{direction:`column`,gap:`md`,align:`start`,children:[l(n,{children:[`Count: `,e]}),l(i,{gap:`md`,children:[c(o,{type:`primary`,action:async()=>{await new Promise(e=>setTimeout(e,1500)),t(e=>e+1)},children:`Async Action (auto-loading)`}),c(o,{type:`default`,onClick:()=>{t(e=>e+1)},children:`Sync onClick (no loading)`})]})]})}},m={render:()=>{let[e,t]=s(0);return l(i,{direction:`column`,gap:`md`,align:`start`,children:[l(n,{children:[`API calls made: `,e,` (try clicking multiple times quickly)`]}),c(o,{type:`primary`,action:async()=>{t(e=>e+1),await new Promise(e=>setTimeout(e,3e3))},children:`Submit (3s delay)`})]})}},h={render:()=>{let[e,t]=s([]),r=e=>{t(t=>[...t,`${new Date().toLocaleTimeString()}: ${e}`])};return l(i,{direction:`column`,gap:`md`,align:`start`,children:[c(o,{type:`primary`,action:async()=>{r(`Async action started`),await new Promise(e=>setTimeout(e,2e3)),r(`Async action completed`)},onClick:()=>{r(`Sync onClick executed`)},children:`Both action & onClick`}),c(i,{direction:`column`,style:{maxHeight:200,overflow:`auto`,fontSize:`12px`},children:e.map((e,t)=>c(n,{children:e},t))})]})}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  name: 'Basic',
  args: {
    children: 'Click me',
    type: 'primary',
    action: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      action('action completed')();
    }
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [count, setCount] = useState(0);
    return <BAIFlex direction="column" gap="md" align="start">
        <BAIText>Count: {count}</BAIText>
        <BAIFlex gap="md">
          <BAIButton type="primary" action={async () => {
          // Simulate async operation (e.g., API call)
          await new Promise(resolve => setTimeout(resolve, 1500));
          setCount(prev => prev + 1);
        }}>
            Async Action (auto-loading)
          </BAIButton>

          <BAIButton type="default" onClick={() => {
          setCount(prev => prev + 1);
        }}>
            Sync onClick (no loading)
          </BAIButton>
        </BAIFlex>
      </BAIFlex>;
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [clickCount, setClickCount] = useState(0);
    return <BAIFlex direction="column" gap="md" align="start">
        <BAIText>
          API calls made: {clickCount} (try clicking multiple times quickly)
        </BAIText>
        <BAIButton type="primary" action={async () => {
        setClickCount(prev => prev + 1);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }}>
          Submit (3s delay)
        </BAIButton>
      </BAIFlex>;
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [logs, setLogs] = useState<string[]>([]);
    const addLog = (message: string) => {
      setLogs(prev => [...prev, \`\${new Date().toLocaleTimeString()}: \${message}\`]);
    };
    return <BAIFlex direction="column" gap="md" align="start">
        <BAIButton type="primary" action={async () => {
        addLog('Async action started');
        await new Promise(resolve => setTimeout(resolve, 2000));
        addLog('Async action completed');
      }} onClick={() => {
        addLog('Sync onClick executed');
      }}>
          Both action & onClick
        </BAIButton>

        <BAIFlex direction="column" style={{
        maxHeight: 200,
        overflow: 'auto',
        fontSize: '12px'
      }}>
          {logs.map((log, i) => <BAIText key={i}>{log}</BAIText>)}
        </BAIFlex>
      </BAIFlex>;
  }
}`,...h.parameters?.docs?.source}}},g=[`Default`,`WithAction`,`PreventDoubleClick`,`CombinedHandlers`]})))()}_();export{h as CombinedHandlers,f as Default,m as PreventDoubleClick,p as WithAction,g as __namedExportsOrder,d as default};