import { ax } from '../Client'
import { TroveWork } from '../types'

export const fetchTrovePhotos = async (
  searchTerm: string
): Promise<TroveWork[]> => {
  const response = await ax.get('/result', {
    method: 'get',
    params: {
      q: searchTerm,
      zone: 'picture',
      'l-place': 'Australia/Western Australia',
      // sortby: 'datedesc',
      n: '50',
      'l-availability': 'y',
      include: 'links',
      reclevel: 'full',
    },
  })
  return response.data
}
