import { TavrikApiError, TavrikConnectionError } from './errors.js'
import type { NumericId } from './schemas.js'
import type { ConversationResponse, HealthResponse } from './types.js'

export interface TavrikClientOptions {
  baseUrl: string
  timeout?: number
}

export class TavrikClient {
  private readonly baseUrl: string
  private readonly timeout: number

  constructor(options: TavrikClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '')
    this.timeout = options.timeout ?? 5000
  }

  async connect(): Promise<HealthResponse> {
    const health = await this.health()
    if (health.status !== 'ok') {
      throw new TavrikConnectionError(`API reports ${health.status} status`)
    }
    return health
  }

  async health(): Promise<HealthResponse> {
    return this.request<HealthResponse>('GET', '/health')
  }

  get conversations() {
    return {
      getLatest: async (): Promise<ConversationResponse | null> => {
        try {
          return await this.request<ConversationResponse>(
            'GET',
            '/api/v1/conversations/latest'
          )
        } catch (err) {
          if (err instanceof TavrikApiError && err.statusCode === 404) {
            return null
          }
          throw err
        }
      },
      create: async (
        title?: string,
        chatModelId?: NumericId,
        personaId?: NumericId,
        personaModifierId?: NumericId,
        userProfileId?: NumericId,
        rollingSummaryEnabled?: boolean,
        rollingSummaryModelId?: NumericId,
        ephemeral?: boolean
      ): Promise<ConversationResponse> => {
        return await this.request<ConversationResponse>(
          'POST',
          '/api/v1/conversations',
          {
            title,
            chatModelId,
            personaId,
            personaModifierId,
            userProfileId,
            rollingSummaryEnabled,
            rollingSummaryModelId,
            ephemeral,
          }
        )
      },
    }
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(url, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      })

      if (!response.ok) {
        const text = await response.text().catch(() => 'Unknown error')
        throw new TavrikApiError(response.status, text)
      }

      return (await response.json()) as T
    } catch (err) {
      if (err instanceof TavrikApiError) throw err
      throw new TavrikConnectionError(`Failed to connect to ${url}`, {
        cause: err instanceof Error ? err : undefined,
      })
    } finally {
      clearTimeout(timer)
    }
  }
}
