import { useParams, useSearchParams } from 'react-router-dom'
import ErrorView from '../components/error/ErrorView'
import type { AppErrorCode } from '../types/error'

interface ErrorPageProps {
  code?: AppErrorCode
}

export default function ErrorPage({ code }: ErrorPageProps) {
  const params = useParams<{ code?: string }>()
  const [searchParams] = useSearchParams()

  const resolvedCode: AppErrorCode = (code ||
    (params.code as AppErrorCode) ||
    (searchParams.get('code') as AppErrorCode) ||
    404) as AppErrorCode

  return <ErrorView code={resolvedCode} />
}
