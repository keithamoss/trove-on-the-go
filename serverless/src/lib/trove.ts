import { TroveWork, TroveWorkIdentifier, TroveWorkPhoto } from '../types'
import PhotoURLHandlerFactory from './photos/handlers/index'
import { getURLWithoutFilenameExtension } from './utils'

export const fixIdentifierOriginalPhotoURLs = (
  identifier: TroveWorkIdentifier
) => {
  const factory = new PhotoURLHandlerFactory(identifier)
  const handler = factory.getPhotoHandler()

  if (handler !== null && handler.isPhoto()) {
    return {
      ...identifier,
      value: handler.fixPhotoURL(),
    }
  }

  return identifier
}

export const isIdentifierAnOrginalPhoto = (identifier: TroveWorkIdentifier) => {
  const factory = new PhotoURLHandlerFactory(identifier)
  const handler = factory.getPhotoHandler()

  if (handler !== null) {
    return handler.isPhoto()
  }
  return false
}

export const filterWorkIdentifiersForOriginalPhotos = (work: TroveWork) =>
  work.identifier
    .filter(identifier => isIdentifierAnOrginalPhoto(identifier) === true)
    .map(identifier => fixIdentifierOriginalPhotoURLs(identifier))

export const filterWorkIdentifiersForEverythingExceptOriginalPhotos = (
  work: TroveWork
) =>
  work.identifier.filter(
    identifier => isIdentifierAnOrginalPhoto(identifier) === false
  )

export const getWorkThumbnail = (
  identifiers: TroveWorkIdentifier[],
  photos: TroveWorkPhoto[]
) => {
  const thumbnail = identifiers.find((identifier: TroveWorkIdentifier) => {
    const factory = new PhotoURLHandlerFactory(identifier)
    return factory.isPossiblyAThumbnail()
  })

  if (thumbnail !== undefined) {
    const thumbnailURL = getURLWithoutFilenameExtension(thumbnail.value)

    const thumbnailOriginalPhoto = photos.find(photo => {
      return (
        getURLWithoutFilenameExtension(photo.photo!.sourceURL) === thumbnailURL
      )
    })

    if (
      thumbnailOriginalPhoto !== undefined &&
      thumbnailOriginalPhoto.photo !== null
    ) {
      return thumbnailOriginalPhoto.photo.thumbnail
    }
  }

  return null
}
