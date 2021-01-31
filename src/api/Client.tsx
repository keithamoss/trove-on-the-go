import axios, { AxiosInstance } from 'axios'
import requestTroveAPIInterceptor from './requestInterceptors/requestTroveAPIInterceptor'

const getAxiosClient = (): AxiosInstance => {
  const ax = axios.create({
    baseURL: process.env.REACT_APP_TROVE_API_URL,
  })

  ax.interceptors.request.use(requestTroveAPIInterceptor)
  return ax
}

export default getAxiosClient
