import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-MKhVqBIO.js";import{n,t as r}from"./BAIFlex-BOFoS5KY.js";import{t as i}from"./react-relay-sBALIJlt.js";import{n as a,t as o}from"./BAIArtifactStatusBadge-DnBgKXh3.js";import{n as s,t as c}from"./RelayResolver-CMrgwoPg.js";var l;function u(){return(u=e((()=>{l=(function(){var e=[{kind:`Literal`,name:`id`,value:`test-id`}];return{fragment:{argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAIArtifactStatusBadgeStoriesQuery`,selections:[{alias:null,args:e,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`artifactRevision`,plural:!1,selections:[{args:null,kind:`FragmentSpread`,name:`BAIArtifactStatusBadgeFragment`}],storageKey:`artifactRevision(id:"test-id")`}],type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[],kind:`Operation`,name:`BAIArtifactStatusBadgeStoriesQuery`,selections:[{alias:null,args:e,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`artifactRevision`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`status`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null}],storageKey:`artifactRevision(id:"test-id")`}]},params:{cacheID:`a4f1d2b684ddc6be1d5616d50d8506e1`,id:null,metadata:{},name:`BAIArtifactStatusBadgeStoriesQuery`,operationKind:`query`,text:`query BAIArtifactStatusBadgeStoriesQuery {
  artifactRevision(id: "test-id") {
    ...BAIArtifactStatusBadgeFragment
    id
  }
}

fragment BAIArtifactStatusBadgeFragment on ArtifactRevision {
  status
}
`}}})(),l.hash=`d7b63c13ed92e6096642716d77225775`})))()}var d,f,p,m,h,g,_,v,y,b,x,S,C,w;function T(){return(T=e((()=>{u(),s(),n(),a(),d=i(),f=t(),p={title:`Fragments/BAIArtifactStatusBadge`,component:o,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`
**BAIArtifactStatusBadge** displays the status of an artifact revision.

## Features
- Displays artifact revision status as a Badge
- Supports all artifact status types (AVAILABLE, FAILED, NEEDS_APPROVAL, PULLED, PULLING, REJECTED, SCANNED, VERIFYING)
- Uses Relay fragment for data fetching

