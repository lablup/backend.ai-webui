import { useBranding } from '../hooks/useBranding';
import { ChevronRight } from 'lucide-react';

interface DefaultHeaderLeftProps {
  pageTitle?: string;
}

export function DefaultHeaderLeft({ pageTitle }: DefaultHeaderLeftProps) {
  const { branding } = useBranding();
  const productName = branding?.productName;
  const brandName = branding?.brandName;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
      {brandName && (
        <strong style={{ fontSize: 15 }}>
          {brandName}
          {productName ? ` ${productName}` : ''}
        </strong>
      )}
      {pageTitle && (
        <>
          {brandName && (
            <ChevronRight
              size={14}
              aria-hidden="true"
              style={{ opacity: 0.5 }}
            />
          )}
          <span style={{ fontSize: 14, opacity: 0.85 }}>{pageTitle}</span>
        </>
      )}
    </div>
  );
}
