import{a as Q,r as d,j as e}from"./iframe-C4hJf4CE.js";import{B as m}from"./BAIFlex-Bczlqgdo.js";import{N as X}from"./NumberInput-D5yCReNl.js";import{T as Y}from"./TextInput-D_bzC6wl.js";import"./preload-helper-Dp1pzeXC.js";import"./useResolvedRequired-If7smKRn.js";import"./useInputStatusIcon-Be58_QeT.js";import"./InputGroupContext-Cs9mRzxQ.js";import"./InputClearButton-D1gCpyrR.js";import"./useDevWarning-CYe7Wx_E.js";const n=({defaultValue:t,onCommit:o,type:r,placeholder:s,disabled:c,status:u,label:i,isLabelHidden:q,...K})=>{const{t:O}=Q(),[a,B]=d.useState(t??""),[$,J]=d.useState(t);$!==t&&(J(t),B(t??""));const I={...K,label:i??O("general.Select"),isLabelHidden:q??i===void 0,placeholder:s,isDisabled:c,status:u==="error"||u==="warning"?{type:u}:void 0},p=l=>o==null?void 0:o(l);if(r==="number"){const l=a===""?null:Number(a);return e.jsx(X,{...I,value:Number.isNaN(l)?null:l,onChange:E=>B(E===null?"":String(E)),onEnter:()=>p(a),onBlur:()=>p(a)})}return e.jsx(Y,{...I,type:r==="password"||r==="email"?r:"text",value:a,onChange:l=>B(l),onEnter:()=>p(a),onBlur:()=>p(a)})},le={title:"Input/BAIUncontrolledInput",component:n,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:`
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
        `}}},argTypes:{defaultValue:{control:{type:"text"},description:"Initial value for the uncontrolled input",table:{type:{summary:"string"}}},onCommit:{action:"committed",description:"Callback when value is committed (on blur or Enter key)",table:{type:{summary:"(value: string) => void"}}},type:{control:{type:"select"},options:["text","number","password","email","url"],description:"Input type",table:{type:{summary:"string"},defaultValue:{summary:"text"}}},placeholder:{control:{type:"text"},description:"Placeholder text",table:{type:{summary:"string"}}},disabled:{control:{type:"boolean"},description:"Whether input is disabled",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}}}},h={name:"Basic",parameters:{docs:{description:{story:"Basic uncontrolled input. Type text and press Enter or click outside to commit the value."}}},args:{defaultValue:"Edit me and press Enter",placeholder:"Type something..."}},v={parameters:{docs:{description:{story:"Number input without spinner arrows. Notice the spinner controls are hidden."}}},args:{type:"number",defaultValue:"42",placeholder:"Enter a number"}},y={parameters:{docs:{description:{story:"Demonstrates commit-on-blur behavior. Edit the input and see the committed value update when you blur or press Enter."}}},render:()=>{const[t,o]=d.useState("");return e.jsxs(m,{direction:"column",gap:"md",style:{width:300},children:[e.jsxs("div",{children:[e.jsx("div",{style:{marginBottom:8,fontWeight:500},children:"Edit and press Enter or blur:"}),e.jsx(n,{defaultValue:"Edit this text",onCommit:r=>o(r),placeholder:"Type and commit..."})]}),e.jsxs("div",{children:[e.jsx("div",{style:{marginBottom:8,fontWeight:500},children:"Committed Value:"}),e.jsx("div",{style:{padding:8,background:"#f5f5f5",borderRadius:4,fontFamily:"monospace"},children:t||"(not committed yet)"})]})]})}},g={parameters:{docs:{description:{story:"Focus on the input to see the Enter icon hint appear in the suffix."}}},render:()=>e.jsxs(m,{direction:"column",gap:"md",style:{width:300},children:[e.jsxs("div",{children:[e.jsx("div",{style:{marginBottom:8},children:"Focus to see Enter icon:"}),e.jsx(n,{defaultValue:"Focus me",placeholder:"Click to focus..."})]}),e.jsx("div",{style:{fontSize:12,color:"#666"},children:"💡 The ⏎ icon appears when focused to indicate you can press Enter to commit."})]})},f={parameters:{docs:{description:{story:"Example with validation on commit."}}},render:()=>{const[t,o]=d.useState("");return e.jsx(m,{direction:"column",gap:"md",style:{width:300},children:e.jsxs("div",{children:[e.jsx("div",{style:{marginBottom:8,fontWeight:500},children:"Enter a number between 1-100:"}),e.jsx(n,{type:"number",defaultValue:"50",status:t?"error":void 0,onCommit:r=>{const s=Number(r);isNaN(s)||s<1||s>100?o("Must be between 1 and 100"):o("")}}),t&&e.jsx("div",{style:{color:"#ff4d4f",marginTop:4},children:t})]})})}},x={parameters:{docs:{description:{story:"Input in different states (normal, disabled, error, warning)."}}},render:()=>e.jsxs(m,{direction:"column",gap:"md",style:{width:300},children:[e.jsxs("div",{children:[e.jsx("div",{style:{marginBottom:8},children:"Normal:"}),e.jsx(n,{defaultValue:"Normal input"})]}),e.jsxs("div",{children:[e.jsx("div",{style:{marginBottom:8},children:"Disabled:"}),e.jsx(n,{defaultValue:"Disabled input",disabled:!0})]}),e.jsxs("div",{children:[e.jsx("div",{style:{marginBottom:8},children:"Error:"}),e.jsx(n,{defaultValue:"Error state",status:"error"})]}),e.jsxs("div",{children:[e.jsx("div",{style:{marginBottom:8},children:"Warning:"}),e.jsx(n,{defaultValue:"Warning state",status:"warning"})]})]})},b={parameters:{docs:{description:{story:"Realistic examples showing typical use cases in Backend.AI WebUI."}}},render:()=>{const[t,o]=d.useState("my-jupyter-session"),[r,s]=d.useState("4"),[c,u]=d.useState("16");return e.jsxs(m,{direction:"column",gap:"lg",style:{width:400},children:[e.jsxs("div",{children:[e.jsx("div",{style:{marginBottom:8,fontWeight:500},children:"Session Configuration"}),e.jsxs(m,{direction:"column",gap:"sm",children:[e.jsxs("div",{children:[e.jsx("div",{style:{marginBottom:4,fontSize:12},children:"Session Name:"}),e.jsx(n,{defaultValue:t,onCommit:i=>o(i),placeholder:"Enter session name"})]}),e.jsxs("div",{children:[e.jsx("div",{style:{marginBottom:4,fontSize:12},children:"CPU Cores:"}),e.jsx(n,{type:"number",defaultValue:r,onCommit:i=>s(i),placeholder:"Number of cores"})]}),e.jsxs("div",{children:[e.jsx("div",{style:{marginBottom:4,fontSize:12},children:"Memory (GB):"}),e.jsx(n,{type:"number",defaultValue:c,onCommit:i=>u(i),placeholder:"Memory in GB"})]})]})]}),e.jsxs("div",{children:[e.jsx("div",{style:{marginBottom:8,fontWeight:500},children:"Current Configuration"}),e.jsxs("div",{style:{padding:12,background:"#f5f5f5",borderRadius:4,fontFamily:"monospace",fontSize:12},children:[e.jsxs("div",{children:["Session: ",t]}),e.jsxs("div",{children:["CPU: ",r," cores"]}),e.jsxs("div",{children:["Memory: ",c," GB"]})]})]})]})}};var j,w,S;h.parameters={...h.parameters,docs:{...(j=h.parameters)==null?void 0:j.docs,source:{originalSource:`{
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
}`,...(S=(w=h.parameters)==null?void 0:w.docs)==null?void 0:S.source}}};var C,V,N;v.parameters={...v.parameters,docs:{...(C=v.parameters)==null?void 0:C.docs,source:{originalSource:`{
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
}`,...(N=(V=v.parameters)==null?void 0:V.docs)==null?void 0:N.source}}};var A,k,U;y.parameters={...y.parameters,docs:{...(A=y.parameters)==null?void 0:A.docs,source:{originalSource:`{
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
}`,...(U=(k=y.parameters)==null?void 0:k.docs)==null?void 0:U.source}}};var F,W,T;g.parameters={...g.parameters,docs:{...(F=g.parameters)==null?void 0:F.docs,source:{originalSource:`{
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
}`,...(T=(W=g.parameters)==null?void 0:W.docs)==null?void 0:T.source}}};var D,G,M;f.parameters={...f.parameters,docs:{...(D=f.parameters)==null?void 0:D.docs,source:{originalSource:`{
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
}`,...(M=(G=f.parameters)==null?void 0:G.docs)==null?void 0:M.source}}};var z,P,R;x.parameters={...x.parameters,docs:{...(z=x.parameters)==null?void 0:z.docs,source:{originalSource:`{
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
}`,...(R=(P=x.parameters)==null?void 0:P.docs)==null?void 0:R.source}}};var L,H,_;b.parameters={...b.parameters,docs:{...(L=b.parameters)==null?void 0:L.docs,source:{originalSource:`{
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
}`,...(_=(H=b.parameters)==null?void 0:H.docs)==null?void 0:_.source}}};const me=["Default","NumberInput","CommitBehavior","EnterIconHint","WithValidation","DifferentStates","RealWorldExample"];export{y as CommitBehavior,h as Default,x as DifferentStates,g as EnterIconHint,v as NumberInput,b as RealWorldExample,f as WithValidation,me as __namedExportsOrder,le as default};
