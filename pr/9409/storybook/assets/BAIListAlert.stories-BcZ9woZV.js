import{j as l}from"./iframe-DAIf00kV.js";import{B as R}from"./BAIFlex-B-2KipBa.js";import{B as p}from"./BAIListAlert-CRL-SaZb.js";import{m as T}from"./map-DGW-cfHh.js";import{i as M}from"./_isIterateeCall-DTOtZjSE.js";import{a as m}from"./toFinite-2y1wD_B9.js";import"./preload-helper-Dp1pzeXC.js";import"./BAIAlert-NhlHae-i.js";import"./Banner-DhGIOX56.js";import"./isRenderable-BUV0eL6r.js";import"./composeEventHandlers-BolWE7qY.js";import"./isEmpty-CWoRo8Kl.js";import"./toString-DTgQhGP5.js";import"./isSymbol-BNK425Am.js";import"./_baseEach-Bv90tS8Y.js";import"./get-nGGdxoYH.js";import"./_baseGet-BvL2ehoV.js";import"./identity-DKeuBCMA.js";import"./_trimmedEndIndex-DuQxD0U0.js";var D=Math.ceil,W=Math.max;function _(t,n,e,o){for(var C=-1,d=W(D((n-t)/(e||1)),0),u=Array(d);d--;)u[++C]=t,t+=e;return u}function F(t){return function(n,e,o){return o&&typeof o!="number"&&M(n,e,o)&&(e=o=void 0),n=m(n),e===void 0?(e=n,n=0):e=m(e),o=o===void 0?n<e?1:-1:m(o),_(n,e,o)}}var L=F();const oe={title:"Alert/BAIListAlert",component:p,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:"\n**BAIListAlert** extends **BAIAlert** (and therefore [Ant Design Alert](https://ant.design/components/alert)).\n\nIt renders a standardized `ul` list inside the alert description — used to\nsummarize a list of items (e.g. selected resources) inside a modal. The list\nscrolls vertically once it exceeds `maxHeight`, so the modal never grows\nunbounded. Item count indication belongs in the consumer-provided `title`\nprop (i18n `count` interpolation).\n\n## BAI-Specific Props\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `items` | `Array<{ key?: React.Key; content: ReactNode }>` | — | List entries rendered as `li` elements. `key` falls back to the array index |\n| `maxHeight` | `CSSProperties['maxHeight']` | `165` | Maximum height of the list before it scrolls vertically |\n\nFor all other props, refer to **BAIAlert** and [Ant Design Alert](https://ant.design/components/alert).\n        "}}},argTypes:{items:{control:!1,description:"List entries rendered as li elements; key falls back to the array index",table:{type:{summary:"Array<{ key?: React.Key; content: ReactNode }>"}}},maxHeight:{control:{type:"number"},description:"Maximum height of the list before it scrolls vertically",table:{type:{summary:"CSSProperties['maxHeight']"},defaultValue:{summary:"165"}}},type:{table:{disable:!0}},title:{table:{disable:!0}},showIcon:{table:{disable:!0}}}},r={name:"Basic",args:{type:"info",title:"The following projects will be updated",showIcon:!0,items:[{key:"a",content:"project-alpha"},{key:"b",content:"project-beta"},{key:"c",content:"project-gamma"}]},parameters:{docs:{description:{story:"Basic list summary inside an info alert."}}}},a={args:{type:"warning",title:"The following 30 users will be updated",showIcon:!0,items:T(L(30),t=>({key:t,content:`user-${t+1}@example.com`}))},parameters:{docs:{description:{story:"A long list is capped at the default maxHeight (165px) and scrolls vertically, keeping the surrounding modal compact."}}}},s={args:{type:"warning",title:"Custom maxHeight of 80px",showIcon:!0,maxHeight:80,items:T(L(10),t=>({key:t,content:`item-${t+1}`}))},parameters:{docs:{description:{story:"The scroll cap can be adjusted via the maxHeight prop."}}}},i={render:()=>l.jsxs(R,{direction:"column",gap:"md",align:"stretch",children:[l.jsx(p,{type:"warning",showIcon:!0,title:"Warning: these users will be updated",items:[{key:1,content:"admin@example.com"},{key:2,content:"user@example.com"}]}),l.jsx(p,{type:"info",showIcon:!0,ghostInfoBg:!1,title:"Info: these projects will be updated",items:[{key:1,content:"project-alpha"},{key:2,content:"project-beta"}]})]}),parameters:{docs:{description:{story:"Side-by-side comparison of warning and info (ghostInfoBg disabled) variants, matching the modal call sites."}}}},c={args:{type:"info",showIcon:!0,ghostInfoBg:!1,title:"3 folders are excluded because they cannot be deleted",items:[{key:"f1",content:"shared-folder"},{key:"f2",content:"model-store"},{key:"f3",content:"pipeline-data"}]},parameters:{docs:{description:{story:"Item count indication stays in the consumer-provided title (i18n count interpolation) — the component does not render counts itself."}}}};var h,g,y;r.parameters={...r.parameters,docs:{...(h=r.parameters)==null?void 0:h.docs,source:{originalSource:`{
  name: 'Basic',
  args: {
    type: 'info',
    title: 'The following projects will be updated',
    showIcon: true,
    items: [{
      key: 'a',
      content: 'project-alpha'
    }, {
      key: 'b',
      content: 'project-beta'
    }, {
      key: 'c',
      content: 'project-gamma'
    }]
  },
  parameters: {
    docs: {
      description: {
        story: 'Basic list summary inside an info alert.'
      }
    }
  }
}`,...(y=(g=r.parameters)==null?void 0:g.docs)==null?void 0:y.source}}};var f,x,b;a.parameters={...a.parameters,docs:{...(f=a.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    type: 'warning',
    title: 'The following 30 users will be updated',
    showIcon: true,
    items: _.map(_.range(30), i => ({
      key: i,
      content: \`user-\${i + 1}@example.com\`
    }))
  },
  parameters: {
    docs: {
      description: {
        story: 'A long list is capped at the default maxHeight (165px) and scrolls vertically, keeping the surrounding modal compact.'
      }
    }
  }
}`,...(b=(x=a.parameters)==null?void 0:x.docs)==null?void 0:b.source}}};var I,w,k;s.parameters={...s.parameters,docs:{...(I=s.parameters)==null?void 0:I.docs,source:{originalSource:`{
  args: {
    type: 'warning',
    title: 'Custom maxHeight of 80px',
    showIcon: true,
    maxHeight: 80,
    items: _.map(_.range(10), i => ({
      key: i,
      content: \`item-\${i + 1}\`
    }))
  },
  parameters: {
    docs: {
      description: {
        story: 'The scroll cap can be adjusted via the maxHeight prop.'
      }
    }
  }
}`,...(k=(w=s.parameters)==null?void 0:w.docs)==null?void 0:k.source}}};var A,B,j;i.parameters={...i.parameters,docs:{...(A=i.parameters)==null?void 0:A.docs,source:{originalSource:`{
  render: () => <BAIFlex direction="column" gap="md" align="stretch">
      <BAIListAlert type="warning" showIcon title="Warning: these users will be updated" items={[{
      key: 1,
      content: 'admin@example.com'
    }, {
      key: 2,
      content: 'user@example.com'
    }]} />
      <BAIListAlert type="info" showIcon ghostInfoBg={false} title="Info: these projects will be updated" items={[{
      key: 1,
      content: 'project-alpha'
    }, {
      key: 2,
      content: 'project-beta'
    }]} />
    </BAIFlex>,
  parameters: {
    docs: {
      description: {
        story: 'Side-by-side comparison of warning and info (ghostInfoBg disabled) variants, matching the modal call sites.'
      }
    }
  }
}`,...(j=(B=i.parameters)==null?void 0:B.docs)==null?void 0:j.source}}};var v,H,S;c.parameters={...c.parameters,docs:{...(v=c.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    type: 'info',
    showIcon: true,
    ghostInfoBg: false,
    title: '3 folders are excluded because they cannot be deleted',
    items: [{
      key: 'f1',
      content: 'shared-folder'
    }, {
      key: 'f2',
      content: 'model-store'
    }, {
      key: 'f3',
      content: 'pipeline-data'
    }]
  },
  parameters: {
    docs: {
      description: {
        story: 'Item count indication stays in the consumer-provided title (i18n count interpolation) — the component does not render counts itself.'
      }
    }
  }
}`,...(S=(H=c.parameters)==null?void 0:H.docs)==null?void 0:S.source}}};const re=["Default","LongListWithScroll","CustomMaxHeight","AlertTypes","TitleWithCount"];export{i as AlertTypes,s as CustomMaxHeight,r as Default,a as LongListWithScroll,c as TitleWithCount,re as __namedExportsOrder,oe as default};
