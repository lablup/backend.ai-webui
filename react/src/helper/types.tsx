/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useLazyLoadQuery } from 'react-relay';

export type LazyLoadQueryOptions = ArgumentTypes<typeof useLazyLoadQuery>[2];

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
