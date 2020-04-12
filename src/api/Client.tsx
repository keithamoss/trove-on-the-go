import axios from 'axios'
import { requestTroveAPIInterceptor } from './requestInterceptors/requestTroveAPIInterceptor'
import { responseTroveSearchAPIInterceptor } from './responseInterceptors/responseTroveSearchAPIInterceptor'

// PROD: https://i5lkkvcbn9.execute-api.ap-southeast-2.amazonaws.com/v1.0.1
// DEV: https://9llherx36c.execute-api.ap-southeast-2.amazonaws.com/v1.0.1
// LOCAL DEV: https://localhost:3001/dev/v1.0.1
export const ax = axios.create({
  baseURL: 'https://9llherx36c.execute-api.ap-southeast-2.amazonaws.com/v1.0.1',
})

ax.interceptors.request.use(requestTroveAPIInterceptor)
ax.interceptors.response.use(responseTroveSearchAPIInterceptor)
