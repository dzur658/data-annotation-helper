import { Suspense } from "react";
import TasksClient from "./task_client";

export default function TasksPage() {
  return (
    <Suspense>
      <TasksClient />
    </Suspense>
  );
}