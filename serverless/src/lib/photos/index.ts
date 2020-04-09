import { S3 } from 'aws-sdk'
import { backOff } from 'exponential-backoff'
import fetch from 'node-fetch'
import sharp from 'sharp'
import { TrovePhoto, TroveWorkPhotoMetadataContainer } from '../../types'
import { getObjectS3URL, getS3Bucket, s3GetObjectOrUndefined } from '../aws'
import { getFilenameFromPath, getFilenameFromURL, getFilenameWithoutExtensionFromURL } from '../utils'

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

export const copyPhotoToS3 = async (
  s3: S3,
  workPhoto: TroveWorkPhotoMetadataContainer
): Promise<TroveWorkPhotoMetadataContainer> => {
  console.info(`Write ${workPhoto.imageURL} to S3`)

  const filename = getFilenameFromURL(workPhoto.imageURL)
  const {
    metadata: s3PathToPhotoMetadata,
    original: s3PathToOriginalPhoto,
    thumbnail: s3PathToPhotoThumbnail,
  } = getS3PhotoFilenames(workPhoto.workId, workPhoto.imageURL)

  const getPhotoFromSource = () => {
    return fetch(workPhoto.imageURL)
  }

  const response = await backOff(() => getPhotoFromSource(), {
    numOfAttempts: 5,
  })

  const {
    original: originalPhoto,
    thumbnail: thumbnailImage,
  } = createPhotosFromResponseBuffer(await response.buffer())
  const originalPhotoMetdata = await originalPhoto.metadata()
  const {
    info: thumbnailMetadata,
    data: thumbnailImageData,
  } = await thumbnailImage.toBuffer({
    resolveWithObject: true,
  })

  const s3ObjectJPEGParams = {
    Bucket: getS3Bucket(),
    ContentType: 'image/jpeg',
    ContentDisposition: `inline; filename=${filename}`,
  }

  const photoMetadata: TrovePhoto = {
    sourceURL: workPhoto.imageURL,
    original: {
      url: getObjectS3URL(s3PathToOriginalPhoto),
      width: originalPhotoMetdata.width!,
      height: originalPhotoMetdata.height!,
    },
    thumbnail: {
      url: getObjectS3URL(s3PathToPhotoThumbnail),
      width: thumbnailMetadata.width!,
      height: thumbnailMetadata.height!,
    },
    geo: null,
  }

  await Promise.all([
    s3
      .putObject({
        ...s3ObjectJPEGParams,
        ContentDisposition: `inline; filename=${getFilenameFromPath(
          s3PathToOriginalPhoto
        )}`,
        Key: s3PathToOriginalPhoto,
        Body: await originalPhoto.toBuffer(),
      })
      .promise(),
    s3
      .putObject({
        ...s3ObjectJPEGParams,
        ContentDisposition: `inline; filename=${getFilenameFromPath(
          s3PathToPhotoThumbnail
        )}`,
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

  return {
    ...workPhoto,
    photo: photoMetadata,
  }
}

export const fetchPhotoMetadataFromS3 = async (
  s3: S3,
  workId: string,
  imageURL: string,
  caption: string
): Promise<TroveWorkPhotoMetadataContainer> => {
  console.info(`Checking ${imageURL}`)
  const { metadata: s3PathToPhotoMetadata } = getS3PhotoFilenames(
    workId,
    imageURL
  )

  const metadataObject = await s3GetObjectOrUndefined(s3, s3PathToPhotoMetadata)

  if (metadataObject !== undefined && metadataObject.Body !== undefined) {
    return {
      workId,
      imageURL,
      caption,
      photo: JSON.parse(metadataObject.Body.toString()),
    }
  }

  return {
    workId,
    imageURL,
    caption,
    photo: null,
  }
}
