import { useState } from "react";

import NewButton from "./button";
import NewItemDropdown from "./floatForm";
import ItemList from "./itemListing";

import type { Item } from "../../lib/types";

import BackButton from "./back_button";

interface EntityPageProps {
  title: string;
  itemName: string;                      // "Project" / "Task"
  items: Item[] | null; // both tables fit this shape
  onCreate: (name: string) => void;
  onDelete: (id: number) => void;
  onSelect?: (id: number) => void;       // ← row click (project → task page)
}

export default function EntityPage({ title, itemName, items, onCreate, onDelete, onSelect }: EntityPageProps) {
  const [creationOpen, setCreationOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <BackButton />
          <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
          <NewButton buttonText={`+ NEW ${itemName}`} onClick={() => setCreationOpen(true)} />
        </div>

        <div className="relative mt-2">
          {creationOpen && (
            <NewItemDropdown
              itemName={itemName}
              placeholder={`${itemName} name`}
              onSubmit={onCreate}
              onClose={() => setCreationOpen(false)}
            />
          )}
        </div>
        <div className="mt-8">
          <ItemList items={items} onDelete={onDelete} onSelect={onSelect} />
        </div>
      </div>
    </div>
  );
}