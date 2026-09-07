import{i as Ue,c as on,a as sn,r as Te,j as le,a4 as ln,a5 as Oe}from"./iframe-DQyDlNoi.js";import{B as zt}from"./BAIComplexSelect-6FWb4XPk.js";import{u as pn,a as un,b as dn,g as cn,P as mn,e as yn,t as $t,d as hn,c as Re,f as Ge}from"./PowerSearch-Bqm0oARL.js";import{u as bn}from"./useControllableValue-DKrpE_Oa.js";import{k as qe,f as fn}from"./toLower-BqkDQ4ac.js";import{f as gn,v as vn,i as pe}from"./includes-DBtkf1E5.js";import{j as Zt}from"./join-DKskq_cE.js";import{m}from"./map-Pf-BoDz3.js";import{f as We}from"./find-BGcNrsnD.js";import{b as An,a as wn}from"./_baseEach-DHg76Yo0.js";import{t as y}from"./toString-QeyqdGe2.js";import{c as ie}from"./compact-CU4PNV0P.js";import{s as Jt}from"./split-1yyWIX8J.js";import{s as Dn}from"./startsWith-BTgZZfxe.js";import{h as Sn,s as En,c as Ln}from"./_charsEndIndex-BHSW-HpW.js";import"./preload-helper-Dp1pzeXC.js";import"./useIndicator-B4v0YbsA.js";import"./isRenderable-BUV0eL6r.js";import"./clamp-ChcY2vcD.js";import"./_baseClamp-DVUOCJN_.js";import"./toFinite-D1TPVbtu.js";import"./_trimmedEndIndex-DuQxD0U0.js";import"./isSymbol-Bjpfwfvi.js";import"./filter-BqPmj8F_.js";import"./_baseSlice-F8doVSIJ.js";import"./toInteger-DVlIK_hc.js";import"./usePopover-Ca7P4ch1.js";import"./useDevWarning-Bbj3arAX.js";import"./rtlStyles-T4i24HtE.js";import"./useResolvedRequired-B1h4qgav.js";import"./composeEventHandlers-BolWE7qY.js";import"./InputClearButton-BvQuNhlr.js";import"./Divider-C41VzDuu.js";import"./isNumber-BasY-z_2.js";import"./some-LORUDOiS.js";import"./Token-BewEStKM.js";import"./SelectorOption-DVEW4_p8.js";import"./Item-BlArs8iC.js";import"./_baseAssignValue-DT2UTHYF.js";import"./_defineProperty-C-tkbXiY.js";import"./_baseIndexOf-Be9UPhX8.js";import"./_baseFindIndex-Cj99RmFE.js";import"./uniq-ng8NF7z1.js";import"./_baseUniq-C0xGXrNX.js";import"./noop-DX6rZLP_.js";import"./isEmpty-B99QHc0N.js";import"./isNil-CHIgUVhi.js";import"./isString-B3dy4UXj.js";import"./characters-DWaYg7k3.js";import"./NumberInput-BgW0D2b_.js";import"./useInputStatusIcon-hFNWZmGl.js";import"./InputGroupContext-B9I4PeJ6.js";import"./Selector-BoWyJdBE.js";import"./useTypeahead-CbvZmB0O.js";import"./isRtlElement-B2-7SF8s.js";import"./TextInput-uBsqoyR1.js";import"./VStack-Dv9H82qh.js";import"./_arrayEach-DpGxo2Of.js";import"./_castFunction-a6W-o7Lo.js";import"./identity-DKeuBCMA.js";import"./_baseFlatten-BDTTx1Np.js";import"./get-BO5yzBcd.js";import"./_baseGet-BKSCp_1N.js";import"./_isIterateeCall-B0lY-oL0.js";function Cn(t){return function(e){e=y(e);var n=Sn(e)?En(e):void 0,o=n?n[0]:e.charAt(0),a=n?Ln(n,1).join(""):e.slice(1);return o[t]()+a}}var In=Cn("toUpperCase");function Tn(t,e,n,o){var a=-1,r=t==null?0:t.length;for(o&&r&&(n=t[++a]);++a<r;)n=e(n,t[a],a,t);return n}function On(t,e,n,o,a){return a(t,function(r,i,l){n=o?(o=!1,r):e(n,r,i,l)}),n}function kn(t,e,n){var o=Ue(t)?Tn:On,a=arguments.length<3;return o(t,An(e),n,a,wn)}const Nn={string:["iContains","iNotContains","iEquals","iNotEquals","iStartsWith","iNotStartsWith","iEndsWith","iNotEndsWith"],number:["equals","notEquals","greaterThan","greaterThanOrEqual","lessThan","lessThanOrEqual"],boolean:["equals"],enum:["equals","notEquals","in","notIn"],uuid:["equals","notEquals","in","notIn"],datetime:["equals","notEquals","before","after"]},Un={string:"iContains",number:"equals",boolean:"equals",enum:"equals",uuid:"equals",datetime:"equals"},ue=["in","notIn"],qn=[{label:"True",value:"true"},{label:"False",value:"false"}];function ke(){return`filter-${Date.now()}-${Math.random().toString(36).substring(2,11)}`}function Pn(t,e){const n=t.split(".");if(n.some(r=>r===""||r==="__proto__"||r==="constructor"||r==="prototype"))return{};if(n.length===1)return{[t]:e};let o={},a=o;for(let r=0;r<n.length-1;r++)a[n[r]]={},a=a[n[r]];return a[n[n.length-1]]=e,o}function Fn(t,e,n="AND"){if(t.length===0)return;const o=[];return t.forEach(a=>{const r=e.find(s=>s.key===a.property);let i;if(((r==null?void 0:r.valueMode)||((r==null?void 0:r.type)==="boolean"?"scalar":"operator"))==="scalar")(r==null?void 0:r.type)==="boolean"?i=a.value===!0||a.value==="true":(r==null?void 0:r.type)==="number"?i=Number(a.value):i=a.value;else if(a.operator==="in"||a.operator==="notIn"){const s=Array.isArray(a.value)?a.value:a.value.split(",").map(f=>f.trim());i={[a.operator]:(r==null?void 0:r.type)==="number"?s.map(Number):s}}else{let s=a.value;(r==null?void 0:r.type)==="number"&&(s=Number(s)),i={[a.operator]:s}}o.push(Pn(a.property,i))}),o.length===1?o[0]:{[n]:o}}function Xt(t,e,n=""){const o=[];return Object.keys(t).forEach(a=>{if(a==="AND"||a==="OR"||a==="NOT"||a==="DISTINCT")return;const r=n?`${n}.${a}`:a,i=t[a],l=e.find(s=>s.key===r);l?(l.valueMode||(l.type==="boolean"?"scalar":"operator"))==="scalar"&&typeof i!="object"?o.push({id:ke(),property:r,operator:l.implicitOperator||"equals",value:String(i),propertyLabel:l.propertyLabel||r,type:l.type||"string"}):i&&typeof i=="object"&&Object.keys(i).forEach(f=>{const h=i[f];h!=null&&o.push({id:ke(),property:r,operator:f,value:Array.isArray(h)?h.join(", "):String(h),propertyLabel:l.propertyLabel||r,type:l.type||"string"})}):i&&typeof i=="object"&&(Object.keys(i).some(h=>["eq","ne","lt","le","gt","ge","contains","notContains","startsWith","endsWith","ilike","in","notIn","isNull"].includes(h))||o.push(...Xt(i,e,r)))}),o}function Pe(t,e){if(!t)return[];const n=[];if(t.AND||t.OR){const o=t.AND||t.OR;return(Array.isArray(o)?o:[o]).forEach(r=>{n.push(...Pe(r,e))}),n}return n.push(...Xt(t,e)),n}const en=t=>(t==null?void 0:t.valueMode)||((t==null?void 0:t.type)==="boolean"?"scalar":"operator"),Ne=t=>t.options??(t.type==="boolean"?qn:void 0),se=t=>t.strictSelection??t.type==="boolean";function xn(t){return en(t)==="scalar"?[t.implicitOperator||"equals"]:t.fixedOperator?[t.fixedOperator]:t.operators||Nn[t.type||"string"]}function Mn(t){return en(t)==="scalar"?t.implicitOperator||"equals":t.fixedOperator||t.defaultOperator||Un[t.type]}const Rn=(t,e)=>e(`comp:BAIGraphQLPropertyFilter.operator.${In(t)}`,{defaultValue:t});function Gn(t,e,n,o){if(n)return n;const a=pe(ue,e),r=o==null?void 0:o(a);if(r)return r;const i=Ne(t),l=se(t);if(a)return i&&l?{type:"enum_list",values:Re(i)}:{type:"string_list",searchSource:Ge(i),isArbitraryStringAllowed:!0};if(t.type==="datetime")return{type:"date_absolute"};if(t.type==="number")return{type:"float"};if(i&&l)return{type:"enum",values:Re(i)};const s=Ge(i);return s?{type:"string",searchSource:s,isArbitraryStringAllowed:!0}:{type:"string"}}function tn(t,e){return Ue(t)?ie(m(t,y)):e?ie(m(Jt(y(t),","),$t)):ie([y(t)])}function Wn(t,e){const n=t.value,o=pe(ue,t.operator);if(e!=null&&e.renderInput)return{type:"custom",value:y(n)};if(e!=null&&e.entitySource)return{type:"custom",value:yn(tn(n,o),o)??""};if(o){const a=Ue(n)?m(n,y):ie(m(Jt(y(n),","),$t));return e&&Ne(e)&&se(e)?{type:"enum_list",value:a}:{type:"string_list",value:a}}if((e==null?void 0:e.type)==="datetime"){const a=Oe(y(n));return{type:"date_absolute",unixSeconds:a.isValid()?a.unix():Oe().unix()}}return(e==null?void 0:e.type)==="number"?{type:"float",value:Number(n)}:e&&Ne(e)&&se(e)?{type:"enum",value:y(n)}:{type:"string",value:y(n)}}function Hn(t,e,n){switch(t.type){case"empty":return"";case"custom":return e!=null&&e.entitySource?(n?pe(ue,n):Dn(t.value,"["))?hn(t.value,!0):y(t.value??""):y(t.value??"");case"date_absolute":return Oe.unix(t.unixSeconds).toISOString();case"integer":case"float":return String(t.value);case"string_list":case"enum_list":return[...t.value];case"entity_list":return m(t.value,o=>o.id);case"date_range":return JSON.stringify(t.value);default:return y(t.value??"")}}function Vn(t,e){const n=qe(e,"key");return m(Pe(t,e),o=>({field:o.property,operator:o.operator,value:Wn(o,n[o.property])}))}function Bn(t,e,n="AND",o=!1){const a=qe(e,"key"),r=o?vn(kn(t,(l,s)=>({...l,[s.field]:s}),{})):[...t],i=m(r,l=>{const s=a[l.field];return{id:ke(),property:l.field,operator:l.operator,value:Hn(l.value,s,l.operator),propertyLabel:(s==null?void 0:s.propertyLabel)??l.field,type:(s==null?void 0:s.type)??"string"}});return Fn(i,e,n)}const He=t=>{"use memo";var Me;const e=on.c(61),{filterProperties:n,value:o,onChange:a,defaultValue:r,combinationMode:i,singleCondition:l,label:s,placeholder:f,applyLabel:h,resultCount:de,contentSearchFieldKey:ce,isDisabled:nn,size:me,style:ye,className:he,loading:an,"data-testid":be}=t,fe=i===void 0?"AND":i,ge=l===void 0?!1:l,{t:c}=sn();let T;e[0]!==r||e[1]!==a||e[2]!==o?(T={value:o,defaultValue:r,onChange:a},e[0]=r,e[1]=a,e[2]=o,e[3]=T):T=e[3];const[O,ve]=bn(T),b=pn();let k;e[4]!==b.record||e[5]!==b.resolveLabel?(k={recordLabel:b.record,resolveLabel:b.resolveLabel},e[4]=b.record,e[5]=b.resolveLabel,e[6]=k):k=e[6];const L=un(k);let N;e[7]!==b?(N={labels:b},e[7]=b,e[8]=N):N=e[8];const C=dn(N),Ae=qe(n,"key"),Fe=Pe(O,n);let U;e[9]!==n||e[10]!==O?(U=Vn(O,n),e[9]=n,e[10]=O,e[11]=U):U=e[11];const we=U,xe=gn(Fe,d=>{const p=Ae[d.property];return!(p!=null&&p.entitySource)||p.renderInput?[]:m(tn(d.value,pe(ue,d.operator)),g=>[p.key,g])}),De=Te.useEffectEvent(()=>{fn(cn(xe,jn),(d,p)=>{var g;return b.ensureResolved(p,(g=Ae[p])==null?void 0:g.entitySource,m(d,_n))})}),Se=Zt(m(xe,Qn),"\0");let q;e[12]!==De?(q=()=>{De()},e[12]=De,e[13]=q):q=e[13];let P;e[14]!==Se?(P=[Se],e[14]=Se,e[15]=P):P=e[15],Te.useEffect(q,P);let v;e[16]!==ce||e[17]!==n?(v=ce??((Me=We(n,Yn))==null?void 0:Me.key),e[16]=ce,e[17]=n,e[18]=v):v=e[18];let A;if(e[19]!==C||e[20]!==n||e[21]!==L||e[22]!==c){let d;e[24]!==C||e[25]!==L||e[26]!==c?(d=p=>{const g=L.operatorValueFor(p.key,p.renderInput),rn=I=>C.operatorValueFor(p.key,p.entitySource,I);return{key:p.key,label:p.propertyLabel,defaultOperator:Mn(p),operators:m(xn(p),I=>({key:I,label:Rn(I,c),value:Gn(p,I,g,rn)}))}},e[24]=C,e[25]=L,e[26]=c,e[27]=d):d=e[27],A=m(n,d),e[19]=C,e[20]=n,e[21]=L,e[22]=c,e[23]=A}else A=e[23];let F;e[28]!==A||e[29]!==v?(F={name:"bai-graphql-property-filter",contentSearchFieldKey:v,fields:A},e[28]=A,e[29]=v,e[30]=F):F=e[30];const Ee=F,x=We(m(Fe,d=>{var g;const p=(g=Ae[d.property])==null?void 0:g.rule;if(p)return p.validate(d.value)?void 0:p.message}));let M;e[31]!==fe||e[32]!==n||e[33]!==ve||e[34]!==ge?(M=d=>{ve(Bn(d,n,fe,ge))},e[31]=fe,e[32]=n,e[33]=ve,e[34]=ge,e[35]=M):M=e[35];const Le=M;let w;e[36]!==s||e[37]!==c?(w=s??c("comp:BAIPropertyFilter.SearchLabel"),e[36]=s,e[37]=c,e[38]=w):w=e[38];let D;e[39]!==f||e[40]!==c?(D=f??c("comp:BAIPropertyFilter.PlaceHolder"),e[39]=f,e[40]=c,e[41]=D):D=e[41];let S;e[42]!==h||e[43]!==c?(S=h??c("comp:BAIPropertyFilter.Apply"),e[42]=h,e[43]=c,e[44]=S):S=e[44];const Ce=nn||an;let E;e[45]!==x?(E=x?{type:"error",message:x}:void 0,e[45]=x,e[46]=E):E=e[46];let R;return e[47]!==he||e[48]!==Ee||e[49]!==be||e[50]!==we||e[51]!==Le||e[52]!==de||e[53]!==me||e[54]!==ye||e[55]!==w||e[56]!==D||e[57]!==S||e[58]!==Ce||e[59]!==E?(R=le.jsx(mn,{config:Ee,filters:we,startIcon:ln,label:w,placeholder:D,popoverSaveButtonLabel:S,resultCount:de,isDisabled:Ce,size:me,style:ye,className:he,"data-testid":be,status:E,onChange:Le}),e[47]=he,e[48]=Ee,e[49]=be,e[50]=we,e[51]=Le,e[52]=de,e[53]=me,e[54]=ye,e[55]=w,e[56]=D,e[57]=S,e[58]=Ce,e[59]=E,e[60]=R):R=e[60],R};function jn(t){const[e]=t;return e}function _n(t){const[,e]=t;return e}function Qn(t){return Zt(t,"::")}function Yn(t){return t.type==="string"&&!se(t)&&!t.renderInput&&!t.entitySource}const{action:u}=__STORYBOOK_MODULE_ACTIONS__,or={title:"Filter/BAIGraphQLPropertyFilter",component:He,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:'\n**BAIGraphQLPropertyFilter** is an advanced filtering component designed for GraphQL-based Backend.AI applications. It provides a sophisticated interface for constructing GraphQL filter objects with support for:\n\n- **GraphQL Filter Types**: Compatible with standard GraphQL filter schemas including StringFilter, IntFilter, BooleanFilter, EnumFilter, and DateTimeFilter\n- **Flexible Combination Mode**: Choose between AND or OR operators to combine multiple filter conditions\n- **Rich Operator Set**: Case-insensitive string operators (iContains, iEquals, iStartsWith, iEndsWith, etc.) and comparison operators (greaterThan, greaterThanOrEqual, lessThan, lessThanOrEqual, in, notIn)\n- **Type-Safe Filtering**: Automatic type detection and operator suggestions based on property types\n- **Bidirectional Conversion**: Seamless conversion between UI conditions and GraphQL filter objects\n\nNew in this version:\n- **DateTime support**: When a property has type \'datetime\', a DatePicker with time selection is rendered instead of a text input. Values are serialized as ISO strings and displayed in filter tags as \'YYYY-MM-DD HH:mm\'.\n- **UUID support**: UUID type properties use `equals`, `notEquals`, `in`, `notIn` operators and support validation rules.\n- **Entity values via `entitySource`**: Declarative picker for properties whose value is an opaque id (a user UUID chosen by email). Supply `{ search, bootstrap?, resolve?, cancel? }` and the editor renders an Astryx Typeahead (or a Tokenizer when the operator is `in`/`notIn` — **arity follows the operator, not the property**). `resolve(ids)` turns ids restored from a URL back into labels, so a shared link shows the email instead of the UUID. Prefer it over `renderInput` for id-valued properties; reach for `renderInput` only when you need a control the entity mode cannot express.\n- **Custom input via `renderInput`**: Replace the default value editor with any controlled control (e.g., a storage-host picker or async select). The control **stages** a value via `onAddCondition(value, label?)` and the edit popover\'s Apply button commits it; pass a human-readable `label` when the staged value is opaque (e.g. a UUID) so the condition tag shows the label instead. The render prop receives `{ onAddCondition, value, isDisabled }` — `value` is what is currently staged (an existing token\'s value in edit mode). Keep using a built-in `type` (e.g. `uuid`) that matches what the control emits.\n- Operatorless fields via valueMode: \'scalar\' for properties that should emit direct scalar values (e.g., { isUrgent: true }). Use implicitOperator (defaults to \'equals\') to control how tags are displayed in the UI.\n\nThe component generates GraphQL-compatible filter objects that can be directly used in GraphQL queries, enabling powerful and flexible data filtering across the platform.\n\n> **to-astryx ticket 28** — the engine is now Astryx `PowerSearch`. The prop contract and the emitted filter object are unchanged, but the antd chrome (property/operator `Select`s, `AutoComplete`, `DatePicker`, closable `Tag`s, reset button) is replaced by PowerSearch\'s typeahead, tokens and built-in clear. Three behaviours moved: `renderInput` controls stage a value that the popover\'s Apply button commits, per-property `placeholder` is dropped (PowerSearch has one control-level placeholder), and `rule.validate` is advisory — a violating token is reported through the error status instead of being refused. **to-astryx ticket 32** refreshed these stories: the `renderInput` demos below now use `BAIComplexSelect` (Astryx-native) instead of antd `Select`, matching what a migrated call site actually renders.\n\n**GraphQL Filter Object Examples:**\n```javascript\n// Simple string filter (case-insensitive)\n{ name: { iContains: "john" } }  // case-insensitive contains (default)\n{ name: { iEquals: "john" } }    // case-insensitive exact match\n\n// Number filter\n{ score: { greaterThan: 80 } }\n{ price: { lessThanOrEqual: 100 } }\n\n// Boolean filter\n{ active: true }\n\n// Filters combined with AND (all conditions must match)\n{\n  AND: [\n    { name: { iContains: "john" } },\n    { status: { in: ["ACTIVE", "PENDING"] } },\n    { priority: { iEquals: "HIGH" } }\n  ]\n}\n\n// Filters combined with OR (any condition can match)\n{\n  OR: [\n    { status: { iEquals: "URGENT" } },\n    { priority: { iEquals: "HIGH" } },\n    { assignee: { iStartsWith: "john" } }\n  ]\n}\n```\n        '}}},argTypes:{filterProperties:{description:"Array of filterable properties with their configuration",control:{type:"object"},table:{type:{summary:"FilterProperty[]"},detail:`
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
  // Declarative picker for opaque-id values (a user UUID chosen by email).
  // Arity follows the operator: Typeahead for equals/notEquals, Tokenizer for
  // in/notIn. Ignored when \`renderInput\` is set.
  entitySource?: {
    search: (query: string) => Promise<FilterEntity[]> | FilterEntity[];
    bootstrap?: () => Promise<FilterEntity[]> | FilterEntity[];
    resolve?: (ids: readonly string[]) => Promise<FilterEntity[]>;
    cancel?: () => void;
  };
  // Custom input renderer — replaces the default value editor with a controlled
  // control. \`onAddCondition(value, label?)\` STAGES the value; the edit
  // popover's Apply button commits it, serialized per the property's \`type\`.
  // Pass a human-readable \`label\` when the value is opaque (e.g. a UUID) so
  // the token stays readable.
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
        `}},onChange:{description:"Callback when filter value changes",table:{type:{summary:"(value: GraphQLFilter | undefined) => void"}}},loading:{control:{type:"boolean"},description:"Show loading state",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},combinationMode:{control:{type:"radio"},options:["AND","OR"],description:"How to combine multiple filter conditions",table:{type:{summary:"'AND' | 'OR'"},defaultValue:{summary:"AND"}}}},render:t=>{const[e,n]=Te.useState(t.value);return le.jsx(He,{...t,value:e,onChange:o=>{var a;(a=t.onChange)==null||a.call(t,o),n(o)}})}},G={name:"Basic Usage",parameters:{docs:{description:{story:"Basic GraphQL property filter with string and boolean properties. Try adding filters and see how they combine into a GraphQL filter object."}}},args:{filterProperties:[{key:"name",propertyLabel:"Name",type:"string",defaultOperator:"iContains"},{key:"description",propertyLabel:"Description",type:"string"},{key:"isActive",propertyLabel:"Active Status",type:"boolean"}],combinationMode:"AND",onChange:u("Filter changed")}},W={name:"Multiple Filters with AND",parameters:{docs:{description:{story:"Demonstrates filters combined with AND operator. All conditions must be satisfied for a match. This is useful when you need strict filtering."}}},args:{filterProperties:[{key:"title",propertyLabel:"Title",type:"string"},{key:"priority",propertyLabel:"Priority",type:"enum",options:[{label:"High",value:"HIGH"},{label:"Medium",value:"MEDIUM"},{label:"Low",value:"LOW"}]},{key:"isUrgent",propertyLabel:"Urgent",type:"boolean"}],combinationMode:"AND",value:{AND:[{title:{iContains:"critical"}},{priority:{equals:"HIGH"}},{isUrgent:!0}]},onChange:u("AND Filter changed")}},H={name:"Multiple Filters with OR",parameters:{docs:{description:{story:"Demonstrates filters combined with OR operator. Any condition can match for a result. This is useful for more flexible, inclusive filtering."}}},args:{filterProperties:[{key:"status",propertyLabel:"Status",type:"enum",options:[{label:"Urgent",value:"URGENT"},{label:"High Priority",value:"HIGH_PRIORITY"},{label:"Normal",value:"NORMAL"}]},{key:"assignee",propertyLabel:"Assignee",type:"string"},{key:"dueToday",propertyLabel:"Due Today",type:"boolean"}],combinationMode:"OR",value:{OR:[{status:{equals:"URGENT"}},{assignee:{iContains:"john"}},{dueToday:!0}]},onChange:u("OR Filter changed")}},V={name:"Number Filters with Comparisons",parameters:{docs:{description:{story:"Shows numeric filtering with comparison operators like greater than, less than, etc. Useful for filtering by quantities, scores, or metrics."}}},args:{filterProperties:[{key:"score",propertyLabel:"Score",type:"number",operators:["equals","notEquals","greaterThan","greaterThanOrEqual","lessThan","lessThanOrEqual"]},{key:"quantity",propertyLabel:"Quantity",type:"number"},{key:"price",propertyLabel:"Price",type:"number",operators:["greaterThan","lessThan","equals"],defaultOperator:"greaterThan"}],combinationMode:"AND",value:{AND:[{score:{greaterThanOrEqual:80}},{quantity:{lessThan:100}}]},onChange:u("Number filter changed")}},B={name:"Enum Filters with Multiple Selection",parameters:{docs:{description:{story:"Demonstrates enum type filtering with in/notIn operators for multiple value selection. Perfect for status fields, categories, or any predefined set of values."}}},args:{filterProperties:[{key:"status",propertyLabel:"Status",type:"enum",options:[{label:"Active",value:"ACTIVE"},{label:"Inactive",value:"INACTIVE"},{label:"Pending",value:"PENDING"},{label:"Archived",value:"ARCHIVED"}],operators:["equals","notEquals","in","notIn"],strictSelection:!0},{key:"category",propertyLabel:"Category",type:"enum",options:[{label:"Frontend",value:"FRONTEND"},{label:"Backend",value:"BACKEND"},{label:"Database",value:"DATABASE"},{label:"DevOps",value:"DEVOPS"}],defaultOperator:"in"}],combinationMode:"AND",value:{AND:[{status:{in:["ACTIVE","PENDING"]}},{category:{notEquals:"DATABASE"}}]},onChange:u("Enum filter changed")}},j={name:"Complex Combined Filter",parameters:{docs:{description:{story:"Example showing multiple filters with different property types combined with the selected mode (AND/OR) for comprehensive filtering."}}},args:{filterProperties:[{key:"name",propertyLabel:"Name",type:"string"},{key:"email",propertyLabel:"Email",type:"string",operators:["iContains","iStartsWith","iEndsWith"]},{key:"role",propertyLabel:"Role",type:"enum",options:[{label:"Admin",value:"ADMIN"},{label:"User",value:"USER"},{label:"Guest",value:"GUEST"}]},{key:"credits",propertyLabel:"Credits",type:"number"},{key:"isVerified",propertyLabel:"Verified",type:"boolean"}],combinationMode:"AND",value:{AND:[{name:{iContains:"john"}},{email:{iEndsWith:"@company.com"}},{role:{equals:"USER"}},{credits:{greaterThanOrEqual:100}},{isVerified:!0}]},onChange:u("Complex filter changed")}},_={name:"Custom Validation Rules",parameters:{docs:{description:{story:"Property filter with custom validation rules for data integrity. Shows email validation and strict selection enforcement."}}},args:{filterProperties:[{key:"email",propertyLabel:"Email Address",type:"string",rule:{message:"Please enter a valid email address",validate:t=>/\S+@\S+\.\S+/.test(t)}},{key:"phone",propertyLabel:"Phone Number",type:"string",rule:{message:"Phone number must be 10 digits",validate:t=>/^\d{10}$/.test(t.replace(/\D/g,""))}},{key:"department",propertyLabel:"Department",type:"enum",options:[{label:"Engineering",value:"ENGINEERING"},{label:"Marketing",value:"MARKETING"},{label:"Sales",value:"SALES"},{label:"HR",value:"HR"}],strictSelection:!0}],combinationMode:"AND",onChange:u("Validated filter changed")}},Q={name:"Autocomplete Suggestions",parameters:{docs:{description:{story:"Filter with predefined autocomplete options for improved user experience and data consistency."}}},args:{filterProperties:[{key:"country",propertyLabel:"Country",type:"string",options:[{label:"United States",value:"US"},{label:"United Kingdom",value:"UK"},{label:"Canada",value:"CA"},{label:"Australia",value:"AU"},{label:"Germany",value:"DE"},{label:"France",value:"FR"}]},{key:"language",propertyLabel:"Language",type:"string",options:[{label:"English",value:"en"},{label:"Spanish",value:"es"},{label:"French",value:"fr"},{label:"German",value:"de"},{label:"Chinese",value:"zh"},{label:"Japanese",value:"ja"}],defaultOperator:"in"}],combinationMode:"OR",value:{OR:[{country:{equals:"US"}},{language:{in:["en","es"]}}]},onChange:u("Autocomplete filter changed")}},Y={parameters:{docs:{description:{story:"GraphQL property filter in its initial state with no applied filters. Start adding filters to see how they combine."}}},args:{filterProperties:[{key:"title",propertyLabel:"Title",type:"string"},{key:"isPublished",propertyLabel:"Published",type:"boolean"},{key:"viewCount",propertyLabel:"View Count",type:"number"}],combinationMode:"AND",onChange:u("Filter changed from empty")}},K={parameters:{docs:{description:{story:"Filter component in loading state, typically shown while fetching schema information or processing complex queries."}}},args:{filterProperties:[{key:"name",propertyLabel:"Name",type:"string"}],loading:!0,combinationMode:"AND",onChange:u("Filter changed")}},z={name:"Artifact Filter (Real-world Example)",parameters:{docs:{description:{story:"Real-world example matching the ArtifactFilter GraphQL input type with name and status filtering capabilities. Shows how the component would be used in production."}}},args:{filterProperties:[{key:"name",propertyLabel:"Artifact Name",type:"string",operators:["iContains","iEquals","iNotEquals","iStartsWith","iEndsWith"],defaultOperator:"iContains"},{key:"status",propertyLabel:"Artifact Status",type:"enum",options:[{label:"Draft",value:"DRAFT"},{label:"Published",value:"PUBLISHED"},{label:"Archived",value:"ARCHIVED"},{label:"Deleted",value:"DELETED"}],operators:["equals","in"],strictSelection:!0}],combinationMode:"AND",value:{AND:[{name:{iContains:"model"}},{status:{in:["PUBLISHED","DRAFT"]}}]},onChange:u("Artifact filter changed")}},$={name:"Fixed Operator (No Selector)",parameters:{docs:{description:{story:"Demonstrates properties with fixed operators where the operator selector is hidden. Useful when you want to enforce a specific operator for certain fields."}}},args:{filterProperties:[{key:"search",propertyLabel:"Search (always contains)",type:"string",fixedOperator:"iContains"},{key:"username",propertyLabel:"Username (always equals)",type:"string",fixedOperator:"iEquals"},{key:"tags",propertyLabel:"Tags (always in)",type:"string",fixedOperator:"in"},{key:"score",propertyLabel:"Score (flexible)",type:"number",operators:["equals","greaterThan","greaterThanOrEqual","lessThan","lessThanOrEqual"]}],combinationMode:"AND",onChange:u("Fixed operator filter changed")}},Z={name:"Toggle Between AND/OR",parameters:{docs:{description:{story:"Example showing how switching between AND and OR combination modes affects the filter logic. Try toggling the combination mode to see how the same conditions behave differently."}}},args:{filterProperties:[{key:"type",propertyLabel:"Type",type:"enum",options:[{label:"Feature",value:"FEATURE"},{label:"Bug",value:"BUG"},{label:"Task",value:"TASK"}]},{key:"priority",propertyLabel:"Priority",type:"enum",options:[{label:"Critical",value:"CRITICAL"},{label:"High",value:"HIGH"},{label:"Medium",value:"MEDIUM"},{label:"Low",value:"LOW"}]},{key:"assignedToMe",propertyLabel:"Assigned to Me",type:"boolean"}],combinationMode:"AND",onChange:u("Filter changed with mode toggle")}},J={name:"DateTime Filters",parameters:{docs:{description:{story:"Demonstrates datetime filtering with a DatePicker UI. When a datetime property is selected, a date picker with time selection is rendered instead of a text input. Useful for filtering by created_at, updated_at, or other timestamp fields."}}},args:{filterProperties:[{key:"created_at",propertyLabel:"Created At",type:"datetime"},{key:"updated_at",propertyLabel:"Updated At",type:"datetime",defaultOperator:"after"},{key:"name",propertyLabel:"Name",type:"string",defaultOperator:"iContains"},{key:"isActive",propertyLabel:"Active Status",type:"boolean"}],combinationMode:"AND",onChange:u("DateTime filter changed")}},X={name:"DateTime with Pre-applied Filters",parameters:{docs:{description:{story:"DateTime filters with pre-applied conditions showing how datetime values are displayed in filter tags with a human-readable format (YYYY-MM-DD HH:mm)."}}},args:{filterProperties:[{key:"created_at",propertyLabel:"Created At",type:"datetime"},{key:"updated_at",propertyLabel:"Updated At",type:"datetime"},{key:"name",propertyLabel:"Name",type:"string"}],combinationMode:"AND",value:{AND:[{created_at:{after:"2025-01-01T00:00:00.000Z"}},{updated_at:{before:"2025-12-31T23:59:59.000Z"}},{name:{iContains:"test"}}]},onChange:u("DateTime pre-filtered changed")}},ee={name:"UUID Filters",parameters:{docs:{description:{story:"UUID type properties use `equals`, `notEquals`, `in`, `notIn` operators. Combine with a `rule` for format validation."}}},args:{filterProperties:[{key:"projectId",propertyLabel:"Project ID",type:"uuid",rule:{message:"Must be a valid UUID.",validate:t=>/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(t)}},{key:"domainId",propertyLabel:"Domain ID",type:"uuid",defaultOperator:"notEquals"}],combinationMode:"AND",value:{projectId:{equals:"a1b2c3d4-e5f6-7890-abcd-ef1234567890"}},onChange:u("UUID filter changed")}},te={name:"Custom Input via renderInput",parameters:{docs:{description:{story:"When `renderInput` is provided, the default value editor is replaced with a custom control. The control **stages** a value via `onAddCondition(value, label?)` and the edit popover's Apply button commits it — nothing lands on the filter until Apply. The render prop also receives `value` (what is currently staged) and `isDisabled`. Useful for controls the declarative `entitySource` mode cannot express; for id-valued properties prefer `entitySource`."}}},args:{filterProperties:[{key:"name",propertyLabel:"Name",type:"string",defaultOperator:"iContains"},{key:"storageHost",propertyLabel:"Storage Host",type:"string",defaultOperator:"equals",renderInput:({onAddCondition:t})=>le.jsx(zt,{label:"Storage Host",isLabelHidden:!0,placeholder:"Select storage host",width:180,hasSearch:!1,options:[{label:"local:volume1",value:"local:volume1"},{label:"local:volume2",value:"local:volume2"},{label:"nfs:data",value:"nfs:data"}],value:null,onChange:e=>{const n=e;t(n==null?void 0:n.value)}})}],combinationMode:"AND",onChange:u("renderInput filter changed")}},ne={name:"Scalar valueMode on string field",parameters:{docs:{description:{story:"Demonstrates valueMode='scalar' on a non-boolean field. The filter emits { slugExact: 'my-slug' } without an operator, while tags still display using implicitOperator (default '=')."}}},args:{filterProperties:[{key:"slugExact",propertyLabel:"Slug (scalar exact)",type:"string",valueMode:"scalar",implicitOperator:"equals"},{key:"title",propertyLabel:"Title",type:"string",defaultOperator:"iContains"},{key:"isPublished",propertyLabel:"Published",type:"boolean"}],combinationMode:"AND",value:{AND:[{slugExact:"hello-world"},{isPublished:!0}]},onChange:u("Scalar mode (string) filter changed")}},Kn=[{label:"alice@example.com",value:"owner-uuid-0001"},{label:"bob@example.com",value:"owner-uuid-0002"},{label:"carol@example.com",value:"owner-uuid-0003"}],ae={name:"Custom input (onAddCondition)",parameters:{docs:{description:{story:"A property whose input is a controlled `BAIComplexSelect` supplied via `renderInput`. Selecting an option calls `onAddCondition(value, label)`, which **stages** it; the popover's Apply button commits it, serialized per `type: 'uuid'` → `{ owner: { id: { equals: <id> } } }`, while the token shows the label (email) instead of the opaque UUID. The same result with less call-site code is what `entitySource` gives you — see *Entity picker via entitySource*."}}},args:{filterProperties:[{key:"owner.id",propertyLabel:"Owner",type:"uuid",fixedOperator:"equals",renderInput:({onAddCondition:t})=>le.jsx(zt,{label:"Owner",isLabelHidden:!0,placeholder:"Select owner",width:220,options:Kn,value:null,onChange:e=>{const n=e;t(n==null?void 0:n.value,n==null?void 0:n.label)}})}],combinationMode:"AND",onChange:u("custom input filter changed")}},re=[{id:"owner-uuid-0001",label:"alice@example.com",description:"Alice Kim"},{id:"owner-uuid-0002",label:"bob@example.com",description:"Bob Lee"},{id:"owner-uuid-0003",label:"carol@example.com",description:"Carol Park"},{id:"owner-uuid-0004",label:"dave@example.com",description:"Dave Choi"},{id:"owner-uuid-0005",label:"erin@example.com",description:"Erin Yoon"}],Ie=t=>new Promise(e=>setTimeout(e,t)),Ve={search:async t=>{await Ie(400);const e=t.trim().toLowerCase();return e?re.filter(n=>n.label.toLowerCase().includes(e)):re},bootstrap:async()=>(await Ie(300),re.slice(0,3)),resolve:async t=>(await Ie(1200),re.filter(e=>t.includes(e.id)))},oe={name:"Entity picker via entitySource",parameters:{docs:{description:{story:"`entitySource` is the declarative way to filter on an opaque id: the user searches by email, the filter serializes the UUID (`{ owner: { id: { equals: <uuid> } } }` — the same bytes `renderInput` produced). Arity follows the **operator**: `Owner` is pinned to `equals` and gets a single-select Typeahead, while `Reviewer` offers `in`/`notIn` and gets a multi-select Tokenizer — both from one source, with no call-site branching. Both properties are pre-seeded with raw UUIDs and this demo source resolves them after ~1.2s, so the tokens start as UUIDs and swap to emails — exactly what happens when a shared filter URL is opened in a fresh tab. Without `resolve` the token simply keeps showing the raw id."}}},args:{filterProperties:[{key:"owner.id",propertyLabel:"Owner",type:"uuid",fixedOperator:"equals",entitySource:Ve},{key:"reviewer.id",propertyLabel:"Reviewer",type:"uuid",operators:["in","notIn"],defaultOperator:"in",entitySource:Ve},{key:"name",propertyLabel:"Name",type:"string",defaultOperator:"iContains"}],combinationMode:"AND",value:{AND:[{owner:{id:{equals:"owner-uuid-0003"}}},{reviewer:{id:{in:["owner-uuid-0001","owner-uuid-0002"]}}}]},onChange:u("entitySource filter changed")}};var Be,je,_e;G.parameters={...G.parameters,docs:{...(Be=G.parameters)==null?void 0:Be.docs,source:{originalSource:`{
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
}`,...(_e=(je=G.parameters)==null?void 0:je.docs)==null?void 0:_e.source}}};var Qe,Ye,Ke;W.parameters={...W.parameters,docs:{...(Qe=W.parameters)==null?void 0:Qe.docs,source:{originalSource:`{
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
}`,...(Ke=(Ye=W.parameters)==null?void 0:Ye.docs)==null?void 0:Ke.source}}};var ze,$e,Ze;H.parameters={...H.parameters,docs:{...(ze=H.parameters)==null?void 0:ze.docs,source:{originalSource:`{
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
}`,...(Ze=($e=H.parameters)==null?void 0:$e.docs)==null?void 0:Ze.source}}};var Je,Xe,et;V.parameters={...V.parameters,docs:{...(Je=V.parameters)==null?void 0:Je.docs,source:{originalSource:`{
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
}`,...(et=(Xe=V.parameters)==null?void 0:Xe.docs)==null?void 0:et.source}}};var tt,nt,at;B.parameters={...B.parameters,docs:{...(tt=B.parameters)==null?void 0:tt.docs,source:{originalSource:`{
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
}`,...(at=(nt=B.parameters)==null?void 0:nt.docs)==null?void 0:at.source}}};var rt,ot,it;j.parameters={...j.parameters,docs:{...(rt=j.parameters)==null?void 0:rt.docs,source:{originalSource:`{
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
}`,...(it=(ot=j.parameters)==null?void 0:ot.docs)==null?void 0:it.source}}};var st,lt,pt;_.parameters={..._.parameters,docs:{...(st=_.parameters)==null?void 0:st.docs,source:{originalSource:`{
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
}`,...(pt=(lt=_.parameters)==null?void 0:lt.docs)==null?void 0:pt.source}}};var ut,dt,ct;Q.parameters={...Q.parameters,docs:{...(ut=Q.parameters)==null?void 0:ut.docs,source:{originalSource:`{
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
}`,...(ct=(dt=Q.parameters)==null?void 0:dt.docs)==null?void 0:ct.source}}};var mt,yt,ht;Y.parameters={...Y.parameters,docs:{...(mt=Y.parameters)==null?void 0:mt.docs,source:{originalSource:`{
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
}`,...(ht=(yt=Y.parameters)==null?void 0:yt.docs)==null?void 0:ht.source}}};var bt,ft,gt;K.parameters={...K.parameters,docs:{...(bt=K.parameters)==null?void 0:bt.docs,source:{originalSource:`{
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
}`,...(gt=(ft=K.parameters)==null?void 0:ft.docs)==null?void 0:gt.source}}};var vt,At,wt;z.parameters={...z.parameters,docs:{...(vt=z.parameters)==null?void 0:vt.docs,source:{originalSource:`{
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
}`,...(wt=(At=z.parameters)==null?void 0:At.docs)==null?void 0:wt.source}}};var Dt,St,Et;$.parameters={...$.parameters,docs:{...(Dt=$.parameters)==null?void 0:Dt.docs,source:{originalSource:`{
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
}`,...(Et=(St=$.parameters)==null?void 0:St.docs)==null?void 0:Et.source}}};var Lt,Ct,It;Z.parameters={...Z.parameters,docs:{...(Lt=Z.parameters)==null?void 0:Lt.docs,source:{originalSource:`{
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
}`,...(It=(Ct=Z.parameters)==null?void 0:Ct.docs)==null?void 0:It.source}}};var Tt,Ot,kt;J.parameters={...J.parameters,docs:{...(Tt=J.parameters)==null?void 0:Tt.docs,source:{originalSource:`{
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
}`,...(kt=(Ot=J.parameters)==null?void 0:Ot.docs)==null?void 0:kt.source}}};var Nt,Ut,qt;X.parameters={...X.parameters,docs:{...(Nt=X.parameters)==null?void 0:Nt.docs,source:{originalSource:`{
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
}`,...(qt=(Ut=X.parameters)==null?void 0:Ut.docs)==null?void 0:qt.source}}};var Pt,Ft,xt;ee.parameters={...ee.parameters,docs:{...(Pt=ee.parameters)==null?void 0:Pt.docs,source:{originalSource:`{
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
}`,...(xt=(Ft=ee.parameters)==null?void 0:Ft.docs)==null?void 0:xt.source}}};var Mt,Rt,Gt;te.parameters={...te.parameters,docs:{...(Mt=te.parameters)==null?void 0:Mt.docs,source:{originalSource:`{
  name: 'Custom Input via renderInput',
  parameters: {
    docs: {
      description: {
        story: "When \`renderInput\` is provided, the default value editor is replaced with a custom control. The control **stages** a value via \`onAddCondition(value, label?)\` and the edit popover's Apply button commits it — nothing lands on the filter until Apply. The render prop also receives \`value\` (what is currently staged) and \`isDisabled\`. Useful for controls the declarative \`entitySource\` mode cannot express; for id-valued properties prefer \`entitySource\`."
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
}`,...(Gt=(Rt=te.parameters)==null?void 0:Rt.docs)==null?void 0:Gt.source}}};var Wt,Ht,Vt;ne.parameters={...ne.parameters,docs:{...(Wt=ne.parameters)==null?void 0:Wt.docs,source:{originalSource:`{
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
}`,...(Vt=(Ht=ne.parameters)==null?void 0:Ht.docs)==null?void 0:Vt.source}}};var Bt,jt,_t;ae.parameters={...ae.parameters,docs:{...(Bt=ae.parameters)==null?void 0:Bt.docs,source:{originalSource:`{
  name: 'Custom input (onAddCondition)',
  parameters: {
    docs: {
      description: {
        story: "A property whose input is a controlled \`BAIComplexSelect\` supplied via \`renderInput\`. Selecting an option calls \`onAddCondition(value, label)\`, which **stages** it; the popover's Apply button commits it, serialized per \`type: 'uuid'\` → \`{ owner: { id: { equals: <id> } } }\`, while the token shows the label (email) instead of the opaque UUID. The same result with less call-site code is what \`entitySource\` gives you — see *Entity picker via entitySource*."
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
}`,...(_t=(jt=ae.parameters)==null?void 0:jt.docs)==null?void 0:_t.source}}};var Qt,Yt,Kt;oe.parameters={...oe.parameters,docs:{...(Qt=oe.parameters)==null?void 0:Qt.docs,source:{originalSource:`{
  name: 'Entity picker via entitySource',
  parameters: {
    docs: {
      description: {
        story: '\`entitySource\` is the declarative way to filter on an opaque id: the user searches by email, the filter serializes the UUID (\`{ owner: { id: { equals: <uuid> } } }\` — the same bytes \`renderInput\` produced). Arity follows the **operator**: \`Owner\` is pinned to \`equals\` and gets a single-select Typeahead, while \`Reviewer\` offers \`in\`/\`notIn\` and gets a multi-select Tokenizer — both from one source, with no call-site branching. Both properties are pre-seeded with raw UUIDs and this demo source resolves them after ~1.2s, so the tokens start as UUIDs and swap to emails — exactly what happens when a shared filter URL is opened in a fresh tab. Without \`resolve\` the token simply keeps showing the raw id.'
      }
    }
  },
  args: {
    filterProperties: [{
      key: 'owner.id',
      propertyLabel: 'Owner',
      type: 'uuid',
      fixedOperator: 'equals',
      entitySource: demoUserEntitySource
    }, {
      key: 'reviewer.id',
      propertyLabel: 'Reviewer',
      type: 'uuid',
      operators: ['in', 'notIn'],
      defaultOperator: 'in',
      entitySource: demoUserEntitySource
    }, {
      key: 'name',
      propertyLabel: 'Name',
      type: 'string',
      defaultOperator: 'iContains'
    }],
    combinationMode: 'AND',
    value: {
      AND: [{
        owner: {
          id: {
            equals: 'owner-uuid-0003'
          }
        }
      }, {
        reviewer: {
          id: {
            in: ['owner-uuid-0001', 'owner-uuid-0002']
          }
        }
      }]
    },
    onChange: action('entitySource filter changed')
  }
}`,...(Kt=(Yt=oe.parameters)==null?void 0:Yt.docs)==null?void 0:Kt.source}}};const ir=["Default","WithANDCombination","WithORCombination","WithNumberFilters","WithEnumFilters","ComplexFilter","WithValidation","WithAutocompleteOptions","EmptyState","LoadingState","ArtifactFilterExample","WithFixedOperator","ToggleCombinationMode","WithDateTimeFilters","WithDateTimePrefiltered","WithUUIDFilters","WithRenderInput","WithScalarValueModeOnString","WithCustomType","WithEntitySource"];export{z as ArtifactFilterExample,j as ComplexFilter,G as Default,Y as EmptyState,K as LoadingState,Z as ToggleCombinationMode,W as WithANDCombination,Q as WithAutocompleteOptions,ae as WithCustomType,J as WithDateTimeFilters,X as WithDateTimePrefiltered,oe as WithEntitySource,B as WithEnumFilters,$ as WithFixedOperator,V as WithNumberFilters,H as WithORCombination,te as WithRenderInput,ne as WithScalarValueModeOnString,ee as WithUUIDFilters,_ as WithValidation,ir as __namedExportsOrder,or as default};
