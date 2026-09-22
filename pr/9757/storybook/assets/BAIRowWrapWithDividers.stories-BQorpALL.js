import{j as e,B as o}from"./iframe-DG6aux2g.js";import{B as a}from"./BAIButton-L0M0Ji_b.js";import{B as I}from"./BAICard-ICTQZFhu.js";import{B as O}from"./BAIFlex-DwQFylzD.js";import{B as i}from"./BAIRowWrapWithDividers-BwF6Jt0q.js";import{T as t}from"./Token-CVVATuE-.js";import"./preload-helper-Dp1pzeXC.js";import"./astryxLabel-BXITQJfP.js";import"./BAITabList-R_BD5Pul.js";import"./useDevWarning-n0Xh851a.js";import"./useListFocus-Ca-rDtwY.js";import"./isRtlElement-B2-7SF8s.js";import"./rtlStyles-T4i24HtE.js";import"./VStack-CTppZwFS.js";import"./Divider-G0XTa-qi.js";import"./composeEventHandlers-BolWE7qY.js";const le={title:"Row/BAIRowWrapWithDividers",component:i,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:"\n**BAIRowWrapWithDividers** is a custom layout component that creates a flexible row with automatic vertical dividers.\n\n## Features\n- Wraps items like flexbox while maintaining vertical dividers only between items on the same row\n- Automatically recalculates divider positions on resize and layout changes\n- Customizable gaps between rows and columns\n- Customizable divider styling (width, color, inset)\n- No layout impact from dividers (overlay positioning)\n\n## Props\n| Name | Type | Default | Description |\n|------|------|---------|-------------|\n| `children` | `ReactNode` | - | Items to display with dividers |\n| `wrap` | `boolean` | `true` | Whether to wrap items to new rows |\n| `rowGap` | `number \\| string` | `token.marginXL` | Gap between rows |\n| `columnGap` | `number \\| string` | `token.marginXXL` | Gap between columns |\n| `dividerWidth` | `number` | `1` | Width of vertical dividers in pixels |\n| `dividerColor` | `string` | `token.colorBorderSecondary` | Color of vertical dividers |\n| `dividerInset` | `number` | `0` | Top/bottom inset of vertical dividers (shortens divider line) |\n| `itemStyle` | `CSSProperties` | - | CSS styles applied to each item wrapper |\n| `style` | `CSSProperties` | - | CSS styles applied to the container |\n| `className` | `string` | - | CSS class name for the container |\n        "}}},argTypes:{children:{control:!1,description:"Items to display with dividers between them",table:{type:{summary:"ReactNode"}}},wrap:{control:{type:"boolean"},description:"Whether to wrap items to new rows",table:{type:{summary:"boolean"},defaultValue:{summary:"true"}}},rowGap:{control:{type:"number"},description:"Gap between rows (uses token.marginXL by default)",table:{type:{summary:"number | string"},defaultValue:{summary:"token.marginXL"}}},columnGap:{control:{type:"number"},description:"Gap between columns (uses token.marginXXL by default)",table:{type:{summary:"number | string"},defaultValue:{summary:"token.marginXXL"}}},dividerWidth:{control:{type:"number"},description:"Width of the vertical dividers in pixels",table:{type:{summary:"number"},defaultValue:{summary:"1"}}},dividerColor:{control:{type:"color"},description:"Color of the vertical dividers",table:{type:{summary:"string"},defaultValue:{summary:"token.colorBorderSecondary"}}},dividerInset:{control:{type:"number"},description:"Top/bottom inset of vertical dividers in pixels (shortens the divider line without affecting container padding)",table:{type:{summary:"number"},defaultValue:{summary:"0"}}},itemStyle:{control:!1,description:"CSS styles applied to each item wrapper",table:{type:{summary:"CSSProperties"}}},style:{control:!1,description:"CSS styles applied to the container",table:{type:{summary:"CSSProperties"}}},className:{control:{type:"text"},description:"CSS class name for the container",table:{type:{summary:"string"}}}}},r=({children:f,color:s="#f0f0f0"})=>e.jsx("div",{style:{padding:"12px 16px",backgroundColor:s,borderRadius:4,minWidth:"120px",textAlign:"center"},children:f}),n={name:"Basic",args:{children:[e.jsx(r,{children:"Item 1"},"1"),e.jsx(r,{children:"Item 2"},"2"),e.jsx(r,{children:"Item 3"},"3"),e.jsx(r,{children:"Item 4"},"4")],columnGap:16,rowGap:12},parameters:{docs:{description:{story:"Basic usage with default dividers between items on the same row."}}}},l={name:"ManyItems",render:()=>e.jsx(i,{columnGap:20,rowGap:16,children:Array.from({length:12},(f,s)=>e.jsxs(r,{color:`hsl(${s*30}, 70%, 90%)`,children:["Item ",s+1]},s))}),parameters:{docs:{description:{story:"Multiple items that wrap to different rows with automatic divider placement."}}}},d={name:"TokensLayout",render:()=>e.jsxs(i,{columnGap:16,rowGap:8,children:[e.jsx(t,{color:"blue",label:"React"}),e.jsx(t,{color:"green",label:"TypeScript"}),e.jsx(t,{color:"orange",label:"Storybook"}),e.jsx(t,{color:"red",label:"UI Library"}),e.jsx(t,{color:"purple",label:"Frontend"}),e.jsx(t,{color:"cyan",label:"UI Components"}),e.jsx(t,{color:"blue",label:"Responsive"}),e.jsx(t,{color:"pink",label:"Layout"})]}),parameters:{docs:{description:{story:"Using with Astryx Tokens for a clean separated layout."}}}},p={name:"CustomDivider",args:{children:[e.jsx(r,{color:"#e6f7ff",children:"Alpha"},"1"),e.jsx(r,{color:"#f6ffed",children:"Beta"},"2"),e.jsx(r,{color:"#fff2e8",children:"Gamma"},"3"),e.jsx(r,{color:"#fef0f0",children:"Delta"},"4")],columnGap:24,rowGap:16,dividerWidth:2,dividerColor:"#1890ff"},parameters:{docs:{description:{story:"Custom divider styling with increased width and blue color."}}}},m={name:"DividerInset",args:{children:[e.jsxs(I,{size:"small",style:{width:150},styles:{body:{paddingTop:0}},children:[e.jsx(o,{strong:!0,children:"Card 1"}),e.jsx("br",{}),e.jsx(o,{type:"secondary",children:"Content here"})]},"1"),e.jsxs(I,{size:"small",style:{width:150},styles:{body:{paddingTop:0}},children:[e.jsx(o,{strong:!0,children:"Card 2"}),e.jsx("br",{}),e.jsx(o,{type:"secondary",children:"More content"})]},"2"),e.jsxs(I,{size:"small",style:{width:150},styles:{body:{paddingTop:0}},children:[e.jsx(o,{strong:!0,children:"Card 3"}),e.jsx("br",{}),e.jsx(o,{type:"secondary",children:"Even more"})]},"3")],columnGap:16,rowGap:12,dividerInset:8,dividerWidth:1},parameters:{docs:{description:{story:"Dividers with inset (shorter height) to avoid touching the top and bottom edges."}}}},c={name:"ButtonGroup",render:()=>e.jsxs(i,{columnGap:12,rowGap:8,children:[e.jsx(a,{children:"Save"}),e.jsx(a,{children:"Cancel"}),e.jsx(a,{type:"primary",children:"Submit"}),e.jsx(a,{danger:!0,children:"Delete"}),e.jsx(a,{type:"dashed",children:"Draft"}),e.jsx(a,{type:"link",children:"View Details"})]}),parameters:{docs:{description:{story:"Button group with automatic dividers between buttons on the same row."}}}},u={name:"NoWrap",args:{children:[e.jsx(r,{children:"Fixed"},"1"),e.jsx(r,{children:"Single"},"2"),e.jsx(r,{children:"Row"},"3"),e.jsx(r,{children:"Layout"},"4")],columnGap:16,wrap:!1},parameters:{docs:{description:{story:"Disabled wrapping keeps all items on a single row with dividers between all items."}}}},y={name:"LargeGaps",args:{children:[e.jsx(r,{color:"#fff1f0",children:"Spaced"},"1"),e.jsx(r,{color:"#f0f9ff",children:"Out"},"2"),e.jsx(r,{color:"#f0fff0",children:"Items"},"3"),e.jsx(r,{color:"#fffbf0",children:"Here"},"4")],columnGap:40,rowGap:24,dividerWidth:1},parameters:{docs:{description:{story:"Large gaps between items with proportionally positioned dividers."}}}},h={name:"MixedContent",render:()=>e.jsxs(i,{columnGap:20,rowGap:16,children:[e.jsx(t,{color:"blue",label:"Status: Active"}),e.jsx(a,{size:"small",type:"primary",children:"Edit"}),e.jsxs(O,{gap:"xs",children:[e.jsx(o,{strong:!0,children:"Score:"}),e.jsx(o,{children:"95/100"})]}),e.jsx(a,{size:"small",children:"View Details"}),e.jsx(t,{color:"green",label:"Verified"}),e.jsx(o,{type:"secondary",children:"Last updated: 2 hours ago"})]}),parameters:{docs:{description:{story:"Mixed content types with different sizes, demonstrating flexible layout capabilities."}}}};var w,b,x;n.parameters={...n.parameters,docs:{...(w=n.parameters)==null?void 0:w.docs,source:{originalSource:`{
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
}`,...(x=(b=n.parameters)==null?void 0:b.docs)==null?void 0:x.source}}};var g,B,S;l.parameters={...l.parameters,docs:{...(g=l.parameters)==null?void 0:g.docs,source:{originalSource:`{
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
}`,...(S=(B=l.parameters)==null?void 0:B.docs)==null?void 0:S.source}}};var v,A,j;d.parameters={...d.parameters,docs:{...(v=d.parameters)==null?void 0:v.docs,source:{originalSource:`{
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
}`,...(j=(A=d.parameters)==null?void 0:A.docs)==null?void 0:j.source}}};var k,G,T;p.parameters={...p.parameters,docs:{...(k=p.parameters)==null?void 0:k.docs,source:{originalSource:`{
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
}`,...(T=(G=p.parameters)==null?void 0:G.docs)==null?void 0:T.source}}};var C,W,D;m.parameters={...m.parameters,docs:{...(C=m.parameters)==null?void 0:C.docs,source:{originalSource:`{
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
}`,...(D=(W=m.parameters)==null?void 0:W.docs)==null?void 0:D.source}}};var L,R,z;c.parameters={...c.parameters,docs:{...(L=c.parameters)==null?void 0:L.docs,source:{originalSource:`{
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
}`,...(z=(R=c.parameters)==null?void 0:R.docs)==null?void 0:z.source}}};var M,V,N;u.parameters={...u.parameters,docs:{...(M=u.parameters)==null?void 0:M.docs,source:{originalSource:`{
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
}`,...(N=(V=u.parameters)==null?void 0:V.docs)==null?void 0:N.source}}};var X,F,E;y.parameters={...y.parameters,docs:{...(X=y.parameters)==null?void 0:X.docs,source:{originalSource:`{
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
}`,...(E=(F=y.parameters)==null?void 0:F.docs)==null?void 0:E.source}}};var U,P,_;h.parameters={...h.parameters,docs:{...(U=h.parameters)==null?void 0:U.docs,source:{originalSource:`{
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
}`,...(_=(P=h.parameters)==null?void 0:P.docs)==null?void 0:_.source}}};const de=["Default","ManyItems","WithTokens","CustomDivider","WithInset","ButtonGroup","NoWrap","LargeGaps","MixedContent"];export{c as ButtonGroup,p as CustomDivider,n as Default,y as LargeGaps,l as ManyItems,h as MixedContent,u as NoWrap,m as WithInset,d as WithTokens,de as __namedExportsOrder,le as default};
