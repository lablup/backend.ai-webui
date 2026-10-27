import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-D0Ex1IVc.js";import{t as n}from"./jsx-runtime-MKhVqBIO.js";import{n as r,t as i}from"./BAIFlex-BOFoS5KY.js";import{n as a,t as o}from"./BAIButton-BCdRP02k.js";import{n as s,t as c}from"./BAIIntervalView-DCvE4Ys-.js";var l,u,d,f,p,m,h,g,_,v;function y(){return(y=e((()=>{a(),r(),s(),l=t(),u=n(),d={title:`Utility/BAIIntervalView`,component:c,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:`
**BAIIntervalView** is a utility component that automatically updates its content at specified intervals.

## Features
- **Interval updates**: Execute callback at regular intervals and display the result
- **Custom rendering**: Use \`render\` prop for custom display logic
- **Manual trigger**: Update immediately when \`triggerKey\` changes
- **Visibility-aware**: Automatically pauses when tab is hidden to save resources

## Usage
\`\`\`tsx
// Display current time updated every second
<BAIIntervalView
  callback={() => new Date().toLocaleTimeString()}
  delay={1000}
/>

// Custom render function
<BAIIntervalView
  callback={() => Math.random()}
  delay={2000}
  render={(value) => <div>Random: {value.toFixed(3)}</div>}
/>

// Manual trigger with triggerKey
<BAIIntervalView
  callback={fetchData}
  delay={5000}
  triggerKey={refreshKey}
/>
\`\`\`

## Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| \`callback\` | \`() => T\` | (required) | Function that returns the value to display |
| \`delay\` | \`number \\| null\` | (required) | Update interval in milliseconds, or null to pause |
| \`render\` | \`(data: T) => ReactNode\` | - | Custom render function, if omitted shows value directly |
| \`triggerKey\` | \`string\` | - | Changing this value triggers immediate update |

## When to Use
- Real-time clocks or timers
- Periodic status polling
- Live data displays that need regular updates
- Any content that changes over time and needs automatic refresh
        `}}},argTypes:{callback:{control:!1,description:`Function that returns the value to display`,table:{type:{summary:`() => T`}}},delay:{control:{type:`number`,min:100,max:1e4,step:100},description:`Update interval in milliseconds (null to pause)`,table:{type:{summary:`number | null`}}},render:{control:!1,description:`Optional custom render function`,table:{type:{summary:`(data: T) => ReactNode`}}},triggerKey:{control:{type:`text`},description:`Changing this value triggers immediate update`,table:{type:{summary:`string`}}}}},f={name:`Basic`,parameters:{docs:{description:{story:`Basic usage showing current time updated every second.`}}},render:()=>(0,u.jsxs)(`div`,{children:[(0,u.jsx)(`div`,{style:{marginBottom:8,fontWeight:500},children:`Current Time:`}),(0,u.jsx)(`div`,{style:{fontSize:24,fontFamily:`monospace`},children:(0,u.jsx)(c,{callback:()=>new Date().toLocaleTimeString(),delay:1e3})})]})},p={parameters:{docs:{description:{story:`Using custom render function to format the output. Shows random number updated every 2 seconds.`}}},render:()=>(0,u.jsx)(c,{callback:()=>Math.random(),delay:2e3,render:e=>(0,u.jsxs)(`div`,{style:{padding:16,background:`#f5f5f5`,borderRadius:4,fontFamily:`monospace`},children:[(0,u.jsxs)(`div`,{children:[`Random Value: `,e.toFixed(6)]}),(0,u.jsx)(`div`,{style:{fontSize:12,color:`#666`,marginTop:4},children:`Updates every 2 seconds`})]})})},m={parameters:{docs:{description:{story:`Demonstrates triggerKey to force immediate update. Click the button to trigger refresh.`}}},render:()=>{let[e,t]=(0,l.useState)(`initial`),n=(0,l.useRef)(0);return(0,u.jsxs)(i,{direction:`column`,gap:`md`,children:[(0,u.jsx)(o,{onClick:()=>t(Date.now().toString()),children:`Trigger Update`}),(0,u.jsxs)(`div`,{children:[(0,u.jsx)(`div`,{style:{marginBottom:8,fontWeight:500},children:`Auto-update every 5s:`}),(0,u.jsx)(c,{callback:()=>(n.current+=1,`Updated at ${new Date().toLocaleTimeString()} (count: ${n.current})`),delay:5e3,triggerKey:e,render:e=>(0,u.jsx)(`div`,{style:{padding:12,background:`#f5f5f5`,borderRadius:4,fontFamily:`monospace`},children:e})})]})]})}},h={parameters:{docs:{description:{story:`Demonstrates pausing and resuming the interval by setting delay to null.`}}},render:()=>{let[e,t]=(0,l.useState)(1e3);return(0,u.jsxs)(i,{direction:`column`,gap:`md`,children:[(0,u.jsxs)(i,{gap:`sm`,children:[(0,u.jsx)(o,{onClick:()=>t(1e3),type:e===1e3?`primary`:`default`,children:`Start (1s)`}),(0,u.jsx)(o,{onClick:()=>t(null),type:e===null?`primary`:`default`,children:`Pause`})]}),(0,u.jsxs)(`div`,{children:[(0,u.jsxs)(`div`,{style:{marginBottom:8,fontWeight:500},children:[`Status: `,e===null?`⏸️ Paused`:`▶️ Running`]}),(0,u.jsx)(`div`,{style:{fontSize:20,fontFamily:`monospace`},children:(0,u.jsx)(c,{callback:()=>new Date().toLocaleTimeString(),delay:e})})]})]})}},g={parameters:{docs:{description:{story:`Multiple interval views with different update frequencies.`}}},render:()=>(0,u.jsxs)(i,{direction:`column`,gap:`md`,children:[(0,u.jsxs)(`div`,{children:[(0,u.jsx)(`div`,{style:{marginBottom:8,fontWeight:500},children:`Fast (1s):`}),(0,u.jsx)(c,{callback:()=>Date.now(),delay:1e3,render:e=>(0,u.jsx)(`div`,{style:{fontFamily:`monospace`},children:e})})]}),(0,u.jsxs)(`div`,{children:[(0,u.jsx)(`div`,{style:{marginBottom:8,fontWeight:500},children:`Medium (2s):`}),(0,u.jsx)(c,{callback:()=>new Date().toLocaleTimeString(),delay:2e3,render:e=>(0,u.jsx)(`div`,{style:{fontFamily:`monospace`},children:e})})]}),(0,u.jsxs)(`div`,{children:[(0,u.jsx)(`div`,{style:{marginBottom:8,fontWeight:500},children:`Slow (5s):`}),(0,u.jsx)(c,{callback:()=>new Date().toLocaleDateString(),delay:5e3,render:e=>(0,u.jsx)(`div`,{style:{fontFamily:`monospace`},children:e})})]})]})},_={parameters:{docs:{description:{story:`Realistic example: Session uptime counter and status polling.`}}},render:()=>{let e=(0,l.useRef)(Date.now()),[t,n]=(0,l.useState)(!0);return(0,u.jsxs)(i,{direction:`column`,gap:`lg`,style:{width:400},children:[(0,u.jsxs)(`div`,{children:[(0,u.jsx)(`div`,{style:{marginBottom:8,fontWeight:500},children:`Session Uptime`}),(0,u.jsx)(`div`,{style:{padding:16,background:`#f5f5f5`,borderRadius:4,fontFamily:`monospace`,fontSize:24},children:(0,u.jsx)(c,{callback:()=>{let t=Date.now()-e.current,n=Math.floor(t/1e3),r=Math.floor(n/60);return`${Math.floor(r/60).toString().padStart(2,`0`)}:${(r%60).toString().padStart(2,`0`)}:${(n%60).toString().padStart(2,`0`)}`},delay:t?1e3:null})})]}),(0,u.jsxs)(`div`,{children:[(0,u.jsx)(`div`,{style:{marginBottom:8,fontWeight:500},children:`Resource Usage (refreshes every 3s)`}),(0,u.jsx)(c,{callback:()=>({cpu:(Math.random()*100).toFixed(1),memory:(Math.random()*100).toFixed(1)}),delay:t?3e3:null,render:e=>(0,u.jsxs)(`div`,{style:{padding:12,background:`#f5f5f5`,borderRadius:4},children:[(0,u.jsxs)(`div`,{children:[`CPU: `,e.cpu,`%`]}),(0,u.jsxs)(`div`,{children:[`Memory: `,e.memory,`%`]})]})})]}),(0,u.jsx)(o,{onClick:()=>n(!t),type:`primary`,block:!0,children:t?`Pause Monitoring`:`Resume Monitoring`})]})}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'Basic usage showing current time updated every second.'
      }
    }
  },
  render: () => <div>
      <div style={{
      marginBottom: 8,
      fontWeight: 500
    }}>Current Time:</div>
      <div style={{
      fontSize: 24,
      fontFamily: 'monospace'
    }}>
        <BAIIntervalView callback={() => new Date().toLocaleTimeString()} delay={1000} />
      </div>
    </div>
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Using custom render function to format the output. Shows random number updated every 2 seconds.'
      }
    }
  },
  render: () => <BAIIntervalView callback={() => Math.random()} delay={2000} render={value => <div style={{
    padding: 16,
    background: '#f5f5f5',
    borderRadius: 4,
    fontFamily: 'monospace'
  }}>
          <div>Random Value: {value.toFixed(6)}</div>
          <div style={{
      fontSize: 12,
      color: '#666',
      marginTop: 4
    }}>
            Updates every 2 seconds
          </div>
        </div>} />
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates triggerKey to force immediate update. Click the button to trigger refresh.'
      }
    }
  },
  render: () => {
    const [triggerKey, setTriggerKey] = useState('initial');
    const countRef = useRef(0);
    return <BAIFlex direction="column" gap="md">
        <BAIButton onClick={() => setTriggerKey(Date.now().toString())}>
          Trigger Update
        </BAIButton>

        <div>
          <div style={{
          marginBottom: 8,
          fontWeight: 500
        }}>
            Auto-update every 5s:
          </div>
          <BAIIntervalView callback={() => {
          countRef.current += 1;
          return \`Updated at \${new Date().toLocaleTimeString()} (count: \${countRef.current})\`;
        }} delay={5000} triggerKey={triggerKey} render={value => <div style={{
          padding: 12,
          background: '#f5f5f5',
          borderRadius: 4,
          fontFamily: 'monospace'
        }}>
                {value}
              </div>} />
        </div>
      </BAIFlex>;
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates pausing and resuming the interval by setting delay to null.'
      }
    }
  },
  render: () => {
    const [delay, setDelay] = useState<number | null>(1000);
    return <BAIFlex direction="column" gap="md">
        <BAIFlex gap="sm">
          <BAIButton onClick={() => setDelay(1000)} type={delay === 1000 ? 'primary' : 'default'}>
            Start (1s)
          </BAIButton>
          <BAIButton onClick={() => setDelay(null)} type={delay === null ? 'primary' : 'default'}>
            Pause
          </BAIButton>
        </BAIFlex>

        <div>
          <div style={{
          marginBottom: 8,
          fontWeight: 500
        }}>
            Status: {delay === null ? '⏸️ Paused' : '▶️ Running'}
          </div>
          <div style={{
          fontSize: 20,
          fontFamily: 'monospace'
        }}>
            <BAIIntervalView callback={() => new Date().toLocaleTimeString()} delay={delay} />
          </div>
        </div>
      </BAIFlex>;
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Multiple interval views with different update frequencies.'
      }
    }
  },
  render: () => <BAIFlex direction="column" gap="md">
      <div>
        <div style={{
        marginBottom: 8,
        fontWeight: 500
      }}>Fast (1s):</div>
        <BAIIntervalView callback={() => Date.now()} delay={1000} render={ms => <div style={{
        fontFamily: 'monospace'
      }}>{ms}</div>} />
      </div>

      <div>
        <div style={{
        marginBottom: 8,
        fontWeight: 500
      }}>Medium (2s):</div>
        <BAIIntervalView callback={() => new Date().toLocaleTimeString()} delay={2000} render={time => <div style={{
        fontFamily: 'monospace'
      }}>{time}</div>} />
      </div>

      <div>
        <div style={{
        marginBottom: 8,
        fontWeight: 500
      }}>Slow (5s):</div>
        <BAIIntervalView callback={() => new Date().toLocaleDateString()} delay={5000} render={date => <div style={{
        fontFamily: 'monospace'
      }}>{date}</div>} />
      </div>
    </BAIFlex>
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Realistic example: Session uptime counter and status polling.'
      }
    }
  },
  render: () => {
    const startTimeRef = useRef(Date.now());
    const [isRunning, setIsRunning] = useState(true);
    return <BAIFlex direction="column" gap="lg" style={{
      width: 400
    }}>
        <div>
          <div style={{
          marginBottom: 8,
          fontWeight: 500
        }}>Session Uptime</div>
          <div style={{
          padding: 16,
          background: '#f5f5f5',
          borderRadius: 4,
          fontFamily: 'monospace',
          fontSize: 24
        }}>
            <BAIIntervalView callback={() => {
            const elapsed = Date.now() - startTimeRef.current;
            const seconds = Math.floor(elapsed / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            return \`\${hours.toString().padStart(2, '0')}:\${(minutes % 60).toString().padStart(2, '0')}:\${(seconds % 60).toString().padStart(2, '0')}\`;
          }} delay={isRunning ? 1000 : null} />
          </div>
        </div>

        <div>
          <div style={{
          marginBottom: 8,
          fontWeight: 500
        }}>
            Resource Usage (refreshes every 3s)
          </div>
          <BAIIntervalView callback={() => ({
          cpu: (Math.random() * 100).toFixed(1),
          memory: (Math.random() * 100).toFixed(1)
        })} delay={isRunning ? 3000 : null} render={usage => <div style={{
          padding: 12,
          background: '#f5f5f5',
          borderRadius: 4
        }}>
                <div>CPU: {usage.cpu}%</div>
                <div>Memory: {usage.memory}%</div>
              </div>} />
        </div>

        <BAIButton onClick={() => setIsRunning(!isRunning)} type="primary" block>
          {isRunning ? 'Pause Monitoring' : 'Resume Monitoring'}
        </BAIButton>
      </BAIFlex>;
  }
}`,..._.parameters?.docs?.source}}},v=[`Default`,`CustomRender`,`ManualTrigger`,`PauseResume`,`MultipleCounters`,`RealWorldExample`]})))()}y();export{p as CustomRender,f as Default,m as ManualTrigger,g as MultipleCounters,h as PauseResume,_ as RealWorldExample,v as __namedExportsOrder,d as default};