// app/projects/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import EntityPage from "../../_components/entity-page";
import { useItems } from "../../../lib/use-entity-items";
import { Suspense } from "react";

export default function TasksPage() {
  // const router = useRouter();

  const projectId = Number(useSearchParams().get("projectId"));

  const { items, create, remove } = useItems("task", projectId);

  return (
    <Suspense>
      <EntityPage
        title="Tasks"
        itemName="Task"
        items={items}
        onCreate={create}
        onDelete={remove}
        // onSelect={(id) => router.push(`/projects/${id}/tasks`)}
      />
    </Suspense>
  );
}