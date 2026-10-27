import{n as e}from"./rolldown-runtime-2s6bX4vc.js";import{c as t,s as n}from"./iframe-DR2sIF5r.js";import{n as r,t as i}from"./BAIFlex-CAz1t6J5.js";import{n as a,t as o}from"./BAICard-W1ezccn9.js";import{jsx as s,jsxs as c}from"react/jsx-runtime";import{Kbd as l}from"@lablup/ui-common/Kbd";var u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E;function D(){return(D=e((()=>{a(),r(),t(),u={title:`Text/BAIText`,component:n,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:"\n**BAIText** keeps the [Ant Design Typography.Text](https://ant.design/components/typography)-shaped prop surface and the antd-era structure — one inline span, which becomes an inline-flex row holding the clamp box, the tooltip and the copy control when `ellipsis` / `copyable` are set — rendered on Astryx tokens, with the tooltip on Astryx `Tooltip` and the copy control on Astryx `IconButton` + `navigator.clipboard`.\n\n## BAI-Specific Props\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `monospace` | `boolean` | `false` | Use monospace font family |\n| `ellipsis` | `boolean \\| EllipsisConfig` | `false` | Custom CSS-based ellipsis with Safari compatibility |\n\n## BAI-Specific Features\n| Feature | Description |\n|---------|-------------|\n| Monospace Font | Simple boolean prop to use monospace font family |\n| CSS-based Ellipsis | Re-implemented ellipsis using CSS with Safari compatibility |\n| Multi-line Truncation | Supports multi-line ellipsis using `-webkit-line-clamp` |\n| Tooltip Integration | Automatically shows tooltip when text is truncated |\n| Copy with Ellipsis | Copy functionality works correctly with ellipsis |\n\n## Ellipsis Config\n```typescript\ninterface EllipsisConfig {\n  rows?: number;          // Number of lines before truncation (default: 1)\n  tooltip?: boolean | TooltipProps;  // Show tooltip on hover\n}\n```\n\nFor all other props, see `BAIText.tsx` — the antd-shaped types (`BAITextEllipsisConfig`, `BAITextCopyConfig`) are declared locally. `copyable` takes antd's `[resting, copied]` tuples for `icon` and `tooltips`.\n        "}}},argTypes:{children:{control:!1,description:`The text content to display`,table:{type:{summary:`ReactNode`}}},type:{control:{type:`select`},options:[`secondary`,`success`,`warning`,`danger`,void 0],description:`Text type for semantic styling`,table:{type:{summary:`'secondary' | 'success' | 'warning' | 'danger'`}}},monospace:{control:{type:`boolean`},description:`Use monospace font family (BAI-specific prop for code, paths, etc.)`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},ellipsis:{control:{type:`boolean`},description:`Enable CSS-based ellipsis with Safari compatibility (BAI-specific implementation). Can be boolean or EllipsisConfig object with rows and tooltip options`,table:{type:{summary:`boolean | EllipsisConfig`},defaultValue:{summary:`false`}}},copyable:{control:{type:`boolean`},description:`Enable copy-to-clipboard functionality`,table:{type:{summary:`boolean | CopyConfig`},defaultValue:{summary:`false`}}},strong:{control:{type:`boolean`},description:`Bold text`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},italic:{control:{type:`boolean`},description:`Italic text`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},underline:{control:{type:`boolean`},description:`Underlined text`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},delete:{control:{type:`boolean`},description:`Strikethrough text`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},mark:{control:{type:`boolean`},description:`Highlighted/marked text with background color`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},code:{control:{type:`boolean`},description:`Inline code styling with background and border`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},keyboard:{control:{type:`boolean`},description:"Render the children as an Astryx Kbd shortcut (`+`-separated keys)",table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},disabled:{control:{type:`boolean`},description:`Disabled state with reduced opacity`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}}}},d={name:`Basic`,args:{children:`This is a basic text component`},parameters:{docs:{description:{story:`Basic usage of BAIText with default styling.`}}}},f={name:`SemanticTypes`,render:()=>c(i,{direction:`column`,children:[s(n,{children:`Default Text`}),s(n,{type:`secondary`,children:`Secondary Text`}),s(n,{type:`success`,children:`Success Text`}),s(n,{type:`warning`,children:`Warning Text`}),s(n,{type:`danger`,children:`Danger Text`})]}),parameters:{docs:{description:{story:`Different semantic text types with corresponding colors.`}}}},p={name:`TextStyles`,render:()=>c(i,{direction:`column`,children:[s(n,{strong:!0,children:`Strong Text`}),s(n,{italic:!0,children:`Italic Text`}),s(n,{underline:!0,children:`Underlined Text`}),s(n,{delete:!0,children:`Deleted Text`}),s(n,{strong:!0,italic:!0,underline:!0,children:`Combined Styles`})]}),parameters:{docs:{description:{story:`Various text styling options and combinations.`}}}},m={name:`MonospaceFont`,render:()=>c(i,{direction:`column`,children:[s(n,{children:`Regular: 1234567890 ABCDEFG`}),s(n,{monospace:!0,children:`Monospace: 1234567890 ABCDEFG`}),s(n,{monospace:!0,type:`secondary`,children:`Monospace Secondary: /path/to/file.txt`}),s(n,{monospace:!0,copyable:!0,children:`npm install backend.ai-ui`})]}),parameters:{docs:{description:{story:`Monospace font styling, useful for code snippets, file paths, and technical content.`}}}},h={name:`CopyableText`,render:()=>c(i,{direction:`column`,children:[s(n,{copyable:!0,children:`Click icon to copy this text`}),s(n,{copyable:{text:`Custom copied text!`},children:`Copy custom text`}),s(n,{monospace:!0,copyable:!0,type:`secondary`,children:`1234567890abcdef`}),s(n,{copyable:{icon:[s(`span`,{children:`📋`},`copy`),s(`span`,{children:`✅`},`copied`)],tooltips:[`Copy to clipboard`,`Copied!`]},children:`Text with custom copy icons`})]}),parameters:{docs:{description:{story:`Text with copy-to-clipboard functionality including custom icons and tooltips.`}}}},g={name:`SingleLineEllipsis`,render:()=>c(i,{direction:`column`,style:{width:`100%`},children:[s(o,{size:`small`,style:{width:300},children:s(n,{ellipsis:{tooltip:!0},children:`This is a very long text that will be truncated with ellipsis when it exceeds the container width. Hover to see full content.`})}),s(o,{size:`small`,style:{width:200},children:s(n,{ellipsis:{tooltip:!0},monospace:!0,children:`/very/long/path/to/some/file/in/system.txt`})}),s(o,{size:`small`,style:{width:250},children:s(n,{ellipsis:{tooltip:!0},type:`secondary`,children:`user@example.com with a very long email address that overflows`})})]}),parameters:{docs:{description:{story:`Single-line ellipsis with tooltip on hover when text overflows. Uses CSS-based truncation with Safari compatibility.`}}}},_={name:`MultiLineEllipsis`,render:()=>c(i,{direction:`column`,style:{width:`100%`},children:[s(o,{size:`small`,style:{width:400},children:s(n,{ellipsis:{rows:2,tooltip:!0},children:`This is a longer text that spans multiple lines. When it exceeds the specified number of rows, it will be truncated with ellipsis. The tooltip will show the full content when you hover over the truncated text. This demonstrates multi-line ellipsis functionality.`})}),s(o,{size:`small`,style:{width:300},children:s(n,{ellipsis:{rows:3,tooltip:!0},type:`secondary`,children:`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`})})]}),parameters:{docs:{description:{story:`Multi-line ellipsis using -webkit-line-clamp for Safari compatibility. Tooltip appears on hover when text is truncated.`}}}},v={name:`CustomTooltip`,render:()=>c(i,{direction:`column`,style:{width:`100%`},children:[s(o,{size:`small`,style:{width:300},children:s(n,{ellipsis:{rows:1,tooltip:{title:`Custom tooltip content`}},children:`Text with custom tooltip configuration and placement`})}),s(o,{size:`small`,style:{width:250},children:s(n,{ellipsis:{rows:2,tooltip:{title:`This tooltip has custom styling`}},children:`Multi-line text with custom colored tooltip when it overflows beyond two rows`})})]}),parameters:{docs:{description:{story:`Ellipsis with custom tooltip configuration including placement and styling.`}}}},y={name:`NoTooltip (Default)`,render:()=>s(o,{size:`small`,style:{width:300},children:s(n,{ellipsis:{rows:1},children:`This text will be truncated but no tooltip will appear on hover even when it overflows`})}),parameters:{docs:{description:{story:`Ellipsis without tooltip functionality.`}}}},b={name:`InteractiveText`,render:()=>c(i,{direction:`column`,children:[s(n,{copyable:!0,children:`Click the glyph to copy this line`}),s(n,{copyable:{text:`the-full-untruncated-value`},ellipsis:!0,children:`A truncated value whose copy target is the full string`})]}),parameters:{docs:{description:{story:"Interactive text. antd's `editable` inline-edit affordance is not part of the surface — no production call site used it. `copyable` is built on `IconButton` + `navigator.clipboard`; with `ellipsis`, `copyable.text` keeps the clipboard target at the full value."}}}},x={name:`KeyboardShortcuts`,render:()=>c(i,{direction:`column`,gap:`md`,align:`start`,children:[c(`div`,{children:[s(n,{type:`secondary`,children:`Copy: `}),` `,s(l,{keys:`mod+c`})]}),c(`div`,{children:[s(n,{type:`secondary`,children:`Quick open: `}),` `,s(l,{keys:`mod+shift+p`})]}),c(`div`,{children:[s(n,{type:`secondary`,children:`A single literal key: `}),` `,s(l,{keys:`]`})]}),c(`div`,{children:[s(n,{type:`secondary`,children:`Through the prop: `}),s(n,{keyboard:!0,children:`mod+c`})]}),s(`div`,{children:s(n,{keyboard:!0,copyable:!0,children:`shift+enter`})})]}),parameters:{docs:{description:{story:'Shortcut badges are Astryx `Kbd`; it takes a `keys` spec rather than children, and a key it does not know (`]`) is rendered verbatim. `BAIText keyboard` (the antd `Typography.Text keyboard` prop) hands its text to `Kbd` as that spec, so the two forms render the same badges. For `Kbd` on a DARK tooltip bubble wrap the content in `MediaTheme mode="dark"` (never the whole `Tooltip`): `useTooltip` hardcodes its bubble colours without flipping token context, and the host app pins its tooltip dark in BOTH modes via `ANTD_HOVER_PARITY`.'}}}},S={name:`CodeBlocks`,render:()=>c(i,{direction:`column`,children:[s(n,{code:!0,children:`const greeting = "Hello World";`}),s(n,{code:!0,copyable:!0,children:`npm install backend.ai-ui`}),c(n,{code:!0,type:`secondary`,children:[`import `,`{ BAIText }`,` from 'backend.ai-ui';`]}),c(`div`,{children:[`Run `,s(n,{code:!0,children:`pnpm run dev`}),` to start development server`]})]}),parameters:{docs:{description:{story:`Inline code blocks with code styling.`}}}},C={name:`HighlightedText`,render:()=>c(i,{direction:`column`,children:[s(n,{mark:!0,children:`Highlighted text`}),s(n,{mark:!0,type:`danger`,children:`Important highlighted warning`}),c(`div`,{children:[`This is a `,s(n,{mark:!0,children:`highlighted`}),` word in a sentence.`]})]}),parameters:{docs:{description:{story:`Text with highlight/mark styling.`}}}},w={name:`DisabledState`,render:()=>c(i,{direction:`column`,children:[s(n,{disabled:!0,children:`Disabled text`}),s(n,{disabled:!0,type:`secondary`,children:`Disabled secondary text`}),s(n,{disabled:!0,copyable:!0,children:`Disabled with copyable (copyable still works)`})]}),parameters:{docs:{description:{story:`Text in disabled state with reduced opacity.`}}}},T={name:`RealWorldUsage`,render:()=>c(i,{direction:`column`,style:{width:`100%`},gap:`lg`,children:[s(o,{title:`File Path`,size:`small`,style:{width:400},children:s(n,{monospace:!0,ellipsis:{tooltip:!0},copyable:!0,children:`/home/user/projects/backend.ai-webui/react/src/components/AgentStats.tsx`})}),c(o,{title:`API Key`,size:`small`,style:{width:450},children:[s(n,{monospace:!0,type:`secondary`,copyable:!0,children:`1234567890abcdefghijklmnopqrstuvwxyz`}),s(`br`,{}),s(n,{type:`secondary`,children:`Access Token with Ellipsis: `}),s(n,{code:!0,copyable:!0,ellipsis:{tooltip:!0},children:`1234567890abcdefghijklmnopqrstuvwxyz_very_long_token_string`})]}),s(o,{title:`Error Message`,size:`small`,style:{width:450},children:s(n,{type:`danger`,ellipsis:{rows:2,tooltip:!0},children:`Failed to load resource: net::ERR_CONNECTION_REFUSED at https://example.com/api/v1/endpoint. Please check your network connection and try again.`})}),s(o,{title:`User Email`,size:`small`,style:{width:300},children:s(n,{ellipsis:{tooltip:!0},copyable:!0,children:`user.with.very.long.name@company.example.com`})}),s(o,{title:`Description`,size:`small`,style:{width:350},children:s(n,{type:`secondary`,ellipsis:{rows:3,tooltip:!0},children:`This is a sample description that might be quite long and needs to be truncated to maintain a clean UI. The full content will be available in a tooltip when users hover over the truncated text. This provides a good balance between information density and usability.`})}),c(o,{title:`Command & Keyboard`,size:`small`,style:{width:200},children:[s(n,{type:`secondary`,children:`To copy the command: `}),s(l,{keys:`mod+c`}),s(`br`,{}),s(n,{code:!0,copyable:!0,children:`git clone repository.git`}),s(`br`,{}),s(n,{type:`secondary`,children:`Quick Open: `}),s(l,{keys:`mod+shift+p`})]}),c(o,{title:`Status Update`,size:`small`,style:{width:400},children:[s(n,{strong:!0,mark:!0,type:`warning`,children:`Action Required:`}),s(`br`,{}),s(n,{children:`Your subscription expires in 3 days.`})]}),c(o,{title:`Version Info`,size:`small`,style:{width:400},children:[s(n,{delete:!0,type:`secondary`,children:`Old version: 1.0.0`}),s(`br`,{}),s(n,{strong:!0,type:`success`,children:`Current version: 2.0.0`})]}),c(o,{title:`Deprecation Notice`,size:`small`,style:{width:450},children:[s(n,{type:`warning`,strong:!0,children:`⚠️ Deprecated:`}),` `,s(n,{code:!0,delete:!0,children:`oldFunction()`}),s(n,{type:`secondary`,children:` → Use `}),s(n,{code:!0,type:`success`,children:`newFunction()`}),s(n,{type:`secondary`,children:` instead`})]}),s(o,{title:`Combined Styles`,size:`small`,style:{width:400},children:s(n,{type:`danger`,monospace:!0,strong:!0,italic:!0,underline:!0,ellipsis:{rows:1,tooltip:!0},copyable:!0,delete:!0,children:`Monospace strong italic underlined text with ellipsis and copy for very long content that is also marked as deleted`})})]}),parameters:{docs:{description:{story:`Real-world usage examples demonstrating various combinations of features in practical scenarios like file paths, API keys, error messages, commands, version info, and complex text styling.`}}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
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
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
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
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
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
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
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
}`,...T.parameters?.docs?.source}}},E=[`Default`,`Types`,`Styles`,`Monospace`,`Copyable`,`SingleLineEllipsis`,`MultiLineEllipsis`,`EllipsisWithCustomTooltip`,`EllipsisDisabledTooltip`,`Interactive`,`Keyboard`,`Code`,`Mark`,`Disabled`,`RealWorldExamples`]})))()}D();export{S as Code,h as Copyable,d as Default,w as Disabled,y as EllipsisDisabledTooltip,v as EllipsisWithCustomTooltip,b as Interactive,x as Keyboard,C as Mark,m as Monospace,_ as MultiLineEllipsis,T as RealWorldExamples,g as SingleLineEllipsis,p as Styles,f as Types,E as __namedExportsOrder,u as default};