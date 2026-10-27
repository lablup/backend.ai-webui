import{n as e,t}from"./rolldown-runtime-2s6bX4vc.js";import{n,t as r}from"./max-BaE8mOSQ.js";import{n as i,t as a}from"./uniq-38em2tZ_.js";import{n as o}from"./shim-Ctw2osoX.js";import{n as s,t as c}from"./useBAIi18n-BoXCk5K0.js";import{n as l,r as u,t as d}from"./copy-to-clipboard-Br8kShL2.js";import{n as f,t as p}from"./BAIFlex-CAz1t6J5.js";import{n as m,t as h}from"./BAIButton-C-o5ANgR.js";import{n as g,t as _}from"./RelayResolver-b1nJU57O.js";import{useMemo as v}from"react";import{Fragment as y,jsx as b,jsxs as x}from"react/jsx-runtime";import{useFragment as S,useLazyLoadQuery as C}from"react-relay";import{Text as w}from"@lablup/ui-common/Text";import{Link as T}from"@lablup/ui-common/Link";import{Popover as E}from"@lablup/ui-common/Popover";var D;function O(){return(O=e((()=>{D={argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAISessionAgentIdsFragment`,selections:[{alias:null,args:null,kind:`ScalarField`,name:`agent_ids`,storageKey:null}],type:`ComputeSessionNode`,abstractKey:null},D.hash=`42a06f8e2b4b445e08e0f94066e8ea58`})))()}var k=t((e=>{Object.defineProperty(e,"__esModule",{value:!0}),e.CopyToClipboard=void 0;var t=i(d()),n=i(o()),r=[`text`,`onCopy`,`options`,`children`];function i(e){return e&&e.__esModule?e:{default:e}}function a(e){"@babel/helpers - typeof";return a=typeof Symbol==`function`&&typeof Symbol.iterator==`symbol`?function(e){return typeof e}:function(e){return e&&typeof Symbol==`function`&&e.constructor===Symbol&&e!==Symbol.prototype?`symbol`:typeof e},a(e)}function s(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),n.push.apply(n,r)}return n}function c(e){for(var t=1;t<arguments.length;t++){var n=arguments[t]==null?{}:arguments[t];t%2?s(Object(n),!0).forEach(function(t){S(e,t,n[t])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):s(Object(n)).forEach(function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))})}return e}function l(e,t){if(e==null)return{};var n,r,i=u(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)===-1&&{}.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}function u(e,t){if(e==null)return{};var n={};for(var r in e)if({}.hasOwnProperty.call(e,r)){if(t.indexOf(r)!==-1)continue;n[r]=e[r]}return n}function f(e,t){if(!(e instanceof t))throw TypeError(`Cannot call a class as a function`)}function p(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,`value`in r&&(r.writable=!0),Object.defineProperty(e,C(r.key),r)}}function m(e,t,n){return t&&p(e.prototype,t),n&&p(e,n),Object.defineProperty(e,"prototype",{writable:!1}),e}function h(e,t,n){return t=y(t),g(e,v()?Reflect.construct(t,n||[],y(e).constructor):t.apply(e,n))}function g(e,t){if(t&&(a(t)==`object`||typeof t==`function`))return t;if(t!==void 0)throw TypeError(`Derived constructors may only return object or undefined`);return _(e)}function _(e){if(e===void 0)throw ReferenceError(`this hasn't been initialised - super() hasn't been called`);return e}function v(){try{var e=!Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){}))}catch{}return(v=function(){return!!e})()}function y(e){return y=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(e){return e.__proto__||Object.getPrototypeOf(e)},y(e)}function b(e,t){if(typeof t!=`function`&&t!==null)throw TypeError(`Super expression must either be null or a function`);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),Object.defineProperty(e,"prototype",{writable:!1}),t&&x(e,t)}function x(e,t){return x=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(e,t){return e.__proto__=t,e},x(e,t)}function S(e,t,n){return(t=C(t))in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function C(e){var t=w(e,`string`);return a(t)==`symbol`?t:t+``}function w(e,t){if(a(e)!=`object`||!e)return e;var n=e[Symbol.toPrimitive];if(n!==void 0){var r=n.call(e,t||`default`);if(a(r)!=`object`)return r;throw TypeError(`@@toPrimitive must return a primitive value.`)}return(t===`string`?String:Number)(e)}S(e.CopyToClipboard=function(e){function i(){var e;f(this,i);var r=[...arguments];return e=h(this,i,[].concat(r)),S(e,`onClick`,function(r){var i=e.props,a=i.text,o=i.onCopy,s=i.children,c=i.options,l=n.default.Children.only(s),u=(0,t.default)(a,c);o&&o(a,u),l!=null&&l.props&&typeof l.props.onClick==`function`&&l.props.onClick(r)}),e}return b(i,e),m(i,[{key:`render`,value:function(){var e=this.props;e.text,e.onCopy,e.options;var t=e.children,i=l(e,r),a=n.default.Children.only(t);return n.default.cloneElement(a,c(c({},i),{},{onClick:this.onClick}))}}])}(n.default.PureComponent),`defaultProps`,{onCopy:void 0,options:void 0})})),A=t(((e,t)=>{var n=k().CopyToClipboard;n.CopyToClipboard=n,t.exports=n})),j,M;function N(){return(N=e((()=>{O(),c(),m(),f(),a(),r(),u(),j=A(),M=({sessionFrgmt:e,maxInline:t=3,emptyText:r=`-`})=>{let{t:a}=s(),o=S(D,e),c=v(()=>i(o.agent_ids??[]),[o.agent_ids]),u=c.slice(0,t).join(`, `),d=c.slice(t),f=n([c.length-t,0])||0,m=`${a(`comp:BAISessionAgentIds.Agent`)} (${c.length})`;return c.length===0?r:x(`span`,{children:[b(w,{children:u}),f>0&&x(y,{children:[`\xA0`,b(E,{label:m,content:x(`div`,{style:{maxHeight:240,overflow:`auto`,minWidth:260},children:[x(p,{justify:`between`,align:`center`,children:[b(`span`,{children:m}),b(j.CopyToClipboard,{text:c.join(`, `),children:b(h,{size:`small`,type:`text`,icon:b(l,{size:`1em`}),children:a(`general.button.CopyAll`)})})]}),b(`ul`,{style:{paddingLeft:16,margin:0},children:d.map(e=>b(`li`,{style:{listStyle:`disc`},children:b(w,{children:e})},e))})]}),children:x(T,{children:[`+`,f]})})]})]})}})))()}var P;function F(){return(F=e((()=>{P=(function(){var e=[{kind:`Literal`,name:`id`,value:`test-id`}];return{fragment:{argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAISessionAgentIdsStoriesQuery`,selections:[{alias:null,args:e,concreteType:`ComputeSessionNode`,kind:`LinkedField`,name:`compute_session_node`,plural:!1,selections:[{args:null,kind:`FragmentSpread`,name:`BAISessionAgentIdsFragment`}],storageKey:`compute_session_node(id:"test-id")`}],type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[],kind:`Operation`,name:`BAISessionAgentIdsStoriesQuery`,selections:[{alias:null,args:e,concreteType:`ComputeSessionNode`,kind:`LinkedField`,name:`compute_session_node`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`agent_ids`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null}],storageKey:`compute_session_node(id:"test-id")`}]},params:{cacheID:`6bdbf530e7619125e934b54280a794d2`,id:null,metadata:{},name:`BAISessionAgentIdsStoriesQuery`,operationKind:`query`,text:`query BAISessionAgentIdsStoriesQuery {
  compute_session_node(id: "test-id") {
    ...BAISessionAgentIdsFragment
    id
  }
}

fragment BAISessionAgentIdsFragment on ComputeSessionNode {
  agent_ids
}
`}}})(),P.hash=`068be8ce5242b69ece5f2ba69ae4069f`})))()}var I,L,R,z,B,V,H,U,W;function G(){return(G=e((()=>{F(),g(),f(),N(),I={title:`Fragments/BAISessionAgentIds`,component:M,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`
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
        `}}},argTypes:{maxInline:{control:{type:`number`,min:1,max:10},description:`Maximum number of agent IDs to display inline`,table:{type:{summary:`number`},defaultValue:{summary:`3`}}},emptyText:{control:{type:`text`},description:`Text to display when no agents exist`,table:{type:{summary:`string`},defaultValue:{summary:`'-'`}}},sessionFrgmt:{control:!1,description:`Relay fragment reference for session`}}},L=e=>{let{compute_session_node:t}=C(P,{});return t&&b(M,{sessionFrgmt:t,...e})},R={name:`Basic`,args:{maxInline:3,emptyText:`-`},parameters:{docs:{description:{story:`Displays multiple agent IDs with the default limit of 3 inline agents. Click "+2" to see the popover with remaining agents.`}}},render:({maxInline:e,emptyText:t})=>b(_,{mockResolvers:{ComputeSessionNode:()=>({agent_ids:[`i-1234567890abcdef0`,`i-2345678901bcdef01`,`i-3456789012cdef012`,`i-4567890123def0123`,`i-567890124ef01234`]})},children:b(L,{maxInline:e,emptyText:t})})},z={args:{maxInline:3,emptyText:`-`},parameters:{docs:{description:{story:`Displays a single agent ID without the popover.`}}},render:({maxInline:e,emptyText:t})=>b(_,{mockResolvers:{ComputeSessionNode:()=>({agent_ids:[`i-1234567890abcdef0`]})},children:b(L,{maxInline:e,emptyText:t})})},B={args:{maxInline:3,emptyText:`-`},parameters:{docs:{description:{story:`Displays the empty state text when no agents exist.`}}},render:({maxInline:e,emptyText:t})=>b(_,{mockResolvers:{ComputeSessionNode:()=>({agent_ids:[]})},children:b(L,{maxInline:e,emptyText:t})})},V={args:{maxInline:3,emptyText:`No agents available`},parameters:{docs:{description:{story:`Displays custom empty state text.`}}},render:({maxInline:e,emptyText:t})=>b(_,{mockResolvers:{ComputeSessionNode:()=>({agent_ids:[]})},children:b(L,{maxInline:e,emptyText:t})})},H={args:{maxInline:5,emptyText:`-`},parameters:{docs:{description:{story:`Displays many agent IDs with maxInline set to 5. Click "+5" to see the popover with 10 total agents.`}}},render:({maxInline:e,emptyText:t})=>b(_,{mockResolvers:{ComputeSessionNode:()=>({agent_ids:Array.from({length:10},(e,t)=>`i-agent-${t+1}`)})},children:b(L,{maxInline:e,emptyText:t})})},U={parameters:{docs:{description:{story:`Displays all different configurations of agent ID display.`}}},render:()=>{let e=[{label:`Single agent`,agent_ids:[`i-1234567890abcdef0`],maxInline:3},{label:`Multiple agents (default)`,agent_ids:[`i-agent-1`,`i-agent-2`,`i-agent-3`,`i-agent-4`,`i-agent-5`],maxInline:3},{label:`Many agents (maxInline: 5)`,agent_ids:Array.from({length:10},(e,t)=>`i-agent-${t+1}`),maxInline:5},{label:`Empty state`,agent_ids:[],maxInline:3}];return b(p,{direction:`column`,gap:`md`,align:`start`,children:e.map((e,t)=>b(_,{mockResolvers:{ComputeSessionNode:()=>({agent_ids:e.agent_ids})},children:x(p,{direction:`row`,gap:`md`,align:`start`,children:[b(`div`,{style:{width:240},children:x(`strong`,{children:[e.label,`:`]})}),b(L,{maxInline:e.maxInline})]})},t))})}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
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
}`,...R.parameters?.docs?.source},description:{story:`Default story showing multiple agent IDs.`,...R.parameters?.docs?.description}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
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
}`,...z.parameters?.docs?.source},description:{story:`Story showing single agent ID.`,...z.parameters?.docs?.description}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
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
}`,...B.parameters?.docs?.source},description:{story:`Story showing empty state.`,...B.parameters?.docs?.description}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
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
}`,...V.parameters?.docs?.source},description:{story:`Story showing custom empty text.`,...V.parameters?.docs?.description}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
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
}`,...H.parameters?.docs?.source},description:{story:`Story showing many agent IDs with custom inline limit.`,...H.parameters?.docs?.description}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
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
}`,...U.parameters?.docs?.source},description:{story:`Story showing all variants together.`,...U.parameters?.docs?.description}}},W=[`Default`,`SingleAgent`,`Empty`,`CustomEmptyText`,`ManyAgents`,`AllVariants`]})))()}G();export{U as AllVariants,V as CustomEmptyText,R as Default,B as Empty,H as ManyAgents,z as SingleAgent,W as __namedExportsOrder,I as default};