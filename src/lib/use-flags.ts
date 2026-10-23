"use client";

import { useEffect, useState } from "react";
// import { invoke } from "@tauri-apps/api/core"; // TODO(Rust): uncomment when wiring
import type { Flag } from "./types";

// TODO(Rust): delete once list_flags is wired
const MOCK_FLAGS: Flag[] = [
  {
    id: 1,
    responseId: 18, // set these to your real response ids when testing
    sentenceText:
      "Sioux Nation of Indians, the Court ruled that the 1877 seizure of the Black Hills violated the terms of the Fort Laramie Treaty and constituted a taking of property requiring just compensation.",
    flagType: "Mock",
    flagResolution: "unresolved",
    reasoningNote: "Treaty claim needs primary source verification.",
  },
  {
    id: 2,
    responseId: 101,
    sentenceText: "The Supreme Court declined to return the land itself.",
    flagType: "contradiction",
    flagResolution: "unresolved",
    reasoningNote: "Conflicts with paragraph two of Response B.",
  },
];

export function useFlags(taskId: number) {
  const [flags, setFlags] = useState<Flag[] | null>(null);

  const refresh = () => {
    // TODO(Rust): invoke<Flag[]>("list_flags", { taskId })
    //   → returns flags for BOTH responses of this task;
    //   Flag.responseId determines which response each belongs to.
    setFlags(MOCK_FLAGS);
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  const remove = (id: number) => {
    // TODO(Rust): invoke("delete_flag", { id }).then(refresh)
    setFlags((prev) => prev?.filter((f) => f.id !== id) ?? null);
  };

  return { flags, refresh, remove };
}