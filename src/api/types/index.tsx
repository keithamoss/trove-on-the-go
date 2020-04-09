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

export type TroveWorkPhoto = {
  caption: string
  photo: {
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
}

export type TroveWork = {
  photos: TroveWorkPhoto[]
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
