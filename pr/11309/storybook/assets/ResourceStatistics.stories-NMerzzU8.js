import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-MKhVqBIO.js";import{n,t as r}from"./useBAIi18n-EcIybVeJ.js";import{a as i,o as a}from"./touchPresentation-SlIXP8m0.js";import{n as o,t as s}from"./EmptyState-BN4nUsVp.js";import{n as c,t as l}from"./BAIFlex-DnaoYTJ1.js";import{n as u,r as d}from"./BAIBoard-aYV7THw1.js";import{n as f,t as p}from"./BAIRowWrapWithDividers-BkIAXLLL.js";import{n as m,t as h}from"./BAIStatistic-BMJdAAwC.js";var g,_,v;function y(){return(y=e((()=>{r(),u(),c(),f(),m(),o(),i(),g=t(),_=({note:e,children:t})=>e?(0,g.jsxs)(l,{direction:`column`,align:`start`,gap:`xxs`,children:[t,e]}):(0,g.jsx)(g.Fragment,{children:t}),v=({resourceData:e,displayType:t,progressMode:r=`hidden`,progressSteps:i,precision:o=2,notes:c})=>{let{t:u}=n(),{token:f}=a(),m=d();if(!(e.cpu||e.memory||e.accelerators.length>0))return(0,g.jsx)(s,{title:u(`comp:ResourceStatistics.NoResourcesData`)||``});let v=f(c?`--spacing-3`:`--spacing-4`);return(0,g.jsxs)(l,{direction:`row`,wrap:`wrap`,gap:c?`sm`:`lg`,children:[(0,g.jsxs)(p,{children:[e.cpu&&(0,g.jsx)(_,{note:c?.cpu,children:(0,g.jsx)(h,{current:e.cpu[t].current,total:e.cpu[t].total,title:e.cpu.metadata.title,unit:e.cpu.metadata.displayUnit,progressMode:r,progressSteps:i,precision:o,style:{color:t===`free`?f(`--color-success`):void 0}})}),e.memory&&(0,g.jsx)(_,{note:c?.memory,children:(0,g.jsx)(h,{current:e.memory[t].current,total:e.memory[t].total,title:e.memory.metadata.title,unit:e.memory.metadata.displayUnit,progressMode:r,progressSteps:i,precision:o,style:{color:t===`free`?f(`--color-success`):void 0}})})]}),e.accelerators.length>0&&(0,g.jsx)(p,{dividerColor:f(`--color-border-emphasized`),style:{backgroundColor:f(`--color-background-body`),borderRadius:f(`--radius-element`),padding:v,marginInline:m?`calc(-1 * ${v})`:void 0},children:e.accelerators.map(e=>(0,g.jsx)(_,{note:c?.[e.key],children:(0,g.jsx)(h,{current:e[t].current,total:e[t].total,title:e.metadata.title,unit:e.metadata.displayUnit,progressMode:r,progressSteps:i,precision:o,style:{color:t===`free`?f(`--color-success`):void 0}})},e.key))})]})}})))()}var b,x,S,C,w,T,E,D,O;function k(){return(k=e((()=>{y(),b={title:`Statistic/ResourceStatistics`,component:v,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:`
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
        `}}},argTypes:{resourceData:{control:!1,description:`Resource data including CPU, memory, and accelerators`,table:{type:{summary:`ResourceData`}}},displayType:{control:{type:`select`},options:[`used`,`free`],description:`Whether to display used or free resources`,table:{type:{summary:`'used' | 'free'`}}},progressMode:{control:{type:`select`},options:[`hidden`,`normal`,`ghost`],description:`Progress bar display mode`,table:{type:{summary:`'hidden' | 'normal' | 'ghost'`},defaultValue:{summary:`hidden`}}},precision:{control:{type:`number`,min:0,max:4,step:1},description:`Number of decimal places to show`,table:{type:{summary:`number`},defaultValue:{summary:`2`}}},progressSteps:{control:{type:`number`,min:1,max:20,step:1},description:`Number of steps in progress bar`,table:{type:{summary:`number`}}}}},x={name:`Basic`,parameters:{docs:{description:{story:`Basic resource statistics showing used resources.`}}},args:{resourceData:{cpu:{used:{current:4,total:8},free:{current:4,total:8},metadata:{title:`CPU`,displayUnit:`Core`}},memory:{used:{current:8,total:16},free:{current:8,total:16},metadata:{title:`Memory`,displayUnit:`GiB`}},accelerators:[]},displayType:`used`,progressMode:`hidden`,precision:2}},S={parameters:{docs:{description:{story:`Resource statistics including GPU and other accelerators.`}}},args:{resourceData:{cpu:{used:{current:12,total:24},free:{current:12,total:24},metadata:{title:`CPU`,displayUnit:`Core`}},memory:{used:{current:64,total:128},free:{current:64,total:128},metadata:{title:`Memory`,displayUnit:`GiB`}},accelerators:[{key:`gpu-0`,used:{current:2,total:4},free:{current:2,total:4},metadata:{title:`NVIDIA GPU`,displayUnit:`GPU`}},{key:`tpu-0`,used:{current:1,total:2},free:{current:1,total:2},metadata:{title:`TPU`,displayUnit:`TPU`}}]},displayType:`used`,progressMode:`normal`,precision:2}},C={parameters:{docs:{description:{story:`Displaying free (available) resources instead of used resources. Free resources are shown in success color.`}}},args:{resourceData:{cpu:{used:{current:6,total:16},free:{current:10,total:16},metadata:{title:`CPU`,displayUnit:`Core`}},memory:{used:{current:32,total:64},free:{current:32,total:64},metadata:{title:`Memory`,displayUnit:`GiB`}},accelerators:[{key:`gpu-0`,used:{current:1,total:8},free:{current:7,total:8},metadata:{title:`GPU`,displayUnit:`GPU`}}]},displayType:`free`,progressMode:`normal`,precision:2}},w={parameters:{docs:{description:{story:`Resource statistics with ghost progress bars showing a subtle background style.`}}},args:{resourceData:{cpu:{used:{current:5,total:8},free:{current:3,total:8},metadata:{title:`CPU`,displayUnit:`Core`}},memory:{used:{current:12,total:16},free:{current:4,total:16},metadata:{title:`Memory`,displayUnit:`GiB`}},accelerators:[]},displayType:`used`,progressMode:`ghost`,progressSteps:8,precision:2}},T={parameters:{docs:{description:{story:`Empty state when no resources are available. Shows a simple empty message.`}}},args:{resourceData:{cpu:null,memory:null,accelerators:[]},displayType:`used`,progressMode:`hidden`,precision:2}},E={parameters:{docs:{description:{story:`Resource statistics showing high resource utilization (near capacity).`}}},args:{resourceData:{cpu:{used:{current:15,total:16},free:{current:1,total:16},metadata:{title:`CPU`,displayUnit:`Core`}},memory:{used:{current:60,total:64},free:{current:4,total:64},metadata:{title:`Memory`,displayUnit:`GiB`}},accelerators:[{key:`gpu-0`,used:{current:7,total:8},free:{current:1,total:8},metadata:{title:`GPU`,displayUnit:`GPU`}}]},displayType:`used`,progressMode:`normal`,precision:1}},D={parameters:{docs:{description:{story:`Resource statistics with fractional values showing precise resource allocation.`}}},args:{resourceData:{cpu:{used:{current:2.5,total:8},free:{current:5.5,total:8},metadata:{title:`CPU`,displayUnit:`Core`}},memory:{used:{current:12.75,total:32},free:{current:19.25,total:32},metadata:{title:`Memory`,displayUnit:`GiB`}},accelerators:[{key:`gpu-0`,used:{current:.5,total:1},free:{current:.5,total:1},metadata:{title:`GPU`,displayUnit:`fGPU`}}]},displayType:`used`,progressMode:`normal`,precision:2}},O=[`Default`,`WithAccelerators`,`FreeResources`,`GhostProgress`,`EmptyState`,`HighUtilization`,`FractionalResources`],x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
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
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
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
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
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
}`,...D.parameters?.docs?.source}}}})))()}k();export{x as Default,T as EmptyState,D as FractionalResources,C as FreeResources,w as GhostProgress,E as HighUtilization,S as WithAccelerators,O as __namedExportsOrder,b as default};