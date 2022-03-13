// eslint-disable-next-line
import { RouteComponentProps } from 'react-router-dom'
import { TroveSortOrder } from '../api/types'

export interface RouteParams {
  search?: string | undefined
  page?: string | undefined
}

export interface QueryParams {
  y?: string | undefined
  sort?: string | undefined
}

export const parseURL = (pathname: string): RouteParams => {
  // [^/] matches every character except /
  // Note: Could use https://web.dev/urlpattern/ once it has wider adoption by browsers
  const regexp = /(?<search>[^/]+)\/?(?<page>[0-9]?)/.exec(pathname)
  if (regexp !== null && regexp !== undefined && regexp.groups !== undefined) {
    return {
      search: regexp.groups.search,
      page: regexp.groups.page,
    }
  }

  return {
    search: undefined,
    page: undefined,
  }
}

export const searchTermChanging = (history: RouteComponentProps['history'], newSearch: string): void => {
  // Reset the search-specific paramters of year and page
  const { search } = parseURL(history.location.pathname)
  const searchParams = new URLSearchParams(history.location.search)

  if (search !== newSearch) {
    searchParams.delete('y')

    history.push({
      ...history.location,
      pathname: `/${newSearch}`,
      search: searchParams.toString(),
    })
  }
}

export const moveToNextPage = (history: RouteComponentProps['history']): void => {
  // When the page changes, just update the page param. This can happen for any sorting mode.
  const { search, page } = parseURL(history.location.pathname)
  const nextPageNumber = parseInt(page === '' || page === undefined ? '1' : page) + 1
  history.push({
    ...history.location,
    pathname: `/${search}/${nextPageNumber}`,
  })
}

export const sortOrderChanging = (history: RouteComponentProps['history'], newSort: TroveSortOrder): void => {
  // When sort order changes, remove the year because it's only used for date sorting.
  const searchParams = new URLSearchParams(history.location.search)

  if (searchParams.get('sort') !== newSort) {
    searchParams.set('sort', newSort)
    searchParams.delete('y')

    history.push({
      ...history.location,
      search: searchParams.toString(),
    })
  }
}

export const yearChanging = (history: RouteComponentProps['history'], newYear: number): void => {
  // Year can only ever change as part of date sorting, so just update the year param.
  const searchParams = new URLSearchParams(history.location.search)
  searchParams.set('y', `${newYear}`)
  history.push({
    ...history.location,
    search: searchParams.toString(),
  })
}
