import { AxiosResponse } from 'axios'

export const responseTroveSearchAPIInterceptor = (response: AxiosResponse) => {
  const { records } = response.data.response.zone[0]
  response.data = {
    total: records.total,
    nextPageToken: records.nextStart || null,
    work: 'work' in records ? records.work : [],
  }
  return response
}
