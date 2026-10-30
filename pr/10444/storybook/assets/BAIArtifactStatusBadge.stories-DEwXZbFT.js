import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-MKhVqBIO.js";import{n,t as r}from"./BAIFlex-BOFoS5KY.js";import{t as i}from"./react-relay-BSueCi1A.js";import{n as a,t as o}from"./BAIArtifactStatusBadge-dPDyawGJ.js";import{n as s,t as c}from"./RelayResolver-Ba2yvw-v.js";var l;function u(){return(u=e((()=>{l=(function(){var e=[{kind:`Literal`,name:`id`,value:`test-id`}];return{fragment:{argumentDefinitions:[],kind:`Fragment`,metadata:null,name:`BAIArtifactStatusBadgeStoriesQuery`,selections:[{alias:null,args:e,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`artifactRevision`,plural:!1,selections:[{args:null,kind:`FragmentSpread`,name:`BAIArtifactStatusBadgeFragment`}],storageKey:`artifactRevision(id:"test-id")`}],type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:[],kind:`Operation`,name:`BAIArtifactStatusBadgeStoriesQuery`,selections:[{alias:null,args:e,concreteType:`ArtifactRevision`,kind:`LinkedField`,name:`artifactRevision`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`status`,storageKey:null},{alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null}],storageKey:`artifactRevision(id:"test-id")`}]},params:{cacheID:`a4f1d2b684ddc6be1d5616d50d8506e1`,id:null,metadata:{},name:`BAIArtifactStatusBadgeStoriesQuery`,operationKind:`query`,text:`query BAIArtifactStatusBadgeStoriesQuery {
  artifactRevision(id: "test-id") {
    ...BAIArtifactStatusBadgeFragment
    id
  }
}

