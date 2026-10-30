import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-DlPsW1c0.js";import{t as n}from"./jsx-runtime-MKhVqBIO.js";import{h as r,m as i}from"./iframe-2xVgh8Dn.js";import{n as a,t as o}from"./BAIFlex-DnaoYTJ1.js";import{n as s,t as c}from"./BAIButton-CGu0YgvS.js";var l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T;function E(){return(E=e((()=>{s(),a(),r(),l=t(),u=n(),{action:y}=__STORYBOOK_MODULE_ACTIONS__,b={title:`Button/BAIButton`,component:c,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:`
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
        `}}},argTypes:{action:{control:!1,description:`Async operation with automatic loading state management via React Transition`,table:{type:{summary:`() => Promise<void>`},defaultValue:{summary:`undefined`}}}}},x={name:`Basic`,args:{children:`Click me`,type:`primary`,action:async()=>{await new Promise(e=>setTimeout(e,2e3)),y(`action completed`)()}}},S={render:()=>{let[e,t]=(0,l.useState)(0);return(0,u.jsxs)(o,{direction:`column`,gap:`md`,align:`start`,children:[(0,u.jsxs)(i,{children:[`Count: `,e]}),(0,u.jsxs)(o,{gap:`md`,children:[(0,u.jsx)(c,{type:`primary`,action:async()=>{await new Promise(e=>setTimeout(e,1500)),t(e=>e+1)},children:`Async Action (auto-loading)`}),(0,u.jsx)(c,{type:`default`,onClick:()=>{t(e=>e+1)},children:`Sync onClick (no loading)`})]})]})}},C={render:()=>{let[e,t]=(0,l.useState)(0);return(0,u.jsxs)(o,{direction:`column`,gap:`md`,align:`start`,children:[(0,u.jsxs)(i,{children:[`API calls made: `,e,` (try clicking multiple times quickly)`]}),(0,u.jsx)(c,{type:`primary`,action:async()=>{t(e=>e+1),await new Promise(e=>setTimeout(e,3e3))},children:`Submit (3s delay)`})]})}},w={render:()=>{let[e,t]=(0,l.useState)([]),n=e=>{t(t=>[...t,`${new Date().toLocaleTimeString()}: ${e}`])};return(0,u.jsxs)(o,{direction:`column`,gap:`md`,align:`start`,children:[(0,u.jsx)(c,{type:`primary`,action:async()=>{n(`Async action started`),await new Promise(e=>setTimeout(e,2e3)),n(`Async action completed`)},onClick:()=>{n(`Sync onClick executed`)},children:`Both action & onClick`}),(0,u.jsx)(o,{direction:`column`,style:{maxHeight:200,overflow:`auto`,fontSize:`12px`},children:e.map((e,t)=>(0,u.jsx)(i,{children:e},t))})]})}},x.parameters={...x.parameters,docs:{...(d=x.parameters)==null?void 0:d.docs,source:{originalSource:`{
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
}`,...(f=x.parameters)==null||(f=f.docs)==null?void 0:f.source}}},S.parameters={...S.parameters,docs:{...(p=S.parameters)==null?void 0:p.docs,source:{originalSource:`{
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
}`,...(m=S.parameters)==null||(m=m.docs)==null?void 0:m.source}}},C.parameters={...C.parameters,docs:{...(h=C.parameters)==null?void 0:h.docs,source:{originalSource:`{
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
}`,...(g=C.parameters)==null||(g=g.docs)==null?void 0:g.source}}},w.parameters={...w.parameters,docs:{...(_=w.parameters)==null?void 0:_.docs,source:{originalSource:`{
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
}`,...(v=w.parameters)==null||(v=v.docs)==null?void 0:v.source}}},T=[`Default`,`WithAction`,`PreventDoubleClick`,`CombinedHandlers`]})))()}E();export{w as CombinedHandlers,x as Default,C as PreventDoubleClick,S as WithAction,T as __namedExportsOrder,b as default};