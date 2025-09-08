import Link from 'next/link';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';

interface ErrorDisplayProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  showErrorDetails?: boolean;
  error?: Error;
  className?: string;
}

export function ErrorDisplay({
  title,
  description,
  icon,
  actions,
  showErrorDetails = false,
  error,
  className = '',
}: ErrorDisplayProps) {
  return (
    <div className={`min-h-screen bg-background flex items-center justify-center ${className}`}>
      <div className="w-full px-page">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                {icon || (
                  <svg
                    className="h-6 w-6 text-destructive"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                    />
                  </svg>
                )}
              </div>
              <CardTitle>
                <Heading as="h1" size="h1">
                  {title}
                </Heading>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <Text tone="muted" className="text-base">
                {description}
              </Text>

              {actions && (
                <div className="flex flex-col sm:flex-row gap-3 justify-center">{actions}</div>
              )}

              {showErrorDetails && error && process.env.NODE_ENV === 'development' && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                    Error Details (Development)
                  </summary>
                  <pre className="mt-2 text-xs bg-muted p-3 rounded overflow-auto">
                    {error.message}
                    {error.stack && `\n\nStack Trace:\n${error.stack}`}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

interface UnauthorizedErrorProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function UnauthorizedError({
  message = "You don't have permission to access this resource. It may belong to a different organization.",
  onRetry,
  className,
}: UnauthorizedErrorProps) {
  return (
    <ErrorDisplay
      title="Access Denied"
      description={message}
      icon={
        <svg
          className="h-6 w-6 text-destructive"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
      }
      actions={
        <>
          <Button asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
          {onRetry && (
            <Button variant="outline" onClick={onRetry}>
              Try Again
            </Button>
          )}
        </>
      }
      className={className}
    />
  );
}

interface NotFoundErrorProps {
  message?: string;
  onRetry?: () => void;
  actions?: React.ReactNode;
  className?: string;
}

export function NotFoundError({
  message = "The resource you're looking for doesn't exist or may have been deleted.",
  onRetry,
  actions,
  className,
}: NotFoundErrorProps) {
  return (
    <ErrorDisplay
      title="Not Found"
      description={message}
      icon={
        <svg
          className="h-6 w-6 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
          />
        </svg>
      }
      actions={
        actions || (
          <>
            <Button asChild>
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
            {onRetry && (
              <Button variant="outline" onClick={onRetry}>
                Try Again
              </Button>
            )}
          </>
        )
      }
      className={className}
    />
  );
}

interface GenericErrorProps {
  error: Error;
  onRetry?: () => void;
  className?: string;
}

export function GenericError({ error, onRetry, className }: GenericErrorProps) {
  return (
    <ErrorDisplay
      title="Something went wrong"
      description="An unexpected error occurred. Please try again or contact support if the problem persists."
      icon={
        <svg
          className="h-6 w-6 text-destructive"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
      }
      actions={
        <>
          <Button asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
          {onRetry && (
            <Button variant="outline" onClick={onRetry}>
              Try Again
            </Button>
          )}
        </>
      }
      showErrorDetails
      error={error}
      className={className}
    />
  );
}
