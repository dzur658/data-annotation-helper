// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
// export const createTable = sqliteTableCreator(
//   (name) => `data-annotation-helper_${name}`,
// );

// export const posts = createTable(
//   "post",
//   (d) => ({
//     id: d.integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
//     name: d.text({ length: 256 }),
//     createdAt: d
//       .integer({ mode: "timestamp" })
//       .default(sql`(unixepoch())`)
//       .notNull(),
//     updatedAt: d.integer({ mode: "timestamp" }).$onUpdate(() => new Date()),
//   }),
//   (t) => [index("name_idx").on(t.name)],
// );

export const projects = sqliteTable("projects", {
  projectId: integer("projectId").primaryKey({ autoIncrement: true }),
  projectName: text("projectName").notNull(),
});

export const tasks = sqliteTable("tasks", {
  taskId: integer("taskId").primaryKey({ autoIncrement: true }),
  projectId: integer("projectId")
    .notNull()
    .references(() => projects.projectId, { onDelete: "cascade" }),
  taskName: text("taskName").notNull(),
});

export const responses = sqliteTable("responses", {
  responseId: integer("responseId").primaryKey({ autoIncrement: true }),
  taskId: integer("taskId")
    .notNull()
    .references(() => tasks.taskId, { onDelete: "cascade" }),
  responseLabel: text("responseLabel").notNull(),
  responseText: text("responseText").notNull(),
});

export const flags = sqliteTable("flags", {
  flagId: integer("flagId").primaryKey({ autoIncrement: true }),
  responseId: integer("responseId")
    .notNull()
    .references(() => responses.responseId, { onDelete: "cascade" }),
  sentenceText: text("sentenceText").notNull(),
  flagType: text("flagType").notNull(),
  flagResolution: text("flagResolution"),
  reasoningNote: text("reasoningNote"),
});
