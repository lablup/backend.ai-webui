import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t,t as n}from"./toFinite-h-2-9ZQn.js";import{n as r,t as i}from"./_isIterateeCall-mbDIpfs5.js";import{n as a,t as o}from"./map-CLZMgxwS.js";import{t as s}from"./jsx-runtime-MKhVqBIO.js";import{n as c,t as l}from"./BAIFlex-BOFoS5KY.js";import{n as u,t as d}from"./BAIListAlert-M2rHuyIr.js";function f(e,t,n,r){for(var i=-1,a=m(p((t-e)/(n||1)),0),o=Array(a);a--;)o[r?a:++i]=e,e+=n;return o}var p,m;function h(){return(h=e((()=>{p=Math.ceil,m=Math.max})))()}function g(e){return function(n,i,a){return a&&typeof a!=`number`&&r(n,i,a)&&(i=a=void 0),n=t(n),i===void 0?(i=n,n=0):i=t(i),a=a===void 0?n<i?1:-1:t(a),f(n,i,a,e)}}function _(){return(_=e((()=>{h(),i(),n()})))()}var v;function y(){return(y=e((()=>{_(),v=g()})))()}var b,x,S,C,w,T,E,D;function O(){return(O=e((()=>{c(),u(),o(),y(),b=s(),x={title:`Alert/BAIListAlert`,component:d,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:"\n**BAIListAlert** extends **BAIAlert** (and therefore [Ant Design Alert](https://ant.design/components/alert)).\n\nIt renders a standardized `ul` list inside the alert description — used to\nsummarize a list of items (e.g. selected resources) inside a modal. The list\nscrolls vertically once it exceeds `maxHeight`, so the modal never grows\nunbounded. Item count indication belongs in the consumer-provided `title`\nprop (i18n `count` interpolation).\n\n## BAI-Specific Props\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `items` | `Array<{ key?: React.Key; content: ReactNode }>` | — | List entries rendered as `li` elements. `key` falls back to the array index |\n| `maxHeight` | `CSSProperties['maxHeight']` | `165` | Maximum height of the list before it scrolls vertically |\n\nFor all other props, refer to **BAIAlert** and [Ant Design Alert](https://ant.design/components/alert).\n        "}}},argTypes:{items:{control:!1,description:`List entries rendered as li elements; key falls back to the array index`,table:{type:{summary:`Array<{ key?: React.Key; content: ReactNode }>`}}},maxHeight:{control:{type:`number`},description:`Maximum height of the list before it scrolls vertically`,table:{type:{summary:`CSSProperties['maxHeight']`},defaultValue:{summary:`165`}}},type:{table:{disable:!0}},title:{table:{disable:!0}},showIcon:{table:{disable:!0}}}},S={name:`Basic`,args:{type:`info`,title:`The following projects will be updated`,showIcon:!0,items:[{key:`a`,content:`project-alpha`},{key:`b`,content:`project-beta`},{key:`c`,content:`project-gamma`}]},parameters:{docs:{description:{story:`Basic list summary inside an info alert.`}}}},C={args:{type:`warning`,title:`The following 30 users will be updated`,showIcon:!0,items:a(v(30),e=>({key:e,content:`user-${e+1}@example.com`}))},parameters:{docs:{description:{story:`A long list is capped at the default maxHeight (165px) and scrolls vertically, keeping the surrounding modal compact.`}}}},w={args:{type:`warning`,title:`Custom maxHeight of 80px`,showIcon:!0,maxHeight:80,items:a(v(10),e=>({key:e,content:`item-${e+1}`}))},parameters:{docs:{description:{story:`The scroll cap can be adjusted via the maxHeight prop.`}}}},T={render:()=>(0,b.jsxs)(l,{direction:`column`,gap:`md`,align:`stretch`,children:[(0,b.jsx)(d,{type:`warning`,showIcon:!0,title:`Warning: these users will be updated`,items:[{key:1,content:`admin@example.com`},{key:2,content:`user@example.com`}]}),(0,b.jsx)(d,{type:`info`,showIcon:!0,ghostInfoBg:!1,title:`Info: these projects will be updated`,items:[{key:1,content:`project-alpha`},{key:2,content:`project-beta`}]})]}),parameters:{docs:{description:{story:`Side-by-side comparison of warning and info (ghostInfoBg disabled) variants, matching the modal call sites.`}}}},E={args:{type:`info`,showIcon:!0,ghostInfoBg:!1,title:`3 folders are excluded because they cannot be deleted`,items:[{key:`f1`,content:`shared-folder`},{key:`f2`,content:`model-store`},{key:`f3`,content:`pipeline-data`}]},parameters:{docs:{description:{story:`Item count indication stays in the consumer-provided title (i18n count interpolation) — the component does not render counts itself.`}}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
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
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
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
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
}`,...E.parameters?.docs?.source}}},D=[`Default`,`LongListWithScroll`,`CustomMaxHeight`,`AlertTypes`,`TitleWithCount`]})))()}O();export{T as AlertTypes,w as CustomMaxHeight,S as Default,C as LongListWithScroll,E as TitleWithCount,D as __namedExportsOrder,x as default};