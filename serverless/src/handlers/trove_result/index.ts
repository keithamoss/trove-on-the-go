// eslint-disable-next-line import/no-unresolved
import { APIGatewayEvent } from 'aws-lambda'
import { S3 } from 'aws-sdk'
import { backOff } from 'exponential-backoff'
import fetch from 'node-fetch'
import pLimit from 'p-limit'
import { URLSearchParams } from 'url'
import { copyPhotoToS3, fetchPhotoMetadataFromS3 } from '../../lib/photos/index'
import { callbackWithError, LambdaApiError } from '../../lib/response'
import {
  filterWorkIdentifiersForEverythingExceptOriginalPhotos,
  filterWorkIdentifiersForOriginalPhotos,
  filterWorksWithAnyValidIdentifiers,
  getWorkThumbnail,
} from '../../lib/trove'
// import 'source-map-support/register'
import { TroveApiResponse, TrovePhotoMetadata, TroveWork } from '../../types'

const app = async (
  event: APIGatewayEvent,
  callback: (error: LambdaApiError | null, result: TroveApiResponse | Record<string, string>) => void
): Promise<void> => {
  const getPhotosFromTrove = (): Promise<TroveApiResponse> => {
    const params = new URLSearchParams({
      zone: 'picture',
      'l-place': 'Australia/Western Australia',
      n: '12',
      'l-availability': 'y',
      include: 'links',
      reclevel: 'full',
      key: process.env.TROVE_API_KEY,
      encoding: 'json',
    })

    if (event.queryStringParameters !== null) {
      const queryStringParams = new URLSearchParams(event.queryStringParameters)

      if (queryStringParams.has('q')) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        params.append('q', queryStringParams.get('q')!)
      }
      if (queryStringParams.has('s')) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        params.append('s', queryStringParams.get('s')!)
      }
    }

    return fetch(`https://api.trove.nla.gov.au/v2/result?${params}`)
      .then((response) => (response.status === 200 ? response.json() : response.text()))
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

    // No results returned, so bail out because there's nothing to process
    if (troveAPIResponse.response.zone[0].records.work === undefined) {
      callback(null, troveAPIResponse)
      return
    }

    const promises: Promise<TrovePhotoMetadata>[] = []
    const limit = pLimit(12)
    const s3 = new S3()

    const worksWithAnyValidIdentifiers = troveAPIResponse.response.zone[0].records.work
      // .filter((work: TroveWork) => work.id === '234955310')
      .filter((work: TroveWork) => filterWorksWithAnyValidIdentifiers(work))

    worksWithAnyValidIdentifiers.forEach((work: TroveWork) =>
      filterWorkIdentifiersForOriginalPhotos(work).forEach((identifier) =>
        promises.push(fetchPhotoMetadataFromS3(s3, work, identifier))
      )
    )

    const photoMetadata = await Promise.all(promises)
    const photoMetadataThatWasMissingFromS3 = await Promise.all(
      photoMetadata.filter((item) => item.images === null).map((item) => limit(() => copyPhotoToS3(s3, item)))
    )

    const photos = [...photoMetadata.filter((item) => item.images !== null), ...photoMetadataThatWasMissingFromS3]

    const photosGroupedByWork: {
      [key: string]: TrovePhotoMetadata[]
    } = photos.reduce((accumulator, currentPhoto) => {
      if (accumulator[currentPhoto.troveWorkId] === undefined) {
        accumulator[currentPhoto.troveWorkId] = []
      }
      accumulator[currentPhoto.troveWorkId].push(currentPhoto)
      return accumulator
    }, {})

    troveAPIResponse.response.zone[0].records = {
      ...troveAPIResponse.response.zone[0].records,
      n: `${worksWithAnyValidIdentifiers.length}`,
      work: worksWithAnyValidIdentifiers
        // .filter((work: TroveWork) => work.id === '234955310')
        .map((work: TroveWork) => ({
          ...work,
          identifier: filterWorkIdentifiersForEverythingExceptOriginalPhotos(work),
          photos: photosGroupedByWork[work.id],
          thumbnail: getWorkThumbnail(work.identifier, photosGroupedByWork[work.id]),
        })),
    }

    callback(null, troveAPIResponse)
  } catch (e) {
    callbackWithError(`The Trove API returned an error or is unavailable. Message: ${e.message}`, callback)

    throw e
  }
}

export default app
