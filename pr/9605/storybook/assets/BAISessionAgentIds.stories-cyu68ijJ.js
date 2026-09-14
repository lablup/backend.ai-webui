import{cl as Fe,a as Ne,r as qe,j as a,b as z,aA as Me,aN as Qe}from"./iframe-BrQt0jff.js";import{R as C}from"./RelayResolver-DOglKtbe.js";import{B as K}from"./BAIFlex-DPgw94h-.js";import{B as Ke}from"./BAIButton-i_HT2g9X.js";import{r as Re}from"./index-Dammrbo7.js";import{u as Le}from"./uniq-Cu1g6dGf.js";import{m as $e}from"./max-DQQqib0r.js";import{P as Ue}from"./Popover-3toeau0a.js";import"./preload-helper-Dp1pzeXC.js";import"./index-BJaoR4W4.js";import"./astryxLabel-CZY2Y6yW.js";import"./_baseIndexOf-Be9UPhX8.js";import"./_baseFindIndex-Cj99RmFE.js";import"./noop-DX6rZLP_.js";import"./_baseExtremum-C99LSEm1.js";import"./isSymbol-C0U1uVdn.js";import"./identity-DKeuBCMA.js";import"./usePopover-t29snwJf.js";import"./useDevWarning-DJL_th0q.js";import"./rtlStyles-T4i24HtE.js";const je={argumentDefinitions:[],kind:"Fragment",metadata:null,name:"BAISessionAgentIdsFragment",selections:[{alias:null,args:null,kind:"ScalarField",name:"agent_ids",storageKey:null}],type:"ComputeSessionNode",abstractKey:null};je.hash="42a06f8e2b4b445e08e0f94066e8ea58";var R={},q,V;function ze(){return V||(V=1,q=function(){var s=document.getSelection();if(!s.rangeCount)return function(){};for(var o=document.activeElement,p=[],m=0;m<s.rangeCount;m++)p.push(s.getRangeAt(m));switch(o.tagName.toUpperCase()){case"INPUT":case"TEXTAREA":o.blur();break;default:o=null;break}return s.removeAllRanges(),function(){s.type==="Caret"&&s.removeAllRanges(),s.rangeCount||p.forEach(function(d){s.addRange(d)}),o&&o.focus()}}),q}var M,W;function Ve(){if(W)return M;W=1;var s=ze(),o={"text/plain":"Text","text/html":"Url",default:"Text"},p="Copy to clipboard: #{key}, Enter";function m(c){var i=(/mac os x/i.test(navigator.userAgent)?"⌘":"Ctrl")+"+C";return c.replace(/#{\s*key\s*}/g,i)}function d(c,i){var y,h,I,g,b,l,_=!1;i||(i={}),y=i.debug||!1;try{I=s(),g=document.createRange(),b=document.getSelection(),l=document.createElement("span"),l.textContent=c,l.ariaHidden="true",l.style.all="unset",l.style.position="fixed",l.style.top=0,l.style.clip="rect(0, 0, 0, 0)",l.style.whiteSpace="pre",l.style.webkitUserSelect="text",l.style.MozUserSelect="text",l.style.msUserSelect="text",l.style.userSelect="text",l.addEventListener("copy",function(u){if(u.stopPropagation(),i.format)if(u.preventDefault(),typeof u.clipboardData>"u"){y&&console.warn("unable to use e.clipboardData"),y&&console.warn("trying IE specific stuff"),window.clipboardData.clearData();var v=o[i.format]||o.default;window.clipboardData.setData(v,c)}else u.clipboardData.clearData(),u.clipboardData.setData(i.format,c);i.onCopy&&(u.preventDefault(),i.onCopy(u.clipboardData))}),document.body.appendChild(l),g.selectNodeContents(l),b.addRange(g);var E=document.execCommand("copy");if(!E)throw new Error("copy command was unsuccessful");_=!0}catch(u){y&&console.error("unable to copy using execCommand: ",u),y&&console.warn("trying IE specific stuff");try{window.clipboardData.setData(i.format||"text",c),i.onCopy&&i.onCopy(window.clipboardData),_=!0}catch(v){y&&console.error("unable to copy using clipboardData: ",v),y&&console.error("falling back to prompt"),h=m("message"in i?i.message:p),window.prompt(h,c)}}finally{b&&(typeof b.removeRange=="function"?b.removeRange(g):b.removeAllRanges()),l&&document.body.removeChild(l),I()}return _}return M=d,M}var H;function We(){if(H)return R;H=1,Object.defineProperty(R,"__esModule",{value:!0}),R.CopyToClipboard=void 0;var s=m(Ve()),o=m(Fe()),p=["text","onCopy","options","children"];function m(e){return e&&e.__esModule?e:{default:e}}function d(e){"@babel/helpers - typeof";return d=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(t){return typeof t}:function(t){return t&&typeof Symbol=="function"&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},d(e)}function c(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter(function(f){return Object.getOwnPropertyDescriptor(e,f).enumerable})),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=arguments[t]!=null?arguments[t]:{};t%2?c(Object(n),!0).forEach(function(r){F(e,r,n[r])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):c(Object(n)).forEach(function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(n,r))})}return e}function y(e,t){if(e==null)return{};var n,r,f=h(e,t);if(Object.getOwnPropertySymbols){var x=Object.getOwnPropertySymbols(e);for(r=0;r<x.length;r++)n=x[r],t.indexOf(n)===-1&&{}.propertyIsEnumerable.call(e,n)&&(f[n]=e[n])}return f}function h(e,t){if(e==null)return{};var n={};for(var r in e)if({}.hasOwnProperty.call(e,r)){if(t.indexOf(r)!==-1)continue;n[r]=e[r]}return n}function I(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function g(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,L(r.key),r)}}function b(e,t,n){return t&&g(e.prototype,t),Object.defineProperty(e,"prototype",{writable:!1}),e}function l(e,t,n){return t=v(t),_(e,u()?Reflect.construct(t,n||[],v(e).constructor):t.apply(e,n))}function _(e,t){if(t&&(d(t)=="object"||typeof t=="function"))return t;if(t!==void 0)throw new TypeError("Derived constructors may only return object or undefined");return E(e)}function E(e){if(e===void 0)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function u(){try{var e=!Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){}))}catch{}return(u=function(){return!!e})()}function v(e){return v=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(t){return t.__proto__||Object.getPrototypeOf(t)},v(e)}function Ae(e,t){if(typeof t!="function"&&t!==null)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),Object.defineProperty(e,"prototype",{writable:!1}),t&&B(e,t)}function B(e,t){return B=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(n,r){return n.__proto__=r,n},B(e,t)}function F(e,t,n){return(t=L(t))in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function L(e){var t=ke(e,"string");return d(t)=="symbol"?t:t+""}function ke(e,t){if(d(e)!="object"||!e)return e;var n=e[Symbol.toPrimitive];if(n!==void 0){var r=n.call(e,t);if(d(r)!="object")return r;throw new TypeError("@@toPrimitive must return a primitive value.")}return(t==="string"?String:Number)(e)}var Oe=R.CopyToClipboard=(function(e){function t(){var n;I(this,t);for(var r=arguments.length,f=new Array(r),x=0;x<r;x++)f[x]=arguments[x];return n=l(this,t,[].concat(f)),F(n,"onClick",function(N){var P=n.props,$=P.text,U=P.onCopy,Pe=P.children,Ee=P.options,w=o.default.Children.only(Pe),Be=(0,s.default)($,Ee);U&&U($,Be),w!=null&&w.props&&typeof w.props.onClick=="function"&&w.props.onClick(N)}),n}return Ae(t,e),b(t,[{key:"render",value:function(){var r=this.props;r.text,r.onCopy,r.options;var f=r.children,x=y(r,p),N=o.default.Children.only(f);return o.default.cloneElement(N,i(i({},x),{},{onClick:this.onClick}))}}])})(o.default.PureComponent);return F(Oe,"defaultProps",{onCopy:void 0,options:void 0}),R}var Q,X;function He(){if(X)return Q;X=1;var s=We(),o=s.CopyToClipboard;return o.CopyToClipboard=o,Q=o,Q}var Xe=He();const De=({sessionFrgmt:s,maxInline:o=3,emptyText:p="-"})=>{const{t:m}=Ne(),d=Re.useFragment(je,s),c=qe.useMemo(()=>Le(d.agent_ids??[]),[d.agent_ids]),i=c.slice(0,o).join(", "),y=c.slice(o),h=$e([c.length-o,0])||0,I=`${m("comp:BAISessionAgentIds.Agent")} (${c.length})`;return c.length===0?p:a.jsxs("span",{children:[a.jsx(z,{children:i}),h>0&&a.jsxs(a.Fragment,{children:[" ",a.jsx(Ue,{label:I,content:a.jsxs("div",{style:{maxHeight:240,overflow:"auto",minWidth:260},children:[a.jsxs(K,{justify:"between",align:"center",children:[a.jsx("span",{children:I}),a.jsx(Xe.CopyToClipboard,{text:c.join(", "),children:a.jsx(Ke,{size:"small",type:"text",icon:a.jsx(Qe,{size:"1em"}),children:m("general.button.CopyAll")})})]}),a.jsx("ul",{style:{paddingLeft:16,margin:0},children:y.map(g=>a.jsx("li",{style:{listStyle:"disc"},children:a.jsx(z,{children:g})},g))})]}),children:a.jsxs(Me,{children:["+",h]})})]})]})},Te=(function(){var s=[{kind:"Literal",name:"id",value:"test-id"}];return{fragment:{argumentDefinitions:[],kind:"Fragment",metadata:null,name:"BAISessionAgentIdsStoriesQuery",selections:[{alias:null,args:s,concreteType:"ComputeSessionNode",kind:"LinkedField",name:"compute_session_node",plural:!1,selections:[{args:null,kind:"FragmentSpread",name:"BAISessionAgentIdsFragment"}],storageKey:'compute_session_node(id:"test-id")'}],type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[],kind:"Operation",name:"BAISessionAgentIdsStoriesQuery",selections:[{alias:null,args:s,concreteType:"ComputeSessionNode",kind:"LinkedField",name:"compute_session_node",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"agent_ids",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null}],storageKey:'compute_session_node(id:"test-id")'}]},params:{cacheID:"6bdbf530e7619125e934b54280a794d2",id:null,metadata:{},name:"BAISessionAgentIdsStoriesQuery",operationKind:"query",text:`query BAISessionAgentIdsStoriesQuery {
  compute_session_node(id: "test-id") {
    ...BAISessionAgentIdsFragment
    id
  }
}

fragment BAISessionAgentIdsFragment on ComputeSessionNode {
  agent_ids
}
`}}})();Te.hash="068be8ce5242b69ece5f2ba69ae4069f";const ft={title:"Fragments/BAISessionAgentIds",component:De,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:`
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
        `}}},argTypes:{maxInline:{control:{type:"number",min:1,max:10},description:"Maximum number of agent IDs to display inline",table:{type:{summary:"number"},defaultValue:{summary:"3"}}},emptyText:{control:{type:"text"},description:"Text to display when no agents exist",table:{type:{summary:"string"},defaultValue:{summary:"'-'"}}},sessionFrgmt:{control:!1,description:"Relay fragment reference for session"}}},S=s=>{const{compute_session_node:o}=Re.useLazyLoadQuery(Te,{});return o&&a.jsx(De,{sessionFrgmt:o,...s})},j={name:"Basic",args:{maxInline:3,emptyText:"-"},parameters:{docs:{description:{story:'Displays multiple agent IDs with the default limit of 3 inline agents. Click "+2" to see the popover with remaining agents.'}}},render:({maxInline:s,emptyText:o})=>a.jsx(C,{mockResolvers:{ComputeSessionNode:()=>({agent_ids:["i-1234567890abcdef0","i-2345678901bcdef01","i-3456789012cdef012","i-4567890123def0123","i-567890124ef01234"]})},children:a.jsx(S,{maxInline:s,emptyText:o})})},D={args:{maxInline:3,emptyText:"-"},parameters:{docs:{description:{story:"Displays a single agent ID without the popover."}}},render:({maxInline:s,emptyText:o})=>a.jsx(C,{mockResolvers:{ComputeSessionNode:()=>({agent_ids:["i-1234567890abcdef0"]})},children:a.jsx(S,{maxInline:s,emptyText:o})})},T={args:{maxInline:3,emptyText:"-"},parameters:{docs:{description:{story:"Displays the empty state text when no agents exist."}}},render:({maxInline:s,emptyText:o})=>a.jsx(C,{mockResolvers:{ComputeSessionNode:()=>({agent_ids:[]})},children:a.jsx(S,{maxInline:s,emptyText:o})})},A={args:{maxInline:3,emptyText:"No agents available"},parameters:{docs:{description:{story:"Displays custom empty state text."}}},render:({maxInline:s,emptyText:o})=>a.jsx(C,{mockResolvers:{ComputeSessionNode:()=>({agent_ids:[]})},children:a.jsx(S,{maxInline:s,emptyText:o})})},k={args:{maxInline:5,emptyText:"-"},parameters:{docs:{description:{story:'Displays many agent IDs with maxInline set to 5. Click "+5" to see the popover with 10 total agents.'}}},render:({maxInline:s,emptyText:o})=>a.jsx(C,{mockResolvers:{ComputeSessionNode:()=>({agent_ids:Array.from({length:10},(p,m)=>`i-agent-${m+1}`)})},children:a.jsx(S,{maxInline:s,emptyText:o})})},O={parameters:{docs:{description:{story:"Displays all different configurations of agent ID display."}}},render:()=>{const s=[{label:"Single agent",agent_ids:["i-1234567890abcdef0"],maxInline:3},{label:"Multiple agents (default)",agent_ids:["i-agent-1","i-agent-2","i-agent-3","i-agent-4","i-agent-5"],maxInline:3},{label:"Many agents (maxInline: 5)",agent_ids:Array.from({length:10},(o,p)=>`i-agent-${p+1}`),maxInline:5},{label:"Empty state",agent_ids:[],maxInline:3}];return a.jsx(K,{direction:"column",gap:"md",align:"start",children:s.map((o,p)=>a.jsx(C,{mockResolvers:{ComputeSessionNode:()=>({agent_ids:o.agent_ids})},children:a.jsxs(K,{direction:"row",gap:"md",align:"start",children:[a.jsx("div",{style:{width:240},children:a.jsxs("strong",{children:[o.label,":"]})}),a.jsx(S,{maxInline:o.maxInline})]})},p))})}};var G,J,Y,Z,ee;j.parameters={...j.parameters,docs:{...(G=j.parameters)==null?void 0:G.docs,source:{originalSource:`{
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
}`,...(Y=(J=j.parameters)==null?void 0:J.docs)==null?void 0:Y.source},description:{story:"Default story showing multiple agent IDs.",...(ee=(Z=j.parameters)==null?void 0:Z.docs)==null?void 0:ee.description}}};var te,ne,re,oe,se;D.parameters={...D.parameters,docs:{...(te=D.parameters)==null?void 0:te.docs,source:{originalSource:`{
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
}`,...(Se=(Ce=O.parameters)==null?void 0:Ce.docs)==null?void 0:Se.source},description:{story:"Story showing all variants together.",...(we=(_e=O.parameters)==null?void 0:_e.docs)==null?void 0:we.description}}};const xt=["Default","SingleAgent","Empty","CustomEmptyText","ManyAgents","AllVariants"];export{O as AllVariants,A as CustomEmptyText,j as Default,T as Empty,k as ManyAgents,D as SingleAgent,xt as __namedExportsOrder,ft as default};
