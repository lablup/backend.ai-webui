import{n as e}from"./rolldown-runtime-2s6bX4vc.js";import{n as t,t as n}from"./useBAIi18n-BoXCk5K0.js";import{n as r,t as i}from"./BAIFlex-CAz1t6J5.js";import{n as a,t as o}from"./BAIRowWrapWithDividers-BG9SuCFQ.js";import{n as s,t as c}from"./BAIStatistic-BDpu9CtG.js";import{jsx as l,jsxs as u}from"react/jsx-runtime";import{useTheme as d}from"@lablup/ui-common/theme";import{EmptyState as f}from"@lablup/ui-common/EmptyState";var p;function m(){return(m=e((()=>{n(),r(),a(),s(),p=({resourceData:e,displayType:n,progressMode:r=`hidden`,progressSteps:a,precision:s=2})=>{let{t:p}=t(),{token:m}=d();return e.cpu||e.memory||e.accelerators.length>0?u(i,{direction:`row`,wrap:`wrap`,gap:`lg`,children:[u(o,{children:[e.cpu&&l(c,{current:e.cpu[n].current,total:e.cpu[n].total,title:e.cpu.metadata.title,unit:e.cpu.metadata.displayUnit,progressMode:r,progressSteps:a,precision:s,style:{color:n===`free`?m(`--color-success`):void 0}}),e.memory&&l(c,{current:e.memory[n].current,total:e.memory[n].total,title:e.memory.metadata.title,unit:e.memory.metadata.displayUnit,progressMode:r,progressSteps:a,precision:s,style:{color:n===`free`?m(`--color-success`):void 0}})]}),e.accelerators.length>0&&l(o,{dividerColor:m(`--color-border-emphasized`),style:{backgroundColor:m(`--color-background-body`),borderRadius:m(`--radius-element`),padding:m(`--spacing-4`)},children:e.accelerators.map(e=>l(c,{current:e[n].current,total:e[n].total,title:e.metadata.title,unit:e.metadata.displayUnit,progressMode:r,progressSteps:a,precision:s,style:{color:n===`free`?m(`--color-success`):void 0}},e.key))})]}):l(f,{title:p(`comp:ResourceStatistics.NoResourcesData`)||``})}})))()}var h,g,_,v,y,b,x,S,C;function w(){return(w=e((()=>{m(),h={title:`Statistic/ResourceStatistics`,component:p,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:`
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
        `}}},argTypes:{resourceData:{control:!1,description:`Resource data including CPU, memory, and accelerators`,table:{type:{summary:`ResourceData`}}},displayType:{control:{type:`select`},options:[`used`,`free`],description:`Whether to display used or free resources`,table:{type:{summary:`'used' | 'free'`}}},progressMode:{control:{type:`select`},options:[`hidden`,`normal`,`ghost`],description:`Progress bar display mode`,table:{type:{summary:`'hidden' | 'normal' | 'ghost'`},defaultValue:{summary:`hidden`}}},precision:{control:{type:`number`,min:0,max:4,step:1},description:`Number of decimal places to show`,table:{type:{summary:`number`},defaultValue:{summary:`2`}}},progressSteps:{control:{type:`number`,min:1,max:20,step:1},description:`Number of steps in progress bar`,table:{type:{summary:`number`}}}}},g={name:`Basic`,parameters:{docs:{description:{story:`Basic resource statistics showing used resources.`}}},args:{resourceData:{cpu:{used:{current:4,total:8},free:{current:4,total:8},metadata:{title:`CPU`,displayUnit:`Core`}},memory:{used:{current:8,total:16},free:{current:8,total:16},metadata:{title:`Memory`,displayUnit:`GiB`}},accelerators:[]},displayType:`used`,progressMode:`hidden`,precision:2}},_={parameters:{docs:{description:{story:`Resource statistics including GPU and other accelerators.`}}},args:{resourceData:{cpu:{used:{current:12,total:24},free:{current:12,total:24},metadata:{title:`CPU`,displayUnit:`Core`}},memory:{used:{current:64,total:128},free:{current:64,total:128},metadata:{title:`Memory`,displayUnit:`GiB`}},accelerators:[{key:`gpu-0`,used:{current:2,total:4},free:{current:2,total:4},metadata:{title:`NVIDIA GPU`,displayUnit:`GPU`}},{key:`tpu-0`,used:{current:1,total:2},free:{current:1,total:2},metadata:{title:`TPU`,displayUnit:`TPU`}}]},displayType:`used`,progressMode:`normal`,precision:2}},v={parameters:{docs:{description:{story:`Displaying free (available) resources instead of used resources. Free resources are shown in success color.`}}},args:{resourceData:{cpu:{used:{current:6,total:16},free:{current:10,total:16},metadata:{title:`CPU`,displayUnit:`Core`}},memory:{used:{current:32,total:64},free:{current:32,total:64},metadata:{title:`Memory`,displayUnit:`GiB`}},accelerators:[{key:`gpu-0`,used:{current:1,total:8},free:{current:7,total:8},metadata:{title:`GPU`,displayUnit:`GPU`}}]},displayType:`free`,progressMode:`normal`,precision:2}},y={parameters:{docs:{description:{story:`Resource statistics with ghost progress bars showing a subtle background style.`}}},args:{resourceData:{cpu:{used:{current:5,total:8},free:{current:3,total:8},metadata:{title:`CPU`,displayUnit:`Core`}},memory:{used:{current:12,total:16},free:{current:4,total:16},metadata:{title:`Memory`,displayUnit:`GiB`}},accelerators:[]},displayType:`used`,progressMode:`ghost`,progressSteps:8,precision:2}},b={parameters:{docs:{description:{story:`Empty state when no resources are available. Shows a simple empty message.`}}},args:{resourceData:{cpu:null,memory:null,accelerators:[]},displayType:`used`,progressMode:`hidden`,precision:2}},x={parameters:{docs:{description:{story:`Resource statistics showing high resource utilization (near capacity).`}}},args:{resourceData:{cpu:{used:{current:15,total:16},free:{current:1,total:16},metadata:{title:`CPU`,displayUnit:`Core`}},memory:{used:{current:60,total:64},free:{current:4,total:64},metadata:{title:`Memory`,displayUnit:`GiB`}},accelerators:[{key:`gpu-0`,used:{current:7,total:8},free:{current:1,total:8},metadata:{title:`GPU`,displayUnit:`GPU`}}]},displayType:`used`,progressMode:`normal`,precision:1}},S={parameters:{docs:{description:{story:`Resource statistics with fractional values showing precise resource allocation.`}}},args:{resourceData:{cpu:{used:{current:2.5,total:8},free:{current:5.5,total:8},metadata:{title:`CPU`,displayUnit:`Core`}},memory:{used:{current:12.75,total:32},free:{current:19.25,total:32},metadata:{title:`Memory`,displayUnit:`GiB`}},accelerators:[{key:`gpu-0`,used:{current:.5,total:1},free:{current:.5,total:1},metadata:{title:`GPU`,displayUnit:`fGPU`}}]},displayType:`used`,progressMode:`normal`,precision:2}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}},C=[`Default`,`WithAccelerators`,`FreeResources`,`GhostProgress`,`EmptyState`,`HighUtilization`,`FractionalResources`]})))()}w();export{g as Default,b as EmptyState,S as FractionalResources,v as FreeResources,y as GhostProgress,x as HighUtilization,_ as WithAccelerators,C as __namedExportsOrder,h as default};