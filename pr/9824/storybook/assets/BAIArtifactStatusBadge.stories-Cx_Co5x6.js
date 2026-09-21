import{j as e}from"./iframe-5WRf64mg.js";import{R as s}from"./RelayResolver-NTBlDQrk.js";import{B as oe}from"./BAIFlex-Cm6kJyOP.js";import{B as ne}from"./BAIArtifactStatusBadge-QeMiI4lg.js";import{r as ce}from"./index-CDcuCjiD.js";import"./preload-helper-Dp1pzeXC.js";import"./index-BQ7WhtjZ.js";import"./Badge-osdYErZi.js";const ie=(function(){var t=[{kind:"Literal",name:"id",value:"test-id"}];return{fragment:{argumentDefinitions:[],kind:"Fragment",metadata:null,name:"BAIArtifactStatusBadgeStoriesQuery",selections:[{alias:null,args:t,concreteType:"ArtifactRevision",kind:"LinkedField",name:"artifactRevision",plural:!1,selections:[{args:null,kind:"FragmentSpread",name:"BAIArtifactStatusBadgeFragment"}],storageKey:'artifactRevision(id:"test-id")'}],type:"Query",abstractKey:null},kind:"Request",operation:{argumentDefinitions:[],kind:"Operation",name:"BAIArtifactStatusBadgeStoriesQuery",selections:[{alias:null,args:t,concreteType:"ArtifactRevision",kind:"LinkedField",name:"artifactRevision",plural:!1,selections:[{alias:null,args:null,kind:"ScalarField",name:"status",storageKey:null},{alias:null,args:null,kind:"ScalarField",name:"id",storageKey:null}],storageKey:'artifactRevision(id:"test-id")'}]},params:{cacheID:"a4f1d2b684ddc6be1d5616d50d8506e1",id:null,metadata:{},name:"BAIArtifactStatusBadgeStoriesQuery",operationKind:"query",text:`query BAIArtifactStatusBadgeStoriesQuery {
  artifactRevision(id: "test-id") {
    ...BAIArtifactStatusBadgeFragment
    id
  }
}

fragment BAIArtifactStatusBadgeFragment on ArtifactRevision {
  status
}
`}}})();ie.hash="d7b63c13ed92e6096642716d77225775";const ve={title:"Fragments/BAIArtifactStatusBadge",component:ne,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:`
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
        `}}}},r=()=>{const{artifactRevision:t}=ce.useLazyLoadQuery(ie,{});return t&&e.jsx(ne,{artifactRevisionFrgmt:t})},a={name:"Available",parameters:{docs:{description:{story:"Displays an artifact revision with AVAILABLE status."}}},render:()=>e.jsx(s,{mockResolvers:{ArtifactRevision:()=>({status:"AVAILABLE"})},children:e.jsx(r,{})})},n={parameters:{docs:{description:{story:"Displays an artifact revision with PULLING status."}}},render:()=>e.jsx(s,{mockResolvers:{ArtifactRevision:()=>({status:"PULLING"})},children:e.jsx(r,{})})},i={parameters:{docs:{description:{story:"Displays an artifact revision with PULLED status."}}},render:()=>e.jsx(s,{mockResolvers:{ArtifactRevision:()=>({status:"PULLED"})},children:e.jsx(r,{})})},o={parameters:{docs:{description:{story:"Displays an artifact revision with VERIFYING status."}}},render:()=>e.jsx(s,{mockResolvers:{ArtifactRevision:()=>({status:"VERIFYING"})},children:e.jsx(r,{})})},c={parameters:{docs:{description:{story:"Displays an artifact revision with SCANNED status."}}},render:()=>e.jsx(s,{mockResolvers:{ArtifactRevision:()=>({status:"SCANNED"})},children:e.jsx(r,{})})},l={parameters:{docs:{description:{story:"Displays an artifact revision with NEEDS_APPROVAL status."}}},render:()=>e.jsx(s,{mockResolvers:{ArtifactRevision:()=>({status:"NEEDS_APPROVAL"})},children:e.jsx(r,{})})},d={parameters:{docs:{description:{story:"Displays an artifact revision with REJECTED status."}}},render:()=>e.jsx(s,{mockResolvers:{ArtifactRevision:()=>({status:"REJECTED"})},children:e.jsx(r,{})})},u={parameters:{docs:{description:{story:"Displays an artifact revision with FAILED status."}}},render:()=>e.jsx(s,{mockResolvers:{ArtifactRevision:()=>({status:"FAILED"})},children:e.jsx(r,{})})},p={parameters:{docs:{description:{story:"Displays all available artifact status variants."}}},render:()=>{const t=["AVAILABLE","PULLING","PULLED","VERIFYING","SCANNED","NEEDS_APPROVAL","REJECTED","FAILED"];return e.jsx(oe,{direction:"column",gap:"md",children:t.map(m=>e.jsx(s,{mockResolvers:{ArtifactRevision:()=>({status:m})},children:e.jsx(r,{})},m))})}};var R,y,A,v,f;a.parameters={...a.parameters,docs:{...(R=a.parameters)==null?void 0:R.docs,source:{originalSource:`{
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
}`,...(g=(L=n.parameters)==null?void 0:L.docs)==null?void 0:g.source},description:{story:"Story showing PULLING status.",...(S=(D=n.parameters)==null?void 0:D.docs)==null?void 0:S.description}}};var I,N,h,B,P;i.parameters={...i.parameters,docs:{...(I=i.parameters)==null?void 0:I.docs,source:{originalSource:`{
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
}`,...(h=(N=i.parameters)==null?void 0:N.docs)==null?void 0:h.source},description:{story:"Story showing PULLED status.",...(P=(B=i.parameters)==null?void 0:B.docs)==null?void 0:P.description}}};var F,k,x,V,w;o.parameters={...o.parameters,docs:{...(F=o.parameters)==null?void 0:F.docs,source:{originalSource:`{
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
}`,...(x=(k=o.parameters)==null?void 0:k.docs)==null?void 0:x.source},description:{story:"Story showing VERIFYING status.",...(w=(V=o.parameters)==null?void 0:V.docs)==null?void 0:w.description}}};var j,U,C,G,Q;c.parameters={...c.parameters,docs:{...(j=c.parameters)==null?void 0:j.docs,source:{originalSource:`{
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
}`,...(C=(U=c.parameters)==null?void 0:U.docs)==null?void 0:C.source},description:{story:"Story showing SCANNED status.",...(Q=(G=c.parameters)==null?void 0:G.docs)==null?void 0:Q.description}}};var T,O,_,b,J;l.parameters={...l.parameters,docs:{...(T=l.parameters)==null?void 0:T.docs,source:{originalSource:`{
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
}`,...(W=(M=u.parameters)==null?void 0:M.docs)==null?void 0:W.source},description:{story:"Story showing FAILED status.",...(Z=(X=u.parameters)==null?void 0:X.docs)==null?void 0:Z.description}}};var ee,se,re,te,ae;p.parameters={...p.parameters,docs:{...(ee=p.parameters)==null?void 0:ee.docs,source:{originalSource:`{
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
}`,...(re=(se=p.parameters)==null?void 0:se.docs)==null?void 0:re.source},description:{story:"Story showing all status variants together.",...(ae=(te=p.parameters)==null?void 0:te.docs)==null?void 0:ae.description}}};const fe=["Default","Pulling","Pulled","Verifying","Scanned","NeedsApproval","Rejected","Failed","AllStatuses"];export{p as AllStatuses,a as Default,u as Failed,l as NeedsApproval,i as Pulled,n as Pulling,d as Rejected,c as Scanned,o as Verifying,fe as __namedExportsOrder,ve as default};
