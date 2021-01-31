import React, { useReducer } from 'react'
import fetchTrovePhotoDates from '../../api/actions/fetchTrovePhotoDates'
import { TroveAPIDateResponseRecords } from '../../api/types'

type TroveRequest = {
  searchTerm: string
}

type State = {
  isLoading: boolean
  isError: boolean
  request: TroveRequest | null
  response: TroveAPIDateResponseRecords | null
}

type Action =
  | { type: 'FETCH_INIT'; payload: TroveRequest }
  | {
      type: 'FETCH_SUCCESS'
      payload: {
        searchTerm: string
        data: TroveAPIDateResponseRecords
      }
    }
  | { type: 'FETCH_FAILURE'; payload: Error }
  | { type: 'RESET'; payload: TroveRequest }

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
        response: action.payload.data,
      }
    }
    case 'FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true,
      }
    case 'RESET':
      return {
        ...state,
        request: action.payload,
        response: null,
      }
    default:
      throw new Error()
  }
}

const useTroveDateAPI = (
  searchTerm: string
): {
  state: State
} => {
  const [state, dispatch] = useReducer<React.Reducer<State, Action>>(reducer, {
    isLoading: false,
    isError: false,
    request: {
      searchTerm,
    },
    response: null,
  })
  React.useEffect(() => {
    let didCancel = false

    const fetchData = async () => {
      if (state.request !== null && state.request.searchTerm !== '') {
        dispatch({ type: 'FETCH_INIT', payload: state.request })
        try {
          const result = await fetchTrovePhotoDates(state.request)

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

  // Clear out stored results when the search term changes
  React.useEffect(() => {
    if (state.request !== null && searchTerm !== state.request.searchTerm) {
      dispatch({
        type: 'RESET',
        payload: {
          searchTerm,
        },
      })
    }
  }, [searchTerm, state.request])

  return { state }
}

export default useTroveDateAPI
