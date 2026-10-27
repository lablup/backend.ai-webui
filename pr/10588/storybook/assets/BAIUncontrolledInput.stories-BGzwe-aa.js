import{n as e}from"./rolldown-runtime-2s6bX4vc.js";import{n as t,t as n}from"./BAIFlex-CAz1t6J5.js";import{useState as r}from"react";import{jsx as i,jsxs as a}from"react/jsx-runtime";import{c as o}from"react/compiler-runtime";import{UncontrolledInput as s}from"@lablup/ui-common/components/UncontrolledInput";var c;function l(){return(l=e((()=>{c=e=>{"use memo";let t=o(10),n,r,a;t[0]===e?(n=t[1],r=t[2],a=t[3]):({disabled:n,status:r,...a}=e,t[0]=e,t[1]=n,t[2]=r,t[3]=a);let c;t[4]===r?c=t[5]:(c=r===`error`||r===`warning`?{type:r}:void 0,t[4]=r,t[5]=c);let l;return t[6]!==n||t[7]!==c||t[8]!==a?(l=i(s,{...a,isDisabled:n,status:c}),t[6]=n,t[7]=c,t[8]=a,t[9]=l):l=t[9],l}})))()}var u,d,f,p,m,h,g,_,v;function y(){return(y=e((()=>{t(),l(),u={title:`Input/BAIUncontrolledInput`,component:c,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:`
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
        `}}},argTypes:{defaultValue:{control:{type:`text`},description:`Initial value for the uncontrolled input`,table:{type:{summary:`string`}}},onCommit:{action:`committed`,description:`Callback when value is committed (on blur or Enter key)`,table:{type:{summary:`(value: string) => void`}}},type:{control:{type:`select`},options:[`text`,`number`,`password`,`email`,`url`],description:`Input type`,table:{type:{summary:`string`},defaultValue:{summary:`text`}}},placeholder:{control:{type:`text`},description:`Placeholder text`,table:{type:{summary:`string`}}},disabled:{control:{type:`boolean`},description:`Whether input is disabled`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}}}},d={name:`Basic`,parameters:{docs:{description:{story:`Basic uncontrolled input. Type text and press Enter or click outside to commit the value.`}}},args:{defaultValue:`Edit me and press Enter`,placeholder:`Type something...`}},f={parameters:{docs:{description:{story:`Number input without spinner arrows. Notice the spinner controls are hidden.`}}},args:{type:`number`,defaultValue:`42`,placeholder:`Enter a number`}},p={parameters:{docs:{description:{story:`Demonstrates commit-on-blur behavior. Edit the input and see the committed value update when you blur or press Enter.`}}},render:()=>{let[e,t]=r(``);return a(n,{direction:`column`,gap:`md`,style:{width:300},children:[a(`div`,{children:[i(`div`,{style:{marginBottom:8,fontWeight:500},children:`Edit and press Enter or blur:`}),i(c,{defaultValue:`Edit this text`,onCommit:e=>t(e),placeholder:`Type and commit...`})]}),a(`div`,{children:[i(`div`,{style:{marginBottom:8,fontWeight:500},children:`Committed Value:`}),i(`div`,{style:{padding:8,background:`#f5f5f5`,borderRadius:4,fontFamily:`monospace`},children:e||`(not committed yet)`})]})]})}},m={parameters:{docs:{description:{story:`Focus on the input to see the Enter icon hint appear in the suffix.`}}},render:()=>a(n,{direction:`column`,gap:`md`,style:{width:300},children:[a(`div`,{children:[i(`div`,{style:{marginBottom:8},children:`Focus to see Enter icon:`}),i(c,{defaultValue:`Focus me`,placeholder:`Click to focus...`})]}),i(`div`,{style:{fontSize:12,color:`#666`},children:`💡 The ⏎ icon appears when focused to indicate you can press Enter to commit.`})]})},h={parameters:{docs:{description:{story:`Example with validation on commit.`}}},render:()=>{let[e,t]=r(``);return i(n,{direction:`column`,gap:`md`,style:{width:300},children:a(`div`,{children:[i(`div`,{style:{marginBottom:8,fontWeight:500},children:`Enter a number between 1-100:`}),i(c,{type:`number`,defaultValue:`50`,status:e?`error`:void 0,onCommit:e=>{let n=Number(e);t(isNaN(n)||n<1||n>100?`Must be between 1 and 100`:``)}}),e&&i(`div`,{style:{color:`#ff4d4f`,marginTop:4},children:e})]})})}},g={parameters:{docs:{description:{story:`Input in different states (normal, disabled, error, warning).`}}},render:()=>a(n,{direction:`column`,gap:`md`,style:{width:300},children:[a(`div`,{children:[i(`div`,{style:{marginBottom:8},children:`Normal:`}),i(c,{defaultValue:`Normal input`})]}),a(`div`,{children:[i(`div`,{style:{marginBottom:8},children:`Disabled:`}),i(c,{defaultValue:`Disabled input`,disabled:!0})]}),a(`div`,{children:[i(`div`,{style:{marginBottom:8},children:`Error:`}),i(c,{defaultValue:`Error state`,status:`error`})]}),a(`div`,{children:[i(`div`,{style:{marginBottom:8},children:`Warning:`}),i(c,{defaultValue:`Warning state`,status:`warning`})]})]})},_={parameters:{docs:{description:{story:`Realistic examples showing typical use cases in Backend.AI WebUI.`}}},render:()=>{let[e,t]=r(`my-jupyter-session`),[o,s]=r(`4`),[l,u]=r(`16`);return a(n,{direction:`column`,gap:`lg`,style:{width:400},children:[a(`div`,{children:[i(`div`,{style:{marginBottom:8,fontWeight:500},children:`Session Configuration`}),a(n,{direction:`column`,gap:`sm`,children:[a(`div`,{children:[i(`div`,{style:{marginBottom:4,fontSize:12},children:`Session Name:`}),i(c,{defaultValue:e,onCommit:e=>t(e),placeholder:`Enter session name`})]}),a(`div`,{children:[i(`div`,{style:{marginBottom:4,fontSize:12},children:`CPU Cores:`}),i(c,{type:`number`,defaultValue:o,onCommit:e=>s(e),placeholder:`Number of cores`})]}),a(`div`,{children:[i(`div`,{style:{marginBottom:4,fontSize:12},children:`Memory (GB):`}),i(c,{type:`number`,defaultValue:l,onCommit:e=>u(e),placeholder:`Memory in GB`})]})]})]}),a(`div`,{children:[i(`div`,{style:{marginBottom:8,fontWeight:500},children:`Current Configuration`}),a(`div`,{style:{padding:12,background:`#f5f5f5`,borderRadius:4,fontFamily:`monospace`,fontSize:12},children:[a(`div`,{children:[`Session: `,e]}),a(`div`,{children:[`CPU: `,o,` cores`]}),a(`div`,{children:[`Memory: `,l,` GB`]})]})]})]})}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
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
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
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
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source}}},v=[`Default`,`NumberInput`,`CommitBehavior`,`EnterIconHint`,`WithValidation`,`DifferentStates`,`RealWorldExample`]})))()}y();export{p as CommitBehavior,d as Default,g as DifferentStates,m as EnterIconHint,f as NumberInput,_ as RealWorldExample,h as WithValidation,v as __namedExportsOrder,u as default};