// app/projects/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useResponse } from "../../../../lib/use-response";
import { Suspense } from "react";

import ResponseEditor from "./_components/response_editor";

import FlagWorkspace from "./_components/flag_workspace";

export default function ResponsesClient() {

  const taskId = Number(useSearchParams().get("taskId"));

  const { responses, refresh } = useResponse(taskId);

  if (responses === null) {
    // blank page for renders while fetching db
    return (
      <div className="min-h-screen bg-neutral-900"></div>
    );
  } else if (!responses.a || !responses.b) {
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
      <FlagWorkspace responses={responses} />
    </Suspense>
  );
}