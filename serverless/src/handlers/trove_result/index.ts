// eslint-disable-next-line import/no-unresolved
import { APIGatewayEvent } from 'aws-lambda'
import { S3 } from 'aws-sdk'
import { backOff } from 'exponential-backoff'
import fetch from 'node-fetch'
import pLimit from 'p-limit'
import { URLSearchParams } from 'url'
import { copyPhotoToS3, fetchPhotoMetadataFromS3 } from '../../lib/photos/index'
import { callbackWithError } from '../../lib/response'
import { filterWorkIdentifiersForEverythingExceptOriginalPhotos, filterWorkIdentifiersForOriginalPhotos, getWorkThumbnail } from '../../lib/trove'
// import 'source-map-support/register'
import { TroveApiResponse, TroveWork, TroveWorkPhotoMetadataContainer } from '../../types'

export default async (event: APIGatewayEvent, callback: Function) => {
  const getPhotosFromTrove = (): Promise<TroveApiResponse> => {
    const params = new URLSearchParams({
      q:
        event.queryStringParameters !== null
          ? event.queryStringParameters.q
          : '',
      zone: 'picture',
      'l-place': 'Australia/Western Australia',
      n: '50',
      'l-availability': 'y',
      include: 'links',
      reclevel: 'full',
      key: process.env.TROVE_API_KEY,
      encoding: 'json',
    })

    return fetch(`https://api.trove.nla.gov.au/v2/result?${params}`)
      .then(response =>
        response.status === 200 ? response.json() : response.text()
      )
      .then((body: TroveApiResponse | string) => {
        if (typeof body === 'string') {
          throw new Error(body)
        }
        return body
      })
  }

  try {
    const troveAPIResponse = await backOff(() => getPhotosFromTrove(), {
      numOfAttempts: 5,
    })

    const promises: Promise<TroveWorkPhotoMetadataContainer>[] = []
    const limit = pLimit(12)
    const s3 = new S3()

    troveAPIResponse.response.zone[0].records.work
      // .filter((work: TroveWork) => work.id === '159519383')
      .forEach((work: TroveWork) =>
        filterWorkIdentifiersForOriginalPhotos(work).forEach(identifier =>
          promises.push(
            fetchPhotoMetadataFromS3(
              s3,
              work.id,
              identifier.value,
              identifier.linktext
            )
          )
        )
      )

    const photoMetadata = await Promise.all(promises)
    const photoMetadataThatWasMissingFromS3 = await Promise.all(
      photoMetadata
        .filter(item => item.photo === null)
        .map((item: TroveWorkPhotoMetadataContainer) =>
          limit(() => copyPhotoToS3(s3, item))
        )
    )

    const photos = [
      ...photoMetadata.filter(item => item.photo !== null),
      ...photoMetadataThatWasMissingFromS3,
    ]

    const photosGroupedByWork: {
      [key: string]: TroveWorkPhotoMetadataContainer[]
    } = photos.reduce((accumulator, currentPhoto) => {
      if (accumulator[currentPhoto.workId] === undefined) {
        accumulator[currentPhoto.workId] = []
      }
      const { workId, imageURL, ...photo } = currentPhoto
      accumulator[currentPhoto.workId].push(photo)
      return accumulator
    }, {})

    troveAPIResponse.response.zone[0].records.work = troveAPIResponse.response.zone[0].records.work
      // .filter((work: TroveWork) => work.id === '159519383')
      .map((work: TroveWork) => {
        return {
          ...work,
          identifier: filterWorkIdentifiersForEverythingExceptOriginalPhotos(
            work
          ),
          photos: photosGroupedByWork[work.id],
          thumbnail: getWorkThumbnail(
            work.identifier,
            photosGroupedByWork[work.id]
          ),
        }
      })

    callback(null, troveAPIResponse)
  } catch (e) {
    callbackWithError(
      `The Trove API returned an error or is unavailable. Message: ${e.message}`,
      callback
    )

    throw e
  }
}
