import{j as l}from"./iframe-CenDpN5b.js";import{B as re}from"./BAIBadge-ACgnV7Av.js";import{B as ne}from"./BAIFlex-Rt_2Z4BO.js";import"./preload-helper-Dp1pzeXC.js";import"./isRenderable-BUV0eL6r.js";const pe={title:"Badge/BAIBadge",component:re,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:'\n**BAIBadge** displays a dot badge with semantic colors and optional text.\n\n## Features\n- **Two visual modes** depending on the `color` prop:\n  - **`color` provided** → Filled dot with the corresponding semantic color\n  - **`color` omitted (`undefined`)** → Outline-only dot (border only, no fill). Use this when the value is unknown or undetermined.\n- Semantic color system using Ant Design design tokens (theme-aware)\n  - `success` → green, `info` → blue, `warning` → orange, `error` → red, `default` → grey\n\n## Props\n| Name | Type | Default | Description |\n|------|------|---------|-------------|\n| color | `SemanticColor` | `undefined` | Semantic color for the badge dot. When omitted, renders an outline-only dot to indicate an unknown or undetermined state. |\n| text | `ReactNode` | `undefined` | Text to display next to the badge |\n| processing | `boolean` | `false` | When true, shows a ripple animation on the dot to indicate an in-progress state. |\n\n## Usage\n```tsx\n{/* Filled dot with semantic color */}\n<BAIBadge color="success" text="RUNNING" />\n<BAIBadge color="error" text="CANCELLED" />\n\n{/* Outline-only dot for unknown/undetermined values */}\n<BAIBadge text="1 GiB" />\n\n{/* Processing animation */}\n<BAIBadge processing text="PREPARING" />\n<BAIBadge processing color="success" text="RUNNING" />\n```\n        '}}},argTypes:{color:{control:{type:"select"},options:[void 0,"success","info","warning","error","default"],description:"Semantic color for the badge dot. When undefined, renders an outline-only dot to indicate an unknown or undetermined state.",table:{type:{summary:"'success' | 'info' | 'warning' | 'error' | 'default' | undefined"},defaultValue:{summary:"undefined"}}},text:{control:{type:"text"},description:"Text to display next to the badge"},processing:{control:{type:"boolean"},description:"When true, shows a ripple animation on the dot to indicate an in-progress state.",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}}}},e={name:"Basic",parameters:{docs:{description:{story:"When `color` is omitted, the badge renders an outline-only dot (border without fill). Use this to indicate that the value is unknown or undetermined."}}},args:{text:"1 GiB"}},o={parameters:{docs:{description:{story:"Shows a success badge with a green dot."}}},args:{color:"success",text:"RUNNING"}},r={parameters:{docs:{description:{story:"Shows an info badge with a blue dot."}}},args:{color:"info",text:"PREPARING"}},t={parameters:{docs:{description:{story:"Shows a warning badge with an orange dot."}}},args:{color:"warning",text:"NEED_RETRY"}},s={parameters:{docs:{description:{story:"Shows an error badge with a red dot."}}},args:{color:"error",text:"CANCELLED"}},n={name:"DefaultColor",parameters:{docs:{description:{story:"Shows a badge with the default semantic color (grey), indicating a neutral or inactive state."}}},args:{color:"default",text:"TERMINATED"}},a={parameters:{docs:{description:{story:"When `processing` is true, the dot shows a ripple animation to indicate an in-progress state. Can be combined with `color` to show a colored processing dot."}}},args:{processing:!0,text:"PREPARING"}},i={name:"ProcessingWithColor",parameters:{docs:{description:{story:"Processing animation combined with a semantic color. The ripple uses the specified color."}}},args:{processing:!0,color:"success",text:"RUNNING"}},c={name:"AllColors",parameters:{docs:{description:{story:"Displays all available semantic colors for comparison. Colors adapt to the active theme."}}},render:()=>{const te=[{color:"success",text:"success"},{color:"info",text:"info"},{color:"warning",text:"warning"},{color:"error",text:"error"},{color:"default",text:"default"},{text:"undefined"}];return l.jsx(ne,{direction:"column",gap:"md",children:te.map(({color:se,text:d})=>l.jsx(re,{color:se,text:d},d))})}};var p,m,u,g,h;e.parameters={...e.parameters,docs:{...(p=e.parameters)==null?void 0:p.docs,source:{originalSource:`{
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
}`,...(u=(m=e.parameters)==null?void 0:m.docs)==null?void 0:u.source},description:{story:"Outline-only dot for unknown or undetermined values.",...(h=(g=e.parameters)==null?void 0:g.docs)==null?void 0:h.description}}};var f,y,w,x,b;o.parameters={...o.parameters,docs:{...(f=o.parameters)==null?void 0:f.docs,source:{originalSource:`{
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
}`,...(w=(y=o.parameters)==null?void 0:y.docs)==null?void 0:w.source},description:{story:"Success state — green dot badge.",...(b=(x=o.parameters)==null?void 0:x.docs)==null?void 0:b.description}}};var N,B,I,A,S;r.parameters={...r.parameters,docs:{...(N=r.parameters)==null?void 0:N.docs,source:{originalSource:`{
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
}`,...(I=(B=r.parameters)==null?void 0:B.docs)==null?void 0:I.source},description:{story:"Info state — blue dot badge.",...(S=(A=r.parameters)==null?void 0:A.docs)==null?void 0:S.description}}};var E,C,R,P,D;t.parameters={...t.parameters,docs:{...(E=t.parameters)==null?void 0:E.docs,source:{originalSource:`{
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
}`,...(R=(C=t.parameters)==null?void 0:C.docs)==null?void 0:R.source},description:{story:"Warning state — orange dot badge.",...(D=(P=t.parameters)==null?void 0:P.docs)==null?void 0:D.description}}};var v,W,G,T,U;s.parameters={...s.parameters,docs:{...(v=s.parameters)==null?void 0:v.docs,source:{originalSource:`{
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
}`,...(G=(W=s.parameters)==null?void 0:W.docs)==null?void 0:G.source},description:{story:"Error state — red dot badge.",...(U=(T=s.parameters)==null?void 0:T.docs)==null?void 0:U.description}}};var k,F,L,j,O;n.parameters={...n.parameters,docs:{...(k=n.parameters)==null?void 0:k.docs,source:{originalSource:`{
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
}`,...(L=(F=n.parameters)==null?void 0:F.docs)==null?void 0:L.source},description:{story:"Default semantic color — grey dot badge.",...(O=(j=n.parameters)==null?void 0:j.docs)==null?void 0:O.description}}};var _,M,V,Y,q;a.parameters={...a.parameters,docs:{...(_=a.parameters)==null?void 0:_.docs,source:{originalSource:`{
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
}`,...(V=(M=a.parameters)==null?void 0:M.docs)==null?void 0:V.source},description:{story:"Processing state — ripple animation on the dot.",...(q=(Y=a.parameters)==null?void 0:Y.docs)==null?void 0:q.description}}};var z,H,J,K,Q;i.parameters={...i.parameters,docs:{...(z=i.parameters)==null?void 0:z.docs,source:{originalSource:`{
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
}`,...(J=(H=i.parameters)==null?void 0:H.docs)==null?void 0:J.source},description:{story:"Processing with a semantic color.",...(Q=(K=i.parameters)==null?void 0:K.docs)==null?void 0:Q.description}}};var X,Z,$,ee,oe;c.parameters={...c.parameters,docs:{...(X=c.parameters)==null?void 0:X.docs,source:{originalSource:`{
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
}`,...($=(Z=c.parameters)==null?void 0:Z.docs)==null?void 0:$.source},description:{story:"Display all semantic color variants side by side for comparison.",...(oe=(ee=c.parameters)==null?void 0:ee.docs)==null?void 0:oe.description}}};const me=["Default","Success","Info","Warning","Error","DefaultColor","Processing","ProcessingWithColor","AllColors"];export{c as AllColors,e as Default,n as DefaultColor,s as Error,r as Info,a as Processing,i as ProcessingWithColor,o as Success,t as Warning,me as __namedExportsOrder,pe as default};
