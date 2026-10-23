"use client";

import type { Flag } from "~/lib/types";

interface FlagCardProps {
  flag: Flag;
  selected: boolean;
  onSelect: (id: number) => void;
  onDelete?: (id: number) => void;
}

export default function FlagCard({ flag, selected, onSelect, onDelete }: FlagCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(flag.id)}
      onKeyDown={(e) => e.key === "Enter" && onSelect(flag.id)}
      className={`group relative cursor-pointer rounded-lg border p-3 text-left transition-colors ${
        selected
          ? "border-blue-500 bg-blue-500/10"
          : "border-gray-700 bg-neutral-800/50 hover:border-gray-600 hover:bg-neutral-800"
      }`}
    >
      <div className="flex pt-2 items-center justify-between gap-2">
        <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-xs font-medium text-blue-400">
          {flag.flagType}
        </span>
        <span className="text-xs text-gray-500">{flag.flagResolution}</span>
      </div>

      <p className="mt-2 line-clamp-2 text-sm italic leading-snug text-gray-300">
        “{flag.sentenceText}”
      </p>

      {flag.reasoningNote && (
        <p className="mt-2 line-clamp-2 text-xs leading-snug text-gray-500">
          {flag.reasoningNote}
        </p>
      )}

      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation(); // don't select while deleting
            onDelete(flag.id);
          }}
          aria-label={`Delete flag ${flag.id}`}
          className="absolute mb-2 right-0 top-0 rounded p-1 text-gray-600 opacity-0 transition hover:text-red-400 focus:opacity-100 group-hover:opacity-100"
        >
          {/* small × — swap for TrashIcon if you export it from itemListing */}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}