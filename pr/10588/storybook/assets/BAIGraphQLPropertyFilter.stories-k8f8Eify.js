import{n as e,o as t}from"./rolldown-runtime-2s6bX4vc.js";import{n,t as r}from"./isObject-BhsmWKjo.js";import{n as i,t as a}from"./toString-D-HqYh4D.js";import{n as o,t as s}from"./isArray-CJJWSiwA.js";import{c,s as l}from"./_Map-K7Xb5pfL.js";import{c as ee,g as te,h as u,m as ne,p as d,s as f}from"./_getTag-B4y1ZNpT.js";import{b as p,c as m,g as re,h,i as g,l as ie,m as _,n as ae,p as v,r as oe,s as y,t as se,u as b,y as x}from"./_initCloneObject-Bo3H_Qgw.js";import{m as S,p as C}from"./_Uint8Array-BGVRJxrU.js";import{n as w,t as T}from"./_baseAssignValue-CUi_EZcT.js";import{a as E,o as ce}from"./_MapCache-Bbnc-cPQ.js";import{n as D,t as O}from"./_baseRest-hqJSXe2S.js";import{n as k,t as le}from"./_isIterateeCall-DXX2ySqa.js";import{a as A,c as j,i as M,o as ue,r as de,s as fe}from"./_charsEndIndex-r2GX7ZuM.js";import{n as pe,t as me}from"./compact-BqEdnGyS.js";import{i as he,r as ge}from"./_baseEach-D__71HGs.js";import{n as _e,t as ve}from"./keyBy-Dq1TYpFs.js";import{m as ye,t as be}from"./hooks-BKuvs6Qg.js";import{n as xe,t as Se}from"./isArrayLikeObject-SeUjs8rT.js";import{i as Ce,n as we,r as Te,t as Ee}from"./find-BPjeGL13.js";import{n as N,t as De}from"./map-CIqW7OVA.js";import{n as Oe,t as ke}from"./includes-B4oWcpQa.js";import{n as Ae,t as je}from"./isNumber-BrP4akIE.js";import{n as Me,t as Ne}from"./split-Djnna1OQ.js";import{a as Pe,c as Fe,i as Ie,l as Le,n as Re,o as ze,s as Be,t as Ve,u as He}from"./BAIPowerSearchAdapters-v1hx29J-.js";import{n as Ue,t as We}from"./uniqBy-BJM9S8Oq.js";import{n as Ge,t as Ke}from"./useBAIi18n-BoXCk5K0.js";import{t as qe}from"./dayjs.min-B7AEa451.js";import{l as Je}from"./iframe-DR2sIF5r.js";import{n as Ye,t as Xe}from"./BAIComplexSelect-D5bBzCyR.js";import{useRef as Ze,useState as Qe}from"react";import{jsx as $e}from"react/jsx-runtime";import{c as et}from"react/compiler-runtime";import{PowerSearch as tt}from"@lablup/ui-common/PowerSearch";function nt(e){return O(function(t,n){var r=-1,i=n.length,a=i>1?n[i-1]:void 0,o=i>2?n[2]:void 0;for(a=e.length>3&&typeof a==`function`?(i--,a):void 0,o&&k(n[0],n[1],o)&&(a=i<3?void 0:a,i=1),t=Object(t);++r<i;){var s=n[r];s&&e(t,s,r,a)}return t})}function rt(){return(rt=e((()=>{D(),le()})))()}function it(e){return function(t){t=i(t);var n=A(t)?M(t):void 0,r=n?n[0]:t.charAt(0),a=n?fe(n,1).join(``):t.slice(1);return r[e]()+a}}function at(){return(at=e((()=>{j(),ue(),de(),a()})))()}var ot;function st(){return(st=e((()=>{at(),ot=it(`toUpperCase`)})))()}function ct(e,t,n){(n!==void 0&&!E(e[t],n)||n===void 0&&!(t in e))&&T(e,t,n)}function lt(){return(lt=e((()=>{w(),ce()})))()}function ut(e,t){if((t!==`constructor`||typeof e[t]!=`function`)&&t!=`__proto__`)return e[t]}function dt(){return(dt=e((()=>{})))()}function ft(e){return h(e,_(e))}function pt(){return(pt=e((()=>{re(),v()})))()}function mt(e,t,r,i,a,s,l){var u=ut(e,r),d=ut(t,r),f=l.get(d);if(f)ct(e,r,f);else{var p=s?s(u,d,r+``,e,t,l):void 0,m=p===void 0;if(m){var re=o(d),h=!re&&ne(d),g=!re&&!h&&ee(d);p=d,re||h||g?o(u)?p=u:xe(u)?p=x(u):h?(m=!1,p=y(d,!0)):g?(m=!1,p=oe(d,!0)):p=[]:b(d)||te(d)?(p=u,te(u)?p=ft(u):(!n(u)||c(u))&&(p=se(d))):m=!1}m&&(l.set(d,p),a(p,d,i,s,l),l.delete(d)),ct(e,r,p)}}function ht(){return(ht=e((()=>{lt(),m(),g(),p(),ae(),u(),s(),Se(),d(),l(),r(),ie(),f(),dt(),pt()})))()}function gt(e,t,r,i,a){e!==t&&ge(t,function(o,s){if(a||=new C,n(o))mt(e,t,s,r,gt,i,a);else{var c=i?i(ut(e,s),o,s+``,e,t,a):void 0;c===void 0&&(c=o),ct(e,s,c)}},_)}function _t(){return(_t=e((()=>{S(),lt(),he(),ht(),r(),v(),dt()})))()}var vt;function yt(){return(yt=e((()=>{_t(),rt(),vt=nt(function(e,t,n){gt(e,t,n)})})))()}function bt(){return`filter-${Date.now()}-${Math.random().toString(36).substring(2,11)}`}function xt(e,t){let n=e.split(`.`);if(n.some(e=>e===``||e===`__proto__`||e===`constructor`||e===`prototype`))return{};let r=t;for(let e=n.length-1;e>0;e--)r={[n[e]]:r};return{[n[0]]:r}}function St(e){let t=e.split(`.`),n=Te(t,(e,n)=>n>0&&n<t.length-1&&Bt.has(e));return n<0?void 0:{parent:t.slice(0,n+1).join(`.`),leaf:t.slice(n+1).join(`.`)}}function Ct(e,t,n=`AND`){if(e.length===0)return;let r=[],i=[];e.forEach(e=>{let a=t.find(t=>t.key===e.property),o;if((a?.valueMode||(a?.type===`boolean`?`scalar`:`operator`))===`scalar`)o=a?.type===`boolean`?e.value===!0||e.value===`true`:a?.type===`number`?Number(e.value):e.value;else if(e.operator===`in`||e.operator===`notIn`){let t=Array.isArray(e.value)?e.value:e.value.split(`,`).map(e=>e.trim());o={[e.operator]:a?.type===`number`?t.map(Number):t}}else{let t=e.value;a?.type===`number`&&(t=Number(t)),o={[e.operator]:t}}let s=n===`AND`?St(e.property):void 0;if(!s){r.push({filter:xt(e.property,o)});return}let c=Ee(i,e=>e.parent===s.parent&&!e.leaves.has(s.leaf));c||(c={parent:s.parent,leaves:new Map},i.push(c),r.push({row:c})),c.leaves.set(s.leaf,o)});let a=N(r,e=>`row`in e?xt(e.row.parent,vt({},...Array.from(e.row.leaves,([e,t])=>xt(e,t)))):e.filter);return a.length===1?a[0]:{[n]:a}}function wt(e,t,n=``){let r=[];return Object.keys(e).forEach(i=>{if(i===`AND`||i===`OR`||i===`NOT`||i===`DISTINCT`)return;let a=n?`${n}.${i}`:i,o=e[i],s=t.find(e=>e.key===a);s?(s.valueMode||(s.type===`boolean`?`scalar`:`operator`))===`scalar`&&typeof o!=`object`?r.push({id:bt(),property:a,operator:s.implicitOperator||`equals`,value:String(o),propertyLabel:s.propertyLabel||a,type:s.type||`string`}):o&&typeof o==`object`&&Object.keys(o).forEach(e=>{let t=o[e];t!=null&&r.push({id:bt(),property:a,operator:e,value:Array.isArray(t)?t.join(`, `):String(t),propertyLabel:s.propertyLabel||a,type:s.type||`string`})}):o&&typeof o==`object`&&(Object.keys(o).some(e=>[`eq`,`ne`,`lt`,`le`,`gt`,`ge`,`contains`,`notContains`,`startsWith`,`endsWith`,`ilike`,`in`,`notIn`,`isNull`].includes(e))||r.push(...wt(o,t,a)))}),r}function Tt(e,t){if(!e)return[];let n=[];if(e.AND||e.OR){let r=e.AND||e.OR;return(Array.isArray(r)?r:[r]).forEach(e=>{n.push(...Tt(e,t))}),n}return n.push(...wt(e,t)),n}function Et(e){return Vt(e)===`scalar`?[e.implicitOperator||`equals`]:e.fixedOperator?[e.fixedOperator]:e.operators||It[e.type||`string`]}function Dt(e){return Vt(e)===`scalar`?e.implicitOperator||`equals`:e.fixedOperator||e.defaultOperator||Lt[e.type]}function Ot(e,t,n){if(n)return n;let r=Ht(e),i=Ut(e);if(ke(Rt,t))return r&&i?{type:`enum_list`,values:Ie(r)}:{type:`string_list`,searchSource:Pe(r),isArbitraryStringAllowed:!0};if(e.type===`datetime`)return{type:`date_absolute`};if(e.type===`number`)return{type:`float`};if(r&&i)return{type:`enum`,values:Ie(r)};let a=Pe(r);return a?{type:`string`,searchSource:a,isArbitraryStringAllowed:!0}:{type:`string`}}function kt(e,t){let n=e.value;if(ke(Rt,e.operator)){let e=o(n)?N(n,i):me(N(Me(i(n),`,`),He));return t&&Ht(t)&&Ut(t)?{type:`enum_list`,value:e}:{type:`string_list`,value:e}}if(t?.type===`datetime`){let e=(0,Ft.default)(i(n));return{type:`date_absolute`,unixSeconds:e.isValid()?e.unix():(0,Ft.default)().unix()}}return t?.type===`number`?{type:`float`,value:Number(n)}:t?.renderInput?{type:`custom`,value:i(n)}:t&&Ht(t)&&Ut(t)?{type:`enum`,value:i(n)}:{type:`string`,value:i(n)}}function At(e){switch(e.type){case`empty`:return``;case`date_absolute`:return Ft.default.unix(e.unixSeconds).toISOString();case`integer`:case`float`:return String(e.value);case`string_list`:case`enum_list`:return[...e.value];case`entity_list`:return N(e.value,e=>e.id);case`date_range`:return JSON.stringify(e.value);default:return i(e.value??``)}}function jt(e,t){let n=_e(t,`key`);return N(Tt(e,t),e=>({field:e.property,operator:e.operator,value:kt(e,n[e.property])}))}function Mt(e,t,n=`AND`,r=!1,i){let a=_e(t,`key`),o=r?Ue([...e].reverse(),`field`).reverse():[...e],s=Ae(i)&&o.length>i?i<=0?[]:o.slice(-i):o;return Ct(N(s,e=>{let t=a[e.field];return{id:bt(),property:e.field,operator:e.operator,value:At(e.value),propertyLabel:t?.propertyLabel??e.field,type:t?.type??`string`}}),t,n)}function Nt(e){return e.type===`string`&&!Ut(e)&&!e.renderInput}var Pt,Ft,It,Lt,Rt,zt,Bt,Vt,Ht,Ut,Wt,Gt;function Kt(){return(Kt=e((()=>{be(),Ke(),Re(),Pt=t(Je(),1),Ft=t(qe(),1),Ce(),we(),De(),yt(),st(),Oe(),s(),a(),pe(),Ne(),Le(),ve(),We(),je(),Fe(),It={string:[`iContains`,`iNotContains`,`iEquals`,`iNotEquals`,`iStartsWith`,`iNotStartsWith`,`iEndsWith`,`iNotEndsWith`],number:[`equals`,`notEquals`,`greaterThan`,`greaterThanOrEqual`,`lessThan`,`lessThanOrEqual`],boolean:[`equals`],enum:[`equals`,`notEquals`,`in`,`notIn`],uuid:[`equals`,`notEquals`,`in`,`notIn`],datetime:[`equals`,`notEquals`,`before`,`after`]},Lt={string:`iContains`,number:`equals`,boolean:`equals`,enum:`equals`,uuid:`equals`,datetime:`equals`},Rt=[`in`,`notIn`],zt=[{label:`True`,value:`true`},{label:`False`,value:`false`}],Bt=new Set([`some`,`every`,`none`]),Vt=e=>e?.valueMode||(e?.type===`boolean`?`scalar`:`operator`),Ht=e=>e.options??(e.type===`boolean`?zt:void 0),Ut=e=>e.strictSelection??e.type===`boolean`,Wt=(e,t)=>t(`comp:BAIGraphQLPropertyFilter.operator.${ot(e)}`,{defaultValue:e}),Gt=e=>{"use memo";let t=et(60),{filterProperties:n,value:r,onChange:i,defaultValue:a,combinationMode:o,singleCondition:s,maxConditions:c,label:l,placeholder:ee,applyLabel:te,resultCount:u,contentSearchFieldKey:ne,isDisabled:d,size:f,style:p,className:m,loading:re,"data-testid":h}=e,g=o===void 0?`AND`:o,ie=s!==void 0&&s,{t:_}=Ge(),ae;t[0]!==a||t[1]!==i||t[2]!==r?(ae={value:r,defaultValue:a,onChange:i},t[0]=a,t[1]=i,t[2]=r,t[3]=ae):ae=t[3];let[v,oe]=ye(ae),y;t[4]===Symbol.for(`react.memo_cache_sentinel`)?(y={},t[4]=y):y=t[4];let se=Ze(y),b;t[5]===Symbol.for(`react.memo_cache_sentinel`)?(b={recordLabel:(e,t,n)=>{se.current[`${e}::${t}`]=n},resolveLabel:(e,t)=>se.current[`${e}::${t}`]??t},t[5]=b):b=t[5];let x=ze(b),S,C,w;if(t[6]!==ne||t[7]!==n||t[8]!==x||t[9]!==_||t[10]!==v){let e=_e(n,`key`),r=Tt(v,n),i;t[14]!==n||t[15]!==v?(i=jt(v,n),t[14]=n,t[15]=v,t[16]=i):i=t[16],C=i;let a=ne??Ee(n,Nt)?.key,o;if(t[17]!==n||t[18]!==x||t[19]!==_){let e;t[21]!==x||t[22]!==_?(e=e=>{let t=x.operatorValueFor(e.key,e.renderInput);return{key:e.key,label:e.propertyLabel,defaultOperator:Dt(e),operators:N(Et(e),n=>({key:n,label:Wt(n,_),value:Ot(e,n,t)}))}},t[21]=x,t[22]=_,t[23]=e):e=t[23],o=N(n,e),t[17]=n,t[18]=x,t[19]=_,t[20]=o}else o=t[20];let s;t[24]!==a||t[25]!==o?(s={name:`bai-graphql-property-filter`,contentSearchFieldKey:a,fields:o},t[24]=a,t[25]=o,t[26]=s):s=t[26],S=s,w=Ee(N(r,t=>{let n=e[t.property]?.rule;if(n)return n.validate(t.value)?void 0:n.message})),t[6]=ne,t[7]=n,t[8]=x,t[9]=_,t[10]=v,t[11]=S,t[12]=C,t[13]=w}else S=t[11],C=t[12],w=t[13];let T=w,E;t[27]!==g||t[28]!==n||t[29]!==c||t[30]!==oe||t[31]!==ie?(E=e=>{oe(Mt(e,n,g,ie,c))},t[27]=g,t[28]=n,t[29]=c,t[30]=oe,t[31]=ie,t[32]=E):E=t[32];let ce=E,D;t[33]!==l||t[34]!==_?(D=l??_(`comp:BAIPropertyFilter.SearchLabel`),t[33]=l,t[34]=_,t[35]=D):D=t[35];let O;t[36]!==ee||t[37]!==_?(O=ee??_(`comp:BAIPropertyFilter.PlaceHolder`),t[36]=ee,t[37]=_,t[38]=O):O=t[38];let k;t[39]!==te||t[40]!==_?(k=te??_(`comp:BAIPropertyFilter.Apply`),t[39]=te,t[40]=_,t[41]=k):k=t[41];let le=d||re,A;t[42]===m?A=t[43]:(A=(0,Pt.default)(`bai-power-search`,m),t[42]=m,t[43]=A);let j;t[44]===T?j=t[45]:(j=T?{type:`error`,message:T}:void 0,t[44]=T,t[45]=j);let M;return t[46]!==S||t[47]!==h||t[48]!==C||t[49]!==ce||t[50]!==u||t[51]!==f||t[52]!==p||t[53]!==k||t[54]!==le||t[55]!==A||t[56]!==j||t[57]!==D||t[58]!==O?(M=$e(tt,{config:S,components:Ve,filters:C,startIcon:Be,label:D,placeholder:O,popoverSaveButtonLabel:k,resultCount:u,isDisabled:le,size:f,style:p,className:A,"data-testid":h,status:j,onChange:ce}),t[46]=S,t[47]=h,t[48]=C,t[49]=ce,t[50]=u,t[51]=f,t[52]=p,t[53]=k,t[54]=le,t[55]=A,t[56]=j,t[57]=D,t[58]=O,t[59]=M):M=t[59],M}})))()}var P,qt,Jt,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q,Yt,$,Xt;function Zt(){return(Zt=e((()=>{Ye(),Kt(),{action:P}=__STORYBOOK_MODULE_ACTIONS__,qt=[{label:`local:volume1`,value:`local:volume1`},{label:`local:volume2`,value:`local:volume2`},{label:`nfs:data`,value:`nfs:data`}],Jt={title:`Filter/BAIGraphQLPropertyFilter`,component:Gt,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`
**BAIGraphQLPropertyFilter** is an advanced filtering component designed for GraphQL-based Backend.AI applications. It provides a sophisticated interface for constructing GraphQL filter objects with support for:

- **GraphQL Filter Types**: Compatible with standard GraphQL filter schemas including StringFilter, IntFilter, BooleanFilter, EnumFilter, and DateTimeFilter
- **Flexible Combination Mode**: Choose between AND or OR operators to combine multiple filter conditions
- **Rich Operator Set**: Case-insensitive string operators (iContains, iEquals, iStartsWith, iEndsWith, etc.) and comparison operators (greaterThan, greaterThanOrEqual, lessThan, lessThanOrEqual, in, notIn)
- **Type-Safe Filtering**: Automatic type detection and operator suggestions based on property types
- **Bidirectional Conversion**: Seamless conversion between UI conditions and GraphQL filter objects

New in this version:
- **DateTime support**: When a property has type 'datetime', a DatePicker with time selection is rendered instead of a text input. Values are serialized as ISO strings and displayed in filter tags as 'YYYY-MM-DD HH:mm'.
- **UUID support**: UUID type properties use \`equals\`, \`notEquals\`, \`in\`, \`notIn\` operators and support validation rules.
- **Custom input via \`renderInput\`**: Replace the default AutoComplete input with any controlled control (e.g., a user/domain picker or async select). The control stages a value via \`onAddCondition(value, label?)\` and the edit popover's Apply button commits it; feed the render prop's \`value\` back into the control so the staged pick stays visible (and when an existing token is reopened for editing). Pass a human-readable \`label\` when the committed value is opaque (e.g. a UUID) so the token shows the label instead. Keep using a built-in \`type\` (e.g. \`uuid\`) that matches what the control emits.
- Operatorless fields via valueMode: 'scalar' for properties that should emit direct scalar values (e.g., { isUrgent: true }). Use implicitOperator (defaults to 'equals') to control how tags are displayed in the UI.

The component generates GraphQL-compatible filter objects that can be directly used in GraphQL queries, enabling powerful and flexible data filtering across the platform.

> **to-astryx ticket 28** — the engine is now Astryx \`PowerSearch\`. The prop contract and the emitted filter object are unchanged, but the antd chrome (property/operator \`Select\`s, \`AutoComplete\`, \`DatePicker\`, closable \`Tag\`s, reset button) is replaced by PowerSearch's typeahead, tokens and built-in clear. Three behaviours moved: \`renderInput\` controls stage a value that the popover's Apply button commits, per-property \`placeholder\` is dropped (PowerSearch has one control-level placeholder), and \`rule.validate\` is advisory — a violating token is reported through the error status instead of being refused. **to-astryx ticket 32** refreshed these stories: the \`renderInput\` demos below now use \`BAIComplexSelect\` (Astryx-native) instead of antd \`Select\`, matching what a migrated call site actually renders.

**GraphQL Filter Object Examples:**
\`\`\`javascript
// Simple string filter (case-insensitive)
{ name: { iContains: "john" } }  // case-insensitive contains (default)
{ name: { iEquals: "john" } }    // case-insensitive exact match

// Number filter
{ score: { greaterThan: 80 } }
{ price: { lessThanOrEqual: 100 } }

// Boolean filter
{ active: true }

// Filters combined with AND (all conditions must match)
{
  AND: [
    { name: { iContains: "john" } },
    { status: { in: ["ACTIVE", "PENDING"] } },
    { priority: { iEquals: "HIGH" } }
  ]
}

// Filters combined with OR (any condition can match)
{
  OR: [
    { status: { iEquals: "URGENT" } },
    { priority: { iEquals: "HIGH" } },
    { assignee: { iStartsWith: "john" } }
  ]
}
\`\`\`
        `}}},argTypes:{filterProperties:{description:`Array of filterable properties with their configuration`,control:{type:`object`},table:{type:{summary:`FilterProperty[]`},detail:`
FilterProperty = {
  key: string;              // Property key in the GraphQL schema
  propertyLabel: string;    // Display label for the property
  type: 'string' | 'number' | 'boolean' | 'enum' | 'uuid' | 'datetime';
  operators?: FilterOperator[];  // Available operators for this property
  defaultOperator?: FilterOperator;
  options?: AutoCompleteProps['options'];  // Autocomplete suggestions
  strictSelection?: boolean;  // Require selection from options
  rule?: {                    // Validation rule
    message: string;
    validate: (value: any) => boolean;
  };
  // Serialization mode for this property:
  //  - 'scalar': emit { [key]: value } (operatorless). Default for boolean.
  //  - 'operator': emit { [key]: { op: value } }. Default for non-boolean.
  valueMode?: 'scalar' | 'operator';
  // Visual operator for UI tags when valueMode='scalar' (default 'equals')
  implicitOperator?: FilterOperator;
  // Custom input renderer — replaces the default AutoComplete with a controlled
  // control (e.g. BAIUserSelect). \`onAddCondition(value, label?)\` stages the
  // value and the edit popover's Apply button commits it, serialized per the
  // property's \`type\`. Pass a human-readable \`label\` when the value is opaque
  // (e.g. a UUID) so the token stays readable, and feed \`value\` back into the
  // control so the staged pick stays visible.
  renderInput?: (props: {
    onAddCondition: (value: string | undefined, label?: string) => void;
    value: string | null;
    isDisabled?: boolean;
  }) => ReactNode;
}
        `}},value:{control:{type:`object`},description:`Current GraphQL filter object`,table:{type:{summary:`GraphQLFilter`},detail:`
GraphQLFilter = {
  [property: string]: FilterValue;
  AND?: GraphQLFilter[];
  OR?: GraphQLFilter[];
}
        `}},onChange:{description:`Callback when filter value changes`,table:{type:{summary:`(value: GraphQLFilter | undefined) => void`}}},loading:{control:{type:`boolean`},description:`Show loading state`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},combinationMode:{control:{type:`radio`},options:[`AND`,`OR`],description:`How to combine multiple filter conditions`,table:{type:{summary:`'AND' | 'OR'`},defaultValue:{summary:`AND`}}}},render:e=>{let[t,n]=Qe(e.value);return $e(Gt,{...e,value:t,onChange:t=>{e.onChange?.(t),n(t)}})}},F={name:`Basic Usage`,parameters:{docs:{description:{story:`Basic GraphQL property filter with string and boolean properties. Try adding filters and see how they combine into a GraphQL filter object.`}}},args:{filterProperties:[{key:`name`,propertyLabel:`Name`,type:`string`,defaultOperator:`iContains`},{key:`description`,propertyLabel:`Description`,type:`string`},{key:`isActive`,propertyLabel:`Active Status`,type:`boolean`}],combinationMode:`AND`,onChange:P(`Filter changed`)}},I={name:`Multiple Filters with AND`,parameters:{docs:{description:{story:`Demonstrates filters combined with AND operator. All conditions must be satisfied for a match. This is useful when you need strict filtering.`}}},args:{filterProperties:[{key:`title`,propertyLabel:`Title`,type:`string`},{key:`priority`,propertyLabel:`Priority`,type:`enum`,options:[{label:`High`,value:`HIGH`},{label:`Medium`,value:`MEDIUM`},{label:`Low`,value:`LOW`}]},{key:`isUrgent`,propertyLabel:`Urgent`,type:`boolean`}],combinationMode:`AND`,value:{AND:[{title:{iContains:`critical`}},{priority:{equals:`HIGH`}},{isUrgent:!0}]},onChange:P(`AND Filter changed`)}},L={name:`Multiple Filters with OR`,parameters:{docs:{description:{story:`Demonstrates filters combined with OR operator. Any condition can match for a result. This is useful for more flexible, inclusive filtering.`}}},args:{filterProperties:[{key:`status`,propertyLabel:`Status`,type:`enum`,options:[{label:`Urgent`,value:`URGENT`},{label:`High Priority`,value:`HIGH_PRIORITY`},{label:`Normal`,value:`NORMAL`}]},{key:`assignee`,propertyLabel:`Assignee`,type:`string`},{key:`dueToday`,propertyLabel:`Due Today`,type:`boolean`}],combinationMode:`OR`,value:{OR:[{status:{equals:`URGENT`}},{assignee:{iContains:`john`}},{dueToday:!0}]},onChange:P(`OR Filter changed`)}},R={name:`Number Filters with Comparisons`,parameters:{docs:{description:{story:`Shows numeric filtering with comparison operators like greater than, less than, etc. Useful for filtering by quantities, scores, or metrics.`}}},args:{filterProperties:[{key:`score`,propertyLabel:`Score`,type:`number`,operators:[`equals`,`notEquals`,`greaterThan`,`greaterThanOrEqual`,`lessThan`,`lessThanOrEqual`]},{key:`quantity`,propertyLabel:`Quantity`,type:`number`},{key:`price`,propertyLabel:`Price`,type:`number`,operators:[`greaterThan`,`lessThan`,`equals`],defaultOperator:`greaterThan`}],combinationMode:`AND`,value:{AND:[{score:{greaterThanOrEqual:80}},{quantity:{lessThan:100}}]},onChange:P(`Number filter changed`)}},z={name:`Enum Filters with Multiple Selection`,parameters:{docs:{description:{story:`Demonstrates enum type filtering with in/notIn operators for multiple value selection. Perfect for status fields, categories, or any predefined set of values.`}}},args:{filterProperties:[{key:`status`,propertyLabel:`Status`,type:`enum`,options:[{label:`Active`,value:`ACTIVE`},{label:`Inactive`,value:`INACTIVE`},{label:`Pending`,value:`PENDING`},{label:`Archived`,value:`ARCHIVED`}],operators:[`equals`,`notEquals`,`in`,`notIn`],strictSelection:!0},{key:`category`,propertyLabel:`Category`,type:`enum`,options:[{label:`Frontend`,value:`FRONTEND`},{label:`Backend`,value:`BACKEND`},{label:`Database`,value:`DATABASE`},{label:`DevOps`,value:`DEVOPS`}],defaultOperator:`in`}],combinationMode:`AND`,value:{AND:[{status:{in:[`ACTIVE`,`PENDING`]}},{category:{notEquals:`DATABASE`}}]},onChange:P(`Enum filter changed`)}},B={name:`Complex Combined Filter`,parameters:{docs:{description:{story:`Example showing multiple filters with different property types combined with the selected mode (AND/OR) for comprehensive filtering.`}}},args:{filterProperties:[{key:`name`,propertyLabel:`Name`,type:`string`},{key:`email`,propertyLabel:`Email`,type:`string`,operators:[`iContains`,`iStartsWith`,`iEndsWith`]},{key:`role`,propertyLabel:`Role`,type:`enum`,options:[{label:`Admin`,value:`ADMIN`},{label:`User`,value:`USER`},{label:`Guest`,value:`GUEST`}]},{key:`credits`,propertyLabel:`Credits`,type:`number`},{key:`isVerified`,propertyLabel:`Verified`,type:`boolean`}],combinationMode:`AND`,value:{AND:[{name:{iContains:`john`}},{email:{iEndsWith:`@company.com`}},{role:{equals:`USER`}},{credits:{greaterThanOrEqual:100}},{isVerified:!0}]},onChange:P(`Complex filter changed`)}},V={name:`Custom Validation Rules`,parameters:{docs:{description:{story:`Property filter with custom validation rules for data integrity. Shows email validation and strict selection enforcement.`}}},args:{filterProperties:[{key:`email`,propertyLabel:`Email Address`,type:`string`,rule:{message:`Please enter a valid email address`,validate:e=>/\S+@\S+\.\S+/.test(e)}},{key:`phone`,propertyLabel:`Phone Number`,type:`string`,rule:{message:`Phone number must be 10 digits`,validate:e=>/^\d{10}$/.test(e.replace(/\D/g,``))}},{key:`department`,propertyLabel:`Department`,type:`enum`,options:[{label:`Engineering`,value:`ENGINEERING`},{label:`Marketing`,value:`MARKETING`},{label:`Sales`,value:`SALES`},{label:`HR`,value:`HR`}],strictSelection:!0}],combinationMode:`AND`,onChange:P(`Validated filter changed`)}},H={name:`Autocomplete Suggestions`,parameters:{docs:{description:{story:`Filter with predefined autocomplete options for improved user experience and data consistency.`}}},args:{filterProperties:[{key:`country`,propertyLabel:`Country`,type:`string`,options:[{label:`United States`,value:`US`},{label:`United Kingdom`,value:`UK`},{label:`Canada`,value:`CA`},{label:`Australia`,value:`AU`},{label:`Germany`,value:`DE`},{label:`France`,value:`FR`}]},{key:`language`,propertyLabel:`Language`,type:`string`,options:[{label:`English`,value:`en`},{label:`Spanish`,value:`es`},{label:`French`,value:`fr`},{label:`German`,value:`de`},{label:`Chinese`,value:`zh`},{label:`Japanese`,value:`ja`}],defaultOperator:`in`}],combinationMode:`OR`,value:{OR:[{country:{equals:`US`}},{language:{in:[`en`,`es`]}}]},onChange:P(`Autocomplete filter changed`)}},U={parameters:{docs:{description:{story:`GraphQL property filter in its initial state with no applied filters. Start adding filters to see how they combine.`}}},args:{filterProperties:[{key:`title`,propertyLabel:`Title`,type:`string`},{key:`isPublished`,propertyLabel:`Published`,type:`boolean`},{key:`viewCount`,propertyLabel:`View Count`,type:`number`}],combinationMode:`AND`,onChange:P(`Filter changed from empty`)}},W={parameters:{docs:{description:{story:`Filter component in loading state, typically shown while fetching schema information or processing complex queries.`}}},args:{filterProperties:[{key:`name`,propertyLabel:`Name`,type:`string`}],loading:!0,combinationMode:`AND`,onChange:P(`Filter changed`)}},G={name:`Artifact Filter (Real-world Example)`,parameters:{docs:{description:{story:`Real-world example matching the ArtifactFilter GraphQL input type with name and status filtering capabilities. Shows how the component would be used in production.`}}},args:{filterProperties:[{key:`name`,propertyLabel:`Artifact Name`,type:`string`,operators:[`iContains`,`iEquals`,`iNotEquals`,`iStartsWith`,`iEndsWith`],defaultOperator:`iContains`},{key:`status`,propertyLabel:`Artifact Status`,type:`enum`,options:[{label:`Draft`,value:`DRAFT`},{label:`Published`,value:`PUBLISHED`},{label:`Archived`,value:`ARCHIVED`},{label:`Deleted`,value:`DELETED`}],operators:[`equals`,`in`],strictSelection:!0}],combinationMode:`AND`,value:{AND:[{name:{iContains:`model`}},{status:{in:[`PUBLISHED`,`DRAFT`]}}]},onChange:P(`Artifact filter changed`)}},K={name:`Fixed Operator (No Selector)`,parameters:{docs:{description:{story:`Demonstrates properties with fixed operators where the operator selector is hidden. Useful when you want to enforce a specific operator for certain fields.`}}},args:{filterProperties:[{key:`search`,propertyLabel:`Search (always contains)`,type:`string`,fixedOperator:`iContains`},{key:`username`,propertyLabel:`Username (always equals)`,type:`string`,fixedOperator:`iEquals`},{key:`tags`,propertyLabel:`Tags (always in)`,type:`string`,fixedOperator:`in`},{key:`score`,propertyLabel:`Score (flexible)`,type:`number`,operators:[`equals`,`greaterThan`,`greaterThanOrEqual`,`lessThan`,`lessThanOrEqual`]}],combinationMode:`AND`,onChange:P(`Fixed operator filter changed`)}},q={name:`Toggle Between AND/OR`,parameters:{docs:{description:{story:`Example showing how switching between AND and OR combination modes affects the filter logic. Try toggling the combination mode to see how the same conditions behave differently.`}}},args:{filterProperties:[{key:`type`,propertyLabel:`Type`,type:`enum`,options:[{label:`Feature`,value:`FEATURE`},{label:`Bug`,value:`BUG`},{label:`Task`,value:`TASK`}]},{key:`priority`,propertyLabel:`Priority`,type:`enum`,options:[{label:`Critical`,value:`CRITICAL`},{label:`High`,value:`HIGH`},{label:`Medium`,value:`MEDIUM`},{label:`Low`,value:`LOW`}]},{key:`assignedToMe`,propertyLabel:`Assigned to Me`,type:`boolean`}],combinationMode:`AND`,onChange:P(`Filter changed with mode toggle`)}},J={name:`DateTime Filters`,parameters:{docs:{description:{story:`Demonstrates datetime filtering with a DatePicker UI. When a datetime property is selected, a date picker with time selection is rendered instead of a text input. Useful for filtering by created_at, updated_at, or other timestamp fields.`}}},args:{filterProperties:[{key:`created_at`,propertyLabel:`Created At`,type:`datetime`},{key:`updated_at`,propertyLabel:`Updated At`,type:`datetime`,defaultOperator:`after`},{key:`name`,propertyLabel:`Name`,type:`string`,defaultOperator:`iContains`},{key:`isActive`,propertyLabel:`Active Status`,type:`boolean`}],combinationMode:`AND`,onChange:P(`DateTime filter changed`)}},Y={name:`DateTime with Pre-applied Filters`,parameters:{docs:{description:{story:`DateTime filters with pre-applied conditions showing how datetime values are displayed in filter tags with a human-readable format (YYYY-MM-DD HH:mm).`}}},args:{filterProperties:[{key:`created_at`,propertyLabel:`Created At`,type:`datetime`},{key:`updated_at`,propertyLabel:`Updated At`,type:`datetime`},{key:`name`,propertyLabel:`Name`,type:`string`}],combinationMode:`AND`,value:{AND:[{created_at:{after:`2025-01-01T00:00:00.000Z`}},{updated_at:{before:`2025-12-31T23:59:59.000Z`}},{name:{iContains:`test`}}]},onChange:P(`DateTime pre-filtered changed`)}},X={name:`UUID Filters`,parameters:{docs:{description:{story:"UUID type properties use `equals`, `notEquals`, `in`, `notIn` operators. Combine with a `rule` for format validation."}}},args:{filterProperties:[{key:`projectId`,propertyLabel:`Project ID`,type:`uuid`,rule:{message:`Must be a valid UUID.`,validate:e=>/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(e)}},{key:`domainId`,propertyLabel:`Domain ID`,type:`uuid`,defaultOperator:`notEquals`}],combinationMode:`AND`,value:{projectId:{equals:`a1b2c3d4-e5f6-7890-abcd-ef1234567890`}},onChange:P(`UUID filter changed`)}},Z={name:`Custom Input via renderInput`,parameters:{docs:{description:{story:"When `renderInput` is provided, the default AutoComplete is replaced with a custom control. The control stages a value via `onAddCondition(value, label?)` and the edit popover's Apply button commits it; feed the render prop's `value` back into the control so the staged pick stays visible. Useful for async selects (e.g., fetching options from an API)."}}},args:{filterProperties:[{key:`name`,propertyLabel:`Name`,type:`string`,defaultOperator:`iContains`},{key:`storageHost`,propertyLabel:`Storage Host`,type:`string`,defaultOperator:`equals`,renderInput:({onAddCondition:e,value:t,isDisabled:n})=>$e(Xe,{label:`Storage Host`,isLabelHidden:!0,placeholder:`Select storage host`,hasSearch:!1,options:qt,isDisabled:n,value:qt.find(e=>e.value===t)??null,onChange:t=>{e(t?.value)}})}],combinationMode:`AND`,onChange:P(`renderInput filter changed`)}},Q={name:`Scalar valueMode on string field`,parameters:{docs:{description:{story:`Demonstrates valueMode='scalar' on a non-boolean field. The filter emits { slugExact: 'my-slug' } without an operator, while tags still display using implicitOperator (default '=').`}}},args:{filterProperties:[{key:`slugExact`,propertyLabel:`Slug (scalar exact)`,type:`string`,valueMode:`scalar`,implicitOperator:`equals`},{key:`title`,propertyLabel:`Title`,type:`string`,defaultOperator:`iContains`},{key:`isPublished`,propertyLabel:`Published`,type:`boolean`}],combinationMode:`AND`,value:{AND:[{slugExact:`hello-world`},{isPublished:!0}]},onChange:P(`Scalar mode (string) filter changed`)}},Yt=[{label:`alice@example.com`,value:`owner-uuid-0001`},{label:`bob@example.com`,value:`owner-uuid-0002`},{label:`carol@example.com`,value:`owner-uuid-0003`}],$={name:`Custom input (onAddCondition)`,parameters:{docs:{description:{story:"A property whose input is a controlled `BAIComplexSelect` supplied via `renderInput`. Selecting an option calls `onAddCondition(value, label)`, which stages the value; the edit popover's Apply button commits it, serialized per `type: 'uuid'` → `{ owner: { id: { equals: <id> } } }`, while the token shows the label (email) instead of the opaque UUID. The render prop's `value` is fed back into the select so the staged pick stays visible."}}},args:{filterProperties:[{key:`owner.id`,propertyLabel:`Owner`,type:`uuid`,fixedOperator:`equals`,renderInput:({onAddCondition:e,value:t,isDisabled:n})=>$e(Xe,{label:`Owner`,isLabelHidden:!0,placeholder:`Select owner`,options:Yt,isDisabled:n,value:Yt.find(e=>e.value===t)??null,onChange:t=>{let n=t;e(n?.value,n?.label)}})}],combinationMode:`AND`,onChange:P(`custom input filter changed`)}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  name: 'Basic Usage',
  parameters: {
    docs: {
      description: {
        story: 'Basic GraphQL property filter with string and boolean properties. Try adding filters and see how they combine into a GraphQL filter object.'
      }
    }
  },
  args: {
    filterProperties: [{
      key: 'name',
      propertyLabel: 'Name',
      type: 'string',
      defaultOperator: 'iContains'
    }, {
      key: 'description',
      propertyLabel: 'Description',
      type: 'string'
    }, {
      key: 'isActive',
      propertyLabel: 'Active Status',
      type: 'boolean'
    }],
    combinationMode: 'AND',
    onChange: action('Filter changed')
  }
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  name: 'Multiple Filters with AND',
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates filters combined with AND operator. All conditions must be satisfied for a match. This is useful when you need strict filtering.'
      }
    }
  },
  args: {
    filterProperties: [{
      key: 'title',
      propertyLabel: 'Title',
      type: 'string'
    }, {
      key: 'priority',
      propertyLabel: 'Priority',
      type: 'enum',
      options: [{
        label: 'High',
        value: 'HIGH'
      }, {
        label: 'Medium',
        value: 'MEDIUM'
      }, {
        label: 'Low',
        value: 'LOW'
      }]
    }, {
      key: 'isUrgent',
      propertyLabel: 'Urgent',
      type: 'boolean'
    }],
    combinationMode: 'AND',
    value: {
      AND: [{
        title: {
          iContains: 'critical'
        }
      }, {
        priority: {
          equals: 'HIGH'
        }
      }, {
        isUrgent: true
      }]
    },
    onChange: action('AND Filter changed')
  }
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  name: 'Multiple Filters with OR',
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates filters combined with OR operator. Any condition can match for a result. This is useful for more flexible, inclusive filtering.'
      }
    }
  },
  args: {
    filterProperties: [{
      key: 'status',
      propertyLabel: 'Status',
      type: 'enum',
      options: [{
        label: 'Urgent',
        value: 'URGENT'
      }, {
        label: 'High Priority',
        value: 'HIGH_PRIORITY'
      }, {
        label: 'Normal',
        value: 'NORMAL'
      }]
    }, {
      key: 'assignee',
      propertyLabel: 'Assignee',
      type: 'string'
    }, {
      key: 'dueToday',
      propertyLabel: 'Due Today',
      type: 'boolean'
    }],
    combinationMode: 'OR',
    value: {
      OR: [{
        status: {
          equals: 'URGENT'
        }
      }, {
        assignee: {
          iContains: 'john'
        }
      }, {
        dueToday: true
      }]
    },
    onChange: action('OR Filter changed')
  }
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  name: 'Number Filters with Comparisons',
  parameters: {
    docs: {
      description: {
        story: 'Shows numeric filtering with comparison operators like greater than, less than, etc. Useful for filtering by quantities, scores, or metrics.'
      }
    }
  },
  args: {
    filterProperties: [{
      key: 'score',
      propertyLabel: 'Score',
      type: 'number',
      operators: ['equals', 'notEquals', 'greaterThan', 'greaterThanOrEqual', 'lessThan', 'lessThanOrEqual']
    }, {
      key: 'quantity',
      propertyLabel: 'Quantity',
      type: 'number'
    }, {
      key: 'price',
      propertyLabel: 'Price',
      type: 'number',
      operators: ['greaterThan', 'lessThan', 'equals'],
      defaultOperator: 'greaterThan'
    }],
    combinationMode: 'AND',
    value: {
      AND: [{
        score: {
          greaterThanOrEqual: 80
        }
      }, {
        quantity: {
          lessThan: 100
        }
      }]
    },
    onChange: action('Number filter changed')
  }
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  name: 'Enum Filters with Multiple Selection',
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates enum type filtering with in/notIn operators for multiple value selection. Perfect for status fields, categories, or any predefined set of values.'
      }
    }
  },
  args: {
    filterProperties: [{
      key: 'status',
      propertyLabel: 'Status',
      type: 'enum',
      options: [{
        label: 'Active',
        value: 'ACTIVE'
      }, {
        label: 'Inactive',
        value: 'INACTIVE'
      }, {
        label: 'Pending',
        value: 'PENDING'
      }, {
        label: 'Archived',
        value: 'ARCHIVED'
      }],
      operators: ['equals', 'notEquals', 'in', 'notIn'],
      strictSelection: true
    }, {
      key: 'category',
      propertyLabel: 'Category',
      type: 'enum',
      options: [{
        label: 'Frontend',
        value: 'FRONTEND'
      }, {
        label: 'Backend',
        value: 'BACKEND'
      }, {
        label: 'Database',
        value: 'DATABASE'
      }, {
        label: 'DevOps',
        value: 'DEVOPS'
      }],
      defaultOperator: 'in'
    }],
    combinationMode: 'AND',
    value: {
      AND: [{
        status: {
          in: ['ACTIVE', 'PENDING']
        }
      }, {
        category: {
          notEquals: 'DATABASE'
        }
      }]
    },
    onChange: action('Enum filter changed')
  }
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  name: 'Complex Combined Filter',
  parameters: {
    docs: {
      description: {
        story: 'Example showing multiple filters with different property types combined with the selected mode (AND/OR) for comprehensive filtering.'
      }
    }
  },
  args: {
    filterProperties: [{
      key: 'name',
      propertyLabel: 'Name',
      type: 'string'
    }, {
      key: 'email',
      propertyLabel: 'Email',
      type: 'string',
      operators: ['iContains', 'iStartsWith', 'iEndsWith']
    }, {
      key: 'role',
      propertyLabel: 'Role',
      type: 'enum',
      options: [{
        label: 'Admin',
        value: 'ADMIN'
      }, {
        label: 'User',
        value: 'USER'
      }, {
        label: 'Guest',
        value: 'GUEST'
      }]
    }, {
      key: 'credits',
      propertyLabel: 'Credits',
      type: 'number'
    }, {
      key: 'isVerified',
      propertyLabel: 'Verified',
      type: 'boolean'
    }],
    combinationMode: 'AND',
    value: {
      AND: [{
        name: {
          iContains: 'john'
        }
      }, {
        email: {
          iEndsWith: '@company.com'
        }
      }, {
        role: {
          equals: 'USER'
        }
      }, {
        credits: {
          greaterThanOrEqual: 100
        }
      }, {
        isVerified: true
      }]
    },
    onChange: action('Complex filter changed')
  }
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  name: 'Custom Validation Rules',
  parameters: {
    docs: {
      description: {
        story: 'Property filter with custom validation rules for data integrity. Shows email validation and strict selection enforcement.'
      }
    }
  },
  args: {
    filterProperties: [{
      key: 'email',
      propertyLabel: 'Email Address',
      type: 'string',
      rule: {
        message: 'Please enter a valid email address',
        validate: (value: string) => /\\S+@\\S+\\.\\S+/.test(value)
      }
    }, {
      key: 'phone',
      propertyLabel: 'Phone Number',
      type: 'string',
      rule: {
        message: 'Phone number must be 10 digits',
        validate: (value: string) => /^\\d{10}$/.test(value.replace(/\\D/g, ''))
      }
    }, {
      key: 'department',
      propertyLabel: 'Department',
      type: 'enum',
      options: [{
        label: 'Engineering',
        value: 'ENGINEERING'
      }, {
        label: 'Marketing',
        value: 'MARKETING'
      }, {
        label: 'Sales',
        value: 'SALES'
      }, {
        label: 'HR',
        value: 'HR'
      }],
      strictSelection: true
    }],
    combinationMode: 'AND',
    onChange: action('Validated filter changed')
  }
}`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  name: 'Autocomplete Suggestions',
  parameters: {
    docs: {
      description: {
        story: 'Filter with predefined autocomplete options for improved user experience and data consistency.'
      }
    }
  },
  args: {
    filterProperties: [{
      key: 'country',
      propertyLabel: 'Country',
      type: 'string',
      options: [{
        label: 'United States',
        value: 'US'
      }, {
        label: 'United Kingdom',
        value: 'UK'
      }, {
        label: 'Canada',
        value: 'CA'
      }, {
        label: 'Australia',
        value: 'AU'
      }, {
        label: 'Germany',
        value: 'DE'
      }, {
        label: 'France',
        value: 'FR'
      }]
    }, {
      key: 'language',
      propertyLabel: 'Language',
      type: 'string',
      options: [{
        label: 'English',
        value: 'en'
      }, {
        label: 'Spanish',
        value: 'es'
      }, {
        label: 'French',
        value: 'fr'
      }, {
        label: 'German',
        value: 'de'
      }, {
        label: 'Chinese',
        value: 'zh'
      }, {
        label: 'Japanese',
        value: 'ja'
      }],
      defaultOperator: 'in'
    }],
    combinationMode: 'OR',
    value: {
      OR: [{
        country: {
          equals: 'US'
        }
      }, {
        language: {
          in: ['en', 'es']
        }
      }]
    },
    onChange: action('Autocomplete filter changed')
  }
}`,...H.parameters?.docs?.source}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'GraphQL property filter in its initial state with no applied filters. Start adding filters to see how they combine.'
      }
    }
  },
  args: {
    filterProperties: [{
      key: 'title',
      propertyLabel: 'Title',
      type: 'string'
    }, {
      key: 'isPublished',
      propertyLabel: 'Published',
      type: 'boolean'
    }, {
      key: 'viewCount',
      propertyLabel: 'View Count',
      type: 'number'
    }],
    combinationMode: 'AND',
    onChange: action('Filter changed from empty')
  }
}`,...U.parameters?.docs?.source}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Filter component in loading state, typically shown while fetching schema information or processing complex queries.'
      }
    }
  },
  args: {
    filterProperties: [{
      key: 'name',
      propertyLabel: 'Name',
      type: 'string'
    }],
    loading: true,
    combinationMode: 'AND',
    onChange: action('Filter changed')
  }
}`,...W.parameters?.docs?.source}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  name: 'Artifact Filter (Real-world Example)',
  parameters: {
    docs: {
      description: {
        story: 'Real-world example matching the ArtifactFilter GraphQL input type with name and status filtering capabilities. Shows how the component would be used in production.'
      }
    }
  },
  args: {
    filterProperties: [{
      key: 'name',
      propertyLabel: 'Artifact Name',
      type: 'string',
      operators: ['iContains', 'iEquals', 'iNotEquals', 'iStartsWith', 'iEndsWith'],
      defaultOperator: 'iContains'
    }, {
      key: 'status',
      propertyLabel: 'Artifact Status',
      type: 'enum',
      options: [{
        label: 'Draft',
        value: 'DRAFT'
      }, {
        label: 'Published',
        value: 'PUBLISHED'
      }, {
        label: 'Archived',
        value: 'ARCHIVED'
      }, {
        label: 'Deleted',
        value: 'DELETED'
      }],
      operators: ['equals', 'in'],
      strictSelection: true
    }],
    combinationMode: 'AND',
    value: {
      AND: [{
        name: {
          iContains: 'model'
        }
      }, {
        status: {
          in: ['PUBLISHED', 'DRAFT']
        }
      }]
    },
    onChange: action('Artifact filter changed')
  }
}`,...G.parameters?.docs?.source}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  name: 'Fixed Operator (No Selector)',
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates properties with fixed operators where the operator selector is hidden. Useful when you want to enforce a specific operator for certain fields.'
      }
    }
  },
  args: {
    filterProperties: [{
      key: 'search',
      propertyLabel: 'Search (always contains)',
      type: 'string',
      fixedOperator: 'iContains' // Only allows case-insensitive 'contains' operator
    }, {
      key: 'username',
      propertyLabel: 'Username (always equals)',
      type: 'string',
      fixedOperator: 'iEquals' // Only allows case-insensitive exact match
    }, {
      key: 'tags',
      propertyLabel: 'Tags (always in)',
      type: 'string',
      fixedOperator: 'in' // Only allows 'in' operator for multiple values
    }, {
      key: 'score',
      propertyLabel: 'Score (flexible)',
      type: 'number',
      // No fixedOperator, so operator selector is shown
      operators: ['equals', 'greaterThan', 'greaterThanOrEqual', 'lessThan', 'lessThanOrEqual']
    }],
    combinationMode: 'AND',
    onChange: action('Fixed operator filter changed')
  }
}`,...K.parameters?.docs?.source}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  name: 'Toggle Between AND/OR',
  parameters: {
    docs: {
      description: {
        story: 'Example showing how switching between AND and OR combination modes affects the filter logic. Try toggling the combination mode to see how the same conditions behave differently.'
      }
    }
  },
  args: {
    filterProperties: [{
      key: 'type',
      propertyLabel: 'Type',
      type: 'enum',
      options: [{
        label: 'Feature',
        value: 'FEATURE'
      }, {
        label: 'Bug',
        value: 'BUG'
      }, {
        label: 'Task',
        value: 'TASK'
      }]
    }, {
      key: 'priority',
      propertyLabel: 'Priority',
      type: 'enum',
      options: [{
        label: 'Critical',
        value: 'CRITICAL'
      }, {
        label: 'High',
        value: 'HIGH'
      }, {
        label: 'Medium',
        value: 'MEDIUM'
      }, {
        label: 'Low',
        value: 'LOW'
      }]
    }, {
      key: 'assignedToMe',
      propertyLabel: 'Assigned to Me',
      type: 'boolean'
    }],
    combinationMode: 'AND',
    onChange: action('Filter changed with mode toggle')
  }
}`,...q.parameters?.docs?.source}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  name: 'DateTime Filters',
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates datetime filtering with a DatePicker UI. When a datetime property is selected, a date picker with time selection is rendered instead of a text input. Useful for filtering by created_at, updated_at, or other timestamp fields.'
      }
    }
  },
  args: {
    filterProperties: [{
      key: 'created_at',
      propertyLabel: 'Created At',
      type: 'datetime'
    }, {
      key: 'updated_at',
      propertyLabel: 'Updated At',
      type: 'datetime',
      defaultOperator: 'after'
    }, {
      key: 'name',
      propertyLabel: 'Name',
      type: 'string',
      defaultOperator: 'iContains'
    }, {
      key: 'isActive',
      propertyLabel: 'Active Status',
      type: 'boolean'
    }],
    combinationMode: 'AND',
    onChange: action('DateTime filter changed')
  }
}`,...J.parameters?.docs?.source}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  name: 'DateTime with Pre-applied Filters',
  parameters: {
    docs: {
      description: {
        story: 'DateTime filters with pre-applied conditions showing how datetime values are displayed in filter tags with a human-readable format (YYYY-MM-DD HH:mm).'
      }
    }
  },
  args: {
    filterProperties: [{
      key: 'created_at',
      propertyLabel: 'Created At',
      type: 'datetime'
    }, {
      key: 'updated_at',
      propertyLabel: 'Updated At',
      type: 'datetime'
    }, {
      key: 'name',
      propertyLabel: 'Name',
      type: 'string'
    }],
    combinationMode: 'AND',
    value: {
      AND: [{
        created_at: {
          after: '2025-01-01T00:00:00.000Z'
        }
      }, {
        updated_at: {
          before: '2025-12-31T23:59:59.000Z'
        }
      }, {
        name: {
          iContains: 'test'
        }
      }]
    },
    onChange: action('DateTime pre-filtered changed')
  }
}`,...Y.parameters?.docs?.source}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  name: 'UUID Filters',
  parameters: {
    docs: {
      description: {
        story: 'UUID type properties use \`equals\`, \`notEquals\`, \`in\`, \`notIn\` operators. Combine with a \`rule\` for format validation.'
      }
    }
  },
  args: {
    filterProperties: [{
      key: 'projectId',
      propertyLabel: 'Project ID',
      type: 'uuid',
      rule: {
        message: 'Must be a valid UUID.',
        validate: (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
      }
    }, {
      key: 'domainId',
      propertyLabel: 'Domain ID',
      type: 'uuid',
      defaultOperator: 'notEquals'
    }],
    combinationMode: 'AND',
    value: {
      projectId: {
        equals: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
      }
    },
    onChange: action('UUID filter changed')
  }
}`,...X.parameters?.docs?.source}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
  name: 'Custom Input via renderInput',
  parameters: {
    docs: {
      description: {
        story: "When \`renderInput\` is provided, the default AutoComplete is replaced with a custom control. The control stages a value via \`onAddCondition(value, label?)\` and the edit popover's Apply button commits it; feed the render prop's \`value\` back into the control so the staged pick stays visible. Useful for async selects (e.g., fetching options from an API)."
      }
    }
  },
  args: {
    filterProperties: [{
      key: 'name',
      propertyLabel: 'Name',
      type: 'string',
      defaultOperator: 'iContains'
    }, {
      key: 'storageHost',
      propertyLabel: 'Storage Host',
      type: 'string',
      defaultOperator: 'equals',
      renderInput: ({
        onAddCondition,
        value,
        isDisabled
      }) => <BAIComplexSelect label="Storage Host" isLabelHidden placeholder="Select storage host" hasSearch={false} options={sampleStorageHostOptions} isDisabled={isDisabled} value={sampleStorageHostOptions.find(option => option.value === value) ?? null} onChange={next => {
        const labeled = next as BAILabeledValue | null;
        onAddCondition(labeled?.value);
      }} />
    }],
    combinationMode: 'AND',
    onChange: action('renderInput filter changed')
  }
}`,...Z.parameters?.docs?.source}}},Q.parameters={...Q.parameters,docs:{...Q.parameters?.docs,source:{originalSource:`{
  name: 'Scalar valueMode on string field',
  parameters: {
    docs: {
      description: {
        story: "Demonstrates valueMode='scalar' on a non-boolean field. The filter emits { slugExact: 'my-slug' } without an operator, while tags still display using implicitOperator (default '=')."
      }
    }
  },
  args: {
    filterProperties: [{
      key: 'slugExact',
      propertyLabel: 'Slug (scalar exact)',
      type: 'string',
      valueMode: 'scalar',
      implicitOperator: 'equals'
    }, {
      key: 'title',
      propertyLabel: 'Title',
      type: 'string',
      defaultOperator: 'iContains'
    }, {
      key: 'isPublished',
      propertyLabel: 'Published',
      type: 'boolean' // defaults to scalar mode
    }],
    combinationMode: 'AND',
    value: {
      AND: [{
        slugExact: 'hello-world'
      }, {
        isPublished: true
      }]
    },
    onChange: action('Scalar mode (string) filter changed')
  }
}`,...Q.parameters?.docs?.source}}},$.parameters={...$.parameters,docs:{...$.parameters?.docs,source:{originalSource:`{
  name: 'Custom input (onAddCondition)',
  parameters: {
    docs: {
      description: {
        story: "A property whose input is a controlled \`BAIComplexSelect\` supplied via \`renderInput\`. Selecting an option calls \`onAddCondition(value, label)\`, which stages the value; the edit popover's Apply button commits it, serialized per \`type: 'uuid'\` → \`{ owner: { id: { equals: <id> } } }\`, while the token shows the label (email) instead of the opaque UUID. The render prop's \`value\` is fed back into the select so the staged pick stays visible."
      }
    }
  },
  args: {
    filterProperties: [{
      key: 'owner.id',
      propertyLabel: 'Owner',
      type: 'uuid',
      fixedOperator: 'equals',
      renderInput: ({
        onAddCondition,
        value,
        isDisabled
      }) => <BAIComplexSelect label="Owner" isLabelHidden placeholder="Select owner" options={sampleOwnerOptions} isDisabled={isDisabled} value={sampleOwnerOptions.find(option => option.value === value) ?? null} onChange={next => {
        const labeled = next as BAILabeledValue | null;
        onAddCondition(labeled?.value, labeled?.label);
      }} />
    }],
    combinationMode: 'AND',
    onChange: action('custom input filter changed')
  }
}`,...$.parameters?.docs?.source}}},Xt=[`Default`,`WithANDCombination`,`WithORCombination`,`WithNumberFilters`,`WithEnumFilters`,`ComplexFilter`,`WithValidation`,`WithAutocompleteOptions`,`EmptyState`,`LoadingState`,`ArtifactFilterExample`,`WithFixedOperator`,`ToggleCombinationMode`,`WithDateTimeFilters`,`WithDateTimePrefiltered`,`WithUUIDFilters`,`WithRenderInput`,`WithScalarValueModeOnString`,`WithCustomType`]})))()}Zt();export{G as ArtifactFilterExample,B as ComplexFilter,F as Default,U as EmptyState,W as LoadingState,q as ToggleCombinationMode,I as WithANDCombination,H as WithAutocompleteOptions,$ as WithCustomType,J as WithDateTimeFilters,Y as WithDateTimePrefiltered,z as WithEnumFilters,K as WithFixedOperator,R as WithNumberFilters,L as WithORCombination,Z as WithRenderInput,Q as WithScalarValueModeOnString,X as WithUUIDFilters,V as WithValidation,Xt as __namedExportsOrder,Jt as default};