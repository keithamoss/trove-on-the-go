import { SystemState } from './types'

const getCountValue = (state: SystemState): number => state.count.value

export default getCountValue
