import { Suspense } from "react";
import ProjectsClient from "./project_client";

export default function ProjectsPage() {
  return (
    <Suspense>
      <ProjectsClient />
    </Suspense>
  );
}