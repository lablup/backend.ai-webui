import{d as l,a as g,j as t,P as m}from"./iframe-Bv35B5Ml.js";import{u as d,M as x,R as h,a as n}from"./index-DI6XSXAy.js";import"./preload-helper-Dp1pzeXC.js";/**
 * @license lucide-react v1.29.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const B=[["path",{d:"m12 19-7-7 7-7",key:"1l729n"}],["path",{d:"M19 12H5",key:"x3x0zl"}]],f=l("arrow-left",B),y=({to:o,options:c})=>{const p=d(),{t:u}=g(),a=u("general.button.Back");return t.jsx(m,{variant:"ghost",label:a,tooltip:a,icon:t.jsx(f,{size:18}),onClick:()=>p(o,c)})},k={title:"Button/BAIBackButton",component:y,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:`
**BAIBackButton** is a navigation button component that integrates with React Router.

## Features
- Uses \`useNavigate\` hook for programmatic navigation
- Displays left arrow icon (Lucide React)
- Text button style with transparent background

## Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`to\` | \`To\` | - | Target route path (string or location object) |
| \`options\` | \`NavigateOptions\` | - | React Router navigation options (replace, state, etc.) |

This is a BAI-specific component (not extending Ant Design).
        `}}},argTypes:{to:{control:{type:"text"},description:"Target route path for navigation",table:{type:{summary:"To (string | Partial<Path>)"}}},options:{control:!1,description:"React Router navigation options (replace, state, etc.)",table:{type:{summary:"NavigateOptions"}}}},decorators:[o=>t.jsx(x,{initialEntries:["/current-page"],children:t.jsxs(h,{children:[t.jsx(n,{path:"/",element:t.jsx("div",{children:"Home Page"})}),t.jsx(n,{path:"/current-page",element:t.jsx(o,{})})]})})]},e={args:{to:"/"}};var s,r,i;e.parameters={...e.parameters,docs:{...(s=e.parameters)==null?void 0:s.docs,source:{originalSource:`{
  args: {
    to: '/'
  }
}`,...(i=(r=e.parameters)==null?void 0:r.docs)==null?void 0:i.source}}};const b=["Default"];export{e as Default,b as __namedExportsOrder,k as default};
