import { loadAndStoreAvailableModel } from '@tavrik/lib/provider'
import type { AstroIntegration } from 'astro'

export default function modelLoader(): AstroIntegration {
  return {
    name: 'model-loader',
    hooks: {
      'astro:server:start': async () => {
        await loadAndStoreAvailableModel()
      },
      'astro:build:done': async () => {
        await loadAndStoreAvailableModel()
      },
    },
  }
}
