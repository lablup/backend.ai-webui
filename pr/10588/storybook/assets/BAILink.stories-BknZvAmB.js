import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-MKhVqBIO.js";import{h as n,m as r}from"./iframe-BF4Nk2qQ.js";import{n as i,t as a}from"./BAIFlex-BOFoS5KY.js";import{a as o,i as s,n as c,r as l}from"./dist-BWBbun8L.js";import{n as u,t as d}from"./BAILink-wVbYRKSR.js";var f,p,m,h,g,_,v,y,b;function x(){return(x=e((()=>{i(),u(),n(),c(),f=t(),p={title:`Link/BAILink`,component:d,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:"\n**BAILink** is a hybrid link component that integrates React Router and Ant Design Typography.Link.\n\n## Features\n- Uses React Router `Link` when `to` prop is provided\n- Falls back to Ant Design `Typography.Link` when `to` is not provided\n- Custom hover and disabled states\n- Ellipsis with tooltip support via `BAIText` (CSS-based, no layout-loop risk)\n\n## Ellipsis Behavior\nWhen `ellipsis` is provided, the content is wrapped by `BAIText` internally:\n- `ellipsis={true}` — CSS truncation + tooltip showing full text on overflow\n- `ellipsis={{ tooltip: 'custom' }}` — CSS truncation + custom tooltip text\n\nThis avoids antd's JS-based `EllipsisMeasure` component, which can cause infinite\nrender loops when nested inside flex containers with `ResizeObserver`.\n\n## BAI-Specific Props\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `type` | `'hover' \\| 'disabled'` | - | Link style variant (hover effect or disabled state) |\n| `ellipsis` | `boolean \\| { tooltip?: string }` | - | Enable text ellipsis with optional tooltip |\n| `to` | `To` | - | React Router path (optional, triggers Router Link mode) |\n\nFor other props, refer to [React Router Link](https://reactrouter.com/en/main/components/link) and [Ant Design Typography](https://ant.design/components/typography).\n        "}}},argTypes:{type:{control:{type:`select`},options:[void 0,`hover`,`disabled`],description:`Link style variant`,table:{type:{summary:`'hover' | 'disabled' | undefined`}}},to:{control:{type:`object`},description:`React Router path (optional)`,table:{type:{summary:`To`}}},ellipsis:{control:!1,description:`Enable text ellipsis with optional tooltip. Internally uses BAIText for CSS-based truncation.`,table:{type:{summary:`boolean | { tooltip?: string }`}}},children:{control:{type:`text`},description:`Link content`,table:{type:{summary:`ReactNode`}}}},decorators:[e=>(0,f.jsx)(l,{initialEntries:[`/`],children:(0,f.jsxs)(o,{children:[(0,f.jsx)(s,{path:`/`,element:(0,f.jsx)(e,{})}),(0,f.jsx)(s,{path:`/example`,element:(0,f.jsx)(`div`,{children:`Example Page`})})]})})]},m={args:{to:{pathname:`/example`},children:`Navigate to Example`}},h={parameters:{docs:{description:{story:"BAILink supports `hover` and `disabled` type variants for different visual states."}}},render:()=>(0,f.jsxs)(a,{direction:`column`,gap:`md`,children:[(0,f.jsxs)(a,{direction:`column`,gap:`xs`,children:[(0,f.jsx)(`strong`,{children:`Default (no type)`}),(0,f.jsx)(d,{to:`/example`,children:`Standard link`})]}),(0,f.jsxs)(a,{direction:`column`,gap:`xs`,children:[(0,f.jsx)(`strong`,{children:`Type: hover`}),(0,f.jsx)(d,{to:`/example`,type:`hover`,children:`Link with hover underline effect`})]}),(0,f.jsxs)(a,{direction:`column`,gap:`xs`,children:[(0,f.jsx)(`strong`,{children:`Type: disabled`}),(0,f.jsx)(d,{type:`disabled`,children:`Disabled link (not clickable)`})]})]})},g={parameters:{docs:{description:{story:`Long text is truncated via CSS ellipsis (no layout-loop risk).
\`ellipsis={true}\` shows the full text as a tooltip on overflow.
Hover over the truncated links below to see the tooltip.`}}},render:()=>(0,f.jsxs)(a,{direction:`column`,gap:`md`,children:[(0,f.jsxs)(a,{direction:`column`,gap:`xs`,children:[(0,f.jsx)(`strong`,{children:`ellipsis (boolean) — tooltip on overflow`}),(0,f.jsx)(`div`,{style:{width:200},children:(0,f.jsx)(d,{ellipsis:!0,children:`This is a very long link text that will be truncated with ellipsis`})})]}),(0,f.jsxs)(a,{direction:`column`,gap:`xs`,children:[(0,f.jsx)(`strong`,{children:`ellipsis with custom tooltip`}),(0,f.jsx)(`div`,{style:{width:200},children:(0,f.jsx)(d,{ellipsis:{tooltip:`Full text shown here as tooltip`},children:`This is a very long link text that will be truncated with ellipsis`})})]})]})},_={parameters:{docs:{description:{story:"`BAILink ellipsis` nested inside `BAIText ellipsis` — as used in `BAINameActionCell`.\n\nBoth components are CSS-based and do not conflict. The outer `BAIText`'s overflow check\n(`scrollWidth > clientWidth` on its span) returns false because the inner `BAIText`\nconstrains itself to `maxWidth: 100%` of the outer span — so the outer span sees no overflow.\nOnly the inner `BAIText`'s `ResizeObserver` detects overflow and shows the tooltip.\n\nResult: a single tooltip with the plain text content (not a React element). Hover to confirm."}}},render:()=>(0,f.jsxs)(a,{direction:`column`,gap:`md`,children:[(0,f.jsxs)(a,{direction:`column`,gap:`xs`,style:{width:240},children:[(0,f.jsx)(`strong`,{children:`Overflow (truncated) — single tooltip`}),(0,f.jsx)(r,{ellipsis:{tooltip:!0},children:(0,f.jsx)(d,{type:`hover`,ellipsis:!0,children:`very-long-revision-name-abc123def456ghi789`})})]}),(0,f.jsxs)(a,{direction:`column`,gap:`xs`,style:{width:240},children:[(0,f.jsx)(`strong`,{children:`No overflow (short text)`}),(0,f.jsx)(r,{ellipsis:{tooltip:!0},children:(0,f.jsx)(d,{type:`hover`,ellipsis:!0,children:`rev-001`})})]})]})},v={parameters:{docs:{description:{story:"Tooltip content difference: `BAILink` with vs. without `ellipsis` inside `BAIText ellipsis`.\n\n- **With `ellipsis` on `BAILink`**: inner `BAIText` handles overflow; tooltip title = plain text string (clean).\n- **Without `ellipsis` on `BAILink`**: outer `BAIText` handles overflow; tooltip title = `BAILink` ReactNode (renders with link styling inside the tooltip popup).\n\nBoth show a single tooltip — the difference is only in what the tooltip renders as its title."}}},render:()=>(0,f.jsxs)(a,{direction:`column`,gap:`md`,children:[(0,f.jsxs)(a,{direction:`column`,gap:`xs`,style:{width:240},children:[(0,f.jsx)(`strong`,{children:`BAILink with ellipsis — tooltip is plain text`}),(0,f.jsx)(r,{ellipsis:{tooltip:!0},children:(0,f.jsx)(d,{type:`hover`,ellipsis:!0,children:`very-long-revision-name-abc123def456ghi789`})})]}),(0,f.jsxs)(a,{direction:`column`,gap:`xs`,style:{width:240},children:[(0,f.jsx)(`strong`,{children:`BAILink without ellipsis — tooltip is ReactNode (link)`}),(0,f.jsx)(r,{ellipsis:{tooltip:!0},children:(0,f.jsx)(d,{type:`hover`,children:`very-long-revision-name-abc123def456ghi789`})})]})]})},y={parameters:{docs:{description:{story:"`ellipsis={true}` now normalizes to `{ tooltip: true }` internally.\n\nPreviously (before this fix), `ellipsis={true}` delegated to antd's `Typography.Link`\nwhich used JS-based `EllipsisMeasure` — no tooltip, and caused infinite render loops\nwhen nested inside a `ResizeObserver`-powered container.\n\nNow it uses CSS-based truncation via `BAIText` and shows a tooltip on overflow.\nHover over the truncated link below to confirm."}}},render:()=>(0,f.jsxs)(a,{direction:`column`,gap:`xs`,children:[(0,f.jsxs)(`strong`,{children:[`ellipsis=`,`{true}`,` — tooltip appears on overflow`]}),(0,f.jsx)(`div`,{style:{width:240},children:(0,f.jsx)(d,{ellipsis:!0,children:`This is a very long link text that will be truncated with ellipsis and show a tooltip`})})]})},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    to: {
      pathname: '/example'
    },
    children: 'Navigate to Example'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'BAILink supports \`hover\` and \`disabled\` type variants for different visual states.'
      }
    }
  },
  render: () => <BAIFlex direction="column" gap="md">
      <BAIFlex direction="column" gap="xs">
        <strong>Default (no type)</strong>
        <BAILink to="/example">Standard link</BAILink>
      </BAIFlex>
      <BAIFlex direction="column" gap="xs">
        <strong>Type: hover</strong>
        <BAILink to="/example" type="hover">
          Link with hover underline effect
        </BAILink>
      </BAIFlex>
      <BAIFlex direction="column" gap="xs">
        <strong>Type: disabled</strong>
        <BAILink type="disabled">Disabled link (not clickable)</BAILink>
      </BAIFlex>
    </BAIFlex>
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: \`Long text is truncated via CSS ellipsis (no layout-loop risk).
\\\`ellipsis={true}\\\` shows the full text as a tooltip on overflow.
Hover over the truncated links below to see the tooltip.\`
      }
    }
  },
  render: () => <BAIFlex direction="column" gap="md">
      <BAIFlex direction="column" gap="xs">
        <strong>ellipsis (boolean) — tooltip on overflow</strong>
        <div style={{
        width: 200
      }}>
          <BAILink ellipsis>
            This is a very long link text that will be truncated with ellipsis
          </BAILink>
        </div>
      </BAIFlex>
      <BAIFlex direction="column" gap="xs">
        <strong>ellipsis with custom tooltip</strong>
        <div style={{
        width: 200
      }}>
          <BAILink ellipsis={{
          tooltip: 'Full text shown here as tooltip'
        }}>
            This is a very long link text that will be truncated with ellipsis
          </BAILink>
        </div>
      </BAIFlex>
    </BAIFlex>
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: \`\\\`BAILink ellipsis\\\` nested inside \\\`BAIText ellipsis\\\` — as used in \\\`BAINameActionCell\\\`.

Both components are CSS-based and do not conflict. The outer \\\`BAIText\\\`'s overflow check
(\\\`scrollWidth > clientWidth\\\` on its span) returns false because the inner \\\`BAIText\\\`
constrains itself to \\\`maxWidth: 100%\\\` of the outer span — so the outer span sees no overflow.
Only the inner \\\`BAIText\\\`'s \\\`ResizeObserver\\\` detects overflow and shows the tooltip.

Result: a single tooltip with the plain text content (not a React element). Hover to confirm.\`
      }
    }
  },
  render: () => <BAIFlex direction="column" gap="md">
      <BAIFlex direction="column" gap="xs" style={{
      width: 240
    }}>
        <strong>Overflow (truncated) — single tooltip</strong>
        <BAIText ellipsis={{
        tooltip: true
      }}>
          <BAILink type="hover" ellipsis>
            very-long-revision-name-abc123def456ghi789
          </BAILink>
        </BAIText>
      </BAIFlex>
      <BAIFlex direction="column" gap="xs" style={{
      width: 240
    }}>
        <strong>No overflow (short text)</strong>
        <BAIText ellipsis={{
        tooltip: true
      }}>
          <BAILink type="hover" ellipsis>
            rev-001
          </BAILink>
        </BAIText>
      </BAIFlex>
    </BAIFlex>
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: \`Tooltip content difference: \\\`BAILink\\\` with vs. without \\\`ellipsis\\\` inside \\\`BAIText ellipsis\\\`.

- **With \\\`ellipsis\\\` on \\\`BAILink\\\`**: inner \\\`BAIText\\\` handles overflow; tooltip title = plain text string (clean).
- **Without \\\`ellipsis\\\` on \\\`BAILink\\\`**: outer \\\`BAIText\\\` handles overflow; tooltip title = \\\`BAILink\\\` ReactNode (renders with link styling inside the tooltip popup).

Both show a single tooltip — the difference is only in what the tooltip renders as its title.\`
      }
    }
  },
  render: () => <BAIFlex direction="column" gap="md">
      <BAIFlex direction="column" gap="xs" style={{
      width: 240
    }}>
        <strong>BAILink with ellipsis — tooltip is plain text</strong>
        <BAIText ellipsis={{
        tooltip: true
      }}>
          <BAILink type="hover" ellipsis>
            very-long-revision-name-abc123def456ghi789
          </BAILink>
        </BAIText>
      </BAIFlex>
      <BAIFlex direction="column" gap="xs" style={{
      width: 240
    }}>
        <strong>BAILink without ellipsis — tooltip is ReactNode (link)</strong>
        <BAIText ellipsis={{
        tooltip: true
      }}>
          <BAILink type="hover">
            very-long-revision-name-abc123def456ghi789
          </BAILink>
        </BAIText>
      </BAIFlex>
    </BAIFlex>
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: \`\\\`ellipsis={true}\\\` now normalizes to \\\`{ tooltip: true }\\\` internally.

Previously (before this fix), \\\`ellipsis={true}\\\` delegated to antd's \\\`Typography.Link\\\`
which used JS-based \\\`EllipsisMeasure\\\` — no tooltip, and caused infinite render loops
when nested inside a \\\`ResizeObserver\\\`-powered container.

Now it uses CSS-based truncation via \\\`BAIText\\\` and shows a tooltip on overflow.
Hover over the truncated link below to confirm.\`
      }
    }
  },
  render: () => <BAIFlex direction="column" gap="xs">
      <strong>ellipsis={'{true}'} — tooltip appears on overflow</strong>
      <div style={{
      width: 240
    }}>
        <BAILink ellipsis>
          This is a very long link text that will be truncated with ellipsis and
          show a tooltip
        </BAILink>
      </div>
    </BAIFlex>
}`,...y.parameters?.docs?.source}}},b=[`Default`,`TypeVariants`,`WithEllipsis`,`EllipsisInsideBAIText`,`EllipsisInsideBAITextTooltipDiff`,`EllipsisTrueBehavior`]})))()}x();export{m as Default,_ as EllipsisInsideBAIText,v as EllipsisInsideBAITextTooltipDiff,y as EllipsisTrueBehavior,h as TypeVariants,g as WithEllipsis,b as __namedExportsOrder,p as default};