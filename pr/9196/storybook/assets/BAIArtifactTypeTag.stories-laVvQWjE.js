import{j as e}from"./iframe-CqSAZ2n6.js";import{R as o}from"./RelayResolver-DoQy7h71.js";import{B as K}from"./BAIFlex-DQnJzZcS.js";import{B as F}from"./BAIArtifactTypeTag-D65MZ_v_.js";import{r as P}from"./index-DZbfQk-X.js";import"./preload-helper-Dp1pzeXC.js";import"./index-L3g6_2fU.js";import"./Badge-BZWJVE-p.js";const G=(function(){var r=[{kind:"Literal",name:"id",value:"test-id"}];return{fragment:{argumentDefinitions:[],kind:"Fragment",metadata:null,name:"BAIArtifactTypeTagStoriesQuery",selections:[{alias:null,args:r,concreteType:"Artifact",kind:"LinkedField",name:"artifact",plural:!1,selections:[{args:null,kind:"FragmentSpread",name:"BAIArtifactTypeTagFragment"}],storageKey:'artifact(id:"test-id")'}],type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[],kind:"Operation",name:"BAIArtifactTypeTagStoriesQuery",selections:[{alias:null,args:r,concreteType:"Artifact",kind:"LinkedField",name:"artifact",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"type",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null}],storageKey:'artifact(id:"test-id")'}]},params:{cacheID:"6ad342e243a6da352e54cbfa2c093d30",id:null,metadata:{},name:"BAIArtifactTypeTagStoriesQuery",operationKind:"query",text:`query BAIArtifactTypeTagStoriesQuery {
  artifact(id: "test-id") {
    ...BAIArtifactTypeTagFragment
    id
  }
}

fragment BAIArtifactTypeTagFragment on Artifact {
  type
}
`}}})();G.hash="597813df486cc4451f0de81ef66a98d8";const q={title:"Fragments/BAIArtifactTypeTag",component:F,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:`
**BAIArtifactTypeTag** displays the type of an artifact with a visual icon.

## Features
- Displays artifact type as a tag with icon
- Three types: MODEL (Brain icon), PACKAGE (Package icon), IMAGE (Container icon)
- Color-coded icons: MODEL (blue), PACKAGE (green), IMAGE (orange)
- Uses Relay fragment for data fetching

## Usage
\`\`\`tsx
<BAIArtifactTypeTag artifactTypeFrgmt={artifact} />
\`\`\`

## Props
| Name | Type | Description |
|------|------|-------------|
| \`artifactTypeFrgmt\` | \`BAIArtifactTypeTagFragment$key\` | Relay fragment reference for artifact |
        `}}}},i=()=>{const{artifact:r}=P.useLazyLoadQuery(G,{});return r&&e.jsx(F,{artifactTypeFrgmt:r})},t={name:"Model",parameters:{docs:{description:{story:"Displays an artifact with MODEL type (Brain icon, blue color)."}}},render:()=>e.jsx(o,{mockResolvers:{Artifact:()=>({type:"MODEL"})},children:e.jsx(i,{})})},a={parameters:{docs:{description:{story:"Displays an artifact with PACKAGE type (Package icon, green color)."}}},render:()=>e.jsx(o,{mockResolvers:{Artifact:()=>({type:"PACKAGE"})},children:e.jsx(i,{})})},s={parameters:{docs:{description:{story:"Displays an artifact with IMAGE type (Container icon, orange color)."}}},render:()=>e.jsx(o,{mockResolvers:{Artifact:()=>({type:"IMAGE"})},children:e.jsx(i,{})})},n={parameters:{docs:{description:{story:"Displays all available artifact type variants with their respective icons and colors."}}},render:()=>{const r=["MODEL","PACKAGE","IMAGE"];return e.jsx(K,{direction:"column",gap:"md",children:r.map(c=>e.jsx(o,{mockResolvers:{Artifact:()=>({type:c})},children:e.jsx(i,{})},c))})}};var l,p,d,y,m;t.parameters={...t.parameters,docs:{...(l=t.parameters)==null?void 0:l.docs,source:{originalSource:`{
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
}`,...(d=(p=t.parameters)==null?void 0:p.docs)==null?void 0:d.source},description:{story:"Default story showing MODEL type.",...(m=(y=t.parameters)==null?void 0:y.docs)==null?void 0:m.description}}};var f,u,A,g,R;a.parameters={...a.parameters,docs:{...(f=a.parameters)==null?void 0:f.docs,source:{originalSource:`{
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
}`,...(A=(u=a.parameters)==null?void 0:u.docs)==null?void 0:A.source},description:{story:"Story showing PACKAGE type.",...(R=(g=a.parameters)==null?void 0:g.docs)==null?void 0:R.description}}};var v,T,E,h,I;s.parameters={...s.parameters,docs:{...(v=s.parameters)==null?void 0:v.docs,source:{originalSource:`{
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
}`,...(E=(T=s.parameters)==null?void 0:T.docs)==null?void 0:E.source},description:{story:"Story showing IMAGE type.",...(I=(h=s.parameters)==null?void 0:h.docs)==null?void 0:I.description}}};var k,D,x,B,M;n.parameters={...n.parameters,docs:{...(k=n.parameters)==null?void 0:k.docs,source:{originalSource:`{
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
}`,...(x=(D=n.parameters)==null?void 0:D.docs)==null?void 0:x.source},description:{story:"Story showing all type variants together.",...(M=(B=n.parameters)==null?void 0:B.docs)==null?void 0:M.description}}};const U=["Default","Package","Image","AllTypes"];export{n as AllTypes,t as Default,s as Image,a as Package,U as __namedExportsOrder,q as default};
