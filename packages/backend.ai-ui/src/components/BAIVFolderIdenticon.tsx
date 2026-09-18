/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { toGlobalId } from '../helper';
import './BAIVFolderIdenticon.css';
import { createAvatar } from '@dicebear/core';
import * as shapes from '@dicebear/shapes';
import classNames from 'classnames';
import React from 'react';

export interface BAIVFolderIdenticonProps extends Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  'src' | 'alt'
> {
  /**
   * Seed of the identicon. The host's Relay identicons seed on the node's
   * global id, so pass that to draw the same glyph as the folder lists.
   */
  seed?: string;
  /** Dashed vfolder UUID; seeds as the `VirtualFolderNode` global id. */
  vfolderId?: string;
}

/**
 * The folder glyph drawn next to a folder name. Decorative: the name beside
 * it is the accessible text, so `alt` is empty.
 */
const BAIVFolderIdenticon: React.FC<BAIVFolderIdenticonProps> = ({
  seed,
  vfolderId,
  className,
  ...imgProps
}) => {
  'use memo';
  const resolvedSeed =
    seed ?? (vfolderId ? toGlobalId('VirtualFolderNode', vfolderId) : '');
  const src = createAvatar(shapes, {
    seed: resolvedSeed,
    shape3: [],
  }).toDataUri();

  return (
    <img
      draggable={false}
      onDragStart={(e) => e.preventDefault()}
      {...imgProps}
      className={classNames('bai-vfolder-identicon', className)}
      src={src}
      alt=""
    />
  );
};

export default BAIVFolderIdenticon;
