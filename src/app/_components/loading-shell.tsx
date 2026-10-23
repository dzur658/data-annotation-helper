interface LoadingShellProps {
  message: string;
  detail?: string;
}

export default function LoadingShell({ message, detail }: LoadingShellProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-neutral-900 text-neutral-100">
      <div
        role="status"
        aria-label={message}
        className="h-10 w-10 animate-spin rounded-full border-2 border-neutral-700 border-t-blue-500"
      />
      <div className="text-center">
        <p className="text-sm font-medium text-neutral-200">{message}</p>
        {detail && <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-neutral-500">{detail}</p>}
      </div>
    </div>
  );
}