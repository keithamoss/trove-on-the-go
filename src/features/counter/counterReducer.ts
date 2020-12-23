import { DECREMENT_COUNTER, INCREMENT_COUNTER } from './actionTypes'
import { CounterActionTypes, CounterState } from './types'

const initialState = {
  value: 0,
}

const reducer = (state = initialState, action: CounterActionTypes): CounterState => {
  switch (action.type) {
    case INCREMENT_COUNTER:
      return { ...state, value: state.value + 1 }
    case DECREMENT_COUNTER:
      return { ...state, value: state.value - 1 }
    default:
      return state
  }
}

export default reducer
