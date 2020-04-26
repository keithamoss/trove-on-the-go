declare namespace NodeJS {
  interface ProcessEnv {
    REACT_APP_TROVE_API_URL: string
    NODE_ENV: 'development' | 'production'
  }
}
