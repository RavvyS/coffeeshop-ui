// src/components/LoadingStates.tsx
import { Loader2, Coffee, Wifi, AlertTriangle, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export const LoadingSpinner = ({ size = 'md', text }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  };

  return (
    <div className="flex items-center gap-2">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
      {text && <span className="text-muted-foreground">{text}</span>}
    </div>
  );
};

export const PageLoader = ({ message = "Loading..." }: { message?: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/30 to-accent/10">
    <Card className="border-border/50">
      <CardContent className="p-8 text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto">
          <Coffee className="h-8 w-8 text-primary-foreground animate-pulse" />
        </div>
        <div>
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground mt-2">{message}</p>
        </div>
      </CardContent>
    </Card>
  </div>
);

export const ConnectionLoader = ({ isConnecting = true }: { isConnecting?: boolean }) => (
  <div className="flex items-center gap-2 text-sm">
    {isConnecting ? (
      <>
        <Wifi className="h-4 w-4 text-yellow-500 animate-pulse" />
        <span className="text-muted-foreground">Connecting to server...</span>
      </>
    ) : (
      <>
        <Wifi className="h-4 w-4 text-red-500" />
        <span className="text-destructive">Connection failed</span>
      </>
    )}
  </div>
);

export const SkeletonLoader = ({ lines = 3 }: { lines?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="h-4 bg-muted rounded" style={{ width: `${Math.random() * 40 + 60}%` }} />
      </div>
    ))}
  </div>
);

interface NetworkErrorProps {
  onRetry?: () => void;
  message?: string;
}

export const NetworkError = ({ 
  onRetry, 
  message = "Unable to connect to the server. Please check your internet connection." 
}: NetworkErrorProps) => (
  <Card className="border-destructive/50 bg-destructive/5">
    <CardContent className="p-4 text-center space-y-3">
      <AlertTriangle className="h-6 w-6 text-destructive mx-auto" />
      <p className="text-sm text-destructive">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      )}
    </CardContent>
  </Card>
);