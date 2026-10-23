# Data Annotation Helper

A desktop app for reviewing, pairing, and flagging AI-generated responses.
Built as a local-first Tauri application; the database lives on your machine,
and all analysis runs locally.

## What it does

Organizes work as a four-level hierarchy:

```
Projects → Tasks → Responses (A/B pairs) → Flags
```

- **Projects** and **Tasks** allow you to organize analysis across multiple projects and tasks
- Each **Task** gets one A/B response pair, pasted in and analyzed via "Check for Citations."
- **Flags** mark specific sentences within a response (either auto generated, or human generated), each with a resolution status and reasoning note.
- The **flag workspace** shows the response text with flagged sentences
  highlighted — click a flag card to focus its sentence.

## Stack

| Layer      | Tech                                        |
| ---------- | ------------------------------------------- |
| Shell      | Tauri v2 (Rust)                             |
| Frontend   | Next.js 15 (App Router, static export) + Tailwind |
| Database   | SQLite, accessed exclusively via Rust backend |
| State      | React hooks + `invoke` — no client state library |

## Getting started

Prerequisites: **Node 22 LTS**, **pnpm**, **Rust** (with the [Tauri v2
prerequisites](https://tauri.app/start/prerequisites/) for your platform).

```bash
pnpm install
pnpm tauri dev      # dev mode — hot reload on both sides
```

> Note: dev mode is noticeably slower than the packaged app (React StrictMode,
> unoptimized Rust, on-demand compilation). Judge performance on a release build.

## Building

```bash
pnpm tauri build    # packages everything → target/release/
```

## Architecture notes

**The frontend owns no database logic.** All persistence goes through Tauri
commands (`invoke`), dispatched by a `kind` parameter:

- `list_items` / `add_item` / `delete_item` — CRUD for every entity,
  keyed by `kind: "project" | "task" | "response" | "flag"`
- `add_response_pair_and_generate` — saves a task's A/B response pair and generates its
  flags in one atomic transaction

**URL scheme:** query params carry runtime ids (required for static export,
which can't prerender unknown dynamic routes):

```
/projects
/projects/tasks?projectId=3
/projects/tasks/responses?taskId=7
```

**Data flow:** one direction. Pages own their data via hooks
(`useItems`, `useResponse`, `useFlags`); child components receive data as
props and report events up via callbacks. The URL is the source of truth for
navigation state.

## Status / known limitations

- [x] Projects & tasks CRUD
- [x] Response pair creation + citation analysis
- [x] Flag workspace: text view, sentence highlighting, A/B toggle
- [ ] Grid view for flags (stubbed)
- [ ] Manual flag creation/editing (currently analysis-generated only)
- [ ] `list_items` returns different shapes per `kind` — worth splitting
      into per-entity commands
- [ ] Sentence highlighting relies on exact text match; storing sentence
      indices at flag-creation time would make it exact

NOTE: This is a Work In Progress currently; expect a dev environment.