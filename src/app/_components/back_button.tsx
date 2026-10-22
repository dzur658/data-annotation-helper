// app/_components/back-button.tsx
"use client";

import { useRouter, usePathname } from "next/navigation";

const KEEP_FOR_PARENT: Record<string, string[]> = {
    tasks: [],
    responses: ["projectId"],
}

export default function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length <= 1) {
    return <div className="mr-3 w-8" />;
  }

  const parentSegments = [...segments];
  parentSegments.pop();
  if (Number(parentSegments.at(-1))) parentSegments.pop();  // harmless if paths are static-only

  const parentPath = "/" + parentSegments.join("/");

  const handleClick = () => {
    const current = new URLSearchParams(window.location.search);
    const kept = new URLSearchParams();

    for (const name of KEEP_FOR_PARENT[segments.at(-1)!] ?? []) {
      const value = current.get(name);
      if (value !== null) kept.set(name, value);
    }

    const qs = kept.toString();

    router.push(qs ? `${parentPath}?${qs}` : parentPath);
  };

  return (
    <button
      onClick={handleClick}
      aria-label="Go back"
      className="mr-3 rounded-md p-1.5 text-gray-400 transition hover:bg-gray-800 hover: cursor-pointer hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-600"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <path d="m12 19-7-7 7-7" />
        <path d="M19 12H5" />
      </svg>
    </button>
  );
}