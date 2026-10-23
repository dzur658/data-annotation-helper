"use client";

import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core"; // TODO(Rust): uncomment when wiring
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

export function useFlags(responseId: number) {
  const [flags, setFlags] = useState<Flag[] | null>(null);

  const refresh = () => {
    invoke<Flag[]>("list_items", { kind: "flag", parentId: responseId })
      .then(setFlags)
      .catch((e) => console.error(`❌ list_items(flag) failed:`, e));
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [responseId]);

  const remove = (id: number) =>
    invoke("delete_item", { item: { kind: "flag", id } })
      .then(refresh)
      .catch((e) => console.error(`❌ delete_flag failed:`, e));

  return { flags, refresh, remove };
}