import{r as d,j as t,B as p}from"./iframe-DS2Dz7J1.js";import{B as i}from"./BAIButton-wvlLE7Tz.js";import{B as s}from"./BAIFlex-DaddEd6z.js";import"./preload-helper-Dp1pzeXC.js";import"./astryxLabel-nDvnbzyc.js";const{action:w}=__STORYBOOK_MODULE_ACTIONS__,D={title:"Button/BAIButton",component:i,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:`
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
        `}}},argTypes:{action:{control:!1,description:"Async operation with automatic loading state management via React Transition",table:{type:{summary:"() => Promise<void>"},defaultValue:{summary:"undefined"}}}}},r={name:"Basic",args:{children:"Click me",type:"primary",action:async()=>{await new Promise(n=>setTimeout(n,2e3)),w("action completed")()}}},c={render:()=>{const[n,o]=d.useState(0);return t.jsxs(s,{direction:"column",gap:"md",align:"start",children:[t.jsxs(p,{children:["Count: ",n]}),t.jsxs(s,{gap:"md",children:[t.jsx(i,{type:"primary",action:async()=>{await new Promise(e=>setTimeout(e,1500)),o(e=>e+1)},children:"Async Action (auto-loading)"}),t.jsx(i,{type:"default",onClick:()=>{o(e=>e+1)},children:"Sync onClick (no loading)"})]})]})}},l={render:()=>{const[n,o]=d.useState(0);return t.jsxs(s,{direction:"column",gap:"md",align:"start",children:[t.jsxs(p,{children:["API calls made: ",n," (try clicking multiple times quickly)"]}),t.jsx(i,{type:"primary",action:async()=>{o(e=>e+1),await new Promise(e=>setTimeout(e,3e3))},children:"Submit (3s delay)"})]})}},u={render:()=>{const[n,o]=d.useState([]),e=a=>{o(m=>[...m,`${new Date().toLocaleTimeString()}: ${a}`])};return t.jsxs(s,{direction:"column",gap:"md",align:"start",children:[t.jsx(i,{type:"primary",action:async()=>{e("Async action started"),await new Promise(a=>setTimeout(a,2e3)),e("Async action completed")},onClick:()=>{e("Sync onClick executed")},children:"Both action & onClick"}),t.jsx(s,{direction:"column",style:{maxHeight:200,overflow:"auto",fontSize:"12px"},children:n.map((a,m)=>t.jsx(p,{children:a},m))})]})}};var g,y,B;r.parameters={...r.parameters,docs:{...(g=r.parameters)==null?void 0:g.docs,source:{originalSource:`{
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
}`,...(B=(y=r.parameters)==null?void 0:y.docs)==null?void 0:B.source}}};var A,x,I;c.parameters={...c.parameters,docs:{...(A=c.parameters)==null?void 0:A.docs,source:{originalSource:`{
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
}`,...(I=(x=c.parameters)==null?void 0:x.docs)==null?void 0:I.source}}};var C,h,k;l.parameters={...l.parameters,docs:{...(C=l.parameters)==null?void 0:C.docs,source:{originalSource:`{
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
}`,...(k=(h=l.parameters)==null?void 0:h.docs)==null?void 0:k.source}}};var v,S,T;u.parameters={...u.parameters,docs:{...(v=u.parameters)==null?void 0:v.docs,source:{originalSource:`{
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
}`,...(T=(S=u.parameters)==null?void 0:S.docs)==null?void 0:T.source}}};const L=["Default","WithAction","PreventDoubleClick","CombinedHandlers"];export{u as CombinedHandlers,r as Default,l as PreventDoubleClick,c as WithAction,L as __namedExportsOrder,D as default};
