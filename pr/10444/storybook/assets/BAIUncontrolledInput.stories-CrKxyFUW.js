import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-DlPsW1c0.js";import{t as n}from"./jsx-runtime-MKhVqBIO.js";import{n as r,t as i}from"./useUicTranslator-M0QCXAqZ.js";import{t as a}from"./compiler-runtime-DU4U6aph.js";import{n as o,t as s}from"./BAIFlex-DnaoYTJ1.js";import{n as c,t as l}from"./TextInput-x54VS4_H.js";import{n as u,t as d}from"./NumberInput-ChcMRzwo.js";function f({defaultValue:e,onCommit:t,type:n,placeholder:r,isDisabled:a,status:o,label:s,isLabelHidden:c,width:u,className:f,style:h,controlClassName:g,controlStyle:_,...v}){let y=i(),[b,x]=(0,p.useState)(e??``),S=(0,p.useRef)(null),[C,w]=(0,p.useState)(e);C!==e&&(w(e),x(e??``));let T={...v,label:s??y(`uic.UncontrolledInput.label`),isLabelHidden:c??s===void 0,placeholder:r,isDisabled:a,status:o,width:u,containerClassName:f,containerStyle:h,controlClassName:g,controlStyle:_},E=()=>{let e=S.current??b;S.current=null,t==null||t(e)};if(n===`number`){let e=b===``?null:Number(b);return(0,m.jsx)(d,{...T,value:e===null||Number.isNaN(e)?null:e,onChange:e=>{let t=e===null?``:String(e);S.current=t,x(t)},onEnter:E,onBlur:E})}return(0,m.jsx)(l,{...T,type:n===`password`||n===`email`?n:`text`,value:b,onChange:x,onEnter:E,onBlur:E})}var p,m;function h(){return(h=e((()=>{r(),p=t(),m=n(),c(),u(),f.displayName=`UncontrolledInput`})))()}var g,_,v;function y(){return(y=e((()=>{g=a(),h(),_=n(),v=e=>{"use memo";let t=(0,g.c)(10),n,r,i;t[0]===e?(n=t[1],r=t[2],i=t[3]):({disabled:n,status:r,...i}=e,t[0]=e,t[1]=n,t[2]=r,t[3]=i);let a;t[4]===r?a=t[5]:(a=r===`error`||r===`warning`?{type:r}:void 0,t[4]=r,t[5]=a);let o;return t[6]!==n||t[7]!==a||t[8]!==i?(o=(0,_.jsx)(f,{...i,isDisabled:n,status:a}),t[6]=n,t[7]=a,t[8]=i,t[9]=o):o=t[9],o}})))()}var b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W;function G(){return(G=e((()=>{o(),y(),b=t(),x=n(),I={title:`Input/BAIUncontrolledInput`,component:v,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:`
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
        `}}},argTypes:{defaultValue:{control:{type:`text`},description:`Initial value for the uncontrolled input`,table:{type:{summary:`string`}}},onCommit:{action:`committed`,description:`Callback when value is committed (on blur or Enter key)`,table:{type:{summary:`(value: string) => void`}}},type:{control:{type:`select`},options:[`text`,`number`,`password`,`email`,`url`],description:`Input type`,table:{type:{summary:`string`},defaultValue:{summary:`text`}}},placeholder:{control:{type:`text`},description:`Placeholder text`,table:{type:{summary:`string`}}},disabled:{control:{type:`boolean`},description:`Whether input is disabled`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}}}},L={name:`Basic`,parameters:{docs:{description:{story:`Basic uncontrolled input. Type text and press Enter or click outside to commit the value.`}}},args:{defaultValue:`Edit me and press Enter`,placeholder:`Type something...`}},R={parameters:{docs:{description:{story:`Number input without spinner arrows. Notice the spinner controls are hidden.`}}},args:{type:`number`,defaultValue:`42`,placeholder:`Enter a number`}},z={parameters:{docs:{description:{story:`Demonstrates commit-on-blur behavior. Edit the input and see the committed value update when you blur or press Enter.`}}},render:()=>{let[e,t]=(0,b.useState)(``);return(0,x.jsxs)(s,{direction:`column`,gap:`md`,style:{width:300},children:[(0,x.jsxs)(`div`,{children:[(0,x.jsx)(`div`,{style:{marginBottom:8,fontWeight:500},children:`Edit and press Enter or blur:`}),(0,x.jsx)(v,{defaultValue:`Edit this text`,onCommit:e=>t(e),placeholder:`Type and commit...`})]}),(0,x.jsxs)(`div`,{children:[(0,x.jsx)(`div`,{style:{marginBottom:8,fontWeight:500},children:`Committed Value:`}),(0,x.jsx)(`div`,{style:{padding:8,background:`#f5f5f5`,borderRadius:4,fontFamily:`monospace`},children:e||`(not committed yet)`})]})]})}},B={parameters:{docs:{description:{story:`Focus on the input to see the Enter icon hint appear in the suffix.`}}},render:()=>(0,x.jsxs)(s,{direction:`column`,gap:`md`,style:{width:300},children:[(0,x.jsxs)(`div`,{children:[(0,x.jsx)(`div`,{style:{marginBottom:8},children:`Focus to see Enter icon:`}),(0,x.jsx)(v,{defaultValue:`Focus me`,placeholder:`Click to focus...`})]}),(0,x.jsx)(`div`,{style:{fontSize:12,color:`#666`},children:`💡 The ⏎ icon appears when focused to indicate you can press Enter to commit.`})]})},V={parameters:{docs:{description:{story:`Example with validation on commit.`}}},render:()=>{let[e,t]=(0,b.useState)(``);return(0,x.jsx)(s,{direction:`column`,gap:`md`,style:{width:300},children:(0,x.jsxs)(`div`,{children:[(0,x.jsx)(`div`,{style:{marginBottom:8,fontWeight:500},children:`Enter a number between 1-100:`}),(0,x.jsx)(v,{type:`number`,defaultValue:`50`,status:e?`error`:void 0,onCommit:e=>{let n=Number(e);t(isNaN(n)||n<1||n>100?`Must be between 1 and 100`:``)}}),e&&(0,x.jsx)(`div`,{style:{color:`#ff4d4f`,marginTop:4},children:e})]})})}},H={parameters:{docs:{description:{story:`Input in different states (normal, disabled, error, warning).`}}},render:()=>(0,x.jsxs)(s,{direction:`column`,gap:`md`,style:{width:300},children:[(0,x.jsxs)(`div`,{children:[(0,x.jsx)(`div`,{style:{marginBottom:8},children:`Normal:`}),(0,x.jsx)(v,{defaultValue:`Normal input`})]}),(0,x.jsxs)(`div`,{children:[(0,x.jsx)(`div`,{style:{marginBottom:8},children:`Disabled:`}),(0,x.jsx)(v,{defaultValue:`Disabled input`,disabled:!0})]}),(0,x.jsxs)(`div`,{children:[(0,x.jsx)(`div`,{style:{marginBottom:8},children:`Error:`}),(0,x.jsx)(v,{defaultValue:`Error state`,status:`error`})]}),(0,x.jsxs)(`div`,{children:[(0,x.jsx)(`div`,{style:{marginBottom:8},children:`Warning:`}),(0,x.jsx)(v,{defaultValue:`Warning state`,status:`warning`})]})]})},U={parameters:{docs:{description:{story:`Realistic examples showing typical use cases in Backend.AI WebUI.`}}},render:()=>{let[e,t]=(0,b.useState)(`my-jupyter-session`),[n,r]=(0,b.useState)(`4`),[i,a]=(0,b.useState)(`16`);return(0,x.jsxs)(s,{direction:`column`,gap:`lg`,style:{width:400},children:[(0,x.jsxs)(`div`,{children:[(0,x.jsx)(`div`,{style:{marginBottom:8,fontWeight:500},children:`Session Configuration`}),(0,x.jsxs)(s,{direction:`column`,gap:`sm`,children:[(0,x.jsxs)(`div`,{children:[(0,x.jsx)(`div`,{style:{marginBottom:4,fontSize:12},children:`Session Name:`}),(0,x.jsx)(v,{defaultValue:e,onCommit:e=>t(e),placeholder:`Enter session name`})]}),(0,x.jsxs)(`div`,{children:[(0,x.jsx)(`div`,{style:{marginBottom:4,fontSize:12},children:`CPU Cores:`}),(0,x.jsx)(v,{type:`number`,defaultValue:n,onCommit:e=>r(e),placeholder:`Number of cores`})]}),(0,x.jsxs)(`div`,{children:[(0,x.jsx)(`div`,{style:{marginBottom:4,fontSize:12},children:`Memory (GB):`}),(0,x.jsx)(v,{type:`number`,defaultValue:i,onCommit:e=>a(e),placeholder:`Memory in GB`})]})]})]}),(0,x.jsxs)(`div`,{children:[(0,x.jsx)(`div`,{style:{marginBottom:8,fontWeight:500},children:`Current Configuration`}),(0,x.jsxs)(`div`,{style:{padding:12,background:`#f5f5f5`,borderRadius:4,fontFamily:`monospace`,fontSize:12},children:[(0,x.jsxs)(`div`,{children:[`Session: `,e]}),(0,x.jsxs)(`div`,{children:[`CPU: `,n,` cores`]}),(0,x.jsxs)(`div`,{children:[`Memory: `,i,` GB`]})]})]})]})}},L.parameters={...L.parameters,docs:{...(S=L.parameters)==null?void 0:S.docs,source:{originalSource:`{
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
}`,...(C=L.parameters)==null||(C=C.docs)==null?void 0:C.source}}},R.parameters={...R.parameters,docs:{...(w=R.parameters)==null?void 0:w.docs,source:{originalSource:`{
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
}`,...(T=R.parameters)==null||(T=T.docs)==null?void 0:T.source}}},z.parameters={...z.parameters,docs:{...(E=z.parameters)==null?void 0:E.docs,source:{originalSource:`{
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
}`,...(D=z.parameters)==null||(D=D.docs)==null?void 0:D.source}}},B.parameters={...B.parameters,docs:{...(O=B.parameters)==null?void 0:O.docs,source:{originalSource:`{
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
}`,...(k=B.parameters)==null||(k=k.docs)==null?void 0:k.source}}},V.parameters={...V.parameters,docs:{...(A=V.parameters)==null?void 0:A.docs,source:{originalSource:`{
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
}`,...(j=V.parameters)==null||(j=j.docs)==null?void 0:j.source}}},H.parameters={...H.parameters,docs:{...(M=H.parameters)==null?void 0:M.docs,source:{originalSource:`{
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
}`,...(N=H.parameters)==null||(N=N.docs)==null?void 0:N.source}}},U.parameters={...U.parameters,docs:{...(P=U.parameters)==null?void 0:P.docs,source:{originalSource:`{
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
}`,...(F=U.parameters)==null||(F=F.docs)==null?void 0:F.source}}},W=[`Default`,`NumberInput`,`CommitBehavior`,`EnterIconHint`,`WithValidation`,`DifferentStates`,`RealWorldExample`]})))()}G();export{z as CommitBehavior,L as Default,H as DifferentStates,B as EnterIconHint,R as NumberInput,U as RealWorldExample,V as WithValidation,W as __namedExportsOrder,I as default};