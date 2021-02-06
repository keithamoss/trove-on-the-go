// eslint-disable-next-line import/no-unresolved
import { APIGatewayEvent, Context } from 'aws-lambda'
import SLWAImageBuilder from './handlers/slwa_image_builder'
import TroveDateResult from './handlers/trove_date_result'
import TroveResult from './handlers/trove_result'
import { LambdaApiError, makeResponse } from './lib/response'
import { isLocalDev } from './lib/utils'
import { APIResponses, SLWAImageBuilderResponse } from './types'

// : Handler
exports.trove_result = (
  event: APIGatewayEvent,
  context: Context
  // callback: Callback
) => {
  TroveResult(event, (error: LambdaApiError | null, result: APIResponses) => {
    if (isLocalDev() === false) {
      // eslint-disable-next-line
      console.log(JSON.stringify(result, undefined, 4))
    }
    context.succeed(makeResponse(error, result))
  })
}

exports.trove_date_result = (
  event: APIGatewayEvent,
  context: Context
  // callback: Callback
) => {
  TroveDateResult(event, (error: LambdaApiError | null, result: APIResponses) => {
    if (isLocalDev() === false) {
      // eslint-disable-next-line
      console.log(JSON.stringify(result, undefined, 4))
    }
    context.succeed(makeResponse(error, result))
  })
}

exports.slwa_image_builder = (
  event: APIGatewayEvent,
  context: Context
  // callback: Callback
) => {
  SLWAImageBuilder(event, (_error: LambdaApiError | null, result: APIResponses) => {
    if (result !== null && (result as SLWAImageBuilderResponse)?.imageURL !== undefined) {
      context.succeed({
        statusCode: 302,
        headers: {
          Location: (result as SLWAImageBuilderResponse).imageURL,
        },
      })
    }
  })
}
