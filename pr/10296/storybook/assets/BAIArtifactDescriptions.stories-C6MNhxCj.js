import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-MKhVqBIO.js";import{n,t as r}from"./BAIFlex-DnaoYTJ1.js";import{t as i}from"./react-relay-sHama7hJ.js";import{n as a,r as o}from"./dist-VyLUzrdQ.js";import{n as s,t as c}from"./BAIArtifactDescriptions-CxrBh0Km.js";import{n as l,t as u}from"./RelayResolver-BnFyFQJn.js";var d;function f(){return(f=e((()=>{d=(function(){var e=[{kind:`Literal`,name:`id`,value:`test-id`}],t={alias:null,args:null,kind:`ScalarField`,name:`name`,storageKey:null};return{fragment:{argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAIArtifactDescriptionsStoriesQuery`,selections:[{alias:null,args:e,concreteType:`Artifact`,kind:`LinkedField`,name:`artifact`,plural:!1,selections:[{args:null,kind:`FragmentSpread`,name:`BAIArtifactDescriptionsFragment`}],storageKey:`artifact(id:"test-id")`}],type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[],kind:`Operation`,name:`BAIArtifactDescriptionsStoriesQuery`,selections:[{alias:null,args:e,concreteType:`Artifact`,kind:`LinkedField`,name:`artifact`,plural:!1,selections:[t,{alias:null,args:null,kind:`ScalarField`,name:`description`,storageKey:null},{alias:null,args:null,concreteType:`SourceInfo`,kind:`LinkedField`,name:`source`,plural:!1,selections:[t,{alias:null,args:null,kind:`ScalarField`,name:`url`,storageKey:null}],storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`type`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null}],storageKey:`artifact(id:"test-id")`}]},params:{cacheID:`bd8126378fa1d702c7ecfd87b197266a`,id:null,metadata:{},name:`BAIArtifactDescriptionsStoriesQuery`,operationKind:`query`,text:`query BAIArtifactDescriptionsStoriesQuery {
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
`}}})(),d.hash=`6b6b5ac1a2c5107d8b308390b2740539`})))()}var p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N;function P(){return(P=e((()=>{f(),l(),n(),s(),p=i(),a(),m=t(),D={title:`Fragments/BAIArtifactDescriptions`,component:c,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:`
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
        `}}},argTypes:{artifactFrgmt:{control:!1,description:`Relay fragment reference for artifact`}},decorators:[e=>(0,m.jsx)(o,{children:(0,m.jsx)(e,{})})]},O=()=>{let{artifact:e}=(0,p.useLazyLoadQuery)(d,{});return e&&(0,m.jsx)(c,{artifactFrgmt:e})},k={name:`Basic`,parameters:{docs:{description:{story:`Displays an artifact with complete information including name, type, source, and description.`}}},render:()=>(0,m.jsx)(u,{mockResolvers:{Artifact:()=>({name:`ResNet-50 Image Classification Model`,type:`MODEL`,description:`Deep residual learning model for image classification with 50 layers. Pre-trained on ImageNet dataset.`,source:{name:`Hugging Face`,url:`https://huggingface.co/models`}})},children:(0,m.jsx)(O,{})})},A={parameters:{docs:{description:{story:`Displays "N/A" when artifact has no description.`}}},render:()=>(0,m.jsx)(u,{mockResolvers:{Artifact:()=>({name:`TensorFlow Runtime Package`,type:`PACKAGE`,description:null,source:{name:`GitHub`,url:`https://github.com/tensorflow/tensorflow`}})},children:(0,m.jsx)(O,{})})},j={parameters:{docs:{description:{story:`Displays an artifact with a lengthy description text.`}}},render:()=>(0,m.jsx)(u,{mockResolvers:{Artifact:()=>({name:`CUDA Container Image`,type:`IMAGE`,description:`NVIDIA CUDA is a parallel computing platform and programming model developed by NVIDIA for general computing on graphical processing units (GPUs). With CUDA, developers can dramatically speed up computing applications by harnessing the power of GPUs. This container image includes the complete CUDA toolkit, cuDNN libraries, and NCCL for multi-GPU communication. It is optimized for deep learning frameworks and high-performance computing applications.`,source:{name:`NVIDIA NGC`,url:`https://catalog.ngc.nvidia.com/`}})},children:(0,m.jsx)(O,{})})},M={parameters:{docs:{description:{story:`Displays artifacts of different types (MODEL, PACKAGE, IMAGE) to show the variety of artifact information displays.`}}},render:()=>(0,m.jsx)(r,{direction:`column`,gap:`lg`,children:[{name:`BERT Base Model`,type:`MODEL`,description:`Pre-trained BERT model for natural language understanding.`,source:{name:`Hugging Face`,url:`https://huggingface.co/`}},{name:`PyTorch Package`,type:`PACKAGE`,description:`Machine learning framework for Python.`,source:{name:`PyPI`,url:`https://pypi.org/project/torch/`}},{name:`Ubuntu 22.04 Base Image`,type:`IMAGE`,description:`Official Ubuntu 22.04 LTS container image.`,source:{name:`Docker Hub`,url:`https://hub.docker.com/`}}].map((e,t)=>(0,m.jsx)(u,{mockResolvers:{Artifact:()=>e},children:(0,m.jsx)(O,{})},t))})},k.parameters={...k.parameters,docs:{...(h=k.parameters)==null?void 0:h.docs,source:{originalSource:`{
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
}`,...(g=k.parameters)==null||(g=g.docs)==null?void 0:g.source},description:{story:`Default story showing artifact with complete information.`,...(_=k.parameters)==null||(_=_.docs)==null?void 0:_.description}}},A.parameters={...A.parameters,docs:{...(v=A.parameters)==null?void 0:v.docs,source:{originalSource:`{
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
}`,...(y=A.parameters)==null||(y=y.docs)==null?void 0:y.source},description:{story:`Story showing artifact without description.`,...(b=A.parameters)==null||(b=b.docs)==null?void 0:b.description}}},j.parameters={...j.parameters,docs:{...(x=j.parameters)==null?void 0:x.docs,source:{originalSource:`{
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
}`,...(S=j.parameters)==null||(S=S.docs)==null?void 0:S.source},description:{story:`Story showing artifact with long description.`,...(C=j.parameters)==null||(C=C.docs)==null?void 0:C.description}}},M.parameters={...M.parameters,docs:{...(w=M.parameters)==null?void 0:w.docs,source:{originalSource:`{
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
}`,...(T=M.parameters)==null||(T=T.docs)==null?void 0:T.source},description:{story:`Story showing multiple artifacts with different types.`,...(E=M.parameters)==null||(E=E.docs)==null?void 0:E.description}}},N=[`Default`,`WithoutDescription`,`LongDescription`,`DifferentTypes`]})))()}P();export{k as Default,M as DifferentTypes,j as LongDescription,A as WithoutDescription,N as __namedExportsOrder,D as default};