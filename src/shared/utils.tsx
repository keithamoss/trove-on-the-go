import { useLocation } from 'react-router-dom'
import { TrovePhotoImageSize } from '../api/types'

export const isDev = (): boolean => process.env.NODE_ENV === 'development'

export const getURLFileExtension = (url: string): string | null => {
  const parsedURL = new URL(url)
  return parsedURL.pathname.includes('.') ? parsedURL.pathname.substr(parsedURL.pathname.indexOf('.')) : null
}

export const getImageMeta = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })

export const getImageSize = async (url: string): Promise<TrovePhotoImageSize> => {
  const img = await getImageMeta(url)
  return {
    width: img.naturalWidth,
    height: img.naturalHeight,
  }
}

export const deduplicateArrayOfObjects = (array: Record<string, unknown>[], key: string): Record<string, unknown>[] =>
  array.filter((item, index, self) => self.findIndex((t) => t[key] === item[key]) === index)

// A custom hook that builds on useLocation to parse the query string for you.
export const useQuery = (): URLSearchParams => new URLSearchParams(useLocation().search)

export const getNumberParamFromQSOrNull = (query: URLSearchParams, name: string): number | null => {
  const n = query.get(name)
  return n !== null ? Number.parseInt(n, 10) : null
}
