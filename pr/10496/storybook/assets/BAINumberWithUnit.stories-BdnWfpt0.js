import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-MKhVqBIO.js";import{n,t as r}from"./BAICard-CF2MFruk.js";import{n as i,t as a}from"./BAIFlex-DnaoYTJ1.js";import{n as o,t as s}from"./BAINumberWithUnit-4eMtSS85.js";var c,l,u,d,f,p,m,h,g,_,v,y,b,x,S;function C(){return(C=e((()=>{n(),i(),o(),c=t(),_={title:`Statistic/BAINumberWithUnit`,component:s,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:`
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
        `}}},argTypes:{numberUnit:{control:{type:`text`},description:`Input value with unit (e.g., "1024m", "2g")`,table:{type:{summary:`string`}}},targetUnit:{control:{type:`select`},options:[``,`k`,`m`,`g`,`t`,`p`,`e`],description:`Target unit for conversion`,table:{type:{summary:`SizeUnit`}}},unitType:{control:{type:`radio`},options:[`binary`,`decimal`],description:`Binary (1024) or Decimal (1000) conversion`,table:{type:{summary:`'binary' | 'decimal'`}}},postfix:{control:{type:`text`},description:`Optional postfix to append after number`,table:{type:{summary:`string`}}}}},v={name:`Basic`,args:{numberUnit:`1024m`,targetUnit:`g`,unitType:`binary`}},y={render:()=>(0,c.jsxs)(a,{direction:`column`,gap:`md`,children:[(0,c.jsx)(r,{size:`small`,title:`1024 units: Binary vs Decimal`,styles:{body:{paddingTop:0}},children:(0,c.jsxs)(a,{direction:`column`,gap:`sm`,children:[(0,c.jsxs)(`div`,{children:[(0,c.jsx)(`strong`,{children:`1024m (Binary → GiB):`}),` `,(0,c.jsx)(s,{numberUnit:`1024m`,targetUnit:`g`,unitType:`binary`})]}),(0,c.jsxs)(`div`,{children:[(0,c.jsx)(`strong`,{children:`1024m (Decimal → GB):`}),` `,(0,c.jsx)(s,{numberUnit:`1024m`,targetUnit:`g`,unitType:`decimal`})]})]})}),(0,c.jsx)(r,{size:`small`,title:`2048 units: Binary vs Decimal`,styles:{body:{paddingTop:0}},children:(0,c.jsxs)(a,{direction:`column`,gap:`sm`,children:[(0,c.jsxs)(`div`,{children:[(0,c.jsx)(`strong`,{children:`2048g (Binary → TiB):`}),` `,(0,c.jsx)(s,{numberUnit:`2048g`,targetUnit:`t`,unitType:`binary`})]}),(0,c.jsxs)(`div`,{children:[(0,c.jsx)(`strong`,{children:`2048g (Decimal → TB):`}),` `,(0,c.jsx)(s,{numberUnit:`2048g`,targetUnit:`t`,unitType:`decimal`})]})]})}),(0,c.jsx)(r,{size:`small`,title:`Various conversions`,styles:{body:{paddingTop:0}},children:(0,c.jsxs)(a,{direction:`column`,gap:`sm`,children:[(0,c.jsxs)(`div`,{children:[(0,c.jsx)(`strong`,{children:`1024 bytes → KiB:`}),` `,(0,c.jsx)(s,{numberUnit:`1024`,targetUnit:`k`,unitType:`binary`})]}),(0,c.jsxs)(`div`,{children:[(0,c.jsx)(`strong`,{children:`1000 bytes → KB:`}),` `,(0,c.jsx)(s,{numberUnit:`1000`,targetUnit:`k`,unitType:`decimal`})]}),(0,c.jsxs)(`div`,{children:[(0,c.jsx)(`strong`,{children:`512m → GiB:`}),` `,(0,c.jsx)(s,{numberUnit:`512m`,targetUnit:`g`,unitType:`binary`})]})]})})]}),parameters:{docs:{description:{story:`Comparison showing the difference between binary (1024-based: KiB, MiB, GiB) and decimal (1000-based: KB, MB, GB) conversions.`}}}},b={render:()=>(0,c.jsx)(a,{direction:`column`,gap:`md`,children:(0,c.jsx)(r,{size:`small`,title:`Automatic unit display when target rounds to 0`,styles:{body:{paddingTop:0}},children:(0,c.jsxs)(a,{direction:`column`,gap:`sm`,children:[(0,c.jsxs)(`div`,{children:[(0,c.jsx)(`strong`,{children:`100 bytes → GiB (shows auto):`}),` `,(0,c.jsx)(s,{numberUnit:`100`,targetUnit:`g`,unitType:`binary`})]}),(0,c.jsxs)(`div`,{children:[(0,c.jsx)(`strong`,{children:`512k → TiB (shows auto):`}),` `,(0,c.jsx)(s,{numberUnit:`512k`,targetUnit:`t`,unitType:`binary`})]}),(0,c.jsxs)(`div`,{children:[(0,c.jsx)(`strong`,{children:`10m → TB (shows auto):`}),` `,(0,c.jsx)(s,{numberUnit:`10m`,targetUnit:`t`,unitType:`decimal`})]})]})})}),parameters:{docs:{description:{story:`When the converted value rounds to 0 in the target unit, the component automatically displays the value in a more appropriate unit in parentheses.`}}}},x={render:()=>(0,c.jsx)(a,{direction:`column`,gap:`md`,children:(0,c.jsx)(r,{size:`small`,title:`Using postfix`,styles:{body:{paddingTop:0}},children:(0,c.jsxs)(a,{direction:`column`,gap:`sm`,children:[(0,c.jsxs)(`div`,{children:[(0,c.jsx)(`strong`,{children:`Memory usage:`}),` `,(0,c.jsx)(s,{numberUnit:`6144m`,targetUnit:`g`,unitType:`binary`,postfix:` / 8.00`})]}),(0,c.jsxs)(`div`,{children:[(0,c.jsx)(`strong`,{children:`Storage used:`}),` `,(0,c.jsx)(s,{numberUnit:`1500g`,targetUnit:`t`,unitType:`decimal`,postfix:` used`})]}),(0,c.jsxs)(`div`,{children:[(0,c.jsx)(`strong`,{children:`Quota remaining:`}),` `,(0,c.jsx)(s,{numberUnit:`512m`,targetUnit:`g`,unitType:`binary`,postfix:` remaining`})]})]})})}),parameters:{docs:{description:{story:"The `postfix` prop adds custom text after the converted number, useful for displaying usage ratios or status."}}}},v.parameters={...v.parameters,docs:{...(l=v.parameters)==null?void 0:l.docs,source:{originalSource:`{
  name: 'Basic',
  args: {
    numberUnit: '1024m',
    targetUnit: 'g',
    unitType: 'binary'
  }
}`,...(u=v.parameters)==null||(u=u.docs)==null?void 0:u.source}}},y.parameters={...y.parameters,docs:{...(d=y.parameters)==null?void 0:d.docs,source:{originalSource:`{
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
}`,...(f=y.parameters)==null||(f=f.docs)==null?void 0:f.source}}},b.parameters={...b.parameters,docs:{...(p=b.parameters)==null?void 0:p.docs,source:{originalSource:`{
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
}`,...(m=b.parameters)==null||(m=m.docs)==null?void 0:m.source}}},x.parameters={...x.parameters,docs:{...(h=x.parameters)==null?void 0:h.docs,source:{originalSource:`{
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
}`,...(g=x.parameters)==null||(g=g.docs)==null?void 0:g.source}}},S=[`Default`,`BinaryVsDecimal`,`AutoUnitFallback`,`WithPostfix`]})))()}C();export{b as AutoUnitFallback,y as BinaryVsDecimal,v as Default,x as WithPostfix,S as __namedExportsOrder,_ as default};