import ax from '../Client'
import { TroveAPIResponseRecords, TroveAPISearchParams } from '../types'

const fetchTrovePhotos = async (params: TroveAPISearchParams): Promise<TroveAPIResponseRecords> => {
  const response = await ax.get('/trove_result', {
    method: 'get',
    params: {
      q: params.searchTerm,
      s: params.nextPageToken,
    },
  })
  return response.data
}

export default fetchTrovePhotos
