import { PublicSyncContext } from '@providers/public-sync-provider'
import { useContext } from 'react'

// The useAuth hook can be used by components under an AuthProvider to
// access the auth context value.
export const usePublicSync = () => {
  const auth = useContext(PublicSyncContext)
  if (auth == null) {
    throw new Error('usePublicSync() called outside of a AuthProvider?')
  }
  return auth
}
