// app/projects/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import EntityPage from "../../../_components/entity-page";
import { useResponse } from "../../../../lib/use-response";
import { Suspense } from "react";

export default function TasksPage() {
  // const router = useRouter();

  const taskId = Number(useSearchParams().get("taskId"));

  const { responses, create, remove } = useResponse(taskId);

  return (
    <Suspense>
      <p>{responses?.length} responses</p>
    </Suspense>
  );
}