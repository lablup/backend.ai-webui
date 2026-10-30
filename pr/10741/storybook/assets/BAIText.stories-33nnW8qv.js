import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t as ee}from"./jsx-runtime-MKhVqBIO.js";import{n as te,t}from"./BAICard-CEQ9WodL.js";import{n as ne,t as n}from"./Kbd-CCqC0207.js";import{h as re,m as r}from"./iframe-bDK6eSvz.js";import{n as ie,t as i}from"./BAIFlex-DnaoYTJ1.js";var a,o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q;function $(){return($=e((()=>{te(),ie(),re(),ne(),a=ee(),I={title:`Text/BAIText`,component:r,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:"\n**BAIText** keeps the [Ant Design Typography.Text](https://ant.design/components/typography)-shaped prop surface and the antd-era structure — one inline span, which becomes an inline-flex row holding the clamp box, the tooltip and the copy control when `ellipsis` / `copyable` are set — rendered on Astryx tokens, with the tooltip on Astryx `Tooltip` and the copy control on Astryx `IconButton` + `navigator.clipboard`.\n\n## BAI-Specific Props\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `monospace` | `boolean` | `false` | Use monospace font family |\n| `ellipsis` | `boolean \\| EllipsisConfig` | `false` | Custom CSS-based ellipsis with Safari compatibility |\n\n## BAI-Specific Features\n| Feature | Description |\n|---------|-------------|\n| Monospace Font | Simple boolean prop to use monospace font family |\n| CSS-based Ellipsis | Re-implemented ellipsis using CSS with Safari compatibility |\n| Multi-line Truncation | Supports multi-line ellipsis using `-webkit-line-clamp` |\n| Tooltip Integration | Automatically shows tooltip when text is truncated |\n| Copy with Ellipsis | Copy functionality works correctly with ellipsis |\n\n## Ellipsis Config\n```typescript\ninterface EllipsisConfig {\n  rows?: number;          // Number of lines before truncation (default: 1)\n  tooltip?: boolean | TooltipProps;  // Show tooltip on hover\n}\n```\n\nFor all other props, see `BAIText.tsx` — the antd-shaped types (`BAITextEllipsisConfig`, `BAITextCopyConfig`) are declared locally. `copyable` takes antd's `[resting, copied]` tuples for `icon` and `tooltips`.\n        "}}},argTypes:{children:{control:!1,description:`The text content to display`,table:{type:{summary:`ReactNode`}}},type:{control:{type:`select`},options:[`secondary`,`success`,`warning`,`danger`,void 0],description:`Text type for semantic styling`,table:{type:{summary:`'secondary' | 'success' | 'warning' | 'danger'`}}},monospace:{control:{type:`boolean`},description:`Use monospace font family (BAI-specific prop for code, paths, etc.)`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},ellipsis:{control:{type:`boolean`},description:`Enable CSS-based ellipsis with Safari compatibility (BAI-specific implementation). Can be boolean or EllipsisConfig object with rows and tooltip options`,table:{type:{summary:`boolean | EllipsisConfig`},defaultValue:{summary:`false`}}},copyable:{control:{type:`boolean`},description:`Enable copy-to-clipboard functionality`,table:{type:{summary:`boolean | CopyConfig`},defaultValue:{summary:`false`}}},strong:{control:{type:`boolean`},description:`Bold text`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},italic:{control:{type:`boolean`},description:`Italic text`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},underline:{control:{type:`boolean`},description:`Underlined text`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},delete:{control:{type:`boolean`},description:`Strikethrough text`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},mark:{control:{type:`boolean`},description:`Highlighted/marked text with background color`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},code:{control:{type:`boolean`},description:`Inline code styling with background and border`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},keyboard:{control:{type:`boolean`},description:"Render the children as an Astryx Kbd shortcut (`+`-separated keys)",table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},disabled:{control:{type:`boolean`},description:`Disabled state with reduced opacity`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}}}},L={name:`Basic`,args:{children:`This is a basic text component`},parameters:{docs:{description:{story:`Basic usage of BAIText with default styling.`}}}},R={name:`SemanticTypes`,render:()=>(0,a.jsxs)(i,{direction:`column`,children:[(0,a.jsx)(r,{children:`Default Text`}),(0,a.jsx)(r,{type:`secondary`,children:`Secondary Text`}),(0,a.jsx)(r,{type:`success`,children:`Success Text`}),(0,a.jsx)(r,{type:`warning`,children:`Warning Text`}),(0,a.jsx)(r,{type:`danger`,children:`Danger Text`})]}),parameters:{docs:{description:{story:`Different semantic text types with corresponding colors.`}}}},z={name:`TextStyles`,render:()=>(0,a.jsxs)(i,{direction:`column`,children:[(0,a.jsx)(r,{strong:!0,children:`Strong Text`}),(0,a.jsx)(r,{italic:!0,children:`Italic Text`}),(0,a.jsx)(r,{underline:!0,children:`Underlined Text`}),(0,a.jsx)(r,{delete:!0,children:`Deleted Text`}),(0,a.jsx)(r,{strong:!0,italic:!0,underline:!0,children:`Combined Styles`})]}),parameters:{docs:{description:{story:`Various text styling options and combinations.`}}}},B={name:`MonospaceFont`,render:()=>(0,a.jsxs)(i,{direction:`column`,children:[(0,a.jsx)(r,{children:`Regular: 1234567890 ABCDEFG`}),(0,a.jsx)(r,{monospace:!0,children:`Monospace: 1234567890 ABCDEFG`}),(0,a.jsx)(r,{monospace:!0,type:`secondary`,children:`Monospace Secondary: /path/to/file.txt`}),(0,a.jsx)(r,{monospace:!0,copyable:!0,children:`npm install backend.ai-ui`})]}),parameters:{docs:{description:{story:`Monospace font styling, useful for code snippets, file paths, and technical content.`}}}},V={name:`CopyableText`,render:()=>(0,a.jsxs)(i,{direction:`column`,children:[(0,a.jsx)(r,{copyable:!0,children:`Click icon to copy this text`}),(0,a.jsx)(r,{copyable:{text:`Custom copied text!`},children:`Copy custom text`}),(0,a.jsx)(r,{monospace:!0,copyable:!0,type:`secondary`,children:`1234567890abcdef`}),(0,a.jsx)(r,{copyable:{icon:[(0,a.jsx)(`span`,{children:`📋`},`copy`),(0,a.jsx)(`span`,{children:`✅`},`copied`)],tooltips:[`Copy to clipboard`,`Copied!`]},children:`Text with custom copy icons`})]}),parameters:{docs:{description:{story:`Text with copy-to-clipboard functionality including custom icons and tooltips.`}}}},H={name:`SingleLineEllipsis`,render:()=>(0,a.jsxs)(i,{direction:`column`,style:{width:`100%`},children:[(0,a.jsx)(t,{size:`small`,style:{width:300},children:(0,a.jsx)(r,{ellipsis:{tooltip:!0},children:`This is a very long text that will be truncated with ellipsis when it exceeds the container width. Hover to see full content.`})}),(0,a.jsx)(t,{size:`small`,style:{width:200},children:(0,a.jsx)(r,{ellipsis:{tooltip:!0},monospace:!0,children:`/very/long/path/to/some/file/in/system.txt`})}),(0,a.jsx)(t,{size:`small`,style:{width:250},children:(0,a.jsx)(r,{ellipsis:{tooltip:!0},type:`secondary`,children:`user@example.com with a very long email address that overflows`})})]}),parameters:{docs:{description:{story:`Single-line ellipsis with tooltip on hover when text overflows. Uses CSS-based truncation with Safari compatibility.`}}}},U={name:`MultiLineEllipsis`,render:()=>(0,a.jsxs)(i,{direction:`column`,style:{width:`100%`},children:[(0,a.jsx)(t,{size:`small`,style:{width:400},children:(0,a.jsx)(r,{ellipsis:{rows:2,tooltip:!0},children:`This is a longer text that spans multiple lines. When it exceeds the specified number of rows, it will be truncated with ellipsis. The tooltip will show the full content when you hover over the truncated text. This demonstrates multi-line ellipsis functionality.`})}),(0,a.jsx)(t,{size:`small`,style:{width:300},children:(0,a.jsx)(r,{ellipsis:{rows:3,tooltip:!0},type:`secondary`,children:`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`})})]}),parameters:{docs:{description:{story:`Multi-line ellipsis using -webkit-line-clamp for Safari compatibility. Tooltip appears on hover when text is truncated.`}}}},W={name:`CustomTooltip`,render:()=>(0,a.jsxs)(i,{direction:`column`,style:{width:`100%`},children:[(0,a.jsx)(t,{size:`small`,style:{width:300},children:(0,a.jsx)(r,{ellipsis:{rows:1,tooltip:{title:`Custom tooltip content`}},children:`Text with custom tooltip configuration and placement`})}),(0,a.jsx)(t,{size:`small`,style:{width:250},children:(0,a.jsx)(r,{ellipsis:{rows:2,tooltip:{title:`This tooltip has custom styling`}},children:`Multi-line text with custom colored tooltip when it overflows beyond two rows`})})]}),parameters:{docs:{description:{story:`Ellipsis with custom tooltip configuration including placement and styling.`}}}},G={name:`NoTooltip (Default)`,render:()=>(0,a.jsx)(t,{size:`small`,style:{width:300},children:(0,a.jsx)(r,{ellipsis:{rows:1},children:`This text will be truncated but no tooltip will appear on hover even when it overflows`})}),parameters:{docs:{description:{story:`Ellipsis without tooltip functionality.`}}}},K={name:`InteractiveText`,render:()=>(0,a.jsxs)(i,{direction:`column`,children:[(0,a.jsx)(r,{copyable:!0,children:`Click the glyph to copy this line`}),(0,a.jsx)(r,{copyable:{text:`the-full-untruncated-value`},ellipsis:!0,children:`A truncated value whose copy target is the full string`})]}),parameters:{docs:{description:{story:"Interactive text. antd's `editable` inline-edit affordance is not part of the surface — no production call site used it. `copyable` is built on `IconButton` + `navigator.clipboard`; with `ellipsis`, `copyable.text` keeps the clipboard target at the full value."}}}},q={name:`KeyboardShortcuts`,render:()=>(0,a.jsxs)(i,{direction:`column`,gap:`md`,align:`start`,children:[(0,a.jsxs)(`div`,{children:[(0,a.jsx)(r,{type:`secondary`,children:`Copy: `}),` `,(0,a.jsx)(n,{keys:`mod+c`})]}),(0,a.jsxs)(`div`,{children:[(0,a.jsx)(r,{type:`secondary`,children:`Quick open: `}),` `,(0,a.jsx)(n,{keys:`mod+shift+p`})]}),(0,a.jsxs)(`div`,{children:[(0,a.jsx)(r,{type:`secondary`,children:`A single literal key: `}),` `,(0,a.jsx)(n,{keys:`]`})]}),(0,a.jsxs)(`div`,{children:[(0,a.jsx)(r,{type:`secondary`,children:`Through the prop: `}),(0,a.jsx)(r,{keyboard:!0,children:`mod+c`})]}),(0,a.jsx)(`div`,{children:(0,a.jsx)(r,{keyboard:!0,copyable:!0,children:`shift+enter`})})]}),parameters:{docs:{description:{story:'Shortcut badges are Astryx `Kbd`; it takes a `keys` spec rather than children, and a key it does not know (`]`) is rendered verbatim. `BAIText keyboard` (the antd `Typography.Text keyboard` prop) hands its text to `Kbd` as that spec, so the two forms render the same badges. For `Kbd` on a DARK tooltip bubble wrap the content in `MediaTheme mode="dark"` (never the whole `Tooltip`): `useTooltip` hardcodes its bubble colours without flipping token context, and the host app pins its tooltip dark in BOTH modes via `ANTD_HOVER_PARITY`.'}}}},J={name:`CodeBlocks`,render:()=>(0,a.jsxs)(i,{direction:`column`,children:[(0,a.jsx)(r,{code:!0,children:`const greeting = "Hello World";`}),(0,a.jsx)(r,{code:!0,copyable:!0,children:`npm install backend.ai-ui`}),(0,a.jsxs)(r,{code:!0,type:`secondary`,children:[`import `,`{ BAIText }`,` from 'backend.ai-ui';`]}),(0,a.jsxs)(`div`,{children:[`Run `,(0,a.jsx)(r,{code:!0,children:`pnpm run dev`}),` to start development server`]})]}),parameters:{docs:{description:{story:`Inline code blocks with code styling.`}}}},Y={name:`HighlightedText`,render:()=>(0,a.jsxs)(i,{direction:`column`,children:[(0,a.jsx)(r,{mark:!0,children:`Highlighted text`}),(0,a.jsx)(r,{mark:!0,type:`danger`,children:`Important highlighted warning`}),(0,a.jsxs)(`div`,{children:[`This is a `,(0,a.jsx)(r,{mark:!0,children:`highlighted`}),` word in a sentence.`]})]}),parameters:{docs:{description:{story:`Text with highlight/mark styling.`}}}},X={name:`DisabledState`,render:()=>(0,a.jsxs)(i,{direction:`column`,children:[(0,a.jsx)(r,{disabled:!0,children:`Disabled text`}),(0,a.jsx)(r,{disabled:!0,type:`secondary`,children:`Disabled secondary text`}),(0,a.jsx)(r,{disabled:!0,copyable:!0,children:`Disabled with copyable (copyable still works)`})]}),parameters:{docs:{description:{story:`Text in disabled state with reduced opacity.`}}}},Z={name:`RealWorldUsage`,render:()=>(0,a.jsxs)(i,{direction:`column`,style:{width:`100%`},gap:`lg`,children:[(0,a.jsx)(t,{title:`File Path`,size:`small`,style:{width:400},children:(0,a.jsx)(r,{monospace:!0,ellipsis:{tooltip:!0},copyable:!0,children:`/home/user/projects/backend.ai-webui/react/src/components/AgentStats.tsx`})}),(0,a.jsxs)(t,{title:`API Key`,size:`small`,style:{width:450},children:[(0,a.jsx)(r,{monospace:!0,type:`secondary`,copyable:!0,children:`1234567890abcdefghijklmnopqrstuvwxyz`}),(0,a.jsx)(`br`,{}),(0,a.jsx)(r,{type:`secondary`,children:`Access Token with Ellipsis: `}),(0,a.jsx)(r,{code:!0,copyable:!0,ellipsis:{tooltip:!0},children:`1234567890abcdefghijklmnopqrstuvwxyz_very_long_token_string`})]}),(0,a.jsx)(t,{title:`Error Message`,size:`small`,style:{width:450},children:(0,a.jsx)(r,{type:`danger`,ellipsis:{rows:2,tooltip:!0},children:`Failed to load resource: net::ERR_CONNECTION_REFUSED at https://example.com/api/v1/endpoint. Please check your network connection and try again.`})}),(0,a.jsx)(t,{title:`User Email`,size:`small`,style:{width:300},children:(0,a.jsx)(r,{ellipsis:{tooltip:!0},copyable:!0,children:`user.with.very.long.name@company.example.com`})}),(0,a.jsx)(t,{title:`Description`,size:`small`,style:{width:350},children:(0,a.jsx)(r,{type:`secondary`,ellipsis:{rows:3,tooltip:!0},children:`This is a sample description that might be quite long and needs to be truncated to maintain a clean UI. The full content will be available in a tooltip when users hover over the truncated text. This provides a good balance between information density and usability.`})}),(0,a.jsxs)(t,{title:`Command & Keyboard`,size:`small`,style:{width:200},children:[(0,a.jsx)(r,{type:`secondary`,children:`To copy the command: `}),(0,a.jsx)(n,{keys:`mod+c`}),(0,a.jsx)(`br`,{}),(0,a.jsx)(r,{code:!0,copyable:!0,children:`git clone repository.git`}),(0,a.jsx)(`br`,{}),(0,a.jsx)(r,{type:`secondary`,children:`Quick Open: `}),(0,a.jsx)(n,{keys:`mod+shift+p`})]}),(0,a.jsxs)(t,{title:`Status Update`,size:`small`,style:{width:400},children:[(0,a.jsx)(r,{strong:!0,mark:!0,type:`warning`,children:`Action Required:`}),(0,a.jsx)(`br`,{}),(0,a.jsx)(r,{children:`Your subscription expires in 3 days.`})]}),(0,a.jsxs)(t,{title:`Version Info`,size:`small`,style:{width:400},children:[(0,a.jsx)(r,{delete:!0,type:`secondary`,children:`Old version: 1.0.0`}),(0,a.jsx)(`br`,{}),(0,a.jsx)(r,{strong:!0,type:`success`,children:`Current version: 2.0.0`})]}),(0,a.jsxs)(t,{title:`Deprecation Notice`,size:`small`,style:{width:450},children:[(0,a.jsx)(r,{type:`warning`,strong:!0,children:`⚠️ Deprecated:`}),` `,(0,a.jsx)(r,{code:!0,delete:!0,children:`oldFunction()`}),(0,a.jsx)(r,{type:`secondary`,children:` → Use `}),(0,a.jsx)(r,{code:!0,type:`success`,children:`newFunction()`}),(0,a.jsx)(r,{type:`secondary`,children:` instead`})]}),(0,a.jsx)(t,{title:`Combined Styles`,size:`small`,style:{width:400},children:(0,a.jsx)(r,{type:`danger`,monospace:!0,strong:!0,italic:!0,underline:!0,ellipsis:{rows:1,tooltip:!0},copyable:!0,delete:!0,children:`Monospace strong italic underlined text with ellipsis and copy for very long content that is also marked as deleted`})})]}),parameters:{docs:{description:{story:`Real-world usage examples demonstrating various combinations of features in practical scenarios like file paths, API keys, error messages, commands, version info, and complex text styling.`}}}},L.parameters={...L.parameters,docs:{...(o=L.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
}`,...(s=L.parameters)==null||(s=s.docs)==null?void 0:s.source}}},R.parameters={...R.parameters,docs:{...(c=R.parameters)==null?void 0:c.docs,source:{originalSource:`{
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
}`,...(l=R.parameters)==null||(l=l.docs)==null?void 0:l.source}}},z.parameters={...z.parameters,docs:{...(u=z.parameters)==null?void 0:u.docs,source:{originalSource:`{
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
}`,...(d=z.parameters)==null||(d=d.docs)==null?void 0:d.source}}},B.parameters={...B.parameters,docs:{...(f=B.parameters)==null?void 0:f.docs,source:{originalSource:`{
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
}`,...(p=B.parameters)==null||(p=p.docs)==null?void 0:p.source}}},V.parameters={...V.parameters,docs:{...(m=V.parameters)==null?void 0:m.docs,source:{originalSource:`{
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
}`,...(h=V.parameters)==null||(h=h.docs)==null?void 0:h.source}}},H.parameters={...H.parameters,docs:{...(g=H.parameters)==null?void 0:g.docs,source:{originalSource:`{
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
}`,...(_=H.parameters)==null||(_=_.docs)==null?void 0:_.source}}},U.parameters={...U.parameters,docs:{...(v=U.parameters)==null?void 0:v.docs,source:{originalSource:`{
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
}`,...(y=U.parameters)==null||(y=y.docs)==null?void 0:y.source}}},W.parameters={...W.parameters,docs:{...(b=W.parameters)==null?void 0:b.docs,source:{originalSource:`{
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
}`,...(x=W.parameters)==null||(x=x.docs)==null?void 0:x.source}}},G.parameters={...G.parameters,docs:{...(S=G.parameters)==null?void 0:S.docs,source:{originalSource:`{
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
}`,...(C=G.parameters)==null||(C=C.docs)==null?void 0:C.source}}},K.parameters={...K.parameters,docs:{...(w=K.parameters)==null?void 0:w.docs,source:{originalSource:`{
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
}`,...(T=K.parameters)==null||(T=T.docs)==null?void 0:T.source}}},q.parameters={...q.parameters,docs:{...(E=q.parameters)==null?void 0:E.docs,source:{originalSource:`{
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
}`,...(D=q.parameters)==null||(D=D.docs)==null?void 0:D.source}}},J.parameters={...J.parameters,docs:{...(O=J.parameters)==null?void 0:O.docs,source:{originalSource:`{
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
}`,...(k=J.parameters)==null||(k=k.docs)==null?void 0:k.source}}},Y.parameters={...Y.parameters,docs:{...(A=Y.parameters)==null?void 0:A.docs,source:{originalSource:`{
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
}`,...(j=Y.parameters)==null||(j=j.docs)==null?void 0:j.source}}},X.parameters={...X.parameters,docs:{...(M=X.parameters)==null?void 0:M.docs,source:{originalSource:`{
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
}`,...(N=X.parameters)==null||(N=N.docs)==null?void 0:N.source}}},Z.parameters={...Z.parameters,docs:{...(P=Z.parameters)==null?void 0:P.docs,source:{originalSource:`{
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
}`,...(F=Z.parameters)==null||(F=F.docs)==null?void 0:F.source}}},Q=[`Default`,`Types`,`Styles`,`Monospace`,`Copyable`,`SingleLineEllipsis`,`MultiLineEllipsis`,`EllipsisWithCustomTooltip`,`EllipsisDisabledTooltip`,`Interactive`,`Keyboard`,`Code`,`Mark`,`Disabled`,`RealWorldExamples`]})))()}$();export{J as Code,V as Copyable,L as Default,X as Disabled,G as EllipsisDisabledTooltip,W as EllipsisWithCustomTooltip,K as Interactive,q as Keyboard,Y as Mark,B as Monospace,U as MultiLineEllipsis,Z as RealWorldExamples,H as SingleLineEllipsis,z as Styles,R as Types,Q as __namedExportsOrder,I as default};