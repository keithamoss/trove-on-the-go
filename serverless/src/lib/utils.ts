import AbortController from 'abort-controller'
// eslint-disable-next-line import/no-unresolved
import { APIGatewayProxyEventQueryStringParameters } from 'aws-lambda'
import fetch, { Response } from 'node-fetch'
import { URL, URLSearchParams } from 'url'

export const isLocalDev = (): boolean => process.env.NODE_ENV === 'development' && process.env.IS_OFFLINE === 'true'

export const isDev = (): boolean => process.env.NODE_ENV === 'development'

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const getFilenameFromPath = (path: string): string => (path.includes('/') ? path.split('/').pop()! : path)

export const getFilenameFromURL = (url: string): string => getFilenameFromPath(new URL(url).pathname)

export const getFilenameWithoutExtensionFromURL = (url: string): string =>
  getFilenameFromURL(url).replace(/\.[^/.]+$/, '')

export const getFilenameExtensionFromURL = (url: string): string => {
  const filename = getFilenameFromURL(url)
  return filename.replace(getFilenameWithoutExtensionFromURL(url), '').substring(1)
}

export const getURLWithoutFilenameExtension = (url: string): string => {
  const filename = getFilenameFromURL(url)
  return url.replace(filename, getFilenameWithoutExtensionFromURL(url))
}

// https://github.com/microsoft/TypeScript/issues/16069#issuecomment-557540056
export const isNotNull = <T>(it: T): it is NonNullable<T> => it != null

// https://github.com/node-fetch/node-fetch#request-cancellation-with-abortsignal
export const fetchWithTimeout = async (url: string, timeout_ms: number): Promise<Response | null> => {
  const controller = new AbortController()
  const timeout = setTimeout(() => {
    controller.abort()
  }, timeout_ms)

  try {
    return fetch(url, { signal: controller.signal })
  } catch (error) {
    // if (error instanceof fetch.AbortError) {
    //   console.log('Request was aborted')
    // }
  } finally {
    clearTimeout(timeout)
  }

  return null
}

export const getStringParamFromQSOrNull = (
  query: APIGatewayProxyEventQueryStringParameters | null,
  name: string
): string | null => {
  if (query === null) {
    return null
  }

  const queryStringParams = new URLSearchParams(query)
  return queryStringParams.has(name) === true ? queryStringParams.get(name) : null
}
