import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-MKhVqBIO.js";import{n,t as r}from"./BAIArtifactTypeToken-CEXJULYK.js";import{n as i,t as a}from"./BAIFlex-BOFoS5KY.js";import{t as o}from"./react-relay-sBALIJlt.js";import{n as s,t as c}from"./RelayResolver-CMrgwoPg.js";var l;function u(){return(u=e((()=>{l=(function(){var e=[{kind:`Literal`,name:`id`,value:`test-id`}];return{fragment:{argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAIArtifactTypeTokenStoriesQuery`,selections:[{alias:null,args:e,concreteType:`Artifact`,kind:`LinkedField`,name:`artifact`,plural:!1,selections:[{args:null,kind:`FragmentSpread`,name:`BAIArtifactTypeTokenFragment`}],storageKey:`artifact(id:"test-id")`}],type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[],kind:`Operation`,name:`BAIArtifactTypeTokenStoriesQuery`,selections:[{alias:null,args:e,concreteType:`Artifact`,kind:`LinkedField`,name:`artifact`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`type`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null}],storageKey:`artifact(id:"test-id")`}]},params:{cacheID:`cd3962224f3d57d1be6fbf4b9554b456`,id:null,metadata:{},name:`BAIArtifactTypeTokenStoriesQuery`,operationKind:`query`,text:`query BAIArtifactTypeTokenStoriesQuery {
  artifact(id: "test-id") {
    ...BAIArtifactTypeTokenFragment
    id
  }
}

fragment BAIArtifactTypeTokenFragment on Artifact {
  type
}
`}}})(),l.hash=`2af805b826ef9c70e09b815fac9f22ba`})))()}var d,f,p,m,h,g,_,v,y;function b(){return(b=e((()=>{u(),s(),i(),n(),d=o(),f=t(),p={title:`Fragments/BAIArtifactTypeToken`,component:r,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`
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
        `}}}},m=()=>{let{artifact:e}=(0,d.useLazyLoadQuery)(l,{});return e&&(0,f.jsx)(r,{artifactTypeFrgmt:e})},h={name:`Model`,parameters:{docs:{description:{story:`Displays an artifact with MODEL type (Brain icon, blue color).`}}},render:()=>(0,f.jsx)(c,{mockResolvers:{Artifact:()=>({type:`MODEL`})},children:(0,f.jsx)(m,{})})},g={parameters:{docs:{description:{story:`Displays an artifact with PACKAGE type (Package icon, green color).`}}},render:()=>(0,f.jsx)(c,{mockResolvers:{Artifact:()=>({type:`PACKAGE`})},children:(0,f.jsx)(m,{})})},_={parameters:{docs:{description:{story:`Displays an artifact with IMAGE type (Container icon, orange color).`}}},render:()=>(0,f.jsx)(c,{mockResolvers:{Artifact:()=>({type:`IMAGE`})},children:(0,f.jsx)(m,{})})},v={parameters:{docs:{description:{story:`Displays all available artifact type variants with their respective icons and colors.`}}},render:()=>(0,f.jsx)(a,{direction:`column`,gap:`md`,children:[`MODEL`,`PACKAGE`,`IMAGE`].map(e=>(0,f.jsx)(c,{mockResolvers:{Artifact:()=>({type:e})},children:(0,f.jsx)(m,{})},e))})},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source},description:{story:`Default story showing MODEL type.`,...h.parameters?.docs?.description}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source},description:{story:`Story showing PACKAGE type.`,...g.parameters?.docs?.description}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source},description:{story:`Story showing IMAGE type.`,..._.parameters?.docs?.description}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source},description:{story:`Story showing all type variants together.`,...v.parameters?.docs?.description}}},y=[`Default`,`Package`,`Image`,`AllTypes`]})))()}b();export{v as AllTypes,h as Default,_ as Image,g as Package,y as __namedExportsOrder,p as default};