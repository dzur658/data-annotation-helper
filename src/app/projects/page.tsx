// app/projects/page.tsx
"use client";

import { useRouter } from "next/navigation";
import EntityPage from "../_components/entity-page";
import { useItems } from "../../lib/use-entity-items";

export default function ProjectsPage() {
  const router = useRouter();
  const { items, create, remove } = useItems("project");

  return (
    <EntityPage
      title="Projects"
      itemName="Project"
      items={items}
      onCreate={create}
      onDelete={remove}
      onSelect={(id) => router.push(`/projects/${id}/tasks`)}
    />
  );
}