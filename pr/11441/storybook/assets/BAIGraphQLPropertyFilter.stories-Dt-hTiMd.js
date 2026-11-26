import{a as e,n as t}from"./rolldown-runtime-sJBDdmOt.js";import{t as n}from"./react-DlPsW1c0.js";import{n as r,t as i}from"./isObject-Cu5W6UBH.js";import{n as a,t as o}from"./toString-DisgP18h.js";import{n as s,t as c}from"./isArray-BUM1roHa.js";import{c as l,m as ee,p as u,s as d}from"./_MapCache-BO72uBjB.js";import{D as f,F as p,I as te,N as m,O as ne,P as re,g as h,h as g}from"./_Uint8Array-CML-PeBB.js";import{b as ie,c as _,g as ae,h as v,i as oe,l as y,m as se,n as ce,p as b,r as x,s as S,t as C,u as w,y as T}from"./_initCloneObject-3G0fQ1c2.js";import{n as le,t as E}from"./_baseAssignValue-B5Z_yXpu.js";import{n as D,t as O}from"./_baseRest-DuBiahw7.js";import{n as ue,t as k}from"./_isIterateeCall-DEj04woj.js";import{a as A,c as j,i as de,o as fe,r as pe,s as me}from"./_charsEndIndex-BMkEK6oE.js";import{n as he,t as ge}from"./compact-C9OPbfhP.js";import{i as _e,r as ve}from"./_baseEach-CdiI3tC0.js";import{n as ye,t as be}from"./keyBy-BPJfB94V.js";import{m as xe,t as Se}from"./hooks-DgO_LXe-.js";import{n as Ce,t as we}from"./isArrayLikeObject-F1ceyDIg.js";import{i as Te,n as Ee,r as De,t as Oe}from"./find-DOIFDFv0.js";import{n as M,t as ke}from"./map-IIuwj5IU.js";import{n as Ae,t as je}from"./includes-Vl5KV-V-.js";import{n as Me,t as Ne}from"./isNumber-BkvUSshz.js";import{n as Pe,t as Fe}from"./split-DfpH0YJV.js";import{a as Ie,c as Le,i as Re,l as ze,n as Be,o as Ve,s as He,t as Ue,u as We}from"./BAIPowerSearchAdapters-DxiyOQkz.js";import{n as Ge,t as Ke}from"./uniqBy-CokhPbWO.js";import{t as qe}from"./jsx-runtime-MKhVqBIO.js";import{n as Je,t as Ye}from"./useBAIi18n-CXS6vCcL.js";import{t as Xe}from"./dayjs.min-D7GtMU8l.js";import{t as Ze}from"./compiler-runtime-DU4U6aph.js";import{Mn as Qe,Nn as $e,g as et}from"./iframe-D_gWGTAs.js";import{n as tt,t as nt}from"./BAIComplexSelect-C7x-LUEy.js";function rt(e){return O(function(t,n){var r=-1,i=n.length,a=i>1?n[i-1]:void 0,o=i>2?n[2]:void 0;for(a=e.length>3&&typeof a==`function`?(i--,a):void 0,o&&ue(n[0],n[1],o)&&(a=i<3?void 0:a,i=1),t=Object(t);++r<i;){var s=n[r];s&&e(t,s,r,a)}return t})}function it(){return(it=t((()=>{D(),k()})))()}function at(e){return function(t){t=a(t);var n=A(t)?de(t):void 0,r=n?n[0]:t.charAt(0),i=n?me(n,1).join(``):t.slice(1);return r[e]()+i}}function ot(){return(ot=t((()=>{j(),fe(),pe(),o()})))()}var st;function ct(){return(ct=t((()=>{ot(),st=at(`toUpperCase`)})))()}function lt(e,t,n){(n!==void 0&&!d(e[t],n)||n===void 0&&!(t in e))&&E(e,t,n)}function ut(){return(ut=t((()=>{le(),l()})))()}function dt(e,t){if((t!==`constructor`||typeof e[t]!=`function`)&&t!=`__proto__`)return e[t]}function ft(){return(ft=t((()=>{})))()}function pt(e){return v(e,se(e))}function mt(){return(mt=t((()=>{ae(),b()})))()}function ht(e,t,n,i,a,o,c){var l=dt(e,n),u=dt(t,n),d=c.get(u);if(d)lt(e,n,d);else{var f=o?o(l,u,n+``,e,t,c):void 0,p=f===void 0;if(p){var m=s(u),h=!m&&re(u),g=!m&&!h&&ne(u);f=u,m||h||g?s(l)?f=l:Ce(l)?f=T(l):h?(p=!1,f=S(u,!0)):g?(p=!1,f=x(u,!0)):f=[]:w(u)||te(u)?(f=l,te(l)?f=pt(l):(!r(l)||ee(l))&&(f=C(u))):p=!1}p&&(c.set(u,f),a(f,u,i,o,c),c.delete(u)),lt(e,n,f)}}function gt(){return(gt=t((()=>{ut(),_(),oe(),ie(),ce(),p(),c(),we(),m(),u(),i(),y(),f(),ft(),mt()})))()}function _t(e,t,n,i,a){e!==t&&ve(t,function(o,s){if(a||=new g,r(o))ht(e,t,s,n,_t,i,a);else{var c=i?i(dt(e,s),o,s+``,e,t,a):void 0;c===void 0&&(c=o),lt(e,s,c)}},se)}function vt(){return(vt=t((()=>{h(),ut(),_e(),gt(),i(),b(),ft()})))()}var yt;function bt(){return(bt=t((()=>{vt(),it(),yt=rt(function(e,t,n){_t(e,t,n)})})))()}function xt(){return`filter-${Date.now()}-${Math.random().toString(36).substring(2,11)}`}function St(e,t){let n=e.split(`.`);if(n.some(e=>e===``||e===`__proto__`||e===`constructor`||e===`prototype`))return{};let r=t;for(let e=n.length-1;e>0;e--)r={[n[e]]:r};return{[n[0]]:r}}function Ct(e){let t=e.split(`.`),n=De(t,(e,n)=>n>0&&n<t.length-1&&Wt.has(e));return n<0?void 0:{parent:t.slice(0,n+1).join(`.`),leaf:t.slice(n+1).join(`.`)}}function wt(e,t,n=`AND`){if(e.length===0)return;let r=[],i=[];e.forEach(e=>{let a=t.find(t=>t.key===e.property),o;if((a?.valueMode||(a?.type===`boolean`?`scalar`:`operator`))===`scalar`)o=a?.type===`boolean`?e.value===!0||e.value===`true`:a?.type===`number`?Number(e.value):e.value;else if(e.operator===`in`||e.operator===`notIn`){let t=Array.isArray(e.value)?e.value:e.value.split(`,`).map(e=>e.trim());o={[e.operator]:a?.type===`number`?t.map(Number):t}}else{let t=e.value;a?.type===`number`&&(t=Number(t)),o={[e.operator]:t}}let s=n===`AND`?Ct(e.property):void 0;if(!s){r.push({filter:St(e.property,o)});return}let c=Oe(i,e=>e.parent===s.parent&&!e.leaves.has(s.leaf));c||(c={parent:s.parent,leaves:new Map},i.push(c),r.push({row:c})),c.leaves.set(s.leaf,o)});let a=M(r,e=>`row`in e?St(e.row.parent,yt({},...Array.from(e.row.leaves,([e,t])=>St(e,t)))):e.filter);return a.length===1?a[0]:{[n]:a}}function Tt(e,t,n=``){let r=[];return Object.keys(e).forEach(i=>{if(i===`AND`||i===`OR`||i===`NOT`||i===`DISTINCT`)return;let a=n?`${n}.${i}`:i,o=e[i],s=t.find(e=>e.key===a);s?(s.valueMode||(s.type===`boolean`?`scalar`:`operator`))===`scalar`&&typeof o!=`object`?r.push({id:xt(),property:a,operator:s.implicitOperator||`equals`,value:String(o),propertyLabel:s.propertyLabel||a,type:s.type||`string`}):o&&typeof o==`object`&&Object.keys(o).forEach(e=>{let t=o[e];t!=null&&r.push({id:xt(),property:a,operator:e,value:Array.isArray(t)?t.join(`, `):String(t),propertyLabel:s.propertyLabel||a,type:s.type||`string`})}):o&&typeof o==`object`&&(Object.keys(o).some(e=>[`eq`,`ne`,`lt`,`le`,`gt`,`ge`,`contains`,`notContains`,`startsWith`,`endsWith`,`ilike`,`in`,`notIn`,`isNull`].includes(e))||r.push(...Tt(o,t,a)))}),r}function Et(e,t){if(!e)return[];let n=[];if(e.AND||e.OR){let r=e.AND||e.OR;return(Array.isArray(r)?r:[r]).forEach(e=>{n.push(...Et(e,t))}),n}return n.push(...Tt(e,t)),n}function Dt(e){return Gt(e)===`scalar`?[e.implicitOperator||`equals`]:e.fixedOperator?[e.fixedOperator]:e.operators||Bt[e.type||`string`]}function Ot(e){return Gt(e)===`scalar`?e.implicitOperator||`equals`:e.fixedOperator||e.defaultOperator||Vt[e.type]}function kt(e,t,n){if(n)return n;let r=Kt(e),i=N(e);if(je(Ht,t))return r&&i?{type:`enum_list`,values:Re(r)}:{type:`string_list`,searchSource:Ie(r),isArbitraryStringAllowed:!0};if(e.type===`datetime`)return{type:`date_absolute`};if(e.type===`number`)return{type:`float`};if(r&&i)return{type:`enum`,values:Re(r)};let a=Ie(r);return a?{type:`string`,searchSource:a,isArbitraryStringAllowed:!0}:{type:`string`}}function At(e,t){let n=e.value;if(je(Ht,e.operator)){let e=s(n)?M(n,a):ge(M(Pe(a(n),`,`),We));return t&&Kt(t)&&N(t)?{type:`enum_list`,value:e}:{type:`string_list`,value:e}}if(t?.type===`datetime`){let e=(0,Lt.default)(a(n));return{type:`date_absolute`,unixSeconds:e.isValid()?e.unix():(0,Lt.default)().unix()}}return t?.type===`number`?{type:`float`,value:Number(n)}:t?.renderInput?{type:`custom`,value:a(n)}:t&&Kt(t)&&N(t)?{type:`enum`,value:a(n)}:{type:`string`,value:a(n)}}function jt(e){switch(e.type){case`empty`:return``;case`date_absolute`:return Lt.default.unix(e.unixSeconds).toISOString();case`integer`:case`float`:return String(e.value);case`string_list`:case`enum_list`:return[...e.value];case`entity_list`:return M(e.value,e=>e.id);case`date_range`:return JSON.stringify(e.value);default:return a(e.value??``)}}function Mt(e,t){let n=ye(t,`key`);return M(Et(e,t),e=>({field:e.property,operator:e.operator,value:At(e,n[e.property])}))}function Nt(e,t,n=`AND`,r=!1,i){let a=ye(t,`key`),o=r?Ge([...e].reverse(),`field`).reverse():[...e],s=Me(i)&&o.length>i?i<=0?[]:o.slice(-i):o;return wt(M(s,e=>{let t=a[e.field];return{id:xt(),property:e.field,operator:e.operator,value:jt(e.value),propertyLabel:t?.propertyLabel??e.field,type:t?.type??`string`}}),t,n)}function Pt(e){return e.type===`string`&&!N(e)&&!e.renderInput}var Ft,It,Lt,Rt,zt,Bt,Vt,Ht,Ut,Wt,Gt,Kt,N,qt,Jt;function Yt(){return(Yt=t((()=>{Ft=Ze(),Se(),Ye(),Be(),Le(),It=e(et(),1),Lt=e(Xe(),1),Te(),Ee(),ke(),bt(),ct(),Ae(),c(),o(),he(),Fe(),ze(),be(),Ke(),Ne(),$e(),Rt=n(),zt=qe(),Bt={string:[`iContains`,`iNotContains`,`iEquals`,`iNotEquals`,`iStartsWith`,`iNotStartsWith`,`iEndsWith`,`iNotEndsWith`],number:[`equals`,`notEquals`,`greaterThan`,`greaterThanOrEqual`,`lessThan`,`lessThanOrEqual`],boolean:[`equals`],enum:[`equals`,`notEquals`,`in`,`notIn`],uuid:[`equals`,`notEquals`,`in`,`notIn`],datetime:[`equals`,`notEquals`,`before`,`after`]},Vt={string:`iContains`,number:`equals`,boolean:`equals`,enum:`equals`,uuid:`equals`,datetime:`equals`},Ht=[`in`,`notIn`],Ut=[{label:`True`,value:`true`},{label:`False`,value:`false`}],Wt=new Set([`some`,`every`,`none`]),Gt=e=>e?.valueMode||(e?.type===`boolean`?`scalar`:`operator`),Kt=e=>e.options??(e.type===`boolean`?Ut:void 0),N=e=>e.strictSelection??e.type===`boolean`,qt=(e,t)=>t(`comp:BAIGraphQLPropertyFilter.operator.${st(e)}`,{defaultValue:e}),Jt=e=>{"use memo";let t=(0,Ft.c)(60),{filterProperties:n,value:r,onChange:i,defaultValue:a,combinationMode:o,singleCondition:s,maxConditions:c,label:l,placeholder:ee,applyLabel:u,resultCount:d,contentSearchFieldKey:f,isDisabled:p,size:te,style:m,className:ne,loading:re,"data-testid":h}=e,g=o===void 0?`AND`:o,ie=s!==void 0&&s,{t:_}=Je(),ae;t[0]!==a||t[1]!==i||t[2]!==r?(ae={value:r,defaultValue:a,onChange:i},t[0]=a,t[1]=i,t[2]=r,t[3]=ae):ae=t[3];let[v,oe]=xe(ae),y;t[4]===Symbol.for(`react.memo_cache_sentinel`)?(y={},t[4]=y):y=t[4];let se=(0,Rt.useRef)(y),ce;t[5]===Symbol.for(`react.memo_cache_sentinel`)?(ce={recordLabel:(e,t,n)=>{se.current[`${e}::${t}`]=n},resolveLabel:(e,t)=>se.current[`${e}::${t}`]??t},t[5]=ce):ce=t[5];let b=Ve(ce),x,S,C;if(t[6]!==f||t[7]!==n||t[8]!==b||t[9]!==_||t[10]!==v){let e=ye(n,`key`),r=Et(v,n),i;t[14]!==n||t[15]!==v?(i=Mt(v,n),t[14]=n,t[15]=v,t[16]=i):i=t[16],S=i;let a=f??Oe(n,Pt)?.key,o;if(t[17]!==n||t[18]!==b||t[19]!==_){let e;t[21]!==b||t[22]!==_?(e=e=>{let t=b.operatorValueFor(e.key,e.renderInput);return{key:e.key,label:e.propertyLabel,defaultOperator:Ot(e),operators:M(Dt(e),n=>({key:n,label:qt(n,_),value:kt(e,n,t)}))}},t[21]=b,t[22]=_,t[23]=e):e=t[23],o=M(n,e),t[17]=n,t[18]=b,t[19]=_,t[20]=o}else o=t[20];let s;t[24]!==a||t[25]!==o?(s={name:`bai-graphql-property-filter`,contentSearchFieldKey:a,fields:o},t[24]=a,t[25]=o,t[26]=s):s=t[26],x=s,C=Oe(M(r,t=>{let n=e[t.property]?.rule;if(n)return n.validate(t.value)?void 0:n.message})),t[6]=f,t[7]=n,t[8]=b,t[9]=_,t[10]=v,t[11]=x,t[12]=S,t[13]=C}else x=t[11],S=t[12],C=t[13];let w=C,T;t[27]!==g||t[28]!==n||t[29]!==c||t[30]!==oe||t[31]!==ie?(T=e=>{oe(Nt(e,n,g,ie,c))},t[27]=g,t[28]=n,t[29]=c,t[30]=oe,t[31]=ie,t[32]=T):T=t[32];let le=T,E;t[33]!==l||t[34]!==_?(E=l??_(`comp:BAIPropertyFilter.SearchLabel`),t[33]=l,t[34]=_,t[35]=E):E=t[35];let D;t[36]!==ee||t[37]!==_?(D=ee??_(`comp:BAIPropertyFilter.PlaceHolder`),t[36]=ee,t[37]=_,t[38]=D):D=t[38];let O;t[39]!==u||t[40]!==_?(O=u??_(`comp:BAIPropertyFilter.Apply`),t[39]=u,t[40]=_,t[41]=O):O=t[41];let ue=p||re,k;t[42]===ne?k=t[43]:(k=(0,It.default)(`bai-power-search`,ne),t[42]=ne,t[43]=k);let A;t[44]===w?A=t[45]:(A=w?{type:`error`,message:w}:void 0,t[44]=w,t[45]=A);let j;return t[46]!==x||t[47]!==h||t[48]!==S||t[49]!==le||t[50]!==d||t[51]!==te||t[52]!==m||t[53]!==O||t[54]!==ue||t[55]!==k||t[56]!==A||t[57]!==E||t[58]!==D?(j=(0,zt.jsx)(He,{config:x,components:Ue,filters:S,startIcon:Qe,label:E,placeholder:D,popoverSaveButtonLabel:O,resultCount:d,isDisabled:ue,size:te,style:m,className:k,"data-testid":h,status:A,onChange:le}),t[46]=x,t[47]=h,t[48]=S,t[49]=le,t[50]=d,t[51]=te,t[52]=m,t[53]=O,t[54]=ue,t[55]=k,t[56]=A,t[57]=E,t[58]=D,t[59]=j):j=t[59],j}})))()}var Xt,Zt,P,Qt,$t,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q,en,$,tn;function nn(){return(nn=t((()=>{tt(),Yt(),Xt=n(),Zt=qe(),{action:P}=__STORYBOOK_MODULE_ACTIONS__,Qt=[{label:`local:volume1`,value:`local:volume1`},{label:`local:volume2`,value:`local:volume2`},{label:`nfs:data`,value:`nfs:data`}],$t={title:`Filter/BAIGraphQLPropertyFilter`,component:Jt,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`
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
        `}},onChange:{description:`Callback when filter value changes`,table:{type:{summary:`(value: GraphQLFilter | undefined) => void`}}},loading:{control:{type:`boolean`},description:`Show loading state`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},combinationMode:{control:{type:`radio`},options:[`AND`,`OR`],description:`How to combine multiple filter conditions`,table:{type:{summary:`'AND' | 'OR'`},defaultValue:{summary:`AND`}}}},render:e=>{let[t,n]=(0,Xt.useState)(e.value);return(0,Zt.jsx)(Jt,{...e,value:t,onChange:t=>{e.onChange?.(t),n(t)}})}},F={name:`Basic Usage`,parameters:{docs:{description:{story:`Basic GraphQL property filter with string and boolean properties. Try adding filters and see how they combine into a GraphQL filter object.`}}},args:{filterProperties:[{key:`name`,propertyLabel:`Name`,type:`string`,defaultOperator:`iContains`},{key:`description`,propertyLabel:`Description`,type:`string`},{key:`isActive`,propertyLabel:`Active Status`,type:`boolean`}],combinationMode:`AND`,onChange:P(`Filter changed`)}},I={name:`Multiple Filters with AND`,parameters:{docs:{description:{story:`Demonstrates filters combined with AND operator. All conditions must be satisfied for a match. This is useful when you need strict filtering.`}}},args:{filterProperties:[{key:`title`,propertyLabel:`Title`,type:`string`},{key:`priority`,propertyLabel:`Priority`,type:`enum`,options:[{label:`High`,value:`HIGH`},{label:`Medium`,value:`MEDIUM`},{label:`Low`,value:`LOW`}]},{key:`isUrgent`,propertyLabel:`Urgent`,type:`boolean`}],combinationMode:`AND`,value:{AND:[{title:{iContains:`critical`}},{priority:{equals:`HIGH`}},{isUrgent:!0}]},onChange:P(`AND Filter changed`)}},L={name:`Multiple Filters with OR`,parameters:{docs:{description:{story:`Demonstrates filters combined with OR operator. Any condition can match for a result. This is useful for more flexible, inclusive filtering.`}}},args:{filterProperties:[{key:`status`,propertyLabel:`Status`,type:`enum`,options:[{label:`Urgent`,value:`URGENT`},{label:`High Priority`,value:`HIGH_PRIORITY`},{label:`Normal`,value:`NORMAL`}]},{key:`assignee`,propertyLabel:`Assignee`,type:`string`},{key:`dueToday`,propertyLabel:`Due Today`,type:`boolean`}],combinationMode:`OR`,value:{OR:[{status:{equals:`URGENT`}},{assignee:{iContains:`john`}},{dueToday:!0}]},onChange:P(`OR Filter changed`)}},R={name:`Number Filters with Comparisons`,parameters:{docs:{description:{story:`Shows numeric filtering with comparison operators like greater than, less than, etc. Useful for filtering by quantities, scores, or metrics.`}}},args:{filterProperties:[{key:`score`,propertyLabel:`Score`,type:`number`,operators:[`equals`,`notEquals`,`greaterThan`,`greaterThanOrEqual`,`lessThan`,`lessThanOrEqual`]},{key:`quantity`,propertyLabel:`Quantity`,type:`number`},{key:`price`,propertyLabel:`Price`,type:`number`,operators:[`greaterThan`,`lessThan`,`equals`],defaultOperator:`greaterThan`}],combinationMode:`AND`,value:{AND:[{score:{greaterThanOrEqual:80}},{quantity:{lessThan:100}}]},onChange:P(`Number filter changed`)}},z={name:`Enum Filters with Multiple Selection`,parameters:{docs:{description:{story:`Demonstrates enum type filtering with in/notIn operators for multiple value selection. Perfect for status fields, categories, or any predefined set of values.`}}},args:{filterProperties:[{key:`status`,propertyLabel:`Status`,type:`enum`,options:[{label:`Active`,value:`ACTIVE`},{label:`Inactive`,value:`INACTIVE`},{label:`Pending`,value:`PENDING`},{label:`Archived`,value:`ARCHIVED`}],operators:[`equals`,`notEquals`,`in`,`notIn`],strictSelection:!0},{key:`category`,propertyLabel:`Category`,type:`enum`,options:[{label:`Frontend`,value:`FRONTEND`},{label:`Backend`,value:`BACKEND`},{label:`Database`,value:`DATABASE`},{label:`DevOps`,value:`DEVOPS`}],defaultOperator:`in`}],combinationMode:`AND`,value:{AND:[{status:{in:[`ACTIVE`,`PENDING`]}},{category:{notEquals:`DATABASE`}}]},onChange:P(`Enum filter changed`)}},B={name:`Complex Combined Filter`,parameters:{docs:{description:{story:`Example showing multiple filters with different property types combined with the selected mode (AND/OR) for comprehensive filtering.`}}},args:{filterProperties:[{key:`name`,propertyLabel:`Name`,type:`string`},{key:`email`,propertyLabel:`Email`,type:`string`,operators:[`iContains`,`iStartsWith`,`iEndsWith`]},{key:`role`,propertyLabel:`Role`,type:`enum`,options:[{label:`Admin`,value:`ADMIN`},{label:`User`,value:`USER`},{label:`Guest`,value:`GUEST`}]},{key:`credits`,propertyLabel:`Credits`,type:`number`},{key:`isVerified`,propertyLabel:`Verified`,type:`boolean`}],combinationMode:`AND`,value:{AND:[{name:{iContains:`john`}},{email:{iEndsWith:`@company.com`}},{role:{equals:`USER`}},{credits:{greaterThanOrEqual:100}},{isVerified:!0}]},onChange:P(`Complex filter changed`)}},V={name:`Custom Validation Rules`,parameters:{docs:{description:{story:`Property filter with custom validation rules for data integrity. Shows email validation and strict selection enforcement.`}}},args:{filterProperties:[{key:`email`,propertyLabel:`Email Address`,type:`string`,rule:{message:`Please enter a valid email address`,validate:e=>/\S+@\S+\.\S+/.test(e)}},{key:`phone`,propertyLabel:`Phone Number`,type:`string`,rule:{message:`Phone number must be 10 digits`,validate:e=>/^\d{10}$/.test(e.replace(/\D/g,``))}},{key:`department`,propertyLabel:`Department`,type:`enum`,options:[{label:`Engineering`,value:`ENGINEERING`},{label:`Marketing`,value:`MARKETING`},{label:`Sales`,value:`SALES`},{label:`HR`,value:`HR`}],strictSelection:!0}],combinationMode:`AND`,onChange:P(`Validated filter changed`)}},H={name:`Autocomplete Suggestions`,parameters:{docs:{description:{story:`Filter with predefined autocomplete options for improved user experience and data consistency.`}}},args:{filterProperties:[{key:`country`,propertyLabel:`Country`,type:`string`,options:[{label:`United States`,value:`US`},{label:`United Kingdom`,value:`UK`},{label:`Canada`,value:`CA`},{label:`Australia`,value:`AU`},{label:`Germany`,value:`DE`},{label:`France`,value:`FR`}]},{key:`language`,propertyLabel:`Language`,type:`string`,options:[{label:`English`,value:`en`},{label:`Spanish`,value:`es`},{label:`French`,value:`fr`},{label:`German`,value:`de`},{label:`Chinese`,value:`zh`},{label:`Japanese`,value:`ja`}],defaultOperator:`in`}],combinationMode:`OR`,value:{OR:[{country:{equals:`US`}},{language:{in:[`en`,`es`]}}]},onChange:P(`Autocomplete filter changed`)}},U={parameters:{docs:{description:{story:`GraphQL property filter in its initial state with no applied filters. Start adding filters to see how they combine.`}}},args:{filterProperties:[{key:`title`,propertyLabel:`Title`,type:`string`},{key:`isPublished`,propertyLabel:`Published`,type:`boolean`},{key:`viewCount`,propertyLabel:`View Count`,type:`number`}],combinationMode:`AND`,onChange:P(`Filter changed from empty`)}},W={parameters:{docs:{description:{story:`Filter component in loading state, typically shown while fetching schema information or processing complex queries.`}}},args:{filterProperties:[{key:`name`,propertyLabel:`Name`,type:`string`}],loading:!0,combinationMode:`AND`,onChange:P(`Filter changed`)}},G={name:`Artifact Filter (Real-world Example)`,parameters:{docs:{description:{story:`Real-world example matching the ArtifactFilter GraphQL input type with name and status filtering capabilities. Shows how the component would be used in production.`}}},args:{filterProperties:[{key:`name`,propertyLabel:`Artifact Name`,type:`string`,operators:[`iContains`,`iEquals`,`iNotEquals`,`iStartsWith`,`iEndsWith`],defaultOperator:`iContains`},{key:`status`,propertyLabel:`Artifact Status`,type:`enum`,options:[{label:`Draft`,value:`DRAFT`},{label:`Published`,value:`PUBLISHED`},{label:`Archived`,value:`ARCHIVED`},{label:`Deleted`,value:`DELETED`}],operators:[`equals`,`in`],strictSelection:!0}],combinationMode:`AND`,value:{AND:[{name:{iContains:`model`}},{status:{in:[`PUBLISHED`,`DRAFT`]}}]},onChange:P(`Artifact filter changed`)}},K={name:`Fixed Operator (No Selector)`,parameters:{docs:{description:{story:`Demonstrates properties with fixed operators where the operator selector is hidden. Useful when you want to enforce a specific operator for certain fields.`}}},args:{filterProperties:[{key:`search`,propertyLabel:`Search (always contains)`,type:`string`,fixedOperator:`iContains`},{key:`username`,propertyLabel:`Username (always equals)`,type:`string`,fixedOperator:`iEquals`},{key:`tags`,propertyLabel:`Tags (always in)`,type:`string`,fixedOperator:`in`},{key:`score`,propertyLabel:`Score (flexible)`,type:`number`,operators:[`equals`,`greaterThan`,`greaterThanOrEqual`,`lessThan`,`lessThanOrEqual`]}],combinationMode:`AND`,onChange:P(`Fixed operator filter changed`)}},q={name:`Toggle Between AND/OR`,parameters:{docs:{description:{story:`Example showing how switching between AND and OR combination modes affects the filter logic. Try toggling the combination mode to see how the same conditions behave differently.`}}},args:{filterProperties:[{key:`type`,propertyLabel:`Type`,type:`enum`,options:[{label:`Feature`,value:`FEATURE`},{label:`Bug`,value:`BUG`},{label:`Task`,value:`TASK`}]},{key:`priority`,propertyLabel:`Priority`,type:`enum`,options:[{label:`Critical`,value:`CRITICAL`},{label:`High`,value:`HIGH`},{label:`Medium`,value:`MEDIUM`},{label:`Low`,value:`LOW`}]},{key:`assignedToMe`,propertyLabel:`Assigned to Me`,type:`boolean`}],combinationMode:`AND`,onChange:P(`Filter changed with mode toggle`)}},J={name:`DateTime Filters`,parameters:{docs:{description:{story:`Demonstrates datetime filtering with a DatePicker UI. When a datetime property is selected, a date picker with time selection is rendered instead of a text input. Useful for filtering by created_at, updated_at, or other timestamp fields.`}}},args:{filterProperties:[{key:`created_at`,propertyLabel:`Created At`,type:`datetime`},{key:`updated_at`,propertyLabel:`Updated At`,type:`datetime`,defaultOperator:`after`},{key:`name`,propertyLabel:`Name`,type:`string`,defaultOperator:`iContains`},{key:`isActive`,propertyLabel:`Active Status`,type:`boolean`}],combinationMode:`AND`,onChange:P(`DateTime filter changed`)}},Y={name:`DateTime with Pre-applied Filters`,parameters:{docs:{description:{story:`DateTime filters with pre-applied conditions showing how datetime values are displayed in filter tags with a human-readable format (YYYY-MM-DD HH:mm).`}}},args:{filterProperties:[{key:`created_at`,propertyLabel:`Created At`,type:`datetime`},{key:`updated_at`,propertyLabel:`Updated At`,type:`datetime`},{key:`name`,propertyLabel:`Name`,type:`string`}],combinationMode:`AND`,value:{AND:[{created_at:{after:`2025-01-01T00:00:00.000Z`}},{updated_at:{before:`2025-12-31T23:59:59.000Z`}},{name:{iContains:`test`}}]},onChange:P(`DateTime pre-filtered changed`)}},X={name:`UUID Filters`,parameters:{docs:{description:{story:"UUID type properties use `equals`, `notEquals`, `in`, `notIn` operators. Combine with a `rule` for format validation."}}},args:{filterProperties:[{key:`projectId`,propertyLabel:`Project ID`,type:`uuid`,rule:{message:`Must be a valid UUID.`,validate:e=>/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(e)}},{key:`domainId`,propertyLabel:`Domain ID`,type:`uuid`,defaultOperator:`notEquals`}],combinationMode:`AND`,value:{projectId:{equals:`a1b2c3d4-e5f6-7890-abcd-ef1234567890`}},onChange:P(`UUID filter changed`)}},Z={name:`Custom Input via renderInput`,parameters:{docs:{description:{story:"When `renderInput` is provided, the default AutoComplete is replaced with a custom control. The control stages a value via `onAddCondition(value, label?)` and the edit popover's Apply button commits it; feed the render prop's `value` back into the control so the staged pick stays visible. Useful for async selects (e.g., fetching options from an API)."}}},args:{filterProperties:[{key:`name`,propertyLabel:`Name`,type:`string`,defaultOperator:`iContains`},{key:`storageHost`,propertyLabel:`Storage Host`,type:`string`,defaultOperator:`equals`,renderInput:({onAddCondition:e,value:t,isDisabled:n})=>(0,Zt.jsx)(nt,{label:`Storage Host`,isLabelHidden:!0,placeholder:`Select storage host`,hasSearch:!1,options:Qt,isDisabled:n,value:Qt.find(e=>e.value===t)??null,onChange:t=>{e(t?.value)}})}],combinationMode:`AND`,onChange:P(`renderInput filter changed`)}},Q={name:`Scalar valueMode on string field`,parameters:{docs:{description:{story:`Demonstrates valueMode='scalar' on a non-boolean field. The filter emits { slugExact: 'my-slug' } without an operator, while tags still display using implicitOperator (default '=').`}}},args:{filterProperties:[{key:`slugExact`,propertyLabel:`Slug (scalar exact)`,type:`string`,valueMode:`scalar`,implicitOperator:`equals`},{key:`title`,propertyLabel:`Title`,type:`string`,defaultOperator:`iContains`},{key:`isPublished`,propertyLabel:`Published`,type:`boolean`}],combinationMode:`AND`,value:{AND:[{slugExact:`hello-world`},{isPublished:!0}]},onChange:P(`Scalar mode (string) filter changed`)}},en=[{label:`alice@example.com`,value:`owner-uuid-0001`},{label:`bob@example.com`,value:`owner-uuid-0002`},{label:`carol@example.com`,value:`owner-uuid-0003`}],$={name:`Custom input (onAddCondition)`,parameters:{docs:{description:{story:"A property whose input is a controlled `BAIComplexSelect` supplied via `renderInput`. Selecting an option calls `onAddCondition(value, label)`, which stages the value; the edit popover's Apply button commits it, serialized per `type: 'uuid'` → `{ owner: { id: { equals: <id> } } }`, while the token shows the label (email) instead of the opaque UUID. The render prop's `value` is fed back into the select so the staged pick stays visible."}}},args:{filterProperties:[{key:`owner.id`,propertyLabel:`Owner`,type:`uuid`,fixedOperator:`equals`,renderInput:({onAddCondition:e,value:t,isDisabled:n})=>(0,Zt.jsx)(nt,{label:`Owner`,isLabelHidden:!0,placeholder:`Select owner`,options:en,isDisabled:n,value:en.find(e=>e.value===t)??null,onChange:t=>{let n=t;e(n?.value,n?.label)}})}],combinationMode:`AND`,onChange:P(`custom input filter changed`)}},tn=[`Default`,`WithANDCombination`,`WithORCombination`,`WithNumberFilters`,`WithEnumFilters`,`ComplexFilter`,`WithValidation`,`WithAutocompleteOptions`,`EmptyState`,`LoadingState`,`ArtifactFilterExample`,`WithFixedOperator`,`ToggleCombinationMode`,`WithDateTimeFilters`,`WithDateTimePrefiltered`,`WithUUIDFilters`,`WithRenderInput`,`WithScalarValueModeOnString`,`WithCustomType`],F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
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
}`,...$.parameters?.docs?.source}}}})))()}nn();export{G as ArtifactFilterExample,B as ComplexFilter,F as Default,U as EmptyState,W as LoadingState,q as ToggleCombinationMode,I as WithANDCombination,H as WithAutocompleteOptions,$ as WithCustomType,J as WithDateTimeFilters,Y as WithDateTimePrefiltered,z as WithEnumFilters,K as WithFixedOperator,R as WithNumberFilters,L as WithORCombination,Z as WithRenderInput,Q as WithScalarValueModeOnString,X as WithUUIDFilters,V as WithValidation,tn as __namedExportsOrder,$t as default};