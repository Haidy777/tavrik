export interface HealthResponse {
  status: 'ok' | 'degraded' | 'error'
  timestamp: string
  database: boolean
}
