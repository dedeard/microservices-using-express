import React from 'react'
import api from '../../services/api.service'
import { getRefreshToken } from '../../services/token.service'
import { AuthActionTypes, authReducer, IAuthState } from './reducer'

const initialState: IAuthState = {
  user: null,
  token: null,
  loading: true,
}

const AuthContext = React.createContext<{
  state: IAuthState
  dispatch: React.Dispatch<AuthActionTypes>
}>({
  state: initialState,
  dispatch: () => {},
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = React.useReducer(authReducer, initialState)

  React.useEffect(() => {
    const refreshAccessToken = async () => {
      const refreshToken = getRefreshToken()
      if (!refreshToken) return
      try {
        const { bearer } = await api().refreshAccessToken({ refreshToken })
        dispatch({ type: 'SET_TOKEN', payload: bearer })
        return bearer
      } catch (e) {
        console.error(e)
      }
    }

    const checkAuth = async () => {
      const bearer = await refreshAccessToken()
      if (bearer) {
        try {
          const user = await api(bearer).getProfile()
          dispatch({ type: 'SET_USER', payload: user })
        } catch (e: any) {
          dispatch({ type: 'SET_TOKEN', payload: null })
          dispatch({ type: 'SET_USER', payload: null })
        }
      }
      dispatch({ type: 'SET_LOADING', payload: false })
    }

    setInterval(() => refreshAccessToken(), 10 * 60 * 1000)
    checkAuth()
  }, [])

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return React.useContext(AuthContext)
}
