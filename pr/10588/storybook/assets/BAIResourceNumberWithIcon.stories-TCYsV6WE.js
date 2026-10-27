import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{o as t,r as n,s as r,t as i}from"./BAIResourceNumberWithIcon-DJ0kDeg2.js";import{t as a}from"./jsx-runtime-MKhVqBIO.js";import{n as o,t as s}from"./BAIFlex-BOFoS5KY.js";var c,l,u,d,f,p,m,h,g,_;function v(){return(v=e((()=>{o(),n(),r(),c=a(),l={cpu:{slot_name:`cpu`,description:`CPU`,human_readable_name:`CPU`,display_unit:`Core`,number_format:{binary:!1,round_length:0},display_icon:`cpu`},mem:{slot_name:`mem`,description:`Memory`,human_readable_name:`Memory`,display_unit:`GiB`,number_format:{binary:!0,round_length:2},display_icon:`mem`},"cuda.device":{slot_name:`cuda.device`,description:`NVIDIA GPU`,human_readable_name:`GPU`,display_unit:`GPU`,number_format:{binary:!1,round_length:0},display_icon:`nvidia`},"cuda.shares":{slot_name:`cuda.shares`,description:`NVIDIA GPU (fractional)`,human_readable_name:`GPU`,display_unit:`FGPU`,number_format:{binary:!1,round_length:1},display_icon:`nvidia`},"rocm.device":{slot_name:`rocm.device`,description:`AMD GPU`,human_readable_name:`GPU`,display_unit:`GPU`,number_format:{binary:!1,round_length:0},display_icon:`rocm`},"tpu.device":{slot_name:`tpu.device`,description:`Google TPU`,human_readable_name:`TPU`,display_unit:`TPU`,number_format:{binary:!1,round_length:0},display_icon:`tpu`},"ipu.device":{slot_name:`ipu.device`,description:`Graphcore IPU`,human_readable_name:`IPU`,display_unit:`IPU`,number_format:{binary:!1,round_length:0},display_icon:`ipu`},"gaudi2.device":{slot_name:`gaudi2.device`,description:`Intel Gaudi2`,human_readable_name:`Gaudi2`,display_unit:`Gaudi2`,number_format:{binary:!1,round_length:0},display_icon:`gaudi`},"warboy.device":{slot_name:`warboy.device`,description:`FuriosaAI Warboy`,human_readable_name:`Warboy`,display_unit:`Warboy`,number_format:{binary:!1,round_length:0},display_icon:`furiosa`},"rngd.device":{slot_name:`rngd.device`,description:`FuriosaAI RNGD`,human_readable_name:`RNGD`,display_unit:`RNGD`,number_format:{binary:!1,round_length:0},display_icon:`furiosa`},"atom.device":{slot_name:`atom.device`,description:`Rebellions ATOM`,human_readable_name:`ATOM`,display_unit:`ATOM`,number_format:{binary:!1,round_length:0},display_icon:`rebel`},"atom-plus.device":{slot_name:`atom-plus.device`,description:`Rebellions ATOM+`,human_readable_name:`ATOM+`,display_unit:`ATOM+`,number_format:{binary:!1,round_length:0},display_icon:`rebel`},"atom-max.device":{slot_name:`atom-max.device`,description:`Rebellions ATOM Max`,human_readable_name:`ATOM Max`,display_unit:`ATOM Max`,number_format:{binary:!1,round_length:0},display_icon:`rebel`},"hyperaccel-lpu.device":{slot_name:`hyperaccel-lpu.device`,description:`Hyperaccel LPU`,human_readable_name:`LPU`,display_unit:`LPU`,number_format:{binary:!1,round_length:0},display_icon:`hyperaccel`},"tt-n300.device":{slot_name:`tt-n300.device`,description:`Tenstorrent Wormhole™ n300`,human_readable_name:`Tenstorrent Wormhole™ n300 Device`,display_unit:`n300`,number_format:{binary:!1,round_length:0},display_icon:`tenstorrent`}},u={title:`Statistic/BAIResourceNumberWithIcon`,component:i,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:"\n**BAIResourceNumberWithIcon** displays a resource value with its corresponding icon and unit.\n\n- **Automatic formatting**: Handles binary units (GiB, MiB) and decimal formats\n- **Resource icons**: Shows appropriate icons for CPU, memory, and accelerators\n- **Range display**: Supports min~max value ranges and unlimited (∞) resources\n- **Device metadata**: Uses BAIMetaDataProvider for device-specific formatting\n\n## Props\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `type` | `string` | - | Resource type (e.g., 'cpu', 'mem', 'cuda.device') |\n| `value` | `string` | - | Resource amount as string |\n| `max` | `string` | `undefined` | Optional maximum value, supports 'Infinity' |\n| `hideTooltip` | `boolean` | `false` | When true, hides the tooltip on the resource icon |\n| `opts` | `ResourceOpts` | `undefined` | Additional options like shmem for memory |\n| `extra` | `React.ReactNode` | `undefined` | Extra content to display after the number |\n        "}}},decorators:[e=>(0,c.jsx)(t,{deviceMetaData:l,imagePath:`resources/icons`,children:(0,c.jsx)(e,{})})],argTypes:{type:{control:{type:`select`},options:[`cpu`,`mem`,`cuda.device`,`cuda.shares`,`rocm.device`,`tpu.device`,`ipu.device`,`gaudi2.device`,`warboy.device`,`rngd.device`,`atom.device`,`atom-plus.device`,`atom-max.device`,`hyperaccel-lpu.device`],description:`Resource type`,table:{type:{summary:`string`}}},value:{control:{type:`text`},description:`Resource amount as string`,table:{type:{summary:`string`}}},max:{control:{type:`text`},description:`Optional maximum value, supports "Infinity"`,table:{type:{summary:`string`},defaultValue:{summary:`undefined`}}},hideTooltip:{control:{type:`boolean`},description:`When true, hides the tooltip on the resource icon`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},opts:{control:{type:`object`},description:`Additional options like shmem for memory resources`,table:{type:{summary:`ResourceOpts`},defaultValue:{summary:`undefined`}}},extra:{control:!1,description:`Extra content to display after the resource number`,table:{type:{summary:`React.ReactNode`},defaultValue:{summary:`undefined`}}}}},d={name:`Basic Usage`,args:{type:`cpu`,value:`4`}},f={parameters:{docs:{description:{story:`Shows all supported resource types with their respective icons and units.`}}},render:()=>(0,c.jsxs)(s,{direction:`column`,gap:`md`,align:`start`,children:[(0,c.jsxs)(s,{gap:`sm`,align:`center`,children:[(0,c.jsx)(`span`,{style:{width:160},children:`CPU:`}),(0,c.jsx)(i,{type:`cpu`,value:`8`})]}),(0,c.jsxs)(s,{gap:`sm`,align:`center`,children:[(0,c.jsx)(`span`,{style:{width:160},children:`Memory:`}),(0,c.jsx)(i,{type:`mem`,value:`16000000000`})]}),(0,c.jsxs)(s,{gap:`sm`,align:`center`,children:[(0,c.jsx)(`span`,{style:{width:160},children:`NVIDIA GPU:`}),(0,c.jsx)(i,{type:`cuda.device`,value:`2`})]}),(0,c.jsxs)(s,{gap:`sm`,align:`center`,children:[(0,c.jsx)(`span`,{style:{width:160},children:`NVIDIA FGPU:`}),(0,c.jsx)(i,{type:`cuda.shares`,value:`0.5`})]}),(0,c.jsxs)(s,{gap:`sm`,align:`center`,children:[(0,c.jsx)(`span`,{style:{width:160},children:`AMD GPU:`}),(0,c.jsx)(i,{type:`rocm.device`,value:`1`})]}),(0,c.jsxs)(s,{gap:`sm`,align:`center`,children:[(0,c.jsx)(`span`,{style:{width:160},children:`Google TPU:`}),(0,c.jsx)(i,{type:`tpu.device`,value:`4`})]}),(0,c.jsxs)(s,{gap:`sm`,align:`center`,children:[(0,c.jsx)(`span`,{style:{width:160},children:`Graphcore IPU:`}),(0,c.jsx)(i,{type:`ipu.device`,value:`2`})]}),(0,c.jsxs)(s,{gap:`sm`,align:`center`,children:[(0,c.jsx)(`span`,{style:{width:160},children:`Intel Gaudi2:`}),(0,c.jsx)(i,{type:`gaudi2.device`,value:`1`})]}),(0,c.jsxs)(s,{gap:`sm`,align:`center`,children:[(0,c.jsx)(`span`,{style:{width:160},children:`FuriosaAI Warboy:`}),(0,c.jsx)(i,{type:`warboy.device`,value:`2`})]}),(0,c.jsxs)(s,{gap:`sm`,align:`center`,children:[(0,c.jsx)(`span`,{style:{width:160},children:`FuriosaAI RNGD:`}),(0,c.jsx)(i,{type:`rngd.device`,value:`1`})]}),(0,c.jsxs)(s,{gap:`sm`,align:`center`,children:[(0,c.jsx)(`span`,{style:{width:160},children:`Rebellions ATOM:`}),(0,c.jsx)(i,{type:`atom.device`,value:`2`})]}),(0,c.jsxs)(s,{gap:`sm`,align:`center`,children:[(0,c.jsx)(`span`,{style:{width:160},children:`Rebellions ATOM+:`}),(0,c.jsx)(i,{type:`atom-plus.device`,value:`1`})]}),(0,c.jsxs)(s,{gap:`sm`,align:`center`,children:[(0,c.jsx)(`span`,{style:{width:160},children:`Rebellions ATOM Max:`}),(0,c.jsx)(i,{type:`atom-max.device`,value:`1`})]}),(0,c.jsxs)(s,{gap:`sm`,align:`center`,children:[(0,c.jsx)(`span`,{style:{width:160},children:`Hyperaccel LPU:`}),(0,c.jsx)(i,{type:`hyperaccel-lpu.device`,value:`4`})]}),(0,c.jsxs)(s,{gap:`sm`,align:`center`,children:[(0,c.jsx)(`span`,{style:{width:160},children:`Tenstorrent Wormhole™ n300:`}),(0,c.jsx)(i,{type:`tt-n300.device`,value:`2`})]})]})},p={parameters:{docs:{description:{story:`Demonstrates resource ranges with minimum and maximum values.`}}},render:()=>(0,c.jsxs)(s,{direction:`column`,gap:`md`,align:`start`,children:[(0,c.jsxs)(s,{gap:`sm`,align:`center`,children:[(0,c.jsx)(`span`,{style:{width:150},children:`CPU (4~8):`}),(0,c.jsx)(i,{type:`cpu`,value:`4`,max:`8`})]}),(0,c.jsxs)(s,{gap:`sm`,align:`center`,children:[(0,c.jsx)(`span`,{style:{width:150},children:`Memory (8~16 GiB):`}),(0,c.jsx)(i,{type:`mem`,value:`8000000000`,max:`16000000000`})]}),(0,c.jsxs)(s,{gap:`sm`,align:`center`,children:[(0,c.jsx)(`span`,{style:{width:150},children:`GPU (1~Unlimited):`}),(0,c.jsx)(i,{type:`cuda.device`,value:`1`,max:`Infinity`})]})]})},m={parameters:{docs:{description:{story:`Shows memory resources with shared memory (SHM) information.`}}},render:()=>(0,c.jsxs)(s,{direction:`column`,gap:`md`,align:`start`,children:[(0,c.jsxs)(s,{gap:`sm`,align:`center`,children:[(0,c.jsx)(`span`,{style:{width:180},children:`Memory with SHM:`}),(0,c.jsx)(i,{type:`mem`,value:`16000000000`,opts:{shmem:1e9}})]}),(0,c.jsxs)(s,{gap:`sm`,align:`center`,children:[(0,c.jsx)(`span`,{style:{width:180},children:`Memory without SHM:`}),(0,c.jsx)(i,{type:`mem`,value:`16000000000`})]})]})},h={parameters:{docs:{description:{story:"\nDemonstrates how the component handles devices whose `display_icon` is **not** in the built-in `knownDeviceIcons` set\n(`nvidia`, `rocm`, `tpu`, `ipu`, `gaudi`, `furiosa`, `rebel`, `tenstorrent`).\n\n**Icon resolution order for unknown devices:**\n1. `display_icon` is set but not in built-in set → loads `{imagePath}/{display_icon}.svg` from the host's icon directory\n2. SVG file missing (404) → falls back to `MicrochipIcon`\n3. `display_icon` not set at all → falls back to `MicrochipIcon`\n\n> **Note:** The \"SVG from server\" row uses `npu_generic.svg` as a stand-in example\n> since it already exists in the host's `resources/icons/` and is not part of `knownDeviceIcons`.\n> In production, any server-configured accelerator with a custom `display_icon` name follows the same path."}}},decorators:[e=>{let n={...l,"npu-generic.device":{slot_name:`npu-generic.device`,description:`Generic NPU (server-configured icon)`,human_readable_name:`NPU`,display_unit:`NPU`,number_format:{binary:!1,round_length:0},display_icon:`npu_generic`},"unknown.device":{slot_name:`unknown.device`,description:`Unknown device (missing icon file)`,human_readable_name:`Unknown`,display_unit:`Unit`,number_format:{binary:!1,round_length:0},display_icon:`nonexistent_icon`}};return(0,c.jsx)(t,{deviceMetaData:n,imagePath:`resources/icons`,children:(0,c.jsx)(e,{})})}],render:()=>(0,c.jsxs)(s,{direction:`column`,gap:`md`,align:`start`,children:[(0,c.jsxs)(s,{gap:`sm`,align:`center`,children:[(0,c.jsx)(`span`,{style:{width:240},children:`SVG from server (npu_generic.svg):`}),(0,c.jsx)(i,{type:`npu-generic.device`,value:`2`})]}),(0,c.jsxs)(s,{gap:`sm`,align:`center`,children:[(0,c.jsx)(`span`,{style:{width:240},children:`Fallback (missing SVG file):`}),(0,c.jsx)(i,{type:`unknown.device`,value:`1`})]})]})},g={parameters:{docs:{description:{story:`Compares resource display with and without icon tooltips.`}}},render:()=>(0,c.jsxs)(s,{direction:`column`,gap:`md`,align:`start`,children:[(0,c.jsxs)(s,{gap:`sm`,align:`center`,children:[(0,c.jsx)(`span`,{style:{width:150},children:`With tooltip:`}),(0,c.jsx)(i,{type:`cpu`,value:`8`,hideTooltip:!1})]}),(0,c.jsxs)(s,{gap:`sm`,align:`center`,children:[(0,c.jsx)(`span`,{style:{width:150},children:`Without tooltip:`}),(0,c.jsx)(i,{type:`cpu`,value:`8`,hideTooltip:!0})]})]})},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  name: 'Basic Usage',
  args: {
    type: 'cpu',
    value: '4'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
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
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source}}},_=[`Default`,`ResourceTypes`,`WithMaxValue`,`WithSharedMemory`,`ServerConfiguredIcon`,`WithoutTooltip`]})))()}v();export{d as Default,f as ResourceTypes,h as ServerConfiguredIcon,p as WithMaxValue,m as WithSharedMemory,g as WithoutTooltip,_ as __namedExportsOrder,u as default};