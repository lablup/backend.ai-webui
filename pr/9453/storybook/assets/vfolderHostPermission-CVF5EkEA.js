/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */const r="mount-in-session",t={CREATE_VFOLDER:"create-vfolder",MODIFY_VFOLDER:"modify-vfolder",DELETE_VFOLDER:"delete-vfolder",MOUNT_IN_SESSION:r,UPLOAD_FILE:"upload-file",DOWNLOAD_FILE:"download-file",INVITE_OTHERS:"invite-others",SET_USER_PERM:"set-user-specific-permission"},n=e=>t[e]??e.toLowerCase().replace(/_/g,"-"),E=e=>{if(!e)return{};try{const o=JSON.parse(e);return typeof o=="object"&&o!==null?o:{}}catch{return{}}},c=e=>{const o={};for(const s of e??[])o[s.host]=s.permissions.map(n);return o};export{r as M,E as p,c as v};
