import{i as Pt,c as Vt,a as Wt,r as Ft,j as ie,aH as Bt,aI as ge}from"./iframe-Cmts9fTB.js";import{B as qt}from"./BAIComplexSelect-wIrVY9_e.js";import{u as jt,P as _t,b as Qt,t as Ce,a as Ee}from"./PowerSearch-CRfbOO36.js";import{u as Yt}from"./useControllableValue-BprqtrDQ.js";import{k as De}from"./toLower-BQFKWaYz.js";import{f as Oe}from"./find-k5q0OiBa.js";import{m as h}from"./map-DSPhPigF.js";import{v as Kt,i as Ut}from"./includes-DheUnXdr.js";import{a as $t,b as zt}from"./_baseEach-BlR0Qfaz.js";import{t as y}from"./toString-D25XPtoS.js";import{c as Zt}from"./compact-CU4PNV0P.js";import{s as Jt}from"./split-dxcj-Q5D.js";import{h as Xt,s as en,c as tn}from"./_charsEndIndex-BHSW-HpW.js";import"./preload-helper-Dp1pzeXC.js";import"./useIndicator-CuWcYIGO.js";import"./isRenderable-BUV0eL6r.js";import"./clamp-BgYTNCzC.js";import"./_baseClamp-DVUOCJN_.js";import"./toFinite-e1k8nNFq.js";import"./_trimmedEndIndex-DuQxD0U0.js";import"./isSymbol-5uPYPAcZ.js";import"./filter-BeQHpzYr.js";import"./_baseSlice-F8doVSIJ.js";import"./toInteger-Bx5umqpp.js";import"./usePopover-BTqH1eEs.js";import"./useDevWarning-CdabeqGe.js";import"./rtlStyles-T4i24HtE.js";import"./useResolvedRequired-gVUO3Wbq.js";import"./composeEventHandlers-BolWE7qY.js";import"./InputClearButton-BrjdTywt.js";import"./Divider-CJUaNylU.js";import"./isNumber-jOa3-VKB.js";import"./some-BVXKijKF.js";import"./Token-Ccago-pw.js";import"./SelectorOption-DasrgTX6.js";import"./Item-hnwbBBXn.js";import"./_baseIndexOf-Be9UPhX8.js";import"./_baseFindIndex-Cj99RmFE.js";import"./isEmpty-BaqIIiDL.js";import"./isNil-CHIgUVhi.js";import"./isString-DsP-oNKF.js";import"./characters-DWaYg7k3.js";import"./NumberInput-D6NYid2r.js";import"./useInputStatusIcon-DJLEUQBD.js";import"./InputGroupContext-DYoOwhjd.js";import"./Selector-dmkninrH.js";import"./useTypeahead-GE2IYO10.js";import"./isRtlElement-B2-7SF8s.js";import"./TextInput-BRpwY0QO.js";import"./VStack-CxBr-trT.js";import"./_baseAssignValue-C6Yw9Cn3.js";import"./_defineProperty-CqU61ost.js";import"./get-B4vgFOPa.js";import"./_baseGet-CSM7v9Uw.js";import"./identity-DKeuBCMA.js";import"./_isIterateeCall-D_T2kog1.js";function nn(t){return function(e){e=y(e);var n=Xt(e)?en(e):void 0,a=n?n[0]:e.charAt(0),o=n?tn(n,1).join(""):e.slice(1);return a[t]()+o}}var an=nn("toUpperCase");function rn(t,e,n,a){var o=-1,r=t==null?0:t.length;for(a&&r&&(n=t[++o]);++o<r;)n=e(n,t[o],o,t);return n}function on(t,e,n,a,o){return o(t,function(r,s,l){n=a?(a=!1,r):e(n,r,s,l)}),n}function sn(t,e,n){var a=Pt(t)?rn:on,o=arguments.length<3;return a(t,$t(e),n,o,zt)}const ln={string:["iContains","iNotContains","iEquals","iNotEquals","iStartsWith","iNotStartsWith","iEndsWith","iNotEndsWith"],number:["equals","notEquals","greaterThan","greaterThanOrEqual","lessThan","lessThanOrEqual"],boolean:["equals"],enum:["equals","notEquals","in","notIn"],uuid:["equals","notEquals","in","notIn"],datetime:["equals","notEquals","before","after"]},pn={string:"iContains",number:"equals",boolean:"equals",enum:"equals",uuid:"equals",datetime:"equals"},Mt=["in","notIn"],un=[{label:"True",value:"true"},{label:"False",value:"false"}];function ve(){return`filter-${Date.now()}-${Math.random().toString(36).substring(2,11)}`}function cn(t,e){const n=t.split(".");if(n.some(r=>r===""||r==="__proto__"||r==="constructor"||r==="prototype"))return{};if(n.length===1)return{[t]:e};let a={},o=a;for(let r=0;r<n.length-1;r++)o[n[r]]={},o=o[n[r]];return o[n[n.length-1]]=e,a}function dn(t,e,n="AND"){if(t.length===0)return;const a=[];return t.forEach(o=>{const r=e.find(i=>i.key===o.property);let s;if(((r==null?void 0:r.valueMode)||((r==null?void 0:r.type)==="boolean"?"scalar":"operator"))==="scalar")(r==null?void 0:r.type)==="boolean"?s=o.value===!0||o.value==="true":(r==null?void 0:r.type)==="number"?s=Number(o.value):s=o.value;else if(o.operator==="in"||o.operator==="notIn"){const i=Array.isArray(o.value)?o.value:o.value.split(",").map(m=>m.trim());s={[o.operator]:(r==null?void 0:r.type)==="number"?i.map(Number):i}}else{let i=o.value;(r==null?void 0:r.type)==="number"&&(i=Number(i)),s={[o.operator]:i}}a.push(cn(o.property,s))}),a.length===1?a[0]:{[n]:a}}function Rt(t,e,n=""){const a=[];return Object.keys(t).forEach(o=>{if(o==="AND"||o==="OR"||o==="NOT"||o==="DISTINCT")return;const r=n?`${n}.${o}`:o,s=t[o],l=e.find(i=>i.key===r);l?(l.valueMode||(l.type==="boolean"?"scalar":"operator"))==="scalar"&&typeof s!="object"?a.push({id:ve(),property:r,operator:l.implicitOperator||"equals",value:String(s),propertyLabel:l.propertyLabel||r,type:l.type||"string"}):s&&typeof s=="object"&&Object.keys(s).forEach(m=>{const c=s[m];c!=null&&a.push({id:ve(),property:r,operator:m,value:Array.isArray(c)?c.join(", "):String(c),propertyLabel:l.propertyLabel||r,type:l.type||"string"})}):s&&typeof s=="object"&&(Object.keys(s).some(c=>["eq","ne","lt","le","gt","ge","contains","notContains","startsWith","endsWith","ilike","in","notIn","isNull"].includes(c))||a.push(...Rt(s,e,r)))}),a}function Se(t,e){if(!t)return[];const n=[];if(t.AND||t.OR){const a=t.AND||t.OR;return(Array.isArray(a)?a:[a]).forEach(r=>{n.push(...Se(r,e))}),n}return n.push(...Rt(t,e)),n}const xt=t=>(t==null?void 0:t.valueMode)||((t==null?void 0:t.type)==="boolean"?"scalar":"operator"),Ae=t=>t.options??(t.type==="boolean"?un:void 0),oe=t=>t.strictSelection??t.type==="boolean";function mn(t){return xt(t)==="scalar"?[t.implicitOperator||"equals"]:t.fixedOperator?[t.fixedOperator]:t.operators||ln[t.type||"string"]}function yn(t){return xt(t)==="scalar"?t.implicitOperator||"equals":t.fixedOperator||t.defaultOperator||pn[t.type]}const hn=(t,e)=>e(`comp:BAIGraphQLPropertyFilter.operator.${an(t)}`,{defaultValue:t});function bn(t,e,n){if(n)return n;const a=Ae(t),o=oe(t);if(Ut(Mt,e))return a&&o?{type:"enum_list",values:Ce(a)}:{type:"string_list",searchSource:Ee(a),isArbitraryStringAllowed:!0};if(t.type==="datetime")return{type:"date_absolute"};if(t.type==="number")return{type:"float"};if(a&&o)return{type:"enum",values:Ce(a)};const r=Ee(a);return r?{type:"string",searchSource:r,isArbitraryStringAllowed:!0}:{type:"string"}}function fn(t,e){const n=t.value;if(Ut(Mt,t.operator)){const a=Pt(n)?h(n,y):Zt(h(Jt(y(n),","),Qt));return e&&Ae(e)&&oe(e)?{type:"enum_list",value:a}:{type:"string_list",value:a}}if((e==null?void 0:e.type)==="datetime"){const a=ge(y(n));return{type:"date_absolute",unixSeconds:a.isValid()?a.unix():ge().unix()}}return(e==null?void 0:e.type)==="number"?{type:"float",value:Number(n)}:e!=null&&e.renderInput?{type:"custom",value:y(n)}:e&&Ae(e)&&oe(e)?{type:"enum",value:y(n)}:{type:"string",value:y(n)}}function gn(t){switch(t.type){case"empty":return"";case"date_absolute":return ge.unix(t.unixSeconds).toISOString();case"integer":case"float":return String(t.value);case"string_list":case"enum_list":return[...t.value];case"entity_list":return h(t.value,e=>e.id);case"date_range":return JSON.stringify(t.value);default:return y(t.value??"")}}function vn(t,e){const n=De(e,"key");return h(Se(t,e),a=>({field:a.property,operator:a.operator,value:fn(a,n[a.property])}))}function An(t,e,n="AND",a=!1){const o=De(e,"key"),r=a?Kt(sn(t,(l,i)=>({...l,[i.field]:i}),{})):[...t],s=h(r,l=>{const i=o[l.field];return{id:ve(),property:l.field,operator:l.operator,value:gn(l.value),propertyLabel:(i==null?void 0:i.propertyLabel)??l.field,type:(i==null?void 0:i.type)??"string"}});return dn(s,e,n)}const Te=t=>{"use memo";var Le;const e=Vt.c(60),{filterProperties:n,value:a,onChange:o,defaultValue:r,combinationMode:s,singleCondition:l,label:i,placeholder:m,applyLabel:c,resultCount:se,contentSearchFieldKey:I,isDisabled:Gt,size:le,style:pe,className:ue,loading:Ht,"data-testid":ce}=t,de=s===void 0?"AND":s,me=l===void 0?!1:l,{t:u}=Wt();let k;e[0]!==r||e[1]!==o||e[2]!==a?(k={value:a,defaultValue:r,onChange:o},e[0]=r,e[1]=o,e[2]=a,e[3]=k):k=e[3];const[v,ye]=Yt(k);let P;e[4]===Symbol.for("react.memo_cache_sentinel")?(P={},e[4]=P):P=e[4];const we=Ft.useRef(P);let F;e[5]===Symbol.for("react.memo_cache_sentinel")?(F={recordLabel:(f,E,O)=>{we.current[`${f}::${E}`]=O},resolveLabel:(f,E)=>we.current[`${f}::${E}`]??E},e[5]=F):F=e[5];const b=jt(F);let A,D,q;if(e[6]!==I||e[7]!==n||e[8]!==b||e[9]!==u||e[10]!==v){const f=De(n,"key"),E=Se(v,n);let O;e[14]!==n||e[15]!==v?(O=vn(v,n),e[14]=n,e[15]=v,e[16]=O):O=e[16],D=O;let T;e[17]!==I||e[18]!==n?(T=I??((Le=Oe(n,Dn))==null?void 0:Le.key),e[17]=I,e[18]=n,e[19]=T):T=e[19];let N;if(e[20]!==n||e[21]!==b||e[22]!==u){let g;e[24]!==b||e[25]!==u?(g=d=>{const G=b.operatorValueFor(d.key,d.renderInput);return{key:d.key,label:d.propertyLabel,defaultOperator:yn(d),operators:h(mn(d),fe=>({key:fe,label:hn(fe,u),value:bn(d,fe,G)}))}},e[24]=b,e[25]=u,e[26]=g):g=e[26],N=h(n,g),e[20]=n,e[21]=b,e[22]=u,e[23]=N}else N=e[23];let x;e[27]!==T||e[28]!==N?(x={name:"bai-graphql-property-filter",contentSearchFieldKey:T,fields:N},e[27]=T,e[28]=N,e[29]=x):x=e[29],A=x,q=Oe(h(E,g=>{var G;const d=(G=f[g.property])==null?void 0:G.rule;if(d)return d.validate(g.value)?void 0:d.message})),e[6]=I,e[7]=n,e[8]=b,e[9]=u,e[10]=v,e[11]=A,e[12]=D,e[13]=q}else A=e[11],D=e[12],q=e[13];const U=q;let M;e[30]!==de||e[31]!==n||e[32]!==ye||e[33]!==me?(M=f=>{ye(An(f,n,de,me))},e[30]=de,e[31]=n,e[32]=ye,e[33]=me,e[34]=M):M=e[34];const he=M;let S;e[35]!==i||e[36]!==u?(S=i??u("comp:BAIPropertyFilter.SearchLabel"),e[35]=i,e[36]=u,e[37]=S):S=e[37];let w;e[38]!==m||e[39]!==u?(w=m??u("comp:BAIPropertyFilter.PlaceHolder"),e[38]=m,e[39]=u,e[40]=w):w=e[40];let L;e[41]!==c||e[42]!==u?(L=c??u("comp:BAIPropertyFilter.Apply"),e[41]=c,e[42]=u,e[43]=L):L=e[43];const be=Gt||Ht;let C;e[44]!==U?(C=U?{type:"error",message:U}:void 0,e[44]=U,e[45]=C):C=e[45];let R;return e[46]!==ue||e[47]!==A||e[48]!==ce||e[49]!==D||e[50]!==he||e[51]!==se||e[52]!==le||e[53]!==pe||e[54]!==L||e[55]!==be||e[56]!==C||e[57]!==S||e[58]!==w?(R=ie.jsx(_t,{config:A,filters:D,startIcon:Bt,label:S,placeholder:w,popoverSaveButtonLabel:L,resultCount:se,isDisabled:be,size:le,style:pe,className:ue,"data-testid":ce,status:C,onChange:he}),e[46]=ue,e[47]=A,e[48]=ce,e[49]=D,e[50]=he,e[51]=se,e[52]=le,e[53]=pe,e[54]=L,e[55]=be,e[56]=C,e[57]=S,e[58]=w,e[59]=R):R=e[59],R};function Dn(t){return t.type==="string"&&!oe(t)&&!t.renderInput}const{action:p}=__STORYBOOK_MODULE_ACTIONS__,Ca={title:"Filter/BAIGraphQLPropertyFilter",component:Te,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:`
**BAIGraphQLPropertyFilter** is an advanced filtering component designed for GraphQL-based Backend.AI applications. It provides a sophisticated interface for constructing GraphQL filter objects with support for:

- **GraphQL Filter Types**: Compatible with standard GraphQL filter schemas including StringFilter, IntFilter, BooleanFilter, EnumFilter, and DateTimeFilter
- **Flexible Combination Mode**: Choose between AND or OR operators to combine multiple filter conditions
- **Rich Operator Set**: Case-insensitive string operators (iContains, iEquals, iStartsWith, iEndsWith, etc.) and comparison operators (greaterThan, greaterThanOrEqual, lessThan, lessThanOrEqual, in, notIn)
- **Type-Safe Filtering**: Automatic type detection and operator suggestions based on property types
- **Bidirectional Conversion**: Seamless conversion between UI conditions and GraphQL filter objects

New in this version:
- **DateTime support**: When a property has type 'datetime', a DatePicker with time selection is rendered instead of a text input. Values are serialized as ISO strings and displayed in filter tags as 'YYYY-MM-DD HH:mm'.
- **UUID support**: UUID type properties use \`equals\`, \`notEquals\`, \`in\`, \`notIn\` operators and support validation rules.
- **Custom input via \`renderInput\`**: Replace the default AutoComplete input with any controlled control (e.g., a user/domain picker or async select). The control commits a condition via \`onAddCondition(value, label?)\` as soon as a value is selected (so a single-select picker confirms on selection); pass a human-readable \`label\` when the committed value is opaque (e.g. a UUID) so the condition tag shows the label instead. Give the control \`value={null}\` so it stays controlled and clears after each commit. Keep using a built-in \`type\` (e.g. \`uuid\`) that matches what the control emits.
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
  // control (e.g. BAIUserSelect). \`onAddCondition(value, label?)\` commits the
  // value as a condition immediately (single-select pickers confirm on
  // selection) and serializes it per the property's \`type\`. Pass a
  // human-readable \`label\` when the value is opaque (e.g. a UUID) so the
  // condition tag stays readable. Give the control \`value={null}\` so it
  // stays controlled and clears after each commit.
  renderInput?: (props: {
    onAddCondition: (value: string | undefined, label?: string) => void;
  }) => ReactNode;
}
        `}},value:{control:{type:"object"},description:"Current GraphQL filter object",table:{type:{summary:"GraphQLFilter"},detail:`
GraphQLFilter = {
  [property: string]: FilterValue;
  AND?: GraphQLFilter[];
  OR?: GraphQLFilter[];
}
        `}},onChange:{description:"Callback when filter value changes",table:{type:{summary:"(value: GraphQLFilter | undefined) => void"}}},loading:{control:{type:"boolean"},description:"Show loading state",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},combinationMode:{control:{type:"radio"},options:["AND","OR"],description:"How to combine multiple filter conditions",table:{type:{summary:"'AND' | 'OR'"},defaultValue:{summary:"AND"}}}},render:t=>{const[e,n]=Ft.useState(t.value);return ie.jsx(Te,{...t,value:e,onChange:a=>{var o;(o=t.onChange)==null||o.call(t,a),n(a)}})}},H={name:"Basic Usage",parameters:{docs:{description:{story:"Basic GraphQL property filter with string and boolean properties. Try adding filters and see how they combine into a GraphQL filter object."}}},args:{filterProperties:[{key:"name",propertyLabel:"Name",type:"string",defaultOperator:"iContains"},{key:"description",propertyLabel:"Description",type:"string"},{key:"isActive",propertyLabel:"Active Status",type:"boolean"}],combinationMode:"AND",onChange:p("Filter changed")}},V={name:"Multiple Filters with AND",parameters:{docs:{description:{story:"Demonstrates filters combined with AND operator. All conditions must be satisfied for a match. This is useful when you need strict filtering."}}},args:{filterProperties:[{key:"title",propertyLabel:"Title",type:"string"},{key:"priority",propertyLabel:"Priority",type:"enum",options:[{label:"High",value:"HIGH"},{label:"Medium",value:"MEDIUM"},{label:"Low",value:"LOW"}]},{key:"isUrgent",propertyLabel:"Urgent",type:"boolean"}],combinationMode:"AND",value:{AND:[{title:{iContains:"critical"}},{priority:{equals:"HIGH"}},{isUrgent:!0}]},onChange:p("AND Filter changed")}},W={name:"Multiple Filters with OR",parameters:{docs:{description:{story:"Demonstrates filters combined with OR operator. Any condition can match for a result. This is useful for more flexible, inclusive filtering."}}},args:{filterProperties:[{key:"status",propertyLabel:"Status",type:"enum",options:[{label:"Urgent",value:"URGENT"},{label:"High Priority",value:"HIGH_PRIORITY"},{label:"Normal",value:"NORMAL"}]},{key:"assignee",propertyLabel:"Assignee",type:"string"},{key:"dueToday",propertyLabel:"Due Today",type:"boolean"}],combinationMode:"OR",value:{OR:[{status:{equals:"URGENT"}},{assignee:{iContains:"john"}},{dueToday:!0}]},onChange:p("OR Filter changed")}},B={name:"Number Filters with Comparisons",parameters:{docs:{description:{story:"Shows numeric filtering with comparison operators like greater than, less than, etc. Useful for filtering by quantities, scores, or metrics."}}},args:{filterProperties:[{key:"score",propertyLabel:"Score",type:"number",operators:["equals","notEquals","greaterThan","greaterThanOrEqual","lessThan","lessThanOrEqual"]},{key:"quantity",propertyLabel:"Quantity",type:"number"},{key:"price",propertyLabel:"Price",type:"number",operators:["greaterThan","lessThan","equals"],defaultOperator:"greaterThan"}],combinationMode:"AND",value:{AND:[{score:{greaterThanOrEqual:80}},{quantity:{lessThan:100}}]},onChange:p("Number filter changed")}},j={name:"Enum Filters with Multiple Selection",parameters:{docs:{description:{story:"Demonstrates enum type filtering with in/notIn operators for multiple value selection. Perfect for status fields, categories, or any predefined set of values."}}},args:{filterProperties:[{key:"status",propertyLabel:"Status",type:"enum",options:[{label:"Active",value:"ACTIVE"},{label:"Inactive",value:"INACTIVE"},{label:"Pending",value:"PENDING"},{label:"Archived",value:"ARCHIVED"}],operators:["equals","notEquals","in","notIn"],strictSelection:!0},{key:"category",propertyLabel:"Category",type:"enum",options:[{label:"Frontend",value:"FRONTEND"},{label:"Backend",value:"BACKEND"},{label:"Database",value:"DATABASE"},{label:"DevOps",value:"DEVOPS"}],defaultOperator:"in"}],combinationMode:"AND",value:{AND:[{status:{in:["ACTIVE","PENDING"]}},{category:{notEquals:"DATABASE"}}]},onChange:p("Enum filter changed")}},_={name:"Complex Combined Filter",parameters:{docs:{description:{story:"Example showing multiple filters with different property types combined with the selected mode (AND/OR) for comprehensive filtering."}}},args:{filterProperties:[{key:"name",propertyLabel:"Name",type:"string"},{key:"email",propertyLabel:"Email",type:"string",operators:["iContains","iStartsWith","iEndsWith"]},{key:"role",propertyLabel:"Role",type:"enum",options:[{label:"Admin",value:"ADMIN"},{label:"User",value:"USER"},{label:"Guest",value:"GUEST"}]},{key:"credits",propertyLabel:"Credits",type:"number"},{key:"isVerified",propertyLabel:"Verified",type:"boolean"}],combinationMode:"AND",value:{AND:[{name:{iContains:"john"}},{email:{iEndsWith:"@company.com"}},{role:{equals:"USER"}},{credits:{greaterThanOrEqual:100}},{isVerified:!0}]},onChange:p("Complex filter changed")}},Q={name:"Custom Validation Rules",parameters:{docs:{description:{story:"Property filter with custom validation rules for data integrity. Shows email validation and strict selection enforcement."}}},args:{filterProperties:[{key:"email",propertyLabel:"Email Address",type:"string",rule:{message:"Please enter a valid email address",validate:t=>/\S+@\S+\.\S+/.test(t)}},{key:"phone",propertyLabel:"Phone Number",type:"string",rule:{message:"Phone number must be 10 digits",validate:t=>/^\d{10}$/.test(t.replace(/\D/g,""))}},{key:"department",propertyLabel:"Department",type:"enum",options:[{label:"Engineering",value:"ENGINEERING"},{label:"Marketing",value:"MARKETING"},{label:"Sales",value:"SALES"},{label:"HR",value:"HR"}],strictSelection:!0}],combinationMode:"AND",onChange:p("Validated filter changed")}},Y={name:"Autocomplete Suggestions",parameters:{docs:{description:{story:"Filter with predefined autocomplete options for improved user experience and data consistency."}}},args:{filterProperties:[{key:"country",propertyLabel:"Country",type:"string",options:[{label:"United States",value:"US"},{label:"United Kingdom",value:"UK"},{label:"Canada",value:"CA"},{label:"Australia",value:"AU"},{label:"Germany",value:"DE"},{label:"France",value:"FR"}]},{key:"language",propertyLabel:"Language",type:"string",options:[{label:"English",value:"en"},{label:"Spanish",value:"es"},{label:"French",value:"fr"},{label:"German",value:"de"},{label:"Chinese",value:"zh"},{label:"Japanese",value:"ja"}],defaultOperator:"in"}],combinationMode:"OR",value:{OR:[{country:{equals:"US"}},{language:{in:["en","es"]}}]},onChange:p("Autocomplete filter changed")}},K={parameters:{docs:{description:{story:"GraphQL property filter in its initial state with no applied filters. Start adding filters to see how they combine."}}},args:{filterProperties:[{key:"title",propertyLabel:"Title",type:"string"},{key:"isPublished",propertyLabel:"Published",type:"boolean"},{key:"viewCount",propertyLabel:"View Count",type:"number"}],combinationMode:"AND",onChange:p("Filter changed from empty")}},$={parameters:{docs:{description:{story:"Filter component in loading state, typically shown while fetching schema information or processing complex queries."}}},args:{filterProperties:[{key:"name",propertyLabel:"Name",type:"string"}],loading:!0,combinationMode:"AND",onChange:p("Filter changed")}},z={name:"Artifact Filter (Real-world Example)",parameters:{docs:{description:{story:"Real-world example matching the ArtifactFilter GraphQL input type with name and status filtering capabilities. Shows how the component would be used in production."}}},args:{filterProperties:[{key:"name",propertyLabel:"Artifact Name",type:"string",operators:["iContains","iEquals","iNotEquals","iStartsWith","iEndsWith"],defaultOperator:"iContains"},{key:"status",propertyLabel:"Artifact Status",type:"enum",options:[{label:"Draft",value:"DRAFT"},{label:"Published",value:"PUBLISHED"},{label:"Archived",value:"ARCHIVED"},{label:"Deleted",value:"DELETED"}],operators:["equals","in"],strictSelection:!0}],combinationMode:"AND",value:{AND:[{name:{iContains:"model"}},{status:{in:["PUBLISHED","DRAFT"]}}]},onChange:p("Artifact filter changed")}},Z={name:"Fixed Operator (No Selector)",parameters:{docs:{description:{story:"Demonstrates properties with fixed operators where the operator selector is hidden. Useful when you want to enforce a specific operator for certain fields."}}},args:{filterProperties:[{key:"search",propertyLabel:"Search (always contains)",type:"string",fixedOperator:"iContains"},{key:"username",propertyLabel:"Username (always equals)",type:"string",fixedOperator:"iEquals"},{key:"tags",propertyLabel:"Tags (always in)",type:"string",fixedOperator:"in"},{key:"score",propertyLabel:"Score (flexible)",type:"number",operators:["equals","greaterThan","greaterThanOrEqual","lessThan","lessThanOrEqual"]}],combinationMode:"AND",onChange:p("Fixed operator filter changed")}},J={name:"Toggle Between AND/OR",parameters:{docs:{description:{story:"Example showing how switching between AND and OR combination modes affects the filter logic. Try toggling the combination mode to see how the same conditions behave differently."}}},args:{filterProperties:[{key:"type",propertyLabel:"Type",type:"enum",options:[{label:"Feature",value:"FEATURE"},{label:"Bug",value:"BUG"},{label:"Task",value:"TASK"}]},{key:"priority",propertyLabel:"Priority",type:"enum",options:[{label:"Critical",value:"CRITICAL"},{label:"High",value:"HIGH"},{label:"Medium",value:"MEDIUM"},{label:"Low",value:"LOW"}]},{key:"assignedToMe",propertyLabel:"Assigned to Me",type:"boolean"}],combinationMode:"AND",onChange:p("Filter changed with mode toggle")}},X={name:"DateTime Filters",parameters:{docs:{description:{story:"Demonstrates datetime filtering with a DatePicker UI. When a datetime property is selected, a date picker with time selection is rendered instead of a text input. Useful for filtering by created_at, updated_at, or other timestamp fields."}}},args:{filterProperties:[{key:"created_at",propertyLabel:"Created At",type:"datetime"},{key:"updated_at",propertyLabel:"Updated At",type:"datetime",defaultOperator:"after"},{key:"name",propertyLabel:"Name",type:"string",defaultOperator:"iContains"},{key:"isActive",propertyLabel:"Active Status",type:"boolean"}],combinationMode:"AND",onChange:p("DateTime filter changed")}},ee={name:"DateTime with Pre-applied Filters",parameters:{docs:{description:{story:"DateTime filters with pre-applied conditions showing how datetime values are displayed in filter tags with a human-readable format (YYYY-MM-DD HH:mm)."}}},args:{filterProperties:[{key:"created_at",propertyLabel:"Created At",type:"datetime"},{key:"updated_at",propertyLabel:"Updated At",type:"datetime"},{key:"name",propertyLabel:"Name",type:"string"}],combinationMode:"AND",value:{AND:[{created_at:{after:"2025-01-01T00:00:00.000Z"}},{updated_at:{before:"2025-12-31T23:59:59.000Z"}},{name:{iContains:"test"}}]},onChange:p("DateTime pre-filtered changed")}},te={name:"UUID Filters",parameters:{docs:{description:{story:"UUID type properties use `equals`, `notEquals`, `in`, `notIn` operators. Combine with a `rule` for format validation."}}},args:{filterProperties:[{key:"projectId",propertyLabel:"Project ID",type:"uuid",rule:{message:"Must be a valid UUID.",validate:t=>/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(t)}},{key:"domainId",propertyLabel:"Domain ID",type:"uuid",defaultOperator:"notEquals"}],combinationMode:"AND",value:{projectId:{equals:"a1b2c3d4-e5f6-7890-abcd-ef1234567890"}},onChange:p("UUID filter changed")}},ne={name:"Custom Input via renderInput",parameters:{docs:{description:{story:"When `renderInput` is provided, the default AutoComplete is replaced with a custom control. The control commits a condition via `onAddCondition(value, label?)` as soon as it emits a non-empty value; keep it controlled with `value={null}` so it clears after each commit. Useful for async selects (e.g., fetching options from an API)."}}},args:{filterProperties:[{key:"name",propertyLabel:"Name",type:"string",defaultOperator:"iContains"},{key:"storageHost",propertyLabel:"Storage Host",type:"string",defaultOperator:"equals",renderInput:({onAddCondition:t})=>ie.jsx(qt,{label:"Storage Host",isLabelHidden:!0,placeholder:"Select storage host",width:180,hasSearch:!1,options:[{label:"local:volume1",value:"local:volume1"},{label:"local:volume2",value:"local:volume2"},{label:"nfs:data",value:"nfs:data"}],value:null,onChange:e=>{const n=e;t(n==null?void 0:n.value)}})}],combinationMode:"AND",onChange:p("renderInput filter changed")}},ae={name:"Scalar valueMode on string field",parameters:{docs:{description:{story:"Demonstrates valueMode='scalar' on a non-boolean field. The filter emits { slugExact: 'my-slug' } without an operator, while tags still display using implicitOperator (default '=')."}}},args:{filterProperties:[{key:"slugExact",propertyLabel:"Slug (scalar exact)",type:"string",valueMode:"scalar",implicitOperator:"equals"},{key:"title",propertyLabel:"Title",type:"string",defaultOperator:"iContains"},{key:"isPublished",propertyLabel:"Published",type:"boolean"}],combinationMode:"AND",value:{AND:[{slugExact:"hello-world"},{isPublished:!0}]},onChange:p("Scalar mode (string) filter changed")}},Sn=[{label:"alice@example.com",value:"owner-uuid-0001"},{label:"bob@example.com",value:"owner-uuid-0002"},{label:"carol@example.com",value:"owner-uuid-0003"}],re={name:"Custom input (onAddCondition)",parameters:{docs:{description:{story:"A property whose input is a controlled antd Select supplied via `renderInput`. Selecting an option calls `onAddCondition(value, label)` — the filter commits the value as a condition serialized per `type: 'uuid'` → `{ owner: { id: { equals: <id> } } }`, while the condition tag shows the label (email) instead of the opaque UUID."}}},args:{filterProperties:[{key:"owner.id",propertyLabel:"Owner",type:"uuid",fixedOperator:"equals",renderInput:({onAddCondition:t})=>ie.jsx(qt,{label:"Owner",isLabelHidden:!0,placeholder:"Select owner",width:220,options:Sn,value:null,onChange:e=>{const n=e;t(n==null?void 0:n.value,n==null?void 0:n.label)}})}],combinationMode:"AND",onChange:p("custom input filter changed")}};var Ne,Ie,ke;H.parameters={...H.parameters,docs:{...(Ne=H.parameters)==null?void 0:Ne.docs,source:{originalSource:`{
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
}`,...(ke=(Ie=H.parameters)==null?void 0:Ie.docs)==null?void 0:ke.source}}};var Pe,Fe,qe;V.parameters={...V.parameters,docs:{...(Pe=V.parameters)==null?void 0:Pe.docs,source:{originalSource:`{
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
}`,...(qe=(Fe=V.parameters)==null?void 0:Fe.docs)==null?void 0:qe.source}}};var Ue,Me,Re;W.parameters={...W.parameters,docs:{...(Ue=W.parameters)==null?void 0:Ue.docs,source:{originalSource:`{
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
}`,...(Re=(Me=W.parameters)==null?void 0:Me.docs)==null?void 0:Re.source}}};var xe,Ge,He;B.parameters={...B.parameters,docs:{...(xe=B.parameters)==null?void 0:xe.docs,source:{originalSource:`{
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
}`,...(He=(Ge=B.parameters)==null?void 0:Ge.docs)==null?void 0:He.source}}};var Ve,We,Be;j.parameters={...j.parameters,docs:{...(Ve=j.parameters)==null?void 0:Ve.docs,source:{originalSource:`{
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
}`,...(Be=(We=j.parameters)==null?void 0:We.docs)==null?void 0:Be.source}}};var je,_e,Qe;_.parameters={..._.parameters,docs:{...(je=_.parameters)==null?void 0:je.docs,source:{originalSource:`{
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
}`,...(Qe=(_e=_.parameters)==null?void 0:_e.docs)==null?void 0:Qe.source}}};var Ye,Ke,$e;Q.parameters={...Q.parameters,docs:{...(Ye=Q.parameters)==null?void 0:Ye.docs,source:{originalSource:`{
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
}`,...($e=(Ke=Q.parameters)==null?void 0:Ke.docs)==null?void 0:$e.source}}};var ze,Ze,Je;Y.parameters={...Y.parameters,docs:{...(ze=Y.parameters)==null?void 0:ze.docs,source:{originalSource:`{
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
}`,...(Je=(Ze=Y.parameters)==null?void 0:Ze.docs)==null?void 0:Je.source}}};var Xe,et,tt;K.parameters={...K.parameters,docs:{...(Xe=K.parameters)==null?void 0:Xe.docs,source:{originalSource:`{
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
}`,...(tt=(et=K.parameters)==null?void 0:et.docs)==null?void 0:tt.source}}};var nt,at,rt;$.parameters={...$.parameters,docs:{...(nt=$.parameters)==null?void 0:nt.docs,source:{originalSource:`{
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
}`,...(rt=(at=$.parameters)==null?void 0:at.docs)==null?void 0:rt.source}}};var ot,it,st;z.parameters={...z.parameters,docs:{...(ot=z.parameters)==null?void 0:ot.docs,source:{originalSource:`{
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
}`,...(st=(it=z.parameters)==null?void 0:it.docs)==null?void 0:st.source}}};var lt,pt,ut;Z.parameters={...Z.parameters,docs:{...(lt=Z.parameters)==null?void 0:lt.docs,source:{originalSource:`{
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
}`,...(ut=(pt=Z.parameters)==null?void 0:pt.docs)==null?void 0:ut.source}}};var ct,dt,mt;J.parameters={...J.parameters,docs:{...(ct=J.parameters)==null?void 0:ct.docs,source:{originalSource:`{
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
}`,...(mt=(dt=J.parameters)==null?void 0:dt.docs)==null?void 0:mt.source}}};var yt,ht,bt;X.parameters={...X.parameters,docs:{...(yt=X.parameters)==null?void 0:yt.docs,source:{originalSource:`{
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
}`,...(bt=(ht=X.parameters)==null?void 0:ht.docs)==null?void 0:bt.source}}};var ft,gt,vt;ee.parameters={...ee.parameters,docs:{...(ft=ee.parameters)==null?void 0:ft.docs,source:{originalSource:`{
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
}`,...(vt=(gt=ee.parameters)==null?void 0:gt.docs)==null?void 0:vt.source}}};var At,Dt,St;te.parameters={...te.parameters,docs:{...(At=te.parameters)==null?void 0:At.docs,source:{originalSource:`{
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
}`,...(St=(Dt=te.parameters)==null?void 0:Dt.docs)==null?void 0:St.source}}};var wt,Lt,Ct;ne.parameters={...ne.parameters,docs:{...(wt=ne.parameters)==null?void 0:wt.docs,source:{originalSource:`{
  name: 'Custom Input via renderInput',
  parameters: {
    docs: {
      description: {
        story: 'When \`renderInput\` is provided, the default AutoComplete is replaced with a custom control. The control commits a condition via \`onAddCondition(value, label?)\` as soon as it emits a non-empty value; keep it controlled with \`value={null}\` so it clears after each commit. Useful for async selects (e.g., fetching options from an API).'
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
        onAddCondition
      }) => <BAIComplexSelect label="Storage Host" isLabelHidden placeholder="Select storage host" width={180} hasSearch={false} options={[{
        label: 'local:volume1',
        value: 'local:volume1'
      }, {
        label: 'local:volume2',
        value: 'local:volume2'
      }, {
        label: 'nfs:data',
        value: 'nfs:data'
      }]} value={null} onChange={next => {
        const labeled = next as BAILabeledValue | null;
        onAddCondition(labeled?.value);
      }} />
    }],
    combinationMode: 'AND',
    onChange: action('renderInput filter changed')
  }
}`,...(Ct=(Lt=ne.parameters)==null?void 0:Lt.docs)==null?void 0:Ct.source}}};var Et,Ot,Tt;ae.parameters={...ae.parameters,docs:{...(Et=ae.parameters)==null?void 0:Et.docs,source:{originalSource:`{
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
}`,...(Tt=(Ot=ae.parameters)==null?void 0:Ot.docs)==null?void 0:Tt.source}}};var Nt,It,kt;re.parameters={...re.parameters,docs:{...(Nt=re.parameters)==null?void 0:Nt.docs,source:{originalSource:`{
  name: 'Custom input (onAddCondition)',
  parameters: {
    docs: {
      description: {
        story: "A property whose input is a controlled antd Select supplied via \`renderInput\`. Selecting an option calls \`onAddCondition(value, label)\` — the filter commits the value as a condition serialized per \`type: 'uuid'\` → \`{ owner: { id: { equals: <id> } } }\`, while the condition tag shows the label (email) instead of the opaque UUID."
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
        onAddCondition
      }) => <BAIComplexSelect label="Owner" isLabelHidden placeholder="Select owner" width={220} options={sampleOwnerOptions} value={null} onChange={next => {
        const labeled = next as BAILabeledValue | null;
        onAddCondition(labeled?.value, labeled?.label);
      }} />
    }],
    combinationMode: 'AND',
    onChange: action('custom input filter changed')
  }
}`,...(kt=(It=re.parameters)==null?void 0:It.docs)==null?void 0:kt.source}}};const Ea=["Default","WithANDCombination","WithORCombination","WithNumberFilters","WithEnumFilters","ComplexFilter","WithValidation","WithAutocompleteOptions","EmptyState","LoadingState","ArtifactFilterExample","WithFixedOperator","ToggleCombinationMode","WithDateTimeFilters","WithDateTimePrefiltered","WithUUIDFilters","WithRenderInput","WithScalarValueModeOnString","WithCustomType"];export{z as ArtifactFilterExample,_ as ComplexFilter,H as Default,K as EmptyState,$ as LoadingState,J as ToggleCombinationMode,V as WithANDCombination,Y as WithAutocompleteOptions,re as WithCustomType,X as WithDateTimeFilters,ee as WithDateTimePrefiltered,j as WithEnumFilters,Z as WithFixedOperator,B as WithNumberFilters,W as WithORCombination,ne as WithRenderInput,ae as WithScalarValueModeOnString,te as WithUUIDFilters,Q as WithValidation,Ea as __namedExportsOrder,Ca as default};
