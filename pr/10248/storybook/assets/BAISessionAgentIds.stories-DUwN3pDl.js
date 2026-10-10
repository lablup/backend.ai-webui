import{b_ as ke,b$ as Pe,b as Be,r as Fe,j as s,X as q,b1 as Ne}from"./iframe-BqBmlbKD.js";import{R as u}from"./RelayResolver-BnKG7aGb.js";import{B}from"./BAIFlex-L87JBiVD.js";import{B as Ee}from"./BAIButton-CMZQ-V96.js";import{r as be}from"./index-DzyhwAdW.js";import{u as Qe}from"./uniq-uTPlfOJV.js";import{m as qe}from"./max-BJyS9ENh.js";import{P as Le}from"./Popover-CuHa0yp-.js";import{L as Me}from"./Link-WWyE16JJ.js";import"./preload-helper-Dp1pzeXC.js";import"./index-Bn0CCyAA.js";import"./astryxLabel-CsScDvsA.js";import"./_baseUniq-B4Uj2Hm2.js";import"./_arrayIncludes-B0rj_Tme.js";import"./_baseIndexOf-Be9UPhX8.js";import"./_baseFindIndex-Cj99RmFE.js";import"./isSymbol-CT9g8mK1.js";import"./identity-DKeuBCMA.js";import"./usePopover-bUwlMvez.js";import"./useDevWarning-B-F0m8G5.js";import"./rtlStyles-T4i24HtE.js";import"./useInteractiveRole-DvF-DYBp.js";import"./computeTargetAndRel-BGwjeA1c.js";const he={argumentDefinitions:[],kind:"Fragment",metadata:null,name:"BAISessionAgentIdsFragment",selections:[{alias:null,args:null,kind:"ScalarField",name:"agent_ids",storageKey:null}],type:"ComputeSessionNode",abstractKey:null};he.hash="42a06f8e2b4b445e08e0f94066e8ea58";var f={},L;function $e(){if(L)return f;L=1,Object.defineProperty(f,"__esModule",{value:!0}),f.CopyToClipboard=void 0;var i=d(Pe()),o=d(ke()),m=["text","onCopy","options","children"];function d(e){return e&&e.__esModule?e:{default:e}}function a(e){"@babel/helpers - typeof";return a=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(t){return typeof t}:function(t){return t&&typeof Symbol=="function"&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},a(e)}function l(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter(function(p){return Object.getOwnPropertyDescriptor(e,p).enumerable})),n.push.apply(n,r)}return n}function C(e){for(var t=1;t<arguments.length;t++){var n=arguments[t]!=null?arguments[t]:{};t%2?l(Object(n),!0).forEach(function(r){O(e,r,n[r])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):l(Object(n)).forEach(function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(n,r))})}return e}function T(e,t){if(e==null)return{};var n,r,p=S(e,t);if(Object.getOwnPropertySymbols){var c=Object.getOwnPropertySymbols(e);for(r=0;r<c.length;r++)n=c[r],t.indexOf(n)===-1&&{}.propertyIsEnumerable.call(e,n)&&(p[n]=e[n])}return p}function S(e,t){if(e==null)return{};var n={};for(var r in e)if({}.hasOwnProperty.call(e,r)){if(t.indexOf(r)!==-1)continue;n[r]=e[r]}return n}function j(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function R(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,N(r.key),r)}}function _e(e,t,n){return t&&R(e.prototype,t),Object.defineProperty(e,"prototype",{writable:!1}),e}function Ce(e,t,n){return t=w(t),Se(e,F()?Reflect.construct(t,n||[],w(e).constructor):t.apply(e,n))}function Se(e,t){if(t&&(a(t)=="object"||typeof t=="function"))return t;if(t!==void 0)throw new TypeError("Derived constructors may only return object or undefined");return je(e)}function je(e){if(e===void 0)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function F(){try{var e=!Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){}))}catch{}return(F=function(){return!!e})()}function w(e){return w=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(t){return t.__proto__||Object.getPrototypeOf(t)},w(e)}function Re(e,t){if(typeof t!="function"&&t!==null)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),Object.defineProperty(e,"prototype",{writable:!1}),t&&D(e,t)}function D(e,t){return D=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(n,r){return n.__proto__=r,n},D(e,t)}function O(e,t,n){return(t=N(t))in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function N(e){var t=we(e,"string");return a(t)=="symbol"?t:t+""}function we(e,t){if(a(e)!="object"||!e)return e;var n=e[Symbol.toPrimitive];if(n!==void 0){var r=n.call(e,t);if(a(r)!="object")return r;throw new TypeError("@@toPrimitive must return a primitive value.")}return(t==="string"?String:Number)(e)}var Ae=f.CopyToClipboard=(function(e){function t(){var n;j(this,t);for(var r=arguments.length,p=new Array(r),c=0;c<r;c++)p[c]=arguments[c];return n=Ce(this,t,[].concat(p)),O(n,"onClick",function(k){var A=n.props,E=A.text,Q=A.onCopy,Te=A.children,De=A.options,g=o.default.Children.only(Te),Oe=(0,i.default)(E,De);Q&&Q(E,Oe),g!=null&&g.props&&typeof g.props.onClick=="function"&&g.props.onClick(k)}),n}return Re(t,e),_e(t,[{key:"render",value:function(){var r=this.props;r.text,r.onCopy,r.options;var p=r.children,c=T(r,m),k=o.default.Children.only(p);return o.default.cloneElement(k,C(C({},c),{},{onClick:this.onClick}))}}])})(o.default.PureComponent);return O(Ae,"defaultProps",{onCopy:void 0,options:void 0}),f}var P,M;function Ke(){if(M)return P;M=1;var i=$e(),o=i.CopyToClipboard;return o.CopyToClipboard=o,P=o,P}var ze=Ke();const ve=({sessionFrgmt:i,maxInline:o=3,emptyText:m="-"})=>{const{t:d}=Be(),a=be.useFragment(he,i),l=Fe.useMemo(()=>Qe(a.agent_ids??[]),[a.agent_ids]),C=l.slice(0,o).join(", "),T=l.slice(o),S=qe([l.length-o,0])||0,j=`${d("comp:BAISessionAgentIds.Agent")} (${l.length})`;return l.length===0?m:s.jsxs("span",{children:[s.jsx(q,{children:C}),S>0&&s.jsxs(s.Fragment,{children:[" ",s.jsx(Le,{label:j,content:s.jsxs("div",{style:{maxHeight:240,overflow:"auto",minWidth:260},children:[s.jsxs(B,{justify:"between",align:"center",children:[s.jsx("span",{children:j}),s.jsx(ze.CopyToClipboard,{text:l.join(", "),children:s.jsx(Ee,{size:"small",type:"text",icon:s.jsx(Ne,{size:"1em"}),children:d("general.button.CopyAll")})})]}),s.jsx("ul",{style:{paddingLeft:16,margin:0},children:T.map(R=>s.jsx("li",{style:{listStyle:"disc"},children:s.jsx(q,{children:R})},R))})]}),children:s.jsxs(Me,{children:["+",S]})})]})]})},Ie=(function(){var i=[{kind:"Literal",name:"id",value:"test-id"}];return{fragment:{argumentDefinitions:[],kind:"Fragment",metadata:null,name:"BAISessionAgentIdsStoriesQuery",selections:[{alias:null,args:i,concreteType:"ComputeSessionNode",kind:"LinkedField",name:"compute_session_node",plural:!1,selections:[{args:null,kind:"FragmentSpread",name:"BAISessionAgentIdsFragment"}],storageKey:'compute_session_node(id:"test-id")'}],type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[],kind:"Operation",name:"BAISessionAgentIdsStoriesQuery",selections:[{alias:null,args:i,concreteType:"ComputeSessionNode",kind:"LinkedField",name:"compute_session_node",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"agent_ids",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null}],storageKey:'compute_session_node(id:"test-id")'}]},params:{cacheID:"6bdbf530e7619125e934b54280a794d2",id:null,metadata:{},name:"BAISessionAgentIdsStoriesQuery",operationKind:"query",text:`query BAISessionAgentIdsStoriesQuery {
  compute_session_node(id: "test-id") {
    ...BAISessionAgentIdsFragment
    id
  }
}

fragment BAISessionAgentIdsFragment on ComputeSessionNode {
  agent_ids
}
`}}})();Ie.hash="068be8ce5242b69ece5f2ba69ae4069f";const yt={title:"Fragments/BAISessionAgentIds",component:ve,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:`
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
        `}}},argTypes:{maxInline:{control:{type:"number",min:1,max:10},description:"Maximum number of agent IDs to display inline",table:{type:{summary:"number"},defaultValue:{summary:"3"}}},emptyText:{control:{type:"text"},description:"Text to display when no agents exist",table:{type:{summary:"string"},defaultValue:{summary:"'-'"}}},sessionFrgmt:{control:!1,description:"Relay fragment reference for session"}}},y=i=>{const{compute_session_node:o}=be.useLazyLoadQuery(Ie,{});return o&&s.jsx(ve,{sessionFrgmt:o,...i})},x={name:"Basic",args:{maxInline:3,emptyText:"-"},parameters:{docs:{description:{story:'Displays multiple agent IDs with the default limit of 3 inline agents. Click "+2" to see the popover with remaining agents.'}}},render:({maxInline:i,emptyText:o})=>s.jsx(u,{mockResolvers:{ComputeSessionNode:()=>({agent_ids:["i-1234567890abcdef0","i-2345678901bcdef01","i-3456789012cdef012","i-4567890123def0123","i-567890124ef01234"]})},children:s.jsx(y,{maxInline:i,emptyText:o})})},b={args:{maxInline:3,emptyText:"-"},parameters:{docs:{description:{story:"Displays a single agent ID without the popover."}}},render:({maxInline:i,emptyText:o})=>s.jsx(u,{mockResolvers:{ComputeSessionNode:()=>({agent_ids:["i-1234567890abcdef0"]})},children:s.jsx(y,{maxInline:i,emptyText:o})})},h={args:{maxInline:3,emptyText:"-"},parameters:{docs:{description:{story:"Displays the empty state text when no agents exist."}}},render:({maxInline:i,emptyText:o})=>s.jsx(u,{mockResolvers:{ComputeSessionNode:()=>({agent_ids:[]})},children:s.jsx(y,{maxInline:i,emptyText:o})})},v={args:{maxInline:3,emptyText:"No agents available"},parameters:{docs:{description:{story:"Displays custom empty state text."}}},render:({maxInline:i,emptyText:o})=>s.jsx(u,{mockResolvers:{ComputeSessionNode:()=>({agent_ids:[]})},children:s.jsx(y,{maxInline:i,emptyText:o})})},I={args:{maxInline:5,emptyText:"-"},parameters:{docs:{description:{story:'Displays many agent IDs with maxInline set to 5. Click "+5" to see the popover with 10 total agents.'}}},render:({maxInline:i,emptyText:o})=>s.jsx(u,{mockResolvers:{ComputeSessionNode:()=>({agent_ids:Array.from({length:10},(m,d)=>`i-agent-${d+1}`)})},children:s.jsx(y,{maxInline:i,emptyText:o})})},_={parameters:{docs:{description:{story:"Displays all different configurations of agent ID display."}}},render:()=>{const i=[{label:"Single agent",agent_ids:["i-1234567890abcdef0"],maxInline:3},{label:"Multiple agents (default)",agent_ids:["i-agent-1","i-agent-2","i-agent-3","i-agent-4","i-agent-5"],maxInline:3},{label:"Many agents (maxInline: 5)",agent_ids:Array.from({length:10},(o,m)=>`i-agent-${m+1}`),maxInline:5},{label:"Empty state",agent_ids:[],maxInline:3}];return s.jsx(B,{direction:"column",gap:"md",align:"start",children:i.map((o,m)=>s.jsx(u,{mockResolvers:{ComputeSessionNode:()=>({agent_ids:o.agent_ids})},children:s.jsxs(B,{direction:"row",gap:"md",align:"start",children:[s.jsx("div",{style:{width:240},children:s.jsxs("strong",{children:[o.label,":"]})}),s.jsx(y,{maxInline:o.maxInline})]})},m))})}};var $,K,z,V,W;x.parameters={...x.parameters,docs:{...($=x.parameters)==null?void 0:$.docs,source:{originalSource:`{
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
}`,...(z=(K=x.parameters)==null?void 0:K.docs)==null?void 0:z.source},description:{story:"Default story showing multiple agent IDs.",...(W=(V=x.parameters)==null?void 0:V.docs)==null?void 0:W.description}}};var H,U,X,G,J;b.parameters={...b.parameters,docs:{...(H=b.parameters)==null?void 0:H.docs,source:{originalSource:`{
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
}`,...(X=(U=b.parameters)==null?void 0:U.docs)==null?void 0:X.source},description:{story:"Story showing single agent ID.",...(J=(G=b.parameters)==null?void 0:G.docs)==null?void 0:J.description}}};var Y,Z,ee,te,ne;h.parameters={...h.parameters,docs:{...(Y=h.parameters)==null?void 0:Y.docs,source:{originalSource:`{
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
}`,...(ee=(Z=h.parameters)==null?void 0:Z.docs)==null?void 0:ee.source},description:{story:"Story showing empty state.",...(ne=(te=h.parameters)==null?void 0:te.docs)==null?void 0:ne.description}}};var re,se,oe,ie,ae;v.parameters={...v.parameters,docs:{...(re=v.parameters)==null?void 0:re.docs,source:{originalSource:`{
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
}`,...(oe=(se=v.parameters)==null?void 0:se.docs)==null?void 0:oe.source},description:{story:"Story showing custom empty text.",...(ae=(ie=v.parameters)==null?void 0:ie.docs)==null?void 0:ae.description}}};var le,pe,ce,me,de;I.parameters={...I.parameters,docs:{...(le=I.parameters)==null?void 0:le.docs,source:{originalSource:`{
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
}`,...(ce=(pe=I.parameters)==null?void 0:pe.docs)==null?void 0:ce.source},description:{story:"Story showing many agent IDs with custom inline limit.",...(de=(me=I.parameters)==null?void 0:me.docs)==null?void 0:de.description}}};var ue,ye,ge,fe,xe;_.parameters={..._.parameters,docs:{...(ue=_.parameters)==null?void 0:ue.docs,source:{originalSource:`{
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
}`,...(ge=(ye=_.parameters)==null?void 0:ye.docs)==null?void 0:ge.source},description:{story:"Story showing all variants together.",...(xe=(fe=_.parameters)==null?void 0:fe.docs)==null?void 0:xe.description}}};const gt=["Default","SingleAgent","Empty","CustomEmptyText","ManyAgents","AllVariants"];export{_ as AllVariants,v as CustomEmptyText,x as Default,h as Empty,I as ManyAgents,b as SingleAgent,gt as __namedExportsOrder,yt as default};
