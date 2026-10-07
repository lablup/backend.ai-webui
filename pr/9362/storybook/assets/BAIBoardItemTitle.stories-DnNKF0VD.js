import{j as e,aI as u,a0 as _,U as G,a6 as J}from"./iframe-Cuq_zpGA.js";import{i as K}from"./IconWithTooltip2-jbvkvGKP.js";import{B as t}from"./BAIButton-Bk66W9na.js";import{B as g}from"./BAIFlex-ClpR9U-l.js";import{T as U}from"./Token-DWti1R--.js";import{R as P}from"./rotate-cw-BnwE5Ly2.js";import{S as X}from"./settings-BunfaGPr.js";import"./preload-helper-Dp1pzeXC.js";import"./astryxLabel-CXVjtRlp.js";import"./useInteractiveRole-CDMTUDS8.js";import"./composeEventHandlers-BolWE7qY.js";function D({title:o,tooltip:s,tooltipIcon:d,endContent:q,className:V,...Q}){return e.jsxs(u,{gap:2,align:"center",justify:"between",wrap:"wrap",className:["uic-board-item-title",V].filter(Boolean).join(" "),...Q,children:[e.jsxs(u,{gap:2,align:"center",wrap:"wrap",className:"uic-board-item-title__group",children:[typeof o=="string"?e.jsx(_,{level:5,children:o}):o,s?e.jsx(K,{icon:d??e.jsx(G,{icon:"info"}),content:s}):null]}),e.jsx(u,{gap:2,align:"center",justify:"end",className:"uic-board-item-title__group uic-board-item-title__end",children:q})]})}D.displayName="BoardItemTitle";const O=({extra:o,tooltipIcon:s=e.jsx(J,{size:"1em"}),...d})=>{"use memo";return e.jsx(D,{...d,tooltipIcon:s,endContent:o})};O.displayName="BAIBoardItemTitle";const le={title:"Board/BAIBoardItemTitle",component:O,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:"BAIBoardItemTitle is a sticky header component designed for board items. It provides a consistent layout with a title, optional tooltip, and extra content area."}}},argTypes:{title:{description:"The main title content - can be a string or React node",control:{type:"text"}},tooltip:{description:"Optional tooltip content that appears on hover of the question mark icon",control:{type:"text"}},extra:{description:"Additional content displayed on the right side of the header",control:!1},style:{description:"Custom CSS styles for the header container",control:!1}}},r={name:"Basic",args:{title:"Board Item Title"},parameters:{docs:{description:{story:"Basic usage with just a title."}}}},a={name:"WithTooltip",args:{title:"Resource Usage",tooltip:"This shows the current resource utilization of your compute sessions."},parameters:{docs:{description:{story:"Title with a helpful tooltip that appears when hovering over the question mark icon."}}}},i={name:"WithExtraContent",args:{title:"Session Overview",extra:e.jsx(t,{type:"primary",size:"small",children:"Refresh"})},parameters:{docs:{description:{story:"Title with extra content like buttons or controls in the right side."}}}},n={name:"Complete",args:{title:"Compute Sessions",tooltip:"Active compute sessions in your environment",extra:e.jsxs(g,{gap:"xs",align:"center",children:[e.jsx(U,{color:"blue",label:"12 Active"}),e.jsx(t,{type:"text",size:"small",icon:e.jsx(P,{size:"1em"})}),e.jsx(t,{type:"text",size:"small",icon:e.jsx(X,{size:"1em"})})]})},parameters:{docs:{description:{story:"Complete example with title, tooltip, and complex extra content including tags and action buttons."}}}},l={name:"CustomTitleNode",args:{title:e.jsxs(g,{gap:"xs",align:"center",children:[e.jsx(_,{level:5,style:{margin:0,color:"#1890ff"},children:"Custom Styled Title"}),e.jsx(U,{color:"green",label:"NEW"})]}),tooltip:"This demonstrates using a custom React node as title"},parameters:{docs:{description:{story:"Using a custom React node as title instead of a simple string."}}}},c={name:"LongTitle",args:{title:"Very Long Board Item Title That Might Wrap to Multiple Lines",tooltip:"Long titles will wrap appropriately while maintaining proper alignment",extra:e.jsx(t,{size:"small",children:"Action"})},parameters:{docs:{description:{story:"Example with a long title that demonstrates text wrapping behavior."}}}},p={name:"CustomStyling",args:{title:"Styled Header",tooltip:"Custom background and styling",extra:e.jsx(t,{type:"primary",size:"small",children:"Custom"}),style:{backgroundColor:"#f0f8ff",borderRadius:8,padding:16,border:"1px solid #d9d9d9"}},parameters:{docs:{description:{story:"Example with custom styling applied to the header container."}}}},m={name:"MultipleActions",args:{title:"Management Dashboard",tooltip:"Comprehensive view of system resources and controls",extra:e.jsxs(g,{gap:"xs",align:"center",children:[e.jsx(t,{size:"small",children:"Export"}),e.jsx(t,{size:"small",children:"Filter"}),e.jsx(t,{type:"primary",size:"small",children:"Create New"})]})},parameters:{docs:{description:{story:"Header with multiple action buttons in the extra area."}}}};var h,x,y;r.parameters={...r.parameters,docs:{...(h=r.parameters)==null?void 0:h.docs,source:{originalSource:`{
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
}`,...(y=(x=r.parameters)==null?void 0:x.docs)==null?void 0:y.source}}};var B,f,T;a.parameters={...a.parameters,docs:{...(B=a.parameters)==null?void 0:B.docs,source:{originalSource:`{
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
}`,...(T=(f=a.parameters)==null?void 0:f.docs)==null?void 0:T.source}}};var w,A,I;i.parameters={...i.parameters,docs:{...(w=i.parameters)==null?void 0:w.docs,source:{originalSource:`{
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
}`,...(I=(A=i.parameters)==null?void 0:A.docs)==null?void 0:I.source}}};var C,b,j;n.parameters={...n.parameters,docs:{...(C=n.parameters)==null?void 0:C.docs,source:{originalSource:`{
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
}`,...(j=(b=n.parameters)==null?void 0:b.docs)==null?void 0:j.source}}};var S,v,z;l.parameters={...l.parameters,docs:{...(S=l.parameters)==null?void 0:S.docs,source:{originalSource:`{
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
}`,...(z=(v=l.parameters)==null?void 0:v.docs)==null?void 0:z.source}}};var E,k,R;c.parameters={...c.parameters,docs:{...(E=c.parameters)==null?void 0:E.docs,source:{originalSource:`{
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
}`,...(R=(k=c.parameters)==null?void 0:k.docs)==null?void 0:R.source}}};var W,N,M;p.parameters={...p.parameters,docs:{...(W=p.parameters)==null?void 0:W.docs,source:{originalSource:`{
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
}`,...(M=(N=p.parameters)==null?void 0:N.docs)==null?void 0:M.source}}};var L,F,H;m.parameters={...m.parameters,docs:{...(L=m.parameters)==null?void 0:L.docs,source:{originalSource:`{
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
}`,...(H=(F=m.parameters)==null?void 0:F.docs)==null?void 0:H.source}}};const ce=["Default","WithTooltip","WithExtra","WithTooltipAndExtra","CustomTitle","LongTitle","CustomStyles","MultipleActions"];export{p as CustomStyles,l as CustomTitle,r as Default,c as LongTitle,m as MultipleActions,i as WithExtra,a as WithTooltip,n as WithTooltipAndExtra,ce as __namedExportsOrder,le as default};
