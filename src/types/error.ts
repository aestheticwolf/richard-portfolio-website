export type HttpErrorCode = 400 | 401 | 403 | 404 | 429 | 500 | 502 | 503 | 504

export type AppErrorCode = HttpErrorCode | 'network' | 'data' | 'render' | 'content'

export type ErrorVisualType =
  | 'lost-path'           // 404 & content: disconnected coordinates, missing node
  | 'restricted-node'     // 401 & 403: subtle access boundary, lock perimeter
  | 'rate-limit'          // 429: pulse meter, restrained activity rings
  | 'system-disruption'   // 500 & render: disrupted core system node
  | 'disconnected-signal' // 502 & network: severed signal, broken bridge
  | 'inactive-service'    // 503: dormant service node in standby
  | 'gateway-timeout'     // 504: elongated ping pulse, expired signal
  | 'data-corrupt'        // data: unlinked cache / missing fragment

export type ErrorActionType = 'home' | 'back' | 'retry' | 'custom'

export interface ErrorAction {
  label: string
  action: ErrorActionType
  href?: string
  onClick?: () => void | Promise<void>
  isPrimary?: boolean
}

export interface ErrorDetails {
  code: AppErrorCode
  statusCodeBadge: string
  title: string
  description: string
  visualType: ErrorVisualType
  accentColor: 'violet' | 'blue' | 'rose' | 'amber' | 'cyan'
  primaryAction: ErrorAction
  secondaryAction?: ErrorAction
  retryable?: boolean
  retryDelaySeconds?: number
  kicker?: string
}
