import { type Item } from "../../lib/types";

interface ItemListProps {
  items: Item[];
  onDelete?: (id: number) => void;
  onSelect?: (id: number) => void;
}

function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function ItemRow({ item, onDelete, onSelect }: { item: Item; onDelete?: (id: number) => void; onSelect?: (id: number) => void }) {
  return (
    <div className="group flex items-center justify-between border-b border-gray-800 px-4 py-3 transition-colors last:border-b-0 hover:bg-gray-800/60">
      <span className="truncate text-sm text-gray-200">{item.name}</span>
      <button
        onClick={(e) => {
            e.stopPropagation(); // Prevent triggering onSelect when clicking delete
            onDelete?.(item.id);
        }}
        aria-label={`Delete item ${item.name}`}
        className="rounded-md p-1.5 text-gray-500 opacity-0 transition hover:bg-red-500/10 hover:text-red-400 focus:opacity-100 focus:outline-none group-hover:opacity-100"
      >
        <TrashIcon />
    </button>
    </div>
  );
}

export default function ItemList({ items, onDelete }: ItemListProps) {
  // --- Tauri wiring placeholder ---
  // const projects = await invoke<Project[]>("get_projects");
  // const handleDelete = (id: number) => invoke("delete_project", { id });
  // --------------------------------

  if (items.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed border-gray-700 bg-neutral-800/50">
        <p className="text-sm text-gray-500">No items yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-700 bg-neutral-800/50">
      {items.map((item) => (
        <ItemRow key={item.id} item={item} onDelete={onDelete} />
      ))}
    </div>
  );
}