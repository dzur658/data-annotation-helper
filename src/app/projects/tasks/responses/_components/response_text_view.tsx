"use client";

import type { Flag } from "~/lib/types";

interface ResponseTextViewProps {
  label: string;
  text: string;
  flags: Flag[];              // flags belonging to THIS response
  selectedFlagId: number | null;
}

interface Match {
  flag: Flag;
  start: number;
  end: number;
}

export default function ResponseTextView({ label, text, flags, selectedFlagId }: ResponseTextViewProps) {
  // Locate every flag's sentence by exact substring match
  const matches: Match[] = flags
    .map((flag) => ({ flag, start: text.indexOf(flag.sentenceText) }))
    .filter((m): m is Match => m.start !== -1)
    .map((m) => ({ ...m, end: m.start + m.flag.sentenceText.length }))
    .sort((a, b) => a.start - b.start);

  // Flags whose text wasn't found — data drift, surfaced loudly in dev
  const unmatched = flags.filter((f) => !matches.some((m) => m.flag.id === f.id));
  if (unmatched.length > 0) {
    console.warn(`${label}: ${unmatched.length} flag sentence(s) not found in response text`, unmatched);
  }

  // Walk the text, emitting plain runs between matches
  const segments: Array<{ text: string; flag: Flag | null }> = [];
  let cursor = 0;
  for (const m of matches) {
    if (m.start < cursor) continue; // overlap with previous match — first flag wins
    if (m.start > cursor) segments.push({ text: text.slice(cursor, m.start), flag: null });
    segments.push({ text: text.slice(m.start, m.end), flag: m.flag });
    cursor = m.end;
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor), flag: null });

  return (
    <div className="flex min-h-0 flex-col rounded-lg border border-gray-700 bg-neutral-800/50 p-4">
      <h2 className="mb-3 text-sm font-semibold text-gray-300">{label}</h2>
      <p className="min-h-0 flex-1 overflow-y-auto text-sm leading-7 text-gray-200">
        {segments.map((segment, i) => {
          if (!segment.flag) return <span key={i}>{segment.text}</span>;

          const isPrimary = segment.flag.id === selectedFlagId;
          return (
            <span
              key={i}
              className={
                isPrimary
                  ? "rounded bg-blue-500/30 px-0.5 text-white"
                  : "rounded bg-blue-500/10 px-0.5"
              }
            >
              {segment.text}
            </span>
          );
        })}
      </p>
    </div>
  );
}