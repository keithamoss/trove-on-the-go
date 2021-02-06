// eslint-disable-next-line import/no-unresolved
import { APIGatewayEvent } from 'aws-lambda'
import { S3 } from 'aws-sdk'
import { backOff } from 'exponential-backoff'
import fetch from 'node-fetch'
import pLimit from 'p-limit'
import sharp from 'sharp'
import { getObjectS3URL, getS3Bucket, s3ObjectExists } from '../../lib/aws'
import { callbackWithError, LambdaApiError } from '../../lib/response'
import { fetchWithTimeout, getStringParamFromQSOrNull, isLocalDev } from '../../lib/utils'
import { APIResponses } from '../../types'

// NOTICE
// The Zoomify code here is a reimplementation of parts of the dezoomify-py Python library
// https://github.com/lovasoa/dezoomify-py/blob/master/dezoomify.py

interface APIImageProperties {
  WIDTH: number
  HEIGHT: number
  NUMTILES: number
  NUMIMAGES: number
  VERSION: number
  TILESIZE: number
}

interface ImageDimensions {
  width: number
  height: number
  widthInTiles: number
  heightInTiles: number
}

interface TileURL {
  z: number
  x: number
  y: number
  url: string
}

interface TileResponse {
  top: number
  left: number
  input: Buffer
}

const getImageProperties = async (slwaItemId: string): Promise<APIImageProperties | null> => {
  const response = await fetch(`https://purl.slwa.wa.gov.au/${slwaItemId}/ImageProperties.xml`)

  if (response.status === 200) {
    const xml = await response.text()
    const regexp = /\b(\w+)\s*=\s*["']([^"']*)["']/g

    const imageProperties = xml
      .match(regexp)
      ?.map((item) => {
        const [prop, value] = item.split('=')
        return [prop, Number.parseFloat(value.replace(/"/g, ''))]
      })
      // Discard <?xml version="1.0"?>
      .filter((item) => item[0] !== 'version')

    if (imageProperties !== undefined) {
      return Object.fromEntries(imageProperties)
    }
  }

  return null
}

// Construct a list of all zoomlevels with sizes in tiles
// https://github.com/lovasoa/dezoomify-py/blob/master/dezoomify.py
const getZoomLevels = (imageProps: APIImageProperties): number[][] => {
  let locWidth = imageProps.WIDTH
  let locHeight = imageProps.HEIGHT
  const levels: number[][] = []

  do {
    const widthInTiles = Math.ceil(locWidth / imageProps.TILESIZE)
    const heightInTiles = Math.ceil(locHeight / imageProps.TILESIZE)
    levels.push([widthInTiles, heightInTiles])

    if (widthInTiles === 1 && heightInTiles === 1) {
      break
    }

    locWidth /= 2
    locHeight /= 2

    // eslint-disable-next-line no-constant-condition
  } while (true)

  // Make the 0th level the smallest zoom, and higher levels, higher zoom
  return levels.reverse()
}

const getImageDimensionsForZoomLevel = (
  zoomLevel: number,
  imageProps: APIImageProperties,
  zoomLevels: number[][]
): ImageDimensions => {
  const maxZoom = zoomLevels.length - 1

  // Get the number of tiles for the maximum zoom level
  // const [[maxWidthInTiles, maxHeightInTiles]] = zoomLevels.slice(-1)

  // Get the size at the requested zoom level
  const width = imageProps.WIDTH / 2 ** (maxZoom - zoomLevel)
  const height = imageProps.HEIGHT / 2 ** (maxZoom - zoomLevel)

  // Get the number of tiles at the requested zoom level
  const [widthInTiles, heightInTiles] = zoomLevels[zoomLevel]

  return {
    width,
    height,
    widthInTiles,
    heightInTiles,
  }
}

const getTileURLsToFetch = (
  zoomLevel: number,
  widthInTiles: number,
  heightInTiles: number,
  formatURL: (z: number, x: number, y: number) => string
): TileURL[] => {
  const tiles: TileURL[] = []
  for (let x = 0; x < widthInTiles; x += 1) {
    for (let y = 0; y < heightInTiles; y += 1) {
      tiles.push({
        z: zoomLevel,
        x,
        y,
        url: formatURL(zoomLevel, x, y),
      })
    }
  }
  return tiles
}

const app = async (
  event: APIGatewayEvent,
  callback: (error: LambdaApiError | null, result: APIResponses) => void
): Promise<void> => {
  if (isLocalDev() === false) {
    // eslint-disable-next-line
    console.info('queryStringParameters', event.queryStringParameters)
  }

  try {
    const s3 = new S3()
    const zoomLevelToFetch = 3

    const slwaItemId = getStringParamFromQSOrNull(event.queryStringParameters, 'slwaItemId')
    if (slwaItemId === null) {
      throw new Error('Could not find a valid SLWA Item Id')
    }

    const s3PathToPhoto = `photo_downloads/${slwaItemId}__z${zoomLevelToFetch}.jpg`
    const s3PathToPhotoURL = getObjectS3URL(s3PathToPhoto)

    if ((await s3ObjectExists(s3, s3PathToPhoto)) === true) {
      callback(null, {
        imageURL: s3PathToPhotoURL,
      })
      return
    }

    const imageProperties = await getImageProperties(slwaItemId)
    if (imageProperties === null) {
      throw new Error(`Failed fetching image properties for ${slwaItemId}`)
    }

    const zoomLevels = getZoomLevels(imageProperties)
    const imageDimensions = getImageDimensionsForZoomLevel(zoomLevelToFetch, imageProperties, zoomLevels)
    const { widthInTiles, heightInTiles } = imageDimensions

    const getSLWATileURL = (z: number, x: number, y: number) =>
      `https://purl.slwa.wa.gov.au/${slwaItemId}/TileGroup0/${z}-${x}-${y}.jpg`
    const tilePromises: Promise<TileResponse>[] = []
    const limit = pLimit(12)

    getTileURLsToFetch(zoomLevelToFetch, widthInTiles, heightInTiles, getSLWATileURL).forEach((tileURL: TileURL) =>
      tilePromises.push(
        limit(async () => {
          const response = await backOff(() => fetchWithTimeout(tileURL.url, 5000), { numOfAttempts: 3 })

          if (response === null || response.status !== 200) {
            throw new Error(`Failed fetch image tile ${tileURL.url} (Status = ${response?.status})`)
          }

          return {
            top: tileURL.y * imageProperties.TILESIZE,
            left: tileURL.x * imageProperties.TILESIZE,
            input: await response.buffer(),
          }
        })
      )
    )

    try {
      const tileImages = await Promise.all(tilePromises)

      const image = sharp({
        create: {
          width: Math.floor(imageDimensions.width),
          height: Math.floor(imageDimensions.height),
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        },
      })
        .composite(tileImages)
        .withMetadata()
        .jpeg({ quality: 100 })

      await s3
        .putObject({
          Bucket: getS3Bucket(),
          ContentType: 'image/jpeg',
          Key: s3PathToPhoto,
          Body: await image.toBuffer(),
        })
        .promise()
    } catch (err) {
      throw new Error(`Error building and uploading image: ${err}`)
    }

    callback(null, {
      imageURL: s3PathToPhotoURL,
    })
  } catch (e) {
    callbackWithError(`An error occurred handling the response. Message: ${e.message}`, callback)

    throw e
  }
}

export default app
