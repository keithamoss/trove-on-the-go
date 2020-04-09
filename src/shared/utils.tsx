export const isDev = () => process.env.NODE_ENV === 'development'

export const getURLFileExtension = (url: string) => {
  const parsedURL = new URL(url)
  return parsedURL.pathname.includes('.')
    ? parsedURL.pathname.substr(parsedURL.pathname.indexOf('.'))
    : null
}

export const getImageMeta = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

export const getImageSize = async (url: string) => {
  const img = await getImageMeta(url)
  return {
    width: img.naturalWidth,
    height: img.naturalHeight,
  }
}
