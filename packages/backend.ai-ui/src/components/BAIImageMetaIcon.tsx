import {
  BAIImageAnacondaIcon,
  BAIImageApacheSparkIcon,
  BAIImageCIcon,
  BAIImageCaffeIcon,
  BAIImageCaffe2Icon,
  BAIImageCppIcon,
  BAIImageFilebrowserIcon,
  BAIImageFluxIcon,
  BAIImageGccIcon,
  BAIImageGromacsIcon,
  BAIImageH2oIcon,
  BAIImageJuliaIcon,
  BAIImageLablupIcon,
  BAIImageMatlabIcon,
  BAIImageModularIcon,
  BAIImageMxnetIcon,
  BAIImageNvidiaIcon,
  BAIImageOctaveIcon,
  BAIImageOrbitIcon,
  BAIImagePythonIcon,
  BAIImagePytorchIcon,
  BAIImageRLangIcon,
  BAIImageRebelIcon,
  BAIImageRustIcon,
  BAIImageSftpIcon,
  BAIImageSglangIcon,
  BAIImageSwiftTensorflowIcon,
  BAIImageSwiftIcon,
  BAIImageTensorflowIcon,
  BAIImageTexliveIcon,
  BAIImageUbuntuIcon,
  BAIImageVllmIcon,
  BAIImageDefaultIcon,
} from '../icons/images';
import { useBAIImageMetaData } from './provider';
import React, { type ReactNode } from 'react';

/**
 * Bundled framework icon components keyed by the `icon` filename declared in
 * `image_metadata.json`'s `imageInfo`. Each entry is a `BAIImage*Icon` wrapper
 * (SVGs via `@ant-design/icons`, raster icons via `<img>`), mirroring the
 * bundled `src/icons` device-icon component pattern — the package never
 * resolves an app `resources/icons/` path.
 */
const knownImageIcons: Record<string, ReactNode> = {
  'anaconda.svg': <BAIImageAnacondaIcon />,
  'apache-spark.svg': <BAIImageApacheSparkIcon />,
  'c.svg': <BAIImageCIcon />,
  'caffe.png': <BAIImageCaffeIcon />,
  'caffe2.svg': <BAIImageCaffe2Icon />,
  'cpp.svg': <BAIImageCppIcon />,
  'filebrowser.svg': <BAIImageFilebrowserIcon />,
  'flux.png': <BAIImageFluxIcon />,
  'gcc.png': <BAIImageGccIcon />,
  'gromacs.svg': <BAIImageGromacsIcon />,
  'h2o.png': <BAIImageH2oIcon />,
  'julia.png': <BAIImageJuliaIcon />,
  'lablup.png': <BAIImageLablupIcon />,
  'matlab.png': <BAIImageMatlabIcon />,
  'modular.svg': <BAIImageModularIcon />,
  'mxnet.svg': <BAIImageMxnetIcon />,
  'nvidia.svg': <BAIImageNvidiaIcon />,
  'octave.png': <BAIImageOctaveIcon />,
  'orbit.svg': <BAIImageOrbitIcon />,
  'python.png': <BAIImagePythonIcon />,
  'pytorch.svg': <BAIImagePytorchIcon />,
  'r-lang.svg': <BAIImageRLangIcon />,
  'rebel.svg': <BAIImageRebelIcon />,
  'rust.svg': <BAIImageRustIcon />,
  'sftp.png': <BAIImageSftpIcon />,
  'sglang.svg': <BAIImageSglangIcon />,
  'swift-tensorflow.png': <BAIImageSwiftTensorflowIcon />,
  'swift.svg': <BAIImageSwiftIcon />,
  'tensorflow.png': <BAIImageTensorflowIcon />,
  'texlive.png': <BAIImageTexliveIcon />,
  'ubuntu.svg': <BAIImageUbuntuIcon />,
  'vllm.svg': <BAIImageVllmIcon />,
};

export interface BAIImageMetaIconProps {
  /** Full image name (e.g. `cr.backend.ai/multiarch/python:3.9-ubuntu20.04@x86_64`). */
  image?: string | null;
}

/**
 * v2/package counterpart of the React app's `ImageMetaIcon`. Resolves the
 * framework icon for an image from the image metadata provided via
 * `BAIMetaDataProvider`, using bundled icon components. Falls back to a default
 * icon when no metadata is available or the image is unknown.
 */
const BAIImageMetaIcon: React.FC<BAIImageMetaIconProps> = ({ image }) => {
  'use memo';
  const [, { getImageIconFileName }] = useBAIImageMetaData();
  const iconFile = getImageIconFileName(image);
  const icon = iconFile ? knownImageIcons[iconFile] : undefined;

  return <>{icon ?? <BAIImageDefaultIcon />}</>;
};

export default BAIImageMetaIcon;
