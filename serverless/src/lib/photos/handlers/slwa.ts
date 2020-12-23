import { getFilenameExtensionFromURL, getURLWithoutFilenameExtension } from '../../utils'

export default class SLWAPhotoURLHandler {
  private url: string

  private ext: string

  constructor(url: string) {
    this.url = url
    this.ext = getFilenameExtensionFromURL(url)
  }

  static isValidURL(url: string): boolean {
    return url.includes('slwa.wa.gov.au')
  }

  private isOriginalPhoto() {
    // Just regular original photos that don't need any fixing
    return this.ext === 'jpg'
  }

  private isThumbnail() {
    // Just regular photo thumbnails that need translating into their original image URLs
    return this.ext === 'png'
  }

  private fixThumbnail() {
    return this.url.replace('.png', '.jpg')
  }

  private isCataloguePage() {
    // Sometimes a URL for a photo is actually a link to the SLWA catalogue page for the image, but we can easily create a link to its photo.
    // e.g. http://purl.slwa.wa.gov.au/slwa_b5907930_1
    return this.ext === ''
  }

  private fixCataloguePage() {
    return `${this.url}.jpg`
  }

  // private isPDFIndexToPhotoCollection() {
  //   // These are PDFs of collections of photos that list the collection numbers of individual photos
  //   // Nothing to be done about that here, so discard.
  //   // e.g. https://trove.nla.gov.au/work/159519383?q&versionId=173884832
  //   return this.ext === 'pdf.png'
  // }

  public isPhoto(): boolean {
    return this.isOriginalPhoto() || this.isThumbnail() || this.isCataloguePage()
  }

  public fixPhotoURL(): string {
    if (this.isPhoto() === false) {
      throw new Error(`${this.url} is not a photo`)
    }

    if (this.isThumbnail()) {
      return this.fixThumbnail()
    }
    if (this.isCataloguePage()) {
      return this.fixCataloguePage()
    }

    // Would contain this.isOriginalPhoto() === true
    return this.url
  }

  public getSourceCatalogueURL(): string {
    if (this.isPhoto() === false) {
      throw new Error(`${this.url} is not a photo`)
    }

    return getURLWithoutFilenameExtension(this.url)
  }
}
