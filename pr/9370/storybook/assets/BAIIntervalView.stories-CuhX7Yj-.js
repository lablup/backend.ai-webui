import{j as e,r as i}from"./iframe-D4KvFPWT.js";import{B as g}from"./BAIButton-Dhg0Plti.js";import{B as s}from"./BAIFlex-DqbanTN2.js";import{B as n}from"./BAIIntervalView-NZHvzxqj.js";import"./preload-helper-Dp1pzeXC.js";import"./astryxLabel-DYXdf4CR.js";import"./useIntervalValue-C4__ZY12.js";import"./isUndefined-DCTLXrZ8.js";const N={title:"Utility/BAIIntervalView",component:n,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:`
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
        `}}},argTypes:{callback:{control:!1,description:"Function that returns the value to display",table:{type:{summary:"() => T"}}},delay:{control:{type:"number",min:100,max:1e4,step:100},description:"Update interval in milliseconds (null to pause)",table:{type:{summary:"number | null"}}},render:{control:!1,description:"Optional custom render function",table:{type:{summary:"(data: T) => ReactNode"}}},triggerKey:{control:{type:"text"},description:"Changing this value triggers immediate update",table:{type:{summary:"string"}}}}},d={name:"Basic",parameters:{docs:{description:{story:"Basic usage showing current time updated every second."}}},render:()=>e.jsxs("div",{children:[e.jsx("div",{style:{marginBottom:8,fontWeight:500},children:"Current Time:"}),e.jsx("div",{style:{fontSize:24,fontFamily:"monospace"},children:e.jsx(n,{callback:()=>new Date().toLocaleTimeString(),delay:1e3})})]})},l={parameters:{docs:{description:{story:"Using custom render function to format the output. Shows random number updated every 2 seconds."}}},render:()=>e.jsx(n,{callback:()=>Math.random(),delay:2e3,render:t=>e.jsxs("div",{style:{padding:16,background:"#f5f5f5",borderRadius:4,fontFamily:"monospace"},children:[e.jsxs("div",{children:["Random Value: ",t.toFixed(6)]}),e.jsx("div",{style:{fontSize:12,color:"#666",marginTop:4},children:"Updates every 2 seconds"})]})})},c={parameters:{docs:{description:{story:"Demonstrates triggerKey to force immediate update. Click the button to trigger refresh."}}},render:()=>{const[t,r]=i.useState("initial"),o=i.useRef(0);return e.jsxs(s,{direction:"column",gap:"md",children:[e.jsx(g,{onClick:()=>r(Date.now().toString()),children:"Trigger Update"}),e.jsxs("div",{children:[e.jsx("div",{style:{marginBottom:8,fontWeight:500},children:"Auto-update every 5s:"}),e.jsx(n,{callback:()=>(o.current+=1,`Updated at ${new Date().toLocaleTimeString()} (count: ${o.current})`),delay:5e3,triggerKey:t,render:a=>e.jsx("div",{style:{padding:12,background:"#f5f5f5",borderRadius:4,fontFamily:"monospace"},children:a})})]})]})}},u={parameters:{docs:{description:{story:"Demonstrates pausing and resuming the interval by setting delay to null."}}},render:()=>{const[t,r]=i.useState(1e3);return e.jsxs(s,{direction:"column",gap:"md",children:[e.jsxs(s,{gap:"sm",children:[e.jsx(g,{onClick:()=>r(1e3),type:t===1e3?"primary":"default",children:"Start (1s)"}),e.jsx(g,{onClick:()=>r(null),type:t===null?"primary":"default",children:"Pause"})]}),e.jsxs("div",{children:[e.jsxs("div",{style:{marginBottom:8,fontWeight:500},children:["Status: ",t===null?"⏸️ Paused":"▶️ Running"]}),e.jsx("div",{style:{fontSize:20,fontFamily:"monospace"},children:e.jsx(n,{callback:()=>new Date().toLocaleTimeString(),delay:t})})]})]})}},m={parameters:{docs:{description:{story:"Multiple interval views with different update frequencies."}}},render:()=>e.jsxs(s,{direction:"column",gap:"md",children:[e.jsxs("div",{children:[e.jsx("div",{style:{marginBottom:8,fontWeight:500},children:"Fast (1s):"}),e.jsx(n,{callback:()=>Date.now(),delay:1e3,render:t=>e.jsx("div",{style:{fontFamily:"monospace"},children:t})})]}),e.jsxs("div",{children:[e.jsx("div",{style:{marginBottom:8,fontWeight:500},children:"Medium (2s):"}),e.jsx(n,{callback:()=>new Date().toLocaleTimeString(),delay:2e3,render:t=>e.jsx("div",{style:{fontFamily:"monospace"},children:t})})]}),e.jsxs("div",{children:[e.jsx("div",{style:{marginBottom:8,fontWeight:500},children:"Slow (5s):"}),e.jsx(n,{callback:()=>new Date().toLocaleDateString(),delay:5e3,render:t=>e.jsx("div",{style:{fontFamily:"monospace"},children:t})})]})]})},p={parameters:{docs:{description:{story:"Realistic example: Session uptime counter and status polling."}}},render:()=>{const t=i.useRef(Date.now()),[r,o]=i.useState(!0);return e.jsxs(s,{direction:"column",gap:"lg",style:{width:400},children:[e.jsxs("div",{children:[e.jsx("div",{style:{marginBottom:8,fontWeight:500},children:"Session Uptime"}),e.jsx("div",{style:{padding:16,background:"#f5f5f5",borderRadius:4,fontFamily:"monospace",fontSize:24},children:e.jsx(n,{callback:()=>{const a=Date.now()-t.current,y=Math.floor(a/1e3),v=Math.floor(y/60);return`${Math.floor(v/60).toString().padStart(2,"0")}:${(v%60).toString().padStart(2,"0")}:${(y%60).toString().padStart(2,"0")}`},delay:r?1e3:null})})]}),e.jsxs("div",{children:[e.jsx("div",{style:{marginBottom:8,fontWeight:500},children:"Resource Usage (refreshes every 3s)"}),e.jsx(n,{callback:()=>({cpu:(Math.random()*100).toFixed(1),memory:(Math.random()*100).toFixed(1)}),delay:r?3e3:null,render:a=>e.jsxs("div",{style:{padding:12,background:"#f5f5f5",borderRadius:4},children:[e.jsxs("div",{children:["CPU: ",a.cpu,"%"]}),e.jsxs("div",{children:["Memory: ",a.memory,"%"]})]})})]}),e.jsx(g,{onClick:()=>o(!r),type:"primary",block:!0,children:r?"Pause Monitoring":"Resume Monitoring"})]})}};var f,h,x;d.parameters={...d.parameters,docs:{...(f=d.parameters)==null?void 0:f.docs,source:{originalSource:`{
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
}`,...(x=(h=d.parameters)==null?void 0:h.docs)==null?void 0:x.source}}};var B,b,S;l.parameters={...l.parameters,docs:{...(B=l.parameters)==null?void 0:B.docs,source:{originalSource:`{
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
}`,...(S=(b=l.parameters)==null?void 0:b.docs)==null?void 0:S.source}}};var I,w,j;c.parameters={...c.parameters,docs:{...(I=c.parameters)==null?void 0:I.docs,source:{originalSource:`{
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
}`,...(j=(w=c.parameters)==null?void 0:w.docs)==null?void 0:j.source}}};var R,k,A;u.parameters={...u.parameters,docs:{...(R=u.parameters)==null?void 0:R.docs,source:{originalSource:`{
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
}`,...(A=(k=u.parameters)==null?void 0:k.docs)==null?void 0:A.source}}};var F,D,M;m.parameters={...m.parameters,docs:{...(F=m.parameters)==null?void 0:F.docs,source:{originalSource:`{
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
}`,...(M=(D=m.parameters)==null?void 0:D.docs)==null?void 0:M.source}}};var T,C,U;p.parameters={...p.parameters,docs:{...(T=p.parameters)==null?void 0:T.docs,source:{originalSource:`{
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
}`,...(U=(C=p.parameters)==null?void 0:C.docs)==null?void 0:U.source}}};const O=["Default","CustomRender","ManualTrigger","PauseResume","MultipleCounters","RealWorldExample"];export{l as CustomRender,d as Default,c as ManualTrigger,m as MultipleCounters,u as PauseResume,p as RealWorldExample,O as __namedExportsOrder,N as default};
