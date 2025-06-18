import { z } from "zod";

const common = z.object({
  name: z.string(),
  nullable: z.boolean().optional(),
  default: z.any().optional(),
});

const scalarTypes = ["text", "numeric", "boolean", "timestamp with time zone", "jsonb", "varchar", "bigint", "int"] as const;

const nonRelationColumn = common.extend({
  type: z.enum(scalarTypes),
});

const relationColumn = common.extend({
  type: z.literal("relation"),
  relation: z.enum(["one-to-one", "one-to-many", "many-to-one", "many-to-many"]),
  ref: z.string(),
  onDelete: z.enum(["SET NULL", "CASCADE", "RESTRICT", "NO ACTION"]).optional(),
});

// 👇 only ONE schema per type value
const columnSchema = z.discriminatedUnion("type", [nonRelationColumn, relationColumn]);

export const entitySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  module: z.string(),
  columns: z.array(columnSchema),
});

export type EntityConfig = z.infer<typeof entitySchema>;
