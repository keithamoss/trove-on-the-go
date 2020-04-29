import React, { useReducer } from 'react'
import { useHistory } from 'react-router-dom'
import fetchTrovePhotos from '../../api/actions'
import { TroveAPIResponseRecords, TroveWork } from '../../api/types'
import { deduplicateArrayOfObjects } from '../../shared/utils'

type TroveRequest = {
  searchTerm: string
  nextPageToken: string | null
}

type TroveResponse = {
  searchTerm: string
  nextPageToken: string | null
  photos: TroveWork[]
}

type State = {
  isLoading: boolean
  isError: boolean
  hasMoreResults: boolean
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
        data: TroveAPIResponseRecords
      }
    }
  | { type: 'FETCH_FAILURE'; payload: Error }
  | { type: 'FETCH_NEXT_PAGE' }
  | { type: 'RESET'; payload: TroveRequest }

const reducer: React.Reducer<State, Action> = (
  state: State,
  action: Action,
) => {
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
        pagesFetched: state.pagesFetched + 1,
        response: {
          searchTerm: action.payload.searchTerm,
          nextPageToken: action.payload.data.nextPageToken,
          photos: deduplicateArrayOfObjects(
            [
              ...(state.response !== null ? state.response.photos : []),
              ...action.payload.data.work,
            ],
            'id',
          ) as TroveWork[],
        },
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
                nextPageToken: state.response.nextPageToken,
              }
            : state.request,
      }
    case 'RESET':
      return {
        ...state,
        hasMoreResults: false,
        pagesFetched: 0,
        pagesToFetch: 1,
        request: action.payload,
        response: null,
      }
    default:
      throw new Error()
  }
}

const useTroveAPI = (
  searchTerm: string,
  page: string | undefined,
): {
  state: State
  getNextPage: (
) => void
} => {
  const [state, dispatch] = useReducer<React.Reducer<State, Action>>(reducer, {
    isLoading: false,
    isError: false,
    hasMoreResults: false,
    pagesFetched: 0,
    pagesToFetch: (page !== undefined && isNaN(parseInt(page, 10)) === false) ? parseInt(page, 10) : 1,
    request: {
      searchTerm,
      nextPageToken: null,
    },
    response: null,
  })
  const history = useHistory();

  const getNextPage = () => {
    dispatch({ type: 'FETCH_NEXT_PAGE' })
    history.push(`/${searchTerm}/${state.pagesFetched + 1}`)
  }

  React.useEffect(() => {
    let didCancel = false

    const fetchData = async () => {
      if (state.request !== null && state.request.searchTerm !== '') {
        dispatch({ type: 'FETCH_INIT', payload: state.request })
        try {
          const result = await fetchTrovePhotos(state.request)

          if (didCancel === false) {
            dispatch({
              type: 'FETCH_SUCCESS',
              payload: { searchTerm: state.request.searchTerm, data: result },
            })
          }
        } catch (error) {
          if (didCancel === false) {
            dispatch({ type: 'FETCH_FAILURE', payload: error })
          }
        }
      }
    }

    fetchData()

    return () => {
      didCancel = true
    }
  }, [state.request])

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
    if (state.request !== null && searchTerm !== state.request.searchTerm) {
      dispatch({
        type: 'RESET',
        payload: {
          searchTerm,
          nextPageToken: null,
        },
      })
    }
  }, [searchTerm, state.request])

  return { state, getNextPage }
}

export default useTroveAPI
