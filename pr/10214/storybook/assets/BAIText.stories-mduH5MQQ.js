import{B as t,j as e,a9 as i}from"./iframe-BsGndk0J.js";import{B as s}from"./BAICard-OVlt1KdT.js";import{B as o}from"./BAIFlex-fEoUYeuG.js";import"./preload-helper-Dp1pzeXC.js";import"./astryxLabel-BNnBjsjf.js";import"./BAIButton-BcHaV1VN.js";import"./BAITabList-Cvgp8V_c.js";import"./useDevWarning-YgnNQDzO.js";import"./useListFocus-XAz7qIf3.js";import"./isRtlElement-B2-7SF8s.js";import"./rtlStyles-T4i24HtE.js";import"./VStack-B4joxEdT.js";import"./Divider-COkh6Njw.js";const fe={title:"Text/BAIText",component:t,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:"\n**BAIText** keeps the [Ant Design Typography.Text](https://ant.design/components/typography)-shaped prop surface and the antd-era structure — one inline span, which becomes an inline-flex row holding the clamp box, the tooltip and the copy control when `ellipsis` / `copyable` are set — rendered on Astryx tokens, with the tooltip on Astryx `Tooltip` and the copy control on Astryx `IconButton` + `navigator.clipboard`.\n\n## BAI-Specific Props\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `monospace` | `boolean` | `false` | Use monospace font family |\n| `ellipsis` | `boolean \\| EllipsisConfig` | `false` | Custom CSS-based ellipsis with Safari compatibility |\n\n## BAI-Specific Features\n| Feature | Description |\n|---------|-------------|\n| Monospace Font | Simple boolean prop to use monospace font family |\n| CSS-based Ellipsis | Re-implemented ellipsis using CSS with Safari compatibility |\n| Multi-line Truncation | Supports multi-line ellipsis using `-webkit-line-clamp` |\n| Tooltip Integration | Automatically shows tooltip when text is truncated |\n| Copy with Ellipsis | Copy functionality works correctly with ellipsis |\n\n## Ellipsis Config\n```typescript\ninterface EllipsisConfig {\n  rows?: number;          // Number of lines before truncation (default: 1)\n  tooltip?: boolean | TooltipProps;  // Show tooltip on hover\n}\n```\n\nFor all other props, see `BAIText.tsx` — the antd-shaped types (`BAITextEllipsisConfig`, `BAITextCopyConfig`) are declared locally. `copyable` takes antd's `[resting, copied]` tuples for `icon` and `tooltips`.\n        "}}},argTypes:{children:{control:!1,description:"The text content to display",table:{type:{summary:"ReactNode"}}},type:{control:{type:"select"},options:["secondary","success","warning","danger",void 0],description:"Text type for semantic styling",table:{type:{summary:"'secondary' | 'success' | 'warning' | 'danger'"}}},monospace:{control:{type:"boolean"},description:"Use monospace font family (BAI-specific prop for code, paths, etc.)",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},ellipsis:{control:{type:"boolean"},description:"Enable CSS-based ellipsis with Safari compatibility (BAI-specific implementation). Can be boolean or EllipsisConfig object with rows and tooltip options",table:{type:{summary:"boolean | EllipsisConfig"},defaultValue:{summary:"false"}}},copyable:{control:{type:"boolean"},description:"Enable copy-to-clipboard functionality",table:{type:{summary:"boolean | CopyConfig"},defaultValue:{summary:"false"}}},strong:{control:{type:"boolean"},description:"Bold text",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},italic:{control:{type:"boolean"},description:"Italic text",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},underline:{control:{type:"boolean"},description:"Underlined text",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},delete:{control:{type:"boolean"},description:"Strikethrough text",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},mark:{control:{type:"boolean"},description:"Highlighted/marked text with background color",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},code:{control:{type:"boolean"},description:"Inline code styling with background and border",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},keyboard:{control:{type:"boolean"},description:"Render the children as an Astryx Kbd shortcut (`+`-separated keys)",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},disabled:{control:{type:"boolean"},description:"Disabled state with reduced opacity",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}}}},r={name:"Basic",args:{children:"This is a basic text component"},parameters:{docs:{description:{story:"Basic usage of BAIText with default styling."}}}},n={name:"SemanticTypes",render:()=>e.jsxs(o,{direction:"column",children:[e.jsx(t,{children:"Default Text"}),e.jsx(t,{type:"secondary",children:"Secondary Text"}),e.jsx(t,{type:"success",children:"Success Text"}),e.jsx(t,{type:"warning",children:"Warning Text"}),e.jsx(t,{type:"danger",children:"Danger Text"})]}),parameters:{docs:{description:{story:"Different semantic text types with corresponding colors."}}}},a={name:"TextStyles",render:()=>e.jsxs(o,{direction:"column",children:[e.jsx(t,{strong:!0,children:"Strong Text"}),e.jsx(t,{italic:!0,children:"Italic Text"}),e.jsx(t,{underline:!0,children:"Underlined Text"}),e.jsx(t,{delete:!0,children:"Deleted Text"}),e.jsx(t,{strong:!0,italic:!0,underline:!0,children:"Combined Styles"})]}),parameters:{docs:{description:{story:"Various text styling options and combinations."}}}},l={name:"MonospaceFont",render:()=>e.jsxs(o,{direction:"column",children:[e.jsx(t,{children:"Regular: 1234567890 ABCDEFG"}),e.jsx(t,{monospace:!0,children:"Monospace: 1234567890 ABCDEFG"}),e.jsx(t,{monospace:!0,type:"secondary",children:"Monospace Secondary: /path/to/file.txt"}),e.jsx(t,{monospace:!0,copyable:!0,children:"npm install backend.ai-ui"})]}),parameters:{docs:{description:{story:"Monospace font styling, useful for code snippets, file paths, and technical content."}}}},c={name:"CopyableText",render:()=>e.jsxs(o,{direction:"column",children:[e.jsx(t,{copyable:!0,children:"Click icon to copy this text"}),e.jsx(t,{copyable:{text:"Custom copied text!"},children:"Copy custom text"}),e.jsx(t,{monospace:!0,copyable:!0,type:"secondary",children:"1234567890abcdef"}),e.jsx(t,{copyable:{icon:[e.jsx("span",{children:"📋"},"copy"),e.jsx("span",{children:"✅"},"copied")],tooltips:["Copy to clipboard","Copied!"]},children:"Text with custom copy icons"})]}),parameters:{docs:{description:{story:"Text with copy-to-clipboard functionality including custom icons and tooltips."}}}},d={name:"SingleLineEllipsis",render:()=>e.jsxs(o,{direction:"column",style:{width:"100%"},children:[e.jsx(s,{size:"small",style:{width:300},children:e.jsx(t,{ellipsis:{tooltip:!0},children:"This is a very long text that will be truncated with ellipsis when it exceeds the container width. Hover to see full content."})}),e.jsx(s,{size:"small",style:{width:200},children:e.jsx(t,{ellipsis:{tooltip:!0},monospace:!0,children:"/very/long/path/to/some/file/in/system.txt"})}),e.jsx(s,{size:"small",style:{width:250},children:e.jsx(t,{ellipsis:{tooltip:!0},type:"secondary",children:"user@example.com with a very long email address that overflows"})})]}),parameters:{docs:{description:{story:"Single-line ellipsis with tooltip on hover when text overflows. Uses CSS-based truncation with Safari compatibility."}}}},p={name:"MultiLineEllipsis",render:()=>e.jsxs(o,{direction:"column",style:{width:"100%"},children:[e.jsx(s,{size:"small",style:{width:400},children:e.jsx(t,{ellipsis:{rows:2,tooltip:!0},children:"This is a longer text that spans multiple lines. When it exceeds the specified number of rows, it will be truncated with ellipsis. The tooltip will show the full content when you hover over the truncated text. This demonstrates multi-line ellipsis functionality."})}),e.jsx(s,{size:"small",style:{width:300},children:e.jsx(t,{ellipsis:{rows:3,tooltip:!0},type:"secondary",children:"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."})})]}),parameters:{docs:{description:{story:"Multi-line ellipsis using -webkit-line-clamp for Safari compatibility. Tooltip appears on hover when text is truncated."}}}},m={name:"CustomTooltip",render:()=>e.jsxs(o,{direction:"column",style:{width:"100%"},children:[e.jsx(s,{size:"small",style:{width:300},children:e.jsx(t,{ellipsis:{rows:1,tooltip:{title:"Custom tooltip content"}},children:"Text with custom tooltip configuration and placement"})}),e.jsx(s,{size:"small",style:{width:250},children:e.jsx(t,{ellipsis:{rows:2,tooltip:{title:"This tooltip has custom styling"}},children:"Multi-line text with custom colored tooltip when it overflows beyond two rows"})})]}),parameters:{docs:{description:{story:"Ellipsis with custom tooltip configuration including placement and styling."}}}},u={name:"NoTooltip (Default)",render:()=>e.jsx(s,{size:"small",style:{width:300},children:e.jsx(t,{ellipsis:{rows:1},children:"This text will be truncated but no tooltip will appear on hover even when it overflows"})}),parameters:{docs:{description:{story:"Ellipsis without tooltip functionality."}}}},y={name:"InteractiveText",render:()=>e.jsxs(o,{direction:"column",children:[e.jsx(t,{copyable:!0,children:"Click the glyph to copy this line"}),e.jsx(t,{copyable:{text:"the-full-untruncated-value"},ellipsis:!0,children:"A truncated value whose copy target is the full string"})]}),parameters:{docs:{description:{story:"Interactive text. antd's `editable` inline-edit affordance is not part of the surface — no production call site used it. `copyable` is built on `IconButton` + `navigator.clipboard`; with `ellipsis`, `copyable.text` keeps the clipboard target at the full value."}}}},h={name:"KeyboardShortcuts",render:()=>e.jsxs(o,{direction:"column",gap:"md",align:"start",children:[e.jsxs("div",{children:[e.jsx(t,{type:"secondary",children:"Copy: "})," ",e.jsx(i,{keys:"mod+c"})]}),e.jsxs("div",{children:[e.jsx(t,{type:"secondary",children:"Quick open: "})," ",e.jsx(i,{keys:"mod+shift+p"})]}),e.jsxs("div",{children:[e.jsx(t,{type:"secondary",children:"A single literal key: "})," ",e.jsx(i,{keys:"]"})]}),e.jsxs("div",{children:[e.jsx(t,{type:"secondary",children:"Through the prop: "}),e.jsx(t,{keyboard:!0,children:"mod+c"})]}),e.jsx("div",{children:e.jsx(t,{keyboard:!0,copyable:!0,children:"shift+enter"})})]}),parameters:{docs:{description:{story:'Shortcut badges are Astryx `Kbd`; it takes a `keys` spec rather than children, and a key it does not know (`]`) is rendered verbatim. `BAIText keyboard` (the antd `Typography.Text keyboard` prop) hands its text to `Kbd` as that spec, so the two forms render the same badges. For `Kbd` on a DARK tooltip bubble wrap the content in `MediaTheme mode="dark"` (never the whole `Tooltip`): `useTooltip` hardcodes its bubble colours without flipping token context, and the host app pins its tooltip dark in BOTH modes via `ANTD_HOVER_PARITY`.'}}}},x={name:"CodeBlocks",render:()=>e.jsxs(o,{direction:"column",children:[e.jsx(t,{code:!0,children:'const greeting = "Hello World";'}),e.jsx(t,{code:!0,copyable:!0,children:"npm install backend.ai-ui"}),e.jsxs(t,{code:!0,type:"secondary",children:["import ","{ BAIText }"," from 'backend.ai-ui';"]}),e.jsxs("div",{children:["Run ",e.jsx(t,{code:!0,children:"pnpm run dev"})," to start development server"]})]}),parameters:{docs:{description:{story:"Inline code blocks with code styling."}}}},b={name:"HighlightedText",render:()=>e.jsxs(o,{direction:"column",children:[e.jsx(t,{mark:!0,children:"Highlighted text"}),e.jsx(t,{mark:!0,type:"danger",children:"Important highlighted warning"}),e.jsxs("div",{children:["This is a ",e.jsx(t,{mark:!0,children:"highlighted"})," word in a sentence."]})]}),parameters:{docs:{description:{story:"Text with highlight/mark styling."}}}},T={name:"DisabledState",render:()=>e.jsxs(o,{direction:"column",children:[e.jsx(t,{disabled:!0,children:"Disabled text"}),e.jsx(t,{disabled:!0,type:"secondary",children:"Disabled secondary text"}),e.jsx(t,{disabled:!0,copyable:!0,children:"Disabled with copyable (copyable still works)"})]}),parameters:{docs:{description:{story:"Text in disabled state with reduced opacity."}}}},A={name:"RealWorldUsage",render:()=>e.jsxs(o,{direction:"column",style:{width:"100%"},gap:"lg",children:[e.jsx(s,{title:"File Path",size:"small",style:{width:400},children:e.jsx(t,{monospace:!0,ellipsis:{tooltip:!0},copyable:!0,children:"/home/user/projects/backend.ai-webui/react/src/components/AgentStats.tsx"})}),e.jsxs(s,{title:"API Key",size:"small",style:{width:450},children:[e.jsx(t,{monospace:!0,type:"secondary",copyable:!0,children:"1234567890abcdefghijklmnopqrstuvwxyz"}),e.jsx("br",{}),e.jsx(t,{type:"secondary",children:"Access Token with Ellipsis: "}),e.jsx(t,{code:!0,copyable:!0,ellipsis:{tooltip:!0},children:"1234567890abcdefghijklmnopqrstuvwxyz_very_long_token_string"})]}),e.jsx(s,{title:"Error Message",size:"small",style:{width:450},children:e.jsx(t,{type:"danger",ellipsis:{rows:2,tooltip:!0},children:"Failed to load resource: net::ERR_CONNECTION_REFUSED at https://example.com/api/v1/endpoint. Please check your network connection and try again."})}),e.jsx(s,{title:"User Email",size:"small",style:{width:300},children:e.jsx(t,{ellipsis:{tooltip:!0},copyable:!0,children:"user.with.very.long.name@company.example.com"})}),e.jsx(s,{title:"Description",size:"small",style:{width:350},children:e.jsx(t,{type:"secondary",ellipsis:{rows:3,tooltip:!0},children:"This is a sample description that might be quite long and needs to be truncated to maintain a clean UI. The full content will be available in a tooltip when users hover over the truncated text. This provides a good balance between information density and usability."})}),e.jsxs(s,{title:"Command & Keyboard",size:"small",style:{width:200},children:[e.jsx(t,{type:"secondary",children:"To copy the command: "}),e.jsx(i,{keys:"mod+c"}),e.jsx("br",{}),e.jsx(t,{code:!0,copyable:!0,children:"git clone repository.git"}),e.jsx("br",{}),e.jsx(t,{type:"secondary",children:"Quick Open: "}),e.jsx(i,{keys:"mod+shift+p"})]}),e.jsxs(s,{title:"Status Update",size:"small",style:{width:400},children:[e.jsx(t,{strong:!0,mark:!0,type:"warning",children:"Action Required:"}),e.jsx("br",{}),e.jsx(t,{children:"Your subscription expires in 3 days."})]}),e.jsxs(s,{title:"Version Info",size:"small",style:{width:400},children:[e.jsx(t,{delete:!0,type:"secondary",children:"Old version: 1.0.0"}),e.jsx("br",{}),e.jsx(t,{strong:!0,type:"success",children:"Current version: 2.0.0"})]}),e.jsxs(s,{title:"Deprecation Notice",size:"small",style:{width:450},children:[e.jsx(t,{type:"warning",strong:!0,children:"⚠️ Deprecated:"})," ",e.jsx(t,{code:!0,delete:!0,children:"oldFunction()"}),e.jsx(t,{type:"secondary",children:" → Use "}),e.jsx(t,{code:!0,type:"success",children:"newFunction()"}),e.jsx(t,{type:"secondary",children:" instead"})]}),e.jsx(s,{title:"Combined Styles",size:"small",style:{width:400},children:e.jsx(t,{type:"danger",monospace:!0,strong:!0,italic:!0,underline:!0,ellipsis:{rows:1,tooltip:!0},copyable:!0,delete:!0,children:"Monospace strong italic underlined text with ellipsis and copy for very long content that is also marked as deleted"})})]}),parameters:{docs:{description:{story:"Real-world usage examples demonstrating various combinations of features in practical scenarios like file paths, API keys, error messages, commands, version info, and complex text styling."}}}};var I,B,g;r.parameters={...r.parameters,docs:{...(I=r.parameters)==null?void 0:I.docs,source:{originalSource:`{
  name: 'Basic',
  args: {
    children: 'This is a basic text component'
  },
  parameters: {
    docs: {
      description: {
        story: 'Basic usage of BAIText with default styling.'
      }
    }
  }
}`,...(g=(B=r.parameters)==null?void 0:B.docs)==null?void 0:g.source}}};var w,f,j;n.parameters={...n.parameters,docs:{...(w=n.parameters)==null?void 0:w.docs,source:{originalSource:`{
  name: 'SemanticTypes',
  render: () => <BAIFlex direction="column">
      <BAIText>Default Text</BAIText>
      <BAIText type="secondary">Secondary Text</BAIText>
      <BAIText type="success">Success Text</BAIText>
      <BAIText type="warning">Warning Text</BAIText>
      <BAIText type="danger">Danger Text</BAIText>
    </BAIFlex>,
  parameters: {
    docs: {
      description: {
        story: 'Different semantic text types with corresponding colors.'
      }
    }
  }
}`,...(j=(f=n.parameters)==null?void 0:f.docs)==null?void 0:j.source}}};var v,k,C;a.parameters={...a.parameters,docs:{...(v=a.parameters)==null?void 0:v.docs,source:{originalSource:`{
  name: 'TextStyles',
  render: () => <BAIFlex direction="column">
      <BAIText strong>Strong Text</BAIText>
      <BAIText italic>Italic Text</BAIText>
      <BAIText underline>Underlined Text</BAIText>
      <BAIText delete>Deleted Text</BAIText>
      <BAIText strong italic underline>
        Combined Styles
      </BAIText>
    </BAIFlex>,
  parameters: {
    docs: {
      description: {
        story: 'Various text styling options and combinations.'
      }
    }
  }
}`,...(C=(k=a.parameters)==null?void 0:k.docs)==null?void 0:C.source}}};var S,E,F;l.parameters={...l.parameters,docs:{...(S=l.parameters)==null?void 0:S.docs,source:{originalSource:`{
  name: 'MonospaceFont',
  render: () => <BAIFlex direction="column">
      <BAIText>Regular: 1234567890 ABCDEFG</BAIText>
      <BAIText monospace>Monospace: 1234567890 ABCDEFG</BAIText>
      <BAIText monospace type="secondary">
        Monospace Secondary: /path/to/file.txt
      </BAIText>
      <BAIText monospace copyable>
        npm install backend.ai-ui
      </BAIText>
    </BAIFlex>,
  parameters: {
    docs: {
      description: {
        story: 'Monospace font styling, useful for code snippets, file paths, and technical content.'
      }
    }
  }
}`,...(F=(E=l.parameters)==null?void 0:E.docs)==null?void 0:F.source}}};var D,z,M;c.parameters={...c.parameters,docs:{...(D=c.parameters)==null?void 0:D.docs,source:{originalSource:`{
  name: 'CopyableText',
  render: () => <BAIFlex direction="column">
      <BAIText copyable>Click icon to copy this text</BAIText>
      <BAIText copyable={{
      text: 'Custom copied text!'
    }}>
        Copy custom text
      </BAIText>
      <BAIText monospace copyable type="secondary">
        1234567890abcdef
      </BAIText>
      <BAIText copyable={{
      icon: [<span key="copy">📋</span>, <span key="copied">✅</span>],
      tooltips: ['Copy to clipboard', 'Copied!']
    }}>
        Text with custom copy icons
      </BAIText>
    </BAIFlex>,
  parameters: {
    docs: {
      description: {
        story: 'Text with copy-to-clipboard functionality including custom icons and tooltips.'
      }
    }
  }
}`,...(M=(z=c.parameters)==null?void 0:z.docs)==null?void 0:M.source}}};var R,K,U;d.parameters={...d.parameters,docs:{...(R=d.parameters)==null?void 0:R.docs,source:{originalSource:`{
  name: 'SingleLineEllipsis',
  render: () => <BAIFlex direction="column" style={{
    width: '100%'
  }}>
      <BAICard size="small" style={{
      width: 300
    }}>
        <BAIText ellipsis={{
        tooltip: true
      }}>
          This is a very long text that will be truncated with ellipsis when it
          exceeds the container width. Hover to see full content.
        </BAIText>
      </BAICard>
      <BAICard size="small" style={{
      width: 200
    }}>
        <BAIText ellipsis={{
        tooltip: true
      }} monospace>
          /very/long/path/to/some/file/in/system.txt
        </BAIText>
      </BAICard>
      <BAICard size="small" style={{
      width: 250
    }}>
        <BAIText ellipsis={{
        tooltip: true
      }} type="secondary">
          user@example.com with a very long email address that overflows
        </BAIText>
      </BAICard>
    </BAIFlex>,
  parameters: {
    docs: {
      description: {
        story: 'Single-line ellipsis with tooltip on hover when text overflows. Uses CSS-based truncation with Safari compatibility.'
      }
    }
  }
}`,...(U=(K=d.parameters)==null?void 0:K.docs)==null?void 0:U.source}}};var q,_,V;p.parameters={...p.parameters,docs:{...(q=p.parameters)==null?void 0:q.docs,source:{originalSource:`{
  name: 'MultiLineEllipsis',
  render: () => <BAIFlex direction="column" style={{
    width: '100%'
  }}>
      <BAICard size="small" style={{
      width: 400
    }}>
        <BAIText ellipsis={{
        rows: 2,
        tooltip: true
      }}>
          This is a longer text that spans multiple lines. When it exceeds the
          specified number of rows, it will be truncated with ellipsis. The
          tooltip will show the full content when you hover over the truncated
          text. This demonstrates multi-line ellipsis functionality.
        </BAIText>
      </BAICard>
      <BAICard size="small" style={{
      width: 300
    }}>
        <BAIText ellipsis={{
        rows: 3,
        tooltip: true
      }} type="secondary">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat.
        </BAIText>
      </BAICard>
    </BAIFlex>,
  parameters: {
    docs: {
      description: {
        story: 'Multi-line ellipsis using -webkit-line-clamp for Safari compatibility. Tooltip appears on hover when text is truncated.'
      }
    }
  }
}`,...(V=(_=p.parameters)==null?void 0:_.docs)==null?void 0:V.source}}};var N,O,P;m.parameters={...m.parameters,docs:{...(N=m.parameters)==null?void 0:N.docs,source:{originalSource:`{
  name: 'CustomTooltip',
  render: () => <BAIFlex direction="column" style={{
    width: '100%'
  }}>
      <BAICard size="small" style={{
      width: 300
    }}>
        <BAIText ellipsis={{
        rows: 1,
        // Of antd's \`TooltipProps\` only \`title\` has a destination on the
        // Astryx Tooltip.
        tooltip: {
          title: 'Custom tooltip content'
        }
      }}>
          Text with custom tooltip configuration and placement
        </BAIText>
      </BAICard>
      <BAICard size="small" style={{
      width: 250
    }}>
        <BAIText ellipsis={{
        rows: 2,
        tooltip: {
          title: 'This tooltip has custom styling'
        }
      }}>
          Multi-line text with custom colored tooltip when it overflows beyond
          two rows
        </BAIText>
      </BAICard>
    </BAIFlex>,
  parameters: {
    docs: {
      description: {
        story: 'Ellipsis with custom tooltip configuration including placement and styling.'
      }
    }
  }
}`,...(P=(O=m.parameters)==null?void 0:O.docs)==null?void 0:P.source}}};var H,W,L;u.parameters={...u.parameters,docs:{...(H=u.parameters)==null?void 0:H.docs,source:{originalSource:`{
  name: 'NoTooltip (Default)',
  render: () => <BAICard size="small" style={{
    width: 300
  }}>
      <BAIText ellipsis={{
      rows: 1
    }}>
        This text will be truncated but no tooltip will appear on hover even
        when it overflows
      </BAIText>
    </BAICard>,
  parameters: {
    docs: {
      description: {
        story: 'Ellipsis without tooltip functionality.'
      }
    }
  }
}`,...(L=(W=u.parameters)==null?void 0:W.docs)==null?void 0:L.source}}};var G,Q,Y;y.parameters={...y.parameters,docs:{...(G=y.parameters)==null?void 0:G.docs,source:{originalSource:`{
  name: 'InteractiveText',
  render: () => <BAIFlex direction="column">
      <BAIText copyable>Click the glyph to copy this line</BAIText>
      <BAIText copyable={{
      text: 'the-full-untruncated-value'
    }} ellipsis>
        A truncated value whose copy target is the full string
      </BAIText>
    </BAIFlex>,
  parameters: {
    docs: {
      description: {
        story: "Interactive text. antd's \`editable\` inline-edit affordance is not part of the surface — no production call site used it. \`copyable\` is built on \`IconButton\` + \`navigator.clipboard\`; with \`ellipsis\`, \`copyable.text\` keeps the clipboard target at the full value."
      }
    }
  }
}`,...(Y=(Q=y.parameters)==null?void 0:Q.docs)==null?void 0:Y.source}}};var J,X,Z;h.parameters={...h.parameters,docs:{...(J=h.parameters)==null?void 0:J.docs,source:{originalSource:`{
  name: 'KeyboardShortcuts',
  render: () => <BAIFlex direction="column" gap="md" align="start">
      <div>
        <BAIText type="secondary">Copy: </BAIText> <Kbd keys="mod+c" />
      </div>
      <div>
        <BAIText type="secondary">Quick open: </BAIText>{' '}
        <Kbd keys="mod+shift+p" />
      </div>
      <div>
        <BAIText type="secondary">A single literal key: </BAIText>{' '}
        <Kbd keys="]" />
      </div>
      <div>
        <BAIText type="secondary">Through the prop: </BAIText>
        <BAIText keyboard>mod+c</BAIText>
      </div>
      <div>
        <BAIText keyboard copyable>
          shift+enter
        </BAIText>
      </div>
    </BAIFlex>,
  parameters: {
    docs: {
      description: {
        story: 'Shortcut badges are Astryx \`Kbd\`; it takes a \`keys\` spec rather than children, and a key it does not know (\`]\`) is rendered verbatim. \`BAIText keyboard\` (the antd \`Typography.Text keyboard\` prop) hands its text to \`Kbd\` as that spec, so the two forms render the same badges. For \`Kbd\` on a DARK tooltip bubble wrap the content in \`MediaTheme mode="dark"\` (never the whole \`Tooltip\`): \`useTooltip\` hardcodes its bubble colours without flipping token context, and the host app pins its tooltip dark in BOTH modes via \`ANTD_HOVER_PARITY\`.'
      }
    }
  }
}`,...(Z=(X=h.parameters)==null?void 0:X.docs)==null?void 0:Z.source}}};var $,ee,te;x.parameters={...x.parameters,docs:{...($=x.parameters)==null?void 0:$.docs,source:{originalSource:`{
  name: 'CodeBlocks',
  render: () => <BAIFlex direction="column">
      <BAIText code>const greeting = &quot;Hello World&quot;;</BAIText>
      <BAIText code copyable>
        npm install backend.ai-ui
      </BAIText>
      <BAIText code type="secondary">
        import {'{ BAIText }'} from &apos;backend.ai-ui&apos;;
      </BAIText>
      <div>
        Run <BAIText code>pnpm run dev</BAIText> to start development server
      </div>
    </BAIFlex>,
  parameters: {
    docs: {
      description: {
        story: 'Inline code blocks with code styling.'
      }
    }
  }
}`,...(te=(ee=x.parameters)==null?void 0:ee.docs)==null?void 0:te.source}}};var se,oe,ie;b.parameters={...b.parameters,docs:{...(se=b.parameters)==null?void 0:se.docs,source:{originalSource:`{
  name: 'HighlightedText',
  render: () => <BAIFlex direction="column">
      <BAIText mark>Highlighted text</BAIText>
      <BAIText mark type="danger">
        Important highlighted warning
      </BAIText>
      <div>
        This is a <BAIText mark>highlighted</BAIText> word in a sentence.
      </div>
    </BAIFlex>,
  parameters: {
    docs: {
      description: {
        story: 'Text with highlight/mark styling.'
      }
    }
  }
}`,...(ie=(oe=b.parameters)==null?void 0:oe.docs)==null?void 0:ie.source}}};var re,ne,ae;T.parameters={...T.parameters,docs:{...(re=T.parameters)==null?void 0:re.docs,source:{originalSource:`{
  name: 'DisabledState',
  render: () => <BAIFlex direction="column">
      <BAIText disabled>Disabled text</BAIText>
      <BAIText disabled type="secondary">
        Disabled secondary text
      </BAIText>
      <BAIText disabled copyable>
        Disabled with copyable (copyable still works)
      </BAIText>
    </BAIFlex>,
  parameters: {
    docs: {
      description: {
        story: 'Text in disabled state with reduced opacity.'
      }
    }
  }
}`,...(ae=(ne=T.parameters)==null?void 0:ne.docs)==null?void 0:ae.source}}};var le,ce,de;A.parameters={...A.parameters,docs:{...(le=A.parameters)==null?void 0:le.docs,source:{originalSource:`{
  name: 'RealWorldUsage',
  render: () => <BAIFlex direction="column" style={{
    width: '100%'
  }} gap="lg">
      <BAICard title="File Path" size="small" style={{
      width: 400
    }}>
        <BAIText monospace ellipsis={{
        tooltip: true
      }} copyable>
          /home/user/projects/backend.ai-webui/react/src/components/AgentStats.tsx
        </BAIText>
      </BAICard>

      <BAICard title="API Key" size="small" style={{
      width: 450
    }}>
        <BAIText monospace type="secondary" copyable>
          1234567890abcdefghijklmnopqrstuvwxyz
        </BAIText>
        <br />
        <BAIText type="secondary">Access Token with Ellipsis: </BAIText>
        <BAIText code copyable ellipsis={{
        tooltip: true
      }}>
          1234567890abcdefghijklmnopqrstuvwxyz_very_long_token_string
        </BAIText>
      </BAICard>

      <BAICard title="Error Message" size="small" style={{
      width: 450
    }}>
        <BAIText type="danger" ellipsis={{
        rows: 2,
        tooltip: true
      }}>
          Failed to load resource: net::ERR_CONNECTION_REFUSED at
          https://example.com/api/v1/endpoint. Please check your network
          connection and try again.
        </BAIText>
      </BAICard>

      <BAICard title="User Email" size="small" style={{
      width: 300
    }}>
        <BAIText ellipsis={{
        tooltip: true
      }} copyable>
          user.with.very.long.name@company.example.com
        </BAIText>
      </BAICard>

      <BAICard title="Description" size="small" style={{
      width: 350
    }}>
        <BAIText type="secondary" ellipsis={{
        rows: 3,
        tooltip: true
      }}>
          This is a sample description that might be quite long and needs to be
          truncated to maintain a clean UI. The full content will be available
          in a tooltip when users hover over the truncated text. This provides a
          good balance between information density and usability.
        </BAIText>
      </BAICard>

      <BAICard title="Command & Keyboard" size="small" style={{
      width: 200
    }}>
        <BAIText type="secondary">To copy the command: </BAIText>
        <Kbd keys="mod+c" />
        <br />
        <BAIText code copyable>
          git clone repository.git
        </BAIText>
        <br />
        <BAIText type="secondary">Quick Open: </BAIText>
        <Kbd keys="mod+shift+p" />
      </BAICard>

      <BAICard title="Status Update" size="small" style={{
      width: 400
    }}>
        <BAIText strong mark type="warning">
          Action Required:
        </BAIText>
        <br />
        <BAIText>Your subscription expires in 3 days.</BAIText>
      </BAICard>

      <BAICard title="Version Info" size="small" style={{
      width: 400
    }}>
        <BAIText delete type="secondary">
          Old version: 1.0.0
        </BAIText>
        <br />
        <BAIText strong type="success">
          Current version: 2.0.0
        </BAIText>
      </BAICard>

      <BAICard title="Deprecation Notice" size="small" style={{
      width: 450
    }}>
        <BAIText type="warning" strong>
          ⚠️ Deprecated:
        </BAIText>{' '}
        <BAIText code delete>
          oldFunction()
        </BAIText>
        <BAIText type="secondary"> → Use </BAIText>
        <BAIText code type="success">
          newFunction()
        </BAIText>
        <BAIText type="secondary"> instead</BAIText>
      </BAICard>

      <BAICard title="Combined Styles" size="small" style={{
      width: 400
    }}>
        <BAIText type="danger" monospace strong italic underline ellipsis={{
        rows: 1,
        tooltip: true
      }} copyable delete>
          Monospace strong italic underlined text with ellipsis and copy for
          very long content that is also marked as deleted
        </BAIText>
      </BAICard>
    </BAIFlex>,
  parameters: {
    docs: {
      description: {
        story: 'Real-world usage examples demonstrating various combinations of features in practical scenarios like file paths, API keys, error messages, commands, version info, and complex text styling.'
      }
    }
  }
}`,...(de=(ce=A.parameters)==null?void 0:ce.docs)==null?void 0:de.source}}};const je=["Default","Types","Styles","Monospace","Copyable","SingleLineEllipsis","MultiLineEllipsis","EllipsisWithCustomTooltip","EllipsisDisabledTooltip","Interactive","Keyboard","Code","Mark","Disabled","RealWorldExamples"];export{x as Code,c as Copyable,r as Default,T as Disabled,u as EllipsisDisabledTooltip,m as EllipsisWithCustomTooltip,y as Interactive,h as Keyboard,b as Mark,l as Monospace,p as MultiLineEllipsis,A as RealWorldExamples,d as SingleLineEllipsis,a as Styles,n as Types,je as __namedExportsOrder,fe as default};
