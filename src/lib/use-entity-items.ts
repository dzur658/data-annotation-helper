import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

import type { Item, Kind } from "./types";

export function useItems(kind: Kind, parentId?: number) {
  const [items, setItems] = useState<Item[] | null>(null);

  const refresh = () => {
    invoke<Item[]>("list_items", { kind, parentId })
      .then(setItems)
      .catch((e) => console.error(`❌ list_items(${kind}) failed:`, e));
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, parentId]);

  const create = (name: string) => {
    // console.log(`Creating ${kind} with id:`, parentId? `parentId=${parentId}` : "no parentId");
    const item = { kind, name, parentId };
    invoke("add_item", { item })
      .then(refresh)
      .catch((e) => console.error(`❌ add_item(${kind}) failed:`, e))};

  const remove = (id: number) =>
    invoke("delete_item", {"item": { kind, id }})
      .then(() => refresh())
      .catch((e) => console.error(`❌ delete_item(${kind}) failed:`, e));

  return { items, create, remove };
}