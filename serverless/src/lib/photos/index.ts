import { S3 } from 'aws-sdk'
import { backOff } from 'exponential-backoff'
import fetch from 'node-fetch'
import sharp from 'sharp'
import { TrovePhotoMetadata, TroveWork, TroveWorkIdentifier } from '../../types'
import { getObjectS3URL, getS3Bucket, s3GetObjectOrUndefined } from '../aws'
import { getSourceCatalogueURL } from '../trove'
import { getFilenameWithoutExtensionFromURL } from '../utils'

export const getS3PhotoObjectUniqueId = (workId: string, imageURL: string) =>
  `${workId}__${getFilenameWithoutExtensionFromURL(imageURL)}`

export const getS3PhotoFilenames = (workId: string, imageURL: string) => {
  const filename = getS3PhotoObjectUniqueId(workId, imageURL)
  return {
    metadata: `photos/${filename}/metadata.json`,
    original: `photos/${filename}/${filename}.jpg`,
    thumbnail: `photos/${filename}/${filename}_thumbnail.jpg`,
  }
}

const createPhotosFromResponseBuffer = (buffer: Buffer) => {
  const image = sharp(buffer).jpeg()
  return { original: image, thumbnail: image.clone().resize(200, null) }
}

export const copyPhotoToS3 = async (s3: S3, photo: TrovePhotoMetadata): Promise<TrovePhotoMetadata> => {
  // eslint-disable-next-line
  console.info(`Write ${photo.cataloguePhotoURL} to S3`)

  const {
    metadata: s3PathToPhotoMetadata,
    original: s3PathToOriginalPhoto,
    thumbnail: s3PathToPhotoThumbnail,
  } = getS3PhotoFilenames(photo.troveWorkId, photo.cataloguePhotoURL)

  const getPhotoFromSource = () => fetch(photo.cataloguePhotoURL)

  const response = await backOff(() => getPhotoFromSource(), {
    numOfAttempts: 5,
  })

  const { original: originalPhoto, thumbnail: thumbnailImage } = createPhotosFromResponseBuffer(await response.buffer())
  const originalPhotoMetdata = await originalPhoto.metadata()
  const { info: thumbnailMetadata, data: thumbnailImageData } = await thumbnailImage.toBuffer({
    resolveWithObject: true,
  })

  const s3ObjectJPEGParams = {
    Bucket: getS3Bucket(),
    ContentType: 'image/jpeg',
  }

  const photoMetadata: TrovePhotoMetadata = {
    ...photo,
    images: {
      original: {
        url: getObjectS3URL(s3PathToOriginalPhoto),
        width: originalPhotoMetdata.width!,
        height: originalPhotoMetdata.height!,
      },
      thumbnail: {
        url: getObjectS3URL(s3PathToPhotoThumbnail),
        width: thumbnailMetadata.width,
        height: thumbnailMetadata.height,
      },
    },
  }

  await Promise.all([
    s3
      .putObject({
        ...s3ObjectJPEGParams,
        // ContentDisposition: `inline; filename=${getFilenameFromPath(
        //   s3PathToOriginalPhoto
        // )}`,
        Key: s3PathToOriginalPhoto,
        Body: await originalPhoto.toBuffer(),
      })
      .promise(),
    s3
      .putObject({
        ...s3ObjectJPEGParams,
        // ContentDisposition: `inline; filename=${getFilenameFromPath(
        //   s3PathToPhotoThumbnail
        // )}`,
        Key: s3PathToPhotoThumbnail,
        Body: thumbnailImageData,
      })
      .promise(),
    s3
      .putObject({
        Bucket: getS3Bucket(),
        ContentType: 'application/json',
        Key: s3PathToPhotoMetadata,
        Body: JSON.stringify(photoMetadata),
      })
      .promise(),
  ])

  return photoMetadata
}

export const fetchPhotoMetadataFromS3 = async (
  s3: S3,
  work: TroveWork,
  identifier: TroveWorkIdentifier
): Promise<TrovePhotoMetadata> => {
  // eslint-disable-next-line
  console.info(`Checking ${identifier.value}`)
  const { metadata: s3PathToPhotoMetadata } = getS3PhotoFilenames(work.id, identifier.value)

  const metadataObject = await s3GetObjectOrUndefined(s3, s3PathToPhotoMetadata)
  if (metadataObject !== undefined && metadataObject.Body !== undefined) {
    return JSON.parse(metadataObject.Body.toString())
  }

  return {
    troveWorkId: work.id,
    troveWorkURL: work.troveUrl,
    catalogueURL: getSourceCatalogueURL(identifier),
    cataloguePhotoURL: identifier.value,
    caption: identifier.linktext,
    geo: null,
    images: null,
  }
}
