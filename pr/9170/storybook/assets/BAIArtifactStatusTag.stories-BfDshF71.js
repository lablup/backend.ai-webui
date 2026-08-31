import{j as s}from"./iframe-X64pm6CJ.js";import{R as e}from"./RelayResolver-D5QpDKr-.js";import{B as os}from"./BAIFlex-BRvSMUql.js";import{B as ns}from"./BAIArtifactStatusTag-ChXDAVGd.js";import{r as cs}from"./index-ffHxRGzd.js";import"./preload-helper-Dp1pzeXC.js";import"./index-CZiLV0to.js";import"./BAITag-xHSMCZ0Q.js";import"./astryxTagVariant-CPCr7vTB.js";import"./Token-uDhh5tV6.js";import"./composeEventHandlers-BolWE7qY.js";import"./Badge-6WHNbmte.js";const is=(function(){var t=[{kind:"Literal",name:"id",value:"test-id"}];return{fragment:{argumentDefinitions:[],kind:"Fragment",metadata:null,name:"BAIArtifactStatusTagStoriesQuery",selections:[{alias:null,args:t,concreteType:"ArtifactRevision",kind:"LinkedField",name:"artifactRevision",plural:!1,selections:[{args:null,kind:"FragmentSpread",name:"BAIArtifactStatusTagFragment"}],storageKey:'artifactRevision(id:"test-id")'}],type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[],kind:"Operation",name:"BAIArtifactStatusTagStoriesQuery",selections:[{alias:null,args:t,concreteType:"ArtifactRevision",kind:"LinkedField",name:"artifactRevision",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"status",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null}],storageKey:'artifactRevision(id:"test-id")'}]},params:{cacheID:"a64b2336055fc725402cb523db9ea84a",id:null,metadata:{},name:"BAIArtifactStatusTagStoriesQuery",operationKind:"query",text:`query BAIArtifactStatusTagStoriesQuery {
  artifactRevision(id: "test-id") {
    ...BAIArtifactStatusTagFragment
    id
  }
}

fragment BAIArtifactStatusTagFragment on ArtifactRevision {
  status
}
`}}})();is.hash="91f823f4c03690521c3660a34caa442b";const gs={title:"Fragments/BAIArtifactStatusTag",component:ns,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:`
**BAIArtifactStatusTag** displays the status of an artifact revision.

## Features
- Displays artifact revision status as a tag
- Supports all artifact status types (AVAILABLE, FAILED, NEEDS_APPROVAL, PULLED, PULLING, REJECTED, SCANNED, VERIFYING)
- Uses Relay fragment for data fetching

## Usage
\`\`\`tsx
<BAIArtifactStatusTag artifactRevisionFrgmt={artifactRevision} />
\`\`\`

## Props
| Name | Type | Description |
|------|------|-------------|
| \`artifactRevisionFrgmt\` | \`BAIArtifactStatusTagFragment$key\` | Relay fragment reference for artifact revision |
        `}}}},r=()=>{const{artifactRevision:t}=cs.useLazyLoadQuery(is,{});return t&&s.jsx(ns,{artifactRevisionFrgmt:t})},a={name:"Available",parameters:{docs:{description:{story:"Displays an artifact revision with AVAILABLE status."}}},render:()=>s.jsx(e,{mockResolvers:{ArtifactRevision:()=>({status:"AVAILABLE"})},children:s.jsx(r,{})})},n={parameters:{docs:{description:{story:"Displays an artifact revision with PULLING status."}}},render:()=>s.jsx(e,{mockResolvers:{ArtifactRevision:()=>({status:"PULLING"})},children:s.jsx(r,{})})},i={parameters:{docs:{description:{story:"Displays an artifact revision with PULLED status."}}},render:()=>s.jsx(e,{mockResolvers:{ArtifactRevision:()=>({status:"PULLED"})},children:s.jsx(r,{})})},o={parameters:{docs:{description:{story:"Displays an artifact revision with VERIFYING status."}}},render:()=>s.jsx(e,{mockResolvers:{ArtifactRevision:()=>({status:"VERIFYING"})},children:s.jsx(r,{})})},c={parameters:{docs:{description:{story:"Displays an artifact revision with SCANNED status."}}},render:()=>s.jsx(e,{mockResolvers:{ArtifactRevision:()=>({status:"SCANNED"})},children:s.jsx(r,{})})},l={parameters:{docs:{description:{story:"Displays an artifact revision with NEEDS_APPROVAL status."}}},render:()=>s.jsx(e,{mockResolvers:{ArtifactRevision:()=>({status:"NEEDS_APPROVAL"})},children:s.jsx(r,{})})},d={parameters:{docs:{description:{story:"Displays an artifact revision with REJECTED status."}}},render:()=>s.jsx(e,{mockResolvers:{ArtifactRevision:()=>({status:"REJECTED"})},children:s.jsx(r,{})})},u={parameters:{docs:{description:{story:"Displays an artifact revision with FAILED status."}}},render:()=>s.jsx(e,{mockResolvers:{ArtifactRevision:()=>({status:"FAILED"})},children:s.jsx(r,{})})},p={parameters:{docs:{description:{story:"Displays all available artifact status variants."}}},render:()=>{const t=["AVAILABLE","PULLING","PULLED","VERIFYING","SCANNED","NEEDS_APPROVAL","REJECTED","FAILED"];return s.jsx(os,{direction:"column",gap:"md",children:t.map(m=>s.jsx(e,{mockResolvers:{ArtifactRevision:()=>({status:m})},children:s.jsx(r,{})},m))})}};var R,y,A,v,f;a.parameters={...a.parameters,docs:{...(R=a.parameters)==null?void 0:R.docs,source:{originalSource:`{
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
}`,...(A=(y=a.parameters)==null?void 0:y.docs)==null?void 0:A.source},description:{story:"Default story showing AVAILABLE status.",...(f=(v=a.parameters)==null?void 0:v.docs)==null?void 0:f.description}}};var E,L,g,D,S;n.parameters={...n.parameters,docs:{...(E=n.parameters)==null?void 0:E.docs,source:{originalSource:`{
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
}`,...(g=(L=n.parameters)==null?void 0:L.docs)==null?void 0:g.source},description:{story:"Story showing PULLING status.",...(S=(D=n.parameters)==null?void 0:D.docs)==null?void 0:S.description}}};var I,N,h,P,F;i.parameters={...i.parameters,docs:{...(I=i.parameters)==null?void 0:I.docs,source:{originalSource:`{
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
}`,...(h=(N=i.parameters)==null?void 0:N.docs)==null?void 0:h.source},description:{story:"Story showing PULLED status.",...(F=(P=i.parameters)==null?void 0:P.docs)==null?void 0:F.description}}};var k,x,V,w,B;o.parameters={...o.parameters,docs:{...(k=o.parameters)==null?void 0:k.docs,source:{originalSource:`{
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
}`,...(V=(x=o.parameters)==null?void 0:x.docs)==null?void 0:V.source},description:{story:"Story showing VERIFYING status.",...(B=(w=o.parameters)==null?void 0:w.docs)==null?void 0:B.description}}};var j,T,U,C,G;c.parameters={...c.parameters,docs:{...(j=c.parameters)==null?void 0:j.docs,source:{originalSource:`{
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
}`,...(U=(T=c.parameters)==null?void 0:T.docs)==null?void 0:U.source},description:{story:"Story showing SCANNED status.",...(G=(C=c.parameters)==null?void 0:C.docs)==null?void 0:G.description}}};var Q,O,_,b,J;l.parameters={...l.parameters,docs:{...(Q=l.parameters)==null?void 0:Q.docs,source:{originalSource:`{
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
}`,...(_=(O=l.parameters)==null?void 0:O.docs)==null?void 0:_.source},description:{story:"Story showing NEEDS_APPROVAL status.",...(J=(b=l.parameters)==null?void 0:b.docs)==null?void 0:J.description}}};var Y,K,q,z,$;d.parameters={...d.parameters,docs:{...(Y=d.parameters)==null?void 0:Y.docs,source:{originalSource:`{
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
}`,...(q=(K=d.parameters)==null?void 0:K.docs)==null?void 0:q.source},description:{story:"Story showing REJECTED status.",...($=(z=d.parameters)==null?void 0:z.docs)==null?void 0:$.description}}};var H,M,W,X,Z;u.parameters={...u.parameters,docs:{...(H=u.parameters)==null?void 0:H.docs,source:{originalSource:`{
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
}`,...(W=(M=u.parameters)==null?void 0:M.docs)==null?void 0:W.source},description:{story:"Story showing FAILED status.",...(Z=(X=u.parameters)==null?void 0:X.docs)==null?void 0:Z.description}}};var ss,es,rs,ts,as;p.parameters={...p.parameters,docs:{...(ss=p.parameters)==null?void 0:ss.docs,source:{originalSource:`{
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
}`,...(rs=(es=p.parameters)==null?void 0:es.docs)==null?void 0:rs.source},description:{story:"Story showing all status variants together.",...(as=(ts=p.parameters)==null?void 0:ts.docs)==null?void 0:as.description}}};const Ds=["Default","Pulling","Pulled","Verifying","Scanned","NeedsApproval","Rejected","Failed","AllStatuses"];export{p as AllStatuses,a as Default,u as Failed,l as NeedsApproval,i as Pulled,n as Pulling,d as Rejected,c as Scanned,o as Verifying,Ds as __namedExportsOrder,gs as default};
