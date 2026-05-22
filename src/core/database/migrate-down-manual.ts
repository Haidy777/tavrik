import '../env.js'
import { migrateDown } from './migrate.js'

;(async () => {
  await migrateDown()

  process.exit(0)
})()
