import{j as t,H as F}from"./iframe-01fhjPyd.js";import{B as H}from"./BAIBoardItemTitle-Ram_HtMn.js";import{B as e}from"./BAIButton-ComhCko-.js";import{B as c}from"./BAIFlex-Dl99qG6M.js";import{T as M}from"./Token-C9U5TDF7.js";import{R as N}from"./rotate-cw-B2CP4deT.js";import{S as D}from"./settings-BoPHccXL.js";import"./preload-helper-Dp1pzeXC.js";import"./IconWithTooltip2-CmBdTkgk.js";import"./astryxLabel-CNaaC5Y2.js";import"./useInteractiveRole-poV3BebU.js";import"./composeEventHandlers-BolWE7qY.js";const Z={title:"Board/BAIBoardItemTitle",component:H,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:"BAIBoardItemTitle is a sticky header component designed for board items. It provides a consistent layout with a title, optional tooltip, and extra content area."}}},argTypes:{title:{description:"The main title content - can be a string or React node",control:{type:"text"}},tooltip:{description:"Optional tooltip content that appears on hover of the question mark icon",control:{type:"text"}},extra:{description:"Additional content displayed on the right side of the header",control:!1},style:{description:"Custom CSS styles for the header container",control:!1}}},o={name:"Basic",args:{title:"Board Item Title"},parameters:{docs:{description:{story:"Basic usage with just a title."}}}},s={name:"WithTooltip",args:{title:"Resource Usage",tooltip:"This shows the current resource utilization of your compute sessions."},parameters:{docs:{description:{story:"Title with a helpful tooltip that appears when hovering over the question mark icon."}}}},r={name:"WithExtraContent",args:{title:"Session Overview",extra:t.jsx(e,{type:"primary",size:"small",children:"Refresh"})},parameters:{docs:{description:{story:"Title with extra content like buttons or controls in the right side."}}}},a={name:"Complete",args:{title:"Compute Sessions",tooltip:"Active compute sessions in your environment",extra:t.jsxs(c,{gap:"xs",align:"center",children:[t.jsx(M,{color:"blue",label:"12 Active"}),t.jsx(e,{type:"text",size:"small",icon:t.jsx(N,{size:"1em"})}),t.jsx(e,{type:"text",size:"small",icon:t.jsx(D,{size:"1em"})})]})},parameters:{docs:{description:{story:"Complete example with title, tooltip, and complex extra content including tags and action buttons."}}}},i={name:"CustomTitleNode",args:{title:t.jsxs(c,{gap:"xs",align:"center",children:[t.jsx(F,{level:5,style:{margin:0,color:"#1890ff"},children:"Custom Styled Title"}),t.jsx(M,{color:"green",label:"NEW"})]}),tooltip:"This demonstrates using a custom React node as title"},parameters:{docs:{description:{story:"Using a custom React node as title instead of a simple string."}}}},n={name:"LongTitle",args:{title:"Very Long Board Item Title That Might Wrap to Multiple Lines",tooltip:"Long titles will wrap appropriately while maintaining proper alignment",extra:t.jsx(e,{size:"small",children:"Action"})},parameters:{docs:{description:{story:"Example with a long title that demonstrates text wrapping behavior."}}}},l={name:"CustomStyling",args:{title:"Styled Header",tooltip:"Custom background and styling",extra:t.jsx(e,{type:"primary",size:"small",children:"Custom"}),style:{backgroundColor:"#f0f8ff",borderRadius:8,padding:16,border:"1px solid #d9d9d9"}},parameters:{docs:{description:{story:"Example with custom styling applied to the header container."}}}},p={name:"MultipleActions",args:{title:"Management Dashboard",tooltip:"Comprehensive view of system resources and controls",extra:t.jsxs(c,{gap:"xs",align:"center",children:[t.jsx(e,{size:"small",children:"Export"}),t.jsx(e,{size:"small",children:"Filter"}),t.jsx(e,{type:"primary",size:"small",children:"Create New"})]})},parameters:{docs:{description:{story:"Header with multiple action buttons in the extra area."}}}};var m,d,u;o.parameters={...o.parameters,docs:{...(m=o.parameters)==null?void 0:m.docs,source:{originalSource:`{
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
}`,...(u=(d=o.parameters)==null?void 0:d.docs)==null?void 0:u.source}}};var g,h,x;s.parameters={...s.parameters,docs:{...(g=s.parameters)==null?void 0:g.docs,source:{originalSource:`{
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
}`,...(x=(h=s.parameters)==null?void 0:h.docs)==null?void 0:x.source}}};var y,B,T;r.parameters={...r.parameters,docs:{...(y=r.parameters)==null?void 0:y.docs,source:{originalSource:`{
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
}`,...(T=(B=r.parameters)==null?void 0:B.docs)==null?void 0:T.source}}};var f,A,w;a.parameters={...a.parameters,docs:{...(f=a.parameters)==null?void 0:f.docs,source:{originalSource:`{
  name: 'Complete',
  args: {
    title: 'Compute Sessions',
    tooltip: 'Active compute sessions in your environment',
    extra: <BAIFlex gap="xs" align="center">
        <Token color="blue" label="12 Active" />
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
}`,...(w=(A=a.parameters)==null?void 0:A.docs)==null?void 0:w.source}}};var I,C,b;i.parameters={...i.parameters,docs:{...(I=i.parameters)==null?void 0:I.docs,source:{originalSource:`{
  name: 'CustomTitleNode',
  args: {
    title: <BAIFlex gap="xs" align="center">
        <Heading level={5} style={{
        margin: 0,
        color: '#1890ff'
      }}>
          Custom Styled Title
        </Heading>
        <Token color="green" label="NEW" />
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
}`,...(b=(C=i.parameters)==null?void 0:C.docs)==null?void 0:b.source}}};var S,v,z;n.parameters={...n.parameters,docs:{...(S=n.parameters)==null?void 0:S.docs,source:{originalSource:`{
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
}`,...(z=(v=n.parameters)==null?void 0:v.docs)==null?void 0:z.source}}};var j,E,R;l.parameters={...l.parameters,docs:{...(j=l.parameters)==null?void 0:j.docs,source:{originalSource:`{
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
}`,...(R=(E=l.parameters)==null?void 0:E.docs)==null?void 0:R.source}}};var W,k,L;p.parameters={...p.parameters,docs:{...(W=p.parameters)==null?void 0:W.docs,source:{originalSource:`{
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
}`,...(L=(k=p.parameters)==null?void 0:k.docs)==null?void 0:L.source}}};const $=["Default","WithTooltip","WithExtra","WithTooltipAndExtra","CustomTitle","LongTitle","CustomStyles","MultipleActions"];export{l as CustomStyles,i as CustomTitle,o as Default,n as LongTitle,p as MultipleActions,r as WithExtra,s as WithTooltip,a as WithTooltipAndExtra,$ as __namedExportsOrder,Z as default};
