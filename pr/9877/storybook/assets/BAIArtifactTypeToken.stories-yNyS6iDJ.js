import{j as e}from"./iframe-vDuWVe71.js";import{R as o}from"./RelayResolver-Coqgn3ej.js";import{B as K}from"./BAIFlex--5oV8rFh.js";import{B as F}from"./BAIArtifactTypeToken-O0X5bCZq.js";import{r as P}from"./index-DEnOFf6s.js";import"./preload-helper-Dp1pzeXC.js";import"./index-Bu24HlpO.js";import"./Token-BqvzZll7.js";import"./composeEventHandlers-BolWE7qY.js";const G=(function(){var r=[{kind:"Literal",name:"id",value:"test-id"}];return{fragment:{argumentDefinitions:[],kind:"Fragment",metadata:null,name:"BAIArtifactTypeTokenStoriesQuery",selections:[{alias:null,args:r,concreteType:"Artifact",kind:"LinkedField",name:"artifact",plural:!1,selections:[{args:null,kind:"FragmentSpread",name:"BAIArtifactTypeTokenFragment"}],storageKey:'artifact(id:"test-id")'}],type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[],kind:"Operation",name:"BAIArtifactTypeTokenStoriesQuery",selections:[{alias:null,args:r,concreteType:"Artifact",kind:"LinkedField",name:"artifact",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"type",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null}],storageKey:'artifact(id:"test-id")'}]},params:{cacheID:"cd3962224f3d57d1be6fbf4b9554b456",id:null,metadata:{},name:"BAIArtifactTypeTokenStoriesQuery",operationKind:"query",text:`query BAIArtifactTypeTokenStoriesQuery {
  artifact(id: "test-id") {
    ...BAIArtifactTypeTokenFragment
    id
  }
}

fragment BAIArtifactTypeTokenFragment on Artifact {
  type
}
`}}})();G.hash="2af805b826ef9c70e09b815fac9f22ba";const U={title:"Fragments/BAIArtifactTypeToken",component:F,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:`
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
        `}}}},i=()=>{const{artifact:r}=P.useLazyLoadQuery(G,{});return r&&e.jsx(F,{artifactTypeFrgmt:r})},t={name:"Model",parameters:{docs:{description:{story:"Displays an artifact with MODEL type (Brain icon, blue color)."}}},render:()=>e.jsx(o,{mockResolvers:{Artifact:()=>({type:"MODEL"})},children:e.jsx(i,{})})},a={parameters:{docs:{description:{story:"Displays an artifact with PACKAGE type (Package icon, green color)."}}},render:()=>e.jsx(o,{mockResolvers:{Artifact:()=>({type:"PACKAGE"})},children:e.jsx(i,{})})},n={parameters:{docs:{description:{story:"Displays an artifact with IMAGE type (Container icon, orange color)."}}},render:()=>e.jsx(o,{mockResolvers:{Artifact:()=>({type:"IMAGE"})},children:e.jsx(i,{})})},s={parameters:{docs:{description:{story:"Displays all available artifact type variants with their respective icons and colors."}}},render:()=>{const r=["MODEL","PACKAGE","IMAGE"];return e.jsx(K,{direction:"column",gap:"md",children:r.map(c=>e.jsx(o,{mockResolvers:{Artifact:()=>({type:c})},children:e.jsx(i,{})},c))})}};var l,p,y,d,m;t.parameters={...t.parameters,docs:{...(l=t.parameters)==null?void 0:l.docs,source:{originalSource:`{
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
}`,...(y=(p=t.parameters)==null?void 0:p.docs)==null?void 0:y.source},description:{story:"Default story showing MODEL type.",...(m=(d=t.parameters)==null?void 0:d.docs)==null?void 0:m.description}}};var f,u,A,g,k;a.parameters={...a.parameters,docs:{...(f=a.parameters)==null?void 0:f.docs,source:{originalSource:`{
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
}`,...(A=(u=a.parameters)==null?void 0:u.docs)==null?void 0:A.source},description:{story:"Story showing PACKAGE type.",...(k=(g=a.parameters)==null?void 0:g.docs)==null?void 0:k.description}}};var R,T,v,E,h;n.parameters={...n.parameters,docs:{...(R=n.parameters)==null?void 0:R.docs,source:{originalSource:`{
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
}`,...(v=(T=n.parameters)==null?void 0:T.docs)==null?void 0:v.source},description:{story:"Story showing IMAGE type.",...(h=(E=n.parameters)==null?void 0:E.docs)==null?void 0:h.description}}};var I,D,x,B,M;s.parameters={...s.parameters,docs:{...(I=s.parameters)==null?void 0:I.docs,source:{originalSource:`{
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
}`,...(x=(D=s.parameters)==null?void 0:D.docs)==null?void 0:x.source},description:{story:"Story showing all type variants together.",...(M=(B=s.parameters)==null?void 0:B.docs)==null?void 0:M.description}}};const _=["Default","Package","Image","AllTypes"];export{s as AllTypes,t as Default,n as Image,a as Package,_ as __namedExportsOrder,U as default};
