import React, { useState, useEffect } from 'react';
import { X, FlaskConical } from 'lucide-react';
import { useGetProducts } from '../hooks/useQueries';

const DISMISS_KEY = 'demoBannerDismissed';

export default function DemoBanner() {
  const { data: products, isLoading } = useGetProducts();
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(DISMISS_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const hasProducts = (products?.length ?? 0) > 0;

  useEffect(() => {
    if (!hasProducts && !isLoading) {
      setDismissed(false);
      try {
        sessionStorage.removeItem(DISMISS_KEY);
      } catch {
        // ignore
      }
    }
  }, [hasProducts, isLoading]);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, 'true');
    } catch {
      // ignore
    }
  };

  if (isLoading || !hasProducts || dismissed) {
    return null;
  }

  return (
    <div
      role="alert"
      className="w-full bg-primary/10 border-b border-primary/20 text-primary px-4 py-2.5"
    >
      <div className="container mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <FlaskConical className="h-4 w-4 flex-shrink-0" />
          <span>
            <strong>Demo Mode:</strong> This app is running with sample data. Feel free to explore
            products, place orders, and try all features!
          </span>
        </div>
        <button
          onClick={handleDismiss}
          aria-label="Dismiss demo banner"
          className="flex-shrink-0 rounded-md p-1 hover:bg-primary/20 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
