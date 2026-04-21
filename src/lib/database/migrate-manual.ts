import '../env.js'
import { migrateToLatest } from './migrate.js'

;(async () => {
  await migrateToLatest()

  process.exit(0)
})()
