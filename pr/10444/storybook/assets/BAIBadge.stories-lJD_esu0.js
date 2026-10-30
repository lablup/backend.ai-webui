import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-MKhVqBIO.js";import{n,t as r}from"./BAIFlex-BOFoS5KY.js";import{n as i,t as a}from"./BAIBadge-DbrOBQ6g.js";var o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W;function G(){return(G=e((()=>{i(),n(),o=t(),P={title:`Badge/BAIBadge`,component:a,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:'\n**BAIBadge** displays a dot badge with semantic colors and optional text.\n\n## Features\n- **Two visual modes** depending on the `color` prop:\n  - **`color` provided** → Filled dot with the corresponding semantic color\n  - **`color` omitted (`undefined`)** → Outline-only dot (border only, no fill). Use this when the value is unknown or undetermined.\n- Semantic color system using Ant Design design tokens (theme-aware)\n  - `success` → green, `info` → blue, `warning` → orange, `error` → red, `default` → grey\n\n## Props\n| Name | Type | Default | Description |\n|------|------|---------|-------------|\n| color | `SemanticColor` | `undefined` | Semantic color for the badge dot. When omitted, renders an outline-only dot to indicate an unknown or undetermined state. |\n| text | `ReactNode` | `undefined` | Text to display next to the badge |\n| processing | `boolean` | `false` | When true, shows a ripple animation on the dot to indicate an in-progress state. |\n\n## Usage\n```tsx\n{/* Filled dot with semantic color */}\n<BAIBadge color="success" text="RUNNING" />\n<BAIBadge color="error" text="CANCELLED" />\n\n{/* Outline-only dot for unknown/undetermined values */}\n<BAIBadge text="1 GiB" />\n\n{/* Processing animation */}\n<BAIBadge processing text="PREPARING" />\n<BAIBadge processing color="success" text="RUNNING" />\n```\n        '}}},argTypes:{color:{control:{type:`select`},options:[void 0,`success`,`info`,`warning`,`error`,`default`],description:`Semantic color for the badge dot. When undefined, renders an outline-only dot to indicate an unknown or undetermined state.`,table:{type:{summary:`'success' | 'info' | 'warning' | 'error' | 'default' | undefined`},defaultValue:{summary:`undefined`}}},text:{control:{type:`text`},description:`Text to display next to the badge`},processing:{control:{type:`boolean`},description:`When true, shows a ripple animation on the dot to indicate an in-progress state.`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}}}},F={name:`Basic`,parameters:{docs:{description:{story:"When `color` is omitted, the badge renders an outline-only dot (border without fill). Use this to indicate that the value is unknown or undetermined."}}},args:{text:`1 GiB`}},I={parameters:{docs:{description:{story:`Shows a success badge with a green dot.`}}},args:{color:`success`,text:`RUNNING`}},L={parameters:{docs:{description:{story:`Shows an info badge with a blue dot.`}}},args:{color:`info`,text:`PREPARING`}},R={parameters:{docs:{description:{story:`Shows a warning badge with an orange dot.`}}},args:{color:`warning`,text:`NEED_RETRY`}},z={parameters:{docs:{description:{story:`Shows an error badge with a red dot.`}}},args:{color:`error`,text:`CANCELLED`}},B={name:`DefaultColor`,parameters:{docs:{description:{story:`Shows a badge with the default semantic color (grey), indicating a neutral or inactive state.`}}},args:{color:`default`,text:`TERMINATED`}},V={parameters:{docs:{description:{story:"When `processing` is true, the dot shows a ripple animation to indicate an in-progress state. Can be combined with `color` to show a colored processing dot."}}},args:{processing:!0,text:`PREPARING`}},H={name:`ProcessingWithColor`,parameters:{docs:{description:{story:`Processing animation combined with a semantic color. The ripple uses the specified color.`}}},args:{processing:!0,color:`success`,text:`RUNNING`}},U={name:`AllColors`,parameters:{docs:{description:{story:`Displays all available semantic colors for comparison. Colors adapt to the active theme.`}}},render:()=>(0,o.jsx)(r,{direction:`column`,gap:`md`,children:[{color:`success`,text:`success`},{color:`info`,text:`info`},{color:`warning`,text:`warning`},{color:`error`,text:`error`},{color:`default`,text:`default`},{text:`undefined`}].map(({color:e,text:t})=>(0,o.jsx)(a,{color:e,text:t},t))})},F.parameters={...F.parameters,docs:{...(s=F.parameters)==null?void 0:s.docs,source:{originalSource:`{
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
}`,...(c=F.parameters)==null||(c=c.docs)==null?void 0:c.source},description:{story:`Outline-only dot for unknown or undetermined values.`,...(l=F.parameters)==null||(l=l.docs)==null?void 0:l.description}}},I.parameters={...I.parameters,docs:{...(u=I.parameters)==null?void 0:u.docs,source:{originalSource:`{
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
}`,...(d=I.parameters)==null||(d=d.docs)==null?void 0:d.source},description:{story:`Success state — green dot badge.`,...(f=I.parameters)==null||(f=f.docs)==null?void 0:f.description}}},L.parameters={...L.parameters,docs:{...(p=L.parameters)==null?void 0:p.docs,source:{originalSource:`{
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
}`,...(m=L.parameters)==null||(m=m.docs)==null?void 0:m.source},description:{story:`Info state — blue dot badge.`,...(h=L.parameters)==null||(h=h.docs)==null?void 0:h.description}}},R.parameters={...R.parameters,docs:{...(g=R.parameters)==null?void 0:g.docs,source:{originalSource:`{
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
}`,...(_=R.parameters)==null||(_=_.docs)==null?void 0:_.source},description:{story:`Warning state — orange dot badge.`,...(v=R.parameters)==null||(v=v.docs)==null?void 0:v.description}}},z.parameters={...z.parameters,docs:{...(y=z.parameters)==null?void 0:y.docs,source:{originalSource:`{
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
}`,...(b=z.parameters)==null||(b=b.docs)==null?void 0:b.source},description:{story:`Error state — red dot badge.`,...(x=z.parameters)==null||(x=x.docs)==null?void 0:x.description}}},B.parameters={...B.parameters,docs:{...(S=B.parameters)==null?void 0:S.docs,source:{originalSource:`{
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
}`,...(C=B.parameters)==null||(C=C.docs)==null?void 0:C.source},description:{story:`Default semantic color — grey dot badge.`,...(w=B.parameters)==null||(w=w.docs)==null?void 0:w.description}}},V.parameters={...V.parameters,docs:{...(T=V.parameters)==null?void 0:T.docs,source:{originalSource:`{
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
}`,...(E=V.parameters)==null||(E=E.docs)==null?void 0:E.source},description:{story:`Processing state — ripple animation on the dot.`,...(D=V.parameters)==null||(D=D.docs)==null?void 0:D.description}}},H.parameters={...H.parameters,docs:{...(O=H.parameters)==null?void 0:O.docs,source:{originalSource:`{
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
}`,...(k=H.parameters)==null||(k=k.docs)==null?void 0:k.source},description:{story:`Processing with a semantic color.`,...(A=H.parameters)==null||(A=A.docs)==null?void 0:A.description}}},U.parameters={...U.parameters,docs:{...(j=U.parameters)==null?void 0:j.docs,source:{originalSource:`{
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
}`,...(M=U.parameters)==null||(M=M.docs)==null?void 0:M.source},description:{story:`Display all semantic color variants side by side for comparison.`,...(N=U.parameters)==null||(N=N.docs)==null?void 0:N.description}}},W=[`Default`,`Success`,`Info`,`Warning`,`Error`,`DefaultColor`,`Processing`,`ProcessingWithColor`,`AllColors`]})))()}G();export{U as AllColors,F as Default,B as DefaultColor,z as Error,L as Info,V as Processing,H as ProcessingWithColor,I as Success,R as Warning,W as __namedExportsOrder,P as default};