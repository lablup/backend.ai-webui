import{n as e}from"./rolldown-runtime-2s6bX4vc.js";import{n as t,t as n}from"./createLucideIcon-CRb7bAU8.js";import{n as r,t as i}from"./rotate-cw-DZW3Oyb2.js";import{n as a,t as o}from"./BAIFlex-CAz1t6J5.js";import{n as s,t as c}from"./BAIBoardItemTitle-B4n7-Vw5.js";import{n as l,t as u}from"./BAIButton-C-o5ANgR.js";import{jsx as d,jsxs as f}from"react/jsx-runtime";import{Heading as p}from"@lablup/ui-common/Text";import{Token as m}from"@lablup/ui-common/Token";var h,g;function _(){return(_=e((()=>{t(),h=[[`path`,{d:`M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915`,key:`1i5ecw`}],[`circle`,{cx:`12`,cy:`12`,r:`3`,key:`1v7zrd`}]],g=n(`settings`,h)})))()}var v,y,b,x,S,C,w,T,E,D;function O(){return(O=e((()=>{s(),l(),a(),_(),r(),v={title:`Board/BAIBoardItemTitle`,component:c,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:`BAIBoardItemTitle is a sticky header component designed for board items. It provides a consistent layout with a title, optional tooltip, and extra content area.`}}},argTypes:{title:{description:`The main title content - can be a string or React node`,control:{type:`text`}},tooltip:{description:`Optional tooltip content that appears on hover of the question mark icon`,control:{type:`text`}},extra:{description:`Additional content displayed on the right side of the header`,control:!1},style:{description:`Custom CSS styles for the header container`,control:!1}}},y={name:`Basic`,args:{title:`Board Item Title`},parameters:{docs:{description:{story:`Basic usage with just a title.`}}}},b={name:`WithTooltip`,args:{title:`Resource Usage`,tooltip:`This shows the current resource utilization of your compute sessions.`},parameters:{docs:{description:{story:`Title with a helpful tooltip that appears when hovering over the question mark icon.`}}}},x={name:`WithExtraContent`,args:{title:`Session Overview`,extra:d(u,{type:`primary`,size:`small`,children:`Refresh`})},parameters:{docs:{description:{story:`Title with extra content like buttons or controls in the right side.`}}}},S={name:`Complete`,args:{title:`Compute Sessions`,tooltip:`Active compute sessions in your environment`,extra:f(o,{gap:`xs`,align:`center`,children:[d(m,{color:`blue`,label:`12 Active`}),d(u,{type:`text`,size:`small`,icon:d(i,{size:`1em`})}),d(u,{type:`text`,size:`small`,icon:d(g,{size:`1em`})})]})},parameters:{docs:{description:{story:`Complete example with title, tooltip, and complex extra content including tags and action buttons.`}}}},C={name:`CustomTitleNode`,args:{title:f(o,{gap:`xs`,align:`center`,children:[d(p,{level:5,style:{margin:0,color:`#1890ff`},children:`Custom Styled Title`}),d(m,{color:`green`,label:`NEW`})]}),tooltip:`This demonstrates using a custom React node as title`},parameters:{docs:{description:{story:`Using a custom React node as title instead of a simple string.`}}}},w={name:`LongTitle`,args:{title:`Very Long Board Item Title That Might Wrap to Multiple Lines`,tooltip:`Long titles will wrap appropriately while maintaining proper alignment`,extra:d(u,{size:`small`,children:`Action`})},parameters:{docs:{description:{story:`Example with a long title that demonstrates text wrapping behavior.`}}}},T={name:`CustomStyling`,args:{title:`Styled Header`,tooltip:`Custom background and styling`,extra:d(u,{type:`primary`,size:`small`,children:`Custom`}),style:{backgroundColor:`#f0f8ff`,borderRadius:8,padding:16,border:`1px solid #d9d9d9`}},parameters:{docs:{description:{story:`Example with custom styling applied to the header container.`}}}},E={name:`MultipleActions`,args:{title:`Management Dashboard`,tooltip:`Comprehensive view of system resources and controls`,extra:f(o,{gap:`xs`,align:`center`,children:[d(u,{size:`small`,children:`Export`}),d(u,{size:`small`,children:`Filter`}),d(u,{type:`primary`,size:`small`,children:`Create New`})]})},parameters:{docs:{description:{story:`Header with multiple action buttons in the extra area.`}}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
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
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
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
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
}`,...E.parameters?.docs?.source}}},D=[`Default`,`WithTooltip`,`WithExtra`,`WithTooltipAndExtra`,`CustomTitle`,`LongTitle`,`CustomStyles`,`MultipleActions`]})))()}O();export{T as CustomStyles,C as CustomTitle,y as Default,w as LongTitle,E as MultipleActions,x as WithExtra,b as WithTooltip,S as WithTooltipAndExtra,D as __namedExportsOrder,v as default};