import { z } from "zod";

const TemplateString = z.string();

const TemplateOrObject = z.union([TemplateString, z.record(z.any())]);

const BaseAction = z.object({
  type: z.string(),
  variable: z.string().optional(),
});

// Forward declaration for recursion
const Action: z.ZodType<any> = z.lazy(() =>
  z.union([
    TableDataSelectAction,
    TableRecordCreateAction,
    TableRecordUpdateAction,
    TableRelationAction,
    EntityCreateAction,
    EntityUpdateAction,
    VariableDefineAction,
    VariableUpdateAction,
    ConditionAction,
    TransactionAction,
    ResponseAction,
    ReturnAction,
    SystemEventAction,
    HandlerCallAction,
    SelectCallAction,
    TableRecordDeleteAction,
  ])
);

const TableDataSelectAction = BaseAction.extend({
  type: z.literal("TABLE_DATA_SELECT"),
  table: z.string(),
  where: z
    .object({
      condition: TemplateString,
      data: z.record(z.any()),
    })
    .optional(),
  outputType: z.enum(["single", "multiple"]).optional(),
  variable: z.string(),
});

const TableRecordCreateAction = BaseAction.extend({
  type: z.literal("TABLE_RECORD_CREATE"),
  table: z.string(),
  data: z.record(z.any()),
  variable: z.string().optional(),
});

const TableRecordUpdateAction = BaseAction.extend({
  type: z.literal("TABLE_RECORD_UPDATE"),
  table: z.string(),
  data: TemplateOrObject,
  where: z
    .object({
      condition: TemplateString,
      data: z.record(z.any()),
    })
    .optional(),
  variable: z.string().optional(),
});

const TableRecordDeleteAction = BaseAction.extend({
  type: z.literal("TABLE_RECORD_DELETE"),
  table: z.string(),
  where: z.object({
    condition: TemplateString,
    data: z.record(z.any()),
  }),
  variable: z.string().optional(),
});

const TableRelationAction = BaseAction.extend({
  type: z.literal("TABLE_RELATION"),
  table: z.string(),
  column: z.string(),
  where: z.object({
    condition: TemplateString,
    data: z.record(z.any()),
  }),
  ref: z.any(),
  operation: z.enum(["set", "unset", "add", "remove"]),
  variable: z.string().optional(),
});

const EntityCreateAction = BaseAction.extend({
  type: z.literal("ENTITY_CREATE"),
  entity: z.string(),
  data: z.record(z.any()),
  variable: z.string().optional(),
});

const EntityUpdateAction = BaseAction.extend({
  type: z.literal("ENTITY_UPDATE"),
  entity: z.string(),
  data: z.record(z.any()),
  where: z.object({
    condition: TemplateString,
    data: z.record(z.any()),
  }),
  variable: z.string().optional(),
});

const VariableDefineAction = BaseAction.extend({
  type: z.literal("VARIABLE_DEFINE"),
  name: z.string(),
  value: z.any(),
});

const VariableUpdateAction = BaseAction.extend({
  type: z.literal("VARIABLE_UPDATE"),
  variable: z.string(),
  value: TemplateOrObject,
});

const ConditionAction = BaseAction.extend({
  type: z.literal("CONDITION"),
  condition: TemplateString,
  onMatch: Action.array().optional(),
  onNotMatch: Action.array().optional(),
});

const TransactionAction = BaseAction.extend({
  type: z.literal("TRANSACTION"),
  actions: Action.array(),
  variable: z.string().optional(),
});

const ResponseAction = BaseAction.extend({
  type: z.literal("RESPONSE"),
  config: z.any(),
});

const ReturnAction = BaseAction.extend({
  type: z.literal("RETURN"),
  data: TemplateOrObject,
});

const SystemEventAction = BaseAction.extend({
  type: z.literal("SYSTEM_EVENT"),
  event: z.string(),
  data: z.any().optional(),
});

const HandlerCallAction = BaseAction.extend({
  type: z.literal("HANDLER_CALL"),
  handler: z.string(),
  data: TemplateOrObject,
  variable: z.string().optional(),
});

const SelectCallAction = BaseAction.extend({
  type: z.literal("SELECT_CALL"),
  select: z.string(),
  data: TemplateOrObject,
  variable: z.string().optional(),
});

export const HandlerSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  module: z.string(),
  permission: z.string().optional(),
  actions: Action.array(),
});
