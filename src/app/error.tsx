'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center">
        <div className="w-14 h-14 rounded-2xl bg-danger/10 flex items-center justify-center mx-auto mb-4">
          <span className="text-xl">⚠️</span>
        </div>
        <h2 className="text-lg font-bold text-text-primary mb-2">Something went wrong</h2>
        <p className="text-sm text-text-muted mb-4">
          {error.message || 'An unexpected error occurred on this page.'}
        </p>
        {error.digest && (
          <p className="text-xs text-text-muted mb-4 font-mono">Error: {error.digest}</p>
        )}
        <button
          onClick={reset}
          className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
