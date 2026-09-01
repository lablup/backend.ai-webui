import{R as a}from"./iframe-BgaR6W86.js";/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Accessible-name helper for the antd -> Astryx migration (to-astryx phase 3,
 wave 2 / ticket W2-D).

 Astryx's universal contract #1: `label` is a **required `string`** that the
 control renders (or announces) itself. antd took a `ReactNode` in the same
 slot — `children`, `title`, `text`, `label` — so every frontier wrapper that
 keeps an antd-shaped surface has to flatten a node into a name.

 Casting `node as string` compiles, renders, and poisons `aria-label` with
 `[object Object]` (P2). This module does the flattening properly: it walks
 string/number leaves through fragments, arrays and elements and joins them.
 A node built only from non-textual leaves (an icon, an `<img>`) yields `''`,
 which callers must treat as "no name available" — either `isLabelHidden` plus
 an `endContent` render (Token/Badge), or an explicit translated fallback.

 The walk also cannot see PROP-carried text (`Badge label=`, `BAIDoubleTag
 values=`) — such call sites name the text explicitly instead (`title` on
 `BAISelect`'s options path, `label` on its children carrier — FR-3544).
*/const c=6,f=(r,i,s)=>{if(!(r==null||typeof r=="boolean")){if(typeof r=="string"){r.trim()!==""&&s.push(r);return}if(typeof r=="number"){s.push(String(r));return}if(!(i>=c)){if(Array.isArray(r)){r.forEach(t=>f(t,i+1,s));return}if(a.isValidElement(r)){const t=r.props;f(t==null?void 0:t.children,i+1,s)}}}},n=r=>{const i=[];return f(r,0,i),i.join(" ").replace(/\s+/g," ").trim()};export{n};
