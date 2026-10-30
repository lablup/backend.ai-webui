import{n as e,t}from"./rolldown-runtime-sJBDdmOt.js";import{t as n}from"./react-DlPsW1c0.js";import{n as r,t as i}from"./max-SUZHSy2R.js";import{n as a,t as o}from"./uniq-BDr-Y0fE.js";import{t as s}from"./jsx-runtime-MKhVqBIO.js";import{n as c,t as l}from"./useBAIi18n-DGn2iC2x.js";import{n as u,r as d,t as f}from"./copy-to-clipboard-Oz8Q0aL6.js";import{n as p,t as m}from"./Text-Cj3JSrHf.js";import{n as h,t as g}from"./BAIFlex-DnaoYTJ1.js";import{t as _}from"./react-relay-sHama7hJ.js";import{n as v,t as y}from"./Link-DJahxHna.js";import{n as b,t as x}from"./BAIButton-CQhUs6-Y.js";import{n as S,t as C}from"./Popover-sYqfnLjH.js";import{n as w,t as T}from"./RelayResolver-BnFyFQJn.js";var E;function ee(){return(ee=e((()=>{E={argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAISessionAgentIdsFragment`,selections:[{alias:null,args:null,kind:`ScalarField`,name:`agent_ids`,storageKey:null}],type:`ComputeSessionNode`,abstractKey:null},E.hash=`42a06f8e2b4b445e08e0f94066e8ea58`})))()}var te=t((e=>{Object.defineProperty(e,"__esModule",{value:!0}),e.CopyToClipboard=void 0;var t=a(f()),r=a(n()),i=[`text`,`onCopy`,`options`,`children`];function a(e){return e&&e.__esModule?e:{default:e}}function o(e){"@babel/helpers - typeof";return o=typeof Symbol==`function`&&typeof Symbol.iterator==`symbol`?function(e){return typeof e}:function(e){return e&&typeof Symbol==`function`&&e.constructor===Symbol&&e!==Symbol.prototype?`symbol`:typeof e},o(e)}function s(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),n.push.apply(n,r)}return n}function c(e){for(var t=1;t<arguments.length;t++){var n=arguments[t]==null?{}:arguments[t];t%2?s(Object(n),!0).forEach(function(t){S(e,t,n[t])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):s(Object(n)).forEach(function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))})}return e}function l(e,t){if(e==null)return{};var n,r,i=u(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)===-1&&{}.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}function u(e,t){if(e==null)return{};var n={};for(var r in e)if({}.hasOwnProperty.call(e,r)){if(t.indexOf(r)!==-1)continue;n[r]=e[r]}return n}function d(e,t){if(!(e instanceof t))throw TypeError(`Cannot call a class as a function`)}function p(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,`value`in r&&(r.writable=!0),Object.defineProperty(e,C(r.key),r)}}function m(e,t,n){return t&&p(e.prototype,t),n&&p(e,n),Object.defineProperty(e,"prototype",{writable:!1}),e}function h(e,t,n){return t=y(t),g(e,v()?Reflect.construct(t,n||[],y(e).constructor):t.apply(e,n))}function g(e,t){if(t&&(o(t)==`object`||typeof t==`function`))return t;if(t!==void 0)throw TypeError(`Derived constructors may only return object or undefined`);return _(e)}function _(e){if(e===void 0)throw ReferenceError(`this hasn't been initialised - super() hasn't been called`);return e}function v(){try{var e=!Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){}))}catch{}return(v=function(){return!!e})()}function y(e){return y=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(e){return e.__proto__||Object.getPrototypeOf(e)},y(e)}function b(e,t){if(typeof t!=`function`&&t!==null)throw TypeError(`Super expression must either be null or a function`);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),Object.defineProperty(e,"prototype",{writable:!1}),t&&x(e,t)}function x(e,t){return x=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(e,t){return e.__proto__=t,e},x(e,t)}function S(e,t,n){return(t=C(t))in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function C(e){var t=w(e,`string`);return o(t)==`symbol`?t:t+``}function w(e,t){if(o(e)!=`object`||!e)return e;var n=e[Symbol.toPrimitive];if(n!==void 0){var r=n.call(e,t||`default`);if(o(r)!=`object`)return r;throw TypeError(`@@toPrimitive must return a primitive value.`)}return(t===`string`?String:Number)(e)}S(e.CopyToClipboard=function(e){function n(){var e;d(this,n);var i=[...arguments];return e=h(this,n,[].concat(i)),S(e,`onClick`,function(n){var i=e.props,a=i.text,o=i.onCopy,s=i.children,c=i.options,l=r.default.Children.only(s),u=(0,t.default)(a,c);o&&o(a,u),l!=null&&l.props&&typeof l.props.onClick==`function`&&l.props.onClick(n)}),e}return b(n,e),m(n,[{key:`render`,value:function(){var e=this.props;e.text,e.onCopy,e.options;var t=e.children,n=l(e,i),a=r.default.Children.only(t);return r.default.cloneElement(a,c(c({},n),{},{onClick:this.onClick}))}}])}(r.default.PureComponent),`defaultProps`,{onCopy:void 0,options:void 0})})),ne=t(((e,t)=>{var n=te().CopyToClipboard;n.CopyToClipboard=n,t.exports=n})),re,ie,ae,D,O;function oe(){return(oe=e((()=>{ee(),l(),b(),h(),v(),C(),p(),o(),i(),d(),re=n(),ie=ne(),ae=_(),D=s(),O=({sessionFrgmt:e,maxInline:t=3,emptyText:n=`-`})=>{let{t:i}=c(),o=(0,ae.useFragment)(E,e),s=(0,re.useMemo)(()=>a(o.agent_ids??[]),[o.agent_ids]),l=s.slice(0,t).join(`, `),d=s.slice(t),f=r([s.length-t,0])||0,p=`${i(`comp:BAISessionAgentIds.Agent`)} (${s.length})`;return s.length===0?n:(0,D.jsxs)(`span`,{children:[(0,D.jsx)(m,{children:l}),f>0&&(0,D.jsxs)(D.Fragment,{children:[`\xA0`,(0,D.jsx)(S,{label:p,content:(0,D.jsxs)(`div`,{style:{maxHeight:240,overflow:`auto`,minWidth:260},children:[(0,D.jsxs)(g,{justify:`between`,align:`center`,children:[(0,D.jsx)(`span`,{children:p}),(0,D.jsx)(ie.CopyToClipboard,{text:s.join(`, `),children:(0,D.jsx)(x,{size:`small`,type:`text`,icon:(0,D.jsx)(u,{size:`1em`}),children:i(`general.button.CopyAll`)})})]}),(0,D.jsx)(`ul`,{style:{paddingLeft:16,margin:0},children:d.map(e=>(0,D.jsx)(`li`,{style:{listStyle:`disc`},children:(0,D.jsx)(m,{children:e})},e))})]}),children:(0,D.jsxs)(y,{children:[`+`,f]})})]})]})}})))()}var k;function se(){return(se=e((()=>{k=(function(){var e=[{kind:`Literal`,name:`id`,value:`test-id`}];return{fragment:{argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAISessionAgentIdsStoriesQuery`,selections:[{alias:null,args:e,concreteType:`ComputeSessionNode`,kind:`LinkedField`,name:`compute_session_node`,plural:!1,selections:[{args:null,kind:`FragmentSpread`,name:`BAISessionAgentIdsFragment`}],storageKey:`compute_session_node(id:"test-id")`}],type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[],kind:`Operation`,name:`BAISessionAgentIdsStoriesQuery`,selections:[{alias:null,args:e,concreteType:`ComputeSessionNode`,kind:`LinkedField`,name:`compute_session_node`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`agent_ids`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null}],storageKey:`compute_session_node(id:"test-id")`}]},params:{cacheID:`6bdbf530e7619125e934b54280a794d2`,id:null,metadata:{},name:`BAISessionAgentIdsStoriesQuery`,operationKind:`query`,text:`query BAISessionAgentIdsStoriesQuery {
  compute_session_node(id: "test-id") {
    ...BAISessionAgentIdsFragment
    id
  }
}

fragment BAISessionAgentIdsFragment on ComputeSessionNode {
  agent_ids
}
`}}})(),k.hash=`068be8ce5242b69ece5f2ba69ae4069f`})))()}var ce,A,j,M,N,P,F,I,L,R,z,B,V,H,le,U,W,ue,G,K,de,q,J,Y,X,Z,Q,$,fe;function pe(){return(pe=e((()=>{se(),w(),h(),oe(),ce=_(),A=s(),de={title:`Fragments/BAISessionAgentIds`,component:O,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`
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
        `}}},argTypes:{maxInline:{control:{type:`number`,min:1,max:10},description:`Maximum number of agent IDs to display inline`,table:{type:{summary:`number`},defaultValue:{summary:`3`}}},emptyText:{control:{type:`text`},description:`Text to display when no agents exist`,table:{type:{summary:`string`},defaultValue:{summary:`'-'`}}},sessionFrgmt:{control:!1,description:`Relay fragment reference for session`}}},q=e=>{let{compute_session_node:t}=(0,ce.useLazyLoadQuery)(k,{});return t&&(0,A.jsx)(O,{sessionFrgmt:t,...e})},J={name:`Basic`,args:{maxInline:3,emptyText:`-`},parameters:{docs:{description:{story:`Displays multiple agent IDs with the default limit of 3 inline agents. Click "+2" to see the popover with remaining agents.`}}},render:({maxInline:e,emptyText:t})=>(0,A.jsx)(T,{mockResolvers:{ComputeSessionNode:()=>({agent_ids:[`i-1234567890abcdef0`,`i-2345678901bcdef01`,`i-3456789012cdef012`,`i-4567890123def0123`,`i-567890124ef01234`]})},children:(0,A.jsx)(q,{maxInline:e,emptyText:t})})},Y={args:{maxInline:3,emptyText:`-`},parameters:{docs:{description:{story:`Displays a single agent ID without the popover.`}}},render:({maxInline:e,emptyText:t})=>(0,A.jsx)(T,{mockResolvers:{ComputeSessionNode:()=>({agent_ids:[`i-1234567890abcdef0`]})},children:(0,A.jsx)(q,{maxInline:e,emptyText:t})})},X={args:{maxInline:3,emptyText:`-`},parameters:{docs:{description:{story:`Displays the empty state text when no agents exist.`}}},render:({maxInline:e,emptyText:t})=>(0,A.jsx)(T,{mockResolvers:{ComputeSessionNode:()=>({agent_ids:[]})},children:(0,A.jsx)(q,{maxInline:e,emptyText:t})})},Z={args:{maxInline:3,emptyText:`No agents available`},parameters:{docs:{description:{story:`Displays custom empty state text.`}}},render:({maxInline:e,emptyText:t})=>(0,A.jsx)(T,{mockResolvers:{ComputeSessionNode:()=>({agent_ids:[]})},children:(0,A.jsx)(q,{maxInline:e,emptyText:t})})},Q={args:{maxInline:5,emptyText:`-`},parameters:{docs:{description:{story:`Displays many agent IDs with maxInline set to 5. Click "+5" to see the popover with 10 total agents.`}}},render:({maxInline:e,emptyText:t})=>(0,A.jsx)(T,{mockResolvers:{ComputeSessionNode:()=>({agent_ids:Array.from({length:10},(e,t)=>`i-agent-${t+1}`)})},children:(0,A.jsx)(q,{maxInline:e,emptyText:t})})},$={parameters:{docs:{description:{story:`Displays all different configurations of agent ID display.`}}},render:()=>{let e=[{label:`Single agent`,agent_ids:[`i-1234567890abcdef0`],maxInline:3},{label:`Multiple agents (default)`,agent_ids:[`i-agent-1`,`i-agent-2`,`i-agent-3`,`i-agent-4`,`i-agent-5`],maxInline:3},{label:`Many agents (maxInline: 5)`,agent_ids:Array.from({length:10},(e,t)=>`i-agent-${t+1}`),maxInline:5},{label:`Empty state`,agent_ids:[],maxInline:3}];return(0,A.jsx)(g,{direction:`column`,gap:`md`,align:`start`,children:e.map((e,t)=>(0,A.jsx)(T,{mockResolvers:{ComputeSessionNode:()=>({agent_ids:e.agent_ids})},children:(0,A.jsxs)(g,{direction:`row`,gap:`md`,align:`start`,children:[(0,A.jsx)(`div`,{style:{width:240},children:(0,A.jsxs)(`strong`,{children:[e.label,`:`]})}),(0,A.jsx)(q,{maxInline:e.maxInline})]})},t))})}},J.parameters={...J.parameters,docs:{...(j=J.parameters)==null?void 0:j.docs,source:{originalSource:`{
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
}`,...(M=J.parameters)==null||(M=M.docs)==null?void 0:M.source},description:{story:`Default story showing multiple agent IDs.`,...(N=J.parameters)==null||(N=N.docs)==null?void 0:N.description}}},Y.parameters={...Y.parameters,docs:{...(P=Y.parameters)==null?void 0:P.docs,source:{originalSource:`{
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
}`,...(F=Y.parameters)==null||(F=F.docs)==null?void 0:F.source},description:{story:`Story showing single agent ID.`,...(I=Y.parameters)==null||(I=I.docs)==null?void 0:I.description}}},X.parameters={...X.parameters,docs:{...(L=X.parameters)==null?void 0:L.docs,source:{originalSource:`{
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
}`,...(R=X.parameters)==null||(R=R.docs)==null?void 0:R.source},description:{story:`Story showing empty state.`,...(z=X.parameters)==null||(z=z.docs)==null?void 0:z.description}}},Z.parameters={...Z.parameters,docs:{...(B=Z.parameters)==null?void 0:B.docs,source:{originalSource:`{
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
}`,...(V=Z.parameters)==null||(V=V.docs)==null?void 0:V.source},description:{story:`Story showing custom empty text.`,...(H=Z.parameters)==null||(H=H.docs)==null?void 0:H.description}}},Q.parameters={...Q.parameters,docs:{...(le=Q.parameters)==null?void 0:le.docs,source:{originalSource:`{
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
}`,...(U=Q.parameters)==null||(U=U.docs)==null?void 0:U.source},description:{story:`Story showing many agent IDs with custom inline limit.`,...(W=Q.parameters)==null||(W=W.docs)==null?void 0:W.description}}},$.parameters={...$.parameters,docs:{...(ue=$.parameters)==null?void 0:ue.docs,source:{originalSource:`{
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
}`,...(G=$.parameters)==null||(G=G.docs)==null?void 0:G.source},description:{story:`Story showing all variants together.`,...(K=$.parameters)==null||(K=K.docs)==null?void 0:K.description}}},fe=[`Default`,`SingleAgent`,`Empty`,`CustomEmptyText`,`ManyAgents`,`AllVariants`]})))()}pe();export{$ as AllVariants,Z as CustomEmptyText,J as Default,X as Empty,Q as ManyAgents,Y as SingleAgent,fe as __namedExportsOrder,de as default};