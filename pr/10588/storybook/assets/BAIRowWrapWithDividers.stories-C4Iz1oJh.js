import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-MKhVqBIO.js";import{n,t as r}from"./BAICard-OieHtdzl.js";import{h as i,m as a}from"./iframe-DHcqzLLD.js";import{n as o,t as s}from"./BAIFlex-BOFoS5KY.js";import{n as c,t as l}from"./BAIButton-BkLrwIfz.js";import{n as u,t as d}from"./Token-GN1sUHwR.js";import{n as f,t as p}from"./BAIRowWrapWithDividers-DTuN24Wz.js";var m,h,g,_,v,y,b,x,S,C,w,T,E;function D(){return(D=e((()=>{c(),n(),o(),f(),i(),u(),m=t(),h={title:`Row/BAIRowWrapWithDividers`,component:p,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:"\n**BAIRowWrapWithDividers** is a custom layout component that creates a flexible row with automatic vertical dividers.\n\n## Features\n- Wraps items like flexbox while maintaining vertical dividers only between items on the same row\n- Automatically recalculates divider positions on resize and layout changes\n- Customizable gaps between rows and columns\n- Customizable divider styling (width, color, inset)\n- No layout impact from dividers (overlay positioning)\n\n## Props\n| Name | Type | Default | Description |\n|------|------|---------|-------------|\n| `children` | `ReactNode` | - | Items to display with dividers |\n| `wrap` | `boolean` | `true` | Whether to wrap items to new rows |\n| `rowGap` | `number \\| string` | `token.marginXL` | Gap between rows |\n| `columnGap` | `number \\| string` | `token.marginXXL` | Gap between columns |\n| `dividerWidth` | `number` | `1` | Width of vertical dividers in pixels |\n| `dividerColor` | `string` | `token.colorBorderSecondary` | Color of vertical dividers |\n| `dividerInset` | `number` | `0` | Top/bottom inset of vertical dividers (shortens divider line) |\n| `itemStyle` | `CSSProperties` | - | CSS styles applied to each item wrapper |\n| `style` | `CSSProperties` | - | CSS styles applied to the container |\n| `className` | `string` | - | CSS class name for the container |\n        "}}},argTypes:{children:{control:!1,description:`Items to display with dividers between them`,table:{type:{summary:`ReactNode`}}},wrap:{control:{type:`boolean`},description:`Whether to wrap items to new rows`,table:{type:{summary:`boolean`},defaultValue:{summary:`true`}}},rowGap:{control:{type:`number`},description:`Gap between rows (uses token.marginXL by default)`,table:{type:{summary:`number | string`},defaultValue:{summary:`token.marginXL`}}},columnGap:{control:{type:`number`},description:`Gap between columns (uses token.marginXXL by default)`,table:{type:{summary:`number | string`},defaultValue:{summary:`token.marginXXL`}}},dividerWidth:{control:{type:`number`},description:`Width of the vertical dividers in pixels`,table:{type:{summary:`number`},defaultValue:{summary:`1`}}},dividerColor:{control:{type:`color`},description:`Color of the vertical dividers`,table:{type:{summary:`string`},defaultValue:{summary:`token.colorBorderSecondary`}}},dividerInset:{control:{type:`number`},description:`Top/bottom inset of vertical dividers in pixels (shortens the divider line without affecting container padding)`,table:{type:{summary:`number`},defaultValue:{summary:`0`}}},itemStyle:{control:!1,description:`CSS styles applied to each item wrapper`,table:{type:{summary:`CSSProperties`}}},style:{control:!1,description:`CSS styles applied to the container`,table:{type:{summary:`CSSProperties`}}},className:{control:{type:`text`},description:`CSS class name for the container`,table:{type:{summary:`string`}}}}},g=({children:e,color:t=`#f0f0f0`})=>(0,m.jsx)(`div`,{style:{padding:`12px 16px`,backgroundColor:t,borderRadius:4,minWidth:`120px`,textAlign:`center`},children:e}),_={name:`Basic`,args:{children:[(0,m.jsx)(g,{children:`Item 1`},`1`),(0,m.jsx)(g,{children:`Item 2`},`2`),(0,m.jsx)(g,{children:`Item 3`},`3`),(0,m.jsx)(g,{children:`Item 4`},`4`)],columnGap:16,rowGap:12},parameters:{docs:{description:{story:`Basic usage with default dividers between items on the same row.`}}}},v={name:`ManyItems`,render:()=>(0,m.jsx)(p,{columnGap:20,rowGap:16,children:Array.from({length:12},(e,t)=>(0,m.jsxs)(g,{color:`hsl(${t*30}, 70%, 90%)`,children:[`Item `,t+1]},t))}),parameters:{docs:{description:{story:`Multiple items that wrap to different rows with automatic divider placement.`}}}},y={name:`TokensLayout`,render:()=>(0,m.jsxs)(p,{columnGap:16,rowGap:8,children:[(0,m.jsx)(d,{color:`blue`,label:`React`}),(0,m.jsx)(d,{color:`green`,label:`TypeScript`}),(0,m.jsx)(d,{color:`orange`,label:`Storybook`}),(0,m.jsx)(d,{color:`red`,label:`UI Library`}),(0,m.jsx)(d,{color:`purple`,label:`Frontend`}),(0,m.jsx)(d,{color:`cyan`,label:`UI Components`}),(0,m.jsx)(d,{color:`blue`,label:`Responsive`}),(0,m.jsx)(d,{color:`pink`,label:`Layout`})]}),parameters:{docs:{description:{story:`Using with Astryx Tokens for a clean separated layout.`}}}},b={name:`CustomDivider`,args:{children:[(0,m.jsx)(g,{color:`#e6f7ff`,children:`Alpha`},`1`),(0,m.jsx)(g,{color:`#f6ffed`,children:`Beta`},`2`),(0,m.jsx)(g,{color:`#fff2e8`,children:`Gamma`},`3`),(0,m.jsx)(g,{color:`#fef0f0`,children:`Delta`},`4`)],columnGap:24,rowGap:16,dividerWidth:2,dividerColor:`#1890ff`},parameters:{docs:{description:{story:`Custom divider styling with increased width and blue color.`}}}},x={name:`DividerInset`,args:{children:[(0,m.jsxs)(r,{size:`small`,style:{width:150},styles:{body:{paddingTop:0}},children:[(0,m.jsx)(a,{strong:!0,children:`Card 1`}),(0,m.jsx)(`br`,{}),(0,m.jsx)(a,{type:`secondary`,children:`Content here`})]},`1`),(0,m.jsxs)(r,{size:`small`,style:{width:150},styles:{body:{paddingTop:0}},children:[(0,m.jsx)(a,{strong:!0,children:`Card 2`}),(0,m.jsx)(`br`,{}),(0,m.jsx)(a,{type:`secondary`,children:`More content`})]},`2`),(0,m.jsxs)(r,{size:`small`,style:{width:150},styles:{body:{paddingTop:0}},children:[(0,m.jsx)(a,{strong:!0,children:`Card 3`}),(0,m.jsx)(`br`,{}),(0,m.jsx)(a,{type:`secondary`,children:`Even more`})]},`3`)],columnGap:16,rowGap:12,dividerInset:8,dividerWidth:1},parameters:{docs:{description:{story:`Dividers with inset (shorter height) to avoid touching the top and bottom edges.`}}}},S={name:`ButtonGroup`,render:()=>(0,m.jsxs)(p,{columnGap:12,rowGap:8,children:[(0,m.jsx)(l,{children:`Save`}),(0,m.jsx)(l,{children:`Cancel`}),(0,m.jsx)(l,{type:`primary`,children:`Submit`}),(0,m.jsx)(l,{danger:!0,children:`Delete`}),(0,m.jsx)(l,{type:`dashed`,children:`Draft`}),(0,m.jsx)(l,{type:`link`,children:`View Details`})]}),parameters:{docs:{description:{story:`Button group with automatic dividers between buttons on the same row.`}}}},C={name:`NoWrap`,args:{children:[(0,m.jsx)(g,{children:`Fixed`},`1`),(0,m.jsx)(g,{children:`Single`},`2`),(0,m.jsx)(g,{children:`Row`},`3`),(0,m.jsx)(g,{children:`Layout`},`4`)],columnGap:16,wrap:!1},parameters:{docs:{description:{story:`Disabled wrapping keeps all items on a single row with dividers between all items.`}}}},w={name:`LargeGaps`,args:{children:[(0,m.jsx)(g,{color:`#fff1f0`,children:`Spaced`},`1`),(0,m.jsx)(g,{color:`#f0f9ff`,children:`Out`},`2`),(0,m.jsx)(g,{color:`#f0fff0`,children:`Items`},`3`),(0,m.jsx)(g,{color:`#fffbf0`,children:`Here`},`4`)],columnGap:40,rowGap:24,dividerWidth:1},parameters:{docs:{description:{story:`Large gaps between items with proportionally positioned dividers.`}}}},T={name:`MixedContent`,render:()=>(0,m.jsxs)(p,{columnGap:20,rowGap:16,children:[(0,m.jsx)(d,{color:`blue`,label:`Status: Active`}),(0,m.jsx)(l,{size:`small`,type:`primary`,children:`Edit`}),(0,m.jsxs)(s,{gap:`xs`,children:[(0,m.jsx)(a,{strong:!0,children:`Score:`}),(0,m.jsx)(a,{children:`95/100`})]}),(0,m.jsx)(l,{size:`small`,children:`View Details`}),(0,m.jsx)(d,{color:`green`,label:`Verified`}),(0,m.jsx)(a,{type:`secondary`,children:`Last updated: 2 hours ago`})]}),parameters:{docs:{description:{story:`Mixed content types with different sizes, demonstrating flexible layout capabilities.`}}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
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
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
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
}`,...T.parameters?.docs?.source}}},E=[`Default`,`ManyItems`,`WithTokens`,`CustomDivider`,`WithInset`,`ButtonGroup`,`NoWrap`,`LargeGaps`,`MixedContent`]})))()}D();export{S as ButtonGroup,b as CustomDivider,_ as Default,w as LargeGaps,v as ManyItems,T as MixedContent,C as NoWrap,x as WithInset,y as WithTokens,E as __namedExportsOrder,h as default};