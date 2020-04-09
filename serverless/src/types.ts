export type TrovePhoto = {
  sourceURL: string
  original: {
    url: string
    width: number
    height: number
  }
  thumbnail: {
    url: string
    width: number
    height: number
  }
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
        work: TroveWork[]
      }
    }
  }
}

export type TroveWorkPhoto = {
  original_url: string
  thumbnail_url: string
  // fullsize_width?: number
  // fullsize_height?: number
  caption: string
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
  thumbnail?: TroveWorkPhoto | null
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
