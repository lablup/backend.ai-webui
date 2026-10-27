import{n as e}from"./rolldown-runtime-2s6bX4vc.js";import{n as t,t as n}from"./BAIFlex-CAz1t6J5.js";import{n as r,t as i}from"./BAIArtifactStatusBadge-D59KigO4.js";import{n as a,t as o}from"./RelayResolver-b1nJU57O.js";import{jsx as s}from"react/jsx-runtime";import{useLazyLoadQuery as c}from"react-relay";var l;function u(){return(u=e((()=>{l=(function(){var e=[{kind:`Literal`,name:`id`,value:`test-id`}];return{fragment:{argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAIArtifactStatusBadgeStoriesQuery`,selections:[{alias:null,args:e,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`artifactRevision`,plural:!1,selections:[{args:null,kind:`FragmentSpread`,name:`BAIArtifactStatusBadgeFragment`}],storageKey:`artifactRevision(id:"test-id")`}],type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[],kind:`Operation`,name:`BAIArtifactStatusBadgeStoriesQuery`,selections:[{alias:null,args:e,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`artifactRevision`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`status`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null}],storageKey:`artifactRevision(id:"test-id")`}]},params:{cacheID:`a4f1d2b684ddc6be1d5616d50d8506e1`,id:null,metadata:{},name:`BAIArtifactStatusBadgeStoriesQuery`,operationKind:`query`,text:`query BAIArtifactStatusBadgeStoriesQuery {
  artifactRevision(id: "test-id") {
    ...BAIArtifactStatusBadgeFragment
    id
  }
}

fragment BAIArtifactStatusBadgeFragment on ArtifactRevision {
  status
}
`}}})(),l.hash=`d7b63c13ed92e6096642716d77225775`})))()}var d,f,p,m,h,g,_,v,y,b,x,S;function C(){return(C=e((()=>{u(),a(),t(),r(),d={title:`Fragments/BAIArtifactStatusBadge`,component:i,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`
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
        `}}}},f=()=>{let{artifactRevision:e}=c(l,{});return e&&s(i,{artifactRevisionFrgmt:e})},p={name:`Available`,parameters:{docs:{description:{story:`Displays an artifact revision with AVAILABLE status.`}}},render:()=>s(o,{mockResolvers:{ArtifactRevision:()=>({status:`AVAILABLE`})},children:s(f,{})})},m={parameters:{docs:{description:{story:`Displays an artifact revision with PULLING status.`}}},render:()=>s(o,{mockResolvers:{ArtifactRevision:()=>({status:`PULLING`})},children:s(f,{})})},h={parameters:{docs:{description:{story:`Displays an artifact revision with PULLED status.`}}},render:()=>s(o,{mockResolvers:{ArtifactRevision:()=>({status:`PULLED`})},children:s(f,{})})},g={parameters:{docs:{description:{story:`Displays an artifact revision with VERIFYING status.`}}},render:()=>s(o,{mockResolvers:{ArtifactRevision:()=>({status:`VERIFYING`})},children:s(f,{})})},_={parameters:{docs:{description:{story:`Displays an artifact revision with SCANNED status.`}}},render:()=>s(o,{mockResolvers:{ArtifactRevision:()=>({status:`SCANNED`})},children:s(f,{})})},v={parameters:{docs:{description:{story:`Displays an artifact revision with NEEDS_APPROVAL status.`}}},render:()=>s(o,{mockResolvers:{ArtifactRevision:()=>({status:`NEEDS_APPROVAL`})},children:s(f,{})})},y={parameters:{docs:{description:{story:`Displays an artifact revision with REJECTED status.`}}},render:()=>s(o,{mockResolvers:{ArtifactRevision:()=>({status:`REJECTED`})},children:s(f,{})})},b={parameters:{docs:{description:{story:`Displays an artifact revision with FAILED status.`}}},render:()=>s(o,{mockResolvers:{ArtifactRevision:()=>({status:`FAILED`})},children:s(f,{})})},x={parameters:{docs:{description:{story:`Displays all available artifact status variants.`}}},render:()=>s(n,{direction:`column`,gap:`md`,children:[`AVAILABLE`,`PULLING`,`PULLED`,`VERIFYING`,`SCANNED`,`NEEDS_APPROVAL`,`REJECTED`,`FAILED`].map(e=>s(o,{mockResolvers:{ArtifactRevision:()=>({status:e})},children:s(f,{})},e))})},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
}`,...p.parameters?.docs?.source},description:{story:`Default story showing AVAILABLE status.`,...p.parameters?.docs?.description}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source},description:{story:`Story showing PULLING status.`,...m.parameters?.docs?.description}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source},description:{story:`Story showing PULLED status.`,...h.parameters?.docs?.description}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source},description:{story:`Story showing VERIFYING status.`,...g.parameters?.docs?.description}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source},description:{story:`Story showing SCANNED status.`,..._.parameters?.docs?.description}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source},description:{story:`Story showing NEEDS_APPROVAL status.`,...v.parameters?.docs?.description}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source},description:{story:`Story showing REJECTED status.`,...y.parameters?.docs?.description}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source},description:{story:`Story showing FAILED status.`,...b.parameters?.docs?.description}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source},description:{story:`Story showing all status variants together.`,...x.parameters?.docs?.description}}},S=[`Default`,`Pulling`,`Pulled`,`Verifying`,`Scanned`,`NeedsApproval`,`Rejected`,`Failed`,`AllStatuses`]})))()}C();export{x as AllStatuses,p as Default,b as Failed,v as NeedsApproval,h as Pulled,m as Pulling,y as Rejected,_ as Scanned,g as Verifying,S as __namedExportsOrder,d as default};