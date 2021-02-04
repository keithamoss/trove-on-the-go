export type TrovePhotoImageSize = {
  width: number
  height: number
}

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
  images: TrovePhotoImages | null
}

export type TroveWorkIdentifier = {
  linktext: string
  linktype: 'fulltext' | 'restricted' | 'subscription' | 'unknown' | 'notonline' | 'thumbnail' | 'viewcopy'
  type: 'url' | 'some-other-values-we-dont-care-about'
  value: string
}

export type TroveWork = {
  photos?: TrovePhotoMetadata[]
  thumbnail?: TrovePhotoImageMetadata | null
  contributor?: string[]
  holdingsCount: number
  id: string
  identifier: TroveWorkIdentifier[]
  issued: number | string
  relevance: {
    score: string
    value: 'very relevant' | 'likely to be relevant' | 'may have relevance' | 'limited relevance' | 'vaguely relevant'
  }
  snippet: string
  title: string
  troveUrl: string
  type: string[]
  url: string
  versionCount: number
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
        next?: string
        nextStart?: string
        work?: TroveWork[]
      }
    }[]
  }
}

export interface TroveAPIWorkDateCount {
  year: number
  count: number
}

export interface TroveAPIDateResponse {
  metadata: {
    min_year: number
    max_year: number
    min_decade: number
    max_decade: number
  } | null
  worksPerYear: TroveAPIWorkDateCount[]
}

export interface SLWAImageBuilderResponse {
  foo: string
}

export type APIResponses = TroveApiResponse | TroveAPIDateResponse | SLWAImageBuilderResponse | Record<string, string>
