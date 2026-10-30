import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-MKhVqBIO.js";import{n,t as r}from"./useBAIi18n-DjEVxV1U.js";import{n as i,r as a}from"./useTheme-B-966VfY.js";import{n as o,t as s}from"./BAIFlex-DnaoYTJ1.js";import{n as c,t as l}from"./EmptyState-D5-o23fG.js";import{n as u,t as d}from"./BAIRowWrapWithDividers-BkIAXLLL.js";import{n as f,t as p}from"./BAIStatistic-BAnJwj8K.js";var m,h;function g(){return(g=e((()=>{r(),o(),u(),f(),c(),i(),m=t(),h=({resourceData:e,displayType:t,progressMode:r=`hidden`,progressSteps:i,precision:o=2})=>{let{t:c}=n(),{token:u}=a();return e.cpu||e.memory||e.accelerators.length>0?(0,m.jsxs)(s,{direction:`row`,wrap:`wrap`,gap:`lg`,children:[(0,m.jsxs)(d,{children:[e.cpu&&(0,m.jsx)(p,{current:e.cpu[t].current,total:e.cpu[t].total,title:e.cpu.metadata.title,unit:e.cpu.metadata.displayUnit,progressMode:r,progressSteps:i,precision:o,style:{color:t===`free`?u(`--color-success`):void 0}}),e.memory&&(0,m.jsx)(p,{current:e.memory[t].current,total:e.memory[t].total,title:e.memory.metadata.title,unit:e.memory.metadata.displayUnit,progressMode:r,progressSteps:i,precision:o,style:{color:t===`free`?u(`--color-success`):void 0}})]}),e.accelerators.length>0&&(0,m.jsx)(d,{dividerColor:u(`--color-border-emphasized`),style:{backgroundColor:u(`--color-background-body`),borderRadius:u(`--radius-element`),padding:u(`--spacing-4`)},children:e.accelerators.map(e=>(0,m.jsx)(p,{current:e[t].current,total:e[t].total,title:e.metadata.title,unit:e.metadata.displayUnit,progressMode:r,progressSteps:i,precision:o,style:{color:t===`free`?u(`--color-success`):void 0}},e.key))})]}):(0,m.jsx)(l,{title:c(`comp:ResourceStatistics.NoResourcesData`)||``})}})))()}var _,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z;function B(){return(B=e((()=>{g(),j={title:`Statistic/ResourceStatistics`,component:h,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:`
**ResourceStatistics** displays resource usage statistics including CPU, memory, and accelerators.

## Features
- **CPU and Memory**: Shows CPU cores and memory usage/free
- **Accelerators**: Displays GPU, TPU, or other accelerator statistics
- **Display modes**: Toggle between 'used' and 'free' resources
- **Progress visualization**: Optional progress bars with steps
- **Precision control**: Configurable decimal precision
- **Empty state**: Shows empty message when no resources are available

