import{a as W,t as z,j as n}from"./iframe-DprPRql5.js";import{B as V}from"./BAIFlex-DTyby6at.js";import{B as U}from"./BAIRowWrapWithDividers-CCFNtggd.js";import{B as g}from"./BAIStatistic-DKxuucc4.js";import{E as q}from"./EmptyState-Bv0I31g7.js";import"./preload-helper-Dp1pzeXC.js";import"./isUndefined-DCTLXrZ8.js";import"./_castFunction-a6W-o7Lo.js";import"./identity-DKeuBCMA.js";import"./toInteger-Big_x2HU.js";import"./toFinite-CjQtY0f6.js";import"./_trimmedEndIndex-DuQxD0U0.js";import"./isSymbol-DSoxgGf-.js";const H=({resourceData:e,displayType:t,progressMode:p="hidden",progressSteps:m,precision:y=2})=>{const{t:N}=W(),{token:r}=z.useToken();return e.cpu||e.memory||e.accelerators.length>0?n.jsxs(V,{direction:"row",wrap:"wrap",gap:"lg",children:[n.jsxs(U,{children:[e.cpu&&n.jsx(g,{current:e.cpu[t].current,total:e.cpu[t].total,title:e.cpu.metadata.title,unit:e.cpu.metadata.displayUnit,progressMode:p,progressSteps:m,precision:y,style:{color:t==="free"?r.colorSuccess:void 0}}),e.memory&&n.jsx(g,{current:e.memory[t].current,total:e.memory[t].total,title:e.memory.metadata.title,unit:e.memory.metadata.displayUnit,progressMode:p,progressSteps:m,precision:y,style:{color:t==="free"?r.colorSuccess:void 0}})]}),e.accelerators.length>0&&n.jsx(U,{dividerColor:r.colorBorder,style:{backgroundColor:r.colorBgLayout,borderRadius:r.borderRadiusLG,padding:r.padding},children:e.accelerators.map(s=>n.jsx(g,{current:s[t].current,total:s[t].total,title:s.metadata.title,unit:s.metadata.displayUnit,progressMode:p,progressSteps:m,precision:y,style:{color:t==="free"?r.colorSuccess:void 0}},s.key))})]}):n.jsx(q,{title:N("comp:ResourceStatistics.NoResourcesData")||""})},se={title:"Statistic/ResourceStatistics",component:H,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:`
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
        `}}},argTypes:{resourceData:{control:!1,description:"Resource data including CPU, memory, and accelerators",table:{type:{summary:"ResourceData"}}},displayType:{control:{type:"select"},options:["used","free"],description:"Whether to display used or free resources",table:{type:{summary:"'used' | 'free'"}}},progressMode:{control:{type:"select"},options:["hidden","normal","ghost"],description:"Progress bar display mode",table:{type:{summary:"'hidden' | 'normal' | 'ghost'"},defaultValue:{summary:"hidden"}}},precision:{control:{type:"number",min:0,max:4,step:1},description:"Number of decimal places to show",table:{type:{summary:"number"},defaultValue:{summary:"2"}}},progressSteps:{control:{type:"number",min:1,max:20,step:1},description:"Number of steps in progress bar",table:{type:{summary:"number"}}}}},a={name:"Basic",parameters:{docs:{description:{story:"Basic resource statistics showing used resources."}}},args:{resourceData:{cpu:{used:{current:4,total:8},free:{current:4,total:8},metadata:{title:"CPU",displayUnit:"Core"}},memory:{used:{current:8,total:16},free:{current:8,total:16},metadata:{title:"Memory",displayUnit:"GiB"}},accelerators:[]},displayType:"used",progressMode:"hidden",precision:2}},o={parameters:{docs:{description:{story:"Resource statistics including GPU and other accelerators."}}},args:{resourceData:{cpu:{used:{current:12,total:24},free:{current:12,total:24},metadata:{title:"CPU",displayUnit:"Core"}},memory:{used:{current:64,total:128},free:{current:64,total:128},metadata:{title:"Memory",displayUnit:"GiB"}},accelerators:[{key:"gpu-0",used:{current:2,total:4},free:{current:2,total:4},metadata:{title:"NVIDIA GPU",displayUnit:"GPU"}},{key:"tpu-0",used:{current:1,total:2},free:{current:1,total:2},metadata:{title:"TPU",displayUnit:"TPU"}}]},displayType:"used",progressMode:"normal",precision:2}},i={parameters:{docs:{description:{story:"Displaying free (available) resources instead of used resources. Free resources are shown in success color."}}},args:{resourceData:{cpu:{used:{current:6,total:16},free:{current:10,total:16},metadata:{title:"CPU",displayUnit:"Core"}},memory:{used:{current:32,total:64},free:{current:32,total:64},metadata:{title:"Memory",displayUnit:"GiB"}},accelerators:[{key:"gpu-0",used:{current:1,total:8},free:{current:7,total:8},metadata:{title:"GPU",displayUnit:"GPU"}}]},displayType:"free",progressMode:"normal",precision:2}},c={parameters:{docs:{description:{story:"Resource statistics with ghost progress bars showing a subtle background style."}}},args:{resourceData:{cpu:{used:{current:5,total:8},free:{current:3,total:8},metadata:{title:"CPU",displayUnit:"Core"}},memory:{used:{current:12,total:16},free:{current:4,total:16},metadata:{title:"Memory",displayUnit:"GiB"}},accelerators:[]},displayType:"used",progressMode:"ghost",progressSteps:8,precision:2}},l={parameters:{docs:{description:{story:"Empty state when no resources are available. Shows a simple empty message."}}},args:{resourceData:{cpu:null,memory:null,accelerators:[]},displayType:"used",progressMode:"hidden",precision:2}},u={parameters:{docs:{description:{story:"Resource statistics showing high resource utilization (near capacity)."}}},args:{resourceData:{cpu:{used:{current:15,total:16},free:{current:1,total:16},metadata:{title:"CPU",displayUnit:"Core"}},memory:{used:{current:60,total:64},free:{current:4,total:64},metadata:{title:"Memory",displayUnit:"GiB"}},accelerators:[{key:"gpu-0",used:{current:7,total:8},free:{current:1,total:8},metadata:{title:"GPU",displayUnit:"GPU"}}]},displayType:"used",progressMode:"normal",precision:1}},d={parameters:{docs:{description:{story:"Resource statistics with fractional values showing precise resource allocation."}}},args:{resourceData:{cpu:{used:{current:2.5,total:8},free:{current:5.5,total:8},metadata:{title:"CPU",displayUnit:"Core"}},memory:{used:{current:12.75,total:32},free:{current:19.25,total:32},metadata:{title:"Memory",displayUnit:"GiB"}},accelerators:[{key:"gpu-0",used:{current:.5,total:1},free:{current:.5,total:1},metadata:{title:"GPU",displayUnit:"fGPU"}}]},displayType:"used",progressMode:"normal",precision:2}};var f,h,P;a.parameters={...a.parameters,docs:{...(f=a.parameters)==null?void 0:f.docs,source:{originalSource:`{
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
}`,...(P=(h=a.parameters)==null?void 0:h.docs)==null?void 0:P.source}}};var b,G,C;o.parameters={...o.parameters,docs:{...(b=o.parameters)==null?void 0:b.docs,source:{originalSource:`{
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
}`,...(C=(G=o.parameters)==null?void 0:G.docs)==null?void 0:C.source}}};var w,M,R;i.parameters={...i.parameters,docs:{...(w=i.parameters)==null?void 0:w.docs,source:{originalSource:`{
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
}`,...(R=(M=i.parameters)==null?void 0:M.docs)==null?void 0:R.source}}};var S,B,D;c.parameters={...c.parameters,docs:{...(S=c.parameters)==null?void 0:S.docs,source:{originalSource:`{
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
}`,...(D=(B=c.parameters)==null?void 0:B.docs)==null?void 0:D.source}}};var T,k,v;l.parameters={...l.parameters,docs:{...(T=l.parameters)==null?void 0:T.docs,source:{originalSource:`{
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
}`,...(v=(k=l.parameters)==null?void 0:k.docs)==null?void 0:v.source}}};var x,A,j;u.parameters={...u.parameters,docs:{...(x=u.parameters)==null?void 0:x.docs,source:{originalSource:`{
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
}`,...(j=(A=u.parameters)==null?void 0:A.docs)==null?void 0:j.source}}};var E,I,F;d.parameters={...d.parameters,docs:{...(E=d.parameters)==null?void 0:E.docs,source:{originalSource:`{
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
}`,...(F=(I=d.parameters)==null?void 0:I.docs)==null?void 0:F.source}}};const ae=["Default","WithAccelerators","FreeResources","GhostProgress","EmptyState","HighUtilization","FractionalResources"];export{a as Default,l as EmptyState,d as FractionalResources,i as FreeResources,c as GhostProgress,u as HighUtilization,o as WithAccelerators,ae as __namedExportsOrder,se as default};
