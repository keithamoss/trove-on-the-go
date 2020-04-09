import { AxiosRequestConfig } from 'axios'

export const requestTroveAPIInterceptor = (config: AxiosRequestConfig) => {
  config.params = config.params || {}
  config.params['key'] = process.env.REACT_APP_TROVE_API_KEY
  return config
}
