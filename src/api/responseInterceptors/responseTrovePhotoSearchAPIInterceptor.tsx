import { AxiosResponse } from 'axios'
import { getURLFileExtension } from '../../shared/utils'
import { TroveWork, TroveWorkIdentifier, TroveWorkPhoto } from '../types'

const getWorkThumbnail = (
  workIdentifiers: TroveWorkIdentifier[]
): TroveWorkIdentifier | null => {
  let thumbnail = workIdentifiers.find((item: TroveWorkIdentifier) => {
    return item.type === 'url' && item.linktype === 'thumbnail'
  })

  if (thumbnail === undefined) {
    // Sometimes there are items with photos that have no thumbnail for some reason. In this case, just pick the first photo and use that.
    // e.g. https://trove.nla.gov.au/work/238747076
    thumbnail = workIdentifiers.find(item => {
      return item.type === 'url' && item.linktype === 'restricted'
    })

    if (thumbnail === undefined) {
      return null
    }
  }

  return thumbnail
}

const getSLWAPhotoInfo = (
  work: TroveWorkIdentifier | null
): TroveWorkPhoto | null => {
  if (work !== null && work.value.includes('slwa.wa.gov.au')) {
    const url = work.value

    switch (getURLFileExtension(url)) {
      // These are PDFs of collections of photos that list the collection numbers of individual photos
      // Nothing to be done about that here, so discard.
      // e.g. https://trove.nla.gov.au/work/159519383?q&versionId=173884832
      case '.pdf.png':
        return null

      // Sometimes a URL for a photo is actually a link to the SLWA catalogue page for the image, but we can easily create a link to its photo.
      // e.g. http://purl.slwa.wa.gov.au/slwa_b5907930_1
      case null:
        return {
          thumbnail_url: `${url}.png`,
          fullsize_url: `${url}.jpg`,
          caption: work.linktext,
        }

      // Just regular photos that need their fullsize image URLs created
      case '.png':
        return {
          thumbnail_url: url,
          fullsize_url: url.replace('.png', '.jpg'),
          caption: work.linktext,
        }

      default:
        return null
    }
  }

  return null
}

export const responseTrovePhotoSearchAPIInterceptor = (
  response: AxiosResponse
) => {
  const works: TroveWork[] = response.data.map(
    (work: TroveWork): TroveWork => {
      return {
        ...work,
        thumbnail: getSLWAPhotoInfo(getWorkThumbnail(work.identifier)),
        photos: work.identifier
          .filter(item => item.type === 'url' && item.linktype === 'restricted')
          .map(item => getSLWAPhotoInfo(item))
          .filter((item): item is TroveWorkPhoto => item !== null),
      }
    }
  )

  // works.forEach((item: TroveWork) => {
  //   if (item.photos !== undefined) {
  //     item.photos.forEach(photo => {
  //       getImageSize(photo.fullsize_url).then(dimensions => {
  //         photo.fullsize_width = dimensions.width
  //         photo.fullsize_height = dimensions.height
  //       })
  //     })
  //   }
  // })

  response.data = works
  return response
}
