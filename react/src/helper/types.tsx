import { useLazyLoadQuery } from 'react-relay';

export type LazyLoadQueryOptions = ArgumentTypes<typeof useLazyLoadQuery>[2];

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
