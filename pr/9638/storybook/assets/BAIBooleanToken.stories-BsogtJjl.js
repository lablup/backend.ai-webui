import{j as e}from"./iframe-BaVSwCF0.js";import{B as a}from"./BAIBooleanToken-Bvx6I4BK.js";import{B as l}from"./BAIFlex-Cw1G09uF.js";import"./preload-helper-Dp1pzeXC.js";import"./Token-DHAkoohy.js";import"./composeEventHandlers-BolWE7qY.js";const w={title:"Tag/BAIBAIBooleanToken",component:a,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:"\n**BAIBooleanToken** renders a Token representing a boolean value with customizable labels and fallback content.\n\n- **True values**: Displays a green token\n- **False values**: Displays a default-colour token\n- **Non-boolean values**: Renders customizable fallback content\n\n## Props\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `value` | `boolean \\| null \\| undefined` | - | The boolean value to display |\n| `trueLabel` | `string` | `'True'` | Label shown when value is true |\n| `falseLabel` | `string` | `'False'` | Label shown when value is false |\n| `fallback` | `React.ReactNode` | `'-'` | Content rendered when value is not a boolean |\n        "}}},argTypes:{value:{control:{type:"radio"},options:[!0,!1,null],description:"The boolean value to display",table:{type:{summary:"boolean | null | undefined"}}},trueLabel:{control:{type:"text"},description:"Label shown when value is true",table:{type:{summary:"string"},defaultValue:{summary:"'True'"}}},falseLabel:{control:{type:"text"},description:"Label shown when value is false",table:{type:{summary:"string"},defaultValue:{summary:"'False'"}}},fallback:{control:{type:"text"},description:"Content rendered when value is not a boolean",table:{type:{summary:"React.ReactNode"},defaultValue:{summary:"'-'"}}}}},s={name:"Basic Usage",args:{value:!0,trueLabel:"True",falseLabel:"False",fallback:"-"}},n={name:"All Value States",parameters:{docs:{description:{story:"Shows how the component renders different value types: true, false, null, and undefined."}}},render:()=>e.jsxs(l,{direction:"column",gap:"md",align:"start",children:[e.jsxs(l,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:120},children:"True:"}),e.jsx(a,{value:!0})]}),e.jsxs(l,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:120},children:"False:"}),e.jsx(a,{value:!1})]}),e.jsxs(l,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:120},children:"Null:"}),e.jsx(a,{value:null})]}),e.jsxs(l,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:120},children:"Undefined:"}),e.jsx(a,{value:void 0})]})]})},t={parameters:{docs:{description:{story:"Demonstrates customizable labels for true/false states using trueLabel and falseLabel props."}}},render:()=>e.jsxs(l,{direction:"column",gap:"md",align:"start",children:[e.jsxs(l,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:150},children:"Default:"}),e.jsx(a,{value:!0}),e.jsx(a,{value:!1})]}),e.jsxs(l,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:150},children:"Yes/No:"}),e.jsx(a,{value:!0,trueLabel:"Yes",falseLabel:"No"}),e.jsx(a,{value:!1,trueLabel:"Yes",falseLabel:"No"})]}),e.jsxs(l,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:150},children:"Enabled/Disabled:"}),e.jsx(a,{value:!0,trueLabel:"Enabled",falseLabel:"Disabled"}),e.jsx(a,{value:!1,trueLabel:"Enabled",falseLabel:"Disabled"})]})]})},r={parameters:{docs:{description:{story:"Shows different fallback options for non-boolean values using the fallback prop."}}},render:()=>e.jsxs(l,{direction:"column",gap:"md",align:"start",children:[e.jsxs(l,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:150},children:"Default (-):"}),e.jsx(a,{value:null})]}),e.jsxs(l,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:150},children:"Custom text:"}),e.jsx(a,{value:null,fallback:"N/A"})]}),e.jsxs(l,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:150},children:"Custom element:"}),e.jsx(a,{value:void 0,fallback:e.jsx("span",{style:{color:"gray",fontStyle:"italic"},children:"Unknown"})})]})]})};var o,i,u;s.parameters={...s.parameters,docs:{...(o=s.parameters)==null?void 0:o.docs,source:{originalSource:`{
  name: 'Basic Usage',
  args: {
    value: true,
    trueLabel: 'True',
    falseLabel: 'False',
    fallback: '-'
  }
}`,...(u=(i=s.parameters)==null?void 0:i.docs)==null?void 0:u.source}}};var d,c,p;n.parameters={...n.parameters,docs:{...(d=n.parameters)==null?void 0:d.docs,source:{originalSource:`{
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
}`,...(p=(c=n.parameters)==null?void 0:c.docs)==null?void 0:p.source}}};var m,b,f;t.parameters={...t.parameters,docs:{...(m=t.parameters)==null?void 0:m.docs,source:{originalSource:`{
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
}`,...(f=(b=t.parameters)==null?void 0:b.docs)==null?void 0:f.source}}};var g,x,h;r.parameters={...r.parameters,docs:{...(g=r.parameters)==null?void 0:g.docs,source:{originalSource:`{
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
}`,...(h=(x=r.parameters)==null?void 0:x.docs)==null?void 0:h.source}}};const k=["Default","ValueStates","CustomLabels","CustomFallback"];export{r as CustomFallback,t as CustomLabels,s as Default,n as ValueStates,k as __namedExportsOrder,w as default};
