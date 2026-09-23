import{c as jt,a as _t,r as Ut,az as Qt,j as se,aL as Yt,i as Kt,aM as Ae}from"./iframe-BaVSwCF0.js";import{B as Rt}from"./BAIComplexSelect-Dqnfpu2j.js";import{u as $t,P as zt,b as Zt,c as Jt,t as Oe,a as Te}from"./BAIPowerSearchAdapters-4W3JRyVP.js";import{u as Xt}from"./useControllableValue-Lh02Sf2B.js";import{k as Le}from"./toLower-Dzk14l2V.js";import{f as Ne}from"./find-DrDctMNx.js";import{m as h}from"./map-C6MxnuIp.js";import{u as en}from"./uniqBy-Bwl-JxLz.js";import{i as tn}from"./isNumber-BoA6ZXR3.js";import{i as xt}from"./includes-Dly-UM6y.js";import{t as y}from"./toString-D-JaUDt3.js";import{c as nn}from"./compact-CU4PNV0P.js";import{s as an}from"./split-BihlCH6O.js";import{h as rn,s as on,c as sn}from"./_charsEndIndex-BHSW-HpW.js";import"./preload-helper-Dp1pzeXC.js";import"./useIndicator-CjQNxHY3.js";import"./isRenderable-BUV0eL6r.js";import"./clamp-DXuotR6S.js";import"./_baseClamp-DVUOCJN_.js";import"./toFinite-BCFc1PCs.js";import"./_trimmedEndIndex-DuQxD0U0.js";import"./isSymbol-PNi2RIGO.js";import"./filter-DMTE9bK_.js";import"./_baseEach-C01BDMWL.js";import"./get-DXYPOUSc.js";import"./_baseGet-C5EOlrGw.js";import"./identity-DKeuBCMA.js";import"./_baseSlice-F8doVSIJ.js";import"./toInteger-D7ScoCuK.js";import"./InputClearButton-Ckbnc_yp.js";import"./useResolvedRequired-DnNI9h-e.js";import"./useDevWarning-B93B3X-W.js";import"./usePopover-Do8YCcin.js";import"./rtlStyles-T4i24HtE.js";import"./composeEventHandlers-BolWE7qY.js";import"./Divider-C3nt75Be.js";import"./some-ByAnYAOQ.js";import"./Token-DHAkoohy.js";import"./SelectorOption-B45RHjJC.js";import"./Item-DCzjCIoT.js";import"./_baseIndexOf-Be9UPhX8.js";import"./_baseFindIndex-Cj99RmFE.js";import"./characters-DWaYg7k3.js";import"./NumberInput-phvTeToh.js";import"./useInputStatusIcon-RkOm9JDT.js";import"./InputGroupContext-Cde8Syqx.js";import"./Selector-DgtFpDt3.js";import"./useFocusReturnVisibility--pw_Q2Ji.js";import"./isRtlElement-B2-7SF8s.js";import"./BottomSheet-DY6c2avr.js";import"./TextInput-pdwc8xsf.js";import"./VStack-CP8OQ2Kk.js";import"./isEmpty-B_fMMNNu.js";import"./isNil-CHIgUVhi.js";import"./isString-CpRKlQDQ.js";import"./_baseAssignValue-CABkgCiE.js";import"./_defineProperty-BaN2YnNl.js";import"./_baseUniq-7yafesU0.js";import"./noop-DX6rZLP_.js";import"./_isIterateeCall-CaoM3nC8.js";function ln(t){return function(e){e=y(e);var a=rn(e)?on(e):void 0,r=a?a[0]:e.charAt(0),n=a?sn(a,1).join(""):e.slice(1);return r[t]()+n}}var pn=ln("toUpperCase");const un={string:["iContains","iNotContains","iEquals","iNotEquals","iStartsWith","iNotStartsWith","iEndsWith","iNotEndsWith"],number:["equals","notEquals","greaterThan","greaterThanOrEqual","lessThan","lessThanOrEqual"],boolean:["equals"],enum:["equals","notEquals","in","notIn"],uuid:["equals","notEquals","in","notIn"],datetime:["equals","notEquals","before","after"]},cn={string:"iContains",number:"equals",boolean:"equals",enum:"equals",uuid:"equals",datetime:"equals"},Gt=["in","notIn"],dn=[{label:"True",value:"true"},{label:"False",value:"false"}];function De(){return`filter-${Date.now()}-${Math.random().toString(36).substring(2,11)}`}function mn(t,e){const a=t.split(".");if(a.some(n=>n===""||n==="__proto__"||n==="constructor"||n==="prototype"))return{};let r=e;for(let n=a.length-1;n>0;n--)r={[a[n]]:r};return{[a[0]]:r}}function yn(t,e,a="AND"){if(t.length===0)return;const r=[];return t.forEach(n=>{const o=e.find(l=>l.key===n.property);let i;if(((o==null?void 0:o.valueMode)||((o==null?void 0:o.type)==="boolean"?"scalar":"operator"))==="scalar")(o==null?void 0:o.type)==="boolean"?i=n.value===!0||n.value==="true":(o==null?void 0:o.type)==="number"?i=Number(n.value):i=n.value;else if(n.operator==="in"||n.operator==="notIn"){const l=Array.isArray(n.value)?n.value:n.value.split(",").map(c=>c.trim());i={[n.operator]:(o==null?void 0:o.type)==="number"?l.map(Number):l}}else{let l=n.value;(o==null?void 0:o.type)==="number"&&(l=Number(l)),i={[n.operator]:l}}r.push(mn(n.property,i))}),r.length===1?r[0]:{[a]:r}}function Ht(t,e,a=""){const r=[];return Object.keys(t).forEach(n=>{if(n==="AND"||n==="OR"||n==="NOT"||n==="DISTINCT")return;const o=a?`${a}.${n}`:n,i=t[n],d=e.find(l=>l.key===o);d?(d.valueMode||(d.type==="boolean"?"scalar":"operator"))==="scalar"&&typeof i!="object"?r.push({id:De(),property:o,operator:d.implicitOperator||"equals",value:String(i),propertyLabel:d.propertyLabel||o,type:d.type||"string"}):i&&typeof i=="object"&&Object.keys(i).forEach(c=>{const p=i[c];p!=null&&r.push({id:De(),property:o,operator:c,value:Array.isArray(p)?p.join(", "):String(p),propertyLabel:d.propertyLabel||o,type:d.type||"string"})}):i&&typeof i=="object"&&(Object.keys(i).some(p=>["eq","ne","lt","le","gt","ge","contains","notContains","startsWith","endsWith","ilike","in","notIn","isNull"].includes(p))||r.push(...Ht(i,e,o)))}),r}function we(t,e){if(!t)return[];const a=[];if(t.AND||t.OR){const r=t.AND||t.OR;return(Array.isArray(r)?r:[r]).forEach(o=>{a.push(...we(o,e))}),a}return a.push(...Ht(t,e)),a}const Vt=t=>(t==null?void 0:t.valueMode)||((t==null?void 0:t.type)==="boolean"?"scalar":"operator"),Se=t=>t.options??(t.type==="boolean"?dn:void 0),ie=t=>t.strictSelection??t.type==="boolean";function hn(t){return Vt(t)==="scalar"?[t.implicitOperator||"equals"]:t.fixedOperator?[t.fixedOperator]:t.operators||un[t.type||"string"]}function bn(t){return Vt(t)==="scalar"?t.implicitOperator||"equals":t.fixedOperator||t.defaultOperator||cn[t.type]}const gn=(t,e)=>e(`comp:BAIGraphQLPropertyFilter.operator.${pn(t)}`,{defaultValue:t});function fn(t,e,a){if(a)return a;const r=Se(t),n=ie(t);if(xt(Gt,e))return r&&n?{type:"enum_list",values:Oe(r)}:{type:"string_list",searchSource:Te(r),isArbitraryStringAllowed:!0};if(t.type==="datetime")return{type:"date_absolute"};if(t.type==="number")return{type:"float"};if(r&&n)return{type:"enum",values:Oe(r)};const o=Te(r);return o?{type:"string",searchSource:o,isArbitraryStringAllowed:!0}:{type:"string"}}function vn(t,e){const a=t.value;if(xt(Gt,t.operator)){const r=Kt(a)?h(a,y):nn(h(an(y(a),","),Jt));return e&&Se(e)&&ie(e)?{type:"enum_list",value:r}:{type:"string_list",value:r}}if((e==null?void 0:e.type)==="datetime"){const r=Ae(y(a));return{type:"date_absolute",unixSeconds:r.isValid()?r.unix():Ae().unix()}}return(e==null?void 0:e.type)==="number"?{type:"float",value:Number(a)}:e!=null&&e.renderInput?{type:"custom",value:y(a)}:e&&Se(e)&&ie(e)?{type:"enum",value:y(a)}:{type:"string",value:y(a)}}function An(t){switch(t.type){case"empty":return"";case"date_absolute":return Ae.unix(t.unixSeconds).toISOString();case"integer":case"float":return String(t.value);case"string_list":case"enum_list":return[...t.value];case"entity_list":return h(t.value,e=>e.id);case"date_range":return JSON.stringify(t.value);default:return y(t.value??"")}}function Dn(t,e){const a=Le(e,"key");return h(we(t,e),r=>({field:r.property,operator:r.operator,value:vn(r,a[r.property])}))}function Sn(t,e,a="AND",r=!1,n){const o=Le(e,"key"),i=r?en([...t].reverse(),"field").reverse():[...t],d=tn(n)&&i.length>n?n<=0?[]:i.slice(-n):i,l=h(d,c=>{const p=o[c.field];return{id:De(),property:c.field,operator:c.operator,value:An(c.value),propertyLabel:(p==null?void 0:p.propertyLabel)??c.field,type:(p==null?void 0:p.type)??"string"}});return yn(l,e,a)}const ke=t=>{"use memo";var Ee;const e=jt.c(63),{filterProperties:a,value:r,onChange:n,defaultValue:o,combinationMode:i,singleCondition:d,maxConditions:l,label:c,placeholder:p,applyLabel:le,resultCount:pe,contentSearchFieldKey:I,isDisabled:Wt,size:ue,style:ce,className:de,loading:Bt,"data-testid":me}=t,ye=i===void 0?"AND":i,he=d===void 0?!1:d,{t:u}=_t();let P;e[0]!==o||e[1]!==n||e[2]!==r?(P={value:r,defaultValue:o,onChange:n},e[0]=o,e[1]=n,e[2]=r,e[3]=P):P=e[3];const[v,be]=Xt(P);let F;e[4]===Symbol.for("react.memo_cache_sentinel")?(F={},e[4]=F):F=e[4];const Ce=Ut.useRef(F);let q;e[5]===Symbol.for("react.memo_cache_sentinel")?(q={recordLabel:(g,O,T)=>{Ce.current[`${g}::${O}`]=T},resolveLabel:(g,O)=>Ce.current[`${g}::${O}`]??O},e[5]=q):q=e[5];const b=$t(q);let A,D,M;if(e[6]!==I||e[7]!==a||e[8]!==b||e[9]!==u||e[10]!==v){const g=Le(a,"key"),O=we(v,a);let T;e[14]!==a||e[15]!==v?(T=Dn(v,a),e[14]=a,e[15]=v,e[16]=T):T=e[16],D=T;let N;e[17]!==I||e[18]!==a?(N=I??((Ee=Ne(a,Ln))==null?void 0:Ee.key),e[17]=I,e[18]=a,e[19]=N):N=e[19];let k;if(e[20]!==a||e[21]!==b||e[22]!==u){let f;e[24]!==b||e[25]!==u?(f=m=>{const H=b.operatorValueFor(m.key,m.renderInput);return{key:m.key,label:m.propertyLabel,defaultOperator:bn(m),operators:h(hn(m),ve=>({key:ve,label:gn(ve,u),value:fn(m,ve,H)}))}},e[24]=b,e[25]=u,e[26]=f):f=e[26],k=h(a,f),e[20]=a,e[21]=b,e[22]=u,e[23]=k}else k=e[23];let G;e[27]!==N||e[28]!==k?(G={name:"bai-graphql-property-filter",contentSearchFieldKey:N,fields:k},e[27]=N,e[28]=k,e[29]=G):G=e[29],A=G,M=Ne(h(O,f=>{var H;const m=(H=g[f.property])==null?void 0:H.rule;if(m)return m.validate(f.value)?void 0:m.message})),e[6]=I,e[7]=a,e[8]=b,e[9]=u,e[10]=v,e[11]=A,e[12]=D,e[13]=M}else A=e[11],D=e[12],M=e[13];const U=M;let R;e[30]!==ye||e[31]!==a||e[32]!==l||e[33]!==be||e[34]!==he?(R=g=>{be(Sn(g,a,ye,he,l))},e[30]=ye,e[31]=a,e[32]=l,e[33]=be,e[34]=he,e[35]=R):R=e[35];const ge=R;let S;e[36]!==c||e[37]!==u?(S=c??u("comp:BAIPropertyFilter.SearchLabel"),e[36]=c,e[37]=u,e[38]=S):S=e[38];let L;e[39]!==p||e[40]!==u?(L=p??u("comp:BAIPropertyFilter.PlaceHolder"),e[39]=p,e[40]=u,e[41]=L):L=e[41];let w;e[42]!==le||e[43]!==u?(w=le??u("comp:BAIPropertyFilter.Apply"),e[42]=le,e[43]=u,e[44]=w):w=e[44];const fe=Wt||Bt;let C;e[45]!==de?(C=Qt("bai-power-search",de),e[45]=de,e[46]=C):C=e[46];let E;e[47]!==U?(E=U?{type:"error",message:U}:void 0,e[47]=U,e[48]=E):E=e[48];let x;return e[49]!==A||e[50]!==me||e[51]!==D||e[52]!==ge||e[53]!==pe||e[54]!==ue||e[55]!==ce||e[56]!==w||e[57]!==fe||e[58]!==C||e[59]!==E||e[60]!==S||e[61]!==L?(x=se.jsx(zt,{config:A,components:Zt,filters:D,startIcon:Yt,label:S,placeholder:L,popoverSaveButtonLabel:w,resultCount:pe,isDisabled:fe,size:ue,style:ce,className:C,"data-testid":me,status:E,onChange:ge}),e[49]=A,e[50]=me,e[51]=D,e[52]=ge,e[53]=pe,e[54]=ue,e[55]=ce,e[56]=w,e[57]=fe,e[58]=C,e[59]=E,e[60]=S,e[61]=L,e[62]=x):x=e[62],x};function Ln(t){return t.type==="string"&&!ie(t)&&!t.renderInput}const{action:s}=__STORYBOOK_MODULE_ACTIONS__,Ie=[{label:"local:volume1",value:"local:volume1"},{label:"local:volume2",value:"local:volume2"},{label:"nfs:data",value:"nfs:data"}],ka={title:"Filter/BAIGraphQLPropertyFilter",component:ke,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:`
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
        `}},onChange:{description:"Callback when filter value changes",table:{type:{summary:"(value: GraphQLFilter | undefined) => void"}}},loading:{control:{type:"boolean"},description:"Show loading state",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},combinationMode:{control:{type:"radio"},options:["AND","OR"],description:"How to combine multiple filter conditions",table:{type:{summary:"'AND' | 'OR'"},defaultValue:{summary:"AND"}}}},render:t=>{const[e,a]=Ut.useState(t.value);return se.jsx(ke,{...t,value:e,onChange:r=>{var n;(n=t.onChange)==null||n.call(t,r),a(r)}})}},V={name:"Basic Usage",parameters:{docs:{description:{story:"Basic GraphQL property filter with string and boolean properties. Try adding filters and see how they combine into a GraphQL filter object."}}},args:{filterProperties:[{key:"name",propertyLabel:"Name",type:"string",defaultOperator:"iContains"},{key:"description",propertyLabel:"Description",type:"string"},{key:"isActive",propertyLabel:"Active Status",type:"boolean"}],combinationMode:"AND",onChange:s("Filter changed")}},W={name:"Multiple Filters with AND",parameters:{docs:{description:{story:"Demonstrates filters combined with AND operator. All conditions must be satisfied for a match. This is useful when you need strict filtering."}}},args:{filterProperties:[{key:"title",propertyLabel:"Title",type:"string"},{key:"priority",propertyLabel:"Priority",type:"enum",options:[{label:"High",value:"HIGH"},{label:"Medium",value:"MEDIUM"},{label:"Low",value:"LOW"}]},{key:"isUrgent",propertyLabel:"Urgent",type:"boolean"}],combinationMode:"AND",value:{AND:[{title:{iContains:"critical"}},{priority:{equals:"HIGH"}},{isUrgent:!0}]},onChange:s("AND Filter changed")}},B={name:"Multiple Filters with OR",parameters:{docs:{description:{story:"Demonstrates filters combined with OR operator. Any condition can match for a result. This is useful for more flexible, inclusive filtering."}}},args:{filterProperties:[{key:"status",propertyLabel:"Status",type:"enum",options:[{label:"Urgent",value:"URGENT"},{label:"High Priority",value:"HIGH_PRIORITY"},{label:"Normal",value:"NORMAL"}]},{key:"assignee",propertyLabel:"Assignee",type:"string"},{key:"dueToday",propertyLabel:"Due Today",type:"boolean"}],combinationMode:"OR",value:{OR:[{status:{equals:"URGENT"}},{assignee:{iContains:"john"}},{dueToday:!0}]},onChange:s("OR Filter changed")}},j={name:"Number Filters with Comparisons",parameters:{docs:{description:{story:"Shows numeric filtering with comparison operators like greater than, less than, etc. Useful for filtering by quantities, scores, or metrics."}}},args:{filterProperties:[{key:"score",propertyLabel:"Score",type:"number",operators:["equals","notEquals","greaterThan","greaterThanOrEqual","lessThan","lessThanOrEqual"]},{key:"quantity",propertyLabel:"Quantity",type:"number"},{key:"price",propertyLabel:"Price",type:"number",operators:["greaterThan","lessThan","equals"],defaultOperator:"greaterThan"}],combinationMode:"AND",value:{AND:[{score:{greaterThanOrEqual:80}},{quantity:{lessThan:100}}]},onChange:s("Number filter changed")}},_={name:"Enum Filters with Multiple Selection",parameters:{docs:{description:{story:"Demonstrates enum type filtering with in/notIn operators for multiple value selection. Perfect for status fields, categories, or any predefined set of values."}}},args:{filterProperties:[{key:"status",propertyLabel:"Status",type:"enum",options:[{label:"Active",value:"ACTIVE"},{label:"Inactive",value:"INACTIVE"},{label:"Pending",value:"PENDING"},{label:"Archived",value:"ARCHIVED"}],operators:["equals","notEquals","in","notIn"],strictSelection:!0},{key:"category",propertyLabel:"Category",type:"enum",options:[{label:"Frontend",value:"FRONTEND"},{label:"Backend",value:"BACKEND"},{label:"Database",value:"DATABASE"},{label:"DevOps",value:"DEVOPS"}],defaultOperator:"in"}],combinationMode:"AND",value:{AND:[{status:{in:["ACTIVE","PENDING"]}},{category:{notEquals:"DATABASE"}}]},onChange:s("Enum filter changed")}},Q={name:"Complex Combined Filter",parameters:{docs:{description:{story:"Example showing multiple filters with different property types combined with the selected mode (AND/OR) for comprehensive filtering."}}},args:{filterProperties:[{key:"name",propertyLabel:"Name",type:"string"},{key:"email",propertyLabel:"Email",type:"string",operators:["iContains","iStartsWith","iEndsWith"]},{key:"role",propertyLabel:"Role",type:"enum",options:[{label:"Admin",value:"ADMIN"},{label:"User",value:"USER"},{label:"Guest",value:"GUEST"}]},{key:"credits",propertyLabel:"Credits",type:"number"},{key:"isVerified",propertyLabel:"Verified",type:"boolean"}],combinationMode:"AND",value:{AND:[{name:{iContains:"john"}},{email:{iEndsWith:"@company.com"}},{role:{equals:"USER"}},{credits:{greaterThanOrEqual:100}},{isVerified:!0}]},onChange:s("Complex filter changed")}},Y={name:"Custom Validation Rules",parameters:{docs:{description:{story:"Property filter with custom validation rules for data integrity. Shows email validation and strict selection enforcement."}}},args:{filterProperties:[{key:"email",propertyLabel:"Email Address",type:"string",rule:{message:"Please enter a valid email address",validate:t=>/\S+@\S+\.\S+/.test(t)}},{key:"phone",propertyLabel:"Phone Number",type:"string",rule:{message:"Phone number must be 10 digits",validate:t=>/^\d{10}$/.test(t.replace(/\D/g,""))}},{key:"department",propertyLabel:"Department",type:"enum",options:[{label:"Engineering",value:"ENGINEERING"},{label:"Marketing",value:"MARKETING"},{label:"Sales",value:"SALES"},{label:"HR",value:"HR"}],strictSelection:!0}],combinationMode:"AND",onChange:s("Validated filter changed")}},K={name:"Autocomplete Suggestions",parameters:{docs:{description:{story:"Filter with predefined autocomplete options for improved user experience and data consistency."}}},args:{filterProperties:[{key:"country",propertyLabel:"Country",type:"string",options:[{label:"United States",value:"US"},{label:"United Kingdom",value:"UK"},{label:"Canada",value:"CA"},{label:"Australia",value:"AU"},{label:"Germany",value:"DE"},{label:"France",value:"FR"}]},{key:"language",propertyLabel:"Language",type:"string",options:[{label:"English",value:"en"},{label:"Spanish",value:"es"},{label:"French",value:"fr"},{label:"German",value:"de"},{label:"Chinese",value:"zh"},{label:"Japanese",value:"ja"}],defaultOperator:"in"}],combinationMode:"OR",value:{OR:[{country:{equals:"US"}},{language:{in:["en","es"]}}]},onChange:s("Autocomplete filter changed")}},$={parameters:{docs:{description:{story:"GraphQL property filter in its initial state with no applied filters. Start adding filters to see how they combine."}}},args:{filterProperties:[{key:"title",propertyLabel:"Title",type:"string"},{key:"isPublished",propertyLabel:"Published",type:"boolean"},{key:"viewCount",propertyLabel:"View Count",type:"number"}],combinationMode:"AND",onChange:s("Filter changed from empty")}},z={parameters:{docs:{description:{story:"Filter component in loading state, typically shown while fetching schema information or processing complex queries."}}},args:{filterProperties:[{key:"name",propertyLabel:"Name",type:"string"}],loading:!0,combinationMode:"AND",onChange:s("Filter changed")}},Z={name:"Artifact Filter (Real-world Example)",parameters:{docs:{description:{story:"Real-world example matching the ArtifactFilter GraphQL input type with name and status filtering capabilities. Shows how the component would be used in production."}}},args:{filterProperties:[{key:"name",propertyLabel:"Artifact Name",type:"string",operators:["iContains","iEquals","iNotEquals","iStartsWith","iEndsWith"],defaultOperator:"iContains"},{key:"status",propertyLabel:"Artifact Status",type:"enum",options:[{label:"Draft",value:"DRAFT"},{label:"Published",value:"PUBLISHED"},{label:"Archived",value:"ARCHIVED"},{label:"Deleted",value:"DELETED"}],operators:["equals","in"],strictSelection:!0}],combinationMode:"AND",value:{AND:[{name:{iContains:"model"}},{status:{in:["PUBLISHED","DRAFT"]}}]},onChange:s("Artifact filter changed")}},J={name:"Fixed Operator (No Selector)",parameters:{docs:{description:{story:"Demonstrates properties with fixed operators where the operator selector is hidden. Useful when you want to enforce a specific operator for certain fields."}}},args:{filterProperties:[{key:"search",propertyLabel:"Search (always contains)",type:"string",fixedOperator:"iContains"},{key:"username",propertyLabel:"Username (always equals)",type:"string",fixedOperator:"iEquals"},{key:"tags",propertyLabel:"Tags (always in)",type:"string",fixedOperator:"in"},{key:"score",propertyLabel:"Score (flexible)",type:"number",operators:["equals","greaterThan","greaterThanOrEqual","lessThan","lessThanOrEqual"]}],combinationMode:"AND",onChange:s("Fixed operator filter changed")}},X={name:"Toggle Between AND/OR",parameters:{docs:{description:{story:"Example showing how switching between AND and OR combination modes affects the filter logic. Try toggling the combination mode to see how the same conditions behave differently."}}},args:{filterProperties:[{key:"type",propertyLabel:"Type",type:"enum",options:[{label:"Feature",value:"FEATURE"},{label:"Bug",value:"BUG"},{label:"Task",value:"TASK"}]},{key:"priority",propertyLabel:"Priority",type:"enum",options:[{label:"Critical",value:"CRITICAL"},{label:"High",value:"HIGH"},{label:"Medium",value:"MEDIUM"},{label:"Low",value:"LOW"}]},{key:"assignedToMe",propertyLabel:"Assigned to Me",type:"boolean"}],combinationMode:"AND",onChange:s("Filter changed with mode toggle")}},ee={name:"DateTime Filters",parameters:{docs:{description:{story:"Demonstrates datetime filtering with a DatePicker UI. When a datetime property is selected, a date picker with time selection is rendered instead of a text input. Useful for filtering by created_at, updated_at, or other timestamp fields."}}},args:{filterProperties:[{key:"created_at",propertyLabel:"Created At",type:"datetime"},{key:"updated_at",propertyLabel:"Updated At",type:"datetime",defaultOperator:"after"},{key:"name",propertyLabel:"Name",type:"string",defaultOperator:"iContains"},{key:"isActive",propertyLabel:"Active Status",type:"boolean"}],combinationMode:"AND",onChange:s("DateTime filter changed")}},te={name:"DateTime with Pre-applied Filters",parameters:{docs:{description:{story:"DateTime filters with pre-applied conditions showing how datetime values are displayed in filter tags with a human-readable format (YYYY-MM-DD HH:mm)."}}},args:{filterProperties:[{key:"created_at",propertyLabel:"Created At",type:"datetime"},{key:"updated_at",propertyLabel:"Updated At",type:"datetime"},{key:"name",propertyLabel:"Name",type:"string"}],combinationMode:"AND",value:{AND:[{created_at:{after:"2025-01-01T00:00:00.000Z"}},{updated_at:{before:"2025-12-31T23:59:59.000Z"}},{name:{iContains:"test"}}]},onChange:s("DateTime pre-filtered changed")}},ne={name:"UUID Filters",parameters:{docs:{description:{story:"UUID type properties use `equals`, `notEquals`, `in`, `notIn` operators. Combine with a `rule` for format validation."}}},args:{filterProperties:[{key:"projectId",propertyLabel:"Project ID",type:"uuid",rule:{message:"Must be a valid UUID.",validate:t=>/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(t)}},{key:"domainId",propertyLabel:"Domain ID",type:"uuid",defaultOperator:"notEquals"}],combinationMode:"AND",value:{projectId:{equals:"a1b2c3d4-e5f6-7890-abcd-ef1234567890"}},onChange:s("UUID filter changed")}},ae={name:"Custom Input via renderInput",parameters:{docs:{description:{story:"When `renderInput` is provided, the default AutoComplete is replaced with a custom control. The control stages a value via `onAddCondition(value, label?)` and the edit popover's Apply button commits it; feed the render prop's `value` back into the control so the staged pick stays visible. Useful for async selects (e.g., fetching options from an API)."}}},args:{filterProperties:[{key:"name",propertyLabel:"Name",type:"string",defaultOperator:"iContains"},{key:"storageHost",propertyLabel:"Storage Host",type:"string",defaultOperator:"equals",renderInput:({onAddCondition:t,value:e,isDisabled:a})=>se.jsx(Rt,{label:"Storage Host",isLabelHidden:!0,placeholder:"Select storage host",hasSearch:!1,options:Ie,isDisabled:a,value:Ie.find(r=>r.value===e)??null,onChange:r=>{const n=r;t(n==null?void 0:n.value)}})}],combinationMode:"AND",onChange:s("renderInput filter changed")}},re={name:"Scalar valueMode on string field",parameters:{docs:{description:{story:"Demonstrates valueMode='scalar' on a non-boolean field. The filter emits { slugExact: 'my-slug' } without an operator, while tags still display using implicitOperator (default '=')."}}},args:{filterProperties:[{key:"slugExact",propertyLabel:"Slug (scalar exact)",type:"string",valueMode:"scalar",implicitOperator:"equals"},{key:"title",propertyLabel:"Title",type:"string",defaultOperator:"iContains"},{key:"isPublished",propertyLabel:"Published",type:"boolean"}],combinationMode:"AND",value:{AND:[{slugExact:"hello-world"},{isPublished:!0}]},onChange:s("Scalar mode (string) filter changed")}},Pe=[{label:"alice@example.com",value:"owner-uuid-0001"},{label:"bob@example.com",value:"owner-uuid-0002"},{label:"carol@example.com",value:"owner-uuid-0003"}],oe={name:"Custom input (onAddCondition)",parameters:{docs:{description:{story:"A property whose input is a controlled `BAIComplexSelect` supplied via `renderInput`. Selecting an option calls `onAddCondition(value, label)`, which stages the value; the edit popover's Apply button commits it, serialized per `type: 'uuid'` → `{ owner: { id: { equals: <id> } } }`, while the token shows the label (email) instead of the opaque UUID. The render prop's `value` is fed back into the select so the staged pick stays visible."}}},args:{filterProperties:[{key:"owner.id",propertyLabel:"Owner",type:"uuid",fixedOperator:"equals",renderInput:({onAddCondition:t,value:e,isDisabled:a})=>se.jsx(Rt,{label:"Owner",isLabelHidden:!0,placeholder:"Select owner",options:Pe,isDisabled:a,value:Pe.find(r=>r.value===e)??null,onChange:r=>{const n=r;t(n==null?void 0:n.value,n==null?void 0:n.label)}})}],combinationMode:"AND",onChange:s("custom input filter changed")}};var Fe,qe,Me;V.parameters={...V.parameters,docs:{...(Fe=V.parameters)==null?void 0:Fe.docs,source:{originalSource:`{
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
}`,...(Me=(qe=V.parameters)==null?void 0:qe.docs)==null?void 0:Me.source}}};var Ue,Re,xe;W.parameters={...W.parameters,docs:{...(Ue=W.parameters)==null?void 0:Ue.docs,source:{originalSource:`{
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
}`,...(xe=(Re=W.parameters)==null?void 0:Re.docs)==null?void 0:xe.source}}};var Ge,He,Ve;B.parameters={...B.parameters,docs:{...(Ge=B.parameters)==null?void 0:Ge.docs,source:{originalSource:`{
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
}`,...(Ve=(He=B.parameters)==null?void 0:He.docs)==null?void 0:Ve.source}}};var We,Be,je;j.parameters={...j.parameters,docs:{...(We=j.parameters)==null?void 0:We.docs,source:{originalSource:`{
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
}`,...(je=(Be=j.parameters)==null?void 0:Be.docs)==null?void 0:je.source}}};var _e,Qe,Ye;_.parameters={..._.parameters,docs:{...(_e=_.parameters)==null?void 0:_e.docs,source:{originalSource:`{
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
}`,...(Ye=(Qe=_.parameters)==null?void 0:Qe.docs)==null?void 0:Ye.source}}};var Ke,$e,ze;Q.parameters={...Q.parameters,docs:{...(Ke=Q.parameters)==null?void 0:Ke.docs,source:{originalSource:`{
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
}`,...(ze=($e=Q.parameters)==null?void 0:$e.docs)==null?void 0:ze.source}}};var Ze,Je,Xe;Y.parameters={...Y.parameters,docs:{...(Ze=Y.parameters)==null?void 0:Ze.docs,source:{originalSource:`{
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
}`,...(Xe=(Je=Y.parameters)==null?void 0:Je.docs)==null?void 0:Xe.source}}};var et,tt,nt;K.parameters={...K.parameters,docs:{...(et=K.parameters)==null?void 0:et.docs,source:{originalSource:`{
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
}`,...(nt=(tt=K.parameters)==null?void 0:tt.docs)==null?void 0:nt.source}}};var at,rt,ot;$.parameters={...$.parameters,docs:{...(at=$.parameters)==null?void 0:at.docs,source:{originalSource:`{
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
}`,...(ot=(rt=$.parameters)==null?void 0:rt.docs)==null?void 0:ot.source}}};var it,st,lt;z.parameters={...z.parameters,docs:{...(it=z.parameters)==null?void 0:it.docs,source:{originalSource:`{
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
}`,...(lt=(st=z.parameters)==null?void 0:st.docs)==null?void 0:lt.source}}};var pt,ut,ct;Z.parameters={...Z.parameters,docs:{...(pt=Z.parameters)==null?void 0:pt.docs,source:{originalSource:`{
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
}`,...(ct=(ut=Z.parameters)==null?void 0:ut.docs)==null?void 0:ct.source}}};var dt,mt,yt;J.parameters={...J.parameters,docs:{...(dt=J.parameters)==null?void 0:dt.docs,source:{originalSource:`{
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
}`,...(yt=(mt=J.parameters)==null?void 0:mt.docs)==null?void 0:yt.source}}};var ht,bt,gt;X.parameters={...X.parameters,docs:{...(ht=X.parameters)==null?void 0:ht.docs,source:{originalSource:`{
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
}`,...(gt=(bt=X.parameters)==null?void 0:bt.docs)==null?void 0:gt.source}}};var ft,vt,At;ee.parameters={...ee.parameters,docs:{...(ft=ee.parameters)==null?void 0:ft.docs,source:{originalSource:`{
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
}`,...(At=(vt=ee.parameters)==null?void 0:vt.docs)==null?void 0:At.source}}};var Dt,St,Lt;te.parameters={...te.parameters,docs:{...(Dt=te.parameters)==null?void 0:Dt.docs,source:{originalSource:`{
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
}`,...(Lt=(St=te.parameters)==null?void 0:St.docs)==null?void 0:Lt.source}}};var wt,Ct,Et;ne.parameters={...ne.parameters,docs:{...(wt=ne.parameters)==null?void 0:wt.docs,source:{originalSource:`{
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
}`,...(Et=(Ct=ne.parameters)==null?void 0:Ct.docs)==null?void 0:Et.source}}};var Ot,Tt,Nt;ae.parameters={...ae.parameters,docs:{...(Ot=ae.parameters)==null?void 0:Ot.docs,source:{originalSource:`{
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
}`,...(Nt=(Tt=ae.parameters)==null?void 0:Tt.docs)==null?void 0:Nt.source}}};var kt,It,Pt;re.parameters={...re.parameters,docs:{...(kt=re.parameters)==null?void 0:kt.docs,source:{originalSource:`{
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
}`,...(Pt=(It=re.parameters)==null?void 0:It.docs)==null?void 0:Pt.source}}};var Ft,qt,Mt;oe.parameters={...oe.parameters,docs:{...(Ft=oe.parameters)==null?void 0:Ft.docs,source:{originalSource:`{
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
}`,...(Mt=(qt=oe.parameters)==null?void 0:qt.docs)==null?void 0:Mt.source}}};const Ia=["Default","WithANDCombination","WithORCombination","WithNumberFilters","WithEnumFilters","ComplexFilter","WithValidation","WithAutocompleteOptions","EmptyState","LoadingState","ArtifactFilterExample","WithFixedOperator","ToggleCombinationMode","WithDateTimeFilters","WithDateTimePrefiltered","WithUUIDFilters","WithRenderInput","WithScalarValueModeOnString","WithCustomType"];export{Z as ArtifactFilterExample,Q as ComplexFilter,V as Default,$ as EmptyState,z as LoadingState,X as ToggleCombinationMode,W as WithANDCombination,K as WithAutocompleteOptions,oe as WithCustomType,ee as WithDateTimeFilters,te as WithDateTimePrefiltered,_ as WithEnumFilters,J as WithFixedOperator,j as WithNumberFilters,B as WithORCombination,ae as WithRenderInput,re as WithScalarValueModeOnString,ne as WithUUIDFilters,Y as WithValidation,Ia as __namedExportsOrder,ka as default};
