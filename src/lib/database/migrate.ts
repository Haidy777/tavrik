import { promises as fs } from 'node:fs'
import * as path from 'node:path'
import { FileMigrationProvider, Migrator } from 'kysely'
import { logger } from '../logger.js'
import { db } from './db.js'

const migrator = new Migrator({
  db,
  provider: new FileMigrationProvider({
    fs,
    path,
    migrationFolder: new URL('./migrations', import.meta.url).pathname,
  }),
})

export async function migrateToLatest() {
  const { error, results } = await migrator.migrateToLatest()

  for (const result of results ?? []) {
    if (result.status === 'Success') {
      logger.info(`migration "${result.migrationName}" executed successfully`)
    } else if (result.status === 'Error') {
      logger.error(`failed to execute migration "${result.migrationName}"`)
    }
  }

  if (error) {
    logger.error(error, 'failed to migrate')
    throw error
  }
}

export async function migrateDown() {
  const { error, results } = await migrator.migrateDown()

  for (const result of results ?? []) {
    if (result.status === 'Success') {
      logger.info(`migration "${result.migrationName}" reverted successfully`)
    } else if (result.status === 'Error') {
      logger.error(`failed to revert migration "${result.migrationName}"`)
    }
  }

  if (error) {
    logger.error(error, 'failed to migrate down')
    throw error
  }
}
