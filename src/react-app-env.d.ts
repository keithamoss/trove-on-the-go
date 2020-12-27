/* eslint-disable spaced-comment */
/// <reference types="react-scripts" />

declare module 'react-grid-gallery'
declare module 'simple-react-lightbox'

interface Navigator extends Navigator {
  share?: (options: any) => Promise<void>
  canShare?: (options: any) => boolean
}
