// eslint-disable-next-line import/no-unresolved
import { APIGatewayEvent } from 'aws-lambda'
import { backOff } from 'exponential-backoff'
import fetch from 'node-fetch'
import { URLSearchParams } from 'url'
import { callbackWithError, LambdaApiError } from '../../lib/response'
import { doesWorkHaveAnyValidIdentifiers } from '../../lib/trove'
import { isLocalDev } from '../../lib/utils'
import { TroveAPIDateResponse, TroveApiResponse, TroveWork } from '../../types'

const app = async (
  event: APIGatewayEvent,
  callback: (
    error: LambdaApiError | null,
    result: TroveApiResponse | TroveAPIDateResponse | Record<string, string>
  ) => void
): Promise<void> => {
  if (isLocalDev() === false) {
    // eslint-disable-next-line
    console.info('queryStringParameters', event.queryStringParameters)
  }

  const getResultsFromTrove = async (): Promise<TroveWork[]> => {
    const params = new URLSearchParams({
      zone: 'picture',
      'l-place': 'Australia/Western Australia',
      n: '100',
      'l-availability': 'y',
      reclevel: 'brief',
      key: process.env.TROVE_API_KEY,
      encoding: 'json',
    })

    if (event.queryStringParameters !== null) {
      const queryStringParams = new URLSearchParams(event.queryStringParameters)

      if (queryStringParams.has('q')) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        params.append('q', queryStringParams.get('q')!)
      }
    }

    let works: TroveWork[] = []

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

    let troveAPIResponse
    let i = 0
    do {
      // eslint-disable-next-line no-await-in-loop
      troveAPIResponse = await parseTroveAPIResponse(params)
      i += 1

      // No results returned, so bail out because there's nothing left to process
      if (troveAPIResponse.response.zone[0].records.work === undefined) {
        return works
      }

      works = [...works, ...troveAPIResponse.response.zone[0].records.work]

      if (troveAPIResponse.response.zone[0].records.nextStart !== undefined) {
        params.set('s', troveAPIResponse.response.zone[0].records.nextStart)
      } else {
        break
      }
    } while (works.length < 500 || i < 5)

    return works
  }

  try {
    const troveWorks = await backOff(() => getResultsFromTrove(), {
      numOfAttempts: 5,
    })

    // No results returned, so bail out because there's nothing to process
    if (troveWorks.length === 0) {
      callback(null, {
        metadata: null,
        worksPerYear: [],
      } as TroveAPIDateResponse)
      return
    }

    const worksWithAnyValidIdentifiers = troveWorks
      // .filter((work: TroveWork) => work.id === '159335939')
      .filter((work: TroveWork) => doesWorkHaveAnyValidIdentifiers(work))

    // @TODO Talk to H about the best way to handle year ranges (instead of just taking the lower range)
    const getYearFromWork = (work: TroveWork) =>
      typeof work.issued === 'string' ? Number.parseInt(work.issued.split('-')[0], 10) : work.issued

    const getDatesFromWorks = worksWithAnyValidIdentifiers
      .filter((work: TroveWork) => work.issued !== undefined)
      .map((work: TroveWork) => getYearFromWork(work))
      .reduce((map: Map<number, number>, year: number) => {
        let count = map.get(year)
        if (count) {
          map.set(year, (count += 1))
        } else {
          map.set(year, 1)
        }
        return map
      }, new Map())

    // Convert our map to an object and sort by year (ascending)
    let worksPerYear = []
    for (const [year, count] of getDatesFromWorks.entries()) {
      worksPerYear.push({
        year,
        count,
      })
    }
    worksPerYear = worksPerYear.sort((a, b) => (a.year > b.year ? 1 : -1))

    const years = [...getDatesFromWorks.keys()].map((year: number) => year)

    callback(null, {
      metadata: {
        min_year: Math.min(...years),
        max_year: Math.max(...years),
        min_decade: Math.floor(Math.min(...years) / 10) * 10,
        max_decade: Math.ceil(Math.max(...years) / 10) * 10,
      },
      worksPerYear,
    } as TroveAPIDateResponse)
  } catch (e) {
    callbackWithError(
      `The Trove API returned an error, is unavailable, or we had issues handling the response. Message: ${e.message}`,
      callback
    )

    throw e
  }
}

export default app
