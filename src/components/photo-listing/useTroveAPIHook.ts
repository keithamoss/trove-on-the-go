import React, { useReducer } from 'react'
import { fetchTrovePhotos } from '../../api/actions'
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
  action: Action
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
        response: {
          searchTerm: action.payload.searchTerm,
          nextPageToken: action.payload.data.nextPageToken,
          photos: deduplicateArrayOfObjects(
            [
              ...(state.response !== null ? state.response.photos : []),
              ...action.payload.data.work,
            ],
            'id'
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
        request: action.payload,
        response: null,
      }
    default:
      throw new Error()
  }
}

export const useTroveAPI = (
  searchTerm: string
): {
  state: State
  getNextPage: () => void
} => {
  const [state, dispatch] = useReducer<React.Reducer<State, Action>>(reducer, {
    isLoading: false,
    isError: false,
    hasMoreResults: false,
    request: {
      searchTerm,
      nextPageToken: null,
    },
    response: null,
  })

  const getNextPage = () => {
    dispatch({ type: 'FETCH_NEXT_PAGE' })
  }

  React.useEffect(() => {
    const fetchData = async () => {
      if (state.request !== null && state.request.searchTerm !== '') {
        dispatch({ type: 'FETCH_INIT', payload: state.request })
        try {
          const result = await fetchTrovePhotos(state.request)

          dispatch({
            type: 'FETCH_SUCCESS',
            payload: { searchTerm: state.request.searchTerm, data: result },
          })
        } catch (error) {
          dispatch({ type: 'FETCH_FAILURE', payload: error })
        }
      }
    }
    fetchData()
  }, [state.request])

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
