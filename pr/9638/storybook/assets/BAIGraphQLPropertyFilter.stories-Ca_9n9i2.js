import{c as Bt,a as jt,r as Ut,j as ie,aK as _t,i as Qt,aL as ve}from"./iframe-BEoiQE7w.js";import{B as Mt}from"./BAIComplexSelect-BZQsblHF.js";import{u as Yt,P as Kt,b as $t,t as Ee,a as Oe}from"./PowerSearch-BfQaM8JU.js";import{u as zt}from"./useControllableValue-oxPiLq_g.js";import{k as Se}from"./toLower-D_sg_8NB.js";import{f as Te}from"./find-CXuOz_yp.js";import{m as h}from"./map-CCeyH3jl.js";import{u as Zt}from"./uniqBy-lc6inf9g.js";import{i as Jt}from"./isNumber-Bwc86GF5.js";import{i as Rt}from"./includes-DsMH6Kpg.js";import{t as y}from"./toString-DnR4qNr7.js";import{c as Xt}from"./compact-CU4PNV0P.js";import{s as en}from"./split-DDnLS5QE.js";import{h as tn,s as nn,c as an}from"./_charsEndIndex-BHSW-HpW.js";import"./preload-helper-Dp1pzeXC.js";import"./useIndicator-BeTDI6Wr.js";import"./isRenderable-BUV0eL6r.js";import"./clamp-3AwLdtR5.js";import"./_baseClamp-DVUOCJN_.js";import"./toFinite-C2SurkKL.js";import"./_trimmedEndIndex-DuQxD0U0.js";import"./isSymbol-4lUW4Jzp.js";import"./filter-oRMU2E0s.js";import"./_baseEach-CGusJZDY.js";import"./get-CDSr9iyL.js";import"./_baseGet-DQr73XUB.js";import"./identity-DKeuBCMA.js";import"./_baseSlice-F8doVSIJ.js";import"./toInteger-DSoyFE3S.js";import"./usePopover-CwDxRjSz.js";import"./useDevWarning-CuTc4NM2.js";import"./rtlStyles-T4i24HtE.js";import"./useResolvedRequired-BU4ED8RM.js";import"./composeEventHandlers-BolWE7qY.js";import"./InputClearButton-D4c9yUSK.js";import"./Divider-B7keFUeG.js";import"./some-DRFoWa8G.js";import"./Token-8Kfu7kGF.js";import"./SelectorOption-DsM3Z08d.js";import"./Item-q2V8vvNb.js";import"./_baseIndexOf-Be9UPhX8.js";import"./_baseFindIndex-Cj99RmFE.js";import"./isEmpty-FM4KREfx.js";import"./isNil-CHIgUVhi.js";import"./isString-CA0xd2Il.js";import"./characters-DWaYg7k3.js";import"./NumberInput-ClQUyKI-.js";import"./useInputStatusIcon-FQhvMA7e.js";import"./InputGroupContext-5IoryGAE.js";import"./Selector-ChvNaAlc.js";import"./useFocusReturnVisibility-DKaITLGr.js";import"./isRtlElement-B2-7SF8s.js";import"./BottomSheet-RQ3JzWHM.js";import"./TextInput-B5YZJ9Y6.js";import"./VStack-Uli91MTy.js";import"./_baseAssignValue-CZ42haYD.js";import"./_defineProperty-D5OXegJa.js";import"./_baseUniq-o14e9ww8.js";import"./noop-DX6rZLP_.js";import"./_isIterateeCall-BFKVmVwG.js";function rn(t){return function(e){e=y(e);var a=tn(e)?nn(e):void 0,r=a?a[0]:e.charAt(0),n=a?an(a,1).join(""):e.slice(1);return r[t]()+n}}var on=rn("toUpperCase");const sn={string:["iContains","iNotContains","iEquals","iNotEquals","iStartsWith","iNotStartsWith","iEndsWith","iNotEndsWith"],number:["equals","notEquals","greaterThan","greaterThanOrEqual","lessThan","lessThanOrEqual"],boolean:["equals"],enum:["equals","notEquals","in","notIn"],uuid:["equals","notEquals","in","notIn"],datetime:["equals","notEquals","before","after"]},ln={string:"iContains",number:"equals",boolean:"equals",enum:"equals",uuid:"equals",datetime:"equals"},xt=["in","notIn"],pn=[{label:"True",value:"true"},{label:"False",value:"false"}];function Ae(){return`filter-${Date.now()}-${Math.random().toString(36).substring(2,11)}`}function un(t,e){const a=t.split(".");if(a.some(n=>n===""||n==="__proto__"||n==="constructor"||n==="prototype"))return{};let r=e;for(let n=a.length-1;n>0;n--)r={[a[n]]:r};return{[a[0]]:r}}function cn(t,e,a="AND"){if(t.length===0)return;const r=[];return t.forEach(n=>{const o=e.find(l=>l.key===n.property);let i;if(((o==null?void 0:o.valueMode)||((o==null?void 0:o.type)==="boolean"?"scalar":"operator"))==="scalar")(o==null?void 0:o.type)==="boolean"?i=n.value===!0||n.value==="true":(o==null?void 0:o.type)==="number"?i=Number(n.value):i=n.value;else if(n.operator==="in"||n.operator==="notIn"){const l=Array.isArray(n.value)?n.value:n.value.split(",").map(c=>c.trim());i={[n.operator]:(o==null?void 0:o.type)==="number"?l.map(Number):l}}else{let l=n.value;(o==null?void 0:o.type)==="number"&&(l=Number(l)),i={[n.operator]:l}}r.push(un(n.property,i))}),r.length===1?r[0]:{[a]:r}}function Gt(t,e,a=""){const r=[];return Object.keys(t).forEach(n=>{if(n==="AND"||n==="OR"||n==="NOT"||n==="DISTINCT")return;const o=a?`${a}.${n}`:n,i=t[n],d=e.find(l=>l.key===o);d?(d.valueMode||(d.type==="boolean"?"scalar":"operator"))==="scalar"&&typeof i!="object"?r.push({id:Ae(),property:o,operator:d.implicitOperator||"equals",value:String(i),propertyLabel:d.propertyLabel||o,type:d.type||"string"}):i&&typeof i=="object"&&Object.keys(i).forEach(c=>{const p=i[c];p!=null&&r.push({id:Ae(),property:o,operator:c,value:Array.isArray(p)?p.join(", "):String(p),propertyLabel:d.propertyLabel||o,type:d.type||"string"})}):i&&typeof i=="object"&&(Object.keys(i).some(p=>["eq","ne","lt","le","gt","ge","contains","notContains","startsWith","endsWith","ilike","in","notIn","isNull"].includes(p))||r.push(...Gt(i,e,o)))}),r}function Le(t,e){if(!t)return[];const a=[];if(t.AND||t.OR){const r=t.AND||t.OR;return(Array.isArray(r)?r:[r]).forEach(o=>{a.push(...Le(o,e))}),a}return a.push(...Gt(t,e)),a}const Ht=t=>(t==null?void 0:t.valueMode)||((t==null?void 0:t.type)==="boolean"?"scalar":"operator"),De=t=>t.options??(t.type==="boolean"?pn:void 0),oe=t=>t.strictSelection??t.type==="boolean";function dn(t){return Ht(t)==="scalar"?[t.implicitOperator||"equals"]:t.fixedOperator?[t.fixedOperator]:t.operators||sn[t.type||"string"]}function mn(t){return Ht(t)==="scalar"?t.implicitOperator||"equals":t.fixedOperator||t.defaultOperator||ln[t.type]}const yn=(t,e)=>e(`comp:BAIGraphQLPropertyFilter.operator.${on(t)}`,{defaultValue:t});function hn(t,e,a){if(a)return a;const r=De(t),n=oe(t);if(Rt(xt,e))return r&&n?{type:"enum_list",values:Ee(r)}:{type:"string_list",searchSource:Oe(r),isArbitraryStringAllowed:!0};if(t.type==="datetime")return{type:"date_absolute"};if(t.type==="number")return{type:"float"};if(r&&n)return{type:"enum",values:Ee(r)};const o=Oe(r);return o?{type:"string",searchSource:o,isArbitraryStringAllowed:!0}:{type:"string"}}function bn(t,e){const a=t.value;if(Rt(xt,t.operator)){const r=Qt(a)?h(a,y):Xt(h(en(y(a),","),$t));return e&&De(e)&&oe(e)?{type:"enum_list",value:r}:{type:"string_list",value:r}}if((e==null?void 0:e.type)==="datetime"){const r=ve(y(a));return{type:"date_absolute",unixSeconds:r.isValid()?r.unix():ve().unix()}}return(e==null?void 0:e.type)==="number"?{type:"float",value:Number(a)}:e!=null&&e.renderInput?{type:"custom",value:y(a)}:e&&De(e)&&oe(e)?{type:"enum",value:y(a)}:{type:"string",value:y(a)}}function gn(t){switch(t.type){case"empty":return"";case"date_absolute":return ve.unix(t.unixSeconds).toISOString();case"integer":case"float":return String(t.value);case"string_list":case"enum_list":return[...t.value];case"entity_list":return h(t.value,e=>e.id);case"date_range":return JSON.stringify(t.value);default:return y(t.value??"")}}function fn(t,e){const a=Se(e,"key");return h(Le(t,e),r=>({field:r.property,operator:r.operator,value:bn(r,a[r.property])}))}function vn(t,e,a="AND",r=!1,n){const o=Se(e,"key"),i=r?Zt([...t].reverse(),"field").reverse():[...t],d=Jt(n)&&i.length>n?n<=0?[]:i.slice(-n):i,l=h(d,c=>{const p=o[c.field];return{id:Ae(),property:c.field,operator:c.operator,value:gn(c.value),propertyLabel:(p==null?void 0:p.propertyLabel)??c.field,type:(p==null?void 0:p.type)??"string"}});return cn(l,e,a)}const Ne=t=>{"use memo";var we;const e=Bt.c(61),{filterProperties:a,value:r,onChange:n,defaultValue:o,combinationMode:i,singleCondition:d,maxConditions:l,label:c,placeholder:p,applyLabel:se,resultCount:le,contentSearchFieldKey:k,isDisabled:Vt,size:pe,style:ue,className:ce,loading:Wt,"data-testid":de}=t,me=i===void 0?"AND":i,ye=d===void 0?!1:d,{t:u}=jt();let I;e[0]!==o||e[1]!==n||e[2]!==r?(I={value:r,defaultValue:o,onChange:n},e[0]=o,e[1]=n,e[2]=r,e[3]=I):I=e[3];const[v,he]=zt(I);let P;e[4]===Symbol.for("react.memo_cache_sentinel")?(P={},e[4]=P):P=e[4];const Ce=Ut.useRef(P);let F;e[5]===Symbol.for("react.memo_cache_sentinel")?(F={recordLabel:(g,E,O)=>{Ce.current[`${g}::${E}`]=O},resolveLabel:(g,E)=>Ce.current[`${g}::${E}`]??E},e[5]=F):F=e[5];const b=Yt(F);let A,D,q;if(e[6]!==k||e[7]!==a||e[8]!==b||e[9]!==u||e[10]!==v){const g=Se(a,"key"),E=Le(v,a);let O;e[14]!==a||e[15]!==v?(O=fn(v,a),e[14]=a,e[15]=v,e[16]=O):O=e[16],D=O;let T;e[17]!==k||e[18]!==a?(T=k??((we=Te(a,An))==null?void 0:we.key),e[17]=k,e[18]=a,e[19]=T):T=e[19];let N;if(e[20]!==a||e[21]!==b||e[22]!==u){let f;e[24]!==b||e[25]!==u?(f=m=>{const G=b.operatorValueFor(m.key,m.renderInput);return{key:m.key,label:m.propertyLabel,defaultOperator:mn(m),operators:h(dn(m),fe=>({key:fe,label:yn(fe,u),value:hn(m,fe,G)}))}},e[24]=b,e[25]=u,e[26]=f):f=e[26],N=h(a,f),e[20]=a,e[21]=b,e[22]=u,e[23]=N}else N=e[23];let x;e[27]!==T||e[28]!==N?(x={name:"bai-graphql-property-filter",contentSearchFieldKey:T,fields:N},e[27]=T,e[28]=N,e[29]=x):x=e[29],A=x,q=Te(h(E,f=>{var G;const m=(G=g[f.property])==null?void 0:G.rule;if(m)return m.validate(f.value)?void 0:m.message})),e[6]=k,e[7]=a,e[8]=b,e[9]=u,e[10]=v,e[11]=A,e[12]=D,e[13]=q}else A=e[11],D=e[12],q=e[13];const U=q;let M;e[30]!==me||e[31]!==a||e[32]!==l||e[33]!==he||e[34]!==ye?(M=g=>{he(vn(g,a,me,ye,l))},e[30]=me,e[31]=a,e[32]=l,e[33]=he,e[34]=ye,e[35]=M):M=e[35];const be=M;let S;e[36]!==c||e[37]!==u?(S=c??u("comp:BAIPropertyFilter.SearchLabel"),e[36]=c,e[37]=u,e[38]=S):S=e[38];let L;e[39]!==p||e[40]!==u?(L=p??u("comp:BAIPropertyFilter.PlaceHolder"),e[39]=p,e[40]=u,e[41]=L):L=e[41];let C;e[42]!==se||e[43]!==u?(C=se??u("comp:BAIPropertyFilter.Apply"),e[42]=se,e[43]=u,e[44]=C):C=e[44];const ge=Vt||Wt;let w;e[45]!==U?(w=U?{type:"error",message:U}:void 0,e[45]=U,e[46]=w):w=e[46];let R;return e[47]!==ce||e[48]!==A||e[49]!==de||e[50]!==D||e[51]!==be||e[52]!==le||e[53]!==pe||e[54]!==ue||e[55]!==C||e[56]!==ge||e[57]!==w||e[58]!==S||e[59]!==L?(R=ie.jsx(Kt,{config:A,filters:D,startIcon:_t,label:S,placeholder:L,popoverSaveButtonLabel:C,resultCount:le,isDisabled:ge,size:pe,style:ue,className:ce,"data-testid":de,status:w,onChange:be}),e[47]=ce,e[48]=A,e[49]=de,e[50]=D,e[51]=be,e[52]=le,e[53]=pe,e[54]=ue,e[55]=C,e[56]=ge,e[57]=w,e[58]=S,e[59]=L,e[60]=R):R=e[60],R};function An(t){return t.type==="string"&&!oe(t)&&!t.renderInput}const{action:s}=__STORYBOOK_MODULE_ACTIONS__,ke=[{label:"local:volume1",value:"local:volume1"},{label:"local:volume2",value:"local:volume2"},{label:"nfs:data",value:"nfs:data"}],Oa={title:"Filter/BAIGraphQLPropertyFilter",component:Ne,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:`
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
        `}},onChange:{description:"Callback when filter value changes",table:{type:{summary:"(value: GraphQLFilter | undefined) => void"}}},loading:{control:{type:"boolean"},description:"Show loading state",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},combinationMode:{control:{type:"radio"},options:["AND","OR"],description:"How to combine multiple filter conditions",table:{type:{summary:"'AND' | 'OR'"},defaultValue:{summary:"AND"}}}},render:t=>{const[e,a]=Ut.useState(t.value);return ie.jsx(Ne,{...t,value:e,onChange:r=>{var n;(n=t.onChange)==null||n.call(t,r),a(r)}})}},H={name:"Basic Usage",parameters:{docs:{description:{story:"Basic GraphQL property filter with string and boolean properties. Try adding filters and see how they combine into a GraphQL filter object."}}},args:{filterProperties:[{key:"name",propertyLabel:"Name",type:"string",defaultOperator:"iContains"},{key:"description",propertyLabel:"Description",type:"string"},{key:"isActive",propertyLabel:"Active Status",type:"boolean"}],combinationMode:"AND",onChange:s("Filter changed")}},V={name:"Multiple Filters with AND",parameters:{docs:{description:{story:"Demonstrates filters combined with AND operator. All conditions must be satisfied for a match. This is useful when you need strict filtering."}}},args:{filterProperties:[{key:"title",propertyLabel:"Title",type:"string"},{key:"priority",propertyLabel:"Priority",type:"enum",options:[{label:"High",value:"HIGH"},{label:"Medium",value:"MEDIUM"},{label:"Low",value:"LOW"}]},{key:"isUrgent",propertyLabel:"Urgent",type:"boolean"}],combinationMode:"AND",value:{AND:[{title:{iContains:"critical"}},{priority:{equals:"HIGH"}},{isUrgent:!0}]},onChange:s("AND Filter changed")}},W={name:"Multiple Filters with OR",parameters:{docs:{description:{story:"Demonstrates filters combined with OR operator. Any condition can match for a result. This is useful for more flexible, inclusive filtering."}}},args:{filterProperties:[{key:"status",propertyLabel:"Status",type:"enum",options:[{label:"Urgent",value:"URGENT"},{label:"High Priority",value:"HIGH_PRIORITY"},{label:"Normal",value:"NORMAL"}]},{key:"assignee",propertyLabel:"Assignee",type:"string"},{key:"dueToday",propertyLabel:"Due Today",type:"boolean"}],combinationMode:"OR",value:{OR:[{status:{equals:"URGENT"}},{assignee:{iContains:"john"}},{dueToday:!0}]},onChange:s("OR Filter changed")}},B={name:"Number Filters with Comparisons",parameters:{docs:{description:{story:"Shows numeric filtering with comparison operators like greater than, less than, etc. Useful for filtering by quantities, scores, or metrics."}}},args:{filterProperties:[{key:"score",propertyLabel:"Score",type:"number",operators:["equals","notEquals","greaterThan","greaterThanOrEqual","lessThan","lessThanOrEqual"]},{key:"quantity",propertyLabel:"Quantity",type:"number"},{key:"price",propertyLabel:"Price",type:"number",operators:["greaterThan","lessThan","equals"],defaultOperator:"greaterThan"}],combinationMode:"AND",value:{AND:[{score:{greaterThanOrEqual:80}},{quantity:{lessThan:100}}]},onChange:s("Number filter changed")}},j={name:"Enum Filters with Multiple Selection",parameters:{docs:{description:{story:"Demonstrates enum type filtering with in/notIn operators for multiple value selection. Perfect for status fields, categories, or any predefined set of values."}}},args:{filterProperties:[{key:"status",propertyLabel:"Status",type:"enum",options:[{label:"Active",value:"ACTIVE"},{label:"Inactive",value:"INACTIVE"},{label:"Pending",value:"PENDING"},{label:"Archived",value:"ARCHIVED"}],operators:["equals","notEquals","in","notIn"],strictSelection:!0},{key:"category",propertyLabel:"Category",type:"enum",options:[{label:"Frontend",value:"FRONTEND"},{label:"Backend",value:"BACKEND"},{label:"Database",value:"DATABASE"},{label:"DevOps",value:"DEVOPS"}],defaultOperator:"in"}],combinationMode:"AND",value:{AND:[{status:{in:["ACTIVE","PENDING"]}},{category:{notEquals:"DATABASE"}}]},onChange:s("Enum filter changed")}},_={name:"Complex Combined Filter",parameters:{docs:{description:{story:"Example showing multiple filters with different property types combined with the selected mode (AND/OR) for comprehensive filtering."}}},args:{filterProperties:[{key:"name",propertyLabel:"Name",type:"string"},{key:"email",propertyLabel:"Email",type:"string",operators:["iContains","iStartsWith","iEndsWith"]},{key:"role",propertyLabel:"Role",type:"enum",options:[{label:"Admin",value:"ADMIN"},{label:"User",value:"USER"},{label:"Guest",value:"GUEST"}]},{key:"credits",propertyLabel:"Credits",type:"number"},{key:"isVerified",propertyLabel:"Verified",type:"boolean"}],combinationMode:"AND",value:{AND:[{name:{iContains:"john"}},{email:{iEndsWith:"@company.com"}},{role:{equals:"USER"}},{credits:{greaterThanOrEqual:100}},{isVerified:!0}]},onChange:s("Complex filter changed")}},Q={name:"Custom Validation Rules",parameters:{docs:{description:{story:"Property filter with custom validation rules for data integrity. Shows email validation and strict selection enforcement."}}},args:{filterProperties:[{key:"email",propertyLabel:"Email Address",type:"string",rule:{message:"Please enter a valid email address",validate:t=>/\S+@\S+\.\S+/.test(t)}},{key:"phone",propertyLabel:"Phone Number",type:"string",rule:{message:"Phone number must be 10 digits",validate:t=>/^\d{10}$/.test(t.replace(/\D/g,""))}},{key:"department",propertyLabel:"Department",type:"enum",options:[{label:"Engineering",value:"ENGINEERING"},{label:"Marketing",value:"MARKETING"},{label:"Sales",value:"SALES"},{label:"HR",value:"HR"}],strictSelection:!0}],combinationMode:"AND",onChange:s("Validated filter changed")}},Y={name:"Autocomplete Suggestions",parameters:{docs:{description:{story:"Filter with predefined autocomplete options for improved user experience and data consistency."}}},args:{filterProperties:[{key:"country",propertyLabel:"Country",type:"string",options:[{label:"United States",value:"US"},{label:"United Kingdom",value:"UK"},{label:"Canada",value:"CA"},{label:"Australia",value:"AU"},{label:"Germany",value:"DE"},{label:"France",value:"FR"}]},{key:"language",propertyLabel:"Language",type:"string",options:[{label:"English",value:"en"},{label:"Spanish",value:"es"},{label:"French",value:"fr"},{label:"German",value:"de"},{label:"Chinese",value:"zh"},{label:"Japanese",value:"ja"}],defaultOperator:"in"}],combinationMode:"OR",value:{OR:[{country:{equals:"US"}},{language:{in:["en","es"]}}]},onChange:s("Autocomplete filter changed")}},K={parameters:{docs:{description:{story:"GraphQL property filter in its initial state with no applied filters. Start adding filters to see how they combine."}}},args:{filterProperties:[{key:"title",propertyLabel:"Title",type:"string"},{key:"isPublished",propertyLabel:"Published",type:"boolean"},{key:"viewCount",propertyLabel:"View Count",type:"number"}],combinationMode:"AND",onChange:s("Filter changed from empty")}},$={parameters:{docs:{description:{story:"Filter component in loading state, typically shown while fetching schema information or processing complex queries."}}},args:{filterProperties:[{key:"name",propertyLabel:"Name",type:"string"}],loading:!0,combinationMode:"AND",onChange:s("Filter changed")}},z={name:"Artifact Filter (Real-world Example)",parameters:{docs:{description:{story:"Real-world example matching the ArtifactFilter GraphQL input type with name and status filtering capabilities. Shows how the component would be used in production."}}},args:{filterProperties:[{key:"name",propertyLabel:"Artifact Name",type:"string",operators:["iContains","iEquals","iNotEquals","iStartsWith","iEndsWith"],defaultOperator:"iContains"},{key:"status",propertyLabel:"Artifact Status",type:"enum",options:[{label:"Draft",value:"DRAFT"},{label:"Published",value:"PUBLISHED"},{label:"Archived",value:"ARCHIVED"},{label:"Deleted",value:"DELETED"}],operators:["equals","in"],strictSelection:!0}],combinationMode:"AND",value:{AND:[{name:{iContains:"model"}},{status:{in:["PUBLISHED","DRAFT"]}}]},onChange:s("Artifact filter changed")}},Z={name:"Fixed Operator (No Selector)",parameters:{docs:{description:{story:"Demonstrates properties with fixed operators where the operator selector is hidden. Useful when you want to enforce a specific operator for certain fields."}}},args:{filterProperties:[{key:"search",propertyLabel:"Search (always contains)",type:"string",fixedOperator:"iContains"},{key:"username",propertyLabel:"Username (always equals)",type:"string",fixedOperator:"iEquals"},{key:"tags",propertyLabel:"Tags (always in)",type:"string",fixedOperator:"in"},{key:"score",propertyLabel:"Score (flexible)",type:"number",operators:["equals","greaterThan","greaterThanOrEqual","lessThan","lessThanOrEqual"]}],combinationMode:"AND",onChange:s("Fixed operator filter changed")}},J={name:"Toggle Between AND/OR",parameters:{docs:{description:{story:"Example showing how switching between AND and OR combination modes affects the filter logic. Try toggling the combination mode to see how the same conditions behave differently."}}},args:{filterProperties:[{key:"type",propertyLabel:"Type",type:"enum",options:[{label:"Feature",value:"FEATURE"},{label:"Bug",value:"BUG"},{label:"Task",value:"TASK"}]},{key:"priority",propertyLabel:"Priority",type:"enum",options:[{label:"Critical",value:"CRITICAL"},{label:"High",value:"HIGH"},{label:"Medium",value:"MEDIUM"},{label:"Low",value:"LOW"}]},{key:"assignedToMe",propertyLabel:"Assigned to Me",type:"boolean"}],combinationMode:"AND",onChange:s("Filter changed with mode toggle")}},X={name:"DateTime Filters",parameters:{docs:{description:{story:"Demonstrates datetime filtering with a DatePicker UI. When a datetime property is selected, a date picker with time selection is rendered instead of a text input. Useful for filtering by created_at, updated_at, or other timestamp fields."}}},args:{filterProperties:[{key:"created_at",propertyLabel:"Created At",type:"datetime"},{key:"updated_at",propertyLabel:"Updated At",type:"datetime",defaultOperator:"after"},{key:"name",propertyLabel:"Name",type:"string",defaultOperator:"iContains"},{key:"isActive",propertyLabel:"Active Status",type:"boolean"}],combinationMode:"AND",onChange:s("DateTime filter changed")}},ee={name:"DateTime with Pre-applied Filters",parameters:{docs:{description:{story:"DateTime filters with pre-applied conditions showing how datetime values are displayed in filter tags with a human-readable format (YYYY-MM-DD HH:mm)."}}},args:{filterProperties:[{key:"created_at",propertyLabel:"Created At",type:"datetime"},{key:"updated_at",propertyLabel:"Updated At",type:"datetime"},{key:"name",propertyLabel:"Name",type:"string"}],combinationMode:"AND",value:{AND:[{created_at:{after:"2025-01-01T00:00:00.000Z"}},{updated_at:{before:"2025-12-31T23:59:59.000Z"}},{name:{iContains:"test"}}]},onChange:s("DateTime pre-filtered changed")}},te={name:"UUID Filters",parameters:{docs:{description:{story:"UUID type properties use `equals`, `notEquals`, `in`, `notIn` operators. Combine with a `rule` for format validation."}}},args:{filterProperties:[{key:"projectId",propertyLabel:"Project ID",type:"uuid",rule:{message:"Must be a valid UUID.",validate:t=>/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(t)}},{key:"domainId",propertyLabel:"Domain ID",type:"uuid",defaultOperator:"notEquals"}],combinationMode:"AND",value:{projectId:{equals:"a1b2c3d4-e5f6-7890-abcd-ef1234567890"}},onChange:s("UUID filter changed")}},ne={name:"Custom Input via renderInput",parameters:{docs:{description:{story:"When `renderInput` is provided, the default AutoComplete is replaced with a custom control. The control stages a value via `onAddCondition(value, label?)` and the edit popover's Apply button commits it; feed the render prop's `value` back into the control so the staged pick stays visible. Useful for async selects (e.g., fetching options from an API)."}}},args:{filterProperties:[{key:"name",propertyLabel:"Name",type:"string",defaultOperator:"iContains"},{key:"storageHost",propertyLabel:"Storage Host",type:"string",defaultOperator:"equals",renderInput:({onAddCondition:t,value:e,isDisabled:a})=>ie.jsx(Mt,{label:"Storage Host",isLabelHidden:!0,placeholder:"Select storage host",hasSearch:!1,options:ke,isDisabled:a,value:ke.find(r=>r.value===e)??null,onChange:r=>{const n=r;t(n==null?void 0:n.value)}})}],combinationMode:"AND",onChange:s("renderInput filter changed")}},ae={name:"Scalar valueMode on string field",parameters:{docs:{description:{story:"Demonstrates valueMode='scalar' on a non-boolean field. The filter emits { slugExact: 'my-slug' } without an operator, while tags still display using implicitOperator (default '=')."}}},args:{filterProperties:[{key:"slugExact",propertyLabel:"Slug (scalar exact)",type:"string",valueMode:"scalar",implicitOperator:"equals"},{key:"title",propertyLabel:"Title",type:"string",defaultOperator:"iContains"},{key:"isPublished",propertyLabel:"Published",type:"boolean"}],combinationMode:"AND",value:{AND:[{slugExact:"hello-world"},{isPublished:!0}]},onChange:s("Scalar mode (string) filter changed")}},Ie=[{label:"alice@example.com",value:"owner-uuid-0001"},{label:"bob@example.com",value:"owner-uuid-0002"},{label:"carol@example.com",value:"owner-uuid-0003"}],re={name:"Custom input (onAddCondition)",parameters:{docs:{description:{story:"A property whose input is a controlled `BAIComplexSelect` supplied via `renderInput`. Selecting an option calls `onAddCondition(value, label)`, which stages the value; the edit popover's Apply button commits it, serialized per `type: 'uuid'` → `{ owner: { id: { equals: <id> } } }`, while the token shows the label (email) instead of the opaque UUID. The render prop's `value` is fed back into the select so the staged pick stays visible."}}},args:{filterProperties:[{key:"owner.id",propertyLabel:"Owner",type:"uuid",fixedOperator:"equals",renderInput:({onAddCondition:t,value:e,isDisabled:a})=>ie.jsx(Mt,{label:"Owner",isLabelHidden:!0,placeholder:"Select owner",options:Ie,isDisabled:a,value:Ie.find(r=>r.value===e)??null,onChange:r=>{const n=r;t(n==null?void 0:n.value,n==null?void 0:n.label)}})}],combinationMode:"AND",onChange:s("custom input filter changed")}};var Pe,Fe,qe;H.parameters={...H.parameters,docs:{...(Pe=H.parameters)==null?void 0:Pe.docs,source:{originalSource:`{
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
}`,...(qe=(Fe=H.parameters)==null?void 0:Fe.docs)==null?void 0:qe.source}}};var Ue,Me,Re;V.parameters={...V.parameters,docs:{...(Ue=V.parameters)==null?void 0:Ue.docs,source:{originalSource:`{
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
}`,...(Re=(Me=V.parameters)==null?void 0:Me.docs)==null?void 0:Re.source}}};var xe,Ge,He;W.parameters={...W.parameters,docs:{...(xe=W.parameters)==null?void 0:xe.docs,source:{originalSource:`{
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
}`,...(He=(Ge=W.parameters)==null?void 0:Ge.docs)==null?void 0:He.source}}};var Ve,We,Be;B.parameters={...B.parameters,docs:{...(Ve=B.parameters)==null?void 0:Ve.docs,source:{originalSource:`{
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
}`,...(Be=(We=B.parameters)==null?void 0:We.docs)==null?void 0:Be.source}}};var je,_e,Qe;j.parameters={...j.parameters,docs:{...(je=j.parameters)==null?void 0:je.docs,source:{originalSource:`{
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
}`,...(Qe=(_e=j.parameters)==null?void 0:_e.docs)==null?void 0:Qe.source}}};var Ye,Ke,$e;_.parameters={..._.parameters,docs:{...(Ye=_.parameters)==null?void 0:Ye.docs,source:{originalSource:`{
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
}`,...($e=(Ke=_.parameters)==null?void 0:Ke.docs)==null?void 0:$e.source}}};var ze,Ze,Je;Q.parameters={...Q.parameters,docs:{...(ze=Q.parameters)==null?void 0:ze.docs,source:{originalSource:`{
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
}`,...(Je=(Ze=Q.parameters)==null?void 0:Ze.docs)==null?void 0:Je.source}}};var Xe,et,tt;Y.parameters={...Y.parameters,docs:{...(Xe=Y.parameters)==null?void 0:Xe.docs,source:{originalSource:`{
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
}`,...(tt=(et=Y.parameters)==null?void 0:et.docs)==null?void 0:tt.source}}};var nt,at,rt;K.parameters={...K.parameters,docs:{...(nt=K.parameters)==null?void 0:nt.docs,source:{originalSource:`{
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
}`,...(rt=(at=K.parameters)==null?void 0:at.docs)==null?void 0:rt.source}}};var ot,it,st;$.parameters={...$.parameters,docs:{...(ot=$.parameters)==null?void 0:ot.docs,source:{originalSource:`{
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
}`,...(st=(it=$.parameters)==null?void 0:it.docs)==null?void 0:st.source}}};var lt,pt,ut;z.parameters={...z.parameters,docs:{...(lt=z.parameters)==null?void 0:lt.docs,source:{originalSource:`{
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
}`,...(ut=(pt=z.parameters)==null?void 0:pt.docs)==null?void 0:ut.source}}};var ct,dt,mt;Z.parameters={...Z.parameters,docs:{...(ct=Z.parameters)==null?void 0:ct.docs,source:{originalSource:`{
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
}`,...(mt=(dt=Z.parameters)==null?void 0:dt.docs)==null?void 0:mt.source}}};var yt,ht,bt;J.parameters={...J.parameters,docs:{...(yt=J.parameters)==null?void 0:yt.docs,source:{originalSource:`{
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
}`,...(bt=(ht=J.parameters)==null?void 0:ht.docs)==null?void 0:bt.source}}};var gt,ft,vt;X.parameters={...X.parameters,docs:{...(gt=X.parameters)==null?void 0:gt.docs,source:{originalSource:`{
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
}`,...(vt=(ft=X.parameters)==null?void 0:ft.docs)==null?void 0:vt.source}}};var At,Dt,St;ee.parameters={...ee.parameters,docs:{...(At=ee.parameters)==null?void 0:At.docs,source:{originalSource:`{
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
}`,...(St=(Dt=ee.parameters)==null?void 0:Dt.docs)==null?void 0:St.source}}};var Lt,Ct,wt;te.parameters={...te.parameters,docs:{...(Lt=te.parameters)==null?void 0:Lt.docs,source:{originalSource:`{
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
}`,...(wt=(Ct=te.parameters)==null?void 0:Ct.docs)==null?void 0:wt.source}}};var Et,Ot,Tt;ne.parameters={...ne.parameters,docs:{...(Et=ne.parameters)==null?void 0:Et.docs,source:{originalSource:`{
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
}`,...(Tt=(Ot=ne.parameters)==null?void 0:Ot.docs)==null?void 0:Tt.source}}};var Nt,kt,It;ae.parameters={...ae.parameters,docs:{...(Nt=ae.parameters)==null?void 0:Nt.docs,source:{originalSource:`{
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
}`,...(It=(kt=ae.parameters)==null?void 0:kt.docs)==null?void 0:It.source}}};var Pt,Ft,qt;re.parameters={...re.parameters,docs:{...(Pt=re.parameters)==null?void 0:Pt.docs,source:{originalSource:`{
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
}`,...(qt=(Ft=re.parameters)==null?void 0:Ft.docs)==null?void 0:qt.source}}};const Ta=["Default","WithANDCombination","WithORCombination","WithNumberFilters","WithEnumFilters","ComplexFilter","WithValidation","WithAutocompleteOptions","EmptyState","LoadingState","ArtifactFilterExample","WithFixedOperator","ToggleCombinationMode","WithDateTimeFilters","WithDateTimePrefiltered","WithUUIDFilters","WithRenderInput","WithScalarValueModeOnString","WithCustomType"];export{z as ArtifactFilterExample,_ as ComplexFilter,H as Default,K as EmptyState,$ as LoadingState,J as ToggleCombinationMode,V as WithANDCombination,Y as WithAutocompleteOptions,re as WithCustomType,X as WithDateTimeFilters,ee as WithDateTimePrefiltered,j as WithEnumFilters,Z as WithFixedOperator,B as WithNumberFilters,W as WithORCombination,ne as WithRenderInput,ae as WithScalarValueModeOnString,te as WithUUIDFilters,Q as WithValidation,Ta as __namedExportsOrder,Oa as default};
