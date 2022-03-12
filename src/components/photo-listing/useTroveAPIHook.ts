import React, { useReducer } from 'react'
import { useHistory } from 'react-router-dom'
import fetchTrovePhotos from '../../api/actions'
import { TroveAPIResponseRecords, TroveSortOrder, TroveWork } from '../../api/types'
import { deduplicateArrayOfObjects } from '../../shared/utils'

type TroveRequest = {
  searchTerm: string
  searchYear: number | null
  sortOrder: TroveSortOrder
  nextPageToken: string | null
  isWarmUpRequest: boolean
}

type TroveResponse = {
  searchTerm: string
  searchYear: number | null
  sortOrder: TroveSortOrder
  nextPageToken: string | null
  photos: TroveWork[]
}

type State = {
  isLoading: boolean
  isError: boolean
  hasMoreResults: boolean
  hasWarmedUp: boolean
  pagesFetched: number
  pagesToFetch: number
  request: TroveRequest | null
  response: TroveResponse | null
}

type Action =
  | { type: 'FETCH_INIT'; payload: TroveRequest }
  | {
      type: 'FETCH_SUCCESS'
      payload: {
        searchTerm: string
        searchYear: number | null
        sortOrder: TroveSortOrder
        data: TroveAPIResponseRecords
      }
    }
  | { type: 'FETCH_WARM_UP_SUCCESS' }
  | { type: 'FETCH_FAILURE'; payload: Error }
  | { type: 'FETCH_NEXT_PAGE'; payload?: { isWarmUp: boolean } }
  | { type: 'RESET'; payload: { request: TroveRequest; page: string | undefined } }

const reducer: React.Reducer<State, Action> = (state: State, action: Action) => {
  switch (action.type) {
    case 'FETCH_INIT':
      return {
        ...state,
        request: action.payload,
        isLoading: true,
        isError: false,
      }
    case 'FETCH_SUCCESS': {
      return {
        ...state,
        isLoading: false,
        isError: false,
        hasMoreResults: action.payload.data.nextPageToken !== null,
        hasWarmedUp: false,
        pagesFetched: state.pagesFetched + 1,
        response: {
          searchTerm: action.payload.searchTerm,
          searchYear: action.payload.searchYear,
          sortOrder: action.payload.sortOrder,
          nextPageToken: action.payload.data.nextPageToken,
          photos: deduplicateArrayOfObjects(
            [...(state.response !== null ? state.response.photos : []), ...action.payload.data.work],
            'id'
          ) as TroveWork[],
        },
      }
    }
    case 'FETCH_WARM_UP_SUCCESS': {
      return {
        ...state,
        isLoading: false,
        isError: false,
        hasWarmedUp: true,
      }
    }
    case 'FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true,
      }
    case 'FETCH_NEXT_PAGE':
      return {
        ...state,
        request:
          state.response !== null && state.response.nextPageToken !== null
            ? {
                searchTerm: state.response.searchTerm,
                searchYear: state.response.searchYear,
                sortOrder: state.response.sortOrder,
                nextPageToken: state.response.nextPageToken,
                isWarmUpRequest: action?.payload?.isWarmUp || false,
              }
            : state.request,
      }
    case 'RESET':
      return {
        ...state,
        hasMoreResults: false,
        hasWarmedUp: false,
        pagesFetched: 0,
        pagesToFetch:
          action.payload.page !== undefined && isNaN(Number.parseInt(action.payload.page, 10)) === false
            ? parseInt(action.payload.page, 10)
            : 1,
        request: action.payload.request,
        response: null,
      }
    default:
      throw new Error()
  }
}

const useTroveAPI = (
  searchTerm: string,
  searchYear: number | null,
  sortOrder: TroveSortOrder,
  page: string | undefined
): {
  state: State
  getNextPage: () => void
} => {
  const [state, dispatch] = useReducer<React.Reducer<State, Action>>(reducer, {
    isLoading: false,
    isError: false,
    hasMoreResults: false,
    hasWarmedUp: false,
    pagesFetched: 0,
    pagesToFetch: page !== undefined && isNaN(parseInt(page, 10)) === false ? parseInt(page, 10) : 1,
    request: {
      searchTerm,
      searchYear,
      sortOrder,
      nextPageToken: null,
      isWarmUpRequest: false,
    },
    response: null,
  })
  const history = useHistory()

  const getNextPage = () => {
    dispatch({ type: 'FETCH_NEXT_PAGE' })

    history.push({
      pathname: `/${searchTerm}/${state.pagesFetched + 1}`,
      search: history.location.search,
    })
  }

  React.useEffect(() => {
    let didCancel = false

    const fetchData = async () => {
      if (state.request !== null && state.request.searchTerm !== '') {
        dispatch({ type: 'FETCH_INIT', payload: state.request })
        try {
          const result = await fetchTrovePhotos(state.request)

          if (state.request.isWarmUpRequest === true) {
            dispatch({ type: 'FETCH_WARM_UP_SUCCESS' })
            return
          }

          if (didCancel === false) {
            dispatch({
              type: 'FETCH_SUCCESS',
              payload: {
                searchTerm: state.request.searchTerm,
                searchYear: state.request.searchYear,
                sortOrder: state.request.sortOrder,
                data: result,
              },
            })
          }
        } catch (error: unknown) {
          if (didCancel === false) {
            dispatch({ type: 'FETCH_FAILURE', payload: error as Error })
          }
        }
      }
    }

    fetchData()

    return () => {
      didCancel = true
    }
  }, [state.request])

  // Warm up the next page of results
  React.useEffect(() => {
    if (state.isLoading === false && state.hasMoreResults === true && state.hasWarmedUp === false) {
      dispatch({ type: 'FETCH_NEXT_PAGE', payload: { isWarmUp: true } })
    }
  }, [state.isLoading, state.hasMoreResults, state.hasWarmedUp])

  // Keep going until we fulfill our page requirement
  React.useEffect(() => {
    if (state.isLoading === false && state.hasMoreResults === true) {
      if (state.pagesFetched < state.pagesToFetch) {
        dispatch({ type: 'FETCH_NEXT_PAGE' })
      }
    }
  }, [state.isLoading, state.hasMoreResults, state.pagesFetched, state.pagesToFetch])

  // Clear out stored results when the search term changes
  React.useEffect(() => {
    if (
      state.request !== null &&
      (searchTerm !== state.request.searchTerm ||
        searchYear !== state.request.searchYear ||
        sortOrder !== state.request.sortOrder)
    ) {
      dispatch({
        type: 'RESET',
        payload: {
          request: {
            searchTerm,
            searchYear,
            sortOrder,
            nextPageToken: null,
            isWarmUpRequest: false,
          },
          page,
        },
      })
    }
  }, [searchTerm, searchYear, sortOrder, page, state.request])

  return { state, getNextPage }
}

export default useTroveAPI
