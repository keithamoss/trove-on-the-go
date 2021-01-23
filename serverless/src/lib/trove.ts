import { TroveWork, TroveWorkIdentifier } from '../types'
import PhotoURLHandlerFactory from './photos/handlers/index'

/**
 * Checks if the given identifier (e.g. photo or webpage link) is valid at a very fundamental level. Basically, "Do we even know how the parse identifiers from this institution?"
 *
 * @param identifier - An identifier object describing a photo or webpage link attached to a given work.
 */
export const isIdentifierValid = (identifier: TroveWorkIdentifier): boolean => {
  try {
    const factory = new PhotoURLHandlerFactory(identifier)
    return factory.getPhotoHandler() !== null
  } catch {
    // getPhotoHandler throws an exception if it can't find a matching handler, so...
    return false
  }
}

/**
 * Checks if this work has at least one valid identifier (e.g. photo or webpage link) that we could show in TOTG.
 *
 * @param work - A single catalogue item in Trove. Will have one or more identifiers attached to it that might be photos we can display.
 */
export const doesWorkHaveAnyValidIdentifiers = (work: TroveWork): boolean =>
  work.identifier.some((identifier: TroveWorkIdentifier) => isIdentifierValid(identifier) === true)

/**
 * Checks if the given identifier is an original photo (i.e. high-res images, not just a thumbnail).
 * @TODO Why does isPhoto include thumbnail??
 *
 * @param identifier - An identifier object describing a photo or webpage link attached to a given work.
 */
export const isIdentifierAnOrginalPhoto = (identifier: TroveWorkIdentifier): boolean => {
  try {
    const factory = new PhotoURLHandlerFactory(identifier)
    const handler = factory.getPhotoHandler()

    if (handler !== null) {
      return handler.isPhoto()
    }
  } catch {
    // getPhotoHandler throws an exception if it can't find a matching handler, so...
  }
  return false
}

/**
 * Wrapper around institution PhotoURLHandlers that calls the relevant fixXXXX() function for this type of identifier (e.g. thumbnails require different handling to full photos).
 *
 * @remarks
 * This handles oddities in how different institutions expose links to their identifiers. (e.g. SLWA exposes their thumbnail JPEGs with a `.png` extension, so we correct that to `.jpg` here.)
 *
 * @param identifier - An identifier object describing a photo or webpage link attached to a given work.
 */
export const fixIdentifierOriginalPhotoURLs = (identifier: TroveWorkIdentifier): TroveWorkIdentifier => {
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

/**
 * Filters and fixes all of the identifiers on a work that are origianl photos (i.e. high-res images, not just a thumbnail) so we can display them on TOTG.
 *
 * @param work - A single catalogue item in Trove. Will have one or more identifiers attached to it that might be photos we can display.
 */
export const getAndFixWorkerIdentifiersThatAreOriginalPhotos = (work: TroveWork): TroveWorkIdentifier[] =>
  work.identifier
    .filter((identifier) => isIdentifierAnOrginalPhoto(identifier) === true)
    .map((identifier) => fixIdentifierOriginalPhotoURLs(identifier))

/**
 * Filters all of the identifiers on a work for all of the "invalid" identifiers we discarded as "these things are not photos".
 *
 * @param work - A single catalogue item in Trove. Will have one or more identifiers attached to it that might be photos we can display.
 */
export const filterWorkIdentifiersForEverythingExceptOriginalPhotos = (work: TroveWork): TroveWorkIdentifier[] =>
  work.identifier.filter((identifier) => isIdentifierAnOrginalPhoto(identifier) === false)

/**
 * I'm not sure why we care about the designated work thumbnail. The frontend doesn't seem to use it, so I've commented this out.
 * - 23/01/2021
 *
 * @param identifiers - A list of identifier objects describing photos or webpage links attached to a given work.
 * @param photos - A list of original photos that we've processed and stored in S3.
 */
// export const getWorkThumbnail = (
//   identifiers: TroveWorkIdentifier[],
//   photos: TrovePhotoMetadata[] | undefined
// ): TrovePhotoImageMetadata | null => {
//   const thumbnail = identifiers.find((identifier: TroveWorkIdentifier) => {
//     const factory = new PhotoURLHandlerFactory(identifier)
//     return factory.isPossiblyAThumbnail()
//   })

//   if (thumbnail !== undefined && photos !== undefined) {
//     const thumbnailURL = getURLWithoutFilenameExtension(thumbnail.value)

//     const thumbnailOriginalPhoto = photos.find(
//       (photo) => getURLWithoutFilenameExtension(photo.cataloguePhotoURL) === thumbnailURL
//     )

//     if (thumbnailOriginalPhoto !== undefined && thumbnailOriginalPhoto.images !== null) {
//       return thumbnailOriginalPhoto.images.thumbnail
//     }
//   }

//   return null
// }

/**
 * Gets the best URL for this work in the source institution's catalogue (e.g. The direct link to this in SLWA, not the Trove link).
 *
 * @param identifier - An identifier object describing a photo or webpage link attached to a given work.
 */
export const getSourceCatalogueURLForIdentifier = (identifier: TroveWorkIdentifier): string | never => {
  const factory = new PhotoURLHandlerFactory(identifier)
  const handler = factory.getPhotoHandler()

  if (handler !== null) {
    return handler.getSourceCatalogueURL()
  }
  throw new Error(`No handler found for ${identifier.value}`)
}
