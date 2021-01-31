import getAxiosClient from '../Client'
import { TroveAPIDateResponseRecords, TroveAPIDateSearchParams } from '../types'

const fetchTrovePhotoDates = async (params: TroveAPIDateSearchParams): Promise<TroveAPIDateResponseRecords> => {
  const ax = getAxiosClient()

  const response = await ax.get('/trove_date_result', {
    method: 'get',
    params: {
      q: params.searchTerm,
    },
  })
  return response.data
}

export default fetchTrovePhotoDates
