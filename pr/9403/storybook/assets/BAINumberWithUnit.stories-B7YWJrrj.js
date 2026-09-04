import{j as t}from"./iframe-BNdPrXzC.js";import{B as n}from"./BAICard-CYbp9-Kb.js";import{B as e}from"./BAIFlex-t7v_7TWh.js";import{B as i}from"./BAINumberWithUnit-BNAs_q-V.js";import"./preload-helper-Dp1pzeXC.js";import"./astryxLabel-BBr4_hNq.js";import"./BAIButton-UJBy1tnn.js";import"./BAITabList-D6TUnVQa.js";import"./useDevWarning-DB5sqgz4.js";import"./useListFocus-C9waQbxr.js";import"./isRtlElement-B2-7SF8s.js";import"./rtlStyles-T4i24HtE.js";import"./VStack-CIJ8rv82.js";import"./Divider-A-BbIOXX.js";import"./index-zzxqNqAW.js";import"./isNumber-hLiBlC57.js";import"./toString-CKLVhEI6.js";import"./isSymbol-BE2u8Ce6.js";import"./filter-CmI6Kzo1.js";import"./_baseEach-10g1UV47.js";import"./get-BGPYbuRt.js";import"./_baseGet-Daar7M-1.js";import"./identity-DKeuBCMA.js";import"./isEmpty-CCbfq61I.js";const _={title:"Statistic/BAINumberWithUnit",component:i,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:`
**BAINumberWithUnit** is a component that converts and displays numbers with size units in binary or decimal format.

## Features
- Binary (1024-based) or Decimal (1000-based) unit conversion
- Automatic unit selection when value rounds to 0 in target unit
- Styled unit display with secondary text color
- Optional postfix support

## Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`numberUnit\` | \`string\` | - | Input value with unit (e.g., "1024m", "2g", "512") |
| \`targetUnit\` | \`SizeUnit\` | - | Target unit: '', 'k', 'm', 'g', 't', 'p', 'e' |
| \`unitType\` | \`'binary' or 'decimal'\` | - | Binary (1024) or Decimal (1000) conversion |
| \`postfix\` | \`string\` | - | Optional postfix to append after number |

## Unit Types
- **Binary**: Base 1024 (KiB, MiB, GiB, TiB, PiB, EiB)
- **Decimal**: Base 1000 (KB, MB, GB, TB, PB, EB)
        `}}},argTypes:{numberUnit:{control:{type:"text"},description:'Input value with unit (e.g., "1024m", "2g")',table:{type:{summary:"string"}}},targetUnit:{control:{type:"select"},options:["","k","m","g","t","p","e"],description:"Target unit for conversion",table:{type:{summary:"SizeUnit"}}},unitType:{control:{type:"radio"},options:["binary","decimal"],description:"Binary (1024) or Decimal (1000) conversion",table:{type:{summary:"'binary' | 'decimal'"}}},postfix:{control:{type:"text"},description:"Optional postfix to append after number",table:{type:{summary:"string"}}}}},r={name:"Basic",args:{numberUnit:"1024m",targetUnit:"g",unitType:"binary"}},s={render:()=>t.jsxs(e,{direction:"column",gap:"md",children:[t.jsx(n,{size:"small",title:"1024 units: Binary vs Decimal",styles:{body:{paddingTop:0}},children:t.jsxs(e,{direction:"column",gap:"sm",children:[t.jsxs("div",{children:[t.jsx("strong",{children:"1024m (Binary → GiB):"})," ",t.jsx(i,{numberUnit:"1024m",targetUnit:"g",unitType:"binary"})]}),t.jsxs("div",{children:[t.jsx("strong",{children:"1024m (Decimal → GB):"})," ",t.jsx(i,{numberUnit:"1024m",targetUnit:"g",unitType:"decimal"})]})]})}),t.jsx(n,{size:"small",title:"2048 units: Binary vs Decimal",styles:{body:{paddingTop:0}},children:t.jsxs(e,{direction:"column",gap:"sm",children:[t.jsxs("div",{children:[t.jsx("strong",{children:"2048g (Binary → TiB):"})," ",t.jsx(i,{numberUnit:"2048g",targetUnit:"t",unitType:"binary"})]}),t.jsxs("div",{children:[t.jsx("strong",{children:"2048g (Decimal → TB):"})," ",t.jsx(i,{numberUnit:"2048g",targetUnit:"t",unitType:"decimal"})]})]})}),t.jsx(n,{size:"small",title:"Various conversions",styles:{body:{paddingTop:0}},children:t.jsxs(e,{direction:"column",gap:"sm",children:[t.jsxs("div",{children:[t.jsx("strong",{children:"1024 bytes → KiB:"})," ",t.jsx(i,{numberUnit:"1024",targetUnit:"k",unitType:"binary"})]}),t.jsxs("div",{children:[t.jsx("strong",{children:"1000 bytes → KB:"})," ",t.jsx(i,{numberUnit:"1000",targetUnit:"k",unitType:"decimal"})]}),t.jsxs("div",{children:[t.jsx("strong",{children:"512m → GiB:"})," ",t.jsx(i,{numberUnit:"512m",targetUnit:"g",unitType:"binary"})]})]})})]}),parameters:{docs:{description:{story:"Comparison showing the difference between binary (1024-based: KiB, MiB, GiB) and decimal (1000-based: KB, MB, GB) conversions."}}}},a={render:()=>t.jsx(e,{direction:"column",gap:"md",children:t.jsx(n,{size:"small",title:"Automatic unit display when target rounds to 0",styles:{body:{paddingTop:0}},children:t.jsxs(e,{direction:"column",gap:"sm",children:[t.jsxs("div",{children:[t.jsx("strong",{children:"100 bytes → GiB (shows auto):"})," ",t.jsx(i,{numberUnit:"100",targetUnit:"g",unitType:"binary"})]}),t.jsxs("div",{children:[t.jsx("strong",{children:"512k → TiB (shows auto):"})," ",t.jsx(i,{numberUnit:"512k",targetUnit:"t",unitType:"binary"})]}),t.jsxs("div",{children:[t.jsx("strong",{children:"10m → TB (shows auto):"})," ",t.jsx(i,{numberUnit:"10m",targetUnit:"t",unitType:"decimal"})]})]})})}),parameters:{docs:{description:{story:"When the converted value rounds to 0 in the target unit, the component automatically displays the value in a more appropriate unit in parentheses."}}}},o={render:()=>t.jsx(e,{direction:"column",gap:"md",children:t.jsx(n,{size:"small",title:"Using postfix",styles:{body:{paddingTop:0}},children:t.jsxs(e,{direction:"column",gap:"sm",children:[t.jsxs("div",{children:[t.jsx("strong",{children:"Memory usage:"})," ",t.jsx(i,{numberUnit:"6144m",targetUnit:"g",unitType:"binary",postfix:" / 8.00"})]}),t.jsxs("div",{children:[t.jsx("strong",{children:"Storage used:"})," ",t.jsx(i,{numberUnit:"1500g",targetUnit:"t",unitType:"decimal",postfix:" used"})]}),t.jsxs("div",{children:[t.jsx("strong",{children:"Quota remaining:"})," ",t.jsx(i,{numberUnit:"512m",targetUnit:"g",unitType:"binary",postfix:" remaining"})]})]})})}),parameters:{docs:{description:{story:"The `postfix` prop adds custom text after the converted number, useful for displaying usage ratios or status."}}}};var d,m,p;r.parameters={...r.parameters,docs:{...(d=r.parameters)==null?void 0:d.docs,source:{originalSource:`{
  name: 'Basic',
  args: {
    numberUnit: '1024m',
    targetUnit: 'g',
    unitType: 'binary'
  }
}`,...(p=(m=r.parameters)==null?void 0:m.docs)==null?void 0:p.source}}};var l,c,u;s.parameters={...s.parameters,docs:{...(l=s.parameters)==null?void 0:l.docs,source:{originalSource:`{
  render: () => <BAIFlex direction="column" gap="md">
      <BAICard size="small" title="1024 units: Binary vs Decimal" styles={{
      body: {
        paddingTop: 0
      }
    }}>
        <BAIFlex direction="column" gap="sm">
          <div>
            <strong>1024m (Binary → GiB):</strong>{' '}
            <BAINumberWithUnit numberUnit="1024m" targetUnit="g" unitType="binary" />
          </div>
          <div>
            <strong>1024m (Decimal → GB):</strong>{' '}
            <BAINumberWithUnit numberUnit="1024m" targetUnit="g" unitType="decimal" />
          </div>
        </BAIFlex>
      </BAICard>
      <BAICard size="small" title="2048 units: Binary vs Decimal" styles={{
      body: {
        paddingTop: 0
      }
    }}>
        <BAIFlex direction="column" gap="sm">
          <div>
            <strong>2048g (Binary → TiB):</strong>{' '}
            <BAINumberWithUnit numberUnit="2048g" targetUnit="t" unitType="binary" />
          </div>
          <div>
            <strong>2048g (Decimal → TB):</strong>{' '}
            <BAINumberWithUnit numberUnit="2048g" targetUnit="t" unitType="decimal" />
          </div>
        </BAIFlex>
      </BAICard>
      <BAICard size="small" title="Various conversions" styles={{
      body: {
        paddingTop: 0
      }
    }}>
        <BAIFlex direction="column" gap="sm">
          <div>
            <strong>1024 bytes → KiB:</strong>{' '}
            <BAINumberWithUnit numberUnit="1024" targetUnit="k" unitType="binary" />
          </div>
          <div>
            <strong>1000 bytes → KB:</strong>{' '}
            <BAINumberWithUnit numberUnit="1000" targetUnit="k" unitType="decimal" />
          </div>
          <div>
            <strong>512m → GiB:</strong>{' '}
            <BAINumberWithUnit numberUnit="512m" targetUnit="g" unitType="binary" />
          </div>
        </BAIFlex>
      </BAICard>
    </BAIFlex>,
  parameters: {
    docs: {
      description: {
        story: 'Comparison showing the difference between binary (1024-based: KiB, MiB, GiB) and decimal (1000-based: KB, MB, GB) conversions.'
      }
    }
  }
}`,...(u=(c=s.parameters)==null?void 0:c.docs)==null?void 0:u.source}}};var g,y,B;a.parameters={...a.parameters,docs:{...(g=a.parameters)==null?void 0:g.docs,source:{originalSource:`{
  render: () => <BAIFlex direction="column" gap="md">
      <BAICard size="small" title="Automatic unit display when target rounds to 0" styles={{
      body: {
        paddingTop: 0
      }
    }}>
        <BAIFlex direction="column" gap="sm">
          <div>
            <strong>100 bytes → GiB (shows auto):</strong>{' '}
            <BAINumberWithUnit numberUnit="100" targetUnit="g" unitType="binary" />
          </div>
          <div>
            <strong>512k → TiB (shows auto):</strong>{' '}
            <BAINumberWithUnit numberUnit="512k" targetUnit="t" unitType="binary" />
          </div>
          <div>
            <strong>10m → TB (shows auto):</strong>{' '}
            <BAINumberWithUnit numberUnit="10m" targetUnit="t" unitType="decimal" />
          </div>
        </BAIFlex>
      </BAICard>
    </BAIFlex>,
  parameters: {
    docs: {
      description: {
        story: 'When the converted value rounds to 0 in the target unit, the component automatically displays the value in a more appropriate unit in parentheses.'
      }
    }
  }
}`,...(B=(y=a.parameters)==null?void 0:y.docs)==null?void 0:B.source}}};var b,x,h;o.parameters={...o.parameters,docs:{...(b=o.parameters)==null?void 0:b.docs,source:{originalSource:`{
  render: () => <BAIFlex direction="column" gap="md">
      <BAICard size="small" title="Using postfix" styles={{
      body: {
        paddingTop: 0
      }
    }}>
        <BAIFlex direction="column" gap="sm">
          <div>
            <strong>Memory usage:</strong>{' '}
            <BAINumberWithUnit numberUnit="6144m" targetUnit="g" unitType="binary" postfix=" / 8.00" />
          </div>
          <div>
            <strong>Storage used:</strong>{' '}
            <BAINumberWithUnit numberUnit="1500g" targetUnit="t" unitType="decimal" postfix=" used" />
          </div>
          <div>
            <strong>Quota remaining:</strong>{' '}
            <BAINumberWithUnit numberUnit="512m" targetUnit="g" unitType="binary" postfix=" remaining" />
          </div>
        </BAIFlex>
      </BAICard>
    </BAIFlex>,
  parameters: {
    docs: {
      description: {
        story: 'The \`postfix\` prop adds custom text after the converted number, useful for displaying usage ratios or status.'
      }
    }
  }
}`,...(h=(x=o.parameters)==null?void 0:x.docs)==null?void 0:h.source}}};const R=["Default","BinaryVsDecimal","AutoUnitFallback","WithPostfix"];export{a as AutoUnitFallback,s as BinaryVsDecimal,r as Default,o as WithPostfix,R as __namedExportsOrder,_ as default};
