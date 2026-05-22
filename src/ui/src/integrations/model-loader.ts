import { loadAndStoreAvailableModel } from '@tavrik/core/provider'
import type { AstroIntegration } from 'astro'

export default function modelLoader(): AstroIntegration {
  return {
    name: 'model-loader',
    hooks: {
      'astro:server:start': async () => {
        await loadAndStoreAvailableModel()
      },
    },
  }
}
