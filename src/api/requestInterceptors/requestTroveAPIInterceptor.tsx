import { AxiosRequestConfig } from 'axios'

const requestTroveAPIInterceptor = (config: AxiosRequestConfig) => {
  const newConfig = { ...config }
  newConfig.params = newConfig.params || {}
  // newConfig.params['key'] = process.env.REACT_APP_TROVE_API_KEY
  return newConfig
}

export default requestTroveAPIInterceptor
