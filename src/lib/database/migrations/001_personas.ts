import { type Kysely, sql } from 'kysely'
import { addComment, createTable } from '../helpers.js'

export async function up(db: Kysely<Record<string, never>>): Promise<void> {
  await sql`CREATE SCHEMA IF NOT EXISTS personas`.execute(db)

  await createTable(db, 'personas', 'personas', (builder) =>
    builder
      .addColumn('name', 'text', (col) => col.notNull())
      .addColumn('system_prompt', 'text', (col) => col.notNull())
      .addColumn('language', sql`language`, (col) =>
        col.notNull().defaultTo('en')
      )
  )

  await addComment(
    db,
    'TABLE',
    'personas.personas',
    'Personas and their associated system prompts'
  )

  await createTable(db, 'personas', 'modifiers', (builder) =>
    builder
      .addColumn('persona_id', 'bigint', (col) => col.notNull())
      .addForeignKeyConstraint(
        'fk_model_persona',
        ['persona_id'],
        'personas.personas',
        ['id'],
        (cb) => cb.onDelete('cascade')
      )
      .addColumn('name', 'text', (col) => col.notNull())
      .addColumn('system_prompt_modifier', 'text', (col) => col.notNull())
  )

  await addComment(db, 'TABLE', 'personas.modifiers', 'Personas modifiers')

  await db
    .insertInto('personas.personas')
    .values({
      name: 'Tavrik',
      system_prompt: 'You are Tavrik, a helpful assistant.',
    })
    .returning('id')
    .executeTakeFirstOrThrow()

  await db
    .insertInto('personas.personas')
    .values({
      name: 'Tavrik',
      system_prompt: 'Du bist Tavrik, ein hilfreicher Assistent.',
      language: 'de',
    })
    .returning('id')
    .executeTakeFirstOrThrow()

  await createTable(db, 'personas', 'user_profiles', (builder) =>
    builder
      .addColumn('name', 'text', (col) => col.notNull())
      .addColumn('profile', 'text', (col) => col.notNull())
      .addColumn('language', sql`language`, (col) =>
        col.notNull().defaultTo('en')
      )
  )

  await addComment(db, 'TABLE', 'personas.user_profiles', 'User profiles')

  await db
    .insertInto('personas.user_profiles')
    .values({
      name: 'USER',
      profile: '## USERPROFILE',
      language: 'en',
    })
    .executeTakeFirstOrThrow()

  await db
    .insertInto('personas.user_profiles')
    .values({
      name: 'USER',
      profile: '## USERPROFIL',
      language: 'de',
    })
    .executeTakeFirstOrThrow()
}

export async function down(db: Kysely<Record<string, never>>): Promise<void> {
  await sql`DROP SCHEMA IF EXISTS personas CASCADE`.execute(db)
}
