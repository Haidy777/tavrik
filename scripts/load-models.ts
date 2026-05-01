import { loadAndStoreAvailableModel } from '../src/lib/provider'

;(async () => {
  await loadAndStoreAvailableModel()

  process.exit(0)
})()
