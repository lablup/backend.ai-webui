import{j as e}from"./iframe-COjLyI6L.js";import{R as s}from"./RelayResolver-vdjiL9v7.js";import{B as T}from"./BAIFlex-CaLZ3rzg.js";import{B as x}from"./BAIArtifactDescriptions-CzB2w-io.js";import{r as G}from"./index-DymdQhyO.js";import{M as N}from"./index-CKWztUG2.js";import"./preload-helper-Dp1pzeXC.js";import"./index-BRFT-5AI.js";import"./BAILink-QzEngcZa.js";import"./BAIMetadataList-gcfK1uLY.js";import"./BAIArtifactTypeTag-BUGldaBm.js";import"./Badge-DbGPGGGB.js";const E=(function(){var t=[{kind:"Literal",name:"id",value:"test-id"}],o={alias:null,args:null,kind:"ScalarField",name:"name",storageKey:null};return{fragment:{argumentDefinitions:[],kind:"Fragment",metadata:null,name:"BAIArtifactDescriptionsStoriesQuery",selections:[{alias:null,args:t,concreteType:"Artifact",kind:"LinkedField",name:"artifact",plural:!1,selections:[{args:null,kind:"FragmentSpread",name:"BAIArtifactDescriptionsFragment"}],storageKey:'artifact(id:"test-id")'}],type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[],kind:"Operation",name:"BAIArtifactDescriptionsStoriesQuery",selections:[{alias:null,args:t,concreteType:"Artifact",kind:"LinkedField",name:"artifact",plural:!1,selections:[o,{alias:null,args:null,kind:"ScalarField",name:"description",storageKey:null},{alias:null,args:null,concreteType:"SourceInfo",kind:"LinkedField",name:"source",plural:!1,selections:[o,{alias:null,args:null,kind:"ScalarField",name:"url",storageKey:null}],storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"type",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null}],storageKey:'artifact(id:"test-id")'}]},params:{cacheID:"227d7d6583def5b3e67a21e59862ef97",id:null,metadata:{},name:"BAIArtifactDescriptionsStoriesQuery",operationKind:"query",text:`query BAIArtifactDescriptionsStoriesQuery {
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
  ...BAIArtifactTypeTagFragment
}

fragment BAIArtifactTypeTagFragment on Artifact {
  type
}
`}}})();E.hash="6b6b5ac1a2c5107d8b308390b2740539";const z={title:"Fragments/BAIArtifactDescriptions",component:x,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:`
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
        `}}},argTypes:{artifactFrgmt:{control:!1,description:"Relay fragment reference for artifact"}},decorators:[t=>e.jsx(N,{children:e.jsx(t,{})})]},c=()=>{const{artifact:t}=G.useLazyLoadQuery(E,{});return t&&e.jsx(x,{artifactFrgmt:t})},r={name:"Basic",parameters:{docs:{description:{story:"Displays an artifact with complete information including name, type, source, and description."}}},render:()=>e.jsx(s,{mockResolvers:{Artifact:()=>({name:"ResNet-50 Image Classification Model",type:"MODEL",description:"Deep residual learning model for image classification with 50 layers. Pre-trained on ImageNet dataset.",source:{name:"Hugging Face",url:"https://huggingface.co/models"}})},children:e.jsx(c,{})})},a={parameters:{docs:{description:{story:'Displays "N/A" when artifact has no description.'}}},render:()=>e.jsx(s,{mockResolvers:{Artifact:()=>({name:"TensorFlow Runtime Package",type:"PACKAGE",description:null,source:{name:"GitHub",url:"https://github.com/tensorflow/tensorflow"}})},children:e.jsx(c,{})})},i={parameters:{docs:{description:{story:"Displays an artifact with a lengthy description text."}}},render:()=>e.jsx(s,{mockResolvers:{Artifact:()=>({name:"CUDA Container Image",type:"IMAGE",description:"NVIDIA CUDA is a parallel computing platform and programming model developed by NVIDIA for general computing on graphical processing units (GPUs). With CUDA, developers can dramatically speed up computing applications by harnessing the power of GPUs. This container image includes the complete CUDA toolkit, cuDNN libraries, and NCCL for multi-GPU communication. It is optimized for deep learning frameworks and high-performance computing applications.",source:{name:"NVIDIA NGC",url:"https://catalog.ngc.nvidia.com/"}})},children:e.jsx(c,{})})},n={parameters:{docs:{description:{story:"Displays artifacts of different types (MODEL, PACKAGE, IMAGE) to show the variety of artifact information displays."}}},render:()=>{const t=[{name:"BERT Base Model",type:"MODEL",description:"Pre-trained BERT model for natural language understanding.",source:{name:"Hugging Face",url:"https://huggingface.co/"}},{name:"PyTorch Package",type:"PACKAGE",description:"Machine learning framework for Python.",source:{name:"PyPI",url:"https://pypi.org/project/torch/"}},{name:"Ubuntu 22.04 Base Image",type:"IMAGE",description:"Official Ubuntu 22.04 LTS container image.",source:{name:"Docker Hub",url:"https://hub.docker.com/"}}];return e.jsx(T,{direction:"column",gap:"lg",children:t.map((o,C)=>e.jsx(s,{mockResolvers:{Artifact:()=>o},children:e.jsx(c,{})},C))})}};var l,p,m,d,u;r.parameters={...r.parameters,docs:{...(l=r.parameters)==null?void 0:l.docs,source:{originalSource:`{
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
}`,...(m=(p=r.parameters)==null?void 0:p.docs)==null?void 0:m.source},description:{story:"Default story showing artifact with complete information.",...(u=(d=r.parameters)==null?void 0:d.docs)==null?void 0:u.description}}};var f,g,y,h,A;a.parameters={...a.parameters,docs:{...(f=a.parameters)==null?void 0:f.docs,source:{originalSource:`{
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
}`,...(y=(g=a.parameters)==null?void 0:g.docs)==null?void 0:y.source},description:{story:"Story showing artifact without description.",...(A=(h=a.parameters)==null?void 0:h.docs)==null?void 0:A.description}}};var D,I,R,k,v;i.parameters={...i.parameters,docs:{...(D=i.parameters)==null?void 0:D.docs,source:{originalSource:`{
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
}`,...(R=(I=i.parameters)==null?void 0:I.docs)==null?void 0:R.source},description:{story:"Story showing artifact with long description.",...(v=(k=i.parameters)==null?void 0:k.docs)==null?void 0:v.description}}};var w,F,B,P,b;n.parameters={...n.parameters,docs:{...(w=n.parameters)==null?void 0:w.docs,source:{originalSource:`{
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
}`,...(B=(F=n.parameters)==null?void 0:F.docs)==null?void 0:B.source},description:{story:"Story showing multiple artifacts with different types.",...(b=(P=n.parameters)==null?void 0:P.docs)==null?void 0:b.description}}};const _=["Default","WithoutDescription","LongDescription","DifferentTypes"];export{r as Default,n as DifferentTypes,i as LongDescription,a as WithoutDescription,_ as __namedExportsOrder,z as default};
