import{n as e}from"./rolldown-runtime-2s6bX4vc.js";import{n as t,t as n}from"./BAIFlex-CAz1t6J5.js";import{n as r,t as i}from"./BAITextInput-CqmhWReo.js";import{n as a,t as o}from"./BAICard-W1ezccn9.js";import{n as s,t as c}from"./BAITextHighlighter-zW4Nzx0i.js";import l from"react";import{jsx as u,jsxs as d}from"react/jsx-runtime";var f,p,m,h,g,_,v,y;function b(){return(b=e((()=>{a(),t(),s(),r(),f={title:`Text/BAITextHighlighter`,component:c,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:`
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
        `}}},argTypes:{children:{control:{type:`text`},description:`The text content to search within`,table:{type:{summary:`string | null`}}},keyword:{control:{type:`text`},description:`The keyword to highlight (case-insensitive)`,table:{type:{summary:`string`}}},style:{control:{type:`object`},description:`Custom styles for highlighted portions`,table:{type:{summary:`React.CSSProperties`}}}}},p={name:`Basic`,args:{children:`This is a sample text with some highlighted content.`,keyword:`sample`}},m={render:()=>u(n,{direction:`column`,gap:`md`,children:u(o,{size:`small`,title:`Different case variations`,styles:{body:{paddingTop:0}},children:d(n,{direction:`column`,gap:`sm`,children:[u(c,{keyword:`backend`,children:`Backend.AI is a powerful platform`}),u(c,{keyword:`backend`,children:`BACKEND.AI provides resource management`}),u(c,{keyword:`backend`,children:`The backend infrastructure is robust`})]})})}),parameters:{docs:{description:{story:`Keyword matching is case-insensitive, highlighting all variations regardless of capitalization.`}}}},h={render:()=>d(n,{direction:`column`,gap:`md`,children:[u(o,{size:`small`,title:`Multiple matches in single text`,styles:{body:{paddingTop:0}},children:u(c,{keyword:`test`,children:`This is a test. Testing is important. We need to test everything. Tests ensure quality.`})}),u(o,{size:`small`,title:`Long text with multiple matches`,styles:{body:{paddingTop:0}},children:u(c,{keyword:`api`,children:`The Backend.AI API provides a comprehensive set of endpoints. You can use the API to manage sessions, access the API documentation, and integrate API calls into your application.`})})]}),parameters:{docs:{description:{story:`All occurrences of the keyword are highlighted within the text.`}}}},g={render:()=>u(n,{direction:`column`,gap:`md`,children:u(o,{size:`small`,title:`Regex special characters are safely escaped`,styles:{body:{paddingTop:0}},children:d(n,{direction:`column`,gap:`sm`,children:[u(c,{keyword:`[test]`,children:`Array notation: items[test] = value`}),u(c,{keyword:`file.txt`,children:`Dot in filename: config/file.txt is loaded`}),u(c,{keyword:`$var`,children:`Dollar sign: Use $var for variable substitution`}),u(c,{keyword:`(a+b)`,children:`Parentheses and plus: Calculate (a+b) * c`})]})})}),parameters:{docs:{description:{story:`Special regex characters ([ ] . $ ( ) + * ? ^ etc.) are automatically escaped, preventing regex errors and ensuring accurate matching.`}}}},_={render:()=>d(n,{direction:`column`,gap:`md`,children:[u(o,{size:`small`,title:`Custom highlight color`,styles:{body:{paddingTop:0}},children:u(c,{keyword:`custom`,style:{backgroundColor:`#52c41a`},children:`This text has custom green highlighting for the word custom.`})}),u(o,{size:`small`,title:`Custom styling with other properties`,styles:{body:{paddingTop:0}},children:u(c,{keyword:`styled`,style:{backgroundColor:`#1890ff`,color:`white`,padding:`2px 4px`,borderRadius:`4px`,fontWeight:`bold`},children:`This text has a styled highlight with multiple properties applied.`})}),u(o,{size:`small`,title:`Underlined highlight`,styles:{body:{paddingTop:0}},children:u(c,{keyword:`important`,style:{backgroundColor:`transparent`,borderBottom:`2px solid #f5222d`,fontWeight:`bold`},children:`This is an important message with underlined highlighting.`})})]}),parameters:{docs:{description:{story:"The `style` prop allows custom styling for highlighted text, overriding the default theme-based background color."}}}},v={render:()=>{let[e,t]=l.useState(`backend`);return d(n,{direction:`column`,gap:`lg`,style:{width:`100%`},children:[u(o,{title:`Search Filter`,size:`small`,style:{maxWidth:400},styles:{body:{paddingTop:0}},children:d(n,{direction:`column`,gap:`sm`,children:[u(i,{"aria-label":`Search`,placeholder:`Search...`,value:e,onChange:t,hasClear:!0}),u(n,{direction:`column`,gap:`xs`,children:[`Backend.AI WebUI`,`Backend.AI Manager`,`Backend.AI Agent`,`Frontend Components`,`API Documentation`,`Backend Infrastructure`].map((t,n)=>u(`div`,{children:u(c,{keyword:e,children:t})},n))})]})}),u(o,{title:`Log Entry Highlighting`,size:`small`,styles:{body:{paddingTop:0}},children:d(n,{direction:`column`,gap:`xs`,children:[u(c,{keyword:`error`,style:{backgroundColor:`#ff4d4f`,color:`white`},children:`[2024-01-15 10:23:45] ERROR: Connection failed to database`}),u(c,{keyword:`error`,style:{backgroundColor:`#ff4d4f`,color:`white`},children:`[2024-01-15 10:24:12] INFO: Retrying connection`}),u(c,{keyword:`error`,style:{backgroundColor:`#ff4d4f`,color:`white`},children:`[2024-01-15 10:24:15] ERROR: Max retries exceeded`})]})}),u(o,{title:`User Search in Table`,size:`small`,styles:{body:{paddingTop:0}},children:u(n,{direction:`column`,gap:`sm`,children:[{name:`John Smith`,email:`john.smith@example.com`},{name:`Jane Johnson`,email:`jane.johnson@example.com`},{name:`Bob Jones`,email:`bob.jones@example.com`}].map((e,t)=>d(`div`,{children:[u(c,{keyword:`john`,children:e.name}),` - `,u(c,{keyword:`john`,children:e.email})]},t))})})]})},parameters:{docs:{description:{story:`Interactive examples showing BAITextHighlighter in real-world scenarios: search filtering, log highlighting, and user search in tables.`}}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  name: 'Basic',
  args: {
    children: 'This is a sample text with some highlighted content.',
    keyword: 'sample'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source}}},y=[`Default`,`CaseInsensitiveMatching`,`MultipleOccurrences`,`SpecialCharacters`,`CustomStyling`,`InteractiveSearch`]})))()}b();export{m as CaseInsensitiveMatching,_ as CustomStyling,p as Default,v as InteractiveSearch,h as MultipleOccurrences,g as SpecialCharacters,y as __namedExportsOrder,f as default};