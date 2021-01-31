declare namespace NodeJS {
  interface ProcessEnv {
    REACT_APP_TROVE_API_URL: string
    NODE_ENV: 'development' | 'production'
  }
}

// declare const ValueLabel: React.ComponentType<ValueLabelProps>
declare module '@material-ui/core/Slider/ValueLabel'
