import { useState, type SubmitEvent } from "react";

import NewButton from "./button";

interface NewItemDropdownProps {
  itemName: string;
  placeholder: string;
  onSubmit: (name: string) => void;
  onClose?: () => void;
}

export default function NewItemDropdown({ itemName, placeholder, onSubmit, onClose }: NewItemDropdownProps) {
  const [projectName, setProjectName] = useState("");

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;
    onSubmit(projectName.trim());
    setProjectName("");
  };

  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="absolute right-0 top-full z-20 mt-0 w-64 rounded-lg border border-gray-700 bg-black p-4 shadow-xl"
      >
        <label
          htmlFor="project-name"
          className="mb-2 block text-sm font-medium text-gray-300"
        >
          {itemName}
        </label>
        <input
          id="project-name"
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder={placeholder}
          autoFocus
          className="w-full rounded-md border border-gray-600 bg-neutral-900 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <div className="mt-4 flex justify-end">
          <NewButton buttonText="Create" type="submit" />
        </div>
      </form>
    </>
  );
}