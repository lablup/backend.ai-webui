import{B as t,j as e}from"./iframe-BgaR6W86.js";import{B as s}from"./BAICard-B8kf7Eny.js";import{B as o}from"./BAIFlex-BReP981K.js";import{K as i}from"./BAITabList-CxRg0HOQ.js";import"./preload-helper-Dp1pzeXC.js";import"./astryxLabel-CG99bAkm.js";import"./BAIButton-DeYlQg_6.js";import"./VStack-CUQ6QTqh.js";import"./Divider-DlzJWL5K.js";import"./useDevWarning-D0o9UoUz.js";import"./useListFocus-DVimucpX.js";import"./isRtlElement-B2-7SF8s.js";import"./rtlStyles-T4i24HtE.js";const De={title:"Text/BAIText",component:t,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:"\n**BAIText** keeps an [Ant Design Typography.Text](https://ant.design/components/typography)-shaped prop surface for call-site compatibility, and renders through Astryx's `Text` primitive (`@astryxdesign/core/Text`) internally — with `code`/`mark` box treatments, an `ellipsis`-driven tooltip, and a self-built `copyable` control (`IconButton` + `navigator.clipboard`) layered on top.\n\n## BAI-Specific Props\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `monospace` | `boolean` | `false` | Use monospace font family |\n| `ellipsis` | `boolean \\| EllipsisConfig` | `false` | Custom CSS-based ellipsis with Safari compatibility |\n\n## BAI-Specific Features\n| Feature | Description |\n|---------|-------------|\n| Monospace Font | Simple boolean prop to use monospace font family |\n| CSS-based Ellipsis | Re-implemented ellipsis using CSS with Safari compatibility |\n| Multi-line Truncation | Supports multi-line ellipsis using `-webkit-line-clamp` |\n| Tooltip Integration | Automatically shows tooltip when text is truncated |\n| Expandable Text | Built-in expand/collapse functionality for truncated text |\n| Copy with Ellipsis | Copy functionality works correctly with ellipsis |\n\n## Ellipsis Config\n```typescript\ninterface EllipsisConfig {\n  rows?: number;          // Number of lines before truncation (default: 1)\n  tooltip?: boolean | TooltipProps;  // Show tooltip on hover\n  expandable?: boolean;   // Enable expand/collapse functionality\n  onExpand?: (e, info) => void;  // Callback when expanded/collapsed\n}\n```\n\nFor all other props, see `BAIText.tsx` — the antd-shaped types (`BAITextEllipsisConfig`, `BAITextCopyConfig`) are declared locally rather than imported from antd.\n        "}}},argTypes:{children:{control:!1,description:"The text content to display",table:{type:{summary:"ReactNode"}}},type:{control:{type:"select"},options:["secondary","success","warning","danger",void 0],description:"Text type for semantic styling",table:{type:{summary:"'secondary' | 'success' | 'warning' | 'danger'"}}},monospace:{control:{type:"boolean"},description:"Use monospace font family (BAI-specific prop for code, paths, etc.)",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},ellipsis:{control:{type:"boolean"},description:"Enable CSS-based ellipsis with Safari compatibility (BAI-specific implementation). Can be boolean or EllipsisConfig object with rows, tooltip, expandable options",table:{type:{summary:"boolean | EllipsisConfig"},defaultValue:{summary:"false"}}},copyable:{control:{type:"boolean"},description:"Enable copy-to-clipboard functionality",table:{type:{summary:"boolean | CopyConfig"},defaultValue:{summary:"false"}}},strong:{control:{type:"boolean"},description:"Bold text",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},italic:{control:{type:"boolean"},description:"Italic text",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},underline:{control:{type:"boolean"},description:"Underlined text",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},delete:{control:{type:"boolean"},description:"Strikethrough text",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},mark:{control:{type:"boolean"},description:"Highlighted/marked text with background color",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},code:{control:{type:"boolean"},description:"Inline code styling with background and border",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},disabled:{control:{type:"boolean"},description:"Disabled state with reduced opacity",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}}}},n={name:"Basic",args:{children:"This is a basic text component"},parameters:{docs:{description:{story:"Basic usage of BAIText with default styling."}}}},a={name:"SemanticTypes",render:()=>e.jsxs(o,{direction:"column",children:[e.jsx(t,{children:"Default Text"}),e.jsx(t,{type:"secondary",children:"Secondary Text"}),e.jsx(t,{type:"success",children:"Success Text"}),e.jsx(t,{type:"warning",children:"Warning Text"}),e.jsx(t,{type:"danger",children:"Danger Text"})]}),parameters:{docs:{description:{story:"Different semantic text types with corresponding colors."}}}},l={name:"TextStyles",render:()=>e.jsxs(o,{direction:"column",children:[e.jsx(t,{strong:!0,children:"Strong Text"}),e.jsx(t,{italic:!0,children:"Italic Text"}),e.jsx(t,{underline:!0,children:"Underlined Text"}),e.jsx(t,{delete:!0,children:"Deleted Text"}),e.jsx(t,{strong:!0,italic:!0,underline:!0,children:"Combined Styles"})]}),parameters:{docs:{description:{story:"Various text styling options and combinations."}}}},r={name:"MonospaceFont",render:()=>e.jsxs(o,{direction:"column",children:[e.jsx(t,{children:"Regular: 1234567890 ABCDEFG"}),e.jsx(t,{monospace:!0,children:"Monospace: 1234567890 ABCDEFG"}),e.jsx(t,{monospace:!0,type:"secondary",children:"Monospace Secondary: /path/to/file.txt"}),e.jsx(t,{monospace:!0,copyable:!0,children:"npm install backend.ai-ui"})]}),parameters:{docs:{description:{story:"Monospace font styling, useful for code snippets, file paths, and technical content."}}}},d={name:"CopyableText",render:()=>e.jsxs(o,{direction:"column",children:[e.jsx(t,{copyable:!0,children:"Click icon to copy this text"}),e.jsx(t,{copyable:{text:"Custom copied text!"},children:"Copy custom text"}),e.jsx(t,{monospace:!0,copyable:!0,type:"secondary",children:"1234567890abcdef"}),e.jsx(t,{copyable:{icon:[e.jsx("span",{children:"📋"},"copy"),e.jsx("span",{children:"✅"},"copied")],tooltips:["Copy to clipboard","Copied!"]},children:"Text with custom copy icons"})]}),parameters:{docs:{description:{story:"Text with copy-to-clipboard functionality including custom icons and tooltips."}}}},c={name:"SingleLineEllipsis",render:()=>e.jsxs(o,{direction:"column",style:{width:"100%"},children:[e.jsx(s,{size:"small",style:{width:300},styles:{body:{paddingTop:0}},children:e.jsx(t,{ellipsis:{tooltip:!0},children:"This is a very long text that will be truncated with ellipsis when it exceeds the container width. Hover to see full content."})}),e.jsx(s,{size:"small",style:{width:200},styles:{body:{paddingTop:0}},children:e.jsx(t,{ellipsis:{tooltip:!0},monospace:!0,children:"/very/long/path/to/some/file/in/system.txt"})}),e.jsx(s,{size:"small",style:{width:250},styles:{body:{paddingTop:0}},children:e.jsx(t,{ellipsis:{tooltip:!0},type:"secondary",children:"user@example.com with a very long email address that overflows"})})]}),parameters:{docs:{description:{story:"Single-line ellipsis with tooltip on hover when text overflows. Uses CSS-based truncation with Safari compatibility."}}}},p={name:"MultiLineEllipsis",render:()=>e.jsxs(o,{direction:"column",style:{width:"100%"},children:[e.jsx(s,{size:"small",style:{width:400},styles:{body:{paddingTop:0}},children:e.jsx(t,{ellipsis:{rows:2,tooltip:!0},children:"This is a longer text that spans multiple lines. When it exceeds the specified number of rows, it will be truncated with ellipsis. The tooltip will show the full content when you hover over the truncated text. This demonstrates multi-line ellipsis functionality."})}),e.jsx(s,{size:"small",style:{width:300},styles:{body:{paddingTop:0}},children:e.jsx(t,{ellipsis:{rows:3,tooltip:!0},type:"secondary",children:"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."})})]}),parameters:{docs:{description:{story:"Multi-line ellipsis using -webkit-line-clamp for Safari compatibility. Tooltip appears on hover when text is truncated."}}}},y={name:"CustomTooltip",render:()=>e.jsxs(o,{direction:"column",style:{width:"100%"},children:[e.jsx(s,{size:"small",style:{width:300},styles:{body:{paddingTop:0}},children:e.jsx(t,{ellipsis:{rows:1,tooltip:{title:"Custom tooltip content"}},children:"Text with custom tooltip configuration and placement"})}),e.jsx(s,{size:"small",style:{width:250},styles:{body:{paddingTop:0}},children:e.jsx(t,{ellipsis:{rows:2,tooltip:{title:"This tooltip has custom styling"}},children:"Multi-line text with custom colored tooltip when it overflows beyond two rows"})})]}),parameters:{docs:{description:{story:"Ellipsis with custom tooltip configuration including placement and styling."}}}},u={name:"NoTooltip (Default)",render:()=>e.jsx(s,{size:"small",style:{width:300},styles:{body:{paddingTop:0}},children:e.jsx(t,{ellipsis:{rows:1},children:"This text will be truncated but no tooltip will appear on hover even when it overflows"})}),parameters:{docs:{description:{story:"Ellipsis without tooltip functionality."}}}},m={name:"ExpandableEllipsis",render:()=>e.jsxs(o,{direction:"column",style:{width:"100%"},children:[e.jsx(s,{size:"small",style:{width:300},styles:{body:{paddingTop:0}},children:e.jsx(t,{ellipsis:{rows:1,expandable:!0},children:'This is a long text that will be truncated with ellipsis. Click "Expand" to see the full content and "Collapse" to hide it again.'})}),e.jsx(s,{size:"small",style:{width:400},styles:{body:{paddingTop:0}},children:e.jsx(t,{ellipsis:{rows:2,expandable:!0,tooltip:!0},children:'This is a longer text that spans multiple lines. When it exceeds the specified number of rows, it will be truncated with ellipsis. You can click "Expand" to see the full content. The tooltip will also show the full content when you hover over the truncated text.'})}),e.jsx(s,{size:"small",style:{width:250},styles:{body:{paddingTop:0}},children:e.jsx(t,{ellipsis:{rows:3,expandable:!0,onExpand:Te=>console.log("Expand/Collapse clicked:",Te)},type:"secondary",children:"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."})})]}),parameters:{docs:{description:{story:'Expandable ellipsis allows users to toggle between truncated and full text views. Click the "Expand" link to show full content and "Collapse" to hide it. Works with both single and multi-line ellipsis.'}}}},h={name:"ExpandableWithCombinedFeatures",render:()=>e.jsxs(o,{direction:"column",style:{width:"100%"},children:[e.jsx(s,{size:"small",style:{width:350},styles:{body:{paddingTop:0}},children:e.jsx(t,{ellipsis:{rows:1,expandable:!0,tooltip:!0},copyable:!0,children:"/home/user/projects/backend.ai-webui/react/src/components/very/long/path/to/file.tsx"})}),e.jsx(s,{size:"small",style:{width:300},styles:{body:{paddingTop:0}},children:e.jsx(t,{monospace:!0,ellipsis:{rows:2,expandable:!0},copyable:!0,type:"secondary",children:"1234567890abcdefghijklmnopqrstuvwxyz_very_long_api_key_string_that_needs_expansion"})}),e.jsx(s,{size:"small",style:{width:400},styles:{body:{paddingTop:0}},children:e.jsx(t,{ellipsis:{rows:2,expandable:!0,tooltip:!0},type:"danger",children:"Error: Failed to load resource at https://example.com/api/v1/endpoint with status 500. Please check your network connection and server configuration, then try again."})})]}),parameters:{docs:{description:{story:"Expandable ellipsis works seamlessly with other BAIText features like copyable, monospace, tooltips, and semantic types."}}}},x={name:"InteractiveText",render:()=>e.jsxs(o,{direction:"column",children:[e.jsx(t,{copyable:!0,children:"Click the glyph to copy this line"}),e.jsx(t,{copyable:{text:"the-full-untruncated-value"},ellipsis:!0,children:"A truncated value whose copy target is the full string"})]}),parameters:{docs:{description:{story:"Interactive text. PILOT-DECISION (to-astryx phase 3, ticket A): antd's `editable` inline-edit affordance is DROPPED — Astryx has no counterpart and no production call site used it, only this story. `copyable` is kept and rebuilt on `IconButton` + `navigator.clipboard`."}}}},b={name:"KeyboardShortcuts",render:()=>e.jsxs(o,{direction:"column",gap:"md",align:"start",children:[e.jsxs("div",{children:[e.jsx(t,{type:"secondary",children:"Copy: "})," ",e.jsx(i,{keys:"mod+c"})]}),e.jsxs("div",{children:[e.jsx(t,{type:"secondary",children:"Quick open: "})," ",e.jsx(i,{keys:"mod+shift+p"})]}),e.jsxs("div",{children:[e.jsx(t,{type:"secondary",children:"A single literal key: "})," ",e.jsx(i,{keys:"]"})]})]}),parameters:{docs:{description:{story:'Shortcut badges are Astryx `Kbd`, not a `BAIText` prop — `keyboard` / `keyboardWithLightBorder` were retired in FR-3509. `Kbd` takes a `keys` spec rather than children; a key it does not know (`]`) is rendered verbatim. Match the `MediaTheme` to the surface the badge actually sits on, rather than assuming one: `useTooltip` hardcodes its bubble colours without flipping token context, so on a DARK bubble the content must be wrapped in `MediaTheme mode="dark"` (never the whole `Tooltip`) or `Kbd` resolves against the page surface and disappears. The host app pins its tooltip dark in BOTH modes via `ANTD_HOVER_PARITY`, which is why `SiderToggleButton` / `BAINotificationButton` do exactly that; this Storybook has no such pin, so its own tooltip is light and the same wrapper would be wrong here.'}}}},g={name:"CodeBlocks",render:()=>e.jsxs(o,{direction:"column",children:[e.jsx(t,{code:!0,children:'const greeting = "Hello World";'}),e.jsx(t,{code:!0,copyable:!0,children:"npm install backend.ai-ui"}),e.jsxs(t,{code:!0,type:"secondary",children:["import ","{ BAIText }"," from 'backend.ai-ui';"]}),e.jsxs("div",{children:["Run ",e.jsx(t,{code:!0,children:"pnpm run dev"})," to start development server"]})]}),parameters:{docs:{description:{story:"Inline code blocks with code styling."}}}},T={name:"HighlightedText",render:()=>e.jsxs(o,{direction:"column",children:[e.jsx(t,{mark:!0,children:"Highlighted text"}),e.jsx(t,{mark:!0,type:"danger",children:"Important highlighted warning"}),e.jsxs("div",{children:["This is a ",e.jsx(t,{mark:!0,children:"highlighted"})," word in a sentence."]})]}),parameters:{docs:{description:{story:"Text with highlight/mark styling."}}}},w={name:"DisabledState",render:()=>e.jsxs(o,{direction:"column",children:[e.jsx(t,{disabled:!0,children:"Disabled text"}),e.jsx(t,{disabled:!0,type:"secondary",children:"Disabled secondary text"}),e.jsx(t,{disabled:!0,copyable:!0,children:"Disabled with copyable (copyable still works)"})]}),parameters:{docs:{description:{story:"Text in disabled state with reduced opacity."}}}},I={name:"RealWorldUsage",render:()=>e.jsxs(o,{direction:"column",style:{width:"100%"},gap:"lg",children:[e.jsx(s,{title:"File Path",size:"small",style:{width:400},styles:{body:{paddingTop:0}},children:e.jsx(t,{monospace:!0,ellipsis:{tooltip:!0},copyable:!0,children:"/home/user/projects/backend.ai-webui/react/src/components/AgentStats.tsx"})}),e.jsxs(s,{title:"API Key",size:"small",style:{width:450},styles:{body:{paddingTop:0}},children:[e.jsx(t,{monospace:!0,type:"secondary",copyable:!0,children:"1234567890abcdefghijklmnopqrstuvwxyz"}),e.jsx("br",{}),e.jsx(t,{type:"secondary",children:"Access Token with Ellipsis: "}),e.jsx(t,{code:!0,copyable:!0,ellipsis:{tooltip:!0},children:"1234567890abcdefghijklmnopqrstuvwxyz_very_long_token_string"})]}),e.jsx(s,{title:"Error Message",size:"small",style:{width:450},styles:{body:{paddingTop:0}},children:e.jsx(t,{type:"danger",ellipsis:{rows:2,tooltip:!0},children:"Failed to load resource: net::ERR_CONNECTION_REFUSED at https://example.com/api/v1/endpoint. Please check your network connection and try again."})}),e.jsx(s,{title:"User Email",size:"small",style:{width:300},styles:{body:{paddingTop:0}},children:e.jsx(t,{ellipsis:{tooltip:!0},copyable:!0,children:"user.with.very.long.name@company.example.com"})}),e.jsx(s,{title:"Description",size:"small",style:{width:350},styles:{body:{paddingTop:0}},children:e.jsx(t,{type:"secondary",ellipsis:{rows:3,tooltip:!0},children:"This is a sample description that might be quite long and needs to be truncated to maintain a clean UI. The full content will be available in a tooltip when users hover over the truncated text. This provides a good balance between information density and usability."})}),e.jsxs(s,{title:"Command & Keyboard",size:"small",style:{width:200},styles:{body:{paddingTop:0}},children:[e.jsx(t,{type:"secondary",children:"To copy the command: "}),e.jsx(i,{keys:"mod+c"}),e.jsx("br",{}),e.jsx(t,{code:!0,copyable:!0,children:"git clone repository.git"}),e.jsx("br",{}),e.jsx(t,{type:"secondary",children:"Quick Open: "}),e.jsx(i,{keys:"mod+shift+p"})]}),e.jsxs(s,{title:"Status Update",size:"small",style:{width:400},styles:{body:{paddingTop:0}},children:[e.jsx(t,{strong:!0,mark:!0,type:"warning",children:"Action Required:"}),e.jsx("br",{}),e.jsx(t,{children:"Your subscription expires in 3 days."})]}),e.jsxs(s,{title:"Version Info",size:"small",style:{width:400},styles:{body:{paddingTop:0}},children:[e.jsx(t,{delete:!0,type:"secondary",children:"Old version: 1.0.0"}),e.jsx("br",{}),e.jsx(t,{strong:!0,type:"success",children:"Current version: 2.0.0"})]}),e.jsxs(s,{title:"Deprecation Notice",size:"small",style:{width:450},styles:{body:{paddingTop:0}},children:[e.jsx(t,{type:"warning",strong:!0,children:"⚠️ Deprecated:"})," ",e.jsx(t,{code:!0,delete:!0,children:"oldFunction()"}),e.jsx(t,{type:"secondary",children:" → Use "}),e.jsx(t,{code:!0,type:"success",children:"newFunction()"}),e.jsx(t,{type:"secondary",children:" instead"})]}),e.jsx(s,{title:"Combined Styles",size:"small",style:{width:400},styles:{body:{paddingTop:0}},children:e.jsx(t,{type:"danger",monospace:!0,strong:!0,italic:!0,underline:!0,ellipsis:{expandable:!0,rows:1,tooltip:!0},copyable:!0,delete:!0,children:"Monospace strong italic underlined text with ellipsis and copy for very long expandable content that is also marked as deleted"})})]}),parameters:{docs:{description:{story:"Real-world usage examples demonstrating various combinations of features in practical scenarios like file paths, API keys, error messages, commands, version info, and complex text styling."}}}};var A,B,f;n.parameters={...n.parameters,docs:{...(A=n.parameters)==null?void 0:A.docs,source:{originalSource:`{
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
}`,...(f=(B=n.parameters)==null?void 0:B.docs)==null?void 0:f.source}}};var j,k,C;a.parameters={...a.parameters,docs:{...(j=a.parameters)==null?void 0:j.docs,source:{originalSource:`{
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
}`,...(C=(k=a.parameters)==null?void 0:k.docs)==null?void 0:C.source}}};var v,S,E;l.parameters={...l.parameters,docs:{...(v=l.parameters)==null?void 0:v.docs,source:{originalSource:`{
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
}`,...(E=(S=l.parameters)==null?void 0:S.docs)==null?void 0:E.source}}};var F,z,D;r.parameters={...r.parameters,docs:{...(F=r.parameters)==null?void 0:F.docs,source:{originalSource:`{
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
}`,...(D=(z=r.parameters)==null?void 0:z.docs)==null?void 0:D.source}}};var q,_,M;d.parameters={...d.parameters,docs:{...(q=d.parameters)==null?void 0:q.docs,source:{originalSource:`{
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
}`,...(M=(_=d.parameters)==null?void 0:_.docs)==null?void 0:M.source}}};var R,K,U;c.parameters={...c.parameters,docs:{...(R=c.parameters)==null?void 0:R.docs,source:{originalSource:`{
  name: 'SingleLineEllipsis',
  render: () => <BAIFlex direction="column" style={{
    width: '100%'
  }}>
      <BAICard size="small" style={{
      width: 300
    }} styles={{
      body: {
        paddingTop: 0
      }
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
    }} styles={{
      body: {
        paddingTop: 0
      }
    }}>
        <BAIText ellipsis={{
        tooltip: true
      }} monospace>
          /very/long/path/to/some/file/in/system.txt
        </BAIText>
      </BAICard>
      <BAICard size="small" style={{
      width: 250
    }} styles={{
      body: {
        paddingTop: 0
      }
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
}`,...(U=(K=c.parameters)==null?void 0:K.docs)==null?void 0:U.source}}};var W,O,P;p.parameters={...p.parameters,docs:{...(W=p.parameters)==null?void 0:W.docs,source:{originalSource:`{
  name: 'MultiLineEllipsis',
  render: () => <BAIFlex direction="column" style={{
    width: '100%'
  }}>
      <BAICard size="small" style={{
      width: 400
    }} styles={{
      body: {
        paddingTop: 0
      }
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
    }} styles={{
      body: {
        paddingTop: 0
      }
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
}`,...(P=(O=p.parameters)==null?void 0:O.docs)==null?void 0:P.source}}};var N,L,V;y.parameters={...y.parameters,docs:{...(N=y.parameters)==null?void 0:N.docs,source:{originalSource:`{
  name: 'CustomTooltip',
  render: () => <BAIFlex direction="column" style={{
    width: '100%'
  }}>
      <BAICard size="small" style={{
      width: 300
    }} styles={{
      body: {
        paddingTop: 0
      }
    }}>
        <BAIText ellipsis={{
        rows: 1,
        // Astryx renders the ellipsis tooltip through its own Tooltip;
        // antd's per-tooltip \`placement\`/\`color\` overrides have no
        // destination (to-astryx phase 3, ticket A), so only \`title\`
        // survives.
        tooltip: {
          title: 'Custom tooltip content'
        }
      }}>
          Text with custom tooltip configuration and placement
        </BAIText>
      </BAICard>
      <BAICard size="small" style={{
      width: 250
    }} styles={{
      body: {
        paddingTop: 0
      }
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
}`,...(V=(L=y.parameters)==null?void 0:L.docs)==null?void 0:V.source}}};var H,Y,G;u.parameters={...u.parameters,docs:{...(H=u.parameters)==null?void 0:H.docs,source:{originalSource:`{
  name: 'NoTooltip (Default)',
  render: () => <BAICard size="small" style={{
    width: 300
  }} styles={{
    body: {
      paddingTop: 0
    }
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
}`,...(G=(Y=u.parameters)==null?void 0:Y.docs)==null?void 0:G.source}}};var Q,J,X;m.parameters={...m.parameters,docs:{...(Q=m.parameters)==null?void 0:Q.docs,source:{originalSource:`{
  name: 'ExpandableEllipsis',
  render: () => <BAIFlex direction="column" style={{
    width: '100%'
  }}>
      <BAICard size="small" style={{
      width: 300
    }} styles={{
      body: {
        paddingTop: 0
      }
    }}>
        <BAIText ellipsis={{
        rows: 1,
        expandable: true
      }}>
          This is a long text that will be truncated with ellipsis. Click
          &quot;Expand&quot; to see the full content and &quot;Collapse&quot; to
          hide it again.
        </BAIText>
      </BAICard>
      <BAICard size="small" style={{
      width: 400
    }} styles={{
      body: {
        paddingTop: 0
      }
    }}>
        <BAIText ellipsis={{
        rows: 2,
        expandable: true,
        tooltip: true
      }}>
          This is a longer text that spans multiple lines. When it exceeds the
          specified number of rows, it will be truncated with ellipsis. You can
          click &quot;Expand&quot; to see the full content. The tooltip will
          also show the full content when you hover over the truncated text.
        </BAIText>
      </BAICard>
      <BAICard size="small" style={{
      width: 250
    }} styles={{
      body: {
        paddingTop: 0
      }
    }}>
        <BAIText ellipsis={{
        rows: 3,
        expandable: true,
        onExpand: e => console.log('Expand/Collapse clicked:', e)
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
        story: 'Expandable ellipsis allows users to toggle between truncated and full text views. Click the "Expand" link to show full content and "Collapse" to hide it. Works with both single and multi-line ellipsis.'
      }
    }
  }
}`,...(X=(J=m.parameters)==null?void 0:J.docs)==null?void 0:X.source}}};var Z,$,ee;h.parameters={...h.parameters,docs:{...(Z=h.parameters)==null?void 0:Z.docs,source:{originalSource:`{
  name: 'ExpandableWithCombinedFeatures',
  render: () => <BAIFlex direction="column" style={{
    width: '100%'
  }}>
      <BAICard size="small" style={{
      width: 350
    }} styles={{
      body: {
        paddingTop: 0
      }
    }}>
        <BAIText ellipsis={{
        rows: 1,
        expandable: true,
        tooltip: true
      }} copyable>
          /home/user/projects/backend.ai-webui/react/src/components/very/long/path/to/file.tsx
        </BAIText>
      </BAICard>
      <BAICard size="small" style={{
      width: 300
    }} styles={{
      body: {
        paddingTop: 0
      }
    }}>
        <BAIText monospace ellipsis={{
        rows: 2,
        expandable: true
      }} copyable type="secondary">
          1234567890abcdefghijklmnopqrstuvwxyz_very_long_api_key_string_that_needs_expansion
        </BAIText>
      </BAICard>
      <BAICard size="small" style={{
      width: 400
    }} styles={{
      body: {
        paddingTop: 0
      }
    }}>
        <BAIText ellipsis={{
        rows: 2,
        expandable: true,
        tooltip: true
      }} type="danger">
          Error: Failed to load resource at https://example.com/api/v1/endpoint
          with status 500. Please check your network connection and server
          configuration, then try again.
        </BAIText>
      </BAICard>
    </BAIFlex>,
  parameters: {
    docs: {
      description: {
        story: 'Expandable ellipsis works seamlessly with other BAIText features like copyable, monospace, tooltips, and semantic types.'
      }
    }
  }
}`,...(ee=($=h.parameters)==null?void 0:$.docs)==null?void 0:ee.source}}};var te,se,oe;x.parameters={...x.parameters,docs:{...(te=x.parameters)==null?void 0:te.docs,source:{originalSource:`{
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
        story: "Interactive text. PILOT-DECISION (to-astryx phase 3, ticket A): antd's \`editable\` inline-edit affordance is DROPPED — Astryx has no counterpart and no production call site used it, only this story. \`copyable\` is kept and rebuilt on \`IconButton\` + \`navigator.clipboard\`."
      }
    }
  }
}`,...(oe=(se=x.parameters)==null?void 0:se.docs)==null?void 0:oe.source}}};var ie,ne,ae;b.parameters={...b.parameters,docs:{...(ie=b.parameters)==null?void 0:ie.docs,source:{originalSource:'{\n  name: \'KeyboardShortcuts\',\n  render: () => <BAIFlex direction="column" gap="md" align="start">\n      <div>\n        <BAIText type="secondary">Copy: </BAIText> <Kbd keys="mod+c" />\n      </div>\n      <div>\n        <BAIText type="secondary">Quick open: </BAIText>{\' \'}\n        <Kbd keys="mod+shift+p" />\n      </div>\n      <div>\n        <BAIText type="secondary">A single literal key: </BAIText>{\' \'}\n        <Kbd keys="]" />\n      </div>\n    </BAIFlex>,\n  parameters: {\n    docs: {\n      description: {\n        story: \'Shortcut badges are Astryx `Kbd`, not a `BAIText` prop — `keyboard` / `keyboardWithLightBorder` were retired in FR-3509. `Kbd` takes a `keys` spec rather than children; a key it does not know (`]`) is rendered verbatim. Match the `MediaTheme` to the surface the badge actually sits on, rather than assuming one: `useTooltip` hardcodes its bubble colours without flipping token context, so on a DARK bubble the content must be wrapped in `MediaTheme mode="dark"` (never the whole `Tooltip`) or `Kbd` resolves against the page surface and disappears. The host app pins its tooltip dark in BOTH modes via `ANTD_HOVER_PARITY`, which is why `SiderToggleButton` / `BAINotificationButton` do exactly that; this Storybook has no such pin, so its own tooltip is light and the same wrapper would be wrong here.\'\n      }\n    }\n  }\n}',...(ae=(ne=b.parameters)==null?void 0:ne.docs)==null?void 0:ae.source}}};var le,re,de;g.parameters={...g.parameters,docs:{...(le=g.parameters)==null?void 0:le.docs,source:{originalSource:`{
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
}`,...(de=(re=g.parameters)==null?void 0:re.docs)==null?void 0:de.source}}};var ce,pe,ye;T.parameters={...T.parameters,docs:{...(ce=T.parameters)==null?void 0:ce.docs,source:{originalSource:`{
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
}`,...(ye=(pe=T.parameters)==null?void 0:pe.docs)==null?void 0:ye.source}}};var ue,me,he;w.parameters={...w.parameters,docs:{...(ue=w.parameters)==null?void 0:ue.docs,source:{originalSource:`{
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
}`,...(he=(me=w.parameters)==null?void 0:me.docs)==null?void 0:he.source}}};var xe,be,ge;I.parameters={...I.parameters,docs:{...(xe=I.parameters)==null?void 0:xe.docs,source:{originalSource:`{
  name: 'RealWorldUsage',
  render: () => <BAIFlex direction="column" style={{
    width: '100%'
  }} gap="lg">
      <BAICard title="File Path" size="small" style={{
      width: 400
    }} styles={{
      body: {
        paddingTop: 0
      }
    }}>
        <BAIText monospace ellipsis={{
        tooltip: true
      }} copyable>
          /home/user/projects/backend.ai-webui/react/src/components/AgentStats.tsx
        </BAIText>
      </BAICard>

      <BAICard title="API Key" size="small" style={{
      width: 450
    }} styles={{
      body: {
        paddingTop: 0
      }
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
    }} styles={{
      body: {
        paddingTop: 0
      }
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
    }} styles={{
      body: {
        paddingTop: 0
      }
    }}>
        <BAIText ellipsis={{
        tooltip: true
      }} copyable>
          user.with.very.long.name@company.example.com
        </BAIText>
      </BAICard>

      <BAICard title="Description" size="small" style={{
      width: 350
    }} styles={{
      body: {
        paddingTop: 0
      }
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
    }} styles={{
      body: {
        paddingTop: 0
      }
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
    }} styles={{
      body: {
        paddingTop: 0
      }
    }}>
        <BAIText strong mark type="warning">
          Action Required:
        </BAIText>
        <br />
        <BAIText>Your subscription expires in 3 days.</BAIText>
      </BAICard>

      <BAICard title="Version Info" size="small" style={{
      width: 400
    }} styles={{
      body: {
        paddingTop: 0
      }
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
    }} styles={{
      body: {
        paddingTop: 0
      }
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
    }} styles={{
      body: {
        paddingTop: 0
      }
    }}>
        <BAIText type="danger" monospace strong italic underline ellipsis={{
        expandable: true,
        rows: 1,
        tooltip: true
      }} copyable delete>
          Monospace strong italic underlined text with ellipsis and copy for
          very long expandable content that is also marked as deleted
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
}`,...(ge=(be=I.parameters)==null?void 0:be.docs)==null?void 0:ge.source}}};const qe=["Default","Types","Styles","Monospace","Copyable","SingleLineEllipsis","MultiLineEllipsis","EllipsisWithCustomTooltip","EllipsisDisabledTooltip","ExpandableEllipsis","ExpandableWithOtherFeatures","Interactive","Keyboard","Code","Mark","Disabled","RealWorldExamples"];export{g as Code,d as Copyable,n as Default,w as Disabled,u as EllipsisDisabledTooltip,y as EllipsisWithCustomTooltip,m as ExpandableEllipsis,h as ExpandableWithOtherFeatures,x as Interactive,b as Keyboard,T as Mark,r as Monospace,p as MultiLineEllipsis,I as RealWorldExamples,c as SingleLineEllipsis,l as Styles,a as Types,qe as __namedExportsOrder,De as default};
