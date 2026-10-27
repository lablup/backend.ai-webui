import{n as e}from"./rolldown-runtime-2s6bX4vc.js";import{n as t,t as n}from"./BAIFlex-CAz1t6J5.js";import{n as r,t as i}from"./BAIArtifactDescriptions-BtI-sKL1.js";import{n as a,t as o}from"./RelayResolver-b1nJU57O.js";import{jsx as s}from"react/jsx-runtime";import{useLazyLoadQuery as c}from"react-relay";import{MemoryRouter as l}from"react-router-dom";var u;function d(){return(d=e((()=>{u=(function(){var e=[{kind:`Literal`,name:`id`,value:`test-id`}],t={alias:null,args:null,kind:`ScalarField`,name:`name`,storageKey:null};return{fragment:{argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAIArtifactDescriptionsStoriesQuery`,selections:[{alias:null,args:e,concreteType:`Artifact`,kind:`LinkedField`,name:`artifact`,plural:!1,selections:[{args:null,kind:`FragmentSpread`,name:`BAIArtifactDescriptionsFragment`}],storageKey:`artifact(id:"test-id")`}],type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[],kind:`Operation`,name:`BAIArtifactDescriptionsStoriesQuery`,selections:[{alias:null,args:e,concreteType:`Artifact`,kind:`LinkedField`,name:`artifact`,plural:!1,selections:[t,{alias:null,args:null,kind:`ScalarField`,name:`description`,storageKey:null},{alias:null,args:null,concreteType:`SourceInfo`,kind:`LinkedField`,name:`source`,plural:!1,selections:[t,{alias:null,args:null,kind:`ScalarField`,name:`url`,storageKey:null}],storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`type`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null}],storageKey:`artifact(id:"test-id")`}]},params:{cacheID:`bd8126378fa1d702c7ecfd87b197266a`,id:null,metadata:{},name:`BAIArtifactDescriptionsStoriesQuery`,operationKind:`query`,text:`query BAIArtifactDescriptionsStoriesQuery {
  artifact(id: "test-id") {
    ...BAIArtifactDescriptionsFragment
    id
  }
}

fragment BAIArtifactDescriptionsFragment on Artifact {
  name
  description
  source {
    name
    url
  }
  ...BAIArtifactTypeTokenFragment
}

fragment BAIArtifactTypeTokenFragment on Artifact {
  type
}
`}}})(),u.hash=`6b6b5ac1a2c5107d8b308390b2740539`})))()}var f,p,m,h,g,_,v;function y(){return(y=e((()=>{d(),a(),t(),r(),f={title:`Fragments/BAIArtifactDescriptions`,component:i,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:`
**BAIArtifactDescriptions** displays detailed information about an artifact in a descriptions layout.

## Features
- Displays artifact name, type, source, and description
- Artifact type shown with colored icon tag
- Source displayed as clickable external link
- Shows "N/A" for empty descriptions
- 2-column bordered layout

## Usage
\`\`\`tsx
<BAIArtifactDescriptions artifactFrgmt={artifact} />
\`\`\`

## Props
| Name | Type | Description |
|------|------|-------------|
| \`artifactFrgmt\` | \`BAIArtifactDescriptionsFragment$key\` | Relay fragment reference for artifact |
        `}}},argTypes:{artifactFrgmt:{control:!1,description:`Relay fragment reference for artifact`}},decorators:[e=>s(l,{children:s(e,{})})]},p=()=>{let{artifact:e}=c(u,{});return e&&s(i,{artifactFrgmt:e})},m={name:`Basic`,parameters:{docs:{description:{story:`Displays an artifact with complete information including name, type, source, and description.`}}},render:()=>s(o,{mockResolvers:{Artifact:()=>({name:`ResNet-50 Image Classification Model`,type:`MODEL`,description:`Deep residual learning model for image classification with 50 layers. Pre-trained on ImageNet dataset.`,source:{name:`Hugging Face`,url:`https://huggingface.co/models`}})},children:s(p,{})})},h={parameters:{docs:{description:{story:`Displays "N/A" when artifact has no description.`}}},render:()=>s(o,{mockResolvers:{Artifact:()=>({name:`TensorFlow Runtime Package`,type:`PACKAGE`,description:null,source:{name:`GitHub`,url:`https://github.com/tensorflow/tensorflow`}})},children:s(p,{})})},g={parameters:{docs:{description:{story:`Displays an artifact with a lengthy description text.`}}},render:()=>s(o,{mockResolvers:{Artifact:()=>({name:`CUDA Container Image`,type:`IMAGE`,description:`NVIDIA CUDA is a parallel computing platform and programming model developed by NVIDIA for general computing on graphical processing units (GPUs). With CUDA, developers can dramatically speed up computing applications by harnessing the power of GPUs. This container image includes the complete CUDA toolkit, cuDNN libraries, and NCCL for multi-GPU communication. It is optimized for deep learning frameworks and high-performance computing applications.`,source:{name:`NVIDIA NGC`,url:`https://catalog.ngc.nvidia.com/`}})},children:s(p,{})})},_={parameters:{docs:{description:{story:`Displays artifacts of different types (MODEL, PACKAGE, IMAGE) to show the variety of artifact information displays.`}}},render:()=>s(n,{direction:`column`,gap:`lg`,children:[{name:`BERT Base Model`,type:`MODEL`,description:`Pre-trained BERT model for natural language understanding.`,source:{name:`Hugging Face`,url:`https://huggingface.co/`}},{name:`PyTorch Package`,type:`PACKAGE`,description:`Machine learning framework for Python.`,source:{name:`PyPI`,url:`https://pypi.org/project/torch/`}},{name:`Ubuntu 22.04 Base Image`,type:`IMAGE`,description:`Official Ubuntu 22.04 LTS container image.`,source:{name:`Docker Hub`,url:`https://hub.docker.com/`}}].map((e,t)=>s(o,{mockResolvers:{Artifact:()=>e},children:s(p,{})},t))})},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'Displays an artifact with complete information including name, type, source, and description.'
      }
    }
  },
  render: () => <RelayResolver mockResolvers={{
    Artifact: () => ({
      name: 'ResNet-50 Image Classification Model',
      type: 'MODEL',
      description: 'Deep residual learning model for image classification with 50 layers. Pre-trained on ImageNet dataset.',
      source: {
        name: 'Hugging Face',
        url: 'https://huggingface.co/models'
      }
    })
  }}>
      <QueryResolver />
    </RelayResolver>
}`,...m.parameters?.docs?.source},description:{story:`Default story showing artifact with complete information.`,...m.parameters?.docs?.description}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Displays "N/A" when artifact has no description.'
      }
    }
  },
  render: () => <RelayResolver mockResolvers={{
    Artifact: () => ({
      name: 'TensorFlow Runtime Package',
      type: 'PACKAGE',
      description: null,
      source: {
        name: 'GitHub',
        url: 'https://github.com/tensorflow/tensorflow'
      }
    })
  }}>
      <QueryResolver />
    </RelayResolver>
}`,...h.parameters?.docs?.source},description:{story:`Story showing artifact without description.`,...h.parameters?.docs?.description}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Displays an artifact with a lengthy description text.'
      }
    }
  },
  render: () => <RelayResolver mockResolvers={{
    Artifact: () => ({
      name: 'CUDA Container Image',
      type: 'IMAGE',
      description: 'NVIDIA CUDA is a parallel computing platform and programming model developed by NVIDIA for general computing on graphical processing units (GPUs). With CUDA, developers can dramatically speed up computing applications by harnessing the power of GPUs. This container image includes the complete CUDA toolkit, cuDNN libraries, and NCCL for multi-GPU communication. It is optimized for deep learning frameworks and high-performance computing applications.',
      source: {
        name: 'NVIDIA NGC',
        url: 'https://catalog.ngc.nvidia.com/'
      }
    })
  }}>
      <QueryResolver />
    </RelayResolver>
}`,...g.parameters?.docs?.source},description:{story:`Story showing artifact with long description.`,...g.parameters?.docs?.description}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Displays artifacts of different types (MODEL, PACKAGE, IMAGE) to show the variety of artifact information displays.'
      }
    }
  },
  render: () => {
    const artifacts = [{
      name: 'BERT Base Model',
      type: 'MODEL',
      description: 'Pre-trained BERT model for natural language understanding.',
      source: {
        name: 'Hugging Face',
        url: 'https://huggingface.co/'
      }
    }, {
      name: 'PyTorch Package',
      type: 'PACKAGE',
      description: 'Machine learning framework for Python.',
      source: {
        name: 'PyPI',
        url: 'https://pypi.org/project/torch/'
      }
    }, {
      name: 'Ubuntu 22.04 Base Image',
      type: 'IMAGE',
      description: 'Official Ubuntu 22.04 LTS container image.',
      source: {
        name: 'Docker Hub',
        url: 'https://hub.docker.com/'
      }
    }];
    return <BAIFlex direction="column" gap="lg">
        {artifacts.map((artifactData, index) => <RelayResolver key={index} mockResolvers={{
        Artifact: () => artifactData
      }}>
            <QueryResolver />
          </RelayResolver>)}
      </BAIFlex>;
  }
}`,..._.parameters?.docs?.source},description:{story:`Story showing multiple artifacts with different types.`,..._.parameters?.docs?.description}}},v=[`Default`,`WithoutDescription`,`LongDescription`,`DifferentTypes`]})))()}y();export{m as Default,_ as DifferentTypes,g as LongDescription,h as WithoutDescription,v as __namedExportsOrder,f as default};