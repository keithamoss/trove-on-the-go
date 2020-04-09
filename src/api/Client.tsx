import axios from 'axios'
import { requestTroveAPIInterceptor } from './requestInterceptors/requestTroveAPIInterceptor'
import { responseTroveSearchAPIInterceptor } from './responseInterceptors/responseTroveSearchAPIInterceptor'

// PROD: https://i5lkkvcbn9.execute-api.ap-southeast-2.amazonaws.com/v1.0
// DEV: https://9llherx36c.execute-api.ap-southeast-2.amazonaws.com/v1.0
export const ax = axios.create({
  baseURL: 'https://i5lkkvcbn9.execute-api.ap-southeast-2.amazonaws.com/v1.0',
})

ax.interceptors.request.use(requestTroveAPIInterceptor)
ax.interceptors.response.use(responseTroveSearchAPIInterceptor)
