import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { db } from '../db.js'
import { migrateDown, migrateToLatest } from '../migrate.js'
import type { SettingName } from '../overrides.js'

const expectedSettings: SettingName[] = [
  'default_chat_model_id',
  'default_rolling_summary_model_id',
  'default_persona_id',
  'default_persona_modifier_id',
  'default_user_profile_id',
]

describe('database migrations', () => {
  beforeAll(async () => {
    await migrateToLatest()
  })

  afterAll(async () => {
    await migrateDown()
    await db.destroy()
  })

  describe('provider schema', () => {
    it('should create and seed providers', async () => {
      const result = await db
        .selectFrom('provider.providers')
        .selectAll()
        .execute()

      expect(result.length).toBeGreaterThanOrEqual(4)
    })

    it('should create and seed models', async () => {
      const result = await db
        .selectFrom('provider.models')
        .selectAll()
        .execute()

      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe('personas schema', () => {
    it('should create and seed personas', async () => {
      const result = await db
        .selectFrom('personas.personas')
        .selectAll()
        .execute()

      expect(result.length).toBeGreaterThan(0)
    })

    it('should create modifiers table', async () => {
      const result = await db
        .selectFrom('personas.modifiers')
        .selectAll()
        .execute()

      expect(result).toBeDefined()
    })

    it('should create user profiles table', async () => {
      const result = await db
        .selectFrom('personas.userProfiles')
        .selectAll()
        .execute()

      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe('chats schema', () => {
    it('should create conversations table', async () => {
      const result = await db
        .selectFrom('chats.conversations')
        .selectAll()
        .execute()

      expect(result).toBeDefined()
    })

    it('should create messages table', async () => {
      const result = await db.selectFrom('chats.messages').selectAll().execute()

      expect(result).toBeDefined()
    })
  })

  describe('system schema', () => {
    it('should create and seed all settings', async () => {
      const result = await db
        .selectFrom('system.settings')
        .select('name')
        .execute()

      const names = result.map((r) => r.name)

      for (const setting of expectedSettings) {
        expect(names).toContain(setting)
      }
    })
  })
})
