import axios from 'axios'
import { requestTroveAPIInterceptor } from './requestInterceptors/requestTroveAPIInterceptor'
import { responseTrovePhotoSearchAPIInterceptor } from './responseInterceptors/responseTrovePhotoSearchAPIInterceptor'
import { responseTroveSearchAPIInterceptor } from './responseInterceptors/responseTroveSearchAPIInterceptor'

export const ax = axios.create({
  baseURL: 'https://api.trove.nla.gov.au/v2',
})

ax.interceptors.request.use(requestTroveAPIInterceptor)
ax.interceptors.response.use(responseTroveSearchAPIInterceptor)
ax.interceptors.response.use(responseTrovePhotoSearchAPIInterceptor)
