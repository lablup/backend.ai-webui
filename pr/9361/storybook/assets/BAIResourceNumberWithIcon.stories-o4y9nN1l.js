import{j as e}from"./iframe-CHHFS3of.js";import{B as n}from"./BAIFlex-Bhrcnfos.js";import{B as a,a as M}from"./BAIResourceNumberWithIcon-DUHHG4sA.js";import"./preload-helper-Dp1pzeXC.js";import"./index-BRVv_H-n.js";import"./isNumber-294Wylfl.js";import"./toString-BRpQWpnP.js";import"./isSymbol-MI8TWXZd.js";import"./filter--0av5-Ll.js";import"./_baseEach-BT3s913C.js";import"./get-Cmsft4qe.js";import"./_baseGet-BvLvbsIf.js";import"./identity-DKeuBCMA.js";import"./isEmpty-BNAn4tbM.js";import"./astryxPlacement-BxR6_qos.js";import"./BAITpuIcon-C029eNgB.js";import"./BAINumberWithUnit-Dgz0c10U.js";import"./isUndefined-DCTLXrZ8.js";import"./_charsEndIndex-BHSW-HpW.js";import"./_baseSlice-F8doVSIJ.js";import"./_baseIndexOf-Be9UPhX8.js";import"./_baseFindIndex-Cj99RmFE.js";import"./_trimmedEndIndex-DuQxD0U0.js";const P={cpu:{slot_name:"cpu",description:"CPU",human_readable_name:"CPU",display_unit:"Core",number_format:{binary:!1,round_length:0},display_icon:"cpu"},mem:{slot_name:"mem",description:"Memory",human_readable_name:"Memory",display_unit:"GiB",number_format:{binary:!0,round_length:2},display_icon:"mem"},"cuda.device":{slot_name:"cuda.device",description:"NVIDIA GPU",human_readable_name:"GPU",display_unit:"GPU",number_format:{binary:!1,round_length:0},display_icon:"nvidia"},"cuda.shares":{slot_name:"cuda.shares",description:"NVIDIA GPU (fractional)",human_readable_name:"GPU",display_unit:"FGPU",number_format:{binary:!1,round_length:1},display_icon:"nvidia"},"rocm.device":{slot_name:"rocm.device",description:"AMD GPU",human_readable_name:"GPU",display_unit:"GPU",number_format:{binary:!1,round_length:0},display_icon:"rocm"},"tpu.device":{slot_name:"tpu.device",description:"Google TPU",human_readable_name:"TPU",display_unit:"TPU",number_format:{binary:!1,round_length:0},display_icon:"tpu"},"ipu.device":{slot_name:"ipu.device",description:"Graphcore IPU",human_readable_name:"IPU",display_unit:"IPU",number_format:{binary:!1,round_length:0},display_icon:"ipu"},"gaudi2.device":{slot_name:"gaudi2.device",description:"Intel Gaudi2",human_readable_name:"Gaudi2",display_unit:"Gaudi2",number_format:{binary:!1,round_length:0},display_icon:"gaudi"},"warboy.device":{slot_name:"warboy.device",description:"FuriosaAI Warboy",human_readable_name:"Warboy",display_unit:"Warboy",number_format:{binary:!1,round_length:0},display_icon:"furiosa"},"rngd.device":{slot_name:"rngd.device",description:"FuriosaAI RNGD",human_readable_name:"RNGD",display_unit:"RNGD",number_format:{binary:!1,round_length:0},display_icon:"furiosa"},"atom.device":{slot_name:"atom.device",description:"Rebellions ATOM",human_readable_name:"ATOM",display_unit:"ATOM",number_format:{binary:!1,round_length:0},display_icon:"rebel"},"atom-plus.device":{slot_name:"atom-plus.device",description:"Rebellions ATOM+",human_readable_name:"ATOM+",display_unit:"ATOM+",number_format:{binary:!1,round_length:0},display_icon:"rebel"},"atom-max.device":{slot_name:"atom-max.device",description:"Rebellions ATOM Max",human_readable_name:"ATOM Max",display_unit:"ATOM Max",number_format:{binary:!1,round_length:0},display_icon:"rebel"},"hyperaccel-lpu.device":{slot_name:"hyperaccel-lpu.device",description:"Hyperaccel LPU",human_readable_name:"LPU",display_unit:"LPU",number_format:{binary:!1,round_length:0},display_icon:"hyperaccel"},"tt-n300.device":{slot_name:"tt-n300.device",description:"Tenstorrent Wormhole™ n300",human_readable_name:"Tenstorrent Wormhole™ n300 Device",display_unit:"n300",number_format:{binary:!1,round_length:0},display_icon:"tenstorrent"}},ee={title:"Statistic/BAIResourceNumberWithIcon",component:a,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:"\n**BAIResourceNumberWithIcon** displays a resource value with its corresponding icon and unit.\n\n- **Automatic formatting**: Handles binary units (GiB, MiB) and decimal formats\n- **Resource icons**: Shows appropriate icons for CPU, memory, and accelerators\n- **Range display**: Supports min~max value ranges and unlimited (∞) resources\n- **Device metadata**: Uses BAIMetaDataProvider for device-specific formatting\n\n## Props\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `type` | `string` | - | Resource type (e.g., 'cpu', 'mem', 'cuda.device') |\n| `value` | `string` | - | Resource amount as string |\n| `max` | `string` | `undefined` | Optional maximum value, supports 'Infinity' |\n| `hideTooltip` | `boolean` | `false` | When true, hides the tooltip on the resource icon |\n| `opts` | `ResourceOpts` | `undefined` | Additional options like shmem for memory |\n| `extra` | `React.ReactNode` | `undefined` | Extra content to display after the number |\n        "}}},decorators:[l=>e.jsx(M,{deviceMetaData:P,imagePath:"resources/icons",children:e.jsx(l,{})})],argTypes:{type:{control:{type:"select"},options:["cpu","mem","cuda.device","cuda.shares","rocm.device","tpu.device","ipu.device","gaudi2.device","warboy.device","rngd.device","atom.device","atom-plus.device","atom-max.device","hyperaccel-lpu.device"],description:"Resource type",table:{type:{summary:"string"}}},value:{control:{type:"text"},description:"Resource amount as string",table:{type:{summary:"string"}}},max:{control:{type:"text"},description:'Optional maximum value, supports "Infinity"',table:{type:{summary:"string"},defaultValue:{summary:"undefined"}}},hideTooltip:{control:{type:"boolean"},description:"When true, hides the tooltip on the resource icon",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},opts:{control:{type:"object"},description:"Additional options like shmem for memory resources",table:{type:{summary:"ResourceOpts"},defaultValue:{summary:"undefined"}}},extra:{control:!1,description:"Extra content to display after the resource number",table:{type:{summary:"React.ReactNode"},defaultValue:{summary:"undefined"}}}}},s={name:"Basic Usage",args:{type:"cpu",value:"4"}},i={parameters:{docs:{description:{story:"Shows all supported resource types with their respective icons and units."}}},render:()=>e.jsxs(n,{direction:"column",gap:"md",align:"start",children:[e.jsxs(n,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:160},children:"CPU:"}),e.jsx(a,{type:"cpu",value:"8"})]}),e.jsxs(n,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:160},children:"Memory:"}),e.jsx(a,{type:"mem",value:"16000000000"})]}),e.jsxs(n,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:160},children:"NVIDIA GPU:"}),e.jsx(a,{type:"cuda.device",value:"2"})]}),e.jsxs(n,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:160},children:"NVIDIA FGPU:"}),e.jsx(a,{type:"cuda.shares",value:"0.5"})]}),e.jsxs(n,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:160},children:"AMD GPU:"}),e.jsx(a,{type:"rocm.device",value:"1"})]}),e.jsxs(n,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:160},children:"Google TPU:"}),e.jsx(a,{type:"tpu.device",value:"4"})]}),e.jsxs(n,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:160},children:"Graphcore IPU:"}),e.jsx(a,{type:"ipu.device",value:"2"})]}),e.jsxs(n,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:160},children:"Intel Gaudi2:"}),e.jsx(a,{type:"gaudi2.device",value:"1"})]}),e.jsxs(n,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:160},children:"FuriosaAI Warboy:"}),e.jsx(a,{type:"warboy.device",value:"2"})]}),e.jsxs(n,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:160},children:"FuriosaAI RNGD:"}),e.jsx(a,{type:"rngd.device",value:"1"})]}),e.jsxs(n,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:160},children:"Rebellions ATOM:"}),e.jsx(a,{type:"atom.device",value:"2"})]}),e.jsxs(n,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:160},children:"Rebellions ATOM+:"}),e.jsx(a,{type:"atom-plus.device",value:"1"})]}),e.jsxs(n,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:160},children:"Rebellions ATOM Max:"}),e.jsx(a,{type:"atom-max.device",value:"1"})]}),e.jsxs(n,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:160},children:"Hyperaccel LPU:"}),e.jsx(a,{type:"hyperaccel-lpu.device",value:"4"})]}),e.jsxs(n,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:160},children:"Tenstorrent Wormhole™ n300:"}),e.jsx(a,{type:"tt-n300.device",value:"2"})]})]})},t={parameters:{docs:{description:{story:"Demonstrates resource ranges with minimum and maximum values."}}},render:()=>e.jsxs(n,{direction:"column",gap:"md",align:"start",children:[e.jsxs(n,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:150},children:"CPU (4~8):"}),e.jsx(a,{type:"cpu",value:"4",max:"8"})]}),e.jsxs(n,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:150},children:"Memory (8~16 GiB):"}),e.jsx(a,{type:"mem",value:"8000000000",max:"16000000000"})]}),e.jsxs(n,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:150},children:"GPU (1~Unlimited):"}),e.jsx(a,{type:"cuda.device",value:"1",max:"Infinity"})]})]})},r={parameters:{docs:{description:{story:"Shows memory resources with shared memory (SHM) information."}}},render:()=>e.jsxs(n,{direction:"column",gap:"md",align:"start",children:[e.jsxs(n,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:180},children:"Memory with SHM:"}),e.jsx(a,{type:"mem",value:"16000000000",opts:{shmem:1e9}})]}),e.jsxs(n,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:180},children:"Memory without SHM:"}),e.jsx(a,{type:"mem",value:"16000000000"})]})]})},o={parameters:{docs:{description:{story:"\nDemonstrates how the component handles devices whose `display_icon` is **not** in the built-in `knownDeviceIcons` set\n(`nvidia`, `rocm`, `tpu`, `ipu`, `gaudi`, `furiosa`, `rebel`, `tenstorrent`).\n\n**Icon resolution order for unknown devices:**\n1. `display_icon` is set but not in built-in set → loads `{imagePath}/{display_icon}.svg` from the host's icon directory\n2. SVG file missing (404) → falls back to `MicrochipIcon`\n3. `display_icon` not set at all → falls back to `MicrochipIcon`\n\n> **Note:** The \"SVG from server\" row uses `npu_generic.svg` as a stand-in example\n> since it already exists in the host's `resources/icons/` and is not part of `knownDeviceIcons`.\n> In production, any server-configured accelerator with a custom `display_icon` name follows the same path."}}},decorators:[l=>{const R={...P,"npu-generic.device":{slot_name:"npu-generic.device",description:"Generic NPU (server-configured icon)",human_readable_name:"NPU",display_unit:"NPU",number_format:{binary:!1,round_length:0},display_icon:"npu_generic"},"unknown.device":{slot_name:"unknown.device",description:"Unknown device (missing icon file)",human_readable_name:"Unknown",display_unit:"Unit",number_format:{binary:!1,round_length:0},display_icon:"nonexistent_icon"}};return e.jsx(M,{deviceMetaData:R,imagePath:"resources/icons",children:e.jsx(l,{})})}],render:()=>e.jsxs(n,{direction:"column",gap:"md",align:"start",children:[e.jsxs(n,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:240},children:"SVG from server (npu_generic.svg):"}),e.jsx(a,{type:"npu-generic.device",value:"2"})]}),e.jsxs(n,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:240},children:"Fallback (missing SVG file):"}),e.jsx(a,{type:"unknown.device",value:"1"})]})]})},c={parameters:{docs:{description:{story:"Compares resource display with and without icon tooltips."}}},render:()=>e.jsxs(n,{direction:"column",gap:"md",align:"start",children:[e.jsxs(n,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:150},children:"With tooltip:"}),e.jsx(a,{type:"cpu",value:"8",hideTooltip:!1})]}),e.jsxs(n,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:150},children:"Without tooltip:"}),e.jsx(a,{type:"cpu",value:"8",hideTooltip:!0})]})]})};var d,p,m;s.parameters={...s.parameters,docs:{...(d=s.parameters)==null?void 0:d.docs,source:{originalSource:`{
  name: 'Basic Usage',
  args: {
    type: 'cpu',
    value: '4'
  }
}`,...(m=(p=s.parameters)==null?void 0:p.docs)==null?void 0:m.source}}};var u,h,y;i.parameters={...i.parameters,docs:{...(u=i.parameters)==null?void 0:u.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Shows all supported resource types with their respective icons and units.'
      }
    }
  },
  render: () => <BAIFlex direction="column" gap="md" align="start">
      {/* Base Resources */}
      <BAIFlex gap="sm" align="center">
        <span style={{
        width: 160
      }}>CPU:</span>
        <BAIResourceNumberWithIcon type="cpu" value="8" />
      </BAIFlex>
      <BAIFlex gap="sm" align="center">
        <span style={{
        width: 160
      }}>Memory:</span>
        <BAIResourceNumberWithIcon type="mem" value="16000000000" />
      </BAIFlex>
      {/* NVIDIA */}
      <BAIFlex gap="sm" align="center">
        <span style={{
        width: 160
      }}>NVIDIA GPU:</span>
        <BAIResourceNumberWithIcon type="cuda.device" value="2" />
      </BAIFlex>
      <BAIFlex gap="sm" align="center">
        <span style={{
        width: 160
      }}>NVIDIA FGPU:</span>
        <BAIResourceNumberWithIcon type="cuda.shares" value="0.5" />
      </BAIFlex>
      {/* AMD */}
      <BAIFlex gap="sm" align="center">
        <span style={{
        width: 160
      }}>AMD GPU:</span>
        <BAIResourceNumberWithIcon type="rocm.device" value="1" />
      </BAIFlex>
      {/* Google TPU */}
      <BAIFlex gap="sm" align="center">
        <span style={{
        width: 160
      }}>Google TPU:</span>
        <BAIResourceNumberWithIcon type="tpu.device" value="4" />
      </BAIFlex>
      {/* Graphcore IPU */}
      <BAIFlex gap="sm" align="center">
        <span style={{
        width: 160
      }}>Graphcore IPU:</span>
        <BAIResourceNumberWithIcon type="ipu.device" value="2" />
      </BAIFlex>
      {/* Intel Gaudi */}
      <BAIFlex gap="sm" align="center">
        <span style={{
        width: 160
      }}>Intel Gaudi2:</span>
        <BAIResourceNumberWithIcon type="gaudi2.device" value="1" />
      </BAIFlex>
      {/* FuriosaAI */}
      <BAIFlex gap="sm" align="center">
        <span style={{
        width: 160
      }}>FuriosaAI Warboy:</span>
        <BAIResourceNumberWithIcon type="warboy.device" value="2" />
      </BAIFlex>
      <BAIFlex gap="sm" align="center">
        <span style={{
        width: 160
      }}>FuriosaAI RNGD:</span>
        <BAIResourceNumberWithIcon type="rngd.device" value="1" />
      </BAIFlex>
      {/* Rebellions */}
      <BAIFlex gap="sm" align="center">
        <span style={{
        width: 160
      }}>Rebellions ATOM:</span>
        <BAIResourceNumberWithIcon type="atom.device" value="2" />
      </BAIFlex>
      <BAIFlex gap="sm" align="center">
        <span style={{
        width: 160
      }}>Rebellions ATOM+:</span>
        <BAIResourceNumberWithIcon type="atom-plus.device" value="1" />
      </BAIFlex>
      <BAIFlex gap="sm" align="center">
        <span style={{
        width: 160
      }}>Rebellions ATOM Max:</span>
        <BAIResourceNumberWithIcon type="atom-max.device" value="1" />
      </BAIFlex>
      {/* Hyperaccel */}
      <BAIFlex gap="sm" align="center">
        <span style={{
        width: 160
      }}>Hyperaccel LPU:</span>
        <BAIResourceNumberWithIcon type="hyperaccel-lpu.device" value="4" />
      </BAIFlex>
      {/* Tenstorrent */}
      <BAIFlex gap="sm" align="center">
        <span style={{
        width: 160
      }}>Tenstorrent Wormhole™ n300:</span>
        <BAIResourceNumberWithIcon type="tt-n300.device" value="2" />
      </BAIFlex>
    </BAIFlex>
}`,...(y=(h=i.parameters)==null?void 0:h.docs)==null?void 0:y.source}}};var g,x,v;t.parameters={...t.parameters,docs:{...(g=t.parameters)==null?void 0:g.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates resource ranges with minimum and maximum values.'
      }
    }
  },
  render: () => <BAIFlex direction="column" gap="md" align="start">
      <BAIFlex gap="sm" align="center">
        <span style={{
        width: 150
      }}>CPU (4~8):</span>
        <BAIResourceNumberWithIcon type="cpu" value="4" max="8" />
      </BAIFlex>
      <BAIFlex gap="sm" align="center">
        <span style={{
        width: 150
      }}>Memory (8~16 GiB):</span>
        <BAIResourceNumberWithIcon type="mem" value="8000000000" max="16000000000" />
      </BAIFlex>
      <BAIFlex gap="sm" align="center">
        <span style={{
        width: 150
      }}>GPU (1~Unlimited):</span>
        <BAIResourceNumberWithIcon type="cuda.device" value="1" max="Infinity" />
      </BAIFlex>
    </BAIFlex>
}`,...(v=(x=t.parameters)==null?void 0:x.docs)==null?void 0:v.source}}};var I,_,b;r.parameters={...r.parameters,docs:{...(I=r.parameters)==null?void 0:I.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Shows memory resources with shared memory (SHM) information.'
      }
    }
  },
  render: () => <BAIFlex direction="column" gap="md" align="start">
      <BAIFlex gap="sm" align="center">
        <span style={{
        width: 180
      }}>Memory with SHM:</span>
        <BAIResourceNumberWithIcon type="mem" value="16000000000" opts={{
        shmem: 1000000000
      }} />
      </BAIFlex>
      <BAIFlex gap="sm" align="center">
        <span style={{
        width: 180
      }}>Memory without SHM:</span>
        <BAIResourceNumberWithIcon type="mem" value="16000000000" />
      </BAIFlex>
    </BAIFlex>
}`,...(b=(_=r.parameters)==null?void 0:_.docs)==null?void 0:b.source}}};var A,f,w;o.parameters={...o.parameters,docs:{...(A=o.parameters)==null?void 0:A.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: \`
Demonstrates how the component handles devices whose \\\`display_icon\\\` is **not** in the built-in \\\`knownDeviceIcons\\\` set
(\\\`nvidia\\\`, \\\`rocm\\\`, \\\`tpu\\\`, \\\`ipu\\\`, \\\`gaudi\\\`, \\\`furiosa\\\`, \\\`rebel\\\`, \\\`tenstorrent\\\`).

**Icon resolution order for unknown devices:**
1. \\\`display_icon\\\` is set but not in built-in set → loads \\\`{imagePath}/{display_icon}.svg\\\` from the host's icon directory
2. SVG file missing (404) → falls back to \\\`MicrochipIcon\\\`
3. \\\`display_icon\\\` not set at all → falls back to \\\`MicrochipIcon\\\`

> **Note:** The "SVG from server" row uses \\\`npu_generic.svg\\\` as a stand-in example
> since it already exists in the host's \\\`resources/icons/\\\` and is not part of \\\`knownDeviceIcons\\\`.
> In production, any server-configured accelerator with a custom \\\`display_icon\\\` name follows the same path.\`
      }
    }
  },
  decorators: [Story => {
    const extendedDeviceMetaData = {
      ...mockDeviceMetaData,
      // an icon file the host serves, with no bundled component for it
      'npu-generic.device': {
        slot_name: 'npu-generic.device',
        description: 'Generic NPU (server-configured icon)',
        human_readable_name: 'NPU',
        display_unit: 'NPU',
        number_format: {
          binary: false,
          round_length: 0
        },
        display_icon: 'npu_generic'
      },
      // no such icon file, so the generic glyph is used
      'unknown.device': {
        slot_name: 'unknown.device',
        description: 'Unknown device (missing icon file)',
        human_readable_name: 'Unknown',
        display_unit: 'Unit',
        number_format: {
          binary: false,
          round_length: 0
        },
        display_icon: 'nonexistent_icon'
      }
    };
    return <BAIMetaDataProvider deviceMetaData={extendedDeviceMetaData} imagePath="resources/icons">
          <Story />
        </BAIMetaDataProvider>;
  }],
  render: () => <BAIFlex direction="column" gap="md" align="start">
      <BAIFlex gap="sm" align="center">
        <span style={{
        width: 240
      }}>SVG from server (npu_generic.svg):</span>
        <BAIResourceNumberWithIcon type="npu-generic.device" value="2" />
      </BAIFlex>
      <BAIFlex gap="sm" align="center">
        <span style={{
        width: 240
      }}>Fallback (missing SVG file):</span>
        <BAIResourceNumberWithIcon type="unknown.device" value="1" />
      </BAIFlex>
    </BAIFlex>
}`,...(w=(f=o.parameters)==null?void 0:f.docs)==null?void 0:w.source}}};var B,j,F;c.parameters={...c.parameters,docs:{...(B=c.parameters)==null?void 0:B.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Compares resource display with and without icon tooltips.'
      }
    }
  },
  render: () => <BAIFlex direction="column" gap="md" align="start">
      <BAIFlex gap="sm" align="center">
        <span style={{
        width: 150
      }}>With tooltip:</span>
        <BAIResourceNumberWithIcon type="cpu" value="8" hideTooltip={false} />
      </BAIFlex>
      <BAIFlex gap="sm" align="center">
        <span style={{
        width: 150
      }}>Without tooltip:</span>
        <BAIResourceNumberWithIcon type="cpu" value="8" hideTooltip={true} />
      </BAIFlex>
    </BAIFlex>
}`,...(F=(j=c.parameters)==null?void 0:j.docs)==null?void 0:F.source}}};const ne=["Default","ResourceTypes","WithMaxValue","WithSharedMemory","ServerConfiguredIcon","WithoutTooltip"];export{s as Default,i as ResourceTypes,o as ServerConfiguredIcon,t as WithMaxValue,r as WithSharedMemory,c as WithoutTooltip,ne as __namedExportsOrder,ee as default};
