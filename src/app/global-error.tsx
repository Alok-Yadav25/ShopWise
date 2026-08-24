'use client';

export default function GlobalError({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- required by Next.js error boundary
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-6">
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#DC2626]/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-lg font-bold text-[#1A1A1A] mb-2">Something went wrong</h2>
          <p className="text-sm text-[#9CA3AF] mb-6">
            An unexpected error occurred. Your data is safe.
          </p>
          <button
            onClick={reset}
            className="px-6 py-3 rounded-xl bg-[#4F46E5] text-white text-sm font-medium hover:bg-[#3730A3] transition-colors"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
