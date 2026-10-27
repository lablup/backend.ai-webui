import{n as e}from"./rolldown-runtime-2s6bX4vc.js";import{n as t,t as n}from"./BAIFlex-CAz1t6J5.js";import{n as r,t as i}from"./BAICard-W1ezccn9.js";import{n as a,t as o}from"./BAINumberWithUnit-BkdXRkV9.js";import{jsx as s,jsxs as c}from"react/jsx-runtime";var l,u,d,f,p,m;function h(){return(h=e((()=>{r(),t(),a(),l={title:`Statistic/BAINumberWithUnit`,component:o,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:`
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
        `}}},argTypes:{numberUnit:{control:{type:`text`},description:`Input value with unit (e.g., "1024m", "2g")`,table:{type:{summary:`string`}}},targetUnit:{control:{type:`select`},options:[``,`k`,`m`,`g`,`t`,`p`,`e`],description:`Target unit for conversion`,table:{type:{summary:`SizeUnit`}}},unitType:{control:{type:`radio`},options:[`binary`,`decimal`],description:`Binary (1024) or Decimal (1000) conversion`,table:{type:{summary:`'binary' | 'decimal'`}}},postfix:{control:{type:`text`},description:`Optional postfix to append after number`,table:{type:{summary:`string`}}}}},u={name:`Basic`,args:{numberUnit:`1024m`,targetUnit:`g`,unitType:`binary`}},d={render:()=>c(n,{direction:`column`,gap:`md`,children:[s(i,{size:`small`,title:`1024 units: Binary vs Decimal`,styles:{body:{paddingTop:0}},children:c(n,{direction:`column`,gap:`sm`,children:[c(`div`,{children:[s(`strong`,{children:`1024m (Binary → GiB):`}),` `,s(o,{numberUnit:`1024m`,targetUnit:`g`,unitType:`binary`})]}),c(`div`,{children:[s(`strong`,{children:`1024m (Decimal → GB):`}),` `,s(o,{numberUnit:`1024m`,targetUnit:`g`,unitType:`decimal`})]})]})}),s(i,{size:`small`,title:`2048 units: Binary vs Decimal`,styles:{body:{paddingTop:0}},children:c(n,{direction:`column`,gap:`sm`,children:[c(`div`,{children:[s(`strong`,{children:`2048g (Binary → TiB):`}),` `,s(o,{numberUnit:`2048g`,targetUnit:`t`,unitType:`binary`})]}),c(`div`,{children:[s(`strong`,{children:`2048g (Decimal → TB):`}),` `,s(o,{numberUnit:`2048g`,targetUnit:`t`,unitType:`decimal`})]})]})}),s(i,{size:`small`,title:`Various conversions`,styles:{body:{paddingTop:0}},children:c(n,{direction:`column`,gap:`sm`,children:[c(`div`,{children:[s(`strong`,{children:`1024 bytes → KiB:`}),` `,s(o,{numberUnit:`1024`,targetUnit:`k`,unitType:`binary`})]}),c(`div`,{children:[s(`strong`,{children:`1000 bytes → KB:`}),` `,s(o,{numberUnit:`1000`,targetUnit:`k`,unitType:`decimal`})]}),c(`div`,{children:[s(`strong`,{children:`512m → GiB:`}),` `,s(o,{numberUnit:`512m`,targetUnit:`g`,unitType:`binary`})]})]})})]}),parameters:{docs:{description:{story:`Comparison showing the difference between binary (1024-based: KiB, MiB, GiB) and decimal (1000-based: KB, MB, GB) conversions.`}}}},f={render:()=>s(n,{direction:`column`,gap:`md`,children:s(i,{size:`small`,title:`Automatic unit display when target rounds to 0`,styles:{body:{paddingTop:0}},children:c(n,{direction:`column`,gap:`sm`,children:[c(`div`,{children:[s(`strong`,{children:`100 bytes → GiB (shows auto):`}),` `,s(o,{numberUnit:`100`,targetUnit:`g`,unitType:`binary`})]}),c(`div`,{children:[s(`strong`,{children:`512k → TiB (shows auto):`}),` `,s(o,{numberUnit:`512k`,targetUnit:`t`,unitType:`binary`})]}),c(`div`,{children:[s(`strong`,{children:`10m → TB (shows auto):`}),` `,s(o,{numberUnit:`10m`,targetUnit:`t`,unitType:`decimal`})]})]})})}),parameters:{docs:{description:{story:`When the converted value rounds to 0 in the target unit, the component automatically displays the value in a more appropriate unit in parentheses.`}}}},p={render:()=>s(n,{direction:`column`,gap:`md`,children:s(i,{size:`small`,title:`Using postfix`,styles:{body:{paddingTop:0}},children:c(n,{direction:`column`,gap:`sm`,children:[c(`div`,{children:[s(`strong`,{children:`Memory usage:`}),` `,s(o,{numberUnit:`6144m`,targetUnit:`g`,unitType:`binary`,postfix:` / 8.00`})]}),c(`div`,{children:[s(`strong`,{children:`Storage used:`}),` `,s(o,{numberUnit:`1500g`,targetUnit:`t`,unitType:`decimal`,postfix:` used`})]}),c(`div`,{children:[s(`strong`,{children:`Quota remaining:`}),` `,s(o,{numberUnit:`512m`,targetUnit:`g`,unitType:`binary`,postfix:` remaining`})]})]})})}),parameters:{docs:{description:{story:"The `postfix` prop adds custom text after the converted number, useful for displaying usage ratios or status."}}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  name: 'Basic',
  args: {
    numberUnit: '1024m',
    targetUnit: 'g',
    unitType: 'binary'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
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
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
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
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
}`,...p.parameters?.docs?.source}}},m=[`Default`,`BinaryVsDecimal`,`AutoUnitFallback`,`WithPostfix`]})))()}h();export{f as AutoUnitFallback,d as BinaryVsDecimal,u as Default,p as WithPostfix,m as __namedExportsOrder,l as default};