export type TrovePhotoImageMetadata = {
  url: string
  width: number
  height: number
}

export type TrovePhotoImages = {
  original: TrovePhotoImageMetadata
  thumbnail: TrovePhotoImageMetadata
}

export type TrovePhotoMetadata = {
  troveWorkId: string
  troveWorkURL: string
  catalogueURL: string
  cataloguePhotoURL: string
  caption: string
  geo: null
  images: TrovePhotoImages
}

export type TroveWorkIdentifier = {
  linktext: string
  linktype:
    | 'fulltext'
    | 'restricted'
    | 'subscription'
    | 'unknown'
    | 'notonline'
    | 'thumbnail'
    | 'viewcopy'
  type: 'url' | 'some-other-values-we-dont-care-about'
  value: string
}

export type TroveWork = {
  photos: TrovePhotoMetadata[]
  thumbnail: {
    url: string
    width: number
    height: number
  } | null
  contributor?: string[]
  holdingsCount: number
  id: string
  identifier: TroveWorkIdentifier[]
  issued: number
  relevance: {
    score: string
    value:
      | 'very relevant'
      | 'likely to be relevant'
      | 'may have relevance'
      | 'limited relevance'
      | 'vaguely relevant'
  }
  snippet: string
  title: string
  troveUrl: string
  type: string[]
  url: string
  versionCount: number
}
export type TroveAPISearchParams = {
  searchTerm: string
  nextPageToken: string | null
}

export type TroveAPIResponseRecords = {
  total: number
  nextPageToken: string | null
  work: TroveWork[]
}
