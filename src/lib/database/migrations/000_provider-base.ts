import { type Kysely, sql } from 'kysely'
import {
  ANTHROPIC_MODELS,
  GOOGLE_MODELS,
  type IModelInfo,
  OPEN_AI_MODELS,
} from '../../consts/provider-models.js'
import { addComment, createTable } from '../helpers.js'

async function createModels(
  db: Kysely<Record<string, never>>,
  providerId: number,
  models: IModelInfo[]
) {
  for (const {
    name,
    out_tokens_price,
    in_tokens_price,
    capabilities,
  } of models) {
    await db
      .insertInto('provider.models')
      .values({
        provider_id: providerId,
        name,
        in_tokens_price,
        out_tokens_price,
        capabilities: sql`ARRAY[${sql.join(capabilities.map((c) => sql`${c}`))}]::provider.model_capabilities[]`,
      })
      .execute()
  }
}

export async function up(db: Kysely<Record<string, never>>): Promise<void> {
  await sql`CREATE SCHEMA IF NOT EXISTS provider`.execute(db)

  await db.schema.createType('language').asEnum(['en', 'de']).execute()

  await addComment(
    db,
    'TYPE',
    'language',
    'Supported languages for prompts and other things'
  )

  await db.schema.createType('role').asEnum(['user', 'assistant']).execute()

  await addComment(db, 'TYPE', 'role', 'User or assistant role')

  await db.schema
    .withSchema('provider')
    .createType('provider_type')
    .asEnum([
      'openai',
      'anthropic',
      'openai-compatible',
      'openrouter',
      'google',
    ])
    .execute()

  await addComment(
    db,
    'TYPE',
    'provider.provider_type',
    'Supported native AI provider integrations'
  )

  await db.schema
    .withSchema('provider')
    .createType('model_capabilities')
    .asEnum(['text', 'tts', 'tools', 'embedding', 'vision'])
    .execute()

  await addComment(
    db,
    'TYPE',
    'provider.model_capabilities',
    'Supported model capabilities'
  )

  await createTable(db, 'provider', 'providers', (builder) =>
    builder
      .addColumn('type', sql`provider.provider_type`, (col) =>
        col.notNull().defaultTo('openai-compatible')
      )
      .addColumn('name', 'text', (col) => col.notNull())
      .addColumn('endpoint', 'text')
  )

  await addComment(
    db,
    'TABLE',
    'provider.providers',
    'AI provider configurations'
  )

  await createTable(db, 'provider', 'models', (builder) =>
    builder
      .addColumn('provider_id', 'bigint', (col) => col.notNull())
      .addForeignKeyConstraint(
        'fk_model_provider',
        ['provider_id'],
        'provider.providers',
        ['id'],
        (cb) => cb.onDelete('cascade')
      )
      .addColumn('name', 'text', (col) => col.notNull())
      .addColumn('capabilities', sql`provider.model_capabilities[]`, (col) =>
        col.notNull().defaultTo(sql`'{}'`)
      )
      .addColumn('in_tokens_price', 'numeric')
      .addColumn('out_tokens_price', 'numeric')
  )

  await addComment(
    db,
    'TABLE',
    'provider.models',
    'AI provider models and prices'
  )
  await addComment(
    db,
    'COLUMN',
    'provider.models.in_tokens_price',
    'Price per million input tokens'
  )
  await addComment(
    db,
    'COLUMN',
    'provider.models.out_tokens_price',
    'Price per million out tokens'
  )

  const openai = await db
    .insertInto('provider.providers')
    .values({
      type: 'openai',
      name: 'OpenAI',
    })
    .returning('id')
    .executeTakeFirstOrThrow()

  await createModels(db, openai.id, OPEN_AI_MODELS)

  const anthropic = await db
    .insertInto('provider.providers')
    .values({ type: 'anthropic', name: 'Anthropic', endpoint: '' })
    .returning('id')
    .executeTakeFirstOrThrow()

  await createModels(db, anthropic.id, ANTHROPIC_MODELS)

  const google = await db
    .insertInto('provider.providers')
    .values({
      type: 'google',
      name: 'Google GenAI',
    })
    .returning('id')
    .executeTakeFirstOrThrow()

  await createModels(db, google.id, GOOGLE_MODELS)

  await db
    .insertInto('provider.providers')
    .values({
      type: 'openrouter',
      name: 'OpenRouter',
    })
    .executeTakeFirstOrThrow()
}

export async function down(db: Kysely<Record<string, never>>): Promise<void> {
  await sql`DROP SCHEMA IF EXISTS provider CASCADE`.execute(db)
  await db.schema.dropType('language').ifExists().execute()
  await db.schema.dropType('role').ifExists().execute()
}
