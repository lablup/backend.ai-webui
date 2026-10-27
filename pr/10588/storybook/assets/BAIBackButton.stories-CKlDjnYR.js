import{n as e}from"./rolldown-runtime-2s6bX4vc.js";import{n as t,t as n}from"./useBAIi18n-BoXCk5K0.js";import{n as r,t as i}from"./createLucideIcon-CRb7bAU8.js";import{jsx as a,jsxs as o}from"react/jsx-runtime";import{IconButton as s}from"@lablup/ui-common/IconButton";import{MemoryRouter as c,Route as l,Routes as u,useNavigate as d}from"react-router-dom";var f,p;function m(){return(m=e((()=>{r(),f=[[`path`,{d:`m12 19-7-7 7-7`,key:`1l729n`}],[`path`,{d:`M19 12H5`,key:`x3x0zl`}]],p=i(`arrow-left`,f)})))()}var h;function g(){return(g=e((()=>{n(),m(),h=({to:e,options:n})=>{let r=d(),{t:i}=t(),o=i(`general.button.Back`);return a(s,{variant:`ghost`,label:o,tooltip:o,icon:a(p,{size:18}),onClick:()=>r(e,n)})}})))()}var _,v,y;function b(){return(b=e((()=>{g(),_={title:`Button/BAIBackButton`,component:h,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:`
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
        `}}},argTypes:{to:{control:{type:`text`},description:`Target route path for navigation`,table:{type:{summary:`To (string | Partial<Path>)`}}},options:{control:!1,description:`React Router navigation options (replace, state, etc.)`,table:{type:{summary:`NavigateOptions`}}}},decorators:[e=>a(c,{initialEntries:[`/current-page`],children:o(u,{children:[a(l,{path:`/`,element:a(`div`,{children:`Home Page`})}),a(l,{path:`/current-page`,element:a(e,{})})]})})]},v={args:{to:`/`}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    to: '/'
  }
}`,...v.parameters?.docs?.source}}},y=[`Default`]})))()}b();export{v as Default,y as __namedExportsOrder,_ as default};