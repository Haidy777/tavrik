import { type CreateTableBuilder, type Kysely, sql } from 'kysely'

function withPrimaryKey<T extends string, C extends string>(
  builder: CreateTableBuilder<T, C>
): CreateTableBuilder<T, C | 'id'> {
  return builder.addColumn('id', 'bigint', (col) =>
    col.primaryKey().generatedAlwaysAsIdentity()
  )
}

function withTimestamps<T extends string, C extends string>(
  builder: CreateTableBuilder<T, C>
): CreateTableBuilder<T, C | 'created_at' | 'updated_at'> {
  return builder
    .addColumn('created_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .addColumn('updated_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
    )
}

async function createUpdatedAtTrigger(
  db: Kysely<Record<string, never>>,
  schema: string,
  table: string
): Promise<void> {
  await sql`
    CREATE OR REPLACE FUNCTION ${sql.ref(`${schema}.set_updated_at`)}()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql
  `.execute(db)

  await sql`
    CREATE TRIGGER trg_set_updated_at
    BEFORE UPDATE ON ${sql.ref(`${schema}.${table}`)}
    FOR EACH ROW
    EXECUTE FUNCTION ${sql.ref(`${schema}.set_updated_at`)}()
  `.execute(db)
}

export async function createTable(
  db: Kysely<Record<string, never>>,
  schema: string,
  table: string,
  columns: (
    builder: CreateTableBuilder<string, 'id' | 'created_at' | 'updated_at'>
  ) => CreateTableBuilder<string, string>
): Promise<void> {
  await columns(
    withTimestamps(
      withPrimaryKey(db.schema.withSchema(schema).createTable(table))
    )
  ).execute()

  await createUpdatedAtTrigger(db, schema, table)
}

type CommentTarget = 'TABLE' | 'COLUMN' | 'TYPE'

export async function addComment(
  db: Kysely<Record<string, never>>,
  target: CommentTarget,
  path: string,
  comment: string
): Promise<void> {
  await sql`COMMENT ON ${sql.raw(target)} ${sql.ref(path)} IS ${sql.lit(comment)}`.execute(
    db
  )
}
