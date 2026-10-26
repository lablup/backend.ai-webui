import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-MKhVqBIO.js";import{n,t as r}from"./BAIFlex-BOFoS5KY.js";import{n as i,t as a}from"./BAIBadge-4kSv2DEQ.js";var o,s,c,l,u,d,f,p,m,h,g,_;function v(){return(v=e((()=>{i(),n(),o=t(),s={title:`Badge/BAIBadge`,component:a,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:'\n**BAIBadge** displays a dot badge with semantic colors and optional text.\n\n## Features\n- **Two visual modes** depending on the `color` prop:\n  - **`color` provided** → Filled dot with the corresponding semantic color\n  - **`color` omitted (`undefined`)** → Outline-only dot (border only, no fill). Use this when the value is unknown or undetermined.\n- Semantic color system using Ant Design design tokens (theme-aware)\n  - `success` → green, `info` → blue, `warning` → orange, `error` → red, `default` → grey\n\n## Props\n| Name | Type | Default | Description |\n|------|------|---------|-------------|\n| color | `SemanticColor` | `undefined` | Semantic color for the badge dot. When omitted, renders an outline-only dot to indicate an unknown or undetermined state. |\n| text | `ReactNode` | `undefined` | Text to display next to the badge |\n| processing | `boolean` | `false` | When true, shows a ripple animation on the dot to indicate an in-progress state. |\n\n## Usage\n```tsx\n{/* Filled dot with semantic color */}\n<BAIBadge color="success" text="RUNNING" />\n<BAIBadge color="error" text="CANCELLED" />\n\n{/* Outline-only dot for unknown/undetermined values */}\n<BAIBadge text="1 GiB" />\n\n{/* Processing animation */}\n<BAIBadge processing text="PREPARING" />\n<BAIBadge processing color="success" text="RUNNING" />\n```\n        '}}},argTypes:{color:{control:{type:`select`},options:[void 0,`success`,`info`,`warning`,`error`,`default`],description:`Semantic color for the badge dot. When undefined, renders an outline-only dot to indicate an unknown or undetermined state.`,table:{type:{summary:`'success' | 'info' | 'warning' | 'error' | 'default' | undefined`},defaultValue:{summary:`undefined`}}},text:{control:{type:`text`},description:`Text to display next to the badge`},processing:{control:{type:`boolean`},description:`When true, shows a ripple animation on the dot to indicate an in-progress state.`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}}}},c={name:`Basic`,parameters:{docs:{description:{story:"When `color` is omitted, the badge renders an outline-only dot (border without fill). Use this to indicate that the value is unknown or undetermined."}}},args:{text:`1 GiB`}},l={parameters:{docs:{description:{story:`Shows a success badge with a green dot.`}}},args:{color:`success`,text:`RUNNING`}},u={parameters:{docs:{description:{story:`Shows an info badge with a blue dot.`}}},args:{color:`info`,text:`PREPARING`}},d={parameters:{docs:{description:{story:`Shows a warning badge with an orange dot.`}}},args:{color:`warning`,text:`NEED_RETRY`}},f={parameters:{docs:{description:{story:`Shows an error badge with a red dot.`}}},args:{color:`error`,text:`CANCELLED`}},p={name:`DefaultColor`,parameters:{docs:{description:{story:`Shows a badge with the default semantic color (grey), indicating a neutral or inactive state.`}}},args:{color:`default`,text:`TERMINATED`}},m={parameters:{docs:{description:{story:"When `processing` is true, the dot shows a ripple animation to indicate an in-progress state. Can be combined with `color` to show a colored processing dot."}}},args:{processing:!0,text:`PREPARING`}},h={name:`ProcessingWithColor`,parameters:{docs:{description:{story:`Processing animation combined with a semantic color. The ripple uses the specified color.`}}},args:{processing:!0,color:`success`,text:`RUNNING`}},g={name:`AllColors`,parameters:{docs:{description:{story:`Displays all available semantic colors for comparison. Colors adapt to the active theme.`}}},render:()=>(0,o.jsx)(r,{direction:`column`,gap:`md`,children:[{color:`success`,text:`success`},{color:`info`,text:`info`},{color:`warning`,text:`warning`},{color:`error`,text:`error`},{color:`default`,text:`default`},{text:`undefined`}].map(({color:e,text:t})=>(0,o.jsx)(a,{color:e,text:t},t))})},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'When \`color\` is omitted, the badge renders an outline-only dot (border without fill). Use this to indicate that the value is unknown or undetermined.'
      }
    }
  },
  args: {
    text: '1 GiB'
  }
}`,...c.parameters?.docs?.source},description:{story:`Outline-only dot for unknown or undetermined values.`,...c.parameters?.docs?.description}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Shows a success badge with a green dot.'
      }
    }
  },
  args: {
    color: 'success',
    text: 'RUNNING'
  }
}`,...l.parameters?.docs?.source},description:{story:`Success state — green dot badge.`,...l.parameters?.docs?.description}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Shows an info badge with a blue dot.'
      }
    }
  },
  args: {
    color: 'info',
    text: 'PREPARING'
  }
}`,...u.parameters?.docs?.source},description:{story:`Info state — blue dot badge.`,...u.parameters?.docs?.description}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Shows a warning badge with an orange dot.'
      }
    }
  },
  args: {
    color: 'warning',
    text: 'NEED_RETRY'
  }
}`,...d.parameters?.docs?.source},description:{story:`Warning state — orange dot badge.`,...d.parameters?.docs?.description}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Shows an error badge with a red dot.'
      }
    }
  },
  args: {
    color: 'error',
    text: 'CANCELLED'
  }
}`,...f.parameters?.docs?.source},description:{story:`Error state — red dot badge.`,...f.parameters?.docs?.description}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  name: 'DefaultColor',
  parameters: {
    docs: {
      description: {
        story: 'Shows a badge with the default semantic color (grey), indicating a neutral or inactive state.'
      }
    }
  },
  args: {
    color: 'default',
    text: 'TERMINATED'
  }
}`,...p.parameters?.docs?.source},description:{story:`Default semantic color — grey dot badge.`,...p.parameters?.docs?.description}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'When \`processing\` is true, the dot shows a ripple animation to indicate an in-progress state. Can be combined with \`color\` to show a colored processing dot.'
      }
    }
  },
  args: {
    processing: true,
    text: 'PREPARING'
  }
}`,...m.parameters?.docs?.source},description:{story:`Processing state — ripple animation on the dot.`,...m.parameters?.docs?.description}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  name: 'ProcessingWithColor',
  parameters: {
    docs: {
      description: {
        story: 'Processing animation combined with a semantic color. The ripple uses the specified color.'
      }
    }
  },
  args: {
    processing: true,
    color: 'success',
    text: 'RUNNING'
  }
}`,...h.parameters?.docs?.source},description:{story:`Processing with a semantic color.`,...h.parameters?.docs?.description}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  name: 'AllColors',
  parameters: {
    docs: {
      description: {
        story: 'Displays all available semantic colors for comparison. Colors adapt to the active theme.'
      }
    }
  },
  render: () => {
    const variants: {
      color?: SemanticColor;
      text: string;
    }[] = [{
      color: 'success',
      text: 'success'
    }, {
      color: 'info',
      text: 'info'
    }, {
      color: 'warning',
      text: 'warning'
    }, {
      color: 'error',
      text: 'error'
    }, {
      color: 'default',
      text: 'default'
    }, {
      text: 'undefined'
    }];
    return <BAIFlex direction="column" gap="md">
        {variants.map(({
        color,
        text
      }) => <BAIBadge key={text} color={color} text={text} />)}
      </BAIFlex>;
  }
}`,...g.parameters?.docs?.source},description:{story:`Display all semantic color variants side by side for comparison.`,...g.parameters?.docs?.description}}},_=[`Default`,`Success`,`Info`,`Warning`,`Error`,`DefaultColor`,`Processing`,`ProcessingWithColor`,`AllColors`]})))()}v();export{g as AllColors,c as Default,p as DefaultColor,f as Error,u as Info,m as Processing,h as ProcessingWithColor,l as Success,d as Warning,_ as __namedExportsOrder,s as default};