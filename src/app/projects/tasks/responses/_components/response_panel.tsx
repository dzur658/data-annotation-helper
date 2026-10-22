export default function ResponsePanel({
  label,
  value,
  onChange,
  disabled,
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
}) {
  return (
    <div className="rounded-lg border border-gray-700 bg-neutral-800/50 p-4">
      <div className="mb-2 flex items-baseline justify-between">
        <label className="text-sm font-medium text-gray-300">{label}</label>
        <span className="text-xs text-gray-500">{value.length.toLocaleString()} chars</span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        autoFocus={autoFocus}
        placeholder={`Paste ${label.toLowerCase()} text…`}
        className="h-64 w-full resize-none rounded-md border border-gray-600 bg-neutral-900 p-3 text-sm text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-60"
      />
    </div>
  );
}