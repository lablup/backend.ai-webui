import{j as l,aL as i}from"./iframe-DX1mGbLJ.js";import{B as s}from"./Badge-DVzL8uWy.js";function t({values:e=[]}){if(e.length===0)return null;let n=e.map(a=>typeof a=="string"?{label:a,variant:"neutral"}:a);return l.jsx(i,{gap:0,align:"center",className:"uic-double-badge",children:n.map((a,r)=>a.label?l.jsx(s,{className:"uic-double-badge__item",variant:a.variant??"neutral",label:a.label},r):null)})}t.displayName="DoubleBadge";/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 ui-common `DoubleBadge` under its BUI name; the props are identical. The
 settled counterpart is `BAIDoubleToken`.
*/const m=t;export{m as B};
