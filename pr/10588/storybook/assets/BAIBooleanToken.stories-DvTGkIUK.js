import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-MKhVqBIO.js";import{n,t as r}from"./useUicTranslator-B_bC9MIU.js";import{n as i,t as a}from"./BAIFlex-BOFoS5KY.js";import{n as o,t as s}from"./Token-B3CV8z6f.js";function c({value:e,trueLabel:t,falseLabel:n,fallback:i=`-`}){let a=r();return typeof e==`boolean`?e?(0,l.jsx)(s,{color:`green`,label:t??a(`uic.BooleanToken.true`)}):(0,l.jsx)(s,{color:`default`,label:n??a(`uic.BooleanToken.false`)}):i}var l;function u(){return(u=e((()=>{n(),l=t(),o(),c.displayName=`BooleanToken`})))()}var d;function f(){return(f=e((()=>{u(),d=c})))()}var p,m,h,g,_,v,y;function b(){return(b=e((()=>{f(),i(),p=t(),m={title:`Tag/BAIBAIBooleanToken`,component:d,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:"\n**BAIBooleanToken** renders a Token representing a boolean value with customizable labels and fallback content.\n\n- **True values**: Displays a green token\n- **False values**: Displays a default-colour token\n- **Non-boolean values**: Renders customizable fallback content\n\n## Props\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `value` | `boolean \\| null \\| undefined` | - | The boolean value to display |\n| `trueLabel` | `string` | `'True'` | Label shown when value is true |\n| `falseLabel` | `string` | `'False'` | Label shown when value is false |\n| `fallback` | `React.ReactNode` | `'-'` | Content rendered when value is not a boolean |\n        "}}},argTypes:{value:{control:{type:`radio`},options:[!0,!1,null],description:`The boolean value to display`,table:{type:{summary:`boolean | null | undefined`}}},trueLabel:{control:{type:`text`},description:`Label shown when value is true`,table:{type:{summary:`string`},defaultValue:{summary:`'True'`}}},falseLabel:{control:{type:`text`},description:`Label shown when value is false`,table:{type:{summary:`string`},defaultValue:{summary:`'False'`}}},fallback:{control:{type:`text`},description:`Content rendered when value is not a boolean`,table:{type:{summary:`React.ReactNode`},defaultValue:{summary:`'-'`}}}}},h={name:`Basic Usage`,args:{value:!0,trueLabel:`True`,falseLabel:`False`,fallback:`-`}},g={name:`All Value States`,parameters:{docs:{description:{story:`Shows how the component renders different value types: true, false, null, and undefined.`}}},render:()=>(0,p.jsxs)(a,{direction:`column`,gap:`md`,align:`start`,children:[(0,p.jsxs)(a,{gap:`sm`,align:`center`,children:[(0,p.jsx)(`span`,{style:{width:120},children:`True:`}),(0,p.jsx)(d,{value:!0})]}),(0,p.jsxs)(a,{gap:`sm`,align:`center`,children:[(0,p.jsx)(`span`,{style:{width:120},children:`False:`}),(0,p.jsx)(d,{value:!1})]}),(0,p.jsxs)(a,{gap:`sm`,align:`center`,children:[(0,p.jsx)(`span`,{style:{width:120},children:`Null:`}),(0,p.jsx)(d,{value:null})]}),(0,p.jsxs)(a,{gap:`sm`,align:`center`,children:[(0,p.jsx)(`span`,{style:{width:120},children:`Undefined:`}),(0,p.jsx)(d,{value:void 0})]})]})},_={parameters:{docs:{description:{story:`Demonstrates customizable labels for true/false states using trueLabel and falseLabel props.`}}},render:()=>(0,p.jsxs)(a,{direction:`column`,gap:`md`,align:`start`,children:[(0,p.jsxs)(a,{gap:`sm`,align:`center`,children:[(0,p.jsx)(`span`,{style:{width:150},children:`Default:`}),(0,p.jsx)(d,{value:!0}),(0,p.jsx)(d,{value:!1})]}),(0,p.jsxs)(a,{gap:`sm`,align:`center`,children:[(0,p.jsx)(`span`,{style:{width:150},children:`Yes/No:`}),(0,p.jsx)(d,{value:!0,trueLabel:`Yes`,falseLabel:`No`}),(0,p.jsx)(d,{value:!1,trueLabel:`Yes`,falseLabel:`No`})]}),(0,p.jsxs)(a,{gap:`sm`,align:`center`,children:[(0,p.jsx)(`span`,{style:{width:150},children:`Enabled/Disabled:`}),(0,p.jsx)(d,{value:!0,trueLabel:`Enabled`,falseLabel:`Disabled`}),(0,p.jsx)(d,{value:!1,trueLabel:`Enabled`,falseLabel:`Disabled`})]})]})},v={parameters:{docs:{description:{story:`Shows different fallback options for non-boolean values using the fallback prop.`}}},render:()=>(0,p.jsxs)(a,{direction:`column`,gap:`md`,align:`start`,children:[(0,p.jsxs)(a,{gap:`sm`,align:`center`,children:[(0,p.jsx)(`span`,{style:{width:150},children:`Default (-):`}),(0,p.jsx)(d,{value:null})]}),(0,p.jsxs)(a,{gap:`sm`,align:`center`,children:[(0,p.jsx)(`span`,{style:{width:150},children:`Custom text:`}),(0,p.jsx)(d,{value:null,fallback:`N/A`})]}),(0,p.jsxs)(a,{gap:`sm`,align:`center`,children:[(0,p.jsx)(`span`,{style:{width:150},children:`Custom element:`}),(0,p.jsx)(d,{value:void 0,fallback:(0,p.jsx)(`span`,{style:{color:`gray`,fontStyle:`italic`},children:`Unknown`})})]})]})},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  name: 'Basic Usage',
  args: {
    value: true,
    trueLabel: 'True',
    falseLabel: 'False',
    fallback: '-'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source}}},y=[`Default`,`ValueStates`,`CustomLabels`,`CustomFallback`]})))()}b();export{v as CustomFallback,_ as CustomLabels,h as Default,g as ValueStates,y as __namedExportsOrder,m as default};