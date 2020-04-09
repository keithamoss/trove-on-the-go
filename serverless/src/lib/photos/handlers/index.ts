import { TroveWorkIdentifier } from '../../../types'
import SLWAPhotoURLHandler from './slwa'

export default class PhotoURLHandlerFactory {
  private identifier: TroveWorkIdentifier

  constructor(identifier: TroveWorkIdentifier) {
    this.identifier = identifier
  }

  private isPossiblyAPhoto() {
    return (
      this.identifier.type === 'url' &&
      this.identifier.linktype === 'restricted'
    )
  }

  public isPossiblyAThumbnail() {
    return (
      this.identifier.type === 'url' && this.identifier.linktype === 'thumbnail'
    )
  }

  public getPhotoHandler() {
    if (this.isPossiblyAPhoto()) {
      const url = this.identifier.value

      if (SLWAPhotoURLHandler.isValidURL(url)) {
        return new SLWAPhotoURLHandler(url)
      }

      throw new Error(`No handler found for ${url}`)
    }

    return null
  }
}
