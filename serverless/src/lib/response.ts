export interface LambdaApiError {
  statusCode: number
}

export type LambdaApiResponse = {
  statusCode: number
  headers: object
  body: string
}

export const callbackWithError = (
  message: string,
  callback: Function,
  statusCode: number = 500,
) => {
  callback({ statusCode }, { message })
}

export const makeResponse = (
  error: LambdaApiError,
  result: object,
): LambdaApiResponse => {
  const statusCode = (error && error.statusCode) || 200
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(result),
  }
}
