import getAxiosClient from '../Client'
import responseTroveSearchAPIInterceptor from '../responseInterceptors/responseTroveSearchAPIInterceptor'
import { TroveAPIResponseRecords, TroveAPISearchParams } from '../types'

const fetchTrovePhotos = async (params: TroveAPISearchParams): Promise<TroveAPIResponseRecords> => {
  const ax = getAxiosClient()
  ax.interceptors.response.use(responseTroveSearchAPIInterceptor)

  const response = await ax.get('/trove_result', {
    method: 'get',
    params: {
      q: params.searchYear === null ? params.searchTerm : `${params.searchTerm} date:[${params.searchYear} TO *]`,
      sortby: params.sortOrder,
      s: params.nextPageToken,
    },
  })
  return response.data
}

export default fetchTrovePhotos
