import axios from 'axios'
import requestTroveAPIInterceptor from './requestInterceptors/requestTroveAPIInterceptor'
import responseTroveSearchAPIInterceptor from './responseInterceptors/responseTroveSearchAPIInterceptor'

const ax = axios.create({
  baseURL: process.env.REACT_APP_TROVE_API_URL,
})

ax.interceptors.request.use(requestTroveAPIInterceptor)
ax.interceptors.response.use(responseTroveSearchAPIInterceptor)

export default ax
