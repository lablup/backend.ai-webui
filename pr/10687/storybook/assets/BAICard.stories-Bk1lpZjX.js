import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t as ee}from"./jsx-runtime-MKhVqBIO.js";import{n as te,t}from"./BAICard-YmB_Ocnr.js";import{h as ne,m as n}from"./iframe-DNjBbxcu.js";import{n as re,t as r}from"./BAIFlex-DnaoYTJ1.js";import{n as ie,t as i}from"./BAIButton-B2To7LOX.js";var a,o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q,$;function ae(){return(ae=e((()=>{ie(),te(),re(),ne(),a=ee(),I={title:`Card/BAICard`,component:t,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:"\n**BAICard** keeps an Ant Design `Card`-shaped prop surface (`title`, `extra`, `tabList`, `status`, ...) for call-site compatibility, but renders through Astryx's `Card` primitive internally. It provides additional features including:\n\n- **Status-based styling**: Visual indicators for success, error, warning, and default states\n- **Integrated action buttons**: Extra buttons with automatic icons based on status\n- **Enhanced header layout**: Flexible title and extra content arrangement\n- **Tab integration**: Built-in support for tabbed content\n- **Consistent design**: Follows Backend.AI design system guidelines\n\nThe component accepts all standard Ant Design Card properties while adding Backend.AI-specific enhancements for better user experience and visual consistency across the platform.\n\n## Props\n\n| Name | Type | Default | Description |\n|------|------|---------|-------------|\n| status | `'success' \\| 'error' \\| 'warning' \\| 'default'` | `'default'` | Visual status affecting border color and extra button icons |\n| extra | `ReactNode` | - | Custom content to display in the header area |\n| extraButtonTitle | `string \\| ReactNode` | - | Title for the extra action button in the header |\n| showDivider | `boolean` | `false` | Show divider between header and body. Auto-enabled with tabs |\n| onClickExtraButton | `() => void` | - | Callback when extra button is clicked |\n        "}}},argTypes:{status:{control:{type:`select`},options:[`default`,`success`,`warning`,`error`],description:`Visual status affecting border color and extra button icons`,table:{type:{summary:`string`},defaultValue:{summary:`default`}}},size:{control:{type:`select`},options:[`default`,`small`],description:`Card size affecting padding and spacing`,table:{type:{summary:`string`},defaultValue:{summary:`default`}}},title:{control:{type:`text`},description:`Card title displayed in the header`,table:{type:{summary:`ReactNode`}}},extraButtonTitle:{control:{type:`text`},description:`Title for the extra action button in the header`,table:{type:{summary:`string | ReactNode`}}},loading:{control:{type:`boolean`},description:`Shows loading spinner overlay`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},hoverable:{control:{type:`boolean`},description:`Enable hover effects and pointer cursor`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},bordered:{control:{type:`boolean`},description:`Show card border`,table:{type:{summary:`boolean`},defaultValue:{summary:`true`}}},showDivider:{control:{type:`boolean`},description:`Show divider between header and body. Auto-enabled with tabs`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},onClickExtraButton:{action:`extraButtonClicked`,description:`Callback when extra button is clicked`,table:{type:{summary:`() => void`}}},extra:{control:!1,description:`Custom content to display in the header area`,table:{type:{summary:`ReactNode`}}},children:{control:!1,description:`Card body content`,table:{type:{summary:`ReactNode`}}},style:{control:!1,description:`Custom CSS styles for the card`,table:{type:{summary:`CSSProperties`}}},className:{control:{type:`text`},description:`Custom CSS class name`,table:{type:{summary:`string`}}}}},L=(0,a.jsxs)(`div`,{children:[(0,a.jsx)(`div`,{children:(0,a.jsx)(n,{children:`This is sample content for the BAI Card component. It demonstrates how content is displayed within the card body.`})}),(0,a.jsxs)(r,{gap:`xs`,align:`center`,children:[(0,a.jsx)(i,{type:`primary`,children:`Primary Action`}),(0,a.jsx)(i,{children:`Secondary Action`})]})]}),R={name:`Basic`,parameters:{docs:{description:{story:`Basic card with title and content. This is the most common usage pattern.`}}},args:{title:`Default Card`,children:L}},z={name:`NoTitle`,args:{children:L}},B={name:`StatusTypes`,parameters:{docs:{description:{story:`Different status variants showing how border colors change based on the status prop. Each status provides different visual feedback to users.`}}},render:()=>(0,a.jsxs)(r,{direction:`column`,gap:`md`,children:[(0,a.jsx)(t,{title:`Default Status`,status:`default`,children:L}),(0,a.jsx)(t,{title:`Success Status`,status:`success`,children:L}),(0,a.jsx)(t,{title:`Warning Status`,status:`warning`,children:L}),(0,a.jsx)(t,{title:`Error Status`,status:`error`,children:L})]})},V={name:`ExtraContent`,args:{title:`Card with Extra`,extra:(0,a.jsx)(i,{type:`link`,children:`More`}),children:L}},H={name:`ExtraButton`,parameters:{docs:{description:{story:`Card with an extra action button in the header. The button automatically gets appropriate icons based on the card status.`}}},args:{title:`Card with Extra Button`,extraButtonTitle:`Action`,onClickExtraButton:()=>console.log(`Extra button clicked!`),children:L}},U={name:`ExtraButtonWithStatus`,render:()=>(0,a.jsxs)(r,{direction:`column`,gap:`md`,children:[(0,a.jsx)(t,{title:`Error with Extra Button`,status:`error`,extraButtonTitle:`Fix Error`,onClickExtraButton:()=>console.log(`Fix error clicked!`),children:L}),(0,a.jsx)(t,{title:`Warning with Extra Button`,status:`warning`,extraButtonTitle:`Review Warning`,onClickExtraButton:()=>console.log(`Review warning clicked!`),children:L})]})},W={name:`TabsIntegration`,args:{title:`Card with Tabs`,tabList:[{key:`tab1`,label:`Tab 1`},{key:`tab2`,label:`Tab 2`},{key:`tab3`,label:`Tab 3`}],activeTabKey:`tab1`,onTabChange:e=>console.log(`Tab changed to:`,e),children:L}},G={name:`CompactSize`,args:{title:`Small Card`,size:`small`,children:(0,a.jsx)(`div`,{style:{margin:0},children:(0,a.jsx)(n,{children:`This is a small-sized card with reduced padding.`})})}},K={name:`LoadingState`,args:{title:`Loading Card`,loading:!0,children:L}},q={name:`InteractiveHover`,args:{title:`Hoverable Card`,hoverable:!0,children:L}},J={name:`NoBorder`,args:{title:`Borderless Card`,bordered:!1,children:L}},Y={name:`ComplexExtraContent`,args:{title:`Card with Complex Extra`,extra:(0,a.jsxs)(r,{gap:`xs`,align:`center`,children:[(0,a.jsx)(i,{size:`small`,children:`Edit`}),(0,a.jsx)(i,{size:`small`,type:`primary`,children:`Save`})]}),children:L}},X={name:`HeaderNoDivider`,args:{title:`Card without Header Divider`,showDivider:!1,children:L}},Z={name:`HeaderWithDivider`,args:{title:`Card with Header Divider`,showDivider:!0,children:L}},Q={name:`CustomStyling`,args:{title:`Custom Styled Card`,style:{background:`linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,color:`white`},styles:{header:{color:`white`,borderBottom:`1px solid rgba(255, 255, 255, 0.2)`},body:{color:`white`}},children:(0,a.jsx)(`div`,{style:{margin:0},children:(0,a.jsx)(n,{style:{color:`white`},children:`This card has custom gradient background and white text.`})})}},R.parameters={...R.parameters,docs:{...(o=R.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
}`,...(s=R.parameters)==null||(s=s.docs)==null?void 0:s.source}}},z.parameters={...z.parameters,docs:{...(c=z.parameters)==null?void 0:c.docs,source:{originalSource:`{
  name: 'NoTitle',
  args: {
    children: sampleContent
  }
}`,...(l=z.parameters)==null||(l=l.docs)==null?void 0:l.source}}},B.parameters={...B.parameters,docs:{...(u=B.parameters)==null?void 0:u.docs,source:{originalSource:`{
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
}`,...(d=B.parameters)==null||(d=d.docs)==null?void 0:d.source}}},V.parameters={...V.parameters,docs:{...(f=V.parameters)==null?void 0:f.docs,source:{originalSource:`{
  name: 'ExtraContent',
  args: {
    title: 'Card with Extra',
    extra: <BAIButton type="link">More</BAIButton>,
    children: sampleContent
  }
}`,...(p=V.parameters)==null||(p=p.docs)==null?void 0:p.source}}},H.parameters={...H.parameters,docs:{...(m=H.parameters)==null?void 0:m.docs,source:{originalSource:`{
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
}`,...(h=H.parameters)==null||(h=h.docs)==null?void 0:h.source}}},U.parameters={...U.parameters,docs:{...(g=U.parameters)==null?void 0:g.docs,source:{originalSource:`{
  name: 'ExtraButtonWithStatus',
  render: () => <BAIFlex direction="column" gap="md">
      <BAICard title="Error with Extra Button" status="error" extraButtonTitle="Fix Error" onClickExtraButton={() => console.log('Fix error clicked!')}>
        {sampleContent}
      </BAICard>
      <BAICard title="Warning with Extra Button" status="warning" extraButtonTitle="Review Warning" onClickExtraButton={() => console.log('Review warning clicked!')}>
        {sampleContent}
      </BAICard>
    </BAIFlex>
}`,...(_=U.parameters)==null||(_=_.docs)==null?void 0:_.source}}},W.parameters={...W.parameters,docs:{...(v=W.parameters)==null?void 0:v.docs,source:{originalSource:`{
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
}`,...(y=W.parameters)==null||(y=y.docs)==null?void 0:y.source}}},G.parameters={...G.parameters,docs:{...(b=G.parameters)==null?void 0:b.docs,source:{originalSource:`{
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
}`,...(x=G.parameters)==null||(x=x.docs)==null?void 0:x.source}}},K.parameters={...K.parameters,docs:{...(S=K.parameters)==null?void 0:S.docs,source:{originalSource:`{
  name: 'LoadingState',
  args: {
    title: 'Loading Card',
    loading: true,
    children: sampleContent
  }
}`,...(C=K.parameters)==null||(C=C.docs)==null?void 0:C.source}}},q.parameters={...q.parameters,docs:{...(w=q.parameters)==null?void 0:w.docs,source:{originalSource:`{
  name: 'InteractiveHover',
  args: {
    title: 'Hoverable Card',
    hoverable: true,
    children: sampleContent
  }
}`,...(T=q.parameters)==null||(T=T.docs)==null?void 0:T.source}}},J.parameters={...J.parameters,docs:{...(E=J.parameters)==null?void 0:E.docs,source:{originalSource:`{
  name: 'NoBorder',
  args: {
    title: 'Borderless Card',
    bordered: false,
    children: sampleContent
  }
}`,...(D=J.parameters)==null||(D=D.docs)==null?void 0:D.source}}},Y.parameters={...Y.parameters,docs:{...(O=Y.parameters)==null?void 0:O.docs,source:{originalSource:`{
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
}`,...(k=Y.parameters)==null||(k=k.docs)==null?void 0:k.source}}},X.parameters={...X.parameters,docs:{...(A=X.parameters)==null?void 0:A.docs,source:{originalSource:`{
  name: 'HeaderNoDivider',
  args: {
    title: 'Card without Header Divider',
    showDivider: false,
    children: sampleContent
  }
}`,...(j=X.parameters)==null||(j=j.docs)==null?void 0:j.source}}},Z.parameters={...Z.parameters,docs:{...(M=Z.parameters)==null?void 0:M.docs,source:{originalSource:`{
  name: 'HeaderWithDivider',
  args: {
    title: 'Card with Header Divider',
    showDivider: true,
    children: sampleContent
  }
}`,...(N=Z.parameters)==null||(N=N.docs)==null?void 0:N.source}}},Q.parameters={...Q.parameters,docs:{...(P=Q.parameters)==null?void 0:P.docs,source:{originalSource:`{
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
}`,...(F=Q.parameters)==null||(F=F.docs)==null?void 0:F.source}}},$=[`Default`,`WithoutTitle`,`StatusVariants`,`WithExtra`,`WithExtraButton`,`WithExtraButtonAndStatus`,`WithTabs`,`SmallSize`,`Loading`,`Hoverable`,`Borderless`,`ComplexExtra`,`NoDivider`,`WithDivider`,`CustomStyles`]})))()}ae();export{J as Borderless,Y as ComplexExtra,Q as CustomStyles,R as Default,q as Hoverable,K as Loading,X as NoDivider,G as SmallSize,B as StatusVariants,Z as WithDivider,V as WithExtra,H as WithExtraButton,U as WithExtraButtonAndStatus,W as WithTabs,z as WithoutTitle,$ as __namedExportsOrder,I as default};