// eslint-disable-next-line import/no-unresolved
import { APIGatewayEvent, Context } from 'aws-lambda'
import TroveResult from './handlers/trove_result'
import { LambdaApiError, makeResponse } from './lib/response'
import { isLocalDev } from './lib/utils'
import { TroveApiResponse } from './types'

// : Handler
exports.trove_result = (
  event: APIGatewayEvent,
  context: Context
  // callback: Callback
) => {
  TroveResult(event, (error: LambdaApiError | null, result: TroveApiResponse | Record<string, string>) => {
    if (isLocalDev() === false) {
      // eslint-disable-next-line
      console.log(JSON.stringify(result, undefined, 4))
    }
    context.succeed(makeResponse(error, result))
  })
}
