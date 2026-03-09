import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin } from '../hooks/useQueries';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck } from 'lucide-react';

// Simplified role indicator — session role switching is not supported by the current backend.
export default function RoleSwitcher() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();

  if (!identity) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <Badge
        variant="outline"
        className="bg-card border-border shadow-md text-xs font-medium px-3 py-1.5 flex items-center gap-1.5"
      >
        {isAdmin ? (
          <>
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            Admin
          </>
        ) : (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            Customer
          </>
        )}
      </Badge>
    </div>
  );
}
