import{n as e}from"./rolldown-runtime-2s6bX4vc.js";import{n as t,t as n}from"./BAIArtifactTypeToken-12zlAIFn.js";import{n as r,t as i}from"./BAIFlex-CAz1t6J5.js";import{n as a,t as o}from"./RelayResolver-b1nJU57O.js";import{jsx as s}from"react/jsx-runtime";import{useLazyLoadQuery as c}from"react-relay";var l;function u(){return(u=e((()=>{l=(function(){var e=[{kind:`Literal`,name:`id`,value:`test-id`}];return{fragment:{argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAIArtifactTypeTokenStoriesQuery`,selections:[{alias:null,args:e,concreteType:`Artifact`,kind:`LinkedField`,name:`artifact`,plural:!1,selections:[{args:null,kind:`FragmentSpread`,name:`BAIArtifactTypeTokenFragment`}],storageKey:`artifact(id:"test-id")`}],type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[],kind:`Operation`,name:`BAIArtifactTypeTokenStoriesQuery`,selections:[{alias:null,args:e,concreteType:`Artifact`,kind:`LinkedField`,name:`artifact`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`type`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null}],storageKey:`artifact(id:"test-id")`}]},params:{cacheID:`cd3962224f3d57d1be6fbf4b9554b456`,id:null,metadata:{},name:`BAIArtifactTypeTokenStoriesQuery`,operationKind:`query`,text:`query BAIArtifactTypeTokenStoriesQuery {
  artifact(id: "test-id") {
    ...BAIArtifactTypeTokenFragment
    id
  }
}

fragment BAIArtifactTypeTokenFragment on Artifact {
  type
}
`}}})(),l.hash=`2af805b826ef9c70e09b815fac9f22ba`})))()}var d,f,p,m,h,g,_;function v(){return(v=e((()=>{u(),a(),r(),t(),d={title:`Fragments/BAIArtifactTypeToken`,component:n,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`
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
        `}}}},f=()=>{let{artifact:e}=c(l,{});return e&&s(n,{artifactTypeFrgmt:e})},p={name:`Model`,parameters:{docs:{description:{story:`Displays an artifact with MODEL type (Brain icon, blue color).`}}},render:()=>s(o,{mockResolvers:{Artifact:()=>({type:`MODEL`})},children:s(f,{})})},m={parameters:{docs:{description:{story:`Displays an artifact with PACKAGE type (Package icon, green color).`}}},render:()=>s(o,{mockResolvers:{Artifact:()=>({type:`PACKAGE`})},children:s(f,{})})},h={parameters:{docs:{description:{story:`Displays an artifact with IMAGE type (Container icon, orange color).`}}},render:()=>s(o,{mockResolvers:{Artifact:()=>({type:`IMAGE`})},children:s(f,{})})},g={parameters:{docs:{description:{story:`Displays all available artifact type variants with their respective icons and colors.`}}},render:()=>s(i,{direction:`column`,gap:`md`,children:[`MODEL`,`PACKAGE`,`IMAGE`].map(e=>s(o,{mockResolvers:{Artifact:()=>({type:e})},children:s(f,{})},e))})},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
}`,...p.parameters?.docs?.source},description:{story:`Default story showing MODEL type.`,...p.parameters?.docs?.description}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source},description:{story:`Story showing PACKAGE type.`,...m.parameters?.docs?.description}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source},description:{story:`Story showing IMAGE type.`,...h.parameters?.docs?.description}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source},description:{story:`Story showing all type variants together.`,...g.parameters?.docs?.description}}},_=[`Default`,`Package`,`Image`,`AllTypes`]})))()}v();export{g as AllTypes,p as Default,h as Image,m as Package,_ as __namedExportsOrder,d as default};