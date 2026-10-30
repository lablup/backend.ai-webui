import{a as e,n as t}from"./rolldown-runtime-sJBDdmOt.js";import{t as n}from"./react-DlPsW1c0.js";import{n as r,t as i}from"./isObject-Cu5W6UBH.js";import{n as a,t as o}from"./toString-DisgP18h.js";import{n as s,t as c}from"./isArray-BUM1roHa.js";import{c as ee,s as l}from"./_Map-BYqIjmlk.js";import{c as te,g as u,h as d,m as ne,p as f,s as p}from"./_getTag-D6cfTjJ8.js";import{b as m,c as re,g as h,h as g,i as ie,l as _,m as v,n as y,p as ae,r as oe,s as se,t as b,u as x,y as S}from"./_initCloneObject-BZFXKngF.js";import{m as C,p as w}from"./_Uint8Array-BSgh8wEY.js";import{n as ce,t as T}from"./_baseAssignValue-BWbtd6qj.js";import{a as le,o as ue}from"./_MapCache-BOt3iEV2.js";import{n as E,t as D}from"./_baseRest-Dt95zPGh.js";import{n as O,t as de}from"./_isIterateeCall-CT_YZE0h.js";import{a as k,c as A,i as j,o as fe,r as pe,s as me}from"./_charsEndIndex-C-rS9lrV.js";import{n as he,t as ge}from"./compact-C9OPbfhP.js";import{i as _e,r as ve}from"./_baseEach-B9SQ-K_E.js";import{n as ye,t as be}from"./keyBy-CtdSHXF8.js";import{m as xe,t as Se}from"./hooks-CqTIG_8a.js";import{n as Ce,t as we}from"./isArrayLikeObject-CGiXg4Zs.js";import{i as Te,n as Ee,r as De,t as Oe}from"./find-DAho-s_l.js";import{n as M,t as ke}from"./map-BLzs52H1.js";import{n as Ae,t as je}from"./includes-CyC0lXf3.js";import{n as Me,t as Ne}from"./isNumber-BkvUSshz.js";import{n as Pe,t as Fe}from"./split-DV0-Ibal.js";import{a as Ie,c as Le,i as Re,l as ze,n as Be,o as Ve,s as He,t as Ue,u as We}from"./BAIPowerSearchAdapters-XfofGqSO.js";import{n as Ge,t as Ke}from"./uniqBy-DrXjrck6.js";import{t as qe}from"./jsx-runtime-MKhVqBIO.js";import{n as Je,t as Ye}from"./useBAIi18n-DGn2iC2x.js";import{t as Xe}from"./dayjs.min-BHb7hAap.js";import{t as Ze}from"./compiler-runtime-DU4U6aph.js";import{Ct as Qe,g as $e,wt as et}from"./iframe-DjLA7WWq.js";import{n as tt,t as nt}from"./BAIComplexSelect-BHynnuNx.js";function rt(e){return D(function(t,n){var r=-1,i=n.length,a=i>1?n[i-1]:void 0,o=i>2?n[2]:void 0;for(a=e.length>3&&typeof a==`function`?(i--,a):void 0,o&&O(n[0],n[1],o)&&(a=i<3?void 0:a,i=1),t=Object(t);++r<i;){var s=n[r];s&&e(t,s,r,a)}return t})}function it(){return(it=t((()=>{E(),de()})))()}function at(e){return function(t){t=a(t);var n=k(t)?j(t):void 0,r=n?n[0]:t.charAt(0),i=n?me(n,1).join(``):t.slice(1);return r[e]()+i}}function ot(){return(ot=t((()=>{A(),fe(),pe(),o()})))()}var st;function ct(){return(ct=t((()=>{ot(),st=at(`toUpperCase`)})))()}function lt(e,t,n){(n!==void 0&&!le(e[t],n)||n===void 0&&!(t in e))&&T(e,t,n)}function ut(){return(ut=t((()=>{ce(),ue()})))()}function dt(e,t){if((t!==`constructor`||typeof e[t]!=`function`)&&t!=`__proto__`)return e[t]}function ft(){return(ft=t((()=>{})))()}function pt(e){return g(e,v(e))}function mt(){return(mt=t((()=>{h(),ae()})))()}function ht(e,t,n,i,a,o,c){var l=dt(e,n),d=dt(t,n),f=c.get(d);if(f)lt(e,n,f);else{var p=o?o(l,d,n+``,e,t,c):void 0,m=p===void 0;if(m){var re=s(d),h=!re&&ne(d),g=!re&&!h&&te(d);p=d,re||h||g?s(l)?p=l:Ce(l)?p=S(l):h?(m=!1,p=se(d,!0)):g?(m=!1,p=oe(d,!0)):p=[]:x(d)||u(d)?(p=l,u(l)?p=pt(l):(!r(l)||ee(l))&&(p=b(d))):m=!1}m&&(c.set(d,p),a(p,d,i,o,c),c.delete(d)),lt(e,n,p)}}function gt(){return(gt=t((()=>{ut(),re(),ie(),m(),y(),d(),c(),we(),f(),l(),i(),_(),p(),ft(),mt()})))()}function _t(e,t,n,i,a){e!==t&&ve(t,function(o,s){if(a||(a=new w),r(o))ht(e,t,s,n,_t,i,a);else{var c=i?i(dt(e,s),o,s+``,e,t,a):void 0;c===void 0&&(c=o),lt(e,s,c)}},v)}function vt(){return(vt=t((()=>{C(),ut(),_e(),gt(),i(),ae(),ft()})))()}var yt;function bt(){return(bt=t((()=>{vt(),it(),yt=rt(function(e,t,n){_t(e,t,n)})})))()}function xt(){return`filter-${Date.now()}-${Math.random().toString(36).substring(2,11)}`}function St(e,t){let n=e.split(`.`);if(n.some(e=>e===``||e===`__proto__`||e===`constructor`||e===`prototype`))return{};let r=t;for(let e=n.length-1;e>0;e--)r={[n[e]]:r};return{[n[0]]:r}}function Ct(e){let t=e.split(`.`),n=De(t,(e,n)=>n>0&&n<t.length-1&&Wt.has(e));return n<0?void 0:{parent:t.slice(0,n+1).join(`.`),leaf:t.slice(n+1).join(`.`)}}function wt(e,t,n=`AND`){if(e.length===0)return;let r=[],i=[];e.forEach(e=>{let a=t.find(t=>t.key===e.property),o;if(((a==null?void 0:a.valueMode)||((a==null?void 0:a.type)===`boolean`?`scalar`:`operator`))===`scalar`)o=(a==null?void 0:a.type)===`boolean`?e.value===!0||e.value===`true`:(a==null?void 0:a.type)===`number`?Number(e.value):e.value;else if(e.operator===`in`||e.operator===`notIn`){let t=Array.isArray(e.value)?e.value:e.value.split(`,`).map(e=>e.trim());o={[e.operator]:(a==null?void 0:a.type)===`number`?t.map(Number):t}}else{let t=e.value;(a==null?void 0:a.type)===`number`&&(t=Number(t)),o={[e.operator]:t}}let s=n===`AND`?Ct(e.property):void 0;if(!s){r.push({filter:St(e.property,o)});return}let c=Oe(i,e=>e.parent===s.parent&&!e.leaves.has(s.leaf));c||(c={parent:s.parent,leaves:new Map},i.push(c),r.push({row:c})),c.leaves.set(s.leaf,o)});let a=M(r,e=>`row`in e?St(e.row.parent,yt({},...Array.from(e.row.leaves,([e,t])=>St(e,t)))):e.filter);return a.length===1?a[0]:{[n]:a}}function Tt(e,t,n=``){let r=[];return Object.keys(e).forEach(i=>{if(i===`AND`||i===`OR`||i===`NOT`||i===`DISTINCT`)return;let a=n?`${n}.${i}`:i,o=e[i],s=t.find(e=>e.key===a);s?(s.valueMode||(s.type===`boolean`?`scalar`:`operator`))===`scalar`&&typeof o!=`object`?r.push({id:xt(),property:a,operator:s.implicitOperator||`equals`,value:String(o),propertyLabel:s.propertyLabel||a,type:s.type||`string`}):o&&typeof o==`object`&&Object.keys(o).forEach(e=>{let t=o[e];t!=null&&r.push({id:xt(),property:a,operator:e,value:Array.isArray(t)?t.join(`, `):String(t),propertyLabel:s.propertyLabel||a,type:s.type||`string`})}):o&&typeof o==`object`&&(Object.keys(o).some(e=>[`eq`,`ne`,`lt`,`le`,`gt`,`ge`,`contains`,`notContains`,`startsWith`,`endsWith`,`ilike`,`in`,`notIn`,`isNull`].includes(e))||r.push(...Tt(o,t,a)))}),r}function Et(e,t){if(!e)return[];let n=[];if(e.AND||e.OR){let r=e.AND||e.OR;return(Array.isArray(r)?r:[r]).forEach(e=>{n.push(...Et(e,t))}),n}return n.push(...Tt(e,t)),n}function Dt(e){return Gt(e)===`scalar`?[e.implicitOperator||`equals`]:e.fixedOperator?[e.fixedOperator]:e.operators||Bt[e.type||`string`]}function Ot(e){return Gt(e)===`scalar`?e.implicitOperator||`equals`:e.fixedOperator||e.defaultOperator||Vt[e.type]}function kt(e,t,n){if(n)return n;let r=Kt(e),i=N(e);if(je(Ht,t))return r&&i?{type:`enum_list`,values:Re(r)}:{type:`string_list`,searchSource:Ie(r),isArbitraryStringAllowed:!0};if(e.type===`datetime`)return{type:`date_absolute`};if(e.type===`number`)return{type:`float`};if(r&&i)return{type:`enum`,values:Re(r)};let a=Ie(r);return a?{type:`string`,searchSource:a,isArbitraryStringAllowed:!0}:{type:`string`}}function At(e,t){let n=e.value;if(je(Ht,e.operator)){let e=s(n)?M(n,a):ge(M(Pe(a(n),`,`),We));return t&&Kt(t)&&N(t)?{type:`enum_list`,value:e}:{type:`string_list`,value:e}}if((t==null?void 0:t.type)===`datetime`){let e=(0,Lt.default)(a(n));return{type:`date_absolute`,unixSeconds:e.isValid()?e.unix():(0,Lt.default)().unix()}}return(t==null?void 0:t.type)===`number`?{type:`float`,value:Number(n)}:t!=null&&t.renderInput?{type:`custom`,value:a(n)}:t&&Kt(t)&&N(t)?{type:`enum`,value:a(n)}:{type:`string`,value:a(n)}}function jt(e){switch(e.type){case`empty`:return``;case`date_absolute`:return Lt.default.unix(e.unixSeconds).toISOString();case`integer`:case`float`:return String(e.value);case`string_list`:case`enum_list`:return[...e.value];case`entity_list`:return M(e.value,e=>e.id);case`date_range`:return JSON.stringify(e.value);default:return a(e.value??``)}}function Mt(e,t){let n=ye(t,`key`);return M(Et(e,t),e=>({field:e.property,operator:e.operator,value:At(e,n[e.property])}))}function Nt(e,t,n=`AND`,r=!1,i){let a=ye(t,`key`),o=r?Ge([...e].reverse(),`field`).reverse():[...e],s=Me(i)&&o.length>i?i<=0?[]:o.slice(-i):o;return wt(M(s,e=>{let t=a[e.field];return{id:xt(),property:e.field,operator:e.operator,value:jt(e.value),propertyLabel:(t==null?void 0:t.propertyLabel)??e.field,type:(t==null?void 0:t.type)??`string`}}),t,n)}function Pt(e){return e.type===`string`&&!N(e)&&!e.renderInput}var Ft,It,Lt,Rt,zt,Bt,Vt,Ht,Ut,Wt,Gt,Kt,N,qt,Jt;function Yt(){return(Yt=t((()=>{Ft=Ze(),Se(),Ye(),Be(),Le(),It=e($e(),1),Lt=e(Xe(),1),Te(),Ee(),ke(),bt(),ct(),Ae(),c(),o(),he(),Fe(),ze(),be(),Ke(),Ne(),et(),Rt=n(),zt=qe(),Bt={string:[`iContains`,`iNotContains`,`iEquals`,`iNotEquals`,`iStartsWith`,`iNotStartsWith`,`iEndsWith`,`iNotEndsWith`],number:[`equals`,`notEquals`,`greaterThan`,`greaterThanOrEqual`,`lessThan`,`lessThanOrEqual`],boolean:[`equals`],enum:[`equals`,`notEquals`,`in`,`notIn`],uuid:[`equals`,`notEquals`,`in`,`notIn`],datetime:[`equals`,`notEquals`,`before`,`after`]},Vt={string:`iContains`,number:`equals`,boolean:`equals`,enum:`equals`,uuid:`equals`,datetime:`equals`},Ht=[`in`,`notIn`],Ut=[{label:`True`,value:`true`},{label:`False`,value:`false`}],Wt=new Set([`some`,`every`,`none`]),Gt=e=>(e==null?void 0:e.valueMode)||((e==null?void 0:e.type)===`boolean`?`scalar`:`operator`),Kt=e=>e.options??(e.type===`boolean`?Ut:void 0),N=e=>e.strictSelection??e.type===`boolean`,qt=(e,t)=>t(`comp:BAIGraphQLPropertyFilter.operator.${st(e)}`,{defaultValue:e}),Jt=e=>{"use memo";let t=(0,Ft.c)(60),{filterProperties:n,value:r,onChange:i,defaultValue:a,combinationMode:o,singleCondition:s,maxConditions:c,label:ee,placeholder:l,applyLabel:te,resultCount:u,contentSearchFieldKey:d,isDisabled:ne,size:f,style:p,className:m,loading:re,"data-testid":h}=e,g=o===void 0?`AND`:o,ie=s!==void 0&&s,{t:_}=Je(),v;t[0]!==a||t[1]!==i||t[2]!==r?(v={value:r,defaultValue:a,onChange:i},t[0]=a,t[1]=i,t[2]=r,t[3]=v):v=t[3];let[y,ae]=xe(v),oe;t[4]===Symbol.for(`react.memo_cache_sentinel`)?(oe={},t[4]=oe):oe=t[4];let se=(0,Rt.useRef)(oe),b;t[5]===Symbol.for(`react.memo_cache_sentinel`)?(b={recordLabel:(e,t,n)=>{se.current[`${e}::${t}`]=n},resolveLabel:(e,t)=>se.current[`${e}::${t}`]??t},t[5]=b):b=t[5];let x=Ve(b),S,C,w;if(t[6]!==d||t[7]!==n||t[8]!==x||t[9]!==_||t[10]!==y){var ce;let e=ye(n,`key`),r=Et(y,n),i;t[14]!==n||t[15]!==y?(i=Mt(y,n),t[14]=n,t[15]=y,t[16]=i):i=t[16],C=i;let a=d??((ce=Oe(n,Pt))==null?void 0:ce.key),o;if(t[17]!==n||t[18]!==x||t[19]!==_){let e;t[21]!==x||t[22]!==_?(e=e=>{let t=x.operatorValueFor(e.key,e.renderInput);return{key:e.key,label:e.propertyLabel,defaultOperator:Ot(e),operators:M(Dt(e),n=>({key:n,label:qt(n,_),value:kt(e,n,t)}))}},t[21]=x,t[22]=_,t[23]=e):e=t[23],o=M(n,e),t[17]=n,t[18]=x,t[19]=_,t[20]=o}else o=t[20];let s;t[24]!==a||t[25]!==o?(s={name:`bai-graphql-property-filter`,contentSearchFieldKey:a,fields:o},t[24]=a,t[25]=o,t[26]=s):s=t[26],S=s,w=Oe(M(r,t=>{var n;let r=(n=e[t.property])==null?void 0:n.rule;if(r)return r.validate(t.value)?void 0:r.message})),t[6]=d,t[7]=n,t[8]=x,t[9]=_,t[10]=y,t[11]=S,t[12]=C,t[13]=w}else S=t[11],C=t[12],w=t[13];let T=w,le;t[27]!==g||t[28]!==n||t[29]!==c||t[30]!==ae||t[31]!==ie?(le=e=>{ae(Nt(e,n,g,ie,c))},t[27]=g,t[28]=n,t[29]=c,t[30]=ae,t[31]=ie,t[32]=le):le=t[32];let ue=le,E;t[33]!==ee||t[34]!==_?(E=ee??_(`comp:BAIPropertyFilter.SearchLabel`),t[33]=ee,t[34]=_,t[35]=E):E=t[35];let D;t[36]!==l||t[37]!==_?(D=l??_(`comp:BAIPropertyFilter.PlaceHolder`),t[36]=l,t[37]=_,t[38]=D):D=t[38];let O;t[39]!==te||t[40]!==_?(O=te??_(`comp:BAIPropertyFilter.Apply`),t[39]=te,t[40]=_,t[41]=O):O=t[41];let de=ne||re,k;t[42]===m?k=t[43]:(k=(0,It.default)(`bai-power-search`,m),t[42]=m,t[43]=k);let A;t[44]===T?A=t[45]:(A=T?{type:`error`,message:T}:void 0,t[44]=T,t[45]=A);let j;return t[46]!==S||t[47]!==h||t[48]!==C||t[49]!==ue||t[50]!==u||t[51]!==f||t[52]!==p||t[53]!==O||t[54]!==de||t[55]!==k||t[56]!==A||t[57]!==E||t[58]!==D?(j=(0,zt.jsx)(He,{config:S,components:Ue,filters:C,startIcon:Qe,label:E,placeholder:D,popoverSaveButtonLabel:O,resultCount:u,isDisabled:de,size:f,style:p,className:k,"data-testid":h,status:A,onChange:ue}),t[46]=S,t[47]=h,t[48]=C,t[49]=ue,t[50]=u,t[51]=f,t[52]=p,t[53]=O,t[54]=de,t[55]=k,t[56]=A,t[57]=E,t[58]=D,t[59]=j):j=t[59],j}})))()}var Xt,Zt,Qt,$t,en,tn,nn,rn,an,on,sn,cn,ln,un,dn,fn,pn,mn,hn,gn,_n,vn,yn,bn,xn,Sn,Cn,wn,Tn,En,Dn,On,kn,An,jn,Mn,Nn,Pn,Fn,In,P,Ln,Rn,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q,zn,$,Bn;function Vn(){return(Vn=t((()=>{tt(),Yt(),Xt=n(),Zt=qe(),{action:P}=__STORYBOOK_MODULE_ACTIONS__,Ln=[{label:`local:volume1`,value:`local:volume1`},{label:`local:volume2`,value:`local:volume2`},{label:`nfs:data`,value:`nfs:data`}],Rn={title:`Filter/BAIGraphQLPropertyFilter`,component:Jt,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`
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
        `}},onChange:{description:`Callback when filter value changes`,table:{type:{summary:`(value: GraphQLFilter | undefined) => void`}}},loading:{control:{type:`boolean`},description:`Show loading state`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},combinationMode:{control:{type:`radio`},options:[`AND`,`OR`],description:`How to combine multiple filter conditions`,table:{type:{summary:`'AND' | 'OR'`},defaultValue:{summary:`AND`}}}},render:e=>{let[t,n]=(0,Xt.useState)(e.value);return(0,Zt.jsx)(Jt,{...e,value:t,onChange:t=>{var r;(r=e.onChange)==null||r.call(e,t),n(t)}})}},F={name:`Basic Usage`,parameters:{docs:{description:{story:`Basic GraphQL property filter with string and boolean properties. Try adding filters and see how they combine into a GraphQL filter object.`}}},args:{filterProperties:[{key:`name`,propertyLabel:`Name`,type:`string`,defaultOperator:`iContains`},{key:`description`,propertyLabel:`Description`,type:`string`},{key:`isActive`,propertyLabel:`Active Status`,type:`boolean`}],combinationMode:`AND`,onChange:P(`Filter changed`)}},I={name:`Multiple Filters with AND`,parameters:{docs:{description:{story:`Demonstrates filters combined with AND operator. All conditions must be satisfied for a match. This is useful when you need strict filtering.`}}},args:{filterProperties:[{key:`title`,propertyLabel:`Title`,type:`string`},{key:`priority`,propertyLabel:`Priority`,type:`enum`,options:[{label:`High`,value:`HIGH`},{label:`Medium`,value:`MEDIUM`},{label:`Low`,value:`LOW`}]},{key:`isUrgent`,propertyLabel:`Urgent`,type:`boolean`}],combinationMode:`AND`,value:{AND:[{title:{iContains:`critical`}},{priority:{equals:`HIGH`}},{isUrgent:!0}]},onChange:P(`AND Filter changed`)}},L={name:`Multiple Filters with OR`,parameters:{docs:{description:{story:`Demonstrates filters combined with OR operator. Any condition can match for a result. This is useful for more flexible, inclusive filtering.`}}},args:{filterProperties:[{key:`status`,propertyLabel:`Status`,type:`enum`,options:[{label:`Urgent`,value:`URGENT`},{label:`High Priority`,value:`HIGH_PRIORITY`},{label:`Normal`,value:`NORMAL`}]},{key:`assignee`,propertyLabel:`Assignee`,type:`string`},{key:`dueToday`,propertyLabel:`Due Today`,type:`boolean`}],combinationMode:`OR`,value:{OR:[{status:{equals:`URGENT`}},{assignee:{iContains:`john`}},{dueToday:!0}]},onChange:P(`OR Filter changed`)}},R={name:`Number Filters with Comparisons`,parameters:{docs:{description:{story:`Shows numeric filtering with comparison operators like greater than, less than, etc. Useful for filtering by quantities, scores, or metrics.`}}},args:{filterProperties:[{key:`score`,propertyLabel:`Score`,type:`number`,operators:[`equals`,`notEquals`,`greaterThan`,`greaterThanOrEqual`,`lessThan`,`lessThanOrEqual`]},{key:`quantity`,propertyLabel:`Quantity`,type:`number`},{key:`price`,propertyLabel:`Price`,type:`number`,operators:[`greaterThan`,`lessThan`,`equals`],defaultOperator:`greaterThan`}],combinationMode:`AND`,value:{AND:[{score:{greaterThanOrEqual:80}},{quantity:{lessThan:100}}]},onChange:P(`Number filter changed`)}},z={name:`Enum Filters with Multiple Selection`,parameters:{docs:{description:{story:`Demonstrates enum type filtering with in/notIn operators for multiple value selection. Perfect for status fields, categories, or any predefined set of values.`}}},args:{filterProperties:[{key:`status`,propertyLabel:`Status`,type:`enum`,options:[{label:`Active`,value:`ACTIVE`},{label:`Inactive`,value:`INACTIVE`},{label:`Pending`,value:`PENDING`},{label:`Archived`,value:`ARCHIVED`}],operators:[`equals`,`notEquals`,`in`,`notIn`],strictSelection:!0},{key:`category`,propertyLabel:`Category`,type:`enum`,options:[{label:`Frontend`,value:`FRONTEND`},{label:`Backend`,value:`BACKEND`},{label:`Database`,value:`DATABASE`},{label:`DevOps`,value:`DEVOPS`}],defaultOperator:`in`}],combinationMode:`AND`,value:{AND:[{status:{in:[`ACTIVE`,`PENDING`]}},{category:{notEquals:`DATABASE`}}]},onChange:P(`Enum filter changed`)}},B={name:`Complex Combined Filter`,parameters:{docs:{description:{story:`Example showing multiple filters with different property types combined with the selected mode (AND/OR) for comprehensive filtering.`}}},args:{filterProperties:[{key:`name`,propertyLabel:`Name`,type:`string`},{key:`email`,propertyLabel:`Email`,type:`string`,operators:[`iContains`,`iStartsWith`,`iEndsWith`]},{key:`role`,propertyLabel:`Role`,type:`enum`,options:[{label:`Admin`,value:`ADMIN`},{label:`User`,value:`USER`},{label:`Guest`,value:`GUEST`}]},{key:`credits`,propertyLabel:`Credits`,type:`number`},{key:`isVerified`,propertyLabel:`Verified`,type:`boolean`}],combinationMode:`AND`,value:{AND:[{name:{iContains:`john`}},{email:{iEndsWith:`@company.com`}},{role:{equals:`USER`}},{credits:{greaterThanOrEqual:100}},{isVerified:!0}]},onChange:P(`Complex filter changed`)}},V={name:`Custom Validation Rules`,parameters:{docs:{description:{story:`Property filter with custom validation rules for data integrity. Shows email validation and strict selection enforcement.`}}},args:{filterProperties:[{key:`email`,propertyLabel:`Email Address`,type:`string`,rule:{message:`Please enter a valid email address`,validate:e=>/\S+@\S+\.\S+/.test(e)}},{key:`phone`,propertyLabel:`Phone Number`,type:`string`,rule:{message:`Phone number must be 10 digits`,validate:e=>/^\d{10}$/.test(e.replace(/\D/g,``))}},{key:`department`,propertyLabel:`Department`,type:`enum`,options:[{label:`Engineering`,value:`ENGINEERING`},{label:`Marketing`,value:`MARKETING`},{label:`Sales`,value:`SALES`},{label:`HR`,value:`HR`}],strictSelection:!0}],combinationMode:`AND`,onChange:P(`Validated filter changed`)}},H={name:`Autocomplete Suggestions`,parameters:{docs:{description:{story:`Filter with predefined autocomplete options for improved user experience and data consistency.`}}},args:{filterProperties:[{key:`country`,propertyLabel:`Country`,type:`string`,options:[{label:`United States`,value:`US`},{label:`United Kingdom`,value:`UK`},{label:`Canada`,value:`CA`},{label:`Australia`,value:`AU`},{label:`Germany`,value:`DE`},{label:`France`,value:`FR`}]},{key:`language`,propertyLabel:`Language`,type:`string`,options:[{label:`English`,value:`en`},{label:`Spanish`,value:`es`},{label:`French`,value:`fr`},{label:`German`,value:`de`},{label:`Chinese`,value:`zh`},{label:`Japanese`,value:`ja`}],defaultOperator:`in`}],combinationMode:`OR`,value:{OR:[{country:{equals:`US`}},{language:{in:[`en`,`es`]}}]},onChange:P(`Autocomplete filter changed`)}},U={parameters:{docs:{description:{story:`GraphQL property filter in its initial state with no applied filters. Start adding filters to see how they combine.`}}},args:{filterProperties:[{key:`title`,propertyLabel:`Title`,type:`string`},{key:`isPublished`,propertyLabel:`Published`,type:`boolean`},{key:`viewCount`,propertyLabel:`View Count`,type:`number`}],combinationMode:`AND`,onChange:P(`Filter changed from empty`)}},W={parameters:{docs:{description:{story:`Filter component in loading state, typically shown while fetching schema information or processing complex queries.`}}},args:{filterProperties:[{key:`name`,propertyLabel:`Name`,type:`string`}],loading:!0,combinationMode:`AND`,onChange:P(`Filter changed`)}},G={name:`Artifact Filter (Real-world Example)`,parameters:{docs:{description:{story:`Real-world example matching the ArtifactFilter GraphQL input type with name and status filtering capabilities. Shows how the component would be used in production.`}}},args:{filterProperties:[{key:`name`,propertyLabel:`Artifact Name`,type:`string`,operators:[`iContains`,`iEquals`,`iNotEquals`,`iStartsWith`,`iEndsWith`],defaultOperator:`iContains`},{key:`status`,propertyLabel:`Artifact Status`,type:`enum`,options:[{label:`Draft`,value:`DRAFT`},{label:`Published`,value:`PUBLISHED`},{label:`Archived`,value:`ARCHIVED`},{label:`Deleted`,value:`DELETED`}],operators:[`equals`,`in`],strictSelection:!0}],combinationMode:`AND`,value:{AND:[{name:{iContains:`model`}},{status:{in:[`PUBLISHED`,`DRAFT`]}}]},onChange:P(`Artifact filter changed`)}},K={name:`Fixed Operator (No Selector)`,parameters:{docs:{description:{story:`Demonstrates properties with fixed operators where the operator selector is hidden. Useful when you want to enforce a specific operator for certain fields.`}}},args:{filterProperties:[{key:`search`,propertyLabel:`Search (always contains)`,type:`string`,fixedOperator:`iContains`},{key:`username`,propertyLabel:`Username (always equals)`,type:`string`,fixedOperator:`iEquals`},{key:`tags`,propertyLabel:`Tags (always in)`,type:`string`,fixedOperator:`in`},{key:`score`,propertyLabel:`Score (flexible)`,type:`number`,operators:[`equals`,`greaterThan`,`greaterThanOrEqual`,`lessThan`,`lessThanOrEqual`]}],combinationMode:`AND`,onChange:P(`Fixed operator filter changed`)}},q={name:`Toggle Between AND/OR`,parameters:{docs:{description:{story:`Example showing how switching between AND and OR combination modes affects the filter logic. Try toggling the combination mode to see how the same conditions behave differently.`}}},args:{filterProperties:[{key:`type`,propertyLabel:`Type`,type:`enum`,options:[{label:`Feature`,value:`FEATURE`},{label:`Bug`,value:`BUG`},{label:`Task`,value:`TASK`}]},{key:`priority`,propertyLabel:`Priority`,type:`enum`,options:[{label:`Critical`,value:`CRITICAL`},{label:`High`,value:`HIGH`},{label:`Medium`,value:`MEDIUM`},{label:`Low`,value:`LOW`}]},{key:`assignedToMe`,propertyLabel:`Assigned to Me`,type:`boolean`}],combinationMode:`AND`,onChange:P(`Filter changed with mode toggle`)}},J={name:`DateTime Filters`,parameters:{docs:{description:{story:`Demonstrates datetime filtering with a DatePicker UI. When a datetime property is selected, a date picker with time selection is rendered instead of a text input. Useful for filtering by created_at, updated_at, or other timestamp fields.`}}},args:{filterProperties:[{key:`created_at`,propertyLabel:`Created At`,type:`datetime`},{key:`updated_at`,propertyLabel:`Updated At`,type:`datetime`,defaultOperator:`after`},{key:`name`,propertyLabel:`Name`,type:`string`,defaultOperator:`iContains`},{key:`isActive`,propertyLabel:`Active Status`,type:`boolean`}],combinationMode:`AND`,onChange:P(`DateTime filter changed`)}},Y={name:`DateTime with Pre-applied Filters`,parameters:{docs:{description:{story:`DateTime filters with pre-applied conditions showing how datetime values are displayed in filter tags with a human-readable format (YYYY-MM-DD HH:mm).`}}},args:{filterProperties:[{key:`created_at`,propertyLabel:`Created At`,type:`datetime`},{key:`updated_at`,propertyLabel:`Updated At`,type:`datetime`},{key:`name`,propertyLabel:`Name`,type:`string`}],combinationMode:`AND`,value:{AND:[{created_at:{after:`2025-01-01T00:00:00.000Z`}},{updated_at:{before:`2025-12-31T23:59:59.000Z`}},{name:{iContains:`test`}}]},onChange:P(`DateTime pre-filtered changed`)}},X={name:`UUID Filters`,parameters:{docs:{description:{story:"UUID type properties use `equals`, `notEquals`, `in`, `notIn` operators. Combine with a `rule` for format validation."}}},args:{filterProperties:[{key:`projectId`,propertyLabel:`Project ID`,type:`uuid`,rule:{message:`Must be a valid UUID.`,validate:e=>/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(e)}},{key:`domainId`,propertyLabel:`Domain ID`,type:`uuid`,defaultOperator:`notEquals`}],combinationMode:`AND`,value:{projectId:{equals:`a1b2c3d4-e5f6-7890-abcd-ef1234567890`}},onChange:P(`UUID filter changed`)}},Z={name:`Custom Input via renderInput`,parameters:{docs:{description:{story:"When `renderInput` is provided, the default AutoComplete is replaced with a custom control. The control stages a value via `onAddCondition(value, label?)` and the edit popover's Apply button commits it; feed the render prop's `value` back into the control so the staged pick stays visible. Useful for async selects (e.g., fetching options from an API)."}}},args:{filterProperties:[{key:`name`,propertyLabel:`Name`,type:`string`,defaultOperator:`iContains`},{key:`storageHost`,propertyLabel:`Storage Host`,type:`string`,defaultOperator:`equals`,renderInput:({onAddCondition:e,value:t,isDisabled:n})=>(0,Zt.jsx)(nt,{label:`Storage Host`,isLabelHidden:!0,placeholder:`Select storage host`,hasSearch:!1,options:Ln,isDisabled:n,value:Ln.find(e=>e.value===t)??null,onChange:t=>{let n=t;e(n==null?void 0:n.value)}})}],combinationMode:`AND`,onChange:P(`renderInput filter changed`)}},Q={name:`Scalar valueMode on string field`,parameters:{docs:{description:{story:`Demonstrates valueMode='scalar' on a non-boolean field. The filter emits { slugExact: 'my-slug' } without an operator, while tags still display using implicitOperator (default '=').`}}},args:{filterProperties:[{key:`slugExact`,propertyLabel:`Slug (scalar exact)`,type:`string`,valueMode:`scalar`,implicitOperator:`equals`},{key:`title`,propertyLabel:`Title`,type:`string`,defaultOperator:`iContains`},{key:`isPublished`,propertyLabel:`Published`,type:`boolean`}],combinationMode:`AND`,value:{AND:[{slugExact:`hello-world`},{isPublished:!0}]},onChange:P(`Scalar mode (string) filter changed`)}},zn=[{label:`alice@example.com`,value:`owner-uuid-0001`},{label:`bob@example.com`,value:`owner-uuid-0002`},{label:`carol@example.com`,value:`owner-uuid-0003`}],$={name:`Custom input (onAddCondition)`,parameters:{docs:{description:{story:"A property whose input is a controlled `BAIComplexSelect` supplied via `renderInput`. Selecting an option calls `onAddCondition(value, label)`, which stages the value; the edit popover's Apply button commits it, serialized per `type: 'uuid'` → `{ owner: { id: { equals: <id> } } }`, while the token shows the label (email) instead of the opaque UUID. The render prop's `value` is fed back into the select so the staged pick stays visible."}}},args:{filterProperties:[{key:`owner.id`,propertyLabel:`Owner`,type:`uuid`,fixedOperator:`equals`,renderInput:({onAddCondition:e,value:t,isDisabled:n})=>(0,Zt.jsx)(nt,{label:`Owner`,isLabelHidden:!0,placeholder:`Select owner`,options:zn,isDisabled:n,value:zn.find(e=>e.value===t)??null,onChange:t=>{let n=t;e(n==null?void 0:n.value,n==null?void 0:n.label)}})}],combinationMode:`AND`,onChange:P(`custom input filter changed`)}},F.parameters={...F.parameters,docs:{...(Qt=F.parameters)==null?void 0:Qt.docs,source:{originalSource:`{
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
}`,...($t=F.parameters)==null||($t=$t.docs)==null?void 0:$t.source}}},I.parameters={...I.parameters,docs:{...(en=I.parameters)==null?void 0:en.docs,source:{originalSource:`{
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
}`,...(tn=I.parameters)==null||(tn=tn.docs)==null?void 0:tn.source}}},L.parameters={...L.parameters,docs:{...(nn=L.parameters)==null?void 0:nn.docs,source:{originalSource:`{
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
}`,...(rn=L.parameters)==null||(rn=rn.docs)==null?void 0:rn.source}}},R.parameters={...R.parameters,docs:{...(an=R.parameters)==null?void 0:an.docs,source:{originalSource:`{
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
}`,...(on=R.parameters)==null||(on=on.docs)==null?void 0:on.source}}},z.parameters={...z.parameters,docs:{...(sn=z.parameters)==null?void 0:sn.docs,source:{originalSource:`{
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
}`,...(cn=z.parameters)==null||(cn=cn.docs)==null?void 0:cn.source}}},B.parameters={...B.parameters,docs:{...(ln=B.parameters)==null?void 0:ln.docs,source:{originalSource:`{
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
}`,...(un=B.parameters)==null||(un=un.docs)==null?void 0:un.source}}},V.parameters={...V.parameters,docs:{...(dn=V.parameters)==null?void 0:dn.docs,source:{originalSource:`{
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
}`,...(fn=V.parameters)==null||(fn=fn.docs)==null?void 0:fn.source}}},H.parameters={...H.parameters,docs:{...(pn=H.parameters)==null?void 0:pn.docs,source:{originalSource:`{
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
}`,...(mn=H.parameters)==null||(mn=mn.docs)==null?void 0:mn.source}}},U.parameters={...U.parameters,docs:{...(hn=U.parameters)==null?void 0:hn.docs,source:{originalSource:`{
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
}`,...(gn=U.parameters)==null||(gn=gn.docs)==null?void 0:gn.source}}},W.parameters={...W.parameters,docs:{...(_n=W.parameters)==null?void 0:_n.docs,source:{originalSource:`{
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
}`,...(vn=W.parameters)==null||(vn=vn.docs)==null?void 0:vn.source}}},G.parameters={...G.parameters,docs:{...(yn=G.parameters)==null?void 0:yn.docs,source:{originalSource:`{
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
}`,...(bn=G.parameters)==null||(bn=bn.docs)==null?void 0:bn.source}}},K.parameters={...K.parameters,docs:{...(xn=K.parameters)==null?void 0:xn.docs,source:{originalSource:`{
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
}`,...(Sn=K.parameters)==null||(Sn=Sn.docs)==null?void 0:Sn.source}}},q.parameters={...q.parameters,docs:{...(Cn=q.parameters)==null?void 0:Cn.docs,source:{originalSource:`{
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
}`,...(wn=q.parameters)==null||(wn=wn.docs)==null?void 0:wn.source}}},J.parameters={...J.parameters,docs:{...(Tn=J.parameters)==null?void 0:Tn.docs,source:{originalSource:`{
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
}`,...(En=J.parameters)==null||(En=En.docs)==null?void 0:En.source}}},Y.parameters={...Y.parameters,docs:{...(Dn=Y.parameters)==null?void 0:Dn.docs,source:{originalSource:`{
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
}`,...(On=Y.parameters)==null||(On=On.docs)==null?void 0:On.source}}},X.parameters={...X.parameters,docs:{...(kn=X.parameters)==null?void 0:kn.docs,source:{originalSource:`{
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
}`,...(An=X.parameters)==null||(An=An.docs)==null?void 0:An.source}}},Z.parameters={...Z.parameters,docs:{...(jn=Z.parameters)==null?void 0:jn.docs,source:{originalSource:`{
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
}`,...(Mn=Z.parameters)==null||(Mn=Mn.docs)==null?void 0:Mn.source}}},Q.parameters={...Q.parameters,docs:{...(Nn=Q.parameters)==null?void 0:Nn.docs,source:{originalSource:`{
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
}`,...(Pn=Q.parameters)==null||(Pn=Pn.docs)==null?void 0:Pn.source}}},$.parameters={...$.parameters,docs:{...(Fn=$.parameters)==null?void 0:Fn.docs,source:{originalSource:`{
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
}`,...(In=$.parameters)==null||(In=In.docs)==null?void 0:In.source}}},Bn=[`Default`,`WithANDCombination`,`WithORCombination`,`WithNumberFilters`,`WithEnumFilters`,`ComplexFilter`,`WithValidation`,`WithAutocompleteOptions`,`EmptyState`,`LoadingState`,`ArtifactFilterExample`,`WithFixedOperator`,`ToggleCombinationMode`,`WithDateTimeFilters`,`WithDateTimePrefiltered`,`WithUUIDFilters`,`WithRenderInput`,`WithScalarValueModeOnString`,`WithCustomType`]})))()}Vn();export{G as ArtifactFilterExample,B as ComplexFilter,F as Default,U as EmptyState,W as LoadingState,q as ToggleCombinationMode,I as WithANDCombination,H as WithAutocompleteOptions,$ as WithCustomType,J as WithDateTimeFilters,Y as WithDateTimePrefiltered,z as WithEnumFilters,K as WithFixedOperator,R as WithNumberFilters,L as WithORCombination,Z as WithRenderInput,Q as WithScalarValueModeOnString,X as WithUUIDFilters,V as WithValidation,Bn as __namedExportsOrder,Rn as default};