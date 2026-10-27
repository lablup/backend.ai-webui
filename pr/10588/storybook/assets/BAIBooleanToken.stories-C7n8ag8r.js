import{n as e}from"./rolldown-runtime-2s6bX4vc.js";import{n as t,t as n}from"./BAIFlex-CAz1t6J5.js";import{jsx as r,jsxs as i}from"react/jsx-runtime";import{BooleanToken as a}from"@lablup/ui-common/components/BooleanToken";var o;function s(){return(s=e((()=>{o=a})))()}var c,l,u,d,f,p;function m(){return(m=e((()=>{s(),t(),c={title:`Tag/BAIBAIBooleanToken`,component:o,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:"\n**BAIBooleanToken** renders a Token representing a boolean value with customizable labels and fallback content.\n\n- **True values**: Displays a green token\n- **False values**: Displays a default-colour token\n- **Non-boolean values**: Renders customizable fallback content\n\n## Props\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `value` | `boolean \\| null \\| undefined` | - | The boolean value to display |\n| `trueLabel` | `string` | `'True'` | Label shown when value is true |\n| `falseLabel` | `string` | `'False'` | Label shown when value is false |\n| `fallback` | `React.ReactNode` | `'-'` | Content rendered when value is not a boolean |\n        "}}},argTypes:{value:{control:{type:`radio`},options:[!0,!1,null],description:`The boolean value to display`,table:{type:{summary:`boolean | null | undefined`}}},trueLabel:{control:{type:`text`},description:`Label shown when value is true`,table:{type:{summary:`string`},defaultValue:{summary:`'True'`}}},falseLabel:{control:{type:`text`},description:`Label shown when value is false`,table:{type:{summary:`string`},defaultValue:{summary:`'False'`}}},fallback:{control:{type:`text`},description:`Content rendered when value is not a boolean`,table:{type:{summary:`React.ReactNode`},defaultValue:{summary:`'-'`}}}}},l={name:`Basic Usage`,args:{value:!0,trueLabel:`True`,falseLabel:`False`,fallback:`-`}},u={name:`All Value States`,parameters:{docs:{description:{story:`Shows how the component renders different value types: true, false, null, and undefined.`}}},render:()=>i(n,{direction:`column`,gap:`md`,align:`start`,children:[i(n,{gap:`sm`,align:`center`,children:[r(`span`,{style:{width:120},children:`True:`}),r(o,{value:!0})]}),i(n,{gap:`sm`,align:`center`,children:[r(`span`,{style:{width:120},children:`False:`}),r(o,{value:!1})]}),i(n,{gap:`sm`,align:`center`,children:[r(`span`,{style:{width:120},children:`Null:`}),r(o,{value:null})]}),i(n,{gap:`sm`,align:`center`,children:[r(`span`,{style:{width:120},children:`Undefined:`}),r(o,{value:void 0})]})]})},d={parameters:{docs:{description:{story:`Demonstrates customizable labels for true/false states using trueLabel and falseLabel props.`}}},render:()=>i(n,{direction:`column`,gap:`md`,align:`start`,children:[i(n,{gap:`sm`,align:`center`,children:[r(`span`,{style:{width:150},children:`Default:`}),r(o,{value:!0}),r(o,{value:!1})]}),i(n,{gap:`sm`,align:`center`,children:[r(`span`,{style:{width:150},children:`Yes/No:`}),r(o,{value:!0,trueLabel:`Yes`,falseLabel:`No`}),r(o,{value:!1,trueLabel:`Yes`,falseLabel:`No`})]}),i(n,{gap:`sm`,align:`center`,children:[r(`span`,{style:{width:150},children:`Enabled/Disabled:`}),r(o,{value:!0,trueLabel:`Enabled`,falseLabel:`Disabled`}),r(o,{value:!1,trueLabel:`Enabled`,falseLabel:`Disabled`})]})]})},f={parameters:{docs:{description:{story:`Shows different fallback options for non-boolean values using the fallback prop.`}}},render:()=>i(n,{direction:`column`,gap:`md`,align:`start`,children:[i(n,{gap:`sm`,align:`center`,children:[r(`span`,{style:{width:150},children:`Default (-):`}),r(o,{value:null})]}),i(n,{gap:`sm`,align:`center`,children:[r(`span`,{style:{width:150},children:`Custom text:`}),r(o,{value:null,fallback:`N/A`})]}),i(n,{gap:`sm`,align:`center`,children:[r(`span`,{style:{width:150},children:`Custom element:`}),r(o,{value:void 0,fallback:r(`span`,{style:{color:`gray`,fontStyle:`italic`},children:`Unknown`})})]})]})},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  name: 'Basic Usage',
  args: {
    value: true,
    trueLabel: 'True',
    falseLabel: 'False',
    fallback: '-'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  name: 'All Value States',
  parameters: {
    docs: {
      description: {
        story: 'Shows how the component renders different value types: true, false, null, and undefined.'
      }
    }
  },
  render: () => <BAIFlex direction="column" gap="md" align="start">
      <BAIFlex gap="sm" align="center">
        <span style={{
        width: 120
      }}>True:</span>
        <BAIBooleanToken value={true} />
      </BAIFlex>
      <BAIFlex gap="sm" align="center">
        <span style={{
        width: 120
      }}>False:</span>
        <BAIBooleanToken value={false} />
      </BAIFlex>
      <BAIFlex gap="sm" align="center">
        <span style={{
        width: 120
      }}>Null:</span>
        <BAIBooleanToken value={null} />
      </BAIFlex>
      <BAIFlex gap="sm" align="center">
        <span style={{
        width: 120
      }}>Undefined:</span>
        <BAIBooleanToken value={undefined} />
      </BAIFlex>
    </BAIFlex>
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates customizable labels for true/false states using trueLabel and falseLabel props.'
      }
    }
  },
  render: () => <BAIFlex direction="column" gap="md" align="start">
      <BAIFlex gap="sm" align="center">
        <span style={{
        width: 150
      }}>Default:</span>
        <BAIBooleanToken value={true} />
        <BAIBooleanToken value={false} />
      </BAIFlex>
      <BAIFlex gap="sm" align="center">
        <span style={{
        width: 150
      }}>Yes/No:</span>
        <BAIBooleanToken value={true} trueLabel="Yes" falseLabel="No" />
        <BAIBooleanToken value={false} trueLabel="Yes" falseLabel="No" />
      </BAIFlex>
      <BAIFlex gap="sm" align="center">
        <span style={{
        width: 150
      }}>Enabled/Disabled:</span>
        <BAIBooleanToken value={true} trueLabel="Enabled" falseLabel="Disabled" />
        <BAIBooleanToken value={false} trueLabel="Enabled" falseLabel="Disabled" />
      </BAIFlex>
    </BAIFlex>
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Shows different fallback options for non-boolean values using the fallback prop.'
      }
    }
  },
  render: () => <BAIFlex direction="column" gap="md" align="start">
      <BAIFlex gap="sm" align="center">
        <span style={{
        width: 150
      }}>Default (-):</span>
        <BAIBooleanToken value={null} />
      </BAIFlex>
      <BAIFlex gap="sm" align="center">
        <span style={{
        width: 150
      }}>Custom text:</span>
        <BAIBooleanToken value={null} fallback="N/A" />
      </BAIFlex>
      <BAIFlex gap="sm" align="center">
        <span style={{
        width: 150
      }}>Custom element:</span>
        <BAIBooleanToken value={undefined} fallback={<span style={{
        color: 'gray',
        fontStyle: 'italic'
      }}>Unknown</span>} />
      </BAIFlex>
    </BAIFlex>
}`,...f.parameters?.docs?.source}}},p=[`Default`,`ValueStates`,`CustomLabels`,`CustomFallback`]})))()}m();export{f as CustomFallback,d as CustomLabels,l as Default,u as ValueStates,p as __namedExportsOrder,c as default};