## Usage
\`\`\`tsx
<BAIArtifactStatusBadge artifactRevisionFrgmt={artifactRevision} />
\`\`\`

## Props
| Name | Type | Description |
|------|------|-------------|
| \`artifactRevisionFrgmt\` | \`BAIArtifactStatusBadgeFragment$key\` | Relay fragment reference for artifact revision |
        `}}}},m=()=>{let{artifactRevision:e}=(0,d.useLazyLoadQuery)(l,{});return e&&(0,f.jsx)(o,{artifactRevisionFrgmt:e})},h={name:`Available`,parameters:{docs:{description:{story:`Displays an artifact revision with AVAILABLE status.`}}},render:()=>(0,f.jsx)(c,{mockResolvers:{ArtifactRevision:()=>({status:`AVAILABLE`})},children:(0,f.jsx)(m,{})})},g={parameters:{docs:{description:{story:`Displays an artifact revision with PULLING status.`}}},render:()=>(0,f.jsx)(c,{mockResolvers:{ArtifactRevision:()=>({status:`PULLING`})},children:(0,f.jsx)(m,{})})},_={parameters:{docs:{description:{story:`Displays an artifact revision with PULLED status.`}}},render:()=>(0,f.jsx)(c,{mockResolvers:{ArtifactRevision:()=>({status:`PULLED`})},children:(0,f.jsx)(m,{})})},v={parameters:{docs:{description:{story:`Displays an artifact revision with VERIFYING status.`}}},render:()=>(0,f.jsx)(c,{mockResolvers:{ArtifactRevision:()=>({status:`VERIFYING`})},children:(0,f.jsx)(m,{})})},y={parameters:{docs:{description:{story:`Displays an artifact revision with SCANNED status.`}}},render:()=>(0,f.jsx)(c,{mockResolvers:{ArtifactRevision:()=>({status:`SCANNED`})},children:(0,f.jsx)(m,{})})},b={parameters:{docs:{description:{story:`Displays an artifact revision with NEEDS_APPROVAL status.`}}},render:()=>(0,f.jsx)(c,{mockResolvers:{ArtifactRevision:()=>({status:`NEEDS_APPROVAL`})},children:(0,f.jsx)(m,{})})},x={parameters:{docs:{description:{story:`Displays an artifact revision with REJECTED status.`}}},render:()=>(0,f.jsx)(c,{mockResolvers:{ArtifactRevision:()=>({status:`REJECTED`})},children:(0,f.jsx)(m,{})})},S={parameters:{docs:{description:{story:`Displays an artifact revision with FAILED status.`}}},render:()=>(0,f.jsx)(c,{mockResolvers:{ArtifactRevision:()=>({status:`FAILED`})},children:(0,f.jsx)(m,{})})},C={parameters:{docs:{description:{story:`Displays all available artifact status variants.`}}},render:()=>(0,f.jsx)(r,{direction:`column`,gap:`md`,children:[`AVAILABLE`,`PULLING`,`PULLED`,`VERIFYING`,`SCANNED`,`NEEDS_APPROVAL`,`REJECTED`,`FAILED`].map(e=>(0,f.jsx)(c,{mockResolvers:{ArtifactRevision:()=>({status:e})},children:(0,f.jsx)(m,{})},e))})},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  name: 'Available',
  parameters: {
    docs: {
      description: {
        story: 'Displays an artifact revision with AVAILABLE status.'
      }
    }
  },
  render: () => {
    return <RelayResolver mockResolvers={{
      ArtifactRevision: () => ({
        status: 'AVAILABLE'
      })
    }}>
        <QueryResolver />
      </RelayResolver>;
  }
}`,...h.parameters?.docs?.source},description:{story:`Default story showing AVAILABLE status.`,...h.parameters?.docs?.description}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Displays an artifact revision with PULLING status.'
      }
    }
  },
  render: () => {
    return <RelayResolver mockResolvers={{
      ArtifactRevision: () => ({
        status: 'PULLING'
      })
    }}>
        <QueryResolver />
      </RelayResolver>;
  }
}`,...g.parameters?.docs?.source},description:{story:`Story showing PULLING status.`,...g.parameters?.docs?.description}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Displays an artifact revision with PULLED status.'
      }
    }
  },
  render: () => {
    return <RelayResolver mockResolvers={{
      ArtifactRevision: () => ({
        status: 'PULLED'
      })
    }}>
        <QueryResolver />
      </RelayResolver>;
  }
}`,..._.parameters?.docs?.source},description:{story:`Story showing PULLED status.`,..._.parameters?.docs?.description}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Displays an artifact revision with VERIFYING status.'
      }
    }
  },
  render: () => {
    return <RelayResolver mockResolvers={{
      ArtifactRevision: () => ({
        status: 'VERIFYING'
      })
    }}>
        <QueryResolver />
      </RelayResolver>;
  }
}`,...v.parameters?.docs?.source},description:{story:`Story showing VERIFYING status.`,...v.parameters?.docs?.description}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Displays an artifact revision with SCANNED status.'
      }
    }
  },
  render: () => {
    return <RelayResolver mockResolvers={{
      ArtifactRevision: () => ({
        status: 'SCANNED'
      })
    }}>
        <QueryResolver />
      </RelayResolver>;
  }
}`,...y.parameters?.docs?.source},description:{story:`Story showing SCANNED status.`,...y.parameters?.docs?.description}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Displays an artifact revision with NEEDS_APPROVAL status.'
      }
    }
  },
  render: () => {
    return <RelayResolver mockResolvers={{
      ArtifactRevision: () => ({
        status: 'NEEDS_APPROVAL'
      })
    }}>
        <QueryResolver />
      </RelayResolver>;
  }
}`,...b.parameters?.docs?.source},description:{story:`Story showing NEEDS_APPROVAL status.`,...b.parameters?.docs?.description}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Displays an artifact revision with REJECTED status.'
      }
    }
  },
  render: () => {
    return <RelayResolver mockResolvers={{
      ArtifactRevision: () => ({
        status: 'REJECTED'
      })
    }}>
        <QueryResolver />
      </RelayResolver>;
  }
}`,...x.parameters?.docs?.source},description:{story:`Story showing REJECTED status.`,...x.parameters?.docs?.description}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Displays an artifact revision with FAILED status.'
      }
    }
  },
  render: () => {
    return <RelayResolver mockResolvers={{
      ArtifactRevision: () => ({
        status: 'FAILED'
      })
    }}>
        <QueryResolver />
      </RelayResolver>;
  }
}`,...S.parameters?.docs?.source},description:{story:`Story showing FAILED status.`,...S.parameters?.docs?.description}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Displays all available artifact status variants.'
      }
    }
  },
  render: () => {
    const statuses = ['AVAILABLE', 'PULLING', 'PULLED', 'VERIFYING', 'SCANNED', 'NEEDS_APPROVAL', 'REJECTED', 'FAILED'] as const;
    return <BAIFlex direction="column" gap="md">
        {statuses.map(status => <RelayResolver key={status} mockResolvers={{
        ArtifactRevision: () => ({
          status
        })
      }}>
            <QueryResolver />
          </RelayResolver>)}
      </BAIFlex>;
  }
}`,...C.parameters?.docs?.source},description:{story:`Story showing all status variants together.`,...C.parameters?.docs?.description}}},w=[`Default`,`Pulling`,`Pulled`,`Verifying`,`Scanned`,`NeedsApproval`,`Rejected`,`Failed`,`AllStatuses`]})))()}T();export{C as AllStatuses,h as Default,S as Failed,b as NeedsApproval,_ as Pulled,g as Pulling,x as Rejected,y as Scanned,v as Verifying,w as __namedExportsOrder,p as default};