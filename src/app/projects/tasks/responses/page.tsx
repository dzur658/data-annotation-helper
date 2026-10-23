import { Suspense } from "react";
import ResponsesClient from "./responses_client";

export default function ResponsesPage() {
  return (
    <Suspense>
      <ResponsesClient />
    </Suspense>
  );
}