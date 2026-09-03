import{j as e}from"./iframe-Dz7pPF27.js";import{B as l}from"./BAIFlex-DbgP37ZB.js";import{B as a}from"./BooleanTag-Ct4jhcYv.js";import"./preload-helper-Dp1pzeXC.js";import"./astryxTagVariant-CPCr7vTB.js";import"./Badge-BWAFBrIN.js";const L={title:"Tag/BAIBooleanTag",component:a,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:"\n**BooleanTag** renders a colored tag representing a boolean value with customizable labels and fallback content.\n\n- **True values**: Displays a green tag\n- **False values**: Displays a semi-transparent default tag\n- **Non-boolean values**: Renders customizable fallback content\n\n## Props\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `value` | `boolean \\| null \\| undefined` | - | The boolean value to display |\n| `trueLabel` | `string` | `'True'` | Label shown when value is true |\n| `falseLabel` | `string` | `'False'` | Label shown when value is false |\n| `fallback` | `React.ReactNode` | `'-'` | Content rendered when value is not a boolean |\n        "}}},argTypes:{value:{control:{type:"radio"},options:[!0,!1,null],description:"The boolean value to display",table:{type:{summary:"boolean | null | undefined"}}},trueLabel:{control:{type:"text"},description:"Label shown when value is true",table:{type:{summary:"string"},defaultValue:{summary:"'True'"}}},falseLabel:{control:{type:"text"},description:"Label shown when value is false",table:{type:{summary:"string"},defaultValue:{summary:"'False'"}}},fallback:{control:{type:"text"},description:"Content rendered when value is not a boolean",table:{type:{summary:"React.ReactNode"},defaultValue:{summary:"'-'"}}}}},s={name:"Basic Usage",args:{value:!0,trueLabel:"True",falseLabel:"False",fallback:"-"}},n={name:"All Value States",parameters:{docs:{description:{story:"Shows how the component renders different value types: true, false, null, and undefined."}}},render:()=>e.jsxs(l,{direction:"column",gap:"md",align:"start",children:[e.jsxs(l,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:120},children:"True:"}),e.jsx(a,{value:!0})]}),e.jsxs(l,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:120},children:"False:"}),e.jsx(a,{value:!1})]}),e.jsxs(l,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:120},children:"Null:"}),e.jsx(a,{value:null})]}),e.jsxs(l,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:120},children:"Undefined:"}),e.jsx(a,{value:void 0})]})]})},t={parameters:{docs:{description:{story:"Demonstrates customizable labels for true/false states using trueLabel and falseLabel props."}}},render:()=>e.jsxs(l,{direction:"column",gap:"md",align:"start",children:[e.jsxs(l,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:150},children:"Default:"}),e.jsx(a,{value:!0}),e.jsx(a,{value:!1})]}),e.jsxs(l,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:150},children:"Yes/No:"}),e.jsx(a,{value:!0,trueLabel:"Yes",falseLabel:"No"}),e.jsx(a,{value:!1,trueLabel:"Yes",falseLabel:"No"})]}),e.jsxs(l,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:150},children:"Enabled/Disabled:"}),e.jsx(a,{value:!0,trueLabel:"Enabled",falseLabel:"Disabled"}),e.jsx(a,{value:!1,trueLabel:"Enabled",falseLabel:"Disabled"})]})]})},r={parameters:{docs:{description:{story:"Shows different fallback options for non-boolean values using the fallback prop."}}},render:()=>e.jsxs(l,{direction:"column",gap:"md",align:"start",children:[e.jsxs(l,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:150},children:"Default (-):"}),e.jsx(a,{value:null})]}),e.jsxs(l,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:150},children:"Custom text:"}),e.jsx(a,{value:null,fallback:"N/A"})]}),e.jsxs(l,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:150},children:"Custom element:"}),e.jsx(a,{value:void 0,fallback:e.jsx("span",{style:{color:"gray",fontStyle:"italic"},children:"Unknown"})})]})]})};var o,i,u;s.parameters={...s.parameters,docs:{...(o=s.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
        <BooleanTag value={true} />
      </BAIFlex>
      <BAIFlex gap="sm" align="center">
        <span style={{
        width: 120
      }}>False:</span>
        <BooleanTag value={false} />
      </BAIFlex>
      <BAIFlex gap="sm" align="center">
        <span style={{
        width: 120
      }}>Null:</span>
        <BooleanTag value={null} />
      </BAIFlex>
      <BAIFlex gap="sm" align="center">
        <span style={{
        width: 120
      }}>Undefined:</span>
        <BooleanTag value={undefined} />
      </BAIFlex>
    </BAIFlex>
}`,...(p=(c=n.parameters)==null?void 0:c.docs)==null?void 0:p.source}}};var m,g,b;t.parameters={...t.parameters,docs:{...(m=t.parameters)==null?void 0:m.docs,source:{originalSource:`{
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
        <BooleanTag value={true} />
        <BooleanTag value={false} />
      </BAIFlex>
      <BAIFlex gap="sm" align="center">
        <span style={{
        width: 150
      }}>Yes/No:</span>
        <BooleanTag value={true} trueLabel="Yes" falseLabel="No" />
        <BooleanTag value={false} trueLabel="Yes" falseLabel="No" />
      </BAIFlex>
      <BAIFlex gap="sm" align="center">
        <span style={{
        width: 150
      }}>Enabled/Disabled:</span>
        <BooleanTag value={true} trueLabel="Enabled" falseLabel="Disabled" />
        <BooleanTag value={false} trueLabel="Enabled" falseLabel="Disabled" />
      </BAIFlex>
    </BAIFlex>
}`,...(b=(g=t.parameters)==null?void 0:g.docs)==null?void 0:b.source}}};var f,x,h;r.parameters={...r.parameters,docs:{...(f=r.parameters)==null?void 0:f.docs,source:{originalSource:`{
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
        <BooleanTag value={null} />
      </BAIFlex>
      <BAIFlex gap="sm" align="center">
        <span style={{
        width: 150
      }}>Custom text:</span>
        <BooleanTag value={null} fallback="N/A" />
      </BAIFlex>
      <BAIFlex gap="sm" align="center">
        <span style={{
        width: 150
      }}>Custom element:</span>
        <BooleanTag value={undefined} fallback={<span style={{
        color: 'gray',
        fontStyle: 'italic'
      }}>Unknown</span>} />
      </BAIFlex>
    </BAIFlex>
}`,...(h=(x=r.parameters)==null?void 0:x.docs)==null?void 0:h.source}}};const A=["Default","ValueStates","CustomLabels","CustomFallback"];export{r as CustomFallback,t as CustomLabels,s as Default,n as ValueStates,A as __namedExportsOrder,L as default};
