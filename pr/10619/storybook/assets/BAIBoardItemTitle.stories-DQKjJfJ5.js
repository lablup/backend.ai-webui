import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-MKhVqBIO.js";import{n,t as r}from"./rotate-cw-C85JqMGf.js";import{n as i,t as a}from"./settings-pat8VyH-.js";import{L as o,R as s}from"./iframe-C68hoPP6.js";import{n as c,t as l}from"./BAIFlex-DnaoYTJ1.js";import{n as u,t as d}from"./BAIBoardItemTitle-BHuE-dqg.js";import{n as f,t as p}from"./BAIButton-QMIh_HHM.js";import{n as m,t as h}from"./Token-bV6-kskP.js";var g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H;function U(){return(U=e((()=>{u(),f(),c(),s(),m(),i(),n(),g=t(),N={title:`Board/BAIBoardItemTitle`,component:d,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:`BAIBoardItemTitle is the title row of a board item; inside a BAIBoard item it renders into the row the board pads. It provides a consistent layout with a title, optional tooltip, and extra content area.`}}},argTypes:{title:{description:`The main title content - can be a string or React node`,control:{type:`text`}},tooltip:{description:`Optional tooltip content that appears on hover of the question mark icon`,control:{type:`text`}},extra:{description:`Additional content displayed on the right side of the header`,control:!1},style:{description:`Custom CSS styles for the header container`,control:!1}}},P={name:`Basic`,args:{title:`Board Item Title`},parameters:{docs:{description:{story:`Basic usage with just a title.`}}}},F={name:`WithTooltip`,args:{title:`Resource Usage`,tooltip:`This shows the current resource utilization of your compute sessions.`},parameters:{docs:{description:{story:`Title with a helpful tooltip that appears when hovering over the question mark icon.`}}}},I={name:`WithExtraContent`,args:{title:`Session Overview`,extra:(0,g.jsx)(p,{type:`primary`,size:`small`,children:`Refresh`})},parameters:{docs:{description:{story:`Title with extra content like buttons or controls in the right side.`}}}},L={name:`Complete`,args:{title:`Compute Sessions`,tooltip:`Active compute sessions in your environment`,extra:(0,g.jsxs)(l,{gap:`xs`,align:`center`,children:[(0,g.jsx)(h,{color:`blue`,label:`12 Active`}),(0,g.jsx)(p,{type:`text`,size:`small`,icon:(0,g.jsx)(r,{size:`1em`})}),(0,g.jsx)(p,{type:`text`,size:`small`,icon:(0,g.jsx)(a,{size:`1em`})})]})},parameters:{docs:{description:{story:`Complete example with title, tooltip, and complex extra content including tags and action buttons.`}}}},R={name:`CustomTitleNode`,args:{title:(0,g.jsxs)(l,{gap:`xs`,align:`center`,children:[(0,g.jsx)(o,{level:5,style:{margin:0,color:`#1890ff`},children:`Custom Styled Title`}),(0,g.jsx)(h,{color:`green`,label:`NEW`})]}),tooltip:`This demonstrates using a custom React node as title`},parameters:{docs:{description:{story:`Using a custom React node as title instead of a simple string.`}}}},z={name:`LongTitle`,args:{title:`Very Long Board Item Title That Might Wrap to Multiple Lines`,tooltip:`Long titles will wrap appropriately while maintaining proper alignment`,extra:(0,g.jsx)(p,{size:`small`,children:`Action`})},parameters:{docs:{description:{story:`Example with a long title that demonstrates text wrapping behavior.`}}}},B={name:`CustomStyling`,args:{title:`Styled Header`,tooltip:`Custom background and styling`,extra:(0,g.jsx)(p,{type:`primary`,size:`small`,children:`Custom`}),style:{backgroundColor:`#f0f8ff`,borderRadius:8,padding:16,border:`1px solid #d9d9d9`}},parameters:{docs:{description:{story:`Example with custom styling applied to the header container.`}}}},V={name:`MultipleActions`,args:{title:`Management Dashboard`,tooltip:`Comprehensive view of system resources and controls`,extra:(0,g.jsxs)(l,{gap:`xs`,align:`center`,children:[(0,g.jsx)(p,{size:`small`,children:`Export`}),(0,g.jsx)(p,{size:`small`,children:`Filter`}),(0,g.jsx)(p,{type:`primary`,size:`small`,children:`Create New`})]})},parameters:{docs:{description:{story:`Header with multiple action buttons in the extra area.`}}}},P.parameters={...P.parameters,docs:{...(_=P.parameters)==null?void 0:_.docs,source:{originalSource:`{
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
}`,...(v=P.parameters)==null||(v=v.docs)==null?void 0:v.source}}},F.parameters={...F.parameters,docs:{...(y=F.parameters)==null?void 0:y.docs,source:{originalSource:`{
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
}`,...(b=F.parameters)==null||(b=b.docs)==null?void 0:b.source}}},I.parameters={...I.parameters,docs:{...(x=I.parameters)==null?void 0:x.docs,source:{originalSource:`{
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
}`,...(S=I.parameters)==null||(S=S.docs)==null?void 0:S.source}}},L.parameters={...L.parameters,docs:{...(C=L.parameters)==null?void 0:C.docs,source:{originalSource:`{
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
}`,...(w=L.parameters)==null||(w=w.docs)==null?void 0:w.source}}},R.parameters={...R.parameters,docs:{...(T=R.parameters)==null?void 0:T.docs,source:{originalSource:`{
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
}`,...(E=R.parameters)==null||(E=E.docs)==null?void 0:E.source}}},z.parameters={...z.parameters,docs:{...(D=z.parameters)==null?void 0:D.docs,source:{originalSource:`{
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
}`,...(O=z.parameters)==null||(O=O.docs)==null?void 0:O.source}}},B.parameters={...B.parameters,docs:{...(k=B.parameters)==null?void 0:k.docs,source:{originalSource:`{
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
}`,...(A=B.parameters)==null||(A=A.docs)==null?void 0:A.source}}},V.parameters={...V.parameters,docs:{...(j=V.parameters)==null?void 0:j.docs,source:{originalSource:`{
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
}`,...(M=V.parameters)==null||(M=M.docs)==null?void 0:M.source}}},H=[`Default`,`WithTooltip`,`WithExtra`,`WithTooltipAndExtra`,`CustomTitle`,`LongTitle`,`CustomStyles`,`MultipleActions`]})))()}U();export{B as CustomStyles,R as CustomTitle,P as Default,z as LongTitle,V as MultipleActions,I as WithExtra,F as WithTooltip,L as WithTooltipAndExtra,H as __namedExportsOrder,N as default};