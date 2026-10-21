"use client";

import Link from "next/link";
import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";

import ProjectPage from "./project_page";

export default function HomePage() {
  useEffect(() => {
    invoke<unknown[]>("list_projects")
      .then((rows) => console.log("✅ DB connected, rows:", rows))
      .catch((e) => console.error("❌ DB connection failed:", e));
  }, []);

  return (
    <main className="min-h-screen bg-black text-gray-100">
      <ProjectPage />
    </main>
  );
}
