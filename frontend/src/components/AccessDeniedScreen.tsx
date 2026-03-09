import React from 'react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { ShieldX, Home, LogIn } from 'lucide-react';
import LoginButton from './LoginButton';

interface AccessDeniedScreenProps {
  message?: string;
  showLogin?: boolean;
}

export default function AccessDeniedScreen({
  message = 'You do not have permission to access this page.',
  showLogin = true,
}: AccessDeniedScreenProps) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
        <ShieldX className="h-10 w-10 text-destructive" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold font-display">Access Denied</h2>
        <p className="text-muted-foreground max-w-md">{message}</p>
      </div>
      <div className="flex gap-3 flex-wrap justify-center">
        <Button variant="outline" asChild>
          <Link to="/"><Home className="h-4 w-4 mr-2" />Go Home</Link>
        </Button>
        {showLogin && <LoginButton />}
      </div>
    </div>
  );
}
