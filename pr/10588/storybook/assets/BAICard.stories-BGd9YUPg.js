import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-MKhVqBIO.js";import{n,t as r}from"./BAICard-OieHtdzl.js";import{h as i,m as a}from"./iframe-DHcqzLLD.js";import{n as o,t as s}from"./BAIFlex-BOFoS5KY.js";import{n as c,t as l}from"./BAIButton-BkLrwIfz.js";var u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O;function k(){return(k=e((()=>{c(),n(),o(),i(),u=t(),d={title:`Card/BAICard`,component:r,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:"\n**BAICard** keeps an Ant Design `Card`-shaped prop surface (`title`, `extra`, `tabList`, `status`, ...) for call-site compatibility, but renders through Astryx's `Card` primitive internally. It provides additional features including:\n\n- **Status-based styling**: Visual indicators for success, error, warning, and default states\n- **Integrated action buttons**: Extra buttons with automatic icons based on status\n- **Enhanced header layout**: Flexible title and extra content arrangement\n- **Tab integration**: Built-in support for tabbed content\n- **Consistent design**: Follows Backend.AI design system guidelines\n\nThe component accepts all standard Ant Design Card properties while adding Backend.AI-specific enhancements for better user experience and visual consistency across the platform.\n\n## Props\n\n| Name | Type | Default | Description |\n|------|------|---------|-------------|\n| status | `'success' \\| 'error' \\| 'warning' \\| 'default'` | `'default'` | Visual status affecting border color and extra button icons |\n| extra | `ReactNode` | - | Custom content to display in the header area |\n| extraButtonTitle | `string \\| ReactNode` | - | Title for the extra action button in the header |\n| showDivider | `boolean` | `false` | Show divider between header and body. Auto-enabled with tabs |\n| onClickExtraButton | `() => void` | - | Callback when extra button is clicked |\n        "}}},argTypes:{status:{control:{type:`select`},options:[`default`,`success`,`warning`,`error`],description:`Visual status affecting border color and extra button icons`,table:{type:{summary:`string`},defaultValue:{summary:`default`}}},size:{control:{type:`select`},options:[`default`,`small`],description:`Card size affecting padding and spacing`,table:{type:{summary:`string`},defaultValue:{summary:`default`}}},title:{control:{type:`text`},description:`Card title displayed in the header`,table:{type:{summary:`ReactNode`}}},extraButtonTitle:{control:{type:`text`},description:`Title for the extra action button in the header`,table:{type:{summary:`string | ReactNode`}}},loading:{control:{type:`boolean`},description:`Shows loading spinner overlay`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},hoverable:{control:{type:`boolean`},description:`Enable hover effects and pointer cursor`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},bordered:{control:{type:`boolean`},description:`Show card border`,table:{type:{summary:`boolean`},defaultValue:{summary:`true`}}},showDivider:{control:{type:`boolean`},description:`Show divider between header and body. Auto-enabled with tabs`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},onClickExtraButton:{action:`extraButtonClicked`,description:`Callback when extra button is clicked`,table:{type:{summary:`() => void`}}},extra:{control:!1,description:`Custom content to display in the header area`,table:{type:{summary:`ReactNode`}}},children:{control:!1,description:`Card body content`,table:{type:{summary:`ReactNode`}}},style:{control:!1,description:`Custom CSS styles for the card`,table:{type:{summary:`CSSProperties`}}},className:{control:{type:`text`},description:`Custom CSS class name`,table:{type:{summary:`string`}}}}},f=(0,u.jsxs)(`div`,{children:[(0,u.jsx)(`div`,{children:(0,u.jsx)(a,{children:`This is sample content for the BAI Card component. It demonstrates how content is displayed within the card body.`})}),(0,u.jsxs)(s,{gap:`xs`,align:`center`,children:[(0,u.jsx)(l,{type:`primary`,children:`Primary Action`}),(0,u.jsx)(l,{children:`Secondary Action`})]})]}),p={name:`Basic`,parameters:{docs:{description:{story:`Basic card with title and content. This is the most common usage pattern.`}}},args:{title:`Default Card`,children:f}},m={name:`NoTitle`,args:{children:f}},h={name:`StatusTypes`,parameters:{docs:{description:{story:`Different status variants showing how border colors change based on the status prop. Each status provides different visual feedback to users.`}}},render:()=>(0,u.jsxs)(s,{direction:`column`,gap:`md`,children:[(0,u.jsx)(r,{title:`Default Status`,status:`default`,children:f}),(0,u.jsx)(r,{title:`Success Status`,status:`success`,children:f}),(0,u.jsx)(r,{title:`Warning Status`,status:`warning`,children:f}),(0,u.jsx)(r,{title:`Error Status`,status:`error`,children:f})]})},g={name:`ExtraContent`,args:{title:`Card with Extra`,extra:(0,u.jsx)(l,{type:`link`,children:`More`}),children:f}},_={name:`ExtraButton`,parameters:{docs:{description:{story:`Card with an extra action button in the header. The button automatically gets appropriate icons based on the card status.`}}},args:{title:`Card with Extra Button`,extraButtonTitle:`Action`,onClickExtraButton:()=>console.log(`Extra button clicked!`),children:f}},v={name:`ExtraButtonWithStatus`,render:()=>(0,u.jsxs)(s,{direction:`column`,gap:`md`,children:[(0,u.jsx)(r,{title:`Error with Extra Button`,status:`error`,extraButtonTitle:`Fix Error`,onClickExtraButton:()=>console.log(`Fix error clicked!`),children:f}),(0,u.jsx)(r,{title:`Warning with Extra Button`,status:`warning`,extraButtonTitle:`Review Warning`,onClickExtraButton:()=>console.log(`Review warning clicked!`),children:f})]})},y={name:`TabsIntegration`,args:{title:`Card with Tabs`,tabList:[{key:`tab1`,label:`Tab 1`},{key:`tab2`,label:`Tab 2`},{key:`tab3`,label:`Tab 3`}],activeTabKey:`tab1`,onTabChange:e=>console.log(`Tab changed to:`,e),children:f}},b={name:`CompactSize`,args:{title:`Small Card`,size:`small`,children:(0,u.jsx)(`div`,{style:{margin:0},children:(0,u.jsx)(a,{children:`This is a small-sized card with reduced padding.`})})}},x={name:`LoadingState`,args:{title:`Loading Card`,loading:!0,children:f}},S={name:`InteractiveHover`,args:{title:`Hoverable Card`,hoverable:!0,children:f}},C={name:`NoBorder`,args:{title:`Borderless Card`,bordered:!1,children:f}},w={name:`ComplexExtraContent`,args:{title:`Card with Complex Extra`,extra:(0,u.jsxs)(s,{gap:`xs`,align:`center`,children:[(0,u.jsx)(l,{size:`small`,children:`Edit`}),(0,u.jsx)(l,{size:`small`,type:`primary`,children:`Save`})]}),children:f}},T={name:`HeaderNoDivider`,args:{title:`Card without Header Divider`,showDivider:!1,children:f}},E={name:`HeaderWithDivider`,args:{title:`Card with Header Divider`,showDivider:!0,children:f}},D={name:`CustomStyling`,args:{title:`Custom Styled Card`,style:{background:`linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,color:`white`},styles:{header:{color:`white`,borderBottom:`1px solid rgba(255, 255, 255, 0.2)`},body:{color:`white`}},children:(0,u.jsx)(`div`,{style:{margin:0},children:(0,u.jsx)(a,{style:{color:`white`},children:`This card has custom gradient background and white text.`})})}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'Basic card with title and content. This is the most common usage pattern.'
      }
    }
  },
  args: {
    title: 'Default Card',
    children: sampleContent
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  name: 'NoTitle',
  args: {
    children: sampleContent
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  name: 'StatusTypes',
  parameters: {
    docs: {
      description: {
        story: 'Different status variants showing how border colors change based on the status prop. Each status provides different visual feedback to users.'
      }
    }
  },
  render: () => <BAIFlex direction="column" gap="md">
      <BAICard title="Default Status" status="default">
        {sampleContent}
      </BAICard>
      <BAICard title="Success Status" status="success">
        {sampleContent}
      </BAICard>
      <BAICard title="Warning Status" status="warning">
        {sampleContent}
      </BAICard>
      <BAICard title="Error Status" status="error">
        {sampleContent}
      </BAICard>
    </BAIFlex>
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  name: 'ExtraContent',
  args: {
    title: 'Card with Extra',
    extra: <BAIButton type="link">More</BAIButton>,
    children: sampleContent
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  name: 'ExtraButton',
  parameters: {
    docs: {
      description: {
        story: 'Card with an extra action button in the header. The button automatically gets appropriate icons based on the card status.'
      }
    }
  },
  args: {
    title: 'Card with Extra Button',
    extraButtonTitle: 'Action',
    onClickExtraButton: () => console.log('Extra button clicked!'),
    children: sampleContent
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  name: 'ExtraButtonWithStatus',
  render: () => <BAIFlex direction="column" gap="md">
      <BAICard title="Error with Extra Button" status="error" extraButtonTitle="Fix Error" onClickExtraButton={() => console.log('Fix error clicked!')}>
        {sampleContent}
      </BAICard>
      <BAICard title="Warning with Extra Button" status="warning" extraButtonTitle="Review Warning" onClickExtraButton={() => console.log('Review warning clicked!')}>
        {sampleContent}
      </BAICard>
    </BAIFlex>
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  name: 'TabsIntegration',
  args: {
    title: 'Card with Tabs',
    tabList: [{
      key: 'tab1',
      label: 'Tab 1'
    }, {
      key: 'tab2',
      label: 'Tab 2'
    }, {
      key: 'tab3',
      label: 'Tab 3'
    }],
    activeTabKey: 'tab1',
    onTabChange: (key: string) => console.log('Tab changed to:', key),
    children: sampleContent
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  name: 'CompactSize',
  args: {
    title: 'Small Card',
    size: 'small',
    children: <div style={{
      margin: 0
    }}>
        <BAIText>This is a small-sized card with reduced padding.</BAIText>
      </div>
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  name: 'LoadingState',
  args: {
    title: 'Loading Card',
    loading: true,
    children: sampleContent
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  name: 'InteractiveHover',
  args: {
    title: 'Hoverable Card',
    hoverable: true,
    children: sampleContent
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  name: 'NoBorder',
  args: {
    title: 'Borderless Card',
    bordered: false,
    children: sampleContent
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  name: 'ComplexExtraContent',
  args: {
    title: 'Card with Complex Extra',
    extra: <BAIFlex gap="xs" align="center">
        <BAIButton size="small">Edit</BAIButton>
        <BAIButton size="small" type="primary">
          Save
        </BAIButton>
      </BAIFlex>,
    children: sampleContent
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  name: 'HeaderNoDivider',
  args: {
    title: 'Card without Header Divider',
    showDivider: false,
    children: sampleContent
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  name: 'HeaderWithDivider',
  args: {
    title: 'Card with Header Divider',
    showDivider: true,
    children: sampleContent
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  name: 'CustomStyling',
  args: {
    title: 'Custom Styled Card',
    style: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    },
    styles: {
      header: {
        color: 'white',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
      },
      body: {
        color: 'white'
      }
    },
    children: <div style={{
      margin: 0
    }}>
        <BAIText style={{
        color: 'white'
      }}>
          This card has custom gradient background and white text.
        </BAIText>
      </div>
  }
}`,...D.parameters?.docs?.source}}},O=[`Default`,`WithoutTitle`,`StatusVariants`,`WithExtra`,`WithExtraButton`,`WithExtraButtonAndStatus`,`WithTabs`,`SmallSize`,`Loading`,`Hoverable`,`Borderless`,`ComplexExtra`,`NoDivider`,`WithDivider`,`CustomStyles`]})))()}k();export{C as Borderless,w as ComplexExtra,D as CustomStyles,p as Default,S as Hoverable,x as Loading,T as NoDivider,b as SmallSize,h as StatusVariants,E as WithDivider,g as WithExtra,_ as WithExtraButton,v as WithExtraButtonAndStatus,y as WithTabs,m as WithoutTitle,O as __namedExportsOrder,d as default};