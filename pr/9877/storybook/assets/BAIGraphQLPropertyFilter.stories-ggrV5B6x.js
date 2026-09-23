import{i as Mt,c as jt,a as _t,r as Ut,az as Qt,j as se,aL as Yt,aM as ve}from"./iframe-vDuWVe71.js";import{B as Rt}from"./BAIComplexSelect-DL3PQwK5.js";import{u as Kt,P as $t,b as zt,c as Zt,t as Ee,a as Oe}from"./BAIPowerSearchAdapters-D4Zpul4I.js";import{u as Jt}from"./useControllableValue-Bu3nD7PW.js";import{k as Se}from"./toLower-Di0qijSP.js";import{f as Te}from"./find-CrE1jXHZ.js";import{m as h}from"./map-8hhHm_E4.js";import{v as Xt,i as xt}from"./includes-CteyiLxE.js";import{a as en,b as tn}from"./_baseEach-DCnacDOX.js";import{t as y}from"./toString-B2dX1IEX.js";import{c as nn}from"./compact-CU4PNV0P.js";import{s as an}from"./split-Dgg1AXD5.js";import{h as rn,s as on,c as sn}from"./_charsEndIndex-BHSW-HpW.js";import"./preload-helper-Dp1pzeXC.js";import"./useIndicator-MQa_E48R.js";import"./isRenderable-BUV0eL6r.js";import"./clamp-CO5LXicc.js";import"./_baseClamp-DVUOCJN_.js";import"./toFinite-Dm9-9Y4y.js";import"./_trimmedEndIndex-DuQxD0U0.js";import"./isSymbol-DUXQgt3q.js";import"./filter-BqRW4-Ti.js";import"./_baseSlice-F8doVSIJ.js";import"./toInteger-B62j107J.js";import"./InputClearButton-RoKlFSNJ.js";import"./useResolvedRequired-BRqOIbKf.js";import"./useDevWarning-D8iswns4.js";import"./usePopover-BfFE0_LH.js";import"./rtlStyles-T4i24HtE.js";import"./composeEventHandlers-BolWE7qY.js";import"./Divider-Da7XClfm.js";import"./isNumber-CUYrawf3.js";import"./some-B5Gn6FJl.js";import"./Token-BqvzZll7.js";import"./SelectorOption-DnsUjI1c.js";import"./Item-CczNeMV-.js";import"./_baseIndexOf-Be9UPhX8.js";import"./_baseFindIndex-Cj99RmFE.js";import"./characters-DWaYg7k3.js";import"./NumberInput-DULh6NXk.js";import"./useInputStatusIcon-DLu7XJI-.js";import"./InputGroupContext-CRpKQIkc.js";import"./Selector-CNxcq5ea.js";import"./useFocusReturnVisibility-Cld-AYw0.js";import"./isRtlElement-B2-7SF8s.js";import"./BottomSheet-z217Acqd.js";import"./TextInput-B3YT1m3f.js";import"./VStack-CNDFtF9D.js";import"./isEmpty-DMsrg_yz.js";import"./isNil-CHIgUVhi.js";import"./isString-CDbpezNy.js";import"./_baseAssignValue-fk76MpWP.js";import"./_defineProperty-6u-3_Y_B.js";import"./get-C4L0E3I4.js";import"./_baseGet-CcHaFGpT.js";import"./identity-DKeuBCMA.js";import"./_isIterateeCall-COiyK1lQ.js";function ln(t){return function(e){e=y(e);var n=rn(e)?on(e):void 0,r=n?n[0]:e.charAt(0),a=n?sn(n,1).join(""):e.slice(1);return r[t]()+a}}var pn=ln("toUpperCase");function un(t,e,n,r){var a=-1,o=t==null?0:t.length;for(r&&o&&(n=t[++a]);++a<o;)n=e(n,t[a],a,t);return n}function cn(t,e,n,r,a){return a(t,function(o,s,l){n=r?(r=!1,o):e(n,o,s,l)}),n}function dn(t,e,n){var r=Mt(t)?un:cn,a=arguments.length<3;return r(t,en(e),n,a,tn)}const mn={string:["iContains","iNotContains","iEquals","iNotEquals","iStartsWith","iNotStartsWith","iEndsWith","iNotEndsWith"],number:["equals","notEquals","greaterThan","greaterThanOrEqual","lessThan","lessThanOrEqual"],boolean:["equals"],enum:["equals","notEquals","in","notIn"],uuid:["equals","notEquals","in","notIn"],datetime:["equals","notEquals","before","after"]},yn={string:"iContains",number:"equals",boolean:"equals",enum:"equals",uuid:"equals",datetime:"equals"},Gt=["in","notIn"],hn=[{label:"True",value:"true"},{label:"False",value:"false"}];function Ae(){return`filter-${Date.now()}-${Math.random().toString(36).substring(2,11)}`}function bn(t,e){const n=t.split(".");if(n.some(a=>a===""||a==="__proto__"||a==="constructor"||a==="prototype"))return{};let r=e;for(let a=n.length-1;a>0;a--)r={[n[a]]:r};return{[n[0]]:r}}function gn(t,e,n="AND"){if(t.length===0)return;const r=[];return t.forEach(a=>{const o=e.find(i=>i.key===a.property);let s;if(((o==null?void 0:o.valueMode)||((o==null?void 0:o.type)==="boolean"?"scalar":"operator"))==="scalar")(o==null?void 0:o.type)==="boolean"?s=a.value===!0||a.value==="true":(o==null?void 0:o.type)==="number"?s=Number(a.value):s=a.value;else if(a.operator==="in"||a.operator==="notIn"){const i=Array.isArray(a.value)?a.value:a.value.split(",").map(m=>m.trim());s={[a.operator]:(o==null?void 0:o.type)==="number"?i.map(Number):i}}else{let i=a.value;(o==null?void 0:o.type)==="number"&&(i=Number(i)),s={[a.operator]:i}}r.push(bn(a.property,s))}),r.length===1?r[0]:{[n]:r}}function Ht(t,e,n=""){const r=[];return Object.keys(t).forEach(a=>{if(a==="AND"||a==="OR"||a==="NOT"||a==="DISTINCT")return;const o=n?`${n}.${a}`:a,s=t[a],l=e.find(i=>i.key===o);l?(l.valueMode||(l.type==="boolean"?"scalar":"operator"))==="scalar"&&typeof s!="object"?r.push({id:Ae(),property:o,operator:l.implicitOperator||"equals",value:String(s),propertyLabel:l.propertyLabel||o,type:l.type||"string"}):s&&typeof s=="object"&&Object.keys(s).forEach(m=>{const c=s[m];c!=null&&r.push({id:Ae(),property:o,operator:m,value:Array.isArray(c)?c.join(", "):String(c),propertyLabel:l.propertyLabel||o,type:l.type||"string"})}):s&&typeof s=="object"&&(Object.keys(s).some(c=>["eq","ne","lt","le","gt","ge","contains","notContains","startsWith","endsWith","ilike","in","notIn","isNull"].includes(c))||r.push(...Ht(s,e,o)))}),r}function Ce(t,e){if(!t)return[];const n=[];if(t.AND||t.OR){const r=t.AND||t.OR;return(Array.isArray(r)?r:[r]).forEach(o=>{n.push(...Ce(o,e))}),n}return n.push(...Ht(t,e)),n}const Vt=t=>(t==null?void 0:t.valueMode)||((t==null?void 0:t.type)==="boolean"?"scalar":"operator"),De=t=>t.options??(t.type==="boolean"?hn:void 0),ie=t=>t.strictSelection??t.type==="boolean";function fn(t){return Vt(t)==="scalar"?[t.implicitOperator||"equals"]:t.fixedOperator?[t.fixedOperator]:t.operators||mn[t.type||"string"]}function vn(t){return Vt(t)==="scalar"?t.implicitOperator||"equals":t.fixedOperator||t.defaultOperator||yn[t.type]}const An=(t,e)=>e(`comp:BAIGraphQLPropertyFilter.operator.${pn(t)}`,{defaultValue:t});function Dn(t,e,n){if(n)return n;const r=De(t),a=ie(t);if(xt(Gt,e))return r&&a?{type:"enum_list",values:Ee(r)}:{type:"string_list",searchSource:Oe(r),isArbitraryStringAllowed:!0};if(t.type==="datetime")return{type:"date_absolute"};if(t.type==="number")return{type:"float"};if(r&&a)return{type:"enum",values:Ee(r)};const o=Oe(r);return o?{type:"string",searchSource:o,isArbitraryStringAllowed:!0}:{type:"string"}}function Sn(t,e){const n=t.value;if(xt(Gt,t.operator)){const r=Mt(n)?h(n,y):nn(h(an(y(n),","),Zt));return e&&De(e)&&ie(e)?{type:"enum_list",value:r}:{type:"string_list",value:r}}if((e==null?void 0:e.type)==="datetime"){const r=ve(y(n));return{type:"date_absolute",unixSeconds:r.isValid()?r.unix():ve().unix()}}return(e==null?void 0:e.type)==="number"?{type:"float",value:Number(n)}:e!=null&&e.renderInput?{type:"custom",value:y(n)}:e&&De(e)&&ie(e)?{type:"enum",value:y(n)}:{type:"string",value:y(n)}}function Cn(t){switch(t.type){case"empty":return"";case"date_absolute":return ve.unix(t.unixSeconds).toISOString();case"integer":case"float":return String(t.value);case"string_list":case"enum_list":return[...t.value];case"entity_list":return h(t.value,e=>e.id);case"date_range":return JSON.stringify(t.value);default:return y(t.value??"")}}function Ln(t,e){const n=Se(e,"key");return h(Ce(t,e),r=>({field:r.property,operator:r.operator,value:Sn(r,n[r.property])}))}function wn(t,e,n="AND",r=!1){const a=Se(e,"key"),o=r?Xt(dn(t,(l,i)=>({...l,[i.field]:i}),{})):[...t],s=h(o,l=>{const i=a[l.field];return{id:Ae(),property:l.field,operator:l.operator,value:Cn(l.value),propertyLabel:(i==null?void 0:i.propertyLabel)??l.field,type:(i==null?void 0:i.type)??"string"}});return gn(s,e,n)}const Ne=t=>{"use memo";var we;const e=jt.c(62),{filterProperties:n,value:r,onChange:a,defaultValue:o,combinationMode:s,singleCondition:l,label:i,placeholder:m,applyLabel:c,resultCount:le,contentSearchFieldKey:I,isDisabled:Wt,size:pe,style:ue,className:ce,loading:Bt,"data-testid":de}=t,me=s===void 0?"AND":s,ye=l===void 0?!1:l,{t:u}=_t();let P;e[0]!==o||e[1]!==a||e[2]!==r?(P={value:r,defaultValue:o,onChange:a},e[0]=o,e[1]=a,e[2]=r,e[3]=P):P=e[3];const[v,he]=Jt(P);let F;e[4]===Symbol.for("react.memo_cache_sentinel")?(F={},e[4]=F):F=e[4];const Le=Ut.useRef(F);let q;e[5]===Symbol.for("react.memo_cache_sentinel")?(q={recordLabel:(g,O,T)=>{Le.current[`${g}::${O}`]=T},resolveLabel:(g,O)=>Le.current[`${g}::${O}`]??O},e[5]=q):q=e[5];const b=Kt(q);let A,D,M;if(e[6]!==I||e[7]!==n||e[8]!==b||e[9]!==u||e[10]!==v){const g=Se(n,"key"),O=Ce(v,n);let T;e[14]!==n||e[15]!==v?(T=Ln(v,n),e[14]=n,e[15]=v,e[16]=T):T=e[16],D=T;let N;e[17]!==I||e[18]!==n?(N=I??((we=Te(n,En))==null?void 0:we.key),e[17]=I,e[18]=n,e[19]=N):N=e[19];let k;if(e[20]!==n||e[21]!==b||e[22]!==u){let f;e[24]!==b||e[25]!==u?(f=d=>{const H=b.operatorValueFor(d.key,d.renderInput);return{key:d.key,label:d.propertyLabel,defaultOperator:vn(d),operators:h(fn(d),fe=>({key:fe,label:An(fe,u),value:Dn(d,fe,H)}))}},e[24]=b,e[25]=u,e[26]=f):f=e[26],k=h(n,f),e[20]=n,e[21]=b,e[22]=u,e[23]=k}else k=e[23];let G;e[27]!==N||e[28]!==k?(G={name:"bai-graphql-property-filter",contentSearchFieldKey:N,fields:k},e[27]=N,e[28]=k,e[29]=G):G=e[29],A=G,M=Te(h(O,f=>{var H;const d=(H=g[f.property])==null?void 0:H.rule;if(d)return d.validate(f.value)?void 0:d.message})),e[6]=I,e[7]=n,e[8]=b,e[9]=u,e[10]=v,e[11]=A,e[12]=D,e[13]=M}else A=e[11],D=e[12],M=e[13];const U=M;let R;e[30]!==me||e[31]!==n||e[32]!==he||e[33]!==ye?(R=g=>{he(wn(g,n,me,ye))},e[30]=me,e[31]=n,e[32]=he,e[33]=ye,e[34]=R):R=e[34];const be=R;let S;e[35]!==i||e[36]!==u?(S=i??u("comp:BAIPropertyFilter.SearchLabel"),e[35]=i,e[36]=u,e[37]=S):S=e[37];let C;e[38]!==m||e[39]!==u?(C=m??u("comp:BAIPropertyFilter.PlaceHolder"),e[38]=m,e[39]=u,e[40]=C):C=e[40];let L;e[41]!==c||e[42]!==u?(L=c??u("comp:BAIPropertyFilter.Apply"),e[41]=c,e[42]=u,e[43]=L):L=e[43];const ge=Wt||Bt;let w;e[44]!==ce?(w=Qt("bai-power-search",ce),e[44]=ce,e[45]=w):w=e[45];let E;e[46]!==U?(E=U?{type:"error",message:U}:void 0,e[46]=U,e[47]=E):E=e[47];let x;return e[48]!==A||e[49]!==de||e[50]!==D||e[51]!==be||e[52]!==le||e[53]!==pe||e[54]!==ue||e[55]!==L||e[56]!==ge||e[57]!==w||e[58]!==E||e[59]!==S||e[60]!==C?(x=se.jsx($t,{config:A,components:zt,filters:D,startIcon:Yt,label:S,placeholder:C,popoverSaveButtonLabel:L,resultCount:le,isDisabled:ge,size:pe,style:ue,className:w,"data-testid":de,status:E,onChange:be}),e[48]=A,e[49]=de,e[50]=D,e[51]=be,e[52]=le,e[53]=pe,e[54]=ue,e[55]=L,e[56]=ge,e[57]=w,e[58]=E,e[59]=S,e[60]=C,e[61]=x):x=e[61],x};function En(t){return t.type==="string"&&!ie(t)&&!t.renderInput}const{action:p}=__STORYBOOK_MODULE_ACTIONS__,ke=[{label:"local:volume1",value:"local:volume1"},{label:"local:volume2",value:"local:volume2"},{label:"nfs:data",value:"nfs:data"}],ka={title:"Filter/BAIGraphQLPropertyFilter",component:Ne,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:`
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
        `}}},argTypes:{filterProperties:{description:"Array of filterable properties with their configuration",control:{type:"object"},table:{type:{summary:"FilterProperty[]"},detail:`
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
        `}},value:{control:{type:"object"},description:"Current GraphQL filter object",table:{type:{summary:"GraphQLFilter"},detail:`
GraphQLFilter = {
  [property: string]: FilterValue;
  AND?: GraphQLFilter[];
  OR?: GraphQLFilter[];
}
        `}},onChange:{description:"Callback when filter value changes",table:{type:{summary:"(value: GraphQLFilter | undefined) => void"}}},loading:{control:{type:"boolean"},description:"Show loading state",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},combinationMode:{control:{type:"radio"},options:["AND","OR"],description:"How to combine multiple filter conditions",table:{type:{summary:"'AND' | 'OR'"},defaultValue:{summary:"AND"}}}},render:t=>{const[e,n]=Ut.useState(t.value);return se.jsx(Ne,{...t,value:e,onChange:r=>{var a;(a=t.onChange)==null||a.call(t,r),n(r)}})}},V={name:"Basic Usage",parameters:{docs:{description:{story:"Basic GraphQL property filter with string and boolean properties. Try adding filters and see how they combine into a GraphQL filter object."}}},args:{filterProperties:[{key:"name",propertyLabel:"Name",type:"string",defaultOperator:"iContains"},{key:"description",propertyLabel:"Description",type:"string"},{key:"isActive",propertyLabel:"Active Status",type:"boolean"}],combinationMode:"AND",onChange:p("Filter changed")}},W={name:"Multiple Filters with AND",parameters:{docs:{description:{story:"Demonstrates filters combined with AND operator. All conditions must be satisfied for a match. This is useful when you need strict filtering."}}},args:{filterProperties:[{key:"title",propertyLabel:"Title",type:"string"},{key:"priority",propertyLabel:"Priority",type:"enum",options:[{label:"High",value:"HIGH"},{label:"Medium",value:"MEDIUM"},{label:"Low",value:"LOW"}]},{key:"isUrgent",propertyLabel:"Urgent",type:"boolean"}],combinationMode:"AND",value:{AND:[{title:{iContains:"critical"}},{priority:{equals:"HIGH"}},{isUrgent:!0}]},onChange:p("AND Filter changed")}},B={name:"Multiple Filters with OR",parameters:{docs:{description:{story:"Demonstrates filters combined with OR operator. Any condition can match for a result. This is useful for more flexible, inclusive filtering."}}},args:{filterProperties:[{key:"status",propertyLabel:"Status",type:"enum",options:[{label:"Urgent",value:"URGENT"},{label:"High Priority",value:"HIGH_PRIORITY"},{label:"Normal",value:"NORMAL"}]},{key:"assignee",propertyLabel:"Assignee",type:"string"},{key:"dueToday",propertyLabel:"Due Today",type:"boolean"}],combinationMode:"OR",value:{OR:[{status:{equals:"URGENT"}},{assignee:{iContains:"john"}},{dueToday:!0}]},onChange:p("OR Filter changed")}},j={name:"Number Filters with Comparisons",parameters:{docs:{description:{story:"Shows numeric filtering with comparison operators like greater than, less than, etc. Useful for filtering by quantities, scores, or metrics."}}},args:{filterProperties:[{key:"score",propertyLabel:"Score",type:"number",operators:["equals","notEquals","greaterThan","greaterThanOrEqual","lessThan","lessThanOrEqual"]},{key:"quantity",propertyLabel:"Quantity",type:"number"},{key:"price",propertyLabel:"Price",type:"number",operators:["greaterThan","lessThan","equals"],defaultOperator:"greaterThan"}],combinationMode:"AND",value:{AND:[{score:{greaterThanOrEqual:80}},{quantity:{lessThan:100}}]},onChange:p("Number filter changed")}},_={name:"Enum Filters with Multiple Selection",parameters:{docs:{description:{story:"Demonstrates enum type filtering with in/notIn operators for multiple value selection. Perfect for status fields, categories, or any predefined set of values."}}},args:{filterProperties:[{key:"status",propertyLabel:"Status",type:"enum",options:[{label:"Active",value:"ACTIVE"},{label:"Inactive",value:"INACTIVE"},{label:"Pending",value:"PENDING"},{label:"Archived",value:"ARCHIVED"}],operators:["equals","notEquals","in","notIn"],strictSelection:!0},{key:"category",propertyLabel:"Category",type:"enum",options:[{label:"Frontend",value:"FRONTEND"},{label:"Backend",value:"BACKEND"},{label:"Database",value:"DATABASE"},{label:"DevOps",value:"DEVOPS"}],defaultOperator:"in"}],combinationMode:"AND",value:{AND:[{status:{in:["ACTIVE","PENDING"]}},{category:{notEquals:"DATABASE"}}]},onChange:p("Enum filter changed")}},Q={name:"Complex Combined Filter",parameters:{docs:{description:{story:"Example showing multiple filters with different property types combined with the selected mode (AND/OR) for comprehensive filtering."}}},args:{filterProperties:[{key:"name",propertyLabel:"Name",type:"string"},{key:"email",propertyLabel:"Email",type:"string",operators:["iContains","iStartsWith","iEndsWith"]},{key:"role",propertyLabel:"Role",type:"enum",options:[{label:"Admin",value:"ADMIN"},{label:"User",value:"USER"},{label:"Guest",value:"GUEST"}]},{key:"credits",propertyLabel:"Credits",type:"number"},{key:"isVerified",propertyLabel:"Verified",type:"boolean"}],combinationMode:"AND",value:{AND:[{name:{iContains:"john"}},{email:{iEndsWith:"@company.com"}},{role:{equals:"USER"}},{credits:{greaterThanOrEqual:100}},{isVerified:!0}]},onChange:p("Complex filter changed")}},Y={name:"Custom Validation Rules",parameters:{docs:{description:{story:"Property filter with custom validation rules for data integrity. Shows email validation and strict selection enforcement."}}},args:{filterProperties:[{key:"email",propertyLabel:"Email Address",type:"string",rule:{message:"Please enter a valid email address",validate:t=>/\S+@\S+\.\S+/.test(t)}},{key:"phone",propertyLabel:"Phone Number",type:"string",rule:{message:"Phone number must be 10 digits",validate:t=>/^\d{10}$/.test(t.replace(/\D/g,""))}},{key:"department",propertyLabel:"Department",type:"enum",options:[{label:"Engineering",value:"ENGINEERING"},{label:"Marketing",value:"MARKETING"},{label:"Sales",value:"SALES"},{label:"HR",value:"HR"}],strictSelection:!0}],combinationMode:"AND",onChange:p("Validated filter changed")}},K={name:"Autocomplete Suggestions",parameters:{docs:{description:{story:"Filter with predefined autocomplete options for improved user experience and data consistency."}}},args:{filterProperties:[{key:"country",propertyLabel:"Country",type:"string",options:[{label:"United States",value:"US"},{label:"United Kingdom",value:"UK"},{label:"Canada",value:"CA"},{label:"Australia",value:"AU"},{label:"Germany",value:"DE"},{label:"France",value:"FR"}]},{key:"language",propertyLabel:"Language",type:"string",options:[{label:"English",value:"en"},{label:"Spanish",value:"es"},{label:"French",value:"fr"},{label:"German",value:"de"},{label:"Chinese",value:"zh"},{label:"Japanese",value:"ja"}],defaultOperator:"in"}],combinationMode:"OR",value:{OR:[{country:{equals:"US"}},{language:{in:["en","es"]}}]},onChange:p("Autocomplete filter changed")}},$={parameters:{docs:{description:{story:"GraphQL property filter in its initial state with no applied filters. Start adding filters to see how they combine."}}},args:{filterProperties:[{key:"title",propertyLabel:"Title",type:"string"},{key:"isPublished",propertyLabel:"Published",type:"boolean"},{key:"viewCount",propertyLabel:"View Count",type:"number"}],combinationMode:"AND",onChange:p("Filter changed from empty")}},z={parameters:{docs:{description:{story:"Filter component in loading state, typically shown while fetching schema information or processing complex queries."}}},args:{filterProperties:[{key:"name",propertyLabel:"Name",type:"string"}],loading:!0,combinationMode:"AND",onChange:p("Filter changed")}},Z={name:"Artifact Filter (Real-world Example)",parameters:{docs:{description:{story:"Real-world example matching the ArtifactFilter GraphQL input type with name and status filtering capabilities. Shows how the component would be used in production."}}},args:{filterProperties:[{key:"name",propertyLabel:"Artifact Name",type:"string",operators:["iContains","iEquals","iNotEquals","iStartsWith","iEndsWith"],defaultOperator:"iContains"},{key:"status",propertyLabel:"Artifact Status",type:"enum",options:[{label:"Draft",value:"DRAFT"},{label:"Published",value:"PUBLISHED"},{label:"Archived",value:"ARCHIVED"},{label:"Deleted",value:"DELETED"}],operators:["equals","in"],strictSelection:!0}],combinationMode:"AND",value:{AND:[{name:{iContains:"model"}},{status:{in:["PUBLISHED","DRAFT"]}}]},onChange:p("Artifact filter changed")}},J={name:"Fixed Operator (No Selector)",parameters:{docs:{description:{story:"Demonstrates properties with fixed operators where the operator selector is hidden. Useful when you want to enforce a specific operator for certain fields."}}},args:{filterProperties:[{key:"search",propertyLabel:"Search (always contains)",type:"string",fixedOperator:"iContains"},{key:"username",propertyLabel:"Username (always equals)",type:"string",fixedOperator:"iEquals"},{key:"tags",propertyLabel:"Tags (always in)",type:"string",fixedOperator:"in"},{key:"score",propertyLabel:"Score (flexible)",type:"number",operators:["equals","greaterThan","greaterThanOrEqual","lessThan","lessThanOrEqual"]}],combinationMode:"AND",onChange:p("Fixed operator filter changed")}},X={name:"Toggle Between AND/OR",parameters:{docs:{description:{story:"Example showing how switching between AND and OR combination modes affects the filter logic. Try toggling the combination mode to see how the same conditions behave differently."}}},args:{filterProperties:[{key:"type",propertyLabel:"Type",type:"enum",options:[{label:"Feature",value:"FEATURE"},{label:"Bug",value:"BUG"},{label:"Task",value:"TASK"}]},{key:"priority",propertyLabel:"Priority",type:"enum",options:[{label:"Critical",value:"CRITICAL"},{label:"High",value:"HIGH"},{label:"Medium",value:"MEDIUM"},{label:"Low",value:"LOW"}]},{key:"assignedToMe",propertyLabel:"Assigned to Me",type:"boolean"}],combinationMode:"AND",onChange:p("Filter changed with mode toggle")}},ee={name:"DateTime Filters",parameters:{docs:{description:{story:"Demonstrates datetime filtering with a DatePicker UI. When a datetime property is selected, a date picker with time selection is rendered instead of a text input. Useful for filtering by created_at, updated_at, or other timestamp fields."}}},args:{filterProperties:[{key:"created_at",propertyLabel:"Created At",type:"datetime"},{key:"updated_at",propertyLabel:"Updated At",type:"datetime",defaultOperator:"after"},{key:"name",propertyLabel:"Name",type:"string",defaultOperator:"iContains"},{key:"isActive",propertyLabel:"Active Status",type:"boolean"}],combinationMode:"AND",onChange:p("DateTime filter changed")}},te={name:"DateTime with Pre-applied Filters",parameters:{docs:{description:{story:"DateTime filters with pre-applied conditions showing how datetime values are displayed in filter tags with a human-readable format (YYYY-MM-DD HH:mm)."}}},args:{filterProperties:[{key:"created_at",propertyLabel:"Created At",type:"datetime"},{key:"updated_at",propertyLabel:"Updated At",type:"datetime"},{key:"name",propertyLabel:"Name",type:"string"}],combinationMode:"AND",value:{AND:[{created_at:{after:"2025-01-01T00:00:00.000Z"}},{updated_at:{before:"2025-12-31T23:59:59.000Z"}},{name:{iContains:"test"}}]},onChange:p("DateTime pre-filtered changed")}},ne={name:"UUID Filters",parameters:{docs:{description:{story:"UUID type properties use `equals`, `notEquals`, `in`, `notIn` operators. Combine with a `rule` for format validation."}}},args:{filterProperties:[{key:"projectId",propertyLabel:"Project ID",type:"uuid",rule:{message:"Must be a valid UUID.",validate:t=>/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(t)}},{key:"domainId",propertyLabel:"Domain ID",type:"uuid",defaultOperator:"notEquals"}],combinationMode:"AND",value:{projectId:{equals:"a1b2c3d4-e5f6-7890-abcd-ef1234567890"}},onChange:p("UUID filter changed")}},ae={name:"Custom Input via renderInput",parameters:{docs:{description:{story:"When `renderInput` is provided, the default AutoComplete is replaced with a custom control. The control stages a value via `onAddCondition(value, label?)` and the edit popover's Apply button commits it; feed the render prop's `value` back into the control so the staged pick stays visible. Useful for async selects (e.g., fetching options from an API)."}}},args:{filterProperties:[{key:"name",propertyLabel:"Name",type:"string",defaultOperator:"iContains"},{key:"storageHost",propertyLabel:"Storage Host",type:"string",defaultOperator:"equals",renderInput:({onAddCondition:t,value:e,isDisabled:n})=>se.jsx(Rt,{label:"Storage Host",isLabelHidden:!0,placeholder:"Select storage host",hasSearch:!1,options:ke,isDisabled:n,value:ke.find(r=>r.value===e)??null,onChange:r=>{const a=r;t(a==null?void 0:a.value)}})}],combinationMode:"AND",onChange:p("renderInput filter changed")}},re={name:"Scalar valueMode on string field",parameters:{docs:{description:{story:"Demonstrates valueMode='scalar' on a non-boolean field. The filter emits { slugExact: 'my-slug' } without an operator, while tags still display using implicitOperator (default '=')."}}},args:{filterProperties:[{key:"slugExact",propertyLabel:"Slug (scalar exact)",type:"string",valueMode:"scalar",implicitOperator:"equals"},{key:"title",propertyLabel:"Title",type:"string",defaultOperator:"iContains"},{key:"isPublished",propertyLabel:"Published",type:"boolean"}],combinationMode:"AND",value:{AND:[{slugExact:"hello-world"},{isPublished:!0}]},onChange:p("Scalar mode (string) filter changed")}},Ie=[{label:"alice@example.com",value:"owner-uuid-0001"},{label:"bob@example.com",value:"owner-uuid-0002"},{label:"carol@example.com",value:"owner-uuid-0003"}],oe={name:"Custom input (onAddCondition)",parameters:{docs:{description:{story:"A property whose input is a controlled `BAIComplexSelect` supplied via `renderInput`. Selecting an option calls `onAddCondition(value, label)`, which stages the value; the edit popover's Apply button commits it, serialized per `type: 'uuid'` → `{ owner: { id: { equals: <id> } } }`, while the token shows the label (email) instead of the opaque UUID. The render prop's `value` is fed back into the select so the staged pick stays visible."}}},args:{filterProperties:[{key:"owner.id",propertyLabel:"Owner",type:"uuid",fixedOperator:"equals",renderInput:({onAddCondition:t,value:e,isDisabled:n})=>se.jsx(Rt,{label:"Owner",isLabelHidden:!0,placeholder:"Select owner",options:Ie,isDisabled:n,value:Ie.find(r=>r.value===e)??null,onChange:r=>{const a=r;t(a==null?void 0:a.value,a==null?void 0:a.label)}})}],combinationMode:"AND",onChange:p("custom input filter changed")}};var Pe,Fe,qe;V.parameters={...V.parameters,docs:{...(Pe=V.parameters)==null?void 0:Pe.docs,source:{originalSource:`{
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
}`,...(qe=(Fe=V.parameters)==null?void 0:Fe.docs)==null?void 0:qe.source}}};var Me,Ue,Re;W.parameters={...W.parameters,docs:{...(Me=W.parameters)==null?void 0:Me.docs,source:{originalSource:`{
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
}`,...(Re=(Ue=W.parameters)==null?void 0:Ue.docs)==null?void 0:Re.source}}};var xe,Ge,He;B.parameters={...B.parameters,docs:{...(xe=B.parameters)==null?void 0:xe.docs,source:{originalSource:`{
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
}`,...(He=(Ge=B.parameters)==null?void 0:Ge.docs)==null?void 0:He.source}}};var Ve,We,Be;j.parameters={...j.parameters,docs:{...(Ve=j.parameters)==null?void 0:Ve.docs,source:{originalSource:`{
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
}`,...(Be=(We=j.parameters)==null?void 0:We.docs)==null?void 0:Be.source}}};var je,_e,Qe;_.parameters={..._.parameters,docs:{...(je=_.parameters)==null?void 0:je.docs,source:{originalSource:`{
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
}`,...(Qe=(_e=_.parameters)==null?void 0:_e.docs)==null?void 0:Qe.source}}};var Ye,Ke,$e;Q.parameters={...Q.parameters,docs:{...(Ye=Q.parameters)==null?void 0:Ye.docs,source:{originalSource:`{
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
}`,...($e=(Ke=Q.parameters)==null?void 0:Ke.docs)==null?void 0:$e.source}}};var ze,Ze,Je;Y.parameters={...Y.parameters,docs:{...(ze=Y.parameters)==null?void 0:ze.docs,source:{originalSource:`{
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
}`,...(Je=(Ze=Y.parameters)==null?void 0:Ze.docs)==null?void 0:Je.source}}};var Xe,et,tt;K.parameters={...K.parameters,docs:{...(Xe=K.parameters)==null?void 0:Xe.docs,source:{originalSource:`{
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
}`,...(tt=(et=K.parameters)==null?void 0:et.docs)==null?void 0:tt.source}}};var nt,at,rt;$.parameters={...$.parameters,docs:{...(nt=$.parameters)==null?void 0:nt.docs,source:{originalSource:`{
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
}`,...(rt=(at=$.parameters)==null?void 0:at.docs)==null?void 0:rt.source}}};var ot,it,st;z.parameters={...z.parameters,docs:{...(ot=z.parameters)==null?void 0:ot.docs,source:{originalSource:`{
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
}`,...(st=(it=z.parameters)==null?void 0:it.docs)==null?void 0:st.source}}};var lt,pt,ut;Z.parameters={...Z.parameters,docs:{...(lt=Z.parameters)==null?void 0:lt.docs,source:{originalSource:`{
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
}`,...(ut=(pt=Z.parameters)==null?void 0:pt.docs)==null?void 0:ut.source}}};var ct,dt,mt;J.parameters={...J.parameters,docs:{...(ct=J.parameters)==null?void 0:ct.docs,source:{originalSource:`{
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
}`,...(mt=(dt=J.parameters)==null?void 0:dt.docs)==null?void 0:mt.source}}};var yt,ht,bt;X.parameters={...X.parameters,docs:{...(yt=X.parameters)==null?void 0:yt.docs,source:{originalSource:`{
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
}`,...(bt=(ht=X.parameters)==null?void 0:ht.docs)==null?void 0:bt.source}}};var gt,ft,vt;ee.parameters={...ee.parameters,docs:{...(gt=ee.parameters)==null?void 0:gt.docs,source:{originalSource:`{
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
}`,...(vt=(ft=ee.parameters)==null?void 0:ft.docs)==null?void 0:vt.source}}};var At,Dt,St;te.parameters={...te.parameters,docs:{...(At=te.parameters)==null?void 0:At.docs,source:{originalSource:`{
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
}`,...(St=(Dt=te.parameters)==null?void 0:Dt.docs)==null?void 0:St.source}}};var Ct,Lt,wt;ne.parameters={...ne.parameters,docs:{...(Ct=ne.parameters)==null?void 0:Ct.docs,source:{originalSource:`{
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
}`,...(wt=(Lt=ne.parameters)==null?void 0:Lt.docs)==null?void 0:wt.source}}};var Et,Ot,Tt;ae.parameters={...ae.parameters,docs:{...(Et=ae.parameters)==null?void 0:Et.docs,source:{originalSource:`{
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
}`,...(Tt=(Ot=ae.parameters)==null?void 0:Ot.docs)==null?void 0:Tt.source}}};var Nt,kt,It;re.parameters={...re.parameters,docs:{...(Nt=re.parameters)==null?void 0:Nt.docs,source:{originalSource:`{
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
}`,...(It=(kt=re.parameters)==null?void 0:kt.docs)==null?void 0:It.source}}};var Pt,Ft,qt;oe.parameters={...oe.parameters,docs:{...(Pt=oe.parameters)==null?void 0:Pt.docs,source:{originalSource:`{
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
}`,...(qt=(Ft=oe.parameters)==null?void 0:Ft.docs)==null?void 0:qt.source}}};const Ia=["Default","WithANDCombination","WithORCombination","WithNumberFilters","WithEnumFilters","ComplexFilter","WithValidation","WithAutocompleteOptions","EmptyState","LoadingState","ArtifactFilterExample","WithFixedOperator","ToggleCombinationMode","WithDateTimeFilters","WithDateTimePrefiltered","WithUUIDFilters","WithRenderInput","WithScalarValueModeOnString","WithCustomType"];export{Z as ArtifactFilterExample,Q as ComplexFilter,V as Default,$ as EmptyState,z as LoadingState,X as ToggleCombinationMode,W as WithANDCombination,K as WithAutocompleteOptions,oe as WithCustomType,ee as WithDateTimeFilters,te as WithDateTimePrefiltered,_ as WithEnumFilters,J as WithFixedOperator,j as WithNumberFilters,B as WithORCombination,ae as WithRenderInput,re as WithScalarValueModeOnString,ne as WithUUIDFilters,Y as WithValidation,Ia as __namedExportsOrder,ka as default};
