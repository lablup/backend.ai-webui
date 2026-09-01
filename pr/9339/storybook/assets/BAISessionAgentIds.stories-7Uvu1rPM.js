import{c1 as Fe,a as Ne,r as qe,j as a,b as z,aw as Me,aJ as Qe}from"./iframe-CenDpN5b.js";import{R as C}from"./RelayResolver-CHmtVU5q.js";import{B as K}from"./BAIFlex-Rt_2Z4BO.js";import{B as Ke}from"./BAIButton-Dc4GoaZ6.js";import{r as Re}from"./index-BqYKSM2w.js";import{u as Le}from"./uniq-yxkRoM3i.js";import{b as $e}from"./_baseExtremum-BdlWHip6.js";import{i as Ue}from"./identity-DKeuBCMA.js";import{P as ze}from"./Popover-6rOWFmTi.js";import"./preload-helper-Dp1pzeXC.js";import"./index-D4RcaDgl.js";import"./astryxLabel-C-nEXWO-.js";import"./_baseUniq-DbNlON8S.js";import"./_baseIndexOf-Be9UPhX8.js";import"./_baseFindIndex-Cj99RmFE.js";import"./noop-DX6rZLP_.js";import"./isSymbol-FamDcDBZ.js";import"./usePopover-C_AMkFgl.js";import"./useDevWarning-D7jSE9Vv.js";import"./rtlStyles-T4i24HtE.js";function Ve(s,n){return s>n}function We(s){return s&&s.length?$e(s,Ue,Ve):void 0}const je={argumentDefinitions:[],kind:"Fragment",metadata:null,name:"BAISessionAgentIdsFragment",selections:[{alias:null,args:null,kind:"ScalarField",name:"agent_ids",storageKey:null}],type:"ComputeSessionNode",abstractKey:null};je.hash="42a06f8e2b4b445e08e0f94066e8ea58";var R={},q,V;function He(){return V||(V=1,q=function(){var s=document.getSelection();if(!s.rangeCount)return function(){};for(var n=document.activeElement,p=[],m=0;m<s.rangeCount;m++)p.push(s.getRangeAt(m));switch(n.tagName.toUpperCase()){case"INPUT":case"TEXTAREA":n.blur();break;default:n=null;break}return s.removeAllRanges(),function(){s.type==="Caret"&&s.removeAllRanges(),s.rangeCount||p.forEach(function(d){s.addRange(d)}),n&&n.focus()}}),q}var M,W;function Ge(){if(W)return M;W=1;var s=He(),n={"text/plain":"Text","text/html":"Url",default:"Text"},p="Copy to clipboard: #{key}, Enter";function m(c){var i=(/mac os x/i.test(navigator.userAgent)?"⌘":"Ctrl")+"+C";return c.replace(/#{\s*key\s*}/g,i)}function d(c,i){var y,h,I,g,b,l,_=!1;i||(i={}),y=i.debug||!1;try{I=s(),g=document.createRange(),b=document.getSelection(),l=document.createElement("span"),l.textContent=c,l.ariaHidden="true",l.style.all="unset",l.style.position="fixed",l.style.top=0,l.style.clip="rect(0, 0, 0, 0)",l.style.whiteSpace="pre",l.style.webkitUserSelect="text",l.style.MozUserSelect="text",l.style.msUserSelect="text",l.style.userSelect="text",l.addEventListener("copy",function(u){if(u.stopPropagation(),i.format)if(u.preventDefault(),typeof u.clipboardData>"u"){y&&console.warn("unable to use e.clipboardData"),y&&console.warn("trying IE specific stuff"),window.clipboardData.clearData();var v=n[i.format]||n.default;window.clipboardData.setData(v,c)}else u.clipboardData.clearData(),u.clipboardData.setData(i.format,c);i.onCopy&&(u.preventDefault(),i.onCopy(u.clipboardData))}),document.body.appendChild(l),g.selectNodeContents(l),b.addRange(g);var E=document.execCommand("copy");if(!E)throw new Error("copy command was unsuccessful");_=!0}catch(u){y&&console.error("unable to copy using execCommand: ",u),y&&console.warn("trying IE specific stuff");try{window.clipboardData.setData(i.format||"text",c),i.onCopy&&i.onCopy(window.clipboardData),_=!0}catch(v){y&&console.error("unable to copy using clipboardData: ",v),y&&console.error("falling back to prompt"),h=m("message"in i?i.message:p),window.prompt(h,c)}}finally{b&&(typeof b.removeRange=="function"?b.removeRange(g):b.removeAllRanges()),l&&document.body.removeChild(l),I()}return _}return M=d,M}var H;function Je(){if(H)return R;H=1,Object.defineProperty(R,"__esModule",{value:!0}),R.CopyToClipboard=void 0;var s=m(Ge()),n=m(Fe()),p=["text","onCopy","options","children"];function m(e){return e&&e.__esModule?e:{default:e}}function d(e){"@babel/helpers - typeof";return d=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(t){return typeof t}:function(t){return t&&typeof Symbol=="function"&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},d(e)}function c(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);t&&(o=o.filter(function(f){return Object.getOwnPropertyDescriptor(e,f).enumerable})),r.push.apply(r,o)}return r}function i(e){for(var t=1;t<arguments.length;t++){var r=arguments[t]!=null?arguments[t]:{};t%2?c(Object(r),!0).forEach(function(o){F(e,o,r[o])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):c(Object(r)).forEach(function(o){Object.defineProperty(e,o,Object.getOwnPropertyDescriptor(r,o))})}return e}function y(e,t){if(e==null)return{};var r,o,f=h(e,t);if(Object.getOwnPropertySymbols){var x=Object.getOwnPropertySymbols(e);for(o=0;o<x.length;o++)r=x[o],t.indexOf(r)===-1&&{}.propertyIsEnumerable.call(e,r)&&(f[r]=e[r])}return f}function h(e,t){if(e==null)return{};var r={};for(var o in e)if({}.hasOwnProperty.call(e,o)){if(t.indexOf(o)!==-1)continue;r[o]=e[o]}return r}function I(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function g(e,t){for(var r=0;r<t.length;r++){var o=t[r];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,L(o.key),o)}}function b(e,t,r){return t&&g(e.prototype,t),Object.defineProperty(e,"prototype",{writable:!1}),e}function l(e,t,r){return t=v(t),_(e,u()?Reflect.construct(t,r||[],v(e).constructor):t.apply(e,r))}function _(e,t){if(t&&(d(t)=="object"||typeof t=="function"))return t;if(t!==void 0)throw new TypeError("Derived constructors may only return object or undefined");return E(e)}function E(e){if(e===void 0)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function u(){try{var e=!Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){}))}catch{}return(u=function(){return!!e})()}function v(e){return v=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(t){return t.__proto__||Object.getPrototypeOf(t)},v(e)}function Ae(e,t){if(typeof t!="function"&&t!==null)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),Object.defineProperty(e,"prototype",{writable:!1}),t&&B(e,t)}function B(e,t){return B=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(r,o){return r.__proto__=o,r},B(e,t)}function F(e,t,r){return(t=L(t))in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function L(e){var t=ke(e,"string");return d(t)=="symbol"?t:t+""}function ke(e,t){if(d(e)!="object"||!e)return e;var r=e[Symbol.toPrimitive];if(r!==void 0){var o=r.call(e,t);if(d(o)!="object")return o;throw new TypeError("@@toPrimitive must return a primitive value.")}return(t==="string"?String:Number)(e)}var Oe=R.CopyToClipboard=(function(e){function t(){var r;I(this,t);for(var o=arguments.length,f=new Array(o),x=0;x<o;x++)f[x]=arguments[x];return r=l(this,t,[].concat(f)),F(r,"onClick",function(N){var P=r.props,$=P.text,U=P.onCopy,Pe=P.children,Ee=P.options,w=n.default.Children.only(Pe),Be=(0,s.default)($,Ee);U&&U($,Be),w!=null&&w.props&&typeof w.props.onClick=="function"&&w.props.onClick(N)}),r}return Ae(t,e),b(t,[{key:"render",value:function(){var o=this.props;o.text,o.onCopy,o.options;var f=o.children,x=y(o,p),N=n.default.Children.only(f);return n.default.cloneElement(N,i(i({},x),{},{onClick:this.onClick}))}}])})(n.default.PureComponent);return F(Oe,"defaultProps",{onCopy:void 0,options:void 0}),R}var Q,G;function Xe(){if(G)return Q;G=1;var s=Je(),n=s.CopyToClipboard;return n.CopyToClipboard=n,Q=n,Q}var Ye=Xe();const De=({sessionFrgmt:s,maxInline:n=3,emptyText:p="-"})=>{const{t:m}=Ne(),d=Re.useFragment(je,s),c=qe.useMemo(()=>Le(d.agent_ids??[]),[d.agent_ids]),i=c.slice(0,n).join(", "),y=c.slice(n),h=We([c.length-n,0])||0,I=`${m("comp:BAISessionAgentIds.Agent")} (${c.length})`;return c.length===0?p:a.jsxs("span",{children:[a.jsx(z,{children:i}),h>0&&a.jsxs(a.Fragment,{children:[" ",a.jsx(ze,{label:I,content:a.jsxs("div",{style:{maxHeight:240,overflow:"auto",minWidth:260},children:[a.jsxs(K,{justify:"between",align:"center",children:[a.jsx("span",{children:I}),a.jsx(Ye.CopyToClipboard,{text:c.join(", "),children:a.jsx(Ke,{size:"small",type:"text",icon:a.jsx(Qe,{size:"1em"}),children:m("general.button.CopyAll")})})]}),a.jsx("ul",{style:{paddingLeft:16,margin:0},children:y.map(g=>a.jsx("li",{style:{listStyle:"disc"},children:a.jsx(z,{children:g})},g))})]}),children:a.jsxs(Me,{children:["+",h]})})]})]})},Te=(function(){var s=[{kind:"Literal",name:"id",value:"test-id"}];return{fragment:{argumentDefinitions:[],kind:"Fragment",metadata:null,name:"BAISessionAgentIdsStoriesQuery",selections:[{alias:null,args:s,concreteType:"ComputeSessionNode",kind:"LinkedField",name:"compute_session_node",plural:!1,selections:[{args:null,kind:"FragmentSpread",name:"BAISessionAgentIdsFragment"}],storageKey:'compute_session_node(id:"test-id")'}],type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[],kind:"Operation",name:"BAISessionAgentIdsStoriesQuery",selections:[{alias:null,args:s,concreteType:"ComputeSessionNode",kind:"LinkedField",name:"compute_session_node",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"agent_ids",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null}],storageKey:'compute_session_node(id:"test-id")'}]},params:{cacheID:"6bdbf530e7619125e934b54280a794d2",id:null,metadata:{},name:"BAISessionAgentIdsStoriesQuery",operationKind:"query",text:`query BAISessionAgentIdsStoriesQuery {
  compute_session_node(id: "test-id") {
    ...BAISessionAgentIdsFragment
    id
  }
}

fragment BAISessionAgentIdsFragment on ComputeSessionNode {
  agent_ids
}
`}}})();Te.hash="068be8ce5242b69ece5f2ba69ae4069f";const vt={title:"Fragments/BAISessionAgentIds",component:De,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:`
**BAISessionAgentIds** displays a list of agent IDs for compute sessions.

## Features
- Inline display of agent IDs with configurable limit
- Popover to show remaining agent IDs when exceeding limit
- Copy all agent IDs to clipboard functionality
- Removes duplicate agent IDs automatically
- Customizable empty state text

## Usage
\`\`\`tsx
// Default (shows up to 3 agent IDs inline)
<BAISessionAgentIds sessionFrgmt={session} />

// Custom inline limit
<BAISessionAgentIds sessionFrgmt={session} maxInline={5} />

// Custom empty text
<BAISessionAgentIds sessionFrgmt={session} emptyText="No agents" />
\`\`\`

## Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| \`sessionFrgmt\` | \`BAISessionAgentIdsFragment$key\` | - | Relay fragment reference for session |
| \`maxInline\` | \`number\` | \`3\` | Maximum number of agent IDs to display inline |
| \`emptyText\` | \`string\` | \`'-'\` | Text to display when no agents exist |
        `}}},argTypes:{maxInline:{control:{type:"number",min:1,max:10},description:"Maximum number of agent IDs to display inline",table:{type:{summary:"number"},defaultValue:{summary:"3"}}},emptyText:{control:{type:"text"},description:"Text to display when no agents exist",table:{type:{summary:"string"},defaultValue:{summary:"'-'"}}},sessionFrgmt:{control:!1,description:"Relay fragment reference for session"}}},S=s=>{const{compute_session_node:n}=Re.useLazyLoadQuery(Te,{});return n&&a.jsx(De,{sessionFrgmt:n,...s})},j={name:"Basic",args:{maxInline:3,emptyText:"-"},parameters:{docs:{description:{story:'Displays multiple agent IDs with the default limit of 3 inline agents. Click "+2" to see the popover with remaining agents.'}}},render:({maxInline:s,emptyText:n})=>a.jsx(C,{mockResolvers:{ComputeSessionNode:()=>({agent_ids:["i-1234567890abcdef0","i-2345678901bcdef01","i-3456789012cdef012","i-4567890123def0123","i-567890124ef01234"]})},children:a.jsx(S,{maxInline:s,emptyText:n})})},D={args:{maxInline:3,emptyText:"-"},parameters:{docs:{description:{story:"Displays a single agent ID without the popover."}}},render:({maxInline:s,emptyText:n})=>a.jsx(C,{mockResolvers:{ComputeSessionNode:()=>({agent_ids:["i-1234567890abcdef0"]})},children:a.jsx(S,{maxInline:s,emptyText:n})})},T={args:{maxInline:3,emptyText:"-"},parameters:{docs:{description:{story:"Displays the empty state text when no agents exist."}}},render:({maxInline:s,emptyText:n})=>a.jsx(C,{mockResolvers:{ComputeSessionNode:()=>({agent_ids:[]})},children:a.jsx(S,{maxInline:s,emptyText:n})})},A={args:{maxInline:3,emptyText:"No agents available"},parameters:{docs:{description:{story:"Displays custom empty state text."}}},render:({maxInline:s,emptyText:n})=>a.jsx(C,{mockResolvers:{ComputeSessionNode:()=>({agent_ids:[]})},children:a.jsx(S,{maxInline:s,emptyText:n})})},k={args:{maxInline:5,emptyText:"-"},parameters:{docs:{description:{story:'Displays many agent IDs with maxInline set to 5. Click "+5" to see the popover with 10 total agents.'}}},render:({maxInline:s,emptyText:n})=>a.jsx(C,{mockResolvers:{ComputeSessionNode:()=>({agent_ids:Array.from({length:10},(p,m)=>`i-agent-${m+1}`)})},children:a.jsx(S,{maxInline:s,emptyText:n})})},O={parameters:{docs:{description:{story:"Displays all different configurations of agent ID display."}}},render:()=>{const s=[{label:"Single agent",agent_ids:["i-1234567890abcdef0"],maxInline:3},{label:"Multiple agents (default)",agent_ids:["i-agent-1","i-agent-2","i-agent-3","i-agent-4","i-agent-5"],maxInline:3},{label:"Many agents (maxInline: 5)",agent_ids:Array.from({length:10},(n,p)=>`i-agent-${p+1}`),maxInline:5},{label:"Empty state",agent_ids:[],maxInline:3}];return a.jsx(K,{direction:"column",gap:"md",align:"start",children:s.map((n,p)=>a.jsx(C,{mockResolvers:{ComputeSessionNode:()=>({agent_ids:n.agent_ids})},children:a.jsxs(K,{direction:"row",gap:"md",align:"start",children:[a.jsx("div",{style:{width:240},children:a.jsxs("strong",{children:[n.label,":"]})}),a.jsx(S,{maxInline:n.maxInline})]})},p))})}};var J,X,Y,Z,ee;j.parameters={...j.parameters,docs:{...(J=j.parameters)==null?void 0:J.docs,source:{originalSource:`{
  name: 'Basic',
  args: {
    maxInline: 3,
    emptyText: '-'
  },
  parameters: {
    docs: {
      description: {
        story: 'Displays multiple agent IDs with the default limit of 3 inline agents. Click "+2" to see the popover with remaining agents.'
      }
    }
  },
  render: ({
    maxInline,
    emptyText
  }) => <RelayResolver mockResolvers={{
    ComputeSessionNode: () => ({
      agent_ids: ['i-1234567890abcdef0', 'i-2345678901bcdef01', 'i-3456789012cdef012', 'i-4567890123def0123', 'i-567890124ef01234']
    })
  }}>
      <QueryResolver maxInline={maxInline} emptyText={emptyText} />
    </RelayResolver>
}`,...(Y=(X=j.parameters)==null?void 0:X.docs)==null?void 0:Y.source},description:{story:"Default story showing multiple agent IDs.",...(ee=(Z=j.parameters)==null?void 0:Z.docs)==null?void 0:ee.description}}};var te,ne,re,oe,se;D.parameters={...D.parameters,docs:{...(te=D.parameters)==null?void 0:te.docs,source:{originalSource:`{
  args: {
    maxInline: 3,
    emptyText: '-'
  },
  parameters: {
    docs: {
      description: {
        story: 'Displays a single agent ID without the popover.'
      }
    }
  },
  render: ({
    maxInline,
    emptyText
  }) => <RelayResolver mockResolvers={{
    ComputeSessionNode: () => ({
      agent_ids: ['i-1234567890abcdef0']
    })
  }}>
      <QueryResolver maxInline={maxInline} emptyText={emptyText} />
    </RelayResolver>
}`,...(re=(ne=D.parameters)==null?void 0:ne.docs)==null?void 0:re.source},description:{story:"Story showing single agent ID.",...(se=(oe=D.parameters)==null?void 0:oe.docs)==null?void 0:se.description}}};var ae,ie,le,ce,pe;T.parameters={...T.parameters,docs:{...(ae=T.parameters)==null?void 0:ae.docs,source:{originalSource:`{
  args: {
    maxInline: 3,
    emptyText: '-'
  },
  parameters: {
    docs: {
      description: {
        story: 'Displays the empty state text when no agents exist.'
      }
    }
  },
  render: ({
    maxInline,
    emptyText
  }) => <RelayResolver mockResolvers={{
    ComputeSessionNode: () => ({
      agent_ids: []
    })
  }}>
      <QueryResolver maxInline={maxInline} emptyText={emptyText} />
    </RelayResolver>
}`,...(le=(ie=T.parameters)==null?void 0:ie.docs)==null?void 0:le.source},description:{story:"Story showing empty state.",...(pe=(ce=T.parameters)==null?void 0:ce.docs)==null?void 0:pe.description}}};var me,de,ue,ye,ge;A.parameters={...A.parameters,docs:{...(me=A.parameters)==null?void 0:me.docs,source:{originalSource:`{
  args: {
    maxInline: 3,
    emptyText: 'No agents available'
  },
  parameters: {
    docs: {
      description: {
        story: 'Displays custom empty state text.'
      }
    }
  },
  render: ({
    maxInline,
    emptyText
  }) => <RelayResolver mockResolvers={{
    ComputeSessionNode: () => ({
      agent_ids: []
    })
  }}>
      <QueryResolver maxInline={maxInline} emptyText={emptyText} />
    </RelayResolver>
}`,...(ue=(de=A.parameters)==null?void 0:de.docs)==null?void 0:ue.source},description:{story:"Story showing custom empty text.",...(ge=(ye=A.parameters)==null?void 0:ye.docs)==null?void 0:ge.description}}};var fe,xe,be,ve,he;k.parameters={...k.parameters,docs:{...(fe=k.parameters)==null?void 0:fe.docs,source:{originalSource:`{
  args: {
    maxInline: 5,
    emptyText: '-'
  },
  parameters: {
    docs: {
      description: {
        story: 'Displays many agent IDs with maxInline set to 5. Click "+5" to see the popover with 10 total agents.'
      }
    }
  },
  render: ({
    maxInline,
    emptyText
  }) => <RelayResolver mockResolvers={{
    ComputeSessionNode: () => ({
      agent_ids: Array.from({
        length: 10
      }, (_, i) => \`i-agent-\${i + 1}\`)
    })
  }}>
      <QueryResolver maxInline={maxInline} emptyText={emptyText} />
    </RelayResolver>
}`,...(be=(xe=k.parameters)==null?void 0:xe.docs)==null?void 0:be.source},description:{story:"Story showing many agent IDs with custom inline limit.",...(he=(ve=k.parameters)==null?void 0:ve.docs)==null?void 0:he.description}}};var Ie,Ce,Se,_e,we;O.parameters={...O.parameters,docs:{...(Ie=O.parameters)==null?void 0:Ie.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Displays all different configurations of agent ID display.'
      }
    }
  },
  render: () => {
    const variants = [{
      label: 'Single agent',
      agent_ids: ['i-1234567890abcdef0'],
      maxInline: 3
    }, {
      label: 'Multiple agents (default)',
      agent_ids: ['i-agent-1', 'i-agent-2', 'i-agent-3', 'i-agent-4', 'i-agent-5'],
      maxInline: 3
    }, {
      label: 'Many agents (maxInline: 5)',
      agent_ids: Array.from({
        length: 10
      }, (_, i) => \`i-agent-\${i + 1}\`),
      maxInline: 5
    }, {
      label: 'Empty state',
      agent_ids: [],
      maxInline: 3
    }];
    return <BAIFlex direction="column" gap="md" align="start">
        {variants.map((variant, index) => <RelayResolver key={index} mockResolvers={{
        ComputeSessionNode: () => ({
          agent_ids: variant.agent_ids
        })
      }}>
            <BAIFlex direction="row" gap="md" align="start">
              <div style={{
            width: 240
          }}>
                <strong>{variant.label}:</strong>
              </div>
              <QueryResolver maxInline={variant.maxInline} />
            </BAIFlex>
          </RelayResolver>)}
      </BAIFlex>;
  }
}`,...(Se=(Ce=O.parameters)==null?void 0:Ce.docs)==null?void 0:Se.source},description:{story:"Story showing all variants together.",...(we=(_e=O.parameters)==null?void 0:_e.docs)==null?void 0:we.description}}};const ht=["Default","SingleAgent","Empty","CustomEmptyText","ManyAgents","AllVariants"];export{O as AllVariants,A as CustomEmptyText,j as Default,T as Empty,k as ManyAgents,D as SingleAgent,ht as __namedExportsOrder,vt as default};
