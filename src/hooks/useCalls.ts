import { CallContext } from '@providers/call-provider'
import { useContext } from 'react'

// The useAuth hook can be used by components under an AuthProvider to
// access the auth context value.
export const useCalls = () => {
  const auth = useContext(CallContext)
  if (auth == null) {
    throw new Error('useCalls() called outside of a CallsProvider?')
  }
  return auth
}