fragment BAIArtifactStatusBadgeFragment on ArtifactRevision {
  status
}
`}}})(),l.hash=`d7b63c13ed92e6096642716d77225775`})))()}var d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z;function Q(){return(Q=e((()=>{u(),s(),n(),a(),d=i(),f=t(),B={title:`Fragments/BAIArtifactStatusBadge`,component:o,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`
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
        `}}}},V=()=>{let{artifactRevision:e}=(0,d.useLazyLoadQuery)(l,{});return e&&(0,f.jsx)(o,{artifactRevisionFrgmt:e})},H={name:`Available`,parameters:{docs:{description:{story:`Displays an artifact revision with AVAILABLE status.`}}},render:()=>(0,f.jsx)(c,{mockResolvers:{ArtifactRevision:()=>({status:`AVAILABLE`})},children:(0,f.jsx)(V,{})})},U={parameters:{docs:{description:{story:`Displays an artifact revision with PULLING status.`}}},render:()=>(0,f.jsx)(c,{mockResolvers:{ArtifactRevision:()=>({status:`PULLING`})},children:(0,f.jsx)(V,{})})},W={parameters:{docs:{description:{story:`Displays an artifact revision with PULLED status.`}}},render:()=>(0,f.jsx)(c,{mockResolvers:{ArtifactRevision:()=>({status:`PULLED`})},children:(0,f.jsx)(V,{})})},G={parameters:{docs:{description:{story:`Displays an artifact revision with VERIFYING status.`}}},render:()=>(0,f.jsx)(c,{mockResolvers:{ArtifactRevision:()=>({status:`VERIFYING`})},children:(0,f.jsx)(V,{})})},K={parameters:{docs:{description:{story:`Displays an artifact revision with SCANNED status.`}}},render:()=>(0,f.jsx)(c,{mockResolvers:{ArtifactRevision:()=>({status:`SCANNED`})},children:(0,f.jsx)(V,{})})},q={parameters:{docs:{description:{story:`Displays an artifact revision with NEEDS_APPROVAL status.`}}},render:()=>(0,f.jsx)(c,{mockResolvers:{ArtifactRevision:()=>({status:`NEEDS_APPROVAL`})},children:(0,f.jsx)(V,{})})},J={parameters:{docs:{description:{story:`Displays an artifact revision with REJECTED status.`}}},render:()=>(0,f.jsx)(c,{mockResolvers:{ArtifactRevision:()=>({status:`REJECTED`})},children:(0,f.jsx)(V,{})})},Y={parameters:{docs:{description:{story:`Displays an artifact revision with FAILED status.`}}},render:()=>(0,f.jsx)(c,{mockResolvers:{ArtifactRevision:()=>({status:`FAILED`})},children:(0,f.jsx)(V,{})})},X={parameters:{docs:{description:{story:`Displays all available artifact status variants.`}}},render:()=>(0,f.jsx)(r,{direction:`column`,gap:`md`,children:[`AVAILABLE`,`PULLING`,`PULLED`,`VERIFYING`,`SCANNED`,`NEEDS_APPROVAL`,`REJECTED`,`FAILED`].map(e=>(0,f.jsx)(c,{mockResolvers:{ArtifactRevision:()=>({status:e})},children:(0,f.jsx)(V,{})},e))})},H.parameters={...H.parameters,docs:{...(p=H.parameters)==null?void 0:p.docs,source:{originalSource:`{
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
}`,...(m=H.parameters)==null||(m=m.docs)==null?void 0:m.source},description:{story:`Default story showing AVAILABLE status.`,...(h=H.parameters)==null||(h=h.docs)==null?void 0:h.description}}},U.parameters={...U.parameters,docs:{...(g=U.parameters)==null?void 0:g.docs,source:{originalSource:`{
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
}`,...(_=U.parameters)==null||(_=_.docs)==null?void 0:_.source},description:{story:`Story showing PULLING status.`,...(v=U.parameters)==null||(v=v.docs)==null?void 0:v.description}}},W.parameters={...W.parameters,docs:{...(y=W.parameters)==null?void 0:y.docs,source:{originalSource:`{
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
}`,...(b=W.parameters)==null||(b=b.docs)==null?void 0:b.source},description:{story:`Story showing PULLED status.`,...(x=W.parameters)==null||(x=x.docs)==null?void 0:x.description}}},G.parameters={...G.parameters,docs:{...(S=G.parameters)==null?void 0:S.docs,source:{originalSource:`{
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
}`,...(C=G.parameters)==null||(C=C.docs)==null?void 0:C.source},description:{story:`Story showing VERIFYING status.`,...(w=G.parameters)==null||(w=w.docs)==null?void 0:w.description}}},K.parameters={...K.parameters,docs:{...(T=K.parameters)==null?void 0:T.docs,source:{originalSource:`{
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
}`,...(E=K.parameters)==null||(E=E.docs)==null?void 0:E.source},description:{story:`Story showing SCANNED status.`,...(D=K.parameters)==null||(D=D.docs)==null?void 0:D.description}}},q.parameters={...q.parameters,docs:{...(O=q.parameters)==null?void 0:O.docs,source:{originalSource:`{
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
}`,...(k=q.parameters)==null||(k=k.docs)==null?void 0:k.source},description:{story:`Story showing NEEDS_APPROVAL status.`,...(A=q.parameters)==null||(A=A.docs)==null?void 0:A.description}}},J.parameters={...J.parameters,docs:{...(j=J.parameters)==null?void 0:j.docs,source:{originalSource:`{
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
}`,...(M=J.parameters)==null||(M=M.docs)==null?void 0:M.source},description:{story:`Story showing REJECTED status.`,...(N=J.parameters)==null||(N=N.docs)==null?void 0:N.description}}},Y.parameters={...Y.parameters,docs:{...(P=Y.parameters)==null?void 0:P.docs,source:{originalSource:`{
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
}`,...(F=Y.parameters)==null||(F=F.docs)==null?void 0:F.source},description:{story:`Story showing FAILED status.`,...(I=Y.parameters)==null||(I=I.docs)==null?void 0:I.description}}},X.parameters={...X.parameters,docs:{...(L=X.parameters)==null?void 0:L.docs,source:{originalSource:`{
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
}`,...(R=X.parameters)==null||(R=R.docs)==null?void 0:R.source},description:{story:`Story showing all status variants together.`,...(z=X.parameters)==null||(z=z.docs)==null?void 0:z.description}}},Z=[`Default`,`Pulling`,`Pulled`,`Verifying`,`Scanned`,`NeedsApproval`,`Rejected`,`Failed`,`AllStatuses`]})))()}Q();export{X as AllStatuses,H as Default,Y as Failed,q as NeedsApproval,W as Pulled,U as Pulling,J as Rejected,K as Scanned,G as Verifying,Z as __namedExportsOrder,B as default};