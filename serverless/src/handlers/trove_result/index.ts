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
  doesWorkHaveAnyValidIdentifiers,
  filterWorkIdentifiersForEverythingExceptOriginalPhotos,
  getAndFixWorkerIdentifiersThatAreOriginalPhotos,
} from '../../lib/trove'
import { isLocalDev } from '../../lib/utils'
// import 'source-map-support/register'
import { APIResponses, TroveApiResponse, TrovePhotoMetadata, TroveWork } from '../../types'

const app = async (
  event: APIGatewayEvent,
  callback: (error: LambdaApiError | null, result: APIResponses) => void
): Promise<void> => {
  if (isLocalDev() === false) {
    // eslint-disable-next-line
    console.info('queryStringParameters', event.queryStringParameters)
  }

  const getResultsFromTrove = async (): Promise<TroveApiResponse> => {
    const maxNumberOfWorksToFetch = 6

    const params = new URLSearchParams({
      zone: 'picture',
      'l-place': 'Australia/Western Australia',
      n: `${maxNumberOfWorksToFetch}`,
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
      if (queryStringParams.has('sortby')) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        params.append('sortby', queryStringParams.get('sortby')!)
      }
      if (queryStringParams.has('s')) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        params.append('s', queryStringParams.get('s')!)
      }
    }

    const parseTroveAPIResponse = (queryParams: URLSearchParams) => {
      return fetch(`https://api.trove.nla.gov.au/v2/result?${queryParams}`)
        .then((response) => (response.status === 200 ? response.json() : response.text()))
        .then((body: TroveApiResponse | string) => {
          if (typeof body === 'string') {
            throw new Error(body)
          }
          return body
        })
    }

    let i = 0
    let troveAPIResponse
    let works: TroveWork[] = []
    const maxNumberOfPagesToFetch = 5
    do {
      // eslint-disable-next-line no-await-in-loop
      troveAPIResponse = await parseTroveAPIResponse(params)
      i += 1

      // No results returned, so bail out because there's nothing to process
      if (troveAPIResponse.response.zone[0].records.work === undefined) {
        break
      }

      works = [
        ...works,
        ...troveAPIResponse.response.zone[0].records.work.filter((work: TroveWork) =>
          doesWorkHaveAnyValidIdentifiers(work)
        ),
      ]

      if (troveAPIResponse.response.zone[0].records.nextStart !== undefined) {
        params.set('s', troveAPIResponse.response.zone[0].records.nextStart)
      } else {
        // No more pages to fetch
        break
      }
    } while (works.length < maxNumberOfWorksToFetch && i < maxNumberOfPagesToFetch)

    troveAPIResponse.response.zone[0].records.work = works
    return troveAPIResponse
  }

  try {
    const troveAPIResponse = await backOff(() => getResultsFromTrove(), {
      numOfAttempts: 5,
    })

    // No results returned, so bail out because there's nothing to process
    if (troveAPIResponse.response.zone[0].records.work === undefined) {
      callback(null, troveAPIResponse)
      return
    }

    const worksWithAnyValidIdentifiers = troveAPIResponse.response.zone[0].records.work
      // .filter((work: TroveWork) => work.id === '159335939')
      .filter((work: TroveWork) => doesWorkHaveAnyValidIdentifiers(work))

    const promises: Promise<TrovePhotoMetadata>[] = []
    const limit = pLimit(12)
    const s3 = new S3()

    worksWithAnyValidIdentifiers.forEach((work: TroveWork) =>
      getAndFixWorkerIdentifiersThatAreOriginalPhotos(work).forEach((identifier) =>
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
        // .filter((work: TroveWork) => work.id === '159335939')
        .map((work: TroveWork) => ({
          ...work,
          identifier: filterWorkIdentifiersForEverythingExceptOriginalPhotos(work),
          photos: photosGroupedByWork[work.id],
          // Not sure where this was used...commenting it out for now.
          // thumbnail: getWorkThumbnail(work.identifier, photosGroupedByWork[work.id]),
        })),
    }

    callback(null, troveAPIResponse)
  } catch (e) {
    callbackWithError(
      `The Trove API returned an error, is unavailable, or we had issues handling the response. Message: ${e.message}`,
      callback
    )

    throw e
  }
}

export default app
