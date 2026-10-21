import Link from "next/link";
import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";

import NewButton from "./_components/button";
import ProjectsPlaceholder from "./_components/project_placeholder";
import NewProjectDropdown from "./_components/floatForm";

export default function ProjectPage() {

  const [projectCreationOpen, setProjectCreationOpen] = useState(false);

  useEffect(() => {
    invoke<unknown[]>("list_projects")
      .then((rows) => console.log("✅ DB connected, rows:", rows))
      .catch((e) => console.error("❌ DB connection failed:", e));
  }, []);

  return (
    <div className="min-h-screen bg-black text-gray-100">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Projects
          </h1>
          <div className="relative">
            <NewButton buttonText="+ New Project" onClick={() => setProjectCreationOpen(!projectCreationOpen)} />
          {projectCreationOpen && <NewProjectDropdown />}
          </div>
        </div>

        {/* Projects section */}
        <div className="mt-8">
          <ProjectsPlaceholder />
        </div>
      </div>
    </div>
  );
}