import { ax } from '../Client'
import { TroveWork } from '../types'

export const fetchTrovePhotos = async (
  searchTerm: string
): Promise<TroveWork[]> => {
  const response = await ax.get('/trove_result', {
    method: 'get',
    params: {
      q: searchTerm,
    },
  })
  return response.data
}
