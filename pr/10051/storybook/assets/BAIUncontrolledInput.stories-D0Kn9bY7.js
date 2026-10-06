import{aD as te,r as d,j as e,c as ne}from"./iframe-DX1mGbLJ.js";import{B as u}from"./BAIFlex-xn2DRYdJ.js";import{N as re}from"./NumberInput-BPJrZs19.js";import{T as oe}from"./TextInput-0DRBcFYf.js";import"./preload-helper-Dp1pzeXC.js";import"./FieldStatus-BhZtVvR_.js";import"./useInputStatusIcon-xwuShKCz.js";import"./useResolvedRequired-CJC78f5A.js";import"./InputGroupContext-BtOJqwQk.js";import"./InputClearButton-AeXshmCE.js";import"./useDevWarning-b8fbmfqX.js";function O({defaultValue:n,onCommit:t,type:r,placeholder:o,isDisabled:s,status:l,label:i,isLabelHidden:J,className:Q,style:X,...Y}){let Z=te(),[c,B]=d.useState(n??""),I=d.useRef(null),[$,ee]=d.useState(n);$!==n&&(ee(n),B(n??""));let E={...Y,label:i??Z("uic.UncontrolledInput.label"),isLabelHidden:J??i===void 0,placeholder:o,isDisabled:s,status:l,className:Q,style:X},p=()=>{let m=I.current??c;I.current=null,t==null||t(m)};if(r==="number"){let m=c===""?null:Number(c);return e.jsx(re,{...E,value:m===null||Number.isNaN(m)?null:m,onChange:j=>{let C=j===null?"":String(j);I.current=C,B(C)},onEnter:p,onBlur:p})}return e.jsx(oe,{...E,type:r==="password"||r==="email"?r:"text",value:c,onChange:B,onEnter:p,onBlur:p})}O.displayName="UncontrolledInput";const a=n=>{"use memo";const t=ne.c(10);let r,o,s;t[0]!==n?({disabled:r,status:o,...s}=n,t[0]=n,t[1]=r,t[2]=o,t[3]=s):(r=t[1],o=t[2],s=t[3]);let l;t[4]!==o?(l=o==="error"||o==="warning"?{type:o}:void 0,t[4]=o,t[5]=l):l=t[5];let i;return t[6]!==r||t[7]!==l||t[8]!==s?(i=e.jsx(O,{...s,isDisabled:r,status:l}),t[6]=r,t[7]=l,t[8]=s,t[9]=i):i=t[9],i},ye={title:"Input/BAIUncontrolledInput",component:a,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:`
**BAIUncontrolledInput** extends [Ant Design Input](https://ant.design/components/input) as an **intentionally uncontrolled** component.

## Purpose
This component exists to keep expensive commit side effects — such as persisting to localStorage — from running on every keystroke. The \`value\`/\`onChange\` props are deliberately removed from its API to steer consumers toward \`onCommit\`, the intended commit path: the new value is delivered only when the user finishes editing. (Per-keystroke handlers inherited from Ant Design Input, such as \`onInput\`/\`onKeyUp\`, still pass through — this is a convention, not an enforced restriction.)

- **Enter key** — commits the value (internally triggers blur)
- **Blur** — clicking/tabbing away commits the value

While focused, an Enter (⏎) icon appears in the suffix as an explicit visual cue that the value is applied on Enter (or blur), so users understand typing alone does not save.

## BAI-Specific Features
- **Uncontrolled by design**: \`value\`/\`onChange\` are excluded from props; uses \`defaultValue\` + \`onCommit\`
- **Commit on blur/Enter**: Triggers \`onCommit\` callback when input loses focus or Enter is pressed
- **Enter icon hint**: Shows ⏎ icon when focused to signal the commit-on-Enter behavior
- **No number spinners**: Hides spinner arrows for number input type
- **Reset on external change**: Changing \`defaultValue\` remounts the input (via \`key\`), discarding uncommitted edits

## Usage
\`\`\`tsx
// Persist a setting only when the user finishes editing
<BAIUncontrolledInput
  defaultValue={storedValue}
  onCommit={(value) => saveToLocalStorage(value)}
/>

// Number input without spinners
<BAIUncontrolledInput
  type="number"
  defaultValue="42"
  onCommit={(value) => updateValue(Number(value))}
/>
\`\`\`

## Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| \`defaultValue\` | \`string\` | - | Initial value (uncontrolled). Changing it resets the input |
| \`onCommit\` | \`(value: string) => void\` | - | Callback when value is committed (blur or Enter) |

\`value\` and \`onChange\` are intentionally not available. For all other props, refer to [Ant Design Input](https://ant.design/components/input).

## When to Use
- When committing the value has side effects that must not run per keystroke (e.g. localStorage writes, network requests)
- For form fields that should only update on blur/Enter (not on every keystroke)
- When you want to avoid re-renders on every character typed

Use a regular controlled \`Input\` when the UI must react to the value as the user types (live filtering, character counters, inline validation while typing).
        `}}},argTypes:{defaultValue:{control:{type:"text"},description:"Initial value for the uncontrolled input",table:{type:{summary:"string"}}},onCommit:{action:"committed",description:"Callback when value is committed (on blur or Enter key)",table:{type:{summary:"(value: string) => void"}}},type:{control:{type:"select"},options:["text","number","password","email","url"],description:"Input type",table:{type:{summary:"string"},defaultValue:{summary:"text"}}},placeholder:{control:{type:"text"},description:"Placeholder text",table:{type:{summary:"string"}}},disabled:{control:{type:"boolean"},description:"Whether input is disabled",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}}}},h={name:"Basic",parameters:{docs:{description:{story:"Basic uncontrolled input. Type text and press Enter or click outside to commit the value."}}},args:{defaultValue:"Edit me and press Enter",placeholder:"Type something..."}},v={parameters:{docs:{description:{story:"Number input without spinner arrows. Notice the spinner controls are hidden."}}},args:{type:"number",defaultValue:"42",placeholder:"Enter a number"}},y={parameters:{docs:{description:{story:"Demonstrates commit-on-blur behavior. Edit the input and see the committed value update when you blur or press Enter."}}},render:()=>{const[n,t]=d.useState("");return e.jsxs(u,{direction:"column",gap:"md",style:{width:300},children:[e.jsxs("div",{children:[e.jsx("div",{style:{marginBottom:8,fontWeight:500},children:"Edit and press Enter or blur:"}),e.jsx(a,{defaultValue:"Edit this text",onCommit:r=>t(r),placeholder:"Type and commit..."})]}),e.jsxs("div",{children:[e.jsx("div",{style:{marginBottom:8,fontWeight:500},children:"Committed Value:"}),e.jsx("div",{style:{padding:8,background:"#f5f5f5",borderRadius:4,fontFamily:"monospace"},children:n||"(not committed yet)"})]})]})}},f={parameters:{docs:{description:{story:"Focus on the input to see the Enter icon hint appear in the suffix."}}},render:()=>e.jsxs(u,{direction:"column",gap:"md",style:{width:300},children:[e.jsxs("div",{children:[e.jsx("div",{style:{marginBottom:8},children:"Focus to see Enter icon:"}),e.jsx(a,{defaultValue:"Focus me",placeholder:"Click to focus..."})]}),e.jsx("div",{style:{fontSize:12,color:"#666"},children:"💡 The ⏎ icon appears when focused to indicate you can press Enter to commit."})]})},g={parameters:{docs:{description:{story:"Example with validation on commit."}}},render:()=>{const[n,t]=d.useState("");return e.jsx(u,{direction:"column",gap:"md",style:{width:300},children:e.jsxs("div",{children:[e.jsx("div",{style:{marginBottom:8,fontWeight:500},children:"Enter a number between 1-100:"}),e.jsx(a,{type:"number",defaultValue:"50",status:n?"error":void 0,onCommit:r=>{const o=Number(r);isNaN(o)||o<1||o>100?t("Must be between 1 and 100"):t("")}}),n&&e.jsx("div",{style:{color:"#ff4d4f",marginTop:4},children:n})]})})}},x={parameters:{docs:{description:{story:"Input in different states (normal, disabled, error, warning)."}}},render:()=>e.jsxs(u,{direction:"column",gap:"md",style:{width:300},children:[e.jsxs("div",{children:[e.jsx("div",{style:{marginBottom:8},children:"Normal:"}),e.jsx(a,{defaultValue:"Normal input"})]}),e.jsxs("div",{children:[e.jsx("div",{style:{marginBottom:8},children:"Disabled:"}),e.jsx(a,{defaultValue:"Disabled input",disabled:!0})]}),e.jsxs("div",{children:[e.jsx("div",{style:{marginBottom:8},children:"Error:"}),e.jsx(a,{defaultValue:"Error state",status:"error"})]}),e.jsxs("div",{children:[e.jsx("div",{style:{marginBottom:8},children:"Warning:"}),e.jsx(a,{defaultValue:"Warning state",status:"warning"})]})]})},b={parameters:{docs:{description:{story:"Realistic examples showing typical use cases in Backend.AI WebUI."}}},render:()=>{const[n,t]=d.useState("my-jupyter-session"),[r,o]=d.useState("4"),[s,l]=d.useState("16");return e.jsxs(u,{direction:"column",gap:"lg",style:{width:400},children:[e.jsxs("div",{children:[e.jsx("div",{style:{marginBottom:8,fontWeight:500},children:"Session Configuration"}),e.jsxs(u,{direction:"column",gap:"sm",children:[e.jsxs("div",{children:[e.jsx("div",{style:{marginBottom:4,fontSize:12},children:"Session Name:"}),e.jsx(a,{defaultValue:n,onCommit:i=>t(i),placeholder:"Enter session name"})]}),e.jsxs("div",{children:[e.jsx("div",{style:{marginBottom:4,fontSize:12},children:"CPU Cores:"}),e.jsx(a,{type:"number",defaultValue:r,onCommit:i=>o(i),placeholder:"Number of cores"})]}),e.jsxs("div",{children:[e.jsx("div",{style:{marginBottom:4,fontSize:12},children:"Memory (GB):"}),e.jsx(a,{type:"number",defaultValue:s,onCommit:i=>l(i),placeholder:"Memory in GB"})]})]})]}),e.jsxs("div",{children:[e.jsx("div",{style:{marginBottom:8,fontWeight:500},children:"Current Configuration"}),e.jsxs("div",{style:{padding:12,background:"#f5f5f5",borderRadius:4,fontFamily:"monospace",fontSize:12},children:[e.jsxs("div",{children:["Session: ",n]}),e.jsxs("div",{children:["CPU: ",r," cores"]}),e.jsxs("div",{children:["Memory: ",s," GB"]})]})]})]})}};var w,S,V;h.parameters={...h.parameters,docs:{...(w=h.parameters)==null?void 0:w.docs,source:{originalSource:`{
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'Basic uncontrolled input. Type text and press Enter or click outside to commit the value.'
      }
    }
  },
  args: {
    defaultValue: 'Edit me and press Enter',
    placeholder: 'Type something...'
  }
}`,...(V=(S=h.parameters)==null?void 0:S.docs)==null?void 0:V.source}}};var N,A,U;v.parameters={...v.parameters,docs:{...(N=v.parameters)==null?void 0:N.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Number input without spinner arrows. Notice the spinner controls are hidden.'
      }
    }
  },
  args: {
    type: 'number',
    defaultValue: '42',
    placeholder: 'Enter a number'
  }
}`,...(U=(A=v.parameters)==null?void 0:A.docs)==null?void 0:U.source}}};var k,F,W;y.parameters={...y.parameters,docs:{...(k=y.parameters)==null?void 0:k.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates commit-on-blur behavior. Edit the input and see the committed value update when you blur or press Enter.'
      }
    }
  },
  render: () => {
    const [committedValue, setCommittedValue] = useState('');
    return <BAIFlex direction="column" gap="md" style={{
      width: 300
    }}>
        <div>
          <div style={{
          marginBottom: 8,
          fontWeight: 500
        }}>
            Edit and press Enter or blur:
          </div>
          <BAIUncontrolledInput defaultValue="Edit this text" onCommit={value => setCommittedValue(value)} placeholder="Type and commit..." />
        </div>
        <div>
          <div style={{
          marginBottom: 8,
          fontWeight: 500
        }}>
            Committed Value:
          </div>
          <div style={{
          padding: 8,
          background: '#f5f5f5',
          borderRadius: 4,
          fontFamily: 'monospace'
        }}>
            {committedValue || '(not committed yet)'}
          </div>
        </div>
      </BAIFlex>;
  }
}`,...(W=(F=y.parameters)==null?void 0:F.docs)==null?void 0:W.source}}};var D,T,G;f.parameters={...f.parameters,docs:{...(D=f.parameters)==null?void 0:D.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Focus on the input to see the Enter icon hint appear in the suffix.'
      }
    }
  },
  render: () => <BAIFlex direction="column" gap="md" style={{
    width: 300
  }}>
      <div>
        <div style={{
        marginBottom: 8
      }}>Focus to see Enter icon:</div>
        <BAIUncontrolledInput defaultValue="Focus me" placeholder="Click to focus..." />
      </div>
      <div style={{
      fontSize: 12,
      color: '#666'
    }}>
        💡 The ⏎ icon appears when focused to indicate you can press Enter to
        commit.
      </div>
    </BAIFlex>
}`,...(G=(T=f.parameters)==null?void 0:T.docs)==null?void 0:G.source}}};var R,M,P;g.parameters={...g.parameters,docs:{...(R=g.parameters)==null?void 0:R.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Example with validation on commit.'
      }
    }
  },
  render: () => {
    const [error, setError] = useState('');
    return <BAIFlex direction="column" gap="md" style={{
      width: 300
    }}>
        <div>
          <div style={{
          marginBottom: 8,
          fontWeight: 500
        }}>
            Enter a number between 1-100:
          </div>
          <BAIUncontrolledInput type="number" defaultValue="50" status={error ? 'error' : undefined} onCommit={value => {
          const num = Number(value);
          if (isNaN(num) || num < 1 || num > 100) {
            setError('Must be between 1 and 100');
          } else {
            setError('');
          }
        }} />
          {error && <div style={{
          color: '#ff4d4f',
          marginTop: 4
        }}>{error}</div>}
        </div>
      </BAIFlex>;
  }
}`,...(P=(M=g.parameters)==null?void 0:M.docs)==null?void 0:P.source}}};var z,L,H;x.parameters={...x.parameters,docs:{...(z=x.parameters)==null?void 0:z.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Input in different states (normal, disabled, error, warning).'
      }
    }
  },
  render: () => <BAIFlex direction="column" gap="md" style={{
    width: 300
  }}>
      <div>
        <div style={{
        marginBottom: 8
      }}>Normal:</div>
        <BAIUncontrolledInput defaultValue="Normal input" />
      </div>
      <div>
        <div style={{
        marginBottom: 8
      }}>Disabled:</div>
        <BAIUncontrolledInput defaultValue="Disabled input" disabled />
      </div>
      <div>
        <div style={{
        marginBottom: 8
      }}>Error:</div>
        <BAIUncontrolledInput defaultValue="Error state" status="error" />
      </div>
      <div>
        <div style={{
        marginBottom: 8
      }}>Warning:</div>
        <BAIUncontrolledInput defaultValue="Warning state" status="warning" />
      </div>
    </BAIFlex>
}`,...(H=(L=x.parameters)==null?void 0:L.docs)==null?void 0:H.source}}};var _,q,K;b.parameters={...b.parameters,docs:{...(_=b.parameters)==null?void 0:_.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Realistic examples showing typical use cases in Backend.AI WebUI.'
      }
    }
  },
  render: () => {
    const [sessionName, setSessionName] = useState('my-jupyter-session');
    const [cpuLimit, setCpuLimit] = useState('4');
    const [memoryGB, setMemoryGB] = useState('16');
    return <BAIFlex direction="column" gap="lg" style={{
      width: 400
    }}>
        <div>
          <div style={{
          marginBottom: 8,
          fontWeight: 500
        }}>
            Session Configuration
          </div>
          <BAIFlex direction="column" gap="sm">
            <div>
              <div style={{
              marginBottom: 4,
              fontSize: 12
            }}>Session Name:</div>
              <BAIUncontrolledInput defaultValue={sessionName} onCommit={value => setSessionName(value)} placeholder="Enter session name" />
            </div>
            <div>
              <div style={{
              marginBottom: 4,
              fontSize: 12
            }}>CPU Cores:</div>
              <BAIUncontrolledInput type="number" defaultValue={cpuLimit} onCommit={value => setCpuLimit(value)} placeholder="Number of cores" />
            </div>
            <div>
              <div style={{
              marginBottom: 4,
              fontSize: 12
            }}>Memory (GB):</div>
              <BAIUncontrolledInput type="number" defaultValue={memoryGB} onCommit={value => setMemoryGB(value)} placeholder="Memory in GB" />
            </div>
          </BAIFlex>
        </div>

        <div>
          <div style={{
          marginBottom: 8,
          fontWeight: 500
        }}>
            Current Configuration
          </div>
          <div style={{
          padding: 12,
          background: '#f5f5f5',
          borderRadius: 4,
          fontFamily: 'monospace',
          fontSize: 12
        }}>
            <div>Session: {sessionName}</div>
            <div>CPU: {cpuLimit} cores</div>
            <div>Memory: {memoryGB} GB</div>
          </div>
        </div>
      </BAIFlex>;
  }
}`,...(K=(q=b.parameters)==null?void 0:q.docs)==null?void 0:K.source}}};const fe=["Default","NumberInput","CommitBehavior","EnterIconHint","WithValidation","DifferentStates","RealWorldExample"];export{y as CommitBehavior,h as Default,x as DifferentStates,f as EnterIconHint,v as NumberInput,b as RealWorldExample,g as WithValidation,fe as __namedExportsOrder,ye as default};
