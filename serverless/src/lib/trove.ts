import { TrovePhotoMetadata, TroveWork, TroveWorkIdentifier } from '../types'
import PhotoURLHandlerFactory from './photos/handlers/index'
import { getURLWithoutFilenameExtension } from './utils'

export const fixIdentifierOriginalPhotoURLs = (identifier: TroveWorkIdentifier) => {
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

export const isIdentifierValid = (identifier: TroveWorkIdentifier) => {
  try {
    const factory = new PhotoURLHandlerFactory(identifier)
    return factory.getPhotoHandler() !== null
  } catch {
    // getPhotoHandler throws an exception if it can't find a matching handler, so...
    return false
  }
}

export const filterWorksWithAnyValidIdentifiers = (work: TroveWork) =>
  work.identifier.some((identifier: TroveWorkIdentifier) => isIdentifierValid(identifier) === true)

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
    .filter((identifier) => isIdentifierAnOrginalPhoto(identifier) === true)
    .map((identifier) => fixIdentifierOriginalPhotoURLs(identifier))

export const filterWorkIdentifiersForEverythingExceptOriginalPhotos = (work: TroveWork) =>
  work.identifier.filter((identifier) => isIdentifierAnOrginalPhoto(identifier) === false)

export const getWorkThumbnail = (identifiers: TroveWorkIdentifier[], photos: TrovePhotoMetadata[]) => {
  const thumbnail = identifiers.find((identifier: TroveWorkIdentifier) => {
    const factory = new PhotoURLHandlerFactory(identifier)
    return factory.isPossiblyAThumbnail()
  })

  if (thumbnail !== undefined) {
    const thumbnailURL = getURLWithoutFilenameExtension(thumbnail.value)

    const thumbnailOriginalPhoto = photos.find(
      (photo) => getURLWithoutFilenameExtension(photo.cataloguePhotoURL) === thumbnailURL
    )

    if (thumbnailOriginalPhoto !== undefined && thumbnailOriginalPhoto.images !== null) {
      return thumbnailOriginalPhoto.images.thumbnail
    }
  }

  return null
}

export const getSourceCatalogueURL = (identifier: TroveWorkIdentifier): string | never => {
  const factory = new PhotoURLHandlerFactory(identifier)
  const handler = factory.getPhotoHandler()

  if (handler !== null) {
    return handler.getSourceCatalogueURL()
  }
  throw new Error(`No handler found for ${identifier.value}`)
}
