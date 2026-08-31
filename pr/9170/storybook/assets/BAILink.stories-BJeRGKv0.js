import{j as e,B as p}from"./iframe-DMw0ycd4.js";import{B as t}from"./BAIFlex-Dm1n4ELc.js";import{B as i}from"./BAILink-DSg9W-FI.js";import{M as S,R,a as d}from"./index-a66gfUaF.js";import"./preload-helper-Dp1pzeXC.js";const O={title:"Link/BAILink",component:i,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:"\n**BAILink** is a hybrid link component that integrates React Router and Ant Design Typography.Link.\n\n## Features\n- Uses React Router `Link` when `to` prop is provided\n- Falls back to Ant Design `Typography.Link` when `to` is not provided\n- Custom hover and disabled states\n- Ellipsis with tooltip support via `BAIText` (CSS-based, no layout-loop risk)\n\n## Ellipsis Behavior\nWhen `ellipsis` is provided, the content is wrapped by `BAIText` internally:\n- `ellipsis={true}` — CSS truncation + tooltip showing full text on overflow\n- `ellipsis={{ tooltip: 'custom' }}` — CSS truncation + custom tooltip text\n\nThis avoids antd's JS-based `EllipsisMeasure` component, which can cause infinite\nrender loops when nested inside flex containers with `ResizeObserver`.\n\n## BAI-Specific Props\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `type` | `'hover' \\| 'disabled'` | - | Link style variant (hover effect or disabled state) |\n| `ellipsis` | `boolean \\| { tooltip?: string }` | - | Enable text ellipsis with optional tooltip |\n| `to` | `To` | - | React Router path (optional, triggers Router Link mode) |\n\nFor other props, refer to [React Router Link](https://reactrouter.com/en/main/components/link) and [Ant Design Typography](https://ant.design/components/typography).\n        "}}},argTypes:{type:{control:{type:"select"},options:[void 0,"hover","disabled"],description:"Link style variant",table:{type:{summary:"'hover' | 'disabled' | undefined"}}},to:{control:{type:"object"},description:"React Router path (optional)",table:{type:{summary:"To"}}},ellipsis:{control:!1,description:"Enable text ellipsis with optional tooltip. Internally uses BAIText for CSS-based truncation.",table:{type:{summary:"boolean | { tooltip?: string }"}}},children:{control:{type:"text"},description:"Link content",table:{type:{summary:"ReactNode"}}}},decorators:[F=>e.jsx(S,{initialEntries:["/"],children:e.jsxs(R,{children:[e.jsx(d,{path:"/",element:e.jsx(F,{})}),e.jsx(d,{path:"/example",element:e.jsx("div",{children:"Example Page"})})]})})]},n={args:{to:{pathname:"/example"},children:"Navigate to Example"}},s={parameters:{docs:{description:{story:"BAILink supports `hover` and `disabled` type variants for different visual states."}}},render:()=>e.jsxs(t,{direction:"column",gap:"md",children:[e.jsxs(t,{direction:"column",gap:"xs",children:[e.jsx("strong",{children:"Default (no type)"}),e.jsx(i,{to:"/example",children:"Standard link"})]}),e.jsxs(t,{direction:"column",gap:"xs",children:[e.jsx("strong",{children:"Type: hover"}),e.jsx(i,{to:"/example",type:"hover",children:"Link with hover underline effect"})]}),e.jsxs(t,{direction:"column",gap:"xs",children:[e.jsx("strong",{children:"Type: disabled"}),e.jsx(i,{type:"disabled",children:"Disabled link (not clickable)"})]})]})},o={parameters:{docs:{description:{story:"Long text is truncated via CSS ellipsis (no layout-loop risk).\n`ellipsis={true}` shows the full text as a tooltip on overflow.\nHover over the truncated links below to see the tooltip."}}},render:()=>e.jsxs(t,{direction:"column",gap:"md",children:[e.jsxs(t,{direction:"column",gap:"xs",children:[e.jsx("strong",{children:"ellipsis (boolean) — tooltip on overflow"}),e.jsx("div",{style:{width:200},children:e.jsx(i,{ellipsis:!0,children:"This is a very long link text that will be truncated with ellipsis"})})]}),e.jsxs(t,{direction:"column",gap:"xs",children:[e.jsx("strong",{children:"ellipsis with custom tooltip"}),e.jsx("div",{style:{width:200},children:e.jsx(i,{ellipsis:{tooltip:"Full text shown here as tooltip"},children:"This is a very long link text that will be truncated with ellipsis"})})]})]})},l={parameters:{docs:{description:{story:"`BAILink ellipsis` nested inside `BAIText ellipsis` — as used in `BAINameActionCell`.\n\nBoth components are CSS-based and do not conflict. The outer `BAIText`'s overflow check\n(`scrollWidth > clientWidth` on its span) returns false because the inner `BAIText`\nconstrains itself to `maxWidth: 100%` of the outer span — so the outer span sees no overflow.\nOnly the inner `BAIText`'s `ResizeObserver` detects overflow and shows the tooltip.\n\nResult: a single tooltip with the plain text content (not a React element). Hover to confirm."}}},render:()=>e.jsxs(t,{direction:"column",gap:"md",children:[e.jsxs(t,{direction:"column",gap:"xs",style:{width:240},children:[e.jsx("strong",{children:"Overflow (truncated) — single tooltip"}),e.jsx(p,{ellipsis:{tooltip:!0},children:e.jsx(i,{type:"hover",ellipsis:!0,children:"very-long-revision-name-abc123def456ghi789"})})]}),e.jsxs(t,{direction:"column",gap:"xs",style:{width:240},children:[e.jsx("strong",{children:"No overflow (short text)"}),e.jsx(p,{ellipsis:{tooltip:!0},children:e.jsx(i,{type:"hover",ellipsis:!0,children:"rev-001"})})]})]})},r={parameters:{docs:{description:{story:"Tooltip content difference: `BAILink` with vs. without `ellipsis` inside `BAIText ellipsis`.\n\n- **With `ellipsis` on `BAILink`**: inner `BAIText` handles overflow; tooltip title = plain text string (clean).\n- **Without `ellipsis` on `BAILink`**: outer `BAIText` handles overflow; tooltip title = `BAILink` ReactNode (renders with link styling inside the tooltip popup).\n\nBoth show a single tooltip — the difference is only in what the tooltip renders as its title."}}},render:()=>e.jsxs(t,{direction:"column",gap:"md",children:[e.jsxs(t,{direction:"column",gap:"xs",style:{width:240},children:[e.jsx("strong",{children:"BAILink with ellipsis — tooltip is plain text"}),e.jsx(p,{ellipsis:{tooltip:!0},children:e.jsx(i,{type:"hover",ellipsis:!0,children:"very-long-revision-name-abc123def456ghi789"})})]}),e.jsxs(t,{direction:"column",gap:"xs",style:{width:240},children:[e.jsx("strong",{children:"BAILink without ellipsis — tooltip is ReactNode (link)"}),e.jsx(p,{ellipsis:{tooltip:!0},children:e.jsx(i,{type:"hover",children:"very-long-revision-name-abc123def456ghi789"})})]})]})},a={parameters:{docs:{description:{story:"`ellipsis={true}` now normalizes to `{ tooltip: true }` internally.\n\nPreviously (before this fix), `ellipsis={true}` delegated to antd's `Typography.Link`\nwhich used JS-based `EllipsisMeasure` — no tooltip, and caused infinite render loops\nwhen nested inside a `ResizeObserver`-powered container.\n\nNow it uses CSS-based truncation via `BAIText` and shows a tooltip on overflow.\nHover over the truncated link below to confirm."}}},render:()=>e.jsxs(t,{direction:"column",gap:"xs",children:[e.jsxs("strong",{children:["ellipsis=","{true}"," — tooltip appears on overflow"]}),e.jsx("div",{style:{width:240},children:e.jsx(i,{ellipsis:!0,children:"This is a very long link text that will be truncated with ellipsis and show a tooltip"})})]})};var c,h,u;n.parameters={...n.parameters,docs:{...(c=n.parameters)==null?void 0:c.docs,source:{originalSource:`{
  args: {
    to: {
      pathname: '/example'
    },
    children: 'Navigate to Example'
  }
}`,...(u=(h=n.parameters)==null?void 0:h.docs)==null?void 0:u.source}}};var x,m,g;s.parameters={...s.parameters,docs:{...(x=s.parameters)==null?void 0:x.docs,source:{originalSource:`{
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
}`,...(g=(m=s.parameters)==null?void 0:m.docs)==null?void 0:g.source}}};var v,B,A;o.parameters={...o.parameters,docs:{...(v=o.parameters)==null?void 0:v.docs,source:{originalSource:`{
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
}`,...(A=(B=o.parameters)==null?void 0:B.docs)==null?void 0:A.source}}};var I,y,w;l.parameters={...l.parameters,docs:{...(I=l.parameters)==null?void 0:I.docs,source:{originalSource:`{
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
}`,...(w=(y=l.parameters)==null?void 0:y.docs)==null?void 0:w.source}}};var f,k,b;r.parameters={...r.parameters,docs:{...(f=r.parameters)==null?void 0:f.docs,source:{originalSource:`{
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
}`,...(b=(k=r.parameters)==null?void 0:k.docs)==null?void 0:b.source}}};var T,L,j;a.parameters={...a.parameters,docs:{...(T=a.parameters)==null?void 0:T.docs,source:{originalSource:`{
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
}`,...(j=(L=a.parameters)==null?void 0:L.docs)==null?void 0:j.source}}};const z=["Default","TypeVariants","WithEllipsis","EllipsisInsideBAIText","EllipsisInsideBAITextTooltipDiff","EllipsisTrueBehavior"];export{n as Default,l as EllipsisInsideBAIText,r as EllipsisInsideBAITextTooltipDiff,a as EllipsisTrueBehavior,s as TypeVariants,o as WithEllipsis,z as __namedExportsOrder,O as default};
