import{j as e}from"./iframe-Wv7HyymT.js";import{T as i}from"./Token-BmMprlFr.js";import{B as l}from"./BAIFlex-BGzU7Ae8.js";import"./preload-helper-Dp1pzeXC.js";import"./composeEventHandlers-BolWE7qY.js";const a=({value:o,fallback:A="-",trueLabel:v="True",falseLabel:I="False"})=>typeof o!="boolean"?A:o?e.jsx(i,{color:"green",label:v}):e.jsx(i,{color:"default",label:I}),T={title:"Tag/BAIBAIBooleanToken",component:a,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:"\n**BAIBooleanToken** renders a Token representing a boolean value with customizable labels and fallback content.\n\n- **True values**: Displays a green token\n- **False values**: Displays a default-colour token\n- **Non-boolean values**: Renders customizable fallback content\n\n## Props\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `value` | `boolean \\| null \\| undefined` | - | The boolean value to display |\n| `trueLabel` | `string` | `'True'` | Label shown when value is true |\n| `falseLabel` | `string` | `'False'` | Label shown when value is false |\n| `fallback` | `React.ReactNode` | `'-'` | Content rendered when value is not a boolean |\n        "}}},argTypes:{value:{control:{type:"radio"},options:[!0,!1,null],description:"The boolean value to display",table:{type:{summary:"boolean | null | undefined"}}},trueLabel:{control:{type:"text"},description:"Label shown when value is true",table:{type:{summary:"string"},defaultValue:{summary:"'True'"}}},falseLabel:{control:{type:"text"},description:"Label shown when value is false",table:{type:{summary:"string"},defaultValue:{summary:"'False'"}}},fallback:{control:{type:"text"},description:"Content rendered when value is not a boolean",table:{type:{summary:"React.ReactNode"},defaultValue:{summary:"'-'"}}}}},s={name:"Basic Usage",args:{value:!0,trueLabel:"True",falseLabel:"False",fallback:"-"}},n={name:"All Value States",parameters:{docs:{description:{story:"Shows how the component renders different value types: true, false, null, and undefined."}}},render:()=>e.jsxs(l,{direction:"column",gap:"md",align:"start",children:[e.jsxs(l,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:120},children:"True:"}),e.jsx(a,{value:!0})]}),e.jsxs(l,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:120},children:"False:"}),e.jsx(a,{value:!1})]}),e.jsxs(l,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:120},children:"Null:"}),e.jsx(a,{value:null})]}),e.jsxs(l,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:120},children:"Undefined:"}),e.jsx(a,{value:void 0})]})]})},t={parameters:{docs:{description:{story:"Demonstrates customizable labels for true/false states using trueLabel and falseLabel props."}}},render:()=>e.jsxs(l,{direction:"column",gap:"md",align:"start",children:[e.jsxs(l,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:150},children:"Default:"}),e.jsx(a,{value:!0}),e.jsx(a,{value:!1})]}),e.jsxs(l,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:150},children:"Yes/No:"}),e.jsx(a,{value:!0,trueLabel:"Yes",falseLabel:"No"}),e.jsx(a,{value:!1,trueLabel:"Yes",falseLabel:"No"})]}),e.jsxs(l,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:150},children:"Enabled/Disabled:"}),e.jsx(a,{value:!0,trueLabel:"Enabled",falseLabel:"Disabled"}),e.jsx(a,{value:!1,trueLabel:"Enabled",falseLabel:"Disabled"})]})]})},r={parameters:{docs:{description:{story:"Shows different fallback options for non-boolean values using the fallback prop."}}},render:()=>e.jsxs(l,{direction:"column",gap:"md",align:"start",children:[e.jsxs(l,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:150},children:"Default (-):"}),e.jsx(a,{value:null})]}),e.jsxs(l,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:150},children:"Custom text:"}),e.jsx(a,{value:null,fallback:"N/A"})]}),e.jsxs(l,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:150},children:"Custom element:"}),e.jsx(a,{value:void 0,fallback:e.jsx("span",{style:{color:"gray",fontStyle:"italic"},children:"Unknown"})})]})]})};var u,d,c;s.parameters={...s.parameters,docs:{...(u=s.parameters)==null?void 0:u.docs,source:{originalSource:`{
  name: 'Basic Usage',
  args: {
    value: true,
    trueLabel: 'True',
    falseLabel: 'False',
    fallback: '-'
  }
}`,...(c=(d=s.parameters)==null?void 0:d.docs)==null?void 0:c.source}}};var p,m,b;n.parameters={...n.parameters,docs:{...(p=n.parameters)==null?void 0:p.docs,source:{originalSource:`{
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
}`,...(b=(m=n.parameters)==null?void 0:m.docs)==null?void 0:b.source}}};var f,g,x;t.parameters={...t.parameters,docs:{...(f=t.parameters)==null?void 0:f.docs,source:{originalSource:`{
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
}`,...(x=(g=t.parameters)==null?void 0:g.docs)==null?void 0:x.source}}};var h,B,y;r.parameters={...r.parameters,docs:{...(h=r.parameters)==null?void 0:h.docs,source:{originalSource:`{
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
}`,...(y=(B=r.parameters)==null?void 0:B.docs)==null?void 0:y.source}}};const D=["Default","ValueStates","CustomLabels","CustomFallback"];export{r as CustomFallback,t as CustomLabels,s as Default,n as ValueStates,D as __namedExportsOrder,T as default};
