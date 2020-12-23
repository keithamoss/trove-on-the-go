import { AxiosResponse } from 'axios'

const responseTroveSearchAPIInterceptor = (response: AxiosResponse): AxiosResponse => {
  const { records } = response.data.response.zone[0]
  response.data = {
    total: records.total,
    nextPageToken: records.nextStart || null,
    work: 'work' in records ? records.work : [],
  }
  return response
}

export default responseTroveSearchAPIInterceptor
