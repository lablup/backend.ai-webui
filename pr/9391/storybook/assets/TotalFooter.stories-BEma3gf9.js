import{d as m,a as u,j as t,b as g}from"./iframe-1e146xbw.js";import{B as h}from"./BAIFlex-DrXKfAq4.js";import"./preload-helper-Dp1pzeXC.js";/**
 * @license lucide-react v1.29.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const y=[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]],f=m("loader-circle",y),w=({loading:c,total:d})=>{const{t:p}=u();return t.jsxs(h,{justify:"end",gap:"xs",children:[c?t.jsx(f,{className:"bai-icon-spin",style:{color:"var(--color-text-secondary)"},size:"1em"}):t.jsx("div",{}),t.jsx(g,{color:"secondary",children:p("general.TotalItems",{total:d})})]})},L={title:"Statistic/TotalFooter",component:w,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:`
**TotalFooter** displays the total item count with an optional loading indicator.

## Features
- **Total count display**: Shows total items with internationalized text
- **Loading state**: Shows loading spinner when data is being fetched
- **Theme-aware**: Uses theme tokens for consistent styling

## Usage
\`\`\`tsx
<TotalFooter total={42} />
<TotalFooter loading total={42} />
\`\`\`

## Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| \`total\` | \`number\` | - | Total number of items to display |
| \`loading\` | \`boolean\` | \`false\` | Show loading indicator |

## When to Use
- Table footers showing total row count
- List footers displaying total item count
- Pagination components showing total results
        `}}},argTypes:{total:{control:{type:"number",min:0,max:1e4,step:1},description:"Total number of items to display",table:{type:{summary:"number"}}},loading:{control:{type:"boolean"},description:"Show loading indicator",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}}}},o={name:"Basic",parameters:{docs:{description:{story:"Basic usage showing total item count."}}},args:{total:42}},e={parameters:{docs:{description:{story:"Loading state with spinner. Useful when data is being fetched or updated."}}},args:{loading:!0,total:42}};var a,s,n;o.parameters={...o.parameters,docs:{...(a=o.parameters)==null?void 0:a.docs,source:{originalSource:`{
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'Basic usage showing total item count.'
      }
    }
  },
  args: {
    total: 42
  }
}`,...(n=(s=o.parameters)==null?void 0:s.docs)==null?void 0:n.source}}};var r,i,l;e.parameters={...e.parameters,docs:{...(r=e.parameters)==null?void 0:r.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Loading state with spinner. Useful when data is being fetched or updated.'
      }
    }
  },
  args: {
    loading: true,
    total: 42
  }
}`,...(l=(i=e.parameters)==null?void 0:i.docs)==null?void 0:l.source}}};const j=["Default","Loading"];export{o as Default,e as Loading,j as __namedExportsOrder,L as default};
