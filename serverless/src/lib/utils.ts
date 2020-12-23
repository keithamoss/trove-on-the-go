import { URL } from 'url'

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
