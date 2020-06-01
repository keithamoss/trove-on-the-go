import { URL } from 'url'

export const isDev = () => process.env.NODE_ENV === 'development'

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const getFilenameFromPath = (path: string) => (path.includes('/') ? path.split('/').pop()! : path)

export const getFilenameFromURL = (url: string) => getFilenameFromPath(new URL(url).pathname)

export const getFilenameWithoutExtensionFromURL = (url: string) => getFilenameFromURL(url).replace(/\.[^/.]+$/, '')

export const getFilenameExtensionFromURL = (url: string) => {
  const filename = getFilenameFromURL(url)
  return filename.replace(getFilenameWithoutExtensionFromURL(url), '').substring(1)
}

export const getURLWithoutFilenameExtension = (url: string) => {
  const filename = getFilenameFromURL(url)
  return url.replace(filename, getFilenameWithoutExtensionFromURL(url))
}

// https://github.com/microsoft/TypeScript/issues/16069#issuecomment-557540056
export const isNotNull = <T>(it: T): it is NonNullable<T> => it != null
