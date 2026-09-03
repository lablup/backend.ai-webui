import{j as e,B}from"./iframe-DAIf00kV.js";import{B as r}from"./BAIButton-C9jyhABl.js";import{B as a}from"./BAICard-pl6h4ZQN.js";import{B as C}from"./BAIFlex-B-2KipBa.js";import"./preload-helper-Dp1pzeXC.js";import"./astryxLabel-DpNNyWQb.js";import"./BAITabList-Bld5dXbb.js";import"./useDevWarning-B7kK_x5d.js";import"./useListFocus-CGI67kdv.js";import"./isRtlElement-B2-7SF8s.js";import"./rtlStyles-T4i24HtE.js";import"./VStack-B_8tY6X1.js";import"./Divider-CeZnT8W5.js";const Ee={title:"Card/BAICard",component:a,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:"\n**BAICard** keeps an Ant Design `Card`-shaped prop surface (`title`, `extra`, `tabList`, `status`, ...) for call-site compatibility, but renders through Astryx's `Card` primitive internally. It provides additional features including:\n\n- **Status-based styling**: Visual indicators for success, error, warning, and default states\n- **Integrated action buttons**: Extra buttons with automatic icons based on status\n- **Enhanced header layout**: Flexible title and extra content arrangement\n- **Tab integration**: Built-in support for tabbed content\n- **Consistent design**: Follows Backend.AI design system guidelines\n\nThe component accepts all standard Ant Design Card properties while adding Backend.AI-specific enhancements for better user experience and visual consistency across the platform.\n\n## Props\n\n| Name | Type | Default | Description |\n|------|------|---------|-------------|\n| status | `'success' \\| 'error' \\| 'warning' \\| 'default'` | `'default'` | Visual status affecting border color and extra button icons |\n| extra | `ReactNode` | - | Custom content to display in the header area |\n| extraButtonTitle | `string \\| ReactNode` | - | Title for the extra action button in the header |\n| showDivider | `boolean` | `false` | Show divider between header and body. Auto-enabled with tabs |\n| onClickExtraButton | `() => void` | - | Callback when extra button is clicked |\n        "}}},argTypes:{status:{control:{type:"select"},options:["default","success","warning","error"],description:"Visual status affecting border color and extra button icons",table:{type:{summary:"string"},defaultValue:{summary:"default"}}},size:{control:{type:"select"},options:["default","small"],description:"Card size affecting padding and spacing",table:{type:{summary:"string"},defaultValue:{summary:"default"}}},title:{control:{type:"text"},description:"Card title displayed in the header",table:{type:{summary:"ReactNode"}}},extraButtonTitle:{control:{type:"text"},description:"Title for the extra action button in the header",table:{type:{summary:"string | ReactNode"}}},loading:{control:{type:"boolean"},description:"Shows loading spinner overlay",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},hoverable:{control:{type:"boolean"},description:"Enable hover effects and pointer cursor",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},bordered:{control:{type:"boolean"},description:"Show card border",table:{type:{summary:"boolean"},defaultValue:{summary:"true"}}},showDivider:{control:{type:"boolean"},description:"Show divider between header and body. Auto-enabled with tabs",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},onClickExtraButton:{action:"extraButtonClicked",description:"Callback when extra button is clicked",table:{type:{summary:"() => void"}}},extra:{control:!1,description:"Custom content to display in the header area",table:{type:{summary:"ReactNode"}}},children:{control:!1,description:"Card body content",table:{type:{summary:"ReactNode"}}},style:{control:!1,description:"Custom CSS styles for the card",table:{type:{summary:"CSSProperties"}}},className:{control:{type:"text"},description:"Custom CSS class name",table:{type:{summary:"string"}}}}},t=e.jsxs("div",{children:[e.jsx("div",{children:e.jsx(B,{children:"This is sample content for the BAI Card component. It demonstrates how content is displayed within the card body."})}),e.jsxs(C,{gap:"xs",align:"center",children:[e.jsx(r,{type:"primary",children:"Primary Action"}),e.jsx(r,{children:"Secondary Action"})]})]}),n={name:"Basic",parameters:{docs:{description:{story:"Basic card with title and content. This is the most common usage pattern."}}},args:{title:"Default Card",children:t}},s={name:"NoTitle",args:{children:t}},o={name:"StatusTypes",parameters:{docs:{description:{story:"Different status variants showing how border colors change based on the status prop. Each status provides different visual feedback to users."}}},render:()=>e.jsxs(C,{direction:"column",gap:"md",children:[e.jsx(a,{title:"Default Status",status:"default",children:t}),e.jsx(a,{title:"Success Status",status:"success",children:t}),e.jsx(a,{title:"Warning Status",status:"warning",children:t}),e.jsx(a,{title:"Error Status",status:"error",children:t})]})},i={name:"ExtraContent",args:{title:"Card with Extra",extra:e.jsx(r,{type:"link",children:"More"}),children:t}},d={name:"ExtraButton",parameters:{docs:{description:{story:"Card with an extra action button in the header. The button automatically gets appropriate icons based on the card status."}}},args:{title:"Card with Extra Button",extraButtonTitle:"Action",onClickExtraButton:()=>console.log("Extra button clicked!"),children:t}},l={name:"ExtraButtonWithStatus",render:()=>e.jsxs(C,{direction:"column",gap:"md",children:[e.jsx(a,{title:"Error with Extra Button",status:"error",extraButtonTitle:"Fix Error",onClickExtraButton:()=>console.log("Fix error clicked!"),children:t}),e.jsx(a,{title:"Warning with Extra Button",status:"warning",extraButtonTitle:"Review Warning",onClickExtraButton:()=>console.log("Review warning clicked!"),children:t})]})},c={name:"TabsIntegration",args:{title:"Card with Tabs",tabList:[{key:"tab1",label:"Tab 1"},{key:"tab2",label:"Tab 2"},{key:"tab3",label:"Tab 3"}],activeTabKey:"tab1",onTabChange:me=>console.log("Tab changed to:",me),children:t}},u={name:"CompactSize",args:{title:"Small Card",size:"small",children:e.jsx("div",{style:{margin:0},children:e.jsx(B,{children:"This is a small-sized card with reduced padding."})})}},m={name:"LoadingState",args:{title:"Loading Card",loading:!0,children:t}},p={name:"InteractiveHover",args:{title:"Hoverable Card",hoverable:!0,children:t}},h={name:"NoBorder",args:{title:"Borderless Card",bordered:!1,children:t}},g={name:"ComplexExtraContent",args:{title:"Card with Complex Extra",extra:e.jsxs(C,{gap:"xs",align:"center",children:[e.jsx(r,{size:"small",children:"Edit"}),e.jsx(r,{size:"small",type:"primary",children:"Save"})]}),children:t}},b={name:"HeaderNoDivider",args:{title:"Card without Header Divider",showDivider:!1,children:t}},x={name:"HeaderWithDivider",args:{title:"Card with Header Divider",showDivider:!0,children:t}},y={name:"CustomStyling",args:{title:"Custom Styled Card",style:{background:"linear-gradient(135deg, #667eea 0%, #764ba2 100%)",color:"white"},styles:{header:{color:"white",borderBottom:"1px solid rgba(255, 255, 255, 0.2)"},body:{color:"white"}},children:e.jsx("div",{style:{margin:0},children:e.jsx(B,{style:{color:"white"},children:"This card has custom gradient background and white text."})})}};var w,f,S;n.parameters={...n.parameters,docs:{...(w=n.parameters)==null?void 0:w.docs,source:{originalSource:`{
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
}`,...(S=(f=n.parameters)==null?void 0:f.docs)==null?void 0:S.source}}};var v,T,E;s.parameters={...s.parameters,docs:{...(v=s.parameters)==null?void 0:v.docs,source:{originalSource:`{
  name: 'NoTitle',
  args: {
    children: sampleContent
  }
}`,...(E=(T=s.parameters)==null?void 0:T.docs)==null?void 0:E.source}}};var A,I,k;o.parameters={...o.parameters,docs:{...(A=o.parameters)==null?void 0:A.docs,source:{originalSource:`{
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
}`,...(k=(I=o.parameters)==null?void 0:I.docs)==null?void 0:k.source}}};var D,j,W;i.parameters={...i.parameters,docs:{...(D=i.parameters)==null?void 0:D.docs,source:{originalSource:`{
  name: 'ExtraContent',
  args: {
    title: 'Card with Extra',
    extra: <BAIButton type="link">More</BAIButton>,
    children: sampleContent
  }
}`,...(W=(j=i.parameters)==null?void 0:j.docs)==null?void 0:W.source}}};var N,z,H;d.parameters={...d.parameters,docs:{...(N=d.parameters)==null?void 0:N.docs,source:{originalSource:`{
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
}`,...(H=(z=d.parameters)==null?void 0:z.docs)==null?void 0:H.source}}};var F,R,V;l.parameters={...l.parameters,docs:{...(F=l.parameters)==null?void 0:F.docs,source:{originalSource:`{
  name: 'ExtraButtonWithStatus',
  render: () => <BAIFlex direction="column" gap="md">
      <BAICard title="Error with Extra Button" status="error" extraButtonTitle="Fix Error" onClickExtraButton={() => console.log('Fix error clicked!')}>
        {sampleContent}
      </BAICard>
      <BAICard title="Warning with Extra Button" status="warning" extraButtonTitle="Review Warning" onClickExtraButton={() => console.log('Review warning clicked!')}>
        {sampleContent}
      </BAICard>
    </BAIFlex>
}`,...(V=(R=l.parameters)==null?void 0:R.docs)==null?void 0:V.source}}};var L,P,K;c.parameters={...c.parameters,docs:{...(L=c.parameters)==null?void 0:L.docs,source:{originalSource:`{
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
}`,...(K=(P=c.parameters)==null?void 0:P.docs)==null?void 0:K.source}}};var M,_,O;u.parameters={...u.parameters,docs:{...(M=u.parameters)==null?void 0:M.docs,source:{originalSource:`{
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
}`,...(O=(_=u.parameters)==null?void 0:_.docs)==null?void 0:O.source}}};var q,G,J;m.parameters={...m.parameters,docs:{...(q=m.parameters)==null?void 0:q.docs,source:{originalSource:`{
  name: 'LoadingState',
  args: {
    title: 'Loading Card',
    loading: true,
    children: sampleContent
  }
}`,...(J=(G=m.parameters)==null?void 0:G.docs)==null?void 0:J.source}}};var Q,U,X;p.parameters={...p.parameters,docs:{...(Q=p.parameters)==null?void 0:Q.docs,source:{originalSource:`{
  name: 'InteractiveHover',
  args: {
    title: 'Hoverable Card',
    hoverable: true,
    children: sampleContent
  }
}`,...(X=(U=p.parameters)==null?void 0:U.docs)==null?void 0:X.source}}};var Y,Z,$;h.parameters={...h.parameters,docs:{...(Y=h.parameters)==null?void 0:Y.docs,source:{originalSource:`{
  name: 'NoBorder',
  args: {
    title: 'Borderless Card',
    bordered: false,
    children: sampleContent
  }
}`,...($=(Z=h.parameters)==null?void 0:Z.docs)==null?void 0:$.source}}};var ee,te,ae;g.parameters={...g.parameters,docs:{...(ee=g.parameters)==null?void 0:ee.docs,source:{originalSource:`{
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
}`,...(ae=(te=g.parameters)==null?void 0:te.docs)==null?void 0:ae.source}}};var re,ne,se;b.parameters={...b.parameters,docs:{...(re=b.parameters)==null?void 0:re.docs,source:{originalSource:`{
  name: 'HeaderNoDivider',
  args: {
    title: 'Card without Header Divider',
    showDivider: false,
    children: sampleContent
  }
}`,...(se=(ne=b.parameters)==null?void 0:ne.docs)==null?void 0:se.source}}};var oe,ie,de;x.parameters={...x.parameters,docs:{...(oe=x.parameters)==null?void 0:oe.docs,source:{originalSource:`{
  name: 'HeaderWithDivider',
  args: {
    title: 'Card with Header Divider',
    showDivider: true,
    children: sampleContent
  }
}`,...(de=(ie=x.parameters)==null?void 0:ie.docs)==null?void 0:de.source}}};var le,ce,ue;y.parameters={...y.parameters,docs:{...(le=y.parameters)==null?void 0:le.docs,source:{originalSource:`{
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
}`,...(ue=(ce=y.parameters)==null?void 0:ce.docs)==null?void 0:ue.source}}};const Ae=["Default","WithoutTitle","StatusVariants","WithExtra","WithExtraButton","WithExtraButtonAndStatus","WithTabs","SmallSize","Loading","Hoverable","Borderless","ComplexExtra","NoDivider","WithDivider","CustomStyles"];export{h as Borderless,g as ComplexExtra,y as CustomStyles,n as Default,p as Hoverable,m as Loading,b as NoDivider,u as SmallSize,o as StatusVariants,x as WithDivider,i as WithExtra,d as WithExtraButton,l as WithExtraButtonAndStatus,c as WithTabs,s as WithoutTitle,Ae as __namedExportsOrder,Ee as default};
