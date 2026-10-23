// app/projects/page.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import EntityPage from "../../../_components/entity-page";
import { useResponse } from "../../../../lib/use-response";
import { Suspense } from "react";

import ResponseEditor from "./_components/response_editor";

export default function TasksPage() {
  const router = useRouter();

  const taskId = Number(useSearchParams().get("taskId"));

  const { responses, refresh, create, remove } = useResponse(taskId);

  if (responses === null) {
    // blank page for renders while fetching db
    return (
      <div className="min-h-screen bg-neutral-900"></div>
    );
  } else if (responses?.length === 0) {
    // go to response creation page if no responses exist yet
    return (
      <Suspense>
        {/* <ResponseEditor taskId={Number(taskId)} /> */}
        <ResponseEditor taskId={Number(taskId)} onCompleted={refresh} />
      </Suspense>
    );
  }

  return (
    <Suspense>
      <p>TO FLAG WORKSPACE</p>
    </Suspense>
  );
}