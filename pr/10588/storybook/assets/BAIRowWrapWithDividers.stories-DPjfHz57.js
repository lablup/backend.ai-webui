import{n as e}from"./rolldown-runtime-2s6bX4vc.js";import{c as t,s as n}from"./iframe-DR2sIF5r.js";import{n as r,t as i}from"./BAIFlex-CAz1t6J5.js";import{n as a,t as o}from"./BAIButton-C-o5ANgR.js";import{n as s,t as c}from"./BAICard-W1ezccn9.js";import{n as l,t as u}from"./BAIRowWrapWithDividers-BG9SuCFQ.js";import{jsx as d,jsxs as f}from"react/jsx-runtime";import{Token as p}from"@lablup/ui-common/Token";var m,h,g,_,v,y,b,x,S,C,w,T;function E(){return(E=e((()=>{a(),s(),r(),l(),t(),m={title:`Row/BAIRowWrapWithDividers`,component:u,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:"\n**BAIRowWrapWithDividers** is a custom layout component that creates a flexible row with automatic vertical dividers.\n\n## Features\n- Wraps items like flexbox while maintaining vertical dividers only between items on the same row\n- Automatically recalculates divider positions on resize and layout changes\n- Customizable gaps between rows and columns\n- Customizable divider styling (width, color, inset)\n- No layout impact from dividers (overlay positioning)\n\n## Props\n| Name | Type | Default | Description |\n|------|------|---------|-------------|\n| `children` | `ReactNode` | - | Items to display with dividers |\n| `wrap` | `boolean` | `true` | Whether to wrap items to new rows |\n| `rowGap` | `number \\| string` | `token.marginXL` | Gap between rows |\n| `columnGap` | `number \\| string` | `token.marginXXL` | Gap between columns |\n| `dividerWidth` | `number` | `1` | Width of vertical dividers in pixels |\n| `dividerColor` | `string` | `token.colorBorderSecondary` | Color of vertical dividers |\n| `dividerInset` | `number` | `0` | Top/bottom inset of vertical dividers (shortens divider line) |\n| `itemStyle` | `CSSProperties` | - | CSS styles applied to each item wrapper |\n| `style` | `CSSProperties` | - | CSS styles applied to the container |\n| `className` | `string` | - | CSS class name for the container |\n        "}}},argTypes:{children:{control:!1,description:`Items to display with dividers between them`,table:{type:{summary:`ReactNode`}}},wrap:{control:{type:`boolean`},description:`Whether to wrap items to new rows`,table:{type:{summary:`boolean`},defaultValue:{summary:`true`}}},rowGap:{control:{type:`number`},description:`Gap between rows (uses token.marginXL by default)`,table:{type:{summary:`number | string`},defaultValue:{summary:`token.marginXL`}}},columnGap:{control:{type:`number`},description:`Gap between columns (uses token.marginXXL by default)`,table:{type:{summary:`number | string`},defaultValue:{summary:`token.marginXXL`}}},dividerWidth:{control:{type:`number`},description:`Width of the vertical dividers in pixels`,table:{type:{summary:`number`},defaultValue:{summary:`1`}}},dividerColor:{control:{type:`color`},description:`Color of the vertical dividers`,table:{type:{summary:`string`},defaultValue:{summary:`token.colorBorderSecondary`}}},dividerInset:{control:{type:`number`},description:`Top/bottom inset of vertical dividers in pixels (shortens the divider line without affecting container padding)`,table:{type:{summary:`number`},defaultValue:{summary:`0`}}},itemStyle:{control:!1,description:`CSS styles applied to each item wrapper`,table:{type:{summary:`CSSProperties`}}},style:{control:!1,description:`CSS styles applied to the container`,table:{type:{summary:`CSSProperties`}}},className:{control:{type:`text`},description:`CSS class name for the container`,table:{type:{summary:`string`}}}}},h=({children:e,color:t=`#f0f0f0`})=>d(`div`,{style:{padding:`12px 16px`,backgroundColor:t,borderRadius:4,minWidth:`120px`,textAlign:`center`},children:e}),g={name:`Basic`,args:{children:[d(h,{children:`Item 1`},`1`),d(h,{children:`Item 2`},`2`),d(h,{children:`Item 3`},`3`),d(h,{children:`Item 4`},`4`)],columnGap:16,rowGap:12},parameters:{docs:{description:{story:`Basic usage with default dividers between items on the same row.`}}}},_={name:`ManyItems`,render:()=>d(u,{columnGap:20,rowGap:16,children:Array.from({length:12},(e,t)=>f(h,{color:`hsl(${t*30}, 70%, 90%)`,children:[`Item `,t+1]},t))}),parameters:{docs:{description:{story:`Multiple items that wrap to different rows with automatic divider placement.`}}}},v={name:`TokensLayout`,render:()=>f(u,{columnGap:16,rowGap:8,children:[d(p,{color:`blue`,label:`React`}),d(p,{color:`green`,label:`TypeScript`}),d(p,{color:`orange`,label:`Storybook`}),d(p,{color:`red`,label:`UI Library`}),d(p,{color:`purple`,label:`Frontend`}),d(p,{color:`cyan`,label:`UI Components`}),d(p,{color:`blue`,label:`Responsive`}),d(p,{color:`pink`,label:`Layout`})]}),parameters:{docs:{description:{story:`Using with Astryx Tokens for a clean separated layout.`}}}},y={name:`CustomDivider`,args:{children:[d(h,{color:`#e6f7ff`,children:`Alpha`},`1`),d(h,{color:`#f6ffed`,children:`Beta`},`2`),d(h,{color:`#fff2e8`,children:`Gamma`},`3`),d(h,{color:`#fef0f0`,children:`Delta`},`4`)],columnGap:24,rowGap:16,dividerWidth:2,dividerColor:`#1890ff`},parameters:{docs:{description:{story:`Custom divider styling with increased width and blue color.`}}}},b={name:`DividerInset`,args:{children:[f(c,{size:`small`,style:{width:150},styles:{body:{paddingTop:0}},children:[d(n,{strong:!0,children:`Card 1`}),d(`br`,{}),d(n,{type:`secondary`,children:`Content here`})]},`1`),f(c,{size:`small`,style:{width:150},styles:{body:{paddingTop:0}},children:[d(n,{strong:!0,children:`Card 2`}),d(`br`,{}),d(n,{type:`secondary`,children:`More content`})]},`2`),f(c,{size:`small`,style:{width:150},styles:{body:{paddingTop:0}},children:[d(n,{strong:!0,children:`Card 3`}),d(`br`,{}),d(n,{type:`secondary`,children:`Even more`})]},`3`)],columnGap:16,rowGap:12,dividerInset:8,dividerWidth:1},parameters:{docs:{description:{story:`Dividers with inset (shorter height) to avoid touching the top and bottom edges.`}}}},x={name:`ButtonGroup`,render:()=>f(u,{columnGap:12,rowGap:8,children:[d(o,{children:`Save`}),d(o,{children:`Cancel`}),d(o,{type:`primary`,children:`Submit`}),d(o,{danger:!0,children:`Delete`}),d(o,{type:`dashed`,children:`Draft`}),d(o,{type:`link`,children:`View Details`})]}),parameters:{docs:{description:{story:`Button group with automatic dividers between buttons on the same row.`}}}},S={name:`NoWrap`,args:{children:[d(h,{children:`Fixed`},`1`),d(h,{children:`Single`},`2`),d(h,{children:`Row`},`3`),d(h,{children:`Layout`},`4`)],columnGap:16,wrap:!1},parameters:{docs:{description:{story:`Disabled wrapping keeps all items on a single row with dividers between all items.`}}}},C={name:`LargeGaps`,args:{children:[d(h,{color:`#fff1f0`,children:`Spaced`},`1`),d(h,{color:`#f0f9ff`,children:`Out`},`2`),d(h,{color:`#f0fff0`,children:`Items`},`3`),d(h,{color:`#fffbf0`,children:`Here`},`4`)],columnGap:40,rowGap:24,dividerWidth:1},parameters:{docs:{description:{story:`Large gaps between items with proportionally positioned dividers.`}}}},w={name:`MixedContent`,render:()=>f(u,{columnGap:20,rowGap:16,children:[d(p,{color:`blue`,label:`Status: Active`}),d(o,{size:`small`,type:`primary`,children:`Edit`}),f(i,{gap:`xs`,children:[d(n,{strong:!0,children:`Score:`}),d(n,{children:`95/100`})]}),d(o,{size:`small`,children:`View Details`}),d(p,{color:`green`,label:`Verified`}),d(n,{type:`secondary`,children:`Last updated: 2 hours ago`})]}),parameters:{docs:{description:{story:`Mixed content types with different sizes, demonstrating flexible layout capabilities.`}}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  name: 'Basic',
  args: {
    children: [<SampleItem key="1">Item 1</SampleItem>, <SampleItem key="2">Item 2</SampleItem>, <SampleItem key="3">Item 3</SampleItem>, <SampleItem key="4">Item 4</SampleItem>],
    columnGap: 16,
    rowGap: 12
  },
  parameters: {
    docs: {
      description: {
        story: 'Basic usage with default dividers between items on the same row.'
      }
    }
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  name: 'ManyItems',
  render: () => <BAIRowWrapWithDividers columnGap={20} rowGap={16}>
      {Array.from({
      length: 12
    }, (_, i) => <SampleItem key={i} color={\`hsl(\${i * 30}, 70%, 90%)\`}>
          Item {i + 1}
        </SampleItem>)}
    </BAIRowWrapWithDividers>,
  parameters: {
    docs: {
      description: {
        story: 'Multiple items that wrap to different rows with automatic divider placement.'
      }
    }
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  name: 'TokensLayout',
  render: () => <BAIRowWrapWithDividers columnGap={16} rowGap={8}>
      <Token color="blue" label="React" />
      <Token color="green" label="TypeScript" />
      <Token color="orange" label="Storybook" />
      <Token color="red" label="UI Library" />
      <Token color="purple" label="Frontend" />
      <Token color="cyan" label="UI Components" />
      <Token color="blue" label="Responsive" />
      <Token color="pink" label="Layout" />
    </BAIRowWrapWithDividers>,
  parameters: {
    docs: {
      description: {
        story: 'Using with Astryx Tokens for a clean separated layout.'
      }
    }
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  name: 'CustomDivider',
  args: {
    children: [<SampleItem key="1" color="#e6f7ff">
        Alpha
      </SampleItem>, <SampleItem key="2" color="#f6ffed">
        Beta
      </SampleItem>, <SampleItem key="3" color="#fff2e8">
        Gamma
      </SampleItem>, <SampleItem key="4" color="#fef0f0">
        Delta
      </SampleItem>],
    columnGap: 24,
    rowGap: 16,
    dividerWidth: 2,
    dividerColor: '#1890ff'
  },
  parameters: {
    docs: {
      description: {
        story: 'Custom divider styling with increased width and blue color.'
      }
    }
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  name: 'DividerInset',
  args: {
    children: [<BAICard key="1" size="small" style={{
      width: 150
    }} styles={{
      body: {
        paddingTop: 0
      }
    }}>
        <BAIText strong>Card 1</BAIText>
        <br />
        <BAIText type="secondary">Content here</BAIText>
      </BAICard>, <BAICard key="2" size="small" style={{
      width: 150
    }} styles={{
      body: {
        paddingTop: 0
      }
    }}>
        <BAIText strong>Card 2</BAIText>
        <br />
        <BAIText type="secondary">More content</BAIText>
      </BAICard>, <BAICard key="3" size="small" style={{
      width: 150
    }} styles={{
      body: {
        paddingTop: 0
      }
    }}>
        <BAIText strong>Card 3</BAIText>
        <br />
        <BAIText type="secondary">Even more</BAIText>
      </BAICard>],
    columnGap: 16,
    rowGap: 12,
    dividerInset: 8,
    dividerWidth: 1
  },
  parameters: {
    docs: {
      description: {
        story: 'Dividers with inset (shorter height) to avoid touching the top and bottom edges.'
      }
    }
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  name: 'ButtonGroup',
  render: () => <BAIRowWrapWithDividers columnGap={12} rowGap={8}>
      <BAIButton>Save</BAIButton>
      <BAIButton>Cancel</BAIButton>
      <BAIButton type="primary">Submit</BAIButton>
      <BAIButton danger>Delete</BAIButton>
      <BAIButton type="dashed">Draft</BAIButton>
      <BAIButton type="link">View Details</BAIButton>
    </BAIRowWrapWithDividers>,
  parameters: {
    docs: {
      description: {
        story: 'Button group with automatic dividers between buttons on the same row.'
      }
    }
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  name: 'NoWrap',
  args: {
    children: [<SampleItem key="1">Fixed</SampleItem>, <SampleItem key="2">Single</SampleItem>, <SampleItem key="3">Row</SampleItem>, <SampleItem key="4">Layout</SampleItem>],
    columnGap: 16,
    wrap: false
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled wrapping keeps all items on a single row with dividers between all items.'
      }
    }
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  name: 'LargeGaps',
  args: {
    children: [<SampleItem key="1" color="#fff1f0">
        Spaced
      </SampleItem>, <SampleItem key="2" color="#f0f9ff">
        Out
      </SampleItem>, <SampleItem key="3" color="#f0fff0">
        Items
      </SampleItem>, <SampleItem key="4" color="#fffbf0">
        Here
      </SampleItem>],
    columnGap: 40,
    rowGap: 24,
    dividerWidth: 1
  },
  parameters: {
    docs: {
      description: {
        story: 'Large gaps between items with proportionally positioned dividers.'
      }
    }
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  name: 'MixedContent',
  render: () => <BAIRowWrapWithDividers columnGap={20} rowGap={16}>
      <Token color="blue" label="Status: Active" />
      <BAIButton size="small" type="primary">
        Edit
      </BAIButton>
      <BAIFlex gap="xs">
        <BAIText strong>Score:</BAIText>
        <BAIText>95/100</BAIText>
      </BAIFlex>
      <BAIButton size="small">View Details</BAIButton>
      <Token color="green" label="Verified" />
      <BAIText type="secondary">Last updated: 2 hours ago</BAIText>
    </BAIRowWrapWithDividers>,
  parameters: {
    docs: {
      description: {
        story: 'Mixed content types with different sizes, demonstrating flexible layout capabilities.'
      }
    }
  }
}`,...w.parameters?.docs?.source}}},T=[`Default`,`ManyItems`,`WithTokens`,`CustomDivider`,`WithInset`,`ButtonGroup`,`NoWrap`,`LargeGaps`,`MixedContent`]})))()}E();export{x as ButtonGroup,y as CustomDivider,g as Default,C as LargeGaps,_ as ManyItems,w as MixedContent,S as NoWrap,b as WithInset,v as WithTokens,T as __namedExportsOrder,m as default};