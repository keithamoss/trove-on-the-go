// eslint-disable-next-line import/no-unresolved
import { APIGatewayEvent } from 'aws-lambda'
import { callbackWithError, LambdaApiError } from '../../lib/response'
import { isLocalDev } from '../../lib/utils'
import { APIResponses, SLWAImageBuilderResponse } from '../../types'

const app = async (
  event: APIGatewayEvent,
  callback: (error: LambdaApiError | null, result: APIResponses) => void
): Promise<void> => {
  if (isLocalDev() === false) {
    // eslint-disable-next-line
    console.info('queryStringParameters', event.queryStringParameters)
  }

  // const getResultsFromTrove = async (): Promise<TroveWork[]> => {
  //   const params = new URLSearchParams({
  //     zone: 'picture',
  //     'l-place': 'Australia/Western Australia',
  //     n: '100',
  //     'l-availability': 'y',
  //     include: 'links',
  //     reclevel: 'brief',
  //     sortby: 'dateasc',
  //     key: process.env.TROVE_API_KEY,
  //     encoding: 'json',
  //   })

  //   if (event.queryStringParameters !== null) {
  //     const queryStringParams = new URLSearchParams(event.queryStringParameters)

  //     if (queryStringParams.has('q')) {
  //       // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  //       params.append('q', queryStringParams.get('q')!)
  //     }
  //   }

  //   const parseTroveAPIResponse = (queryParams: URLSearchParams) => {
  //     return fetch(`https://api.trove.nla.gov.au/v2/result?${queryParams}`)
  //       .then((response) => (response.status === 200 ? response.json() : response.text()))
  //       .then((body: TroveApiResponse | string) => {
  //         if (typeof body === 'string') {
  //           throw new Error(body)
  //         }
  //         return body
  //       })
  //   }

  //   let i = 0
  //   let troveAPIResponse
  //   let works: TroveWork[] = []
  //   const maxNumberOfWorksToFetch = 500
  //   const maxNumberOfPagesToFetch = 5
  //   do {
  //     // eslint-disable-next-line no-await-in-loop
  //     troveAPIResponse = await parseTroveAPIResponse(params)
  //     i += 1

  //     // No results returned, so bail out because there's nothing left to process
  //     if (troveAPIResponse.response.zone[0].records.work === undefined) {
  //       break
  //     }

  //     works = [...works, ...troveAPIResponse.response.zone[0].records.work]

  //     if (troveAPIResponse.response.zone[0].records.nextStart !== undefined) {
  //       params.set('s', troveAPIResponse.response.zone[0].records.nextStart)
  //     } else {
  //       // No more pages to fetch
  //       break
  //     }
  //   } while (works.length < maxNumberOfWorksToFetch && i < maxNumberOfPagesToFetch)

  //   return works
  // }

  try {
    // const troveWorks = await backOff(() => getResultsFromTrove(), {
    //   numOfAttempts: 5,
    // })

    // No results returned, so bail out because there's nothing to process
    // if (troveWorks.length === 0) {
    //   callback(null, {
    //     metadata: null,
    //     worksPerYear: [],
    //   } as SLWAImageBuilderResponse)
    //   return
    // }

    callback(null, {
      foo: 'bar',
    } as SLWAImageBuilderResponse)
  } catch (e) {
    callbackWithError(`An error occurred handling the response. Message: ${e.message}`, callback)

    throw e
  }
}

export default app
