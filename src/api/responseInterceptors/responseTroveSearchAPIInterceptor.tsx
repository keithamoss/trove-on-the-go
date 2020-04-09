import { AxiosResponse } from 'axios'

export const responseTroveSearchAPIInterceptor = (response: AxiosResponse) => {
  response.data =
    'work' in response.data.response.zone[0].records
      ? response.data.response.zone[0].records.work
      : []
  return response
}
