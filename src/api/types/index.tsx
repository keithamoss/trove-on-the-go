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
  images: TrovePhotoImages
}

export type TroveWorkIdentifier = {
  linktext: string
  linktype: 'fulltext' | 'restricted' | 'subscription' | 'unknown' | 'notonline' | 'thumbnail' | 'viewcopy'
  type: 'url' | 'some-other-values-we-dont-care-about'
  value: string
}

export type TroveWork = {
  photos: TrovePhotoMetadata[]
  // thumbnail: {
  //   url: string
  //   width: number
  //   height: number
  // } | null
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

export enum TroveSortOrder {
  DATE_ASC = 'dateasc',
  DATE_DESC = 'datedesc',
  RELEVANCE = 'relevance',
}

export interface TroveAPISearchParams {
  searchTerm: string
  searchYear: number | null
  sortOrder: TroveSortOrder
  nextPageToken: string | null
}

export interface TroveAPIResponseRecords {
  total: number
  nextPageToken: string | null
  work: TroveWork[]
}
export interface TroveAPIDateSearchParams {
  searchTerm: string
}

export interface TroveAPIWorkDateCount {
  year: number
  count: number
}

export interface TroveAPIDateResponseRecords {
  metadata: {
    min_year: number
    max_year: number
    min_decade: number
    max_decade: number
  } | null
  worksPerYear: TroveAPIWorkDateCount[]
}
