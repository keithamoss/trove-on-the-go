import { APIResponses } from '../types'

export interface LambdaApiError {
  statusCode: number
}

export type LambdaApiResponse = {
  statusCode: number
  headers: Record<string, unknown>
  body: string
}

export const callbackWithError = (
  message: string,
  callback: (error: LambdaApiError | null, result: APIResponses) => void,
  statusCode = 500
): void => {
  callback({ statusCode }, { message })
}

export const makeResponse = (error: LambdaApiError | null, result: APIResponses): LambdaApiResponse => {
  const statusCode = (error && error.statusCode) || 200
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(result),
  }
}
