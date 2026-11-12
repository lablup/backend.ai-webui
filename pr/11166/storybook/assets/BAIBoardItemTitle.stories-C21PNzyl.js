import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-MKhVqBIO.js";import{n,t as r}from"./createLucideIcon-DF5UGKo-.js";import{n as i,t as a}from"./rotate-cw-C85JqMGf.js";import{J as o,q as s}from"./iframe-ilgmLqIN.js";import{n as c,t as l}from"./BAIFlex-DnaoYTJ1.js";import{n as u,t as d}from"./BAIBoardItemTitle-DXQTrJSw.js";import{n as f,t as p}from"./BAIButton-jxwmvSSd.js";import{n as m,t as h}from"./Token-rmm0akVf.js";var g,_;function v(){return(v=e((()=>{n(),g=[[`path`,{d:`M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915`,key:`1i5ecw`}],[`circle`,{cx:`12`,cy:`12`,r:`3`,key:`1v7zrd`}]],_=r(`settings`,g)})))()}var y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G;function K(){return(K=e((()=>{u(),f(),c(),o(),m(),v(),i(),y=t(),I={title:`Board/BAIBoardItemTitle`,component:d,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:`BAIBoardItemTitle is the title row of a board item; inside a BAIBoard item it renders into the row the board pads. It provides a consistent layout with a title, optional tooltip, and extra content area.`}}},argTypes:{title:{description:`The main title content - can be a string or React node`,control:{type:`text`}},tooltip:{description:`Optional tooltip content that appears on hover of the question mark icon`,control:{type:`text`}},extra:{description:`Additional content displayed on the right side of the header`,control:!1},style:{description:`Custom CSS styles for the header container`,control:!1}}},L={name:`Basic`,args:{title:`Board Item Title`},parameters:{docs:{description:{story:`Basic usage with just a title.`}}}},R={name:`WithTooltip`,args:{title:`Resource Usage`,tooltip:`This shows the current resource utilization of your compute sessions.`},parameters:{docs:{description:{story:`Title with a helpful tooltip that appears when hovering over the question mark icon.`}}}},z={name:`WithExtraContent`,args:{title:`Session Overview`,extra:(0,y.jsx)(p,{type:`primary`,size:`small`,children:`Refresh`})},parameters:{docs:{description:{story:`Title with extra content like buttons or controls in the right side.`}}}},B={name:`Complete`,args:{title:`Compute Sessions`,tooltip:`Active compute sessions in your environment`,extra:(0,y.jsxs)(l,{gap:`xs`,align:`center`,children:[(0,y.jsx)(h,{color:`blue`,label:`12 Active`}),(0,y.jsx)(p,{type:`text`,size:`small`,icon:(0,y.jsx)(a,{size:`1em`})}),(0,y.jsx)(p,{type:`text`,size:`small`,icon:(0,y.jsx)(_,{size:`1em`})})]})},parameters:{docs:{description:{story:`Complete example with title, tooltip, and complex extra content including tags and action buttons.`}}}},V={name:`CustomTitleNode`,args:{title:(0,y.jsxs)(l,{gap:`xs`,align:`center`,children:[(0,y.jsx)(s,{level:5,style:{margin:0,color:`#1890ff`},children:`Custom Styled Title`}),(0,y.jsx)(h,{color:`green`,label:`NEW`})]}),tooltip:`This demonstrates using a custom React node as title`},parameters:{docs:{description:{story:`Using a custom React node as title instead of a simple string.`}}}},H={name:`LongTitle`,args:{title:`Very Long Board Item Title That Might Wrap to Multiple Lines`,tooltip:`Long titles will wrap appropriately while maintaining proper alignment`,extra:(0,y.jsx)(p,{size:`small`,children:`Action`})},parameters:{docs:{description:{story:`Example with a long title that demonstrates text wrapping behavior.`}}}},U={name:`CustomStyling`,args:{title:`Styled Header`,tooltip:`Custom background and styling`,extra:(0,y.jsx)(p,{type:`primary`,size:`small`,children:`Custom`}),style:{backgroundColor:`#f0f8ff`,borderRadius:8,padding:16,border:`1px solid #d9d9d9`}},parameters:{docs:{description:{story:`Example with custom styling applied to the header container.`}}}},W={name:`MultipleActions`,args:{title:`Management Dashboard`,tooltip:`Comprehensive view of system resources and controls`,extra:(0,y.jsxs)(l,{gap:`xs`,align:`center`,children:[(0,y.jsx)(p,{size:`small`,children:`Export`}),(0,y.jsx)(p,{size:`small`,children:`Filter`}),(0,y.jsx)(p,{type:`primary`,size:`small`,children:`Create New`})]})},parameters:{docs:{description:{story:`Header with multiple action buttons in the extra area.`}}}},L.parameters={...L.parameters,docs:{...(b=L.parameters)==null?void 0:b.docs,source:{originalSource:`{
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
}`,...(x=L.parameters)==null||(x=x.docs)==null?void 0:x.source}}},R.parameters={...R.parameters,docs:{...(S=R.parameters)==null?void 0:S.docs,source:{originalSource:`{
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
}`,...(C=R.parameters)==null||(C=C.docs)==null?void 0:C.source}}},z.parameters={...z.parameters,docs:{...(w=z.parameters)==null?void 0:w.docs,source:{originalSource:`{
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
}`,...(T=z.parameters)==null||(T=T.docs)==null?void 0:T.source}}},B.parameters={...B.parameters,docs:{...(E=B.parameters)==null?void 0:E.docs,source:{originalSource:`{
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
}`,...(D=B.parameters)==null||(D=D.docs)==null?void 0:D.source}}},V.parameters={...V.parameters,docs:{...(O=V.parameters)==null?void 0:O.docs,source:{originalSource:`{
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
}`,...(k=V.parameters)==null||(k=k.docs)==null?void 0:k.source}}},H.parameters={...H.parameters,docs:{...(A=H.parameters)==null?void 0:A.docs,source:{originalSource:`{
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
}`,...(j=H.parameters)==null||(j=j.docs)==null?void 0:j.source}}},U.parameters={...U.parameters,docs:{...(M=U.parameters)==null?void 0:M.docs,source:{originalSource:`{
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
}`,...(N=U.parameters)==null||(N=N.docs)==null?void 0:N.source}}},W.parameters={...W.parameters,docs:{...(P=W.parameters)==null?void 0:P.docs,source:{originalSource:`{
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
}`,...(F=W.parameters)==null||(F=F.docs)==null?void 0:F.source}}},G=[`Default`,`WithTooltip`,`WithExtra`,`WithTooltipAndExtra`,`CustomTitle`,`LongTitle`,`CustomStyles`,`MultipleActions`]})))()}K();export{U as CustomStyles,V as CustomTitle,L as Default,H as LongTitle,W as MultipleActions,z as WithExtra,R as WithTooltip,B as WithTooltipAndExtra,G as __namedExportsOrder,I as default};