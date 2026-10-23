"use client";

import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core"; // TODO(Rust): uncomment when wiring
import type { Flag } from "./types";

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