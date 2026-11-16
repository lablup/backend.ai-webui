import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export interface BAIImageWithFallbackProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'onError'> {
    src: string;
    fallbackIcon: React.ReactNode;
    alt: string;
}
declare const BAIImageWithFallback: React.FC<BAIImageWithFallbackProps>;
export default BAIImageWithFallback;
