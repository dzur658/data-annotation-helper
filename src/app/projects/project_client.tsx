// app/projects/page.tsx
"use client";

import { useRouter } from "next/navigation";
import EntityPage from "../_components/entity-page";
import { useItems } from "../../lib/use-entity-items";

import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";

import LoadingShell from "../_components/loading-shell";

type ModelStatus = "loading" | "ready" | "error";

export default function ProjectsClient() {
  const router = useRouter();
  const { items, create, remove } = useItems("project");

  // ensure model immediately before continuing
  const [status, setStatus] = useState<ModelStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  const ensure = () => {
    setStatus("loading");
    setError(null);
    invoke("ensure_model")
      .then(() => setStatus("ready"))
      .catch((e) => { setError(String(e)); setStatus("error"); });
  };

  useEffect(ensure, []);

  if (status === "loading") return (
    <LoadingShell message="Loading Decision Model" detail="Downloading or loading decision model (first run downloads 1.5 GB)" />
  );
  if (status === "error")
    return (
      <p>An error occurred while loading the decision model: {error}</p>
    );

  return (
    <EntityPage
      title="Projects"
      itemName="Project"
      items={items}
      onCreate={create}
      onDelete={remove}
      onSelect={(id) => router.push(`/projects/tasks?projectId=${id}`)}
    />
  );
}