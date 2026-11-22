import type { AppErrorCode, ErrorDetails } from '../types/error'

export const ERROR_CONFIGS: Record<AppErrorCode, ErrorDetails> = {
  400: {
    code: 400,
    statusCodeBadge: 'HTTP 400 // BAD_REQUEST',
    kicker: 'MALFORMED SYNTAX',
    title: 'Invalid Request',
    description: 'The request could not be processed. Please check your request and try again.',
    visualType: 'disconnected-signal',
    accentColor: 'amber',
    primaryAction: {
      label: 'Return Home',
      action: 'home',
      isPrimary: true,
    },
    secondaryAction: {
      label: 'Go Back',
      action: 'back',
    },
    retryable: false,
  },

  401: {
    code: 401,
    statusCodeBadge: 'HTTP 401 // UNAUTHORIZED',
    kicker: 'CREDENTIALS NEEDED',
    title: 'Authentication Required',
    description: 'You need to be authenticated to access this resource.',
    visualType: 'restricted-node',
    accentColor: 'violet',
    primaryAction: {
      label: 'Return Home',
      action: 'home',
      isPrimary: true,
    },
    secondaryAction: {
      label: 'Go Back',
      action: 'back',
    },
    retryable: false,
  },

  403: {
    code: 403,
    statusCodeBadge: 'HTTP 403 // FORBIDDEN',
    kicker: 'ACCESS DENIED',
    title: 'Access Restricted',
    description: "You don't have permission to access this resource.",
    visualType: 'restricted-node',
    accentColor: 'rose',
    primaryAction: {
      label: 'Return Home',
      action: 'home',
      isPrimary: true,
    },
    secondaryAction: {
      label: 'Go Back',
      action: 'back',
    },
    retryable: false,
  },

  404: {
    code: 404,
    statusCodeBadge: 'HTTP 404 // NOT_FOUND',
    kicker: 'LOST COORDINATES',
    title: 'Page Not Found',
    description: "The page you're looking for may have moved, been removed, or no longer exists.",
    visualType: 'lost-path',
    accentColor: 'cyan',
    primaryAction: {
      label: 'Return Home',
      action: 'home',
      isPrimary: true,
    },
    secondaryAction: {
      label: 'Go Back',
      action: 'back',
    },
    retryable: false,
  },

  429: {
    code: 429,
    statusCodeBadge: 'HTTP 429 // RATE_LIMITED',
    kicker: 'REQUEST FREQUENCY LIMIT',
    title: 'Slow Down a Little',
    description: 'Too many requests were made in a short period. Please wait a moment before trying again.',
    visualType: 'rate-limit',
    accentColor: 'amber',
    primaryAction: {
      label: 'Try Again',
      action: 'retry',
      isPrimary: true,
    },
    secondaryAction: {
      label: 'Return Home',
      action: 'home',
    },
    retryable: true,
    retryDelaySeconds: 12,
  },

  500: {
    code: 500,
    statusCodeBadge: 'HTTP 500 // SERVER_ERROR',
    kicker: 'CORE SYSTEM DISRUPTION',
    title: 'Something Went Wrong',
    description: 'An unexpected error occurred while loading this experience. Please try again.',
    visualType: 'system-disruption',
    accentColor: 'rose',
    primaryAction: {
      label: 'Try Again',
      action: 'retry',
      isPrimary: true,
    },
    secondaryAction: {
      label: 'Return Home',
      action: 'home',
    },
    retryable: true,
  },

  502: {
    code: 502,
    statusCodeBadge: 'HTTP 502 // BAD_GATEWAY',
    kicker: 'UPSTREAM SIGNAL LOST',
    title: 'Connection Interrupted',
    description: 'The service received an unexpected response. Please try again shortly.',
    visualType: 'disconnected-signal',
    accentColor: 'blue',
    primaryAction: {
      label: 'Retry',
      action: 'retry',
      isPrimary: true,
    },
    secondaryAction: {
      label: 'Return Home',
      action: 'home',
    },
    retryable: true,
  },

  503: {
    code: 503,
    statusCodeBadge: 'HTTP 503 // SERVICE_UNAVAILABLE',
    kicker: 'DORMANT SERVICE NODE',
    title: 'Temporarily Unavailable',
    description: 'This part of the portfolio is currently unavailable. Please check back later.',
    visualType: 'inactive-service',
    accentColor: 'violet',
    primaryAction: {
      label: 'Retry',
      action: 'retry',
      isPrimary: true,
    },
    secondaryAction: {
      label: 'Return Home',
      action: 'home',
    },
    retryable: true,
  },

  504: {
    code: 504,
    statusCodeBadge: 'HTTP 504 // GATEWAY_TIMEOUT',
    kicker: 'TRANSMISSION TIMEOUT',
    title: 'Taking Longer Than Expected',
    description: 'The request took too long to complete. Please try again.',
    visualType: 'gateway-timeout',
    accentColor: 'amber',
    primaryAction: {
      label: 'Retry',
      action: 'retry',
      isPrimary: true,
    },
    secondaryAction: {
      label: 'Return Home',
      action: 'home',
    },
    retryable: true,
  },

  network: {
    code: 'network',
    statusCodeBadge: 'ERR // NETWORK_DISCONNECTED',
    kicker: 'LINK SEVERED',
    title: 'Connection Interrupted',
    description: 'Unable to load the content right now. Check your connection and try again.',
    visualType: 'disconnected-signal',
    accentColor: 'cyan',
    primaryAction: {
      label: 'Retry',
      action: 'retry',
      isPrimary: true,
    },
    secondaryAction: {
      label: 'Return Home',
      action: 'home',
    },
    retryable: true,
  },

  data: {
    code: 'data',
    statusCodeBadge: 'ERR // DATA_UNAVAILABLE',
    kicker: 'RESOURCE LOAD FAILED',
    title: 'Unable to Load This Content',
    description: 'Something prevented this section from loading properly.',
    visualType: 'data-corrupt',
    accentColor: 'violet',
    primaryAction: {
      label: 'Retry Loading',
      action: 'retry',
      isPrimary: true,
    },
    secondaryAction: {
      label: 'Return to Portfolio',
      action: 'home',
    },
    retryable: true,
  },

  render: {
    code: 'render',
    statusCodeBadge: 'ERR // RENDERING_EXCEPTION',
    kicker: 'COMPONENT UNEXPECTED STATE',
    title: 'Something Went Wrong',
    description: 'An unexpected error occurred while loading this experience. Please try again.',
    visualType: 'system-disruption',
    accentColor: 'rose',
    primaryAction: {
      label: 'Try Again',
      action: 'retry',
      isPrimary: true,
    },
    secondaryAction: {
      label: 'Return Home',
      action: 'home',
    },
    retryable: true,
  },

  content: {
    code: 'content',
    statusCodeBadge: 'STATUS 404 // CONTENT_MISSING',
    kicker: 'RECORD NOT FOUND',
    title: 'Project Not Found',
    description: 'The requested project or resource could not be found.',
    visualType: 'lost-path',
    accentColor: 'cyan',
    primaryAction: {
      label: 'Return Home',
      action: 'home',
      isPrimary: true,
    },
    secondaryAction: {
      label: 'Go Back',
      action: 'back',
    },
    retryable: false,
  },
}

export function resolveErrorConfig(codeOrType: unknown): ErrorDetails {
  if (typeof codeOrType === 'number' && codeOrType in ERROR_CONFIGS) {
    return ERROR_CONFIGS[codeOrType as AppErrorCode]
  }

  if (typeof codeOrType === 'string') {
    const num = parseInt(codeOrType, 10)
    if (!isNaN(num) && num in ERROR_CONFIGS) {
      return ERROR_CONFIGS[num as AppErrorCode]
    }
    if (codeOrType in ERROR_CONFIGS) {
      return ERROR_CONFIGS[codeOrType as AppErrorCode]
    }
  }

  // Fallback to 404 if unrecognized
  return ERROR_CONFIGS[404]
}
