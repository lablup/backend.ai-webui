import{a as e,n as t}from"./rolldown-runtime-sJBDdmOt.js";import{t as n}from"./react-D0Ex1IVc.js";import{t as r}from"./jsx-runtime-MKhVqBIO.js";import{n as i,t as a}from"./BAICard-Bvkw7IfW.js";import{n as o,t as s}from"./BAIFlex-BOFoS5KY.js";import{n as c,t as l}from"./TextInput-DpAx1LFf.js";import{n as u,t as d}from"./BAITextHighlighter-Caiga3gF.js";var f,p,m,h,g,_,v,y,b,x;function S(){return(S=t((()=>{i(),o(),u(),c(),f=e(n(),1),p=r(),m={title:`Text/BAITextHighlighter`,component:d,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:`
**BAITextHighlighter** is a text highlighting component that performs case-insensitive keyword matching.

## Features
- Case-insensitive keyword search and highlighting
- Uses theme token (\`colorWarningHover\`) for consistent highlighting
- Handles empty/null children gracefully
- Safely handles special regex characters in keywords
- Custom styling support for highlighted text

## Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`children\` | \`string or null\` | - | The text content to search within |
| \`keyword\` | \`string\` | - | The keyword to highlight (case-insensitive) |
| \`style\` | \`React.CSSProperties\` | - | Custom styles for highlighted portions |
        `}}},argTypes:{children:{control:{type:`text`},description:`The text content to search within`,table:{type:{summary:`string | null`}}},keyword:{control:{type:`text`},description:`The keyword to highlight (case-insensitive)`,table:{type:{summary:`string`}}},style:{control:{type:`object`},description:`Custom styles for highlighted portions`,table:{type:{summary:`React.CSSProperties`}}}}},h={name:`Basic`,args:{children:`This is a sample text with some highlighted content.`,keyword:`sample`}},g={render:()=>(0,p.jsx)(s,{direction:`column`,gap:`md`,children:(0,p.jsx)(a,{size:`small`,title:`Different case variations`,styles:{body:{paddingTop:0}},children:(0,p.jsxs)(s,{direction:`column`,gap:`sm`,children:[(0,p.jsx)(d,{keyword:`backend`,children:`Backend.AI is a powerful platform`}),(0,p.jsx)(d,{keyword:`backend`,children:`BACKEND.AI provides resource management`}),(0,p.jsx)(d,{keyword:`backend`,children:`The backend infrastructure is robust`})]})})}),parameters:{docs:{description:{story:`Keyword matching is case-insensitive, highlighting all variations regardless of capitalization.`}}}},_={render:()=>(0,p.jsxs)(s,{direction:`column`,gap:`md`,children:[(0,p.jsx)(a,{size:`small`,title:`Multiple matches in single text`,styles:{body:{paddingTop:0}},children:(0,p.jsx)(d,{keyword:`test`,children:`This is a test. Testing is important. We need to test everything. Tests ensure quality.`})}),(0,p.jsx)(a,{size:`small`,title:`Long text with multiple matches`,styles:{body:{paddingTop:0}},children:(0,p.jsx)(d,{keyword:`api`,children:`The Backend.AI API provides a comprehensive set of endpoints. You can use the API to manage sessions, access the API documentation, and integrate API calls into your application.`})})]}),parameters:{docs:{description:{story:`All occurrences of the keyword are highlighted within the text.`}}}},v={render:()=>(0,p.jsx)(s,{direction:`column`,gap:`md`,children:(0,p.jsx)(a,{size:`small`,title:`Regex special characters are safely escaped`,styles:{body:{paddingTop:0}},children:(0,p.jsxs)(s,{direction:`column`,gap:`sm`,children:[(0,p.jsx)(d,{keyword:`[test]`,children:`Array notation: items[test] = value`}),(0,p.jsx)(d,{keyword:`file.txt`,children:`Dot in filename: config/file.txt is loaded`}),(0,p.jsx)(d,{keyword:`$var`,children:`Dollar sign: Use $var for variable substitution`}),(0,p.jsx)(d,{keyword:`(a+b)`,children:`Parentheses and plus: Calculate (a+b) * c`})]})})}),parameters:{docs:{description:{story:`Special regex characters ([ ] . $ ( ) + * ? ^ etc.) are automatically escaped, preventing regex errors and ensuring accurate matching.`}}}},y={render:()=>(0,p.jsxs)(s,{direction:`column`,gap:`md`,children:[(0,p.jsx)(a,{size:`small`,title:`Custom highlight color`,styles:{body:{paddingTop:0}},children:(0,p.jsx)(d,{keyword:`custom`,style:{backgroundColor:`#52c41a`},children:`This text has custom green highlighting for the word custom.`})}),(0,p.jsx)(a,{size:`small`,title:`Custom styling with other properties`,styles:{body:{paddingTop:0}},children:(0,p.jsx)(d,{keyword:`styled`,style:{backgroundColor:`#1890ff`,color:`white`,padding:`2px 4px`,borderRadius:`4px`,fontWeight:`bold`},children:`This text has a styled highlight with multiple properties applied.`})}),(0,p.jsx)(a,{size:`small`,title:`Underlined highlight`,styles:{body:{paddingTop:0}},children:(0,p.jsx)(d,{keyword:`important`,style:{backgroundColor:`transparent`,borderBottom:`2px solid #f5222d`,fontWeight:`bold`},children:`This is an important message with underlined highlighting.`})})]}),parameters:{docs:{description:{story:"The `style` prop allows custom styling for highlighted text, overriding the default theme-based background color."}}}},b={render:()=>{let[e,t]=f.useState(`backend`);return(0,p.jsxs)(s,{direction:`column`,gap:`lg`,style:{width:`100%`},children:[(0,p.jsx)(a,{title:`Search Filter`,size:`small`,style:{maxWidth:400},styles:{body:{paddingTop:0}},children:(0,p.jsxs)(s,{direction:`column`,gap:`sm`,children:[(0,p.jsx)(l,{"aria-label":`Search`,placeholder:`Search...`,value:e,onChange:t,hasClear:!0}),(0,p.jsx)(s,{direction:`column`,gap:`xs`,children:[`Backend.AI WebUI`,`Backend.AI Manager`,`Backend.AI Agent`,`Frontend Components`,`API Documentation`,`Backend Infrastructure`].map((t,n)=>(0,p.jsx)(`div`,{children:(0,p.jsx)(d,{keyword:e,children:t})},n))})]})}),(0,p.jsx)(a,{title:`Log Entry Highlighting`,size:`small`,styles:{body:{paddingTop:0}},children:(0,p.jsxs)(s,{direction:`column`,gap:`xs`,children:[(0,p.jsx)(d,{keyword:`error`,style:{backgroundColor:`#ff4d4f`,color:`white`},children:`[2024-01-15 10:23:45] ERROR: Connection failed to database`}),(0,p.jsx)(d,{keyword:`error`,style:{backgroundColor:`#ff4d4f`,color:`white`},children:`[2024-01-15 10:24:12] INFO: Retrying connection`}),(0,p.jsx)(d,{keyword:`error`,style:{backgroundColor:`#ff4d4f`,color:`white`},children:`[2024-01-15 10:24:15] ERROR: Max retries exceeded`})]})}),(0,p.jsx)(a,{title:`User Search in Table`,size:`small`,styles:{body:{paddingTop:0}},children:(0,p.jsx)(s,{direction:`column`,gap:`sm`,children:[{name:`John Smith`,email:`john.smith@example.com`},{name:`Jane Johnson`,email:`jane.johnson@example.com`},{name:`Bob Jones`,email:`bob.jones@example.com`}].map((e,t)=>(0,p.jsxs)(`div`,{children:[(0,p.jsx)(d,{keyword:`john`,children:e.name}),` - `,(0,p.jsx)(d,{keyword:`john`,children:e.email})]},t))})})]})},parameters:{docs:{description:{story:`Interactive examples showing BAITextHighlighter in real-world scenarios: search filtering, log highlighting, and user search in tables.`}}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  name: 'Basic',
  args: {
    children: 'This is a sample text with some highlighted content.',
    keyword: 'sample'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <BAIFlex direction="column" gap="md">
      <BAICard size="small" title="Different case variations" styles={{
      body: {
        paddingTop: 0
      }
    }}>
        <BAIFlex direction="column" gap="sm">
          <BAITextHighlighter keyword="backend">
            Backend.AI is a powerful platform
          </BAITextHighlighter>
          <BAITextHighlighter keyword="backend">
            BACKEND.AI provides resource management
          </BAITextHighlighter>
          <BAITextHighlighter keyword="backend">
            The backend infrastructure is robust
          </BAITextHighlighter>
        </BAIFlex>
      </BAICard>
    </BAIFlex>,
  parameters: {
    docs: {
      description: {
        story: 'Keyword matching is case-insensitive, highlighting all variations regardless of capitalization.'
      }
    }
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => <BAIFlex direction="column" gap="md">
      <BAICard size="small" title="Multiple matches in single text" styles={{
      body: {
        paddingTop: 0
      }
    }}>
        <BAITextHighlighter keyword="test">
          This is a test. Testing is important. We need to test everything.
          Tests ensure quality.
        </BAITextHighlighter>
      </BAICard>
      <BAICard size="small" title="Long text with multiple matches" styles={{
      body: {
        paddingTop: 0
      }
    }}>
        <BAITextHighlighter keyword="api">
          The Backend.AI API provides a comprehensive set of endpoints. You can
          use the API to manage sessions, access the API documentation, and
          integrate API calls into your application.
        </BAITextHighlighter>
      </BAICard>
    </BAIFlex>,
  parameters: {
    docs: {
      description: {
        story: 'All occurrences of the keyword are highlighted within the text.'
      }
    }
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => <BAIFlex direction="column" gap="md">
      <BAICard size="small" title="Regex special characters are safely escaped" styles={{
      body: {
        paddingTop: 0
      }
    }}>
        <BAIFlex direction="column" gap="sm">
          <BAITextHighlighter keyword="[test]">
            Array notation: items[test] = value
          </BAITextHighlighter>
          <BAITextHighlighter keyword="file.txt">
            Dot in filename: config/file.txt is loaded
          </BAITextHighlighter>
          <BAITextHighlighter keyword="$var">
            Dollar sign: Use $var for variable substitution
          </BAITextHighlighter>
          <BAITextHighlighter keyword="(a+b)">
            Parentheses and plus: Calculate (a+b) * c
          </BAITextHighlighter>
        </BAIFlex>
      </BAICard>
    </BAIFlex>,
  parameters: {
    docs: {
      description: {
        story: 'Special regex characters ([ ] . $ ( ) + * ? ^ etc.) are automatically escaped, preventing regex errors and ensuring accurate matching.'
      }
    }
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => <BAIFlex direction="column" gap="md">
      <BAICard size="small" title="Custom highlight color" styles={{
      body: {
        paddingTop: 0
      }
    }}>
        <BAITextHighlighter keyword="custom" style={{
        backgroundColor: '#52c41a'
      }}>
          This text has custom green highlighting for the word custom.
        </BAITextHighlighter>
      </BAICard>
      <BAICard size="small" title="Custom styling with other properties" styles={{
      body: {
        paddingTop: 0
      }
    }}>
        <BAITextHighlighter keyword="styled" style={{
        backgroundColor: '#1890ff',
        color: 'white',
        padding: '2px 4px',
        borderRadius: '4px',
        fontWeight: 'bold'
      }}>
          This text has a styled highlight with multiple properties applied.
        </BAITextHighlighter>
      </BAICard>
      <BAICard size="small" title="Underlined highlight" styles={{
      body: {
        paddingTop: 0
      }
    }}>
        <BAITextHighlighter keyword="important" style={{
        backgroundColor: 'transparent',
        borderBottom: '2px solid #f5222d',
        fontWeight: 'bold'
      }}>
          This is an important message with underlined highlighting.
        </BAITextHighlighter>
      </BAICard>
    </BAIFlex>,
  parameters: {
    docs: {
      description: {
        story: 'The \`style\` prop allows custom styling for highlighted text, overriding the default theme-based background color.'
      }
    }
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [searchKeyword, setSearchKeyword] = React.useState('backend');
    const items = ['Backend.AI WebUI', 'Backend.AI Manager', 'Backend.AI Agent', 'Frontend Components', 'API Documentation', 'Backend Infrastructure'];
    return <BAIFlex direction="column" gap="lg" style={{
      width: '100%'
    }}>
        <BAICard title="Search Filter" size="small" style={{
        maxWidth: 400
      }} styles={{
        body: {
          paddingTop: 0
        }
      }}>
          <BAIFlex direction="column" gap="sm">
            <BAITextInput aria-label="Search" placeholder="Search..." value={searchKeyword} onChange={setSearchKeyword} hasClear />
            <BAIFlex direction="column" gap="xs">
              {items.map((item, index) => <div key={index}>
                  <BAITextHighlighter keyword={searchKeyword}>
                    {item}
                  </BAITextHighlighter>
                </div>)}
            </BAIFlex>
          </BAIFlex>
        </BAICard>

        <BAICard title="Log Entry Highlighting" size="small" styles={{
        body: {
          paddingTop: 0
        }
      }}>
          <BAIFlex direction="column" gap="xs">
            <BAITextHighlighter keyword="error" style={{
            backgroundColor: '#ff4d4f',
            color: 'white'
          }}>
              [2024-01-15 10:23:45] ERROR: Connection failed to database
            </BAITextHighlighter>
            <BAITextHighlighter keyword="error" style={{
            backgroundColor: '#ff4d4f',
            color: 'white'
          }}>
              [2024-01-15 10:24:12] INFO: Retrying connection
            </BAITextHighlighter>
            <BAITextHighlighter keyword="error" style={{
            backgroundColor: '#ff4d4f',
            color: 'white'
          }}>
              [2024-01-15 10:24:15] ERROR: Max retries exceeded
            </BAITextHighlighter>
          </BAIFlex>
        </BAICard>

        <BAICard title="User Search in Table" size="small" styles={{
        body: {
          paddingTop: 0
        }
      }}>
          <BAIFlex direction="column" gap="sm">
            {[{
            name: 'John Smith',
            email: 'john.smith@example.com'
          }, {
            name: 'Jane Johnson',
            email: 'jane.johnson@example.com'
          }, {
            name: 'Bob Jones',
            email: 'bob.jones@example.com'
          }].map((user, index) => <div key={index}>
                <BAITextHighlighter keyword="john">
                  {user.name}
                </BAITextHighlighter>
                {' - '}
                <BAITextHighlighter keyword="john">
                  {user.email}
                </BAITextHighlighter>
              </div>)}
          </BAIFlex>
        </BAICard>
      </BAIFlex>;
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive examples showing BAITextHighlighter in real-world scenarios: search filtering, log highlighting, and user search in tables.'
      }
    }
  }
}`,...b.parameters?.docs?.source}}},x=[`Default`,`CaseInsensitiveMatching`,`MultipleOccurrences`,`SpecialCharacters`,`CustomStyling`,`InteractiveSearch`]})))()}S();export{g as CaseInsensitiveMatching,y as CustomStyling,h as Default,b as InteractiveSearch,_ as MultipleOccurrences,v as SpecialCharacters,x as __namedExportsOrder,m as default};