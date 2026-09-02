import{j as e,R as z}from"./iframe-eSaJPZVV.js";import{B as i}from"./BAICard-CEdtwNB8.js";import{B as r}from"./BAIFlex-H112MK2R.js";import{B as t}from"./BAITextHighlighter-ByzZB-Dc.js";import{T as P}from"./TextInput-BnCozYaH.js";import"./preload-helper-Dp1pzeXC.js";import"./astryxLabel-VMAuq5ql.js";import"./BAIButton-C410TTSd.js";import"./BAITabList-d-IqqyLa.js";import"./useDevWarning-Dj3uY-I8.js";import"./useListFocus-CmrC-1Ym.js";import"./isRtlElement-B2-7SF8s.js";import"./rtlStyles-T4i24HtE.js";import"./VStack-BO9f073I.js";import"./Divider-B1MBNzNh.js";import"./isEmpty-VUFcS9Nt.js";import"./toString-mthJK0ac.js";import"./isSymbol-BXKDi34p.js";import"./InputGroupContext-NfMMR3b1.js";import"./useResolvedRequired-BD_GR8LJ.js";import"./useInputStatusIcon-C9x9GuKW.js";import"./InputClearButton-Cz502NBp.js";const ie={title:"Text/BAITextHighlighter",component:t,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:`
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
        `}}},argTypes:{children:{control:{type:"text"},description:"The text content to search within",table:{type:{summary:"string | null"}}},keyword:{control:{type:"text"},description:"The keyword to highlight (case-insensitive)",table:{type:{summary:"string"}}},style:{control:{type:"object"},description:"Custom styles for highlighted portions",table:{type:{summary:"React.CSSProperties"}}}}},o={name:"Basic",args:{children:"This is a sample text with some highlighted content.",keyword:"sample"}},a={render:()=>e.jsx(r,{direction:"column",gap:"md",children:e.jsx(i,{size:"small",title:"Different case variations",styles:{body:{paddingTop:0}},children:e.jsxs(r,{direction:"column",gap:"sm",children:[e.jsx(t,{keyword:"backend",children:"Backend.AI is a powerful platform"}),e.jsx(t,{keyword:"backend",children:"BACKEND.AI provides resource management"}),e.jsx(t,{keyword:"backend",children:"The backend infrastructure is robust"})]})})}),parameters:{docs:{description:{story:"Keyword matching is case-insensitive, highlighting all variations regardless of capitalization."}}}},n={render:()=>e.jsxs(r,{direction:"column",gap:"md",children:[e.jsx(i,{size:"small",title:"Multiple matches in single text",styles:{body:{paddingTop:0}},children:e.jsx(t,{keyword:"test",children:"This is a test. Testing is important. We need to test everything. Tests ensure quality."})}),e.jsx(i,{size:"small",title:"Long text with multiple matches",styles:{body:{paddingTop:0}},children:e.jsx(t,{keyword:"api",children:"The Backend.AI API provides a comprehensive set of endpoints. You can use the API to manage sessions, access the API documentation, and integrate API calls into your application."})})]}),parameters:{docs:{description:{story:"All occurrences of the keyword are highlighted within the text."}}}},l={render:()=>e.jsx(r,{direction:"column",gap:"md",children:e.jsx(i,{size:"small",title:"Regex special characters are safely escaped",styles:{body:{paddingTop:0}},children:e.jsxs(r,{direction:"column",gap:"sm",children:[e.jsx(t,{keyword:"[test]",children:"Array notation: items[test] = value"}),e.jsx(t,{keyword:"file.txt",children:"Dot in filename: config/file.txt is loaded"}),e.jsx(t,{keyword:"$var",children:"Dollar sign: Use $var for variable substitution"}),e.jsx(t,{keyword:"(a+b)",children:"Parentheses and plus: Calculate (a+b) * c"})]})})}),parameters:{docs:{description:{story:"Special regex characters ([ ] . $ ( ) + * ? ^ etc.) are automatically escaped, preventing regex errors and ensuring accurate matching."}}}},d={render:()=>e.jsxs(r,{direction:"column",gap:"md",children:[e.jsx(i,{size:"small",title:"Custom highlight color",styles:{body:{paddingTop:0}},children:e.jsx(t,{keyword:"custom",style:{backgroundColor:"#52c41a"},children:"This text has custom green highlighting for the word custom."})}),e.jsx(i,{size:"small",title:"Custom styling with other properties",styles:{body:{paddingTop:0}},children:e.jsx(t,{keyword:"styled",style:{backgroundColor:"#1890ff",color:"white",padding:"2px 4px",borderRadius:"4px",fontWeight:"bold"},children:"This text has a styled highlight with multiple properties applied."})}),e.jsx(i,{size:"small",title:"Underlined highlight",styles:{body:{paddingTop:0}},children:e.jsx(t,{keyword:"important",style:{backgroundColor:"transparent",borderBottom:"2px solid #f5222d",fontWeight:"bold"},children:"This is an important message with underlined highlighting."})})]}),parameters:{docs:{description:{story:"The `style` prop allows custom styling for highlighted text, overriding the default theme-based background color."}}}},c={render:()=>{const[g,F]=z.useState("backend"),R=["Backend.AI WebUI","Backend.AI Manager","Backend.AI Agent","Frontend Components","API Documentation","Backend Infrastructure"];return e.jsxs(r,{direction:"column",gap:"lg",style:{width:"100%"},children:[e.jsx(i,{title:"Search Filter",size:"small",style:{maxWidth:400},styles:{body:{paddingTop:0}},children:e.jsxs(r,{direction:"column",gap:"sm",children:[e.jsx(P,{label:"Search",isLabelHidden:!0,placeholder:"Search...",value:g,onChange:F,hasClear:!0}),e.jsx(r,{direction:"column",gap:"xs",children:R.map((s,h)=>e.jsx("div",{children:e.jsx(t,{keyword:g,children:s})},h))})]})}),e.jsx(i,{title:"Log Entry Highlighting",size:"small",styles:{body:{paddingTop:0}},children:e.jsxs(r,{direction:"column",gap:"xs",children:[e.jsx(t,{keyword:"error",style:{backgroundColor:"#ff4d4f",color:"white"},children:"[2024-01-15 10:23:45] ERROR: Connection failed to database"}),e.jsx(t,{keyword:"error",style:{backgroundColor:"#ff4d4f",color:"white"},children:"[2024-01-15 10:24:12] INFO: Retrying connection"}),e.jsx(t,{keyword:"error",style:{backgroundColor:"#ff4d4f",color:"white"},children:"[2024-01-15 10:24:15] ERROR: Max retries exceeded"})]})}),e.jsx(i,{title:"User Search in Table",size:"small",styles:{body:{paddingTop:0}},children:e.jsx(r,{direction:"column",gap:"sm",children:[{name:"John Smith",email:"john.smith@example.com"},{name:"Jane Johnson",email:"jane.johnson@example.com"},{name:"Bob Jones",email:"bob.jones@example.com"}].map((s,h)=>e.jsxs("div",{children:[e.jsx(t,{keyword:"john",children:s.name})," - ",e.jsx(t,{keyword:"john",children:s.email})]},h))})})]})},parameters:{docs:{description:{story:"Interactive examples showing BAITextHighlighter in real-world scenarios: search filtering, log highlighting, and user search in tables."}}}};var p,m,x;o.parameters={...o.parameters,docs:{...(p=o.parameters)==null?void 0:p.docs,source:{originalSource:`{
  name: 'Basic',
  args: {
    children: 'This is a sample text with some highlighted content.',
    keyword: 'sample'
  }
}`,...(x=(m=o.parameters)==null?void 0:m.docs)==null?void 0:x.source}}};var y,u,I;a.parameters={...a.parameters,docs:{...(y=a.parameters)==null?void 0:y.docs,source:{originalSource:`{
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
}`,...(I=(u=a.parameters)==null?void 0:u.docs)==null?void 0:I.source}}};var A,B,T;n.parameters={...n.parameters,docs:{...(A=n.parameters)==null?void 0:A.docs,source:{originalSource:`{
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
}`,...(T=(B=n.parameters)==null?void 0:B.docs)==null?void 0:T.source}}};var w,b,k;l.parameters={...l.parameters,docs:{...(w=l.parameters)==null?void 0:w.docs,source:{originalSource:`{
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
}`,...(k=(b=l.parameters)==null?void 0:b.docs)==null?void 0:k.source}}};var f,C,j;d.parameters={...d.parameters,docs:{...(f=d.parameters)==null?void 0:f.docs,source:{originalSource:`{
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
}`,...(j=(C=d.parameters)==null?void 0:C.docs)==null?void 0:j.source}}};var H,v,S;c.parameters={...c.parameters,docs:{...(H=c.parameters)==null?void 0:H.docs,source:{originalSource:`{
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
            <TextInput label="Search" isLabelHidden placeholder="Search..." value={searchKeyword} onChange={setSearchKeyword} hasClear />
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
}`,...(S=(v=c.parameters)==null?void 0:v.docs)==null?void 0:S.source}}};const se=["Default","CaseInsensitiveMatching","MultipleOccurrences","SpecialCharacters","CustomStyling","InteractiveSearch"];export{a as CaseInsensitiveMatching,d as CustomStyling,o as Default,c as InteractiveSearch,n as MultipleOccurrences,l as SpecialCharacters,se as __namedExportsOrder,ie as default};
