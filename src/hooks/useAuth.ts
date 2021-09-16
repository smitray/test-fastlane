import { AuthContext } from '@providers/auth-provider'
import { useContext } from 'react'

// The useAuth hook can be used by components under an AuthProvider to
// access the auth context value.
export const useAuth = () => {
  const auth = useContext(AuthContext)
  if (auth == null) {
    throw new Error('useAuth() called outside of a AuthProvider?')
  }
  return auth
}
