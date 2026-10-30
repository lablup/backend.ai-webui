import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-MKhVqBIO.js";import{n,t as r}from"./BAIArtifactTypeToken-D7g3fJuB.js";import{n as i,t as a}from"./BAIFlex-DnaoYTJ1.js";import{t as o}from"./react-relay-sHama7hJ.js";import{n as s,t as c}from"./RelayResolver-BnFyFQJn.js";var l;function u(){return(u=e((()=>{l=(function(){var e=[{kind:`Literal`,name:`id`,value:`test-id`}];return{fragment:{argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAIArtifactTypeTokenStoriesQuery`,selections:[{alias:null,args:e,concreteType:`Artifact`,kind:`LinkedField`,name:`artifact`,plural:!1,selections:[{args:null,kind:`FragmentSpread`,name:`BAIArtifactTypeTokenFragment`}],storageKey:`artifact(id:"test-id")`}],type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[],kind:`Operation`,name:`BAIArtifactTypeTokenStoriesQuery`,selections:[{alias:null,args:e,concreteType:`Artifact`,kind:`LinkedField`,name:`artifact`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`type`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null}],storageKey:`artifact(id:"test-id")`}]},params:{cacheID:`cd3962224f3d57d1be6fbf4b9554b456`,id:null,metadata:{},name:`BAIArtifactTypeTokenStoriesQuery`,operationKind:`query`,text:`query BAIArtifactTypeTokenStoriesQuery {
  artifact(id: "test-id") {
    ...BAIArtifactTypeTokenFragment
    id
  }
}

fragment BAIArtifactTypeTokenFragment on Artifact {
  type
}
`}}})(),l.hash=`2af805b826ef9c70e09b815fac9f22ba`})))()}var d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j;function M(){return(M=e((()=>{u(),s(),i(),n(),d=o(),f=t(),T={title:`Fragments/BAIArtifactTypeToken`,component:r,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`
**BAIArtifactTypeToken** displays the type of an artifact with a visual icon.

## Features
- Displays artifact type as a Token with icon
- Three types: MODEL (Brain icon), PACKAGE (Package icon), IMAGE (Container icon)
- Color-coded icons: MODEL (blue), PACKAGE (green), IMAGE (orange)
- Uses Relay fragment for data fetching

## Usage
\`\`\`tsx
<BAIArtifactTypeToken artifactTypeFrgmt={artifact} />
\`\`\`

## Props
| Name | Type | Description |
|------|------|-------------|
| \`artifactTypeFrgmt\` | \`BAIArtifactTypeTokenFragment$key\` | Relay fragment reference for artifact |
        `}}}},E=()=>{let{artifact:e}=(0,d.useLazyLoadQuery)(l,{});return e&&(0,f.jsx)(r,{artifactTypeFrgmt:e})},D={name:`Model`,parameters:{docs:{description:{story:`Displays an artifact with MODEL type (Brain icon, blue color).`}}},render:()=>(0,f.jsx)(c,{mockResolvers:{Artifact:()=>({type:`MODEL`})},children:(0,f.jsx)(E,{})})},O={parameters:{docs:{description:{story:`Displays an artifact with PACKAGE type (Package icon, green color).`}}},render:()=>(0,f.jsx)(c,{mockResolvers:{Artifact:()=>({type:`PACKAGE`})},children:(0,f.jsx)(E,{})})},k={parameters:{docs:{description:{story:`Displays an artifact with IMAGE type (Container icon, orange color).`}}},render:()=>(0,f.jsx)(c,{mockResolvers:{Artifact:()=>({type:`IMAGE`})},children:(0,f.jsx)(E,{})})},A={parameters:{docs:{description:{story:`Displays all available artifact type variants with their respective icons and colors.`}}},render:()=>(0,f.jsx)(a,{direction:`column`,gap:`md`,children:[`MODEL`,`PACKAGE`,`IMAGE`].map(e=>(0,f.jsx)(c,{mockResolvers:{Artifact:()=>({type:e})},children:(0,f.jsx)(E,{})},e))})},D.parameters={...D.parameters,docs:{...(p=D.parameters)==null?void 0:p.docs,source:{originalSource:`{
  name: 'Model',
  parameters: {
    docs: {
      description: {
        story: 'Displays an artifact with MODEL type (Brain icon, blue color).'
      }
    }
  },
  render: () => {
    return <RelayResolver mockResolvers={{
      Artifact: () => ({
        type: 'MODEL'
      })
    }}>
        <QueryResolver />
      </RelayResolver>;
  }
}`,...(m=D.parameters)==null||(m=m.docs)==null?void 0:m.source},description:{story:`Default story showing MODEL type.`,...(h=D.parameters)==null||(h=h.docs)==null?void 0:h.description}}},O.parameters={...O.parameters,docs:{...(g=O.parameters)==null?void 0:g.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Displays an artifact with PACKAGE type (Package icon, green color).'
      }
    }
  },
  render: () => {
    return <RelayResolver mockResolvers={{
      Artifact: () => ({
        type: 'PACKAGE'
      })
    }}>
        <QueryResolver />
      </RelayResolver>;
  }
}`,...(_=O.parameters)==null||(_=_.docs)==null?void 0:_.source},description:{story:`Story showing PACKAGE type.`,...(v=O.parameters)==null||(v=v.docs)==null?void 0:v.description}}},k.parameters={...k.parameters,docs:{...(y=k.parameters)==null?void 0:y.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Displays an artifact with IMAGE type (Container icon, orange color).'
      }
    }
  },
  render: () => {
    return <RelayResolver mockResolvers={{
      Artifact: () => ({
        type: 'IMAGE'
      })
    }}>
        <QueryResolver />
      </RelayResolver>;
  }
}`,...(b=k.parameters)==null||(b=b.docs)==null?void 0:b.source},description:{story:`Story showing IMAGE type.`,...(x=k.parameters)==null||(x=x.docs)==null?void 0:x.description}}},A.parameters={...A.parameters,docs:{...(S=A.parameters)==null?void 0:S.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Displays all available artifact type variants with their respective icons and colors.'
      }
    }
  },
  render: () => {
    const types = ['MODEL', 'PACKAGE', 'IMAGE'] as const;
    return <BAIFlex direction="column" gap="md">
        {types.map(type => <RelayResolver key={type} mockResolvers={{
        Artifact: () => ({
          type
        })
      }}>
            <QueryResolver />
          </RelayResolver>)}
      </BAIFlex>;
  }
}`,...(C=A.parameters)==null||(C=C.docs)==null?void 0:C.source},description:{story:`Story showing all type variants together.`,...(w=A.parameters)==null||(w=w.docs)==null?void 0:w.description}}},j=[`Default`,`Package`,`Image`,`AllTypes`]})))()}M();export{A as AllTypes,D as Default,k as Image,O as Package,j as __namedExportsOrder,T as default};