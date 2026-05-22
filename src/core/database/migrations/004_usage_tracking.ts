import { type Kysely, sql } from 'kysely'
import { createTable } from '../helpers.js'

export async function up(db: Kysely<Record<string, never>>): Promise<void> {
  await createTable(db, 'system', 'usage_tracking', (builder) =>
    builder
      .addColumn('model_id', 'bigint', (col) => col.notNull())
      .addForeignKeyConstraint(
        'usage_tracking_model_id_fk',
        ['model_id'],
        'provider.models',
        ['id'],
        (cb) => cb.onDelete('cascade')
      )
      .addColumn('function_name', 'text', (col) => col.notNull())
      .addColumn('in_tokens', 'integer', (col) => col.notNull().defaultTo(0))
      .addColumn('out_tokens', 'integer', (col) => col.notNull().defaultTo(0))
      .addColumn('source', sql`chats.message_source`, (col) => col.notNull())
  )
}

export async function down(db: Kysely<Record<string, never>>): Promise<void> {
  await db.schema.dropTable('system.usage_tracking').ifExists().execute()
}
