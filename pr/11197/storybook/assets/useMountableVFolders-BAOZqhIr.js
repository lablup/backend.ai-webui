import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t,t as n}from"./compact-C9OPbfhP.js";import{r,t as i}from"./hooks-BKxbJOrt.js";import{n as a,t as o}from"./map-CLZMgxwS.js";import{n as s,t as c}from"./includes-DMTgV4pD.js";import{n as l,t as u}from"./sortBy-We-fx3CA.js";import{t as d}from"./compiler-runtime-DU4U6aph.js";import{t as f}from"./react-relay-CDKBZFrB.js";var p;function m(){return(m=e((()=>{p=(function(){var e=[{defaultValue:null,kind:`LocalArgument`,name:`autoMountScope`},{defaultValue:null,kind:`LocalArgument`,name:`limit`}],t=[{kind:`Variable`,name:`limit`,variableName:`limit`},{kind:`Literal`,name:`orderBy`,value:[{direction:`ASC`,field:`MOUNT_DESTINATION`}]},{kind:`Variable`,name:`scope`,variableName:`autoMountScope`}],n={alias:null,args:null,kind:`ScalarField`,name:`vfolderId`,storageKey:null},r={alias:null,args:null,kind:`ScalarField`,name:`mountDestination`,storageKey:null},i={alias:null,args:null,kind:`ScalarField`,name:`host`,storageKey:null},a={alias:null,args:null,kind:`ScalarField`,name:`status`,storageKey:null},o={alias:null,args:null,kind:`ScalarField`,name:`mountPermission`,storageKey:null},s={alias:null,args:null,concreteType:`VFolderMetadataInfo`,kind:`LinkedField`,name:`metadata`,plural:!1,selections:[{alias:null,args:null,kind:`ScalarField`,name:`name`,storageKey:null}],storageKey:null},c={alias:null,args:null,kind:`ScalarField`,name:`id`,storageKey:null};return{fragment:{argumentDefinitions:e,kind:`Fragment`,metadata:null,name:`useMountableVFoldersAutoMountedQuery`,selections:[{alias:null,args:t,concreteType:`VFolderAutoMountConnection`,kind:`LinkedField`,name:`scopedVfolderAutoMounts`,plural:!1,selections:[{alias:null,args:null,concreteType:`VFolderAutoMountEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`VFolderAutoMount`,kind:`LinkedField`,name:`node`,plural:!1,selections:[n,r,{alias:null,args:null,concreteType:`VFolder`,kind:`LinkedField`,name:`vfolder`,plural:!1,selections:[i,a,o,s],storageKey:null}],storageKey:null}],storageKey:null}],storageKey:null}],type:`Query`,abstractKey:null},kind:`Request`,operation:{argumentDefinitions:e,kind:`Operation`,name:`useMountableVFoldersAutoMountedQuery`,selections:[{alias:null,args:t,concreteType:`VFolderAutoMountConnection`,kind:`LinkedField`,name:`scopedVfolderAutoMounts`,plural:!1,selections:[{alias:null,args:null,concreteType:`VFolderAutoMountEdge`,kind:`LinkedField`,name:`edges`,plural:!0,selections:[{alias:null,args:null,concreteType:`VFolderAutoMount`,kind:`LinkedField`,name:`node`,plural:!1,selections:[n,r,{alias:null,args:null,concreteType:`VFolder`,kind:`LinkedField`,name:`vfolder`,plural:!1,selections:[i,a,o,s,c],storageKey:null},c],storageKey:null}],storageKey:null}],storageKey:null}]},params:{cacheID:`f553f5b4db42a327fbc947c97d1dd82d`,id:null,metadata:{},name:`useMountableVFoldersAutoMountedQuery`,operationKind:`query`,text:`query useMountableVFoldersAutoMountedQuery(
  $autoMountScope: VFolderAutoMountScope!
  $limit: Int!
) {
  scopedVfolderAutoMounts(scope: $autoMountScope, limit: $limit, orderBy: [{field: MOUNT_DESTINATION, direction: ASC}]) {
    edges {
      node {
        vfolderId
        mountDestination
        vfolder {
          host
          status
          mountPermission
          metadata {
            name
          }
          id
        }
        id
      }
    }
  }
}
`}}})(),p.hash=`ab64b58dfb000e45e958faf253600f6b`})))()}var h,g,_,v,y,b;function x(){return(x=e((()=>{m(),h=d(),i(),u(),s(),t(),o(),g=f(),_=e=>({host:{in:l(e)},status:{notIn:[`DELETE_COMPLETE`]}}),v={status:{notIn:[`DELETE_PENDING`,`DELETE_ONGOING`,`DELETE_ERROR`,`DELETE_COMPLETE`]}},y=100,b=e=>{"use memo";let t=(0,h.c)(15),{scope:i,mountableHosts:o}=e,[s,l]=r(),u;t[0]!==i.project||t[1]!==i.user?(u={autoMountScope:{project:i.project,user:i.user},limit:y},t[0]=i.project,t[1]=i.user,t[2]=u):u=t[2];let d;t[3]===s?d=t[4]:(d={fetchKey:s,fetchPolicy:`store-and-network`},t[3]=s,t[4]=d);let{scopedVfolderAutoMounts:f}=(0,g.useLazyLoadQuery)(p,u,d),m;if(t[5]!==o||t[6]!==f?.edges){let e;t[8]===o?e=t[9]:(e=e=>{let{node:t}=e;return t.vfolder?.status===`READY`&&t.vfolder.mountPermission!==`NONE`&&c(o,t.vfolder.host)?{vfolderId:t.vfolderId,name:t.vfolder.metadata.name,mountDestination:t.mountDestination}:null},t[8]=o,t[9]=e),m=n(a(f?.edges,e)),t[5]=o,t[6]=f?.edges,t[7]=m}else m=t[7];let _=m,v;t[10]===l?v=t[11]:(v=()=>l(),t[10]=l,t[11]=v);let b;return t[12]!==_||t[13]!==v?(b={autoMountedFolders:_,refetch:v},t[12]=_,t[13]=v,t[14]=b):b=t[14],b}})))()}export{b as i,_ as n,v as r,x as t};