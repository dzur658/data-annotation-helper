import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import { env } from "~/env";
import * as schema from "./schema";

import { client } from "./client"; // your createClient() singleton

// export const db = drizzle(client, { schema });
