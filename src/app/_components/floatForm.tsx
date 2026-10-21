import { useState, type SubmitEvent } from "react";
import { invoke } from "@tauri-apps/api/core";

import NewButton from "./button";

export default function NewProjectDropdown() {
  const [projectName, setProjectName] = useState("");

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;
    invoke("add_project", { name: projectName.trim() });
    setProjectName("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="absolute right-0 top-full z-10 mt-2 w-64 rounded-lg border border-gray-700 bg-black p-4 shadow-xl"
    >
      <label
        htmlFor="project-name"
        className="mb-2 block text-sm font-medium text-gray-300"
      >
        Project Name:
      </label>
      <input
        id="project-name"
        type="text"
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
        placeholder="Glasswing"
        autoFocus
        className="w-full rounded-md border border-gray-600 bg-gray-900 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <div className="mt-4 flex justify-end">
        <NewButton buttonText="Create" type="submit" />
      </div>
    </form>
  );
}