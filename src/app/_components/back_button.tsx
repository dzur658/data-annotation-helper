// app/_components/back-button.tsx
"use client";

import { useRouter, usePathname } from "next/navigation";

export default function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean);

  // return place holder div if at the root page
  if (segments.length <= 1) return (
    <div className="mr-3 rounded-md p-1.5 text-gray-400 transition hover:bg-gray-800 hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-600"></div>
  );

  const parentSegments = [...segments];
  parentSegments.pop();                          // drop the kind segment ("tasks")

  const parentPath = "/" + parentSegments.join("/");

  return (
    <button
      onClick={() => router.push(parentPath)}
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