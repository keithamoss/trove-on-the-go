declare namespace NodeJS {
  interface ProcessEnv {
    API_VERSION: string
    S3_BUCKET_NAME: string
    TROVE_API_KEY: string
    NODE_ENV: 'development' | 'production'
    IS_OFFLINE: 'true' | undefined
  }
}
