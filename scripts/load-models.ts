import { loadAndStoreAvailableModel } from '../src/core/provider'

;(async () => {
  await loadAndStoreAvailableModel()

  process.exit(0)
})()
