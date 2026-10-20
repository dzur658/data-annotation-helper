import { createSchema } from "../server/db/create-schema";

let initPromise: Promise<void> | null = null;

// one time schema init
export function initApp(): Promise<void> {
  initPromise ??= (async () => {
    await createSchema();
  })();
  return initPromise;
}