## Usage
\`\`\`tsx
<ResourceStatistics
  resourceData={{
    cpu: {
      used: { current: 4, total: 8 },
      free: { current: 4, total: 8 },
      metadata: { title: 'CPU', displayUnit: 'Core' },
    },
    memory: {
      used: { current: 8, total: 16 },
      free: { current: 8, total: 16 },
      metadata: { title: 'Memory', displayUnit: 'GiB' },
    },
    accelerators: [
      {
        key: 'gpu-0',
        used: { current: 1, total: 2 },
        free: { current: 1, total: 2 },
        metadata: { title: 'GPU', displayUnit: 'GPU' },
      },
    ],
  }}
  displayType="used"
  progressMode="normal"
  precision={2}
/>
\`\`\`

## Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| \`resourceData\` | \`ResourceData\` | (required) | Resource data including CPU, memory, and accelerators |
| \`displayType\` | \`'used' \\| 'free'\` | (required) | Whether to display used or free resources |
| \`progressMode\` | \`BAIStatisticProps['progressMode']\` | \`'hidden'\` | Progress bar display mode |
| \`precision\` | \`number\` | \`2\` | Number of decimal places to show |
| \`progressSteps\` | \`number\` | - | Number of steps in progress bar |

## When to Use
- Dashboard resource monitoring
- Cluster resource overview
- Session resource allocation displays
- Resource quota visualizations
        `}}},argTypes:{resourceData:{control:!1,description:`Resource data including CPU, memory, and accelerators`,table:{type:{summary:`ResourceData`}}},displayType:{control:{type:`select`},options:[`used`,`free`],description:`Whether to display used or free resources`,table:{type:{summary:`'used' | 'free'`}}},progressMode:{control:{type:`select`},options:[`hidden`,`normal`,`ghost`],description:`Progress bar display mode`,table:{type:{summary:`'hidden' | 'normal' | 'ghost'`},defaultValue:{summary:`hidden`}}},precision:{control:{type:`number`,min:0,max:4,step:1},description:`Number of decimal places to show`,table:{type:{summary:`number`},defaultValue:{summary:`2`}}},progressSteps:{control:{type:`number`,min:1,max:20,step:1},description:`Number of steps in progress bar`,table:{type:{summary:`number`}}}}},M={name:`Basic`,parameters:{docs:{description:{story:`Basic resource statistics showing used resources.`}}},args:{resourceData:{cpu:{used:{current:4,total:8},free:{current:4,total:8},metadata:{title:`CPU`,displayUnit:`Core`}},memory:{used:{current:8,total:16},free:{current:8,total:16},metadata:{title:`Memory`,displayUnit:`GiB`}},accelerators:[]},displayType:`used`,progressMode:`hidden`,precision:2}},N={parameters:{docs:{description:{story:`Resource statistics including GPU and other accelerators.`}}},args:{resourceData:{cpu:{used:{current:12,total:24},free:{current:12,total:24},metadata:{title:`CPU`,displayUnit:`Core`}},memory:{used:{current:64,total:128},free:{current:64,total:128},metadata:{title:`Memory`,displayUnit:`GiB`}},accelerators:[{key:`gpu-0`,used:{current:2,total:4},free:{current:2,total:4},metadata:{title:`NVIDIA GPU`,displayUnit:`GPU`}},{key:`tpu-0`,used:{current:1,total:2},free:{current:1,total:2},metadata:{title:`TPU`,displayUnit:`TPU`}}]},displayType:`used`,progressMode:`normal`,precision:2}},P={parameters:{docs:{description:{story:`Displaying free (available) resources instead of used resources. Free resources are shown in success color.`}}},args:{resourceData:{cpu:{used:{current:6,total:16},free:{current:10,total:16},metadata:{title:`CPU`,displayUnit:`Core`}},memory:{used:{current:32,total:64},free:{current:32,total:64},metadata:{title:`Memory`,displayUnit:`GiB`}},accelerators:[{key:`gpu-0`,used:{current:1,total:8},free:{current:7,total:8},metadata:{title:`GPU`,displayUnit:`GPU`}}]},displayType:`free`,progressMode:`normal`,precision:2}},F={parameters:{docs:{description:{story:`Resource statistics with ghost progress bars showing a subtle background style.`}}},args:{resourceData:{cpu:{used:{current:5,total:8},free:{current:3,total:8},metadata:{title:`CPU`,displayUnit:`Core`}},memory:{used:{current:12,total:16},free:{current:4,total:16},metadata:{title:`Memory`,displayUnit:`GiB`}},accelerators:[]},displayType:`used`,progressMode:`ghost`,progressSteps:8,precision:2}},I={parameters:{docs:{description:{story:`Empty state when no resources are available. Shows a simple empty message.`}}},args:{resourceData:{cpu:null,memory:null,accelerators:[]},displayType:`used`,progressMode:`hidden`,precision:2}},L={parameters:{docs:{description:{story:`Resource statistics showing high resource utilization (near capacity).`}}},args:{resourceData:{cpu:{used:{current:15,total:16},free:{current:1,total:16},metadata:{title:`CPU`,displayUnit:`Core`}},memory:{used:{current:60,total:64},free:{current:4,total:64},metadata:{title:`Memory`,displayUnit:`GiB`}},accelerators:[{key:`gpu-0`,used:{current:7,total:8},free:{current:1,total:8},metadata:{title:`GPU`,displayUnit:`GPU`}}]},displayType:`used`,progressMode:`normal`,precision:1}},R={parameters:{docs:{description:{story:`Resource statistics with fractional values showing precise resource allocation.`}}},args:{resourceData:{cpu:{used:{current:2.5,total:8},free:{current:5.5,total:8},metadata:{title:`CPU`,displayUnit:`Core`}},memory:{used:{current:12.75,total:32},free:{current:19.25,total:32},metadata:{title:`Memory`,displayUnit:`GiB`}},accelerators:[{key:`gpu-0`,used:{current:.5,total:1},free:{current:.5,total:1},metadata:{title:`GPU`,displayUnit:`fGPU`}}]},displayType:`used`,progressMode:`normal`,precision:2}},M.parameters={...M.parameters,docs:{...(_=M.parameters)==null?void 0:_.docs,source:{originalSource:`{
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'Basic resource statistics showing used resources.'
      }
    }
  },
  args: {
    resourceData: {
      cpu: {
        used: {
          current: 4,
          total: 8
        },
        free: {
          current: 4,
          total: 8
        },
        metadata: {
          title: 'CPU',
          displayUnit: 'Core'
        }
      },
      memory: {
        used: {
          current: 8,
          total: 16
        },
        free: {
          current: 8,
          total: 16
        },
        metadata: {
          title: 'Memory',
          displayUnit: 'GiB'
        }
      },
      accelerators: []
    },
    displayType: 'used',
    progressMode: 'hidden',
    precision: 2
  }
}`,...(v=M.parameters)==null||(v=v.docs)==null?void 0:v.source}}},N.parameters={...N.parameters,docs:{...(y=N.parameters)==null?void 0:y.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Resource statistics including GPU and other accelerators.'
      }
    }
  },
  args: {
    resourceData: {
      cpu: {
        used: {
          current: 12,
          total: 24
        },
        free: {
          current: 12,
          total: 24
        },
        metadata: {
          title: 'CPU',
          displayUnit: 'Core'
        }
      },
      memory: {
        used: {
          current: 64,
          total: 128
        },
        free: {
          current: 64,
          total: 128
        },
        metadata: {
          title: 'Memory',
          displayUnit: 'GiB'
        }
      },
      accelerators: [{
        key: 'gpu-0',
        used: {
          current: 2,
          total: 4
        },
        free: {
          current: 2,
          total: 4
        },
        metadata: {
          title: 'NVIDIA GPU',
          displayUnit: 'GPU'
        }
      }, {
        key: 'tpu-0',
        used: {
          current: 1,
          total: 2
        },
        free: {
          current: 1,
          total: 2
        },
        metadata: {
          title: 'TPU',
          displayUnit: 'TPU'
        }
      }]
    },
    displayType: 'used',
    progressMode: 'normal',
    precision: 2
  }
}`,...(b=N.parameters)==null||(b=b.docs)==null?void 0:b.source}}},P.parameters={...P.parameters,docs:{...(x=P.parameters)==null?void 0:x.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Displaying free (available) resources instead of used resources. Free resources are shown in success color.'
      }
    }
  },
  args: {
    resourceData: {
      cpu: {
        used: {
          current: 6,
          total: 16
        },
        free: {
          current: 10,
          total: 16
        },
        metadata: {
          title: 'CPU',
          displayUnit: 'Core'
        }
      },
      memory: {
        used: {
          current: 32,
          total: 64
        },
        free: {
          current: 32,
          total: 64
        },
        metadata: {
          title: 'Memory',
          displayUnit: 'GiB'
        }
      },
      accelerators: [{
        key: 'gpu-0',
        used: {
          current: 1,
          total: 8
        },
        free: {
          current: 7,
          total: 8
        },
        metadata: {
          title: 'GPU',
          displayUnit: 'GPU'
        }
      }]
    },
    displayType: 'free',
    progressMode: 'normal',
    precision: 2
  }
}`,...(S=P.parameters)==null||(S=S.docs)==null?void 0:S.source}}},F.parameters={...F.parameters,docs:{...(C=F.parameters)==null?void 0:C.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Resource statistics with ghost progress bars showing a subtle background style.'
      }
    }
  },
  args: {
    resourceData: {
      cpu: {
        used: {
          current: 5,
          total: 8
        },
        free: {
          current: 3,
          total: 8
        },
        metadata: {
          title: 'CPU',
          displayUnit: 'Core'
        }
      },
      memory: {
        used: {
          current: 12,
          total: 16
        },
        free: {
          current: 4,
          total: 16
        },
        metadata: {
          title: 'Memory',
          displayUnit: 'GiB'
        }
      },
      accelerators: []
    },
    displayType: 'used',
    progressMode: 'ghost',
    progressSteps: 8,
    precision: 2
  }
}`,...(w=F.parameters)==null||(w=w.docs)==null?void 0:w.source}}},I.parameters={...I.parameters,docs:{...(T=I.parameters)==null?void 0:T.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Empty state when no resources are available. Shows a simple empty message.'
      }
    }
  },
  args: {
    resourceData: {
      cpu: null,
      memory: null,
      accelerators: []
    },
    displayType: 'used',
    progressMode: 'hidden',
    precision: 2
  }
}`,...(E=I.parameters)==null||(E=E.docs)==null?void 0:E.source}}},L.parameters={...L.parameters,docs:{...(D=L.parameters)==null?void 0:D.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Resource statistics showing high resource utilization (near capacity).'
      }
    }
  },
  args: {
    resourceData: {
      cpu: {
        used: {
          current: 15,
          total: 16
        },
        free: {
          current: 1,
          total: 16
        },
        metadata: {
          title: 'CPU',
          displayUnit: 'Core'
        }
      },
      memory: {
        used: {
          current: 60,
          total: 64
        },
        free: {
          current: 4,
          total: 64
        },
        metadata: {
          title: 'Memory',
          displayUnit: 'GiB'
        }
      },
      accelerators: [{
        key: 'gpu-0',
        used: {
          current: 7,
          total: 8
        },
        free: {
          current: 1,
          total: 8
        },
        metadata: {
          title: 'GPU',
          displayUnit: 'GPU'
        }
      }]
    },
    displayType: 'used',
    progressMode: 'normal',
    precision: 1
  }
}`,...(O=L.parameters)==null||(O=O.docs)==null?void 0:O.source}}},R.parameters={...R.parameters,docs:{...(k=R.parameters)==null?void 0:k.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Resource statistics with fractional values showing precise resource allocation.'
      }
    }
  },
  args: {
    resourceData: {
      cpu: {
        used: {
          current: 2.5,
          total: 8
        },
        free: {
          current: 5.5,
          total: 8
        },
        metadata: {
          title: 'CPU',
          displayUnit: 'Core'
        }
      },
      memory: {
        used: {
          current: 12.75,
          total: 32
        },
        free: {
          current: 19.25,
          total: 32
        },
        metadata: {
          title: 'Memory',
          displayUnit: 'GiB'
        }
      },
      accelerators: [{
        key: 'gpu-0',
        used: {
          current: 0.5,
          total: 1
        },
        free: {
          current: 0.5,
          total: 1
        },
        metadata: {
          title: 'GPU',
          displayUnit: 'fGPU'
        }
      }]
    },
    displayType: 'used',
    progressMode: 'normal',
    precision: 2
  }
}`,...(A=R.parameters)==null||(A=A.docs)==null?void 0:A.source}}},z=[`Default`,`WithAccelerators`,`FreeResources`,`GhostProgress`,`EmptyState`,`HighUtilization`,`FractionalResources`]})))()}B();export{M as Default,I as EmptyState,R as FractionalResources,P as FreeResources,F as GhostProgress,L as HighUtilization,N as WithAccelerators,z as __namedExportsOrder,j as default};