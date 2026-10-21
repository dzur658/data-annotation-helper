import { useState, useEffect } from "react";

import { invoke } from "@tauri-apps/api/core";

import type { Response, Kind } from "./types";

export function useResponse(parentId: number, responseLabel?: string, responseText?: string) {
  const [responses, setResponses] = useState<Response[] | null>(null);

  const kind: Kind = "response";

  const refresh = () => {
    invoke<Response[]>("list_items", { kind, parentId })
      .then(setResponses)
      .catch((e) => console.error(`❌ get_response(${parentId}) failed:`, e));
  }

  useEffect(() => {
      refresh();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [kind, parentId]);
  
  const create = (responseLabel: string, responseText: string) => {
    const item = { kind, parentId, responseLabel, responseText };
    invoke("add_item", { item })
      .then(refresh)
      .catch((e) => console.error(`❌ add_response(${parentId}) failed:`, e));
  }

  const remove = (id: number) =>
    invoke("delete_item", { "item": { kind, id } })
      .then(() => refresh())
      .catch((e) => console.error(`❌ delete_response(${parentId}) failed:`, e));

  return { responses, create, remove };
}