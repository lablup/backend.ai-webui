import{b as q,j as t,aw as _}from"./iframe-fCvOZk0c.js";import{B as o}from"./BAIFlex-BsahEmA0.js";import{B as V}from"./BAIQuestionIconWithTooltip-BzDJOGSP.js";import{B as e}from"./BAIButton-BOIOHvzx.js";import{B as H}from"./BAITag-ckCVx9eO.js";import{R as Q}from"./rotate-cw-DQN89Inb.js";import{S as X}from"./settings-BYpCPoTP.js";import"./preload-helper-Dp1pzeXC.js";import"./astryxPlacement-BxR6_qos.js";import"./BAIIconWithTooltip-BWGsFRnm.js";import"./astryxLabel-DbojF4SE.js";import"./circle-question-mark-DWY92N-8.js";import"./astryxTagVariant-CPCr7vTB.js";import"./Token-Crl1oBga.js";import"./composeEventHandlers-BolWE7qY.js";import"./Badge-CJn8tVrn.js";const Z=50,D=({title:m,tooltip:d,extra:O,style:U})=>{const{token:u}=q();return t.jsxs(o,{align:"center",justify:"between",style:{paddingBlock:u("--spacing-5"),flexShrink:0,position:"sticky",top:0,backgroundColor:u("--color-background-surface"),zIndex:Z,...U},gap:"xs",wrap:"wrap",children:[t.jsxs(o,{gap:"xs",align:"center",wrap:"wrap",children:[typeof m=="string"?t.jsx(_,{level:5,children:m}):m,d?t.jsx(V,{title:d}):null]}),t.jsx(o,{gap:"xs",align:"center",justify:"end",style:{marginLeft:"auto"},children:O})]})};D.displayName="BAIBoardItemTitle";const ct={title:"Board/BAIBoardItemTitle",component:D,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:"BAIBoardItemTitle is a sticky header component designed for board items. It provides a consistent layout with a title, optional tooltip, and extra content area."}}},argTypes:{title:{description:"The main title content - can be a string or React node",control:{type:"text"}},tooltip:{description:"Optional tooltip content that appears on hover of the question mark icon",control:{type:"text"}},extra:{description:"Additional content displayed on the right side of the header",control:!1},style:{description:"Custom CSS styles for the header container",control:!1}}},s={name:"Basic",args:{title:"Board Item Title"},parameters:{docs:{description:{story:"Basic usage with just a title."}}}},r={name:"WithTooltip",args:{title:"Resource Usage",tooltip:"This shows the current resource utilization of your compute sessions."},parameters:{docs:{description:{story:"Title with a helpful tooltip that appears when hovering over the question mark icon."}}}},a={name:"WithExtraContent",args:{title:"Session Overview",extra:t.jsx(e,{type:"primary",size:"small",children:"Refresh"})},parameters:{docs:{description:{story:"Title with extra content like buttons or controls in the right side."}}}},i={name:"Complete",args:{title:"Compute Sessions",tooltip:"Active compute sessions in your environment",extra:t.jsxs(o,{gap:"xs",align:"center",children:[t.jsx(H,{color:"blue",children:"12 Active"}),t.jsx(e,{type:"text",size:"small",icon:t.jsx(Q,{size:"1em"})}),t.jsx(e,{type:"text",size:"small",icon:t.jsx(X,{size:"1em"})})]})},parameters:{docs:{description:{story:"Complete example with title, tooltip, and complex extra content including tags and action buttons."}}}},n={name:"CustomTitleNode",args:{title:t.jsxs(o,{gap:"xs",align:"center",children:[t.jsx(_,{level:5,style:{margin:0,color:"#1890ff"},children:"Custom Styled Title"}),t.jsx(H,{color:"green",children:"NEW"})]}),tooltip:"This demonstrates using a custom React node as title"},parameters:{docs:{description:{story:"Using a custom React node as title instead of a simple string."}}}},l={name:"LongTitle",args:{title:"Very Long Board Item Title That Might Wrap to Multiple Lines",tooltip:"Long titles will wrap appropriately while maintaining proper alignment",extra:t.jsx(e,{size:"small",children:"Action"})},parameters:{docs:{description:{story:"Example with a long title that demonstrates text wrapping behavior."}}}},p={name:"CustomStyling",args:{title:"Styled Header",tooltip:"Custom background and styling",extra:t.jsx(e,{type:"primary",size:"small",children:"Custom"}),style:{backgroundColor:"#f0f8ff",borderRadius:8,padding:16,border:"1px solid #d9d9d9"}},parameters:{docs:{description:{story:"Example with custom styling applied to the header container."}}}},c={name:"MultipleActions",args:{title:"Management Dashboard",tooltip:"Comprehensive view of system resources and controls",extra:t.jsxs(o,{gap:"xs",align:"center",children:[t.jsx(e,{size:"small",children:"Export"}),t.jsx(e,{size:"small",children:"Filter"}),t.jsx(e,{type:"primary",size:"small",children:"Create New"})]})},parameters:{docs:{description:{story:"Header with multiple action buttons in the extra area."}}}};var g,h,x;s.parameters={...s.parameters,docs:{...(g=s.parameters)==null?void 0:g.docs,source:{originalSource:`{
  name: 'Basic',
  args: {
    title: 'Board Item Title'
  },
  parameters: {
    docs: {
      description: {
        story: 'Basic usage with just a title.'
      }
    }
  }
}`,...(x=(h=s.parameters)==null?void 0:h.docs)==null?void 0:x.source}}};var y,B,I;r.parameters={...r.parameters,docs:{...(y=r.parameters)==null?void 0:y.docs,source:{originalSource:`{
  name: 'WithTooltip',
  args: {
    title: 'Resource Usage',
    tooltip: 'This shows the current resource utilization of your compute sessions.'
  },
  parameters: {
    docs: {
      description: {
        story: 'Title with a helpful tooltip that appears when hovering over the question mark icon.'
      }
    }
  }
}`,...(I=(B=r.parameters)==null?void 0:B.docs)==null?void 0:I.source}}};var A,T,f;a.parameters={...a.parameters,docs:{...(A=a.parameters)==null?void 0:A.docs,source:{originalSource:`{
  name: 'WithExtraContent',
  args: {
    title: 'Session Overview',
    extra: <BAIButton type="primary" size="small">
        Refresh
      </BAIButton>
  },
  parameters: {
    docs: {
      description: {
        story: 'Title with extra content like buttons or controls in the right side.'
      }
    }
  }
}`,...(f=(T=a.parameters)==null?void 0:T.docs)==null?void 0:f.source}}};var w,C,j;i.parameters={...i.parameters,docs:{...(w=i.parameters)==null?void 0:w.docs,source:{originalSource:`{
  name: 'Complete',
  args: {
    title: 'Compute Sessions',
    tooltip: 'Active compute sessions in your environment',
    extra: <BAIFlex gap="xs" align="center">
        <BAITag color="blue">12 Active</BAITag>
        <BAIButton type="text" size="small" icon={<RotateCw size="1em" />} />
        <BAIButton type="text" size="small" icon={<Settings size="1em" />} />
      </BAIFlex>
  },
  parameters: {
    docs: {
      description: {
        story: 'Complete example with title, tooltip, and complex extra content including tags and action buttons.'
      }
    }
  }
}`,...(j=(C=i.parameters)==null?void 0:C.docs)==null?void 0:j.source}}};var b,S,v;n.parameters={...n.parameters,docs:{...(b=n.parameters)==null?void 0:b.docs,source:{originalSource:`{
  name: 'CustomTitleNode',
  args: {
    title: <BAIFlex gap="xs" align="center">
        <Heading level={5} style={{
        margin: 0,
        color: '#1890ff'
      }}>
          Custom Styled Title
        </Heading>
        <BAITag color="green">NEW</BAITag>
      </BAIFlex>,
    tooltip: 'This demonstrates using a custom React node as title'
  },
  parameters: {
    docs: {
      description: {
        story: 'Using a custom React node as title instead of a simple string.'
      }
    }
  }
}`,...(v=(S=n.parameters)==null?void 0:S.docs)==null?void 0:v.source}}};var z,E,k;l.parameters={...l.parameters,docs:{...(z=l.parameters)==null?void 0:z.docs,source:{originalSource:`{
  name: 'LongTitle',
  args: {
    title: 'Very Long Board Item Title That Might Wrap to Multiple Lines',
    tooltip: 'Long titles will wrap appropriately while maintaining proper alignment',
    extra: <BAIButton size="small">Action</BAIButton>
  },
  parameters: {
    docs: {
      description: {
        story: 'Example with a long title that demonstrates text wrapping behavior.'
      }
    }
  }
}`,...(k=(E=l.parameters)==null?void 0:E.docs)==null?void 0:k.source}}};var R,W,L;p.parameters={...p.parameters,docs:{...(R=p.parameters)==null?void 0:R.docs,source:{originalSource:`{
  name: 'CustomStyling',
  args: {
    title: 'Styled Header',
    tooltip: 'Custom background and styling',
    extra: <BAIButton type="primary" size="small">
        Custom
      </BAIButton>,
    style: {
      backgroundColor: '#f0f8ff',
      borderRadius: 8,
      padding: 16,
      border: '1px solid #d9d9d9'
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Example with custom styling applied to the header container.'
      }
    }
  }
}`,...(L=(W=p.parameters)==null?void 0:W.docs)==null?void 0:L.source}}};var M,F,N;c.parameters={...c.parameters,docs:{...(M=c.parameters)==null?void 0:M.docs,source:{originalSource:`{
  name: 'MultipleActions',
  args: {
    title: 'Management Dashboard',
    tooltip: 'Comprehensive view of system resources and controls',
    extra: <BAIFlex gap="xs" align="center">
        <BAIButton size="small">Export</BAIButton>
        <BAIButton size="small">Filter</BAIButton>
        <BAIButton type="primary" size="small">
          Create New
        </BAIButton>
      </BAIFlex>
  },
  parameters: {
    docs: {
      description: {
        story: 'Header with multiple action buttons in the extra area.'
      }
    }
  }
}`,...(N=(F=c.parameters)==null?void 0:F.docs)==null?void 0:N.source}}};const mt=["Default","WithTooltip","WithExtra","WithTooltipAndExtra","CustomTitle","LongTitle","CustomStyles","MultipleActions"];export{p as CustomStyles,n as CustomTitle,s as Default,l as LongTitle,c as MultipleActions,a as WithExtra,r as WithTooltip,i as WithTooltipAndExtra,mt as __namedExportsOrder,ct as default};
