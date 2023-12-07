import { useBackendaiImageMetaData } from '../hooks';
import React from 'react';

const SessionKernelTag: React.FC<{
  image?: string | null;
  style?: React.CSSProperties;
  border?: boolean;
}> = ({ image, style = {} }, bordered) => {
  image = image || '';
  const [, { getImageAliasName, getBaseVersion, getBaseImage }] =
    useBackendaiImageMetaData();

  // const sessionTags = useMemo(() => {
  //   const tags = [];
  //   if (meta && image) {
  //     const specs = image.split("/");
  //     const name = (specs[2] || specs[1]).split(":")[0];
  //     if (name in meta.kernel_labels) {
  //       tags.push(meta.kernel_labels[name]);
  //     } else {
  //       const imageParts = image.split("/");
  //       // const registry = imageParts[0]; // hide registry (ip of docker registry is exposed)
  //       let namespace;
  //       let langName;
  //       if (imageParts.length === 3) {
  //         namespace = imageParts[1];
  //         langName = imageParts[2];
  //       } else if (imageParts.length > 3) {
  //         namespace = imageParts.slice(2, imageParts.length - 1).join("/");
  //         langName = imageParts[imageParts.length - 1];
  //       } else {
  //         namespace = "";
  //         langName = imageParts[1];
  //       }
  //       langName = langName.split(":")[0];
  //       langName = namespace ? namespace + "/" + langName : langName;
  //       tags.push([
  //         { category: "Env", tag: `${langName}`, color: "lightgrey" },
  //       ]);
  //     }
  //   }
  //   return tags;
  // }, [image, meta?.kernel_labels, image]);

  // const specs = image.split("/");
  // console.log(image, sessionTags);
  // const _tag = specs[specs.length - 1].split(':')[1];
  // const _tags = tag.split('-');
  // const baseversion = _tags[0];
  // const baseimage = _tags[1];

  // if (_tags[1] !== undefined) {
  //   sessions[objectKey].baseversion = tags[0];
  //   sessions[objectKey].baseimage = tags[1];
  //   sessions[objectKey].additional_reqs = tags.slice(1, tags.length).map((tag) => tag.toUpperCase());
  // } else if (sessions[objectKey].tag !== undefined) {
  //   sessions[objectKey].baseversion = sessions[objectKey].tag;
  // } else {
  //   sessions[objectKey].baseversion = tag;
  // }

  // const tag

  return (
    <>
      <div>{getImageAliasName(image)}</div>
      <div>{getBaseVersion(image)}</div>
      <div>{getBaseImage(image)}</div>
    </>
    // <>
    //   {_.map(sessionTags, (tag, i) =>
    //     _.map(tag, ({ category, color, tag }) => {
    //       if (category === "Env") {
    //         category = tag;
    //       }
    //       // if (category && rowData.item.baseversion) {
    //       //   item.tag = rowData.item.baseversion;
    //       // }
    //       return category;
    //     })
    //   )}
    //   {/* {JSON.stringify(meta?.kernel_labels)} */}
    // </>
  );
};

export default React.memo(SessionKernelTag);
