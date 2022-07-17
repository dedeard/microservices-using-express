import { IUser } from '../../types'

export interface IAuthState {
  user: IUser | null
  loading: boolean
  token: string | null
}

export type AuthActionTypes =
  | { type: 'SET_USER'; payload: IUser | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_TOKEN'; payload: string | null }

type AuthReducerType = (
  state: IAuthState,
  action: AuthActionTypes,
) => IAuthState

export const authReducer: AuthReducerType = (
  state: IAuthState,
  action: AuthActionTypes,
) => {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
      }
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      }
    case 'SET_TOKEN':
      return {
        ...state,
        token: action.payload,
      }
    default:
      return state
  }
}
