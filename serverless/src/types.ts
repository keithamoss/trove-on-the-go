export type TrovePhotoDetails = {
  url: string
  width: number
  height: number
}

export type TrovePhoto = {
  sourceURL: string
  original: TrovePhotoDetails
  thumbnail: TrovePhotoDetails
  geo: null
}

export type TroveWorkPhotoMetadataContainer = {
  workId: string
  imageURL: string
  caption: string
  photo: TrovePhoto | null
}

export type TroveApiResponse = {
  response: {
    query: string
    zone: {
      name: string
      records: {
        s: string
        n: string
        total: string
        work?: TroveWork[]
      }
    }[]
  }
}

export type TroveWorkPhoto = {
  caption: string
  photo: TrovePhoto
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
  photos?: TroveWorkPhoto[]
  thumbnail?: TrovePhotoDetails | null
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
