import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-MKhVqBIO.js";import{n,t as r}from"./rotate-cw-Bxfdgw4U.js";import{n as i,t as a}from"./settings-BrG1sqAV.js";import{L as o,R as s}from"./iframe-DHcqzLLD.js";import{n as c,t as l}from"./BAIFlex-BOFoS5KY.js";import{n as u,t as d}from"./BAIBoardItemTitle-Bb-5hIc4.js";import{n as f,t as p}from"./BAIButton-BkLrwIfz.js";import{n as m,t as h}from"./Token-GN1sUHwR.js";var g,_,v,y,b,x,S,C,w,T,E;function D(){return(D=e((()=>{u(),f(),c(),s(),m(),i(),n(),g=t(),_={title:`Board/BAIBoardItemTitle`,component:d,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:`BAIBoardItemTitle is a sticky header component designed for board items. It provides a consistent layout with a title, optional tooltip, and extra content area.`}}},argTypes:{title:{description:`The main title content - can be a string or React node`,control:{type:`text`}},tooltip:{description:`Optional tooltip content that appears on hover of the question mark icon`,control:{type:`text`}},extra:{description:`Additional content displayed on the right side of the header`,control:!1},style:{description:`Custom CSS styles for the header container`,control:!1}}},v={name:`Basic`,args:{title:`Board Item Title`},parameters:{docs:{description:{story:`Basic usage with just a title.`}}}},y={name:`WithTooltip`,args:{title:`Resource Usage`,tooltip:`This shows the current resource utilization of your compute sessions.`},parameters:{docs:{description:{story:`Title with a helpful tooltip that appears when hovering over the question mark icon.`}}}},b={name:`WithExtraContent`,args:{title:`Session Overview`,extra:(0,g.jsx)(p,{type:`primary`,size:`small`,children:`Refresh`})},parameters:{docs:{description:{story:`Title with extra content like buttons or controls in the right side.`}}}},x={name:`Complete`,args:{title:`Compute Sessions`,tooltip:`Active compute sessions in your environment`,extra:(0,g.jsxs)(l,{gap:`xs`,align:`center`,children:[(0,g.jsx)(h,{color:`blue`,label:`12 Active`}),(0,g.jsx)(p,{type:`text`,size:`small`,icon:(0,g.jsx)(r,{size:`1em`})}),(0,g.jsx)(p,{type:`text`,size:`small`,icon:(0,g.jsx)(a,{size:`1em`})})]})},parameters:{docs:{description:{story:`Complete example with title, tooltip, and complex extra content including tags and action buttons.`}}}},S={name:`CustomTitleNode`,args:{title:(0,g.jsxs)(l,{gap:`xs`,align:`center`,children:[(0,g.jsx)(o,{level:5,style:{margin:0,color:`#1890ff`},children:`Custom Styled Title`}),(0,g.jsx)(h,{color:`green`,label:`NEW`})]}),tooltip:`This demonstrates using a custom React node as title`},parameters:{docs:{description:{story:`Using a custom React node as title instead of a simple string.`}}}},C={name:`LongTitle`,args:{title:`Very Long Board Item Title That Might Wrap to Multiple Lines`,tooltip:`Long titles will wrap appropriately while maintaining proper alignment`,extra:(0,g.jsx)(p,{size:`small`,children:`Action`})},parameters:{docs:{description:{story:`Example with a long title that demonstrates text wrapping behavior.`}}}},w={name:`CustomStyling`,args:{title:`Styled Header`,tooltip:`Custom background and styling`,extra:(0,g.jsx)(p,{type:`primary`,size:`small`,children:`Custom`}),style:{backgroundColor:`#f0f8ff`,borderRadius:8,padding:16,border:`1px solid #d9d9d9`}},parameters:{docs:{description:{story:`Example with custom styling applied to the header container.`}}}},T={name:`MultipleActions`,args:{title:`Management Dashboard`,tooltip:`Comprehensive view of system resources and controls`,extra:(0,g.jsxs)(l,{gap:`xs`,align:`center`,children:[(0,g.jsx)(p,{size:`small`,children:`Export`}),(0,g.jsx)(p,{size:`small`,children:`Filter`}),(0,g.jsx)(p,{type:`primary`,size:`small`,children:`Create New`})]})},parameters:{docs:{description:{story:`Header with multiple action buttons in the extra area.`}}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
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
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
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
}`,...T.parameters?.docs?.source}}},E=[`Default`,`WithTooltip`,`WithExtra`,`WithTooltipAndExtra`,`CustomTitle`,`LongTitle`,`CustomStyles`,`MultipleActions`]})))()}D();export{w as CustomStyles,S as CustomTitle,v as Default,C as LongTitle,T as MultipleActions,b as WithExtra,y as WithTooltip,x as WithTooltipAndExtra,E as __namedExportsOrder,_ as default};