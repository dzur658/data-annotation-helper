"use client";

import { useState } from "react";
import BackButton from "~/app/_components/back_button";
import FlagCard from "./flag_card";
import NewButton from "~/app/_components/button";
import ResponseTextView from "./response_text_view";
import { useFlags } from "~/lib/use-flags";
import type { ResponsePair } from "~/lib/types";

interface FlagWorkspaceProps {
  responses: ResponsePair; // the A/B pair from useResponse
}

export default function FlagWorkspace({ responses }: FlagWorkspaceProps) {
  const [view, setView] = useState<"text" | "grid">("text");
  const [active, setActive] = useState<"A" | "B">("A");
  const [selectedFlagId, setSelectedFlagId] = useState<number | null>(null);

  const switchResponse = (label: "A" | "B") => {
    setActive(label);
    setSelectedFlagId(null);
  };

  const activeResponse = active === "A" ? responses.a : responses.b;
  const responseId = activeResponse?.id ?? 0;

  const { flags, remove } = useFlags(responseId);

  if (!activeResponse) return null;

  // Flags belong to a specific response — only show the active one's flags
  const activeFlags = flags?.filter((f) => f.responseId === activeResponse?.id) ?? [];

  return (
    <div className="flex h-screen flex-col bg-neutral-900 text-neutral-100">
      {/* Top bar: back arrow + view toggle */}
      <div className="mx-auto flex w-full max-w-7xl items-center gap-4 px-4 pt-6 sm:px-6 lg:px-8">
        <BackButton />
        <div className="flex gap-1">
          {(["text", "grid"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`rounded-md px-3 py-1.5 text-sm capitalize transition ${
                view === v
                  ? "bg-neutral-800 font-medium text-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {v} view
            </button>
          ))}
        </div>
      </div>

      {/* A / B title — clickable, doubles as a response switcher */}
      <div className="mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
        <h1 className="text-lg font-semibold">
          {(["A", "B"] as const).map((label) => (
            <button
              key={label}
              onClick={() => switchResponse(label)}
              className={`mr-3 transition ${
                active === label ? "text-white underline decoration-blue-500 decoration-2 underline-offset-4" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              Response {label.toUpperCase()}
            </button>
          ))}
        </h1>
      </div>

      {/* Main content */}
      <div className="mx-auto flex w-full max-w-7xl min-h-0 flex-1 flex-col px-4 py-4 sm:px-6 lg:px-8">
        {view === "text" ? (
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
            <ResponseTextView
              label={`Response ${active.toUpperCase()}`}
              text={activeResponse.responseText}
              flags={activeFlags}
              selectedFlagId={selectedFlagId}
            />
            <div className="flex min-h-0 flex-col gap-2 overflow-y-auto">
              {activeFlags.length === 0 ? (
                <p className="rounded-lg border border-dashed border-gray-700 p-4 text-center text-xs text-gray-500">
                  No flags on this response
                </p>
              ) : (
                activeFlags.map((flag) => (
                  <FlagCard
                    key={flag.id}
                    flag={flag}
                    selected={selectedFlagId === flag.id}
                    onSelect={(id) => setSelectedFlagId((prev) => (prev === id ? null : id))}
                    onDelete={remove}
                  />
                ))
              )}
            </div>
          </div>
        ) : (
          // TODO: grid view — flag cards in a masonry/grid layout, no text pane
          <div className="flex min-h-0 flex-1 items-center justify-center rounded-lg border border-dashed border-gray-700">
            <p className="text-sm text-gray-500">Grid view — coming soon</p>
          </div>
        )}
      </div>

      {/* Bottom bar: A ↔ B navigation */}
      <div className="mx-auto w-full max-w-7xl px-4 pb-6 sm:px-6 lg:px-8">
        <div className="flex justify-end">
          {active === "A" ? (
            <NewButton buttonText="Next: Response B →" onClick={() => switchResponse("B")} />
          ) : (
            <NewButton buttonText="← Back to Response A" onClick={() => switchResponse("A")} />
          )}
        </div>
      </div>
    </div>
  );
}